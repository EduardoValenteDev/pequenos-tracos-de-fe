# Palavrinhas do Beni — Plano de Implementação (Etapa SDD 4)

> **Feature:** `009-palavrinhas-do-beni` · **Etapa SDD:** 4 (Plan) · **🚦 Portão 2 (plano): PENDENTE.**
> **Base:** `content-integrate-coloring-3` @ `e1cffdd` (working tree limpo; spec `spec-palavrinhas.md` com Portão 1 **aprovado**, §2.1).
> **Escopo desta etapa:** planejar a execução granular, com portões humanos. **Nenhum código, asset, build, `git add`/commit/push.** HEAD permanece `e1cffdd`.
> **Precedência:** `docs/PROJECT_SOURCE_OF_TRUTH.md` → Constituição → `AGENTS.md` → esta spec/plano. Áreas protegidas (achievements, chave de storage nova, assets, paywall) só mudam com aprovação explícita.

---

## 1. Objetivo do plano

Traduzir a spec aprovada em **blocos pequenos, validáveis e atômicos** (1 bloco = 1 commit), com **5 portões humanos obrigatórios** e um forte isolamento entre **lógica pura** (sem RN/Expo/UI) e **camadas de interface/infra**. O maior risco (traçado) é atacado como **protótipo técnico isolado** antes de qualquer integração ao jogo.

## 2. Constitution Check (aderência)

- **Arquitetura atual respeitada:** `src/services` (lógica/dados puros), `src/screens` (UI), `src/data` (conteúdo), `src/context` (fonte única de progresso). Estende-se o que existe (Brincar/stats/daily/stars/Beni/tema) antes de criar paralelo.
- **Sem alterações destrutivas** sem aprovação; nada de apagar/mover/renomear chaves ou assets existentes.
- **Áreas sensíveis** (paywall, progresso, conquistas, `accessControl`, manifests, storageKeys novos, assets) intocadas na implementação principal.
- **100% JavaScript**; sem TypeScript novo; sem `tsconfig`.
- **Sem dependências novas** (todas as libs necessárias já existem: `react-native-svg`, `react-native-gesture-handler`, `expo-audio`, `expo-haptics`).
- **Performance:** memo/useMemo/useCallback situacionais; sem recriar estilos/handlers em caminho quente do traçado; listas com chaves estáveis.
- **Git seletivo**; sem `git add .`; um bloco lógico = um commit; assets em commits próprios com auditoria.

## 3. Regra arquitetural inviolável — módulos puros

Os módulos abaixo **NÃO podem importar** `react-native`, `expo*`, nem qualquer API de interface/tempo real (`Date.now`/`Math.random` diretos ficam na borda; a lógica recebe `rng`/relógio injetados):

| Módulo puro | Responsabilidade |
|---|---|
| `src/data/palavrinhasWords.js` | banco de palavras (dados literais) |
| `src/services/palavrinhasGameService.js` | validador do banco, baralho, seed, `planPartida`, `planId` |
| `src/services/palavrinhasGameMachine.js` | máquina de estados `(estado,evento)→{estado,efeitos}` |
| `src/services/palavrinhasDirector.js` | Diretor de dificuldade adaptativa (puro) |
| `src/services/tracadoService.js` | geometria do traçado (distância, cobertura, checkpoints) |
| `src/data/letterPaths.js` | geometria autoral das letras (polilinhas + checkpoints), **independente de fonte raster** |

Esses módulos são **testáveis no smoke** via `new Function` (imports removidos por regex — logo, **zero** dependência de runtime). As telas (`src/screens/*`) fazem a ponte com RN/SVG/gestos/áudio.

> **Decisão de reuso de coordenadas (Analyze I2).** A camada resolução-independente `computeViewport/contentRect/artToPx/pxToArt` **existe em `ovelhaGameService.js`** (puro). Para **não** forçar o eval do smoke a inlinar o serviço da Ovelhinha, `tracadoService.js` deve ser **autossuficiente**: ou (a) conter sua própria função de mapeo arte↔px, ou (b) essas funções serem extraídas para um módulo puro compartilhado **`src/services/geo2d.js`** (sem RN/Expo), consumido tanto pela Ovelhinha quanto pelo traçado. **Recomendação:** (a) para o protótipo (P5, autossuficiente e mínimo); avaliar (b) só se houver duplicação relevante na expansão (P8). **Proibido** `tracadoService` importar de `ovelhaGameService`.

## 4. Risco de raiz — `GestureHandlerRootView` (AUDITADO → mitigado)

> **Auditoria de raiz já executada (read-only):** `App.js:1` importa `react-native-gesture-handler` como **primeira** importação; `App.js:57` envolve **toda** a árvore em `<GestureHandlerRootView style={{flex:1}}>`. **Conclusão: nenhuma mudança de raiz é necessária.** O risco "registrar o RootView" está **de fato mitigado**.

Consequência para o plano: o traçado usa `Gesture.Pan` **sem** tocar `App.js`. Mesmo assim, o **Bloco P5a (Auditoria de raiz)** é mantido como **passo formal obrigatório antes de qualquer código de gesto**, para reconfirmar (a) que o RootView continua na raiz, (b) que nenhuma outra mudança de raiz é exigida, (c) que `Gesture.Pan` funciona no Dev Client atual. Qualquer necessidade de mudança de raiz **volta ao Portão 2** antes de prosseguir.

## 5. Mapa de arquivos (novo vs. estendido)

**Novos (lógica pura):** `palavrinhasWords.js`, `palavrinhasGameService.js`, `palavrinhasGameMachine.js`, `palavrinhasDirector.js`, `tracadoService.js`, `letterPaths.js`.
**Novos (UI dev/jogo):** `src/screens/PalavrinhasDoBeniScreen.js`, `src/screens/PalavrinhasTraceLabScreen.js` (protótipo dev), `src/screens/PalavrinhasAssetGalleryScreen.js` (dev).
**Estendidos (mínimo, cirúrgico):** `src/constants/routes.js` (+rotas), `src/navigation/AppNavigator.js` (+Stack.Screen gated), `src/screens/BrincarScreen.js` (branch `id==='palavrinhas'`), `src/services/brincarStatsService.js` (+sub-objeto `palavrinhas` + `applyPalavrinhasResult`/`recordPalavrinhasResult`, **mesma chave** `@ptf_brincar_stats_v1`), `scripts/smoke.js` (+bloco de testes).
**Estendido (assets, blocos próprios e SEPARADOS):** `src/assets/mascot/beniImages.js` (registrar órfãos `09/10/11` — **acrescenta** chaves, não altera as 7 atuais) → **feito no P9**; `assets/games/palavrinhas_do_beni/` (imagens de palavra) → **feito no P13**. Os dois nunca se misturam: poses do Beni = P9; imagens de palavra = P13.
**Nunca tocados na v1:** `storageKeys.js` (chave nova de domínio), `src/data/achievements.js`, `accessControl`, paywall, `App.js`.

