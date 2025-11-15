/**
 * SKILLS & ABILITIES SYSTEM - JAVASCRIPT
 * =======================================
 * Interactive functionality for skill trees, drag-and-drop, cooldowns, and animations
 */

/* ==========================================
   DATA STRUCTURES
   ========================================== */

// Skill Tree Data
const skillTreeData = {
  battleMage: {
    name: "Battle Mage",
    skills: {
      basicCombat: {
        id: "basic-combat",
        name: "Basic Combat",
        icon: "⚔️",
        type: "active",
        maxRank: 5,
        currentRank: 5,
        description: "Master the fundamentals of combat. Increases damage with all weapons and improves combat efficiency.",
        lore: "Every master was once a student. Every legend began with a single strike.",
        effects: [
          { rank: 1, desc: "Weapon Damage: +5%", stats: { weaponDamage: 5 } },
          { rank: 2, desc: "Weapon Damage: +10%", stats: { weaponDamage: 10 } },
          { rank: 3, desc: "Weapon Damage: +15%, Attack Speed: +5%", stats: { weaponDamage: 15, attackSpeed: 5 } },
          { rank: 4, desc: "Weapon Damage: +20%, Attack Speed: +7%", stats: { weaponDamage: 20, attackSpeed: 7 } },
          { rank: 5, desc: "Weapon Damage: +25%, Attack Speed: +10%, Critical: +5%", stats: { weaponDamage: 25, attackSpeed: 10, criticalChance: 5 } }
        ],
        requirements: [
          { type: "level", value: 1, met: true }
        ],
        prerequisites: []
      },
      weaponMastery: {
        id: "weapon-mastery",
        name: "Weapon Mastery",
        icon: "🗡️",
        type: "active",
        maxRank: 5,
        currentRank: 3,
        description: "Specialize in physical weapons, gaining increased damage and critical strike chance.",
        lore: "The weapon is but an extension of the warrior's will.",
        effects: [
          { rank: 1, desc: "Physical Damage: +8%", stats: { physicalDamage: 8 } },
          { rank: 2, desc: "Physical Damage: +16%", stats: { physicalDamage: 16 } },
          { rank: 3, desc: "Physical Damage: +24%, Critical: +3%", stats: { physicalDamage: 24, criticalChance: 3 } },
          { rank: 4, desc: "Physical Damage: +32%, Critical: +5%", stats: { physicalDamage: 32, criticalChance: 5 } },
          { rank: 5, desc: "Physical Damage: +40%, Critical: +8%", stats: { physicalDamage: 40, criticalChance: 8 } }
        ],
        requirements: [
          { type: "level", value: 3, met: true }
        ],
        prerequisites: ["basic-combat"]
      }
      // More skills would be defined here
    }
  }
};

// Ability Data
const abilitiesData = {
  meleeAttack: {
    id: "melee-attack",
    name: "Melee Attack",
    icon: "⚔️",
    type: "active",
    category: "combat",
    rank: 5,
    unlocked: true,
    hotkey: 1,
    description: "A powerful melee strike that deals physical damage to a single target.",
    lore: "The most basic yet effective form of combat. Simple, direct, lethal.",
    cost: { type: "stamina", value: 10 },
    cooldown: 1.5,
    castTime: 0,
    range: 2,
    damage: { min: 180, max: 220, type: "physical" },
    effects: ["10% chance to stun for 1 second"],
    rankProgression: [
      { rank: 1, damage: "80-100" },
      { rank: 2, damage: "100-120" },
      { rank: 3, damage: "120-150" },
      { rank: 4, damage: "150-180" },
      { rank: 5, damage: "180-220" }
    ]
  },
  fireball: {
    id: "fireball",
    name: "Fireball",
    icon: "🔥",
    type: "active",
    category: "magic",
    rank: 4,
    unlocked: true,
    hotkey: 2,
    description: "Launch a blazing sphere of fire that explodes on impact, dealing massive fire damage to the target and nearby enemies.",
    lore: "Fire is the primal element of destruction. Master it, and watch your enemies turn to ash.",
    cost: { type: "mana", value: 50 },
    cooldown: 8.0,
    castTime: 1.2,
    range: 30,
    damage: { min: 350, max: 450, type: "fire" },
    splashRadius: 5,
    effects: [
      "15% chance to apply Burning (50 damage/sec for 4 seconds)",
      "25% extra damage to Frozen enemies",
      "Can ignite flammable objects"
    ],
    rankProgression: [
      { rank: 1, damage: "250-300", radius: "6m" },
      { rank: 2, damage: "300-350", radius: "6m" },
      { rank: 3, damage: "350-400", radius: "7m" },
      { rank: 4, damage: "350-450", radius: "5m" },
      { rank: 5, damage: "450-550", radius: "8m", burning: "25%" }
    ]
  }
  // More abilities...
};

