# Palavrinhas do Beni — Tarefas (Etapa SDD 5)

> **Feature:** `009-palavrinhas-do-beni` · **Etapa SDD:** 5 (Tasks) · **🚦 Portão 3 (tasks/análise): PENDENTE.**
> **Base:** `content-integrate-coloring-3` @ `e1cffdd`. Deriva de [spec-palavrinhas.md](spec-palavrinhas.md) e [plan-palavrinhas.md](plan-palavrinhas.md) (Portão 1 e Portão 2 aprovados).
> **Escopo:** tarefas atômicas, ordenadas e verificáveis. **Nenhum código, asset, build, `git add`/commit/push.** HEAD permanece `e1cffdd`.

## Convenções

- **Módulos puros** (`palavrinhasWords.js`, `palavrinhasGameService.js`, `palavrinhasGameMachine.js`, `palavrinhasDirector.js`, `tracadoService.js`, `letterPaths.js`) **NÃO** importam `react-native`, `expo*` nem APIs de UI/tempo — são avaliados no smoke por `new Function`.
- **Arquivos proibidos/protegidos** (nunca tocados na v1, salvo bloco isolado com aprovação): `App.js`, `src/services/storageKeys.js` (chave nova), `src/data/achievements.js`, `accessControl`, paywall/monetização.
- **Gates por tarefa:** `npm run smoke` verde **e** `npx expo-doctor` verde (+`git diff --check`) salvo indicação; commit **seletivo**, 1 tarefa/bloco lógico = 1 commit; **sem push** sem autorização.
- **Regra de portões:** nenhuma tarefa após um 🚦 é executável antes da aprovação humana correspondente (coluna "Iniciar após").

---

## 0. Sequência ordenada e portões (visão única)

| Ordem | Tarefa | Fase/Bloco | Iniciar após | Aparelho real? |
|---|---|---|---|---|
| 1 | T-A1 Banco de palavras | 0 / P2 | Portão 2 | não |
| 2 | T-A2 Serviço puro (baralho/seed/plano/validador) | 0 / P2 | T-A1 | não |
| 3 | T-A3 Máquina de estados pura | 0 / P3 | T-A2 | não |
| 4 | T-B1 Rotas + card + nav gating | 1 / P4 | T-A3 | não |
| 5 | T-B2 Tela base + Livro + seleção + página + Beni(7) + amostra COMPLETE | 1 / P4 | T-B1 | **sim** |
| — | **🚦 PORTÃO VISUAL 1** | — | T-B2 | **sim** |
| 6 | T-C1 Auditoria de raiz (GestureHandlerRootView) | 2 / P5a | 🚦 Visual 1 | não |
| 7 | T-C2 `tracadoService.js` (geometria pura) | 2 / P5 | T-C1 | não |
| 8 | T-C3 `letterPaths.js` — **somente A, O, L** | 2 / P5 | T-C1 | não |
| 9 | T-C4 TraceLab (tela dev isolada) A/O/L | 2 / P5 | T-C2, T-C3 | **sim** |
| — | **🚦 PORTÃO TÉCNICO DE TRAÇADO** (A/O/L, iPhone **e** Android) | — | T-C4 | **sim** |
| 10 | T-B3 COMPLETE completo | 3 / P6 | 🚦 Visual 1 (agendada pós-Técnico) | não |
| 11 | T-B4 MONTE + desfazer (por `iid`) | 3 / P6 | T-B3 | não |
| 12 | T-A4 Brilho 3/2/1 + fila de reforço (puro) | 3 / P7 | T-A2, T-A3 (puro; sem UI) | não |
| 13 | T-B5 Erros/dicas/Resgate/reforço (UI, **só 7 poses**) | 3 / P7 | T-A4 | **sim** |
| 14 | T-C5 Integração do TRACE ao fluxo | 3 / P8 | **🚦 Técnico**, T-B5 | **sim** |
| 15 | T-C6 Expansão de letras + tolerância | 3 / P8 | **🚦 Técnico**, T-C5 | **sim** |
| 16 | T-E1 Registrar 3 poses órfãs do Beni (assets) | 3 / P9 | 🚦 Visual 1 (antes de T-B6) | não |
| 17 | T-B6 Animações + reações Beni (usa órfãos) + sons | 3 / P9 | T-E1, T-C5 | **sim** |
| 18 | T-A5 `palavrinhasDirector.js` (adaptativo puro) | 3 / P10 | T-A4 | não |
| 19 | T-B7 Aplicar Director + Página Tranquila (UI) | 3 / P10 | T-A5, T-B5 | **sim** |
| 20 | T-D1 `brincarStatsService` `palavrinhas` (mesma chave) | 3 / P11 | T-A3 | não |
| 21 | T-D2 Estrela única gated + `refreshProgress` (UI) | 3 / P11 | T-D1, T-B7 | **sim** |
| 22 | T-B8 Tela de resultado + rejogar/trocar | 3 / P11 | T-D2 | **sim** |
| 23 | T-F1 Inspetor de palavras (gallery dev) | 3 / P12 | T-A2, T-B8 | não |
| 24 | T-F2 Simulador de sessões (dev) | 3 / P12 | T-F1 | não |
| — | **🚦 PORTÃO VISUAL 2** (frame + **Lista de Imagens** aprovada) | — | T-F2 | **sim** |
| 25 | T-E2 Produção/registro 30–36 imagens de palavra + manifesto 36/36 | 4 / P13 | **🚦 Visual 2 + Lista aprovada** | **sim** |
| — | **🚦 PORTÃO DE ASSETS** (padrão + manifesto 36/36) | — | T-E2 | **sim** |
| 26 | T-G1 Integração final (3 microatividades + imagens) | 5 / P14 | **🚦 Assets** | **sim** |
| 27 | T-G2 Regressão (Ovelhinha + app + smoke total) | 5 / P14 | T-G1 | **sim** |
| — | **🚦 PORTÃO DE INTEGRAÇÃO FINAL** | — | T-G2 | **sim** |

> **Bloqueios duros:** T-C6 (expansão do traçado) **não inicia** antes do 🚦 Técnico. T-E2 (produção de imagens) **não inicia** antes do 🚦 Visual 2 **e** da **Lista de Imagens** formalmente aprovada. O protótipo de traçado (T-C2/C3/C4) fica **isolado e limitado a A, O, L**. As poses órfãs do Beni são registradas em **T-E1 (P9)**, antes do primeiro uso — o P13 **não** toca poses do Beni.

---

## (a) Tarefas de MÓDULOS PUROS

