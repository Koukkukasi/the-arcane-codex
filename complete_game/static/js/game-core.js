
    // ===================================
    // COMPLETELY NEW FANTASY MAP SYSTEM
    // ===================================
    const fantasyMapSystem = {
        // Map Configuration
        canvas: null,
        ctx: null,
        minimapCanvas: null,
        minimapCtx: null,
        tooltip: null,

        // Viewport state
        viewportWidth: 0,
        viewportHeight: 0,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        lastX: 0,
        lastY: 0,

        // Animation
        animationId: null,
        time: 0,

        // Filters
        activeFilter: 'all',

        // World locations with enhanced data - SIMPLIFIED FOR ACCESSIBILITY
        locations: [
            // MAJOR CITIES (Only most important visible by default)
            {
                id: 'valdria',
                name: 'Valdria',
                type: 'city',
                x: 0.5, y: 0.5, // Central position
                icon: '🏰',
                color: '#D4AF37',
                description: 'The grand capital city',
                discovered: true,
                visited: true,
                current: true,
                priority: 1, // High priority - always visible
                connections: ['warehouse', 'trading_post', 'northgate', 'eastport', 'westkeep']
            },
            {
                id: 'northgate',
                name: 'Northgate Keep',
                type: 'city',
                x: 0.5, y: 0.25,
                icon: '🏰',
                color: '#D4AF37',
                description: 'Northern fortress city',
                discovered: true,
                visited: false,
                priority: 2, // Medium priority - visible at medium zoom
                connections: ['valdria', 'mountains', 'frostholm', 'crystal_mine']
            },
            {
                id: 'eastport',
                name: 'Eastport Harbor',
                type: 'city',
                x: 0.75, y: 0.45,
                icon: '🏰',
                color: '#4A90E2',
                description: 'Major trading port',
                discovered: true,
                visited: true,
                priority: 2, // Medium priority
                connections: ['valdria', 'lighthouse', 'market', 'forest']
            },
            {
                id: 'westkeep',
                name: 'Westkeep Citadel',
                type: 'city',
                x: 0.25, y: 0.4,
                icon: '🏰',
                color: '#8B4513',
                description: 'Western military stronghold',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed in
                connections: ['valdria', 'village', 'iron_mine', 'battlefield']
            },
            {
                id: 'frostholm',
                name: 'Frostholm',
                type: 'city',
                x: 0.35, y: 0.15,
                icon: '🏰',
                color: '#87CEEB',
                description: 'Snow-covered northern town',
                discovered: true,
                visited: false,
                priority: 3, // Low priority
                connections: ['northgate', 'ice_caves', 'mountains']
            },

            // QUEST OBJECTIVES (High priority - always visible)
            {
                id: 'warehouse',
                name: "Duke's Warehouse",
                type: 'quest',
                x: 0.58, y: 0.48,
                icon: '⭐',
                color: '#FFD700',
                description: 'Current quest: Investigate warehouse',
                discovered: true,
                visited: false,
                quest: true,
                priority: 1, // High priority - quest location
                connections: ['valdria', 'forest', 'abandoned_mill']
            },
            {
                id: 'abandoned_mill',
                name: 'Abandoned Mill',
                type: 'quest',
                x: 0.62, y: 0.38,
                icon: '⭐',
                color: '#FFD700',
                description: 'Quest: Find missing villagers',
                discovered: true,
                visited: false,
                quest: true,
                priority: 1, // High priority - quest location
                connections: ['warehouse', 'eastport']
            },
            {
                id: 'lighthouse',
                name: 'Haunted Lighthouse',
                type: 'quest',
                x: 0.85, y: 0.35,
                icon: '⭐',
                color: '#FF6B6B',
                description: 'Quest: Stop the ghost ship',
                discovered: true,
                visited: false,
                quest: true,
                priority: 2, // Medium priority - secondary quest
                connections: ['eastport', 'ruins']
            },

            // SHOPS & TRADING POSTS (Low priority - visible when zoomed in)
            {
                id: 'trading_post',
                name: 'Southern Trading Post',
                type: 'shop',
                x: 0.45, y: 0.65,
                icon: '🏪',
                color: '#8B7355',
                description: 'General goods and supplies',
                discovered: true,
                visited: true,
                priority: 2, // Medium priority - visited location
                connections: ['valdria', 'village', 'crossroads']
            },
            {
                id: 'market',
                name: 'Grand Bazaar',
                type: 'shop',
                x: 0.68, y: 0.52,
                icon: '🏪',
                color: '#FFB347',
                description: 'Exotic items and rare artifacts',
                discovered: true,
                visited: false,
                priority: 3, // Low priority
                connections: ['eastport', 'valdria', 'forest']
            },
            {
                id: 'crossroads',
                name: 'Crossroads Inn',
                type: 'shop',
                x: 0.4, y: 0.55,
                icon: '🏪',
                color: '#8B4513',
                description: 'Rest and resupply point',
                discovered: true,
                visited: true,
                priority: 3, // Low priority
                connections: ['trading_post', 'valdria', 'westkeep']
            },

            // DUNGEONS & DANGEROUS AREAS (Mix of discovered/undiscovered)
            {
                id: 'forest',
                name: 'Forest of Whispers',
                type: 'dungeon',
                x: 0.72, y: 0.58,
                icon: '🌲',
                color: '#4A6741',
                description: 'Ancient dark forest - Level 5-8',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['warehouse', 'ruins', 'market', 'spider_cave']
            },
            {
                id: 'ruins',
                name: 'Ancient Ruins',
                type: 'dungeon',
                x: 0.82, y: 0.28,
                icon: '⚔️',
                color: '#CD5C5C',
                description: 'Forgotten temple - Level 10-15',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['forest', 'mountains', 'lighthouse']
            },
            {
                id: 'mountains',
                name: "Dragon's Peak",
                type: 'dungeon',
                x: 0.65, y: 0.15,
                icon: '⛰️',
                color: '#6B5745',
                description: 'Dragon lair - Level 15-20',
                discovered: false,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['northgate', 'ruins', 'frostholm']
            },
            {
                id: 'spider_cave',
                name: 'Spider Cave',
                type: 'dungeon',
                x: 0.78, y: 0.65,
                icon: '⚔️',
                color: '#4B0082',
                description: 'Giant spider nest - Level 3-5',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['forest', 'swamp']
            },
            {
                id: 'ice_caves',
                name: 'Frozen Caverns',
                type: 'dungeon',
                x: 0.3, y: 0.08,
                icon: '⚔️',
                color: '#00CED1',
                description: 'Ice elemental domain - Level 8-12',
                discovered: false,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['frostholm']
            },

            // VILLAGES & SETTLEMENTS (All discovered)
            {
                id: 'village',
                name: 'Riverside Village',
                type: 'city',
                x: 0.3, y: 0.58,
                icon: '🏘️',
                color: '#4A90E2',
                description: 'Peaceful fishing village',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['trading_post', 'westkeep', 'farm']
            },
            {
                id: 'farm',
                name: 'Greenhill Farm',
                type: 'city',
                x: 0.35, y: 0.7,
                icon: '🏘️',
                color: '#90EE90',
                description: 'Agricultural settlement',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['village', 'trading_post']
            },

            // SPECIAL LOCATIONS & LANDMARKS (Mix of discovered/undiscovered)
            {
                id: 'crystal_mine',
                name: 'Crystal Mine',
                type: 'dungeon',
                x: 0.55, y: 0.32,
                icon: '💎',
                color: '#9370DB',
                description: 'Magical crystal deposits',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['northgate', 'valdria']
            },
            {
                id: 'iron_mine',
                name: 'Iron Mine',
                type: 'dungeon',
                x: 0.18, y: 0.35,
                icon: '⛏️',
                color: '#696969',
                description: 'Dwarven mining operation',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['westkeep']
            },
            {
                id: 'battlefield',
                name: 'Ancient Battlefield',
                type: 'dungeon',
                x: 0.15, y: 0.48,
                icon: '⚔️',
                color: '#8B0000',
                description: 'Haunted war grounds',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['westkeep']
            },
            {
                id: 'swamp',
                name: 'Murky Swamp',
                type: 'dungeon',
                x: 0.85, y: 0.72,
                icon: '🌲',
                color: '#556B2F',
                description: 'Toxic marshlands - Level 6-9',
                discovered: false,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['spider_cave']
            },
            {
                id: 'tower',
                name: "Wizard's Tower",
                type: 'quest',
                x: 0.42, y: 0.35,
                icon: '🏛️',
                color: '#9932CC',
                description: 'Mysterious magical tower',
                discovered: true,
                visited: false,
                priority: 3, // Low priority - only visible when zoomed
                connections: ['valdria', 'crystal_mine']
            }
        ],

        // Initialize the new fantasy map system
        init() {
            console.log('Initializing Fantasy Map System...');

            this.canvas = document.getElementById('world-map-canvas');
            this.minimapCanvas = document.getElementById('minimap-canvas');
            this.tooltip = document.querySelector('.location-tooltip');

            if (!this.canvas || !this.minimapCanvas) {
                console.error('Canvas elements not found');
                return;
            }

            this.ctx = this.canvas.getContext('2d');
            this.minimapCtx = this.minimapCanvas.getContext('2d');

            // Setup canvas dimensions
            this.resizeCanvas();

            // Setup event listeners
            this.setupEventListeners();

            // Set initial view - centered on Valdria with zoom
            this.scale = 1.2;  // Initial zoom to show detail
            this.offsetX = -100;  // Center adjustment
            this.offsetY = -50;   // Center adjustment

            // Start animation loop
            this.startAnimation();

            // Initial render
            this.render();
        },

        // Resize canvas to fill viewport
        resizeCanvas() {
            // Get the actual viewport dimensions
            const viewport = this.canvas.parentElement;
            const rect = viewport.getBoundingClientRect();

            this.viewportWidth = Math.max(800, rect.width || window.innerWidth);
            this.viewportHeight = Math.max(600, rect.height || window.innerHeight);

            // Set canvas dimensions
            this.canvas.width = this.viewportWidth;
            this.canvas.height = this.viewportHeight;

            // Ensure canvas fills its container
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';

            // Setup minimap
            this.minimapCanvas.width = 200;
            this.minimapCanvas.height = 150;

            console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height}`);
        },

        // Setup event listeners
        setupEventListeners() {
            // Canvas interactions
            this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
            this.canvas.addEventListener('mouseup', () => this.onMouseUp());
            this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
            this.canvas.addEventListener('wheel', (e) => this.onWheel(e));

            // Filter buttons
            document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.activeFilter = btn.dataset.filter;
                    this.render();
                });
            });

            // Zoom controls
            document.getElementById('zoom-in')?.addEventListener('click', () => {
                this.scale = Math.min(this.scale * 1.2, 3);
                this.render();
            });

            document.getElementById('zoom-out')?.addEventListener('click', () => {
                this.scale = Math.max(this.scale / 1.2, 0.5);
                this.render();
            });

            document.getElementById('reset-zoom')?.addEventListener('click', () => {
                this.scale = 1;
                this.offsetX = 0;
                this.offsetY = 0;
                this.render();
            });

            // Window resize
            window.addEventListener('resize', () => this.resizeCanvas());
        },

        // Mouse event handlers
        onMouseDown(e) {
            // Check if clicking on a quest location first
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.scale - this.offsetX;
            const y = (e.clientY - rect.top) / this.scale - this.offsetY;

            const clickedLocation = this.getLocationAt(x, y);
            if (clickedLocation && clickedLocation.type === 'quest') {
                // Check if quest map system is loaded
                if (window.questMapRenderer && window.questMaps && window.questMaps[clickedLocation.id]) {
                    window.questMapRenderer.open(clickedLocation.id);
                    return; // Don't start dragging if clicking a quest
                }
            }

            // Normal drag behavior
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        },

        onMouseMove(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.isDragging) {
                const dx = e.clientX - this.lastX;
                const dy = e.clientY - this.lastY;
                this.offsetX += dx;
                this.offsetY += dy;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                this.render();
            } else {
                // Check for location hover
                const hoveredLoc = this.getLocationAt(x, y);
                if (hoveredLoc) {
                    this.canvas.style.cursor = 'pointer';
                    this.showTooltip(hoveredLoc, x, y);
                } else {
                    this.canvas.style.cursor = 'grab';
                    this.hideTooltip();
                }
            }
        },

        onMouseUp() {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        },

        onWheel(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = this.scale * delta;

            if (newScale >= 0.5 && newScale <= 3) {
                this.scale = newScale;
                this.render();
            }
        },

        // Get location at coordinates
        getLocationAt(x, y) {
            for (const loc of this.locations) {
                if (!this.shouldShowLocation(loc)) continue;

                const locX = loc.x * this.viewportWidth * this.scale + this.offsetX;
                const locY = loc.y * this.viewportHeight * this.scale + this.offsetY;
                const dist = Math.sqrt((x - locX) ** 2 + (y - locY) ** 2);

                if (dist < 25 * this.scale) {
                    return loc;
                }
            }
            return null;
        },

        // Tooltip management
        showTooltip(location, x, y) {
            if (this.tooltip) {
                this.tooltip.textContent = `${location.name} - ${location.description}`;
                this.tooltip.style.left = x + 'px';
                this.tooltip.style.top = (y - 30) + 'px';
                this.tooltip.classList.add('visible');
            }
        },

        hideTooltip() {
            if (this.tooltip) {
                this.tooltip.classList.remove('visible');
            }
        },

        // Check if location should be shown - SIMPLIFIED FOR ACCESSIBILITY
        shouldShowLocation(loc) {
            // Never show undiscovered locations
            if (!loc.discovered) return false;

            // Apply filter first
            if (this.activeFilter && this.activeFilter !== 'all') {
                if (this.activeFilter === 'cities' && loc.type !== 'city') return false;
                if (this.activeFilter === 'quests' && !loc.quest) return false;
                if (this.activeFilter === 'shops' && loc.type !== 'shop') return false;
                if (this.activeFilter === 'dungeons' && loc.type !== 'dungeon') return false;
            }

            // Priority-based visibility (for reducing clutter)
            const priority = loc.priority || 3; // Default to low priority

            // At default zoom (1.0-1.2), show only high priority locations
            if (this.scale <= 1.2) {
                return priority === 1; // Only show priority 1 (8-10 locations)
            }
            // At medium zoom (1.2-2.0), show high and medium priority
            else if (this.scale <= 2.0) {
                return priority <= 2; // Show priority 1 and 2
            }
            // At high zoom (>2.0), show all locations
            else {
                return true; // Show all discovered locations
            }
        },

        // Main render method
        render() {
            const ctx = this.ctx;
            const width = this.canvas.width;
            const height = this.canvas.height;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw parchment background
            this.drawParchmentBackground(ctx, width, height);

            // Apply transformations
            ctx.save();
            ctx.translate(this.offsetX, this.offsetY);
            ctx.scale(this.scale, this.scale);

            // Draw map elements
            this.drawTerrain(ctx, width, height);
            this.drawPaths(ctx, width, height);
            this.drawLocations(ctx, width, height);
            this.drawFogOfWar(ctx, width, height);

            ctx.restore();

            // Draw minimap
            this.renderMinimap();
        },

        // Draw beautiful parchment background with enhanced details
        drawParchmentBackground(ctx, width, height) {
            // Create gradient background
            const gradient = ctx.createRadialGradient(
                width/2, height/2, 0,
                width/2, height/2, Math.max(width, height) * 0.8
            );
            gradient.addColorStop(0, '#F4E9DC');
            gradient.addColorStop(0.3, '#E8D7C3');
            gradient.addColorStop(0.6, '#D4C4B0');
            gradient.addColorStop(0.9, '#C8B49C');
            gradient.addColorStop(1, '#B8A08C');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Add grid lines for map feel
            ctx.strokeStyle = 'rgba(139, 115, 85, 0.1)';
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Add parchment texture and aging spots
            ctx.globalAlpha = 0.15;
            for (let i = 0; i < 40; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const r = Math.random() * 60 + 20;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, 'rgba(139, 115, 85, 0.3)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw decorative border frame
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 8;
            ctx.strokeRect(10, 10, width - 20, height - 20);

            // Inner border
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, width - 40, height - 40);

            // Draw compass rose in corner
            this.drawCompass(ctx, width - 120, height - 120, 40);

            ctx.globalAlpha = 1;
        },

        // Draw decorative compass rose
        drawCompass(ctx, x, y, size) {
            ctx.save();
            ctx.translate(x, y);

            // Outer circle
            ctx.strokeStyle = '#8B7355';
            ctx.fillStyle = 'rgba(244, 233, 220, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // N, S, E, W points
            const directions = ['N', 'E', 'S', 'W'];
            const angles = [0, Math.PI/2, Math.PI, Math.PI * 1.5];

            ctx.fillStyle = '#8B7355';
            ctx.font = `bold ${size/3}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            directions.forEach((dir, i) => {
                const angle = angles[i];
                const px = Math.sin(angle) * (size * 0.7);
                const py = -Math.cos(angle) * (size * 0.7);
                ctx.fillText(dir, px, py);
            });

            // Center decoration
            ctx.fillStyle = '#D4AF37';
            ctx.beginPath();
            ctx.arc(0, 0, size/5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        // Draw terrain features - SIMPLIFIED for less visual clutter
        drawTerrain(ctx, width, height) {
            ctx.globalAlpha = 0.1; // Even more subtle

            // Fewer, simpler mountain ranges
            ctx.fillStyle = 'rgba(107, 87, 69, 0.5)';
            const mountainCoords = [
                [0.65, 0.15, 60],
                [0.35, 0.10, 50],
                [0.82, 0.25, 45]
            ];
            mountainCoords.forEach(([x, y, size]) => {
                this.drawMountain(ctx, x * width, y * height, size * this.scale);
            });

            // Fewer, simpler forests
            ctx.fillStyle = 'rgba(74, 103, 65, 0.3)'; // More transparent
            const forestCoords = [
                [0.72, 0.58, 70],
                [0.15, 0.45, 50],
                [0.35, 0.65, 40]
            ];
            forestCoords.forEach(([x, y, size]) => {
                this.drawForest(ctx, x * width, y * height, size * this.scale);
            });

            // Main river system
            ctx.strokeStyle = '#4A90E2';
            ctx.lineWidth = 4 * this.scale;
            ctx.globalAlpha = 0.3;

            // Main river
            ctx.beginPath();
            ctx.moveTo(0.15 * width, 0.2 * height);
            ctx.bezierCurveTo(
                0.25 * width, 0.35 * height,
                0.35 * width, 0.50 * height,
                0.45 * width, 0.75 * height
            );
            ctx.stroke();

            // Tributary
            ctx.lineWidth = 3 * this.scale;
            ctx.beginPath();
            ctx.moveTo(0.35 * width, 0.50 * height);
            ctx.quadraticCurveTo(0.45 * width, 0.55 * height, 0.55 * width, 0.60 * height);
            ctx.stroke();

            // Lakes
            ctx.fillStyle = 'rgba(74, 144, 226, 0.2)';
            ctx.beginPath();
            ctx.arc(0.25 * width, 0.65 * height, 30 * this.scale, 0, Math.PI * 2);
            ctx.fill();

            // Hills
            ctx.fillStyle = 'rgba(139, 115, 85, 0.15)';
            const hillCoords = [
                [0.45, 0.40, 40],
                [0.48, 0.42, 35],
                [0.55, 0.35, 38],
                [0.30, 0.30, 35]
            ];
            hillCoords.forEach(([x, y, size]) => {
                ctx.beginPath();
                ctx.arc(x * width, y * height, size * this.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalAlpha = 1;
        },

        drawMountain(ctx, x, y, size) {
            ctx.beginPath();
            ctx.moveTo(x - size, y + size);
            ctx.lineTo(x, y - size);
            ctx.lineTo(x + size, y + size);
            ctx.closePath();
            ctx.fill();
        },

        drawForest(ctx, x, y, radius) {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(74, 103, 65, 0.4)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        },

        // Draw paths between locations - ENHANCED with different path types
        drawPaths(ctx, width, height) {
            // Draw all discovered paths first (main roads)
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 4 * this.scale;
            ctx.globalAlpha = 0.4;
            ctx.setLineDash([]);

            // Main roads between cities
            const cityConnections = [
                ['valdria', 'northgate'],
                ['valdria', 'eastport'],
                ['valdria', 'westkeep'],
                ['valdria', 'trading_post']
            ];

            cityConnections.forEach(([fromId, toId]) => {
                const from = this.locations.find(l => l.id === fromId);
                const to = this.locations.find(l => l.id === toId);
                if (from && to && from.discovered && to.discovered) {
                    ctx.strokeStyle = '#8B7355';
                    ctx.lineWidth = 5 * this.scale;
                    ctx.beginPath();
                    ctx.moveTo(from.x * width, from.y * height);
                    ctx.lineTo(to.x * width, to.y * height);
                    ctx.stroke();
                }
            });

            // Secondary paths (dotted)
            ctx.strokeStyle = '#A0826D';
            ctx.lineWidth = 3 * this.scale;
            ctx.globalAlpha = 0.3;
            ctx.setLineDash([8, 4]);

            this.locations.forEach(loc => {
                if (loc.discovered && loc.connections) {
                    loc.connections.forEach(connectionId => {
                        const target = this.locations.find(l => l.id === connectionId);
                        if (target && target.discovered) {
                            // Skip if already drawn as main road
                            const isMainRoad = cityConnections.some(([from, to]) =>
                                (from === loc.id && to === target.id) ||
                                (to === loc.id && from === target.id)
                            );

                            if (!isMainRoad) {
                                ctx.beginPath();
                                ctx.moveTo(loc.x * width, loc.y * height);
                                ctx.lineTo(target.x * width, target.y * height);
                                ctx.stroke();
                            }
                        }
                    });
                }
            });

            ctx.setLineDash([]);
            ctx.globalAlpha = 1;

            // Animated quest paths (golden glow)
            const current = this.locations.find(l => l.current);
            const quests = this.locations.filter(l => l.quest);

            quests.forEach(quest => {
                if (current && quest) {
                    const gradient = ctx.createLinearGradient(
                        current.x * width, current.y * height,
                        quest.x * width, quest.y * height
                    );
                    const offset = (this.time % 100) / 100;
                    gradient.addColorStop(Math.max(0, offset - 0.2), 'transparent');
                    gradient.addColorStop(offset, '#FFD700');
                    gradient.addColorStop(Math.min(1, offset + 0.2), 'transparent');

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 6 * this.scale;
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.moveTo(current.x * width, current.y * height);
                    ctx.lineTo(quest.x * width, quest.y * height);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            });
        },

        // Draw locations - ENHANCED with larger markers and visible names
        drawLocations(ctx, width, height) {
            this.locations.forEach(loc => {
                if (!this.shouldShowLocation(loc)) return;

                const x = loc.x * width;
                const y = loc.y * height;

                ctx.save();
                ctx.translate(x, y);

                // Subtle shadow for depth
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Smaller, less overwhelming markers
                const markerSize = 20 * this.scale; // Reduced from 35
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, markerSize);

                // Calmer colors based on priority
                const locPriority = loc.priority || 3;
                if (locPriority === 1 && loc.quest) {
                    // Quest markers - still bright but smaller
                    gradient.addColorStop(0, '#FFD700');
                    gradient.addColorStop(1, '#D4AF37');
                } else if (locPriority === 1) {
                    // Current location - subtle highlight
                    gradient.addColorStop(0, '#B8A68C');
                    gradient.addColorStop(1, '#8B7355');
                } else {
                    // Other locations - very muted
                    gradient.addColorStop(0, 'rgba(139, 115, 85, 0.6)');
                    gradient.addColorStop(1, 'rgba(107, 87, 69, 0.4)');
                }

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, markerSize, 0, Math.PI * 2);
                ctx.fill();

                // Decorative border
                ctx.shadowBlur = 0;
                ctx.strokeStyle = loc.current ? '#FFD700' : loc.color;
                ctx.lineWidth = (loc.current ? 5 : 3) * this.scale;
                ctx.stroke();

                // Inner circle for icon background
                ctx.fillStyle = 'rgba(244, 233, 220, 0.9)';
                ctx.beginPath();
                ctx.arc(0, 0, markerSize * 0.7, 0, Math.PI * 2);
                ctx.fill();

                // Smaller, less overwhelming icon
                ctx.font = `bold ${18 * this.scale}px serif`; // Reduced from 30
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(26, 22, 18, 0.8)'; // Slightly transparent
                ctx.fillText(loc.icon, 0, 0);

                // Quest pulse effect - more prominent
                if (loc.quest && locPriority === 1) {
                    const pulseScale = 1 + Math.sin(this.time / 30) * 0.3;
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
                    ctx.lineWidth = 4 * this.scale;
                    ctx.setLineDash([5, 3]);
                    ctx.beginPath();
                    ctx.arc(0, 0, markerSize * 1.3 * pulseScale, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Quest star decoration
                    ctx.fillStyle = '#FFD700';
                    for (let i = 0; i < 4; i++) {
                        const angle = (Math.PI / 2) * i + this.time / 50;
                        const starX = Math.cos(angle) * markerSize * 1.5;
                        const starY = Math.sin(angle) * markerSize * 1.5;
                        ctx.beginPath();
                        ctx.arc(starX, starY, 3 * this.scale, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Current location indicator
                if (loc.current) {
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 2 * this.scale;
                    ctx.setLineDash([5, 3]);
                    ctx.beginPath();
                    ctx.arc(0, 0, markerSize * 1.4, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                ctx.restore();

                // Draw location name below marker (only for high priority or when zoomed)
                const namePriority = loc.priority || 3;
                const showName = (namePriority === 1) || (this.scale > 1.5);

                if (loc.discovered && showName) {
                    ctx.save();
                    ctx.translate(x, y + markerSize + 20 * this.scale); // Reduced spacing

                    // Name background
                    const textMetrics = ctx.measureText(loc.name);
                    const textWidth = textMetrics.width;
                    const padding = 8 * this.scale;

                    ctx.fillStyle = 'rgba(244, 233, 220, 0.9)';
                    ctx.strokeStyle = '#8B7355';
                    ctx.lineWidth = 1.5 * this.scale;

                    // Draw rounded rectangle (compatible version)
                    const rx = -textWidth/2 - padding;
                    const ry = -12 * this.scale;
                    const rw = textWidth + padding * 2;
                    const rh = 24 * this.scale;
                    const radius = 4 * this.scale;

                    ctx.beginPath();
                    ctx.moveTo(rx + radius, ry);
                    ctx.lineTo(rx + rw - radius, ry);
                    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
                    ctx.lineTo(rx + rw, ry + rh - radius);
                    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
                    ctx.lineTo(rx + radius, ry + rh);
                    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
                    ctx.lineTo(rx, ry + radius);
                    ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
                    ctx.closePath();

                    ctx.fill();
                    ctx.stroke();

                    // Location name text
                    ctx.font = `bold ${14 * this.scale}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#1a1612';
                    ctx.fillText(loc.name, 0, 0);

                    // Level indicator for dungeons
                    if (loc.type === 'dungeon' && loc.description.includes('Level')) {
                        ctx.font = `${11 * this.scale}px serif`;
                        ctx.fillStyle = '#CD5C5C';
                        ctx.fillText(loc.description.match(/Level \d+-\d+/)?.[0] || '', 0, 14 * this.scale);
                    }

                    ctx.restore();
                }
            });
        },

        // Draw fog of war - REDUCED to show more content
        drawFogOfWar(ctx, width, height) {
            // Only apply light fog to undiscovered areas
            ctx.globalAlpha = 0.3;  // Much lighter fog

            this.locations.forEach(loc => {
                if (!loc.discovered) {
                    const gradient = ctx.createRadialGradient(
                        loc.x * width, loc.y * height, 10,
                        loc.x * width, loc.y * height, 60
                    );
                    gradient.addColorStop(0, 'rgba(26, 22, 18, 0.6)');
                    gradient.addColorStop(0.5, 'rgba(26, 22, 18, 0.3)');
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(loc.x * width, loc.y * height, 60, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw question mark for undiscovered locations
                    ctx.save();
                    ctx.translate(loc.x * width, loc.y * height);
                    ctx.font = `bold ${25 * this.scale}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'rgba(139, 115, 85, 0.5)';
                    ctx.fillText('?', 0, 0);
                    ctx.restore();
                }
            });

            // Add slight overall fog at edges for atmosphere
            const edgeGradient = ctx.createRadialGradient(
                width/2, height/2, Math.min(width, height) * 0.3,
                width/2, height/2, Math.max(width, height) * 0.7
            );
            edgeGradient.addColorStop(0, 'transparent');
            edgeGradient.addColorStop(0.7, 'transparent');
            edgeGradient.addColorStop(1, 'rgba(26, 22, 18, 0.2)');
            ctx.fillStyle = edgeGradient;
            ctx.fillRect(0, 0, width, height);

            ctx.globalAlpha = 1;
        },

        // Render minimap
        renderMinimap() {
            const ctx = this.minimapCtx;
            const canvas = this.minimapCanvas;

            if (!ctx || !canvas) return;

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background
            ctx.fillStyle = 'rgba(26, 22, 18, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw locations
            this.locations.forEach(loc => {
                if (!loc.discovered) return;

                const x = loc.x * canvas.width;
                const y = loc.y * canvas.height;

                // Dot color based on type
                ctx.fillStyle = loc.current ? '#FFD700' :
                               loc.quest ? '#FF6B6B' :
                               loc.visited ? '#D4AF37' : '#8B7355';

                ctx.beginPath();
                ctx.arc(x, y, loc.current ? 4 : 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // Viewport indicator
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.setLineDash([3, 2]);

            const viewX = (-this.offsetX / this.scale + canvas.width/2) / this.viewportWidth * canvas.width;
            const viewY = (-this.offsetY / this.scale + canvas.height/2) / this.viewportHeight * canvas.height;
            const viewW = (canvas.width / this.scale) / this.viewportWidth * canvas.width;
            const viewH = (canvas.height / this.scale) / this.viewportHeight * canvas.height;

            ctx.strokeRect(viewX - viewW/2, viewY - viewH/2, viewW, viewH);
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        },

        // Start animation loop
        startAnimation() {
            const animate = () => {
                this.time++;
                if (document.getElementById('map-overlay')?.classList.contains('active')) {
                    this.render();
                    if (this.time % 10 === 0) {
                        this.renderMinimap();
                    }
                }
                this.animationId = requestAnimationFrame(animate);
            };
            animate();
        }
    };


                                // === Retention System (Phase B) ===
        let currentXP; // Declare here to avoid redeclaration in duplicate blocks
        let tutorialSteps; // Declare here to avoid redeclaration in duplicate blocks
        let claimButton; // Declare here to avoid redeclaration in duplicate blocks
        let currentStep; // Declare here to avoid redeclaration in duplicate blocks
        let GameUX; // Declare here to avoid redeclaration in duplicate blocks
        let ftueProgress; // Declare here to avoid redeclaration in duplicate blocks
        let gameUX; // Declare here to avoid redeclaration in duplicate blocks
        let startBtn; // Declare here to avoid redeclaration in duplicate blocks
        let tutorialNextBtn; // Declare here to avoid redeclaration in duplicate blocks
        let tutorialSkipBtn; // Declare here to avoid redeclaration in duplicate blocks
        // Simulate achievement unlock
        setTimeout(() => {
            const achievementPopup = document.querySelector('.achievement-popup');
            if (achievementPopup) {
                achievementPopup.classList.add('show');

                // Play sound effect (in real implementation)
                // playSound('achievement.mp3');

                setTimeout(() => {
                    achievementPopup.classList.remove('show');
                }, 5000);
            }
        }, 2000);

        // Animate battle pass fill
        let currentProgress = 35;
        setInterval(() => {
            currentProgress = Math.min(currentProgress + 5, 100);
            document.querySelector('.tier-fill').style.width = `${currentProgress}%`;

            if (currentProgress === 100) {
                // Unlock next tier
                const nextNode = document.querySelector('.tier-node:not(.unlocked)');
                if (nextNode) {
                    nextNode.classList.add('unlocked');
                    currentProgress = 0;
                }
            }
        }, 1000);

        // Claim daily reward
        claimButton = document.querySelector('.claim-button');
        if (claimButton) {
            claimButton.addEventListener('click', function() {
                const todaySlot = document.querySelector('.day-slot.today');
                if (todaySlot) {
                    todaySlot.classList.remove('today');
                    todaySlot.classList.add('claimed');
                }
                this.disabled = true;
                this.textContent = 'Claimed!';

                // Show reward animation
                // In real implementation, show reward details
            });
        }

        // Update event timer
        setInterval(() => {
            // In real implementation, calculate actual time remaining
            const timerEl = document.querySelector('.event-timer');
            // Update timer text
        }, 1000);

        // === Onboarding System (Phase B) ===
        // Character selection
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                document.querySelector('.start-adventure-btn').disabled = false;
            });
        });

        // Tutorial system
        tutorialSteps = [
            {
                element: '.character-panel',
                title: 'Character Panel',
                text: 'View your stats, level, and equipment here. Press C to open anytime.',
                position: 'right'
            },
            {
                element: '.inventory-btn',
                title: 'Inventory',
                text: 'Manage your items and equipment. Press I for quick access.',
                position: 'bottom'
            },
            {
                element: '.quest-log',
                title: 'Quest Log',
                text: 'Track your active quests and objectives. Press J to view.',
                position: 'left'
            },
            {
                element: '.action-bar',
                title: 'Action Bar',
                text: 'Use your abilities in combat. Number keys 1-5 activate skills.',
                position: 'top'
            },
            {
                element: '.divine-favor',
                title: 'Divine Favor',
                text: 'The gods watch your actions. Their favor affects your journey.',
                position: 'left'
            }
        ];

        currentStep = 0;

        function showTutorialStep(step) {
            const tooltip = document.querySelector('.tutorial-tooltip');
            const hole = document.querySelector('.spotlight-hole');
            const dots = document.querySelectorAll('.progress-dot');

            // Update progress dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index <= step);
            });

            // Update content
            tooltip.querySelector('.tutorial-title').textContent = tutorialSteps[step].title;
            tooltip.querySelector('.tutorial-text').textContent = tutorialSteps[step].text;

            // Position spotlight and tooltip
            // (In real implementation, position based on actual element coordinates)
        }

        // Start button
        startBtn = document.querySelector('.start-adventure-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
            // Fade out welcome screen
            const welcomeScreen = document.querySelector('.onboarding-overlay');
            welcomeScreen.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                // Start tutorial
                document.querySelector('.tutorial-spotlight').classList.add('active');
                document.querySelector('.ftue-checklist').style.display = 'block';
            }, 500);
            });
        }

        // Tutorial navigation
        tutorialNextBtn = document.querySelector('.tutorial-btn:not(.skip)');
        if (tutorialNextBtn) {
            tutorialNextBtn.addEventListener('click', function() {
            currentStep++;
            if (currentStep < tutorialSteps.length) {
                showTutorialStep(currentStep);
            } else {
                document.querySelector('.tutorial-spotlight').classList.remove('active');
            }
            });
        }

        // Skip tutorial
        tutorialSkipBtn = document.querySelector('.tutorial-btn.skip');
        if (tutorialSkipBtn) {
            tutorialSkipBtn.addEventListener('click', function() {
            document.querySelector('.tutorial-spotlight').classList.remove('active');
            });
        }

        // Simulate FTUE progress
        ftueProgress = 20;
        setInterval(() => {
            if (ftueProgress < 100) {
                ftueProgress += 20;
                document.querySelector('.ftue-progress-fill').style.width = `${ftueProgress}%`;

                // Mark items as completed
                const items = document.querySelectorAll('.ftue-item');
                const itemIndex = Math.floor((ftueProgress / 100) * items.length) - 1;
                if (itemIndex >= 0) {
                    items[itemIndex].classList.add('completed');
                }
            }
        }, 3000);

        // === Celebration Animations (Phase B) ===
        // Trigger level up animation
        function triggerLevelUp() {
            const levelUpEl = document.querySelector('.level-up-burst');
            levelUpEl.style.display = 'block';

            // Create particles
            for (let i = 0; i < 30; i++) {
                createParticle(window.innerWidth / 2, window.innerHeight / 2);
            }

            setTimeout(() => {
                levelUpEl.style.display = 'none';
            }, 2000);
        }

        // Trigger quest complete
        function triggerQuestComplete() {
            const questEl = document.querySelector('.quest-complete');
            questEl.style.display = 'block';

            setTimeout(() => {
                questEl.style.display = 'none';
            }, 3000);
        }

        // Trigger divine favor
        function triggerDivineFavor(amount) {
            const favorEl = document.querySelector('.divine-favor-gain');
            const amountEl = favorEl.querySelector('.favor-amount');
            amountEl.textContent = `+${amount}`;
            favorEl.style.display = 'block';

            setTimeout(() => {
                favorEl.style.display = 'none';
            }, 2000);
        }

        // Create floating damage numbers
        function createDamageNumber(x, y, value, type = 'normal') {
            const damageEl = document.createElement('div');
            damageEl.className = `damage-number ${type}`;
            damageEl.textContent = type === 'heal' ? `+${value}` : `-${value}`;
            damageEl.style.left = `${x}px`;
            damageEl.style.top = `${y}px`;
            document.body.appendChild(damageEl);

            setTimeout(() => {
                damageEl.remove();
            }, 1000);
        }

        // Create particle effect
        function createParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
            particle.style.animation = `particleFloat ${1 + Math.random()}s ease-out`;
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }

        // Demo animations - DISABLED for normal gameplay
        // setTimeout(() => triggerLevelUp(), 1000);
        // setTimeout(() => triggerQuestComplete(), 3000);
        // setTimeout(() => triggerDivineFavor(15), 5000);

        // Create some damage numbers
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const types = ['normal', 'critical', 'heal'];
            const type = types[Math.floor(Math.random() * types.length)];
            const value = Math.floor(Math.random() * 100) + 20;
            createDamageNumber(x, y, value, type);
        }, 2000);

        // Animate XP bar
        currentXP = 65;
        setInterval(() => {
            currentXP = Math.min(currentXP + 5, 100);
            document.querySelector('.xp-fill').style.width = `${currentXP}%`;

            if (currentXP === 100) {
                triggerLevelUp();
                currentXP = 0;
            }
        }, 3000);

        // === Loading States (Phase B) ===
        // Rotate loading tips (no duplicates)

        // Example: Show success animation
        function showSuccess() {
            const successEl = document.querySelector('.success-pulse');
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 1000);
        }

        // Demo success after 5 seconds
        setTimeout(showSuccess, 5000);
    
        
        // === PHASE D: Backend Integration ===

        // API helper function with error handling
        async function apiCall(endpoint, options = {}) {
            try {
                const response = await fetchWithCSRF(endpoint, options);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`API Error [${endpoint}]:`, error);
                throw error;
            }
        }

        // Load character stats for character sheet overlay
        async function loadCharacterStats() {
            try {
                gameUX.showLoading('Loading character data...');

                const data = await apiCall('/api/character/stats');

                // Update character sheet UI
                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update stats
                const stats = data.stats;
                for (const [stat, value] of Object.entries(stats)) {
                    const statElement = charOverlay.querySelector(`[data-stat="${stat}"]`);
                    if (statElement) {
                        statElement.textContent = value;
                    }
                }

                // Update level
                const levelBadge = charOverlay.querySelector('.level-badge');
                if (levelBadge) levelBadge.textContent = `Level ${data.level}`;

                // Update XP bar
                const xpBar = charOverlay.querySelector('.xp-fill');
                if (xpBar) {
                    const xpPercent = (data.xp / data.xp_to_next) * 100;
                    xpBar.style.width = `${xpPercent}%`;
                }

                // Update HP
                const hpText = charOverlay.querySelector('.hp-text');
                if (hpText) hpText.textContent = `${data.hp} / ${data.max_hp}`;

                // Update class
                const className = charOverlay.querySelector('.character-class');
                if (className) className.textContent = data.class;

                gameUX.hideLoading();
                console.log('[Phase D] Character stats loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load character stats:', error);
            }
        }

        // Load divine favor for character sheet
        async function loadDivineFavor() {
            try {
                const data = await apiCall('/api/character/divine_favor');

                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update favor bars for each god
                const favor = data.favor;
                for (const [godName, favorValue] of Object.entries(favor)) {
                    const favorBar = charOverlay.querySelector(`[data-god="${godName}"] .favor-bar-fill`);
                    if (favorBar) {
                        // Favor ranges from -100 to 100, normalize to 0-100%
                        const favorPercent = ((favorValue + 100) / 200) * 100;
                        favorBar.style.width = `${favorPercent}%`;

                        // Color based on favor level
                        if (favorValue > 50) favorBar.style.background = '#4CAF50'; // Green
                        else if (favorValue < -50) favorBar.style.background = '#F44336'; // Red
                        else favorBar.style.background = '#FFC107'; // Amber
                    }

                    const favorText = charOverlay.querySelector(`[data-god="${godName}"] .favor-value`);
                    if (favorText) favorText.textContent = favorValue;
                }

                console.log('[Phase D] Divine favor loaded');

            } catch (error) {
                console.error('Failed to load divine favor:', error);
            }
        }

        // Load inventory for inventory overlay
        async function loadInventory() {
            try {
                gameUX.showLoading('Loading inventory...');

                const data = await apiCall('/api/inventory/all');

                const invOverlay = document.getElementById('inventory-overlay');
                if (!invOverlay) return;

                // Update inventory grid
                const inventoryGrid = invOverlay.querySelector('.inventory-grid');
                if (inventoryGrid) {
                    inventoryGrid.innerHTML = ''; // Clear existing

                    // Add items
                    data.items.forEach(item => {
                        const slot = document.createElement('div');
                        slot.className = 'inventory-slot';
                        if (item.equipped) slot.classList.add('equipped');
                        slot.setAttribute('data-item-id', item.id);
                        slot.setAttribute('data-tooltip', item.description);

                        // XSS Fix: Use safe DOM manipulation instead of innerHTML
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'item-icon';
                        iconDiv.textContent = getItemIcon(item.type);
                        slot.appendChild(iconDiv);

                        if (item.quantity > 1) {
                            const quantityDiv = document.createElement('div');
                            quantityDiv.className = 'item-quantity';
                            quantityDiv.textContent = item.quantity;
                            slot.appendChild(quantityDiv);
                        }

                        inventoryGrid.appendChild(slot);
                    });

                    // Fill empty slots
                    const emptySlots = 48 - data.items.length;
                    for (let i = 0; i < emptySlots; i++) {
                        const emptySlot = document.createElement('div');
                        emptySlot.className = 'inventory-slot empty';
                        inventoryGrid.appendChild(emptySlot);
                    }
                }

                // Update gold
                const goldDisplay = invOverlay.querySelector('.gold-amount');
                if (goldDisplay) goldDisplay.textContent = data.gold;

                // Update weight
                const weightDisplay = invOverlay.querySelector('.weight-display');
                if (weightDisplay) {
                    weightDisplay.textContent = `${data.weight} / ${data.max_weight}`;
                }

                gameUX.hideLoading();
                console.log('[Phase D] Inventory loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load inventory:', error);
            }
        }

        // Helper function to get item icon emoji
        function getItemIcon(itemType) {
            const icons = {
                'weapon': '⚔️',
                'armor': '🛡️',
                'potion': '🧪',
                'scroll': '📜',
                'food': '🍖',
                'quest': '📋',
                'treasure': '💎',
                'default': '📦'
            };
            return icons[itemType] || icons.default;
        }

        // Load quests for quest overlay
        async function loadQuests(type = 'active') {
            try {
                gameUX.showLoading(`Loading ${type} quests...`);

                const endpoint = type === 'active' ? '/api/quests/active' : '/api/quests/completed';
                const data = await apiCall(endpoint);

                const questOverlay = document.getElementById('quests-overlay');
                if (!questOverlay) return;

                const questList = questOverlay.querySelector('.quest-list');
                if (questList) {
                    questList.innerHTML = ''; // Clear existing

                    if (data.quests.length === 0) {
                        // XSS Fix: Use safe DOM manipulation
                        const noQuestsDiv = document.createElement('div');
                        noQuestsDiv.className = 'no-quests';
                        noQuestsDiv.textContent = `No ${type} quests`;
                        questList.appendChild(noQuestsDiv);
                    } else {
                        data.quests.forEach(quest => {
                            const questItem = document.createElement('div');
                            questItem.className = 'quest-item';
                            questItem.setAttribute('data-quest-id', quest.id);

                            // XSS Fix: Use safe DOM manipulation
                            const titleDiv = document.createElement('div');
                            titleDiv.className = 'quest-title';
                            titleDiv.textContent = quest.name;
                            questItem.appendChild(titleDiv);

                            const descDiv = document.createElement('div');
                            descDiv.className = 'quest-description';
                            descDiv.textContent = quest.description;
                            questItem.appendChild(descDiv);

                            if (quest.progress !== undefined) {
                                const progressBarDiv = document.createElement('div');
                                progressBarDiv.className = 'quest-progress-bar';

                                const progressFillDiv = document.createElement('div');
                                progressFillDiv.className = 'quest-progress-fill';
                                progressFillDiv.style.width = `${quest.progress}%`;

                                progressBarDiv.appendChild(progressFillDiv);
                                questItem.appendChild(progressBarDiv);
                            }

                            questList.appendChild(questItem);
                        });
                    }
                }

                gameUX.hideLoading();
                console.log(`[Phase D] ${type} quests loaded`);

            } catch (error) {
                gameUX.hideLoading();
                console.error(`Failed to load ${type} quests:`, error);
            }
        }

        // Load current scenario
        async function loadCurrentScenario() {
            try {
                gameUX.showLoading('Loading scenario...');

                const data = await apiCall('/api/current_scenario');

                // Update scenario title
                const titleElement = document.querySelector('.scenario-title');
                if (titleElement) titleElement.textContent = data.title || 'The Adventure Begins';

                // Update scenario description
                const descElement = document.querySelector('.scenario-description');
                if (descElement) descElement.textContent = data.description || 'Your journey awaits...';

                // Update choices
                const choicesContainer = document.querySelector('.choices-container');
                if (choicesContainer && data.choices) {
                    choicesContainer.innerHTML = '';

                    data.choices.forEach((choice, index) => {
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.textContent = choice.text;
                        button.onclick = () => submitChoice(choice.id);
                        choicesContainer.appendChild(button);
                    });
                }

                gameUX.hideLoading();
                console.log('[Phase D] Current scenario loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load scenario:', error);
            }
        }

        // Submit player choice
        async function submitChoice(choiceId) {
            try {
                gameUX.showLoading('Processing your choice...');

                const data = await apiCall('/api/make_choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ choice: choiceId })
                });

                // Show consequences
                if (data.consequence) {
                    const narrativePanel = document.querySelector('.scene-narrative-panel');
                    if (narrativePanel) {
                        const consequenceDiv = document.createElement('div');
                        consequenceDiv.className = 'narrative-text consequence';
                        consequenceDiv.textContent = data.consequence;
                        narrativePanel.appendChild(consequenceDiv);
                    }
                }

                // Check for level up
                if (data.level_up) {
                    gameUX.celebrate('levelup', { level: data.new_level });
                }

                // Check for quest completion
                if (data.quest_completed) {
                    gameUX.celebrate('quest', { quest: data.quest_name });
                }

                // Reload scenario for next turn
                await loadCurrentScenario();

                gameUX.hideLoading();
                console.log('[Phase D] Choice submitted successfully');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to submit choice:', error);
            }
        }

        // Auto-refresh game state periodically
        function startGameStatePolling() {
            setInterval(async () => {
                try {
                    const data = await apiCall('/api/game_state');

                    // Update health bar
                    const hpBar = document.querySelector('.hp-bar-fill');
                    if (hpBar && data.character) {
                        const hpPercent = (data.character.hp / data.character.max_hp) * 100;
                        hpBar.style.width = `${hpPercent}%`;
                    }

                    // Update level display
                    const levelDisplay = document.querySelector('.player-level');
                    if (levelDisplay && data.character) {
                        levelDisplay.textContent = `Lv. ${data.character.level}`;
                    }

                } catch (error) {
                    // Silent fail for polling errors
                }
            }, 5000); // Poll every 5 seconds
        }

        // Hook into overlay open events
        document.addEventListener('DOMContentLoaded', () => {
            // Load character data when character overlay opens
            const charButton = document.querySelector('[data-overlay="character-overlay"]');
            if (charButton) {
                charButton.addEventListener('click', () => {
                    loadCharacterStats();
                    loadDivineFavor();
                });
            }

            // Load inventory when inventory overlay opens
            const invButton = document.querySelector('[data-overlay="inventory-overlay"]');
            if (invButton) {
                invButton.addEventListener('click', loadInventory);
            }

            // Load quests when quest overlay opens
            const questButton = document.querySelector('[data-overlay="quests-overlay"]');
            if (questButton) {
                questButton.addEventListener('click', () => loadQuests('active'));
            }

            // Quest tab switching
            const activeTab = document.querySelector('.quest-tab[data-tab="active"]');
            const completedTab = document.querySelector('.quest-tab[data-tab="completed"]');

            if (activeTab) activeTab.addEventListener('click', () => loadQuests('active'));
            if (completedTab) completedTab.addEventListener('click', () => loadQuests('completed'));

            // Load initial scenario
            loadCurrentScenario();

            // Start polling for game state updates
            startGameStatePolling();

            console.log('[Phase D] Frontend connected to backend');
        });

        // === UX System Initialization (Phase B) ===
        GameUX = class {
            constructor() {
                this.loadingShown = false;
                this.celebrationsEnabled = true;
            }

            showLoading(message = 'Loading...') {
                if (this.loadingShown) return;
                this.loadingShown = true;

                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.add('active');
                    const loadingText = loadingContainer.querySelector('.loading-text');
                    if (loadingText) loadingText.textContent = message;
                }
            }

            hideLoading() {
                this.loadingShown = false;
                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.remove('active');
                }
            }

            celebrate(type, data = {}) {
                if (!this.celebrationsEnabled) return;

                switch(type) {
                    case 'levelup':
                        if (typeof showLevelUp !== 'undefined') showLevelUp(data.level || 1);
                        break;
                    case 'quest':
                        if (typeof showQuestComplete !== 'undefined') showQuestComplete(data.quest || '');
                        break;
                    case 'achievement':
                        if (typeof showAchievement !== 'undefined') showAchievement(data.title || '', data.description || '');
                        break;
                }
            }

            vibrate(pattern = [50]) {
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(pattern);
                }
            }
        }

        // Initialize global UX controller
        gameUX = new GameUX();
        console.log('[Phase B] UX improvements initialized');

    

