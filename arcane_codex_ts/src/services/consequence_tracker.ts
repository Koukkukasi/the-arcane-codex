// Consequence Tracking and World State Management Service
// Singleton pattern for persistent world state across sessions

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { consequenceLogger } from './logger';
import {
  Consequence,
  ConsequenceDuration,
  WorldState,
  WorldStateChange,
  PlayerHistory,
  PlayerChoice,
  Faction,
  FactionRelation,
  RegionStatus,
  ReputationConsequence,
  WorldEventConsequence,
  CharacterEffectConsequence,
  FactionRelationConsequence,
  HiddenRevealConsequence,
  isReputationConsequence,
  isWorldEventConsequence,
  isFactionRelationConsequence,
  isHiddenRevealConsequence,
  isCharacterEffectConsequence
} from '../types/world_state';

export interface ConsequenceTrackerEvents {
  'consequenceApplied': (consequence: Consequence) => void;
  'consequenceResolved': (consequenceId: string) => void;
  'consequenceExpired': (consequenceId: string) => void;
  'worldStateChanged': (change: WorldStateChange) => void;
  'playerChoiceRecorded': (playerId: string, choice: PlayerChoice) => void;
  'factionReputationChanged': (playerId: string, faction: Faction, change: number) => void;
}

export class ConsequenceTracker extends EventEmitter {
  private static instance: ConsequenceTracker;

  private worldState: WorldState;
  private playerHistories: Map<string, PlayerHistory>;
  private consequences: Map<string, Consequence>;
  private worldStateChanges: WorldStateChange[];
  private saveTimer: NodeJS.Timeout | null = null;
  private readonly SAVE_DELAY = 30000; // Auto-save every 30 seconds
  private readonly DATA_DIR = path.join(process.cwd(), 'data', 'world_state');

  private constructor() {
    super();
    this.playerHistories = new Map();
    this.consequences = new Map();
    this.worldStateChanges = [];
    this.worldState = this.initializeWorldState();

    // Load persisted state if exists
    this.loadState();

    // Set up auto-save
    this.setupAutoSave();

    // Set up consequence expiration checker
    this.setupExpirationChecker();

    consequenceLogger.info({ worldStateId: this.worldState.id }, 'ConsequenceTracker initialized');
  }

  public static getInstance(): ConsequenceTracker {
    if (!ConsequenceTracker.instance) {
      ConsequenceTracker.instance = new ConsequenceTracker();
    }
    return ConsequenceTracker.instance;
  }

  // Initialize a fresh world state
  private initializeWorldState(): WorldState {
    const state: WorldState = {
      id: `world_${Date.now()}`,
      serverTimestamp: Date.now(),
      scenarioCount: 0,
      factionRelations: new Map(),
      factionPower: new Map(),
      factionLeaders: new Map(),
      regions: new Map(),
      activeWorldEvents: [],
      completedWorldEvents: [],
      globalFlags: new Map(),
      globalVariables: new Map(),
      mainQuestProgress: 0,
      sideQuestsActive: [],
      sideQuestsCompleted: [],
      totalPlayerChoices: 0,
      mostInfluentialPlayers: [],
      lastMajorEvent: '',
      lastMajorEventTimestamp: 0
    };

    // Initialize faction powers and default relations
    const factions = Object.values(Faction);
    factions.forEach(faction => {
      if (faction !== Faction.NEUTRAL) {
        state.factionPower.set(faction as Faction, 50); // Start at neutral power
      }
    });

    // Initialize faction relations (all start neutral)
    for (let i = 0; i < factions.length - 1; i++) {
      for (let j = i + 1; j < factions.length; j++) {
        if (factions[i] !== Faction.NEUTRAL && factions[j] !== Faction.NEUTRAL) {
          const relation: FactionRelation = {
            faction1: factions[i] as Faction,
            faction2: factions[j] as Faction,
            relationValue: 0,
            status: 'neutral',
            lastChangeTimestamp: Date.now(),
            history: []
          };
          const key = `${factions[i]}-${factions[j]}`;
          state.factionRelations.set(key, relation);
        }
      }
    }

    return state;
  }

