#!/usr/bin/env python3
"""
XSS Vulnerability Fix Script
Fixes all innerHTML XSS vulnerabilities in arcane_codex_scenario_ui_enhanced.html
"""

import re
import sys
from pathlib import Path

def fix_inventory_item_rendering(content):
    """Fix XSS in inventory item rendering (4 instances)"""
    old_pattern = r'''                        slot\.innerHTML = `
                            <div class="item-icon">\$\{getItemIcon\(item\.type\)\}</div>
                            \$\{item\.quantity > 1 \? `<div class="item-quantity">\$\{item\.quantity\}</div>` : ''\}
                        `;'''

    new_code = '''                        // XSS Fix: Use safe DOM manipulation instead of innerHTML
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'item-icon';
                        iconDiv.textContent = getItemIcon(item.type);
                        slot.appendChild(iconDiv);

                        if (item.quantity > 1) {
                            const quantityDiv = document.createElement('div');
                            quantityDiv.className = 'item-quantity';
                            quantityDiv.textContent = item.quantity;
                            slot.appendChild(quantityDiv);
                        }'''

    count = len(re.findall(old_pattern, content))
    content = re.sub(old_pattern, new_code, content)
    return content, count, "inventory item rendering"


def fix_quest_no_quests(content):
    """Fix XSS in 'No quests' message (4 instances)"""
    old_pattern = r'''                        questList\.innerHTML = `<div class="no-quests">No \$\{type\} quests</div>`;'''

    new_code = '''                        // XSS Fix: Use safe DOM manipulation
                        const noQuestsDiv = document.createElement('div');
                        noQuestsDiv.className = 'no-quests';
                        noQuestsDiv.textContent = `No ${type} quests`;
                        questList.appendChild(noQuestsDiv);'''

    count = len(re.findall(old_pattern, content))
    content = re.sub(old_pattern, new_code, content)
    return content, count, "'No quests' message"


def fix_quest_item_rendering(content):
    """Fix XSS in quest item rendering with progress bar (4 instances)"""
    old_pattern = r'''                            questItem\.innerHTML = `
                                <div class="quest-title">\$\{quest\.name\}</div>
                                <div class="quest-description">\$\{quest\.description\}</div>
                                \$\{quest\.progress !== undefined \? `
                                    <div class="quest-progress-bar">
                                        <div class="quest-progress-fill" style="width: \$\{quest\.progress\}%"></div>
                                    </div>
                                ` : ''\}
                            `;'''

    new_code = '''                            // XSS Fix: Use safe DOM manipulation
                            const titleDiv = document.createElement('div');
                            titleDiv.className = 'quest-title';
                            titleDiv.textContent = quest.name;
                            questItem.appendChild(titleDiv);

                            const descDiv = document.createElement('div');
                            descDiv.className = 'quest-description';
                            descDiv.textContent = quest.description;
                            questItem.appendChild(descDiv);

                            if (quest.progress !== undefined) {
                                const progressBarDiv = document.createElement('div');
                                progressBarDiv.className = 'quest-progress-bar';

                                const progressFillDiv = document.createElement('div');
                                progressFillDiv.className = 'quest-progress-fill';
                                progressFillDiv.style.width = `${quest.progress}%`;

                                progressBarDiv.appendChild(progressFillDiv);
                                questItem.appendChild(progressBarDiv);
                            }'''

    count = len(re.findall(old_pattern, content))
    content = re.sub(old_pattern, new_code, content)
    return content, count, "quest item rendering"


def fix_consequence_display(content):
    """Fix CRITICAL XSS in consequence display (1 instance)"""
    old_pattern = r'''                consequenceDiv\.innerHTML = data\.consequence;'''
    new_code = '''                // XSS Fix: Use textContent to prevent script injection
                consequenceDiv.textContent = data.consequence;'''

    count = len(re.findall(old_pattern, content))
    content = re.sub(old_pattern, new_code, content)
    return content, count, "consequence display"


def fix_council_header(content):
    """Fix XSS in Divine Council header (1 instance)"""
    old_pattern = r'''                councilHeader\.innerHTML = '⚖️ Divine Council Convenes';'''
    new_code = '''                // XSS Fix: Use textContent
                councilHeader.textContent = '⚖️ Divine Council Convenes';'''

    count = len(re.findall(old_pattern, content))
    content = re.sub(old_pattern, new_code, content)
    return content, count, "Divine Council header"


def fix_loading_indicator(content):
    """Fix XSS in loading indicator (1 instance)"""
    old_pattern = r'''                loadingDiv\.innerHTML = '⏳ Processing your choice\.\.\.';'''
    new_code = '''                // XSS Fix: Use textContent
                loadingDiv.textContent = '⏳ Processing your choice...';'''

    count = len(re.findall(old_pattern, content))
    content = re.sub(old_pattern, new_code, content)
    return content, count, "loading indicator"


