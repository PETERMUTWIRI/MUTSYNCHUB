"""
app/db.py – ENTERPRISE-GRADE, MULTI-TENANT DUCKDB LAYER
=======================================================
Handles per-tenant database isolation, schema versioning, quota enforcement,
and bulletproof data insertion with automatic column inference.

Architecture:
- One DuckDB file per org_id: ./data/duckdb/{org_id}.duckdb
- Three-tier table structure:
  1. main.raw_rows – Immutable audit trail
  2. main.{entity}_canonical – Versioned canonical schema
  3. main.schema_versions – Schema evolution history
"""

import os
import pathlib
import json
import duckdb
import pandas as pd  # ✅ CRITICAL: For type hints and DataFrame handling
from typing import Any, Dict, List, Optional
from datetime import datetime
from contextlib import contextmanager
from fastapi import HTTPException 

# ==================== CONFIGURATION ==================== #
DB_DIR = pathlib.Path("./data/duckdb")
DB_DIR.mkdir(parents=True, exist_ok=True)

# Per-tenant storage quota (GB) - prevents disk exhaustion
MAX_DB_SIZE_GB = float(os.getenv("MAX_DB_SIZE_GB", "10.0"))

# Minimum canonical columns required for analytics contracts
REQUIRED_CANONICAL_COLUMNS = {"timestamp"}


# ==================== CONNECTION MANAGEMENT ==================== #
def get_conn(org_id: str) -> duckdb.DuckDBPyConnection:
    """
    Get or create a DuckDB connection for an organization.
    
    Creates isolated DB file: ./data/duckdb/{org_id}.duckdb
    
    Args:
        org_id: Unique tenant identifier (validated upstream)
        
    Returns:
        DuckDB connection in read-write mode
        
    Raises:
        HTTPException: If tenant exceeds storage quota
    """
    db_file = DB_DIR / f"{org_id}.duckdb"
    
    # Quota guardrail: prevent disk exhaustion by rogue tenants
    if db_file.exists():
        size_gb = db_file.stat().st_size / (1024 ** 3)
        if size_gb > MAX_DB_SIZE_GB:
            raise HTTPException(
                status_code=413,
                detail=f"Tenant quota exceeded: {size_gb:.2f}GB > {MAX_DB_SIZE_GB}GB"
            )
    
    return duckdb.connect(str(db_file), read_only=False)


@contextmanager
def transactional_conn(org_id: str):
    """
    Context manager for transactional operations.
    Automatically commits on success, rolls back on failure.
    
    Usage:
        with transactional_conn("org_123") as conn:
            conn.execute("INSERT ...")
            conn.execute("UPDATE ...")
    """
    conn = get_conn(org_id)
    conn.execute("BEGIN TRANSACTION")
    try:
        yield conn
        conn.execute("COMMIT")
    except Exception:
        conn.execute("ROLLBACK")
        raise
    finally:
        conn.close()


# ==================== SCHEMA EVOLUTION ==================== #
def ensure_raw_table(conn: duckdb.DuckDBPyConnection):
    """
    Creates immutable audit trail table for raw JSON payloads.
    Schema is intentionally rigid to prevent mutation.
    
    Table: main.raw_rows
        - ingested_at: Auto-timestamp of ingestion
        - row_data: Raw JSON payload (never modified)
    """
    conn.execute("CREATE SCHEMA IF NOT EXISTS main")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS main.raw_rows(
            ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            row_data    JSON
        )
    """)


def ensure_schema_versions_table(conn: duckdb.DuckDBPyConnection):
    """
    Tracks schema evolution for each entity table.
    Compatible with DuckDB 0.10.3 constraint limitations.
    """
    conn.execute("CREATE SCHEMA IF NOT EXISTS main")
    # Use legacy SERIAL syntax instead of IDENTITY
    conn.execute("""
        CREATE TABLE IF NOT EXISTS main.schema_versions (
            version_id BIGINT PRIMARY KEY,
            table_name VARCHAR NOT NULL,
            schema_json JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            applied_at TIMESTAMP,
            status VARCHAR DEFAULT 'pending',
            rows_at_migration BIGINT
        )
    """)
    
    # Create sequence if it doesn't exist (for manual auto-increment)
    conn.execute("""
        CREATE SEQUENCE IF NOT EXISTS schema_version_seq 
        START WITH 1 
        INCREMENT BY 1
    """)

def infer_duckdb_type(value: Any) -> str:
    """
    Infer DuckDB column type from Python value.
    Falls back to VARCHAR for ambiguous types.
    
    Type mapping:
        bool → BOOLEAN
        int → BIGINT
        float → DOUBLE
        datetime → TIMESTAMP
        dict/list → JSON (but stored as VARCHAR for flexibility)
        None/null → VARCHAR (skip column creation)
    """
    if isinstance(value, bool):
        return "BOOLEAN"
    if isinstance(value, int):
        return "BIGINT"
    if isinstance(value, float):
        return "DOUBLE"
    if isinstance(value, datetime):
        return "TIMESTAMP"
    return "VARCHAR"


def ensure_table(
    conn: duckdb.DuckDBPyConnection, 
    table_name: str, 
    sample_record: Dict[str, Any]
) -> List[str]:
    """
    Ensures table exists and evolves schema using sample_record.
    
    Creates base table with UUID + timestamp, then adds missing columns.
    
    Args:
        conn: DuckDB connection
        table_name: Target table name (e.g., 'sales_canonical')
        sample_record: Representative row to infer schema
        
    Returns:
        List of newly added column names (for logging)
        
    Raises:
        ValueError: If sample_record is empty
    """
    if not sample_record:
        raise ValueError("Cannot infer schema from empty sample_record")
    
    conn.execute("CREATE SCHEMA IF NOT EXISTS main")
    
    # Create base table if missing
    conn.execute(
        f"CREATE TABLE IF NOT EXISTS main.{table_name} ("
        "id UUID DEFAULT uuid(), "
        "_ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    )

    # Get existing columns (lowercase for comparison)
    try:
        existing_cols_raw = conn.execute(f"PRAGMA table_info('main.{table_name}')").fetchall()
        existing_cols = {str(r[0]).lower() for r in existing_cols_raw}
    except Exception as e:
        print(f"[db] ⚠️ Could not get table info: {e}")
        existing_cols = set()

    # Add missing columns
    added_cols = []
    for col, val in sample_record.items():
        col_name = str(col).lower().strip()
        
        if col_name in existing_cols:
            continue
            
        if val is None:
            print(f"[db] ⚠️ Skipping column {col_name} (None value)")
            continue
        
        try:
            dtype = infer_duckdb_type(val)
            conn.execute(f"ALTER TABLE main.{table_name} ADD COLUMN {col_name} {dtype}")
            added_cols.append(f"{col_name}:{dtype}")
            print(f"[db] ➕ Added column '{col_name}:{dtype}' to main.{table_name}")
        except Exception as e:
            print(f"[db] ❌ Failed to add column {col_name}: {e}")
            # Continue with next column—never crash pipeline
    
    return added_cols


def enforce_schema_contract(df: pd.DataFrame, org_id: str):
    """Soft enforcement - logs warnings but doesn't crash"""
    missing = REQUIRED_CANONICAL_COLUMNS - set(df.columns)
    if missing:
        print(f"[schema_contract] ⚠️ Org {org_id} missing recommended columns: {missing}")

