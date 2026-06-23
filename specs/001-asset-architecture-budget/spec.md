# Feature Specification: Fundação de Arquitetura e Orçamento de Assets

**Feature Branch**: `001-asset-architecture-budget`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Crie a especificação da feature 'Fundação de Arquitetura e Orçamento de Assets' — estabelecer uma fundação mensurável e segura para integrar novos assets sem aumentar descontroladamente o aplicativo, comprometer o funcionamento offline, degradar a qualidade visual ou prejudicar o flood-fill. Existem 10 diretórios de histórias untracked (~164 MiB, 100 PNG) que NÃO devem ser adicionados, renomeados, convertidos ou modificados nesta feature."

> **Nota de escopo (Etapa SDD 1 — Specify):** Este documento define **O QUÊ** e **POR QUÊ** (resultados, critérios, perguntas). Ele **não** escolhe formato (WebP/PNG), estratégia de armazenamento (Git comum/Git LFS/CDN), entrega (bundle/EAS Update/download sob demanda) nem otimização — essas decisões pertencem ao Plano (Etapa SDD 4), após pesquisa comparativa. Conforme a Constituição v1.1.0, o `PROJECT_SOURCE_OF_TRUTH.md` prevalece.

## Clarifications

### Session 2026-06-22

- Q: Qual o teto de orçamento de tamanho que ancora a feature (download/instalação inicial, alvo Android de baixo custo)? → A: **Enxuto — teto de ~150 MB** para download/instalação inicial. Memória, armazenamento local e atualização derivam desse teto no Plano. Conteúdo premium/adicional caminha para **sob demanda** cedo (alinha com "shell + grátis no binário" do Roteiro).
- Q: Sobre qual catálogo a projeção de crescimento deve ser calculada? → A: **As 20 histórias atuais (PT-BR) + uma reserva para novos packs** previstos no Roteiro (margem de aquisição), **sem** multiplicar por idiomas nesta feature.
- Q: Qual a fronteira de "conteúdo ativo" com garantia offline? → A: **Grátis no binário base (sempre offline) + premium funciona offline após o primeiro download**; conteúdo "em breve" fica **fora do bundle** até ser ativado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decidir integração de assets com base em orçamento mensurável (Priority: P1)

Como **responsável técnico do produto**, quero um **inventário reproduzível** e um **orçamento de tamanho** (download, instalação, atualização, memória e armazenamento local) fundamentado em medições reais, para **decidir com segurança** se um novo lote de assets pode entrar sem estourar limites que prejudiquem famílias com aparelhos modestos.

**Why this priority**: É o bloqueador estrutural da Fase 2 do Roteiro Mestre (peso/arquitetura de assets). Sem orçamento mensurável, qualquer integração de conteúdo é um risco de inflar o app e quebrar a confiança do público (crianças de 3 a 8 anos, Brasil-first, aparelhos de baixo custo).

**Independent Test**: Pode ser testado isoladamente gerando o inventário + as medições + o orçamento e verificando que um lote hipotético é classificado como "dentro" ou "fora" do orçamento de forma determinística, sem tocar em código ou assets.

**Acceptance Scenarios**:

1. **Given** o repositório no estado atual, **When** o inventário é executado, **Then** ele lista todos os assets tracked e untracked categorizados (capas, cenas ilustradas, páginas de colorir, mapas, UI, áudio) com contagem e tamanho, de forma reproduzível (mesmo resultado em duas execuções).
2. **Given** as medições de tamanho atuais, **When** um lote candidato de assets é avaliado, **Then** o resultado indica se cada limite de orçamento (download/instalação/atualização/memória/armazenamento) é respeitado ou violado, com o número medido e o limite definido.
3. **Given** a projeção de crescimento para todas as histórias previstas, **When** o catálogo completo é considerado, **Then** a projeção informa o tamanho estimado total e sinaliza se o orçamento seria excedido antes de qualquer integração.

---

### User Story 2 - Garantir qualidade visual e flood-fill antes de aceitar um asset (Priority: P2)

Como **revisor de conteúdo**, quero **critérios canônicos** de nome, diretório, dimensão, proporção, formato e qualidade por categoria, e **garantias** de que páginas de colorir preservem linhas/áreas fechadas e que imagens fora de 4:5 não sejam esticadas/cortadas automaticamente, para **rejeitar assets defeituosos** antes que cheguem à criança.

