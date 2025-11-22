# The Arcane Codex - Animation Integration Guide

## Overview

This guide explains how to use the battle scene animation system in The Arcane Codex game. The animation system provides dramatic visual introductions for combat, divine interventions, location transitions, and critical story moments.

## Security Features

✅ **XSS Protection**: All user inputs are sanitized before rendering
✅ **Memory Management**: Proper cleanup of animation resources
✅ **Namespace Safety**: Single `ArcaneCodex` global namespace to avoid pollution
✅ **Error Handling**: Graceful fallbacks if animations fail
✅ **Accessibility**: Respects `prefers-reduced-motion` user preferences

## Files

### Animation System
- **CSS**: `/static/css/battle_scene_animations.css`
- **JS**: `/static/js/battle_scene_animations.js`

### Integration Points
- **Main Game**: `/static/actual_game.html` (CSS/JS already linked)
- **SocketIO Client**: `/static/socketio_client.js` (location transitions hooked)
- **Divine Council**: `/static/js/divine-council.js` (divine interventions hooked)

## API Reference

All animations are accessed through the global namespace:

```javascript
window.ArcaneCodex.animations
```

### Available Animation Functions

#### 1. Battle Intro Animation

Dramatic flash and reveal for combat encounters.

```javascript
ArcaneCodex.animations.playBattleIntro({
    enemyName: 'Shadow Beast',           // Name of enemy
    enemyIcon: '👹',                      // Emoji or icon
    flavorText: 'A shadow emerges!',     // Dramatic text
    battleType: 'normal',                // 'normal', 'boss', 'ambush'
    onComplete: () => {
        // Called when animation finishes
        console.log('Battle intro complete');
    }
});
```

**Battle Types:**
- `normal`: Standard combat animation
- `boss`: Extended animation with more dramatic effects
- `ambush`: Faster, more chaotic animation

**Example (Boss Fight):**
```javascript
ArcaneCodex.animations.playBattleIntro({
    enemyName: 'Daemon Lord Azroth',
    enemyIcon: '👿',
    flavorText: 'The air itself trembles with dark power!',
    battleType: 'boss',
    onComplete: () => {
        startBossFight();
    }
});
```

#### 2. Location Transition Animation

Fade and reveal for moving to new areas.

```javascript
ArcaneCodex.animations.playLocationTransition({
    locationName: 'The Forbidden Crypts',  // Location name
    locationIcon: '🏛️',                     // Emoji or icon
    description: 'You descend into darkness...', // Description text
    onComplete: () => {
        // Called when animation finishes
        loadNewLocation();
    }
});
```

**Already Integrated In:**
- `/static/socketio_client.js` → `handleNewScenario()` function (line 276)

**Example (Quest Start):**
```javascript
// When server emits 'new_scenario' event
socket.on('new_scenario', (data) => {
    ArcaneCodex.animations.playLocationTransition({
        locationName: data.theme || 'Unknown Location',
        locationIcon: '🗺️',
        description: 'A new challenge awaits...',
        onComplete: () => {
            loadScenario(data.scenario_id);
        }
    });
});
```

#### 3. Divine Intervention Animation

God appearance with divine particles and rays.

```javascript
ArcaneCodex.animations.playDivineIntervention({
    godName: 'VALDRIS',                          // God name (uppercase)
    godColor: '#2563EB',                         // Hex color
    godSymbol: '/images/god_valdris.svg',        // Path to god SVG
    message: 'Justice demands an answer!',       // Divine message
    onComplete: () => {
        // Called when animation finishes
        showDivineChoice();
    }
});
```

**Already Integrated In:**
- `/static/js/divine-council.js` → `showVoting()` method (line 130)

**Example (Divine Council Voting):**
```javascript
// Before showing the voting modal
const leadingGod = gods['valdris'];
ArcaneCodex.animations.playDivineIntervention({
    godName: 'VALDRIS',
    godColor: '#2563EB',
    godSymbol: '/images/god_valdris.svg',
    message: 'The gods convene to judge your choice...',
    onComplete: () => {
        displayVotingModal();
    }
});
```

**God Colors (from divine-council.js):**
- Valdris (Order): `#2563EB` (blue)
- Kaitha (Chaos): `#F59E0B` (orange)
- Morvane (Death): `#7C3AED` (purple)
- Sylara (Nature): `#059669` (green)
- Korvan (War): `#DC2626` (red)
- Athena (Wisdom): `#2563EB` (blue)
- Mercus (Commerce): `#D4AF37` (gold)

#### 4. Critical Moment Animation

High-impact flash for betrayals, discoveries, revelations.

```javascript
ArcaneCodex.animations.playCriticalMoment({
    title: 'BETRAYAL',                    // Event title
    icon: '⚠️',                           // Emoji or icon
    color: '#DC2626',                     // Hex color (red for danger)
    message: 'Your ally turns against you!', // Impact message
    onComplete: () => {
        // Called when animation finishes
        handleBetrayal();
    }
});
```

