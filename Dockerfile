# =============================================================================
# AQUANUTRI - Hugging Face Spaces Dockerfile
# =============================================================================
# Runs two services in one container:
#   1. Flask inference API on port 5001 (TensorFlow + ResNet50)
#   2. Next.js standalone server on port 7860 (HF Spaces expected port)
# A bash supervisor starts both and proxies /api/predict from Next.js to Flask.
#
# HF Spaces free CPU basic tier: 16GB RAM, 2 vCPUs — enough for this stack.
# =============================================================================

# ---------- Stage 1: build Next.js ----------
FROM node:20-slim AS frontend-builder
WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy lockfile + package.json first for cache
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---------- Stage 2: runtime ----------
FROM python:3.12-slim AS runtime

# Install Node.js runtime (for Next.js standalone server)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        nodejs \
        npm \
    && rm -rf /var/lib/apt/lists/*

# Install bun (for running mini-services if needed)
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

WORKDIR /app

# Install Python deps for inference service
COPY mini-services/skin-api/requirements.txt ./requirements.txt 2>/dev/null || \
    echo "tensorflow-cpu==2.21.0\nflask\nflask-cors\npillow\nnumpy\npandas" > requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy trained model + data
COPY ml/ ./ml/

# Copy Flask inference service
COPY mini-services/skin-api/ ./mini-services/skin-api/

# Copy Next.js standalone build output
COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./.next/static
COPY --from=frontend-builder /app/public ./public

# Copy package.json (for any runtime deps + scripts)
COPY package.json ./

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# HF Spaces expects port 7860
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

# Healthcheck: hit the Next.js API probe which pings Flask
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -fs http://localhost:7860/api/predict || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
