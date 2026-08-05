# Product Lock 4D — Dados, persistência, migração, recuperação e integridade

> **ARTEFATO CONSOLIDADO — FASE 4D ENCERRADA (2026-08-05).**
> Documento **exclusivamente documental e decisório**. Nenhum código, asset, pack, manifesto ou
> configuração foi alterado na produção deste artefato. As dez perguntas da seção 18 foram
> **respondidas pelo fundador** e estão transcritas em seus respectivos blocos.
>
> | | |
> |---|---|
> | Worktree | `C:/tmp/ptf_colorir_canonical_runtime_wt` |
> | Branch | `docs/e015-phase3-artifacts` |
> | HEAD na abertura | `662e66c5333ffdf8fe879157e7c9a98ded5c40eb` |
> | Base executável congelada | `015c438106538595b592981fbe1b80b1d5d65e55` |
> | Matriz canônica | `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` — `P-01`..`P-148` (a Fase 4D criou `P-141` a `P-148`) |
> | Fases encerradas | 3H · 4A · 4B · 4C · **4D** |
> | Data | 2026-08-05 |

---

## 0. Correção de contagens do artefato preliminar

O fundador determinou, **antes de qualquer consolidação**, a correção de duas inconsistências de
contagem do relatório preliminar, **sem ajuste silencioso**. Ambas eram erros do **relatório**; a
tabela da §5 e as fichas da §2.2 já estavam corretas no documento.

### 0.1 Erro 1 — dependências do fundador

O relatório afirmou *"24 decorrem de contratos já aprovados; 9 dependem das perguntas"*. **Os dois
números estavam errados.** A recontagem sobre o campo 11 das 33 fichas da §2.2 dá:

| Recontagem | Valor correto | Códigos |
|---|--:|---|
| Códigos que **dependiam** de resposta do fundador | **8** | `P-35` `P-62` `P-82` `P-114` `P-116` `P-126` `P-134` `P-137` |
| Códigos com árbitro em contratos **já aprovados** | **25** | os 33 restantes da §2.1 |

As **10 perguntas** excedem os **8 códigos** porque **três perguntas são de contrato e não têm
código âncora único** — Pergunta 3 (reinstalação), Pergunta 4 (exportação) e Pergunta 6 (corrupção
sem recuperação) — e porque **perguntas distintas compartilham o mesmo código** (as Perguntas 1 e 2
ancoram ambas em `P-62`; as Perguntas 5 e 10 tocam ambas `P-35` e `P-114`). **Não existe relação de
um para um entre pergunta e código, e o relatório preliminar tratou-a como se existisse.**

### 0.2 Erro 2 — conflitos que exigem o fundador

O relatório afirmou *"Oito são resolvíveis pelos contratos já aprovados; seis exigem o fundador"* e
em seguida enumerou **sete**. **Os dois números estavam errados; a enumeração estava certa.**

| Recontagem | Valor correto | Conflitos |
|---|--:|---|
| Total de conflitos da §5 | **14** | `D-1` a `D-14` |
| **Exigem o fundador** | **7** | `D-2` `D-3` `D-7` `D-9` `D-11` `D-12` `D-13` |
| **Resolvíveis** pelos contratos já aprovados | **7** | `D-1` `D-4` `D-5` `D-6` `D-8` `D-10` `D-14` |

### 0.3 Efeito das correções

Nenhuma decisão de produto muda por causa destas correções: os conflitos que exigiam o fundador já
estavam corretamente marcados na tabela da §5, e os códigos que dependiam de resposta já estavam
corretamente marcados nas fichas da §2.2. **O que estava errado era exclusivamente a agregação
apresentada no relatório**, e ela está corrigida acima e na §19.


## 1. Escopo da Fase 4D

### 1.1 O que esta fase decide

Transformar em **contratos explícitos de produto** as pendências relacionadas a: armazenamento
local, escrita, leitura, migração, corrupção, reset, reinstalação e **preservação dos dados
infantis**.

Um "dado infantil" neste documento é qualquer registro que a criança **produziu** (uma pintura, uma
arte do Criar Livre, uma reflexão escrita) ou **conquistou** (uma cena vista, uma história
concluída, uma estrelinha, uma conquista, um card do Baú). A tese central da fase é simples:

> **O aplicativo é o depositário do esforço da criança. Perder esse depósito é a falha mais grave
> que o produto pode cometer — mais grave do que um travamento, do que uma imagem faltando ou do
> que um áudio mudo.**

### 1.2 O que esta fase NÃO decide

1. **Não reabre o contrato comercial.** O *entitlement* aparece aqui **somente** na relação com
   armazenamento e migração — nunca em preço, plano, gate ou o que é gratuito. Isso está travado
   na Fase 4A.
2. **Não reabre a fórmula de conclusão da jornada.** Travada na Fase 4C.
3. **Não inventa sincronização entre aparelhos.** A Fase 4A já decidiu que **o lançamento não
   promete sincronização**.
4. **Não decide conteúdo, empacotamento ou o que viaja no binário.** Travado na Fase 4B.
5. **Não corrige defeito algum.** Decisão tomada ≠ defeito corrigido. Todo código citado aqui
   permanece exatamente como está em `015c438`.

### 1.3 Critério de inclusão aplicado

Um código só entrou nesta fase se **existe uma decisão de produto real sobre propriedade,
preservação, migração ou recuperação do dado**. Riscos que apenas *usam* AsyncStorage — sem que o
fundador precise decidir a quem o dado pertence, se ele sobrevive, como ele migra ou como ele se
recupera — foram **explicitamente excluídos** e estão listados na seção 2.3 com a razão da exclusão.

---

## 2. Códigos abrangidos

### 2.1 Os 33 códigos em escopo

| Grupo | Códigos | Assunto |
|---|---|---|
| **A — Fonte canônica e propriedade da chave** | `P-39` `P-44` `P-50` `P-52` `P-53` `P-108` `P-114` | Quem é dono do dado; onde a chave vive |
| **B — Escopo do dado** | `P-40` `P-61` `P-62` | Por criança, por perfil, por instalação, por dia |
| **C — Contrato de escrita** | `P-13` `P-41` `P-46` `P-55` `P-69` `P-71` | Escrita silenciosa, não aguardada, não idempotente |
| **D — Rodadas e transação** | `P-56` `P-57` `P-86` | Consumo de rodada, sessão interrompida |
| **E — Reset** | `P-32` `P-35` | O que o reset apaga e o que ele deixa passar |
| **F — Packs: integridade, disco e migração** | `P-116` `P-120` `P-124` `P-125` `P-126` `P-134` `P-137` `P-138` | Conteúdo baixado que ocupa o aparelho da família |
| **G — Entitlement (só armazenamento e migração)** | `P-129` `P-140` | Cache local do direito comercial |
| **H — Dado infantil sem destino** | `P-49` `P-82` | Criações e recompensas que o runtime não consome |

**Divisão por árbitro (corrigida na §0.1): dos 33, oito dependiam de resposta do fundador — `P-35`
`P-62` `P-82` `P-114` `P-116` `P-126` `P-134` `P-137` — e vinte e cinco decorriam de contratos já
aprovados nas Fases 4A, 4B e 4C.** Os oito foram decididos nas respostas da §18; **os 33 estão
anotados na matriz canônica** com prefixo `DECISÃO`, `REGISTRO` ou `PRECISÃO DA FASE 4D`.

### 2.2 Ficha dos 33 códigos

> Legenda dos campos: **1** descrição factual · **2** domínio de dados · **3** chave(s) ·
> **4** decisão necessária · **5** evidência atual · **6** decisão já aprovada relacionada ·
> **7** dependências · **8** fase de implementação · **9** validação futura · **10** impacto no
> lançamento · **11** precisa de resposta do fundador.

---

#### `P-114` — cerca de 20 chaves `@ptf` fora de `storageKeys.js`

1. O módulo central `src/services/storageKeys.js` declara 20 chaves estáticas e 11 geradores
   dinâmicos, mas **nenhum dos 11 geradores é chamado por tela ativa** — os 4 que têm chamador
   (`certificate`, `shareCard`, `weeklyReportsIndex`, `weeklyReport`) vivem em módulos órfãos. Todo
   consumidor ativo redeclara a literal localmente.
2. Transversal — atinge progresso, colorir, Livrinho, Cultinho, Meu Momento, Monte a Cena, guias.
3. `@ptf_progress_*`, `@ptf_quiz_done_*`, `@ptf_reflection_*`, `@ptf_storybook_opened_*`,
   `@ptf_drawing_s*_c*`, `@ptf_coloring_done_*`, `@ptf_coloring60_*`, `@ptf_drawing60_*`,
   `@ptf_lumi_moment_*`, `@ptf_bonus_stars`, `@ptf_family_worship_v1`,
   `@ptf_monte_a_cena_*_v1:<profileId>`, `@ptf_beni_guide_*_v1`, `@ptf_creator_qa_mode`,
   `@ptf_audio_prefs_v1`, `@ptf_beni_chest_seen_cards_v1`.
4. **Existe uma fonte canônica única de chaves no lançamento, ou o inventário disperso é congelado
   como está?** Sem fonte única, nenhum reset, nenhuma migração e nenhuma exportação futura pode
   ser provado completo.
5. `COMPROVADO PELO CÓDIGO` — 136 ocorrências de `@ptf` em 39 arquivos de `src/`;
   `storageKeys.js:63` declara `PLAN_STATE: '@ptf_plan_state_v1'` **sem nenhum leitor ou escritor
   em todo o `src/`** (chave inteiramente morta).
6. `D-4C-FAIL-CLOSED-ESCRITA` (a escrita precisa ser verificável).
7. `P-35`, `P-32`, `P-53`.
8. Fase 19. 9. `VFP` + `TEL` + `REI` + `MIG`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **SIM** — Pergunta 10.

#### `P-44` — Home e Meu Momento divergem em 5 de 7 dias

1. Duas superfícies calculam o mesmo fato ("a criança teve seu momento hoje?") por caminhos
   diferentes e chegam a respostas diferentes na maioria dos dias da semana.
2. Meu Momento. 3. `@ptf_lumi_moment_{YYYY-MM-DD}` e `@ptf_lumi_moment_ever`.
4. **Qual das duas superfícies é a fonte canônica?** (Contrato aprovado: nenhuma superfície
   recalcula sua própria conclusão.)
5. `COMPROVADO PELO CÓDIGO`. 6. Contrato 1 da Fase 4C. 7. `P-53`. 8. Fase 12B. 9. `VFP`.
10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não** — o árbitro decorre do contrato já aprovado.

#### `P-50` — `markStoryColoringActivityDone` sem consumidor

1. A função que grava a conclusão canônica do Colorir existe (`coloringActivityService.js:28-32`) e
   **nunca é chamada**. `ProgressContext.js:198` lê `@ptf_coloring_done_*` a cada boot e sempre cai
   no caminho de compatibilidade que infere conclusão a partir de pixel salvo.
2. Colorir narrativo. 3. `@ptf_coloring_done_{storyId}_{scene}` (nunca escrita) ·
   `@ptf_drawing_s{id}_c{scene}` (usada como prova indireta).
4. **A conclusão de uma atividade é um fato próprio ou é inferida de haver tinta no papel?**
5. `COMPROVADO PELO CÓDIGO` — prova negativa por *grep*.
6. Fase 4C, Decisão 4: pelo menos uma atividade de Colorir é requisito **quando disponível** — o
   que exige um fato de conclusão confiável.
7. `P-01`. 8. Fase 9. 9. `VFP`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não** — decorre da 4C.

#### `P-39` — acumulador `totalBonusStars` sem consumidor

1. `@ptf_bonus_stars` é creditada por 8 superfícies e lida em `ProgressContext.js:140`, mas **nunca
   é exibida**. O contador visível da Home é derivado por `rewardService.js:1-31` de outra base.
2. Estrelinhas. 3. `@ptf_bonus_stars` (acumulador) × progresso de cenas/quiz/reflexão (derivado).
4. **Qual é a fonte canônica do número que a criança vê?** — e como o acumulador antigo é
   reconciliado sem perda.
5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4C, Decisão 9: reconciliação em fonte canônica única,
   **nenhuma estrela perdida na migração**. 7. `P-82`. 8. Fase 11. 9. `MIG` + `VFP`.
10. **NÃO BLOQUEIA**. 11. **Não** — a 4C já decidiu; falta só o desenho da migração (seção 10).

#### `P-53` — chaves órfãs do Meu Momento e das guias

1. Chaves gravadas e nunca lidas, ou lidas e nunca gravadas, nos domínios Meu Momento e guias do
   Beni. 2. Meu Momento · guias. 3. `@ptf_lumi_moment_*`, `@ptf_beni_guide_*_v1`.
4. **Chave órfã é lixo a remover ou dado a preservar?** 5. `COMPROVADO PELO CÓDIGO`.
6. Contrato 4 (nenhum dado infantil é apagado para resolver inconsistência).
7. `P-44`. 8. Fase 12B. 9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não**.

#### `P-52` — política antiga de "não persistir" ainda afirmada em documento

1. Documento normativo ainda declara que determinado estado não é persistido, quando o código já
   persiste. 2. Documental/transversal. 3. — 4. **Corrigir o normativo** (estatuto documental:
   normativo vigente se corrige). 5. `COMPROVADO PELO DOCUMENTO`. 6. — 7. — 8. Fase 9. 9. —
   10. **NÃO BLOQUEIA**. 11. **Não**.

#### `P-108` — Modo Igreja com escritores sem consumidor e campo trocado

1. O domínio grava dados que ninguém lê e troca um campo na leitura.
2. Modo Igreja. 3. `@ptf_church_groups_v1`.
4. **O Modo Igreja produz dado persistente no lançamento?** 5. `COMPROVADO PELO CÓDIGO`.
6. Fase 4B (escopo de lançamento). 7. — 8. Fase 12B. 9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não**.

---

#### `P-62` — `DEFAULT_PROFILE` sem campo `id`

1. `ProfileContext.js:9-13` define o perfil padrão **sem `id`**. Sete telas resolvem o escopo de
   armazenamento com `(profile && (profile.id || profile.avatarId)) || 'default'` — logo o dado é
   **chaveado pelo avatar**, não pela criança.
2. Monte a Cena (progresso e galeria) · Criar Livre (orientação).
3. `@ptf_monte_a_cena_progress_v1:<profileId>`, `@ptf_monte_a_cena_gallery_v1:<profileId>`,
   `@ptf_criar_livre_orientation_seen_v1:<profileId>`.
4. **A identidade da criança é escopo de armazenamento no lançamento?** Hoje: trocar o avatar
   órfã o progresso; duas crianças que escolhem o mesmo avatar **compartilham o mesmo balde em
   silêncio**.
5. `COMPROVADO PELO CÓDIGO` — `ProfileContext.js:9-13` × `BrincarScreen.js:191`,
   `MonteACenaTableGameScreen.js:406`, `MonteACenaStoryScreen.js:65`, `MonteACenaHomeScreen.js:81`,
   `MonteACenaGameV2Screen.js:38`, `MonteACenaGalleryScreen.js:49`, `AtelierCanvasScreen.js:48`.
6. Fase 4A: sem sincronização; sem conta. 7. `P-114`. 8. Fase 12A. 9. `VFP` + `REI`.
10. **NÃO BLOQUEIA** na matriz — mas **é o coração da Pergunta 2**. 11. **SIM** — Perguntas 1 e 2.

#### `P-40` — chave diária em UTC vira às 21h

1. `postStoryStorage.js:6` monta a chave do dia em UTC; no fuso brasileiro o "dia" da criança vira
   às 21h. 2. Meu Momento. 3. `@ptf_lumi_moment_{YYYY-MM-DD}`.
4. **O dia da criança é o dia local do aparelho.** 5. `COMPROVADO PELO CÓDIGO`.
6. — 7. `P-61`. 8. Fase 12B. 9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não** — o árbitro é inequívoco.
   *(Observação: `brincarDailyService.js:41-47` já faz o certo, com `getFullYear/getMonth/getDate`
   locais e comentário explicando por que não usa `toISOString`. A divergência é entre dois
   domínios do próprio app.)*

#### `P-61` — sugestão diária não vira à meia-noite

1. O mesmo defeito de fronteira do dia, na superfície de sugestão. 2. Home/sugestão.
3. Derivada. 4. Mesma determinação de `P-40`. 5. `COMPROVADO PELO CÓDIGO`. 6. — 7. `P-40`.
8. Fase 12A. 9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não**.

---

#### `P-46` — falha de escrita silenciosa em três domínios

1. Livrinho, Cultinho e Meu Momento gravam dentro de `try{} catch{}` mudo: a falha não chega à
   tela, à criança nem ao responsável. 2. Livrinho · Cultinho · Meu Momento.
3. `@ptf_storybook_opened_*`, `@ptf_family_worship_v1`, `@ptf_lumi_moment_*`.
4. Aplicar `D-4C-FAIL-CLOSED-ESCRITA` a estes três domínios.
5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4C, Decisão 11 (visível e *fail closed*). 7. `P-41`.
8. Fase 19. 9. `VFP`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não** — decorre da 4C.

#### `P-13` — `setItem` sem `await` no convite do marco C60

1. `coloring60MilestoneInviteSeen.js:61` grava sem aguardar, em função não-`async`, com `.catch`
   apenas. 2. Colorir 60 (convite de marco). 3. `@ptf_coloring60_milestone_invite_seen_*`.
4. Escrita não aguardada em dado **não infantil** (marca de "já vi o convite") — determinar se o
   contrato de escrita se aplica com o mesmo rigor. 5. `COMPROVADO PELO CÓDIGO`. 6. Decisão 11 da 4C.
