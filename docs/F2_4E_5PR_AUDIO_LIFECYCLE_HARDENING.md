# F2.4e.5pR — Auditoria e hardening MÁXIMO do lifecycle de áudio (Livrinho + Narração)

> **Bloco:** F2.4e.5pR (auditoria reforçada + hardening real, **antes da validação final e do commit** do F2.4e.5/e.5p). **Data:** 2026-07-05 · **Branch:** `content-integrate-coloring-3` · HEAD base `b2a735a` (F2.4e.5 + F2.4e.5p **locais, ainda NÃO commitados**).
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.**
>
> Motivação (fundador): *"este tipo de erro é grave demais para aceitarmos apenas com uma correção simples. Quero uma auditoria final com hardening real."* O bug reportado (áudio do Livrinho continuando no mapa + cadeia de autoplay descontrolada + botão invertido) foi **mitigado** pelo F2.4e.5p, mas restavam **lacunas de corrida e de background**. Este bloco fecha essas lacunas com um **token de sessão síncrono + AppState + guards em todos os callbacks**.

---

## 1. Escopo e arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/screens/StoryBookScreen.js` | Token `playbackGenerationRef` + espelhos síncronos (`isBookFocusedRef`/`appActiveRef`) + `isPlaybackContextLive()` + `invalidatePlaybackSession()` + `AppState` (background) + guards em `advanceToNextScene`/`onSceneAudioComplete`/timer + bumps do token nas trocas manuais e em play/pause. |
| `src/components/AudioPlayer.js` | Sincronização com `paused` passa a **pausar também durante o load** (`'loading'`); nunca inicia de `idle`/`done`. **`AppState`**: para o player no `'background'` e **reforça a pausa ao voltar** (anti auto-resume nativo), sem retomar sozinho. (Unmount-pause do F2.4e.5p preservado.) |
| `scripts/smoke.js` | +37 checks F2.4e.5pR (+ 1 check do F2.4e.5p e 3 checks do Livrinho 1.0 atualizados para a nova estrutura de timer/blur/token). |
| `docs/F2_4E_5PR_AUDIO_LIFECYCLE_HARDENING.md` | Este documento. |

**NÃO** tocados: `NarrationScreen.js` (já é **equivalente-ou-mais-seguro** — ver §5), `audioService.js`, `audioManifest.js`, `useResolvedStoryMedia.js` (F2.4e.5 preservado), `BeniGuideAudio.js`, package.json/lock, assets, **theme/tokens/paleta/fontes/design system**, RevenueCat, entitlement/paywall, Brincar, conclusão total, Free-sem-salvar, download/packs/sha256.

**Sem dependência nova:** `AppState` vem de `react-native` (já no projeto).

---

## 2. Auditoria — mapa dos consumidores de áudio (com evidência de código)

Consumidores do motor `expo-audio` no app:

1. **`AudioPlayer.js`** — controle visível (Narração + Livrinho). `useAudioPlayer(audioAsset, { updateInterval: 100 })`. Ciclo de vida amarrado à montagem: `useAudioPlayer` **libera o player automaticamente no unmount** (por isso **não** chamamos `remove()/release()/unload()` à mão — ver §4).
2. **`BeniGuideAudio.js`** — voz headless do guia (tour/Perfil). Toca ao carregar, **para no unmount** (`player.pause()` no cleanup). **Não** avança telas nem cenas; **não** tem cadeia de autoplay. Fora do bug reportado; **não alterado**.
3. **`NarrationScreen.js`** — usa `AudioPlayer`, **montado só com foco** (`hasSceneAudio(...) && isFocused`), play manual, sem cadeia de autoplay. **Não** tinha o bug (ver §5).
4. **`StoryBookScreen.js` (Livrinho)** — usa `AudioPlayer` com `autoPlay={autoplayActive}` + cadeia `onSceneAudioComplete → advanceToNextScene → próxima cena`. **Origem do bug.**

### 2.1 Garantias exigidas × estado ANTES do F2.4e.5pR

Nenhum áudio de história/Livrinho pode: (1) tocar fora da tela; (2) tocar no mapa; (3) tocar após sair/trocar de aba; (4) tocar após background/lock; (5) duplicar; (6) ficar mudo; (7) exigir 2 toques; (8) avançar cena por callback obsoleto; (9) iniciar autoplay após blur; (10) iniciar autoplay após unmount/troca de cena.

