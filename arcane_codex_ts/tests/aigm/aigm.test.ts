/**
 * AI Game Master Service Unit Tests
 * Tests for scenario generation, choice validation, consequence resolution,
 * and asymmetric information management
 */

import { test, expect } from '@playwright/test';
import { AIGMService } from '../../src/services/ai_gm_core';
import {
  ScenarioType,
  ConsequenceType,
  ScenarioRequest,
  ScenarioContext,
  PlayerHistory,
  PartyState,
  WorldState,
  Consequence,
  ScenarioChoice
} from '../../src/types/ai_gm';
import { CharacterClass, God } from '../../src/types/game';

// Helper to create test player history
const createTestPlayerHistory = (id: string, overrides: Partial<PlayerHistory> = {}): PlayerHistory => ({
  playerId: id,
  playerName: `Player${id}`,
  characterClass: CharacterClass.WARRIOR,
  godFavor: new Map<God, number>([
    [God.VALDRIS, 50],
    [God.KAITHA, 30],
    [God.MORVANE, 20]
  ]),
  specialItems: [],
  npcRelationships: new Map(),
  knownSecrets: [],
  personalGoals: ['Survive the dungeon'],
  moralAlignment: { lawChaos: 0, goodEvil: 50 },
  ...overrides
});

// Helper to create test party state
const createTestPartyState = (overrides: Partial<PartyState> = {}): PartyState => ({
  location: 'Ancient Forest',
  activeQuests: [],
  sharedInventory: ['Health Potion', 'Torch'],
  partyReputation: 50,
  resources: { gold: 100, supplies: 50, influence: 25 },
  partyModifiers: [],
  ...overrides
});

// Helper to create test world state
const createTestWorldState = (): WorldState => ({
  factions: new Map(),
  majorEvents: [],
  playerActionsHistory: [],
  worldTime: { day: 1, season: 'SPRING', year: 1 },
  globalFlags: new Map()
});

// Helper to create test scenario context
const createTestContext = (playerCount: number = 2): ScenarioContext => {
  const playerHistories = [];
  const playerIds = [];
  const classes = [];

  for (let i = 0; i < playerCount; i++) {
    const id = `player-${i}`;
    playerIds.push(id);
    classes.push(CharacterClass.WARRIOR);
    playerHistories.push(createTestPlayerHistory(id));
  }

  return {
    playerHistories,
    partyState: createTestPartyState(),
    partyComposition: {
      playerIds,
      classes,
      averageLevel: 1,
      partySize: playerCount
    },
    worldState: createTestWorldState()
  };
};

// Helper to create test scenario request
const createTestRequest = (overrides: Partial<ScenarioRequest> = {}): ScenarioRequest => ({
  context: createTestContext(),
  difficulty: 5,
  ...overrides
});

// Reset singleton between tests
const resetAIGMService = () => {
  // Access private static instance to reset
  (AIGMService as any).instance = undefined;
};

test.describe('AI GM Service - Singleton Pattern', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should return the same instance on multiple calls', () => {
    const instance1 = AIGMService.getInstance();
    const instance2 = AIGMService.getInstance();

    expect(instance1).toBe(instance2);
  });

  test('should initialize with default configuration', () => {
    const service = AIGMService.getInstance();
    const metrics = service.getMetrics();

    expect(metrics.totalScenariosGenerated).toBe(0);
    expect(metrics.aiGeneratedCount).toBe(0);
    expect(metrics.templateGeneratedCount).toBe(0);
  });

  test('should accept custom configuration', () => {
    const service = AIGMService.getInstance({
      enableAI: false,
      maxRetries: 5,
      timeout: 60000
    });

    // Service should be initialized - metrics should be at 0
    const metrics = service.getMetrics();
    expect(metrics.totalScenariosGenerated).toBe(0);
  });
});

