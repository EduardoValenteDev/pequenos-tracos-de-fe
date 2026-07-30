# Fonte de Verdade v1 — Pequenos Traços de Fé

*Documento oficial de alinhamento estratégico e operacional do projeto.*

---

## 1. Status deste documento

Este documento é a **fonte de verdade operacional** do projeto Pequenos Traços de Fé.

Quando houver conflito entre documentos antigos e este arquivo, **este arquivo prevalece**.

Documentos antigos permanecem como histórico, mas **não devem orientar decisões futuras sem validação contra este arquivo**. Veja o mapa de documentos em [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

**Linha de lançamento (execução, otimização, beta e lançamento):** a [`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) (**v5, vigente desde 2026-07-30**) é a **fonte única de verdade da linha de lançamento**, subordinada a este arquivo e às decisões. É lá que vivem o **roadmap integral (Fase 0 à Fase 22)**, o **baseline técnico carimbado** e a **fase atual**. O árbitro único das **decisões de produto/lançamento** é [`docs/DECISIONS.md`](DECISIONS.md). Em conflito entre um documento e o `docs/DECISIONS.md`, **vence o `docs/DECISIONS.md`**. Decisão de escopo travada: **a aba Brincar completa entra no lançamento**, com **arquitetura híbrida obrigatória** (2 histórias grátis locais no binário, 18 premium por packs remotos no Cloudflare R2).

> **Fonte de verdade v5 (2026-07-30):** a [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md) foi **superada pela v5** — passa a ser histórica, com banner no topo e conteúdo preservado. Antes disso, a **Reconciliação E1 (2026-07-15)** já havia superado o `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (v2.0); detalhes em [`docs/launch/RECONCILIACAO_E1.md`](launch/RECONCILIACAO_E1.md).

O [`PLANO_OFICIAL_BENI_LANCAMENTO.md`](PLANO_OFICIAL_BENI_LANCAMENTO.md), o `DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (v2.0) e a `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md` foram **substituídos** e permanecem **apenas como histórico**. Os conflitos registrados na Fase 0 estão em [`docs/launch/DECISOES_E_CONFLITOS.md`](launch/DECISOES_E_CONFLITOS.md); a matriz de acesso em [`docs/launch/MATRIZ_DE_ACESSO.md`](launch/MATRIZ_DE_ACESSO.md).

**Precedência documental consolidada:**
- **Governança técnica:** `docs/PROJECT_SOURCE_OF_TRUTH.md` → `.specify/memory/constitution.md` → `AGENTS.md` → `CLAUDE.md` → spec → plan → tasks → sessão.
- **Decisões de produto/lançamento:** `docs/DECISIONS.md` (**árbitro único**) → `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` (**vigente**) → Direção de Arte v1.1 + docs narrativos/bíblicos vigentes → documentos antigos (**histórico, não normativo**: v4, v2.0, plano antigo).

**Anexo de direção visual:** a [`docs/DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md`](DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md) é o **anexo oficial de direção de arte** (governa visual, tokens, responsividade, componentes e critérios de aceite visuais), subordinado à v5 e ao `docs/DECISIONS.md`. As decisões visuais congeladas (D1–D4) estão registradas em `docs/DECISIONS.md` (D-DESIGN-LIVRO-VIVO).

---

## 1.1 Fase atual

**Fase 2.5 — integração do Colorir com o Beni sobre a fundação.**

| Item | Valor |
|---|---|
| Fase anterior | **Fase 2 — loading, packs, recovery e performance: ENCERRADA** |
| Baseline técnico | `fix/loading-performance-foundation` @ **`aeda9c2`** · tag **`lp-foundation-closed-2026-07-30`** → `bc79edb` · smoke **3314/3314** |
| Branch de trabalho | **`integrate/colorir-with-loading`** |
| Branch de origem do piloto | `feat/colorir-60-pilot-creation` @ **`795760a`** |
| Merge base | **`6cf799c`** |
| Método | **A integração é reconstruída por blocos. Não haverá merge bruto da branch antiga.** |

Objetivo, entregas, critério de saída, riscos e as fases seguintes (até a **Fase 22**) estão na [`v5`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3. As decisões de produto da Fase 2.5 estão em [`docs/DECISIONS.md`](DECISIONS.md), registro `D-C60-INTEGRACAO-PRODUTO`.

---

## 2. Produto

- **Nome do projeto/app:** Pequenos Traços de Fé.
- **Mascote oficial:** **Beni**.
- **"Lumi"** é nome **histórico/antigo** — não é o nome ativo do mascote. (Ainda aparece em algumas rotas/strings legadas no código, mas não deve ser usado como nome do mascote.)
- **Público inicial:** famílias cristãs no Brasil, com crianças pequenas.
- **Posicionamento:** app cristão infantil com histórias bíblicas, mapa de aventuras, narração, colorir, Livrinho da Fé, Estrelinhas, Baú do Beni, Cultinho em Casa, Perfil, Área dos Pais e Modo Igreja.
- **Maturidade:** não é protótipo. O app já tem **core loop funcional** (mapa → história → narração/quiz → colorir → Livrinho → conquistas).

---

## 3. Stack e base técnica

Apenas fatos verificados no código (`app.json`, `package.json`, `eas.json`):

- **React Native / Expo SDK 54** (`expo: ~54.0.35`).
- **Áudio com `expo-audio`** (`~1.1.1`). **`expo-av` NÃO está presente.**
- **EAS Build configurado** com perfis `development`, `preview` e `production` (`eas.json`). `appVersionSource: local`. **Sem `submit` configurado.**
- **Sem `expo-updates` / OTA** (dependência ausente; nenhuma referência em código).
- **Sem SDK de tracking/analytics** (nenhuma dependência de analytics/firebase/sentry/segment/etc. em `package.json`).
- **Privacidade atual: local-first** — dados em `AsyncStorage`, **sem backend próprio**, sem coleta de dados pessoais sensíveis. `app.json` declara `NSPrivacyTracking: false` e `NSPrivacyCollectedDataTypes: []`.

> Se algum roadmap/doc antigo divergir destas versões, vale o que está no `package.json`/`app.json`/`eas.json`.

---

## 4. Decisões estratégicas travadas

Decisões **fechadas** (não reabrir sem nova decisão estratégica explícita):

**Mascote**
- Beni é o mascote oficial.

**Categoria de loja**
- Soft launch recomendado em classificação **4+**, **fora da Kids Category**.
- Fora da Kids Category: **evitar metadados de loja em inglês** que afirmem "For Kids", "For Children" ou equivalente.
- Em português: manter linguagem **familiar/educacional segura**, sem prometer categoria infantil específica de forma indevida.

**Backend**
- **Não** construir backend próprio agora. Manter app **local-first**.
- Ao monetizar, usar **RevenueCat** como backend gerenciado de compras/entitlements.
- Servidor próprio só após tração real (ex.: sync entre aparelhos ou licenciamento institucional avançado).

**Modelo de receita** *(atualizado na Reconciliação E1 — ver `docs/DECISIONS.md` D-MONETIZACAO-V1)*
- Ofertas do v1: **mensal + anual**. **Sem plano trimestral e sem plano vitalício no v1.**
- **RevenueCat** como fonte de entitlement; paywall só atrás da Área dos Pais + gate parental.
- **Valores numéricos = pendência controlada** (não inventar; ver decisões pendentes em `docs/DECISIONS.md`).
- Conteúdo digital no app deve respeitar **compra in-app das lojas**.

**Assets e peso**
- Regra daqui para frente: **shell + histórias gratuitas no binário base**.
- Conteúdo premium/adicional deve caminhar para **sob demanda**.
- **Não adicionar mais assets pesados ao binário público.** *(A regra permanece; o tratamento definitivo do peso e do `require()` estático é das **Fases 16 e 17** da [v5](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) — riscos R5/R6/R7. A menção original a "antes da Fase 2" usava a numeração superada.)*
- Avaliar **WebP lossy** para cenas coloridas.
- Avaliar **WebP lossless / PNG otimizado** para páginas de colorir, **com teste de flood-fill**.
- As pastas **untracked** de histórias **não** devem entrar com `git add .` sem auditoria.

**Conteúdo de lançamento**
- As histórias **grátis precisam ser impecáveis**.
- **A Criação** e **Noé** são a vitrine inicial.
- **Noé precisa de narração completa** antes do soft launch (hoje só "creation" tem narração no manifesto — ver Fase 4).

**Modo Igreja**
- É **diferencial estratégico real**, não ideia distante.
- Deve ser polido e ativado **depois** dos bloqueadores de core loop, peso e conteúdo grátis.

---

## 5. O que NÃO reabrir como pendência

Não tratar como **P1 ativo** (confirmados resolvidos na auditoria de código atual):

- **Clipping do canvas do Ateliê** — corrigido (painel de altura fixa reservada + canvas `flex:1`).
- **Livro Mágico Misto** — removido (Livrinho tem só 2 modos: `official` / `child`).
- **Quiz sempre na posição A** — não ocorre na UI (os dados têm `correct:0`, mas o `quizModel` embaralha com Fisher–Yates e a `QuizScreen` valida por **id**, não por posição).

> Esses pontos só devem ser reabertos se houver **bug novo reproduzível em device**.

---

## 6. Bloqueadores atuais reais

**P1 — Bug do tour no mapa (core loop)**
- O mapa parece travado durante o tour porque o overlay captura toques enquanto o usuário espera arrastar/tocar.
- **Decisão esperada — escolher contrato explícito** *(destino na [v5](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md): **Fase 11**, horizonte final do Mapa de Aventuras)*:
  - **Opção A:** tour modal, interação claramente bloqueada e guiada por botões.
  - **Opção B:** tour interativo, toque passa para alvos reais.
  - **Recomendação inicial: Opção A para v1** (mais simples, segura, elimina a sensação de travamento).

**P1 — Peso/arquitetura de assets (estrutural)**
- O peso de imagens referenciadas (~502 MB de PNG referenciado; ~732 MB de PNG no total do working dir) exige arquitetura de **bundle + conteúdo sob demanda**. Não é otimização cosmética.

**P1 — Histórias grátis impecáveis (conteúdo)**
- **Noé** precisa estar no mesmo nível de **A Criação** (incl. narração completa) para o gratuito gerar confiança.

---

## 7. Ordem oficial de execução

**A ordem oficial vive na [`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3** — roadmap integral da **Fase 0** à **Fase 22**, com objetivo, entregas centrais, critério de saída e riscos atribuídos por fase. **A fase atual é a 2.5** (ver §1.1 acima).

> **Sequência antiga (Fases 0–8) — histórico, não ativa.** A lista de oito fases que este arquivo publicava (Fonte de Verdade → tour do mapa → peso/bundle → robustez de mídia → conteúdo → RevenueCat → loja → soft launch → escala) **não é mais a sequência de execução**. Ela foi absorvida e reordenada pelo roadmap da v5. Quando um texto antigo deste repositório citar "Fase 1", "Fase 2" etc. **sem** referenciar a v5, trate como numeração superada e reancore na v5.

---

## 8. Regras permanentes de execução

- **Um bloco por vez. Um commit por bloco.**
- **Sem push sem aprovação.**
- Antes de editar, **inspecionar os arquivos relevantes**.
- **Não mexer fora do escopo.** Sempre relatar os arquivos alterados.
- Rodar `npm run smoke` e `npx expo-doctor` quando aplicável.
- Quando for visual, **smoke não basta**: validar por print/vídeo. Para **mapa, tour, Livrinho, Ateliê e imagens**, exigir validação visual.
- **Não usar `git add .`** enquanto houver assets pesados/untracked não auditados.
- **Não instalar pacote novo** sem justificar e pedir aprovação.
- **Não adicionar backend próprio** sem nova decisão estratégica.
- **Não adicionar novas abas principais** antes do lançamento.
- **Não adicionar conteúdo pesado ao binário público** (ver §4).

---

## 9. Critério de saída da Fase 0 *(histórico — já atendido)*

> Registro do critério original de conclusão da Fase 0 de governança. **Já foi atendido.** Os
> critérios de saída de todas as fases ativas estão na
> [`v5`](DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) §3.

A Fase 0 só está concluída quando:

- `docs/PROJECT_SOURCE_OF_TRUTH.md` existe;
- as decisões centrais estão claras;
- documentos antigos conflitantes foram marcados como históricos ou referenciados em índice (`docs/DOCUMENTATION_INDEX.md`);
- o projeto tem uma ordem oficial de próximas fases;
- `smoke` e `expo-doctor` passam (se rodados);
- commit local foi criado;
- sem push.
