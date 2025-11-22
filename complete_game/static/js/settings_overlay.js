/**
 * Settings Overlay Manager - The Arcane Codex
 * Handles all game settings including audio, display, controls, game options, and accessibility
 */

class SettingsOverlayManager {
    constructor() {
        this.overlay = null;
        this.isOpen = false;
        this.currentTab = 'audio';
        this.settings = this.loadSettings();
        this.defaultSettings = this.getDefaultSettings();
        this.keybindListening = null;
        this.originalSettings = null; // For cancel functionality

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    getDefaultSettings() {
        return {
            // Audio settings
            masterVolume: 100,
            musicVolume: 80,
            sfxVolume: 90,
            ambientVolume: 70,
            masterMute: false,
            musicMute: false,
            sfxMute: false,

            // Display settings
            fullscreen: false,
            uiScale: 100,
            graphicsQuality: 'medium',
            showFps: false,
            vsync: true,

            // Control settings
            keybinds: {
                character: 'C',
                inventory: 'I',
                map: 'M',
                settings: 'Escape',
                quicksave: 'F5',
                quickload: 'F9',
                item1: '1',
                item2: '2',
                item3: '3',
                item4: '4',
                pause: ' ',
                help: 'H'
            },
            mouseSensitivity: 50,

            // Game settings
            autosave: true,
            difficulty: 'normal',
            permadeath: false,

            // Accessibility settings
            colorblindMode: 'none',
            fontSize: 100,
            highContrast: false,
            dyslexiaFont: false,
            reducedMotion: false,
            screenShake: true,
            particleEffects: true,
            subtitles: true,
            visualCues: false,
            extendedTime: false,
            autoAim: false
        };
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('arcaneCodexSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                // Merge with defaults to ensure all keys exist
                return { ...this.getDefaultSettings(), ...settings };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        return this.getDefaultSettings();
    }

    saveSettings() {
        try {
            localStorage.setItem('arcaneCodexSettings', JSON.stringify(this.settings));
            this.applySettings();
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    setup() {
        this.overlay = document.getElementById('settingsOverlay');
        if (!this.overlay) {
            console.error('Settings overlay element not found');
            return;
        }

        this.bindEvents();
        this.populateSettings();
    }

    bindEvents() {
        // Close overlay events
        const closeButtons = this.overlay.querySelectorAll('[data-close-settings]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Tab switching
        const tabs = this.overlay.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Audio sliders
        this.bindSlider('masterVolume', (value) => {
            this.settings.masterVolume = value;
            this.updateVolumeDisplay('master', value);
        });

        this.bindSlider('musicVolume', (value) => {
            this.settings.musicVolume = value;
            this.updateVolumeDisplay('music', value);
        });

        this.bindSlider('sfxVolume', (value) => {
            this.settings.sfxVolume = value;
            this.updateVolumeDisplay('sfx', value);
        });

        this.bindSlider('ambientVolume', (value) => {
            this.settings.ambientVolume = value;
            this.updateVolumeDisplay('ambient', value);
        });

        // Display sliders
        this.bindSlider('uiScale', (value) => {
            this.settings.uiScale = value;
            this.updateDisplay('ui-scale', value);
        });

        this.bindSlider('fontSize', (value) => {
            this.settings.fontSize = value;
            this.updateDisplay('font-size', value);
        });

        this.bindSlider('mouseSensitivity', (value) => {
            this.settings.mouseSensitivity = value;
            this.updateDisplay('mouse-sensitivity', value);
        });

        // Checkboxes and toggles
        this.bindCheckbox('masterMute');
        this.bindCheckbox('musicMute');
        this.bindCheckbox('sfxMute');
        this.bindCheckbox('fullscreen');
        this.bindCheckbox('showFps');
        this.bindCheckbox('vsync');
        this.bindCheckbox('autosave');
        this.bindCheckbox('permadeath');
        this.bindCheckbox('highContrast');
        this.bindCheckbox('dyslexiaFont');
        this.bindCheckbox('reducedMotion');
        this.bindCheckbox('screenShake');
        this.bindCheckbox('particleEffects');
        this.bindCheckbox('subtitles');
        this.bindCheckbox('visualCues');
        this.bindCheckbox('extendedTime');
        this.bindCheckbox('autoAim');

        // Select dropdowns
        this.bindSelect('graphicsQuality');
        this.bindSelect('difficulty');
        this.bindSelect('colorblindMode');

        // Keybind buttons
        const keybindButtons = this.overlay.querySelectorAll('.keybind-btn');
        keybindButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const keybind = e.currentTarget.dataset.keybind;
                this.startKeybindListening(keybind, e.currentTarget);
            });
        });

        // Reset keybinds
        const resetKeybindsBtn = this.overlay.querySelector('[data-reset-keybinds]');
        if (resetKeybindsBtn) {
            resetKeybindsBtn.addEventListener('click', () => this.resetKeybinds());
        }

        // Test sound button
        const testSfxBtn = this.overlay.querySelector('[data-test-sfx]');
        if (testSfxBtn) {
            testSfxBtn.addEventListener('click', () => this.testSound());
        }

        // Game action buttons
        const saveGameBtn = this.overlay.querySelector('[data-save-game]');
        const loadGameBtn = this.overlay.querySelector('[data-load-game]');
        const returnMenuBtn = this.overlay.querySelector('[data-return-menu]');
        const quitGameBtn = this.overlay.querySelector('[data-quit-game]');

        if (saveGameBtn) saveGameBtn.addEventListener('click', () => this.saveGame());
        if (loadGameBtn) loadGameBtn.addEventListener('click', () => this.loadGame());
        if (returnMenuBtn) returnMenuBtn.addEventListener('click', () => this.returnToMenu());
        if (quitGameBtn) quitGameBtn.addEventListener('click', () => this.quitGame());

        // Footer buttons
        const resetAllBtn = this.overlay.querySelector('[data-reset-settings]');
        const cancelBtn = this.overlay.querySelector('[data-cancel-settings]');
        const applyBtn = this.overlay.querySelector('[data-apply-settings]');

        if (resetAllBtn) resetAllBtn.addEventListener('click', () => this.resetAllSettings());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancel());
        if (applyBtn) applyBtn.addEventListener('click', () => this.apply());

        // Keyboard listener for keybinds
        document.addEventListener('keydown', (e) => {
            if (this.keybindListening) {
                e.preventDefault();
                this.setKeybind(this.keybindListening.key, e.key);
                this.keybindListening.element.classList.remove('listening');
                this.keybindListening = null;
            } else if (this.isOpen && e.key === 'Escape') {
                this.close();
            }
        });
    }

