# DOCUMENTO OFICIAL DO PROJETO — Pequenos Traços de Fé — **v5**

**Fonte única de verdade da linha de lançamento.** · Data: 2026-07-30 · Baseline técnico: `aeda9c2`

> **Precedência.** Esta v5 é a fonte única da **linha de lançamento**, **subordinada** a:
> [`docs/PROJECT_SOURCE_OF_TRUTH.md`](PROJECT_SOURCE_OF_TRUTH.md) (governança operacional) →
> [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) →
> [`AGENTS.md`](../AGENTS.md) / [`CLAUDE.md`](../CLAUDE.md).
> As **decisões de produto** continuam governadas por [`docs/DECISIONS.md`](DECISIONS.md)
> (**árbitro**): em conflito entre esta v5 e o `DECISIONS.md`, **vence o `DECISIONS.md`**.
>
> **Rito antibifurcação (D-ANTIBIFURCACAO):** toda sessão de IA começa lendo o `DECISIONS.md`.
> Decisão que só existe em conversa não é oficial até entrar lá.

---

## 1. Declarações constitutivas desta versão

1. **A v5 substitui a v4 como fonte única da linha de lançamento.** A partir desta data, a
   linha de lançamento é lida aqui.
2. **[`docs/DECISIONS.md`](DECISIONS.md) permanece o árbitro das decisões de produto.** A v5
   não decide: ela organiza, sequencia e torna rastreável o que o árbitro registrou.
3. **[`docs/PROJECT_SOURCE_OF_TRUTH.md`](PROJECT_SOURCE_OF_TRUTH.md) permanece superior na
   governança operacional.** Regras de execução, portões de qualidade e disciplina de repositório
   continuam vindo de lá.
