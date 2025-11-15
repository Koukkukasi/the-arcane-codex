#!/usr/bin/env python3
"""Add enhanced CSS link to HTML file"""

# Read the HTML file
with open('arcane_codex_scenario_ui_enhanced_visual.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the CSS link before </head>
css_link = """    <!-- Enhanced Dark Fantasy Overlay Styles -->
    <link rel="stylesheet" href="enhanced_overlay_styles.css">
</head>"""

content = content.replace('</head>', css_link)

# Write the updated content back
with open('arcane_codex_scenario_ui_enhanced_visual.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS link added successfully!")