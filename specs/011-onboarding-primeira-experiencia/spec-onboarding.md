# Spec — Onboarding O1: A nova primeira experiência e o novo papel do Beni

**Feature:** 011-onboarding-primeira-experiencia · **Bloco:** O1 (auditoria + experiência + especificação)
**Branch:** `spec/onboarding-o1-first-experience` (a partir de `94a3c1f`) · **Data:** 2026-07-15
**Status:** ✅ **O1 aprovado pelo proprietário (Portão Humano 1) — decisões abaixo encerradas.** Atualizado no bloco **O2** (2026-07-15). **Nenhum áudio alterado.**

> Precedência (E1): `docs/PROJECT_SOURCE_OF_TRUTH.md` → constitution → AGENTS/CLAUDE → **`docs/DECISIONS.md` (árbitro)** → v4. Decisões vigentes aplicadas aqui: "Ateliê" não é nome visível; Brincar = 4 jogos + Criar Livre + Minhas artes; A Criação e Noé grátis; A Criação é a 1ª aventura; sem compra para a criança; dados do perfil locais; Beni guia sem atrapalhar.

---

## 0. Decisões aprovadas pelo proprietário (O2 — encerradas)

1. Conceito oficial = **"O Primeiro Traço da Jornada"**.
2. Onboarding = **quatro momentos**.
3. Indicador = **nós de luz conectados pelo traço dourado**.
4. **Não** usar estrelas como paginação.
5. **Nome e avatar na mesma etapa** de personalização.
6. **Sem** rótulos visíveis repetidos "Menino"/"Menina".
7. Descrições de avatar **apenas para acessibilidade**.
8. Nome aparece **personalizado no texto** da última tela.
9. Áudio final **não** pronuncia nome dinâmico.
10. Ação principal final = **"Descobrir A Criação"**.
11. Ação secundária = **"Explorar primeiro"** (baixo peso visual).
12. Se A Criação já concluída, ação principal = **"Explorar Aventuras"**.
13. Preferência **sem voz** será persistida **no bloco de integração de áudio** (B3), não em O2.
14. **"Rever apresentação"** usa o mecanismo existente de Perfil/Área dos Pais.
15. **Não** criar guia exclusivo para Minhas artes.
16. **Não** exigir pose nova do Beni em O2.
17. **Reutilizar** as melhores poses oficiais existentes.
18. Pose nova = substituição visual futura, **sem bloquear** a implementação.
19. Nome aceita **Unicode e acentos**.
20. Nome **aparado** + espaços internos **normalizados**.
21. Nome **não** pode ser vazio nem só símbolos.
22. **Não** criar blacklist extensa nesta etapa.
23. **Sem** cadastro.
24. **Sem** email/idade/foto/localização.
25. Fluxo **100% offline**.

Onde o corpo desta spec (redigido no O1) divergir em fraseado, **estas decisões prevalecem**. A seção §26 (pendências) foi reduzida às que permanecem realmente abertas.

---

## 1. Resumo

O onboarding atual é funcional, mas **parece um formulário de configuração**: pede nome e avatar antes de mostrar qualquer valor, apresenta o Beni como retrato circular e termina numa confirmação genérica. Esta spec redesenha a primeira experiência como **"O Primeiro Traço da Jornada"**: um **traço dourado** narrativo conduz a criança de um encontro com o Beni → à revelação do Mundo do Beni → à personalização compacta → até **A Criação pronta para começar**. Substitui a explicação-tudo-de-uma-vez por **guias progressivos** contextuais. Define o **novo papel do Beni**, a **direção de arte**, o **movimento**, o **contrato de carregamento**, a **matriz de áudios** (atuais e propostos, sem gerar áudio) e a **divisão dos blocos** O2→B3.

## 2. Estado atual

### 2.1 Arquitetura e arquivos
| Arquivo | Papel |
|---|---|
| `src/screens/OnboardingScreen.js` | Fluxo de 4 etapas (welcome → name → avatar → confirm) |
| `src/services/onboardingService.js` | Persistência `@ptf_onboarding_v1` `{completed, version}`, `ONBOARDING_CURRENT_VERSION = 1` |
| `src/data/avatars.js` | `ONBOARDING_AVATAR_OPTIONS` (5), `isAvatarUnlocked`, `FREE_AVATAR_IDS = [boy, girl, star]` |
| `src/context/ProfileContext.js` · `src/services/childProfileService.js` | Perfil legado (`@ptf_profile`) + estrutura de múltiplos filhos |
| `src/components/beni/BeniAvatar.js` · `src/components/AvatarImage.js` | Avatar do Beni (poses) e imagem do avatar da criança |
| `src/components/BeniGuideOverlay.js` | Overlay dos guias/tour (voz/sem voz/pular/legenda/safe-area) |
| `src/components/BeniAppTour.js` · `src/data/beniGuides.js` | Tour inicial (`INITIAL_TOUR`, 5 cards) + guias por tela |
| `src/services/beniTourService.js` | Flags "já visto" por guia + sinais em memória do tour |
| `src/data/beniGuideAudio.js` | Manifesto dos 24 áudios de guia (require estático) |
| `src/data/beniGuideMessages.js` · `src/data/beniLines.js` | Catálogos de mensagens/linhas curtas do Beni |

