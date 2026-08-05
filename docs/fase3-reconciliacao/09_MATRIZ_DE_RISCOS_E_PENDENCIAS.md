# 09 · Matriz definitiva de riscos e pendências

> **Artefato 9 de 11 — consolidado em E016, aprovado em E017, adotado em E018 · Fase 3H.**
> **Atualizado na Fase 4A (Product Lock de Plano Família, compra, restauração e entitlement).**
> **Versão 5 — matriz única, deduplicada, definitiva e canônica.**

| Campo | Valor |
|---|---|
| **Estado** | **CANÔNICA — ADOTADA PELOS DOCUMENTOS ÁRBITROS EM E018, ATUALIZADA PELA FASE 4A** |
| **Base auditada** | E009 a E015, mais os sete riscos `R` residuais absorvidos em E018, mais as decisões do fundador registradas na Fase 4A |
| **Branch auditada** | `integrate/colorir-canonical-runtime` |
| **HEAD canônico** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Total de riscos** | **140** — `P-01` a `P-131` (herdados) + `P-132` a `P-134` (E016, ETAPA 4) + `P-135` a `P-139` (E018, ETAPA 2) + `P-140` (Fase 4A, §24) |
| **Fusões realizadas** | **0** |
| **Renumerações** | **0** — `P-140` é acréscimo puro |

> Este artefato é a **única fonte canônica de riscos** do projeto. Nenhum outro documento
> replica a matriz; os demais artefatos da Fase 3 apenas a referenciam por código.
>
> **Adoção E018.** A partir da E018 não existe mais nenhum esquema de riscos concorrente.
> As listas `R5`, `R6`, `R7`, `R17`, `R20A`, `R20B` e `R21` — mantidas até então por
> `docs/DECISIONS.md` e pela `v5` §4 — passam a valer **apenas como origem histórica e
> alias**, e cada uma tem destino canônico registrado na §22. `docs/DECISIONS.md` continua
> árbitro das **decisões de produto**; a `v5` continua governando o **roadmap e a sequência
> de fases**; este artefato governa **inventário, identidade, status, fase e rastreabilidade
> das pendências**.

## 0. Natureza deste documento

E016 é **exclusivamente documental e de auditoria**. Nenhum arquivo executável foi lido
para ser alterado: `src`, `scripts`, `assets`, dependências e configurações permanecem
byte a byte idênticos ao commit canônico. Nenhum defeito foi corrigido, nenhuma decisão
de produto foi implementada, nenhum teste físico foi executado e nenhum build foi gerado.

O que E016 fez: leu o código no commit canônico, leu o histórico, leu os onze artefatos
de E015, consolidou códigos, registrou aliases e produziu a matriz definitiva.

### 0.1 Tokens normativos

| Token | Significado exato |
|---|---|
| `ND` | **NÃO DETERMINADO NO CORPUS RECUPERADO.** Nunca significa "não se aplica", "zero" ou "irrelevante". Significa que a informação não existe nas fontes autorizadas. |
| `COMPROVADO PELO CÓDIGO` | Verificado por leitura direta do código no commit canônico. |
| `COMPROVADO PELO DOCUMENTO` | Verificado por leitura direta de documento versionado. |
| `COMPROVADO PELO ARQUIVO` | Verificado por leitura direta de arquivo de configuração ou asset. |
| `COMPROVADO PELO CÓDIGO E FISICAMENTE` | Verificado no código **e** em aparelho real, com evidência já registrada. |
| `DOCUMENTADO HISTORICAMENTE` | Registrado em documento anterior, sem reverificação nesta fase. |
| `MESMO BLOCO DE CORREÇÃO` | Riscos distintos cuja correção provavelmente será escrita junto — **não** são o mesmo risco. |

## 1. Identidade e proteção (ETAPA 1)

| Verificação | Obrigatório | Encontrado | Resultado |
|---|---|---|---|
| Branch | `docs/e015-phase3-artifacts` | `docs/e015-phase3-artifacts` | OK |
| HEAD ao iniciar E016 | `c293cea846fe3cee04aeaa50c30f1ba131fe3cc2` | `c293cea846fe3cee04aeaa50c30f1ba131fe3cc2` | OK |
| `git status --porcelain` | vazio | vazio | OK |
| `git merge-base HEAD 015c438…` | `015c438106538595b592981fbe1b80b1d5d65e55` | idem | OK |
| `git diff --name-status 015c438…..HEAD` | exatamente onze arquivos | onze arquivos, todos sob `docs/fase3-reconciliacao/` | OK |

O commit de E015 **não foi alterado**. E016 produz um commit documental novo sobre ele.

## 2. Fontes de verdade e divergências registradas (ETAPA 2)

Ordem de precedência aplicada: **1** decisão explícita e aprovada do fundador · **2** spec
fisicamente aprovada · **3** documento árbitro vigente · **4** código real · **5** teste
automatizado · **6** documento histórico · **7** inferência.

Quando as fontes divergiram, a divergência **não** foi resolvida em silêncio. Cada uma
está registrada abaixo e reproduzida na coluna *Observação* da linha correspondente.

| # | Divergência | Fontes em conflito | Resolução adotada |
|---|---|---|---|
| D1 | Severidade de `P-18` (JRN C60 01) | corpus E010 diz `baixa`; árbitro `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:512` diz **P1**, com saída da Fase 9 | Prevalece o **árbitro** (precedência 3). Severidade original preservada na coluna histórica; classificação transversal **ALTO**. |
| D2 | Severidade de `P-35` (STR ONB 01) | corpus E011 diz `média`; árbitro `v5:512` diz **P1** | Prevalece o **árbitro**. Fase 11, dependências 7 e 8A e revalidação 21 também vêm do árbitro. |
| D3 | Fase e revalidação de `P-34` (ONB BRI 01) | corpus sugeria fechamento da 12A; árbitro `v5:512` fixa **P2**, Fase 7, dependência do fechamento da 12A, revalidação **14 e 21** | Prevalece o **árbitro**. |
| D4 | Fase e revalidação de `P-32` (QA REP 01) | corpus não fixava; árbitro `v5:512` fixa **P2**, Fase 7, revalidação **19 e 21** | Adotado o árbitro. |
| D5 | Existência de escala oficial de severidade | nenhum documento árbitro define escala; `APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md` (histórico, precedência 6) define **P0–P3**, base 0; o árbitro `v5` usa **P1/P2** com P1 no topo; E013 usou **P1–P4**, base 1 | Nenhuma escala oficial vigente. Aplicado o ramo "se não existir" da ETAPA 5 — ver §5. |
| D6 | Premissa da divergência 4 do artefato 04 (campo de bytes) | o artefato 04 comparava `p.bytes` do índice global com `file.bytes` do manifesto por pack | **Premissa corrigida.** São campos de níveis diferentes (pacote inteiro × arquivo individual) e podem ter regras diferentes sem contradição. A divergência real é `p.bytes` × `totalBytes` — ver §4 e `P-132`. |
| D7 | Fase proprietária dos itens de E014 | 24 riscos herdaram o rótulo genérico `3F` | `3F` não é fase do Roteiro Mestre. Todos foram reatribuídos a fases reais — ver §9.2. |

## 3. Verificação do corpus recebido (ETAPA 3)

Verificação automatizada sobre a matriz restaurada em E015, **antes** de qualquer edição:

| Métrica | Valor |
|---|---|
| Total de códigos | **131** |
| Sequência mínima | `P-01` |
| Sequência máxima | `P-131` |
| Códigos ausentes na sequência | **0** |
| Linhas canônicas (uma definição principal por código) | **131** |
| Códigos duplicados como definição principal | **0** |
| `E015-N` usado como substituto de `P-XX` na tabela canônica | **0** |
| Aliases `E015-N01`..`N27` preservados apenas como origem | **27** |

> **Falso positivo registrado.** Uma varredura ingênua por `E015-N` neste artefato acusa dezenas
> de ocorrências. **Nenhuma delas está na coluna *Código*.** Os identificadores `E015-N##`
> aparecem apenas em quatro lugares, todos declaradamente de rastreabilidade: nesta §3, na §7.3
> (aliases herdados), na coluna *Aliases e relações* da matriz da §14 e na tabela de
> reconciliação da §18.1. São **27 achados de origem** mapeados para 14 códigos novos, 6
> duplicados, 5 ampliações, 1 resolução documental e 1 ressalva metodológica. A prova nº 5 da §16
> verifica exatamente a coluna *Código*, e é ela — não a contagem bruta de texto — que decide.

## 4. As três divergências que ainda não tinham código (ETAPA 4)

O artefato `04_SCHEMA_PRELIMINAR_MANIFESTO.md` registrava três divergências de schema sem
código atribuído. Cada uma foi comparada com `P-01` a `P-131` e classificada individualmente.
**Nenhum código foi criado automaticamente.**

| Divergência | Comparação com o corpus | Classificação | Código |
|---|---|---|---|
| Campo de bytes | Premissa original incorreta (ver D6). Reformulada, não duplica `P-124` — campo diferente, correção diferente | **É NOVO RISCO REAL** | `P-132` |
| Formato do identificador | Não existe no corpus. `P-121` trata de `type`, não de `id` | **É NOVO RISCO REAL** | `P-133` |
| Nome do campo de versão mínima | Não duplica `P-126`: lá o campo é `schemaVersion`, aqui é a versão **de app** | **É NOVO RISCO REAL** | `P-134` |

Sequência criada sem lacunas: `P-132`, `P-133`, `P-134`. **Total ao fim da E016: 134 riscos.**
A E018 acrescentou `P-135` a `P-139` pela absorção dos sete riscos `R` residuais (§22).
**Total ao fim da E018: 139 riscos.** A Fase 4A acrescentou `P-140`, único código criado
por determinação do fundador na consolidação do Product Lock, sem renumerar nenhum código
anterior (§24). **Total atual: 140 riscos.**

### 4.1 Verificação em código das três classificações

Leitura direta no commit canônico `015c438`:

- **`P-132`** — `globalManifestService.js:130` exige `p.bytes` inteiro **positivo**;
  `packManifestService.js:76-78` aceita `totalBytes` inteiro **≥ 0**. As duas declarações
  descrevem o mesmo fato (tamanho total do pacote) e **nunca são comparadas entre si**:
  `packDownloadService.js:73` lê apenas `manifest.totalBytes`.
- **`P-133`** — `globalManifestService.js:113` aceita **qualquer string não vazia** como `p.id`;
  `packManifestService.js:68` exige o slug `/^[a-z0-9_]+$/`. Um `id` com hífen ou maiúscula
  passa no índice, o download acontece e a instalação é recusada no aparelho.
- **`P-134`** — a mesma semântica aparece como `requiredAppVersion` no índice
  (`globalManifestService.js:149`) e como `minAppVersion` dentro do pack
  (`packManifestService.js:73`). Agrava: o token `minAppVersion` **significa outra coisa**
  em `globalManifestService.js:81`, onde é o piso do índice inteiro.

## 5. Normalização da terminologia (ETAPA 5)

### 5.1 Não existe escala oficial aprovada

Busca conduzida nos documentos árbitros (`PROJECT_SOURCE_OF_TRUTH.md`,
`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`, `DECISIONS`, constituição do projeto):
**nenhuma definição formal de escala de severidade**. A única definição formal do
repositório está em `APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md` — documento **histórico**
(precedência 6) — e é **P0–P3, base 0**, incompatível com o uso `P1/P2` do árbitro vigente
e com o `P1–P4` de E013.

Aplicou-se, portanto, o ramo previsto na ETAPA 5 para o caso de **não existir** escala
oficial. **E016 não inventou uma escala definitiva.**

1. A **severidade original** de cada risco foi preservada, verbatim, na coluna
   *Sev. origem* — inclusive as duas escalas herdadas (`alta/média/baixa` e `P1…P4`) e o
   `ND` dos riscos de E014, que não receberam severidade.
2. Foi acrescentada uma **classificação transversal separada**, que não substitui a
   severidade original e não é uma nova escala oficial do projeto:
   `CRÍTICO` · `ALTO` · `MÉDIO` · `BAIXO` · `INFORMATIVO` · `NÃO DETERMINADO`.

### 5.2 Critérios explícitos da classificação transversal

Aplicados na ordem, com o critério mais grave prevalecendo:

| # | Critério | Peso |
|---|---|---|
| 1 | Impacto sobre a criança (medo, frustração, promessa não cumprida, voz comercial) | eleva |
| 2 | Perda ou corrupção de dados ou de criação da criança | eleva a `CRÍTICO` |
| 3 | Bloqueio de fluxo sem saída | eleva a `CRÍTICO` |
| 4 | Acesso indevido a conteúdo ou a superfície interna | eleva |
| 5 | Privacidade | eleva |
| 6 | Compra, assinatura, restore e *entitlement* | eleva a `CRÍTICO` |
| 7 | Inacessibilidade (leitor de tela, escala de fonte, movimento) | eleva |
| 8 | Quebra de contrato aprovado pelo fundador | eleva a `CRÍTICO` |
| 9 | Frequência de ocorrência | modula |
| 10 | Alcance (quantas superfícies e quantos usuários) | modula |
| 11 | Recuperabilidade (a criança consegue sair sozinha) | modula |

### 5.3 Severidade e *gates*

**Severidade não foi reduzida por o código estar atrás de um gate.** O caso exemplar é
`P-55`: a rota é inalcançável hoje, e por isso o **status** é
`INTERNO E INALCANÇÁVEL EM PRODUÇÃO` — mas a classificação transversal permanece
**CRÍTICO**, porque a gravidade descreve o que o código faz, não a probabilidade atual de
alguém chegar até ele.

Distinção aplicada em toda a matriz:

| Categoria | Onde aparece |
|---|---|
| Risco **ativo** | status `ABERTO` — alcançável na produção atual |
| Risco **latente** | status `ABERTO` com superfície ainda não servida (ex.: todo o bloco de manifesto: nenhuma superfície é servida por pack instalado hoje) |
| Risco **inalcançável na produção atual** | status `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` |
| Risco **interno** | natureza `FERRAMENTAS INTERNAS` |
| Risco **documental** | status `DOCUMENTAL` |

## 6. Status canônico (ETAPA 6)

Exatamente **um** status por risco:

| Status | Significado |
|---|---|
| `ABERTO` | Defeito ativo, sem decisão pendente que o preceda |
| `DECISÃO DE PRODUTO PENDENTE` | A correção depende de uma decisão de produto ainda não tomada |
| `EXIGE VALIDAÇÃO FÍSICA` | O fato só se fecha com evidência em aparelho |
| `DEFERIDO PARA FASE PROPRIETÁRIA` | Reconhecido e deliberadamente adiado |
| `RISCO ACEITO PROVISORIAMENTE` | Aceito com registro explícito |
| `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` | Existe no binário, sem caminho de acesso |
| `DOCUMENTAL` | O defeito está no documento, não no comportamento |
| `IMPLEMENTADO SEM CONSUMIDOR` | Código vivo que ninguém chama |
| `LEGADO` | Resquício de decisão anterior já revogada |
| `CORRIGIDO` | Corrigido, com evidência da correção |
| `REFUTADO` | O enunciado original não se sustentou |
| `NÃO DETERMINADO` | Sem evidência suficiente para classificar |

> **Um risco corrigido ou refutado não desaparece.** `P-07` (refutado por E011) e `P-74`
> (corrigido por E013) permanecem na matriz, com a evidência da refutação e da correção,
> a fase em que foram resolvidos e a revalidação, quando cabível.

## 7. Deduplicação sem perda de histórico (ETAPA 7)

### 7.1 Resultado: **nenhuma fusão nova**

O teste aplicado foi o da ETAPA 7: fundir **somente quando a correção for necessariamente
a mesma**. Nenhum par sobreviveu a esse teste. Os quatro candidatos de deduplicação
levantados por E015 foram examinados individualmente:

| Candidato | Par | Decisão | Razão |
|---|---|---|---|
| A | privacidade × RevenueCat | **não fundido** | São obrigações distintas: uma é legal, outra é de configuração de build. A ETAPA 4 só autoriza códigos novos para as três divergências de schema, então o candidato A **não** gera código. |
| B | mídia offline × acesso premium offline (`P-05`, `P-24`) | **não fundido** | Falhas operacionais independentes: uma é recomendação sem filtro, outra é ausência de caminho de compra. |
| C | repositório sem *payload* × aparelho sem pack (`P-116`, `P-130`) | **não fundido** | Um é ausência de limpeza e teto de disco; o outro é o tipo de conteúdo requisitado. Correções diferentes, no mesmo bloco. |
| D | validação física individual × de fluxo (`P-20`, `P-128`, `P-129`) | **não fundido** | Classe de aparelho, plataforma e caminho de *entitlement* são campanhas distintas. |

Pares adicionais examinados e mantidos separados, com relação registrada: `P-27`/`P-28`;
`P-63`/`P-64`/`P-65` (raiz comum `atelierStorage.js:10` = 0, mas três arquivos e um bug de
`NaN` independente); `P-16`/`P-81`; `P-34`/`P-53`/`P-103`; `P-88`/`P-89`/`P-90`;
`P-11`/`P-12`/`P-48`/`P-52`/`P-73`/`P-74`/`P-109`/`P-110`.

> **Regra aplicada:** riscos **não** foram deduplicados por pertencerem à mesma tela.

### 7.2 Fatos citados duas vezes, sinalizados para não serem contados em dobro

Dois fatos aparecem na evidência de mais de um código. Nenhum foi apagado; ambos estão
marcados na coluna *Aliases e relações*:

- o par de *overlay* do `esgotarTempo` do Palavrinhas consta da evidência de `P-16`
  (ausência de fila global) **e** é o próprio enunciado de `P-81`;
- o `ATELIER_GUIDE` sem consumidor consta de `P-34` **e** de `P-53`.

### 7.3 Aliases herdados

Os **6** códigos que E015 classificou como `DUPLICADO` na reconciliação `E015-N01..N27`
foram absorvidos como **alias** do código mais antigo e **nunca** foram reaproveitados
para outro risco: `E015-N02`→`P-73`, `E015-N07`→`P-10`, `E015-N09`→`P-54`,
`E015-N20`→`P-20`, `E015-N26`→`P-36`, `E015-N27`→`P-16`.

Os **5** classificados como `AMPLIA` acrescentaram evidência ao código mais antigo, sem
criar código novo: `E015-N03`→`P-01`, `E015-N04`→`P-04`, `E015-N08`→`P-40`,
`E015-N10`→`P-02`, `E015-N18`→`P-110`.

### 7.4 Relações registradas

`AMPLIA` · `CAUSADO POR` · `DEPENDENTE DE` · `MESMO BLOCO DE CORREÇÃO` · `MESMA REVALIDAÇÃO`
— todas na coluna *Aliases e relações*. `MESMO BLOCO DE CORREÇÃO` **não** significa que os
riscos sejam o mesmo: significa que a correção provavelmente será escrita junto.

## 8. Classificação por natureza (ETAPA 8)

Natureza primária obrigatória, secundárias quando necessário. Vocabulário fechado de 25
valores mais `OUTRO`: `DADOS E PERSISTÊNCIA` · `JORNADA E PROGRESSO` · `NAVEGAÇÃO` ·
`ONBOARDING E GUIAS` · `UI E RESPONSIVIDADE` · `ACESSIBILIDADE` · `ÁUDIO E HÁPTICOS` ·
`ASSETS` · `PACKS E OFFLINE` · `JOGOS` · `CRIAR LIVRE` · `COLORIR COM O BENI` ·
`MEU LIVRO` · `CULTINHO` · `MEU MOMENTO` · `ESTRELINHAS E CONQUISTAS` ·
`PRESENTES E RECOMPENSAS` · `PLANO E ENTITLEMENT` · `PRIVACIDADE` ·
`ANALYTICS E PESQUISA` · `FERRAMENTAS INTERNAS` · `MODO IGREJA` ·
`DEPENDÊNCIAS E BUILD` · `DOCUMENTAÇÃO` · `CONTEÚDO E TEOLOGIA` · `OUTRO`.

A matriz da §14 está dividida por natureza **primária**. Cada código tem **uma única
definição canônica**, na tabela da sua natureza primária.

## 9. Fase proprietária (ETAPA 9)

### 9.1 Regra aplicada

Uma única fase proprietária por risco. Dependências podem apontar para outras fases.
Quando a implementação exige decisão de produto antes, o risco traz
**decisão na Fase 4** no campo *Fase decisão* e **implementação na Fase X** no campo
*Fase implementação*. Nenhum risco recebeu o rótulo genérico "fase futura".

Piso preservado conforme a ETAPA 9: Fase 7 onboarding e guias · 8A áudio · 9 Colorir ·
10 Meu Livro · 11 Estrelinhas, conquistas e conclusão · 12A Brincar, jogos e Criar Livre ·
12B Cultinho e Meu Momento · 18 plano, compra, restore e *entitlement* · 19 release,
segurança e ausência de ferramentas internas · 21 revalidação física final.

### 9.2 Reclassificações de fase, com o motivo

Toda mudança de fase em relação ao corpus está registrada na coluna *Observação* da linha.
Resumo:

| De | Para | Códigos | Motivo |
|---|---|---|---|
| 7 | **6** | `P-27` `P-28` `P-29` `P-30` `P-31` `P-47` `P-104` | O alvo real é o shell, o sistema visual e a acessibilidade transversal, não a tela de onboarding |
| 12A | **11** | `P-70` | Conquistas são definidas na Fase 11; a 12A entra como dependência |
| 12A | **8A** | `P-80` | Hápticos são matéria da orquestração sonora |
| `3F` | **20** | `P-88` `P-89` `P-90` `P-91` `P-94` `P-113` `P-92` | Engenharia de lançamento, EAS Update, rollout e *compliance* |
| `3F` | **8A** | `P-95` `P-96` `P-97` `P-98` `P-99` `P-100` `P-101` `P-102` `P-106` `P-117` | Orquestração sonora |
| `3F` | **19** | `P-107` `P-112` `P-114` `P-115` | Hardening, modelo de ameaças e ausência de ferramentas internas |
| `3F` | **16** | `P-110` `P-111` | Congelamento editorial, visual e funcional |
| `3F` | **17** | `P-116` | Packs e offline completo |
| `3F` | **13** | `P-105` | Noé e prova da fábrica |
| `3F` | **7** | `P-103` | Onboarding e guias |
| `3F` / 5 | **12B** | `P-108` | Rituais e Modo Igreja |
| `3F` / 4 | **18** | `P-93` | RevenueCat e Plano Família (Stripe removido do título da fase na Fase 4A — ver §24) |
| 4 | **16** | `P-118` `P-119` | Decisão editorial permanece na Fase 4; a implementação é do congelamento editorial |
| 4 | **17** | `P-120` a `P-126` `P-130` `P-132` `P-133` `P-134` | Decisão de contrato na Fase 4; implementação em packs e offline |
| 5 | **17** | `P-131` | A saída do peso do binário é matéria de packs |
| 8 e 9 | **21** | `P-128` | Fase proprietária única: a campanha física final |
| `E016` | **4** | `P-87` `P-109` | E016 não pode alterar documento árbitro — ver §9.3 |

### 9.3 Duas pendências que E016 está proibido de resolver

`P-87` (HEAD canônico desatualizado no `PROJECT_SOURCE_OF_TRUTH`) e `P-109` (referência
"DECISIONS.md #5" não localizável) **não foram corrigidas**, embora sejam documentais e
triviais. A ETAPA 18 proíbe alterar documentos árbitros e a ETAPA 16 limita a atualização
cruzada aos artefatos da Fase 3. Ambas passam à **Fase 4**, que reabre os documentos
árbitros.

## 10. Bloqueio do Product Lock (ETAPA 10)

Critério aplicado: **`BLOQUEIA PRODUCT LOCK` somente quando a ausência de entendimento
factual impede uma decisão de produto.** Gravidade, isoladamente, não qualifica.

| Classificação | Quando |
|---|---|
| `BLOQUEIA PRODUCT LOCK` | Falta o **fato**. Sem ele, a Fase 4 não pode decidir |
| `EXIGE DECISÃO NO PRODUCT LOCK` | O fato é conhecido; falta a **decisão** |
| `INFORMA O PRODUCT LOCK` | Não exige decisão, mas a Fase 4 deve conhecer |
| `NÃO BLOQUEIA PRODUCT LOCK` | Irrelevante para a decisão de produto |

Consequência direta do critério: **um bug técnico já compreendido não bloqueia o Lock.**
`P-01` é grave e sistêmico, mas está inteiramente compreendido — recebe
`EXIGE DECISÃO NO PRODUCT LOCK`, não `BLOQUEIA`.

> **Atualização E018 — nenhum item bloqueia o Product Lock.** Até a E017 o único bloqueador
> era `P-129`, sob o argumento de que sem saber o comportamento offline com cache expirado a
> regra de acesso do Plano Família não poderia ser decidida. A ETAPA 5 da E018 demonstrou que
> essa classificação era **circular**: a mesma linha declarava dependência de `P-24` e `P-93`,
> cujo campo *Fase decisão* é a **própria Fase 4**. O teste exige entitlement Família real, que
> só existe depois que o Lock decidir o caminho de compra e a configuração de chaves. `P-129`
> foi reclassificado para `EXIGE DECISÃO NO PRODUCT LOCK` — o Lock decide **o gate e o harness**,
> não o resultado do teste. A auditoria completa está na §23.

## 11. Bloqueio de lançamento (ETAPA 11)

Os 12 critérios foram aplicados um a um: **1** segurança infantil · **2** privacidade ou
obrigação legal · **3** compra, assinatura, restore ou *entitlement* quebrado · **4** perda
ou corrupção de criação da criança · **5** história impossível de concluir · **6** fluxo
principal sem saída · **7** ferramenta interna acessível em produção · **8** conteúdo
obrigatório ausente · **9** offline prometido e não entregue · **10** acessibilidade
essencial · **11** *crash* ou bloqueio reproduzível · **12** inconsistência meramente
editorial (**não** bloqueia).

**Nenhum item foi congelado como bloqueador apenas por severidade alta.**

### 11.1 Regra da consequência local

Quando um risco é a consequência local de um risco sistêmico já classificado como
bloqueador ou possível bloqueador, **a classificação de lançamento fica no item sistêmico**
e o item local recebe `NÃO BLOQUEIA LANÇAMENTO` com a dependência registrada. Isso evita
contar o mesmo bloqueio várias vezes. Aplicada a `P-04`, `P-22`, `P-30`, `P-47`, `P-79`,
`P-101` e `P-104`.

### 11.2 Os cinco bloqueadores de lançamento

| Código | Critério | Fato |
|---|---|---|
| `P-24` | 3 | `planConfig.js:40-56` deixa `monthly` e `annual` em `comingSoon`, com `productIdPlaceholder` vazio e `isPurchaseEnabled: false`, enquanto 18 de 20 histórias são premium. Não existe caminho de compra |
| `P-56` | 3 e 8 | `MonteACenaTableGameScreen.js:456` e `:467` devolvem `{ ok: true, remaining: Infinity, premium: true }` no `catch`. Viola a decisão aprovada e não reabrível de que *entitlement* é **fail-closed** |
| `P-63` | 11 | `AtelierGalleryScreen.js:116` calcula `Math.min(n/0,1)` = `NaN` de forma determinística para 100% dos usuários do plano grátis, em cabeçalho incondicional |
| `P-67` | contrato | Quatro textos "Ateliê" visíveis à criança sobrevivem em `beniChestService.js:143,144,145,154`, contra a proibição explícita do fundador em `v5:719` |
| `P-93` | 3 | `EXPO_PUBLIC_REVENUECAT_*` são lidas no código e não existem em nenhum dos quatro perfis do `eas.json` nem no `.env.example`. Sem elas não há compra, assinatura nem *restore* |