**Color Suggestions:**
- Danger/Betrayal: `#DC2626` (red)
- Discovery: `#D4AF37` (gold)
- Warning: `#F59E0B` (orange)
- Success: `#059669` (green)
- Mystery: `#7C3AED` (purple)

**Example (NPC Betrayal):**
```javascript
// When NPC trust falls below threshold
if (npcTrust < -50) {
    ArcaneCodex.animations.playCriticalMoment({
        title: 'BETRAYAL REVEALED',
        icon: '🗡️',
        color: '#DC2626',
        message: `${npcName} has turned against the party!`,
        onComplete: () => {
            triggerBetrayalEvent();
        }
    });
}
```

#### 5. Cleanup

Clean up all animation resources (called automatically, but can be manual):

```javascript
ArcaneCodex.animations.cleanup();
```

## Integration Examples

### Example 1: Battle Start (when implementing combat)

```javascript
// In your combat initialization code
function startCombat(enemy) {
    // Show battle intro animation
    ArcaneCodex.animations.playBattleIntro({
        enemyName: enemy.name,
        enemyIcon: enemy.icon || '⚔️',
        flavorText: enemy.introText || 'Combat begins!',
        battleType: enemy.isBoss ? 'boss' : 'normal',
        onComplete: () => {
            // After animation, initialize battle
            initializeBattleUI(enemy);
            rollInitiative();
        }
    });
}
```

### Example 2: Quest Completion with Divine Reward

```javascript
// When player completes a quest that pleases a god
function completeQuest(questData) {
    const favoredGod = questData.favoredGod;

    ArcaneCodex.animations.playDivineIntervention({
        godName: favoredGod.name,
        godColor: favoredGod.color,
        godSymbol: `/images/god_${favoredGod.key}.svg`,
        message: `${favoredGod.name} is pleased with your actions!`,
        onComplete: () => {
            // Award divine favor
            awardDivineFavor(favoredGod.key, 20);
            showQuestRewards(questData.rewards);
        }
    });
}
```

### Example 3: Multiple Animations in Sequence

```javascript
// Chain animations together
async function showEpicQuestStart(questData) {
    // 1. Location transition
    await new Promise(resolve => {
        ArcaneCodex.animations.playLocationTransition({
            locationName: questData.location,
            locationIcon: '🏰',
            description: 'You journey to the ancient fortress...',
            onComplete: resolve
        });
    });

    // 2. Divine warning
    await new Promise(resolve => {
        ArcaneCodex.animations.playDivineIntervention({
            godName: 'VALDRIS',
            godColor: '#2563EB',
            godSymbol: '/images/god_valdris.svg',
            message: 'Beware! Darkness lies ahead.',
            onComplete: resolve
        });
    });

    // 3. Enemy appears
    await new Promise(resolve => {
        ArcaneCodex.animations.playBattleIntro({
            enemyName: questData.mainEnemy.name,
            enemyIcon: questData.mainEnemy.icon,
            flavorText: 'The guardian awakens!',
            battleType: 'boss',
            onComplete: resolve
        });
    });

    // Start the actual quest
    startQuest(questData);
}
```

### Example 4: SocketIO Event Integration

```javascript
// In your SocketIO event handlers
socket.on('critical_event', (data) => {
    ArcaneCodex.animations.playCriticalMoment({
        title: data.eventTitle,
        icon: data.eventIcon,
        color: data.eventColor,
        message: data.eventMessage,
        onComplete: () => {
            handleCriticalEvent(data);
        }
    });
});

socket.on('divine_judgment', (data) => {
    ArcaneCodex.animations.playDivineIntervention({
        godName: data.godName,
        godColor: data.godColor,
        godSymbol: data.godSymbol,
        message: data.judgment,
        onComplete: () => {
            applyJudgmentEffects(data.effects);
        }
    });
});

socket.on('combat_start', (data) => {
    ArcaneCodex.animations.playBattleIntro({
        enemyName: data.enemy.name,
        enemyIcon: data.enemy.icon,
        flavorText: data.flavorText,
        battleType: data.battleType,
        onComplete: () => {
            initializeCombat(data);
        }
    });
});
```

## Server-Side Integration

### Emitting Animation Data from Flask/SocketIO