// ============================================
// COMBINED JAVASCRIPT (deduplicated)
// ============================================


        // CSRF Protection: Fetch and store CSRF token
        let csrfToken = null;

        async function fetchCSRFToken() {
            try {
                const response = await fetch('/api/csrf-token');
                const data = await response.json();
                csrfToken = data.csrf_token;
                console.log('[Security] CSRF token fetched successfully');
            } catch (error) {
                console.error('[Security] Failed to fetch CSRF token:', error);
            }
        }

        // Fetch CSRF token on page load
        fetchCSRFToken();

        // Helper function to add CSRF token to fetch requests
        function fetchWithCSRF(url, options = {}) {
            if (!options.headers) {
                options.headers = {};
            }
            if (csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
                options.headers['X-CSRFToken'] = csrfToken;
            }
            return fetch(url, options);
        }


        // ============================================
        // OVERLAY SYSTEM - All 6 Game Overlays
        // ============================================

        // Overlay IDs mapped to sidebar buttons
        const overlayMap = {
            0: 'character-overlay',  // Character (C)
            1: 'inventory-overlay',  // Inventory (I)
            2: 'skills-overlay',     // Skills (K)
            3: 'quests-overlay',     // Quests (J)
            4: 'map-overlay',        // Map (M)
            5: 'settings-overlay'    // Settings (ESC)
        };

        // Track which overlay is currently active
        let activeOverlay = null;

        /**
         * Opens a specific overlay by ID
         * Closes any previously open overlay
         * Adds .active class to show the overlay
         */
        function openOverlay(overlayId) {
            // Close any existing open overlays
            closeAllOverlays();

            // Get the overlay element
            const overlay = document.getElementById(overlayId);
            if (overlay) {
                overlay.classList.add('active');
                activeOverlay = overlayId;
                console.log(`Opened overlay: ${overlayId}`);

                // Initialize map system when map overlay opens
                if (overlayId === 'map-overlay') {
                    // Give the overlay time to properly render and calculate dimensions
                    requestAnimationFrame(() => {
                        fantasyMapSystem.init();
                        console.log('Fantasy Map System initialized');
                    });
                }
            }
        }

        /**
         * Closes all open overlays
         * Removes .active class from all overlay elements
         */
        function closeAllOverlays() {
            const overlays = document.querySelectorAll('.game-overlay.active, .overlay.active');
            overlays.forEach(overlay => {
                overlay.classList.remove('active');
            });
            activeOverlay = null;
            console.log('Closed all overlays');
        }

        /**
         * Keyboard event handler for overlay shortcuts
         * C = Character, I = Inventory, K = Skills, J = Quests, M = Map
         * ESC = Settings or close active overlay
         */
        document.addEventListener('keydown', function(e) {
            const keyMap = {
                'c': 0,        // Character overlay
                'i': 1,        // Inventory overlay
                'k': 2,        // Skills overlay
                'j': 3,        // Quests overlay
                'm': 4,        // Map overlay
                'escape': 5    // Settings overlay
            };

            const key = e.key.toLowerCase();

            // Check if key matches an overlay shortcut
            if (keyMap[key] !== undefined) {
                e.preventDefault();

                // If ESC is pressed and an overlay is open, close it first
                if (key === 'escape' && activeOverlay) {
                    closeAllOverlays();
                } else if (key === 'escape') {
                    // If no overlay is open, open Settings
                    openOverlay(overlayMap[5]);
                } else {
                    // For other keys, toggle overlay open/close
                    const overlayId = overlayMap[keyMap[key]];
                    if (activeOverlay === overlayId) {
                        closeAllOverlays();
                    } else {
                        openOverlay(overlayId);
                    }
                }
            }
        });

        /**
         * Setup event listeners for overlay backdrops
         * Clicking backdrop closes the overlay
         */
        document.querySelectorAll('.overlay-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', function() {
                closeAllOverlays();
            });
        });

        /**
         * Setup event listeners for close buttons
         * Clicking X button closes the overlay
         */
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                closeAllOverlays();
            });
        });

        /**
         * Setup event listeners for sidebar buttons
         * Maps button clicks to corresponding overlays
         * Button order: Character, Inventory, Skills, Quests, Map, Settings
         */
        document.querySelectorAll('.left-panel .side-btn').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const overlayId = overlayMap[index];

                // Toggle: if already open, close it; otherwise open it
                if (activeOverlay === overlayId) {
                    closeAllOverlays();
                } else {
                    openOverlay(overlayId);
                }

                // Visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 100);
                }, 100);
            });
        });

        console.log('Overlay system initialized - Press C/I/K/J/M or ESC to open overlays');

        // === Choice Button Interactions ===
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const choice = this.textContent.trim();
                console.log('Player chose:', choice);

                // Visual feedback
                this.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.5), rgba(139, 115, 85, 0.5))';
                this.style.borderColor = '#FFD700';

                // Disable all choice buttons after selection
                document.querySelectorAll('.choice-btn').forEach(b => {
                    b.style.opacity = '0.5';
                    b.style.pointerEvents = 'none';
                });

                // Submit choice to backend
                submitChoice(choice);
            });
        });

        // Submit choice to API and handle response
        async function submitChoice(choice) {
            try {
                // Show loading state
                const narrativePanel = document.querySelector('.scene-narrative-panel');
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'act-header';
                loadingDiv.style.marginTop = '25px';
                loadingDiv.innerHTML = '⏳ Processing your choice...';
                narrativePanel.appendChild(loadingDiv);

                // POST to API
                const response = await fetchWithCSRF('/api/scenario/choice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        choice: choice,
                        timestamp: new Date().toISOString()
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Remove loading message
                loadingDiv.remove();

                // Display consequences
                displayConsequences(data);

            } catch (error) {
                console.error('Error submitting choice:', error);

                // Show error message to user
                const errorDiv = document.createElement('div');
                errorDiv.className = 'narrative-text';
                errorDiv.style.color = '#CD5C5C';
                errorDiv.style.marginTop = '20px';
                // XSS Fix: Safely construct error message
                const errorIcon = document.createTextNode('⚠️ ');
                const errorLabel = document.createElement('strong');
                errorLabel.textContent = 'Connection Error:';
                const errorMessage = document.createTextNode(' Unable to process your choice. ' + error.message);
                errorDiv.appendChild(errorIcon);
                errorDiv.appendChild(errorLabel);
                errorDiv.appendChild(errorMessage);
                document.querySelector('.scene-narrative-panel').appendChild(errorDiv);
            }
        }

        // Display consequences and Divine Council responses
        function displayConsequences(data) {
            const narrativePanel = document.querySelector('.scene-narrative-panel');

            // Add consequence narrative
            if (data.consequence) {
                const consequenceDiv = document.createElement('div');
                consequenceDiv.className = 'narrative-text';
                consequenceDiv.style.marginTop = '20px';
                consequenceDiv.innerHTML = data.consequence;
                narrativePanel.appendChild(consequenceDiv);
            }

            // Add Divine Council header
            if (data.divineCouncil && data.divineCouncil.length > 0) {
                const councilHeader = document.createElement('div');
                councilHeader.className = 'act-header';
                councilHeader.style.marginTop = '25px';
                councilHeader.innerHTML = '⚖️ Divine Council Convenes';
                narrativePanel.appendChild(councilHeader);

                // Add each god's speech
                data.divineCouncil.forEach((godSpeech, index) => {
                    setTimeout(() => {
                        const speechDiv = document.createElement('div');
                        speechDiv.className = `god-speech ${godSpeech.god.toLowerCase()}`;
                        // XSS Fix: Safely construct god speech DOM
                        const godImg = document.createElement('img');
                        godImg.src = 'images/god_' + encodeURIComponent(godSpeech.god.toLowerCase()) + '.svg';
                        godImg.alt = godSpeech.god;
                        godImg.className = 'god-icon';

                        const godContent = document.createElement('div');
                        godContent.className = 'god-content';

                        const godName = document.createElement('div');
                        godName.className = 'god-name';
                        godName.textContent = godSpeech.icon + ' ' + godSpeech.god.toUpperCase() + ' SPEAKS';

                        const godText = document.createElement('div');
                        godText.className = 'god-text';
                        godText.textContent = '"' + godSpeech.speech + '"';

                        godContent.appendChild(godName);
                        godContent.appendChild(godText);
                        speechDiv.appendChild(godImg);
                        speechDiv.appendChild(godContent);
                        narrativePanel.appendChild(speechDiv);

                        // Scroll to show new content
                        speechDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, index * 800); // Stagger speeches for dramatic effect
                });
            }

            // Update game state if provided
            if (data.stateUpdates) {
                updateGameState(data.stateUpdates);
            }
        }

        // Update game state based on API response
        function updateGameState(updates) {
            // Update trust if changed
            if (updates.trust !== undefined) {
                console.log('Trust updated to:', updates.trust);
                // Update trust bar visualization (if implemented)
            }

            // Update divine favor if changed
            if (updates.divineFavor) {
                console.log('Divine favor updated:', updates.divineFavor);
                // Update divine favor bars (if implemented)
            }

            // Update NPC approval if changed
            if (updates.npcApproval) {
                console.log('NPC approval updated:', updates.npcApproval);
                // Update NPC status (if implemented)
            }
        }

        // === Action Slot Handlers ===
        document.querySelectorAll('.action-slot').forEach((slot, index) => {
            slot.addEventListener('click', function() {
                const key = index + 1;
                console.log(`Action slot ${key} activated`);

                // Visual feedback
                this.style.transform = 'scale(0.9) translateY(-3px)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);

                // Activate skill/item in slot
                activateSlot(index + 1, this);
            });
        });

        // Action bar slot activation
        function activateSlot(slotNumber, slotElement) {
            // Check if slot is on cooldown
            if (slotElement.classList.contains('on-cooldown')) {
                console.log(`Slot ${slotNumber} is on cooldown`);

                // Shake animation for cooldown feedback
                slotElement.style.animation = 'shake 0.3s';
                setTimeout(() => {
                    slotElement.style.animation = '';
                }, 300);
                return;
            }

            // Get slot data
            const slotEmoji = slotElement.textContent.trim();
            const slotKey = slotElement.dataset.key || slotNumber;

            console.log(`Activating slot ${slotNumber} (${slotEmoji})`);

            // Simulate ability activation
            showAbilityActivation(slotNumber, slotEmoji);

            // Apply cooldown (example: 3 seconds)
            applyCooldown(slotElement, 3000);

            // POST to backend if needed for game state updates
            // fetch('/api/ability/activate', {...})
        }

        // Show ability activation visual feedback
        function showAbilityActivation(slotNumber, abilityName) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(139, 115, 85, 0.95));
                border: 3px solid #FFD700;
                border-radius: 10px;
                padding: 20px 40px;
                font-family: 'Cinzel', serif;
                font-size: 28px;
                color: #000;
                z-index: 9999;
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
                animation: abilityPop 0.6s ease;
            `;
            notification.textContent = `${abilityName} Activated!`;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -50%) scale(0.5)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 1000);
        }

        // Apply cooldown to slot
        function applyCooldown(slotElement, duration) {
            slotElement.classList.add('on-cooldown');
            slotElement.style.opacity = '0.5';
            slotElement.style.filter = 'grayscale(1)';
            slotElement.style.pointerEvents = 'none';

            // Cooldown overlay
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.style.cssText = `
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Cinzel', serif;
                font-size: 24px;
                color: #CD5C5C;
                font-weight: 700;
                animation: cooldownFade ${duration}ms linear;
            `;

            let remainingSeconds = Math.ceil(duration / 1000);
            cooldownOverlay.textContent = remainingSeconds;
            slotElement.appendChild(cooldownOverlay);

            // Update countdown every second
            const countdownInterval = setInterval(() => {
                remainingSeconds--;
                if (remainingSeconds > 0) {
                    cooldownOverlay.textContent = remainingSeconds;
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            // Remove cooldown after duration
            setTimeout(() => {
                slotElement.classList.remove('on-cooldown');
                slotElement.style.opacity = '';
                slotElement.style.filter = '';
                slotElement.style.pointerEvents = '';
                cooldownOverlay.remove();
            }, duration);
        }

        // === Party Member Card Handlers ===
        document.querySelectorAll('.party-member').forEach(member => {
            member.addEventListener('click', function() {
                const name = this.querySelector('.member-name').textContent;
                console.log(`${name} selected`);

                // Highlight selected member
                document.querySelectorAll('.party-member').forEach(m => {
                    m.style.borderColor = '#8B7355';
                    m.style.background = 'rgba(0, 0, 0, 0.4)';
                });
                this.style.borderColor = '#FFD700';
                this.style.background = 'rgba(212, 175, 55, 0.2)';

                // Show member details panel
                const memberData = {
                    name: this.querySelector('.member-name').textContent,
                    emoji: this.textContent.split('\n')[0].trim(),
                    hp: this.querySelector('.member-hp')?.textContent || '100/100',
                    role: this.dataset.role || 'Unknown'
                };
                showMemberDetails(memberData);
            });
        });

        // Show party member details in a modal panel
        function showMemberDetails(memberData) {
            // Remove existing details panel if any
            const existing = document.querySelector('.member-details-modal');
            if (existing) {
                existing.remove();
            }

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'member-details-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;

            // Create panel
            const panel = document.createElement('div');
            panel.style.cssText = `
                background: linear-gradient(135deg, rgba(42, 36, 30, 0.98) 0%, rgba(26, 22, 18, 0.98) 100%);
                border: 3px solid #D4AF37;
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.3);
                animation: slideUp 0.3s ease;
            `;

            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="font-family: 'Cinzel', serif; font-size: 32px; color: #D4AF37; margin: 0;">
                        ${memberData.emoji} ${memberData.name}
                    </h2>
                    <button class="close-details-btn" style="
                        background: rgba(205, 92, 92, 0.3);
                        border: 2px solid #CD5C5C;
                        color: #CD5C5C;
                        font-size: 24px;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">✕</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Role
                    </div>
                    <div style="font-family: 'Yrsa', serif; font-size: 20px; color: #D4AF37;">
                        ${memberData.role}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Health
                    </div>
                    <div style="
                        background: rgba(0, 0, 0, 0.5);
                        border: 2px solid #8B7355;
                        border-radius: 8px;
                        padding: 8px;
                        font-family: 'Yrsa', serif;
                        font-size: 18px;
                        color: #90EE90;
                    ">
                        ❤️ ${memberData.hp}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Equipment
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <div style="background: rgba(0, 0, 0, 0.5); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;">
                            ⚔️ Weapon
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.5); border: 2px solid #8B7355; border-radius: 6px; padding: 10px; text-align: center; color: #D4AF37;">
                            🛡️ Armor
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #8B7355; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                        Active Effects
                    </div>
                    <div style="
                        background: rgba(139, 69, 139, 0.2);
                        border: 2px solid #8B458B;
                        border-radius: 6px;
                        padding: 12px;
                        font-family: 'Yrsa', serif;
                        font-size: 16px;
                        color: #DA70D6;
                        font-style: italic;
                    ">
                        ✨ No active effects
                    </div>
                </div>
            `;

            modal.appendChild(panel);
            document.body.appendChild(modal);

            // Close button handler
            panel.querySelector('.close-details-btn').addEventListener('click', () => {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 300);
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.opacity = '0';
                    setTimeout(() => modal.remove(), 300);
                }
            });

            // Close button hover effect
            const closeBtn = panel.querySelector('.close-details-btn');
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = 'rgba(205, 92, 92, 0.6)';
                closeBtn.style.transform = 'scale(1.1)';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = 'rgba(205, 92, 92, 0.3)';
                closeBtn.style.transform = 'scale(1)';
            });
        }


        // === Scenario Loading Functions ===
        function loadNewScenario(scenarioData) {
            // Update narrative text
            // Update whispers
            // Update choices
            // Add Divine Council dialogue when choice is made
            console.log('Loading scenario:', scenarioData.theme);
        }

        function showDivineCouncilResponse(councilData) {
            // councilData contains god speeches and judgment
            // Animate god speech boxes appearing one by one
            const speeches = document.querySelectorAll('.god-speech');
            speeches.forEach((speech, index) => {
                setTimeout(() => {
                    speech.style.opacity = '0';
                    speech.style.transform = 'translateY(20px)';
                    speech.style.transition = 'all 0.5s ease';
                    setTimeout(() => {
                        speech.style.opacity = '1';
                        speech.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 200);
            });
        }

        
        // ============================================
        // INVENTORY OVERLAY HANDLERS
        // ============================================

    // Inventory Overlay Management
    const inventoryOverlay = document.getElementById('inventory-overlay');
    const closeBtn = inventoryOverlay.querySelector('.close-btn');
    const filterBtns = inventoryOverlay.querySelectorAll('.filter-btn');
    const detailsContent = inventoryOverlay.querySelector('.details-content');

    // Close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            inventoryOverlay.classList.remove('active');
        });
    }

    // Filter button handlers
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            console.log('Filter changed to:', filter);
        });
    });

    // Item hover handlers for detail display
    const allItems = inventoryOverlay.querySelectorAll('[data-item-id]');
    allItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const tooltip = item.getAttribute('data-tooltip');
            if (tooltip) {
                // XSS Fix: Use textContent instead of innerHTML
                const p = document.createElement('p');
                p.textContent = tooltip;
                detailsContent.innerHTML = ''; // Clear first
                detailsContent.appendChild(p);
            }
        });

        item.addEventListener('mouseleave', () => {
            detailsContent.innerHTML = '<p class="details-placeholder">Hover over an item to view details</p>';
        });
    });

    // Keyboard toggle (I key)

        // ============================================
        // ADDITIONAL OVERLAY ENHANCEMENTS
        // ============================================