### 2.2 Fluxo real (onboarding)
1. **welcome** — `BeniAvatar` (hero, circular) + balão "Olá! Eu sou o Beni." + botão "Avançar →" + `ProgressStars`.
2. **name** — layout dedicado (KeyboardAvoidingView + ScrollView): Beni compacto + balão + `TextInput` (maxLength 20, `autoCapitalize="words"`, trim + não-vazio) + "Avançar →".
3. **avatar** — grade de **5 opções** (`ONBOARDING_AVATAR_OPTIONS`), estrela pré-selecionada; toque define `avatarId`+`skinTone`.
4. **confirm** — card com `AvatarImage` + nome + "Sua jornada vai começar!" + "Começar aventura".
   Ao concluir: `saveProfile` (legado) + `createChildProfile` + `markOnboardingCompleted` + `requestInitialTour` + `navigation.reset` para a aba **Aventuras** com `startBeniTour: true`.

### 2.3 Persistência real
- Onboarding: `@ptf_onboarding_v1` (`{completed:boolean, version:number}`), versão atual **1**; fallback legado `@ptf_profile`.
- Guias/tour (`beniTourService`): `@ptf_beni_app_tour_seen_v1` (initial), `@ptf_beni_guide_{adventures,home,atelier,stars,profile,parent}_v1`. **Sem chave de "sem voz"** (estado por sessão no overlay).

### 2.4 Assets reais
- Beni: 11 poses em `assets/mascot/beni/` (base, acenando, apontando, ensinando, celebrando, etc.) + variantes de densidade do Palavrinhas.
- Avatares da criança: `assets/avatar/` (star/sheep/lion/dove/ark/fish + boy/girl por skin tone).
- Áudio de guia: **24 mp3** em `assets/audio/beni_guide/{initial(3),adventures(4),home(6),atelier(5),stars(3),profile(3)}` (+6 `.gitkeep`).
- **A Criação:** capa/cenas oficiais em `assets/stories/creation/` (usar a **capa oficial** no Momento 4).

### 2.5 Áudios reais — bloqueio com a narração
Guias usam `SoundButton ... silent` (não conflitam com sons de UI). A **narração** das histórias (`AudioPlayer` → `audioManager.onNarrationStart/End`) pausa a música. O guia é **camada separada** (`beniGuideAudio`), sem colisão estrutural com a narração — mas a regra "guia do Beni nunca toca junto da narração" deve ser reafirmada no design.

### 2.6 Pontos frágeis / dívida legada / referências antigas
- **Estrelas como paginação** (`ProgressStars` usa ★/✦/☆) — conflita com estrelinhas = recompensa.
- **Beni sempre em círculo** (`BeniAvatar`), nunca personagem em cena.
- **Rótulos repetidos "Menino"/"Menino"/"Menina"/"Menina"** em `ONBOARDING_AVATAR_OPTIONS`.
- **Legado vivo:** `HOME_GUIDE` card **"Criar com Beni"** (`guide.home.create_beni`); `ATELIER_GUIDE` inteiro ("Seu Ateliê", "Colorir histórias", "Desenho guiado", "Criar livre", "Minhas artes") + **5 áudios `guide.atelier.*`** — disparado pela `AtelierScreen` contextual (fluxo Cultinho), **não** pela aba Brincar.
- **`ADVENTURES_GUIDE`** = dado morto (não disparado; substituído pelo `INITIAL_TOUR`).
- Rota interna ainda `'Ateliê'` (identidade), hardcoded no `reset` do onboarding — **funciona, mantém-se** (E1-NAV-5ABAS).
- **Sem controles de voz/pular no onboarding** (existem só no tour pós-onboarding).

## 3. Problemas (prints aprovados como referência do estado atual)

1. Parece **formulário de configuração**, não entrada num mundo.
2. **Pede dados antes de demonstrar valor**.
3. Beni como **retrato circular**, não personagem em cena.
4. **Sem revelação** de Aventuras/histórias/Brincar/Colorir/Livrinho/Estrelinhas.
5. **Áreas vazias** sem intenção.
6. **Mesma composição** em todas as telas.
7. Botão **"Avançar"** repetido.
8. **Estrelas como paginação** (são recompensa no produto).
9. **Final genérico** e repetitivo.
10. Avatar com **rótulos repetidos "Menino"/"Menina"**.
11. **Ausência de controles de voz/pular** visíveis.
12. **Nenhuma visão de A Criação**.
13. **Nenhuma ação concreta** no final.
14. **Pouca transformação** entre início e fim.
15. **Modo Criador** não pode contaminar capturas de produção (deve seguir só no Dev Client, invisível em produção).

## 4. Princípios da nova experiência

Encantar antes de pedir dados · criar vínculo com o Beni · revelar parte do Mundo do Beni · levar a A Criação · curta · calma · visualmente rica · não superestimulante · offline · sem áudio obrigatório · com legendas · com Pular · revisável · movimento reduzido · safe area · teclado · **sem paywall/cadastro/email/idade exata** · nome não sai do aparelho · não explicar todas as abas de uma vez · **sem "Ateliê" na linguagem visível** · sem experiências removidas · apresentação ≠ tutorial técnico.

## 5. Conceito oficial — "O Primeiro Traço da Jornada"

Um **traço dourado** (a "linha de fé") aparece na primeira tela, **conduz o Beni**, **revela o mundo**, **acompanha a personalização** e **chega até A Criação**. É **função narrativa**, não decoração: representa **Descoberta · Caminho · Continuidade · "Pequenos Traços de Fé" · a ligação entre o Beni e a primeira aventura**. O traço é o **fio condutor visual** que dá unidade e transformação aos quatro momentos (resolve os problemas 5, 6, 8, 14). *Especificação detalhada; não implementar nesta rodada.*

## 6. Arquitetura final — quatro momentos

