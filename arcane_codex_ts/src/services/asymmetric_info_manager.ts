// Asymmetric Information Management Service
// Handles distribution of information, clues, and hidden knowledge among players

import { EventEmitter } from 'events';
import {
  AsymmetricInfo,
  Clue,
  PlayerHistory
} from '../types/world_state';
import { ConsequenceTracker } from './consequence_tracker';

// Interface for scenario response that contains asymmetric information
export interface ScenarioResponse {
  scenarioId: string;
  baseNarrative: string;
  choices: Array<{
    id: string;
    text: string;
    visibility: 'all' | 'conditional' | 'hidden';
    visibilityCondition?: string;
    consequences?: any[];
  }>;
  clues: Clue[];
  hiddenElements: Array<{
    id: string;
    type: 'narrative' | 'choice' | 'character' | 'location';
    content: string;
    revealCondition: string;
  }>;
  playerSpecificInfo?: Map<string, any>;
}

// Event types for the AsymmetricInfoManager
export interface AsymmetricInfoEvents {
  'clueDiscovered': (playerId: string, clue: Clue) => void;
  'clueShared': (fromPlayerId: string, toPlayerId: string, clueId: string) => void;
  'hiddenInfoRevealed': (playerId: string, revealId: string, content: any) => void;
  'deductionMade': (playerId: string, deduction: any) => void;
  'informationDistributed': (scenarioId: string, playerCount: number) => void;
}

export class AsymmetricInfoManager extends EventEmitter {
  private static instance: AsymmetricInfoManager;

  private playerKnowledge: Map<string, Map<string, AsymmetricInfo>>; // playerId -> scenarioId -> info
  private allClues: Map<string, Clue>;
  private playerDeductions: Map<string, Array<any>>;
  private sharedInformation: Map<string, Array<any>>; // Track all shared info
  private consequenceTracker: ConsequenceTracker;

  private constructor() {
    super();
    this.playerKnowledge = new Map();
    this.allClues = new Map();
    this.playerDeductions = new Map();
    this.sharedInformation = new Map();
    this.consequenceTracker = ConsequenceTracker.getInstance();

    console.log('[AsymmetricInfoManager] Initialized');
  }

  public static getInstance(): AsymmetricInfoManager {
    if (!AsymmetricInfoManager.instance) {
      AsymmetricInfoManager.instance = new AsymmetricInfoManager();
    }
    return AsymmetricInfoManager.instance;
  }

  /**
   * Distribute information asymmetrically among players for a scenario
   */
  public distributeInformation(
    scenarioId: string,
    players: string[],
    scenario: ScenarioResponse
  ): void {
    console.log(`[AsymmetricInfoManager] Distributing information for scenario ${scenarioId} to ${players.length} players`);

    // Store all clues from the scenario
    scenario.clues.forEach(clue => {
      this.allClues.set(clue.id, clue);
    });

    // Process each player's view of the scenario
    players.forEach(playerId => {
      const asymmetricInfo = this.createPlayerView(playerId, scenarioId, scenario);

      // Store player's knowledge
      if (!this.playerKnowledge.has(playerId)) {
        this.playerKnowledge.set(playerId, new Map());
      }
      this.playerKnowledge.get(playerId)!.set(scenarioId, asymmetricInfo);

      // Check for automatic clue discoveries based on player history
      this.checkAutomaticClueDiscoveries(playerId, scenario.clues);
    });

    // Distribute unique information to different players
    this.distributeUniqueClues(players, scenario.clues, scenarioId);

    this.emit('informationDistributed', scenarioId, players.length);
  }

  /**
   * Create a player-specific view of the scenario
   */
  private createPlayerView(
    playerId: string,
    scenarioId: string,
    scenario: ScenarioResponse
  ): AsymmetricInfo {
    const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);

    // Determine visible and hidden choices
    const visibleChoices: string[] = [];
    const hiddenChoices: string[] = [];

    scenario.choices.forEach(choice => {
      if (choice.visibility === 'all') {
        visibleChoices.push(choice.id);
      } else if (choice.visibility === 'conditional') {
        if (this.checkVisibilityCondition(choice.visibilityCondition || '', playerId, playerHistory)) {
          visibleChoices.push(choice.id);
        } else {
          hiddenChoices.push(choice.id);
        }
      } else if (choice.visibility === 'hidden') {
        hiddenChoices.push(choice.id);
      }
    });

