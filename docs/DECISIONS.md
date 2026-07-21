# DECISIONS.md — Árbitro de decisões · Pequenos Traços de Fé

> **Este arquivo é o ÁRBITRO.** Em conflito entre qualquer documento, conversa ou sessão de IA
> e o que está aqui, **o DECISIONS.md vence**. Uma decisão que existe apenas em conversa **não é
> oficial** até entrar aqui. Toda sessão de IA (ChatGPT, Claude, Claude Code) **começa lendo este
> arquivo** e declara: *"operando sob DECISIONS.md de <data>"*.
>
> Precedência acima deste arquivo: `docs/PROJECT_SOURCE_OF_TRUTH.md` (Roteiro Mestre) →
> `.specify/memory/constitution.md` → `AGENTS.md`/`CLAUDE.md`. Este arquivo governa as **decisões
> de produto/linha de lançamento** e é a base do `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`.
>
> **Mudança de decisão só existe se:** o fundador aprova explicitamente → DECISIONS.md é atualizado
> PRIMEIRO → documentos depois → código por último. Nenhuma IA reabre item registrado sem sinalizar
> que está pedindo **REVERSÃO**.

**Data desta versão:** 2026-07-15 (Reconciliação E1) · **Base anterior:** 2026-07-05 (`424972b`) · **Fundador:** Eduardo

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
- **E1-ARTES-SALVAR** · ✅ · Grátis = **zero salvamentos**; Família = salvamentos liberados; **artes antigas não são apagadas**; migrações preservam dados locais; textos "X de N artes grátis" estão **superados**. · Limite já é 0 (`ATELIER_FREE_SAVE_LIMIT`); **UI residual "X de N" em `AtelierScreen.js`/`AtelierGalleryScreen.js`** (fluxo contextual, não a aba) = limpeza futura. **Não alterar telas/storage neste bloco.**

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
| `DECISIONS.md` da raiz como árbitro | `docs/DECISIONS.md` (este arquivo) |
| Nomes brutos "Soletrando/Adivinhar o Animal/Quebra-Cabeça" | E1-BRINCAR-4JOGOS (nomes finais) |
| Lista Brincar de 5 entradas | E1-BRINCAR-4JOGOS (4 jogos + Criar Livre + Minhas artes) |

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

### D-FREE-SEM-SALVAR — Plano grátis NÃO salva arte
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA (fundador) · **Origem:** Adendo v1 §1 + confirmação Eduardo.
- **Decisão:** Salvar arte é benefício **100% Plano Família**. O grátis desenha/colore normalmente, mas **não persiste** a arte; salvar/Galeria/persistência = Plano Família.
- **Impacto:** remove o limite numérico atual (não há mais "3 de 3"); qualquer toque em Salvar/Guardar no grátis → gate parental → paywall (copy gentil). Colorir continua valendo para progresso/estrela. "Minhas Artes" no grátis = estado vazio convidativo. Baú: cartinhas tipo "Arte" viram exclusivas do Plano Família (demais lembranças seguem para todos). Livrinho grátis: "Meu livrinho colorido" = estado convidativo. **Implementação em bloco próprio (Bloco A da sequência); NÃO agora.**

### D-CONCLUSAO-TOTAL-B — Desbloqueio da próxima história exige conclusão TOTAL (Opção B)
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA (fundador — **Opção B**) · **Origem:** Adendo v1 §1 (D-CONCLUSAO-TOTAL) + correção Eduardo.
- **Decisão:** Uma história só desbloqueia a próxima e recebe o selo "Concluída" quando a criança completou **TUDO**:
  `isStoryFullyComplete = (10 cenas narradas concluídas) AND (quiz respondido) AND (colorir concluído) AND (Momento da história / Guardar no coração concluído)`.
