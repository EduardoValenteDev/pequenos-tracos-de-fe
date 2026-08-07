# Fase 5 · Bloco 7 — Consolidação e reconciliação

**Criado em 2026-08-07 · documento de consolidação · nenhuma linha de runtime alterada**

> **AUTORIZAÇÃO:** §7 e §9 da decisão do fundador de 2026-08-07. Reconciliar os artefatos da Fase 5,
> `DECISIONS.md`, a matriz de riscos, `PROJECT_SOURCE_OF_TRUTH.md`, o roadmap `v5` quando necessário,
> as contagens derivadas, os encaminhamentos `E5`, a aprovação do plano de medição e a decisão
> `E5.41`. Determinação literal: **"Faça recontagem manual auditada da matriz. Nenhum ajuste
> silencioso."**

---

## 1. A distinção que governa este documento

O fundador determinou (§8): *"Distinga claramente FASE 5 DOCUMENTALMENTE ENCERRADA de ITEM APROVADO
PARA LANÇAMENTO."*

| | **FASE 5 DOCUMENTALMENTE ENCERRADA** | **ITEM APROVADO PARA LANÇAMENTO** |
|---|---|---|
| O que significa | os pareceres foram produzidos, as decisões pedidas foram tomadas e os encaminhamentos têm destino | um item foi verificado, implementado, validado e liberado |
| O que basta | trabalho documental completo e auditável | implementação + validação física + parecer externo, conforme o item |
| Estado hoje | ✅ **atingido por este bloco** | ❌ **não atingido por nenhum item desta fase** |

> **Um parecer com estado `BLOQUEADO` ou `DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA` continua sendo um
> parecer registrado, mas NÃO equivale a aprovação jurídica, teológica ou de lançamento.** Esses
> bloqueadores permanecem vivos e rastreáveis até sua resolução real (§7 e §8 deste documento).

**A Fase 5 não aprovou nada para lançamento. Nenhum risco técnico foi corrigido nesta fase.**

---

## 2. Recontagem manual auditada da matriz canônica

### 2.1 Método — declarado, não presumido

- **Fonte:** `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`, **§14 "Matriz
  definitiva"** — linhas 464 a 748 do arquivo, a única tabela em que cada código aparece **uma vez**.
- **Como:** leitura linha a linha da §14, separando as 22 colunas por **pipe não escapado** (várias
  células contêm `\|` literal, e uma divisão ingênua produziria contagens erradas).
- **`git grep` simples foi rejeitado como método:** ele conta **189** ocorrências de `| **P-nnn** |`
  no arquivo inteiro, porque códigos reaparecem nas seções §17 a §29. Só a §14 é contável.
- **Declaração obrigatória de veracidade:** o *"gerador determinístico"* citado nas mensagens de
  commit das Fases 4A a 4D **não existe neste repositório**. Esta recontagem é **manual e auditada**,
  reproduzível pelo script somente-leitura descrito em §2.4. **Não alegamos ter executado nenhum
  gerador.**

### 2.2 Resultado — todas as contagens de §29.5 confirmadas

| Bloco derivado | §29.5 dizia "Depois" | Recontagem auditada | Veredicto |
|---|--:|--:|:--:|
| Total de riscos | 149 | **149** | ✅ |
| §14 natureza PRIVACIDADE | 2 | **2** | ✅ |
| §15 itens 1 e 2 | 149 | **149** | ✅ |
| `ABERTO` | 103 | **103** | ✅ |
| `PODE BLOQUEAR LANÇAMENTO` | 45 | **45** | ✅ |
| fase proprietária = Fase 7 | 7 | **7** | ✅ |
| `ALTO` | 43 | **43** | ✅ |
| `INFORMA O PRODUCT LOCK` | 93 | **93** | ✅ |
| `VFP` | 114 | **114** | ✅ |
| `TEL` | 102 | **102** | ✅ |

**Integridade dos códigos:** 149 linhas, **149 códigos únicos**, **zero duplicados**, faixa contígua
**`P-1` a `P-149`**, **nenhum ausente**. Soma das fases proprietárias = **149** (3+1+9+7+11+7+5+19+25+7+1+14+16+4+11+8+1).

### 2.3 Duas imprecisões de rótulo encontradas — declaradas, não ajustadas em silêncio