7. — 8. Fase 9. 9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não**.

#### `P-71` — escrita de resultado não aguardada em Pares e Palavrinhas

1. O resultado da partida é gravado sem aguardar confirmação; a tela já celebrou.
2. Estatísticas dos jogos. 3. `@ptf_brincar_stats_v1`.
4. **Recompensa só depois da persistência confirmada** (contrato 3, aprovado).
5. `COMPROVADO PELO CÓDIGO` — agrava-se com o fato de que `brincarStatsService.js:450` **retorna
   `false` em falha e nenhum dos 8 chamadores verifica o retorno**. 6. Contrato 3 + Decisão 11 da 4C.
7. `P-69`. 8. Fase 12A. 9. `VFP`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não**.

#### `P-41` — Cultinho não idempotente

1. `familyWorshipService.js:55` incrementa o contador sem chave de idempotência: repetir a mesma
   ação no mesmo dia conta duas vezes. 2. Cultinho. 3. `@ptf_family_worship_v1` (`{count, lastDate,
   lastStoryId}`). 4. **Uma ação da família conta uma vez.** 5. `COMPROVADO PELO CÓDIGO`.
6. — 7. `P-46`. 8. Fase 12B. 9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não**.

#### `P-55` — Monte a Cena V2 grava conclusão real sob cena errada

1. Uma conclusão verdadeira da criança é persistida associada à cena errada — dado infantil real,
   endereçado errado. 2. Monte a Cena. 3. `@ptf_monte_a_cena_gallery_v1:<profileId>`.
4. **Corrigir o endereço sem apagar a conclusão** (contrato 4). 5. `COMPROVADO PELO CÓDIGO`.
6. Contrato 4 + contrato 5 (maior estado defensável). 7. `P-62`. 8. Fase 12A. 9. `VFP`.
10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não** — mas exige regra de reconciliação (seção 13).

#### `P-69` — Palavrinhas sem persistência de resultado

1. O jogo não persiste resultado algum. 2. Estatísticas dos jogos. 3. `@ptf_brincar_stats_v1`
   (ramo ausente). 4. **O esforço em Palavrinhas é dado preservável?** 5. `COMPROVADO PELO CÓDIGO`.
6. Fase 4C, Decisão 10 (os quatro jogos terão conquistas) — o que **exige** persistência.
7. `P-70`. 8. Fase 12A. 9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não**.

---

#### `P-56` — `catch` *fail-open* no consumo de rodada — **BLOQUEIA LANÇAMENTO**

1. `MonteACenaTableGameScreen.js:456` e `:467`:
   `try { r = await consumeRound(); } catch { r = { ok: true, remaining: Infinity, premium: true }; }`
   — uma falha de storage **fabrica plano premium e rodadas infinitas**.
2. Rodadas diárias. 3. `@ptf_brincar_daily_v1`.
4. **Falha de storage nunca concede direito.** 5. `COMPROVADO PELO CÓDIGO` — verificado nesta fase.
6. Fase 4C, Decisão 11, item 7: *"nunca conceder premium, rodada, recompensa ou desbloqueio como
   alternativa"*. 7. `P-57`. 8. Fase 12A. 9. `VFP`. 10. **BLOQUEIA LANÇAMENTO**. 11. **Não** — a
   decisão está tomada; **o defeito NÃO está corrigido**.

#### `P-57` — rodada fabricada na retomada

1. A retomada de sessão devolve `remaining` sintético em vez de consultar o contador real.
2. Rodadas diárias. 3. `@ptf_brincar_daily_v1` × `@ptf_monte_a_cena_progress_v1:<profileId>`.
4. **Retomar não consome nova rodada, mas também não inventa saldo.** 5. `COMPROVADO PELO CÓDIGO`.
6. Fase 4C, Decisão 14 (Monte a Cena mantém retomada; consulta o contador real; nunca fabrica).
7. `P-56`, `P-86`. 8. Fase 12A. 9. `VFP`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não**.

#### `P-86` — nenhum dos quatro jogos tem retomada

1. Sessão interrompida é perdida nos quatro jogos. 2. Jogos. 3. `@ptf_brincar_daily_v1` ·
   `@ptf_monte_a_cena_progress_v1:<profileId>`. 4. **O que acontece com a partida interrompida.**
5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4C, Decisão 14 — **já resolvido**: Pares, Palavrinhas e
   Ovelhinha não precisam persistir partida incompleta; a rodada só é consumida no resultado
   terminal; Monte a Cena mantém retomada. 7. `P-57`. 8. Fase 12A. 9. `VFP`.
10. **NÃO BLOQUEIA**. 11. **Não** — decidido na 4C.

---

#### `P-35` — o reset não transporta o estado das guias

1. A *whitelist* de `progressResetService.js:34-63` **não** inclui chaves de guia nem
   `@ptf_brincar_*`. Depois de "apagar o progresso", o app se comporta como se a criança já
   conhecesse tudo. 2. Reset · guias · jogos.
3. `@ptf_beni_app_tour_seen_v1`, 6× `@ptf_beni_guide_*_v1`, `@ptf_brincar_daily_v1`,
   `@ptf_brincar_stats_v1`, `@ptf_onboarding_v1`. 4. **O que "recomeçar" significa** (seção 12).
5. `COMPROVADO PELO CÓDIGO`. 6. — 7. `P-114`, `P-32`. 8. Fase 11. 9. `VFP` + `REI`.
10. **PODE BLOQUEAR LANÇAMENTO**. 11. **SIM** — Pergunta 5.

#### `P-32` — `resetOnboardingForQa` grava em vez de remover

1. `onboardingService.js:109` **sobrescreve** a chave com um objeto "zerado" em vez de removê-la —
   o estado resultante não é idêntico ao de uma instalação nova. 2. Onboarding.
3. `@ptf_onboarding_v1`. 4. **Reset produz ausência ou produz um valor?** — determinante para
   "reinstalação simulada". 5. `COMPROVADO PELO CÓDIGO`. 6. — 7. `P-114`. 8. Fase 7. 9. `VFP`.
10. **NÃO BLOQUEIA**. 11. **Não** — decorre da Pergunta 5.

---

#### `P-116` — packs sem limpeza de órfãos e sem teto de disco

1. Não existe rotina de limpeza de diretórios órfãos e não existe teto de ocupação. Um *bump* de
   versão **deliberadamente não apaga o diretório antigo** (`packDownloadService.js:171-177`).
2. Packs. 3. `@ptf_packs_v1` + `documentDirectory/packs/<storyId>@<version>/`.
4. **Quanto do aparelho da família o app pode ocupar, e quem apaga o excedente.**
5. `COMPROVADO PELO CÓDIGO` — prova negativa; existe apenas *precheck* de espaço antes do download
   (margem de 20% ou piso de 20 MB, `packDownloadService.js:117-123,584-597`).
6. Fase 4B. 7. `P-137`. 8. Fase 17. 9. `VFP` + `TEL`. 10. **PODE BLOQUEAR LANÇAMENTO**.
11. **SIM** — Pergunta 8.

#### `P-120` — `manifestSha256` opcional no índice global

1. O índice global admite entrada sem *hash* do manifesto. *(No caminho de download,
   `packDownloadService.js:524-533` exige `manifestSha256`; a divergência está no schema do índice.)*
2. Packs. 3. Índice remoto. 4. **Integridade é obrigatória ou opcional no contrato publicado.**
5. `globalManifestService.js` × `packDownloadService.js:524-533`. 6. Fase 4B. 7. — 8. Fase 17.
9. `TEL`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não** — o árbitro é o *fail closed* já aprovado.

#### `P-124` — `metadata.storyId` do pack não é cruzado com o índice

1. `packManifestService.js:103` valida o formato e nunca compara com o `storyId` do índice: um pack
   pode ser publicado sob a história errada. 2. Packs. 3. `@ptf_packs_v1`.
4. **O pack pertence à história que o índice diz.** 5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4B.
7. `P-120`. 8. Fase 17. 9. `TEL`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não**.

#### `P-125` — `status` no índice remoto descreve estado que só o aparelho conhece

1. O índice remoto carrega um campo de estado que é, por natureza, **local**.
2. Packs. 3. `@ptf_packs_v1` (`status`) × índice remoto.
4. **De quem é a verdade sobre "este pack está baixado".** 5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4B.
7. `P-120`. 8. Fase 17. 9. `TEL`. 10. **NÃO BLOQUEIA**. 11. **Não** — a propriedade do dado é local
   por definição (seção 6).

#### `P-126` — packs sem caminho de migração de versão de schema

1. Não há rota de migração para o schema dos packs. 2. Packs. 3. `@ptf_packs_v1` ·
   `.ptf-publish.json`. 4. **O que acontece com um pack baixado sob um schema anterior.**
5. `COMPROVADO PELO CÓDIGO`. 6. — 7. `P-134`, `P-137`. 8. Fase 17. 9. `MIG`. 10. **NÃO BLOQUEIA**.
11. **SIM** — Pergunta 9.

#### `P-134` — versão mínima de app declarada com dois nomes diferentes

1. `requiredAppVersion` no índice (`globalManifestService.js:149`) e `minAppVersion` no manifesto do
   pack (`packManifestService.js:73`), sem cruzamento; e `minAppVersion` significa coisa diferente
   em `globalManifestService.js:81` (piso do índice inteiro). 2. Packs.
3. Índice remoto × manifesto do pack. 4. **Qual é o contrato de compatibilidade entre app instalado
   e pack baixado.** 5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4B. 7. `P-126`, `P-132`. 8. Fase 17.
9. `MIG` + `TEL`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **SIM** — Pergunta 9.

#### `P-137` — `appVersion` congelado em `1.0.0` e rebaixamento de packs no primeiro *bump*

1. O marcador de disco `.ptf-publish.json` grava `appVersion`; com a versão congelada em `1.0.0`, a
   primeira atualização real do app pode **rebaixar packs já baixados** e obrigar a família a baixar
   tudo de novo. 2. Packs. 3. `.ptf-publish.json` · `@ptf_packs_v1`.
4. **Um pack baixado sobrevive à atualização do app?** 5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4B.
7. `P-126`, `P-134`. 8. Fase 17. 9. `MIG` + `REI`. 10. **PODE BLOQUEAR LANÇAMENTO**.
11. **SIM** — Pergunta 9.

#### `P-138` — `sha256` de pack lê o arquivo inteiro em base64, sem *streaming* nem teto

1. A verificação de integridade carrega o arquivo inteiro em memória como base64.
2. Packs. 3. Arquivos em `packs/<storyId>@<version>/`.
4. **Integridade não pode derrubar o aparelho da família.** 5. `COMPROVADO PELO CÓDIGO`.
6. `CLAUDE.md` (base64 transitório é aceitável; blob grande retido não é). 7. `P-120`. 8. Fase 17.
9. `VFP` + `TEL`. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não**.

---

#### `P-129` — entitlement offline com cache expirado nunca exercitado

1. A política `entitlementPolicy.decideEntitlement` cobre todos os ramos (sem cache → `free`;
   inválido → `free`; relógio recuado → `needs_revalidation`; expirado → `free`; janela offline
   acima de 7 dias → `needs_revalidation`), **todos *fail closed***, mas o ramo de janela offline
   expirada nunca foi exercitado em aparelho real. 2. Entitlement (armazenamento).
3. `@ptf_entitlement_v1`. 4. **O que a família vê quando o cache expira sem rede** — decisão de
   experiência, não comercial. 5. `entitlementPolicy.js:32` (`OFFLINE_MAX_WINDOW_MS`) e `:65-98`.
6. Fase 4A (contrato comercial travado — **não reaberto aqui**). 7. `P-140`. 8. Fase 18.
9. **`VFP` obrigatória**. 10. **PODE BLOQUEAR LANÇAMENTO**. 11. **Não**.

#### `P-140` — entitlement sem caminho de migração de schema

1. `@ptf_entitlement_v1` não tem rota de migração declarada. 2. Entitlement (armazenamento).
3. `@ptf_entitlement_v1`. 4. **O cache de direito comercial migra ou é descartado?**
5. `COMPROVADO PELO CÓDIGO`. 6. Fase 4A: **não há base instalada paga**; Modo Criador, *flags* e
   premium local fabricado **NUNCA migram para direito comercial**. 7. `P-129`. 8. Fase 18.
9. `MIG`. 10. **NÃO BLOQUEIA**. 11. **Não** — a 4A já fixou o árbitro: **descartar e revalidar** é
   sempre seguro, porque descartar leva a `free` e `free` é *fail closed*.

---

#### `P-49` — arte da criança no Livrinho: viva no código, morta no runtime

1. O caminho que insere a arte da criança dentro do Livrinho existe e nenhum consumidor o aciona.
2. Livrinho × Colorir. 3. `@ptf_drawing_s*_c*` · `@ptf_drawing60_s*_a*`.
4. **A criação da criança tem destino de leitura no lançamento?** Um dado infantil produzido e
   nunca devolvido à criança é, na prática, um dado perdido. 5. `COMPROVADO PELO CÓDIGO`.
6. Fase 4C, Decisão 3 (Livrinho é experiência própria, opcional). 7. `P-50`. 8. Fase 10.
9. `VFP`. 10. **NÃO BLOQUEIA**. 11. **Não**.

#### `P-82` — três serviços de recompensa sem consumidor

1. `certificateService`, `shareCardService` e `weeklyReportService` aparecem só dentro dos próprios
   arquivos: zero recompensa imprimível ou compartilhável no app. São os **únicos** consumidores dos
   geradores de `storageKeys.js`. 2. Recompensas derivadas.
3. `@ptf_certificates_v1_index`, `@ptf_share_cards_v1_index`, índices semanais.
4. **Estes três serviços fazem parte do produto de lançamento?** 5. Prova negativa por *grep* em
   `src/`. 6. — 7. `P-39`. 8. Fase 11. 9. — 10. **NÃO BLOQUEIA**. 11. **SIM** — Pergunta 7.

### 2.3 Códigos deliberadamente EXCLUÍDOS da Fase 4D

| Código | Por que **não** entra |
|---|---|
| `P-01` | Motor de jornada — decisão travada na 4C; aqui só aparece como dependência. |
| `P-09` `P-10` `P-118` `P-119` | Identificadores e ordenação de **catálogo de conteúdo**, não de dado infantil. `P-118`/`P-119` já resolvidos pela Decisão 13 da 4C. |
| `P-25` `P-26` `P-98` | Disponibilidade e UI de download/áudio — não há decisão sobre propriedade ou preservação de dado. |
| `P-121` `P-122` `P-123` `P-132` `P-133` | Divergências de schema entre os dois manifestos — contrato de **publicação**, endereçado na Fase 17. Não decidem quem é dono do dado. |
| `P-130` | Packs não entregam colorir — decisão de **conteúdo**, travada na 4B. |
| `P-136` | 18 histórias no binário — decisão de **empacotamento e comercial**, travada em 4A/4B. |
| `P-63` `P-70` `P-11` | Já decididos na Fase 4C. |
| Demais códigos que apenas usam AsyncStorage | Sem decisão de produto sobre propriedade, preservação, migração ou recuperação. **Critério da ETAPA 2 aplicado literalmente.** |

---

## 3. Inventário dos domínios de dados

> Quinze campos por domínio: **1** domínio · **2** leitor · **3** escritor · **4** chave ·
> **5** centralizada em `storageKeys.js`? · **6** escopo · **7** formato · **8** versão ·
> **9** derivado ou fonte de verdade · **10** ausência · **11** corrupção · **12** falha de escrita ·
> **13** migração · **14** reset · **15** consumidores de runtime.

### 3.1 Progresso de histórias

1. Progresso de histórias (cenas vistas).
2. `ProgressContext.js:51-66` (`multiGet`) · `useProgress.js:15-24` · **`StoryBookScreen.js:260-261`
   lê direto e aplica regra própria** (`story.cenas.every(...)`).
3. `useProgress.js:26-34`, aguardado a partir de `NarrationScreen.js:186`.
4. `@ptf_progress_{storyId}`.
5. **Não** — literal repetida em 3 arquivos (`useProgress.js:5`, `ProgressContext.js:45`,
   `StoryBookScreen.js:30`).
6. **Global ao aparelho**, por história. Nenhuma escopagem por criança.
7. JSON `{ [cenaId]: true }`.
8. **Sem campo de versão.**
9. **Fonte de verdade.**
10. Ausência = nenhuma cena vista. Silencioso e correto.
11. `JSON.parse` falha → tratado como ausência → **progresso desaparece silenciosamente**.
12. Falha propagada até `NarrationScreen`, mas **sem estado visível de "Guardando…"**.
13. **Não migra.** Sem versão, sem rota.
14. `progressResetService.js` remove por *prefix scan* — **cobertura confirmada**.
15. Mapa de Aventuras · Home · `rewardService` · Livrinho.

### 3.2 Colorir narrativo (legado)

1. Colorir narrativo.
2. `ProgressContext.js:198` (a cada boot) · `coloringActivityService.js`.
3. `coloringActivityService.js:28-32` — **sem nenhum chamador** (`P-50`).
4. `@ptf_coloring_done_{storyId}_{scene}` (canônica, nunca escrita) ·
   `@ptf_drawing_s{storyId}_c{scene}` (pixels, usada como prova indireta).
5. **Não.**
6. **Global ao aparelho**, por história e cena.
7. Marca booleana · blob/ponteiro de desenho.
8. **Sem versão.**
9. Deveria ser fonte de verdade; **na prática é derivado de haver tinta no papel.**
10. Ausência → cai no caminho de compatibilidade.
11. Corrupção do desenho **apaga a evidência de conclusão** — viola o contrato 4.
12. Silenciosa.
13. **Não migra.**
14. Coberto por `resetProgress` (namespace `@ptf_drawing_*`, inclusive *blobs* físicos).
15. `ProgressContext` · Mapa · fórmula de `journeyComplete` (4C).