  // Record a player's choice and its consequences
  public recordChoice(
    playerId: string,
    scenarioId: string,
    choiceId: string,
    consequences: Consequence[]
  ): void {
    consequenceLogger.info({ playerId, choiceId }, 'Recording choice');

    // Get or create player history
    let playerHistory = this.playerHistories.get(playerId);
    if (!playerHistory) {
      playerHistory = this.initializePlayerHistory(playerId);
      this.playerHistories.set(playerId, playerHistory);
    }

    // Create player choice record
    const playerChoice: PlayerChoice = {
      scenarioId,
      choiceId,
      timestamp: Date.now(),
      consequences: consequences.map(c => c.id),
      immediateEffects: {}
    };

    // Process each consequence
    consequences.forEach(consequence => {
      this.consequences.set(consequence.id, consequence);
      playerHistory!.activeConsequences.push(consequence.id);

      // Apply consequence effects
      this.applyConsequence(consequence, playerId);

      // Calculate expiration if not permanent
      if (consequence.duration !== ConsequenceDuration.PERMANENT) {
        consequence.expiresAt = this.calculateExpiration(consequence.duration);
      }

      this.emit('consequenceApplied', consequence);
    });

    // Update player history
    playerHistory.choices.push(playerChoice);
    playerHistory.totalChoicesMade++;
    playerHistory.lastActiveTimestamp = Date.now();

    // Update world state
    this.worldState.totalPlayerChoices++;
    this.worldState.scenarioCount++;

    // Update most influential players
    this.updateInfluentialPlayers();

    this.emit('playerChoiceRecorded', playerId, playerChoice);
    this.scheduleSave();
  }

