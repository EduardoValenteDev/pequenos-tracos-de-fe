# Plan — Bloco 2 · Fase 2B.7.3a · Progresso visual em premium bloqueada

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.3a · **Etapa SDD:** 4 (Plan) · **Portão Humano 2: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `16c6e18` · Spec: [spec-fase-2b73a.md](./spec-fase-2b73a.md) · Clarify: [clarify-fase-2b73a.md](./clarify-fase-2b73a.md).
> **PARA no Plan.** Nenhum código antes do Portão 3. Sem entitlement/RevenueCat/packs/2C/dependência/`git`.

## Abordagem
Separar **decisão visual** (função **pura**, testável) da **permissão de acesso** (`goToPremium` + mount guards das telas, 2B.6 — **intocados**). A correção é a **ordem**: progresso vem antes do bloqueio de acesso.

## Arquivos tocados (na implementação, após Portão 3)
1. `src/services/storyJourneyService.js` — **+** `sceneVisualStatus(params)` **puro** (o serviço já é o "contrato único de status", puro, sem I/O, já testado pelo smoke).
2. `src/screens/StoryDetailScreen.js` — `getSceneStatus` **delega** à função pura (mesma entrada de hoje).
3. `scripts/smoke.js` — checks da matriz + separação visual/acesso + intocados.
**Proibidos:** `entitlementPolicy`/`entitlementService`/`entitlementSource`, `accessControl`, RevenueCat, `App.js`, packs/downloads, assets, requires, `app.json`, 2C. (`SceneListItem` **opcional** — só se você aprovar o indicador "concluída bloqueada"; não no mínimo.)

## Contrato — `sceneVisualStatus` (puro, em `storyJourneyService`)
```
// Estado VISUAL de uma cena (rótulo/ícone). NÃO decide acesso — só aparência.
// Ordem CONSERVADORA: coming_soon → concluída (visual sempre) → sem-acesso → atual → bloqueada.
export function sceneVisualStatus({ isComingSoon, isDone, canAccess, isCurrent }) {
  if (isComingSoon) return 'locked';
  if (isDone) return 'completed';     // progresso visual real, MESMO sem acesso
  if (!canAccess) return 'locked';    // não-concluídas: bloqueadas sem acesso
  if (isCurrent) return 'available';
  return 'locked';
}
```
`StoryDetail.getSceneStatus(cena, index)` passa a:
```
return sceneVisualStatus({
  isComingSoon,
  isDone: progresso[cena.id] === true,
  canAccess,
  isCurrent: index === progressCount,
});
```
**Nenhuma nova fonte de dados** — mesma entrada (`progresso`, `canAccess`, `progressCount`).

## Por que a permissão continua bloqueada (ponto 3/6/8)
- Cena `completed` é clicável (`SceneListItem`), mas seu `onPress` é `goToPremium('Narration', …)` ([StoryDetail:164](../../src/screens/StoryDetailScreen.js#L164)) → sem `canAccess` → **ParentArea** (não abre Narração/Colorir/Livrinho/Quiz).
- Cena `locked` (não concluída sem acesso) → não-clicável.
- Botão primário → "Pedir ao responsável" (`getPrimaryLabel`, `!canAccess`) — inalterado.
- Telas Narration/Coloring/StoryBook revalidam acesso no mount/foco (2B.6) — inalteradas.

## Smoke (checks 2B.7.3a)
Avaliar `storyJourneyService` isolado (padrão existente) e exercitar `sceneVisualStatus`:
1. **Premium sem acesso + progresso:** `{isDone:true, canAccess:false}` → `completed`; `{isDone:false, canAccess:false, isCurrent:true}` → `locked`; `{isDone:false, canAccess:false, isCurrent:false}` → `locked`.
2. **Premium sem progresso sem acesso:** todas `{isDone:false, canAccess:false}` → `locked`.
3. **Grátis com progresso:** `{isDone:true, canAccess:true}`→`completed`; `{isDone:false, canAccess:true, isCurrent:true}`→`available`; else `locked` (idêntico ao atual).
4. **Coming soon:** `{isComingSoon:true, ...}` → `locked` sempre.
5. **StoryDetail delega + não libera abertura:** `getSceneStatus` chama `sceneVisualStatus`; o `onPress` das cenas segue `goToPremium`; nenhum `navigate('Narration'|'StoryBook'|'Coloring')` cru (guard 2B.6 intacto).
6. **Pedido ao responsável:** `getPrimaryLabel` mantém `!canAccess → 'Pedir ao responsável'`.
7. **Intocados:** `accessControl`/`entitlement*` sem diff; nenhum `react-native-purchases`; `app.json` sem `assetBundlePatterns` (2C).

## Device (validação visual — obrigatória, é mudança de tela)
Ester com progresso até a cena 5 + Modo Criador **off**: cenas 1-5 aparecem **concluídas** (✓), cena 6+ **bloqueadas** ("Complete a cena anterior"); tocar em cena concluída → **Área dos Pais** (não abre); botão principal "Pedir ao responsável". Grátis e premium-sem-progresso idênticos. *(Executada por Eduardo — o agente não tem device.)*

## Tasks (após Portão 3)
- **T1** — `storyJourneyService`: `+ sceneVisualStatus` (puro).
- **T2** — `StoryDetailScreen.getSceneStatus` delega à função pura.
- **T3** — `smoke.js`: checks 1-7.
- **T4** — gates (`smoke`/`doctor`/grep intocados) + **validação visual device** + relatório PT-BR.

## Invariantes
`accessControl`, `entitlementPolicy`/`Service`/`Source`, packs/downloads, `contentResolver`, `ProgressContext`, `App.js`, `app.json`, `assetBundlePatterns`, requires, assets — **intocados**. Acesso/entitlement **inalterados** (só o rótulo visual muda). **2B.7.4/2C não iniciadas.** Sem dependência.

## Analyze (consistência spec↔plan)
Correção = reordenar via função pura; abertura segue bloqueada por `goToPremium`/telas (2B.6). Grátis/premium-sem-progresso idênticos (prova por caso + smoke). Só visual muda; entitlement/acesso intactos. **CONSISTENTE.**