def fix_details_placeholder(content):
    """Fix XSS in details placeholder (1 instance)"""
    old_pattern = r'''            detailsContent\.innerHTML = '<p class="details-placeholder">Hover over an item to view details</p>';'''
    new_code = '''            // XSS Fix: Use safe DOM manipulation
            detailsContent.innerHTML = ''; // Clear first
            const placeholderP = document.createElement('p');
            placeholderP.className = 'details-placeholder';
            placeholderP.textContent = 'Hover over an item to view details';
            detailsContent.appendChild(placeholderP);'''

    count = len(re.findall(old_pattern, content))
    content = re.sub(old_pattern, new_code, content)
    return content, count, "details placeholder"


def fix_party_member_panel(content):
    """Fix HIGH severity XSS in party member details panel (1 instance)"""
    # This is a complex multi-line innerHTML assignment
    # Find the start and end markers
    start_marker = r'            panel\.innerHTML = `'
    end_marker = r'            `;'

    # We need to find lines 13468-13543 and replace the entire block
    # Using a more targeted regex that captures the whole template literal
    old_pattern = r'''            panel\.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="font-family: 'Cinzel', serif; font-size: 32px; color: #D4AF37; margin: 0;">
                        \$\{memberData\.emoji\} \$\{memberData\.name\}
                    </h2>
                    <button class="close-details-btn" style="
                        background: rgba\(205, 92, 92, 0\.3\);
                        border: 2px solid #CD5C5C;
                        color: #CD5C5C;
                        font-size: 24px;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: all 0\.3s ease;
                    ">\u2715</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Role
                    </div>
                    <div style="font-family: 'Yrsa', serif; font-size: 20px; color: #D4AF37;">
                        \$\{memberData\.role\}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Health
                    </div>
                    <div style="
                        background: rgba\(0, 0, 0, 0\.5\);
                        border: 2px solid #8B7355;
                        border-radius: 8px;
                        padding: 8px;
                        font-family: 'Yrsa', serif;
                        font-size: 18px;
                        color: #90EE90;
                    ">
                        \u2764\ufe0f \$\{memberData\.hp\}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Equipment
                    </div>
                    <div style="display: grid; grid-template-columns: repeat\(2, 1fr\); gap: 10px;">
                        <div style="background: rgba\(0, 0, 0, 0\.5\); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;">
                            \u2694\ufe0f Weapon
                        </div>
                        <div style="background: rgba\(0, 0, 0, 0\.5\); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;">
                            \U0001f6e1\ufe0f Armor
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Active Effects
                    </div>
                    <div style="
                        background: rgba\(139, 69, 139, 0\.2\);
                        border: 2px solid #8B458B;
                        border-radius: 6px;
                        padding: 12px;
                        font-family: 'Yrsa', serif;
                        font-size: 16px;
                        color: #DA70D6;
                        font-style: italic;
                    ">
                        \u2728 No active effects
                    </div>
                </div>
            `;'''

    new_code = '''            // XSS Fix: Build panel safely using createElement
            // NOTE: This prevents XSS from memberData.name, memberData.emoji, memberData.role, memberData.hp

            // Header with name and close button
            const headerDiv = document.createElement('div');
            headerDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;';

            const h2 = document.createElement('h2');
            h2.style.cssText = "font-family: 'Cinzel', serif; font-size: 32px; color: #D4AF37; margin: 0;";
            h2.textContent = (memberData.emoji || '') + ' ' + (memberData.name || 'Unknown');

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-details-btn';
            closeBtn.style.cssText = `background: rgba(205, 92, 92, 0.3); border: 2px solid #CD5C5C; color: #CD5C5C; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;`;
            closeBtn.textContent = '✕';

            headerDiv.appendChild(h2);
            headerDiv.appendChild(closeBtn);
            panel.appendChild(headerDiv);

            // Role section
            const roleContainer = document.createElement('div');
            roleContainer.style.marginBottom = '20px';

            const roleLabel = document.createElement('div');
            roleLabel.style.cssText = "font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;";
            roleLabel.textContent = 'Role';

            const roleValue = document.createElement('div');
            roleValue.style.cssText = "font-family: 'Yrsa', serif; font-size: 20px; color: #D4AF37;";
            roleValue.textContent = memberData.role || 'Unknown';

            roleContainer.appendChild(roleLabel);
            roleContainer.appendChild(roleValue);
            panel.appendChild(roleContainer);

            // Health section
            const healthContainer = document.createElement('div');
            healthContainer.style.marginBottom = '20px';

            const healthLabel = document.createElement('div');
            healthLabel.style.cssText = "font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;";
            healthLabel.textContent = 'Health';

            const healthValue = document.createElement('div');
            healthValue.style.cssText = 'background: rgba(0, 0, 0, 0.5); border: 2px solid #8B7355; border-radius: 8px; padding: 8px; font-family: "Yrsa", serif; font-size: 18px; color: #90EE90;';
            healthValue.textContent = '❤️ ' + (memberData.hp || 0);

            healthContainer.appendChild(healthLabel);
            healthContainer.appendChild(healthValue);
            panel.appendChild(healthContainer);

            // Equipment section
            const equipContainer = document.createElement('div');
            equipContainer.style.marginBottom = '20px';

            const equipLabel = document.createElement('div');
            equipLabel.style.cssText = "font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;";
            equipLabel.textContent = 'Equipment';

            const equipGrid = document.createElement('div');
            equipGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;';

            const weaponDiv = document.createElement('div');
            weaponDiv.style.cssText = 'background: rgba(0, 0, 0, 0.5); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;';
            weaponDiv.textContent = '⚔️ Weapon';

            const armorDiv = document.createElement('div');
            armorDiv.style.cssText = 'background: rgba(0, 0, 0, 0.5); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;';
            armorDiv.textContent = '🛡️ Armor';

            equipGrid.appendChild(weaponDiv);
            equipGrid.appendChild(armorDiv);
            equipContainer.appendChild(equipLabel);
            equipContainer.appendChild(equipGrid);
            panel.appendChild(equipContainer);

            // Active Effects section
            const effectsContainer = document.createElement('div');
            effectsContainer.style.marginBottom = '20px';

            const effectsLabel = document.createElement('div');
            effectsLabel.style.cssText = "font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;";
            effectsLabel.textContent = 'Active Effects';

            const effectsValue = document.createElement('div');
            effectsValue.style.cssText = 'background: rgba(139, 69, 139, 0.2); border: 2px solid #8B458B; border-radius: 6px; padding: 12px; font-family: "Yrsa", serif; font-size: 16px; color: #DA70D6; font-style: italic;';
            effectsValue.textContent = '✨ No active effects';

            effectsContainer.appendChild(effectsLabel);
            effectsContainer.appendChild(effectsValue);
            panel.appendChild(effectsContainer);'''

    count = len(re.findall(old_pattern, content, re.MULTILINE | re.DOTALL))
    content = re.sub(old_pattern, new_code, content, flags=re.MULTILINE | re.DOTALL)
    return content, count, "party member panel (CRITICAL)"


