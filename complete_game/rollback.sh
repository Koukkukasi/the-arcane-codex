#!/bin/bash
################################################################################
# Emergency Rollback Script for The Arcane Codex
# Quickly restores the previous deployment in case of critical issues
################################################################################

set -euo pipefail

# Configuration
APP_NAME="arcane-codex"
APP_DIR="/opt/${APP_NAME}"
BACKUP_DIR="/var/backups/${APP_NAME}/deployments"

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

# List available backups
list_backups() {
    log_step "Available backups:"

    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi

    cd "$BACKUP_DIR"

    local backups=($(ls -t backup_*.tar.gz 2>/dev/null))

    if [[ ${#backups[@]} -eq 0 ]]; then
        log_error "No backups found in $BACKUP_DIR"
        exit 1
    fi

    local index=1
    for backup in "${backups[@]}"; do
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -c %y "$backup" | cut -d' ' -f1,2 | cut -d'.' -f1)
        echo "  [$index] $backup - $size - $date"
        ((index++))
    done

    echo "${backups[@]}"
}

# Select backup to restore
select_backup() {
    local backups=($@)

    if [[ ${#backups[@]} -eq 1 ]]; then
        echo "${backups[0]}"
        return
    fi

    echo ""
    read -p "Select backup number to restore (1-${#backups[@]}) or press Enter for latest: " selection

    if [[ -z "$selection" ]]; then
        echo "${backups[0]}"
    elif [[ "$selection" =~ ^[0-9]+$ ]] && [[ $selection -ge 1 ]] && [[ $selection -le ${#backups[@]} ]]; then
        echo "${backups[$((selection-1))]}"
    else
        log_error "Invalid selection"
        exit 1
    fi
}

# Confirm rollback
confirm_rollback() {
    local backup_file=$1

    log_warning "=========================================="
    log_warning "EMERGENCY ROLLBACK"
    log_warning "=========================================="
    log_warning "This will restore the application from:"
    log_warning "  $backup_file"
    log_warning ""
    log_warning "Current application will be STOPPED"
    log_warning "All current files will be REPLACED"
    log_warning "=========================================="

    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [[ "$confirm" != "yes" ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
}

# Backup current state before rollback
backup_current_state() {
    log_step "Creating safety backup of current state..."

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local safety_backup="${BACKUP_DIR}/pre_rollback_${timestamp}.tar.gz"

    tar -czf "$safety_backup" \
        -C "$(dirname $APP_DIR)" \
        "$(basename $APP_DIR)" \
        --exclude='*.pyc' \
        --exclude='__pycache__' \
        --exclude='.git' \
        --exclude='venv' \
        2>/dev/null || true

    log_info "Safety backup created: $safety_backup"
}

# Stop application
stop_application() {
    log_step "Stopping application..."

    if systemctl is-active --quiet "${APP_NAME}.service"; then
        systemctl stop "${APP_NAME}.service"
        log_info "Application stopped"
    else
        log_warning "Application was not running"
    fi

    # Wait for service to fully stop
    sleep 3
}

# Restore from backup
restore_backup() {
    local backup_file=$1

    log_step "Restoring from backup..."

    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi

    # Extract backup
    tar -xzf "$backup_file" -C "$(dirname $APP_DIR)"

    log_info "Files restored from backup"

    # Set proper permissions
    chown -R www-data:www-data "$APP_DIR"
    chmod -R 755 "$APP_DIR"

    log_info "Permissions restored"
}

# Restore database backup (if exists)
restore_database() {
    local backup_file=$1
    local db_backup_dir="/var/backups/${APP_NAME}"
    local backup_timestamp=$(echo "$backup_file" | grep -oP '\d{8}_\d{6}')

    log_step "Looking for database backup..."

    if [[ -n "$backup_timestamp" ]]; then
        # Look for database backup with matching timestamp
        local db_backup=$(find "$db_backup_dir" -name "*${backup_timestamp}*" -type f 2>/dev/null | head -1)

        if [[ -n "$db_backup" ]]; then
            log_info "Found database backup: $db_backup"

            read -p "Restore database backup? (yes/no): " restore_db

            if [[ "$restore_db" == "yes" ]]; then
                local db_path="${DB_PATH:-/var/lib/arcane-codex/arcane_codex.db}"

                # Decompress if needed
                if [[ "$db_backup" == *.gz ]]; then
                    gunzip -c "$db_backup" > "$db_path"
                else
                    cp "$db_backup" "$db_path"
                fi

                log_info "Database restored"
            else
                log_warning "Database restore skipped"
            fi
        else
            log_warning "No matching database backup found"
        fi
    fi
}

# Start application
start_application() {
    log_step "Starting application..."

    systemctl start "${APP_NAME}.service"

    # Wait for service to start
    sleep 5

    if systemctl is-active --quiet "${APP_NAME}.service"; then
        log_info "Application started successfully"
    else
        log_error "Application failed to start!"
        log_error "Check logs: journalctl -u ${APP_NAME}.service -n 50"
        exit 1
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

        if curl -sf "$health_url" > /dev/null 2>&1; then
            log_info "Health check passed!"
            return 0
        fi

        sleep 3
        ((attempt++))
    done

    log_error "Health check failed after $max_attempts attempts"
    log_warning "Application may not be fully functional"
    return 1
}

# Rollback git commit (if applicable)
rollback_git_commit() {
    local backup_file=$1
    local backup_timestamp=$(echo "$backup_file" | grep -oP '\d{8}_\d{6}')

    if [[ ! -d "${APP_DIR}/.git" ]]; then
        log_info "Not a git repository, skipping git rollback"
        return
    fi

    log_step "Checking for git commit to restore..."

    local commit_file="${BACKUP_DIR}/commit_${backup_timestamp}.txt"

    if [[ -f "$commit_file" ]]; then
        local target_commit=$(cat "$commit_file")
        log_info "Found git commit: $target_commit"

        cd "$APP_DIR"
        sudo -u www-data git reset --hard "$target_commit" 2>/dev/null || true
        log_info "Git repository reset to previous commit"
    else
        log_warning "No git commit information found"
    fi
}

# Main rollback process
main() {
    log_info "========================================="
    log_info "Emergency Rollback Script"
    log_info "The Arcane Codex"
    log_info "========================================="

    # Check prerequisites
    check_root

    # List and select backup
    local backups=($(list_backups))
    local selected_backup=$(select_backup "${backups[@]}")
    local backup_path="${BACKUP_DIR}/${selected_backup}"

    # Confirm rollback
    confirm_rollback "$selected_backup"

    # Create safety backup
    backup_current_state

    # Stop application
    stop_application

    # Restore from backup
    restore_backup "$backup_path"

    # Rollback git commit if possible
    rollback_git_commit "$selected_backup"

    # Optional: Restore database
    restore_database "$selected_backup"

    # Start application
    start_application

    # Health check
    if health_check; then
        log_info "========================================="
        log_info "Rollback completed successfully!"
        log_info "Application is healthy and running"
        log_info "========================================="
    else
        log_warning "========================================="
        log_warning "Rollback completed with warnings"
        log_warning "Please check application health manually"
        log_warning "Logs: journalctl -u ${APP_NAME}.service -f"
        log_warning "========================================="
    fi
}

# Run main
main "$@"