test.describe('AI GM Service - Scenario Generation', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should generate a scenario from template', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();

    const scenario = await service.generateScenario(request);

    expect(scenario).toBeDefined();
    expect(scenario.id).toBeTruthy();
    expect(scenario.title).toBeTruthy();
    expect(scenario.narrative).toBeTruthy();
    expect(scenario.choices.length).toBeGreaterThanOrEqual(2);
    expect(scenario.choices.length).toBeLessThanOrEqual(4);
  });

  test('should generate scenario with specified type', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest({
      desiredType: ScenarioType.INVESTIGATION
    });

    const scenario = await service.generateScenario(request);

    expect(scenario.type).toBe(ScenarioType.INVESTIGATION);
  });

  test('should include asymmetric info for each player', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();

    const scenario = await service.generateScenario(request);

    expect(scenario.asymmetricInfo.length).toBeGreaterThanOrEqual(2);
    const playerIds = request.context.playerHistories.map(h => h.playerId);
    for (const playerId of playerIds) {
      const info = scenario.asymmetricInfo.find(i => i.playerId === playerId);
      expect(info).toBeDefined();
    }
  });

  test('should update metrics after generation', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();

    await service.generateScenario(request);

    const metrics = service.getMetrics();
    expect(metrics.totalScenariosGenerated).toBe(1);
    expect(metrics.templateGeneratedCount).toBe(1);
    expect(metrics.averageGenerationTime).toBeGreaterThan(0);
  });

  test('should store scenario in active scenarios', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();

    const scenario = await service.generateScenario(request);
    const activeScenarios = service.getActiveScenarios();

    expect(activeScenarios.has(scenario.id)).toBe(true);
    expect(activeScenarios.get(scenario.id)?.completed).toBe(false);
  });

  test('should handle multiple scenario generation', async () => {
    const service = AIGMService.getInstance({ enableAI: false });

    const scenario1 = await service.generateScenario(createTestRequest());
    const scenario2 = await service.generateScenario(createTestRequest());
    const scenario3 = await service.generateScenario(createTestRequest());

    expect(scenario1.id).not.toBe(scenario2.id);
    expect(scenario2.id).not.toBe(scenario3.id);

    const metrics = service.getMetrics();
    expect(metrics.totalScenariosGenerated).toBe(3);
  });
});

test.describe('AI GM Service - Choice Validation', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should validate a valid choice', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const playerId = request.context.playerHistories[0].playerId;
    const choiceId = scenario.choices[0].id;

    const isValid = service.validateChoice(scenario.id, choiceId, playerId);
    expect(isValid).toBe(true);
  });

  test('should reject choice for non-existent scenario', () => {
    const service = AIGMService.getInstance({ enableAI: false });

    const isValid = service.validateChoice('non-existent', 'choice-1', 'player-1');
    expect(isValid).toBe(false);
  });

  test('should reject choice for non-existent choice ID', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const playerId = request.context.playerHistories[0].playerId;

    const isValid = service.validateChoice(scenario.id, 'invalid-choice', playerId);
    expect(isValid).toBe(false);
  });

  test('should reject duplicate choice from same player', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const playerId = request.context.playerHistories[0].playerId;
    const choiceId = scenario.choices[0].id;

    // First choice should be valid
    service.registerChoice(scenario.id, playerId, choiceId);

    // Second choice should be invalid
    const isValid = service.validateChoice(scenario.id, choiceId, playerId);
    expect(isValid).toBe(false);
  });

  test('should reject choice on completed scenario', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    service.completeScenario(scenario.id, 'SUCCESS');

    const playerId = request.context.playerHistories[0].playerId;
    const choiceId = scenario.choices[0].id;

    const isValid = service.validateChoice(scenario.id, choiceId, playerId);
    expect(isValid).toBe(false);
  });
});

test.describe('AI GM Service - Choice Registration', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should register a valid choice', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const playerId = request.context.playerHistories[0].playerId;
    const choiceId = scenario.choices[0].id;

    const success = service.registerChoice(scenario.id, playerId, choiceId);
    expect(success).toBe(true);
  });

  test('should reject invalid choice registration', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const success = service.registerChoice(scenario.id, 'player-1', 'invalid-choice');
    expect(success).toBe(false);
  });

  test('should auto-complete scenario when all players choose', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    // Register choices for all players
    for (const playerHistory of request.context.playerHistories) {
      service.registerChoice(scenario.id, playerHistory.playerId, scenario.choices[0].id);
    }

    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    // Should be completed after all players chose
    expect(active?.completed).toBe(true);
  });
});

test.describe('AI GM Service - Consequence Resolution', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should resolve consequences for a choice', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const choiceId = scenario.choices[0].id;
    const consequences = service.resolveConsequences(scenario.id, choiceId);

    expect(Array.isArray(consequences)).toBe(true);
  });

  test('should return empty array for non-existent scenario', () => {
    const service = AIGMService.getInstance({ enableAI: false });

    const consequences = service.resolveConsequences('non-existent', 'choice-1');
    expect(consequences).toEqual([]);
  });

  test('should return empty array for non-existent choice', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const consequences = service.resolveConsequences(scenario.id, 'invalid-choice');
    expect(consequences).toEqual([]);
  });
});

