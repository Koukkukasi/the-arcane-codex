# Quest System Integration Guide
## Adding the Quest System to The Arcane Codex

---

## Step 1: Add Quest Manager to Game Controller

Edit `C:\Users\ilmiv\ProjectArgent\complete_game\game_controller.py`:

```python
# Add import at top
from quest_manager import QuestManager, Quest, QuestObjective

class GameController:
    def __init__(self, game_id: str, socketio=None):
        # ... existing code ...

        # ADD: Initialize quest manager
        self.quest_manager = QuestManager()
        self._load_quest_database()

    def _load_quest_database(self):
        """Load quests from quest_database.json"""
        import json

        try:
            with open('quest_database.json', 'r') as f:
                data = json.load(f)

            for quest_data in data['quests']:
                quest = Quest.from_dict(quest_data)
                self.quest_manager.add_quest(quest)

            logger.info(f"Loaded {len(self.quest_manager.quests)} quests")
        except Exception as e:
            logger.error(f"Failed to load quest database: {e}")
```

---

## Step 2: Add Quest Event Processing

Add to `game_controller.py`:

```python
def process_npc_dialogue(self, player_id: str, npc_id: str) -> Dict:
    """Handle NPC dialogue - check for quest triggers"""

    # ... existing dialogue code ...

    # Check for quest updates
    quest_updates = self.quest_manager.process_game_event(
        event_type="talk",
        event_data={
            "npc_id": npc_id,
            "player_id": player_id,
            "current_turn": self.turn_count
        },
        game_state=self
    )

    return {
        "success": True,
        "dialogue": dialogue_text,
        "quest_updates": quest_updates
    }

def process_item_obtained(self, player_id: str, item_id: str, quantity: int = 1):
    """Handle item acquisition - check for quest updates"""

    # ... existing item code ...

    # Check for quest updates
    quest_updates = self.quest_manager.process_game_event(
        event_type="obtain",
        event_data={
            "item_id": item_id,
            "quantity": quantity,
            "player_id": player_id,
            "current_turn": self.turn_count
        },
        game_state=self
    )

    return quest_updates

def process_location_change(self, player_id: str, new_location: str):
    """Handle location change - check for quest updates"""

    self.current_location = new_location

    # Check for quest updates
    quest_updates = self.quest_manager.process_game_event(
        event_type="location",
        event_data={
            "location_id": new_location,
            "player_id": player_id,
            "current_turn": self.turn_count
        },
        game_state=self
    )

    return quest_updates

def process_enemy_defeated(self, player_id: str, enemy_type: str, count: int = 1):
    """Handle enemy defeat - check for quest updates"""

    # Check for quest updates
    quest_updates = self.quest_manager.process_game_event(
        event_type="kill",
        event_data={
            "enemy_type": enemy_type,
            "count": count,
            "player_id": player_id,
            "current_turn": self.turn_count
        },
        game_state=self
    )

    return quest_updates
```

---

## Step 3: Add Quest Endpoints to Web Server

Edit `C:\Users\ilmiv\ProjectArgent\complete_game\web_game.py`:

```python
# ============================================================================
# QUEST SYSTEM ENDPOINTS
# ============================================================================

@app.route('/api/quests/available', methods=['GET'])
def get_available_quests():
    """Get all quests available to start"""
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    if not game_session:
        return jsonify({'error': 'Game not found'}), 404

    # Get player's character
    character = None
    for pid, pname in game_session.players.items():
        if pid == player_id:
            # Get character from game
            character = game_session.game.get_character(pid)
            break

    if not character:
        return jsonify({'error': 'Character not found'}), 404

    # Get available quests
    quest_manager = game_session.game.quest_manager
    available = quest_manager.get_available_quests(character, game_session.game.game_state)

    return jsonify({
        'quests': [
            {
                'quest_id': q.quest_id,
                'name': q.name,
                'description': q.description,
                'category': q.category.value,
                'tier': q.tier,
                'quest_giver': q.quest_giver,
                'rewards_preview': {
                    'xp': q.rewards.xp,
                    'gold': q.rewards.gold,
                    'items': [item['item_id'] for item in q.rewards.items]
                }
            }
            for q in available
        ]
    })


@app.route('/api/quests/active', methods=['GET'])
def get_active_quests():
    """Get all quests currently in progress"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    if not game_session:
        return jsonify({'error': 'Game not found'}), 404

    quest_manager = game_session.game.quest_manager
    active_quests = quest_manager.get_active_quests()

    return jsonify({
        'quests': [
            {
                'quest_id': q.quest_id,
                'name': q.name,
                'description': q.description,
                'category': q.category.value,
                'tier': q.tier,
                'current_objective': {
                    'description': q.objectives[q.current_objective_index].description,
                    'progress': q.objectives[q.current_objective_index].progress,
                    'progress_max': q.objectives[q.current_objective_index].progress_max
                } if q.current_objective_index < len(q.objectives) else None,
                'time_limit': q.time_limit,
                'turns_remaining': quest_manager.calculate_turns_remaining(q),
                'all_objectives': [
                    {
                        'id': obj.id,
                        'description': obj.description,
                        'completed': obj.completed,
                        'hidden': obj.hidden,
                        'optional': not obj.required
                    }
                    for obj in q.objectives
                    if not obj.hidden or getattr(obj, 'revealed', False)
                ]
            }
            for q in active_quests
        ]
    })


@app.route('/api/quests/completed', methods=['GET'])
def get_completed_quests():
    """Get all completed quests"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    if not game_session:
        return jsonify({'error': 'Game not found'}), 404

    quest_manager = game_session.game.quest_manager
    completed = quest_manager.get_completed_quests()

    return jsonify({
        'quests': [
            {
                'quest_id': q.quest_id,
                'name': q.name,
                'category': q.category.value,
                'tier': q.tier,
                'completed_turn': q.completed_turn,
                'rewards_earned': quest_manager.get_quest_rewards_summary(q.quest_id)
            }
            for q in completed
        ]
    })


@app.route('/api/quests/start', methods=['POST'])
def start_quest():
    """Start a quest"""
    game_code = session.get('game_code')
    player_id = get_player_id()

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    data = request.json
    quest_id = data.get('quest_id')

    if not quest_id:
        return jsonify({'error': 'quest_id required'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    # Get character
    character = game_session.game.get_character(player_id)
    if not character:
        return jsonify({'error': 'Character not found'}), 404

    # Start quest
    result = quest_manager.start_quest(quest_id, character, game_session.game.game_state)

    if not result['success']:
        return jsonify({'error': result['message']}), 400

    return jsonify({
        'success': True,
        'quest': {
            'quest_id': result['quest'].quest_id,
            'name': result['quest'].name,
            'description': result['quest'].description,
            'first_objective': result['quest'].objectives[0].description
        },
        'message': result['message']
    })


@app.route('/api/quests/<quest_id>/details', methods=['GET'])
def get_quest_details(quest_id: str):
    """Get detailed information about a specific quest"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    quest = quest_manager.get_quest(quest_id)
    if not quest:
        return jsonify({'error': 'Quest not found'}), 404

    return jsonify({
        'quest_id': quest.quest_id,
        'name': quest.name,
        'description': quest.description,
        'category': quest.category.value,
        'tier': quest.tier,
        'status': quest.status.value,
        'quest_giver': quest.quest_giver,
        'objectives': [
            {
                'id': obj.id,
                'type': obj.type.value,
                'description': obj.description,
                'required': obj.required,
                'hidden': obj.hidden,
                'revealed': getattr(obj, 'revealed', not obj.hidden),
                'completed': obj.completed,
                'progress': obj.progress,
                'progress_max': obj.progress_max
            }
            for obj in quest.objectives
            if not obj.hidden or getattr(obj, 'revealed', False)
        ],
        'rewards': {
            'xp': quest.rewards.xp,
            'gold': quest.rewards.gold,
            'items': quest.rewards.items,
            'divine_favor': quest.rewards.divine_favor,
            'unlocks': quest.rewards.unlocks
        },
        'time_limit': quest.time_limit,
        'metadata': quest.metadata
    })


@app.route('/api/quests/<quest_id>/choose_branch', methods=['POST'])
def choose_quest_branch_endpoint(quest_id: str):
    """Choose a branch in a quest decision point"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    data = request.json
    branch_id = data.get('branch_id')

    if not branch_id:
        return jsonify({'error': 'branch_id required'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    result = quest_manager.choose_branch(quest_id, branch_id, game_session.game.game_state)

    if not result['success']:
        return jsonify({'error': result['message']}), 400

    return jsonify(result)


@app.route('/api/quests/<quest_id>/abandon', methods=['POST'])
def abandon_quest(quest_id: str):
    """Abandon a quest (if allowed)"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    result = quest_manager.abandon_quest(quest_id)

    if not result['success']:
        return jsonify({'error': result['message']}), 400

    return jsonify({
        'success': True,
        'message': result['message'],
        'consequences': result.get('consequences', {})
    })


@app.route('/api/quests/map_markers', methods=['GET'])
def get_quest_map_markers():
    """Get all quest-related map markers for active quests"""
    game_code = session.get('game_code')

    if not game_code:
        return jsonify({'error': 'Not in game'}), 400

    game_session = get_game_session(game_code)
    quest_manager = game_session.game.quest_manager

    active_quests = quest_manager.get_active_quests()

    from quest_manager import QuestMapIntegration
    map_integration = QuestMapIntegration()
    markers = map_integration.get_quest_markers(active_quests)

    return jsonify({
        'markers': markers
    })
```

