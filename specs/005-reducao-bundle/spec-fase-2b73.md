# Bloco 2 · Fase 2B.7.3 · Fonte real de entitlement + persistência/boot/refresh

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.3 (= `impl.3` do faseamento da 2B.7) · **Etapa SDD:** 1 (Specify) · **Portão 1: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `e8f7a88`.
> **Natureza:** infraestrutura de fonte + persistência + boot + refresh, **fail-closed**. **Sem** liberar premium novo; **sem** 2C.

## Objetivo
Conectar uma **fonte real de entitlement** ao `entitlementService`, com **persistência segura** em `@ptf_entitlement_v1`, **boot controlado** e **refresh conservador** — mantendo o comportamento **fail-closed** e sem tocar telas/UI/packs/2C.

## Diagnóstico (base)
`entitlementService` já é a ponte fail-closed; `getCurrentPlan` já delega; sem fonte → `free`. Falta: (a) a **fonte** (quem fornece `rcActive`/`expiresAt`...); (b) **persistir** o snapshot validado; (c) **carregar** no boot; (d) **revalidar** por `AppState`. `App.js` já roda cargas fire-and-forget no boot ([:38-44](../../App.js#L38)) — molde para o boot de entitlement.

## Decisões de arquitetura (pontos 1, 2, 5, 8)
- **Ponto 1 (fonte real):** RevenueCat será a fonte, **acessada por uma interface adaptadora (port)** `entitlementSource`. **Ponto 2:** cria-se a **interface adaptadora PRIMEIRO**; a implementação RevenueCat é sub-fase própria (**2B.7.4**, com aprovação de dependência). Nesta fase a implementação é um **stub fail-closed** que resolve "sem entitlement" → `free`.
- **Ponto 5/8 (dependência):** esta fase **NÃO adiciona dependência**. `AppState` é **nativo do React Native** (já usado no app). **NetInfo NÃO entra** (evita dependência) — a fonte trata offline internamente; sem rede, o refresh **falha conservador**. `react-native-purchases` (RevenueCat) + eventual NetInfo ficam para sub-fases próprias com justificativa.

## Requisitos

**RP1 — Interface adaptadora `entitlementSource` (port).** Novo `src/services/entitlementSource.js`: `fetchEntitlement() → Promise<RawEntitlement|null>` (`{ rcActive, rcCancelledButPaid, expiresAt, serverNow? }`). **Implementação desta fase: stub fail-closed** que retorna `null` (sem entitlement) → `free`. Documenta o contrato para o adapter RevenueCat futuro. Sem dependência.

**RP2 — Refresh conservador (pontos 4, 9).** `entitlementService.refreshEntitlement()`: `await fetchEntitlement()` → **sanitiza** (RP4) → monta snapshot → **valida via `decideEntitlement`** → se `premium`/válido, atualiza `_snapshot` (`lastValidatedAt = now confiável`, `maxSeenDeviceTimestamp = max(prev, now)`) e **persiste**; se `null`/erro/inválido, **mantém conservador** (não promove; nunca rebaixa arquivo — só a policy decide por tempo/janela). `premium`/`free`/`needs_revalidation` mapeados pelo já existente `getEntitlementPlan` (needs_revalidation → free).

**RP3 — Boot controlado (ponto 3, 11).** `initEntitlement()`: chama `loadEntitlement()` (cache) **fire-and-forget** + registra o listener de refresh. Chamado **1 vez no boot** (ver "Arquivos"/ponto de atenção). **Não bloqueia** a abertura: `getEntitlementSnapshot()` é síncrono e retorna `{ loaded:false }` → `free` até carregar. **Nenhum spinner/loading novo** (o `ActivityIndicator` de fontes é o único, inalterado).

**RP4 — Salvar + validar snapshot (pontos 6, 7).** `saveEntitlement(snapshot)`: **sanitiza** — só persiste os campos do contrato com tipos válidos (`isValidTs` p/ timestamps, boolean p/ flags); **descarta campos estranhos** (ex.: `plan` solto). Persiste em `@ptf_entitlement_v1` via `AsyncStorage.setItem` **apenas** um objeto sanitizado. `loadEntitlement` (já existe) valida no read (fail-closed).

**RP5 — Anti-premium-acidental (ponto 8 das regras / ponto 8 da spec).** Camadas: (a) policy `decideEntitlement` fail-closed (2B.7.1) — cache antigo/JSON inválido/malformado/relógio tratados; (b) `sanitize` no persist (RP4) — nada estranho entra; (c) `maxSeenDeviceTimestamp` anti-relógio; (d) `getEntitlementPlan` só `premium` se a policy disser. **Nenhum dado local libera premium sem passar por `decideEntitlement`.**

**RP6 — Refresh por `AppState` (ponto 4).** Listener `AppState` `'active'` (nativo) → `refreshEntitlement()`. Sem NetInfo. Se offline/fonte falha → conservador (mantém cache dentro da janela; fora → `needs_revalidation` → free). Registrado 1× no boot; removível.

**RP7 — Offline dentro da janela (ponto 10).** `decideEntitlement` (7 dias): premium offline vale até `expiresAt` **e** `lastValidatedAt ≤ 7d`; sem rede, mantém o último cache validado dentro da janela; fora → bloqueia. App funciona offline dentro da janela; **fail-closed** fora.

**RP8 — App abre mesmo com fonte/rede falhando (regra 7).** `fetchEntitlement`/`refreshEntitlement`/`loadEntitlement`/`saveEntitlement` **nunca lançam** para fora (try/catch → conservador). Boot fire-and-forget. Qualquer falha → `free`, app abre normal.

## Ponto de atenção — `App.js`
O boot de entitlement precisa de **1 ponto de inicialização** no ciclo de vida. **Recomendado:** adicionar **1 linha** `initEntitlement()` ao `useEffect` de boot já existente em `App.js` ([:38-44](../../App.js#L38)), junto de `loadCreatorQaMode()` — **fire-and-forget, sem render, sem navegação, sem loading novo**. **Alternativa (no Plan):** auto-init *lazy* dentro do service (dispara `loadEntitlement` em background na 1ª leitura) — evita `App.js`, mas mistura I/O com a leitura e é menos previsível. O Plan apresenta ambas; se `App.js` for usado, **limita exatamente à 1 linha** e prova ausência de mudança visual.

## Provas exigidas
- **Boot sem loading novo (ponto 11):** smoke — `App.js` só adiciona `initEntitlement()` (sem `useState`/spinner ligado a entitlement); nenhum componente de loading novo; grep.
- **Telas/UI sem mudança (ponto 12):** nenhuma tela/navegação/paywall tocada; `getCurrentPlan` resolve `free` sem entitlement ativo (stub) — idêntico. Smoke + `git`.
- **2C não iniciada (ponto 13):** `app.json`/`assetBundlePatterns`/requires intactos.

## Arquivos (pontos 14, 15)
| Pode tocar | Proibido |
|---|---|
| `src/services/entitlementSource.js` (novo — port + stub) | telas, mapa, histórias, perfil, progresso, **paywall**, downloads, packs |
| `src/services/entitlementService.js` (+ refresh/persist/sanitize/init/AppState) | `contentResolver`, `ProgressContext`, navegação |
| `App.js` (**só 1 linha** de boot, se aprovado) | `app.json`, `assetBundlePatterns`, requires, assets |
| `scripts/smoke.js` (checks) | `entitlementPolicy.js` (usado como está); `accessControl` (já delega) |
| — | RevenueCat SDK / `react-native-purchases` / NetInfo (dependências → sub-fase própria) |

## Fora de escopo
Implementar RevenueCat (adapter real da interface); NetInfo; liberar premium novo; UX de revalidação/paywall; tocar telas/packs; 2C; dependência nova.

## Critérios de aceite
1. `entitlementSource` (port) + stub fail-closed → `fetchEntitlement()` resolve `null` (sem premium).
2. `refreshEntitlement` sanitiza + valida via `decideEntitlement` + persiste só o válido; nunca lança.
3. `saveEntitlement` só grava campos sanitizados; `plan` solto/estranho descartado.
4. Boot `initEntitlement()` fire-and-forget; `getCurrentPlan()` continua `free` sem fonte; sem loading visual novo.
5. `AppState 'active'` → refresh conservador; sem NetInfo; sem dependência nova.
6. Fonte/rede/JSON/relógio/dados incompletos → conservador; **app abre sempre**.
7. Offline dentro da janela de 7 dias respeitado; fora → bloqueia.
8. Telas/UI/packs/`accessControl`/`entitlementPolicy` intocados; 2C não iniciada; smoke+doctor verdes.
