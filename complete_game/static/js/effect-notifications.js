/**
 * The Arcane Codex - Effect Notification System
 * Phase F: Divine Council Frontend Visualization
 *
 * This module handles visual notifications for divine blessings and curses
 * applied to players through the Divine Council voting system.
 *
 * @author The Arcane Codex Development Team
 * @version 1.0.0
 */

/**
 * Display an effect notification (blessing or curse)
 * @param {Object} effect - Effect object from backend
 * @param {string} effect.type - 'blessing' or 'curse'
 * @param {string} effect.name - Display name of the effect
 * @param {string} effect.description - What the effect does
 * @param {number} [effect.duration] - How many turns it lasts
 * @param {string} [effect.icon] - Emoji or symbol for the effect
 */
function showEffectNotification(effect) {
  console.log('[Effect Notification] Showing:', effect);

  // Create notification container
  const notification = document.createElement('div');
  notification.className = `effect-notification ${effect.type || 'blessing'}`;

  // Build notification content
  notification.innerHTML = `
    <div class="effect-icon">${effect.icon || (effect.type === 'curse' ? '⚡' : '✨')}</div>
    <div class="effect-text">
      <strong>${effect.name || 'Divine Effect'}</strong>
      <span>${effect.description || 'The gods have touched you...'}</span>
      ${effect.duration ? `<small>Duration: ${effect.duration} turns</small>` : ''}
    </div>
  `;

  // Add to document
  document.body.appendChild(notification);

  // Trigger show animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 500); // Wait for transition
  }, 5000);

  // Play sound effect if available
  if (window.GameAudio && typeof window.GameAudio.play === 'function') {
    const soundKey = effect.type === 'curse' ? 'curse_applied' : 'blessing_applied';
    window.GameAudio.play(soundKey);
  }

  return notification;
}

/**
 * Show multiple effect notifications in sequence
 * @param {Array<Object>} effects - Array of effect objects
 * @param {number} [delayBetween=300] - Milliseconds between each notification
 */
function showEffectNotifications(effects, delayBetween = 300) {
  if (!Array.isArray(effects) || effects.length === 0) {
    console.warn('[Effect Notification] No effects to display');
    return;
  }

  console.log(`[Effect Notification] Showing ${effects.length} effects`);

  effects.forEach((effect, index) => {
    setTimeout(() => {
      showEffectNotification(effect);
    }, index * delayBetween);
  });
}

/**
 * Clear all active effect notifications
 */
function clearEffectNotifications() {
  const notifications = document.querySelectorAll('.effect-notification');
  notifications.forEach(notification => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 500);
  });
  console.log(`[Effect Notification] Cleared ${notifications.length} notifications`);
}

/**
 * Get a blessing effect object template
 * @param {string} name - Effect name
 * @param {string} description - Effect description
 * @param {number} duration - Duration in turns
 * @param {string} [icon='✨'] - Effect icon
 * @returns {Object} Blessing effect object
 */
function createBlessingEffect(name, description, duration, icon = '✨') {
  return {
    type: 'blessing',
    name,
    description,
    duration,
    icon
  };
}

/**
 * Get a curse effect object template
 * @param {string} name - Effect name
 * @param {string} description - Effect description
 * @param {number} duration - Duration in turns
 * @param {string} [icon='⚡'] - Effect icon
 * @returns {Object} Curse effect object
 */
function createCurseEffect(name, description, duration, icon = '⚡') {
  return {
    type: 'curse',
    name,
    description,
    duration,
    icon
  };
}

// Make functions globally available
window.showEffectNotification = showEffectNotification;
window.showEffectNotifications = showEffectNotifications;
window.clearEffectNotifications = clearEffectNotifications;
window.createBlessingEffect = createBlessingEffect;
window.createCurseEffect = createCurseEffect;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showEffectNotification,
    showEffectNotifications,
    clearEffectNotifications,
    createBlessingEffect,
    createCurseEffect
  };
}

console.log('[Effect Notification] Module loaded successfully');

/* ============================================
   EXAMPLE USAGE
   ============================================

// Single blessing notification:
showEffectNotification({
  type: 'blessing',
  name: "Valdris's Protection",
  description: "Your armor is strengthened by divine justice (+2 Defense)",
  duration: 3,
  icon: '🛡️'
});

// Single curse notification:
showEffectNotification({
  type: 'curse',
  name: "Kaitha's Wrath",
  description: "Chaos clouds your judgment (-1 Wisdom)",
  duration: 2,
  icon: '🌪️'
});

// Multiple effects in sequence:
showEffectNotifications([
  createBlessingEffect(
    "Sylara's Vitality",
    "Nature's energy restores your health (+10 HP)",
    5,
    '🌿'
  ),
  createCurseEffect(
    "Morvane's Mark",
    "Death's shadow follows you (-1 Luck)",
    3,
    '💀'
  )
], 400); // 400ms between each

// Clear all notifications:
clearEffectNotifications();

============================================ */
