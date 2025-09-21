# ---- 1. base image ---------------------------------------------------------
FROM python:3.11-slim

# ---- 2. system dependencies for Prophet + scikit-learn + scipy -------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        cmake \
        libgomp1 \
        libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# ---- 3. Python-level build helper (makes sure wheels build cleanly) --------
RUN pip install --upgrade pip setuptools wheel

# ---- 4. install Python deps -------------------------------------------------
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# ---- 5. your app ------------------------------------------------------------
COPY . /app
WORKDIR /app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]