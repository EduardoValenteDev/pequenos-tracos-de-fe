# Fonte de Verdade v1 — Pequenos Traços de Fé

*Documento oficial de alinhamento estratégico e operacional do projeto.*

---

## 1. Status deste documento

Este documento é a **fonte de verdade operacional** do projeto Pequenos Traços de Fé.

Quando houver conflito entre documentos antigos e este arquivo, **este arquivo prevalece**.

Documentos antigos permanecem como histórico, mas **não devem orientar decisões futuras sem validação contra este arquivo**. Veja o mapa de documentos em [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

**Fase final (execução, otimização, beta e lançamento):** o [`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL.md) (v2.0, 01/07/2026) é a **fonte única de verdade da fase final** do projeto. Em conflito entre ele e qualquer plano, prompt ou conversa anterior, **o documento oficial final prevalece**. Decisão de escopo travada: **a aba Brincar completa entra no lançamento**, com **arquitetura híbrida obrigatória** (2 histórias grátis locais no binário, 18 premium por packs remotos no Cloudflare R2).

O [`PLANO_OFICIAL_BENI_LANCAMENTO.md`](PLANO_OFICIAL_BENI_LANCAMENTO.md) foi **substituído** pelo documento oficial final e permanece **apenas como histórico** (a versão anterior sugeria MVP sem a aba Brincar). Os conflitos com o app já entregue continuam registrados em [`docs/launch/DECISOES_E_CONFLITOS.md`](launch/DECISOES_E_CONFLITOS.md); a matriz de acesso em [`docs/launch/MATRIZ_DE_ACESSO.md`](launch/MATRIZ_DE_ACESSO.md).

**Anexo de direção visual:** a [`docs/DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md`](DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md) é o **anexo oficial de direção de arte** (governa visual, tokens, responsividade, componentes e critérios de aceite visuais), subordinado ao Documento Mestre de execução v3.1. As decisões visuais congeladas (D1–D4) estão espelhadas em `DECISIONS.md` (Seção 3).

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

**Modelo de receita**
- Ofertas principais: **anual + vitalício**.
- **Mensal** pode existir como entrada.
- **Packs avulsos** como aquisição, não como eixo principal.
- Conteúdo digital no app deve respeitar **compra in-app das lojas**.

**Assets e peso**
- Regra daqui para frente: **shell + histórias gratuitas no binário base**.
- Conteúdo premium/adicional deve caminhar para **sob demanda**.
- **Não adicionar mais assets pesados ao binário antes da Fase 2.**
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
- **Decisão esperada na Fase 1 — escolher contrato explícito:**
  - **Opção A:** tour modal, interação claramente bloqueada e guiada por botões.
  - **Opção B:** tour interativo, toque passa para alvos reais.
  - **Recomendação inicial: Opção A para v1** (mais simples, segura, elimina a sensação de travamento).

**P1 — Peso/arquitetura de assets (estrutural)**
- O peso de imagens referenciadas (~502 MB de PNG referenciado; ~732 MB de PNG no total do working dir) exige arquitetura de **bundle + conteúdo sob demanda**. Não é otimização cosmética.

**P1 — Histórias grátis impecáveis (conteúdo)**
- **Noé** precisa estar no mesmo nível de **A Criação** (incl. narração completa) para o gratuito gerar confiança.

---

## 7. Ordem oficial de execução

Sequência **ativa**:

- **Fase 0** — Fonte de Verdade v1. *(este documento)*
- **Fase 1** — Corrigir contrato do tour do mapa e validar core loop.
- **Fase 2** — Peso, bundle e arquitetura de assets.
- **Fase 3** — Robustez de mídia e fonte única de acesso.
- **Fase 4** — Conteúdo de lançamento impecável, com Criação e Noé completas.
- **Fase 5** — Monetização com RevenueCat.
- **Fase 6** — Preparação de loja e release.
- **Fase 7** — Soft launch Brasil-first com Modo Igreja como cunha.
- **Fase 8** — Escala e internacionalização em camadas.

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
- **Não adicionar novas abas principais** antes do soft launch.
- **Não adicionar conteúdo pesado** antes da Fase 2.

---

## 9. Critério de saída da Fase 0

A Fase 0 só está concluída quando:

- `docs/PROJECT_SOURCE_OF_TRUTH.md` existe;
- as decisões centrais estão claras;
- documentos antigos conflitantes foram marcados como históricos ou referenciados em índice (`docs/DOCUMENTATION_INDEX.md`);
- o projeto tem uma ordem oficial de próximas fases;
- `smoke` e `expo-doctor` passam (se rodados);
- commit local foi criado;
- sem push.
