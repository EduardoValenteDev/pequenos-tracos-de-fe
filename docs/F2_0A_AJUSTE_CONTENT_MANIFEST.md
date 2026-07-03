# F2.0a — Micro-auditoria e correção do contentManifest

> **Bloco:** F2.0a (pré-F2.1). Corrige camadas do `contentManifest.js`.
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD `da21cda`.
> **Escopo:** `src/data/contentManifest.js` (F2.0a — 4 valores de camada) +
> `scripts/smoke.js` (F2.0b — 1 check) + este doc.
> **Status:** correção aplicada, **gates verdes**. **Não commitado, não pushado.**
>
> ✅ **Gate resolvido no F2.0b (autorizado):** a correção zerou `coming_soon`, o que
> quebrava 1 check do `smoke` (`[Arquitetura 001.2: coming_soon declarável]`) que
> hardcodava `jesus_temple === 'coming_soon'`. No **F2.0b** o check virou
> extensão-agnóstico à camada (valida enum + `isValidLayer` + fallback, sem hardcodar
> história pronta). **smoke 1447/1447 · doctor 18/18 · audio 200/200.** Ver §8.

---

## 1. Resumo executivo

`contentManifest.js` marcava 4 histórias como `coming_soon` (`solomon_wisdom`,
`mary_says_yes`, `timothy_faith`, `jesus_temple`), mas a auditoria **comprovou** que as
4 têm **conteúdo completo** (10 cenas + 10 colorir + 10 áudio + capa + quiz, `status:
'available'`, `accessType: 'premium'`). Corrigi as 4 para **`remote`**. Estado final:
**2 starter · 18 remote · 0 coming_soon** — alinhado ao doc mestre (2 grátis locais + 18
premium em pack). `contentManifest` **não é consumido por nenhuma tela ainda** → mudança
**100% declarativa, zero efeito de runtime**.

---

## 2. Status inicial · Gates de entrada

- Branch `content-integrate-coloring-3` · HEAD `da21cda` · sincronizado · working tree limpo.
- **smoke 1447/1447 ✓ · expo-doctor 18/18 ✓ · audio 200/200 ✓** (entrada).

---

## 3. Estado anterior do contentManifest

`STARTER_STORY_IDS = ['creation','noah']`. `STORY_CONTENT_LAYER`:
- **starter (2):** creation, noah.
- **remote (14):** david_goliath, jesus_children, daniel_lions, jonah_big_fish, lost_sheep, good_samaritan, abraham_stars, joseph_colorful_coat, moses_red_sea, ruth_naomi, esther_queen, miraculous_catch, samuel_hears_god, josiah_young_king.
- **coming_soon (4):** solomon_wisdom, mary_says_yes, timothy_faith, jesus_temple. ← **alvo da auditoria**.

---

## 4. Auditoria das 4 histórias coming_soon

| storyId | Título | Estado atual | Existe | status (stories.js) | accessType | Cenas | Colorir | Áudio | Capa | Quiz | Decisão |
|---|---|---|---|---|---|---:|---:|---:|---:|---|---|
| solomon_wisdom | Salomão | coming_soon | ✅ | **available** | premium | 10 | 10 | 10 | ✅ | ✅ | → **remote** |
| mary_says_yes | Maria | coming_soon | ✅ | **available** | premium | 10 | 10 | 10 | ✅ | ✅ | → **remote** |
| timothy_faith | Timóteo | coming_soon | ✅ | **available** | premium | 10 | 10 | 10 | ✅ | ✅ | → **remote** |
| jesus_temple | Jesus no Templo | coming_soon | ✅ | **available** | premium | 10 | 10 | 10 | ✅ | ✅ | → **remote** |

Evidência transversal: `smoke` "Estado oficial 20/20 cenas + 20/20 colorir" verde,
`audio:audit` 200/200, todas com capa WebP (F1.2). **Nenhuma** é história realmente futura.

---

## 5. Critério e decisões

