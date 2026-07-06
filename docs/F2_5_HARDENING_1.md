# F2.5-hardening-1 — Blindagem do consumo remoto (cena com fallback · localDir recomposto · guard do colorir)

> **Bloco:** F2.5-hardening-1 (área sensível: resolver/packs; fluxo SDD com 3 portões). **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD anterior:** `2530670`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.** SUPERSEDED não usados como fonte.

## 1. Contexto e objetivo
O F2.5c habilitou o consumo remoto das 18 premium por camada (`isRemotePackStory`), com **fallback local obrigatório**, mantendo o download atrás do gate dev/QA. **Antes de qualquer remoção de bundle** (F2.5e), é preciso blindar o caminho remoto para que nenhuma falha (arquivo ausente, container iOS trocado, decode) vire moldura preta ou lineart errada. Este bloco fecha 3 lacunas identificadas na auditoria (Bloco 3), **sem** remover requires, **sem** tocar R2, **sem** mexer em downloader/resolver/storage.

## 2. Problemas tratados
- **C2 — Cena remota sem rede de segurança.** `useResolvedSceneImage` servia `file://` direto (sem `getInfoAsync`), e o `OfficialSceneImage` compartilhado (Narração) era um `<Image>` sem `onError` sobre fundo escuro → "moldura preta" se o `file://` falhasse. (O `OfficialSceneImage` do Livrinho já tinha `onError` próprio.)
- **C3 — `localDir` absoluto persistido.** O índice `@ptf_packs_v1` guarda `localDir` absoluto (`documentDirectory/packs/<id>@<version>/`). No iOS o container muda de UUID entre updates/restores → o `file://` persistido fica inválido; o `PacksContext` expunha o valor cru sem recompor.
- **C4 — Chave do colorir ambígua.** Fallback local por `cena.id`, candidato remoto por **posição** (`cenaIndex+1`). O `getInfoAsync` só barra arquivo ausente, não chave errada. Hoje seguro (`cena.id == posição` nas 18, Bloco 2), mas sem blindagem para história futura não-sequencial.

## 3. Solução implementada
### C2 — cena fallback-first + anti-race + `onError`
- `useResolvedSceneImage` reescrito no padrão do colorir: `useState(remoteSource)` + `useEffect(getInfoAsync(candidateUri))`; só promove `{ uri }` quando `info.exists`; **race-safe** via flag `cancelled` no cleanup; dependência principal `[candidateUri]`.
- **Guarda anti-race adicional** (ajuste do Portão 3): mesmo antes de o efeito limpar o estado antigo, o remoto só é usado quando corresponde à cena atual:
  ```js
  const safeRemoteSource =
    remoteSource && candidateUri && remoteSource.uri === candidateUri ? remoteSource : null;
  return safeRemoteSource || localSource;
  ```
  Assim, um render intermediário numa troca rápida de cena **nunca** reaproveita o `file://` da cena anterior.
- `OfficialSceneImage` (compartilhado) ganhou prop `fallbackSource` (require local) + `onError` que troca **uma única vez** para o fallback (`if (!failed && fallbackSource) setFailed(true)`) e reseta `failed` em `[source, fallbackSource]` (nova cena/pack). `StorySceneVisual` repassa `officialFallback → fallbackSource`; `NarrationScreen` fornece `officialFallback = cena?.id ? getOfficialSceneIllustration(story.id, cena.id) : null` (null-safe).

### C3 — `localDir` recomposto em runtime (PacksContext)
- `PacksContext` importa `getPackLocalDir` e cria `normalizedIndex = useMemo(..., [packIndex])` que recompõe `localDir = getPackLocalDir(entry.storyId, entry.version)` a partir do `documentDirectory` **atual**. Sem `storyId`/`version` válidos → mantém a entry **crua**.
- **Migração implícita e idempotente:** o `localDir` persistido é ignorado no boundary de leitura (não há varredura nem regravação). `getPackEntry`/`getStoryPackState` e `value.packIndex` leem do `normalizedIndex`. **Read-only preservado** (nada de `savePackIndex`/`setPackEntry`/`setItem`/download). **Schema persistido inalterado** → downgrade-safe.
- Estabilidade referencial garantida pelo `useMemo([packIndex])` → `getPackEntry`/`useSandboxScenePackEntry` mantêm identidade; o Livrinho não rebuilda a timeline.

### C4 — guard `cena.id === posição` no colorir
```js
const keyMatches = !!cena && cena.id === sceneNumber;
if (isRemotePackStory(storyId) && sceneNumber > 0 && keyMatches) { /* monta candidato remoto */ }
```
Em divergência → `candidateUri` nulo → fallback local por `cena.id`. **Não** altera o path dos packs nem o R2.

## 4. Invariantes preservadas
1. `creation`/`noah` (starter) → sempre local.
2. Premium sem pack `ready` → sempre require local.
3. Pack `ready` válido → pode usar `file://`.
4. `file://` ausente/inválido/falho no render → cai no require local (nunca moldura preta).
5. Nenhum asset/`require` local removido.
6. Produção não piora: download segue dev/QA-gated → tudo local; as camadas só atuam com pack `ready`.
7. Livrinho (`resolveSceneImageForStory` + `OfficialSceneImage` do StoryBookScreen) intacto.
8. Estabilidade referencial preservada.

