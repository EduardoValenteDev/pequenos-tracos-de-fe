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
  8. **NÃO existe afirmação de desempenho medido quantitativamente.** Nenhuma medição foi registrada (R21); `performanceTrace.js` é gated por `__DEV__`/env ausente de todos os perfis do `eas.json` e não há baseline versionado. Qualquer ganho percebido é qualitativo.
  9. **NÃO existe readiness de loja.** O binário ainda referencia ~401 MB por `require()` estático (R5), com premium (R6) e 200 linearts legados (R7) embarcados.
  10. **Próxima fase oficial:** integração do **Colorir com o Beni** (Fase 2.5). A branch de integração **não** foi criada neste portão.
- **Condições obrigatórias da Fase 2.5** (nenhuma é opcional):
  1. **Bloquear a persistência de pintura no plano Free no nível da ESCRITA em storage** — não apenas na UI. Coerente com [`D-FREE-SEM-SALVAR`](#d-free-sem-salvar--plano-grátis-não-salva-arte).
  2. **Tornar a atualização de manifest/pack funcional para quem já baixou conteúdo** — hoje quem já instalou não recebe versão nova de forma comprovada.
  3. **Manter os linearts legados fora do binário público** — a remoção é projeto próprio; a Fase 2.5 não pode reintroduzi-los nem ampliar a dependência deles.
  4. **Resolver a divergência de CRLF sem conflito artificial** — `feat/colorir-60-pilot-creation` tem `scripts/smoke.js` 100% CRLF (R23). Este portão fixou `scripts/smoke.js text eol=lf` no `.gitattributes`; a branch divergente precisa ser renormalizada **antes** do merge. Atenção: além do EOL há divergência real de conteúdo.
- **Riscos residuais e seus destinos oficiais** (substituem qualquer atribuição anterior deste registro):
  - **R5** — peso do binário e `require()` estático → **Fases 16 e 17**.
  - **R6** — conteúdo premium embarcado → **Fases 16 e 17**.
  - **R7** — 200 linearts legados → **Fases 16 e 17**.
  - **R17** — `appVersion` literal `'1.0.0'`, `minAppVersion` e compatibilidade (`requiresAppUpdate` inerte) → **Fases 17 e 20**.
  - **R20A** — ausência de evidência física em Android → **Fases 12A, 14 e 21**.
  - **R20B** — sha256 lendo o arquivo inteiro em base64 → **Fases 17 e 19**.
  - **R21** — ausência de medições quantitativas, faseada: **baseline na Fase 3** · **shell e abertura na Fase 6** · **piloto ampliado na Fase 14** · **beta final na Fase 21**.

  R20 passa a ser tratado como **dois riscos distintos** (R20A e R20B): a divisão é documental e não altera o conteúdo do risco original. Esta reatribuição **não reabre a Fase 2**.

  *Nota de rastreabilidade:* as Fases **12A, 16, 17, 19, 20 e 21** ainda não têm contrapartida em `PLANO_OFICIAL_BENI_LANCAMENTO.md` §18, que hoje enumera Fases 0–13. Os destinos acima valem como decisão do fundador; a numeração ampliada precisa ser refletida no plano para ficar rastreável.
- **Gates físicos obrigatórios da Fase 2.5:** os três cenários ainda não executados no dispositivo passam a ser **gates de aceite da Fase 2.5**, não pendências informativas — (1) **dois READY concorrentes**; (2) **reset seguido de retry**; (3) **saída durante a instalação**.
- **Escopo do portão:** apenas testes (`scripts/smoke.js`), governança (`.gitattributes`, `CLAUDE.md`, `.specify/memory/constitution.md`) e documentação (este arquivo). **Zero** alteração em código de produção.

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
