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

**Data desta versão:** 2026-08-05 (**Product Lock — Fase 4A**, Plano Família, compra, restauração e entitlement, seção `PL4A`; **Fase 4B**, acesso grátis, conteúdo do Plano Família, histórias e superfícies infantis, seção `PL4B`; **Fase 4C**, jornada, progressão, conclusão e desbloqueios, seção `PL4C`; **Fase 4D**, dados, persistência, migração, recuperação e integridade, seção `PL4D`) · **Atualizada em:** 2026-08-06 (**Fase 4E**, privacidade, Área dos Pais, analytics e Modo Igreja, seção `PL4E`; **Fase 5**, infância, privacidade, teologia e medição, seção `PF5`) · **Base anterior:** 2026-08-03 (Spec 019 · revogação cirúrgica da restrição de persistência no Grátis) · **Fundador:** Eduardo

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
- **Próxima fase canônica, segundo `v5` §3:** **Fase 6 — *shell* e *splash***, que herda `E5.52` e o risco `P-139`. **A Fase 6 toca código e exige o ciclo SDD completo com os três portões humanos.**
- Consolidação completa em [`07_CONSOLIDACAO_FASE_5.md`](fase5-pareceres/07_CONSOLIDACAO_FASE_5.md).

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