## 5. Arquivos alterados (6 código/smoke + 1 doc)
- `src/hooks/useResolvedStoryMedia.js` — C2 (`useResolvedSceneImage` fallback-first + anti-race) + C4 (guard do colorir).
- `src/components/story/OfficialSceneImage.js` — `fallbackSource` + `onError` + reset de `failed`.
- `src/components/story/StorySceneVisual.js` — prop `officialFallback` → `fallbackSource`.
- `src/screens/NarrationScreen.js` — import + `officialFallback` null-safe + repasse da prop.
- `src/context/PacksContext.js` — import `getPackLocalDir` + `normalizedIndex` (`useMemo`) + getters + `value`.
- `scripts/smoke.js` — migração do eval síncrono da cena (sync=require; `file://` só após `getInfoAsync`) + bloco de checks C2/C3/C4.
- `docs/F2_5_HARDENING_1.md` — este documento.

**NÃO alterados:** `src/services/contentResolver.js`, `src/services/packStorageService.js`, `src/screens/StoryBookScreen.js`, `packDownloadService.js`, `packSandboxDevService.js`, loaders de assets, assets, R2.

## 6. Testes
- **Migração de smoke:** o eval que chamava `useResolvedSceneImage` **síncrono** esperando `file://` passa a stubar `useState`/`useEffect`/`FileSystem`/`RESOLVE_SOURCE_TYPE` e asserta **sync = require** (fallback-first) para david/mary/creation. O eval de `resolveStoryScene` (construção do `file://`) **fica intacto**.
- **Checks novos:** C2 (getInfoAsync+exists+`cancelled`+`safeRemoteSource`/`remoteSource.uri === candidateUri`; `OfficialSceneImage` onError+fallbackSource+reset; StorySceneVisual repassa; NarrationScreen null-safe); C3 (import + `useMemo` recompondo por version + getters/value em `normalizedIndex` + read-only); C4 (`keyMatches`); regressão (resolveSceneImageForStory/StoryBookScreen/contentResolver/packStorageService intactos).
- **Gates:** `npm run smoke` · `npx expo-doctor` · `npm run audio:audit` · `git diff --check`.

## 7. Validação manual prevista (device)
1. **Sem regressão** (jesus_children/daniel_lions/moses_red_sea + david_goliath): download→ready→cena/colorir/Livrinho/áudio via `file://`; reset→require; sem moldura preta.
2. **C2 (fallback de cena):** prova primária = espelho do padrão do colorir (F2.4e.3, reset→local) + smoke + React DevTools (`source` `file://` quando ready; require no fallback). Simular "cena ausente" no device não tem afordância hoje → coberto por review + smoke.
3. **C3 (container):** prova primária = smoke; device confirma download→ready→`file://` e reset→require. Simular troca de UUID exige restore/backup → coberto por review.
4. **C4:** as 18 têm `cena.id == posição` → colorir remoto idêntico a hoje (sem lineart trocada).

## 8. Limitações (fim do escopo do bloco)
- Não há afordância dev para simular "arquivo de cena ausente" nem "troca de container" no device (prova por smoke + review). Um reset/diagnose genérico por `storyId` na dev screen segue como candidato a micro-bloco dev-only futuro.
- Continua **sem** UX de download (F2.5d), **sem** RevenueCat/entitlement (F2.4f), **sem** remoção de requires (F2.5e), baseUrl ainda `r2.dev` (F2.5f).

## 9. Rollback
- `git revert` do commit único. Tudo **aditivo/reversível**; **sem mudança de schema** (`localDir` persistido intacto) → app antigo volta a ler o `localDir` absoluto. A migração do smoke (eval + checks) é revertida junto.

## 10. Verificação adversarial + validação manual no iPhone (executadas — 2026-07-06)
**Verificação adversarial independente** (workflow `wgq7g32ja`: 4 lentes read-only — C2 anti-race / C3 localDir / C4 colorir / integridade do smoke — + synthesis): veredito **APROVADO_COM_RESSALVAS**, **0 bloqueadores / 0 majors**; 8 invariantes e escopo (7 arquivos) confirmados; smoke re-executado 1741/1741. Ressalvas apenas opcionais/futuras (paridade defensiva de `safeRemoteSource` nos hooks de áudio/capa/colorir; endurecer o smoke para o caminho positivo `file://`; docstring pré-existente "Gated a david_goliath" em `resolveSceneImageForStory`).

**Validação em dispositivo físico (iPhone)** pelo Pack Sandbox DevScreen — 6 histórias, todas OK:
- **jesus_children / daniel_lions / moses_red_sea** (camada `remote`): download → `ready` → sha256 validado → Narração, **troca rápida de cenas** (exercita o anti-race `safeRemoteSource`), Colorir, Livrinho, áudio e **reabertura do app** — via `file://`, sem regressão.
- **david_goliath** (`remote`): **reset → fallback local** → novo download → `ready` → sha256 validado → Narração/cenas/Colorir/Livrinho/áudio OK (round-trip `file://` ↔ require).
- **creation / noah** (`starter`): locais intactas.

**Sem** moldura preta · **sem** tela quebrada · **sem** lineart errada · **sem** áudio quebrado · **sem** regressão visual. Reabrir o app **não** quebrou as premium baixadas — confirma o C3 (`localDir` recomposto do `documentDirectory` atual sobrevive à reabertura).

**Observação dev-only (não bloqueante):** ao voltar à Pack Sandbox após testar uma história genérica, o campo `storyId` volta ao padrão `david_goliath`. **Não** afetou download genérico, `ready`, sha256 nem o runtime das histórias testadas. **Classificação: limitação/bug dev-only da ferramenta Pack Sandbox, NÃO do F2.5-hardening-1.** Não corrigido agora → **follow-up futuro (micro-bloco dev-only)**, junto do reset/diagnose genérico por `storyId` já apontado na seção 8.

**Conclusão:** F2.5-hardening-1 validado em device — C2 (fallback-first + anti-race na troca rápida), C3 (persistência sobrevive à reabertura) e C4 (colorir sem lineart errada) confirmados empiricamente; fallback local preservado; starters intactas.
