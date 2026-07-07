# Analyze — Bloco 2 · Fase 2B.6 · Política de acesso e download premium

> **Etapa SDD 6.** Consistência spec↔clarify↔plan↔tasks **antes** de implementar. Entrada: [spec](./spec-fase-2b6.md) · [clarify](./clarify-fase-2b6.md) · [plan](./plan-fase-2b6.md) · [tasks](./tasks-fase-2b6.md) · [checklist](./checklist-fase-2b6.md).

## 1. Cobertura (RP → Plan → Task → critério de aceite)
| Requisito | Plan | Task | Critérios |
|---|---|---|---|
| RP1 — download atual OU concluída (`sequenceUnlocked`) | RP1 | A1 | 1, 2, 3 |
| RP2 — pack ≠ acesso (resolver agnóstico) | RP2 | (resolver intocado) | 4, 9 |
| RP3 — guard antes de navegar (incl. `isCompleted`) | RP3 | B1–B3 | 6 |
| RP3 — rechecagem em foco | RP3 | C1–C3 | 7 |
| RP3 — parada de mídia | RP3 | C1, C3 | 8 |
| RP4 — contrato de expiração (documento) | RP4 | D1 | — (futuro) |
| RP5 — Creation/Noah livres | RP5 | (starter) | 10 |
| RP6 — retenção do pack | RP6 | (sem mudança) | 4 |
| Smoke | Smoke | E1 | 11, 12 |
| Device | Device | F2 | 5, 13 |
| Sem RevenueCat / 2C / app.json / assets | Fora de escopo | F1 | 14, 15 |

**Sem RP órfão; todos os 15 critérios têm task/checagem.**

## 2. Consistência entre artefatos (ajustes Portão 2 propagados)
- **Ajuste 1 (atual OU concluída = `sequenceUnlocked`):** propagado em spec RP1, clarify C1/C2/C6, plan RP1 (gate `sequenceUnlocked`, dispensa `getCurrentJourneyStoryId`), tasks A1, checklist CHK2. **Sem resíduo de "só a atual"/`getCurrentJourneyStoryId`** no gate. ✅
- **Ajuste 2 (parada de mídia):** propagado em spec RP3, clarify C7, plan RP3, tasks C1/C3, checklist CHK3, smoke check 4. ✅
- **15 critérios:** spec e checklist (CHK9) coerentes; não sobrou a lista de 12. ✅
- **ProgressContext:** confirmado que **não** muda (plan "Arquivos tocados" + tasks). ✅

## 3. Prova da equivalência (núcleo do ajuste 1)
`sequenceUnlocked(id)` ⟺ (`isStoryJourneyComplete(id)` **OU** `id` é a atual). Jornada linear → `journeyComplete` é prefixo contíguo; a anterior está completa **só** para as concluídas + a primeira incompleta (atual); futuras têm anterior incompleta. Logo o gate `sequenceUnlocked` = a regra do Portão 2, **sem** derivar `current` explicitamente. Robusto mesmo com estado legado (usa a fonte de verdade da progressão).

## 4. Regras invioláveis → guarda
| Regra | Onde |
|---|---|
| Resolver sem entitlement | `contentResolver` intocado; smoke check 5 |
| Sem RevenueCat | RP4 é só comentário; D1 |
| Sem 2C/app.json/patterns/requires/assets | fora de escopo; F1 verifica |
| LIVRINHO_FIX/UX preservados | C3 co-existe (não altera autoplay/refresh) |
| Sem `git` sem aprovação | F3 |

## 5. Riscos
- **Médio (áudio):** parada de mídia no StoryBook depende de `setIsPaused`+desmonte do `AudioPlayer`; mitigado por dupla garantia (prop `paused` + `player.pause()` no unmount `:116`) e **device obrigatório** (F2).
- **Baixo (progressão):** gate reusa `sequenceUnlocked` já testado; sem novo estado.
- **Risco de receita residual (registrado, não desta fase):** URL pública R2 não protege contra extração fora do app → trilha futura (URLs assinadas/token).

## 6. Veredito
**CONSISTENTE.** Ambos os ajustes do Portão 2 propagados sem contradição; cobertura completa dos 15 critérios; áreas sensíveis preservadas; escopo respeitado. Pronto para o **Portão 3**.