| # | Momento | Objetivo | Ação principal | Duração alvo |
|---|---|---|---|---|
| 1 | **Beni encontra a criança** | vínculo + curiosidade | "Conhecer meu mundo" | ~5–8 s |
| 2 | **O Mundo do Beni é revelado** | promessa antes de personalizar | "Quero explorar" | ~6–10 s |
| 3 | **Personalização** (nome + avatar) | identidade compacta e coerente | "Esse sou eu" | ~15–30 s |
| 4 | **Primeira aventura** (A Criação) | valor concreto no lugar da confirmação | "Descobrir A Criação" | ~5–8 s |

**Momento 1 — Beni encontra a criança.** Ambiente profundo e acolhedor (azul-noite → creme). O **traço dourado surge** e o Beni aparece **de corpo inteiro / três quartos** (não círculo), **reage uma vez**. Texto base a avaliar: *"Oi! Eu sou o Beni. Vamos descobrir juntos histórias lindas da Bíblia?"* Controles: **Som** (ligar/desligar), **Pular apresentação**, **repetir fala ao tocar no Beni**.

**Momento 2 — O Mundo do Beni.** Composição **orgânica** (não menu) com referências discretas a **Aventuras · história bíblica · livro · colorir · Brincar · Estrelinhas · A Criação**, ligadas pelo traço. Texto base: *"Aqui, cada história vira uma aventura. Você pode ouvir, brincar, colorir e guardar descobertas no coração."* Ação: **"Quero explorar"**.

**Momento 3 — Personalização.** Nome **e** avatar numa etapa coerente. Texto: *"Antes de começarmos, como posso chamar você?"* Campo: *"Seu nome ou apelido"*. Confiança ao responsável: *"Esse nome fica somente neste aparelho."* Avatar: *"Escolha seu rostinho"*. Regras: **sem rótulos visíveis repetidos "Menino"/"Menina"** (usar rótulo acessível descritivo — ver §18); não alterar regra comercial dos avatares; não vender avatar; **não mostrar avatar premium como escolha livre** (só os **base**: `boy`, `girl`, `star`); preservar dados antigos; campo+botão visíveis com teclado; nome validado; sem bloqueio desnecessário. Ação: **"Esse sou eu"**.

**Momento 4 — Primeira aventura.** O traço **chega a um livro/portal/caminho**; a **capa oficial de A Criação** aparece; o Beni **chama pelo nome**. Texto: *"{nome}, sua primeira aventura já está pronta!"* + *"Vamos descobrir como Deus criou o mundo?"* Ação principal (precedência visual absoluta): **"Descobrir A Criação"**. Ação secundária discreta a avaliar: **"Explorar o app primeiro"**.

### 6.1 Variações de entrada (estados de conta)
- **Primeira instalação:** fluxo completo (M1→M4).
- **Perfil já existente / onboarding concluído:** **não** reapresentar automaticamente; só via "Rever apresentação".
- **Onboarding concluído e revisto manualmente:** roda M1→M2 (encantamento) e **pula** a personalização se o perfil já existe (M3 vira "confirmar/atualizar", opcional), terminando em M4 apontando para a **próxima** aventura recomendada quando A Criação já estiver concluída (a confirmar — ver §26).

## 7. Storyboard (visão)

`[M1 traço + Beni em cena]` → `[M2 mundo revelado pelo traço]` → `[M3 nome+avatar, teclado seguro]` → `[M4 traço chega ao livro → capa de A Criação → CTA]`. Transição entre momentos = **o traço avança** (continuidade), com fundo evoluindo de profundo (M1) a luminoso (M4). Wireframes detalhados em §21.

## 8. Papel final do Beni

**É:** acolhedor · guia contextual · ajudante · celebrador · companheiro. **Não é:** narrador de tudo · explicador de muitas funções de uma vez · repetidor a cada abertura · cobre controles · toca junto da narração · bloqueia interação · menciona "Ateliê" · menciona recurso removido · vende para a criança · animação contínua · **sempre dentro de um círculo** · modal técnico.

| Função | Tom | Duração | Exemplo de fala | Contexto | Frequência | Pular | Repetir | Sem voz | Legenda | Conflito de áudio |
|---|---|---|---|---|---|---|---|---|---|---|
| Acolher | caloroso, curto | ≤4 s | "Oi! Eu sou o Beni." | M1 do onboarding | 1×/instalação | sim | ao tocar no Beni | texto no balão | pausa se houver narração |
| Guiar (contextual) | gentil, objetivo | ≤5 s | "Toque em uma história para começar." | 1ª visita de cada aba | 1×/aba | sim | via "rever guia" | card sempre em texto | nunca junto da narração |
| Ajudar | encorajador | ≤4 s | "Quer tentar de novo comigo?" | erro/dúvida pontual | sob demanda | sim | sim | texto | idem |
| Celebrar | alegre, breve | ≤3 s | "Você conseguiu!" | conquista/fim de história | por evento real | n/a | n/a | texto + ícone | idem |
| Acompanhar | presente, discreto | — | (presença visual) | jornada | contínua discreta | — | — | — | — |

## 9. Guias progressivos

Substituem a explicação-tudo-de-uma-vez. Cada guia: **uma intenção · poucos segundos · não bloqueia a tela · pode ser pulado · não repete após conclusão · revisível · funciona sem voz · tem legenda (o próprio card) · espera assets essenciais · não compete com outro áudio · não cobre o alvo · não inicia durante animação importante**.