def main():
    file_path = Path(__file__).parent / 'static' / 'arcane_codex_scenario_ui_enhanced.html'

    print("=" * 80)
    print("XSS VULNERABILITY FIX SCRIPT")
    print("=" * 80)
    print(f"Target file: {file_path}")
    print()

    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_size = len(content)
    print(f"Original file size: {original_size:,} bytes")
    print()

    # Apply all fixes
    fixes = [
        fix_inventory_item_rendering,
        fix_quest_no_quests,
        fix_quest_item_rendering,
        fix_consequence_display,
        fix_council_header,
        fix_loading_indicator,
        fix_details_placeholder,
        fix_party_member_panel
    ]

    total_fixes = 0
    print("Applying fixes:")
    print("-" * 80)

    for fix_func in fixes:
        content, count, description = fix_func(content)
        total_fixes += count
        status = "[FIXED]" if count > 0 else "[NOT FOUND]"
        print(f"{status:12} | {count} instance(s) | {description}")

    print("-" * 80)
    print(f"Total fixes applied: {total_fixes}")
    print()

    # Verify no unhandled innerHTML assignments remain
    remaining_innerHTML = len(re.findall(r'\.innerHTML\s*=\s*[^\'"]', content))
    remaining_innerHTML += len(re.findall(r'''\.innerHTML\s*=\s*`[^`]*\$\{''', content))

    # Count safe innerHTML clears
    safe_clears = len(re.findall(r'''\.innerHTML\s*=\s*['"]{2}''', content))

    print(f"Remaining unsafe innerHTML assignments: {remaining_innerHTML}")
    print(f"Safe innerHTML clears (= ''): {safe_clears}")
    print()

    if remaining_innerHTML > 0:
        print("WARNING: Some innerHTML assignments were not fixed!")
        print("Manual review required.")
    else:
        print("SUCCESS: All unsafe innerHTML assignments have been fixed!")

    # Write fixed file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    new_size = len(content)
    print()
    print(f"New file size: {new_size:,} bytes")
    print(f"Size difference: {new_size - original_size:+,} bytes")
    print()
    print("=" * 80)
    print("FIX COMPLETE!")
    print("=" * 80)


if __name__ == '__main__':
    main()
