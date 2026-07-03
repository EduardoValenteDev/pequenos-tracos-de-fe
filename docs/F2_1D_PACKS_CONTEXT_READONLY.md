# F2.1d — `PacksContext` read-only integrado ao app (sem consumo visual)

> **Bloco:** F2.1d (Fase 2 §19 — piloto de packs premium). **Integração de estado.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `0c6d8a0`.
> **Regra central:** o runtime **deixa de estar totalmente isolado** — um provider
> read-only passa a montar no app — mas **sem qualquer impacto visual**: nenhuma tela
> lê o contexto, nenhuma mídia passa a usar `file://`, o fallback local segue sendo o
> comportamento real, e `david_goliath` continua no binário. **Não commitado, não
> pushado, sem `git add`.**

---

## 1. Resumo executivo

Criei o **`PacksContext`** (read-only) e montei o **`PacksProvider`** no `App.js`,
envolvendo o `AppNavigator` dentro do `ProgressProvider`. No boot, ele **lê** o índice
local `@ptf_packs_v1` (via `packStorageService.getPackIndex`, que nunca lança) e expõe o
estado de cada pack. **Nenhuma tela consome** o contexto; **nenhuma escrita** em
AsyncStorage/`@ptf_packs_v1`; nenhuma instalação/download/R2. Com AsyncStorage vazio (estado
de instalação limpa), o app inicializa normalmente e todo pack `remote` fica
`not_downloaded`, `starter` fica `included`. Gates: **smoke 1471/1471 · doctor 18/18 · audio 200/200**.

---

## 2. Escopo

**Criados:**
- `src/context/PacksContext.js` — provider + hook + acessores read-only.
- `docs/F2_1D_PACKS_CONTEXT_READONLY.md` — este documento.

**Alterados (aditivos):**
- `App.js` — **+import** `PacksProvider` e **+montagem** envolvendo `AppNavigator` (sem reordenar os providers existentes).
- `scripts/smoke.js` — **+6 checks F2.1d**.

**Intocado:** telas (StoryDetail/Narration/Coloring e todas as 23), `ProgressContext`,
`storyJourneyService`, rotas/navegação, assets, loaders de mídia, RevenueCat, Brincar, Beni,
colorir, áudio; e `packStorageService`/`contentResolver` (nenhum ajuste foi necessário).

---

## 3. Onde o provider foi montado

`App.js`, no menor ponto seguro — **dentro** de `ProgressProvider`, **envolvendo** o `AppNavigator`:

```jsx
<SafeAreaProvider>
  <ProfileProvider>
    <ProgressProvider>
      <PacksProvider>            {/* F2.1d — read-only, sem consumo visual */}
        <AppNavigator />
      </PacksProvider>
    </ProgressProvider>
  </ProfileProvider>
</SafeAreaProvider>
```

Escolha: os providers já vivem no `App.js`; `PacksContext` não depende de
Profile/Progress (nem vice-versa), então a montagem é **aditiva** e não reordena nada.
Envolver o `AppNavigator` deixa o contexto disponível para o F2.1e (leitura por tela),
sem que nenhuma tela o consuma agora. Como `children` é referencialmente estável, a carga
assíncrona do índice **não re-renderiza** o `AppNavigator` (contexto só re-renderiza quem
faz `useContext` — e ninguém faz).

---

## 4. Contrato do `PacksContext`

| Valor / função | Descrição |
|---|---|
| `packIndex` | mapa `storyId → CacheEntry` lido de `@ptf_packs_v1` (`{}` se vazio) |
| `isLoadingPacks` | `true` até o índice carregar (não bloqueia render) |
| `packsError` | erro de leitura (capturado; app não quebra) |
| `refreshPacks()` | recarrega o índice (somente leitura) |
| `getPackEntry(storyId)` | `CacheEntry` do índice ou `null` |
| `getPackStatus(storyId)` | status considerando a camada (string) |
| `isPackReady(storyId)` | `true` só se status `ready` |
| `getStoryPackState(storyId)` | `{ storyId, layer, status, ready, localDir, entry }` |

**Somente leitura:** importa apenas `getPackIndex` + `PACK_STATUS`. **Não** importa/chama
`savePackIndex`/`setPackEntry`/`clearPackEntry`/`setItem`, **não** baixa, **não** instala.

---

## 5. Estado default esperado (AsyncStorage vazio no boot)