**Why this priority**: A auditoria atual já encontrou desvios (proporções 0.512–0.800 em `ruth_naomi`/`samuel_hears_god`/`miraculous_catch`; subpastas `scene/` vs `scenes/`; nomes `scene_NN` vs `<story>_scene_NN`). Conteúdo grátis precisa ser impecável (Roteiro §4).

**Independent Test**: Pode ser testado aplicando os critérios canônicos a um conjunto de assets e confirmando que itens fora do padrão (proporção ≠ 4:5, nome/dir divergente, formato/qualidade inadequados ao flood-fill) são sinalizados para aprovação visual, sem alterar os arquivos.

**Acceptance Scenarios**:

1. **Given** o padrão canônico por categoria, **When** um asset não conforme é avaliado, **Then** ele é marcado como "requer aprovação visual" em vez de ser aceito ou transformado automaticamente.
2. **Given** uma página de colorir candidata, **When** ela é avaliada, **Then** o critério verifica preservação de linhas e áreas fechadas e o comportamento esperado do flood-fill, e reprova artefatos que possam causar vazamento.
3. **Given** uma imagem com proporção diferente de 4:5, **When** ela é avaliada, **Then** o sistema exige aprovação visual explícita e não aplica esticamento/corte automático.

---

### User Story 3 - Rastreabilidade e controle de conteúdo "em breve" (Priority: P3)

Como **mantenedor do repositório**, quero **rastreabilidade** entre asset ↔ história ↔ manifest ↔ require estático ↔ estado de disponibilidade, e **critérios** que impeçam conteúdo "em breve" de aumentar o bundle sem necessidade, para **manter o app enxuto e o funcionamento offline** do conteúdo ativo.

**Why this priority**: A auditoria provou que o app hoje só referencia assets versionados; os 100 PNG untracked são "em breve" não referenciados. Essa fronteira precisa virar regra explícita para não regredir.

**Independent Test**: Pode ser testado verificando, para cada asset, seu estado (tracked/untracked/missing/dynamic) e se está referenciado por require estático/manifest; e confirmando que itens "em breve" não estão no bundle ativo.

**Acceptance Scenarios**:

1. **Given** o mapa de rastreabilidade, **When** um asset é consultado, **Then** seu estado de disponibilidade e suas referências (manifest/require) são identificáveis sem ambiguidade.
2. **Given** um asset classificado como "em breve", **When** o bundle ativo é montado conceitualmente, **Then** o critério garante que ele não infla o conteúdo ativo/offline sem necessidade.
3. **Given** o conteúdo classificado como "ativo", **When** o dispositivo está offline, **Then** o critério garante que esse conteúdo funciona sem rede.

### Edge Cases

