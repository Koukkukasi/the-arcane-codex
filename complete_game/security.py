"""
The Arcane Codex - Security Manager
Rate limiting, input validation, and security hardening
"""

import time
import re
import hashlib
import secrets
import logging
from typing import Dict, List, Optional, Callable
from datetime import datetime, timedelta
from collections import defaultdict, deque
from functools import wraps
from flask import request, jsonify

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Token bucket rate limiter
    """

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.buckets: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_requests))

    def check(self, identifier: str) -> bool:
        """Check if request is allowed"""
        now = time.time()
        bucket = self.buckets[identifier]

        # Remove old timestamps
        while bucket and bucket[0] < now - self.window_seconds:
            bucket.popleft()

        # Check if under limit
        if len(bucket) < self.max_requests:
            bucket.append(now)
            return True

        return False

    def get_remaining(self, identifier: str) -> int:
        """Get remaining requests in window"""
        now = time.time()
        bucket = self.buckets[identifier]

        # Remove old timestamps
        while bucket and bucket[0] < now - self.window_seconds:
            bucket.popleft()

        return self.max_requests - len(bucket)

    def reset(self, identifier: str):
        """Reset rate limit for identifier"""
        if identifier in self.buckets:
            del self.buckets[identifier]

class SecurityManager:
    """
    Comprehensive security manager
    """

    def __init__(self, rate_limit_enabled: bool = True, max_requests: int = 60):
        self.rate_limit_enabled = rate_limit_enabled
        self.rate_limiters = {
            'global': RateLimiter(max_requests=max_requests, window_seconds=60),
            'api': RateLimiter(max_requests=30, window_seconds=60),
            'websocket': RateLimiter(max_requests=100, window_seconds=60),
            'chat': RateLimiter(max_requests=10, window_seconds=60)
        }

        # Track failed login attempts
        self.failed_attempts: Dict[str, List[datetime]] = defaultdict(list)
        self.blocked_ips: Dict[str, datetime] = {}

        # XSS patterns
        self.xss_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'onerror\s*=',
            r'onload\s*=',
            r'onclick\s*=',
            r'<iframe',
            r'eval\(',
            r'<embed',
            r'<object'
        ]

        # SQL injection patterns
        self.sql_patterns = [
            r'(\bunion\b.*\bselect\b)',
            r'(\bor\b.*=.*)',
            r'(--)',
            r'(;.*drop\b)',
            r'(\bexec\b)',
            r'(\binsert\b.*\binto\b)',
            r'(\bupdate\b.*\bset\b)',
            r'(\bdelete\b.*\bfrom\b)'
        ]

    def check_rate_limit(self, identifier: str, limiter_type: str = 'global') -> bool:
        """Check rate limit for identifier"""
        if not self.rate_limit_enabled:
            return True

        limiter = self.rate_limiters.get(limiter_type, self.rate_limiters['global'])
        allowed = limiter.check(identifier)

        if not allowed:
            logger.warning(f"Rate limit exceeded for {identifier} ({limiter_type})")

        return allowed

    def is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is blocked"""
        if ip in self.blocked_ips:
            block_until = self.blocked_ips[ip]
            if datetime.now() < block_until:
                return True
            else:
                # Unblock
                del self.blocked_ips[ip]

        return False

    def record_failed_attempt(self, ip: str):
        """Record failed login/auth attempt"""
        now = datetime.now()

        # Clean old attempts (older than 1 hour)
        self.failed_attempts[ip] = [
            attempt for attempt in self.failed_attempts[ip]
            if now - attempt < timedelta(hours=1)
        ]

        # Add new attempt
        self.failed_attempts[ip].append(now)

        # Block if too many failures (5 in 1 hour)
        if len(self.failed_attempts[ip]) >= 5:
            self.block_ip(ip, minutes=30)
            logger.warning(f"IP {ip} blocked due to repeated failed attempts")

    def block_ip(self, ip: str, minutes: int = 30):
        """Block an IP address"""
        self.blocked_ips[ip] = datetime.now() + timedelta(minutes=minutes)
        logger.warning(f"IP {ip} blocked for {minutes} minutes")

    def unblock_ip(self, ip: str):
        """Unblock an IP address"""
        if ip in self.blocked_ips:
            del self.blocked_ips[ip]
            logger.info(f"IP {ip} unblocked")

    def validate_input(self, text: str, max_length: int = 1000) -> tuple[bool, Optional[str]]:
        """Validate and sanitize user input"""
        if not text:
            return False, "Input is empty"

        if len(text) > max_length:
            return False, f"Input too long (max {max_length} characters)"

        # Check for XSS
        for pattern in self.xss_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                logger.warning(f"XSS attempt detected: {text[:50]}...")
                return False, "Invalid input detected"

        # Check for SQL injection (in case of direct SQL usage)
        for pattern in self.sql_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                logger.warning(f"SQL injection attempt detected: {text[:50]}...")
                return False, "Invalid input detected"

        return True, None

    def sanitize_input(self, text: str, allow_html: bool = False) -> str:
        """Sanitize user input"""
        if not allow_html:
            # Remove HTML tags
            text = re.sub(r'<[^>]+>', '', text)

        # Remove null bytes
        text = text.replace('\x00', '')

        # Normalize whitespace
        text = ' '.join(text.split())

        return text.strip()

    def validate_game_code(self, code: str) -> bool:
        """Validate game code format"""
        if not code:
            return False

        # Must be 6 alphanumeric characters
        if not re.match(r'^[A-Z0-9]{6}$', code):
            return False

        return True

    def validate_player_name(self, name: str) -> tuple[bool, Optional[str]]:
        """Validate player name"""
        if not name:
            return False, "Name is required"

        if len(name) < 2:
            return False, "Name too short (min 2 characters)"

        if len(name) > 50:
            return False, "Name too long (max 50 characters)"

        # Only alphanumeric and spaces
        if not re.match(r'^[a-zA-Z0-9 ]+$', name):
            return False, "Name contains invalid characters"

        return True, None

    def generate_csrf_token(self) -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)

    def validate_csrf_token(self, token: str, expected: str) -> bool:
        """Validate CSRF token"""
        if not token or not expected:
            return False

        return secrets.compare_digest(token, expected)

    def hash_password(self, password: str) -> str:
        """Hash password (placeholder - use proper bcrypt in production)"""
        # In production, use bcrypt or argon2
        salt = secrets.token_hex(16)
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}${hashed.hex()}"

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        try:
            salt, hash_value = hashed.split('$')
            test_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return secrets.compare_digest(test_hash.hex(), hash_value)
        except:
            return False

    def get_client_ip(self, request_obj) -> str:
        """Get client IP address from request"""
        # Check for proxy headers
        if request_obj.headers.get('X-Forwarded-For'):
            return request_obj.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request_obj.headers.get('X-Real-IP'):
            return request_obj.headers.get('X-Real-IP')
        else:
            return request_obj.remote_addr

    def log_security_event(self, event_type: str, details: Dict):
        """Log security event"""
        logger.warning(f"Security Event: {event_type} - {details}")