### 3.3 Colorir 60 (ativo)

1. Colorir com o Beni — 60 atividades.
2. `coloring60ActivityService.js` · `coloring60DrawingStorage.js`.
3. `coloring60ActivityService.js:129` — **um único `multiSet`** para `done` + `ever` + `snap`.
4. `@ptf_coloring60_done_*`, `@ptf_coloring60_ever_*`, `@ptf_coloring60_snap_*`,
   `@ptf_coloring60_finale_seen_*`, `@ptf_drawing60_s{story}_a{activity}`.
5. **Não.**
6. **Global ao aparelho**, por história e atividade.
7. Marcas booleanas · ponteiro `{ v:3, uri, mime }` para arquivo real, com **duplo buffer A/B**
   (`coloring60DrawingStorage.js:467,581`).
8. Ponteiro versionado (`v:3`); marcas sem versão.
9. **Fonte de verdade** — e o único domínio que **desacopla conclusão de pixels**: *"uma falha de
   persistência de pixels JAMAIS deve apagar uma conclusão válida"*.
10. Ausência = não fez.
11. **Distingue "não fez" de "não deu para ler"** (`readFailed: true`, `:223-227`) — **é o modelo de
    referência para todo o app**.
12. `multiSet` único = escrita atômica das três marcas.
13. **Não migra** (mas o duplo buffer torna a escrita recuperável).
14. `coloring60ResetService.js:138` (progresso) e `:267` (obras) — **separados por desenho**.
15. Mapa · jornada · marco C60 · galeria.

### 3.4 Criar Livre e galeria (Ateliê)

