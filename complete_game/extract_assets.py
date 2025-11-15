#!/usr/bin/env python3
"""
Extract CSS and JavaScript from monolithic HTML file into separate, deduplicated files.
"""
import re
from pathlib import Path

# Paths
HTML_FILE = Path("static/arcane_codex_scenario_ui_enhanced.html")
CSS_OUTPUT = Path("static/css/game-main.css")
JS_API_CLIENT = Path("static/js/api-client.js")
JS_OVERLAYS = Path("static/js/overlays.js")
JS_UI_UPDATES = Path("static/js/ui-updates.js")
JS_GAME_CORE = Path("static/js/game-core.js")

def extract_style_blocks(html_content):
    """Extract all <style> blocks from HTML."""
    style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL | re.IGNORECASE)
    matches = style_pattern.findall(html_content)
    print(f"Found {len(matches)} <style> blocks")
    return matches

def extract_script_blocks(html_content):
    """Extract all <script> blocks from HTML."""
    script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL | re.IGNORECASE)
    matches = script_pattern.findall(html_content)
    print(f"Found {len(matches)} <script> blocks")
    return matches

def merge_css_blocks(css_blocks):
    """Merge CSS blocks, removing duplicates while preserving order."""
    merged = []
    seen_rules = set()

    for block in css_blocks:
        # Split into individual rules (very basic - splits on })
        lines = block.strip().split('\n')
        current_rule = []

        for line in lines:
            current_rule.append(line)
            if '}' in line and current_rule:
                rule_text = '\n'.join(current_rule).strip()
                # Create a normalized version for comparison
                normalized = re.sub(r'\s+', ' ', rule_text)

                if normalized not in seen_rules and rule_text:
                    seen_rules.add(normalized)
                    merged.append(rule_text)
                current_rule = []

    return '\n\n'.join(merged)

def organize_css(css_content):
    """Organize CSS into logical sections."""
    sections = {
        'variables': [],
        'base': [],
        'layout': [],
        'components': [],
        'overlays': [],
        'animations': [],
        'responsive': []
    }

    # Split into rules
    rules = re.split(r'(?<=})\s*(?=/\*|\.|#|:root|\*|body|html|@)', css_content)

    for rule in rules:
        rule = rule.strip()
        if not rule:
            continue

        # Categorize rules
        if ':root' in rule or '--' in rule[:100]:
            sections['variables'].append(rule)
        elif '@keyframes' in rule or 'animation' in rule or '@media' in rule:
            if '@media' in rule:
                sections['responsive'].append(rule)
            else:
                sections['animations'].append(rule)
        elif '.overlay' in rule or '.game-overlay' in rule or 'overlay-' in rule:
            sections['overlays'].append(rule)
        elif any(x in rule[:50] for x in ['*', 'body', 'html', 'box-sizing']):
            sections['base'].append(rule)
        elif any(x in rule[:100] for x in ['.game-container', '.game-area', '.game-board', '-panel', '-hud']):
            sections['layout'].append(rule)
        else:
            sections['components'].append(rule)

    # Build organized CSS
    organized = []

    organized.append("/* ========================================")
    organized.append("   CSS VARIABLES AND DESIGN TOKENS")
    organized.append("   ======================================== */\n")
    organized.extend(sections['variables'])

    organized.append("\n\n/* ========================================")
    organized.append("   BASE STYLES")
    organized.append("   ======================================== */\n")
    organized.extend(sections['base'])

    organized.append("\n\n/* ========================================")
    organized.append("   LAYOUT")
    organized.append("   ======================================== */\n")
    organized.extend(sections['layout'])

    organized.append("\n\n/* ========================================")
    organized.append("   COMPONENTS")
    organized.append("   ======================================== */\n")
    organized.extend(sections['components'])

    organized.append("\n\n/* ========================================")
    organized.append("   OVERLAYS")
    organized.append("   ======================================== */\n")
    organized.extend(sections['overlays'])

    organized.append("\n\n/* ========================================")
    organized.append("   ANIMATIONS")
    organized.append("   ======================================== */\n")
    organized.extend(sections['animations'])

    organized.append("\n\n/* ========================================")
    organized.append("   RESPONSIVE")
    organized.append("   ======================================== */\n")
    organized.extend(sections['responsive'])

    return '\n\n'.join(organized)

def extract_function(js_content, function_name):
    """Extract a specific function from JavaScript content."""
    # Pattern to match function declaration and its body
    pattern = rf'(async\s+)?function\s+{re.escape(function_name)}\s*\([^)]*\)\s*\{{.*?^\s*\}}'
    match = re.search(pattern, js_content, re.MULTILINE | re.DOTALL)

    if match:
        return match.group(0)
    return None

