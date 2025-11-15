/**
 * The Arcane Codex - Divine Council Voting System
 * Phase G: SVG Graphics Integration
 *
 * This module handles the dramatic Divine Council voting visualization
 * showing god votes on player choices with animated god icons.
 *
 * @author The Arcane Codex Development Team
 * @version 1.0.0
 */

class DivineCouncil {
  constructor() {
    // God data with SVG paths and metadata
    this.gods = {
      valdris: {
        icon: '/static/images/god_valdris.svg',
        name: 'Valdris',
        title: 'God of Order & Justice',
        color: '#2563EB',
        domain: 'Order',
        alignments: ['lawful', 'just', 'honorable']
      },
      kaitha: {
        icon: '/static/images/god_kaitha.svg',
        name: 'Kaitha',
        title: 'Goddess of Chaos & Freedom',
        color: '#F59E0B',
        domain: 'Chaos',
        alignments: ['chaotic', 'rebellious', 'free']
      },
      morvane: {
        icon: '/static/images/god_morvane.svg',
        name: 'Morvane',
        title: 'God of Death & Survival',
        color: '#7C3AED',
        domain: 'Death',
        alignments: ['pragmatic', 'ruthless', 'survivor']
      },
      sylara: {
        icon: '/static/images/god_sylara.svg',
        name: 'Sylara',
        title: 'Goddess of Nature & Balance',
        color: '#059669',
        domain: 'Nature',
        alignments: ['balanced', 'natural', 'harmonious']
      },
      korvan: {
        icon: '/static/images/god_korvan.svg',
        name: 'Korvan',
        title: 'God of War & Honor',
        color: '#DC2626',
        domain: 'War',
        alignments: ['brave', 'martial', 'fierce']
      },
      athena: {
        icon: '/static/images/god_athena.svg',
        name: 'Athena',
        title: 'Goddess of Wisdom & Knowledge',
        color: '#2563EB',
        domain: 'Wisdom',
        alignments: ['wise', 'scholarly', 'strategic']
      },
      mercus: {
        icon: '/static/images/god_mercus.svg',
        name: 'Mercus',
        title: 'God of Commerce & Wealth',
        color: '#D4AF37',
        domain: 'Commerce',
        alignments: ['profitable', 'practical', 'wealthy']
      }
    };

    // Initialize DOM references
    this.modal = null;
    this.approveList = null;
    this.condemnList = null;
    this.judgmentText = null;
    this.choiceText = null;

    // Bind methods
    this.showVoting = this.showVoting.bind(this);
    this.hideVoting = this.hideVoting.bind(this);
    this.handleContinue = this.handleContinue.bind(this);
  }

  /**
   * Initialize the Divine Council system
   * Call this after DOM is loaded
   */
  init() {
    // Get DOM references
    this.modal = document.getElementById('council-voting-modal');
    this.approveList = document.getElementById('approve-gods');
    this.condemnList = document.getElementById('condemn-gods');
    this.judgmentText = document.getElementById('judgment-text');
    this.choiceText = document.getElementById('choice-text');

    // Set up event listeners
    const continueBtn = document.querySelector('.council-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', this.handleContinue);
    }