| # | Garantia | Antes do F2.4e.5pR | Lacuna |
|---|---|---|---|
| 1–3 | Sem áudio fora da tela / no mapa / ao sair | Blur (`useIsFocused`) fazia `setIsPaused(true)` — **mitigado** | **Corrida:** `didJustFinish`/timer disparando na janela blur→pause ainda avançava cena e refazia `setIsPaused(false)` (via `advanceToNextScene`), rearmando a cadeia fora da tela. Callbacks não checavam foco. |
| 4 | Sem áudio após background/lock | **Nenhum** tratamento de `AppState` | `useIsFocused` **não** muda no background → cadeia/timer seguiam; estado podia divergir e o botão inverter ao voltar. |
| 5 | Sem duplicar | `key={slideKey}` remonta + unmount-pause | OK (mantido). |
| 6 | Sem ficar mudo | Autostart espera `status.isLoaded` (LIVRINHO_AUTOPLAY_FIX_1) | OK (mantido). |
| 7 | Sem 2 toques | Estado seguro ao voltar | Fragilizado pela corrida/background (estado divergente). |
| 8 | Sem avanço por callback obsoleto | Só `lockRef` era checado | **Sem token de sessão nem checagem de foco** nos callbacks de avanço. |
| 9–10 | Sem autoplay após blur/unmount/troca | Blur zerava `autoplayActive` | Restava a corrida (item 8) e o load-window do `AudioPlayer` (áudio iniciado durante `'loading'` escapava do `paused`). |

**Conclusão da auditoria:** 3 lacunas reais — **(A) corrida de callback** (foco/token), **(B) background/lock** (AppState), **(C) load-window** no `AudioPlayer`.

---

## 3. Hardening aplicado

### 3.1 Token de sessão síncrono (`playbackGenerationRef`)
Inteiro incrementado **sincronamente** (write em ref, sem re-render) em: **blur**, **background**, **troca manual de cena** (voltar / ver de novo / trocar de modo / iniciar Livrinho), **novo início de áudio** (`onPlayStart`), **pausa manual** (`onUserPause`). Qualquer callback em voo capturado numa geração anterior vira **no-op**.

### 3.2 Espelhos síncronos + contexto vivo
`isBookFocusedRef` (espelho do `useIsFocused`, atualizado no efeito de foco) e `appActiveRef` (AppState). `isPlaybackContextLive()` = **foco E app ativo**. Todo callback que pode **avançar cena / iniciar autoplay** verifica `isPlaybackContextLive()`:
- `advanceToNextScene()` → `if (lockRef.current) return; if (!isPlaybackContextLive()) return;`
- `onSceneAudioComplete()` → `if (!isPlaybackContextLive()) return;` (antes de marcar pendência/avançar)
- **timer da cena sem áudio** → captura `gen` no agendamento e, ao disparar, `if (gen !== playbackGenerationRef.current) return; if (!isPlaybackContextLive()) return;`

### 3.3 `invalidatePlaybackSession()` — ordem no blur
Ordem exigida: **cancelar timers → invalidar token → pausar → desligar autoplay**. O helper faz *token bump + cancela `noAudioTimerRef` + limpa `pendingAutoAdvanceRef`*; o efeito de blur então `setIsPaused(true)` e `setAutoplayActive(false)`.

### 3.4 AppState (background/lock)
`AppState.addEventListener('change', …)`: ao **deixar de estar `active`** → `invalidatePlaybackSession()` + `setIsPaused(true)` + `setAutoplayActive(false)`. **Não** há auto-resume ao voltar (sem `setIsPaused(false)` no handler) — estado seguro aguardando Play. Listener removido no cleanup (`sub.remove()`).

### 3.5 `AudioPlayer` — fecha o load-window
A sincronização com `paused` passa a pausar quando `appStatus` é `'playing'` **ou** `'loading'` (antes só `'playing'`). Assim, um áudio iniciado durante o carregamento também é pausado ao perder foco/ir para background. **Nunca** inicia a partir de `idle`/`done` (não toca sozinho sem Play); **retoma só de `'paused'`**. O **unmount-pause** do F2.4e.5p permanece; o cleanup **não** chama `onFinished` (não simula conclusão natural).

---

## 4. Decisão sobre `stop`/`unload`/`release` do expo-audio

