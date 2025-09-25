from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel, Field
import os

DATABASE_URL = os.getenv("DATABASE_URL").replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

router = APIRouter(prefix="/flags", tags=["Feature Flags"])

class FlagOut(BaseModel):
    key: str
    enabled: bool
    payload: dict | None = None

class FlagIn(BaseModel):
    enabled: bool
    payload: dict | None = None

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session

@router.get("/{key}", response_model=FlagOut)
async def read_flag(key: str, session: AsyncSession = Depends(get_session)):
    row = await session.execute(
        "SELECT enabled, payload FROM feature_flags WHERE key = :key", {"key": key}
    )
    row = row.first()
    if not row:
        raise HTTPException(404, "Flag not found")
    return {"key": key, "enabled": row.enabled, "payload": row.payload}

@router.post("/{key}", response_model=FlagOut)
async def set_flag(
    key: str,
    body: FlagIn,
    session: AsyncSession = Depends(get_session),
):
    await session.execute(
        """
        INSERT INTO feature_flags (key, enabled, payload)
        VALUES (:key, :enabled, :payload)
        ON CONFLICT (key) DO UPDATE
        SET enabled = :enabled, payload = :payload
        """,
        {"key": key, "enabled": body.enabled, "payload": body.payload},
    )
    await session.commit()
    return {"key": key, "enabled": body.enabled, "payload": body.payload}

@router.get("/", response_model=list[FlagOut])
async def list_flags(session: AsyncSession = Depends(get_session)):
    rows = await session.execute("SELECT key, enabled, payload FROM feature_flags")
    return [FlagOut(key=r.key, enabled=r.enabled, payload=r.payload) for r in rows]