    // Close on backdrop click
    const backdrop = document.querySelector('.mystical-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', this.handleContinue);
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.handleContinue();
      }
    });

    console.log('[Divine Council] Initialized successfully');
  }

  /**
   * Show voting modal with animated god decisions
   * @param {Object} voteData - Contains approve/condemn arrays and reasons
   * @param {Array} voteData.approve - Array of god keys who approve
   * @param {Array} voteData.condemn - Array of god keys who condemn
   * @param {Object} voteData.reasons - Reasons for each god's vote
   * @param {string} voteData.judgment - Final judgment text
   * @param {string} voteData.choice - The choice made by the player
   */
  showVoting(voteData) {
    if (!this.modal) {
      console.error('[Divine Council] Modal not found. Call init() first.');
      return;
    }

    // Validate vote data
    if (!voteData || !voteData.approve || !voteData.condemn || !voteData.reasons) {
      console.error('[Divine Council] Invalid vote data provided');
      return;
    }

    console.log('[Divine Council] Showing voting modal', voteData);

    // Clear previous votes
    this.approveList.innerHTML = '';
    this.condemnList.innerHTML = '';

    // Set choice text
    if (this.choiceText && voteData.choice) {
      this.choiceText.textContent = voteData.choice;
    }

    // Populate approve votes
    voteData.approve.forEach((godKey, index) => {
      if (!this.gods[godKey]) {
        console.warn(`[Divine Council] Unknown god: ${godKey}`);
        return;
      }

      const card = this.createGodVoteCard(
        godKey,
        voteData.reasons[godKey] || 'Their reasoning is mysterious...',
        index
      );
      this.approveList.appendChild(card);
    });

    // Populate condemn votes
    voteData.condemn.forEach((godKey, index) => {
      if (!this.gods[godKey]) {
        console.warn(`[Divine Council] Unknown god: ${godKey}`);
        return;
      }

      const card = this.createGodVoteCard(
        godKey,
        voteData.reasons[godKey] || 'Their reasoning is mysterious...',
        index
      );
      this.condemnList.appendChild(card);
    });

    // Set judgment text
    if (this.judgmentText && voteData.judgment) {
      this.judgmentText.textContent = voteData.judgment;
    }

    // Calculate vote summary
    const approveCount = voteData.approve.length;
    const condemnCount = voteData.condemn.length;
    const totalVotes = approveCount + condemnCount;

    console.log(`[Divine Council] Vote tally: ${approveCount} approve, ${condemnCount} condemn`);

    // Show modal with animation
    setTimeout(() => {
      this.modal.classList.add('active');
    }, 50);

    // Play sound effect if available
    this.playSound('divine_council_open');
  }

  /**
   * Create a god vote card element
   * @param {string} godKey - Key from this.gods
   * @param {string} reason - Reason for the god's vote
   * @param {number} index - Index for animation stagger
   * @returns {HTMLElement} The vote card element
   */
  createGodVoteCard(godKey, reason, index = 0) {
    const god = this.gods[godKey];

    const card = document.createElement('div');
    card.className = 'god-vote-card';
    card.setAttribute('data-god', godKey);
    card.setAttribute('data-index', index);

    // Apply staggered animation delay
    card.style.animationDelay = `${index * 0.2 + 0.1}s`;

    card.innerHTML = `
      <img src="${god.icon}"
           alt="${god.name}"
           class="god-icon-large"
           width="56"
           height="56"
           loading="eager">
      <div class="god-vote-info">
        <div class="god-vote-name" style="color: ${god.color}">
          ${god.name.toUpperCase()}
        </div>
        <div class="god-vote-reason">"${this.escapeHtml(reason)}"</div>
      </div>
    `;

    // Add hover tooltip with god domain
    card.title = `${god.title} - Domain: ${god.domain}`;

    return card;
  }

  /**
   * Hide voting modal
   */
  hideVoting() {
    if (!this.modal) return;

    console.log('[Divine Council] Hiding voting modal');

    this.modal.classList.remove('active');

    // Play sound effect if available
    this.playSound('divine_council_close');
  }

  /**
   * Handle continue button click
   */
  handleContinue() {
    this.hideVoting();

    // Call callback if provided
    if (this.onContinue && typeof this.onContinue === 'function') {
      this.onContinue();
    }
  }

  /**
   * Fetch voting results from backend
   * @param {number|string} choiceId - The choice ID to vote on
   * @returns {Promise<Object>} Voting results from backend
   */
  async fetchVotingResults(choiceId) {
    try {
      const response = await fetch('/api/divine_council/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ choice_id: choiceId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Divine Council] Received voting results from backend:', data);
      return data;
    } catch (error) {
      console.error('[Divine Council] Failed to fetch voting results:', error);
      throw error;
    }
  }

  /**
   * Display voting with backend data and sequential reveal
   * @param {number|string} choiceId - The choice ID to vote on
   */
  async showVotingFromBackend(choiceId) {
    // Show loading state
    if (window.gameUX && typeof window.gameUX.showLoading === 'function') {
      window.gameUX.showLoading('Summoning the Divine Council...');
    }

    try {
      // Fetch voting results from backend
      const results = await this.fetchVotingResults(choiceId);

      // Hide loading state
      if (window.gameUX && typeof window.gameUX.hideLoading === 'function') {
        window.gameUX.hideLoading();
      }

      // Show modal with staggered animations
      this.showVoting({
        approve: results.approve || [],
        condemn: results.condemn || [],
        reasons: results.speeches || results.reasons || {},
        judgment: results.outcome?.description || results.judgment || 'The gods have spoken...',
        choice: results.choice_text || 'make this decision'
      });

      // Set callback for after council closes
      this.onContinue = () => {
        // Apply effects if present
        if (results.effects && Array.isArray(results.effects)) {
          this.applyEffects(results.effects);
        }

        // Call external callback if set
        if (this.externalCallback && typeof this.externalCallback === 'function') {
          this.externalCallback(results);
        }
      };

    } catch (error) {
      // Hide loading on error
      if (window.gameUX && typeof window.gameUX.hideLoading === 'function') {
        window.gameUX.hideLoading();
      }

      // Show error notification
      if (window.gameUX && typeof window.gameUX.showError === 'function') {
        window.gameUX.showError('Failed to summon Divine Council. Please try again.');
      } else {
        alert('Failed to summon Divine Council. Please try again.');
      }

      throw error;
    }
  }

  /**
   * Apply effects to character (blessings/curses)
   * @param {Array} effects - Array of effect objects from backend
   */
  applyEffects(effects) {
    console.log('[Divine Council] Applying effects:', effects);

    // Show notification for each effect
    effects.forEach((effect, index) => {
      setTimeout(() => {
        this.showEffectNotification(effect);
      }, index * 300); // Stagger notifications
    });

    // Refresh character sheet if method exists
    if (window.loadCharacterStats && typeof window.loadCharacterStats === 'function') {
      setTimeout(() => {
        window.loadCharacterStats();
      }, effects.length * 300 + 500);
    }

    // Trigger any game state refresh
    if (window.game && typeof window.game.updateGameState === 'function') {
      setTimeout(() => {
        window.game.updateGameState();
      }, effects.length * 300 + 500);
    }
  }

  /**
   * Show effect notification (blessing or curse)
   * @param {Object} effect - Effect object with type, name, description, duration
   */
  showEffectNotification(effect) {
    // Use global notification system if available
    if (window.showEffectNotification && typeof window.showEffectNotification === 'function') {
      window.showEffectNotification(effect);
      return;
    }

    // Fallback to built-in notification
    const notification = document.createElement('div');
    notification.className = `effect-notification ${effect.type || 'blessing'}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: -400px;
      max-width: 350px;
      background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(26,22,18,0.95));
      border: 2px solid ${effect.type === 'curse' ? '#DC2626' : '#14B8A6'};
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8), 0 0 40px ${effect.type === 'curse' ? 'rgba(220,38,38,0.3)' : 'rgba(20,184,166,0.3)'};
      transition: transform 0.5s ease-out, opacity 0.5s ease-out;
      z-index: 10000;
      opacity: 0;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 32px;">${effect.icon || (effect.type === 'curse' ? '⚡' : '✨')}</div>
        <div style="flex: 1;">
          <strong style="display: block; color: ${effect.type === 'curse' ? '#DC2626' : '#14B8A6'}; font-size: 16px; margin-bottom: 4px;">
            ${effect.name || 'Divine Effect'}
          </strong>
          <span style="display: block; color: #D1D5DB; font-size: 14px; margin-bottom: 4px;">
            ${effect.description || 'The gods have touched you...'}
          </span>
          ${effect.duration ? `<small style="display: block; color: #9CA3AF; font-size: 12px;">Duration: ${effect.duration} turns</small>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Slide in
    setTimeout(() => {
      notification.style.transform = 'translateX(-420px)';
      notification.style.opacity = '1';
    }, 100);

    // Slide out after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  /**
   * Set external callback for after voting closes
   * @param {Function} callback - Callback function
   */
  setExternalCallback(callback) {
    this.externalCallback = callback;
  }

  /**
   * Close the modal (alias for hideVoting)
   */
  closeModal() {
    this.hideVoting();
  }

  /**
   * Set callback for when user continues after voting
   * @param {Function} callback - Function to call when user continues
   */
  setContinueCallback(callback) {
    this.onContinue = callback;
  }

  /**
   * Play sound effect (if audio system is available)
   * @param {string} soundKey - Sound effect key
   */
  playSound(soundKey) {
    // Check if game audio system exists
    if (window.GameAudio && typeof window.GameAudio.play === 'function') {
      window.GameAudio.play(soundKey);
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generate voting data based on player choice and favor levels
   * @param {Object} choice - Player choice object
   * @param {Object} favorLevels - Current favor levels with each god
   * @returns {Object} Vote data ready for showVoting()
   */
  generateVotingData(choice, favorLevels) {
    const approve = [];
    const condemn = [];
    const reasons = {};

    // Example logic - customize based on your game mechanics
    Object.keys(this.gods).forEach(godKey => {
      const god = this.gods[godKey];
      const favor = favorLevels[godKey] || 0;

      // Determine if god approves based on choice alignment and favor
      let approves = false;
      let reason = '';

      // Check if choice aligns with god's domain
      if (choice.alignments && choice.alignments.some(a =>
        god.alignments.includes(a)
      )) {
        approves = true;
        reason = this.generateApprovalReason(god, choice);
      } else {
        approves = false;
        reason = this.generateCondemnReason(god, choice);
      }

      // Favor can influence the vote
      if (favor < -20) {
        approves = false; // Very low favor always condemns
      } else if (favor > 20) {
        approves = true; // Very high favor always approves
      }

      // Add to appropriate list
      if (approves) {
        approve.push(godKey);
      } else {
        condemn.push(godKey);
      }

      reasons[godKey] = reason;
    });

    // Generate judgment based on vote ratio
    const judgment = this.generateJudgment(approve.length, condemn.length);

    return {
      approve,
      condemn,
      reasons,
      judgment,
      choice: choice.text || 'make this decision'
    };
  }

  /**
   * Generate approval reason for a god
   * @private
   */
  generateApprovalReason(god, choice) {
    const templates = {
      valdris: [
        "Justice has been served through order.",
        "You honored the law as you should.",
        "Your decision upholds the cosmic balance."
      ],
      kaitha: [
        "You chose freedom over oppression!",
        "The chains of order are broken. Well done.",
        "Chaos is the natural state. You understand this."
      ],
      morvane: [
        "Only the strong survive. You proved your worth.",
        "Death is inevitable. You accepted this truth.",
        "Pragmatism over idealism. Wise choice."
      ],
      sylara: [
        "Nature's balance is maintained.",
        "Life is precious. You showed wisdom.",
        "The cycle continues as it should."
      ],
      korvan: [
        "You faced danger with courage!",
        "A warrior's choice. You have my respect.",
        "Honor demands no less than what you gave."
      ],
      athena: [
        "Your reasoning was sound and measured.",
        "Knowledge guided your decision wisely.",
        "Strategic thinking prevailed. Excellent."
      ],
      mercus: [
        "Profit was gained through shrewd dealing.",
        "Value was maximized. I approve.",
        "The exchange benefits all parties."
      ]
    };

    const godTemplates = templates[god.domain.toLowerCase()] || templates.valdris;
    return godTemplates[Math.floor(Math.random() * godTemplates.length)];
  }

  /**
   * Generate condemn reason for a god
   * @private
   */
  generateCondemnReason(god, choice) {
    const templates = {
      valdris: [
        "You defied the natural order!",
        "Chaos cannot be permitted. You erred.",
        "Justice demands punishment for this."
      ],
      kaitha: [
        "You bowed to authority like a slave!",
        "Freedom was within reach. You squandered it.",
        "Order stifles the spirit. You embraced it."
      ],
      morvane: [
        "The weak do not deserve mercy.",
        "You showed weakness. Death claims the weak.",
        "Survival of the fittest. You failed."
      ],
      sylara: [
        "Balance was disrupted by your actions.",
        "Nature's harmony was broken.",
        "Life and death must remain balanced."
      ],
      korvan: [
        "You showed cowardice in the face of battle!",
        "A warrior must be ruthless. You were soft.",
        "Honor was forsaken. Unacceptable."
      ],
      athena: [
        "Your logic was flawed and hasty.",
        "Wisdom would have led to a different path.",
        "Knowledge was ignored. Disappointing."
      ],
      mercus: [
        "Profit was lost through foolishness!",
        "Value was squandered carelessly.",
        "The exchange benefits no one. Poor choice."
      ]
    };

    const godTemplates = templates[god.domain.toLowerCase()] || templates.valdris;
    return godTemplates[Math.floor(Math.random() * godTemplates.length)];
  }

  /**
   * Generate final judgment text
   * @private
   */
  generateJudgment(approveCount, condemnCount) {
    const totalVotes = approveCount + condemnCount;
    const approveRatio = approveCount / totalVotes;

    if (approveRatio >= 0.8) {
      return `The Council strongly approves ${approveCount}-${condemnCount}. Divine favor shines upon you!`;
    } else if (approveRatio >= 0.6) {
      return `The Council approves ${approveCount}-${condemnCount}. You have earned their blessing.`;
    } else if (approveRatio >= 0.4) {
      return `The Council is divided ${approveCount}-${condemnCount}. Your fate remains uncertain...`;
    } else if (approveRatio >= 0.2) {
      return `The Council condemns ${approveCount}-${condemnCount}. You have lost their favor.`;
    } else {
      return `The Council strongly condemns ${approveCount}-${condemnCount}. Divine wrath may follow!`;
    }
  }

  /**
   * Update god favor levels based on voting results
   * @param {Object} voteData - The vote data from showVoting
   * @param {Object} currentFavor - Current favor levels
   * @returns {Object} Updated favor levels
   */
  updateFavorLevels(voteData, currentFavor) {
    const newFavor = { ...currentFavor };

    // Increase favor for approving gods
    voteData.approve.forEach(godKey => {
      newFavor[godKey] = (newFavor[godKey] || 0) + 5;
    });

    // Decrease favor for condemning gods
    voteData.condemn.forEach(godKey => {
      newFavor[godKey] = (newFavor[godKey] || 0) - 5;
    });

    // Cap favor at -100 to +100
    Object.keys(newFavor).forEach(godKey => {
      newFavor[godKey] = Math.max(-100, Math.min(100, newFavor[godKey]));
    });

    console.log('[Divine Council] Updated favor levels:', newFavor);

    return newFavor;
  }

  /**
   * Get a god's current attitude toward the player
   * @param {string} godKey - God key
   * @param {number} favorLevel - Current favor level
   * @returns {string} Attitude description
   */
  getGodAttitude(godKey, favorLevel) {
    if (favorLevel >= 80) return 'Blessed Champion';
    if (favorLevel >= 60) return 'Favored Servant';
    if (favorLevel >= 40) return 'Trusted Ally';
    if (favorLevel >= 20) return 'Friendly';
    if (favorLevel >= -20) return 'Neutral';
    if (favorLevel >= -40) return 'Displeased';
    if (favorLevel >= -60) return 'Angered';
    if (favorLevel >= -80) return 'Wrathful';
    return 'Cursed Enemy';
  }
}

// Create singleton instance
const divineCouncil = new DivineCouncil();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    divineCouncil.init();
  });
} else {
  divineCouncil.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DivineCouncil;
}

