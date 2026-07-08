# Checklist de requisitos — Fase 2B.7.3 (Fonte real de entitlement)

> **Etapa SDD 3.** Valida a qualidade dos requisitos (`spec-fase-2b73.md` + `clarify-fase-2b73.md`) antes do Plan.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | Fonte real definida (RevenueCat via port `entitlementSource`) | ✅ | spec RP1; Clarify C1 |
| CHK2 | Interface adaptadora primeiro; RevenueCat = 2B.7.4 | ✅ | Clarify C1 |
| CHK3 | Sem dependência nova (AppState nativo; sem NetInfo) | ✅ | spec "Decisões"; Clarify C2 |
| CHK4 | `loadEntitlement`/`initEntitlement` no boot fire-and-forget, não bloqueia | ✅ | spec RP3 |
| CHK5 | Refresh por `AppState 'active'`, conservador | ✅ | spec RP6; Clarify C4 |
| CHK6 | Persistência `@ptf_entitlement_v1` só de snapshot sanitizado/válido | ✅ | spec RP4; Clarify C6 |
| CHK7 | Validação antes de persistir (sanitize; descarta `plan` solto) | ✅ | spec RP4/RP5 |
| CHK8 | Anti-premium-acidental (cache antigo/JSON/malformado/relógio) | ✅ | spec RP5; policy 2B.7.1 |
| CHK9 | `premium`/`free`/`needs_revalidation` tratados (needs→free) | ✅ | spec RP2 |
| CHK10 | Offline dentro da janela de 7 dias; fora bloqueia | ✅ | spec RP7 |
| CHK11 | App abre mesmo com fonte/rede/storage falhando (nunca lança) | ✅ | spec RP8 |
| CHK12 | Nenhum dado local libera premium sem `decideEntitlement` | ✅ | spec RP5; Clarify C6 |
| CHK13 | Prova de boot sem loading visual novo | ✅ | spec "Provas"; RP3 |
| CHK14 | Prova de telas/UI sem mudança | ✅ | spec "Provas" |
| CHK15 | Prova de 2C não iniciada | ✅ | spec "Provas" |
| CHK16 | Arquivos permitidos/proibidos explícitos | ✅ | spec "Arquivos" |
| CHK17 | `App.js` só se necessário (1 linha) + alternativa lazy no Plan | ✅ | spec "Ponto de atenção"; Clarify C3 |
| CHK18 | `accessControl`/`entitlementPolicy` intocados | ✅ | Clarify C7 |

**Resultado:** 18/18 ✅ — requisitos prontos para o Plan.