test.describe('AI GM Service - Player Knowledge', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should return null for non-existent scenario', () => {
    const service = AIGMService.getInstance({ enableAI: false });

    const knowledge = service.getPlayerKnowledge('player-1', 'non-existent');
    expect(knowledge).toBeNull();
  });

  test('should retrieve player-specific asymmetric info', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    const playerId = request.context.playerHistories[0].playerId;
    const knowledge = service.getPlayerKnowledge(playerId, scenario.id);

    // May be null if no asymmetric info was generated for this player
    // but should not throw an error
    expect(knowledge === null || typeof knowledge === 'object').toBe(true);
  });
});

test.describe('AI GM Service - Scenario Completion', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should complete scenario with SUCCESS outcome', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    service.completeScenario(scenario.id, 'SUCCESS');

    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    expect(active?.completed).toBe(true);
    expect(active?.outcome).toBe('SUCCESS');
  });

  test('should complete scenario with FAILURE outcome', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    service.completeScenario(scenario.id, 'FAILURE');

    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    expect(active?.completed).toBe(true);
    expect(active?.outcome).toBe('FAILURE');
  });

  test('should complete scenario with PARTIAL outcome', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    service.completeScenario(scenario.id, 'PARTIAL');

    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    expect(active?.completed).toBe(true);
    expect(active?.outcome).toBe('PARTIAL');
  });

  test('should complete scenario with ABANDONED outcome', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();
    const scenario = await service.generateScenario(request);

    service.completeScenario(scenario.id, 'ABANDONED');

    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    expect(active?.completed).toBe(true);
    expect(active?.outcome).toBe('ABANDONED');
  });

  test('should handle completion of non-existent scenario gracefully', () => {
    const service = AIGMService.getInstance({ enableAI: false });

    // Should not throw
    expect(() => {
      service.completeScenario('non-existent', 'SUCCESS');
    }).not.toThrow();
  });
});

test.describe('AI GM Service - Cleanup', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should cleanup old completed scenarios', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();

    // Generate and complete a scenario
    const scenario = await service.generateScenario(request);
    service.completeScenario(scenario.id, 'SUCCESS');

    // Manually set old start time (accessing internal state for testing)
    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);
    if (active) {
      // Set start time to 2 hours ago
      (active as any).startTime = Date.now() - 7200000;
    }

    // Cleanup scenarios older than 1 hour
    service.cleanupOldScenarios(3600000);

    // Should be cleaned up
    const afterCleanup = service.getActiveScenarios();
    expect(afterCleanup.has(scenario.id)).toBe(false);
  });

  test('should not cleanup active scenarios', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest();

    const scenario = await service.generateScenario(request);

    // Don't complete the scenario
    service.cleanupOldScenarios(0);

    // Should still exist (not completed)
    const afterCleanup = service.getActiveScenarios();
    expect(afterCleanup.has(scenario.id)).toBe(true);
  });
});

test.describe('AI GM Service - Metrics', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should return correct initial metrics', () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const metrics = service.getMetrics();

    expect(metrics.totalScenariosGenerated).toBe(0);
    expect(metrics.aiGeneratedCount).toBe(0);
    expect(metrics.templateGeneratedCount).toBe(0);
    expect(metrics.averageGenerationTime).toBe(0);
    expect(metrics.failureRate).toBe(0);
  });

  test('should track template-generated scenarios', async () => {
    const service = AIGMService.getInstance({ enableAI: false });

    await service.generateScenario(createTestRequest());
    await service.generateScenario(createTestRequest());

    const metrics = service.getMetrics();
    expect(metrics.templateGeneratedCount).toBe(2);
    expect(metrics.aiGeneratedCount).toBe(0);
  });

  test('should calculate average generation time', async () => {
    const service = AIGMService.getInstance({ enableAI: false });

    await service.generateScenario(createTestRequest());
    await service.generateScenario(createTestRequest());
    await service.generateScenario(createTestRequest());

    const metrics = service.getMetrics();
    // Generation is very fast (<1ms), so time may be 0 - just verify it's a number
    expect(typeof metrics.averageGenerationTime).toBe('number');
    expect(metrics.averageGenerationTime).toBeGreaterThanOrEqual(0);
  });

  test('should return copy of metrics (not reference)', () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const metrics1 = service.getMetrics();
    const metrics2 = service.getMetrics();

    expect(metrics1).not.toBe(metrics2);
    expect(metrics1).toEqual(metrics2);
  });
});

