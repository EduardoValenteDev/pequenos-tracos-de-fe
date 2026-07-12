# Palavrinhas do Beni — Especificação de Produto e Arquitetura

> **Feature:** `009-palavrinhas-do-beni` · **Etapa SDD:** 1 (Specify → **aprovada**) · **🚦 Portão 1: APROVADO** (decisões em §2.1). Plano em [plan-palavrinhas.md](plan-palavrinhas.md).
> **Base:** `content-integrate-coloring-3` @ `e1cffdd` ("Cadê a Ovelhinha?" concluído, commit local, sem push).
> **Natureza:** novo jogo da aba **Brincar** (dev-gated), reaproveitando a arquitetura da Ovelhinha (máquina pura, baralho por seed/planId, Modo Criador, gallery+simulador).
> **Escopo desta etapa:** SOMENTE auditoria + decisões de produto + arquitetura + especificação. **Nenhum código de produção.** Nenhum asset registrado. Sem commit/push/build.
> **Precedência:** subordinada a `docs/PROJECT_SOURCE_OF_TRUTH.md`, à Constituição e ao `AGENTS.md`. Áreas protegidas (achievements, storageKeys novos, paywall) só mudam com aprovação explícita.

---

> ## ⚠️ SUPERSESSÃO — Redefinição do P4 (Portão Visual 1 reprovado 2×)
> **A abordagem baseada em IMAGENS por palavra está CANCELADA.** "Palavrinhas do Beni" **não** depende de figura/ilustração da palavra. Nenhuma imagem de ARCA/PEIXE/OVELHA/POMBA/ESTRELA (nem de qualquer palavra) é necessária ao funcionamento principal. **A PALAVRA é o elemento visual central**; **o Beni é o personagem visual e o guia pedagógico**.
> O protótipo **P4 atual** (`src/screens/PalavrinhasDoBeniScreen.js`, não commitado) foi **REPROVADO** e **não poderá ser commitado**. A reconstrução é o **Bloco P4R** (ver [plan-palavrinhas.md](plan-palavrinhas.md) §14 e [tasks-palavrinhas.md](tasks-palavrinhas.md)). As seções desta spec que assumiam imagem por palavra (§10.2/§17/§22 image rows e a decisão §2.1.2) ficam **SUPERSEDIDAS** pelas novas decisões em **§2.2** e pelo banco expandido em **§10R**. As decisões travadas do Portão 1 sobre acesso/estrelas/persistência/Beni-poses/traçado **permanecem**; muda apenas a **concepção visual/pedagógica sem imagem**.

---

## 0. Sumário executivo

**Palavrinhas do Beni** é o segundo jogo da aba Brincar. A criança reconstrói o "Livro Mágico de Palavrinhas do Beni" por meio de três micro-atividades — **COMPLETE** (tocar a letra que falta), **MONTE** (montar a palavra a partir da bandeja) e **TRACE** (percorrer com o dedo o contorno de uma letra) — sem teclado, sem cronômetro punitivo, sem derrota. Erros nunca bloqueiam: convergem para o **Resgate da Palavra** (a criança sempre participa) e para uma **fila de reforço**. A rejogabilidade reusa o modelo determinístico já validado na Ovelhinha (seed → planId → plano imutável → baralho rotativo).

**Decisão arquitetural central:** reaproveitar **verbatim** as primitivas puras de baralho/seed da Ovelhinha (`criarRng`, `novaSeed`, `shuffle`, `criarDeckState`, `clonarDeckState`, `planId`, contrato `planPartida → {plano, deckState, planId}`) e a **camada de coordenadas arte↔pixel** (`computeViewport`/`contentRect`/`artToPx`/`pxToArt`), e **construir novo** apenas o domínio de palavras/letras, a máquina de estados de montagem/traçado e a matemática pura do traçado (corredor + cobertura), que **não existe** no repositório.

---

## 1. Resultado da auditoria (read-only, 5 frentes)

Estado git conferido: branch `content-integrate-coloring-3`, HEAD `e1cffdd`, working tree limpo, **não publicado** (ahead 13). Nada pré-existente sobre "palavrinhas/soletrar/spelling/trace" além do que segue.

### 1.1 O que JÁ existe e será reutilizado

| Área | Onde | Reuso |
|---|---|---|
| **Card do jogo** | `src/screens/BrincarScreen.js:52` — entrada `EM_PREPARO` `{ id:'palavrinhas', icon:'palavrinhas', title:'Palavrinhas do Beni', desc:'Monte palavras da Bíblia.' }` **já existe** | Reusar; adicionar branch `id==='palavrinhas' && isInternalToolsEnabled()` → `TestingTile` (idêntico ao da Ovelhinha) |
| **Ícone** | `src/components/ui/FaithIcon.js:57` — `palavrinhas: 'text'` **já existe** e é testado no smoke (`icones11`) | Reusar |
| **Gating dev** | `src/config/internalTools.js` (`isInternalToolsEnabled`), `src/services/creatorQaMode.js` (`isCreatorQaModeAllowed/Enabled`) | Reusar sem alterar |
| **Rotas/nav** | `src/constants/routes.js`, `src/navigation/AppNavigator.js` — idioma `{isInternalToolsEnabled() && (<Stack.Screen …/>)}` | Reusar padrão; adicionar rotas novas |
| **Baralho/seed puro** | `src/services/ovelhaGameService.js` — `criarRng`(LCG), `novaSeed`, `shuffle`(Fisher-Yates), `criarDeckState`, `clonarDeckState`, `assinaturaDeck`, `planId`(FNV-1a→base36), contrato `planPartida→{plano,deckState,planId}`, `OVELHA_DIFFICULTIES` | **Copiar as primitivas** e adaptar os montadores de baralho para palavras |
| **Coordenadas arte↔px** | `src/services/ovelhaGameService.js` — `computeViewport`/`contentRect`/`artToPx`/`pxToArt` (puro, testado) | Reusar como camada de posicionamento da letra de traçado |
| **Máquina pura (molde)** | `src/services/ovelhaGameMachine.js` — `FASES`/`EFEITOS`/`{estado,efeitos}`/guard por fase/id-não-índice/anti-duplo-toque | **Molde** (copiar estrutura, não o arquivo) |
| **Modo Criador + Gallery + Simulador** | `src/screens/OvelhaAssetGalleryScreen.js` — `AssetCard`, `SpotInspector`, `SimuladorPartidas` ("não consome rodada / não salva progresso") | **Molde** para inspetor de palavras + simulador de sessões |
| **Áudio** | `src/services/audioManager.js` (expo-audio): `playGameSfx`, `playUiSound`, `preloadGameSfx`, `releaseGameSfx`; `SoundButton`; prefs `@ptf_audio_prefs_v1` (`soundsEnabled` respeitado automaticamente) | Reusar; ver §9 para o mapa de sons |
| **Estrelas/diário** | `src/services/brincarStatsService.js` (`@ptf_brincar_stats_v1`, `starsToday` compartilhado), `brincarDailyService.js` (`@ptf_brincar_daily_v1`, 2 rodadas/dia grátis), `addBonusStars` em `postStoryStorage.js` (`@ptf_bonus_stars`), cap `BRINCAR_DAILY_STAR_CAP=2` | Reusar **sem nova chave**: adicionar sub-objeto `palavrinhas` + `applyPalavrinhasResult`/`recordPalavrinhasResult` |
| **Progresso** | `src/context/ProgressContext.js` — `refreshProgress()` reatualiza o total de estrelas | Reusar sem alterar |
| **Design system** | `src/theme/productTheme.js` (colors `beni`/`purple #7C3AED`/`gold`/`green`, `radii`, `shadows`), `FaithIcon`, SafeArea via `useSafeAreaInsets` manual | Reusar |
| **Beni (poses)** | `src/assets/mascot/beniImages.js` (7 poses), `BeniAvatar`, `BeniGuideBubble` | Reusar as 7 poses; ver §17 |
| **SVG / gestos** | `react-native-svg@15.12.1` (usado em `MapPath.segPath` = gerador de `d` bézier), `react-native-gesture-handler@2.28.0` (instalado, **não** usado p/ desenho) | Reusar `<Path>` p/ desenhar o corredor; introduzir 1º handler de arrasto |
| **Smoke** | `scripts/smoke.js` — `check()`, `readSrc`, `a1StripComments`, eval de módulo puro via strip-imports/exports + `new Function('…;return {…}')` | Reusar o padrão para um bloco novo "Palavrinhas" |

### 1.2 O que NÃO existe e será construído do zero

1. Domínio de palavras/letras: banco de palavras, validador, `letterInstances` (letras repetidas), distratores, `missingPatterns`, `traceTargets`.
2. Montadores de baralho de **palavras** (por categoria/atividade/padrão de lacunas) e `planPartida` de palavras.
3. Máquina de estados de montagem+traçado (14 fases — §15).
4. **Matemática pura do traçado**: distância ponto→polilinha (corredor), amostragem por comprimento de arco, cobertura %, checkpoints ordenados. **Nada disso existe** (nem `getPointAtLength`, nem point-in-polygon, nem distância a segmento).
5. Geometria autoral de letras maiúsculas (polilinhas + checkpoints por letra).
6. 1º handler de **arrasto contínuo** do app (nenhum `PanResponder`/`Gesture.Pan` de desenho existe hoje).
7. Telas novas: `PalavrinhasDoBeniScreen` e `PalavrinhasAssetGalleryScreen` (dev).
8. Bloco novo de smoke.