Nenhuma contagem estava errada. **Dois rótulos de §29.5 eram ambíguos sobre a coluna de origem**, e
uma auditoria futura que procurasse na coluna errada encontraria zero.

| Rótulo em §29.5 | Onde uma auditoria ingênua procuraria | Onde o valor de fato está | Consequência |
|---|---|---|---|
| **`ALTO` = 43** | coluna **`Sev. origem`** (col. 8) | coluna **`Classif. transversal`** (col. 9) | em `Sev. origem` o vocabulário é `ND`/`alta`/`média`/`baixa`/`P1`–`P4`; **`ALTO` não ocorre lá nenhuma vez** — a contagem nessa coluna daria **0** |
| **`VFP` = 114 e `TEL` = 102** | `TEL` na coluna **`Revalidação`** (col. 16) | **ambos** na coluna **`Validação física`** (col. 17), no formato `VFP · TEL · …` | `Revalidação` contém **números de fase** (`21`, `17 e 21`, …), não siglas; a contagem de `TEL` nessa coluna daria **0** |

**Correção aplicada:** este documento e a §30 da matriz passam a nomear a coluna de origem de cada
contagem. **Os números de §29.5 permanecem exatamente como estavam** — nada foi alterado neles.

### 2.4 Reprodutibilidade

O roteiro somente-leitura usado está descrito integralmente em §2.1 e pode ser reexecutado por
qualquer auditor: delimitar §14, filtrar linhas `^\| \*\*P-\d+\*\* \|`, dividir por pipe não escapado,
contar as colunas 4 (Natureza), 7 (Status), 9 (Classif. transversal), 14 (Fase implementação), 17
(Validação física), 18 (Product Lock) e 19 (Lançamento). **Nenhum arquivo do repositório foi escrito
por esse roteiro.**

---

## 3. Os setenta encaminhamentos `E5.1` a `E5.70` — nenhum sem destino

Os quatro estados obrigatórios: **RESOLVIDO NESTA FASE (R)** · **ENCAMINHADO À FASE PROPRIETÁRIA
(EFP)** · **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA (VHE)** · **DEPENDENTE DE TERCEIRO EXTERNO (TE)**.