| storyId | camada | status |
|---|---|---|
| `creation` | starter | **included** |
| `noah` | starter | **included** |
| `david_goliath` | remote | **not_downloaded** |
| demais 17 premium | remote | **not_downloaded** |

Provado por avaliação do `contentManifest` real (smoke `[1469]`).

### Como `starter` vira `included`
`getStoryPackState` chama `getContentLayer(storyId)`; se a camada é `CONTENT_LAYERS.STARTER`
(creation/noah), retorna `status: PACK_STATUS.INCLUDED` — **sem** olhar o índice (starter
está no binário, não é pack baixável). `isPackReady` é `false` para starter (não há pack;
`included` ≠ `ready`), mas a mídia starter **sempre** resolve pelo `require` local.

### Como `remote` sem índice vira `not_downloaded`
Para camada `remote`, lê `packIndex[storyId]`. Com AsyncStorage vazio não há entrada →
`status: PACK_STATUS.NOT_DOWNLOADED` (`ready:false`, `localDir:null`). É o estado correto de
uma instalação limpa: o pack ainda não foi baixado, e a mídia continua vindo do **fallback
local** (require no binário).

---

## 6. O que NÃO foi integrado (de propósito)

- **Nenhuma tela** lê o `PacksContext` (sem consumo visual — smoke `[1470]`).
- **Nenhuma mídia usa `file://`**; o `contentResolver` não é chamado por telas.
- **Fallback local continua sendo o comportamento real**; `david_goliath` segue no binário.
- **Nenhuma escrita** em `@ptf_packs_v1`/AsyncStorage; nenhuma instalação; nenhum `ready` no app.
- **Sem R2, sem download, sem RevenueCat.** Jornada/`storyJourneyService` sem `packState`. F2.1e não iniciado.

---

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Provider quebrar o boot | `PacksProvider` **sempre** renderiza `children`; `loadPacks` em try/catch/finally; `getPackIndex` nunca lança; erro → `packIndex {}` + `packsError`, app abre |
| Re-render indesejado | valor memoizado (`useMemo`); `children` estável → `AppNavigator` não re-renderiza; ninguém faz `useContext` ainda |
| Escrita acidental no índice | importa só leitura; smoke `[1467]` proíbe `savePackIndex`/`setPackEntry`/`setItem`/download |
| Consumo visual precoce | smoke `[1470]` falha se qualquer tela importar `usePacks`/`contentResolver`/`pack*` |
| Regressão de estado | `starter→included`/`remote→not_downloaded` fixado por eval (`[1469]`) |

---

## 8. Rollback

Nada commitado. Reverter =
`git checkout -- App.js scripts/smoke.js` +
`rm src/context/PacksContext.js` +
`rm docs/F2_1D_PACKS_CONTEXT_READONLY.md`.
Como nenhuma tela consome o contexto e o provider é read-only, remover é inócuo ao app.

---

## 9. Plano F2.1e (não iniciar agora)

1. **Leitura por tela atrás de flag:** StoryDetail/Narration passam a preferir o pack `ready`
   via `resolveStoryMediaFromPackEntry(storyId, kind, n, getPackEntry(storyId))`, com
   **fallback local** quando não `ready` — **sem** tirar `david_goliath` do binário.
2. **Instalação real no device (sandbox, sem R2):** `simulateInstallLocalPack` + `markPackReady`
   gravando `@ptf_packs_v1` de verdade; `refreshPacks()` reflete o `ready`.
3. **`getStoryContractStatus` + `packState`** (contrato A0.10 + eixo de disponibilidade física).
4. **Dep de crypto aprovada** → sha256 real no app.
5. **Sem** R2 real, **sem** migrar as outras 17, **sem** colorir final, **sem** RevenueCat.

---

## 10. Gates

**smoke 1471/1471 ✓** (6 checks F2.1d: `[1466]`–`[1471]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

---

## 11. Confirmações

- ✅ **Não houve gravação em AsyncStorage real.** ✅ **Não houve `@ptf_packs_v1` escrito no app.**
- ✅ **Não houve instalação de pack.** ✅ **Não houve `ready` no app.** ✅ **Não houve R2.** ✅ **Não houve download.**
- ✅ **Nenhuma tela consome mídia por `file://` ainda.** ✅ **`david_goliath` continua no binário como fallback.**
- ✅ **Nenhuma tela alterada.** ✅ **Nenhum asset alterado.** ✅ **Nenhum require de mídia alterado.**
- ✅ **F2.1e não iniciado.** ✅ **Sem commit, sem push, sem `git add`.**
