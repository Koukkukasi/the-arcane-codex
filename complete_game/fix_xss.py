#!/usr/bin/env python3
"""
XSS Vulnerability Fix Script
Fixes 3 critical XSS vulnerabilities in arcane_codex_scenario_ui_enhanced.html
"""

def fix_xss_vulnerabilities():
    file_path = 'static/arcane_codex_scenario_ui_enhanced.html'

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix 1: Line 6482 - Tooltip XSS via innerHTML
    # Replace: detailsContent.innerHTML = `<p>${tooltip}</p>`;
    # With safe DOM manipulation
    old_tooltip_code = '''        item.addEventListener('mouseenter', (e) => {
            const tooltip = item.getAttribute('data-tooltip');
            if (tooltip) {
                detailsContent.innerHTML = `<p>${tooltip}</p>`;
            }
        });

        item.addEventListener('mouseleave', () => {
            detailsContent.innerHTML = '<p class="details-placeholder">Hover over an item to view details</p>';
        });'''

    new_tooltip_code = '''        item.addEventListener('mouseenter', (e) => {
            const tooltip = item.getAttribute('data-tooltip');
            if (tooltip) {
                // XSS Fix: Use textContent instead of innerHTML
                const p = document.createElement('p');
                p.textContent = tooltip;
                detailsContent.innerHTML = ''; // Clear first
                detailsContent.appendChild(p);
            }
        });

        item.addEventListener('mouseleave', () => {
            detailsContent.innerHTML = '<p class="details-placeholder">Hover over an item to view details</p>';
        });'''

    content = content.replace(old_tooltip_code, new_tooltip_code)

    # Fix 2: Line 6054 - Error message XSS via error.message
    # Replace: errorDiv.innerHTML = `⚠️ <strong>Connection Error:</strong> Unable to process your choice. ${error.message}`;
    old_error_code = '''                errorDiv.innerHTML = `⚠️ <strong>Connection Error:</strong> Unable to process your choice. ${error.message}`;'''

    new_error_code = '''                // XSS Fix: Safely construct error message
                const errorIcon = document.createTextNode('⚠️ ');
                const errorLabel = document.createElement('strong');
                errorLabel.textContent = 'Connection Error:';
                const errorMessage = document.createTextNode(' Unable to process your choice. ' + error.message);
                errorDiv.appendChild(errorIcon);
                errorDiv.appendChild(errorLabel);
                errorDiv.appendChild(errorMessage);'''

    content = content.replace(old_error_code, new_error_code)

    # Fix 3: Lines 6085-6091 - God speech XSS via server-controlled content
    old_god_code = '''                        speechDiv.innerHTML = `
                            <img src="images/god_${godSpeech.god.toLowerCase()}.svg" alt="${godSpeech.god}" class="god-icon">
                            <div class="god-content">
                                <div class="god-name">${godSpeech.icon} ${godSpeech.god.toUpperCase()} SPEAKS</div>
                                <div class="god-text">"${godSpeech.speech}"</div>
                            </div>
                        `;'''

    new_god_code = '''                        // XSS Fix: Safely construct god speech DOM
                        const godImg = document.createElement('img');
                        godImg.src = 'images/god_' + encodeURIComponent(godSpeech.god.toLowerCase()) + '.svg';
                        godImg.alt = godSpeech.god;
                        godImg.className = 'god-icon';

                        const godContent = document.createElement('div');
                        godContent.className = 'god-content';

                        const godName = document.createElement('div');
                        godName.className = 'god-name';
                        godName.textContent = godSpeech.icon + ' ' + godSpeech.god.toUpperCase() + ' SPEAKS';

                        const godText = document.createElement('div');
                        godText.className = 'god-text';
                        godText.textContent = '"' + godSpeech.speech + '"';

                        godContent.appendChild(godName);
                        godContent.appendChild(godText);
                        speechDiv.appendChild(godImg);
                        speechDiv.appendChild(godContent);'''

    content = content.replace(old_god_code, new_god_code)

    # Write the fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] XSS vulnerabilities fixed successfully!")
    print("   - Fixed tooltip XSS at line ~6482")
    print("   - Fixed error message XSS at line ~6054")
    print("   - Fixed god speech XSS at lines ~6085-6091")
    print(f"   - Backup created at {file_path}.backup_xss_fix")

if __name__ == '__main__':
    fix_xss_vulnerabilities()