### 1.3 O que exigirá novo asset

- **Imagens das palavras**: hoje só há reuso *candidato* em `assets/avatar/*` (216×216, alpha) para **6 palavras** (OVELHA=sheep, LEÃO=lion, PEIXE=fish, POMBA=dove, ARCA=ark, ESTRELA=star). As outras **30 palavras exigem arte nova obrigatória** (padrão visual único do app — §2.1.2). As 6 candidatas **só serão aprovadas ou rejeitadas no Portão Visual 2**; cada uma reprovada vira **substituição** por arte nova. **Produção final = 30 a 36 imagens novas** (30 obrigatórias + 0–6 substituições). "~30" nunca é um teto: é o **piso**.
- **Beni**: faltam poses "erro acolhedor" (sem tristeza) e "lanterna do Resgate" (§17). Duas poses órfãs no disco podem ser aproveitadas (`09_beni_descansando` p/ Página Tranquila; `08_beni_celebrando_2` p/ sequência).
- **Áudio**: nenhum áudio por palavra/letra (por decisão). Opcional futuro: nomes de letras gravados uma única vez.
- Diretório novo `assets/games/palavrinhas_do_beni/` (não criado nesta etapa).

### 1.4 O que exigirá decisão futura (Portão 1 / blocos isolados)

- **Rodadas/estrelas compartilhadas**: Palavrinhas herda automaticamente o teto **2 rodadas/dia** e **2 estrelas/dia** compartilhado com Pares+Ovelha. Confirmar se é desejado ou se quer orçamento próprio (exigiria nova chave — protegido).
- **Persistência de domínio da palavra** (Nova/Aprendizagem/Reconhecida/Dominada) exige **nova chave** `@ptf_palavrinhas_words_v1` → área protegida (`storageKeys.js`), **adiar para bloco isolado com aprovação**.
- **Conquistas** de Palavrinhas em `src/data/achievements.js` → área protegida (celebração), **aprovação explícita**.
- **Estilo das imagens** e **estratégia de acentos/Ç** (introdução progressiva).

### 1.5 Riscos técnicos (resumo; detalhe em §30)

1. **Traçado é 100% novo** (corredor/cobertura/checkpoints + 1º arrasto do app) — maior risco de engenharia; mitigar com protótipo isolado (Bloco 3.8) e módulo puro testável.
2. **`react-native-gesture-handler`** exige `GestureHandlerRootView` na raiz — validar antes de depender.
3. **Precisão do arrasto** em telas pequenas (corredor estreito) e em movimento reduzido.
4. **Letras confundíveis** (B/D, P/B, M/N…) na bandeja — risco pedagógico, não de código.
5. **Módulo puro** do smoke não pode importar RN/expo (imports são removidos por regex) — manter geometria de letras dependency-free.

---

## 2. Decisões definitivas de produto

1. **Sem derrota.** A criança nunca perde partida, progresso, nem é bloqueada. "Perder" = precisar de Resgate (1 brilho) + entrar em reforço. Texto sempre positivo.
2. **Três brilhos por palavra**: 3 = sem erro e sem dica; 2 = 1 erro **ou** 1 dica leve; 1 = precisou de Resgate.
3. **Três atividades**: COMPLETE, MONTE, TRACE; + REFORÇO (retorno simplificado).
4. **Maiúsculas** na v1. Acentos/Ç só quando a infraestrutura estiver validada (introdução progressiva — §10).
5. **Sem áudio por palavra**, **sem teclado**, **sem reconhecimento de caligrafia**, **sem cronômetro eliminatório**.
6. **Rejogabilidade determinística** por seed/planId/deck rotativo (reuso do modelo da Ovelhinha).
7. **Dificuldade adaptativa** interna (Diretor) que **nunca** troca o modo escolhido e **nunca** reduz tamanho de botão/letra.
8. **Estrelas**: 1 estrela por partida concluída, via `addBonusStars(1)` gated em `starAwarded`, respeitando o teto diário compartilhado (**decisão de compartilhamento a confirmar no Portão 1**).
9. **Persistência de domínio da palavra e conquistas**: especificadas, **não implementadas na v1** (áreas protegidas).
10. **Dev-gated**: rota e ferramentas só sob `isInternalToolsEnabled()`; nunca em produção.

## 2.1 Decisões do Portão 1 (aprovadas por Eduardo — travadas)

Estas decisões **resolvem** as pendências de §25 e passam a reger a implementação:

1. **Tetos diários compartilhados.** Manter os serviços/tetos diários já existentes do módulo Brincar (`brincarDailyService` `@ptf_brincar_daily_v1`, 2 rodadas/dia; teto de estrelas `BRINCAR_DAILY_STAR_CAP=2` via `starsToday` compartilhado). **Não** criar economia paralela, nova chave diária nem teto exclusivo de Palavrinhas nesta etapa.
2. **Imagens — padrão único, sem flashcard novo.** As 36 palavras seguem **um único padrão visual coerente com o app**. As 6 imagens existentes (`assets/avatar/*`) podem ser usadas **no protótipo**, mas a reutilização definitiva **depende de validação visual** e **só é aprovada ou rejeitada no Portão Visual 2**; cada uma que **não combinar** com o padrão aprovado **será substituída por arte nova**. Existem **30 imagens novas obrigatórias** (palavras sem arte reutilizável); somando as substituições, a **produção final é de 30 a 36 imagens novas**. O Portão Visual 2 deve produzir uma **Lista de Imagens explícita** (as 36 palavras: reutilizada · a substituir), e o bloco de produção (**P13**) **só pode começar depois dessa lista ser formalmente aprovada**. O **manifesto de assets** registra, para cada uma das 36 palavras, se a imagem foi **reutilizada · substituída · criada**. **Não** planejar geração imediata de arte: primeiro uma **tela protótipo validável** com imagens já disponíveis; a **produção em lote só é liberada após o Portão Visual 2**.
3. **Acentos e Ç — só no Difícil e só após infra validada.** Restritos ao modo Difícil e liberados **somente depois** da validação da infraestrutura básica de letras e traçado. A **versão inicial funciona integralmente sem** acentos/Ç.
4. **Persistência de domínio por palavra — adiada.** Bloco isolado posterior. **Não** criar agora chave persistente de domínio. Usar **somente** os serviços existentes de estatísticas/diário/estrelas/progresso, respeitando os contratos atuais.
5. **Conquistas — adiadas.** **Não** integrar nem alterar a área protegida de conquistas durante a implementação principal de Palavrinhas.
6. **Beni — reuso de assets órfãos, sem arte nova.** Planejar o **registro e uso** dos órfãos já no disco: `09_beni_descansando` para **acolhimento após erros**; `10_beni_apontando_direita` **ou** `11_beni_apontando_esquerda` para **dicas, reforço e Resgate**. O efeito de **lanterna do Resgate** é, na v1, **composição de interface** (brilho/foco/microanimação ao redor da pose "apontando") — **sem exigir arte nova** do Beni.
7. **Traçado — abordagem nativa aprovada, protótipo isolado primeiro.** Aprovado `react-native-svg` + `react-native-gesture-handler` (não WebView). O **primeiro passo** é um **protótipo técnico isolado**, sem integração prematura ao jogo, usando **somente as letras A, O e L**, validando: (a) coordenadas independentes de resolução; (b) corredor tolerante; (c) distância toque→polilinha; (d) cobertura por amostragem de arco; (e) checkpoints em ordem; (f) entrada/saída do corredor; (g) escalonamento para telas pequenas; (h) movimento reduzido; (i) comportamento no Dev Client; (j) **ausência de dependência de fonte raster** para a geometria oficial. A **expansão para outras letras só ocorre após esse protótipo ser aprovado**.

> **Nota de infraestrutura (confirmada na auditoria de raiz):** `GestureHandlerRootView` **já** envolve toda a árvore do app (`App.js:57`) e `react-native-gesture-handler` **já** é a primeira importação (`App.js:1`). Portanto **não há mudança de raiz a fazer** para o traçado — o risco de "registrar o RootView" está **de fato mitigado**; resta apenas validar `Gesture.Pan` dentro de uma tela de jogo. Ver o Plano.

## 2.2 Redefinição do P4 — concepção sem imagem (APROVADA; supersede §2.1.2)

Após 2 reprovações do Portão Visual 1, o proprietário redefiniu a **concepção central**:

1. **Sem imagem por palavra.** A atividade **não** exibe figura/ilustração da palavra. **Nenhum asset de imagem** é necessário ao funcionamento principal. Remove-se a obrigação (§10.2/§17/§22) de mostrar uma imagem representando cada palavra. `imageRef` deixa de ser requisito de jogabilidade — vira **metadado opcional futuro** (álbum), podendo ser `null`.
2. **A PALAVRA é o herói visual.** Palavra grande e central, letras claramente separadas, **lacunas grandes e animadas**, peças de letra próximas. A palavra **nunca** fica pequena/secundária; **proibida** a quebra em duas linhas (salvo decisão documentada), com **redução progressiva de tamanho** para palavras longas mantendo a legibilidade.
3. **Beni é o personagem visual central** e o guia pedagógico, presente em toda a experiência (entrada, início da palavra, 1º erro, 2º erro, Resgate, acerto, combo, tempo acabando, fim). **Beni nunca diz "Olhe para a figura"** (não há figura).
4. **Acentos e Ç passam a ser SUPORTADOS na atividade de COMPLETAR** (supersede a decisão anterior de `enabled:false`): palavras acentuadas/Ç **entram** no jogo (sobretudo no Difícil), com **cartões de letra acentuada/Ç** na bandeja. A **normalização interna** (`normalizedWord`) segue existindo só para lógica e **não** remove a grafia correta exibida (`displayWord`/`letters`). Apenas o **traçado** dessas letras (Bloco P8+) permanece separado/futuro.
5. **Tempo real reutilizando o jogo dos Pares** (não uma imitação parcial): mesmo contrato de contador, borda vermelha nas **bordas externas da experiência**, som de relógio, limpeza ao sair e comportamento de bônus (ver §8.1 e o Plano §7-timer).
6. **Combo por acertos consecutivos** e **escalada de erro** (1º/2º/3º) com consequências de jogo não-agressivas (ver §5R).

O protótipo P4 atual **fica reprovado e não será commitado**. A reconstrução é o **P4R** (plano/tasks).

---

## 3. Narrativa

O **Livro Mágico de Palavrinhas do Beni** perdeu algumas letras. A cada página, a criança ajuda o Beni a reconstruir uma palavra (COMPLETE/MONTE) e a registrá-la de novo passando o dedo pelo contorno (TRACE). Ao concluir, a página ganha cor, a palavra brilha, a imagem se anima e uma estrela entra no marcador. Três palavras seguidas sem Resgate formam uma **Sequência Brilhante**.

---

## 4. Fluxo completo da partida

1. Seleção de dificuldade (Fácil/Médio/Difícil).
2. Beni abre o Livro (animação de abertura).
3. **Geração integral do plano** (`planPartida` com seed) → **imutável** a partir daqui.
4. Apresentação da imagem da palavra + espaços.
5. Atividade de raciocínio (COMPLETE ou MONTE, conforme o plano).
6. Validação de letra (a cada toque).
7. Traçado curto (TRACE — subconjunto de letras/trecho, não a palavra inteira sempre).
8. Celebração da palavra.
9. Próxima página.
10. Rodadas de **reforço** ao final, quando a fila exigir (até 2 extras).
11. Resultado.
12. Jogar novamente (nova seed, continua o deck) **ou** trocar dificuldade (volta à seleção).

**Invariantes:** plano imutável após o início; nenhuma animação libera sozinha um estado crítico; todos os timers/animações canceláveis; toque duplicado bloqueado em transições.

---

## 5. Forma de "derrota" pedagógica (brilhos e Resgate)

Cada palavra começa com **3 brilhos**.

**1ª tentativa incorreta:** a letra balança suavemente → volta à bandeja → som suave (não agressivo) → Beni acolhedor → mensagem tipo "Quase! Vamos olhar outra vez." (−1 brilho no máximo alcançável se for erro; ver regra de brilho).

**2ª tentativa incorreta:** o espaço correto recebe brilho discreto → opções claramente incompatíveis podem ser suavemente reduzidas → orientação curta do Beni → a criança continua escolhendo.

**3ª tentativa incorreta → Resgate da Palavra:** Beni ilumina a letra correta com a "lanterna"; **a criança ainda toca/posiciona** (nunca preenche sozinho); a palavra recebe **no máximo 1 brilho**; a sequência de acertos independentes **reinicia**; a palavra entra na **fila de reforço** (retorna após 2–3 rodadas, em forma mais simples). Mensagem: **"Vamos treinar esta palavrinha mais uma vez!"** — nunca "perdeu".

**Regra de brilho (determinística, pura):** `brilho(palavra) = 3 − min(2, errosContados>0?1:0 + dicasLeves>0?1:0) ` limitado a `1` se houve Resgate. Ou seja: 3 (limpo) · 2 (1 erro OU 1 dica) · 1 (Resgate). Erros/dicas adicionais não descem abaixo de 1.

---

## 6. Estrutura da partida e distribuição

| Modo | Palavras principais | Reforço extra | COMPLETE | MONTE | Traçado por palavra | Opções | Distratores |
|---|---|---|---|---|---|---|---|
| **Fácil** | 5 | até 2 | ~70% | ~30% (simples) | 1 letra | até 3 | poucos |
| **Médio** | 7 | até 2 | ~40% | ~60% | 1–2 letras | — | até 1 |
| **Difícil** | 10 | até 2 | ~20% | ~80% | 2 letras / sílaba / trecho | — | 1–2 |

Regras transversais: Fácil = 1–2 letras ausentes, instruções visuais fortes; Médio = palavras parcial/totalmente vazias, dicas graduais, letras repetidas possíveis; Difícil = palavras maiores, menos espaços pré-preenchidos, letras repetidas, acentos/Ç **só com infra validada**, **sem reduzir área de toque**. **Não** traçar a palavra longa inteira toda rodada; pode haver **uma palavra especial** ao final para um traçado maior.

A distribuição de atividades é **por proporção-alvo com sorteio determinístico** (o baralho respeita a proporção sem repetir o mesmo tipo em excesso — §13).

---

## 7. Diretor de dificuldade adaptativa (interno, não troca o modo)

**Sinais de domínio:** 3 palavras independentes seguidas · poucos erros recentes · nenhuma dica · traçados sem repetição excessiva.
**Ajustes ao domínio:** +1 distrator · preencher menos espaços · priorizar MONTE · aumentar o trecho de traçado · padrão de letras um pouco mais complexo.

**Sinais de dificuldade:** 2 Resgates próximos · muitos erros seguidos · uso repetido de dicas · repetições no traçado.
**Ajustes de apoio:** −1 distrator · preencher a 1ª letra · reduzir espaços ausentes · priorizar COMPLETE · encurtar traçado · destacar o 1º espaço · orientação do Beni antes da tentativa.

**Página Tranquila:** com **2 Resgates consecutivos**, a próxima página é curta/familiar, com maior apoio, para recuperar a confiança (Beni em pose calma).

**Invioláveis:** nunca reduzir tamanho de botão/letra para dificultar; o ajuste altera **conteúdo/apoio**, nunca a acessibilidade; o Diretor é **puro** (recebe métricas da sessão, devolve um "perfil de ajuste") e é aplicado **no momento de montar cada página**, sem mudar o plano já servido.

> **Nota de arquitetura:** o Diretor recomenda ajustes **dentro do envelope do plano imutável** (ex.: quantos espaços preencher, quantos distratores mostrar) — parâmetros de *apresentação da página*, não a identidade da palavra/atividade, que já está fixada no plano. Assim preserva-se "plano imutável após o início" **e** a adaptação.

---

## 8. Animações e respostas visuais

Especificação (todas curtas, canceláveis, com fallback sem animação — §20):

- **Entrada da partida:** Beni entra suave → livro abre → páginas brilham → 1ª imagem aparece.
- **Entrada da palavra:** imagem surge com leve escala → espaços aparecem em sequência → letras entram na bandeja → Beni dá a instrução.
- **Letra correta:** leve salto → move ao espaço → pequeno brilho → som curto (`match_success`) → espaço preenchido sem atraso.
- **Letra incorreta:** oscilação pequena → retorno imediato à bandeja → **sem X vermelho / sem flash vermelho** → Beni acolhedor.
- **Resgate:** Beni "lanterna" → feixe suave até a letra → letra pulsa → criança toca.
- **Traçado:** caminho percorrido recebe cor → estrelinhas seguem o dedo → progresso ilumina próximos pontos → não-percorrido continua pontilhado → ao concluir, brilho completo da letra.
- **Palavra concluída:** salto coordenado das letras → brilho → imagem se movimenta → página restaurada → Beni comemora (`board_complete`).
- **Sequência Brilhante:** trilha de estrelas → reação especial do Beni → celebração curta, sem cortar o ritmo.
- **Resultado:** livro fecha → páginas viram cartões → estrelas entram no resumo → mensagem final (`classic_victory_jingle`).

**Regras técnicas:** nenhuma animação bloqueia interação permanentemente; callbacks tratam cancelamento; timers cancelados no unmount; toque duplo bloqueado em transição; suporte a movimento reduzido; jogo compreensível **sem** animações.

**Base técnica disponível:** RN `Animated` (padrão do app; ex. pulse em `BeniGuideOverlay`), `expo-haptics`, `react-native-svg` p/ o corredor, `lottie-react-native` instalado (uso opcional futuro; **não** adotar nesta etapa). **Não** há helper de bounce/pulse compartilhado — criar um util pequeno e reutilizável.

---

## 9. Áudio (sem dependência por palavra, sem TTS)

Reuso direto de `audioManager` (expo-audio). Mapa de sons recomendado:

| Evento | Chave existente |
|---|---|
| Toque em letra/tile | `card_flip` (ou `playUiSound('tap')`) |
| Letra correta | `match_success` |
| Tentativa incorreta | `match_error` |
| Palavra concluída | `board_complete` |
| Sequência Brilhante | `playUiSound('reward')` ou `game_victory` |
| Resultado | `classic_victory_jingle` (ou `turbo_result_jingle`) |
| Botões | `SoundButton` (`tap`/`success`/`reward`) |

