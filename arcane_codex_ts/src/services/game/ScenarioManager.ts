/**
 * Scenario Manager
 * Manages scenario loading, choice presentation, and progression
 * Handles both template-based and AI-generated scenarios
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { gameLogger } from '../logger';

/**
 * Scenario definition
 */
export interface Scenario {
  id: string;
  title: string;
  description: string;
  narrative: string;
  choices: ScenarioChoice[];
  type: ScenarioType;
  difficulty: number;
  tags: string[];
  minPlayers?: number;
  maxPlayers?: number;
}

/**
 * Scenario choice
 */
export interface ScenarioChoice {
  id: string;
  text: string;
  description?: string;
  requirements?: ChoiceRequirement[];
  consequences: ScenarioConsequence[];
  nextScenarioId?: string;
}

/**
 * Choice requirement
 */
export interface ChoiceRequirement {
  type: 'skill' | 'item' | 'reputation' | 'player_count';
  value: any;
  description: string;
}

/**
 * Scenario consequence
 */
export interface ScenarioConsequence {
  type: 'immediate' | 'delayed' | 'hidden';
  effect: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
}

/**
 * Scenario type
 */
export enum ScenarioType {
  COMBAT = 'COMBAT',
  SOCIAL = 'SOCIAL',
  EXPLORATION = 'EXPLORATION',
  PUZZLE = 'PUZZLE',
  MORAL_DILEMMA = 'MORAL_DILEMMA',
  INVESTIGATION = 'INVESTIGATION'
}

/**
 * Player choice record
 */
export interface PlayerChoice {
  playerId: string;
  playerName: string;
  choiceId: string;
  timestamp: Date;
}

/**
 * Scenario session
 */
export interface ScenarioSession {
  sessionId: string;
  scenarioId: string;
  scenario: Scenario;
  playerChoices: Map<string, PlayerChoice>;
  startedAt: Date;
  completedAt?: Date;
  outcome?: ScenarioOutcome;
}

/**
 * Scenario outcome
 */
export interface ScenarioOutcome {
  success: boolean;
  consequences: ScenarioConsequence[];
  rewards?: {
    experience: number;
    gold: number;
    items: string[];
    reputation: number;
  };
  narrative: string;
}

/**
 * Scenario Manager Service
 */
export class ScenarioManager {
  private static instance: ScenarioManager;
  private scenarios: Map<string, Scenario> = new Map();
  private activeSessions: Map<string, ScenarioSession> = new Map();
  private scenariosPath: string;

  private constructor() {
    this.scenariosPath = path.join(process.cwd(), 'src', 'data', 'scenarios');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ScenarioManager {
    if (!ScenarioManager.instance) {
      ScenarioManager.instance = new ScenarioManager();
    }
    return ScenarioManager.instance;
  }

  /**
   * Load scenarios from data files
   */
  public async loadScenariosFromFiles(): Promise<number> {
    try {
      // Check if directory exists
      try {
        await fs.access(this.scenariosPath);
      } catch {
        gameLogger.warn({ path: this.scenariosPath }, 'Scenarios directory not found, creating it');
        await fs.mkdir(this.scenariosPath, { recursive: true });
        return 0;
      }

      const files = await fs.readdir(this.scenariosPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      let loadedCount = 0;
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.scenariosPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const scenario: Scenario = JSON.parse(content);

          // Validate scenario
          if (this.validateScenario(scenario)) {
            this.scenarios.set(scenario.id, scenario);
            loadedCount++;
          } else {
            gameLogger.warn({ file }, 'Invalid scenario file, skipping');
          }
        } catch (error: any) {
          gameLogger.error({ error, file }, 'Failed to load scenario file');
        }
      }

      gameLogger.info({ loadedCount, totalFiles: jsonFiles.length }, 'Scenarios loaded from files');
      return loadedCount;
    } catch (error: any) {
      gameLogger.error({ error }, 'Failed to load scenarios from files');
      return 0;
    }
  }

  /**
   * Validate scenario structure
   */
  private validateScenario(scenario: any): boolean {
    return (
      typeof scenario.id === 'string' &&
      typeof scenario.title === 'string' &&
      typeof scenario.narrative === 'string' &&
      Array.isArray(scenario.choices) &&
      scenario.choices.length > 0
    );
  }

