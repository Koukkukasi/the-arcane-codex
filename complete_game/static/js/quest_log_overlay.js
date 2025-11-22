/**
 * Quest Log Overlay - The Arcane Codex
 * =====================================
 * Complete quest management system with tracking and progression
 *
 * Features:
 * - Active and completed quest tabs
 * - Quest categorization (Main Story, Side Quests, Divine Trials)
 * - Detailed quest information panel
 * - Objective tracking with progress
 * - Quest rewards preview
 * - Show on map integration
 * - Quest abandonment
 */

class QuestLogOverlay {
    constructor() {
        this.overlay = document.getElementById('questLogOverlay');
        this.isOpen = false;
        this.currentTab = 'active';
        this.selectedQuest = 'the-ancient-codex';

        // Quest database
        this.quests = {
            // Active Quests
            'the-ancient-codex': {
                id: 'the-ancient-codex',
                title: 'The Ancient Codex',
                type: 'main-quest',
                level: 5,
                status: 'active',
                progress: 60,
                description: 'The gods have tasked you with finding the legendary Arcane Codex, a tome of immense power that has been lost for centuries. Your journey will take you through dangerous lands and ancient ruins. Prove yourself worthy of divine favor.',
                objectives: [
                    { text: 'Speak with the Oracle', completed: true },
                    { text: 'Gather 3 Ancient Fragments', completed: true, progress: '3/3' },
                    { text: 'Defeat the Guardian of the Ruins', completed: false, active: true },
                    { text: 'Retrieve the Arcane Codex', completed: false }
                ],
                rewards: {
                    xp: 500,
                    gold: 250,
                    items: ['Blessed Sword'],
                    favor: { all: 10 }
                },
                giver: {
                    name: 'The Oracle of Valdris',
                    location: 'Temple of the Gods',
                    icon: '🔮'
                },
                category: 'Main Story'
            },
            'goblin-menace': {
                id: 'goblin-menace',
                title: 'The Goblin Menace',
                type: 'side-quest',
                level: 3,
                status: 'active',
                progress: 30,
                description: 'Local farmers have reported increased goblin activity near their fields. Clear out the goblin camp and bring peace to the countryside.',
                objectives: [
                    { text: 'Kill 10 Goblins', completed: false, active: true, progress: '3/10' }
                ],
                rewards: {
                    xp: 150,
                    gold: 75,
                    items: ['Iron Dagger'],
                    favor: { valdris: 5 }
                },
                giver: {
                    name: 'Village Elder Marcus',
                    location: 'Riverside Village',
                    icon: '👴'
                },
                category: 'Side Quests'
            },
            'lost-heirloom': {
                id: 'lost-heirloom',
                title: 'The Lost Heirloom',
                type: 'side-quest',
                level: 4,
                status: 'active',
                progress: 0,
                description: 'A wealthy merchant has lost a family heirloom in the Old Manor. Search the building and recover the precious item.',
                objectives: [
                    { text: 'Search the Old Manor', completed: false, active: true },
                    { text: 'Find the Family Heirloom', completed: false },
                    { text: 'Return to Merchant Aldric', completed: false }
                ],
                rewards: {
                    xp: 200,
                    gold: 150,
                    items: ['Silver Ring'],
                    favor: { mercus: 10 }
                },
                giver: {
                    name: 'Merchant Aldric',
                    location: 'Marketplace',
                    icon: '💼'
                },
                category: 'Side Quests'
            },
            // Completed Quests
            'first-steps': {
                id: 'first-steps',
                title: 'First Steps',
                type: 'completed-quest',
                level: 1,
                status: 'completed',
                progress: 100,
                description: 'Begin your journey as an adventurer by learning the basics of combat and exploration.',
                objectives: [
                    { text: 'Complete the tutorial', completed: true },
                    { text: 'Choose your class', completed: true },
                    { text: 'Equip your starting gear', completed: true }
                ],
                rewards: {
                    xp: 50,
                    gold: 25,
                    items: ['Starter Weapon'],
                    favor: { all: 5 }
                },
                giver: {
                    name: 'Training Master',
                    location: 'Training Grounds',
                    icon: '🎯'
                },
                category: 'Completed Quests'
            },
            'meet-the-gods': {
                id: 'meet-the-gods',
                title: 'Meet the Gods',
                type: 'completed-quest',
                level: 2,
                status: 'completed',
                progress: 100,
                description: 'Visit the Temple of the Gods and receive blessings from the divine pantheon.',
                objectives: [
                    { text: 'Visit the Temple of the Gods', completed: true },
                    { text: 'Speak with each deity', completed: true },
                    { text: 'Receive your first blessing', completed: true }
                ],
                rewards: {
                    xp: 100,
                    gold: 50,
                    items: ['Divine Amulet'],
                    favor: { all: 10 }
                },
                giver: {
                    name: 'High Priestess Elara',
                    location: 'Temple of the Gods',
                    icon: '⛪'
                },
                category: 'Completed Quests'
            },
            'training-grounds': {
                id: 'training-grounds',
                title: 'Training Grounds',
                type: 'completed-quest',
                level: 1,
                status: 'completed',
                progress: 100,
                description: 'Complete your combat training and prove your worth as a warrior.',
                objectives: [
                    { text: 'Defeat training dummies', completed: true },
                    { text: 'Win a sparring match', completed: true },
                    { text: 'Master basic combat', completed: true }
                ],
                rewards: {
                    xp: 75,
                    gold: 30,
                    items: ['Training Manual'],
                    favor: { valdris: 5 }
                },
                giver: {
                    name: 'Weapons Master Gareth',
                    location: 'Training Grounds',
                    icon: '⚔️'
                },
                category: 'Completed Quests'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.displayQuestDetails(this.selectedQuest);
    }

    setupEventListeners() {
        // Close overlay handlers
        const closeButtons = this.overlay.querySelectorAll('[data-close-overlay]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'j' || e.key === 'J') {
                if (!this.isOpen) {
                    this.open();
                } else {
                    this.close();
                }
            } else if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Tab switching
        this.overlay.querySelectorAll('.quest-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Quest item selection
        this.overlay.querySelectorAll('.quest-item').forEach(item => {
            item.addEventListener('click', () => {
                const questId = item.dataset.quest;
                this.selectQuest(questId);
            });
        });

        // Action buttons
        const trackBtn = this.overlay.querySelector('[data-track-quest]');
        if (trackBtn) {
            trackBtn.addEventListener('click', () => this.trackQuest());
        }

        const mapBtn = this.overlay.querySelector('[data-show-map]');
        if (mapBtn) {
            mapBtn.addEventListener('click', () => this.showOnMap());
        }

        const abandonBtn = this.overlay.querySelector('[data-abandon-quest]');
        if (abandonBtn) {
            abandonBtn.addEventListener('click', () => this.abandonQuest());
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        this.overlay.querySelectorAll('.quest-tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });

        // Update panels
        this.overlay.querySelectorAll('.quest-panel').forEach(panel => {
            if (panel.dataset.panel === tabName) {
                panel.classList.add('active');
                panel.style.display = 'block';
            } else {
                panel.classList.remove('active');
                panel.style.display = 'none';
            }
        });
    }

    selectQuest(questId) {
        this.selectedQuest = questId;

        // Update selected state
        this.overlay.querySelectorAll('.quest-item').forEach(item => {
            if (item.dataset.quest === questId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // Display quest details
        this.displayQuestDetails(questId);
    }

    displayQuestDetails(questId) {
        const quest = this.quests[questId];
        if (!quest) return;

        const detailsPanel = this.overlay.querySelector('.quest-details-panel');

        // Update title and badge
        detailsPanel.querySelector('.details-title').textContent = quest.title;
        const badge = detailsPanel.querySelector('.quest-type-badge');
        badge.className = `quest-type-badge ${quest.type}`;
        badge.textContent = this.getQuestTypeName(quest.type);

        // Update description
        detailsPanel.querySelector('.quest-description').textContent = quest.description;

        // Update objectives
        const objectivesList = detailsPanel.querySelector('.objectives-list');
        objectivesList.innerHTML = quest.objectives.map(obj => `
            <li class="objective-item ${obj.completed ? 'completed' : ''} ${obj.active ? 'active' : ''}">
                <span class="objective-checkbox">${obj.completed ? '✓' : '◯'}</span>
                <span class="objective-text">${obj.text}</span>
                ${obj.progress ? `<span class="objective-progress">${obj.progress}</span>` : ''}
            </li>
        `).join('');

        // Update rewards
        const rewardsGrid = detailsPanel.querySelector('.rewards-grid');
        rewardsGrid.innerHTML = `
            <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <div class="reward-info">
                    <span class="reward-label">Experience</span>
                    <span class="reward-value">${quest.rewards.xp} XP</span>
                </div>
            </div>
            <div class="reward-item">
                <span class="reward-icon">🪙</span>
                <div class="reward-info">
                    <span class="reward-label">Gold</span>
                    <span class="reward-value">${quest.rewards.gold}g</span>
                </div>
            </div>
            ${quest.rewards.items.length > 0 ? `
                <div class="reward-item">
                    <span class="reward-icon">⚔️</span>
                    <div class="reward-info">
                        <span class="reward-label">Item</span>
                        <span class="reward-value">${quest.rewards.items[0]}</span>
                    </div>
                </div>
            ` : ''}
            ${quest.rewards.favor ? `
                <div class="reward-item">
                    <span class="reward-icon">✨</span>
                    <div class="reward-info">
                        <span class="reward-label">Divine Favor</span>
                        <span class="reward-value">+${quest.rewards.favor.all || Object.values(quest.rewards.favor)[0]} ${quest.rewards.favor.all ? 'All Gods' : Object.keys(quest.rewards.favor)[0]}</span>
                    </div>
                </div>
            ` : ''}
        `;

        // Update quest giver
        const giverInfo = detailsPanel.querySelector('.quest-giver-info');
        giverInfo.innerHTML = `
            <span class="giver-icon">${quest.giver.icon}</span>
            <div class="giver-details">
                <span class="giver-name">${quest.giver.name}</span>
                <span class="giver-location">${quest.giver.location}</span>
            </div>
        `;

        // Update action buttons visibility
        const actionsContainer = detailsPanel.querySelector('.quest-details-actions');
        if (quest.status === 'completed') {
            actionsContainer.style.display = 'none';
        } else {
            actionsContainer.style.display = 'flex';
        }
    }

    getQuestTypeName(type) {
        const typeNames = {
            'main-quest': 'Main Quest',
            'side-quest': 'Side Quest',
            'divine-trial': 'Divine Trial',
            'completed-quest': 'Completed'
        };
        return typeNames[type] || 'Quest';
    }

    trackQuest() {
        const quest = this.quests[this.selectedQuest];
        if (!quest) return;

        this.showNotification(`Now tracking: ${quest.title}`, 'success');

        // In a real implementation, this would update the HUD tracker
        console.log('Tracking quest:', quest.title);
    }

    showOnMap() {
        const quest = this.quests[this.selectedQuest];
        if (!quest) return;

        this.showNotification(`Opening map for: ${quest.title}`, 'info');

        // In a real implementation, this would open the world map
        console.log('Showing quest on map:', quest.title);
        this.close();
    }

    abandonQuest() {
        const quest = this.quests[this.selectedQuest];
        if (!quest) return;

        // Confirm abandonment
        const confirmed = confirm(`Are you sure you want to abandon "${quest.title}"? Your progress will be lost.`);

        if (confirmed) {
            // Remove quest from active quests
            delete this.quests[this.selectedQuest];

            this.showNotification(`Quest abandoned: ${quest.title}`, 'warning');

            // Refresh display
            this.updateDisplay();

            // Select first available quest
            const firstQuest = Object.keys(this.quests).find(id =>
                this.quests[id].status === 'active'
            );
            if (firstQuest) {
                this.selectQuest(firstQuest);
            }
        }
    }

    updateDisplay() {
        // Count active and completed quests
        const activeCount = Object.values(this.quests).filter(q => q.status === 'active').length;
        const completedCount = Object.values(this.quests).filter(q => q.status === 'completed').length;

        // Update header stats
        const activeQuestsDisplay = this.overlay.querySelector('[data-active-quests]');
        if (activeQuestsDisplay) {
            activeQuestsDisplay.textContent = activeCount;
        }

        const completedQuestsDisplay = this.overlay.querySelector('[data-completed-quests]');
        if (completedQuestsDisplay) {
            completedQuestsDisplay.textContent = completedCount;
        }

        // Update tab badges
        const activeTabBadge = this.overlay.querySelector('[data-active-count]');
        if (activeTabBadge) {
            activeTabBadge.textContent = activeCount;
        }

        const completedTabBadge = this.overlay.querySelector('[data-completed-count]');
        if (completedTabBadge) {
            completedTabBadge.textContent = completedCount;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `quest-notification ${type}`;
        notification.textContent = message;

        const colors = {
            success: 'rgba(16, 185, 129, 0.9)',
            error: 'rgba(239, 68, 68, 0.9)',
            warning: 'rgba(245, 158, 11, 0.9)',
            info: 'rgba(99, 102, 241, 0.9)'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    open() {
        this.overlay.classList.add('active');
        this.isOpen = true;
        this.updateDisplay();
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    // Public API
    addQuest(questData) {
        this.quests[questData.id] = questData;
        this.updateDisplay();
    }

    completeQuest(questId) {
        const quest = this.quests[questId];
        if (quest) {
            quest.status = 'completed';
            quest.progress = 100;
            quest.type = 'completed-quest';
            quest.objectives.forEach(obj => obj.completed = true);
            this.updateDisplay();
            this.showNotification(`Quest completed: ${quest.title}`, 'success');
        }
    }

    updateObjective(questId, objectiveIndex, progress) {
        const quest = this.quests[questId];
        if (quest && quest.objectives[objectiveIndex]) {
            quest.objectives[objectiveIndex].progress = progress;

            // Update quest progress
            const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
            quest.progress = Math.floor((completedObjectives / quest.objectives.length) * 100);

            this.displayQuestDetails(questId);
        }
    }

    getActiveQuests() {
        return Object.values(this.quests).filter(q => q.status === 'active');
    }

    getCompletedQuests() {
        return Object.values(this.quests).filter(q => q.status === 'completed');
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
let questLogOverlay;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        questLogOverlay = new QuestLogOverlay();

        // Expose to global scope for integration
        window.QuestLogOverlay = questLogOverlay;
    });
} else {
    questLogOverlay = new QuestLogOverlay();
    window.QuestLogOverlay = questLogOverlay;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestLogOverlay;
}
