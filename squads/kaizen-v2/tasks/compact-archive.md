---
task:
  name: compact-archive
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: memory-keeper
  execution_type: SCHEDULED (quarterly) | MANUAL (*archive)
  trigger:
    scheduled: "Cron: First day of quarter at 3am"
    manual: "*archive command"
---

# compact-archive

## Task Anatomy

### Input
- `data/intelligence/daily/` (all files)
- `data/intelligence/knowledge/patterns.yaml`
- `data/intelligence/archive/` (existing archived patterns)

### Output
- **Rotate dailies:** Move `daily/` files > 90 days old to `archive/dailies/`
- **Archive patterns:** Move patterns with decay < 0.1 to `archive/patterns.yaml.archive`
- **Delete patterns:** Remove patterns with decay < 0.05
- **Backup:** Create `patterns.yaml.bak` before modifications
- Updated `data/intelligence/knowledge/patterns.yaml` (cleaned)

### Acceptance Criteria
- [ ] All daily files > 90 days old moved to `archive/dailies/`
- [ ] All patterns with decay < 0.1 moved to `archive/patterns.yaml.archive`
- [ ] All patterns with decay < 0.05 deleted (with audit log)
- [ ] `patterns.yaml.bak` created before cleanup
- [ ] patterns.yaml metadata updated (total_patterns, deleted_patterns, archived_patterns)
- [ ] Cleanup log generated with: files archived, patterns archived, patterns deleted

---

## Detailed Specification

### Phase 1: Daily Rotation
1. List all files in `data/intelligence/daily/`
2. Filter: files with modification date > 90 days old
3. Create `data/intelligence/archive/dailies/` if missing
4. Move filtered files to `archive/dailies/YYYY-MM/`
5. Log: N files archived, date range

### Phase 2: Pattern Archive
1. Load `patterns.yaml`
2. Create backup: `cp patterns.yaml patterns.yaml.bak`
3. For each pattern:
   - If `decay_score < 0.1`: Move to `archive/patterns.yaml.archive`
   - If `decay_score < 0.05`: Delete entirely + log to audit.log
   - Else: Keep in active patterns.yaml
4. Update metadata: total_patterns, archived_patterns, deleted_patterns
5. Log: N patterns archived, N patterns deleted

### Phase 3: Cleanup Log
Generate `archive/cleanup-YYYY-MM-DD.log`:
```
# Compact-Archive Run — YYYY-MM-DD HH:MM:SS

## Daily Files
- Files archived: N
- Date range: YYYY-MM-DD to YYYY-MM-DD
- New archive: archive/dailies/YYYY-MM/

## Patterns
- Patterns archived: N
  - Archive file: archive/patterns.yaml.archive (appended)
- Patterns deleted: N (decay < 0.05)
  - IDs: [p001, p002, ...]
- Active patterns remain: N

## Backup
- Backup created: patterns.yaml.bak (timestamp)
- Recovery: cp patterns.yaml.bak patterns.yaml if needed

## Status: OK
```

### Constraints
- Never delete patterns with `verified: true` (high confidence) without warning
- Always create backup before deletions
- Never run while reflect.md is executing (mutex lock)
- Fallback: If deletion fails, leave in active (won't harm, just cluttered)

## Success Criteria
- PASS: All old dailies archived, patterns archived/deleted correctly, backup created, log generated
- FAIL: Backup creation failed, patterns.yaml corrupted, unable to create archive dirs
- WARN: No dailies > 90 days (normal if < 3 months old), no patterns to archive (normal if active learnings)

## Error Handling
- If `archive/` dirs don't exist: Create them automatically
- If `patterns.yaml.bak` fails: Abort cleanup (never delete without backup)
- If decay calc is wrong: Use conservative threshold (keep if uncertain)
- If cleanup log fails: Continue (cleanup happened, just missing audit trail)
