# F2.1g — Validação do caminho `ready` (sandbox `david_goliath`, cenas)

> **Bloco:** F2.1g (Fase 2 §19). **Validação, sem expandir consumo.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `e90751e`.
> **Regra central:** provar que a cena de `david_goliath` resolve `file://` quando o
> pack está `ready`, **sem** download/instalação/AsyncStorage/R2, e **sem** mudar o
> comportamento real (índice vazio → fallback `require`). Nada é expandido para outras
> histórias/mídias/telas. **Não commitado, não pushado, sem `git add`.**

---

## 1. Resumo executivo

Bloco de **validação puro**: **não** altera código de produção — só `scripts/smoke.js`
(+5 checks) e este documento. As provas rodam por **avaliação isolada** (o mesmo padrão do
smoke): o **resolver real** e o **hook real** são carregados em Node com stubs no lugar das
dependências Expo, e exercitados com um **`packEntry` `ready` CONTROLADO em memória** (nenhum
download, nenhuma escrita em AsyncStorage). Provado: índice vazio → `require`; `packEntry`
`ready` → `file://` em `scenes/david_goliath_scene_01.webp`; e o **gating do hook** mantém
`file://` restrito a `david_goliath` (outra história, mesmo com entry `ready`, cai em
`require`). Gates: **smoke 1488/1488 · doctor 18/18 · audio 200/200**.

---

## 2. Escopo

**Criados:** `docs/F2_1G_PACK_READY_SANDBOX_VALIDATION.md`.
**Alterados:** `scripts/smoke.js` (+5 checks F2.1g).
**NÃO alterado (validação não muda produção):** `contentResolver.js`, `useResolvedStoryMedia.js`,
`NarrationScreen.js`, `PacksContext.js`, assets, loaders de mídia, StoryDetail, ColoringScreen,
Home, Aventuras, AppNavigator, áudio, colorir, capas, RevenueCat, R2. Nada movido/renomeado.

---

## 3. Como a validação foi feita (sem download real)

Dois evaluators isolados (Node, sem Expo), com **`packEntry` `ready` fabricado em memória**:

1. **Resolver real** (`resolveStoryScene`): stubs para `contentManifest`/`packStorageService`/
   `storyImageService`/`audioService`. Exercitado com `packEntry = null` (índice vazio) e com
   `{ status: 'ready', localDir: 'file:///c/' }` (ready controlado).
2. **Hook real** (`useResolvedSceneImage`): stubs para `usePacks`/`resolveStoryScene`/
   `getOfficialSceneIllustration`, com `getPackEntry` devolvendo um entry `ready` para **todas**
   as histórias (controle) — para provar que o **gating** (não os dados) é quem restringe.

Nenhum arquivo do usuário é lido/escrito; nada é baixado; o índice real (`@ptf_packs_v1`) não é
tocado.

---

## 4. Resultado das provas (checks `[1484]`–`[1488]`)

| # | Prova | Resultado |
|---|---|---|
| `[1484]` | índice vazio → `david_goliath` cena = `require` (fallback local) | ✓ |
| `[1485]` | `packEntry` ready controlado → `david_goliath` cena = `file://…/scenes/david_goliath_scene_01.webp` | ✓ |
| `[1486]` | **gating do hook**: `david_goliath` → `file://`; `mary_says_yes` (entry ready) → `require` | ✓ |
| `[1487]` | áudio/colorir/capas 100% locais (loaders require-based, sem `file://`) | ✓ |
| `[1488]` | consumo só na NarrationScreen; read-only; sem download/R2/compras/entitlement | ✓ |

**Leitura do `[1486]`:** mesmo dando um `packEntry` `ready` para `mary_says_yes`, o hook
**não** produz `file://` — porque o hook só chama o resolver para `david_goliath`; qualquer
outra história segue `getOfficialSceneIllustration` (require). Logo, **nenhuma outra história
resolve `file://` neste bloco**, e o `file://` fica restrito a **cenas de `david_goliath`**.

---

## 5. Evidência end-to-end (reaproveitando o F2.1c)

Para além do eval em memória, re-executei a cadeia sandbox do F2.1c (instalação local + verify),
que resolve as 31 mídias por `file://` a partir de um pack instalado fora do repo:

```
verify-sandbox-resolver → resoluções file://: 31/31 · arquivos existentes: 31/31
fallback local (packEntry=null → require): OK ✓ · telas sem import do runtime: OK ✓
```

(É evidência complementar; roda **fora do repo**, sem R2 e sem tocar o app.)

---

## 6. Não-regressão (índice vazio = comportamento real)

Com AsyncStorage vazio (estado do app), `getPackEntry('david_goliath')` = `null` →
`resolveStoryScene(..., null).source` = `require` = `getOfficialSceneIllustration(...)`. O
`file://` **só** aparece na simulação controlada de um `packEntry` `ready` (`[1485]`/`[1486]`)
— **nunca** com índice vazio. O app continua renderizando `david_goliath` pelo binário.

---

## 7. Riscos · Rollback

| Risco | Mitigação |
|---|---|
| Achar que `file://` já vale no app | `[1484]` prova índice vazio → `require`; `file://` só na simulação controlada |
| `file://` vazar p/ outra história | `[1486]` (gating do hook) — outra história com entry ready → `require` |
| Áudio/colorir/capa mudarem | `[1487]` (loaders locais) |
| Consumo vazar de tela | `[1488]` (só NarrationScreen) |

**Rollback:** `git checkout -- scripts/smoke.js` + `rm docs/F2_1G_PACK_READY_SANDBOX_VALIDATION.md`.
Nenhum código de produção foi tocado.

---

## 8. Plano F2.1h (não iniciar agora)

1. **Instalação real no device (sandbox, sem R2):** gravar `@ptf_packs_v1` de verdade
   (`markPackReady`) → `refreshPacks()` → a cena de `david_goliath` render por `file://` **no
   aparelho** (validação visual real em device).
2. Estender (ainda gated) para **capa/áudio** de `david_goliath` quando `ready`.
3. `getStoryContractStatus` + `packState`. Depois: 2ª história, dep de crypto, R2. Sem RevenueCat.

---

## 9. Gates

**smoke 1488/1488 ✓** (`[1484]`–`[1488]`) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

---

## 10. Confirmações

- ✅ **Fallback local continua real com índice vazio** (`[1484]`); o app usa `require`.
- ✅ **`file://` só aparece na simulação controlada** de `packEntry` ready (`[1485]`/`[1486]`).
- ✅ **Somente `david_goliath` + cenas + NarrationScreen** seguem no escopo (`[1486]`/`[1488]`).
- ✅ **Nenhuma outra história, áudio, colorir ou capa foi conectada** (`[1486]`/`[1487]`).
- ✅ **Nenhum pack baixado ou instalado**; sem AsyncStorage real, R2, RevenueCat ou entitlement (`[1488]`).
- ✅ **Sem commit, sem push, sem `git add`.**