---

## Step 4: Update Character Class

Edit `C:\Users\ilmiv\ProjectArgent\complete_game\character_progression.py`:

```python
@dataclass
class Character:
    # ... existing fields ...

    # ADD: Quest tracking
    active_quests: List[str] = field(default_factory=list)
    completed_quests: List[str] = field(default_factory=list)
    failed_quests: List[str] = field(default_factory=list)
```

---

## Step 5: Update Game State Class

Edit `C:\Users\ilmiv\ProjectArgent\complete_game\arcane_codex_server.py`:

```python
@dataclass
class GameState:
    # ... existing fields ...

    # ADD: Quest system integration
    unlocked_locations: List[str] = field(default_factory=list)
    reputation: Dict[str, int] = field(default_factory=dict)

    def __post_init__(self):
        # Initialize with Valdria unlocked
        if not self.unlocked_locations:
            self.unlocked_locations = ["valdria", "valdria_town_square"]

        # Initialize reputation
        if not self.reputation:
            self.reputation = {
                "valdria": 0,
                "thieves_guild": 0,
                "law_enforcement": 0,
                "black_market": 0
            }
```

---

## Step 6: Add Frontend Quest Log Component

Create `C:\Users\ilmiv\ProjectArgent\complete_game\static\js\quest_log.js`:

```javascript
class QuestLog {
    constructor() {
        this.activeQuests = [];
        this.availableQuests = [];
        this.completedQuests = [];
        this.trackedQuestId = null;
    }

    async fetchActiveQuests() {
        const response = await fetch('/api/quests/active');
        const data = await response.json();
        this.activeQuests = data.quests || [];
        return this.activeQuests;
    }

    async fetchAvailableQuests() {
        const response = await fetch('/api/quests/available');
        const data = await response.json();
        this.availableQuests = data.quests || [];
        return this.availableQuests;
    }

    async fetchCompletedQuests() {
        const response = await fetch('/api/quests/completed');
        const data = await response.json();
        this.completedQuests = data.quests || [];
        return this.completedQuests;
    }

    async startQuest(questId) {
        const response = await fetch('/api/quests/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': await getCSRFToken()
            },
            body: JSON.stringify({ quest_id: questId })
        });

        const data = await response.json();

        if (data.success) {
            this.showNotification(`Quest Started: ${data.quest.name}`);
            await this.fetchActiveQuests();
            await this.fetchAvailableQuests();
        } else {
            this.showError(data.error);
        }

        return data;
    }

    async chooseBranch(questId, branchId) {
        const response = await fetch(`/api/quests/${questId}/choose_branch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': await getCSRFToken()
            },
            body: JSON.stringify({ branch_id: branchId })
        });

        const data = await response.json();

        if (data.success) {
            this.showBranchConsequences(data.consequences);
            await this.fetchActiveQuests();
        } else {
            this.showError(data.error);
        }

        return data;
    }

    async getQuestMapMarkers() {
        const response = await fetch('/api/quests/map_markers');
        const data = await response.json();
        return data.markers || [];
    }

    renderQuestLog() {
        const container = document.getElementById('quest-log-content');
        if (!container) return;

        let html = '<div class="quest-categories">';

        // Active Quests
        html += '<div class="quest-section">';
        html += '<h3>Active Quests (' + this.activeQuests.length + ')</h3>';
        this.activeQuests.forEach(quest => {
            html += this.renderQuestCard(quest, 'active');
        });
        html += '</div>';

        // Available Quests
        html += '<div class="quest-section">';
        html += '<h3>Available Quests (' + this.availableQuests.length + ')</h3>';
        this.availableQuests.forEach(quest => {
            html += this.renderQuestCard(quest, 'available');
        });
        html += '</div>';

        html += '</div>';
        container.innerHTML = html;
    }

    renderQuestCard(quest, type) {
        const icon = this.getCategoryIcon(quest.category);

        let html = `<div class="quest-card ${quest.category}" data-quest-id="${quest.quest_id}">`;
        html += `<div class="quest-header">`;
        html += `<span class="quest-icon">${icon}</span>`;
        html += `<span class="quest-name">${quest.name}</span>`;
        html += `<span class="quest-tier">Tier ${quest.tier}</span>`;
        html += `</div>`;

        html += `<div class="quest-description">${quest.description}</div>`;

        if (type === 'active' && quest.current_objective) {
            const progress = quest.current_objective.progress || 0;
            const max = quest.current_objective.progress_max || 1;
            const percentage = (progress / max) * 100;

            html += `<div class="quest-progress">`;
            html += `<div class="progress-bar">`;
            html += `<div class="progress-fill" style="width: ${percentage}%"></div>`;
            html += `</div>`;
            html += `<div class="current-objective">${quest.current_objective.description}</div>`;
            html += `</div>`;

            if (quest.turns_remaining !== null) {
                html += `<div class="time-limit">⏰ ${quest.turns_remaining} turns remaining</div>`;
            }

            html += `<button onclick="questLog.showOnMap('${quest.quest_id}')">Show on Map</button>`;
            html += `<button onclick="questLog.trackQuest('${quest.quest_id}')">Track</button>`;
        }

        if (type === 'available') {
            html += `<button onclick="questLog.startQuest('${quest.quest_id}')">Start Quest</button>`;
        }

        html += `</div>`;

        return html;
    }

    getCategoryIcon(category) {
        const icons = {
            'main_story': '⭐',
            'divine_trial': '✨',
            'time_limited': '⏰',
            'npc_request': '💬',
            'side_quest': '📍'
        };
        return icons[category] || '📍';
    }

    showNotification(message) {
        // Implementation depends on your notification system
        console.log('QUEST:', message);
    }

    showError(message) {
        console.error('QUEST ERROR:', message);
    }

    showBranchConsequences(consequences) {
        console.log('Quest branch consequences:', consequences);
        // Show divine favor changes, NPC approval changes, etc.
    }

    async showOnMap(questId) {
        const markers = await this.getQuestMapMarkers();
        const questMarker = markers.find(m => m.quest_id === questId);

        if (questMarker) {
            // Implementation depends on your map system
            console.log('Navigate to:', questMarker.location);
        }
    }

    async trackQuest(questId) {
        this.trackedQuestId = questId;
        // Update HUD to show tracked quest
        console.log('Tracking quest:', questId);
    }
}

