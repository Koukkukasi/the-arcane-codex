#!/usr/bin/env python3
"""
The Arcane Codex - Terminal Prototype
Single-player AI DM test
"""

import json
import random
import anthropic
from prompts import DM_SYSTEM_PROMPT, build_context

# Load configuration
with open('config.json', 'r') as f:
    config = json.load(f)

# Initialize Claude client
client = anthropic.Anthropic(api_key=config['CLAUDE_API_KEY'])

# Load game state
with open('game_state.json', 'r') as f:
    game_state = json.load(f)


def save_game_state():
    """Save current game state to file"""
    with open('game_state.json', 'w') as f:
        json.dump(game_state, f, indent=2)


def skill_check(skill_name, difficulty):
    """
    Perform a skill check
    Returns: (success: bool, roll: int, threshold: int, result_type: str)
    """
    player_skill = game_state['player']['skills'].get(skill_name, 10)

    roll = random.randint(1, 100)
    threshold = 50 + ((player_skill - difficulty) / 2)

    # Critical success/failure
    if roll <= 5:
        return (True, roll, threshold, "critical_success")
    elif roll >= 96:
        return (False, roll, threshold, "critical_failure")

    success = roll <= threshold
    result_type = "success" if success else "failure"

    return (success, roll, threshold, result_type)


def update_skill(skill_name, difficulty):
    """Update skill based on successful check"""
    player_skill = game_state['player']['skills'].get(skill_name, 10)

    # Calculate skill gain
    if difficulty > player_skill + 20:
        gain = 3  # Hard challenge
    elif difficulty > player_skill:
        gain = 2  # Moderate challenge
    else:
        gain = 1  # Easy challenge

    # Update skill
    new_skill = min(player_skill + gain, 100)  # Cap at 100
    game_state['player']['skills'][skill_name] = new_skill

    return gain, new_skill


def track_skill_result(skill_name, success):
    """Track success/failure chains for dynamic difficulty"""
    if 'skill_chains' not in game_state:
        game_state['skill_chains'] = {'successes': {}, 'failures': {}}

    if success:
        # Increment success chain
        game_state['skill_chains']['successes'][skill_name] = \
            game_state['skill_chains']['successes'].get(skill_name, 0) + 1
        # Reset failure chain
        game_state['skill_chains']['failures'][skill_name] = 0
    else:
        # Increment failure chain
        game_state['skill_chains']['failures'][skill_name] = \
            game_state['skill_chains']['failures'].get(skill_name, 0) + 1
        # Reset success chain
        game_state['skill_chains']['successes'][skill_name] = 0


def call_claude(player_action):
    """
    Call Claude API with game state and player action
    Returns: parsed JSON response
    """
    context = build_context(game_state)

    user_message = f"{context}\n\nPLAYER ACTION: {player_action}\n\nRespond with JSON only."

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            system=DM_SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": user_message
            }]
        )

        # Extract JSON from response
        response_text = response.content[0].text

        # Remove markdown code fences if present
        if response_text.strip().startswith('```'):
            lines = response_text.strip().split('\n')
            response_text = '\n'.join(lines[1:-1])  # Remove first and last line

        # Parse JSON
        parsed = json.loads(response_text)
        return parsed

    except Exception as e:
        print(f"\n❌ Error calling Claude API: {e}")
        return None


