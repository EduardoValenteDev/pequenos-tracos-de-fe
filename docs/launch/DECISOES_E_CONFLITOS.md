# Decisões e Conflitos — Linha de Lançamento (Fase 0)

Registro das **decisões finais do Eduardo** e dos **conflitos** entre o
[`PLANO_OFICIAL_BENI_LANCAMENTO.md`](../PLANO_OFICIAL_BENI_LANCAMENTO.md) e o app já entregue.
Este documento é a referência de resolução de conflitos da linha de lançamento.

> Governança: o plano de lançamento é a **fonte oficial da linha de lançamento**, subordinada ao
> roteiro mestre [`docs/PROJECT_SOURCE_OF_TRUTH.md`](../PROJECT_SOURCE_OF_TRUTH.md). Estado atual do código
> auditado em modo somente-leitura (citações `arquivo:linha` aproximadas, conferir no momento da
> implementação).

## Decisões finais (travadas)

| # | Tema | Decisão final |
|---|---|---|
| 1 | **Avatares** | **Exclusivos do Plano Família.** O grátis **não** desbloqueia avatares por estrelinhas. Estrelinhas seguem como progresso/celebração (a criança nunca gasta), sem liberar avatar no grátis. |
| 2 | **Narração** | **Completa = requisito de lançamento.** Todas as histórias do lançamento terão narração. O estado atual (~10/200 cenas narradas) é **lacuna de execução a fechar**, não decisão pendente. **Sem** lançar com narração parcial nem reduzir o conjunto "disponível" por isso. |
| 3 | **Salvar arte (grátis)** | **0 no grátis.** A criança desenha mas **não salva**; aviso carinhoso antes da folha. Salvar/Galeria = Plano Família. |
| 4 | **Precedência** | Plano de lançamento = fonte oficial da **linha de lançamento**, referenciada a partir do roteiro mestre; conflitos resolvidos aqui. |
| 5 | **Bloco 1** | **Fase 0** = congelar o documento + registrar conflitos + Matriz de Acesso. Somente documentação. |

## Conflitos doc × app (estado atual → decisão → impacto)

### C1 — Avatares: estrelinhas (atual) vs Plano Família (doc/decisão)
- **Estado atual:** avatares liberam por **marcos de estrelinhas** (grátis). `isAvatarUnlocked(avatarId, totalStars, currentAvatarId)` em `src/data/avatars.js` libera quando `unlockStars === 0` **ou** `totalStars >= unlockStars`. **Nenhum** check de premium. (Bloco 3, já publicado.)
- **Decisão:** avatares = **Plano Família exclusivo**; o grátis fica só com os avatares base (`unlockStars: 0`). Estrelinhas **não** liberam avatar no grátis.
- **Impacto / migração (para o Bloco A — código):** ao passar a exigir `isPremiumUser()` para os avatares não-base, **não** remover de forma brusca um avatar já em uso por um usuário grátis. Opções a definir no Bloco A (execução, não produto): *grandfather* do avatar atual, ou reverter ao avatar base com aviso suave. Não quebrar chaves `@ptf_*` de perfil.

### C2 — Salvar arte: 3 grátis (atual) vs 0 grátis (doc/decisão)
- **Estado atual:** salvar é grátis com limite **3** (`ATELIER_FREE_SAVE_LIMIT = 3` em `src/services/atelierStorage.js`); premium = ilimitado (`hasAtelierUnlimitedAccess()` → `isPremiumUser()`). Gate em `src/screens/AtelierCanvasScreen.js`.
- **Decisão:** **0 no grátis** — desenhar é livre; salvar/Galeria = Plano Família; aviso antes da folha.
- **Impacto (Bloco A):** ajustar o gate para premium-only (não remover o sistema de salvamento). Não quebrar índice de artes existente.

### C3 — Rodadas grátis/dia: não existe (atual) vs 2/dia (doc)
- **Estado atual:** **nenhum** mecanismo de limite diário. Contadores existentes são cumulativos.
- **Decisão:** **2 rodadas/dia** no grátis, **compartilhadas** entre os jogos de Brincar, reset por dia local, persistido, centralizado no controle de acesso, não burlável, **sem `__DEV__`**.
- **Impacto (Bloco A):** novo serviço + **chave nova** (ex.: `@ptf_brincar_daily_v1`) — não colide com chaves existentes.

### C4 — Navegação: Ateliê (atual) vs Brincar (doc)
- **Estado atual:** abas = Início · Aventuras · **Ateliê** · Estrelinhas · Perfil (`src/navigation/AppNavigator.js` `TAB_DEFS` + `src/components/TabletSidebar.js`). **Rotas são strings hardcoded** (sem constante central).
- **Decisão:** aba **Brincar** substitui Ateliê (label visível); Ateliê vira "Criar com Beni" + "Minhas artes" dentro de Brincar; "Colorir uma história" sai da aba.
- **Impacto (Bloco D):** regra #9 do plano (não alterar rotas sem migração) → introduzir `src/constants/routes.js` **antes**, manter a navegação estável, migrar callsites. Alto impacto (20+ pontos).

### C5 — Narração (lacuna de execução)
- **Estado atual:** ~10/200 cenas com narração integrada (`audioManifest._readyEntries`). Pacote do narrador documentado (`docs/NARRATOR_PACKAGE*`).
- **Decisão:** narração completa é **requisito** (C/ Bloco B, Fase 3). Fechar a lacuna por história/cena; integrar via `audioManifest`.

### C6 — Texto bíblico (risco baixo)
- **Estado atual:** sem `numberOfLines`/`ellipsizeMode` truncando versículos/orações nas telas (Cantinho/Reflexão/Momento). Alguns "…" são intencionais no dado.
- **Decisão:** review focado no Bloco C (Cantinho), garantir nenhuma passagem cortada de forma enganosa; diferenciar resumo editorial de citação bíblica.

## Itens de execução (não são decisões de produto)
- Design exato do que conta como "1 rodada" por jogo (Bloco A).
- Estratégia de migração de avatar em uso (Bloco A).
- Mecânica de integração do áudio de narração (Bloco B).
