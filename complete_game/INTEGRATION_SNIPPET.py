"""
Integration snippet for web_game.py
Add this code to integrate production deployment infrastructure
"""

# Add these imports at the top of web_game.py
import os
from health_endpoint import register_health_endpoints
from production_logging import setup_production_logging, setup_request_logging

# After creating the Flask app (after: app = Flask(__name__))
# Add this code:

# ============================================================================
# PRODUCTION DEPLOYMENT INTEGRATION
# ============================================================================

# 1. Setup production logging
if os.getenv('FLASK_ENV') == 'production':
    setup_production_logging(app)
    setup_request_logging(app)

# 2. Register health and metrics endpoints
# Pass game_sessions dictionary if you have one for metrics
register_health_endpoints(app, game_sessions=game_sessions)

# That's it! Now you have:
# - /health endpoint for basic health checks
# - /health/ready for Kubernetes readiness probes
# - /health/live for Kubernetes liveness probes
# - /metrics endpoint for JSON metrics
# - /metrics/prometheus for Prometheus-compatible metrics
# - Production logging with JSON format and rotation
# - Request/response logging

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

# Check application health:
# curl http://localhost:5000/health

# Get detailed metrics:
# curl http://localhost:5000/metrics

# Get Prometheus metrics:
# curl http://localhost:5000/metrics/prometheus

# View logs:
# tail -f /var/log/arcane-codex/app.log

# ============================================================================
# COMPLETE EXAMPLE
# ============================================================================

"""
import os
from flask import Flask
from health_endpoint import register_health_endpoints
from production_logging import setup_production_logging, setup_request_logging

# Create Flask app
app = Flask(__name__)

# Load configuration
app.config.from_envvar('CONFIG_FILE')

# Initialize game sessions dictionary
game_sessions = {}

# Setup production features
if os.getenv('FLASK_ENV') == 'production':
    setup_production_logging(app)
    setup_request_logging(app)

# Register health endpoints
register_health_endpoints(app, game_sessions=game_sessions)

# Your existing routes...
@app.route('/')
def index():
    return render_template('index.html')

# ... rest of your application code
"""

# ============================================================================
# ENVIRONMENT VARIABLE CONFIGURATION
# ============================================================================

"""
Required environment variables (set in .env.production):

FLASK_ENV=production
LOG_LEVEL=INFO
LOG_FILE=/var/log/arcane-codex/app.log
DB_PATH=/var/lib/arcane-codex/arcane_codex.db

Optional for monitoring:
MONITOR_SERVICE_URL=http://localhost:5000
SMTP_ENABLED=true
ADMIN_EMAIL=admin@your-domain.com
"""

# ============================================================================
# TESTING
# ============================================================================

"""
Test the integration locally:

1. Start the application:
   python web_game.py

2. Test health endpoint:
   curl http://localhost:5000/health

   Expected response:
   {
     "status": "healthy",
     "timestamp": "2025-11-16T10:30:00Z",
     "service": "arcane-codex",
     "version": "1.0.0",
     "database": {
       "status": "healthy",
       "table_count": 5,
       "integrity": "ok"
     }
   }

3. Test metrics endpoint:
   curl http://localhost:5000/metrics

   Expected response includes:
   {
     "timestamp": "2025-11-16T10:30:00Z",
     "service": "arcane-codex",
     "uptime_seconds": 123,
     "database": {...},
     "system": {
       "cpu": {...},
       "memory": {...},
       "disk": {...}
     },
     "game": {
       "active_sessions": 0,
       "total_players": 0
     }
   }

4. Check logs:
   tail -f /var/log/arcane-codex/app.log

   Expected format (JSON):
   {"timestamp": "2025-11-16T10:30:00Z", "level": "INFO", ...}
"""