| Guia | Chave (`beniTourService`) | Texto inicial a avaliar |
|---|---|---|
| Aventuras | `initial`/`adventures` | "Aqui ficam nossos caminhos. Toque em uma história para começar." |
| Brincar | novo `brincar` (a criar em O4) | "Aqui você escolhe uma brincadeira. Todas têm uma descoberta diferente." |
| Estrelinhas | `stars` | "Suas estrelinhas guardam as coisas bonitas que você conquistou." |
| Perfil | `profile` | "Este é o seu cantinho. Aqui ficam suas escolhas e conquistas." |
| Área dos Pais | `parentArea` (só responsável) | "Aqui os responsáveis cuidam das configurações." |
| Minhas artes | (só se necessário) | — avaliar necessidade real (§26) |

**Ações de higiene de guias (para O4, não agora):** criar guia **Brincar** (não existe); **aposentar** `ATELIER_GUIDE` e o card **"Criar com Beni"** do `HOME_GUIDE`; remover `ADVENTURES_GUIDE` morto. **Não** alterar áudio/tour nesta rodada.

## 10. Sistema de progressão visual

**Remover as estrelas como indicador de páginas.** Proposta recomendada, coerente com o conceito: **nós/pontos de luz ao longo do traço** ("o caminho se acende"). Alternativas: pegadas · pedras iluminadas · pequenos traços. A solução deve: **indicar posição · não parecer recompensa · ser acessível · não depender só de cor** (forma + posição) · **não competir com o CTA** · **desaparecer/recolher com o teclado aberto** (M3).

## 11. Direção de arte

Linguagem **própria** (não copiar outro app). Paleta oficial do "Livro Vivo": **azul profundo** (fundo M1/M2, céu-noite dos rituais), **creme** (respiro e cartões), **dourado** (o traço e o material de recompensa), **azul do cachecol do Beni** (acento do personagem). Luz e **profundidade** (camadas/parallax leve), **nuvens** discretas, elementos do **mapa** (M2) e de **A Criação** (M4).

| Momento | Background | Elementos | Pose do Beni (reuso) |
|---|---|---|---|
| M1 | azul profundo → creme, luz central | traço surgindo | corpo inteiro / três quartos "acenando"/"feliz" |
| M2 | creme luminoso com profundidade | referências do mundo ligadas pelo traço | "ensinando"/"apontando" |
| M3 | creme calmo (foco no formulário) | traço lateral discreto | "apontando" compacto |
| M4 | luminoso, portal/livro | **capa oficial de A Criação**, traço chegando | "celebrando" |

**Assets existentes reutilizáveis:** 11 poses do Beni; capa/cenas de `assets/stories/creation/`; tokens do Livro Vivo. **Assets ausentes (novos, NÃO gerar nesta rodada):** arte do **traço dourado** (elemento animável), **composição do "Mundo do Beni"** (M2), possivelmente **1 pose de corpo inteiro** do Beni em cena se as atuais não servirem em três quartos. Consistência: usar a moldura/tipografia/tokens oficiais; "a arte muda, a moldura nunca muda".

## 12. Movimento e som

**Permitido:** traço sendo desenhado · entrada curta do Beni · revelação por profundidade · **parallax leve** · reação única ao toque · capa aparecendo no final.

| Animação | Duração | Easing | Ordem | Movimento reduzido | Interrompível | Espera asset |
|---|---|---|---|---|---|---|
| Traço desenhando | 500–900 ms | ease-out | 1º (por momento) | aparece **estático** já traçado | sim (pula p/ estado final) | sim |
| Entrada do Beni | 250–400 ms | ease-out | após traço | fade curto/sem slide | sim | sim (pose) |
| Revelação M2 | 400–700 ms | ease-out | após CTA M1 | sem parallax | sim | sim |
| Capa A Criação (M4) | 300–500 ms | ease-out | ao entrar em M4 | fade simples | sim | **sim (capa)** |

**Proibido:** flash · confete contínuo · pulsação permanente · movimento constante do Beni · música alta · muitos objetos simultâneos · bloqueio de interação pela animação · **animação longa antes da 1ª ação**. Som: música ambiente **suave e opcional** (respeita o toggle); guia do Beni **nunca** junto da narração.

## 13. Áudio — auditoria e matrizes

Auditar **todos** os áudios do guia/onboarding. **O onboarding atual NÃO tem áudio** (balões em texto); os áudios existentes são do **tour/guias**. **Nenhum áudio é gerado ou substituído nesta rodada.**