// Quest Tab Switching
document.querySelectorAll('.quest-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // Update active tab
        document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Update visible content
        document.getElementById('active-quests').classList.toggle('hidden');
        document.getElementById('completed-quests').classList.toggle('hidden');
    });
});

// Settings Tab Switching
document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Update visible content
        document.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`${tabName}-settings`).classList.remove('hidden');
    });
});

// Volume slider handlers
document.querySelectorAll('.volume-slider').forEach(slider => {
    slider.addEventListener('input', function() {
        const valueDisplay = this.parentElement.querySelector('.volume-value');
        if (valueDisplay) {
            valueDisplay.textContent = this.value + '%';
        }
    });
});

console.log('Overlay enhancements loaded successfully');


        
        
        // QUEST/SETTINGS TAB SWITCHING - INTEGRATED
        // ============================================
// Quest Tab Switching
document.querySelectorAll('.quest-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // Update active tab
        document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Update visible content
        document.getElementById('active-quests').classList.toggle('hidden');
        document.getElementById('completed-quests').classList.toggle('hidden');
    });
});

// Settings Tab Switching
document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Update visible content
        document.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`${tabName}-settings`).classList.remove('hidden');
    });
});

// Volume slider handlers
document.querySelectorAll('.volume-slider').forEach(slider => {
    slider.addEventListener('input', function() {
        const valueDisplay = this.parentElement.querySelector('.volume-value');
        if (valueDisplay) {
            valueDisplay.textContent = this.value + '%';
        }
    });
});