---

## 6. Sequência de blocos e portões

Ordem determinística. Cada bloco só começa quando o anterior fechou seus gates; cada **🚦 portão humano** exige aprovação explícita do Eduardo (validação visual/física quando indicado) antes de seguir.

```
FASE 0 · Fundações puras (sem UI)
  P1  Spec + contrato de dados ................ (CONCLUÍDO no Portão 1)
  P2  Banco + validador + baralho/seed/plano (puro)
  P3  Máquina de estados (pura)

FASE 1 · Tela base
  P4  Rota+card+Livro+seleção+página+Beni+amostra COMPLETE (assets existentes)
  🚦 PORTÃO VISUAL 1  (aparelho real)

FASE 2 · Traçado — protótipo técnico isolado
  P5a Auditoria de raiz (GestureHandlerRootView) — sem mudança de código
  P5  Protótipo isolado de traçado A/O/L (tracadoService puro + TraceLab dev)
  🚦 PORTÃO TÉCNICO DE TRAÇADO  (aparelho real; critérios a–j)

FASE 3 · Microatividades + mecânicas
  P6  COMPLETE completo + MONTE + desfazer (por iid)
  P7  Erros (1/2/3) + brilhos + dicas + Resgate + fila de reforço
  P8  Integração do traçado ao jogo + expansão de letras + tolerância
  P9  Animações + Beni (wire órfãos) + sons reutilizáveis
  P10 Diretor adaptativo + Página Tranquila
  P11 Resultado + estrelas (fonte única) + rejogabilidade
  P12 Modo Criador: inspetor de palavras + simulador
  🚦 PORTÃO VISUAL 2  (aparelho real; valida o FRAME + produz a LISTA DE IMAGENS; antes de comissionar arte)

FASE 4 · Assets (só imagens de PALAVRA; poses do Beni já foram no P9)
  P13 Produção/validação/registro das 30–36 imagens de palavra + manifesto 36/36
  🚦 PORTÃO DE ASSETS  (padrão/dimensões/nomes/fundo/consistência/registro/manifesto)

FASE 5 · Integração final
  P14 Integração final + regressão (Ovelhinha + app)
  🚦 PORTÃO DE INTEGRAÇÃO FINAL  (aparelho real; smoke total verde; regressão intacta)
```

---

## 7. Detalhe dos blocos

> Cada bloco: **Escopo · Fora de escopo · Arquivos · Aceite · Testes · Gates · Validação manual · Riscos · Dependências · Condições para commit.** "Gates" = `npm run smoke` verde **e** `npx expo-doctor` verde (+`npx expo install --check`, `git diff --check`) salvo indicação. Commit sempre **seletivo**, um bloco = um commit; **sem push** sem autorização.

### P1 — Spec + contrato de dados *(concluído)*
- **Escopo:** esta especificação + contrato de dados (§10 da spec). **Fora:** runtime. **Arquivos:** `specs/009-…/spec-palavrinhas.md`, `plan-palavrinhas.md`. **Aceite:** Portão 1 aprovado (feito). **Commit:** doc de governança isolado (quando autorizado).

### P2 — Banco + validador + baralho/seed/plano (puro)
- **Escopo:** `palavrinhasWords.js` (36 palavras, §10.2, `enabled=false` p/ acentos/Ç), estrutura de dados (§10.1, `letterInstances` por ocorrência), `palavrinhasGameService.js` puro: `validarBanco` (ids únicos, palavra↔dificuldade, categorias, `imageRef` só existente, letras repetidas por `iid`, distratores/`missingPatterns`/`traceTargets` válidos, sem asset inexistente), primitivas de baralho **copiadas verbatim** da Ovelhinha (`criarRng`, `novaSeed`, `shuffle`, `criarDeckState`, `clonarDeckState`, `assinaturaDeck`, `planId`), montadores de palavras e `planPartida({rng,dificuldade,words,rounds,deckState})→{plano,deckState,planId}`.
- **Fora:** UI, máquina, traçado, imagens novas, acentos ativos.
- **Arquivos:** `src/data/palavrinhasWords.js`, `src/services/palavrinhasGameService.js`.
- **Aceite:** `validarBanco` 0 problemas; determinismo (mesma seed+deck → mesmo plano+planId); alternância de categoria/atividade/`missingPattern`; sem repetição prematura; nenhum item aponta asset inexistente; letras repetidas expandidas por `iid`.
- **Testes (smoke):** itens 1–19 (§21). Eval via `new Function` (módulo 100% puro).
- **Gates:** smoke + expo-doctor verdes.
- **Validação manual:** N/A (lógica pura) — relatório com contagens.
- **Riscos:** modelar `letterInstances`/acentos de forma que a normalização não apague o glifo visual.
- **Dependências:** P1.
- **Commit:** dados + serviço puro (sem UI).

### P3 — Máquina de estados (pura)
- **Escopo:** `palavrinhasGameMachine.js` com as 14 fases (§15), eventos/guards/efeitos, aceitar toque só em `PENSANDO`, ponto só em `TRACANDO`, comparar `iid`/id (nunca índice), anti-duplo-toque, timers como *tokens de efeito* (não relógio interno).
- **Fora:** UI, agendamento real de timers (fica na tela), traçado geométrico.
- **Arquivos:** `src/services/palavrinhasGameMachine.js`.
- **Aceite:** transições corretas; eventos fora de fase retornam 0 efeitos; brilho 3/2/1 derivado puro; entrada em Resgate/reforço via efeito; nenhuma dependência de tempo/UI.
- **Testes (smoke):** itens 20–34 (parte lógica).
- **Gates:** smoke + expo-doctor.
- **Riscos:** manter a máquina agnóstica de traçado (recebe `TRACADO_OK` como evento).
- **Dependências:** P2.
- **Commit:** máquina pura.