def apply_state_updates(updates):
    """Apply state updates from Claude response"""
    if 'location' in updates:
        game_state['world']['location'] = updates['location']

    if 'flags' in updates:
        game_state['world']['flags'].update(updates['flags'])

    if 'hp' in updates:
        game_state['player']['hp'] = max(0, min(updates['hp'], game_state['player']['max_hp']))

    if 'mana' in updates:
        game_state['player']['mana'] = max(0, min(updates['mana'], game_state['player']['max_mana']))

    if 'stamina' in updates:
        game_state['player']['stamina'] = max(0, min(updates['stamina'], game_state['player']['max_stamina']))

    if 'inventory' in updates:
        game_state['player']['inventory'] = updates['inventory']

    if 'gold' in updates:
        game_state['player']['gold'] = max(0, updates['gold'])

    # Handle NPC updates (approval, memory, met status)
    if 'npc_updates' in updates:
        for npc_id, npc_changes in updates['npc_updates'].items():
            if npc_id in game_state['npcs']:
                old_approval = game_state['npcs'][npc_id].get('approval', 50)

                # Update approval
                if 'approval' in npc_changes:
                    new_approval = npc_changes['approval']
                    game_state['npcs'][npc_id]['approval'] = new_approval

                    # Update relationship tier based on approval
                    if new_approval <= 20:
                        game_state['npcs'][npc_id]['relationship_tier'] = 'hostile'
                    elif new_approval <= 40:
                        game_state['npcs'][npc_id]['relationship_tier'] = 'unfriendly'
                    elif new_approval <= 60:
                        game_state['npcs'][npc_id]['relationship_tier'] = 'neutral'
                    elif new_approval <= 80:
                        game_state['npcs'][npc_id]['relationship_tier'] = 'friendly'
                    else:
                        game_state['npcs'][npc_id]['relationship_tier'] = 'trusted'

                    # Display approval change to player
                    if new_approval != old_approval:
                        change = new_approval - old_approval
                        change_str = f"+{change}" if change > 0 else str(change)
                        tier = game_state['npcs'][npc_id]['relationship_tier']
                        print(f"\n💫 [{game_state['npcs'][npc_id]['name']} Approval: {old_approval} → {new_approval} ({change_str}) - {tier.upper()}]")

                # Mark as met
                if 'met' in npc_changes:
                    game_state['npcs'][npc_id]['met'] = npc_changes['met']

                # Add memories
                if 'remembers' in npc_changes:
                    new_memories = npc_changes['remembers']
                    if isinstance(new_memories, list):
                        game_state['npcs'][npc_id]['remembers'].extend(new_memories)
                    else:
                        game_state['npcs'][npc_id]['remembers'].append(new_memories)

                # Track approval history
                if 'approval' in npc_changes and 'reason' in npc_changes:
                    if 'approval_history' not in game_state['npcs'][npc_id]:
                        game_state['npcs'][npc_id]['approval_history'] = []

                    game_state['npcs'][npc_id]['approval_history'].append({
                        'turn': len(game_state.get('recent_events', [])),
                        'change': npc_changes['approval'] - old_approval,
                        'reason': npc_changes['reason']
                    })


def display_actions(actions):
    """Display action choices to player"""
    print("\nWhat do you do?")
    for action in actions:
        icon = "✍️" if action['id'] == 4 else ["💬", "🔍", "⚔️", "🔮"][action['id'] - 1]

        if action['skill_required']:
            player_skill = game_state['player']['skills'].get(action['skill_required'], 10)
            difficulty = action['difficulty']

            # Calculate success chance
            threshold = 50 + ((player_skill - difficulty) / 2)

            # Determine indicator with percentage
            if threshold >= 65:
                indicator = f"🟢 {int(threshold)}% chance"
            elif threshold >= 40:
                indicator = f"🟡 {int(threshold)}% chance"
            else:
                indicator = f"🔴 {int(threshold)}% chance"

            print(f"{action['id']}. {icon} {action['description']} [{action['skill_required'].title()}: {difficulty}] {indicator}")
        else:
            print(f"{action['id']}. {icon} {action['description']}")


