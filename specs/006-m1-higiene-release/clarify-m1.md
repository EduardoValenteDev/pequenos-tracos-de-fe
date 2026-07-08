# Clarify — M1 · Higiene de release e ferramentas internas

> **Etapa SDD 2.** Ambiguidades a resolver **no Portão 1** antes do Plan. Cada uma **muda a implementação** — precisam da decisão do Eduardo.

| # | Questão (Portão 1) | Opções / contexto | Recomendação |
|---|---|---|---|
| Q1 | **Preview/QA deve simular premium (Modo Criador)?** | Hoje `preview` liga packs QA (quádruplo gate) mas **não** `EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE` → Modo Criador **off** em preview. Ligar exigiria setar a flag no perfil `preview`. | **Manter off** no preview; Modo Criador só em **development**. Se você precisar validar premium num build interno (não-dev), aí setamos a flag num perfil interno dedicado. |
| Q2 | **Escopo exato da seção "Administração (dev)"** | Quais ferramentas entram: Modo Criador, packs, reset guias, rever onboarding, testar desenhos, build info, Modo Igreja? | Entram: Modo Criador, packs, reset guias, rever onboarding, testar desenhos, build info. (Modo Igreja = Q6.) |
| Q3 | **"Reset/apagar progresso" é público ou dev?** | Hoje é feature **pública** do responsável ("Gerenciar dados → APAGAR"). | **Manter pública** (é gestão de dados do usuário); **não** mover para a seção dev. A seção dev pode ter um reset **adicional** de estados de teste (guias/onboarding/packs). |
| Q4 | **Processo/perfil de screenshot oficial** | Screenshots devem sair de build **sem flags**. Usar o perfil `production`, ou criar um perfil `eas.json` dedicado a screenshots (sem flags, mas instalável)? | Criar/definir um caminho **production-like sem flags** para screenshots; documentar. Decidir se vira perfil próprio no `eas.json`. |
| Q5 | **Unificar gates numa fonte única** (`isInternalToolsEnabled()`)? | Hoje há `SHOW_TEST_TOOLS`, `isCreatorQaModeAllowed`, `isPackSandboxDevEnabled` — coerentes, porém espalhados. | **Sim**, criar um helper único que a seção admin consome (mantendo os gates internos de cada ferramenta como defesa em profundidade). Reduz risco de afrouxar um gate isolado. |
| Q6 | **Destino do "Modo Igreja"** | `SHOW_CHURCH_MODE` (flag de build) — é feature de negócio **adiada** (DECISIONS.md), não exatamente dev-tool. | **Manter como está** (flag própria, escondida em produção); **não** misturar na seção dev — ou tratar em bloco próprio. Decisão sua. |
| Q7 | **`ColoringQaScreen` (testar desenhos)** | Existe a tela; confirmar ponto de entrada e gate ao consolidar. | Entrar na seção admin sob o gate único; sem rota pública. |
| Q8 | **Nível de mudança de código** | M1 = só reposicionar UI + smoke + governança, **sem** mexer na lógica de acesso/entitlement? | **Sim** — M1 não altera `accessControl`/entitlement; só UI (consolidação), smoke e docs. |

**Nenhuma spec avança com pendência do Portão 1 em aberto.** As respostas do Eduardo alimentam o Plan (Portão 2).
