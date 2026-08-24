# `F6.1` — Convergência de baseline, identidade de build e absorção controlada do ícone

> **Bloco executado em 2026-08-24**, sob o
> [Roadmap Mestre Canônico v6.0](ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md), que é a autoridade
> **operacional** de sequência, e [`docs/DECISIONS.md`](../DECISIONS.md), que é o **árbitro das
> decisões individuais**. Entrada: `F6.0` fechado em `2c003e15f4e841a2bb6ec309d4ed53762203916f`.
>
> **Objetivo único:** produzir **uma** baseline executável canônica, com identidade de build
> definida e proveniência rastreável.

---

## 1. O que este bloco é — e o que ele deliberadamente **não** é

`F6.1` é bloco de **baseline, identidade e governança**. Ele **não** toca produto.

| Não executado — por proibição explícita da missão | Estado |
|---|---|
| `F6.2` | **NÃO INICIADO** |
| Layout de tablet | **NÃO CORRIGIDO** |
| Performance | **NÃO CORRIGIDA** |
| Story Home / Reader | **NÃO REDESENHADOS** |
| Orientação iOS/Android | **NÃO ALTERADA** |
| Geração de build | **NÃO EXECUTADA** |
| Campanha física | **NÃO EXECUTADA** |
| `push` · `merge` bruto · `rebase` · remoção de *worktree* | **NÃO EXECUTADOS** |

**Nenhum risco do ledger foi corrigido neste bloco.** Códigos novos foram **abertos**, não fechados.

---

## 2. Perícia forense da *worktree* candidata

Leitura **somente leitura** de `C:\tmp\ptf_fase6_shell_splash_wt`, ramo `feat/fase6-shell-splash`.
Entrada do bloco: `HEAD = 2c003e1`, árvore de trabalho **limpa**, nenhum arquivo pendente.

A regra central da missão foi respeitada: a linha `feat/fase6-shell-splash` entrou como
**CANDIDATA**, não como conclusão. O diretório raiz `C:\Projetos\pequenos-tracos-de-fe`, em
`fix/loading-performance-foundation`, **não** recebeu autoridade por ser o diretório principal —
foi tratado como **mais uma *worktree***.

---

## 3. A prova de convergência entre as duas linhas

| Medição | Resultado |
|---|---|
| `git merge-base feat/fase6-shell-splash fix/loading-performance-foundation` | `aeda9c21ee6cfd27f7c56a4f71e818dd47908ce4` |
| O que esse commit é | **o próprio `HEAD`** de `fix/loading-performance-foundation` |
| `git rev-list --left-right --count` | **0** exclusivos da *foundation* · **317** exclusivos da linha F6 |
| `git cherry` | **vazio** |

> **Leitura:** a *foundation* é **ancestral estrito** da linha F6. Não existe trabalho exclusivo
> dela. Não há nada a integrar, nada a resgatar e nenhuma decisão de mérito a tomar entre as duas
> — a segunda **contém** a primeira. Nenhum critério de `STOP` foi atingido.

A `ETAPA 8` produziu **confirmação independente** deste resultado, por caminho que não passa por
`git merge-base`: os **24** commits distintos que já geraram binário são **todos ancestrais** do
`HEAD` canônico. Nenhum artefato físico jamais existiu fora desta linha.

---

## 4. Varredura das *worktrees*

| Campo | Valor |
|---|---|
| `WORKTREES_TOTAL` | **20**, compartilhando `C:/Projetos/pequenos-tracos-de-fe/.git` |
| `HEAD`s ancestrais do candidato | **20 / 20** |
| `UNMERGED_RUNTIME_FOUND` | **NÃO** |
| `STOP_UNMERGED_WORK` | **não atingido** |

O **único** conteúdo não commitado em qualquer *worktree* é o **harness físico temporário**,
presente em 3 delas — `App.js` com 7 linhas acrescentadas e `src/devharness/` *untracked* —, que se
declara temporário no próprio corpo. Classificado **`SOURCE_PATCH`**: instrumentação de campanha,
não trabalho de produto pendente.

**Nenhuma *worktree* foi removida, limpa ou alterada.**

---

## 5. Declaração da linha canônica

> ## ✅ `CANONICAL_BRANCH = feat/fase6-shell-splash`
>
> Declarada canônica **depois** da prova das §§3 e 4, não por presunção. A *foundation* não é uma
> linha concorrente: é um **ancestral** já contido.

---

## 6. Absorção controlada do ícone

Reconcilia a segunda pendência que a `v6` entregou a este bloco. **Nenhuma imagem foi
reprocessada:** os quatro PNGs entraram **byte a byte**, com `SHA256` conferido contra o lacre
externo `C:\tmp\F6_0_ICON_RECOVERY_20260824\SHA256SUMS.txt`.