O player do Livrinho/Narração é criado por **`useAudioPlayer`**, cujo contrato **libera o player automaticamente no unmount**. Chamar `remove()`/`release()`/`unload()` manualmente sobre esse player é **arriscado** (risco de double-free / uso após liberação) e **não é necessário**. **Decisão:** o hardening usa **apenas API existente e segura** — `player.pause()` + **desmontagem** (auto-release do hook) + **remontagem por `key`** na troca de cena + **invalidação por token/foco/AppState**. **Não inventamos API** e **não** chamamos `remove/unload/release` à mão. Essa combinação já garante que o player antigo **não continua** após troca de fonte/cena (remonta) nem após sair (unmount-pause), e que nenhum callback obsoleto avança cena.

---

## 4b. Auditoria adversarial (3 revisores independentes) e reforços aplicados

Após o hardening inicial (§3), rodamos **3 auditores adversariais independentes** sobre o código real, cada um com a missão de **refutar** uma garantia (lente de corrida/token, lente de background/AppState, lente de regressão/escopo). Encontraram **3 lacunas convergentes** — todas fechadas:

- **Lacuna A — corrida de foco assíncrono (confirmada).** `isPlaybackContextLive()` lia `isBookFocusedRef`, atualizado **só no efeito** de `[isBookFocused]` (após o commit). Um `didJustFinish` disparando na janela blur→efeito via o espelho ainda `true` e podia **avançar cena fora da tela**. **Fix:** o guard passa a usar **`navigation.isFocused()`** — a verdade **síncrona** do foco (o estado de navegação muda no dispatch, sem esperar o re-render do `useIsFocused`). `appActiveRef` continua cobrindo background/lock.
- **Lacuna B — auto-resume nativo pós-background (native-dependent).** Nada **reafirmava** a pausa ao voltar ao foreground; se o expo-audio/iOS retomasse sozinho após interrupção/background (ex.: fim de ligação/Siri), o player tocaria com a UI dizendo "pausado" e um `didJustFinish` avançaria cena. **Fix:** **`AppState` no próprio `AudioPlayer`** — em `'background'` para o player e marca `pausedByLifecycleRef`; ao voltar a `'active'`, **reforça `player.pause()`** (anula o auto-resume nativo). Nunca retoma sozinho.
- **Lacuna C — divergência `isPaused`×player (confirmada).** Após background→voltar→Play manual, o `isPaused` do pai ficava `true` enquanto o player tocava; um novo background virava no-op (prop `paused` inalterada). **Fix:** **`onPlayStart` agora faz `setIsPaused(false)`** (todo início de reprodução reconcilia o pai) **e** o `AppState` do `AudioPlayer` para o player direto no background (independe da prop). Divergência eliminada.
- **Achado extra (UX) — `'inactive'` transitório.** Tratar todo estado ≠ `'active'` como "sair" cortava a história em **Central de Controle / banner de notificação / Face ID**. **Fix:** o halt do StoryBook e a pausa do AudioPlayer reagem a **`'background'`** especificamente; `'inactive'` transitório **não** corta a leitura (interrupções reais de áudio — ligação/Siri — são pausadas pela sessão de áudio nativa + pela lente B).

Resultado: as três garantias passam a se sustentar **sem depender do timing de re-render** (foco síncrono), **sem depender do comportamento nativo de resume** (reforço de pausa no foreground) e **sem cortar a história** em toques acidentais do sistema.

## 5. Paridade do NarrationScreen (equivalente-ou-mais-seguro) — sem alterar código

O `AudioPlayer` da Narração é **montado só com foco** (`hasSceneAudio(story.id, sceneKey) && isFocused`): ao perder o foco **desmonta** → o **unmount-pause** para o áudio. É **play manual** (sem `autoPlay`) e **sem cadeia de autoplay**, e a troca de cena é `navigation.replace` (**remonta** a tela inteira). Background: `setAudioModeAsync({ shouldPlayInBackground: false })` **para** o áudio nativamente e o expo-audio **não** retoma sozinho. Logo, a Narração já é **equivalente-ou-mais-segura** que o Livrinho endurecido — **nenhuma mudança** foi feita nela (evita risco na tela "boa"). O `AudioPlayer` compartilhado herda os hardenings de **load-window** (§3.5) e de **`AppState`/background** (§4b, lente B), beneficiando ambas as telas: a narração também **para no background** e **não retoma sozinha**.