### P4 — Tela base + Livro + seleção + página + Beni + amostra COMPLETE
- **Escopo:** rota dev-gated (`ROUTES.PALAVRINHAS_DO_BENI`), branch `id==='palavrinhas' && isInternalToolsEnabled()` em `BrincarScreen` (TestingTile), `PalavrinhasDoBeniScreen`: abertura do Livro Mágico (animação simples), **seleção de dificuldade**, **página da palavra** (imagem via asset existente/placeholder + espaços), Beni via `BeniGuideBubble` (poses existentes), e uma **amostra funcional de COMPLETE** (tocar a letra que falta) usando **apenas assets existentes** (as 6 imagens de avatar + placeholder neutro para as demais).
- **Fora:** MONTE, traçado, Resgate/reforço completos, dicas avançadas, imagens novas, adaptativo, resultado final, simulador.
- **Arquivos:** `src/constants/routes.js`, `src/navigation/AppNavigator.js`, `src/screens/PalavrinhasDoBeniScreen.js`, `src/screens/BrincarScreen.js`, (texto Beni em `src/data/` reutilizando padrão `beniLines`).
- **Aceite:** card "Em teste" abre a tela só em dev; Livro abre; seleção funciona; página mostra imagem+espaços; COMPLETE de amostra acerta/erra visivelmente; SafeArea + faixa do Modo Criador respeitadas; nenhum asset inexistente carregado (placeholder para palavras sem imagem).
- **Testes (smoke):** 47–49 (fluxo base), 55–57 (SafeArea/telas), regex de rota/card/gate; consumo de rodada via `consumeRound` presente; **sem** `addBonusStars` ainda.
- **Gates:** smoke + expo-doctor.
- **Validação manual (🚦):** **Portão Visual 1** — Eduardo valida em **aparelho real** (Dev Client): estética do Livro/seleção/página/Beni + amostra COMPLETE, respiro visual, toque confortável.
- **Riscos:** o **placeholder de imagem deve apontar para um asset JÁ EXISTENTE** (nunca `require` inexistente) — ex.: reusar um asset neutro do app (uma das 6 avatares, como `assets/avatar/avatar_star.png`, ou uma pose do Beni) como "carta"/página provisória, com rótulo textual da palavra; **nenhuma palavra pode exigir imagem inexistente antes do P13** (Analyze I3). Reuso das 6 avatares pode não combinar (decisão fica para Portão Visual 2/Assets).
- **Dependências:** P2, P3.
- **Commit:** UI base (código; sem assets novos).

> ### 🚦 PORTÃO VISUAL 1 — após P4
> Aprovação humana em aparelho real da **tela base + Livro Mágico + seleção + página da palavra + Beni + amostra de COMPLETE**, usando **apenas assets existentes**. Sem aprovação, não se avança à Fase 2.

### P5a — Auditoria de raiz (GestureHandlerRootView)
- **Escopo:** reconfirmar (read-only) que `GestureHandlerRootView` está na raiz (`App.js:57`) e que `Gesture.Pan` funciona no Dev Client; **não** alterar `App.js`. Registrar o resultado no plano/relatório.
- **Fora:** qualquer mudança de código de raiz.
- **Arquivos:** nenhum (auditoria).
- **Aceite:** confirmação de que **nenhuma** mudança de raiz é necessária. Se (improvável) for, **PARAR** e voltar ao Portão 2.
- **Dependências:** Portão Visual 1.
- **Commit:** nenhum (etapa de verificação).

### P5 — Protótipo técnico isolado de traçado (A, O, L)
- **Escopo:** `tracadoService.js` puro (`distanciaPontoSegmento`, `distanciaPontoPolilinha`, `amostrarPorComprimento`, `checkpointsEmOrdem`, `coberturaPct`, `tracadoConcluido`, entrada/saída do corredor com tolerância); `letterPaths.js` com **A, O, L** (polilinhas+checkpoints, canvas de design, **independente de fonte raster**); tela **dev-only** `PalavrinhasTraceLabScreen` (rota gated) desenhando o corredor com `react-native-svg <Path>` e captando o dedo com `Gesture.Pan`; alternância tela pequena/grande e **movimento reduzido** (concluir por toques nos checkpoints).
- **Fora:** integração ao jogo; demais letras; acentos; qualquer mudança na tela principal.
- **Arquivos:** `src/services/tracadoService.js`, `src/data/letterPaths.js`, `src/screens/PalavrinhasTraceLabScreen.js`, `src/constants/routes.js` (+`PALAVRINHAS_TRACE_LAB`), `src/navigation/AppNavigator.js` (+Stack.Screen gated).
- **Aceite (critérios a–j da spec §2.1.7):** (a) coordenadas independentes de resolução (via camada `computeViewport/contentRect/artToPx/pxToArt`); (b) corredor tolerante; (c) distância toque→polilinha; (d) cobertura por amostragem de arco; (e) checkpoints em ordem; (f) entrada/saída do corredor; (g) escalonamento telas pequenas; (h) movimento reduzido; (i) comportamento no Dev Client; (j) geometria sem depender de fonte raster.
- **Testes (smoke):** matemática pura de `tracadoService` (distância, cobertura, checkpoints ordenados, tolerância, incompleto/fora do corredor, reinício) — itens 37–42.
- **Gates:** smoke + expo-doctor.
- **Validação manual (🚦):** **Portão Técnico de Traçado** — Eduardo testa A/O/L em **aparelho real** (Dev Client), confirmando os 10 critérios.
- **Riscos:** 1º arrasto contínuo do app; precisão em tela pequena; suavidade do `Gesture.Pan`; throttling de `onUpdate`.
- **Dependências:** P5a.
- **Commit:** protótipo (código puro + tela dev), **isolado**.

> ### 🚦 PORTÃO TÉCNICO DE TRAÇADO — após P5
> Protótipo A/O/L aprovado em **aparelho real**. Só então a **expansão de letras** e a **integração** ao jogo são liberadas.

### P6 — COMPLETE completo + MONTE + desfazer
- **Escopo:** COMPLETE completo (múltiplas lacunas conforme `missingPatterns`), MONTE (montar da bandeja por `iid`), **desfazer** a última letra; bandeja com letras repetidas por instância.
- **Fora:** traçado no fluxo (vem em P8), Resgate, adaptativo, resultado.
- **Arquivos:** `PalavrinhasDoBeniScreen.js` (+ componentes de bandeja/espaços), possivelmente `palavrinhasGameMachine.js` (ajustes de eventos de montagem).
- **Aceite:** COMPLETE e MONTE jogáveis; desfazer remove a última instância corretamente; letras repetidas não colidem.
- **Testes:** 20–22.
- **Gates:** smoke + expo-doctor.
- **Validação manual:** print/vídeo (montagem + desfazer).
- **Dependências:** Portão Técnico? Não — P6 independe do traçado; depende de P4. (Pode correr em paralelo conceitual ao P5, mas por ordem única segue após o Portão Técnico.)
- **Commit:** atividades de montagem.