1. Criar Livre / Ateliê.
2. `atelierStorage.js`.
3. `atelierStorage.js:138,146`.
4. Índice `ptf_atelier_arts_v1_index` (**sem `@`** — legado; comentário no código: *"NÃO RENOMEAR:
   apagaria a galeria de quem já usa o app"*) · por arte `ptf_atelier_arts_v1_<id>` · *blobs* em
   `documentDirectory + 'ptf_blobs/atelier/'`.
5. Índice **declarado** em `storageKeys.js` (`ATELIER_INDEX`) mas **`atelierStorage.js:13`
   redeclara a literal** — declaração central sem uso.
6. **Global ao aparelho** — todas as crianças compartilham a galeria.
7. Índice de ids · arte com `schema: 2` · *blob* em arquivo.
8. **Versionado** (`schema: 2`).
9. **Fonte de verdade — dado infantil produzido.**
10. Ausência = galeria vazia.
11. Índice corrompido → galeria some **mesmo com os arquivos intactos no disco**.
12. **`saveArt` NÃO tem `try/catch` nos `setItem` finais — a falha propaga.** É o único serviço do
    app que já se comporta *fail closed*.
13. **Migra:** `migrateToV2` (base64 → arquivo) e `migrateToV3` (títulos).
14. `atelierResetService.js:43`, acionado por `ParentAreaScreen.js:277`.
15. `AtelierGalleryScreen` · `AtelierCanvasScreen`.
16. *(Nota)* `ATELIER_FREE_SAVE_LIMIT = 0` (`atelierStorage.js:10`) = `FREE_ATELIER_SAVE_LIMIT`
    (`accessControl.js:33`) — coerente com a 4A. **Fallback de base64 embutido em AsyncStorage se
    `writeBlob` falhar** (`atelierStorage.js:124,134`).

### 3.5 Estrelinhas visíveis e acumulador antigo

1. Estrelinhas.
2. **Visível:** `rewardService.js:1-31` (derivado) → `HomeScreen.js:600,716,771`.
   **Acumulador:** `ProgressContext.js:140`.
3. `postStoryStorage.js:58-70` (`addBonusStars`) creditado por `QuizScreen.js:106` (+2),
   `ReflectionScreen.js:75` (+1), `LumiMomentScreen.js:38` (+1), `ParesDoBeniScreen.js:405`,
   `CadeAOvelhinhaScreen.js:430,473,584`, `PalavrinhasDoBeniScreen.js:368`.
4. `@ptf_bonus_stars`.
5. **Declarada** em `storageKeys.js`, mas `postStoryStorage.js:58` redeclara a literal.
6. **Global ao aparelho.**
7. Inteiro.
8. **Sem versão.**
9. **Dois sistemas concorrentes:** o visível é **derivado**; o acumulador é **fonte de verdade que
   ninguém exibe** (`P-39`).
10. Ausência = zero.
11. Valor não numérico → tratado como zero → **estrelas desaparecem**.
12. Silenciosa. E `addBonusStars` faz **leitura-e-escrita sem trava** (`postStoryStorage.js:69-70`):
    dois créditos simultâneos perdem um.
13. **Não migra** — e a Decisão 9 da 4C exige reconciliação **sem perda**.
14. Coberto por `resetProgress`.
15. Home · aba Estrelinhas · nada consome o acumulador.

### 3.6 Rodadas diárias

1. Rodadas diárias do Brincar.
2. `brincarDailyService.js:97-107` (`readEntry`).
3. `brincarDailyService.js:110-119` (`writeEntry`).
4. `@ptf_brincar_daily_v1`.
5. **Sim** — `STORAGE_KEYS.BRINCAR_DAILY`, usada de verdade. **É o domínio mais bem construído do
   app neste quesito.**
6. **Global ao aparelho** — **compartilhada pelos quatro jogos e por todas as crianças**
   (matéria da ETAPA 6).
7. `{ day: 'YYYY-MM-DD', used: number }`.
8. Chave versionada no nome (`_v1`); payload sem campo de versão, com `sanitizeEntry` tolerante.
9. **Fonte de verdade.**
10. Ausência = zero rodadas usadas hoje.
11. `sanitizeEntry` (`:50-55`) devolve `{day:null, used:0}` → **corrupção libera rodadas**.
12. `writeEntry` devolve `true/false` — **e `consumeRound` (`:141-152`) não verifica o retorno**:
    devolve `ok:true` mesmo se a gravação falhou.
13. **Não migra.**
14. **NÃO coberto** por `resetProgress` (`P-35`).
15. Os quatro jogos · `BrincarScreen`.
16. *(Acerto a preservar)* `toDayKey` (`:41-47`) usa **fuso local** deliberadamente, com comentário
    explicando por que não usa `toISOString` — exatamente o oposto de `P-40`.

### 3.7 Estatísticas dos jogos

1. Estatísticas do Brincar.
2. `brincarStatsService.js` (`sanitizeStats`, `:71-112`).
3. `brincarStatsService.js:450` (`writeStats`), 8 chamadores.
4. `@ptf_brincar_stats_v1`.
5. **Sim.**
6. **Global ao aparelho** — não por perfil.
7. `{ day, starsToday, lastMode, pares:{…}, turbo:{…}, ovelha:{…} }` — **sem ramo de Palavrinhas**
   (`P-69`).
8. **Sem campo de versão**; compatibilidade por saneamento tolerante.
9. **Fonte de verdade** (recordes, conquistas).
10. Ausência = estatísticas zeradas.
11. `sanitizeStats` recompõe → **recordes se perdem em silêncio**.
12. `writeStats` devolve `false` em falha e **nenhum dos 8 chamadores verifica** — a tela entrega
    `starAwarded`/`isBest` como se tivesse persistido (`P-71`).
13. **Não migra.**
14. **NÃO coberto** por `resetProgress`.
15. Jogos · conquistas (`toAchievementCtx`, `:422-436`, que só devolve *flags* de Pares).

### 3.8 Monte a Cena (sessão e galeria)

1. Monte a Cena.
2. `MonteACenaTableGameScreen.js` · `MonteACenaGalleryScreen.js:49`.
3. `MonteACenaTableGameScreen.js:135,142,431` — **as três escritas sem `await`**.
4. `@ptf_monte_a_cena_progress_v1:<profileId>` · `@ptf_monte_a_cena_gallery_v1:<profileId>`.
5. **Não** — literais locais.
6. **Por `profileId`, que na prática é o `avatarId`** (`P-62`).
7. `{ sessionId, puzzleSceneId, storyId, sceneNumber, pieceCount, placedPieceIds, trayPieceOrder,
   shuffleSeed, startedAt, updatedAt, version }`.
8. **Versionado** (`SCHEMA_VERSION = 1`).
9. **Fonte de verdade** (a galeria guarda conclusão real da criança).
10. Ausência = sessão nova.
11. **Versão diferente → reset silencioso para `emptyProgress`, sem migração.**
12. Silenciosa (escritas não aguardadas).
13. **Não migra** — descarta.
14. **NÃO coberto** por `resetProgress`.
15. Telas do Monte a Cena · rodadas diárias.

### 3.9 Conquistas vistas

1. Conquistas.
2. `achievementService.js:19-180` — **derivação em tempo de execução**.
3. Marca de "visto" em `@ptf_achievements_seen`.
4. `@ptf_achievements_seen`.
5. **Sim** (declarada) — consumida por literal.
6. **Global ao aparelho.**
7. Lista de ids vistos.
8. **Sem versão.**
9. **Derivado** — a conquista em si é recalculada; só o "já vi" é persistido. **Modelo correto.**
10. Ausência = nada visto ainda; conquistas continuam válidas.
11. Corrupção → conquista é **celebrada de novo** (incômodo, não perda).
12. Silenciosa.
13. **Não migra** (não precisa).
14. Coberto por `resetProgress`.
15. Aba Estrelinhas · telas dos jogos.

### 3.10 Baú do Beni

1. Baú do Beni.
2. `beniChestService.js:90-192` — cards construídos em runtime.
3. Marca de "visto".
4. `@ptf_beni_chest_seen_cards_v1`.
5. **Não.**
6. **Global ao aparelho.**
7. Lista de ids.
8. **Sem versão.**
9. **Derivado** — mesmo modelo correto das conquistas.
10. Ausência = tudo novo.
11. Corrupção → cards reaparecem como novos.
12. Silenciosa.
13. **Não migra.**
14. Coberto por `resetProgress`.
15. Tela do Baú.

### 3.11 Perfil e avatar

1. Perfil infantil.
2. `ProfileContext.js:26-32` (legado) · `childProfileService.js` (moderno).
3. `ProfileContext.js:34-42` · `childProfileService.js`.
4. `@ptf_profile` (legado, sem versão) · `@ptf_child_profiles_v1` · `@ptf_active_child_id_v1`.
5. **Sim** para as três — mas `ProfileContext.js:7` redeclara `'@ptf_profile'`.
6. **Instalação.**
7. Legado: `{ name, avatarId, skinTone }` — **sem `id`**. Moderno: lista com `id` real
   (`generateId('child')`).
8. Legado sem versão; moderno `_v1`.
9. **Fonte de verdade** — e há **duas**, desconectadas.
10. Ausência → `DEFAULT_PROFILE` **sem `id`** → escopo cai no avatar.
11. Corrupção → volta ao padrão → **todo dado escopado por perfil é órfão de uma vez**.
12. Silenciosa (`ProfileContext.js:40`).
13. **Migra:** `migrateToV1` converte o perfil legado em lista de crianças.
14. **NÃO coberto** por `resetProgress`.
15. Sete telas via `profile.id || profile.avatarId`. **`getActiveChildProfile` e `getChildProfiles`
    não são chamados por nenhuma tela — o sistema moderno é *write-mostly* órfão.**

### 3.12 Entitlement

1. Direito comercial em cache.
2. `entitlementService.js:55-70` (`loadEntitlement`, uma vez no boot) ·
   `getEntitlementSnapshot()` (síncrono, de memória).
3. **Escritor único:** `saveEntitlement` (`:100-102`), chamado só por `refreshEntitlement()`
   (`:110-117`).
4. `@ptf_entitlement_v1`.
5. **Sim.**
6. **Instalação.**
7. `{ loaded, lastValidatedAt, maxSeenDeviceTimestamp, rcActive?, rcCancelledButPaid?, expiresAt? }`,
   saneado em `:84-97`.
8. Chave versionada; payload sem campo de versão.
9. **Cache de fonte externa** — nunca fonte de verdade.
10. Sem cache → `free / no_cache`.
11. Inválido → `free / invalid_data`. Relógio recuado → `needs_revalidation / clock_rollback`.
    Expirado → `free / expired`. Janela offline > 7 dias → `needs_revalidation / stale_validation`.
    **Todos os ramos *fail closed*** (`entitlementPolicy.js:65-98`).
12. Silenciosa — **mas segura**, porque a ausência leva a `free`.
13. **Não migra** (`P-140`) — e não precisa: descartar leva a `free`.
14. **NÃO coberto** por `resetProgress` — correto, é direito comprado.
15. `accessControl` · paywall · galeria · rodadas.
16. *(Nota)* `@ptf_creator_qa_mode` (Modo Criador) **não altera o plano real** — só sobrepõe
    `isPremiumUser()` (`accessControl.js:72-76`), sob `isCreatorQaModeAllowed()`;
    `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` fixo em `accessControl.js:20`.

### 3.13 Packs baixados

1. Packs de história.
2. `packStorageService.js` · `packReconcileService.js` · `packRecoveryService.js`.
3. `packStorageService.js:99-157` — **cadeia de escrita serializada** (acerto a preservar).
4. `@ptf_packs_v1` · arquivos em `documentDirectory/packs/<storyId>@<version>/` · marcador
   `.ptf-publish.json`.
5. **Sim.**
6. **Instalação.**
7. Entrada `{ storyId, version, status, localDir, manifestPath, totalBytes, downloadedBytes,
   updatedAt, errorMessage }` — **sem hash e sem appVersion**. O marcador de disco tem
   `{ schemaVersion, storyId, version, manifestSha256, manifestPath, kinds, appVersion }`.
8. Índice `_v1`; marcador com `schemaVersion` próprio.
9. **Índice = derivado; o disco = fonte de verdade.**
10. Ausência = pack não baixado.
11. **Índice diz PRONTO e o disco não tem:** `packReconcileService.isReadyEntryValid` (`:42-48`)
    rebaixa **só em memória** para `NOT_DOWNLOADED`; sonda indeterminada **mantém PRONTO**
    (conservador). **Disco íntegro e índice sem saber:** `recoverStoryPack`
    (`packRecoveryService.js:213-279`) valida por completo e promove; **duas versões válidas →
    devolve `ambiguous` (`:245-251`) e nunca adivinha.** Modelo de referência.
12. Escrita serializada; falha marcada na entrada.
13. **Não migra** (`P-126`); *bump* de versão **não apaga o diretório antigo** (`P-116`).
14. **NÃO coberto** por `resetProgress`.
15. Mapa · Narração · Livrinho.

### 3.14 Livrinho

1. Livrinho.
2. `StoryBookScreen.js:260-261` — **lê `@ptf_progress_*` direto com regra própria**.
3. `postStoryStorage.js` (`markStoryBookOpened`).
4. `@ptf_storybook_opened_{storyId}`.
5. **Não.**
6. **Global ao aparelho**, por história.
7. String `'true'`.
8. **Sem versão.**
9. **Fonte de verdade** de um marco próprio — **fora da fórmula de `journeyComplete`** desde a 4C.
10. Ausência = nunca abriu.
11. Valor diferente de `'true'` → tratado como não aberto.
12. **`StoryBookScreen.js:401` chama `markStoryBookOpened(story.id);` SEM `await`, seguido de
    `refreshProgress()` na linha `:402` — corrida real** (`P-46`).
13. **Não migra.** A 4C determinou que registros antigos **não são apagados e não causam
    regressão**.
14. Coberto por `resetProgress`.
15. Mapa · jornada · marco próprio.

### 3.15 Cultinho

1. Cultinho em família.
2. `familyWorshipService.js` — revalidação campo a campo na leitura.
3. `familyWorshipService.js:55` — **incremento não idempotente** (`P-41`).
4. `@ptf_family_worship_v1` — **chave global única**.
5. **Não.**
6. **Global ao aparelho.**
7. `{ count, lastDate, lastStoryId }`.
8. Chave `_v1`; payload sem versão.
9. **Fonte de verdade.**
10. Ausência = nunca fez.
11. Revalidação campo a campo → campo ruim vira padrão.
12. Silenciosa (`P-46`).
13. **Não migra.**
14. Coberto por `resetProgress`.
15. **Nenhum chamador de `markFamilyWorshipCompleted` localizado em `src/screens`** — o domínio
    grava por um caminho que a auditoria não encontrou acionado.

### 3.16 Meu Momento

1. Meu Momento.
2. `postStoryStorage.js` · Home · tela do Meu Momento (**duas regras divergentes**, `P-44`).
3. `postStoryStorage.js`.
4. `@ptf_lumi_moment_{YYYY-MM-DD}` · `@ptf_lumi_moment_ever`.
5. `LUMI_MOMENT_EVER` **sim**; a diária **não**.
6. **Global ao aparelho**, por dia.
7. Marca por dia · marca perpétua.
8. **Sem versão.**
9. **Fonte de verdade.**
10. Ausência = não teve o momento hoje.
11. Corrupção = mesmo efeito da ausência.
12. Silenciosa (`P-46`).
13. **Não migra.**
14. Coberto por `resetProgress` (varredura de prefixo via `getAllKeys`, `:82-89`).
15. Home · tela do Meu Momento · estrelinhas.
16. *(Defeito)* chave montada em **UTC** (`postStoryStorage.js:6`) → o dia vira às 21h no Brasil
    (`P-40`).

### 3.17 Onboarding e guias (contexto necessário para reset e migração)

1. Onboarding · guias do Beni.
2. `onboardingService.js` · serviço de guias.
3. `onboardingService.js` · `AdventureMapScreen.js:57-58` (**`markBeniAppTourSeen()` e
   `markGuideSeen('adventures')` sem `await`, em função não-`async`**).
4. `@ptf_onboarding_v1` · `@ptf_beni_app_tour_seen_v1` · 6× `@ptf_beni_guide_*_v1`.
5. Onboarding **sim**; guias **não**.
6. **Instalação.**
7. Onboarding `{ completed, completedAt, version }` — **o único payload narrativo com campo de
   versão explícito** (`ONBOARDING_CURRENT_VERSION = 1`). Guias: booleanos.
8. Versionado / sem versão.
9. Fonte de verdade.
10. Onboarding ausente → mostra onboarding. **Guia: `hasSeenGuide` devolve `true` em erro ou
    ausência** — *"dúvida → true = não insiste"*, o **inverso** do padrão do resto do app.
11. Idem.
12. Silenciosa e **não aguardada**.
13. Onboarding tem **migração implícita e preguiçosa** a partir do perfil legado
    (`onboardingService.js:88-97`) — **uma leitura com efeito colateral de escrita**.
14. **NÃO coberto** por `resetProgress` (`P-35`). `resetOnboardingForQa` (`:109`) **sobrescreve em
    vez de remover** (`P-32`).
15. Boot · Mapa de Aventuras.

---

## 4. Decisões já aprovadas que permanecem em vigor

Nenhuma delas é reaberta nesta fase. Elas são o **teto** das determinações da 4D.

### 4.1 Os cinco contratos fundacionais

| # | Contrato | Origem |
|---|---|---|
| **C1** | **Nenhuma superfície recalcula sua própria conclusão.** | 4C |
| **C2** | **Falha de escrita é visível e *fail closed*.** | 4C — `D-4C-FAIL-CLOSED-ESCRITA` |
| **C3** | **Recompensa só é anunciada depois da persistência confirmada.** | 4C |
| **C4** | **Nenhum dado infantil é apagado para resolver inconsistência.** | 4C |
| **C5** | **O maior estado defensável é preservado.** | 4C |

### 4.2 Decisões específicas que restringem a 4D

| Origem | Decisão | Efeito nesta fase |
|---|---|---|
| 4A | **O lançamento não promete sincronização entre aparelhos.** | Fecha a OPÇÃO C da ETAPA 6 e limita a seção 11. |
| 4A | **Não há base instalada paga.** Modo Criador, *flags* e premium local fabricado **nunca** viram direito comercial. | Resolve `P-140` sem pergunta. |
| 4C — Decisão 1 | `journeyComplete` = todas as cenas declaradas · quiz · reflexão · uma atividade de Colorir **quando disponível** · **com persistência confirmada**. `bookOpened` **fora** da fórmula. | Define o que precisa ser persistido de forma confiável. |
| 4C — Decisão 3 | Registros antigos de `bookOpened` **não são apagados nem causam regressão**. | Contrato de migração (seção 10). |
| 4C — Decisão 5 | **História concluída permanece concluída**; conteúdo novo nunca vira pendência retroativa. | Contrato de migração e de reconciliação. |
| 4C — Decisão 9 | Estrelinhas do Brincar entram no contador visível; acumulador e contador **reconciliados em fonte canônica**; **nenhuma estrela perdida na migração**. | Resolve `P-39`. |
| 4C — Decisão 11 | Estado "Guardando…"; nova tentativa; **nunca conceder premium, rodada, recompensa ou desbloqueio como alternativa**; **nunca CTA habilitado e inerte**. | Base da seção 8. |
| 4C — Decisão 14 | Pares/Palavrinhas/Ovelhinha: sem persistência de partida incompleta; rodada consumida **só no resultado terminal**. Monte a Cena: retomada mantida, rodada consumida uma vez, **nunca fabricar rodada**. | Resolve `P-86`; agrava `P-56`. |

### 4.3 O que já existe de bom no código e deve ser preservado

Esta fase encontrou **cinco acertos** que não podem ser destruídos por nenhuma decisão futura:

1. **Existe um sistema de migração real, idempotente e retomável.** `storageMigrationService.js`,
   `APP_STORAGE_SCHEMA_VERSION = 3` em `@ptf_schema_version`, status em
   `@ptf_migration_status_v1`. O executor `runLocalMigrations()` (`:137-183`) **persiste a versão
   após cada passo bem-sucedido** (`:166`) e **interrompe no primeiro erro** (`:167-171`) —
   exatamente o comportamento retomável exigido.
2. **Não existe `AsyncStorage.clear()` em lugar nenhum.** As três ocorrências do termo são
   comentários dizendo que é proibido (`atelierResetService.js:18`, `coloring60LabService.js:19`,
   `coloring60ResetService.js:50`).
3. **O entitlement é *fail closed* em todos os ramos, com escritor único.**
4. **O Colorir 60 distingue "não fez" de "não deu para ler"** e desacopla conclusão de pixels, com
   duplo buffer A/B.
5. **A recuperação de packs nunca adivinha:** duas versões válidas devolvem `ambiguous`.

---

## 5. Conflitos encontrados

| # | Conflito | Lados | Situação |
|---|---|---|---|
| **D-1** | **Fronteira do dia** | `postStoryStorage.js:6` usa **UTC**; `brincarDailyService.js:41-47` usa **fuso local**, com comentário justificando. | **Resolúvel sem o fundador**: o dia da criança é o dia local. `P-40`, `P-61`. |
| **D-2** | **Escopo do dado: criança × avatar × instalação** | 7 telas usam `profile.id \|\| profile.avatarId`; `DEFAULT_PROFILE` não tem `id`; `childProfileService` tem `id` real e **nenhum leitor**. | **EXIGE O FUNDADOR** — Perguntas 1 e 2. |
| **D-3** | **Rodadas diárias: instalação × criança** | `@ptf_brincar_daily_v1` é **global**; o Monte a Cena escopa progresso por `profileId`. **O mesmo produto usa dois escopos.** | **EXIGE O FUNDADOR** — ETAPA 6, Pergunta 1. |
| **D-4** | **Conclusão do Colorir: fato próprio × pixel no papel** | `@ptf_coloring_done_*` é lida e nunca escrita; a conclusão é inferida de haver desenho. | **Resolúvel**: a Decisão 4 da 4C exige um fato confiável. `P-50`. |
| **D-5** | **Estrelinhas: derivado × acumulador** | `rewardService.js:1-31` deriva o visível; `@ptf_bonus_stars` acumula e ninguém exibe. | **Resolvido pela Decisão 9 da 4C**; falta desenhar a migração. `P-39`. |
| **D-6** | **Progresso lido por dois caminhos** | `ProgressContext`/`useProgress` × `StoryBookScreen.js:260-261`, com regra própria. | **Resolúvel por C1.** |
| **D-7** | **Reset assimétrico** | `resetProgress` cobre 9 famílias de chave e deixa de fora Colorir 60 pixels, Ateliê, perfil, jogos, guias, onboarding, packs, entitlement. | **EXIGE O FUNDADOR** — Pergunta 5. |
| **D-8** | **Reset produz ausência × produz valor** | `resetProgress` usa `multiRemove`; `resetOnboardingForQa` **sobrescreve**. | Decorre de D-7. `P-32`. |
| **D-9** | **Chave central declarada × literal usada** | `storageKeys.js` declara 20 chaves e 11 geradores; **nenhum gerador é usado por tela ativa**; `@ptf_plan_state_v1` **não tem leitor nem escritor em todo o `src/`**. | **EXIGE O FUNDADOR** — Pergunta 10. |
| **D-10** | **Índice de packs × disco** | O índice é derivado, o disco é a verdade; mas `P-125` publica `status` no índice **remoto**. | **Resolúvel** pela seção 6. |
| **D-11** | **Pack baixado × atualização do app** | `.ptf-publish.json` grava `appVersion` congelado em `1.0.0`; `requiredAppVersion` × `minAppVersion` divergem. | **EXIGE O FUNDADOR** — Pergunta 9. |
| **D-12** | **Ocupação de disco sem teto** | Sem limpeza de órfãos e sem limite; *bump* de versão **não** apaga o diretório antigo. | **EXIGE O FUNDADOR** — Pergunta 8. |
| **D-13** | **Serviços mortos que produziriam dado infantil** | `certificateService`, `shareCardService`, `weeklyReportService` — zero consumidores. | **EXIGE O FUNDADOR** — Pergunta 7. |
| **D-14** | **Guia falha para "já viu"** | `hasSeenGuide` devolve `true` em erro; o resto do app assume "não fez" em erro. | **Resolúvel**: é intencional e defensável para guia (não é dado infantil). Registrar como exceção nomeada. |

**Contagem (corrigida na §0.2): 14 conflitos ao todo — 7 exigiam o fundador (`D-2` `D-3` `D-7`
`D-9` `D-11` `D-12` `D-13`) e 7 eram resolvíveis pelos contratos já aprovados (`D-1` `D-4` `D-5`
`D-6` `D-8` `D-10` `D-14`).** Os sete que exigiam o fundador **foram todos decididos** nas
respostas da §18: `D-2` e `D-3` na Pergunta 1/2, `D-7` na 5, `D-9` na 10, `D-11` na 9, `D-12` na 8
e `D-13` na 7. **Decisão tomada não é defeito corrigido:** os riscos técnicos correspondentes
seguem `ABERTO` na matriz canônica.

---

## 6. Fonte canônica e propriedade do dado

### 6.1 Os dez pontos

1. **Todo dado tem exatamente um dono declarado.** O dono é o serviço que grava. Nenhuma tela
   grava direto no armazenamento sem passar pelo serviço do domínio.
2. **Quem lê nunca recalcula o fato.** Uma superfície pode formatar, ordenar e ilustrar o dado;
   nunca redecidir se ele aconteceu (C1). Isso encerra `P-44` e `D-6`.
3. **Fato próprio nunca é inferido de subproduto.** Conclusão de atividade é um fato; pixel salvo é
   subproduto. Perder o subproduto **não** pode apagar o fato — o Colorir 60 já faz assim e vira o
   padrão do app (`P-50`).
4. **Derivado é sempre recalculável e nunca é a única cópia.** Conquistas e cards do Baú são
   derivados corretos: só a marca de "já vi" é persistida.
5. **Cache externo nunca é fonte de verdade.** O entitlement é cache; o disco é a verdade dos
   packs; o índice de packs é derivado do disco. `P-125` fica resolvido: **o estado de download
   pertence ao aparelho e não pode ser publicado como campo do índice remoto.**
6. **Escrita de dado infantil é sempre aguardada e sempre confirmada** (C2, C3).
7. **A ausência de dado significa "não aconteceu"; nunca significa "aconteceu".** Exceção nomeada e
   única: as **guias do Beni**, onde a dúvida resolve para "já viu" para não insistir com a
   criança — porque guia não é dado infantil e insistir custa mais do que omitir.
8. **Falha de leitura é um terceiro estado.** "Não fez" ≠ "não deu para ler". Nenhuma superfície
   pode tratar erro de leitura como ausência de conquista (`readFailed`, já implementado no
   Colorir 60).
9. **Nenhum dado infantil é apagado para resolver inconsistência** (C4) e **o maior estado
   defensável é preservado** (C5) — com os cinco limites da seção 13.
10. **Toda chave viva pertence à fonte canônica de chaves.** Chave que não está lá não existe para
    reset, migração, exportação ou auditoria. Chave declarada e sem consumidor é **dívida
    declarada**, não funcionalidade (`P-114`, `@ptf_plan_state_v1`).

### 6.2 Tabela de propriedade por domínio

| Domínio | Dono (escritor único) | Natureza | Cópia derivada permitida |
|---|---|---|---|
| Progresso de histórias | `useProgress` | Fonte de verdade | Sim (Mapa, Home) |
| Colorir narrativo | `coloringActivityService` | Fonte de verdade | Sim |
| Colorir 60 | `coloring60ActivityService` | Fonte de verdade | Sim |
| Criar Livre / Ateliê | `atelierStorage` | **Dado infantil produzido** | Não — é a única cópia |
| Estrelinhas | fonte única a definir na Fase 11 (Decisão 9 da 4C) | Fonte de verdade | Sim |
| Rodadas diárias | `brincarDailyService` | Fonte de verdade | Não |
| Estatísticas dos jogos | `brincarStatsService` | Fonte de verdade | Sim |
| Monte a Cena | serviço do Monte a Cena | Fonte de verdade | Sim |
| Conquistas | `achievementService` | **Derivado** | — |
| Baú | `beniChestService` | **Derivado** | — |
| Perfil | `childProfileService` (moderno) | Fonte de verdade | Não |
| Entitlement | `saveEntitlement` | **Cache externo** | Não |
| Packs | disco; `packStorageService` mantém o índice | Disco = verdade; índice = derivado | — |
| Livrinho | `postStoryStorage` | Marco próprio | Sim |
| Cultinho | `familyWorshipService` | Fonte de verdade | Sim |
| Meu Momento | `postStoryStorage` | Fonte de verdade | Sim |

---

## 7. Escopo por criança, perfil e instalação

### 7.1 As seis auditorias

| # | Auditoria | Resultado |
|---|---|---|
| **A1** | Existe identidade de criança persistida? | **Sim, duas.** `@ptf_profile` (legado, **sem `id`**) e `@ptf_child_profiles_v1` + `@ptf_active_child_id_v1` (moderno, com `id` real). |
| **A2** | O sistema moderno é usado? | **Não.** `getActiveChildProfile` e `getChildProfiles` **não são chamados por nenhuma tela**. É *write-mostly* órfão. |
| **A3** | Quais domínios são escopados por criança? | **Três chaves, em 7 telas:** progresso e galeria do Monte a Cena e orientação do Criar Livre. |
| **A4** | O escopo é mesmo a criança? | **Não.** É `profile.id \|\| profile.avatarId`, e como `DEFAULT_PROFILE` não tem `id`, resolve **sempre no avatar**. |
| **A5** | Qual o resto do app? | **Global ao aparelho:** progresso, colorir, Livrinho, Cultinho, Meu Momento, estrelinhas, conquistas, Baú, rodadas, estatísticas, Ateliê. |
| **A6** | Existe troca de criança em runtime? | **Não existe superfície de troca.** O `activeChildId` existe no armazenamento e nenhuma tela o consulta. |

### 7.2 As dez determinações

1. **O aparelho é a unidade de instalação.** Não há conta, não há nuvem, não há identidade remota.
2. **Nenhum dado atravessa aparelhos no lançamento** (Fase 4A).
3. **`avatarId` NUNCA é escopo de armazenamento.** Avatar é **aparência**, e aparência muda. Usar
   avatar como endereço de dado significa que trocar de avatar apaga o progresso aos olhos da
   criança e que duas crianças com o mesmo avatar compartilham o balde em silêncio. Esta
   determinação é **independente** do número de perfis que o lançamento venha a ter.
4. **Se o lançamento tiver uma criança por instalação**, o escopo correto de **todos** os domínios é
   a instalação — e as três chaves com sufixo `:<profileId>` devem passar a usar um identificador
   estável de instalação, **migrando o conteúdo existente**, nunca abandonando-o.
5. **Se o lançamento tiver várias crianças**, o escopo precisa ser um `childId` **estável, gerado
   uma única vez e independente do avatar e do nome**, e **todos** os domínios de dado infantil
   precisam ser escopados — não só três.
6. **Escopo misto é proibido.** Hoje o app tem escopo misto (Monte a Cena por avatar, o resto
   global) e isso é a raiz de `D-2` e `D-3`. Qualquer que seja a decisão, ela vale para o produto
   inteiro.
7. **Mudar de escopo nunca apaga dado.** Toda mudança de escopo é **migração**, com as regras da
   seção 10; dado sem dono identificável é **adotado pela criança ativa**, nunca descartado.
8. **Trocar o avatar não muda nada no armazenamento.** É uma mudança de aparência.
9. **Trocar o nome não muda nada no armazenamento.**
10. **O perfil legado `@ptf_profile` não é apagado.** `migrateToV1` já o converte em lista; a chave
    permanece como evidência até que a migração esteja provada em aparelho real.

---

## 8. Rodadas diárias: por criança ou por instalação

> **ETAPA 6 — resolução documental do conflito preservado.**
> **Nenhuma opção foi escolhida.** A escolha é do fundador (Pergunta 1).

### 8.1 As sete auditorias

| # | Pergunta | Achado |
|---|---|---|
| **B1** | Onde vive o contador? | `@ptf_brincar_daily_v1`, chave **única e global**, declarada em `storageKeys.js` e usada de verdade. |
| **B2** | Qual o formato? | `{ day: 'YYYY-MM-DD', used: number }`. |
| **B3** | Quem compartilha? | **Os quatro jogos** e, por consequência, **todas as crianças do aparelho**. |
| **B4** | Como o dia vira? | `toDayKey` (`:41-47`) usa **fuso local**, deliberadamente. **Correto.** |
| **B5** | O que acontece em corrupção? | `sanitizeEntry` devolve `{day:null, used:0}` → **corrupção libera rodadas**. |
| **B6** | O que acontece em falha de escrita? | `writeEntry` devolve `false` e **`consumeRound` não verifica** — devolve `ok:true` mesmo sem gravar. |
| **B7** | O que acontece em exceção? | `MonteACenaTableGameScreen.js:456,467` **fabrica `premium:true` e `remaining: Infinity`** (`P-56`, **BLOQUEIA LANÇAMENTO**). `PalavrinhasDoBeniScreen.js:910-920` trata com segurança. `ParesDoBeniScreen.js:481` e `CadeAOvelhinhaScreen.js:688` chamam **sem `catch`**. |

### 8.2 As três alternativas

#### OPÇÃO A — rodadas **por instalação** (comportamento atual)

- **É o que o código já faz.** Zero migração, zero risco novo.
- Coerente com a leitura de que o limite diário é um limite **do produto no aparelho da família**.
- **Consequência:** duas crianças no mesmo tablet dividem as mesmas rodadas. A segunda criança pode
  encontrar o limite esgotado sem ter jogado.
- **Consequência comercial:** é o limite mais restritivo, e portanto o mais favorável à conversão —
  o que **não** é argumento suficiente por si só.

#### OPÇÃO B — rodadas **por criança local identificada**

- Cada criança tem seu próprio saldo diário no mesmo aparelho.
- **Exige** que a determinação 5 da seção 7.2 seja verdadeira: `childId` estável, real, não-avatar,
  com superfície de troca de criança. **Hoje nada disso existe em runtime.**
- **Exige migração:** o contador global existente precisa ser adotado por alguma criança ou zerado
  — e zerar é aceitável aqui, porque **rodada diária não é dado infantil preservável**: ela expira
  em 24 horas por natureza.
- **Consequência:** um aparelho com três crianças passa a oferecer três vezes mais rodadas por dia.
  Isso é uma **mudança de generosidade do produto gratuito**, não apenas técnica.
- **Custo real:** é a opção mais cara. Puxa consigo perfis múltiplos, troca de criança e escopagem
  de todos os domínios.

#### OPÇÃO C — rodadas por **conta familiar sincronizada**

- **INCOMPATÍVEL COM O LANÇAMENTO ATUAL.** Exigiria criação de conta e *backend*, e a Fase 4A já
  decidiu que o lançamento **não promete sincronização**.
- Registrada aqui apenas para não ser reinventada depois.

### 8.3 Recomendação técnica (não é decisão)

**OPÇÃO A**, por três razões:

1. É o que o código já faz — não introduz migração nem risco novo em um domínio que **já tem um
   defeito que bloqueia o lançamento** (`P-56`).
2. A OPÇÃO B depende de infraestrutura de perfis que **não existe em runtime** e que, se for
   construída, deve ser construída por seus próprios méritos, não como efeito colateral do
   contador de rodadas.
3. A rodada diária não é dado infantil preservável: ela expira todo dia. Escolher o escopo mais
   simples aqui custa pouco e pode ser revisto depois do lançamento sem perder nada.

**Se o fundador escolher a OPÇÃO B**, a decisão da Pergunta 2 (quantidade de perfis) passa a ser
**pré-requisito bloqueante** e sobe para o caminho crítico do lançamento.

### 8.4 O que vale independentemente da opção escolhida

Estas três determinações valem em A, B ou C e **não dependem** da resposta do fundador:

1. **Falha de storage nunca concede rodada nem premium** (`P-56`) — decorre da Decisão 11 da 4C.
2. **Corrupção não libera rodada.** `sanitizeEntry` devolvendo `used:0` precisa ser reconciliado
   com o princípio de que dúvida não gera direito (seção 13).
3. **`consumeRound` precisa verificar o retorno de `writeEntry`** — sem isso, C3 é violado em todo
   o Brincar.

---

## 9. Contrato de escrita

Oito estados canônicos. Para cada um, dez determinações.

### 9.1 Estado 1 — NÃO INICIADO

1. Nenhuma marca é gravada. 2. A superfície mostra o conteúdo como disponível, nunca como pendente.
3. Não há recompensa. 4. Não há celebração. 5. A ausência significa "não aconteceu" (seção 6, ponto 7).
6. Não bloqueia nada. 7. Não gera erro nem aviso. 8. É o estado de uma instalação nova.
9. É o alvo de todo reset (seção 12). 10. É o estado padrão de leitura em qualquer falha de
   inicialização — **exceto guias**.

### 9.2 Estado 2 — GRAVANDO

1. A superfície exibe **"Guardando…"** (Decisão 11 da 4C). 2. O CTA principal fica **desabilitado**,
   nunca habilitado e inerte. 3. **Nenhuma conclusão é declarada.** 4. **Nenhuma recompensa é
   anunciada** (C3). 5. Nenhuma navegação automática ocorre. 6. O trabalho da criança é preservado
   em memória. 7. O estado tem timeout definido, que leva ao estado 4 e nunca ao 3.
8. Sair da tela durante a gravação **não** confirma o fato. 9. Nenhuma outra escrita do mesmo
   domínio começa em paralelo. 10. É um estado **visível**, não interno.

### 9.3 Estado 3 — GRAVADO

1. Só se entra aqui com confirmação da camada de armazenamento. 2. **Agora** a conclusão é
   declarada. 3. **Agora** a recompensa é anunciada. 4. **Agora** a celebração ocorre — completa na
   primeira vez, sóbria nas demais (Decisão 7 da 4C). 5. O desbloqueio da próxima história é
   avaliado. 6. A escrita é idempotente: repetir não duplica (`P-41`). 7. Nenhuma superfície
   recalcula o fato (C1). 8. O fato sobrevive a fechar o app. 9. O fato sobrevive à atualização do
   app (seção 10). 10. O fato **não** sobrevive à desinstalação (seção 11).

### 9.4 Estado 4 — FALHA RECUPERÁVEL

1. A criança é informada de forma **afetiva e objetiva**: *"Não consegui guardar agora. Vamos
   tentar mais uma vez?"* 2. **Nova tentativa é oferecida.** 3. O trabalho é preservado em memória.
4. **Nenhuma conclusão é declarada.** 5. **Nenhuma recompensa é concedida.** 6. **Nenhuma rodada é
   consumida.** 7. **Nenhum premium, desbloqueio ou direito é concedido como consolo** (`P-56`).
8. A tela **não** navega adiante sozinha. 9. O erro é registrado para telemetria futura.
10. Repetir a tentativa é seguro: a operação é idempotente.

### 9.5 Estado 5 — FALHA NÃO RECUPERÁVEL

1. Ocorre quando a nova tentativa falhou ou o armazenamento está indisponível (disco cheio,
   permissão negada). 2. A criança recebe uma saída digna, nunca uma tela travada. 3. **Nenhuma
   conclusão, recompensa, rodada ou direito** é concedido. 4. O trabalho em memória é oferecido de
   volta se houver caminho (por exemplo, continuar pintando sem salvar). 5. **Nunca se apaga nada
   para "abrir espaço" sem confirmação do responsável.** 6. Se a causa provável for espaço em
   disco, o responsável — não a criança — é informado. 7. A superfície não promete que o trabalho
   foi guardado. 8. O app continua funcionando nos demais domínios. 9. O evento é registrado.
10. O estado anterior permanece intacto: falhar ao gravar **nunca** corrompe o que já estava lá.

### 9.6 Estado 6 — DADO PARCIALMENTE PERSISTIDO

1. Ocorre quando uma operação de produto exige mais de uma escrita (seção 9) e só parte concluiu.
2. **O maior estado defensável é preservado** (C5). 3. **Nada é apagado** para "voltar atrás" (C4).
4. A parte gravada vale; a parte não gravada é tratada como não iniciada. 5. **Nenhuma recompensa é
   concedida por transação incompleta.** 6. A operação pode ser retomada e é idempotente.
7. A criança não vê estado contraditório: se a conclusão não foi gravada, a tela não diz que foi.
8. Escritas relacionadas devem usar `multiSet` — como o Colorir 60 já faz (`:129`) — para reduzir a
   janela de parcialidade. 9. Um domínio nunca depende da escrita de outro domínio para estar
   íntegro. 10. Na próxima abertura, a reconciliação da seção 13 resolve o estado.

### 9.7 Estado 7 — DADO CORROMPIDO

1. **É um terceiro estado**, diferente de "não fez" (seção 6, ponto 8). 2. Corrupção **nunca** é
   silenciosamente convertida em ausência. 3. **Corrupção nunca concede direito, rodada, premium ou
   recompensa.** 4. **Corrupção nunca apaga dado recuperável.** 5. O valor corrompido é
   **preservado** para diagnóstico, não sobrescrito de imediato. 6. A superfície usa o maior estado
   defensável que outras evidências sustentem (seção 13). 7. Se a corrupção atinge um índice mas os
   arquivos existem, os arquivos mandam — como já ocorre nos packs. 8. Se a corrupção atinge o
   pixel mas a conclusão existe, a conclusão manda — como já ocorre no Colorir 60. 9. Se nada
   sustenta o estado, o produto **não fabrica conclusão**. 10. O responsável tem um caminho para
   entender o que houve.

### 9.8 Estado 8 — DADO LEGADO

1. É dado gravado por versão anterior do app, em formato anterior. 2. **Dado legado é dado válido
   até prova em contrário.** 3. **Nunca é apagado por ser antigo** (C4). 4. É migrado pelas regras
   da seção 10. 5. Enquanto não migrado, é lido pelo caminho de compatibilidade. 6. Registros
   antigos de `bookOpened` **não causam regressão** (Decisão 3 da 4C). 7. Desenho legado em
   `@ptf_drawing_s*_c*` continua valendo como evidência de colorir. 8. O índice legado do Ateliê
   `ptf_atelier_arts_v1_index` **não é renomeado**. 9. O perfil legado `@ptf_profile` é convertido,
   não descartado. 10. Nenhum dado legado vira **direito comercial** (Fase 4A).

---

## 10. Transações de produto

Dez operações que a família percebe como **um único ato**, com o comportamento exigido quando só
parte concluir.

| # | Operação | Escritas envolvidas | Se só parte concluir |
|---|---|---|---|
| **T1** | **Concluir uma cena** | `@ptf_progress_{id}` | Escrita única. Falhou = cena não vista; **a criança é avisada** e pode tentar de novo. |
| **T2** | **Concluir o quiz** | `@ptf_quiz_done_{id}` + `@ptf_bonus_stars` (+2) | **A estrelinha só é anunciada depois das duas** (C3). Se a estrela falhar, o quiz vale e a estrela é re-tentada; **nunca se anuncia estrela não gravada**. |
| **T3** | **Concluir a reflexão** | `@ptf_reflection_{id}` + `@ptf_bonus_stars` (+1) | Idem T2. |
| **T4** | **Concluir uma atividade do Colorir 60** | `done` + `ever` + `snap` (**`multiSet` único**, `:129`) + pixels em arquivo | **Já correto:** as três marcas são atômicas e os pixels são desacoplados. Falha de pixel **não** apaga conclusão. |
| **T5** | **Concluir a história** (`journeyComplete`) | Todas as marcas de T1–T4 + desbloqueio da próxima | **Nunca declarar conclusão sem persistência confirmada de todas as partes** (Decisão 1 da 4C). Parcial = história continua em andamento, **sem regressão do que já valeu**. |
| **T6** | **Salvar uma arte no Criar Livre** | *blob* em arquivo + entrada `ptf_atelier_arts_v1_<id>` + índice | **Ordem obrigatória: arquivo → entrada → índice.** Se o índice falhar, a arte existe no disco e a recuperação da seção 13 a readota. **Nunca gravar o índice antes do arquivo.** |
| **T7** | **Concluir uma partida** | `@ptf_brincar_stats_v1` + `@ptf_bonus_stars` + `@ptf_brincar_daily_v1` | **A rodada só é consumida no resultado terminal** (Decisão 14 da 4C). Falha de estatística **não** concede estrela. Falha de estrela **não** desfaz a partida. `writeStats` **precisa** ter o retorno verificado. |
| **T8** | **Concluir o Monte a Cena** | galeria + progresso de sessão + rodada | Retomar **não** consome nova rodada; concluir **encerra** a sessão. Falha parcial preserva a sessão para retomada; **nunca fabrica rodada** (`P-57`). |
| **T9** | **Baixar um pack** | arquivos em `.tmp` → `.ptf-publish.json` → `moveAsync` → índice | **Já correto:** o marcador é escrito **dentro** de `.tmp` **antes** do `moveAsync` (`packDownloadService.js:665-672`), e a cadeia de escrita do índice é serializada (`packStorageService.js:99-157`). Interrupção deixa `.tmp` descartável; **o pack nunca aparece meio-publicado.** |
| **T10** | **Resetar o progresso** | `multiRemove` de 9 famílias + varredura de prefixo + *blobs* + delegação ao Colorir 60 | **Reset parcial nunca deixa estado contraditório visível.** Se falhar no meio, o app mostra o que restou como verdade e **oferece repetir**; nunca declara "tudo apagado" sem confirmação. |

**Regra transversal das transações:** quando uma operação envolve mais de uma escrita, a ordem é
sempre **do dado mais caro de reproduzir para o mais barato** — arquivo antes de índice, conclusão
antes de recompensa, fato antes de marca de "já vi". Assim, toda falha parcial deixa o sistema no
maior estado defensável.

---

## 11. Migração de dados

### 11.1 Os sete invariantes preservados

1. **Nenhuma conclusão é revogada.**
2. **Nenhuma recompensa é perdida.**
3. **Nenhuma pintura ou arte é apagada.**
4. **Nenhum estado de teste vira entitlement comercial.**
5. **Regra nova não retranca conteúdo antigo.**
6. **Migração é idempotente.**
7. **Migração pode ser retomada após interrupção.**

> Os invariantes 6 e 7 **já estão implementados**: `runLocalMigrations()` persiste a versão após
> cada passo bem-sucedido e interrompe no primeiro erro (`storageMigrationService.js:137-183`).

### 11.2 Os doze contratos de migração

| # | Contrato |
|---|---|
| **M1** | **A versão de schema do app é `@ptf_schema_version`**, hoje em `3`. É a única autoridade sobre "qual formato este aparelho tem". |
| **M2** | **Toda mudança de formato de dado infantil exige um passo de migração numerado**, não um caminho de compatibilidade permanente. Compatibilidade é ponte; migração é destino. |
| **M3** | **Migração roda antes de qualquer superfície declarar estado.** Hoje `runLocalMigrations()` é chamada **fire-and-forget** em `App.js:88` e **não bloqueia a UI** — o que abre janela para uma tela ler formato antigo e concluir errado. **Determinação: as superfícies que declaram conclusão devem aguardar a migração**, ou tratar explicitamente o estado "migrando". |
| **M4** | **Migração nunca apaga a origem antes de confirmar o destino.** Ler, escrever o novo, confirmar, só então limpar — e limpar é opcional. |
| **M5** | **Migração interrompida é retomada do ponto exato**, nunca do início destrutivo. Já garantido pelo executor atual. |
| **M6** | **Migração falha é *fail closed*:** o app abre, o dado antigo continua legível pelo caminho de compatibilidade, e **nada é declarado concluído com base em dado meio-migrado**. |
| **M7** | **Reconciliação das estrelinhas** (Decisão 9 da 4C): o acumulador `@ptf_bonus_stars` e o contador derivado são unificados **somando de forma conservadora**, de modo que **nenhuma estrela seja perdida**. Em dúvida entre dois valores, **prevalece o maior**. |
| **M8** | **Mudança de escopo de armazenamento é migração** (seção 7.2, determinação 7). Se as chaves com sufixo `:<profileId>` mudarem de endereço, o conteúdo **é transportado**, não abandonado. Dado sem dono identificável é **adotado**, nunca descartado. |
| **M9** | **Centralização de chaves é migração** (`P-114`). Se uma chave mudar de nome para entrar na fonte canônica, o passo de migração copia o valor. **Chaves que não podem ser renomeadas com segurança — como `ptf_atelier_arts_v1_index` — são declaradas exceções permanentes na fonte canônica, não renomeadas.** |
| **M10** | **Registros legados de `bookOpened` não são apagados e não causam regressão** (Decisão 3 da 4C). |
| **M11** | **Nenhum estado de teste vira direito comercial.** `@ptf_creator_qa_mode`, `ENABLE_LOCAL_PREMIUM_TEST_MODE` e qualquer premium local fabricado **nunca** migram para `@ptf_entitlement_v1` (Fase 4A). O entitlement, se ilegível, é **descartado e revalidado** — o que é seguro porque leva a `free`, que é *fail closed* (`P-140`). |
| **M12** | **Packs baixados são preservados através da atualização do app** — sujeito à Pergunta 9. Se o contrato de compatibilidade decidir que um pack precisa ser rebaixado, isso é comunicado ao responsável **antes** de qualquer descarte, e o espaço só é liberado com confirmação (`P-137`, `P-134`, `P-126`). |

---

## 12. Reinstalação e troca de aparelho

### 12.1 As dez auditorias

| # | Pergunta | Resposta factual |
|---|---|---|
| **R1** | O que sobrevive à desinstalação? | **Nada.** AsyncStorage e `documentDirectory` são removidos com o app nas duas plataformas. |
| **R2** | Existe backup automático de sistema? | Em Android, o *auto-backup* pode restaurar dados do app conforme configuração da plataforma; em iOS, o backup do iCloud pode incluir o diretório de documentos. **Nenhum dos dois é um compromisso do produto**, nenhum foi validado e **nenhum pode ser prometido à família.** |
| **R3** | Existe exportação? | **Não.** Nenhuma superfície exporta nada. |
| **R4** | Existe importação? | **Não.** |
| **R5** | Existe conta? | **Não** (Fase 4A). |
| **R6** | Existe sincronização? | **Não** (Fase 4A). |
| **R7** | O entitlement sobrevive? | **Sim, por outro caminho:** a compra pertence à loja, não ao app. Reinstalar e revalidar restaura o direito. É a **única** coisa que atravessa a reinstalação. |
| **R8** | Os packs sobrevivem? | **Não** — mas são **rebaixáveis**: o conteúdo pode ser baixado de novo, ao custo de dados e tempo da família. |
| **R9** | As artes da criança sobrevivem? | **Não.** São a perda mais dolorosa e **irreversível** de uma reinstalação. |
| **R10** | O app avisa antes? | **Não existe aviso em lugar nenhum.** |

### 12.2 As determinações

1. **O produto NÃO promete recuperação de dado infantil após reinstalação ou troca de aparelho.**
   A arquitetura local não sustenta essa promessa e **prometer o que não se cumpre é pior do que
   não prometer**.
2. **Nenhuma superfície pode sugerir o contrário** — nem copy, nem loja, nem onboarding, nem área
   dos pais.
3. **O direito comercial é a única coisa restaurável**, porque pertence à loja. Isso pode e deve ser
   dito com clareza ao responsável.
4. **Os packs são rebaixáveis**, e isso deve ser dito: o conteúdo volta, o esforço não.
5. **Se a Pergunta 4 for respondida com exportação no lançamento**, a promessa passa a ser possível
   **na medida exata do que a exportação cobrir** — nunca além.
6. **Enquanto não houver exportação, a área dos pais deve deixar claro, em linguagem adulta e sem
   alarme, que as criações vivem apenas neste aparelho.** Esta é uma determinação de honestidade,
   não de funcionalidade.

---

## 13. Reset e exclusão de dados

### 13.1 Situação factual

- Existem **oito rotinas de reset** implementadas: `resetProgress` (`progressResetService.js:79`,
  acionada em `ParentAreaScreen.js:190`), `resetColoring60Progress` (`:138`),
  `deleteColoring60Artworks` (`:267`, acionada em `ParentAreaScreen.js:252`),
  `resetCreationColoringJourney` (`:429`, dev/QA), `deleteAllAtelierCreations`
  (`atelierResetService.js:43`, acionada em `ParentAreaScreen.js:277`), `clearAllSavedDrawings`
  (`drawingStorage.js:246`), `resetOnboardingForQa` (`onboardingService.js:109`) e
  `resetBeniAppTour` / `resetAllGuides`.
- **Não existe `AsyncStorage.clear()`** — proibido por comentário em três arquivos.
- A confirmação é **dupla e exige digitar a palavra `APAGAR`** (`ParentAreaScreen.js:995-1017,
  1020-1036`, portão em `:564,1011`), com a tela inteira atrás do `ParentalGate` (`:633-646`).
- **"Apagar todos os dados locais" (`ParentAreaScreen.js:1055-1063`) NÃO está implementado:** é um
  cartão informativo com o selo "Em preparação" e **sem `onPress`**.

### 13.2 Os oito tipos de reset × dez determinações

> Determinações comuns a todos os oito tipos:
> **1.** Todo reset é acionado **apenas pelo responsável**, atrás do portão parental.
> **2.** Todo reset declara **antes** exatamente o que apaga e o que preserva.
> **3.** Todo reset que atinge **criação da criança** exige confirmação explícita adicional.
> **4.** Nenhum reset infantil direto apaga criações.
> **5.** Todo reset é **idempotente**.
> **6.** Todo reset **remove** (`multiRemove`), nunca sobrescreve com valor "zerado" (`P-32`).
> **7.** Reset parcial nunca deixa estado contraditório visível (T10).
> **8.** Nenhum reset toca o **entitlement** — direito comprado não se apaga por engano.
> **9.** Todo reset registra o que fez, para o responsável poder entender.
> **10.** Nenhum reset promete apagar o que não apaga.

| # | Tipo | Apaga | **NÃO** apaga | Estado hoje |
|---|---|---|---|---|
| **X1** | **Progresso da jornada** | cenas, quiz, reflexão, Livrinho, estrelinhas, conquistas, Baú, Cultinho, Meu Momento, desenhos legados + *blobs* | criações do Ateliê, packs, perfil, entitlement | **Implementado.** Não cobre guias, onboarding nem Brincar (`P-35`). |
| **X2** | **Progresso do Colorir 60** | marcas `done`/`ever`/`snap` | **as obras** (`deleteColoring60Artworks` é separado) | **Implementado e corretamente separado.** |
| **X3** | **Obras do Colorir 60** | pixels e *blobs* | as conclusões | **Implementado**, com confirmação. |
| **X4** | **Criações do Criar Livre** | índice, entradas e *blobs* do Ateliê | progresso | **Implementado**, com confirmação. |
| **X5** | **Estado dos jogos** | `@ptf_brincar_stats_v1`, `@ptf_brincar_daily_v1` | conquistas derivadas de outras fontes | **NÃO existe.** Pergunta 5. |
| **X6** | **Onboarding e guias** | `@ptf_onboarding_v1`, tour e 6 guias | tudo o mais | Existe **só como rotina de QA**, e **sobrescreve em vez de remover** (`P-32`). Pergunta 5. |
| **X7** | **Packs baixados** | diretórios e entradas do índice | progresso e criações | **NÃO existe** superfície. Relacionado à Pergunta 8. |
| **X8** | **Apagar tudo** | todos os domínios locais, **exceto entitlement** | o direito comprado | **NÃO implementado** — cartão "Em preparação". Pergunta 5. |

---

## 14. Dados corrompidos e reconciliação

### 14.1 As cinco diferenciações obrigatórias

Ao aplicar **C5 — o maior estado defensável é preservado** — é obrigatório distinguir:

1. **Preservar evidência de progresso** — sim, sempre.
2. **Não fabricar conclusão** — nunca declarar concluído o que nenhuma evidência sustenta.
3. **Não fabricar recompensa** — nunca creditar estrela que não se pode provar.
4. **Não conceder autorização comercial** — dúvida **nunca** vira premium, rodada ou desbloqueio.
5. **Não apagar criação recuperável** — se há arquivo no disco, ele manda sobre o índice.

> Em uma frase: **o maior estado defensável se aplica à preservação do que a criança já tem, e nunca
> à concessão do que ela ainda não conquistou.**

### 14.2 Os dez cenários

| # | Cenário | Determinação |
|---|---|---|
| **K1** | `@ptf_progress_{id}` ilegível | Não declarar a história concluída. **Não apagar a chave.** Se houver quiz, reflexão ou desenho da história, **preservar essas evidências** e mostrar a história como em andamento. Nunca retranca a próxima se ela já estava liberada (Decisão 5 da 4C). |
| **K2** | Marca de conclusão do Colorir 60 ilegível, pixels intactos | Estado `readFailed`, **já implementado** (`:223-227`). Não é "não fez". Os pixels sustentam a evidência; a conclusão é reconstruída na próxima escrita bem-sucedida. |
| **K3** | Pixels ilegíveis, conclusão intacta | **A conclusão vale.** Já é o comportamento do Colorir 60 e vira regra do app. A obra perdida é comunicada, não escondida. |
| **K4** | Índice do Ateliê corrompido, arquivos no disco | **Os arquivos mandam.** Reconstruir o índice a partir do diretório `ptf_blobs/atelier/`. **Nunca apagar arquivo por não estar no índice** (diferenciação 5). |
| **K5** | Entrada de arte corrompida, *blob* íntegro | Preservar o *blob*; recompor a entrada com título vazio. **Arte sem título continua sendo arte.** |
| **K6** | `@ptf_bonus_stars` não numérico | **Não zerar.** Preservar o valor bruto para diagnóstico; exibir o contador derivado, que é recalculável; reconciliar pelo **maior valor defensável** (M7). |
| **K7** | `@ptf_brincar_daily_v1` corrompido | Hoje `sanitizeEntry` devolve `used:0` e **libera rodadas** — viola a diferenciação 4. **Determinação: dúvida não concede rodada.** O tratamento correto trata corrupção como saldo indeterminado e resolve de forma conservadora. |
| **K8** | `@ptf_entitlement_v1` corrompido | **Já correto:** `free / invalid_data`, *fail closed*. Descartar e revalidar. |
| **K9** | Índice de packs diz PRONTO e o disco não tem | **Já correto:** rebaixa **só em memória**; sonda indeterminada mantém PRONTO (`packReconcileService.js:42-48`). Nunca apaga arquivo por dúvida. |
| **K10** | Disco tem pack íntegro e o índice não sabe | **Já correto:** `recoverStoryPack` valida por completo e promove; **duas versões válidas devolvem `ambiguous` e nunca adivinham** (`packRecoveryService.js:213-279,245-251`). |

### 14.3 Corrupção sem recuperação possível

Quando **nenhuma evidência** sustenta o estado e **nenhum arquivo** sustenta a criação, o produto
precisa de uma política. **Esta é a Pergunta 6.** As alternativas são:

- **(a)** Preservar o dado ilegível para sempre, mostrar o domínio como vazio e nunca reciclar o
  espaço.
- **(b)** Preservar por uma janela definida (por exemplo, até a próxima atualização do app) e então
  reciclar, com aviso ao responsável.
- **(c)** Reciclar imediatamente e informar o responsável.

Em todas as três, o que **não** muda: não se fabrica conclusão, não se fabrica recompensa, não se
concede direito, e a criança nunca é culpada pela falha.

---

## 15. Backup, exportação e sincronização

Classificação dos seis itens. Os itens 1 a 4 dependem da Pergunta 4; o item 6 depende da
Pergunta 7.

| # | Item | Classificação proposta | Justificativa |
|---|---|---|---|
| **1** | **Exportar as artes da criança** (Ateliê e Colorir 60) para a galeria do aparelho | **PENDENTE — Pergunta 4** | É a única mitigação honesta para R9/R10 da seção 12. Tecnicamente barata: os *blobs* já são arquivos reais. |
| **2** | **Backup completo do progresso** em arquivo | **POSTERIOR AO LANÇAMENTO** | Exige formato versionado, importação, validação e uma superfície de restauração inexistente. Alto custo, benefício concentrado em um caso raro. |
| **3** | **Restauração a partir de backup** | **POSTERIOR AO LANÇAMENTO** | Sem o item 2 não existe. Importar dado infantil de origem não confiável é um risco novo que o lançamento não precisa assumir. |
| **4** | **Sincronização entre aparelhos** | **NÃO FAZ PARTE DO PRODUTO** (de lançamento) | Fase 4A: **o lançamento não promete sincronização.** Exigiria conta e *backend*. |
| **5** | **Backup automático da plataforma** (Android auto-backup / iCloud) | **NÃO FAZ PARTE DO PRODUTO** | Não é controlável, não foi validado e **não pode ser prometido**. Pode ser um alívio silencioso; nunca um compromisso. |
| **6** | **Certificados, cards de compartilhamento e relatório semanal** | **PENDENTE — Pergunta 7** | Os três serviços existem no código e **não têm nenhum consumidor de runtime** (`P-82`). **Não podem virar compromisso de lançamento sem decisão do fundador.** |

---

## 16. Implementação futura

Nada aqui é implementado nesta fase. Distribuição por fase do Roteiro:

| Fase | Códigos | Escopo |
|---|---|---|
| **7** | `P-32` | Reset produz ausência, não valor. |
| **9** | `P-13` `P-50` `P-52` | Fato próprio de conclusão do Colorir; escrita aguardada; correção documental. |
| **10** | `P-49` | Destino da arte da criança no Livrinho. |
| **11** | `P-35` `P-39` `P-82` | Cobertura do reset; reconciliação das estrelinhas; destino dos três serviços. |
| **12A** | `P-55` `P-56` `P-57` `P-61` `P-62` `P-69` `P-71` `P-86` | Rodadas, escopo do perfil, persistência dos jogos. **`P-56` é BLOQUEIA LANÇAMENTO.** |
| **12B** | `P-40` `P-41` `P-44` `P-53` `P-108` | Fronteira do dia, idempotência, fonte canônica do Meu Momento. |
| **17** | `P-116` `P-120` `P-124` `P-125` `P-126` `P-134` `P-137` `P-138` | Packs: integridade, disco, compatibilidade e migração. |
| **18** | `P-129` `P-140` | Entitlement: janela offline e migração. |
| **19** | `P-46` `P-114` | Contrato de escrita visível; fonte canônica de chaves. |

---

## 17. Validação futura

| Sigla | Significado | Aplicação nesta fase |
|---|---|---|
| **`VFP`** | Validação física em aparelho | `P-13` `P-35` `P-39` `P-40` `P-41` `P-44` `P-46` `P-49` `P-50` `P-53` `P-55` `P-56` `P-57` `P-61` `P-62` `P-69` `P-71` `P-86` `P-108` `P-114` `P-116` `P-129` `P-138` |
| **`MIG`** | Prova de migração com dado legado real | `P-39` `P-114` `P-126` `P-134` `P-137` `P-140` |
| **`REI`** | Prova de reinstalação | `P-35` `P-62` `P-114` `P-137` |
| **`TEL`** | Telemetria / prova de servidor e rede | `P-114` `P-116` `P-120` `P-124` `P-125` `P-134` `P-138` |

**Provas físicas mínimas que a Fase 4D exige antes do lançamento:**

1. Desligar o armazenamento (disco cheio) e confirmar que **nenhuma** superfície concede conclusão,
   estrela, rodada ou premium (C2, C3, `P-56`).
2. Corromper deliberadamente cada uma das chaves da seção 3 e confirmar os dez cenários da
   seção 14.
3. Instalar sobre uma base com dados legados (schema 1 e 2) e provar os sete invariantes da
   seção 11.
4. Interromper a migração pela metade, reabrir o app e provar retomada sem perda.
5. Executar cada um dos oito resets da seção 13 e conferir a lista exata do que sumiu e do que
   ficou.
6. Reinstalar e confirmar que o app **não promete** o que não cumpre.
7. Encher o disco com packs e provar o comportamento do teto (Pergunta 8).
8. Deixar o aparelho offline além da janela de 7 dias e exercitar `P-129`.

---

## 18. Perguntas ao fundador

> **Nenhuma destas perguntas foi escolhida por mim.** As dez foram formuladas no artefato
> preliminar e **respondidas pelo fundador em 2026-08-05**; cada resposta está transcrita ao final
> da respectiva pergunta, no bloco **✅ RESPOSTA DO FUNDADOR**, sem alterar o texto original da
> pergunta. Perguntas já respondidas nas Fases 4A, 4B e 4C **não** foram repetidas.

---

### Pergunta 1 — As rodadas diárias são por instalação ou por criança?

**1. Contexto.** `@ptf_brincar_daily_v1` é uma chave única e global, compartilhada pelos quatro
jogos e por todas as crianças do aparelho. Ao mesmo tempo, o Monte a Cena escopa seu progresso por
`profileId`. **O produto usa dois escopos diferentes hoje** (conflito D-3).

**2. Alternativas.**
- **(A) Por instalação** — comportamento atual. O limite diário é da família no aparelho.
- **(B) Por criança local identificada** — cada criança tem seu saldo. Exige `childId` real,
  superfície de troca de criança e escopagem de todos os domínios.
- **(C) Por conta familiar sincronizada** — **incompatível com o lançamento** (exigiria conta e
  *backend*; a Fase 4A já decidiu que não há sincronização).

**3. Recomendação técnica.** **(A)**, por ser o comportamento atual, por não introduzir migração em
um domínio que já tem um defeito bloqueante, e porque rodada diária **não é dado infantil
preservável** — expira em 24 horas.

**4. Consequências.**
- Escolhendo **(A)**: nada muda no escopo; um tablet com duas crianças divide o mesmo saldo, e a
  segunda criança pode encontrar o limite esgotado sem ter jogado.
- Escolhendo **(B)**: a Pergunta 2 vira **pré-requisito bloqueante** e sobe ao caminho crítico; e o
  produto gratuito fica proporcionalmente mais generoso em aparelhos com várias crianças.
- Escolhendo **(C)**: o lançamento é adiado por dependência de *backend*.

**5. Códigos afetados.** `P-56` `P-57` `P-62` `P-86` `P-114`.

**6. Altera decisão anterior?** **Não.** A Decisão 14 da 4C fixou **quando** a rodada é consumida;
esta pergunta fixa **de quem** ela é.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — as rodadas pertencem à CRIANÇA LOCAL.**

O contrato permanece de **duas rodadas por criança local por dia**. Como o lançamento terá **apenas
uma criança local por instalação**, o efeito prático é equivalente a duas por instalação, **mas a
propriedade semântica do contador pertence à criança**. A implementação futura deverá usar um
**`childId` local estável**, e **`avatarId` nunca poderá ser usado como identidade ou endereço de
armazenamento**. Trocar avatar, nome ou aparência **não** reinicia rodadas e **não** cria outra
criança. O contador continua **compartilhado entre os quatro jogos**.

A alteração do relógio **não** deverá conceder vantagem silenciosa; a política técnica será
especificada na fase de implementação, **preservando a fronteira de dia local e o comportamento
*fail closed***.

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 12A e 19) · **risco técnico
NÃO corrigido** · validação física ainda exigida. Conflito **D-3 resolvido**.
`P-40` `P-56` `P-57` `P-61` `P-86` `P-146`.