def insert_records(
    conn: duckdb.DuckDBPyConnection, 
    table_name: str, 
    records: List[Dict[str, Any]]
):
    """
    Insert records with safe column handling and automatic type conversion.
    
    Handles:
    - Missing keys → NULL
    - Extra keys → Ignored (not inserted)
    - dict/list values → JSON string
    - Column order mismatch → Reordered to table schema
    
    Args:
        conn: DuckDB connection
        table_name: Target table name
        records: List of dicts to insert
        
    Raises:
        HTTPException: On insertion failure (after logging)
    """
    if not records:
        return
    
    # Get dynamic table schema (columns might have evolved)
    table_info = conn.execute(f"PRAGMA table_info('main.{table_name}')").fetchall()
    table_cols = [str(r[0]) for r in table_info]
    
    if not table_cols:
        raise ValueError(f"Table main.{table_name} has no columns")
    
    # Build INSERT statement using table's actual column order
    placeholders = ", ".join(["?"] * len(table_cols))
    col_list = ", ".join(table_cols)
    insert_sql = f"INSERT INTO main.{table_name} ({col_list}) VALUES ({placeholders})"
    
    # Prepare values, matching table column order exactly
    values = []
    for record in records:
        row = []
        for col in table_cols:
            val = record.get(col)
            if isinstance(val, (dict, list)):
                val = json.dumps(val)
            row.append(val)
        values.append(tuple(row))
    
    try:
        conn.executemany(insert_sql, values)
        print(f"[db] ✅ Inserted {len(records)} rows into main.{table_name}")
    except Exception as e:
        print(f"[db] ❌ Insert failed: {e}")
        raise HTTPException(status_code=500, detail=f"Insertion failed: {str(e)}")


def bootstrap(org_id: str, payload: Dict[str, Any]):
    """
    **ENTERPRISE-GRADE**: Stores raw JSON payload for audit and disaster recovery.
    
    This is the ONLY function that writes to raw_rows. It intentionally does NOT
    create any derived tables to maintain separation of concerns.
    
    Args:
        org_id: Tenant identifier
        payload: Raw JSON payload (dict, list, or string)
        
    Side Effects:
        - Creates org DB if missing
        - Writes to main.raw_rows
        - Closes connection
        
    Raises:
        HTTPException: On audit failure (after logging)
    """
    conn = get_conn(org_id)
    ensure_raw_table(conn)
    
    try:
        raw_json = json.dumps(payload) if not isinstance(payload, str) else payload
        
        # Validate non-empty payload
        if raw_json and raw_json not in ("null", "[]", "{}"):
            conn.execute(
                "INSERT INTO main.raw_rows (row_data) VALUES (?)", 
                (raw_json,)
            )
            conn.commit()  # Explicit commit for audit trail
            print(f"[bootstrap] ✅ Audit stored: {len(raw_json)} bytes for org:{org_id}")
        else:
            print(f"[bootstrap] ⚠️ Empty payload for org:{org_id}")
    except Exception as e:
        print(f"[bootstrap] ❌ Audit failed for org:{org_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Audit trail failed: {str(e)}")
    finally:
        conn.close()


def get_db_stats(org_id: str) -> Dict[str, Any]:
    """
    Retrieve storage and row count statistics for a tenant.
    
    Returns:
        dict: {
            "db_size_gb": float,
            "total_rows": int,
            "table_counts": {"raw_rows": int, "sales_canonical": int, ...}
        }
    """
    conn = get_conn(org_id)
    stats = {}
    
    try:
        # DB size
        db_file = DB_DIR / f"{org_id}.duckdb"
        stats["db_size_gb"] = db_file.stat().st_size / (1024 ** 3) if db_file.exists() else 0
        
        # Table row counts
        tables = conn.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'main'
        """).fetchall()
        
        stats["table_counts"] = {}
        for (table_name,) in tables:
            count = conn.execute(f"SELECT COUNT(*) FROM main.{table_name}").fetchone()[0]
            stats["table_counts"][table_name] = count
        
        stats["total_rows"] = sum(stats["table_counts"].values())
        
    finally:
        conn.close()
    
    return stats