| Código | Assunto (resumo) | Estado | Destino |
|---|---|:--:|---|
| `E5.1` | `generate-narrator-package.js:93,103` ainda emite "3 a 8 anos" | **EFP** | fase autorizada a alterar `scripts/` — **sem fase nomeada** (§3.2) |
| `E5.2` | `storyConstants.js:7-22` declara faixas divergentes, em módulo sem importador | **EFP** | fase autorizada a alterar `src/` — **sem fase nomeada** (§3.2) |
| `E5.3` | *Target age group* de loja indefinido | **R** | Bloco 3 |
| `E5.4` | Ratificação da supersessão de `PL01A-04` pela faixa 4 a 8 | **R** | ratificada pelo fundador — §3.3 |
| `E5.5` | Verificar que as 20 histórias atendem à referência de ~5 anos | **EFP** | revisão bíblica por história (`E5.33`, `E5.34`) |
| `E5.6` | Faixa 4 a 8 sobrevive à revisão jurídica? | **TE** | advogado |
| `E5.7` | Não existe exclusão total de dados no app | **EFP** | **Fase 7** |
| `E5.8` | Nenhum texto menciona a validação automática de assinatura | **EFP** | **Fase 7** — **redação NÃO especificada nesta fase** (§3.4) |
| `E5.9` | Chave de API de assinatura no build de produção — **NÃO RECUPERADO** | **VHE** | quem tem acesso à conta EAS |
| `E5.10` | Reflexão pós-história admite texto livre digitado? | **EFP** | fase proprietária da tela |
| `E5.11` | `deleteChildProfile` não apaga os dados do perfil removido | **EFP** | **Fase 7** |
| `E5.12` | Ausência de portabilidade/exportação | **EFP** | decisão de produto futura |
| `E5.13` | Política de retenção e expurgo de `@ptf_lumi_moment_*` | **R** | eixo documental; runtime em fase futura |
| `E5.14` | Consentimento parental verificável (LGPD 14 · COPPA) | **TE** | advogado |
| `E5.15` | **RIPD** inexistente | **TE** | advogado / DPO |
| `E5.16` | Análise de **ECA / ECA Digital** | **TE** | advogado |
| `E5.17` | Inventário de licenças de assets e ferramentas de IA | **TE** | licenciamento comercial |
| `E5.18` | Hospedagem, retenção e acordo do provedor de assinatura | **TE** | provedor + advogado |
| `E5.19` | `NSPrivacyCollectedDataTypes: []` à luz do SDK de assinatura | **EFP** | **Fase 20** |
| `E5.20` | Campo `email` do responsável preparado e desconectado | **R** | manter desconectado |
| `E5.21` | Kids Category × SDK de assinatura, e a faixa única da Apple | **VHE** | fundador + consoles |
| `E5.22` | Manifesto de privacidade do SDK no artefato — **NÃO RECUPERADO** | **TE** | inspeção de build / provedor |
| `E5.23` | *Nutrition Label* e `NSPrivacyCollectedDataTypes` (`P-92`) | **EFP** | **Fase 20** |
| `E5.24` | `expo-dev-client` ativo em produção? | **VHE** | artefato compilado |
| `E5.25` | Ícone: texto, cantos, legibilidade em tamanho pequeno | **VHE** | inspeção visual humana |
| `E5.26` | Compressão de assets; bundle real não medido | **EFP** | fase do pipeline de assets |
| `E5.27` | Declaração de conformidade de exportação | **TE** | responsável legal |
| `E5.28` | `app.json` `name: "Beni"` × nome nos documentos de loja | **VHE** | fundador |
| `E5.29` | Não existe ícone 512×512 para o Google Play | **EFP** | designer / fase de assets |
| `E5.30` | Oito marcações falsas nos checklists de loja | **R** | corrigidas no Bloco 3 |
| `E5.31` | Contradição de faixa etária nas consoles | **R** *(parcial)* | parte Apple segue em `E5.21` |
| `E5.32` | Suspeita de manifesto incompleto (FileTimestamp / DiskSpace) | **R** | verificada e **descartada** |
| `E5.33` | **Revisão bíblica humana das 20 histórias** — nenhum revisor identificado | **TE** | teólogo ou pastor, escolha do fundador |
| `E5.34` | **Os 20 relatórios `REVIEW_<storyId>.md` não existem**; portão violado 20/20 | **EFP** | Fases **9**, **13**, **15**; portão duro na **16** |
| `E5.35` | A escala de 5 níveis de risco nunca foi aplicada | **EFP** | Fases **9**, **13**, **15** |
| `E5.36` | 151 de 200 textos substituídos sem nova revisão bíblica | **EFP** | Fases **9**, **13**, **15**; portão na **16** |
| `E5.37` | "Documento Oficial de Narração Limpo" não versionado — **NÃO RECUPERADO** | **EFP** | **Fase 16** |
| `E5.38` | 157 MP3 de narração desatualizados | **EFP** | Fases **8A**, **9**, **13**, **15** |
| `E5.39` | 44 perguntas de quiz reancoradas sem nova revisão | **EFP** | Fases **9**, **13**, **15** |
| `E5.40` | Legibilidade medida história a história | **R** *(parte mensurável)* | compreensibilidade → `E5.33` |
| `E5.41` | **Política de oração — caminhos A, B e C** | **R** ✅ | **Caminho B** decidido pelo fundador — §4 |
| `E5.42` | Momento com Beni concede +1 ⭐ em dia de oração | **EFP** | **Fase 9** e **Fase 11**, sob o Caminho B |
| `E5.43` | `first_family_worship` premia concluir o Cultinho | **EFP** | **Fase 12B** e **Fase 11**, sob o Caminho B |
| `E5.44` | "Repita com Beni" é instrução de repetição | **EFP** | **Fase 8** (matriz de falas) |
| `E5.45` | Dois versículos truncados removem o núcleo da passagem | **EFP** | Fases **8** e **9** |
| `E5.46` | Nenhuma citação bíblica indica a tradução usada | **EFP** | Fases **8**, **9**, **16** |
| `E5.47` | Registro linguístico misto nos versículos | **EFP** | Fases **8** e **9** |
| `E5.48` | Referência abreviada inconsistente | **EFP** | **Fase 16** |
| `E5.49` | `Fp 4:13` — risco de leitura descontextualizada | **TE** | revisor bíblico (`E5.33`) |
| `E5.50` | Aparente contradição sobre neutralidade denominacional | **R** | reconciliada sem alterar texto |
| `E5.51` | 80 perguntas de reserva: escopo de revisão é 160, não 80 | **EFP** | Fases **9**, **13**, **15** |
| `E5.52` | Habilitar coletor de desempenho em perfil interno (`P-139`) | **EFP** | **Fase 6** |
| `E5.53` | Linha de base de desempenho em aparelho real (`P-127`) | **VHE** | **Fase 9** |
| `E5.54` | Runtime da Camada 2 (sumarização, allowlist, buckets) | **EFP** | **Fase 19** |
| `E5.55` | Consentimento é um **booleano único** — incompatível com o consentimento por finalidade | **EFP** | **Fase 7** (superfície) · **Fase 19** (motor) |
| `E5.56` | `PARENTAL_CONSENT_FLOW_ENABLED = false` com justificativa falsa | **EFP** | **Fase 7** |
| `E5.57` | Validação **jurídica** da terminologia e dos limiares `k` | **TE** | advogado de dados e público infantil |
| `E5.58` | Data Safety e App Privacy coerentes com o plano | **EFP** | **Fase 20** |
| `E5.59` | Auditoria de SDK por release + teste automatizado de identificadores | **EFP** | **Fase 19** (teste) · **Fase 20** (auditoria) |
| `E5.60` | Medição de criação depende de `P-141` resolvido | **EFP** | **Fase 19** |
| `E5.61` | Termo do piloto com famílias; base PESQUISA isolada | **VHE** | **Fase 21** |
| `E5.62` | EAS Update permitido × config remota de experimentação proibida, **com cerca normativa** | **R** | — |
| `E5.63` | Exclusão individual é impossível na Camada 3 | **R** | — |
| `E5.64` | Modo Igreja: `k ≥ 50` e proibição de telemetria de igreja/denominação | **EFP** | **Fase 12B** |
| `E5.65` | `P-85` permanece `ABERTO`; especificar (e aprovar) não é corrigir | **R** *(registro)* · **EFP** *(implementação)* | **Fase 19** |
| `E5.66` | Propagar a terminologia **Criar Livre / Colorir com o Beni** aos demais documentos | **EFP** | **Fase 12A** (converge com `P-67`) |
| `E5.67` | Reescrever os cinco textos divergentes da Área dos Pais | **EFP** | **Fase 7** |
| `E5.68` | Validação visual dos quatro itens do Bloco 6 §6 | **VHE** | **Fase 7** · item 4 na **Fase 21** |
| `E5.69` | Coerência entre Área dos Pais, política pública, Data Safety e App Privacy | **EFP** | **Fase 7** · **Fase 20** |
| `E5.70` | Base factual de `P-149` ampliada de 4 para 6 textos e de 1 para 3 perfis | **R** | — |