### P7 — Erros, brilhos, dicas, Resgate, reforço
- **Escopo:** 1º/2º/3º erro (§5), brilho 3/2/1, dicas graduais 1–5 (§12, reduzem brilho, não pontuam/avançam, canceladas por rodada), **Resgate** com participação, **fila de reforço** (retorno não-imediato, forma simplificada).
- **Fora:** adaptativo (Diretor), Página Tranquila (P10), resultado; **poses órfãs do Beni** (acolhimento `09`, Resgate `10/11`, lanterna) — entram no **P9**.
- **Reações do Beni neste bloco:** usar **somente as 7 poses já registradas** (`BeniGuideBubble`/`BeniAvatar`), ex.: `ensinando`/`orando` para acolhimento e `ensinando` para o Resgate. **Nenhum uso de pose órfã aqui** — assim P7 não depende de nenhuma alteração de `beniImages.js` (o registro dos órfãos é feito e usado no P9).
- **Arquivos:** `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js`, `palavrinhasGameService.js` (derivação de brilho/fila, puro).
- **Aceite:** sequência de erros conduz ao Resgate sem bloquear; mensagens positivas; reforço reaparece após 2–3 rodadas simplificado; dicas com teto de brilho.
- **Testes:** 26–34.
- **Gates:** smoke + expo-doctor.
- **Validação manual:** vídeo dos 3 erros → Resgate → reforço.
- **Dependências:** P6.
- **Commit:** erros/brilhos/dicas/Resgate/reforço.

### P8 — Integração do traçado + expansão de letras + tolerância
- **Escopo:** integrar TRACE ao fluxo (fase `PREPARANDO_TRACADO`/`TRACANDO`/`VALIDANDO_TRACADO`), **expandir letras** (pós-portão técnico: vogais/traços simples restantes → alfabeto), calibrar tolerância/corredor por dificuldade; traçado **curto** (não a palavra inteira toda rodada) + opção de palavra especial ao final.
- **Fora:** acentos/Ç (bloco próprio), adaptativo.
- **Arquivos:** `letterPaths.js` (+letras), `tracadoService.js` (ajustes), `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js`.
- **Aceite:** TRACE integrado ao brilho/fluxo; letras adicionais validadas; movimento reduzido no jogo.
- **Testes:** 37–42, 44–46.
- **Gates:** smoke + expo-doctor.
- **Validação manual:** aparelho — traçado no fluxo real.
- **Dependências:** Portão Técnico de Traçado, P7.
- **Commit:** integração+expansão do traçado.

### P9 — Animações + Beni (registro + uso dos órfãos) + sons
> **Registro das poses do Beni — ÚNICO ponto (correção documental).** As 3 poses órfãs já existem no disco e **não dependem** da produção das imagens das palavras. O registro em `beniImages.js` acontece **aqui, no P9**, imediatamente **antes** do primeiro uso (mesmo bloco → sem dependência cruzada). **P4/P6/P7 não usam poses órfãs** (só as 7 existentes), e **P13 não tem nenhuma responsabilidade sobre poses do Beni.**
- **Escopo:** (i) **sub-passo de assets (commit próprio):** registrar os órfãos `09_beni_descansando`, `10_beni_apontando_direita`, `11_beni_apontando_esquerda` em `src/assets/mascot/beniImages.js` (**acrescenta** chaves; não altera as 7 atuais; auditoria de assets própria); (ii) **sub-passo de código:** animações curtas/canceláveis (§8) com fallback sem animação; Beni por reação (acolhimento=`09`; dica/reforço/Resgate=`10`/`11`; **lanterna do Resgate = composição de UI** — halo/foco/microanimação em volta da pose "apontando"); sons via `audioManager` (§9). A ordem interna é **assets → código** (registro antes do uso).
- **Fora:** **arte nova do Beni (não existe na v1)**; imagens de palavra (P13); música.
- **Arquivos:** `src/assets/mascot/beniImages.js` (+3 chaves — commit de assets), `PalavrinhasDoBeniScreen.js`, util de animação reutilizável.
- **Aceite:** as 3 chaves órfãs registradas e resolvíveis; animações não bloqueiam; timers cancelados no unmount; movimento reduzido; sons mapeados; poses corretas por reação; nenhuma arte nova do Beni; `beniImages` **só acrescenta** (7 chaves antigas intactas).
- **Testes:** 43–45; regex de `preloadGameSfx`/`releaseGameSfx`; `beniImages` só acrescenta chaves (as 7 antigas permanecem).
- **Gates:** smoke + expo-doctor; auditoria de assets para o commit dos órfãos.
- **Validação manual:** aparelho (animações + reações do Beni).
- **Riscos:** o **wire de assets** toca área de assets → **commit separado** com auditoria (não misturar com código).
- **Dependências:** P8.
- **Commit(s):** (a) **commit de assets** para registrar os 3 órfãos em `beniImages.js`; (b) commit de código de animação/som/reações. (a) precede (b).

### P10 — Diretor adaptativo + Página Tranquila
- **Escopo:** `palavrinhasDirector.js` puro (sinais de domínio/dificuldade → perfil de ajuste dentro do envelope do plano), aplicação no momento de montar a página, **Página Tranquila** em 2 Resgates; **nunca** reduzir tamanho de botão/letra.
- **Fora:** persistência de domínio (adiada).
- **Arquivos:** `src/services/palavrinhasDirector.js`, `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js`.
- **Aceite:** sobe/desce sem trocar modo; toque nunca encolhe; Página Tranquila com pose calma.
- **Testes:** 35–36, 30.
- **Gates:** smoke + expo-doctor.
- **Validação manual:** simular domínio/dificuldade (via Modo Criador quando existir; senão vídeo).
- **Dependências:** P7, P8.
- **Commit:** Diretor + Página Tranquila.

