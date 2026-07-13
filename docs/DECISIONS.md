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

**Data desta versão:** 2026-07-05 · **HEAD carimbado:** `424972b` · **Fundador:** Eduardo

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
