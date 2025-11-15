"""
Database Seed Script for The Arcane Codex
Populates database with initial items, quests, achievements, and other game content
"""

import sqlite3
import json
from datetime import datetime, timedelta

def seed_database(db_path="arcane_codex.db"):
    """
    Seed database with initial game content
    """
    print(f"Seeding database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # ========== SEED ITEMS ==========
        print("\nSeeding items...")

        items = [
            # Weapons
            {
                'id': 'rusty_sword', 'name': 'Rusty Sword',
                'description': 'A worn blade that has seen better days',
                'type': 'weapon', 'rarity': 'common', 'value': 10,
                'level_requirement': 1, 'class_requirement': None,
                'stackable': 0, 'max_stack': 1, 'icon': '⚔️',
                'slot': 'sword', 'durability': 50, 'max_durability': 50,
                'stats': json.dumps({'attack': 2}), 'effects': json.dumps({}),
                'enchantments': json.dumps([])
            },
            {
                'id': 'iron_sword', 'name': 'Iron Sword',
                'description': 'A reliable iron blade',
                'type': 'weapon', 'rarity': 'uncommon', 'value': 50,
                'level_requirement': 3, 'class_requirement': None,
                'stackable': 0, 'max_stack': 1, 'icon': '🗡️',
                'slot': 'sword', 'durability': 100, 'max_durability': 100,
                'stats': json.dumps({'attack': 4, 'critical_chance': 0.05}),
                'effects': json.dumps({}), 'enchantments': json.dumps([])
            },
            {
                'id': 'mage_staff', 'name': 'Apprentice Staff',
                'description': 'A basic staff for channeling magic',
                'type': 'weapon', 'rarity': 'common', 'value': 15,
                'level_requirement': 1, 'class_requirement': 'Mage',
                'stackable': 0, 'max_stack': 1, 'icon': '🔱',
                'slot': 'staff', 'durability': 80, 'max_durability': 80,
                'stats': json.dumps({'magic': 3}), 'effects': json.dumps({}),
                'enchantments': json.dumps([])
            },
            {
                'id': 'shadow_dagger', 'name': 'Shadow Dagger',
                'description': 'A blade that seems to drink in the light',
                'type': 'weapon', 'rarity': 'rare', 'value': 150,
                'level_requirement': 5, 'class_requirement': 'Thief',
                'stackable': 0, 'max_stack': 1, 'icon': '🗡️',
                'slot': 'dagger', 'durability': 100, 'max_durability': 100,
                'stats': json.dumps({'attack': 5, 'speed': 2, 'critical_chance': 0.15}),
                'effects': json.dumps({}), 'enchantments': json.dumps([])
            },

            # Armor
            {
                'id': 'leather_armor', 'name': 'Leather Armor',
                'description': 'Basic leather protection',
                'type': 'armor', 'rarity': 'common', 'value': 20,
                'level_requirement': 1, 'class_requirement': None,
                'stackable': 0, 'max_stack': 1, 'icon': '🎽',
                'slot': 'chest', 'durability': 60, 'max_durability': 60,
                'stats': json.dumps({'defense': 2}), 'effects': json.dumps({}),
                'enchantments': json.dumps([])
            },
            {
                'id': 'iron_helmet', 'name': 'Iron Helmet',
                'description': 'Sturdy head protection',
                'type': 'armor', 'rarity': 'uncommon', 'value': 40,
                'level_requirement': 2, 'class_requirement': None,
                'stackable': 0, 'max_stack': 1, 'icon': '⛑️',
                'slot': 'head', 'durability': 80, 'max_durability': 80,
                'stats': json.dumps({'defense': 1, 'hp_bonus': 5}),
                'effects': json.dumps({}), 'enchantments': json.dumps([])
            },
            {
                'id': 'wooden_shield', 'name': 'Wooden Shield',
                'description': 'A basic wooden shield',
                'type': 'armor', 'rarity': 'common', 'value': 15,
                'level_requirement': 1, 'class_requirement': None,
                'stackable': 0, 'max_stack': 1, 'icon': '🛡️',
                'slot': 'shield', 'durability': 50, 'max_durability': 50,
                'stats': json.dumps({'defense': 1, 'damage_reduction': 0.05}),
                'effects': json.dumps({}), 'enchantments': json.dumps([])
            },

            # Consumables
            {
                'id': 'health_potion', 'name': 'Health Potion',
                'description': 'Restores 20 HP',
                'type': 'consumable', 'rarity': 'common', 'value': 25,
                'level_requirement': 1, 'class_requirement': None,
                'stackable': 1, 'max_stack': 10, 'icon': '🧪',
                'slot': None, 'durability': None, 'max_durability': None,
                'stats': json.dumps({}), 'effects': json.dumps({}),
                'enchantments': json.dumps([]),
                'effect_type': 'healing', 'effect_value': 20, 'effect_duration': 0, 'cooldown': 0
            },
            {
                'id': 'mana_potion', 'name': 'Mana Potion',
                'description': 'Restores 10 MP',
                'type': 'consumable', 'rarity': 'common', 'value': 20,
                'level_requirement': 1, 'class_requirement': None,
                'stackable': 1, 'max_stack': 10, 'icon': '💙',
                'slot': None, 'durability': None, 'max_durability': None,
                'stats': json.dumps({}), 'effects': json.dumps({}),
                'enchantments': json.dumps([]),
                'effect_type': 'mana', 'effect_value': 10, 'effect_duration': 0, 'cooldown': 0
            },
            {
                'id': 'strength_elixir', 'name': 'Strength Elixir',
                'description': '+3 Attack for 5 turns',
                'type': 'consumable', 'rarity': 'uncommon', 'value': 50,
                'level_requirement': 1, 'class_requirement': None,
                'stackable': 1, 'max_stack': 5, 'icon': '💪',
                'slot': None, 'durability': None, 'max_durability': None,
                'stats': json.dumps({}), 'effects': json.dumps({}),
                'enchantments': json.dumps([]),
                'effect_type': 'buff', 'effect_value': 3, 'effect_duration': 5, 'cooldown': 0
            },

            # Materials
            {
                'id': 'iron_ore', 'name': 'Iron Ore',
                'description': 'Raw iron for crafting',
                'type': 'material', 'rarity': 'common', 'value': 5,
                'level_requirement': 1, 'class_requirement': None,
                'stackable': 1, 'max_stack': 99, 'icon': '⛏️',
                'slot': None, 'durability': None, 'max_durability': None,
                'stats': json.dumps({}), 'effects': json.dumps({}),
                'enchantments': json.dumps([])
            },
        ]

        for item in items:
            cursor.execute("""
                INSERT OR IGNORE INTO items
                (id, name, description, type, rarity, value, level_requirement, class_requirement,
                 stackable, max_stack, icon, slot, durability, max_durability, stats, effects,
                 enchantments, effect_type, effect_value, effect_duration, cooldown)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item['id'], item['name'], item['description'], item['type'], item['rarity'],
                item['value'], item['level_requirement'], item['class_requirement'],
                item['stackable'], item['max_stack'], item['icon'], item.get('slot'),
                item.get('durability'), item.get('max_durability'), item['stats'],
                item['effects'], item['enchantments'], item.get('effect_type'),
                item.get('effect_value'), item.get('effect_duration'), item.get('cooldown')
            ))

        print(f"  ✓ Seeded {len(items)} items")

        # ========== SEED LOOT TABLES ==========
        print("\nSeeding loot tables...")

        loot_entries = [
            # Goblin loot
            ('goblin', 'health_potion', 0.3, 1, 1, 1, None),
            ('goblin', 'rusty_sword', 0.1, 1, 1, 1, None),
            ('goblin', 'iron_ore', 0.4, 1, 3, 1, None),

            # Orc loot
            ('orc', 'health_potion', 0.4, 1, 2, 1, None),
            ('orc', 'iron_sword', 0.15, 1, 1, 3, None),
            ('orc', 'iron_helmet', 0.1, 1, 1, 3, None),
            ('orc', 'strength_elixir', 0.2, 1, 1, 1, None),

            # Bandit loot
            ('bandit', 'health_potion', 0.5, 1, 2, 1, None),
            ('bandit', 'shadow_dagger', 0.05, 1, 1, 5, None),
            ('bandit', 'iron_ore', 0.3, 1, 5, 1, None),
        ]

        for entry in loot_entries:
            cursor.execute("""
                INSERT INTO loot_tables
                (enemy_type, item_id, drop_chance, min_quantity, max_quantity, min_level, max_level)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, entry)

        print(f"  ✓ Seeded {len(loot_entries)} loot table entries")

        # ========== SEED QUESTS ==========
        print("\nSeeding quests...")

        quests = [
            {
                'id': 'blood_price_main',
                'name': 'The Blood Price',
                'description': 'A desperate father begs for help saving his daughter',
                'category': 'main',
                'difficulty': 'hard',
                'min_level': 1,
                'max_level': None,
                'prerequisite_quests': json.dumps([]),
                'required_items': json.dumps([]),
                'reward_xp': 500,
                'reward_gold': 100,
                'reward_items': json.dumps([{'item_id': 'health_potion', 'quantity': 3}]),
                'reward_divine_favor': json.dumps({'VALDRIS': 10, 'SYLARA': -5}),
                'objectives': json.dumps([
                    {'id': 'talk_grimsby', 'type': 'talk', 'target': 'Grimsby', 'description': 'Speak with Grimsby'},
                    {'id': 'investigate_warehouse', 'type': 'explore', 'target': 'Duke\'s Warehouse', 'description': 'Investigate the warehouse'},
                    {'id': 'make_choice', 'type': 'decision', 'target': 'final_choice', 'description': 'Make your choice'}
                ]),
                'story_text': 'Grimsby finds you in the tavern, tears streaming down his weathered face...',
                'npc_involved': 'Grimsby',
                'location': 'Valdria Town Square',
                'repeatable': 0,
                'cooldown_hours': None,
                'time_limit_hours': None
            },
            {
                'id': 'goblin_extermination',
                'name': 'Goblin Extermination',
                'description': 'Clear out the goblin camp threatening local farms',
                'category': 'side',
                'difficulty': 'easy',
                'min_level': 1,
                'max_level': 5,
                'prerequisite_quests': json.dumps([]),
                'required_items': json.dumps([]),
                'reward_xp': 150,
                'reward_gold': 50,
                'reward_items': json.dumps([{'item_id': 'iron_ore', 'quantity': 5}]),
                'reward_divine_favor': json.dumps({}),
                'objectives': json.dumps([
                    {'id': 'kill_goblins', 'type': 'kill', 'target': 'goblin', 'count': 5, 'description': 'Kill 5 goblins'}
                ]),
                'story_text': 'Local farmers report goblin raids on their livestock.',
                'npc_involved': 'Farmer Joe',
                'location': 'Farmlands',
                'repeatable': 1,
                'cooldown_hours': 24,
                'time_limit_hours': None
            },
            {
                'id': 'daily_patrol',
                'name': 'Town Patrol',
                'description': 'Help the guards patrol the town',
                'category': 'daily',
                'difficulty': 'easy',
                'min_level': 1,
                'max_level': None,
                'prerequisite_quests': json.dumps([]),
                'required_items': json.dumps([]),
                'reward_xp': 50,
                'reward_gold': 25,
                'reward_items': json.dumps([]),
                'reward_divine_favor': json.dumps({'VALDRIS': 5}),
                'objectives': json.dumps([
                    {'id': 'patrol_north', 'type': 'explore', 'target': 'North Gate', 'description': 'Patrol north gate'},
                    {'id': 'patrol_south', 'type': 'explore', 'target': 'South Gate', 'description': 'Patrol south gate'}
                ]),
                'story_text': 'The town guard captain needs extra hands for patrol duty.',
                'npc_involved': 'Captain Morris',
                'location': 'Valdria Town Square',
                'repeatable': 1,
                'cooldown_hours': 24,
                'time_limit_hours': None
            }
        ]

        for quest in quests:
            cursor.execute("""
                INSERT OR IGNORE INTO quests
                (id, name, description, category, difficulty, min_level, max_level,
                 prerequisite_quests, required_items, reward_xp, reward_gold, reward_items,
                 reward_divine_favor, objectives, story_text, npc_involved, location,
                 repeatable, cooldown_hours, time_limit_hours)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                quest['id'], quest['name'], quest['description'], quest['category'],
                quest['difficulty'], quest['min_level'], quest['max_level'],
                quest['prerequisite_quests'], quest['required_items'], quest['reward_xp'],
                quest['reward_gold'], quest['reward_items'], quest['reward_divine_favor'],
                quest['objectives'], quest['story_text'], quest['npc_involved'],
                quest['location'], quest['repeatable'], quest['cooldown_hours'],
                quest['time_limit_hours']
            ))

        print(f"  ✓ Seeded {len(quests)} quests")

        # ========== SEED ACHIEVEMENTS ==========
        print("\nSeeding achievements...")

        achievements = [
            {
                'id': 'first_blood',
                'name': 'First Blood',
                'description': 'Defeat your first enemy',
                'category': 'combat',
                'tier': 'bronze',
                'points': 10,
                'requirement_type': 'stat_threshold',
                'requirement_data': json.dumps({'stat': 'monsters_killed', 'value': 1}),
                'reward_xp': 50,
                'reward_gold': 25,
                'reward_items': json.dumps([]),
                'reward_title': 'Monster Slayer',
                'hidden': 0,
                'icon': '⚔️'
            },
            {
                'id': 'monster_hunter',
                'name': 'Monster Hunter',
                'description': 'Defeat 100 enemies',
                'category': 'combat',
                'tier': 'silver',
                'points': 25,
                'requirement_type': 'stat_threshold',
                'requirement_data': json.dumps({'stat': 'monsters_killed', 'value': 100}),
                'reward_xp': 200,
                'reward_gold': 100,
                'reward_items': json.dumps([{'item_id': 'strength_elixir', 'quantity': 3}]),
                'reward_title': 'The Hunter',
                'hidden': 0,
                'icon': '🏹'
            },
            {
                'id': 'questmaster',
                'name': 'Questmaster',
                'description': 'Complete 10 quests',
                'category': 'progression',
                'tier': 'bronze',
                'points': 15,
                'requirement_type': 'stat_threshold',
                'requirement_data': json.dumps({'stat': 'total_quests_completed', 'value': 10}),
                'reward_xp': 100,
                'reward_gold': 50,
                'reward_items': json.dumps([]),
                'reward_title': 'Adventurer',
                'hidden': 0,
                'icon': '📜'
            },
            {
                'id': 'wealthy',
                'name': 'Wealthy',
                'description': 'Earn 1,000 gold',
                'category': 'progression',
                'tier': 'silver',
                'points': 20,
                'requirement_type': 'stat_threshold',
                'requirement_data': json.dumps({'stat': 'total_gold_earned', 'value': 1000}),
                'reward_xp': 150,
                'reward_gold': 200,
                'reward_items': json.dumps([]),
                'reward_title': 'The Wealthy',
                'hidden': 0,
                'icon': '💰'
            },
            {
                'id': 'divine_champion',
                'name': 'Divine Champion',
                'description': 'Reach 100 favor with any god',
                'category': 'special',
                'tier': 'gold',
                'points': 50,
                'requirement_type': 'divine_favor',
                'requirement_data': json.dumps({'min_favor': 100}),
                'reward_xp': 500,
                'reward_gold': 500,
                'reward_items': json.dumps([]),
                'reward_title': 'Divine Champion',
                'hidden': 0,
                'icon': '✨'
            },
            {
                'id': 'max_level',
                'name': 'Maximum Power',
                'description': 'Reach level 20',
                'category': 'progression',
                'tier': 'platinum',
                'points': 100,
                'requirement_type': 'stat_threshold',
                'requirement_data': json.dumps({'stat': 'level', 'value': 20}),
                'reward_xp': 0,
                'reward_gold': 1000,
                'reward_items': json.dumps([]),
                'reward_title': 'Legendary Hero',
                'hidden': 0,
                'icon': '👑'
            }
        ]

        for achievement in achievements:
            cursor.execute("""
                INSERT OR IGNORE INTO achievements
                (id, name, description, category, tier, points, requirement_type,
                 requirement_data, reward_xp, reward_gold, reward_items, reward_title, hidden, icon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                achievement['id'], achievement['name'], achievement['description'],
                achievement['category'], achievement['tier'], achievement['points'],
                achievement['requirement_type'], achievement['requirement_data'],
                achievement['reward_xp'], achievement['reward_gold'], achievement['reward_items'],
                achievement['reward_title'], achievement['hidden'], achievement['icon']
            ))

        print(f"  ✓ Seeded {len(achievements)} achievements")

        # ========== SEED BATTLE PASS ==========
        print("\nSeeding battle pass...")

        # Create a season
        season_start = datetime.now()
        season_end = season_start + timedelta(days=60)

        cursor.execute("""
            INSERT OR IGNORE INTO battle_pass_seasons
            (id, name, description, start_date, end_date, max_level, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            1, 'Season 1: Divine Awakening',
            'The first season of The Arcane Codex battle pass',
            season_start, season_end, 50, 1
        ))

        # Seed some rewards
        battle_pass_rewards = [
            (1, 1, 'free', 'gold', json.dumps({'amount': 50})),
            (1, 2, 'free', 'item', json.dumps({'item_id': 'health_potion', 'quantity': 3})),
            (1, 3, 'free', 'xp', json.dumps({'amount': 100})),
            (1, 5, 'free', 'item', json.dumps({'item_id': 'iron_sword', 'quantity': 1})),
            (1, 10, 'free', 'title', json.dumps({'title': 'Season 1 Participant'})),

            (1, 1, 'premium', 'gold', json.dumps({'amount': 100})),
            (1, 2, 'premium', 'item', json.dumps({'item_id': 'mana_potion', 'quantity': 5})),
            (1, 5, 'premium', 'item', json.dumps({'item_id': 'shadow_dagger', 'quantity': 1})),
            (1, 10, 'premium', 'title', json.dumps({'title': 'Season 1 Elite'})),
        ]

        for reward in battle_pass_rewards:
            cursor.execute("""
                INSERT INTO battle_pass_rewards
                (season_id, tier_level, track, reward_type, reward_data)
                VALUES (?, ?, ?, ?, ?)
            """, reward)

        print(f"  ✓ Seeded battle pass season with {len(battle_pass_rewards)} rewards")

        # ========== SEED DAILY REWARDS ==========
        print("\nSeeding daily rewards...")

        # Create calendar
        cursor.execute("""
            INSERT OR IGNORE INTO daily_reward_calendars
            (id, name, duration_days, repeats, is_active)
            VALUES (?, ?, ?, ?, ?)
        """, (1, 'Standard Daily Rewards', 7, 1, 1))

        # Seed 7-day rewards
        daily_rewards = [
            (1, 1, 'gold', json.dumps({'amount': 25}), 0),
            (1, 2, 'xp', json.dumps({'amount': 50}), 0),
            (1, 3, 'item', json.dumps({'item_id': 'health_potion', 'quantity': 2}), 0),
            (1, 4, 'gold', json.dumps({'amount': 50}), 0),
            (1, 5, 'item', json.dumps({'item_id': 'mana_potion', 'quantity': 2}), 0),
            (1, 6, 'xp', json.dumps({'amount': 100}), 0),
            (1, 7, 'item', json.dumps({'item_id': 'strength_elixir', 'quantity': 1}), 1),  # Bonus day
        ]

        for reward in daily_rewards:
            cursor.execute("""
                INSERT INTO daily_rewards
                (calendar_id, day_number, reward_type, reward_data, is_bonus_day)
                VALUES (?, ?, ?, ?, ?)
            """, reward)

        print(f"  ✓ Seeded {len(daily_rewards)} daily rewards")

        # ========== SEED TITLES ==========
        print("\nSeeding titles...")

        titles = [
            ('novice', 'the Novice', 'Starting title for new players', 'common', 'default'),
            ('monster_slayer', 'Monster Slayer', 'Earned by defeating your first enemy', 'common', 'achievement'),
            ('the_hunter', 'the Hunter', 'Earned by defeating 100 enemies', 'rare', 'achievement'),
            ('adventurer', 'Adventurer', 'Earned by completing 10 quests', 'common', 'achievement'),
            ('divine_champion', 'Divine Champion', 'Earned by reaching 100 favor with a god', 'epic', 'achievement'),
            ('legendary_hero', 'Legendary Hero', 'Earned by reaching max level', 'legendary', 'achievement'),
        ]

        for title in titles:
            cursor.execute("""
                INSERT OR IGNORE INTO titles
                (id, name, description, rarity, source)
                VALUES (?, ?, ?, ?, ?)
            """, title)

        print(f"  ✓ Seeded {len(titles)} titles")

        # Commit all changes
        conn.commit()
        print("\n✓ Database seeding completed successfully!")

        return True

    except Exception as e:
        print(f"\n✗ Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return False

    finally:
        conn.close()

if __name__ == "__main__":
    print("="*60)
    print("THE ARCANE CODEX - Database Seed Script")
    print("="*60)

    success = seed_database("arcane_codex.db")

    if success:
        print("\n" + "="*60)
        print("Database seeding completed successfully!")
        print("="*60)
        print("\nSeeded content:")
        print("  • 11 Items (weapons, armor, consumables, materials)")
        print("  • 9 Loot table entries")
        print("  • 3 Quests (main, side, daily)")
        print("  • 6 Achievements")
        print("  • 1 Battle Pass Season with rewards")
        print("  • 7-day Daily Reward calendar")
        print("  • 6 Titles")
    else:
        print("\n" + "="*60)
        print("Database seeding failed. Check error messages above.")
        print("="*60)