| Arquivo | `SHA256` | Dimensões |
|---|---|---|
| `assets/icon.png` | `ca5d5ccf…0101d3` | 1024×1024, sem alfa |
| `assets/adaptive-icon.png` | `f3132da1…bf5b0c` | 1024×1024, com alfa |
| `assets/favicon.png` | `c7d236e7…7eb27d` | 48×48 |
| `assets/branding/beni_icon_source.png` | `03587060…bdc86d` | 1254×1254 (mestra) |

### 6.1 `app.json` — uma única chave

O arquivo **não** foi copiado inteiro. `git diff --numstat` = **`1 1 app.json`**:

```diff
 "adaptiveIcon": {
   "foregroundImage": "./assets/adaptive-icon.png",
-  "backgroundColor": "#7C3AED"
+  "backgroundColor": "#FFFFFF"
 },
```

Verificado o que **sobreviveu**: o *plugin* `./plugins/withAndroidTabletOrientation`, exclusivo da
linha F6, e as **outras duas** ocorrências de `#7C3AED` — *splash* e `androidStatusBar`.
**`ICON_APP_JSON_DIFF` = exatamente a chave autorizada. `STOP_ICON_SCOPE` não foi atingido.**

### 6.2 `SPLASH_UNTOUCHED`

`assets/splash-icon.png` (`SHA256 5f4c0a73…09a3b8`) **não** faz parte do lote e **não** foi tocado.

### 6.3 Por que a mestra foi versionada em `assets/branding/`

Sondagem empírica do Metro (`expo export:embed --assets-dest`): **614** arquivos empacotados contra
**624** presentes em `assets/` no disco, e **nenhum** dos quatro PNGs de identidade apareceu na
saída. A inclusão de asset no binário é decidida pelo **grafo de `require()`**, não pelo diretório.
Versionar a imagem-mestra **não** a envia ao binário.

---

## 7. Portões medidos — e não presumidos

A baseline conhecida em `F6.0` era smoke `4978/4978` e *doctor* `18/18`. Conforme a missão, os
números foram **medidos de novo**, não assumidos.

| Portão | Resultado |
|---|---|
| `npm run verify:runtime` | ✅ **verde** (`bundle:check` + `smoke`) |
| `npm run smoke` | **4978 / 4978**, 0 falhas |
| `npx expo-doctor` | **18 / 18** |

Commit atômico do lote de identidade: **`46a469f`** — `feat(identidade): absorver o icone canonico
do Beni na linha F6`, exatamente **5** caminhos, `5 files changed, 1 insertion(+), 1 deletion(-)`.
**Sem *push*.**

> ⚠️ Portões automáticos **não** substituem validação visual e física. O ícone **não** foi visto em
> aparelho: isso exige build, que este bloco está **proibido** de gerar. Pertence a `F6.8`.

---

## 8. Crosswalk de riscos — `v6` §9 ↔ ledger canônico `E018`

O conflito de autoridade adiado por `F6.0` foi resolvido **sem criar um segundo ledger**.

