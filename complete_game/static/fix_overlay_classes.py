#!/usr/bin/env python3
"""Fix overlay classes to ensure consistency"""

# Read the HTML file
with open('arcane_codex_scenario_ui_enhanced_visual.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix overlay classes - ensure all overlays use 'game-overlay' class
replacements = [
    ('class="overlay character-sheet-overlay"', 'class="game-overlay character-sheet-overlay"'),
    ('class="overlay"', 'class="game-overlay"'),
    ('id="skills-overlay" class="overlay"', 'id="skills-overlay" class="game-overlay"'),
    ('id="quests-overlay" class="overlay"', 'id="quests-overlay" class="game-overlay"'),
    ('id="map-overlay" class="overlay"', 'id="map-overlay" class="game-overlay"'),
    ('id="settings-overlay" class="overlay"', 'id="settings-overlay" class="game-overlay"'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write the updated content back
with open('arcane_codex_scenario_ui_enhanced_visual.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Overlay classes fixed successfully!")