def find_duplicate_functions(js_content):
    """Find all duplicate function definitions."""
    function_pattern = re.compile(r'(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{', re.MULTILINE)
    functions = function_pattern.findall(js_content)

    from collections import Counter
    function_counts = Counter(functions)
    duplicates = {name: count for name, count in function_counts.items() if count > 1}

    return duplicates

def categorize_js_code(js_blocks):
    """Categorize JavaScript code into different modules."""
    all_js = '\n\n'.join(js_blocks)

    # Find duplicates
    duplicates = find_duplicate_functions(all_js)
    print(f"\nFound duplicate functions: {duplicates}")

    # Extract unique versions of common functions
    api_functions = set()
    overlay_functions = set()
    ui_functions = set()
    core_functions = set()

    # Patterns for categorization
    api_patterns = ['apiCall', 'fetchWithCSRF', 'fetch', 'POST', 'GET']
    overlay_patterns = ['Overlay', 'openOverlay', 'closeOverlay', 'showOverlay', 'hideOverlay']
    ui_patterns = ['update', 'render', 'display', 'load', 'refresh']

    # Extract all function definitions (keeping only first occurrence)
    function_pattern = re.compile(
        r'(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}',
        re.MULTILINE | re.DOTALL
    )

    seen_functions = {}
    for match in function_pattern.finditer(all_js):
        func_name = match.group(1)
        func_code = match.group(0)

        # Keep only first occurrence
        if func_name not in seen_functions:
            seen_functions[func_name] = func_code

            # Categorize
            if any(pattern.lower() in func_name.lower() or pattern.lower() in func_code[:200].lower() for pattern in api_patterns):
                api_functions.add(func_name)
            elif any(pattern.lower() in func_name.lower() for pattern in overlay_patterns):
                overlay_functions.add(func_name)
            elif any(pattern.lower() in func_name.lower() for pattern in ui_patterns):
                ui_functions.add(func_name)
            else:
                core_functions.add(func_name)

    return {
        'api': {name: seen_functions[name] for name in api_functions},
        'overlay': {name: seen_functions[name] for name in overlay_functions},
        'ui': {name: seen_functions[name] for name in ui_functions},
        'core': {name: seen_functions[name] for name in core_functions}
    }

def main():
    print("Reading HTML file...")
    html_content = HTML_FILE.read_text(encoding='utf-8')
    original_size = len(html_content)
    print(f"Original HTML size: {original_size:,} bytes ({original_size/1024:.1f} KB)")

    # Extract CSS
    print("\n=== EXTRACTING CSS ===")
    css_blocks = extract_style_blocks(html_content)
    merged_css = merge_css_blocks(css_blocks)
    organized_css = organize_css(merged_css)

    # Write CSS
    CSS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    CSS_OUTPUT.write_text(organized_css, encoding='utf-8')
    print(f"[OK] Created {CSS_OUTPUT} ({len(organized_css):,} bytes, {len(organized_css)/1024:.1f} KB)")

    # Extract JavaScript
    print("\n=== EXTRACTING JAVASCRIPT ===")
    js_blocks = extract_script_blocks(html_content)

    # For now, combine all JS into game-core.js
    # We'll manually split later if needed
    all_js = '\n\n// ============================================\n// COMBINED JAVASCRIPT (deduplicated)\n// ============================================\n\n'.join(js_blocks)

    # Find and report duplicates
    duplicates = find_duplicate_functions(all_js)
    if duplicates:
        print("\nDuplicate functions found:")
        for func, count in duplicates.items():
            print(f"  - {func}: {count} occurrences")

    # Write combined JS (we'll split manually)
    JS_GAME_CORE.parent.mkdir(parents=True, exist_ok=True)
    JS_GAME_CORE.write_text(all_js, encoding='utf-8')
    print(f"[OK] Created {JS_GAME_CORE} ({len(all_js):,} bytes, {len(all_js)/1024:.1f} KB)")
    print("  (Contains all JavaScript - deduplication needed)")

    # Calculate savings
    print("\n=== SUMMARY ===")
    print(f"Original HTML: {original_size:,} bytes")
    css_size = len(organized_css)
    js_size = len(all_js)
    print(f"Extracted CSS: {css_size:,} bytes ({css_size/1024:.1f} KB)")
    print(f"Extracted JS: {js_size:,} bytes ({js_size/1024:.1f} KB)")
    print(f"\nNext steps:")
    print("1. Remove <style> and <script> blocks from HTML")
    print("2. Add <link> and <script> tags for external files")
    print("3. Manually split JavaScript into modules")
    print("4. Remove duplicate functions")

if __name__ == '__main__':
    main()