---

### Pergunta 2 — Quantas crianças o lançamento suporta por aparelho?

**1. Contexto.** Existem **dois sistemas de perfil** e eles não se falam. O legado `@ptf_profile`
não tem `id`; o moderno `@ptf_child_profiles_v1` tem `id` real e **nenhuma tela o consulta**. Como
`DEFAULT_PROFILE` não tem `id`, sete telas resolvem o escopo de armazenamento no **`avatarId`** —
ou seja, **o dado é endereçado pela aparência**. Trocar de avatar órfã o progresso do Monte a Cena;
duas crianças com o mesmo avatar compartilham o mesmo balde em silêncio.

**2. Alternativas.**
- **(A) Uma criança por instalação no lançamento.** O escopo de tudo passa a ser a instalação; as
  três chaves com sufixo `:<profileId>` migram para um identificador estável.
- **(B) Várias crianças, com perfis reais.** Exige `childId` estável, superfície de troca, e
  escopagem de **todos** os domínios de dado infantil — não só três.
- **(C) Congelar como está.** O dado continua endereçado pelo avatar.

**3. Recomendação técnica.** **(A)** para o lançamento. Ela é honesta com o que o runtime faz hoje
(quase tudo já é global ao aparelho), elimina o defeito do avatar-como-endereço com uma migração
pequena e não fecha a porta para (B) depois. **(C) é a única alternativa que recomendo descartar**:
manter o avatar como endereço de dado é um defeito silencioso que só aparece quando a criança troca
de avatar — e aí o progresso já sumiu aos olhos dela.

