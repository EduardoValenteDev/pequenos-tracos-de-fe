# LIVRINHO_FIX_1 — Rede de segurança do autoplay do Livrinho (watchdog + backstop + estado de erro)

> **Bloco:** LIVRINHO_FIX_1 (correção técnica do travamento do Livrinho da Fé; separado da trilha F2.5). Fluxo SDD com portões. **Data:** 2026-07-06 · **Branch:** `content-integrate-coloring-3` · **HEAD anterior:** `75e6833`.
> **Operando sob `docs/DECISIONS.md` (2026-07-05) e `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.**

## 1. Problema
O Livrinho da Fé TRAVA durante o autoplay contínuo. Device (Etapa A, iPhone, ritmo normal, modo official): A Criação/Noé/Daniel travaram na cena 2, Davi e Golias na 4, Jesus e as Crianças na 7. Em todos: player em **"Ouvindo a história…"** (ícone ⏸, como se tocasse), mas o áudio **não progride** e a cena não avança; **NÃO** fica em "Carregando…"; **tocar Play recupera** o áudio.

## 2. Causa (diagnóstico)
Não é imagem (ambos os modos têm timeout/`onError`→fallback), nem download remoto, nem arquivo específico (o áudio do Livrinho é LOCAL do bundle; ocorre até em starter). O auto-start do `AudioPlayer` chama `player.play()` quando `status.isLoaded` e marca `appStatus='playing'` **otimista** + `autoStartedRef=true` (uma vez); em alguns remounts o `play()` **não faz o áudio progredir** → `status.didJustFinish` nunca dispara → `onFinished`→`onSceneAudioComplete` nunca chamado → **trava**. O timer de avanço é PULADO para cenas com áudio (`StoryBookScreen.js:583`) e o estado `error` do `AudioPlayer` era **dead code** → **sem rede de segurança no áudio**. `useAudioPlayerStatus` (expo-audio) **NÃO expõe campo de erro** de playback (`error`/`hasError` são só do Recording); expõe `currentTime`, `duration`, `playing`, `didJustFinish`, `isBuffering`, `isLoaded`, `timeControlStatus`, `reasonForWaitingToPlay`.

## 3. Solução (localizada em `AudioPlayer.js`; `StoryBookScreen.js` INTACTO)
### Watchdog de início (retry) — recupera
Enquanto deveria estar tocando (`autoPlay && !paused && appStatus==='playing' && isLoaded`), um timer rolante (janela **1500 ms**, auto-agendado, deps sem `currentTime`) verifica se **`currentTime` progrediu ≥ 0,15 s** via `hasAudioProgressed`. **Critério de stall = SÓ `currentTime`** (não usa `playing`/`timeControlStatus`, que mentem no bug); `isBuffering` **não** conta (espera legítima). Stall → **retry limitado** (`MAX_START_RETRIES=2`): `player.play()` (e `seekTo(0)` **só** se `currentTime < 0,3 s`, para não reiniciar áudio já progredido). `retryCount` reseta em janela saudável / novo asset / retry manual.

### Estado de erro (retry manual) — reaproveita a UI existente
Ao **esgotar** os retries: **limpa o timer**, **NÃO reagenda**, **NÃO chama `onFinished`**, `setAppStatus('error')`. A UI de erro já existente ("Erro ao carregar. Toque para tentar de novo") aparece; o toque chama `handlePlay`, que **reseta `retryCount`** + `player.play()` + sai de `'error'` (novo ciclo limpo). Sem inventar UX nova.

### Backstop de finalização — anti-freeze SEM pular áudio não ouvido
Rede para áudio que **tocou até o fim** mas cujo `didJustFinish` não veio: só chama `onFinished` (via o mesmo `finishedCalledRef`, uma vez) quando **`duration > 0` E `currentTime ≥ duration − 0,35 s`** (`isAudioNearEnd`), sustentado ~500 ms, e `!paused`. **Sem teto cego de tempo:** se `duration` for desconhecida e `currentTime` não progrediu, **NÃO avança** (o watchdog leva ao estado de erro). Assim, **nunca pula narração não ouvida**.

## 4. Invariantes preservadas
`onFinished` continua o **ÚNICO** caminho de avanço → os guards do pai (`isPlaybackContextLive()`/`lock`/`pending`, F2.4e.5pR) ficam intactos (`StoryBookScreen` não é tocado). `finishedCalledRef` impede duplo avanço (backstop + `didJustFinish` tardio = uma vez). Retry bounded (sem loop). Timers limpos em unmount/troca de cena/pause/background (`cancelled` + `clearTimeout` + `mountedRef`). Respeita `paused`/`autoPlay`/`AppState`. Nunca avança fora de foco. Não corta áudio válido (só age em stall confirmado / near-end).

## 5. Arquivos alterados
- `src/components/AudioPlayer.js` — helpers puros + watchdog + backstop + estado de erro + `handlePlay`.
- `scripts/smoke.js` — bloco LIVRINHO_FIX_1 + **migração fiel** de 2 checks (`didJustFinish (not timer)` e `autoplay opt-in sem timer novo`) que assertavam ausência de `setTimeout` — agora asseveram só ausência de timer **FAKE** (`setInterval`/`DURACAO_SIMULADA`), permitindo o safety-net do watchdog/backstop; `didJustFinish` segue primário.
- `docs/LIVRINHO_FIX_1.md` — este documento.

**NÃO alterados:** `src/screens/StoryBookScreen.js` (INTACTO), `audioService`, assets, áudios, imagens, histórias, R2, `package.json` (sem dep nova).

## 6. Valores
`WATCHDOG_WINDOW_MS=1500` · `MIN_PROGRESS_DELTA_S=0.15` · `MAX_START_RETRIES=2` · `SEEK_RESET_THRESHOLD_S=0.3` · `FINISH_EPSILON_S=0.35` · `FINISH_GRACE_MS=500`.

## 7. Testes
Smoke: eval real dos helpers; watchdog por `currentTime` (não `playing`/`timeControlStatus`) excluindo buffering; retry bounded + `seekTo(0)` condicional; erro sem reagendar/onFinished + limpa timer; backstop near-end sem teto cego; `onFinished` único + `finishedCalledRef`; `handlePlay` reseta retries; limpeza de timers/mountedRef; StoryBookScreen intacto; escopo. + `expo-doctor` + `git diff --check` + adversarial + device.
Device: autoplay contínuo sem tocar (Criação, Davi, Daniel, Jesus, Noé; official e child) → **não trava**, stall auto-recupera ou mostra erro+retry, áudio toca inteiro, pausa/refoco/background corretos.

## 8. Riscos e rollback
Regressão F2.4e.5pR (mitigado: `onFinished`+guards do pai intactos; watchdog respeita `paused`/`autoPlay`/`AppState`); duplo avanço (`finishedCalledRef`); loop/bateria (retries limitados); cortar/pular áudio (watchdog só em stall; backstop só near-end). Rollback: `git revert` do commit único; aditivo; sem mudança de contrato/props.

## 9. Fora deste bloco (registrado)
**Nota de produto (bloco/sub-bloco próprio, NÃO implementar aqui):** o **Livrinho oficial** continua liberado; o **Livrinho colorido/personalizado** (modo `child`) deve ficar **bloqueado até todas as cenas da história serem coloridas**, com uma **UX melhor** para o estado bloqueado — **sem emoji**, mensagem elegante e coerente com o app (o placeholder atual não agrada). Não misturar com este fix técnico.