### T-A1 · Banco de palavras
1. **ID:** T-A1. 2. **Bloco/Fase:** P2 / Fase 0.
3. **Objetivo:** criar o banco literal das 36 palavras (§10.2 da spec) com estrutura completa (§10.1), `letterInstances` por ocorrência, `enabled=false` para palavras com acento/Ç até a infra validar.
4. **Arquivos novos:** `src/data/palavrinhasWords.js`.
5. **Arquivos alterados:** —.
6. **Proibidos/protegidos:** qualquer `require` de imagem inexistente; `storageKeys.js`; `achievements.js`.
7. **Dependências:** Portão 2 aprovado.
8. **Passos:** definir schema literal; 12/12/12 por dificuldade; marcar `imageRef` como chave lógica (asset real só no P13; usar placeholder/`null` controlado + `enabled` conforme disponibilidade); expandir letras repetidas em `iid`; `accentRules.introducedAt='dificil'` e `enabled=false` p/ acentuadas.
9. **Testes obrigatórios:** smoke itens 1–13 (ids únicos, categorias, palavra↔dificuldade, letras repetidas por `iid`, acentos/Ç/dígrafos marcados, distratores/`missingPatterns`/`traceTargets` estruturais, **nenhum asset inexistente ativo**).
10. **Aceite:** `validarBanco` (T-A2) roda sem erro sobre este banco; 36 itens; nenhuma palavra acentuada `enabled=true`.
11. **Evidência:** saída do validador (0 problemas) + contagem 12/12/12 + lista de `iid` de ARARA (5).
12. **Aparelho real:** não.
13. **Portão que bloqueia a próxima:** — (segue T-A2).

### T-A2 · Serviço puro: baralho, seed, plano, validador
1. **ID:** T-A2. 2. **Bloco/Fase:** P2 / Fase 0.
3. **Objetivo:** `palavrinhasGameService.js` puro: copiar verbatim `criarRng/novaSeed/shuffle/criarDeckState/clonarDeckState/assinaturaDeck/planId`; `validarBanco`; montadores de baralho de palavras (categoria/atividade/`missingPattern` alternados, sem repetição prematura); `planPartida({rng,dificuldade,words,rounds,deckState})→{plano,deckState,planId}`.
4. **Arquivos novos:** `src/services/palavrinhasGameService.js`.
5. **Arquivos alterados:** —. 6. **Proibidos:** RN/Expo/UI imports; `storageKeys.js`.
7. **Dependências:** T-A1.
8. **Passos:** portar primitivas da Ovelhinha; implementar validador (todas as regras §10/§21); montadores + `planPartida`; garantir determinismo e imutabilidade do plano retornado.
9. **Testes obrigatórios:** itens 14–19 (sem repetição prematura, alternância de categoria/atividade/`missingPattern`, seed determinística, planId determinístico, plano imutável) + validador 0 problemas.
10. **Aceite:** mesma seed + mesmo `deckState` → mesmo `plano`+`planId`; seeds diferentes → planId diferente; validador 0.
11. **Evidência:** log determinístico (2 execuções iguais) + N seeds com planId distinto.
12. **Aparelho real:** não. 13. **Portão:** — (segue T-A3).

### T-A3 · Máquina de estados pura
1. **ID:** T-A3. 2. **Bloco/Fase:** P3 / Fase 0.
3. **Objetivo:** `palavrinhasGameMachine.js` — 14 fases (§15), eventos/guards/efeitos; aceitar toque só em `PENSANDO`, ponto só em `TRACANDO`; comparar `iid`/id (nunca índice); anti-duplo-toque; timers/animações como **tokens de efeito** (nunca relógio interno).
4. **Arquivos novos:** `src/services/palavrinhasGameMachine.js`. 5. **Alterados:** —. 6. **Proibidos:** RN/Expo/UI.
7. **Dependências:** T-A2.
8. **Passos:** definir `FASES`/`EFEITOS`; transições puras `(estado,evento)→{estado,efeitos}`; guards por fase; derivar entrada em `RESGATANDO`/`PREPARANDO_REFORCO` por efeito; nenhuma animação libera estado crítico.
9. **Testes obrigatórios:** itens 20–34 (parte lógica: transições, guards, brilho 3/2/1, Resgate, fila, anti-duplo-toque).
10. **Aceite:** eventos fora de fase → 0 efeitos; brilho derivado puro; nenhuma dependência de tempo/UI.
11. **Evidência:** traço de estados de uma partida simulada (eventos → fases).
12. **Aparelho real:** não. 13. **Portão:** — (segue T-B1).

### T-A4 · Brilho 3/2/1 + fila de reforço (puro)
1. **ID:** T-A4. 2. **Bloco/Fase:** P7 / Fase 3.
3. **Objetivo:** derivações puras no service: `brilhoDaPalavra(erros,dicas,resgate)`→3/2/1 (§5) e gestão pura da **fila de reforço** (não-imediata, forma simplificada via `reinforcementPatterns`).
4. **Arquivos novos:** —. 5. **Alterados:** `src/services/palavrinhasGameService.js`. 6. **Proibidos:** RN/Expo/UI.
7. **Dependências:** **T-A2, T-A3** (módulo puro — **não** depende de tarefas de UI). Agendada na Fase 3/P7, mas sem acoplamento a T-B4.
8. **Passos:** função pura de brilho (teto 2 com 1 erro OU 1 dica; teto 1 com Resgate; nunca <1); fila que só reintroduz após 2–3 rodadas em forma simples.
9. **Testes obrigatórios:** itens 26–34 (parte de brilho/fila).
10. **Aceite:** tabela-verdade de brilho correta; reforço nunca imediato.
11. **Evidência:** tabela de casos (erros×dicas×resgate → brilho) + exemplo de reintrodução.
12. **Aparelho real:** não. 13. **Portão:** — .

### T-A5 · Diretor adaptativo (puro)
1. **ID:** T-A5. 2. **Bloco/Fase:** P10 / Fase 3.
3. **Objetivo:** `palavrinhasDirector.js` puro: recebe métricas da sessão → devolve **perfil de ajuste** (distratores, espaços preenchidos, prioridade de atividade, tamanho do traçado) **dentro do envelope do plano imutável**; nunca troca modo; nunca reduz tamanho de toque; aciona **Página Tranquila** com 2 Resgates.
4. **Arquivos novos:** `src/services/palavrinhasDirector.js`. 5. **Alterados:** —. 6. **Proibidos:** RN/Expo/UI; alterar identidade da palavra/atividade do plano.
7. **Dependências:** T-A4.
8. **Passos:** sinais de domínio/dificuldade (§7) → ajustes; separação estrita entre **estado determinístico do plano** e **ajuste de apresentação**.
9. **Testes obrigatórios:** itens 35–36, 30 (sobe/desce; Página Tranquila; toque nunca encolhe).
10. **Aceite:** perfil de ajuste não altera `wordId`/`activity` do plano; 2 Resgates → Página Tranquila.
11. **Evidência:** casos de domínio/dificuldade → ajustes esperados.
12. **Aparelho real:** não. 13. **Portão:** — .

