# Checklist de requisitos — Fase 2B.6 (Política de acesso e download premium)

> **Etapa SDD 3.** Valida a qualidade dos requisitos da `spec-fase-2b6.md` (+ `clarify-fase-2b6.md`) antes do Plan.

| # | Item | Status | Evidência |
|---|---|---|---|
| CHK1 | Decisão-núcleo inequívoca: pack ≠ acesso | ✅ | spec "Decisão principal", RP2 |
| CHK2 | RP1 verificável: download p/ história premium **atual OU concluída** (`sequenceUnlocked`), nunca futura | ✅ | RP1 + Clarify C1/C2 (equivalência `sequenceUnlocked`) |
| CHK3 | RP3 firme: guard `canAccess` antes de navegar (incl. `isCompleted`) + rechecagem em foco + **parada de mídia** | ✅ | RP3 + Clarify C3/C7; pontos `:161/168/287/314/331`; AudioPlayer `:116` |
| CHK4 | RP4 declara contrato de expiração (offline `expiresAt`), sem implementar RevenueCat | ✅ | RP4 + Clarify C5 |
| CHK5 | RP5 preserva Creation/Noah livres/offline | ✅ | RP5 (starter) |
| CHK6 | RP6 retenção: não apagar pack obrigatoriamente; proteção = gate de abertura | ✅ | RP6 + trilha futura registrada |
| CHK7 | Resolver permanece **agnóstico** (sem entitlement) | ✅ | diagnóstico §1; critério 6 |
| CHK8 | Risco de URL pública R2 registrado + trilha futura (URLs assinadas/token/manifesto protegido) | ✅ | seção "Risco registrado" |
| CHK9 | 15 critérios de aceite objetivos e testáveis (incl. smoke + device + parada de mídia) | ✅ | seção "Critérios de aceite" |
| CHK10 | Escopo fora claro: sem RevenueCat, sem 2C, sem `app.json`/patterns/requires/assets | ✅ | "Fora de escopo" + critérios 11/12 |
| CHK11 | Sem dependência nova | ✅ | mudanças em telas/serviços JS existentes |
| CHK12 | Rastreabilidade spec↔clarify↔plan↔tasks | ✅ | specs/005-reducao-bundle/ |

**Resultado:** 12/12 ✅ — requisitos prontos para o Plan.
