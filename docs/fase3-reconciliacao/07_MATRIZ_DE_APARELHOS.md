# 07 · Matriz de aparelhos

> **Artefato 7 de 11 — E015 · Fase 3G · Reconciliação**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch** | `integrate/colorir-canonical-runtime` |
| **HEAD** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza

**Este artefato não implementa funcionalidade.**

> ## ⛔ ESTE DOCUMENTO **NÃO DECLARA TABLET APROVADO**

`supportsTablet: true` em `app.json:17` é uma **declaração de configuração**, não uma validação.
Declarar suporte no manifesto do aplicativo e **ter sido testado num tablet real** são fatos
distintos, e este artefato os mantém separados em todas as células.

---

## 1 · Fontes técnicas principais

| Fonte | Papel |
|---|---|
| `app.json:6` | `"orientation": "portrait"` |
| `app.json:16-17` | `ios.supportsTablet: true` — **declaração** |
| `app.json:45` | bloco `android` |
| `docs/SPRINT_18_4_PHYSICAL_QA_REPORT.md:186-191` | Tabela "Dispositivos testados" |
| `docs/C60_VALIDACAO_FISICA.md` | Roteiro de validação física — iPhone real, Dev Client |
| `docs/STORE_RELEASE_READINESS_CHECKLIST.md` | Prontidão de loja |

---

## 2 · Correção metodológica herdada de E014

| # | Formulação incorreta | Formulação correta adotada |
|--:|---|---|
| 5 | ~~"Zero mídia validada fisicamente."~~ | **Zero auditorias físicas individuais** dos 200 arquivos. **Preservar** as validações físicas históricas dos fluxos que consumiram mídia, packs, áudio e recovery. |

> Aplicação direta: esta matriz **preserva** as validações de fluxo já realizadas no iPhone e as
> registra como `VALIDADO NO FLUXO INDICADO`. Não as apaga, não as generaliza para outros
> aparelhos e não as converte em aprovação de arquivo individual.

---

## 3 · As cinco marcações de célula

| Marcação | Significado exato |
|---|---|
| **`VALIDADO NO FLUXO INDICADO`** | Houve teste físico **daquele fluxo**, naquele aparelho, com registro documental. Não se estende a outros fluxos nem a outros aparelhos. |
| **`VALIDAÇÃO HISTÓRICA PARCIAL`** | Houve teste físico de parte do fluxo, ou em condição próxima mas não idêntica. |
| **`NÃO TESTADO`** | Nenhum teste físico registrado. Estado neutro — não é reprovação. |
| **`EXIGE TESTE`** | `NÃO TESTADO` **e** com risco identificado que torna o teste necessário antes do Product Lock. |
| **`NÃO APLICÁVEL`** | A combinação não existe ou não faz sentido no produto. |

### 3.1 · Correspondência com a classificação canônica de E015

| Marcação local | Classificação canônica de E015 |
|---|---|
| **`VALIDADO NO FLUXO INDICADO`** | `COMPROVADO FISICAMENTE` |
| **`VALIDAÇÃO HISTÓRICA PARCIAL`** | `COMPROVADO PELO DOCUMENTO` |
| **`NÃO TESTADO`** · **`EXIGE TESTE`** | `NÃO DETERMINADO` |
| **`NÃO APLICÁVEL`** | `INTERNO` |

### 3.2 · Perfis de build **não** são validação de aparelho

`eas.json` declara **quatro perfis de build**: `development` (`:7`), `preview` (`:17`),
`production` (`:46`) e `screenshot` (`:58`). — `COMPROVADO PELO ARQUIVO`

> **A existência de um perfil não valida nenhum aparelho.** Um perfil é configuração de build; uma
> célula desta matriz é teste físico executado e registrado. Nenhum dos quatro perfis está aqui
> declarado validado, testado ou aprovado — nem individualmente, nem por existir.

| Afirmação | Estado |
|---|---|
| Os quatro perfis existem em `eas.json` | **sim** — `COMPROVADO PELO ARQUIVO` |
| Algum perfil foi executado e teve o artefato testado fisicamente nesta auditoria | **não** — `NÃO DETERMINADO` |
| Existe correspondência registrada entre perfil e aparelho testado | **não** — `NÃO DETERMINADO` |

---

## 4 · O que o registro documental efetivamente diz

### 4.1 · A tabela de dispositivos testados

`SPRINT_18_4_PHYSICAL_QA_REPORT.md:186-191`, verbatim:

| Dispositivo | Resultado |
|---|---|
| iPhone | ✓ Aprovado — teste físico realizado |
| Android real | Pendente — não testado fisicamente nesta sprint; registrar como validação futura |

E `:166`, verbatim: **"SIM — aprovada para produção no escopo testado (iPhone)."**
E `:176`: *"validação em Android real ainda não realizada. Registrar como validação futura — não
bloqueia o avanço para Sprint 19."*