---

## (b) Tarefas de INTERFACE

### T-B1 · Rotas + card + navegação (dev-gated)
1. **ID:** T-B1. 2. **Bloco/Fase:** P4 / Fase 1.
3. **Objetivo:** `ROUTES.PALAVRINHAS_DO_BENI`; branch `id==='palavrinhas' && isInternalToolsEnabled()` em `BrincarScreen` (TestingTile → navigate); `Stack.Screen` gated em `AppNavigator`.
4. **Novos:** —. 5. **Alterados:** `src/constants/routes.js`, `src/navigation/AppNavigator.js`, `src/screens/BrincarScreen.js`. 6. **Proibidos:** `App.js`; rota sem gate em produção.
7. **Dependências:** T-A3.
8. **Passos:** add rota; branch do card (idêntico ao da Ovelhinha); `{isInternalToolsEnabled() && <Stack.Screen …/>}`.
9. **Testes obrigatórios:** regex (rota presente; card branch sob gate; `<Stack.Screen>` sob `isInternalToolsEnabled()`); item 53 (rota dev-gated).
10. **Aceite:** em produção (`isInternalToolsEnabled()===false`) o card fica "Chegando"; em dev abre a tela.
11. **Evidência:** grep dos 3 pontos + print do card em dev.
12. **Aparelho real:** não. 13. **Portão:** — (segue T-B2).

### T-B2 · Tela base + Livro + seleção + página + Beni(7) + amostra COMPLETE
1. **ID:** T-B2. 2. **Bloco/Fase:** P4 / Fase 1.
3. **Objetivo:** `PalavrinhasDoBeniScreen` com abertura do Livro Mágico, seleção de dificuldade, página da palavra (imagem existente/placeholder + espaços), Beni via `BeniGuideBubble` (**7 poses existentes**), e **amostra funcional de COMPLETE** com **apenas assets existentes**.
4. **Novos:** `src/screens/PalavrinhasDoBeniScreen.js` (+ componentes de página/bandeja). 5. **Alterados:** —. 6. **Proibidos:** `require` de imagem inexistente; poses órfãs do Beni; `addBonusStars` (ainda não).
7. **Dependências:** T-B1.
8. **Passos:** SafeArea por insets + faixa do Modo Criador; consumir `consumeRound`; renderizar plano (T-A2) + máquina (T-A3); COMPLETE de amostra; placeholder digno p/ palavras sem imagem.
9. **Testes obrigatórios:** itens 47–49 (fluxo base), 55–57 (SafeArea/telas), regex (sem `addBonusStars`).
10. **Aceite:** Livro abre; seleção funciona; página mostra imagem+espaços; COMPLETE de amostra acerta/erra; nenhum asset inexistente carregado.
11. **Evidência:** **vídeo em aparelho** (abertura → seleção → página → amostra COMPLETE).
12. **Aparelho real:** **sim**. 13. **Portão que bloqueia a próxima:** **🚦 PORTÃO VISUAL 1** (primeiro momento de validação visual do jogo).

### T-B3 · COMPLETE completo
1. **ID:** T-B3. 2. **Bloco/Fase:** P6 / Fase 3. 3. **Objetivo:** COMPLETE com múltiplas lacunas conforme `missingPatterns`; opções conforme dificuldade.
4. **Novos:** —. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`. 6. **Proibidos:** reduzir área de toque; poses órfãs.
7. **Dependências:** 🚦 Visual 1 (agendada pós-Técnico).
8. **Passos:** render de lacunas/opções; validação de letra via máquina.
9. **Testes:** item 20, 23–25. 10. **Aceite:** COMPLETE jogável em todos os `missingPatterns` válidos. 11. **Evidência:** vídeo curto. 12. **Aparelho:** não (visual em T-B5). 13. **Portão:** —.

### T-B4 · MONTE + desfazer (por `iid`)
1. **ID:** T-B4. 2. **Bloco/Fase:** P6 / Fase 3. 3. **Objetivo:** MONTE (bandeja → espaços por `iid`) e **desfazer** a última instância.
4. **Novos:** —. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js` (eventos de montagem). 6. **Proibidos:** confundir instâncias por caractere.
7. **Dependências:** T-B3.
8. **Passos:** bandeja com `letterInstances`; desfazer remove a última por `iid`.
9. **Testes:** itens 21–22. 10. **Aceite:** letras repetidas não colidem; desfazer correto. 11. **Evidência:** vídeo (montar ARARA + desfazer). 12. **Aparelho:** não. 13. **Portão:** —.

### T-B5 · Erros/dicas/Resgate/reforço (UI — só 7 poses)
1. **ID:** T-B5. 2. **Bloco/Fase:** P7 / Fase 3.
3. **Objetivo:** UI dos 3 erros (§5), dicas 1–5 (§12), Resgate com participação, fila de reforço; **reações do Beni usando apenas as 7 poses já registradas** (sem órfãos).
4. **Novos:** —. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`. 6. **Proibidos:** poses órfãs (entram no T-B6); `require` inexistente; X vermelho/flash.
7. **Dependências:** T-A4.
8. **Passos:** conectar efeitos da máquina à UI; mensagens positivas; dicas reduzem brilho e não avançam.
9. **Testes:** itens 26–34. 10. **Aceite:** 3 erros → Resgate sem bloquear; reforço não-imediato; nenhuma pose órfã usada.
11. **Evidência:** **vídeo em aparelho** (3 erros → Resgate → reforço). 12. **Aparelho:** **sim**. 13. **Portão:** —.

### T-B6 · Animações + reações Beni (usa órfãos) + sons
1. **ID:** T-B6. 2. **Bloco/Fase:** P9 / Fase 3.
3. **Objetivo:** animações curtas/canceláveis (§8) com fallback sem animação; reações com as poses órfãs (**acolhimento=09; dica/reforço/Resgate=10/11; lanterna=composição de UI**); sons via `audioManager`.
4. **Novos:** util de animação reutilizável. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`. 6. **Proibidos:** arte nova de Beni; música; `App.js`.
7. **Dependências:** **T-E1** (órfãos registrados), T-C5.
8. **Passos:** aplicar poses órfãs (já registradas); halo/foco p/ lanterna; `preloadGameSfx`/`releaseGameSfx`; movimento reduzido.
9. **Testes:** itens 43–45; regex de preload/release. 10. **Aceite:** animações não bloqueiam; timers cancelados no unmount; poses corretas.
11. **Evidência:** **vídeo em aparelho** (reações + lanterna + movimento reduzido). 12. **Aparelho:** **sim**. 13. **Portão:** —.

