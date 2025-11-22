/**
 * Map Overlay Manager - The Arcane Codex
 * Handles interactive world map, POI markers, fog of war, and fast travel
 */

class MapOverlayManager {
    constructor() {
        this.overlay = null;
        this.canvas = null;
        this.fogCanvas = null;
        this.ctx = null;
        this.fogCtx = null;
        this.isOpen = false;
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        this.zoomStep = 0.1;

        // POI data
        this.pois = [];
        this.discoveredLocations = new Set(['town-square', 'dark-forest']);
        this.playerPosition = { x: 400, y: 300 };

        // Fog of War
        this.exploredAreas = [];
        this.fogEnabled = true;

        // Filters
        this.filters = {
            shops: true,
            quests: true,
            npcs: true,
            danger: true,
            waypoints: true,
            fog: true
        };

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.overlay = document.getElementById('mapOverlay');
        if (!this.overlay) {
            console.error('Map overlay element not found');
            return;
        }

        this.canvas = document.getElementById('worldMapCanvas');
        this.fogCanvas = document.getElementById('fogOfWarCanvas');

        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
        }

        if (this.fogCanvas) {
            this.fogCtx = this.fogCanvas.getContext('2d');
        }

        this.bindEvents();
        this.initializePOIs();
        this.renderMap();
    }

    bindEvents() {
        // Close overlay events
        const closeButtons = this.overlay.querySelectorAll('[data-close-map]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Zoom controls
        const zoomInBtn = this.overlay.querySelector('[data-zoom-in]');
        const zoomOutBtn = this.overlay.querySelector('[data-zoom-out]');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoomIn());
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }

        // Canvas panning
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.startPan(e));
            this.canvas.addEventListener('mousemove', (e) => this.pan(e));
            this.canvas.addEventListener('mouseup', () => this.endPan());
            this.canvas.addEventListener('mouseleave', () => this.endPan());
            this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        }

        // Filter toggles
        const filterCheckboxes = this.overlay.querySelectorAll('[data-filter]');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filter = e.target.dataset.filter;
                this.filters[filter] = e.target.checked;
                this.updatePOIVisibility();
                if (filter === 'fog') {
                    this.fogEnabled = e.target.checked;
                    this.renderMap();
                }
            });
        });

        // Filter panel toggle
        const filterToggleBtn = this.overlay.querySelector('[data-toggle-filters]');
        const filterPanel = this.overlay.querySelector('[data-filter-panel]');

        if (filterToggleBtn && filterPanel) {
            filterToggleBtn.addEventListener('click', () => {
                filterPanel.classList.toggle('collapsed');
            });
        }

        // Footer actions
        const centerBtn = this.overlay.querySelector('[data-center-map]');
        const resetZoomBtn = this.overlay.querySelector('[data-reset-zoom]');

        if (centerBtn) {
            centerBtn.addEventListener('click', () => this.centerOnPlayer());
        }

        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', () => this.resetView());
        }

        // Travel buttons
        const travelButtons = this.overlay.querySelectorAll('[data-travel-to]');
        travelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const locationId = e.currentTarget.dataset.travelTo;
                this.fastTravel(locationId);
            });
        });

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                this.handleKeyPress(e);
            }
        });
    }

    initializePOIs() {
        // Sample POI data - in production, this would come from game state
        this.pois = [
            {
                id: 'shop-1',
                type: 'shop',
                icon: '🏪',
                name: 'Mystic Emporium',
                description: 'A shop selling rare magical items',
                position: { x: 350, y: 250 },
                discovered: true
            },
            {
                id: 'quest-1',
                type: 'quest',
                icon: '❗',
                name: 'Lost Artifact',
                description: 'Find the ancient relic',
                position: { x: 500, y: 400 },
                discovered: true
            },
            {
                id: 'npc-1',
                type: 'npc',
                icon: '👤',
                name: 'Elder Sage',
                description: 'A wise old wizard',
                position: { x: 300, y: 350 },
                discovered: true
            },
            {
                id: 'danger-1',
                type: 'danger',
                icon: '⚠️',
                name: 'Goblin Camp',
                description: 'Dangerous area ahead',
                position: { x: 600, y: 300 },
                discovered: true
            },
            {
                id: 'waypoint-1',
                type: 'waypoint',
                icon: '🏁',
                name: 'Fast Travel Point',
                description: 'Quick travel location',
                position: { x: 450, y: 500 },
                discovered: false
            }
        ];

        this.renderPOIs();
    }

    renderPOIs() {
        const container = this.overlay.querySelector('[data-poi-container]');
        if (!container) return;

        container.innerHTML = '';

        this.pois.forEach(poi => {
            if (!poi.discovered) return;
            if (!this.filters[poi.type + 's'] && !this.filters[poi.type]) return;

            const marker = document.createElement('div');
            marker.className = `poi-marker ${poi.type}`;
            marker.style.left = `${poi.position.x}px`;
            marker.style.top = `${poi.position.y}px`;
            marker.innerHTML = `<div class="poi-marker-icon">${poi.icon}</div>`;

            marker.addEventListener('click', () => this.showPOIModal(poi));

            container.appendChild(marker);
        });
    }

    updatePOIVisibility() {
        const markers = this.overlay.querySelectorAll('.poi-marker');
        markers.forEach(marker => {
            const type = Array.from(marker.classList).find(cls => cls !== 'poi-marker');
            const filterKey = type + 's';
            marker.style.display = this.filters[filterKey] || this.filters[type] ? 'block' : 'none';
        });
    }

    showPOIModal(poi) {
        const modal = this.overlay.querySelector('[data-poi-modal]');
        if (!modal) return;

        modal.querySelector('[data-poi-icon]').textContent = poi.icon;
        modal.querySelector('[data-poi-title]').textContent = poi.name;
        modal.querySelector('[data-poi-description]').textContent = poi.description;
        modal.querySelector('[data-poi-type]').textContent = poi.type.charAt(0).toUpperCase() + poi.type.slice(1);

        // Calculate distance
        const distance = Math.sqrt(
            Math.pow(poi.position.x - this.playerPosition.x, 2) +
            Math.pow(poi.position.y - this.playerPosition.y, 2)
        );
        modal.querySelector('[data-poi-distance]').textContent = `${Math.round(distance)}m`;

        modal.classList.add('active');

        // Bind modal close
        const closeBtn = modal.querySelector('[data-close-poi-modal]');
        const travelBtn = modal.querySelector('[data-poi-travel]');
        const waypointBtn = modal.querySelector('[data-poi-waypoint]');

        closeBtn.onclick = () => modal.classList.remove('active');
        travelBtn.onclick = () => {
            this.fastTravel(poi.id);
            modal.classList.remove('active');
        };
        waypointBtn.onclick = () => {
            this.setWaypoint(poi);
            modal.classList.remove('active');
        };
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const wrapper = this.canvas.parentElement;
        this.canvas.width = wrapper.clientWidth;
        this.canvas.height = wrapper.clientHeight;

        if (this.fogCanvas) {
            this.fogCanvas.width = wrapper.clientWidth;
            this.fogCanvas.height = wrapper.clientHeight;
        }

        this.renderMap();
    }

    renderMap() {
        if (!this.ctx) return;

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Save context state
        this.ctx.save();

        // Apply transformations
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, width / this.zoom, height / this.zoom);

        // Draw map terrain (simplified)
        this.drawTerrain();

        // Restore context
        this.ctx.restore();

        // Render fog of war
        if (this.fogEnabled) {
            this.renderFogOfWar();
        }
    }

    drawTerrain() {
        // Draw some basic terrain features
        this.ctx.fillStyle = '#2a4a3a';
        this.ctx.fillRect(100, 100, 300, 200); // Forest area

        this.ctx.fillStyle = '#3a5a6a';
        this.ctx.fillRect(500, 300, 200, 150); // Water area

        this.ctx.fillStyle = '#5a4a3a';
        this.ctx.fillRect(200, 400, 250, 100); // Mountain area

        // Draw paths
        this.ctx.strokeStyle = '#8a7a6a';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(400, 300);
        this.ctx.lineTo(500, 400);
        this.ctx.lineTo(600, 350);
        this.ctx.stroke();
    }

    renderFogOfWar() {
        if (!this.fogCtx) return;

        const width = this.fogCanvas.width;
        const height = this.fogCanvas.height;

        // Clear fog canvas
        this.fogCtx.clearRect(0, 0, width, height);

        // Draw fog overlay
        this.fogCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.fogCtx.fillRect(0, 0, width, height);

        // Clear fog around player and discovered areas
        this.fogCtx.globalCompositeOperation = 'destination-out';

        // Clear around player
        const playerScreenPos = this.worldToScreen(this.playerPosition);
        this.fogCtx.beginPath();
        this.fogCtx.arc(playerScreenPos.x, playerScreenPos.y, 150 * this.zoom, 0, Math.PI * 2);
        this.fogCtx.fill();

        // Clear around discovered POIs
        this.pois.forEach(poi => {
            if (poi.discovered) {
                const poiScreenPos = this.worldToScreen(poi.position);
                this.fogCtx.beginPath();
                this.fogCtx.arc(poiScreenPos.x, poiScreenPos.y, 100 * this.zoom, 0, Math.PI * 2);
                this.fogCtx.fill();
            }
        });

        this.fogCtx.globalCompositeOperation = 'source-over';
    }

    worldToScreen(worldPos) {
        return {
            x: worldPos.x * this.zoom + this.offset.x,
            y: worldPos.y * this.zoom + this.offset.y
        };
    }

    screenToWorld(screenPos) {
        return {
            x: (screenPos.x - this.offset.x) / this.zoom,
            y: (screenPos.y - this.offset.y) / this.zoom
        };
    }

    startPan(e) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
        this.canvas.style.cursor = 'grabbing';
    }

    pan(e) {
        if (!this.isPanning) return;

        this.offset.x = e.clientX - this.panStart.x;
        this.offset.y = e.clientY - this.panStart.y;

        this.renderMap();
        this.updatePlayerMarker();
    }

    endPan() {
        this.isPanning = false;
        this.canvas.style.cursor = 'grab';
    }

    handleWheel(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta));

        // Zoom towards mouse position
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldPos = this.screenToWorld({ x: mouseX, y: mouseY });

        this.zoom = newZoom;

        const newScreenPos = this.worldToScreen(worldPos);
        this.offset.x += mouseX - newScreenPos.x;
        this.offset.y += mouseY - newScreenPos.y;

        this.updateZoomDisplay();
        this.renderMap();
        this.updatePlayerMarker();
    }

    zoomIn() {
        this.zoom = Math.min(this.maxZoom, this.zoom + this.zoomStep);
        this.updateZoomDisplay();
        this.renderMap();
        this.updatePlayerMarker();
    }

    zoomOut() {
        this.zoom = Math.max(this.minZoom, this.zoom - this.zoomStep);
        this.updateZoomDisplay();
        this.renderMap();
        this.updatePlayerMarker();
    }

    updateZoomDisplay() {
        const zoomDisplay = this.overlay.querySelector('[data-zoom-level]');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }

    centerOnPlayer() {
        const canvasCenter = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };

        this.offset.x = canvasCenter.x - this.playerPosition.x * this.zoom;
        this.offset.y = canvasCenter.y - this.playerPosition.y * this.zoom;

        this.renderMap();
        this.updatePlayerMarker();
    }

    resetView() {
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };
        this.updateZoomDisplay();
        this.renderMap();
        this.updatePlayerMarker();
    }

    updatePlayerMarker() {
        const marker = this.overlay.querySelector('[data-player-marker]');
        if (!marker) return;

        const screenPos = this.worldToScreen(this.playerPosition);
        marker.style.left = `${screenPos.x}px`;
        marker.style.top = `${screenPos.y}px`;
    }

    fastTravel(locationId) {
        if (!this.discoveredLocations.has(locationId)) {
            this.showNotification('Location not yet discovered!', 'warning');
            return;
        }

        // Find POI or location
        const poi = this.pois.find(p => p.id === locationId);
        if (poi) {
            this.playerPosition = { ...poi.position };
            this.updatePlayerMarker();
            this.centerOnPlayer();
            this.showNotification(`Traveled to ${poi.name}`, 'success');
        }

        // In production, this would trigger actual game travel
        console.log('Fast traveling to:', locationId);
    }

    setWaypoint(poi) {
        this.showNotification(`Waypoint set: ${poi.name}`, 'info');
        // In production, this would set a waypoint marker on the HUD
        console.log('Waypoint set:', poi);
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'Escape':
                this.close();
                break;
            case '+':
            case '=':
                this.zoomIn();
                break;
            case '-':
            case '_':
                this.zoomOut();
                break;
            case 'c':
            case 'C':
                this.centerOnPlayer();
                break;
        }
    }

    showNotification(message, type = 'info') {
        // In production, integrate with game notification system
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `map-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--settings-bg-card);
            border: 1px solid var(--settings-${type});
            border-radius: 0.5rem;
            color: var(--settings-text-primary);
            box-shadow: var(--settings-shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    open() {
        if (this.isOpen) return;

        this.overlay.classList.add('active');
        this.isOpen = true;

        // Update current location
        const locationDisplay = this.overlay.querySelector('[data-current-location]');
        if (locationDisplay) {
            locationDisplay.textContent = 'Town Square'; // In production, get from game state
        }

        // Update exploration stats
        this.updateExplorationStats();

        // Center on player
        setTimeout(() => {
            this.centerOnPlayer();
        }, 100);

        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.isOpen) return;

        this.overlay.classList.remove('active');
        this.isOpen = false;

        // Close any open modals
        const poiModal = this.overlay.querySelector('[data-poi-modal]');
        if (poiModal) {
            poiModal.classList.remove('active');
        }

        // Re-enable body scroll
        document.body.style.overflow = '';
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    updateExplorationStats() {
        const exploredPercent = this.overlay.querySelector('[data-explored-percent]');
        const locationsDiscovered = this.overlay.querySelector('[data-locations-discovered]');
        const locationsTotal = this.overlay.querySelector('[data-locations-total]');
        const secretsFound = this.overlay.querySelector('[data-secrets-found]');
        const secretsTotal = this.overlay.querySelector('[data-secrets-total]');
        const explorationFill = this.overlay.querySelector('[data-exploration-fill]');

        // In production, get these from game state
        const stats = {
            exploredPercent: 15,
            locationsDiscovered: this.discoveredLocations.size,
            locationsTotal: 12,
            secretsFound: 0,
            secretsTotal: 8
        };

        if (exploredPercent) exploredPercent.textContent = `${stats.exploredPercent}%`;
        if (locationsDiscovered) locationsDiscovered.textContent = stats.locationsDiscovered;
        if (locationsTotal) locationsTotal.textContent = stats.locationsTotal;
        if (secretsFound) secretsFound.textContent = stats.secretsFound;
        if (secretsTotal) secretsTotal.textContent = stats.secretsTotal;
        if (explorationFill) explorationFill.style.width = `${stats.exploredPercent}%`;
    }

    // Public API for game integration
    discoverLocation(locationId) {
        this.discoveredLocations.add(locationId);
        this.updateLocations();
        this.updateExplorationStats();
    }

    updateLocations() {
        // Update locations list in sidebar
        const locationsList = this.overlay.querySelector('[data-locations-list]');
        if (!locationsList) return;

        // In production, populate from game state
        // For now, just update lock states
        const locationItems = locationsList.querySelectorAll('.location-item');
        locationItems.forEach(item => {
            const locationId = item.dataset.locationId;
            if (this.discoveredLocations.has(locationId)) {
                item.classList.remove('locked');
                item.querySelector('.travel-btn').disabled = false;
            }
        });
    }

    setPlayerPosition(x, y) {
        this.playerPosition = { x, y };
        this.updatePlayerMarker();
        this.renderMap();
    }

    addPOI(poi) {
        this.pois.push(poi);
        this.renderPOIs();
    }
}

// Initialize map overlay manager
let mapOverlayManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mapOverlayManager = new MapOverlayManager();
    });
} else {
    mapOverlayManager = new MapOverlayManager();
}

// Export for global access
window.MapOverlayManager = MapOverlayManager;
window.mapOverlay = mapOverlayManager;