### P11 — Resultado + estrelas + rejogabilidade
- **Escopo:** tela de resultado (resumo: independentes/dicas/Resgates/maior sequência/estrelas), **estrela única** `addBonusStars(1)` gated em `starAwarded`, integração em `brincarStatsService` (sub-objeto `palavrinhas` + `applyPalavrinhasResult`/`recordPalavrinhasResult`, **mesma chave** `@ptf_brincar_stats_v1`, teto diário compartilhado), `refreshProgress()`; jogar novamente (nova seed, deck continua) / trocar dificuldade.
- **Fora:** conquistas (adiadas), persistência de domínio.
- **Arquivos:** `PalavrinhasDoBeniScreen.js`, `src/services/brincarStatsService.js`.
- **Aceite:** exatamente **um** `addBonusStars(` na tela; teto diário respeitado; `sanitizeStats` retrocompatível; resultado correto por modo; rejogar/trocar corretos.
- **Testes:** 47–52, 33; regex do único `addBonusStars`.
- **Gates:** smoke + expo-doctor.
- **Validação manual:** aparelho (resultado + estrela + rejogar).
- **Riscos:** replicar exatamente o contrato `if (r.starAwarded) { addBonusStars(1); refreshProgress(); }` (senão smoke falha).
- **Dependências:** P7, P10.
- **Commit:** resultado + estrelas (código; `brincarStatsService` mesma chave).

### P12 — Modo Criador: inspetor + simulador
- **Escopo:** `PalavrinhasAssetGalleryScreen` (dev, rota gated): **inspetor de palavras** (navegar banco, mostrar letras/`missingPatterns`/distratores/`traceTargets`/dificuldade/categoria), diagnóstico de assets/áudios/caminhos de traçado, e **simulador de sessões** (§19) encadeando `deckState`, com perfis de criança e resumo (repetições, cobertura, erros/dicas/Resgates/reforços, timers/callbacks pendentes). Contrato **não consome rodada / não salva progresso / não concede estrela**.
- **Fora:** produção; qualquer escrita de progresso.
- **Arquivos:** `src/screens/PalavrinhasAssetGalleryScreen.js`, `routes.js` (+`PALAVRINHAS_ASSET_GALLERY`), `AppNavigator.js` (+gated), `PalavrinhasDoBeniScreen.js` (botão dev).
- **Aceite:** inspetor+simulador funcionam sem tocar progresso; dev-gated.
- **Testes:** 53–54; regex (sem `consumeRound`/`addBonusStars` na gallery).
- **Gates:** smoke + expo-doctor.
- **Validação manual:** aparelho (dev).
- **Dependências:** P11.
- **Commit:** ferramentas de Modo Criador.

> ### 🚦 PORTÃO VISUAL 2 — após P12, ANTES de comissionar as imagens
> Com as **três microatividades + erros + Resgate + reforço + resultado + simulador** funcionando (usando as 6 imagens existentes + placeholders), Eduardo valida em **aparelho real** o **frame visual/UX** que conterá as imagens e **aprova o padrão visual único** a ser seguido pela arte.
> **Entregável obrigatório deste portão — a Lista de Imagens:** uma **lista explícita**, palavra a palavra (36), classificando cada imagem existente (as 6 avatares) como **reutilizada** ou **a substituir**, e confirmando as **30 novas obrigatórias** (palavras sem arte reutilizável). Resultado esperado: **produção final de 30 a 36 imagens novas** (30 obrigatórias + 0 a 6 substituições das avatares que não combinarem com o padrão aprovado).
> **O P13 só pode começar depois que essa Lista de Imagens estiver formalmente aprovada.** Sem a lista aprovada, **nenhuma** produção/comissionamento de imagem é liberado.

### P13 — Produção, validação e registro das imagens das PALAVRAS
- **Escopo (restrito a imagens de palavra):** produção externa (designer) das **30 imagens obrigatórias** + **0 a 6 substituições** das avatares reprovadas na Lista de Imagens (**total 30–36 novas**), todas no padrão único aprovado; registro **seletivo** em `assets/games/palavrinhas_do_beni/` e no banco (`imageRef`), habilitando (`enabled=true`) as palavras cujas imagens chegaram; **manifesto de assets** registrando, para **cada uma das 36 palavras**, o estado da imagem: **reutilizada · substituída · criada**; auditoria de peso/dimensões/nomes/fundo/consistência.
- **Fora:** código de mecânica; **QUALQUER coisa relacionada às poses do Beni** (registro/uso/wire — isso é 100% do P9); acentos/Ç.
- **Arquivos:** `assets/games/palavrinhas_do_beni/*` (imagens de palavra), `src/data/palavrinhasWords.js` (`imageRef`/`enabled`), `docs/…MANIFEST` das imagens de palavra. **Não toca `beniImages.js`.**
- **Pré-condição dura:** **Lista de Imagens do Portão Visual 2 formalmente aprovada.** Sem ela, o bloco não inicia.
- **Aceite:** todas as imagens no padrão único; nomes/dimensões/fundo consistentes; nenhum `require` inexistente; validador do banco 0 problemas; **manifesto completo (36/36 palavras marcadas reutilizada/substituída/criada)**; contagem final de novas imagens entre **30 e 36**.
- **Testes:** validador de imagens (item 5–6); auditoria de assets (peso/dimensão); checagem de que o manifesto cobre 36/36 palavras.
- **Gates:** smoke + expo-doctor; auditoria de assets.
- **Validação manual (🚦):** **Portão de Assets** — aprovar padrão/dimensões/nomes/fundo/consistência/registro **e o manifesto 36/36** em aparelho.
- **Riscos:** dependência **externa** (arte); versionamento seletivo, sem `git add` amplo; WebP/tamanho avaliados antes.
- **Dependências:** Portão Visual 2.
- **Commit(s):** **commits de assets** próprios (por lote, auditoria própria), separados de código/governança.

> ### 🚦 PORTÃO DE ASSETS — após P13
> Aprovar padrão, dimensões, nomes, fundo, consistência e **registro** das imagens (e decisão final sobre as 6 avatares).

### P14 — Integração final + regressão
- **Escopo:** fechar a integração das **três microatividades + erros + Resgate + reforço + resultado + estrelas + simulador** com as imagens reais; **regressão** completa (Ovelhinha 2.2e/2.2f + restante do app); validação física final.
- **Fora:** acentos/Ç (bloco próprio), persistência de domínio, conquistas.
- **Arquivos:** ajustes finos em telas/serviços; `scripts/smoke.js` (fechamento do bloco).
- **Aceite:** smoke total verde; **todos os checks da Ovelhinha permanecem verdes**; app sem regressão; validação física aprovada.
- **Testes:** 58–60 + toda a suíte.
- **Gates:** `npm run smoke` verde, `npx expo-doctor` verde, `npx expo install --check`, `git diff --check`.
- **Validação manual (🚦):** **Portão de Integração Final** — Eduardo valida em **aparelho real** o jogo completo.
- **Dependências:** Portão de Assets.
- **Commit:** integração final.

---

## 8. Portões humanos (resumo)

