#!/usr/bin/env python3
"""
Phase B UX Improvements Integration Script
Integrates loading states, celebrations, and mobile optimizations into main HTML
"""

import re
from pathlib import Path

def backup_main_html():
    """Create backup of main HTML file"""
    main_html = Path('static/arcane_codex_scenario_ui_enhanced.html')
    backup_path = Path('static/arcane_codex_scenario_ui_enhanced.html.backup_phase_b')

    with open(main_html, 'r', encoding='utf-8') as f:
        content = f.read()

    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] Backup created: {backup_path}")
    return str(main_html)

def extract_css_from_file(filepath):
    """Extract CSS from a standalone HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract everything between <style> tags
    style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
    if style_match:
        css = style_match.group(1).strip()
        # Remove body/demo specific styles, keep only component styles
        css = re.sub(r'\s*body\s*\{[^}]+\}', '', css)
        return css
    return ''

def extract_html_from_file(filepath):
    """Extract HTML body content from a standalone file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract everything between <body> tags
    body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)
    if body_match:
        html = body_match.group(1).strip()
        # Remove demo buttons/controls
        html = re.sub(r'<button[^>]*onclick="show\w+"[^>]*>.*?</button>', '', html)
        html = re.sub(r'<div class="demo-controls">.*?</div>', '', html, flags=re.DOTALL)
        return html
    return ''

