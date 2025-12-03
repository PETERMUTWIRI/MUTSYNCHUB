# ---- 1. base image ---------------------------------------------------------
FROM python:3.11-slim

# ---- 2. system dependencies for binary wheels ------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        cmake \
        libgomp1 \
        libstdc++6 \
        ca-certificates \
        wget \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# ---- 3. upgrade pip & enable pre-built wheels ------------------------------
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ---- 4. install Python deps (+ DuckDB driver) ------------------------------
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r /tmp/requirements.txt && \
    pip install --no-cache-dir "duckdb>=1.0.0"

# ---- 4b. install CPU-only PyTorch (minimal addition) -----------------------
RUN pip install --no-cache-dir torch==2.2.2 --index-url https://download.pytorch.org/whl/cpu

# ---- 5. Pre-download VSS extension (matches DuckDB v1.0.0) ---------------
RUN mkdir -p /root/.duckdb/extensions/v1.0.0/linux_amd64 && \
    wget -q https://extensions.duckdb.org/v1.0.0/linux_amd64/vss.duckdb_extension.gz \
         -O /root/.duckdb/extensions/v1.0.0/linux_amd64/vss.duckdb_extension.gz && \
    gunzip /root/.duckdb/extensions/v1.0.0/linux_amd64/vss.duckdb_extension.gz

# ---- 6. copy source --------------------------------------------------------
COPY . /app
WORKDIR /app

# ---- 7. scheduler loop ----------------------------------------------------
COPY scheduler_loop.py /app/scheduler_loop.py

# ---- 8. start both services -----------------------------------------------
CMD sh -c "python -m uvicorn app.main:app --host 0.0.0.0 --port 7860 & python /app/scheduler_loop.py"