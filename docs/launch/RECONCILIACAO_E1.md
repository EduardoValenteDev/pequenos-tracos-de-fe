# RECONCILIAÇÃO E1 — Fonte de verdade e decisões de lançamento

**Data:** 2026-07-15 · **Branch:** `chore/reconcile-source-of-truth-e1` (a partir de `1daf4c1`) · **Fundador:** Eduardo
**Escopo:** documentação apenas. Nenhum código, asset, manifesto, pack, imagem ou áudio alterado.

---

## 1. Contexto

A auditoria mestra **E0** encontrou governança documental contraditória: dois árbitros de decisões
concorrentes, a fonte de verdade apontando para um documento já superado, e uma referência a um
documento mestre inexistente. Este bloco **E1** protege o trabalho recente no remoto e **consolida
uma única linha de produto/lançamento**, sem tocar código.

## 2. Problemas encontrados na E0

1. **Dois `DECISIONS.md`** contraditórios: o da **raiz** (2026-07-02, base "v3.1") e o de **`docs/`**
   (2026-07-05, árbitro). Divergiam em: salvar arte no grátis (**3** vs **0**) e jogos do Brincar
   (**"substituídos"** vs **"não removidos"**).
2. **`docs/PROJECT_SOURCE_OF_TRUTH.md`** apontava o **v2.0** (superado) como "fonte da fase final" e
   listava **"anual + vitalício"** (o v1 não tem vitalício).
3. **`DOCUMENTO_MESTRE_EXECUCAO_PTF_v3.1.md`** citado como "fonte única" pelo `DECISIONS.md` da raiz
   **não existe** no repositório.
4. **Contradição código × decisão:** avatares desbloqueiam por **estrelinhas** (`src/data/avatars.js`),
   enquanto a decisão diz **exclusivos do Plano Família**.
