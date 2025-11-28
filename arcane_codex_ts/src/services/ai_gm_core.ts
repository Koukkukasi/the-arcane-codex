/**
 * Core AI Game Master Service
 * Orchestrates dynamic scenario generation, choice validation,
 * consequence resolution, and asymmetric information management.
 */

import {
  ScenarioRequest,
  ScenarioResponse,
  ScenarioType,
  Consequence,
  AsymmetricInfo,
  ActiveScenario,
  AIGMConfig,
  AIGMMetrics,
  ConsequenceType,
  ScenarioChoice,
  HiddenKnowledge,
  Clue,
  StatEffect,
  WorldEffect
} from '../types/ai_gm';
import { ScenarioTemplateService } from './scenario_templates';
import { ConsequenceApplier, ConsequenceApplicationResult } from './consequence_applier';

/**
 * Main AI Game Master service implementing the Singleton pattern
 */
export class AIGMService {
  private static instance: AIGMService;

  /** Active scenarios indexed by ID */
  private activeScenarios: Map<string, ActiveScenario>;

  /** Scenario generation history for continuity */
  private scenarioHistory: Map<string, ScenarioResponse>;

  /** Player-specific knowledge bases */
  private playerKnowledge: Map<string, Map<string, AsymmetricInfo>>;

  /** Template service for fallback generation */
  private templateService: ScenarioTemplateService;

  /** Service configuration */
  private config: AIGMConfig;

  /** Performance metrics */
  private metrics: AIGMMetrics;

  /** Logger instance */
  private logger: Console;

  /** MCP service integration hook */
  private mcpServiceHook?: any;

  /** Consequence applier for game state updates */
  private consequenceApplier: ConsequenceApplier;

  /**
   * Private constructor for Singleton pattern
   */
  private constructor(config?: Partial<AIGMConfig>) {
    this.activeScenarios = new Map();
    this.scenarioHistory = new Map();
    this.playerKnowledge = new Map();
    this.templateService = ScenarioTemplateService.getInstance();
    this.consequenceApplier = ConsequenceApplier.getInstance();
    this.logger = console;

    // Default configuration
    this.config = {
      enableAI: true,
      maxRetries: 3,
      timeout: 30000,
      fallbackToTemplates: true,
      logLevel: 'INFO',
      cacheScenarios: true,
      maxCacheSize: 100,
      ...config
    };

    // Initialize metrics
    this.metrics = {
      totalScenariosGenerated: 0,
      aiGeneratedCount: 0,
      templateGeneratedCount: 0,
      averageGenerationTime: 0,
      failureRate: 0
    };

    this.log('info', 'AI GM Service initialized');
  }

  /**
   * Get singleton instance of AIGMService
   */
  public static getInstance(config?: Partial<AIGMConfig>): AIGMService {
    if (!AIGMService.instance) {
      AIGMService.instance = new AIGMService(config);
    }
    return AIGMService.instance;
  }

  /**
   * Generate a new scenario based on the request
   * @param request - Scenario generation request
   * @returns Promise resolving to the generated scenario
   */
  public async generateScenario(request: ScenarioRequest): Promise<ScenarioResponse> {
    const startTime = Date.now();
    this.log('info', `Generating scenario of type: ${request.desiredType || 'AUTO'}`);

    try {
      let scenario: ScenarioResponse;

      if (this.config.enableAI && this.mcpServiceHook) {
        // Try AI generation first
        scenario = await this.generateWithAI(request);
        this.metrics.aiGeneratedCount++;
      } else {
        // Use template-based generation
        scenario = await this.generateWithTemplate(request);
        this.metrics.templateGeneratedCount++;
      }

      // Post-process the scenario
      scenario = this.postProcessScenario(scenario, request);

      // Store in history and active scenarios
      this.scenarioHistory.set(scenario.id, scenario);
      this.activeScenarios.set(scenario.id, {
        scenario,
        startTime: Date.now(),
        playerChoices: new Map(),
        revealed: new Set(),
        completed: false
      });

      // Clean cache if needed
      if (this.scenarioHistory.size > this.config.maxCacheSize) {
        this.cleanCache();
      }

      // Update metrics
      this.metrics.totalScenariosGenerated++;
      const generationTime = Date.now() - startTime;
      this.updateAverageGenerationTime(generationTime);

      this.log('info', `Scenario ${scenario.id} generated in ${generationTime}ms`);
      return scenario;

    } catch (error) {
      this.log('error', `Scenario generation failed: ${error}`);
      this.metrics.failureRate =
        (this.metrics.failureRate * this.metrics.totalScenariosGenerated + 1) /
        (this.metrics.totalScenariosGenerated + 1);

      if (this.config.fallbackToTemplates) {
        this.log('info', 'Falling back to template generation');
        const scenario = await this.generateWithTemplate(request);
        this.metrics.templateGeneratedCount++;
        return scenario;
      }

      throw error;
    }
  }