### 13.1 Matriz dos áudios ATUAIS (24 mp3)
| ID (audioKey) | Caminho | Tela/contexto | Gatilho | Texto atual (fonte) | Status E1 |
|---|---|---|---|---|---|
| guide.initial.welcome | initial/guide_initial_welcome.mp3 | Tour inicial (Aventuras) | card 1 | "Ei, eu sou o Beni! ..." | **manter** |
| guide.initial.adventures | initial/guide_initial_adventures.mp3 | Tour inicial | card 2 | "Este é o seu mapa..." | **manter** |
| guide.initial.glow | initial/guide_initial_glow.mp3 | Tour inicial | card "Siga o brilho" | "Sua primeira aventura está brilhando!" | **manter** |
| guide.adventures.path | adventures/guide_adventures_path.mp3 | Aventuras | passo mapa | "As histórias aparecem pelo caminho." | **manter** |
| guide.adventures.view_region | adventures/guide_adventures_view_region.mp3 | Aventuras | botão Ver mapa | "O botão Ver mapa abre..." | **manter** |
| guide.adventures.next_available | adventures/guide_adventures_next_available.mp3 | Aventuras | pin liberado | "Este brilho mostra sua próxima aventura." | **manter** (reserva) |
| guide.adventures.next_locked | adventures/guide_adventures_next_locked.mp3 | Aventuras | pin bloqueado | (versão bloqueada) | **manter** (reserva) |
| guide.home.welcome | home/guide_home_welcome.mp3 | Home | card 1 | "Aqui ficam os caminhos principais..." | **manter** |
| guide.home.continue | home/guide_home_continue.mp3 | Home | continuar | "Aqui está a história para continuar..." | **manter** |
| guide.home.cultinho | home/guide_home_cultinho.mp3 | Home | Cultinho | "Um momento de fé em família." | **manter** |
| guide.home.bau_beni | home/guide_home_bau_beni.mp3 | Home | Baú | "Suas lembranças especiais..." | **manter** |
| guide.home.create_beni | home/guide_home_create_beni.mp3 | Home | card "Criar com Beni" | "Crie comigo usando imaginação e fé." | **remover** ("Criar com Beni" deixa de existir; nome oficial = Criar Livre) |
| guide.home.momento_beni | home/guide_home_momento_beni.mp3 | Home | Momento com Beni | "O Beni fica pertinho..." | **manter** |
| guide.atelier.welcome | atelier/guide_atelier_welcome.mp3 | Ateliê (contextual) | card 1 | "Seu Ateliê..." | **remover** (Ateliê não visível) |
| guide.atelier.coloring | atelier/guide_atelier_coloring.mp3 | Ateliê | colorir | "Escolha uma cena..." | **remover** |
| guide.atelier.guided_drawing | atelier/guide_atelier_guided_drawing.mp3 | Ateliê | desenho guiado | "Receba uma ideia..." | **remover** (recurso removido) |
| guide.atelier.free_draw | atelier/guide_atelier_free_draw.mp3 | Ateliê | criar livre | "Crie do seu jeito..." | **substituir** → contexto Criar Livre/Brincar |
| guide.atelier.gallery | atelier/guide_atelier_gallery.mp3 | Ateliê | galeria | "Aqui ficam as artes..." | **substituir** → Minhas artes/Brincar |
| guide.stars.welcome | stars/guide_stars_welcome.mp3 | Estrelinhas | card 1 | "Elas mostram as conquistas..." | **manter** |
| guide.stars.progress | stars/guide_stars_progress.mp3 | Estrelinhas | conquistas | "Cada história pode acender..." | **manter** |
| guide.stars.next | stars/guide_stars_next.mp3 | Estrelinhas | próximo | "O Beni vai celebrar cada passo..." | **manter** |
| guide.profile.welcome | profile/guide_profile_welcome.mp3 | Perfil | card 1 | "Aqui a jornada fica com a sua carinha." | **manter** |
| guide.profile.identity | profile/guide_profile_identity.mp3 | Perfil | identidade | "Aqui ficam seu nome e seu avatar." | **manter** |
| guide.profile.parents | profile/guide_profile_parents.mp3 | Perfil | Área dos Pais | "Aqui os responsáveis cuidam..." | **manter** |

**Resumo corrigido (O2 — soma exata = 24):** **manter 18** · **substituir 2** (atelier.free_draw → contexto Criar Livre; atelier.gallery → contexto Minhas artes) · **remover 4** (atelier.welcome, atelier.coloring, atelier.guided_drawing, **home.create_beni**). **18 + 2 + 4 = 24.** Cada arquivo tem **exatamente um** status; nenhum áudio é alterado nesta rodada. Os novos áudios do onboarding (M1–M4) e o guia **Brincar** são **criar** (§13.2) — **não** contam entre os 24 atuais.

> **Correção da inconsistência do relatório O1** (§3 do prompt O2): o relatório O1 somava **16 + 3 + 3 = 22** (faltavam 2 dos 24). Causas: (a) **`guide.home.create_beni`** recebia dois status ("substituir/remover") — agora tem **um só = remover**; (b) o total de **"manter" estava subcontado (16)** — o conjunto real de mantidos é **18** (os 3 `initial` + 4 `adventures` + 5 `home` não-legado + 3 `stars` + 3 `profile`). Totais corretos: **manter 18 / substituir 2 / remover 4 = 24**.

### 13.2 Matriz dos áudios PROPOSTOS (novos — gerar em B2, não agora)
| ID proposto | Tela | Gatilho | Texto proposto | Texto p/ voz (pontuação ElevenLabs) | Duração alvo | Legenda | Repete | Pula | Prioridade | Caminho proposto |
|---|---|---|---|---|---|---|---|---|---|---|
| guide.onboarding.welcome | M1 | entrada | "Oi! Eu sou o Beni." | "Oi! Eu sou o Beni." | ≤3 s | sim | ao tocar no Beni | sim | alta | beni_guide/onboarding/ |
| guide.onboarding.invite | M1 | após surgir | "Vamos descobrir juntos histórias lindas da Bíblia?" | "Vamos descobrir juntos... histórias lindas da Bíblia?" | ≤4 s | sim | ao tocar | sim | alta | beni_guide/onboarding/ |
| guide.onboarding.world | M2 | revelação | "Aqui, cada história vira uma aventura." | "Aqui... cada história vira uma aventura!" | ≤4 s | sim | não | sim | alta | beni_guide/onboarding/ |
| guide.onboarding.world2 | M2 | segue | "Você pode ouvir, brincar, colorir e guardar descobertas no coração." | "Você pode ouvir, brincar, colorir... e guardar descobertas no coração." | ≤5 s | sim | não | sim | média | beni_guide/onboarding/ |
| guide.onboarding.name | M3 | entrada | "Antes de começarmos, como posso chamar você?" | "Antes de começarmos... como posso chamar você?" | ≤4 s | sim | não | sim | média | beni_guide/onboarding/ |
| guide.onboarding.ready | M4 | entrada | "{nome}, sua primeira aventura já está pronta!" | "{nome}... sua primeira aventura já está pronta!" | ≤4 s | sim | não | sim | alta | beni_guide/onboarding/ |
| guide.onboarding.creation | M4 | segue | "Vamos descobrir como Deus criou o mundo?" | "Vamos descobrir... como Deus criou o mundo?" | ≤4 s | sim | não | sim | alta | beni_guide/onboarding/ |
| guide.brincar.welcome | Brincar (1ª visita) | foco | "Aqui você escolhe uma brincadeira. Todas têm uma descoberta diferente." | "Aqui você escolhe uma brincadeira! Todas têm uma descoberta diferente." | ≤5 s | sim | via rever | sim | média | beni_guide/brincar/ |

