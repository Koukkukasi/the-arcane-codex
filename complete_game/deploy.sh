#!/bin/bash
################################################################################
# Automated Deployment Script for The Arcane Codex
# Performs zero-downtime deployment with health checks and automatic rollback
################################################################################

set -euo pipefail

# Configuration
APP_NAME="arcane-codex"
APP_DIR="/opt/${APP_NAME}"
DEPLOY_USER="www-data"
BACKUP_DIR="/var/backups/${APP_NAME}/deployments"
VENV_DIR="${APP_DIR}/venv"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $@"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $@" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $@"
}

log_step() {
    echo -e "\n${BLUE}[STEP]${NC} $@"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log_step "Running pre-deployment checks..."

    # Check if service exists
    if ! systemctl list-units --full -all | grep -q "${APP_NAME}.service"; then
        log_error "Service ${APP_NAME}.service not found"
        exit 1
    fi

    # Check if application directory exists
    if [[ ! -d "$APP_DIR" ]]; then
        log_error "Application directory ${APP_DIR} not found"
        exit 1
    fi

    # Check if virtual environment exists
    if [[ ! -d "$VENV_DIR" ]]; then
        log_error "Virtual environment ${VENV_DIR} not found"
        exit 1
    fi

    log_info "Pre-deployment checks passed"
}

# Create backup of current deployment
backup_current_deployment() {
    log_step "Creating backup of current deployment..."

    mkdir -p "$BACKUP_DIR"
    BACKUP_PATH="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

    tar -czf "$BACKUP_PATH" \
        -C "$(dirname $APP_DIR)" \
        "$(basename $APP_DIR)" \
        --exclude='*.pyc' \
        --exclude='__pycache__' \
        --exclude='.git' \
        --exclude='venv'

    log_info "Backup created: $BACKUP_PATH"
    echo "$BACKUP_PATH" > "${BACKUP_DIR}/latest_backup.txt"
}

# Pull latest code from repository
pull_latest_code() {
    log_step "Pulling latest code..."

    cd "$APP_DIR"

    if [[ -d .git ]]; then
        # Save current commit for rollback
        git rev-parse HEAD > "${BACKUP_DIR}/commit_${TIMESTAMP}.txt"

        # Pull latest changes
        sudo -u "$DEPLOY_USER" git fetch origin
        sudo -u "$DEPLOY_USER" git pull origin main

        log_info "Code updated to: $(git rev-parse --short HEAD)"
    else
        log_warning "Not a git repository, skipping code pull"
    fi
}

# Update dependencies
update_dependencies() {
    log_step "Updating dependencies..."

    cd "$APP_DIR"

    # Activate virtual environment
    source "${VENV_DIR}/bin/activate"

    # Upgrade pip
    pip install --upgrade pip

    # Install/update requirements
    if [[ -f requirements.txt ]]; then
        pip install -r requirements.txt --upgrade
        log_info "Dependencies updated"
    fi

    if [[ -f requirements-production.txt ]]; then
        pip install -r requirements-production.txt --upgrade
        log_info "Production dependencies updated"
    fi

    deactivate
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."

    cd "$APP_DIR"
    source "${VENV_DIR}/bin/activate"

    if [[ -f run_migrations.py ]]; then
        python run_migrations.py migrate
        log_info "Migrations completed"
    else
        log_warning "No migration script found, skipping"
    fi

    deactivate
}

# Run tests
run_tests() {
    log_step "Running tests..."

    cd "$APP_DIR"
    source "${VENV_DIR}/bin/activate"

    if [[ -f tests/test_*.py ]] || [[ -d tests ]]; then
        if command -v pytest &> /dev/null; then
            pytest tests/ -v --tb=short || {
                log_error "Tests failed!"
                return 1
            }
            log_info "Tests passed"
        else
            log_warning "pytest not installed, skipping tests"
        fi
    else
        log_warning "No tests found, skipping"
    fi

    deactivate
}

# Reload application
reload_application() {
    log_step "Reloading application..."

    # Reload systemd service (graceful reload)
    systemctl reload "${APP_NAME}.service" || {
        log_warning "Reload failed, trying restart..."
        systemctl restart "${APP_NAME}.service"
    }

    # Wait for service to be active
    sleep 5

    if systemctl is-active --quiet "${APP_NAME}.service"; then
        log_info "Application reloaded successfully"
    else
        log_error "Application failed to start!"
        return 1
    fi
}

# Health check
health_check() {
    log_step "Running health check..."

    local max_attempts=10
    local attempt=1
    local health_url="http://localhost:5000/health"

    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."

        if curl -sf "$health_url" > /dev/null; then
            log_info "Health check passed!"
            return 0
        fi

        sleep 3
        ((attempt++))
    done

    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Cleanup old backups
cleanup_old_backups() {
    log_step "Cleaning up old backups..."

    # Keep last 10 backups
    cd "$BACKUP_DIR"
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f

    local remaining=$(ls -1 backup_*.tar.gz 2>/dev/null | wc -l)
    log_info "Kept $remaining most recent backups"
}

# Rollback on failure
rollback_on_failure() {
    log_error "Deployment failed! Initiating rollback..."

    if [[ -f "${BACKUP_DIR}/latest_backup.txt" ]]; then
        local latest_backup=$(cat "${BACKUP_DIR}/latest_backup.txt")

        if [[ -f "$latest_backup" ]]; then
            log_info "Restoring from backup: $latest_backup"

            # Stop service
            systemctl stop "${APP_NAME}.service"

            # Restore backup
            tar -xzf "$latest_backup" -C "$(dirname $APP_DIR)"

            # Restart service
            systemctl start "${APP_NAME}.service"

            log_info "Rollback completed"
        else
            log_error "Backup file not found: $latest_backup"
        fi
    else
        log_error "No backup reference found"
    fi

    exit 1
}

# Main deployment process
main() {
    log_info "========================================="
    log_info "Starting deployment of ${APP_NAME}"
    log_info "Timestamp: $TIMESTAMP"
    log_info "========================================="

    # Check prerequisites
    check_root
    pre_deployment_checks

    # Create backup
    backup_current_deployment

    # Update code and dependencies
    pull_latest_code || rollback_on_failure
    update_dependencies || rollback_on_failure

    # Run migrations
    run_migrations || rollback_on_failure

    # Optional: Run tests
    if [[ "${RUN_TESTS:-false}" == "true" ]]; then
        run_tests || rollback_on_failure
    fi

    # Reload application
    reload_application || rollback_on_failure

    # Health check
    health_check || rollback_on_failure

    # Cleanup
    cleanup_old_backups

    log_info "========================================="
    log_info "Deployment completed successfully!"
    log_info "========================================="
}

# Handle errors
trap rollback_on_failure ERR

# Run main
main "$@"
