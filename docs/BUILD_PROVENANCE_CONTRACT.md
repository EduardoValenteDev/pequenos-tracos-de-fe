# Contrato de Proveniência de Build — Pequenos Traços de Fé

> **Criado no bloco `F6.1` · 2026-08-24.** Define **o que precisa ser verdade** para que um binário
> físico conte como **evidência** neste projeto. Cumpre a exigência de
> [`V6-D03`](DECISIONS.md#v6-d03--convergência-androidios-e-proveniência-de-build), que determinou
> que *"todo build de evidência tem proveniência rastreável"* mas **não** definiu o mecanismo.
>
> **Este documento não gera build, não autoriza build e não concede `PASS` a nenhum build.**
> Ele define um **contrato**. A execução pertence a **`F6.8`**.

---

## 1. Por que este contrato existe

O risco canônico [`P-170`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md) enuncia o
problema em uma linha: **não existe artefato que ligue um binário físico já instalado ao `commit`,
à árvore, ao perfil de build e ao manifesto de conteúdo que o produziram.**

A consequência prática é grave e já se materializou: uma campanha física pode conceder `PASS` a um
artefato cuja origem não é demonstrável, e o `PASS` pode acabar atribuído ao commit errado. O
inventário da `ETAPA 8` de `F6.1` mediu exatamente isso — ver
[`BUILD_REGISTRY.md`](BUILD_REGISTRY.md).

### 1.1 O que **já existia** e por que **não** basta

Este contrato **não duplica** nada. A busca prévia foi feita e está declarada:

| Mecanismo existente | O que faz | Por que **não** é este contrato |
|---|---|---|
| [`BUILD_SIZE_LOG.md`](BUILD_SIZE_LOG.md) | Registra **peso** do artefato ao longo do tempo | Mede **tamanho**, não **origem**. Não estabelece vínculo binário ↔ commit |
| `D-FUND-PREBUILD-01` | Custódia do aparelho: **não instalar, não desinstalar, não substituir** | Norma de **custódia**, não de **proveniência** |
| `D-FUND-BUILD-SEQUENCE-01` | **Sequenciamento**: o build nativo vai à frente | Decisão de **ordem**, não de **rastreabilidade** |
| `D-FUND-HISTORICAL-INSTALL-BASELINE-01` + [artefato `29`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/29_HISTORICAL_INSTALL_GATE_20260813.md) | Prova **retrospectiva e pontual** de **uma** instalação | Prova **um caso**, não institui **regra** para os próximos |
| `V6-D03` | **Exige** proveniência rastreável | Estabelece a **obrigação**; não define o **formato** nem onde vive |
| Painel do EAS / `eas build:list` | Guarda `gitCommitHash`, perfil, data | Fonte **externa, mutável e não versionada**. Um binário no aparelho **não carrega** esse dado consigo |

**A lacuna real:** o dado de origem existe **fora** do repositório e **fora** do binário. Este
contrato o traz para dentro do repositório e o carimba no artefato.

---

## 2. Definição — o que é `PROVENIÊNCIA COMPLETA`

Um build possui **proveniência completa** quando **todos** os campos abaixo existem, são
verificáveis e estão registrados em **artefato versionado** deste repositório.

| # | Campo | Significado | Fonte de verdade |
|---|---|---|---|
| 1 | `BUILD_ID` | Identificador único do build | EAS |
| 2 | `PLATFORM` | `IOS` \| `ANDROID` | EAS |
| 3 | `PROFILE` | Perfil de `eas.json` usado | EAS |
| 4 | `GIT_COMMIT` | SHA **completo** (40) do commit de origem | EAS + `git cat-file -e` |
| 5 | `GIT_TREE` | SHA da **árvore** do commit (`git rev-parse <commit>^{tree}`) | Repositório |
| 6 | `GIT_BRANCH` | Ramo declarado na geração | Operador |
| 7 | `WORKING_TREE_STATE` | `CLEAN` \| `DIRTY` no momento da geração | EAS |
| 8 | `APP_VERSION` / `BUILD_NUMBER` / `VERSION_CODE` | Identidade declarada em `app.json` | Repositório |
| 9 | `RUNTIME_VERSION` | Versão de runtime, ou **`AUSENTE`** declarado | `app.json` |
| 10 | `SDK_VERSION` | SDK Expo | EAS |
| 11 | `ARTIFACT_SHA256` | Hash do arquivo `.apk` / `.ipa` baixado | Operador, medido |
| 12 | `GATES` | `verify:runtime` e `expo-doctor` **do commit de origem**, com números | Operador, medido |
| 13 | `PURPOSE` | Para que o build existe | Missão que o autorizou |
| 14 | `INSTALL_EVENTS` | Onde foi instalado, quando, com que saída literal | Operador, medido |

### 2.1 Graus de proveniência — vocabulário fechado

Estas são as **únicas** classificações admitidas. Nenhum build recebe rótulo fora desta lista.

| Grau | Condição |
|---|---|
| `PROVENANCE_COMPLETE` | Os **14** campos presentes e verificados em artefato versionado |
| `PROVENANCE_KNOWN` | `GIT_COMMIT` conhecido, existente no repositório e **ancorado por `BUILD_ID` em documento versionado** |
| `PROVENANCE_PARTIAL` | `GIT_COMMIT` conhecido apenas por **fonte externa** (EAS); nenhum documento versionado cita o `BUILD_ID` |
| `PROVENANCE_UNKNOWN` | `GIT_COMMIT` ausente, ou commit não existente no repositório, ou vínculo não demonstrável |

**Regra de honestidade:** na dúvida entre dois graus, vale **sempre o menor**. Um grau **não** se
concede por plausibilidade, por proximidade de data ou por ser "o candidato mais provável".

### 2.2 A distinção que mais importa

> ⛔ **Proveniência do ARTEFATO ≠ proveniência do BINÁRIO INSTALADO.**
>
> Saber de qual commit um build **saiu** não prova qual build está **dentro do aparelho**. A segunda
> afirmação exige medição **no dispositivo** — hash do binário, `firstInstallTime`, `codePath` ou
> equivalente iOS. Sem essa medição, o binário instalado é `PROVENANCE_UNKNOWN`, **mesmo que** o
> build candidato tenha proveniência completa.

---

## 3. Obrigações — o que `F6.8` deve cumprir a cada build de evidência

1. **Registrar antes de instalar.** A linha do build entra em
   [`BUILD_REGISTRY.md`](BUILD_REGISTRY.md) **antes** de qualquer instalação em aparelho.
2. **Mesmo `HEAD` para as duas plataformas.** iOS e Android de uma mesma campanha derivam do
   **mesmo commit**, salvo exceção **documentada na própria linha do registro** (`V6-D03`).
3. **Árvore limpa.** `WORKING_TREE_STATE = DIRTY` **desqualifica** o build como evidência.
4. **Portões medidos no commit de origem.** `npm run verify:runtime` e `npx expo-doctor` verdes,
   com **números transcritos**, não presumidos.
5. **Hash do artefato.** `ARTIFACT_SHA256` medido sobre o arquivo baixado.
6. **Instalação é evento próprio.** Cada instalação vira `INSTALL_EVENT` com data, aparelho, saída
   literal do comando e código de saída. A custódia de `D-FUND-PREBUILD-01` continua vigente:
   **qualquer instalação futura exige missão e gate próprios.**
7. **Sem proveniência, sem prova.** Um build que não satisfaça este contrato **não pode** sustentar
   `PASS` de campanha física. Ele pode existir; apenas **não vale como evidência**.

---

## 4. O manifesto de baseline — gerado **fora** do Git

O carimbo factual de uma baseline (`HEAD`, árvore, números de portão, hashes de identidade) é
gerado **fora do repositório**, em `C:\tmp\`, **depois** do commit final do bloco.

**Motivo declarado — autorreferência é impossível:** um arquivo **commitado** não consegue conter o
SHA do commit que o contém; escrever o SHA muda o conteúdo, que muda a árvore, que muda o SHA.
Um manifesto que tentasse fazê-lo estaria **necessariamente desatualizado ou mentindo**.

**Consequência:** o manifesto externo é o **carimbo**; este contrato e o registro são a **regra** e
a **memória**. Os três se complementam e nenhum substitui o outro.

---

## 5. Superfície de Build Info no app — `DEFERRED_TO_F6.8`

Exibir origem do build **dentro do app** — commit, perfil, data, `BUILD_ID` — exigiria **nova
superfície de interface**, e `F6.1` é bloco de **baseline e identidade**, não de produto.

> **`BUILD_INFO_UI = DEFERRED_TO_F6.8`**
>
> Nenhuma tela, nenhum componente, nenhuma rota e nenhum texto de interface foram criados,
> alterados ou planejados em `F6.1` para este fim. A decisão sobre **existir**, **onde viver** e
> **sob qual gate** pertence a `F6.8`. Nada aqui antecipa fases posteriores.

---

## 6. O que este contrato **não** faz

Não gera build. Não autoriza build. Não instala nada. Não concede `PASS`. Não reclassifica nenhum
build histórico para melhor. Não altera `eas.json`, `app.json`, código executável ou assets. Não
cria superfície de interface. Não substitui [`BUILD_SIZE_LOG.md`](BUILD_SIZE_LOG.md), que continua
sendo o registro de **peso**. Não revoga nenhuma decisão de custódia — `D-FUND-PREBUILD-01`,
`D-FUND-BUILD-SEQUENCE-01` e `D-FUND-HISTORICAL-INSTALL-BASELINE-01` seguem **integralmente
vigentes**.

---

*Contrato criado em `F6.1`. Consumido em `F6.8`. Risco associado: `P-170`.*