console.log('Overlay enhancements loaded successfully');

        // ========================================
        // PHASE 3A: DYNAMIC DATA LOADING
        // ========================================

        /**
         * Load all game data from backend APIs
         * Call this on page load and after major game events
         */
        async function loadGameData() {
            console.log('Loading game data from backend...');

            try {
                // Load all data in parallel for performance
                await Promise.all([
                    loadCharacterStats(),
                    loadInventoryData(),
                    loadDivineFavor(),
                    loadPartyTrust(),
                    loadNPCData(),
                    loadQuestData()
                ]);

                console.log('All game data loaded successfully');
            } catch (error) {
                console.error('Error loading game data:', error);
            }
        }

        /**
         * Load character stats from /api/character/stats
         * Updates Character overlay with current stats
         */
        async function loadCharacterStats() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/character/stats');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    name: 'Aldric',
                    class: 'Fighter',
                    level: 5,
                    stats: {
                        strength: 16,
                        dexterity: 14,
                        constitution: 15,
                        intelligence: 10,
                        wisdom: 12,
                        charisma: 8
                    },
                    hp: { current: 45, max: 50 }
                };

                // Update UI elements
                updateCharacterDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load character stats:', error);
                throw error;
            }
        }

        /**
         * Update character display elements with loaded data
         */
        function updateCharacterDisplay(data) {
            // Update character name
            const nameElements = document.querySelectorAll('.character-name');
            nameElements.forEach(el => el.textContent = data.name);

            // Update stat values
            if (data.stats) {
                const statMap = {
                    'strength': data.stats.strength,
                    'dexterity': data.stats.dexterity,
                    'constitution': data.stats.constitution,
                    'intelligence': data.stats.intelligence,
                    'wisdom': data.stats.wisdom,
                    'charisma': data.stats.charisma
                };

                Object.keys(statMap).forEach(stat => {
                    const statElement = document.querySelector(`.stat-${stat} .stat-value`);
                    if (statElement) {
                        statElement.textContent = statMap[stat];
                    }
                });
            }

            // Update HP display
            if (data.hp) {
                const hpElements = document.querySelectorAll('.hp-value');
                hpElements.forEach(el => {
                    el.textContent = `${data.hp.current}/${data.hp.max}`;
                });
            }

            console.log('Character display updated');
        }

        /**
         * Load inventory data from /api/inventory
         * Updates Inventory overlay with current items
         */
        async function loadInventoryData() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/inventory');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    items: [
                        { name: 'Potion of Healing', quantity: 3, rarity: 'common' },
                        { name: 'Ancient Scroll', quantity: 1, rarity: 'rare' }
                    ],
                    gold: 150
                };

                updateInventoryDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load inventory:', error);
                throw error;
            }
        }

        /**
         * Update inventory display elements
         */
        function updateInventoryDisplay(data) {
            // Update inventory grid (when implemented)
            console.log('Inventory data loaded:', data);

            // Update gold display
            if (data.gold !== undefined) {
                const goldElements = document.querySelectorAll('.gold-amount');
                goldElements.forEach(el => el.textContent = data.gold);
            }

            console.log('Inventory display updated');
        }

        /**
         * Load divine favor values from /api/divine-favor
         * Updates Character overlay Divine Favor bars
         */
        async function loadDivineFavor() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/divine-favor');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    valdris: 15,
                    kaitha: -10,
                    morvane: 20,
                    sylara: 5,
                    korvan: 25,
                    athena: 10,
                    mercus: -5
                };

                updateDivineFavorDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load divine favor:', error);
                throw error;
            }
        }

        /**
         * Update divine favor bar displays
         */
        function updateDivineFavorDisplay(favorData) {
            Object.keys(favorData).forEach(god => {
                const value = favorData[god];
                const percentage = Math.max(0, Math.min(100, ((value + 50) / 100) * 100));

                // Update bar width
                const barElement = document.querySelector(`.${god}-bar`);
                if (barElement) {
                    barElement.style.width = `${percentage}%`;
                }

                // Update value display
                const valueElement = barElement?.parentElement?.querySelector('.divine-value');
                if (valueElement) {
                    valueElement.textContent = value > 0 ? `+${value}` : value;
                    valueElement.classList.toggle('negative', value < 0);
                }
            });

            console.log('Divine favor display updated');
        }

        /**
         * Load party trust from /api/party/trust
         * Updates trust meter visualization
         */
        async function loadPartyTrust() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/party/trust');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    trust: 65,
                    tier: 'Professional'
                };

                updateTrustDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load party trust:', error);
                throw error;
            }
        }

        /**
         * Update trust meter display
         */
        function updateTrustDisplay(trustData) {
            // Update trust bar (when implemented in UI)
            console.log('Trust data loaded:', trustData);

            // This would update a trust bar visualization
            const trustElements = document.querySelectorAll('.trust-value');
            trustElements.forEach(el => {
                el.textContent = `${trustData.trust}%`;
            });

            console.log('Trust display updated');
        }

        /**
         * Load NPC data from /api/npcs
         * Updates party member cards
         */
        async function loadNPCData() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/npcs');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    npcs: [
                        { name: 'Grimsby', approval: 75, hp: { current: 30, max: 40 } },
                        { name: 'Renna', approval: 50, hp: { current: 25, max: 35 } }
                    ]
                };

                updateNPCDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load NPC data:', error);
                throw error;
            }
        }

        /**
         * Update NPC/party member displays
         */
        function updateNPCDisplay(npcData) {
            console.log('NPC data loaded:', npcData);

            // This would update party member cards in the UI
            npcData.npcs.forEach((npc, index) => {
                const memberCard = document.querySelectorAll('.party-member')[index];
                if (memberCard) {
                    const hpElement = memberCard.querySelector('.member-hp');
                    if (hpElement) {
                        hpElement.textContent = `${npc.hp.current}/${npc.hp.max}`;
                    }
                }
            });

            console.log('NPC display updated');
        }

        /**
         * Load quest data from /api/quests
         * Updates Quest overlay
         */
        async function loadQuestData() {
            try {
                // TODO: Uncomment when backend ready
                // const response = await fetch('/api/quests');
                // const data = await response.json();

                // Mock data for now
                const data = {
                    quests: [
                        {
                            title: "The Warehouse Heist",
                            status: 'active',
                            objectives: [
                                { text: 'Infiltrate warehouse', completed: false },
                                { text: 'Find medicine', completed: false }
                            ]
                        }
                    ]
                };

                updateQuestDisplay(data);

                return data;
            } catch (error) {
                console.error('Failed to load quest data:', error);
                throw error;
            }
        }

        /**
         * Update quest display
         */
        function updateQuestDisplay(questData) {
            console.log('Quest data loaded:', questData);
            // This would populate the quest overlay with active quests
            console.log('Quest display updated');
        }

        // Load all game data on page load
        // Uncomment this when backend APIs are ready
        // loadGameData();


        console.log('The Arcane Codex UI loaded - All interactive elements ready');
    
                                // === Retention System (Phase B) ===
        // Simulate achievement unlock
        setTimeout(() => {
            const achievementPopup = document.querySelector('.achievement-popup');
            if (achievementPopup) {
                achievementPopup.classList.add('show');

                // Play sound effect (in real implementation)
                // playSound('achievement.mp3');

                setTimeout(() => {
                    achievementPopup.classList.remove('show');
                }, 5000);
            }
        }, 2000);

        // Animate battle pass fill
        currentProgress = 35;
        setInterval(() => {
            currentProgress = Math.min(currentProgress + 5, 100);
            document.querySelector('.tier-fill').style.width = `${currentProgress}%`;

            if (currentProgress === 100) {
                // Unlock next tier
                const nextNode = document.querySelector('.tier-node:not(.unlocked)');
                if (nextNode) {
                    nextNode.classList.add('unlocked');
                    currentProgress = 0;
                }
            }
        }, 1000);

        // Claim daily reward
        claimButton = document.querySelector('.claim-button');
        if (claimButton) {
            claimButton.addEventListener('click', function() {
                const todaySlot = document.querySelector('.day-slot.today');
                if (todaySlot) {
                    todaySlot.classList.remove('today');
                    todaySlot.classList.add('claimed');
                }
                this.disabled = true;
                this.textContent = 'Claimed!';

                // Show reward animation
                // In real implementation, show reward details
            });
        }

        // Update event timer
        setInterval(() => {
            // In real implementation, calculate actual time remaining
            const timerEl = document.querySelector('.event-timer');
            // Update timer text
        }, 1000);

        // === Onboarding System (Phase B) ===
        // Character selection
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                document.querySelector('.start-adventure-btn').disabled = false;
            });
        });

        // Tutorial system
        tutorialSteps = [
            {
                element: '.character-panel',
                title: 'Character Panel',
                text: 'View your stats, level, and equipment here. Press C to open anytime.',
                position: 'right'
            },
            {
                element: '.inventory-btn',
                title: 'Inventory',
                text: 'Manage your items and equipment. Press I for quick access.',
                position: 'bottom'
            },
            {
                element: '.quest-log',
                title: 'Quest Log',
                text: 'Track your active quests and objectives. Press J to view.',
                position: 'left'
            },
            {
                element: '.action-bar',
                title: 'Action Bar',
                text: 'Use your abilities in combat. Number keys 1-5 activate skills.',
                position: 'top'
            },
            {
                element: '.divine-favor',
                title: 'Divine Favor',
                text: 'The gods watch your actions. Their favor affects your journey.',
                position: 'left'
            }
        ];

        currentStep = 0;

        function showTutorialStep(step) {
            const tooltip = document.querySelector('.tutorial-tooltip');
            const hole = document.querySelector('.spotlight-hole');
            const dots = document.querySelectorAll('.progress-dot');

            // Update progress dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index <= step);
            });

            // Update content
            tooltip.querySelector('.tutorial-title').textContent = tutorialSteps[step].title;
            tooltip.querySelector('.tutorial-text').textContent = tutorialSteps[step].text;

            // Position spotlight and tooltip
            // (In real implementation, position based on actual element coordinates)
        }

        // Start button
        startBtn = document.querySelector('.start-adventure-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
            // Fade out welcome screen
            const welcomeScreen = document.querySelector('.onboarding-overlay');
            welcomeScreen.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                // Start tutorial
                document.querySelector('.tutorial-spotlight').classList.add('active');
                document.querySelector('.ftue-checklist').style.display = 'block';
            }, 500);
            });
        }

        // Tutorial navigation
        tutorialNextBtn = document.querySelector('.tutorial-btn:not(.skip)');
        if (tutorialNextBtn) {
            tutorialNextBtn.addEventListener('click', function() {
            currentStep++;
            if (currentStep < tutorialSteps.length) {
                showTutorialStep(currentStep);
            } else {
                document.querySelector('.tutorial-spotlight').classList.remove('active');
            }
            });
        }

        // Skip tutorial
        tutorialSkipBtn = document.querySelector('.tutorial-btn.skip');
        if (tutorialSkipBtn) {
            tutorialSkipBtn.addEventListener('click', function() {
            document.querySelector('.tutorial-spotlight').classList.remove('active');
            });
        }

        // Simulate FTUE progress
        ftueProgress = 20;
        setInterval(() => {
            if (ftueProgress < 100) {
                ftueProgress += 20;
                document.querySelector('.ftue-progress-fill').style.width = `${ftueProgress}%`;

                // Mark items as completed
                const items = document.querySelectorAll('.ftue-item');
                const itemIndex = Math.floor((ftueProgress / 100) * items.length) - 1;
                if (itemIndex >= 0) {
                    items[itemIndex].classList.add('completed');
                }
            }
        }, 3000);

        // === Celebration Animations (Phase B) ===
        // Trigger level up animation
        function triggerLevelUp() {
            const levelUpEl = document.querySelector('.level-up-burst');
            levelUpEl.style.display = 'block';

            // Create particles
            for (let i = 0; i < 30; i++) {
                createParticle(window.innerWidth / 2, window.innerHeight / 2);
            }

            setTimeout(() => {
                levelUpEl.style.display = 'none';
            }, 2000);
        }

        // Trigger quest complete
        function triggerQuestComplete() {
            const questEl = document.querySelector('.quest-complete');
            questEl.style.display = 'block';

            setTimeout(() => {
                questEl.style.display = 'none';
            }, 3000);
        }

        // Trigger divine favor
        function triggerDivineFavor(amount) {
            const favorEl = document.querySelector('.divine-favor-gain');
            const amountEl = favorEl.querySelector('.favor-amount');
            amountEl.textContent = `+${amount}`;
            favorEl.style.display = 'block';

            setTimeout(() => {
                favorEl.style.display = 'none';
            }, 2000);
        }

        // Create floating damage numbers
        function createDamageNumber(x, y, value, type = 'normal') {
            const damageEl = document.createElement('div');
            damageEl.className = `damage-number ${type}`;
            damageEl.textContent = type === 'heal' ? `+${value}` : `-${value}`;
            damageEl.style.left = `${x}px`;
            damageEl.style.top = `${y}px`;
            document.body.appendChild(damageEl);

            setTimeout(() => {
                damageEl.remove();
            }, 1000);
        }

        // Create particle effect
        function createParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
            particle.style.animation = `particleFloat ${1 + Math.random()}s ease-out`;
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }

        // Demo animations - DISABLED for normal gameplay
        // setTimeout(() => triggerLevelUp(), 1000);
        // setTimeout(() => triggerQuestComplete(), 3000);
        // setTimeout(() => triggerDivineFavor(15), 5000);

        // Create some damage numbers
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const types = ['normal', 'critical', 'heal'];
            const type = types[Math.floor(Math.random() * types.length)];
            const value = Math.floor(Math.random() * 100) + 20;
            createDamageNumber(x, y, value, type);
        }, 2000);

        // Animate XP bar
        currentXP = 65;
        setInterval(() => {
            currentXP = Math.min(currentXP + 5, 100);
            document.querySelector('.xp-fill').style.width = `${currentXP}%`;

            if (currentXP === 100) {
                triggerLevelUp();
                currentXP = 0;
            }
        }, 3000);

        // === Loading States (Phase B) ===
        // Rotate loading tips (no duplicates)

        // Example: Show success animation
        function showSuccess() {
            const successEl = document.querySelector('.success-pulse');
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 1000);
        }

        // Demo success after 5 seconds
        setTimeout(showSuccess, 5000);
    
        
        // === PHASE D: Backend Integration ===

        // API helper function with error handling
        async function apiCall(endpoint, options = {}) {
            try {
                const response = await fetchWithCSRF(endpoint, options);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`API Error [${endpoint}]:`, error);
                throw error;
            }
        }

        // Load character stats for character sheet overlay
        async function loadCharacterStats() {
            try {
                gameUX.showLoading('Loading character data...');

                const data = await apiCall('/api/character/stats');

                // Update character sheet UI
                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update stats
                const stats = data.stats;
                for (const [stat, value] of Object.entries(stats)) {
                    const statElement = charOverlay.querySelector(`[data-stat="${stat}"]`);
                    if (statElement) {
                        statElement.textContent = value;
                    }
                }

                // Update level
                const levelBadge = charOverlay.querySelector('.level-badge');
                if (levelBadge) levelBadge.textContent = `Level ${data.level}`;

                // Update XP bar
                const xpBar = charOverlay.querySelector('.xp-fill');
                if (xpBar) {
                    const xpPercent = (data.xp / data.xp_to_next) * 100;
                    xpBar.style.width = `${xpPercent}%`;
                }

                // Update HP
                const hpText = charOverlay.querySelector('.hp-text');
                if (hpText) hpText.textContent = `${data.hp} / ${data.max_hp}`;

                // Update class
                const className = charOverlay.querySelector('.character-class');
                if (className) className.textContent = data.class;

                gameUX.hideLoading();
                console.log('[Phase D] Character stats loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load character stats:', error);
            }
        }

        // Load divine favor for character sheet
        async function loadDivineFavor() {
            try {
                const data = await apiCall('/api/character/divine_favor');

                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update favor bars for each god
                const favor = data.favor;
                for (const [godName, favorValue] of Object.entries(favor)) {
                    const favorBar = charOverlay.querySelector(`[data-god="${godName}"] .favor-bar-fill`);
                    if (favorBar) {
                        // Favor ranges from -100 to 100, normalize to 0-100%
                        const favorPercent = ((favorValue + 100) / 200) * 100;
                        favorBar.style.width = `${favorPercent}%`;

                        // Color based on favor level
                        if (favorValue > 50) favorBar.style.background = '#4CAF50'; // Green
                        else if (favorValue < -50) favorBar.style.background = '#F44336'; // Red
                        else favorBar.style.background = '#FFC107'; // Amber
                    }

                    const favorText = charOverlay.querySelector(`[data-god="${godName}"] .favor-value`);
                    if (favorText) favorText.textContent = favorValue;
                }

                console.log('[Phase D] Divine favor loaded');

            } catch (error) {
                console.error('Failed to load divine favor:', error);
            }
        }

        // Load inventory for inventory overlay
        async function loadInventory() {
            try {
                gameUX.showLoading('Loading inventory...');

                const data = await apiCall('/api/inventory/all');

                const invOverlay = document.getElementById('inventory-overlay');
                if (!invOverlay) return;

                // Update inventory grid
                const inventoryGrid = invOverlay.querySelector('.inventory-grid');
                if (inventoryGrid) {
                    inventoryGrid.innerHTML = ''; // Clear existing

                    // Add items
                    data.items.forEach(item => {
                        const slot = document.createElement('div');
                        slot.className = 'inventory-slot';
                        if (item.equipped) slot.classList.add('equipped');
                        slot.setAttribute('data-item-id', item.id);
                        slot.setAttribute('data-tooltip', item.description);

                        // XSS Fix: Use safe DOM manipulation instead of innerHTML
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'item-icon';
                        iconDiv.textContent = getItemIcon(item.type);
                        slot.appendChild(iconDiv);

                        if (item.quantity > 1) {
                            const quantityDiv = document.createElement('div');
                            quantityDiv.className = 'item-quantity';
                            quantityDiv.textContent = item.quantity;
                            slot.appendChild(quantityDiv);
                        }

                        inventoryGrid.appendChild(slot);
                    });

                    // Fill empty slots
                    const emptySlots = 48 - data.items.length;
                    for (let i = 0; i < emptySlots; i++) {
                        const emptySlot = document.createElement('div');
                        emptySlot.className = 'inventory-slot empty';
                        inventoryGrid.appendChild(emptySlot);
                    }
                }

                // Update gold
                const goldDisplay = invOverlay.querySelector('.gold-amount');
                if (goldDisplay) goldDisplay.textContent = data.gold;

                // Update weight
                const weightDisplay = invOverlay.querySelector('.weight-display');
                if (weightDisplay) {
                    weightDisplay.textContent = `${data.weight} / ${data.max_weight}`;
                }

                gameUX.hideLoading();
                console.log('[Phase D] Inventory loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load inventory:', error);
            }
        }

        // Helper function to get item icon emoji
        function getItemIcon(itemType) {
            const icons = {
                'weapon': '⚔️',
                'armor': '🛡️',
                'potion': '🧪',
                'scroll': '📜',
                'food': '🍖',
                'quest': '📋',
                'treasure': '💎',
                'default': '📦'
            };
            return icons[itemType] || icons.default;
        }

        // Load quests for quest overlay
        async function loadQuests(type = 'active') {
            try {
                gameUX.showLoading(`Loading ${type} quests...`);

                const endpoint = type === 'active' ? '/api/quests/active' : '/api/quests/completed';
                const data = await apiCall(endpoint);

                const questOverlay = document.getElementById('quests-overlay');
                if (!questOverlay) return;

                const questList = questOverlay.querySelector('.quest-list');
                if (questList) {
                    questList.innerHTML = ''; // Clear existing

                    if (data.quests.length === 0) {
                        // XSS Fix: Use safe DOM manipulation
                        const noQuestsDiv = document.createElement('div');
                        noQuestsDiv.className = 'no-quests';
                        noQuestsDiv.textContent = `No ${type} quests`;
                        questList.appendChild(noQuestsDiv);
                    } else {
                        data.quests.forEach(quest => {
                            const questItem = document.createElement('div');
                            questItem.className = 'quest-item';
                            questItem.setAttribute('data-quest-id', quest.id);

                            // XSS Fix: Use safe DOM manipulation
                            const titleDiv = document.createElement('div');
                            titleDiv.className = 'quest-title';
                            titleDiv.textContent = quest.name;
                            questItem.appendChild(titleDiv);

                            const descDiv = document.createElement('div');
                            descDiv.className = 'quest-description';
                            descDiv.textContent = quest.description;
                            questItem.appendChild(descDiv);

                            if (quest.progress !== undefined) {
                                const progressBarDiv = document.createElement('div');
                                progressBarDiv.className = 'quest-progress-bar';

                                const progressFillDiv = document.createElement('div');
                                progressFillDiv.className = 'quest-progress-fill';
                                progressFillDiv.style.width = `${quest.progress}%`;

                                progressBarDiv.appendChild(progressFillDiv);
                                questItem.appendChild(progressBarDiv);
                            }

                            questList.appendChild(questItem);
                        });
                    }
                }

                gameUX.hideLoading();
                console.log(`[Phase D] ${type} quests loaded`);

            } catch (error) {
                gameUX.hideLoading();
                console.error(`Failed to load ${type} quests:`, error);
            }
        }

        // Load current scenario
        async function loadCurrentScenario() {
            try {
                gameUX.showLoading('Loading scenario...');

                const data = await apiCall('/api/current_scenario');

                // Update scenario title
                const titleElement = document.querySelector('.scenario-title');
                if (titleElement) titleElement.textContent = data.title || 'The Adventure Begins';

                // Update scenario description
                const descElement = document.querySelector('.scenario-description');
                if (descElement) descElement.textContent = data.description || 'Your journey awaits...';

                // Update choices
                const choicesContainer = document.querySelector('.choices-container');
                if (choicesContainer && data.choices) {
                    choicesContainer.innerHTML = '';

                    data.choices.forEach((choice, index) => {
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.textContent = choice.text;
                        button.onclick = () => submitChoice(choice.id);
                        choicesContainer.appendChild(button);
                    });
                }

                gameUX.hideLoading();
                console.log('[Phase D] Current scenario loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load scenario:', error);
            }
        }

        // Submit player choice
        async function submitChoice(choiceId) {
            try {
                gameUX.showLoading('Processing your choice...');

                const data = await apiCall('/api/make_choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ choice: choiceId })
                });

                // Show consequences
                if (data.consequence) {
                    const narrativePanel = document.querySelector('.scene-narrative-panel');
                    if (narrativePanel) {
                        const consequenceDiv = document.createElement('div');
                        consequenceDiv.className = 'narrative-text consequence';
                        consequenceDiv.textContent = data.consequence;
                        narrativePanel.appendChild(consequenceDiv);
                    }
                }

                // Check for level up
                if (data.level_up) {
                    gameUX.celebrate('levelup', { level: data.new_level });
                }

                // Check for quest completion
                if (data.quest_completed) {
                    gameUX.celebrate('quest', { quest: data.quest_name });
                }

                // Reload scenario for next turn
                await loadCurrentScenario();

                gameUX.hideLoading();
                console.log('[Phase D] Choice submitted successfully');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to submit choice:', error);
            }
        }

        // Auto-refresh game state periodically
        function startGameStatePolling() {
            setInterval(async () => {
                try {
                    const data = await apiCall('/api/game_state');

                    // Update health bar
                    const hpBar = document.querySelector('.hp-bar-fill');
                    if (hpBar && data.character) {
                        const hpPercent = (data.character.hp / data.character.max_hp) * 100;
                        hpBar.style.width = `${hpPercent}%`;
                    }

                    // Update level display
                    const levelDisplay = document.querySelector('.player-level');
                    if (levelDisplay && data.character) {
                        levelDisplay.textContent = `Lv. ${data.character.level}`;
                    }

                } catch (error) {
                    // Silent fail for polling errors
                }
            }, 5000); // Poll every 5 seconds
        }

        // Hook into overlay open events
        document.addEventListener('DOMContentLoaded', () => {
            // Load character data when character overlay opens
            const charButton = document.querySelector('[data-overlay="character-overlay"]');
            if (charButton) {
                charButton.addEventListener('click', () => {
                    loadCharacterStats();
                    loadDivineFavor();
                });
            }

            // Load inventory when inventory overlay opens
            const invButton = document.querySelector('[data-overlay="inventory-overlay"]');
            if (invButton) {
                invButton.addEventListener('click', loadInventory);
            }

            // Load quests when quest overlay opens
            const questButton = document.querySelector('[data-overlay="quests-overlay"]');
            if (questButton) {
                questButton.addEventListener('click', () => loadQuests('active'));
            }

            // Quest tab switching
            const activeTab = document.querySelector('.quest-tab[data-tab="active"]');
            const completedTab = document.querySelector('.quest-tab[data-tab="completed"]');

            if (activeTab) activeTab.addEventListener('click', () => loadQuests('active'));
            if (completedTab) completedTab.addEventListener('click', () => loadQuests('completed'));

            // Load initial scenario
            loadCurrentScenario();

            // Start polling for game state updates
            startGameStatePolling();

            console.log('[Phase D] Frontend connected to backend');
        });

        // === UX System Initialization (Phase B) ===
        GameUX = class {
            constructor() {
                this.loadingShown = false;
                this.celebrationsEnabled = true;
            }

            showLoading(message = 'Loading...') {
                if (this.loadingShown) return;
                this.loadingShown = true;

                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.add('active');
                    const loadingText = loadingContainer.querySelector('.loading-text');
                    if (loadingText) loadingText.textContent = message;
                }
            }

            hideLoading() {
                this.loadingShown = false;
                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.remove('active');
                }
            }

            celebrate(type, data = {}) {
                if (!this.celebrationsEnabled) return;

                switch(type) {
                    case 'levelup':
                        if (typeof showLevelUp !== 'undefined') showLevelUp(data.level || 1);
                        break;
                    case 'quest':
                        if (typeof showQuestComplete !== 'undefined') showQuestComplete(data.quest || '');
                        break;
                    case 'achievement':
                        if (typeof showAchievement !== 'undefined') showAchievement(data.title || '', data.description || '');
                        break;
                }
            }

            vibrate(pattern = [50]) {
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(pattern);
                }
            }
        }

        // Initialize global UX controller
        gameUX = new GameUX();
        console.log('[Phase B] UX improvements initialized');

    