- **Asset referenciado mas ausente (MISSING)**: como o inventário sinaliza um `require` cujo arquivo não existe no estado versionado? (deve falhar a rastreabilidade, não passar silenciosamente).
- **Asset referenciado porém untracked**: como o inventário sinaliza dependência de arquivo só local (quebraria clone limpo)? (estado atual: zero, mas a regra precisa existir).
- **Proporção fora de 4:5**: o que acontece quando uma cena/colorir tem proporção diferente do contrato (ex.: 0.512)? (requer aprovação visual; nunca transformação automática).
- **Página de colorir com anti-aliasing/artefatos**: como o critério trata linhas suavizadas (pixels cinza) que podem causar vazamento de flood-fill? (deve haver limiar/qualidade mínima aceita).
- **Subpasta/nome divergente** (`scene/` vs `scenes/`, `scene_NN` vs `<story>_scene_NN`): como o padrão canônico classifica e sinaliza? (sem renomear nesta feature; apenas registrar desvio).
- **Crescimento além do orçamento**: o que acontece quando a projeção do catálogo completo excede o orçamento antes de qualquer integração? (deve bloquear/alertar e exigir decisão de estratégia no Plano).
- **Medição indisponível** (ex.: build iOS sem ambiente): como o resultado distingue "medido" de "não mensurável tecnicamente nesta máquina"? (registrar como N/A justificado, não inventar número).
- **Repositório já pesado** (`.git` ~952 MiB): como o orçamento considera o histórico versus o app entregue ao usuário? (separar peso de repo de peso de app/instalação).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A feature MUST produzir um **inventário reproduzível** de todos os assets, separando **tracked** e **untracked**, categorizados em: capas, cenas ilustradas, páginas de colorir, mapas, UI e áudio (com contagem e tamanho por categoria).
- **FR-002**: A feature MUST **medir o tamanho atual** do repositório, do export Metro, dos bundles e dos builds Android/iOS **quando tecnicamente possível**, registrando explicitamente o que **não** for mensurável neste ambiente (sem inventar valores).
- **FR-003**: A feature MUST **projetar o crescimento** de tamanho a partir das medições atuais para o **catálogo das 20 histórias atuais (PT-BR) mais uma reserva de pelo menos +25%** para novos packs (≈ **5 packs adicionais**). Essa folga MUST ser considerada no **orçamento e na arquitetura**, mas **NÃO** precisa entrar no **bundle inicial** (fica para packs baixáveis). A projeção por idiomas (i18n) fica fora desta feature, citada como cenário futuro.
- **FR-004**: A feature MUST **definir orçamentos máximos** para download, instalação, atualização, memória e armazenamento local, **fundamentados nas medições**, ancorados em um **teto de ~150 MB para download/instalação inicial** (postura "enxuta", alvo Android de baixo custo); os limites das demais dimensões derivam desse teto.
- **FR-005**: A feature MUST **definir um padrão canônico** por categoria: nomes, diretórios, dimensões, proporção, formato e qualidade.
- **FR-006**: A feature MUST **garantir funcionamento offline** para o conteúdo classificado como **ativo**, onde "ativo" = **histórias grátis no binário base (sempre offline) + conteúdo premium após o primeiro download**; conteúdo "em breve" permanece **fora do bundle** até ser ativado.
- **FR-007**: A feature MUST **garantir** que páginas de colorir preservem **linhas, áreas fechadas e comportamento do flood-fill** (critério de qualidade observável).
- **FR-008**: A feature MUST **garantir** que imagens fora de **4:5** não sejam esticadas nem cortadas automaticamente **sem aprovação visual** explícita.
- **FR-009**: A feature MUST **registrar, para o Plano**, a necessidade de comparar bundle local × EAS Update × download remoto com cache × soluções híbridas — **sem escolher** nenhuma agora.
- **FR-010**: A feature MUST **definir estratégia de migração, rollback e validação em clone limpo** (como verificar reprodutibilidade sem os untracked).
- **FR-011**: A feature MUST **estabelecer rastreabilidade** entre asset ↔ história ↔ manifest ↔ require estático ↔ estado de disponibilidade (tracked/untracked/missing/dynamic).
- **FR-012**: A feature MUST **definir critérios** que impeçam conteúdo "em breve" de aumentar o bundle/conteúdo ativo sem necessidade.
- **FR-013**: A feature MUST **NÃO** alterar código-fonte, **NÃO** converter/comprimir imagens, **NÃO** renomear/mover assets, **NÃO** adicionar as 10 pastas untracked ao Git, **NÃO** alterar manifests, **NÃO** instalar dependências, **NÃO** criar backend/CDN/armazenamento remoto, **NÃO** adotar Git LFS, **NÃO** configurar EAS Update, **NÃO** implementar conteúdo sob demanda e **NÃO** migrar para TypeScript.
- **FR-014**: Os entregáveis MUST ser **documentais e mensuráveis** (relatórios/critérios/perguntas), reprodutíveis por terceiros, sem efeitos colaterais sobre o app.

#### Arquitetura Híbrida de Conteúdo (WHAT-level — sem decidir fornecedor/tecnologia)

> Estes requisitos definem **resultados/propriedades** que a arquitetura deve preservar. **Não** escolhem formato, provedor, algoritmo nem mecanismo de entrega — isso pertence ao Plano (Etapa SDD 4).