  /**
   * Validate if a player can make a specific choice
   * @param scenarioId - ID of the scenario
   * @param choiceId - ID of the choice
   * @param playerId - ID of the player
   * @returns Whether the choice is valid
   */
  public validateChoice(scenarioId: string, choiceId: string, playerId: string): boolean {
    this.log('debug', `Validating choice ${choiceId} for player ${playerId} in scenario ${scenarioId}`);

    const activeScenario = this.activeScenarios.get(scenarioId);
    if (!activeScenario) {
      this.log('warn', `Scenario ${scenarioId} not found`);
      return false;
    }

    if (activeScenario.completed) {
      this.log('warn', `Scenario ${scenarioId} already completed`);
      return false;
    }

    // Check if player already made a choice
    if (activeScenario.playerChoices.has(playerId)) {
      this.log('warn', `Player ${playerId} already made a choice`);
      return false;
    }

    // Find the choice
    const choice = activeScenario.scenario.choices.find(c => c.id === choiceId);
    if (!choice) {
      this.log('warn', `Choice ${choiceId} not found in scenario`);
      return false;
    }

    // Validate visibility
    if (!this.isChoiceVisible(choice, playerId, activeScenario.scenario)) {
      this.log('info', `Choice ${choiceId} not visible to player ${playerId}`);
      return false;
    }

    // Validate requirements
    if (choice.requirements && !this.checkRequirements(choice.requirements, playerId, scenarioId)) {
      this.log('info', `Player ${playerId} doesn't meet requirements for choice ${choiceId}`);
      return false;
    }

    this.log('debug', `Choice ${choiceId} validated for player ${playerId}`);
    return true;
  }

  /**
   * Resolve consequences of a player's choice
   * @param scenarioId - ID of the scenario
   * @param choiceId - ID of the choice made
   * @returns Array of consequences triggered
   */
  public resolveConsequences(scenarioId: string, choiceId: string): Consequence[] {
    this.log('info', `Resolving consequences for choice ${choiceId} in scenario ${scenarioId}`);

    const activeScenario = this.activeScenarios.get(scenarioId);
    if (!activeScenario) {
      this.log('error', `Scenario ${scenarioId} not found`);
      return [];
    }

    const choice = activeScenario.scenario.choices.find(c => c.id === choiceId);
    if (!choice) {
      this.log('error', `Choice ${choiceId} not found`);
      return [];
    }

    const consequences: Consequence[] = [];
    const currentTime = Date.now();

    // Process immediate consequences
    const immediateConsequences = choice.hiddenConsequences.filter(
      c => c.type === ConsequenceType.IMMEDIATE
    );

    for (const consequence of immediateConsequences) {
      if (this.shouldReveal(consequence, activeScenario, currentTime)) {
        consequences.push(consequence);
        activeScenario.revealed.add(consequence.id);
        this.applyConsequence(consequence, scenarioId);
      }
    }

    // Schedule delayed consequences
    const delayedConsequences = choice.hiddenConsequences.filter(
      c => c.type !== ConsequenceType.IMMEDIATE
    );

    for (const consequence of delayedConsequences) {
      this.scheduleConsequence(consequence, scenarioId);
    }

    this.log('info', `Resolved ${consequences.length} immediate consequences`);
    return consequences;
  }