### T-B7 · Aplicar Director + Página Tranquila (UI)
1. **ID:** T-B7. 2. **Bloco/Fase:** P10 / Fase 3. 3. **Objetivo:** consumir o perfil do Director (T-A5) na montagem da página; Página Tranquila com pose calma (`09`/`orando`).
4. **Novos:** —. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`. 6. **Proibidos:** reduzir tamanho de toque; mudar plano imutável.
7. **Dependências:** T-A5, T-B5.
8. **Passos:** aplicar ajustes de apresentação; acionar Página Tranquila em 2 Resgates.
9. **Testes:** itens 35–36, 30. 10. **Aceite:** ajuste visível sem trocar modo; toque nunca encolhe. 11. **Evidência:** vídeo (domínio↑ e dificuldade↓ + Página Tranquila). 12. **Aparelho:** **sim**. 13. **Portão:** —.

### T-B8 · Tela de resultado + rejogar/trocar
1. **ID:** T-B8. 2. **Bloco/Fase:** P11 / Fase 3. 3. **Objetivo:** resultado (independentes/dicas/Resgates/maior sequência/estrelas + mensagem positiva); jogar novamente (nova seed, deck continua) / trocar dificuldade (volta à seleção).
4. **Novos:** —. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`. 6. **Proibidos:** mensagens negativas.
7. **Dependências:** T-D2.
8. **Passos:** resumo por modo; rejogar/trocar preservando contratos.
9. **Testes:** itens 47–52. 10. **Aceite:** resultado correto por modo; rejogar gera outra sequência. 11. **Evidência:** vídeo (resultado Fácil/Médio/Difícil). 12. **Aparelho:** **sim**. 13. **Portão:** — (segue para 🚦 Visual 2 após T-F2).

---

## (c) Tarefas de TRAÇADO

### T-C1 · Auditoria de raiz (GestureHandlerRootView)
1. **ID:** T-C1. 2. **Bloco/Fase:** P5a / Fase 2. 3. **Objetivo:** reconfirmar (read-only) que `GestureHandlerRootView` está na raiz (`App.js:57`) e que `Gesture.Pan` funciona no Dev Client; **não alterar `App.js`**.
4. **Novos:** —. 5. **Alterados:** — (auditoria). 6. **Proibidos:** qualquer mudança em `App.js`.
7. **Dependências:** 🚦 Visual 1.
8. **Passos:** verificar `App.js:1` e `:57`; teste mínimo de `Gesture.Pan` no Dev Client.
9. **Testes:** N/A (verificação). 10. **Aceite:** confirmado que **nenhuma** mudança de raiz é necessária; se for, **PARAR** e voltar ao Portão 2. 11. **Evidência:** nota de auditoria + trecho de `App.js`. 12. **Aparelho:** não. 13. **Portão:** — (segue T-C2/T-C3).

### T-C2 · `tracadoService.js` (geometria pura)
1. **ID:** T-C2. 2. **Bloco/Fase:** P5 / Fase 2. 3. **Objetivo:** matemática pura: `distanciaPontoSegmento`, `distanciaPontoPolilinha`, `amostrarPorComprimento`, `checkpointsEmOrdem`, `coberturaPct`, entrada/saída do corredor com tolerância, `tracadoConcluido`.
4. **Novos:** `src/services/tracadoService.js`. 5. **Alterados:** —. 6. **Proibidos:** RN/Expo/UI; depender de fonte raster.
7. **Dependências:** T-C1.
8. **Passos:** coordenadas independentes de resolução (via camada arte↔px reutilizada); tolerância a saída momentânea.
9. **Testes:** itens 37–42 (distância, cobertura, checkpoints ordenados, incompleto, fora do corredor, reinício, tolerância).
10. **Aceite:** funções determinísticas; casos de cobertura/checkpoint/tolerância corretos.
11. **Evidência:** vetores de teste (entrada→cobertura/checkpoints). 12. **Aparelho:** não. 13. **Portão:** —.

### T-C3 · `letterPaths.js` — SOMENTE A, O, L
1. **ID:** T-C3. 2. **Bloco/Fase:** P5 / Fase 2. 3. **Objetivo:** geometria autoral (polilinhas+checkpoints, canvas de design, **independente de fonte raster**) para **A, O e L apenas**.
4. **Novos:** `src/data/letterPaths.js` (A, O, L). 5. **Alterados:** —. 6. **Proibidos:** demais letras (só pós-Técnico); acentos.
7. **Dependências:** T-C1.
8. **Passos:** definir `strokes/checkpoints/startPoint/corridor/order` p/ A/O/L.
9. **Testes:** validação estrutural de `letterPaths` (A/O/L presentes; checkpoints ordenados; sem dependência de fonte).
10. **Aceite:** exatamente 3 letras; geometria válida. 11. **Evidência:** dump das 3 letras. 12. **Aparelho:** não. 13. **Portão:** —.

### T-C4 · TraceLab (tela dev isolada) A/O/L
1. **ID:** T-C4. 2. **Bloco/Fase:** P5 / Fase 2.
3. **Objetivo:** `PalavrinhasTraceLabScreen` (dev, rota gated) desenhando o corredor com `react-native-svg <Path>` e captando o dedo com `Gesture.Pan`; validar critérios a–j (§2.1.7); **isolado, sem integração ao jogo**.
4. **Novos:** `src/screens/PalavrinhasTraceLabScreen.js`. 5. **Alterados:** `routes.js` (+`PALAVRINHAS_TRACE_LAB`), `AppNavigator.js` (+gated). 6. **Proibidos:** `App.js`; integração ao jogo; letras além de A/O/L.
7. **Dependências:** T-C2, T-C3.
8. **Passos:** SVG do corredor; `Gesture.Pan`→`pxToArt`; cobertura/checkpoints ao vivo; alternância tela pequena/grande; **movimento reduzido** (concluir por toques nos checkpoints).
9. **Testes:** matemática já coberta em T-C2; regex (rota dev-gated; sem consumo de progresso).
10. **Aceite (a–j):** coordenadas independentes de resolução; corredor tolerante; distância; cobertura por arco; checkpoints em ordem; entrada/saída; escalonamento telas pequenas; movimento reduzido; Dev Client OK; sem dependência de fonte.
11. **Evidência:** **vídeo em iPhone e Android** traçando A/O/L (com/sem movimento reduzido). 12. **Aparelho:** **sim (iPhone e Android)**. 13. **Portão que bloqueia a próxima:** **🚦 PORTÃO TÉCNICO DE TRAÇADO**.

