# LIVRINHO_UX_1 — Bloqueio do Livrinho colorido incompleto (estado sem emoji)

> **Bloco:** LIVRINHO_UX_1 (UX/produto; separado do fix técnico LIVRINHO_FIX_1). Fluxo SDD com 3 portões humanos. **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD anterior:** `5d0d006`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.**

## 1. Problema
O Livrinho da Fé oferece dois modos: **História ilustrada** (`official`) e **Meu livrinho colorido** (`child`). O modo `child` estava sendo liberado com pintura **parcial** — bastava **1** cena pintada (gate antigo `childArtCount === 0`). Cenas não pintadas caíam num placeholder com **emoji** grande, que não agrada. Direção de produto: o modo colorido só deve abrir quando a criança pintou **todas** as cenas; o estado bloqueado deve ser elegante e **sem emoji**.

## 2. Regra aprovada
- **Oficial:** sempre liberado (inalterado).
- **Colorido (`child`):** libera **somente** com a aventura 100% pintada:
  ```
  coloredComplete = totalScenes > 0 && childArtCount === totalScenes
  ```
- **Fonte de verdade:** `hasMeaningfulPaint(drawings[c.id])` (arte realmente renderizável no modo child). **Não** usar `storyJourneyService.coloringComplete` (que é "pelo menos 1 página").
- `totalScenes = story.cenas.length`; `childArtCount = cenas.filter(hasMeaningfulPaint).length`; `firstUncoloredIndex = cenas.findIndex(!hasMeaningfulPaint)`.

## 3. Solução (localizada no `intro` do `StoryBookScreen`)
Gate no **intro** (choke point único: as 3 telas que abrem o Livrinho passam só `{ story }`, e o modo inicial é sempre `official`). Quando `viewMode === 'child' && !coloredComplete`, renderiza o **estado bloqueado sem emoji**:
- **BeniAvatar `variant="happy"`** — variante existente, pose "acenando", **sem badge emoji** (ao contrário de `reading`=📖, `locked`=🔒, `thinking`=💭). Sem asset novo, sem variante nova.
- **Título:** "Seu livrinho colorido fica pronto quando você pinta a aventura inteira."
- **Subtítulo:** "Você já pintou {childArtCount} de {totalScenes} cenas. Pinte todas para abrir um livrinho só com as suas pinturas."
- **Progresso (texto):** "{childArtCount}/{totalScenes} cenas pintadas" (sem barrinha).
- **CTA primário:** "Pintar próxima cena" → `Coloring` na **1ª cena não pintada** (`cenaIndex: firstUncoloredIndex >= 0 ? firstUncoloredIndex : 0`).
- **CTA secundário:** "Ver história ilustrada" → `handleSelectMode('official')`.
- **Card do modo child:** badge `{childArtCount}/{totalScenes}` e sub "Disponível quando você pintar todas as cenas." (mantém o 🎨 do tile de prévia — emoji **fora** do estado bloqueado, conforme a regra de não remover emoji de outras áreas).

### Refresh ao voltar do Coloring (blocker de device corrigido dentro deste bloco)
`drawings` era lido só no `init()` (keyed `[story?.id]`); ao voltar do Coloring a tela **permanece montada**, então `childArtCount`/`coloredComplete` ficavam **stale** — o Livrinho seguia bloqueado até sair e reabrir a história. Correção **localizada** no `StoryBookScreen`: `loadDrawingsMap(story)` (reaproveitado pelo `init`) + `useFocusEffect` que, **só no `intro`** (`screenStateRef.current === 'intro'`, para não perturbar o `playing`/áudio), recarrega os desenhos quando a tela **reganha foco**. Guard `cancelled` (dispara no blur/desmontagem) evita `setState` após sair da tela. `childArtCount`/`firstUncoloredIndex`/`coloredComplete` recomputam no render a partir de `drawings`. **Sem polling, sem `setInterval`, sem storage novo, sem chave `@ptf_*` nova.**