### 3.1 Distribuição

| Estado | Quantidade | Códigos |
|---|--:|---|
| **RESOLVIDO NESTA FASE** | **14** | `E5.3`, `E5.4`, `E5.13`, `E5.20`, `E5.30`, `E5.31`, `E5.32`, `E5.40`, `E5.41`, `E5.50`, `E5.62`, `E5.63`, `E5.65`, `E5.70` |
| **ENCAMINHADO À FASE PROPRIETÁRIA** | **38** | `E5.1`, `E5.2`, `E5.5`, `E5.7`, `E5.8`, `E5.10`, `E5.11`, `E5.12`, `E5.19`, `E5.23`, `E5.26`, `E5.29`, `E5.34`–`E5.39`, `E5.42`–`E5.48`, `E5.51`, `E5.52`, `E5.54`, `E5.55`, `E5.56`, `E5.58`, `E5.59`, `E5.60`, `E5.64`, `E5.65`, `E5.66`, `E5.67`, `E5.69` |
| **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** | **8** | `E5.9`, `E5.21`, `E5.24`, `E5.25`, `E5.28`, `E5.53`, `E5.61`, `E5.68` |
| **DEPENDENTE DE TERCEIRO EXTERNO** | **11** | `E5.6`, `E5.14`, `E5.15`, `E5.16`, `E5.17`, `E5.18`, `E5.22`, `E5.27`, `E5.33`, `E5.49`, `E5.57` |

