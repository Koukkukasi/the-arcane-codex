# Skills System - Quick Start Guide

## 5-Minute Integration

### Step 1: Add to HTML `<head>`

```html
<!-- Skills System -->
<link rel="stylesheet" href="/static/css/skills.css">
<script src="/static/js/api-client.js" defer></script>
<script src="/static/js/error_handler.js" defer></script>
<script src="/static/js/skills.js" defer></script>
```

### Step 2: Add Action Bar to HTML `<body>`

```html
<!-- Action Bar (Fixed Bottom) -->
<div class="action-bar">
    <div class="action-bar-slots">
        <div class="action-slot empty" data-hotkey="1">
            <div class="ability-hotkey">1</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
        <div class="action-slot empty" data-hotkey="2">
            <div class="ability-hotkey">2</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
        <div class="action-slot empty" data-hotkey="3">
            <div class="ability-hotkey">3</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
        <div class="action-slot empty" data-hotkey="4">
            <div class="ability-hotkey">4</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
        <div class="action-slot empty" data-hotkey="5">
            <div class="ability-hotkey">5</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
        <div class="action-slot empty" data-hotkey="6">
            <div class="ability-hotkey">6</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
        <div class="action-slot empty" data-hotkey="7">
            <div class="ability-hotkey">7</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
        <div class="action-slot empty" data-hotkey="8">
            <div class="ability-hotkey">8</div>
            <div class="empty-slot-hint">Drag ability here</div>
        </div>
    </div>
</div>

<!-- Open Skills Button (Add to your HUD) -->
<button class="btn-open-skills" aria-label="Open Skills Panel">
    Skills (K)
</button>
```

### Step 3: Copy Full Overlay HTML

**See**: `SKILLS_INTEGRATION_GUIDE.html` for complete skills overlay HTML.

**Add before closing `</body>` tag**:
- Skills overlay (`#skills-overlay`)
- Ability detail modal (`#ability-detail-modal`)
- Celebration overlay (`#skill-unlock-celebration`)

---

## Backend API Requirements

### Endpoint: GET `/api/skills/tree`

**Returns**:
```json
{
  "success": true,
  "abilities": [
    {
      "id": "basic-combat",
      "name": "Basic Combat",
      "icon": "⚔️",
      "tier": 1,
      "type": "active",
      "category": "combat",
      "unlocked": true,
      "current_rank": 5,
      "max_rank": 5,
      "cooldown": 1.5,
      "cost_type": "stamina",
      "cost_value": 10,
      "description": "Master the fundamentals of combat.",
      "lore": "Every master was once a student.",
      "prerequisites": [],
      "effects": [
        { "rank": 1, "stats": { "weaponDamage": 5 } },
        { "rank": 5, "stats": { "weaponDamage": 25, "attackSpeed": 10 } }
      ]
    }
  ],
  "skill_points": 5,
  "skills_spent": 37,
  "player_level": 12,
  "hotkeys": {
    "1": "basic-combat",
    "2": "fireball"
  }
}
```

### Endpoint: POST `/api/skills/unlock`

**Request**: `{ "ability_id": "fireball" }`

**Returns**: `{ "success": true, "skill_points": 4, "skills_spent": 38 }`

### Endpoint: POST `/api/skills/assign_hotkey`

**Request**: `{ "ability_id": "fireball", "hotkey": 2 }`

**Returns**: `{ "success": true }`

### Endpoint: POST `/api/skills/use`

**Request**: `{ "ability_id": "fireball" }`

**Returns**: `{ "success": true, "cooldown": 8.0 }`

### Endpoint: POST `/api/skills/refund`

**Returns**: `{ "success": true, "skill_points": 42 }`

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **1-8** | Activate abilities in action bar slots |
| **K** | Open/close skills overlay |
| **ESC** | Close skills overlay |
| **Tab** | Navigate between tabs |

---

## Features

✅ **Skill Tree**: 5-tier progression with visual connections
✅ **Drag & Drop**: Assign abilities to action bar
✅ **Hotkeys**: Keys 1-8 for instant ability activation
✅ **Cooldowns**: Visual countdown with progress bars
✅ **Search**: Filter abilities by name or category
✅ **Mobile**: Touch-friendly responsive design
✅ **Accessible**: Keyboard navigation, screen reader support

---

## File Locations

- **Frontend JS**: `/static/js/skills.js`
- **Frontend CSS**: `/static/css/skills.css`
- **Integration Guide**: `SKILLS_INTEGRATION_GUIDE.html`
- **Full Documentation**: `SKILLS_IMPLEMENTATION_COMPLETE.md`
- **This Quick Start**: `SKILLS_QUICK_START.md`

---

## Testing

1. **Load Page**: Skills system auto-initializes
2. **Press K**: Opens skills overlay
3. **Click Skill Node**: Shows details in side panel
4. **Drag Ability**: From "All Abilities" tab to action bar
5. **Press 1-8**: Activates corresponding ability
6. **Check Console**: No JavaScript errors

---

## Troubleshooting

**Skill tree not loading?**
- Check browser console for errors
- Verify `/api/skills/tree` returns correct JSON
- Ensure `apiCall` function exists

**Abilities not draggable?**
- Check abilities have `draggable="true"`
- Verify abilities have `.draggable` class
- Check `data-ability-id` is set

**Keyboard shortcuts not working?**
- Ensure focus not in input field
- Check action slots have `data-hotkey` attribute
- Verify skills overlay has ID `skills-overlay`

---

## Next Steps

1. ✅ Copy HTML from integration guide
2. ✅ Add CSS/JS includes to `<head>`
3. ✅ Implement backend API endpoints
4. ✅ Test in browser
5. ✅ Customize colors/theme as needed

**Estimated Time**: 10 minutes integration + 30 minutes testing

---

**Need Help?** See `SKILLS_IMPLEMENTATION_COMPLETE.md` for detailed documentation.
