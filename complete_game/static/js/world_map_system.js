/**
 * ========================================
 * THE ARCANE CODEX - WORLD MAP SYSTEM
 * ========================================
 *
 * Complete map system with:
 * - Hand-drawn fantasy world map
 * - Fog of war (unexplored/discovered/current)
 * - Interactive POIs (shops, quests, NPCs, temples, etc.)
 * - Zoom and pan controls
 * - Fast travel system
 * - Minimap for gameplay
 * - Quest integration
 */

// ===== WORLD MAP DATA STRUCTURE =====

const WORLD_MAP_DATA = {
    name: "The Realm of Valdria",
    width: 2000,  // Canvas pixels
    height: 1400,

    // Regions/Zones
    regions: [
        {
            id: 'valdria_city',
            name: 'Valdria (Capital)',
            bounds: { x: 0.3, y: 0.4, width: 0.15, height: 0.12 },
            type: 'city',
            color: '#8B7355',
            discovered: true,
            description: 'The grand capital city, center of trade and civilization'
        },
        {
            id: 'elderwood',
            name: 'Elderwood Forest',
            bounds: { x: 0.15, y: 0.25, width: 0.25, height: 0.3 },
            type: 'forest',
            color: '#2D5016',
            discovered: false,
            description: 'Ancient forest filled with mystery and danger'
        },
        {
            id: 'crimson_wastes',
            name: 'Crimson Wastes',
            bounds: { x: 0.6, y: 0.6, width: 0.3, height: 0.25 },
            type: 'desert',
            color: '#8B4513',
            discovered: false,
            description: 'Harsh desert where few dare to tread'
        },
        {
            id: 'frostpeak',
            name: 'Frostpeak Mountains',
            bounds: { x: 0.7, y: 0.15, width: 0.25, height: 0.35 },
            type: 'mountains',
            color: '#4A5568',
            discovered: false,
            description: 'Snow-capped peaks hiding ancient secrets'
        },
        {
            id: 'shadowfen',
            name: 'Shadowfen Swamp',
            bounds: { x: 0.05, y: 0.65, width: 0.2, height: 0.2 },
            type: 'swamp',
            color: '#1A3A2A',
            discovered: false,
            description: 'Murky swamplands shrouded in perpetual mist'
        }
    ],

    // Points of Interest
    pois: [
        // VALDRIA CITY - Always discovered
        {
            id: 'valdria_market',
            name: 'Grand Market',
            type: 'shop',
            icon: '🏪',
            position: { x: 0.32, y: 0.42 },
            region: 'valdria_city',
            discovered: true,
            canFastTravel: true,
            description: 'The largest marketplace in Valdria',
            services: ['buy', 'sell', 'repair']
        },
        {
            id: 'valdria_temple',
            name: 'Temple of the Seven',
            type: 'temple',
            icon: '🏛️',
            position: { x: 0.36, y: 0.44 },
            region: 'valdria_city',
            discovered: true,
            canFastTravel: true,
            description: 'Divine temple to the seven gods',
            services: ['heal', 'bless', 'quest']
        },
        {
            id: 'valdria_inn',
            name: 'The Prancing Unicorn Inn',
            type: 'inn',
            icon: '🏨',
            position: { x: 0.34, y: 0.46 },
            region: 'valdria_city',
            discovered: true,
            canFastTravel: true,
            description: 'Popular inn with comfortable rooms',
            services: ['rest', 'rumors', 'hire']
        },
        {
            id: 'mage_guild',
            name: 'Arcane Academy',
            type: 'guild',
            icon: '🔮',
            position: { x: 0.40, y: 0.43 },
            region: 'valdria_city',
            discovered: true,
            canFastTravel: true,
            description: 'Guild of mages and scholars',
            services: ['learn_spells', 'enchant', 'identify']
        },

        // ELDERWOOD FOREST - Undiscovered
        {
            id: 'druid_grove',
            name: 'Ancient Druid Grove',
            type: 'npc',
            icon: '👥',
            position: { x: 0.22, y: 0.35 },
            region: 'elderwood',
            discovered: false,
            canFastTravel: true,
            description: 'Sacred grove of the forest druids',
            npcName: 'Elder Thistlebark'
        },
        {
            id: 'bandit_camp',
            name: 'Bandit Hideout',
            type: 'danger',
            icon: '⚠️',
            position: { x: 0.18, y: 0.30 },
            region: 'elderwood',
            discovered: false,
            canFastTravel: false,
            description: 'Dangerous bandit encampment',
            enemyLevel: 3
        },
        {
            id: 'forest_shrine',
            name: 'Forgotten Shrine',
            type: 'quest',
            icon: '⚔️',
            position: { x: 0.28, y: 0.38 },
            region: 'elderwood',
            discovered: false,
            canFastTravel: false,
            description: 'Ancient shrine with mysterious purpose',
            questId: 'elderwood_mystery'
        },

        // FROSTPEAK MOUNTAINS
        {
            id: 'dwarven_halls',
            name: 'Ironforge Halls',
            type: 'shop',
            icon: '🏪',
            position: { x: 0.78, y: 0.28 },
            region: 'frostpeak',
            discovered: false,
            canFastTravel: true,
            description: 'Dwarven stronghold and smithy',
            services: ['buy', 'sell', 'forge', 'repair']
        },
        {
            id: 'dragon_lair',
            name: 'Dragon\'s Peak',
            type: 'danger',
            icon: '⚠️',
            position: { x: 0.82, y: 0.22 },
            region: 'frostpeak',
            discovered: false,
            canFastTravel: false,
            description: 'Legendary lair of an ancient dragon',
            enemyLevel: 10
        },

        // CRIMSON WASTES
        {
            id: 'oasis_town',
            name: 'Mirage Oasis',
            type: 'shop',
            icon: '🏪',
            position: { x: 0.70, y: 0.68 },
            region: 'crimson_wastes',
            discovered: false,
            canFastTravel: true,
            description: 'Desert trading post',
            services: ['buy', 'sell', 'rest']
        },
        {
            id: 'pyramid',
            name: 'Lost Pyramid',
            type: 'quest',
            icon: '⚔️',
            position: { x: 0.75, y: 0.75 },
            region: 'crimson_wastes',
            discovered: false,
            canFastTravel: false,
            description: 'Ancient pyramid hiding untold treasures',
            questId: 'tomb_raiders'
        },

        // SHADOWFEN SWAMP
        {
            id: 'witch_hut',
            name: 'Witch\'s Hovel',
            type: 'npc',
            icon: '👥',
            position: { x: 0.12, y: 0.72 },
            region: 'shadowfen',
            discovered: false,
            canFastTravel: true,
            description: 'Home of the mysterious swamp witch',
            npcName: 'Morgana the Wise'
        },

        // ROADS AND PATHS
        {
            id: 'north_gate',
            name: 'North Gate',
            type: 'exit',
            icon: '🚪',
            position: { x: 0.37, y: 0.35 },
            region: 'valdria_city',
            discovered: true,
            canFastTravel: false,
            description: 'Gate leading to Elderwood',
            connectsTo: 'elderwood'
        },
        {
            id: 'east_gate',
            name: 'East Gate',
            type: 'exit',
            icon: '🚪',
            position: { x: 0.48, y: 0.45 },
            region: 'valdria_city',
            discovered: true,
            canFastTravel: false,
            description: 'Gate leading to Frostpeak',
            connectsTo: 'frostpeak'
        }
    ],

    // Road connections
    roads: [
        { from: { x: 0.37, y: 0.40 }, to: { x: 0.22, y: 0.35 }, discovered: true },  // Valdria to Druid Grove
        { from: { x: 0.40, y: 0.42 }, to: { x: 0.78, y: 0.28 }, discovered: false }, // Valdria to Dwarven Halls
        { from: { x: 0.38, y: 0.48 }, to: { x: 0.70, y: 0.68 }, discovered: false }, // Valdria to Oasis
        { from: { x: 0.32, y: 0.50 }, to: { x: 0.12, y: 0.72 }, discovered: false }  // Valdria to Witch Hut
    ]
};