**Contagem declarada, sem fechamento artificial:** 14 + 38 + 8 + 11 = **71 entradas** para **70
códigos**. A diferença é **`E5.65`**, que aparece em duas categorias por ser **RESOLVIDO** no eixo de
registro (o plano documenta que especificar `P-85` não o corrige) e **ENCAMINHADO** no eixo de
implementação (Fase 19). `E5.31` e `E5.40` estão marcados `(parcial)` na tabela acima, mas contam
**uma vez só**: a parte não resolvida de cada um já pertence a outro código (`E5.21` e `E5.33`,
respectivamente), e duplicá-los inflaria a soma.

**Faixa:** `E5.1` a `E5.70`, contígua, **nenhum ausente** — mais `E5.71`, derivado em §3.2.

### 3.2 Dois encaminhamentos **sem fase proprietária nomeada** — declarado, não mascarado

`E5.1` e `E5.2` foram registrados no Bloco 1 com destino *"fase autorizada a alterar `scripts/`"* e
*"fase autorizada a alterar `src/`"*, **sem número de fase**. A Fase 5 **não arbitra sequência** — esse
papel é exclusivo de `v5` §3. Portanto:

- **Estado:** `ENCAMINHADO À FASE PROPRIETÁRIA` — o destino existe (uma fase que possa tocar código).
- **O que falta:** a **atribuição do número da fase**, que cabe a quem arbitra sequência.
- **Encaminhamento derivado `E5.71`:** atribuir fase proprietária numerada a `E5.1` e `E5.2`.
  **ENCAMINHADO À FASE PROPRIETÁRIA — Fase 16** (congelamento editorial), por ambos serem
  divergências de rótulo de faixa etária em texto e em constante morta. *A Fase 5 propõe; `v5` §3
  confirma ou corrige.*

### 3.3 `E5.4` — a ratificação da faixa etária ocorreu, e onde

`DECISIONS.md` §`PF5-FAIXA-ETARIA` registrava *"⚠️ Ratificação pendente do fundador… será apresentada
para ratificação explícita junto com o plano de medição"*.

**A ratificação ocorreu antes disso, na autorização de abertura da Fase 5**, na arbitragem 2:
*"Faixa etária CONGELADA em 4 a 8 anos"*, com a determinação de que `ageBand: '4-8'` **não** muda e
*"Não modificar runtime por causa desta decisão."*

**Declarado sem ajuste silencioso:** a ratificação veio **antes** do momento previsto, não depois.
`E5.4` passa a **RESOLVIDO NESTA FASE**, e o aviso de pendência em `PF5-FAIXA-ETARIA` é substituído
pelo registro da ratificação, com a data e o texto de origem.

### 3.4 `E5.8` — o que o Bloco 6 **não** cobriu

`E5.8` (nenhum texto ao usuário menciona a validação automática de assinatura) foi registrado no
Bloco 2 com a expectativa de que *"o Bloco 6 desta fase especifica a redação"*.

**Isso não aconteceu, e o motivo é declarado:** o fundador delimitou o Bloco 6, em §6 da sua decisão,
ao registro da **divergência dos textos de privacidade**. A redação sobre validação de assinatura
**não** estava no escopo autorizado, e **não foi escrita**.

`E5.8` permanece **ENCAMINHADO À FASE PROPRIETÁRIA — Fase 7**, agora **sem** a especificação de
redação que o Bloco 2 antecipava. **Não transformamos escopo não autorizado em trabalho entregue.**

---

## 4. `E5.41` — a decisão de produto sobre oração

**Decisão do fundador em 2026-08-07: CAMINHO B como contrato canônico.** Registro completo em
[`05_PLANO_DE_MEDICAO_ANONIMA.md`](05_PLANO_DE_MEDICAO_ANONIMA.md) §13.4.

**Princípio vinculante:** *"A oração pode fazer parte da experiência espiritual do Mundo do Beni, mas
nunca pode ser requisito mensurável, ação pontuada, condição de conclusão ou causa direta de
recompensa."*