Critério para `coming_soon → remote` (todos verdadeiros): existe no catálogo · capa · 10
cenas · 10 colorir · 10 áudio · não é história futura real · pertence às 18 premium · não
é creation/noah. **As 4 atendem a todos.** → alteradas para `remote`. **0 dúvidas, 0
histórias mantidas em coming_soon.**

---

## 6. Alterações feitas

Somente 4 valores de camada em `src/data/contentManifest.js` (+ 1 comentário de
rastreabilidade). **Nada mais:** schema, nomes, ordem, `STARTER_STORY_IDS`, `REMOTE_PACKS`,
helpers, `CONTENT_LAYERS` (o enum `COMING_SOON` permanece — camada válida para futuro) —
tudo intacto.

```
solomon_wisdom: 'coming_soon'  →  'remote'
mary_says_yes:  'coming_soon'  →  'remote'
timothy_faith:  'coming_soon'  →  'remote'
jesus_temple:   'coming_soon'  →  'remote'
```

## 7. Estado final do contentManifest

- **starter (2):** creation, noah. *(inalterado)*
- **remote (18):** as 14 anteriores + solomon_wisdom, mary_says_yes, timothy_faith, jesus_temple.
- **coming_soon (0):** nenhuma (reservado para conteúdo realmente futuro).
- 20 histórias mapeadas · 0 duplicadas · creation/noah seguem starter · parse OK.

**Verificações (§7 da tarefa):** creation/noah continuam starter ✅ · premium completas
ficam remote ✅ · coming_soon só para futuro real (nenhum hoje) ✅ · nenhum storyId inválido
✅ · nenhuma história sumiu (20/20) ✅ · sem duplicidade ✅.

---

## 8. Riscos e ajuste do smoke (F2.0b — aplicado)

**A mudança do manifesto é declarativa** (nenhuma tela consome `contentManifest` —
auditado). Risco de runtime: **nenhum**.

A correção zerou `coming_soon`, quebrando 1 check — `[Arquitetura 001.2: coming_soon
declarável]` — que **hardcodava** `coming_soon.length >= 1 && getContentLayer('jesus_temple')
=== 'coming_soon'` (a suposição desatualizada). **Não era regressão do app.**

**F2.0b (aplicado):** o check passou a validar a **camada** `coming_soon` como declarável,
sem hardcodar história pronta:
```js
cm.CONTENT_LAYERS.COMING_SOON === 'coming_soon' &&
cm.isValidLayer('coming_soon') === true &&
cm.getContentLayer('__inexistente__') === 'coming_soon' // fallback real p/ storyId desconhecido
```
**Proteção preservada:** não removido, não `true` fixo — falha se o enum sumir, se
`isValidLayer` parar de aceitar `coming_soon`, ou se o fallback deixar de ser `coming_soon`.
**Gates: smoke 1447/1447 · doctor 18/18 · audio 200/200.**

---

## 9. Recomendação para F2.1

1. **F2.0b (feito):** ajuste extensão-agnóstico do 1 check `smoke` — gate verde. Pronto para
   commitar **F2.0a + F2.0b juntos** (contentManifest + smoke + este doc).
2. **F2.1:** com o manifesto correto (18 remote), o piloto de pack (`david_goliath`, sandbox
   local) pode declarar/consumir camadas com dados fiéis. Próximo passo: `contentResolver`
   + `packStorageService` + `packDownloadService` + `packIntegrityService` (spec 001 T017–T024).

---

## 10. Confirmações

- **Nenhum asset alterado.** **Nenhum require de mídia alterado.** Alterados só
  `contentManifest.js` (F2.0a — 4 valores + comentário) e `scripts/smoke.js` (F2.0b — 1 check).
- **F2.1 não iniciado** (nenhum resolver/serviço de pack/download/R2). RevenueCat, Brincar,
  Beni, colorir, áudio, rotas, contrato da jornada não tocados.
- **Sem commit, sem push, sem `git add`.**
