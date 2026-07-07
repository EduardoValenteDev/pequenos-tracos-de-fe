# Relatório — Bloco 2 · Fase 2B.6 · Política de acesso e download premium

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.6 · **Etapa SDD:** 7–8 (Implement → validação).
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `77be545`.
> **Status:** IMPLEMENTADO · gates verdes · **validado em device (PASS, 2026-07-07)** · commit local preparado (sem push).

## 1. O que foi implementado (6 arquivos autorizados)
| Arquivo | Mudança |
|---|---|
| `src/screens/StoryDetailScreen.js` | RP1: `canDownload = canAccess && isRemote && !isComingSoon && sequenceUnlocked`; RP3: `goToPremium()` em todos os `navigate` premium (incl. `isCompleted`) |
| `src/screens/NarrationScreen.js` | RP3: mount guard → `useFocusEffect`; ao redirecionar, `AudioPlayer` pausa no unmount |
| `src/screens/ColoringScreen.js` | RP3: `useFocusEffect` (sem áudio → bloquear e sair) |
| `src/screens/StoryBookScreen.js` | RP3: `useFocusEffect` de acesso → `setIsPaused(true)` + `setScreenState('locked')` (parada de mídia) |
| `src/services/accessControl.js` | RP4: contrato de entitlement offline (só comentário; `expiresAt`/expired + pack ≠ autorização) |
| `scripts/smoke.js` | 9 checks 2B.6 + migração fiel do [127] |

## 2. Gates
- `npm run smoke`: **1835/1835** ✓ · `npx expo-doctor`: **18/18** ✓.
- **Intocados:** `contentResolver` (resolver agnóstico), `ProgressContext`, `app.json`, `assetBundlePatterns` (0 ocorrências), requires premium (loaders), assets. Confirmado por `git status`.

## 3. Política (RP1–RP6) e adendo (Portão 3)
- **RP1** download só com `sequenceUnlocked` (= história atual OU concluída; futuras bloqueadas sem download).
- **RP2** pack ≠ acesso (resolver agnóstico intocado).
- **RP3** guard `canAccess` antes de navegar (incl. `isCompleted`) + rechecagem em foco + **parada de mídia**.
- **RP4** contrato de entitlement offline documentado (não implementado; RevenueCat futuro).
- **RP5** Creation/Noah livres/offline.
- **RP6** retenção do pack aceitável (proteção = gate de abertura, não apagar arquivo).
- **Adendo:** Modo Criador **impossível em produção** (guard `__DEV__`/flag + flag não vaza p/ `eas.json`/`app.json`; smoke reforça); riscos futuros registrados (R2 público → URLs assinadas/backend; pack local vs usuário técnico → criptografia + chave temporária). Detalhes na `spec-fase-2b6.md`.

## 4. Nuance registrada — Reset da Pack Sandbox (diagnóstico device 2026-07-07)
> **O Reset da Pack Sandbox atual é específico de `david_goliath`; NÃO é reset global.** Packs de outras histórias podem permanecer baixados entre testes. **Isso NÃO é bug de acesso**, desde que o **gate de abertura** bloqueie conteúdo premium sem entitlement ativo.

**Evidência (read-only):**
- `resetDavidGoliathPackSandbox()` limpa só `david_goliath` (`clearPackEntry` + apaga arquivos); não há reset global (`packStorageService` só tem `clearPackEntry(storyId)`).
- `ready` só é marcado por **download real** (`packDownloadService`, após validar sha256) ou **seed** (só `david_goliath`, arquivos do bundle). `markPackReady` (índice-only) não é chamado por ninguém → **não há `ready` sem arquivos**.
- "Baixado ✓" = `getStoryPackState().ready` do **índice reconciliado** (`probePackDisk` confirma `localDir`+`manifest.json` no disco; `ready` órfão vira `not_downloaded`, exceto probe indeterminado conservador).
- Estado do pack é **por storyId**; história futura que vira atual **não herda** `ready`.
- **Conclusão:** `jesus_children`/`daniel_lions` "baixadas" após reset = **packs persistidos de download real anterior** (o reset só cobre `david_goliath`). Comportamento **correto**; a 2B.6 (gate de download por progressão) funcionou.
- Ferramenta futura (fora desta fase, não implementada): botão dev **"Reset all packs"** (dev-only, limpa índice + `documentDirectory/packs/`).

## 5. Validação device — PASS (Eduardo, 2026-07-07)
Estado atual (packs persistidos) exercitou o ponto crítico de receita: **pack baixado + Modo Criador off → premium bloqueia; Modo Criador on → reaproveita o pack**.

- ✅ `jesus_children` já aparecia baixada (pack persistido anterior).
- ✅ Modo Criador **off** → `jesus_children` **bloqueada**.
- ✅ Modo Criador **on** novamente → `jesus_children` **voltou a funcionar** e continua "Baixado" (reaproveita o pack, sem rebaixar).
- ✅ Mesmo comportamento nas **demais histórias baixadas**.
- ✅ Narração/Colorir/Livrinho **bloqueiam** sem entitlement; **áudio/autoplay não continua** após bloqueio.
- ✅ **Creation/Noé** seguem livres e offline.

**Interpretação aprovada:** NÃO é bug — é o comportamento desejado. **Sem premium ativo → bloqueia; com premium ativo → reaproveita o pack baixado.**

**Nuance de retenção (aprovada, RP6):** packs podem **permanecer no disco após a perda de premium**, mas **não liberam conteúdo** sem entitlement ativo. A proteção de receita é o **gate de abertura** (entitlement), não apagar o arquivo. Reassinar reaproveita o pack (evita baixar tudo de novo).

## 6. Critérios de aceite (15) — TODOS ATENDIDOS
1-3 (download atual/concluída/futura) ✓ smoke [1827/1828] · 4 (pack ≠ acesso) ✓ [1832] + device · 5 (Modo Criador off bloqueia) ✓ **device PASS** · 6 (guard incl. concluída) ✓ [1829] · 7 (foco bloqueia) ✓ [1830] + **device PASS** · 8 (para áudio) ✓ [1831] + **device PASS** · 9 (resolver agnóstico) ✓ [1832] · 10 (Creation/Noah) ✓ [1834] + **device PASS** · 11-12 (smoke) ✓ [1827-1835] · 13 (device) ✓ **PASS** · 14-15 (sem RevenueCat/2C/app.json/assets) ✓.

## 7. Commit e próximos passos
Validação device PASS → **commit local da 2B.5 + 2B.6 preparado** (dois commits atômicos; sem push, aguardando aprovação). A **2C segue bloqueada** até: 2B.6 publicada + Modo Criador seguro em prod (✓) + contrato offline documentado (✓) + risco R2 registrado (✓).
