# Checklist de requisitos — Fase 2B.7.4 (Adapter RevenueCat)

> **Etapa SDD 3.** Valida a qualidade dos requisitos (`spec-fase-2b74.md` + `clarify-fase-2b74.md`) antes do Plan.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | Escopo = **só o adapter** (sem paywall/produtos/compra/restore) | ✅ | spec "Fatiamento"; Clarify C2 |
| CHK2 | Dependência definida (`react-native-purchases`) + compat SDK 54 a verificar | ✅ | spec RP2; Clarify C3 |
| CHK3 | Expo Go não suporta → Dev Client/EAS; impacto no teste iPhone | ✅ | spec RP2; Clarify C4 |
| CHK4 | `app.json` config plugin **justificado + para para aprovação** | ✅ | spec RP3; Clarify C5 |
| CHK5 | API keys **públicas** (`EXPO_PUBLIC_`); secret **jamais** no app | ✅ | spec RP4; Clarify C7 |
| CHK6 | Mapeamento `CustomerInfo`→`RawEntitlement` explícito | ✅ | spec RP5 |
| CHK7 | Estados (ativa/cancelada-paga/expirada/restore/rede/indisponível/offline) | ✅ | spec RP6 |
| CHK8 | Anti-premium-acidental (só `decideEntitlement` decide) | ✅ | spec RP7 |
| CHK9 | App abre mesmo se RC falhar (nunca lança) | ✅ | spec RP8 |
| CHK10 | Testes sem compra real (mock no smoke); sandbox = fase própria | ✅ | spec RP9; Clarify C10 |
| CHK11 | Prova de sem mudança visual (sem produtos → free) | ✅ | spec "Provas"; Clarify C8 |
| CHK12 | Prova de 2C não iniciada | ✅ | spec "Provas" ponto 20 |
| CHK13 | Arquivos permitidos/proibidos explícitos | ✅ | spec "Arquivos" |
| CHK14 | Dependência nova justificada (regra 9) | ✅ | spec RP1/RP2 |
| CHK15 | Nenhum segredo no app (regra 8) | ✅ | spec RP4; Clarify C7 |
| CHK16 | `entitlementPolicy`/`accessControl`/telas fora | ✅ | spec "Arquivos"/"Fora de escopo" |
| CHK17 | Fatiamento sem misturar (adapter/paywall/produtos/restore/sandbox) | ✅ | spec "Fatiamento"; atenção 4/5 |

**Resultado:** 17/17 ✅ — requisitos prontos para o Plan.