**4. Consequências.**
- **(A)**: migração das três chaves `:<profileId>`; nenhum dado perdido; o produto deixa de
  insinuar múltiplos perfis onde não os tem.
- **(B)**: trabalho substancial em 7 telas mais toda a escopagem; alto risco de migração; e força a
  OPÇÃO B da Pergunta 1.
- **(C)**: convive com um defeito de perda percebida de progresso.

**5. Códigos afetados.** `P-62` `P-55` `P-114` (e, por dependência, `P-35`).

**6. Altera decisão anterior?** **Não.** A Fase 4A já fixou que não há conta nem sincronização.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — uma única criança local por instalação.**

Contrato de sete itens: (1) criar **identificador local estável**; (2) nome e avatar são
**atributos editáveis**; (3) **trocar avatar não troca identidade**; (4) **sem** seletor de
múltiplas crianças; (5) **sem** sincronização; (6) o formato deve **permitir evolução futura** para
múltiplos perfis; (7) **os dados legados globais deverão ser associados ao perfil local criado,
nunca abandonados**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 12A e 19) · **risco técnico
NÃO corrigido**. Conflito **D-2 resolvido**. `P-62` `P-141` (código novo) `P-55` `P-114`.

---

### Pergunta 3 — O que o produto promete preservar após reinstalação ou troca de aparelho?

