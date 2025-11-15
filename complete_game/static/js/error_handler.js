/**
 * Enhanced Error Handling and Logging for Arcane Codex
 * Provides client-side error tracking, retry logic, and server-side logging
 */

class ErrorHandler {
    constructor() {
        this.retryCount = {};
        this.maxRetries = 3;
        this.baseRetryDelay = 1000; // 1 second
        this.errorLog = [];
        this.maxLogSize = 50;

        // Setup global error handlers
        this.setupGlobalErrorHandlers();
    }

    /**
     * Setup global error handlers for uncaught errors and promise rejections
     */
    setupGlobalErrorHandlers() {
        // Catch global errors
        window.addEventListener('error', (event) => {
            this.logError(
                event.error?.message || 'Unknown error',
                {
                    type: 'uncaught_error',
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack
                }
            );
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError(
                event.reason?.message || 'Unhandled promise rejection',
                {
                    type: 'unhandled_promise_rejection',
                    reason: event.reason?.message,
                    stack: event.reason?.stack
                }
            );
        });
    }

    /**
     * Make API call with automatic retry logic
     * @param {string} endpoint API endpoint
     * @param {object} options Request options
     * @param {number} retries Number of retries (default: 3)
     * @returns {Promise} API response
     */
    async apiCallWithRetry(endpoint, options = {}, retries = this.maxRetries) {
        const requestId = `${endpoint}_${Date.now()}`;
        this.retryCount[requestId] = 0;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Show loading state on first attempt
                if (attempt === 0 && window.gameUX) {
                    window.gameUX.showLoading?.();
                }

                const response = await fetch(endpoint, options);

                // Hide loading state
                if (window.gameUX) {
                    window.gameUX.hideLoading?.();
                }

                // Handle non-OK responses
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const error = new Error(
                        errorData.error ||
                        errorData.message ||
                        `HTTP ${response.status}`
                    );
                    error.status = response.status;
                    throw error;
                }

                const data = await response.json();

                // Clear retry count on success
                delete this.retryCount[requestId];

                return data;

            } catch (error) {
                this.retryCount[requestId]++;

                // Log the error
                this.logError(`API call to ${endpoint} failed`, {
                    endpoint,
                    attempt: attempt + 1,
                    maxRetries: retries,
                    error: error.message,
                    status: error.status
                });

                // If last attempt, throw the error
                if (attempt === retries - 1) {
                    // Hide loading state
                    if (window.gameUX) {
                        window.gameUX.hideLoading?.();
                    }

                    // Show user-friendly error
                    this.showErrorToUser(error.message || 'Network error. Please try again.');

                    throw error;
                }

                // Calculate exponential backoff
                const delayMs = this.baseRetryDelay * Math.pow(2, attempt);
                console.log(`Retrying ${endpoint} in ${delayMs}ms (attempt ${attempt + 1}/${retries})`);

                // Wait before retrying
                await this.sleep(delayMs);
            }
        }
    }

    /**
     * Display error message to user
     * @param {string} message Error message to display
     * @param {number} duration Duration to show (default: 5000ms)
     */
    showErrorToUser(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'assertive');

        // Create error content
        errorDiv.innerHTML = `
            <div class="error-toast-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${this.escapeHtml(message)}</span>
                <button class="error-close" aria-label="Close error">&times;</button>
            </div>
        `;

        // Add close handler
        const closeBtn = errorDiv.querySelector('.error-close');
        closeBtn.addEventListener('click', () => {
            errorDiv.remove();
        });

        document.body.appendChild(errorDiv);

        // Add animation
        errorDiv.classList.add('show');

        // Auto-remove after duration
        const timeoutId = setTimeout(() => {
            errorDiv.classList.remove('show');
            setTimeout(() => errorDiv.remove(), 300);
        }, duration);

        // Allow manual dismiss to cancel auto-remove
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeoutId);
        });
    }

    /**
     * Display success message to user
     * @param {string} message Success message to display
     * @param {number} duration Duration to show (default: 3000ms)
     */
    showSuccessToUser(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.setAttribute('role', 'status');
        successDiv.setAttribute('aria-live', 'polite');

        // Create success content
        successDiv.innerHTML = `
            <div class="success-toast-content">
                <span class="success-icon">✓</span>
                <span class="success-message">${this.escapeHtml(message)}</span>
            </div>
        `;

        document.body.appendChild(successDiv);

        // Add animation
        successDiv.classList.add('show');

        // Auto-remove after duration
        setTimeout(() => {
            successDiv.classList.remove('show');
            setTimeout(() => successDiv.remove(), 300);
        }, duration);
    }

    /**
     * Log error to server for monitoring
     * @param {string} error Error message
     * @param {object} context Additional context
     */
    async logErrorToServer(error, context = {}) {
        try {
            const errorData = {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : '',
                context: context.endpoint || context.action || 'unknown',
                timestamp: new Date().toISOString(),
                ...context
            };

            // Log to server (silent failure if logging endpoint unavailable)
            await fetch('/api/log_client_error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorData)
            }).catch(() => {
                // Silent fail - don't interrupt user experience
                console.warn('Failed to log error to server');
            });
        } catch (err) {
            // Silently fail to avoid recursive errors
            console.warn('Error logging to server:', err);
        }
    }

    /**
     * Log client error with context
     * @param {string} message Error message
     * @param {object} context Additional context
     */
    logError(message, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message,
            context,
            url: window.location.href
        };

        // Add to local log
        this.errorLog.push(errorEntry);

        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Log to console
        console.error(`[${errorEntry.timestamp}] ${message}`, context);

        // Log to server asynchronously (non-blocking)
        this.logErrorToServer(new Error(message), context);
    }

    /**
     * Utility: Sleep for specified milliseconds
     * @param {number} ms Milliseconds to sleep
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Utility: Escape HTML to prevent XSS
     * @param {string} text Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get error log for debugging
     * @returns {array} Array of logged errors
     */
    getErrorLog() {
        return this.errorLog;
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
    }

    /**
     * Export error log as JSON
     * @returns {string} JSON string of error log
     */
    exportErrorLog() {
        return JSON.stringify(this.errorLog, null, 2);
    }
}

/**
 * Global UX Handler for showing/hiding loading states
 */
class GameUX {
    constructor() {
        this.loadingOverlay = null;
        this.loadingCount = 0; // Track nested loading calls
    }

    /**
     * Show loading overlay
     * @param {string} message Loading message
     */
    showLoading(message = 'Loading...') {
        this.loadingCount++;

        if (!this.loadingOverlay) {
            this.loadingOverlay = document.createElement('div');
            this.loadingOverlay.className = 'loading-overlay';
            this.loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p class="loading-message">${this.escapeHtml(message)}</p>
                </div>
            `;
            document.body.appendChild(this.loadingOverlay);
        } else {
            // Update message
            const messageEl = this.loadingOverlay.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.loadingCount--;

        // Only hide if all loading calls are done
        if (this.loadingCount <= 0) {
            if (this.loadingOverlay) {
                this.loadingOverlay.remove();
                this.loadingOverlay = null;
            }
            this.loadingCount = 0;
        }
    }

    /**
     * Utility: Escape HTML to prevent XSS
     * @param {string} text Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize global error handler and UX handler
const errorHandler = new ErrorHandler();
const gameUX = new GameUX();

// Make them globally available
window.errorHandler = errorHandler;
window.gameUX = gameUX;

console.log('[ErrorHandler] Initialized with retry logic and error tracking');