| Eixo | Estado |
|---|---|
| Decisão de produto | ✅ **RESOLVIDA** |
| Implementação | ❌ **futura** — **Fase 11** (recompensa) e **Fase 12B** (Cultinho); superfície do Momento com Beni na fase que a reescrever |
| Validação | ❌ **futura** — validação **visual** de que a separação é perceptível pela criança |
| Risco técnico | ❌ **NÃO corrigido** — `E5.42`, `E5.43` e `E5.44` seguem abertos |
| Runtime | **intocado** |

**Relação entre os caminhos:** **B** é normativo · **C** é complemento técnico e redacional, e **não
substitui B** · **A não é adotada**.

---

## 5. `P-85` — o que mudou e o que não mudou

| Eixo | Antes da Fase 5 | Depois |
|---|---|---|
| Especificação documental | inexistente | ✅ **produzida e APROVADA pelo fundador em 2026-08-07** |
| Implementação técnica | inexistente | ❌ **inexistente** — **Fase 19** (runtime) e demais fases de §12 do plano |
| Validação | inexistente | ❌ **inexistente** — depende de aparelho real e de parecer jurídico externo |
| Status na matriz | `ABERTO` | **`ABERTO`** — inalterado |
| Classificação transversal | `ALTO` | **`ALTO`** — inalterada |
| Lançamento | `NÃO BLOQUEIA LANÇAMENTO` | **inalterado** |
| Risco técnico | não corrigido | **NÃO corrigido** |

Determinação literal do fundador: *"a especificação da Fase 5 está aprovada; `P-85` NÃO passa a
CORRIGIDO."* **Somente o eixo documental mudou.**

**Por que a coluna `Fase implementação = 5` não fecha o risco.** A linha 688 da §14 registra
`Fase implementação = 5` para `P-85`, e a §29 da matriz já explicava por quê: *"a entrega da Fase 5 é
documental por definição do critério de saída da `v5` linha 249"* — a Fase 5 entrega **especificação,
taxonomia de eventos, campos permitidos, retenção, mecanismo de desligamento e critérios de
privacidade**; a **Fase 19 implementa o runtime correspondente**. Entregar e aprovar a parte
documental **cumpre a coluna sem corrigir o risco**, porque o fato que originou `P-85` — *"zero
telemetria em todo o domínio do Brincar"* — continua **literalmente verdadeiro no código**. Nada em
`src/` mudou. **A coluna `Fase implementação = 5` não é alterada por este bloco.**

O mesmo raciocínio vale para **`P-127`** (Fase 9), **`P-139`** (Fase 6), **`P-141`** (Fase 19),
**`P-100`** (Fase 8A), **`P-92`** (Fase 20) e **`P-149`** (Fase 7): **nenhum foi corrigido**.

---

## 6. Reconciliação documental executada neste bloco

| Documento | O que mudou | O que **não** mudou |
|---|---|---|
| `docs/fase5-pareceres/05_…MEDICAO…md` | estado de aprovação, §7.3-bis, §13.4, §17, terminologia da Categoria 4, cerca do EAS Update, `E5.66` | nenhuma das 12 categorias, nenhuma retenção, nenhum limiar |
| `docs/fase5-pareceres/06_…PRIVACIDADE.md` | criado | — |
| `docs/fase5-pareceres/07_…CONSOLIDACAO…md` | este documento | — |
| `docs/DECISIONS.md` | §`PF5` estendida: `PF5-MEDICAO`, `PF5-ORACAO`, `PF5-TERMINOLOGIA`, `PF5-ENCERRAMENTO`; `PF5-FAIXA-ETARIA` e `PF5-P149` atualizados; duas faixas `P-01..P-148` corrigidas para `P-01..P-149` | nenhuma decisão anterior reaberta |
| `docs/fase3-reconciliacao/09_MATRIZ…md` | §30 acrescentada: recontagem auditada, eixo documental de `P-85`, ampliação de `P-149`, decisão `E5.41` | **nenhuma linha da §14**; nenhum status, nenhuma severidade, nenhuma fase proprietária |
| `docs/PROJECT_SOURCE_OF_TRUTH.md` | §1.1 ganha o parágrafo da Fase 5 | roadmap, precedência e ordem de execução |
| `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` | **nada** | **nada** — §7 deste documento explica por quê |