// Global instance
const questLog = new QuestLog();
```

---

## Step 7: Add Quest Log to Main UI

Edit your main HTML file (e.g., `arcane_codex_scenario_ui_enhanced.html`):

```html
<!-- Add Quest Log Button -->
<button id="quest-log-button" onclick="openQuestLog()">
    📜 Quests
</button>

<!-- Add Quest Log Overlay -->
<div id="quest-log-overlay" class="overlay" style="display: none;">
    <div class="overlay-content">
        <div class="overlay-header">
            <h2>Quest Log</h2>
            <button onclick="closeQuestLog()">×</button>
        </div>
        <div id="quest-log-content">
            <!-- Quest content loaded here -->
        </div>
    </div>
</div>

<script src="/static/js/quest_log.js"></script>
<script>
async function openQuestLog() {
    await questLog.fetchActiveQuests();
    await questLog.fetchAvailableQuests();
    questLog.renderQuestLog();
    document.getElementById('quest-log-overlay').style.display = 'block';
}

function closeQuestLog() {
    document.getElementById('quest-log-overlay').style.display = 'none';
}
</script>
```

---

## Step 8: Test the Integration

### 1. Start the server
```bash
python web_game.py
```

### 2. Create a game and complete interrogation

### 3. Test quest endpoints in browser console:
```javascript
// Get available quests
fetch('/api/quests/available')
    .then(r => r.json())
    .then(d => console.log('Available:', d));

// Start a quest
fetch('/api/quests/start', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({quest_id: 'codex_awakens'})
}).then(r => r.json()).then(d => console.log('Started:', d));

// Get active quests
fetch('/api/quests/active')
    .then(r => r.json())
    .then(d => console.log('Active:', d));
```

---

## Common Issues & Solutions

### Issue: Quest not appearing
**Solution**: Check requirements:
```python
# In browser console
fetch('/api/quests/available').then(r => r.json()).then(console.log)

# Check character level, divine favor, etc.
```

### Issue: Quest won't start
**Solution**: Verify prerequisites completed:
```python
quest = quest_manager.get_quest('quest_id')
print(quest.requirements)
```

### Issue: Objectives not updating
**Solution**: Ensure events are being processed:
```python
# Add logging to game_controller.py
def process_npc_dialogue(self, player_id: str, npc_id: str):
    logger.info(f"NPC dialogue: {npc_id}")
    quest_updates = self.quest_manager.process_game_event(...)
    logger.info(f"Quest updates: {quest_updates}")
```

---

## Performance Optimization

### 1. Cache Quest Data
```python
# In game_controller.py
@lru_cache(maxsize=100)
def get_quest_by_id(self, quest_id: str):
    return self.quest_manager.get_quest(quest_id)
```

### 2. Batch Quest Updates
```python
# Process multiple events at once
def process_turn_end(self):
    all_events = self.collect_turn_events()
    for event in all_events:
        quest_updates = self.quest_manager.process_game_event(
            event['type'], event['data'], self
        )
```

### 3. Lazy Load Quest Details
```python
// Frontend - only fetch details when needed
async function showQuestDetails(questId) {
    const response = await fetch(`/api/quests/${questId}/details`);
    const quest = await response.json();
    renderQuestDetails(quest);
}
```

---

## Congratulations!

Your quest system is now integrated with The Arcane Codex!

Players can now:
- ✅ View available quests
- ✅ Start and track quests
- ✅ Make moral choices with consequences
- ✅ Complete objectives
- ✅ Earn rewards (XP, gold, divine favor, items)
- ✅ Unlock new quest chains
- ✅ See quest markers on the map

Next steps:
- Create more quests in `quest_database.json`
- Add quest completion animations
- Implement quest notifications
- Add quest voice-over or narration
- Create quest achievement system