**1. Contexto.** Hoje: **nada** sobrevive à desinstalação, exceto o direito comprado, que pertence à
loja. Não há exportação, importação, conta nem sincronização. **E o app não avisa em lugar nenhum.**
As artes da criança são a perda mais dolorosa e irreversível.

**2. Alternativas.**
- **(A) Promessa zero explícita.** A área dos pais diz, em linguagem adulta e sem alarme, que as
  criações vivem apenas neste aparelho.
- **(B) Promessa zero silenciosa.** Não dizer nada.
- **(C) Promessa parcial**, condicionada à Pergunta 4 (exportação): "suas artes podem ser salvas na
  galeria do aparelho".

**3. Recomendação técnica.** **(A)** no mínimo, e **(C)** se a Pergunta 4 aprovar a exportação.
**(B) deve ser descartada:** o silêncio faz a família descobrir a perda no pior momento possível.

**4. Consequências.**
- **(A)**: exige uma frase honesta na área dos pais. Custo próximo de zero.
- **(B)**: risco reputacional real e reclamação previsível na loja.
- **(C)**: depende da Pergunta 4.

**5. Códigos afetados.** Nenhum código específico — é um contrato de produto que atravessa toda a
seção 12.

**6. Altera decisão anterior?** **Não.** Consolida a Fase 4A.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — sem promessa falsa.**

O produto **não promete** recuperar dados infantis após a desinstalação. **Somente o direito
comercial do Plano Família é restaurável** pela conta da loja. **Não há garantia** para progresso,
pinturas, artes, perfil, estrelinhas, conquistas, resultados de jogos ou *downloads*.

**Copy obrigatória na Área dos Pais:** *"Desinstalar o aplicativo pode apagar o progresso e as
criações salvas neste aparelho."*

Um eventual **backup automático do sistema operacional pode existir, mas não é compromisso do
produto**.

**Estado:** decisão **resolvida** · aviso **pendente** (Fase 19) · **risco técnico NÃO corrigido**.
`P-144` (código novo) `P-129` `P-140`.

---

### Pergunta 4 — Existe exportação de artes no lançamento?

**1. Contexto.** As artes do Ateliê e as obras do Colorir 60 **já são arquivos reais** em
`documentDirectory` (`ptf_blobs/atelier/` e `drawings60/`). Exportar para a galeria do aparelho é,
tecnicamente, a mitigação mais barata que existe para a perda descrita na Pergunta 3.

**2. Alternativas.**
- **(A) Exportar arte individual** para a galeria, a partir da tela da obra.
- **(B) Exportar tudo de uma vez**, a partir da área dos pais.
- **(C) Sem exportação no lançamento.**

**3. Recomendação técnica.** **(A)**. É a menor superfície nova, resolve o caso que dói mais (a arte
favorita), não exige formato versionado nem importação, e cria um caminho natural para (B) depois.

**4. Consequências.**
- **(A)** ou **(B)**: exige permissão de galeria, superfície nova e validação física — trabalho
  real, ainda que pequeno. Permite a promessa parcial da Pergunta 3.
- **(C)**: mantém a promessa zero e o risco reputacional intacto.
- **(B)** isolado carrega risco de expor muitos arquivos de uma vez sem controle fino.

**5. Códigos afetados.** Nenhum código atual — é funcionalidade nova. Relaciona-se a `P-49`.

**6. Altera decisão anterior?** **Não.** Não é sincronização nem backup: é uma cópia local e
manual, sob controle do responsável.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — exportação individual, com portão parental.**

O lançamento permite exportar **individualmente**: (1) **pinturas do Colorir com o Beni**;
(2) **artes salvas do Criar Livre no Plano Família**.

Contrato de oito itens: **portão parental obrigatório** · folha de compartilhamento nativa ou
salvamento autorizado · **nenhuma chamada infantil para rede social** · **nenhum nome da criança
incluído automaticamente** · **nenhum identificador interno ou dado de progresso acompanha a
imagem** · **sem** importação de volta · **sem** backup completo no lançamento · **não utilizar
automaticamente `certificateService`, `shareCardService` ou serviços antigos para implementar a
exportação**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 10) · **risco técnico NÃO
corrigido**. `P-49` `P-82`.

---

### Pergunta 5 — Quais tipos de reset existem no lançamento?

**1. Contexto.** Existem oito rotinas de reset, mas apenas quatro têm superfície na área dos pais.
`resetProgress` **não cobre** guias, onboarding, jogos, Monte a Cena, packs, perfil nem Colorir 60
em pixels (`P-35`). `resetOnboardingForQa` **sobrescreve em vez de remover** (`P-32`). E **"Apagar
todos os dados locais" é um cartão "Em preparação" sem `onPress`** — o produto **anuncia uma
capacidade que não tem**.

**2. Alternativas.**
- **(A) Manter os quatro resets atuais** e **remover o cartão "Em preparação"**, que promete o que
  não existe.
- **(B) Manter os quatro e implementar "Apagar tudo"** de verdade, preservando o entitlement.
- **(C) Redesenhar a lista completa** (os oito tipos X1–X8 da seção 13.2), incluindo reset de jogos
  e de packs.

**3. Recomendação técnica.** **(B)**, com a correção de `P-35` embutida: consertar a cobertura de
`resetProgress` e implementar "Apagar tudo" com a mesma confirmação dupla que já existe. **A opção
(A) é aceitável se o prazo apertar, mas o cartão "Em preparação" precisa sair de qualquer forma** —
ele é uma promessa não cumprida na tela.

**4. Consequências.**
- **(A)**: menor custo; a família fica sem caminho para "começar do zero de verdade".
- **(B)**: custo médio; resolve o caso de doação/venda do aparelho.
- **(C)**: maior custo; reset de packs é útil (libera disco) mas depende da Pergunta 8.

**5. Códigos afetados.** `P-32` `P-35` `P-114` (e `P-116` se (C)).

**6. Altera decisão anterior?** **Não.** Confirma C4 (nenhum dado infantil apagado para resolver
inconsistência — o que não impede o responsável de apagar **deliberadamente**).

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — quatro operações distintas.**

**A. Recomeçar a jornada** — apaga progresso, quiz, reflexão, estrelinhas, conquistas, resultados
dos jogos, rodadas diárias e os estados de *onboarding* e guias ligados à jornada; **preserva**
pinturas, artes do Criar Livre, *entitlement*, *downloads* e perfil básico.
**B. Apagar downloads** — somente *packs* e temporários.
**C. Apagar uma criação** — individual, com confirmação do responsável.
**D. Apagar todos os dados locais** — perfil, progresso, criações, jogos e *downloads*; exige
**portão parental, confirmação dupla, digitação da palavra `APAGAR` e lista explícita** do que será
perdido.

O **direito comprado na loja não é apagado** e poderá ser restaurado. **Logout, *downgrade* e perda
do *entitlement* nunca equivalem a reset.** O cartão **"Em preparação" deverá ser removido ou
substituído pela operação real antes do lançamento**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 11 e 19) · **risco técnico
NÃO corrigido** · validação física ainda exigida. Conflito **D-7 resolvido**.
`P-35` `P-32` `P-145` (código novo).

---

### Pergunta 6 — Qual a política para dado corrompido sem recuperação possível?

**1. Contexto.** Os dez cenários da seção 14.2 estão resolvidos por evidência cruzada. Resta o caso
em que **nada** sustenta o estado: chave ilegível, nenhum arquivo, nenhuma evidência lateral.

**2. Alternativas.**
- **(A) Preservar para sempre.** O dado ilegível fica no armazenamento indefinidamente; o domínio
  aparece vazio; o espaço nunca é reciclado.
- **(B) Preservar por uma janela definida** — por exemplo, até a próxima atualização do app — e
  então reciclar, avisando o responsável.
- **(C) Reciclar imediatamente**, informando o responsável.

**3. Recomendação técnica.** **(B)**. Preserva a chance de recuperação por uma versão futura do app
(que pode aprender a ler o formato), sem acumular lixo para sempre, e mantém o responsável
informado. **(A) é defensável e mais conservadora**; **(C) é a única que contraria o espírito de
C4** e recomendo evitar.

**4. Consequências.**
- **(A)**: zero risco de perda; acúmulo indefinido de dado ilegível.
- **(B)**: exige carimbo de "detectado em" e um aviso ao responsável.
- **(C)**: simples, mas fecha a porta para recuperação futura.

**Em todas as três**, permanece inalterado: não se fabrica conclusão, não se fabrica recompensa,
não se concede direito comercial, e **a criança nunca é culpada pela falha**.

**5. Códigos afetados.** `P-46` `P-114` e todos os domínios da seção 3.

**6. Altera decisão anterior?** **Não.** Detalha C4 e C5.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — quarentena com tentativa de recuperação.**

Doze itens: (1) **não sobrescrever imediatamente** o *payload* corrompido; (2) **preservar o
original em quarentena**; (3) executar **reparo determinístico**; (4) **preservar blobs e criações
recuperáveis**; (5) usar **estado seguro** durante o reparo; (6) ***fail closed*** a *entitlement*,
rodadas, recompensas e desbloqueios; (7) **não fabricar** conclusão ou recompensa; (8) **não
interpretar falha de leitura como atividade não realizada**; (9) informar o responsável **somente
quando houver risco real de perda**; (10) manter a quarentena por **trinta dias**; (11) manter no
máximo **três versões por domínio**; (12) remover depois **somente o comprovadamente
irrecuperável**.

**Copy de referência:** *"Encontramos um problema em alguns dados deste aparelho. O Mundo do Beni
preservou o que conseguiu e está usando um estado seguro."* **Não mostrar linguagem técnica à
criança.**

**Estado:** decisão **resolvida** · implementação **pendente** (Fases 12A e 19) · **risco técnico
NÃO corrigido**. `P-146` (código novo) `P-46` `P-41`.

---

### Pergunta 7 — Qual o destino de certificados, cards de compartilhamento e relatório semanal?

**1. Contexto.** `certificateService`, `shareCardService` e `weeklyReportService` existem no código,
gravam em índices próprios (`@ptf_certificates_v1_index`, `@ptf_share_cards_v1_index`) e **são os
únicos consumidores dos geradores de `storageKeys.js`** — que, por sua vez, **não são chamados por
nenhuma tela**. Ou seja: **zero recompensa imprimível ou compartilhável no app hoje** (`P-82`).

**2. Alternativas.**
- **(A) Fora do lançamento**, código preservado e declarado como dívida nomeada.
- **(B) Dentro do lançamento**, com superfícies novas para os três.
- **(C) Dentro do lançamento apenas o certificado**, que é o de maior valor emocional para a
  família.
- **(D) Remover o código morto.**

**3. Recomendação técnica.** **(A)**. Os três exigem superfície, arte, copy e — no caso do card de
compartilhamento — uma decisão de privacidade infantil que **não foi tomada em nenhuma fase**.
Trazê-los para o lançamento adiciona escopo de produto, não apenas de código. **(D) deve ser
evitada agora**: o código não custa nada parado e apagá-lo destrói trabalho já feito.

**4. Consequências.**
- **(A)**: nenhuma; a matriz já classifica `P-82` como NÃO BLOQUEIA.
- **(B)**: escopo novo relevante, incluindo compartilhamento de conteúdo produzido por criança —
  território sensível.
- **(C)**: escopo menor; o certificado é o item que mais se aproxima de estar pronto.
- **(D)**: perde trabalho e não ganha nada mensurável.

**5. Códigos afetados.** `P-82` `P-39` `P-114`.

**6. Altera decisão anterior?** **Não.** Nenhuma fase anterior prometeu estes três serviços.
**Esta é exatamente a decisão que a ETAPA 13 exige que não seja tomada sem o fundador.**

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — fora do v1, após re-auditoria.**

Certificados, *share cards* e relatório semanal ficam **fora do v1**. O fundador exigiu
**re-auditoria antes de classificar arquivos**, porque *"o corpus anterior contém resultados
divergentes sobre serem três serviços mortos ou um serviço inteiro e exports órfãos"*.

**Resultado da re-auditoria — as duas leituras eram parcialmente verdadeiras e descreviam coisas
diferentes:**

| Categoria | Achado medido no commit canônico | Destino |
|---|---|---|
| **Três módulos inteiramente mortos** | `certificateService.js`, `shareCardService.js`, `weeklyReportService.js` — **zero importadores** em `src/` e em `App.js`; únicas referências externas são declarações de chave em `storageKeys.js` | `P-82` |
| **Dois *exports* órfãos em módulos VIVOS** | `getStoryRewardBreakdown` (`rewardService.js:33`) — o módulo vive por `getRewardsSummary`, consumido por `ProgressContext.js:19`; `clearSeenAchievements` (`achievementsStorage.js:35`) — o módulo vive por `getSeenAchievements`/`markAchievementSeen`, que chegam às telas por `achievementSeenService.js:8-9` | **`P-148` (código novo)** |
| **Cadeia `totalBonusStars`** | **NÃO é código morto.** Escrita **viva e aguardada** em **8 pontos**: `QuizScreen.js:106`, `ReflectionScreen.js:75`, `LumiMomentScreen.js:38`, `ParesDoBeniScreen.js:405`, `CadeAOvelhinhaScreen.js:430`, `:473`, `:584`, `PalavrinhasDoBeniScreen.js:368`; leitura até `ProgressContext.js:140`; **apenas o consumo final é inexistente** | `P-39` — **sem remoção** |
| **Suíte de fumaça fixando o código morto** | `scripts/smoke.js:1770-1772` exige `getStoryRewardBreakdown`; `:6459-6461` lê os três serviços; `:6532-6538`, `:6542-6554`, `:6558-6564` asseguram seus *exports*; `:49429` semeia `@ptf_plan_state_v1` | **`P-147` (código novo)** |

**Consequência prática registrada:** a cadeia de bônus **não pode ser removida** — apagá-la
destruiria estrelinhas realmente conquistadas, contra a Decisão 9 da Fase 4C.

**Decisões:** não ativar nenhum no lançamento · **remover do runtime apenas o comprovadamente
morto** · preservar o histórico no Git · registrar as ideias no *backlog* pós-lançamento ·
**ajustar as verificações de fumaça que mantêm código morto artificialmente** · **não** usar esses
serviços como implementação automática da exportação.

**Estado:** decisão **resolvida** · remoção e ajuste da suíte **pendentes** (Fase 16) · **risco
técnico NÃO corrigido**. Conflito **D-13 resolvido**.

---

### Pergunta 8 — Quanto do aparelho da família o app pode ocupar?

**1. Contexto.** Não existe teto de disco e não existe limpeza de órfãos. Um *bump* de versão
**deliberadamente não apaga o diretório antigo** (`packDownloadService.js:171-177`), então cada
atualização de pack **soma** ocupação. Existe apenas um *precheck* de espaço antes do download
(margem de 20% ou piso de 20 MB). Somado às 18 histórias premium já embarcadas no binário
(80,3 MB, `P-136`), a ocupação total pode crescer sem limite declarado.

**2. Alternativas.**
- **(A) Teto declarado** (por exemplo, um limite total de packs), com limpeza automática da versão
  mais antiga quando excedido.
- **(B) Sem teto, com limpeza automática de órfãos** — apaga apenas versões antigas já
  substituídas.
- **(C) Sem teto e sem limpeza automática**, com superfície na área dos pais para o responsável
  apagar packs manualmente.
