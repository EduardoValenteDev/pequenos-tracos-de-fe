# Registro Histórico de Builds — Pequenos Traços de Fé

> **Criado no bloco `F6.1` · 2026-08-24.** Traz para **dentro do repositório** a origem de cada
> binário já gerado, que até aqui vivia apenas no painel do EAS — fonte **externa, mutável e não
> versionada**. Aplica o vocabulário de
> [`BUILD_PROVENANCE_CONTRACT.md`](BUILD_PROVENANCE_CONTRACT.md).
>
> ⛔ **Nada aqui concede `PASS` a build nenhum.** Este é um **inventário de origem**, não um
> veredito de qualidade. **Nenhum build foi gerado em `F6.1`.**

---

## 1. Estado medido em 2026-08-24

| Campo | Valor |
|---|---|
| Builds conhecidos na conta EAS | **27** |
| `FINISHED` | 25 |
| `ERRORED` | 2 |
| Com `gitCommitHash` registrado | **27 / 27** |
| Com árvore de trabalho `CLEAN` na geração | **27 / 27** |
| Commits distintos de origem | **24** |
| Commits **ancestrais** do `HEAD` canônico | **24 / 24** |
| `appVersion` / `buildNumber` distintos | **1** — todos `1.0.0` / `1` |
| Com `runtimeVersion` | **0 / 27** |
| `PROVENANCE_COMPLETE` | **0** |
| `PROVENANCE_KNOWN` | **16** |
| `PROVENANCE_PARTIAL` | **11** |
| `PROVENANCE_UNKNOWN` | **0** |
| `CURRENT_CANONICAL` | **0** |

### 1.1 Três leituras que este inventário permite

**a) A convergência da linha canônica ganhou prova independente.** Os **24** commits distintos que
produziram binário são **todos ancestrais** do `HEAD` canônico. Nenhum artefato físico jamais
existiu a partir de código fora desta linha — o que confirma, por um caminho que não passa por
`git merge-base`, o resultado da `ETAPA 2` de `F6.1`.

**b) O problema real não é a origem: é a identidade.** Os **27** builds compartilham `appVersion`
`1.0.0` e `buildNumber`/`versionCode` `1`, e **nenhum** carrega `runtimeVersion`. Dois binários de
commits diferentes são, para o aparelho, **indistinguíveis**. É exatamente o que os riscos
[`P-94`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md) e `P-137` já descreviam, e é a
raiz mecânica de [`P-170`](fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md).

**c) Nenhum build é canônico hoje.** `CURRENT_CANONICAL = 0`. Todo binário existente antecede a
baseline canônica de `F6.1`. Gerar o primeiro build canônico pertence a **`F6.8`** — `F6.1` está
**proibida** de gerar build.

---

## 2. Inventário

`RUNTIME` é `AUSENTE` em todas as linhas: nenhum build declarou `runtimeVersion`.
Todos os 27 têm `appVersion 1.0.0`, `buildNumber`/`versionCode 1`, SDK `54.0.0`,
`distribution INTERNAL` e árvore `CLEAN` — por serem constantes, saíram da tabela.

