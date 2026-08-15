# DECISIONS.md — Árbitro de decisões · Pequenos Traços de Fé

> **Este arquivo é o ÁRBITRO.** Em conflito entre qualquer documento, conversa ou sessão de IA
> e o que está aqui, **o DECISIONS.md vence**. Uma decisão que existe apenas em conversa **não é
> oficial** até entrar aqui. Toda sessão de IA (ChatGPT, Claude, Claude Code) **começa lendo este
> arquivo** e declara: *"operando sob DECISIONS.md de <data>"*.
>
> Precedência acima deste arquivo: `docs/PROJECT_SOURCE_OF_TRUTH.md` (Roteiro Mestre) →
> `.specify/memory/constitution.md` → `AGENTS.md`/`CLAUDE.md`. Este arquivo governa as **decisões
> de produto/linha de lançamento** e é a base da
> [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md)
> (**vigente**; a v4 é histórica).
>
> **Mudança de decisão só existe se:** o fundador aprova explicitamente → DECISIONS.md é atualizado
> PRIMEIRO → documentos depois → código por último. Nenhuma IA reabre item registrado sem sinalizar
> que está pedindo **REVERSÃO**.
>
> **Divisão de competências (E018 · 2026-08-05).** Este arquivo continua **árbitro das decisões de
> produto** e nada abaixo o rebaixa. O que ele **não** governa é o **inventário de pendências**:
> identidade, status, severidade, fase e rastreabilidade de riscos vivem exclusivamente em
> [`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md)
> (**matriz canônica**, códigos `P-01` a `P-149`). A `v5` governa **roadmap e sequência de fases**;
> o `PROJECT_SOURCE_OF_TRUTH.md` governa **precedência e governança**. Listas de risco antigas
> mantidas neste arquivo — em especial a lista `R` — valem **apenas como origem histórica e alias**
> e **não** são matriz concorrente. Este arquivo **não replica** a matriz: cita códigos `P`, e a
> definição fica lá.

**Data desta versão:** 2026-08-05 (**Product Lock — Fase 4A**, Plano Família, compra, restauração e entitlement, seção `PL4A`; **Fase 4B**, acesso grátis, conteúdo do Plano Família, histórias e superfícies infantis, seção `PL4B`; **Fase 4C**, jornada, progressão, conclusão e desbloqueios, seção `PL4C`; **Fase 4D**, dados, persistência, migração, recuperação e integridade, seção `PL4D`) · **Atualizada em:** 2026-08-06 (**Fase 4E**, privacidade, Área dos Pais, analytics e Modo Igreja, seção `PL4E`; **Fase 5**, infância, privacidade, teologia e medição, seção `PF5`) · **Atualizada em:** 2026-08-08 (**Fase 6 · Delta v4.1** pós-validação física em iPad, decisões `D1`–`D18`, seção `PF6D`) · **Base anterior:** 2026-08-03 (Spec 019 · revogação cirúrgica da restrição de persistência no Grátis) · **Fundador:** Eduardo

> **Reconciliação E1 (2026-07-15):** este arquivo passou a ser o **único árbitro** (o `DECISIONS.md`
> da raiz foi marcado SUPERSEDED). As decisões consolidadas de lançamento estão na seção
> **"E1 — Decisões consolidadas"** abaixo, organizadas por área; as decisões `D-*` originais
> permanecem preservadas como histórico e detalhe. Contexto completo em
> [`docs/launch/RECONCILIACAO_E1.md`](launch/RECONCILIACAO_E1.md).

---

## E1 — Decisões consolidadas de lançamento (2026-07-15)

Cada item: **ID · Status · Decisão · Impacto no código · Bloco responsável** (quando ainda não implementada). Datas = 2026-07-15 salvo indicação. Estas linhas **prevalecem** sobre qualquer redação anterior conflitante neste arquivo ou em outro documento.

### 1. Produto
- **E1-PROD-NOME** · ✅ · Nome do estúdio/projeto = **Pequenos Traços de Fé**; nome de loja/ícone = **Beni** (`app.json.name`). Título de loja e subtítulo tratados no bloco de compliance/loja. · Sem impacto de código agora.

### 2. Navegação
- **E1-NAV-5ABAS** · ✅ · As cinco abas visíveis são **Início · Aventuras · Brincar · Estrelinhas · Perfil**. **"Ateliê" não existe como nome visível.** A rota interna pode conservar o identificador legado `Ateliê` **temporariamente** (evita risco de migração), mas essa identidade **não pode aparecer** em textos, guias, acessibilidade, áudios, títulos ou divulgação. · **Não renomear a rota neste bloco.** Impacto futuro: eventual renomeação de rota = bloco próprio de navegação (opcional, baixo valor).

### 3. Brincar
- **E1-BRINCAR-4JOGOS** · ✅ · A aba Brincar final contém **quatro jogos** (grade 2×2): **Pares do Beni · Palavrinhas do Beni · Cadê a Ovelhinha? · Monte a Cena**, mais a **seção criativa** com **Criar Livre** e **Minhas artes**. **Criar Livre NÃO é um quinto jogo** — pertence à seção criativa. **Minhas artes** é a galeria oficial das criações. · Já implementado (`BrincarScreen.js`, `BENI_GAMES`), fechado no commit `1daf4c1`. *Supersede a lista bruta "Folha Livre/Soletrando/Adivinhar o Animal/Quebra-Cabeça" e "Bichinhos".*
- **E1-BRINCAR-SEM-BICHINHOS** · ✅ · **Bichinhos da Bíblia NÃO faz parte do lançamento atual.** · Guardrail já existe no smoke (card não pode renderizar).

### 4. Histórias
- **E1-STORIES-GRATIS** · ✅ · Histórias gratuitas oficiais = **A Criação** e **Noé**; **locais, instantâneas, offline**. · `contentManifest` (starter) + `planConfig.FREE_STORY_IDS`.
- **E1-STORIES-PREMIUM** · ✅ · As outras **18** pertencem ao Plano Família. Arquitetura: 2 grátis no binário; 18 premium por download; cache persistente; offline após download completo; manifesto versionado; validação de integridade; **sem backend tradicional no v1**. · Pipeline pronto; **remoção do premium do binário = pendente** (bloco 2C).

### 5. Planos
- **E1-PLANO-FREE** · ✅ · Grátis = A Criação + Noé completas (Livrinho/quiz/Momento com Beni das grátis); **2 rodadas/dia por criança** (ver Rodadas); **Criar Livre sem salvar**; **sem avatares premium**; sem histórias premium. · Salvar já é 0; rodadas hoje por-dispositivo (ver E1-RODADAS).
- **E1-PLANO-FAMILIA** · ✅ · Família libera: 20 histórias; download das 18 premium; uso offline após download; jogos ilimitados; salvar artes; Minhas artes; avatares premium; benefícios futuros aprovados. · `hasStoryAccess`/`hasAtelierUnlimitedAccess`/`brincarDailyService` (premium=ilimitado).

### 6. Rodadas
- **E1-RODADAS** · ✅ decisão / 🟡 código · Decisão oficial: **2 rodadas por dia, por criança**, política central compartilhada pelos jogos aplicáveis; Família = ilimitado; **entrar na aba Brincar não consome**; consumo no ponto oficial de início da atividade; **Modo Criador não é regra real de produto**. · **Código atual conta por dispositivo/dia (compartilhado), não por criança** (`brincarDailyService`). **Migração dispositivo→criança = pendência do bloco de Acesso/RevenueCat** (altera serviço compartilhado; impacta todos os jogos).

### 7. Artes
- **E1-ARTES-SALVAR** · ✅ · Grátis = **zero salvamentos**; Família = salvamentos liberados; **artes antigas não são apagadas**; migrações preservam dados locais; textos "X de N artes grátis" estão **superados**. · Limite já é 0 (`ATELIER_FREE_SAVE_LIMIT`); **UI residual "X de N" em ~~`AtelierScreen.js`~~/`AtelierGalleryScreen.js`** (fluxo contextual, não a aba) = limpeza futura — *`AtelierScreen.js` foi removido em P3J-R.1 FIX1; resta apenas a galeria*. **Não alterar telas/storage neste bloco.**

### 8. Avatares
- **E1-AVATARES** · ✅ decisão / 🟡 código · (a) avatar base do perfil = todos; (b) avatares adicionais/desbloqueáveis = **exclusivos do Plano Família**; (c) dentro do Família, estrelinhas/marcos podem desbloquear/celebrar; (d) no grátis, **estrelinhas não liberam avatares premium**. · **Código atual (`src/data/avatars.js`) desbloqueia por estrelinhas sem consultar o plano** → contradiz a decisão. **Correção = bloco de Acesso comercial (RevenueCat).** **Não alterar `avatars.js` neste bloco.** Pendência associada: preservar avatar premium já em uso por dados antigos (grandfather × reverter ao base).

### 9. Monetização
- **E1-MONETIZACAO-V1** (D-MONETIZACAO-V1) · ✅ modelo / 🟡 valores · v1 = **mensal + anual**; **sem trimestral; sem vitalício**; **RevenueCat** como entitlement; paywall só atrás da Área dos Pais + gate parental; compra e restore obrigatórios antes da loja; **sem compra direcionada à criança**. · Adapter fail-closed pronto; paywall/compra/restore reais = **bloco RevenueCat**. **Valores = pendência controlada** (não inventar): mensal, anual, % desconto anual, período de teste.

### 10. Conteúdo remoto
- **E1-REMOTO** · ✅ · Packs por **bucket estático + manifesto versionado + validação sha256 + cache offline**; sem backend tradicional. · Implementado (`packDownloadService`, `@noble/hashes`); packs finais dependem das imagens finais (ver Conteúdo visual).

### 11. Dados e privacidade
- **E1-PRIVACIDADE** · ✅ · Sem Supabase; sem login obrigatório; sem backend tradicional; dados da criança **locais**; desenhos e nome do perfil **não saem do aparelho**; sem publicidade; sem rastreamento infantil; crash reporting futuro **sem dados pessoais**. · Alinhado ao código atual (local-first).

### 12. Beni e onboarding
- **E1-BENI-LINGUAGEM** · ✅ · A linguagem visível/falada do Beni **não menciona "Ateliê"** nem jogos/recursos descartados ("Criar com Beni" como experiência separada, "Desenho guiado" na aba Brincar, "Bichinhos"). · **Falas/guias legados existem** (`beniGuides.js`, áudios do guia) → limpeza nos blocos de Onboarding (O1–O2) e roteiros/áudios do Beni. **Não alterar áudio/tour neste bloco.**

### 13. Modo Criador
- **E1-CRIADOR** · ✅ · Permanece no Dev Client durante o ciclo de testes; **invisível em produção**; **não é regra comercial**; não remover antes do hardening final; ferramentas internas protegidas pelo mecanismo oficial (`isInternalToolsEnabled`/`creatorQaMode`). · Alinhado ao código.

### 14. Conteúdo visual em andamento
- **E1-VISUAL-M3** · ✅ · Colorir ainda sendo finalizado manualmente pelo fundador; engenharia pode preparar validação/inventário/pipeline; **packs definitivos NÃO são congelados antes das imagens finais**; manifestos/hashes finais dependem do congelamento visual; **screenshots de loja não usam imagens provisórias**; **M3 final após as imagens definitivas**. · Bloco M3/packs.

### 15. Ordem de lançamento
- **E1-ROADMAP** · ✅ · Ver seção **"Ordem oficial dos próximos blocos (E1)"** abaixo.

---

## PL01A — Registro formal das decisões do fundador (2026-07-21)

> **Operando sob `docs/DECISIONS.md`.** Bloco **exclusivamente documental** (PTF PRODUCT LOCK 01A), executado em **worktree isolada** (`docs/product-lock-01a`) sobre o HEAD `6cf799c`, **sem** tocar a trilha de loading/performance da árvore original. **Nenhum código de produto, asset, build, commit ou push.** Estas decisões **corrigem** interpretações do relatório PRODUCT LOCK 00 e formalizam o direcionamento do fundador (Eduardo) na data **2026-07-21**.
>
> **Regra transversal (vale para TODOS os itens abaixo):** cada item registra **intenção estratégica**. É **proibido inferir ou iniciar implementação** antes da **spec correspondente aprovada pelo ciclo SDD**. Reversões estratégicas só viram código no bloco próprio, com portões humanos.
>
> **⛔ Duas leituras PROIBIDAS (correção explícita do LOCK 00):**
> 1. As **60 páginas de colorir NÃO substituem** as **200 ilustrações narrativas** — são conjuntos **distintos** e coexistentes.
> 2. As **duas ações narrativas NÃO substituem** as **10 cenas** — são **participação dentro** das 10 cenas.

### PL01A-01 · Estrutura narrativa 20×10 — MANTIDA (corrige LOCK 00)
- **Decisão:** 20 histórias × **10 cenas narrativas** = **200 cenas narradas + 200 ilustrações principais (1 por cena)**. As 10 cenas **não** serão reduzidas.
- **Motivo:** o PRODUCT LOCK 00 leu "2 ações" e "60 imagens" como redução — leitura incorreta; o fundador confirma a estrutura de 200 cenas.
- **Substitui/revoga:** revoga a **interpretação equivocada** do LOCK 00 (§5/§14/§20). Não altera decisão travada.
- **Impactos esperados:** nenhum estrutural — `src/data/stories.js` e `src/data/storySceneIllustrations.js` (204 requires) permanecem.
- **Pendências de spec:** nenhuma.
- **Proibição:** nada a implementar (reafirmação).

### PL01A-02 · Duas ações narrativas por história
- **Decisão:** cada história terá **duas ações narrativas significativas distribuídas ao longo das 10 cenas**, fazendo a criança **participar** da narrativa.
- **Motivo:** aumentar participação/afeto sem inflar estrutura.
- **Substitui/revoga:** nada. É **aditivo**. **NÃO** significa 2 atividades/2 imagens por história e **NÃO** substitui as 10 cenas (ver leitura proibida nº 2).
- **Impactos esperados:** futura camada de interação dentro da NarrationScreen/fluxo de cena; a definir na spec da Camada de Alma (PL01A-06).
- **Pendências de spec:** que ações, em quais cenas, com que affordance/acessibilidade (6–8, ~5–10).
- **Proibição:** não inferir/implementar antes da spec.

### PL01A-03 · Sessenta páginas de colorir (3/história) — 🔄 REVERSÃO ESTRATÉGICA (colorir)
- **Decisão:** novo conjunto de colorir = **3 páginas por história × 20 = 60 páginas**. A arquitetura futura deverá **desacoplar o colorir do espelhamento obrigatório 1 página por cena**. As antigas **200** páginas **não** são tratadas como estrutura definitiva só por já existirem.
- **Motivo:** qualidade e curadoria de colorir independem da contagem de cenas; 3 folhas fortes > 10 espelhadas.
- **Substitui/revoga:** **reverte** a premissa "1 colorir por cena" (200 folhas) como estrutura permanente. **NÃO** substitui as **200 ilustrações narrativas** (leitura proibida nº 1). Ajusta o entendimento de `E1-VISUAL-M3` sobre o conjunto de colorir.
- **Arquitetura técnica:** a arquitetura do **Colorir 60 AINDA NÃO foi escolhida**. **Nenhum arquivo é declarado como obrigatoriamente substituído**; *como* implementar (mapeamento, storage, packs) fica para a **spec do Colorir 60**.
- **Impactos esperados (hipóteses técnicas, mapeadas e NÃO decididas):** áreas que *podem* ser afetadas — `src/assets/coloringImages.js` (202 requires, convenção `scene_NN`), `contentResolver.resolveStoryColoring` (path `coloring/scene_NN.png`), packs R2 (kind `coloring`), manifestos, `ColoringScreen`/`useResolvedColoringImage`, contrato de jornada (`coloringComplete` ≥1 página) e M3 (23 folhas em escopo). São **hipóteses de impacto**, não substituições decididas. Ver **Matriz de impacto** (bloco 6 do relatório 01A).
- **Pendências de spec:** mapeamento cena↔folha desacoplado; migração das chaves `@ptf_drawing_*`/`@ptf_coloring_done_*`; destino das 200 antigas; efeito no piso de versão (M3.1b) e nos packs.
- **Proibição:** **não alterar arquitetura, assets, resolver, packs ou manifestos neste bloco.** Só registro + mapa de impacto.

### PL01A-04 · Público 6–8 (acessível ~5–10) — 🔄 REVERSÃO ESTRATÉGICA (público)
> ⚠️ **SUPERSEDED NO EIXO DE FAIXA ETÁRIA em 2026-08-06 pela Fase 5** — ver [`PF5-FAIXA-ETARIA`](#pf5-faixa-etaria--faixa-oficial-4-a-8-anos-supersede-pl01a-04-no-eixo-etário).
> A faixa oficial do produto passa a ser **4 a 8 anos**. O registro histórico abaixo **não** é
> reescrito. As demais determinações desta decisão — **sem coleta de idade**, **sem perfis etários**,
> loja **4+ fora da Kids Category**, e **classificação de loja ≠ faixa de produto** — **continuam
> integralmente válidas**.
- **Decisão:** público **principal oficial = crianças de 6 a 8 anos**; experiência **acessível ~5 a 10**.
- **Motivo:** foco de tom, leitura, complexidade e retenção na faixa real de uso.
- **Substitui/revoga:** **reverte** a orientação **3–8** (primário 3–6) do `PRODUCT_BLUEPRINT.md` (agora SUPERSEDED). Loja segue **4+ / fora da Kids Category** (E1) — classificação de loja ≠ faixa de produto.
- **Impactos esperados:** tom de copy, tamanho/leitura, dificuldade de jogos, direção de arte; **sem** coleta de idade e **sem** perfis etários.
- **Pendências de spec:** ajustes de tom/leitura por superfície (bloco de conteúdo/UX).
- **Proibição:** **não criar coleta de idade nem perfis etários neste bloco**; não inferir mudanças de UI antes da spec.

### PL01A-05 · Loop central do produto — 🔄 REVERSÃO ESTRATÉGICA (jornada)
- **Decisão:** loop oficial = **Descobrir → Viver → Criar → Recontar → Praticar → Guardar**. Orienta produto, conteúdo, UX, conclusão e retenção.
- **Motivo:** dar um esqueleto emocional único à jornada (ancora a Camada de Alma).
- **Substitui/revoga:** **substitui** o loop implícito atual (mapa→história→narração/quiz→colorir→Livrinho→conquistas) como **modelo mental oficial**. Convive com o contrato de jornada A0.10 (status/conclusão) até a spec harmonizar os dois.
- **Impactos esperados:** conclusão (`storyJourneyService`, D-CONCLUSAO-TOTAL-B), mapa, onboarding, recompensas — a reler sob o loop.
- **Pendências de spec:** como cada etapa do loop se materializa por tela; relação com `journeyComplete`.
- **Proibição:** não reescrever conclusão/mapa/jornada antes da spec.

### PL01A-06 · Camada de Alma — definição conceitual (spec futura)
- **Decisão:** a Camada de Alma fica **conceitualmente definida** pelo conjunto: (1) presença afetiva do Beni; (2) Momentos de Luz; (3) Reconto; (4) Pequenos Passos opcionais; (5) Guardar no coração; (6) Meu Livro de Aventuras com Beni; (7) Modo Escuta Tranquila; (8) Cartão da Aventura; (9) linguagem sem culpa/pressão/manipulação; (10) continuidade emocional entre sessões.
- **Motivo:** preencher o placeholder "Camada de Alma" (hoje `❌ não iniciado` em `specs/008-m3`) com um escopo conceitual estável.
- **Substitui/revoga:** define um conceito antes ausente. Não revoga nada.
- **Impactos esperados:** transversal (Beni, conclusão, livro, retenção, áudio, Área dos Pais).
- **Pendências de spec:** **a spec detalhada será criada em bloco próprio** (SDD).
- **Proibição:** **não criar a spec completa agora**; não inferir/implementar nenhum dos 10 elementos antes dela.

### PL01A-07 · Livro — "Meu Livro de Aventuras com Beni" — 🔄 REVERSÃO ESTRATÉGICA (livro)
- **Decisão:** nome oficial **planejado** = **"Meu Livro de Aventuras com Beni"**.
- **Motivo:** naming coeso com a Camada de Alma e o universo do Beni.
- **Substitui/revoga:** **substitui** "Livrinho da Fé" / "Meu Livrinho da Fé". A implementação existente (`StoryBookScreen`, Livro Vivo) **poderá ser reaproveitada**, mas **não limita** o novo conceito.
- **Impactos esperados:** strings/copy/áudios/guia do Beni, `StoryBookScreen`, cards e navegação que citam "Livrinho".
- **Pendências de spec:** naming final na UI, migração de textos, relação com a Camada de Alma.
- **Proibição:** não renomear código/strings/áudios neste bloco.

### PL01A-08 · Pequenos Passos — opcionais
- **Decisão:** **opcionais**; **não** são tarefa escolar; **não** exigem comprovação; **sem punição**; **não** podem gerar culpa; **sem obrigação de retorno** ao app (**não** pressionam retorno).
- **Motivo:** valor espiritual sem transformar o app em dever.
- **Substitui/revoga:** conceito novo (parte da Camada de Alma).
- **Impactos esperados:** futura superfície leve (Área dos Pais/fim de história), a definir.
- **Pendências de spec:** forma, gatilho, ausência de pressão — na spec da Camada de Alma.
- **Proibição:** não implementar antes da spec.

### PL01A-09 · Beni — companheiro e guia afetivo
- **Decisão:** Beni é **companheiro**, **guia afetivo** e **elo entre as experiências** (continuidade emocional entre telas/sessões); **não** manipula, **não** pressiona, **não** cria culpa por ausência, **não** interrompe excessivamente.
- **Motivo:** confiança das famílias; uso saudável.
- **Substitui/revoga:** **confirma e reforça** E1-BENI-LINGUAGEM. Confirma a decisão externa **G**.
- **Impactos esperados:** roteiros/áudios/guias do Beni, frequência de interrupção, ausência de notificações culpabilizantes.
- **Pendências de spec:** limites de frequência; tom — nos blocos de roteiro/onboarding.
- **Proibição:** não alterar áudio/tour/roteiros neste bloco.

### PL01A-10 · Brincar — separado da compreensão narrativa
- **Decisão:** Brincar **continua separado** da compreensão narrativa obrigatória; os jogos **não** substituem histórias e **não** bloqueiam a conclusão das aventuras.
- **Motivo:** preservar a jornada narrativa como coração do app.
- **Substitui/revoga:** **confirma** E1-BRINCAR-4JOGOS e o contrato de jornada. Confirma a decisão externa **H**.
- **Impactos esperados:** nenhum (reafirmação); guardrails de conclusão intactos.
- **Pendências de spec:** nenhuma.
- **Proibição:** não acoplar jogos à conclusão.

### PL01A-11 · Modo Escuta Tranquila
- **Decisão:** nome oficial **planejado** = **"Modo Escuta Tranquila"** — descanso, viagem, tempo em família ou escuta **sem interação**. **Não** registrar "Boa Noite com o Beni" como nome oficial.
- **Motivo:** modo calmo, sem dependência de tela para dormir.
- **Substitui/revoga:** conceito novo (parte da Camada de Alma). Rejeita "Boa Noite" como naming.
- **Impactos esperados:** futura superfície de reprodução calma (áudio/narração sem toque).
- **Pendências de spec:** ativação, controles, relação com áudio — na spec da Camada de Alma.
- **Proibição:** não implementar antes da spec.

### PL01A-12 · Catálogo híbrido — mantido
- **Decisão:** manter **A Criação + Noé completas no app base**; **18 histórias do Plano Família sob demanda**; **catálogo híbrido**; **packs verificáveis**; **uso offline após download**; **proteção do tamanho** do app inicial.
- **Motivo:** peso de loja + offline confiável.
- **Substitui/revoga:** **confirma** E1-STORIES-GRATIS/PREMIUM, E1-REMOTO, v4 §5. Confirma externas **J/K/L**.
- **Impactos esperados:** nenhum (reafirmação).
- **Pendências de spec:** remoção do premium do binário (2C) segue no roadmap.
- **Proibição:** não alterar resolver/packs/manifestos neste bloco.

### PL01A-13 · Piloto oficial de produto = A Criação
- **Decisão:** o **piloto oficial da nova experiência = A Criação**; **Noé** é o segundo. **Davi e Golias** segue como **caso técnico de pack**, **não** como piloto oficial de produto.
- **Motivo:** validar a nova experiência numa história grátis/base.
- **Substitui/revoga:** ajusta o entendimento do v4 §6 (que trata Davi como **piloto técnico**); separa **piloto de produto** (Criação) de **piloto técnico de pack** (Davi).
- **Impactos esperados:** foco de conteúdo/QA na Criação primeiro.
- **Pendências de spec:** critérios do piloto de produto — no bloco da Camada de Alma/experiência.
- **Proibição:** não reconfigurar sandbox/packs neste bloco.

### PL01A-14 · Cartão da Aventura — via ação parental protegida
- **Decisão:** Cartão da Aventura é **decisão oficial**. Qualquer **geração, exportação ou compartilhamento** ocorre **pela Área dos Pais ou ação parental protegida**. **Sem compartilhamento infantil livre.**
- **Motivo:** privacidade infantil; controle parental sobre o que sai do aparelho.
- **Substitui/revoga:** conceito novo; alinhado a E1-PRIVACIDADE (nada sai do device sem controle) e ao gate parental.
- **Impactos esperados:** futura feature de exportação atrás do gate; Área dos Pais; privacidade/compliance.
- **Pendências de spec:** o que é o Cartão, formato, canal de exportação, consentimento.
- **Proibição:** **não criar compartilhamento/exportação nem alterar código neste bloco.**

### PL01A-15 · Monetização e frequência de conteúdo
- **Decisão:** Plano Família **pode** prever **mensal + anual**. **Sem** trimestral, vitalício ou avulso no lançamento. "Sem promessa mensal" = **não prometer** nova história/aventura/pacote **todo mês** antes de **medir a capacidade real da fábrica de conteúdo** — **não** significa remover a assinatura mensal. **Preços permanecem pendentes.**
- **Motivo:** sustentabilidade e honestidade de expectativa.
- **Substitui/revoga:** **refina** E1-MONETIZACAO-V1 (mantém mensal+anual; esclarece o sentido de "sem promessa mensal"). Confirma externa **O**.
- **Impactos esperados:** copy do paywall (sem promessa de cadência); RevenueCat (bloco próprio).
- **Pendências de spec:** valores (mensal/anual/% desconto/teste) — pendência controlada, bloco RevenueCat.
- **Proibição:** não implementar paywall/preços neste bloco.

### PL01A-16 · Marca
- **Decisão:** marca oficial do app = **Pequenos Traços de Fé**. **Beni** = centro afetivo, narrativo e visual. **"Mundo do Beni"** pode ser **conceito de universo/posicionamento**, **não** substituição automática do nome oficial.
- **Motivo:** evitar bifurcação de marca.
- **Substitui/revoga:** confirma E1-PROD-NOME (projeto = Pequenos Traços de Fé; loja/ícone = Beni). Esclarece o status de "Mundo do Beni".
- **Impactos esperados:** nenhum de código; guia de marca/loja futuro.
- **Pendências de spec:** uso de "Mundo do Beni" em divulgação — bloco de compliance/loja.
- **Proibição:** não renomear app/slug/scheme.

> **Reversões estratégicas formalizadas nesta data:** **PL01A-03** (colorir 60/desacoplamento), **PL01A-04** (público 6–8), **PL01A-05** (loop central) e **PL01A-07** (livro). Cada uma só vira código no bloco próprio, com spec e portões humanos.

---

## PL01G — Produção artística do piloto A Criação concluída (Colorir 60) (2026-07-22)

### PL01G-01 · Trio de colorir do piloto A Criação — PRODUÇÃO CONCLUÍDA
- **Decisão:** a produção artística das **três páginas** do piloto **A Criação** do **Colorir 60** está **concluída e aprovada** pelo fundador. Trio final: **`light`** (reutilização por referência do lineart legado `scene_02.png`, inspeção full-res aprovada), **`living_world`** (nova arte aprovada e normalizada a PNG) e **`people_and_care`** (nova arte aprovada e normalizada a PNG). As aprovações **visuais** são **finais** e não se reabrem.
- **Motivo:** fechar o piloto de produto (A Criação) com identidade técnica final registrada, antes de qualquer integração.
- **Identidade técnica / hashes:** todos os detalhes por página (formato, 1122×1402, proporção 4:5, modo, tamanho, **SHA-256** dos aprovados e das fontes, pixel maxdiff = 0) estão na **spec 017 §15** (owner primário do fechamento). A `light` referencia `scene_02.png` (SHA na spec 016 §2). **Não** duplicar hashes aqui.
- **Anomalia operacional:** o candidato de `people_and_care` chegou como `.png.jpeg` sendo **conteúdo JPEG** (não canônico); foi **preservado como fonte** e **re-encodado para PNG verdadeiro sem alterar aparência** (maxdiff 0). Registro em 017 §15.
- **Substitui/revoga:** nada. **Registra o resultado** da reversão **PL01A-03** (60 páginas de colorir, 3/história) para o piloto A Criação; convive com as specs owner **014/015/016/017**.
- **Impactos esperados / limites:** os **PNGs definitivos permanecem FORA do Git** (pasta externa de produção); a **integração** ao app depende de **plan + tasks** próprios do Colorir 60 (arquitetura "Opção C", specs 014/015); a **expansão** para Noé e demais histórias depende da **validação do piloto em dispositivo**.
- **Proibição:** não integrar catálogo/resolvers/storage/manifestos neste bloco; não copiar/mover assets legados; não reabrir decisões visuais ou teológicas; não sobrescrever `scene_02.png`.
- **Referência:** `specs/017-colorir-60-creation-production-prompts/` §15 (detalhes e hashes); `specs/016-colorir-60-pilot-creation/` (curadoria e `light`); `specs/014-colorir-60/` (arquitetura Opção C).

---

## Ordem oficial dos próximos blocos (E1)

1. Proteção e governança (**este bloco E1**).
2. **Onboarding O1** — especificação da primeira experiência.
3. **Performance P1** — baseline de Beni, capas, mapa e Livrinho.
4. Onboarding O2 — implementação visual.
5. Guias progressivos do Beni.
6. Roteiros finais do Beni.
7. Geração e integração dos novos áudios do Beni.
8. Redesign da conclusão das histórias.
9. Horizonte final do Mapa de Aventuras.
10. Hardening do Livrinho.
11. Preparação do pipeline das imagens definitivas.
12. Continuidade das correções manuais de colorir.
13. Congelamento editorial e visual **M3**.
14. Reconstrução dos packs.
15. Remoção das histórias premium do binário (**2C**).
16. Medição de build e offline real.
17. **RevenueCat** e Plano Família.
18. Hardening geral.
19. Compliance e engenharia de lançamento.
20. Beta com famílias.
21. Materiais finais de divulgação.
22. Submissão e rollout gradual.

**Dependências:** áudios novos do Beni dependem da aprovação do onboarding; packs finais dependem das imagens finais; remoção do premium do binário depende dos packs finais validados; RevenueCat depende das decisões comerciais; screenshots de loja dependem do congelamento visual; beta depende de compra/restore/offline/build real; lançamento depende de beta sem bloqueador crítico.

---

## Decisões SUPERADAS (E1) — histórico, não apagar

| Superada | Substituída por |
|---|---|
| Ateliê como **nome visível** da aba | E1-NAV-5ABAS (rótulo "Brincar"; "Ateliê" só identidade de rota interna) |
| Bichinhos da Bíblia no lançamento atual | E1-BRINCAR-SEM-BICHINHOS |
| "Criar com Beni" como experiência separada | E1-BENI-LINGUAGEM + D-CRIAR-COM-BENI-STATUS (nome oficial = **Criar Livre**) |
| Três salvamentos gratuitos ("X de 3 artes") | E1-ARTES-SALVAR (grátis = 0) |
| Uma única história gratuita | E1-STORIES-GRATIS (grátis = A Criação **e** Noé) |
| Plano trimestral no v1 | E1-MONETIZACAO-V1 (sem trimestral) |
| Plano vitalício | E1-MONETIZACAO-V1 (sem vitalício) |
| Supabase / backend tradicional no v1 | E1-PRIVACIDADE (sem backend) |
| Avatares premium liberados no grátis só por estrelinhas | E1-AVATARES (adicionais = Plano Família) |
| Rodadas definidas **apenas por dispositivo** | E1-RODADAS (decisão = por criança; código a corrigir) |
| `DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (v2.0) como linha vigente | v4 (`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`) |
| v4 (`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`) como linha vigente | **v5** (`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`), 2026-07-30 |
| `DECISIONS.md` da raiz como árbitro | `docs/DECISIONS.md` (este arquivo) |
| Nomes brutos "Soletrando/Adivinhar o Animal/Quebra-Cabeça" | E1-BRINCAR-4JOGOS (nomes finais) |
| Lista Brincar de 5 entradas | E1-BRINCAR-4JOGOS (4 jogos + Criar Livre + Minhas artes) |
| Modo Igreja **sem destino de produto**, reduzido a código atrás de *flag* de *build* (decisão #5 do `DECISIONS.md` da raiz, hoje SUPERSEDED) | **PL4E · D-4E-IGREJA** (segunda linha de produto real dentro do mesmo app, contrato congelado, implementação na Fase 12B). Alcance exato da supersessão em [`docs/fase4-product-lock/05_PRODUCT_LOCK_4E_...md`](fase4-product-lock/05_PRODUCT_LOCK_4E_PRIVACIDADE_AREA_DOS_PAIS_ANALYTICS_E_MODO_IGREJA.md) §19.1. **Cultinho em Casa NÃO é tocado**; a exclusão do produto institucional completo (D3) **permanece**; a *flag* continua **desligada** |

---

## Decisões PENDENTES controladas (E1)

Registradas sem inventar resposta. Para cada uma: **bloco que resolve · o que bloqueia · o que segue sem ela**.

| Pendência | Bloco que resolve | Bloqueia | Segue sem ela |
|---|---|---|---|
| Valor mensal | RevenueCat | Bloco RevenueCat | Onboarding, performance, hardening |
| Valor anual | RevenueCat | Bloco RevenueCat | idem |
| % desconto anual | RevenueCat | Bloco RevenueCat | idem |
| Período de teste (existe? quanto?) | RevenueCat | Bloco RevenueCat | idem |
| Nome final exibido nas lojas (se não congelado) | Compliance/Loja | Metadata da loja | Desenvolvimento em geral |
| Momento da migração rodadas dispositivo→criança | Acesso/RevenueCat | Conformidade da regra "por criança" | Jogos e hub (funcionam com o atual) |
| Preservar avatar premium já usado por dados antigos (grandfather × reverter) | Acesso/RevenueCat | Gate de avatares premium | Perfil atual |
| Remoção/redirecionamento do card antigo "Criar com Beni" (Home) | Onboarding/Home futuro | Limpeza de linguagem | Onboarding O1 (spec) segue |
| Confirmação final da reancoragem de imagens/áudios no M3 | M3 | Congelamento visual + packs finais | Onboarding, performance, RevenueCat |
| Data de início do beta | Beta | Submissão | Todos os blocos técnicos anteriores |

> **Nota de reconciliação:** o `DECISIONS.md` da raiz (v3.1, superado) trazia preços numéricos propostos (Anual R$ 119,90 / Mensal R$ 14,90). **Não** são tratados como congelados no v1: por decisão E1, os valores são **pendência controlada** até reconfirmação do fundador no bloco RevenueCat.

---

## Estado técnico registrado (fatos, não decisões)

| ID | Data | Fato | Origem |
|---|---|---|---|
| S-HEAD | 2026-07-05 | HEAD atual = **`424972b`** (branch `content-integrate-coloring-3`). | git |
| S-F2.4E1 | 2026-07-04 | **F2.4e.1 concluído** — download e diagnose (dev) de **cover, scene, coloring e audio** do pack remoto por kind (`requestedKinds`, default scenes-only); commit `b3fdb96`. | git/memória |
| S-F2.4E2 | 2026-07-05 | **F2.4e.2 concluído** — **sha256 real** via `@noble/hashes` (JS puro, sem expo-crypto/quick-crypto), validado antes do ready; **performance corrigida** (diagnose leve; verify profundo por botão; travamento >10s eliminado); **concorrência protegida** (busyRef/mountedRef/runExclusive; auditoria adversarial); commit `424972b`; smoke 1604/1604. | git/memória |
| S-NEXT | 2026-07-05 | **Próximo bloco oficial = F2.4e.3** — consumo **user-facing** de **coloring remoto com fallback local**. Ainda NÃO iniciado. | decisão |

---

## Decisões oficiais

### D-FREE-SEM-SALVAR — Plano grátis NÃO salva arte ⚠️ **PARCIALMENTE REVOGADA (2026-08-03)**

> ⚠️ **REVOGAÇÃO CIRÚRGICA — leia antes de aplicar esta decisão.**
> Em **2026-08-03** o fundador **revogou** esta decisão **no que ela alcançava o Colorir com o Beni
> (colorir narrativo integrado às histórias)**. O texto original permanece abaixo como **histórico
> não apagado**, e continua **integralmente vigente para o Criar Livre**.
>
> | Alcance | Estado após 2026-08-03 |
> |---|---|
> | **Colorir com o Beni** (narrativo, integrado às histórias) | ❌ **REVOGADA.** O Grátis **salva** as pinturas das histórias às quais tem acesso. Vale [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos). |
> | **Criar Livre** (autoria livre, aba Brincar e Cultinho) | ✅ **VIGENTE, sem alteração.** Continua sendo benefício do Plano Família, com **E1-PLANO-FREE** e **E1-ARTES-SALVAR** intactos e `ATELIER_FREE_SAVE_LIMIT` em **zero**. |
>
> A distinção entre as duas experiências é a de [`D-C60-NOMEACAO-OBRAS`](#d-c60-nomeacao-obras--colorir-com-o-beni-é-coleção-criar-livre-é-autoria):
> **Colorir com o Beni é COLEÇÃO** (obra derivada de um lineart da história, sem nome, uma por atividade);
> **Criar Livre é AUTORIA** (obra do zero, com nome, ilimitada). A revogação alcança **somente a coleção**.

- **Data:** 2026-07-05 · **Status:** ⚠️ **PARCIALMENTE REVOGADA em 2026-08-03** (vigente só para o Criar Livre) · **Origem:** Adendo v1 §1 + confirmação Eduardo.
- **Decisão (texto histórico, preservado):** Salvar arte é benefício **100% Plano Família**. O grátis desenha/colore normalmente, mas **não persiste** a arte; salvar/Galeria/persistência = Plano Família.
- **Impacto (texto histórico, preservado):** remove o limite numérico atual (não há mais "3 de 3"); qualquer toque em Salvar/Guardar no grátis → gate parental → paywall (copy gentil). Colorir continua valendo para progresso/estrela. "Minhas Artes" no grátis = estado vazio convidativo. Baú: cartinhas tipo "Arte" viram exclusivas do Plano Família (demais lembranças seguem para todos). Livrinho grátis: "Meu livrinho colorido" = estado convidativo. **Implementação em bloco próprio (Bloco A da sequência); NÃO agora.**

### D-CONCLUSAO-TOTAL-B — Desbloqueio da próxima história exige conclusão TOTAL (Opção B)
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA (fundador — **Opção B**) · **Origem:** Adendo v1 §1 (D-CONCLUSAO-TOTAL) + correção Eduardo.
- **Decisão:** Uma história só desbloqueia a próxima e recebe o selo "Concluída" quando a criança completou **TUDO**:
  `isStoryFullyComplete = (10 cenas narradas concluídas) AND (quiz respondido) AND (colorir concluído) AND (Momento da história / Guardar no coração concluído)`.
- **Correção do fundador vs. adendo:** o adendo propunha "duas camadas" (desbloqueio guiado só pela narrativa; selo/certificado pela conclusão total). O **fundador escolheu a Opção B**: o **desbloqueio da próxima história também exige a conclusão total**.
- **Definição operacional de "colorir concluído":** proposta do adendo = **pelo menos 1 página da história colorida e concluída** (não as 10). Marcada como **[A CONFIRMAR]** — o default é 1; se o fundador preferir outro número, declarar.
- **✅ RESOLVIDO (2026-07-30) — o `[A CONFIRMAR]` acima está fechado:** "colorir concluído" = **pelo menos uma atividade do Colorir com o Beni concluída**; **uma de três** satisfaz o marco obrigatório **Criar**; **três de três** = coleção completa, com celebração própria, e **não** bloqueia o desbloqueio da próxima história; as **dez páginas legadas não são exigidas** em A Criação; até cada história receber o novo modelo, **uma página legada concluída serve como compatibilidade temporária**. Texto integral em [`D-C60-INTEGRACAO-PRODUTO`](#d-c60-integracao-produto--integração-do-colorir-com-o-beni-decisões-de-produto) §3.
- **Impacto:** muda **progressão e retenção** e a base do B5.4 (unlock por cenas). Por isso, **a implementação é bloco próprio POSTERIOR — NÃO agora.** Requer helper puro `isStoryFullyComplete` (separado de `isNarrativeComplete`), revisão de status em cards/mapa/Estrelinhas, certificado só no total.
- **📌 ANOTAÇÃO DA FASE 4C (2026-08-05) — a fórmula acima foi SUPERADA, o texto histórico fica preservado.** A fórmula canônica congelada no Product Lock 4C é:
  `journeyComplete = (todas as cenas DECLARADAS da história) AND (quiz concluído) AND (reflexão concluída) AND (pelo menos UMA atividade do Colorir com o Beni, quando o Colorir estiver disponível para aquela história) AND (persistência confirmada)`.
  Três divergências ficam resolvidas: (1) **`(10 cenas narradas concluídas)` não vale** — nenhuma regra canônica depende de quantidade fixa de cenas, vale sempre **todas as cenas declaradas**; (2) o **Livrinho NÃO integra** a fórmula obrigatória — fica formalmente registrada como **superada** a parcela do bloco A0.10 que incluía `bookOpened` em `journeyComplete`; (3) o Colorir é exigência **condicional permanente** (emenda `P3J` ratificada) — quando não houver atividade disponível, a ausência **nunca** bloqueia a jornada. Ver [`## PL4C`](#pl4c--product-lock-fase-4c--jornada-progressão-conclusão-e-desbloqueios) e `docs/DECISAO_CONTRATO_JORNADA.md`.

### D-BRINCAR-JOGOS-V1 — Escopo funcional dos jogos do Brincar v1
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA (fundador) · **Origem:** Adendo v1 §1 + correção Eduardo.
- **Decisão:** O Brincar v1 tem estes itens funcionais:
  1. **Folha Livre**
  2. **Minhas Artes**
  3. **Soletrando** (nome bruto)
  4. **Adivinhar o Animal** (nome bruto)
  5. **Quebra-Cabeça** (nome bruto)
- **⚠️ CORREÇÃO OBRIGATÓRIA DO FUNDADOR (anula a leitura do adendo):** **Pares, Palavrinhas e Bichinhos NÃO foram removidos.** Eram **nomes amigáveis anteriores/candidatos** para estes mesmos minijogos. **Não tratar como features excluídas.** Os jogos continuam no v1; apenas os nomes brutos estão em uso enquanto os nomes finais não são decididos (ver D-NAMING-JOGOS-PENDENTE).
- **Impacto:** o CONTEÚDO da fase Brincar usa esta lista; specs de jogos, `dailyRoundsService` (2 rodadas/dia por jogo) e ResponsibleUnlockCard seguem o v3.1. Único jogo com assets novos = **Adivinhar o Animal** (15 ilustrações + 15 sons — encomendar em paralelo). **Implementação em bloco próprio (fase Brincar); NÃO agora.**
- **🔄 ATUALIZAÇÃO E1 (2026-07-15) — SUPERSEDE a lista bruta acima:** o Brincar foi **entregue e fechado** (`1daf4c1`) com os **quatro jogos finais** — **Pares do Beni · Palavrinhas do Beni · Cadê a Ovelhinha? · Monte a Cena** — em grade 2×2, mais a **seção criativa** (Criar Livre + Minhas artes). **Bichinhos está fora do lançamento** (E1-BRINCAR-SEM-BICHINHOS). Ver **E1-BRINCAR-4JOGOS**.

### D-NAMING-JOGOS-PENDENTE — Nomes amigáveis finais dos jogos [PARCIAL]
- **Data:** 2026-07-05 · **Atualizada:** 2026-07-13 · **Status:** 🟡 PARCIAL (1 de 3 resolvidos) · **Origem:** correção Eduardo.
- **Decisão:** nomes finais infantis e coesos (alinhados ao Livro Vivo):
  1. **Soletrando** → **"Palavrinhas do Beni"** ✅ RESOLVIDO (2026-07-13, ver `D-PALAVRINHAS-UF1`)
  2. **Adivinhar o Animal** → nome final [PENDENTE]
  3. **Quebra-Cabeça** → nome final [PENDENTE]
- **Nota:** "Pares / Bichinhos" seguem como nomes candidatos/anteriores dos demais jogos, não como decisão nem exclusão.

### D-DESIGN-LIVRO-VIVO — Direção visual "O Livro Vivo" prevalece
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA · **Origem:** Direção de Arte v1.1 (D1–D4) + Adendo v1 §2.
- **Decisão:** a **Direção de Arte v1.1 ("O Livro Vivo")** (`docs/DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md`) é a direção visual oficial: roxo aposentado; Fraunces+Nunito; uma cor de ação; dourado = único material de recompensa; moldura única da "Galeria Viva"; tokens/hex; responsividade §2.4. O **documento visual antigo** (3 histórias, "estilo Disney/Pixar", 3–4 ícones) é **SUPERSEDED** (histórico, não fonte). **Não criar outro Design System.**

### D-STATUS-CARDS — Status por chip/selo/ícone/tratamento, não por paleta paralela
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA · **Origem:** Adendo v1 §2.
- **Decisão:** o estado do card de história (grátis, premium bloqueada, liberada não-baixada, baixando, baixada/offline, em andamento, "Quase lá!", concluída total, erro, requer atualização; "Em breve" **não existe no v1**) é comunicado por **chip + selo + ícone + tratamento da arte** — **não** por uma paleta paralela de cores.
- **⚠️ BLOQUEIO:** a paleta proposta em conversa (verde=grátis, azul=baixado, roxo=Plano Família, vermelho=erro) **NÃO deve ser implementada** — viola D2 (roxo aposentado), Lei 1 (uma cor de ação) e Lei 2 (dourado = recompensa). Premium usa **selo dourado "Plano Família"** (nunca roxo); erro **nunca** vermelho (card papel + Beni + "tentar de novo").
- **↪ PARCIALMENTE SUPERADA em 2026-08-07 por `D-SELOS-ESTADO-V2` (abaixo).** Deixa de valer **exclusivamente** o trecho *"Premium usa **selo dourado 'Plano Família'** (nunca roxo)"*. **Todo o resto desta decisão permanece integralmente em vigor:** status por chip + selo + ícone + tratamento da arte; proibição da paleta paralela de status; roxo aposentado; erro nunca vermelho. O texto acima é **preservado como histórico e não foi apagado** — leia-o sempre junto com `D-SELOS-ESTADO-V2`.

### D-SELOS-ESTADO-V2 — Cores dos selos de estado do card (Grátis · Plano Família · Concluída)
- **Data:** 2026-08-07 · **Status:** ✅ CONFIRMADA · **Origem:** decisão explícita do fundador na **abertura da Fase 6** (§1 da autorização "FASE 6 — FECHAMENTO DA ABERTURA + INÍCIO FORMAL DO SDD"), em resposta à contradição normativa levantada no relatório de abertura da Fase 6.

**1. Decisão anterior (preservada, não apagada).** `D-STATUS-CARDS` (2026-07-05) determinava *"Premium usa selo dourado 'Plano Família' (nunca roxo)"*. A mesma prescrição aparecia, com as mesmas palavras ou equivalentes, em [`ADENDO_ALINHAMENTO_AUDITORIA_FINAL_PTF_v1_2026_07.md`](ADENDO_ALINHAMENTO_AUDITORIA_FINAL_PTF_v1_2026_07.md) §2 (*"premium bloqueada com selo dourado"*) e em [`DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md`](DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md) §3 (*"avatares premium com moldura gold + selo 'Plano Família'"*) e §4.6 (*"selo gold 'Plano Família'"*).

**2. Contradição detectada na abertura da Fase 6 (2026-08-07).** A auditoria somente-leitura da abertura da Fase 6 encontrou três fatos simultâneos e incompatíveis entre si:
   1. **três fontes normativas** prescreviam **selo dourado** para o Plano Família (item 1 acima);
   2. o **runtime implementado** usa **azul-noite** no selo premium (`src/theme/tokens.js`, bloco `seal`), com uma nota de governança em comentário de código identificada como **`A0.7`**;
   3. o **smoke** (`scripts/smoke.js`) transformou esse azul-noite em **portão duro de CI**, falhando o build se o premium voltar a roxo/lilás/marrom.

   A contradição **não era resolvível por precedência documental**: aplicar "documento vence código" tornaria o selo premium **dourado**, colidindo frontalmente com a **Lei 2** da Direção de Arte (*"Dourado é material de recompensa, não cor de UI… Se tudo é dourado, nada é precioso"*) e com a exigência, registrada no próprio runtime, de que os três selos sejam *"coesos e **DISTINTOS**"* — já que **Concluída** também é dourado. O corpus contradizia a si mesmo, e por isso a questão foi elevada ao fundador como a **única pergunta genuína de produto** da abertura da Fase 6.

**3. Decisão atual do fundador (2026-08-07) — vigente.**
   - **GRÁTIS → verde suave.**
   - **PLANO FAMÍLIA → azul premium mais luminoso e acolhedor.** O azul-noite hoje implementado é **escuro demais para a linguagem infantil desejada**. O novo azul deve permanecer **claramente reconhecível como azul** e comunicar **confiança, acesso premium e acolhimento**, **sem aparência corporativa, pesada ou adulta**.
   - **CONCLUÍDA → dourado**, reservado a **recompensa, conquista, conclusão e preciosidade**.
   - **ROXO segue aposentado** (D2) e **não pode voltar** nem como cor de estado, nem como cor do Plano Família.
   - **Regra transversal reafirmada:** **cor nunca comunica estado sozinha.** Todo estado continua expresso na linguagem de `D-STATUS-CARDS` — **chip · selo · ícone · texto · tratamento visual**. **Nenhuma paleta cromática paralela por status.** **Vermelho não vira sistema próprio de erro.** Estados como *baixando, baixado, offline, em andamento* e *requer atualização* **não** ganham paleta cromática independente.

**4. O HEX exato NÃO é decidido aqui.** O fundador determinou explicitamente que o HEX final **não seja inventado arbitrariamente** nesta abertura. O token exato será produzido **dentro do ciclo SDD da Fase 6**, derivado de: Direção de Arte "O Livro Vivo"; paleta oficial já existente; contraste; acessibilidade; legibilidade; uso sobre fundo claro e escuro quando aplicável; coerência com os demais tokens. **A escolha do HEX não volta como pergunta ao fundador**, salvo se a análise técnica encontrar **duas alternativas materialmente diferentes de produto** que os documentos não consigam arbitrar.

**5. Novo árbitro.** Para a **cor dos selos de estado**, o árbitro passa a ser **esta decisão (`D-SELOS-ESTADO-V2`)**. Para **tudo o mais** relativo a estados de card — gramática de estado, proibição de paleta paralela, erro sem vermelho, roxo aposentado —, o árbitro continua sendo **`D-STATUS-CARDS` + `D-DESIGN-LIVRO-VIVO` + Lei 2 da Direção de Arte v1.1**. Onde os documentos citados no item 1 prescrevem "selo dourado" para o Plano Família, prevalece esta decisão; os textos originais permanecem no lugar, marcados com nota de superação.

**6. Impacto esperado no futuro bloco B5 (sistema visual da Fase 6).** O bloco de sistema visual da Fase 6 — designado **B5** no relatório de abertura — passa a ter, além do que já lhe cabia:
   - derivar e registrar o **token de azul premium luminoso** conforme o item 4;
   - **atualizar `src/theme/tokens.js`** (bloco `seal`, hoje azul-noite) e a **nota de governança em comentário** que hoje cita `A0.7`;
   - **atualizar o portão de smoke** (`scripts/smoke.js`), que hoje **exige** o azul-noite e, sem alteração, **reprovaria** a implementação desta decisão — o portão deve passar a exigir *azul premium luminoso, sem roxo/lilás/marrom, Grátis verde, Concluída dourada*;
   - **atualizar os documentos do item 1** para a redação final, se e quando o token existir.

   ⚠️ **Nada disso foi executado nesta etapa.** Esta é uma decisão **exclusivamente documental**; **nenhum arquivo de runtime foi tocado** no registro desta decisão.

**7. Registro formal sobre a alegação `A0.7`.** A migração do selo premium de roxo/lilás para azul-noite existia **apenas como comentário de código** em `src/theme/tokens.js`, autoidentificada como *"A0.7"*. A busca no corpus confirmou que **`A0.7` não aparece em nenhum documento normativo do projeto** — nem em `DECISIONS.md`, nem na Direção de Arte v1.1, nem no Adendo v1, nem nos Product Locks. Fica **formalmente registrado** que **comentário de código nunca foi registro normativo suficiente** de decisão de produto (o que o próprio `v5` já proíbe: decisão tomada em conversa sem registro em `DECISIONS.md` não é oficial). Essa alegação está agora **substituída por esta decisão formal**, que é o registro normativo válido do assunto.

### D-SDD-WORKFLOW-YML-DIVERGENCIA — O `workflow.yml` do Speckit descreve um fluxo reduzido (registro, não alteração)
- **Data:** 2026-08-07 · **Status:** 📌 REGISTRADA (divergência conhecida, **arquivo não alterado**) · **Origem:** auditoria da abertura da Fase 6.
- **Fato:** [`.specify/workflows/speckit/workflow.yml`](../.specify/workflows/speckit/workflow.yml) (`author: "GitHub"`, `name: "Full SDD Cycle"`) descreve **4 comandos e 2 portões** (`specify → review-spec → plan → review-plan → tasks → implement`). **Faltam `clarify`, `checklist`, `analyze` e o Portão Humano 3.**
- **Consequência:** esse arquivo **não é o fluxo do projeto**. O fluxo obrigatório é o de **10 etapas e 3 portões humanos** fixado na Constituição (`.specify/memory/constitution.md`), onde *"pular, inverter ou comprimir essas etapas é violação constitucional"*, e reproduzido em `AGENTS.md`/`CLAUDE.md`.
- **Árbitro:** a **Constituição** permanece o árbitro operacional. O `workflow.yml` é artefato *upstream* do Speckit, **não** fonte de verdade de processo.
- **O que NÃO foi feito:** o arquivo **não foi alterado** nesta etapa, por determinação expressa do fundador. Sua correção só se torna obrigatória se a própria Constituição ou o ciclo SDD a exigirem antes do Specify — o que **não** ocorre hoje, porque a Constituição já prevalece sobre ele.

### D-CRIAR-COM-BENI-STATUS — Status de "Criar com Beni" no v1 ✅ **ENCERRADA (2026-08-05)**

> ✅ **ENCERRAMENTO DEFINITIVO — decisão do fundador na Fase 4B (2026-08-05).**
> **Não existirá uma terceira experiência chamada "Criar com Beni".** Os **nomes oficiais** são
> **`Criar Livre`** (autoria livre) e **`Colorir com o Beni`** (coleção narrativa dentro da história) —
> e **somente** esses dois. **"Criar Juntos" é uma chamada contextual para o `Criar Livre`**, não uma
> funcionalidade independente.
> Esta decisão **deixa de ser pendência**: nada mais precisa ser confirmado. O que resta é
> **implementação** — remover ou redirecionar o atalho legado "Criar com Beni" da Home e qualquer
> card/fala/texto/guia com esse nome. Ver §PL4B · `D-4B-NOMES-OFICIAIS`.
> O texto histórico abaixo é **preservado sem reescrita**.

- **Data:** 2026-07-05 · **Status:** ✅ **ENCERRADA em 2026-08-05** (era 🟡 A CONFIRMAR) · **Origem:** conflito entre documentos + instrução Eduardo.
- **Situação:** o adendo pede remover "Criar com Beni / Desenho guiado" do v1; **o fundador NÃO autorizou remoção de código neste bloco.** O status de "Criar com Beni" no v1 está **conflitante entre documentos**.
- **Decisão:** **registrada como decisão A CONFIRMAR pelo fundador. NENHUMA alteração de código agora.** Até a confirmação, o comportamento atual do app permanece intacto.
- **🔄 ATUALIZAÇÃO E1 (2026-07-15):** o **nome oficial da experiência criativa livre é `Criar Livre`**. "Criar com Beni" **deixa de existir como nome público de experiência separada**. Qualquer card/fala/texto/guia antigo chamado "Criar com Beni" deve ser **removido ou redirecionado em bloco futuro de código** (a Home ainda possui esse atalho legado). **Não modificar Home nem rotas neste bloco.** Ver E1-BENI-LINGUAGEM e a pendência controlada correspondente.

### D-ANTIBIFURCACAO — Fonte única + rito de sessão
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA · **Origem:** Adendo v1 §8.
- **Decisão:** (1) **UMA fonte de verdade** para a linha de lançamento = `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`, subordinada ao Roteiro Mestre; documentos anteriores viram SUPERSEDED sem apagar conteúdo. (2) **DECISIONS.md é o árbitro.** (3) **Toda sessão de IA começa lendo DECISIONS.md** e declara sob qual data opera. (4) Mudança de decisão: fundador aprova → DECISIONS.md primeiro → documentos → código. (5) **Decisão que só existe em conversa não é decisão oficial** até entrar aqui.
- **🔄 ATUALIZAÇÃO (2026-07-30):** o **princípio permanece intacto**; muda apenas **qual** documento ocupa o posto. A fonte única da linha de lançamento passa a ser a [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md); a **v4 vira histórica**, com banner no topo e **sem reescrita do conteúdo**.

### D-PALAVRINHAS-UF1 — Palavrinhas do Beni user-facing no v1 (jogo de soletração)
- **Data:** 2026-07-13 · **Status:** ✅ CONFIRMADA (fundador) · **Origem:** Portão de Definição do P5 + decisões D1/D2/D3 do fundador.
- **Decisão:**
  1. **Nome final aprovado = "Palavrinhas do Beni"** (resolve o item "Soletrando" de `D-NAMING-JOGOS-PENDENTE`).
  2. **Palavrinhas do Beni entra no v1** como o **jogo de soletração** da aba Brincar (o antigo "Soletrando"), **user-facing** — card normal na aba Brincar (não mais dev-gated).
  3. **Traçado ADIADO para depois do MVP** (não descartado). **P5 permanece reservado** ao protótipo técnico isolado de traçado (A/O/L) da feature-009 — **não iniciar agora**.
  4. **MONTE (montar a palavra da bandeja) ADIADO para depois do MVP** (não descartado).
  5. **Laboratório visual, grade de poses, `rodadaId` e demais diagnósticos continuam restritos ao Modo Criador** (`isCreatorQaModeEnabled`/ferramentas internas) — nunca visíveis ao usuário comum.
- **Regra de acesso (segue a linha de lançamento):** Plano Grátis = **2 rodadas/dia por criança, compartilhadas entre os jogos da aba Brincar** (serviço oficial `brincarDailyService`); Plano Família = **ilimitado**. Recompensa = **1 estrelinha por partida válida concluída**, respeitando o **teto diário compartilhado** (`brincarStatsService` / `BRINCAR_DAILY_STAR_CAP`). **Sem chave nova** de rodadas ou estrelas.
- **Nota de arquitetura (fato):** os serviços oficiais `brincarDailyService` e `brincarStatsService` contam **por dia local, no aparelho, compartilhado entre os jogos** — **não** segmentam por criança (o Pares já se comporta assim). Segmentar por criança exigiria alterar os serviços compartilhados (impacta todos os jogos) e **não** faz parte do UF1.
- **Impacto:** implementação **UF1** — expor o card, consumir 1 rodada ao publicar a 1ª palavra, recompensar 1 estrelinha por partida válida, tudo reusando os serviços oficiais. **Supersede o roadmap anterior da feature-009** apenas quanto ao *sequenciamento* (traçado/MONTE eram P5–P8; agrar adiados pós-MVP); o SDD histórico não é reescrito.

### D-OVELHINHA-OV3 — Cadê a Ovelhinha? Modo Infinito + entrada vertical
- **Data:** 2026-07-13 · **Status:** ✅ CONFIRMADA (fundador) · **Origem:** Portão OV1 aprovado + blocos OV2/OV3.
- **Decisão:**
  1. **Entrada com modos VERTICAIS** (lista de cards, hero compacto convidativo, status diário único, CTA fixo no rodapé seguro) — substitui os 3 cards horizontais comprimidos.
  2. **Modo Infinito APROVADO** como 4º modo: **sessão de 60 segundos de busca ATIVA** (cronômetro global que pausa em capa/celebração/transição/blur/AppState), sem número fixo de fases, dificuldade progressiva por Faixas (1–5 ≈ Médio · 6–12 ≈ Difícil · 13+ Difícil priorizado), reusando os 5 backgrounds, os 90 esconderijos e as sacolas atuais.
  3. **Pontuação SEM PUNIÇÃO** (nunca desconta): base 100 por ovelha; velocidade +50 (≤5s) / +25 (≤10s); perfeito +25 (sem erro e sem dica); sequência perfeita 20×n (teto 100); marco +200 a cada 5. **Sem multiplicadores decimais, sem moedas, sem vidas, sem energia.**
  4. **Recorde PESSOAL e LOCAL** (`ovelha.infinito` em `@ptf_brincar_stats_v1`: plays/bestScore/bestEncontradas/bestSequencia) — **sem chave nova, sem ranking online, sem recorde global**.
  5. **Recompensa** segue a linha de lançamento: 1 rodada diária por sessão do Infinito; encontrar várias ovelhas **não** consome rodadas extras; **1 estrelinha** por sessão válida (≥1 ovelha), respeitando o **teto diário compartilhado**.
  6. **Cinco backgrounds permanecem SUFICIENTES para o lançamento** deste jogo (nenhum asset novo em OV3).
  7. Transição **automática** entre fases (sem botão "Procurar"); a **capa técnica** vira um indicador curto e discreto que se revela sozinho quando `sceneReady`.
- **Escopo:** dev-gated (não user-facing ainda). Alterou apenas `CadeAOvelhinhaScreen.js`, `ovelhaGameService.js`, `brincarStatsService.js`, `scripts/smoke.js` e este documento. **Sem commit/push** (aguarda Portão Visual OV3).
- **Adendo OV3R3 (2026-07-13) — matriz final de tempo por modo:**
  1. **Fácil:** sem limite de tempo (só medido para recorde); **não existe derrota por tempo**.
  2. **Médio:** **45 s por fase**; zerar perde **somente aquela fase** (revela a ovelha e avança; a partida continua) — mantém o comportamento OV3R2.
  3. **Difícil:** **2min30s totais (150.000 ms) de busca ativa** para encontrar **10 ovelhinhas** — **relógio ÚNICO da partida** (não reinicia entre cenas; o tempo economizado é carregado). **10/10 antes do zero = vitória** (elegível a 1 estrela); **zero antes das 10 = derrota da partida inteira** (encerra, abre o resultado, **não concede estrela**). Não adiciona/remove segundos por acerto/erro. Recorde de conclusão opcional `bestCompletionMs` em `ovelha.dificil` (só na vitória; menor substitui), sem chave nova. *(Duração final = 150.000 ms; substitui os valores intermediários de 30 s/fase e 5 min.)*
  4. **Infinito:** **60 s** de sessão para **pontuação** (sem limite de fases); zerar encerra a sessão — permanece como implementado.

### D-OVELHINHA-UF1 — Cadê a Ovelhinha? user-facing no v1
- **Data:** 2026-07-13 · **Status:** ✅ CONFIRMADA (fundador) · **Origem:** OV4 (após OV2..OV3R3 aprovados e integrados em `653972b`).
- **Decisão:**
  1. **"Cadê a Ovelhinha?" entra no v1 como jogo user-facing** da aba Brincar (card normal em "Para brincar agora"; **não** mais dev-gated). Nome final = **"Cadê a Ovelhinha?"**.
  2. **Quatro modos disponíveis:** Fácil · Médio · Difícil · Infinito.
  3. **Todos os modos usam a rodada diária oficial** (`brincarDailyService`) — sem contador paralelo.
  4. **Plano Grátis:** limite compartilhado de **2 brincadeiras por dia no aparelho** (compartilhado com os outros jogos da aba Brincar). **Plano Família:** rodadas **ilimitadas**.
  5. **Recompensa:** uma partida válida concede **no máximo 1 estrelinha**, respeitando o **teto diário compartilhado** (`brincarStatsService`/`BRINCAR_DAILY_STAR_CAP`). Difícil: só a vitória 10/10; derrota por tempo não concede. Sem chave nova.
  6. **Ferramentas internas** (Asset Gallery, Simulador, calibração, hitboxes, seed, deck, overlay do Criador, selo "Em teste") **permanecem internas** — gated por `isInternalToolsEnabled`/Modo Criador; **invisíveis ao usuário comum**.
  7. **Cinco backgrounds e 90 spots são suficientes** para o lançamento inicial.
- **Escopo (OV4):** apenas exposição/acesso — `AppNavigator.js` (rota principal sempre registrada; Asset Gallery segue gated), `BrincarScreen.js` (card user-facing), `CadeAOvelhinhaScreen.js` (selo "Em teste" só sob gate interno), `scripts/smoke.js`, este documento. **Mecânicas, modos, tempos, randomização, assets e carregamento INTACTOS.**

### D-LP-FECHAMENTO — Fechamento da trilha loading/performance e baseline da Fase 2.5

- **Data:** 2026-07-30 · **Status:** ✅ CONFIRMADA (fundador, ordem "Portão pós fechamento") · **Origem:** [`RELATORIO_FECHAMENTO_LP.md`](../specs/012-loading-performance-foundation/RELATORIO_FECHAMENTO_LP.md).
- **Decisão:**
  1. **Branch final:** `fix/loading-performance-foundation`.
  2. **Baseline anterior:** `013eec4` (relatório de fechamento).
  3. **Novo baseline:** o commit apontado pela tag anotada **`lp-foundation-closed-2026-07-30`** — `013eec4` + 4 commits deste portão (endurecimento antitautológico do harness, `.gitattributes` LF, ratificação documental e política de veracidade do `Co-Authored-By`). É dele que a Fase 2.5 nasce. Correções documentais posteriores à tag não movem o baseline: o estado de testes e de código sob a tag permanece o mesmo.
  4. **Smoke:** `3312/3312` em `013eec4`; **`3314/3314`** no novo baseline (+2 controles negativos §10c e §20c; nenhuma prova removida ou relaxada).
  5. **Resultado físico:** 13 cenários aprovados em build interno iOS `preview-criador` sem Metro (relatado pelo fundador em 2026-07-29), incluindo offline pós-restart e recovery sem segundo download. **Três** validações físicas seguem pendentes (dois READY concorrentes, reset+retry, saída durante instalação).
  6. **Método:** auditoria conduzida com **ULTRACODE** (orquestração multi-agente) — 17 agentes em 3 fases no fechamento e **7** agentes neste portão (2 varreduras, padrão de referência, CRLF/governança, evidência do fechamento, refutação adversarial e projeto da correção). A refutação adversarial não derrubou nenhum dos 2 sítios vulneráveis nem promoveu nenhum dos ~36 descartados. Evidência detalhada no relatório final da ordem; os artefatos brutos são efêmeros (`%TEMP%`), não versionados.
  7. **A trilha loading/performance está ENCERRADA**, com dívidas não bloqueantes registradas no relatório. Não se reabre investigação sobre ela.
  8. **NÃO existe afirmação de desempenho medido quantitativamente.** Nenhuma medição foi registrada (R21 → `P-127` + `P-139`); `performanceTrace.js` é gated por `__DEV__`/env ausente de todos os perfis do `eas.json` e não há baseline versionado. Qualquer ganho percebido é qualitativo.
     > *Atualização declarada de `F6-R3.x` (2026-08-10) — a conclusão de que **não existe afirmação de desempenho medido quantitativamente** permanece **integralmente válida**; mudou apenas a **causa da impossibilidade**. A partir deste bloco, `performanceTrace.js` **deixa de ser inalcançável fora de `__DEV__`**: a chave `EXPO_PUBLIC_PTF_PERF_TRACE` passa a existir no perfil `preview` do `eas.json` (herdada por `preview-criador`), permanece **ausente do perfil `production`**, e o coletor ganha **evento terminal garantido** que não depende de `home_first_layout` nem de `onboarding_first_layout`. **Continua não existindo baseline versionado e continua não existindo medição registrada** — o que existe agora é a **possibilidade** de medir. Ver §`PF6R3X`.*
  9. **NÃO existe readiness de loja.** O binário ainda referencia ~401 MB por `require()` estático (R5), com premium (R6) e 200 linearts legados (R7) embarcados.
     > *Correção de precisão E018 (2026-08-05) — a conclusão de que **não existe readiness de loja** permanece válida; os números de apoio estavam desatualizados.* Medido no commit executável congelado `015c438`: **519 arquivos e 130.976.281 bytes (124,9 MB)** por `require()` estático (`P-135`), dos quais **378 arquivos e 84.183.401 bytes (80,3 MB)** são as 18 histórias premium (`P-136`). Os **200 linearts legados já não estão no binário** — saíram no macrobloco P3J e `src/assets/coloringImages.js` não existe mais (`P-131`, agora CORRIGIDO). Este item **não é reescrito**: a correção fica registrada aqui, e o estado atual é lido na matriz.
  10. **Próxima fase oficial:** integração do **Colorir com o Beni** (Fase 2.5). A branch de integração **não** foi criada neste portão.
- **Condições obrigatórias da Fase 2.5** (nenhuma é opcional):
  1. ⚠️ **ALTERADA em 2026-08-03.** ~~**Bloquear a persistência de pintura no plano Free no nível da ESCRITA em storage** — não apenas na UI.~~ A condição **muda de critério, não de camada**: a decisão continua vivendo na **autoridade de ESCRITA** e continua **fail closed**, mas passa a ser **decidida pela acessibilidade da história**, não pelo plano. Coerente com [`D-FREE-SEM-SALVAR`](#d-free-sem-salvar--plano-grátis-não-salva-arte-️-parcialmente-revogada-2026-08-03) **apenas no que resta dela (Criar Livre)** e com [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos) no Colorir narrativo. **O bloqueio original foi implementado e validado** (commit `1e2f8dd3`); sua substituição é a **Spec 019**.
  2. **Tornar a atualização de manifest/pack funcional para quem já baixou conteúdo** — hoje quem já instalou não recebe versão nova de forma comprovada.
  3. **Manter os linearts legados fora do binário público** — a remoção é projeto próprio; a Fase 2.5 não pode reintroduzi-los nem ampliar a dependência deles.
  4. **Resolver a divergência de CRLF sem conflito artificial** — `feat/colorir-60-pilot-creation` tem `scripts/smoke.js` 100% CRLF (R23). Este portão fixou `scripts/smoke.js text eol=lf` no `.gitattributes`; a branch divergente precisa ser renormalizada **antes** do merge. Atenção: além do EOL há divergência real de conteúdo.
- **Riscos residuais — ORIGEM HISTÓRICA. ⚠️ ABSORVIDOS PELA MATRIZ CANÔNICA em 2026-08-05 (E018).** A lista abaixo **deixou de ser normativa**. Ela permanece aqui como **origem histórica e tabela de alias**: cada `R` tem agora um código `P` canônico em [`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md), **única fonte de inventário, identidade, status, fase e rastreabilidade de pendências do projeto**. Status, severidade e fase de cada item passam a ser lidos **na matriz**, nunca aqui. A classificação individual e as correções de precisão estão na §22 da matriz.
  - **R5** — peso do binário e `require()` estático → **parcialmente coberto**; parcela residual em **`P-135`** (número original de ~401 MB corrigido para 519 arquivos / 130.976.281 bytes no commit `015c438`).
  - **R6** — conteúdo premium embarcado → **`P-136`** (risco novo real).
  - **R7** — 200 linearts legados → **`P-131`, agora CORRIGIDO**: os 199 linearts saíram no macrobloco P3J e `coloringImages.js` não existe mais. Rescaldo documental vivo em `P-37`.
  - **R17** — `appVersion` literal `'1.0.0'`, `minAppVersion` e compatibilidade → **parcialmente coberto por `P-134`**; parcela residual em **`P-137`**. Correção de precisão: `requiresAppUpdate` **não** é inerte — inerte é a **entrada** `appVersion`.
  - **R20A** — ausência de evidência física em Android → **`P-128`** (equivalente pleno).
  - **R20B** — sha256 lendo o arquivo inteiro em base64 → **`P-138`** (risco novo real).
  - **R21** — ausência de medições quantitativas → **parcialmente coberto por `P-127`**; parcela residual em **`P-139`**.

  R20 passa a ser tratado como **dois riscos distintos** (R20A e R20B): a divisão é documental e não altera o conteúdo do risco original. Esta reatribuição **não reabre a Fase 2**.

  *Divergências de fase registradas na E018 e ainda não resolvidas:* a matriz situa `P-128` na **Fase 21** como única fase proprietária, enquanto a `v5` pede evidência física em Android como critério de saída das Fases 12A e 14; e situa `P-127` na **Fase 9** e `P-139` na **Fase 6**, enquanto este registro punha o baseline de `R21` na **Fase 3** — fase que é somente leitura e não pode produzir medição. As três ficam para o Product Lock decidir.

  *Nota de rastreabilidade (atualizada em 2026-07-30, bloco P1):* o [`PLANO_OFICIAL_BENI_LANCAMENTO.md`](PLANO_OFICIAL_BENI_LANCAMENTO.md) é **histórico** e não recebe a numeração ampliada. A [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md) ficou **desatualizada** e foi superada. A partir desta data, o **roadmap completo — Fase 0 à Fase 22, incluindo 2.5, 8A, 12A e 12B — vive na [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md)**, e é lá que os destinos de risco acima ficam rastreáveis. O [`PROJECT_SOURCE_OF_TRUTH.md`](PROJECT_SOURCE_OF_TRUTH.md) e o [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md) passam a apontar para a **v5**.
- **Gates físicos obrigatórios da Fase 2.5:** os três cenários ainda não executados no dispositivo passam a ser **gates de aceite da Fase 2.5**, não pendências informativas — (1) **dois READY concorrentes**; (2) **reset seguido de retry**; (3) **saída durante a instalação**.
- **Escopo do portão:** apenas testes (`scripts/smoke.js`), governança (`.gitattributes`, `CLAUDE.md`, `.specify/memory/constitution.md`) e documentação (este arquivo). **Zero** alteração em código de produção.

### D-C60-INTEGRACAO-PRODUTO — Integração do Colorir com o Beni (decisões de produto)

- **Data:** 2026-07-30 · **Status:** ✅ **CONFIRMADA PELO FUNDADOR** (ordem "Fase 2.5, Bloco P1") · **Origem:** decisões diretas do fundador registradas neste bloco documental.
- **Alcance:** este registro governa a **Fase 2.5** e tudo que dela decorre. Ele **atualiza e especifica** [`D-FREE-SEM-SALVAR`](#d-free-sem-salvar--plano-grátis-não-salva-arte-️-parcialmente-revogada-2026-08-03) e **E1-ARTES-SALVAR**, e **resolve** o `[A CONFIRMAR]` de [`D-CONCLUSAO-TOTAL-B`](#d-conclusao-total-b--desbloqueio-da-próxima-história-exige-conclusão-total-opção-b).
- ⚠️ **Revogação parcial em 2026-08-03 (Spec 019):** o **§1 regras 1, 2, 7 e 8** e partes do **§2** foram revogados **para o Colorir com o Beni**. Ver [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos). Os §§ **3 a 7** deste registro (critério de "colorir concluído", estados C1–C9, atualização de conteúdo, packs e verificação offline) **não foram tocados** e seguem integralmente vigentes.

#### 1. Plano Grátis — pintura, conclusão e salvamento ⚠️ **REGRAS 1, 2, 7 e 8 REVOGADAS PARA O COLORIR NARRATIVO (2026-08-03)**

> ⚠️ **REVOGAÇÃO CIRÚRGICA.** Em **2026-08-03** o fundador revogou, **para o Colorir com o Beni**,
> a regra de que a autoridade de escrita decide **pelo plano**. Ela passa a decidir **pela
> acessibilidade real da história e da atividade**. Vale
> [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos).
> As regras **3, 4, 5, 6 e 9 continuam integralmente vigentes** — inclusive a mais importante
> delas, a de que **nenhuma oferta comercial interrompe a celebração infantil**.
> Para o **Criar Livre**, o parágrafo inteiro segue vigente **sem alteração**.

1. ~~O **Plano Grátis nunca persiste pixels de nova pintura.**~~ ❌ **REVOGADA (2026-08-03) para o Colorir narrativo.** Passa a valer: *o Colorir com o Beni é persistido para **todos os planos**, sempre que o usuário tiver acesso legítimo à história.* Continua vigente **para o Criar Livre**.
2. ~~O bloqueio vive na **autoridade de escrita**, e é **fail closed**: na dúvida sobre o plano, não escreve.~~ ❌ **REVOGADA (2026-08-03) quanto ao critério.** A autoridade de escrita **permanece** como o único ponto de decisão e **permanece fail closed** — o que muda é a **pergunta que ela faz**: deixa de ser *"o plano é Família?"* e passa a ser *"esta história e esta atividade estão legitimamente acessíveis?"*. **O mecanismo não é enfraquecido; o critério é substituído.**
3. **Concluir não é salvar.** São ações distintas, com significados distintos para a criança. ✅ **vigente**
4. O botão **`Pronto`** **conclui** a atividade, **registra progresso** e **apresenta a celebração**. ✅ **vigente**
5. O **`Pronto` não abre paywall.** ✅ **vigente**
6. A criança do **Grátis recebe a mesma celebração** que a criança do Plano Família. ✅ **vigente**
7. ~~A ação explícita **`Salvar` / `Guardar minha arte`** é **benefício do Plano Família**.~~ ❌ **REVOGADA (2026-08-03) para o Colorir narrativo** — no Colorir com o Beni **não existe ação explícita de salvar**: o `Pronto` conclui **e** guarda, sem pedir nome. Continua vigente **para o Criar Livre**.
8. ~~No Grátis, a ação explícita de persistência chama o **gate parental** e **só depois** apresenta a oferta ao responsável.~~ ❌ **REVOGADA (2026-08-03) para o Colorir narrativo** (não há ação explícita de persistência a interceptar). Continua vigente **para o Criar Livre**.
9. **Nenhuma oferta comercial interrompe automaticamente a celebração infantil.** ✅ **vigente — reforçada**

> Esta decisão **atualiza e especifica** [`D-FREE-SEM-SALVAR`](#d-free-sem-salvar--plano-grátis-não-salva-arte-️-parcialmente-revogada-2026-08-03): o "toque em Salvar → gate parental → paywall" continua valendo, mas passa a se aplicar **apenas à ação explícita de salvar**, nunca ao ato de concluir a atividade. **A partir de 2026-08-03 esse fluxo existe apenas no Criar Livre.**

#### 2. Artes antigas

1. Artes já salvas **nunca são apagadas**. ✅ **vigente para as duas experiências — princípio reafirmado**
2. O Grátis **pode visualizar** as artes antigas em **somente leitura**. ✅ vigente para o **Criar Livre**. Para o Colorir com o Beni sob **downgrade**, vale a política própria de [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos) §3.
3. O Grátis **não persiste novas alterações** sobre elas. ✅ vigente para o **Criar Livre**; para o Colorir narrativo de história **acessível**, ❌ **revogada** — o Grátis persiste.
4. Tentar guardar uma alteração chama o **gate parental**. ✅ vigente **apenas para o Criar Livre**.
5. Ao voltar ao **Plano Família**, a **edição persistente volta a funcionar**. ✅ **vigente para as duas experiências** — é a base da regra de downgrade de §3 da decisão nova.
6. Migrações **preservam blobs, thumbnails e metadados**. ✅ **vigente — princípio reafirmado**

> Esta decisão **especifica** **E1-ARTES-SALVAR** (seção "7. Artes" das decisões consolidadas E1). **E1-ARTES-SALVAR e E1-PLANO-FREE NÃO foram revogados** e continuam governando o Criar Livre.

#### 3. Critério de "colorir concluído"

1. Para efeito de `isStoryFullyComplete`, **colorir concluído = pelo menos uma atividade do Colorir com o Beni concluída**.
2. **Uma de três** já satisfaz o **marco obrigatório Criar**.
3. **Três de três** = **coleção completa**.
4. A **coleção completa tem a sua própria grande celebração**.
5. **Três de três não bloqueia** o desbloqueio da próxima história.
6. As **dez páginas legadas não são exigidas** em **A Criação**.
7. Até cada história receber o novo modelo, **uma página legada concluída pode servir como compatibilidade temporária**.

> Esta decisão **resolve** o `[A CONFIRMAR]` de [`D-CONCLUSAO-TOTAL-B`](#d-conclusao-total-b--desbloqueio-da-próxima-história-exige-conclusão-total-opção-b).

#### 4. Estados atribuídos aos itens C1 a C9

**Convenção obrigatória de citação:** sempre escrever **"C1 a C9 de [`specs/012-loading-performance-foundation/RELATORIO_FECHAMENTO_LP.md`](../specs/012-loading-performance-foundation/RELATORIO_FECHAMENTO_LP.md) §9.1"**. **Nunca usar apenas "C1 a C9"**, porque existem homônimos no repositório (a `spec.md` da mesma feature usa `C1`–`C4` para *cenários de crash* de recovery — eixo diferente).

| Item | Estado atribuído |
|---|---|
| **C1** | **Reutilizar o kind `coloring`.** Nenhum kind novo é criado. |
| **C2** | **Corrigir na Fase 2.5** (alinhamento do kind aceito entre `packManifestService` e `packDownloadService` — dívida D6). |
| **C3** | **Corrigir integralmente na Fase 2.5** (bloqueio de persistência do Grátis na camada de escrita, incluindo o caminho legado). |
| **C4** | **REPROVADA** — correção **obrigatória** na Fase 2.5 (ativar `needs_update`). |
| **C5** | **Política mínima de coleta de lixo** e **desempate de `ambiguous`** na Fase 2.5. |
| **C6** | **Lineart em PNG** e **download público monolítico** nesta fase. |
| **C7** | **Preservar os linearts legados durante a integração**, sem ampliar dependências. A **remoção do binário público continua nas Fases 16 e 17**. |
| **C8** | **Documentar a experiência após sete dias offline**, **sem apagar pack nem arte**. |
| **C9** | **Resolver por transplante semântico sobre o smoke LF**, **sem merge bruto do `smoke.js` antigo**. |

#### 5. Política de atualização de conteúdo (resolve C4 e C5)

1. A **nova versão é preparada sem substituir a READY atual**.
2. A nova versão **só entra em uso** após **download completo**, **verificação de integridade** e **publicação READY**.
3. **Falha mantém a versão anterior utilizável.**
4. O sistema mantém **a versão atual e uma anterior íntegra**.
5. **Só são removidas versões antigas não referenciadas.**
6. O estado **`ambiguous` nunca escolhe silenciosamente**.
7. O **rollback retorna à versão anterior íntegra**.

#### 6. Política de formato e packs

1. As atividades do Colorir com o Beni **reutilizam o kind `coloring`**.
2. **Nenhum kind novo** é introduzido.
3. Os **linearts continuam em PNG**.
4. **A Criação** e **Noé** permanecem **locais**.
5. As **histórias premium recebem as atividades dentro do pack existente**.
6. O **download público é monolítico na Fase 2.5**.
7. O **download seletivo fica para avaliação na Fase 17**.

#### 7. Limite de verificação offline

1. Após a expiração da verificação offline, **nenhum pack é apagado**.
2. **Nenhuma arte é apagada.**
3. O **responsável recebe solicitação de reconexão**.
4. A **criança não recebe culpa nem linguagem comercial**.
5. Após confirmar o entitlement, **o conteúdo volta sem novo download**.
6. A **duração definitiva** é **revisada na Fase 18**, junto com o RevenueCat.

### D-C60-SCENE02-SUPERACAO — Substituição de `scene_02.png` supera a proibição de PL01G-01

- **Data:** 2026-07-30 · **Status:** ✅ CONFIRMADA (fundador) · **Origem:** ordem "Fase 2.5, Bloco P1" §6.1.
- **Decisão histórica preservada (não apagada).** O registro **`PL01G-01`** — criado na branch `feat/colorir-60-pilot-creation` (commits `3cd7e3f` e `802b04a`) e ainda **não presente no `DECISIONS.md` desta branch** — contém, na sua lista de proibições, a cláusula literal: ***"não sobrescrever `scene_02.png`"***. Essa redação fica **registrada aqui como histórico** e **não é removida** de onde existe.
- **Nota de superação:**
  1. A **proibição antiga de sobrescrever `scene_02.png` foi superada** pela **aprovação visual explícita do fundador**.
  2. O **arquivo aprovado foi integrado no mesmo caminho** (`assets/stories/creation/coloring/scene_02.png`), nos commits `cc63e19` e `f16491c` da branch do piloto.
  3. O arquivo aprovado **mantém as dimensões 1122 por 1402**.
  4. O **caminho legado também consome esse arquivo** (`src/assets/coloringImages.js`), além do novo Colorir (`src/assets/coloring60LocalAssets.js`, atividade `light`).
  5. A **Fase 2.5 exige validação visual do novo Colorir *e* do consumidor legado.**
- **Classificação:** desincronização **documental** do árbitro, **não** ato não autorizado — a substituição foi ratificada pelo fundador e reconciliada em `specs/016-*` §10.2 no momento em que ocorreu; o que faltava era o registro no árbitro. Esta entrada supre essa falta.

### D-C60-NOMEACAO-OBRAS — Colorir com o Beni é COLEÇÃO; Criar Livre é AUTORIA

- **Data:** 2026-07-31 · **Status:** ✅ CONFIRMADA (fundador) · **Origem:** ordem "P3J-R.1 — Fechamento Técnico", seção *Decisão de produto*.
- **Problema.** As duas superfícies de criação do app guardam artes no mesmo lugar visual (a coleção da criança), mas **não têm a mesma natureza**. Sem essa distinção registrada, qualquer sessão futura tenderia a "uniformizar" as duas — e a uniformização mais provável (dar campo de nome ao Colorir) mexeria em schema, ponteiro e overlay de uma área já validada fisicamente.
- **Decisão:**
  1. **Criar Livre é AUTORIA.** A folha começa em branco, o traço é da criança, e por isso **a criança pode nomear a obra**.
  2. **Colorir com o Beni é COLEÇÃO.** O desenho de base é do app; a criança colore uma peça de um conjunto conhecido.
  3. A identidade de uma arte do Colorir é o **nome canônico da história/atividade** — não um texto livre.
  4. **Não** existe campo de nome para o Colorir 60 **agora**.
  5. **Não** se altera `POINTER_VERSION` (permanece `3`).
  6. **Não** se migram obras já salvas.
  7. **Não** se altera o overlay.
  8. **Não** se altera o schema de persistência.
  9. **Não** se altera a coleção nem a forma como ela lista as artes.
  10. A nomeação opcional no Colorir 60 **pode ser reaberta depois do piloto** — como feature própria, com ciclo SDD completo.
  11. Enquanto isso, **nenhuma copy pode prometer nomear uma arte de colorir**.
- **Consequência de copy (aplicada no mesmo bloco):** o Cultinho passou a convidar a **"Criar juntos (opcional)"** (~~a rota sempre foi o **Ateliê**, que é criação livre — prometer "Colorir" ali era promessa que a tela de destino não cumpre~~ ⚠️ **RETIFICADO — ver D-CULTINHO-CRIAR-LIVRE abaixo**), e o Ateliê passou a se apresentar como **"Criar e guardar suas artes de fé."**.

### D-CULTINHO-CRIAR-LIVRE (P3J-R.1 FIX1) — o Cultinho abre o Criar livre canônico
- **Status:** ✅ decisão de produto **final e irrevogável** do proprietário, após **reprovação em validação física** do P3J-R.1 — e ✅ **VALIDADA FISICAMENTE em 2026-08-01** (Development Client, HEAD `36d7077`), com os **12 resultados aprovados** registrados em [`ATELIER_GUIDE.md` §0.11](ATELIER_GUIDE.md). Veredito: `PHYSICAL_VALIDATION_APPROVED` · `P3J_R1_FIX1_CLOSED`.
- **O que estava errado:** o P3J-R.1 corrigiu só a *copy* e **preservou** `navigation.navigate('AtelierFromContext', { from: 'cultinho' })`. Essa rota montava a tela-hub legada **"Ateliê do Beni"** (Mesa criativa · Colorir com o Beni · Desenho guiado pelo Beni · Criar livre · Minhas artes). Ou seja: o botão "🎨 Criar juntos (opcional)" abria um **menu intermediário**, não a criação. A afirmação retificada acima ("a rota sempre foi o Ateliê, que é criação livre") era **falsa**: o Ateliê era um hub, não o Criar livre.
- **Decisão:** o botão do Cultinho abre **diretamente o Criar livre canônico já usado pela aba Brincar** — **a mesma** rota (`AtelierCanvas`), **o mesmo** componente (`AtelierCanvasScreen`), **o mesmo** canvas, **o mesmo** storage, **o mesmo** fluxo de nomeação, **a mesma** proteção de saída sem salvar e **a mesma** galeria. **Sem** tela intermediária, **sem** cópia, **sem** variante, **sem** Colorir com o Beni.
- **Origem:** `from: 'cultinho'` é preservado **somente** para o retorno contextual (rótulo do voltar via `backLabelFor`, contrato `src/utils/originBack.js`). **Não** cria fork de comportamento — o destino da saída continua sendo o `goBack()` da pilha.
- **Consequência estrutural:** sem consumidor legítimo, foram **removidos** a rota `AtelierFromContext`, o import e o componente `src/screens/AtelierScreen.js`. **Nenhum usuário alcança mais a tela "Ateliê do Beni"** (confirma a lápide já prevista em `DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md` §A5: "tela morre; Brincar nasce").
- **Resíduo declarado (mantido de propósito):** `ATELIER_GUIDE` (`src/data/beniGuides.js`) e as 5 entradas `guide.atelier.*` (`src/data/beniGuideAudio.js`) **permanecem**, hoje **sem consumidor de UI**. Removê-las orfanaria 5 áudios reais e alteraria **manifesto de áudio — área protegida**. Higiene desse guia = bloco próprio, com instrução direta.
- **Inalterado:** nada do Colorir 60, nada de flags, nada de schema/`POINTER_VERSION`, nada do comportamento do Criar livre além de receber a origem.

### D-C60-PILOT-ATIVACAO (spec 018) — ativação controlada do piloto Colorir 60 de "A Criação"
- **Data:** 2026-08-01 · **Status:** ✅ CONFIRMADA (fundador, três ratificações escritas) · **Escopo:** **infraestrutura, testes e governança** — **não** autoriza build, instalação, publicação nem integração.
- **Problema.** `COLORIR_60_CREATION_PILOT_ENABLED` nasceu como literal `false`, e o único caminho alternativo era `__DEV__ && isInternalToolsEnabled()`. Como **`__DEV__` é `false` em todo build de release**, o piloto era **inalcançável** num APK/IPA — e trocar o literal por `true` ligaria também a **loja**, sem cerca nenhuma. Faltava um caminho que fosse ao mesmo tempo **alcançável num build interno** e **impossível por acidente em produção**.

1. **Mecanismo — cerca dupla, não flag simples.** A flag passa a ser a **conjunção** de duas variáveis de build, no mesmo padrão release-safe já aprovado para `RELEASE_PACK_QA_ENABLED` e `CREATOR_QA_MODE_RELEASE_ENABLED`:
   `EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT === 'true'` **e** `EXPO_PUBLIC_BUILD_PROFILE === 'c60-pilot'`.
   Comparação **literal e estrita**; **fail-closed por ausência**; **uma variável isolada é inerte**.
2. **Perfil `c60-pilot`.** Único perfil que declara as duas variáveis. Distribuição **interna**, iOS + Android, **sem `extends`** e sem herdeiros, release (`__DEV__ = false`). **Não** declara Modo Criador, sandbox de packs, Release Pack QA nem variáveis de produção — logo `isInternalToolsEnabled()` é `false` nele: **sem "Administração (dev)", sem Bancada C60**. Nenhum perfil pré-existente foi alterado.
3. **Produção continua fechada.** O bloco `production` do `eas.json` **não declara nenhuma** das duas variáveis: falha por **ausência dupla**. `preview`, `preview-criador`, `screenshot` e `development` também não as declaram. O smoke prova isso **por execução real** do fonte sob o env lido do próprio `eas.json` — não por leitura de texto.
4. **Público: Free e Família.** "A Criação" é conteúdo **gratuito**; o piloto **inclui o plano gratuito** e **não** é exclusivo de premium. A criança Free **abre, pinta e conclui**, com celebração e conclusão normais. ⚠️ ~~**O plano gratuito não salva a arte** — `NOT_PERSISTED_FREE` é comportamento **correto**, não bug~~ — **REVOGADO em 2026-08-03 (Spec 019)**, ver nota abaixo; a coleção deve representar honestamente que a arte não foi persistida. O **Plano Família continua salvando**. Nenhuma escrita de storage foi alterada e **nenhum aviso, modal, paywall ou copy nova** foi acrescentado neste bloco.
5. **Modo Criador não falsifica entitlement.** O Modo Criador **não deve ser usado** para simular premium num build de release do piloto — e o perfil `c60-pilot` **sequer o declara**.
6. **Efeito sobre progresso — HIPÓTESE OBSERVÁVEL, não regra pública.** Com o piloto ligado, `isStoryColoringAvailable('creation')` vira `true` e o colorir passa a **pesar** no `journeyComplete` de "A Criação". Numa instalação que já concluiu a história **sem** o Colorir 60, ela pode **deixar de contar como concluída temporariamente**, e **Noé** (imediatamente seguinte na ordem oficial) pode aparecer com **bloqueio de sequência**. **Concluir uma única das três atividades restaura tudo** (`count >= 1`). **Nada de migração, carência, grandfathering ou exceção** foi implementado — deliberadamente. `ProgressContext.js`, `storyColoringAvailability.js`, `storyColoringCompletion.js`, `isStorySequenceUnlocked`, regras de conclusão e de desbloqueio, mapa e Story Detail ficaram **intocados** (provado por SHA-256 no smoke).
7. **A decisão definitiva é da Fase 4.** O resultado do piloto vira **evidência** para a decisão de critérios de conclusão e progressão do Roteiro Mestre — **não** regra pública final. Esta decisão **não** constitui Product Lock de progressão.

> ⚠️ **NOTA DE REVOGAÇÃO (2026-08-03) — o piloto continua válido; a política que ele exercitou, não.**
> Esta decisão **não é anulada**: a cerca dupla, o perfil `c60-pilot`, o fechamento de produção e as
> asserções `c60PilotSealed()` **continuam integralmente vigentes**. O que foi revogado é **uma única
> frase** do item 4 — a de que o plano gratuito **não** salva a arte.
>
> **O que a validação física do build `3b4dea54-2194-491c-8ddb-0c6bf85ad049` (commit `1e2f8dd3`,
> aprovada pelo fundador em 2026-08-03) provou e continua provando:** FIX 1, FIX 2 e FIX 3 aprovados;
> navegação, Cultinho, Criar Livre e funcionamento offline local aprovados. **Esses resultados não são
> reabertos.**
>
> **O que ela NÃO cobriu, por impossibilidade técnica:** entitlement Família real, persistência com
> plano Família real, download de histórias premium e testes premium sem ferramentas internas. Causa
> registrada como fato: **não existe nenhuma chave `EXPO_PUBLIC_REVENUECAT_*` declarada no `.env` nem
> em nenhum perfil do `eas.json`**, e `__DEV__` é `false` no perfil `c60-pilot` — logo o ramo premium
> era **inalcançável** naquele binário. **Consequência direta: o caminho de ESCRITA do Colorir 60
> (double buffer, promoção de ponteiro, verificação, rollback, hidratação, edição e sobrescrita) nunca
> foi exercitado em dispositivo físico — é provado apenas pelo `scripts/smoke.js`.** A Spec 019 abre
> esse caminho para **todos** os planos e por isso **exige validação física própria**, que **não pode
> ser herdada** deste build.

- **Alcance dos testes.** As **9 asserções históricas** que exigiam o literal `false` (blocos `C60-P0.T8`, `C60-P1.T5`, `C60-P2`, `C60-P3`, `C60-P3-FIX1`, `C60-P10`, `P3J-R`, `P3J-R.1`, `P3J-R.1 FIX1`) **não foram apagadas**: cada rótulo histórico foi preservado e a metade textual virou `c60PilotSealed()`, que **executa** o fonte de produção. A intenção original ("esta fase não liga o piloto") ficou **mais forte**, não mais fraca.
- **Inalterado:** telas, rotas, navegação, storage, progresso, catálogo C60, atividades, ativos, áudios, poses, falas, marcos das cenas, Criar livre, Cultinho, packs, download, recovery, RevenueCat, entitlements, `bundle identifier`, `runtimeVersion`, `main`, `package.json` e `package-lock.json`.

### D-C60-PERSISTENCIA-TODOS-PLANOS (spec 019) — Persistência local do Colorir com o Beni para todos os planos

- **Data:** 2026-08-03 · **Status:** ✅ **CONFIRMADA PELO FUNDADOR** (ordem "Bloco D1", após aprovação da auditoria read-only combinada) · **Escopo:** **governança e documentação**. Este registro **não** implementa código, teste, build ou migração.
- **Branch:** `spec/019-c60-persistence-all-plans`, nascida de `1e2f8dd33ba6a222745e8de898a6b63b2e426da6`. A branch `integrate/c60-pilot-activation`, **validada fisicamente**, é preservada no mesmo commit e **não recebe novos commits**.
- **Alcance:** **somente o Colorir com o Beni** — o colorir narrativo integrado às histórias. **Não** alcança o Criar Livre.

#### 1. Nova regra oficial de salvamento (revoga a política "Free sem persistência no Colorir com o Beni")

1. Toda pintura do **Colorir com o Beni** deve ser **salva localmente** quando o usuário possuir **acesso à história**.
2. O **plano gratuito salva** as pinturas das **histórias gratuitas** ou de **qualquer história à qual possua acesso legítimo**.
3. O **plano Família salva** as pinturas das **histórias premium** às quais possua **acesso legítimo**.
4. A regra de escrita **não será mais "somente Família"**.
5. A autoridade de escrita deverá decidir pela **acessibilidade real da história e da atividade** — não pelo plano.
6. O salvamento deverá **funcionar offline**.
7. **Uma pintura visível por atividade.**
8. Uma **nova conclusão substitui com segurança** a pintura anterior da mesma atividade.
9. **Não** criar **histórico de múltiplas versões**.
10. **Não** criar **sincronização em nuvem** nesta fase.
11. **Não** pedir **nome** para a pintura narrativa.
12. **Não** alterar o **Criar Livre**.
13. **Não** reintroduzir o **Ateliê legado**.
14. A **coleção** deverá permitir **rever e editar a obra real**.
15. A política deverá suportar **três atividades em cada uma das vinte histórias** (60 slots).

> **A diferenciação comercial permanece — ela apenas muda de lugar.** O Plano Família continua
> diferenciado principalmente pelo **acesso às histórias e experiências premium**, e **não** pela
> retenção das pinturas das histórias gratuitas.

#### 2. Revogação cirúrgica — o que cai e o que fica

| Registro | Efeito em 2026-08-03 |
|---|---|
| [`D-FREE-SEM-SALVAR`](#d-free-sem-salvar--plano-grátis-não-salva-arte-️-parcialmente-revogada-2026-08-03) | ⚠️ **parcialmente revogada** — cai para o Colorir narrativo; **fica** para o Criar Livre |
| [`D-C60-INTEGRACAO-PRODUTO`](#d-c60-integracao-produto--integração-do-colorir-com-o-beni-decisões-de-produto) §1 regras **1, 2, 7, 8** | ❌ **revogadas** para o Colorir narrativo (regras 3–6 e 9 **ficam**) |
| [`D-C60-INTEGRACAO-PRODUTO`](#d-c60-integracao-produto--integração-do-colorir-com-o-beni-decisões-de-produto) §2 regras **3, 4** | ❌ **revogadas** para história acessível (regras **1, 5, 6** ficam e são reafirmadas) |
| [`D-C60-PILOT-ATIVACAO`](#d-c60-pilot-ativacao-spec-018--ativação-controlada-do-piloto-colorir-60-de-a-criação) item **4**, frase "o plano gratuito não salva a arte" | ❌ **revogada** (todo o resto da decisão **fica**) |
| [`D-LP-FECHAMENTO`](#d-lp-fechamento--fechamento-da-trilha-loadingperformance-e-baseline-da-fase-25) condição obrigatória **1** da Fase 2.5 | ⚠️ **critério substituído** (camada de escrita e fail-closed **ficam**) |
| **NÃO REVOGADO — `E1-PLANO-FREE`** ("Criar Livre sem salvar") | ✅ **integralmente vigente** |
| **NÃO REVOGADO — `E1-ARTES-SALVAR`** ("Grátis = zero salvamentos") | ✅ **integralmente vigente** |
| **NÃO REVOGADO — limite zero de `ATELIER_FREE_SAVE_LIMIT`** | ✅ **integralmente vigente** |
| **NÃO REVOGADO — [`D-C60-NOMEACAO-OBRAS`](#d-c60-nomeacao-obras--colorir-com-o-beni-é-coleção-criar-livre-é-autoria)** | ✅ **vigente e agora estrutural** — é ela que sustenta a distinção |

> **A distinção que torna a revogação cirúrgica:** **Colorir com o Beni é COLEÇÃO** — obra derivada
> de um lineart da história, **sem nome**, **uma por atividade**, presa ao arco narrativo.
> **Criar Livre é AUTORIA** — obra do zero, **com nome**, ilimitada, sem história. **A revogação
> alcança a coleção e não toca a autoria.**

#### 3. Downgrade de Plano Família para Grátis

1. Uma pintura premium **já salva nunca será apagada** durante o downgrade.
2. O **arquivo e o ponteiro permanecem localmente preservados**.
3. Enquanto a história premium **não estiver acessível**, a criança **não poderá iniciar nem editar** aquela atividade.
4. O aplicativo **não deverá destruir a obra**.
5. Quando o **acesso Família retornar**, a obra **reaparece e volta a ser editável**.
6. **Não inserir pressão comercial infantil.**
7. **Não prometer acesso** a uma história comercialmente bloqueada.
8. A **preservação dos dados não significa liberação do conteúdo premium**.

#### 4. Reset — separação obrigatória em três ações

| Ação | Contrato |
|---|---|
| **Reiniciar progresso das histórias** | Apaga cenas, quiz, reflexão, livrinho, conclusão e estados de jornada definidos. **Não** apaga automaticamente as pinturas salvas. |
| **Apagar criações salvas** | **Ação parental separada.** Deve permitir distinguir **(a)** pinturas do **Colorir com o Beni** e **(b)** criações do **Criar Livre**. |
| **Apagar todos os dados locais** | Ação **diferente das duas anteriores**, com **gate parental reforçado**. |

> A **implementação da separação de reset é obrigatória antes do novo build físico da Spec 019**
> (bloco **S4**). Sem ela, "reiniciar progresso" apagaria pinturas que a criança nunca pediu para
> apagar — consequência direta desta decisão, não do estado anterior.

#### 5. Estado legado `NOT_PERSISTED`

1. **`NOT_PERSISTED` continuará existindo como estado legado.** A decisão **não** o elimina: muda apenas o **produtor** do estado — de *"o plano é Grátis"* para *"conclusão legada sem pixels"*.
2. Uma atividade **antiga concluída sem pixels permanece concluída**.
3. **Nenhuma pintura poderá ser inventada, reconstruída ou copiada de outro slot.**
4. **Copy transitória oficial** — Título: **"Parte concluída!"** · Mensagem: **"Pinte de novo para guardar sua criação."**
5. Depois de **pintar novamente e salvar com sucesso**, o slot passa para **`ART`**.
6. Uma **falha de escrita não poderá transformar a atividade em não concluída**.
7. Uma **falha de sobrescrita deverá preservar a obra anterior**.

#### 6. Capacidade e política de armazenamento (orçamento inicial)

1. **Uma obra visível por atividade.**
2. **Sessenta slots máximos no lançamento** — três por cada uma das vinte histórias.
3. Orçamento de **até 150 MB** para o diretório `ptf_blobs/drawings60`.
4. **Double buffer somente durante a escrita.**
5. A **geração anterior é removida apenas depois da promoção verificada da nova**.
6. **Nenhum histórico ilimitado.**
7. **GC dirigido de arquivos órfãos** deverá fazer parte do bloco **S3**.
8. **Nenhum PNG deverá ser armazenado no AsyncStorage.**
9. O **AsyncStorage guarda somente ponteiro e metadados**.

> **Quota e GC não são implementados neste bloco.** São orçamento declarado, não código.

#### 7. Estado transitório entre documento e código — ⛔ **NÃO GERAR BUILD**

Depois do **D1** e antes da conclusão do **S1** existe, **de forma intencional**, uma janela em que:

1. A **documentação já contém** a nova decisão.
2. O **código ainda contém** o gate antigo (`coloring60DrawingStorage.js`, retorno `NOT_PERSISTED_FREE`).
3. O **smoke ainda defende** a regra antiga — **26 ocorrências** do desfecho em `scripts/smoke.js`
   (16 `NOT_PERSISTED_FREE` + 10 `not_persisted_free`) afirmam que o Grátis **não** persiste.

> ⛔ **ESTADO TRANSITÓRIO — NÃO GERAR BUILD.** Nenhum build poderá ser gerado entre o **D1** e a
> conclusão do **S1**. **O D1 não afirma que a implementação existe.** Um binário gerado nesta janela
> se comportaria segundo a regra **revogada**, contradizendo o árbitro.

> ✅ **JANELA ENCERRADA EM 2026-08-04.** O **S1** foi concluído (e, com ele, S2, S3, S4 e S4-FIX);
> código, smoke e documentação voltaram a concordar. O build `bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a`
> foi gerado **depois** do fechamento da janela, a partir do commit `b24c868`, e **valida a regra
> nova**. A restrição acima fica preservada como **registro histórico** e **não vigora mais**.

#### 8. Fechamento físico (2026-08-04)

- **Status desta decisão:** ✅ **IMPLEMENTADA E VALIDADA FISICAMENTE.**
- **Build validado:** `bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a` · **commit** `b24c86842a03bf7216d62b90a7fba6514cfb3f98` ·
  **branch** `spec/019-c60-persistence-all-plans` · **perfil** `c60-pilot` (interno, iOS) ·
  **fingerprint** `c8b6c521500558fde471e47202d41d5e9dda79aa` · **iPhone real do fundador**.
- **Veredito do fundador:** **A1–A5 aprovados** (Colorir com o Beni em *A Criação*; três atividades do
  piloto; Cultinho → Criar Livre atual; paridade Criar Juntos ↔ Criar Livre; ausência do Ateliê legado)
  e **P1–P10 aprovados** (persistência após encerramento total; substituição sem duplicação; contador
  em `3 de 3`; reiniciar progresso preservando pinturas; apagar pinturas preservando conclusão e Criar
  Livre; `notPersisted` sem `needsColor`; apagar criações do Criar Livre sem tocar no Colorir;
  persistência após reinício com segunda exclusão idempotente; Modo Avião; mensagens parentais
  coerentes).
- **Portões no commit validado:** smoke **4512/4512** · expo-doctor **18/18**.
- **Registro completo:** [`docs/C60_VALIDACAO_FISICA.md`](C60_VALIDACAO_FISICA.md) **Parte D** ·
  veredito em [`specs/019-c60-persistence-all-plans/spec-c60-persistence-all-plans.md`](../specs/019-c60-persistence-all-plans/spec-c60-persistence-all-plans.md) **§21**.
- **Preservação:** os comportamentos A1–A5 e P1–P10 **não são reabertos silenciosamente**. Alteração
  futura que os toque exige spec própria, provas de regressão e nova validação física.

##### 8.1 Limite do veredito — Plano Família e premium

O perfil `c60-pilot` **não declara** nenhuma chave `EXPO_PUBLIC_REVENUECAT_*` e
`configureRevenueCat()` é *fail closed* — o binário opera **permanentemente no plano Grátis**. Logo:

- **Validado fisicamente:** o eixo de **persistência local no Plano Grátis**, em toda a sua extensão.
- **NÃO validado — e nem reprovado:** **entitlement Família real**, **persistência com Família em
  história premium**, **download de pack premium com salvamento**, **downgrade** e **teste premium sem
  ferramentas internas**. A causa é **impossibilidade técnica do perfil**, não omissão do testador.
- **Destino formal decidido pelo fundador em 2026-08-04:** estes cenários são **obrigatórios na
  Fase 18** (RevenueCat e Plano Família — título corrigido na Fase 4A, ver `D-4A-PLATAFORMAS`)
  e recebem **revalidação obrigatória na Fase 21**
  (Beta do candidato e atualização real entre versões). Até lá são **pendência controlada e
  explícita** — nunca herdados, nunca presumidos.

### D-CONCLUSAO-GLOBAL-SISTEMA (Decisão B) — Sistema global e reutilizável de conclusão das histórias

- **Data:** 2026-08-03 · **Status:** ✅ **CONFIRMADA PELO FUNDADOR** (decisão de produto) · ⚠️ **CONTRATO TÉCNICO NÃO CONGELADO.**
- **Correção de escopo registrada pelo fundador:** *"A decisão de redesenho da conclusão **não** é exclusiva de A Criação."*

1. O sistema de conclusão **não é exclusivo de A Criação**.
2. Todas as histórias utilizarão um **sistema reutilizável** de conclusão.
3. **A Criação** será o **piloto** do sistema — piloto visual e funcional, **não** exceção arquitetural.
4. **Noé** será a **prova de reutilização por configuração** — entra no mesmo modelo apenas por dados.
5. As demais **dezoito** histórias usarão o **mesmo contrato**.
6. **Não** criar uma tela **hardcoded** para cada história.
7. **Estrutura, hierarquia, ações e retornos** devem ser **padronizados**.
8. **Conteúdo, imagens, verdade central e recompensas vêm dos dados da história.**
9. A conclusão deverá ser **reabrível**.
10. Visitar **Colorir, Livrinho, Quiz, Reflexão, Baú ou Estrelinhas** **não poderá destruir** o contexto de conclusão.
11. A navegação deverá **saber retornar à conclusão** quando essa for a origem.
12. ⚠️ **O contrato técnico ainda NÃO está congelado.**

- **Congelamento:** o contrato global de conclusão será congelado **somente no Product Lock da Fase 4**. Nada nesta decisão autoriza implementá-lo na Spec 019.
- **📌 ANOTAÇÃO DA FASE 4C (2026-08-05) — ✅ CONTRATO TÉCNICO CONGELADO.** O aviso do item 12 e do parágrafo acima está **superado**: o contrato global de conclusão foi congelado no Product Lock da Fase 4C. O item 9 ("a conclusão deverá ser **reabrível**") fica **precisado**: a conclusão é **reabrível para leitura**, em **modo sóbrio** — sem confete completo, sem animação principal de conquista e **sem nova recompensa** —, e a **conclusão registrada nunca é revogada**. Padrão único congelado: **treze *slots* e cinco modos**, com **ordem canônica de destinos** (próxima aventura → Mapa → revisitar → Brincar → Início). Ver [`## PL4C`](#pl4c--product-lock-fase-4c--jornada-progressão-conclusão-e-desbloqueios). O congelamento é **documental**: nenhum código foi alterado.

### D-ENCERRAMENTO-GLOBAL-ATIVIDADES (Decisão C) — Linguagem global de encerramento de jogos e atividades

- **Data:** 2026-08-03 · **Status:** ✅ **CONFIRMADA PELO FUNDADOR** (decisão de produto) · ⚠️ **CONTRATO TÉCNICO NÃO CONGELADO.**

1. Jogos e atividades usarão uma **linguagem global de encerramento**.
2. **Não** precisam ter o **mesmo conteúdo visual**.
3. Devem compartilhar os mesmos **contratos de resultado, recompensa, ação principal e retorno**.
4. **Jogar novamente**, **continuar**, **voltar ao Brincar**, **voltar à aventura**, **voltar à origem** e **ir ao Início** deverão possuir **regras canônicas**.
5. **Nenhum jogo poderá ficar sem saída.**
6. **Nenhum jogo deverá inventar uma origem.**
7. **Nenhum encerramento** deverá oferecer **botões duplicados ou contraditórios**.
8. ⚠️ **O contrato técnico ainda NÃO está congelado.**

- **📌 ANOTAÇÃO DA FASE 4C (2026-08-05) — ✅ CONTRATO TÉCNICO CONGELADO.** O aviso do item 8 está **superado**. O padrão único de encerramento dos **quatro jogos** foi aprovado: **mesmos *slots*, ações e rótulos**, **preservando a identidade visual** de cada jogo. A **rodada** só é consumida quando houver **resultado terminal válido**; **Monte a Cena** mantém retomada de sessão **sem consumo duplicado**. Os **quatro jogos** passam a ter **conquistas** no lançamento. Ver [`## PL4C`](#pl4c--product-lock-fase-4c--jornada-progressão-conclusão-e-desbloqueios). O congelamento é **documental**: nenhum código foi alterado.

### D-CONCLUSAO-ESTADO-ATUAL — Achados que impedem o congelamento técnico imediato (registro de fatos)

- **Data:** 2026-08-03 · **Natureza:** **registro de fatos apurados**, não decisão. · **Origem:** auditoria read-only combinada aprovada pelo fundador, detalhada em [`specs/019-c60-persistence-all-plans/AUDITORIA_READONLY_C60_CONCLUSAO.md`](../specs/019-c60-persistence-all-plans/AUDITORIA_READONLY_C60_CONCLUSAO.md).
- **Estes problemas são REGISTRADOS, e NÃO corrigidos na branch da Spec 019.**

1. Existem **duas telas concorrentes** de conclusão de história.
2. A conclusão é **destruída ao abrir o Colorir a partir da conclusão**.
3. A conclusão **não é reabrível** depois do reinício.
4. As **vinte histórias não possuem campos declarativos de conclusão**.
5. Existem **múltiplas fontes de verdade** para o retorno.
6. O **Quiz concede duas estrelas**, mas **três textos prometem uma**.
7. **Congrats não reflete** corretamente Quiz, Reflexão e Livrinho concluídos.
8. Os **quatro jogos** possuem **quatro arquiteturas diferentes** de encerramento.
9. A **pílula de retorno do Brincar está inoperante** porque a origem não é transmitida.
10. A **conclusão global será congelada somente no Product Lock da Fase 4.**

- **📌 ANOTAÇÃO DA FASE 4C (2026-08-05).** O item 10 está **cumprido**: a conclusão global foi congelada no Product Lock da Fase 4C. Os itens 1 a 9 permanecem como **registro de fatos** e **continuam abertos como risco técnico** — a decisão de produto **não** os corrige. Rastreio na matriz canônica: item 1 → `P-03`; item 2 → `P-22`; item 3 → `P-21`; item 4 → `P-15`; item 5 → `P-04`; item 6 → `P-39`; item 7 → `P-08`; item 8 → `P-15` e `P-70`; item 9 → `P-86`. O item 3 recebe **precisão da Fase 4C**: a conclusão **registrada** nunca é revogada; o que falta é a **reabertura em modo sóbrio**, não a preservação do estado.

---

## PL4A — Product Lock da Fase 4A · Plano Família, compra, restauração e entitlement (2026-08-05)

> **Registro formal das respostas do fundador** ao artefato preliminar
> [`docs/fase4-product-lock/01_PRODUCT_LOCK_4A_PLANO_FAMILIA_COMPRA_E_ENTITLEMENT.md`](fase4-product-lock/01_PRODUCT_LOCK_4A_PLANO_FAMILIA_COMPRA_E_ENTITLEMENT.md).
> Estas doze decisões **prevalecem** sobre qualquer redação anterior conflitante.
>
> **Regra de leitura obrigatória.** Uma decisão resolvida **não** corrige risco técnico. Cada item
> abaixo distingue **decisão resolvida** · **implementação pendente** · **validação futura**.
> Nenhum código foi alterado nesta fase; nenhum produto foi criado nas lojas; o RevenueCat **não**
> foi configurado; nenhuma chave foi inserida; nenhum *build* foi gerado.

### `D-4A-CRIAR-LIVRE-SEM-SALVAR` — Criar Livre no plano grátis: zero salvamentos

- **Decisão.** No **Criar Livre**, a criança do plano grátis **pode desenhar**, mas o aplicativo
  **não oferece persistência, galeria nem salvamento**. Confirma `E1-PLANO-FREE`, `E1-ARTES-SALVAR`
  e `ATELIER_FREE_SAVE_LIMIT = 0`, todos **integralmente vigentes**.
- **Distinção que NÃO pode ser apagada.** Esta decisão **não se aplica ao Colorir com o Beni**. O
  **Colorir narrativo salva** e permite **revisitar a obra real da criança** em **todas as histórias
  às quais ela tenha acesso, inclusive no plano grátis** — vale
  [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos)
  e a distinção coleção × autoria de
  [`D-C60-NOMEACAO-OBRAS`](#d-c60-nomeacao-obras--colorir-com-o-beni-é-coleção-criar-livre-é-autoria).
  **O escopo desta decisão é o Criar Livre e não o amplia.**
- **Estado.** Decisão **resolvida**. **Implementação pendente:** os textos de
  `ParentAreaScreen.js:840` ("3 artes salvas") e `BrincarScreen.js:306` ("guarde suas criações")
  continuam prometendo o que o app não faz, e a Galeria ainda calcula `Math.min(n/0, 1)`.
- **Rastreabilidade.** `P-63`, `P-64`, `P-65` — que saem de `DECISÃO DE PRODUTO PENDENTE` para
  `ABERTO`, **não** para `CORRIGIDO`.

### `D-4A-CACHE-EXPIRADO` — Cache de entitlement expirado sem rede: opção A

- **Decisão.** Esgotada a validade do cache **sem rede**, o plano efetivo é **grátis** até a próxima
  validação real. **Não existe tolerância adicional depois da expiração.**
- **Nada é apagado.** Progresso, pinturas, criações e **conteúdo premium já baixado** permanecem no
  disco. **A existência física de asset ou pack nunca concede autorização** — reafirma a decisão não
  reabrível registrada na matriz canônica §19.
- **Sem interrupção destrutiva.** Uma atividade iniciada **enquanto o entitlement ainda era válido**
  não é interrompida no meio; a restrição vale na **próxima entrada protegida ou retomada
  controlada**, conforme contrato futuro de implementação.
- **Estado.** Decisão **resolvida**. **Validação futura:** o caminho *fail-closed* offline com cache
  expirado **nunca foi executado fisicamente** e continua exigindo aparelho.
- **Rastreabilidade.** `P-129`, `P-24`, `P-93`.

### `D-4A-JANELA-OFFLINE` — Janela offline congelada em 7 dias

- **Decisão.** O cache de entitlement é válido por **7 dias** contados da **última validação real
  bem-sucedida**. Corresponde ao `OFFLINE_MAX_WINDOW_MS` já presente em
  `src/services/entitlementPolicy.js`.
- **Congelamento.** A **Fase 18 valida tecnicamente** a regra e **não reabre a duração como decisão
  de produto**. Encerra a pendência "definição definitiva da duração da verificação offline" que a
  `v5` §Fase 18 mantinha aberta.
- **Estado.** Decisão **resolvida e congelada**. **Validação futura:** Fase 18, revalidação Fase 21.
- **Rastreabilidade.** `P-129`, `P-140`.

### `D-4A-NOME-PUBLICO` — Nome público único: **Plano Família**

- **Decisão.** O plano pago tem **um único nome público: Plano Família**. **Não** usar "Premium",
  "Clube", "Assinatura Beni" nem nome de concorrente **em nenhuma interface**.
- **Identificadores técnicos internos** podem manter nomes próprios (ex.: o *entitlement* legado
  `premium` em `entitlementSource.js`), mas **toda comunicação ao responsável diz Plano Família**.
- **Estado.** Decisão **resolvida**. **Implementação pendente:** o chip de plano do Brincar corta o
  texto em 100% dos estados.
- **Rastreabilidade.** `P-59`, `P-60`.

### `D-4A-DISPOSITIVOS-E-PERFIL` — Dispositivos e perfil familiar na v1

1. **Sem limite próprio de dispositivos** definido pelo app.
2. A **restauração segue a conta da App Store / Google Play** usada na compra.
3. **Nenhuma promessa de sincronização de progresso** entre aparelhos.
4. Cada instalação mantém **dados locais próprios**: perfil, progresso, pinturas e downloads.
5. **Sem múltiplos perfis infantis sincronizados** na v1.
6. Restaurar em outro aparelho **restaura o acesso, não os dados locais**.
7. **Conta familiar e sincronização ficam posteriores ao lançamento.**

- **Estado.** Decisão **resolvida**. **Implementação pendente:** Fase 18.
- **Rastreabilidade.** **`P-24`** (principal) e **`P-140`** (estado local persistido). **`P-57` NÃO
  é código de dispositivos** — é a rodada fabricada na retomada do Monte a Cena, e a associação
  registrada no artefato preliminar foi **removida por determinação do fundador**.

### `D-4A-PRODUTOS-E-PERIODICIDADE` — Produtos, periodicidade e teste grátis

| Item | Decisão |
|---|---|
| Periodicidades | **Mensal** e **anual**, e somente essas duas |
| Trimestral | ❌ **Não existe** |
| Vitalício | ❌ **Não existe** |
| Economia do anual | **≈ 25%** sobre doze mensalidades |
| Teste grátis | **7 dias, somente no anual** |
| Teste grátis no mensal | ❌ **Nenhum**, nem recorrente |
| Valores nominais em reais | **Não congelados nesta fase** — classificados como **parâmetro comercial pré-implementação**, e **não** como razão para manter aberto o contrato técnico e de produto da Fase 4A |

- **Correções documentais autorizadas e executadas.** Duas fontes diziam "trimestral", e cada uma
  recebeu o tratamento compatível com o seu estatuto:
  - `docs/launch/MATRIZ_DE_ACESSO.md` — documento **normativo vigente**. Dizia "mensal,
    **trimestral**, anual"; **texto corrigido**.
  - `docs/PLANO_OFICIAL_BENI_LANCAMENTO.md` — documento **histórico e substituído**, sem autoridade
    normativa. Listava "Mensal / **Trimestral** / Anual" e mandava "configurar produtos mensal,
    **trimestral** e anual". **O texto histórico foi preservado como registro** e recebeu
    **notas de superação** apontando para esta decisão — **não** foi reescrito.

  Confirma `E1-MONETIZACAO-V1` e `PL01A-15`.
- **Estado.** Decisão **resolvida**. **Implementação pendente:** Fase 18.
- **Rastreabilidade.** `P-24`.

### `D-4A-IDENTIFICADORES` — Identificadores comerciais e responsabilidades

| Item | Valor |
|---|---|
| *Entitlement* RevenueCat | `familia` |
| *Offering* principal | `familia` |
| Produto mensal | `com.valentedev.pequenostracosdefe.family.monthly` |
| Produto anual | `com.valentedev.pequenostracosdefe.family.annual` |
| Variáveis de chave (**apenas os nomes**) | `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` · `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` |

- **Imutabilidade.** Depois de publicados, esses identificadores **não mudam**, salvo migração
  formal futura.
- **Responsabilidades.** **Amanda** valida preço, oferta e textos comerciais. **Eduardo** cria os
  produtos nas lojas e no RevenueCat e executa a integração técnica.
- **O que NÃO foi feito nesta fase.** Nenhum produto criado, RevenueCat **não** configurado,
  **nenhuma chave inserida**, **nenhum arquivo de configuração alterado** — `eas.json` continua sem
  qualquer variável `EXPO_PUBLIC_REVENUECAT_*` em seus perfis.
- **Estado.** Decisão **resolvida**. **Implementação pendente:** Fase 18.
- **Rastreabilidade.** `P-93`, `P-24`.

### `D-4A-RESTAURACAO-E-COMUNICACAO` — Restauração e textos aprovados

- **Onde "Restaurar compra" aparece.** Na **Área dos Pais** *e* no **paywall exibido depois do gate
  parental**. **Nunca** como oferta direta na superfície infantil.
- **Textos aprovados ao responsável** (redação oficial):

| Situação | Texto |
|---|---|
| Sucesso | "Plano Família restaurado neste aparelho." |
| Nenhuma compra encontrada | "Não encontramos uma compra ativa nesta conta da loja." |
| Erro temporário | "Não foi possível verificar sua compra agora. Confira a internet e tente novamente." |
| Assinatura expirada | "Sua assinatura não está ativa no momento. Seus dados e criações continuam preservados." |

- **Na superfície infantil, proibido:** preço, desconto, teste grátis, urgência, contagem
  regressiva e "Assine agora". **Permitido apenas** orientação neutra equivalente a *"Peça ajuda a
  um adulto para continuar"*. **Toda oferta ou explicação comercial fica depois do gate parental.**
- **Estado.** Decisão **resolvida**. **Implementação pendente:** o `handleRestorePurchase` de
  `ParentAreaScreen.js:507` **não está montado em JSX** — é código sem superfície; e
  `BrincarScreen.js:324` ainda coloca oferta comercial dentro de `accessibilityLabel`.
- **Rastreabilidade.** `P-24`, `P-66`, `P-28`.

### `D-4A-PLATAFORMAS` — Plataformas de cobrança

- **No escopo:** **iOS e Android**. Ordem **operacional** de validação: **iOS, depois Android**, com
  **o mesmo contrato**. O **lançamento oficial depende dos portões das duas**.
- **Arquitetura:** **RevenueCat** como orquestrador; **App Store** no iOS; **Google Play Billing**
  no Android.
- **Stripe NÃO faz parte do lançamento.** Nenhuma decisão jamais o aprovou. **Correções
  documentais autorizadas e executadas:** o título "Fase 18 — RevenueCat, **Stripe** e Plano
  Família" foi corrigido para **"Fase 18 — RevenueCat e Plano Família"** na `v5` — o roadmap
  vigente, que é a fonte do nome da fase — e no quadro de fases da matriz canônica. A citação
  desse título em `docs/C60_VALIDACAO_FISICA.md` **não foi tocada**: aquele arquivo é **registro
  de validação física** e a citação vive dentro do texto de uma decisão do fundador de
  **2026-08-04**; reescrevê-la alteraria um registro histórico sem necessidade, já que a
  autoridade sobre o nome da fase é da `v5`. Confirma o registro de restrição de SDKs
  (Sentry + RevenueCat + analytics anônimo).
- **Estado.** Decisão **resolvida**. **Implementação pendente:** Fase 18. **Validação futura:**
  Fases 18 e 21, nas duas plataformas.
- **Rastreabilidade.** `P-24`, `P-93`, `P-129`.

### `D-4A-HOME-GRATIS-ESGOTADA` — Home do plano grátis depois de esgotar o conteúdo livre

- **Decisão.** A Home **não fica vazia** e **não vira paywall**. A criança continua vendo:
  histórias gratuitas para **revisitar**, **obras do Colorir com o Beni**, **progresso**,
  **conquistas** e **atividades gratuitas**.
- Conteúdo protegido **pode** aparecer como **prévia carinhosa**; ao toque, o app produz **apenas**
  orientação para **chamar um adulto**. **Oferta comercial só depois do gate parental.**
- **Estado.** Decisão **resolvida**. **Implementação pendente:** hoje a Home recomenda
  `david_goliath`, que é premium, **sem filtro de acesso**.
- **Rastreabilidade.** `P-05`, `P-01`, `P-26`.

### `D-4A-PAYLOAD-PREMIUM` — O que o binário de produção pode conter

- **Decisão.** O *build* de produção contém **somente as 2 histórias gratuitas locais**. As **18
  premium** são entregues por **packs remotos**.
- **Podem permanecer no binário:** **metadados mínimos de vitrine**, **assets genéricos
  compartilhados** e **fixtures internas comprovadamente excluídas ou inalcançáveis em produção**.
- **Princípio inegociável.** **A existência física de asset ou pack nunca concede autorização.**
- **Estado.** Decisão **resolvida**. **Implementação pendente:** as 18 premium continuam com
  `require()` estático — **378 arquivos, 84.183.401 bytes (80,3 MB)** — e a remoção depende da UX de
  **baixar antes de ver**, sob pena de história premium sem imagem.
- **Rastreabilidade.** `P-136`, `P-135`, `P-130`, `P-116`.

### `D-4A-MIGRACAO-ENTITLEMENT` — Migração de entitlement e ausência de grandfathering

1. **Sem grandfathering** de Modo Criador, de flags de desenvolvimento ou de estados premium locais
   fabricados.
2. **Não existem assinantes comerciais** que exijam migração hoje.
3. *Entitlement* **inválido, antigo, corrompido ou sem origem comprovada** → **plano grátis** até
   validação real.
4. A **única fonte comercial real** é o **RevenueCat**.
5. **Progresso, pinturas e criações locais são preservados** independentemente do estado comercial.

- **Código criado por determinação do fundador.** A ausência de caminho de migração **não podia
  permanecer como observação solta**. A busca foi refeita nos **22 campos dos 139 códigos**
  anteriores; `P-126` trata do *schema* do **manifesto de pack** e `P-114` da **localização** de
  chaves — nenhum cobre o mesmo fato, superfície, consequência e correção. **`P-140` foi criado**,
  **sem renumerar nenhum código anterior**.
- **Estado.** Decisão **resolvida**. **Implementação pendente:** a política declarada de
  versionamento do *snapshot* e o teste que a comprove. **Risco técnico NÃO corrigido.**
- **Rastreabilidade.** **`P-140`** (novo), `P-129`, `P-24`, `P-93`.

### PL4A — O que continua **não** decidido e **não** corrigido

- **Preço nominal em reais** — parâmetro comercial pré-implementação, sob responsabilidade de
  Amanda. **Não bloqueia** o contrato técnico da Fase 4A.
- **`P-55`** (fallback premium do Modo Criador) e **`P-56`** (rodada fabricada na retomada)
  permanecem **riscos técnicos abertos e não corrigidos**. Nenhuma decisão desta fase os alcança e
  **nenhum campo deles foi tocado**.
- **Nenhum risco passou a `CORRIGIDO` nesta fase.** Nenhuma severidade foi rebaixada. Nenhuma
  classificação de lançamento foi afrouxada.

## PL4B — Product Lock da Fase 4B · Acesso grátis, conteúdo do Plano Família, histórias e superfícies infantis (2026-08-05)

> **Registro formal das respostas do fundador** ao artefato preliminar
> [`docs/fase4-product-lock/02_PRODUCT_LOCK_4B_ACESSO_CONTEUDO_HISTORIAS_E_SUPERFICIES.md`](fase4-product-lock/02_PRODUCT_LOCK_4B_ACESSO_CONTEUDO_HISTORIAS_E_SUPERFICIES.md).
> Estas decisões **prevalecem** sobre qualquer redação anterior conflitante e **preservam
> integralmente** as decisões da Fase 4A (§`PL4A`), que **nenhuma delas revoga, afrouxa ou reabre**.
>
> **Regra de leitura obrigatória.** Uma decisão resolvida **não** corrige risco técnico. Cada item
> abaixo distingue **decisão resolvida** · **implementação pendente** · **validação futura**.
> Nenhum código, *asset*, *pack* ou manifesto foi alterado nesta fase; nenhuma imagem foi produzida
> ou modificada; nenhum *build* foi gerado; nenhuma validação física foi executada.

### `D-4B-CONTEUDO-GRATUITO-E-PREMIUM` — duas gratuitas completas, dezoito integralmente premium

- **Decisão.** **A Criação** e **Noé** são as **duas histórias gratuitas completas** — cenas, áudio,
  quiz, reflexão, Colorir com o Beni, progresso e recompensas, tudo incluído. As **outras dezoito**
  histórias, **inclusive Davi e Golias**, permanecem **integralmente protegidas pelo Plano Família**.
- **Sem meio-termo.** Não existe história "parcialmente gratuita", nem conteúdo premium liberado por
  tempo, por marco, por progresso ou por presença de arquivo no aparelho.
- **Estado.** Decisão **resolvida**. Corresponde ao comportamento já implementado
  (`planConfig.js` `FREE_STORY_IDS = ['creation','noah']`, gate binário por história em
  `accessControl.js` e `contentAccessService.js`), com **dois guardrails executáveis** no
  `npm run smoke` que reprovam se `david_goliath` deixar de ser tratada como premium.
- **Rastreabilidade.** `P-05`, `P-26`, `P-136`.

### `D-4B-SEM-DEGUSTACAO` — não existe degustação de história premium (opção A)

- **Decisão.** **Não haverá degustação gratuita** por cena, atividade ou marco dentro de histórias
  premium. **Não liberar** cena 03, primeiro Colorir, quiz, reflexão, áudio ou **qualquer progresso
  parcial** em Davi e Golias ou em qualquer outra história premium.
- **A antiga hipótese de degustação de Davi e Golias fica REJEITADA para o lançamento.**
- **Não haverá mecanismo de autorização por cena.** O gate permanece **binário por história**.
- **Pack presente no aparelho nunca é autorização** — reafirma `D-4A-CACHE-EXPIRADO` e a decisão não
  reabrível da matriz canônica §19.
- **Estado.** Decisão **resolvida**, e é o **estado já vigente**: a auditoria da Fase 4B não encontrou
  **nenhuma** ocorrência de mecanismo de degustação no código nem em todo o histórico do repositório.
  **Nada a implementar** — o que existe é o **dever de não introduzir** o mecanismo.
- **Rastreabilidade.** `P-05`, `P-26`.

### `D-4B-PREVIA-EDITORIAL` — contrato da prévia infantil sobre conteúdo bloqueado

- **Decisão.** **Home e Mapa aplicam a mesma regra de acesso**, ainda que possam usar **composições
  visuais diferentes**. Sobre uma história bloqueada, a criança pode receber **somente**:
  1. **Capa** · 2. **Título** · 3. **Sinopse curta** · 4. **Região ou posição no Mapa** ·
  5. **Selo neutro do Plano Família** · 6. **Estado visual protegido**.
- **NÃO pode conter, em nenhuma hipótese:** 1. cena narrativa integral · 2. áudio narrado ·
  3. quiz · 4. reflexão · 5. Colorir · 6. recompensa · 7. progresso fabricado · 8. **preço** ·
  9. **desconto** · 10. **teste grátis** · 11. **urgência** · 12. **botão "Assine agora"**.
- **Ao tocar**, a criança recebe **orientação neutra para pedir ajuda a um adulto**.
- **O gate parental ocorre ANTES** de qualquer paywall, preço, oferta ou informação comercial.
- **A proibição comercial vale também para `accessibilityLabel`, leitor de tela, áudio e qualquer
  mensagem falada.** Uma oferta que a criança **ouve** é uma oferta feita à criança.
- **Estado.** Decisão **resolvida**. **Implementação pendente:** o `accessibilityLabel` que hoje
  verbaliza oferta comercial diretamente à criança (`P-66`) **continua no código** e é corrigido na
  **Fase 12A**; a aplicação do contrato em Home e Mapa é da **Fase 11**.
- **Rastreabilidade.** `P-05`, `P-26`, `P-66`.

### `D-4B-FILTRO-RECOMENDACAO` — Cultinho e Meu Momento recomendam apenas conteúdo autorizado

- **Decisão.** **Filtro estrito por conteúdo autorizado.**
  1. No **plano grátis**, só podem recomendar **A Criação**, **Noé** e demais atividades gratuitas
     disponíveis.
  2. No **Plano Família**, podem recomendar **todas as histórias autorizadas**.
  3. **Não devem recomendar conteúdo protegido** para depois apresentar bloqueio ou paywall.
  4. Depois da **perda do entitlement**, o conteúdo protegido **sai das recomendações** na próxima
     atualização controlada.
  5. Com **cache expirado e sem rede**, aplica-se o **plano grátis** (coerente com
     `D-4A-CACHE-EXPIRADO`).
  6. **Não havendo conteúdo novo acessível**, recomendar **revisitação de conteúdo gratuito**.
  7. **Nenhuma recomendação pode resultar em toque sem resposta.**
- **Estado.** Decisão **resolvida**. **Implementação pendente e descompasso registrado:** a **Home
  recomenda `david_goliath` sem consultar autorização** — o toque leva a bloqueio. Correção na
  **Fase 11**.
- **Rastreabilidade.** `P-05`, `P-54`.

### `D-4B-COLORIR-60-ESCALA` — Colorir com o Beni padronizado nas vinte histórias

- **Decisão.** O **lançamento** entrega o **Colorir com o Beni padronizado nas vinte histórias**, com
  **três atividades narrativas por história**, totalizando **sessenta atividades**.
  1. **A Criação** permanece como **piloto canônico**.
  2. **Noé** é o **primeiro alvo de escala**, por ser a segunda história gratuita.
  3. Cada história terá **três atividades vinculadas a marcos narrativos**.
  4. As atividades respeitam **os mesmos contratos** técnicos, visuais, de persistência, conclusão e
     revisitação aprovados no piloto.
  5. **Assets legados não são aceitos automaticamente como arte final.** Qualquer arte antiga
     candidata a reaproveitamento passa por **perícia técnica e aprovação visual**.
  6. **Nenhuma história é considerada pronta para lançamento** sem o conjunto aprovado de atividades
     de Colorir previsto para ela.
  7. A escala é implementada na **Fase 8A** e nas fases de produção de conteúdo correspondentes.
- **Coerência.** Confirma a regra 15 de
  [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos)
  ("três atividades em cada uma das vinte histórias — 60 *slots*"), que deixa de ser capacidade
  prevista e passa a ser **escopo obrigatório de lançamento**.
- **Estado.** Decisão **resolvida**. **Implementação pendente:** hoje existe **1 história de 20** com
  o modelo novo (**3 de 60** atividades). **Nenhuma imagem foi produzida ou alterada nesta fase.**
- **Rastreabilidade.** `P-18`, `P-36`, `P-37`, `P-50`, `P-130`.

### `D-4B-SALVAMENTO-DUAS-EXPERIENCIAS` — contrato de salvamento, por experiência

| Experiência | Plano grátis | Plano Família |
|---|---|---|
| **Criar Livre** (autoria) | **Desenha, mas NÃO salva.** Sem galeria. | **Salva** e acessa a galeria. |
| **Colorir com o Beni** (coleção narrativa) | **Salva gratuitamente uma obra real por atividade**, em **qualquer história à qual a criança tenha acesso**. | **Salva** em todas as histórias autorizadas. |

1. Nas **histórias gratuitas**, o Colorir com o Beni **funciona e salva integralmente offline**.
2. Nas **histórias premium**, **exige autorização válida** para **iniciar ou reabrir**.
3. Depois da **perda do entitlement**, a **pintura premium permanece preservada e não pode ser
   apagada**.
4. Ela **volta a ficar acessível e editável quando a autorização retornar**.
5. **A pintura, o asset ou o pack no disco nunca concede autorização** sobre a história premium.

- **Correção documental obrigatória.** Toda redação genérica do tipo "**Salvar arte: zero no grátis**"
  refere-se **exclusivamente ao `Criar Livre`**. O **Colorir narrativo salva no plano grátis** dentro
  das histórias acessíveis. Corrigido em
  [`docs/launch/MATRIZ_DE_ACESSO.md`](launch/MATRIZ_DE_ACESSO.md) e anotado em
  [`docs/launch/DECISOES_E_CONFLITOS.md`](launch/DECISOES_E_CONFLITOS.md).
- **Estado.** Decisão **resolvida** e **já implementada e validada fisicamente** para o piloto
  (Spec 019). **Implementação pendente:** os textos de `ParentAreaScreen.js:840` e
  `BrincarScreen.js:306` (Fase 12A) e o comportamento premium/Família (Fases 18 e 21).
- **Rastreabilidade.** `P-63`, `P-64`, `P-65`, `P-129`, `P-130`.

### `D-4B-NOMES-OFICIAIS` — dois nomes, nem um a mais

- **Decisão.** **Não existirá uma terceira experiência chamada "Criar com Beni".** Os **nomes
  oficiais** são **`Criar Livre`** e **`Colorir com o Beni`**. **"Criar Juntos" é uma chamada
  contextual para o `Criar Livre`**, não uma funcionalidade independente.
- **Encerra** [`D-CRIAR-COM-BENI-STATUS`](#d-criar-com-beni-status--status-de-criar-com-beni-no-v1--encerrada-2026-08-05), que sai da lista de pendências.
- **Estado.** Decisão **resolvida**. **Implementação pendente:** remover ou redirecionar o atalho
  legado "Criar com Beni" ainda presente na Home e qualquer card/fala/texto/guia com esse nome.
- **Rastreabilidade.** `P-05`.

### `D-4B-PAYLOAD-PREMIUM-NO-BINARIO` — o alcance de `P-136` é todo o conteúdo premium empacotado

- **Decisão.** A evidência de **`P-136`** passa a considerar **todo conteúdo premium incluído no
  pacote ou *bundle***, **incluindo imagens, áudios, textos narrativos, quizzes e outros dados** — e
  não apenas a mídia que passa por `require()`.
- **Regra anti-inflação de códigos.** **Não se cria código `P` novo** para textos narrativos e
  quizzes **sem demonstrar** que `P-136` **não** cobre o mesmo fato, a mesma superfície e a mesma
  correção. A demonstração foi feita e **concluiu que `P-136` cobre**: mesmo fato (conteúdo premium
  dentro do binário), mesma superfície (empacotamento do app) e mesma correção (extrair para *pack*
  remoto). **Nenhum código novo foi criado nesta fase.**
- **Estado.** Decisão **resolvida** quanto ao **alcance do risco**. **Risco técnico NÃO corrigido:**
  o texto narrado integral das vinte histórias e os dezoito quizzes premium **continuam no binário**.
  Correção nas fases de empacotamento remoto.
- **Rastreabilidade.** `P-136`.

### PL4B — O que continua **não** decidido e **não** corrigido

- **Rodadas diárias: "por criança" × "por dispositivo/jogo"** — conflito **preservado e
  deliberadamente não resolvido** nesta fase; pertence ao **bloco decisório do Brincar**. Nenhum dos
  textos conflitantes foi alterado; ambos foram **anotados**.
- **`P-55`** e **`P-56`** permanecem **abertos e não corrigidos**; nenhuma decisão desta fase os
  alcança e **nenhum campo deles foi tocado**.
- **Nenhum risco passou a `CORRIGIDO` nesta fase.** Nenhuma severidade foi rebaixada. Nenhuma
  classificação de lançamento foi afrouxada. **Nenhum código `P` novo foi criado.**
- **A escala de 60 atividades é decisão resolvida com implementação inteiramente futura** — nada
  nela foi implementado, e **nenhuma imagem foi produzida ou alterada**.

## PL4C — Product Lock Fase 4C · Jornada, progressão, conclusão e desbloqueios

> **Data:** 2026-08-05. **Registro formal das respostas do fundador** ao artefato preliminar
> [`docs/fase4-product-lock/03_PRODUCT_LOCK_4C_JORNADA_PROGRESSAO_CONCLUSAO_E_DESBLOQUEIOS.md`](fase4-product-lock/03_PRODUCT_LOCK_4C_JORNADA_PROGRESSAO_CONCLUSAO_E_DESBLOQUEIOS.md).
> Bloco **exclusivamente documental**: nenhum código, *asset*, *pack*, manifesto ou configuração
> foi alterado; nenhum *build* foi gerado; nenhuma validação física foi executada.
> As decisões das Fases **4A** e **4B** permanecem **integralmente preservadas**.

**Regra de leitura (três estados, como em PL4A e PL4B):** cada decisão abaixo distingue
**decisão resolvida** · **implementação pendente** · **validação futura**. Decisão de produto
tomada **não** corrige risco técnico e **não** autoriza escrever código.

### D-4C-ARBITRO — O árbitro canônico da jornada é a autoridade única
- **Status:** ✅ **APROVADA** · **Ratifica** o contrato `A0.10` (`docs/DECISAO_CONTRATO_JORNADA.md`, `src/services/storyJourneyService.js`), **com a fórmula de conclusão corrigida** por `D-4C-CONCLUSAO`.
- **Nenhuma superfície pode recalcular sua própria versão da conclusão.** Home e Mapa são atualizados pela **mesma leitura persistida**. A hierarquia mantém **`journeyLocked` antes de `premiumLocked`**.
- **Dez superfícies consumidoras obrigatórias** e **dez estados canônicos** ficam aprovados conforme o artefato §4 e §5.
- **Implementação pendente** (Fase 11): hoje existem **cinco produtores concorrentes** de "próxima história" e **dezenove enunciados** distintos de "história concluída". Rastreio: `P-01`, `P-03`, `P-04`, `P-05`, `P-17`, `P-19`, `P-22`.

### D-4C-CONCLUSAO — Fórmula canônica de conclusão de história
- **Status:** ✅ **APROVADA** · **Congela** o contrato aberto em `D-CONCLUSAO-GLOBAL-SISTEMA`.
- **Fórmula:** (1) **todas as cenas declaradas** da história · (2) **quiz** concluído · (3) **reflexão** concluída · (4) **pelo menos uma atividade do Colorir com o Beni**, quando o Colorir estiver **disponível** para aquela história · (5) **persistência confirmada**.
- **O Livrinho NÃO é requisito** de conclusão nem de desbloqueio. Fica formalmente registrada como **superada** a parcela do bloco **A0.10** que incluía `bookOpened` em `journeyComplete`.
- **Nunca uma quantidade fixa de cenas.** O literal "10 cenas" está **substituído** por "todas as cenas declaradas" em todo contrato canônico. Anotação aplicada em `D-CONCLUSAO-TOTAL-B`.
- **Implementação pendente** (Fase 11) · **validação física futura**. Rastreio: `P-01`, `P-03`, `P-11` (documental, **corrigido**), `P-08`, `P-50`.

### D-4C-LIVRINHO — Dois estados do Livrinho, fora da fórmula obrigatória
- **Status:** ✅ **APROVADA.**
- **Abrir o Livrinho não equivale a concluí-lo.** Dois estados distintos: **iniciado/aberto** e **concluído** (ao alcançar a última página).
- A **conclusão** do Livrinho pode conceder **recompensa própria uma única vez**; **não** compõe a conclusão obrigatória da história.
- **Registros antigos de `@ptf_storybook_opened_{id}` não são apagados** nem causam regressão de progresso.
- O Livrinho permanece **experiência própria, revisável e recompensável**.
- **Implementação pendente** (Fase 10). Rastreio: `P-38`, `P-49`.

### D-4C-COLORIR-CONDICIONAL — Exigência condicional permanente (emenda `P3J` ratificada)
- **Status:** ✅ **APROVADA** · **Ratifica formalmente a emenda `P3J`.**
- Quando **houver** atividades disponíveis para a história, concluir **pelo menos uma das três** é **requisito de conclusão**. Quando **não houver**, a ausência **nunca bloqueia** a jornada.
- **Três de três** continua sendo **conclusão da coleção**, **nunca** requisito de desbloqueio.
- Com a escala completa das **60 atividades** (Fase 4B), o resultado natural é **uma atividade obrigatória em cada uma das 20 histórias**.
- **Implementação pendente** (Fase 9 e fases de produção) · **risco técnico NÃO corrigido**. Rastreio: `P-08`, `P-14`, `P-18`, `P-36`, `P-50`, `P-51`.

### D-4C-RETROATIVIDADE — História concluída antes da escala permanece concluída
- **Status:** ✅ **APROVADA.**
- Conteúdo novo entra como **conteúdo a explorar**, **nunca como pendência retroativa**: **não** retranca a próxima história, **não** retira recompensa e **não** repete automaticamente a grande celebração.
- **Princípio de reconciliação:** sempre **favorável à criança** · **nada é apagado** · **conclusão registrada nunca é revogada** · **regra nova não retroage para retrancar** · **dado inconsistente usa o maior estado defensável** · reconciliação é **silenciosa** e não repete recompensa nem celebração.
- **Implementação pendente** (Fase 7) · **validação física ainda exigida**. Rastreio: `P-21`, `P-55`.

### D-4C-RETOMADA-HISTORIA — A história retoma por cena
- **Status:** ✅ **APROVADA.**
- O lançamento **não** persiste posição exata de **áudio, rolagem ou palavra**. Na **revisitação voluntária**, o fluxo futuro poderá permitir **começar novamente** ou **selecionar uma cena**.
- **Sem presunção de contiguidade** de progresso para decidir onde a criança entra.
- **Implementação pendente** (Fase 11) · **validação física ainda exigida**. Rastreio: `P-06`.

### D-4C-CELEBRACAO-SOBRIA — Grande celebração só na primeira conclusão
- **Status:** ✅ **APROVADA** · **precisa** o item 9 de `D-CONCLUSAO-GLOBAL-SISTEMA`.
- **Modo sóbrio** para revisitação, reabertura da conclusão, edição de pintura e atualização de atividade já concluída: (1) sem confete completo · (2) sem animação principal de conquista · (3) **sem nova recompensa** · (4) com confirmação afetiva e discreta · (5) **preservando a primeira conclusão**.
- **Implementação pendente** (Fase 11). Rastreio: `P-15`, `P-82`.

### D-4C-DESTINOS — Ordem canônica dos destinos após a conclusão
- **Status:** ✅ **APROVADA** · **congela** `D-ENCERRAMENTO-GLOBAL-ATIVIDADES`.
- **Ordem:** (1) **próxima aventura**, quando existir e estiver autorizada · (2) **Mapa de Aventuras** · (3) **revisitar esta história** · (4) **ir ao Brincar** · (5) **ir ao Início**.
- **Baú, Estrelinhas, obras e demais recompensas são elementos secundários**, nunca ações concorrentes da ação principal.
- **Sem próxima história disponível** — e também **em modo de revisitação** — o **Mapa** assume a ação principal.
- **Treze *slots* e cinco modos** aprovados; o padrão único vale para os **quatro jogos**, **preservando identidade visual** mas usando os **mesmos *slots*, ações e rótulos**.
- **Implementação pendente** (Fase 11). Rastreio: `P-15`, `P-68`, `P-82`, `P-83`.

### D-4C-ESTRELINHAS — Estrelinhas do Brincar são reais, visíveis e canônicas
- **Status:** ✅ **APROVADA** · **resolve o conflito** entre o acumulador invisível e o contador visível.
- (1) **Uma estrelinha por partida válida concluída** · (2) **teto diário compartilhado de duas** no Brincar · (3) **Monte a Cena também concede** dentro da mesma regra · (4) a recompensa só é anunciada **depois da persistência confirmada** · (5) depois do teto, **nenhuma tela promete nova estrelinha** · (6) acumulador e contador **reconciliados em uma fonte canônica** · (7) **nenhuma estrela perdida na migração**.
- **Estrelinhas nunca são gastas** e **não autorizam conteúdo premium**. São **marcos de progresso** e podem liberar **cosméticos sem consumo**. **Avatares adicionais continuam exclusivos do Plano Família**; dentro do Plano Família, o marco de estrelinhas **pode** liberar o avatar.
- **Implementação pendente** (Fase 11) · **risco técnico NÃO corrigido**. Rastreio: `P-19`, `P-39`, `P-69`, `P-71`.

### D-4C-CONQUISTAS-JOGOS — Os quatro jogos têm conquistas no lançamento
- **Status:** ✅ **APROVADA.**
- Cobertura aprovada agora para **Pares do Beni**, **Palavrinhas do Beni**, **Cadê a Ovelhinha** e **Monte a Cena**.
- As conquistas devem ser **idempotentes**, **celebradas no próprio jogo**, **visíveis na aba Estrelinhas**, **não autorizar conteúdo premium**, **não gerar recompensa infinita** e ter **critérios próprios de cada jogo**.
- **Quantidade e textos exatos são produzidos na Fase 11**; a **cobertura** fica aprovada agora.
- **Implementação pendente** (Fase 11). Rastreio: `P-70`, `P-69`.

### D-4C-FAIL-CLOSED-ESCRITA — Falha de gravação é visível e ***fail-closed***
- **Status:** ✅ **APROVADA** · **reafirma** o *fail-closed* já aprovado na Fase 4A.
- (1) **"Guardando…"** durante a escrita · (2) **não declarar conclusão** antes da confirmação · (3) **não conceder recompensa** antes da confirmação · (4) em falha, informar de forma **afetiva e objetiva** · (5) oferecer **nova tentativa** · (6) **preservar o trabalho em memória** quando possível · (7) **nunca** conceder *premium*, rodada, recompensa ou desbloqueio **como alternativa** · (8) **nunca** deixar CTA **habilitado e inerte**.
- **Copy infantil de referência:** *"Não consegui guardar agora. Vamos tentar mais uma vez?"*
- **Implementação pendente** (Fases 9, 12A e 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-13`, `P-23`, `P-46`, `P-56`, `P-58`, `P-71`.

### D-4C-GALERIA-CRIAR-LIVRE — Galeria do Criar Livre sem "0 de 0" no plano grátis
- **Status:** ✅ **APROVADA** · **não reabre** a regra de **zero salvamentos** no Criar Livre grátis (Fase 4B).
- **Plano grátis:** (1) remover contador · (2) remover barra · (3) **não mostrar "0 de 0"** · (4) **estado vazio afetivo** · (5) explicação comercial **somente depois do gate parental**.
- **Plano Família:** (1) mostrar **"N artes salvas"** · (2) **sem denominador fixo** · (3) **sem barra de limite** quando o salvamento for ilimitado.
- **Implementação pendente** (Fase 12A) · **risco técnico NÃO corrigido** (divisão por zero). Rastreio: `P-63`, `P-68`.

### D-4C-ORDEM-CRONOLOGICA — Ordem cronológica fora do produto de lançamento
- **Status:** ✅ **APROVADA.**
- A **única ordem oficial da jornada é a ordem do Mapa de Aventuras**. `chronologicalOrder` e `getStoriesInChronologicalOrder()` **não orientam nenhuma superfície** no lançamento.
- Uma futura **trilha cronológica** poderá ser avaliada **depois** do lançamento.
- **Destino do campo e da função pendente** (Fase 16). Rastreio: `P-10`, `P-118`, `P-119`.

### D-4C-RETOMADA-JOGOS — Contrato de retomada diferente por duração
- **Status:** ✅ **APROVADA.**
- **Pares, Palavrinhas e Cadê a Ovelhinha:** (1) **não** precisam persistir partida incompleta no lançamento · (2) a **rodada só é consumida quando houver resultado terminal válido** · (3) **sair antes do resultado não consome rodada** · (4) vitória, derrota, tempo encerrado ou conclusão válida **consomem uma rodada** · (5) **nenhuma estrelinha sem conclusão válida**.
- **Monte a Cena:** (1) mantém **retomada de sessão** · (2) a rodada é consumida **uma única vez** · (3) retomar a mesma sessão **não** consome nova rodada · (4) repetir **consulta o contador real** · (5) **nunca fabricar rodada restante** · (6) **nunca liberar rodada ilimitada quando o storage falhar**.
- **Implementação pendente** (Fase 12A) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-55`, `P-56`, `P-57`, `P-71`, `P-86`.

### PL4C — Ratificações globais
1. **`A0.10` e o árbitro canônico** como autoridade única da jornada, **com a fórmula de conclusão corrigida** pelas decisões acima.
2. As **dez superfícies** do artefato §4 como **consumidoras obrigatórias**.
3. Os **dez estados canônicos** da história (artefato §5).
4. **`journeyLocked` antes de `premiumLocked`.**
5. **Home e Mapa** atualizados pela **mesma leitura persistida**.
6. Os **treze *slots*** e os **cinco modos**.
7. **Padrão único de encerramento dos quatro jogos**, preservando identidade visual, mas usando os **mesmos *slots*, ações e rótulos**.
8. **Princípio de reconciliação sempre favorável à criança.**
9. **Nada é apagado.**
10. **Conclusão registrada nunca é revogada.**
11. **Regra nova não retroage para retrancar.**
12. **Dado inconsistente usa o maior estado defensável.**
13. **Reconciliação é silenciosa** e não repete recompensa ou celebração.
14. **Nenhuma superfície pode recalcular sua própria versão da conclusão.**

### PL4C — Correções de rastreabilidade aplicadas
1. **`docs/DECISAO_CONTRATO_JORNADA.md:33` corrigido** — a fórmula perdeu `bookOpened`. `P-11` passa a **`CORRIGIDO`** por ser defeito **documental** efetivamente sanado.
2. **Conflito do Livrinho anotado como resolvido** em favor da fórmula **sem** `bookOpened` (anotação em `D-CONCLUSAO-TOTAL-B`).
3. **"10 cenas" corrigido** para **"todas as cenas declaradas"** no contrato normativo; a ocorrência histórica em `D-CONCLUSAO-TOTAL-B` foi **anotada**, não reescrita.
4. **Dois estados do Livrinho registrados** — aberto e concluído.
5. **Conflito estrelinhas × avatares resolvido explicitamente:** estrelas são **marcos cosméticos não consumíveis**; **avatares adicionais exigem Plano Família**.
6. **Nenhum risco técnico foi marcado como corrigido** apenas porque a decisão foi tomada.
7. **Conflito "rodadas por criança × por dispositivo" preservado** para o bloco decisório do Brincar, como em PL4B.
8. **Nenhum código `P` novo foi criado** — a cobertura foi verificada dentro de `P-01` a `P-140` e nenhum fato, consequência e correção realmente distintos foram encontrados.
9. **`P-42` não trata do fluxo de revisão de história concluída** — seu enunciado é "Ramo `ParentArea` do Cantinho do Beni é morto". A citação em contrário encontrada em material de apoio foi **descartada** e registrada como erro.
10. **Precisão de atribuição:** a presunção de contiguidade está em `StoryDetailScreen.js:319` e `:367`, e não na tela do Mapa, como o enunciado original de `P-06` sugeria.

### PL4C — O que continua **não** decidido e **não** corrigido
- **Rodadas diárias: "por criança" × "por dispositivo/jogo"** — conflito **preservado**, como em PL4B; pertence ao **bloco decisório do Brincar**.
  - **📌 ANOTAÇÃO DA FASE 4D (2026-08-05) — ✅ CONFLITO RESOLVIDO.** O escopo foi decidido no Product Lock da Fase 4D: **as rodadas pertencem à criança local**, com **`childId` estável**, e **`avatarId` nunca serve como identidade nem como endereço de armazenamento**. Ver [`## PL4D`](#pl4d--product-lock-fase-4d--dados-persistência-migração-recuperação-e-integridade) · `D-4D-RODADAS-ESCOPO`. **Deixa de ser pendência de decisão**; a implementação segue pendente e o **risco técnico continua ABERTO**.
- **Nenhum risco técnico passou a `CORRIGIDO` nesta fase.** A única linha que mudou para `CORRIGIDO` é `P-11`, **defeito documental** sanado neste mesmo bloco.
- **Nenhuma severidade rebaixada, nenhuma classificação de lançamento afrouxada, nenhum código `P` novo criado.**
- **`P-56` e `P-63` continuam `BLOQUEIA LANÇAMENTO`**; a decisão de produto **não** os corrige.
- **Quantidade e textos exatos das conquistas dos quatro jogos** — produção na **Fase 11**.
- **Toda a implementação** das decisões acima é **futura**; **nenhuma validação física** foi executada nesta fase.

## PL4D — Product Lock Fase 4D · Dados, persistência, migração, recuperação e integridade

> **Data:** 2026-08-05. **Registro formal das respostas do fundador** ao artefato preliminar
> [`docs/fase4-product-lock/04_PRODUCT_LOCK_4D_DADOS_PERSISTENCIA_MIGRACAO_E_INTEGRIDADE.md`](fase4-product-lock/04_PRODUCT_LOCK_4D_DADOS_PERSISTENCIA_MIGRACAO_E_INTEGRIDADE.md).
> Bloco **exclusivamente documental**: nenhum código, *asset*, *pack*, manifesto ou configuração
> foi alterado; nenhum *build* foi gerado; nenhuma validação física foi executada.
> As decisões das Fases **4A**, **4B** e **4C** permanecem **integralmente preservadas**.

**Regra de leitura (três estados, como em PL4A, PL4B e PL4C):** cada decisão abaixo distingue
**decisão resolvida** · **implementação pendente** · **validação futura**. Decisão de produto
tomada **não** corrige risco técnico e **não** autoriza escrever código.

### D-4D-PERFIL-LOCAL — Uma única criança local por instalação
- **Status:** ✅ **APROVADA** · **resolve** o conflito `D-2` do artefato.
- (1) O produto cria um **identificador local estável** para a criança · (2) **nome e avatar são atributos editáveis**, não identidade · (3) **trocar avatar não troca identidade** · (4) **sem** seletor de múltiplas crianças no lançamento · (5) **sem** sincronização · (6) o formato deve **permitir evolução futura** para múltiplos perfis · (7) **os dados legados globais são associados ao perfil local criado, nunca abandonados**.
- **Implementação pendente** (Fases 12A e 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-62`, `P-55`, `P-114`, `P-141`.

### D-4D-RODADAS-ESCOPO — As rodadas diárias pertencem à criança local
- **Status:** ✅ **APROVADA** · **resolve** o conflito `D-3`, preservado desde PL4B e PL4C.
- **Duas rodadas por criança local por dia.** Como o lançamento terá **uma única criança local por instalação**, o efeito prático equivale a duas por instalação — **mas a propriedade semântica do contador pertence à criança**.
- A implementação deve usar **`childId` local estável**. **`avatarId` nunca poderá ser usado como identidade nem como endereço de armazenamento.** Trocar avatar, nome ou aparência **não reinicia rodadas** e **não cria outra criança**.
- O contador continua **compartilhado entre os quatro jogos**. A **alteração do relógio não concede vantagem silenciosa**: a política técnica será especificada na implementação, **preservando a fronteira de dia local** e o comportamento ***fail closed***.
- **Implementação pendente** (Fases 12A e 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-40`, `P-56`, `P-57`, `P-61`, `P-86`, `P-146`.

### D-4D-REINSTALACAO — Sem promessa de recuperação de dado infantil
- **Status:** ✅ **APROVADA.**
- O produto **não promete** recuperar dados infantis após a desinstalação. **Somente o direito comercial do Plano Família é restaurável** pela conta da loja. **Não há garantia** para progresso, pinturas, artes, perfil, estrelinhas, conquistas, resultados de jogos ou *downloads*.
- **Copy obrigatória na Área dos Pais:** *"Desinstalar o aplicativo pode apagar o progresso e as criações salvas neste aparelho."*
- Um eventual **backup automático do sistema operacional pode existir, mas não é compromisso do produto**.
- **Implementação pendente** (Fase 19) · **risco técnico NÃO corrigido**. Rastreio: `P-129`, `P-140`, `P-144`.

### D-4D-EXPORTACAO — Exportação individual protegida por portão parental
- **Status:** ✅ **APROVADA.**
- O lançamento permite exportar **individualmente**: **pinturas do Colorir com o Beni** e **artes salvas do Criar Livre no Plano Família**.
- (1) **Portão parental obrigatório** · (2) folha de compartilhamento nativa ou salvamento autorizado · (3) **nenhuma chamada infantil para rede social** · (4) **nenhum nome da criança incluído automaticamente** · (5) **nenhum identificador interno ou dado de progresso acompanha a imagem** · (6) **sem** importação de volta · (7) **sem** backup completo no lançamento · (8) **não utilizar automaticamente `certificateService`, `shareCardService` ou serviços antigos** para implementar a exportação.
- **Implementação pendente** (Fase 10) · **risco técnico NÃO corrigido**. Rastreio: `P-49`, `P-82`.

### D-4D-RESET — Quatro operações distintas de reset
- **Status:** ✅ **APROVADA** · **resolve** os conflitos `D-7` e `D-8`.
- **A. Recomeçar a jornada** — apaga progresso, quiz, reflexão, estrelinhas, conquistas, resultados dos jogos, rodadas diárias e os estados de *onboarding* e guias ligados à jornada; **preserva** pinturas, artes do Criar Livre, *entitlement*, *downloads* e perfil básico.
- **B. Apagar downloads** — somente *packs* e temporários. **C. Apagar uma criação** — individual, com confirmação do responsável. **D. Apagar todos os dados locais** — perfil, progresso, criações, jogos e *downloads*, exigindo **portão parental, confirmação dupla, digitação da palavra `APAGAR` e lista explícita** do que será perdido.
- **O direito comprado na loja não é apagado** e poderá ser restaurado. **Logout, *downgrade* e perda do *entitlement* nunca equivalem a reset.**
- O cartão **"Em preparação" deve ser removido ou substituído pela operação real antes do lançamento**.
- **Implementação pendente** (Fases 11 e 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-32`, `P-35`, `P-145`.

### D-4D-CORRUPCAO — Quarentena com tentativa de recuperação
- **Status:** ✅ **APROVADA.**
- (1) **Não sobrescrever imediatamente** o *payload* corrompido · (2) **preservar o original em quarentena** · (3) executar **reparo determinístico** · (4) **preservar blobs e criações recuperáveis** · (5) usar **estado seguro** durante o reparo · (6) ***fail closed*** a *entitlement*, rodadas, recompensas e desbloqueios · (7) **não fabricar** conclusão ou recompensa · (8) **não interpretar falha de leitura como atividade não realizada** · (9) informar o responsável **somente quando houver risco real de perda** · (10) manter a quarentena por **trinta dias** · (11) manter no máximo **três versões por domínio** · (12) remover depois **somente o comprovadamente irrecuperável**.
- **Copy de referência:** *"Encontramos um problema em alguns dados deste aparelho. O Mundo do Beni preservou o que conseguiu e está usando um estado seguro."* **Não mostrar linguagem técnica à criança.**
- **Implementação pendente** (Fases 12A e 19) · **risco técnico NÃO corrigido**. Rastreio: `P-41`, `P-46`, `P-146`.

### D-4D-SERVICOS-MORTOS — Certificados, share cards e relatório semanal fora do v1
- **Status:** ✅ **APROVADA** · **resolve** o conflito `D-13` **após re-auditoria exigida pelo fundador**.
- **A divergência do corpus anterior está resolvida: as duas leituras descreviam coisas diferentes.** Medido no commit canônico: (a) **três módulos inteiramente mortos** — `certificateService.js`, `shareCardService.js`, `weeklyReportService.js`, com **zero importadores** em `src/` e em `App.js`; (b) **dois *exports* órfãos dentro de módulos VIVOS** — `getStoryRewardBreakdown` em `rewardService.js` e `clearSeenAchievements` em `achievementsStorage.js`; (c) a cadeia **`totalBonusStars` NÃO é código morto** — a escrita é viva e aguardada em **oito pontos** e chega a `ProgressContext`; **apenas o consumo final é inexistente**, e **removê-la destruiria estrelinhas realmente conquistadas**; (d) a **suíte de fumaça fixa o código morto no lugar**.
- **Decisões:** nenhum dos três é ativado no lançamento · **remover do *runtime* apenas o comprovadamente morto** · **preservar o histórico no Git** · registrar as ideias no *backlog* pós-lançamento · **ajustar as verificações de fumaça que mantêm código morto artificialmente** · **não** usar esses serviços como implementação automática da exportação.
- **Implementação pendente** (Fase 16) · **risco técnico NÃO corrigido**. Rastreio: `P-82`, `P-39` (**sem remoção**), `P-147`, `P-148`.

### D-4D-ARMAZENAMENTO — Sem teto para criações; piso de espaço livre para downloads
- **Status:** ✅ **APROVADA** · **resolve** o conflito `D-12`.
- **Não** haverá limite rígido automático para as criações da criança.
- Para *downloads*: (1) calcular tamanho necessário e margem para **instalação atômica** · (2) **bloquear o download que deixe o aparelho com menos do que o MAIOR valor entre 2 GB livres e 10% da capacidade total** · (3) mostrar **uso de armazenamento na Área dos Pais** · (4) permitir **remoção individual ou total de packs** · (5) limpar automaticamente **apenas temporários e downloads incompletos** · (6) **nunca apagar pinturas, artes ou progresso automaticamente** · (7) **informar a falta de espaço antes de iniciar o download**.
- **Implementação pendente** (Fase 17) · **risco técnico NÃO corrigido**. Rastreio: `P-116`.

### D-4D-PACKS-POS-ATUALIZACAO — Packs compatíveis sobrevivem à atualização do app
- **Status:** ✅ **APROVADA** · **resolve** o conflito `D-11`.
- Na abertura após a atualização: (1) **revalidar manifesto, schema, versão mínima e hashes** · (2) manter disponível o *pack* compatível · (3) **marcar o incompatível como exigindo atualização** · (4) **não usar** *pack* incompatível · (5) **não apagar a versão anterior antes de a nova ser instalada e validada** · (6) fazer **substituição atômica** · (7) **preservar progresso e criações** · (8) em modo *offline*, **manter o pack inerte e informar ao responsável** · (9) apagar automaticamente **somente temporários, incompletos ou versões já substituídas com sucesso**.
- **Implementação pendente** (Fase 17) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-120`, `P-124`, `P-125`, `P-126`, `P-134`, `P-137`, `P-138`.

### D-4D-CHAVES — Centralização progressiva das chaves de storage
- **Status:** ✅ **APROVADA** · **resolve** o conflito `D-9`.
- (1) Toda chave **nova** nasce em `storageKeys.js` · (2) **nenhum literal novo** fora da fonte canônica · (3) **preservar valores físicos legados** quando renomear criar risco · (4) expor chaves legadas por constantes ou funções canônicas · (5) **não renomear `ptf_atelier_arts_v1_index`** · (6) escritores e leitores usam a constante canônica · (7) reset, migração, diagnóstico e exclusão total usam o **mesmo inventário** · (8) remover literais duplicados nas fases proprietárias · (9) **remover chave morta somente depois de auditoria de leitores, escritores, histórico e necessidade de migração** · (10) **não apagar chave baseada apenas em busca textual superficial**.
- **Implementação pendente** (Fase 19) · **risco técnico NÃO corrigido**. Rastreio: `P-114`, `P-141`, `P-143`.

### PL4D — Ratificações globais
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

Os itens **8 e 9 formam um par indivisível**: o maior estado defensável é um **teto**, não um piso.

### PL4D — Correções de rastreabilidade aplicadas
1. **Duas contagens do relatório preliminar corrigidas, sem ajuste silencioso.** (a) Dos **33 códigos** em escopo, **8** dependiam de resposta do fundador (`P-35` `P-62` `P-82` `P-114` `P-116` `P-126` `P-134` `P-137`) e **25** decorriam de contratos já aprovados — o relatório dizia "9 e 24". As **10 perguntas** excedem os 8 códigos porque três perguntas são de contrato e não têm código âncora, e porque perguntas distintas compartilham o mesmo código. (b) Os conflitos são **14**, dos quais **7 exigiam o fundador** (`D-2` `D-3` `D-7` `D-9` `D-11` `D-12` `D-13`) e **7 eram resolvíveis** — o relatório dizia "seis e oito", contradizendo a própria enumeração.
2. **Oito códigos `P` novos criados — `P-141` a `P-148`** —, todos pelo **gerador determinístico**, **sem renumerar** nenhum código anterior. A matriz canônica passa de **140** para **148** riscos.
3. **A ausência de política de armazenamento NÃO virou código novo** — o fato, a superfície e a correção já são os de `P-116`, e a regra do fundador proíbe criar código por simples ampliação de evidência.
4. **A cadeia `totalBonusStars` fica explicitamente protegida de remoção** (`P-39`): a escrita é viva e aguardada; apagá-la destruiria estrelinhas conquistadas, contra a Decisão 9 da Fase 4C.
5. **`P-120`, `P-125` e `P-126` saem de `DECISÃO DE PRODUTO PENDENTE` para `ABERTO`** — nunca para `CORRIGIDO`.
6. **Sete códigos saem de `EXIGE DECISÃO NO PRODUCT LOCK` para `INFORMA O PRODUCT LOCK`:** `P-44`, `P-120`, `P-124`, `P-125`, `P-126`, `P-134`, `P-137`.
7. **`P-108` permanece `EXIGE DECISÃO NO PRODUCT LOCK`** — a Fase 4D **não** decidiu o destino do Modo Igreja. — ⚠️ **ATUALIZADO em 2026-08-06 (Fase 4E):** o destino foi decidido; `P-108` passa a **`INFORMA O PRODUCT LOCK`**, mantendo Status `ABERTO` (ver §`PL4E`).
8. **Nenhum risco técnico foi marcado como corrigido** apenas porque a decisão foi tomada.
9. **Nenhuma decisão das Fases 4A, 4B e 4C foi revogada, afrouxada, reinterpretada ou reaberta.**

### PL4D — O que continua **não** decidido e **não** corrigido
- **Nenhum risco técnico passou a `CORRIGIDO` nesta fase.**
- **`P-141` entra como `BLOQUEIA LANÇAMENTO`** (`CRÍTICO`): no commit canônico, sete telas escopam dado infantil por `profile.id || profile.avatarId`, e trocar de avatar faz a criança perder acesso ao que salvou.
- **Toda a implementação** das dez decisões acima é **futura** (Fases 10, 11, 12A, 16, 17 e 19); **nenhuma validação física** foi executada nesta fase.
- **A política técnica anti-adiantamento de relógio** será especificada na fase de implementação, preservando a fronteira de dia local e o comportamento *fail closed*.
- **Destino do Modo Igreja** (`P-108`) segue pendente de decisão de produto. — ⚠️ **ATUALIZADO em 2026-08-06 (Fase 4E):** ~~segue pendente~~ **decidido** em `D-4E-IGREJA`; o **risco técnico** de `P-108` continua **`ABERTO`**.
- **Quantidade, textos e desenho de tela** das quatro operações de reset, do aviso de desinstalação e do painel de armazenamento são **produção futura**.

## PL4E — Product Lock Fase 4E · Privacidade, Área dos Pais, analytics e Modo Igreja

> **Data:** 2026-08-06. **Registro formal das respostas do fundador** ao artefato preliminar
> [`docs/fase4-product-lock/05_PRODUCT_LOCK_4E_PRIVACIDADE_AREA_DOS_PAIS_ANALYTICS_E_MODO_IGREJA.md`](fase4-product-lock/05_PRODUCT_LOCK_4E_PRIVACIDADE_AREA_DOS_PAIS_ANALYTICS_E_MODO_IGREJA.md).
> Bloco **exclusivamente documental**: nenhum código, *asset*, *pack*, manifesto ou configuração
> foi alterado; nenhum *build* foi gerado; nenhuma validação física foi executada.
> As decisões das Fases **4A**, **4B**, **4C** e **4D** permanecem **integralmente preservadas**.

**Regra de leitura (três estados, como em PL4A, PL4B, PL4C e PL4D):** cada decisão abaixo distingue
**decisão resolvida** · **implementação pendente** · **validação futura**. Decisão de produto
tomada **não** corrige risco técnico e **não** autoriza escrever código.

### D-4E-SESSAO-ADULTA — A sessão adulta termina por inatividade de 5 minutos
- **Status:** ✅ **APROVADA** · **resolve** o conflito `C-2` do artefato.
- (1) O portão parental abre uma **sessão adulta** que vale para **toda** a Área dos Pais, não por tela · (2) a sessão **termina após 5 minutos de inatividade**, não por tempo absoluto · (3) **termina imediatamente** ao sair da Área dos Pais para a área infantil · (4) **termina** quando o app vai a segundo plano por período relevante · (5) navegação **dentro** da área adulta **não** exige revalidação · (6) ações destrutivas ou comerciais **sempre** exigem confirmação própria, mesmo com sessão válida · (7) em **aparelho compartilhado**, a regra é a mesma — o produto **não** presume um único adulto.
- **Implementação pendente** (Fase 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-49`, `P-92`.

### D-4E-LINKS-EXTERNOS — Regra D refinada para saída do app
- **Status:** ✅ **APROVADA** · **resolve** o conflito `C-10`.
- Todo link que leva para fora do app exige **portão parental** e **aviso de saída**; a criança **nunca** abre navegador externo a partir da área infantil. A refinação: o aviso é **uma tela adulta clara**, não um alerta genérico, e o destino é **declarado antes** da saída.
- **Implementação pendente** (Fase 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-92`, `P-145`.

### D-4E-EXCLUSAO — A criança pode iniciar, só o adulto conclui
- **Status:** ✅ **APROVADA.**
- A criança **pode iniciar** a exclusão da própria criação; a **conclusão** exige o **adulto** através do portão parental. Nenhuma exclusão irreversível ocorre por toque infantil isolado. Preserva integralmente as cinco garantias de exportação e reset da Fase 4D.
- **Implementação pendente** (Fases 11 e 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-100`, `P-107`.

### D-4E-ANALYTICS-3-CAMADAS — Arquitetura de três camadas
- **Status:** ✅ **APROVADA** · **resolve** o conflito `C-4`.
- (1) **Camada local de produto**, que nunca sai do aparelho · (2) **camada de diagnóstico técnico**, sem conteúdo infantil e sem identificador remoto derivado do `childId` · (3) **camada pública opcional**, **desligada por padrão** e dependente de **autorização adulta explícita**. As **12 categorias** do artefato ficam ratificadas. **Proibido** converter o `childId` local em identificador remoto. **Igreja e denominação nunca entram na telemetria de produto.**
- **Implementação pendente** (Fases 5 e 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-85`, `P-127`, `P-139`.

### D-4E-CONSENTIMENTO — Consentimento adulto e pesquisa
- **Status:** ✅ **APROVADA** · **resolve** o conflito `C-5`.
- Qualquer coleta opcional depende de **consentimento adulto explícito, revogável**, obtido **atrás do portão parental**, com **linguagem compreensível** e **sem escurecimento de padrão** (*dark pattern*). Pesquisa com famílias **não** se confunde com telemetria de produto.
- **Implementação pendente** (Fase 5) · **risco técnico NÃO corrigido** · **revisão jurídica ainda exigida**. Rastreio: `P-85`, `P-92`.

### D-4E-ARTE-PURA — Exportação da obra da criança é arte pura
- **Status:** ✅ **APROVADA** · **ratifica** o conflito `C-14`.
- A obra pessoal da criança sai **sem** moldura, marca d'água, logo, CTA ou QR comercial. O **imprimível oficial** do Mundo do Beni é outro objeto e **pode** levar identidade de marca, com a área comercial **visualmente separada** sob rótulo para pais e responsáveis. **A chamada de compra nunca é dirigida à criança.** Contrato completo na §20 do artefato.
- **Implementação pendente** (Fases 11 e 16) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-100`, `P-107`.

### D-4E-COMPARTILHAMENTO — Folha de compartilhamento nativa
- **Status:** ✅ **APROVADA** · **resolve** o conflito `C-7`.
- O compartilhamento usa a **folha nativa do sistema**, sempre por **ação adulta**. `expo-sharing` fica **conceitualmente autorizado**; **`expo-media-library` NÃO** é autorizada — gravar na galeria do aparelho exige permissão ampla que o produto não quer pedir. **Nenhuma dependência foi instalada nesta fase.**
- **Implementação pendente** (Fase 19) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. Rastreio: `P-100`, `P-107`.

### D-4E-IGREJA — Modo Igreja é segunda linha de produto real dentro do mesmo app
- **Status:** ✅ **APROVADA** · **resolve** os conflitos `C-11`, `C-12` e `C-13` · **supera**, no alcance da §19.1 do artefato, a decisão #5 do `DECISIONS.md` da raiz.
- Marca guarda-chuva **Mundo do Beni**, linha **Mundo do Beni para Igrejas**, recurso **Modo Igreja** — **sem** segundo app, segundo mascote ou segunda identidade. **A Criação Igreja é gratuita e completa**; as cinco aulas de lançamento são **A Criação, Noé, Davi e Golias, Jesus e as Crianças e Daniel** (**O Bom Samaritano não está entre elas**). **25 exclusões** de escopo compensatório, **núcleo bíblico compartilhado** sem alegar neutralidade teológica, Mural **coletivo** sem ranking, *presets* de **10/25/45 min**, **sem** *entitlement* por número de crianças, **sem vazamento de *entitlement*** entre Família e Igreja, e a regra dura **paywall antes do encontro, nunca durante**. **Preço, plano pago e limites NÃO são definidos agora** — ficam num **portão futuro obrigatório** antes da Fase 18. Contrato congelado na §19 do artefato.
- **Implementação pendente** (Fase 12B; comercialização na Fase 18) · **risco técnico NÃO corrigido** · **validação física ainda exigida**. **A *flag* de *build* continua desligada e nenhuma UI foi exposta.** Rastreio: `P-108`.

### D-4E-POLITICA-ARQUITETURA-C — Arquitetura C para política e termos
- **Status:** ✅ **APROVADA.**
- Política de Privacidade e Termos ficam em **`mundobeni.com.br/privacidade`** e **`mundobeni.com.br/termos`**, acessíveis a partir da Área dos Pais atrás do portão parental e do aviso de saída (`D-4E-LINKS-EXTERNOS`).
- **Implementação pendente** (Fases 5 e 19) · **risco técnico NÃO corrigido** · **revisão jurídica ainda exigida**. Rastreio: `P-92`, `P-145`.

### D-4E-CONTATO — Canal oficial de contato
- **Status:** ✅ **APROVADA.**
- O canal oficial é **`contato@mundobeni.com.br`**. **Não foi implementado em código nesta fase.**
- **Implementação pendente** (Fase 19) · **risco técnico NÃO corrigido**. Rastreio: `P-92`.

### D-4E-TEXTO-PRIVACIDADE — O absoluto cai
- **Status:** ✅ **APROVADA** · **resolve** o conflito `C-3` · **encaminha** o conflito `C-9`.
- As frases **"sem coleta de dados"** e **"tudo funciona só com dados locais neste aparelho"** **não podem permanecer absolutas**: a RevenueCat processa informação de compra, pode haver telemetria pública opcional futura e o compartilhamento adulto envia conteúdo para fora. O novo texto é **curto, compreensível e verdadeiro**, obedecendo às **oito regras** da §18 do artefato — incluindo a proibição de texto jurídico gigante como mensagem principal da Área dos Pais e a proibição de afirmar de forma absoluta que nenhum dado sai do aparelho.
- **Implementação pendente** (Fase 19) · **risco técnico NÃO corrigido** · **revisão jurídica ainda exigida** (Fase 5). Rastreio: `P-93`.

### PL4E — Ratificações globais
1. **As regras de minimização de identificadores** ficam ratificadas, com a **proibição explícita** de converter o `childId` local em identificador remoto.
2. **A lista do que nunca pode aparecer em log** fica ratificada sem afrouxamento.
3. **As cinco garantias de exportação da Fase 4D** e **as quatro garantias comerciais de 4A/4B** ficam **preservadas**.
4. **Direitos de exibição coletiva** (música, fontes, ilustrações, efeitos, narração, traduções bíblicas e conteúdo de terceiros) são **portão obrigatório** antes do lançamento das aulas de Igreja, com dono natural na **Fase 16**.
5. **A correção dos cinco rótulos de acessibilidade** segue encaminhada à **Fase 12A**, sem antecipação.

### PL4E — Correções de rastreabilidade aplicadas
1. **Cinco contagens do artefato preliminar corrigidas, sem ajuste silencioso** (§0 do artefato): (a) os códigos dependentes do fundador são **4**, não 5 — `P-107` foi contado duas vezes; (b) a fórmula *"19 aprovados + 5 fundador"* é inválida — a decomposição correta dos 24 é **4 + 15 + 3 + 2**; (c) o portão parental cobre **10 + 6 + 1 = 17** ações, não "11 + 5 + 1"; (d) o resumo de analytics soma **6 + 2 + 2 + 2 = 12** categorias, não 13; (e) o conjunto de perguntas sem código âncora é **{1, 2, 6, 7, 9, 10}** — a Pergunta 3 estava indevidamente incluída e a 6 omitida.
2. **Sete conflitos não possuem código `P` correspondente** — C-5, C-6, C-8, C-10, C-12, C-13, C-15. **Nenhum código novo foi criado por isso**, conforme a regra que proíbe criar código por ampliação de evidência.
3. **Quatro referências de código corrigidas** no artefato (`appDataModel.js:51`→`src/data/appDataModel.js:49`; `postStoryStorage.js:72`→`:71`; `planConfig.js:40-56`→`:40-55`; `storageKeys.js:98-110`→`:96-110`) e registrado o achado de que **`src/models/` não existe** — o caminho real é **`src/data/`**.
4. **Nenhum código `P` novo foi criado nesta fase.** A matriz canônica permanece com **148** riscos (`P-01`..`P-148`), **sem renumeração**.
5. **`P-85` e `P-100` saem de `DECISÃO DE PRODUTO PENDENTE` para `ABERTO`** — nunca para `CORRIGIDO`.
6. **Três códigos saem de `EXIGE DECISÃO NO PRODUCT LOCK` para `INFORMA O PRODUCT LOCK`:** `P-85`, `P-100` e `P-108`.
7. **Correção metodológica registrada:** o artefato preliminar afirmava que `P-108` também sairia de `DECISÃO DE PRODUTO PENDENTE`; **`P-108` já estava `ABERTO`**, de modo que apenas o eixo **Product Lock** se move. A divergência veio de tratar os três códigos como um bloco homogêneo.
8. **Nenhum risco técnico foi marcado como corrigido** apenas porque a decisão foi tomada.
9. **Nenhuma decisão das Fases 4A, 4B, 4C e 4D foi revogada, afrouxada, reinterpretada ou reaberta.**
10. **A recontagem dos blocos derivados da matriz foi feita manualmente e auditada** — o *"gerador determinístico"* citado nos commits de 4A a 4D **não existe no repositório** e **não** foi executado.

### PL4E — O que continua **não** decidido e **não** corrigido
- **Nenhum risco técnico passou a `CORRIGIDO` nesta fase.**
- **Preço, mensalidade, desconto, preço de fundador, limite de líderes, limite de salas, limite de dispositivos, nome final do produto pago e modelo institucional do Modo Igreja** ficam num **portão futuro obrigatório**, depois do piloto físico de **A Criação** e **antes** da implementação comercial da **Fase 18**.
- **Conformidade jurídica não foi declarada.** Os **24 encaminhamentos** da §22 do artefato (mapa de dados, base legal, retenção, ECA, ECA Digital, LGPD, RIPD, Apple Kids, Google Families, SDKs, licenças de exibição coletiva e demais) são **obrigatórios na Fase 5**. É **proibido** declarar *"legalmente aprovado"*, *"100% conforme"*, *"nenhum risco"* ou *"anonimização garantida"* antes disso.
- **Política de oração e neutralidade denominacional** têm aprofundamento na **Fase 5**. *(Correção de nomenclatura aplicada na Fase 5, Bloco 0: o texto original dizia "Fase 5C" — designação que nunca existiu no árbitro de sequência. A Fase 5 **não** é subdividida.)*
- **Toda a implementação** das onze decisões acima é **futura** (Fases 5, 11, 12A, 12B, 16, 18 e 19); **nenhuma validação física** foi executada nesta fase.

---

## PF5 — Fase 5 · Infância, privacidade, teologia e medição (2026-08-06)

> Fase **documental**. Registro consolidado em [`docs/fase5-pareceres/`](fase5-pareceres/).
> A Fase 5 **não é subdividida**: não existem `Fase 5A`, `Fase 5B` nem `Fase 5C`. Os "blocos"
> internos são unidades de trabalho dos artefatos, não eixo de nomenclatura do roadmap.
> **Nenhum arquivo executável foi alterado nesta fase.**

### PF5-FAIXA-ETARIA · Faixa oficial 4 a 8 anos (supersede PL01A-04 no eixo etário)
- **Decisão:** a faixa etária oficial do **Mundo do Beni** fica **congelada em 4 a 8 anos**.
- **Referência de linguagem (não é faixa):** texto simples e compreensível, idealmente acessível a uma criança de **aproximadamente 5 anos**, quando a natureza do conteúdo permitir.
- **Substitui/revoga:** **supersede a [`PL01A-04`](#pl01a-04--público-68-acessível-510--🔄-reversão-estratégica-público) no eixo de faixa etária** (6–8, acessível ~5–10, de 2026-07-21). O registro histórico da `PL01A-04` **não** é reescrito e suas demais determinações — sem coleta de idade, sem perfis etários, loja 4+ fora da Kids Category, classificação de loja ≠ faixa de produto — **continuam válidas**. Reconcilia também os documentos que ainda dizem "3 a 8".
- **Alinhamento com o código:** `ageBand: '4-8'` nas **20** histórias de `src/data/stories.js` está **alinhado** e **não deve ser alterado**. **Nenhuma alteração de runtime decorre desta decisão.**
- ✅ **RATIFICADA pelo fundador — registro corrigido em 2026-08-07 (Fase 5, Bloco 7).** Este item dizia *"⚠️ Ratificação pendente do fundador… será apresentada para ratificação explícita junto com o plano de medição"*. **A ratificação ocorreu antes disso** — na **autorização de abertura da Fase 5**, arbitragem 2: *"Faixa etária CONGELADA em 4 a 8 anos"*, com a determinação expressa de que `ageBand: '4-8'` **não** muda e *"Não modificar runtime por causa desta decisão."* **Declarado sem ajuste silencioso:** a ratificação chegou **antes** do momento previsto, não depois; o texto de pendência estava correto quando escrito e ficou superado pelo ato do fundador. Contexto original em [`00_ABERTURA_E_RASTREABILIDADE.md`](fase5-pareceres/00_ABERTURA_E_RASTREABILIDADE.md) §2; encerramento em [`07_CONSOLIDACAO_FASE_5.md`](fase5-pareceres/07_CONSOLIDACAO_FASE_5.md) §3.3 (`E5.4`).
- **Proibição:** não criar coleta de idade, não criar perfis etários, não alterar `ageBand`.

### PF5-NOMENCLATURA · A Fase 5 não é subdividida
- **Decisão:** não existem `Fase 5A`, `Fase 5B` ou `Fase 5C`. O árbitro de sequência (`v5` §3) nunca as registrou.
- **Correção aplicada, declarada e não silenciosa:** **duas** ocorrências de "Fase 5C" foram corrigidas para "Fase 5" — `DECISIONS.md:1585` e `05_PRODUCT_LOCK_4E_…md:2155`. A auditoria de entrada havia relatado **uma**; a contagem correta é **duas**. Motivo da divergência em [`00_ABERTURA_E_RASTREABILIDADE.md`](fase5-pareceres/00_ABERTURA_E_RASTREABILIDADE.md) §1.1.

### PF5-P92 · Reconciliação de redação sem deslocar implementação
- **Decisão:** para `P-92`, a **Fase 5 emite parecer e especificação**; a **Fase 20 permanece proprietária da implementação técnica e da validação**. A **Fase 19 não é proprietária** deste risco. A coluna canônica `Fase implementação = 20` **não** é alterada.
- **Proibição:** não registrar plugin em `app.json` nesta fase; não mover a implementação para a Fase 5 nem para a Fase 19; não marcar o risco como corrigido.

### PF5-P149 · Novo código de risco criado (matriz passa a 149)
- **Decisão:** criado **`P-149`** — a Área dos Pais afirma ausência de tráfego de rede que existe (`ParentAreaScreen.js:890,896,911,1104` contra `globalManifestService.js:211`). Criado **após auditoria de deduplicação** contra `P-01`..`P-148`, que provou ausência de cobertura material. **Sem renumeração.** A matriz canônica passa de **148** para **149** riscos.
- **Contratos:** Natureza primária **PRIVACIDADE** · Status `ABERTO` · Fase decisão: nenhuma · **Fase implementação: 7** · Product Lock `INFORMA` · Lançamento `PODE BLOQUEAR` (critério 2, com a evidência faltante registrada).
- **Distinção preservada:** *"não enviar dados pessoais da criança"* é **verdadeiro**; *"não realizar tráfego de rede"* é **falso**.
- **Base factual AMPLIADA em 2026-08-07 (Fase 5, Bloco 6), sem mudar status, severidade nem fase proprietária:** os textos divergentes são **seis**, não quatro — além de `ParentAreaScreen.js:890,896,911,1104`, também **`:952`** (*"Nada sai deste aparelho"*) e **`:1280`** (*"tudo fica no aparelho"*). As superfícies de rede verificadas são **cinco**, não uma, e os perfis de `eas.json` que carregam `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` são **três**, não um. Descoberta material adicional: o acesso à rede é **iniciado pelo usuário adulto**, atrás de um botão rotulado (`useStoryPackDownload.js:144`, `StoryDetailScreen.js:166,475`; nenhum disparo automático), o que permite uma redação honesta **e** acolhedora. Evidência completa em [`06_DIVERGENCIA_DOS_TEXTOS_DE_PRIVACIDADE.md`](fase5-pareceres/06_DIVERGENCIA_DOS_TEXTOS_DE_PRIVACIDADE.md).
- **Implementação pendente (Fase 7) · risco técnico NÃO corrigido · nenhuma alteração de `ParentAreaScreen.js` autorizada nesta fase.**

### PF5-MEDICAO · Plano de medição não identificada — APROVADO no eixo documental (2026-08-07)
- **Decisão do fundador:** o plano de [`05_PLANO_DE_MEDICAO_ANONIMA.md`](fase5-pareceres/05_PLANO_DE_MEDICAO_ANONIMA.md) está **aprovado**. Atende ao critério de saída da Fase 5 registrado em `v5` linha 249 **no eixo documental — e apenas nele**.
- **A aprovação NÃO significa:** implementação de analytics · validação jurídica definitiva · garantia de anonimização · aprovação de SDK · autorização de coleta remota · autorização para alterar runtime.
- **Ratificado como contrato de produto:** arquitetura de três camadas · **zero categorias enviando dados remotamente no lançamento** · proibição de converter identificador local em remoto · proibição de nome, arte, texto criado pela criança, conteúdo de oração, igreja, denominação, dado de fé, localização e identificador publicitário em telemetria · consentimento adulto explícito **por finalidade** · revogação prospectiva · desligamento independente de rede · supressão de coorte pequena · **máximo de três atributos por coorte** · **`k ≥ 20`** geral e **`k ≥ 50`** religioso · retenções `R0`–`R4`, `RL`, `RT`, com `R2` ≤ 7 dias ou 200 registros e `R3` ≤ 90 dias.
- ⚠️ **Registro obrigatório, literal do fundador:** *"Os limites de `k` NÃO constituem garantia de anonimização ou impossibilidade de reidentificação… são salvaguardas de minimização e redução de risco, não certificação jurídica ou matemática de anonimato."*
- **Assimetria de revisão futura:** uma revisão jurídica futura **pode exigir retenção MENOR ou salvaguarda MAIS restritiva sem reabrir o Product Lock**. Qualquer proposta futura de **retenção maior, coleta adicional ou salvaguarda menos restritiva exige nova decisão formal**.
- **EAS Update (cerca normativa):** `EAS Update` **não** pode ser usado como substituto funcional de *remote config*, experimentação de funcionalidade ou teste A/B para contornar Product Lock, consentimento, fases proprietárias, portões de validação ou decisões de lançamento. A distinção técnica **não** cria autorização de produto.
- **`P-85` NÃO passa a `CORRIGIDO`.** Somente o eixo documental mudou; status `ABERTO`, classificação `ALTO` e fase proprietária permanecem. **Nenhum código de analytics foi escrito; `performanceTrace.js`, `eas.json` e `src/` não foram tocados.**

### PF5-ORACAO · Política de oração — CAMINHO B (2026-08-07)
- **Decisão do fundador (`E5.41`):** adotado o **Caminho B** como contrato canônico.
- **Princípio vinculante:** *"A oração pode fazer parte da experiência espiritual do Mundo do Beni, mas nunca pode ser requisito mensurável, ação pontuada, condição de conclusão ou causa direta de recompensa."*
- **Relação entre os caminhos:** **B** é normativo · **C** é complemento técnico e redacional e **não** substitui B · **A não é adotada**.
- **Estado:** decisão de produto **RESOLVIDA** · implementação **futura** (**Fase 11** para recompensa, **Fase 12B** para o Cultinho em Casa) · **validação visual futura obrigatória** de que a separação seja perceptível pela criança · **risco técnico NÃO corrigido** (`E5.42`, `E5.43`, `E5.44` seguem abertos) · **nenhuma alteração de runtime**.
- Registro completo em [`05_PLANO_DE_MEDICAO_ANONIMA.md`](fase5-pareceres/05_PLANO_DE_MEDICAO_ANONIMA.md) §13.4.

### PF5-TERMINOLOGIA · "Ateliê" não é nome canônico (2026-08-07)
- **Decisão do fundador:** **não** consolidar *"Ateliê"* como nome canônico da funcionalidade. Os nomes canônicos são **`Criar Livre`** e **`Colorir com o Beni`** (coerente com `D-CRIAR-COM-BENI-STATUS` e `D-4B-NOMES-OFICIAIS`).
- **Onde "Ateliê" ainda puder aparecer** por rastreabilidade histórica ou técnica, deve ser marcado explicitamente como **nome legado** ou **alias histórico**.
- **Proibição:** **não ressuscitar o Ateliê legado como superfície de produto.**
- **Encaminhamento `E5.66`:** propagar a terminologia aos demais documentos — **Fase 12A**, onde converge com **`P-67`** (quatro textos "Ateliê" visíveis à criança no Baú, `BLOQUEIA LANÇAMENTO`).

### PF5-ENCERRAMENTO · A Fase 5 está DOCUMENTALMENTE ENCERRADA — e nada foi aprovado para lançamento
- **Encerramento documental (2026-08-07):** sete blocos, sete artefatos, **`E5.1` a `E5.71`**, todos com destino declarado em um dos quatro estados obrigatórios: **RESOLVIDO NESTA FASE** (14) · **ENCAMINHADO À FASE PROPRIETÁRIA** (38) · **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** (8) · **DEPENDENTE DE TERCEIRO EXTERNO** (11).
- ⚠️ **Encerramento documental ≠ aprovação para lançamento.** **Nenhum item da Fase 5 está aprovado para lançamento. Nenhum risco técnico foi corrigido. Nenhuma validação física ocorreu.**
- **Dezenove dependências externas permanecem vivas e rastreáveis:** **nove jurídicas ou contratuais** (`E5.6`, `E5.14`, `E5.15`, `E5.16`, `E5.17`, `E5.18`, `E5.22`, `E5.27`, `E5.57`) · **duas teológicas** (`E5.33`, `E5.49`) · **oito de validação humana ou física** (`E5.9`, `E5.21`, `E5.24`, `E5.25`, `E5.28`, `E5.53`, `E5.61`, `E5.68`). **Nenhuma foi transformada em aprovação.** Continua proibido declarar *"legalmente aprovado"*, *"100% conforme"*, *"nenhum risco"* ou *"anonimização garantida"*.
- **Portão bíblico violado 20/20:** nenhum relatório `REVIEW_<storyId>.md` existe e **nenhum revisor bíblico humano foi identificado**; a cobertura da revisão de 2026-06-01 sobre o texto hoje no app é de **49 de 200 cenas (24,5%)**. Ver [`docs/biblical-review/reports/README.md`](biblical-review/reports/README.md).
- **Matriz canônica:** **149** riscos, recontagem **manual e auditada** no Bloco 7 confirmando as dez contagens derivadas de §29.5; **nenhuma linha da §14 foi alterada**. Duas imprecisões de **rótulo de coluna** foram declaradas (não ajustadas em silêncio) na §30 da matriz.
- **Runtime intacto:** os nove caminhos protegidos permanecem **bit a bit idênticos** a `015c438`; `npm run smoke` **4525/4525**; nenhuma dependência instalada, nenhum build gerado, nenhuma validação física, nenhum push.
- **Próxima fase canônica, segundo `v5` §3:** **Fase 6 — Shell, splash e sistema visual** (título canônico do `v5` §3; a redação anterior desta linha dizia apenas *"shell e splash"* e **omitia o terceiro eixo, o sistema visual** — corrigido em 2026-08-07 na abertura da Fase 6, sem mudar a substância do registro), que herda `E5.52` e o risco `P-139`. **A Fase 6 toca código e exige o ciclo SDD completo com os três portões humanos.**
- Consolidação completa em [`07_CONSOLIDACAO_FASE_5.md`](fase5-pareceres/07_CONSOLIDACAO_FASE_5.md).

---

## PF6D — Fase 6 · Delta v4.1 pós-validação física em iPad (2026-08-08)

> **Origem.** Validação física em iPad conduzida pelo fundador **depois** da implementação dos
> Blocos **B1** (fundação responsiva) e **B3** (*shell* de navegação) da Fase 6. A regressão em
> telefone **não apontou anomalia relevante**; o iPad revelou **bloqueadores estruturais**. O
> fundador tomou dezoito decisões de produto e de arquitetura, registradas aqui como `D1`–`D18`.
>
> **Estas decisões estão APROVADAS e não são reabertas** por nenhuma sessão de IA sem sinalizar
> explicitamente que está pedindo **REVERSÃO**, e sem evidência técnica material.
>
> **Nada foi implementado.** A produção executável do delta depende dos três portões humanos.
> Artefatos do delta em
> [`specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/).
>
> **🔁 EMENDADO em 2026-08-08 pelo Portão Humano 1 — veredito 🟡 APROVADO CONDICIONALMENTE.**
> A emenda **resolveu** `Q1` (`PF6D-Q1`) e `Q2` (`PF6D-D-CANVAS`), **autorizou** a exceção estreita
> de escopo de `F6-R3` (`PF6D-EXC-R3`), **corrigiu** `PF6D-D1` (o iPad **já gira**; o vão real é
> **tablet Android**), **emendou a ordem dos subportões** em `PF6D-D18` e **rebaixou a causalidade**
> do sintoma da `WebView` a hipótese não confirmada. Síntese em `PF6D-EMENDA-P1`.
> **Continua sem autorização para Plan, Tasks, Analyze ou Implement.**
>
> **Divisão de competências preservada (E018).** Este arquivo registra as **decisões**. Os
> **códigos de risco** correspondentes (`P-150` a `P-167`) vivem exclusivamente na
> [matriz canônica](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md) §32. A `v5` continua
> governando **roadmap e sequência de fases** — e o delta **não** altera as 22 fases.

### PF6D-ESCOPO — O que este bloco é e o que não é

- **É** o registro canônico de dezoito decisões do fundador sobre adaptatividade, orientação,
  famílias de superfície, geometria do mapa, ciclo de vida e sequenciamento da Fase 6.
- **Não é** aprovação de implementação. **Nenhuma linha de `F6-R1`, `F6-R2` ou `F6-R3` foi
  escrita.** Não existe `plan.md` nem `tasks.md` do delta.
- **Não revoga** nada da *spec* aprovada da 021: eixos A/B/C, `RF-A1..A7`, `RF-B1..B8`,
  `RF-C1..C16`, `RF-M1..M5`, `S1..S11`, `T1..T14`, `F1..F12`, `B1..B7` e `CHK001..CHK040`
  **permanecem integralmente em vigor**. Os Portões Humanos 1 e 2 já concedidos àquela *spec*
  **continuam concedidos**; o delta abre um **novo** Portão 1, só para si.
- **Não** contradiz `D-SELOS-ESTADO-V2` nem `D-SDD-WORKFLOW-YML-DIVERGENCIA`, registradas na
  abertura da Fase 6 — o delta é ortogonal a ambas.

### PF6D-D1 — Telefones em retrato; tablets e iPads em retrato **e** paisagem
- **Status:** ✅ CONFIRMADA. Telefones (iOS e Android) permanecem travados em **retrato**. Tablets
  e iPads suportam **retrato e paisagem**.
- **Alcance explicitado na emenda do Portão 1 (item 4):** `D1` cobre **quatro** casos, não dois —
  **iPhone retrato**, **telefone Android retrato**, **iPad retrato+paisagem** e **tablet Android
  retrato+paisagem**. É **proibido** congelar *"iPad rotaciona / Android permanece retrato"* como
  solução final: isso resolveria apenas parte da decisão.
- **Estado do código — ⚠️ CORRIGIDO NA EMENDA DO PORTÃO 1:**

  | *Idiom* | Configuração efetiva do HEAD | `D1` |
  |---|---|---|
  | iPhone | `UISupportedInterfaceOrientations` = retrato | ✅ cumprido |
  | **iPad** | `UISupportedInterfaceOrientations~ipad` = **as quatro orientações** | ✅ **já cumprido hoje** |
  | Telefone Android | `android:screenOrientation="portrait"` | ✅ cumprido |
  | **Tablet Android** | `android:screenOrientation="portrait"` — chave única, **sem variante por *idiom*** | ❌ **VIOLADO** |

  A avaliação anterior — *"contrariada em ambas as plataformas, para todos os tablets"* — **estava
  errada** e fica **retificada**. O *plugin* `withRequiresFullScreen` do `@expo/config-plugins`
  escreve a variante `~ipad` com as quatro orientações sempre que `ios.supportsTablet` é `true` e
  `ios.requireFullScreen` é falso — exatamente a forma do `app.json` atual. A evidência física do
  fundador (o iPad **girou**) estava correta; a leitura estática é que estava incompleta.
  **O único vão real de orientação é o tablet Android.** Risco `P-150`, atualizado.
- **Consequência que agrava, e não alivia:** como o **iPad já gira hoje**, a exposição do canvas a
  `resize` **não é futura nem condicionada** à liberação da paisagem — **já existe**, por rotação e
  por Split View. `F6-R3` é urgente **mesmo que nenhuma mudança de orientação seja feita**.
- **Precondição inegociável, mantida:** nenhuma mudança de orientação pode ser aplicada antes de
  `F6-R3` existir e da política `PF6D-D-CANVAS` estar em vigor.
- **Vias a comparar objetivamente no PLAN** (nenhuma escolhida agora; **nenhuma dependência
  instalada**): **(A)** configuração CNG/nativa por plataforma e *idiom*; **(B)**
  `expo-screen-orientation`; **(C)** *config plugin* próprio / runtime específico de Android;
  **(D)** qualquer alternativa já compatível com o runtime atual. A vencedora deverá cumprir `D1`
  **integralmente**, preservar multitarefa e redimensionamento no iPad, **evitar dependência nova
  se não for necessária**, **nunca classificar telefone em paisagem como tablet apenas por
  largura** (`D2`) e exigir ***build* nativo** quando a configuração nativa mudar.

### PF6D-D2 — O *layout* é decidido pelo tamanho da janela, nunca pelo nome do aparelho
- **Status:** ✅ CONFIRMADA. É **proibido** decidir *layout* por modelo, por `Platform.isPad`, por
  `expo-device` ou por qualquer heurística de identidade de aparelho.
- **Estado do código:** ✅ **A MECÂNICA JÁ EXISTE.** Varredura completa de `src/` e `App.js`:
  **zero** `Dimensions.get`, **zero** `Dimensions.addEventListener`, ~34 leituras reativas via
  `useWindowDimensions`. **O que falta é a política, não a medida** — registrado para impedir que o
  delta sobredimensione o escopo.

### PF6D-D3 — Quatro famílias de superfície
- **Status:** ✅ CONFIRMADA. **Hub · Editorial · Imersiva · Jogo.** A família — e não a tela —
  determina como a janela é ocupada em cada faixa.
- **Estado do código:** ⚠️ **INEXISTENTE.** Um único predicado `width >= breakpoints.tablet` em
  **13** pontos governa as quatro famílias, e um único `ContentContainer` (coluna de no máximo
  640dp) governa Início, Brincar, Perfil, Histórias e Detalhe indistintamente. Risco `P-151`.

### PF6D-D4 — A barra lateral é responsiva e **não** recebe destinos artificiais
- **Status:** ✅ CONFIRMADA. Nenhum destino, ícone, atalho ou seção é inventado para preencher
  vazio. Vazio se resolve por **composição**.
- **Estado do código:** ⚠️ `TabletSidebar` tem `width: 200` **fixo**, sem distribuição vertical,
  acumulando ~700pt de vazio num iPad em retrato; e importa o tema **legado**
  `src/theme/colors.js`. Risco `P-153`.

### PF6D-D5 — *Story Home V2* = capa herói + identidade + frase central + CTA único + progresso resumido
- **Status:** ✅ CONFIRMADA. **Fase 9.** Risco `P-160`.

### PF6D-D6 — "Nesta aventura" sai da primeira camada visual
- **Status:** ✅ CONFIRMADA. Permanece no conteúdo secundário. **Fase 9.** Risco `P-160`.

### PF6D-D7 — Beni permanece, com fala contextual por estado
- **Status:** ✅ CONFIRMADA. **Fase 9.** Risco `P-160`.

### PF6D-D8 — Navegação de partes prioriza a atual e a próxima
- **Status:** ✅ CONFIRMADA. Lista completa atrás de **"Ver todas as partes"**. **Fase 9.**
  Risco `P-160`.

### PF6D-D9 — O Leitor atual é substituído na Fase 9 pela **Página Viva**
- **Status:** ✅ CONFIRMADA. **Fase 9.** Risco `P-161`.
- **Consequência para a Fase 6:** a F6 entrega apenas a **possibilidade geométrica** da composição;
  **não** implementa o Leitor V2.

### PF6D-D10 — Leitor: retrato = arte dominante + camada legível; tablet em paisagem = livro aberto / painel de apoio
- **Status:** ✅ CONFIRMADA. **Fase 9.** Risco `P-161`.

### PF6D-D11 — **Uma âncora canônica** controla pino, alvo de toque, brilho, *scroll* e holofote do mapa
- **Status:** ✅ CONFIRMADA. **Fase 6 — infraestrutura.** Risco `P-154`.
- **Estado do código:** ⚠️ **CINCO derivações independentes** da mesma âncora, com **dois fatores
  de enquadramento divergentes** (`0.58` da câmera × `0.5` do `scrollPinIntoView`, este último com
  comentário afirmando usar *"a mesma geometria da câmera"* — o comentário **mente sobre o
  código**), estimativa de viewport que subtrai **56pt de barra inferior que não existe no
  tablet**, e uma divergência **latente** de aridade em `getStoryMapCoord`. Evidência completa em
  [`00_AUDITORIA_SOMENTE_LEITURA.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/00_AUDITORIA_SOMENTE_LEITURA.md) §4.2.

### PF6D-D12 — A primeira experiência de mapa e o *onboarding* sempre centram "Comece Aqui" / "A Criação"
- **Status:** ✅ CONFIRMADA. **Fase 6** entrega a capacidade de mirar; **Fase 7** escolhe o alvo.
  Riscos `P-154` (infra) e `P-156` (alvo).
- **Verificado no código:** as regiões existem — `adventureMap.js:56` (`comece_aqui`) e `:59`
  (`jovens_da_fe`).

### PF6D-D13 — O Cantinho do Beni **não** é obrigatoriamente ensinado no *onboarding*
- **Status:** 🧊 **CONGELADA** enquanto não houver propósito exclusivo aprovado. **Portão de
  Produto · Fase 7.** Risco `P-159`.

### PF6D-D14 — Monte a Cena desbloqueia quando `Historia ouvida = true`
- **Status:** ✅ CONFIRMADA. Atividades opcionais **não** bloqueiam. **Fase 12A.** Risco `P-165`.

### PF6D-D15 — Todos os jogos compartilham o **GameShell integral**
- **Status:** ✅ CONFIRMADA. **Fase 12A.** Risco `P-166`.
- **Consequência para a Fase 6:** a F6 entrega apenas a **geometria base** da família Jogo.

### PF6D-D16 — A conclusão do Colorir é centralizada; a obra da criança permanece protagonista
- **Status:** ✅ CONFIRMADA. **Fase 9.** Risco `P-163`.

### PF6D-D17 — A transição de cena usa pré-carga + proteção de toque duplo + troca atômica, com **zero** quadro vazio visível
- **Status:** ✅ CONFIRMADA. **Fase 9.** Risco `P-162`.

### PF6D-D18 — A Fase 6 **não** avança para o Bloco B2 antes do delta corrigido e revalidado
- **Status:** ✅ CONFIRMADA. **Vinculante e imediata.**
- **Efeito registrado:** o Bloco **B2** (acessibilidade e tipografia) da 021 está **BLOQUEADO**.
  B2 mede alvo de toque e tamanho de fonte; medir isso sobre uma fundação que ainda vai mudar de
  faixa e de orientação produziria resultado **descartável**.
- **ORDEM EXECUTIVA CANÔNICA DA FASE 6 — verdade única, ratificada no fechamento do Portão Humano 1
  (2026-08-09):**
  1. **`F6-R3`** · *Lifecycle & Resize Stability* — subportão `F6-SG-A`
  2. **`F6-R2`** · *Map Geometry Foundation* — subportão `F6-SG-B`
  3. **`F6-R1`** · *Adaptive Surface System* — subportão `F6-SG-C`
  4. **`F6-SG-D`** — **somente então** avaliar/desbloquear o Bloco **B2**
  - **Razão declarada pelo fundador:** a proteção de ciclo de vida, `resize`, orientação,
    continuidade de estado e integridade da obra infantil precisa existir **antes** de mudanças
    estruturais de geometria e adaptatividade. **`SD-8` continua bloqueador absoluto.**
  - **Os nomes NÃO mudam e nada foi renumerado:** `F6-R1` = *Adaptive Surface System* · `F6-R2` =
    *Map Geometry Foundation* · `F6-R3` = *Lifecycle & Resize Stability*. Muda **somente a ordem
    executiva**.
  - **A numeração `R1`, `R2`, `R3` é taxonomia dos pacotes de trabalho e NÃO representa ordem
    temporal.** Onde ela aparecer como catálogo, vale como catálogo; **em nenhum lugar vale como
    ordem de execução**.
  - **Ordem anterior, preservada e não apagada — histórica, SEM valor executivo:** o roteiro v4.1
    recebido enunciava `F6-R1` → `F6-R2` → `F6-R3`. Essa sequência **fica registrada como memória do
    que foi recebido** e **não pode ser lida, rotulada ou interpretada como ordem de execução**.
  - **Razão da mudança, registrada:** liberar orientação e faixas (`R1`) **antes** de existir
    proteção de ciclo de vida e de canvas (`R3`) exporia a arte da criança à destruição — e, com a
    correção de `D1` acima, o iPad **já gira hoje**, de modo que a fundação de segurança é o item
    **mais urgente**, não o último. `R2` precede `R1` porque a âncora canônica do mapa é
    pré-requisito da geometria que `R1` consome.
  - Esta emenda **substitui explicitamente** a ordem anterior. Nada foi apagado em silêncio.

### PF6D-D-CANVAS — Política canônica de canvas e rotação · ✅ **RESOLVIDA no Portão Humano 1**
- **Status:** ✅ **DECIDIDA pelo fundador em 2026-08-08.** Era a questão `Q2` do Clarify, que fica
  **RESOLVIDA**. Substitui integralmente o registro anterior 🟡 *NÃO DECIDIDA* e as opções (a)/(b)/(c)
  que ali constavam — **nenhuma delas foi adotada**.

- **Texto congelado, literal, do fundador:**

  > *"A obra da criança possui um espaço lógico próprio e imutável. A janela é apenas uma viewport
  > desse espaço. Rotação, resize, multitarefa, AppState, Control Center, background/foreground ou
  > qualquer mudança de viewport NÃO podem alterar, reinicializar ou corromper as
  > coordenadas/dimensões lógicas da obra."*

- **Colorir / modelo *raster*:**
  - o *canvas* lógico/*backing* fica atrelado à **dimensão canônica da arte**;
  - **não** redimensionar destrutivamente o conteúdo quando a *viewport* mudar;
  - **não** recriar `paint`/*buffers* apenas porque a tela mudou;
  - a *viewport* recalcula **somente a transformação de apresentação**;
  - toque e *hit testing* convertem coordenadas **tela → canônicas**;
  - preservar proporção; usar *letterbox*/*pillarbox* quando necessário;
  - **sem perda silenciosa**, **sem corrupção do preenchimento** (balde) e **sem pintura
    desalinhada do traço**.
- **Criar Livre / modelo vetorial:**
  - traços e carimbos **não** podem depender permanentemente de pixels da *viewport* corrente;
  - usar coordenadas lógicas **canônicas ou normalizadas**;
  - `resize` e orientação apenas **reprojetam a apresentação**;
  - a **compatibilidade com os dados existentes** deve ser definida **antes** de qualquer migração;
  - **nenhuma migração destrutiva**.
- **REGRA ABSOLUTA:** **`SD-8` continua bloqueador — ZERO perda ou corrupção de obra infantil.**
- **Vedação explícita:** **não é aceitável resolver `D1` simplesmente bloqueando as telas criativas
  em retrato.** A opção (a) do registro anterior — *congelar Colorir e Ateliê em retrato até a Fase
  9* — está, portanto, **rejeitada**.
- **O fato de código que motivou a política, mantido:** `src/screens/AtelierCanvasScreen.js:6`
  declara textualmente *"NUNCA redimensionam o canvas (o motor é uma WebView; mudar o tamanho
  reinicia o desenho)"*; em `ColoringCanvas`, `resize()` **não** recalcula `baseD`, `paintD`,
  `imgX/imgY/imgW/imgH` nem os *buffers* `qBuf`/`visBuf`. A política acima é exatamente o contrato
  que essa fragilidade viola hoje.

### PF6D-EXC-R3 — Exceção formal e estreita de escopo para `F6-R3` · ✅ **AUTORIZADA (futura)**
- **Status:** ✅ **AUTORIZADA pelo fundador no Portão Humano 1 (item 3)**, para vigorar **somente
  depois** de cumpridos os demais portões do fluxo SDD. **Não** é autorização de implementação
  agora.
- **O que `F6-R3` PODE alterar** — e **apenas** o estritamente necessário disso: as primitivas
  técnicas de **sistema de coordenadas**, ***resize***, **transformação de *viewport***, **ciclo de
  vida**, **preservação de estado** e **recuperação técnica** indispensáveis à rotação segura.
- **O que `F6-R3` NÃO PODE antecipar:** redesenho do Colorir · conclusão visual do Colorir ·
  *Story Home V2* · *Página Viva* · redesenho final do Criar Livre · política comercial ·
  `GameShell` · qualquer escopo de produto da **Fase 9** ou da **Fase 12A**.
- **Leitura obrigatória:** esta exceção **não** revoga a regra de que `F6-R3` não puxa escopo da
  Fase 9. Ela apenas reconhece que **a fundação técnica mínima da rotação segura pertence à Fase
  6** — sem a qual `D1` não pode ser entregue sem violar `SD-8`. Formalizada também na *spec* do
  delta (`01_SPEC_DELTA_F6_R1_R2_R3.md`) e no roteiro delta (`03_ROADMAP_v4.1_DELTA.md`).

### PF6D-Q1 — Identidade dos eixos `E` e `P` · ✅ **RESOLVIDA no Portão Humano 1**
- **Status:** ✅ **CONGELADA pelo fundador em 2026-08-08.** Encerra a questão `Q1` do Clarify e o
  achado `AD-1` da auditoria.
- **Decisão:** `E000–E089` é o **eixo EXECUTIVO** do roteiro mestre. `P-01–P-167` é o **eixo de
  RISCOS E PENDÊNCIAS**. São **taxonomias paralelas** e **não possuem relação obrigatoriamente
  1:1**: um `E` pode depender de vários `P`; um `P` pode aparecer ou revalidar-se em vários `E`.
  **Os `P` NÃO substituem, NÃO renumeram e NÃO absorvem os `E`.**
- **A ausência material de `E000–E089` neste repositório NÃO autoriza:** inventar entradas
  faltantes · recriar a série · migrar `E` para `P` · substituir o *checklist* mestre.
- **A ponte declarada adotada no `F6-DELTA0` está APROVADA.** *Crosswalks* do tipo
  `E028-R3 → P-152` **podem** ser registrados, desde que **não alterem a identidade de nenhum dos
  dois eixos**.
- **Árbitro de sequência:** `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` permanece o árbitro da
  sequência de fases.

### PF6D-EVID — Cinco fatos de código que sustentam este bloco

Todos verificados por leitura direta no HEAD `f10370e` da *branch* `feat/fase6-shell-splash`.
Auditoria completa em
[`00_AUDITORIA_SOMENTE_LEITURA.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/00_AUDITORIA_SOMENTE_LEITURA.md).

1. **`app.json`** declara `orientation: "portrait"` **global**, com `ios.supportsTablet: true` e
   `ios.infoPlist.UIRequiresFullScreen: false`. O projeto opera em **CNG** (não há `ios/` nem
   `android/`), portanto a orientação vem inteiramente da configuração e mudá-la exige **novo
   *build***, mas **nenhum código nativo**.
   - **Emenda do Portão 1:** essa chave global **não** é a única que decide. Como
     `ios.supportsTablet` é `true` e `ios.requireFullScreen` é falso, o *plugin*
     `withRequiresFullScreen` (`@expo/config-plugins/build/ios/RequiresFullScreen.js:55-67`)
     escreve **`UISupportedInterfaceOrientations~ipad` com as quatro orientações**, para atender à
     regra da Apple de multitarefa (`ITMS-90474`). **Por isso o iPad gira hoje.** No Android, ao
     contrário, `setAndroidOrientation` (`.../android/Orientation.js:21-33`) grava
     `android:screenOrientation` numa **chave única**, sem variante por *idiom* — daí o vão em
     **tablet Android**.
2. **O Split View do iPadOS já pode entregar larguras variáveis hoje**, sem nenhuma mudança de
   orientação, porque `UIRequiresFullScreen` é `false`. **A instabilidade de redimensionamento não
   é hipotética nem futura.**
3. **`ContentContainer`** aplica **uma** coluna de no máximo **640dp** a todas as famílias. Num
   iPad Pro em paisagem (~1366pt) isso deixa **~700pt de vazio lateral**.
4. **`AdventureMapScreen.js:367`** — `useEffect(() => { didInitScroll.current = false; },
   [mapWidth])` — faz **qualquer** mudança de largura descartar a posição de *scroll* da criança e
   puxar o mapa de volta à âncora da câmera. **Girar o iPad joga fora onde a criança estava.**
5. **Colorir e Ateliê são as únicas superfícies interativas sem escuta de `AppState`** (os quatro
   jogos têm), e **não existe uma única ocorrência** de `onContentProcessDidTerminate` ou
   `onRenderProcessGone` em todo o `src/` — de modo que **se** o processo de conteúdo da `WebView`
   for encerrado, a tela ficaria **em branco sem recuperação automática**.
   - **Correção de causalidade (emenda do Portão 1, item 6):** o que está **provado** é a
     **ausência de defesa**. **Não** está provado que abrir e fechar o Centro de Controle **causou**
     `onContentProcessDidTerminate` no aparelho do fundador — a execução física não capturou essa
     evidência. Registre-se, portanto, como **`HIPÓTESE CAUSAL PRIORITÁRIA / MECANISMO COMPATÍVEL
     COM A EVIDÊNCIA ESTÁTICA, AINDA NÃO CONFIRMADO EMPIRICAMENTE`**. A confirmação causal exige
     instrumentação e reprodução em `F6-SG-A`. **`P-152` e `P-164` permanecem, sem rebaixamento** —
     a incerteza é sobre a **causa**, não sobre o **risco**.

### PF6D-CLASSIFICACAO — Global × *canvas-specific*, exigida pelo escopo

| Camada | Fato | Fase proprietária | Código |
|---|---|---|---|
| **GLOBAL** | Não existe política de `resize` em lugar nenhum do aplicativo. O canvas é destrutível sob rotação e sob multitarefa — **e o iPad já gira hoje** (`PF6D-D1` emendada), de modo que a exposição é **presente**, não condicionada a liberação futura de paisagem. | **6** | `P-152` |
| **CANVAS-SPECIFIC** | Ausência de tratamento de término do processo da `WebView` e de revalidação por `AppState` nas duas telas de canvas; `resize()` do `ColoringCanvas` não recalcula estruturas raster nem buffers de BFS. | **9** | `P-164` |

**As duas ausências de defesa são reais, comprovadas e distintas** — e isso **independe** da
hipótese causal. A camada global **não seria** a explicação do sintoma do Centro de Controle; a
camada específica **não** protege contra rotação. Corrigir uma sem a outra deixa a exposição de pé.
**Qual delas — ou qual terceira causa — explica o sintoma observado permanece indeterminado**, e
determinar isso é tarefa instrumentada de `F6-SG-A`.

### PF6D-EMENDA-P1 — Emenda do Portão Humano 1 (2026-08-08) · veredito 🟡 condicional

O fundador aprovou **condicionalmente** o Portão Humano 1 do delta: *"a base documental foi aceita,
MAS ainda NÃO existe autorização para Plan, Tasks, Analyze ou Implement"*. O que se autorizou foi
**exclusivamente uma emenda documental** aos artefatos já produzidos. Registro do que a emenda
decidiu e do que apurou:

| # | Item | Resultado |
|---|---|---|
| 1 | `Q1` — identidade `E` × `P` | ✅ **RESOLVIDA** — ver `PF6D-Q1` |
| 2 | `Q2` — canvas e rotação | ✅ **RESOLVIDA** — ver `PF6D-D-CANVAS` |
| 3 | Exceção de escopo de `F6-R3` | ✅ **AUTORIZADA (futura)** — ver `PF6D-EXC-R3` |
| 4 | `D1` cobre **tablet Android** | ✅ corrigido em `PF6D-D1`; `O1` **rebaixada** |
| 5 | IPA físico × HEAD | ✅ reconciliado — abaixo |
| 6 | Causalidade WKWebView | ✅ **rebaixada a hipótese** — `PF6D-EVID` item 5 |
| 7 | `P-141` | ⬜ **NÃO alterada** — verificada e **correta**; ver abaixo |
| 8 | `P-103` | ⬜ **NÃO reclassificada** — permanece encaminhada à **Fase 7** |
| 9 | Ordem dos subportões | ✅ **emendada** — `SG-A` → `SG-B` → `SG-C` → `SG-D`, em `PF6D-D18` |
| 10 | `Q3`–`Q7` | Mantidas abertas com direções congeladas — `02_CLARIFY_E_CHECKLIST.md` |

**Item 5 — reconciliação exigida: binário fisicamente testado × configuração que o HEAD geraria.**
Os dois **não** são tratados como equivalentes; foram auditados **separadamente**, somente leitura,
**sem gerar *build*** e **sem baixar artefato do EAS**.

- **(A) Binário fisicamente testado:** *Development Client* iOS do *build*
  `10fce052-222b-4d9a-aad8-92467ccd8d1d`, origem nativa no *commit*
  `7c12987622d07a8e305e1930fdae45751afc65d9`, **resignado** para o iPad do fundador; o JS da Fase 6
  veio do **Metro**, não do binário.
- **(B) Configuração que o CNG do HEAD `93571c6` produziria** num *build* novo.
- **Prova de equivalência da fonte de orientação** — `git diff 7c12987..HEAD`: **`app.json` tem
  *diff* vazio** (byte a byte idêntico) e é a **única** fonte de orientação do projeto; **não
  existem** `app.config.js`, `app.config.ts` nem diretório `plugins/`; `eas.json` mudou apenas em
  variáveis `EXPO_PUBLIC_*` e no perfil `c60-pilot`, **nada de orientação, `idiom` ou Info.plist**;
  `package.json` mudou `expo ~54.0.35 → ~54.0.36` e acrescentou *scripts*.
- **Veredito:** **A e B produzem a mesma política de orientação** — e é por isso que o iPad girou.
  A evidência física e a evidência estática **agora concordam**; antes discordavam porque a leitura
  estática anterior estava incompleta.
- **Incerteza residual, declarada e não estimada:** o binário físico foi gerado com
  `@expo/config-plugins` **54.0.4** e o instalado neste *worktree* é **54.0.5**. O código da 54.0.4
  **não foi lido** — não está instalado. A diferença é de *patch* dentro do mesmo SDK 54, mas
  **isso é inferência, não prova**. Confirmação definitiva exigiria inspecionar o `Info.plist` do
  `.ipa`, o que **não foi feito**.

**Item 7 — `P-141`.** O fundador autorizou corrigir a estrutura daquela linha, condicionado a não
haver ambiguidade. **A correção não foi aplicada porque a linha não está defeituosa.** O relatório
anterior de *"24 colunas"* foi **erro da minha ferramenta de contagem**, que não honrava o escape
`\|` do Markdown. A leitura crua dos bytes mostra `` `profile.id \|\| profile.avatarId` `` —
corretamente escapado. Recontagem com verificador que honra o escape, sobre a matriz inteira:
**167/167 linhas com exatamente 22 colunas, zero divergências, zero células vazias, zero códigos
duplicados e sequência `P-01` … `P-167` sem lacunas**. A decisão da Fase 4D **não** foi reaberta e
nenhuma célula foi unificada. Detalhamento em
[`09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md)
§32.8.4.

**Item 8 — `P-103`.** Permanece `IMPLEMENTADO SEM CONSUMIDOR`, com a divergência registrada e
**encaminhada à Fase 7**. Nada reclassificado.

### PF6D-NAO-FEZ — O que este bloco **não** fez

Não implementou `F6-R1`, `F6-R2` nem `F6-R3`. Não alterou `app.json`, `eas.json`, `package.json`
nem nenhum arquivo de `src/`. Não instalou dependência. Não gerou *build*. Não executou validação
física. Não executou `npm run smoke` — por determinação explícita do fundador para esta etapa
documental. Não corrigiu nenhum defeito. **Não reclassificou nenhuma pendência existente**, em
particular **`P-103`**, cuja divergência com o comportamento observado está registrada como `Q7` do
Clarify e encaminhada à Fase 7. Não reabriu nenhuma decisão registrada. Não alterou as 22 fases da
`v5`. Não fez *push*, não fez *merge* e não trocou de *worktree*.

**A emenda do Portão Humano 1 também não fez:** não iniciou `plan.md`, `tasks.md`, `analyze` nem
implementação · não desbloqueou o Bloco **B2** · não instalou `expo-screen-orientation` nem
qualquer outra dependência · não escolheu entre as vias **A/B/C/D** de orientação · não gerou
*build* nem baixou artefato do EAS · não alterou runtime, *assets*, manifestos ou configuração de
*build* · não rebaixou `P-152` nem `P-164` · não reclassificou `P-103` · não alterou `P-141` · não
apagou a ordem anterior `R1 → R2 → R3`, que fica registrada com a razão da mudança **como memória
histórica, sem valor executivo** · não fez *push* e não fez *merge*.

---

## PF6R3X — Human Gate pós auditoria física · autorização restrita de `F6-R3.x` (2026-08-10)

- **Data:** 2026-08-10 · **Status:** ✅ **AUTORIZAÇÃO DE IMPLEMENTAÇÃO CONTROLADA**, concedida pelo
  fundador no Human Gate posterior à auditoria investigativa somente leitura.
- **Base:** *branch* `feat/fase6-shell-splash`, HEAD de entrada `daa12d3`, *worktree*
  `C:\tmp\ptf_fase6_shell_splash_wt`. Auditoria de **65 achados** em seis blocos (`A`–`F`).
- **Veredito literal do fundador:** *"AUDITORIA APROVADA COM EMENDAS."*
- ⚠️ **O que esta autorização NÃO é.** **`F6-SG-A` NÃO está concedido.** `F6-R2` / `SG-B` **não**
  está aberto. `F6-R1` / `SG-C` **não** está aberto. `B2` / `SG-D` **não** está aberto. Trata-se de
  **autorização de implementação controlada dentro de `SG-A`**, não de aprovação do subportão. A
  concessão depende de **nova revisão humana** e da **campanha física apropriada**.

### PF6R3X-BREAKPOINTS — Emenda obrigatória: a fronteira canônica é **900**, não 840

- **Correção de erro do agente, exigida pelo fundador.** O relatório de auditoria de 2026-08-10
  descreveu as famílias de largura como *"Medium 600–839 / Expanded ≥840"*. **Isso NÃO é canônico e
  não pode permanecer.**
- **Contrato canônico, único e não reabrível:**

  | Família | Faixa (dp) | *Token* |
  |---|---|---|
  | **COMPACTO** | `< 600` | `breakpoints.phone = 0` |
  | **MÉDIO** | `600 – 899` | `breakpoints.tablet = 600` |
  | **EXPANDIDO** | `>= 900` | `breakpoints.tabletL = 900` |

- **Consequência direta:** o **Samsung SM-X510 em retrato (~823 dp) é MÉDIO**, não Expandido. Toda
  leitura da campanha física precisa ser feita nessa faixa.
- **Correção do achado `B-06`:** a faixa **600–899 NÃO é indefinida**. O `ROADMAP v4.1` já a
  determina — **Médio (600–899):** barra lateral **compacta**, contêineres fluidos, sem largura
  rígida incompatível; **Expandido (>= 900):** barra lateral completa, composições multicoluna e
  painel de apoio. Portanto **`SG-C` deverá VERIFICAR se a barra lateral atual de 200 dp cumpre o
  contrato da faixa Média** — isso é conferência de contrato existente, **não** nova pergunta de
  produto.
- **Alcance da correção:** o valor `840` **não existia em nenhum artefato versionado** — a varredura
  encontrou apenas referências à linha `ParentAreaScreen.js:840`, que nada têm a ver com
  *breakpoint*. O erro viveu **somente no relatório de auditoria entregue em conversa**, e fica
  retificado aqui, que é o registro canônico.

### PF6R3X-EXC-T077 — Exceção formal e **extremamente restrita** ao controle de escopo `T077`

- **Status:** ✅ **CONCEDIDA pelo fundador em 2026-08-10**, exclusivamente para **encerrar a parcela
  da Fase 6 do risco `P-139`**.
- **O que `T077` diz.** A tarefa `T077` do Bloco B6 (`specs/021-fase6-shell-splash-sistema-visual/tasks.md`)
  proíbe alterar `src/services/performanceTrace.js` e aceita como evidência de conformidade *"`git
  diff` vazio **ou a justificativa escrita da exceção**"*. **Este registro É essa justificativa
  escrita.** `T077` **não** é apagada, **não** é revogada e continua valendo para tudo o que não
  esteja listado abaixo.
- **Permitido — e apenas o mínimo necessário disto:**
  1. tornar o coletor **efetivamente emissor**;
  2. garantir um **evento terminal** que **não dependa** de `home_first_layout` nem de
     `onboarding_first_layout`;
  3. permitir a habilitação no **perfil interno/preview já previsto**;
  4. manter `production` **desligado por padrão**;
  5. **preservar** os contratos existentes de boot e de *loading*.
- **PROIBIDO nesta exceção, textualmente:** instrumentar novas superfícies de produto · instrumentar
  áudio · instrumentar jogos · instrumentar Estrelinhas · criar *analytics* · criar telemetria
  infantil · mudar política de privacidade · expandir escopo para `F9` ou `F11`.
- **Compatibilidade com o registro de restrição de *Analytics*:** nada aqui cria SDK, evento
  remoto, identificador ou envio. O coletor **imprime uma linha local no log de desenvolvimento** e
  não sai do aparelho. As três camadas de `D-4E-ANALYTICS-3-CAMADAS` permanecem intactas.

### PF6R3X-ESCOPO — Os quatro itens executáveis, e nada além deles

| Item | Achados | O que foi autorizado |
|---|---|---|
| **`R3X-1`** | `P-139` · `F-03` | Tornar o coletor de desempenho **efetivamente emissor** dentro da parcela da Fase 6 |
| **`R3X-2`** | `F-04` | **Registro documental** (este verbete, §`PF6R3X-R3X2`) |
| **`R3X-3`** | `A-05` · `D-10` · `F-C5` · `F-08` · `B-11` | Observabilidade real de instâncias **VIVAS** de `MainTabs` |
| **`R3X-4`** | `A-03` | Corrigir **somente** o consumo do sinal residual `_pendingInitialTour` |

- **`R3X-3` — contrato exigido:** montagem incrementa vivos · desmontagem decrementa vivos · **vivos
  nunca pode passar de 1** · toda montagem precisa ter desmontagem correspondente · o registro
  precisa **distinguir remontagem normal de duas árvores simultâneas**. **Não alterar a navegação
  para "resolver" um problema ainda não comprovado.**
- **`R3X-4` — objetivo mínimo:** *"a requisição pendente precisa ser consumida exatamente uma vez
  mesmo quando `route.params.startBeniTour` já é `true`"*. **PROIBIDO:** alterar ordem do
  *onboarding* · alterar quantidade de passos · alterar texto · alterar destino · alterar áudio ·
  alterar *reset* · alterar `reviewMode` · alterar quais abas possuem guia · antecipar `F7`.
- **Item RETIRADO de `SG-A`:** o teste/correção de `spotHitboxDentroViewport` (achado `E-06`)
  **não** é executado agora. Move-se para o pacote preparatório de `SG-B` / `F6-R2`, por ser
  **geometria de mapa/viewport** e pertencer à *Map Geometry Foundation*. **Nenhum código funcional
  do jogo "Cadê a Ovelhinha" pode ser alterado.**

### PF6R3X-R3X2 — O que o coletor da Fase 6 mede, e o que ele **não** resolve

- **O coletor de `F6-R3.x` mede `boot` e `shell`** — marcos do arranque até o primeiro *layout* da
  rota inicial, mais o **evento terminal por teto** quando esse primeiro *layout* não chega.
- **Ele NÃO resolve a instrumentação de navegação** (achado `F-04`): tempo de transição entre telas,
  custo de foco/desfoco, latência de toque em destino de aba e correlação entre navegação e áudio
  **continuam sem instrumentação**.
- **A instrumentação posterior permanece com as fases proprietárias** de cada superfície. Este
  registro existe para que **ninguém leia a amostra de boot como se fosse medição de navegação**.

### PF6R3X-EVIDENCIA — Retificação do registro físico e protocolo de captura

- **RETIRADA de todo registro** a afirmação de que o log de 2026-08-10 provou *"≈21 s"* até a
  segunda montagem, e a afirmação de *jank* / pressão de memória do aplicativo. **As duas foram
  refutadas por evidência:** não há `Start proc` na captura, a primeira montagem não aparece, o
  intervalo está ocupado por nove toques respondidos em 1 ms — a latência real toque→remontagem é de
  **293 ms** — e **todas** as linhas de `Skipped frames` / `Davey!` pertencem a **outros PIDs**,
  sobretudo **PID 26398 = Samsung SmartCapture** (`buffSize=75MB`, 1.230 linhas). O PID do
  aplicativo aparece **zero** vezes nessas linhas.
- **Texto que substitui as afirmações retiradas, na forma exata determinada pelo fundador:**

  > *"a captura de 10/08 não possui evidência suficiente para quantificar a lentidão do app; eventos
  > severos observados eram majoritariamente de SmartCapture, enquanto P-139 impediu medição própria
  > adequada"*

- **Ressalva honesta preservada:** `Choreographer` só registra a partir de 30 quadros consecutivos
  perdidos. **A ausência de log não prova fluidez** — prova apenas que não houve travamento
  grosseiro.
- **Protocolo de captura física, agora normativo:**
  1. `adb logcat -c` **antes** da sessão;
  2. a captura **começa em `Start proc`** e cobre o arranque inteiro;
  3. o **PID é sempre correlacionado**;
  4. **nenhuma** linha de `Choreographer` / `HWUI` é atribuída ao aplicativo **sem conferência de
     PID**;
  5. **nenhuma** captura de tela, gravação ou `SmartCapture` fica ativa durante a medição.

### PF6R3X-CODIGOS — Governança documental registrada

1. **Dois códigos canônicos novos**, criados com os **próximos IDs livres**, **sem renumerar nem
   reutilizar código existente**: **`P-168`** (achado `B-01` — espaço de coordenada do *overlay*
   `embedded`) e **`P-169`** (achado `B-04` — reserva inferior dependente de cromo exclusivo de
   telefone). Ambos **comprovados pelo código**, ambos **congelados** nos seus subportões. Registro
   canônico em [`09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md)
   §33. **A matriz passa de 167 para 169 riscos.**
2. **Ressalva `A-02` anexada ao verbete `P-32`:** a correção prescrita *"remover em vez de gravar"*
   **seria um NO-OP se aplicada isoladamente**, porque o ramo legado de `onboardingService.js:88-97`
   reconstrói o estado quando a chave está ausente. Dívida de governança que a **Fase 7** herdaria
   sem saber. `P-32` **não** foi reclassificado.
3. **`E-01` registrado como BLOQUEADOR CRÍTICO DE LANÇAMENTO** — a `ExpoImage` da ovelha nunca
   recarrega entre rodadas, e o gate de prontidão trava permanentemente da rodada 2 em diante, em
   **100% das partidas no Modo Fácil**, independentemente de largura, *breakpoint*, área segura e
   orientação. **Fase proprietária: 12A.** **"Cadê a Ovelhinha" permanece DEV-GATED / EM TESTE** até
   a Fase 12A corrigir **e revalidar**. Cadeia causal anexada em §33.5 da matriz.
4. **`P-29` reavaliado documentalmente à luz de `B-05`, SEM fechar o risco:** a severidade `BAIXO`
   fica **declarada sob suspeita**; status, fase e classificação permanecem. A decisão pertence a
   `F6-SG-C`.

### PF6R3X-CONGELADOS — O que **não** pode ser tocado

- **`SG-B` / `F6-R2` — FECHADO:** `B-01`, `B-02`, `B-03`, `B-07`, `B-08`, `B-09`, `B-10`, `D-07`,
  `D-08`, `E-06`. **Não corrigir ainda a ruptura janela × superfície. Não corrigir *offsets*. Não
  tocar `MapAnchorRegistry` ainda. Não mexer no posicionamento visual do tour.**
- **`SG-C` / `F6-R1` — FECHADO:** `B-04`, `B-05`, `B-06`. **Não corrigir área segura ainda. Não
  redesenhar a barra lateral ainda. Não mudar composição Médio/Expandido ainda.**
- **Congelados para `F7`:** `A-01`, `A-02`, `A-04`, `A-07`, `A-08`, `B-12`, `F-C10`, `F-01`.
- **Congelados para `F8A`:** `F-C1`, `F-C2`, `F-C3`, `F-C6`, `F-C7`, `F-C8`, `F-C9`, `D-09`, `F-07`.
- **Congelados para `F11`:** `D-01`, `D-02`, `D-03`, `D-06`, `D-11`, `D-12`, `F-05`, `F-06`.
- **Congelados para `F12A`:** `E-01`, `E-02`, `E-03`, `E-04`, `E-05`.
- **Congelados para `F16`:** `F-02` e a racionalização dos *assets* do Beni.
- **Congelado para `F19`:** migração/versionamento do *onboarding* (`A-08`).

### PF6R3X-NAO-FEZ — O que este bloco **não** fez

Não concedeu `F6-SG-A`. Não abriu `SG-B`, `SG-C` nem `SG-D`. Não corrigiu a ruptura janela ×
superfície, *offsets*, `MapAnchorRegistry`, posicionamento do tour, área segura, barra lateral nem
composição de faixa. Não tocou em `onboardingService.js`, em `ovelhaTransition.js` nem em nenhum
código funcional de "Cadê a Ovelhinha". Não alterou ordem, passos, texto, destino, áudio, *reset*,
`reviewMode` nem a lista de abas com guia do *onboarding*. Não alterou a navegação. Não instrumentou
áudio, jogos, Estrelinhas nem qualquer superfície nova de produto. Não criou *analytics*, telemetria
infantil nem SDK. Não mudou política de privacidade. Não instalou dependência. Não gerou *build*.
Não executou validação física. Não fez *push* e não fez *merge*.

## `PF6SGA-GATE` — Human Gate de `F6-SG-A`: decisões `D-1`, `D-2` e `D-3` (2026-08-10)

Decisões de fundador tomadas na preparação da campanha física final de `F6-SG-A`, **antes** de
qualquer execução. **`F6-SG-A` NÃO está concedido.** `SG-B`, `SG-C` e `SG-D` continuam fechados.

### `PF6SGA-D1` — Tablets: coberturas **complementares**, não substitutas

**Samsung Android NÃO substitui iPad.** `F6-SG-A` preserva **as duas** validações: **(i)** tablet
Android no **Samsung SM-X510**; **(ii)** tablet iOS em **iPad**.

- **NÃO emendar o §27** do [`04_PLAN_DELTA_F6.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/04_PLAN_DELTA_F6.md)
  para tornar *"iPad"* equivalente genérico a *"tablet"*. O critério permanece **literal**.
- **Emendar apenas a premissa caduca do §33** — *"nenhum tablet Android físico está disponível (P8)"*.
  **Hoje existe Samsung SM-X510 disponível e fisicamente utilizado** (Android 16, 1440×2304,
  densidade 280, `fontScale` 1.15 — faixa **MÉDIO**, ≈823 dp em retrato). Emenda aplicada.
- A rota condicional de `F6-SG-C` no fim do §33 permanece **inalterada e ainda por decidir**.

### `PF6SGA-D2` — `CN-1` exige **telefone físico real**

§28 **#17** / **`CN-1`** continua exigindo **telefone físico real**. O **SM-X510 é tablet e NÃO
satisfaz `CN-1`**. **Não escolher arbitrariamente modelo inexistente.** A campanha só marca `CN-1`
como `PASS` **depois** de execução em telefone real compatível; até lá o item é **`NÃO EXECUTADO`**,
nunca `PASS` e nunca `FAIL`.

### `PF6SGA-D3` — `T090` / `F-PERF` / `P-139` vira **complemento obrigatório** do gate

Embora `T090` **não** constasse da lista literal original do §27, o fundador determina que
**`T090` / `F-PERF` / `P-139` passa a ser complemento obrigatório do Human Gate de `F6-SG-A`**.

- **Razão:** `F6-R3.x` modificou infraestrutura *F6-owned* **especificamente** para tornar `P-139`
  verificável, e **`SG-B` não será aberto deixando essa implementação fisicamente não provada**.
- **Registro honesto:** isto é **complemento posterior** do gate. **Não** se afirma que fazia parte
  da redação histórica original do §27.
- **Consequência:** um **novo *build* `preview` Android pós-`456ac1b`** é necessário — Android e iOS
  não têm artefato utilizável (os `preview` Android expiraram em 2026-07-16 e 2026-06-10; o `preview`
  iOS vigente foi construído de `eb871f5`, cujo `eas.json` **não** contém
  `EXPO_PUBLIC_PTF_PERF_TRACE`, adicionada só em `456ac1b`; e não há rota OTA — sem `expo-updates`,
  sem `runtimeVersion`, sem bloco `updates`, sem `channel`). **NÃO gerado agora.**

### `PF6SGA-ORDEM` — Ordem operacional **congelada** e rodadas `R1`–`R7`

1. campanha do **Development Build inteira**; 2. **inventário e backup do acervo**; 3. **iPad**;
4. **telefone**; 5. **só então** gerar/instalar **Preview Android**; 6. executar **`T090`/`P-139`** e
as validações de áudio apropriadas; 7. **Human Gate final**.

Rodadas: **`R1`** `G-PRE` + `targetSdk` + *cold start*/`MainTabs` + `A-03` · **`R2`** casos canônicos
independentes de rotação (`1, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17`) · **`R3`** *resize*/rotação
(`2, 3, 4, 5, E2, E3`, conforme executabilidade real) · **`R4`** caso 13 (*rollback*), isolado ·
**`R5`** extras restantes + cenários §28 de `SG-A` · **`R6`** iPad + telefone/`CN-1` · **`R7`**
Preview Android + `T090`/`P-139` + áudio.

> **Regra de parada:** qualquer **`FAIL` relevante** numa rodada ⇒ **PARAR antes da rodada seguinte**,
> **classificar** e **reportar**. **Não corrigir automaticamente.**

### `PF6SGA-ANDROID` — Correção operacional da rota Android

**Removidos do roteiro como requisito:** mesma rede **Wi-Fi**, **QR Code** e **descoberta automática
de servidor**. A rota preferencial, **já fisicamente comprovada**, é **USB + ADB +
`adb reverse tcp:8081 tcp:8081` + Development Build + *deep link* explícito para `localhost:8081`**.

- Pré-voo obrigatório: `adb reverse --remove-all` → `adb reverse tcp:8081 tcp:8081` →
  `adb reverse --list`. **O gate NÃO exige saída literal:** o ambiente pode imprimir
  `UsbFfs tcp:8081 tcp:8081`, e **prefixo de transporte é permitido**. Aceite: **exatamente um
  mapeamento relevante contendo `tcp:8081 tcp:8081`**. **`FAIL` de pré-voo** só se o `8081` do tablet
  não apontar para o `8081` do host.
- ***Deep link* canônico — forma URL-encoded**, que é a fisicamente comprovada:
  `pequenostracosdefe://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081`. Usada tanto no
  *cold start* quanto nas reaberturas.
- **Não usar apenas `MainActivity` como prova de *bundle* atual.**
- ***Cold start*:** a captura começa **antes** da abertura, em **três janelas PowerShell
  independentes** — `PS1` Metro, `PS2` controle ADB, `PS3` `adb logcat`. `PS3` fica **em primeiro
  plano** e é encerrada explicitamente com **Ctrl+C**. **Não usar `Start-Process`**; `Tee-Object`
  **não** é necessário — a forma canônica é
  `adb logcat -v threadtime | Out-File "…\raw.log" -Encoding utf8`. **Preservar o `raw.log`
  íntegro**; filtros são arquivos **adicionais**.
- **Backup binário do estado persistido:** **não** usar `adb exec-out … > arquivo.tar` direto no
  PowerShell 5.1 (o `>` trata a saída como texto e corrompe o TAR). Rota canônica: **(1)** inspeção
  somente-leitura com `adb shell run-as com.valentedev.pequenostracosdefe ls -la` para identificar
  quais de **`files`**, **`databases`** e **`shared_prefs`** existem; **(2)** redirecionamento pelo
  **`cmd.exe /c "adb exec-out run-as … tar cf - <dirs> > …\appdata.tar"`**, ajustado aos diretórios
  realmente existentes; **(3)** validação obrigatória — `Get-Item`, `Get-FileHash … -Algorithm
  SHA256` e, se disponível, `tar -tf`. **O backup só é declarado válido se puder ser lido/listado.**
  Se `run-as` estiver indisponível: **registrar a limitação**, **não** contornar com root, **não**
  usar `pm clear`, **não** desinstalar, seguir só com inventário visual onde permitido.

### `PF6SGA-LANDING` — Superfície de abertura **não é gate** de `F6-SG-A`

Fica **removida** de qualquer rodada a exigência de *"deixar chegar ao mapa"* como critério de
`PASS`. Depois do *cold start*: **aguardar o *runtime* estabilizar** · **registrar a superfície real
em que abriu** · **confirmar `MainTabs`** · **executar a navegação de *shell* prevista**.

Se o app abrir em **Home** em vez de Aventuras/Mapa: **registrar**; **NÃO reprovar `SG-A`** por esse
motivo; **NÃO corrigir**; **não transformar a rodada em `F7`**. A **primeira jornada** e a
**obrigatoriedade semântica do Mapa** pertencem à **`F7`**, que permanece congelada.

### `PF6SGA-ROTACAO` — Como registrar rotação no Android

`targetSdk` é **entrada crítica**, porém **não decide isoladamente** a rotação: **o comportamento
físico efetivo continua sendo a prova**. Se a rotação permanecer bloqueada, **não alterar `F6-R1.1`
durante `SG-A`** — os cenários dependentes viram **`NÃO EXECUTÁVEL`**. **A política canônica de
orientação continua congelada para `F6-SG-C`.**

### `PF6SGA-E1E6` — `E1`–`E6`: não bloqueantes **automáticos**, mas classificados

`E1`–`E6` permanecem, documentalmente, **não bloqueantes automáticos** de `F6-SG-A`. **Todo `FAIL`
em `E1`–`E6` é classificado por severidade ANTES da concessão.** Um `FAIL` que revele **`P0`/`P1`**
ou **violação de invariante ZERO** **não pode ser ignorado apenas porque o caso é extra**.

### `PF6SGA-NAO-FEZ`

Este bloco é **documental**. Não alterou *runtime*. Não gerou *build*. Não iniciou Metro. Não tocou
o aparelho. Não tocou *storage*. Não executou campanha física. Não concedeu `F6-SG-A`. Não abriu
`SG-B`, `SG-C` nem `SG-D`. `F7`, `F8A`, `F11` e `F12A` permanecem congeladas. Não fez *push* nem
*merge*.

> ⚠️ O escopo do parágrafo acima é **o bloco documental de 2026-08-10** (*commit* `aced9d3`) e **não
> é retroativamente alterado**. O bloco **seguinte** (`PF6SGA-R1BLOCK01`) é outro, **posterior**, e
> **alterou** *runtime* — sob autorização própria.

## `PF6SGA-R1BLOCK01` — `R1-BLOCK-01`: defeito bloqueante achado na **RODADA 1** (2026-08-10)

**Primeiro defeito encontrado pela campanha física de `F6-SG-A`.** A `R1` foi **interrompida por
`FAIL` físico antes do `A-03`**. Nenhum item físico virou `PASS`.

### 1. O que foi observado no aparelho

Samsung **SM-X510**, Android **16**, `targetSdk` **36**, *Development Build*, Metro canônico na pasta
correta, porta **8081**, Metro **PID 27940**, `adb reverse 8081 -> 8081`, app **PID 4262**. O app
carregou e chegou ao primeiro *onboarding*. Em seguida, no `logcat`:

```
[shell] MainTabs MONTADO     montagens #1 vivos 1/1 pico 1 desmontagens 0 pareado
ReferenceError: Property 'montagensRef' doesn't exist          (componentStack: at MainTabs)
[shell] MainTabs DESMONTADO  montagens #1 vivos 0/1 pico 1 desmontagens 1 pareado
```

Uma ocorrência, em `src/navigation/AppNavigator.js` linha **261**.

> **Os números `1/1` e `0/1` NÃO são `PASS` do cenário `MainTabs`.** Eles provam apenas que o
> mecanismo de `R3X-3` funciona e é pareado. A execução foi **abortada antes** das trocas de aba e
> do ciclo de vida — o cenário permanece **NÃO EXECUTADO**.

### 2. Causa raiz — **provada**, não presumida

| Evidência | Resultado |
|---|---|
| `git grep -n montagensRef -- src scripts` | **uma única** ocorrência: `AppNavigator.js:261` (o consumidor). Nenhuma declaração. |
| `git blame -L 254,266` | linha **261** vem de **`064dd76`** (2026-08-09); linhas 255–256 vêm de **`456ac1b`** (2026-08-10). |
| `git diff 456ac1b^ 456ac1b -- src/navigation/AppNavigator.js` | `456ac1b` **removeu** `let mainTabsMounts = 0;` e `const montagensRef = useRef(0);` e reescreveu o primeiro `useEffect`. O *hunk* **termina antes** do segundo `useEffect` — o consumidor da linha 261 ficou de pé. |
| Análise de escopo (`@babel/parser` + `scope.hasBinding`) | `montagensRef@261` é o **único** identificador sem *binding* em `MainTabs` — e o único em **326** módulos de `src/` (+ `App.js`). |

**Classificação: regressão de `F6-R3.x`.** O defeito foi introduzido pela própria instrumentação de
`SG-A`. **Não** é `F7`, **não** é `SG-B`, **não** é `SG-C`.

### 3. Por que nenhum portão automatizado pegou

O *bundle* é **sintaticamente válido**. Um identificador livre só falha quando o caminho é
**avaliado** — e o `useEffect` de faixa só roda no aparelho.

- **`npm run smoke` (4879/4879 verde antes)** — não avaliava a árvore de `MainTabs`; nenhum lacre
  fazia análise de escopo.
- **`npm run bundle:check`** — `expo export:embed` **compila** e escreve o *bundle*; não executa.
- **`npx expo-doctor` (18/18)** — audita **configuração de projeto**, não escopo de código.
- O projeto **não tem ESLint**, logo não há `no-undef` em lugar nenhum.

O buraco era de **análise de escopo**, e é ele que a prova nova fecha.

### 4. Correção e prova (*commit* `aa58849`)

- **Correção mínima:** a linha 261 passa a **LER** a contagem da autoridade já existente —
  `shellLifecycleSnapshot('MainTabs').montagens`. O fragmento `ainda na montagem #…` **não** foi
  apagado: ele é a evidência `CN-6`/`TK-A-022` da travessia de 600dp sem remontagem (faixa muda,
  número não muda ⇒ foi *re-render*).
- **`shellLifecycleTrace` continua sendo a autoridade única.** Nenhuma segunda fonte de verdade,
  nenhum `useRef` local reintroduzido, nenhum `export` novo, nenhuma variável escolhida por palpite.
- **Prova de regressão, sem dependência nova** (`@babel/parser` e `@babel/core` já eram exigidos pelo
  próprio `smoke.js`): análise de escopo real, não busca textual.

| Lacre | O que sela |
|---|---|
| `T-e1` | `MainTabs` não referencia identificador sem declaração/autoridade |
| `T-e2` | nenhum dos **326** módulos de `src/` (+ `App.js`) referencia identificador sem declaração, fora do **ambiente RN declarado** |
| `M9` | reinjetar a referência órfã em `MainTabs` **derruba** `T-e1` |
| `M10` | identificador órfão em outro módulo do *shell* **derruba** `T-e2` |

- **Vermelha antes:** `4879/4883`, `T-e1` apontando `montagensRef@261`.
- **Verde depois:** `4883/4883`.
- **Mutante executado no arquivo real** (não só em memória): reinjetada a referência legada, `npm run
  smoke` saiu com **`exit 1`** e `4879/4883`, `T-e1` apontando `montagensRef@267`. Mutante revertido
  com `git checkout --` **depois** do *commit* da correção; árvore limpa.

### 5. Consequência para a campanha

1. **A `R1` deve ser REPETIDA DO INÍCIO.** A execução anterior é descartada como rodada de validação.
2. O **`HEAD` a validar** passa de `456ac1b` para **`aa58849`** (§0 do `06_PROTOCOLO…`).
3. O *Development Build* instalado **continua servindo** — a correção é JS servido pelo Metro, e não
   houve mudança nativa nem em `eas.json`/`app.json`/dependências. O `preview` de `D-3` (§2.4) segue
   pendente e agora deve sair de `aa58849` ou posterior.
4. **`F6-SG-A` continua NÃO CONCEDIDO.** `SG-B`, `SG-C`, `SG-D`, `F7`, `F8A`, `F9`, `F11` e `F12A`
   permanecem **congeladas**.

### `PF6SGA-R1BLOCK01-NAO-FEZ`

Não gerou *build*. Não iniciou Metro. Não tocou o aparelho. Não executou `A-03`. Não marcou qualquer
item físico como `PASS`. Não concedeu `F6-SG-A`. Não abriu `SG-B`. Não fez *push* nem *merge*.

## `PF6SGA-R1-VEREDITO` — Fechamento formal da `RODADA FÍSICA 1` repetida (2026-08-11)

**Veredito: `R1` — CONTEÚDO OBSERVADO SEM ANOMALIA · `PASS` NÃO FORMALIZÁVEL.**
**Não é `PASS`. Não é `FAIL`. Não é `NÃO EXECUTADO`.** Registro completo, com as tabelas de
observação, em `specs/021-…/delta-v4.1/06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md` **§7.2**.

**Por que não é `PASS`.** O comportamento saiu limpo em **todos** os pontos que a `R1` exercita —
`targetSdk 36` lido no aparelho; *cold start* com PID correlacionado (`Start proc 9913`; complemento
`14015` com PID inicial = final); `MainTabs` `montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 ·
pareado`; 3 idas e 3 voltas entre abas + *background* ~5 s + *foreground* com `MONTADOS=1`,
`DESMONTADOS=0`, `ANOMALIAS=0` e zero `duas_arvores_vivas`; **zero `montagensRef`**, **zero
`ReferenceError`**; `A-03` conforme. O impedimento é **formal**: o protocolo é literal em §3.3 —
*"se as quatro confirmações não forem obtidas, **nenhum** cenário abaixo pode ser marcado como
`PASS`"* — e o **pré-voo foi executado sem ser arquivado**.

**As 5 pendências são de ARQUIVO, não de comportamento** (`R1-PEND-1..5`, detalhadas em §7.2): saída
dos quatro `Write-Host` + `git diff --stat aa58849..HEAD`; cabeçalho do Metro exibindo a pasta;
linha do Metro registrando a requisição do *bundle*; `adb reverse --list` da rodada; `raw.log`
íntegro + atestação do *deep link* URL-encoded em **todas** as aberturas. **Nenhuma exige repetir a
rodada** — fechadas as cinco, `R1` vira `PASS` por leitura direta.

**Não houve `FAIL` relevante**, logo a regra de parada de §3.4 **não** foi acionada.

### `PF6SGA-R1-VEREDITO-A03`

O *onboarding* que aparece em uma das gravações **foi solicitado explicitamente pelo fundador**.
**Não** é reaparecimento espontâneo e **não** pode ser classificado como regressão. Observado: abre
1× sob solicitação explícita · não reaparece após troca de telas/abas · nem após
*background/foreground* · nem após *force-stop* e nova abertura · nova solicitação explícita reabre
legitimamente. **A semântica de `F7` não foi alterada.**

### `PF6SGA-R1-VEREDITO-P139`

`P-139` emitiu no *Development Build* (schema 2 · terminal `first_layout` · `route Home` ·
`fontGateMs 277` · `routeDecisionMs 38` · `splashReactMs 808` · `firstLayoutMs 3204` ·
`profileHydrationMs 33` · `progressHydrationMs 58` · `packsHydrationMs 23` · `bufferDropped 0`).
⛔ **Isto NÃO fecha `T090`/`F-PERF`/`P-139`**, que é da `R7` e exige o par `preview` **com**
`PERF_TRACE` × `production` **comprovadamente sem** (`D-3`). É insumo de `R3X-1`.
🔧 **Correção de §2.4:** como o Development Build **também** emite `[PTF_PERF_SAMPLE]`, esse marcador
**deixa de ser discriminador de perfil**; na `R7` vale a **ausência de `[shell]`**.

### `PF6SGA-R1-VEREDITO-AMBIGUIDADES`

Registradas, **não** resolvidas por conta própria: (1) §3.4 diz "três confirmações", §3.3 lista
**quatro** — vale a leitura conservadora, **as quatro**; (2) `G-PRE` tem duas definições divergentes
(§3.4 × `08_SEQUENCIA…:328-337`) — prevalece a de §3.4; (3) o backup do acervo é de **§4.0**, não da
`R1` — tê-lo adiantado é compatível, e o TAR validado (16.803.840 bytes, `SHA256 5014004…9CE1F`)
**serve** para a `R2`.

### `PF6SGA-R1-VEREDITO-NAO-FEZ`

Não marcou nenhum caso de §28.1 como `PASS`. Não fechou `T090`. Não abriu `SG-B`, `SG-C`, `F7` nem
`F8A`. Não corrigiu nada do inventário visual. Não executou `R2`. **`F6-SG-A` continua NÃO
CONCEDIDO.**

## `PF6SGA-R2-GATE` — Human Gate de liberação da `RODADA FÍSICA 2` (2026-08-11)

**Decisão do fundador. Congelada.** Autoriza a preparação imediata e a **execução guiada** da
`RODADA FÍSICA 2` de `F6-SG-A`, resolvendo os dois vãos canônicos declarados no fechamento da `R1` e
fixando a regra de integridade histórica. Escopo, ordem, topologia e proibições permanecem os já
formalizados em [`10_RODADA_FISICA_2_F6_SG_A.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/10_RODADA_FISICA_2_F6_SG_A.md).

**Estado canônico de entrada conferido antes da execução:** `C:\tmp\ptf_fase6_shell_splash_wt` ·
`feat/fase6-shell-splash` · `HEAD 04bd479` · árvore **LIMPA** · `git diff --stat aa58849..HEAD`
**exclusivamente documental** (`docs/` + `specs/`). Qualquer alteração inesperada em *runtime* é
**STOP**.

### `CASO8-ANDROID-01` — equivalência Android do "Centro de Controle" (**vão eliminado**)

Para fins **exclusivos do Caso 8 (`TK-A-070` · §28.1 #8) em Android**, a expressão canônica
*"Centro de Controle"* passa a ser **operacionalmente interpretada** como a superfície Android
equivalente composta pelo **painel de notificações** e pelas **Configurações rápidas** do sistema,
**acessadas pelo gesto a partir da borda superior da tela**.

Limites da decisão — todos explícitos:

- a equivalência é **exclusivamente operacional para Android**;
- **não** altera a semântica do caso no **iOS**;
- **não** autoriza usar **outras páginas das Configurações do Android** como substitutas (abrir o
  app *Configurações*, ir a uma tela de ajuste, usar o menu de energia ou a tela de recentes **não**
  satisfaz este caso);
- o **objetivo comportamental do teste permanece intacto**: cobrir a **interrupção parcial**,
  distinta do segundo plano pleno do Caso 7. O critério de `PASS` continua sendo *"igual ao caso 7"*
  (gate `G-LFC-2`), e qualquer divergência do Caso 7 é `FAIL`.

**Efeito:** o vão canônico do Caso 8 está **eliminado**. O caso deixa de ser "executável
condicionado" e passa a **executável**. A escolha continua sendo **registrada no veredito** — não
porque ainda haja dúvida, mas porque a rastreabilidade exige dizer qual superfície foi usada.

### `CASO12-PARCIAL-01` — cobertura parcial autorizada do Caso 12

Na `R2` está **autorizada a execução física** da variante **"*kill* durante a gravação"** — a única
executável com a infraestrutura atualmente autorizada (`06` §3.4).

Os **quatro estágios injetados** (*criar · persistir · validar · reler*), que dependem de **harness
de injeção**, permanecem **`NÃO EXECUTADOS`** nesta rodada. Decorre disso, sem exceção:

- **não** criar harness agora;
- **não** ampliar o *runtime*;
- **não** transformar ausência de execução em `PASS`;
- **não** inferir resultado; **não** simular evidência.

**Natureza da autorização:** ela permite a **continuidade** da `R2` — **não** é dispensa permanente.
A pendência dos quatro estágios fica **preservada sob o árbitro canônico do Caso 12
(`TK-A-074` · §28.1 #12)**, para tratamento futuro **caso ainda seja exigida**. O veredito do Caso 12
na `R2` será, no máximo, **`PASS` com cobertura declaradamente PARCIAL**, com o vão nomeado.

### `R1-PROVENIENCIA-01` — integridade histórica da `R1` (regra dura)

Está autorizado usar o **Bloco 0 da `R2`** para **repetir e arquivar controles equivalentes** às
pendências formais `R1-PEND-1..5` — **desde que o protocolo atualizado permita formalmente esse
saneamento** (ver `PF6SGA-R2-GATE-SANEAMENTO` abaixo).

🔴 **É terminantemente proibido representar evidência nova, obtida durante a `R2`, como se fosse
artefato histórico originalmente preservado durante a execução da `R1`.**

Sempre que uma evidência estiver sendo **refeita**, o registro deve conter, literalmente:

> *"Evidência originalmente não arquivada na `R1`. Controle repetido e arquivado durante o pré-voo
> da `R2`."*

Proibições correlatas, sem exceção:

- **não** fabricar *timestamps* históricos;
- **não** renomear um `raw.log` novo como se fosse o `raw.log` original da execução passada — o
  arquivo desta sessão é `C:\tmp\ptf_evidencias\R2\raw.log` e **assim permanece nomeado**;
- **não** reconstruir evidência ausente por inferência;
- **não** declarar retroativamente nada que a **cadeia de custódia** não sustente.

### `PF6SGA-R2-GATE-SANEAMENTO` — o protocolo **NÃO permite** saneamento administrativo

A condição posta pelo fundador (*"desde que o protocolo atualizado permita formalmente esse
saneamento"*) foi **auditada literalmente** contra
[`06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md)
no `HEAD 04bd479`.

**VEREDITO: NÃO PERMITE.** Não existe **uma linha sequer** que autorize **reexecutar** um controle de
pré-voo em outro momento e arquivá-lo como evidência da rodada anterior. O bloqueio decorre dos
qualificadores temporais das próprias pendências, em §7.2:

| Pendência | Redação literal | Saneável depois? |
|---|---|---|
| `R1-PEND-1` | *"do momento da rodada"* | **NÃO** |
| `R1-PEND-2` | *"cabeçalho do Metro exibindo …"* — sem qualificador | **OMISSO** |
| `R1-PEND-3` | *"requisição do bundle **agora**"* (§3.3 #2 — prova de **instante**) | **NÃO** |
| `R1-PEND-4` | *"saída … **da rodada**"* | **NÃO** |
| `R1-PEND-5` | *"`raw.log` **íntegro preservado**"* — registro da execução, não do ambiente | **NÃO** |

**Também não há proibição expressa:** busca literal por `contemporân`, `custódia`, `mesma execução`,
`mesma sessão`, `simultân`, `reaproveit`, `timestamp`, `carimbo` retorna **zero ocorrências**. O
protocolo é **omisso sobre o instituto** e **restritivo nas células**. Precedente hermenêutico do
próprio arquivo (caso *"três × quatro confirmações"*): **em dúvida, leitura conservadora**.

**Tensão registrada, não escondida.** §7.2 diz *"Fechadas as cinco, `R1` vira `PASS` … sem repetir a
rodada"*. É o único apoio textual plausível à tese oposta. Mas o mesmo parágrafo descreve o remédio
como **guardar o que já esteve diante dos olhos** — *recuperar* artefato existente (*scrollback*,
buffer, print já tirado) —, e *"sem repetir a rodada"* nega repetir **o comportamento no aparelho**,
não autoriza reexecutar o pré-voo depois.

**Decisão aplicada, conforme a instrução do fundador para este ramo:**

- o veredito da `R1` fica **PRESERVADO COMO ESTÁ** — **`CONTEÚDO OBSERVADO SEM ANOMALIA · PASS NÃO
  FORMALIZÁVEL`**;
- **`R1-PEND-1..5` permanecem ABERTAS.** O Bloco 0 da `R2` **NÃO** as fecha;
- fica **revogada** a afirmação em contrário que constava de
  [`10_RODADA_FISICA_2_F6_SG_A.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/10_RODADA_FISICA_2_F6_SG_A.md)
  §1 e Bloco 0 — ela era **conclusão minha, não regra canônica**, e a auditoria a derrubou.

⚠️ **Isto NÃO bloqueia a `R2`.** A regra dura de §3.3 é **por sessão**: a `R2` produz **as suas
próprias** quatro confirmações no Bloco 0, contemporâneas à sua execução. A validade dos casos da
`R2` **não** depende do arquivo da `R1`. A afirmação anterior de que *"enquanto `R1-PEND-1..5` não
forem fechadas, todo `PASS` desta rodada é inválido"* era **excesso meu** e está corrigida.

**Pendência aberta para Human Gate futuro — não decidida aqui:** os cenários cobertos pela `R1`
(`G-PRE`, `targetSdk`, *cold start*/`MainTabs`, `A-03`) continuam **sem evidência formalizável**. O
Bloco 0 da `R2` reexecuta fisicamente parte deles (*cold start*, `MainTabs`, `targetSdk`) e produzirá
evidência **nova e contemporânea** — o que é **reexecução do cenário**, não saneamento da `R1`.
Se essa evidência nova basta para os itens de `SG-A` cobertos pela `R1`, **é decisão do fundador**, e
está registrada aqui como **em aberto**. Alternativa: suprir a lacuna de redação de §7.2 (dizer o que
**é** fonte admissível de arquivo de pré-voo) por Human Gate próprio.

## `PF6SGA-R2-S1-LACRE` — lacre documental da `R2 · Sessão 1` (2026-08-11)

**Veredito único e final da sessão:** **`R2 · SESSÃO 1 = SUSPENSA POR AUSÊNCIA DE INSUMO LEGADO`.**

Não é `PASS`. Não é `FAIL`. **Nenhum caso da `R2` foi executado.** Os Casos **1, 15, 14, 16 e 10**
permanecem **sem insumo**. **`F6-SG-A` continua NÃO CONCEDIDO** e **`R1-PEND-1..5` continuam
ABERTAS**. Nada desta sessão pode ser reutilizado como evidência de execução de uma sessão futura.

**Causa.** O Bloco 0 fechou **CONFORME**, mas o `TAR-1` provou que **o acervo do SM-X510 está
vazio** — nenhuma obra do Ateliê, nenhuma do Colorir 60, nenhum ponteiro `{"v":3,…}`, nenhum *blob*
em `files/ptf_blobs/`. Três inventários independentes (10/08 20:24, 10/08 23:35, 11/08 03:17)
concordam, e `@ptf_migration_status_v1 = {"fromVersion":0,"toVersion":3,"changed":[],"errors":[]}`
confirma instalação limpa. A conduta prescrita pelo canônico para esse estado é **parar e reportar**
(`10_RODADA_FISICA_2` §7 #8 e Caso 14; `07_CAMPANHA`; `08_SEQUENCIA`) — e foi o que se fez.

### Estado físico observado na retomada de controle

Retomada em **`2026-08-11T12:22:34.058-03:00`**. Aparelho **`RX2XC003LTJ`** · `model: SM_X510` ·
*package* `com.valentedev.pequenostracosdefe`.

| Superfície | Estado observado na retomada |
|---|---|
| Metro / porta 8081 | **sem *listener*** |
| `node.exe` | **nenhum processo** |
| `adb logcat` | **nenhum processo** |
| *Worktree* histórico `C:\tmp\ptf_colorir_canonical_runtime_wt` | `HEAD 7de7085` · `docs/e015-phase3-artifacts` · `git status --porcelain` **VAZIO** |
| *Worktree* canônico `C:\tmp\ptf_fase6_shell_splash_wt` | `HEAD b1faf8d` · `feat/fase6-shell-splash` · `git status --porcelain` **VAZIO** |

O ADB havia sido encerrado e, ao ser reiniciado, imprimiu `daemon not running; starting now at
tcp:5037` / `daemon started successfully`. **Isto NÃO é falha** — é reinício normal do *daemon*, e
explica o `adb reverse --list` vazio descrito adiante.

### 🔴 Regra de honestidade aplicada ao encerramento — `S1`…`S5`

O encerramento ocorreu em **retomada de recuperação**, não em sessão contínua. O registro abaixo é o
que **de fato** aconteceu:

| Passo | O que era | O que ocorreu |
|---|---|---|
| **`S1`** | inventário de suspensão | **EXECUTADO** — `TAR-SUSPENSAO.tar` gerado |
| **`S2`** | `am force-stop` | **EXECUTADO** — sem erro e sem saída |
| **`S3`** | `Ctrl+C` no `logcat` | **NÃO APLICÁVEL à retomada de recuperação** |
| **`S4`** | `adb reverse --remove-all` | **EXECUTADO** |
| **`S5`** | `Ctrl+C` no Metro | **NÃO APLICÁVEL à retomada de recuperação** |

- **`S3`:** *não aplicável à retomada de recuperação; a captura `logcat` já estava encerrada quando a
  sessão foi retomada. **Nenhum novo `logcat` foi iniciado e nenhum `logcat -c` foi executado.***
- **`S5`:** *não aplicável à retomada de recuperação; o Metro já estava encerrado quando a sessão foi
  retomada. **Nenhum novo Metro foi iniciado.***

⛔ **Está proibido converter isso em `PASS` fictício de `Ctrl+C`.** O que se registra é **encerramento
de recuperação com estado factual observado** — não a execução de um passo que não houve.

### Artefatos lacrados — tamanho, `SHA256` e *timestamps*

Todos os valores abaixo foram **recomputados de forma independente** no lacre e batem com o reportado
pelo operador.

| Artefato | Tamanho (bytes) | `SHA256` |
|---|---|---|
| `C:\tmp\ptf_evidencias\R2\raw.log` | **8.065.745** | `B40E2CEB43BA7E313699D52F0536169307F0BFAECA71B2D509F663EAE3A6274B` |
| `…\R2\acervo\TAR-SUSPENSAO.tar` | **16.806.912** | `8486DEC65C2A61834B54C5B8FCB54FD5BDEE6B8DD7BF76B9359443F0E2FF1BA7` |
| `…\R2\acervo\TAR-1.tar` | **16.806.912** | `9E64680E963718F96AB916433D375C378373428D964DBFD9BBE512A2780591C1` |
| `…\R2\BLOCO-0_FECHAMENTO.md` | 4.890 | `1673429B4DC9DF2BF576923F3F1B689423C921B1726DA244059B79B089D1B23A` |
| `…\R2\ACHADO-01_ACERVO_VAZIO.md` | 4.541 | `191DD5EC7336B4126068D76940276879B7661EB81A871D43EBFD25F73D85F813` |
| `…\R2\INCIDENTE-01_PASSO2_PASTA_ERRADA.md` | 3.581 | `057ABD0F2C65007D5679EC42D4FDEF2B1E1ED9F2851D197CA08E3DC3AE157DC0` |

*Timestamps* (hora local do posto de trabalho): `raw.log` **criado 11/08 03:21:00**, **última escrita
11/08 04:06:06**; `TAR-SUSPENSAO.tar` **criado 11/08 12:24:26**, **última escrita 11/08 12:24:27**;
`TAR-1.tar` **última escrita 11/08 03:17:21**.

> ⚠️ **Não se reescreve o passado.** O registro anterior mencionava **03:49:10** como *"última
> escrita conhecida naquele momento"*. Aquela afirmação estava **correta quando foi escrita**. A
> inspeção posterior mostrou **`LastWriteTime` final 04:06:06** — e é esse o valor de lacre.

**`TAR-SUSPENSAO` NÃO é `TAR-2`** e **não entra na cadeia canônica como `TAR-2`**. Ele é **artefato de
encerramento da campanha suspensa**. Seu tamanho é idêntico ao do `TAR-1` e seu digesto é diferente —
o que é esperado, já que o contêiner `tar` carrega metadados do instante da captura. **Tamanho
idêntico não é prova de identidade de conteúdo**; a comparação byte a byte **não foi executada** neste
lacre e **não é requisito dele**.

`TAR-1.tar` e `raw.log` ficam preservados como **evidência histórica imutável**. Os artefatos da
Sessão 1 **não são modificados, renomeados nem substituídos**.

### Higiene final executada

`am force-stop` do *package* — **sem erro e sem saída**. `adb reverse --list` retornou **VAZIO já
antes** da remoção; após `adb reverse --remove-all`, `--list` seguiu **VAZIO** — coerente com o
reinício do *daemon* ADB antes da retomada.

**Não** houve: abertura do app, interação física, Metro, captura, `logcat -c`, `adb install`,
`adb uninstall`, `pm clear`, *root* ou troca de binário.

### `R2-ACH-01-ERRATA` — precisão do marcador, sem alterar a conclusão

A tabela *"O que **NÃO** existe"* de `ACHADO-01_ACERVO_VAZIO.md` cita como marcador de obra de
colorir a chave **`@ptf_drawing_s<story>_c<cena>`** (`storageKeys.js:101`) — **namespace aposentado**,
cujo *writer* (`saveDrawingState`) está **órfão** e sem chamador em `src/`. O *namespace* **vivo** do
Colorir 60 é **`@ptf_drawing60_s<storyId>_a<activityId>`**, e o do Ateliê é
`ptf_atelier_arts_v1_*` — este último **está** listado na tabela; o do C60 **não estava**.

**A conclusão do achado permanece íntegra e não é revista.** A varredura ampla registrada no próprio
documento (`drawing`, `atelier`, `arts`, `canvas`, `colorir`, `coloring`, `strokes`, `png`, `jpeg`,
`base64`, `sketch`, `obra` — **0 ocorrências de cada**) **já cobre** o *namespace* do C60, assim como
a ausência total de `{"v":3,…}`, de `file://` e de qualquer arquivo em `files/ptf_blobs/`.

🔴 **O corpo original de `ACHADO-01` NÃO foi reescrito.** Esta errata é **acréscimo**, registrado aqui
e no pacote operacional da `R2`; a evidência lacrada permanece como estava.

### `PF6SGA-R2-S1-NAO-FEZ`

Não concedeu `PASS` nem `FAIL` a caso algum. Não executou os Casos 1, 15, 14, 16 ou 10. Não concedeu
`F6-SG-A`. Não fechou `R1-PEND-1..5`. Não fabricou obra, *fixture* ou *timestamp*. Não instalou,
desinstalou nem limpou dados. Não alterou `src/`, `scripts/`, `package.json`, `app.json` ou
`eas.json`. Não tocou o *worktree* histórico além de leitura.

## `PREP-LEGADO-01` — produzir acervo legado com o **writer histórico real**, sem trocar binário (2026-08-11)

**Decisão do fundador. Congelada.** Autoriza uma **sessão de preparação separada**, que produz obras
**genuínas** executando o JavaScript histórico do commit **`7de7085`** no **mesmo *dev client* já
instalado**. Não é caso da `R2`, não concede `PASS` e não concede `F6-SG-A`.

### A fronteira que o projeto **não** cruza

O projeto **não autoriza fabricar *fixture* para substituir proveniência histórica**. Continuam
proibidos, sem exceção: sintetizar JSON, escrever no `AsyncStorage` por terminal, editar registro,
fabricar arquivo de *blob*, converter obra moderna em formato antigo, ou produzir qualquer artefato
cujo único propósito seja fazer um caso passar. O canônico é literal: *"Não fabricar obra 'legada' —
isso destruiria o valor do caso"*.

### Por que é viável sem tocar no binário

Fato técnico verificado: **o projeto não tem `expo-updates`, `runtimeVersion` nem `channel`** — há
*gates* ativos em [`scripts/smoke.js:4174-4186`](../scripts/smoke.js) e
[`:4452-4456`](../scripts/smoke.js) **exigindo a ausência**. Logo o *dev client* **só carrega JS do
Metro**, e **o escritor é 100% JavaScript**. **Trocar o escritor não exige trocar o binário: exige
trocar o Metro.**

- Runtime histórico servido **exclusivamente** do *worktree* `C:\tmp\ptf_colorir_canonical_runtime_wt`
  com `HEAD` obrigatoriamente **`7de7085`** — o último commit antes da mudança de *payload* da Fase 6.
- Esse *worktree* é **SOMENTE LEITURA**: proibido `commit`, `checkout`, `switch`, `reset`, `rebase`,
  `merge`, `stash`, alteração de arquivo, `npm ci` e qualquer instalação ou atualização de dependência.
- **Nenhum APK é instalado.** Proibidos `adb install`, `adb install -r`, `adb uninstall`, `pm clear`,
  *root*, alteração de assinatura e alteração de `versionCode`. O acervo existente é **preservado**.
- A preparação vive em `C:\tmp\ptf_evidencias\PREP-LEGADO\`, com `raw.log` e TARs **próprios**.

### Por que o Ateliê é o veículo de grau probatório

O Ateliê grava `stateJson` **inline e verbatim** dentro do registro `ptf_atelier_arts_v1_<id>`
([`src/services/atelierStorage.js:121`](../src/services/atelierStorage.js) e
[`:138`](../src/services/atelierStorage.js)). Em `7de7085` o `exportState` produz
`{"v":2,"strokes":…,"stamps":…,"bgColor":…}` — **sem** `paintSchemaVersion`, `layoutVersion`,
`logicalW` e `logicalH`, que só nascem no `HEAD`
([`src/components/AtelierCanvas.js:607-610`](../src/components/AtelierCanvas.js)). A **ausência desses
eixos é verificável byte a byte no TAR** — é **prova**, não indício.

### Por que o Colorir 60 **não** serve como prova discriminável

O *writer* do C60 **descarta os eixos na escrita**
([`src/services/coloring60DrawingStorage.js:390-401`](../src/services/coloring60DrawingStorage.js)):
o ponteiro leva apenas `v/fmt/uri/mime` + `W/H/imgX/imgY/imgW/imgH/rev/paintedPx/paintablePx`,
montado **campo a campo, sem *spread***, e o arquivo de *blob* recebe **só os bytes do PNG**.
`paintSchemaVersion` e `layoutVersion` **nunca alcançam o disco, em veículo nenhum, nem em `7de7085`
nem no `HEAD`**. Uma obra C60 dos dois runtimes é, no armazenamento, **estruturalmente
indistinguível**.

**Consequência congelada:** o C60 **não** pode ser apresentado como prova discriminável da variante do
Caso 14 cuja distinção depende de estrutura persistida ausente. **Heurística de geometria não
substitui prova quando o contrato exige prova.**

> ### `ERRATA-C60-EIXOS-01` — a premissa desta subseção **caducou no `HEAD`** (2026-08-15)
>
> **Correção aditiva. Nenhuma linha acima foi reescrita, apagada ou reordenada** — o texto original
> permanece como registro do que era verdade quando foi lavrado.
>
> **O que mudou.** O commit **`2ffcd82`** — *"fix(f6): persistir os campos logicos do payload atraves
> do ponteiro do Colorir 60"*, **2026-08-14 16:53:20 -0300**, um arquivo, **+46 / −2** — acrescentou a
> [`src/services/coloring60DrawingStorage.js`](../src/services/coloring60DrawingStorage.js):
>
> ```js
> const LOGICAL_SCHEMA_FIELDS = ['paintSchemaVersion', 'layoutVersion', 'logicalW', 'logicalH'];
> function carryLogicalSchema(source, target) { … }   // :395
> ```
>
> chamado em **`writeSlot`** (`:442`) e em **`resolvePointer60`** (`:489`).
>
> **Efeito literal sobre o parágrafo acima.** A frase *"`paintSchemaVersion` e `layoutVersion` **nunca
> alcançam o disco, em veículo nenhum, nem em `7de7085` nem no `HEAD`**"* passa a ser **falsa para o
> `HEAD`**. Ela continua **verdadeira para `7de7085`** e **verdadeira para o binário `521d59c`** — que
> é anterior a `2ffcd82`. A referência de apoio do parágrafo, `coloring60DrawingStorage.js:390-401`,
> aponta hoje **exatamente para o código que o refuta** (`:392` e `:395-402`).
>
> **O que NÃO muda:**
>
> 1. **A conclusão do Caso 14 permanece intacta.** O Ateliê continua sendo o veículo de grau
>    probatório, e `CASO14-V1-INEXECUTAVEL-01` (logo abaixo) não depende deste parágrafo.
> 2. **A perícia de campo continua válida.** `13_PREP_LEGADO_03.md` §5 verificou a ausência dos quatro
>    eixos no acervo do SM-X510 por busca recursiva **e** por *substring* nos bytes brutos do SQLite.
>    O acervo lacrado **não** tem os eixos: `2ffcd82` só afeta escritas **futuras**.
> 3. **Ler não promove.** `coloring60DrawingStorage.js:384-386`: *"só o SAVE seguinte escreve o formato
>    novo (write-forward) … **Ler não promove, não migra e não regrava**"*.
>
> **Consequência operacional, e é a que importa.** Em Development Build o JS vem do Metro, não do APK
> (*"Trocar o escritor não exige trocar o binário: exige trocar o Metro"*, acima). Logo **qualquer
> sessão física servida a partir do `HEAD` grava os quatro eixos no ponteiro `v:3` a cada
> salvamento** — o que muda o valor probatório de tudo que for salvo nela. O *checkpoint* `CK-JS` e a
> arbitragem `ARB-JS-BINARIO` existem por causa disto:
> [`39_SF1_BLOCO_3_R5_E_PROTOCOLO_UNICO.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/39_SF1_BLOCO_3_R5_E_PROTOCOLO_UNICO.md)
> §3 e §12.1.
>
> **Esta errata não decide nada.** Não concede `PASS`, não altera classificação histórica e não
> reabre o Caso 14. Registra um fato de código verificado e nomeia onde ele passa a pesar.

### `CASO14-V1-INEXECUTAVEL-01` — a variante `v1` não tem *writer* reproduzível

A variante `v1` (data URL crua gravada direto no `AsyncStorage`) recebe a classificação
**`INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`** — que **não é `PASS` e não é `FAIL`**.

Fundamentação auditada sobre os **550 commits** de todos os *refs*:

1. **`POINTER_VERSION` nasceu valendo `3` e nunca valeu outra coisa.** Em
   [`drawingStorage.js`](../src/services/drawingStorage.js) a constante surge em `e02a3d1`
   (2026-06-11) já com `3`; antes disso ela **não existia**. Em
   [`coloring60DrawingStorage.js`](../src/services/coloring60DrawingStorage.js) ela nasce em `a0881a2`
   (2026-07-22), também `3`. **`v1`/`v2`/`v3` são formatos do VALOR armazenado, não valores de
   `POINTER_VERSION`.**
2. **Nenhum *writer* versionado jamais produziu `v1`.** Desde o primeiro commit que traz `src/`
   (`7484a5b`, 2026-06-01), o único produtor de *payload* é `ColoringCanvas.exportPaint`, que emite
   `{v:2,…}`. A *pickaxe* `-S'window.exportPaint=function'` reconhece **exatamente 3 revisões**, e as
   três emitem `v:2`. `v1` aparece **só em ramos de leitura**, rotulados `Legacy format (v1)` desde o
   dia zero.
3. **O formato antecede o próprio histórico.** O commit-raiz (`8d44c70`, 2026-05-19) é *scaffold*
   vazio — 13 arquivos, sem `src/`, **sem `@react-native-async-storage/async-storage` instalado**.
   **Ressalva honesta:** se algum *build* anterior ao histórico disponível produziu `v1`, isso é
   **`NÃO DETERMINADO` por este repositório** — comentário de código não é prova de execução. O que é
   auditável e definitivo: **nenhum *writer* reproduzível existe**.
4. **O *writer* legado está órfão desde `d5f7541` (2026-07-31 13:21:27).** `saveDrawingState` não tem
   chamador em `src/` nem em `App.js`, e **já não tinha em `7de7085`** — o runtime histórico **não
   consegue** gravar em `@ptf_drawing_s<story>_c<cena>` por via de pintura. O próprio repositório trava
   isso como teste em
   [`scripts/testing/artworkVersionHarness.js:1288-1298`](../scripts/testing/artworkVersionHarness.js)
   (caso `13.7` · `TK-A-096`), com o leitor vivo no Livrinho (caso `13.8`).
5. **Corolário:** `buildPointer` só atribui `fmt = 1` quando o *payload* é data URL
   ([`drawingStorage.js:58-65`](../src/services/drawingStorage.js)). Como `v1` nunca é produzido,
   **`{"v":3,"fmt":1,…}` também é inalcançável por escrita genuína** — só entraria por migração de um
   dado `v1` preexistente.

Produzir um `v1` agora exigiria **acrescentar um chamador inexistente** e **fazê-lo passar uma data URL
crua que nenhum canvas do projeto sabe produzir**. Seria **fabricação de evidência, não reprodução de
legado**.

**Limite explícito:** a decisão vale **para a variante `v1`** e **não** se generaliza automaticamente
para qualquer outra variante do Caso 14 que venha a ser executável.

### `CASO14-JANELA-V2` — correção histórica

A janela real do *writer* **`v2` inline** é **`7484a5b` (2026-06-01) → `e02a3d1` (2026-06-11
19:38:41)**, quando o ponteiro nasceu. ⛔ **Não usar o dado antigo `deda774`**, que constava de
registro anterior e está **corrigido aqui**. Sem efeito prático sobre o plano: nenhuma etapa usa
commit da era `v2` inline.

### Allowlists de persistência — derivadas do código, não adivinhadas

Antes da primeira interação física, `ALLOWLIST_ATELIER` e `ALLOWLIST_C60` foram **derivadas por
leitura do código de `7de7085`** (o *worktree* histórico **não** foi tocado) e fixadas em disco em
`C:\tmp\ptf_evidencias\PREP-LEGADO\ALLOWLISTS.md`. **Escrita fora da allowlist do veículo em uso =
STOP. Alteração não prevista de registro preexistente = STOP.**

**`ALLOWLIST_ATELIER`** — criações: `ptf_atelier_arts_v1_<id>` (`<id> = art_<epoch_ms>_<0..9998>`) e
`ptf_atelier_arts_v1_index`; arquivos `ptf_blobs/atelier/<id>_preview.jpg` (q=0.85) e
`<id>_thumb.jpg` (q=0.60, 300 px). ⚠️ **Modificações ESPERADAS de registros preexistentes**, ambas já
presentes no `TAR-1`: `@ptf_criar_livre_orientation_seen_v1:<profileId>` (no **primeiro traço**) e
`@ptf_achievements_seen` (500 ms **após** o salvar). **Sem esta pré-declaração, o diff probatório
dispararia um STOP falso.** O salvar **não apaga arquivo algum**.

**`ALLOWLIST_C60`** — cinco chaves: `@ptf_drawing60_s<storyId>_a<activityId>`, `…_done_…`, `…_snap_…`,
`…_ever_…` e `@ptf_coloring60_finale_seen_<storyId>` — **esta última só no 3/3 inédito: se aparecer
com uma única obra, é STOP**. Arquivo: `ptf_blobs/drawings60/_ptf_drawing60_s…_a….a.png` (a primeira
gravação sempre escreve o *slot* `.a`). Com **uma** gravação por atividade, o esperado é **zero
remoções**.

**Conjunto de destinos idêntico nos dois runtimes:** o `git diff` entre `7de7085` e `b1faf8d` sobre
**todos** os serviços de persistência dos dois fluxos retorna **vazio**. Mudaram apenas
`AtelierCanvas.js`, `AtelierCanvasScreen.js`, `ColoringCanvas.js` e `ColoringScreen.js` — **conteúdo
do *payload* e apresentação, nunca destino de escrita**. **Nenhum destino nasceu, sumiu ou foi
renomeado**, o que torna o diff probatório interpretável sem ambiguidade.

**Ponto deixado em aberto pela auditoria:** `payloadHasPaint`
(`coloring60DrawingStorage.js:337-347`) exige `data.length > 1000`; abaixo disso o salvar cai no ramo
**inline** e **não** cria arquivo. **Mitigação operacional:** exigir tinta abundante e conferir que o
*blob* existe.

### Cadeia de custódia — emendas obrigatórias do fundador

1. **Dois TARs.** `TAR-PRE-LEGADO.tar` **antes** de servir `7de7085` ao aparelho e **antes** de criar
   qualquer obra; `TAR-LEGADO.tar` **depois**. Ambos em `C:\tmp\ptf_evidencias\PREP-LEGADO\`, com
   tamanho, `SHA256`, *timestamp*, `HEAD` canônico, `HEAD` histórico, estado das árvores,
   identificação do dispositivo e *package*. *"O objetivo não é apenas provar que existem obras depois
   da preparação. É provar exatamente o que mudou."*
2. **Allowlist por veículo**, derivada do *writer* real — ver seção acima.
3. **Proveniência por conjunto.** Provar qual Metro serviu o *bundle* **não** pode depender de uma
   única linha de terminal: *worktree*, `HEAD`, porta, unicidade do servidor na porta, `adb reverse`,
   pedido do dispositivo e resposta do Metro precisam **convergir**.
4. **Paralelização** autorizada **apenas** para tarefas de leitura. A **execução física no Samsung
   permanece serial**, com **um único condutor**. Nenhum agente pode modificar o *worktree* histórico.
5. **Registro canônico antes da execução física** — esta entrada, em commit **documental isolado**.

### `logcat -c`

A futura **`R2 · Sessão 2`** é campanha **independente**, com Bloco 0 próprio, e **pode** executar seu
próprio `adb logcat -c`. Isso **não** autoriza apagar, substituir ou renomear qualquer log da Sessão 1,
cujos artefatos ficam **imutáveis**. A `PREP-LEGADO` **não** pressupõe `logcat -c` e usa `raw.log`
próprio.

### Condições de **STOP** da `PREP-LEGADO`

*Worktree* histórico com `HEAD` diferente de `7de7085` ou árvore suja · Metro fora da 8081 ou servido
de outra pasta · mais de um servidor na porta · `adb reverse` com mapeamento inesperado · escrita fora
da allowlist do veículo · alteração não prevista de registro preexistente · `@ptf_coloring60_finale_seen_*`
com uma única obra · ausência do *blob* após o salvar · qualquer necessidade de instalar, desinstalar
ou limpar dados · qualquer *crash* de montagem.

**STOP significa:** não improvisar, não corrigir silenciosamente, não continuar para obter um
resultado — **preservar o estado e reportar**.

### `PREP-LEGADO-01-NAO-FEZ`

Esta entrada **registra e autoriza. Ela NÃO executa.** Até este commit: não se iniciou a
`PREP-LEGADO`; não se iniciou Metro; não se abriu o app; não se iniciou `logcat`; não se executou
`logcat -c`; não se instalou nem substituiu binário; não se desinstalou; não se usou `pm clear` nem
*root*; não se alterou `src/`, `scripts/`, `package.json`, `app.json` nem `eas.json`; não se tocou o
*worktree* histórico além de leitura. **Nenhum caso da `R2` foi executado. `F6-SG-A` continua NÃO
CONCEDIDO e `R1-PEND-1..5` continuam ABERTAS.**

## `PREP-LEGADO-02-ESCOPO` — matriz de insumos e protocolo corrigido (2026-08-11)

**Protocolo completo:**
[`specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/11_PREP_LEGADO_02.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/11_PREP_LEGADO_02.md).
Esta entrada **congela as decisões**; ela **não executa nada**.

### Causa-raiz da `PREP-LEGADO-01`

A allowlist da `PREP-01` foi derivada dos *writers* do **artefato**, não dos *writers* da **rota
física**. Ficaram de fora (a) o **portão de gravação do Ateliê** — `ATELIER_FREE_SAVE_LIMIT = 0`, que
exigia o **Modo Criador** e portanto gravava `@ptf_creator_qa_mode` — e (b) a **rota narrativa de
chegada ao Colorir 60**, que grava `@ptf_progress_creation` (`useProgress.js:29` ← `NarrationScreen.js:186`)
e `@ptf_coloring60_milestone_invite_seen_*` (`coloring60MilestoneInviteSeen.js:61` ← `NarrationScreen.js:216`).
**Não houve desvio do operador:** as três escritas são consequência determinística da rota prescrita.

### Decisões congeladas do fundador

| ID | Decisão |
|---|---|
| **`D-PREP02-01`** | A `PREP-LEGADO-01` **permanece `STOP`**. Sem ampliação retroativa de allowlist, sem admissão retroativa do artefato, sem apagar chave, sem refazer `TAR`, sem descartar artefato. |
| **`D-PREP02-02`** | A **`PREP-LEGADO-02` será executada** — em sessão futura, após Portão Humano. |
| **`D-PREP02-03`** | *Baseline* = **`TAR-PRE-LEGADO.tar`**, **não** "aparelho limpo" — é o *baseline* já lacrado e byte a byte igual ao `TAR-SUSPENSAO`. |
| **`D-PREP02-04`** | A `PREP-01` é **imutável**. As evidências da `PREP-02` vão para `C:\tmp\ptf_evidencias\PREP-LEGADO-02\`. **Nenhum arquivo antigo pode ser sobrescrito.** |
| **`D-PREP02-05`** | O **Modo Criador** é pré-requisito técnico **legítimo** para salvar obra do Ateliê no *runtime* `7de7085` em plano grátis. Altera **permissão**, não *payload* — `performSave` não ramifica em `unlimited`. |
| **`D-PREP02-06`** | A rota narrativa **cena 1 → cena 2 → marco** **não** será usada, salvo se algum caso a exigir. Nenhum exige. |
| **`D-PREP02-07`** | **Nenhuma execução física** na etapa de congelamento. |

### Escopo mínimo: **OPÇÃO B — Ateliê + Colorir 60**

O Ateliê **sozinho não basta**. Prova por caso:

- **Caso 16** (`TK-A-078`) exige **ponteiro `v:3`**. `atelierStorage.js:114-125` grava
  `{ …, schema: 2, stateJson, previewUri }` — **sem envelope `v:3`**. `drawingStorage.js` está
  **aposentado** (`saveDrawingState:130` sem chamadores em `7de7085` **e** no `HEAD`). O único
  *writer* acionável de `v:3` é `coloring60DrawingStorage.js:421`. ⇒ **C60 obrigatório.**
- **Caso 1** (`TK-A-063`) exige pintura **alinhada ao *lineart*** e nomeia `ColoringCanvas.js`
  (`loadPaint`) — símbolo **inexistente** em `AtelierCanvas.js`, que tem `loadState`. ⇒ **C60 obrigatório.**
- **Caso 10** (`TK-A-072:1209`) nomeia **`ColoringScreen.js` E `AtelierCanvasScreen.js`**. ⇒ **ambos.**
- **Casos 14 (`v2`) e 15** — **Ateliê é suficiente e é o veículo de grau probatório**: grava
  `stateJson` **inline e literal**, tornando a ausência de `paintSchemaVersion`/`layoutVersion`/
  `logicalW`/`logicalH` verificável byte a byte.

**Compatibilidade com o congelamento anterior:** continua verdadeiro que o C60 **não discrimina**
*runtime* histórico de atual na **variante estrutural do Caso 14**. Os Casos 1, 10 e 16 **não pedem
discriminação estrutural** — pedem geometria, igualdade de bytes e envelope, estabelecíveis pela
**cadeia de custódia**. A variante **`v1` do Caso 14 permanece `INEXECUTÁVEL`**
(`CASO14-V1-INEXECUTAVEL-01`).

### Allowlist lógica corrigida

**Rota B — Colorir 60, com o Modo Criador DESLIGADO** (executada **primeiro**, para isolar o *flag*):
**exatamente quatro chaves `ADDED`** — `@ptf_drawing60_screation_a<activityId>` ·
`@ptf_coloring60_done_*` · `@ptf_coloring60_snap_*` · `@ptf_coloring60_ever_*`. **Zero `CHANGED`, zero
`DELETED`.** O C60 grava **em qualquer plano** e **nunca consulta plano/rede**
(`coloring60DrawingStorage.js:18,507`); o piloto aparece por `__DEV__` (`internalTools.js:24-26`), sem
depender do Modo Criador.

> **Correção de `PREP02-ROTA-C60-CHECK-01` (2026-08-11):** a versão anterior desta lista incluía
> `@ptf_achievements_seen` (`CHANGED`) na Rota B. **Está errado.** O único *writer* é
> `achievementsStorage.js:27`, alcançável apenas por `useAchievementCelebration` — montado somente em
> `AtelierCanvasScreen.js:63`, `CongratsScreen.js:123`, `QuizScreen.js:33` e `StoryBookScreen.js:204`.
> Nenhuma tela da Rota B usa o *hook*. A chave permanece prevista **só** na Rota A.

**Rota A — Ateliê, com o Modo Criador LIGADO:** `@ptf_creator_qa_mode` ·
`ptf_atelier_arts_v1_index` · `ptf_atelier_arts_v1_<artId>` (`ADDED`) · `@ptf_achievements_seen`
(`CHANGED`) · **`@ptf_criar_livre_orientation_seen_v1:star` — reescrita com valor idêntico `'1'`
permitida; qualquer outro valor ⇒ `STOP`**. Esta última é a lacuna que faltava na `PREP-01`:
`AtelierCanvasScreen.js:173` chama `hideOrientation()` no **primeiro traço**,
**incondicionalmente**, e a chave **já existe** no `TAR-PRE` com `'1'`.

**Excluídas por construção — presença ⇒ `STOP`:** `@ptf_progress_creation` ·
`@ptf_coloring60_milestone_invite_seen_*` (nenhum dos dois *writers* é alcançado fora de
`NarrationScreen`) · **`@ptf_creation_colorir_invite_shown_v1`** (`coloring60JourneyInvite.js:41` ←
`StoryDetailScreen.js:274`, barrada por `coloring60Journey.js:731` — `storyScenesComplete !== true`
com o *baseline* restaurado) · `@ptf_coloring60_finale_seen_*`.

### `D-PREP02-08` — a porta do Colorir 60 é a **Área dos Pais**, não o `StoryDetail`

**Microauditoria `PREP02-ROTA-C60-CHECK-01` (somente leitura, `7de7085`).** A `AUDITORIA-PREP-STOP-01`
e o protocolo da `PREP-02` pareciam contraditórios. **Não são** — a contradição era da rota escrita, e
ela estava errada.

**O que a auditoria provou.** `StoryDetailScreen.js:571-573` renderiza a seção do piloto com
`unlocked={isCompleted}`, e `isCompleted` (`:132`) é `progressCount >= totalScenes && totalScenes > 0`.
Com o *baseline* restaurado não há `@ptf_progress_creation` ⇒ `progressCount = 0` ⇒ `unlocked = false`
⇒ `coloring60Journey.js:363` marca as três fichas como `LOCKED` e `:378-379` deixa `primaryAction`
**nulo** (o CTA nem é renderizado, `CreationColoringJourneySection.js:254`); as fichas ficam
`disabled` e com `onPress` indefinido (`:141-142`). **`VISIBLE` ≠ `ENABLED`:** a seção aparece
(`StoryDetailScreen.js:139-142`, por `__DEV__`), mas **nada nela é acionável**. A conclusão anterior —
"o cartão do `StoryDetail` exigiria `10/10`" — **está correta**.

**A rota executável.** `ProfileScreen.js:323` → **Área dos Pais** → seção **🛠️ Administração (dev)**
(`ParentAreaScreen.js:1118`, gate `isInternalToolsEnabled()` em `:66`, que `internalTools.js:24-26`
satisfaz **só com `__DEV__`**, sem Modo Criador) → cartão **"Colorir 60, A Criação"** → **"Abrir Luz"**
(`:1186`). Os parâmetros despachados — `{ storyId: 'creation', activityId: 'light' }` — são **os
mesmos** que `planC60OpenEditorFromStory` (`coloring60Navigation.js:135`) produziria; `origin` e
`resumeCenaIndex` (exclusivos de `planC60OpenEditorFromMilestone`, `:155`) ficam ausentes nas duas.
**Mesmo editor, mesmo *writer* (`ColoringScreen.js:352,435`), mesmo *payload*, nenhuma semeadura.** O
*runtime* já reconhece essa porta como entrada de desenvolvimento legítima
(`coloring60Navigation.js:74`).

**Bancada permanece proibida.** `ParentAreaScreen.js:1216` → `Coloring60LabScreen.js:115` navega com
`COLORING60_LAB_STORY_ID` (identidade **≠** `creation`) e a ferramenta **semeia e limpa** estado.
Artefato vindo dela é **inadmissível**.

**Divergência de *copy* registrada, não corrigida.** `ParentAreaScreen.js:1182` ainda diz *"Temporário:
nada é salvo"*. O texto é **obsoleto** — `saveColoring60DrawingState` não consulta plano nem origem
(`coloring60DrawingStorage.js:507`). É *dev-only*, não altera comportamento, e **`src/` não foi tocado**.

### Allowlist física corrigida

`databases/RKStorage` (`CHANGED`) · `databases/RKStorage-journal` (efeito do motor SQLite) ·
`files/DevLauncherApp-BridgelessReactNativeDevBundle.js` (`CHANGED` — **gate positivo de
proveniência**) · `files/ptf_blobs/atelier/<id>_preview.jpg` e `_thumb.jpg` (`ADDED`) ·
`files/ptf_blobs/drawings60/_ptf_drawing60_screation_a<id>.a.png` (`ADDED`; *slot* `.b.png`
pré-declarado) · `shared_prefs/WebViewChromiumPrefs.xml` e
`shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` (`CHANGED`) · infraestrutura tolerada
(`files/profileInstalled`, `phenotype_storage_info/…`, demais `shared_prefs/*.xml` do *baseline*).
**`files/ptf_blobs/drawings/` não pode ser criado** — não há *writer* acionável.

### Restauração do *baseline* e `logcat`

A identidade do *baseline* restaurado é provada **semanticamente** — conjunto de caminhos + `length` +
`SHA256` do **conteúdo** de cada arquivo + diff lógico do `AsyncStorage` — **nunca** por `SHA256` de
`TAR` reempacotado (ordem e metadados variam). **`UNEXPECTED_COUNT` deve ser `0` antes de qualquer
Metro.** Procedimento: `am force-stop` → captura de `TAR-ROLLBACK-PRE-RESTORE.tar` → esvaziamento das
três subárvores capturadas → extração do `TAR-PRE` por `stdin` sob `run-as` → verificação. **Sem
`adb install`, sem *uninstall*, sem `pm clear`, sem *root*.** `cmd.exe` é obrigatório em qualquer
transporte binário.

**`adb logcat -c`** fica **autorizado uma única vez** na `PREP-02`, **depois** da verificação do
*baseline* e **antes** da captura. Não altera o armazenamento do app, não altera evidência antiga, e
é regra **exclusiva** daquela sessão.

### `PREP-LEGADO-02-NAO-FEZ`

Até este commit: **nada foi executado.** Não se restaurou `TAR`; não se tocou o aparelho; não se
executou `adb`, Metro, Expo nem `logcat`; não se executou `logcat -c`; não se criou
`C:\tmp\ptf_evidencias\PREP-LEGADO-02\`; não se modificou `AsyncStorage` nem o *filesystem* do app;
não se alterou `src/`, `scripts/`, `package.json`, `app.json` nem `eas.json`; nenhum artefato da
`PREP-01` foi alterado. **A `PREP-LEGADO-02` não executa caso algum da `R2` e não concede `PASS` a
nada. `R2 · Sessão 2` continua NÃO INICIADA. `F6-SG-A` continua NÃO CONCEDIDO e `R1-PEND-1..5`
continuam ABERTAS.**

## `COPY-RESPONSAVEIS-01` — "Área dos Pais" → "Área dos Responsáveis" (2026-08-11)

**Decisão do fundador, aprovada.** O texto **visível** "Área dos Pais" passa a ser **"Área dos
Responsáveis"**. **Objetivo:** linguagem mais inclusiva para pais, mães, responsáveis legais,
cuidadores e demais adultos responsáveis.

**Esta entrada REGISTRA e PLANEJA. Ela NÃO implementa.** A interface **não** foi alterada: mexer em
`src/` agora fura o *ownership* da fase corrente (`F6-R3` / campanha `SG-A`). A implementação é
**feature própria**, com ciclo SDD e Portão Humano — e **não** entra em nenhuma rodada física.

### Inventário (somente leitura, HEAD `1bb8dfb`)

430 ocorrências brutas em 100 arquivos. **"Área dos Responsáveis" ainda não existe em lugar nenhum**
— o termo é inédito no repositório.

| Categoria | Ocorrências | Arquivos | Destino |
|---|---:|---:|---|
| **A** — texto visível ao usuário | **11** | 9 | **TROCAR** |
| **B** — acessibilidade | **0** | 0 | nada a fazer (a11y é derivada do texto de `A`) |
| **C** — documentação e comentários | ~373 | ~96 | atualizar em lote documental **separado** |
| **D** — identificador técnico | ~24 | 11 | **NÃO MEXER** |
| **E** — *route key* | 12 | 12 | **NÃO MEXER** |
| **F** — persistência / *storage* | 3 | 2 | **NÃO MEXER** |
| **G** — teste (`scripts/smoke.js`) | 49 | 1 | **nenhuma é assertiva** — ver abaixo |

**Achado que reduz muito o risco:** as 49 ocorrências em `scripts/smoke.js` são **descrições de
lacre, mensagens de falha e comentários** — **nenhuma asserta o texto literal**. A troca de copy
**não deixa o `smoke` vermelho**; deixa descrições desatualizadas (dívida de legibilidade), que devem
ser corrigidas junto por higiene.

### Escopo mínimo da futura troca — categoria `A`

`src/navigation/AppNavigator.js:588` (`title` da rota) · `src/screens/ParentAreaScreen.js:643` ·
`src/components/ParentalGate.js:80` · `src/screens/ProfileScreen.js:320` ·
`src/screens/QuizScreen.js:63,65` · `src/components/premium/PremiumLockCard.js:28` (**default** do
componente — propaga) · `src/data/beniGuides.js:79,84` (79 ativo; 84 dormente, mas precisa mudar
para não voltar errado depois) · `src/screens/Coloring60LabScreen.js:224` (dev-only, decidir) ·
`src/config/productConfig.js:24` (`parentAreaTitle` — copy **órfã, sem consumidor**; decidir se troca
ou se vira limpeza separada).

**Núcleo estrito visível em produção: 7 arquivos, 9 linhas.**

### **NÃO MEXER** — o que a troca de copy não pode arrastar

- **`route keys`:** `PARENT_AREA: 'ParentArea'` (`src/constants/routes.js:62`), `name="ParentArea"`
  e as **10** chamadas `navigation.navigate/replace('ParentArea')`; e o contrato
  `'openParentArea'` de `src/services/contentAccessService.js:103`.
- **`storage keys`:** `@ptf_parent_settings_v1`, `@ptf_parental_consent_v1` (**consentimento
  parental**) e `@ptf_beni_guide_parent_v1`. Renomear = **perda silenciosa de dados já persistidos**
  no aparelho, e o guia do Beni reapareceria para todo mundo. Persistência é **área protegida**:
  exigiria spec de migração própria.
- **Identificadores de consentimento:** `PARENTAL_CONSENT_FLOW_ENABLED`, `getParentalConsent`,
  `acceptParentalConsent`, `revokeParentalConsent`.
- **Nomes de arquivo:** `ParentAreaScreen.js`, `ParentalGate.js`, `parentSettingsService.js`,
  `PARENT_AREA_RULES.md`, `docs/PARENT_AREA_GUIDE.md` e o `05_PRODUCT_LOCK_4E_…AREA_DOS_PAIS_….md`.
  Renomear quebraria *imports*, dezenas de `readSrc(...)` do `smoke` e a rastreabilidade da Fase 4.
- ***Deep link* / `scheme`:** nada a fazer — `app.json` declara `"scheme": "pequenostracosdefe"`, não
  há bloco `linking` nem *path* mapeado para `ParentArea`.

**A regra:** priorizar **copy**, evitar **migração técnica desnecessária**.

### Riscos que a implementação futura DEVE tratar (não são efeito colateral — são escopo)

1. **Repetição agramatical.** A troca literal produz frases que repetem "responsável/responsáveis"
   em espaço curto: `QuizScreen.js:63`, `PremiumLockCard.js:24+28`, `ProfileScreen.js:311+313+320`
   (**tripla** repetição), `beniGuides.js:79` e `:84`, `ParentAreaScreen.js:643+645`,
   `ParentalGate.js:80+82`. **Reescrever a frase, não substituir a palavra.**
2. **Comprimento: 21 caracteres contra 14 (+50%).** Ameaça truncamento no `title` do header nativo,
   no `gateBgTitle`, no `styles.title` do `ParentalGate`, no `adultCardTitle` do Perfil (que divide
   linha com emoji e *chevron*) e no botão "Ver Área dos Responsáveis" (25 caracteres). **Exige
   validação visual em dispositivo físico.**
3. **⚠️ Áudio do Beni.** `beniGuides.js:79` aponta `audioKey: 'guide.profile.parents'` →
   `assets/audio/beni_guide/profile/guide_profile_parents.mp3`. Se a narração gravada disser "Área
   dos Pais", trocar só o texto cria **dessincronia entre balão e voz**. O MP3 não é inspecionável
   por texto: **exige escuta manual antes do Portão Humano 1**. A **chave** e o **caminho do MP3**
   são intocáveis (asset é área protegida).
4. **Coerência jurídica.** `docs/legal/PRIVACY_POLICY_DRAFT.md`, `TERMS_OF_USE_DRAFT.md`,
   `CHILD_DATA_MATRIX.md` e o parecer `06_DIVERGENCIA_DOS_TEXTOS_DE_PRIVACIDADE.md` usam "Área dos
   Pais" como **nome próprio da superfície**. Se o app mudar e os textos legais não, **reabre-se
   exatamente a divergência que o Bloco 6 da Fase 5 registrou**. Isso é decisão de escopo
   documental e **precisa constar da spec** da futura feature.

### `COPY-RESPONSAVEIS-01-NAO-FEZ`

Não alterou `src/`. Não alterou `scripts/`. Não renomeou rota, chave de *storage*, identificador nem
arquivo. Não tocou áudio nem asset. Não abriu a feature de implementação.

## `D-OBS-01` — Observabilidade vira **requisito arquitetural** (2026-08-11)

**Decisão do fundador.** Observabilidade deixa de ser um acessório de campanha e passa a ser
**requisito arquitetural** do Mundo do Beni: o produto precisa ser capaz de responder *"isto quebrou,
onde, em qual build, com que frequência"* sem depender de o fundador estar com o aparelho na mão.

**O que esta decisão AUTORIZA agora:** apenas **estudo técnico**. O ADR canônico é
[`docs/ADR_OBSERVABILIDADE_D_OBS_01.md`](ADR_OBSERVABILIDADE_D_OBS_01.md).

**O que esta decisão NÃO autoriza — proibições duras, até Human Gate específico posterior:**

- **Nenhuma dependência nova.** Estão **explicitamente não autorizados** *Grafana Agent*, *Grafana
  Faro*, *Prometheus client*, *OpenTelemetry* (SDK ou qualquer pacote `@opentelemetry/*`), *Sentry*
  (`@sentry/react-native`) e **qualquer outro SDK**.
- **Nenhuma alteração** em `package.json`, `package-lock.json`, `app.json` ou `eas.json`.
- Nenhuma instalação, nenhum `npx expo install`, nenhum *config plugin*, nenhum *prebuild*.

**Ligação com o contrato já existente.** `D-OBS-01` **não** revoga e **não** afrouxa
`D-4E-ANALYTICS-3-CAMADAS`, `D-4E-CONSENTIMENTO` nem o registro de restrição de *Analytics / SDKs*
abaixo. Observabilidade técnica é lida **dentro** daquela arquitetura de três camadas: a camada de
diagnóstico técnico continua **sem conteúdo infantil, sem PII, sem AAID e sem identificador remoto
derivado do `childId`**; a camada pública continua **desligada por padrão** e dependente de
consentimento adulto explícito atrás do portão parental. **Nada de *screen replay* ou *session
replay*.**

**Ponto de partida real:** a instrumentação própria já existente — `src/services/performanceTrace.js`
(coletor `P-139`), `src/services/shellLifecycleTrace.js` e `src/utils/logger.js` — mais o gating por
`__DEV__` e por `EXPO_PUBLIC_PTF_PERF_TRACE` (perfil `preview` liga, `production` não tem a
variável). O ADR parte disso, não de uma folha em branco.

### `D-OBS-01-ADR` — conclusão do estudo (2026-08-11)

O ADR está **escrito e no disco**. Recomendação central: **manter e estender a instrumentação
própria**, adotando o **vocabulário** do OpenTelemetry **sem instalar OpenTelemetry**, complementada
pelas métricas agregadas que **Google Play (Android Vitals)** e **App Store Connect** já entregam
**sem SDK**. Custo **R$ 0** · dependências novas **0** · mudança nativa **nenhuma** · *prebuild*
**nenhum** · `production` segue **desligado**.

**Achados que ancoram a recomendação:**

1. 🔴 **O app não tem `ErrorBoundary`, `componentDidCatch` nem `ErrorUtils`** — `grep` vazio em
   `src/` e `App.js`. Em produção, erro de render **derruba a tela e não deixa rastro**
   (`logger.js` é `__DEV__`-only). **É o maior buraco real de observabilidade hoje** — e conserta
   duas coisas de uma vez: diagnóstico **e** experiência infantil.
2. **A hidratação NÃO é o gargalo.** Perfil 33 + progresso 58 + packs 23 ≈ **114 ms** contra
   `firstLayoutMs` **3204**. A hipótese "AsyncStorage lento" está **refutada por medição própria**.
   Restam **~2080 ms sem marca nenhuma** — mas em *Development Build*, o que **não** sustenta
   conclusão de produto (ver `PERF-OBS-01`).
3. **A amostra não tem discriminador de build:** DEV e `preview` são **indistinguíveis** no log.
   Corrigível **sem dependência** (`__DEV__` + `EXPO_PUBLIC_BUILD_PROFILE`, schema 2→3). Enquanto
   não existir, **todo número medido é ambíguo**.
4. **O pipeline base64 do canvas já é, tecnicamente, captura de tela.** A proibição de *replay*
   precisa virar **asserção em `npm run smoke`** — não há ESLint; texto não falha *build*.
5. **`@noble/hashes` já está instalado**, o que torna `sha256(childId)` uma armadilha **concreta** —
   e **proibida**: hash determinístico do `childId` **é** o `childId` (pseudonimização, não
   anonimização).

**Veredito duro sobre Prometheus:** apontá-lo para o telefone é errado por **seis razões
independentes** — modelo *pull*, NAT/CGNAT, IP efêmero, processo efêmero, bateria e **cardinalidade
(uma série por aparelho = identificador estável)**. Prometheus e Grafana são **backend**; este
projeto **não tem backend**. *Grafana Faro* é outra coisa — **SDK de cliente**, não autorizado.

**Dependências avaliadas e marcadas ⚠️ NÃO AUTORIZADAS:** `@sentry/react-native` (linha 7.x, *patch*
**não afirmado**; exige *config plugin* + **prebuild** + mudança em `app.json` e no Data Safety —
invalidaria a campanha física em curso); `@opentelemetry/*` (compatibilidade Hermes/New Arch **não
estabelecida**, fora do catálogo Expo); `prom-client` (**inaplicável** — Node-only, não roda em
Hermes); `@grafana/faro-*` (suporte RN **incerto**, e faz *replay*); `expo-device` (**expõe o modelo
exato — campo proibido**); `expo-constants` / `expo-application` (compatíveis e de baixo risco, mas
alterariam `package.json` — **proibido agora**).

**O ADR não instalou nada.** `package.json`, `package-lock.json`, `app.json`, `eas.json` e `src/`
**não foram tocados**; nenhum `npm install`, nenhum `npx expo install`, nenhum *prebuild*.

**O ADR também NÃO decide:** adotar qualquer SDK; conceder Human Gate; fechar `P-85`, `P-93`,
`P-127`, `P-139` ou `P-149`; declarar conformidade jurídica; autorizar *backend*; nem concluir
qualquer coisa sobre `PERF-OBS-01`.

## `PF6SGA-R1-VISUAL` — Achados visuais da `R1`: **inventário**, não trabalho (2026-08-11)

Durante a repetição da `R1` o fundador observou, em **vídeo físico**, cinco coisas que **não são**
critério da `R1`. Elas ficam **inventariadas** e **nada mais**. **A `R1` não abre `SG-B` por via
transversa.**

| # | Achado observado em vídeo | Owner | Pode ser corrigido em `SG-A`? |
|---|---|---|---|
| **A** | *Spotlight* / *onboarding* **mal posicionado** no tablet | **`F6-R2` = `SG-B`** (coordenadas/projeção — `B-01`/`B-02`) | **NÃO** |
| **B** | **Linhas / recortes verticais anômalos** durante o *spotlight* | **`F6-R2` = `SG-B`** (mesma família de projeção/recorte) | **NÃO** |
| **C** | **Composição pouco adaptada** à largura do tablet | **`F6-R1` = `SG-C`** (faixa/layout de tablet) — e o que for conteúdo/jornada, **`F7`** | **NÃO** |
| **D** | **Abertura/reabertura percebida como lenta** | Registrado como **`PERF-OBS-01`** (abaixo); leitura final em `R7`/`T090` | **NÃO** — é sintoma, não conserto |
| **E** | **Intervalo branco** antes da UI útil em determinada reabertura | Idem **`PERF-OBS-01`** | **NÃO** |

**Regra que governa este inventário:**

- **`B-01`/`B-02` e todo problema de coordenadas/*spotlight* continuam CONGELADOS para `SG-B`.**
- Nenhum destes itens é `FAIL` da `R1`: **nenhum deles pertence aos requisitos que a `R1` exercita**
  (*cold start*, instância única de `MainTabs`, navegação de abas sem remontagem,
  *background*/*foreground*, `A-03`).
- Vale o §7 do protocolo: **achado fora de `F6-R3` vira registro, não vira trabalho não autorizado.**
- **A validação física não expande escopo em silêncio.**

## `PERF-OBS-01` — Reabertura com intervalo perceptível (registro de sintoma, 2026-08-11)

**Isto é registro de SINTOMA. A causa NÃO está declarada.**

**Sintoma observado** em gravação física externa durante a repetição da `R1`: em **uma** reabertura,
houve intervalo **visualmente perceptível** entre *splash* / tela branca / *loading* e a UI útil.

**O que NÃO pode ser usado como métrica deste sintoma:**

- ⛔ **`Android Bundled 34102ms` NÃO é métrica de performance do app.** Esse número veio de *rebuild*
  do Metro com **cache vazio** (`--clear`) e mede o **empacotador na máquina do desenvolvedor**, não
  o aparelho. Usá-lo como evidência de lentidão do produto seria erro de leitura.

**Camadas que precisam ser distinguidas antes de qualquer diagnóstico** — misturá-las é o que produz
conclusão errada: *Metro bundling* · *startup* de JS/runtime · **font gate** · **route decision** ·
**hydration** (perfil, progresso, packs) · **first layout** · **time-to-interactive real** · assets ·
rede/conteúdo.

**Evidência inicial disponível** (Development Build, `P-139`, schema 2, terminal `first_layout`,
route `Home`): `fontGateMs` 277 · `routeDecisionMs` 38 · `splashReactMs` 808 · **`firstLayoutMs`
3204** · `profileHydrationMs` 33 · `progressHydrationMs` 58 · `packsHydrationMs` 23 ·
`bufferDropped` 0. **Isto é evidência inicial, não conclusão** — e um *Development Build* carrega
JS pelo Metro, o que por si só inflaciona o número.

**Comparação planejada (posterior, não agora):** Development Build × **Preview Android pós-`aa58849`**
× outro dispositivo, quando previsto. **O `Preview` exigido por `D-3` só é gerado DEPOIS da campanha
Development Build** (§2.4 e ordem operacional congelada do §3.4). **Não gerar `Preview` agora.**

**Owner:** a investigação de causa **não** pertence à `F6-SG-A`. `PERF-OBS-01` fica **registrado e
aberto**, para ser lido junto de `P-139` e do `T090`/`F-PERF` na rodada `R7` e nas fases de
performance. **Não corrigir dentro de `SG-A`.**

## `AUDITORIA-PREP02-STOP-01` — causa do `STOP` da `PREP-LEGADO-02` (2026-08-11)

**Auditoria completa:**
[`specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/12_AUDITORIA_PREP02_STOP.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/12_AUDITORIA_PREP02_STOP.md).
Somente leitura: **nenhum aparelho, `adb`, Metro, `logcat`, restauração de `TAR`, alteração de
*storage*, de evidência ou de código.** Esta entrada **registra**; ela **não executa**.

### Fato auditado

O *checkpoint* `C60` trouxe `ADDED=7 CHANGED=0 DELETED=0` — as **quatro** chaves previstas por §7.1 do
protocolo **mais três** fora da allowlist: `@ptf_creator_qa_mode='false'`,
`@ptf_progress_creation='{"1":true,"2":true}'` e
`@ptf_coloring60_milestone_invite_seen_creation_light='1'`.

### `D-PREP02-09` — a rota congelada **não foi executada**; foi percorrida a rota narrativa

Provado por **três linhas independentes e convergentes**:

1. **Forense de `rowid` do `RKStorage`** (técnica nova). O `AsyncStorage` legado grava com
   `INSERT OR REPLACE`, que realoca o `rowid` da chave reescrita e deixa o antigo vago ⇒ a ordem de
   `rowid` **é** a ordem de gravação, e um vago antes de uma chave prova **dupla gravação**. Baseline
   máx. `42`; *checkpoint*: `43` vago → `44` `creator='false'`; `45` vago → `46` `progress`; `47`
   marco; `48` ponteiro; `49/50/51` `done/snap/ever` — nesta ordem exata do `multiSet` de
   `coloring60ActivityService.js:129-133`. Logo: *switch* tocado **duas** vezes (`ON`→`OFF`), **duas**
   cenas concluídas, **e as três chaves inesperadas nasceram ANTES do *save* do C60**.
2. **Canal de entrada do `InputDispatcher`.** O toque que precedeu a montagem do `ColoringScreen` em
   **366 ms** foi entregue ao canal de um **`Dialog` nativo** (`ReactModalHostView.showOrUpdate`), não
   ao canal da janela principal onde vive o `SoundButton` "Abrir Luz" (`ParentAreaScreen.js:1186`).
   **O editor foi aberto por um botão dentro de um modal.**
3. **Grafo de *writers*.** O único modal que abre o editor e é compatível com as chaves observadas é o
   **convite do marco** (`Coloring60MilestoneInvite` ← `NarrationScreen.js:217`; aceite em `:244`).
   O convite da `StoryDetail` está **duplamente excluído** (exige `storyScenesComplete === true` e
   gravaria `@ptf_creation_colorir_invite_shown_v1`, ausente do `ADDED`).

**Portanto:** foi percorrida a rota `cena 1 → cena 2 → marco` — a mesma da `PREP-01` —, que
`D-PREP02-06` declarava não utilizada. **Na `PREP-02` houve desvio de rota**, e ele é maior que o
toque acidental no *switch*. Isto **não** contradiz o diagnóstico da `PREP-01`, cujo protocolo
**mandava** percorrer a narrativa: lá não houve desvio; aqui houve.

> ⚠️ `modo=activity` no log de conclusão **não** identifica a porta: `COLORING60_MODE.FIRST = 'activity'`
> (`coloring60Journey.js:64`) e `completionMode` deriva **só** do mapa de conclusões. Armadilha de
> leitura, registrada para não se repetir.

### `D-PREP02-10` — o protocolo de §10 tem **três defeitos materiais**

- **`P-1` coabitação:** o *switch* Modo Criador é o **1º** card do acordeão e "Abrir Luz" é o **3º**;
  chegar ao alvo exige rolar por cima do *switch*. Única barreira: uma frase numa célula de tabela.
- **`P-2` zero *checkpoints* intermediários** entre os blocos `B` e `A`. Como escrito, o desvio só
  seria visto **depois** de o Ateliê existir, contaminando os dois insumos. O que salvou a sessão
  (`CHECKPOINT-C60.tar` + `CHECKPOINT_C60_ASYNC_DIFF.txt`) é **improvisação do executor**, ausente de
  §10 e de §13.
- **`P-3` proibições fora da lista de passos:** a proibição de entrar na `NarrationScreen` só existe
  em §7.3 e na nota de rodapé de §10 — textos para o auditor, não para o operador. §14.12 é
  **inauditável**: nenhum artefato exigido registra a rota percorrida.

**O que funcionou:** a allowlist de §7.1 estava **materialmente correta**, a de §8 foi respeitada e a
**disciplina de `STOP` funcionou** (nada apagado, nada remediado, Ateliê não iniciado). Falhou a
disciplina de **rota**, não a de parada.

**Achado de processo:** o *commit* que corrigiu a rota (`c71e8b6`) é de **15:28:57**; a sessão física
começou às **15:34:28** — **~5,5 min** de margem, sem rebriefing.

### `D-PREP02-11` — veredito e reuso da rota na `PREP-LEGADO-03`

**Veredito `A*`:** a **rota** `B1..B4` é **correta** — por análise de *writers* grava exatamente as
quatro chaves da allowlist, e o pós-conclusão é **inerte** (o `RKStorage` do `TAR-STOP-C60` é idêntico
ao do *checkpoint*: **zero escritas** entre o *save* e o `force-stop`). Isso exclui `B` e `C`. **Mas a
segunda asserção do enunciado `A` — "o único problema material foi o toque acidental" — é REJEITADA**
(ver `D-PREP02-09`), e `D` seria desonesto porque a causa **está** determinada. **A correção da rota é
afirmada por análise estática, não por teste físico bem-sucedido: a rota continua NÃO VALIDADA
empiricamente.**

**Consequência:** a `PREP-LEGADO-03` **reutiliza a rota** e **corrige o protocolo**, com *checkpoints*
somente leitura **`G0..G5`** (`G0` pós-*boot*; `G1` na entrada da Área dos Pais; **`G2` prova positiva
de que `@ptf_creator_qa_mode` continua AUSENTE** antes de abrir o editor; `G3` com o editor montado e
antes de pintar; **`G4` imediatamente após o *save*, antes de qualquer navegação**; `G5` após ligar o
Modo Criador, antes do Ateliê). *Baseline* = **`TAR-PRE02.tar`**
(`SHA256 8486DEC6…FF1BA7`, conferido). **C60 com o Modo Criador AUSENTE/`OFF`; só depois o Ateliê.**
**`PREP-01` e `PREP-02` preservadas integralmente**; nenhuma allowlist ampliada retroativamente.

**Rejeitados explicitamente:** (a) **reordenar os controles do `ParentAreaScreen`** — seria a
mitigação mais eficaz, mas alterar `src/` do *runtime* histórico **invalidaria a proveniência** do
*bundle* `7de7085`; (b) **automação de UI por coordenada** (`adb shell input tap`) — sintetiza evento
na camada do `InputDispatcher` e produziria interação **indistinguível da real** no `raw.log`,
destruindo a própria forense de canal que fechou esta auditoria. **A interação continua humana e
real.** Mitigações adotadas: roteiro **toque a toque** com as proibições **dentro** da lista de
passos, instrução visual explícita para o bloco `B2`, `G2` como trava dura, *checkpoint* promovido a
artefato obrigatório, **rebriefing com ≥30 min** entre um *commit* que altere a rota e a sessão
física, e gerador de `BUNDLE_PROVENANCE` com **veredito explícito** e caminhos normalizados.

### Proveniência do *bundle* (revalidação **documental**)

`shellLifecycleTrace` e `useSurfaceLifecycle` **AUSENTES** do *bundle* (existem em 6 arquivos de
`c71e8b6` e em 0 de `7de7085`); marcador **positivo** de época presente (a *copy* obsoleta de
`ParentAreaScreen.js:1182`). Os `1137` módulos "desconhecidos" **não são anomalia**: ~800 são caminhos
internos de `node_modules` e ~337 sofrem falha de normalização (barra dupla) — normalizados,
**nenhum módulo `.js` do app está ausente**. **Ressalva:** `BUNDLE_PROVENANCE_PRE_C60.txt` **não emite
veredito** e, lido sem análise, **induz a erro**; o gate positivo de §9 item 9 é cumprido por esta
auditoria, não pelo arquivo. **O *bundle* é consistente com `7de7085` e incompatível com `c71e8b6`.**

### Não determinados (registrados como tais)

Identidade nominal de dois `Dialog` intermediários (certo é que **nenhum dos dois gravou chave
alguma** — não há `rowid` que os acomode) · se o operador chegou a **ver** o cartão "Colorir 60" da
Área dos Pais · horário absoluto de cada escrita (o `AsyncStorage` não emite `logcat`; as horas são
**intervalos inferidos** ancorados na ordem física dos `rowid`) · a contagem de "conhecidos" do
*bundle*.

> ⛔ **`PREP-LEGADO-01` = `STOP`. `PREP-LEGADO-02` = `STOP`. `R2 · Sessão 2` = NÃO INICIADA.
> `F6-SG-A` = NÃO CONCEDIDO** (`R1-PEND-1..5` ABERTAS). **`PREP-LEGADO-03` = DESENHADA, NÃO
> EXECUTADA.** Nenhuma história foi apagada ou reescrita.

## `PREP-LEGADO-03-FECHO` — acervo legado admissível, produzido e periciado (2026-08-11)

> Esta entrada **acrescenta**. **Não** reescreve nem reabilita nada. Auditoria completa em
> [`13_PREP_LEGADO_03.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/13_PREP_LEGADO_03.md).

Depois de **duas** campanhas encerradas em `STOP`, a `PREP-LEGADO-03` foi executada fisicamente e
lacrada. Auditoria independente — **nenhum relatório pré-existente aceito como prova; todo número
recalculado da fonte primária**, em cópias abertas com `mode=ro`, sem tocar no aparelho.

### ✅ `PREP-LEGADO-03` = **CONCLUÍDA COM ACERVO ADMISSÍVEL**

| Sustentação | |
|---|---|
| Cadeia de custódia | **25/25** *hashes* conferidos; `TAR-PRE03 = TAR-PRE02 = TAR-PRE-LEGADO`; estado terminal da `PREP-02` preservado **antes** da restauração |
| *Diff* independente | `ADDED=7 CHANGED=0 DELETED=0` — as **sete** exatas; as **quatro** chaves proibidas **ausentes** |
| Ordem física | `rowid` **43–50 denso** ⇒ cada chave gravada **uma única vez**; C60 (43–46) **antes** do Modo Criador (47) |
| Insumo C60 | ponteiro `v:3`/`fmt:2`/`image/png`/`rev:22` e *blob* PNG com `IHDR` **1440×2156** batendo com o ponteiro |
| Insumo Ateliê | `schema 2`, `stateJson.v 2`, 12 *strokes*, `stamps []`, e **`paintSchemaVersion`/`layoutVersion`/`logicalW`/`logicalH` exaustivamente ausentes** |
| Integridade do título | bytes `C3 A9` (`é`) — UTF-8 canônico no *storage* |
| Interação real | sem *seed*, sem fabricação, sem bancada, sem automação por coordenada |

### Duas provas que o instrumento anterior não alcançava

1. **Reescrita idempotente detectada.** `@ptf_criar_livre_orientation_seen_v1:star` moveu do `rowid`
   **30 → 48** com **valor idêntico**, na janela `A1 → A2-BLOCKED` — ou seja, **durante a pintura,
   antes do *save***. O *checkpoint* `A2-BLOCKED`, que o desenho **não** pedia, é o que tornou o
   mecanismo `OBSERVADO` em vez de `INFERIDO`. Era **exatamente** o comportamento pré-declarado na
   allowlist de `11_PREP_LEGADO_02.md:291`. **A allowlist se confirmou na física.**
2. **Previsão refutada, não apenas "não observada".** `@ptf_achievements_seen` manteve o `rowid` **20
   nos seis *snapshots*** ⇒ **provadamente não tocada**. **15 das 16** chaves do *baseline* têm
   `rowid` intacto — prova **positiva** de ausência de mutação silenciosa.

> 🔬 **Achado metodológico canônico.** Um comparador `key→value` classifica os dois casos acima como
> "nada aconteceu", e **erra nos dois**. `CHANGED=0` **não** prova ausência de escrita. **Toda
> verificação de acervo passa a capturar `rowid`.**

### Fragilidades registradas (nenhuma altera o veredito)

- **`A2-UI-HIERARCHY.txt` não contém hierarquia** — 37 B com `"UI hierchary dumped to: /dev/tty"`. As
  coordenadas do *sheet* bloqueado são **NÃO DETERMINADAS**.
- **Instrumento de `G4`/`G5` não versionado** — os dois relatórios não são reproduzíveis; os números
  foram reconferidos na fonte primária.
- **`ReactNativeJS` emudece em `16:48:01.502`** — `G5`, `A1` e `A2` **sem log do aplicativo**; causa
  **NÃO DETERMINADA** (sem `crash`, sem ANR, sem reinício de processo). O *save* é provado pelo estado
  persistido e por **duas testemunhas externas ao processo**: o *autofill* do Samsung Pass registrando
  o *hint* **`Nome do desenho`** (PID 4095, fora do app) e a correlação **IME ocultado `17:11:43.871`
  → `createdAt` `17:11:43.982`** = **+111 ms**.
- **`BASELINE_EQUAL=STOP` é rótulo ambíguo** — significa apenas `PRE ≠ POST`, resultado **esperado** no
  relatório final. Segunda ocorrência da classe de defeito de `BUNDLE_PROVENANCE_PRE_C60.txt`.
- **Deriva de relógio aparelho ↔ PC ≈ 10,5 s** (aparelho adiantado), não documentada na campanha.
  Nenhuma conclusão depende dela — as correlações são **intra-aparelho**.
- **Mojibake de transporte** — o título correto (`é`) apareceu como `Ú` por cadeia
  `CP1252 → CP850/CP858 → UTF-16LE`. **CP437 refutada** (mapearia `0xE9` para `Θ`). **`CLASSIFICAÇÃO A`
  — artefato de apresentação; o *storage* sempre esteve correto.**
- **Sete `SHA256` mal transcritos no próprio documento de fecho** (`13_PREP_LEGADO_03.md` §2.2),
  incluindo o do **`TAR-POST03`**, que é a **referência do gate `G-09`**. **Nenhum arquivo divergiu** —
  os 25 artefatos foram recalculados e conferem; o defeito era **transcrição manual** de caudas de
  comprimento variável (6 a 10 dígitos). Um dos erros era uma cauda **colada do artefato errado**
  (o `preview.jpg` recebeu a cauda do PNG do C60). Corrigidos no lugar, com registro de 64 dígitos em
  `13_PREP_LEGADO_03.md` §2.3.

> 🔬 **Segundo achado metodológico canônico.** O corpus carregou por um *commit* valores que
> **reprovariam um gate legítimo** — a falha teria sido lida como defeito do dispositivo. Regra
> permanente: **`hash` abreviado é resumo de leitura, nunca referência de gate.** Todo `hash` que
> decide alguma coisa aparece com **64 dígitos** ou é **recalculado na hora** e colado da saída do
> comando; **nenhum `hash` é digitado à mão** (`14_R2_SESSAO_2.md` §5.6).

> ⛔ **O que este veredito NÃO concede:** `PREP-LEGADO-01` = **`STOP`** e `PREP-LEGADO-02` = **`STOP`**
> — **permanecem**, sem reabilitação e sem ampliação retroativa de allowlist. **Nenhum caso da `R2` foi
> executado**, **nenhum `PASS` de `R2`** é concedido, **`R2 · Sessão 2` = NÃO INICIADA** e
> **`F6-SG-A` = NÃO CONCEDIDO** (`R1-PEND-1..5` ABERTAS).

## `PF6SGA-PREP03-VISUAL` — achado visual do *runtime* histórico: registro, não trabalho (2026-08-11)

Durante a `PREP-LEGADO-03`, ao salvar obra nova no `Criar Livre` do **SM-X510**, o *sheet*
**"Nomeie seu desenho"** abriu **parcialmente abaixo/atrás da barra fixa inferior**: campo de texto
parcialmente visível e ação **"Guardar desenho" visualmente inacessível**.

| | |
|---|---|
| **Classificação** | `ACHADO VISUAL REAL` do *runtime* histórico **`7de7085`** |
| **Evidência** | `A2-NAME-SHEET-BLOCKED.png` (449.056 B, `8317D474…`) + `A2-BLOCKED-NAME-SHEET-PRE-SAVE.tar` (`FE448167…`) — **o defeito foi lacrado antes de ser contornado** |
| **Contorno usado** | **somente** a interação nativa do próprio componente: `returnKeyType="done"` → `onSubmitEditing` → `confirmName` → `performSave`. Sem `adb input`, sem coordenada artificial, sem rotação, sem alteração de *display* |
| **Invalida o *writer*?** | **NÃO.** O caminho acionado é o mesmo do botão. O defeito é de **apresentação**; a gravação é **legítima** e periciada |
| **Corrigir agora?** | **NÃO.** Registro, na disciplina de `PF6SGA-R1-VISUAL`: *achado fora de `F6-R3` vira registro, não vira trabalho não autorizado* |

**Por que fica em entrada separada, e não na tabela de `PF6SGA-R1-VISUAL`:** aquele inventário cobre
**cinco achados da `R1`**, observados no *runtime* **canônico**. Este é da **`PREP-03`**, no *runtime*
**histórico**. Misturá-los produziria contradição de proveniência.

⚠️ **Não confundir com itens já canônicos** — são outros componentes, outras telas e outros subportões:

| Item preexistente | Do que trata | Por que **não** é este achado |
|---|---|---|
| **`TK-B-013`** | compensação fantasma de **56pt** em `initialOffsetY` do `AdventureMapScreen` | tela do **mapa**, geometria de **câmera**; congelado em `F6-SG-B` |
| **`P-169`** | reserva inferior dependente de **cromo exclusivo de telefone** (achado `B-04`) | espaço de coordenada de ***overlay***, não *sheet* de nomeação |

⚠️ **Ressalva honesta:** **se o `HEAD` canônico reproduz o mesmo problema é `NÃO DETERMINADO`** — não
foi testado e **não** pode ser inferido daqui. Investigar é trabalho próprio, **fora** desta campanha.

## `R2S2-PREPARADA` — protocolo da `R2 · Sessão 2` pronto e **não iniciado** (2026-08-11)

Protocolo executável em
[`14_R2_SESSAO_2.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/14_R2_SESSAO_2.md).

- **O *runtime* é o CANÔNICO ATUAL.** Metro **somente** de `C:\tmp\ptf_fase6_shell_splash_wt`. O
  *worktree* histórico **não** serve Metro e volta a ser **somente leitura**.
- **Continuidade provada:** `c71e8b6` é ancestral do `HEAD`, e `git diff --name-only aa58849..HEAD`
  **não** lista nenhum arquivo fora de `docs/` e `specs/` ⇒ **nenhum arquivo funcional mudou desde
  `aa58849`**. Dispensa novo *build* nativo.
- **Marcadores de proveniência DERIVADOS para o *runtime* atual** — os negativos da `PREP` histórica
  **não** são reutilizados (produziriam `STOP` falso). O discriminador mais forte é um **par casado no
  mesmo ponto do código**: canônico emite `[COLORING_STATE] load OK espacoLogico=`, histórico emite
  `[COLORING_STATE] load OK W=`.
- **Estado de entrada por comparação SEMÂNTICA** (caminho/tamanho/`SHA256` + chave/valor/**`rowid`**)
  contra `TAR-POST03`, exigindo **seis contadores em zero**. **Igualdade byte-a-byte entre `TAR` está
  proibida como prova única** — diferenças de *mtime*/ordem/*padding* são legítimas. **Não se restaura
  `TAR` por reflexo.**
- ***Checkpoints* `CK-C*` por caso passam a ser obrigatórios** — correção direta do defeito `P-2` da
  `PREP-02` (zero *checkpoints* intermediários), validada pelo ganho probatório que o *checkpoint*
  extra `A2-BLOCKED` produziu na `PREP-03`.
- **Errata de marcador obsoleto:** `08_SEQUENCIA_OPERACIONAL_UNICA_F6_SG_A.md:451,483` prescreve o
  literal `[AppNavigator] MainTabs MONTADO`, que **não existe em nenhum dos dois *worktrees***. O texto
  real é composto em execução (`[shell] ${nome} ${evento} · montagens #N`,
  `shellLifecycleTrace.js:105`). **O mesmo literal erra nos dois sentidos**: na linha 451 é marcador
  **positivo** (⇒ `STOP` falso) e na 483 é marcador **negativo** (⇒ **guarda morta**, `PASS` falso —
  o mais perigoso, por ser silencioso). **`08` NÃO é reescrito**; a errata é acréscimo, na convenção
  de `R2-ACH-01-ERRATA`.
- **`CASO 14 · variante v1`** permanece **`INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL`**
  (`CASO14-V1-INEXECUTAVEL-01`) — **não é `PASS`, não é `FAIL`**, não autoriza fabricar *fixture*, e
  **não pode bloquear** as variantes executáveis. Aparece **separadamente** no relatório.
- **Ordem dos casos congelada:** `1 · 15 · 14 · 16 · 10`.

> ⛔ **`R2 · SESSÃO 2` = NÃO INICIADA.** O documento é **plano**, não registro de execução. Nenhum
> `PASS` é concedido, **`F6-SG-A` = NÃO CONCEDIDO** (`R1-PEND-1..5` ABERTAS), e a execução depende de
> **`HUMAN GATE` explícito**.

## `D-FUND-BUILD-SEQUENCE-01` — o *build* nativo vai à frente; a campanha histórica **não** é refeita (2026-08-13)

Decisão **do fundador**, tomada após o `PREBUILD_CUSTODY_HARD_STOP`
([artefato `26`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/26_PREBUILD_CUSTODY_HARD_STOP.md)).

**O que foi decidido.** **NÃO** retornar a `e393768` e **NÃO** reconstruir a campanha `R2`
histórica antes do *build*. A rota de restauração medida em §9 do artefato `26` fica
**registrada e não escolhida**.

**O que a decisão NÃO faz.** Ela é de **sequenciamento**, não de mérito. A campanha histórica
permanece exatamente como está:

| Estado histórico | Continua |
|---|---|
| `BLOCOS B`..`E` (`CASOS 7, 8, 6, 11, 17, 12`) | **incompletos · NÃO EXECUTADOS** |
| Veredito da campanha | **não-`PASS`** |
| `R1-PEND-1..5` | **ABERTAS** — `PF6SGA-R2-GATE-SANEAMENTO` segue integralmente válida |
| `F6-SG-A` | **NÃO CONCEDIDO** |

> ⛔ **Nenhum `PASS` retroativo é concedido**, e esta decisão **sozinha não supersede** os
> requisitos históricos. Os estados antigos são **preservados como históricos**, não apagados
> nem convertidos.

**Por que não bloqueia o *build*.** Porque a autorização não vem desta decisão: o **🟢 VERDE**
auditou o corpus de forma independente e concluiu
`SGC_FINAL_GATE_AUTOMATION_PASS_BUILD_AUTHORIZED` e `BUILD_NATIVE_AUTHORIZED`. A decisão do
fundador **escolhe a ordem**; a autorização técnica já existia.

**Efeito prospectivo.** O novo binário passa a ser a **base física prospectiva** para as provas
atuais de `F6-R1`/`SG-C` e para a **futura campanha consolidada** prevista no roadmap. As provas
históricas não migram para ele: o que for provado no binário novo é prova **do binário novo**.

**Custódia reconciliada antes da decisão.** `CUSTODY_RKSTORAGE_AFTER_C10 = BYTE_IDENTICAL`
(`SHA256 950D93D1…FFA1`, `49152` bytes, idêntico ao `TAR-C10-POST`) e `drawings60/` anterior à
janela `F6-R1` — artefato `26` §4.2. O acervo do `SM-X510` está preservado **por identidade de
conteúdo**.

**Limite operacional que acompanha a decisão.** O *build* é **gerado e não instalado**. A troca
do binário no `SM-X510` é **missão posterior**, com portão próprio para `applicationId`,
assinatura, `versionCode`, capacidade real de *upgrade in-place*, *backup* final do acervo e
*rollback*.

### `SUPERSEDE PARCIAL` sobre `D-FUND-PREBUILD-01` — acrescentado em `DOC REPAIR 01` (2026-08-13)

Acréscimo posterior a esta decisão, para tornar a relação normativa **explícita** e encerrar a
leitura ambígua que o artefato `26` §3.4 deixou aberta (*"proibido por `D-FUND-PREBUILD-01`"*).

> ### `SUPERSEDE PARCIAL`
>
> `D-FUND-BUILD-SEQUENCE-01` **supersede parcialmente** `D-FUND-PREBUILD-01`.
>
> **A supersessão vale SOMENTE** para qualquer leitura anterior segundo a qual
> `D-FUND-PREBUILD-01` impediria **GERAR** um novo *build*. Essa leitura está **superada**:
> **GERAR está autorizado**.

**Permanece integralmente válida** a proibição, sobre o binário protegido do `SM-X510`, de:

| Ato | Estado | Sem o quê |
|---|---|---|
| **INSTALAR** | ⛔ **PROIBIDO** | *gate* posterior próprio |
| **DESINSTALAR** | ⛔ **PROIBIDO** | *gate* posterior próprio |
| **SUBSTITUIR** | ⛔ **PROIBIDO** | *gate* posterior próprio |
| **LIMPAR DADOS** (`pm clear`) | ⛔ **PROIBIDO** | *gate* posterior próprio |

A supersessão é **de alcance**, não de mérito, e **não** toca o núcleo de custódia de
`D-FUND-PREBUILD-01`: gerar um artefato de *build* na máquina **não é** um ato sobre o aparelho.

> ⛔ **Nada aqui concede `PASS`.** `F6-SG-A` = **NÃO CONCEDIDO**. `F6-SG-C` = **NÃO CONCEDIDO**.
> `SD-1` = **NÃO CONCEDÍVEL**. `R1-PEND-1..5` = **ABERTAS**. `BLOCOS B`..`E` = **NÃO
> EXECUTADOS**. A supersessão diz **o que se pode fazer**, não **o que está provado**.

## `D-FUND-HISTORICAL-INSTALL-BASELINE-01` — a instalação de 13/08 foi provada; a baseline canônica avança (2026-08-13)

Canonização retrospectiva de um evento **real**, autorizada pelo veredito
`HISTORICAL_INSTALL_EVIDENCE_AUDIT_PASS_READY_FOR_CANONICAL_REPAIR`. Registro completo:
[artefato `29`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/29_HISTORICAL_INSTALL_GATE_20260813.md).

**1 · O que foi provado.** Em **13/08/2026, 02:00:59**, uma instalação `adb install -r` foi
executada no `RX2XC003LTJ` (`SM-X510`), com saída literal `Performing Streamed Install` /
`Success`, `exit 0`. A evidência **permaneceu fora do corpus** até esta reparação; a auditoria
adversarial posterior a **provou**. O binário instalado é **bit a bit** o do `BUILD NATIVE 01`
(`BUILD_ID a123250f-384e-4665-a443-2c783351aad0`, `SHA256 0273951…97262E`), houve
***upgrade in-place*** (`firstInstallTime` inalterado, `codePath` novo, *past signatures* vazio) e
o **acervo sobreviveu byte-idêntico** (`14`/`14` arquivos, `RKStorage` `SHA256 950D93D1…FFA1`).

**2 · `SUPERSEDE` — de alcance cirúrgico.**

> ### `SUPERSEDE PARCIAL`
>
> `D-FUND-HISTORICAL-INSTALL-BASELINE-01` **supersede EXCLUSIVAMENTE o item 1** de
> `D-FUND-PREBUILD-01`.
>
> **Motivo:** aquele item descreve, **em tempo presente**, o binário "atualmente instalado" com
> `firstInstallTime == lastUpdateTime == 2026-08-10 12:03:42`. Essa afirmação **ficou
> desatualizada** em `2026-08-13 02:00:59`. Ela **não estava errada quando escrita** — ela
> **expirou**.

**3 · O que NÃO é superado.** Os **itens 2 a 7** de `D-FUND-PREBUILD-01` permanecem
**integralmente vigentes**: **não instalar** · **não desinstalar** · **não substituir** · **não
executar `pm clear`** · gerar binário não viola custódia · **qualquer instalação futura exige
missão e gate próprios**. A supersessão é de **fato desatualizado**, não de **norma de custódia**.

**4 · O artefato `26` NÃO é corrigido retroativamente.** Ele permanece byte-idêntico e canônico
como registro da **baseline PRE**, válida de `2026-08-10 12:03:42` a `2026-08-13 02:00:59`
(`HISTORICAL_BASELINE_VALID_UNTIL_INSTALL`). O passado documental não é reescrito.

**5 · Nova baseline canônica.** A **baseline POST** do artefato `29` §11 passa a ser a **baseline
canônica mais recente conhecida** do `SM-X510`.

**6 · Limite duro que acompanha a baseline.**

> ⛔ **`CURRENT_DEVICE_STATE_NOT_YET_MEASURED`.** A baseline POST é a última **conhecida**, não o
> **estado presente**. O aparelho **não foi medido** desde `2026-08-13 02:00:59`, e nenhum
> documento pode afirmar qual binário está nele **agora**.

**7 · Nada é concedido.** `R1-PEND-1..5` = **ABERTAS** · `F6-SG-A` = **NÃO CONCEDIDO** ·
`F6-SG-C` = **NÃO CONCEDIDO** · `SD-1` = **NÃO CONCEDIDO** · `BLOCOS B`..`E` = **NÃO EXECUTADOS**
· `ACHADO-V1` = **CONGELADO**. Provar que uma instalação ocorreu **não** prova nenhum requisito de
produto. Também não se declara *rollback* testado: `ROLLBACK_EXECUTION_NOT_TESTED`.

**8 · Decisão futura pendente — `D-FUND-R2-CONTINUITY-01`.** A continuidade **de dados** foi
preservada; a continuidade **do binário histórico** foi **rompida** em `2026-08-13 02:00:59`.
Logo, qualquer `R2` remanescente `B`..`E` só pode ser **prospectiva**, sobre binário posterior.

> 🟡 **PERGUNTA EM ABERTO (`D-FUND-R2-CONTINUITY-01`):** a `R2` remanescente `B`..`E` será
> **refundada prospectivamente** sobre a baseline pós-instalação, ou a **campanha histórica será
> encerrada** no estado atual?
>
> **NÃO decidida aqui.** A resposta é do fundador, e será registrada nesta página quando existir.
>
> ✅ **RESPONDIDA em 2026-08-13** — ver [`D-FUND-R2-CONTINUITY-01`](#d-fund-r2-continuity-01--refundar-prospectivamente-a-r2-remanescente-blocos-be-2026-08-13),
> logo abaixo. O texto acima **não é reescrito**: ele registra fielmente que, quando foi
> escrito, a pergunta estava aberta.

## `D-FUND-R2-CONTINUITY-01` — refundar prospectivamente a `R2` remanescente, Blocos `B`..`E` (2026-08-13)

**DECISÃO DO FUNDADOR: REFUNDAR PROSPECTIVAMENTE A `R2` REMANESCENTE · BLOCOS `B`..`E`.**

Responde a pergunta deixada em aberto por
[`D-FUND-HISTORICAL-INSTALL-BASELINE-01`](#d-fund-historical-install-baseline-01--a-instalação-de-1308-foi-provada-a-baseline-canônica-avança-2026-08-13)
§8. Baseline de entrada lacrada em
[artefato `30`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/30_CURRENT_BASELINE_R2_PROSPECTIVE_ORIGIN.md).

**1 · A campanha histórica permanece congelada.** A `R2` histórica fica **incompleta
exatamente no estado em que ocorreu**. Não é retomada, não é completada, não é
reinterpretada.

**2 · Nenhum `PASS` histórico é criado retroativamente.**

**3 · Nenhuma continuidade binária histórica é alegada.**

**4 · A instalação de 13/08 rompeu a continuidade do binário** da campanha antiga. Esse é o
fato que torna a refundação necessária — não uma preferência de método.

**5 · A continuidade dos dados foi preservada**, e o estado atual foi **novamente medido**
como íntegro: `CURRENT_ACERVO_INTEGRITY_PASS_IDENTICAL_TO_HISTORICAL_POST`, `14`/`14`
arquivos, zero perda, zero corrupção, zero órfãos.

**6 · Baseline de entrada da nova `R2`:** o `BUILD NATIVE 01` **já instalado**
(`CURRENT_DEVICE_TARGET_BINARY_IDENTITY_PROVED`) **+** a baseline atual do artefato `30`.

**7 · Os Blocos `B`..`E` serão executados com** nova origem prospectiva · novos *logs* ·
novas evidências · novos *hashes* · novos *verdicts*.

**8 · Nenhum `PASS` da campanha histórica é herdado automaticamente.**

**9 · Uso permitido da evidência histórica:** **somente** como contexto e proveniência.
**Nunca** apresentada como se tivesse sido produzida pela nova campanha.

**10 ·** `R1-PEND-1`..`5` mantêm seus **estados próprios** — esta decisão não os altera.

**11 ·** `F6-SG-A` permanece **NÃO CONCEDIDO**.

**12 ·** `F6-SG-C` permanece **NÃO CONCEDIDO**.

**13 ·** `SD-1` permanece **NÃO CONCEDIDO**.

**14 ·** `ACHADO-V1` permanece **CONGELADO** até seu ponto causal.

> ⛔ **Esta decisão autoriza a EXISTÊNCIA da campanha, não sua execução.** Os Blocos `B`, `C`,
> `D` e `E` **não foram executados**. Nenhum `PASS` de caso, nenhum *log* físico, nenhum ADB.

> 🔗 **Origem prospectiva.** A campanha nasce de `D-FUND-R2-CONTINUITY-01` **+** artefato `30`
> **+** o `HEAD` canônico desta transição; o commit que introduz a decisão e o artefato é a
> **âncora Git de origem**. *Timestamps* da campanha antiga **não** são reutilizados.

## `D-FUND-PREBUILD-01` — custódia do binário instalado no `SM-X510` (decisão anterior · **formalizada documentalmente em 2026-08-13**)

> ⚠️ **Esta entrada é NOVA.** Não existia texto desta decisão em `docs/DECISIONS.md` antes de
> `DOC REPAIR 01` (2026-08-13). A decisão do fundador **estava em vigor e era aplicada** — o
> artefato [`26`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/26_PREBUILD_CUSTODY_HARD_STOP.md)
> a invoca no cabeçalho, em §2 e em §3.4 — mas **nunca foi escrita aqui**. O que segue é a
> **formalização documental do alcance** da decisão anteriormente usada pelo artefato `26`.
> **Não** se finge que uma entrada escrita já existia antes; **não** se cria alcance novo além do
> que o artefato `26` de fato aplicou.

**Alcance canônico — inequívoco, item a item:**

1. O **binário atualmente instalado** no `SM-X510` (*package* `com.valentedev.pequenostracosdefe`,
   `versionCode 1` / `versionName 1.0.0`, assinatura `3351bd8d`, `firstInstallTime` ==
   `lastUpdateTime` == `2026-08-10 12:03:42`) permanece **sob custódia**.
2. **Não instalar** novo binário nesta etapa.
3. **Não desinstalar** o atual.
4. **Não substituir** o atual.
5. **Não executar `pm clear`** — nem qualquer outra limpeza de dados do *package*.
6. A **geração** de um novo binário, **por si só, não altera o aparelho e não viola esta
   custódia**. Custódia é propriedade **do aparelho**, não da máquina de *build*.
7. **Qualquer instalação futura exige missão e *gate* próprios** — com `applicationId`,
   assinatura, `versionCode`, prova de *upgrade in-place*, *backup* final do acervo e *rollback*
   declarado antes de começar.

**O que a custódia protege, concretamente.** O acervo da criança e a linha de base probatória da
`R2` vivem no mesmo aparelho: `databases/RKStorage` (`49152` bytes,
`CUSTODY_RKSTORAGE_AFTER_C10 = BYTE_IDENTICAL`, `SHA256 950D93D1…FFA1`), a cadeia `MAX_ROWID`, o
ponteiro e o *blob* do `C60`, e `files/ptf_blobs/drawings60/`. Uma desinstalação **destrói os
dois de uma vez** — é irreversível e não tem *backup* equivalente.

**Relação com `D-FUND-BUILD-SEQUENCE-01`.** Ver o bloco `SUPERSEDE PARCIAL` acima: **GERAR** está
autorizado; **INSTALAR · DESINSTALAR · SUBSTITUIR · LIMPAR DADOS** seguem **proibidos** sem *gate*
posterior próprio.

## `D-FUND-R1-PEND5-01` — `R1-PEND-5` é insumo irrecuperável (decisão anterior · **formalizada documentalmente em 2026-08-13**)

> ⚠️ **Esta entrada é NOVA.** Não existia texto desta decisão em `docs/DECISIONS.md` antes de
> `DOC REPAIR 01` (2026-08-13). O artefato `26` §7 e §12 a invocam; o texto normativo nunca foi
> escrito aqui. O que segue **formaliza documentalmente** o alcance já aplicado — **não** se
> finge que uma entrada textual anterior tivesse existido.

**Conteúdo normativo:**

1. **`R1-PEND-5` permanece ABERTA.**
2. O **`raw.log` original** exigido pela `R1` **não foi preservado e é irrecuperável** — artefato
   `10` §186, literal: *"o `raw.log` da `R1` não foi preservado e é irrecuperável"*.
3. É **proibido fabricar, sintetizar ou reconstruir retrospectivamente** esse `raw.log`. Nenhum
   documento do corpus autoriza, e nenhum passará a autorizar por omissão.
4. **Não existe saneamento administrativo** que transforme a ausência em evidência original —
   `PF6SGA-R2-GATE-SANEAMENTO` já decidiu, com todas as letras: **NÃO PERMITE**.
5. Se a pendência vier a ser perseguida futuramente, **somente uma repetição controlada da parcela
   mínima necessária** poderá produzir **NOVA** evidência.
6. Essa nova evidência **deve ser rotulada explicitamente como repetição posterior**, com a data e
   o `HEAD` da repetição visíveis.
7. Ela **não deve ser apresentada como o `raw.log` original**. São objetos distintos e o corpus
   deve poder distingui-los à primeira leitura.
8. Ela **não cria `PASS` retroativo por si só**.
9. **Qualquer adjudicação futura** sobre o efeito dessa repetição **exige decisão explícita** — do
   fundador, registrada aqui, nunca inferida por um agente.
10. **`F6-SG-A` continua NÃO CONCEDIDO.**

**Distinção que precisa sobreviver.** `PF6SGA-R1-VEREDITO` afirma que *"as 5 pendências são de
ARQUIVO… nenhuma exige repetir a rodada"*. Isso é **verdadeiro para `R1-PEND-1..4`**, que são
saídas de comando reobteníveis num pré-voo. É **falso para `R1-PEND-5`**: um insumo irrecuperável
não se fecha por arquivamento posterior. As duas afirmações convivem porque tratam de objetos
diferentes — e esta decisão existe para que a segunda não seja engolida pela primeira.

## `D-FUND-R2P1-RETRY-ENTRY-BASELINE-01` — baseline operacional de entrada para *retries* do `R2P1` (2026-08-13)

Decisão **do fundador**, tomada após o `STOP` de entrada da tentativa `R2P1_RETRY_01`.
Registro técnico integral em
[artefato `31`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/31_R2P1_RETRY_ENTRY_BASELINE_01.md).

**Conteúdo normativo:**

1. **`R2P1_RETRY_01` permanece definitivamente encerrada** como
   `R2P1_STOP_ENTRY_BASELINE_DIVERGED`. Esse `STOP` **não** pode ser convertido em `PASS`, em
   *retry* válido ou em tentativa descartada. A tentativa `R2P1` anterior permanece encerrada em
   `R2P1_STOP_LOGCAT_DROPPED`. **Toda a evidência das duas permanece lacrada e intacta.**
2. **O artefato `30` permanece IMUTÁVEL.** Ele segue sendo a baseline de **proveniência e
   invariantes de produto**. **Nenhum arquivo dele pode ser regravado, substituído ou
   atualizado** — e nenhum foi.
3. **Fica criada a baseline operacional de entrada `R2P1_RETRY_ENTRY_BASELINE_01`**,
   representando o estado estabilizado do aparelho **depois** da inicialização de
   infraestrutura e **com o aplicativo parado**. Origem: o `TAR` do item `13` do pré‑voo de
   `R2P1_RETRY_01` (`SHA256 DA87831C…AB81`, `17234944` *bytes*, `22` entradas), capturado
   **antes** de qualquer nova abertura do aplicativo. Custódia:
   `C:\tmp\ptf_evidencias\R2P1_RETRY_ENTRY_BASELINE_01\`.
4. **As duas baselines têm funções distintas e não se substituem:**
   `ARTEFATO 30 = proveniência e invariantes de produto` ·
   `RETRY ENTRY BASELINE = igualdade física de entrada entre retries prospectivos`.
5. **Isto NÃO é *allowlist*.** Os cinco arquivos infraestruturais divergentes **não** foram
   declarados toleráveis e **não** ganharam permissão de mudar. **Nenhuma tolerância nova foi
   criada. `AC-5` não foi criado**, nem explícita nem implicitamente. O `compare_state.py`
   **não** foi editado.
6. **O que houve foi congelamento, não liberação:** a inicialização **já ocorrida** ficou
   fixada **dentro** da baseline, e cada um dos cinco arquivos passa a ter um **valor esperado
   exato** (*hashes* em [artefato `31`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/31_R2P1_RETRY_ENTRY_BASELINE_01.md) §6).
7. **O próximo item `14` continua sendo um *gate* de IGUALDADE ESTRITA**, agora contra esta
   baseline: `ESCOPO_OK=SIM` **e** os **sete** contadores em **zero**. **Qualquer** divergência
   volta a produzir **`STOP`**.
8. **Tolerâncias admitidas:** **somente** as que já estivessem **formalmente aprovadas antes
   desta decisão** — hoje, exclusivamente `databases/RKStorage-journal`.
9. **A verificação das invariantes de produto contra o artefato `30` permanece obrigatória e
   inalterada** (`RKStorage` · os três *blobs* de `ptf_blobs` · `storage-info.pb` · os três
   `shared_prefs` do produto · `catalystLocalStorage` com `KEYS_ADDED`, `KEYS_CHANGED`,
   `KEYS_DELETED` e `KEYS_ROWID_MOVED` em zero). Reconferidas em 2026-08-13: **`8`/`8`
   arquivos idênticos e `4`/`4` contadores em zero**, com `RKStorage` = `950D93D1…FFA1`, o
   mesmo valor de `CUSTODY_RKSTORAGE_AFTER_C10 = BYTE_IDENTICAL`.
10. **Substituir esta baseline exige decisão explícita do fundador**, registrada aqui. Nenhum
    agente a redefine por conveniência de *gate*.
11. **Registro de custódia:** com o aplicativo **já parado** e o tablet na **Home do Android**,
    ocorreram **dois toques humanos na tela**, feitos **exclusivamente** para evitar
    bloqueio/apagamento. **Não** lhes é atribuída causalidade sobre as cinco divergências —
    ficam registrados como intervenção física conhecida **fora da janela causal** e **fora da
    janela probatória** da futura execução.
12. **Esta decisão NÃO autoriza a execução de `R2P1_RETRY_02`.** Ela regulariza a **entrada**.
    **`F6-SG-A` permanece NÃO CONCEDIDO.**

> ⛔ **`READY` descreve a baseline, não autoriza a execução.** `R2P1_RETRY_02` **não** foi
> iniciada: nenhum aplicativo aberto, nenhum *deep link*, nenhum Metro, nenhum `adb reverse`,
> nenhum `TAR` restaurado, **nenhum comando emitido ao aparelho** nesta etapa.

## `D-FUND-R2P1-ENTRY-RESET-01` — reset determinístico da baseline de entrada (2026-08-13)

Decisão explícita do fundador, tomada **depois** de aceitar integralmente o
`R2P1_ENTRY_RESET_AUDIT_STOP` emitido pela auditoria adversarial independente. O `STOP`
**não** rejeitou a arquitetura do reset: bloqueou sua **execução**, porque o procedimento
destrutivo ainda não existia em forma **auditável, versionada ou selada**, e porque restavam
**lacunas normativas** a resolver antes da primeira restauração. Esta decisão elimina esses
bloqueios — e **somente** eles.

O procedimento integral, com **todos** os comandos destrutivos visíveis literalmente, está em
[artefato `32`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/32_R2P1_ENTRY_RESET_DESIGN_01.md),
**versão `DESIGN_03`** (`327924` *bytes*, `4926` linhas,
`SHA256 5B0083D49C0AAC484F3D77CD9C4770028CE346945915E52EEA3BE38CCF9E14D2`). O plano da próxima
execução física está em
[artefato `33`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/33_R2P1_ULTRACODE_NEXT_EXECUTION_PLAN.md)
(`13515` *bytes*, `SHA256 0C8A8794CC2DD05CAB33317B0413833D11687B0E5DAA89A18BDA7040743B7DAA`).
Cópia lacrada, auditoria estática, vinculação de decisões e manifesto em
`C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_03\`.

As versões anteriores permanecem **intactas e consultáveis**: `DESIGN_01` (commit `033ac60`,
`92029` *bytes*) em `C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_01\` e `DESIGN_02` (commit
`a275ee6`, `212435` *bytes*, `SHA256 2CB45E1B…3B44`) em
`C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_02\`, como registro histórico das versões que
receberam, respectivamente, `R2P1_ENTRY_RESET_MATERIALIZED_AUDIT_STOP` e
`R2P1_ENTRY_RESET_HARDENED_FINAL_AUDIT_STOP`. **Nenhuma delas** foi alterada, apagada, renomeada
ou sobrescrita — ver itens `15` e `16`.

**Conteúdo normativo:**

1. **`R2P1_RETRY_ENTRY_BASELINE_01` continua sendo a ÚNICA baseline operacional de entrada** e
   **não** é substituída a cada *retry*. O que muda é que ela passa a poder ser **reproduzida**,
   de forma determinística, **antes** do item `13`, sob **`HUMAN GATE` próprio**.
2. **Finalidade:** tornar os *retries* repetíveis **sem** baseline nova, **sem** tolerância nova,
   **sem** *allowlist*, **sem** `AC-5` e **sem** alterar o `compare_state.py`.
3. **Os dois papéis permanecem, e nenhum é removido:**
   `ARTEFATO 30 = proveniência e invariantes históricas de produto` ·
   `R2P1_RETRY_ENTRY_BASELINE_01 = estado operacional de entrada reproduzível`.
   **A verificação das invariantes contra o artefato `30` continua obrigatória.**
4. **Fica criado o token `R2P1_STOP_ENTRY_RESET_FAILED`**, de uso **exclusivo** para falha
   **dentro** da operação de reset, **antes** de a restauração ter sido concluída e validada
   pelos itens `13` e `14`: falha de remoção, falha de extração, `adb` perdido durante mutação,
   estado parcial, necessidade de *rollback*, estrutura restaurada inválida, metadado estrutural
   crítico divergente, `SELinux` divergente da referência pré‑remoção, ou qualquer estado
   parcialmente restaurado ou indeterminado. **Ele NÃO substitui
   `R2P1_STOP_ENTRY_BASELINE_DIVERGED`**, que continua sendo o token de restauração **concluída**
   cujo item `14` acusou divergência. **A distinção é normativa.**
5. **O *rollback* pertence à MESMA autorização de execução** e **não** exige segundo
   `HUMAN GATE` depois que a operação destrutiva começou. Condições cumulativas: `E3` concluído
   com sucesso · `TAR` no *host* · tamanho e `SHA256` registrados · listagem registrada · falha
   posterior ao início de `E5` · nenhuma dúvida sobre a qual execução o *rollback* pertence.
6. **`ROLLBACK_ATTEMPTS = 1`.** Proibidos: laço de *rollback*, nova restauração "para testar",
   segunda tentativa automática e reexecução de `E5`/`E6` para fazer passar. **Um *rollback*
   bem‑sucedido NÃO converte a execução em `PASS`:** o resultado continua
   `R2P1_STOP_ENTRY_RESET_FAILED`. Se o *rollback* **não** puder ser executado: **não** improvisar,
   **não** restaurar de novo, **não** abrir o aplicativo, **não** usar `pm clear`, **não** instalar,
   **não** apagar mais nada — classificar `R2P1_STOP_ENTRY_RESET_FAILED` com
   `DEVICE_STATE = INDETERMINATE` e aguardar novo `HUMAN GATE`.
7. **`MTIME_GATE = DIAGNOSTIC_ONLY`.** `mtime` **não** entra no veredito de igualdade do item `14`
   e **não** pode, sozinho, produzir `R2P1_STOP_ENTRY_BASELINE_DIVERGED`. É registrado para
   forense, atribuição temporal e comparação entre restaurações. **Nenhum *gate* novo é criado
   por `mtime`.**
8. **`RESET_WINDOW_SCOPE_RULE = HARD_STOP`.** Entre o início de `E5` e o encerramento válido do
   item `14`, `ESCOPO_OK = NAO` **não** autoriza recaptura, repetição de captura, prosseguimento
   nem explicação como "falha de comando". A regra histórica de recaptura — criada para capturas
   **não** destrutivas — **não** se aplica dentro da janela de reset.
9. **Invariantes de produto ANTES da remoção.** Antes de qualquer `E5`, o estado físico **atual**
   é comparado ao artefato `30`, exigindo **`8`/`8`** invariantes idênticas **e**
   `KEYS_ADDED`/`KEYS_CHANGED`/`KEYS_DELETED`/`KEYS_ROWID_MOVED` em **zero**
   (`PRE_RESET_PRODUCT_INVARIANTS = PASS`). Divergência **anterior** ao reset produz
   **`STOP` ANTES DA REMOÇÃO** — para que a restauração não apague a evidência dela. **Isto não
   substitui `E8`:** as invariantes são verificadas **duas** vezes, antes e depois.
10. **`SELinux`.** **Não existe referência histórica pré‑existente de `ls -Z`** e nenhum valor
    histórico é presumido. A referência é o `SELINUX_PRE` **da própria execução** (`E4A`),
    comparado ao `SELINUX_POST` (`E7A`). Divergência material produz
    `R2P1_STOP_ENTRY_RESET_FAILED` — **sem** correção silenciosa por `restorecon`, `chcon`, *root*
    ou qualquer mecanismo não autorizado.
11. **Modos, dono e grupo.** Esperado `uid 10364` / `gid 10364`, reconfirmado no item `12`. Como o
    comportamento real do `tar -x` do *toybox* **nunca foi exercido** neste aparelho, a reprodução
    de modos **não** é presumida: `MODE_PRE` (`E4B`) e `MODE_POST` (`E7B`). Conteúdo correto com
    modos de acesso divergentes produz `R2P1_STOP_ENTRY_RESET_FAILED`. **Nenhum `chmod` corretivo
    silencioso** — a primeira execução existe justamente para **medir** o comportamento real do
    mecanismo, e **nenhum `chmod` passa a ser autorizado**.
12. **`RESTORE_ATOMIC = NAO` · `PARTIAL_FAILURE_DETECTABLE = SIM`.** O procedimento **não** finge
    transação inexistente. A segurança vem de *rollback* prévio, lista explícita, verificação
    estrutural, `TAR` posterior, comparador selado, invariantes antes e depois, `SELinux` antes e
    depois, modo/dono antes e depois, e `STOP` duro.
13. **Esta decisão NÃO autoriza execução.**
    `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` **não** foi concedido · `R2P1_RETRY_03`
    **não** foi iniciada · **`F6-SG-A` permanece NÃO CONCEDIDO**. O futuro `HUMAN GATE` de
    execução **deverá citar o `SHA256` integral do desenho autorizado**, de modo que o executor
    não possa executar comandos diferentes dos auditados.
14. **⛔ Supersessão LIMITADA e EXPRESSA da proibição histórica de restaurar `TAR`.** Esta cláusula
    existe porque o conflito é **real**, não aparente, e porque a resolução **não pode depender**
    da regra tácita *"a decisão mais nova prevalece"*. As duas passagens em conflito são citadas
    **nominalmente**: `14_R2_SESSAO_2.md` §11, **condição de `STOP` nº `14`** — *"Necessidade de
    restaurar `TAR` para «consertar» o estado de entrada"* — e `14_R2_SESSAO_2.md` §8.1 (`G-09`) —
    *"🔴 NÃO restaurar `TAR` por reflexo. O aparelho já está no estado correto […] Restaurar é
    operação destrutiva e desnecessária. Primeiro compara-se; restaurar não é o caminho de
    correção deste gate."* **Ambas continuam VÁLIDAS e em vigor**, integralmente, fora da janela
    aqui delimitada. `D-FUND-R2P1-ENTRY-RESET-01` cria uma **exceção procedimental específica**, e
    **somente** ela, assim delimitada: **(a) natureza** — supersessão **limitada** e
    **prospectiva**; não revoga, não reescreve e não reinterpreta o §8.1 nem o item `14` do §11;
    **(b) janela** — exclusivamente o intervalo delimitado por
    `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION`, fora do qual o item `14` volta a valer **sem
    qualquer atenuação**; **(c) posição** — sempre **anterior ao item `13`**, nunca durante, nunca
    depois; **(d) pré-condições cumulativas** — app parado · sem Metro · sem `PS3` · sem *reverse* ·
    sem *deep link* · *rollback* capturado e verificado · invariantes de produto pré-reset
    aprovadas · comando integral auditado e selado por `SHA256`. **O que a exceção NÃO faz:**
    ⛔ não cria tolerância de estado; ⛔ não transforma restauração em resposta genérica a `STOP`;
    ⛔ **não** autoriza restauração depois de `R2P1_STOP_ENTRY_BASELINE_DIVERGED`; ⛔ não altera o
    artefato `30`; ⛔ não altera a baseline; ⛔ não cria `AC-5`, *allowlist* ou tolerância nova.
    **A distinção material:** o §8.1 proíbe restaurar **como conserto** — divergiu, restaura-se
    por cima e o gate passa —, o que destrói a evidência da divergência e continua
    **terminantemente proibido, inclusive dentro desta janela**. Esta janela autoriza **outra**
    operação: fabricar deliberadamente, **antes** do gate, o estado de entrada conhecido, para que
    os itens `13` e `14` tenham algo **honesto** para medir. O gate continua sendo julgado
    **depois** e continua podendo reprovar.
    `SCOPE_HISTORICAL_CONFLICT_EXPLICITLY_SUPERSEDED = SIM`.
15. **Endurecimento após a segunda auditoria adversarial — supersessão documental limitada.** A
    materialização do commit `033ac60` foi ao `VERDE` e voltou com
    **`R2P1_ENTRY_RESET_MATERIALIZED_AUDIT_STOP`**. Pela **segunda** vez a **arquitetura foi
    aceita** e a **execução foi bloqueada** — agora por **defeitos literais de execução**, não por
    lacuna normativa. Registro:
    - **O que foi superseded:** apenas a **redação executável** do artefato `32` e o `SHA256` que
      o `HUMAN GATE` deve citar. **Nenhum item `1`..`13` acima foi revogado, reaberto ou
      reinterpretado**; nenhum passo do procedimento foi removido; **nenhum comando novo ao
      aparelho foi introduzido**.
    - **`SHA256` vinculante a partir de agora:**
      `2CB45E1B1A2E885652C0C8D91561B0BCF5284860F54EFE8E5D94125D635B3B44` (`212435` *bytes*).
      **É o único valor que o `HUMAN GATE` de execução pode citar.**
    - **Hash anterior — aposentado para autorização, preservado como história.** O manifesto de
      `DESIGN_01` registra `B87D58FC3E8D7D2D…B0B6`; a auditoria do `VERDE` reporta
      `B87D58FC8E3D…` (dois dígitos transpostos **entre os dois registros textuais**, não entre
      dois arquivos: a cópia lacrada continua byte-idêntica ao artefato do commit `033ac60`).
      **Ambos os valores ficam aposentados para efeito de autorização** e permanecem apenas como
      **proveniência histórica**. Nenhum dos dois pode ser citado por `HUMAN GATE` futuro.
    - **Custódia:** `C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_02\` (raiz nova; `PREEXISTIA =
      NÃO`). **`…\R2P1_ENTRY_RESET_DESIGN_01\` permanece intacta** — nenhum arquivo dela foi
      alterado, apagado, renomeado ou sobrescrito.
    - **`compare_state.py` permanece lacrado** em `A7649DD2…FDFD`, **não editado** e **não
      parametrizado**: `COMPARE_STATE_EDIT_REQUIRED = NÃO`.
    - **Estado das autorizações, inalterado por esta etapa:** `DEVICE_COMMANDS = 0` ·
      `TAR_RESTORE = 0` · `FILES_DELETED_ON_DEVICE = 0` · nenhuma restauração ·
      `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` **NÃO CONCEDIDO** · `R2P1_RETRY_03`
      **NÃO INICIADA** · `F6-SG-A` **NÃO CONCEDIDO** · baseline **inalterada**.
16. **Terceira auditoria adversarial, correção integral e ESCOPO NOMINAL DO `HUMAN GATE`
    (2026-08-14).** O `DESIGN_02`, selado no commit `a275ee6`, voltou do `VERDE` com
    **`R2P1_ENTRY_RESET_HARDENED_FINAL_AUDIT_STOP`**. Pela **terceira** vez a **arquitetura foi
    aceita** e a **execução foi bloqueada** — desta vez por **afirmação sem implementação**:
    tabelas que descreviam guardas inexistentes. A correção foi **prospectiva e integral**;
    `a275ee6` **não** foi reescrito, e nenhum *hash* histórico foi alterado.
    - **Um gate autoriza uma tentativa — e o nome carrega o escopo.** A redação anterior podia
      ser lida como cobrindo tentativas futuras. Fica estabelecido: `RETRY_03` exige
      `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION`; `RETRY_04` exige
      `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_04`; `RETRY_05` exige
      `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_05`; e a série continua **nominalmente**
      (`..._REEXECUTION_<NN>`). **Não existe gate "aberto", gate "de série" nem renovação
      automática.** Concluída ou interrompida a tentativa, o gate está **consumido**, ainda que
      nenhum arquivo tenha sido removido. Regras integrais `G-1`…`G-7` em §`17.1` do artefato `32`.
    - **Nenhum gate se estende** a outra baseline, a outro aparelho ou a outra raiz de evidência.
      A **única** extensão admitida continua sendo a do item `5` — o *rollback* pertence à
      autorização da tentativa que o disparou —, e ela é **para trás**, nunca para frente.
    - **Todo gate cita o `SHA256` integral do desenho, e isso agora é barreira executável.** O
      bloco `E0.0` do artefato `32` compara *bytes* e `SHA256` do desenho no repositório, do
      desenho em custódia e do valor citado no gate **antes** de qualquer outro passo:
      `R2P1_STOP_GATE_SEM_SHA` se o gate não citar `SHA256` de `64` dígitos;
      `R2P1_STOP_DESIGN_CUSTODY_DIVERGED` se os três não forem o mesmo objeto.
    - **`SHA256` vinculante a partir de agora:**
      `5B0083D49C0AAC484F3D77CD9C4770028CE346945915E52EEA3BE38CCF9E14D2` (`327924` *bytes*).
      **É o único valor que o `HUMAN GATE` de execução pode citar.** O valor
      `2CB45E1B…3B44` (`DESIGN_02`) fica **aposentado para efeito de autorização** e permanece
      apenas como proveniência histórica, ao lado dos de `DESIGN_01`.
    - **Fica criado o token `R2P1_STOP_EVIDENCE_ROOT_PREEXISTS`** — raiz de evidência
      preexistente (`$EXEC`, `$RSTC`, `$RST01`, `$RST02`) é `STOP`, nunca reaproveitamento.
    - **Plano da próxima execução física materializado** como artefato `33`
      (`R2P1_ULTRACODE_NEXT_EXECUTION_PLAN`), versionado e lacrado. Ele define
      `HUMAN_GATE_R2P1_BLOCK_B_READY` — o gate **posterior** ao reset, que autoriza a retomada dos
      itens `21`..`24` do `BLOCO B` e **nada além disso**.
    - **Estado das autorizações, inalterado por esta etapa:**
      `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` **NÃO CONCEDIDO** ·
      `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_04` **NÃO CONCEDIDO** ·
      `HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_05` **NÃO CONCEDIDO** ·
      `HUMAN_GATE_R2P1_BLOCK_B_READY` **NÃO CONCEDIDO** · `R2P1_RETRY_03` **NÃO INICIADA** ·
      `F6-SG-A` **NÃO CONCEDIDO** · baseline **inalterada** · `DEVICE_COMMANDS = 0`.

17. **⚠️ `HUMAN_GATE_R2P1_ENTRY_RESET_FIRST_EXECUTION` = `CONCEDIDO` (2026-08-14).** Concedido
    **pelo fundador**, por mensagem direta, cujo ato de envio constitui a própria concessão. O
    item `16` acima **não é reescrito**: ele permanece como registro histórico do estado
    `NÃO CONCEDIDO` que vigorava até esta data. Esta concessão é **aditiva e posterior**.
    - **Escopo:** **exatamente uma** execução de `R2P1_RETRY_03`. Nada além disso.
    - **`HEAD` de entrada vinculado:** `2051e75b7ce22b9731c7e2952bdddfd85980239b`.
    - **`DESIGN` (artefato `32`, `DESIGN_03`) — `SHA256` citado pelo gate:**
      `5B0083D49C0AAC484F3D77CD9C4770028CE346945915E52EEA3BE38CCF9E14D2` (`327924` *bytes*).
      É o valor que `E0.0` exige em `$GATE_SHA`.
    - **`ULTRACODE PLAN` (artefato `33`) — `SHA256` citado pelo gate:**
      `0C8A8794CC2DD05CAB33317B0413833D11687B0E5DAA89A18BDA7040743B7DAA` (`13515` *bytes*).
    - **Custódia executável:** `C:\tmp\ptf_evidencias\R2P1_ENTRY_RESET_DESIGN_03\`. As custódias
      `_01` e `_02` permanecem **históricas** e **não** são objeto executável.
    - **Consumo:** a concessão é **consumida** tanto por `PASS` quanto por `STOP`. Encerrada a
      tentativa — concluída ou interrompida —, o gate está **gasto**.
    - **`HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_04` — `NÃO CONCEDIDO`.** `RETRY_04` **não** pode
      ser iniciada por nenhum motivo, inclusive após `STOP`.
    - **`HUMAN_GATE_R2P1_ENTRY_RESET_REEXECUTION_05` e posteriores — `NÃO CONCEDIDOS`.**
    - **`HUMAN_GATE_R2P1_BLOCK_B_READY` — `NÃO CONCEDIDO`,** inclusive em caso de `PASS`. O
      artefato `33` pode **medir e reportar** as pré-condições desse gate; **não** pode concedê-lo.
      `CASO 7`, `CASO 8`, `BLOCO B` e `F6-SG-A` seguem **não autorizados**.
    - **Não autorizados por esta concessão:** instalação, reinstalação ou troca de binário ·
      desinstalação · `pm clear` · `root` / `adb root` · `setenforce` / `restorecon` / `chcon` ·
      tolerância, *allowlist* ou `AC-5` · edição de `compare_state.py` · troca de baseline ·
      `push`, `merge`, `rebase`, `amend` ou `squash`.

> ⛔ **Materialização não é execução.** Nesta etapa: `DEVICE_COMMANDS = 0` · `TAR_RESTORE = 0` ·
> `FILES_DELETED_ON_DEVICE = 0` · `APP_OPEN = 0` · `METRO_START = 0` · `PS3_START = 0` ·
> `DEEPLINK = 0`. Nenhuma baseline foi trocada, nenhuma tolerância criada, nenhuma *allowlist*
> aberta, nenhum `AC-5` cunhado e o `compare_state.py` permanece lacrado em
> `A7649DD2…FDFD`.

## `D-FUND-R2P1-CLOSURE-01` — encerramento documental do `R2P1_RETRY_03` (2026-08-14)

Decisão **do fundador**, tomada após receber a análise causal fechada do `STOP` de `E3A`.
Registro técnico integral em
[artefato `34`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/34_R2P1_RETRY_03_CLOSURE_E_ARBITRAGEM_PROSPECTIVA.md).

**Conteúdo normativo:**

1. **`R2P1_RETRY_03` fica fixada, literalmente, como `STOP_PRE_MUTATION`.** O *token* terminal
   histórico permanece **`R2P1_STOP_ENTRY_RESET_FAILED`**, emitido no local **`E3A`**. A etapa
   **`E5` não foi executada**.
2. **Fatos físicos lacrados da tentativa:** `FILES_DELETED_ON_DEVICE = 0` ·
   `TAR_RESTORE_ON_DEVICE = 0` · *rollback* **não utilizado** · estado final do aparelho
   **`INTACT`**.
3. **O `STOP` permanece verdadeiro e preservado. Ele NÃO é convertido em `PASS`.** Nenhuma
   tolerância, *allowlist* ou `AC-5` é criada para torná-lo retroativamente aprovado, e nenhum
   critério é afrouxado com esse efeito.
4. **O reset determinístico da baseline de entrada permanece `PHYSICAL_PROOF_INCOMPLETE`.** Ele
   **não** foi provado fisicamente e **não** é declarado concluído.
5. **`F6_CLOSURE_BLOCKER = NÃO`.** Motivo — e apenas este: o reset determinístico era uma
   **camada posterior de endurecimento da infraestrutura de entrada**, não um requisito
   funcional adicional do Roteiro para os blocos prospectivos `B`–`E` **já autorizados**. Sua
   incompletude física **não** cria requisito novo de produto nem invalida a autorização
   existente.
6. **A origem da `R2` prospectiva permanece governada por `D-FUND-R2-CONTINUITY-01`** e pela
   baseline lacrada no [artefato `30`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/30_CURRENT_BASELINE_R2_PROSPECTIVE_ORIGIN.md).
   Nada nesta decisão desloca essa origem.
7. **Ficam proibidos, sem exceção:** executar `RETRY_04` · recanonicalizar a entrada do `R2P1` ·
   criar `BASELINE_02` · reabrir a auditoria `A`–`F` do reset · alterar o `DESIGN` (artefato `32`)
   · alterar o `PLAN` (artefato `33`) · editar `compare_state.py`.

> ⛔ **Encerrar documentalmente não é aprovar.** `R2P1_RETRY_03` continua sendo um `STOP`. Esta
> decisão apenas **retira o reset determinístico do caminho crítico da Fase 6** — ela não o
> declara feito, não o converte em evidência e não o apaga do histórico.

## `D-FUND-R1-PEND5-EVIDENCE-GAP-01` — aceitação da lacuna de custódia do `R1-PEND-5` (2026-08-14)

Decisão **do fundador**. Complementa — sem substituir — `D-FUND-R1-PEND5-01`.

**Conteúdo normativo:**

1. **`R1-PEND-5` é a ausência histórica do `raw.log` da `R1`**, que **não foi preservado à
   época** e é, hoje, **irrecuperável**. O log não existe mais e nenhuma operação pode fazê-lo
   existir.
2. **É proibido:** fabricá-lo · reconstruí-lo · sintetizá-lo · retrodatá-lo · apresentar
   qualquer log novo como se fosse o antigo. Nenhuma dessas condutas é aceitável sob nenhum
   pretexto de completude.
3. **Fica registrado o *token* terminal `R1_PEND_5 = EVIDENCE_GAP_ACCEPTED_BY_FOUNDER`.**
4. **O que esta decisão fecha:** exclusivamente a **lacuna de custódia**. **O que ela não faz:**
   não altera o resultado funcional observado da `R1` · não cria evidência inexistente · não
   autoriza esconder nenhum `FAIL` real, presente ou futuro.

## `D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01` — árbitro de estado da `R2` prospectiva (2026-08-14)

Decisão **do fundador**, aplicável **somente de forma prospectiva** à campanha `B`–`E`.

**Conteúdo normativo:**

1. **Separação de eixos.** Passam a ser julgados separadamente o **`ESTADO LÓGICO DE PRODUTO`**
   e o **`BOOKKEEPING / INFRAESTRUTURA DA PLATAFORMA`**. Os dois continuam sendo **medidos e
   registrados**; apenas deixam de ser confundidos num único veredito.
2. **`compare_state.py` permanece LACRADO e NÃO PODE SER EDITADO** (`SHA256`
   `A7649DD2…FDFD`, `4380` *bytes*). Seu resultado global continua sendo **evidência de
   primeira ordem e é preservado integralmente**. O que muda é apenas isto: **o *token* agregado
   de igualdade binária deixa de ser, sozinho, o árbitro de `PASS`/`FAIL` dos casos
   prospectivos**.
3. **`RKStorage` — árbitros de produto:** conjunto de chaves · tipos · valores serializados ·
   chaves adicionadas · chaves removidas · valores alterados.
4. **`RKStorage` — diagnósticos físicos, que sozinhos não produzem `FAIL`:** *file change
   counter* do SQLite · *version-valid-for* · mudança de `rowid` **quando chave, tipo e valor
   permanecem idênticos**.
5. **`KEYS_ADDED`, `KEYS_CHANGED` e `KEYS_DELETED` inesperados permanecem materialmente
   relevantes.** **Nenhuma alteração lógica pode ser mascarada.**
6. **`files/phenotype_storage_info/shared/storage-info.pb`** fica classificado, **de forma
   prospectiva**, como **`PLATFORM_BOOKKEEPING_DIAGNOSTIC`** — bookkeeping do Phenotype /
   Google Play Services, **não** dado lógico infantil. Esta classificação **não** modifica
   relatórios históricos e **não** transforma nenhum `STOP` histórico em `PASS`.
7. **Superfícies de infraestrutura já classificadas** — registradas **separadamente** sempre
   que mudarem: `files/profileInstalled` · `shared_prefs/WebViewChromiumPrefs.xml` ·
   `shared_prefs/android.app.ActivityThread.IDS.xml` ·
   `shared_prefs/expo.modules.devlauncher.recentyopenedapps.xml` ·
   `files/DevLauncherApp-*DevBundle.js` ·
   `files/phenotype_storage_info/shared/storage-info.pb`. Elas **devem ser registradas, nunca
   ocultadas**, **não recebem `AC_5`** e **não reprovam um caso sozinhas**.
8. **Escritor novo ⇒ `HARD STOP`.** Qualquer caminho mutado que **não** esteja classificado no
   corpus, **não** seja efeito previsto da própria ação do caso e **não** seja atribuível com
   evidência produz **`HARD STOP`**. **É proibido criar `AC_5`.**

## `D-FUND-R2-CASO6-ANTECEDENT-01` — ciclo antecedente do `CASO 6` (2026-08-14)

Decisão **do fundador**, aplicável à campanha prospectiva `B`–`E`.

**Conteúdo normativo:**

1. **O ciclo antecedente exigido pelo `CASO 6` é o Bloco `B` imediatamente anterior**
   (`CASO 7` → `CASO 8`). Nenhum ciclo histórico é herdado para esse papel.
2. **O antecedente só é válido se a comparação pós-Bloco `B` provar, cumulativamente:** nenhuma
   gravação lógica de produto incompatível com os critérios dos casos `7` e `8` · nenhum
   trabalho perdido · nenhuma alteração lógica de valor inesperada · nenhuma violação das
   invariantes `ZERO`.
3. **Bookkeeping de infraestrutura já classificado não constitui "gravação de produto"** para
   efeito deste antecedente.
4. **Se o Bloco `B` produzir alteração lógica de produto real e inesperada, o `CASO 6` NÃO é
   executado** — emite-se `STOP` antes dele.

## D-FUND-R2-BE-CLOSURE-01 — encerramento da `R2` prospectiva `B`–`E` e transição para o fechamento da Fase 6

**Decidido em 2026-08-14.** Fecha a campanha física prospectiva da `R2` e autoriza a transição para
a reta de encerramento da Fase 6. Artefatos:
[`35_R2_PROSPECTIVA_BE_FECHAMENTO.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/35_R2_PROSPECTIVA_BE_FECHAMENTO.md)
e
[`36_RECONCILIACAO_FECHAMENTO_FASE_6.md`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/36_RECONCILIACAO_FECHAMENTO_FASE_6.md).

1. **`R2_PROSPECTIVE_BE = PASS`.** `CASO 7`, `CASO 8`, `CASO 6`, `CASO 11` (histórico **e**
   reexecução causal), `CASO 17` e `CASO 12` = `PASS`. Nenhum `FAIL` aberto nos blocos `B`–`E`.
2. **O `PASS` do `CASO 12` vale dentro da cobertura congelada `CASO12-PARCIAL-01`, estágio físico
   `E0`** — *watcher* disparado pelo ✓ Pronto!, *kill* em `UP+117 ms`, salvamento iniciado, morte
   antes de `T2`, última geração válida íntegra, `CK-E-C12` byte a byte idêntico a `CK-D-C17`,
   nenhuma geração parcial promovida, amarelo não persistir compatível com `PASS`. **`E1` e `E2`
   NÃO foram fisicamente exercitados** e os **quatro estágios injetados continuam `NÃO
   EXECUTADOS`**. **É proibido ampliar esta conclusão para "todos os pontos de falha foram
   testados".**
3. **`CASE12_TWO_FILL_DEVIATION = SCOPE_DEVIATION_NONBLOCKING`** — ambos os preenchimentos
   ocorreram antes do armamento, nenhum chegou ao disco, o disparo foi inequivocamente o ✓ Pronto!,
   e o segundo foi induzido por instrução ambígua do painel.
4. **`CASE12_PANEL_DEFECT = HOST_TOOL_DEFECT`** — defeito da ferramenta de condução
   (`caso12_host_v3.ps1`), **não do produto**. A correção fica **especificada e NÃO aplicada**
   (`PREPARAÇÃO` → `MÃOS FORA` → `VERMELHO / GATILHO ARMADO`; **nunca mais** instrução genérica de
   "pode tocar na tela"). **Não gera requisito de produto, não reabre o `CASO 12` e não repete sua
   execução.**
5. **`CASO 9 = NÃO REPRODUZIDO` / `NÃO BLOQUEIA`.** `onRenderProcessGone` não ocorreu
   espontaneamente. **Não provocar. Não inventar causa.**
6. **Acervo lacrado** em `C:\tmp\ptf_evidencias\R2_PROSPECTIVE_BE_01\` com `SHA256` por arquivo.
   **Nada foi movido, restaurado ou reescrito.** `compare_state.py` permanece lacrado e nunca
   editado. Ressalva declarada: `raw_campaign.log` está **aberto para escrita** pelo `PS3` e possui
   apenas **hash de prefixo** datado — seu lacre definitivo exige encerrar o `PS3`, ato não
   autorizado nesta decisão.
7. **`R2_PROSPECTIVE_BE = PASS` É DIFERENTE DE `F6-SG-A = PASS`.** Esta decisão **não concede**
   `F6-SG-A`, `F6-SG-B`, `F6-SG-C`, `F6-SG-D`, `SD-1`, `R1` nem `F6_CLOSED`.
8. **`F6_CLOSURE_RECONCILIATION_READY`.** A reconciliação fechada classifica cada obrigação
   remanescente em `A`/`B`/`C`/`D`/`E` e produz a matriz e a sequência mínima até `F6_CLOSED`.
   Regra aplicada: **não repetir prova válida apenas porque o `HEAD` mudou; executar somente gaps
   causalmente reais.** Achados estruturais: **`F6-R2`/`F6-SG-B` não tem nenhum *commit* de
   implementação** e vem **antes** de `F6-SG-C` na ordem obrigatória; **`B4` + `B5` são o critério
   de saída literal** da Fase 6 no `v5` §3.
9. **`F6_CLOSED` NÃO é `LAUNCH_READINESS_PASS`.**
10. **Correção funcional do esquema permanece exclusivamente** no *commit*
    `2ffcd829fe4f35d526bb643abc0cf4044346b238`, **não reescrito** por esta decisão. Este
    encerramento é **documental**: sem alteração de código de produto, sem *push*, *merge*,
    *amend*, *rebase* ou *squash*.

## `D-FUND-SG-A-S01-REOBSERVAR-01` — `S0.1` = `REOBSERVAR` (2026-08-15)

Decisão **do fundador**, tomada no `HUMAN GATE` físico apresentado pelo
[artefato `37`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/37_RECONCILIACAO_POS_R2_E_PREPARO_SG_A.md)
§19. Registro operacional integral no
[artefato `38`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/38_SF1_BLOCO_1_REOBSERVACAO_BLOCO_A.md).

**Conteúdo normativo — o que foi decidido (uma coisa só):**

1. **`S0.1 = REOBSERVAR`.** Os cinco casos do `BLOCO A` da `R2` — `CASO 1`, `CASO 10`,
   `CASO 14 v2`, `CASO 15`, `CASO 16` — **serão reobservados fisicamente sobre o binário
   atualmente instalado**, em vez de terem seu `PASS` histórico herdado. Fundamento invocado:
   *"prova colhida sobre o binário anterior **não se herda** por este eixo"*
   (`36_RECONCILIACAO_FECHAMENTO_FASE_6.md:94-96`).

**O que esta decisão NÃO faz:**

2. **Não anula, não converte e não apaga o `PASS` histórico.**
   `CASO10_AND_BLOCO_A_FINAL_GATE_PASS` (`14_R2_SESSAO_2.md:3031`) permanece **íntegro e
   verdadeiro para `92781ea`**. A reobservação **acrescenta** uma prova sobre o binário atual;
   não aposenta a anterior nem a reescreve.
3. **Não concede `F6-SG-A`**, `F6-SG-B`, `F6-SG-C`, `F6-SG-D` nem `F6_CLOSED`.
4. **Não reabre a `R2` prospectiva `B`–`E`** (`D-FUND-R2-BE-CLOSURE-01` intacta), **não** reabre
   o `CASO 9`, **não** amplia o `CASO 12` além de `CASO12-PARCIAL-01`, **não** retorna ao `R2P1`.
5. **Não altera o estado de `CASO 14 v1`**, que permanece
   `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL` (`CASO14-V1-INEXECUTAVEL-01`) e continua
   sendo reportado **separadamente**, na forma fixada em `14_R2_SESSAO_2.md:134-140`.
6. **Não cria `AC-5`** e **não** autoriza editar `compare_state.py`.

**Consequências medidas — registro do agente, NÃO decisão do fundador:**

7. A sessão física `SF1` passa a ter **três blocos**, com ordem interna causal
   `Bloco 1 (BLOCO A) → Bloco 2 (R3 resize) → Bloco 3 (R5)`. A ordem interna do próprio
   `Bloco 1` é a canônica de `10_RODADA_FISICA_2_F6_SG_A.md:329-405`:
   `TAR` → `CASO 1` → `CASO 15` → `CASO 14 v2` → `CASO 16` → `CASO 10` → `TAR` → comparação.
8. **Dependência bloqueante descoberta ao fechar o protocolo:** a reobservação com rigor
   equivalente ao da prova histórica depende de `ARB-ARBITRO` — a extensão de escopo do
   arcabouço de adjudicação de `D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01`, hoje declarado
   *"aplicável **somente de forma prospectiva** à campanha `B`–`E`"*. Ver artefato `38` §4.
   **Enquanto `ARB-ARBITRO` não for respondido, `SF1` não começa.**
9. **`ARB-ARBITRO` foi respondido em 2026-08-15** — ver `D-FUND-SG-A-ARBITER-EXT-BLOCO-A-01`,
   logo abaixo. O bloqueio do item `8` está **levantado**.

## `D-FUND-SG-A-ARBITER-EXT-BLOCO-A-01` — `ARB-ARBITRO` = `SAÍDA A` (2026-08-15)

Decisão **do fundador**, em resposta ao bloqueio causal levantado pelo
[artefato `38`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/38_SF1_BLOCO_1_REOBSERVACAO_BLOCO_A.md)
§4. Adota a **saída A** ali recomendada, nos exatos termos ali propostos.

**Conteúdo normativo:**

1. **Extensão de escopo, prospectiva e nominal.** Os itens **`1` e `3` a `8`** de
   `D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01` passam a valer **também** para a **reobservação do
   `BLOCO A` sobre o binário atual** — e **somente** para ela.
2. **Preservação integral.** A extensão preserva **integralmente** as regras, as classificações,
   o **`HARD STOP`** do item `8` e a **proibição de criar `AC_5`**. Nada é afrouxado, relativizado
   ou simplificado por ser "só uma reobservação".
3. **Delimitação negativa, literal do fundador:** a extensão *"não altera, substitui, herda ou
   reinterpreta qualquer `PASS` ou relatório histórico, não modifica `compare_state.py` e não
   amplia o árbitro para outras campanhas além desta reobservação específica"*.
4. **`SF1` não é iniciada por esta decisão.** Instrução expressa: **"Não iniciar `SF1` ainda."**
   O aparelho permanece **`HANDS OFF`**.

**Notas de leitura — registro do agente, NÃO decisão do fundador:**

5. **Por que o item `2` ficou de fora, e por que isso não abre lacuna.** O item `2` tem duas
   metades: (a) o lacre de `compare_state.py`, que o item `3` desta decisão preserva por palavras
   próprias do fundador; e (b) a regra de que o *token* agregado de igualdade binária deixa de ser,
   sozinho, o árbitro de `PASS`/`FAIL`. A metade (b) é **consequência aritmética** de estender os
   itens `1`, `3`, `4` e `5`, que nomeiam quais são os árbitros de produto e quais são meros
   diagnósticos físicos. Além disso, o `BLOCO A` **já** não adjudicava por agregado: `TAR-1 × TAR-2`
   é **inventário de encerramento** (`14_R2_SESSAO_2.md:3031-3139`, artefato `38` §8.1). Não há
   lacuna.
6. **Efeito sobre o estado de `SF1`:** o Bloco 1 passa de `BLOQUEADO` para **`EXECUTÁVEL SOB
   AUTORIZAÇÃO`**. `SF1` permanece **não iniciável** enquanto o **Bloco 3 (`R5`)** não tiver
   protocolo fechado (artefato `38` §11) e enquanto a autorização de início não for dada.

## Analytics / SDKs (registro de restrição)
- Analytics **anônimo** (sem AAID/PII, toggle na Área dos Pais) permanece aprovado. **Nenhum SDK** além de **Sentry + RevenueCat + analytics anônimo** entra sem decisão nova. Sem backend/login/anúncios/tracking infantil. Sem premium no binário.
- ⚠️ **CONTRATO COMPLETO a partir de 2026-08-06 (Fase 4E · `D-4E-ANALYTICS-3-CAMADAS`).** O registro de restrição acima permanece válido e passa a ser lido dentro da arquitetura de **três camadas**:
  1. **Camada local de produto** — dados de uso que **nunca saem do aparelho**. É a camada padrão do produto.
  2. **Camada de diagnóstico técnico** — erro e estabilidade, **sem conteúdo infantil**, **sem PII**, **sem AAID** e **sem identificador remoto derivado do `childId`**.
  3. **Camada pública opcional** — telemetria de produto **desligada por padrão**, dependente de **consentimento adulto explícito e revogável** obtido **atrás do portão parental** (`D-4E-CONSENTIMENTO`), sem escurecimento de padrão.
- **As 12 categorias** de evento do artefato de 4E ficam **ratificadas** (6 + 2 + 2 + 2).
- **Proibições duras:** converter o `childId` local em identificador remoto · enviar conteúdo criado pela criança · enviar nome, foto, voz, e-mail ou resposta identificada de criança · enviar **igreja ou denominação** · registrar em log qualquer item da lista proibida do artefato · ativar telemetria pública por padrão · presumir consentimento.
- **Nenhum SDK novo foi adicionado nesta fase** e **nenhuma dependência foi instalada**. `expo-sharing` fica **conceitualmente autorizado** (`D-4E-COMPARTILHAMENTO`) e **`expo-media-library` NÃO** é autorizada.
- **Implementação pendente** (Fases 5 e 19) · **risco técnico NÃO corrigido** · **revisão jurídica ainda exigida**. Rastreio: `P-85`, `P-93`, `P-127`, `P-139`.

## RevenueCat (registro de sequenciamento)
- **Código** só depois do **piloto user-facing** dos packs (F2.4e.3–e.5). A **preparação externa** (contas Apple/Play, produtos, dashboard RC, teste fechado do Play, acordos fiscais/bancários) **pode começar em paralelo AGORA** — não toca código.

---

## Itens PENDENTES / A CONFIRMAR (resumo)
- 🟡 **D-NAMING-JOGOS-PENDENTE** — nomes finais de Adivinhar o Animal / Quebra-Cabeça (Soletrando → **"Palavrinhas do Beni"** ✅ resolvido em `D-PALAVRINHAS-UF1`).
- ✅ **D-CONCLUSAO-TOTAL-B** — definição operacional de "colorir concluído" **RESOLVIDA em 2026-07-30**: pelo menos **uma atividade do Colorir com o Beni** concluída (ver [`D-C60-INTEGRACAO-PRODUTO`](#d-c60-integracao-produto--integração-do-colorir-com-o-beni-decisões-de-produto) §3). O **restante** da `D-CONCLUSAO-TOTAL-B` (Opção B, ritual de conclusão) segue para implementação na **Fase 11**.
- ✅ **D-CRIAR-COM-BENI-STATUS** — **ENCERRADA em 2026-08-05** (Fase 4B). Não existirá terceira experiência "Criar com Beni"; os nomes oficiais são **`Criar Livre`** e **`Colorir com o Beni`**; "Criar Juntos" é chamada contextual do Criar Livre. **Deixa de ser pendência de decisão**; resta apenas a implementação de remover/redirecionar o atalho legado da Home (ver §PL4B · `D-4B-NOMES-OFICIAIS`).
- ✅ **ESTADO TRANSITÓRIO ENCERRADO EM 2026-08-04** — a janela "NÃO GERAR BUILD" entre o **D1** e a conclusão do **S1** da Spec 019 **não vigora mais**: código, smoke e documentação voltaram a concordar, e o build `bafb8e3f` (commit `b24c868`) foi gerado depois do fechamento e **validado fisicamente**. Ver [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos) §7 e §8.
- 🟡 **Cenários Família e premium da Spec 019** — **obrigatórios na Fase 18** e **revalidados na Fase 21**; não validados no perfil `c60-pilot` por impossibilidade técnica. Ver [`D-C60-PERSISTENCIA-TODOS-PLANOS`](#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos) §8.1.
- ✅ **Escopo das rodadas diárias, perfil local, reset, exportação, corrupção, armazenamento, packs pós-atualização e chaves de storage** — **DECIDIDOS em 2026-08-05** no **Product Lock da Fase 4D**. Ver [`## PL4D`](#pl4d--product-lock-fase-4d--dados-persistência-migração-recuperação-e-integridade). **Deixam de ser pendências de decisão**; a implementação segue pendente nas Fases 10, 11, 12A, 16, 17 e 19, e os riscos técnicos correspondentes **continuam abertos** na matriz canônica (`P-01`..`P-149`). *(Faixa atualizada em 2026-08-07, Fase 5 Bloco 7, e declarada: dizia `P-01`..`P-148`, correto quando escrito; ficou desatualizada porque a Fase 5, Bloco 0, criou `P-149`. **Nenhuma contagem foi alterada — apenas a designação da faixa.**)*
- ✅ **Privacidade, sessão adulta, links externos, exclusão, analytics, consentimento, exportação, compartilhamento, política/termos, contato e destino do Modo Igreja** — **DECIDIDOS em 2026-08-06** no **Product Lock da Fase 4E**. Ver [`## PL4E`](#pl4e--product-lock-fase-4e--privacidade-área-dos-pais-analytics-e-modo-igreja). **Deixam de ser pendências de decisão**; a implementação segue pendente nas Fases 5, 11, 12A, 12B, 16, 18 e 19, e os riscos técnicos correspondentes **continuam abertos** na matriz canônica (`P-01`..`P-149`). **Preço e modelo comercial do Modo Igreja** e **os 24 encaminhamentos jurídicos** permanecem **explicitamente em aberto**. *(Faixa atualizada em 2026-08-07, Fase 5 Bloco 7, pelo mesmo motivo declarado no item anterior: a Fase 5 criou `P-149`. Nota adicional: a Fase 5 **cumpriu** sua parte dos encaminhamentos jurídicos ao especificar e obter aprovação documental do plano de medição, mas **nenhum dos pareceres jurídicos externos foi obtido** — ver `PF5-ENCERRAMENTO`.)*
- ✅ **Contrato técnico do sistema global de conclusão** (Decisões B e C) — **CONGELADO em 2026-08-05** no **Product Lock da Fase 4C**. Ver [`## PL4C`](#pl4c--product-lock-fase-4c--jornada-progressão-conclusão-e-desbloqueios). **Deixa de ser pendência de decisão**; os achados de [`D-CONCLUSAO-ESTADO-ATUAL`](#d-conclusao-estado-atual--achados-que-impedem-o-congelamento-técnico-imediato-registro-de-fatos) **continuam abertos como risco técnico**, com implementação nas Fases 7, 9, 10, 11, 12A, 16 e 19 e **validação física futura**.