// ============================================
// COMBINED JAVASCRIPT (deduplicated)
// ============================================


        // Simulate achievement unlock
        setTimeout(() => {
            const achievementPopup = document.querySelector('.achievement-popup');
            if (achievementPopup) {
                achievementPopup.classList.add('show');

                // Play sound effect (in real implementation)
                // playSound('achievement.mp3');

                setTimeout(() => {
                    achievementPopup.classList.remove('show');
                }, 5000);
            }
        }, 2000);

        // Animate battle pass fill
        currentProgress = 35;
        setInterval(() => {
            currentProgress = Math.min(currentProgress + 5, 100);
            document.querySelector('.tier-fill').style.width = `${currentProgress}%`;

            if (currentProgress === 100) {
                // Unlock next tier
                const nextNode = document.querySelector('.tier-node:not(.unlocked)');
                if (nextNode) {
                    nextNode.classList.add('unlocked');
                    currentProgress = 0;
                }
            }
        }, 1000);

        // Claim daily reward
        claimButton = document.querySelector('.claim-button');
        if (claimButton) {
            claimButton.addEventListener('click', function() {
                const todaySlot = document.querySelector('.day-slot.today');
                if (todaySlot) {
                    todaySlot.classList.remove('today');
                    todaySlot.classList.add('claimed');
                }
                this.disabled = true;
                this.textContent = 'Claimed!';

                // Show reward animation
                // In real implementation, show reward details
            });
        }

        // Update event timer
        setInterval(() => {
            // In real implementation, calculate actual time remaining
            const timerEl = document.querySelector('.event-timer');
            // Update timer text
        }, 1000);
    

