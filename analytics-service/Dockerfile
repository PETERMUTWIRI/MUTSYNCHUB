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
    && rm -rf /var/lib/apt/lists/*

# ---- 3. upgrade pip & enable pre-built wheels ------------------------------
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ---- 4. install **all** Python deps in one layer ---------------------------
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r /tmp/requirements.txt

# ---- 5. copy source last (cheap rebuild when code changes) -----------------
COPY . /app
WORKDIR /app

# ---- 6. runtime env vars ---------------------------------------------------
ENV API_KEYS=dev-analytics-key-123

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]