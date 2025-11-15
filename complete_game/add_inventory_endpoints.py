"""
Script to automatically add inventory endpoints to web_game.py
Run this to integrate the inventory system backend
"""

import os
import sys


def add_inventory_endpoints():
    """Add inventory endpoints to web_game.py"""

    web_game_path = "C:\\Users\\ilmiv\\ProjectArgent\\complete_game\\web_game.py"

    if not os.path.exists(web_game_path):
        print(f"ERROR: {web_game_path} not found")
        return False

    print("Reading web_game.py...")
    with open(web_game_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if endpoints already added
    if '@app.route(\'/api/inventory/equip\'' in content:
        print("✓ Inventory endpoints already exist in web_game.py")
        return True

    # Find the insertion point (after the existing /api/inventory/all endpoint)
    inventory_all_marker = "@app.route('/api/inventory/all', methods=['GET'])\ndef get_inventory():"

    if inventory_all_marker not in content:
        print("ERROR: Could not find existing /api/inventory/all endpoint")
        return False

    # Find the end of the get_inventory function
    lines = content.split('\n')
    insert_index = None

    for i, line in enumerate(lines):
        if "@app.route('/api/inventory/all" in line:
            # Find the next route after this one
            for j in range(i + 1, len(lines)):
                if lines[j].strip().startswith('@app.route(') and 'inventory' not in lines[j]:
                    insert_index = j
                    break
            break

    if insert_index is None:
        print("ERROR: Could not find insertion point")
        return False

    print(f"Found insertion point at line {insert_index}")

    # New endpoints to add
    new_endpoints = '''

@app.route('/api/inventory/equip', methods=['POST'])
@limiter.limit("30 per minute")
def equip_item():
    """Equip item to slot"""
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


@app.route('/api/inventory/unequip', methods=['POST'])
@limiter.limit("30 per minute")
def unequip_item():
    """Unequip item"""
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


@app.route('/api/inventory/use', methods=['POST'])
@limiter.limit("30 per minute")
def use_item():
    """Use consumable item"""
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


@app.route('/api/inventory/drop', methods=['POST'])
@limiter.limit("30 per minute")
def drop_item():
    """Drop item from inventory"""
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


@app.route('/api/inventory/move', methods=['POST'])
@limiter.limit("60 per minute")
def move_item():
    """Move item between inventory slots"""
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


@app.route('/api/inventory/add', methods=['POST'])
@limiter.limit("30 per minute")
def add_item():
    """Add item to inventory (for loot/rewards)"""
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

'''

    # Insert the new endpoints
    lines.insert(insert_index, new_endpoints)

    # Write back to file
    print("Writing updated web_game.py...")
    with open(web_game_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print("✓ Successfully added inventory endpoints to web_game.py")
    print("\nAdded endpoints:")
    print("  - POST /api/inventory/equip")
    print("  - POST /api/inventory/unequip")
    print("  - POST /api/inventory/use")
    print("  - POST /api/inventory/drop")
    print("  - POST /api/inventory/move")
    print("  - POST /api/inventory/add")

    return True


if __name__ == "__main__":
    print("=" * 70)
    print("INVENTORY BACKEND INTEGRATION")
    print("=" * 70)
    print()

    success = add_inventory_endpoints()

    if success:
        print("\n✓ Integration complete!")
        print("\nNext steps:")
        print("  1. Test the inventory manager: python inventory_manager.py")
        print("  2. Start the server: python web_game.py")
        print("  3. Test the endpoints with the frontend")
    else:
        print("\n✗ Integration failed")
        sys.exit(1)