    // Filter clues available to this player
    const availableClues = scenario.clues.filter(clue =>
      this.isClueAvailable(clue, playerId, playerHistory)
    );

    // Determine potential reveals
    const potentialReveals = scenario.hiddenElements
      .filter(element => !this.isAlreadyRevealed(playerId, element.id))
      .map(element => ({
        revealId: element.id,
        condition: element.revealCondition,
        hint: this.generateHint(element.revealCondition, playerHistory)
      }));

    // Get shared information for this player
    const sharedInfo = this.getSharedInfoForPlayer(playerId, scenarioId);

    // Get player's deductions
    const deductions = this.playerDeductions.get(playerId) || [];

    const asymmetricInfo: AsymmetricInfo = {
      playerId,
      scenarioId,
      visibleChoices,
      hiddenChoices,
      availableClues,
      discoveredClues: playerHistory.discoveredClues,
      potentialReveals,
      sharedInfo,
      deductions
    };

    return asymmetricInfo;
  }

  /**
   * Get player's current knowledge about a scenario
   */
  public getPlayerKnowledge(playerId: string, scenarioId: string): AsymmetricInfo {
    const playerScenarios = this.playerKnowledge.get(playerId);
    if (!playerScenarios) {
      // Return empty knowledge if player hasn't seen this scenario
      return {
        playerId,
        scenarioId,
        visibleChoices: [],
        hiddenChoices: [],
        availableClues: [],
        discoveredClues: [],
        potentialReveals: [],
        sharedInfo: [],
        deductions: []
      };
    }

    return playerScenarios.get(scenarioId) || this.createEmptyKnowledge(playerId, scenarioId);
  }

  /**
   * Share a clue from one player to another
   */
  public shareClue(fromPlayerId: string, toPlayerId: string, clueId: string): boolean {
    console.log(`[AsymmetricInfoManager] Player ${fromPlayerId} sharing clue ${clueId} with ${toPlayerId}`);

    const clue = this.allClues.get(clueId);
    if (!clue) {
      console.error(`[AsymmetricInfoManager] Clue ${clueId} not found`);
      return false;
    }

    // Check if clue is shareable
    if (clue.shareability === 'private') {
      console.log(`[AsymmetricInfoManager] Clue ${clueId} is private and cannot be shared`);
      return false;
    }

    // Check if the sharing player has the clue
    const fromPlayerHistory = this.consequenceTracker.getPlayerHistory(fromPlayerId);
    if (!fromPlayerHistory.discoveredClues.includes(clueId)) {
      console.log(`[AsymmetricInfoManager] Player ${fromPlayerId} doesn't have clue ${clueId}`);
      return false;
    }

    // Add to recipient's discovered clues
    const toPlayerHistory = this.consequenceTracker.getPlayerHistory(toPlayerId);
    if (!toPlayerHistory.discoveredClues.includes(clueId)) {
      toPlayerHistory.discoveredClues.push(clueId);
    }

    // Track in shared clues
    if (!fromPlayerHistory.sharedClues.includes(clueId)) {
      fromPlayerHistory.sharedClues.push(clueId);
    }

    // Update shared information tracking
    if (!this.sharedInformation.has(toPlayerId)) {
      this.sharedInformation.set(toPlayerId, []);
    }

    this.sharedInformation.get(toPlayerId)!.push({
      fromPlayerId,
      clueId,
      sharedAt: Date.now(),
      clue: clue
    });

    // Update asymmetric info for all scenarios where this player has knowledge
    const toPlayerScenarios = this.playerKnowledge.get(toPlayerId);
    if (toPlayerScenarios) {
      toPlayerScenarios.forEach((info, scenarioId) => {
        if (clue.scenarioId === scenarioId || clue.scenarioId === '*') {
          info.sharedInfo.push({
            fromPlayerId,
            clueId,
            sharedAt: Date.now()
          });
        }
      });
    }

    this.emit('clueShared', fromPlayerId, toPlayerId, clueId);

    // Check if sharing this clue triggers any reveals
    this.checkTriggeredReveals(toPlayerId, clueId);

    return true;
  }

  /**
   * Reveal hidden information when conditions are met
   */
  public revealHiddenInfo(playerId: string, conditionMet: string): void {
    console.log(`[AsymmetricInfoManager] Checking reveals for player ${playerId} with condition: ${conditionMet}`);

    const playerScenarios = this.playerKnowledge.get(playerId);
    if (!playerScenarios) return;

    playerScenarios.forEach((info, _scenarioId) => {
      const revealsToProcess = info.potentialReveals.filter(reveal =>
        this.evaluateCondition(reveal.condition, conditionMet, playerId)
      );

      revealsToProcess.forEach(reveal => {
        // Remove from potential reveals
        const index = info.potentialReveals.findIndex(r => r.revealId === reveal.revealId);
        if (index > -1) {
          info.potentialReveals.splice(index, 1);
        }

        // Add to player's unlocked content
        const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
        if (!playerHistory.unlockedContent.includes(reveal.revealId)) {
          playerHistory.unlockedContent.push(reveal.revealId);
        }

        console.log(`[AsymmetricInfoManager] Revealed ${reveal.revealId} to player ${playerId}`);
        this.emit('hiddenInfoRevealed', playerId, reveal.revealId, reveal);

        // Check for cascade reveals
        this.checkCascadeReveals(playerId, reveal.revealId);
      });
    });
  }

  /**
   * Distribute unique clues to different players
   */
  private distributeUniqueClues(players: string[], clues: Clue[], _scenarioId: string): void {
    // Separate clues by shareability
    const privateClues = clues.filter(c => c.shareability === 'private');
    const shareableClues = clues.filter(c => c.shareability === 'shareable');
    const publicClues = clues.filter(c => c.shareability === 'public');

    // Give public clues to all players
    players.forEach(playerId => {
      const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
      publicClues.forEach(clue => {
        if (!playerHistory.discoveredClues.includes(clue.id)) {
          playerHistory.discoveredClues.push(clue.id);
          this.emit('clueDiscovered', playerId, clue);
        }
      });
    });

    // Distribute private clues randomly (one per player if possible)
    const shuffledPrivate = this.shuffleArray([...privateClues]);
    players.forEach((playerId, index) => {
      if (index < shuffledPrivate.length) {
        const clue = shuffledPrivate[index];
        const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
        if (!playerHistory.discoveredClues.includes(clue.id)) {
          playerHistory.discoveredClues.push(clue.id);
          this.emit('clueDiscovered', playerId, clue);
        }
      }
    });

    // Distribute shareable clues based on player characteristics
    shareableClues.forEach(clue => {
      const eligiblePlayers = players.filter(playerId =>
        this.isPlayerEligibleForClue(playerId, clue)
      );

      if (eligiblePlayers.length > 0) {
        // Give to 1-3 random eligible players
        const numRecipients = Math.min(eligiblePlayers.length, Math.floor(Math.random() * 3) + 1);
        const recipients = this.shuffleArray(eligiblePlayers).slice(0, numRecipients);

        recipients.forEach(playerId => {
          const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
          if (!playerHistory.discoveredClues.includes(clue.id)) {
            playerHistory.discoveredClues.push(clue.id);
            this.emit('clueDiscovered', playerId, clue);
          }
        });
      }
    });
  }

  /**
   * Check if a player is eligible for a specific clue
   */
  private isPlayerEligibleForClue(playerId: string, clue: Clue): boolean {
    const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);

    // Check discovery condition if present
    if (clue.discoveryCondition) {
      return this.checkDiscoveryCondition(clue.discoveryCondition, playerHistory);
    }

    // Check based on clue category and player characteristics
    switch (clue.category) {
      case 'magical':
        // Players with high faction reputation with magical gods more likely
        const magicalRep = (playerHistory.factionReputation.get('MORVANE' as any) || 0) +
                          (playerHistory.factionReputation.get('SYLARA' as any) || 0);
        return magicalRep > 10 || Math.random() < 0.3;

      case 'physical':
        // Players with warrior/ranger classes more likely (if we had class info)
        return Math.random() < 0.5;

      case 'testimony':
        // Players with high diplomatic reputation more likely
        const diplomaticRep = playerHistory.factionReputation.get('MERCUS' as any) || 0;
        return diplomaticRep > 5 || Math.random() < 0.4;

      case 'document':
        // Players with knowledge-seeking behavior more likely
        return playerHistory.discoveredClues.length > 5 || Math.random() < 0.35;

      case 'observation':
        // All players have equal chance
        return Math.random() < 0.5;

      default:
        return Math.random() < 0.4;
    }
  }

  /**
   * Check automatic clue discoveries based on player history
   */
  private checkAutomaticClueDiscoveries(playerId: string, clues: Clue[]): void {
    const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);

    clues.forEach(clue => {
      // Skip if already discovered
      if (playerHistory.discoveredClues.includes(clue.id)) return;

      // Check if player meets automatic discovery conditions
      if (this.meetsAutomaticDiscovery(playerHistory, clue)) {
        playerHistory.discoveredClues.push(clue.id);
        this.emit('clueDiscovered', playerId, clue);
        console.log(`[AsymmetricInfoManager] Player ${playerId} automatically discovered clue ${clue.id}`);
      }
    });
  }

  /**
   * Check if player meets automatic discovery conditions for a clue
   */
  private meetsAutomaticDiscovery(playerHistory: PlayerHistory, clue: Clue): boolean {
    // Check if player has related clues
    if (clue.relatedClues && clue.relatedClues.length > 0) {
      const hasRelated = clue.relatedClues.some(relatedId =>
        playerHistory.discoveredClues.includes(relatedId)
      );
      if (hasRelated && Math.random() < 0.7) return true;
    }

    // Check based on player's unlocked content
    if (clue.metadata?.requiredUnlock) {
      return playerHistory.unlockedContent.includes(clue.metadata.requiredUnlock);
    }

    // Check based on number of choices made
    if (playerHistory.totalChoicesMade > 10 && clue.reliability < 0.5) {
      // Experienced players more likely to find unreliable clues
      return Math.random() < 0.3;
    }

    return false;
  }

  /**
   * Check if a clue is available to a player
   */
  private isClueAvailable(clue: Clue, _playerId: string, playerHistory: PlayerHistory): boolean {
    // Check if already discovered
    if (playerHistory.discoveredClues.includes(clue.id)) return true;

    // Check discovery condition
    if (clue.discoveryCondition) {
      return this.checkDiscoveryCondition(clue.discoveryCondition, playerHistory);
    }

    // Check shareability
    if (clue.shareability === 'public') return true;

    return false;
  }

  /**
   * Check visibility condition for choices
   */
  private checkVisibilityCondition(
    condition: string,
    _playerId: string,
    playerHistory: PlayerHistory
  ): boolean {
    // Parse various condition types
    if (condition.includes('has_clue_')) {
      const clueId = condition.replace('has_clue_', '');
      return playerHistory.discoveredClues.includes(clueId);
    }

    if (condition.includes('reputation_')) {
      const match = condition.match(/reputation_(\w+)_gt_(\d+)/);
      if (match) {
        const faction = match[1];
        const threshold = parseInt(match[2]);
        const reputation = playerHistory.factionReputation.get(faction as any) || 0;
        return reputation > threshold;
      }
    }

    if (condition.includes('unlocked_')) {
      const contentId = condition.replace('unlocked_', '');
      return playerHistory.unlockedContent.includes(contentId);
    }

    // Default to visible if condition not recognized
    return true;
  }

  /**
   * Check discovery condition for clues
   */
  private checkDiscoveryCondition(condition: string, playerHistory: PlayerHistory): boolean {
    // Similar to visibility condition but for clue discovery
    if (condition.includes('min_choices_')) {
      const minChoices = parseInt(condition.replace('min_choices_', ''));
      return playerHistory.totalChoicesMade >= minChoices;
    }

    if (condition.includes('has_any_clue')) {
      return playerHistory.discoveredClues.length > 0;
    }

    if (condition.includes('faction_enemy_')) {
      const faction = condition.replace('faction_enemy_', '');
      const reputation = playerHistory.factionReputation.get(faction as any) || 0;
      return reputation < -20;
    }

    return false;
  }

  /**
   * Generate hint for potential reveals
   */
  private generateHint(condition: string, playerHistory: PlayerHistory): string | undefined {
    if (condition.includes('reputation_')) {
      const match = condition.match(/reputation_(\w+)_gt_(\d+)/);
      if (match) {
        const faction = match[1];
        const threshold = parseInt(match[2]);
        const current = playerHistory.factionReputation.get(faction as any) || 0;
        const needed = threshold - current;
        if (needed > 0) {
          return `Gain ${needed} more reputation with ${faction}`;
        }
      }
    }

    if (condition.includes('has_clue_')) {
      return 'Find the right clue to unlock this information';
    }

    if (condition.includes('min_choices_')) {
      const minChoices = parseInt(condition.replace('min_choices_', ''));
      const needed = minChoices - playerHistory.totalChoicesMade;
      if (needed > 0) {
        return `Make ${needed} more choices to unlock`;
      }
    }

    return undefined;
  }

  /**
   * Check if information is already revealed to player
   */
  private isAlreadyRevealed(playerId: string, revealId: string): boolean {
    const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
    return playerHistory.unlockedContent.includes(revealId);
  }

  /**
   * Get shared information for a player in a scenario
   */
  private getSharedInfoForPlayer(playerId: string, scenarioId: string): Array<any> {
    const shared = this.sharedInformation.get(playerId) || [];
    return shared.filter((info: any) => {
      const clue = this.allClues.get(info.clueId);
      return clue && (clue.scenarioId === scenarioId || clue.scenarioId === '*');
    });
  }

  /**
   * Evaluate if a condition matches
   */
  private evaluateCondition(
    revealCondition: string,
    metCondition: string,
    playerId: string
  ): boolean {
    // Direct match
    if (revealCondition === metCondition) return true;

    // Check if it's a clue-based condition
    if (revealCondition.includes('has_clue_') && metCondition.startsWith('clue_')) {
      const requiredClue = revealCondition.replace('has_clue_', '');
      const providedClue = metCondition.replace('clue_', '');
      return requiredClue === providedClue;
    }

    // Check player history for complex conditions
    const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
    return this.checkVisibilityCondition(revealCondition, playerId, playerHistory);
  }

  /**
   * Check for cascade reveals (reveals that trigger other reveals)
   */
  private checkCascadeReveals(playerId: string, revealId: string): void {
    const cascadeCondition = `unlocked_${revealId}`;
    this.revealHiddenInfo(playerId, cascadeCondition);
  }

  /**
   * Check if sharing a clue triggers any reveals
   */
  private checkTriggeredReveals(playerId: string, clueId: string): void {
    const clueCondition = `has_clue_${clueId}`;
    this.revealHiddenInfo(playerId, clueCondition);
  }

  /**
   * Create empty knowledge structure for a player
   */
  private createEmptyKnowledge(playerId: string, scenarioId: string): AsymmetricInfo {
    return {
      playerId,
      scenarioId,
      visibleChoices: [],
      hiddenChoices: [],
      availableClues: [],
      discoveredClues: [],
      potentialReveals: [],
      sharedInfo: [],
      deductions: []
    };
  }

  /**
   * Add a player deduction
   */
  public addPlayerDeduction(
    playerId: string,
    hypothesis: string,
    confidence: number,
    supportingClues: string[]
  ): void {
    if (!this.playerDeductions.has(playerId)) {
      this.playerDeductions.set(playerId, []);
    }

    const deduction = {
      id: `deduction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hypothesis,
      confidence: Math.max(0, Math.min(1, confidence)),
      supportingClues,
      timestamp: Date.now()
    };

    this.playerDeductions.get(playerId)!.push(deduction);

    // Update all scenarios for this player
    const playerScenarios = this.playerKnowledge.get(playerId);
    if (playerScenarios) {
      playerScenarios.forEach(info => {
        info.deductions.push(deduction);
      });
    }

    this.emit('deductionMade', playerId, deduction);
    console.log(`[AsymmetricInfoManager] Player ${playerId} made deduction: ${hypothesis}`);
  }

  /**
   * Get all clues discovered by a player
   */
  public getPlayerClues(playerId: string): Clue[] {
    const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
    return playerHistory.discoveredClues
      .map(clueId => this.allClues.get(clueId))
      .filter(clue => clue !== undefined) as Clue[];
  }

  /**
   * Check if players can collaborate (have shared clues)
   */
  public canPlayersCollaborate(player1: string, player2: string): boolean {
    const p1History = this.consequenceTracker.getPlayerHistory(player1);
    const p2History = this.consequenceTracker.getPlayerHistory(player2);

    // Check if they have any shareable clues in common
    const p1ShareableClues = p1History.discoveredClues.filter(clueId => {
      const clue = this.allClues.get(clueId);
      return clue && clue.shareability === 'shareable';
    });

    const p2ShareableClues = p2History.discoveredClues.filter(clueId => {
      const clue = this.allClues.get(clueId);
      return clue && clue.shareability === 'shareable';
    });

    return p1ShareableClues.length > 0 || p2ShareableClues.length > 0;
  }

  /**
   * Get collaboration opportunities between players
   */
  public getCollaborationOpportunities(players: string[]): Array<{
    player1: string;
    player2: string;
    potentialClues: string[];
    synergy: number;
  }> {
    const opportunities: Array<any> = [];

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const p1 = players[i];
        const p2 = players[j];

        const p1History = this.consequenceTracker.getPlayerHistory(p1);
        const p2History = this.consequenceTracker.getPlayerHistory(p2);

        // Find clues that one has but the other doesn't
        const p1UniqueClues = p1History.discoveredClues.filter(clueId => {
          const clue = this.allClues.get(clueId);
          return clue &&
                 clue.shareability === 'shareable' &&
                 !p2History.discoveredClues.includes(clueId);
        });

        const p2UniqueClues = p2History.discoveredClues.filter(clueId => {
          const clue = this.allClues.get(clueId);
          return clue &&
                 clue.shareability === 'shareable' &&
                 !p1History.discoveredClues.includes(clueId);
        });

        if (p1UniqueClues.length > 0 || p2UniqueClues.length > 0) {
          const potentialClues = [...p1UniqueClues, ...p2UniqueClues];

          // Calculate synergy based on related clues
          let synergy = 0;
          potentialClues.forEach(clueId => {
            const clue = this.allClues.get(clueId);
            if (clue && clue.relatedClues) {
              const hasRelated = clue.relatedClues.some(relatedId =>
                p1History.discoveredClues.includes(relatedId) ||
                p2History.discoveredClues.includes(relatedId)
              );
              if (hasRelated) synergy += 0.2;
            }
          });

          opportunities.push({
            player1: p1,
            player2: p2,
            potentialClues,
            synergy: Math.min(1, synergy)
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.synergy - a.synergy);
  }

  /**
   * Utility function to shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Export player knowledge for debugging
   */
  public exportPlayerKnowledge(playerId: string): string {
    const knowledge = this.playerKnowledge.get(playerId);
    const clues = this.getPlayerClues(playerId);
    const deductions = this.playerDeductions.get(playerId) || [];

    const exportData = {
      playerId,
      scenarioKnowledge: knowledge ? Array.from(knowledge.entries()) : [],
      discoveredClues: clues,
      deductions,
      sharedInfo: this.sharedInformation.get(playerId) || [],
      timestamp: Date.now()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Get statistics about information distribution
   */
  public getDistributionStats(): {
    totalClues: number;
    totalPlayers: number;
    averageCluesPerPlayer: number;
    mostInformedPlayer: string | null;
    leastInformedPlayer: string | null;
    totalShares: number;
    collaborationPairs: number;
  } {
    let totalShares = 0;
    let mostClues = 0;
    let leastClues = Infinity;
    let mostInformed: string | null = null;
    let leastInformed: string | null = null;

    const players = Array.from(this.playerKnowledge.keys());

    players.forEach(playerId => {
      const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
      const clueCount = playerHistory.discoveredClues.length;

      if (clueCount > mostClues) {
        mostClues = clueCount;
        mostInformed = playerId;
      }

      if (clueCount < leastClues) {
        leastClues = clueCount;
        leastInformed = playerId;
      }

      totalShares += playerHistory.sharedClues.length;
    });

    const avgClues = players.length > 0
      ? players.reduce((sum, pid) => {
          const history = this.consequenceTracker.getPlayerHistory(pid);
          return sum + history.discoveredClues.length;
        }, 0) / players.length
      : 0;

    const collaborationOpportunities = this.getCollaborationOpportunities(players);

    return {
      totalClues: this.allClues.size,
      totalPlayers: players.length,
      averageCluesPerPlayer: avgClues,
      mostInformedPlayer: mostInformed,
      leastInformedPlayer: leastInformed,
      totalShares,
      collaborationPairs: collaborationOpportunities.filter(o => o.synergy > 0.3).length
    };
  }
}