#!/bin/bash
################################################################################
# Database Backup Script for The Arcane Codex
# This script creates compressed backups of the SQLite database and manages
# backup retention according to the configured policy.
################################################################################

set -euo pipefail  # Exit on error, undefined vars, and pipe failures

# Configuration
DB_PATH="${DB_PATH:-/var/lib/arcane-codex/arcane_codex.db}"
BACKUP_DIR="${DB_BACKUP_DIR:-/var/backups/arcane-codex}"
RETENTION_DAYS="${DB_BACKUP_RETENTION_DAYS:-30}"
LOG_FILE="${LOG_FILE:-/var/log/arcane-codex/backup.log}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="arcane_codex_${TIMESTAMP}.db"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "$@"
    echo -e "${GREEN}[INFO]${NC} $@"
}

log_error() {
    log "ERROR" "$@"
    echo -e "${RED}[ERROR]${NC} $@" >&2
}

log_warning() {
    log "WARNING" "$@"
    echo -e "${YELLOW}[WARNING]${NC} $@"
}

# Check if database exists
check_database() {
    if [[ ! -f "$DB_PATH" ]]; then
        log_error "Database file not found: $DB_PATH"
        exit 1
    fi
    log_info "Database found: $DB_PATH"
}

# Create backup directory if it doesn't exist
setup_backup_directory() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
        chmod 750 "$BACKUP_DIR"
    fi
}

# Verify database integrity before backup
verify_database_integrity() {
    log_info "Verifying database integrity..."

    if ! sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
        log_error "Database integrity check failed!"
        return 1
    fi

    log_info "Database integrity check passed"
    return 0
}

# Create the backup
create_backup() {
    log_info "Creating backup: $BACKUP_PATH"

    # Use SQLite's backup command for online backup
    if command -v sqlite3 &> /dev/null; then
        sqlite3 "$DB_PATH" ".backup '$BACKUP_PATH'"
    else
        # Fallback to simple copy
        cp "$DB_PATH" "$BACKUP_PATH"
    fi

    # Verify backup was created
    if [[ ! -f "$BACKUP_PATH" ]]; then
        log_error "Backup file was not created!"
        exit 1
    fi

    # Get file sizes
    local original_size=$(stat -f%z "$DB_PATH" 2>/dev/null || stat -c%s "$DB_PATH")
    local backup_size=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || stat -c%s "$BACKUP_PATH")

    log_info "Original size: $(numfmt --to=iec-i --suffix=B $original_size 2>/dev/null || echo ${original_size}B)"
    log_info "Backup size: $(numfmt --to=iec-i --suffix=B $backup_size 2>/dev/null || echo ${backup_size}B)"
}

# Compress the backup
compress_backup() {
    log_info "Compressing backup..."

    if command -v gzip &> /dev/null; then
        gzip -9 "$BACKUP_PATH"
        BACKUP_PATH="${BACKUP_PATH}.gz"

        local compressed_size=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || stat -c%s "$BACKUP_PATH")
        log_info "Compressed size: $(numfmt --to=iec-i --suffix=B $compressed_size 2>/dev/null || echo ${compressed_size}B)"
    else
        log_warning "gzip not found, skipping compression"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

    local deleted_count=0

    # Find and delete old backups
    while IFS= read -r old_backup; do
        if [[ -n "$old_backup" ]]; then
            log_info "Deleting old backup: $(basename "$old_backup")"
            rm -f "$old_backup"
            ((deleted_count++))
        fi
    done < <(find "$BACKUP_DIR" -name "arcane_codex_*.db*" -type f -mtime +${RETENTION_DAYS})

    if [[ $deleted_count -gt 0 ]]; then
        log_info "Deleted $deleted_count old backup(s)"
    else
        log_info "No old backups to delete"
    fi
}

# List recent backups
list_recent_backups() {
    log_info "Recent backups:"

    local backup_count=0
    while IFS= read -r backup_file; do
        if [[ -n "$backup_file" ]]; then
            local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
            local formatted_size=$(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B")
            log_info "  $(basename "$backup_file") - $formatted_size"
            ((backup_count++))
        fi
    done < <(find "$BACKUP_DIR" -name "arcane_codex_*.db*" -type f | sort -r | head -10)

    log_info "Total backups in directory: $backup_count (showing last 10)"
}

# Calculate total backup size
calculate_backup_size() {
    local total_size=0

    while IFS= read -r backup_file; do
        if [[ -n "$backup_file" ]]; then
            local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
            total_size=$((total_size + size))
        fi
    done < <(find "$BACKUP_DIR" -name "arcane_codex_*.db*" -type f)

    log_info "Total backup storage used: $(numfmt --to=iec-i --suffix=B $total_size 2>/dev/null || echo ${total_size}B)"
}

# Main execution
main() {
    log_info "========================================"
    log_info "Starting database backup process"
    log_info "========================================"

    # Setup
    check_database
    setup_backup_directory

    # Verify database integrity
    if ! verify_database_integrity; then
        log_error "Backup aborted due to integrity check failure"
        exit 1
    fi

    # Create and compress backup
    create_backup

    if [[ "${DB_BACKUP_COMPRESSION:-true}" == "true" ]]; then
        compress_backup
    fi

    # Cleanup
    cleanup_old_backups

    # Report
    list_recent_backups
    calculate_backup_size

    log_info "========================================"
    log_info "Backup completed successfully!"
    log_info "Backup location: $BACKUP_PATH"
    log_info "========================================"
}

# Run main function
main "$@"