| `BUILD_ID` | Plataforma | Data | Perfil | Status | `GIT_COMMIT` | `RUNTIME` | Ancoragem versionada | Classificação |
|---|---|---|---|---|---|---|---|---|
| `71c09ff5` | IOS | 2026-08-22 | `preview` | FINISHED | `aeda9c21ee6c` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `a5981b54` | ANDROID | 2026-08-18 | `preview` | FINISHED | `6f54b1969ddf` | AUSENTE | `79_R7_ATTEMPT_04_APK_INSTALL_E_PRE_FISICO.md 80_R7_ATTEMPT_04_POS_PASS_E_HUMAN_GATE_SG_A.md` | `PROVENANCE_KNOWN` |
| `f6c2c54d` | ANDROID | 2026-08-18 | `preview` | FINISHED | `d3703805240d` | AUSENTE | `76_R7_ATTEMPT_03_FINISHED_APK_INSTALL_E_PRE_FISICO.md 77_R7_ATTEMPT_03_STOP_C60_RELEASE_ASSET_MINI_SDD.md` | `PROVENANCE_KNOWN` |
| `34518222` | ANDROID | 2026-08-18 | `preview` | FINISHED | `32c8262495b1` | AUSENTE | `72_R7_ATTEMPT_02_PREVIEW_E_PRE_T090_P139.md 73_R7_STOP_PRODUCT_DEFECT_COLORIR_60_AUSENTE_PREVIEW.md` | `PROVENANCE_KNOWN` |
| `3a0ee8c6` | ANDROID | 2026-08-18 | `preview` | ERRORED | `3fe9814ec419` | AUSENTE | `69_R7_BUILD_PREVIEW_DESPACHADO_STOP_EXTERNAL_GATE.md 70_R7_BUILD_ERRORED_MANIFEST_RESOURCE.md 71_MINI_SDD_CORRECAO_NATIVA_D1_R7.md` | `PROVENANCE_KNOWN` |
| `1d0766f9` | ANDROID | 2026-08-18 | `preview` | ERRORED | `3fe9814ec419` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `a123250f` | ANDROID | 2026-08-13 | `development` | FINISHED | `521d59c14f26` | AUSENTE | `DECISIONS.md 28_BUILD_NATIVE_01_EVIDENCE.md 29_HISTORICAL_INSTALL_GATE_20260813.md` | `PROVENANCE_KNOWN` |
| `c22b43b9` | ANDROID | 2026-08-13 | `development` | FINISHED | `8086cdacb2a8` | AUSENTE | `29_HISTORICAL_INSTALL_GATE_20260813.md 83_F6_SG_B_B5_AUDITORIA_DE_RETOMADA_E_PRE_FISICO.md` | `PROVENANCE_KNOWN` |
| `b63d7bcc` | IOS | 2026-08-10 | `development` | FINISHED | `1ae353f7ebec` | AUSENTE | `08_SEQUENCIA_OPERACIONAL_UNICA_F6_SG_A.md` | `PROVENANCE_KNOWN` |
| `60d0e4c1` | IOS | 2026-08-07 | `development` | FINISHED | `7c12987622d0` | AUSENTE | `07_CAMPANHA_FISICA_F6_SG_A.md` | `PROVENANCE_KNOWN` |
| `df4a4803` | IOS | 2026-08-07 | `development` | FINISHED | `7c12987622d0` | AUSENTE | `07_CAMPANHA_FISICA_F6_SG_A.md` | `PROVENANCE_KNOWN` |
| `c05a5800` | ANDROID | 2026-08-07 | `development` | FINISHED | `f10370e9059d` | AUSENTE | `07_CAMPANHA_FISICA_F6_SG_A.md 09_BOOT_BUNDLE_BLOCKED_ANDROID_E_GATE_DE_BUNDLEABILIDADE.md 29_HISTORICAL_INSTALL_GATE_20260813.md` | `PROVENANCE_KNOWN` |
| `98e2b422` | IOS | 2026-08-04 | `c60-pilot` | FINISHED | `7f96ee939cb1` | AUSENTE | `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md PROJECT_SOURCE_OF_TRUTH.md spec-onboarding-first-adventure.md` | `PROVENANCE_KNOWN` |
| `bafb8e3f` | IOS | 2026-08-04 | `c60-pilot` | FINISHED | `b24c86842a03` | AUSENTE | `C60_VALIDACAO_FISICA.md DECISIONS.md DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` | `PROVENANCE_KNOWN` |
| `3b4dea54` | IOS | 2026-08-03 | `c60-pilot` | FINISHED | `1e2f8dd33ba6` | AUSENTE | `DECISIONS.md DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md AUDITORIA_READONLY_C60_CONCLUSAO.md` | `PROVENANCE_KNOWN` |
| `74a80f66` | IOS | 2026-08-01 | `c60-pilot` | FINISHED | `8fd0367bd44d` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `10fce052` | IOS | 2026-07-31 | `development` | FINISHED | `7c12987622d0` | AUSENTE | `DECISIONS.md 09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md 00_AUDITORIA_SOMENTE_LEITURA.md` | `PROVENANCE_KNOWN` |
| `64f3f90e` | IOS | 2026-07-29 | `preview-criador` | FINISHED | `26d2b574f8d9` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `db0bff6d` | IOS | 2026-07-29 | `preview` | FINISHED | `eb871f506169` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `0a24d48b` | IOS | 2026-07-14 | `development` | FINISHED | `53e7ce4a4f9f` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `fdb93719` | ANDROID | 2026-07-13 | `screenshot` | FINISHED | `dd8841c27472` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `a8abb7db` | ANDROID | 2026-07-13 | `screenshot` | FINISHED | `a63edc13661b` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `efeca3dc` | IOS | 2026-07-11 | `development` | FINISHED | `00030364ad39` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `1f8bbf93` | IOS | 2026-07-09 | `screenshot` | FINISHED | `06ec4b793806` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `747027ea` | IOS | 2026-07-08 | `development` | FINISHED | `0b11d72b47d4` | AUSENTE | — | `PROVENANCE_PARTIAL` |
| `eb1bad08` | ANDROID | 2026-07-02 | `preview` | FINISHED | `e6ccaa4e62dd` | AUSENTE | `BUILD_SIZE_LOG.md 06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md 67_EXECUCAO_AMPLIADA_PRE_STOP_FISICO_E1_E3_R7.md` | `PROVENANCE_KNOWN` |
| `51bc7e68` | ANDROID | 2026-05-27 | `preview` | FINISHED | `8d44c70b0cd5` | AUSENTE | `06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md 67_EXECUCAO_AMPLIADA_PRE_STOP_FISICO_E1_E3_R7.md` | `PROVENANCE_KNOWN` |