| # | Portão | Após | Critério de aprovação |
|---|---|---|---|
| 🚦 V1 | **Visual 1** | P4 | Tela base + Livro + seleção + página + Beni + amostra COMPLETE, só assets existentes, em aparelho real |
| 🚦 T | **Técnico de Traçado** | P5 | Protótipo isolado A/O/L, critérios a–j, em aparelho real |
| 🚦 V2 | **Visual 2** | P12 | Frame visual/UX aprovado + **Lista de Imagens** (36 palavras: reutilizada/a substituir) formalmente aprovada, **antes** de comissionar qualquer arte |
| 🚦 A | **Assets** | P13 | Padrão/dimensões/nomes/fundo/consistência/registro + **manifesto 36/36** (reutilizada/substituída/criada) aprovados; 30–36 novas |
| 🚦 F | **Integração Final** | P14 | Jogo completo + regressão (Ovelhinha+app) + validação física |

(Além destes: **Portão 2 (plano)** — esta etapa — e o **Portão de Analyze** antes de qualquer implementação, conforme o fluxo SDD.)

## 9. Dependências entre blocos

```
P1 → P2 → P3 → P4 → 🚦V1 → P5a → P5 → 🚦T → P6 → P7 → P8 → P9 → P10 → P11 → P12 → 🚦V2 → P13 → 🚦A → P14 → 🚦F
                                            └─(P6 depende de P4; usa traçado só a partir de P8)
```
- **P5/P8** dependem do **Portão Técnico** (traçado aprovado antes de integrar/expandir).
- **P8** depende de **P7** (mecânica de brilho/fluxo pronta).
- **P11** depende de **P10** (adaptativo influencia o resultado/estrelas indiretamente) e **P7**.
- **P13** depende do **Portão Visual 2** (não comissionar arte antes).
- **P14** depende do **Portão de Assets**.

## 10. Arquivos previstos por bloco

| Bloco | Arquivos (novos/estendidos) |
|---|---|
| P2 | `src/data/palavrinhasWords.js` (novo), `src/services/palavrinhasGameService.js` (novo) |
| P3 | `src/services/palavrinhasGameMachine.js` (novo) |
| P4 | `src/screens/PalavrinhasDoBeniScreen.js` (novo), `src/constants/routes.js`, `src/navigation/AppNavigator.js`, `src/screens/BrincarScreen.js` |
| P5a | — (auditoria de raiz) |
| P5 | `src/services/tracadoService.js` (novo), `src/data/letterPaths.js` (novo, A/O/L), `src/screens/PalavrinhasTraceLabScreen.js` (novo), `routes.js`, `AppNavigator.js` |
| P6 | `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js` |
| P7 | `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js`, `palavrinhasGameService.js` |
| P8 | `letterPaths.js` (+letras), `tracadoService.js`, `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js` |
| P9 | `src/assets/mascot/beniImages.js` (**registro dos 3 órfãos — ÚNICO ponto; commit de assets**), `PalavrinhasDoBeniScreen.js`, util de animação |
| P10 | `src/services/palavrinhasDirector.js` (novo), `PalavrinhasDoBeniScreen.js`, `palavrinhasGameMachine.js` |
| P11 | `PalavrinhasDoBeniScreen.js`, `src/services/brincarStatsService.js` (mesma chave) |
| P12 | `src/screens/PalavrinhasAssetGalleryScreen.js` (novo), `routes.js`, `AppNavigator.js`, `PalavrinhasDoBeniScreen.js` |
| P13 | `assets/games/palavrinhas_do_beni/*` (imagens de PALAVRA, commits de assets), `src/data/palavrinhasWords.js` (`imageRef`/`enabled`), manifesto de imagens. **Não toca `beniImages.js`.** |
| P14 | ajustes finos + `scripts/smoke.js` (fechamento) |
| todos | `scripts/smoke.js` (testes por bloco) |

## 11. Riscos técnicos

1. **Traçado (maior risco):** matemática de corredor/cobertura/checkpoints + **1º arrasto contínuo do app** → mitigado pelo **protótipo isolado** (P5) e módulo **puro** testável; **raiz já pronta** (mitiga o risco de `GestureHandlerRootView`).
2. **Precisão do arrasto** em telas pequenas / movimento reduzido → alternativa por checkpoints; calibração de corredor por dificuldade (P8).
3. **Geometria autoral de letras** (independente de fonte raster) → trabalho manual + alinhamento visual; começar só com A/O/L.
4. **Dependência externa de arte** (30–36 imagens de palavra: 30 obrigatórias + até 6 substituições das avatares reprovadas) → isolada após Portão Visual 2 e sua **Lista de Imagens** aprovada; commits de assets próprios. As **poses do Beni** (órfãos) **não** dependem disso — são registradas antes, no P9.
5. **Contrato de estrela** (`addBonusStars` único, gated) e **`sanitizeStats` retrocompatível** → replicar padrão da Ovelhinha exatamente; smoke cobre.
6. **Módulos puros sem RN/Expo** → obrigatório para o eval do smoke; qualquer import de UI quebra os testes.
7. **Letras confundíveis** (B/D, P/B, …) → risco pedagógico; distratores nunca as exploram; `confusableLetters` no banco.
8. **Áreas protegidas** (storageKeys/achievements/assets) → nunca tocadas na v1; blocos isolados com aprovação.

## 12. Fora de escopo (v1 / blocos futuros isolados)

- Persistência de **domínio por palavra** (`@ptf_palavrinhas_words_v1` — chave nova protegida).
- **Conquistas** de Palavrinhas (`achievements.js`).
- **Acentos/Ç** ativos (só Difícil, após infra validada).
- **Álbum de figurinhas**.
- **Áudio por palavra/letra** e qualquer TTS.

## 13. Estado do Git nesta etapa

HEAD **`e1cffdd`** (inalterado). Nenhum `git add`/commit/push. Único artefato: os documentos da spec (`spec-palavrinhas.md` atualizado + `plan-palavrinhas.md` novo), **untracked** em `specs/009-palavrinhas-do-beni/`. Nenhum código, asset, build ou dependência.

---

## 14. P4R — Reconstrução funcional e visual do P4 (sem imagem)

> **Status do P4:** o protótipo `src/screens/PalavrinhasDoBeniScreen.js` (não commitado) foi **REPROVADO no Portão Visual 1 (2×)** e **NÃO poderá ser commitado**. A abordagem baseada em **imagem por palavra está CANCELADA**. O **P4R** substitui a metade de UI do P4; as fundações puras (Fase 0, commit `c906903`) **permanecem** e são reutilizadas. Ver spec §2.2 e §R.