- **(D) Manter como está.**

**3. Recomendação técnica.** **(B) mais (C)**: limpar automaticamente o que é comprovadamente órfão
(versão antiga de um pack cuja versão nova está PRONTA e validada) e dar ao responsável uma
superfície para liberar espaço deliberadamente. **(A) é arriscada** — um teto mal calibrado pode
apagar conteúdo que a família quer manter. **(D) deve ser descartada:** ocupação sem limite em
aparelho infantil compartilhado é uma reclamação certa.

**4. Consequências.**
- **(B)**: exige provar que a versão nova está íntegra **antes** de apagar a antiga — o que a
  arquitetura de reconciliação já sabe fazer.
- **(C)**: superfície nova na área dos pais e o reset X7 da seção 13.2.
- **(A)**: exige decidir o número, e errar o número custa conteúdo.

**5. Códigos afetados.** `P-116` `P-137` `P-138` (e `P-136` como contexto).

**6. Altera decisão anterior?** **Não.** A Fase 4B decidiu **o que** se baixa; esta decide **quanto
tempo fica no aparelho**.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — sem limite rígido para as criações; piso de espaço para downloads.**

**Não** haverá limite rígido automático para as criações da criança. Para *downloads*, sete itens:
calcular tamanho necessário e margem para **instalação atômica** · **bloquear o download que deixe
o aparelho com menos do que o MAIOR valor entre 2 GB livres e 10% da capacidade total** · mostrar
**uso de armazenamento na Área dos Pais** · permitir **remoção individual ou total de packs** ·
limpar automaticamente **apenas temporários e downloads incompletos** · **nunca apagar pinturas,
artes ou progresso automaticamente** · **informar a falta de espaço antes de iniciar o download**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 17) · **risco técnico NÃO
corrigido**. Conflito **D-12 resolvido**. `P-116` — **absorvido, sem código novo** (ver §20.3).

---

### Pergunta 9 — Um pack baixado sobrevive à atualização do app?

**1. Contexto.** O marcador de disco `.ptf-publish.json` grava `appVersion`, hoje congelado em
`1.0.0`. Na primeira atualização real do app, packs já baixados podem ser considerados
incompatíveis e **rebaixados**, obrigando a família a baixar tudo de novo — consumindo dados e
tempo. Some-se a isso que a mesma semântica de versão mínima aparece com **dois nomes diferentes**
(`requiredAppVersion` no índice, `minAppVersion` no pack) e que **não existe rota de migração de
schema de packs** (`P-137`, `P-134`, `P-126`).

**2. Alternativas.**
- **(A) Compatibilidade por padrão.** Um pack baixado permanece válido a menos que o manifesto
  declare explicitamente uma versão mínima maior que a instalada.
- **(B) Revalidação por atualização.** Toda atualização do app revalida a integridade dos packs
  (hash do manifesto) e mantém os que passarem.
- **(C) Rebaixar tudo a cada atualização.** Comportamento mais previsível de implementar, mais caro
  para a família.

**3. Recomendação técnica.** **(A) mais (B)**: compatibilidade por padrão, com revalidação de
integridade na primeira abertura após a atualização. É o que preserva o investimento de dados da
família sem abrir mão da integridade. **(C) deve ser descartada** — obrigar uma família com internet
limitada a rebaixar dezenas de megabytes a cada atualização é um custo real imposto por conveniência
de implementação.

**4. Consequências.**
- **(A)+(B)**: exige unificar `requiredAppVersion`/`minAppVersion` em um nome só com uma semântica
  só, e descongelar `appVersion`.
- **(C)**: simples de implementar e caro para o usuário.
- **Em qualquer caso**: se um pack **precisar** ser descartado, isso é comunicado ao responsável
  **antes**, e o espaço só é liberado com confirmação (M12).

**5. Códigos afetados.** `P-126` `P-134` `P-137` (e `P-116` para o espaço liberado).

**6. Altera decisão anterior?** **Não.** A Fase 4B fixou o contrato de conteúdo; esta fixa o
contrato de **sobrevivência** do conteúdo baixado.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — packs compatíveis sobrevivem.**

*Packs* válidos e compatíveis **sobrevivem à atualização normal**. Na abertura após a atualização,
nove itens: **revalidar manifesto, schema, versão mínima e hashes** · manter disponível o *pack*
compatível · **marcar o incompatível como exigindo atualização** · **não usar** *pack* incompatível
· **não apagar a versão anterior antes de a nova ser instalada e validada** · fazer **substituição
atômica** · **preservar progresso e criações** · em modo offline, **manter o pack inerte e informar
ao responsável** · apagar automaticamente **somente temporários, incompletos ou versões já
substituídas com sucesso**.

**Estado:** decisão **resolvida** · implementação **pendente** (Fase 17) · **risco técnico NÃO
corrigido**. Conflito **D-11 resolvido**. `P-126` `P-134` `P-137` `P-120` `P-124` `P-125` `P-138`.

---

### Pergunta 10 — O lançamento passa a ter uma fonte canônica única de chaves?

**1. Contexto.** `src/services/storageKeys.js` declara 20 chaves estáticas e 11 geradores
dinâmicos. **Nenhum dos 11 geradores é usado por tela ativa** — os únicos 4 com chamador vivem em
módulos órfãos (Pergunta 7). Todo consumidor ativo redeclara a literal localmente: são **136
ocorrências de `@ptf` em 39 arquivos**. `@ptf_plan_state_v1` está declarada e **não tem leitor nem
escritor em todo o `src/`**. Sem fonte única, **nenhum reset, nenhuma migração e nenhuma exportação
pode ser provada completa** — e é exatamente por isso que `P-35` existe.

**2. Alternativas.**
- **(A) Centralização total antes do lançamento.** Todas as chaves passam por `storageKeys.js`, com
  exceções nomeadas (como o índice legado do Ateliê, que **não pode ser renomeado**).
- **(B) Centralização parcial**, cobrindo apenas os domínios que o reset e a migração precisam
  enxergar.
- **(C) Congelar como está** e documentar o inventário disperso como dívida declarada.

**3. Recomendação técnica.** **(B)**. A centralização total (A) toca 39 arquivos e é uma refatoração
ampla perto do lançamento — exatamente o tipo de mudança que a governança do projeto manda medir
antes de fazer. A (B) entrega o que as decisões desta fase realmente exigem (reset completo,
migração provável, exportação possível) com uma fração do risco. **(C) é aceitável apenas se
acompanhada de um inventário versionado**, porque sem ele as Perguntas 5 e 6 ficam sem base
verificável.

**4. Consequências.**
- **(A)**: refatoração ampla, alto risco de erro de digitação em nome de chave — e errar um nome de
  chave **apaga dado da criança aos olhos dela**.
- **(B)**: escopo controlado; a dívida restante fica declarada.
- **(C)**: `P-35` e `P-114` permanecem abertos e o reset continua sem cobertura provável.

**Importante em qualquer alternativa:** **nenhuma chave é renomeada sem passo de migração** (M9), e
`ptf_atelier_arts_v1_index` **não é renomeada em hipótese alguma** — o próprio código registra que
renomeá-la apagaria a galeria de quem já usa o app.

**5. Códigos afetados.** `P-114` `P-35` `P-32` `P-53`.

**6. Altera decisão anterior?** **Não.** É a condição de verificabilidade das decisões desta fase.

**✅ RESPOSTA DO FUNDADOR (2026-08-05) — centralização PROGRESSIVA.**

Dez itens: toda chave nova nasce em `storageKeys.js` · **nenhum literal novo** fora da fonte
canônica · **preservar valores físicos legados** quando renomear criar risco · expor chaves legadas
por constantes ou funções canônicas · **não renomear `ptf_atelier_arts_v1_index`** · escritores e
leitores usam a constante canônica · reset, migração, diagnóstico e exclusão total usam o **mesmo
inventário** · remover literais duplicados nas fases proprietárias · **remover chave morta somente
depois de auditoria de leitores, escritores, histórico e necessidade de migração** · **não apagar
chave baseada apenas em busca textual superficial**.

**Estado:** decisão **resolvida** · centralização **pendente** (Fase 19) · **risco técnico NÃO
corrigido**. Conflito **D-9 resolvido**. `P-114` `P-143` (código novo) `P-141`.

---

## 19. Critérios de saída da Fase 4D

**Todos os doze critérios estão satisfeitos.**

| # | Critério | Estado |
|---|---|---|
| 1 | As 10 perguntas da seção 18 estão respondidas pelo fundador. | ✅ **Concluído** — 10 de 10 |
| 2 | O conflito de escopo das rodadas (D-3) está resolvido por decisão explícita. | ✅ **Concluído** — rodadas por **criança local**; `avatarId` nunca como identidade |
| 3 | O escopo de armazenamento por criança/instalação está fixado. | ✅ **Concluído** — **uma criança local por instalação**, com `childId` estável |
| 4 | A promessa de preservação após reinstalação está declarada. | ✅ **Concluído** — só o direito comercial; aviso obrigatório na Área dos Pais |
| 5 | A política de dado corrompido sem recuperação está fixada. | ✅ **Concluído** — quarentena de **30 dias**, máximo de **3 versões por domínio** |
| 6 | O destino dos três serviços mortos está decidido. | ✅ **Concluído** — **fora do v1**, após re-auditoria (ver Pergunta 7) |
| 7 | Os 33 códigos da seção 2 têm decisão de produto registrada. | ✅ **Concluído** — **25** decorriam de contratos já aprovados e **8** dependiam do fundador (contagem corrigida na §0.1); todos os 33 anotados na matriz |
| 8 | O inventário dos 15 domínios está completo e conferido. | ✅ **Concluído** — seção 3 |
| 9 | Os 5 contratos fundacionais permanecem intactos. | ✅ **Concluído** — seção 4.1, reforçados pelas 16 ratificações da §20.1 |
| 10 | Nenhuma decisão de fase anterior foi reaberta. | ✅ **Concluído** — §20.5 |
| 11 | `docs/DECISIONS.md`, a matriz canônica e o v5 recebem as decisões **depois** das respostas. | ✅ **Concluído** — matriz regenerada pelo gerador determinístico (`P-01`..`P-148`), bloco `PL4D` em `DECISIONS.md`, v5 atualizado |
| 12 | Nenhum código, asset, pack, manifesto ou configuração foi alterado. | ✅ **Concluído** — *diff* executável vazio contra `015c438` |

---

## 20. Consolidação da Fase 4D

### 20.1 As dezesseis ratificações do fundador

Valem sobre **todos** os domínios da §3, sem exceção:

1. **Falha de leitura não é ausência.**
2. **Fato próprio não é inferido de subproduto** de outro domínio.
3. **Perder o pixel não apaga a conclusão** já registrada.
4. **Nenhuma superfície recalcula sua própria conclusão.**
5. **Falha de escrita é visível e *fail closed*.**
6. **Recompensa somente depois da persistência confirmada.**
7. **Nenhum dado infantil é apagado para resolver inconsistência.**
8. **O maior estado defensável preserva apenas o que já foi conquistado.**
9. **O maior estado defensável nunca concede o que ainda não foi conquistado.**
10. **Migração é idempotente e retomável.**
11. **Migração deve terminar antes de qualquer superfície consumir o domínio migrado.**
12. **Atualização normal deve preservar dados locais.**
13. **Perda do *entitlement* não apaga dado infantil.**
14. **Estado de teste nunca vira direito comercial.**
15. ***Pack* instalado e autorização comercial são fatos independentes.**
16. **Estado de *download* pertence ao aparelho, nunca ao índice remoto.**

Os itens 8 e 9 formam um **par indivisível**: juntos, definem que o maior estado defensável é um
**teto**, não um piso — preserva tudo o que foi conquistado e **não** inventa nada.

### 20.2 Rastreabilidade — os sete itens de verificação obrigatória

A regra do fundador foi aplicada literalmente: **não criar código por simples ampliação de
evidência**, e criar **somente quando fato, consequência e correção forem realmente distintos**.
Cada item foi confrontado com `P-01` a `P-140` **antes** de receber número.

| # | Item verificado | Já coberto? | Desfecho |
|---|---|---|---|
| **a** | Avatar usado como escopo de dados | **Não** — `P-62` enuncia só a ausência do campo `id`; `P-114` trata de **onde a chave é declarada**, não do **valor que a endereça** | **`P-141`** — novo · `CRÍTICO` · **BLOQUEIA LANÇAMENTO** |
| **b** | Migração não bloqueando a UI | **Não** — `P-140` trata do versionamento do *snapshot*; nenhum código enuncia a **ordem** entre migração e consumo | **`P-142`** — novo · `ALTO` |
| **c** | Chave morta `@ptf_plan_state_v1` | **Não** — `P-114` enuncia a direção oposta (chaves **fora** da fonte canônica) | **`P-143`** — novo · `LEGADO` |
| **d** | Ausência de aviso de perda por desinstalação | **Não** — nenhum dos 140 códigos anteriores o enuncia | **`P-144`** — novo · `MÉDIO` |
| **e** | Ausência de política de armazenamento | **SIM — `P-116`** enuncia o mesmo fato, na mesma superfície, com a mesma correção | **NENHUM código novo** — absorvido por `P-116` |
| **f** | Reset anunciado, mas não implementado | **Não** — `P-35` trata do transporte do estado de guia, não de capacidade anunciada e ausente | **`P-145`** — novo · `MÉDIO` |
| **g** | Estado de corrupção liberando rodadas | **Não** — `P-56` localiza o defeito no `catch` da **tela**; este está na política de saneamento do **serviço** e sobrevive à correção do outro | **`P-146`** — novo · `ALTO` |

Além dos sete itens, a **re-auditoria exigida pela Decisão 7** produziu dois achados que também
passaram no teste de distinção: **`P-147`** (a suíte de fumaça fixa o código morto) e **`P-148`**
(*exports* órfãos dentro de módulos vivos).

**Total: oito códigos novos, `P-141` a `P-148`, sem renumerar nenhum código anterior.**

### 20.3 O item que **não** virou código

A ausência de política de armazenamento (item **e**) foi examinada e **não** recebeu código novo,
em obediência direta à regra *"não crie código novo por simples ampliação de evidência"*. `P-116`
já enuncia *packs* sem limpeza de órfãos e sem teto de disco — mesmo fato, mesma superfície, mesma
correção. A decisão do fundador foi **absorvida na observação de `P-116`**, que passa a registrar
que o piso aprovado (**maior valor entre 2 GB livres e 10% da capacidade**) é **mais exigente** do
que a margem hoje implementada no código.

### 20.4 Movimento de status e de Product Lock

Sete códigos mudaram de classificação. **Nenhum passou a `CORRIGIDO`.**

| Código | Status | Product Lock | Motivo |
|---|---|---|---|
| `P-44` | inalterado | `ED` → `IN` | Fonte canônica única por domínio decidida |
| `P-120` | `DPP` → **`ABERTO`** | `ED` → `IN` | Revalidação obrigatória após atualização decidida |
| `P-124` | inalterado | `ED` → `IN` | Cruzamento de identidade dentro da mesma revalidação |
| `P-125` | `DPP` → **`ABERTO`** | `ED` → `IN` | Estado de *download* pertence ao aparelho (Ratificação 16) |
| `P-126` | `DPP` → **`ABERTO`** | `ED` → `IN` | *Packs* compatíveis sobrevivem à atualização |
| `P-134` | inalterado | `ED` → `IN` | Versão mínima com nome único, revalidada |
| `P-137` | inalterado | `ED` → `IN` | Marcador não cai por igualdade estrita de versão |

`P-120`, `P-125` e `P-126` saem de `DECISÃO DE PRODUTO PENDENTE` porque a decisão **existe** agora
— e entram em **`ABERTO`**, não em `CORRIGIDO`, exatamente como o fundador determinou: *"não marque
risco técnico como corrigido porque a decisão foi tomada"*. No commit canônico, `manifestSha256`
continua opcional, o `status` remoto continua descrevendo estado que só o aparelho conhece e o
caminho de migração de *schema* continua inexistente.

`P-108` **manteve** `EXIGE DECISÃO NO PRODUCT LOCK`: a Fase 4D **não** decidiu o destino do Modo
Igreja, e a regra geral de remoção de código morto **não** substitui essa decisão.

### 20.5 Preservação das Fases 4A, 4B e 4C

Nenhuma decisão das Fases 4A (§24 da matriz), 4B (§25) e 4C (§26) foi revogada, afrouxada,
reinterpretada ou reaberta. Em particular permanecem intactos: a entrega das 18 histórias premium
por *packs* remotos; a regra de que existência física de *asset* nunca concede autorização; a
fórmula canônica de conclusão de história sem o Livrinho; o teto diário de duas estrelinhas; e os
cinco contratos fundacionais `C1` a `C5` da §4.1 deste artefato.

### 20.6 O que a Fase 4D **não** fez

Não alterou código, *assets*, *packs*, manifestos ou configurações. Não corrigiu nenhum defeito de
comportamento. Não gerou *build*, não abriu Metro e não executou validação física. Não removeu
nenhum arquivo do *runtime* — inclusive os três serviços sem consumidor, cuja remoção fica
**pendente na Fase 16**, junto com o ajuste das verificações de fumaça que hoje os fixam no lugar.

---

> **FASE 4D ENCERRADA.** As dez decisões do fundador estão transcritas, as dezesseis ratificações
> registradas, as duas contagens corrigidas sem ajuste silencioso e os oito códigos novos criados
> pelo gerador determinístico. **Nenhum risco técnico foi marcado como corrigido.** Nenhum código,
> *asset*, *pack*, manifesto ou configuração foi alterado. Não houve *push* nem *merge*.