// ============================================
// COMBINED JAVASCRIPT (deduplicated)
// ============================================


        // Character selection
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                document.querySelector('.start-adventure-btn').disabled = false;
            });
        });

        // Tutorial system
        tutorialSteps = [
            {
                element: '.character-panel',
                title: 'Character Panel',
                text: 'View your stats, level, and equipment here. Press C to open anytime.',
                position: 'right'
            },
            {
                element: '.inventory-btn',
                title: 'Inventory',
                text: 'Manage your items and equipment. Press I for quick access.',
                position: 'bottom'
            },
            {
                element: '.quest-log',
                title: 'Quest Log',
                text: 'Track your active quests and objectives. Press J to view.',
                position: 'left'
            },
            {
                element: '.action-bar',
                title: 'Action Bar',
                text: 'Use your abilities in combat. Number keys 1-5 activate skills.',
                position: 'top'
            },
            {
                element: '.divine-favor',
                title: 'Divine Favor',
                text: 'The gods watch your actions. Their favor affects your journey.',
                position: 'left'
            }
        ];

        currentStep = 0;

        function showTutorialStep(step) {
            const tooltip = document.querySelector('.tutorial-tooltip');
            const hole = document.querySelector('.spotlight-hole');
            const dots = document.querySelectorAll('.progress-dot');

            // Update progress dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index <= step);
            });

            // Update content
            tooltip.querySelector('.tutorial-title').textContent = tutorialSteps[step].title;
            tooltip.querySelector('.tutorial-text').textContent = tutorialSteps[step].text;

            // Position spotlight and tooltip
            // (In real implementation, position based on actual element coordinates)
        }

        // Start button
        startBtn = document.querySelector('.start-adventure-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
            // Fade out welcome screen
            const welcomeScreen = document.querySelector('.onboarding-overlay');
            welcomeScreen.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                // Start tutorial
                document.querySelector('.tutorial-spotlight').classList.add('active');
                document.querySelector('.ftue-checklist').style.display = 'block';
            }, 500);
            });
        }

        // Tutorial navigation
        tutorialNextBtn = document.querySelector('.tutorial-btn:not(.skip)');
        if (tutorialNextBtn) {
            tutorialNextBtn.addEventListener('click', function() {
            currentStep++;
            if (currentStep < tutorialSteps.length) {
                showTutorialStep(currentStep);
            } else {
                document.querySelector('.tutorial-spotlight').classList.remove('active');
            }
            });
        }

        // Skip tutorial
        tutorialSkipBtn = document.querySelector('.tutorial-btn.skip');
        if (tutorialSkipBtn) {
            tutorialSkipBtn.addEventListener('click', function() {
            document.querySelector('.tutorial-spotlight').classList.remove('active');
            });
        }

        // Simulate FTUE progress
        ftueProgress = 20;
        setInterval(() => {
            if (ftueProgress < 100) {
                ftueProgress += 20;
                document.querySelector('.ftue-progress-fill').style.width = `${ftueProgress}%`;

                // Mark items as completed
                const items = document.querySelectorAll('.ftue-item');
                const itemIndex = Math.floor((ftueProgress / 100) * items.length) - 1;
                if (itemIndex >= 0) {
                    items[itemIndex].classList.add('completed');
                }
            }
        }, 3000);
    