Frases genéricas do Beni: **texto** via `src/data/beniLines.js` + `BeniGuideBubble`/`BeniSpeechCard` (hoje **sem áudio**; `hasBeniLineAudio=false`). Prefs `soundsEnabled` (`@ptf_audio_prefs_v1`) já respeitadas por `playGameSfx`/`playUiSound`.

**Não existe** e **não será adicionado nesta etapa:** TTS/`expo-speech` (não instalado), gravação por palavra, som fonético por letra (evitar por ambiguidade pedagógica). Opção **futura**: nomes de letras gravados uma única vez (bloco isolado, sem dependência nativa nova).

Lifecycle: `preloadGameSfx([...])` no mount, `releaseGameSfx()` no unmount (padrão da Ovelhinha).

---

## 10. Banco inicial de palavras + estrutura de dados

### 10.1 Estrutura conceitual (por palavra)

```
{
  id,                    // 'sol', 'ovelha' — único
  word,                  // 'SOL' (maiúsculas, canônica)
  displayWord,           // 'SOL' — preserva acentos p/ exibição ('LEÃO','CORAÇÃO')
  normalizedWord,        // 'LEAO' — SÓ p/ lógica; NUNCA some da tela a informação visual
  letters,              // ['S','O','L'] cartões canônicos exibidos (preserva Ç/acento)
  letterInstances,      // [{iid:'l0',ch:'S',pos:0},{iid:'l1',ch:'O',pos:1},...] — 1 por OCORRÊNCIA
  syllables,            // ['SOL'] / ['O','VE','LHA']
  difficulty,           // 'facil'|'medio'|'dificil'
  category,             // 'animais'|'natureza'|'objetos'|'alimentos'|'familia'|'biblia'|'app'
  imageRef,             // chave de asset (status EXISTE/NOVO — §10.3); NUNCA require inexistente
  enabled,              // true|false
  activityEligibility,  // { complete:true, monte:true, trace:true }
  missingPatterns,      // padrões de lacunas válidos por atividade (ex.: [[1]], [[0,2]], [ALL])
  distractors,          // letras distratoras candidatas (por dificuldade)
  focusLetters,         // letras candidatas ao traçado
  traceTargets,         // ids de letras/sílabas com geometria de traçado disponível
  accentRules,          // { hasAccent, accentChars:['Ã'], introducedAt:'dificil' }
  confusableLetters,    // ['B','D'] p/ evitar distratores enganosos
  reinforcementPatterns // formas simplificadas no reforço (ex.: 1 lacuna, 2 opções)
}
```

**Letras repetidas — regra dura:** cada **ocorrência** é uma **instância própria** (`letterInstances[].iid`), não só o caractere. `OVELHA` não tem repetição; `ARARA` tem 3×A e 2×R → 5 instâncias distintas. Validação, montagem e "desfazer" operam por `iid`, não por `ch`.

**Acentos/Ç:** `displayWord`/`letters` **preservam** o glifo visual; `normalizedWord` existe só para lógica e **não** substitui a exibição. `Ç` é caractere próprio na interface. `Á/É/Í/Ó/Ú/Â/Ê/Ô/Ã/Õ` podem exigir cartões próprios conforme a palavra. **Introdução progressiva:** acentos/Ç só entram no **Difícil** e **só** quando `accentRules.introducedAt` e a infra de cartões acentuados estiverem validadas (Bloco 3.9+).

**Dígrafos (LH/NH/CH/RR/SS/QU):** tratados como **duas letras** na bandeja (a criança monta letra a letra); o `displayWord` mantém a grafia. `OVELHA` = O·V·E·L·H·A (o "LH" não é um cartão único na v1).

### 10.2 Banco inicial proposto (36 palavras · 12/12/12)

> Proposta de conteúdo. Nenhuma imagem é registrada no runtime aqui. `IMG` = status do asset: **★avatar** (reuso de `assets/avatar/*`), **novo** (produção necessária).

**Fácil (12)** — 3–5 letras, sem acento/Ç/dígrafo, ≤3 opções, 1–2 lacunas:

| # | Palavra | Categoria | IMG |
|---|---|---|---|
| 1 | SOL | natureza | novo |
| 2 | LUA | natureza | novo |
| 3 | BOLA | objetos | novo |
| 4 | PATO | animais | novo |
| 5 | GATO | animais | novo |
| 6 | CASA | objetos | novo |
| 7 | UVA | alimentos | novo |
| 8 | BOLO | alimentos | novo |
| 9 | REI | bíblia | novo |
| 10 | ARCA | bíblia | ★avatar (ark) |
| 11 | PEIXE | animais | ★avatar (fish) |
| 12 | MEL | alimentos | novo |

**Médio (7 na partida; 12 no banco)** — 5–6 letras, dígrafos LH/NH/CH, sem acento/Ç, até 1 distrator:

| # | Palavra | Categoria | IMG |
|---|---|---|---|
| 13 | OVELHA | animais/bíblia | ★avatar (sheep) |
| 14 | POMBA | bíblia | ★avatar (dove) |
| 15 | ESTRELA | natureza/bíblia | ★avatar (star) |
| 16 | CAVALO | animais | novo |
| 17 | CHUVA | natureza | novo |
| 18 | GALINHA | animais | novo |
| 19 | COELHO | animais | novo |
| 20 | BONECA | objetos | novo |
| 21 | SAPATO | objetos | novo |
| 22 | BANANA | alimentos | novo |
| 23 | IGREJA | app/bíblia | novo |
| 24 | CHAVE | objetos | novo |

**Difícil (10 na partida; 12 no banco)** — maiores, letras repetidas, acentos/Ç quando validado, 1–2 distratores:

| # | Palavra | Categoria | IMG | Observação |
|---|---|---|---|---|
| 25 | LEÃO | animais/bíblia | ★avatar (lion) | Ã (introdução) |
| 26 | CORAÇÃO | família/fé | novo | Ç + Ã |
| 27 | ARARA | animais | novo | 3×A, 2×R (instâncias) |
| 28 | ELEFANTE | animais | novo | repetida E |
| 29 | BORBOLETA | natureza | novo | repetida O/B |
| 30 | MACACO | animais | novo | repetida A/C |
| 31 | PÁSSARO | animais | novo | Á + SS |
| 32 | CAMINHÃO | objetos | novo | Ã + NH |
| 33 | TARTARUGA | animais | novo | repetida A/T/R |
| 34 | AVIÃO | objetos | novo | Ã |
| 35 | FAMÍLIA | família | novo | Í + repetida |
| 36 | GIRAFA | animais | novo | reserva |

Reuso *candidato* hoje: **6 palavras** (ARCA, PEIXE, OVELHA, POMBA, ESTRELA, LEÃO) via `assets/avatar/*` — **avaliadas no Portão Visual 2**. **30 palavras exigem arte nova obrigatória**; com as substituições das candidatas reprovadas, a **produção final é de 30 a 36 imagens novas** (§2.1.2). Critério das imagens: objeto único, claro, não-ambíguo, singular, sem nome alternativo comum, fundo neutro, **padrão visual único do app** (decisão do Portão 1 — sem flashcard novo).

### 10.3 Estados de habilitação

Uma palavra só é **elegível** quando: `enabled=true`, `imageRef` aponta para asset **existente** no runtime, e — para TRACE — todas as `focusLetters`/`traceTargets` têm geometria disponível. Palavras acentuadas/Ç ficam `enabled=false` até a infra de acentos entrar. **Nunca registrar `require` de asset inexistente** (o validador do banco reprova).

---

## 11. Traçado guiado (TRACE)

### 11.1 Auditoria de infraestrutura

- **Colorir/Canvas:** `ColoringCanvas.js` (WebView + `<canvas>` flood-fill) e `AtelierCanvas.js` (WebView, polilinhas + carimbos). Pipeline de toque→pixel (DPR/zoom/pan) maduro, mas **dentro do WebView**.
- **SVG:** `react-native-svg@15.12.1`; único `<Path>` real = `MapPath.segPath` (gera `d` bézier). **Não** há dados de glifo/letra, **nem** `getPointAtLength` (react-native-svg não expõe amostragem de path no JS).
- **Gestos:** `react-native-gesture-handler@2.28.0` instalado, **não** usado para desenho; nenhum `PanResponder` de arrasto. Ovelhinha usa toques discretos (`Pressable` + `nativeEvent.locationX/Y`).
- **Coordenadas:** `computeViewport`/`contentRect`/`artToPx`/`pxToArt` (puros, testados) — reutilizáveis para mapear a letra (definida em canvas de design fixo) ↔ pixels da tela.
- **Fontes:** `FredokaOne`/`Fraunces` renderizam maiúsculas grandes (só raster; **não** dá para extrair contorno vetorial em runtime).

### 11.2 Solução recomendada (nativa, sem WebView, sem lib nova)

Renderizar a letra e o corredor com **`react-native-svg` `<Path>`** (idioma `MapPath.segPath`), captar o dedo com **`react-native-gesture-handler` `Gesture.Pan`** (ou `onResponderMove` como fallback), e validar com **matemática pura** (módulo dependency-free, testável no smoke).

**Modelo de letra (autoral, por letra maiúscula):**

```
{
  ch:'A',
  strokes:[ { points:[{x,y},…], // polilinha em canvas de design (ex.: 100×140)
              checkpoints:[i0,i1,…] } ], // índices ordenados a percorrer
  startPoint:{x,y},              // ponto inicial (mão sugerida)
  corridor:{ width:number },     // largura tolerante (adaptada ao tamanho da tela)
  order:[strokeIdx…]             // ordem dos segmentos
}
```

