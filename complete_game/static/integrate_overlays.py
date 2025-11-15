#!/usr/bin/env python3
"""
Integration script to merge all overlay implementations into the main HTML file.
This script will:
1. Read the main HTML file
2. Extract CSS, HTML, and JS from overlay implementation files
3. Insert them at the correct locations
4. Write the integrated file
"""

import re

# File paths
MAIN_FILE = "C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced.html"
CHAR_SHEET_FILE = "C:/Users/ilmiv/ProjectArgent/complete_game/static/character_sheet_overlay.html"
INVENTORY_FILE = "C:/Users/ilmiv/ProjectArgent/complete_game/static/inventory_overlay.html"
OVERLAYS_FILE = "C:/Users/ilmiv/ProjectArgent/complete_game/static/OVERLAY_IMPLEMENTATIONS.html"
OUTPUT_FILE = "C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_scenario_ui_enhanced_integrated.html"

def read_file(path):
    """Read file content"""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_css(content):
    """Extract CSS from <style> tags"""
    match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def extract_html_between_tags(content, start_tag, end_tag):
    """Extract HTML between specific tags"""
    pattern = f'{re.escape(start_tag)}(.*?){re.escape(end_tag)}'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def extract_script(content):
    """Extract JavaScript from <script> tags"""
    match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

# Read all files
print("Reading main HTML file...")
main_content = read_file(MAIN_FILE)

print("Reading character sheet overlay...")
char_sheet_content = read_file(CHAR_SHEET_FILE)

print("Reading inventory overlay...")
inventory_content = read_file(INVENTORY_FILE)

print("Reading map/skills/quests/settings overlays...")
overlays_content = read_file(OVERLAYS_FILE)

# Extract CSS from overlay files
print("\nExtracting CSS...")
char_sheet_css = extract_css(char_sheet_content)
inventory_css = extract_css(inventory_content)

# Extract HTML structures
print("Extracting HTML structures...")
char_sheet_html = extract_html_between_tags(
    char_sheet_content,
    '<div id="character-overlay"',
    '</div>\n</div>\n</div>'
)
if char_sheet_html:
    char_sheet_html = '<div id="character-overlay"' + char_sheet_html + '</div>\n</div>\n</div>'

inventory_html = extract_html_between_tags(
    inventory_content,
    '<div id="inventory-overlay"',
    '</div>\n</div>'
)
if inventory_html:
    inventory_html = '<div id="inventory-overlay"' + inventory_html + '</div>\n</div>'

# Extract map, skills, quests, settings from OVERLAY_IMPLEMENTATIONS
map_html = extract_html_between_tags(overlays_content, '<div id="map-overlay"', '</div>\n    </div>\n</div>')
if map_html:
    map_html = '<div id="map-overlay"' + map_html + '</div>\n    </div>\n</div>'

skills_html = extract_html_between_tags(overlays_content, '<div id="skills-overlay"', '</div>\n    </div>\n</div>')
if skills_html:
    skills_html = '<div id="skills-overlay"' + skills_html + '</div>\n    </div>\n</div>'

quests_html = extract_html_between_tags(overlays_content, '<div id="quests-overlay"', '</div>\n    </div>\n</div>')
if quests_html:
    quests_html = '<div id="quests-overlay"' + quests_html + '</div>\n    </div>\n</div>'

settings_html = extract_html_between_tags(overlays_content, '<div id="settings-overlay"', '</div>\n    </div>\n</div>')
if settings_html:
    settings_html = '<div id="settings-overlay"' + settings_html + '</div>\n    </div>\n</div>'

# Extract JavaScript
print("Extracting JavaScript...")
inventory_js = extract_script(inventory_content)
overlays_js = extract_script(overlays_content)

# Now integrate into main file
print("\nIntegrating all components...")

# 1. Insert additional CSS before </style>
css_insertion = f"""
        /* ========================================
           ENHANCED OVERLAY STYLES - INTEGRATED
           ======================================== */

        /* Character Sheet Overlay Styles */
{char_sheet_css}

        /* Inventory Overlay Styles */
{inventory_css}
    </style>"""

main_content = main_content.replace('    </style>', css_insertion)

# 2. Replace existing overlay HTML sections (lines 1460-1684)
# Find and replace the old overlay divs with new enhanced versions

# Remove old character overlay
main_content = re.sub(
    r'<div id="character-overlay" class="overlay">.*?</div>\s*</div>\s*</div>\s*(?=\s*<div id="inventory-overlay")',
    char_sheet_html + '\n\n        ',
    main_content,
    flags=re.DOTALL
)

# Remove old inventory overlay
main_content = re.sub(
    r'<div id="inventory-overlay" class="overlay">.*?</div>\s*</div>\s*</div>\s*(?=\s*<div id="skills-overlay")',
    inventory_html + '\n\n        ',
    main_content,
    flags=re.DOTALL
)

# Remove old skills overlay
main_content = re.sub(
    r'<div id="skills-overlay" class="overlay">.*?</div>\s*</div>\s*</div>\s*(?=\s*<div id="quests-overlay")',
    skills_html + '\n\n        ',
    main_content,
    flags=re.DOTALL
)

# Remove old quests overlay
main_content = re.sub(
    r'<div id="quests-overlay" class="overlay">.*?</div>\s*</div>\s*</div>\s*(?=\s*<div id="map-overlay")',
    quests_html + '\n\n        ',
    main_content,
    flags=re.DOTALL
)

# Remove old map overlay
main_content = re.sub(
    r'<div id="map-overlay" class="overlay">.*?</div>\s*</div>\s*</div>\s*(?=\s*<div id="settings-overlay")',
    map_html + '\n\n        ',
    main_content,
    flags=re.DOTALL
)

# Remove old settings overlay
main_content = re.sub(
    r'<div id="settings-overlay" class="overlay">.*?</div>\s*</div>\s*</div>\s*(?=\s*</div>)',
    settings_html + '\n    ',
    main_content,
    flags=re.DOTALL
)

# 3. Add additional JavaScript before the closing </script> tag
js_insertion = f"""
        // ============================================
        // ENHANCED OVERLAY FUNCTIONALITY - INTEGRATED
        // ============================================

        // Inventory overlay handlers
{inventory_js}

        // Additional overlay enhancements
{overlays_js}

        console.log('All 6 overlays integrated successfully - Press C/I/K/J/M or ESC');
    </script>"""

# Find the main script section and append before </script>
main_content = re.sub(
    r"(console\.log\('The Arcane Codex UI loaded - All interactive elements ready'\);)\s*</script>",
    r"\1\n\n" + js_insertion,
    main_content
)

# Write the integrated file
print(f"\nWriting integrated file to: {OUTPUT_FILE}")
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(main_content)

print("\n✓ Integration complete!")
print(f"✓ Integrated file created: {OUTPUT_FILE}")
print("\nComponents integrated:")
print("  1. Character Sheet Overlay (CSS + HTML)")
print("  2. Inventory Overlay (CSS + HTML + JS)")
print("  3. Map Overlay (HTML)")
print("  4. Skills Overlay (HTML)")
print("  5. Quests Overlay (HTML)")
print("  6. Settings Overlay (HTML)")
print("  7. Enhanced JavaScript handlers")
