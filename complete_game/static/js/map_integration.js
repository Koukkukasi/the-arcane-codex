/**
 * ========================================
 * MAP SYSTEM INTEGRATION
 * ========================================
 * Integrates the world map with the game state and quest system
 */

class MapIntegration {
    constructor(game) {
        this.game = game;
        this.worldMap = null;
        this.minimap = null;
        this.mapOpen = false;

        this.init();
    }

    init() {
        // Create map overlay HTML
        this.createMapOverlay();

        // Setup event listeners
        this.setupEventListeners();

        // Load saved map state
        this.loadMapState();

        console.log('[Map Integration] Initialized');
    }

    createMapOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'world-map-overlay';
        overlay.id = 'world-map-overlay';
        overlay.innerHTML = `
            <!-- Map Header -->
            <div class="world-map-header">
                <h1 class="world-map-title">⚔️ World Map of Valdria</h1>
                <div class="world-map-controls">
                    <button class="map-control-btn" onclick="mapIntegration.toggleLegend()">
                        📖 Legend
                    </button>
                    <button class="map-control-btn" onclick="mapIntegration.resetView()">
                        🎯 Reset View
                    </button>
                    <button class="map-control-btn close" onclick="mapIntegration.closeMap()">
                        ✕ Close (M)
                    </button>
                </div>
            </div>

            <!-- Map Canvas Area -->
            <div class="world-map-canvas-container">
                <canvas id="world-map-canvas" width="2000" height="1400"></canvas>

                <!-- Zoom Controls -->
                <div class="map-zoom-controls">
                    <button class="zoom-btn" onclick="mapIntegration.zoomIn()" title="Zoom In">+</button>
                    <button class="zoom-btn" onclick="mapIntegration.zoomOut()" title="Zoom Out">−</button>
                </div>

                <!-- Legend -->
                <div class="world-map-legend" id="map-legend">
                    <h3>Map Legend</h3>
                    <div class="legend-items">
                        <div class="legend-item">
                            <span class="legend-icon shop">🏪</span>
                            <span>Shops & Markets</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon temple">🏛️</span>
                            <span>Divine Temples</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon quest">⚔️</span>
                            <span>Quest Objectives</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon npc">👥</span>
                            <span>NPCs</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon danger">⚠️</span>
                            <span>Danger Zones</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-icon exit">🚪</span>
                            <span>Exits & Portals</span>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div class="map-loading" id="map-loading" style="display: none;">
                    <div class="map-loading-spinner"></div>
                    <p>Loading map...</p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Create minimap container (always visible during gameplay)
        const minimapContainer = document.createElement('div');
        minimapContainer.className = 'minimap-container';
        minimapContainer.id = 'minimap-container';
        minimapContainer.innerHTML = `
            <div class="minimap-header">
                <span>World Map</span>
                <button class="minimap-toggle" onclick="mapIntegration.toggleMinimap()" title="Toggle Minimap">−</button>
            </div>
            <canvas id="minimap-canvas" width="200" height="150"></canvas>
        `;

        // Only add minimap during gameplay, not on landing/lobby
        if (document.getElementById('game-main')) {
            document.body.appendChild(minimapContainer);
        }
    }

    setupEventListeners() {
        // Keyboard shortcut: M to toggle map
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                // Don't trigger if typing in input
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    return;
                }
                this.toggleMap();
            }
        });

        // Listen for POI selection
        document.addEventListener('poiSelected', (e) => {
            this.onPOISelected(e.detail);
        });

        // Listen for fast travel
        document.addEventListener('fastTravel', (e) => {
            this.onFastTravel(e.detail);
        });

        // Listen for quest updates
        document.addEventListener('questUpdated', (e) => {
            this.onQuestUpdated(e.detail);
        });
    }

    toggleMap() {
        const overlay = document.getElementById('world-map-overlay');

        if (this.mapOpen) {
            this.closeMap();
        } else {
            this.openMap();
        }
    }

    openMap() {
        const overlay = document.getElementById('world-map-overlay');
        overlay.classList.add('active');
        this.mapOpen = true;

        // Initialize world map renderer if not already created
        if (!this.worldMap) {
            setTimeout(() => {
                this.worldMap = new WorldMapRenderer('world-map-canvas');
                this.syncMapWithGameState();
            }, 100);
        } else {
            this.worldMap.render();
        }

        console.log('[Map] Opened');
    }

    closeMap() {
        const overlay = document.getElementById('world-map-overlay');
        overlay.classList.remove('active');
        this.mapOpen = false;

        console.log('[Map] Closed');
    }

    zoomIn() {
        if (this.worldMap) {
            this.worldMap.zoomIn();
        }
    }

    zoomOut() {
        if (this.worldMap) {
            this.worldMap.zoomOut();
        }
    }

    resetView() {
        if (this.worldMap) {
            this.worldMap.resetView();
        }
    }

    toggleLegend() {
        const legend = document.getElementById('map-legend');
        if (legend) {
            legend.style.display = legend.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleMinimap() {
        const container = document.getElementById('minimap-container');
        const toggle = container.querySelector('.minimap-toggle');

        if (container.style.height === '25px') {
            // Expand
            container.style.height = '150px';
            toggle.textContent = '−';
        } else {
            // Collapse
            container.style.height = '25px';
            toggle.textContent = '+';
        }
    }

    // ===== GAME STATE INTEGRATION =====

    syncMapWithGameState() {
        if (!this.game || !this.worldMap) return;

        // Get discovered locations from game state
        const gameState = this.game.getState ? this.game.getState() : {};

        // Reveal areas based on game progress
        if (gameState.visitedLocations) {
            gameState.visitedLocations.forEach(locationId => {
                this.worldMap.revealPOI(locationId);
            });
        }

        // Mark quest locations
        if (gameState.activeQuests) {
            gameState.activeQuests.forEach(quest => {
                if (quest.location) {
                    this.markQuestLocation(quest.location, quest);
                }
            });
        }

        console.log('[Map] Synced with game state');
    }

    markQuestLocation(locationId, questData) {
        // Find POI and mark it
        const poi = WORLD_MAP_DATA.pois.find(p => p.id === locationId);
        if (poi) {
            poi.questActive = true;
            poi.questData = questData;

            // Reveal the POI if quest is active
            if (this.worldMap) {
                this.worldMap.revealPOI(locationId);
            }
        }
    }

    // ===== EVENT HANDLERS =====

    onPOISelected(poi) {
        console.log('[Map] POI Selected:', poi);

        // Notify game system
        if (this.game && this.game.onPOISelected) {
            this.game.onPOISelected(poi);
        }

        // Update quest tracker if this is a quest location
        if (poi.questId) {
            this.highlightQuest(poi.questId);
        }
    }

    async onFastTravel(data) {
        const { poi, cost } = data;

        console.log(`[Map] Fast Travel to ${poi.name} for ${cost}g`);

        // Check if player has enough gold
        if (this.game && this.game.getPlayerGold) {
            const playerGold = this.game.getPlayerGold();

            if (playerGold < cost) {
                alert(`Not enough gold! You need ${cost}g but only have ${playerGold}g.`);
                return;
            }
        }

        // Show loading
        this.showLoading('Traveling...');

        try {
            // Call game API to fast travel
            if (this.game && this.game.fastTravel) {
                await this.game.fastTravel(poi.id);
            } else {
                // Fallback: make API call directly
                await this.fastTravelAPI(poi.id);
            }

            // Update player position
            this.updatePlayerPosition(poi.position);

            // Close map after travel
            setTimeout(() => {
                this.closeMap();
                this.hideLoading();
            }, 1000);

        } catch (error) {
            console.error('[Map] Fast travel failed:', error);
            alert('Fast travel failed: ' + error.message);
            this.hideLoading();
        }
    }

    async fastTravelAPI(poiId) {
        // API call to backend
        const response = await fetch('/api/fast_travel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Player-ID': this.game.playerId
            },
            body: JSON.stringify({
                destination: poiId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fast travel failed');
        }

        return await response.json();
    }

    onQuestUpdated(questData) {
        console.log('[Map] Quest Updated:', questData);

        if (questData.location) {
            this.markQuestLocation(questData.location, questData);

            // Update map if open
            if (this.worldMap && this.mapOpen) {
                this.worldMap.render();
            }
        }
    }

    highlightQuest(questId) {
        // Highlight quest in quest log
        const questElement = document.getElementById(`quest-${questId}`);
        if (questElement) {
            questElement.classList.add('highlighted');
            questElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Remove highlight after 2 seconds
            setTimeout(() => {
                questElement.classList.remove('highlighted');
            }, 2000);
        }
    }

    // ===== PLAYER POSITION =====

    updatePlayerPosition(position) {
        // Update player marker on map
        if (this.worldMap) {
            // worldMap will use this in next render
            this.worldMap.playerPosition = position;
            this.worldMap.render();
        }

        // Update minimap
        if (this.minimap) {
            this.minimap.render();
        }
    }

    // ===== DISCOVERY SYSTEM =====

    discoverLocation(locationId) {
        if (this.worldMap) {
            this.worldMap.revealPOI(locationId);
        }

        // Save to game state
        if (this.game && this.game.addVisitedLocation) {
            this.game.addVisitedLocation(locationId);
        }

        // Save map state
        this.saveMapState();

        console.log('[Map] Discovered:', locationId);
    }

    discoverRegion(regionId) {
        if (this.worldMap) {
            this.worldMap.revealArea(regionId);
        }

        // Save map state
        this.saveMapState();

        console.log('[Map] Discovered region:', regionId);
    }

    // ===== PERSISTENCE =====

    saveMapState() {
        if (!this.worldMap) return;

        const state = this.worldMap.fogOfWar.saveState();

        // Save to localStorage
        localStorage.setItem('arcane_map_state', JSON.stringify(state));

        console.log('[Map] State saved');
    }

    loadMapState() {
        const saved = localStorage.getItem('arcane_map_state');

        if (saved && this.worldMap) {
            try {
                const state = JSON.parse(saved);
                this.worldMap.fogOfWar.loadState(state);
                console.log('[Map] State loaded');
            } catch (error) {
                console.error('[Map] Failed to load state:', error);
            }
        }
    }

    // ===== UTILITY =====

    showLoading(message = 'Loading...') {
        const loading = document.getElementById('map-loading');
        if (loading) {
            loading.style.display = 'block';
            loading.querySelector('p').textContent = message;
        }
    }

    hideLoading() {
        const loading = document.getElementById('map-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    // ===== PUBLIC API =====

    getDiscoveredLocations() {
        if (this.worldMap) {
            return Array.from(this.worldMap.fogOfWar.exploredAreas);
        }
        return [];
    }

    canFastTravelTo(poiId) {
        const poi = WORLD_MAP_DATA.pois.find(p => p.id === poiId);
        return poi && poi.discovered && poi.canFastTravel;
    }

    centerOnQuest(questId) {
        // Find POI with this quest
        const poi = WORLD_MAP_DATA.pois.find(p => p.questId === questId);

        if (poi && this.worldMap) {
            this.openMap();
            setTimeout(() => {
                this.worldMap.centerOnPOI(poi.id);
            }, 200);
        }
    }
}

// Initialize map integration when game is ready
let mapIntegration = null;

function initMapIntegration(gameInstance) {
    mapIntegration = new MapIntegration(gameInstance);
    console.log('[Map Integration] Ready');
    return mapIntegration;
}

// Auto-initialize if game is already loaded
if (typeof window.game !== 'undefined') {
    initMapIntegration(window.game);
} else {
    // Wait for game to initialize
    document.addEventListener('gameReady', () => {
        initMapIntegration(window.game);
    });
}

// Export
window.MapIntegration = MapIntegration;
window.mapIntegration = mapIntegration;