### 6.1 A correção de faixa `P-01..P-148` → `P-01..P-149`

Duas linhas da lista *"Itens PENDENTES / A CONFIRMAR"* de `DECISIONS.md` (blocos `PL4D` e `PL4E`)
diziam *"a matriz canônica (`P-01`..`P-148`)"*. Elas foram escritas **antes** de a Fase 5 criar
`P-149`.

**Declarado, não silencioso:** a faixa estava correta quando escrita e ficou desatualizada pela
criação de `P-149` no Bloco 0. As duas ocorrências passam a `P-01..P-149`. **Nenhum número de
contagem foi alterado por essa correção** — apenas a designação da faixa.

### 6.2 Por que `v5` **não** foi alterada

O roadmap `v5` §3 é o **único árbitro de sequência**. A Fase 5 não descobriu nenhuma fase nova,
não moveu nenhuma fase e não alterou nenhum critério de saída. O critério de saída da Fase 5
(`v5` linha 249, *"plano de medição anônima aprovado"*) foi **atendido no eixo documental** —
atendê-lo não é motivo para reescrever o documento que o define.

---

## 7. Dependências externas que permanecem vivas

> *"A ausência de revisão jurídica definitiva ou de revisor teológico humano NÃO pode ser
> mascarada."* — determinação do fundador, §8.

### 7.1 Dependências **jurídicas** — nenhuma satisfeita

| Código | O que falta | Quem resolve |
|---|---|---|
| `E5.6` | faixa 4 a 8 sobrevive à revisão jurídica | advogado |
| `E5.14` | consentimento parental verificável (LGPD Art. 14 · COPPA) | advogado |
| `E5.15` | **RIPD** | advogado / DPO |
| `E5.16` | análise de **ECA / ECA Digital** | advogado |
| `E5.17` | licenças de assets e de ferramentas de IA | licenciamento |
| `E5.18` | hospedagem, retenção e acordo do provedor de assinatura | provedor + advogado |
| `E5.22` | manifesto de privacidade do SDK no artefato — **NÃO RECUPERADO** | provedor |
| `E5.27` | declaração de conformidade de exportação | responsável legal |
| `E5.57` | terminologia e suficiência de `k ≥ 20` / `k ≥ 50` | advogado de dados e público infantil |

**Nove dependências jurídicas abertas. Zero pareceres jurídicos existem.** Continua **proibido**
declarar *"legalmente aprovado"*, *"100% conforme"*, *"nenhum risco"* ou *"anonimização garantida"*.

### 7.2 Dependências **teológicas** — nenhuma satisfeita

| Código | O que falta | Quem resolve |
|---|---|---|
| `E5.33` | **revisor bíblico humano** — nenhum identificado em documento algum | teólogo ou pastor, escolha do fundador |
| `E5.49` | leitura de `Fp 4:13` em contexto | o mesmo revisor |

**O portão de `BIBLICAL_CONTENT_STANDARD.md` linha 93 está violado por 20 histórias de 20.** Zero dos 20
relatórios `REVIEW_<storyId>.md` existe. A cobertura da revisão de 2026-06-01 sobre o texto **hoje no
app** é de **49 de 200 cenas (24,5%)**.

**Um agente de software não pode preencher esses relatórios** — o próprio projeto registrou que *"IA
pode ter introduzido interpretações não intencionais"*, o que torna a IA a parte auditada.

### 7.3 Dependências de **validação humana / física** — nenhuma satisfeita

`E5.9`, `E5.21`, `E5.24`, `E5.25`, `E5.28`, `E5.53`, `E5.61`, `E5.68`. **Nenhuma tela foi aberta,
nenhum aparelho foi usado, nenhum build foi inspecionado nesta fase.**

**Itens explicitamente classificados `NÃO RECUPERADO`** — ausência de evidência, **não** prova de
ausência: `E5.9` (chave de API no build), `E5.22` (manifesto do SDK no artefato), `E5.37` (documento
de narração não versionado). **O histórico remoto do EAS não foi consultado; build permanece NÃO
RECUPERADO.**

---

## 8. Itens que podem bloquear o lançamento

Recontados da §14 neste bloco.

