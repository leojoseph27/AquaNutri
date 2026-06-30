#!/bin/bash
# =============================================================================
# AQUANUTRI - Docker entrypoint for Hugging Face Spaces
# =============================================================================
# Starts:
#   1. Flask inference API on port 5001 (background)
#   2. Next.js standalone server on port 7860 (foreground, HF Spaces expects this)
# =============================================================================

set -e

echo "================================================"
echo "  AQUANUTRI — starting services"
echo "================================================"
echo "  Working dir: $(pwd)"
echo "  PORT (Next.js): ${PORT:-7860}"
echo "  Flask port: 5001"
echo "  Node: $(node --version 2>/dev/null || echo 'n/a')"
echo "  Python: $(python3 --version)"
echo "================================================"

# ----------------------------------------------------------------------
# 1. Verify model exists; if not, train it (first-run on HF)
# ----------------------------------------------------------------------
MODEL_PATH="/app/ml/models/aquanutri_resnet50.h5"
if [ ! -f "$MODEL_PATH" ]; then
    echo "[entrypoint] Model not found at $MODEL_PATH — training from scratch..."
    cd /app
    python3 scripts/01_generate_dataset.py
    python3 scripts/02_train_resnet50.py
    cd /app
else
    echo "[entrypoint] Model found: $(ls -lh $MODEL_PATH | awk '{print $5}')"
fi

# ----------------------------------------------------------------------
# 2. Start Flask inference service in background
# ----------------------------------------------------------------------
echo "[entrypoint] Starting Flask inference service on port 5001..."
cd /app/mini-services/skin-api
python3 server.py > /tmp/flask.log 2>&1 &
FLASK_PID=$!
echo "[entrypoint] Flask PID: $FLASK_PID"

# Wait for Flask to be ready (max 60s)
echo "[entrypoint] Waiting for Flask to be ready..."
for i in $(seq 1 60); do
    if curl -fs http://localhost:5001/health > /dev/null 2>&1; then
        echo "[entrypoint] Flask is ready (after ${i}s)"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "[entrypoint] WARNING: Flask did not become ready in 60s"
        echo "[entrypoint] Last 20 lines of Flask log:"
        tail -20 /tmp/flask.log
    fi
    sleep 1
done

# ----------------------------------------------------------------------
# 3. Start Next.js standalone server in foreground (HF Spaces expects 7860)
# ----------------------------------------------------------------------
cd /app
export PORT=${PORT:-7860}
export HOSTNAME=0.0.0.0
echo "[entrypoint] Starting Next.js on port $PORT..."
echo "[entrypoint] Tip: Tail of /tmp/flask.log to monitor Flask"
exec node server.js