# Decorators for Flask routes

def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    """Rate limiting decorator"""
    limiter = RateLimiter(max_requests=max_requests, window_seconds=window_seconds)

    def decorator(f: Callable):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            identifier = request.remote_addr

            if not limiter.check(identifier):
                return jsonify({
                    'success': False,
                    'error': 'Rate limit exceeded. Please try again later.'
                }), 429

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_input(required_fields: List[str] = None):
    """Input validation decorator"""
    def decorator(f: Callable):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.json:
                return jsonify({
                    'success': False,
                    'error': 'Invalid request format'
                }), 400

            # Check required fields
            if required_fields:
                for field in required_fields:
                    if field not in request.json:
                        return jsonify({
                            'success': False,
                            'error': f'Missing required field: {field}'
                        }), 400

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_auth(f: Callable):
    """Authentication required decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for auth token in headers
        auth_token = request.headers.get('Authorization')

        if not auth_token:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401

        # Validate token (implement your auth logic)
        # For now, just check if present
        if not auth_token.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Invalid authentication format'
            }), 401

        return f(*args, **kwargs)
    return decorated_function

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Security Manager...")

    security = SecurityManager(rate_limit_enabled=True, max_requests=5)

    # Test rate limiting
    print("\nTesting rate limiter:")
    for i in range(7):
        allowed = security.check_rate_limit("test_user", "api")
        print(f"Request {i+1}: {'Allowed' if allowed else 'BLOCKED'}")

    # Test input validation
    print("\nTesting input validation:")
    test_inputs = [
        "Normal text input",
        "<script>alert('xss')</script>",
        "'; DROP TABLE users; --",
        "A" * 2000,  # Too long
        "Valid name 123"
    ]

    for text in test_inputs:
        valid, error = security.validate_input(text, max_length=1000)
        print(f"Input: {text[:50]}... - Valid: {valid}, Error: {error}")

    # Test sanitization
    print("\nTesting sanitization:")
    dirty = "<b>Hello</b> <script>bad()</script> World  "
    clean = security.sanitize_input(dirty)
    print(f"Original: {dirty}")
    print(f"Sanitized: {clean}")

    # Test game code validation
    print("\nTesting game code validation:")
    codes = ["ABC123", "abc123", "ABCDEF", "ABC", "ABC@12"]
    for code in codes:
        valid = security.validate_game_code(code)
        print(f"Code: {code} - Valid: {valid}")

    # Test player name validation
    print("\nTesting player name validation:")
    names = ["John", "A", "Valid Name 123", "Invalid@Name", "A" * 60]
    for name in names:
        valid, error = security.validate_player_name(name)
        print(f"Name: {name[:20]} - Valid: {valid}, Error: {error}")

    print("\nSecurity manager test completed!")
