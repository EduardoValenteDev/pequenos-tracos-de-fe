# F2.4e.5p — Correção de lifecycle de áudio no Livrinho (StoryBookScreen)

> **Bloco:** F2.4e.5p (correção obrigatória antes do commit do F2.4e.5). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · HEAD base `b2a735a` (F2.4e.5 **local, ainda NÃO commitado**).
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.**

## 1. Bug reportado (validação humana no iPhone)
1. No **Livrinho da Fé** (cenas ilustradas), ao **sair para o Início/Mapa** com o áudio tocando, **o áudio continuava** — a **história inteira** seguia tocando enquanto o usuário olhava o mapa.
2. Erros intermitentes na **continuação automática** dos áudios do Livrinho: às vezes trava, o botão fica **invertido** (precisa tocar play para pausar e de novo para iniciar).

## 2. Causa provável
- **Áudio no mapa:** o `AudioPlayer` do Livrinho **não era gated em foco** e **não havia handler de blur**. O `AudioPlayer` da **NarrationScreen** (que NÃO tinha o bug) já é gated em `isFocused` (desmonta e para ao perder o foco). No StoryBookScreen, ao navegar para `Home`/mapa a tela **permanece montada** → o player continua e a **cadeia de autoplay** (`onSceneAudioComplete → advanceToNextScene → próxima cena autoplay`) segue avançando cenas → "história inteira tocando".
- **Autoplay/botão invertido:** consequência da **mesma cadeia rodando descontrolada** (sem parar no blur) — ao voltar, o estado do player (`appStatus`) diverge do visual, deixando o botão invertido.
- **F2.4e.5 causou?** **Não.** F2.4e.5 só tocou NarrationScreen + o hook (fonte do áudio). O bug do Livrinho é **pré-existente** (StoryBookScreen sempre tocou áudio local, autoPlay, sem cleanup de blur) — foi **revelado** durante a validação do F2.4e.5.

## 3. Arquivos alterados
- **`src/screens/StoryBookScreen.js`** — `useIsFocused()` + efeito de **blur** que para o áudio e halta o autoplay.
- **`src/components/AudioPlayer.js`** — no **unmount**, pausa o player (defensivo, try/catch) além do `onNarrationEnd` existente.
- **`scripts/smoke.js`** — +11 checks F2.4e.5p.
- **`docs/F2_4E_5P_AUDIO_LIFECYCLE_STORYBOOK.md`** — este documento.

**Não** tocados: **`audioService.js`**, `audioManifest.js`, package.json/lock, assets, **theme/tokens/paleta/fontes/design system**, RevenueCat, entitlement/paywall, Brincar, conclusão, Free-sem-salvar. F2.4e.5 (hook `useResolvedStoryAudio` + NarrationScreen) preservado.

## 4. Correção aplicada
1. **StoryBookScreen — parada no blur:** `const isBookFocused = useIsFocused();` + efeito:
   ```js
   useEffect(() => {
     if (!isBookFocused) {
       setIsPaused(true);          // → AudioPlayer.player.pause() (via prop `paused`) + para o timer das cenas sem áudio
       setAutoplayActive(false);   // → a próxima cena NÃO toca sozinha (halta a cadeia)
       pendingAutoAdvanceRef.current = false; // invalida avanço pendente (callback antigo)
     }
   }, [isBookFocused]);
   ```
   Cobre **todos os caminhos de saída** (Início, mapa, Voltar, troca de aba) porque `blur` dispara mesmo se a tela permanecer montada.
2. **AudioPlayer — stop no unmount:** o cleanup passa a chamar `player.pause()` (try/catch) antes de `onNarrationEnd()` — garante o stop quando a tela **desmonta** (ex.: `goBack` que faz pop) ou na **troca de cena** (remount por `key`). Não altera play/pause/replay/autoplay — só o fim de vida.

## 5. Por que isso resolve
- **Áudio para ao sair:** blur → `setIsPaused(true)` pausa o player enquanto montado; se desmontar, o unmount-pause para. Nenhum áudio no mapa.
- **Sem autoplay no mapa:** `setAutoplayActive(false)` + `pendingAutoAdvanceRef=false` haltam a cadeia — nenhuma cena toca sozinha fora da tela.
- **Botão não fica invertido:** parar a cadeia no blur deixa um **estado seguro** ao voltar (aguardando Play), eliminando a divergência que causava o botão invertido.
- **Troca de cena:** o `AudioPlayer` já remonta por `key={slideKey}`; agora o unmount **para** o player anterior → nunca dois áudios ao mesmo tempo.

## 6. Confirmações
- **Cleanup ao sair (blur/unmount):** ✅ (efeito de blur + unmount-pause).
- **Troca de cena não deixa áudio antigo:** ✅ (unmount-pause no remount por key).
- **Autoplay não duplica:** ✅ (fiação `autoPlay={autoplayActive}` inalterada; blur zera; sem autoplay novo).
- **Play/pause/replay não ficam invertidos:** ✅ (estado seguro ao voltar; handlers do AudioPlayer intactos).
- **NarrationScreen (F2.4e.5) ok:** ✅ (áudio remoto via hook preservado).
- **F2.4e.3 coloring + F2.4e.4 cover ok:** ✅. **A Criação/Noé:** ✅ locais. **Remoto limitado ao sandbox:** ✅.

## 7. Validação manual no iPhone
- **A (bug principal):** Livrinho → cenas ilustradas → iniciar áudio → **sair para Início/mapa** enquanto toca → **áudio para imediatamente**; ficar no mapa alguns segundos → **nenhum áudio volta sozinho**.
- **B (troca de cena):** Livrinho → tocar áudio → avançar de cena → áudio anterior **para**, estado correto, **sem duplicar**.
- **C (play/pause):** tocar → pausar → tocar → **sem precisar de 2 toques**; botão não invertido.
- **D (voltar e entrar):** tocar → sair → entrar de novo → tocar → **funciona, sem áudio antigo preso**.
- **E (NarrationScreen):** Davi e Golias narração — local (pack reset) e remoto (pack ready) — trocar cena, voltar → **sem duplicar, sem mudo, sem áudio fora da tela**.

## 8. Nota
A correção é de **lifecycle** (parar/haltar), não visual e não esconde o problema. Caso persista algum glitch de autoplay **estritamente durante a reprodução** (não relacionado a sair/voltar), será tratado como ajuste próprio da máquina de estados do autoplay — sem risco ao `LIVRINHO_AUTOPLAY_FIX_1`, que permanece intacto.
