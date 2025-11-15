/**
 * The Arcane Codex - UX Enhancement System
 * Advanced UI/UX improvements for better player engagement and retention
 */

class ArcaneUXEnhancements {
    constructor() {
        // Animation timing
        this.animations = {
            fast: 150,
            normal: 300,
            slow: 500,
            xslow: 1000
        };

        // Sound effects configuration
        this.sounds = {
            whisper: '/static/sounds/whisper.mp3',
            divine: '/static/sounds/divine.mp3',
            choice: '/static/sounds/choice.mp3',
            trust_up: '/static/sounds/trust_up.mp3',
            trust_down: '/static/sounds/trust_down.mp3',
            notification: '/static/sounds/notification.mp3'
        };

        // Tutorial state
        this.tutorialStep = 0;
        this.tutorialSeen = localStorage.getItem('arcane_tutorial_seen') === 'true';

        // Haptic feedback support
        this.hapticEnabled = 'vibrate' in navigator;

        // Initialize enhancement systems
        this.initializeEnhancements();
    }

    // ===== ONBOARDING & TUTORIAL SYSTEM =====

    initializeTutorial() {
        if (this.tutorialSeen) return;

        const tutorialSteps = [
            {
                element: '.game-code-display',
                title: 'Game Code',
                content: 'Share this code with friends to invite them to your quest',
                position: 'bottom'
            },
            {
                element: '.trust-meter-container',
                title: 'Party Trust',
                content: 'Your party\'s trust affects everyone. Betrayal has consequences.',
                position: 'bottom'
            },
            {
                element: '.whisper-container',
                title: 'Secret Knowledge',
                content: 'Only you can see your whispers. Share them wisely - or keep them hidden.',
                position: 'top',
                highlight: true
            },
            {
                element: '.choice-section',
                title: 'Make Your Choice',
                content: 'Your decisions shape the story. Choose carefully!',
                position: 'top'
            }
        ];

        this.showTutorialStep(tutorialSteps[0]);
    }

    showTutorialStep(step) {
        const element = document.querySelector(step.element);
        if (!element) return;

        // Create tutorial overlay
        const overlay = this.createTutorialOverlay(element, step);
        document.body.appendChild(overlay);

        // Highlight element
        if (step.highlight) {
            element.classList.add('tutorial-highlight');
        }

        // Auto-advance or wait for user
        setTimeout(() => {
            this.advanceTutorial();
        }, 5000);
    }