- **FR-015 (Starter pack local)**: O app MUST manter um **starter pack local** — conjunto inicial **enxuto** de conteúdo **gratuito** empacotado no binário, disponível **offline desde a instalação**.
- **FR-016 (Packs remotos baixáveis)**: Conteúdos adicionais (especialmente **premium** e **novos packs**) MUST ser modelados como **pacotes baixáveis sob demanda**, **distintos** do starter pack local.
- **FR-017 (Offline após download)**: Todo conteúdo **baixado com sucesso** MUST ficar disponível **offline de forma persistente**, até **remoção explícita** pelo responsável ou política futura definida.
- **FR-018 (Manifesto versionado de pack)**: Cada pack MUST ter um **manifesto versionado** descrevendo: `id`, `versão`, **tipo de conteúdo**, **arquivos esperados**, **tamanhos**, **dimensões/regras visuais** relevantes e **compatibilidade mínima do app**.
- **FR-019 (Integridade)**: O app MUST conseguir **verificar a integridade** dos arquivos de cada pack **antes** de marcar o conteúdo como **pronto para uso**. (Algoritmo, provedor e implementação **não** são escolhidos aqui — Plano.)
- **FR-020 (Qualidade de colorir/flood-fill)**: Páginas de colorir **convertidas/otimizadas** MUST preservar **contornos fechados** e **funcionamento aceitável do flood-fill**. O **limiar mensurável** (anti-aliasing/artefato aceitável) **será definido no Plano Técnico** — não nesta spec.
- **FR-021 (Compatibilidade com controle de acesso futuro)**: A arquitetura MUST ser **compatível com controle de acesso/entitlement futuro**, **sem obrigar backend complexo no MVP**. Provedores/mecanismos (ex.: **Cloudflare R2**, **Supabase Storage**, **RevenueCat**, **URLs assinadas**, **Edge Functions** ou outro mecanismo de entitlement/autorização) pertencem ao **Plano ou a fases futuras** e **NÃO** são decididos nesta spec.

### Key Entities *(include if feature involves data)*

- **Asset**: arquivo de mídia (capa, cena, colorir, mapa, UI, áudio). Atributos: caminho, categoria, tamanho, dimensão/proporção, formato, qualidade, estado Git (tracked/untracked/missing/dynamic), estado de disponibilidade (ativo/"em breve").
- **História (Story)**: unidade de conteúdo do catálogo; relaciona-se a múltiplos assets por categoria; possui estado de disponibilidade.
- **Manifesto/Mapa de referência**: registro que associa histórias/cenas a assets via `require` estático (ex.: cenas, colorir, áudio).
- **Orçamento (Budget)**: conjunto de limites máximos por dimensão (download, instalação, atualização, memória, armazenamento local) com valor medido vs limite.
- **Padrão Canônico (Category Standard)**: regra por categoria (nome, diretório, dimensão, proporção, formato, qualidade).
- **Registro de Rastreabilidade**: vínculo asset ↔ história ↔ manifest ↔ require ↔ disponibilidade.
- **Pack**: unidade de conteúdo distribuível. Tipos: **starter (local, no binário)** vs **remoto (baixável sob demanda)**. Atributos: id, versão, tipo de conteúdo, lista de arquivos, tamanho, estado (não baixado / baixado / pronto), persistência offline.
- **Manifesto de Pack**: descritor **versionado** de um pack (id, versão, tipo, arquivos esperados, tamanhos, dimensões/regras visuais, compatibilidade mínima do app) usado para download, verificação de integridade e prontidão.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos assets (tracked e untracked) aparecem no inventário categorizado, e duas execuções consecutivas produzem **resultado idêntico** (reprodutibilidade).
- **SC-002**: O orçamento define **valores máximos numéricos** para as 5 dimensões (download, instalação, atualização, memória, armazenamento), com **download/instalação inicial ≤ ~150 MB**, cada um com a medição-base correspondente registrada.
- **SC-003**: A projeção de crescimento cobre **as 20 histórias atuais + ≥25% de folga** (≈5 packs) e indica, em número, o tamanho estimado total e a folga/estouro frente ao teto de ~150 MB, **sem** exigir essa folga no bundle inicial.
- **SC-004**: 100% dos assets fora do padrão canônico (proporção ≠ 4:5, nome/dir divergente, formato/qualidade inadequados) são **sinalizados** para aprovação visual — 0% transformados automaticamente.
- **SC-005**: 100% do conteúdo marcado como "ativo" é verificável como **funcional offline**; 0% do conteúdo "em breve" infla o conteúdo ativo.
- **SC-006**: 100% dos `require` estáticos do conteúdo ativo resolvem em **clone limpo** (sem untracked); qualquer dependência de untracked é detectada.
- **SC-007**: Cada asset possui um registro de rastreabilidade completo (história + manifest/require + estado), sem itens "órfãos" não classificados.
- **SC-008**: Os portões de qualidade do projeto permanecem verdes ao final (`npm run smoke` e `npx expo-doctor`), confirmando que a feature não alterou comportamento.
- **SC-009**: 100% do conteúdo **baixado com sucesso** permanece **disponível offline** até remoção explícita (FR-017); 0% exige rede para reabrir.
- **SC-010**: **0%** dos packs são marcados como "prontos para uso" sem **verificação de integridade** aprovada (FR-019).