```python
# In your Flask/SocketIO handlers (web_game.py)

# Battle start
@socketio.on('start_combat')
def handle_combat_start(data):
    enemy = get_enemy_data(data['enemy_id'])

    socketio.emit('combat_start', {
        'enemy': {
            'name': enemy.name,
            'icon': enemy.icon,
            'is_boss': enemy.is_boss
        },
        'flavorText': enemy.intro_text,
        'battleType': 'boss' if enemy.is_boss else 'normal'
    }, room=data['game_code'])

# Divine intervention
@socketio.on('trigger_divine_event')
def handle_divine_event(data):
    god = get_god_data(data['god_key'])

    socketio.emit('divine_judgment', {
        'godName': god.name.upper(),
        'godColor': god.color,
        'godSymbol': f'/images/god_{god.key}.svg',
        'judgment': data['judgment_text'],
        'effects': data['effects']
    }, room=data['game_code'])

# Critical moment
@socketio.on('trigger_critical_event')
def handle_critical_event(data):
    socketio.emit('critical_event', {
        'eventTitle': data['title'],
        'eventIcon': data['icon'],
        'eventColor': data['color'],
        'eventMessage': data['message']
    }, room=data['game_code'])
```

## Accessibility

The animation system respects user preferences:

```javascript
// Reduced motion detection (built-in)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// If user prefers reduced motion:
// - Particle counts reduced by 70-80%
// - Animation durations shorter
// - Less intense visual effects
```

## Error Handling

The animation system has built-in error handling:

```javascript
// All animation functions include try-catch blocks
// If an error occurs:
// 1. Error is logged to console
// 2. Animation is cleaned up
// 3. onComplete callback is still called
// 4. Game continues without breaking
```

**Checking if animations are available:**

```javascript
if (window.ArcaneCodex && window.ArcaneCodex.animations) {
    // Animations available
    ArcaneCodex.animations.playBattleIntro({...});
} else {
    // Fallback behavior (no animations)
    console.warn('Battle animations not loaded, continuing without them');
    startBattle();
}
```

## Testing

### Manual Testing Checklist

1. **Battle Intro**
   - [ ] Normal battle animation plays correctly
   - [ ] Boss battle has extended animation
   - [ ] Ambush battle has faster animation
   - [ ] Animation completes and calls onComplete
   - [ ] Enemy name displays correctly (no XSS)

2. **Location Transition**
   - [ ] Fade effect works smoothly
   - [ ] Location name and description display
   - [ ] Animation duration feels right (2.5s)
   - [ ] Particles animate correctly

3. **Divine Intervention**
   - [ ] God symbol loads (if provided)
   - [ ] God color applies correctly
   - [ ] Divine particles spawn with correct color
   - [ ] Message displays clearly

4. **Critical Moment**
   - [ ] Screen shake effect triggers
   - [ ] Flash effect is visible
   - [ ] Title and message display clearly
   - [ ] Animation doesn't break page layout

5. **General**
   - [ ] Multiple animations can play in sequence
   - [ ] Cleanup properly removes all elements
   - [ ] No memory leaks after repeated use
   - [ ] Reduced motion mode reduces particles

### Playwright Testing (TODO)

See `PLAYWRIGHT_ANIMATION_TESTS.md` (to be created) for automated test suite.

## Troubleshooting

### Animations Not Playing

**Problem**: Animations don't show up
**Solution**: Check browser console for errors. Ensure:
1. CSS file is loaded: Check Network tab for `battle_scene_animations.css`
2. JS file is loaded: Check Network tab for `battle_scene_animations.js`
3. Check `window.ArcaneCodex` exists in console

### XSS Warnings in Console

**Problem**: Console shows XSS warnings
**Solution**: This is expected - the system is sanitizing inputs. No action needed.

### Animation Stuck on Screen

**Problem**: Animation overlay doesn't disappear
**Solution**: Call cleanup manually:
```javascript
ArcaneCodex.animations.cleanup();
```

### Multiple Animations Overlap

**Problem**: New animation starts before previous finishes
**Solution**: The system prevents this automatically. If you see overlapping:
```javascript
// Wait for previous animation to complete
await new Promise(resolve => {
    ArcaneCodex.animations.playBattleIntro({
        // ... options
        onComplete: resolve
    });
});

// Then play next animation
ArcaneCodex.animations.playLocationTransition({...});
```

## Performance

- **Particle Count**: Automatically reduced on slower devices
- **Animation Duration**: Optimized for 60fps
- **Memory Usage**: Proper cleanup prevents memory leaks
- **File Size**:
  - CSS: ~15KB (uncompressed)
  - JS: ~12KB (uncompressed)

## Future Enhancements

Planned features (not yet implemented):

- [ ] Custom particle effects (fire, ice, lightning)
- [ ] Animation sound effects integration
- [ ] Configurable animation speeds
- [ ] More battle intro variants (elemental, magical, physical)
- [ ] Victory/defeat animations
- [ ] Level-up celebration animations
- [ ] Quest milestone animations

## Support

For questions or issues:
1. Check browser console for error messages
2. Review this guide for correct API usage
3. Check `actual_game.html` for integration examples
4. See `divine-council.js` for real-world usage

---

**Last Updated**: 2025-11-20
**Version**: 1.0.0
**Status**: Production Ready ✅