    createTutorialOverlay(targetElement, step) {
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-tooltip" data-position="${step.position}">
                <div class="tutorial-arrow"></div>
                <div class="tutorial-content">
                    <h4>${step.title}</h4>
                    <p>${step.content}</p>
                    <div class="tutorial-actions">
                        <button class="btn-skip">Skip Tutorial</button>
                        <button class="btn-next">Next</button>
                    </div>
                </div>
            </div>
        `;

        // Position tooltip near target
        const rect = targetElement.getBoundingClientRect();
        const tooltip = overlay.querySelector('.tutorial-tooltip');

        if (step.position === 'bottom') {
            tooltip.style.top = `${rect.bottom + 10}px`;
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
        } else {
            tooltip.style.top = `${rect.top - 10}px`;
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
        }

        // Add event listeners
        overlay.querySelector('.btn-skip').addEventListener('click', () => {
            this.skipTutorial();
        });

        overlay.querySelector('.btn-next').addEventListener('click', () => {
            this.advanceTutorial();
        });

        return overlay;
    }

    advanceTutorial() {
        // Implementation for advancing tutorial
        this.tutorialStep++;
        // Continue with next step...
    }

    skipTutorial() {
        localStorage.setItem('arcane_tutorial_seen', 'true');
        document.querySelectorAll('.tutorial-overlay').forEach(el => el.remove());
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }

    // ===== ASYMMETRIC INFORMATION VISUALIZATION =====

    createInfoDifferenceIndicator(playerData) {
        const indicator = document.createElement('div');
        indicator.className = 'info-difference-indicator';

        // Calculate information asymmetry
        const myInfo = playerData.self.knownSecrets || [];
        const othersInfo = playerData.others.map(p => p.knownSecrets || []).flat();
        const uniqueInfo = myInfo.filter(s => !othersInfo.includes(s));

        indicator.innerHTML = `
            <div class="info-badge ${uniqueInfo.length > 0 ? 'has-unique' : ''}">
                <span class="info-icon">🔮</span>
                <span class="info-count">${uniqueInfo.length}</span>
                <div class="info-tooltip">
                    You know ${uniqueInfo.length} secret${uniqueInfo.length !== 1 ? 's' : ''}
                    that others don't
                </div>
            </div>
        `;

        // Pulse animation when new unique info received
        if (uniqueInfo.length > this.lastUniqueCount) {
            indicator.classList.add('pulse-glow');
            this.triggerHaptic('light');
        }

        this.lastUniqueCount = uniqueInfo.length;
        return indicator;
    }

    // ===== MULTI-SENSORY WHISPER SYSTEM =====

    displaySensoryWhisper(whisperData) {
        const container = document.createElement('div');
        container.className = 'sensory-whisper-container';

        // Parse sensory data
        const senses = {
            sight: whisperData.visual || null,
            sound: whisperData.audio || null,
            smell: whisperData.scent || null,
            touch: whisperData.tactile || null,
            taste: whisperData.flavor || null
        };

        // Create sensory indicators
        let sensoryHTML = '<div class="sensory-indicators">';
        for (const [sense, data] of Object.entries(senses)) {
            if (data) {
                sensoryHTML += this.createSensoryIndicator(sense, data);
            }
        }
        sensoryHTML += '</div>';

        // Main whisper content with effects
        container.innerHTML = `
            <div class="whisper-header-enhanced">
                <div class="whisper-classification">${whisperData.classification || 'SECRET'}</div>
                ${sensoryHTML}
            </div>
            <div class="whisper-body">
                <div class="whisper-text" data-encryption="${whisperData.encrypted ? 'true' : 'false'}">
                    ${this.processWhisperText(whisperData.content)}
                </div>
                ${whisperData.image ? `<div class="whisper-image">
                    <img src="${whisperData.image}" alt="Vision" />
                    <div class="image-overlay"></div>
                </div>` : ''}
            </div>
            <div class="whisper-actions">
                <button class="btn-share-whisper" data-whisper-id="${whisperData.id}">
                    <span class="icon">📢</span> Share with Party
                </button>
                <button class="btn-keep-secret" data-whisper-id="${whisperData.id}">
                    <span class="icon">🤐</span> Keep Secret
                </button>
            </div>
        `;

        // Add interactive effects
        this.addWhisperEffects(container, whisperData);

        return container;
    }

    createSensoryIndicator(sense, data) {
        const icons = {
            sight: '👁️',
            sound: '👂',
            smell: '👃',
            touch: '✋',
            taste: '👅'
        };

        return `
            <div class="sense-indicator active" data-sense="${sense}">
                <span class="sense-icon">${icons[sense]}</span>
                <div class="sense-tooltip">
                    <strong>${sense}:</strong> ${data}
                </div>
            </div>
        `;
    }

    processWhisperText(text) {
        // Add glitch effect for encrypted or corrupted text
        if (text.includes('[CORRUPTED]')) {
            return text.replace(/\[CORRUPTED\]/g, '<span class="text-corrupted" data-text="???">???</span>');
        }

        // Highlight important names/places
        return text.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, '<span class="text-important">$1</span>');
    }

    addWhisperEffects(container, whisperData) {
        // Decrypt animation for encrypted whispers
        if (whisperData.encrypted) {
            const textEl = container.querySelector('.whisper-text');
            this.animateDecryption(textEl);
        }

        // Particle effects for magical whispers
        if (whisperData.magical) {
            this.addMagicalParticles(container);
        }

        // Sound effect
        if (whisperData.audio && this.sounds.whisper) {
            this.playSound('whisper', 0.3);
        }

        // Haptic feedback
        this.triggerHaptic('medium');
    }

    animateDecryption(element) {
        const originalText = element.textContent;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let iterations = 0;

        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iterations >= originalText.length) {
                clearInterval(interval);
            }
            iterations += 1/3;
        }, 30);
    }

    // ===== DIVINE COUNCIL VOTING INTERFACE =====

    createDivineVotingInterface(votingData) {
        const container = document.createElement('div');
        container.className = 'divine-voting-interface';

        container.innerHTML = `
            <div class="voting-header">
                <h2>The Divine Council Deliberates</h2>
                <div class="voting-timer" data-time="${votingData.timeLimit}">
                    <svg class="timer-ring" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" class="timer-background"/>
                        <circle cx="50" cy="50" r="45" class="timer-progress"/>
                    </svg>
                    <span class="timer-text">${votingData.timeLimit}s</span>
                </div>
            </div>

            <div class="voting-question">
                <p>${votingData.question}</p>
            </div>

            <div class="voting-options">
                ${votingData.options.map(option => this.createVotingOption(option)).join('')}
            </div>

            <div class="voting-participants">
                ${this.createParticipantList(votingData.participants)}
            </div>

            <div class="divine-influences">
                ${this.createDivineInfluences(votingData.gods)}
            </div>
        `;

        this.startVotingTimer(container, votingData.timeLimit);
        return container;
    }

    createVotingOption(option) {
        return `
            <div class="voting-option" data-option-id="${option.id}">
                <div class="option-content">
                    <h3>${option.title}</h3>
                    <p>${option.description}</p>
                    ${option.consequence ? `<p class="consequence">Consequence: ${option.consequence}</p>` : ''}
                </div>
                <div class="option-votes">
                    <div class="vote-bar">
                        <div class="vote-fill" style="width: 0%"></div>
                    </div>
                    <span class="vote-count">0 votes</span>
                </div>
                <button class="btn-vote" data-option="${option.id}">
                    Cast Your Vote
                </button>
            </div>
        `;
    }

    createParticipantList(participants) {
        return `
            <div class="participant-list">
                <h3>Council Members</h3>
                <div class="participants">
                    ${participants.map(p => `
                        <div class="participant ${p.hasVoted ? 'voted' : 'pending'}">
                            <span class="participant-name">${p.name}</span>
                            <span class="participant-status">
                                ${p.hasVoted ? '✓' : '⏳'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createDivineInfluences(gods) {
        return `
            <div class="gods-influence">
                <h3>Divine Influences</h3>
                <div class="gods-grid">
                    ${gods.map(god => `
                        <div class="god-card ${god.pleased ? 'pleased' : 'displeased'}">
                            <span class="god-icon">${god.icon}</span>
                            <span class="god-name">${god.name}</span>
                            <div class="favor-meter">
                                <div class="favor-fill" style="width: ${god.favor}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    startVotingTimer(container, timeLimit) {
        const timerText = container.querySelector('.timer-text');
        const timerProgress = container.querySelector('.timer-progress');
        const circumference = 2 * Math.PI * 45;

        timerProgress.style.strokeDasharray = circumference;
        let timeLeft = timeLimit;

        const interval = setInterval(() => {
            timeLeft--;
            timerText.textContent = `${timeLeft}s`;

            const offset = circumference - (timeLeft / timeLimit) * circumference;
            timerProgress.style.strokeDashoffset = offset;

            // Warning at 10 seconds
            if (timeLeft === 10) {
                container.classList.add('timer-warning');
                this.playSound('notification');
            }

            // Critical at 5 seconds
            if (timeLeft === 5) {
                container.classList.add('timer-critical');
                this.triggerHaptic('heavy');
            }

            if (timeLeft <= 0) {
                clearInterval(interval);
                this.onVotingComplete();
            }
        }, 1000);
    }

    // ===== TRUST METER VISUALIZATION =====

    enhanceTrustMeter(trustData) {
        const container = document.querySelector('.trust-meter-container');
        if (!container) return;

        // Add relationship web visualization
        const web = document.createElement('div');
        web.className = 'trust-relationship-web';
        web.innerHTML = `
            <svg class="relationship-svg" viewBox="0 0 400 400">
                ${this.drawRelationshipLines(trustData.relationships)}
                ${this.drawPlayerNodes(trustData.players)}
            </svg>
        `;

        // Enhanced trust bar with segments
        const enhancedBar = document.createElement('div');
        enhancedBar.className = 'trust-bar-enhanced';
        enhancedBar.innerHTML = `
            <div class="trust-segments">
                ${this.createTrustSegments(trustData.level)}
            </div>
            <div class="trust-indicators">
                ${this.createTrustIndicators(trustData)}
            </div>
        `;

        // Add trending indicator
        const trend = document.createElement('div');
        trend.className = `trust-trend ${trustData.trend}`;
        trend.innerHTML = `
            <span class="trend-icon">${trustData.trend === 'up' ? '↗' : trustData.trend === 'down' ? '↘' : '→'}</span>
            <span class="trend-text">${trustData.trendText || 'Stable'}</span>
        `;

        container.appendChild(web);
        container.appendChild(enhancedBar);
        container.appendChild(trend);

        // Animate changes
        this.animateTrustChange(trustData);
    }

    drawRelationshipLines(relationships) {
        return relationships.map(rel => {
            const opacity = Math.abs(rel.trust) / 100;
            const color = rel.trust > 0 ? '#10B981' : '#EF4444';
            return `
                <line x1="${rel.x1}" y1="${rel.y1}" x2="${rel.x2}" y2="${rel.y2}"
                      stroke="${color}" stroke-width="2" opacity="${opacity}"
                      class="relationship-line" data-players="${rel.players}">
                    <animate attributeName="stroke-width"
                             values="2;4;2" dur="2s" repeatCount="indefinite"/>
                </line>
            `;
        }).join('');
    }

    drawPlayerNodes(players) {
        return players.map((player, index) => {
            const angle = (index * 360 / players.length) * Math.PI / 180;
            const x = 200 + 150 * Math.cos(angle);
            const y = 200 + 150 * Math.sin(angle);

            return `
                <g class="player-node" transform="translate(${x}, ${y})">
                    <circle r="30" fill="${player.color || '#8B5CF6'}" opacity="0.8"/>
                    <text text-anchor="middle" dy="5" fill="white" font-size="12">
                        ${player.name.substring(0, 3).toUpperCase()}
                    </text>
                    ${player.isTraitor ? '<circle r="35" fill="none" stroke="#EF4444" stroke-width="2" stroke-dasharray="5,5" opacity="0.8"/>' : ''}
                </g>
            `;
        }).join('');
    }

    createTrustSegments(level) {
        const segments = 20;
        const filledSegments = Math.floor(level / (100 / segments));
        let html = '';

        for (let i = 0; i < segments; i++) {
            const filled = i < filledSegments;
            const critical = i < 4;
            const warning = i >= 4 && i < 10;
            const good = i >= 10;

            html += `<div class="trust-segment ${filled ? 'filled' : ''} ${critical ? 'critical' : warning ? 'warning' : 'good'}"></div>`;
        }

        return html;
    }

    createTrustIndicators(trustData) {
        const indicators = [];

        if (trustData.recentBetrayal) {
            indicators.push('<span class="indicator betrayal">⚠️ Recent Betrayal</span>');
        }

        if (trustData.bonding) {
            indicators.push('<span class="indicator bonding">🤝 Party Bonding</span>');
        }

        if (trustData.suspicious) {
            indicators.push('<span class="indicator suspicious">👁️ Growing Suspicion</span>');
        }

        return indicators.join('');
    }

    animateTrustChange(trustData) {
        const bar = document.querySelector('.trust-bar');
        const oldWidth = parseFloat(bar.style.width);
        const newWidth = trustData.level;

        // Particle effect for trust changes
        if (Math.abs(oldWidth - newWidth) > 5) {
            this.createTrustParticles(oldWidth > newWidth ? 'loss' : 'gain');
        }

        // Smooth animation with easing
        bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
        bar.style.width = `${newWidth}%`;

        // Sound effect
        if (oldWidth > newWidth) {
            this.playSound('trust_down');
        } else if (oldWidth < newWidth) {
            this.playSound('trust_up');
        }
    }

    createTrustParticles(type) {
        const container = document.querySelector('.trust-meter-container');
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `trust-particle ${type}`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(particle);

            // Remove after animation
            setTimeout(() => particle.remove(), 2000);
        }
    }

    // ===== RECONNECTION EXPERIENCE =====

    handleReconnection() {
        const overlay = document.createElement('div');
        overlay.className = 'reconnection-overlay';
        overlay.innerHTML = `
            <div class="reconnection-content">
                <div class="reconnection-animation">
                    <div class="portal-effect">
                        <div class="portal-ring"></div>
                        <div class="portal-ring"></div>
                        <div class="portal-ring"></div>
                    </div>
                </div>
                <h2>Returning to Valdria...</h2>
                <p class="reconnection-message">The threads of fate pull you back</p>
                <div class="reconnection-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p class="progress-text">Restoring your essence...</p>
                </div>
                <div class="missed-events" style="display: none;">
                    <h3>While You Were Away:</h3>
                    <div class="events-list"></div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate progress
        this.animateReconnection(overlay);
    }

    animateReconnection(overlay) {
        const progressFill = overlay.querySelector('.progress-fill');
        const progressText = overlay.querySelector('.progress-text');
        const missedEvents = overlay.querySelector('.missed-events');

        const steps = [
            { width: '25%', text: 'Locating your soul...' },
            { width: '50%', text: 'Synchronizing with the party...' },
            { width: '75%', text: 'Recovering missed whispers...' },
            { width: '100%', text: 'Welcome back, traveler!' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                progressFill.style.width = steps[currentStep].width;
                progressText.textContent = steps[currentStep].text;

                if (currentStep === 2) {
                    // Show missed events
                    this.displayMissedEvents(missedEvents);
                }

                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.classList.add('fade-out');
                    setTimeout(() => overlay.remove(), 500);
                }, 1000);
            }
        }, 800);
    }

    displayMissedEvents(container) {
        // Fetch missed events from server
        const events = [
            { type: 'choice', text: 'The party chose to investigate the ruins' },
            { type: 'trust', text: 'Trust decreased by 15 points' },
            { type: 'whisper', text: 'You received a new whisper from the gods' }
        ];

        const eventsList = container.querySelector('.events-list');
        eventsList.innerHTML = events.map(event => `
            <div class="missed-event ${event.type}">
                <span class="event-icon">${this.getEventIcon(event.type)}</span>
                <span class="event-text">${event.text}</span>
            </div>
        `).join('');

        container.style.display = 'block';
    }

    getEventIcon(type) {
        const icons = {
            choice: '⚔️',
            trust: '💔',
            whisper: '🔮',
            combat: '⚔️',
            discovery: '✨'
        };
        return icons[type] || '📜';
    }

    // ===== LOADING & ERROR STATES =====

    createEnhancedLoader(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'enhanced-loader';
        loader.innerHTML = `
            <div class="loader-backdrop"></div>
            <div class="loader-content">
                <div class="mystical-spinner">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" class="spinner-track"/>
                        <circle cx="50" cy="50" r="45" class="spinner-fill"/>
                        <g class="runes">
                            ${this.generateRuneElements()}
                        </g>
                    </svg>
                </div>
                <p class="loader-message">${message}</p>
                <div class="loader-tips">
                    <p class="tip">${this.getRandomTip()}</p>
                </div>
            </div>
        `;
        return loader;
    }

    generateRuneElements() {
        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚬ', 'ᚱ', 'ᚴ'];
        return runes.map((rune, i) => {
            const angle = (i * 60) * Math.PI / 180;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);
            return `<text x="${x}" y="${y}" text-anchor="middle" dy="5"
                    class="rune" fill="#d4af37" font-size="12">${rune}</text>`;
        }).join('');
    }