---

## 3. O binário instalado em cada aparelho

Aqui vale a distinção do contrato §2.2: **saber de qual commit um build saiu não prova qual build
está dentro do aparelho.**

### 3.1 Tablet Android `SM-X510` (`RX2XC003LTJ`) — **cadeia provada**

O tablet é o **único** aparelho do projeto cuja sequência de binários está provada por medição,
e não por inferência. A cadeia tem **quatro** eventos documentados, cada um com saída literal de
comando:

| # | Data e hora | `BUILD_ID` | Perfil | Commit de origem | Prova | Registro |
|---|---|---|---|---|---|---|
| 1 | `2026-08-10 12:03:42` | não determinado | — | — | `firstInstallTime` do pacote, preservado em todas as trocas seguintes | [artefato `26`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/26_PREBUILD_CUSTODY_HARD_STOP.md) |
| 2 | `2026-08-13 02:00:59` | `a123250f` | `development` | `521d59c14f…` | Binário **bit a bit** idêntico ao do `BUILD NATIVE 01` (`SHA256 0273951…97262E`); *upgrade in-place*, `codePath` novo, acervo byte-idêntico (`14`/`14`, `RKStorage SHA256 950D93D1…FFA1`) | [artefato `29`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/29_HISTORICAL_INSTALL_GATE_20260813.md) · `D-FUND-HISTORICAL-INSTALL-BASELINE-01` |
| 3 | `2026-08-18 20:07:05` | `a5981b54` | `preview` (release, **não** *debuggable*) | `6f54b1969ddf…` | APK periciado: `265.335.678` bytes, `SHA256 FE7F071D…D67E6E`; `Success`; `ceDataInode 137433` e `firstInstallTime` preservados | [artefato `79`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/79_R7_ATTEMPT_04_APK_INSTALL_E_PRE_FISICO.md) |
| 4 | **`2026-08-19 14:16:51`** | **`c22b43b9`** | `development` (**`DEBUGGABLE`**) | `8086cdacb2a8…` | `Performing Streamed Install` / `Success`, `227.650.294` bytes, `10,6 s`, `exit 0`; `ceDataInode 137433`, `deDataInode 127446` e `firstInstallTime` inalterados dos dois lados da troca | [artefato `83` §8.1](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/83_F6_SG_B_B5_AUDITORIA_DE_RETOMADA_E_PRE_FISICO.md), confirmado por [artefato `85`](../specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/85_F6_SG_C_ADJUDICACAO_FISICA_E_HUMAN_GATE.md) |

**Último binário nativo provado no tablet: `c22b43b9`, instalado em `2026-08-19 14:16:51`.**
Grau: **`PROVENANCE_COMPLETE` quanto ao vínculo binário ↔ commit.**

> **A baseline de `D-FUND-HISTORICAL-INSTALL-BASELINE-01` (evento 2) não é o estado mais recente.**
> Ela continua **canônica como registro histórico** do que foi provado em 13/08, e a decisão **não
> é revogada** — apenas foi **superada pelos fatos** dos eventos 3 e 4, ambos igualmente provados
> e igualmente preservadores de dados. O passado documental não é reescrito.