**Critério de validação (tolerante, sem estética):**
1. Entrada próxima ao `startPoint` (raio de tolerância).
2. Passagem pelos `checkpoints` **em ordem**.
3. Permanência aproximada no corredor (distância ponto→polilinha ≤ `corridor.width/2`, com tolerância a saída momentânea de N frames).
4. **Cobertura mínima** (fração de pontos amostrados da polilinha "visitados" dentro da tolerância) ≥ limiar (ex.: 80%).
5. **Nunca** avaliar caligrafia/beleza.
6. Reinício a qualquer momento; alternativa de **movimento reduzido** (§20): concluir por toques sequenciais nos checkpoints, sem exigir arrasto contínuo.

**Matemática pura a construir** (`src/services/tracadoService.js`, dependency-free): `distanciaPontoSegmento`, `distanciaPontoPolilinha`, `amostrarPorComprimento(polilinha, passo)`, `checkpointsEmOrdem(percurso, checkpoints, tol)`, `coberturaPct(percurso, amostras, tol)`, `tracadoConcluido(...)`. Tudo determinístico e testável via `new Function` no smoke.

### 11.3 Protótipo técnico isolado — SOMENTE A, O, L (decisão do Portão 1)

O **primeiro** trabalho de traçado é um **protótipo técnico isolado** (sem integração ao jogo), usando **apenas as letras A, O e L** — uma reta composta+diagonal (A), uma curva fechada (O) e um traço em L (retas). Ele valida os 10 critérios (a–j) de §2.1.7 e **só** após aprovado em **aparelho real** (🚦 Portão Técnico de Traçado) a expansão é liberada.

**Expansão posterior (pós-portão):** vogais e traços simples restantes (E, I, U, S, T, C, P), depois o restante do alfabeto (B, D, G, M, N, R, V, H, F, J, Z, Q, X, K, W, Y) com tratamento de confundíveis. Acentos/Ç e cartões acentuados em bloco próprio, no **Difícil**, só após infra validada.

A geometria oficial de cada letra é **autoral** (polilinhas + checkpoints em canvas de design), **independente de qualquer fonte raster** (critério (j)); a fonte só serve como referência visual opcional, nunca como fonte da geometria.

---

## 12. Dicas (graduais, não pontuam, não avançam)

| Nível | Efeito |
|---|---|
| 1 | Destacar o espaço da próxima letra |
| 2 | Fazer a letra correta pulsar suavemente |
| 3 | Remover uma letra distratora |
| 4 | Beni ilumina a letra correta |
| 5 | Posicionar uma letra **com participação** da criança |

Regras: não pontuam; não avançam a rodada; não bloqueiam; **reduzem o brilho máximo** progressivamente (1 dica leve → teto 2 brilhos); canceladas ao trocar de rodada; sem timers órfãos; nunca revelam a palavra inteira de uma vez. Fácil: dica leve **automática** após período sem interação; Médio/Difícil: botão de dica liberado após alguns segundos. **Sem cronômetro visível / sem pressão por velocidade.**

---

## 13. Rejogabilidade (reuso do modelo da Ovelhinha)

Primitivas copiadas verbatim: `seed` de sessão, `planId`, plano imutável, baralho sem repetição prematura, histórico recente, alternância, simulação no Modo Criador, reprodutibilidade.

Regras específicas de palavras:
1. Nenhuma palavra repete antes de esgotar as elegíveis do ciclo.
2. Evitar palavras da **mesma categoria** em sequência.
3. Evitar repetir o mesmo **tipo de atividade** muitas vezes seguidas.
4. Evitar repetir o mesmo **padrão de lacunas** (`missingPatterns`).
5. Palavras com Resgate podem retornar como **reforço** (fila, não imediato).
6. Palavras concluídas de forma independente **não** retornam imediatamente.
7. "Jogar novamente" gera outra sequência (nova seed, deck continua).
8. "Trocar dificuldade" volta à seleção.
9. Plano não muda durante a partida.
10. Mesma seed + mesmo histórico/deck inicial → mesmo plano (determinismo).

**Contrato:** `planPartida({ rng, dificuldade, words, rounds, deckState }) → { plano, deckState, planId }`, onde cada item do plano = `{ wordId, activity, missingPattern, traceTarget, category }`. A fila de reforço é derivada **em execução** (não faz parte do plano imutável) e é anexada como **até 2 páginas extras** ao final.

---

## 14. Domínio da palavra (especificado, não implementado na v1)

Estados: **Nova → Em aprendizagem → Reconhecida → Dominada.**
- Conclusão com Resgate: continua **Em aprendizagem**.
- Conclusão com dica: progresso **parcial**.
- Conclusão independente: progresso **completo**.
- 2–3 conclusões independentes em **sessões diferentes**: **Dominada**.

Persistir isso exige **nova chave protegida** (`@ptf_palavrinhas_words_v1`) → **não criar sem aprovação**; auditar as abstrações existentes e deixar para **bloco isolado**. Na v1, o domínio pode existir **em memória de sessão** (como o histórico do deck) sem persistência entre reinícios, e o modelo persistente é documentado para o bloco futuro.

---

## 15. Máquina de estados (pura, testável)

Fases: `SELECIONANDO_DIFICULDADE → PREPARANDO_SESSAO → ABRINDO_LIVRO → APRESENTANDO_PALAVRA → PENSANDO → VALIDANDO_LETRA → (RESGATANDO) → PREPARANDO_TRACADO → TRACANDO → VALIDANDO_TRACADO → CELEBRANDO → (PREPARANDO_REFORCO) → TROCANDO_PAGINA → FINALIZADO`.

Somente **`PENSANDO`** e **`TRACANDO`** aceitam entrada do jogador (análogo a `FASES_QUE_ACEITAM`). Toda função é pura: `(estado, evento) → { estado, efeitos }`.

- **Eventos:** `ESCOLHER_DIFICULDADE`, `SESSAO_PRONTA`, `LIVRO_ABERTO`, `PALAVRA_PRONTA`, `TOCAR_LETRA{iid|opcao}`, `DESFAZER`, `PEDIR_DICA`, `RESGATE_CONCLUIDO`, `TRACADO_PRONTO`, `PONTO_TRACADO{px,py}`, `TRACADO_OK`, `TRACADO_REINICIAR`, `PALAVRA_CONCLUIDA`, `PROXIMA_PAGINA`, `ABANDONAR`.
- **Guards:** aceitar toque só em `PENSANDO`; aceitar ponto só em `TRACANDO`; comparar **`iid`/id**, nunca índice de array; recusar evento fora de fase (retorna 0 efeitos) → **anti-duplo-toque**.
- **Timers:** dica automática (Fácil), liberação de botão de dica (Médio/Difícil), auto-avanço pós-celebração — **todos cancelados no unmount e ao trocar de rodada**.
- **Efeitos (tokens que a tela interpreta):** `SOM_LETRA_OK`, `SOM_LETRA_ERRO`, `SOM_PALAVRA`, `SOM_SEQUENCIA`, `SOM_RESULTADO`, `VIBRAR_OK`, `AGENDAR_DICA`, `AGENDAR_PROXIMA`, `ENTRAR_RESGATE`, `ENFILEIRAR_REFORCO`, `FINALIZAR`.
- **Estado de rodada:** palavra, atividade, lacunas, bandeja (`letterInstances` restantes), preenchidos por `iid`, erros, dicas usadas, brilho corrente, fase de traçado.
- **Estado de sessão:** plano imutável, índice, seed, planId, contadores (independentes/dica/Resgate/reforço), maior sequência, fila de reforço, perfil do Diretor adaptativo.
- **Regra dura:** nenhuma **animação** libera sozinha um estado crítico (transições vêm de eventos de lógica); a lógica pura **não** depende de tempo real nem da interface.

---

## 16. Interface

**Cabeçalho:** voltar · título · progresso (página X/N) · brilhos da palavra · sequência atual · dificuldade discreta (respeita a faixa do Modo Criador, como na Ovelhinha).
**Área principal:** livro/página · imagem · palavra e espaços · área de instrução.
**Área inferior:** bandeja de letras · **desfazer** · **dica** · (instrução sonora, quando aplicável) · Beni com balão curto.
**Traçado:** área ampla · letra central · caminho pontilhado · ponto inicial · tentar novamente · instrução.
**Resultado:** livro completo · resumo de palavras (cartões) · estrelas · independentes/dicas/Resgates · maior sequência · jogar novamente · trocar dificuldade · voltar.

Respeitar: Safe Area (insets manuais, padrão do projeto), faixa do Modo Criador, navegação inferior, telas pequenas/altas, iPhone/Android, orientação definida pelo app, tamanho mínimo de toque, contraste, texto ampliado sem quebrar layout. Tokens de `productTheme` (ação da criança = `beni`/laranja; Modo Criador/diagnóstico = `purple`).

---

## 17. Reações do Beni (só poses existentes; gaps = plano de produção)

Registro real (`src/assets/mascot/beniImages.js`, 7 poses): `avatarBase, acenando(waving/happy), celebrando, comBau, ensinando(teaching/thinking), orando(praying), atelie`.