**Compatibilidade de caminhos:** novos áudios ficam em **subpastas novas** (`beni_guide/onboarding/`, `beni_guide/brincar/`), sem sobrescrever os 24 existentes. "{nome}" exige **variação por gravação genérica** (o Beni fala uma frase que **não** contém o nome, ou o nome é exibido só em texto) — decisão em §26. **Voz do Beni** (P10 histórico): tours/celebrações/onboarding usam a **voz do Beni**, distinta da narração.

## 14. Contrato de carregamento

**Grupo A — bloqueante para a 1ª tela (M1):** background inicial · **pose principal do Beni** · **traço/elemento principal** · logo (se houver) · botão principal.
**Grupo B — preparar após a 1ª tela estável:** assets do Mundo (M2) · avatares · **capa de A Criação** · pose final do Beni · elementos de transição.

Regras: **prefetch** A antes de revelar M1 (via `expo-asset`, como `preloadGuideAudio` já faz); B em segundo plano após M1 estável; **fallback** seguro por asset; **skeleton** permitido só como respiro breve; **tempo máximo de espera** da 1ª revelação ≈ **1,5 s** (senão mostra M1 com fallback); **revelação progressiva** (nunca tela incompleta que se monta depois); **reservar espaço** (sem salto de layout); **offline** = tudo do onboarding é local (funciona sem rede); **memória baixa** = carregar só A, adiar B, liberar o que não está em tela; **falha de asset** = fallback + seguir. *Não implementar preloader nesta rodada.*

## 15. Teclado e formulário (M3)

`KeyboardAvoidingView` (padrão atual: iOS `padding` / Android `height`) + ScrollView `keyboardShouldPersistTaps="handled"`. **Foco:** manual (evitar teclado subir antes do encanto) — a confirmar. Botão do teclado = **"concluído"** (`returnKeyType="done"`, `onSubmitEditing` avança). **Sanitização:** trim, colapsar espaços, `maxLength` (atual 20; avaliar 24), aceitar **acentos/Unicode** (nomes PT-BR), **sem** exigir sobrenome. **Nome vazio** → mensagem gentil (não travar); fallback interno só se o fluxo permitir avançar sem nome (a confirmar — hoje exige não-vazio). **Nome impróprio** → sem filtro hoje; avaliar lista curta local **opcional** (§26). **Nome longo** → limite + elipse na exibição. **Persistência:** grava no perfil local; **falha de storage** → segue em memória, avisa suave, não perde o encanto. **Voltar** preserva o valor. Layout com teclado: campo+botão sempre visíveis; indicador de progresso recolhe. **Leitor de tela / tablet / Android+iOS:** ver §18.

## 16. Privacidade e separação adulto/criança

**Sem cadastro.** Nome **local** (não sai do aparelho) · **sem** email · **sem** data de nascimento exata · **sem** voz/foto/localização · **sem** compra · **sem** link externo para a criança. Texto de confiança ao responsável em M3 ("Esse nome fica somente neste aparelho."). **Área dos Pais** acessível sem quebrar a magia: **não** no onboarding; via aba Perfil, atrás do **gate parental** já existente (pergunta simples), nunca como etapa obrigatória.

## 17. Persistência e versões

Chave atual: `@ptf_onboarding_v1` `{completed, version}`, `ONBOARDING_CURRENT_VERSION` (hoje 1). Proposta (implementar em O2/O3, **não** agora):
- **Versão do onboarding** = bump quando o conteúdo mudar; permite reapresentar **sem repetir tudo** (mostra só o que é novo).
- Estados: **concluído · pulado · sem voz** (persistir a preferência de voz do onboarding — hoje é por sessão) · **guias contextuais concluídos** (já em `beniTourService`).
- **Reapresentação manual** ("Rever apresentação"): novo ponto de entrada (Perfil/Área dos Pais) que roda M1→M2 (encanto) sem exigir re-personalização.
- **Migração de usuários existentes:** `hasCompletedOnboarding` já cobre `@ptf_onboarding_v1` + legado `@ptf_profile` → **não** reapresentar a quem já concluiu.
- **Interrupção no meio / app fechado:** retomar do início do onboarding (curto) — não persistir passo intermediário (simplicidade).
- **Troca de perfil:** onboarding é por instalação; múltiplos filhos entram por outro fluxo (não reonboarda o app).
- **Falha de storage / reinstalação:** fluxo roda de novo com segurança.
- **Reset:** pelo **Modo Criador** (já existe `resetAllGuides`/`resetBeniAppTour`) e, se aprovado, pela **Área dos Pais**. **Não alterar chaves nesta rodada.**

## 18. Acessibilidade

