# The Arcane Codex - Production Dockerfile
# Multi-stage build for optimized container size

# Stage 1: Builder
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 arcane && \
    mkdir -p /app /app/logs /app/data && \
    chown -R arcane:arcane /app

# Set working directory
WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /home/arcane/.local

# Copy application code
COPY --chown=arcane:arcane . .

# Set environment variables
ENV PATH=/home/arcane/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5000 \
    HOST=0.0.0.0

# Switch to non-root user
USER arcane

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health/live')" || exit 1

# Run the application
CMD ["python", "app_production.py"]