// ===== POI ICON RENDERER =====

class POIIconRenderer {
    static renderIcon(ctx, poi, x, y, size = 30, isHovered = false) {
        const iconSize = isHovered ? size * 1.2 : size;

        // Draw icon background with glow
        if (poi.discovered) {
            ctx.save();

            // Glow effect for important POIs
            if (isHovered || poi.type === 'quest') {
                ctx.shadowColor = this.getIconColor(poi.type);
                ctx.shadowBlur = isHovered ? 20 : 10;
            }

            // Icon background circle
            ctx.fillStyle = this.getIconBgColor(poi.type);
            ctx.beginPath();
            ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = this.getIconColor(poi.type);
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.shadowBlur = 0;

            // Draw emoji icon
            ctx.font = `${iconSize * 0.6}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(poi.icon, x, y);

            // Draw name label if hovered
            if (isHovered) {
                this.drawLabel(ctx, poi.name, x, y + iconSize);
            }

            // Quest marker (pulsing exclamation)
            if (poi.type === 'quest' && !poi.completed) {
                const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
                ctx.font = 'bold 16px serif';
                ctx.fillText('!', x + iconSize / 2, y - iconSize / 2);
            }

            ctx.restore();
        } else {
            // Undiscovered - show as "?"
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#666';
            ctx.font = `bold ${iconSize * 0.6}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', x, y);
            ctx.restore();
        }
    }

