"""
Gunicorn configuration file for The Arcane Codex production deployment
"""
import os
import multiprocessing

# Server socket
bind = f"{os.getenv('HOST', '0.0.0.0')}:{os.getenv('PORT', '5000')}"
backlog = 2048

# Worker processes
workers = int(os.getenv('WORKERS', multiprocessing.cpu_count() * 2 + 1))
worker_class = os.getenv('WORKER_CLASS', 'eventlet')
worker_connections = int(os.getenv('WORKER_CONNECTIONS', 1000))
max_requests = int(os.getenv('MAX_REQUESTS', 1000))
max_requests_jitter = int(os.getenv('MAX_REQUESTS_JITTER', 100))
timeout = int(os.getenv('TIMEOUT', 120))
keepalive = int(os.getenv('KEEPALIVE', 5))

# Logging
accesslog = os.getenv('ACCESS_LOG', '/var/log/arcane-codex/access.log')
errorlog = os.getenv('ERROR_LOG', '/var/log/arcane-codex/error.log')
loglevel = os.getenv('LOG_LEVEL', 'info').lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = os.getenv('APP_NAME', 'arcane-codex')

# Server mechanics
daemon = False
pidfile = '/var/run/arcane-codex/gunicorn.pid'
user = os.getenv('APP_USER', 'www-data')
group = os.getenv('APP_GROUP', 'www-data')
umask = 0o007

# SSL (if enabled)
if os.getenv('SSL_ENABLED', 'false').lower() == 'true':
    keyfile = os.getenv('SSL_KEY_PATH', '/etc/ssl/private/arcane-codex.key')
    certfile = os.getenv('SSL_CERT_PATH', '/etc/ssl/certs/arcane-codex.crt')

# Server hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    print("Starting Gunicorn server...")

def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    print("Reloading Gunicorn workers...")

def when_ready(server):
    """Called just after the server is started."""
    print(f"Gunicorn is ready. Listening on {bind}")

def pre_fork(server, worker):
    """Called just before a worker is forked."""
    pass

def post_fork(server, worker):
    """Called just after a worker has been forked."""
    print(f"Worker spawned (pid: {worker.pid})")

def pre_exec(server):
    """Called just before a new master process is forked."""
    print("Forking new master process...")

def pre_request(worker, req):
    """Called just before a worker processes the request."""
    pass

def post_request(worker, req, environ, resp):
    """Called after a worker processes the request."""
    pass

def worker_int(worker):
    """Called when a worker receives an INT or QUIT signal."""
    print(f"Worker {worker.pid} interrupted")

def worker_abort(worker):
    """Called when a worker receives a SIGABRT signal."""
    print(f"Worker {worker.pid} aborted")

def on_exit(server):
    """Called just before exiting Gunicorn."""
    print("Shutting down Gunicorn...")

# Performance tuning
preload_app = False  # Set to True for faster worker spawning, but less graceful reloads
reload = os.getenv('AUTO_RELOAD', 'false').lower() == 'true'
reload_extra_files = []

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Forwarded headers (if behind a proxy)
forwarded_allow_ips = '*'  # Adjust this in production for security