/* ==========================================
   STATE MANAGEMENT
   ========================================== */

const gameState = {
  player: {
    level: 12,
    skillPoints: 5,
    skillsSpent: 37
  },
  activeTab: "skill-tree",
  activeSpec: "battle-mage",
  selectedSkill: null,
  actionBar: [
    { slot: 0, abilityId: "melee-attack" },
    { slot: 1, abilityId: "fireball" },
    { slot: 2, abilityId: "shield-block" },
    { slot: 3, abilityId: "lightning-bolt" },
    { slot: 4, abilityId: null },
    { slot: 5, abilityId: null },
    { slot: 6, abilityId: null },
    { slot: 7, abilityId: null }
  ],
  cooldowns: {} // { abilityId: { remaining: 0, total: 0 } }
};

/* ==========================================
   INITIALIZATION
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  initializeOverlay();
  initializeTabs();
  initializeSkillTree();
  initializeAbilities();
  initializeActionBar();
  initializeKeyboardShortcuts();
  initializeCooldownSystem();
});

/* ==========================================
   OVERLAY MANAGEMENT
   ========================================== */

function initializeOverlay() {
  const btnOpen = document.querySelector(".btn-open-skills");
  const btnClose = document.querySelector(".btn-close-overlay");
  const overlay = document.getElementById("skills-overlay");
  const backdrop = overlay.querySelector(".overlay-backdrop");

  btnOpen.addEventListener("click", () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  const closeOverlay = () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  btnClose.addEventListener("click", closeOverlay);
  backdrop.addEventListener("click", closeOverlay);

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeOverlay();
    }
  });
}

/* ==========================================
   TAB NAVIGATION
   ========================================== */

function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      // Update active states
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      tabContents.forEach(content => {
        content.classList.remove("active");
        if (content.id === `tab-${targetTab}`) {
          content.classList.add("active");
        }
      });

      gameState.activeTab = targetTab;
    });
  });
}

/* ==========================================
   SKILL TREE FUNCTIONALITY
   ========================================== */

function initializeSkillTree() {
  const skillNodes = document.querySelectorAll(".skill-node");
  const detailPanel = document.querySelector(".skill-detail-panel");

  skillNodes.forEach(node => {
    node.addEventListener("click", () => {
      const skillId = node.dataset.skillId;
      const isLocked = node.classList.contains("locked");

      if (!isLocked) {
        showSkillDetails(skillId);

        // Visual feedback
        skillNodes.forEach(n => n.classList.remove("selected"));
        node.classList.add("selected");
      } else {
        showLockedSkillMessage(node);
      }
    });

    // Hover tooltip
    node.addEventListener("mouseenter", (e) => {
      showSkillTooltip(e, node);
    });

    node.addEventListener("mouseleave", () => {
      hideSkillTooltip();
    });
  });

  // Specialization selector
  const specButtons = document.querySelectorAll(".spec-btn");
  specButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const spec = btn.dataset.spec;

      specButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      gameState.activeSpec = spec;
      loadSkillTreeSpec(spec);
    });
  });

  // Skill point investment
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-invest-point")) {
      investSkillPoint();
    }
    if (e.target.classList.contains("btn-refund-points")) {
      refundSkillPoints();
    }
  });
}

