#!/usr/bin/env python3
"""
Phase D: Add Missing API Endpoints
Adds character, inventory, quests, and map endpoints to web_game.py
"""

def add_missing_endpoints():
    """Add missing API endpoints to web_game.py"""

    file_path = 'web_game.py'

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Backup first
    with open(file_path + '.backup_phase_d', 'w', encoding='utf-8') as f:
        f.write(content)

    print("[OK] Backup created: web_game.py.backup_phase_d")

    # Find the last @app.route before if __name__ == '__main__'
    # We'll add new endpoints before the main block

    new_endpoints = '''
# ============================================================================
# PHASE D: UI Support Endpoints
# ============================================================================

@app.route('/api/character/stats', methods=['GET'])
def get_character_stats():
    """Get character statistics (STR, DEX, CON, INT, WIS, CHA)"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        # Get player's character
        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        return jsonify({
            'stats': {
                'STR': character.strength,
                'DEX': character.dexterity,
                'CON': character.constitution,
                'INT': character.intelligence,
                'WIS': character.wisdom,
                'CHA': character.charisma
            },
            'level': character.level,
            'xp': character.xp,
            'xp_to_next': character.xp_to_next_level(),
            'hp': character.hp,
            'max_hp': character.max_hp,
            'class': character.character_class
        })

    except Exception as e:
        logger.error(f"Error getting character stats: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/character/divine_favor', methods=['GET'])
def get_divine_favor():
    """Get character's favor with all 7 gods"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Return favor for all gods
        favor_data = {}
        for god_name in SEVEN_GODS:
            favor_data[god_name] = character.divine_favor.get(god_name, 0)

        return jsonify({'favor': favor_data})

    except Exception as e:
        logger.error(f"Error getting divine favor: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/inventory/all', methods=['GET'])
def get_inventory():
    """Get character's full inventory"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Format inventory items
        inventory_items = []
        for item in character.inventory:
            inventory_items.append({
                'id': item.get('id', ''),
                'name': item.get('name', ''),
                'type': item.get('type', ''),
                'description': item.get('description', ''),
                'quantity': item.get('quantity', 1),
                'equipped': item.get('equipped', False)
            })

        return jsonify({
            'items': inventory_items,
            'gold': character.gold,
            'weight': sum(item.get('weight', 0) for item in character.inventory),
            'max_weight': character.max_carry_weight
        })

    except Exception as e:
        logger.error(f"Error getting inventory: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/quests/active', methods=['GET'])
def get_active_quests():
    """Get character's active quests"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Get active quests
        active_quests = []
        for quest in character.active_quests:
            active_quests.append({
                'id': quest.get('id', ''),
                'name': quest.get('name', ''),
                'description': quest.get('description', ''),
                'objectives': quest.get('objectives', []),
                'progress': quest.get('progress', 0),
                'reward': quest.get('reward', '')
            })

        return jsonify({'quests': active_quests})

    except Exception as e:
        logger.error(f"Error getting active quests: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/quests/completed', methods=['GET'])
def get_completed_quests():
    """Get character's completed quests"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        character = player.character

        # Get completed quests
        completed_quests = []
        for quest in character.completed_quests:
            completed_quests.append({
                'id': quest.get('id', ''),
                'name': quest.get('name', ''),
                'description': quest.get('description', ''),
                'completed_date': quest.get('completed_date', '')
            })

        return jsonify({'quests': completed_quests})

    except Exception as e:
        logger.error(f"Error getting completed quests: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/map/current', methods=['GET'])
def get_current_location():
    """Get character's current location"""
    try:
        game_code = session.get('game_code')
        username = session.get('username')

        if not game_code or not username:
            return jsonify({'error': 'Not in game'}), 400

        game = games.get(game_code)
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player = game.players.get(username)
        if not player:
            return jsonify({'error': 'Player not found'}), 404

        # Return current location from game state
        return jsonify({
            'location': game.current_location,
            'description': game.location_description
        })

    except Exception as e:
        logger.error(f"Error getting current location: {e}")
        return jsonify({'error': str(e)}), 500

'''

    # Find where to insert (before if __name__ == '__main__')
    insertion_marker = "if __name__ == '__main__':"

    if insertion_marker in content:
        content = content.replace(insertion_marker, new_endpoints + '\n' + insertion_marker)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print("\n[OK] Added missing API endpoints:")
        print("  + GET /api/character/stats")
        print("  + GET /api/character/divine_favor")
        print("  + GET /api/inventory/all")
        print("  + GET /api/quests/active")
        print("  + GET /api/quests/completed")
        print("  + GET /api/map/current")
        print("\nTotal new endpoints: 6")

        return True
    else:
        print("[ERROR] Could not find insertion point in web_game.py")
        return False

def main():
    print("=" * 70)
    print("PHASE D: ADDING MISSING API ENDPOINTS")
    print("=" * 70)

    success = add_missing_endpoints()

    if success:
        print("\n" + "=" * 70)
        print("SUCCESS: All endpoints added!")
        print("=" * 70)
        print("\nNext steps:")
        print("  1. Review the new endpoints in web_game.py")
        print("  2. Test endpoints with curl or browser")
        print("  3. Connect frontend to new endpoints")
        print("=" * 70)
    else:
        print("\n[FAIL] Integration failed")

    return success

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