### 11.3 Rebaixamentos registrados

| Código | Corpus dizia | Agora | Motivo |
|---|---|---|---|
| `P-86` | bloqueia lançamento | `NÃO BLOQUEIA LANÇAMENTO` | Perder uma partida curta e casual ao encerrar o app é comportamento normal em celular. Nenhum critério se aplica: nenhum desenho e nenhuma estrela já concedida se perde |
| `P-07` | risco médio, candidato a Lock | `REFUTADO`, `BAIXO`, não bloqueia | E011 provou que a Congrats é reencontrável por `NarrationScreen:175` e que as conquistas são derivadas a cada chamada |

Todo item marcado `PODE BLOQUEAR LANÇAMENTO` registra, na coluna *Observação*, **a
evidência que falta** para fechar a classificação. A prova suplementar S1 da §16 verifica
essa obrigação linha a linha.

## 12. Reconferência individual obrigatória (ETAPA 12)

Os pontos listados na ETAPA 12 foram reconferidos **um a um**, sem aceitar a classificação
anterior. A coluna *Resultado* indica o que mudou; "mantida" significa que a classificação
foi reconferida contra a fonte e sobreviveu.

| Código | Status | Classif. transversal | Fase impl. | Product Lock | Lançamento | Resultado da reconferência |
|---|---|---|---|---|---|---|
| **P-06** | `EXIGE VALIDAÇÃO FÍSICA` | **CRÍTICO** | 11 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-24** | `ABERTO` | **CRÍTICO** | 18 | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-27** | `EXIGE VALIDAÇÃO FÍSICA` | **ALTO** | 6 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-28** | `EXIGE VALIDAÇÃO FÍSICA` | **ALTO** | 6 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-31** | `EXIGE VALIDAÇÃO FÍSICA` | **ALTO** | 6 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-35** | `EXIGE VALIDAÇÃO FÍSICA` | **ALTO** | 11 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | divergência com o árbitro resolvida |
| **P-36** | `ABERTO` | **ALTO** | 9 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-55** | `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` | **CRÍTICO** | 12A | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-56** | `ABERTO` | **CRÍTICO** | 12A | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-63** | `ABERTO` | **CRÍTICO** | 12A | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-64** | `ABERTO` | **ALTO** | 12A | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-65** | `ABERTO` | **ALTO** | 12A | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-66** | `ABERTO` | **MÉDIO** | 12A | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-67** | `ABERTO` | **ALTO** | 12A | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-71** | `ABERTO` | **ALTO** | 12A | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-86** | `ABERTO` | **MÉDIO** | 12A | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | rebaixado no lançamento |
| **P-87** | `DOCUMENTAL` | **INFORMATIVO** | 4 | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-93** | `ABERTO` | **CRÍTICO** | 18 | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | fase proprietária reclassificada |
| **P-97** | `ABERTO` | **ALTO** | 8A | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-98** | `ABERTO` | **ALTO** | 8A | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-100** | `DECISÃO DE PRODUTO PENDENTE` | **MÉDIO** | 8A | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | fase proprietária reclassificada |
| **P-101** | `ABERTO` | **MÉDIO** | 8A | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | rebaixado no lançamento; fase proprietária reclassificada |
| **P-102** | `ABERTO` | **ALTO** | 8A | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-107** | `ABERTO` | **ALTO** | 19 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-114** | `ABERTO` | **ALTO** | 19 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-116** | `ABERTO` | **ALTO** | 17 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-118** | `ABERTO` | **MÉDIO** | 16 | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | fase proprietária reclassificada |
| **P-119** | `IMPLEMENTADO SEM CONSUMIDOR` | **MÉDIO** | 16 | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | fase proprietária reclassificada |
| **P-120** | `DECISÃO DE PRODUTO PENDENTE` | **ALTO** | 17 | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-121** | `DECISÃO DE PRODUTO PENDENTE` | **MÉDIO** | 17 | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-122** | `DECISÃO DE PRODUTO PENDENTE` | **BAIXO** | 17 | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-123** | `ABERTO` | **BAIXO** | 17 | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-124** | `ABERTO` | **ALTO** | 17 | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-125** | `DECISÃO DE PRODUTO PENDENTE` | **BAIXO** | 17 | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-126** | `DECISÃO DE PRODUTO PENDENTE` | **ALTO** | 17 | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | rebaixado no lançamento |
| **P-127** | `EXIGE VALIDAÇÃO FÍSICA` | **MÉDIO** | 9 | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-128** | `EXIGE VALIDAÇÃO FÍSICA` | **ALTO** | 21 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | fase proprietária reclassificada |
| **P-129** | `EXIGE VALIDAÇÃO FÍSICA` | **ALTO** | 18 | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | classificação anterior reconferida e mantida |
| **P-130** | `ABERTO` | **ALTO** | 17 | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | rebaixado no lançamento |
| **P-131** | `CORRIGIDO` | **INFORMATIVO** | 16 | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | classificação anterior reconferida e mantida |

## 13. Evidência física necessária (ETAPA 13)

Cada risco indica a validação física necessária. Múltiplas indicações são permitidas.
**Nenhum desses testes foi executado em E016.**

| Token | Significado |
|---|---|
| `NEF` | `NÃO EXIGE VALIDAÇÃO FÍSICA` |
| `VFP` | `EXIGE VALIDAÇÃO FÍSICA NA FASE PROPRIETÁRIA` |
| `TEL` | `EXIGE VALIDAÇÃO EM TELEFONE` |
| `TAB` | `EXIGE VALIDAÇÃO EM TABLET` |
| `AND` | `EXIGE VALIDAÇÃO EM ANDROID` |
| `IOS` | `EXIGE VALIDAÇÃO EM IOS` |
| `GRA` | `EXIGE VALIDAÇÃO NO PLANO GRÁTIS` |
| `FAM` | `EXIGE VALIDAÇÃO NO PLANO FAMÍLIA` |
| `AVI` | `EXIGE MODO AVIÃO` |
| `REI` | `EXIGE REINSTALAÇÃO` |
| `MIG` | `EXIGE ESTADO MIGRADO` |
| `FS13` | `EXIGE FONT SCALE 1.3` |

## 14. Matriz definitiva

Vinte e duas colunas, sem omissão e sem tabelas-resumo substitutas. A matriz está dividida
por **natureza primária**; cada código aparece **uma única vez**, na tabela da sua natureza.
As tabelas rolam horizontalmente.

### DADOS E PERSISTÊNCIA — 3 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-46** | Falha de escrita silenciosa em 3 domínios | Livro, Cultinho e Meu Momento não detectam falha de escrita, ao contrário do Colorir (`postStoryStorage.js:39`, `:84`, `:94`; `familyWorshipService.js:59-63`) | **DADOS E PERSISTÊNCIA** | `postStoryStorage.js:39,:84,:94` | E012 | `ABERTO` | média | **ALTO** | Livrinho, Cultinho, Meu Momento | progresso perdido sem aviso | erro de storage engolido | - | 19 | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-56`, `P-71`, `P-114` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: falha de gravação é visível e fecha o caminho. A interface mostra estado Guardando durante a escrita, não declara conclusão nem concede recompensa antes da confirmação, informa a falha de forma afetiva e objetiva, oferece nova tentativa e preserva o trabalho em memória quando possível. Nunca concede premium, rodada, recompensa ou desbloqueio como alternativa, e nunca deixa ação habilitada e inerte. Decisão de produto resolvida, implementação pendente na Fase 19, risco técnico NÃO corrigido, validação física ainda exigida. Falta para lançamento: provocar falha de storage e observar se a criança perde progresso sem aviso |
| **P-114** | Cerca de 20 chaves `@ptf` fora do `storageKeys.js` | O módulo se declara fonte única de chaves e cerca de 20 chaves vivem fora dele | **DADOS E PERSISTÊNCIA** | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **ALTO** | Storage | reset pode não limpar ou pode apagar o que deveria manter | fonte única declarada e não cumprida | - | 19 | `P-35`, `P-32` | 19 e 21 | `VFP` · `TEL` · `REI` · `MIG` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-32`, `P-35`, `P-46` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 19. Falta para lançamento: executar o reset em aparelho e verificar se alguma criação da criança é perdida. Se for, critério 4 |
| **P-119** | `getStoriesInChronologicalOrder()` ordena por campo ausente | `storyHelpers.js:45-72` ordena por um campo que falta em 17 histórias e não tem nenhum consumidor | **DADOS E PERSISTÊNCIA** | `COMPROVADO PELO CÓDIGO` · `storyHelpers.js:45-72` | E015 (`E015-N06`), artefato 08 | `IMPLEMENTADO SEM CONSUMIDOR` | média | **MÉDIO** | dados | nenhum hoje | função viva sem consumidor é incorreta se adotada | - | 16 | `P-118` | 16 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N06`. CAUSADO POR `P-118` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 9 para 16, junto do `P-118` DECISÃO DA FASE 4C: nenhuma superfície de lançamento consome ordenação cronológica, portanto a função sem consumidor não entra no caminho do lançamento. Decisão de produto resolvida, destino da função pendente na Fase 16. |

### JORNADA E PROGRESSO — 14 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-01** | Sem motor canônico de jornada | Não existe árbitro único de jornada; quatro decisores concorrentes definem estado e próxima história | **JORNADA E PROGRESSO** · sec.: DADOS E PERSISTÊNCIA | `COMPROVADO PELO CÓDIGO` · artefato 02 | E010 | `ABERTO` | alta | **ALTO** | Home, Mapa, Story Detail | próxima história incoerente entre telas | quatro decisores sem árbitro; escala impossível | 4 | 11 | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | AMPLIA: `E015-N03` nomeia os 4 decisores. MESMO BLOCO DE CORREÇÃO: `P-04`, `P-05`, `P-26` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: o árbitro canônico da jornada é a autoridade única de conclusão e desbloqueio, e nenhuma superfície pode recalcular sua própria versão da conclusão. A fórmula canônica de conclusão de história passa a exigir todas as cenas declaradas da história, quiz concluído, reflexão concluída, pelo menos uma atividade do Colorir com o Beni quando o Colorir estiver disponível para aquela história, e persistência confirmada. O Livrinho deixa de compor a fórmula obrigatória e permanece como experiência própria, revisável e recompensável. Home e Mapa passam a ser atualizados pela mesma leitura persistida, e a hierarquia de estados mantém jornada bloqueada antes de bloqueio por plano. Decisão de produto resolvida, motor canônico e unificação das superfícies pendentes na Fase 11, risco técnico NÃO corrigido, validação física futura. Falta para lançamento: reproduzir fisicamente a incoerência Home × Mapa no mesmo estado |
| **P-02** | Sem `ContentRotationEngine` | Não existe motor de rotação de conteúdo; a vitrine é constante em três superfícies simultâneas, sem dedupe | **JORNADA E PROGRESSO** · sec.: CONTEÚDO E TEOLOGIA | `COMPROVADO PELO CÓDIGO` · artefato 03 | E010 | `DECISÃO DE PRODUTO PENDENTE` | média | **MÉDIO** | Home, Cultinho, Meu Momento | mesma sugestão repetida indefinidamente | descoberta de conteúdo não escala | 4 | 11 | `P-01` | 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | AMPLIA: `E015-N10` nomeia as três superfícies. MESMO BLOCO DE CORREÇÃO: `P-44`, `P-54`, `P-61` | `COMPROVADO PELO CÓDIGO` | Ausência de motor não impede lançar com vitrine fixa declarada |
| **P-03** | Aventura concluída com 3 textos e 2 regras | `CongratsScreen:241` é incondicional enquanto `StoryDetailScreen:522` usa o predicado correto; a contradição é da Congrats | **JORNADA E PROGRESSO** | `CongratsScreen:241` incondicional × `StoryDetailScreen:522` | E010, refinado por E011 | `ABERTO` | alta | **MÉDIO** | Congrats, Story Detail | recebe elogio de conclusão sem ter concluído | dois predicados para o mesmo fato | 4 | 11 | `P-01` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-22`, `P-15` | `COMPROVADO PELO CÓDIGO` | E011 localizou a evidência sem alterar o enunciado original DECISÃO DA FASE 4C: existe um único critério de conclusão de história, o do árbitro canônico, e os textos de conclusão passam a refletir esse critério em todas as superfícies. Aventura concluída não pode ser anunciada apenas por cenas. Decisão de produto resolvida, unificação dos enunciados pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-04** | Quatro algoritmos de próxima história | Home usa ordem de array, Mapa usa `ORDERED_STORY_IDS`, `nextAdventureService` usa `CATALOG`; E015 ampliou para 6 eixos de ordenação | **JORNADA E PROGRESSO** · sec.: CONTEÚDO E TEOLOGIA | `COMPROVADO PELO CÓDIGO` | E010, refinado por E011 | `ABERTO` | alta | **ALTO** | Home, Mapa, jornada | ordem de aventuras muda conforme a tela | 6 eixos editoriais coexistentes | 4 | 11 | `P-01` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | AMPLIA: `E015-N04` (6 eixos). MESMO BLOCO DE CORREÇÃO: `P-01`, `P-118`, `P-119` | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: consequência local do `P-01`, que já carrega a classificação de lançamento do bloco. Contar aqui duplicaria o mesmo bloqueio. DECISÃO DA FASE 4C: a próxima aventura é decidida por um único produtor canônico alimentado pela leitura persistida do árbitro, e a ordem oficial da jornada é a ordem do Mapa de Aventuras. Decisão de produto resolvida, unificação dos produtores pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-05** | Home sem filtro de acesso ou sequência | Fechadas as 2 grátis, a Home recomenda `david_goliath`, que é premium; 18 de 20 histórias são premium | **JORNADA E PROGRESSO** · sec.: PLANO E ENTITLEMENT | caso reprodutível `david_goliath` | E010, refinado por E011 | `ABERTO` | alta | **ALTO** | Home | recebe convite para conteúdo que não pode abrir | recomendação ignora entitlement | 4 | 11 | `P-01`, `P-24` | 18 e 21 | `VFP` · `TEL` · `GRA` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | CAUSADO POR `P-01`. MESMO BLOCO DE CORREÇÃO: `P-24`, `P-26` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4A: a Home do plano grátis, esgotado o conteúdo livre, não fica vazia nem vira paywall. Continua exibindo histórias gratuitas para revisitar, obras do Colorir com o Beni, progresso, conquistas e atividades gratuitas. Conteúdo protegido pode aparecer como prévia carinhosa e, ao toque, produz apenas orientação neutra para chamar um adulto; qualquer oferta comercial fica atrás do gate parental. Decisão de produto resolvida, implementação do filtro pendente na Fase 11. DECISÃO DA FASE 4B: A Criação e Noé são as duas histórias gratuitas completas e as outras dezoito, inclusive Davi e Golias, são integralmente premium. Não existe degustação gratuita por cena, atividade ou marco dentro de história premium, nem mecanismo de autorização por cena, e pack presente no aparelho nunca é autorização. Home e Mapa aplicam a mesma regra de acesso, podendo usar composições visuais diferentes. A prévia infantil sobre história bloqueada limita-se a capa, título, sinopse curta, região ou posição no Mapa, selo neutro do Plano Família e estado visual protegido, e nunca inclui cena narrativa integral, áudio narrado, quiz, reflexão, Colorir, recompensa, progresso fabricado, preço, desconto, teste grátis, urgência ou botão de assinar. A mesma proibição comercial vale para rótulo de acessibilidade, leitor de tela, áudio e qualquer mensagem falada. Ao toque, a criança recebe apenas orientação neutra para pedir ajuda a um adulto, e o gate parental vem antes de qualquer paywall, preço, oferta ou informação comercial. DESCOMPASSO REGISTRADO NA FASE 4B: a Home recomenda `david_goliath` sem consultar autorização, e nenhuma recomendação pode terminar em toque sem resposta. Decisão de produto resolvida, implementação do filtro e da prévia pendente na Fase 11. DECISÃO DA FASE 4C: a Home consome a mesma leitura persistida do árbitro canônico e nunca recalcula sequência nem conclusão por conta própria. Decisão de produto resolvida, implementação pendente na Fase 11, validação física futura. Falta para lançamento: confirmar em plano grátis, em aparelho, o convite a conteúdo bloqueado |
| **P-06** | Contiguidade presumida gera beco sem saída | Em progresso não contíguo a cena pendente fica `locked` e nenhuma fica `available`, porque `isDone` precede `isCurrent` (`:319`, `:367`) | **JORNADA E PROGRESSO** | `COMPROVADO PELO CÓDIGO` · `:319`, `:367` | E010, refinado por E011, ratificado em E013 | `EXIGE VALIDAÇÃO FÍSICA` | alta | **CRÍTICO** | Mapa, jornada | história iniciada pode ficar impossível de concluir | máquina de estados sem estado alcançável | 4 | 11 | `P-01` | 21 | `VFP` · `TEL` · `MIG` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-01`, `P-04` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: a história retoma por cena, sem persistir posição exata de áudio, rolagem ou palavra no lançamento, e o desbloqueio da próxima depende exclusivamente da conclusão registrada da anterior no árbitro canônico, sem presumir contiguidade de progresso. PRECISÃO DA FASE 4C: a presunção de contiguidade foi localizada em `StoryDetailScreen.js:319` e `:367`, e não na tela do Mapa como o enunciado original sugeria. Decisão de produto resolvida, correção pendente na Fase 11, risco técnico NÃO corrigido, validação física ainda exigida. Falta para lançamento: reproduzir progresso não contíguo em aparelho e observar o beco. Critério 5 de lançamento se confirmado |
| **P-07** | Congrats inalcançável após kill | Parcialmente refutado: a Congrats é reencontrável pela lista de cenas (`Ver conclusao` para `NarrationScreen:175`) e conquistas são derivadas a cada chamada | **JORNADA E PROGRESSO** | `NarrationScreen:175` | E010, rebaixado por E011 | `REFUTADO` | baixa (era média) | **BAIXO** | Congrats | residual: caminho de volta pouco evidente | nenhum estado é perdido | - | 11 | - | 21 | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | Rebaixado por E011: Lock de sim para não. Linha preservada com a refutação | `REFUTADO PELO CÓDIGO` | Refutado não desaparece: permanece com a evidência da refutação, conforme ETAPA 6 |
| **P-08** | `hasPendingRewards` exclui Colorir | `ProgressContext.js:81` usa 3 termos por história e exclui Colorir, Cultinho e Meu Momento (`postStoryStorage.js:53`) | **JORNADA E PROGRESSO** · sec.: PRESENTES E RECOMPENSAS | `ProgressContext.js:81` · `postStoryStorage.js:53` | E010, E011, ampliado por E012 | `ABERTO` | média | **MÉDIO** | Story Detail, pós-história | atividade feita não conta como recompensa pendente | predicado de pendência incompleto | - | 11 | `P-51` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-50`, `P-51` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: quando o Colorir com o Beni estiver disponível para a história, concluir pelo menos uma das três atividades é requisito de conclusão, portanto as recompensas pendentes precisam enxergar o Colorir. Três de três permanecem conclusão de coleção e nunca requisito de desbloqueio. Decisão de produto resolvida, inclusão do Colorir no cálculo pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-15** | 20 encerramentos bespoke sem padrão | 15 encerramentos mapeados em E010 mais 5 acrescentados por E012 entre Livro, Cultinho, Meu Momento e C60 | **JORNADA E PROGRESSO** · sec.: UI E RESPONSIVIDADE | E012 seção 13 | E010, ampliado por E012 | `ABERTO` | média | **MÉDIO** | múltiplas telas | cada atividade termina de um jeito diferente | sem contrato de encerramento | 4 | 11 | `P-01` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-03`, `P-22` | `COMPROVADO PELO CÓDIGO` | Contagem original de E010 citada é preservada DECISÃO DA FASE 4C: fica aprovado o sistema padronizado de encerramento com treze slots e cinco modos, aplicado a histórias e jogos, preservando a identidade visual de cada superfície mas usando os mesmos slots, ações e rótulos. A ordem canônica dos destinos é próxima aventura quando existir e estiver autorizada, Mapa de Aventuras, revisitar esta história, ir ao Brincar e ir ao Início; quando não houver próxima história disponível, e também em revisitação, o Mapa assume a ação principal. Decisão de produto resolvida, padronização dos encerramentos pendente na Fase 11. |
| **P-17** | `isFirstStory: true` hardcoded | `StoryDetailScreen.js:287-296`; 35 hardcodes mapeados, 12 impedem escala | **JORNADA E PROGRESSO** · sec.: CONTEÚDO E TEOLOGIA | `StoryDetailScreen.js:287-296` | E010, ampliado por E011 | `ABERTO` | média | **MÉDIO** | Story Detail | toda história se apresenta como a primeira | 12 hardcodes impedem catálogo | 4 | 11 | `P-01` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-36` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: a primeira história é determinada pela ordem oficial do Mapa de Aventuras lida pelo árbitro canônico, nunca por valor fixo no código. Decisão de produto resolvida, remoção do valor fixo pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-19** | Ramo A da Home decide por `totalStars` | A Home ramifica por total de estrelas em vez de progresso de jornada | **JORNADA E PROGRESSO** · sec.: ESTRELINHAS E CONQUISTAS | `COMPROVADO PELO CÓDIGO` | E010 | `ABERTO` | baixa | **BAIXO** | Home | Home muda por motivo que a criança não associa | critério de ramificação incorreto | 4 | 11 | `P-01` | 21 | `VFP` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-39` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: estrelinhas são marcos de progresso não consumíveis e não decidem qual conteúdo aparece. A Home decide por leitura persistida do árbitro canônico, nunca por contador de estrelinhas. Decisão de produto resolvida, correção do ramo pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-22** | CTA do Story Detail com dois predicados | Rótulo por `isFullyComplete` e ação por `isCompleted`, então Continuar aventura reabre a cena 1 | **JORNADA E PROGRESSO** | `COMPROVADO PELO CÓDIGO` | E011 | `ABERTO` | alta | **ALTO** | Story Detail, Narration | a criança reinicia a história sem querer | dois predicados para um botão | 4 | 11 | `P-01` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-03`, `P-15` | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: reabrir a cena 1 não apaga progresso nem fecha o fluxo, e a raiz sistêmica `P-01` já carrega a classificação do bloco. DECISÃO DA FASE 4C: o Story Detail consome um único predicado, o do árbitro canônico, e o rótulo do CTA acompanha o estado canônico da história. Decisão de produto resolvida, unificação do predicado pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-23** | CTA habilitado é inerte na hidratação | `canEnterStoryContent` falso não desabilita o botão durante `ProgressContext.isLoadingProgress` | **JORNADA E PROGRESSO** · sec.: UI E RESPONSIVIDADE | `ProgressContext.isLoadingProgress` | E011 | `ABERTO` | média | **MÉDIO** | Story Detail | toca e nada acontece | `disabled` incompleto | - | 11 | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-22` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: nenhuma tela pode deixar CTA habilitado e inerte. Durante a hidratação a interface mostra estado de carregamento e só habilita a ação quando a leitura persistida estiver disponível. Decisão de produto resolvida, correção pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-51** | Ordem canônica das 3 atividades replicada | A mesma ordem está escrita em quatro lugares distintos | **JORNADA E PROGRESSO** | E012 seção 16 item 2 | E012 | `ABERTO` | baixa | **BAIXO** | pós-história | ordem pode divergir entre telas | quatro fontes para uma ordem | - | 11 | - | 21 | `VFP` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-08`, `P-50` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: a ordem das três atividades do Colorir com o Beni é dado canônico e a exigência de conclusão é de pelo menos uma atividade, nunca das três. Três de três permanecem conclusão de coleção. Decisão de produto resolvida, unificação da fonte da ordem pendente na Fase 11. |

### NAVEGAÇÃO — 4 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-31** | 11 navegações inefetivas no tablet | 8 chamadas `navigate('Home', {screen})` e 3 nomes de aba não trocam de aba acima de 768px, e o `TabletLayout` não tem `BackHandler` | **NAVEGAÇÃO** · sec.: UI E RESPONSIVIDADE | `Cultinho :56` e `:183` não trocam de aba | E011, ampliado por E012 | `EXIGE VALIDAÇÃO FÍSICA` | alta | **ALTO** | navegação global e `AppNavigator` | becos sem saída em tablet | payload descartado por construção | - | 6 | `P-20` | 21 | `VFP` · `TAB` · `AND` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-30`, `P-47` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 7 para 6 (shell de navegação). Critério 6 de lançamento se confirmado. Falta para lançamento: reproduzir os 11 becos em tablet físico. Se confirmados, critério 6 (fluxo principal sem saída). |
| **P-42** | Ramo `ParentArea` do Cantinho do Beni é morto | `accessControl.js:130-132` contra `HomeScreen.js:746-749` e `:525`: Pedir ao responsável nunca renderiza | **NAVEGAÇÃO** | `accessControl.js:130-132` × `HomeScreen.js:746-749` | E012 | `IMPLEMENTADO SEM CONSUMIDOR` | baixa | **BAIXO** | Home | caminho previsto nunca aparece | ramo inalcançável | - | 7 | - | 21 | `VFP` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | - |
| **P-47** | `LumiMoment` e `StoryBook` são rotas raiz | `AppNavigator.js:281-285`, `:514-518` e `:532-536`: em tablet a barra lateral desaparece e não há largura máxima de leitura | **NAVEGAÇÃO** · sec.: UI E RESPONSIVIDADE | `AppNavigator.js:281-285` | E012 | `ABERTO` | média | **MÉDIO** | navegação, tablet | perde a navegação ao entrar nessas telas | hierarquia de rotas inconsistente | - | 6 | `P-30`, `P-31` | 21 | `VFP` · `TAB` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-30`, `P-31` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 7 para 6. Falta: confirmar em tablet físico REBAIXADO na ETAPA 11: consequência local do `P-31`, que já carrega a classificação de lançamento do bloco de navegação em tablet. |
| **P-84** | Nenhum deep link para os quatro jogos | `AppNavigator.js:292` monta `NavigationContainer` sem `linking` | **NAVEGAÇÃO** | `AppNavigator.js:292` | E013 | `ABERTO` | **P3** | **BAIXO** | navegação | nenhum hoje | capacidade planejada e não implementada | - | 20 | - | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `POSTERIOR AO LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | Não atende a nenhum dos 12 critérios de bloqueio: entra como posterior ao lançamento |