| Reação | Cobertura | Status |
|---|---|---|
| Recebendo | `acenando` | ✅ existe |
| Pensando | `ensinando` (+badge 💭) | ✅ reuso (sem arte própria) |
| Incentivando | `ensinando` | ✅ reuso |
| Letra correta | `celebrando` | ✅ existe |
| Erro acolhedor | **wire `09_beni_descansando`** (órfão) | ✅ decidido (Portão 1) — sem arte nova |
| Resgate / dica / reforço | **wire `10`/`11_beni_apontando`** (órfão) + **lanterna = composição de UI** (brilho/foco/microanimação) | ✅ decidido (Portão 1) — sem arte nova |
| Palavra concluída | `celebrando` | ✅ existe |
| Sequência | `celebrando` (opção: wire `08_celebrando_2` p/ variar) | ✅/parcial |
| Página Tranquila | `09_descansando` (mesmo wire do acolhimento) ou `orando` | ✅ |
| Resultado | `avatarBase`/`celebrando` | ✅ existe |

**Plano Beni (decisão do Portão 1 — sem arte nova na v1):** (1) **registrar os órfãos** `09_beni_descansando`, `10_beni_apontando_direita` e `11_beni_apontando_esquerda` em `src/assets/mascot/beniImages.js` — **isto acontece no Bloco P9** (commit de assets próprio, imediatamente antes do primeiro uso; não altera as 7 chaves atuais, apenas acrescenta). Os órfãos **já existem no disco** e **não dependem** da produção das imagens das palavras (Bloco P13); (2) usar `09` para **acolhimento após erro** e **Página Tranquila**; usar `10`/`11` para **dicas, reforço e Resgate**; (3) **lanterna do Resgate = composição de interface** (halo/brilho/foco/microanimação ao redor da pose "apontando"), **sem exigir arte nova** do Beni; (4) "pensando" segue reusando `ensinando`; blocos anteriores ao P9 (P4/P6/P7) usam **apenas as 7 poses já registradas**. **O P13 não tem nenhuma responsabilidade sobre poses do Beni.** **Nunca** registrar `require` inexistente — as poses vêm sempre de `BENI_IMAGES`.

---

## 18. Modo Criador (dev-only, sob `isInternalToolsEnabled()`)

Inspetor de palavras + controles de sessão (nunca em produção; funções administrativas seguem no Dev Client):

Seleção de palavra/dificuldade/atividade; **forçar** Complete/Monte/Trace/Resgate/Página Tranquila; **mostrar** resposta/letras corretas/distratores/`missingPatterns`/`traceTargets`/estado da máquina/dificuldade adaptativa/seed/planId/fila de reforço; pular rodada; **testar sem consumir progresso**; **simular partidas** (§19); **validar** banco de palavras/imagens/áudios/caminhos de traçado; alternar tela pequena/grande; alternar movimento reduzido; **simular** erros consecutivos / criança de alto domínio / criança com dificuldade; exibir timers e callbacks pendentes.

Molde: `OvelhaAssetGalleryScreen` (`AssetCard` + `SpotInspector` + `SimuladorPartidas`), com o contrato **"não consome rodada / não salva progresso / não concede estrela"**.

---

## 19. Simulador de sessões (dev)

Simula (sem tocar progresso): alto domínio · desempenho médio · usa dicas · precisa de Resgate · erros consecutivos · traçados com várias tentativas · Fácil/Médio/Difícil · jogar novamente N vezes (encadeando `deckState`).

Resumo: palavras usadas · atividades usadas · categorias · erros · dicas · Resgates · reforços · alterações adaptativas · estrelas · sequências · repetições · duração estimada · estado final · **timers pendentes** · **callbacks pendentes**.

Molde: `SimuladorPartidas` (loop de `planPartida` encadeando `deckState`, tally de repetição/cobertura, marca ↺). Acrescentar perfis de "comportamento da criança" (funções puras que decidem erros/dicas/Resgates simulados de forma determinística por seed).

---

## 20. Acessibilidade

Área mínima de toque (≥ o piso usado na Ovelhinha; **nunca** reduzir por dificuldade) · contraste · letras grandes · fonte infantil legível (`FredokaOne`/`Fraunces`) · espaçamento · diferenciar letras semelhantes · **movimento reduzido** (traçado por toques sequenciais; animações desligáveis) · alternativa sem áudio (o jogo é compreensível só no visual) · uso com uma mão · crianças que ainda não leem (imagem + Beni guiam) · dificuldades motoras (corredor tolerante) · atenção (páginas curtas, sem pressão) · tolerância no traçado · sem pressão por tempo · sem punição pública · **cor nunca é o único indicador** (forma + posição + brilho) · feedback visual **e** sonoro combinados · linguagem simples · botões com **texto e ícone** · repetir instrução.

Confusões a tratar (distratores nunca as exploram de forma enganosa; e o Diretor não as conta como "falta de esforço"): **B/D, P/B, M/N, F/T, C/G, O/Q, I/L** (campo `confusableLetters`).

---

## 21. Plano de testes (smoke + focados)

Bloco novo `── Palavrinhas do Beni ──` em `scripts/smoke.js`, seguindo o padrão de eval de módulo puro. Cobrir os 60 itens exigidos, agrupados:

**Banco/dados (1–13):** ids únicos; banco válido; palavra↔dificuldade; categorias válidas; imagens válidas (só assets existentes); **nenhum asset inexistente**; letras repetidas por `iid`; acentos; Ç; dígrafos; distratores válidos; `missingPatterns` válidos; `traceTargets` válidos.

**Baralho/plano (14–19):** sem repetição prematura; alternância de categorias; alternância de atividades; seed determinística; planId determinístico; plano imutável.

**Atividades/erros (20–34):** Complete; Monte; Desfazer (por `iid`); letra correta; letra incorreta; 1º/2º/3º erro; Resgate; fila de reforço; Página Tranquila; brilhos (3/2/1); sequência; pontuação única (`addBonusStars` chamado exatamente 1×); dicas (não pontuam/não avançam/reduzem brilho).

**Adaptativo/traçado (35–46):** Diretor p/ cima; Diretor p/ baixo; traçado válido; traçado incompleto; traçado fora do corredor; reinício; tolerância; movimento reduzido; cancelamento de animações; cancelamento de timers; limpeza no unmount; bloqueio de toque duplicado.

**Resultado/fluxo (47–54):** resultado Fácil/Médio/Difícil; rodadas de reforço; jogar novamente; trocar dificuldade; Modo Criador isolado (regex: rota/gallery só sob gate; sem `consumeRound`/`addBonusStars`); simulador (não consome/não salva).

**Regressão (55–60):** Safe Area; tela pequena; tela grande; regressão dos jogos existentes; **regressão de "Cadê a Ovelhinha?"** (todos os checks 2.2e/2.2f permanecem verdes); regressão do restante do app (smoke total verde).

Regex sobre fonte (padrão do smoke): card branch em `BrincarScreen.js`, `isInternalToolsEnabled() && <Stack.Screen>` em `AppNavigator.js`, `PALAVRINHAS_DO_BENI` em `routes.js`, ícone `palavrinhas` em `FaithIcon.js`, único `addBonusStars(` na tela.

Gates por bloco: `npm run smoke` verde · `npx expo-doctor` verde · `npx expo install --check` · `git diff --check`. Validação visual/física no iPhone do Eduardo para toque/traçado/animações.

---

## 22. Plano de assets

| Categoria | Existe | Falta (produção) | Bloco |
|---|---|---|---|
| **Imagens de palavra** | 6 candidatas (avatar: ark/fish/sheep/dove/star/lion) — **avaliadas no Portão Visual 2** | **30 obrigatórias** + **0–6 substituições** = **30–36 novas** (padrão único do app); **manifesto 36/36** (reutilizada/substituída/criada) | **P13** (após Lista de Imagens aprovada) |
| **Beni (poses)** | 7 poses wired | **registrar 3 órfãos** (`09_descansando`, `10`/`11_apontando`) — **acrescenta chaves**; **lanterna = composição de UI**; **nenhuma arte nova de Beni** | **P9** (NÃO no P13) |
| **Áudio** | sfx compartilhados (`match_success/error`, `board_complete`, jingles) | nenhum obrigatório; opcional futuro: nomes de letras | — |
| **Letras (traçado)** | nenhuma geometria | polilinhas+checkpoints: **A/O/L** (protótipo isolado) → alfabeto (progressivo) | P5 → P8 |
| **Diretório** | — | `assets/games/palavrinhas_do_beni/` (bloco de assets, auditoria própria) | P13 |

Regras de assets do projeto: `git add` seletivo, auditoria por lote, nada de `require` inexistente, WebP/tamanho avaliados antes de versionar.

---

## 23. Divisão em blocos (SDD; cada um = 1 commit atômico)

Cada bloco traz: **Escopo · Fora de escopo · Arquivos previstos · Critérios de aceite · Testes · Gates · Validação manual · Riscos · Dependências · Condições para commit.**

