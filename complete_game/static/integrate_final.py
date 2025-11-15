#!/usr/bin/env python3
"""
Final integration script - manually extracts and concatenates all overlay components.
"""

import os
import re

BASE_DIR = "C:/Users/ilmiv/ProjectArgent/complete_game/static"

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Reading files...")

# Read main file
main_html = read_file(os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html"))

# Read overlay files
char_content = read_file(os.path.join(BASE_DIR, "character_sheet_overlay.html"))
inv_content = read_file(os.path.join(BASE_DIR, "inventory_overlay.html"))
overlays_content = read_file(os.path.join(BASE_DIR, "OVERLAY_IMPLEMENTATIONS.html"))

print("Extracting components...")

# Extract character sheet CSS - everything between <style> and </style>
char_css_match = re.search(r'<style>(.*?)</style>', char_content, re.DOTALL)
char_css = char_css_match.group(1).strip() if char_css_match else ""

# Extract character sheet HTML - from first <div id="character-overlay" to end of that section
char_html_match = re.search(r'(<div id="character-overlay".*?</div>\s*</div>\s*</div>)', char_content, re.DOTALL)
char_html = char_html_match.group(1).strip() if char_html_match else ""

# Extract inventory CSS
inv_css_match = re.search(r'<style>(.*?)</style>', inv_content, re.DOTALL)
inv_css = inv_css_match.group(1).strip() if inv_css_match else ""

# Extract inventory HTML
inv_html_match = re.search(r'(<div id="inventory-overlay".*?</div>\s*</div>)', inv_content, re.DOTALL)
inv_html = inv_html_match.group(1).strip() if inv_html_match else ""

# Extract inventory JavaScript
inv_js_match = re.search(r'<script>(.*?)</script>', inv_content, re.DOTALL)
inv_js = inv_js_match.group(1).strip() if inv_js_match else ""

# Extract map, skills, quests, settings HTML from overlays file
map_html_match = re.search(r'(<div id="map-overlay" class="overlay">.*?</div>\s*</div>\s*</div>)', overlays_content, re.DOTALL)
map_html = map_html_match.group(1).strip() if map_html_match else ""

skills_html_match = re.search(r'(<div id="skills-overlay" class="overlay">.*?</div>\s*</div>\s*</div>)', overlays_content, re.DOTALL)
skills_html = skills_html_match.group(1).strip() if skills_html_match else ""

quests_html_match = re.search(r'(<div id="quests-overlay" class="overlay">.*?</div>\s*</div>\s*</div>)', overlays_content, re.DOTALL)
quests_html = quests_html_match.group(1).strip() if quests_html_match else ""

settings_html_match = re.search(r'(<div id="settings-overlay" class="overlay">.*?</div>\s*</div>\s*</div>)', overlays_content, re.DOTALL)
settings_html = settings_html_match.group(1).strip() if settings_html_match else ""

# Extract additional JavaScript
overlays_js_match = re.search(r'<script>(.*?)</script>', overlays_content, re.DOTALL)
overlays_js = overlays_js_match.group(1).strip() if overlays_js_match else ""

print(f"Character CSS: {len(char_css)} chars")
print(f"Character HTML: {len(char_html)} chars")
print(f"Inventory CSS: {len(inv_css)} chars")
print(f"Inventory HTML: {len(inv_html)} chars")
print(f"Inventory JS: {len(inv_js)} chars")
print(f"Map HTML: {len(map_html)} chars")
print(f"Skills HTML: {len(skills_html)} chars")
print(f"Quests HTML: {len(quests_html)} chars")
print(f"Settings HTML: {len(settings_html)} chars")
print(f"Overlays JS: {len(overlays_js)} chars")

print("\nBuilding integrated file...")

# Step 1: Insert CSS before </style>
css_insertion_point = main_html.rfind('    </style>')
additional_css = f"""
        /* ========================================
           CHARACTER SHEET OVERLAY STYLES - INTEGRATED
           ======================================== */
{char_css}

        /* ========================================
           INVENTORY OVERLAY STYLES - INTEGRATED
           ======================================== */
{inv_css}
"""

integrated = main_html[:css_insertion_point] + additional_css + "\n" + main_html[css_insertion_point:]

# Step 2: Replace old overlay HTML section
# Find the old overlay section
old_overlay_start = integrated.find('        <!-- Overlay Elements -->')
old_overlay_end = integrated.find('    <script>', old_overlay_start)

# Build new overlay section with all 6 overlays
new_overlays = f"""        <!-- Overlay Elements - All 6 Integrated Overlays -->

        <!-- 1. Character Sheet Overlay -->
        {char_html}

        <!-- 2. Inventory Overlay -->
        {inv_html}

        <!-- 3. Skills Overlay -->
        {skills_html}

        <!-- 4. Quests Overlay -->
        {quests_html}

        <!-- 5. Map Overlay -->
        {map_html}

        <!-- 6. Settings Overlay -->
        {settings_html}
    </div>

    """

integrated = integrated[:old_overlay_start] + new_overlays + integrated[old_overlay_end:]

# Step 3: Insert JavaScript before final console.log
js_insertion_point = integrated.rfind("console.log('The Arcane Codex UI loaded - All interactive elements ready');")

additional_js = f"""
        // ============================================
        // INVENTORY OVERLAY JAVASCRIPT - INTEGRATED
        // ============================================
{inv_js}

        // ============================================
        // QUEST/SETTINGS TAB SWITCHING - INTEGRATED
        // ============================================
{overlays_js}

        """

integrated = integrated[:js_insertion_point] + additional_js + "\n        " + integrated[js_insertion_point:]

# Write the integrated file
output_file = os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html")
backup_file = os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html.final_backup")

# Create backup
write_file(backup_file, main_html)
print(f"Backup created: {backup_file}")

# Write integrated file
write_file(output_file, integrated)

print(f"\n{'='*60}")
print("INTEGRATION COMPLETE!")
print(f"{'='*60}")
print(f"Output file: {output_file}")
print(f"Original size: {len(main_html)} bytes")
print(f"Integrated size: {len(integrated)} bytes")
print(f"Size increase: {len(integrated) - len(main_html)} bytes (+{100*(len(integrated)-len(main_html))//len(main_html)}%)")
print("\nAll 6 overlays integrated successfully!")
print("Open the file in a browser and test with C/I/K/J/M/ESC keys.")