### ONBOARDING E GUIAS — 4 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-21** | Revisão com A Criação já concluída | Fluxo de revisão com a primeira história concluída nunca foi exercitado | **ONBOARDING E GUIAS** | `COMPROVADO PELO DOCUMENTO` · `v5:500-510` | E010 | `EXIGE VALIDAÇÃO FÍSICA` | baixa | **BAIXO** | QA e revisão | primeira experiência de retorno não verificada | caminho de revisão sem evidência | - | 7 | - | 21 | `VFP` · `TEL` · `MIG` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-32` | `COMPROVADO PELO DOCUMENTO` | Registrado no árbitro `v5` como pendência física não bloqueante migrada para a Fase 7 DECISÃO DA FASE 4C: história já concluída antes da escala permanece concluída. Conteúdo novo entra como conteúdo a explorar, nunca como pendência retroativa: não retranca a próxima história, não retira recompensa e não repete automaticamente a grande celebração. Decisão de produto resolvida, reconciliação pendente na Fase 7, validação física ainda exigida. |
| **P-34** | ONB BRI 01: guia do Brincar só especificado | `BRINCAR_GUIDE` existe apenas na especificação, `ATELIER_GUIDE` está sem consumidor e os áudios `guide.brincar` não existem | **ONBOARDING E GUIAS** · sec.: ÁUDIO E HÁPTICOS | `beniGuides` · `v5:512` | E011 | `ABERTO` | média (E011) e **P2** (v5:512, árbitro) | **MÉDIO** | Onboarding, Brincar | guia prometido é ausente | guia especificado sem implementação | - | 7 | fechamento da 12A | 14 e 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `ONB BRI 01` (v5:512). MESMO BLOCO DE CORREÇÃO: `P-53`, `P-103` | `COMPROVADO PELO CÓDIGO` | Revalidação alinhada ao árbitro: 14 e 21, não após 12A. O árbitro exige `BRINCAR_GUIDE` novo, nunca o `ATELIER_GUIDE` |
| **P-35** | STR ONB 01: transporte do estado de guia | O estado de guia vive em memória no `beniTourService` e a whitelist de `progressResetService.js:34-63` não tem chaves de guia nem `@ptf_brincar`, com risco de camadas simultâneas | **ONBOARDING E GUIAS** · sec.: ESTRELINHAS E CONQUISTAS | `progressResetService.js:34-63` · `v5:512` | E011, sustentado por E013 | `EXIGE VALIDAÇÃO FÍSICA` | média (E011) e **P1** (v5:512, árbitro) | **ALTO** | Onboarding, Estrelinhas | overlays sobrepostos na primeira entrada | estado de guia não persistido nem limpo | - | 11 | 7 e 8A | 21 | `VFP` · `TEL` · `REI` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `STR ONB 01` (v5:512). MESMO BLOCO DE CORREÇÃO: `P-16`, `P-101`, `P-114` | `COMPROVADO PELO CÓDIGO` | DIVERGÊNCIA RESOLVIDA: corpus dizia média, o árbitro `v5:512` diz **P1**. Prevalece o árbitro. Fase 11, dependências 7 e 8A e revalidação 21 vem do árbitro. Falta para lançamento: reproduzir as camadas simultâneas na primeira entrada e verificar se a criança consegue sair delas. |
| **P-103** | `ADVENTURES_GUIDE` sem consumidor e `BeniAppTour` órfão | O guia está definido sem chamador e o componente de tour não é montado por ninguém | **ONBOARDING E GUIAS** | `COMPROVADO PELO CÓDIGO` | E014 | `IMPLEMENTADO SEM CONSUMIDOR` | ND | **BAIXO** | Guias | guia previsto nunca aparece | guia e tour vivos sem consumidor | - | 7 | `P-34` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-34`, `P-53` (inventário único de guias órfãos) | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 7 (onboarding e guias) |

### UI E RESPONSIVIDADE — 6 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-16** | Sem fila global de overlays (7 pares de colisão) | São 7 pares, não 3, com prova negativa: zero gerenciador central de overlays em todo `src`; mais 1 par novo em E013 | **UI E RESPONSIVIDADE** · sec.: ONBOARDING E GUIAS | prova negativa em todo `src` | E010, ampliado por E011 e E013 | `ABERTO` | média | **ALTO** | overlays (global) | camadas simultâneas confundem e travam a interação | nenhuma arbitragem central | 4 | 11 | - | 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `E015-N27` (duplicado). MESMO BLOCO DE CORREÇÃO: `P-81`, `P-35`, `P-101` | `COMPROVADO PELO CÓDIGO` | O par `esgotarTempo` do Palavrinhas citado na evidência é o MESMO fato de `P-81`, registrado aqui para não ser contado duas vezes. Falta para lançamento: reproduzir fisicamente um par simultâneo |
| **P-20** | Tablet nunca validado fisicamente | Nenhum módulo C60 consulta `isTablet`; o Livrinho trata tablet em 1 ponto; Meu Momento e Cultinho em nenhum | **UI E RESPONSIVIDADE** · sec.: NAVEGAÇÃO | `COMPROVADO PELO CÓDIGO` | E010, ampliado por E012 | `EXIGE VALIDAÇÃO FÍSICA` | média | **ALTO** | aparelhos e layout | layout não verificado na classe de aparelho | metade das classes-alvo sem evidência | - | 6 | - | 21 | `VFP` · `TAB` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `E015-N20` (duplicado). MESMO BLOCO DE CORREÇÃO: `P-30`, `P-31`, `P-47`. Candidato D de dedupe: NÃO fundido | `COMPROVADO PELO DOCUMENTO` | Falta para lançamento: decidir no Lock se tablet é classe-alvo do v1 e, se for, executar a campanha |
| **P-29** | `AppScreen.js` é código morto | Cada tela improvisa a área segura em vez de usar o componente existente | **UI E RESPONSIVIDADE** | `COMPROVADO PELO CÓDIGO` | E011 | `IMPLEMENTADO SEM CONSUMIDOR` | média | **BAIXO** | 5 telas | margens inconsistentes entre telas | duplicação e divergência | - | 6 | - | 21 | `VFP` · `TEL` · `TAB` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-27`, `P-30` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 7 para 6 (sistema visual e shell) |
| **P-30** | Dois sistemas de breakpoint concorrentes | `>= 768` em 10 pontos contra `breakpoints.tablet = 600` em `tokens.js:128`, usado por `ContentContainer.js:22`; o Livrinho usa 768 | **UI E RESPONSIVIDADE** | `tokens.js:128` × `StoryBookScreen.js:195` | E011, confirmado e reformulado por E013 | `ABERTO` | média | **MÉDIO** | todas as telas e `tokens.js` | layout imprevisível entre 600 e 767 px | dois sistemas de layout | - | 6 | `P-20` | 21 | `VFP` · `TAB` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-29`, `P-31`, `P-47` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 7 para 6. REBAIXADO na ETAPA 11: consequência local medida pelo `P-31` e pelo `P-20`, que carregam a classificação de lançamento do bloco. |
| **P-59** | Chip de plano do Brincar corta em 100% dos estados | `BrincarScreen.js:238`, `386`, `390` e `198-204` cortam o texto do chip em todos os estados possíveis | **UI E RESPONSIVIDADE** · sec.: PLANO E ENTITLEMENT | `COMPROVADA PELO CÓDIGO E FISICAMENTE` | E013 | `ABERTO` | **P2** | **MÉDIO** | Brincar | informação de plano ilegível | largura insuficiente sem tratamento | - | 12A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-60` | `COMPROVADO PELO CÓDIGO E FISICAMENTE` | Já possui evidência física registrada em E013. DECISÃO DA FASE 4A: o nome público do plano pago é único e imutável, Plano Família, e é essa string que o chip precisa acomodar. A decisão fixa o texto, não corrige o corte, que permanece pendente de implementação na Fase 12A. |
| **P-60** | `headerTitle` do Brincar sem `numberOfLines` | `BrincarScreen.js:233`, `379`, `371` e `231` deixam o título sem `numberOfLines` nem `lineHeight` em coluna de cerca de 118 dp | **UI E RESPONSIVIDADE** | `COMPROVADA PELO CÓDIGO E FISICAMENTE` | E013 | `ABERTO` | **P2** | **MÉDIO** | Brincar | título cortado no topo da tela | tipografia sem limite de linhas | - | 12A | `P-27` | 21 | `VFP` · `TEL` · `FS13` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-27`, `P-59` | `COMPROVADO PELO CÓDIGO E FISICAMENTE` | Ofensor visual dominante do defeito de topo, já observado fisicamente |

### ACESSIBILIDADE — 5 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-27** | Tipografia sem proteção de escala | Zero `allowFontScaling` e `maxFontSizeMultiplier` em todo `src`; cerca de 34 textos abaixo de 13px e 4 contrastes reprovados em AA | **ACESSIBILIDADE** · sec.: UI E RESPONSIVIDADE | zero `allowFontScaling` em `src` (E013) | E011, ampliado por E012 e E013 | `EXIGE VALIDAÇÃO FÍSICA` | alta | **ALTO** | 5 telas e design system | texto ilegível ou cortado com fonte grande do sistema | layout quebra fora do tamanho padrão | - | 6 | - | 21 | `VFP` · `TEL` · `TAB` · `FS13` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-28`, `P-29`, `P-30` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: corpus dizia 7 (Onboarding, Home e Área dos Pais); o alvo real é o sistema visual, Fase 6. Falta para lançamento: teste físico em font scale 1.3 |
| **P-28** | Semântica de acessibilidade ausente | Papéis, rótulos e estados esparsos, zero `announceForAccessibility`, sem `accessibilityViewIsModal` e sem reduce-motion; 3 telas com a11y totalmente zerada | **ACESSIBILIDADE** | 0 `accessibilityRole` em Cultinho, Meu Momento e Livrinho | E011, ampliado por E012 e E013 | `EXIGE VALIDAÇÃO FÍSICA` | alta | **ALTO** | 5 telas | leitor de tela sem contexto utilizável | árvore de acessibilidade incompleta | - | 6 | `P-27` | 21 | `VFP` · `TEL` · `IOS` · `AND` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-27`, `P-66`, `P-79`, `P-104`. Depende de 10 e 12B para as 3 telas zeradas | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 7 para 6, pelo mesmo motivo de `P-27`. Falta para lançamento: passagem com leitor de tela nas 3 telas zeradas |
| **P-66** | Mensagem comercial dentro de `accessibilityLabel` | `BrincarScreen.js:324` coloca oferta comercial no rótulo de acessibilidade | **ACESSIBILIDADE** · sec.: PLANO E ENTITLEMENT | `BrincarScreen.js:324` | E013 | `ABERTO` | **P2** | **MÉDIO** | Brincar | leitor de tela lê oferta comercial para a criança | rótulo de a11y usado como copy | 4 | 12A | `P-28` | 5 e 21 | `VFP` · `TEL` · `IOS` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-28` | `COMPROVADO PELO CÓDIGO` | Voz comercial dirigida a criança é matéria da Fase 5. DECISÃO DA FASE 4A: a superfície infantil não exibe preço, desconto, teste grátis, urgência, contagem regressiva nem convite a assinar; apenas orientação neutra equivalente a pedir ajuda a um adulto para continuar, com toda explicação comercial atrás do gate parental. O rótulo de acessibilidade fica proibido de carregar oferta; a correção permanece pendente de implementação. DECISÃO DA FASE 4B: a proibição comercial alcança explicitamente `accessibilityLabel`, leitor de tela, áudio e qualquer mensagem falada, porque oferta que a criança ouve é oferta feita à criança. O gate parental precede qualquer paywall, preço, oferta ou informação comercial. Decisão de produto resolvida, correção do rótulo pendente na Fase 12A. |
| **P-79** | Ovelhinha sem reduce-motion | `CadeAOvelhinhaScreen.js` tem zero ocorrências de `reduceMotion` ou `isReduceMotionEnabled` apesar de cerca de 8 laços de animação | **ACESSIBILIDADE** · sec.: JOGOS | prova negativa em `CadeAOvelhinhaScreen.js` | E013 | `ABERTO` | **P2** | **MÉDIO** | Ovelhinha | animação continua para quem pediu menos movimento | preferência do sistema ignorada | - | 12A | `P-28` | 21 | `VFP` · `TEL` · `IOS` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-28`, `P-104` | `COMPROVADO PELO CÓDIGO` | Localizado: depende da decisão sistêmica de acessibilidade do `P-28`, que é o item que pode bloquear |
| **P-104** | Hápticos sem reduce motion em 3 telas | Três telas vibram sem consultar a preferência e duas leem a preferência sem aplicar | **ACESSIBILIDADE** · sec.: ÁUDIO E HÁPTICOS | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **MÉDIO** | Acessibilidade | vibração mantida para quem pediu menos movimento | preferência lida e não aplicada | - | 6 | `P-28` | 21 | `VFP` · `TEL` · `IOS` · `AND` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-28`, `P-79` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 6 (sistema visual e acessibilidade). Localizado: o item sistêmico é o `P-28` |

### ÁUDIO E HÁPTICOS — 11 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-80** | Palavrinhas sem háptico e nenhum jogo com háptico na conclusão | Zero `Haptics` no Palavrinhas; `Pares:432-441` e a Ovelhinha (`vibrar()` só em `vibrarAcerto`, `:519`) não vibram no fim; `vibrarConquista()` dispara em combo (`:575`, `:693`) | **ÁUDIO E HÁPTICOS** · sec.: JOGOS | prova negativa em `PalavrinhasDoBeniScreen.js` | E013 | `ABERTO` | **P3** | **BAIXO** | Brincar (3 jogos) | retorno tátil ausente no momento de maior recompensa | háptico sem contrato de conclusão | - | 8A | `P-15` | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-104` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 12A para 8A, porque hápticos são matéria da orquestração sonora |
| **P-95** | `uiPlayers` e `musicPlayer` nunca liberados | Monte a Cena e Puzzle Lab não chamam `releaseGameSfx` | **ÁUDIO E HÁPTICOS** | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **MÉDIO** | Áudio | áudio pode degradar em sessão longa | players sem liberação | - | 8A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-96`, `P-106` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A |
| **P-96** | `ensureAudioMode` marca pronto antes do `await` | A função sinaliza prontidão antes de concluir e é chamada sem `await` em 2 pontos | **ÁUDIO E HÁPTICOS** | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **MÉDIO** | Áudio | primeiro som pode sair errado ou mudo | prontidão declarada antes do efeito | - | 8A | `P-95` | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-95` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A |
| **P-97** | `AudioPlayer` sem tratamento de erro de carga | Com `autoPlay=false` a falha de carga não é tratada e a Narração fica presa em Carregando | **ÁUDIO E HÁPTICOS** · sec.: JORNADA E PROGRESSO | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **ALTO** | Áudio, Narração | a história não avança e não há saída | estado de erro inexistente | - | 8A | `P-98` | 21 | `VFP` · `TEL` · `AVI` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-98` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A. Falta para lançamento: provocar falha de carga em aparelho e verificar se há saída. Se não houver, critério 6 (fluxo principal sem saída) |
| **P-98** | `StoryBookScreen` resolve áudio remoto sem `getInfoAsync` | Ao contrário da Narração, o Livrinho não confirma a existência do arquivo antes de tocar | **ÁUDIO E HÁPTICOS** · sec.: PACKS E OFFLINE | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **ALTO** | Áudio, Packs, Livrinho | áudio do livro pode falhar sem aviso | resolução de mídia inconsistente entre telas | - | 8A | `P-26` | 17 e 21 | `VFP` · `TEL` · `AVI` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-97` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A. Falta para lançamento: exercitar o Livrinho com áudio remoto ausente |
| **P-99** | `turbo_end.wav` nunca disparado | O arquivo está presente e referenciado, e `PARES_SOUND_EVENTS.WIN` nunca é chamado | **ÁUDIO E HÁPTICOS** · sec.: ASSETS | `COMPROVADO PELO CÓDIGO` | E014 | `IMPLEMENTADO SEM CONSUMIDOR` | ND | **BAIXO** | Áudio, Pares | o som de vitória nunca toca | evento sonoro sem emissor | - | 8A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-72`, `P-106` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A |
| **P-100** | Voz do Beni em autoplay sem card de consentimento | Home, Perfil e Estrelinhas tocam a voz automaticamente sem qualquer pedido prévio | **ÁUDIO E HÁPTICOS** · sec.: ONBOARDING E GUIAS | `COMPROVADO PELO CÓDIGO` | E014 | `DECISÃO DE PRODUTO PENDENTE` | ND | **MÉDIO** | Áudio, Home, Perfil, Estrelinhas | som inesperado no primeiro contato | autoplay sem contrato de consentimento | 4 | 8A | `P-102` | 5 e 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-101`, `P-102` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A, com decisão na Fase 4. Autoplay dirigido a criança é matéria da Fase 5 |
| **P-101** | Voz do guia continua tocando sob o Modal de Visão Geral | Ampliação de STR ONB 01: a fala não é interrompida quando o modal aparece | **ÁUDIO E HÁPTICOS** · sec.: ONBOARDING E GUIAS | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **MÉDIO** | Áudio, Onboarding | duas vozes ou voz sem contexto visível | áudio não arbitrado por overlay | - | 8A | `P-35`, `P-16` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | AMPLIA `P-35`. MESMO BLOCO DE CORREÇÃO: `P-16`, `P-35`, `P-102` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A. REBAIXADO na ETAPA 11: consequência sonora do `P-35` e do `P-16`, que já carregam a classificação de lançamento do bloco de overlays. |
| **P-102** | Guia não para ao trocar de aba e não reage a `AppState` | A fala do guia continua ao mudar de aba e ao mandar o app para segundo plano | **ÁUDIO E HÁPTICOS** · sec.: ONBOARDING E GUIAS | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **ALTO** | Áudio, navegação | voz continua fora de contexto e com o app fechado | ciclo de vida de áudio não observado | - | 8A | `P-101` | 21 | `VFP` · `TEL` · `AND` · `IOS` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-100`, `P-101` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A. Falta para lançamento: confirmar em aparelho se a voz segue tocando com o app em segundo plano |
| **P-106** | 6 exports de `audioService.js` sem consumidor | Seis funções exportadas não são importadas por nenhum módulo | **ÁUDIO E HÁPTICOS** | `COMPROVADO PELO CÓDIGO` | E014 | `IMPLEMENTADO SEM CONSUMIDOR` | ND | **BAIXO** | Áudio | nenhum | superfície de serviço maior que o uso | - | 8A | - | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-95`, `P-99` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A |
| **P-117** | `ProfileScreen` pré-carrega 3 mp3 do guia em todo mount | O pré-carregamento ocorre mesmo quando o guia já foi visto | **ÁUDIO E HÁPTICOS** · sec.: ONBOARDING E GUIAS | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **BAIXO** | Performance, Perfil | entrada no perfil mais lenta sem necessidade | trabalho repetido a cada montagem | - | 8A | `P-127` | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-127` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 8A |

### ASSETS — 6 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-33** | ONB IMG 01: borda visível do Beni | Três causas somadas: PNG opaco, `borderWidth` e `beniBg` diferente de `paper` | **ASSETS** · sec.: ONBOARDING E GUIAS | assets e `StorybookBeni` | E011 | `ABERTO` | média | **BAIXO** | Onboarding | qualidade percebida na primeira tela | - | - | 7 | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | Não reabre a Spec 020 | `COMPROVADO PELO CÓDIGO` | - |
| **P-105** | `stories.js:259` referência chave de asset sem `require` | A chave `noe_sorrindo` é referenciada e não possui `require` correspondente | **ASSETS** · sec.: CONTEÚDO E TEOLOGIA | `COMPROVADO PELO CÓDIGO` · `stories.js:259` | E014 | `ABERTO` | ND | **MÉDIO** | Assets, Noé | imagem pode não aparecer na história | referência de asset sem resolução | - | 13 | - | 13 e 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 13 (Noé e prova da fábrica). Falta para lançamento: abrir a história de Noé em aparelho e observar o ponto exato |
| **P-111** | Capas em 2 famílias de resolução e 9 fora do ratio declarado | Nove capas tem ratio 1,784 contra o `16/9` declarado | **ASSETS** | `COMPROVADO PELO ARQUIVO` | E014 | `ABERTO` | ND | **MÉDIO** | Assets | capas com corte ou barra visível | padrão de asset não uniforme | - | 16 | `P-131` | 16 e 21 | `VFP` · `TEL` · `TAB` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-131` | `COMPROVADO PELO ARQUIVO` | RECLASSIFICAÇÃO DE FASE: de 3F para 16 |
| **P-131** | Colorir e 278 MB em PNG, o maior peso local | Enunciado original corrigido: os 199 linearts legados foram aposentados no macrobloco P3J e `src/assets/coloringImages.js` deixou de existir; em `015c438` restam 3 PNG de colorir rastreados, todos do Colorir 60 | **ASSETS** · sec.: COLORIR COM O BENI | `COMPROVADO PELO CÓDIGO` · `git ls-tree -r 015c438` traz 3 arquivos em `assets/stories/*/coloring/` e nenhum `coloringImages.js` · `COLORING_LEGACY_RETIREMENT_INVENTORY.md` | E015 (`E015-N24`), artefato 06 | `CORRIGIDO` | média | **INFORMATIVO** | mídia | nenhum | os 278 MB deixaram o binário; resta resíduo documental | - | 16 | `P-37`, `P-110` | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N24`, `R7`. MESMO BLOCO DE CORREÇÃO: `P-37`, `P-110` (resíduo documental). Não confundir com `P-135`, que é o peso agregado remanescente | `COMPROVADO PELO CÓDIGO` | CORRIGIDO em E018 por erro factual verificável: a linha foi herdada de `F1_2:103,140` com o token `DOCUMENTADO HISTORICAMENTE`, que a própria matriz define como registro sem reverificação. A reverificação no commit executável congelado refuta 200 PNG e 278 MB. Corrigido não desaparece: a linha permanece com a evidência da correção. Resíduo vivo: `P-37` (copy promete pintura removida) e os artefatos 06, 08 e 11 que ainda afirmam 200 PNG |
| **P-135** | Peso agregado do binário por `require()` estático | 519 arquivos de `assets/` estão amarrados por `require()` literal em `src/`, somando 130.976.281 bytes (124,9 MB) que viajam dentro do binário público independentemente de uso | **ASSETS** · sec.: DEPENDÊNCIAS E BUILD | `COMPROVADO PELO CÓDIGO` · 519 requires únicos medidos em `015c438`, 130.976.281 bytes resolvidos, 0 não resolvidos | E018 (alias `R5`), `RELATORIO_FECHAMENTO_LP.md:246` | `DECISÃO DE PRODUTO PENDENTE` | alta | **ALTO** | binário, upload EAS, download da loja | download inicial pesado para a família | peso do binário não cai sem tirar os registries estáticos do caminho do bundle | 4 | 16 | `P-136`, `P-130`, `P-94` | 17 e 21 | `NEF` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `R5` (parcela agregada). PARCELAS JÁ COBERTAS: `P-130` (canal de saída), `P-116` (teto no aparelho), `P-88`, `P-89`, `P-90`, `P-91`, `P-94` (upload e configuração de bundle). MESMO BLOCO DE CORREÇÃO: `P-136`, `P-130` | `COMPROVADO PELO CÓDIGO` | E018: parcela residual de `R5` — nenhum dos 134 códigos anteriores enuncia o peso agregado do binário nem o mecanismo `require()` estático. O número original de `R5` (401,12 MB em 711 arquivos) está desatualizado por fato do código: a medição em `015c438` dá 519 arquivos e 130.976.281 bytes, depois da conversão WebP e do P3J. NÃO conta em dobro com `P-136`, que é o subconjunto premium (378 arquivos, 84.183.401 bytes). Teto de tamanho é decisão do Lock, não critério de lançamento, seguindo o rebaixamento da ETAPA 11 |
| **P-136** | 18 histórias premium fisicamente embarcadas no binário | As 18 histórias declaradas `remote` em `contentManifest.js:28-49` continuam com `require()` estático de cenas, áudio e capa — 378 arquivos e 84.183.401 bytes (80,3 MB) — e viajam íntegras no aparelho de quem não comprou | **ASSETS** · sec.: PLANO E ENTITLEMENT · PACKS E OFFLINE | `COMPROVADO PELO CÓDIGO` · `contentManifest.js:28-49` × `storySceneIllustrations.js`, `audioManifest.js`, `storyCovers.js` · 378 requires medidos em `015c438` · texto narrado integral das 20 histórias em `stories.js` e 18 quizzes premium em `quizzes.js:36-238`, embarcados sem `require()` | E018 (alias `R6`), `RELATORIO_FECHAMENTO_LP.md:247`, artefato 11 | `ABERTO` | alta | **ALTO** | binário, packs, entitlement | nenhum efeito direto na criança | conteúdo pago viaja íntegro no binário público e a remoção depende de UX de baixar antes de ver | 4 | 16 | `P-130`, `P-135`, `P-26` | 17 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `R6`. AMPLIA: o artefato 11 já afirmava o fato sem lhe dar código P. MESMO BLOCO DE CORREÇÃO: `P-135`, `P-130`, `P-116`. CONTEXTO, não cobertura: `P-24` e `P-05` citam 18 de 20 premium apenas como pano de fundo | `COMPROVADO PELO CÓDIGO` | E018: risco novo real. Nenhum dos 134 códigos anteriores enuncia o embarque físico das premium nem a consequência de entitlement. Condição de saída registrada em `F2_5A_PREMIUM_PACKS_AUDIT_AND_MIGRATION_PLAN.md:64`: remover os requires sem UX de baixar antes de ver deixa história premium sem imagem. Subconjunto de `P-135`, não conta em dobro. DECISÃO DA FASE 4A: o build de produção contém apenas as 2 histórias gratuitas locais; as 18 premium passam a ser entregues por packs remotos. Podem permanecer no binário somente metadados mínimos de vitrine, assets genéricos compartilhados e fixtures internas comprovadamente excluídas ou inalcançáveis em produção. A existência física de asset ou pack nunca concede autorização. Decisão de produto resolvida, remoção pendente na Fase 16. DECISÃO DA FASE 4B: a evidência deste risco alcança todo conteúdo premium incluído no pacote ou bundle, incluindo imagens, áudios, textos narrativos, quizzes e outros dados, e não apenas o que passa por `require()`. O texto narrado integral das vinte histórias e os dezoito quizzes premium entram no bundle por importação direta de módulo de dados, sem `require()`. Foi demonstrado que o fato, a superfície e a correção são os mesmos deste código, portanto nenhum código P novo foi criado para textos narrativos e quizzes. Decisão de produto resolvida quanto ao alcance, risco técnico NÃO corrigido. Falta para lançamento: remover os `require()` estáticos das 18 premium com a UX de baixar antes de ver e medir o binário resultante |

### PACKS E OFFLINE — 16 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-25** | `uiState error` anula `configMissing` | No bloco de download o estado de erro sobrescreve a causa real de configuração ausente | **PACKS E OFFLINE** · sec.: UI E RESPONSIVIDADE | `useStoryPackDownload` | E011 | `ABERTO` | média | **BAIXO** | Story Detail | mensagem de falha incorreta | causa de falha mascarada | - | 17 | - | 21 | `VFP` · `TEL` · `AVI` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-26` | `COMPROVADO PELO CÓDIGO` | - |
| **P-26** | Mapa cego a pack ausente e a erro de download | `storyJourneyService:109` faz `mediaReady` reagir só a `coming_soon` | **PACKS E OFFLINE** · sec.: JORNADA E PROGRESSO | `storyJourneyService:109` | E011 | `ABERTO` | média | **MÉDIO** | Mapa | mapa mostra disponível o que não abre | representação incompleta de estado | - | 17 | `P-01` | 21 | `VFP` · `TEL` · `AVI` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-05`, `P-25` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4B: o Mapa aplica a mesma regra de acesso da Home, podendo usar composição visual diferente. História premium aparece somente como prévia editorial. A prévia infantil sobre história bloqueada limita-se a capa, título, sinopse curta, região ou posição no Mapa, selo neutro do Plano Família e estado visual protegido, e nunca inclui cena narrativa integral, áudio narrado, quiz, reflexão, Colorir, recompensa, progresso fabricado, preço, desconto, teste grátis, urgência ou botão de assinar. A mesma proibição comercial vale para rótulo de acessibilidade, leitor de tela, áudio e qualquer mensagem falada. Ao toque, a criança recebe apenas orientação neutra para pedir ajuda a um adulto, e o gate parental vem antes de qualquer paywall, preço, oferta ou informação comercial. Não há degustação de cena, atividade ou marco e não há autorização por cena. Decisão de produto resolvida, implementação da prévia pendente na Fase 11. Falta para lançamento: exercitar pack ausente e erro de download em aparelho |
| **P-116** | Packs sem limpeza de órfãos e sem teto de disco | Não há rotina de remoção de packs órfãos nem limite de ocupação | **PACKS E OFFLINE** · sec.: DADOS E PERSISTÊNCIA | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **ALTO** | Packs | o aparelho pode encher e travar downloads | crescimento de disco sem controle | - | 17 | `P-130` | 17 e 21 | `VFP` · `TEL` · `AVI` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-130`. Candidato C de dedupe: NÃO fundido com `P-130` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 17. Falta para lançamento: medir o crescimento de disco em aparelho após vários ciclos de download |
| **P-120** | `manifestSha256` é opcional no índice global | `globalManifestService.js:145-147` aceita a ausência do hash de integridade | **PACKS E OFFLINE** | `COMPROVADO PELO CÓDIGO` · `globalManifestService.js:145-147` | E015 (`E015-N11`), artefato 04 | `DECISÃO DE PRODUTO PENDENTE` | alta | **ALTO** | integridade, manifesto | pack corrompido pode ser instalado | pack aceito sem verificação de integridade | 4 | 17 | - | 17 e 21 | `VFP` · `TEL` · `AVI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `E015-N11`. MESMO BLOCO DE CORREÇÃO: `P-121` a `P-126`, `P-132` a `P-134` (contrato único de manifesto) | `COMPROVADO PELO CÓDIGO` | Falta para lançamento: decidir no Lock se a integridade é obrigatória. Nenhuma superfície é servida por pack instalado hoje, o que mantém o risco latente |
| **P-121** | `type` divergente entre os dois schemas | `globalManifestService.js:25` admite `story` enquanto `packManifestService.js:16` admite 4 valores | **PACKS E OFFLINE** | `globalManifestService.js:25` × `packManifestService.js:16` | E015 (`E015-N12`), artefato 04 | `DECISÃO DE PRODUTO PENDENTE` | média | **MÉDIO** | manifesto | pack válido no índice pode ser recusado no aparelho | contratos incompatíveis | 4 | 17 | `P-120` | 17 e 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N12` | `COMPROVADO PELO CÓDIGO` | - |
| **P-122** | Kind `other` existe só no manifesto por pack | `packManifestService.js:17` aceita a categoria que o índice global não representa | **PACKS E OFFLINE** | `packManifestService.js:17` | E015 (`E015-N13`), artefato 04 | `DECISÃO DE PRODUTO PENDENTE` | baixa | **BAIXO** | manifesto | nenhum hoje | categoria não representável no índice | 4 | 17 | `P-121` | 17 e 21 | `NEF` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N13` | `COMPROVADO PELO CÓDIGO` | - |
| **P-123** | `metadata.coverPath` não é verificado contra `files` | `packManifestService.js:109-111` aceita capa declarada que pode não existir no pack | **PACKS E OFFLINE** | `packManifestService.js:109-111` | E015 (`E015-N14`), artefato 04 | `ABERTO` | baixa | **BAIXO** | manifesto | capa ausente após instalar | referência não validada | 4 | 17 | `P-120` | 17 e 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N14` | `COMPROVADO PELO CÓDIGO` | - |
| **P-124** | `metadata.storyId` do pack não é cruzado com o índice | `packManifestService.js:103` valida o formato e não compara com o `storyId` do índice global | **PACKS E OFFLINE** · sec.: DADOS E PERSISTÊNCIA | `packManifestService.js:103` | E015 (`E015-N15`), artefato 04 | `ABERTO` | média | **ALTO** | manifesto | pack pode ser instalado sob a história errada | ausência de verificação cruzada | 4 | 17 | `P-120` | 17 e 21 | `VFP` · `TEL` · `AVI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `E015-N15`. MESMO BLOCO DE CORREÇÃO: `P-132`, `P-133`, `P-134` (mesma classe: campo declarado nos dois lados sem cruzamento) | `COMPROVADO PELO CÓDIGO` | Falta para lançamento: exercitar a instalação de um pack com `storyId` divergente |
| **P-125** | `status` no índice remoto descreve estado que só o aparelho conhece | `globalManifestService.js:26-29` define no servidor um campo cuja verdade é local | **PACKS E OFFLINE** | `globalManifestService.js:26-29` | E015 (`E015-N16`), artefato 04 | `DECISÃO DE PRODUTO PENDENTE` | baixa | **BAIXO** | manifesto | índice pode contradizer o aparelho | campo servidor sobre estado local | 4 | 17 | `P-26` | 17 e 21 | `VFP` · `TEL` · `AVI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N16` | `COMPROVADO PELO CÓDIGO` | - |
| **P-126** | Sem caminho de migração de versão de schema | Ambos os validadores exigem versão 1, então um bump quebra todos os clientes instalados | **PACKS E OFFLINE** | `COMPROVADO PELO CÓDIGO` | E015 (`E015-N17`), artefato 04 | `DECISÃO DE PRODUTO PENDENTE` | média | **ALTO** | manifesto | atualização futura pode parar os downloads | versão rígida sem migração | 4 | 17 | `P-120` | 17 e 21 | `VFP` · `TEL` · `AVI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N17`. NÃO é o mesmo risco de `P-134`: aqui é `schemaVersion`, lá é a versão mínima de app. NÃO É o mesmo risco de `P-140`: aqui o schema versionado é o do manifesto de pack, lá é o do snapshot de entitlement | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: risco latente de atualização futura, não de lançamento. Nenhuma superfície é servida por pack instalado hoje. |
| **P-130** | Packs não entregam colorir | `packDownloadService.js:136` e `:243` pedem `requestedKinds = ['scene']`, então colorir jamais chega por pack | **PACKS E OFFLINE** · sec.: COLORIR COM O BENI | `COMPROVADO PELO CÓDIGO` · `packDownloadService.js:136,243` | E015 (`E015-N23`), artefato 08 | `ABERTO` | média | **ALTO** | packs, Colorir | colorir fica preso ao binário | peso do binário não pode ser reduzido por pack | 4 | 17 | `P-131` | 17 e 21 | `VFP` · `TEL` · `AVI` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N23`. MESMO BLOCO DE CORREÇÃO: `P-116`, `P-131`, `P-36` | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: é decisão de produto no Lock sobre o peso do binário, não critério de lançamento. DECISÃO DA FASE 4B: o lançamento entrega o Colorir com o Beni padronizado nas vinte histórias, com três atividades narrativas por história, sessenta atividades no total. A Criação permanece como piloto canônico e Noé é o primeiro alvo de escala. Como o lançamento passa a exigir Colorir em todas as vinte histórias, o colorir das dezoito premium precisa chegar por pack. Decisão de produto resolvida, ampliação de `requestedKinds` pendente na Fase 17, risco técnico NÃO corrigido. |
| **P-132** | Tamanho total do pack declarado duas vezes sem cruzamento | O índice global exige `p.bytes` inteiro positivo (`globalManifestService.js:130`) e o manifesto do pack aceita `totalBytes` inteiro maior ou igual a zero (`packManifestService.js:76-78`); as duas declarações nunca são comparadas entre si | **PACKS E OFFLINE** | `globalManifestService.js:130` × `packManifestService.js:76-78` · `packDownloadService.js:73` lê só `manifest.totalBytes` | E016, artefato 04 seção 5 divergência 4 | `ABERTO` | não classificada em E015 | **MÉDIO** | manifesto, download | barra de progresso pode mentir sobre o tamanho | tamanho anunciado e tamanho real podem divergir sem detecção | 4 | 17 | `P-120`, `P-124` | 17 e 21 | `VFP` · `TEL` · `AVI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-124`, `P-133`, `P-134`. NÃO fundido com `P-124`: campo diferente e correção diferente | `COMPROVADO PELO CÓDIGO` | ETAPA 4: classificado como NOVO RISCO REAL. CORREÇÃO DE PREMISSA: o artefato 04 comparava `p.bytes` do índice com `file.bytes` do pack, que são campos de níveis diferentes (pack inteiro × arquivo individual) e por isso admitem regras diferentes sem contradição. A divergência real é entre `p.bytes` e `totalBytes` |
| **P-133** | Formato do identificador de pack divergente entre os dois schemas | O índice global aceita qualquer string não vazia como `p.id` (`globalManifestService.js:113`) e o manifesto do pack exige o slug `[a-z0-9_]` (`packManifestService.js:68`) | **PACKS E OFFLINE** | `globalManifestService.js:113` × `packManifestService.js:68` | E016, artefato 04 seção 5 divergência 5 | `ABERTO` | não classificada em E015 | **ALTO** | manifesto, download | a criança espera o download inteiro e a instalação é recusada | bytes consumidos antes da recusa | 4 | 17 | `P-121`, `P-132` | 17 e 21 | `VFP` · `TEL` · `AVI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-121`, `P-132`, `P-134` | `COMPROVADO PELO CÓDIGO` | ETAPA 4: classificado como NOVO RISCO REAL. Falta para lançamento: exercitar um índice com `id` fora do slug e observar o consumo de dados antes da recusa |
| **P-134** | Versão mínima de app declarada com dois nomes diferentes | A mesma semântica aparece como `requiredAppVersion` no índice (`globalManifestService.js:149`) e como `minAppVersion` dentro do pack (`packManifestService.js:73`), sem cruzamento; e o token `minAppVersion` significa coisas diferentes nos dois arquivos, porque em `globalManifestService.js:81` ele é o piso do índice inteiro | **PACKS E OFFLINE** · sec.: DEPENDÊNCIAS E BUILD | `globalManifestService.js:149` e `:81` × `packManifestService.js:73` | E016, artefato 04 seção 5 divergência 6 | `ABERTO` | não classificada em E015 | **ALTO** | manifesto, compatibilidade | pack incompatível pode ser instalado em app antigo | piso de versão silenciosamente derrotado | 4 | 17 | `P-126`, `P-132` | 17 e 21 | `VFP` · `TEL` · `AVI` · `REI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-126`, `P-132`, `P-133`, `P-137`. NÃO é duplicata de `P-126`: lá o campo é `schemaVersion`. ALIAS: `R17` (parcela do schema; a parcela do cliente é `P-137`) | `COMPROVADO PELO CÓDIGO` | ETAPA 4: classificado como NOVO RISCO REAL. O mesmo token com dois significados agrava o risco, porque a leitura do código sugere cruzamento que não existe. Falta para lançamento: exercitar app abaixo do piso declarado |
| **P-137** | `appVersion` congelado no cliente e rebaixamento de packs no primeiro bump | `useStoryPackDownload.js:113` e `packDownloadService.js:136`, `:243` e `:754` usam o literal `1.0.0` e `expo-constants` não existe no projeto; como `packDownloadService.js:349` compara `marker.appVersion` por igualdade estrita, o primeiro bump de versão invalida todo marcador de pack já instalado | **PACKS E OFFLINE** · sec.: DEPENDÊNCIAS E BUILD | `COMPROVADO PELO CÓDIGO` · `useStoryPackDownload.js:113` · `packDownloadService.js:286`, `:349`, `:666` · `expo-constants` ausente de `package.json` e de `src/` | E018 (alias `R17`), `RELATORIO_FECHAMENTO_LP.md:258` | `ABERTO` | alta | **ALTO** | packs, Story Detail, marcador de instalação | a criança perde o conteúdo já baixado depois de atualizar o app | a identidade canônica do pack inclui `appVersion`, então o bump derruba a reutilização de todos os marcadores | 4 | 17 | `P-134`, `P-126` | 17 e 20 | `VFP` · `TEL` · `AVI` · `REI` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `R17` (parcela do cliente). PARCELA JÁ COBERTA: `P-134` (os dois nomes no schema). MESMO BLOCO DE CORREÇÃO: `P-134`, `P-126`, `P-94` | `COMPROVADO PELO CÓDIGO` | E018: parcela residual de `R17`. PRECISÃO sobre o enunciado original: `requiresAppUpdate` não é inerte por falta de consumidor — a cadeia existe de `globalManifestService.js:162-177` até `StoryDetailScreen.js:68`. Inerte é a ENTRADA, o `appVersion` congelado. Falta para lançamento: decidir a política de marcador para que o bump de versão não rebaixe os packs já instalados |
| **P-138** | sha256 de pack lê o arquivo inteiro em base64, sem streaming nem teto | `packIntegrityService.js:52` lê o arquivo inteiro como base64 e `:21-31` o converte em binary string e `Uint8Array` antes de hashear, materializando cerca de três cópias simultâneas do arquivo em memória; o `size` obtido em `:50` só testa existência e nunca limita | **PACKS E OFFLINE** · sec.: DEPENDÊNCIAS E BUILD | `COMPROVADO PELO CÓDIGO` · `packIntegrityService.js:20-31`, `:45-60` | E018 (alias `R20B`), `RELATORIO_FECHAMENTO_LP.md:261` | `ABERTO` | média | **ALTO** | instalação e verificação de packs | o download pode falhar ou derrubar o app em aparelho de pouca memória | pico de memória proporcional ao maior asset, sem teto e sem hash incremental | - | 17 | `P-120`, `P-128` | 19 e 21 | `VFP` · `AND` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `R20B`. RELAÇÃO INVERSA com `P-120`: lá se pede mais verificação, aqui se precifica a verificação que já existe. MESMO BLOCO DE CORREÇÃO: `P-120`, `P-116` | `COMPROVADO PELO CÓDIGO` | E018: risco novo real. Nenhum dos 134 códigos anteriores menciona memória, streaming ou custo do cálculo de integridade; a busca por memória, teto, streaming e base64 na matriz anterior retorna zero. A prova só fecha em Android de baixa memória, o que o prende a `P-128`. Falta para lançamento: medir o pico de memória no maior asset em Android real e decidir entre teto por tamanho e hash incremental |

