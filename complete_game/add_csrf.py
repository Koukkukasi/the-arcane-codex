#!/usr/bin/env python3
"""
CSRF Protection Addition Script
Adds Flask-WTF CSRF protection to web_game.py
"""

def add_csrf_protection():
    file_path = 'web_game.py'

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Add CSRF import after flask_cors import
    old_imports = '''from flask_cors import CORS
import secrets'''

    new_imports = '''from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf
import secrets'''

    content = content.replace(old_imports, new_imports)

    # Step 2: Initialize CSRF protection after CORS
    old_cors = '''CORS(app, supports_credentials=True)'''

    new_cors = '''CORS(app, supports_credentials=True)

# CSRF Protection
csrf = CSRFProtect(app)
app.config['WTF_CSRF_TIME_LIMIT'] = None  # No expiration for long game sessions
print("[OK] CSRF protection enabled")'''

    content = content.replace(old_cors, new_cors)

    # Step 3: Add CSRF token endpoint (add before the first @app.route)
    # Find the first @app.route and add the CSRF endpoint before it
    first_route_marker = '@app.route(\'/\')'
    csrf_endpoint = '''# CSRF Token endpoint for frontend
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Provide CSRF token to frontend for AJAX requests"""
    token = generate_csrf()
    return jsonify({'csrf_token': token})

'''

    content = content.replace(first_route_marker, csrf_endpoint + first_route_marker)

    # Write the modified content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] CSRF protection added to web_game.py!")
    print("   - Added CSRFProtect import")
    print("   - Initialized CSRF protection")
    print("   - Added /api/csrf-token endpoint")
    print("\nNext steps:")
    print("   1. Update frontend to fetch CSRF token")
    print("   2. Include CSRF token in all POST requests")

if __name__ == '__main__':
    add_csrf_protection()
