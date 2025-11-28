/**
 * Multiplayer API Routes
 * Handles party management and multiplayer game sessions
 */

import { Router, Request, Response } from 'express';
import { PartyManager } from '../services/multiplayer/party_manager';
import { apiLogger } from '../services/logger';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';

const router = Router();
const partyManager = PartyManager.getInstance();

/**
 * POST /api/multiplayer/party/create
 * Create a new party (requires authentication)
 */
router.post('/party/create', requireAuth, (req: Request, res: Response) => {
  try {
    const { partyName, maxPlayers } = req.body;
    const hostId = req.user!.userId; // Use authenticated user's ID

    if (!partyName) {
      res.status(400).json({
        success: false,
        error: 'Party name is required'
      });
      return;
    }

    const party = partyManager.createParty(hostId, partyName, maxPlayers || 4);

    res.json({
      success: true,
      data: {
        code: party.code,
        name: party.name,
        host: party.host,
        playerCount: party.players.size,
        settings: party.settings,
        createdAt: party.createdAt
      }
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error creating party');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * POST /api/multiplayer/party/join
 * Join an existing party (requires authentication)
 */
router.post('/party/join', requireAuth, (req: Request, res: Response) => {
  try {
    const { partyCode } = req.body;
    const playerId = req.user!.userId;
    const playerName = req.user!.username;

    if (!partyCode) {
      res.status(400).json({
        success: false,
        error: 'Party code is required'
      });
      return;
    }

    const result = partyManager.joinParty(partyCode, playerId, playerName);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    const party = result.party!;
    res.json({
      success: true,
      data: {
        code: party.code,
        name: party.name,
        host: party.host,
        playerCount: party.players.size,
        maxPlayers: party.settings.maxPlayers,
        players: Array.from(party.players.values()).map(p => ({
          id: p.id,
          name: p.name,
          level: p.level,
          isReady: p.isReady,
          role: p.role
        }))
      }
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error joining party');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * POST /api/multiplayer/party/:partyCode/leave
 * Leave a party (requires authentication)
 */
router.post('/party/:partyCode/leave', requireAuth, (req: Request, res: Response) => {
  try {
    const { partyCode } = req.params;
    const playerId = req.user!.userId;

    partyManager.leaveParty(partyCode, playerId);

    res.json({
      success: true,
      message: 'Successfully left party'
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error leaving party');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * GET /api/multiplayer/party/:partyCode
 * Get party details
 */
router.get('/party/:partyCode', (req: Request, res: Response) => {
  try {
    const { partyCode } = req.params;
    const party = partyManager.getParty(partyCode);

    if (!party) {
      res.status(404).json({
        success: false,
        error: 'Party not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        code: party.code,
        name: party.name,
        host: party.host,
        playerCount: party.players.size,
        maxPlayers: party.settings.maxPlayers,
        difficulty: party.settings.difficulty,
        isPublic: party.settings.isPublic,
        players: Array.from(party.players.values()).map(p => ({
          id: p.id,
          name: p.name,
          level: p.level,
          isReady: p.isReady,
          role: p.role,
          characterClass: p.characterClass
        })),
        createdAt: party.createdAt,
        lastActivity: party.lastActivity
      }
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error getting party');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/multiplayer/parties/public
 * Get list of public parties (optional authentication)
 */
router.get('/parties/public', optionalAuth, (_req: Request, res: Response) => {
  try {
    const publicParties = partyManager.getPublicParties();

    res.json({
      success: true,
      data: publicParties
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error getting public parties');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * PUT /api/multiplayer/party/:partyCode/settings
 * Update party settings (host only, requires authentication)
 */
router.put('/party/:partyCode/settings', requireAuth, (req: Request, res: Response) => {
  try {
    const { partyCode } = req.params;
    const { settings } = req.body;
    const hostId = req.user!.userId;

    const party = partyManager.getParty(partyCode);
    if (!party) {
      res.status(404).json({
        success: false,
        error: 'Party not found'
      });
      return;
    }

    if (party.host !== hostId) {
      res.status(403).json({
        success: false,
        error: 'Only the host can update party settings'
      });
      return;
    }

    partyManager.updatePartySettings(partyCode, settings);

    res.json({
      success: true,
      message: 'Party settings updated',
      data: {
        settings: party.settings
      }
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error updating party settings');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * POST /api/multiplayer/party/:partyCode/ready
 * Set player ready status (requires authentication)
 */
router.post('/party/:partyCode/ready', requireAuth, (req: Request, res: Response) => {
  try {
    const { partyCode } = req.params;
    const { ready } = req.body;
    const playerId = req.user!.userId;

    if (ready === undefined) {
      res.status(400).json({
        success: false,
        error: 'Ready status is required'
      });
      return;
    }

    partyManager.setPlayerReady(partyCode, playerId, ready);

    const allReady = partyManager.areAllPlayersReady(partyCode);

    res.json({
      success: true,
      message: `Player ${ready ? 'is ready' : 'is not ready'}`,
      data: {
        allPlayersReady: allReady
      }
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error setting ready status');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * POST /api/multiplayer/party/:partyCode/kick
 * Kick a player from the party (host only, requires authentication)
 */
router.post('/party/:partyCode/kick', requireAuth, (req: Request, res: Response) => {
  try {
    const { partyCode } = req.params;
    const { targetId } = req.body;
    const hostId = req.user!.userId;

    if (!targetId) {
      res.status(400).json({
        success: false,
        error: 'Target player ID is required'
      });
      return;
    }

    const success = partyManager.kickPlayer(partyCode, hostId, targetId);

    if (!success) {
      res.status(403).json({
        success: false,
        error: 'Failed to kick player (not host or player not found)'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Player kicked successfully'
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error kicking player');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * POST /api/multiplayer/party/:partyCode/transfer-host
 * Transfer host to another player (requires authentication)
 */
router.post('/party/:partyCode/transfer-host', requireAuth, (req: Request, res: Response) => {
  try {
    const { partyCode } = req.params;
    const { newHost } = req.body;
    const currentHost = req.user!.userId;

    if (!newHost) {
      res.status(400).json({
        success: false,
        error: 'New host ID is required'
      });
      return;
    }

    const success = partyManager.transferHost(partyCode, currentHost, newHost);

    if (!success) {
      res.status(403).json({
        success: false,
        error: 'Failed to transfer host'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Host transferred successfully',
      data: {
        newHost
      }
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error transferring host');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * GET /api/multiplayer/player/:playerId/party
 * Get the party a player is currently in
 */
router.get('/player/:playerId/party', (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const party = partyManager.getPlayerParty(playerId);

    if (!party) {
      res.json({
        success: true,
        data: null,
        message: 'Player is not in any party'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        code: party.code,
        name: party.name,
        host: party.host,
        playerCount: party.players.size,
        maxPlayers: party.settings.maxPlayers,
        isHost: party.host === playerId
      }
    });
  } catch (error: any) {
    apiLogger.error({ error }, 'Error getting player party');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

/**
 * POST /api/multiplayer/party/:partyCode/start
 * Start the game (host only, requires authentication)
 */
router.post('/party/:partyCode/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const { partyCode } = req.params;
    const hostId = req.user!.userId;

    const party = partyManager.getParty(partyCode);
    if (!party) {
      res.status(404).json({
        success: false,
        error: 'Party not found'
      });
      return;
    }

    if (party.host !== hostId) {
      res.status(403).json({
        success: false,
        error: 'Only the host can start the game'
      });
      return;
    }

    // Check if all players are ready
    const allReady = partyManager.areAllPlayersReady(partyCode);
    if (!allReady) {
      res.status(400).json({
        success: false,
        error: 'Not all players are ready'
      });
      return;
    }

    // Import MultiplayerService to start the game
    const { MultiplayerService } = await import('../services/multiplayer/multiplayer_service');
    const multiplayerService = MultiplayerService.getInstance();

    // Start the game
    const result = await multiplayerService.startGame(partyCode, hostId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Game started successfully',
        data: {
          sessionId: result.session?.id
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to start game'
      });
    }
  } catch (error: any) {
    apiLogger.error({ error }, 'Error starting game');
    res.status(500).json({
      success: false,
      error: error.message
    });
    return;
  }
});

export default router;