### JOGOS — 14 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-55** | Monte a Cena V2 grava conclusão real sob cena errada | `usePuzzleController.js:307-308` chama `saveCompletion` real e `MonteACenaGameV2Screen.js:40` cai em `MONTE_A_CENA_CATALOG[0]`, sempre `creation_scene_01`; a guarda `isPremium` é inócua sob Modo Criador e a rota não é navegada por ninguém | **JOGOS** · sec.: DADOS E PERSISTÊNCIA | `usePuzzleController.js:307-308` · `monteACenaCatalog.js:100` · rota não navegada | E013 | `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` | **P1 latente** | **CRÍTICO** | Monte a Cena, Galeria | conclusão gravada sob a cena errada corromperia a galeria | escrita canônica a partir de protótipo | - | 12A | - | 19 e 21 | `VFP` · `TEL` · `GRA` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-56`, `P-57` | `COMPROVADO PELO CÓDIGO` | Severidade NÃO rebaixada por estar atrás de um gate, conforme ETAPA 5. REGISTRO DA FASE 4C: conclusão registrada nunca é revogada e a reconciliação sempre favorece a criança, portanto conclusão real não pode ser gravada sob identificador errado. Decisão de produto resolvida quanto ao princípio, correção pendente na Fase 12A, risco técnico NÃO corrigido. Falta para lançamento: provar que a rota segue inalcançável no build de release e que a Fase 12A não a liga sem corrigir |
| **P-56** | `catch` fail-open no consumo de rodada | `MonteACenaTableGameScreen.js:456` e `:467` devolvem `{ ok: true, remaining: Infinity, premium: true }` no `catch`, então erro de storage libera rodada infinita | **JOGOS** · sec.: PLANO E ENTITLEMENT | `MonteACenaTableGameScreen.js:456`, `:467` | E013 | `ABERTO` | **P1** | **CRÍTICO** | Monte a Cena | limite do plano deixa de valer após erro | entitlement fail-open | - | 12A | `P-24` | 18 e 21 | `VFP` · `TEL` · `GRA` | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-46`, `P-57` | `COMPROVADO PELO CÓDIGO` | PRECISÃO E018: viola a metade *fail-closed* da decisão nº 1 e somente ela. NÃO viola a metade do writer único: `@ptf_entitlement_v1` tem exatamente um writer, `saveEntitlement` em `entitlementService.js:101`, e este `catch` não escreve nessa chave. O defeito é o `catch` do consumo de rodada, que concede rodada infinita e premium em memória depois de um erro. Permanece ABERTO, CRÍTICO, fase 12A e BLOQUEIA LANÇAMENTO. Critérios 3 e 8 de lançamento DECISÃO DA FASE 4C: nenhuma falha de armazenamento pode conceder rodada, recompensa, premium ou desbloqueio como alternativa. Em falha, a criança recebe aviso afetivo e nova tentativa, e a rodada só é consumida quando houver resultado terminal válido. Decisão de produto resolvida, correção pendente na Fase 12A, risco técnico NÃO corrigido. |
| **P-57** | Rodada fabricada na retomada | `:451` monta `remaining: premium ? Infinity : 1` sem ler storage e `:497` oferece Montar novamente com zero rodadas reais | **JOGOS** · sec.: PLANO E ENTITLEMENT | `MonteACenaTableGameScreen.js:451`, `:497` | E013 | `ABERTO` | **P2** | **ALTO** | Monte a Cena | oferta de jogar que o sistema nega | estado fabricado sem fonte | - | 12A | `P-56` | 18 e 21 | `VFP` · `TEL` · `GRA` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-56`, `P-58` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: Monte a Cena mantém retomada de sessão, a rodada é consumida uma única vez e retomar a mesma sessão não consome nova rodada. A possibilidade de repetir consulta o contador real e nunca fabrica rodada restante nem libera rodada ilimitada quando o armazenamento falhar. Decisão de produto resolvida, correção pendente na Fase 12A, risco técnico NÃO corrigido, validação física ainda exigida. Falta para lançamento: reproduzir a retomada com zero rodadas em plano grátis |
| **P-58** | Recusa silenciosa no `handleReplay` | `MonteACenaTableGameScreen.js:468` recusa sem qualquer retorno: a criança toca e nada acontece | **JOGOS** · sec.: UI E RESPONSIVIDADE | `MonteACenaTableGameScreen.js:468` | E013 | `ABERTO` | **P2** | **MÉDIO** | Monte a Cena | toque sem resposta nem explicação | recusa sem estado de interface | - | 12A | `P-57` | 21 | `VFP` · `TEL` · `GRA` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-23`, `P-57` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: nenhuma tela pode recusar em silêncio. Depois do teto diário, nenhuma superfície promete nova estrelinha nem deixa ação habilitada sem resposta, e a criança recebe explicação afetiva com destino claro. Decisão de produto resolvida, correção pendente na Fase 12A, risco técnico NÃO corrigido. |
| **P-61** | Sugestão diária do Brincar não vira a meia-noite | `BrincarScreen.js:190-195` calcula `dayKey` dentro de um `useMemo` com dependência apenas `[childId]` | **JOGOS** | `BrincarScreen.js:190-195` | E013 | `ABERTO` | **P2** | **MÉDIO** | Brincar | a sugestão do dia não muda de dia | dependência de memo incorreta | - | 12A | `P-02` | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-40` (mesma classe: chave de dia) | `COMPROVADO PELO CÓDIGO` | - |
| **P-62** | `DEFAULT_PROFILE` sem campo `id` | `ProfileContext.js:9-13` não define `id`, então `BrincarScreen.js:191` chaveia a sugestão pelo `avatarId` e trocar de avatar troca a sugestão | **JOGOS** · sec.: DADOS E PERSISTÊNCIA | `ProfileContext.js:9-13` × `BrincarScreen.js:191` | E013 | `ABERTO` | **P3** | **BAIXO** | Brincar, Perfil | trocar o avatar muda o que é sugerido | identidade de perfil ausente | - | 12A | `P-61` | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-61` | `COMPROVADO PELO CÓDIGO` | - |
| **P-69** | Palavrinhas sem persistência de resultado | `brincarStatsService.js:408-419` guarda só `day` e `starsToday`; o próprio docblock admite que recordes ficam para depois do MVP | **JOGOS** · sec.: DADOS E PERSISTÊNCIA | `brincarStatsService.js:408-419` | E013 | `ABERTO` | **P2** | **MÉDIO** | Palavrinhas | nada do que a criança faz é lembrado | persistência parcial admitida | - | 12A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-70`, `P-86` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: Palavrinhas do Beni concede estrelinha somente depois da persistência confirmada e passa a ter conquistas próprias, portanto o resultado da partida precisa ser persistido. Decisão de produto resolvida, persistência pendente na Fase 12A, risco técnico NÃO corrigido. |
| **P-71** | Escrita de resultado não aguardada em Pares e Palavrinhas | `ParesDoBeniScreen.js:437` e `:463` chamam `salvarPartida()` sem `await` e `PalavrinhasDoBeniScreen.js:360-371` faz o mesmo: a interface precede a persistência | **JOGOS** · sec.: DADOS E PERSISTÊNCIA | `ParesDoBeniScreen.js:437`, `:463` · `PalavrinhasDoBeniScreen.js:360-371` | E013 | `ABERTO` | **P2** | **ALTO** | Pares, Palavrinhas | resultado comemorado pode não ter sido salvo | escrita não aguardada | - | 12A | `P-46` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-13`, `P-46` (mesma classe, módulos distintos) | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: a estrelinha é anunciada somente depois da persistência confirmada, com estado Guardando durante a escrita e nova tentativa em caso de falha. Uma estrelinha por partida válida concluída, com teto diário compartilhado de duas estrelinhas no Brincar. Decisão de produto resolvida, correção da escrita não aguardada pendente na Fase 12A, risco técnico NÃO corrigido, validação física ainda exigida. Falta para lançamento: encerrar o app imediatamente após a partida e verificar se o resultado sobreviveu |
| **P-72** | `dicaAuto` e `dicaMs` sem consumidor | `ovelhaGameService.js:66-76` define a dica automática do modo Fácil, que não existe em runtime | **JOGOS** | `ovelhaGameService.js:66-76` | E013 | `IMPLEMENTADO SEM CONSUMIDOR` | **P3** | **BAIXO** | Ovelhinha | o apoio prometido no modo fácil não acontece | configuração sem leitor | - | 12A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-99`, `P-106` | `COMPROVADO PELO CÓDIGO` | - |
| **P-75** | Docblock nega cronômetro punitivo que existe | `ovelhaGameService.js:58` afirma sem cronômetro punitivo, contradito por `:68` (`tempoLimiteMs: 45000`) e `:71` (`tempoGlobalMs: 150000` e Zero antes das 10 igual a DERROTA) | **JOGOS** · sec.: DOCUMENTAÇÃO | `ovelhaGameService.js:58` × `:68` e `:71` | E013 | `DECISÃO DE PRODUTO PENDENTE` | **P2** | **MÉDIO** | Ovelhinha | o jogo pune por tempo, ao contrário do declarado | design declarado divergente do implementado | 4 | 12A | - | 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-76` | `COMPROVADO PELO CÓDIGO` | Punição por tempo em jogo infantil é decisão de produto, não apenas de código |
| **P-76** | `underwater_01` declarada desabilitada mas ativa | `ovelhaAssets.js:6-7,40` declara a cena desabilitada, enquanto `ovelhaScenes.js:189` a mantém em `OVELHA_SCENES` em todos os modos e `:188` diz 5 jogáveis | **JOGOS** · sec.: ASSETS | `ovelhaAssets.js:6-7,40` × `ovelhaScenes.js:188-189` | E013 | `DECISÃO DE PRODUTO PENDENTE` | **P2** | **MÉDIO** | Ovelhinha | cena tida como retirada continua aparecendo | duas fontes para o conjunto de cenas | 4 | 12A | `P-75` | 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-75` | `COMPROVADO PELO CÓDIGO` | - |
| **P-77** | Margem de 0.01 entre piso e menor y autoral | `ovelhaGameService.js:326` define `FRONT_Y_MIN = 0.42`, aplicado em `:333`, contra o menor y autoral `0.43` em `ovelhaScenes.js:82`: um spot novo abaixo derruba a cena inteira | **JOGOS** | `ovelhaGameService.js:326`, `:333` × `ovelhaScenes.js:82` | E013 | `ABERTO` | **P2** | **MÉDIO** | Ovelhinha | risco de cena inteira invalidada ao acrescentar conteúdo | margem de segurança insuficiente | - | 12A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | Risco latente de autoria: só se manifesta ao acrescentar spots |
| **P-81** | `esgotarTempo` do Palavrinhas não limpa os dois modais | `PalavrinhasDoBeniScreen.js:525-536` não limpa `pausaModal` nem `pausaPedago`, enquanto `:548` (encerramento manual) limpa | **JOGOS** · sec.: UI E RESPONSIVIDADE | `PalavrinhasDoBeniScreen.js:525-536` × `:548` | E013 | `ABERTO` | **P2** | **MÉDIO** | Palavrinhas, overlays | dois modais podem aparecer sobrepostos | limpeza de estado assimétrica | - | 12A | `P-16` | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | CAUSADO POR `P-16` (ausência de fila global). O mesmo fato consta da evidência de `P-16`, registrado para não ser contado duas vezes | `COMPROVADO PELO CÓDIGO` | Única arbitragem local de overlay do app, em `PalavrinhasDoBeniScreen.js:394` |
| **P-86** | Nenhum dos quatro jogos tem retomada | Pares e Ovelhinha tem zero ocorrências de sessão ou retomada, Palavrinhas 1 irrelevante e só Monte a Cena tem `getRawSession` (`:445-451`): encerrar o app perde a partida em 3 de 4 | **JOGOS** · sec.: DADOS E PERSISTÊNCIA | prova negativa em Pares e Ovelhinha · `:445-451` | E013 | `ABERTO` | **P2** | **MÉDIO** | Brincar (4 jogos) | partida perdida ao sair do app | sem sessão persistida | - | 12A | `P-69`, `P-71` | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-69` | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: o corpus marcava Sim para lançamento. Perder uma partida curta e casual ao encerrar o app é comportamento normal em celular e não atende ao critério 4 (perda de criação da criança). Nenhum desenho, nem estrela já concedida, é perdido DECISÃO DA FASE 4C: o contrato de retomada é diferente por duração. Pares do Beni, Palavrinhas do Beni e Cadê a Ovelhinha não precisam persistir partida incompleta no lançamento, e a rodada só é consumida quando houver resultado terminal válido: sair antes do resultado não consome rodada e nenhuma estrelinha é concedida sem conclusão válida. Monte a Cena mantém retomada de sessão sem consumo duplicado. Decisão de produto resolvida, implementação do consumo por resultado terminal pendente na Fase 12A, risco técnico NÃO corrigido. |

### CRIAR LIVRE — 2 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-63** | Galeria mostra N de 0 e divide por zero | `AtelierGalleryScreen.js:113` imprime N de 0 artes salvas e `:116` calcula `Math.min(n/0,1)`, que é `NaN` na barra; o cabeçalho é incondicional, sem guarda de plano | **CRIAR LIVRE** · sec.: PLANO E ENTITLEMENT | `AtelierGalleryScreen.js:113` e `:116` | E013 | `ABERTO` | **P1** | **CRÍTICO** | Galeria | a criança vê zero como total e uma barra quebrada | divisão por zero determinística | 4 | 12A | `P-64`, `P-65` | 18 e 21 | `VFP` · `TEL` · `GRA` | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-64`, `P-65` (raiz comum `atelierStorage.js:10` = 0). NÃO fundidos: três arquivos e um bug de `NaN` independente | `COMPROVADO PELO CÓDIGO` | O `NaN` é determinístico para 100% dos usuários do plano grátis e independe da decisão de limite: por isso bloqueia lançamento. DECISÃO DA FASE 4A: o limite de salvamento do Criar Livre no plano grátis é zero, confirmado. A Galeria precisa distinguir as duas políticas: o Criar Livre não persiste no plano grátis, enquanto o Colorir com o Beni salva e permite revisitar a obra real da criança em todas as histórias a que ela tenha acesso, inclusive no plano grátis. O NaN e o cabeçalho incondicional continuam defeitos abertos, pendentes na Fase 12A. DECISÃO DA FASE 4C: no plano grátis a galeria do Criar Livre não mostra contador, não mostra barra e não exibe a expressão de zero em zero, apresentando estado vazio afetivo, com explicação comercial somente depois do gate parental. No Plano Família mostra a contagem de artes salvas, sem denominador fixo e sem barra de limite quando o salvamento for ilimitado. A regra de zero salvamentos no Criar Livre grátis não é reaberta. Decisão de produto resolvida, correção da divisão por zero e da interface pendente na Fase 12A, risco técnico NÃO corrigido. |
| **P-68** | Fluxo com `mission` nunca pergunta o nome da arte | `AtelierCanvasScreen.js:276` pula a pergunta do nome quando há missão | **CRIAR LIVRE** | `AtelierCanvasScreen.js:276` | E013 | `ABERTO` | **P3** | **BAIXO** | Canvas | a arte fica sem nome escolhido pela criança | ramo de fluxo divergente | - | 12A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | REGISTRO DA FASE 4C: o encerramento das atividades do Criar Livre segue o mesmo sistema padronizado de slots e modos aprovado para histórias e jogos, sem caminho que termine sem saída. Decisão de produto resolvida quanto ao padrão, correção do fluxo pendente na Fase 12A, risco técnico NÃO corrigido. |