  // Apply a specific consequence to the world state
  private applyConsequence(consequence: Consequence, playerId: string): void {
    const changeId = `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (isReputationConsequence(consequence)) {
      this.applyReputationConsequence(consequence as ReputationConsequence, playerId, changeId);
    } else if (isWorldEventConsequence(consequence)) {
      this.applyWorldEventConsequence(consequence as WorldEventConsequence, changeId, playerId);
    } else if (isFactionRelationConsequence(consequence)) {
      this.applyFactionRelationConsequence(consequence as FactionRelationConsequence, changeId, playerId);
    } else if (isHiddenRevealConsequence(consequence)) {
      this.applyHiddenRevealConsequence(consequence as HiddenRevealConsequence, playerId);
    } else if (isCharacterEffectConsequence(consequence)) {
      this.applyCharacterEffectConsequence(consequence as CharacterEffectConsequence, playerId);
    }
  }

  // Apply reputation consequence
  private applyReputationConsequence(
    consequence: ReputationConsequence,
    playerId: string,
    changeId: string
  ): void {
    const playerHistory = this.playerHistories.get(playerId)!;
    const currentRep = playerHistory.factionReputation.get(consequence.faction) || 0;
    const newRep = currentRep + consequence.change;

    playerHistory.factionReputation.set(consequence.faction, newRep);

    // Update faction power based on player influence
    const currentPower = this.worldState.factionPower.get(consequence.faction) || 50;
    const powerChange = consequence.change * 0.1; // Small influence on global power
    this.worldState.factionPower.set(consequence.faction, currentPower + powerChange);

    // Record world state change
    const change: WorldStateChange = {
      id: changeId,
      timestamp: Date.now(),
      playerId,
      changeType: 'faction_reputation',
      previousValue: currentRep,
      newValue: newRep,
      description: `${consequence.faction} reputation changed by ${consequence.change}: ${consequence.reason}`,
      scenarioId: consequence.scenarioId,
      consequenceId: consequence.id
    };

    this.worldStateChanges.push(change);
    this.emit('worldStateChanged', change);
    this.emit('factionReputationChanged', playerId, consequence.faction, consequence.change);
  }

  // Apply world event consequence
  private applyWorldEventConsequence(
    consequence: WorldEventConsequence,
    changeId: string,
    playerId: string
  ): void {
    this.worldState.activeWorldEvents.push(consequence);

    // Update affected regions
    consequence.affectedRegions.forEach(regionId => {
      const region = this.worldState.regions.get(regionId);
      if (region) {
        region.activeEvents.push(consequence.eventId);
      }
    });

    // Check if this is a major event
    if (consequence.severity === 'major' || consequence.severity === 'critical') {
      this.worldState.lastMajorEvent = consequence.eventName;
      this.worldState.lastMajorEventTimestamp = Date.now();
    }

    const change: WorldStateChange = {
      id: changeId,
      timestamp: Date.now(),
      playerId,
      changeType: 'world_event',
      previousValue: null,
      newValue: consequence.eventName,
      description: `World event triggered: ${consequence.eventName}`,
      scenarioId: consequence.scenarioId,
      consequenceId: consequence.id
    };

    this.worldStateChanges.push(change);
    this.emit('worldStateChanged', change);
  }

  // Apply faction relation consequence
  private applyFactionRelationConsequence(
    consequence: FactionRelationConsequence,
    changeId: string,
    playerId: string
  ): void {
    const key = this.getFactionRelationKey(consequence.faction1, consequence.faction2);
    let relation = this.worldState.factionRelations.get(key);

    if (relation) {
      const previousValue = relation.relationValue;
      relation.relationValue += consequence.relationChange;
      relation.relationValue = Math.max(-100, Math.min(100, relation.relationValue));
      relation.status = consequence.newRelationStatus;
      relation.lastChangeTimestamp = Date.now();
      relation.history.push({
        timestamp: Date.now(),
        change: consequence.relationChange,
        reason: consequence.description
      });

      const change: WorldStateChange = {
        id: changeId,
        timestamp: Date.now(),
        playerId,
        changeType: 'faction_relation',
        previousValue: previousValue,
        newValue: relation.relationValue,
        description: `${consequence.faction1}-${consequence.faction2} relation changed to ${consequence.newRelationStatus}`,
        scenarioId: consequence.scenarioId,
        consequenceId: consequence.id
      };

      this.worldStateChanges.push(change);
      this.emit('worldStateChanged', change);
    }
  }

  // Apply hidden reveal consequence
  private applyHiddenRevealConsequence(
    consequence: HiddenRevealConsequence,
    playerId: string
  ): void {
    const playerHistory = this.playerHistories.get(playerId)!;
    if (!consequence.revealed && this.checkRevealCondition(consequence.condition, playerId)) {
      consequence.revealed = true;
      playerHistory.unlockedContent.push(consequence.revealId);
      consequenceLogger.info({ playerId, revealId: consequence.revealId }, 'Hidden content revealed');
    }
  }

  // Apply character effect consequence
  private applyCharacterEffectConsequence(
    consequence: CharacterEffectConsequence,
    playerId: string
  ): void {
    const targetId = consequence.targetPlayerId || playerId;
    const playerHistory = this.playerHistories.get(targetId);

    if (playerHistory && consequence.effectType === 'unlock') {
      playerHistory.unlockedContent.push(consequence.effectName);
      consequenceLogger.info({ playerId: targetId, effectName: consequence.effectName }, 'Content unlocked');
    }
  }

  // Get active consequences for a player
  public getActiveConsequences(playerId: string): Consequence[] {
    const playerHistory = this.playerHistories.get(playerId);
    if (!playerHistory) return [];

    return playerHistory.activeConsequences
      .map(id => this.consequences.get(id))
      .filter(c => c && !c.resolved) as Consequence[];
  }

  // Resolve a specific consequence
  public resolveConsequence(consequenceId: string): void {
    const consequence = this.consequences.get(consequenceId);
    if (consequence && !consequence.resolved) {
      consequence.resolved = true;

      // Remove from active consequences for all players
      this.playerHistories.forEach(history => {
        const index = history.activeConsequences.indexOf(consequenceId);
        if (index > -1) {
          history.activeConsequences.splice(index, 1);
          history.resolvedConsequences.push(consequenceId);
        }
      });

      // Remove from active world events if applicable
      if (isWorldEventConsequence(consequence)) {
        const eventIndex = this.worldState.activeWorldEvents
          .findIndex(e => e.id === consequenceId);
        if (eventIndex > -1) {
          const event = this.worldState.activeWorldEvents.splice(eventIndex, 1)[0];
          this.worldState.completedWorldEvents.push(event.eventId);
        }
      }

      this.emit('consequenceResolved', consequenceId);
      this.scheduleSave();
    }
  }

  // Get player history
  public getPlayerHistory(playerId: string): PlayerHistory {
    let history = this.playerHistories.get(playerId);
    if (!history) {
      history = this.initializePlayerHistory(playerId);
      this.playerHistories.set(playerId, history);
    }
    return history;
  }

  // Initialize a new player history
  private initializePlayerHistory(playerId: string): PlayerHistory {
    const history: PlayerHistory = {
      playerId,
      choices: [],
      activeConsequences: [],
      resolvedConsequences: [],
      factionReputation: new Map(),
      unlockedContent: [],
      discoveredClues: [],
      sharedClues: [],
      totalChoicesMade: 0,
      lastActiveTimestamp: Date.now()
    };

    // Initialize neutral reputation with all factions
    Object.values(Faction).forEach(faction => {
      if (faction !== Faction.NEUTRAL) {
        history.factionReputation.set(faction as Faction, 0);
      }
    });

    return history;
  }

  // Update world state with a change
  public updateWorldState(stateChange: WorldStateChange): void {
    this.worldStateChanges.push(stateChange);

    // Apply the change based on type
    switch (stateChange.changeType) {
      case 'faction_reputation':
        // Already handled in applyReputationConsequence
        break;
      case 'world_event':
        // Already handled in applyWorldEventConsequence
        break;
      case 'faction_relation':
        // Already handled in applyFactionRelationConsequence
        break;
      case 'region_status':
        this.updateRegionStatus(stateChange);
        break;
    }

    this.emit('worldStateChanged', stateChange);
    this.scheduleSave();
  }

  // Update region status
  private updateRegionStatus(change: WorldStateChange): void {
    if (change.newValue && typeof change.newValue === 'object') {
      const regionStatus = change.newValue as RegionStatus;
      this.worldState.regions.set(regionStatus.regionId, regionStatus);
    }
  }

  // Get current world state
  public getWorldState(): WorldState {
    return this.worldState;
  }

  // Calculate consequence expiration timestamp
  private calculateExpiration(duration: ConsequenceDuration): number {
    const now = Date.now();
    const scenarioLength = 30 * 60 * 1000; // Assume 30 minutes per scenario

    switch (duration) {
      case ConsequenceDuration.IMMEDIATE:
        return now + 60 * 1000; // 1 minute
      case ConsequenceDuration.SHORT:
        return now + (2 * scenarioLength); // ~1 hour
      case ConsequenceDuration.MEDIUM:
        return now + (7 * scenarioLength); // ~3.5 hours
      case ConsequenceDuration.LONG:
        return now + (15 * scenarioLength); // ~7.5 hours
      default:
        return now + scenarioLength;
    }
  }

  // Check and expire consequences
  private checkExpirations(): void {
    const now = Date.now();

    this.consequences.forEach((consequence, id) => {
      if (!consequence.resolved && consequence.expiresAt && consequence.expiresAt <= now) {
        consequenceLogger.debug({ consequenceId: id }, 'Consequence expired');
        consequence.resolved = true;

        // Remove from active consequences
        this.playerHistories.forEach(history => {
          const index = history.activeConsequences.indexOf(id);
          if (index > -1) {
            history.activeConsequences.splice(index, 1);
            history.resolvedConsequences.push(id);
          }
        });

        this.emit('consequenceExpired', id);
      }
    });
  }

  // Setup expiration checker (runs every minute)
  private setupExpirationChecker(): void {
    setInterval(() => {
      this.checkExpirations();
    }, 60 * 1000);
  }

  // Check reveal condition (simplified, could be enhanced with expression evaluation)
  private checkRevealCondition(condition: string, playerId: string): boolean {
    const playerHistory = this.playerHistories.get(playerId);
    if (!playerHistory) return false;

    // Simple condition checks
    if (condition.includes('reputation_')) {
      const match = condition.match(/reputation_(\w+)_gt_(\d+)/);
      if (match) {
        const faction = match[1] as Faction;
        const threshold = parseInt(match[2]);
        const reputation = playerHistory.factionReputation.get(faction) || 0;
        return reputation > threshold;
      }
    }

    if (condition.includes('choices_made_')) {
      const match = condition.match(/choices_made_gt_(\d+)/);
      if (match) {
        const threshold = parseInt(match[1]);
        return playerHistory.totalChoicesMade > threshold;
      }
    }

    // Check for unlocked content
    if (condition.includes('has_unlock_')) {
      const match = condition.match(/has_unlock_(\w+)/);
      if (match) {
        return playerHistory.unlockedContent.includes(match[1]);
      }
    }

    return false;
  }

  // Get faction relation key (alphabetically sorted)
  private getFactionRelationKey(faction1: Faction, faction2: Faction): string {
    return faction1 < faction2 ? `${faction1}-${faction2}` : `${faction2}-${faction1}`;
  }

  // Update most influential players list
  private updateInfluentialPlayers(): void {
    const playerInfluence = new Map<string, number>();

    this.playerHistories.forEach((history, playerId) => {
      let influence = 0;

      // Calculate influence based on choices and reputation
      influence += history.totalChoicesMade * 10;

      history.factionReputation.forEach(rep => {
        influence += Math.abs(rep) * 0.5;
      });

      influence += history.unlockedContent.length * 5;
      influence += history.discoveredClues.length * 3;

      playerInfluence.set(playerId, influence);
    });

    // Sort and take top 10
    this.worldState.mostInfluentialPlayers = Array.from(playerInfluence.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([playerId, influence]) => ({ playerId, influence }));
  }

  // Setup auto-save timer
  private setupAutoSave(): void {
    setInterval(() => {
      this.saveState();
    }, this.SAVE_DELAY);
  }

  // Schedule a save operation
  private scheduleSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.saveState();
      this.saveTimer = null;
    }, 5000); // Save after 5 seconds of inactivity
  }

  // Save state to disk
  private saveState(): void {
    try {
      // Create data directory if it doesn't exist
      if (!fs.existsSync(this.DATA_DIR)) {
        fs.mkdirSync(this.DATA_DIR, { recursive: true });
      }

      // Convert Maps to objects for JSON serialization
      const stateToSave = {
        worldState: {
          ...this.worldState,
          factionRelations: Array.from(this.worldState.factionRelations.entries()),
          factionPower: Array.from(this.worldState.factionPower.entries()),
          factionLeaders: Array.from(this.worldState.factionLeaders.entries()),
          regions: Array.from(this.worldState.regions.entries()),
          globalFlags: Array.from(this.worldState.globalFlags.entries()),
          globalVariables: Array.from(this.worldState.globalVariables.entries())
        },
        playerHistories: Array.from(this.playerHistories.entries()).map(([id, history]) => ({
          id,
          history: {
            ...history,
            factionReputation: Array.from(history.factionReputation.entries())
          }
        })),
        consequences: Array.from(this.consequences.entries()),
        worldStateChanges: this.worldStateChanges.slice(-1000) // Keep last 1000 changes
      };

      const filePath = path.join(this.DATA_DIR, 'world_state.json');
      fs.writeFileSync(filePath, JSON.stringify(stateToSave, null, 2));

      consequenceLogger.info('State saved successfully');
    } catch (error) {
      consequenceLogger.error({ error }, 'Failed to save state');
    }
  }

  // Load state from disk
  private loadState(): void {
    try {
      const filePath = path.join(this.DATA_DIR, 'world_state.json');

      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Restore world state
        if (data.worldState) {
          this.worldState = {
            ...data.worldState,
            factionRelations: new Map(data.worldState.factionRelations),
            factionPower: new Map(data.worldState.factionPower),
            factionLeaders: new Map(data.worldState.factionLeaders),
            regions: new Map(data.worldState.regions),
            globalFlags: new Map(data.worldState.globalFlags),
            globalVariables: new Map(data.worldState.globalVariables)
          };
        }

        // Restore player histories
        if (data.playerHistories) {
          this.playerHistories = new Map(
            data.playerHistories.map((item: any) => [
              item.id,
              {
                ...item.history,
                factionReputation: new Map(item.history.factionReputation)
              }
            ])
          );
        }

        // Restore consequences
        if (data.consequences) {
          this.consequences = new Map(data.consequences);
        }

        // Restore world state changes
        if (data.worldStateChanges) {
          this.worldStateChanges = data.worldStateChanges;
        }

        consequenceLogger.info('State loaded successfully');
      }
    } catch (error) {
      consequenceLogger.error({ error }, 'Failed to load state');
    }
  }

  // Export current state for debugging/analysis
  public exportState(): string {
    const exportData = {
      worldState: this.worldState,
      playerCount: this.playerHistories.size,
      activeConsequences: Array.from(this.consequences.values()).filter(c => !c.resolved).length,
      totalChanges: this.worldStateChanges.length,
      timestamp: Date.now()
    };

    return JSON.stringify(exportData, (_key, value) => {
      if (value instanceof Map) {
        return Array.from(value.entries());
      }
      return value;
    }, 2);
  }

  // Import state (for testing/migration)
  public importState(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.worldState) {
        // Validate and import world state
        this.loadState();
        return true;
      }

      return false;
    } catch (error) {
      consequenceLogger.error({ error }, 'Failed to import state');
      return false;
    }
  }
}