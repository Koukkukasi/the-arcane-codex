// Overlay Management - Modal windows and popups
// Auto-generated from monolithic HTML - duplicates removed


// closeAllOverlays
        function closeAllOverlays() {
            const overlays = document.querySelectorAll('.game-overlay.active, .overlay.active');
            overlays.forEach(overlay => {
                overlay.classList.remove('active');
            });
            activeOverlay = null;
            console.log('Closed all overlays');
        }

// openOverlay
        function openOverlay(overlayId) {
            // Close any existing open overlays
            closeAllOverlays();

            // Get the overlay element
            const overlay = document.getElementById(overlayId);
            if (overlay) {
                overlay.classList.add('active');
                activeOverlay = overlayId;
                console.log(`Opened overlay: ${overlayId}`);

                // Initialize map system when map overlay opens
                if (overlayId === 'map-overlay') {
                    // Give the overlay time to properly render and calculate dimensions
                    requestAnimationFrame(() => {
                        fantasyMapSystem.init();
                        console.log('Fantasy Map System initialized');
                    });
                }
            }
        }

// showAbilityActivation
        function showAbilityActivation(slotNumber, abilityName) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(139, 115, 85, 0.95));
                border: 3px solid #FFD700;
                border-radius: 10px;
                padding: 20px 40px;
                font-family: 'Cinzel', serif;
                font-size: 28px;
                color: #000;
                z-index: 9999;
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
                animation: abilityPop 0.6s ease;
            `;
            notification.textContent = `${abilityName} Activated!`;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -50%) scale(0.5)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 1000);
        }

// showDivineCouncilResponse
        function showDivineCouncilResponse(councilData) {
            // councilData contains god speeches and judgment
            // Animate god speech boxes appearing one by one
            const speeches = document.querySelectorAll('.god-speech');
            speeches.forEach((speech, index) => {
                setTimeout(() => {
                    speech.style.opacity = '0';
                    speech.style.transform = 'translateY(20px)';
                    speech.style.transition = 'all 0.5s ease';
                    setTimeout(() => {
                        speech.style.opacity = '1';
                        speech.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 200);
            });
        }

// showMemberDetails
        function showMemberDetails(memberData) {
            // Remove existing details panel if any
            const existing = document.querySelector('.member-details-modal');
            if (existing) {
                existing.remove();
            }

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'member-details-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;

            // Create panel
            const panel = document.createElement('div');
            panel.style.cssText = `
                background: linear-gradient(135deg, rgba(42, 36, 30, 0.98) 0%, rgba(26, 22, 18, 0.98) 100%);
                border: 3px solid #D4AF37;
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.3);
                animation: slideUp 0.3s ease;
            `;

            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="font-family: 'Cinzel', serif; font-size: 32px; color: #D4AF37; margin: 0;">
                        ${memberData.emoji} ${memberData.name}
                    </h2>
                    <button class="close-details-btn" style="
                        background: rgba(205, 92, 92, 0.3);
                        border: 2px solid #CD5C5C;
                        color: #CD5C5C;
                        font-size: 24px;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">✕</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Role
                    </div>
                    <div style="font-family: 'Yrsa', serif; font-size: 20px; color: #D4AF37;">
                        ${memberData.role}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Health
                    </div>
                    <div style="
                        background: rgba(0, 0, 0, 0.5);
                        border: 2px solid #8B7355;
                        border-radius: 8px;
                        padding: 8px;
                        font-family: 'Yrsa', serif;
                        font-size: 18px;
                        color: #90EE90;
                    ">
                        ❤️ ${memberData.hp}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Equipment
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <div style="background: rgba(0, 0, 0, 0.5); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;">
                            ⚔️ Weapon
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.5); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;">
                            🛡️ Armor
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Active Effects
                    </div>
                    <div style="
                        background: rgba(139, 69, 139, 0.2);
                        border: 2px solid #8B458B;
                        border-radius: 6px;
                        padding: 12px;
                        font-family: 'Yrsa', serif;
                        font-size: 16px;
                        color: #DA70D6;
                        font-style: italic;
                    ">
                        ✨ No active effects
                    </div>
                </div>
            `;

            modal.appendChild(panel);
            document.body.appendChild(modal);

            // Close button handler
            panel.querySelector('.close-details-btn').addEventListener('click', () => {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 300);
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.opacity = '0';
                    setTimeout(() => modal.remove(), 300);
                }
            });

            // Close button hover effect
            const closeBtn = panel.querySelector('.close-details-btn');
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = 'rgba(205, 92, 92, 0.6)';
                closeBtn.style.transform = 'scale(1.1)';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = 'rgba(205, 92, 92, 0.3)';
                closeBtn.style.transform = 'scale(1)';
            });
        }