5. Redação de **Brincar** desatualizada em v4 (nomes brutos + "Bichinhos não removidos" + "Criar com
   Beni A CONFIRMAR"), embora o app já tenha os **4 jogos finais** entregues.
6. Rodadas: decisão **"por criança"**, código **por dispositivo**.

## 3. Estado ANTES

- Precedência ambígua; dois árbitros; SOT→v2.0 + vitalício; master v3.1 fantasma; textos de Brincar/salvar/plano superados espalhados.

## 4. Estado DEPOIS

- **Um único árbitro:** `docs/DECISIONS.md`. O `/DECISIONS.md` da raiz virou **aviso SUPERSEDED**.
- **SOT** reaponta ao **v4** e nomeia `docs/DECISIONS.md` como árbitro; **vitalício removido** do modelo.
- Referência ao **master v3.1 inexistente removida** (raiz + SOT).
- **v4** atualizado cirurgicamente (Brincar 4 jogos, Criar Livre, sem Bichinhos, rodadas por criança, avatares premium).
- **Decisões consolidadas, superadas e pendentes** registradas em `docs/DECISIONS.md` (seção E1).

## 5. Precedência oficial

- **Governança técnica:** `docs/PROJECT_SOURCE_OF_TRUTH.md` → `.specify/memory/constitution.md` → `AGENTS.md` → `CLAUDE.md` → spec → plan → tasks → sessão.
- **Produto/lançamento:** `docs/DECISIONS.md` (**árbitro**) → `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md` (vigente) → Direção de Arte v1.1 + docs narrativos/bíblicos vigentes → **históricos** (não normativos).

## 6. Arquivos oficiais vs superados

| Oficial / vigente | Superado / histórico |
|---|---|
| `docs/DECISIONS.md` (árbitro) | `DECISIONS.md` (raiz) — SUPERSEDED |
| `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md` | `DOCUMENTO_OFICIAL_PROJETO_FINAL.md` (v2.0); `PLANO_OFICIAL_BENI_LANCAMENTO.md` |
| `docs/PROJECT_SOURCE_OF_TRUTH.md` (reaponta v4) | referência a `DOCUMENTO_MESTRE_EXECUCAO_PTF_v3.1.md` (inexistente, removida) |
| Direção de Arte v1.1 | documento visual antigo (Disney/Pixar) |

## 7. Decisões consolidadas

Registradas por área em `docs/DECISIONS.md` (seção "E1 — Decisões consolidadas"): Produto, Navegação
(5 abas; "Ateliê" não visível), Brincar (4 jogos + Criar Livre + Minhas artes; sem Bichinhos),
Histórias (2 grátis locais / 18 premium remotas), Planos (Free/Família), Rodadas (2/dia por criança),
Artes (grátis = 0 salvamentos), Avatares (adicionais = Família), Monetização (mensal+anual; sem
trimestral/vitalício; RevenueCat; paywall atrás do gate parental), Conteúdo remoto (manifesto+sha256+cache),
Dados/privacidade (sem backend/Supabase; local-first), Beni/onboarding (linguagem sem "Ateliê"),
Modo Criador (invisível em produção), Conteúdo visual (M3 após imagens finais), Ordem de lançamento.

## 8. Contradições resolvidas

- Salvar arte grátis: **0** (não 3).
- Brincar: **4 jogos finais** (não a lista bruta; **Bichinhos fora**).
- Árbitro: **um só** (`docs/DECISIONS.md`).
- Fonte da fase final: **v4** (não v2.0).
- **Vitalício/trimestral**: **não existem no v1**.

## 9. Diferenças restantes entre CÓDIGO e DECISÃO (viram bloco futuro)

1. **Avatares** — código desbloqueia por estrelinhas; decisão = adicionais do Plano Família. → bloco Acesso/RevenueCat.
2. **Rodadas** — código conta por dispositivo; decisão = por criança. → bloco Acesso/RevenueCat.
3. **UI residual "X de N artes"** em ~~`AtelierScreen.js`~~/`AtelierGalleryScreen.js` (fluxo contextual). → limpeza futura. *(Nota posterior — P3J-R.1 FIX1: `AtelierScreen.js` foi removido do projeto; a pendência resta só na galeria.)*
4. **Card/atalho "Criar com Beni" na Home** — redirecionar/remover. → bloco futuro de Home/onboarding.
5. **Premium ainda no binário** (require() + sem `assetBundlePatterns`). → bloco 2C.

**Nenhuma dessas foi alterada neste bloco** (E1 é documentação).

## 10. Referência ao documento inexistente

`DOCUMENTO_MESTRE_EXECUCAO_PTF_v3.1.md` era citado pelo `DECISIONS.md` da raiz (e indiretamente no SOT
como "Documento Mestre de execução v3.1"). **Não existe** no repositório. **Substituição:** a fonte
oficial vigente é o `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`, governado pelo `docs/DECISIONS.md`.
As referências foram **removidas/corrigidas** no `DECISIONS.md` da raiz e no `PROJECT_SOURCE_OF_TRUTH.md`;
**nenhum documento fictício foi criado** e **nenhum documento antigo foi copiado com nome novo**.

**Residual fora do escopo (registrado, não alterado):** o anexo vigente
`docs/DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md` ainda contém uma menção textual interna a
"Documento Mestre v3.1". Esse arquivo **não está na allowlist deste bloco** (E1 toca apenas os 6
documentos de governança). A **autoridade** já está corrigida na fonte: o `PROJECT_SOURCE_OF_TRUTH.md`
passou a subordinar o anexo visual ao **v4** e ao **`docs/DECISIONS.md`**, de modo que **nenhuma fonte
oficial depende do arquivo inexistente** para sua precedência. A limpeza dessa menção textual interna
fica para um retoque documental futuro do anexo visual.

## 11. Pendências controladas

Preços (mensal/anual/desconto/período de teste), nome final de loja (se não congelado), momento da
migração rodadas dispositivo→criança, grandfather de avatar premium, redirecionamento do "Criar com
Beni", confirmação da reancoragem M3, e data de início do beta. Detalhe (bloco que resolve · o que
bloqueia · o que segue) na tabela "Decisões PENDENTES controladas (E1)" de `docs/DECISIONS.md`.

## 12. Roadmap oficial

Ver "Ordem oficial dos próximos blocos (E1)" em `docs/DECISIONS.md` (22 blocos, de E1 → submissão).

## 13. Próximo bloco

**Onboarding O1** — especificação da primeira experiência (a primeira sessão foi considerada
visual/emocionalmente fraca; guias do Beni ainda citam o Ateliê). Bloco de auditoria/experiência/spec,
sem gerar áudio.

## 14. Critérios de manutenção da governança

1. Toda sessão de IA começa lendo `docs/DECISIONS.md` e declara sob qual data opera.
2. Mudança de decisão: fundador aprova → `docs/DECISIONS.md` primeiro → documentos → código.
3. Um só árbitro; nenhum documento oficial pode depender de arquivo inexistente.
4. Decisão que só existe em conversa **não** é oficial.
5. Documentos superados nunca são apagados — são marcados e apontam ao vigente.