  /**
   * Get asymmetric information for a specific player
   * @param playerId - ID of the player
   * @param scenarioId - ID of the scenario
   * @returns Player-specific information
   */
  public getPlayerKnowledge(playerId: string, scenarioId: string): AsymmetricInfo | null {
    this.log('debug', `Retrieving knowledge for player ${playerId} in scenario ${scenarioId}`);

    const activeScenario = this.activeScenarios.get(scenarioId);
    if (!activeScenario) {
      this.log('warn', `Scenario ${scenarioId} not found`);
      return null;
    }

    // Find player-specific information
    const asymmetricInfo = activeScenario.scenario.asymmetricInfo.find(
      info => info.playerId === playerId
    );

    if (!asymmetricInfo) {
      this.log('debug', `No asymmetric info for player ${playerId}`);
      return null;
    }

    // Filter based on what has been revealed
    const filteredInfo: AsymmetricInfo = {
      ...asymmetricInfo,
      hiddenKnowledge: this.filterRevealedKnowledge(
        asymmetricInfo.hiddenKnowledge,
        activeScenario
      ),
      privateClues: this.filterRevealedClues(
        asymmetricInfo.privateClues,
        activeScenario
      )
    };

    // Store in knowledge base
    if (!this.playerKnowledge.has(playerId)) {
      this.playerKnowledge.set(playerId, new Map());
    }
    this.playerKnowledge.get(playerId)!.set(scenarioId, filteredInfo);

    return filteredInfo;
  }

  /**
   * Mark a scenario as completed
   * @param scenarioId - ID of the scenario
   * @param outcome - Outcome of the scenario
   */
  public completeScenario(scenarioId: string, outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'ABANDONED'): void {
    this.log('info', `Completing scenario ${scenarioId} with outcome: ${outcome}`);

    const activeScenario = this.activeScenarios.get(scenarioId);
    if (!activeScenario) {
      this.log('warn', `Scenario ${scenarioId} not found`);
      return;
    }

    activeScenario.completed = true;
    activeScenario.outcome = outcome;

    // Trigger any end-of-scenario consequences
    this.resolveScenarioEndConsequences(scenarioId, outcome);

    this.log('info', `Scenario ${scenarioId} completed`);
  }

  /**
   * Register a player's choice
   * @param scenarioId - ID of the scenario
   * @param playerId - ID of the player
   * @param choiceId - ID of the choice
   */
  public registerChoice(scenarioId: string, playerId: string, choiceId: string): boolean {
    if (!this.validateChoice(scenarioId, choiceId, playerId)) {
      return false;
    }

    const activeScenario = this.activeScenarios.get(scenarioId);
    if (!activeScenario) {
      return false;
    }

    activeScenario.playerChoices.set(playerId, choiceId);
    this.log('info', `Registered choice ${choiceId} for player ${playerId}`);

    // Check if all players have made choices
    const expectedPlayers = activeScenario.scenario.asymmetricInfo.map(info => info.playerId);
    const allChosen = expectedPlayers.every(pid => activeScenario.playerChoices.has(pid));

    if (allChosen) {
      this.log('info', 'All players have made choices, resolving scenario');
      this.resolveScenario(scenarioId);
    }

    return true;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): AIGMMetrics {
    return { ...this.metrics };
  }

  /**
   * Set MCP service hook for AI generation
   * @param hook - MCP service instance
   */
  public setMCPServiceHook(hook: any): void {
    this.mcpServiceHook = hook;
    this.log('info', 'MCP service hook registered');
  }

  /**
   * Set Socket.IO server for consequence broadcasting
   * @param io - Socket.IO server instance
   */
  public setSocketServer(io: any): void {
    this.consequenceApplier.setSocketServer(io);
    this.log('info', 'Socket.IO server registered with ConsequenceApplier');
  }

  /**
   * Apply consequences for a player's choice in a scenario
   * This is the main integration point between AI GM and game state
   * @param scenarioId - ID of the scenario
   * @param choiceId - ID of the choice made
   * @param playerId - ID of the player making the choice
   * @param partyCode - Party/room code for the game session
   * @returns Result of applying consequences
   */
  public async applyChoiceConsequences(
    scenarioId: string,
    choiceId: string,
    playerId: string,
    partyCode: string
  ): Promise<ConsequenceApplicationResult> {
    const activeScenario = this.activeScenarios.get(scenarioId);
    if (!activeScenario) {
      return {
        success: false,
        appliedConsequences: [],
        playerEffects: new Map(),
        worldEffects: [],
        errors: [`Scenario ${scenarioId} not found`]
      };
    }

    const choice = activeScenario.scenario.choices.find(c => c.id === choiceId);
    if (!choice) {
      return {
        success: false,
        appliedConsequences: [],
        playerEffects: new Map(),
        worldEffects: [],
        errors: [`Choice ${choiceId} not found in scenario`]
      };
    }

    // Get all consequences from the choice
    const consequences = choice.hiddenConsequences;

    this.log('info', `Applying ${consequences.length} consequences for choice ${choiceId}`);

    // Use the ConsequenceApplier to actually modify game state
    const result = await this.consequenceApplier.applyConsequences(
      scenarioId,
      choiceId,
      playerId,
      partyCode,
      consequences
    );

    this.log('info', `Applied ${result.appliedConsequences.length} consequences, ${result.errors.length} errors`);

    return result;
  }