> **Leitura precisa:** a aprovação é **explicitamente qualificada pelo escopo** — iPhone.
> O próprio documento histórico recusou generalizar. Esta matriz preserva essa recusa.
> — `COMPROVADO PELO DOCUMENTO`

### 4.2 · O padrão de validação física do projeto

`C60_VALIDACAO_FISICA.md` estabelece o método: *"o fundador, no **iPhone real** (Dev Client)"*
(`:18`, `:855`, `:1102`), com vídeo por item. Duas afirmações verbatim delimitam a autoridade:

> `:844` — *"Este relatório **não** declara aprovação: ela é do fundador, no iPhone."*
> `:378` — *"O que **só** o aparelho fecha: o toque, …"*

Nenhum aparelho **além do iPhone** aparece como sujeito de validação em nenhum desses roteiros.
— `COMPROVADO PELO DOCUMENTO`

### 4.3 · O que a configuração declara

| Chave | Valor | O que significa | O que **não** significa |
|---|---|---|---|
| `ios.supportsTablet` | `true` | O binário iOS **aceita** rodar em iPad | **Não** significa layout verificado nem aprovação em iPad |
| `orientation` | `portrait` | O app trava em retrato | Reduz — mas não elimina — a superfície de risco em tela grande |

— `COMPROVADO PELO ARQUIVO`

---

## 5 · A matriz — 16 classes e condições de aparelho

**Legenda de colunas (fluxos):**
**F1** boot e onboarding · **F2** Livrinho e áudio · **F3** Colorir e Ateliê ·
**F4** packs, download e recuperação · **F5** paywall e entitlement · **F6** overlays e guia

| # | Classe / condição | F1 | F2 | F3 | F4 | F5 | F6 |
|--:|---|---|---|---|---|---|---|
| 1 | **iPhone moderno, Dev Client** (aparelho de referência do fundador) | VALIDADO NO FLUXO INDICADO | VALIDADO NO FLUXO INDICADO | VALIDADO NO FLUXO INDICADO | VALIDADO NO FLUXO INDICADO | VALIDAÇÃO HISTÓRICA PARCIAL | VALIDADO NO FLUXO INDICADO |
| 2 | **iPhone moderno, build de produção** (TestFlight / loja) | VALIDAÇÃO HISTÓRICA PARCIAL | VALIDAÇÃO HISTÓRICA PARCIAL | VALIDAÇÃO HISTÓRICA PARCIAL | EXIGE TESTE | EXIGE TESTE | VALIDAÇÃO HISTÓRICA PARCIAL |
| 3 | **iPhone de tela pequena** (classe SE) | NÃO TESTADO | NÃO TESTADO | EXIGE TESTE | NÃO TESTADO | NÃO TESTADO | EXIGE TESTE |
| 4 | **iPhone antigo / pouca memória** | EXIGE TESTE | NÃO TESTADO | EXIGE TESTE | NÃO TESTADO | NÃO TESTADO | NÃO TESTADO |
| 5 | **iPhone com recorte de tela** (notch / ilha dinâmica) | VALIDAÇÃO HISTÓRICA PARCIAL | VALIDAÇÃO HISTÓRICA PARCIAL | VALIDAÇÃO HISTÓRICA PARCIAL | NÃO TESTADO | NÃO TESTADO | VALIDAÇÃO HISTÓRICA PARCIAL |
| 6 | **iPad — tablet iOS** | **NÃO TESTADO** | **NÃO TESTADO** | **EXIGE TESTE** | **NÃO TESTADO** | **NÃO TESTADO** | **EXIGE TESTE** |
| 7 | **Android telefone moderno** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** |
| 8 | **Android telefone de baixo custo** | EXIGE TESTE | NÃO TESTADO | EXIGE TESTE | NÃO TESTADO | NÃO TESTADO | NÃO TESTADO |
| 9 | **Android tablet** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** | **NÃO TESTADO** |
| 10 | **Modo de baixa energia** | VALIDAÇÃO HISTÓRICA PARCIAL | NÃO TESTADO | NÃO TESTADO | NÃO TESTADO | NÃO TESTADO | NÃO TESTADO |
| 11 | **Fonte do sistema ampliada / acessibilidade** | NÃO TESTADO | NÃO TESTADO | NÃO TESTADO | NÃO APLICÁVEL | NÃO TESTADO | VALIDAÇÃO HISTÓRICA PARCIAL |
| 12 | **Armazenamento quase cheio** | NÃO TESTADO | NÃO TESTADO | EXIGE TESTE | **EXIGE TESTE** | NÃO APLICÁVEL | NÃO TESTADO |
| 13 | **Offline total (modo avião)** | NÃO TESTADO | VALIDAÇÃO HISTÓRICA PARCIAL | NÃO TESTADO | VALIDADO NO FLUXO INDICADO | **EXIGE TESTE** | NÃO TESTADO |
| 14 | **Rede lenta ou instável** | NÃO TESTADO | NÃO TESTADO | NÃO APLICÁVEL | **EXIGE TESTE** | EXIGE TESTE | NÃO TESTADO |
| 15 | **Rotação forçada pelo sistema** | NÃO TESTADO | NÃO TESTADO | EXIGE TESTE | NÃO APLICÁVEL | NÃO TESTADO | NÃO TESTADO |
| 16 | **Simulador / emulador** | VALIDAÇÃO HISTÓRICA PARCIAL | VALIDAÇÃO HISTÓRICA PARCIAL | **NÃO APLICÁVEL** | VALIDAÇÃO HISTÓRICA PARCIAL | NÃO APLICÁVEL | VALIDAÇÃO HISTÓRICA PARCIAL |