def main_game_loop():
    """Main game loop"""
    turn_counter = 0

    print("\n" + "="*60)
    print("    THE ARCANE CODEX - Terminal Prototype")
    print("="*60)
    print(f"\nWelcome, {game_state['player']['name']} the {game_state['player']['class']}!")
    print(f"HP: {game_state['player']['hp']}/{game_state['player']['max_hp']} | "
          f"Mana: {game_state['player']['mana']}/{game_state['player']['max_mana']} | "
          f"Gold: {game_state['player']['gold']}")
    print("\nType 'quit' to exit, 'status' to see your character sheet")
    print("-"*60)

    # Initial scene
    initial_action = "Begin the adventure. The player has just arrived at the tavern."
    response = call_claude(initial_action)

    if not response:
        print("Failed to start game. Check your API key in config.json")
        return

    print(f"\n📍 {game_state['world']['location']}")
    print(f"\n{response['narration']}\n")

    # Apply any state updates
    if 'state_updates' in response and response['state_updates']:
        apply_state_updates(response['state_updates'])

    # Main loop
    while True:
        turn_counter += 1

        # Display turn counter and action choices
        print(f"\n{'─'*60}")
        print(f"Turn {turn_counter}")
        print(f"{'─'*60}")

        if 'actions' in response and response['actions']:
            display_actions(response['actions'])

        # Get player input
        print("\n> ", end="")
        player_input = input().strip()

        # Handle special commands
        if player_input.lower() == 'quit':
            print("\nThanks for playing! Game saved.")
            save_game_state()
            break

        if player_input.lower() == 'status':
            print(f"\n{game_state['player']['name']} the {game_state['player']['class']}")
            print(f"HP: {game_state['player']['hp']}/{game_state['player']['max_hp']}")
            print(f"Mana: {game_state['player']['mana']}/{game_state['player']['max_mana']}")
            print(f"Stamina: {game_state['player']['stamina']}/{game_state['player']['max_stamina']}")
            print(f"Gold: {game_state['player']['gold']}")
            print(f"\nTop Skills:")
            top_skills = sorted(game_state['player']['skills'].items(), key=lambda x: x[1], reverse=True)[:5]
            for skill, value in top_skills:
                print(f"  {skill.title()}: {value}")
            print(f"\nInventory: {', '.join(game_state['player']['inventory'])}")
            continue

        # Process player action
        if not player_input:
            continue

        # Check if player selected a numbered action
        selected_action = None
        if player_input.isdigit() and 'actions' in response:
            action_id = int(player_input)
            for action in response['actions']:
                if action['id'] == action_id:
                    selected_action = action
                    break

        # Perform skill check if action requires it
        if selected_action and selected_action['skill_required']:
            skill_name = selected_action['skill_required']
            difficulty = selected_action['difficulty']

            success, roll, threshold, result_type = skill_check(skill_name, difficulty)

            print(f"\n🎲 {skill_name.upper()} CHECK")
            print(f"   Your skill: {game_state['player']['skills'][skill_name]}")
            print(f"   Difficulty: {difficulty}")
            print(f"   Roll: {roll} vs {int(threshold)}% threshold")

            if result_type == "critical_success":
                print("   ✨ CRITICAL SUCCESS!")
                gain, new_skill = update_skill(skill_name, difficulty)
                track_skill_result(skill_name, True)
                game_state['player']['momentum'] += 1
                print(f"   {skill_name.title()}: {game_state['player']['skills'][skill_name] - gain} → {new_skill} (+{gain})")
                print(f"   +1 Momentum! (Total: {game_state['player']['momentum']})")

                action_description = f"{selected_action['description']} (CRITICAL SUCCESS - player rolled {roll})"

            elif result_type == "critical_failure":
                print("   💥 CRITICAL FAILURE!")
                track_skill_result(skill_name, False)
                action_description = f"{selected_action['description']} (CRITICAL FAILURE - player rolled {roll})"

            elif success:
                print("   ✅ SUCCESS!")
                gain, new_skill = update_skill(skill_name, difficulty)
                track_skill_result(skill_name, True)
                print(f"   {skill_name.title()}: {game_state['player']['skills'][skill_name] - gain} → {new_skill} (+{gain})")

                action_description = f"{selected_action['description']} (SUCCESS)"

            else:
                print("   ❌ FAILURE")
                track_skill_result(skill_name, False)
                action_description = f"{selected_action['description']} (FAILED)"

            player_action = action_description

        else:
            # Freeform action or no skill check needed
            player_action = player_input if not selected_action else selected_action['description']

        # Add to recent events
        game_state['recent_events'].append(f"Player: {player_action}")
        if len(game_state['recent_events']) > 5:
            game_state['recent_events'].pop(0)

        # Get AI response
        print("\n⏳ The Chronicler is thinking...\n")
        response = call_claude(player_action)

        if not response:
            print("Error getting response. Try again.")
            continue

        # Display narration
        print(f"📍 {game_state['world']['location']}")
        print(f"\n{response['narration']}\n")

        # Apply state updates
        if 'state_updates' in response and response['state_updates']:
            apply_state_updates(response['state_updates'])

        # Save game state
        save_game_state()

        # Check for death
        if game_state['player']['hp'] <= 0:
            print("\n💀 YOU HAVE DIED 💀")
            print("\nGame Over. Thanks for playing!")
            break


if __name__ == "__main__":
    try:
        main_game_loop()
    except KeyboardInterrupt:
        print("\n\nGame interrupted. Saving...")
        save_game_state()
        print("Saved! Goodbye!")