function showSkillDetails(skillId) {
  const noSelection = document.querySelector(".no-skill-selected");
  const details = document.querySelector(".skill-details");

  // Hide placeholder, show details
  if (noSelection) noSelection.style.display = "none";
  if (details) details.style.display = "flex";

  gameState.selectedSkill = skillId;

  // In a real implementation, populate with actual skill data
  console.log("Showing details for skill:", skillId);
}

function showLockedSkillMessage(node) {
  const requirement = node.querySelector(".skill-node-requirement");
  if (requirement) {
    // Shake animation
    node.style.animation = "shake 0.5s";
    setTimeout(() => {
      node.style.animation = "";
    }, 500);

    // Show toast notification
    showNotification("Skill Locked", requirement.textContent, "warning");
  }
}

function showSkillTooltip(e, node) {
  // Create tooltip element
  const tooltip = document.createElement("div");
  tooltip.className = "skill-tooltip";
  tooltip.innerHTML = `
    <div class="tooltip-title">${node.querySelector(".skill-node-name").textContent}</div>
    <div class="tooltip-rank">${node.querySelector(".skill-node-rank").textContent}</div>
  `;

  document.body.appendChild(tooltip);

  // Position tooltip
  const rect = node.getBoundingClientRect();
  tooltip.style.position = "fixed";
  tooltip.style.left = `${rect.right + 10}px`;
  tooltip.style.top = `${rect.top}px`;
  tooltip.style.zIndex = "10000";
  tooltip.style.background = "var(--color-shadow-900)";
  tooltip.style.border = "2px solid var(--color-arcane-500)";
  tooltip.style.borderRadius = "var(--radius-md)";
  tooltip.style.padding = "var(--space-3)";
  tooltip.style.pointerEvents = "none";
}

function hideSkillTooltip() {
  const tooltip = document.querySelector(".skill-tooltip");
  if (tooltip) tooltip.remove();
}

function loadSkillTreeSpec(spec) {
  console.log("Loading skill tree for specialization:", spec);
  // In a real implementation, this would update the skill tree display
}

function investSkillPoint() {
  if (gameState.player.skillPoints > 0) {
    gameState.player.skillPoints--;
    gameState.player.skillsSpent++;

    updateSkillPointsDisplay();

    // Show celebration for skill unlock/upgrade
    showSkillUnlockCelebration("Skill Upgraded!");

    // Play sound effect
    playSound("skill-upgrade");
  } else {
    showNotification("No Skill Points", "You don't have any skill points available.", "error");
  }
}

function refundSkillPoints() {
  const cost = gameState.player.skillsSpent;

  if (confirm(`Refund all skill points for ${cost} gold?`)) {
    gameState.player.skillPoints += gameState.player.skillsSpent;
    gameState.player.skillsSpent = 0;

    updateSkillPointsDisplay();
    showNotification("Skills Refunded", `All skill points have been refunded. You paid ${cost} gold.`, "success");
  }
}

function updateSkillPointsDisplay() {
  const availableEl = document.querySelector(".skill-points-available .skill-points-value");
  const totalEl = document.querySelector(".skill-points-total .skill-points-value");

  if (availableEl) availableEl.textContent = gameState.player.skillPoints;
  if (totalEl) totalEl.textContent = `${gameState.player.skillsSpent}/50`;
}

/* ==========================================
   ABILITIES MANAGEMENT
   ========================================== */