def extract_js_from_file(filepath):
    """Extract JavaScript from a standalone HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract everything between <script> tags
    script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if script_match:
        js = script_match.group(1).strip()
        # Remove demo-specific functions
        js = re.sub(r'function show\w+\(\)\s*\{[^}]*\}', '', js)
        return js
    return ''

def integrate_loading_states(main_html_path):
    """Integrate loading states into main HTML"""
    print("\n[1/5] Integrating loading states...")

    loading_file = Path('static/ux_improvements/loading_states.html')

    # Extract components
    css = extract_css_from_file(loading_file)
    html = extract_html_from_file(loading_file)
    js = extract_js_from_file(loading_file)

    with open(main_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add CSS before closing </style> tag
    content = content.replace('</style>', f'\n        /* === Loading States (Phase B) === */\n        {css}\n    </style>')

    # Add HTML before closing </body> tag
    content = content.replace('</body>', f'\n    <!-- === Loading States (Phase B) === -->\n    {html}\n</body>')

    # Add JS before closing </script> tag
    content = content.replace('</script>', f'\n        // === Loading States (Phase B) ===\n        {js}\n    </script>')

    with open(main_html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("  [OK] Loading states integrated")

def integrate_celebrations(main_html_path):
    """Integrate celebration animations into main HTML"""
    print("\n[2/5] Integrating celebration animations...")

    celebrations_file = Path('static/ux_improvements/celebrations.html')

    # Extract components
    css = extract_css_from_file(celebrations_file)
    html = extract_html_from_file(celebrations_file)
    js = extract_js_from_file(celebrations_file)

    with open(main_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add CSS before closing </style> tag
    content = content.replace('</style>', f'\n        /* === Celebration Animations (Phase B) === */\n        {css}\n    </style>')

    # Add HTML before closing </body> tag (before loading states)
    content = content.replace('<!-- === Loading States (Phase B) ===', f'    <!-- === Celebration Animations (Phase B) === -->\n    {html}\n\n    <!-- === Loading States (Phase B) ===')

    # Add JS before closing </script> tag (before loading states)
    content = content.replace('// === Loading States (Phase B) ===', f'        // === Celebration Animations (Phase B) ===\n        {js}\n\n        // === Loading States (Phase B) ===')

    with open(main_html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("  [OK] Celebration animations integrated")

def integrate_mobile_optimizations(main_html_path):
    """Integrate mobile CSS optimizations"""
    print("\n[3/5] Integrating mobile optimizations...")

    mobile_css_file = Path('static/ux_improvements/mobile_optimizations.css')

    with open(mobile_css_file, 'r', encoding='utf-8') as f:
        mobile_css = f.read()

    with open(main_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add mobile CSS before closing </style> tag
    content = content.replace('</style>', f'\n        /* === Mobile Optimizations (Phase B) === */\n        {mobile_css}\n    </style>')

    with open(main_html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("  [OK] Mobile optimizations integrated")

def integrate_design_improvements(main_html_path):
    """Integrate design system improvements"""
    print("\n[4/5] Integrating design system improvements...")

    design_css_file = Path('static/css/design-system/07-improvements.css')

    if design_css_file.exists():
        with open(design_css_file, 'r', encoding='utf-8') as f:
            design_css = f.read()

        with open(main_html_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add design improvements CSS before closing </style> tag
        content = content.replace('</style>', f'\n        /* === Design System Improvements (Phase B) === */\n        {design_css}\n    </style>')

        with open(main_html_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print("  [OK] Design system improvements integrated")
    else:
        print("  [SKIP] Design system improvements file not found")

def add_ux_initialization(main_html_path):
    """Add UX initialization code"""
    print("\n[5/5] Adding UX initialization...")

    init_code = '''
        // === UX System Initialization (Phase B) ===
        class GameUX {
            constructor() {
                this.loadingShown = false;
                this.celebrationsEnabled = true;
            }

            showLoading(message = 'Loading...') {
                if (this.loadingShown) return;
                this.loadingShown = true;

                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.add('active');
                    const loadingText = loadingContainer.querySelector('.loading-text');
                    if (loadingText) loadingText.textContent = message;
                }
            }

            hideLoading() {
                this.loadingShown = false;
                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.remove('active');
                }
            }

            celebrate(type, data = {}) {
                if (!this.celebrationsEnabled) return;

                switch(type) {
                    case 'levelup':
                        if (typeof showLevelUp !== 'undefined') showLevelUp(data.level || 1);
                        break;
                    case 'quest':
                        if (typeof showQuestComplete !== 'undefined') showQuestComplete(data.quest || '');
                        break;
                    case 'achievement':
                        if (typeof showAchievement !== 'undefined') showAchievement(data.title || '', data.description || '');
                        break;
                }
            }

            vibrate(pattern = [50]) {
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(pattern);
                }
            }
        }

        // Initialize global UX controller
        const gameUX = new GameUX();
        console.log('[Phase B] UX improvements initialized');
'''

    with open(main_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add initialization code before the final closing </script> tag
    content = content.replace('</script>', f'{init_code}\n    </script>')

    with open(main_html_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("  [OK] UX initialization added")

def main():
    print("=" * 70)
    print("ARCANE CODEX - PHASE B UX IMPROVEMENTS INTEGRATION")
    print("=" * 70)

    # Step 1: Backup
    main_html_path = backup_main_html()

    # Step 2: Integrate components (Phase 1: Quick Wins)
    integrate_loading_states(main_html_path)
    integrate_celebrations(main_html_path)
    integrate_mobile_optimizations(main_html_path)
    integrate_design_improvements(main_html_path)

    # Step 3: Add initialization
    add_ux_initialization(main_html_path)

    print("\n" + "=" * 70)
    print("INTEGRATION COMPLETE")
    print("=" * 70)
    print("\nIntegrated components:")
    print("  ✓ Loading States (mystical spinner, tips)")
    print("  ✓ Celebration Animations (level-up, quests, achievements)")
    print("  ✓ Mobile Optimizations (touch controls, responsive)")
    print("  ✓ Design System Improvements (enhanced colors, animations)")
    print("\nNext steps:")
    print("  1. Test in browser: file:///static/arcane_codex_scenario_ui_enhanced.html")
    print("  2. Verify animations work correctly")
    print("  3. Test on mobile device/emulator")
    print("  4. Run Phase B verification script")
    print("\nBackup created at:")
    print("  static/arcane_codex_scenario_ui_enhanced.html.backup_phase_b")
    print("=" * 70)

if __name__ == '__main__':
    main()
