/**
 * Party Manager Service
 * Manages multiplayer party creation, joining, and lifecycle
 */

import {
  Party,
  PartyPlayer,
  PartySettings,
  PartyRole,
  JoinResult,
  DifficultyLevel,
  PublicPartyInfo
} from '../../types/party';
import { partyLogger } from '../logger';

/**
 * Singleton class for managing multiplayer parties
 */
export class PartyManager {
  private static instance: PartyManager;
  private parties: Map<string, Party>;
  private playerToParty: Map<string, string>; // playerId -> partyCode
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.parties = new Map();
    this.playerToParty = new Map();
    this.startCleanupProcess();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PartyManager {
    if (!PartyManager.instance) {
      PartyManager.instance = new PartyManager();
    }
    return PartyManager.instance;
  }

  /**
   * Generate a unique 6-character party code
   */
  private generatePartyCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes I,O,0,1 for clarity
    let code: string;

    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.parties.has(code));

    return code;
  }

  /**
   * Start automatic cleanup of inactive parties
   */
  private startCleanupProcess(): void {
    // Run cleanup every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveParties();
    }, 30 * 60 * 1000);
  }

  /**
   * Clean up parties inactive for more than 2 hours
   */
  private cleanupInactiveParties(): void {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const toDelete: string[] = [];

    this.parties.forEach((party, code) => {
      if (party.lastActivity < twoHoursAgo) {
        toDelete.push(code);
      }
    });

    toDelete.forEach(code => {
      partyLogger.info({ partyCode: code }, 'Cleaning up inactive party');
      this.disbandParty(code);
    });
  }

  /**
   * Update party's last activity timestamp
   */
  private updateActivity(partyCode: string): void {
    const party = this.parties.get(partyCode);
    if (party) {
      party.lastActivity = new Date();
    }
  }

  /**
   * Create a new party
   */
  public createParty(hostId: string, partyName: string, maxPlayers: number = 4): Party {
    // Validate inputs
    if (!hostId || !partyName) {
      throw new Error('Host ID and party name are required');
    }

    if (maxPlayers < 2 || maxPlayers > 6) {
      throw new Error('Party size must be between 2 and 6 players');
    }

    // Check if host is already in a party
    if (this.playerToParty.has(hostId)) {
      throw new Error('Host is already in a party');
    }

    const partyCode = this.generatePartyCode();
    const now = new Date();

    const hostPlayer: PartyPlayer = {
      id: hostId,
      name: 'Host', // Will be updated when host provides name
      level: 1,
      isReady: false,
      joinedAt: now
    };

    const party: Party = {
      code: partyCode,
      name: partyName,
      host: hostId,
      players: new Map([[hostId, hostPlayer]]),
      settings: {
        maxPlayers,
        isPublic: false,
        difficulty: DifficultyLevel.NORMAL,
        allowSpectators: false
      },
      createdAt: now,
      lastActivity: now
    };

    this.parties.set(partyCode, party);
    this.playerToParty.set(hostId, partyCode);

    partyLogger.info({ partyCode, hostId }, 'Party created');
    return party;
  }

  /**
   * Join an existing party
   */
  public joinParty(partyCode: string, playerId: string, playerName: string): JoinResult {
    // Validate inputs
    if (!partyCode || !playerId || !playerName) {
      return {
        success: false,
        error: 'Invalid join parameters'
      };
    }

    // Check if player is already in a party
    if (this.playerToParty.has(playerId)) {
      return {
        success: false,
        error: 'Player is already in a party'
      };
    }

    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      return {
        success: false,
        error: 'Party not found'
      };
    }

    // Check party capacity
    if (party.players.size >= party.settings.maxPlayers) {
      return {
        success: false,
        error: 'Party is full'
      };
    }

    const player: PartyPlayer = {
      id: playerId,
      name: playerName,
      level: 1,
      isReady: false,
      joinedAt: new Date()
    };

    party.players.set(playerId, player);
    this.playerToParty.set(playerId, partyCode.toUpperCase());
    this.updateActivity(partyCode.toUpperCase());

    partyLogger.info({ partyCode, playerId, playerName }, 'Player joined party');

    return {
      success: true,
      party
    };
  }

  /**
   * Leave a party
   */
  public leaveParty(partyCode: string, playerId: string): void {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      partyLogger.warn({ partyCode }, 'Attempted to leave non-existent party');
      return;
    }

    const player = party.players.get(playerId);
    if (!player) {
      partyLogger.warn({ partyCode, playerId }, 'Player not in party');
      return;
    }

    party.players.delete(playerId);
    this.playerToParty.delete(playerId);
    this.updateActivity(partyCode.toUpperCase());

    partyLogger.info({ partyCode, playerId, playerName: player.name }, 'Player left party');

    // If the host left, transfer host or disband
    if (party.host === playerId) {
      if (party.players.size > 0) {
        // Transfer host to first remaining player
        const newHost = party.players.keys().next().value as string;
        party.host = newHost;
        partyLogger.info({ partyCode, newHost }, 'Host transferred');
      } else {
        // No players left, disband party
        this.disbandParty(partyCode);
      }
    }

    // If party is empty, disband it
    if (party.players.size === 0) {
      this.disbandParty(partyCode);
    }
  }

  /**
   * Disband a party
   */
  public disbandParty(partyCode: string): void {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      partyLogger.warn({ partyCode }, 'Attempted to disband non-existent party');
      return;
    }

    // Remove all players from the party mapping
    party.players.forEach((_, playerId) => {
      this.playerToParty.delete(playerId);
    });

    this.parties.delete(partyCode.toUpperCase());
    partyLogger.info({ partyCode }, 'Party disbanded');
  }

  /**
   * Get a party by code
   */
  public getParty(partyCode: string): Party | null {
    return this.parties.get(partyCode.toUpperCase()) || null;
  }

  /**
   * Get the party a player is in
   */
  public getPlayerParty(playerId: string): Party | null {
    const partyCode = this.playerToParty.get(playerId);
    if (!partyCode) {
      return null;
    }
    return this.parties.get(partyCode) || null;
  }

  /**
   * Update party settings (host only)
   */
  public updatePartySettings(partyCode: string, settings: Partial<PartySettings>): void {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      throw new Error('Party not found');
    }

    // Validate max players
    if (settings.maxPlayers !== undefined) {
      if (settings.maxPlayers < 2 || settings.maxPlayers > 6) {
        throw new Error('Party size must be between 2 and 6 players');
      }
      if (settings.maxPlayers < party.players.size) {
        throw new Error('Cannot set max players below current player count');
      }
    }

    // Update settings
    party.settings = { ...party.settings, ...settings };
    this.updateActivity(partyCode.toUpperCase());

    partyLogger.info({ partyCode, settings }, 'Party settings updated');
  }

  /**
   * Set player ready status
   */
  public setPlayerReady(partyCode: string, playerId: string, ready: boolean): void {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      throw new Error('Party not found');
    }

    const player = party.players.get(playerId);
    if (!player) {
      throw new Error('Player not in party');
    }

    player.isReady = ready;
    this.updateActivity(partyCode.toUpperCase());

    partyLogger.info({ partyCode, playerId, playerName: player.name, ready }, 'Player ready status changed');
  }

  /**
   * Kick a player from the party (host only)
   */
  public kickPlayer(partyCode: string, hostId: string, targetId: string): boolean {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      partyLogger.warn({ partyCode }, 'Kick failed: party not found');
      return false;
    }

    if (party.host !== hostId) {
      partyLogger.warn({ partyCode, hostId }, 'Kick failed: not the host');
      return false;
    }

    if (hostId === targetId) {
      partyLogger.warn({ partyCode }, 'Kick failed: host cannot kick themselves');
      return false;
    }

    const targetPlayer = party.players.get(targetId);
    if (!targetPlayer) {
      partyLogger.warn({ partyCode, targetId }, 'Kick failed: player not in party');
      return false;
    }

    party.players.delete(targetId);
    this.playerToParty.delete(targetId);
    this.updateActivity(partyCode.toUpperCase());

    partyLogger.info({ partyCode, targetId, playerName: targetPlayer.name }, 'Player kicked from party');
    return true;
  }

  /**
   * Transfer host to another player
   */
  public transferHost(partyCode: string, currentHost: string, newHost: string): boolean {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      partyLogger.warn({ partyCode }, 'Host transfer failed: party not found');
      return false;
    }

    if (party.host !== currentHost) {
      partyLogger.warn({ partyCode, currentHost }, 'Host transfer failed: not the host');
      return false;
    }

    if (!party.players.has(newHost)) {
      partyLogger.warn({ partyCode, newHost }, 'Host transfer failed: player not in party');
      return false;
    }

    party.host = newHost;
    this.updateActivity(partyCode.toUpperCase());

    partyLogger.info({ partyCode, currentHost, newHost }, 'Host transferred');
    return true;
  }

  /**
   * Get list of public parties
   */
  public getPublicParties(): PublicPartyInfo[] {
    const publicParties: PublicPartyInfo[] = [];

    this.parties.forEach((party, code) => {
      if (party.settings.isPublic) {
        const hostPlayer = party.players.get(party.host);
        publicParties.push({
          code,
          name: party.name,
          hostName: hostPlayer?.name || 'Unknown',
          playerCount: party.players.size,
          maxPlayers: party.settings.maxPlayers,
          difficulty: party.settings.difficulty,
          allowSpectators: party.settings.allowSpectators
        });
      }
    });

    return publicParties;
  }

  /**
   * Check if all players are ready
   */
  public areAllPlayersReady(partyCode: string): boolean {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party || party.players.size === 0) {
      return false;
    }

    for (const player of party.players.values()) {
      if (!player.isReady) {
        return false;
      }
    }

    return true;
  }

  /**
   * Assign a role to a player
   */
  public assignRole(partyCode: string, playerId: string, role: PartyRole): void {
    const party = this.parties.get(partyCode.toUpperCase());
    if (!party) {
      throw new Error('Party not found');
    }

    const player = party.players.get(playerId);
    if (!player) {
      throw new Error('Player not in party');
    }

    player.role = role;
    this.updateActivity(partyCode.toUpperCase());

    partyLogger.info({ partyCode, playerId, playerName: player.name, role }, 'Role assigned');
  }

  /**
   * Export party data for persistence
   */
  public exportData(): string {
    const data = {
      parties: Array.from(this.parties.entries()).map(([code, party]) => ({
        code,
        party: {
          ...party,
          players: Array.from(party.players.entries())
        }
      })),
      playerToParty: Array.from(this.playerToParty.entries())
    };
    return JSON.stringify(data);
  }

  /**
   * Import party data
   */
  public importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      // Clear existing data
      this.parties.clear();
      this.playerToParty.clear();

      // Restore parties
      data.parties.forEach((item: any) => {
        const party = {
          ...item.party,
          players: new Map(item.party.players),
          createdAt: new Date(item.party.createdAt),
          lastActivity: new Date(item.party.lastActivity)
        };
        this.parties.set(item.code, party);
      });

      // Restore player mappings
      data.playerToParty.forEach(([playerId, partyCode]: [string, string]) => {
        this.playerToParty.set(playerId, partyCode);
      });

      partyLogger.info({ count: this.parties.size }, 'Parties imported');
    } catch (error) {
      partyLogger.error({ error }, 'Failed to import data');
      throw new Error('Failed to import party data');
    }
  }

  /**
   * Cleanup on shutdown
   */
  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}