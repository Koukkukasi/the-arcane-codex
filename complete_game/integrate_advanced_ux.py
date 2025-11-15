#!/usr/bin/env python3
"""
Phase B Advanced UX Integration Script
Integrates onboarding and retention systems
"""

import re
from pathlib import Path

def extract_css_from_file(filepath):
    """Extract CSS from a standalone HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
    if style_match:
        css = style_match.group(1).strip()
        css = re.sub(r'\s*body\s*\{[^}]+\}', '', css)
        return css
    return ''

def extract_html_from_file(filepath):
    """Extract HTML body content from a standalone file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)
    if body_match:
        html = body_match.group(1).strip()
        html = re.sub(r'<button[^>]*onclick="show\w+"[^>]*>.*?</button>', '', html)
        html = re.sub(r'<div class="demo-controls">.*?</div>', '', html, flags=re.DOTALL)
        return html
    return ''

def extract_js_from_file(filepath):
    """Extract JavaScript from a standalone HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if script_match:
        js = script_match.group(1).strip()
        js = re.sub(r'function show\w+\(\)\s*\{[^}]*\}', '', js)
        return js
    return ''

def integrate_onboarding(main_html_path):
    """Integrate onboarding system"""
    print("\n[1/2] Integrating onboarding system...")

    onboarding_file = Path('static/ux_improvements/onboarding.html')

    css = extract_css_from_file(onboarding_file)
    html = extract_html_from_file(onboarding_file)
    js = extract_js_from_file(onboarding_file)

    with open(main_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add CSS
    content = content.replace('</style>', f'\n        /* === Onboarding System (Phase B) === */\n        {css}\n    </style>')

    # Add HTML
    content = content.replace('<!-- === Celebration Animations (Phase B) ===', f'    <!-- === Onboarding System (Phase B) === -->\n    {html}\n\n    <!-- === Celebration Animations (Phase B) ===')

    # Add JS
    content = content.replace('// === Celebration Animations (Phase B) ===', f'        // === Onboarding System (Phase B) ===\n        {js}\n\n        // === Celebration Animations (Phase B) ===')

    with open(main_html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("  [OK] Onboarding system integrated")

def integrate_retention_system(main_html_path):
    """Integrate retention system"""
    print("\n[2/2] Integrating retention system (daily rewards, achievements)...")

    retention_file = Path('static/ux_improvements/retention_system.html')

    css = extract_css_from_file(retention_file)
    html = extract_html_from_file(retention_file)
    js = extract_js_from_file(retention_file)

    with open(main_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add CSS
    content = content.replace('</style>', f'\n        /* === Retention System (Phase B) === */\n        {css}\n    </style>')

    # Add HTML
    content = content.replace('<!-- === Onboarding System (Phase B) ===', f'    <!-- === Retention System (Phase B) === -->\n    {html}\n\n    <!-- === Onboarding System (Phase B) ===')

    # Add JS
    content = content.replace('// === Onboarding System (Phase B) ===', f'        // === Retention System (Phase B) ===\n        {js}\n\n        // === Onboarding System (Phase B) ===')

    with open(main_html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("  [OK] Retention system integrated")

def main():
    print("=" * 70)
    print("ARCANE CODEX - PHASE B ADVANCED UX INTEGRATION")
    print("=" * 70)

    main_html_path = 'static/arcane_codex_scenario_ui_enhanced.html'

    integrate_onboarding(main_html_path)
    integrate_retention_system(main_html_path)

    print("\n" + "=" * 70)
    print("ADVANCED UX INTEGRATION COMPLETE")
    print("=" * 70)
    print("\nIntegrated:")
    print("  + Onboarding System (tutorial, hints, first-time experience)")
    print("  + Retention System (daily rewards, achievements, leaderboards)")
    print("\nAll Phase B components now integrated!")
    print("=" * 70)

if __name__ == '__main__':
    main()
