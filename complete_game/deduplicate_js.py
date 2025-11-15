#!/usr/bin/env python3
"""
Deduplicate JavaScript and split into logical modules.
"""
import re
from pathlib import Path
from collections import defaultdict

# Paths
JS_INPUT = Path("static/js/game-core.js")
JS_API_CLIENT = Path("static/js/api-client.js")
JS_OVERLAYS = Path("static/js/overlays.js")
JS_UI_UPDATES = Path("static/js/ui-updates.js")
JS_GAME_CORE = Path("static/js/game-core-deduped.js")
JS_ANIMATIONS = Path("static/js/animations.js")

def extract_functions(js_content):
    """Extract all function definitions with their full bodies."""
    # Match function declarations including nested braces
    functions = {}

    # Simple pattern - find function keyword and track braces
    lines = js_content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]

        # Check if this line starts a function
        func_match = re.match(r'\s*(async\s+)?function\s+(\w+)\s*\(', line)
        if func_match:
            func_name = func_match.group(2)
            func_lines = [line]

            # Count braces to find function end
            brace_count = line.count('{') - line.count('}')
            i += 1

            while i < len(lines) and brace_count > 0:
                func_lines.append(lines[i])
                brace_count += lines[i].count('{') - lines[i].count('}')
                i += 1

            func_code = '\n'.join(func_lines)

            # Store only if we haven't seen this function
            if func_name not in functions:
                functions[func_name] = func_code
        else:
            i += 1

    return functions

def categorize_functions(functions):
    """Categorize functions into different modules."""
    api_functions = {}
    overlay_functions = {}
    ui_functions = {}
    animation_functions = {}
    core_functions = {}
    init_code = []

    # Define categorization rules
    api_keywords = ['api', 'fetch', 'request', 'post', 'get', 'csrf']
    overlay_keywords = ['overlay', 'modal', 'popup', 'close', 'open', 'show', 'hide']
    ui_keywords = ['load', 'update', 'render', 'display', 'refresh']
    animation_keywords = ['trigger', 'particle', 'damage', 'success', 'animation', 'tutorial']

    for func_name, func_code in functions.items():
        lower_name = func_name.lower()
        lower_code = func_code[:500].lower()  # Check first 500 chars

        # Categorize based on name and content
        if any(kw in lower_name for kw in api_keywords) or 'fetch(' in lower_code:
            api_functions[func_name] = func_code
        elif any(kw in lower_name for kw in animation_keywords):
            animation_functions[func_name] = func_code
        elif any(kw in lower_name for kw in overlay_keywords):
            overlay_functions[func_name] = func_code
        elif any(kw in lower_name for kw in ui_keywords):
            ui_functions[func_name] = func_code
        else:
            core_functions[func_name] = func_code

    return {
        'api': api_functions,
        'overlay': overlay_functions,
        'ui': ui_functions,
        'animation': animation_functions,
        'core': core_functions
    }

def extract_initialization_code(js_content, functions):
    """Extract non-function initialization code."""
    # Remove all function bodies
    remaining = js_content
    for func_code in functions.values():
        remaining = remaining.replace(func_code, '', 1)

    # Clean up empty lines and comments
    lines = [line for line in remaining.split('\n') if line.strip() and not line.strip().startswith('//')]

    return '\n'.join(lines)

def write_module(path, functions, header_comment):
    """Write functions to a module file."""
    content = []
    content.append(f"// {header_comment}")
    content.append("// Auto-generated from monolithic HTML - duplicates removed\n")

    for func_name, func_code in sorted(functions.items()):
        content.append(f"\n// {func_name}")
        content.append(func_code)

    path.write_text('\n'.join(content), encoding='utf-8')
    return len('\n'.join(content))

def main():
    print("Reading combined JavaScript file...")
    js_content = JS_INPUT.read_text(encoding='utf-8')
    original_size = len(js_content)
    print(f"Original JS size: {original_size:,} bytes ({original_size/1024:.1f} KB)")

    print("\nExtracting and deduplicating functions...")
    functions = extract_functions(js_content)
    print(f"Found {len(functions)} unique functions")

    print("\nCategorizing functions into modules...")
    categorized = categorize_functions(functions)

    for module_name, module_functions in categorized.items():
        print(f"  - {module_name}: {len(module_functions)} functions")

    # Write modules
    print("\nWriting module files...")

    sizes = {}

    if categorized['api']:
        size = write_module(
            JS_API_CLIENT,
            categorized['api'],
            "API Client - HTTP requests and CSRF handling"
        )
        sizes['api-client.js'] = size
        print(f"[OK] {JS_API_CLIENT} ({size:,} bytes, {size/1024:.1f} KB)")

    if categorized['overlay']:
        size = write_module(
            JS_OVERLAYS,
            categorized['overlay'],
            "Overlay Management - Modal windows and popups"
        )
        sizes['overlays.js'] = size
        print(f"[OK] {JS_OVERLAYS} ({size:,} bytes, {size/1024:.1f} KB)")

    if categorized['ui']:
        size = write_module(
            JS_UI_UPDATES,
            categorized['ui'],
            "UI Updates - Load and refresh game state"
        )
        sizes['ui-updates.js'] = size
        print(f"[OK] {JS_UI_UPDATES} ({size:,} bytes, {size/1024:.1f} KB)")

    if categorized['animation']:
        size = write_module(
            JS_ANIMATIONS,
            categorized['animation'],
            "Animations - Visual effects and celebrations"
        )
        sizes['animations.js'] = size
        print(f"[OK] {JS_ANIMATIONS} ({size:,} bytes, {size/1024:.1f} KB)")

    if categorized['core']:
        size = write_module(
            JS_GAME_CORE,
            categorized['core'],
            "Game Core - Main game logic and state management"
        )
        sizes['game-core-deduped.js'] = size
        print(f"[OK] {JS_GAME_CORE} ({size:,} bytes, {size/1024:.1f} KB)")

    # Summary
    total_new_size = sum(sizes.values())
    savings = original_size - total_new_size
    savings_pct = (savings / original_size) * 100

    print(f"\n=== DEDUPLICATION SUMMARY ===")
    print(f"Original size: {original_size:,} bytes ({original_size/1024:.1f} KB)")
    print(f"New total size: {total_new_size:,} bytes ({total_new_size/1024:.1f} KB)")
    print(f"Savings: {savings:,} bytes ({savings/1024:.1f} KB, {savings_pct:.1f}%)")
    print(f"\nDuplicate function removal complete!")

if __name__ == '__main__':
    main()