## 4. Invariantes preservadas
- **Oficial intacto:** o ramo `senão` (inclui `viewMode === 'official'`) sempre mostra o botão de abrir; `resolveStoryBookPageImage` ramo `official` inalterado.
- **Fallback do playing preservado:** `resolveStoryBookPageImage` (child) / `makeFallbackVisual` / `BookArtFallback` **não** foram tocados. Com o gate no intro, é impossível **entrar** no child abaixo de 100% → o fallback "Você ainda não pintou esta cena." torna-se inalcançável no fluxo normal, mas segue como **rede de segurança**.
- **Áudio intacto:** nada do `playing`/autoplay, `timeline`, efeitos de lifecycle, `onSceneAudioComplete`, `handleEnterLivrinho`/`handleStartLivrinho`, `AudioPlayer` ou `audioService` foi alterado. **LIVRINHO_FIX_1 intacto.**
- **Ortogonal ao paywall:** `accessControl`/estado `locked`/`LockedStoryFallback` não tocados.
- **Sem flash:** `init()` popula `drawings` antes de ir ao `intro`, então `childArtCount`/`coloredComplete` já são reais quando o estado bloqueado renderiza.

## 5. Arquivos alterados
- `src/screens/StoryBookScreen.js` — `intro`: `firstUncoloredIndex` + `coloredComplete`; gate `!coloredComplete`; painel bloqueado (BeniAvatar happy + progresso + 2 CTAs, sem emoji); card do child (badge `{n}/{total}` + sub de bloqueio); estilos (`blockedAvatar`/`blockedProgress`/`blockedSecondaryBtn`/`blockedSecondaryText`); remoção do estilo morto `bookEmptyEmoji`; **refresh ao focar** (`loadDrawingsMap` + `useFocusEffect` + `screenStateRef`, escopado ao `intro`).
- `scripts/smoke.js` — bloco de checks LIVRINHO_UX_1.
- `docs/LIVRINHO_UX_1.md` — este documento.

**NÃO alterados:** `AudioPlayer`, `audioService`, paywall/`accessControl`, assets, imagens, áudios, histórias, quizzes, R2, downloader, F2.5 hardening, `package.json` (sem dep nova).

## 6. Cobertura (auditoria)
As 20 histórias têm **10 cenas** e **10 linearts** (scene_01..scene_10) → o alvo "100% colorido" é **sempre atingível**, sem exceção de história com <10 cenas.

## 7. Testes
Smoke: gate por `coloredComplete` (com `totalScenes>0`) e ausência do antigo `childArtCount === 0`; fontes de verdade; copy aprovada; estado bloqueado com BeniAvatar `happy` **sem emoji** e sem variante insegura; CTAs (Coloring 1ª pendente / official); card do child; oficial liberado; fallback do playing preservado; AudioPlayer/LIVRINHO_FIX_1 intactos.
Device (iPhone, Plano Família): 0/10 e parcial (ex.: 3/10) → bloqueado (sem emoji, "n/10", CTA leva à 1ª pendente); 10/10 → abre e roda; oficial abre sempre; CTA secundário troca p/ oficial; após pintar a última → desbloqueia; autoplay oficial e child (100%) sem travar (LIVRINHO_FIX_1 intacto). Print/vídeo do estado bloqueado.

## 8. Riscos e rollback
Sem perda de dados (só muda liberação de visualização; desenhos preservados). Re-bloqueio honesto ao apagar uma cena. Ortogonal ao paywall e ao áudio. Rollback: `git revert` do commit único; mudança aditiva e localizada; sem mudança de contrato/props/storage/chaves `@ptf_*`.

## 9. Observação de device e bloco futuro (registrado)
**Validação visual (iPhone):** o estado bloqueado foi **aprovado** (Beni + título + subtítulo + progresso "5/10" + "Pintar próxima cena" + "Ver história ilustrada"). **Blocker de refresh** ao voltar do Coloring (progresso stale) foi **corrigido dentro deste bloco** (ver §3, refresh ao focar). Critérios de aceite validados: 5/10→6/10 sem sair; 9/10→desbloqueia ao pintar a última; 10/10 permanece liberado; oficial sempre liberado; sem precisar voltar à Home/Detalhe nem reabrir o app.

**Bloco futuro — `LIVRINHO_UX_2` / `COLORING_FLOW_1` ("Completar cenas pendentes em sequência"):** ao tocar "Pintar próxima cena", oferecer um fluxo que leve a criança por **todas** as cenas faltantes em sequência até liberar o Livrinho colorido (hoje o CTA abre só a 1ª pendente e retorna). **NÃO implementado neste commit** — exige auditoria própria da tela de colorir e spec própria. Registrado para depois.