- **3.1 — Auditoria e contrato de dados.** *Escopo:* esta spec + contrato de dados (§10) + tipos conceituais. *Fora:* código de runtime. *Arquivos:* `specs/009-…` (este doc). *Aceite:* Portão 1 aprovado. *Commit:* doc de governança isolado.
- **3.2 — Banco inicial, validador, seed e baralho.** *Arquivos:* `src/data/palavrinhasWords.js`, `src/services/palavrinhasGameService.js` (copiar primitivas puras + `validarBanco`/`planPartida` de palavras). *Aceite:* validador 0 problemas; determinismo/planId; alternância. *Testes:* itens 1–19. *Fora:* UI, máquina.
- **3.3 — Máquina de estados + serviço puro.** *Arquivos:* `src/services/palavrinhasGameMachine.js`. *Aceite:* transições/guards/efeitos; anti-duplo-toque; sem dependência de tempo/UI. *Testes:* 20–34 (parte lógica).
- **3.4 — Tela base, seleção de dificuldade, apresentação.** *Arquivos:* `src/screens/PalavrinhasDoBeniScreen.js`, `routes.js`, `AppNavigator.js`, `BrincarScreen.js` (branch). *Aceite:* rota dev-gated; card "Em teste"; abertura do livro; imagem+espaços. *Testes:* 47–49 (fluxo base), 55–57.
- **3.5 — Atividade COMPLETE.** *Aceite:* tocar a letra certa preenche; erro volta à bandeja. *Testes:* 20, 23–25.
- **3.6 — Atividade MONTE + desfazer.** *Aceite:* montar por `iid`; desfazer última. *Testes:* 21–22.
- **3.7 — Erros, brilhos, dicas, Resgate, reforço.** *Aceite:* 1º/2º/3º erro; Resgate com participação; brilho 3/2/1; fila de reforço; dicas não pontuam/reduzem brilho. *Testes:* 26–34.
- **3.8 — Protótipo de traçado ISOLADO (somente A, O, L).** *Arquivos:* `src/services/tracadoService.js` (puro), `src/data/letterPaths.js` (**A/O/L**), tela dev SVG + `Gesture.Pan`. *Aceite:* critérios a–j (§2.1.7); corredor/cobertura/checkpoints; reinício; movimento reduzido. *Testes:* 37–42. *Risco alto:* 1º arrasto do app. Expansão de letras só **após o Portão Técnico**.
- **3.9 — Expansão de letras + tolerância.** *Aceite:* alfabeto progressivo; confundíveis; tolerância calibrada. *Testes:* 41, 44–46.
- **3.10 — Animações, Beni, sons reutilizáveis.** *Aceite:* animações curtas/canceláveis; fallback sem animação; sons mapeados. *Testes:* 43–45.
- **3.11 — Dificuldade adaptativa + Página Tranquila.** *Arquivos:* `src/services/palavrinhasDirector.js` (puro). *Aceite:* sobe/desce sem trocar modo; nunca reduz toque; Página Tranquila em 2 Resgates. *Testes:* 35–36, 30.
- **3.12 — Resultado, estrelas, rejogabilidade.** *Aceite:* resumo; `addBonusStars(1)` único gated; jogar novamente/trocar dificuldade. *Testes:* 47–52, 33.
- **3.13 — Modo Criador: inspetor + simulador.** *Arquivos:* `src/screens/PalavrinhasAssetGalleryScreen.js`. *Aceite:* inspetor de palavras + simulador; não consome/não salva. *Testes:* 53–54.
- **3.14 — Integração, regressão, validação visual.** *Aceite:* smoke total verde; regressão Ovelhinha; validação física iPhone. *Testes:* 58–60.

Ordem sugerida de execução: 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → **3.8 (risco)** → 3.9 → 3.10 → 3.11 → 3.12 → 3.13 → 3.14. Blocos de **assets** (imagens de palavra, poses Beni) e de **persistência de domínio** (nova chave) são **isolados** e **aprovados à parte**.

---

## 24. Critérios de aceite globais

1. Nenhuma derrota; nenhuma mensagem negativa; nenhuma via que bloqueie a criança.
2. Brilhos 3/2/1 corretos; Resgate com participação; reforço não-imediato.
3. Três atividades funcionando; desfazer por `iid`; letras repetidas por instância.
4. Traçado tolerante, sem estética, com movimento reduzido.
5. Determinismo seed/planId; plano imutável; baralho sem repetição prematura; alternâncias.
6. Diretor adaptativo sem trocar modo e sem reduzir toque; Página Tranquila.
7. 1 estrela por partida, fonte única, teto diário respeitado.
8. Dev-gated; Modo Criador/simulador sem consumir progresso.
9. Acessibilidade (§20) atendida.
10. Todos os gates verdes; regressão da Ovelhinha e do app intacta.

---

## 25. Riscos e decisões pendentes (para o Portão 1)

**Riscos técnicos:** (1) traçado é integralmente novo (corredor/cobertura + 1º arrasto) → protótipo isolado no 3.8; (2) `gesture-handler` precisa de `GestureHandlerRootView` na raiz; (3) precisão do arrasto em telas pequenas; (4) geometria autoral de letras (trabalho manual + alinhamento com o glifo raster); (5) módulo puro do smoke não pode importar RN/expo.

**Decisões de produto — RESOLVIDAS no Portão 1** (ver §2.1): (1) tetos diários compartilhados; (2) padrão de imagem único, sem flashcard novo, produção em lote só após Portão Visual 2; (3) acentos/Ç só no Difícil após infra validada; (4) persistência de domínio adiada; (5) conquistas adiadas; (6) Beni por reuso de órfãos + lanterna de UI; (7) traçado nativo com protótipo isolado A/O/L primeiro.

**Risco de raiz — MITIGADO:** `GestureHandlerRootView` já está na raiz (`App.js:57`); nenhuma mudança de raiz é necessária (auditoria confirmada).

**Áreas protegidas ainda intocadas (blocos isolados futuros, com aprovação própria):** `storageKeys.js` (chave de domínio da palavra), `achievements.js` (conquistas). **Assets (commits próprios, separados):** registro das 3 poses órfãs do Beni em `beniImages.js` (**P9**, antes do primeiro uso); produção/registro das **30–36 imagens de palavra** + manifesto 36/36 (**P13**, só após a Lista de Imagens do Portão Visual 2 ser aprovada).

---

## 26. Confirmações desta etapa

- **Nenhum código de produção** foi implementado.
- **Nenhum asset** foi registrado/criado; nenhum `require` inexistente.
- **Sem commit, sem push, sem build EAS, sem instalação de bibliotecas.**
- Único artefato novo: **este arquivo de especificação**.

---

# R. Redefinição funcional e visual do P4 (P4R) — sem imagem

> Esta seção rege a reconstrução (P4R). Supersede, no que conflitar, §10.2 (banco de 36 com imagem), §17 (Beni "figura") e §22 (linhas de imagem de palavra).

## R.1 Banco de palavras expandido (≥120 · 40/40/40) — sem depender de assets

`imageRef` é **opcional** (metadado futuro de álbum; pode ser `null`). Acentos/Ç **suportados** no COMPLETE. `displayWord` preserva a grafia; `normalizedWord` (só lógica) = maiúsculas sem acento e Ç→C, **sem** apagar a exibição. Letras repetidas por `letterInstances[].iid`. Evitar repetição entre partidas consecutivas (baralho rotativo já existente).

**Fácil (40)** — 3–5 letras, ortografia simples, sem acento/Ç:
SOL, LUA, UVA, OVO, ASA, REI, MEL, PAI, BOI, PATO, GATO, BOLA, CASA, BOLO, SAPO, RATO, DADO, VACA, LOBO, URSO, PEIXE, SUCO, FACA, MOTO, SINO, NAVE, ROSA, PIPA, MALA, GELO, FOCA, DEDO, CAMA, MESA, SAIA, FADA, TREM, BICO, LIXO, PANO.

**Médio (40)** — 5–8 letras, dígrafos (LH/NH/CH) e encontros consonantais (BR/CR/PL/TR/FL), sem acento pesado:
OVELHA, POMBA, ESTRELA, CAVALO, CHUVA, GALINHA, COELHO, BONECA, SAPATO, BANANA, IGREJA, CHAVE, ABELHA, FORMIGA, JANELA, ESCOLA, CADERNO, BALEIA, MACACO, PANELA, TOMATE, LARANJA, CENOURA, MORANGO, CEBOLA, GIRAFA, ZEBRA, COBRA, CASTELO, ESTRADA, PLANETA, CHINELO, TELHADO, PIPOCA, VESTIDO, SORVETE, CAMINHO, FLORESTA, BISCOITO, PRESENTE.

**Difícil (40)** — 7–12 letras **e/ou** acentos, Ç, letras repetidas, encontros consonantais:
LEÃO, CORAÇÃO, AVIÃO, PÁSSARO, CAMINHÃO, AEROMOÇA, FAMÍLIA, MAÇÃ, LIMÃO, BOTÃO, ARARA, ELEFANTE, BORBOLETA, TARTARUGA, MACARRÃO, DINOSSAURO, BICICLETA, ABACAXI, CHOCOLATE, PROFESSORA, COMPUTADOR, CROCODILO, JOANINHA, PASSARINHO, CACHOEIRA, ESTRELINHA, BRINQUEDO, TRENZINHO, MARGARIDA, ABÓBORA, PIRULITO, BORRACHA, PINGUIM, GAROTINHO, PRESÉPIO, CORUJINHA, GIRASSOL, CAVALINHO, MELÃO, FEIJÃO.

**Organização (atributos por palavra, para o validador do P4R):** quantidade de letras; dificuldade ortográfica; sílabas simples/complexas; letras repetidas; encontros consonantais; acentos; Ç; categoria de vocabulário (animais/natureza/objetos/alimentos/família/bíblia/app/corpo/transporte). A dificuldade **não** é definida só por tamanho — acento/Ç/encontro/ortografia elevam o tier.

