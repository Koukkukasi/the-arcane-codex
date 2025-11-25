/**
 * Routes Index
 * Central export for all route modules
 */

export { default as apiRoutes } from './api';
export { default as authRoutes, ensurePlayerId, requireAuth, requireGameSession } from './auth.routes';
export { default as gameRoutes } from './game.routes';
export { default as characterRoutes } from './character.routes';
export { default as battleRoutes } from './battle.routes';
export { default as aigmRoutes } from './aigm.routes';
export { default as multiplayerRoutes } from './multiplayer';
