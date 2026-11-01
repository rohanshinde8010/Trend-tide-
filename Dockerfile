# ==========================================
# Stage 1: Build the React + Vite Frontend
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Python Production Runtime
# ==========================================
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5001 \
    APP_ENV=production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Nodemailer runs in the Python service through the SMTP adapter.
COPY --from=frontend-builder /usr/local/bin/node /usr/local/bin/node
COPY --from=frontend-builder /app/client/node_modules/nodemailer ./client/node_modules/nodemailer

# Copy backend application code
COPY database/ ./database/
COPY server/ ./server/
COPY trend_engine/ ./trend_engine/
COPY client/send-email.mjs ./client/send-email.mjs
COPY run_server.py ./

# Copy compiled frontend build from Stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

# Ensure database directory exists
RUN mkdir -p /app/database

# Expose port and healthcheck
EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Start production WSGI server
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "--threads", "4", "--timeout", "120", "server.app:app"]