### 14.1 Objetivo
Palco mágico de palavras guiado pelo Beni: **palavra como herói visual** (sem figura), COMPLETE com 1–5 lacunas por dificuldade, **combo**, **escalada de erro** (1/2/3 → Resgate), **tempo real reutilizado dos Pares** (Médio/Difícil), Beni-guia com **falas por estado**, cabeçalho que **compensa o banner de Modo Criador**, e tela final rica com 4 botões.

### 14.2 Escopo do P4R
- **Banco expandido para ≥120 palavras (40/40/40)** com acentos/Ç **habilitados no COMPLETE** (spec §R.1) → altera `src/data/palavrinhasWords.js` (que hoje tem 36 e acentuadas `enabled:false`). Isso **muda a regra do Portão 1 §3** (acentos só depois): agora acento/Ç entram no COMPLETE; **só o traçado** dessas letras fica adiado. Atualizar o validador e os testes P2 de acordo.
- **Dificuldade** por letras+lacunas+ortografia (spec §R.2); lacunas distribuídas.
- **Fluxos de acerto/erro** (spec §R.3/R.4): letra→lacuna animada, brilho, combo, +5s; erro balança/reshuffle/−2s/Resgate.
- **Tempo** reutilizando o contrato REAL dos Pares (spec §R.5): `addTurboTime`/`segundosRestantes`, `countdown_tick`/`time_up_alarm`, moldura vermelha de 4 faixas (bordas externas), pulso (com gate de movimento reduzido), limpeza de som no unmount/pausa.
- **Beni-guia** com falas por estado (spec §R.6), **sem "figura"**.
- **Estrutura visual** (spec §R.7) e **tela final** (spec §R.8).
- **Cabeçalho compensando o banner** (spec §R.9), reagindo a `subscribeCreatorQaMode`.

### 14.3 Fora de escopo (mantido)
Traçado (P8), MONTE por bandeja, Diretor/Página Tranquila completos, estrelas/persistência, Modo Criador/simulador, assets de imagem, poses órfãs do Beni (P9). Imagens de palavra: **removidas** (não voltam).

### 14.4 Arquivos previstos
- `src/data/palavrinhasWords.js` — **expandir a 120** (40/40/40); acentuadas `enabled:true` para COMPLETE; `imageRef` opcional/`null`. *(módulo puro — regra §3.)*
- `src/services/palavrinhasGameService.js` — ajustar `PALAVRINHAS_DIFFICULTIES` (letras/lacunas/opções/tempo) e o validador (120, faixas de letras, acentos/Ç suportados). *(puro.)*
- `src/services/palavrinhasGameMachine.js` — reusar; avaliar efeito novo de penalidade de tempo (2º erro na mesma lacuna) — se necessário, **volta ao artefato** antes. *(puro.)*
- `src/screens/PalavrinhasDoBeniScreen.js` — **reescrita P4R** (palco da palavra, Beni-guia, timer-Pares, combo, tela final, compensação de banner).
- `scripts/smoke.js` — bloco **P4R** (substitui checks P4/P4-rev).
- **Reuso do timer dos Pares:** `paresGameService.js` (`addTurboTime`, `segundosRestantes`, `TURBO_*`), `PARES_SOUND_EVENTS` (via `audioManager`), padrão `MolduraAlerta`.
- **Proibidos/protegidos:** `App.js`, `storageKeys.js`, `achievements.js`, acesso/paywall, `beniImages.js` (poses órfãs).

### 14.5 Critérios de aceite do **novo Portão Visual 1** (P4R)
1. **Sem imagem de palavra** em nenhum lugar da rodada; **nenhuma imagem contraditória**; nenhum `require` de imagem de palavra.
2. **Palavra é o herói** (grande, central, legível; sem quebra em 2 linhas; redução progressiva em palavras longas).
3. **Beni presente e reagindo** em todos os estados; **nunca** diz "olhe a figura".
4. **Toque instantâneo** (pressed no 1º frame) + **letra anima até a lacuna** (acerto) e **balança** (erro), respeitando movimento reduzido.
5. **Dificuldade** por lacunas (Fácil 1 · Médio 2–3 · Difícil 3–5) e faixas de letras; acentos/Ç aparecem e são completáveis no Difícil.
6. **Tempo** (Médio/Difícil): contador, **+5s por palavra**, **−2s no 2º erro na mesma lacuna**, **bordas vermelhas + pulso + som de relógio** ao acabar, som **parando** ao subir/terminar/pausar/desmontar.
7. **Combo** visível aumentando por acertos e reiniciando no erro.
8. **Sem linha cortando texto**; **sem vazio grande no topo**; **cabeçalho não encoberto** pelo banner de Modo Criador; Safe Area correta; iPhone (com recorte) **e** Android; tela pequena.
9. **Tela final** com Beni contextual + páginas + melhor combo + brilhos + tempo bônus + 4 botões (Jogar de novo / Trocar dificuldade / Voltar ao Brincar / Voltar ao Início) + mensagem de participação quando o tempo acaba antes da 1ª palavra.
10. Gates verdes; regressão intacta; **P5/traçado não iniciados**; **nenhuma pose órfã**; **nenhum asset novo**.

### 14.6 Sequência
`(Fase 0 ✅) → P4R (reconstrução) → 🚦 PORTÃO VISUAL 1 (novo) → [P5a/P5 traçado, só após aprovação]`.
O antigo P4 e seus critérios ficam **superados** por P4R. Nada de P5/traçado antes do novo Portão Visual 1.

### 14.7 Blocos CANCELADOS pela concepção sem imagem
Como não há imagem por palavra, ficam **CANCELADOS**: **🚦 Portão Visual 2**, **Bloco P13 (produção/registro das 30–36 imagens de palavra)** e **🚦 Portão de Assets** (§6/§7/§8 acima, no que se referem a imagens de palavra). O **manifesto de imagens** e a **Lista de Imagens** deixam de existir. A produção de assets remanescente do roteiro é apenas o **wire das poses órfãs do Beni (P9)** — que **não** depende de imagens de palavra. As demais fases (traçado, mecânicas, estrelas, Modo Criador, regressão) seguem, sem qualquer dependência de figura de palavra.

---

## P4R3 — Beni personagem + Magia/Baú + modos distintos (Portão Visual 1 pendente)