Ordem de foco = ordem visual (Beni/texto → CTA → secundário → indicador). **Rótulos** claros; **texto escalável**; **leitor de tela** anuncia fala do Beni, CTA e avatar selecionado; **botões ≥ 44 pt**; **movimento reduzido** respeitado (§12); **contraste** suficiente (dourado sobre azul/creme validado); **legendas** sempre (o texto é a legenda); **controle de áudio** acessível; **indicador de progresso não dependente só de cor** (forma+posição — §10); **avatar selecionado anunciado** ("Estrela, selecionado"); **erros de formulário anunciados** (`accessibilityLiveRegion`); **teclado** não cobre campo/botão; **tablet** (layout centralizado, largura máxima); **orientações simples** para crianças (frases curtas, ícones claros). **Avatar sem rótulo de gênero repetido:** rótulo acessível descritivo por tom (ex.: "Criança, pele clara" / "Criança, pele escura" / "Estrela") — **decisão de copy em §26**.

## 19. Estados excepcionais

Imagem do Beni indisponível → fallback (pose base / silhueta) · capa de A Criação indisponível → placeholder do Livro Vivo + CTA ainda funciona · áudio indisponível → segue em texto · **sem internet** → tudo local, ok · storage indisponível → segue em memória, avisa suave · app fechado no meio → recomeça · **perfil existente** → não reonboarda · nome/avatar antigo → preserva · sem voz → texto+legenda · movimento reduzido → estados estáticos · aparelho pequeno → layout compacto (scroll no M3) · tablet → centralizado · **Modo Criador** → selo só no Dev Client, **fora das capturas de produção** · tour antigo concluído → não repete · app atualizado → só o que é novo · **falha de navegação no fim** → fallback `reset` para Home (já existe) · **dois toques rápidos** → guarda contra duplo avanço/save (`saving` ref) · teclado aberto ao avançar → fecha teclado antes de transicionar · **áudio em reprodução ao trocar de momento** → para o áudio anterior antes do próximo (sem sobreposição).

## 20. Wireframes textuais

Convenção por tela: `[safe-area topo]` · `TL`=topo-esquerda · `TR`=topo-direita · `BG` · `Beni` · `elemento` · `texto` · `CTA` · `secundária` · `indicador` · estados (teclado/sem-áudio/reduzido/erro) · tablet.

**M1 — Encontro**
```
[safe-area topo]
TL: (vazio)            TR: [ Pular ]  [ som on/off ]
BG: azul profundo → creme, luz central; TRAÇO dourado desenhando
Beni: corpo inteiro / três quartos, centro-baixo, reage 1×
texto (balão/legenda): "Oi! Eu sou o Beni. Vamos descobrir juntos histórias lindas da Bíblia?"
CTA: [ Conhecer meu mundo ]           secundária: —
indicador: nós de luz no traço (1/4)
sem-áudio: só texto     reduzido: traço já pronto, Beni em fade
tablet: composição centralizada, largura máx.
```
**M2 — Mundo revelado**
```
TL: [ ← Voltar ]      TR: [ Pular ]  [ som ]
BG: creme luminoso, profundidade; traço conecta ícones do mundo
elemento: cena orgânica (mapa/livro/colorir/brincar/estrelinhas/A Criação) — discreto
texto: "Aqui, cada história vira uma aventura. Você pode ouvir, brincar, colorir e guardar descobertas no coração."
CTA: [ Quero explorar ]               indicador: 2/4
reduzido: sem parallax     erro(asset): placeholders + CTA ativo
```
**M3 — Personalização**
```
TL: [ ← Voltar ]      TR: [ Pular ]
BG: creme calmo; traço lateral discreto
Beni: compacto (apontando)
texto: "Antes de começarmos, como posso chamar você?"
campo: [ Seu nome ou apelido ]   confiança: "Esse nome fica somente neste aparelho."
avatar: "Escolha seu rostinho"  grade: [base: criança clara][criança escura][estrela] (sem "Menino/Menina" repetido)
CTA: [ Esse sou eu ]             indicador: recolhe com teclado
teclado: campo+CTA visíveis    erro: "Escreve seu nome ou apelido aqui" (anunciado)
tablet: coluna centralizada
```
**M4 — Primeira aventura**
```
TL: (vazio)           TR: [ som ]
BG: luminoso; traço chega ao livro/portal
elemento: CAPA OFICIAL de A Criação (destaque)
Beni: celebrando, ao lado
texto: "{nome}, sua primeira aventura já está pronta! Vamos descobrir como Deus criou o mundo?"
CTA principal: [ Descobrir A Criação ]  (precedência visual absoluta)
secundária discreta: [ Explorar o app primeiro ]
indicador: 4/4 (traço completo)
sem-áudio: texto     reduzido: capa em fade     erro(capa): placeholder + CTA ativo
```

## 21. Direção de arte — ver §11 (consolidada)

## 22. Critérios de aceite

1. Vê **valor antes de digitar o nome**. 2. Beni **atua na cena** (não círculo). 3. **Mundo do Beni revelado**. 4. **A Criação aparece antes do fim**. 5. **Uma ação principal clara por momento**. 6. **Sem "Ateliê"** na linguagem visível. 7. **Sem compra**. 8. Sem tela branca. 9. Sem imagem atrasada montando depois. 10. **Sem áudio obrigatório** (texto/legenda sempre). 11. Sem animação excessiva. 12. **Sem estrelas como paginação** (salvo justificativa aprovada). 13. **Sem rótulos repetidos de gênero**. 14. **Sem final genérico**. 15. Nome+avatar **compactos**. 16. Fluxo **curto**. 17. **Guias contextuais** posteriores. 18. **Pular**. 19. **Rever**. 20. **Dados locais**. 21. Acessibilidade. 22. Movimento reduzido. 23. **Offline**. 24. **Tablet**. 25. Testes de **primeira instalação e migração**.

