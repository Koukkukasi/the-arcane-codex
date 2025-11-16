"""
Production Logging Configuration for The Arcane Codex
Provides structured JSON logging with rotation and multiple handlers
"""
import os
import sys
import logging
import logging.handlers
import json
from datetime import datetime
from pathlib import Path


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""

    def format(self, record):
        """Format log record as JSON"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        # Add extra fields if present
        if hasattr(record, 'extra_fields'):
            log_data.update(record.extra_fields)

        # Add request context if available
        try:
            from flask import has_request_context, request
            if has_request_context():
                log_data['request'] = {
                    'method': request.method,
                    'path': request.path,
                    'ip': request.remote_addr,
                    'user_agent': request.user_agent.string
                }
        except ImportError:
            pass

        return json.dumps(log_data)


class ColoredFormatter(logging.Formatter):
    """Colored formatter for console output"""

    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
    }
    RESET = '\033[0m'

    def format(self, record):
        """Format with colors"""
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        return super().format(record)


def setup_production_logging(app=None):
    """
    Configure production logging with multiple handlers

    Args:
        app: Flask application instance (optional)
    """
    # Get configuration from environment
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_format = os.getenv('LOG_FORMAT', 'json').lower()
    log_file = os.getenv('LOG_FILE', '/var/log/arcane-codex/app.log')
    log_to_file = os.getenv('LOG_TO_FILE', 'true').lower() == 'true'
    log_to_stdout = os.getenv('LOG_TO_STDOUT', 'true').lower() == 'true'
    max_bytes = int(os.getenv('LOG_MAX_BYTES', 10485760))  # 10MB default
    backup_count = int(os.getenv('LOG_BACKUP_COUNT', 10))

    # Create log directory if it doesn't exist
    if log_to_file:
        log_dir = Path(log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level))

    # Remove existing handlers
    root_logger.handlers.clear()

    # File handler with rotation
    if log_to_file:
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count
        )
        file_handler.setLevel(getattr(logging, log_level))

        if log_format == 'json':
            file_handler.setFormatter(JSONFormatter())
        else:
            file_handler.setFormatter(
                logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
            )

        root_logger.addHandler(file_handler)

    # Console handler
    if log_to_stdout:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, log_level))

        if log_format == 'json':
            console_handler.setFormatter(JSONFormatter())
        else:
            # Use colored formatter for console
            console_handler.setFormatter(
                ColoredFormatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
            )

        root_logger.addHandler(console_handler)

    # Configure Flask app logging if provided
    if app:
        app.logger.setLevel(getattr(logging, log_level))

        # Disable default Flask logger
        logging.getLogger('werkzeug').setLevel(logging.WARNING)

    # Log initial message
    logging.info("Production logging configured", extra={
        'extra_fields': {
            'log_level': log_level,
            'log_format': log_format,
            'log_to_file': log_to_file,
            'log_to_stdout': log_to_stdout
        }
    })

    return root_logger


def get_logger(name):
    """Get a logger instance with the given name"""
    return logging.getLogger(name)


# Performance logging decorator
def log_performance(func):
    """Decorator to log function execution time"""
    import time
    import functools

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = get_logger(func.__module__)
        start_time = time.time()

        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time

            logger.info(
                f"Function {func.__name__} executed",
                extra={
                    'extra_fields': {
                        'function': func.__name__,
                        'execution_time_ms': round(execution_time * 1000, 2)
                    }
                }
            )

            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(
                f"Function {func.__name__} failed",
                extra={
                    'extra_fields': {
                        'function': func.__name__,
                        'execution_time_ms': round(execution_time * 1000, 2),
                        'error': str(e)
                    }
                },
                exc_info=True
            )
            raise

    return wrapper


# Request logging middleware for Flask
def setup_request_logging(app):
    """Setup request/response logging for Flask"""
    import time
    from flask import request, g

    @app.before_request
    def before_request():
        """Log request start"""
        g.start_time = time.time()

    @app.after_request
    def after_request(response):
        """Log request completion"""
        if hasattr(g, 'start_time'):
            execution_time = time.time() - g.start_time

            # Don't log health checks
            if request.path != '/health':
                app.logger.info(
                    f"{request.method} {request.path}",
                    extra={
                        'extra_fields': {
                            'method': request.method,
                            'path': request.path,
                            'status_code': response.status_code,
                            'execution_time_ms': round(execution_time * 1000, 2),
                            'ip': request.remote_addr
                        }
                    }
                )

        return response

    return app


if __name__ == '__main__':
    # Test logging configuration
    setup_production_logging()

    logger = get_logger(__name__)
    logger.debug("Debug message")
    logger.info("Info message")
    logger.warning("Warning message")
    logger.error("Error message")

    try:
        raise ValueError("Test exception")
    except Exception:
        logger.exception("Exception occurred")
