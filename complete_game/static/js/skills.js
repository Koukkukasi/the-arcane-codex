/**
 * SKILLS & ABILITIES SYSTEM - PRODUCTION
 * =======================================
 * Modular skill tree, ability management, action bar, and cooldown tracking
 * Integrates with backend API for persistence
 */

/* ==========================================
   STATE MANAGEMENT
   ========================================== */

const SkillsState = {
  player: {
    level: 1,
    skillPoints: 0,
    skillsSpent: 0
  },
  activeTab: "skill-tree",
  activeSpec: "battle-mage",
  selectedSkill: null,
  actionBar: Array(8).fill(null).map((_, i) => ({ slot: i, abilityId: null })),
  cooldowns: {}, // { abilityId: { remaining: 0, total: 0, endTime: 0 } }
  abilities: {},
  skillTree: {},
  hotkeys: {}
};

/* ==========================================
   INITIALIZATION
   ========================================== */

class SkillsSystem {
  constructor() {
    this.initialized = false;
    this.cooldownInterval = null;
  }

  async init() {
    if (this.initialized) return;

    console.log('[Skills] Initializing Skills & Abilities System...');

    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }

    this.initialized = true;
  }

  setup() {
    this.initializeOverlay();
    this.initializeTabs();
    this.initializeActionBar();
    this.initializeKeyboardShortcuts();
    this.initializeCooldownSystem();

    // Load data from backend
    this.loadSkillData();

    console.log('[Skills] System initialized successfully');
  }

  /* ==========================================
     DATA LOADING
     ========================================== */

  async loadSkillData() {
    try {
      console.log('[Skills] Loading skill tree data...');

      const data = await apiCall('/api/skills/tree');

      if (data && data.success) {
        // Update state
        SkillsState.abilities = this.normalizeAbilities(data.abilities || []);
        SkillsState.skillTree = data.skill_tree || {};
        SkillsState.player.skillPoints = data.skill_points || 0;
        SkillsState.player.skillsSpent = data.skills_spent || 0;
        SkillsState.player.level = data.player_level || 1;
        SkillsState.hotkeys = data.hotkeys || {};

        // Render UI
        this.renderSkillTree(data.abilities || []);
        this.renderAllAbilities(data.abilities || []);
        this.restoreHotkeys(data.hotkeys || {});
        this.updateSkillPointsDisplay();

        console.log('[Skills] Data loaded successfully');
      }
    } catch (error) {
      console.error('[Skills] Failed to load skill data:', error);
      ErrorHandler.showErrorToUser('Failed to load skills. Please refresh the page.');
    }
  }

  normalizeAbilities(abilities) {
    const normalized = {};
    abilities.forEach(ability => {
      normalized[ability.id] = ability;
    });
    return normalized;
  }

  /* ==========================================
     SKILL TREE RENDERING
     ========================================== */

  renderSkillTree(abilities) {
    const treeContainer = document.querySelector('.skill-tree-canvas');
    if (!treeContainer) return;

    // Clear existing nodes (keep SVG)
    const tiers = treeContainer.querySelectorAll('.skill-tree-tier');
    tiers.forEach(tier => {
      const row = tier.querySelector('.skill-tree-row');
      if (row) row.innerHTML = '';
    });

    // Group abilities by tier
    const tierGroups = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    abilities.forEach(ability => {
      const tier = ability.tier || 1;
      if (tierGroups[tier]) {
        tierGroups[tier].push(ability);
      }
    });

    // Render each tier
    for (let tier = 1; tier <= 5; tier++) {
      const tierDiv = treeContainer.querySelector(`[data-tier="${tier}"] .skill-tree-row`);
      if (!tierDiv) continue;

      tierGroups[tier].forEach((ability, index) => {
        const node = this.createSkillNode(ability, index, tierGroups[tier].length);
        tierDiv.appendChild(node);
      });
    }

    // Draw connection lines
    this.drawSkillConnections(abilities);

    // Initialize skill node interactions
    this.initializeSkillNodes();
  }

  createSkillNode(ability, index, totalInTier) {
    const node = document.createElement('div');

    // Calculate horizontal position
    const spacing = 100 / (totalInTier + 1);
    const left = spacing * (index + 1);

    // Determine node state classes
    const classes = ['skill-node'];
    if (ability.unlocked) classes.push('unlocked');
    if (ability.locked) classes.push('locked');
    if (ability.available) classes.push('available');
    if (ability.current_rank === ability.max_rank) classes.push('max-rank');
    if (ability.is_ultimate) classes.push('ultimate');

    node.className = classes.join(' ');
    node.dataset.skillId = ability.id;
    node.style.left = `${left}%`;
    node.style.top = '50%';

    node.innerHTML = `
      <div class="skill-node-icon">${ability.locked ? '' : ability.icon || '⚔️'}</div>
      ${ability.locked ? '<div class="skill-node-icon locked-icon"></div>' : ''}
      <div class="skill-node-rank">${ability.current_rank || 0}/${ability.max_rank || 5}</div>
      <div class="skill-node-name">${ability.name}</div>
      ${ability.locked ? `<div class="skill-node-requirement">${ability.requirement_text || 'Locked'}</div>` : ''}
      ${ability.available ? '<div class="skill-node-pulse"></div>' : ''}
    `;

    return node;
  }

  drawSkillConnections(abilities) {
    const svg = document.querySelector('.skill-tree-connections');
    if (!svg) return;

    // Clear existing lines
    svg.innerHTML = '';

    abilities.forEach(ability => {
      if (!ability.prerequisites || ability.prerequisites.length === 0) return;

      ability.prerequisites.forEach(prereqId => {
        const line = this.createConnectionLine(prereqId, ability.id, ability.unlocked);
        if (line) svg.appendChild(line);
      });
    });
  }

  createConnectionLine(fromId, toId, unlocked = false) {
    const fromNode = document.querySelector(`[data-skill-id="${fromId}"]`);
    const toNode = document.querySelector(`[data-skill-id="${toId}"]`);

    if (!fromNode || !toNode) return null;

    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();
    const svgRect = document.querySelector('.skill-tree-connections').getBoundingClientRect();

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromRect.left - svgRect.left + fromRect.width / 2);
    line.setAttribute('y1', fromRect.top - svgRect.top + fromRect.height);
    line.setAttribute('x2', toRect.left - svgRect.left + toRect.width / 2);
    line.setAttribute('y2', toRect.top - svgRect.top);
    line.setAttribute('class', unlocked ? 'tree-connection unlocked' : 'tree-connection locked');

    return line;
  }

  initializeSkillNodes() {
    const skillNodes = document.querySelectorAll('.skill-node');

    skillNodes.forEach(node => {
      node.addEventListener('click', () => this.handleSkillNodeClick(node));
      node.addEventListener('mouseenter', (e) => this.showSkillTooltip(e, node));
      node.addEventListener('mouseleave', () => this.hideSkillTooltip());
    });
  }

  handleSkillNodeClick(node) {
    const skillId = node.dataset.skillId;
    const isLocked = node.classList.contains('locked');

    if (isLocked) {
      this.showLockedSkillMessage(node);
      return;
    }

    // Show skill details
    this.showSkillDetails(skillId);

    // Visual feedback
    document.querySelectorAll('.skill-node').forEach(n => n.classList.remove('selected'));
    node.classList.add('selected');
  }

  showSkillDetails(skillId) {
    const ability = SkillsState.abilities[skillId];
    if (!ability) return;

    const noSelection = document.querySelector('.no-skill-selected');
    const details = document.querySelector('.skill-details');

    if (noSelection) noSelection.style.display = 'none';
    if (details) {
      details.style.display = 'flex';
      this.populateSkillDetails(ability);
    }

    SkillsState.selectedSkill = skillId;
  }

  populateSkillDetails(ability) {
    // Update icon
    const iconEl = document.querySelector('.skill-detail-icon');
    if (iconEl) iconEl.textContent = ability.icon || '⚔️';

    // Update title
    const titleEl = document.querySelector('.skill-detail-title h3');
    if (titleEl) titleEl.textContent = ability.name;

    // Update type
    const typeEl = document.querySelector('.skill-detail-type');
    if (typeEl) typeEl.textContent = ability.type || 'Active Ability';

    // Update rank
    const rankLabel = document.querySelector('.rank-label');
    if (rankLabel) rankLabel.textContent = `Current Rank: ${ability.current_rank}/${ability.max_rank}`;

    const rankBar = document.querySelector('.rank-progress-bar');
    if (rankBar) {
      const progress = (ability.current_rank / ability.max_rank) * 100;
      rankBar.style.width = `${progress}%`;
    }

    // Update description
    const descEl = document.querySelector('.skill-detail-description p');
    if (descEl) descEl.textContent = ability.description || '';

    // Update lore
    const loreEl = document.querySelector('.skill-detail-lore p');
    if (loreEl) loreEl.innerHTML = `<em>${ability.lore || ''}</em>`;

    // Update stats
    const statsContainer = document.querySelector('.skill-detail-stats');
    if (statsContainer && ability.effects) {
      const currentEffect = ability.effects[ability.current_rank - 1];
      if (currentEffect) {
        let statsHTML = '<h4>Current Effects</h4>';
        Object.entries(currentEffect.stats || {}).forEach(([key, value]) => {
          statsHTML += `
            <div class="stat-line">
              <span class="stat-label">${this.formatStatName(key)}:</span>
              <span class="stat-value">+${value}%</span>
            </div>
          `;
        });
        statsContainer.innerHTML = statsHTML;
      }
    }

    // Update invest button
    const investBtn = document.querySelector('.btn-invest-point');
    if (investBtn) {
      const canInvest = SkillsState.player.skillPoints > 0 && ability.current_rank < ability.max_rank;
      investBtn.disabled = !canInvest;
      investBtn.textContent = ability.current_rank >= ability.max_rank ? 'MAX RANK' : `Invest Point (${SkillsState.player.skillPoints} available)`;
    }
  }

  formatStatName(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  showLockedSkillMessage(node) {
    const requirement = node.querySelector('.skill-node-requirement');
    if (requirement) {
      // Shake animation
      node.style.animation = 'shake 0.5s';
      setTimeout(() => { node.style.animation = ''; }, 500);

      // Show notification
      if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.showErrorToUser(requirement.textContent);
      }
    }
  }

  showSkillTooltip(e, node) {
    const skillId = node.dataset.skillId;
    const ability = SkillsState.abilities[skillId];
    if (!ability) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-title">${ability.name}</div>
      <div class="tooltip-rank">Rank ${ability.current_rank}/${ability.max_rank}</div>
      <div class="tooltip-desc">${ability.description || ''}</div>
    `;

    tooltip.style.cssText = `
      position: fixed;
      z-index: 10000;
      background: var(--color-shadow-900, #18181b);
      border: 2px solid var(--color-arcane-500, #8b1fff);
      border-radius: var(--radius-md, 8px);
      padding: var(--space-3, 12px);
      max-width: 300px;
      pointer-events: none;
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = node.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.right + 10;
    let top = rect.top;

    // Adjust if off-screen
    if (left + tooltipRect.width > window.innerWidth) {
      left = rect.left - tooltipRect.width - 10;
    }
    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  hideSkillTooltip() {
    const tooltip = document.querySelector('.skill-tooltip');
    if (tooltip) tooltip.remove();
  }

  /* ==========================================
     SKILL POINT INVESTMENT
     ========================================== */

  async investSkillPoint() {
    if (!SkillsState.selectedSkill) return;
    if (SkillsState.player.skillPoints <= 0) {
      ErrorHandler.showErrorToUser('No skill points available');
      return;
    }

    try {
      const result = await apiCall('/api/skills/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ability_id: SkillsState.selectedSkill })
      });

      if (result.success) {
        // Update local state
        SkillsState.player.skillPoints = result.skill_points;
        SkillsState.player.skillsSpent = result.skills_spent;

        // Reload skill tree
        await this.loadSkillData();

        // Show celebration
        this.showSkillUnlockCelebration(result.ability.name);

        // Update display
        this.updateSkillPointsDisplay();
      } else {
        ErrorHandler.showErrorToUser(result.error || 'Failed to invest skill point');
      }
    } catch (error) {
      console.error('[Skills] Failed to invest point:', error);
      ErrorHandler.showErrorToUser('Failed to invest skill point');
    }
  }

  async refundSkillPoints() {
    const cost = SkillsState.player.skillsSpent;

    if (!confirm(`Refund all skill points for ${cost} gold?`)) return;

    try {
      const result = await apiCall('/api/skills/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (result.success) {
        SkillsState.player.skillPoints = result.skill_points;
        SkillsState.player.skillsSpent = 0;

        await this.loadSkillData();
        this.updateSkillPointsDisplay();

        ErrorHandler.showSuccessToUser(`Skills refunded! You paid ${cost} gold.`);
      } else {
        ErrorHandler.showErrorToUser(result.error || 'Failed to refund skills');
      }
    } catch (error) {
      console.error('[Skills] Failed to refund:', error);
      ErrorHandler.showErrorToUser('Failed to refund skill points');
    }
  }

  updateSkillPointsDisplay() {
    const availableEl = document.querySelector('.skill-points-available .skill-points-value');
    const totalEl = document.querySelector('.skill-points-total .skill-points-value');

    if (availableEl) availableEl.textContent = SkillsState.player.skillPoints;
    if (totalEl) totalEl.textContent = `${SkillsState.player.skillsSpent}/50`;
  }

  /* ==========================================
     ALL ABILITIES TAB
     ========================================== */

  renderAllAbilities(abilities) {
    const grid = document.querySelector('.abilities-grid');
    if (!grid) return;

    grid.innerHTML = '';

    abilities.forEach(ability => {
      const card = this.createAbilityCard(ability);
      grid.appendChild(card);
    });

    this.initializeAbilityCards();
  }

  createAbilityCard(ability) {
    const card = document.createElement('div');
    const classes = ['ability-card'];

    if (ability.unlocked) {
      classes.push('unlocked', 'draggable');
    } else {
      classes.push('locked');
    }

    card.className = classes.join(' ');
    card.dataset.abilityId = ability.id;
    if (ability.unlocked) card.draggable = true;

    const hotkey = this.getAbilityHotkey(ability.id);

    card.innerHTML = `
      <div class="ability-card-header">
        <div class="ability-card-icon">${ability.locked ? '' : ability.icon || '⚔️'}</div>
        <div class="ability-card-level">Rank ${ability.current_rank || 0}</div>
      </div>
      <div class="ability-card-body">
        <h4 class="ability-card-name">${ability.name}</h4>
        <div class="ability-card-type">${ability.category || 'Combat'}</div>
        ${ability.unlocked ? `
          <div class="ability-card-cost">
            <span class="cost-label">Cost:</span>
            <span class="cost-value">${ability.cost_value || 0} ${ability.cost_type || 'SP'}</span>
          </div>
          <div class="ability-card-cooldown">
            <span class="cooldown-label">Cooldown:</span>
            <span class="cooldown-value">${ability.cooldown || 0}s</span>
          </div>
        ` : `
          <div class="ability-card-requirement">${ability.requirement_text || 'Locked'}</div>
        `}
      </div>
      <div class="ability-card-footer">
        <button class="btn-ability-details">View Details</button>
      </div>
      ${hotkey ? `<div class="ability-assigned-badge">Hotkey: ${hotkey}</div>` : ''}
    `;

    return card;
  }

  getAbilityHotkey(abilityId) {
    for (let i = 0; i < SkillsState.actionBar.length; i++) {
      if (SkillsState.actionBar[i].abilityId === abilityId) {
        return i + 1;
      }
    }
    return null;
  }

  initializeAbilityCards() {
    const cards = document.querySelectorAll('.ability-card');

    cards.forEach(card => {
      if (card.classList.contains('draggable')) {
        card.addEventListener('dragstart', (e) => this.handleAbilityDragStart(e));
        card.addEventListener('dragend', (e) => this.handleAbilityDragEnd(e));
      }

      const detailsBtn = card.querySelector('.btn-ability-details');
      if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const abilityId = card.dataset.abilityId;
          this.showAbilityDetailModal(abilityId);
        });
      }
    });

    // Search and filters
    const searchInput = document.querySelector('.ability-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterAbilities(e.target.value));
    }

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterAbilitiesByCategory(btn.dataset.filter);
      });
    });
  }

  filterAbilities(searchTerm) {
    const cards = document.querySelectorAll('.ability-card');
    const term = searchTerm.toLowerCase();

    cards.forEach(card => {
      const name = card.querySelector('.ability-card-name').textContent.toLowerCase();
      const type = card.querySelector('.ability-card-type').textContent.toLowerCase();

      card.style.display = (name.includes(term) || type.includes(term)) ? 'block' : 'none';
    });
  }

  filterAbilitiesByCategory(category) {
    const cards = document.querySelectorAll('.ability-card');

    cards.forEach(card => {
      if (category === 'all') {
        card.style.display = 'block';
      } else if (category === 'unlocked') {
        card.style.display = card.classList.contains('unlocked') ? 'block' : 'none';
      } else {
        const type = card.querySelector('.ability-card-type').textContent.toLowerCase();
        card.style.display = type.includes(category) ? 'block' : 'none';
      }
    });
  }

  showAbilityDetailModal(abilityId) {
    const modal = document.getElementById('ability-detail-modal');
    if (!modal) return;

    const ability = SkillsState.abilities[abilityId];
    if (!ability) return;

    // Populate modal (simplified for now)
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Close handlers
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    };

    const btnClose = modal.querySelector('.btn-close-modal');
    const backdrop = modal.querySelector('.modal-backdrop');

    if (btnClose) btnClose.onclick = closeModal;
    if (backdrop) backdrop.onclick = closeModal;
  }

  /* ==========================================
     ACTION BAR
     ========================================== */

  initializeActionBar() {
    const actionSlots = document.querySelectorAll('.action-slot');

    actionSlots.forEach((slot, index) => {
      // Drop zone events
      slot.addEventListener('dragover', (e) => this.handleSlotDragOver(e));
      slot.addEventListener('dragleave', (e) => this.handleSlotDragLeave(e));
      slot.addEventListener('drop', (e) => this.handleSlotDrop(e));

      // Click to activate
      slot.addEventListener('click', () => {
        const abilityId = slot.dataset.abilityId;
        if (abilityId) this.activateAbility(abilityId);
      });

      // Right-click to remove
      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const abilityId = slot.dataset.abilityId;
        if (abilityId) this.removeAbilityFromSlot(index + 1);
      });
    });
  }

  handleAbilityDragStart(e) {
    const abilityId = e.target.dataset.abilityId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', abilityId);
    e.target.style.opacity = '0.5';
  }

  handleAbilityDragEnd(e) {
    e.target.style.opacity = '1';
    document.querySelectorAll('.action-slot').forEach(slot => {
      slot.classList.remove('drag-over');
    });
  }

  handleSlotDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  }

  handleSlotDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  async handleSlotDrop(e) {
    e.preventDefault();
    const slot = e.currentTarget;
    const abilityId = e.dataTransfer.getData('text/plain');
    const hotkey = parseInt(slot.dataset.hotkey);

    slot.classList.remove('drag-over');

    await this.assignAbilityToSlot(abilityId, hotkey);
  }

  async assignAbilityToSlot(abilityId, hotkey) {
    try {
      const result = await apiCall('/api/skills/assign_hotkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ability_id: abilityId, hotkey: hotkey })
      });

      if (result.success) {
        // Update local state
        SkillsState.actionBar[hotkey - 1] = { slot: hotkey - 1, abilityId: abilityId };
        SkillsState.hotkeys[hotkey] = abilityId;

        // Update UI
        this.updateActionSlot(hotkey, abilityId);
        this.renderAllAbilities(Object.values(SkillsState.abilities));

        ErrorHandler.showSuccessToUser(`Ability assigned to hotkey ${hotkey}`);
      } else {
        ErrorHandler.showErrorToUser(result.error || 'Failed to assign ability');
      }
    } catch (error) {
      console.error('[Skills] Failed to assign ability:', error);
      ErrorHandler.showErrorToUser('Failed to assign ability');
    }
  }

  async removeAbilityFromSlot(hotkey) {
    try {
      const result = await apiCall('/api/skills/assign_hotkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ability_id: null, hotkey: hotkey })
      });

      if (result.success) {
        SkillsState.actionBar[hotkey - 1] = { slot: hotkey - 1, abilityId: null };
        delete SkillsState.hotkeys[hotkey];

        this.updateActionSlot(hotkey, null);
        this.renderAllAbilities(Object.values(SkillsState.abilities));

        ErrorHandler.showSuccessToUser('Ability removed from action bar');
      }
    } catch (error) {
      console.error('[Skills] Failed to remove ability:', error);
    }
  }

  updateActionSlot(hotkey, abilityId) {
    const slot = document.querySelector(`.action-slot[data-hotkey="${hotkey}"]`);
    if (!slot) return;

    if (abilityId) {
      const ability = SkillsState.abilities[abilityId];
      if (!ability) return;

      slot.classList.remove('empty');
      slot.dataset.abilityId = abilityId;

      let iconEl = slot.querySelector('.ability-icon');
      if (!iconEl) {
        iconEl = document.createElement('div');
        iconEl.className = 'ability-icon';
        slot.insertBefore(iconEl, slot.firstChild);
      }
      iconEl.textContent = ability.icon || '⚔️';

      const hint = slot.querySelector('.empty-slot-hint');
      if (hint) hint.remove();
    } else {
      slot.classList.add('empty');
      slot.dataset.abilityId = '';

      const iconEl = slot.querySelector('.ability-icon');
      if (iconEl) iconEl.remove();

      if (!slot.querySelector('.empty-slot-hint')) {
        const hint = document.createElement('div');
        hint.className = 'empty-slot-hint';
        hint.textContent = 'Drag ability here';
        slot.appendChild(hint);
      }
    }
  }

  restoreHotkeys(hotkeys) {
    Object.entries(hotkeys).forEach(([hotkey, abilityId]) => {
      this.updateActionSlot(parseInt(hotkey), abilityId);
    });
  }

  /* ==========================================
     ABILITY ACTIVATION
     ========================================== */

  async activateAbility(abilityId) {
    const ability = SkillsState.abilities[abilityId];
    if (!ability) return;

    // Check cooldown
    if (SkillsState.cooldowns[abilityId] && SkillsState.cooldowns[abilityId].remaining > 0) {
      ErrorHandler.showErrorToUser(`On cooldown for ${SkillsState.cooldowns[abilityId].remaining.toFixed(1)}s`);
      return;
    }

    try {
      const result = await apiCall('/api/skills/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ability_id: abilityId })
      });

      if (result.success) {
        // Start cooldown
        this.startCooldown(abilityId, ability.cooldown || 0);

        // Visual feedback
        this.showAbilityActivation(abilityId);

        ErrorHandler.showSuccessToUser(`${ability.name} activated!`);
      } else {
        ErrorHandler.showErrorToUser(result.error || 'Cannot use ability');
      }
    } catch (error) {
      console.error('[Skills] Failed to activate ability:', error);
      ErrorHandler.showErrorToUser('Failed to activate ability');
    }
  }

  /* ==========================================
     COOLDOWN SYSTEM
     ========================================== */

  initializeCooldownSystem() {
    if (this.cooldownInterval) return;

    this.cooldownInterval = setInterval(() => this.updateCooldowns(), 100);
  }

  startCooldown(abilityId, duration) {
    SkillsState.cooldowns[abilityId] = {
      remaining: duration,
      total: duration,
      endTime: Date.now() + (duration * 1000)
    };

    const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
    if (!slot) return;

    let overlay = slot.querySelector('.ability-cooldown-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'ability-cooldown-overlay';
      overlay.innerHTML = `
        <div class="cooldown-progress"></div>
        <div class="cooldown-text"></div>
      `;
      slot.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  updateCooldowns() {
    const now = Date.now();

    Object.keys(SkillsState.cooldowns).forEach(abilityId => {
      const cooldown = SkillsState.cooldowns[abilityId];
      cooldown.remaining = Math.max(0, (cooldown.endTime - now) / 1000);

      if (cooldown.remaining <= 0) {
        this.completeCooldown(abilityId);
      } else {
        this.updateCooldownDisplay(abilityId, cooldown);
      }
    });
  }

  updateCooldownDisplay(abilityId, cooldown) {
    const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
    if (!slot) return;

    const overlay = slot.querySelector('.ability-cooldown-overlay');
    const progress = overlay?.querySelector('.cooldown-progress');
    const text = overlay?.querySelector('.cooldown-text');

    if (progress && text) {
      const percentage = (cooldown.remaining / cooldown.total);
      progress.style.transform = `scaleY(${percentage})`;
      text.textContent = cooldown.remaining.toFixed(1) + 's';
    }
  }

  completeCooldown(abilityId) {
    delete SkillsState.cooldowns[abilityId];

    const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
    if (!slot) return;

    const overlay = slot.querySelector('.ability-cooldown-overlay');
    if (overlay) overlay.style.display = 'none';

    // Visual feedback
    slot.style.animation = 'pulse 0.5s';
    setTimeout(() => { slot.style.animation = ''; }, 500);
  }

  showAbilityActivation(abilityId) {
    const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
    if (!slot) return;

    slot.style.animation = 'pulse 0.3s';
    setTimeout(() => { slot.style.animation = ''; }, 300);
  }

  /* ==========================================
     KEYBOARD SHORTCUTS
     ========================================== */

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Number keys 1-8 for abilities
      if (e.key >= '1' && e.key <= '8') {
        const slotIndex = parseInt(e.key) - 1;
        const actionSlot = SkillsState.actionBar[slotIndex];

        if (actionSlot && actionSlot.abilityId) {
          this.activateAbility(actionSlot.abilityId);
        }
      }

      // K key to open skills panel
      if (e.key.toLowerCase() === 'k' && !e.ctrlKey && !e.altKey) {
        const overlay = document.getElementById('skills-overlay');
        if (overlay && !overlay.classList.contains('active')) {
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  /* ==========================================
     OVERLAY MANAGEMENT
     ========================================== */

  initializeOverlay() {
    const btnOpen = document.querySelector('.btn-open-skills');
    const btnClose = document.querySelector('.btn-close-overlay');
    const overlay = document.getElementById('skills-overlay');

    if (!overlay) return;

    const backdrop = overlay.querySelector('.overlay-backdrop');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    const closeOverlay = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (btnClose) btnClose.addEventListener('click', closeOverlay);
    if (backdrop) backdrop.addEventListener('click', closeOverlay);

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeOverlay();
      }
    });
  }

  /* ==========================================
     TAB NAVIGATION
     ========================================== */

  initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === `tab-${targetTab}`) {
            content.classList.add('active');
          }
        });

        SkillsState.activeTab = targetTab;
      });
    });

    // Invest/Refund button handlers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-invest-point')) {
        this.investSkillPoint();
      }
      if (e.target.classList.contains('btn-refund-points')) {
        this.refundSkillPoints();
      }
    });
  }

  /* ==========================================
     CELEBRATIONS
     ========================================== */

  showSkillUnlockCelebration(skillName) {
    const celebration = document.getElementById('skill-unlock-celebration');
    if (!celebration) return;

    celebration.style.display = 'flex';

    const nameEl = celebration.querySelector('.celebration-skill-name');
    if (nameEl) nameEl.textContent = skillName;

    const btnClose = celebration.querySelector('.btn-close-celebration');
    const closeCelebration = () => {
      celebration.style.display = 'none';
    };

    if (btnClose) {
      btnClose.onclick = closeCelebration;
    }

    setTimeout(closeCelebration, 3000);
  }
}

/* ==========================================
   GLOBAL INSTANCE
   ========================================== */

const skillsSystem = new SkillsSystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => skillsSystem.init());
} else {
  skillsSystem.init();
}

// Export for external use
window.SkillsSystem = skillsSystem;
window.SkillsState = SkillsState;
