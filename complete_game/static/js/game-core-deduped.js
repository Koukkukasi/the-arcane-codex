// Game Core - Main game logic and state management
// Auto-generated from monolithic HTML - duplicates removed


// activateSlot
        function activateSlot(slotNumber, slotElement) {
            // Check if slot is on cooldown
            if (slotElement.classList.contains('on-cooldown')) {
                console.log(`Slot ${slotNumber} is on cooldown`);

                // Shake animation for cooldown feedback
                slotElement.style.animation = 'shake 0.3s';
                setTimeout(() => {
                    slotElement.style.animation = '';
                }, 300);
                return;
            }

            // Get slot data
            const slotEmoji = slotElement.textContent.trim();
            const slotKey = slotElement.dataset.key || slotNumber;

            console.log(`Activating slot ${slotNumber} (${slotEmoji})`);

            // Simulate ability activation
            showAbilityActivation(slotNumber, slotEmoji);

            // Apply cooldown (example: 3 seconds)
            applyCooldown(slotElement, 3000);

            // POST to backend if needed for game state updates
            // fetch('/api/ability/activate', {...})
        }

// applyCooldown
        function applyCooldown(slotElement, duration) {
            slotElement.classList.add('on-cooldown');
            slotElement.style.opacity = '0.5';
            slotElement.style.filter = 'grayscale(1)';
            slotElement.style.pointerEvents = 'none';

            // Cooldown overlay
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.style.cssText = `
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Cinzel', serif;
                font-size: 24px;
                color: #CD5C5C;
                font-weight: 700;
                animation: cooldownFade ${duration}ms linear;
            `;

            let remainingSeconds = Math.ceil(duration / 1000);
            cooldownOverlay.textContent = remainingSeconds;
            slotElement.appendChild(cooldownOverlay);

            // Update countdown every second
            const countdownInterval = setInterval(() => {
                remainingSeconds--;
                if (remainingSeconds > 0) {
                    cooldownOverlay.textContent = remainingSeconds;
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // Remove cooldown after duration
            setTimeout(() => {
                slotElement.classList.remove('on-cooldown');
                slotElement.style.opacity = '';
                slotElement.style.filter = '';
                slotElement.style.pointerEvents = '';
                cooldownOverlay.remove();
            }, duration);
        }

// startGameStatePolling
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

// submitChoice
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