function initializeAbilities() {
  const abilityCards = document.querySelectorAll(".ability-card");
  const searchInput = document.querySelector(".ability-search");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Make unlocked abilities draggable
  abilityCards.forEach(card => {
    if (card.classList.contains("draggable")) {
      card.addEventListener("dragstart", handleAbilityDragStart);
      card.addEventListener("dragend", handleAbilityDragEnd);
    }

    // Show ability details modal
    const detailsBtn = card.querySelector(".btn-ability-details");
    if (detailsBtn) {
      detailsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const abilityId = card.dataset.abilityId;
        showAbilityDetailModal(abilityId);
      });
    }
  });

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterAbilities(e.target.value);
    });
  }

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      filterAbilitiesByCategory(filter);
    });
  });
}

function handleAbilityDragStart(e) {
  const abilityId = e.target.dataset.abilityId;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", abilityId);

  e.target.style.opacity = "0.5";

  // Visual feedback on action bar slots
  document.querySelectorAll(".action-slot").forEach(slot => {
    slot.classList.add("can-drop");
  });
}

function handleAbilityDragEnd(e) {
  e.target.style.opacity = "1";

  document.querySelectorAll(".action-slot").forEach(slot => {
    slot.classList.remove("can-drop");
    slot.classList.remove("drag-over");
  });
}

function filterAbilities(searchTerm) {
  const cards = document.querySelectorAll(".ability-card");
  const term = searchTerm.toLowerCase();

  cards.forEach(card => {
    const name = card.querySelector(".ability-card-name").textContent.toLowerCase();
    const type = card.querySelector(".ability-card-type").textContent.toLowerCase();

    if (name.includes(term) || type.includes(term)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function filterAbilitiesByCategory(category) {
  const cards = document.querySelectorAll(".ability-card");

  cards.forEach(card => {
    if (category === "all") {
      card.style.display = "block";
    } else if (category === "unlocked") {
      card.style.display = card.classList.contains("unlocked") ? "block" : "none";
    } else {
      const type = card.querySelector(".ability-card-type").textContent.toLowerCase();
      card.style.display = type.includes(category) ? "block" : "none";
    }
  });
}

function showAbilityDetailModal(abilityId) {
  const modal = document.getElementById("ability-detail-modal");
  if (!modal) return;

  // Populate modal with ability data
  // In a real implementation, use actual data from abilitiesData

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Close handlers
  const btnClose = modal.querySelector(".btn-close-modal");
  const backdrop = modal.querySelector(".modal-backdrop");

  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  };

  btnClose.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  // Action buttons
  const btnAssignHotkey = modal.querySelector(".btn-assign-hotkey");
  const btnUpgrade = modal.querySelector(".btn-upgrade-ability");

  if (btnAssignHotkey) {
    btnAssignHotkey.addEventListener("click", () => {
      assignAbilityToNextFreeSlot(abilityId);
      closeModal();
    });
  }

  if (btnUpgrade) {
    btnUpgrade.addEventListener("click", () => {
      upgradeAbility(abilityId);
      closeModal();
    });
  }
}

function upgradeAbility(abilityId) {
  if (gameState.player.skillPoints > 0) {
    gameState.player.skillPoints--;

    showNotification("Ability Upgraded!", `${abilityId} has been upgraded to the next rank.`, "success");
    playSound("ability-upgrade");

    updateSkillPointsDisplay();
  } else {
    showNotification("No Skill Points", "You don't have any skill points available.", "error");
  }
}

/* ==========================================
   ACTION BAR & HOTKEYS
   ========================================== */

function initializeActionBar() {
  const actionSlots = document.querySelectorAll(".action-slot");

  actionSlots.forEach(slot => {
    // Drop zone events
    slot.addEventListener("dragover", handleSlotDragOver);
    slot.addEventListener("dragleave", handleSlotDragLeave);
    slot.addEventListener("drop", handleSlotDrop);

    // Click to activate ability
    slot.addEventListener("click", () => {
      const abilityId = slot.dataset.abilityId;
      if (abilityId) {
        activateAbility(abilityId);
      }
    });

    // Right-click to remove ability
    slot.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const abilityId = slot.dataset.abilityId;
      if (abilityId) {
        removeAbilityFromSlot(slot);
      }
    });
  });
}

function handleSlotDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
}

function handleSlotDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleSlotDrop(e) {
  e.preventDefault();
  const slot = e.currentTarget;
  const abilityId = e.dataTransfer.getData("text/plain");

  slot.classList.remove("drag-over");

  assignAbilityToSlot(abilityId, slot);
}

function assignAbilityToSlot(abilityId, slot) {
  const hotkey = slot.dataset.hotkey;

  // Update slot appearance
  slot.classList.remove("empty");
  slot.dataset.abilityId = abilityId;

  // Get ability data (in real implementation, from abilitiesData)
  const ability = abilitiesData[abilityId] || { icon: "❓", name: "Unknown" };

  // Update icon
  let iconEl = slot.querySelector(".ability-icon");
  if (!iconEl) {
    iconEl = document.createElement("div");
    iconEl.className = "ability-icon";
    slot.insertBefore(iconEl, slot.firstChild);
  }
  iconEl.textContent = ability.icon;

  // Hide empty slot hint
  const hint = slot.querySelector(".empty-slot-hint");
  if (hint) hint.remove();

  // Update action bar state
  const slotIndex = parseInt(hotkey) - 1;
  gameState.actionBar[slotIndex] = { slot: slotIndex, abilityId };

  // Update ability card badge
  updateAbilityCardBadge(abilityId, hotkey);

  showNotification("Ability Assigned", `${ability.name} assigned to hotkey ${hotkey}`, "success");
  playSound("ability-assign");
}

function assignAbilityToNextFreeSlot(abilityId) {
  const emptySlot = document.querySelector(".action-slot.empty");
  if (emptySlot) {
    assignAbilityToSlot(abilityId, emptySlot);
  } else {
    showNotification("Action Bar Full", "All action bar slots are occupied. Right-click a slot to remove an ability.", "warning");
  }
}

function removeAbilityFromSlot(slot) {
  const abilityId = slot.dataset.abilityId;
  const hotkey = slot.dataset.hotkey;

  // Reset slot
  slot.classList.add("empty");
  slot.dataset.abilityId = "";

  const iconEl = slot.querySelector(".ability-icon");
  if (iconEl) iconEl.remove();

  // Add empty hint back
  if (!slot.querySelector(".empty-slot-hint")) {
    const hint = document.createElement("div");
    hint.className = "empty-slot-hint";
    hint.textContent = "Drag ability here";
    slot.appendChild(hint);
  }

  // Update state
  const slotIndex = parseInt(hotkey) - 1;
  gameState.actionBar[slotIndex] = { slot: slotIndex, abilityId: null };

  // Remove badge from ability card
  updateAbilityCardBadge(abilityId, null);

  showNotification("Ability Removed", "Ability removed from action bar", "info");
}

function updateAbilityCardBadge(abilityId, hotkey) {
  const card = document.querySelector(`.ability-card[data-ability-id="${abilityId}"]`);
  if (!card) return;

  let badge = card.querySelector(".ability-assigned-badge");

  if (hotkey) {
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "ability-assigned-badge";
      card.appendChild(badge);
    }
    badge.textContent = `Hotkey: ${hotkey}`;
  } else {
    if (badge) badge.remove();
  }
}

function activateAbility(abilityId) {
  // Check if ability is on cooldown
  if (gameState.cooldowns[abilityId] && gameState.cooldowns[abilityId].remaining > 0) {
    showNotification("On Cooldown", `Ability is on cooldown for ${gameState.cooldowns[abilityId].remaining.toFixed(1)}s`, "warning");
    return;
  }

  const ability = abilitiesData[abilityId];
  if (!ability) return;

  // Check resource cost
  const costType = ability.cost.type; // "mana", "stamina", etc.
  const costValue = ability.cost.value;

  // In a real implementation, check if player has enough resources

  console.log(`Activating ability: ${ability.name}`);

  // Start cooldown
  startCooldown(abilityId, ability.cooldown);

  // Visual feedback
  showAbilityActivation(abilityId);
  playSound("ability-cast");

  showNotification("Ability Activated", `${ability.name} activated!`, "success");
}