  /**
   * Load a specific scenario by ID
   */
  public async loadScenario(scenarioId: string): Promise<Scenario | null> {
    // Check in-memory cache first
    if (this.scenarios.has(scenarioId)) {
      return this.scenarios.get(scenarioId)!;
    }

    // Try loading from file
    try {
      const filePath = path.join(this.scenariosPath, `${scenarioId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const scenario: Scenario = JSON.parse(content);

      if (this.validateScenario(scenario)) {
        this.scenarios.set(scenario.id, scenario);
        return scenario;
      }
    } catch (error: any) {
      gameLogger.warn({ scenarioId, error: error.message }, 'Failed to load scenario from file');
    }

    return null;
  }

  /**
   * Get a random scenario matching criteria
   */
  public getRandomScenario(
    type?: ScenarioType,
    difficulty?: number,
    playerCount?: number
  ): Scenario | null {
    let availableScenarios = Array.from(this.scenarios.values());

    // Filter by type
    if (type) {
      availableScenarios = availableScenarios.filter(s => s.type === type);
    }

    // Filter by difficulty (±1 range)
    if (difficulty !== undefined) {
      availableScenarios = availableScenarios.filter(
        s => s.difficulty >= difficulty - 1 && s.difficulty <= difficulty + 1
      );
    }

    // Filter by player count
    if (playerCount !== undefined) {
      availableScenarios = availableScenarios.filter(
        s =>
          (!s.minPlayers || playerCount >= s.minPlayers) &&
          (!s.maxPlayers || playerCount <= s.maxPlayers)
      );
    }

    if (availableScenarios.length === 0) {
      return null;
    }

    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  }

  /**
   * Start a scenario session
   */
  public async startScenarioSession(
    sessionId: string,
    scenarioId: string
  ): Promise<ScenarioSession> {
    const scenario = await this.loadScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    const scenarioSession: ScenarioSession = {
      sessionId,
      scenarioId,
      scenario,
      playerChoices: new Map(),
      startedAt: new Date()
    };

    this.activeSessions.set(sessionId, scenarioSession);

    gameLogger.info({ sessionId, scenarioId }, 'Scenario session started');
    return scenarioSession;
  }

  /**
   * Present scenario choices to a specific player
   */
  public presentChoices(
    sessionId: string,
    _playerId: string
  ): { scenario: Scenario; availableChoices: ScenarioChoice[] } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Scenario session not found');
    }

    // Filter choices based on requirements
    const availableChoices = session.scenario.choices.filter(choice => {
      if (!choice.requirements) return true;

      // For now, return all choices (requirements checking can be expanded)
      return true;
    });

    return {
      scenario: session.scenario,
      availableChoices
    };
  }

  /**
   * Process a player's choice
   */
  public async processChoice(
    sessionId: string,
    playerId: string,
    playerName: string,
    choiceId: string
  ): Promise<{ choice: ScenarioChoice; consequences: ScenarioConsequence[] }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Scenario session not found');
    }

    // Find the choice
    const choice = session.scenario.choices.find(c => c.id === choiceId);
    if (!choice) {
      throw new Error('Invalid choice ID');
    }

    // Record the choice
    session.playerChoices.set(playerId, {
      playerId,
      playerName,
      choiceId,
      timestamp: new Date()
    });

    gameLogger.info({ sessionId, playerId, choiceId }, 'Player choice processed');

    return {
      choice,
      consequences: choice.consequences
    };
  }

  /**
   * Get the most popular choice among players
   */
  public getMostPopularChoice(sessionId: string): { choiceId: string; count: number } | null {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.playerChoices.size === 0) {
      return null;
    }

    const choiceCounts = new Map<string, number>();

    for (const choice of session.playerChoices.values()) {
      const current = choiceCounts.get(choice.choiceId) || 0;
      choiceCounts.set(choice.choiceId, current + 1);
    }

    let maxCount = 0;
    let mostPopular = '';

    for (const [choiceId, count] of choiceCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostPopular = choiceId;
      }
    }

    return { choiceId: mostPopular, count: maxCount };
  }

  /**
   * Resolve scenario based on player choices
   */
  public async resolveScenario(sessionId: string): Promise<ScenarioOutcome> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Scenario session not found');
    }

    // Get the most popular choice
    const popularChoice = this.getMostPopularChoice(sessionId);
    if (!popularChoice) {
      throw new Error('No choices have been made');
    }

    const choice = session.scenario.choices.find(c => c.id === popularChoice.choiceId);
    if (!choice) {
      throw new Error('Choice not found');
    }

    // Calculate outcome
    const outcome: ScenarioOutcome = {
      success: this.calculateSuccess(choice, session),
      consequences: choice.consequences,
      rewards: this.calculateRewards(choice, session),
      narrative: this.generateOutcomeNarrative(choice, session)
    };

    session.outcome = outcome;
    session.completedAt = new Date();

    gameLogger.info({ sessionId, choiceId: popularChoice.choiceId, success: outcome.success }, 'Scenario resolved');

    return outcome;
  }

  /**
   * Calculate if the choice leads to success
   */
  private calculateSuccess(choice: ScenarioChoice, session: ScenarioSession): boolean {
    // Simple heuristic: critical consequences = failure
    const hasCriticalConsequence = choice.consequences.some(c => c.severity === 'critical');
    if (hasCriticalConsequence) return false;

    // More players agreeing = higher success chance
    const popularChoice = this.getMostPopularChoice(session.sessionId);
    if (!popularChoice) return false;

    const unanimousThreshold = session.playerChoices.size;
    const agreeCount = popularChoice.count;

    return agreeCount / unanimousThreshold >= 0.5; // 50% agreement = success
  }

  /**
   * Calculate rewards based on choice
   */
  private calculateRewards(
    choice: ScenarioChoice,
    session: ScenarioSession
  ): ScenarioOutcome['rewards'] {
    const baseRewards = {
      experience: 50,
      gold: 25,
      items: [] as string[],
      reputation: 5
    };

    // Adjust based on difficulty
    const difficultyMultiplier = 1 + (session.scenario.difficulty / 10);
    baseRewards.experience = Math.floor(baseRewards.experience * difficultyMultiplier);
    baseRewards.gold = Math.floor(baseRewards.gold * difficultyMultiplier);

    // Reduce rewards for severe consequences
    const severityPenalty = choice.consequences.reduce((acc, c) => {
      const penalties = { minor: 0, moderate: 0.1, major: 0.25, critical: 0.5 };
      return acc + penalties[c.severity];
    }, 0);

    baseRewards.experience = Math.floor(baseRewards.experience * (1 - severityPenalty));
    baseRewards.gold = Math.floor(baseRewards.gold * (1 - severityPenalty));

    return baseRewards;
  }

  /**
   * Generate narrative for the outcome
   */
  private generateOutcomeNarrative(choice: ScenarioChoice, session: ScenarioSession): string {
    const playerCount = session.playerChoices.size;
    const popularChoice = this.getMostPopularChoice(session.sessionId);

    let narrative = `The party decided: ${choice.text}\n\n`;

    if (popularChoice && popularChoice.count === playerCount) {
      narrative += 'The decision was unanimous. ';
    } else {
      narrative += 'After some debate, the party chose this path. ';
    }

    // Add consequence descriptions
    const immediateConsequences = choice.consequences.filter(c => c.type === 'immediate');
    if (immediateConsequences.length > 0) {
      narrative += '\n\nImmediate effects:\n';
      for (const consequence of immediateConsequences) {
        narrative += `- ${consequence.description}\n`;
      }
    }

    return narrative;
  }

  /**
   * Get the next scenario based on choice
   */
  public async getNextScenario(
    sessionId: string,
    choiceId: string
  ): Promise<Scenario | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Scenario session not found');
    }

    const choice = session.scenario.choices.find(c => c.id === choiceId);
    if (!choice || !choice.nextScenarioId) {
      return null;
    }

    return await this.loadScenario(choice.nextScenarioId);
  }

  /**
   * Get scenario session
   */
  public getScenarioSession(sessionId: string): ScenarioSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * End scenario session
   */
  public endScenarioSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    gameLogger.info({ sessionId }, 'Scenario session ended');
  }

  /**
   * Get all loaded scenarios
   */
  public getAllScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get scenario count by type
   */
  public getScenarioCountByType(): Map<ScenarioType, number> {
    const counts = new Map<ScenarioType, number>();

    for (const scenario of this.scenarios.values()) {
      const current = counts.get(scenario.type) || 0;
      counts.set(scenario.type, current + 1);
    }

    return counts;
  }

  /**
   * Save a scenario to file
   */
  public async saveScenario(scenario: Scenario): Promise<void> {
    try {
      const filePath = path.join(this.scenariosPath, `${scenario.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(scenario, null, 2), 'utf-8');

      this.scenarios.set(scenario.id, scenario);

      gameLogger.info({ scenarioId: scenario.id }, 'Scenario saved to file');
    } catch (error: any) {
      gameLogger.error({ error, scenarioId: scenario.id }, 'Failed to save scenario');
      throw error;
    }
  }
}

export default ScenarioManager;
