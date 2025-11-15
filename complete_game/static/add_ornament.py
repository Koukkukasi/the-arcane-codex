import re

# Read the HTML file
with open('arcane_codex_scenario_ui_enhanced.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add ornament CSS after .game-title:hover
ornament_css = '''

        .hud-ornament {
            display: flex;
            align-items: center;
            opacity: 0.6;
        }

        .ornament-icon {
            width: 48px;
            height: 48px;
            background: radial-gradient(circle at 30% 30%, rgba(201, 169, 97, 0.2), transparent 60%),
                        linear-gradient(135deg, var(--bronze-light) 0%, var(--bronze-dark) 100%);
            border: 2px solid var(--bronze-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
        }'''

content = re.sub(
    r'(\.game-title:hover \{[^}]+\})',
    r'\1' + ornament_css,
    content,
    flags=re.DOTALL
)

# Add ornament HTML after game-title div
ornament_html = '''
            <div class="hud-ornament">
                <div class="ornament-icon">⚔️</div>
            </div>'''

content = re.sub(
    r'(<div class="game-title">THE ARCANE CODEX</div>)',
    r'\1' + ornament_html,
    content
)

# Write back
with open('arcane_codex_scenario_ui_enhanced.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("[OK] Decorative ornament added successfully")