- **Correção do fundador vs. adendo:** o adendo propunha "duas camadas" (desbloqueio guiado só pela narrativa; selo/certificado pela conclusão total). O **fundador escolheu a Opção B**: o **desbloqueio da próxima história também exige a conclusão total**.
- **Definição operacional de "colorir concluído":** proposta do adendo = **pelo menos 1 página da história colorida e concluída** (não as 10). Marcada como **[A CONFIRMAR]** — o default é 1; se o fundador preferir outro número, declarar.
- **Impacto:** muda **progressão e retenção** e a base do B5.4 (unlock por cenas). Por isso, **a implementação é bloco próprio POSTERIOR — NÃO agora.** Requer helper puro `isStoryFullyComplete` (separado de `isNarrativeComplete`), revisão de status em cards/mapa/Estrelinhas, certificado só no total.

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

### D-CRIAR-COM-BENI-STATUS — Status de "Criar com Beni" no v1 [A CONFIRMAR]
- **Data:** 2026-07-05 · **Status:** 🟡 A CONFIRMAR (fundador) · **Origem:** conflito entre documentos + instrução Eduardo.
- **Situação:** o adendo pede remover "Criar com Beni / Desenho guiado" do v1; **o fundador NÃO autorizou remoção de código neste bloco.** O status de "Criar com Beni" no v1 está **conflitante entre documentos**.
- **Decisão:** **registrada como decisão A CONFIRMAR pelo fundador. NENHUMA alteração de código agora.** Até a confirmação, o comportamento atual do app permanece intacto.
- **🔄 ATUALIZAÇÃO E1 (2026-07-15):** o **nome oficial da experiência criativa livre é `Criar Livre`**. "Criar com Beni" **deixa de existir como nome público de experiência separada**. Qualquer card/fala/texto/guia antigo chamado "Criar com Beni" deve ser **removido ou redirecionado em bloco futuro de código** (a Home ainda possui esse atalho legado). **Não modificar Home nem rotas neste bloco.** Ver E1-BENI-LINGUAGEM e a pendência controlada correspondente.

### D-ANTIBIFURCACAO — Fonte única + rito de sessão
- **Data:** 2026-07-05 · **Status:** ✅ CONFIRMADA · **Origem:** Adendo v1 §8.
- **Decisão:** (1) **UMA fonte de verdade** para a linha de lançamento = `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`, subordinada ao Roteiro Mestre; documentos anteriores viram SUPERSEDED sem apagar conteúdo. (2) **DECISIONS.md é o árbitro.** (3) **Toda sessão de IA começa lendo DECISIONS.md** e declara sob qual data opera. (4) Mudança de decisão: fundador aprova → DECISIONS.md primeiro → documentos → código. (5) **Decisão que só existe em conversa não é decisão oficial** até entrar aqui.

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

---

## Analytics / SDKs (registro de restrição)
- Analytics **anônimo** (sem AAID/PII, toggle na Área dos Pais) permanece aprovado. **Nenhum SDK** além de **Sentry + RevenueCat + analytics anônimo** entra sem decisão nova. Sem backend/login/anúncios/tracking infantil. Sem premium no binário.

## RevenueCat (registro de sequenciamento)
- **Código** só depois do **piloto user-facing** dos packs (F2.4e.3–e.5). A **preparação externa** (contas Apple/Play, produtos, dashboard RC, teste fechado do Play, acordos fiscais/bancários) **pode começar em paralelo AGORA** — não toca código.

---

## Itens PENDENTES / A CONFIRMAR (resumo)
- 🟡 **D-NAMING-JOGOS-PENDENTE** — nomes finais de Adivinhar o Animal / Quebra-Cabeça (Soletrando → **"Palavrinhas do Beni"** ✅ resolvido em `D-PALAVRINHAS-UF1`).
- 🟡 **D-CONCLUSAO-TOTAL-B** — definição operacional de "colorir concluído" (default 1 página) a confirmar.
- 🟡 **D-CRIAR-COM-BENI-STATUS** — manter ou remover "Criar com Beni" no v1 (sem código até confirmar).