  /**
   * Get the ConsequenceApplier instance for direct access
   */
  public getConsequenceApplier(): ConsequenceApplier {
    return this.consequenceApplier;
  }

  /**
   * Get all active scenarios
   */
  public getActiveScenarios(): Map<string, ActiveScenario> {
    return new Map(this.activeScenarios);
  }

  /**
   * Clear completed scenarios older than specified time
   * @param ageInMs - Age threshold in milliseconds
   */
  public cleanupOldScenarios(ageInMs: number = 3600000): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, scenario] of this.activeScenarios.entries()) {
      if (scenario.completed && (now - scenario.startTime) > ageInMs) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.activeScenarios.delete(id);
    }

    this.log('info', `Cleaned up ${toDelete.length} old scenarios`);
  }

  // Private helper methods

  /**
   * Generate scenario using AI service (MCP/Claude)
   */
  private async generateWithAI(request: ScenarioRequest): Promise<ScenarioResponse> {
    if (!this.mcpServiceHook) {
      throw new Error('MCP service not available');
    }

    // Map AIGMService's ScenarioRequest to MCPService's ScenarioContext
    const mcpContext = this.mapToMCPContext(request);

    try {
      this.log('info', `Generating AI scenario: type=${mcpContext.scenarioType}`);

      // Call MCPService's generateDynamicScenario
      const rawScenario = await this.mcpServiceHook.generateDynamicScenario(mcpContext);

      // Transform the raw response to ScenarioResponse format
      const scenario = this.transformToScenarioResponse(rawScenario, request);

      this.log('info', `AI scenario generated: id=${scenario.id}`);
      return scenario;
    } catch (error) {
      this.log('error', `AI generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Map AIGMService ScenarioRequest to MCPService ScenarioContext
   */
  private mapToMCPContext(request: ScenarioRequest): any {
    // Map ScenarioType enum to MCP's scenarioType string
    const scenarioTypeMap: Record<string, string> = {
      'DIVINE_INTERROGATION': 'divine_interrogation',
      'MORAL_DILEMMA': 'moral_dilemma',
      'INVESTIGATION': 'investigation',
      'BETRAYAL': 'general',
      'DISCOVERY': 'general',
      'COMBAT_CHOICE': 'general',
      'NEGOTIATION': 'general'
    };

    // Extract player names from histories
    const players = request.context.playerHistories.map(h => h.playerName);

    // Extract player choices/context as flat array
    const playerChoices = request.context.playerHistories.map(h => ({
      playerId: h.playerId,
      class: h.characterClass,
      knownSecrets: h.knownSecrets
    }));

    // Build god favor map if available
    const godFavor: Record<string, Record<string, number>> = {};
    for (const player of request.context.playerHistories) {
      godFavor[player.playerId] = {};
      if (player.godFavor) {
        for (const [god, favor] of player.godFavor.entries()) {
          godFavor[player.playerId][god] = favor;
        }
      }
    }

    const desiredType = request.desiredType || ScenarioType.INVESTIGATION;

    return {
      gameCode: `game_${Date.now()}`,
      players,
      theme: request.theme,
      scenarioType: scenarioTypeMap[desiredType] || 'general',
      previousScenarios: request.context.previousScenarioId ? [request.context.previousScenarioId] : [],
      playerChoices,
      godFavor
    };
  }

  /**
   * Transform MCP raw scenario response to ScenarioResponse format
   */
  private transformToScenarioResponse(rawScenario: any, request: ScenarioRequest): ScenarioResponse {
    const scenarioId = this.generateScenarioId();

    // Map raw choices to ScenarioChoice format
    const choices: ScenarioChoice[] = (rawScenario.choices || rawScenario.actions || [])
      .slice(0, 4) // Ensure max 4 choices
      .map((choice: any, index: number) => ({
        id: `${scenarioId}_choice_${index}`,
        text: typeof choice === 'string' ? choice : (choice.action || choice.text || choice.description || 'Unknown choice'),
        hiddenConsequences: this.generateDefaultConsequences(),
        visibility: 'ALL' as const
      }));

    // Ensure at least 2 choices
    while (choices.length < 2) {
      choices.push(this.createDefaultChoice(`action_${choices.length}`));
    }

    // Generate asymmetric info for all players
    const asymmetricInfo: AsymmetricInfo[] = request.context.playerHistories.map(player =>
      this.createDefaultAsymmetricInfo(player.playerId)
    );

    return {
      id: scenarioId,
      type: request.desiredType || ScenarioType.INVESTIGATION,
      title: rawScenario.title || 'An Unexpected Turn',
      narrative: rawScenario.description || rawScenario.narrative || rawScenario.scene || rawScenario.context || '',
      atmosphere: rawScenario.atmosphere || rawScenario.context,
      choices,
      hiddenConsequences: [],
      asymmetricInfo,
      timeLimit: request.timeLimit,
      gmNotes: `AI-generated at ${new Date().toISOString()}`
    };
  }

  /**
   * Generate default consequences for a choice
   */
  private generateDefaultConsequences(): Consequence[] {
    return [{
      id: `consequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: ConsequenceType.IMMEDIATE,
      description: 'The consequences of your choice unfold...',
      revealConditions: [{ type: 'IMMEDIATE' }],
      target: 'PARTY',
      severity: 'MODERATE'
    }];
  }

  /**
   * Generate scenario using templates
   */
  private async generateWithTemplate(request: ScenarioRequest): Promise<ScenarioResponse> {
    return this.templateService.generateFromTemplate(request);
  }

  /**
   * Post-process generated scenario
   */
  private postProcessScenario(scenario: ScenarioResponse, request: ScenarioRequest): ScenarioResponse {
    // Ensure scenario has required fields
    scenario.id = scenario.id || this.generateScenarioId();
    scenario.type = scenario.type || request.desiredType || ScenarioType.INVESTIGATION;

    // Validate choice count (2-4)
    if (scenario.choices.length < 2) {
      this.log('warn', 'Scenario has fewer than 2 choices, adding default');
      scenario.choices.push(this.createDefaultChoice('investigate'));
      scenario.choices.push(this.createDefaultChoice('retreat'));
    } else if (scenario.choices.length > 4) {
      this.log('warn', 'Scenario has more than 4 choices, trimming');
      scenario.choices = scenario.choices.slice(0, 4);
    }

    // Ensure asymmetric info for all players
    const playerIds = request.context.playerHistories.map(h => h.playerId);
    for (const playerId of playerIds) {
      if (!scenario.asymmetricInfo.find(info => info.playerId === playerId)) {
        scenario.asymmetricInfo.push(this.createDefaultAsymmetricInfo(playerId));
      }
    }

    return scenario;
  }

  /**
   * Check if a choice is visible to a player
   */
  private isChoiceVisible(choice: ScenarioChoice, playerId: string, _scenario: ScenarioResponse): boolean {
    if (choice.visibility === 'ALL') {
      return true;
    }

    if (choice.visibility === 'SPECIFIC') {
      return choice.visibleTo?.includes(playerId) || false;
    }

    // CONDITIONAL visibility - check conditions
    // This would require more complex logic based on game state
    return true;
  }

  /**
   * Check if requirements are met
   */
  private checkRequirements(_requirements: any[], _playerId: string, _scenarioId: string): boolean {
    // This would check against player history and current state
    // For now, return true as placeholder
    return true;
  }

  /**
   * Check if a consequence should be revealed
   */
  private shouldReveal(consequence: Consequence, _activeScenario: ActiveScenario, _currentTime: number): boolean {
    for (const condition of consequence.revealConditions) {
      if (condition.type === 'IMMEDIATE') {
        return true;
      }
      if (condition.type === 'NEVER') {
        return false;
      }
      // Additional condition checks would go here
    }
    return false;
  }

  /**
   * Apply a consequence to the game state
   */
  private applyConsequence(consequence: Consequence, _scenarioId: string): void {
    this.log('debug', `Applying consequence ${consequence.id}`);

    // Apply stat effects
    if (consequence.statEffects) {
      for (const effect of consequence.statEffects) {
        this.applyStatEffect(effect, consequence.target, consequence.targetId);
      }
    }

    // Apply world effects
    if (consequence.worldEffects) {
      for (const effect of consequence.worldEffects) {
        this.applyWorldEffect(effect);
      }
    }
  }

  /**
   * Apply a stat effect
   */
  private applyStatEffect(effect: StatEffect, _target: string, _targetId?: string): void {
    // This would integrate with the game state management
    this.log('debug', `Applying stat effect: ${effect.stat} ${effect.modifier}`);
  }

  /**
   * Apply a world effect
   */
  private applyWorldEffect(effect: WorldEffect): void {
    // This would integrate with the world state management
    this.log('debug', `Applying world effect: ${effect.type} on ${effect.target}`);
  }

  /**
   * Schedule a delayed consequence
   */
  private scheduleConsequence(consequence: Consequence, _scenarioId: string): void {
    // This would use a scheduling system for delayed consequences
    this.log('debug', `Scheduled consequence ${consequence.id} for later`);
  }

  /**
   * Filter revealed knowledge
   */
  private filterRevealedKnowledge(knowledge: HiddenKnowledge[], _activeScenario: ActiveScenario): HiddenKnowledge[] {
    // Filter based on reveal conditions and scenario state
    return knowledge;
  }

  /**
   * Filter revealed clues
   */
  private filterRevealedClues(clues: Clue[], _activeScenario: ActiveScenario): Clue[] {
    // Filter based on reveal conditions and scenario state
    return clues;
  }

  /**
   * Resolve end-of-scenario consequences
   */
  private resolveScenarioEndConsequences(_scenarioId: string, _outcome: string): void {
    // Handle any consequences triggered by scenario completion
    this.log('debug', `Resolving end consequences for scenario ${_scenarioId}`);
  }

  /**
   * Resolve a scenario when all players have chosen
   */
  private resolveScenario(scenarioId: string): void {
    const activeScenario = this.activeScenarios.get(scenarioId);
    if (!activeScenario) return;

    // Aggregate all consequences from player choices
    const allConsequences: Consequence[] = [];
    for (const [_playerId, choiceId] of activeScenario.playerChoices) {
      const consequences = this.resolveConsequences(scenarioId, choiceId);
      allConsequences.push(...consequences);
    }

    // Determine outcome based on choices and consequences
    const outcome = this.determineOutcome(activeScenario, allConsequences);
    this.completeScenario(scenarioId, outcome);
  }

  /**
   * Determine scenario outcome
   */
  private determineOutcome(_activeScenario: ActiveScenario, _consequences: Consequence[]): 'SUCCESS' | 'FAILURE' | 'PARTIAL' {
    // Logic to determine outcome based on choices and consequences
    // For now, return SUCCESS as placeholder
    return 'SUCCESS';
  }

  /**
   * Generate unique scenario ID
   */
  private generateScenarioId(): string {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a default choice
   */
  private createDefaultChoice(type: string): ScenarioChoice {
    return {
      id: `choice_${type}_${Date.now()}`,
      text: `Choose to ${type}`,
      hiddenConsequences: [],
      visibility: 'ALL'
    };
  }

  /**
   * Create default asymmetric info for a player
   */
  private createDefaultAsymmetricInfo(playerId: string): AsymmetricInfo {
    return {
      playerId,
      hiddenKnowledge: [],
      privateClues: [],
      availableDeductions: []
    };
  }

  /**
   * Clean cache of old scenarios
   */
  private cleanCache(): void {
    const toDelete = this.scenarioHistory.size - this.config.maxCacheSize;
    if (toDelete <= 0) return;

    const entries = Array.from(this.scenarioHistory.entries());
    for (let i = 0; i < toDelete; i++) {
      this.scenarioHistory.delete(entries[i][0]);
    }

    this.log('debug', `Cleaned ${toDelete} scenarios from cache`);
  }

  /**
   * Update average generation time metric
   */
  private updateAverageGenerationTime(newTime: number): void {
    const total = this.metrics.totalScenariosGenerated;
    this.metrics.averageGenerationTime =
      (this.metrics.averageGenerationTime * (total - 1) + newTime) / total;
  }

  /**
   * Log a message
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = { 'debug': 0, 'info': 1, 'warn': 2, 'error': 3 };
    const configLevel = levels[this.config.logLevel.toLowerCase() as keyof typeof levels] || 1;
    const messageLevel = levels[level];

    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[AIGMService] [${timestamp}] [${level.toUpperCase()}]`;

      switch (level) {
        case 'debug':
          this.logger.debug(`${prefix} ${message}`);
          break;
        case 'info':
          this.logger.info(`${prefix} ${message}`);
          break;
        case 'warn':
          this.logger.warn(`${prefix} ${message}`);
          break;
        case 'error':
          this.logger.error(`${prefix} ${message}`);
          break;
      }
    }
  }
}