### 5.1 · Notas por linha

1. **Linha 1** — é a única com validação física sistemática e documentada por vídeo. F5 é parcial: o registro de compra real e restauração completa **não** foi localizado nos roteiros auditados.
2. **Linha 6 (iPad)** — `supportsTablet: true` é declaração de `app.json`. **Nenhuma célula desta linha está validada.** F3 e F6 são `EXIGE TESTE` porque canvas e overlays são os que mais dependem de área de tela.
3. **Linhas 7 e 9 (Android)** — a documentação histórica é explícita: *"Android real ainda não realizada"*. Todas as células `NÃO TESTADO`, sem exceção.
4. **Linha 10** — `C60_VALIDACAO_FISICA.md:234,684` prescreve repetir aberturas em modo de baixa energia. Registro de execução: parcial.
5. **Linha 12** — armazenamento cheio é o caminho direto para falha de download e de recuperação de pack; `EXIGE TESTE` em F4.
6. **Linha 13** — a operação offline dos fluxos de pack e recuperação **tem** validação física de fluxo registrada. **F5 exige teste**: entitlement offline com cache expirado é caminho *fail-closed* não exercitado fisicamente.
7. **Linha 16** — `NÃO APLICÁVEL` em F3 e F5: canvas por toque e compra real não são validáveis em simulador.

---

## 6 · Contagem

| Marcação | Células | % de 96 |
|---|---:|---:|
| `VALIDADO NO FLUXO INDICADO` | 6 | 6,3% |
| `VALIDAÇÃO HISTÓRICA PARCIAL` | 16 | 16,7% |
| `NÃO TESTADO` | 51 | 53,1% |
| `EXIGE TESTE` | 16 | 16,7% |
| `NÃO APLICÁVEL` | 7 | 7,3% |
| **Total** | **96** | **100%** |

> **Leitura honesta:** cerca de **23%** da matriz tem alguma validação física, e ela está
> concentrada numa única classe de aparelho. **Android inteiro e tablet inteiro estão sem
> validação física.**

---

## 7 · O que este artefato **não** declara

1. **Não declara tablet aprovado** — nem iPad, nem Android tablet.
2. **Não declara Android aprovado** em nenhuma classe.
3. **Não converte `supportsTablet: true` em validação.**
4. **Não converte validação de fluxo em aprovação de aparelho**, nem o contrário.
5. **Não reprova** nenhum aparelho — `NÃO TESTADO` é ausência de dado, não veredito negativo.
6. **Não define a matriz mínima de lançamento** — isso é decisão de Product Lock.

---

## 8 · Decisões já aprovadas que não podem ser reabertas

1. **Validação física é do fundador, no aparelho** — nenhum relatório declara aprovação por si
   (`C60_VALIDACAO_FISICA.md:844,1094`).
2. **Orientação retrato** é a configuração do produto (`app.json:6`).
3. **Smoke e expo-doctor não substituem validação visual e física** (AGENTS.md).
4. **Android real ficou registrado como validação futura** e, no contexto histórico, **não
   bloqueou** o avanço da Sprint 19 — decisão registrada, preservada aqui sem reinterpretação.

## 9 · Itens não determinados

1. Quais modelos e versões de sistema compõem a matriz mínima de lançamento.
2. Se algum tablet foi sequer aberto informalmente — **nenhum registro**.
3. Comportamento do canvas (Ateliê e Colorir) em área de tela de tablet.
4. Comportamento do WebView do canvas em Android.
5. Compra e restauração reais em ambiente de produção.

## 10 · Fases proprietárias

| Assunto | Fase |
|---|---|
| Definição da matriz mínima de aparelhos | **4** |
| Campanha de validação física | **8** e **9** |
| Ajustes de layout para tela grande | **11** |
| Conformidade e prontidão de loja | **18** e **19** |

---

*Fim do artefato 7 de 11. Nenhum aparelho foi declarado aprovado além do escopo já registrado
historicamente. Nenhum teste físico foi executado nesta etapa.*