// ============================================
// COMBINED JAVASCRIPT (deduplicated)
// ============================================


        // Trigger level up animation
        function triggerLevelUp() {
            const levelUpEl = document.querySelector('.level-up-burst');
            levelUpEl.style.display = 'block';

            // Create particles
            for (let i = 0; i < 30; i++) {
                createParticle(window.innerWidth / 2, window.innerHeight / 2);
            }

            setTimeout(() => {
                levelUpEl.style.display = 'none';
            }, 2000);
        }

        // Trigger quest complete
        function triggerQuestComplete() {
            const questEl = document.querySelector('.quest-complete');
            questEl.style.display = 'block';

            setTimeout(() => {
                questEl.style.display = 'none';
            }, 3000);
        }

        // Trigger divine favor
        function triggerDivineFavor(amount) {
            const favorEl = document.querySelector('.divine-favor-gain');
            const amountEl = favorEl.querySelector('.favor-amount');
            amountEl.textContent = `+${amount}`;
            favorEl.style.display = 'block';

            setTimeout(() => {
                favorEl.style.display = 'none';
            }, 2000);
        }

        // Create floating damage numbers
        function createDamageNumber(x, y, value, type = 'normal') {
            const damageEl = document.createElement('div');
            damageEl.className = `damage-number ${type}`;
            damageEl.textContent = type === 'heal' ? `+${value}` : `-${value}`;
            damageEl.style.left = `${x}px`;
            damageEl.style.top = `${y}px`;
            document.body.appendChild(damageEl);

            setTimeout(() => {
                damageEl.remove();
            }, 1000);
        }

        // Create particle effect
        function createParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
            particle.style.animation = `particleFloat ${1 + Math.random()}s ease-out`;
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }

        // Demo animations - DISABLED for normal gameplay
        // setTimeout(() => triggerLevelUp(), 1000);
        // setTimeout(() => triggerQuestComplete(), 3000);
        // setTimeout(() => triggerDivineFavor(15), 5000);

        // Create some damage numbers
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const types = ['normal', 'critical', 'heal'];
            const type = types[Math.floor(Math.random() * types.length)];
            const value = Math.floor(Math.random() * 100) + 20;
            createDamageNumber(x, y, value, type);
        }, 2000);

        // Animate XP bar
        currentXP = 65;
        setInterval(() => {
            currentXP = Math.min(currentXP + 5, 100);
            document.querySelector('.xp-fill').style.width = `${currentXP}%`;

            if (currentXP === 100) {
                triggerLevelUp();
                currentXP = 0;
            }
        }, 3000);
    
        
        // === PHASE D: Backend Integration ===

        // API helper function with error handling
        async function apiCall(endpoint, options = {}) {
            try {
                const response = await fetchWithCSRF(endpoint, options);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`API Error [${endpoint}]:`, error);
                throw error;
            }
        }

        // Load character stats for character sheet overlay
        async function loadCharacterStats() {
            try {
                gameUX.showLoading('Loading character data...');

                const data = await apiCall('/api/character/stats');

                // Update character sheet UI
                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update stats
                const stats = data.stats;
                for (const [stat, value] of Object.entries(stats)) {
                    const statElement = charOverlay.querySelector(`[data-stat="${stat}"]`);
                    if (statElement) {
                        statElement.textContent = value;
                    }
                }

                // Update level
                const levelBadge = charOverlay.querySelector('.level-badge');
                if (levelBadge) levelBadge.textContent = `Level ${data.level}`;

                // Update XP bar
                const xpBar = charOverlay.querySelector('.xp-fill');
                if (xpBar) {
                    const xpPercent = (data.xp / data.xp_to_next) * 100;
                    xpBar.style.width = `${xpPercent}%`;
                }

                // Update HP
                const hpText = charOverlay.querySelector('.hp-text');
                if (hpText) hpText.textContent = `${data.hp} / ${data.max_hp}`;

                // Update class
                const className = charOverlay.querySelector('.character-class');
                if (className) className.textContent = data.class;

                gameUX.hideLoading();
                console.log('[Phase D] Character stats loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load character stats:', error);
            }
        }

        // Load divine favor for character sheet
        async function loadDivineFavor() {
            try {
                const data = await apiCall('/api/character/divine_favor');

                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update favor bars for each god
                const favor = data.favor;
                for (const [godName, favorValue] of Object.entries(favor)) {
                    const favorBar = charOverlay.querySelector(`[data-god="${godName}"] .favor-bar-fill`);
                    if (favorBar) {
                        // Favor ranges from -100 to 100, normalize to 0-100%
                        const favorPercent = ((favorValue + 100) / 200) * 100;
                        favorBar.style.width = `${favorPercent}%`;

                        // Color based on favor level
                        if (favorValue > 50) favorBar.style.background = '#4CAF50'; // Green
                        else if (favorValue < -50) favorBar.style.background = '#F44336'; // Red
                        else favorBar.style.background = '#FFC107'; // Amber
                    }

                    const favorText = charOverlay.querySelector(`[data-god="${godName}"] .favor-value`);
                    if (favorText) favorText.textContent = favorValue;
                }

                console.log('[Phase D] Divine favor loaded');

            } catch (error) {
                console.error('Failed to load divine favor:', error);
            }
        }

        // Load inventory for inventory overlay
        async function loadInventory() {
            try {
                gameUX.showLoading('Loading inventory...');

                const data = await apiCall('/api/inventory/all');

                const invOverlay = document.getElementById('inventory-overlay');
                if (!invOverlay) return;

                // Update inventory grid
                const inventoryGrid = invOverlay.querySelector('.inventory-grid');
                if (inventoryGrid) {
                    inventoryGrid.innerHTML = ''; // Clear existing

                    // Add items
                    data.items.forEach(item => {
                        const slot = document.createElement('div');
                        slot.className = 'inventory-slot';
                        if (item.equipped) slot.classList.add('equipped');
                        slot.setAttribute('data-item-id', item.id);
                        slot.setAttribute('data-tooltip', item.description);

                        // XSS Fix: Use safe DOM manipulation instead of innerHTML
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'item-icon';
                        iconDiv.textContent = getItemIcon(item.type);
                        slot.appendChild(iconDiv);

                        if (item.quantity > 1) {
                            const quantityDiv = document.createElement('div');
                            quantityDiv.className = 'item-quantity';
                            quantityDiv.textContent = item.quantity;
                            slot.appendChild(quantityDiv);
                        }

                        inventoryGrid.appendChild(slot);
                    });

                    // Fill empty slots
                    const emptySlots = 48 - data.items.length;
                    for (let i = 0; i < emptySlots; i++) {
                        const emptySlot = document.createElement('div');
                        emptySlot.className = 'inventory-slot empty';
                        inventoryGrid.appendChild(emptySlot);
                    }
                }

                // Update gold
                const goldDisplay = invOverlay.querySelector('.gold-amount');
                if (goldDisplay) goldDisplay.textContent = data.gold;

                // Update weight
                const weightDisplay = invOverlay.querySelector('.weight-display');
                if (weightDisplay) {
                    weightDisplay.textContent = `${data.weight} / ${data.max_weight}`;
                }

                gameUX.hideLoading();
                console.log('[Phase D] Inventory loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load inventory:', error);
            }
        }

        // Helper function to get item icon emoji
        function getItemIcon(itemType) {
            const icons = {
                'weapon': '⚔️',
                'armor': '🛡️',
                'potion': '🧪',
                'scroll': '📜',
                'food': '🍖',
                'quest': '📋',
                'treasure': '💎',
                'default': '📦'
            };
            return icons[itemType] || icons.default;
        }

        // Load quests for quest overlay
        async function loadQuests(type = 'active') {
            try {
                gameUX.showLoading(`Loading ${type} quests...`);

                const endpoint = type === 'active' ? '/api/quests/active' : '/api/quests/completed';
                const data = await apiCall(endpoint);

                const questOverlay = document.getElementById('quests-overlay');
                if (!questOverlay) return;

                const questList = questOverlay.querySelector('.quest-list');
                if (questList) {
                    questList.innerHTML = ''; // Clear existing

                    if (data.quests.length === 0) {
                        // XSS Fix: Use safe DOM manipulation
                        const noQuestsDiv = document.createElement('div');
                        noQuestsDiv.className = 'no-quests';
                        noQuestsDiv.textContent = `No ${type} quests`;
                        questList.appendChild(noQuestsDiv);
                    } else {
                        data.quests.forEach(quest => {
                            const questItem = document.createElement('div');
                            questItem.className = 'quest-item';
                            questItem.setAttribute('data-quest-id', quest.id);

                            // XSS Fix: Use safe DOM manipulation
                            const titleDiv = document.createElement('div');
                            titleDiv.className = 'quest-title';
                            titleDiv.textContent = quest.name;
                            questItem.appendChild(titleDiv);

                            const descDiv = document.createElement('div');
                            descDiv.className = 'quest-description';
                            descDiv.textContent = quest.description;
                            questItem.appendChild(descDiv);

                            if (quest.progress !== undefined) {
                                const progressBarDiv = document.createElement('div');
                                progressBarDiv.className = 'quest-progress-bar';

                                const progressFillDiv = document.createElement('div');
                                progressFillDiv.className = 'quest-progress-fill';
                                progressFillDiv.style.width = `${quest.progress}%`;

                                progressBarDiv.appendChild(progressFillDiv);
                                questItem.appendChild(progressBarDiv);
                            }

                            questList.appendChild(questItem);
                        });
                    }
                }

                gameUX.hideLoading();
                console.log(`[Phase D] ${type} quests loaded`);

            } catch (error) {
                gameUX.hideLoading();
                console.error(`Failed to load ${type} quests:`, error);
            }
        }

        // Load current scenario
        async function loadCurrentScenario() {
            try {
                gameUX.showLoading('Loading scenario...');

                const data = await apiCall('/api/current_scenario');

                // Update scenario title
                const titleElement = document.querySelector('.scenario-title');
                if (titleElement) titleElement.textContent = data.title || 'The Adventure Begins';

                // Update scenario description
                const descElement = document.querySelector('.scenario-description');
                if (descElement) descElement.textContent = data.description || 'Your journey awaits...';

                // Update choices
                const choicesContainer = document.querySelector('.choices-container');
                if (choicesContainer && data.choices) {
                    choicesContainer.innerHTML = '';

                    data.choices.forEach((choice, index) => {
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.textContent = choice.text;
                        button.onclick = () => submitChoice(choice.id);
                        choicesContainer.appendChild(button);
                    });
                }

                gameUX.hideLoading();
                console.log('[Phase D] Current scenario loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load scenario:', error);
            }
        }

        // Submit player choice
        async function submitChoice(choiceId) {
            try {
                gameUX.showLoading('Processing your choice...');

                const data = await apiCall('/api/make_choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ choice: choiceId })
                });

                // Show consequences
                if (data.consequence) {
                    const narrativePanel = document.querySelector('.scene-narrative-panel');
                    if (narrativePanel) {
                        const consequenceDiv = document.createElement('div');
                        consequenceDiv.className = 'narrative-text consequence';
                        consequenceDiv.textContent = data.consequence;
                        narrativePanel.appendChild(consequenceDiv);
                    }
                }

                // Check for level up
                if (data.level_up) {
                    gameUX.celebrate('levelup', { level: data.new_level });
                }

                // Check for quest completion
                if (data.quest_completed) {
                    gameUX.celebrate('quest', { quest: data.quest_name });
                }

                // Reload scenario for next turn
                await loadCurrentScenario();

                gameUX.hideLoading();
                console.log('[Phase D] Choice submitted successfully');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to submit choice:', error);
            }
        }

        // Auto-refresh game state periodically
        function startGameStatePolling() {
            setInterval(async () => {
                try {
                    const data = await apiCall('/api/game_state');

                    // Update health bar
                    const hpBar = document.querySelector('.hp-bar-fill');
                    if (hpBar && data.character) {
                        const hpPercent = (data.character.hp / data.character.max_hp) * 100;
                        hpBar.style.width = `${hpPercent}%`;
                    }

                    // Update level display
                    const levelDisplay = document.querySelector('.player-level');
                    if (levelDisplay && data.character) {
                        levelDisplay.textContent = `Lv. ${data.character.level}`;
                    }

                } catch (error) {
                    // Silent fail for polling errors
                }
            }, 5000); // Poll every 5 seconds
        }

        // Hook into overlay open events
        document.addEventListener('DOMContentLoaded', () => {
            // Load character data when character overlay opens
            const charButton = document.querySelector('[data-overlay="character-overlay"]');
            if (charButton) {
                charButton.addEventListener('click', () => {
                    loadCharacterStats();
                    loadDivineFavor();
                });
            }

            // Load inventory when inventory overlay opens
            const invButton = document.querySelector('[data-overlay="inventory-overlay"]');
            if (invButton) {
                invButton.addEventListener('click', loadInventory);
            }

            // Load quests when quest overlay opens
            const questButton = document.querySelector('[data-overlay="quests-overlay"]');
            if (questButton) {
                questButton.addEventListener('click', () => loadQuests('active'));
            }

            // Quest tab switching
            const activeTab = document.querySelector('.quest-tab[data-tab="active"]');
            const completedTab = document.querySelector('.quest-tab[data-tab="completed"]');

            if (activeTab) activeTab.addEventListener('click', () => loadQuests('active'));
            if (completedTab) completedTab.addEventListener('click', () => loadQuests('completed'));

            // Load initial scenario
            loadCurrentScenario();

            // Start polling for game state updates
            startGameStatePolling();

            console.log('[Phase D] Frontend connected to backend');
        });

        // === UX System Initialization (Phase B) ===
        GameUX = class {
            constructor() {
                this.loadingShown = false;
                this.celebrationsEnabled = true;
            }

            showLoading(message = 'Loading...') {
                if (this.loadingShown) return;
                this.loadingShown = true;

                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.add('active');
                    const loadingText = loadingContainer.querySelector('.loading-text');
                    if (loadingText) loadingText.textContent = message;
                }
            }

            hideLoading() {
                this.loadingShown = false;
                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.remove('active');
                }
            }

            celebrate(type, data = {}) {
                if (!this.celebrationsEnabled) return;

                switch(type) {
                    case 'levelup':
                        if (typeof showLevelUp !== 'undefined') showLevelUp(data.level || 1);
                        break;
                    case 'quest':
                        if (typeof showQuestComplete !== 'undefined') showQuestComplete(data.quest || '');
                        break;
                    case 'achievement':
                        if (typeof showAchievement !== 'undefined') showAchievement(data.title || '', data.description || '');
                        break;
                }
            }

            vibrate(pattern = [50]) {
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(pattern);
                }
            }
        }

        // Initialize global UX controller
        gameUX = new GameUX();
        console.log('[Phase B] UX improvements initialized');

    