/* ==========================================
   COOLDOWN SYSTEM
   ========================================== */

function initializeCooldownSystem() {
  // Update cooldowns every 100ms for smooth animation
  setInterval(updateCooldowns, 100);
}

function startCooldown(abilityId, duration) {
  gameState.cooldowns[abilityId] = {
    remaining: duration,
    total: duration
  };

  // Find the action slot with this ability
  const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
  if (!slot) return;

  const overlay = slot.querySelector(".ability-cooldown-overlay");
  if (overlay) {
    overlay.style.display = "flex";
  }
}

function updateCooldowns() {
  const deltaTime = 0.1; // 100ms

  Object.keys(gameState.cooldowns).forEach(abilityId => {
    const cooldown = gameState.cooldowns[abilityId];
    cooldown.remaining -= deltaTime;

    if (cooldown.remaining <= 0) {
      cooldown.remaining = 0;
      completeCooldown(abilityId);
    } else {
      updateCooldownDisplay(abilityId, cooldown);
    }
  });
}

function updateCooldownDisplay(abilityId, cooldown) {
  const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
  if (!slot) return;

  const overlay = slot.querySelector(".ability-cooldown-overlay");
  const progress = overlay.querySelector(".cooldown-progress");
  const text = overlay.querySelector(".cooldown-text");

  if (overlay && progress && text) {
    const percentage = (cooldown.remaining / cooldown.total) * 100;
    progress.style.transform = `scaleY(${percentage / 100})`;
    text.textContent = cooldown.remaining.toFixed(1) + "s";
  }
}

function completeCooldown(abilityId) {
  delete gameState.cooldowns[abilityId];

  const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
  if (!slot) return;

  const overlay = slot.querySelector(".ability-cooldown-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }

  // Visual feedback - ability is ready again
  slot.style.animation = "glowPulse 0.5s";
  setTimeout(() => {
    slot.style.animation = "";
  }, 500);

  playSound("cooldown-ready");
}

function showAbilityActivation(abilityId) {
  const slot = document.querySelector(`.action-slot[data-ability-id="${abilityId}"]`);
  if (!slot) return;

  slot.style.animation = "pulse 0.3s";
  setTimeout(() => {
    slot.style.animation = "";
  }, 300);
}

/* ==========================================
   KEYBOARD SHORTCUTS
   ========================================== */

function initializeKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ignore if typing in input field
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    // Number keys 1-8 for abilities
    if (e.key >= "1" && e.key <= "8") {
      const slotIndex = parseInt(e.key) - 1;
      const actionSlot = gameState.actionBar[slotIndex];

      if (actionSlot && actionSlot.abilityId) {
        activateAbility(actionSlot.abilityId);
      }
    }

    // K key to open skills panel
    if (e.key.toLowerCase() === "k" && !e.ctrlKey && !e.altKey) {
      const overlay = document.getElementById("skills-overlay");
      if (!overlay.classList.contains("active")) {
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  });
}

/* ==========================================
   CELEBRATIONS & ANIMATIONS
   ========================================== */