**A matriz [`09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](../fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md)
permanece o ledger canônico único.** A `v6` §9 é **vista executiva por fase**. A `v6` não a declara
superada e seu §17.1 não a lista entre os documentos rebaixados. **A baixa de qualquer item se
registra no `P-nnn`, nunca no código executivo.**

**Prova de que os dois esquemas descrevem o mesmo universo:** a matriz **já continha** aliases
escritos no formato executivo — `P-35` = `STR ONB 01`, `P-34` = `ONB BRI 01`, `P-32` = `QA REP 01`,
`P-18` = `JRN C60 01` —, e sua coluna *Fase implementação* distribui os códigos exatamente pelos
prefixos de fase da `v6`.

| Medida | Valor |
|---|---|
| Linhas da `v6` §9 | **24** |
| Mapeadas inteiramente em códigos existentes | **17** |
| Mapeadas em parte | **5** |
| Sem código anterior | **2** |
| Códigos `P-nnn` referenciados | **72**, **nenhum alterado** |
| Códigos novos | **7** — `P-170` a `P-176` |
| Total do ledger | **169 → 176** |
| Fusões · renumerações · reclassificações | **0 · 0 · 0** |

Detalhamento em [`V6_RISK_CROSSWALK_TO_E018.md`](V6_RISK_CROSSWALK_TO_E018.md) e na **§34** da
matriz. Cada código novo nasceu de **busca negativa declarada** no corpo inteiro da matriz — não de
semelhança de título.

### 8.1 `P-174` fecha uma lacuna que a própria matriz declarou aberta

A §33.5 registrou que o achado `E-01` — *a `ExpoImage` da ovelha que nunca recarrega entre rodadas,
travando o gate de prontidão da rodada 2 em diante em 100% das partidas do Modo Fácil* — era
**bloqueador crítico de lançamento sem código `P` próprio**, e escreveu literalmente: *"Não inventei
um terceiro."* A aprovação de `F12A-OV-01` na `v6` §9 é a autorização que faltava, pelo caminho que
a §33.2 previu. **O que não mudou:** dono continua **`F12A`**, a Fase 6 segue **proibida** de
corrigir, *"Cadê a Ovelhinha"* segue **DEV-GATED**, e a classificação segue `BLOQUEIA LANÇAMENTO`.

**`E-02` a `E-05` continuam congelados sem código próprio.** A lacuna remanescente é **declarada,
não preenchida** — a `v6` §9 não os aprovou individualmente.

### 8.2 Honestidade de evidência

**Seis dos sete** códigos novos entram com evidência **documental** (`COMPROVADO PELO DOCUMENTO`),
não de código: nenhum arquivo executável foi lido para sustentá-los. Apenas `P-174` herda evidência
mais forte, da auditoria da §33.5. **Nenhuma prova de código foi fabricada.** A primeira obrigação
da fase proprietária de cada código é reconferir contra o código e **promover ou rebaixar** o estado.

---

## 9. Inventário de builds e proveniência

Registro completo em [`BUILD_REGISTRY.md`](../BUILD_REGISTRY.md). **Nenhum build foi gerado.**

| Campo | Valor |
|---|---|
| Builds conhecidos | **27** (25 `FINISHED`, 2 `ERRORED`) |
| Com `gitCommitHash` e árvore `CLEAN` | **27 / 27** |
| `PROVENANCE_KNOWN` / `PARTIAL` / `UNKNOWN` | **16 / 11 / 0** |
| `CURRENT_CANONICAL` | **0** |
| Com `runtimeVersion` | **0 / 27** |
| `appVersion` / `buildNumber` distintos | **1** — todos `1.0.0` / `1` |

**O achado que importa:** os 27 binários são, para um aparelho, **indistinguíveis** entre si —
mesma versão, mesmo *build number*, nenhum `runtimeVersion`. É a raiz mecânica de `P-170`, e
explica por que a origem de um binário instalado não é recuperável a partir dele.

### 9.1 Tablet Android — cadeia provada, e a baseline mais recente **não** é a de 13/08

Quatro instalações documentadas com saída literal de comando. A mais recente provada é
**`c22b43b9`, `development` `DEBUGGABLE`, em `2026-08-19 14:16:51`** — posterior ao evento de
`D-FUND-HISTORICAL-INSTALL-BASELINE-01`, que **continua canônico como registro histórico** e **não
é revogado**, apenas superado pelos fatos. Todas as trocas preservaram os dados
(`ceDataInode 137433`, `firstInstallTime 2026-08-10 12:03:42`).

**Nuance registrada:** o binário instalado é um *dev client*, que **não fixa o JavaScript ao commit
que o gerou** — o JS vem do Metro da *worktree* em uso. No tablet, `BUILD_ID` prova a camada
**nativa**, não o conteúdo executado.

### 9.2 iPhone — `HISTORICAL_PROVENANCE_UNKNOWN`

> ### ⛔ `INSTALLED_IPHONE_BUILD = HISTORICAL_PROVENANCE_UNKNOWN`

Que o binário é **antigo e divergente** está declarado pela `v6` §9. **Qual** binário é, **não**.
Nenhum documento versionado cita o `BUILD_ID` `71c09ff5`, registra instalação em iPhone, data, hash
de artefato ou evento equivalente ao artefato `29`.

O candidato mais recente — `71c09ff5`, `IOS`/`preview`, `2026-08-22`, do commit `aeda9c21ee…`, que
é a baseline técnica `aeda9c2` — é **plausível**, e está registrado **como candidato**.
**Plausibilidade não é prova, e nenhuma proveniência foi inventada.** Conforme a missão, isto **não
bloqueia** `F6.1`.

---

## 10. Contrato de proveniência de build

Criado em [`BUILD_PROVENANCE_CONTRACT.md`](../BUILD_PROVENANCE_CONTRACT.md), **após busca prévia
declarada** por mecanismo equivalente. Nada foi duplicado: `BUILD_SIZE_LOG.md` mede **peso**;
`D-FUND-PREBUILD-01` e `D-FUND-BUILD-SEQUENCE-01` regem **custódia** e **sequência**; o artefato
`29` prova **um caso**; `V6-D03` **exige** proveniência sem definir o mecanismo. A lacuna real era
que o dado de origem vivia **fora** do repositório e **fora** do binário.

O contrato define **14 campos**, o vocabulário fechado
`PROVENANCE_COMPLETE`/`KNOWN`/`PARTIAL`/`UNKNOWN`, a regra de que **na dúvida vale sempre o menor
grau**, e a distinção entre proveniência do **artefato** e do **binário instalado**. Consumido em
`F6.8`.

**Autorreferência evitada:** o carimbo factual da baseline é gerado **fora do Git**, depois do
commit final — um arquivo commitado não pode conter o SHA do commit que o contém.

> **`BUILD_INFO_UI = DEFERRED_TO_F6.8`** — exibir origem do build dentro do app exigiria **nova
> superfície de interface**. Nenhuma tela, componente, rota ou texto foi criado ou planejado aqui.
> **Nada de `F7` foi antecipado.**

---

## 11. Orientação iOS — reconhecimento, sem uma linha alterada

> **`IOS_ORIENTATION_CHANGED = NÃO`.** Nenhum *plugin*, `Info.plist`, chave de orientação,
> `supportsTablet` ou código nativo foi editado. **`IOS_ORIENTATION_OWNER = F6.7`.**

Estado atual, medido no código instalado:

| *Idiom* | Configuração efetiva | Origem |
|---|---|---|
| iPhone | `UISupportedInterfaceOrientations` = **Portrait + PortraitUpsideDown** | `expo.orientation: "portrait"` → `Orientation.js:24-31` |
| **iPad** | `UISupportedInterfaceOrientations~ipad` = **as quatro orientações** | `ios.supportsTablet: true` + `requireFullScreen` ausente → **`RequiresFullScreen.js:20-22, 55-67`** |

**Precisão factual:** quem escreve a variante `~ipad` é `withRequiresFullScreen`, **não**
`withOrientation`. O projeto opera em CNG — não há `ios/` nem `android/` versionados.

**A divergência com `Portrait V1` (`V6-D02`).** O V1 é *portrait first* e a paisagem é
residualizada — mas **o iPad gira hoje**, por configuração. E a tensão é estrutural, não um
descuido: o próprio código do *plugin* documenta o erro `ITMS-90474` da Apple — habilitar
multitarefa no iPad **obriga** as quatro orientações. **Não existe configuração que entregue
"iPad só em retrato" e multitarefa ao mesmo tempo.** Travar exigiria `requireFullScreen: true`,
desabilitando Split View.

**Efeito potencial:** nenhum no iPhone, que permanece em retrato. No iPad, rotação e Split View
**já** expõem o canvas a `resize` — fato já registrado e **não** alterado aqui.

> **O iPad continua *evidence gap* e não recebe `PASS` fictício.** A escolha entre as vias é de
> `F6.7`.

---

## 12. Critérios de saída e estado para `F6.2`

| Critério | Estado |
|---|---|
| Linha canônica declarada **após prova** | ✅ |
| Trabalho não integrado em qualquer *worktree* | ✅ nenhum (`UNMERGED_RUNTIME_FOUND = NÃO`) |
| Ícone absorvido byte a byte, escopo respeitado | ✅ commit `46a469f` |
| Portões medidos de novo no `HEAD` final | ✅ smoke `4978/4978`, *doctor* `18/18` |
| Autoridade de riscos resolvida sem ledger concorrente | ✅ §8 |
| Proveniência de build inventariada e contratada | ✅ §§9–10 |
| Orientação iOS reconhecida sem alteração | ✅ §11 |
| Manifesto externo + *bundle* de backup | ✅ fora do Git, em `C:\tmp` |

### 12.1 O que continua em aberto — declarado, não escondido

1. **`INSTALLED_IPHONE_BUILD` permanece `UNKNOWN`** — só uma medição no aparelho fecha isso.
2. **`CURRENT_CANONICAL = 0`**: nenhum binário existente corresponde à baseline canônica. O
   primeiro build canônico é de **`F6.8`**.
3. **`E-02` a `E-05`** seguem congelados sem código `P` próprio.
4. **Seis dos sete códigos novos** têm evidência apenas documental, a reconferir pela fase dona.
5. **O delta de ícone continua presente na *worktree* principal**, em
   `fix/loading-performance-foundation`. **Não foi limpo** — a limpeza exige autorização própria do
   fundador, conforme a missão.
6. **`CURRENT_DEVICE_STATE_NOT_YET_MEASURED`** continua vigente para o tablet.

Nenhum destes impede a saída do bloco: todos são **estados declarados**, não pendências de execução
de `F6.1`.

> ## `F6_2_READY = SIM`
>
> A baseline canônica existe, é única, está limpa e tem identidade e proveniência definidas.
> **`F6.2` não foi iniciada.**

---

*Artefato do bloco `F6.1`. O carimbo factual do `HEAD` final vive no manifesto externo, fora do
Git, por impossibilidade de autorreferência (ver §10).*
