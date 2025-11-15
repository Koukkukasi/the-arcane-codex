// UI Updates - Load and refresh game state
// Auto-generated from monolithic HTML - duplicates removed


// displayConsequences
        function displayConsequences(data) {
            const narrativePanel = document.querySelector('.scene-narrative-panel');

            // Add consequence narrative
            if (data.consequence) {
                const consequenceDiv = document.createElement('div');
                consequenceDiv.className = 'narrative-text';
                consequenceDiv.style.marginTop = '20px';
                consequenceDiv.innerHTML = data.consequence;
                narrativePanel.appendChild(consequenceDiv);
            }

            // Add Divine Council header
            if (data.divineCouncil && data.divineCouncil.length > 0) {
                const councilHeader = document.createElement('div');
                councilHeader.className = 'act-header';
                councilHeader.style.marginTop = '25px';
                councilHeader.innerHTML = '⚖️ Divine Council Convenes';
                narrativePanel.appendChild(councilHeader);

                // Add each god's speech
                data.divineCouncil.forEach((godSpeech, index) => {
                    setTimeout(() => {
                        const speechDiv = document.createElement('div');
                        speechDiv.className = `god-speech ${godSpeech.god.toLowerCase()}`;
                        // XSS Fix: Safely construct god speech DOM
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
                        speechDiv.appendChild(godContent);
                        narrativePanel.appendChild(speechDiv);

                        // Scroll to show new content
                        speechDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, index * 800); // Stagger speeches for dramatic effect
                });
            }

            // Update game state if provided
            if (data.stateUpdates) {
                updateGameState(data.stateUpdates);
            }
        }

// loadCharacterStats
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

// loadCurrentScenario
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

// loadDivineFavor
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

// loadGameData
        async function loadGameData() {
            console.log('Loading game data from backend...');

            try {
                // Load all data in parallel for performance
                await Promise.all([
                    loadCharacterStats(),
                    loadInventoryData(),
                    loadDivineFavor(),
                    loadPartyTrust(),
                    loadNPCData(),
                    loadQuestData()
                ]);

                console.log('All game data loaded successfully');
            } catch (error) {
                console.error('Error loading game data:', error);
            }
        }

// loadInventory
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

                        // XSS Fix: Use safe DOM manipulation instead of innerHTML
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'item-icon';
                        iconDiv.textContent = getItemIcon(item.type);
                        slot.appendChild(iconDiv);

                        if (item.quantity > 1) {
                            const quantityDiv = document.createElement('div');
                            quantityDiv.className = 'item-quantity';
                            quantityDiv.textContent = item.quantity;
                            slot.appendChild(quantityDiv);
                        }

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

// loadNewScenario
        function loadNewScenario(scenarioData) {
            // Update narrative text
            // Update whispers
            // Update choices
            // Add Divine Council dialogue when choice is made
            console.log('Loading scenario:', scenarioData.theme);
        }

// loadQuests
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
                        // XSS Fix: Use safe DOM manipulation
                        const noQuestsDiv = document.createElement('div');
                        noQuestsDiv.className = 'no-quests';
                        noQuestsDiv.textContent = `No ${type} quests`;
                        questList.appendChild(noQuestsDiv);
                    } else {
                        data.quests.forEach(quest => {
                            const questItem = document.createElement('div');
                            questItem.className = 'quest-item';
                            questItem.setAttribute('data-quest-id', quest.id);

                            // XSS Fix: Use safe DOM manipulation
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
                            }

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

// updateCharacterDisplay
        function updateCharacterDisplay(data) {
            // Update character name
            const nameElements = document.querySelectorAll('.character-name');
            nameElements.forEach(el => el.textContent = data.name);

            // Update stat values
            if (data.stats) {
                const statMap = {
                    'strength': data.stats.strength,
                    'dexterity': data.stats.dexterity,
                    'constitution': data.stats.constitution,
                    'intelligence': data.stats.intelligence,
                    'wisdom': data.stats.wisdom,
                    'charisma': data.stats.charisma
                };

                Object.keys(statMap).forEach(stat => {
                    const statElement = document.querySelector(`.stat-${stat} .stat-value`);
                    if (statElement) {
                        statElement.textContent = statMap[stat];
                    }
                });
            }

            // Update HP display
            if (data.hp) {
                const hpElements = document.querySelectorAll('.hp-value');
                hpElements.forEach(el => {
                    el.textContent = `${data.hp.current}/${data.hp.max}`;
                });
            }

            console.log('Character display updated');
        }

// updateDivineFavorDisplay
        function updateDivineFavorDisplay(favorData) {
            Object.keys(favorData).forEach(god => {
                const value = favorData[god];
                const percentage = Math.max(0, Math.min(100, ((value + 50) / 100) * 100));

                // Update bar width
                const barElement = document.querySelector(`.${god}-bar`);
                if (barElement) {
                    barElement.style.width = `${percentage}%`;
                }

                // Update value display
                const valueElement = barElement?.parentElement?.querySelector('.divine-value');
                if (valueElement) {
                    valueElement.textContent = value > 0 ? `+${value}` : value;
                    valueElement.classList.toggle('negative', value < 0);
                }
            });

            console.log('Divine favor display updated');
        }

// updateGameState
        function updateGameState(updates) {
            // Update trust if changed
            if (updates.trust !== undefined) {
                console.log('Trust updated to:', updates.trust);
                // Update trust bar visualization (if implemented)
            }

            // Update divine favor if changed
            if (updates.divineFavor) {
                console.log('Divine favor updated:', updates.divineFavor);
                // Update divine favor bars (if implemented)
            }

            // Update NPC approval if changed
            if (updates.npcApproval) {
                console.log('NPC approval updated:', updates.npcApproval);
                // Update NPC status (if implemented)
            }
        }

// updateInventoryDisplay
        function updateInventoryDisplay(data) {
            // Update inventory grid (when implemented)
            console.log('Inventory data loaded:', data);

            // Update gold display
            if (data.gold !== undefined) {
                const goldElements = document.querySelectorAll('.gold-amount');
                goldElements.forEach(el => el.textContent = data.gold);
            }

            console.log('Inventory display updated');
        }

// updateNPCDisplay
        function updateNPCDisplay(npcData) {
            console.log('NPC data loaded:', npcData);

            // This would update party member cards in the UI
            npcData.npcs.forEach((npc, index) => {
                const memberCard = document.querySelectorAll('.party-member')[index];
                if (memberCard) {
                    const hpElement = memberCard.querySelector('.member-hp');
                    if (hpElement) {
                        hpElement.textContent = `${npc.hp.current}/${npc.hp.max}`;
                    }
                }
            });

            console.log('NPC display updated');
        }

// updateQuestDisplay
        function updateQuestDisplay(questData) {
            console.log('Quest data loaded:', questData);
            // This would populate the quest overlay with active quests
            console.log('Quest display updated');
        }

// updateTrustDisplay
        function updateTrustDisplay(trustData) {
            // Update trust bar (when implemented in UI)
            console.log('Trust data loaded:', trustData);

            // This would update a trust bar visualization
            const trustElements = document.querySelectorAll('.trust-value');
            trustElements.forEach(el => {
                el.textContent = `${trustData.trust}%`;
            });

            console.log('Trust display updated');
        }