4. **Documentos anteriores permanecem históricos.**
   [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md) (v4),
   [`DOCUMENTO_OFICIAL_PROJETO_FINAL.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL.md) (v2.0) e
   [`PLANO_OFICIAL_BENI_LANCAMENTO.md`](PLANO_OFICIAL_BENI_LANCAMENTO.md) são **histórico, não
   normativo**. Nenhum deles é apagado ou reescrito.
5. **A Fase 2 está encerrada.** A trilha de loading, packs, recovery e performance foi fechada e
   ratificada; não se reabre investigação sobre ela
   (ver [`D-LP-FECHAMENTO`](DECISIONS.md#d-lp-fechamento--fechamento-da-trilha-loadingperformance-e-baseline-da-fase-25)).
6. **Baseline técnico oficial:**
   - branch **`fix/loading-performance-foundation`** no commit **`aeda9c2`**;
   - tag anotada **`lp-foundation-closed-2026-07-30`** no commit **`bc79edb`**;
   - **smoke `3314/3314`**.
7. **Fase atual: Fase 2.5 — integração do Colorir com o Beni sobre a fundação.**
8. **Branch de trabalho da Fase 2.5:** **`integrate/colorir-with-loading`**.
9. **Branch de origem do piloto:** **`feat/colorir-60-pilot-creation`** no commit **`795760a`**.
10. **Merge base confirmado:** **`6cf799c`**.
11. **A integração será reconstruída por blocos. Não haverá merge bruto da branch antiga.**

---

## 2. Baseline técnico carimbado

| Item | Valor |
|---|---|
| Branch da fundação | `fix/loading-performance-foundation` |
| Commit da fundação (baseline) | `aeda9c2` |
| Tag de fechamento | `lp-foundation-closed-2026-07-30` → `bc79edb` |
| Smoke no baseline | **3314/3314** |
| Branch de trabalho da Fase 2.5 | `integrate/colorir-with-loading` (nasce de `aeda9c2`) |
| Branch de origem do piloto do Colorir | `feat/colorir-60-pilot-creation` → `795760a` |
| Merge base entre as duas | `6cf799c` |
| Stack | Expo SDK 54 · RN 0.81.5 · React 19.1.0 · New Architecture · **100% JavaScript** |
| Arquitetura de conteúdo | 2 histórias grátis locais no binário + 18 premium por packs remotos (Cloudflare R2), sha256 real, troca atômica `.tmp → localDir → ready` |

**O que o baseline NÃO afirma:**

- **Não existe afirmação de desempenho medido quantitativamente.** Nenhuma medição foi
  registrada (risco **R21**). Qualquer ganho percebido até aqui é qualitativo.
- **Não existe readiness de loja.** O binário ainda referencia conteúdo pesado por `require()`
  estático (**R5**), com premium (**R6**) e linearts legados (**R7**) embarcados.

---

## 3. Roadmap integral até o lançamento

Sequência **ativa e completa**. Cada fase traz **objetivo**, **entregas centrais**,
**critério de saída** e **riscos atribuídos** quando aplicável.

> **Sem prazos.** Esta v5 **não** atribui semanas, datas ou durações a nenhuma fase. O
> sequenciamento é por dependência, não por calendário.

---

### Fase 0 — Governança

- **Objetivo:** garantir que exista uma fonte única, um árbitro e um rito antibifurcação antes de
  qualquer decisão de produto virar código.
- **Entregas centrais:** `PROJECT_SOURCE_OF_TRUTH.md`; `DECISIONS.md` como árbitro único;
  `AGENTS.md` compartilhado entre agentes; índice de documentação; precedência documental escrita.
- **Critério de saída:** toda decisão oficial vive no árbitro; documentos conflitantes marcados
  como históricos; nenhuma decisão ativa existindo só em conversa.
- **Estado:** **concluída** (consolidada na Reconciliação E1 e reforçada nesta v5).

---

### Fase 1 — Piloto do Colorir

- **Objetivo:** provar, isoladamente, o novo modelo de atividade de colorir com o Beni — catálogo,
  telas, storage, tema e assets — sem tocar na arquitetura de conteúdo.
- **Entregas centrais:** catálogo de atividades do Colorir 60; telas e componentes dedicados;
  autoridade de escrita própria; trio de atividades de **A Criação**; validação física registrada.
- **Critério de saída:** piloto aprovado no dispositivo pelo fundador, em branch própria
  (`feat/colorir-60-pilot-creation` @ `795760a`), **sem** integração com a fundação.
- **Estado:** **concluída na branch de origem**; a integração é a Fase 2.5.

---

### Fase 2 — Loading, packs, recovery e performance

- **Objetivo:** dar ao app uma fundação confiável de carregamento e de conteúdo remoto: download,
  integridade, publicação atômica, recuperação de falha e ausência de travamentos.
- **Entregas centrais:** `packDownloadService` genérico por `storyId`; manifesto global; sha256
  real via `@noble/hashes`; ready-gate e troca atômica; recuperação sem segundo download; harness
  de testes endurecido; `.gitattributes` fixando `scripts/smoke.js` em LF.
- **Critério de saída:** trilha auditada, tag de fechamento aplicada, smoke `3314/3314`, dívidas
  não bloqueantes registradas.
- **Estado:** **ENCERRADA.** Não se reabre investigação sobre ela.
- **Pendências físicas herdadas:** os três cenários ainda não executados em dispositivo — **dois
  READY concorrentes**, **reset seguido de retry**, **saída durante a instalação** — passam a ser
  **gates de aceite da Fase 2.5**.

---

### Fase 2.5 — Integração do Colorir com o Beni sobre a fundação

- **Objetivo:** trazer o piloto do Colorir para cima da fundação encerrada, **por blocos**, sem
  merge bruto da branch antiga, e fechar as condições obrigatórias herdadas da Fase 2.
- **Entregas centrais:**
  1. Governança e fonte de verdade v5 (**este documento**) e o registro
     [`D-C60-INTEGRACAO-PRODUTO`](DECISIONS.md#d-c60-integracao-produto--integração-do-colorir-com-o-beni-decisões-de-produto)
     no árbitro.
  2. ⚠️ **REVISADA EM 2026-08-03 (Spec 019).** ~~**Bloqueio de persistência de pintura no plano
     Grátis na autoridade de ESCRITA**, fail closed, não apenas na UI — incluindo o caminho legado
     de colorir de história.~~ A entrega original **foi implementada e validada fisicamente**
     (commit `1e2f8dd3`, build `3b4dea54`). Em 2026-08-03 o fundador **revogou a política de
     produto** que ela materializava, **para o Colorir com o Beni**. A entrega passa a ser:
     **autoridade de ESCRITA única e fail closed decidindo pela ACESSIBILIDADE real da história e
     da atividade — não pelo plano**, de modo que **todo usuário com acesso legítimo salva a sua
     pintura do Colorir narrativo**. A **camada** e o **fail closed** não mudam; muda o **critério**.
     O **Criar Livre permanece intocado** (`E1-PLANO-FREE`, `E1-ARTES-SALVAR` e
     `ATELIER_FREE_SAVE_LIMIT = 0` seguem vigentes). Registro:
     [`D-C60-PERSISTENCIA-TODOS-PLANOS`](DECISIONS.md#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos).
  3. **Atualização funcional de manifest/pack para quem já baixou conteúdo** (ativar
     `needs_update`), com política de versão anterior íntegra e rollback.
  4. **Política mínima de coleta de lixo** e **desempate determinístico de `ambiguous`**.
  5. **Alinhamento do kind aceito** entre `packManifestService` e `packDownloadService` (dívida D6).
  6. **Transplante semântico do smoke** sobre o `scripts/smoke.js` LF — sem merge bruto do arquivo
     CRLF da branch antiga.
  7. **Preservação dos linearts legados** durante a integração, sem ampliar a dependência deles.
  8. **Documentação da experiência após a expiração da verificação offline**, sem apagar pack nem arte.
  9. Definição operacional de **colorir concluído** aplicada ao critério de conclusão de história.
- **Critério de saída:**
  - os três gates físicos herdados da Fase 2 executados e aprovados em dispositivo;
  - ⚠️ **REVISADO EM 2026-08-03 (Spec 019).** ~~Grátis comprovadamente sem persistir pixels de nova
    pintura, verificado na camada de escrita;~~ **O critério original foi cumprido e validado**
    (commit `1e2f8dd3`). Ele é **substituído** por: **Grátis comprovadamente PERSISTINDO a pintura
    do Colorir narrativo de história acessível, verificado na camada de escrita e em dispositivo
    físico** — e, simetricamente, **comprovadamente NÃO persistindo** quando a história **não** está
    acessível. A **verificação continua sendo na camada de escrita**, nunca só na UI. O critério
    equivalente do **Criar Livre** (Grátis = zero salvamentos) **permanece inalterado**;
  - atualização de conteúdo comprovada para quem já tinha baixado;
  - smoke verde com o transplante semântico concluído e `scripts/smoke.js` em LF puro;
  - validação visual do **novo Colorir** **e** do **consumidor legado** de `scene_02.png`.
- **Riscos atribuídos:** **C2**, **C3**, **C4**, **C5**, **C6**, **C7**, **C8** e **C9** de
  [`specs/012-loading-performance-foundation/RELATORIO_FECHAMENTO_LP.md`](../specs/012-loading-performance-foundation/RELATORIO_FECHAMENTO_LP.md)
  §9.1 — estados individuais registrados no árbitro.
- **Veículo de execução da entrega 2 revisada:**
  [`specs/019-c60-persistence-all-plans/`](../specs/019-c60-persistence-all-plans/spec-c60-persistence-all-plans.md),
  em blocos **D1 → S1 → S2 → S3 → S4 → D2**. A spec **018** (ativação controlada do piloto) está
  **concluída e validada fisicamente** e **não** é reaberta.
- **Estado:** ~~**em execução.** ⛔ **Janela transitória ativa desde 2026-08-03: NÃO GERAR BUILD**
  entre o **D1** e a conclusão do **S1** da Spec 019 — a documentação já revogou a política antiga,
  mas o código e o `scripts/smoke.js` ainda a defendem.~~
  ✅ **ATUALIZADO EM 2026-08-04.** A janela transitória está **encerrada** — código, smoke e
  documentação voltaram a concordar. A **Spec 019 está concluída e fisicamente aprovada** no build
  **`bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a`** (commit **`b24c868`**, perfil `c60-pilot`,
  fingerprint `c8b6c521500558fde471e47202d41d5e9dda79aa`), com **A1–A5** e **P1–P10** aprovados pelo
  fundador em iPhone real, smoke **4512/4512** e expo-doctor **18/18**. Registro em
  [`docs/C60_VALIDACAO_FISICA.md`](C60_VALIDACAO_FISICA.md) **Parte D** e no árbitro
  ([`D-C60-PERSISTENCIA-TODOS-PLANOS`](DECISIONS.md#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos) §8).
  Os blocos **D1 → S1 → S2 → S3 → S4 → S4-FIX → D2** estão **todos concluídos**.
- **Limite explícito do eixo comercial.** O perfil `c60-pilot` **não declara chave
  `EXPO_PUBLIC_REVENUECAT_*`** e opera permanentemente no **plano Grátis**. Portanto **entitlement
  Família real, compra, restauração, pack premium e downgrade NÃO foram validados fisicamente** — e
  **não** são registrados como aprovados nem reprovados. Por decisão do fundador em 2026-08-04, são
  **obrigatórios na Fase 18** e recebem **revalidação obrigatória na Fase 21**.

---

### Fase 3 — Reconciliação integral somente leitura

- **Objetivo:** confrontar, sem alterar código, o que os documentos afirmam com o que o repositório
  de fato faz, eliminando divergências silenciosas antes do congelamento de produto.
- **Entregas centrais:** varredura documento↔código de acesso, progresso, conclusão, packs, áudio,
  assets e telas; lista de divergências com veredito para cada uma; correção documental das que
  forem de documentação; abertura de bloco próprio para as que forem de código.
- **Critério de saída:** nenhuma divergência conhecida entre árbitro, v5 e código sem destino
  atribuído; relatório de reconciliação registrado.
- **Riscos atribuídos:** **R21** — **baseline de medição** é estabelecido aqui.

---

### Fase 4 — Product Lock final

- **Objetivo:** congelar o escopo de produto do v1: o que entra, o que fica de fora e o que é
  explicitamente adiado.
- **Entregas centrais:** fechamento das pendências controladas que dependem apenas de decisão do
  fundador; lista final de telas, abas, jogos, histórias e benefícios por plano; registro de tudo
  no árbitro.
- **Critério de saída:** nenhuma pendência de escopo em aberto para o v1; qualquer novidade posterior
  passa a exigir reversão explícita registrada no árbitro.
- **Regra permanente:** **nenhuma pendência do Product Lock pode ser tratada como resolvida antes
  desta fase.** Documentos não inventam a resposta.

---

### Fase 5 — Infância, privacidade, teologia e medição

- **Objetivo:** validar o produto congelado nos quatro eixos que não são negociáveis num app
  infantil cristão.
- **Entregas centrais:** revisão de adequação etária e linguagem; revisão de privacidade
  (local-first, sem tracking infantil, sem coleta de dados pessoais); revisão bíblica/teológica do
  conteúdo; definição do que será medido e como, sem violar privacidade.
- **Critério de saída:** parecer registrado em cada eixo; plano de medição anônima aprovado;
  nenhuma prática pendente que exija mudança de arquitetura depois.

---

### Fase 6 — Shell, splash e sistema visual

- **Objetivo:** entregar a primeira impressão do app — abertura, splash, shell de navegação e
  aplicação do sistema visual "O Livro Vivo".
- **Entregas centrais:** tokens, tipografia e componentes-base aplicados; splash e abertura reais;
  estados de card por chip/selo/ícone/tratamento, **não** por paleta paralela
  ([`D-STATUS-CARDS`](DECISIONS.md#d-status-cards--status-por-chipseloíconetratamento-não-por-paleta-paralela));
  varredura visual de telas.
- **Critério de saída:** shell e abertura validados visualmente em dispositivo; nenhuma tela
  usando paleta de status paralela.
- **Riscos atribuídos:** **R21** — **medição de shell e abertura**.

---

### Fase 7 — Onboarding, Home e Área dos Pais

- **Objetivo:** desenhar e implementar a primeira experiência da criança e a superfície de
  confiança do responsável.
- **Entregas centrais:** onboarding (especificação e implementação visual); Home final; Área dos
  Pais consolidada com gate parental; remoção/redirecionamento dos atalhos legados de linguagem
  superada.
- **Critério de saída:** primeira sessão de uma criança nova percorrida ponta a ponta em
  dispositivo; Área dos Pais sem vazamento de linguagem comercial para a criança.
- **Pendências desta fase:** **QA REP 01** (repetição da primeira experiência para QA) e
  **ONB BRI 01** (apresentar a aba Brincar) — ver [§4.1](#41-pendências-físicas-registradas-na-fase-3--e004-a-e007).
  Somam-se as **duas pendências físicas não bloqueantes herdadas da Spec 020**: (a) a primeira
  sessão em **tablet**, não validada por ausência de aparelho compatível; (b) o **fluxo de revisão**
  com *A Criação* já concluída (CTA `Explorar Aventuras`), não repetido no build `98e2b422-…`.
  Ambas são obrigatórias nesta fase — no checklist mestre externo do fundador correspondem aos itens
  **E039** e **E042**, que **não** possuem representação versionada neste repositório.

---

### Fase 8 — Matriz de falas do Beni

- **Objetivo:** unificar a voz do Beni: o que ele fala, quando fala, em que tela e com que
  intenção.
- **Entregas centrais:** matriz completa de falas por contexto; roteiros finais; eliminação de
  falas legadas que citam nomes superados; regras de repetição e silêncio.
- **Critério de saída:** matriz aprovada pelo fundador; nenhuma fala ativa fora da matriz.

---

### Fase 8A — Orquestração sonora

- **Objetivo:** tratar áudio como sistema, não como arquivos soltos: música, narração, efeitos e
  falas do Beni coexistindo sem se atropelar.
- **Entregas centrais:** política central de ducking e prioridade; comportamento em interrupção,
  background e retorno; geração e integração dos áudios novos do Beni; toggles de áudio na Área
  dos Pais.
- **Critério de saída:** nenhuma sobreposição indevida em dispositivo; comportamento correto ao
  sair e voltar do app; áudios do Beni integrados conforme a matriz da Fase 8.

---

### Fase 9 — A Criação definitiva

- **Objetivo:** levar **A Criação** ao padrão final de lançamento, como referência de qualidade
  para todas as outras histórias.
- **Entregas centrais:** narração, cenas, quiz, Momento/Guardar no coração, Livrinho e as
  atividades do Colorir com o Beni na versão definitiva; conclusão e recompensas coerentes.
- **Critério de saída:** história percorrida do início ao fim em dispositivo, sem furo de conteúdo,
  sem placeholder e sem asset provisório.
- **Pendências desta fase:** **JRN C60 01** (conclusão por marco narrativo sem estado visual na
  história) — ver [§4.1](#41-pendências-físicas-registradas-na-fase-3--e004-a-e007).

---

### Fase 10 — Meu Livro e Escuta Tranquila

- **Objetivo:** consolidar as duas superfícies de releitura e de descanso — o livrinho da criança e
  o modo de escuta calma.
- **Entregas centrais:** Meu Livro com os dois modos reais (oficial e da criança, sem misto);
  Escuta Tranquila com controle simples e seguro; comportamento correto de progresso e de áudio.
- **Critério de saída:** ambos validados em dispositivo, incluindo retomada e saída no meio.

---

### Fase 11 — Conclusão, presentes, Estrelinhas e mapa

- **Objetivo:** fechar o ciclo de recompensa: como uma história termina, o que a criança ganha e
  como isso aparece no mapa e nas Estrelinhas.
- **Entregas centrais:** ritual de conclusão total
  ([`D-CONCLUSAO-TOTAL-B`](DECISIONS.md#d-conclusao-total-b--desbloqueio-da-próxima-história-exige-conclusão-total-opção-b));
  estado intermediário "Quase lá!"; presentes/lembranças; Estrelinhas coerentes com a fonte única
  de recompensa; horizonte final do Mapa de Aventuras.
- **Critério de saída:** desbloqueio da próxima história comprovadamente coerente com a definição
  operacional de conclusão registrada no árbitro; nenhum contador paralelo de estrelas.
- **Pendências desta fase:** **STR ONB 01** (colisão entre guia inicial e conquista nas Estrelinhas)
  — ver [§4.1](#41-pendências-físicas-registradas-na-fase-3--e004-a-e007).

---

### Fase 12A — Núcleo infantil e jogos

- **Objetivo:** fechar a aba Brincar e o núcleo lúdico com regra de acesso central e comportamento
  igual em todos os jogos.
- **Entregas centrais:** os quatro jogos finais em estado de lançamento; seção criativa (Criar
  Livre + Minhas artes); acesso central `can()`; rodadas diárias pela política compartilhada;
  recompensa com teto diário único.
- **Critério de saída:** nenhum jogo com contador próprio; limite do Grátis e ilimitado do Plano
  Família comprovados; evidência física em Android.
- **Riscos atribuídos:** **R20A** — ausência de evidência física em Android.
- **Pendências desta fase:** conteúdo, destinos e alvos de **ONB BRI 01** só são revalidados após o
  fechamento desta fase — ver [§4.1](#41-pendências-físicas-registradas-na-fase-3--e004-a-e007).

---

### Fase 12B — Rituais e Modo Igreja

- **Objetivo:** entregar os rituais familiares e o diferencial institucional.
- **Entregas centrais:** Cultinho em Casa; Baú do Beni e cartinhas; Modo Igreja polido e discreto,
  fora do caminho da criança comum.
- **Critério de saída:** rituais percorridos em dispositivo; Modo Igreja não interfere no fluxo
  infantil nem expõe linguagem administrativa à criança.

---

### Fase 13 — Noé e prova da fábrica

- **Objetivo:** provar que o padrão de qualidade de **A Criação** é **reprodutível** — Noé é a
  segunda história completa e, ao mesmo tempo, o teste do processo de produção.
- **Entregas centrais:** Noé com narração completa, cenas, quiz, Momento, Livrinho e atividades do
  Colorir; processo de produção documentado e repetível.
- **Critério de saída:** Noé no mesmo nível de A Criação; o processo usado está escrito e pode ser
  seguido por outra pessoa sem improviso.

---

### Fase 14 — Piloto ampliado

- **Objetivo:** validar o pipeline completo com um conjunto maior de histórias antes de escalar
  para todas.
- **Entregas centrais:** um subconjunto premium produzido pelo processo da Fase 13, empacotado,
  publicado, baixado e consumido offline em dispositivo real.
- **Critério de saída:** o subconjunto funciona ponta a ponta, offline, sem intervenção manual.
- **Riscos atribuídos:** **R20A** (evidência física em Android) · **R21** (medição do piloto
  ampliado).

---

### Fase 15 — Produção das outras dezoito histórias

- **Objetivo:** produzir o restante do catálogo com o processo já provado.
- **Entregas centrais:** cenas, narração, quiz, Momento, Livrinho e atividades do Colorir para as
  dezoito histórias premium; revisão bíblica de cada uma; inventário e validação de assets.
- **Critério de saída:** catálogo completo, revisado e validado; nenhum placeholder remanescente.

---

### Fase 16 — Congelamento editorial, visual e funcional

- **Objetivo:** congelar conteúdo, arte e comportamento antes de empacotar para distribuição.
- **Entregas centrais:** congelamento editorial e visual (M3); remoção do conteúdo premium do
  binário; remoção dos linearts legados do binário público; auditoria de bundle.
- **Critério de saída:** nada muda de conteúdo depois deste ponto sem reversão explícita; binário
  sem conteúdo premium embarcado.
- **Riscos atribuídos:** **R5** (peso do binário e `require()` estático) · **R6** (premium
  embarcado) · **R7** (linearts legados).

---

### Fase 17 — Packs e offline completo

- **Objetivo:** fechar a distribuição de conteúdo: packs definitivos, atualização, integridade e
  offline real.
- **Entregas centrais:** reconstrução dos packs sobre o conteúdo congelado; manifesto final;
  compatibilidade de versão (`appVersion`/`minAppVersion`/`requiresAppUpdate`); avaliação de
  **download seletivo** de atividades; revisão do custo de integridade em arquivos grandes.
- **Critério de saída:** instalação, atualização e uso offline comprovados em dispositivo, com
  conteúdo definitivo.
- **Riscos atribuídos:** **R5** · **R6** · **R7** (conclusão da remoção) · **R17** (compatibilidade
  de versão) · **R20B** (sha256 lendo o arquivo inteiro em base64).

---

### Fase 18 — RevenueCat, Stripe e Plano Família

- **Objetivo:** ligar a monetização real, com entitlement confiável e paywall respeitoso.
- **Entregas centrais:** entitlement por RevenueCat; paywall atrás da Área dos Pais + gate
  parental; compra, restore e sandbox; Plano Família aplicado a histórias, salvamento de arte,
  rodadas e avatares; **definição definitiva da duração da verificação offline**.
- **Critério de saída:** compra e restore reais aprovados em ambos os sistemas operacionais;
  nenhuma tela decidindo acesso sozinha; nenhuma oferta comercial exibida à criança.
- ➕ **Herdado da Fase 2.5 em 2026-08-04 — obrigatório.** Os cenários da **Spec 019** que o perfil
  `c60-pilot` não conseguiu exercer (por não declarar chave `EXPO_PUBLIC_REVENUECAT_*`) tornam-se
  **critério de saída desta fase**: **(a)** entitlement **Família real**; **(b)** persistência da
  pintura do Colorir com o Beni com Família real em **história premium**; **(c)** **download de pack
  premium** com salvamento da pintura correspondente; **(d)** **downgrade** de Família para Grátis
  **não apaga** a obra premium já salva; **(e)** teste premium **sem ferramentas internas**. Ver
  [`D-C60-PERSISTENCIA-TODOS-PLANOS`](DECISIONS.md#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos) §8.1
  e [`docs/C60_VALIDACAO_FISICA.md`](C60_VALIDACAO_FISICA.md) **Parte D §D.4/D.5**.
- **Dependência:** valores comerciais são **pendência controlada** até decisão do fundador — não
  são inventados por nenhum documento.

---

### Fase 19 — Hardening e modelo de ameaças

- **Objetivo:** endurecer o app contra falha, abuso e ambiente ruim.
- **Entregas centrais:** modelo de ameaças escrito; hardening de Android de baixa memória;
  comportamento sob armazenamento cheio, rede instável e interrupção; revisão de superfícies
  internas e ferramentas de desenvolvimento; revisão de custo e segurança do cálculo de
  integridade.
- **Critério de saída:** cenários adversos executados e documentados; nenhuma ferramenta interna
  alcançável em produção.
- **Riscos atribuídos:** **R20B**.

---

### Fase 20 — Engenharia de lançamento, EAS Update, rollout e compliance

- **Objetivo:** preparar a máquina de entrega e a conformidade de loja.
- **Entregas centrais:** perfis de build finais; estratégia de atualização entre versões;
  rollout gradual; Data Safety e App Privacy; classificação etária e metadados; materiais legais.
- **Critério de saída:** pipeline de entrega reproduzível; formulários de conformidade completos e
  coerentes com o comportamento real do app.
- **Riscos atribuídos:** **R17** (compatibilidade entre versões instaladas).

---

### Fase 21 — Beta do candidato e atualização real entre versões

- **Objetivo:** provar o candidato com famílias reais e provar que uma versão instalada consegue
  virar a próxima.
- **Entregas centrais:** beta fechado com famílias; matriz de QA incluindo tablet e Android fraco;
  **atualização real de uma versão instalada para a seguinte**, com conteúdo já baixado;
  medição final.
- **Critério de saída:** beta sem bloqueador crítico; atualização entre versões comprovada em
  dispositivo real, sem perda de progresso nem de arte.
- ➕ **Revalidação obrigatória decidida em 2026-08-04.** Os cinco cenários Família e premium herdados
  da **Spec 019** e validados na **Fase 18** são **revalidados aqui**, no candidato a lançamento —
  incluindo a **preservação da pintura já salva através da atualização entre versões**. Ver
  [`D-C60-PERSISTENCIA-TODOS-PLANOS`](DECISIONS.md#d-c60-persistencia-todos-planos-spec-019--persistência-local-do-colorir-com-o-beni-para-todos-os-planos) §8.1.
- **Riscos atribuídos:** **R20A** (evidência física em Android) · **R21** (medição final do beta).

---

### Fase 22 — Lançamento e operação

- **Objetivo:** publicar e operar.
- **Entregas centrais:** submissão e rollout gradual; monitoramento de falhas sem dados pessoais;
  resposta a incidente; ciclo de correção pós-lançamento; materiais de divulgação.
- **Critério de saída:** app publicado, com rollout controlado, canal de correção funcionando e
  operação registrada.

---

## 4. Mapa de riscos residuais por fase

Reproduz a atribuição oficial registrada em
[`D-LP-FECHAMENTO`](DECISIONS.md#d-lp-fechamento--fechamento-da-trilha-loadingperformance-e-baseline-da-fase-25).
Esta v5 **não** reatribui riscos; apenas os torna visíveis no roadmap.

| Risco | Descrição | Fases responsáveis |
|---|---|---|
| **R5** | Peso do binário e `require()` estático | 16 e 17 |
| **R6** | Conteúdo premium embarcado no binário | 16 e 17 |
| **R7** | Linearts legados embarcados | 16 e 17 |
| **R17** | `appVersion` literal, `minAppVersion` e `requiresAppUpdate` inerte | 17 e 20 |
| **R20A** | Ausência de evidência física em Android | 12A, 14 e 21 |
| **R20B** | sha256 lendo o arquivo inteiro em base64 | 17 e 19 |
| **R21** | Ausência de medições quantitativas | baseline na **3** · shell/abertura na **6** · piloto ampliado na **14** · beta final na **21** |

---

## 4.1 Pendências físicas registradas na Fase 3 — E004 a E007

Achados do **build interno iOS `98e2b422-0025-4d40-a772-073ef3dba553`** (perfil `c60-pilot`, commit
executável **`7f96ee9`**, fingerprint `c8b6c521500558fde471e47202d41d5e9dda79aa`), instalado e
percorrido pelo fundador em iPhone real. **Nenhum deles foi corrigido no bloco em que foi
registrado** — este é um registro de **fase proprietária**, não uma implementação.

Regra permanente destes quatro registros: **a correção pertence à fase proprietária indicada**.
Antecipar qualquer uma delas exige decisão explícita do fundador e ciclo SDD próprio.

**Encerramento do bloco de reconciliação (2026-08-04).** No mesmo build, a **Spec 020 foi declarada
fisicamente aprovada pelo fundador** no caminho principal de **telefone** e no caminho **`Pular`** —
registro completo em
[`specs/020-onboarding-first-adventure/spec-onboarding-first-adventure.md`](../specs/020-onboarding-first-adventure/spec-onboarding-first-adventure.md) §14,
que é a **única** fonte desse veredito. Com isso, **E003 a E008 estão CONCLUÍDAS**: E003 (aprovação
física do Bloco 1) e E008 (encerramento documental da Spec 020) por aprovação direta; E004 a E007
como **achados classificados fora do escopo de implementação**, cada um preso à sua fase
proprietária na tabela abaixo. **Nenhum deles reprova a Spec 020** e **nenhum** foi corrigido.
Duas pendências físicas **não bloqueantes** sobraram e migram para a **Fase 7** (ver Fase 7,
*Pendências desta fase*): **tablet** e **fluxo de revisão com A Criação já concluída**. Como o
fechamento alterou **somente documentação**, **nenhum build novo foi necessário**.

| Código | Achado | Severidade | Fase proprietária | Dependências | Revalidação |
|---|---|---|---|---|---|
| **QA REP 01** | Não existe caminho autorizado para repetir a primeira experiência (onboarding + guias) fora de `__DEV__` | P2 | **7** | — | **19** e **21** (ausência em produção) |
| **STR ONB 01** | Guia inicial das Estrelinhas e revelação de conquista disputam a mesma superfície e a tela fica sem ação possível | P1 | **11** | **7** e **8A** | **21** |
| **JRN C60 01** | Atividade do Colorir concluída por marco narrativo não apresenta estado de conclusão enquanto a história não termina — **classificação `A` confirmada fisicamente**: dado íntegro, representação acoplada a um gate global | P1 (saída da Fase 9) | **9** | — | **11** e **21** |
| **ONB BRI 01** | O onboarding não apresenta a aba Brincar — exige um **`BRINCAR_GUIDE` novo**, nunca o `ATELIER_GUIDE` | P2 | **7** (estrutura) | fechamento da **12A** | **14** e **21** |

### QA REP 01 — repetição da primeira experiência para QA (E004)

**Fato observado.** O build público **não** oferece opção visível para reiniciar o onboarding; para
rever a primeira experiência foi necessário **desinstalar e instalar novamente**.

**Causa, comprovada por leitura.** É comportamento **projetado**, não defeito:
`isInternalToolsEnabled()` (`src/config/internalTools.js`) só é verdadeiro em `__DEV__`, sob Modo
Criador de release ou sob Release Pack QA. O perfil `c60-pilot` **não declara** nenhum dos três
(`src/config/featureFlags.js`), logo a seção **"🛠️ Administração (dev)"** da Área dos Pais — que
contém *Rever apresentação do Beni*, *Rever Tour Inicial do Beni* e *Resetar Guias do Beni* — não é
renderizada (`src/screens/ParentAreaScreen.js`, `SHOW_TEST_TOOLS`).

**Inventário exato do estado que uma repetição precisará limpar.**

| Chave | Origem | O que representa |
|---|---|---|
| `@ptf_onboarding_v1` | `storageKeys.ONBOARDING_STATE` | onboarding concluído / pulado |
| `@ptf_beni_app_tour_seen_v1` | `beniTourService` · guia `initial` | tour inicial do Mapa já visto |
| `@ptf_beni_guide_adventures_v1` | guia `adventures` | guia da aba Aventuras |
| `@ptf_beni_guide_home_v1` | guia `home` | guia do Início |
| `@ptf_beni_guide_atelier_v1` | guia `atelier` | guia legado do Ateliê (**sem consumidor hoje**) |
| `@ptf_beni_guide_stars_v1` | guia `stars` | guia das Estrelinhas |
| `@ptf_beni_guide_profile_v1` | guia `profile` | guia do Perfil |
| `@ptf_beni_guide_parent_v1` | guia `parentArea` | guia da Área dos Pais |
| `_pendingInitialTour` · `_adventureTourActive` · `_advTabCallout` | `beniTourService` (**memória**) | sinais em memória do tour; morrem com o processo, **não** são storage |

**Estado que NÃO pode ser limpo junto** (limpar qualquer um destes transforma "repetir a primeira
experiência" em "apagar a infância registrada"): progresso de cenas (`storageKey.progress`), quiz,
reflexão, Livrinho, conclusão e pinturas do Colorir com o Beni
(`@ptf_coloring60_done_*`, `@ptf_coloring60_ever_*`, `@ptf_coloring60_snap_*`, `@ptf_drawing60_*`),
conquistas (`@ptf_achievements_seen`), perfis (`@ptf_child_profiles_v1`,
`@ptf_active_child_id_v1`, `@ptf_profile`), Ateliê/Criar Livre (`ptf_atelier_arts_v1_index`),
Brincar (`BRINCAR_DAILY`, `BRINCAR_STATS`), plano, packs e entitlement.

**Risco concreto de limpeza parcial — já existente no código.** `resetOnboardingForQa()`
(`src/services/onboardingService.js`) limpa **somente** `@ptf_onboarding_v1`. Usada sozinha, ela
reencena as quatro páginas do onboarding **mas não devolve o tour do Mapa**, porque
`@ptf_beni_app_tour_seen_v1` continua marcado — a primeira experiência volta **incompleta e
incoerente**. Uma repetição honesta precisa das **oito** chaves da tabela acima, e de nenhuma outra.

**Proposta futura (Fase 7) — não implementada.** Ação protegida **"Repetir primeira experiência
para QA"**, dentro da Área dos Pais, atrás do gate parental **e** do gate interno; existente
**apenas** em perfis internos; **jamais** exposta como botão público. A barreira **não** pode ser
uma única variável pública: o contrato vigente é a **conjunção** verificada em
`isInternalToolsEnabled()`, e é ela que deve ser reusada. Teste negativo **obrigatório** provando a
ausência da ação em perfil de produção.

**Estado de E004:** requisito **oficialmente documentado**. **Não** é função implementada.

### STR ONB 01 — colisão entre guia inicial e conquista nas Estrelinhas (E005)

**Fato observado.** Na primeira entrada em Estrelinhas, uma conquista obtida e o onboarding da
superfície tentaram aparecer no mesmo fluxo; a **voz do guia tocou**, a **tela ficou travada**, a
única interação disponível foi **trocar de aba**, e o onboarding só retomou depois de **encerrar
completamente e abrir novamente** o app.

**Sequência reconstruída** (`src/screens/TrophiesScreen.js`, `src/hooks/useScreenGuide.js`,
`src/components/BeniGuideOverlay.js`, `src/components/achievements/AchievementUnlockModal.js`):

| # | Elo | Classificação |
|---|---|---|
| 1 | `useScreenGuide('stars', !fromCena)` agenda o guia no foco da tela | **COMPROVADO PELO CÓDIGO** |
| 2 | Um efeito assíncrono paralelo lê as conquistas não reveladas e define `pendingAchievement` | **COMPROVADO PELO CÓDIGO** |
| 3 | As duas camadas são renderizadas por condições **independentes**, sem exclusão mútua entre si | **COMPROVADO PELO CÓDIGO** |
| 4 | Ambas são `<Modal transparent statusBarTranslucent>`; a ordem de empilhamento entre elas não é decidida por regra de produto | **COMPROVADO PELO CÓDIGO** |
| 5 | O véu do guia é `pointerEvents: 'auto'` fora do modo `embedded` — captura todo o toque da área coberta | **COMPROVADO PELO CÓDIGO** |
| 6 | O áudio do passo é um componente **headless** montado com o passo, independente de o card estar alcançável | **COMPROVADO PELO CÓDIGO** |
| 7 | O resultado no aparelho foi voz tocando com a tela sem ação possível, exceto trocar de aba | **COMPROVADO FISICAMENTE** |
| 8 | O guia só retomou após reabrir o app porque a marca `stars` é gravada **apenas** em `close()`, e `close()` não foi alcançável | **HIPÓTESE** — coerente com o código e com o observado, sem observação isolada que a confirme |

> **Voz tocando não é tutorial visível.** O elo 6 mostra que o áudio pode existir com o card
> inalcançável; nenhum registro deste bloco afirma que o tutorial estava visível e utilizável.

**Por que só nas Estrelinhas.** É a **única** tela do app onde convivem um guia de superfície
(`useScreenGuide`) e uma revelação de conquista. As demais telas com guia não revelam conquista, e
as telas que revelam conquista usam o hook compartilhado `useAchievementCelebration` e não têm guia.
`TrophiesScreen` também é a única que mantém a conquista em estado local em vez do hook
compartilhado.

**Contrato a ser congelado na Fase 11 (nove pontos, nenhum implementado agora).**

1. Apenas **uma** camada bloqueante ativa por vez.
2. Tutorial e conquista **não** disputam foco.
3. O áudio pertence à camada **visível** — nunca toca por uma camada coberta.
4. A camada seguinte só entra após **término, cancelamento ou adiamento** da anterior.
5. Trocar de aba **pausa** ou resolve a fila por regra explícita — nunca por acidente.
6. A fila **retoma sem reiniciar o aplicativo**.
7. Nenhum overlay pode deixar a tela **sem ação possível**.
8. Conquistas só são reveladas **dentro** de Estrelinhas.
9. A **prioridade definitiva** entre tutorial e conquista é congelada na Fase 11.

### JRN C60 01 — conclusão por marco narrativo sem estado visual (E006)

> **Classificação: `A` CONFIRMADA.** O roteiro físico residual foi **executado pelo fundador** e a
> hipótese A ficou provada: **a pintura e a conclusão são persistidas**. Não há perda, corrupção nem
> regressão da persistência aprovada na Fase 2.5. O defeito é **exclusivamente de representação**.
> A regra de bloqueio transversal do roadmap **não** é acionada; a fase proprietária permanece **9**.

**Evidência física declarada pelo fundador** (build `98e2b422-…`, commit `7f96ee9`, iPhone real):

1. Iniciou *A Criação* pelo caminho narrativo normal e avançou cena por cena.
2. Nas cenas-marco, abriu e **concluiu** as pinturas do Colorir com o Beni.
3. Voltou à página da história **antes** de terminar todas as cenas.
4. As atividades já concluídas continuaram **apagadas e travadas**.
5. O bloco exibia **"Conheça a história para liberar os desenhos"**.
6. O contador e os marcadores de conclusão **não apareciam**.
7. Terminou todas as cenas **sem refazer** nenhuma pintura.
8. Ao voltar à página da história, as pinturas anteriores apareceram **imediatamente** como
   concluídas: **`3 de 3`**, três estados **`Concluído`** e **`Ver minha coleção`**.
9. Em outro estado — história concluída e pinturas **removidas** — o bloco exibiu corretamente
   **`0 de 3`**.
10. Depois de concluir **apenas** *Haja luz*, o bloco atualizou corretamente para **`1 de 3`**.

Os itens 7 e 8 são a prova decisiva: **nada foi refeito** e tudo apareceu concluído. O item 9 mostra
que a exclusão parental continua honesta, e o item 10 que o contador reflete o disco assim que o
gate abre. Portanto **a leitura, a gravação e a hidratação estão corretas**.

**Causa oficial — confirmada no código, ponto a ponto.**

| # | Fato | Onde |
|---|---|---|
| 1 | O `doneMap` **verdadeiro** é carregado no foco **mesmo com a história em andamento** — o `useFocusEffect` só depende de `creationColoringVisible`, nunca de `isCompleted`, e chama `loadColoring60Done` por atividade | `src/screens/StoryDetailScreen.js:242-254` |
| 2 | A renderização envia `unlocked={isCompleted}` para `CreationColoringJourneySection`, e `isCompleted` significa **todas as cenas vistas** | `src/screens/StoryDetailScreen.js:573` (com `:132`) |
| 3 | `deriveColoring60CardState` deriva **tudo** a partir de `unlocked === true` — passos, ação principal e `allComplete` | `src/services/coloring60Journey.js:344-390` |
| 4 | Com `unlocked` falso: `unlocked !== true` força **todos** os passos a `LOCKED` (`:363`); o rótulo some (`STATE_LABEL[LOCKED]` é `null`, `CreationColoringJourneySection.js:130`); o contador não é renderizado (`:220-222`); a ação principal não existe (`coloring60Journey.js:379`), o que remove **`Ver minha coleção`**; a seção exibe **"Conheça a história para liberar os desenhos."** (`:231-234`); e os cards ficam `disabled` (`:141-142`) | — |

> **Causa oficial:** o **gate de conclusão integral das cenas** está sendo usado indevidamente como
> **gate de representação de toda a jornada de cores**. O `doneMap` verdadeiro é carregado, mas fica
> **visualmente oculto** até `isCompleted` se tornar verdadeiro.

**Não é** falta de hidratação. **Não é** ausência de revalidação no foco. **Não é** perda de dado.
É um único acoplamento indevido entre dois conceitos distintos: *"a história terminou"* e
*"esta atividade já foi concluída"*.

**Contrato para a Fase 9 (dez pontos, nenhum implementado agora).**

1. **Atividade concluída sempre aparece concluída**, mesmo com a história em andamento.
2. **Disponibilidade** é derivada **por atividade** e pelo **marco narrativo** correspondente — nunca
   por um gate global de história.
3. **Haja luz** (`light`) respeita seu marco narrativo: `unlockAfterScene: 2`, `resumeScene: 3`.
4. **O mundo cheio de vida** (`living_world`) respeita seu marco narrativo: `unlockAfterScene: 7`,
   `resumeScene: 8`.
5. **Na criação de Deus** (`people_and_care`) **preserva a recomendação aprovada para a cena 09**:
   `unlockAfterScene: 9`, `resumeScene: 10` — o marco saiu da cena 8 para a 9 por decisão do
   fundador, e `unlockAfterScene`/`resumeScene` movem-se **sempre juntos**
   (`src/data/coloring60StoryMilestones.js`).
6. Atividades **futuras** permanecem bloqueadas até o **próprio** marco.
7. `doneMap` concluído **nunca** pode ser sobrescrito visualmente por um gate global de história.
8. O retorno pelo botão **`Pronto`** atualiza **imediatamente** card, trilha e contador.
9. Concluir todas as cenas **pode liberar** atividades restantes, mas **não é requisito** para
   mostrar conclusões anteriores.
10. Encerrar e reabrir o aplicativo **preserva a mesma representação**.

**Severidade para saída da Fase 9: P1.** Revalidação nas Fases **11** e **21**.

### ONB BRI 01 — o onboarding não apresenta a aba Brincar (E007)

**Fatos comprovados por leitura.**

- O `INITIAL_TOUR` (`src/data/beniGuides.js`) tem **cinco passos** e **nenhum** menciona a aba
  Brincar; o único realce de aba é `highlightTab: 'adventures'`. **A ausência é real.**
- A aba existe e é a terceira de `TAB_DEFS` (`src/navigation/AppNavigator.js`): identidade de rota
  `Ateliê`, **rótulo visível `Brincar`**. Trocar o `name` quebraria a navegação do onboarding.
- Existe **guia antigo do Ateliê sem consumidor**: `ATELIER_GUIDE` está definido e **ninguém o usa**;
  o próprio arquivo registra que ele é mantido para não orfanar os cinco áudios `guide.atelier.*`.
- Esses **cinco áudios continuam referenciados** em `src/data/beniGuideAudio.js` — portanto
  protegidos do ponto de vista de asset, e **indisponíveis** do ponto de vista de experiência.
- Os alvos do tour inicial (`adventures.map`, `adventures.viewMapButton`, `adventures.nextPin`) são
  **reais e estáveis**, registrados por `useGuideTargets` na `AdventureMapScreen`. A `BrincarScreen`
  **não registra alvo algum** — hoje um passo sobre Brincar só conseguiria realçar a aba, não um
  elemento interno.
- No tablet, `highlightTab` é traduzido para `atelier.sidebarTab`, e **esse alvo não está registrado
  em lugar nenhum**: um passo de Brincar precisará registrá-lo antes de existir no tablet.
- Conteúdo real da aba hoje: quatro jogos (**Pares do Beni**, **Palavrinhas do Beni**, **Cadê a
  Ovelhinha?**, **Monte a Cena**) e a seção criativa (**Criar livre** e **Minhas artes**). Nenhum
  card está atrás de gate interno.

**Confirmação física.** A ausência da aba Brincar no onboarding foi **novamente confirmada em
aparelho**. Ela **não reprova a Spec 020**: aquela spec trata exclusivamente do **destino final no
Mapa de Aventuras**. Permanece como **pendência obrigatória da Fase 7**.

**Contrato futuro (doze pontos, nenhum implementado agora).**

1. O onboarding **apresentará** a aba Brincar.
2. O Beni explica que ali é o espaço de **brincar, explorar e criar**.
3. O guia **não** abre nem menciona o **Ateliê legado**.
4. O guia **não** promete funções provisórias.
5. O alvo inicial do passo é **real e estável** — registrado, não improvisado.
6. A **estrutura** do passo pertence à **Fase 7**.
7. **Conteúdo, destinos e alvos** são revalidados **após o fechamento da Fase 12A**.
8. Se forem necessários **novos áudios**, o bloco correspondente declara
   **`ENTRAMOS NA ETAPA DE PRODUÇÃO DE ÁUDIOS`**.
9. Se forem necessárias **novas imagens**, declara **`ENTRAMOS NA ETAPA DE GERAÇÃO DE IMAGENS`**.
10. As imagens serão produzidas pelo **ChatGPT**.
11. A **voz final do Beni** é fornecida ou aprovada por **Eduardo**.
12. **Claude não gera arte** — apenas audita e integra arquivos autorizados.

#### `BRINCAR_GUIDE` — guia novo, cinco passos (especificação congelada, não implementada)

Guia **novo**, sobre o sistema existente do `BeniGuideOverlay`. **Proibido reutilizar o
`ATELIER_GUIDE`.** **Proibido restaurar a palavra "Ateliê" na experiência infantil.**

| # | Título | Mensagem | Alvo / destaque |
|---|---|---|---|
| 1 | `Brincar com o Beni` | `Aqui você encontra brincadeiras, jogos e um espaço para criar do seu jeito!` | destaque na **aba Brincar** |
| 2 | `Uma ideia para hoje` | `O Beni pode sugerir uma brincadeira diferente para você explorar.` | `brincar.suggestion` |
| 3 | `Jogos do Beni` | `Cada desenho mostra uma brincadeira diferente. Escolha a que você mais gostar!` | `brincar.games` — o destaque **envolve a área da grade**, sem abrir jogo algum |
| 4 | `Crie do seu jeito` | `Aqui você pode desenhar e inventar uma criação só sua.` | `brincar.create` |
| 5 | `Suas criações` | `Aqui você pode rever as artes que ficaram guardadas.` | `brincar.gallery` |

O **quinto passo** exige **variante segura por plano**: sem pressão comercial infantil e **sem
prometer salvamento indisponível no Plano Grátis**.

**Regras do guia (dez, todas obrigatórias na implementação futura).**

1. Nenhuma fala ou título usa **"Ateliê"**.
2. A identidade interna da rota `Ateliê` **pode** ser preservada por compatibilidade, desde que
   **não apareça para a criança**.
3. A `BrincarScreen` deverá **registrar alvos reais** no `guideTargetRegistry` — hoje não registra
   nenhum.
4. Apenas **uma camada bloqueante** poderá aparecer por vez (mesmo princípio de [`STR ONB 01`](#str-onb-01--colisão-entre-guia-inicial-e-conquista-nas-estrelinhas-e005)).
5. O guia **não abrirá** jogos, Criar Livre ou galeria automaticamente.
6. **Avançar, voltar e fechar** deverão funcionar.
7. **Telefone e tablet** terão alvos equivalentes — no tablet, `atelier.sidebarTab` precisa passar a
   existir de fato.
8. O **chip comercial do plano não será alvo** do onboarding infantil.
9. O guia precisará de **testes** para alvos ausentes, rolagem e mudança de layout.
10. O guia será **revalidado depois do fechamento funcional da Fase 12A**.

**Áudios novos necessários (registrados, não criados nem integrados agora).**

`guide.brincar.welcome` · `guide.brincar.suggestion` · `guide.brincar.games` ·
`guide.brincar.create` · `guide.brincar.gallery`

O início da implementação **deverá ser precedido** pelo aviso
**`ENTRAMOS NA ETAPA DE PRODUÇÃO DE ÁUDIOS`**. **Proibido reutilizar silenciosamente os áudios
`guide.atelier.*`** — eles continuam apenas protegidos como asset, sem consumidor. Se a
implementação exigir nova arte, deverá ser precedida por **`ENTRAMOS NA ETAPA DE GERAÇÃO DE
IMAGENS`**; **ChatGPT** gera as imagens, **Eduardo** aprova, **Claude apenas audita e integra** os
arquivos autorizados.

---

## 5. Condições obrigatórias da Fase 2.5

Nenhuma é opcional. Detalhamento e estados individuais no árbitro
([`D-C60-INTEGRACAO-PRODUTO`](DECISIONS.md#d-c60-integracao-produto--integração-do-colorir-com-o-beni-decisões-de-produto)).

1. ⚠️ **REVISADA EM 2026-08-03 (Spec 019) · ✅ CUMPRIDA EM 2026-08-04.**
   ~~**Persistência de pintura no Grátis bloqueada na autoridade de escrita**, fail closed — não
   apenas na interface.~~ A condição original **foi implementada e validada** (commit `1e2f8dd3`,
   build `3b4dea54`) e depois **teve o critério substituído** pela Spec 019: a decisão continua na
   **autoridade única de ESCRITA** e continua **fail closed**, mas passa a ser decidida pela
   **acessibilidade real da história e da atividade — não pelo plano**. A condição vigente é:
   **o Grátis PERSISTE a pintura do Colorir narrativo de história acessível, verificado na camada de
   escrita e em dispositivo físico** — e **não persiste** quando a história não está acessível. O
   **Criar Livre permanece intocado** (`E1-PLANO-FREE`, `E1-ARTES-SALVAR` e `ATELIER_FREE_SAVE_LIMIT = 0`).
   **Cumprida fisicamente** no build `bafb8e3f` (commit `b24c868`) — ver
   [`docs/C60_VALIDACAO_FISICA.md`](C60_VALIDACAO_FISICA.md) **Parte D**.
2. **Atualização de manifest/pack funcional para quem já baixou conteúdo.**
3. **Linearts legados preservados durante a integração**, sem ampliar a dependência deles; a
   remoção do binário público permanece nas Fases 16 e 17.
4. **Divergência de CRLF resolvida por transplante semântico sobre o `scripts/smoke.js` LF** —
   sem merge bruto do arquivo da branch antiga.
5. **Gates físicos obrigatórios:** dois READY concorrentes · reset seguido de retry · saída
   durante a instalação.
6. **Validação visual dupla:** o novo Colorir **e** o consumidor legado do lineart substituído.

---

## 6. Restrições invioláveis (mantidas)

**Nada** de: backend próprio ou login; anúncios; tracking infantil; conteúdo premium embarcado no
binário final; SDK fora da lista aprovada (Sentry + RevenueCat + analytics anônimo); linguagem
técnica (pack, manifesto, sha256, MB) para a criança; paleta de status paralela; oferta comercial
apresentada à criança; decisão tomada em conversa sem registro no
[`docs/DECISIONS.md`](DECISIONS.md).

---

## 7. O que esta v5 deliberadamente NÃO faz

- **Não inventa prazos.** Nenhuma fase tem semana, data ou duração.
- **Não decide pendências do Product Lock.** O que está pendente continua pendente até a Fase 4.
- **Não inventa valores comerciais.** Preços e período de teste seguem como pendência controlada.
- **Não reabre a Fase 2.**
- **Não reescreve documentos históricos.** A v4, a v2.0 e o plano antigo permanecem como estavam,
  apenas sinalizados.

---

### Changelog

- **v5 · atualização de 2026-08-04 (fechamento físico da Spec 019):** encerra a janela transitória
  "NÃO GERAR BUILD"; registra a **aprovação física da Spec 019** no build
  `bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a` (commit `b24c868`, perfil `c60-pilot`, fingerprint
  `c8b6c521500558fde471e47202d41d5e9dda79aa`) com **A1–A5** e **P1–P10** aprovados, smoke
  **4512/4512** e expo-doctor **18/18**; declara **cumprida** a condição obrigatória 1 da Fase 2.5 no
  seu critério revisado; e **vincula formalmente** os cenários Família e premium — não executáveis no
  perfil `c60-pilot` — à **Fase 18**, com **revalidação na Fase 21**. Bloco documental, sem código,
  sem testes, sem dependências, sem assets e sem configuração de build.
- **v5 (2026-07-30):** institui a v5 como fonte única da linha de lançamento; carimba o baseline
  técnico do fechamento da trilha loading/performance (`aeda9c2`, tag
  `lp-foundation-closed-2026-07-30` → `bc79edb`, smoke `3314/3314`); declara a **Fase 2 encerrada**;
  abre a **Fase 2.5** (integração do Colorir com o Beni sobre a fundação, por blocos, sem merge
  bruto); publica o **roadmap integral da Fase 0 à Fase 22**, incluindo 2.5, 8A, 12A e 12B; mapeia
  os riscos residuais R5, R6, R7, R17, R20A, R20B e R21 por fase; supersede a v4. Bloco documental
  **P1** (docs-only, sem código e sem assets).