#### 3.1.1 O detalhe que o evento 4 impõe — *dev client* desacopla binário e conteúdo

O binário hoje instalado é um ***development build***. Um *dev client* **não fixa o JavaScript ao
commit que gerou o binário**: ele carrega o *bundle* servido pelo Metro da *worktree* em uso. O
próprio artefato `83` mede isso, ao registrar `CORRECT_JS_HEAD_PATH` com JS de `ad01365` sobre um
binário construído de `8086cdac`.

> **Consequência para a proveniência:** no tablet, `BUILD_ID` prova a **camada nativa**, **não** o
> conteúdo executado. Provar o que rodou exige registrar **também** o `HEAD` do Metro daquela
> sessão. Um perfil `preview`/`production` não tem essa ambiguidade — é por isso que a campanha
> canônica de `F6.8` deve correr sobre binário **não** *debuggable*, com o JS embarcado.

> ⚠️ **`CURRENT_DEVICE_STATE_NOT_YET_MEASURED` continua vigente.** O evento 4 é a última baseline
> **conhecida**, não o **estado presente**: o aparelho não é medido desde `2026-08-19 14:16:51`.
> Este registro **não** revoga esse limite.

### 3.2 iPhone do fundador — **`HISTORICAL_PROVENANCE_UNKNOWN`**

> ### ⛔ `INSTALLED_IPHONE_BUILD = HISTORICAL_PROVENANCE_UNKNOWN`

A [`v6` §9](roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md) registra, em `F6-BUILD-01`, que
*"iPhone instalado representa build antigo com conteúdo divergente"*. Que o binário é **antigo e
divergente** está declarado. **Qual** binário é, **não**.

**Buscas negativas declaradas.** Nenhum documento versionado do repositório cita o `BUILD_ID`
`71c09ff5`; nenhum registra instalação, data de instalação, hash de artefato ou evento de
`TestFlight`/ad hoc em iPhone; nenhum artefato equivalente ao `29` existe para iOS.

**Candidato identificado — e explicitamente NÃO promovido a prova:**

| Campo | Valor |
|---|---|
| Candidato mais recente | `71c09ff5-89a0-4de0-8baa-eff2548831d6` |
| Plataforma / perfil | `IOS` / `preview` (`INTERNAL`) |
| Concluído em | `2026-08-22T22:48:47Z` |
| Commit | `aeda9c21ee6cfd27f7c56a4f71e818dd47908ce4` |
| O que esse commit é | `HEAD` de `fix/loading-performance-foundation`, `merge-base` com a linha canônica, baseline técnica `aeda9c2` da tag `lp-foundation-closed-2026-07-30` |

O candidato é **plausível** — é o build iOS mais recente, e sua origem é um commit
**documentado como baseline**, o que combina com a descrição *"build antigo com conteúdo
divergente"*. **Plausibilidade não é prova.** Nenhuma medição no aparelho foi feita, e a regra de
honestidade do contrato §2.1 manda valer **sempre o menor grau**.

> **Portanto:** a proveniência do binário instalado no iPhone é **`UNKNOWN`**, e permanecerá assim
> até que exista medição no dispositivo. **Nenhuma proveniência foi inventada para ele.**
> Conforme a missão `F6.1`, **isto não bloqueia o bloco**.

### 3.3 O que fecharia a lacuna — pertence a `F6.8`

Gerar iOS e Android do **mesmo `HEAD` canônico**, sob o contrato, e registrar cada instalação como
evento próprio. `F6.1` está **proibida** de gerar build e de executar campanha física.

---

## 4. Limites deste registro

Ele **não** é fonte de verdade sobre o **estado atual** de nenhum aparelho. **Não** concede nem
retira `PASS`. **Não** reclassifica build histórico para melhor: `PROVENANCE_PARTIAL` significa que
a origem é conhecida **apenas por fonte externa**, e permanece assim. **Não** substitui
[`BUILD_SIZE_LOG.md`](BUILD_SIZE_LOG.md), que segue registrando **peso**. **Nenhum build foi
gerado, baixado, instalado ou removido em `F6.1`.**

---

*Registro criado em `F6.1`. Alimentado a cada build a partir de `F6.8`. Riscos associados:
`P-170`, `P-94`, `P-137`.*