---

## 6. Por que cada garantia agora se sustenta

- **(1–3) Sem áudio fora da tela/mapa/ao sair:** blur → `invalidatePlaybackSession()` (bump + cancela timer + limpa pendência) → `setIsPaused(true)` (pausa mesmo em load) → `setAutoplayActive(false)`. Qualquer `didJustFinish`/timer que dispare na janela é **barrado** pelo guard de foco/token.
- **(4) Sem áudio após background/lock:** AppState pausa + halta + invalida; sem auto-resume.
- **(5) Sem duplicar:** `key={slideKey}` remonta + unmount-pause do player anterior.
- **(6) Sem mudo:** autostart continua esperando `status.isLoaded` (LIVRINHO_AUTOPLAY_FIX_1 intacto).
- **(7) Sem 2 toques:** estado seguro e consistente ao voltar (cadeia parada, sem divergência).
- **(8) Sem avanço por callback obsoleto:** token + `isPlaybackContextLive()` em `advanceToNextScene`/`onSceneAudioComplete`/timer.
- **(9–10) Sem autoplay após blur/unmount/troca:** `autoplayActive=false` no blur/background; troca manual bump do token; load-window fechado no `AudioPlayer`.

---

## 7. Gates automáticos

- `npm run smoke` — **+37 checks F2.4e.5pR** (token, espelhos, `isPlaybackContextLive` via **`navigation.isFocused()`**, `invalidatePlaybackSession`, blur na ordem correta, AppState **só no `'background'`** + sem auto-resume + `sub.remove`, guards de avanço, timer com token/foco, bumps em play/pause e trocas manuais, `onPlayStart` limpa `isPaused`, load-window do `AudioPlayer`, **AppState do `AudioPlayer`** (background-pause + reforço no foreground), cleanup sem `onFinished`, paridade Narração, preservação F2.4e.3/e.4/e.5 + LIVRINHO_AUTOPLAY_FIX_1, escopo sem RevenueCat/entitlement/Brincar/conclusão/Free, sem StyleSheet novo, sem dep nova). Total do smoke: **1697/1697**.
- `npx expo-doctor` — verde.
- `npm run audio:audit` — verde.
- `git diff --check` — sem espaços/marcadores de conflito.

## 8. Validação manual no iPhone (cenários A–G)

- **A (bug principal):** Livrinho → cenas ilustradas → iniciar áudio → **sair para Início/mapa** enquanto toca → **áudio para imediatamente**; ficar no mapa → **nada volta a tocar**; a **cadeia de cenas não avança** no mapa.
- **B (troca de cena):** tocar → avançar → áudio anterior **para**, sem duplicar, estado correto.
- **C (play/pause):** tocar → pausar → tocar → **sem 2 toques**, botão nunca invertido.
- **D (voltar e entrar):** tocar → sair → entrar de novo → tocar → funciona, **sem áudio antigo preso**.
- **E (background/lock — NOVO):** tocar → **ir para background** (Home do iOS) ou **bloquear a tela** → áudio para → **voltar** → **não retoma sozinho** (aguarda Play), botão consistente, cadeia não avançou.
- **F (troca de aba — NOVO):** tocar → **trocar de aba** (Aventuras/Estrelinhas/Perfil) → áudio para, cadeia halta → **voltar** → estado seguro.
- **G (Narração — regressão):** Davi e Golias narração (local com pack reset; remoto com pack ready) → tocar → **trocar cena** → **background** → **voltar** → sem duplicar, sem mudo, sem áudio fora da tela.

## 9. Não-escopo (confirmações)

Sem `git add`/commit/push · **sem dependência nova** · sem package.json/lock · sem assets · **sem alterar design system/tokens/paleta/fontes** · sem RevenueCat/entitlement/paywall · sem Brincar · sem conclusão total · sem Free-sem-salvar · sem F2.4f · sem migração das 18 premium · sem remover requires locais · sem tocar download/packs/sha256 · **sem inventar API do expo-audio**.

## 10. Próximo passo

Validação manual no iPhone (A–G). Com F2.4e.5pR aprovado, desbloqueia o **commit** do conjunto F2.4e.5 + F2.4e.5p + F2.4e.5pR (código + docs), depois **offline completo do piloto** e **build real de medição**.