### COLORIR COM O BENI — 5 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-13** | `setItem` sem `await` no convite do C60 | `coloring60MilestoneInviteSeen.js:61` grava sem aguardar; mitigado pela guarda de sessão `:34` e `:60` | **COLORIR COM O BENI** · sec.: DADOS E PERSISTÊNCIA | `coloring60MilestoneInviteSeen.js:61` | E010, confirmado por E012 | `ABERTO` | baixa | **BAIXO** | Colorir | convite pode reaparecer após kill imediato | escrita não aguardada | - | 9 | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-71` (mesma classe de defeito, módulos distintos) | `COMPROVADO PELO CÓDIGO` | Mitigado, não corrigido: a guarda de sessão reduz a janela REGISTRO DA FASE 4C: toda escrita de progresso, conclusão ou recompensa passa a ser aguardada e confirmada antes de qualquer anúncio, com estado Guardando durante a escrita. Decisão de produto resolvida, correção da escrita não aguardada pendente na Fase 9, risco técnico NÃO corrigido. |
| **P-14** | `IN_PROGRESS` inalcançável no Colorir | O estado não tem produtor; `coloring60Journey.js:340-342` declara por escrito e os 2 chamadores não passam o mapa | **COLORIR COM O BENI** | `coloring60Journey.js:340-342` | E010, confirmado por E012 | `IMPLEMENTADO SEM CONSUMIDOR` | baixa | **BAIXO** | Colorir | estado intermediário nunca é mostrado | estado morto na máquina | - | 9 | - | 21 | `VFP` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-50` | `COMPROVADO PELO CÓDIGO` | Confirmado por leitura do próprio docblock do módulo REGISTRO DA FASE 4C: o Colorir com o Beni passa a ter dois estados úteis, atividade iniciada e atividade concluída, e a conclusão de pelo menos uma atividade é requisito condicional da história, o que retira o caráter decorativo do estado intermediário. Decisão de produto resolvida, implementação pendente na Fase 9, risco técnico NÃO corrigido. |
| **P-18** | JRN C60 01: `unlocked={isCompleted}` no Colorir | `StoryDetailScreen.js:573` avalia `unlocked !== true` para `LOCKED` antes do `doneMap`, então cards concluídos ficam `disabled`; reconfirmada nas 7 conclusões | **COLORIR COM O BENI** · sec.: JORNADA E PROGRESSO | `StoryDetailScreen.js:573` · `v5:512` classificação A confirmada fisicamente | E010, E011, reconfirmado por E012 | `ABERTO` | baixa (E010) e **P1** (v5:512, árbitro) | **ALTO** | Story Detail, Colorir | atividade concluída aparece bloqueada para a criança | ordem de avaliação de predicados invertida | - | 9 | - | 11 e 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `JRN C60 01` (v5:512) | `COMPROVADO PELO CÓDIGO E FISICAMENTE` | DIVERGÊNCIA RESOLVIDA: corpus dizia severidade baixa, o árbitro `v5:512` diz **P1** com saída da Fase 9. Prevalece o árbitro (precedência 3). DECISÃO DA FASE 4C: o Colorir com o Beni não é liberado por conclusão da história, porque ele integra o caminho de conclusão quando estiver disponível. Exigir história concluída para abrir o Colorir cria dependência circular com a fórmula canônica. Decisão de produto resolvida, correção pendente na Fase 9, risco técnico NÃO corrigido, validação física futura. Falta para lançamento: confirmar se a correção entra na saída da Fase 9 |
| **P-36** | Assimetria oferta e exigência do C60 | `storyColoringAvailability.js:69-74` é agnóstico de história, mas piloto, detalhe e assets estão presos a `creation`, então uma história nova exigiria colorir sem entrada de interface | **COLORIR COM O BENI** · sec.: CONTEÚDO E TEOLOGIA | `storyColoringAvailability.js:69-74` × `coloring60Pilot.js:44-45` | E012 | `ABERTO` | alta | **ALTO** | Colorir | atividade exigida sem caminho para fazê-la | contrato de disponibilidade divergente da implementação | 4 | 9 | `P-17` | 13 e 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `E015-N26` (duplicado). MESMO BLOCO DE CORREÇÃO: `P-17`, `P-130` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4B: o lançamento entrega o Colorir com o Beni padronizado nas vinte histórias, com três atividades narrativas por história, sessenta atividades no total. A Criação permanece como piloto canônico e Noé é o primeiro alvo de escala. Cada atividade respeita os mesmos contratos técnicos, visuais, de persistência, conclusão e revisitação aprovados no piloto. Assets legados não são aceitos automaticamente como arte final: qualquer arte antiga candidata a reaproveitamento passa por perícia técnica e aprovação visual. Nenhuma história é considerada pronta para lançar sem o conjunto aprovado de atividades previsto para ela. A escala é implementada na Fase 8A e nas fases de produção de conteúdo correspondentes. Nenhuma imagem foi produzida ou alterada na Fase 4B. Decisão de produto resolvida, implementação inteiramente pendente, risco técnico NÃO corrigido: hoje existe uma história de vinte com o modelo novo, três atividades de sessenta. DECISÃO DA FASE 4C: a exigência do Colorir com o Beni é condicional de forma permanente. Quando houver atividades disponíveis para a história, concluir pelo menos uma das três é requisito de conclusão; quando não houver, a ausência nunca bloqueia a jornada. A emenda P3J de colorir condicional fica formalmente ratificada. Com a escala completa das sessenta atividades, o resultado natural é uma atividade obrigatória em cada uma das vinte histórias. Decisão de produto resolvida, escala pendente na Fase 9 e nas fases de produção, risco técnico NÃO corrigido. Falta para lançamento: entregar a entrada de interface do Colorir em todas as histórias que passam a exigi-lo e confirmar em aparelho que nenhuma história exige atividade sem caminho para realizá-la |
| **P-50** | `markStoryColoringActivityDone` sem consumidor | `coloringActivityService.js:28` nunca é chamado, então `@ptf_coloring_done` jamais é escrita, mas os leitores estão vivos | **COLORIR COM O BENI** · sec.: DADOS E PERSISTÊNCIA | `coloringActivityService.js:28` × `ProgressContext.js:198` | E012 | `IMPLEMENTADO SEM CONSUMIDOR` | baixa | **MÉDIO** | Colorir | atividade concluída não registra conclusão | escritor ausente com leitores vivos | - | 9 | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-08`, `P-14`, `P-51` | `COMPROVADO PELO CÓDIGO` | REGISTRO DA FASE 4B: com o Colorir com o Beni padronizado nas vinte histórias e sessenta atividades no total, o escritor ausente deixa de ser caso isolado do piloto e passa a alcançar toda a coleção. Escala decidida, correção do escritor pendente. DECISÃO DA FASE 4C: a conclusão de atividade do Colorir com o Beni integra a fórmula canônica quando o Colorir estiver disponível, portanto o registro de conclusão precisa ter consumidor real e persistência confirmada antes de qualquer anúncio. Decisão de produto resolvida, ligação do consumidor pendente na Fase 9, risco técnico NÃO corrigido. Falta para lançamento: confirmar se a conclusão do Colorir aparece corretamente após a Fase 9 |