// Make available globally
window.DivineCouncil = divineCouncil;

// Log successful load
console.log('[Divine Council] Module loaded successfully');

/* ============================================
   EXAMPLE USAGE
   ============================================

// Basic usage - show pre-defined voting results:
divineCouncil.showVoting({
  approve: ['valdris', 'sylara', 'athena'],
  condemn: ['kaitha', 'morvane', 'korvan', 'mercus'],
  reasons: {
    valdris: "Justice demands order. You honored the law.",
    sylara: "Life is precious. Mercy shows wisdom.",
    athena: "Your reasoning was sound and measured.",
    kaitha: "You bowed to authority instead of choosing freedom!",
    morvane: "The weak do not deserve mercy. Only the strong survive.",
    korvan: "You showed weakness in battle. A warrior must be ruthless.",
    mercus: "There was profit to be gained. You squandered opportunity."
  },
  judgment: "The council is divided 3-4. Your choice has cost you favor.",
  choice: "spare the merchant"
});

// Advanced usage - generate voting based on choice:
const playerChoice = {
  text: "spare the merchant",
  alignments: ['lawful', 'just', 'merciful']
};

const currentFavor = {
  valdris: 15,
  kaitha: -10,
  morvane: 20,
  sylara: 5,
  korvan: 25,
  athena: 10,
  mercus: -5
};

const voteData = divineCouncil.generateVotingData(playerChoice, currentFavor);
divineCouncil.showVoting(voteData);

// Update favor after voting:
const newFavor = divineCouncil.updateFavorLevels(voteData, currentFavor);

// Set callback for when user continues:
divineCouncil.setContinueCallback(() => {
  console.log('User clicked continue, proceeding with story...');
  // Continue game logic here
});

============================================ */