## Assumptions

- O catálogo-alvo para projeção é o conjunto de **20** histórias declaradas em `src/data/stories.js` **mais uma reserva de ≥25%** (≈5 packs) para novos packs (decisão Q2), folga essa que **não** precisa entrar no bundle inicial; i18n é cenário futuro fora desta feature.
- A baseline de medição usa o estado atual verificado: working dir `assets/` ≈ **791 MiB** (406 arquivos tracked), **100** PNG untracked ≈ **164 MiB** em 10 diretórios, `.git` ≈ **952 MiB**; categorias tracked: cenas **160**, colorir **90**, áudio **61**, capas **20**.
- O público-alvo prioritário (Brasil-first, crianças 3–8) inclui **aparelhos de baixo custo**, o que torna o orçamento de tamanho/memória uma restrição de produto, não cosmética (Roteiro §6, P1).
- O contrato visual de referência das cenas/colorir é **4:5** (≈ 1122×1402 observado na maioria), usado como padrão canônico de proporção.
- A entrega permanece **local-first** e **sem backend** nesta feature; comparações de entrega (bundle/EAS Update/remoto) são apenas **registradas** para o Plano.
- Medições de build iOS podem ser **N/A** neste ambiente (sem toolchain Apple); isso é registrado como limitação, não como falha.
- Os 10 diretórios untracked permanecem **intocados e fora do Git** durante toda a feature.

## Open Questions

> As 3 perguntas de produto que bloqueavam esta spec foram **resolvidas** em `## Clarifications` (Session 2026-06-22): teto de orçamento (~150 MB), escopo do catálogo (20 + reserva de packs) e fronteira de conteúdo ativo/offline (grátis no binário + premium após download). **Nenhum marcador de esclarecimento permanece em aberto.**
>
> A arquitetura híbrida (starter local, packs remotos, offline persistente, manifesto versionado, integridade) agora é **requisito explícito** (FR-015…FR-021) — não mais lacuna.
>
> Itens deliberadamente **deferidos ao Plano** (não bloqueiam a spec): (a) o **limiar mensurável** de anti-aliasing/artefato do flood-fill (FR-020 define o WHAT; o número fica no Plano); (b) se o padrão canônico deve **forçar** uma estrutura única (`scene/` vs `scenes/`, `scene_NN` vs `<story>_scene_NN`) ou apenas **sinalizar** desvios; (c) comparação entre bundle local × EAS Update × download remoto com cache × híbrido; (d) escolha de provedor/algoritmo/mecanismo de entitlement (FR-021).

## Risks

- **Inflar o app** ao integrar assets sem orçamento → quebra adoção em aparelhos modestos (mitigação: FR-004 antes de qualquer integração).
- **Quebrar offline** ao mover conteúdo ativo para entrega remota sem garantia (mitigação: FR-006 + SC-005/SC-006).
- **Degradar flood-fill** por imagens com artefatos/anti-aliasing/proporção errada (mitigação: FR-007/FR-008 + SC-004).
- **Perda de reprodutibilidade** por dependência de untracked (mitigação: FR-010/FR-011 + clone limpo).
- **Decidir cedo demais** formato/armazenamento/entrega sem pesquisa → escolha subótima e irreversível (mitigação: manter FR-009 como comparação no Plano; nada decidido na spec).
- **Crescimento de `.git`** (histórico já ~952 MiB) confundido com peso do app (mitigação: separar métricas de repositório vs app entregue — Edge Cases).