// ============================================
// COMBINED JAVASCRIPT (deduplicated)
// ============================================


        // Rotate loading tips - standalone script
        const loadingTips = [
            "The gods watch your every choice...",
            "Divine favor determines your fate...",
            "Trust binds your party together...",
            "Every whisper holds ancient power...",
            "Your choices echo through eternity..."
        ];

        let currentTipIndex = 0;
        setInterval(() => {
            currentTipIndex = (currentTipIndex + 1) % loadingTips.length;
            const tipElement = document.getElementById('loading-tip');
            if (tipElement) {
                tipElement.style.animation = 'none';
                setTimeout(() => {
                    tipElement.textContent = loadingTips[currentTipIndex];
                    tipElement.style.animation = 'fadeIn 0.5s ease';
                }, 50);
            }
        }, 3000);

        // Example: Show success animation
        function showSuccess() {
            const successEl = document.querySelector('.success-pulse');
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 1000);
        }

        // Demo success after 5 seconds
        setTimeout(showSuccess, 5000);
    
                                // === Retention System (Phase B) ===
        // Simulate achievement unlock
        setTimeout(() => {
            const achievementPopup = document.querySelector('.achievement-popup');
            if (achievementPopup) {
                achievementPopup.classList.add('show');

                // Play sound effect (in real implementation)
                // playSound('achievement.mp3');

                setTimeout(() => {
                    achievementPopup.classList.remove('show');
                }, 5000);
            }
        }, 2000);

        // Animate battle pass fill
        currentProgress = 35;
        setInterval(() => {
            currentProgress = Math.min(currentProgress + 5, 100);
            document.querySelector('.tier-fill').style.width = `${currentProgress}%`;

            if (currentProgress === 100) {
                // Unlock next tier
                const nextNode = document.querySelector('.tier-node:not(.unlocked)');
                if (nextNode) {
                    nextNode.classList.add('unlocked');
                    currentProgress = 0;
                }
            }
        }, 1000);

        // Claim daily reward
        claimButton = document.querySelector('.claim-button');
        if (claimButton) {
            claimButton.addEventListener('click', function() {
                const todaySlot = document.querySelector('.day-slot.today');
                if (todaySlot) {
                    todaySlot.classList.remove('today');
                    todaySlot.classList.add('claimed');
                }
                this.disabled = true;
                this.textContent = 'Claimed!';

                // Show reward animation
                // In real implementation, show reward details
            });
        }

        // Update event timer
        setInterval(() => {
            // In real implementation, calculate actual time remaining
            const timerEl = document.querySelector('.event-timer');
            // Update timer text
        }, 1000);

        // === Onboarding System (Phase B) ===
        // Character selection
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                document.querySelector('.start-adventure-btn').disabled = false;
            });
        });

        // Tutorial system
        tutorialSteps = [
            {
                element: '.character-panel',
                title: 'Character Panel',
                text: 'View your stats, level, and equipment here. Press C to open anytime.',
                position: 'right'
            },
            {
                element: '.inventory-btn',
                title: 'Inventory',
                text: 'Manage your items and equipment. Press I for quick access.',
                position: 'bottom'
            },
            {
                element: '.quest-log',
                title: 'Quest Log',
                text: 'Track your active quests and objectives. Press J to view.',
                position: 'left'
            },
            {
                element: '.action-bar',
                title: 'Action Bar',
                text: 'Use your abilities in combat. Number keys 1-5 activate skills.',
                position: 'top'
            },
            {
                element: '.divine-favor',
                title: 'Divine Favor',
                text: 'The gods watch your actions. Their favor affects your journey.',
                position: 'left'
            }
        ];

        currentStep = 0;

        function showTutorialStep(step) {
            const tooltip = document.querySelector('.tutorial-tooltip');
            const hole = document.querySelector('.spotlight-hole');
            const dots = document.querySelectorAll('.progress-dot');

            // Update progress dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index <= step);
            });

            // Update content
            tooltip.querySelector('.tutorial-title').textContent = tutorialSteps[step].title;
            tooltip.querySelector('.tutorial-text').textContent = tutorialSteps[step].text;

            // Position spotlight and tooltip
            // (In real implementation, position based on actual element coordinates)
        }

        // Start button
        startBtn = document.querySelector('.start-adventure-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
            // Fade out welcome screen
            const welcomeScreen = document.querySelector('.onboarding-overlay');
            welcomeScreen.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                // Start tutorial
                document.querySelector('.tutorial-spotlight').classList.add('active');
                document.querySelector('.ftue-checklist').style.display = 'block';
            }, 500);
            });
        }

        // Tutorial navigation
        tutorialNextBtn = document.querySelector('.tutorial-btn:not(.skip)');
        if (tutorialNextBtn) {
            tutorialNextBtn.addEventListener('click', function() {
            currentStep++;
            if (currentStep < tutorialSteps.length) {
                showTutorialStep(currentStep);
            } else {
                document.querySelector('.tutorial-spotlight').classList.remove('active');
            }
            });
        }

        // Skip tutorial
        tutorialSkipBtn = document.querySelector('.tutorial-btn.skip');
        if (tutorialSkipBtn) {
            tutorialSkipBtn.addEventListener('click', function() {
            document.querySelector('.tutorial-spotlight').classList.remove('active');
            });
        }

        // Simulate FTUE progress
        ftueProgress = 20;
        setInterval(() => {
            if (ftueProgress < 100) {
                ftueProgress += 20;
                document.querySelector('.ftue-progress-fill').style.width = `${ftueProgress}%`;

                // Mark items as completed
                const items = document.querySelectorAll('.ftue-item');
                const itemIndex = Math.floor((ftueProgress / 100) * items.length) - 1;
                if (itemIndex >= 0) {
                    items[itemIndex].classList.add('completed');
                }
            }
        }, 3000);

        // === Celebration Animations (Phase B) ===
        // Trigger level up animation
        function triggerLevelUp() {
            const levelUpEl = document.querySelector('.level-up-burst');
            levelUpEl.style.display = 'block';

            // Create particles
            for (let i = 0; i < 30; i++) {
                createParticle(window.innerWidth / 2, window.innerHeight / 2);
            }

            setTimeout(() => {
                levelUpEl.style.display = 'none';
            }, 2000);
        }

        // Trigger quest complete
        function triggerQuestComplete() {
            const questEl = document.querySelector('.quest-complete');
            questEl.style.display = 'block';

            setTimeout(() => {
                questEl.style.display = 'none';
            }, 3000);
        }

        // Trigger divine favor
        function triggerDivineFavor(amount) {
            const favorEl = document.querySelector('.divine-favor-gain');
            const amountEl = favorEl.querySelector('.favor-amount');
            amountEl.textContent = `+${amount}`;
            favorEl.style.display = 'block';

            setTimeout(() => {
                favorEl.style.display = 'none';
            }, 2000);
        }

        // Create floating damage numbers
        function createDamageNumber(x, y, value, type = 'normal') {
            const damageEl = document.createElement('div');
            damageEl.className = `damage-number ${type}`;
            damageEl.textContent = type === 'heal' ? `+${value}` : `-${value}`;
            damageEl.style.left = `${x}px`;
            damageEl.style.top = `${y}px`;
            document.body.appendChild(damageEl);

            setTimeout(() => {
                damageEl.remove();
            }, 1000);
        }

        // Create particle effect
        function createParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
            particle.style.animation = `particleFloat ${1 + Math.random()}s ease-out`;
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }

        // Demo animations - DISABLED for normal gameplay
        // setTimeout(() => triggerLevelUp(), 1000);
        // setTimeout(() => triggerQuestComplete(), 3000);
        // setTimeout(() => triggerDivineFavor(15), 5000);

        // Create some damage numbers
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const types = ['normal', 'critical', 'heal'];
            const type = types[Math.floor(Math.random() * types.length)];
            const value = Math.floor(Math.random() * 100) + 20;
            createDamageNumber(x, y, value, type);
        }, 2000);

        // Animate XP bar
        currentXP = 65;
        setInterval(() => {
            currentXP = Math.min(currentXP + 5, 100);
            document.querySelector('.xp-fill').style.width = `${currentXP}%`;

            if (currentXP === 100) {
                triggerLevelUp();
                currentXP = 0;
            }
        }, 3000);

        // === Loading States (Phase B) ===
        // Rotate loading tips (no duplicates)

        // Example: Show success animation
        function showSuccess() {
            const successEl = document.querySelector('.success-pulse');
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 1000);
        }

        // Demo success after 5 seconds
        setTimeout(showSuccess, 5000);
    
        
        // === PHASE D: Backend Integration ===

        // API helper function with error handling
        async function apiCall(endpoint, options = {}) {
            try {
                const response = await fetchWithCSRF(endpoint, options);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`API Error [${endpoint}]:`, error);
                throw error;
            }
        }

        // Load character stats for character sheet overlay
        async function loadCharacterStats() {
            try {
                gameUX.showLoading('Loading character data...');

                const data = await apiCall('/api/character/stats');

                // Update character sheet UI
                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update stats
                const stats = data.stats;
                for (const [stat, value] of Object.entries(stats)) {
                    const statElement = charOverlay.querySelector(`[data-stat="${stat}"]`);
                    if (statElement) {
                        statElement.textContent = value;
                    }
                }

                // Update level
                const levelBadge = charOverlay.querySelector('.level-badge');
                if (levelBadge) levelBadge.textContent = `Level ${data.level}`;

                // Update XP bar
                const xpBar = charOverlay.querySelector('.xp-fill');
                if (xpBar) {
                    const xpPercent = (data.xp / data.xp_to_next) * 100;
                    xpBar.style.width = `${xpPercent}%`;
                }

                // Update HP
                const hpText = charOverlay.querySelector('.hp-text');
                if (hpText) hpText.textContent = `${data.hp} / ${data.max_hp}`;

                // Update class
                const className = charOverlay.querySelector('.character-class');
                if (className) className.textContent = data.class;

                gameUX.hideLoading();
                console.log('[Phase D] Character stats loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load character stats:', error);
            }
        }

        // Load divine favor for character sheet
        async function loadDivineFavor() {
            try {
                const data = await apiCall('/api/character/divine_favor');

                const charOverlay = document.getElementById('character-overlay');
                if (!charOverlay) return;

                // Update favor bars for each god
                const favor = data.favor;
                for (const [godName, favorValue] of Object.entries(favor)) {
                    const favorBar = charOverlay.querySelector(`[data-god="${godName}"] .favor-bar-fill`);
                    if (favorBar) {
                        // Favor ranges from -100 to 100, normalize to 0-100%
                        const favorPercent = ((favorValue + 100) / 200) * 100;
                        favorBar.style.width = `${favorPercent}%`;

                        // Color based on favor level
                        if (favorValue > 50) favorBar.style.background = '#4CAF50'; // Green
                        else if (favorValue < -50) favorBar.style.background = '#F44336'; // Red
                        else favorBar.style.background = '#FFC107'; // Amber
                    }

                    const favorText = charOverlay.querySelector(`[data-god="${godName}"] .favor-value`);
                    if (favorText) favorText.textContent = favorValue;
                }

                console.log('[Phase D] Divine favor loaded');

            } catch (error) {
                console.error('Failed to load divine favor:', error);
            }
        }

        // Load inventory for inventory overlay
        async function loadInventory() {
            try {
                gameUX.showLoading('Loading inventory...');

                const data = await apiCall('/api/inventory/all');

                const invOverlay = document.getElementById('inventory-overlay');
                if (!invOverlay) return;

                // Update inventory grid
                const inventoryGrid = invOverlay.querySelector('.inventory-grid');
                if (inventoryGrid) {
                    inventoryGrid.innerHTML = ''; // Clear existing

                    // Add items
                    data.items.forEach(item => {
                        const slot = document.createElement('div');
                        slot.className = 'inventory-slot';
                        if (item.equipped) slot.classList.add('equipped');
                        slot.setAttribute('data-item-id', item.id);
                        slot.setAttribute('data-tooltip', item.description);

                        // XSS Fix: Use safe DOM manipulation instead of innerHTML
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'item-icon';
                        iconDiv.textContent = getItemIcon(item.type);
                        slot.appendChild(iconDiv);

                        if (item.quantity > 1) {
                            const quantityDiv = document.createElement('div');
                            quantityDiv.className = 'item-quantity';
                            quantityDiv.textContent = item.quantity;
                            slot.appendChild(quantityDiv);
                        }

                        inventoryGrid.appendChild(slot);
                    });

                    // Fill empty slots
                    const emptySlots = 48 - data.items.length;
                    for (let i = 0; i < emptySlots; i++) {
                        const emptySlot = document.createElement('div');
                        emptySlot.className = 'inventory-slot empty';
                        inventoryGrid.appendChild(emptySlot);
                    }
                }

                // Update gold
                const goldDisplay = invOverlay.querySelector('.gold-amount');
                if (goldDisplay) goldDisplay.textContent = data.gold;

                // Update weight
                const weightDisplay = invOverlay.querySelector('.weight-display');
                if (weightDisplay) {
                    weightDisplay.textContent = `${data.weight} / ${data.max_weight}`;
                }

                gameUX.hideLoading();
                console.log('[Phase D] Inventory loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load inventory:', error);
            }
        }

        // Helper function to get item icon emoji
        function getItemIcon(itemType) {
            const icons = {
                'weapon': '⚔️',
                'armor': '🛡️',
                'potion': '🧪',
                'scroll': '📜',
                'food': '🍖',
                'quest': '📋',
                'treasure': '💎',
                'default': '📦'
            };
            return icons[itemType] || icons.default;
        }

        // Load quests for quest overlay
        async function loadQuests(type = 'active') {
            try {
                gameUX.showLoading(`Loading ${type} quests...`);

                const endpoint = type === 'active' ? '/api/quests/active' : '/api/quests/completed';
                const data = await apiCall(endpoint);

                const questOverlay = document.getElementById('quests-overlay');
                if (!questOverlay) return;

                const questList = questOverlay.querySelector('.quest-list');
                if (questList) {
                    questList.innerHTML = ''; // Clear existing

                    if (data.quests.length === 0) {
                        // XSS Fix: Use safe DOM manipulation
                        const noQuestsDiv = document.createElement('div');
                        noQuestsDiv.className = 'no-quests';
                        noQuestsDiv.textContent = `No ${type} quests`;
                        questList.appendChild(noQuestsDiv);
                    } else {
                        data.quests.forEach(quest => {
                            const questItem = document.createElement('div');
                            questItem.className = 'quest-item';
                            questItem.setAttribute('data-quest-id', quest.id);

                            // XSS Fix: Use safe DOM manipulation
                            const titleDiv = document.createElement('div');
                            titleDiv.className = 'quest-title';
                            titleDiv.textContent = quest.name;
                            questItem.appendChild(titleDiv);

                            const descDiv = document.createElement('div');
                            descDiv.className = 'quest-description';
                            descDiv.textContent = quest.description;
                            questItem.appendChild(descDiv);

                            if (quest.progress !== undefined) {
                                const progressBarDiv = document.createElement('div');
                                progressBarDiv.className = 'quest-progress-bar';

                                const progressFillDiv = document.createElement('div');
                                progressFillDiv.className = 'quest-progress-fill';
                                progressFillDiv.style.width = `${quest.progress}%`;

                                progressBarDiv.appendChild(progressFillDiv);
                                questItem.appendChild(progressBarDiv);
                            }

                            questList.appendChild(questItem);
                        });
                    }
                }

                gameUX.hideLoading();
                console.log(`[Phase D] ${type} quests loaded`);

            } catch (error) {
                gameUX.hideLoading();
                console.error(`Failed to load ${type} quests:`, error);
            }
        }

        // Load current scenario
        async function loadCurrentScenario() {
            try {
                gameUX.showLoading('Loading scenario...');

                const data = await apiCall('/api/current_scenario');

                // Update scenario title
                const titleElement = document.querySelector('.scenario-title');
                if (titleElement) titleElement.textContent = data.title || 'The Adventure Begins';

                // Update scenario description
                const descElement = document.querySelector('.scenario-description');
                if (descElement) descElement.textContent = data.description || 'Your journey awaits...';

                // Update choices
                const choicesContainer = document.querySelector('.choices-container');
                if (choicesContainer && data.choices) {
                    choicesContainer.innerHTML = '';

                    data.choices.forEach((choice, index) => {
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.textContent = choice.text;
                        button.onclick = () => submitChoice(choice.id);
                        choicesContainer.appendChild(button);
                    });
                }

                gameUX.hideLoading();
                console.log('[Phase D] Current scenario loaded');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to load scenario:', error);
            }
        }

        // Submit player choice
        async function submitChoice(choiceId) {
            try {
                gameUX.showLoading('Processing your choice...');

                const data = await apiCall('/api/make_choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ choice: choiceId })
                });

                // Show consequences
                if (data.consequence) {
                    const narrativePanel = document.querySelector('.scene-narrative-panel');
                    if (narrativePanel) {
                        const consequenceDiv = document.createElement('div');
                        consequenceDiv.className = 'narrative-text consequence';
                        consequenceDiv.textContent = data.consequence;
                        narrativePanel.appendChild(consequenceDiv);
                    }
                }

                // Check for level up
                if (data.level_up) {
                    gameUX.celebrate('levelup', { level: data.new_level });
                }

                // Check for quest completion
                if (data.quest_completed) {
                    gameUX.celebrate('quest', { quest: data.quest_name });
                }

                // Reload scenario for next turn
                await loadCurrentScenario();

                gameUX.hideLoading();
                console.log('[Phase D] Choice submitted successfully');

            } catch (error) {
                gameUX.hideLoading();
                console.error('Failed to submit choice:', error);
            }
        }

        // Auto-refresh game state periodically
        function startGameStatePolling() {
            setInterval(async () => {
                try {
                    const data = await apiCall('/api/game_state');

                    // Update health bar
                    const hpBar = document.querySelector('.hp-bar-fill');
                    if (hpBar && data.character) {
                        const hpPercent = (data.character.hp / data.character.max_hp) * 100;
                        hpBar.style.width = `${hpPercent}%`;
                    }

                    // Update level display
                    const levelDisplay = document.querySelector('.player-level');
                    if (levelDisplay && data.character) {
                        levelDisplay.textContent = `Lv. ${data.character.level}`;
                    }

                } catch (error) {
                    // Silent fail for polling errors
                }
            }, 5000); // Poll every 5 seconds
        }

        // Hook into overlay open events
        document.addEventListener('DOMContentLoaded', () => {
            // Load character data when character overlay opens
            const charButton = document.querySelector('[data-overlay="character-overlay"]');
            if (charButton) {
                charButton.addEventListener('click', () => {
                    loadCharacterStats();
                    loadDivineFavor();
                });
            }

            // Load inventory when inventory overlay opens
            const invButton = document.querySelector('[data-overlay="inventory-overlay"]');
            if (invButton) {
                invButton.addEventListener('click', loadInventory);
            }

            // Load quests when quest overlay opens
            const questButton = document.querySelector('[data-overlay="quests-overlay"]');
            if (questButton) {
                questButton.addEventListener('click', () => loadQuests('active'));
            }

            // Quest tab switching
            const activeTab = document.querySelector('.quest-tab[data-tab="active"]');
            const completedTab = document.querySelector('.quest-tab[data-tab="completed"]');

            if (activeTab) activeTab.addEventListener('click', () => loadQuests('active'));
            if (completedTab) completedTab.addEventListener('click', () => loadQuests('completed'));

            // Load initial scenario
            loadCurrentScenario();

            // Start polling for game state updates
            startGameStatePolling();

            console.log('[Phase D] Frontend connected to backend');
        });

        // === UX System Initialization (Phase B) ===
        GameUX = class {
            constructor() {
                this.loadingShown = false;
                this.celebrationsEnabled = true;
            }

            showLoading(message = 'Loading...') {
                if (this.loadingShown) return;
                this.loadingShown = true;

                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.add('active');
                    const loadingText = loadingContainer.querySelector('.loading-text');
                    if (loadingText) loadingText.textContent = message;
                }
            }

            hideLoading() {
                this.loadingShown = false;
                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) {
                    loadingContainer.classList.remove('active');
                }
            }

            celebrate(type, data = {}) {
                if (!this.celebrationsEnabled) return;

                switch(type) {
                    case 'levelup':
                        if (typeof showLevelUp !== 'undefined') showLevelUp(data.level || 1);
                        break;
                    case 'quest':
                        if (typeof showQuestComplete !== 'undefined') showQuestComplete(data.quest || '');
                        break;
                    case 'achievement':
                        if (typeof showAchievement !== 'undefined') showAchievement(data.title || '', data.description || '');
                        break;
                }
            }

            vibrate(pattern = [50]) {
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(pattern);
                }
            }
        }

        // Initialize global UX controller
        gameUX = new GameUX();
        console.log('[Phase B] UX improvements initialized');

    