    static drawLabel(ctx, text, x, y) {
        ctx.save();

        // Measure text
        ctx.font = 'bold 14px "Cinzel", serif';
        const metrics = ctx.measureText(text);
        const padding = 8;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(
            x - metrics.width / 2 - padding,
            y,
            metrics.width + padding * 2,
            20
        );

        // Border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x - metrics.width / 2 - padding,
            y,
            metrics.width + padding * 2,
            20
        );

        // Text
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(text, x, y + 2);

        ctx.restore();
    }

    static getIconColor(type) {
        const colors = {
            shop: '#8B7355',
            temple: '#FFD700',
            inn: '#D2691E',
            guild: '#9370DB',
            npc: '#4CAF50',
            danger: '#FF4444',
            quest: '#FFD700',
            exit: '#4A9EFF'
        };
        return colors[type] || '#FFFFFF';
    }

    static getIconBgColor(type) {
        const colors = {
            shop: 'rgba(139, 115, 85, 0.8)',
            temple: 'rgba(255, 215, 0, 0.3)',
            inn: 'rgba(210, 105, 30, 0.6)',
            guild: 'rgba(147, 112, 219, 0.6)',
            npc: 'rgba(76, 175, 80, 0.6)',
            danger: 'rgba(255, 68, 68, 0.6)',
            quest: 'rgba(255, 215, 0, 0.6)',
            exit: 'rgba(74, 158, 255, 0.6)'
        };
        return colors[type] || 'rgba(255, 255, 255, 0.3)';
    }
}

// ===== FOG OF WAR SYSTEM =====

class FogOfWarSystem {
    constructor() {
        this.exploredAreas = new Set(['valdria_city']); // Start with capital discovered
        this.currentRegion = 'valdria_city';
    }

    revealArea(regionId) {
        this.exploredAreas.add(regionId);
        console.log(`[Fog of War] Revealed: ${regionId}`);
    }

    revealPOI(poiId) {
        const poi = WORLD_MAP_DATA.pois.find(p => p.id === poiId);
        if (poi) {
            poi.discovered = true;
            this.revealArea(poi.region);
            console.log(`[Fog of War] Discovered POI: ${poi.name}`);
        }
    }

    isAreaExplored(regionId) {
        return this.exploredAreas.has(regionId);
    }

