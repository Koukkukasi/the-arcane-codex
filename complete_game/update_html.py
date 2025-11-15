#!/usr/bin/env python3
"""
Update HTML file to use external CSS and JS files.
"""
import re
from pathlib import Path
from datetime import datetime

# Paths
HTML_INPUT = Path("static/arcane_codex_scenario_ui_enhanced.html")
HTML_OUTPUT = Path("static/arcane_codex_scenario_ui_enhanced.html")
HTML_BACKUP = Path(f"static/arcane_codex_scenario_ui_enhanced.html.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")

def remove_style_blocks(html_content):
    """Remove all <style> blocks from HTML."""
    # Count original blocks
    original_count = len(re.findall(r'<style>.*?</style>', html_content, re.DOTALL | re.IGNORECASE))

    # Remove all style blocks
    html_content = re.sub(r'<style>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)

    print(f"Removed {original_count} <style> blocks")
    return html_content

def remove_script_blocks(html_content):
    """Remove all <script> blocks that have inline content."""
    # Find all script blocks
    script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL | re.IGNORECASE)
    scripts = script_pattern.findall(html_content)

    # Count and remove only inline scripts (not external references)
    inline_count = 0
    for script_content in scripts:
        if script_content.strip():  # Has content
            inline_count += 1

    # Remove inline script blocks
    html_content = re.sub(
        r'<script>(?!<).*?</script>',
        '',
        html_content,
        flags=re.DOTALL | re.IGNORECASE
    )

    print(f"Removed {inline_count} inline <script> blocks")
    return html_content

def add_external_references(html_content):
    """Add external CSS and JS references to HTML."""

    # Find the closing </head> tag and insert CSS link before it
    css_link = '''    <!-- External CSS -->
    <link rel="stylesheet" href="/static/css/game-main.css">
</head>'''

    html_content = re.sub(r'</head>', css_link, html_content, count=1, flags=re.IGNORECASE)

    # Find the closing </body> tag and insert JS scripts before it
    js_scripts = '''
    <!-- External JavaScript Modules -->
    <script src="/static/js/api-client.js" defer></script>
    <script src="/static/js/animations.js" defer></script>
    <script src="/static/js/overlays.js" defer></script>
    <script src="/static/js/ui-updates.js" defer></script>
    <script src="/static/js/game-core-deduped.js" defer></script>
</body>'''

    html_content = re.sub(r'</body>', js_scripts, html_content, count=1, flags=re.IGNORECASE)

    print("Added external CSS and JS references")
    return html_content

def clean_whitespace(html_content):
    """Clean up excessive whitespace."""
    # Remove multiple consecutive blank lines
    html_content = re.sub(r'\n\s*\n\s*\n+', '\n\n', html_content)

    # Remove trailing whitespace from lines
    lines = [line.rstrip() for line in html_content.split('\n')]
    html_content = '\n'.join(lines)

    return html_content

def main():
    print("Reading HTML file...")
    html_content = HTML_INPUT.read_text(encoding='utf-8')
    original_size = len(html_content)
    original_lines = len(html_content.split('\n'))
    print(f"Original size: {original_size:,} bytes ({original_size/1024:.1f} KB)")
    print(f"Original lines: {original_lines:,}")

    # Create backup
    print(f"\nCreating backup: {HTML_BACKUP.name}")
    HTML_BACKUP.write_text(html_content, encoding='utf-8')

    # Process HTML
    print("\nProcessing HTML...")
    html_content = remove_style_blocks(html_content)
    html_content = remove_script_blocks(html_content)
    html_content = add_external_references(html_content)
    html_content = clean_whitespace(html_content)

    # Write updated HTML
    HTML_OUTPUT.write_text(html_content, encoding='utf-8')

    new_size = len(html_content)
    new_lines = len(html_content.split('\n'))
    savings = original_size - new_size
    savings_pct = (savings / original_size) * 100

    print(f"\n=== HTML UPDATE SUMMARY ===")
    print(f"Original: {original_size:,} bytes ({original_size/1024:.1f} KB), {original_lines:,} lines")
    print(f"New: {new_size:,} bytes ({new_size/1024:.1f} KB), {new_lines:,} lines")
    print(f"Savings: {savings:,} bytes ({savings/1024:.1f} KB, {savings_pct:.1f}%)")
    print(f"\nUpdated HTML written to: {HTML_OUTPUT}")

if __name__ == '__main__':
    main()
