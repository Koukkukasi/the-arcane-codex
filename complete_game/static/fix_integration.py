#!/usr/bin/env python3
"""
Fix integration by properly extracting complete HTML sections.
"""

import os

BASE_DIR = "C:/Users/ilmiv/ProjectArgent/complete_game/static"

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def extract_complete_div(content, start_pattern):
    """
    Extract a complete div section by counting opening/closing tags.
    """
    start_idx = content.find(start_pattern)
    if start_idx == -1:
        return ""

    # Count div tags to find the matching closing tag
    div_count = 0
    i = start_idx

    while i < len(content):
        if content[i:i+4] == '<div':
            div_count += 1
        elif content[i:i+6] == '</div>':
            div_count -= 1
            if div_count == 0:
                # Found the matching closing tag
                return content[start_idx:i+6]
        i += 1

    return ""

print("Reading overlay files...")

# Read source files
char_content = read_file(os.path.join(BASE_DIR, "character_sheet_overlay.html"))
inv_content = read_file(os.path.join(BASE_DIR, "inventory_overlay.html"))
overlays_content = read_file(os.path.join(BASE_DIR, "OVERLAY_IMPLEMENTATIONS.html"))

print("Extracting complete HTML sections...")

# Extract complete div sections
char_html = extract_complete_div(char_content, '<div id="character-overlay"')
inv_html = extract_complete_div(inv_content, '<div id="inventory-overlay"')
map_html = extract_complete_div(overlays_content, '<div id="map-overlay"')
skills_html = extract_complete_div(overlays_content, '<div id="skills-overlay"')
quests_html = extract_complete_div(overlays_content, '<div id="quests-overlay"')
settings_html = extract_complete_div(overlays_content, '<div id="settings-overlay"')

print(f"Character HTML: {len(char_html)} chars")
print(f"Inventory HTML: {len(inv_html)} chars")
print(f"Map HTML: {len(map_html)} chars")
print(f"Skills HTML: {len(skills_html)} chars")
print(f"Quests HTML: {len(quests_html)} chars")
print(f"Settings HTML: {len(settings_html)} chars")

# Extract CSS (no change needed)
import re

char_css_match = re.search(r'<style>(.*?)</style>', char_content, re.DOTALL)
char_css = char_css_match.group(1).strip() if char_css_match else ""

inv_css_match = re.search(r'<style>(.*?)</style>', inv_content, re.DOTALL)
inv_css = inv_css_match.group(1).strip() if inv_css_match else ""

# Extract JavaScript
inv_js_match = re.search(r'<script>(.*?)</script>', inv_content, re.DOTALL)
inv_js = inv_js_match.group(1).strip() if inv_js_match else ""

overlays_js_match = re.search(r'<script>(.*?)</script>', overlays_content, re.DOTALL)
overlays_js = overlays_js_match.group(1).strip() if overlays_js_match else ""

print("\nReading main HTML file...")
main_html = read_file(os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html.final_backup"))

print("Building integrated file...")

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
old_overlay_start = integrated.find('        <!-- Overlay Elements -->')
old_overlay_end = integrated.find('    <script>', old_overlay_start)

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

# Step 3: Insert JavaScript
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

# Validate tag counts
opening_divs = integrated.count('<div')
closing_divs = integrated.count('</div>')

print(f"\nValidation:")
print(f"  Opening <div> tags: {opening_divs}")
print(f"  Closing </div> tags: {closing_divs}")
print(f"  Difference: {opening_divs - closing_divs}")

if opening_divs == closing_divs:
    print("  Tag balance: OK")
else:
    print(f"  WARNING: {opening_divs - closing_divs} unmatched div tags!")

# Write output
output_file = os.path.join(BASE_DIR, "arcane_codex_scenario_ui_enhanced.html")
write_file(output_file, integrated)

print(f"\nIntegration complete!")
print(f"Output file: {output_file}")
print(f"File size: {len(integrated)} bytes")
print(f"Line count: {integrated.count(chr(10)) + 1}")