## 23. Testes (para os blocos de implementação)

Estruturais/smoke: 4 momentos presentes · uma ação principal por momento · sem "Ateliê"/"Criar com Beni"/"Desenho guiado"/"Bichinhos" na linguagem visível · sem emoji-estrela como paginação · rótulos de avatar sem gênero repetido · só avatares **base** no onboarding · reset navega para Aventuras com `startBeniTour` · persistência `@ptf_onboarding_v1` intacta · guias marcam "visto" e não repetem · movimento reduzido sem animação escondida · a11y labels presentes. Comportamentais: pura de sanitização de nome (trim/limite/acentos/vazio) · seleção de índice de progresso · escolha de avatar (base only) · migração (quem concluiu não reonboarda). Device (owner): encanto, teclado, sem-voz, pular, rever, tablet, offline, primeira instalação e conta migrada.

## 24. Divisão da implementação futura

| Bloco | Objetivo | Dependências | Allowlist provável | Proibidos | Testes | Device | Critério de saída | Não misturar |
|---|---|---|---|---|---|---|---|---|
| **O2** — fundação de carregamento **+ 1ª implementação visual** | prefetch A/B + os 4 momentos com o traço dourado (mudança visual real), **sem áudio** | esta spec aprovada | `src/screens/OnboardingScreen.js`, `src/components/onboarding/*`, `src/services/onboardingAssetWarmup.js`, `src/theme/onboardingVisualTokens.js`, smoke | áudio (novo/antigo), storage keys, avatars.js (além de leitura), navegação de outras abas, guias O4 | smoke dirigido + a11y + comportamental de nome | encanto sem tela branca, teclado, tablet, reduzido, offline | com áudio/guias O4 |
| **O3** — refino visual | polimento pós-validação do proprietário | O2 validado no device | `src/components/onboarding/*`, estilos | idem O2 | idem | idem | ajustes aprovados | com áudio/guias |
| **O4** — guias progressivos | 1ª visita por aba + higiene de guias legados | O3 | `beniGuides.js`, `beniTourService.js`, telas de aba (guia), smoke | áudio novo, storage de progresso/acesso | guia único, não repete, revisível | por aba, sem cobrir alvo | com onboarding |
| **B1** — roteiros do Beni | fechar textos finais (onboarding + guias) | O3/O4 | docs de roteiro (spec/`docs/`) | código de produção | revisão de texto | leitura em voz alta | textos aprovados p/ gravação | com geração |
| **B2** — geração/revisão de áudios | gerar e revisar os novos mp3 (voz do Beni) | B1 aprovado | `assets/audio/beni_guide/onboarding/`, `/brincar/`, `beniGuideAudio.js` | telas, storage, navegação | inventário/manifesto | escuta no device | áudios aprovados, caminhos novos | com integração |
| **B3** — integração + regressão | ligar áudios, sem-voz, legendas; regressão | B2 | telas de guia/onboarding, `beniGuideAudio.js`, smoke | novos assets fora do plano | smoke + regressão | fluxo completo device | gates verdes, sem regressão | com features novas |

## 25. Riscos

1. **Arte nova (traço + Mundo)** é o maior risco de prazo/consistência — depende de asset dedicado (não gerar agora).
2. **"{nome}" na fala** — TTS com nome dinâmico é caro/instável; mitigação: nome só em texto, fala genérica.
3. **Encanto × tempo** — animações longas antes da 1ª ação prejudicam crianças pequenas; contrato de movimento limita isso.
4. **Higiene de guias legados** (Ateliê/Criar com Beni) pode ter efeitos colaterais em telas contextuais (`AtelierScreen`) — tratar em O4 com cuidado.
5. **Capa de A Criação** depende do congelamento visual (M3) — usar a capa oficial atual; se mudar, é só troca de asset.
6. **Movimento reduzido / memória baixa** exigem caminhos estáticos testados.

## 26. Decisões pendentes (residuais)

As decisões de conceito/UX foram **encerradas** na §0 (aprovação O2). Permanecem abertas apenas:

1. **Rótulos de avatar (copy exata para acessibilidade)** — a decisão #6/#7 já fixou "sem gênero repetido, só a11y"; falta a redação final do rótulo (ex.: "Criança, pele clara" / "Criança, pele escura" / "Estrela"). O2 usa esses rótulos provisórios até a copy final.
2. **Textos finais dos áudios (B1)** — os textos visíveis dos momentos estão aprovados (§0); o fraseado com pontuação para gravação da **voz** fecha em B1.
3. **Filtro de nome impróprio** — decisão #22 fixou "sem blacklist extensa"; fica em aberto se haverá uma verificação mínima local futura (fora de O2).

> Resolvidas na §0: conceito, 4 momentos, nós de luz, nome+avatar juntos, nome no texto final, áudio sem nome dinâmico, CTAs (Descobrir A Criação / Explorar primeiro / Explorar Aventuras), sem-voz persistido em B3, rever via Perfil/Área dos Pais, sem guia Minhas artes, sem pose nova em O2, regras de nome/privacidade/offline.

---

### Confirmações do bloco O2
Esta especificação foi **fechada e commitada** (bloco O2, Etapa 1) com as decisões da §0 e a matriz de áudios corrigida (24 = manter 18 / substituir 2 / remover 4). A **implementação visual** é entregue na Etapa 2 (branch `feature/onboarding-o2-magical-first-experience`), **sem áudio** e **sem commit do código**, aguardando validação no aparelho. **O4 e B1 não iniciados.**
