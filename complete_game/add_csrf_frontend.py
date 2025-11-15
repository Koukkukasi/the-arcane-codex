#!/usr/bin/env python3
"""
Add CSRF Token Support to Frontend
Adds CSRF token fetching and inclusion in all POST requests
"""

def add_csrf_to_frontend():
    file_path = 'static/arcane_codex_scenario_ui_enhanced.html'

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the opening <script> tag and add CSRF token fetch logic
    # Look for the first <script> tag after the closing </style>
    csrf_fetch_code = '''
        // CSRF Protection: Fetch and store CSRF token
        let csrfToken = null;

        async function fetchCSRFToken() {
            try {
                const response = await fetch('/api/csrf-token');
                const data = await response.json();
                csrfToken = data.csrf_token;
                console.log('[Security] CSRF token fetched successfully');
            } catch (error) {
                console.error('[Security] Failed to fetch CSRF token:', error);
            }
        }

        // Fetch CSRF token on page load
        fetchCSRFToken();

        // Helper function to add CSRF token to fetch requests
        function fetchWithCSRF(url, options = {}) {
            if (!options.headers) {
                options.headers = {};
            }
            if (csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
                options.headers['X-CSRFToken'] = csrfToken;
            }
            return fetch(url, options);
        }

'''

    # Find the first occurrence of "// JavaScript Code" or similar marker
    # Insert the CSRF code at the beginning of the script section
    script_start_marker = '    <script>'

    content = content.replace(script_start_marker, script_start_marker + csrf_fetch_code, 1)

    # Write the modified content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] CSRF token support added to frontend!")
    print("   - Added fetchCSRFToken() function")
    print("   - Added fetchWithCSRF() helper function")
    print("\nManual step required:")
    print("   Replace all fetch() calls with fetchWithCSRF() in the HTML file")
    print("   This ensures all POST requests include the CSRF token")

if __name__ == '__main__':
    add_csrf_to_frontend()
