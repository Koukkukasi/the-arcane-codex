/**
 * API Router
 * Main entry point for all API routes - composed from domain-specific modules
 */

import { Router, Request, Response } from 'express';
import { getMCPService } from '../services/mcp';
import { apiLogger } from '../services/logger';

// Import domain-specific route modules
import authRoutes from './auth.routes';
import gameRoutes from './game.routes';
import characterRoutes from './character.routes';
import battleRoutes from './battle.routes';
import aigmRoutes from './aigm.routes';
import multiplayerRoutes from './multiplayer';

const router = Router();
const mcpService = getMCPService();

// ============================================================================
// Mount Domain Routes
// ============================================================================

// Auth routes - JWT endpoints at /auth, legacy session endpoints at root
router.use('/auth', authRoutes);
router.use('/', authRoutes);

// Game session routes (create, join, state)
router.use('/', gameRoutes);

// Character routes (class selection, divine favor, interrogation)
router.use('/character', characterRoutes);

// Interrogation routes are also at root level for backwards compatibility
router.post('/start_interrogation', (req, res, next) => {
  req.url = '/start_interrogation';
  return characterRoutes(req, res, next);
});

router.post('/answer_question', (req, res, next) => {
  req.url = '/answer_question';
  return characterRoutes(req, res, next);
});

// Battle system routes
router.use('/battle', battleRoutes);

// AI GM routes
router.use('/ai_gm', aigmRoutes);

// Multiplayer routes
router.use('/multiplayer', multiplayerRoutes);

// ============================================================================
// Error Logging Endpoint
// ============================================================================

router.post('/log_client_error', (req: Request, res: Response): void => {
  const { error, context, stack } = req.body;

  apiLogger.error({
    clientError: error,
    context,
    stack,
    user: req.session.username || 'anonymous'
  }, 'Client error reported');

  res.json({
    success: true,
    message: 'Error logged'
  });
});

// ============================================================================
// Health Check
// ============================================================================

router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    status: 'healthy',
    mcp_available: mcpService.checkAvailability(),
    timestamp: new Date().toISOString()
  });
});

export default router;