    getRandomTip() {
        const tips = [
            'Trust no one completely, but don\'t walk alone.',
            'Every whisper has two meanings.',
            'The gods favor the bold, but punish the reckless.',
            'Sometimes the best choice is to wait.',
            'Your secrets are currency - spend them wisely.'
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    createEnhancedError(error) {
        const errorEl = document.createElement('div');
        errorEl.className = 'enhanced-error';

        const errorType = this.categorizeError(error);

        errorEl.innerHTML = `
            <div class="error-icon">${errorType.icon}</div>
            <div class="error-content">
                <h3>${errorType.title}</h3>
                <p>${errorType.message}</p>
                <div class="error-actions">
                    ${errorType.actions.map(action => `
                        <button class="error-action" data-action="${action.type}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
            <button class="error-dismiss">×</button>
        `;

        // Add shake animation for critical errors
        if (errorType.severity === 'critical') {
            errorEl.classList.add('shake');
            this.triggerHaptic('heavy');
        }

        return errorEl;
    }

    categorizeError(error) {
        if (error.includes('connection') || error.includes('network')) {
            return {
                icon: '🌐',
                title: 'Connection Lost',
                message: 'The mystical link has been severed. Attempting to reconnect...',
                severity: 'warning',
                actions: [
                    { type: 'reconnect', label: 'Reconnect' },
                    { type: 'offline', label: 'Continue Offline' }
                ]
            };
        } else if (error.includes('full')) {
            return {
                icon: '👥',
                title: 'Party Full',
                message: 'This quest already has four brave souls.',
                severity: 'info',
                actions: [
                    { type: 'create', label: 'Start New Quest' },
                    { type: 'spectate', label: 'Watch as Observer' }
                ]
            };
        } else {
            return {
                icon: '⚠️',
                title: 'Something Went Wrong',
                message: error || 'The gods are displeased. Please try again.',
                severity: 'error',
                actions: [
                    { type: 'retry', label: 'Try Again' },
                    { type: 'dismiss', label: 'Dismiss' }
                ]
            };
        }
    }

    // ===== ACCESSIBILITY ENHANCEMENTS =====

    enhanceAccessibility() {
        // Add screen reader announcements
        this.createAriaLiveRegion();

        // Enhance keyboard navigation
        this.setupKeyboardShortcuts();

        // Add focus indicators
        this.enhanceFocusIndicators();

        // Color blind mode support
        this.setupColorBlindMode();
    }

    createAriaLiveRegion() {
        const region = document.createElement('div');
        region.className = 'sr-only';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.id = 'aria-announcements';
        document.body.appendChild(region);
    }

    announceToScreenReader(message) {
        const region = document.getElementById('aria-announcements');
        if (region) {
            region.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + H: Help/Tutorial
            if (e.altKey && e.key === 'h') {
                this.showHelp();
            }
            // Alt + T: Read trust level
            else if (e.altKey && e.key === 't') {
                this.announceTrustLevel();
            }
            // Alt + W: Read latest whisper
            else if (e.altKey && e.key === 'w') {
                this.announceLatestWhisper();
            }
            // Alt + P: Read party status
            else if (e.altKey && e.key === 'p') {
                this.announcePartyStatus();
            }
        });
    }

    enhanceFocusIndicators() {
        // Add custom focus styles for better visibility
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 3px solid #d4af37 !important;
                outline-offset: 2px !important;
            }

            .focus-trap {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
            }
        `;
        document.head.appendChild(style);
    }

    setupColorBlindMode() {
        const savedMode = localStorage.getItem('colorblind_mode');
        if (savedMode) {
            document.body.classList.add(`colorblind-${savedMode}`);
        }
    }

    // ===== UTILITY FUNCTIONS =====

    playSound(soundName, volume = 0.5) {
        if (!this.sounds[soundName]) return;

        const audio = new Audio(this.sounds[soundName]);
        audio.volume = volume;
        audio.play().catch(e => console.log('Sound play failed:', e));
    }

    triggerHaptic(intensity = 'light') {
        if (!this.hapticEnabled) return;

        const patterns = {
            light: [50],
            medium: [100],
            heavy: [200],
            pattern: [50, 100, 50, 100, 200]
        };

        navigator.vibrate(patterns[intensity] || patterns.light);
    }

    // ===== INITIALIZATION =====

    initializeEnhancements() {
        // Check for mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Initialize subsystems
        if (!this.tutorialSeen) {
            setTimeout(() => this.initializeTutorial(), 1000);
        }

        this.enhanceAccessibility();

        // Setup performance monitoring
        this.monitorPerformance();
    }

    monitorPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure' && entry.duration > 100) {
                        console.warn(`Slow operation: ${entry.name} took ${entry.duration}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        }
    }
}

// Export for use in main game
window.ArcaneUXEnhancements = ArcaneUXEnhancements;