### 8.1 `BLOQUEIA LANÇAMENTO` — 6 códigos

| Código | Assunto | Fase |
|---|---|---|
| `P-24` | Plano Família sem caminho de compra | 18 |
| `P-56` | `catch` *fail-open* no consumo de rodada | 12A |
| `P-63` | Galeria mostra "N de 0" e divide por zero | 12A |
| `P-67` | Quatro textos "Ateliê" visíveis à criança sobrevivem no Baú | **12A** — converge com `E5.66` |
| `P-93` | `EXPO_PUBLIC_REVENUECAT` ausente de todos os perfis | 18 |
| `P-141` | `avatarId` como identidade **e** endereço de armazenamento | 19 — trava `E5.60` |

### 8.2 `PODE BLOQUEAR LANÇAMENTO` — 45 códigos

Inclui **`P-149`** (textos de privacidade), **`P-92`** (manifesto de privacidade) e **`P-107`**
(ferramentas internas × Modo Igreja).

### 8.3 Bloqueadores que **não** são código

| Bloqueador | Natureza |
|---|---|
| Nove dependências jurídicas (§7.1) | terceiro externo |
| Revisor bíblico inexistente e portão violado 20/20 (§7.2) | terceiro externo |
| Data Safety e App Privacy não preenchidos (`E5.58`) | Fase 20 |
| Piloto com famílias e termo correspondente (`E5.61`) | Fase 21 |

---

## 9. Prova de que o runtime permanece intacto

| Verificação | Resultado |
|---|---|
| `git diff 015c438 -- src scripts assets App.js app.json eas.json package.json package-lock.json plugins` | **vazio** — nove caminhos bit a bit idênticos |
| `npm run smoke` | **4525/4525** |
| Arquivos alterados na Fase 5 | **exclusivamente** `docs/` |
| Dependências instaladas | **nenhuma** |
| Build gerado | **nenhum** — e o histórico remoto do EAS **não foi consultado**, logo build é **NÃO RECUPERADO**, não "ausente" |
| Metro aberto · app instalado · validação física | **nenhum** |

---

## 10. Parecer final do Bloco 7

1. **A Fase 5 está DOCUMENTALMENTE ENCERRADA.** Sete blocos, sete artefatos, setenta e um
   encaminhamentos, todos com destino declarado.

2. **Nenhum item está APROVADO PARA LANÇAMENTO.** Nenhum risco técnico foi corrigido. Nenhuma
   validação física ocorreu.

3. **A recontagem da matriz é manual e auditada, e confirma as dez contagens de §29.5.** Duas
   imprecisões de **rótulo de coluna** foram encontradas e declaradas; **nenhum número mudou**.

4. **`E5.41` está decidido (Caminho B) e não implementado.** `E5.42`, `E5.43` e `E5.44` seguem
   abertos.

5. **`P-85` teve o eixo documental aprovado e permanece `ABERTO`.**

6. **Dezenove dependências externas permanecem vivas** — **onze** de terceiro externo (nove delas
   jurídicas ou contratuais, duas teológicas) e **oito** de validação humana. **Nenhuma foi
   transformada em aprovação.**

7. **Dois encaminhamentos não têm fase numerada** (`E5.1`, `E5.2`) e um não recebeu a especificação
   que fora antecipada (`E5.8`). Declarados em §3.2 e §3.4.

8. **Nenhuma linha de runtime foi alterada em nenhum dos sete blocos.**

---

## 11. Próxima fase canônica

Segundo `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` §3 — **único árbitro de sequência**:

> ### **A próxima fase canônica é a FASE 6 — *shell* e *splash*.**

**Herança direta da Fase 5 para a Fase 6:** `E5.52` (habilitar o coletor de desempenho em perfil
interno do `eas.json`) e o risco **`P-139`**, cuja fase proprietária é **6**.

**A Fase 6 toca código.** Ela exige o ciclo SDD completo com os três portões humanos — a Fase 5 **não
autoriza** nenhuma implementação por ter encerrado seus documentos.

---

Documento anterior: [`06_DIVERGENCIA_DOS_TEXTOS_DE_PRIVACIDADE.md`](06_DIVERGENCIA_DOS_TEXTOS_DE_PRIVACIDADE.md)