Ver `spec-palavrinhas.md` §R3. Alterações de código (não commitadas): novo `src/components/beni/BeniStageCharacter.js` (personagem do palco, sem crop, camada própria — corrige o corte do Beni); `beniImages.js` (poses órfãs 08/09/10/11 registradas — aprovado); `BeniCircularArt.js` (fallback onError); serviço (modos distintos Livro/Corrida/Turbo Relâmpago + poderes do Baú + Diretor por combo de palavras); tela reescrita (combo de letras × combo de palavras, Magia do Livro, Baú Mágico com 5 poderes, Palavra Relâmpago, página virando, peça voando, tela final por modo). Testes P2R/P4R3 atualizados. **Sem commit; Portão Visual 1 ainda pendente.**

---

## P4R4 — modos definitivos, Baú só na Corrida, Turbo sem preview, Beni enquadrado (Portão Visual 1 pendente)

Ver `spec-palavrinhas.md` §R4. Código (não commitado): serviço com `magia/poderes/bauApos/bauMax` por modo (Baú só na Corrida, após 5, 1 por partida) + `poderElegivel` puro; `BeniStageCharacter` com `presentation="portrait"|"event"` (moldura coerente, sem imagem solta, sem corte do personagem); tela reescrita em áreas reservadas (guia/palavra/efeitos/opções), Beni nunca sobre as letras, Turbo sem qualquer pré-visualização, HUD/tema/tela final por modo, consumo+indicador de poderes. Testes P2R/P4R4 (smoke 2107/2107). **Sem commit; Portão Visual 1 pendente.**

---

## P4R5 — estabilização: Beni renderiza, finalização atômica, efeitos/sons/destaques (Portão Visual 1 pendente)

Ver `spec-palavrinhas.md` §R5. Código (não commitado): `BeniStageCharacter` reescrito com a receita provada (Image RN + require estático + width/height explícitos + contain + onLoad/onError + fallback); tela com finalização ATÔMICA (`finalizarPalavra`: conclui no núcleo antes dos efeitos), mapa de sons único, destaques locais não persistentes, grade de diagnóstico de poses (dev), slots memoizados. Testes P4R5 (smoke 2113/2113). **Sem commit; Portão Visual 1 pendente.**

---

## P4R6 — direção visual, coreografia, poses por apresentação, navegação (Portão Visual 1 pendente)

Ver `spec-palavrinhas.md` §R6. Código (não commitado): novo módulo PURO `palavrinhasVisualDirector.js` (grupos de poses, presets, prioridade, permanências, mapeadores); `BeniStageCharacter` com guarda de apresentação + presets; tela com coreografia por token, Super Beni/Brilho Triplo como overlays, limpeza entre palavras, hierarquia sonora, grade DEV nos dois formatos e **navegação da tela final corrigida** (rota aninhada). Testes P4R6d (diretor puro) + P4R6 (tela). Smoke 2122/2122. **Sem commit; Portão Visual 1 pendente.**

---

## P4R7 — carregamento determinístico, Bolso Mágico, Turbo autoritativo (Portão Visual 1 pendente)

Ver `spec-palavrinhas.md` §R7. Código (não commitado): novo `palavrinhasPoderes.js` (8 poderes puros); máquina com `TEMPO_ESGOTADO`; `BeniStageCharacter` cover + crossfade load-gated; diretor com presets cover + partículas determinísticas + prioridade TEMPO_ESGOTADO; tela com warmer/preload, relógio por deadline, Bolso Mágico manual, overlays reconstruídos, laboratório DEV. Testes P4R7m/P4R7p/P4R6d/P4R7 (smoke 2131/2131). **Sem commit; Portão Visual 1 pendente.**

---

## P4R8 — warmup compartilhado, infinitos, encerramento manual, dock inferior (Portão Visual 1 pendente)

Ver `spec-palavrinhas.md` §R8. Código (não commitado): `beniAssetWarmup.js` (singleton) + warmup iniciado na BrincarScreen + `PalavrinhasBeniWarmer`; `BeniStageCharacter` cache compartilhado + onLoadEnd; Corrida/Turbo infinitos; encerramento manual; Baú a cada 4 + múltiplos + pendente; Bolso na barra inferior (`PalavrinhasPowerDock`) com ativação manual + FSM (`PalavrinhasPowerEffect`, consumo no impact); HUD/Chest extraídos. Testes P2R/P4R7m/P4R7p/P4R6d/P4R8 (smoke 2133/2133). **Sem commit; Portão Visual 1 pendente.**

---

## P4R9 — imagens estáveis, pose por palavra, Vento, painel de poder (Portão Visual 1 pendente)

Ver `spec-palavrinhas.md` §R9. Código (não commitado): warmup por TAMANHO (readyPortrait/readyEvent) + warmer 2 Images (128/220); `BeniStageCharacter` placeholder + guarda mesma-source + ready por tamanho; pose portrait ESTÁVEL por palavra (RNG); BrincarScreen navega imediatamente; `avaliarUsoDoPoder` puro + `PalavrinhasPowerDetailsPanel`; Vento corrigido + timeout de segurança; botão "Encerrar" com texto + modal; Triplo compacto + Super grande só 1ª vez; 1º Baú automático / seguintes manuais. Testes P4R9/P4R9p (smoke 2134/2134). **Sem commit; Portão Visual 1 pendente.**

---

## P4R9a — dica do poder (faixa larga) + auditoria (Portão Visual 1 pendente)

Causa: dica dentro do slot (≈56px) absoluta só com right → largura limitada pelo slot. Correção mínima: `coachBand` LARGA acima do dock (left/right, ≤2 linhas, pointerEvents none, ícone), texto "Poder guardado! Toque nele quando quiser usar.", onboarding único 3,8s, some ao tocar/painel, não durante eventos, reinicia na partida, mov. reduzido só fade. Cabeçalho truncado = recomendação P1 (não alterado). Teste P4R9a; smoke 2135/2135. Sem commit. Auditoria final registrada no relatório (não implementada).

---

## P4.1 — cabeçalho responsivo + pausa pedagógica (novo Portão Visual pendente)

Ver `spec-palavrinhas.md` §R4.1. Título compacto "Palavrinhas" só em partida ativa com controles (senão "Palavrinhas do Beni"). Pausa pedagógica a cada 16 palavras só nos modos infinitos (`devePausarBloco` puro), entre palavras; congela o deadline (pausaPedagoRef), Continuar monta a próxima palavra sem perder tempo, Encerrar reusa o fluxo oficial SEM alarme; TEMPO_ESGOTADO prioritário; reinicia na partida. Testes P4.1 (puro + tela); smoke 2138/2138; gates verdes. Sem commit; sobre 9bcdcf5.
