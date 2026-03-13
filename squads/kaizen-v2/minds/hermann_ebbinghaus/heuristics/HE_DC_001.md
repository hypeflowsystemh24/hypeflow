# HE_DC_001 — Decay Score Assessment

**Type:** Decision Heuristic
**Phase:** Pattern Lifecycle Management
**Agent:** @kaizen-v2:memory-keeper
**Pattern:** HE-CORE-001 (Forgetting Curve)

## Purpose

Heurístico para avaliar e agir sobre o decay score de patterns no kaizen-v2. Baseado na curva de esquecimento de Ebbinghaus, determina quando um pattern deve ser mantido ativo, archivado, ou deletado.

## Configuration

```yaml
HE_DC_001:
  name: "Decay Score Assessment"
  phase: "pattern-lifecycle"
  pattern_reference: "HE-CORE-001"

  weights:
    days_since_observed: 0.9     # principal fator de decay
    verification_count: 0.85     # patterns verificados decaem mais lento
    usage_in_briefing: 0.8       # se foi usado recentemente via briefing
    cross_session_sighting: 0.75 # observado em múltiplas sessões

  thresholds:
    fresh: 1.0                   # recém-observado ou reinforced
    active: 0.7                  # uso regular
    warm: 0.5                    # ainda relevante
    cold: 0.3                    # sai do briefing
    archive: 0.1                 # movido para archive/
    delete: 0.05                 # removido permanentemente

  decay_rates:
    general: 0.05                # ~60 dias até delete
    verified: 0.025              # ~120 dias (2x mais lento)

  veto_conditions:
    - condition: "pattern_verified_and_score_below_archive"
      action: "WARN — Pattern verificado em decay. Considere reforço antes de archive."
    - condition: "all_patterns_below_cold"
      action: "ALERTA — Nenhum pattern ativo no briefing. Base de conhecimento pode estar estagnada."
    - condition: "pattern_used_today_but_score_was_archive"
      action: "RESCUE — Resgatar do archive, resetar score para 1.0."

  decision_tree:
    - IF score >= 0.7 THEN active_pattern_keep_in_briefing
    - IF score >= 0.3 AND score < 0.7 THEN warm_pattern_include_if_space
    - IF score >= 0.1 AND score < 0.3 THEN cold_pattern_exclude_from_briefing
    - IF score >= 0.05 AND score < 0.1 THEN archive_pattern_move_to_archive
    - IF score < 0.05 THEN delete_pattern_remove_permanently
    - TERMINATION: all_patterns_assessed_and_actioned
```

## Assessment Framework

```text
PASSO 1: Coletar Dados
  - Para cada pattern: last_observed, verification_count, decay_rate
  - Calcular: days_since_observed = today - last_observed

PASSO 2: Calcular Score
  - decay_score = e^(-rate × days_since_observed)
  - rate = 0.025 se verified, 0.05 se general

PASSO 3: Classificar
  - Fresh (1.0): recém-reforçado
  - Ativo (>=0.7): uso regular
  - Morno (>=0.3): ainda no briefing
  - Frio (<0.3): fora do briefing
  - Archive (<0.1): mover para archive/
  - Delete (<0.05): remover permanentemente

PASSO 4: Agir
  - Archive: mover entry para archive/YYYY-MM.yaml
  - Delete: remover de archive/ após confirmação
  - Rescue: se pattern archivado é re-observado, trazer de volta
```

## Examples

### Pattern Fresh (score 1.0)
- **Observado:** hoje, em daily capture
- **Ação:** Manter no topo do briefing

### Pattern em Decay (score 0.22)
- **Observado:** 30 dias atrás, 0 usos desde então
- **Rate:** general (0.05)
- **Cálculo:** e^(-0.05 × 30) = 0.22
- **Ação:** Fora do briefing. Se não for reforçado, archive em ~15 dias.

### Pattern Verified em Decay Lento (score 0.47)
- **Observado:** 30 dias atrás, verified
- **Rate:** verified (0.025)
- **Cálculo:** e^(-0.025 × 30) = 0.47
- **Ação:** Ainda no briefing (> 0.3). Decay 2x mais lento por ser verificado.

---

**Pattern Compliance:** HE-CORE-001 (Forgetting Curve)
**Source:** HE Mind DNA - Decay Assessment Heuristic
