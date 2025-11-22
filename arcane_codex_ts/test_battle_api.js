/**
 * Battle API Test Script
 * Tests all battle endpoints with real requests
 */

const BASE_URL = 'http://localhost:5000/api';

// Helper function to make requests
async function request(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Request failed:', error);
    return { status: 500, data: { error: error.message } };
  }
}

// Test suite
async function runTests() {
  console.log('='.repeat(60));
  console.log('Battle API Test Suite');
  console.log('='.repeat(60));

  let battleId;
  let sessionCookie;

  // Test 1: Set username
  console.log('\n[TEST 1] Setting username...');
  const username = await request('/set_username', 'POST', { username: 'TestHero' });
  console.log('Status:', username.status);
  console.log('Response:', username.data);

  // Test 2: Start battle with default enemy
  console.log('\n[TEST 2] Starting battle (default enemy)...');
  const battle1 = await request('/battle/start', 'POST', {});
  console.log('Status:', battle1.status);
  console.log('Battle ID:', battle1.data.battle_id);
  console.log('Enemy:', battle1.data.enemy?.name);
  console.log('Turn order:', battle1.data.turn_order);

  if (battle1.data.battle_id) {
    battleId = battle1.data.battle_id;
  }

  // Test 3: Get battle status
  if (battleId) {
    console.log('\n[TEST 3] Getting battle status...');
    const status = await request(`/battle/${battleId}/status`);
    console.log('Status:', status.status);
    console.log('Player HP:', status.data.player?.hp);
    console.log('Enemy HP:', status.data.enemy?.hp);
    console.log('Is player turn:', status.data.is_player_turn);
  }

  // Test 4: Execute attack action
  if (battleId) {
    console.log('\n[TEST 4] Executing attack action...');
    const attack = await request(`/battle/${battleId}/action`, 'POST', {
      action_type: 'attack'
    });
    console.log('Status:', attack.status);
    console.log('Damage dealt:', attack.data.damage);
    console.log('Combat log:', attack.data.combatLog);
  }

  // Test 5: Use ability
  if (battleId) {
    console.log('\n[TEST 5] Using ability (power_strike)...');
    const ability = await request(`/battle/${battleId}/use_ability`, 'POST', {
      ability_id: 'power_strike'
    });
    console.log('Status:', ability.status);
    console.log('Response:', ability.data);
  }

  // Test 6: Defend action
  if (battleId) {
    console.log('\n[TEST 6] Executing defend action...');
    const defend = await request(`/battle/${battleId}/action`, 'POST', {
      action_type: 'defend'
    });
    console.log('Status:', defend.status);
    console.log('Response:', defend.data);
  }

  // Test 7: Start battle with specific enemy
  console.log('\n[TEST 7] Starting battle with ANCIENT_DRAGON...');
  const battle2 = await request('/battle/start', 'POST', {
    enemy_type: 'ANCIENT_DRAGON'
  });
  console.log('Status:', battle2.status);
  console.log('Enemy:', battle2.data.enemy?.name);
  console.log('Enemy HP:', battle2.data.enemy?.maxHp);

  if (battle2.data.battle_id) {
    const dragonBattleId = battle2.data.battle_id;

    // Test 8: Flee from dragon
    console.log('\n[TEST 8] Attempting to flee from dragon...');
    const flee = await request(`/battle/${dragonBattleId}/flee`, 'POST', {});
    console.log('Status:', flee.status);
    console.log('Fled:', flee.data.fled);
    console.log('Flee chance:', flee.data.flee_chance);
    console.log('Message:', flee.data.message);
  }

  // Test 9: Invalid battle ID
  console.log('\n[TEST 9] Testing invalid battle ID...');
  const invalid = await request('/battle/invalid-id/status');
  console.log('Status:', invalid.status);
  console.log('Error:', invalid.data.error);

  // Test 10: Invalid action type
  if (battleId) {
    console.log('\n[TEST 10] Testing invalid action type...');
    const invalidAction = await request(`/battle/${battleId}/action`, 'POST', {
      action_type: 'invalid'
    });
    console.log('Status:', invalidAction.status);
    console.log('Error:', invalidAction.data.error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Suite Complete!');
  console.log('='.repeat(60));
}

// Run tests if Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - need to use node-fetch
  console.log('Error: This script requires a browser environment or node-fetch');
  console.log('Run with: node --experimental-fetch test_battle_api.js');
  console.log('Or use a tool like Postman/Insomnia for API testing');
} else {
  // Browser environment
  runTests().catch(console.error);
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, request };
}
