"""
THE ARCANE CODEX - Inventory API Endpoints
Add these endpoints to web_game.py after the existing /api/inventory/all endpoint
"""

# ============================================================================
# INVENTORY API ENDPOINTS - Add to web_game.py
# ============================================================================

# STEP 1: Update the existing /api/inventory/all endpoint
# Replace the existing endpoint (around line 1720) with this enhanced version:

"""
@app.route('/api/inventory/all', methods=['GET'])
def get_inventory():
    '''Get character's full inventory'''
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

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)

        # Format inventory items
        inventory_items = []
        for item in character.inventory:
            if isinstance(item, dict):
                inventory_items.append({
                    'id': item.get('id', ''),
                    'name': item.get('name', ''),
                    'type': item.get('type', ''),
                    'description': item.get('description', ''),
                    'quantity': item.get('quantity', 1),
                    'weight': item.get('weight', 1.0),
                    'value': item.get('value', 0),
                    'rarity': item.get('rarity', 'common'),
                    'equipped': item.get('equipped', False),
                    'slot': item.get('slot'),
                    'stats': item.get('stats', {}),
                    'icon': item.get('icon', '📦')
                })

        return jsonify({
            'items': inventory_items,
            'equipped': inv_manager.get_equipped_items(),
            'total_stats': inv_manager.get_total_stats(),
            'gold': character.gold,
            'weight': inv_manager.get_total_weight(),
            'max_weight': inv_manager.max_weight,
            'slots_used': len(character.inventory),
            'slots_max': inv_manager.max_slots
        })

    except Exception as e:
        logger.error(f"Error getting inventory: {e}")
        return jsonify({'error': str(e)}), 500
"""

# STEP 2: Add these NEW endpoints after /api/inventory/all

EQUIP_ENDPOINT = """
@app.route('/api/inventory/equip', methods=['POST'])
@limiter.limit("30 per minute")
def equip_item():
    '''Equip item to slot'''
    try:
        data = request.json
        item_id = data.get('item_id')
        slot = data.get('slot')

        if not item_id or not slot:
            return jsonify({'error': 'Missing item_id or slot'}), 400

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

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        result = inv_manager.equip_item(item_id, slot)

        if result['success']:
            # Emit SocketIO event to all players in the game
            socketio.emit('item_equipped', {
                'username': username,
                'item': result.get('equipped'),
                'slot': slot
            }, room=game_code)

            logger.info(f"{username} equipped {item_id} to {slot}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error equipping item: {e}")
        return jsonify({'error': str(e)}), 500
"""

UNEQUIP_ENDPOINT = """
@app.route('/api/inventory/unequip', methods=['POST'])
@limiter.limit("30 per minute")
def unequip_item():
    '''Unequip item'''
    try:
        data = request.json
        item_id = data.get('item_id')

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

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

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        result = inv_manager.unequip_item(item_id)

        if result['success']:
            # Emit SocketIO event
            socketio.emit('item_unequipped', {
                'username': username,
                'item': result.get('item')
            }, room=game_code)

            logger.info(f"{username} unequipped {item_id}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error unequipping item: {e}")
        return jsonify({'error': str(e)}), 500
"""

USE_ITEM_ENDPOINT = """
@app.route('/api/inventory/use', methods=['POST'])
@limiter.limit("30 per minute")
def use_item():
    '''Use consumable item'''
    try:
        data = request.json
        item_id = data.get('item_id')

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

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

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        result = inv_manager.use_item(item_id)

        if result['success']:
            # Emit SocketIO event
            socketio.emit('item_used', {
                'username': username,
                'item_id': item_id,
                'effect': result.get('effect'),
                'value': result.get('value'),
                'message': result.get('message')
            }, room=game_code)

            logger.info(f"{username} used {item_id}: {result.get('message')}")

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error using item: {e}")
        return jsonify({'error': str(e)}), 500
"""

DROP_ITEM_ENDPOINT = """
@app.route('/api/inventory/drop', methods=['POST'])
@limiter.limit("30 per minute")
def drop_item():
    '''Drop item from inventory'''
    try:
        data = request.json
        item_id = data.get('item_id')
        quantity = data.get('quantity', 1)

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

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

        # Import inventory manager
        from inventory_manager import InventoryManager

        inv_manager = InventoryManager(character)
        success = inv_manager.remove_item(item_id, quantity)

        if success:
            # Emit SocketIO event
            socketio.emit('item_dropped', {
                'username': username,
                'item_id': item_id,
                'quantity': quantity
            }, room=game_code)

            logger.info(f"{username} dropped {quantity}x {item_id}")

            return jsonify({
                'success': True,
                'message': f'Dropped {quantity} item(s)'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to drop item'
            })

    except Exception as e:
        logger.error(f"Error dropping item: {e}")
        return jsonify({'error': str(e)}), 500
"""