function showSkillUnlockCelebration(title, skillName = "", description = "") {
  const celebration = document.getElementById("skill-unlock-celebration");
  if (!celebration) return;

  celebration.style.display = "flex";

  const titleEl = celebration.querySelector(".celebration-title");
  const nameEl = celebration.querySelector(".celebration-skill-name");
  const descEl = celebration.querySelector(".celebration-description");

  if (titleEl) titleEl.textContent = title;
  if (nameEl) nameEl.textContent = skillName;
  if (descEl) descEl.textContent = description;

  // Generate sparkle particles
  generateCelebrationParticles(celebration);

  // Play celebration sound
  playSound("skill-unlock");

  // Auto-close after 3 seconds or on click
  const btnClose = celebration.querySelector(".btn-close-celebration");

  const closeCelebration = () => {
    celebration.style.display = "none";
  };

  btnClose.addEventListener("click", closeCelebration);

  setTimeout(closeCelebration, 5000);
}

function generateCelebrationParticles(container) {
  const particlesContainer = container.querySelector(".celebration-particles");
  if (!particlesContainer) return;

  // Clear existing particles
  particlesContainer.innerHTML = "";

  // Create sparkles
  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "celebration-sparkle";
    sparkle.textContent = "✨";
    sparkle.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      font-size: ${Math.random() * 20 + 10}px;
      animation: sparkle ${Math.random() * 2 + 1}s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
      opacity: 0;
    `;
    particlesContainer.appendChild(sparkle);
  }
}

/* ==========================================
   NOTIFICATIONS
   ========================================== */

function showNotification(title, message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-icon">${getNotificationIcon(type)}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
  `;

  // Style
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--color-surface);
    border: 2px solid var(--color-${type === "error" ? "danger" : type === "success" ? "success" : type === "warning" ? "warning" : "info"});
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    min-width: 300px;
    max-width: 400px;
    z-index: 10000;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    animation: slideInRight 0.3s ease-out;
    display: flex;
    gap: var(--space-3);
  `;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "fadeOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function getNotificationIcon(type) {
  const icons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ"
  };
  return icons[type] || icons.info;
}

/* ==========================================
   SOUND EFFECTS (Placeholder)
   ========================================== */

function playSound(soundId) {
  // In a real implementation, this would play actual sound files
  console.log(`Playing sound: ${soundId}`);
}

/* ==========================================
   MOBILE TOUCH SUPPORT
   ========================================== */

// Add touch event support for mobile devices
if ('ontouchstart' in window) {
  initializeTouchSupport();
}

function initializeTouchSupport() {
  const abilityCards = document.querySelectorAll(".ability-card.draggable");

  abilityCards.forEach(card => {
    let touchStartX, touchStartY;
    let isDragging = false;
    let dragClone = null;

    card.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      // Create drag clone
      dragClone = card.cloneNode(true);
      dragClone.style.cssText = `
        position: fixed;
        pointer-events: none;
        opacity: 0.8;
        z-index: 10000;
        width: ${card.offsetWidth}px;
      `;
      document.body.appendChild(dragClone);

      isDragging = true;
    });

    card.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const touch = e.touches[0];
      dragClone.style.left = `${touch.clientX - dragClone.offsetWidth / 2}px`;
      dragClone.style.top = `${touch.clientY - dragClone.offsetHeight / 2}px`;

      // Check which action slot we're over
      const slots = document.querySelectorAll(".action-slot");
      slots.forEach(slot => {
        const rect = slot.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          slot.classList.add("drag-over");
        } else {
          slot.classList.remove("drag-over");
        }
      });
    });

    card.addEventListener("touchend", (e) => {
      if (!isDragging) return;

      const touch = e.changedTouches[0];

      // Find the action slot under the touch point
      const slots = document.querySelectorAll(".action-slot");
      let targetSlot = null;

      slots.forEach(slot => {
        const rect = slot.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          targetSlot = slot;
        }
        slot.classList.remove("drag-over");
      });

      if (targetSlot) {
        const abilityId = card.dataset.abilityId;
        assignAbilityToSlot(abilityId, targetSlot);
      }

      // Cleanup
      if (dragClone) dragClone.remove();
      isDragging = false;
      dragClone = null;
    });
  });
}

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Export for debugging
window.gameState = gameState;
window.skillTreeData = skillTreeData;
window.abilitiesData = abilitiesData;