## R.2 Dificuldade (redefinida)

| Modo | Letras | Lacunas | Opções | Tempo | Ritmo |
|---|---|---|---|---|---|
| **Fácil** | 3–5 | 1 | 3 | **sem** temporizador obrigatório | pedagógico/calmo |
| **Médio** | 5–8 | 2–3 | 4 | **com tempo** (+5s/palavra) | desafio moderado |
| **Difícil** | 7–12 | 3–5 | 5 | **com tempo** (+5s/palavra) | desafio real; lacunas distribuídas pela palavra; pode incluir acento/Ç/repetidas/encontros |

Lacunas **distribuídas** (espalhadas, nunca a 1ª letra, preservando a leitura), nº conforme tamanho **e** ortografia (não só tamanho).

## R.3 Fluxo completo de ACERTO (sequência imediata)

(a) a letra pressionada responde no **1º frame** (pressed instantâneo); (b) a peça **anima até a lacuna**; (c) a lacuna **acende**; (d) a palavra recebe **brilho/pulso**; (e) o **Beni celebra**; (f) toca **som de acerto** (`match_success`); (g) o **combo aumenta**; (h) nos modos com tempo, o relógio **+5s**; (i) o **progresso** da rodada avança visualmente. Tudo **respeita movimento reduzido** (sem animação de voo/pulso quando ativo; o resultado ainda acontece).

## R.4 Fluxo completo de ERRO (consequência de jogo, não-agressiva)

- **1º erro:** a letra **balança e retorna**; **combo reinicia**; Beni dá orientação curta ("Essa quase entrou. Tente outra letrinha.").
- **2º erro na MESMA lacuna:** **opções reorganizadas** (reshuffle); nos modos com tempo, **−2s**; reação visual curta do ambiente.
- **3º erro:** ativa **Resgate do Beni** — destaca uma **pista verdadeira**, a criança **ainda toca e conclui**, e o **brilho máximo** daquela palavra cai conforme o contrato aprovado (§5/máquina). **Sem X agressivo, sem tela de derrota, sem mensagem negativa.**

> **Nota de contrato de máquina (P4R):** a máquina pura da Fase 0 já cobre erros/Resgate/brilho por `letrasRestantes`. O **combo** e o **−2s no 2º erro na mesma lacuna** são estado de **sessão/UI** (não alteram o plano imutável nem a identidade da palavra); o **reshuffle** de opções é da UI. Avaliar no P4R se o "2º erro na mesma lacuna" precisa de um efeito novo na máquina (ex.: `PENALIDADE_TEMPO`) — se sim, **volta ao artefato** (spec/máquina) antes de implementar.

## R.5 Contrato do temporizador (reuso REAL do jogo dos Pares)

Auditoria do timer dos Pares (fonte a reutilizar):

| Item | Onde (Pares) | Reuso no P4R |
|---|---|---|
| Constantes | `paresGameService.js`: `TURBO_ALERTA_MS=10000` (alerta ≤10s), `TURBO_TICK_MS=10000` (tique/seg nos últimos 10s), `TURBO_BONUS_MS`, `TURBO_MAX_MS=90000` (teto), `segundosRestantes(ms)=ceil(ms/1000)`, `addTurboTime(ms,bonus,cap)` (puro) | **Reutilizar** os helpers puros; bônus do P4R = **+5s** (Pares é +2s) → passar `bonusMs` próprio a `addTurboTime` |
| Efeito de bônus | `paresGameMachine.js` `EFEITOS.BONUS_TEMPO` → tela chama `addTurboTime` | mesmo padrão (efeito → `addTurboTime(restante, 5000, cap)`) |
| Som de relógio | `PARES_SOUND_EVENTS.COUNTDOWN_TICK='countdown_tick'`, `TIME_UP='time_up_alarm'` (já no `audioManager`) | **Reutilizar** as MESMAS chaves |
| Loop do relógio | `ParesDoBeniScreen.js` `setInterval` (~1s): decrementa, toca `countdown_tick` 1×/seg nos últimos 10s (`seg<=TURBO_TICK_MS/1000`), `tique` (bump de escala do número), chama `tempoEsgotou()` no zero | replicar a estrutura |
| Borda vermelha | `MolduraAlerta({pulso,largura})` = **4 faixas absolutas** (topo/base/esq/dir) nos limites da **janela**, espessura `min(10,max(6,largura*0.018))`, opacidade `pulso:0.35→1`; cor `ALERTA='#C0392B'` | **Reutilizar o padrão** — bordas EXTERNAS da experiência (não a borda do card) |
| Limiar do alerta | `emAlerta = jogando && timed && !pausado && restanteMs>0 && restanteMs<=TURBO_ALERTA_MS` | mesmo limiar (10s) |
| Pulso | `Animated.loop(sequence(timing 410ms in/out, Easing.inOut(quad)))` | mesmo; **gate por movimento reduzido** (novo) |
| Início/parada do som | tique 1×/seg no alerta; **parado** em pausa (`AppState`/blur), em `tempoEsgotou` e no **unmount** (`stopGameSfx(COUNTDOWN_TICK)` + `releaseGameSfx()`) | **replicar exatamente** — som não sobrevive à saída |
| Limpeza ao sair | unmount → `pulso.stopAnimation()`, `tique.stopAnimation()`, `stopGameSfx(countdown_tick)`, `releaseGameSfx()` | idem |
| Movimento reduzido | Pares **não** gateia o pulso em reduce-motion | **P4R DEVE** gatear: sem pulso/tique animado quando reduzido, mantendo cor/contador |
| Adicionar tempo | `addTurboTime(restante,bonus,cap)` puro, com teto | +5s por palavra, teto documentado |

Quando o tempo estiver acabando (≤10s): **bordas externas vermelhas** + **pulso perceptível** + **som de relógio** + **contador muda** + **Beni alerta**. O som **para** quando o tempo sobe (bônus tira do alerta), termina, pausa ou a tela é desmontada.

## R.6 Falas do Beni por estado (sem "figura")

| Estado | Fala (exemplos) |
|---|---|
| entrada | "Vamos descobrir quais letrinhas estão escondidas?" |
| início da palavra | "Quais letrinhas estão faltando nesta palavrinha?" |
| 1º erro | "Essa quase entrou. Tente outra letrinha." |
| 2º erro | "Vamos com calma. Olhe as letrinhas de novo." |
| Resgate | "Deixa eu te ajudar: toque na letrinha que brilha." |
| acerto | "Boa! A palavra está ficando completa." |
| combo | "Uau! Você está voando!" |
| tempo acabando | "O tempo está correndo. Vamos juntos!" · (bônus) "Você ganhou mais cinco segundos!" |
| fim | "Você completou seu livrinho! Que orgulho!" / (sem 1ª palavra) "Você começou seu livrinho. Vamos tentar de novo?" |

## R.7 Estrutura visual (palco mágico da palavra)

(a) **sem vazio** grande no topo; (b) **palavra na área principal** (herói); (c) **Beni integrado ao palco** (ao lado/abaixo, reagindo); (d) **letras disponíveis próximas** da palavra; (e) **progresso e relógio sem colisão** com o banner de Modo Criador (§R.9); (f) Safe Area correta; (g) **título totalmente visível**; (h) layout adaptável a palavras longas; (i) **redução progressiva** do tamanho da letra para palavras maiores sem perder legibilidade; (j) **proibida a quebra** da palavra em duas linhas (salvo decisão documentada). A tela parece **um jogo mágico de palavras**, não um questionário com cards.

## R.8 Tela final

Conter: (a) **mensagem contextual do Beni**; (b) palavras concluídas; (c) **melhor combo**; (d) brilhos conquistados; (e) **tempo bônus** recebido (quando aplicável); (f) **Jogar de novo**; (g) **Trocar dificuldade**; (h) **Voltar ao Brincar**; (i) **Voltar ao Início**. Se o tempo acabar **antes da 1ª palavra**, **não** mostrar três caixas com zero — mostrar mensagem de participação ("Você começou seu livrinho. Vamos tentar novamente e completar a primeira palavra?"), reconhecendo a participação **sem** recompensa indevida.

## R.9 Cabeçalho e compensação do banner "Modo Criador Ativo"

Auditoria: `src/components/dev/CreatorModeBanner.js` é um **overlay absoluto no topo** (`top:0`, `zIndex:9999`, `pointerEvents:none`), montado **globalmente** em `AppNavigator.js:273`. Ocupa `paddingTop: max(insets.top,4)` + texto (FredokaOne 10) + `paddingBottom:3` → cobre a Safe Area **mais ~18–22px** de faixa. Só aparece com `isCreatorQaModeAllowed() && isCreatorQaModeEnabled()`.

**Regra P4R:** o cabeçalho compensa a **altura do banner** (não margem fixa por aparelho): `paddingTop = max(insets.top, N) + (isCreatorQaModeEnabled() ? ALTURA_BANNER_CRIADOR : 0)`, com `ALTURA_BANNER_CRIADOR` **derivada do layout do próprio banner** (linha ~14 + paddings ≈ ~22), como já faz `CadeAOvelhinhaScreen` (`criadorAtivo ? 22 : 0`). Reagir a `subscribeCreatorQaMode` para ligar/desligar em runtime.
