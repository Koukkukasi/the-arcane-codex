# Phase C: Clean & Reorganize - Cleanup Plan

**Date**: 2025-11-15
**Status**: Ready to Execute

---

## 📊 Cleanup Analysis

### Files to Delete/Reorganize:
- **4** backup files (*.backup, *.bak, *_backup.*)
- **6** intermediate HTML files (*_pre_*, *_integrated*)
- **53** test files (test_*.py, test_*.js, test_*.html)
- **Total**: ~63 files to cleanup

### Files to Consolidate:
- **3 Flask apps**: app.py (13K), app_production.py (24K), web_game.py (43K)
- **2 Database modules**: database.py (21K), database_pooled.py (25K)

---

## 🎯 Phase C Tasks

### TASK 1: Delete Backup Files ✓
**Files to Delete (4)**:
```
./mcp_client.py.backup
./static/arcane_codex_scenario_ui_enhanced.html.backup
./static/arcane_codex_scenario_ui_enhanced.html.bak
./static/arcane_codex_scenario_ui_enhanced_backup.html
```

**Action**: `git rm` these files (already in git) or `rm` if untracked
**Space Saved**: ~500KB

---

### TASK 2: Delete Intermediate HTML Files ✓
**Files to Delete (6)**:
```
./static/arcane_codex_integrated_working.html
./static/arcane_codex_scenario_ui_enhanced_backup_pre_styles.html
./static/arcane_codex_scenario_ui_enhanced_integrated.html
./static/arcane_codex_scenario_ui_enhanced_pre_map.html
./static/arcane_codex_scenario_ui_enhanced_visual.html
./static/temp_integrated.html
```

**Action**: Delete these development artifacts
**Space Saved**: ~1.5MB

---

### TASK 3: Organize Test Files ✓
**Current State**: Test files scattered across:
- Root directory (test_*.py, test_*.js)
- /static directory (test_*.py, test_*.js)
- /tests directory (proper location)

**Action**:
1. Keep `/tests` directory
2. Move all root test files → `/tests`
3. Move all static test files → `/tests`
4. Preserve test_screenshots_phase4/ in current location

**Files to Move**: 53 test files

---

### TASK 4: Remove Database from Git Tracking ✓
**File**: arcane_codex.db (108KB)

**Action**:
```bash
git rm --cached arcane_codex.db
# Already in .gitignore (Phase A)
```

---

### TASK 5: Analyze Flask Apps 🔍
**Current State**:
- `app.py` (13K) - SocketIO server
- `app_production.py` (24K) - Production SocketIO server
- `web_game.py` (43K) - Main Flask server with MCP (CURRENT PRODUCTION)

**Analysis Needed**:
1. Which app is actively used?
2. Can we merge app.py + app_production.py?
3. Is web_game.py the primary entry point?

**Decision**: To be made after code analysis

---

### TASK 6: Consolidate Database Modules 🔍
**Current State**:
- `database.py` (21K) - Standard database operations
- `database_pooled.py` (25K) - Connection pooling version

**Analysis Needed**:
1. Which version is used by production?
2. Can we merge both into one with pooling enabled by default?

**Decision**: To be made after code analysis

---

### TASK 7: Remove Orphaned Files ✓
**Files to Check and Remove**:
```
mcp_client_fixed.py (if exists)
*.txt patch notes
apply_visual_polish.py (development script)
map_visual_demo.html (demo file)
```

**Action**: Delete files not needed in production

---

### TASK 8: Update Dependencies ✓
**Current State** (from requirements.txt):
```
Flask==3.0.0           → Update to 3.1.2
flask-cors==6.0.1      ✓ Already updated (Phase A)
Flask-WTF==1.2.2       ✓ Already updated (Phase A)
psutil==5.9.6          → Update to latest
eventlet==0.33.3       → Check for updates
```

**Action**: Update all outdated packages

---

### TASK 9: Verification ✓
**Final Checks**:
1. All tests still in `/tests` directory
2. No backup files remaining
3. Production app identified and working
4. Database module consolidated
5. All dependencies updated
6. Git status clean
7. Project size reduced

---

## 📈 Expected Results

### Before:
- **Files**: ~200+ files (including 63 cleanup targets)
- **Size**: ~15MB+ (with backups and test files)
- **Organization**: Scattered test files, duplicate apps

### After:
- **Files**: ~140 organized files
- **Size**: ~13MB (2MB saved)
- **Organization**: Clean structure with /tests directory
- **Maintenance**: Easier to navigate and maintain

---

## 🚀 Execution Order

1. **SAFE OPERATIONS** (no code changes):
   - Delete backup files
   - Delete intermediate HTML files
   - Move test files to /tests
   - Remove orphaned files
   - Remove DB from git tracking

2. **ANALYSIS OPERATIONS** (requires decision):
   - Analyze Flask apps
   - Analyze database modules

3. **CODE CONSOLIDATION** (requires testing):
   - Consolidate Flask apps (if decided)
   - Consolidate database modules (if decided)
   - Update dependencies
   - Test everything works

4. **VERIFICATION**:
   - Run cleanup verification script
   - Commit changes

---

**Estimated Time**: 2-3 hours
**Risk Level**: LOW (all changes reversible via git)
**Backup Strategy**: Git commits at each major step