    renderFog(ctx, width, height) {
        ctx.save();

        // Draw fog over unexplored regions
        WORLD_MAP_DATA.regions.forEach(region => {
            if (!this.isAreaExplored(region.id)) {
                const x = region.bounds.x * width;
                const y = region.bounds.y * height;
                const w = region.bounds.width * width;
                const h = region.bounds.height * height;

                // Dark overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                ctx.fillRect(x, y, w, h);

                // Texture overlay for fog effect
                ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';
                for (let i = 0; i < 20; i++) {
                    const fogX = x + Math.random() * w;
                    const fogY = y + Math.random() * h;
                    const fogSize = Math.random() * 40 + 20;

                    const gradient = ctx.createRadialGradient(
                        fogX, fogY, 0,
                        fogX, fogY, fogSize
                    );
                    gradient.addColorStop(0, 'rgba(100, 100, 100, 0.2)');
                    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(fogX, fogY, fogSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        ctx.restore();
    }

    // Save/load fog state
    saveState() {
        return {
            explored: Array.from(this.exploredAreas),
            current: this.currentRegion
        };
    }

    loadState(state) {
        if (state && state.explored) {
            this.exploredAreas = new Set(state.explored);
            this.currentRegion = state.current || 'valdria_city';
        }
    }
}

// ===== WORLD MAP RENDERER =====

class WorldMapRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Map state
        this.scale = 1.0;
        this.minScale = 0.5;
        this.maxScale = 3.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        // Interaction state
        this.hoveredPOI = null;
        this.selectedPOI = null;

        // Systems
        this.fogOfWar = new FogOfWarSystem();

        // Animation
        this.animationFrame = null;

        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Mouse events for pan and zoom
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        this.canvas.addEventListener('click', this.onClick.bind(this));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.dragStartX = e.clientX - this.offsetX;
        this.dragStartY = e.clientY - this.offsetY;
        this.canvas.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        if (this.isDragging) {
            this.offsetX = e.clientX - this.dragStartX;
            this.offsetY = e.clientY - this.dragStartY;
            this.render();
        } else {
            // Check for POI hover
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.scale;
            const y = (e.clientY - rect.top - this.offsetY) / this.scale;

            const poi = this.getPOIAt(x, y);
            if (poi !== this.hoveredPOI) {
                this.hoveredPOI = poi;
                this.canvas.style.cursor = poi ? 'pointer' : 'grab';
                this.render();
            }
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    onWheel(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * delta));

        // Zoom toward mouse position
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.offsetX = mouseX - (mouseX - this.offsetX) * (newScale / this.scale);
        this.offsetY = mouseY - (mouseY - this.offsetY) * (newScale / this.scale);

        this.scale = newScale;
        this.render();
    }

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offsetX) / this.scale;
        const y = (e.clientY - rect.top - this.offsetY) / this.scale;

        const poi = this.getPOIAt(x, y);
        if (poi && poi.discovered) {
            this.onPOIClick(poi);
        }
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    onTouchMove(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    onTouchEnd() {
        this.onMouseUp();
    }

    getPOIAt(x, y) {
        const hitRadius = 20 / this.scale;

        for (const poi of WORLD_MAP_DATA.pois) {
            const poiX = poi.position.x * this.canvas.width;
            const poiY = poi.position.y * this.canvas.height;

            const distance = Math.sqrt(
                Math.pow(x - poiX, 2) + Math.pow(y - poiY, 2)
            );

            if (distance < hitRadius) {
                return poi;
            }
        }
        return null;
    }

    onPOIClick(poi) {
        console.log('[Map] POI Clicked:', poi);
        this.selectedPOI = poi;

        // Show POI details modal
        this.showPOIDetails(poi);

        // Emit event for game integration
        const event = new CustomEvent('poiSelected', { detail: poi });
        document.dispatchEvent(event);
    }

    showPOIDetails(poi) {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'map-poi-modal';
        modal.innerHTML = `
            <div class="map-poi-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="map-poi-content">
                <div class="map-poi-header">
                    <h3>${poi.icon} ${poi.name}</h3>
                    <button class="map-poi-close" onclick="this.closest('.map-poi-modal').remove()">×</button>
                </div>
                <div class="map-poi-body">
                    <p class="map-poi-description">${poi.description}</p>
                    ${poi.services ? `
                        <div class="map-poi-services">
                            <h4>Services:</h4>
                            <ul>
                                ${poi.services.map(s => `<li>${s.replace('_', ' ')}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${poi.npcName ? `<p><strong>NPC:</strong> ${poi.npcName}</p>` : ''}
                    ${poi.enemyLevel ? `<p class="text-danger"><strong>⚠️ Danger Level:</strong> ${poi.enemyLevel}</p>` : ''}
                </div>
                <div class="map-poi-actions">
                    ${poi.canFastTravel ? `
                        <button class="btn btn-primary" onclick="fastTravelTo('${poi.id}')">
                            🚀 Fast Travel (50g)
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="this.closest('.map-poi-modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context
        ctx.save();

        // Apply transformations
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);

        // Draw map background (parchment texture)
        this.drawBackground(ctx, width, height);

        // Draw regions
        this.drawRegions(ctx, width, height);

        // Draw roads
        this.drawRoads(ctx, width, height);

        // Draw POIs
        this.drawPOIs(ctx, width, height);

        // Draw player position
        this.drawPlayerMarker(ctx, width, height);

        ctx.restore();

        // Draw fog of war (after restore, so it's not scaled)
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);
        this.fogOfWar.renderFog(ctx, width, height);
        ctx.restore();

        // Draw UI overlays (zoom level, legend)
        this.drawUIOverlays(ctx, width, height);
    }

    drawBackground(ctx, width, height) {
        // Parchment texture
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#E8D7B5');
        gradient.addColorStop(0.5, '#D4C4A0');
        gradient.addColorStop(1, '#C0B090');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add texture noise
        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }

        // Border
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, width, height);
    }

    drawRegions(ctx, width, height) {
        WORLD_MAP_DATA.regions.forEach(region => {
            const x = region.bounds.x * width;
            const y = region.bounds.y * height;
            const w = region.bounds.width * width;
            const h = region.bounds.height * height;

            // Only draw if explored
            if (this.fogOfWar.isAreaExplored(region.id)) {
                // Region fill
                ctx.fillStyle = `${region.color}33`; // 20% opacity
                ctx.fillRect(x, y, w, h);

                // Region border (dashed)
                ctx.strokeStyle = region.color;
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 5]);
                ctx.strokeRect(x, y, w, h);
                ctx.setLineDash([]);

                // Region name
                ctx.fillStyle = region.color;
                ctx.font = 'italic bold 20px "Cinzel", serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(region.name, x + w / 2, y + 20);
            }
        });
    }

    drawRoads(ctx, width, height) {
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);

        WORLD_MAP_DATA.roads.forEach(road => {
            if (road.discovered) {
                ctx.beginPath();
                ctx.moveTo(road.from.x * width, road.from.y * height);
                ctx.lineTo(road.to.x * width, road.to.y * height);
                ctx.stroke();
            }
        });

        ctx.setLineDash([]);
    }

    drawPOIs(ctx, width, height) {
        WORLD_MAP_DATA.pois.forEach(poi => {
            const x = poi.position.x * width;
            const y = poi.position.y * height;

            const isHovered = this.hoveredPOI === poi;
            POIIconRenderer.renderIcon(ctx, poi, x, y, 30, isHovered);
        });
    }

    drawPlayerMarker(ctx, width, height) {
        // Assume player is in Valdria city center
        const playerX = 0.37 * width;
        const playerY = 0.45 * height;

        // Pulsing glow
        const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;

        ctx.save();
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 20 * pulse;

        // Player marker (green circle)
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 10, 0, Math.PI * 2);
        ctx.fill();

        // White border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow pointing
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('▼', playerX, playerY);

        ctx.restore();
    }

    drawUIOverlays(ctx, width, height) {
        // Zoom level indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, height - 40, 150, 30);

        ctx.fillStyle = '#FFD700';
        ctx.font = '14px "Cinzel", serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Zoom: ${Math.round(this.scale * 100)}%`, 20, height - 25);
    }

    // API Methods
    zoomIn() {
        this.scale = Math.min(this.maxScale, this.scale * 1.2);
        this.render();
    }

    zoomOut() {
        this.scale = Math.max(this.minScale, this.scale / 1.2);
        this.render();
    }

    resetView() {
        this.scale = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.render();
    }

    centerOnPOI(poiId) {
        const poi = WORLD_MAP_DATA.pois.find(p => p.id === poiId);
        if (poi) {
            const targetX = poi.position.x * this.canvas.width;
            const targetY = poi.position.y * this.canvas.height;

            this.offsetX = this.canvas.width / 2 - targetX * this.scale;
            this.offsetY = this.canvas.height / 2 - targetY * this.scale;
            this.render();
        }
    }

    revealArea(regionId) {
        this.fogOfWar.revealArea(regionId);
        this.render();
    }

    revealPOI(poiId) {
        this.fogOfWar.revealPOI(poiId);
        this.render();
    }
}

