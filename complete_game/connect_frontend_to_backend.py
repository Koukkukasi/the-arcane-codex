#!/usr/bin/env python3
"""
Phase D: Connect Frontend to Backend
Updates the HTML file to use the new API endpoints
"""

import re

def connect_frontend():
    """Connect frontend JavaScript to backend API endpoints"""

    html_file = 'static/arcane_codex_scenario_ui_enhanced.html'

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Backup first
    with open(html_file + '.backup_phase_d_frontend', 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] Backup created: arcane_codex_scenario_ui_enhanced.html.backup_phase_d_frontend")

    # Add backend integration code before the UX initialization
    backend_integration_code = '''
        // === PHASE D: Backend Integration ===

        // API helper function with error handling
        async function apiCall(endpoint, options = {}) {
            try {
                const response = await fetchWithCSRF(endpoint, options);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`API Error [${endpoint}]:`, error);
                throw error;
            }
        }

        // Load character stats for character sheet overlay
        async function loadCharacterStats() {
            try {
                gameUX.showLoading('Loading character data...');

                const data = await apiCall('/api/character/stats');

                // Update character sheet UI
                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update stats
                const stats = data.stats;
                for (const [stat, value] of Object.entries(stats)) {
                    const statElement = charOverlay.querySelector(`[data-stat="${stat}"]`);
                    if (statElement) {
                        statElement.textContent = value;
                    }
                }

                // Update level
                const levelBadge = charOverlay.querySelector('.level-badge');
                if (levelBadge) levelBadge.textContent = `Level ${data.level}`;

                // Update XP bar
                const xpBar = charOverlay.querySelector('.xp-fill');
                if (xpBar) {
                    const xpPercent = (data.xp / data.xp_to_next) * 100;
                    xpBar.style.width = `${xpPercent}%`;
                }

                // Update HP
                const hpText = charOverlay.querySelector('.hp-text');
                if (hpText) hpText.textContent = `${data.hp} / ${data.max_hp}`;

                // Update class
                const className = charOverlay.querySelector('.character-class');
                if (className) className.textContent = data.class;

                gameUX.hideLoading();
                console.log('[Phase D] Character stats loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load character stats:', error);
            }
        }

        // Load divine favor for character sheet
        async function loadDivineFavor() {
            try {
                const data = await apiCall('/api/character/divine_favor');

                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update favor bars for each god
                const favor = data.favor;
                for (const [godName, favorValue] of Object.entries(favor)) {
                    const favorBar = charOverlay.querySelector(`[data-god="${godName}"] .favor-bar-fill`);
                    if (favorBar) {
                        // Favor ranges from -100 to 100, normalize to 0-100%
                        const favorPercent = ((favorValue + 100) / 200) * 100;
                        favorBar.style.width = `${favorPercent}%`;

                        // Color based on favor level
                        if (favorValue > 50) favorBar.style.background = '#4CAF50'; // Green
                        else if (favorValue < -50) favorBar.style.background = '#F44336'; // Red
                        else favorBar.style.background = '#FFC107'; // Amber
                    }

                    const favorText = charOverlay.querySelector(`[data-god="${godName}"] .favor-value`);
                    if (favorText) favorText.textContent = favorValue;
                }

                console.log('[Phase D] Divine favor loaded');

            } catch (error) {
                console.error('Failed to load divine favor:', error);
            }
        }

        // Load inventory for inventory overlay
        async function loadInventory() {
            try {
                gameUX.showLoading('Loading inventory...');

                const data = await apiCall('/api/inventory/all');

                const invOverlay = document.getElementById('inventory-overlay');
                if (!invOverlay) return;

                // Update inventory grid
                const inventoryGrid = invOverlay.querySelector('.inventory-grid');
                if (inventoryGrid) {
                    inventoryGrid.innerHTML = ''; // Clear existing

                    // Add items
                    data.items.forEach(item => {
                        const slot = document.createElement('div');
                        slot.className = 'inventory-slot';
                        if (item.equipped) slot.classList.add('equipped');
                        slot.setAttribute('data-item-id', item.id);
                        slot.setAttribute('data-tooltip', item.description);

                        slot.innerHTML = `
                            <div class="item-icon">${getItemIcon(item.type)}</div>
                            ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
                        `;

                        inventoryGrid.appendChild(slot);
                    });

                    // Fill empty slots
                    const emptySlots = 48 - data.items.length;
                    for (let i = 0; i < emptySlots; i++) {
                        const emptySlot = document.createElement('div');
                        emptySlot.className = 'inventory-slot empty';
                        inventoryGrid.appendChild(emptySlot);
                    }
                }

                // Update gold
                const goldDisplay = invOverlay.querySelector('.gold-amount');
                if (goldDisplay) goldDisplay.textContent = data.gold;

                // Update weight
                const weightDisplay = invOverlay.querySelector('.weight-display');
                if (weightDisplay) {
                    weightDisplay.textContent = `${data.weight} / ${data.max_weight}`;
                }

                gameUX.hideLoading();
                console.log('[Phase D] Inventory loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load inventory:', error);
            }
        }

        // Helper function to get item icon emoji
        function getItemIcon(itemType) {
            const icons = {
                'weapon': '⚔️',
                'armor': '🛡️',
                'potion': '🧪',
                'scroll': '📜',
                'food': '🍖',
                'quest': '📋',
                'treasure': '💎',
                'default': '📦'
            };
            return icons[itemType] || icons.default;
        }

        // Load quests for quest overlay
        async function loadQuests(type = 'active') {
            try {
                gameUX.showLoading(`Loading ${type} quests...`);

                const endpoint = type === 'active' ? '/api/quests/active' : '/api/quests/completed';
                const data = await apiCall(endpoint);

                const questOverlay = document.getElementById('quests-overlay');
                if (!questOverlay) return;

                const questList = questOverlay.querySelector('.quest-list');
                if (questList) {
                    questList.innerHTML = ''; // Clear existing

                    if (data.quests.length === 0) {
                        questList.innerHTML = `<div class="no-quests">No ${type} quests</div>`;
                    } else {
                        data.quests.forEach(quest => {
                            const questItem = document.createElement('div');
                            questItem.className = 'quest-item';
                            questItem.setAttribute('data-quest-id', quest.id);

                            questItem.innerHTML = `
                                <div class="quest-title">${quest.name}</div>
                                <div class="quest-description">${quest.description}</div>
                                ${quest.progress !== undefined ? `
                                    <div class="quest-progress-bar">
                                        <div class="quest-progress-fill" style="width: ${quest.progress}%"></div>
                                    </div>
                                ` : ''}
                            `;

                            questList.appendChild(questItem);
                        });
                    }
                }

                gameUX.hideLoading();
                console.log(`[Phase D] ${type} quests loaded`);

            } catch (error) {
                gameUX.hideLoading();
                console.error(`Failed to load ${type} quests:`, error);
            }
        }

        // Load current scenario
        async function loadCurrentScenario() {
            try {
                gameUX.showLoading('Loading scenario...');

                const data = await apiCall('/api/current_scenario');

                // Update scenario title
                const titleElement = document.querySelector('.scenario-title');
                if (titleElement) titleElement.textContent = data.title || 'The Adventure Begins';

                // Update scenario description
                const descElement = document.querySelector('.scenario-description');
                if (descElement) descElement.textContent = data.description || 'Your journey awaits...';

                // Update choices
                const choicesContainer = document.querySelector('.choices-container');
                if (choicesContainer && data.choices) {
                    choicesContainer.innerHTML = '';

                    data.choices.forEach((choice, index) => {
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.textContent = choice.text;
                        button.onclick = () => submitChoice(choice.id);
                        choicesContainer.appendChild(button);
                    });
                }

                gameUX.hideLoading();
                console.log('[Phase D] Current scenario loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load scenario:', error);
            }
        }

        // Submit player choice
        async function submitChoice(choiceId) {
            try {
                gameUX.showLoading('Processing your choice...');

                const data = await apiCall('/api/make_choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ choice: choiceId })
                });

                // Show consequences
                if (data.consequence) {
                    const narrativePanel = document.querySelector('.scene-narrative-panel');
                    if (narrativePanel) {
                        const consequenceDiv = document.createElement('div');
                        consequenceDiv.className = 'narrative-text consequence';
                        consequenceDiv.textContent = data.consequence;
                        narrativePanel.appendChild(consequenceDiv);
                    }
                }

                // Check for level up
                if (data.level_up) {
                    gameUX.celebrate('levelup', { level: data.new_level });
                }

                // Check for quest completion
                if (data.quest_completed) {
                    gameUX.celebrate('quest', { quest: data.quest_name });
                }

                // Reload scenario for next turn
                await loadCurrentScenario();

                gameUX.hideLoading();
                console.log('[Phase D] Choice submitted successfully');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to submit choice:', error);
            }
        }

        // Auto-refresh game state periodically
        function startGameStatePolling() {
            setInterval(async () => {
                try {
                    const data = await apiCall('/api/game_state');

                    // Update health bar
                    const hpBar = document.querySelector('.hp-bar-fill');
                    if (hpBar && data.character) {
                        const hpPercent = (data.character.hp / data.character.max_hp) * 100;
                        hpBar.style.width = `${hpPercent}%`;
                    }

                    // Update level display
                    const levelDisplay = document.querySelector('.player-level');
                    if (levelDisplay && data.character) {
                        levelDisplay.textContent = `Lv. ${data.character.level}`;
                    }

                } catch (error) {
                    // Silent fail for polling errors
                }
            }, 5000); // Poll every 5 seconds
        }

        // Hook into overlay open events
        document.addEventListener('DOMContentLoaded', () => {
            // Load character data when character overlay opens
            const charButton = document.querySelector('[data-overlay="character-overlay"]');
            if (charButton) {
                charButton.addEventListener('click', () => {
                    loadCharacterStats();
                    loadDivineFavor();
                });
            }

            // Load inventory when inventory overlay opens
            const invButton = document.querySelector('[data-overlay="inventory-overlay"]');
            if (invButton) {
                invButton.addEventListener('click', loadInventory);
            }

            // Load quests when quest overlay opens
            const questButton = document.querySelector('[data-overlay="quests-overlay"]');
            if (questButton) {
                questButton.addEventListener('click', () => loadQuests('active'));
            }

            // Quest tab switching
            const activeTab = document.querySelector('.quest-tab[data-tab="active"]');
            const completedTab = document.querySelector('.quest-tab[data-tab="completed"]');

            if (activeTab) activeTab.addEventListener('click', () => loadQuests('active'));
            if (completedTab) completedTab.addEventListener('click', () => loadQuests('completed'));

            // Load initial scenario
            loadCurrentScenario();

            // Start polling for game state updates
            startGameStatePolling();

            console.log('[Phase D] Frontend connected to backend');
        });
'''

    # Find the UX initialization and add backend integration before it
    ux_marker = '// === UX System Initialization (Phase B) ==='

    if ux_marker in content:
        content = content.replace(ux_marker, backend_integration_code + '\n        ' + ux_marker)

        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print("\n[OK] Frontend connected to backend:")
        print("  + Character stats loading")
        print("  + Divine favor loading")
        print("  + Inventory loading")
        print("  + Quests loading (active/completed)")
        print("  + Scenario loading")
        print("  + Choice submission")
        print("  + Auto game state polling (5s)")
        print("\nTotal integrations: 7 major features")

        return True
    else:
        print("[ERROR] Could not find insertion point in HTML")
        return False

def main():
    print("=" * 70)
    print("PHASE D: CONNECTING FRONTEND TO BACKEND")
    print("=" * 70)

    success = connect_frontend()

    if success:
        print("\n" + "=" * 70)
        print("SUCCESS: Frontend connected to backend!")
        print("=" * 70)
        print("\nThe UI will now:")
        print("  1. Load real character data when opening overlays")
        print("  2. Display actual inventory items")
        print("  3. Show active/completed quests")
        print("  4. Load scenarios from backend")
        print("  5. Submit choices to backend")
        print("  6. Auto-update game state every 5 seconds")
        print("  7. Trigger celebrations on game events")
        print("\nNext: Test the integration by starting the Flask server!")
        print("=" * 70)
    else:
        print("\n[FAIL] Integration failed")

    return success

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