### MEU LIVRO — 4 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-37** | Copy do Livro promete pintura removida | `StoryDetailScreen.js:534` e `PostStoryHubScreen.js:122` prometem a pintura da criança no livro, removida no P3J | **MEU LIVRO** | `StoryDetailScreen.js:534` · `PostStoryHubScreen.js:122` | E012 | `ABERTO` | média | **MÉDIO** | Livrinho | promessa visível não cumprida | copy dessincronizada da capacidade | 4 | 10 | `P-49` | 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-49` | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: promessa editorial não atendida é critério 12, e a decisão pertence ao Lock. Decidido o Lock, ou a copy muda ou a capacidade volta na Fase 10. REGISTRO DA FASE 4B: a escala do Colorir com o Beni para as vinte histórias muda a premissa desta copy, porque a pintura da criança passará a existir em toda história. A escolha entre mudar a copy e devolver a capacidade continua NÃO decidida. |
| **P-38** | Livro sem distinção abrir, ler e terminar | Abrir equivale a concluir com um toque; não há progresso por página nem retomada (`:401`, `:407`, `:500`, `:340`) | **MEU LIVRO** | `StoryBookScreen.js:401`, `:407`, `:500`, `:340` | E012 | `ABERTO` | média | **MÉDIO** | Livrinho | leitura marcada como feita sem ter lido | sem estado de leitura | 4 | 10 | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-45`, `P-86` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: o Livrinho passa a ter dois estados distintos, iniciado ou aberto e concluído ao alcançar a última página. Abrir o Livrinho não equivale a concluí-lo. A conclusão pode conceder recompensa própria uma única vez, mas não compõe a conclusão obrigatória da história. Registros antigos de livro aberto não são apagados nem causam regressão de progresso. Decisão de produto resolvida, implementação dos dois estados pendente na Fase 10, risco técnico NÃO corrigido. |
| **P-45** | Nomenclatura tripla visível do Livro | Três nomes coexistem na experiência e o nome futuro ainda não foi decidido | **MEU LIVRO** · sec.: CONTEÚDO E TEOLOGIA | E012 seção 10 | E012 | `DECISÃO DE PRODUTO PENDENTE` | média | **MÉDIO** | Livrinho | a mesma coisa tem três nomes | vocabulário não congelado | 4 | 10 | - | 16 e 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-67` (vocabulário infantil aprovado) | `COMPROVADO PELO CÓDIGO` | Decisão de nomenclatura pertence ao Product Lock |
| **P-49** | Arte da criança no livro viva no código e morta no runtime | `storyBookPagesService` e `getBestStoryBookVisual` e `getBookPageImageSource` existem sem caminho de execução | **MEU LIVRO** · sec.: COLORIR COM O BENI | verificado pelo integrador | E012 | `IMPLEMENTADO SEM CONSUMIDOR` | média | **MÉDIO** | Livrinho | capacidade prometida não acontece | código vivo sem consumidor | 4 | 10 | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-37` | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: código sem consumidor não produz falha visível; a decisão de religar ou remover pertence ao Lock. DECISÃO DA FASE 4C: o Livrinho permanece como experiência própria, revisável e recompensável, fora da fórmula obrigatória de conclusão, e a arte da criança dentro do livro segue o mesmo contrato de revisitação sóbria. Decisão de produto resolvida quanto ao papel do Livrinho, destino do código sem consumidor pendente na Fase 10, risco técnico NÃO corrigido. |

### CULTINHO — 2 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-41** | Cultinho não idempotente | `familyWorshipService.js:55` incrementa sem dedupe por `lastDate` | **CULTINHO** · sec.: DADOS E PERSISTÊNCIA | `familyWorshipService.js:55` | E012 | `ABERTO` | média | **MÉDIO** | Cultinho | contagem de cultinhos inflada | escrita não idempotente | - | 12B | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-40`, `P-54` | `COMPROVADO PELO CÓDIGO` | - |
| **P-54** | Cultinho sem rotação mostra sempre A Criação | `familyWorshipService.js:75-77` usa a vitrine como história da semana e é chamado duas vezes (`CultinhoEmCasaScreen.js:47-48`) | **CULTINHO** · sec.: CONTEÚDO E TEOLOGIA | `familyWorshipService.js:75-77` | E012 | `ABERTO` | média | **MÉDIO** | Cultinho | a família recebe sempre a mesma história | sem rotação editorial | - | 12B | `P-02` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N09` (duplicado). MESMO BLOCO DE CORREÇÃO: `P-02`, `P-44` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4B: Cultinho e Meu Momento passam a recomendar apenas conteúdo autorizado. No plano grátis, somente A Criação, Noé e demais atividades gratuitas disponíveis; no Plano Família, todas as histórias autorizadas. Não podem recomendar conteúdo protegido para depois apresentar bloqueio ou paywall. Perdido o direito de acesso, o conteúdo protegido sai das recomendações na próxima atualização controlada. Com cache expirado e sem rede, aplica-se o plano grátis. Não havendo conteúdo novo acessível, recomendar revisitação de conteúdo gratuito. Nenhuma recomendação pode resultar em toque sem resposta. Decisão de produto resolvida, implementação do filtro pendente. |

### MEU MOMENTO — 4 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-40** | Chave diária em UTC vira as 21h | `postStoryStorage.js:6` usa dia de época UTC, então em UTC-3 o dia vira as 21h e cabem duas estrelas no mesmo dia civil | **MEU MOMENTO** · sec.: DADOS E PERSISTÊNCIA | `postStoryStorage.js:6` · `LumiMomentScreen.js:18` | E012, ampliado por `E015-N08` | `ABERTO` | média | **MÉDIO** | Meu Momento | duas estrelas no mesmo dia ou nenhuma | chave diária em fuso errado | - | 12B | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | AMPLIA: `E015-N08` acrescenta a segunda fonte `LumiMomentScreen.js:18` | `COMPROVADO PELO CÓDIGO` | - |
| **P-43** | Repita com Beni sem áudio nem confirmação | `LumiMomentScreen.js:96-99` pede repetição em voz alta sem áudio, síntese, tempo ou confirmação | **MEU MOMENTO** · sec.: ÁUDIO E HÁPTICOS | `LumiMomentScreen.js:96-99` | E012 | `ABERTO` | média | **MÉDIO** | Meu Momento | instrução sem apoio sonoro nem retorno | atividade sem contrato de conclusão | 4 | 12B | `P-15` | 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-15` | `COMPROVADO PELO CÓDIGO` | - |
| **P-44** | Home e Meu Momento divergem em 5 dos 7 dias | `HomeScreen.js:39-47` contra `lumiReflections.js:93-101`; o teaser rotulado versículo exibe texto que não é versículo | **MEU MOMENTO** · sec.: CONTEÚDO E TEOLOGIA | `HomeScreen.js:39-47` × `lumiReflections.js:93-101` | E012 | `ABERTO` | média | **MÉDIO** | Home, Meu Momento | duas telas afirmam coisas diferentes no mesmo dia | duas fontes para o mesmo conteúdo | 4 | 12B | `P-02` | 5 e 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-02`, `P-54` | `COMPROVADO PELO CÓDIGO` | Rótulo teológico incorreto exige revisão na Fase 5. Falta para lançamento: a revisão teológica da Fase 5 sobre o teaser rotulado versículo que não é versículo, e a definição da fonte canônica no Lock. |
| **P-53** | Órfãos do domínio Meu Momento e guias | `LUMI_REFLECTIONS` legada é vazia, `LUMI_FEELINGS`, `LUMI_LEARNED`, `LUMI_PRAYERS`, `LEARNING_VERSES` e 5 wrappers em `components/lumi`; ampliado com `ATELIER_GUIDE` e 5 áudios `guide.atelier` órfãos | **MEU MOMENTO** · sec.: ONBOARDING E GUIAS | `lumiReflections.js:1-91` · `src/components/lumi/*` | E012, ampliado por E013 | `IMPLEMENTADO SEM CONSUMIDOR` | baixa | **INFORMATIVO** | Meu Momento, guias | nenhum | superfície morta aumenta o binário e confunde | - | 12B | - | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-34`, `P-103` (inventário único de guias órfãos) | `COMPROVADO PELO CÓDIGO` | O trecho `ATELIER_GUIDE` sem consumidor também consta de `P-34`: é o MESMO fato, registrado para não ser contado duas vezes |

### ESTRELINHAS E CONQUISTAS — 2 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-39** | `totalBonusStars` sem consumidor de interface | `ProgressContext.js:140` é o único hit contra `rewardService.js:26`; a estrela do Meu Momento é gravada e nunca exibida, e o bônus não destrava avatares | **ESTRELINHAS E CONQUISTAS** · sec.: MEU MOMENTO | `ProgressContext.js:140` × `rewardService.js:26` | E012, confirmado por E013 | `IMPLEMENTADO SEM CONSUMIDOR` | alta | **ALTO** | Meu Momento, Estrelinhas | ganha estrela que nunca aparece | contador separado sem leitura | - | 11 | - | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-19`, `P-40` | `COMPROVADO PELO CÓDIGO` | REBAIXADO na ETAPA 11: nenhum dos 12 critérios se aplica. Estrela de bônus não é criação da criança e nada é perdido; o defeito é de exibição. DECISÃO DA FASE 4C: o acumulador invisível e o contador visível de estrelinhas passam a ser reconciliados em uma fonte canônica única, sem perda de nenhuma estrela na migração. Estrelinhas nunca são gastas, não autorizam conteúdo premium e podem liberar cosméticos sem consumo; avatares adicionais continuam exclusivos do Plano Família e, dentro dele, o marco de estrelinhas pode liberar o avatar. Decisão de produto resolvida, reconciliação pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-70** | Só Pares tem conquistas | `brincarStatsService.js:421-436` devolve só flags `pares`, então Palavrinhas, Ovelhinha e Monte a Cena não tem nenhuma conquista em `achievements.js:442-497` | **ESTRELINHAS E CONQUISTAS** · sec.: JOGOS | `brincarStatsService.js:421-436` × `achievements.js:442-497` | E013 | `ABERTO` | **P2** | **MÉDIO** | Brincar, conquistas | três jogos nunca dão conquista | contexto de conquista incompleto | 4 | 11 | `P-69` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-39`, `P-82` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 12A para 11, porque as conquistas são definidas na Fase 11; a Fase 12A entra como dependência DECISÃO DA FASE 4C: os quatro jogos do Brincar têm conquistas no lançamento, com critérios próprios de cada jogo, idempotentes, celebradas dentro do próprio jogo, visíveis na aba Estrelinhas, sem autorizar conteúdo premium e sem recompensa infinita. A quantidade e os textos exatos são produzidos na Fase 11. Decisão de produto resolvida, implementação pendente na Fase 11, risco técnico NÃO corrigido. |

### PRESENTES E RECOMPENSAS — 2 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-82** | Três serviços de recompensa sem consumidor de runtime | `certificateService`, `shareCardService` e `weeklyReportService` aparecem só dentro dos próprios arquivos: zero recompensa imprimível ou compartilhável no app | **PRESENTES E RECOMPENSAS** | prova negativa por grep em `src/` | E013 | `IMPLEMENTADO SEM CONSUMIDOR` | **P2** | **MÉDIO** | recompensas | recompensa prometida não existe | três serviços vivos sem chamador | 4 | 11 | `P-39` | 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-39`, `P-70` | `COMPROVADO PELO CÓDIGO` | Decisão do Lock: o v1 entrega recompensa imprimível ou compartilhável DECISÃO DA FASE 4C: as recompensas de conclusão seguem o sistema padronizado de encerramento e aparecem como elementos secundários, nunca como ações concorrentes da ação principal. Recompensa concedida uma única vez não se repete na revisitação. Decisão de produto resolvida, destino dos serviços sem consumidor pendente na Fase 11, risco técnico NÃO corrigido. |
| **P-83** | Baú não calcula `hiddenLocked` na aba todas | `BeniChestScreen.js:156-160` não calcula o contador no ramo `todas`, então o botão Ver cartinhas escondidas nunca renderiza nessa aba; o conteúdo segue alcançável por outra aba | **PRESENTES E RECOMPENSAS** · sec.: UI E RESPONSIVIDADE | `BeniChestScreen.js:156-160` × `:247` | E013 | `ABERTO` | **P2** | **BAIXO** | Baú do Beni | caminho some em uma aba, mas não há perda de conteúdo | ramo sem cálculo | - | 12A | - | 21 | `VFP` · `TEL` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4C: o Baú é elemento secundário do encerramento e nunca disputa a ação principal, e nenhum estado bloqueado pode aparecer de forma inconsistente entre abas. Decisão de produto resolvida quanto ao papel do Baú, correção do cálculo pendente na Fase 12A, risco técnico NÃO corrigido. |

### PLANO E ENTITLEMENT — 6 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-24** | Plano Família sem caminho de compra | `planConfig.js:40-56` traz `monthly` e `annual` em `comingSoon` com `productIdPlaceholder` vazio e `isPurchaseEnabled: false`, com 18 de 20 histórias premium | **PLANO E ENTITLEMENT** | `planConfig.js:40-56` · `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` | E011, reconfirmado por E012, evidência direta em E013 | `ABERTO` | alta | **CRÍTICO** | Story Detail, Área dos Pais, Home | promessa de conteúdo sem forma de obtê-lo | monetização inexistente | 4 | 18 | `P-05`, `P-93` | 18 e 21 | `VFP` · `TEL` · `GRA` · `FAM` | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-93`, `P-129`. Candidato B de dedupe: NÃO fundido | `COMPROVADO PELO CÓDIGO` | Critério 3 de lançamento: compra e entitlement quebrados. Bloqueador confirmado. DECISÃO DA FASE 4A: nome público único Plano Família; produtos mensal e anual, sem trimestral e sem vitalício; anual com economia aproximada de 25% sobre doze mensalidades; teste grátis de 7 dias apenas no anual. Entitlement e offering do RevenueCat nomeados familia; identificadores de produto com.valentedev.pequenostracosdefe.family.monthly e com.valentedev.pequenostracosdefe.family.annual, imutáveis após publicação. Restauração exposta na Área dos Pais e no paywall pós-gate parental, nunca na superfície infantil. O valor nominal em reais é parâmetro comercial pré-implementação, não pendência do contrato técnico. Decisão de produto resolvida; a criação dos produtos nas lojas, a configuração do RevenueCat e a implementação da compra continuam pendentes na Fase 18, e por isso a classificação de lançamento permanece inalterada. |
| **P-64** | Área dos Pais promete 3 artes salvas contra limite real 0 | `ParentAreaScreen.js:840` anuncia 3 artes salvas enquanto `atelierStorage.js:10` define limite 0; arquivo alterado e reauditado | **PLANO E ENTITLEMENT** · sec.: CRIAR LIVRE | `ParentAreaScreen.js:840` × `atelierStorage.js:10` | E013 | `ABERTO` | **P1** | **ALTO** | Área dos Pais | o responsável recebe promessa que o app não cumpre | texto divergente do limite real | 4 | 12A | `P-63` | 18 e 21 | `VFP` · `TEL` · `GRA` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-63`, `P-65` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4A: o limite real do plano grátis no Criar Livre é zero salvamento e não muda; o texto é que está errado. A decisão não se aplica ao Colorir com o Beni, que salva em todos os planos. Decisão de produto resolvida, correção do texto pendente na Fase 12A. Falta para lançamento: reescrever `ParentAreaScreen.js:840` para não prometer 3 artes salvas e preservar explicitamente a política distinta do Colorir com o Beni |
| **P-65** | Criar livre promete guardar criações a quem tem limite 0 | `BrincarScreen.js:306` promete guarde suas criações e `AtelierCanvasScreen.js:273` faz `0 >= 0` bloquear todo salvamento no plano grátis | **PLANO E ENTITLEMENT** · sec.: CRIAR LIVRE | `BrincarScreen.js:306` · `AtelierCanvasScreen.js:273` | E013 | `ABERTO` | **P1** | **ALTO** | Brincar, Canvas | a criança desenha e não consegue guardar nada | promessa infantil sem capacidade | 4 | 12A | `P-63` | 18 e 21 | `VFP` · `TEL` · `GRA` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-63`, `P-64` | `COMPROVADO PELO CÓDIGO` | DECISÃO DA FASE 4A: no Criar Livre do plano grátis a criança pode desenhar, mas o aplicativo não oferece persistência, galeria nem salvamento; o limite zero está correto e é a promessa que precisa sair. A decisão não se aplica ao Colorir com o Beni. Decisão de produto resolvida, correção do texto pendente na Fase 12A. Falta para lançamento: reescrever `BrincarScreen.js:306` para não prometer guarda de criações no Criar Livre gratuito |
| **P-93** | `EXPO_PUBLIC_REVENUECAT` ausente de todos os perfis | As variáveis são lidas no código e não existem em nenhum dos 4 perfis do `eas.json` nem no `.env.example` | **PLANO E ENTITLEMENT** · sec.: DEPENDÊNCIAS E BUILD | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **CRÍTICO** | EAS, Paywall | compra impossível em build de loja | SDK de compra sem configuração | 4 | 18 | `P-24` | 18 e 21 | `VFP` · `TEL` · `FAM` | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-24`, `P-129` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 18. Critério 3 de lançamento: sem as chaves não existe compra, assinatura nem restore. DECISÃO DA FASE 4A: os nomes das variáveis são `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` e `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`; o entitlement do RevenueCat chama-se familia e o offering principal também. Eduardo cria os produtos nas lojas e no RevenueCat e executa a integração técnica; Amanda valida preço, oferta e textos comerciais. Nenhuma chave foi inserida e nenhum arquivo de configuração foi alterado nesta fase. Decisão de produto resolvida; configuração e integração continuam pendentes na Fase 18. |
| **P-129** | Entitlement offline com cache expirado nunca exercitado | O caminho fail-closed crítico nunca foi executado fisicamente | **PLANO E ENTITLEMENT** | `NÃO DETERMINADO` · artefato 07 linha 13 | E015 (`E015-N22`), artefato 07 | `EXIGE VALIDAÇÃO FÍSICA` | alta | **ALTO** | entitlement | pode perder ou ganhar acesso indevido sem rede | caminho fail-closed sem prova de comportamento | 4 | 18 | `P-24`, `P-93` | 18 e 21 | `VFP` · `TEL` · `AVI` · `FAM` · `GRA` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `E015-N22`. MESMO BLOCO DE CORREÇÃO: `P-24`, `P-93`. PRECONDIÇÃO EXECUTÁVEL: `P-24` e `P-93`, ambos com fase de decisão 4 | `NÃO DETERMINADO NO CORPUS RECUPERADO` | RECLASSIFICADO EM E018, de `BLOQUEIA PRODUCT LOCK` para `EXIGE DECISÃO NO PRODUCT LOCK`, por erro factual demonstrável de classificação: a linha bloqueava a Fase 4 enquanto declarava dependência de `P-24` e `P-93`, cujo campo Fase decisão é a própria Fase 4. A precondição do teste é produto do Lock, então o bloqueio era circular. Severidade, status, fase de implementação e classificação de lançamento permanecem inalterados. O teste físico NÃO é executável hoje: nenhum dos cinco perfis do `eas.json` declara chave RevenueCat, `entitlementSource.js:38-42` é fail-closed sem chave, `planConfig.js:40-55` não tem produto comprável e o Modo Criador é override lateral em `accessControl.js:74`, fora do caminho do entitlement. O que o Lock deve decidir é o gate e o harness, não o resultado. DECISÃO DA FASE 4A: opção A. O cache de entitlement vale 7 dias contados da última validação real bem-sucedida; esgotado o prazo sem rede, o plano efetivo é grátis até a próxima validação real, sem tolerância adicional. Nada é apagado: progresso, pinturas e conteúdo premium já baixado permanecem no disco, e a existência física nunca concede autorização. Atividade iniciada enquanto o entitlement ainda era válido não sofre interrupção destrutiva; a restrição vale na próxima entrada protegida ou retomada controlada. Os 7 dias ficam congelados: a Fase 18 valida tecnicamente a regra e não reabre a duração como decisão de produto. Decisão de produto resolvida; a validação física permanece pendente e continua condicionada a `P-24` e `P-93`. Falta para lançamento: executar o caminho offline com cache expirado nos dois planos e registrar se o acesso é negado ou concedido. |
| **P-140** | Entitlement sem caminho de migração de schema | A chave `@ptf_entitlement_v1` carrega a versão no próprio nome e `entitlementService.js:57-70` só reconhece o formato atual; não existe caminho declarado de migração para uma versão futura do snapshot, nem política escrita para snapshot antigo, corrompido ou de origem não comprovada | **PLANO E ENTITLEMENT** · sec.: DADOS E PERSISTÊNCIA | `COMPROVADO PELO CÓDIGO` · `storageKeys.js` (`@ptf_entitlement_v1`) · `entitlementService.js:57-70` · `entitlementService.js:99-102` (writer único) | Fase 4A, por determinação do fundador na consolidação | `ABERTO` | ND | **MÉDIO** | entitlement, Storage | nenhum efeito direto na criança: progresso, pinturas e criações locais são preservados em qualquer estado comercial | snapshot comercial sem política declarada de versionamento e sem teste que a prove | 4 | 18 | `P-24`, `P-93`, `P-129` | 18 e 21 | `VFP` · `FAM` · `REI` · `MIG` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | CRIADO NA FASE 4A por determinação do fundador, sem renumerar nenhum código anterior. NÃO coberto por `P-126`, que trata do schema do manifesto de pack, nem por `P-114`, que trata da localização das chaves. MESMO BLOCO DE CORREÇÃO: `P-129` | `COMPROVADO PELO CÓDIGO` | Código criado porque a busca nos 22 campos dos 139 códigos anteriores não encontrou nenhum que cobrisse o mesmo fato, superfície, consequência e correção. O risco trata exclusivamente do VERSIONAMENTO e da MIGRAÇÃO FUTURA do snapshot de entitlement gravado em `@ptf_entitlement_v1`. DECISÃO DA FASE 4A: (1) não existem assinantes comerciais anteriores ao lançamento, portanto não há base instalada paga a migrar e nenhum grandfathering é devido; (2) Modo Criador, flags de desenvolvimento e estado premium local fabricado NÃO serão migrados em hipótese alguma; (3) os dados infantis locais permanecem preservados em qualquer estado comercial — progresso, pinturas, desenhos e galeria nunca são apagados por decisão de plano; (4) entitlement sem origem comercial comprovada, antigo, inválido ou corrompido resolve para PLANO GRÁTIS até validação real, e a única fonte comercial real é o RevenueCat. Decisão de produto resolvida; risco técnico NÃO corrigido. Critério futuro de encerramento: só pode ser encerrado quando existir política escrita de versionamento do snapshot, caminho declarado de migração para a versão seguinte da chave e teste que exerça snapshot antigo, corrompido e de origem não comprovada provando o resolve para grátis. |

### PRIVACIDADE — 1 risco

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-92** | `plugins/withPrivacyManifest.js` órfão | O plugin existe e não está registrado em `app.json`, então não participa do prebuild | **PRIVACIDADE** · sec.: DEPENDÊNCIAS E BUILD | `COMPROVADO PELO ARQUIVO` | E014 | `ABERTO` | ND | **ALTO** | Config, privacidade | nenhum direto | manifesto de privacidade pode não ser aplicado | - | 20 | `P-94` | 20 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-94` | `COMPROVADO PELO ARQUIVO` | Falta para lançamento: determinar se o Expo SDK 54 já gera o manifesto de privacidade exigido pela loja sem esse plugin. Se não gerar, sobe para bloqueador por obrigação legal (critério 2) |

### ANALYTICS E PESQUISA — 3 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-85** | Zero telemetria em todo o domínio do Brincar | Zero analytics em `src/` e `performanceTrace.js:9` declara SEM analytics: o campo métrica ou evento é impreenchível | **ANALYTICS E PESQUISA** | prova negativa em `src/` · `performanceTrace.js:9` | E013 | `DECISÃO DE PRODUTO PENDENTE` | ND | **NÃO DETERMINADO** | medição | nenhum efeito direto | nenhuma métrica de produto disponível | 4 | 5 | `P-127` | 21 | `NEF` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-127` | `NÃO DETERMINADO NO CORPUS RECUPERADO` | Ausência de telemetria pode ser decisão de privacidade infantil, e não defeito: a Fase 4 decide e a Fase 5 implementa |
| **P-127** | Boot instrumentado sem nenhuma amostra coletada | `performanceTrace.js` instrumenta o boot e não há registro de amostra coletada | **ANALYTICS E PESQUISA** | `NÃO DETERMINADO` · `performanceTrace.js` · artefato 06 | E015 (`E015-N19`), artefato 06 | `EXIGE VALIDAÇÃO FÍSICA` | alta | **MÉDIO** | desempenho | nenhum efeito direto | linha de base de desempenho inexistente | - | 9 | `P-85` | 21 | `VFP` · `TEL` · `AND` · `IOS` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N19`, `R21` (parcela do boot; a parcela do coletor é `P-139`). MESMO BLOCO DE CORREÇÃO: `P-85`, `P-117`, `P-139` | `NÃO DETERMINADO NO CORPUS RECUPERADO` | E018: absorve a parcela de `R21` que trata do boot instrumentado sem amostra. A parcela que trata da impossibilidade de coletar em qualquer perfil de build vive em `P-139` |
| **P-139** | Coletor de desempenho inalcançável em qualquer perfil de build | `performanceTrace.js:44-52` só liga em `__DEV__` ou com `EXPO_PUBLIC_PTF_PERF_TRACE`, que não é declarada por nenhum dos cinco perfis do `eas.json`; não existe script npm para `scripts/perf-baseline-report.js` e nenhuma superfície além do boot está instrumentada | **ANALYTICS E PESQUISA** · sec.: DEPENDÊNCIAS E BUILD | `COMPROVADO PELO CÓDIGO` · `performanceTrace.js:44-52` · `eas.json` sem `PERF_TRACE` em nenhum perfil · `package.json` sem script de desempenho · `06_BASELINE_DE_DESEMPENHO.md:230` | E018 (alias `R21`), `RELATORIO_FECHAMENTO_LP.md:262` | `ABERTO` | alta | **MÉDIO** | desempenho | nenhum efeito direto na criança | nenhuma medição quantitativa é obtível em build interno, então não há linha de base | - | 6 | `P-127`, `P-85` | 14 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `R21` (parcela do coletor). PARCELA JÁ COBERTA: `P-127` (boot sem amostra). MESMO BLOCO DE CORREÇÃO: `P-127`, `P-85`, `P-117` | `COMPROVADO PELO CÓDIGO` | E018: parcela residual de `R21`. `P-127` cobre o boot sem amostra e pressupõe que a coleta seja possível; a impossibilidade de coletar em qualquer perfil, a ausência de script npm e o escopo além do boot não têm P. DIVERGÊNCIA DE FASE REGISTRADA, não resolvida aqui: `DECISIONS.md` e a `v5` §3 põem o baseline de `R21` na Fase 3; `06_BASELINE_DE_DESEMPENHO.md` §9 manda a coleta para a Fase 9; `P-127` está na 9. Esta linha assume a Fase 6, onde a `v5` situa shell e abertura, por ser o primeiro marco em que a coleta é útil |

### FERRAMENTAS INTERNAS — 5 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-32** | QA REP 01: `resetOnboardingForQa` grava em vez de remover | A rotina grava `@ptf_onboarding_v1` em vez de removê-la e não cobre tour nem guias | **FERRAMENTAS INTERNAS** · sec.: ONBOARDING E GUIAS | `@ptf_onboarding_v1` · `v5:512` | E011 | `ABERTO` | baixa (E011) e **P2** (v5:512, árbitro) | **BAIXO** | Onboarding, Área dos Pais | nenhum (ferramenta interna) | QA não reproduz a primeira experiência | - | 7 | `P-114` | 19 e 21 | `VFP` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `QA REP 01` (v5:512) | `COMPROVADO PELO CÓDIGO` | Fase, dependências e revalidação alinhadas ao árbitro `v5:512` |
| **P-78** | Painel vazio ao escolher Infinito na galeria de assets | `OvelhaAssetGalleryScreen.js:211` não tem chave `infinito` em `SIM_QTD`, então `:217` e `:222` iteram sobre `undefined` sem crash | **FERRAMENTAS INTERNAS** | `OvelhaAssetGalleryScreen.js:211`, `:217`, `:222` | E013 | `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` | **P4** | **BAIXO** | ferramenta interna | nenhum (não alcançável pela criança) | ferramenta interna incompleta | - | 19 | `P-115` | 19 | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-115` | `COMPROVADO PELO CÓDIGO` | - |
| **P-107** | `SHOW_CHURCH_MODE` é a única flag interna com cerca simples | A flag depende de uma única variável de ambiente, enquanto `RELEASE_PACK_QA_ENABLED` usa cerca quádrupla | **FERRAMENTAS INTERNAS** · sec.: MODO IGREJA | `featureFlags.js` no commit canônico | E014 | `ABERTO` | ND | **ALTO** | Gates | superfície interna pode aparecer em produção | critério de cerca inconsistente | - | 19 | `P-115` | 19 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-115`, `P-55` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 19 (hardening e modelo de ameaças). Falta para lançamento: confirmar que nenhum perfil de produção define `EXPO_PUBLIC_ENABLE_CHURCH_MODE`. Critério 7 se falhar |
| **P-112** | `App.js:88` usa `console.warn` cru em produção | A chamada ignora o logger já importado no próprio arquivo | **FERRAMENTAS INTERNAS** | `COMPROVADO PELO CÓDIGO` · `App.js:88` | E014 | `ABERTO` | ND | **BAIXO** | Higiene | nenhum | log fora do canal controlado | - | 19 | - | 19 | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 19 |
| **P-115** | 4 rotas internas registradas sem entrada visível | Quatro rotas de ferramenta interna estão registradas no roteador sem ponto de entrada na interface | **FERRAMENTAS INTERNAS** | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **ALTO** | Ferramentas internas | superfície interna existe no binário de produção | rotas sem cerca de build | - | 19 | `P-107` | 19 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-55`, `P-73`, `P-78`, `P-107` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 19. Falta para lançamento: provar que nenhuma das 4 rotas é alcançável em build de release. Critério 7 se falhar |

### MODO IGREJA — 1 risco

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-108** | Modo Igreja com escritores sem consumidor e campo trocado | `setWeeklyStory` e `getChurchProgressSummary` não tem chamador, `weeklyStory` não é persistido e `churchName` é gravado no lugar da faixa | **MODO IGREJA** · sec.: DADOS E PERSISTÊNCIA | `COMPROVADO PELO CÓDIGO` | E014 | `ABERTO` | ND | **MÉDIO** | Modo Igreja | nenhum na experiência infantil atual | dado gravado no campo errado | 4 | 12B | `P-107` | 21 | `VFP` · `TEL` | `EXIGE DECISÃO NO PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | - | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F ou 5 para 12B (rituais e Modo Igreja) |

### DEPENDÊNCIAS E BUILD — 6 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-88** | `.easignore` com 3 padrões apontando para alvos inexistentes | Três padrões do arquivo não correspondem a nenhum caminho existente | **DEPENDÊNCIAS E BUILD** | `COMPROVADO PELO ARQUIVO` | E014 | `ABERTO` | ND | **BAIXO** | EAS | nenhum | exclusão de upload ineficaz | - | 20 | - | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-89`, `P-90` | `COMPROVADO PELO ARQUIVO` | RECLASSIFICAÇÃO DE FASE: de 3F para 20 (engenharia de lançamento e build) |
| **P-89** | 17,93 MB de originais órfãos da Ovelhinha vão para o upload EAS | Os originais não são excluídos do envio ao serviço de build | **DEPENDÊNCIAS E BUILD** · sec.: ASSETS | `COMPROVADO PELO ARQUIVO` | E014 | `ABERTO` | ND | **MÉDIO** | EAS | nenhum | upload e build mais lentos e caros | - | 20 | `P-88` | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-88`, `P-90` | `COMPROVADO PELO ARQUIVO` | RECLASSIFICAÇÃO DE FASE: de 3F para 20 |
| **P-90** | `.easignore` não exclui `scripts`, `docs` nem `specs` | `smoke.js` com cerca de 1,8 MB, 126 arquivos `.md` e a pasta de specs seguem no upload | **DEPENDÊNCIAS E BUILD** | `COMPROVADO PELO ARQUIVO` | E014 | `ABERTO` | ND | **BAIXO** | EAS | nenhum | upload carrega o que não é produto | - | 20 | `P-88` | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-88`, `P-89`. NÃO fundidos: `P-88` é remoção de padrões e `P-90` é acréscimo | `COMPROVADO PELO ARQUIVO` | RECLASSIFICAÇÃO DE FASE: de 3F para 20 |
| **P-91** | `expo-status-bar` e `lottie-react-native` declaradas sem consumidor | Nenhuma das duas é importada, e `lottie` ainda carrega código nativo no binário | **DEPENDÊNCIAS E BUILD** | `COMPROVADO PELO ARQUIVO` | E014 | `IMPLEMENTADO SEM CONSUMIDOR` | ND | **MÉDIO** | Dependências | nenhum | código nativo sem uso no binário | - | 20 | - | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-113` | `COMPROVADO PELO ARQUIVO` | RECLASSIFICAÇÃO DE FASE: de 3F para 20. Remoção de dependência exige aprovação prévia |
| **P-94** | `app.json` sem `runtimeVersion`, `updates` e `assetBundlePatterns` | As três chaves estão ausentes da configuração | **DEPENDÊNCIAS E BUILD** | `COMPROVADO PELO ARQUIVO` | E014 | `ABERTO` | ND | **ALTO** | Config | nenhum direto | EAS Update inviável e bundling de assets indefinido | - | 20 | - | 20 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-92` | `COMPROVADO PELO ARQUIVO` | RECLASSIFICAÇÃO DE FASE: de 3F para 20. Falta para lançamento: confirmar se o roadmap mantém EAS Update no v1. Se mantiver, vira bloqueador operacional |
| **P-113** | 5 dependências de tooling importadas sem declaração | Cinco pacotes são importados por scripts sem constar do `package.json` | **DEPENDÊNCIAS E BUILD** | `COMPROVADO PELO ARQUIVO` | E014 | `ABERTO` | ND | **MÉDIO** | Dependências | nenhum | ambiente limpo pode falhar ao rodar os scripts | - | 20 | `P-91` | 20 | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-91` | `COMPROVADO PELO ARQUIVO` | RECLASSIFICAÇÃO DE FASE: de 3F para 20. Não atinge o binário do app, só o ferramental |

### DOCUMENTAÇÃO — 9 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-11** | `DECISAO_CONTRATO_JORNADA.md:33` desatualizado | O documento afirma contrato de jornada que o código não implementa | **DOCUMENTAÇÃO** | `COMPROVADO PELO DOCUMENTO` | E010 | `CORRIGIDO` | baixa | **INFORMATIVO** | documentação | nenhum | documento induz leitura errada | - | 4 | `P-01` | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-48`, `P-52`, `P-110` | `COMPROVADO PELO DOCUMENTO` | CORRIGIDO na Fase 4C: a linha do contrato de jornada foi atualizada para a fórmula canônica aprovada pelo fundador, sem o requisito de livro aberto, com todas as cenas declaradas no lugar do literal dez e com o Colorir com o Beni exigido de forma condicional. O documento passou a distinguir livro iniciado e livro concluído. Corrigido não desaparece: a linha permanece com a evidência da correção. A correção é documental e não altera código. |
| **P-12** | 17 comentários dizem `coming_soon` | Comentários afirmam camada `coming_soon` que a camada de conteúdo não possui | **DOCUMENTAÇÃO** | `COMPROVADO PELO CÓDIGO` | E010 | `DOCUMENTAL` | baixa | **INFORMATIVO** | documentação de código | nenhum | leitura errada da camada de conteúdo | - | 16 | - | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-52`, `P-110` | `COMPROVADO PELO CÓDIGO` | E015 confirmou zero histórias em `coming_soon` |
| **P-48** | Documentação desatualizada do Livrinho | Cinco arquivos afirmam capacidades do Livrinho que não existem | **DOCUMENTAÇÃO** | `AUDIO_PIPELINE_GUIDE.md:198` · `ATELIER_GUIDE.md:268,:501` · `LIVRINHO_UX_1.md:7` | E012 | `DOCUMENTAL` | baixa | **INFORMATIVO** | documentação | nenhum | documentos induzem leitura errada | - | 10 | `P-49` | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-11`, `P-52`, `P-110` | `COMPROVADO PELO DOCUMENTO` | - |
| **P-52** | Política antiga de não persistir ainda afirmada | Seis pontos em quatro arquivos ainda afirmam em presente que o plano grátis conclui sem persistir | **DOCUMENTAÇÃO** | E012 seção 8 | E012 | `DOCUMENTAL` | baixa | **INFORMATIVO** | documentação de código | nenhum | contradiz a Spec 019 já implementada | - | 9 | - | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-11`, `P-12`, `P-48`, `P-110` | `COMPROVADO PELO CÓDIGO` | A Spec 019 revogou a restrição; os comentários não acompanharam |
| **P-73** | Comentários de `routes.js` afirmam gate interno inexistente | `routes.js:54-59` descreve cerca interna para Ovelhinha e Palavrinhas que `AppNavigator.js:421` e `:438` não aplicam | **DOCUMENTAÇÃO** · sec.: NAVEGAÇÃO | `routes.js:54-59` × `AppNavigator.js:421,438` | E013 | `LEGADO` | **P3** | **INFORMATIVO** | navegação | nenhum | documento de código contradiz o roteador | - | 16 | `P-115` | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N02` (duplicado). MESMO BLOCO DE CORREÇÃO: `P-110` | `COMPROVADO PELO CÓDIGO` | - |
| **P-74** | Provisoriedade sinalizada em rota pública da Ovelhinha | Enunciado original corrigido: `CadeAOvelhinhaScreen.js:1239` gateia o chip Em teste por `isInternalToolsEnabled()`; resta apenas o docblock `:16` desatualizado | **DOCUMENTAÇÃO** · sec.: JOGOS | `:16` desatualizado × `:1239` gateado | E013 | `CORRIGIDO` | **P3** | **INFORMATIVO** | Ovelhinha | nenhum | só o comentário continua incorreto | - | 16 | `P-110` | - | `NEF` | `NÃO BLOQUEIA PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-110` | `COMPROVADO PELO CÓDIGO` | Corrigido não desaparece: a linha permanece com a evidência da correção. O que foi corrigido foi o enunciado, não o código |
| **P-87** | `PROJECT_SOURCE_OF_TRUTH` registra HEAD canônico desatualizado | O documento registra `7f96ee9`, enquanto a linha publicada atual está em `015c438` | **DOCUMENTAÇÃO** | `COMPROVADO PELO DOCUMENTO` | E014 | `DOCUMENTAL` | ND | **INFORMATIVO** | Documentação | nenhum | documento árbitro aponta commit vencido | - | 4 | - | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | - | `COMPROVADO PELO DOCUMENTO` | NÃO corrigível em E016: a ETAPA 18 proibe alterar documentos árbitros e a ETAPA 16 limita a atualização cruzada aos artefatos da Fase 3. A correção pertence a Fase 4, que reabre o documento árbitro |
| **P-109** | `featureFlags.js` cita referência não localizável | O docblock cita DECISIONS.md número 5, referência que não foi localizada no repositório | **DOCUMENTAÇÃO** | `COMPROVADO PELO CÓDIGO` | E014 | `DOCUMENTAL` | ND | **INFORMATIVO** | Documentação | nenhum | decisão congelada sem documento localizável | - | 4 | `P-107` | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-11`, `P-110` | `COMPROVADO PELO CÓDIGO` | Cabe a Fase 4 localizar ou reeditar a decisão referida. E016 não pode criar nem alterar documento árbitro |
| **P-110** | Comentários desatualizados em 5 módulos e 4 documentos | Inventário do item 18 de E014, ampliado por `E015-N18` | **DOCUMENTAÇÃO** | `COMPROVADO PELO CÓDIGO` | E014, ampliado por `E015-N18` | `DOCUMENTAL` | ND | **INFORMATIVO** | Documentação | nenhum | leitura do código induz conclusão errada | - | 16 | - | - | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | AMPLIA: `E015-N18`. MESMO BLOCO DE CORREÇÃO: `P-11`, `P-12`, `P-48`, `P-52`, `P-73`, `P-74`, `P-109` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: de 3F para 16 (congelamento editorial, visual e funcional) |

### CONTEÚDO E TEOLOGIA — 4 riscos

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-09** | Troca `jonah` e `esther` entre catálogo e stories | Os dois registros associam o par de identificadores de forma trocada | **CONTEÚDO E TEOLOGIA** · sec.: DADOS E PERSISTÊNCIA | `COMPROVADO PELO CÓDIGO` | E010 | `ABERTO` | média | **MÉDIO** | dados e catálogo | história exibida sob título de outra | fonte de dados divergente | 4 | 16 | - | 21 | `VFP` | `EXIGE DECISÃO NO PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-10`, `P-118` | `COMPROVADO PELO CÓDIGO` | Falta para lançamento: confirmar qual dos dois registros é canônico no Lock |
| **P-10** | Namespace duplo `comece` e `comece_aqui` | Dois vocabulários de trilha coexistem entre `catalog.js:14` e `stories.js` | **CONTEÚDO E TEOLOGIA** · sec.: DADOS E PERSISTÊNCIA | `COMPROVADO PELO CÓDIGO` · `catalog.js:14` | E010 | `ABERTO` | baixa | **BAIXO** | dados e trilha | nenhum efeito direto hoje | chave de trilha ambígua | 4 | 16 | `P-09` | 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N07` (duplicado, reconciliado em E015) | `COMPROVADO PELO CÓDIGO` | REGISTRO DA FASE 4C: a ordem oficial da jornada é a ordem do Mapa de Aventuras e o árbitro canônico é a autoridade única, portanto o namespace duplo precisa ser resolvido antes que qualquer superfície derive sequência de identificador de trilha. Decisão de produto resolvida quanto à autoridade, normalização do namespace pendente na Fase 16, risco técnico NÃO corrigido. |
| **P-67** | Quatro textos Ateliê visíveis a criança sobrevivem no Baú | `beniChestService.js:143,144,145,154` contra `v5:719`, que proibe restaurar a palavra Ateliê na experiência infantil | **CONTEÚDO E TEOLOGIA** · sec.: UI E RESPONSIVIDADE | `beniChestService.js:143,144,145,154` × `v5:719` | E013 | `ABERTO` | **P1** | **ALTO** | Baú do Beni | vocabulário proibido chega a criança | termo revogado ainda em runtime | - | 12A | `P-45` | 16 e 21 | `VFP` · `TEL` | `INFORMA O PRODUCT LOCK` | `BLOQUEIA LANÇAMENTO` | MESMO BLOCO DE CORREÇÃO: `P-45` (vocabulário infantil) | `COMPROVADO PELO CÓDIGO` | Quebra de contrato aprovado e explícito do fundador (`v5:719`): bloqueia lançamento por critério de contrato, não por severidade |
| **P-118** | `chronologicalOrder` presente em só 3 de 20 histórias | Apenas `stories.js:226`, `:423` e `:620` declaram o campo | **CONTEÚDO E TEOLOGIA** · sec.: DADOS E PERSISTÊNCIA | `COMPROVADO PELO CÓDIGO` · `stories.js:226,423,620` | E015 (`E015-N05`), artefato 08 | `ABERTO` | média | **MÉDIO** | conteúdo, dados | ordenação cronológica impossível de aplicar ao catálogo | campo editorial incompleto | 4 | 16 | `P-04` | 16 e 21 | `NEF` | `INFORMA O PRODUCT LOCK` | `NÃO BLOQUEIA LANÇAMENTO` | ALIAS: `E015-N05`. MESMO BLOCO DE CORREÇÃO: `P-04`, `P-119` | `COMPROVADO PELO CÓDIGO` | RECLASSIFICAÇÃO DE FASE: implementação movida de 4 para 16, mantendo a decisão editorial na Fase 4 DECISÃO DA FASE 4C: a ordem cronológica bíblica não faz parte do produto de lançamento e a única ordem oficial da jornada é a ordem do Mapa de Aventuras. O campo de ordem cronológica não orienta nenhuma superfície no lançamento. Uma futura trilha cronológica poderá ser avaliada depois do lançamento. Decisão de produto resolvida, destino do campo pendente na Fase 16. |

### OUTRO — 1 risco

| Código | Título curto | Descrição factual | Natureza | Evidência | Origem | Status | Sev. origem | Classif. transversal | Superfícies | Impacto infantil | Impacto técnico | Fase decisão | Fase implementação | Dependências | Revalidação | Validação física | Product Lock | Lançamento | Aliases e relações | Estado de evidência | Observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **P-128** | Nenhuma validação física em Android de qualquer classe | `SPRINT_18_4_PHYSICAL_QA_REPORT.md:176` e `:191` registram ausência total de evidência em Android | **OUTRO** | `COMPROVADO PELO DOCUMENTO` · `SPRINT_18_4_PHYSICAL_QA_REPORT.md:176,191` | E015 (`E015-N21`), artefato 07 | `EXIGE VALIDAÇÃO FÍSICA` | alta | **ALTO** | aparelhos | metade das plataformas-alvo sem nenhuma evidência | risco de defeito exclusivo de plataforma | - | 21 | `P-20` | 21 | `VFP` · `AND` · `TEL` · `TAB` | `INFORMA O PRODUCT LOCK` | `PODE BLOQUEAR LANÇAMENTO` | ALIAS: `E015-N21`, `R20A` (equivalente pleno). Candidato D de dedupe: NÃO fundido com `P-20` (aparelho × plataforma) | `COMPROVADO PELO DOCUMENTO` | RECLASSIFICAÇÃO DE FASE: de 8 e 9 para 21, única fase proprietária, com 8A e 9 como dependências. E018: absorve `R20A`; divergência de fase registrada e não resolvida aqui, porque `v5` §Fase 12A e §Fase 14 pedem evidência física em Android como critério de saída, enquanto esta matriz mantém a 21 como única proprietária. Falta para lançamento: executar a campanha em Android |

## 15. Resumos executivos (ETAPA 15)

Todos os totais abaixo são **derivados por contagem da própria tabela da §14**.

| # | Resumo executivo | Total |
|---|---|---|
| 1 | Total bruto de códigos na matriz | **140** |
| 2 | Riscos distintos após deduplicação | **140** |
| 3 | Códigos fundidos (preservados como linha, sem definição própria) | **0** |
| 4 | `CORRIGIDO` | **3** |
| 5 | `REFUTADO` | **1** |
| 6 | `ABERTO` | **91** |
| 7 | `DOCUMENTAL` | **6** |
| 8 | `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` | **2** |
| 9 | Exigem decisão na Fase 4 (campo Fase decisão = 4) | **50** |
| 10 | `BLOQUEIA PRODUCT LOCK` | **0** |
| 11 | `BLOQUEIA LANÇAMENTO` | **5** |
| 12 | `PODE BLOQUEAR LANÇAMENTO` | **40** |
| 13 | `POSTERIOR AO LANÇAMENTO` | **1** |
| 14 | `NÃO DETERMINADO` (lançamento) | **0** |

**15. Totais por fase proprietária de implementação**

| Fase | Riscos |
|---|---|
| Fase 4 | 3 |
| Fase 5 | 1 |
| Fase 6 | 9 |
| Fase 7 | 6 |
| Fase 9 | 7 |
| Fase 10 | 5 |
| Fase 11 | 19 |
| Fase 13 | 1 |
| Fase 16 | 12 |
| Fase 17 | 16 |
| Fase 18 | 4 |
| Fase 19 | 6 |
| Fase 20 | 8 |
| Fase 21 | 1 |
| Fase 8A | 11 |
| Fase 12A | 24 |
| Fase 12B | 7 |

**16. Totais por natureza primária**

| Natureza | Riscos |
|---|---|
| PACKS E OFFLINE | 16 |
| JORNADA E PROGRESSO | 14 |
| JOGOS | 14 |
| ÁUDIO E HÁPTICOS | 11 |
| DOCUMENTAÇÃO | 9 |
| UI E RESPONSIVIDADE | 6 |
| PLANO E ENTITLEMENT | 6 |
| ASSETS | 6 |
| DEPENDÊNCIAS E BUILD | 6 |
| COLORIR COM O BENI | 5 |
| ACESSIBILIDADE | 5 |
| FERRAMENTAS INTERNAS | 5 |
| CONTEÚDO E TEOLOGIA | 4 |
| ONBOARDING E GUIAS | 4 |
| NAVEGAÇÃO | 4 |
| MEU LIVRO | 4 |
| MEU MOMENTO | 4 |
| DADOS E PERSISTÊNCIA | 3 |
| ANALYTICS E PESQUISA | 3 |
| ESTRELINHAS E CONQUISTAS | 2 |
| CULTINHO | 2 |
| CRIAR LIVRE | 2 |
| PRESENTES E RECOMPENSAS | 2 |
| PRIVACIDADE | 1 |
| MODO IGREJA | 1 |
| OUTRO | 1 |

**17. Totais por classificação transversal**

| Classificação | Riscos |
|---|---|
| CRÍTICO | 6 |
| ALTO | 40 |
| MÉDIO | 53 |
| BAIXO | 29 |
| INFORMATIVO | 11 |
| NÃO DETERMINADO | 1 |

**Complementares — totais por status canônico**

| Status | Riscos |
|---|---|
| `ABERTO` | 91 |
| `IMPLEMENTADO SEM CONSUMIDOR` | 14 |
| `DECISÃO DE PRODUTO PENDENTE` | 12 |
| `EXIGE VALIDAÇÃO FÍSICA` | 10 |
| `DOCUMENTAL` | 6 |
| `CORRIGIDO` | 3 |
| `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` | 2 |
| `REFUTADO` | 1 |
| `LEGADO` | 1 |

**Complementares — totais por classificação de Product Lock**

| Product Lock | Riscos |
|---|---|
| `INFORMA O PRODUCT LOCK` | 77 |
| `NÃO BLOQUEIA PRODUCT LOCK` | 39 |
| `EXIGE DECISÃO NO PRODUCT LOCK` | 24 |

**Complementares — validações físicas futuras (múltiplas por risco)**

| Validação física | Riscos |
|---|---|
| `EXIGE VALIDAÇÃO FÍSICA NA FASE PROPRIETÁRIA` | 107 |
| `EXIGE VALIDAÇÃO EM TELEFONE` | 96 |
| `NÃO EXIGE VALIDAÇÃO FÍSICA` | 33 |
| `EXIGE MODO AVIÃO` | 15 |
| `EXIGE VALIDAÇÃO NO PLANO GRÁTIS` | 10 |
| `EXIGE VALIDAÇÃO EM TABLET` | 8 |
| `EXIGE VALIDAÇÃO EM ANDROID` | 7 |
| `EXIGE VALIDAÇÃO EM IOS` | 6 |
| `EXIGE REINSTALAÇÃO` | 5 |
| `EXIGE ESTADO MIGRADO` | 4 |
| `EXIGE VALIDAÇÃO NO PLANO FAMÍLIA` | 4 |
| `EXIGE FONT SCALE 1.3` | 2 |

## 16. Provas automáticas (ETAPA 17)

Executadas sobre a tabela da §14. `S1` e `S2` são provas suplementares de integridade acrescentadas por E016.

| # | Prova | Resultado |
|---|---|---|
| 1 | Sequência sem lacunas até o maior código (P-140) | OK — 0 ausentes |
| 2 | Uma linha principal por código | OK — 140 códigos, 140 linhas, 0 duplicados |
| 3 | Nenhum código P antigo desapareceu (P-01..P-131 herdados) | OK — 131/131 presentes |
| 4 | Nenhum código fundido foi reutilizado | OK — 0 códigos fundidos; nenhum reaproveitado |
| 5 | Nenhum `E015-N` aparece como código principal | OK — 0 ocorrências |
| 6 | Todo risco aberto possui fase proprietária | OK — 130 riscos não encerrados, 0 sem fase |
| 7 | Todo risco possui status canônico | OK — 140/140 |
| 8 | Todo risco possui classificação de Product Lock | OK — 140/140 |
| 9 | Todo risco possui classificação de lançamento | OK — 140/140 |
| 10 | Todo risco possui indicação de validação física | OK — 140/140 |
| 11 | Totais executivos correspondem à tabela | OK — todos os totais da §15 são gerados por contagem da própria tabela da §14 |
| 12 | As três divergências de schema foram classificadas | OK — P-132, P-133, P-134, P-135, P-136, P-137, P-138, P-139, P-140 |
| S1 | Todo `PODE BLOQUEAR LANÇAMENTO` registra a evidência que falta | OK — 40/40 |
| S2 | Toda referência cruzada aponta para código existente | OK — 116 códigos referenciados, 0 órfãos |

## 17. Listas de códigos por classificação

Todas derivadas da tabela da §14.

| Classificação | Qtd. | Códigos |
|---|--:|---|
| `BLOQUEIA LANÇAMENTO` | 5 | `P-24` · `P-56` · `P-63` · `P-67` · `P-93` |
| `PODE BLOQUEAR LANÇAMENTO` | 40 | `P-01` · `P-05` · `P-06` · `P-09` · `P-16` · `P-18` · `P-20` · `P-26` · `P-27` · `P-28` · `P-31` · `P-35` · `P-36` · `P-44` · `P-46` · `P-50` · `P-55` · `P-57` · `P-64` · `P-65` · `P-71` · `P-92` · `P-94` · `P-97` · `P-98` · `P-102` · `P-105` · `P-107` · `P-114` · `P-115` · `P-116` · `P-120` · `P-124` · `P-128` · `P-129` · `P-133` · `P-134` · `P-136` · `P-137` · `P-138` |
| `POSTERIOR AO LANÇAMENTO` | 1 | `P-84` |
| `BLOQUEIA PRODUCT LOCK` | 0 | — |
| `EXIGE DECISÃO NO PRODUCT LOCK` | 24 | `P-02` · `P-09` · `P-16` · `P-37` · `P-43` · `P-44` · `P-45` · `P-75` · `P-76` · `P-85` · `P-100` · `P-108` · `P-120` · `P-121` · `P-122` · `P-123` · `P-124` · `P-125` · `P-126` · `P-132` · `P-133` · `P-134` · `P-135` · `P-137` |
| `EXIGE VALIDAÇÃO FÍSICA` (status) | 10 | `P-06` · `P-20` · `P-21` · `P-27` · `P-28` · `P-31` · `P-35` · `P-127` · `P-128` · `P-129` |
| `DECISÃO DE PRODUTO PENDENTE` | 12 | `P-02` · `P-45` · `P-75` · `P-76` · `P-85` · `P-100` · `P-120` · `P-121` · `P-122` · `P-125` · `P-126` · `P-135` |
| `IMPLEMENTADO SEM CONSUMIDOR` | 14 | `P-14` · `P-29` · `P-39` · `P-42` · `P-49` · `P-50` · `P-53` · `P-72` · `P-82` · `P-91` · `P-99` · `P-103` · `P-106` · `P-119` |
| `DOCUMENTAL` | 6 | `P-12` · `P-48` · `P-52` · `P-87` · `P-109` · `P-110` |
| `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` | 2 | `P-55` · `P-78` |
| `CORRIGIDO` · `REFUTADO` · `LEGADO` | 5 | `P-07` · `P-11` · `P-73` · `P-74` · `P-131` |
| `CRÍTICO` (classificação transversal) | 6 | `P-06` · `P-24` · `P-55` · `P-56` · `P-63` · `P-93` |
| `NÃO EXIGE VALIDAÇÃO FÍSICA` | 33 | `P-07` · `P-10` · `P-11` · `P-12` · `P-48` · `P-52` · `P-53` · `P-73` · `P-74` · `P-78` · `P-84` · `P-85` · `P-87` · `P-88` · `P-89` · `P-90` · `P-91` · `P-92` · `P-94` · `P-106` · `P-107` · `P-109` · `P-110` · `P-112` · `P-113` · `P-115` · `P-118` · `P-119` · `P-122` · `P-131` · `P-135` · `P-136` · `P-139` |

## 18. Herança de E015 preservada

Nada de E015 foi apagado. Esta seção mantém o rastro completo.

### 18.1 Reconciliação individual de `E015-N01` a `E015-N27`

> `E015-N##` é **coluna de origem**, nunca código canônico. Nenhuma linha da matriz da §14 usa
> `E015-N` como identificador.

| Origem | Descrição do achado | Classificação | Destino |
|---|---|---|---|
| `E015-N01` | Registro de riscos `P-01`…`P-117` não é versionado | **ACHADO DOCUMENTAL RESOLVIDO** | Corpus restaurado e versionado. Sem código `P-`. |
| `E015-N02` | Comentários de `routes.js` desatualizados sobre gate interno | **DUPLICADO DE `P-73`** | alias de `P-73` |
| `E015-N03` | Quatro decisores de jornada concorrentes, sem árbitro | **AMPLIA `P-01`** | evidência acrescentada a `P-01` |
| `E015-N04` | Seis eixos de ordenação editorial coexistentes | **AMPLIA `P-04`** | evidência acrescentada a `P-04` |
| `E015-N05` | `chronologicalOrder` presente em só 3 de 20 histórias | **NOVO RISCO REAL** | `P-118` |
| `E015-N06` | `getStoriesInChronologicalOrder()` sem consumidor | **NOVO RISCO REAL** | `P-119` |
| `E015-N07` | Dois vocabulários de trilha (`comece` × `comece_aqui`) | **DUPLICADO DE `P-10`** | alias de `P-10` |
| `E015-N08` | Rotação diária usa dia de época **UTC** | **AMPLIA `P-40`** | evidência acrescentada a `P-40` |
| `E015-N09` | "História da semana" do Cultinho é fixa | **DUPLICADO DE `P-54`** | alias de `P-54` |
| `E015-N10` | Vitrine constante em três superfícies, sem *dedupe* | **AMPLIA `P-02`** | evidência acrescentada a `P-02` |
| `E015-N11` | `manifestSha256` opcional no índice global | **NOVO RISCO REAL** | `P-120` |
| `E015-N12` | `type` divergente entre os dois *schemas* | **NOVO RISCO REAL** | `P-121` |
| `E015-N13` | *Kind* `other` existe só no manifesto por pack | **NOVO RISCO REAL** | `P-122` |
| `E015-N14` | `metadata.coverPath` não verificado contra `files[]` | **NOVO RISCO REAL** | `P-123` |
| `E015-N15` | `metadata.storyId` do pack não cruzado com o índice | **NOVO RISCO REAL** | `P-124` |
| `E015-N16` | `status` remoto descreve estado que só o aparelho conhece | **NOVO RISCO REAL** | `P-125` |
| `E015-N17` | Sem caminho de migração de versão de *schema* | **NOVO RISCO REAL** | `P-126` |
| `E015-N18` | Comentário de `contentManifest.js` contradiz o consumo real | **AMPLIA `P-110`** | evidência acrescentada a `P-110` |
| `E015-N19` | Boot instrumentado, nenhuma amostra coletada | **NOVO RISCO REAL** | `P-127` |
| `E015-N20` | Nenhuma validação física em **tablet** | **DUPLICADO DE `P-20`** | alias de `P-20` |
| `E015-N21` | Nenhuma validação física em **Android** | **NOVO RISCO REAL** | `P-128` |
| `E015-N22` | *Entitlement* offline com cache expirado nunca exercitado | **NOVO RISCO REAL** | `P-129` |
| `E015-N23` | Packs não entregam colorir — `requestedKinds = ['scene']` | **NOVO RISCO REAL** | `P-130` |
| `E015-N24` | Colorir é 278 MB em PNG, o maior peso local | **NOVO RISCO REAL** | `P-131` |
| `E015-N25` | Zero analytics hoje não é decisão de não medir amanhã | **NÃO É RISCO DE PRODUTO** | ressalva metodológica |
| `E015-N26` | C60 restrito a `creation` | **DUPLICADO DE `P-36`** | alias de `P-36` |
| `E015-N27` | Ausência de fila global de *overlays* | **DUPLICADO DE `P-16`** | alias de `P-16` |

**Contabilidade:** `DUPLICADO` 6 · `AMPLIA` 5 · `NOVO RISCO REAL` 14 · `DOCUMENTAL RESOLVIDO` 1 ·
`NÃO É RISCO DE PRODUTO` 1 · **total 27**.

### 18.2 As cinco correções metodológicas de E014 — vinculantes

| # | Formulação incorreta | Formulação correta obrigatória |
|--:|---|---|
| 1 | ~~"Todas as chamadas de rede são GET."~~ | Existem **três pontos explícitos de fetch** para manifestos e mídia e uma integração com o SDK RevenueCat. O **método HTTP interno do SDK não é determinado** pelo código do app. |
| 2 | ~~"Nenhum dado da criança sai do aparelho."~~ | **Não existe upload explícito** de conteúdo infantil no código. A integração RevenueCat existe e seu **envelope técnico precisa de auditoria** nas Fases 5, 18 e 19. |
| 3 | ~~"As dezoito histórias premium funcionam integralmente offline."~~ | A **mídia local existe**, mas o **acesso depende do entitlement**. Separar mídia, autorização, cache válido e pack instalado. |
| 4 | ~~"Asset entregue por pack = zero."~~ | **Zero payloads de pack versionados no repositório.** O estado de packs **instalados no aparelho** é independente e não foi levantado. |
| 5 | ~~"Zero mídia validada fisicamente."~~ | **Zero auditorias físicas individuais** dos 200 arquivos. **Preservar** as validações físicas históricas dos fluxos. |

### 18.3 Refinamentos que preservaram o código mais antigo

| Código | O que mudou | Quem refinou |
|---|---|---|
| `P-03` | evidência localizada na **Congrats**, não no Story Detail | E011 |
| `P-04` | os 4 algoritmos nomeados um a um; ampliado a 6 eixos por `E015-N04` | E011 · E015 |
| `P-05` | caso reprodutível concreto (`david_goliath`) | E011 |
| `P-06` | mecanismo do beco explicado (`isDone` precede `isCurrent`) | E011 · E013 |
| `P-07` | **rebaixado** de média para baixa; Lock de sim para não | E011 |
| `P-08` | escopo ampliado a Cultinho e Meu Momento | E012 |
| `P-15` | +5 encerramentos *bespoke* | E012 |
| `P-16` | 3 → **7 pares** + prova negativa | E011 · E013 |
| `P-17` | 35 *hardcodes* mapeados, 12 impeditivos | E011 |
| `P-20` · `P-31` | ampliados com evidência de C60 e Cultinho | E012 |
| `P-27` · `P-28` | quantificados; **decisão metodológica de E012** mantida | E012 · E013 |
| `P-30` | reformulado: dois **sistemas** de *breakpoint* | E013 |
| `P-35` | sustentado contra a *whitelist* de `progressResetService.js:34-63` | E013 |
| `P-39` | confirmado: `totalBonusStars` não destrava avatares | E013 |
| `P-53` | ampliado com `ATELIER_GUIDE` + 5 áudios órfãos | E013 |
| `P-74` | **CORRIGIDA** — `:1239` é gateado; só o *docblock* resta | E013 |
| `P-110` | ampliado pelo comentário *stale* de `contentManifest.js` | E015 |
| `P-40` | ampliado pela segunda fonte `LumiMomentScreen.js:18` | E015 |
| `P-01` · `P-02` | ampliados por `E015-N03` e `E015-N10` | E015 |

### 18.4 Registro do erro de E015, preservado

A primeira entrega de E015 concluiu que o corpus `P-01` a `P-117` era **irrecuperável** e criou 27
códigos paralelos. A conclusão era **falsa**: o corpus estava nos relatórios de E009 a E014 — a
fonte autorizada nº 1 do próprio mandato — e foi restaurado integralmente, 117 de 117, sem
renumeração. O erro está registrado aqui por dever de rastreabilidade e é a razão pela qual E016
verifica a integridade da sequência por prova automática, e não por confiança.

Nota associada: na versão 1 deste artefato, `P-118` e `P-119` apareciam **apenas** em texto que
determinava **não criá-los**; nunca foram definidos como riscos, e o espaço numérico estava livre.

## 19. Decisões já aprovadas que não podem ser reabertas

1. **Entitlement é *fail-closed*** e `saveEntitlement` é o único *writer* de `@ptf_entitlement_v1`.
2. **Pack no disco nunca é autorização** (`accessControl.js:47-49`).
3. **Validação física é do fundador, no aparelho.**
4. **Nenhuma dependência nova sem aprovação prévia.**
5. **As cinco correções de E014 são vinculantes** e não podem voltar às formulações absolutas.
6. **A decisão metodológica de E012** — achados de acessibilidade e tipografia entram como
   evidência adicional a `P-27`/`P-28`, não como códigos novos.

> **`P-56` e a decisão nº 1 — precisão aplicada em E018.** A decisão nº 1 tem duas metades.
> `P-56` descumpre **a primeira e somente ela**: o entitlement deixa de ser *fail-closed* porque
> o `catch` do consumo de rodada em `MonteACenaTableGameScreen.js:456` e `:467` devolve
> `{ ok: true, remaining: Infinity, premium: true }`, isto é, **abre** rodada infinita e premium
> depois de um erro. A segunda metade **continua íntegra**: `@ptf_entitlement_v1` tem exatamente
> um *writer*, `saveEntitlement` em `entitlementService.js:101`, e o `catch` do Monte a Cena
> **não escreve nessa chave** — a concessão indevida é de memória, no valor de retorno.
> A distinção é de redação, não de gravidade: `P-56` permanece **ABERTO**, **CRÍTICO**, fase de
> implementação **12A** e **BLOQUEIA LANÇAMENTO**. Continua sendo defeito de código com decisão
> já aprovada e descumprida — **não** é decisão de produto pendente.

## 20. Atualização cruzada dos demais artefatos (ETAPA 16)

Os dez artefatos restantes foram revisados **um a um** em busca de referências ao corpus de
riscos. A regra aplicada foi a da própria ETAPA 16: **atualizar somente quando necessário** e
**não replicar a matriz**. Este artefato 09 continua sendo a única fonte canônica de riscos.

### 20.1 Artefatos alterados

| Artefato | Onde | O que mudou e por quê |
|---|---|---|
| `02_DIAGRAMA_JOURNEY_ORCHESTRATOR.md` | §10 · Fases proprietárias | A linha "Reconciliação documental dos vocabulários" trazia **`E016`** na coluna *Fase*. E016 é etapa de auditoria, não fase do Roteiro Mestre. Substituída pela fase real (**16**), com a decisão de namespace único na **Fase 4** e o vínculo explícito a `P-10`. |
| `04_SCHEMA_PRELIMINAR_MANIFESTO.md` | item 18 (`bytes` por arquivo) | Registrada a **`CORREÇÃO DE E016`**: a comparação `file.bytes` × `p.bytes` era improcedente — níveis diferentes (arquivo × pacote). Ver D6 na §2. |
| `04_SCHEMA_PRELIMINAR_MANIFESTO.md` | item 22 (`totalBytes`) | Acrescentada a referência de código `:76-78` e o registro de que **este** é o campo que colide com `p.bytes`, com o consumidor único `packDownloadService.js:73`. Vinculado a `P-132`. |
| `04_SCHEMA_PRELIMINAR_MANIFESTO.md` | §5 · Divergências | Linha 4 reescrita sobre a premissa correta; tabela de destinos fechada: as **seis** divergências agora têm código canônico (`P-120`, `P-121`, `P-122` de E015; `P-132`, `P-133`, `P-134` de E016). A lacuna "sem código atribuído, para E016" está encerrada. |

### 20.2 Artefatos revisados e mantidos sem alteração

| Artefato | Referência encontrada | Decisão |
|---|---|---|
| `01_INVENTARIO_DE_SUPERFICIES.md` | encaminha `E015-N02` ao artefato 09 e nomeia `P-73` como canônico | **Correto.** Já usa o código canônico e preserva a origem. |
| `10_MATRIZ_DE_OVERLAYS_E_PRIORIDADES.md` | `E015-N27` reconciliado como duplicado de `P-16`, citado duas vezes | **Correto.** Consistente com a §7.3. |
| `06_BASELINE_DE_DESEMPENHO.md` | declara equivalência vinculante "para que E016 não precise inferir" | **Correto e usado.** A equivalência foi consumida sem inferência. |
| `11_MATRIZ_DE_DEPENDENCIAS_DE_MIDIA.md` | pede que E016 não conte um ponto de rede como quarto | **Cumprido.** Permanecem três pontos explícitos de *fetch*. |
| `03`, `05`, `07`, `08` | nenhuma referência ao corpus `P-XX` | Nada a atualizar. |

### 20.3 Verificação de não replicação

Nenhum dos dez artefatos contém tabela de riscos com os campos canônicos. As menções a códigos
`P-XX` fora deste artefato são **referências pontuais**, com o código citado e a definição
deixada aqui — que é exatamente o que a ETAPA 16 exige.

## 21. O que E016 **não** fez

1. **Não alterou** `src`, `scripts`, `assets`, dependências ou configurações. O diff executável
   contra o commit canônico é **vazio**.
2. **Não corrigiu** nenhum defeito, inclusive os dois documentais triviais `P-87` e `P-109`.
3. **Não implementou** nenhuma decisão de produto.
4. **Não executou** validação física, *build*, EAS Update, Metro, Expo Go, npm ou Expo Doctor.
5. **Não renumerou** nenhum código. `P-01` a `P-131` mantêm os números de origem.
6. **Não apagou** nenhum código, nem o refutado (`P-07`) nem o corrigido (`P-74`).
7. **Não fundiu** nenhum par — porque nenhum passou no teste "a correção é necessariamente a mesma".
8. **Não inventou** escala de severidade definitiva.
9. **Não alterou** o commit de E015 nem qualquer documento árbitro.
10. **Não replicou** a matriz em outro arquivo.
11. **Não fez** *push*, *merge*, nem iniciou E017.

## 22. Absorção dos sete riscos `R` residuais (E018 · ETAPA 2)

Até a E018 o projeto mantinha **dois esquemas de risco concorrentes**: esta matriz e a lista `R`
que `docs/DECISIONS.md` §"Riscos residuais e seus destinos oficiais" e a `v5` §4 continuavam
tratando como normativa. Os quatro achados físicos da `v5` §4.1 já haviam sido reconciliados em
E016 (`P-32`, `P-35`, `P-18`, `P-34`); faltavam os sete `R`.

A definição original dos sete está em
`specs/012-loading-performance-foundation/RELATORIO_FECHAMENTO_LP.md` §7.1 — `DECISIONS.md` e a
`v5` apenas os citam e lhes reatribuem fase. Cada um foi comparado com **todos** os 134 códigos
por fato, causa, superfície e correção necessária, e não por semelhança textual.

### 22.1 Classificação individual

| `R` | Enunciado de origem | Classificação | Destino canônico |
|---|---|---|---|
| `R5` | Binário de ~401 MB por `require()` estático | **PARCIALMENTE COBERTO POR P EXISTENTE** | coberto por `P-130`, `P-116`, `P-88`, `P-89`, `P-90`, `P-91`, `P-94`; parcela residual → **`P-135`** |
| `R6` | Histórias premium embarcadas no binário público | **RISCO NOVO REAL** | **`P-136`** |
| `R7` | 200 linearts legados de colorir no binário | **JÁ CORRIGIDO** | `P-131`, agora **CORRIGIDO**; rescaldo documental vivo em `P-37` |
| `R17` | `appVersion` / `requiresAppUpdate` inertes | **PARCIALMENTE COBERTO POR P EXISTENTE** | coberto por `P-134`; parcela residual → **`P-137`** |
| `R20A` | Sem verificação de comportamento em Android de baixa memória | **EQUIVALENTE A P EXISTENTE** | **`P-128`** (alias bidirecional) |
| `R20B` | sha256 de pack sem streaming nem teto de memória | **RISCO NOVO REAL** | **`P-138`** |
| `R21` | Nenhuma medição quantitativa de desempenho | **PARCIALMENTE COBERTO POR P EXISTENTE** | coberto por `P-127` (+`P-85`); parcela residual → **`P-139`** |

Nenhum código foi criado por semelhança de tema. Cada um dos cinco novos existe porque **nenhum**
dos 134 anteriores enuncia o mesmo fato com a mesma correção necessária — as buscas de controle
por `require(`, `linear`, `premium embarcado`, `base64`, `streaming`, `memória` e `requiresAppUpdate`
na matriz anterior retornavam zero ocorrência normativa.

### 22.2 Correções de precisão feitas ao absorver

1. **`R5` — número desatualizado.** Os 401,12 MB em 711 arquivos foram medidos antes da conversão
   WebP e do macrobloco P3J. A medição no commit executável congelado `015c438` dá **519 arquivos
   e 130.976.281 bytes (124,9 MB)**. `P-135` registra o número atual.
2. **`R7` — enunciado refutado pelo código.** `P-131` afirmava 200 PNG, 278 MB e
   `src/assets/coloringImages.js` intocado. Em `015c438` restam **3** PNG de colorir rastreados e
   o arquivo **não existe**. A linha herdada trazia o token `DOCUMENTADO HISTORICAMENTE`, que esta
   matriz define como registro sem reverificação; a reverificação exerce a ressalva registrada e
   passa a linha a **CORRIGIDO**, sem apagá-la.
3. **`R17` — inversão do enunciado.** `requiresAppUpdate` **não** é inerte por falta de consumidor:
   a cadeia existe de `globalManifestService.js:162-177` até `StoryDetailScreen.js:68`. Inerte é a
   **entrada** — o literal `'1.0.0'` em `useStoryPackDownload.js:113`, sem `expo-constants` no
   projeto. `P-137` enuncia o defeito na direção correta.
4. **`R6` — não conta em dobro com `P-135`.** Os 378 arquivos e 84.183.401 bytes de `P-136` são
   **subconjunto** dos 519 arquivos de `P-135`. Os dois coexistem porque a correção difere: um é
   arquitetura de empacotamento, o outro é política de conteúdo pago.

### 22.3 Divergências de fase registradas, não resolvidas aqui

A ETAPA 2 preserva a fase proprietária aprovada salvo erro factual demonstrável. Três divergências
entre a lista `R` e esta matriz **não** são erro factual e ficam registradas para o Product Lock:

| Assunto | `DECISIONS.md` / `v5` | Esta matriz | Observação |
|---|---|---|---|
| `R20A` / `P-128` | Fases 12A, 14 e 21 | Fase **21**, única proprietária | `v5` §Fase 12A e §Fase 14 pedem evidência física em Android como critério de saída; `P-128` mantém a 21 como única fase proprietária, com 8A e 9 como dependências |
| `R21` / `P-127` | Fase **3** (`DECISIONS.md`; `v5` §3) | Fase **9** | `06_BASELINE_DE_DESEMPENHO.md` §9 já mandava a coleta para a Fase 9. A Fase 3 é somente leitura e não pode produzir medição |
| `R21` / `P-139` | Fase 3 | Fase **6** | Primeiro marco em que a coleta é útil, pela sequência de shell e abertura da `v5` |

### 22.4 Estado final do esquema `R`

**Não resta nenhum risco `R` vigente fora da matriz canônica.** Os sete têm destino, e os quatro
achados físicos da `v5` §4.1 já o tinham desde a E016. As listas `R` permanecem legíveis nos
documentos de origem **como histórico e alias**, nunca como matriz concorrente.

## 23. Auditoria de executabilidade do `P-129` (E018 · ETAPA 5)

A E017 propôs um microbloco de validação física para `P-129` e afirmou que o *build* interno
vigente seria suficiente. **A afirmação estava errada** e é retificada aqui. Nenhum teste foi
executado, nenhum relógio foi alterado, nenhuma assinatura foi fabricada.

### 23.1 As nove perguntas

**1. O teste é executável hoje?** **Não.** Ele exige um *entitlement* Família real e não existe
caminho para obtê-lo neste projeto no estado atual.

**2. Existe assinatura Família real disponível?** **Não.** `planConfig.js:40-55` declara `monthly`
e `annual` com `status: 'comingSoon'`, `isPurchaseEnabled: false` e `productIdPlaceholder: ''`.
Não há produto comprável — é exatamente o `P-24`.

**3. As chaves e produtos RevenueCat estão configurados no perfil usado?** **Não, em nenhum
perfil.** `eas.json` não contém a *string* `REVENUECAT` uma única vez, nos cinco perfis. O perfil
`c60-pilot` declara apenas duas variáveis, nenhuma delas de RevenueCat. `entitlementSource.js:38-42`
retorna cedo quando a chave está ausente, com o comentário explícito de que o app abre normal e
*fail-closed*. Portanto o *build* `c60-pilot` opera permanentemente no plano **Grátis** — não por
defeito, mas por projeto. É o `P-93`. A dependência `react-native-purchases` **está** instalada
(`package.json:63`): o fator impeditivo não é a biblioteca, é a **ausência de chave e de produto**.

**4. O teste é válido sem resolver `P-24` e `P-93`?** **Não.** Sem produto e sem chave, o SDK nunca
produz um `CustomerInfo` de Família, então não há cache de *entitlement* pago para expirar. O teste
mediria o caminho Grátis e seria apresentado como prova do caminho Família — resultado falso.

**5. Deve bloquear o Lock agora ou ser validação da Fase 18/21?** **Não deve bloquear o Lock.** O
bloqueio era **circular**: `P-129` declarava `BLOQUEIA PRODUCT LOCK` (Fase 4) e, na mesma linha,
dependência de `P-24` e `P-93`, cujo campo *Fase decisão* é a **própria Fase 4**. Manter o bloqueio
impede o Lock de começar e, com isso, impede para sempre a criação da precondição do teste. A
regra de acesso do Plano Família pode ser **decidida** na Fase 4 a partir da política já legível em
código; o que a Fase 18 valida é a **implementação** dessa política em aparelho.

**6. Qual é o pré-requisito mínimo para executá-lo com validade?** Quatro itens, nesta ordem:
(a) chave RevenueCat declarada num perfil de *build* dedicado — resolve `P-93`;
(b) produto Família configurado e comprável em *sandbox* — resolve `P-24`;
(c) uma compra *sandbox* concluída, gerando `CustomerInfo` real cacheado pelo SDK;
(d) um aparelho de teste **que não seja o iPhone pessoal do fundador**.
Nenhum dos quatro existe hoje.

**7. Justificativa da reclassificação e novo gate.** Erro factual demonstrável de classificação,
provado pelos próprios campos da matriz (ver pergunta 5). `P-129` passa de `BLOQUEIA PRODUCT LOCK`
para `EXIGE DECISÃO NO PRODUCT LOCK`. **Nada mais muda:** permanece `EXIGE VALIDAÇÃO FÍSICA`,
severidade de origem alta, transversal **ALTO**, fase de decisão 4, fase de implementação 18,
revalidação em 18 e 21 e `PODE BLOQUEAR LANÇAMENTO`. **Novo gate:** a execução física de `P-129`
passa a ser critério de saída da **Fase 18**, condicionada ao fechamento de `P-24` e `P-93`, e
revalidada na campanha da Fase 21. O Lock decide **o gate e o harness**, não o resultado.

**8. Existe alternativa automatizada que cubra parte do risco?** **Sim, para a metade local.** A
política de janela offline vive inteiramente em `entitlementService.js` e é testável sem aparelho e
sem RevenueCat: `OFFLINE_MAX_WINDOW_MS` é de 7 dias e `saveEntitlement` é o *writer* único. O
*smoke* atual já exercita fonte indisponível, mas **sempre a partir de estado vazio** — não existe
caso que carregue um cache expirado ou obsoleto e **depois** chame `refreshEntitlement` com a fonte
indisponível. Essa lacuna é automatizável em teste puro. O que **não** é automatizável é a metade
remota: o comportamento do `CustomerInfo` cacheado pelo SDK, que exige assinatura real.

**9. Como evitar teste destrutivo no iPhone pessoal do fundador?** O protocolo da E017 pedia
avanço do relógio do aparelho. Isso é **destrutivo e potencialmente irreversível**: adiantar a data
faz o app gravar um `maxSeenDeviceTimestamp` no futuro, e a guarda anti-retrocesso passa a rejeitar
o tempo real do aparelho até a reinstalação. **Nenhum avanço de relógio deve ocorrer no aparelho
pessoal do fundador.** Alternativas, em ordem de preferência: (a) encurtar a janela por variável de
*build* num perfil de QA, sem tocar no relógio; (b) usar aparelho de teste dedicado, descartável e
reinstalável; (c) simulador iOS com conta *sandbox*; (d) se ainda assim o relógio for adiantado,
tratar a reinstalação limpa como parte obrigatória do protocolo, não como contingência.

### 23.2 O que a E018 **não** fez nesta etapa

Não executou o teste. Não alterou o relógio de nenhum aparelho. Não gerou assinatura fictícia. Não
usou o Modo Criador como prova de RevenueCat — ele é *override* lateral em `accessControl.js:74`,
fora do caminho do *entitlement*, e o perfil `c60-pilot` sequer satisfaz seu gate, que exige
`EXPO_PUBLIC_BUILD_PROFILE === 'preview-criador'` (`featureFlags.js:86-88`). Não declarou o *build*
atual suficiente — declarou o contrário, com prova.

## 24. Atualização pela Fase 4A — Product Lock de Plano Família, compra, restauração e entitlement

Esta seção registra **o que a Fase 4A mudou nesta matriz e por quê**. A Fase 4A é
exclusivamente documental: nenhum arquivo executável foi alterado, nenhum defeito foi
corrigido, nenhum produto foi criado nas lojas, o RevenueCat não foi configurado, nenhum
*build* foi gerado e nenhuma validação física foi executada.

### 24.1 Regra de leitura — três estados que não se confundem

A Fase 4A resolveu **decisões de produto**. Isso **não** corrige risco técnico. Cada código
tocado passa a distinguir explicitamente três estados:

| Estado | O que significa | Onde aparece |
|---|---|---|
| **Decisão resolvida** | O fundador decidiu; a pergunta de produto está fechada | Campo *Observação*, prefixo `DECISÃO DA FASE 4A` |
| **Implementação pendente** | O código ainda não faz o que foi decidido | Campo *Status* (`ABERTO`) e *Fase implementação* |
| **Validação futura** | Só um teste em aparelho encerra o item | Campo *Status* (`EXIGE VALIDAÇÃO FÍSICA`) e *Validação física* |

**Nenhum código passou a `CORRIGIDO` nesta fase.** Nenhuma severidade foi rebaixada.
Nenhuma classificação de lançamento foi afrouxada.

### 24.2 Movimento de classificação de Product Lock

Os códigos cuja pergunta de produto foi respondida deixam de **exigir** decisão e passam a
**informar** o Lock: `EXIGE DECISÃO NO PRODUCT LOCK` → `INFORMA O PRODUCT LOCK`. Esse
movimento descreve apenas que a decisão saiu da fila do Lock; **não** encerra o risco.

| Código | Status antes → depois | Product Lock antes → depois | Lançamento | Decisão registrada |
|---|---|---|---|---|
| `P-05` | `ABERTO` → `ABERTO` | `ED` → `IN` | inalterado | Home do plano grátis após esgotamento |
| `P-24` | `ABERTO` → `ABERTO` | `ED` → `IN` | inalterado (`BLOQUEIA LANÇAMENTO`) | Produtos, periodicidade, teste, identificadores, restauração |
| `P-59` | `ABERTO` → `ABERTO` | `NB` (inalterado) | inalterado | Nome público único |
| `P-63` | `ABERTO` → `ABERTO` | `ED` → `IN` | inalterado (`BLOQUEIA LANÇAMENTO`) | Limite zero no Criar Livre e distinção do Colorir |
| `P-64` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado | Limite zero confirmado; o texto é que muda |
| `P-65` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado | Idem, na superfície infantil |
| `P-66` | `ABERTO` → `ABERTO` | `IN` (inalterado) | inalterado | Voz comercial proibida na superfície infantil |
| `P-93` | `ABERTO` → `ABERTO` | `ED` → `IN` | inalterado (`BLOQUEIA LANÇAMENTO`) | Nomes de variáveis, identificadores e responsabilidades |
| `P-129` | `EXIGE VALIDAÇÃO FÍSICA` (inalterado) | `ED` → `IN` | inalterado | Janela offline de 7 dias, opção A |
| `P-136` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado | Binário de produção só com as 2 histórias gratuitas |
| `P-126` | inalterado | inalterado | inalterado | Somente *alias* de distinção contra `P-140` |

`P-64`, `P-65` e `P-136` saem de `DECISÃO DE PRODUTO PENDENTE` porque a decisão **existe**
agora. Eles entram em `ABERTO`, não em `CORRIGIDO`: o texto de `ParentAreaScreen.js:840`, o
texto de `BrincarScreen.js:306` e os `require()` estáticos das 18 histórias premium
continuam exatamente como estavam no commit canônico.

### 24.3 `P-55` e `P-56` permanecem riscos técnicos não corrigidos

Verificação explícita exigida pelo fundador. Nenhum campo de `P-55` e `P-56` foi tocado
nesta fase. As decisões da Fase 4A **não** os alcançam: o fallback premium do Modo Criador e
a rodada fabricada na retomada são defeitos de código, não perguntas de produto, e seguem
abertos com a mesma severidade, a mesma fase proprietária e a mesma classificação de
lançamento registradas em E016 e reconferidas em E018.

### 24.4 Correção de rastreabilidade — `P-57` e a decisão de dispositivos

A decisão sobre **quantidade de dispositivos e perfil familiar** vincula-se principalmente a
`P-24` e, no que toca a estado local persistido, a `P-140`. **`P-57` não é código de
dispositivos.** `P-57` é a rodada fabricada na retomada do Monte a Cena; permanece no escopo
de plano apenas pela relação secundária com consumo de rodadas do plano grátis. Esta matriz
**nunca** registrou vínculo entre `P-57` e dispositivos — seus campos *Dependências* e
*Aliases* apontam apenas para `P-56` e `P-58`. A associação indevida existiu somente no
artefato preliminar da Fase 4A e foi removida lá.

### 24.5 `P-140` — código criado, sem renumeração

O fundador determinou que a ausência de caminho de migração de *entitlement* não podia
permanecer como observação solta. A busca foi refeita nos **22 campos dos 139 códigos**
anteriores. Dois candidatos foram inspecionados campo a campo e descartados:

| Candidato | Por que **não** cobre |
|---|---|
| `P-126` | Trata do `schemaVersion` do **manifesto de pack**; superfície `manifesto`; consequência é o *download* parar. Fato, superfície, consequência e correção são outros |
| `P-114` | Trata da **localização** de cerca de 20 chaves `@ptf` fora do `storageKeys.js`; superfície `Storage`. Não enuncia versionamento nem migração |

Nenhum outro código enuncia o fato. **`P-140` foi criado**, com o número imediatamente
seguinte ao maior código existente. **Nenhum código anterior foi renumerado**, nenhum foi
fundido e nenhum perdeu histórico.

### 24.6 O que a Fase 4A **não** fez nesta matriz

Não reabriu decisão aprovada (§19 permanece íntegra: o *fail-closed* com *writer* único e a
regra "pack no disco nunca é autorização" foram **reafirmados**, não revistos). Não marcou
nenhum risco como corrigido. Não removeu nenhum código. Não alterou `P-55`, `P-56` nem
`P-57`. Não tocou em nenhum campo dos demais 128 códigos.

## 25. Atualização pela Fase 4B — Product Lock de acesso, conteúdo e superfícies infantis

Esta seção registra **o que a Fase 4B mudou nesta matriz e por quê**. A Fase 4B é
exclusivamente documental: nenhum arquivo executável, *asset*, *pack* ou manifesto foi
alterado, nenhuma imagem foi produzida ou modificada, nenhum defeito foi corrigido, nenhum
*build* foi gerado e nenhuma validação física foi executada. As decisões da Fase 4A (§24)
permanecem **integralmente preservadas** — nenhuma foi revogada, afrouxada ou reaberta.

### 25.1 Regra de leitura — os mesmos três estados da §24.1

A Fase 4B resolveu **decisões de produto**. Isso **não** corrige risco técnico. O prefixo no
campo *Observação* é `DECISÃO DA FASE 4B` para decisão do fundador e `REGISTRO DA FASE 4B`
para fato que apenas muda a premissa de um código já existente.

**Nenhum código passou a `CORRIGIDO` nesta fase.** Nenhuma severidade foi rebaixada. Nenhuma
classificação de lançamento foi afrouxada. **Nenhum código `P` novo foi criado.**

### 25.2 Movimento de classificação de Product Lock

| Código | Status antes → depois | Product Lock antes → depois | Lançamento | Decisão registrada |
|---|---|---|---|---|
| `P-05` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Sem degustação premium · prévia editorial · descompasso da Home registrado |
| `P-26` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Mapa sob a mesma regra de acesso da Home; prévia editorial |
| `P-36` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado (`PODE BLOQUEAR`) | Colorir com o Beni nas 20 histórias, 3 atividades cada, 60 no total |
| `P-37` | `ABERTO` (inalterado) | `ED` (inalterado) | inalterado | Apenas registro: a escala muda a premissa da *copy*; a escolha **continua não decidida** |
| `P-50` | `IMPLEMENTADO SEM CONSUMIDOR` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Apenas registro: o escritor ausente passa a alcançar toda a coleção |
| `P-54` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado | Filtro estrito de Cultinho e Meu Momento por conteúdo autorizado |
| `P-66` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado | Proibição comercial alcança `accessibilityLabel`, leitor de tela e áudio |
| `P-130` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado | O colorir das 18 premium precisa chegar por *pack* |
| `P-136` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | **Evidência ampliada** a todo conteúdo premium empacotado |

`P-36` e `P-130` saem de `DECISÃO DE PRODUTO PENDENTE` porque a decisão **existe** agora.
Entram em `ABERTO`, **não** em `CORRIGIDO`: `storyColoringAvailability.js` continua preso a
`creation` e `packDownloadService.js` continua pedindo `requestedKinds = ['scene']`,
exatamente como estavam no commit canônico.

### 25.3 `P-136` — evidência ampliada sem criar código novo

O fundador determinou ampliar a evidência de `P-136` para **todo conteúdo premium incluído no
pacote ou *bundle***, incluindo **imagens, áudios, textos narrativos, quizzes e outros
dados** — e proibiu criar código `P` novo para textos narrativos e quizzes **sem demonstrar**
que `P-136` não cobre o mesmo fato, superfície e correção. A demonstração foi feita:

| Eixo | `P-136` | Textos narrativos e quizzes |
|---|---|---|
| **Fato** | Conteúdo premium viaja íntegro no binário público | Idêntico |
| **Superfície** | Binário, *packs*, *entitlement* | Idêntica |
| **Correção** | Extrair o conteúdo premium para *pack* remoto com UX de baixar antes de ver | Idêntica |
| **Diferença** | Chega por `require()` estático | Chega por importação direta de módulo de dados |

A diferença é **apenas o mecanismo de empacotamento**, não o fato, não a superfície e não a
correção. **Nenhum código `P` novo foi criado.** A evidência de `P-136` foi ampliada no
próprio código.

### 25.4 Conflito preservado — rodadas por criança × por dispositivo

Por determinação expressa do fundador, o conflito entre "**2 rodadas/dia por criança**"
(`DECISIONS.md` `E1-PLANO-FREE`) e "**compartilhadas**" (`MATRIZ_DE_ACESSO.md`,
`DECISOES_E_CONFLITOS.md` C3) foi **preservado e não resolvido** nesta fase. Nenhum texto
conflitante foi alterado; ambos foram **anotados** apontando o bloco decisório próprio.

### 25.5 O que a Fase 4B **não** fez nesta matriz

Não reabriu decisão aprovada (§19 permanece íntegra: "*pack* no disco nunca é autorização" foi
**reafirmado**). Não revogou nenhuma decisão da Fase 4A. Não marcou nenhum risco como
corrigido. Não criou, removeu, renumerou nem fundiu código algum. Não alterou `P-55`, `P-56`
nem `P-57`. Não decidiu o conflito de rodadas. Não tocou em nenhum campo dos demais 131
códigos.

## 26. Atualização pela Fase 4C — Product Lock de jornada, progressão, conclusão e desbloqueios

Esta seção registra **o que a Fase 4C mudou nesta matriz e por quê**. A Fase 4C é
exclusivamente documental: nenhum arquivo executável, *asset*, *pack*, manifesto ou
configuração foi alterado, nenhum defeito de comportamento foi corrigido, nenhum *build* foi
gerado e nenhuma validação física foi executada. As decisões das Fases 4A (§24) e 4B (§25)
permanecem **integralmente preservadas** — nenhuma foi revogada, afrouxada ou reaberta.

### 26.1 Regra de leitura — os mesmos três estados da §24.1

A Fase 4C resolveu **decisões de produto** sobre jornada, conclusão, desbloqueio, revisitação,
recompensas e encerramento. Isso **não** corrige risco técnico. O prefixo no campo
*Observação* é `DECISÃO DA FASE 4C` para decisão do fundador, `REGISTRO DA FASE 4C` para fato
que apenas muda a premissa de um código já existente e `PRECISÃO DA FASE 4C` para correção de
atribuição factual do enunciado.

Cada linha tocada distingue explicitamente **decisão resolvida**, **implementação pendente** e
**validação futura**. **Nenhuma severidade foi rebaixada, nenhuma classificação de lançamento
foi afrouxada e nenhum código `P` novo foi criado.**

### 26.2 A fórmula canônica de conclusão de história

O fundador aprovou a fórmula que passa a valer em todas as superfícies:

1. **Todas as cenas declaradas** da história — nunca um literal igual a dez.
2. **Quiz** concluído.
3. **Reflexão** concluída.
4. **Pelo menos uma atividade do Colorir com o Beni**, quando o Colorir estiver disponível
   para aquela história (emenda `P3J` formalmente ratificada). Três de três permanecem
   **conclusão de coleção**, nunca requisito de desbloqueio.
5. **Persistência confirmada** dessas condições.

O **Livrinho sai da fórmula obrigatória**. Fica registrado como **superada** a parcela do
contrato `A0.10` que incluía o livro aberto em `journeyComplete`. O Livrinho permanece como
experiência própria, revisável e recompensável, agora com **dois estados distintos**: iniciado
ou aberto, e concluído ao alcançar a última página.

### 26.3 Movimento de classificação de Product Lock

| Código | Status antes → depois | Product Lock antes → depois | Lançamento | Decisão registrada |
|---|---|---|---|---|
| `P-01` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado (`PODE BLOQUEAR`) | Árbitro canônico é autoridade única; Home e Mapa pela mesma leitura persistida |
| `P-03` | `ABERTO` (inalterado) | `ED` → `IN` | inalterado | Critério único de conclusão; "concluída" nunca por cenas |
| `P-04` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado | Produtor único de próxima aventura; ordem oficial é a do Mapa |
| `P-05` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Home consome a leitura persistida do árbitro |
| `P-06` | `EXIGE VALIDAÇÃO FÍSICA` (inalterado) | `ED` → `IN` | inalterado (`PODE BLOQUEAR`) | Retomada por cena; sem presunção de contiguidade. Atribuição de arquivo precisada |
| `P-08` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado | Recompensas pendentes passam a enxergar o Colorir |
| `P-10` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado | Ordem oficial é a do Mapa; namespace duplo precisa ser normalizado |
| `P-11` | `DOCUMENTAL` → **`CORRIGIDO`** | `IN` (inalterado) | inalterado | Linha `:33` do contrato de jornada efetivamente corrigida neste bloco |
| `P-13` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Escrita aguardada e confirmada antes de anunciar |
| `P-14` | `IMPLEMENTADO SEM CONSUMIDOR` (inalterado) | `NB` (inalterado) | inalterado | Dois estados úteis no Colorir: iniciada e concluída |
| `P-15` | `ABERTO` (inalterado) | `ED` → `IN` | inalterado | Sistema padronizado de encerramento: 13 *slots*, 5 modos, ordem canônica de destinos |
| `P-17` | `ABERTO` (inalterado) | `ED` → `IN` | inalterado | Primeira história vem da ordem oficial, nunca de valor fixo |
| `P-18` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Colorir não é liberado por conclusão: ele integra o caminho da conclusão |
| `P-19` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado | Estrelinhas não decidem qual conteúdo aparece |
| `P-21` | `EXIGE VALIDAÇÃO FÍSICA` (inalterado) | `IN` (inalterado) | inalterado | História concluída permanece concluída; conteúdo novo nunca é pendência retroativa |
| `P-22` | `ABERTO` (inalterado) | `ED` → `IN` | inalterado | Story Detail com predicado único |
| `P-23` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Nenhum CTA habilitado e inerte; estado de carregamento na hidratação |
| `P-36` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Exigência de Colorir **condicional permanente**; emenda `P3J` ratificada |
| `P-38` | `ABERTO` (inalterado) | `ED` → `IN` | inalterado | Livrinho com dois estados; abrir não é concluir; fora da fórmula obrigatória |
| `P-39` | `IMPLEMENTADO SEM CONSUMIDOR` (inalterado) | `IN` (inalterado) | inalterado | Fonte canônica única de estrelinhas; nenhuma estrela perdida na migração |
| `P-46` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Falha de gravação **visível e *fail-closed***; nunca recompensa como alternativa |
| `P-49` | `IMPLEMENTADO SEM CONSUMIDOR` (inalterado) | `ED` → `IN` | inalterado | Livrinho como experiência própria, revisável e recompensável |
| `P-50` | `IMPLEMENTADO SEM CONSUMIDOR` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Conclusão de atividade precisa de consumidor real e persistência confirmada |
| `P-51` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Ordem das 3 atividades é dado canônico; exigência é de **uma** |
| `P-55` | `INTERNO E INALCANÇÁVEL EM PRODUÇÃO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Conclusão registrada nunca é revogada nem gravada sob identificador errado |
| `P-56` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (**`BLOQUEIA LANÇAMENTO`**) | Falha de *storage* nunca concede rodada, recompensa, *premium* ou desbloqueio |
| `P-57` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Monte a Cena retomável, rodada consumida uma única vez, nunca fabricada |
| `P-58` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Nenhuma recusa silenciosa depois do teto diário |
| `P-63` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (**`BLOQUEIA LANÇAMENTO`**) | Galeria grátis sem contador, sem barra e sem "0 de 0"; estado vazio afetivo |
| `P-68` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Encerramento do Criar Livre sob o mesmo sistema padronizado |
| `P-69` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Palavrinhas passa a exigir persistência de resultado e conquistas próprias |
| `P-70` | `DECISÃO DE PRODUTO PENDENTE` → `ABERTO` | `ED` → `IN` | inalterado | **Os quatro jogos** têm conquistas no lançamento |
| `P-71` | `ABERTO` (inalterado) | `IN` (inalterado) | inalterado (`PODE BLOQUEAR`) | Estrelinha anunciada só após persistência confirmada; teto diário de 2 |
| `P-82` | `IMPLEMENTADO SEM CONSUMIDOR` (inalterado) | `ED` → `IN` | inalterado | Recompensas como elementos secundários, nunca ações concorrentes |
| `P-83` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Baú é elemento secundário do encerramento |
| `P-86` | `ABERTO` (inalterado) | `NB` (inalterado) | inalterado | Retomada diferente por duração; rodada só no resultado terminal válido |
| `P-118` | `ABERTO` (inalterado) | `ED` → `IN` | inalterado | Ordem cronológica **fora do produto de lançamento** |
| `P-119` | `IMPLEMENTADO SEM CONSUMIDOR` (inalterado) | `IN` (inalterado) | inalterado | Nenhuma superfície de lançamento consome ordenação cronológica |

`P-01`, `P-04` e `P-70` saem de `DECISÃO DE PRODUTO PENDENTE` porque a decisão **existe**
agora. Entram em `ABERTO`, **não** em `CORRIGIDO`: os cinco produtores de "próxima história",
os dezenove enunciados de "história concluída" e a ausência de conquistas em três dos quatro
jogos continuam exatamente como estavam no commit canônico.

### 26.4 A única linha que passou a `CORRIGIDO` — `P-11`

`P-11` enuncia um defeito **documental**: `DECISAO_CONTRATO_JORNADA.md:33` afirmava um contrato
de jornada que o código não implementa. Neste mesmo bloco documental a linha foi **de fato
corrigida** — a fórmula perdeu o requisito de livro aberto, o literal de dez cenas foi
substituído por todas as cenas declaradas e o Colorir passou a exigência condicional. Por isso,
e **somente por isso**, `P-11` passa a `CORRIGIDO`: não porque uma decisão foi tomada, mas
porque o texto defeituoso deixou de existir. Corrigido não desaparece: a linha permanece com a
evidência da correção. **Nenhum risco técnico passou a `CORRIGIDO` nesta fase.**

### 26.5 Conflitos resolvidos e conflitos preservados

| Conflito | Desfecho na Fase 4C |
|---|---|
| Livrinho na fórmula de conclusão | **Resolvido** em favor da fórmula **sem** o livro aberto |
| "10 cenas" × "todas as cenas" | **Resolvido**: vale sempre o total de cenas declaradas |
| Abrir × concluir o Livrinho | **Resolvido**: dois estados distintos, com recompensa única na conclusão |
| Conclusão global reabrível × não reabrível | **Resolvido**: a conclusão registrada nunca é revogada; a revisitação usa **modo sóbrio** |
| Estrelinhas × avatares | **Resolvido**: estrelas são marcos cosméticos **não consumíveis**; avatares adicionais exigem **Plano Família** |
| Rodadas por criança × por dispositivo | **Preservado**, como na §25.4 — pertence ao bloco decisório próprio |

### 26.6 O que a Fase 4C **não** fez nesta matriz

Não reabriu nenhuma decisão das Fases 4A e 4B. Não marcou nenhum **risco técnico** como
corrigido. Não rebaixou severidade. Não afrouxou classificação de lançamento. Não criou,
removeu, renumerou nem fundiu código algum — a cobertura foi verificada dentro de `P-01` a
`P-140` antes de qualquer proposta de código novo, e nenhum foi necessário. Não tocou em
nenhum campo dos demais 102 códigos.

---

*Fim do artefato 9 de 11. **Matriz única e definitiva com 140 riscos**, `P-01` a `P-140`, sem
lacunas, sem renumeração e sem perda de histórico. Esta é a única fonte canônica de riscos do
projeto.*