// ===== MINIMAP COMPONENT =====

class Minimap {
    constructor(canvasId, parentMap) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.parentMap = parentMap;

        this.render();
    }

    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);

        // Draw simplified regions
        WORLD_MAP_DATA.regions.forEach(region => {
            if (this.parentMap.fogOfWar.isAreaExplored(region.id)) {
                const x = region.bounds.x * width;
                const y = region.bounds.y * height;
                const w = region.bounds.width * width;
                const h = region.bounds.height * height;

                ctx.fillStyle = `${region.color}80`;
                ctx.fillRect(x, y, w, h);
            }
        });

        // Draw player position
        const playerX = 0.37 * width;
        const playerY = 0.45 * height;

        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw viewport rectangle
        const viewportScale = 0.3; // Represents current zoom level
        const viewportW = width * viewportScale;
        const viewportH = height * viewportScale;
        const viewportX = playerX - viewportW / 2;
        const viewportY = playerY - viewportH / 2;

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);
    }
}

// ===== INITIALIZATION =====

let worldMapInstance = null;
let minimapInstance = null;

function initializeWorldMap() {
    // Create map canvas if it doesn't exist
    let mapCanvas = document.getElementById('world-map-canvas');
    if (!mapCanvas) {
        console.warn('[World Map] Canvas not found, map system not initialized');
        return;
    }

    // Initialize world map
    worldMapInstance = new WorldMapRenderer('world-map-canvas');

    // Initialize minimap if element exists
    const minimapCanvas = document.getElementById('minimap-canvas');
    if (minimapCanvas) {
        minimapInstance = new Minimap('minimap-canvas', worldMapInstance);
    }

    console.log('[World Map] System initialized');
}

// Fast travel function (called from POI modal)
function fastTravelTo(poiId) {
    const poi = WORLD_MAP_DATA.pois.find(p => p.id === poiId);
    if (!poi || !poi.canFastTravel) {
        alert('Cannot fast travel to this location');
        return;
    }

    // Check if player has enough gold
    const cost = 50;
    // TODO: Integrate with actual game state

    console.log(`[Fast Travel] Traveling to ${poi.name} (Cost: ${cost}g)`);

    // Emit event for game integration
    const event = new CustomEvent('fastTravel', {
        detail: { poi, cost }
    });
    document.dispatchEvent(event);

    // Close modal
    document.querySelector('.map-poi-modal')?.remove();

    // Center map on destination
    if (worldMapInstance) {
        worldMapInstance.centerOnPOI(poiId);
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWorldMap);
} else {
    initializeWorldMap();
}

// Export for global access
window.WorldMapSystem = {
    map: worldMapInstance,
    minimap: minimapInstance,
    data: WORLD_MAP_DATA,
    POIIconRenderer,
    FogOfWarSystem
};