    bindSlider(settingName, callback) {
        const slider = this.overlay.querySelector(`[data-setting="${settingName}"]`);
        if (!slider) return;

        slider.addEventListener('input', (e) => {
            callback(parseInt(e.target.value));
        });
    }

    bindCheckbox(settingName) {
        const checkbox = this.overlay.querySelector(`[data-setting="${settingName}"]`);
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            this.settings[settingName] = e.target.checked;
        });
    }

    bindSelect(settingName) {
        const select = this.overlay.querySelector(`[data-setting="${settingName}"]`);
        if (!select) return;

        select.addEventListener('change', (e) => {
            this.settings[settingName] = e.target.value;
        });
    }

    populateSettings() {
        // Populate all settings from stored values
        Object.keys(this.settings).forEach(key => {
            const element = this.overlay.querySelector(`[data-setting="${key}"]`);
            if (!element) return;

            if (element.type === 'checkbox') {
                element.checked = this.settings[key];
            } else if (element.type === 'range') {
                element.value = this.settings[key];
                // Update display
                if (key.includes('Volume')) {
                    const displayKey = key.replace('Volume', '').toLowerCase();
                    this.updateVolumeDisplay(displayKey, this.settings[key]);
                } else {
                    this.updateDisplay(this.camelToKebab(key), this.settings[key]);
                }
            } else if (element.tagName === 'SELECT') {
                element.value = this.settings[key];
            }
        });

        // Populate keybinds
        Object.keys(this.settings.keybinds).forEach(key => {
            const btn = this.overlay.querySelector(`[data-keybind="${key}"]`);
            if (btn) {
                btn.querySelector('.keybind-key').textContent = this.formatKey(this.settings.keybinds[key]);
            }
        });
    }

    updateVolumeDisplay(type, value) {
        const display = this.overlay.querySelector(`[data-${type}-volume-value]`);
        if (display) {
            display.textContent = `${value}%`;
        }
    }

    updateDisplay(type, value) {
        const display = this.overlay.querySelector(`[data-${type}-value]`);
        if (display) {
            display.textContent = `${value}%`;
        }
    }

    switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Update tab buttons
        const tabs = this.overlay.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });

        // Update panels
        const panels = this.overlay.querySelectorAll('.settings-panel');
        panels.forEach(panel => {
            if (panel.dataset.panel === tabName) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        this.currentTab = tabName;
    }

    startKeybindListening(key, element) {
        // Cancel previous listening
        if (this.keybindListening) {
            this.keybindListening.element.classList.remove('listening');
        }

        this.keybindListening = { key, element };
        element.classList.add('listening');
    }

    setKeybind(key, value) {
        if (value === 'Escape') {
            // Cancel keybind listening
            return;
        }

        this.settings.keybinds[key] = value;

        // Update display
        const btn = this.overlay.querySelector(`[data-keybind="${key}"]`);
        if (btn) {
            btn.querySelector('.keybind-key').textContent = this.formatKey(value);
        }

        this.showNotification(`Keybind updated: ${key} = ${this.formatKey(value)}`, 'success');
    }

    resetKeybinds() {
        if (!confirm('Reset all keybinds to default?')) return;

        this.settings.keybinds = { ...this.defaultSettings.keybinds };

        // Update displays
        Object.keys(this.settings.keybinds).forEach(key => {
            const btn = this.overlay.querySelector(`[data-keybind="${key}"]`);
            if (btn) {
                btn.querySelector('.keybind-key').textContent = this.formatKey(this.settings.keybinds[key]);
            }
        });

        this.showNotification('Keybinds reset to default', 'info');
    }

    formatKey(key) {
        if (key === ' ') return 'SPACE';
        if (key.length === 1) return key.toUpperCase();
        return key;
    }

    testSound() {
        // In production, play an actual sound effect
        this.showNotification('Playing test sound...', 'info');
        console.log('Test sound played at volume:', this.settings.sfxVolume);
    }

    saveGame() {
        this.showNotification('Saving game...', 'info');
        // In production, trigger actual game save
        setTimeout(() => {
            this.showNotification('Game saved successfully!', 'success');
        }, 1000);
    }

    loadGame() {
        this.showNotification('Loading game...', 'info');
        // In production, show load game dialog
        console.log('Load game dialog would appear here');
    }

    returnToMenu() {
        if (!confirm('Return to main menu? Any unsaved progress will be lost.')) return;

        // In production, navigate to main menu
        console.log('Returning to main menu...');
        this.close();
    }

    quitGame() {
        if (!confirm('Quit game? Any unsaved progress will be lost.')) return;

        // In production, quit the game
        console.log('Quitting game...');
    }

    resetAllSettings() {
        if (!confirm('Reset all settings to default? This cannot be undone.')) return;

        this.settings = { ...this.defaultSettings };
        this.populateSettings();
        this.showNotification('All settings reset to default', 'info');
    }

    applySettings() {
        // Apply settings immediately (for preview)
        this.applyAccessibilitySettings();
        this.applyDisplaySettings();
        this.applyAudioSettings();

        // In production, apply all settings to game
        console.log('Applying settings:', this.settings);
    }

    applyAccessibilitySettings() {
        const root = document.documentElement;

        // Font size
        root.style.fontSize = `${this.settings.fontSize}%`;

        // High contrast
        if (this.settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Dyslexia font
        if (this.settings.dyslexiaFont) {
            root.classList.add('dyslexia-font');
        } else {
            root.classList.remove('dyslexia-font');
        }

        // Reduced motion
        if (this.settings.reducedMotion) {
            root.classList.add('reduced-motion');
        } else {
            root.classList.remove('reduced-motion');
        }

        // Colorblind mode
        root.setAttribute('data-colorblind-mode', this.settings.colorblindMode);
    }

    applyDisplaySettings() {
        const root = document.documentElement;

        // UI Scale
        root.style.setProperty('--ui-scale', this.settings.uiScale / 100);

        // Fullscreen
        if (this.settings.fullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Fullscreen failed:', err);
            });
        } else if (!this.settings.fullscreen && document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    applyAudioSettings() {
        // In production, apply to actual audio system
        console.log('Audio settings applied:', {
            master: this.settings.masterVolume,
            music: this.settings.musicVolume,
            sfx: this.settings.sfxVolume,
            ambient: this.settings.ambientVolume
        });
    }

    apply() {
        if (this.saveSettings()) {
            this.showNotification('Settings saved successfully!', 'success');
            this.close();
        } else {
            this.showNotification('Failed to save settings', 'error');
        }
    }

    cancel() {
        // Restore original settings
        if (this.originalSettings) {
            this.settings = { ...this.originalSettings };
            this.populateSettings();
        }
        this.close();
    }

    open() {
        if (this.isOpen) return;

        // Save original settings for cancel
        this.originalSettings = { ...this.settings };

        this.overlay.classList.add('active');
        this.isOpen = true;

        // Switch to first tab
        this.switchTab('audio');

        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.isOpen) return;

        this.overlay.classList.remove('active');
        this.isOpen = false;

        // Cancel any keybind listening
        if (this.keybindListening) {
            this.keybindListening.element.classList.remove('listening');
            this.keybindListening = null;
        }

        // Re-enable body scroll
        document.body.style.overflow = '';
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `settings-notification ${type}`;
        notification.textContent = message;

        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--settings-bg-card);
            border: 1px solid var(--settings-${type});
            border-radius: 0.5rem;
            color: var(--settings-text-primary);
            box-shadow: var(--settings-shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    camelToKebab(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    // Public API for game integration
    getSetting(key) {
        return this.settings[key];
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    getKeybind(action) {
        return this.settings.keybinds[action];
    }

    isKeybound(key, action) {
        return this.settings.keybinds[action] === key;
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .high-contrast {
        filter: contrast(1.5);
    }

    .dyslexia-font {
        font-family: 'OpenDyslexic', sans-serif;
    }

    .reduced-motion * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }

    [data-colorblind-mode="protanopia"] {
        filter: url('#protanopia-filter');
    }

    [data-colorblind-mode="deuteranopia"] {
        filter: url('#deuteranopia-filter');
    }

    [data-colorblind-mode="tritanopia"] {
        filter: url('#tritanopia-filter');
    }
`;
document.head.appendChild(style);

// Initialize settings overlay manager
let settingsOverlayManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        settingsOverlayManager = new SettingsOverlayManager();
    });
} else {
    settingsOverlayManager = new SettingsOverlayManager();
}

// Export for global access
window.SettingsOverlayManager = SettingsOverlayManager;
window.settingsOverlay = settingsOverlayManager;