MOVE_ITEM_ENDPOINT = """
@app.route('/api/inventory/move', methods=['POST'])
@limiter.limit("60 per minute")
def move_item():
    '''Move item between inventory slots'''
    try:
        data = request.json
        from_index = data.get('from_index')
        to_index = data.get('to_index')

        if from_index is None or to_index is None:
            return jsonify({'error': 'Missing from_index or to_index'}), 400

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

        # Validate indices
        if from_index < 0 or to_index < 0:
            return jsonify({'error': 'Invalid indices'}), 400

        if from_index >= len(character.inventory) or to_index >= len(character.inventory):
            return jsonify({'error': 'Index out of range'}), 400

        # Swap items
        character.inventory[from_index], character.inventory[to_index] = \
            character.inventory[to_index], character.inventory[from_index]

        logger.info(f"{username} moved item from slot {from_index} to {to_index}")

        return jsonify({'success': True})

    except Exception as e:
        logger.error(f"Error moving item: {e}")
        return jsonify({'error': str(e)}), 500
"""

ADD_ITEM_ENDPOINT = """
@app.route('/api/inventory/add', methods=['POST'])
@limiter.limit("30 per minute")
def add_item():
    '''Add item to inventory (for loot/rewards)'''
    try:
        data = request.json
        item_id = data.get('item_id')
        quantity = data.get('quantity', 1)

        if not item_id:
            return jsonify({'error': 'Missing item_id'}), 400

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

        # Import inventory manager and item database
        from inventory_manager import InventoryManager
        from inventory_system import ItemDatabase

        inv_manager = InventoryManager(character)
        item_db = ItemDatabase()

        # Get item from database
        db_item = item_db.get_item(item_id)
        if not db_item:
            return jsonify({'error': 'Item not found in database'}), 404

        # Convert to dict
        item_dict = {
            'id': db_item.id,
            'name': db_item.name,
            'type': db_item.type.value if hasattr(db_item.type, 'value') else str(db_item.type),
            'description': db_item.description,
            'quantity': quantity,
            'weight': 1.0,
            'value': db_item.value,
            'rarity': db_item.rarity.value if hasattr(db_item.rarity, 'value') else str(db_item.rarity),
            'icon': db_item.icon,
            'stackable': db_item.stackable,
            'stats': {}
        }

        # Add stats if equipment
        if hasattr(db_item, 'stats') and db_item.stats:
            item_dict['stats'] = {
                'attack': db_item.stats.attack,
                'defense': db_item.stats.defense,
                'magic': db_item.stats.magic,
                'speed': db_item.stats.speed
            }

        # Add consumable properties
        if hasattr(db_item, 'effect_type'):
            item_dict['effect_type'] = db_item.effect_type
            item_dict['effect_value'] = db_item.effect_value

        success = inv_manager.add_item(item_dict, quantity)

        if success:
            # Emit SocketIO event
            socketio.emit('item_added', {
                'username': username,
                'item': item_dict,
                'quantity': quantity
            }, room=game_code)

            logger.info(f"Added {quantity}x {item_id} to {username}'s inventory")

            return jsonify({
                'success': True,
                'message': f'Added {quantity}x {db_item.name}',
                'item': item_dict
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Inventory full or overweight'
            })

    except Exception as e:
        logger.error(f"Error adding item: {e}")
        return jsonify({'error': str(e)}), 500
"""


# STEP 3: Integration Instructions
INTEGRATION_INSTRUCTIONS = """
============================================================================
INTEGRATION INSTRUCTIONS
============================================================================

1. Open web_game.py

2. Find the existing @app.route('/api/inventory/all', methods=['GET'])
   endpoint (around line 1720)

3. Replace it with the enhanced version from this file

4. Add all the new endpoints after the inventory/all endpoint:
   - /api/inventory/equip (POST)
   - /api/inventory/unequip (POST)
   - /api/inventory/use (POST)
   - /api/inventory/drop (POST)
   - /api/inventory/move (POST)
   - /api/inventory/add (POST)

5. All endpoints are rate-limited and include SocketIO events for
   real-time multiplayer updates

6. Test with:
   python inventory_manager.py  # Test the manager
   python web_game.py            # Run the server

============================================================================
"""

if __name__ == "__main__":
    print(INTEGRATION_INSTRUCTIONS)
    print("\nEndpoint code snippets ready to copy into web_game.py")