### T-C5 · Integração do TRACE ao fluxo
1. **ID:** T-C5. 2. **Bloco/Fase:** P8 / Fase 3. 3. **Objetivo:** integrar as fases `PREPARANDO_TRACADO/TRACANDO/VALIDANDO_TRACADO` ao jogo; traçado **curto** (não a palavra inteira toda rodada).
4. **Novos:** —. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js`. 6. **Proibidos:** iniciar antes do 🚦 Técnico.
7. **Dependências:** **🚦 Técnico**, T-B5.
8. **Passos:** ligar TRACE ao brilho/fluxo; opção de palavra especial ao final.
9. **Testes:** itens 37–42 no fluxo. 10. **Aceite:** TRACE integrado ao brilho/fluxo. 11. **Evidência:** vídeo (traçado dentro de uma rodada). 12. **Aparelho:** **sim**. 13. **Portão:** —.

### T-C6 · Expansão de letras + tolerância
1. **ID:** T-C6. 2. **Bloco/Fase:** P8 / Fase 3.
3. **Objetivo:** expandir `letterPaths` além de A/O/L (vogais/traços simples → alfabeto), calibrar tolerância/corredor por dificuldade + confundíveis.
4. **Novos:** —. 5. **Alterados:** `src/data/letterPaths.js` (+letras), `src/services/tracadoService.js` (ajustes). 6. **Proibidos:** **iniciar antes do 🚦 Técnico**; acentos/Ç (bloco próprio).
7. **Dependências:** **🚦 Técnico**, T-C5.
8. **Passos:** adicionar letras progressivamente; calibrar corredor por dificuldade.
9. **Testes:** itens 41, 44–46. 10. **Aceite:** novas letras validadas; tolerância calibrada. 11. **Evidência:** vídeo de novas letras. 12. **Aparelho:** **sim**. 13. **Portão:** —.

---

## (d) Tarefas de PERSISTÊNCIA e ESTRELAS

### T-D1 · `brincarStatsService` — sub-objeto `palavrinhas` (mesma chave)
1. **ID:** T-D1. 2. **Bloco/Fase:** P11 / Fase 3.
3. **Objetivo:** estender `brincarStatsService` com `sanitizeStats` do `palavrinhas`, `applyPalavrinhasResult` (puro) e `recordPalavrinhasResult` (shell), **na mesma chave `@ptf_brincar_stats_v1`**, reusando o **teto diário compartilhado**.
4. **Novos:** —. 5. **Alterados:** `src/services/brincarStatsService.js`. 6. **Proibidos:** **criar nova chave**; `storageKeys.js`; alterar chaves existentes.
7. **Dependências:** T-A3.
8. **Passos:** sub-objeto retrocompatível (`sanitizeStats` nasce em zero); `applyPalavrinhasResult` espelha `applyOvelhaResult`; **1 estrela** autorizada por `starAwarded` respeitando `BRINCAR_DAILY_STAR_CAP`.
9. **Testes:** compatibilidade retroativa de `@ptf_brincar_stats_v1` (formato antigo tolerado); teto diário compartilhado; item 33.
10. **Aceite:** nenhuma nova chave; formato antigo migra sem perda; teto compartilhado respeitado.
11. **Evidência:** log de `sanitizeStats` sobre estado antigo → `palavrinhas` em zero; teste de teto.
12. **Aparelho:** não. 13. **Portão:** —.

### T-D2 · Estrela única gated + `refreshProgress` (UI)
1. **ID:** T-D2. 2. **Bloco/Fase:** P11 / Fase 3.
3. **Objetivo:** na tela, `if (r.starAwarded) { addBonusStars(1); refreshProgress(); }` — **exatamente um** `addBonusStars(` por rodada (fonte única).
4. **Novos:** —. 5. **Alterados:** `PalavrinhasDoBeniScreen.js`. 6. **Proibidos:** múltiplos `addBonusStars`; conceder estrela fora de `starAwarded`.
7. **Dependências:** T-D1, T-B7.
8. **Passos:** creditar só quando o serviço autoriza; `refreshProgress` para atualizar total.
9. **Testes:** regex do **único** `addBonusStars(`; item 33 (concessão única).
10. **Aceite:** exatamente 1 concessão por rodada; teto diário respeitado.
11. **Evidência:** grep (1 ocorrência) + vídeo (estrela entra 1×). 12. **Aparelho:** **sim**. 13. **Portão:** —.

---

## (e) Tarefas de ASSETS

### T-E1 · Registrar 3 poses órfãs do Beni
1. **ID:** T-E1. 2. **Bloco/Fase:** P9 / Fase 3.
3. **Objetivo:** registrar `09_beni_descansando`, `10_beni_apontando_direita`, `11_beni_apontando_esquerda` em `src/assets/mascot/beniImages.js` (**acrescenta** chaves; não altera as 7 atuais). **Único ponto** de registro de poses; **antes** do primeiro uso (T-B6).
4. **Novos:** —. 5. **Alterados:** `src/assets/mascot/beniImages.js` (commit de **assets**). 6. **Proibidos:** alterar/renomear as 7 chaves; arte nova; misturar com commit de código.
7. **Dependências:** 🚦 Visual 1 (deve preceder T-B6).
8. **Passos:** `require` dos 3 arquivos já no disco; auditoria de assets própria.
9. **Testes:** regex (`beniImages` **só acrescenta**; 7 chaves antigas intactas); nenhum `require` inexistente.
10. **Aceite:** 3 chaves novas resolvíveis; 7 antigas intactas. 11. **Evidência:** grep das 10 chaves + auditoria de peso. 12. **Aparelho:** não. 13. **Portão:** — (habilita T-B6).

### T-E2 · Produção/registro das imagens de PALAVRA + manifesto 36/36
1. **ID:** T-E2. 2. **Bloco/Fase:** P13 / Fase 4.
3. **Objetivo:** produzir/validar/registrar **30–36 imagens novas** (30 obrigatórias + 0–6 substituições reprovadas na Lista de Imagens), padrão único; **manifesto 36/36** (reutilizada/substituída/criada); habilitar `enabled=true`.
4. **Novos:** `assets/games/palavrinhas_do_beni/*`, manifesto de imagens. 5. **Alterados:** `src/data/palavrinhasWords.js` (`imageRef`/`enabled`). 6. **Proibidos:** **iniciar antes do 🚦 Visual 2 + Lista aprovada**; tocar `beniImages.js` (é do P9); `require` inexistente.
7. **Dependências:** **🚦 Visual 2 + Lista de Imagens formalmente aprovada**.
8. **Passos:** produção externa (designer); registro seletivo; manifesto por palavra; auditoria de peso/dimensão/nome/fundo.
9. **Testes:** itens 5–6 (imagens válidas; nenhum asset inexistente); auditoria de assets; manifesto cobre 36/36.
10. **Aceite:** padrão único; 30–36 novas; manifesto 36/36 completo; validador 0.
11. **Evidência:** manifesto 36/36 + auditoria de assets + print em aparelho. 12. **Aparelho:** **sim**. 13. **Portão que bloqueia a próxima:** **🚦 PORTÃO DE ASSETS**.

---

## (f) Tarefas de FERRAMENTAS INTERNAS

### T-F1 · Inspetor de palavras (gallery dev)
1. **ID:** T-F1. 2. **Bloco/Fase:** P12 / Fase 3.
3. **Objetivo:** `PalavrinhasAssetGalleryScreen` (dev, rota gated): navegar o banco, mostrar letras/`missingPatterns`/distratores/`traceTargets`/dificuldade/categoria; diagnóstico de assets/áudios/caminhos de traçado. **Não consome rodada / não salva / não concede estrela.**
4. **Novos:** `src/screens/PalavrinhasAssetGalleryScreen.js`. 5. **Alterados:** `routes.js` (+`PALAVRINHAS_ASSET_GALLERY`), `AppNavigator.js` (+gated), `PalavrinhasDoBeniScreen.js` (botão dev). 6. **Proibidos:** `consumeRound`/`addBonusStars`/escrita de progresso na gallery; produção fora do gate.
7. **Dependências:** T-A2, T-B8.
8. **Passos:** molde `OvelhaAssetGalleryScreen`; inspeção de conteúdo.
9. **Testes:** item 53; regex (sem `consumeRound`/`addBonusStars`).
10. **Aceite:** dev-gated; sem tocar progresso. 11. **Evidência:** print em dev. 12. **Aparelho:** não. 13. **Portão:** —.

### T-F2 · Simulador de sessões (dev)
1. **ID:** T-F2. 2. **Bloco/Fase:** P12 / Fase 3.
3. **Objetivo:** simulador (§19) encadeando `deckState`, com perfis de criança (alto domínio/médio/usa dicas/precisa Resgate/erros consecutivos/traçados repetidos) e resumo (repetições, cobertura, erros/dicas/Resgates/reforços, adaptações, estrelas, sequências, duração, **timers/callbacks pendentes**). **Não consome / não salva.**
4. **Novos:** —. 5. **Alterados:** `PalavrinhasAssetGalleryScreen.js`. 6. **Proibidos:** escrever progresso/estrela.
7. **Dependências:** T-F1.
8. **Passos:** perfis determinísticos por seed; tally de repetição/cobertura.
9. **Testes:** item 54; regex (não consome/não salva).
10. **Aceite:** resumo completo; determinístico. 11. **Evidência:** print da simulação (6/4/3 partidas). 12. **Aparelho:** não. 13. **Portão que bloqueia a próxima:** **🚦 PORTÃO VISUAL 2** (frame + Lista de Imagens).

---

## (g) Tarefas de REGRESSÃO

### T-G1 · Integração final (3 microatividades + imagens)
1. **ID:** T-G1. 2. **Bloco/Fase:** P14 / Fase 5.
3. **Objetivo:** fechar a integração das três microatividades + erros + Resgate + reforço + resultado + estrelas + simulador com as **imagens reais** (T-E2).
4. **Novos:** —. 5. **Alterados:** ajustes finos em telas/serviços; `scripts/smoke.js` (fechamento). 6. **Proibidos:** áreas protegidas; acentos/Ç.
7. **Dependências:** **🚦 Assets**.
8. **Passos:** integrar imagens; polir transições; fechar bloco de smoke.
9. **Testes:** suíte do jogo completa. 10. **Aceite:** jogo completo jogável com imagens reais. 11. **Evidência:** **vídeo em aparelho** (partida completa). 12. **Aparelho:** **sim**. 13. **Portão:** — (segue T-G2).

### T-G2 · Regressão (Ovelhinha + app + smoke total)
1. **ID:** T-G2. 2. **Bloco/Fase:** P14 / Fase 5.
3. **Objetivo:** garantir que **todos os checks 2.2e/2.2f da Ovelhinha permanecem verdes** e o restante do app sem regressão; smoke total verde.
4. **Novos:** —. 5. **Alterados:** `scripts/smoke.js` (se necessário). 6. **Proibidos:** alterar testes da Ovelhinha para "passar".
7. **Dependências:** T-G1.
8. **Passos:** `npm run smoke` total; `npx expo-doctor`; `npx expo install --check`; `git diff --check`; validação física final.
9. **Testes:** itens 58–60 + suíte completa.
10. **Aceite:** smoke total verde; Ovelhinha intacta; app sem regressão.
11. **Evidência:** saída do smoke (N/N) + expo-doctor 18/18 + vídeo final. 12. **Aparelho:** **sim**. 13. **Portão que bloqueia a próxima:** **🚦 PORTÃO DE INTEGRAÇÃO FINAL**.

---

## Resumo por fase e categoria

| Fase | Tarefas | Categorias |
|---|---|---|
| 0 (fundações puras) | T-A1, T-A2, T-A3 | (a) |
| 1 (tela base → 🚦 Visual 1) | T-B1, T-B2 | (b) |
| 2 (traçado protótipo → 🚦 Técnico) | T-C1, T-C2, T-C3, T-C4 | (c) |
| 3 (microatividades/mecânicas → 🚦 Visual 2) | T-B3, T-B4, T-A4, T-B5, T-C5, T-C6, T-E1, T-B6, T-A5, T-B7, T-D1, T-D2, T-B8, T-F1, T-F2 | (a)(b)(c)(d)(e)(f) |
| 4 (assets → 🚦 Assets) | T-E2 | (e) |
| 5 (integração/regressão → 🚦 Integração Final) | T-G1, T-G2 | (g) |

**Totais:** 27 tarefas · 5 portões humanos (Visual 1, Técnico, Visual 2, Assets, Integração Final). Por categoria: (a) 5 · (b) 8 · (c) 6 · (d) 2 · (e) 2 · (f) 2 · (g) 2.

---

## P4R — Tarefas da reconstrução (sem imagem) · substitui T-B2 e cancela T-E2

> **T-B2 (tela base do P4) e o protótipo `PalavrinhasDoBeniScreen.js` atual estão REPROVADOS** e não serão commitados. A tela é **reescrita** por P4R. **T-E2 (produção das 30–36 imagens de palavra) e o Portão Visual 2 / Portão de Assets ficam CANCELADOS** (não há imagem por palavra). As tarefas puras da Fase 0 (T-A1/A2/A3, commit `c906903`) **permanecem**; T-A1/A2 ganham um ajuste (banco 120 + acentos no COMPLETE).

Cada tarefa: Objetivo · Arquivos novos · Alterados · Proibidos · Dependências · Passos · Testes · Aceite · Evidência · Aparelho? · Portão.

### T-R1 · Banco 120 (40/40/40) + acentos/Ç no COMPLETE (puro)
- **Objetivo:** expandir `palavrinhasWords.js` para ≥120 palavras (spec §R.1); acentuadas/Ç passam a `enabled:true` (COMPLETE), com `letterInstances` e `normalizedWord` preservando a grafia; `imageRef` opcional/`null`.
- **Novos:** —. **Alterados:** `src/data/palavrinhasWords.js`. **Proibidos:** RN/Expo/UI/imagem/`require` de asset; `storageKeys.js`.
- **Dependências:** aprovação desta redefinição.
- **Passos:** inserir 40/40/40; cartões de acento/Ç; atributos (letras/ortografia/repetidas/encontros/categoria).
- **Testes:** P2 atualizado (120; 40/tier; acentos habilitados; instâncias; `normalizedWord`; nenhum `require`).
- **Aceite:** `validarBanco` 0; 120 palavras; acentuadas jogáveis no COMPLETE; grafia preservada.
- **Evidência:** contagens + exemplos (AEROMOÇA/CORAÇÃO instâncias e normalização). **Aparelho:** não. **Portão:** —.

### T-R2 · Dificuldade + validador (puro)
- **Objetivo:** `PALAVRINHAS_DIFFICULTIES` por letras/lacunas/opções/tempo (spec §R.2); validador cobre faixas de letras e acentos.
- **Alterados:** `src/services/palavrinhasGameService.js`. **Proibidos:** RN/Expo/UI.
- **Testes:** P2 (rodadas/lacunas por nível; determinismo mantido). **Aceite:** Fácil 3–5/1 · Médio 5–8/2–3 · Difícil 7–12/3–5; dificuldade não só por tamanho. **Aparelho:** não.

### T-R3 · Máquina — avaliar penalidade de tempo (puro)
- **Objetivo:** reusar a máquina; **decidir** se o "2º erro na mesma lacuna" precisa de efeito novo (ex.: `PENALIDADE_TEMPO`). Se sim, **volta ao artefato** (spec/máquina) antes de codar a UI.
- **Alterados:** `src/services/palavrinhasGameMachine.js` (só se aprovado). **Testes:** P3 (transições/efeitos). **Aceite:** combo/−2s como estado de sessão/UI OU efeito puro documentado. **Aparelho:** não.

### T-R4 · Tela P4R — palco da palavra + Beni-guia (UI)
- **Objetivo:** reescrever `PalavrinhasDoBeniScreen.js`: **palavra herói** (sem figura), lacunas grandes animadas, peças próximas, Beni integrado com **falas por estado** (spec §R.6), progresso; **sem linha**, **sem vazio no topo**, **compensação do banner** (spec §R.9), Safe Area, palavra sem quebra + redução progressiva.
- **Novos:** —. **Alterados:** `src/screens/PalavrinhasDoBeniScreen.js` (reescrita). **Proibidos:** imagem de palavra/`require`; `App.js`; storage/achievements/paywall; poses órfãs.
- **Dependências:** T-R1, T-R2 (T-R3 se aprovado).
- **Testes:** P4R smoke (sem imagem; sem "figura"; Beni por estado; herói; compensação do banner).
- **Aceite:** critérios 1–3, 8 do novo Portão Visual 1 (plano §14.5). **Evidência:** vídeo/print aparelho. **Aparelho:** **sim**.

### T-R5 · Acerto/erro + combo (UI)
- **Objetivo:** fluxo de acerto (letra→lacuna animada, brilho, combo++, som) e erro (balança/reshuffle/−2s/Resgate), respeitando movimento reduzido (spec §R.3/R.4).
- **Alterados:** `PalavrinhasDoBeniScreen.js`. **Testes:** P4R (combo; escalada de erro; toque instantâneo). **Aceite:** critérios 4,5,7. **Aparelho:** **sim**.

### T-R6 · Tempo reutilizando o contrato dos Pares (UI)
- **Objetivo:** implementar o timer **reusando o comportamento real dos Pares** (spec §R.5): `addTurboTime`/`segundosRestantes`/`TURBO_*`, `countdown_tick`/`time_up_alarm`, moldura vermelha de 4 faixas nas bordas externas, pulso (gate de movimento reduzido), +5s/palavra, −2s no 2º erro, limpeza de som (pausa/fim/unmount).
- **Novos:** —. **Alterados:** `PalavrinhasDoBeniScreen.js`. **Reuso:** `paresGameService.js`, `PARES_SOUND_EVENTS`, padrão `MolduraAlerta`. **Proibidos:** duplicar/alterar o serviço dos Pares.
- **Testes:** P4R (tempo/−2s/+5s; alerta; som para no unmount/pausa; reduce-motion). **Aceite:** critério 6. **Aparelho:** **sim (iPhone + Android)**.

### T-R7 · Tela final rica (UI)
- **Objetivo:** tela final (spec §R.8): Beni contextual + páginas + melhor combo + brilhos + tempo bônus + **4 botões** (Jogar de novo/Trocar dificuldade/Voltar ao Brincar/Voltar ao Início) + mensagem de participação quando o tempo acaba antes da 1ª palavra.
- **Alterados:** `PalavrinhasDoBeniScreen.js`. **Testes:** P4R (4 botões; sem "3 zeros"). **Aceite:** critério 9. **Aparelho:** **sim**.

### T-R8 · Smoke P4R (substitui P4/P4-rev)
- **Objetivo:** bloco P4R no `scripts/smoke.js` cobrindo os itens do novo Portão Visual 1; remover/atualizar os checks P4/P4-rev que assumiam imagem (**sem** reduzir cobertura real).
- **Alterados:** `scripts/smoke.js`. **Aceite:** smoke verde; nenhum check enfraquecido; P5 não iniciado. **Aparelho:** não. **Portão:** **🚦 PORTÃO VISUAL 1 (novo)** após T-R4…T-R8.

> **Cancelados:** T-E2 (imagens de palavra), 🚦 Portão Visual 2, 🚦 Portão de Assets, manifesto/Lista de Imagens. O wire das poses órfãs do Beni (T-E1/P9) segue, sem depender de imagem de palavra.

---

## P4R3 — tarefas de código (não commitadas)

T-R3.1 BeniStageCharacter (novo) · T-R3.2 registro das poses órfãs + fallback · T-R3.3 serviço (modos distintos + poderes + Diretor por combo de palavras) · T-R3.4 tela (combos separados, Magia do Livro, Baú+poderes, Palavra Relâmpago, página virando, tela final por modo) · T-R3.5 smoke P2R/P4R3. Portão Visual 1 pendente. Sem commit.

---

## P4R4 — tarefas de código (não commitadas)

T-R4.1 serviço: identidade dos modos (Magia/Baú só na Corrida; Baú após 5, 1/partida; Turbo sem relâmpago) + `poderElegivel` puro · T-R4.2 `BeniStageCharacter` portrait/event com moldura · T-R4.3 tela: áreas reservadas + Beni fora da palavra + Turbo sem preview + HUD/tema/final por modo + consumo/indicador de poderes · T-R4.4 smoke P2R/P4R4. Portão Visual 1 pendente. Sem commit.

---

## P4R5 — tarefas de código (não commitadas)

T-R5.1 `BeniStageCharacter` receita provada (Image RN, require estático, width/height explícitos, onLoad/onError, fallback) + grade de diagnóstico dev · T-R5.2 finalização atômica (`finalizarPalavra` conclui antes dos efeitos; combo do núcleo; Magia após conclusão) · T-R5.3 efeitos dos poderes + acerto/erro/palavra completa + Brilho Triplo · T-R5.4 mapa de sons único + destaques locais + memoização dos slots · T-R5.5 smoke P4R5. Portão Visual 1 pendente. Sem commit.

---

## P4R6 — tarefas de código (não commitadas)

T-R6.1 diretor visual PURO (poses por apresentação, presets, prioridade, permanências, mapeadores) · T-R6.2 `BeniStageCharacter` guarda portrait + presets · T-R6.3 coreografia (token, evento único do marco, última letra, limpeza) · T-R6.4 overlays Super Beni/Brilho Triplo + hierarquia sonora · T-R6.5 correção da navegação (rota aninhada Brincar) · T-R6.6 smoke P4R6d/P4R6. Portão Visual 1 pendente. Sem commit.

---

## P4R7 — tarefas de código (não commitadas)

T-R7.1 auditoria real dos 11 arquivos (sharp) + presets cover/overscan · T-R7.2 `BeniStageCharacter` cover + load-gated crossfade + fallback · T-R7.3 preload/ready (warmer, POSES_MINIMAS, Abrir o Livro gated) · T-R7.4 máquina `TEMPO_ESGOTADO` + relógio deadline + esgotarTempo autoritativo + AppState · T-R7.5 `palavrinhasPoderes.js` (8) + Bolso Mágico manual + elegibilidade/consumo · T-R7.6 overlays reconstruídos + partículas determinísticas + sons · T-R7.7 laboratório DEV · T-R7.8 smoke P4R7m/p + P4R7. Portão Visual 1 pendente. Sem commit.

---

## P4R8 — tarefas de código (não commitadas)

T-R8.1 `beniAssetWarmup` singleton + warmup na BrincarScreen + `PalavrinhasBeniWarmer` · T-R8.2 `BeniStageCharacter` cache compartilhado/onLoadEnd · T-R8.3 modos infinitos (config) + encerramento manual + motivo do fim · T-R8.4 Baú a cada 4 + múltiplos + pendente com inventário cheio · T-R8.5 `PalavrinhasPowerDock` (barra inferior) + `PalavrinhasPowerEffect` (FSM, consumo no impact) + `PalavrinhasHud`/`PalavrinhasChest` · T-R8.6 prioridade de eventos com BAU + Novo capítulo · T-R8.7 smoke P4R8. Portão Visual 1 pendente. Sem commit.

---

## P4R9 — tarefas de código (não commitadas)

T-R9.1 warmup por tamanho + warmer 2 Images · T-R9.2 `BeniStageCharacter` placeholder + guarda mesma-source · T-R9.3 pose portrait estável por palavra (RNG) · T-R9.4 BrincarScreen navegação imediata · T-R9.5 `avaliarUsoDoPoder` + `PalavrinhasPowerDetailsPanel` + Vento corrigido + timeout · T-R9.6 botão Encerrar + modal + Triplo compacto + Super 1ª-vez + 1º Baú automático/seguintes manuais · T-R9.7 smoke P4R9/P4R9p. Portão Visual 1 pendente. Sem commit.

---

## P4R9a — dica do poder (faixa larga) + auditoria (Portão Visual 1 pendente)

Causa: dica dentro do slot (≈56px) absoluta só com right → largura limitada pelo slot. Correção mínima: `coachBand` LARGA acima do dock (left/right, ≤2 linhas, pointerEvents none, ícone), texto "Poder guardado! Toque nele quando quiser usar.", onboarding único 3,8s, some ao tocar/painel, não durante eventos, reinicia na partida, mov. reduzido só fade. Cabeçalho truncado = recomendação P1 (não alterado). Teste P4R9a; smoke 2135/2135. Sem commit. Auditoria final registrada no relatório (não implementada).

---

## P4.1 — cabeçalho responsivo + pausa pedagógica (novo Portão Visual pendente)

Ver `spec-palavrinhas.md` §R4.1. Título compacto "Palavrinhas" só em partida ativa com controles (senão "Palavrinhas do Beni"). Pausa pedagógica a cada 16 palavras só nos modos infinitos (`devePausarBloco` puro), entre palavras; congela o deadline (pausaPedagoRef), Continuar monta a próxima palavra sem perder tempo, Encerrar reusa o fluxo oficial SEM alarme; TEMPO_ESGOTADO prioritário; reinicia na partida. Testes P4.1 (puro + tela); smoke 2138/2138; gates verdes. Sem commit; sobre 9bcdcf5.
