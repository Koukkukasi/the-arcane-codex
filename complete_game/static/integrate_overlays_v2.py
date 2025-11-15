#!/usr/bin/env python3
"""
Simplified overlay integration script.
Directly concatenates CSS, HTML, and JS from all overlay files into the main file.
"""

import os

# File paths
BASE_DIR = "C:/Users/ilmiv/ProjectArgent/complete_game/static"
MAIN_FILE = os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html")
OUTPUT_FILE = os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html")
BACKUP_FILE = os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html.pre_integration_backup")

def read_file(path):
    """Read file with UTF-8 encoding"""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    """Write file with UTF-8 encoding"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def extract_between(content, start_marker, end_marker):
    """Extract content between two markers"""
    start_idx = content.find(start_marker)
    if start_idx == -1:
        return ""
    start_idx += len(start_marker)
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        return ""
    return content[start_idx:end_idx]

print("=" * 60)
print("OVERLAY INTEGRATION SCRIPT V2")
print("=" * 60)

# Step 1: Read main file
print("\n[1/7] Reading main HTML file...")
main_html = read_file(MAIN_FILE)
print(f"   Original file size: {len(main_html)} bytes")

# Step 2: Create backup
print("\n[2/7] Creating backup...")
write_file(BACKUP_FILE, main_html)
print(f"   Backup saved to: {BACKUP_FILE}")

# Step 3: Read character sheet overlay
print("\n[3/7] Reading character sheet overlay...")
char_file = os.path.join(BASE_DIR, "character_sheet_overlay.html")
char_content = read_file(char_file)

# Extract character sheet CSS (everything inside <style> tags)
char_css = extract_between(char_content, "<style>", "</style>")

# Extract character sheet HTML (the complete div)
char_html_start = '<div id="character-overlay" class="overlay character-sheet-overlay">'
char_html_end = '</div>\n</div>\n</div>'
char_html = extract_between(char_content, "<!-- CHARACTER SHEET OVERLAY", char_html_end)
if char_html:
    char_html = char_html[char_html.find(char_html_start):]
    char_html += char_html_end

print(f"   Character CSS: {len(char_css)} chars")
print(f"   Character HTML: {len(char_html)} chars")

# Step 4: Read inventory overlay
print("\n[4/7] Reading inventory overlay...")
inv_file = os.path.join(BASE_DIR, "inventory_overlay.html")
inv_content = read_file(inv_file)

# Extract inventory CSS
inv_css = extract_between(inv_content, "<style>", "</style>")

# Extract inventory HTML
inv_html_start = '<div id="inventory-overlay" class="game-overlay">'
inv_html = extract_between(inv_content, "<!-- Inventory Overlay HTML Structure -->", "<!-- Inventory Control Script -->")
if inv_html:
    inv_html = inv_html[inv_html.find(inv_html_start):]

# Extract inventory JavaScript
inv_js = extract_between(inv_content, "<script>", "</script>")

print(f"   Inventory CSS: {len(inv_css)} chars")
print(f"   Inventory HTML: {len(inv_html)} chars")
print(f"   Inventory JS: {len(inv_js)} chars")

# Step 5: Read map/skills/quests/settings overlays
print("\n[5/7] Reading map/skills/quests/settings overlays...")
overlays_file = os.path.join(BASE_DIR, "OVERLAY_IMPLEMENTATIONS.html")
overlays_content = read_file(overlays_file)

# Extract each overlay HTML
map_html = extract_between(overlays_content, '<div id="map-overlay" class="overlay">', '</div>\n</div>\n</div>\n\n\n<!-- ========================================')
if map_html:
    map_html = '<div id="map-overlay" class="overlay">' + map_html + '</div>\n</div>\n</div>'

skills_html = extract_between(overlays_content, '<div id="skills-overlay" class="overlay">', '</div>\n</div>\n</div>\n\n\n<!-- ========================================')
if skills_html:
    skills_html = '<div id="skills-overlay" class="overlay">' + skills_html + '</div>\n</div>\n</div>'

quests_html = extract_between(overlays_content, '<div id="quests-overlay" class="overlay">', '</div>\n</div>\n</div>\n\n\n<!-- ========================================')
if quests_html:
    quests_html = '<div id="quests-overlay" class="overlay">' + quests_html + '</div>\n</div>\n</div>'

settings_html = extract_between(overlays_content, '<div id="settings-overlay" class="overlay">', '</div>\n</div>\n</div>\n\n\n<!-- ========================================')
if settings_html:
    settings_html = '<div id="settings-overlay" class="overlay">' + settings_html + '</div>\n</div>\n</div>'

# Extract overlay JavaScript
overlays_js = extract_between(overlays_content, "<script>", "</script>")

print(f"   Map HTML: {len(map_html)} chars")
print(f"   Skills HTML: {len(skills_html)} chars")
print(f"   Quests HTML: {len(quests_html)} chars")
print(f"   Settings HTML: {len(settings_html)} chars")
print(f"   Overlays JS: {len(overlays_js)} chars")

# Step 6: Build the integrated file
print("\n[6/7] Building integrated file...")

# Find the position to insert CSS (before </style>)
style_end_pos = main_html.rfind('    </style>')

# Insert all CSS before </style>
additional_css = f"""
        /* ========================================
           CHARACTER SHEET OVERLAY STYLES
           ======================================== */
{char_css}

        /* ========================================
           INVENTORY OVERLAY STYLES
           ======================================== */
{inv_css}
"""

part1 = main_html[:style_end_pos]
part2 = main_html[style_end_pos:]

integrated = part1 + additional_css + "\n" + part2

# Find and replace the old overlay section
old_overlays_start = integrated.find('        <!-- Overlay Elements -->')
old_overlays_end = integrated.find('    <script>', old_overlays_start)

# Build new overlays section
new_overlays = f"""        <!-- Overlay Elements -->
        <!-- Character Sheet Overlay -->
        {char_html}

        <!-- Inventory Overlay -->
        {inv_html}

        <!-- Skills Overlay -->
        {skills_html}

        <!-- Quests Overlay -->
        {quests_html}

        <!-- Map Overlay -->
        {map_html}

        <!-- Settings Overlay -->
        {settings_html}
    </div>

    """

integrated = integrated[:old_overlays_start] + new_overlays + integrated[old_overlays_end:]

# Find position to insert JavaScript (before the last console.log and </script>)
script_insert_pos = integrated.rfind("console.log('The Arcane Codex UI loaded - All interactive elements ready');")

# Insert JavaScript
additional_js = f"""
        // ============================================
        // INVENTORY OVERLAY HANDLERS
        // ============================================
{inv_js}

        // ============================================
        // ADDITIONAL OVERLAY ENHANCEMENTS
        // ============================================
{overlays_js}

        """

integrated = integrated[:script_insert_pos] + additional_js + "\n        " + integrated[script_insert_pos:]

# Step 7: Write the integrated file
print("\n[7/7] Writing integrated file...")
write_file(OUTPUT_FILE, integrated)

print(f"\n   Output file size: {len(integrated)} bytes")
print(f"   Size increase: {len(integrated) - len(main_html)} bytes")

print("\n" + "=" * 60)
print("INTEGRATION COMPLETE!")
print("=" * 60)
print(f"\nIntegrated file: {OUTPUT_FILE}")
print(f"Backup file: {BACKUP_FILE}")
print("\nComponents integrated:")
print("  [x] Character Sheet Overlay (CSS + HTML)")
print("  [x] Inventory Overlay (CSS + HTML + JS)")
print("  [x] Map Overlay (HTML)")
print("  [x] Skills Overlay (HTML)")
print("  [x] Quests Overlay (HTML)")
print("  [x] Settings Overlay (HTML)")
print("  [x] Enhanced JavaScript handlers")
print("\nTest the integrated file by opening it in a browser.")
print("Press C/I/K/J/M or ESC to test overlays.")