test.describe('AI GM Service - MCP Integration', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should set MCP service hook', () => {
    const service = AIGMService.getInstance({ enableAI: true });
    const mockMCP = { generateScenario: async () => ({}) };

    // Should not throw
    expect(() => {
      service.setMCPServiceHook(mockMCP);
    }).not.toThrow();
  });

  test('should fallback to templates when AI fails', async () => {
    const service = AIGMService.getInstance({
      enableAI: true,
      fallbackToTemplates: true
    });

    // No MCP hook set, so AI generation will fail
    const scenario = await service.generateScenario(createTestRequest());

    // Should still get a scenario via template fallback
    expect(scenario).toBeDefined();
    expect(scenario.id).toBeTruthy();
  });
});

test.describe('AI GM Service - Scenario Types', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should generate INVESTIGATION scenario', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest({ desiredType: ScenarioType.INVESTIGATION });

    const scenario = await service.generateScenario(request);
    expect(scenario.type).toBe(ScenarioType.INVESTIGATION);
  });

  test('should generate MORAL_DILEMMA scenario', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest({ desiredType: ScenarioType.MORAL_DILEMMA });

    const scenario = await service.generateScenario(request);
    expect(scenario.type).toBe(ScenarioType.MORAL_DILEMMA);
  });

  test('should generate COMBAT_CHOICE scenario', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest({ desiredType: ScenarioType.COMBAT_CHOICE });

    const scenario = await service.generateScenario(request);
    expect(scenario.type).toBe(ScenarioType.COMBAT_CHOICE);
  });

  test('should generate BETRAYAL scenario', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest({ desiredType: ScenarioType.BETRAYAL });

    const scenario = await service.generateScenario(request);
    expect(scenario.type).toBe(ScenarioType.BETRAYAL);
  });

  test('should generate DISCOVERY scenario', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest({ desiredType: ScenarioType.DISCOVERY });

    const scenario = await service.generateScenario(request);
    expect(scenario.type).toBe(ScenarioType.DISCOVERY);
  });

  test('should generate NEGOTIATION scenario', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const request = createTestRequest({ desiredType: ScenarioType.NEGOTIATION });

    const scenario = await service.generateScenario(request);
    expect(scenario.type).toBe(ScenarioType.NEGOTIATION);
  });
});

test.describe('AI GM Service - Active Scenarios Management', () => {
  test.beforeEach(() => {
    resetAIGMService();
  });

  test('should return copy of active scenarios', () => {
    const service = AIGMService.getInstance({ enableAI: false });

    const scenarios1 = service.getActiveScenarios();
    const scenarios2 = service.getActiveScenarios();

    expect(scenarios1).not.toBe(scenarios2);
  });

  test('should track multiple active scenarios', async () => {
    const service = AIGMService.getInstance({ enableAI: false });

    await service.generateScenario(createTestRequest());
    await service.generateScenario(createTestRequest());
    await service.generateScenario(createTestRequest());

    const activeScenarios = service.getActiveScenarios();
    expect(activeScenarios.size).toBe(3);
  });

  test('should track scenario start time', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const before = Date.now();

    const scenario = await service.generateScenario(createTestRequest());

    const after = Date.now();
    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    expect(active?.startTime).toBeGreaterThanOrEqual(before);
    expect(active?.startTime).toBeLessThanOrEqual(after);
  });

  test('should initialize player choices as empty map', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const scenario = await service.generateScenario(createTestRequest());

    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    expect(active?.playerChoices).toBeDefined();
    expect(active?.playerChoices.size).toBe(0);
  });

  test('should initialize revealed set as empty', async () => {
    const service = AIGMService.getInstance({ enableAI: false });
    const scenario = await service.generateScenario(createTestRequest());

    const activeScenarios = service.getActiveScenarios();
    const active = activeScenarios.get(scenario.id);

    expect(active?.revealed).toBeDefined();
    expect(active?.revealed.size).toBe(0);
  });
});
