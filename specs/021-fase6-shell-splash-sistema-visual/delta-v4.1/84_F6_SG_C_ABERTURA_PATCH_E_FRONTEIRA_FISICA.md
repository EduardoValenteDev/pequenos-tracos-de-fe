# 84 · `F6-SG-C` / `F6-R1` — abertura, patch de dependências, reconstrução da fronteira e campanha física mínima

> **Pacote:** `BLOCO 6` · `F6-SG-C` — **Commit:** `C-GOV1` (governança) + um commit de código
> isolado para o patch de dependências.
> **Terminal deste artefato:** `STOP_PHYSICAL_ACTION` — uma única campanha de vídeo no SM-X510.
> **Revisão:** R1.
>
> `F6-SG-C` **não é concedido aqui.** Este artefato executa a matéria autônoma contratada,
> reconstrói a fronteira pelos owners e entrega o roteiro humano da única ação física restante.

---

## 1. Estado de entrada, conferido e não presumido

| Item | Valor conferido |
|---|---|
| `HEAD` de entrada | `06d9994863ae443dadd9d671673f086f085a26b9` |
| Worktree | `c:\tmp\ptf_fase6_shell_splash_wt` · branch `feat/fase6-shell-splash` · **limpa** |
| `F6-SG-A` | **CONCEDIDO COM RESIDUAIS** (`D-FUND-F6-SG-A-HUMAN-GATE-FINAL-01`) |
| `F6-SG-B` | **CONCEDIDO COM RESSALVAS** (`D-FUND-F6-SG-B-HUMAN-GATE-FINAL-01`) |
| `OR-1` · `OR-2` | **satisfeitos** — `TK-C-*` desbloqueadas |
| `F6-SG-C` | **NÃO CONCEDIDO** |
| `F6-SG-D` | **BLOQUEADO** por `SG-C` |
| Aparelho | **SM-X510** presente e autorizado — `adb devices` → `RX2XC003LTJ device` |
| Telefone Android físico · iPad físico | **fora desta campanha** por decisão do fundador |

**Critério de entrada de `F6-SG-C` (§27), item a item:** `SG-B` concedido ✅ · via de orientação
escolhida com prova de mecanismo ✅ (rota C, `plugins/withAndroidTabletOrientation.js`, provada por
*prebuild* real no artefato `21` e por rotação física em V2) · dependência aprovada previamente ✅
(§2 deste artefato). **O critério de entrada está satisfeito.** Isso não concede nada — apenas abre.

---

## 2. Patch de dependências — escopo autorizado, executado e auditado

### 2.1 Registro do estado ANTES

| Pacote | `package.json` | Instalado | Catálogo remoto SDK 54 |
|---|---|---|---|
| `expo` | `~54.0.36` | `54.0.36` | `~54.0.37` |
| `expo-file-system` | `~19.0.23` | `19.0.23` | `~19.0.24` |

`md5 package.json = 3967b0de7cd73bc0e039ff1e124f3969` · `md5 package-lock.json = 63a96e502d63140108c8a9c79d766de1`

**Por que `expo-doctor` divergia do `bundledNativeModules.json` local.** O arquivo embarcado em
`expo@54.0.36` declara `expo-file-system: ~19.0.23` — coerente consigo mesmo. `expo-doctor` consulta
o **catálogo remoto** da Expo, que avançou. A deriva é movimento *upstream*, **não** efeito de
qualquer alteração deste projeto: o artefato `27` registra `18/18` em `002872a` e nada no repositório
mudou desde então em `package.json`.

### 2.2 Confirmação de que nenhuma terceira dependência de aplicação precisa mudar

```
$ npx expo install --check
The following packages should be updated for best compatibility with the installed expo version:
  expo@54.0.36 - expected version: ~54.0.37
  expo-file-system@19.0.23 - expected version: ~19.0.24
```

**Exatamente duas.** Varredura independente de todas as 31 dependências de `package.json` contra
`bundledNativeModules.json` confirmou que nenhuma outra está fora de faixa. `STOP_DEPENDENCY_SCOPE`
**não** foi acionado.

### 2.3 Primeira tentativa — `npx expo install expo expo-file-system`

`package.json`: exatamente duas linhas alteradas. `package-lock.json`: 7 mudanças, todas
transitivas de `expo` (`@expo/cli`, `expo-modules-autolinking`, `ws`, `agent-cli-detector`, e um
`expo-constants@18.0.14` **aninhado** sob `node_modules/expo/`).

`npx expo-doctor` → **17/18**. A verificação de versões passou a verde, mas **uma verificação
diferente** ficou vermelha:

```
✖ Check that no duplicate dependencies are installed
Found duplicates for expo-constants:
  ├─ expo-constants@18.0.13 (at: node_modules\expo-constants)
  └─ expo-constants@18.0.14 (at: node_modules\expo\node_modules\expo-constants)
```

**Causa, provada no *lock*:** `expo@54.0.37` exige `expo-constants ~18.0.14`; `expo-asset@12.0.13`
exige `~18.0.13`. Como `~18.0.13` **admite** `18.0.14`, uma única cópia em `18.0.14` satisfaz os
dois — o npm apenas não içou, porque o *lock* fixava o topo em `18.0.13`. Logo: duplicata
**criada pelo patch autorizado** e resolvível **sem** tocar em nenhuma dependência de aplicação.

### 2.4 `npm dedupe` — tentado e **REJEITADO** por extrapolar o escopo

`npm dedupe` produziu **39** mudanças de pacote, incluindo **rebaixamentos**
(`@expo/json-file 10.2.0 → 10.0.16`, `react-refresh 0.18.0 → 0.14.2`) e alteração de
`babel-preset-expo 54.0.10 → 54.0.12`, que **é** dependência de aplicação. Isso é exatamente a
"atualização geral de dependências" proibida. **Revertido integralmente** — o `package-lock.json`
foi restaurado a partir do estado pós-`expo install`.

### 2.5 Rota cirúrgica adotada

Promoção da entrada `node_modules/expo-constants` do *lock* para `18.0.14` (versão, `resolved` e
`integrity` copiados da entrada aninhada já presente), remoção da entrada aninhada, e `npm install`
para materializar. **`package.json` não foi tocado por esta etapa.**

### 2.6 Auditoria final do escopo

**`package.json` — 2 inserções, 2 remoções, nada mais:**

```diff
-    "expo": "~54.0.36",
+    "expo": "~54.0.37",
-    "expo-file-system": "~19.0.23",
+    "expo-file-system": "~19.0.24",
```

**`package-lock.json` — 7 mudanças, todas causalmente derivadas das duas autorizadas:**

| Pacote | Antes → Depois | Natureza |
|---|---|---|
| `expo` | `54.0.36 → 54.0.37` | **autorizada** |
| `expo-file-system` | `19.0.23 → 19.0.24` | **autorizada** |
| `expo-constants` | `18.0.13 → 18.0.14` | transitiva — exigida por `expo@54.0.37`, admitida por `expo-asset` |
| `expo-modules-autolinking` | `3.0.26 → 3.0.27` | transitiva de `expo` |
| `expo/node_modules/@expo/cli` | `54.0.26 → 54.0.27` | transitiva de `expo` (ferramenta de desenvolvimento) |
| `expo/node_modules/ws` | `8.21.2 → 8.21.3` | transitiva de `@expo/cli` |
| `agent-cli-detector` | **novo** `0.1.6` | transitiva de `@expo/cli@54.0.27` (`^0.1.2`) |

**Zero rebaixamentos. Zero pacotes removidos. Zero dependências de aplicação além das duas.**
`babel-preset-expo` permaneceu em `54.0.10`. Arquivos alterados na árvore: **apenas dois** —
`package.json` e `package-lock.json`.

### 2.7 Portões, depois do patch

| Prova | Resultado |
|---|---|
| `npm run verify:runtime` | **PASS** — `bundle:check` `EXIT=0`; `smoke` **4970/4970**, 0 falhas |
| `npx expo-doctor` | **18/18 — `No issues detected!`** |

```
DEPENDENCY_PATCH ... APLICADO DENTRO DO ESCOPO AUTORIZADO
VERIFY_RUNTIME ..... PASS
EXPO_DOCTOR ........ 18/18
TK-C-036 ........... PASS
```

`STOP_DEPENDENCY_GATE` **não** foi acionado.

---

## 3. Impacto nativo — decidido por diferença de código-fonte, não por *changelog*

Os quatro pacotes nativos alterados foram baixados nas duas versões e comparados **árvore
contra árvore**.

| Pacote | Diferença Android | Alcançável pelo app? |
|---|---|---|
| `expo-file-system` `19.0.23 → 19.0.24` | **nenhuma** — a árvore `android/` é byte a byte idêntica exceto `version`/`versionName` em `build.gradle`. A correção real é **iOS** (`ios/Legacy/FileSystemHelpers.swift`) | irrelevante — não há mudança Android |
| `expo-constants` `18.0.13 → 18.0.14` | **nenhuma** — idem, só a string de versão | idem |
| `expo` `54.0.36 → 54.0.37` | **uma** — `android/src/main/java/expo/modules/fetch/NativeResponse.kt` (`NonCancellable`, `withContext`, `pumpResponseBodyStream` vira `suspend`) | **NÃO.** O único `import` de `expo` no código próprio é `registerRootComponent` em `index.js:1`. O app **nunca** usa `expo/fetch`. Varredura de `src/**` e `index.js`: zero ocorrências de `expo/fetch` e de `TextDecoder` |
| `expo-modules-autolinking` `3.0.26 → 3.0.27` | correção de resolução para **workspaces pnpm com dependências patcheadas por symlink** | **NÃO.** Este projeto é npm, sem workspaces e sem `patch-package` |

**Runtime instalado no SM-X510, verificado no aparelho e não presumido:**

```
package .......... com.valentedev.pequenostracosdefe
pkgFlags ......... [ DEBUGGABLE HAS_CODE ... ]
lastUpdateTime ... 2026-08-19 14:16:51   (instalação do B5)
```

`DEBUGGABLE` = *development build*: **todo o JavaScript vem do Metro em tempo de execução.**
A superfície inteira que `F6-SG-C` prova é JS — arquétipos, faixas, barra lateral, *tokens*,
`useWindowBand`. Ela estará **sempre no `HEAD` corrente** durante a gravação, inclusive já com
este patch.

O artefato `83` §4.4 já provou, lendo o `resources.arsc` do próprio APK instalado, que ele carrega
o inteiro `screen_orientation` com **duas** configurações (`default` e `sw600dp`) — ou seja, **a
rota (C) está dentro do *build* instalado**. E V2 do B5 girou fisicamente o aparelho para paisagem.

```
NATIVE_DEPENDENCY_CHANGED ..... SIM (literalmente: 1 arquivo Kotlin em `expo`)
CODIGO_NATIVO_ALCANCAVEL ...... NÃO (o app não importa `expo/fetch`)
APK_CURRENTLY_REPRESENTATIVE .. SIM
NEW_NATIVE_BUILD_REQUIRED ..... NÃO
```

`STOP_NATIVE_BUILD_GATE` **não** foi acionado. Nenhum *build* foi gerado; nenhuma campanha de
*build* foi criada.

---

## 4. `TK-C-037` — reuso provado, não presumido

`TK-C-037` (consolidação das 14 provas vermelhas de `R1`) está executada no artefato `22` §2, nos
`HEAD`s `da16b18`, `eb11061` e `1801405`. A ordem manda **não repetir prova com evidência válida e
reutilizável**, e manda **provar** o reuso. Os quatro eixos:

| Eixo | Prova |
|---|---|
| **Mesmo critério** | os 14 mutantes e os 12 portões que eles derrubam não mudaram de texto no PLAN §25/§26 desde `da16b18` |
| **Mesmo código relevante** | `git diff --stat da16b18..HEAD -- src/` devolve **6** arquivos: `ColoringCanvas.js`, `map/MapRegion.js`, `config/featureFlags.js`, `AdventureMapScreen.js`, `coloring60DrawingStorage.js`, `mapAnchor.js`. **Nenhum** é alvo de mutação de `MT-7`..`MT-32` |
| **Mesma configuração relevante** | `git diff da16b18..HEAD -- scripts/smoke.js`: **zero** linhas alteradas mencionam `G-RSP-1..7`, `G-SID-1..4` ou `G-BP-1`; a contagem de ocorrências de cada um dos 12 portões é **idêntica** nas duas revisões |
| **Ausência de invalidação pelo patch** | o patch tocou **exatamente** `package.json` e `package-lock.json`. Nenhum arquivo de `scripts/` ou de `src/` está no *diff*. Um portão que lê `src/` como texto não pode mudar de veredito por causa de um *lock* |

```
TK-C-037 ... PASS (por reuso causalmente equivalente, provado nos quatro eixos)
```

---

## 5. PLAN §33 — transcrição literal e situação real

### 5.1 Texto canônico, transcrito sem edição

> **Emenda de 2026-08-10 (`D-1`).** A premissa "não há tablet Android" **expirou**: o SM-X510
> existe e mede ≈`sw823dp` (faixa **MÉDIA**). Isto **não** altera §27, e
> **Tablet Android não é equivalente genérico de iPad**.
>
> Rotas para o caso 4 de `D1`:
> **(i)** conceder `SG-C` somente após validação em tablet Android físico;
> **(ii)** conceder `SG-C` com o caso 4 **implementado e provado por *build*, porém não validado
> fisicamente**, com o vão **explicitamente registrado** e revalidação obrigatória quando houver
> aparelho.
> **Este PLAN não escolhe.**

Critério futuro nº 6 da mesma emenda: **"Multi-janela do Android equiparado ao Split View"**.

### 5.2 Consequências concretas de cada rota

| Campo | Valor |
|---|---|
| `PLAN_33_ROUTE_I` | conceder `SG-C` **somente após** validação em tablet Android físico |
| `PLAN_33_ROUTE_II` | conceder `SG-C` com o caso 4 provado por *build* mas **não validado fisicamente**, vão registrado e revalidação obrigatória **quando houver aparelho** |
| `ROUTE_I_CONSEQUENCE` | exige **um** vídeo no SM-X510. Após ele, `TK-C-062` sai de `PENDENTE` e `SD-1` caso 4 passa a **concedível**. Custo: uma gravação. |
| `ROUTE_II_CONSEQUENCE` | dispensa o vídeo **hoje**, mas o próprio texto da rota dispara a revalidação "quando houver aparelho" — e **o aparelho está presente e autorizado nesta campanha**. A rota (ii) escolhida hoje **não elimina** o vídeo; apenas o adia e acrescenta um vão registrado. |
| `TASKS_AFFECTED` | `TK-C-062` (dono do travamento de `SD-1`), `TK-C-039`, `TK-C-040`, `TK-C-046`; por consequência, §37 condição 3 de `SG-D` |

### 5.3 Veredito honesto sobre "rota forçada"

```
PLAN_33_ROUTE_FORCED_BY_EXISTING_DECISIONS = NÃO PROVADO
```

Não há texto canônico que **elimine** a rota (ii): §37 condição 3 de `SG-D` aceita
literalmente *"validação física **ou** dispensa registrada conforme §33"*. Portanto (ii)
continua sendo caminho contratualmente válido, e **este artefato não escolhe**.

**Mas o que mudou é a premissa, não a escolha.** As duas condições que faziam a rota (ii) ter
alguma economia expiraram:

1. **O aparelho existe** (§33 emenda `D-1`; `adb devices` → `RX2XC003LTJ`) — logo a cláusula
   "revalidação obrigatória quando houver aparelho" da própria rota (ii) já está **vencida** no
   instante da escolha.
2. **O *build* com a rota (C) existe e está instalado** — o bloqueio registrado no artefato `23`
   §2.1 (*"o *build* instalado é anterior a `e2702d2`"*) **caducou**: o artefato `83` §4.4 leu o
   `resources.arsc` do APK hoje instalado e encontrou o inteiro `screen_orientation` com as
   **duas** configurações.

```
PLAN_33_STATUS = NÃO ESCOLHIDA — e, se a campanha física da §8 for executada,
                 a escolha fica SEM OBJETO, porque o caso 4 passa a ter validação
                 física real e a rota (i) se cumpre sem nenhuma dispensa.
```

A escolha **só volta a ser necessária** se o fundador decidir **não** gravar o vídeo.

---

## 6. Fronteira física de `F6-SG-C` — `TK-C-038`..`TK-C-043`, reconstruída pelos owners

**Duas premissas registradas no artefato `23` §1 e §2.1 CADUCARAM e precisam ser declaradas
antes da tabela:**

1. O rótulo **`PENDENTE — SEM APARELHO`** de `TK-C-062` descrevia o aparelho **errado** — o
   artefato `23` já corrigira isso. O tablet existe.
2. O bloqueio **`SEM BUILD COM A ROTA (C)`** de `TK-C-039`/`TK-C-040` **expirou**: o APK hoje
   instalado no SM-X510 contém o inteiro `screen_orientation` com duas configurações
   (artefato `83` §4.4), e V2 do B5 girou o aparelho fisicamente.

**Consequência causal:** `TK-C-039`, `TK-C-040` e `TK-C-062` deixam de estar bloqueadas.

### 6.1 Tabela por owner, com os oito campos exigidos

| | `TK-C-038` | `TK-C-039` | `TK-C-040` | `TK-C-041` | `TK-C-042` | `TK-C-043` |
|---|---|---|---|---|---|---|
| **objeto (owner)** | regressão §28 #17 + #1/#4/#7 | §28 #15 *portrait* | §28 #15 *landscape* | §28 #6 *resize* sob ótica `R1` | 4 famílias × 3 faixas | §28 #16 barra lateral |
| `REQUIRES_PHYSICAL` | **SIM** | **SIM** | **SIM** | **SIM** | **SIM** | **SIM** |
| `REQUIRED_LITERAL_HARDWARE` | **telefone Android real** | tablet Android | tablet Android | **iPad** | tablet **+ telefone** | **iPad** |
| `AVAILABLE_HARDWARE` | **nenhum** | SM-X510 ✅ | SM-X510 ✅ | **nenhum** | SM-X510 (parcial) | SM-X510 (parcial) |
| `AUTOMATED_PROOF` | `CN-1` por *smoke*: nenhum *token* de barra lateral consumido na faixa compacta (`G-SID-2`) | `G-RSP-1..7`, `G-SID-1..4`, `G-BP-1` verdes | idem | `G-RSP-5` (nenhuma comparação literal fora de `useWindowBand`) | `G-RSP-3` (`SD-2` estrutural) | `TA-9` + `G-SID-1`: os **cinco** `registerGuideTarget` existem e estão nomeados |
| `COMPARATOR_PROOF` | — | comparador `Q6` (não canônico) | comparador `Q6` | — | inventário família→tela (§6.2) | `navSidebarRole`/`navSidebarWidth` em `tokens.js` |
| `EXISTING_VALID_PHYSICAL_EVIDENCE` | **nenhuma** | B5 V1/V2: retrato no SM-X510, mas **sob ótica `R2`**, sem percorrer famílias | B5 V2: paisagem alcançada por rotação real | **nenhuma em iPad.** B5 provou que o Split View do Android **não** levou a janela abaixo de 600dp | parcial — B5 não percorreu **nenhuma** das quatro famílias | **nenhuma medida** — B5 não mediu alvo algum |
| `NEW_PHYSICAL_ACTION_REQUIRED` | **SIM — impossível nesta campanha** | **SIM — executável** | **SIM — executável** | **SIM — impossível nesta campanha** | **SIM — parcial (2 de 3 faixas)** | **SIM — parcela Android executável; parcela iPad impossível** |
| `EVIDENCE_GAP_ALLOWED` | **NÃO** — §27 exige o vídeo em telefone e `CN-1`/`CN-11`, sem cláusula de vão | — (será executada) | — (será executada) | **NÃO** — §27 exige `SD-9`, sem cláusula de vão | **parcial** — faixa compacta herda o vão do telefone | **NÃO** — §27 exige "os alvos da barra lateral **medidos**", sem cláusula de vão |

> **§33 não cobre nada disto.** §33 é cláusula do **caso 4 de `SD-1`** — orientação em tablet
> Android. Ela **não** menciona iPad nem telefone, e a própria emenda diz
> *"Tablet Android não é equivalente genérico de iPad"*. Não existe, em nenhum owner,
> cláusula que converta a ausência de iPad ou de telefone em vão admitido.

### 6.2 `TK-C-042` — a matriz de 12 células, dita sem maquiagem

**Duas reduções materiais, ambas contratuais, nenhuma inventada aqui:**

**(a) A família `Jogo` tem ZERO consumidores.** Varredura de `src/screens/`:

| Família | Telas que a adotam |
|---|---|
| `HubSurface` | `HomeScreen`, `BrincarScreen`, `TrophiesScreen`, `AtelierGalleryScreen` |
| `EditorialSurface` | `StoryDetailScreen`, `ReflectionScreen`, `PostStoryHubScreen`, `ParentAreaScreen` |
| `ImmersiveSurface` | `StoryBookScreen`, `ColoringScreen`, `AtelierCanvasScreen` |
| **`GameSurface`** | **nenhuma** |

Isso **não é defeito**: `TK-C-012` determina que migrar uma tela de jogo é escopo de `F12A`.
Mas significa que **3 das 12 células não têm o que capturar**, e nenhuma captura pode ser
fabricada para elas.

**(b) A faixa COMPACTA é inalcançável no SM-X510.** O artefato `83` §10.2 já registrou:
o Split View **não** levou a janela abaixo de 600dp — as células compactas do B5 permaneceram
classe `B`. §33 critério 6 equipara multi-janela do Android ao Split View, e essa tentativa
**já foi feita e já falhou** — repeti-la seria exatamente a repetição que a ordem proíbe.
A faixa compacta depende do **telefone**.

**Matriz real, portanto:**

| | COMPACTA `<600` | MÉDIA `600–899` | EXPANDIDA `>=900` |
|---|---|---|---|
| **Hub** | vão do telefone | **capturável** | **capturável** |
| **Editorial** | vão do telefone | **capturável** | **capturável** |
| **Imersiva** | vão do telefone | **capturável** | **capturável** |
| **Jogo** | sem consumidor | sem consumidor | sem consumidor |

**6 células capturáveis · 3 no vão do telefone · 3 sem consumidor por contrato.**
Este artefato **não** decide como pontuar isso — leva ao Portão Humano.

### 6.3 Reuso controlado das provas do B5 — o que se aproveita e o que não

| Prova do B5 | Reutilizável para `SG-C`? | Por quê |
|---|---|---|
| Rotação retrato↔paisagem funciona no SM-X510 | **SIM** | mesma propriedade física, mesmo aparelho, mesmo *build*. Dispensa reprovar que **gira** |
| Faixas MÉDIA (≈823dp) e EXPANDIDA (≈1317dp) medidas | **SIM** | medida de configuração, invariante ao pacote |
| Split View **não** desce abaixo de 600dp | **SIM (prova negativa)** | é exatamente o que dispensa repetir a tentativa de multi-janela |
| *Development runtime* instalado e funcional | **SIM** | confirmado hoje no `dumpsys` |
| Mapa, âncora, 20 histórias, brilho do pino | **NÃO** | são provas de `F6-R2`/`SG-B`. `SG-C` mede **outra** propriedade sobre as mesmas telas |
| Travessia das **quatro famílias** | **INEXISTENTE** | os vídeos do B5 não visitaram `StoryDetail` nem `Livrinho` sob ótica `R1`; zero menção a Hub/Editorial/Imersiva |
| Alvos da barra lateral **medidos** | **INEXISTENTE** | o B5 não mediu alvo algum |

```
REUSED_B5_EVIDENCE = rotação · faixas medidas · Split View >600dp (negativa) · runtime dev
NEW_PHYSICAL_EVIDENCE_REQUIRED = travessia das famílias + barra lateral nas duas faixas
```

---

## 7. Hardware ausente — classificação, sem terceira via

A ordem admite **exatamente duas** classificações. Aplicando o texto dos owners e de §27:

```
PHONE_GAP = BLOCKING_UNSATISFIED_REQUIREMENT
IPAD_GAP  = BLOCKING_UNSATISFIED_REQUIREMENT
```

**Cláusulas exatas que bloqueiam `F6-SG-C`:**

| Vão | Cláusula que bloqueia | Texto |
|---|---|---|
| **Telefone** | §27, critério de saída de `SG-C` | "**`CN-1`**, `CN-5`, `CN-6` verdes" e "**vídeo do tour em telefone** e iPad com os alvos da barra lateral medidos" |
| **Telefone** | `TK-C-038` (owner) | `Auto: não` · `Física: sim` · `CN-11` + `CN-1` — "o telefone não pode piorar" |
| **iPad** | §27, critério de saída de `SG-C` | "**`SD-9`** (Split View e Slide Over)" e "vídeo do tour em telefone **e iPad** com os alvos da barra lateral medidos" |
| **iPad** | `TK-C-041`, `TK-C-043` (owners) | aparelho literal **iPad**; §28 #6 e §28 #16 |
| **iPad** | PLAN §33, emenda `D-1` | "**Tablet Android não é equivalente genérico de iPad**" — proíbe substituir |

**Por que não `GOVERNED_EVIDENCE_GAP`:** um vão governado exige **cláusula canônica que o
admita**. §33 é a única cláusula de vão da Fase 6 e cobre **apenas** o caso 4 de `SD-1`
(orientação em tablet Android). Não há, em §27, §28, §19.1 ou nos owners `TK-C-038`/`041`/`043`,
nenhuma cláusula equivalente para iPad ou telefone. **Inventar uma seria fabricar contrato.**

**O que isto NÃO significa.** Não é `FAIL`: nada foi observado falhando. É requisito
**não satisfeito** — e a única instância que pode conceder o subportão com esse requisito em
aberto é o **fundador**, por ato humano explícito, exatamente como fez em `SG-A`
(`D-FUND-F6-SG-A-HUMAN-GATE-FINAL-01`, *"CONCEDIDO COM RESIDUAIS EXPLÍCITOS"*, onde a mesma
rodada `R6` — iPad e telefone real — permaneceu residual sem virar `PASS` nem `FAIL`).
**Este artefato não faz essa concessão e não a sugere como automática.**

---

## 8. Campanha física mínima — **um único vídeo**

### 8.1 Como se chegou a um só vídeo

| Descartado da campanha | Motivo |
|---|---|
| Vídeo de telefone | não há telefone — vão declarado em §7, não substituível |
| Vídeo de iPad | não há iPad — vão declarado em §7; §33 proíbe substituir por Android |
| Nova tentativa de Split View / multi-janela | **prova negativa reutilizável** do B5: a janela não desce abaixo de 600dp neste aparelho |
| Reprova de que o aparelho gira | reutilizada do B5 V2 |
| Remedição das faixas (823dp / 1317dp) | reutilizada do B5 |
| Reprova de mapa, âncora, pino, 20 histórias | pertence a `SG-B`, já concedido |

O que **sobra** — travessia das três famílias com consumidor, nas duas faixas alcançáveis, com a
barra lateral e os cinco alvos visíveis nas duas orientações — é **causalmente compatível numa
única sessão contínua**, porque tudo se faz no mesmo aparelho, no mesmo *runtime*, sem
reinstalação e sem tocar no computador.

```
MINIMUM_REQUIRED_VIDEOS = 1
```

### 8.2 O que este vídeo fecha

| Task / contrato | Parcela fechada |
|---|---|
| `TK-C-039` | §28 #15 *portrait* — faixa **MÉDIA**, `SD-2`/`SD-3`/`SD-4` |
| `TK-C-040` | §28 #15 *landscape* — faixa **EXPANDIDA**, nenhuma coluna estreita cercada de vazio |
| `TK-C-062` | roteiro completo: retrato **e** paisagem, famílias, barra lateral, travessia de faixa → destrava `SD-1` caso 4 |
| `TK-C-042` | **6** das 12 células (3 famílias × 2 faixas) |
| `TK-C-043` | **parcela Android** — barra lateral nas duas orientações e os cinco alvos filmados. A parcela **iPad** continua em aberto |
| §19.1 restrição 5 | "funciona em 600–899 **e** em >=900, com composição distinta" — captura exigida em `SG-C` |
| `SD-1` caso 4 | validação física de orientação em tablet Android → **rota (i) de §33 cumprida** |

### 8.3 Preparação no computador — **feita pelo agente, não pelo fundador**

O *runtime* instalado é *development build*: o JavaScript vem do Metro. Antes da gravação, o
agente executa `adb reverse tcp:8081 tcp:8081` e sobe o Metro no `HEAD` corrente, e **confirma
por escrito** que está pronto. **O fundador só começa a filmar depois dessa confirmação.**
Nada disso é feito agora — este artefato **para antes**.

### 8.4 Roteiro humano — contínuo, sem consultar o computador

> **Antes de apertar REC:** tablet **desbloqueado**, **rotação automática LIGADA**, app
> **fechado** (não em segundo plano), brilho alto. Segure o aparelho firme e enquadrado; entre um
> passo e outro, **conte até três em silêncio** — as pausas é que produzem os quadros medíveis.

**BLOCO 1 — RETRATO (faixa MÉDIA)**

1. Com o tablet **em pé (retrato)**, comece a gravar e mostre a tela inicial do Android por 3 s.
2. Abra o app **Pequenos Traços de Fé** pelo ícone. Espere carregar por completo.
3. Na tela **Início**, fique parado **5 s**. Enquadre a tela inteira, incluindo a **barra lateral
   à esquerda**.
4. Toque em **Aventuras**. Espere o mapa aparecer. Fique parado **4 s**.
5. Toque em **Brincar**. Fique parado **4 s**.
6. Toque em **Estrelinhas**. Fique parado **4 s**.
7. Toque em **Perfil**. Fique parado **4 s**.
8. Toque em **Início** de novo. Fique parado **3 s**.
   *(Os passos 3–8 percorrem os cinco destinos da barra lateral, um a um, em retrato.)*
9. Toque em **Aventuras**. No mapa, toque em **qualquer história** para abrir a tela de detalhe.
   Fique parado **5 s** — enquadre a tela inteira.
10. Nessa tela, toque no botão que **abre a história** (o Livrinho). Espere abrir. Fique parado
    **5 s**.
11. **Vire uma página** do Livrinho. Fique parado **4 s**.

**BLOCO 2 — ROTAÇÃO (travessia MÉDIA → EXPANDIDA)**

12. **Sem sair do Livrinho e sem tocar em mais nada**, gire o tablet devagar para **deitado
    (paisagem)**. Continue gravando durante o giro inteiro.
13. Com o tablet deitado, fique parado **6 s** no Livrinho.

**BLOCO 3 — PAISAGEM (faixa EXPANDIDA)**

14. Volte para a tela de detalhe da história (botão de voltar). Fique parado **5 s**.
15. Volte para o mapa de **Aventuras**. Fique parado **4 s**.
16. Toque em **Início**. Fique parado **6 s** — enquadre bem a **barra lateral**, que aqui deve
    aparecer **mais larga e com os nomes**, diferente do retrato.
17. Toque, um a um, em **Aventuras**, **Brincar**, **Estrelinhas**, **Perfil** e **Início**,
    parando **3 s** em cada.

**BLOCO 4 — VOLTA**

18. Na tela **Início**, gire o tablet devagar de volta para **em pé (retrato)**. Continue
    gravando durante o giro.
19. Fique parado **6 s** na tela **Início** em retrato.
20. **Pare de gravar.**

> **Se algo travar, sumir, piscar errado ou voltar ao início sozinho: NÃO refaça o passo.**
> Continue o roteiro até o fim e me conte depois o que viu. Um defeito filmado vale mais que um
> roteiro limpo.
>
> **Tempo estimado:** cerca de **8 a 9 minutos**.

---

## 9. `TK-C-044`, `TK-C-045` e `TK-C-046` — estado

| Task | Estado | Onde |
|---|---|---|
| `TK-C-044` — verificação final dos *tokens* | **PASS** (parcela automática esgotada) | artefato `23` §3 — *diff* de `tokens.js` item a item; nenhum símbolo removido, nenhum valor pré-existente alterado; `grid` e `displayScaleTablet` com consumidor nomeado; `navSidebarRole`/`navSidebarWidth` novos. **Limite declarado pelo próprio parecer:** se `180`/`240` são os valores **certos** é pergunta física, que cai em `TK-C-043` |
| `TK-C-045` — ausência de arquitetura paralela | **PASS** | artefato `23` §4 — inventário de sete responsabilidades, cada uma com implementação única; `G-RSP-4` varre 11 módulos de *layout* em três eixos; prova vermelha `MT-32` |
| `TK-C-046` — relatório de `F6-SG-C` | **PREPARADO, NÃO EMITIDO** | depende de `TK-C-045` (satisfeita) **e** da campanha física da §8. Emitir hoje seria repetir o artefato `24` com a mesma limitação já registrada |

Ambas foram **reconferidas** neste `HEAD`: o *diff* do patch de dependências não toca
`src/theme/tokens.js`, `src/components/layout/`, `src/hooks/` nem `src/services/`, e
`npm run smoke` devolveu **4970/4970** — todos os portões `G-RSP-*`, `G-SID-*` e `G-BP-1`
verdes. Nenhuma das duas foi invalidada.

`TK-C-046` **não concede `F6-SG-C`** — por contrato do próprio owner. Ele declara, como
limitação, `SD-1` **não concedível** enquanto `TK-C-062` estiver `PENDENTE`. **A campanha da §8
é exatamente o que remove essa limitação.**

---

## 10. `F6-SG-D` — contrato reconstruído em modo **somente leitura**

**Pergunta respondida:** `SG-D` contém trabalho material, ou é só portão de liberação?
**Resposta: contém trabalho material — mas nenhum de código e nenhum físico novo.**

`TK-D-001`..`TK-D-005` são **cinco tasks documentais**, todas `Auto: não`, todas
`Física futura: não`, todas `Commit: C-GOV1`, todas com `Mudança esperada: nenhuma`:

| Task | Trabalho |
|---|---|
| `TK-D-001` | verificar as **12 condições de §37**, uma a uma, com evidência nomeada |
| `TK-D-002` | provar que os **três** subportões foram concedidos **por ato humano**, com data e forma |
| `TK-D-003` | provar que `SD-8` foi honrado do início ao fim do delta (quatro invariantes ZERO; matriz de 17 casos executada **duas** vezes) |
| `TK-D-004` | provar que `P-152` e `P-164` não foram apagadas nem rebaixadas; `P-103` segue diferida à Fase 7 |
| `TK-D-005` | emitir o **parecer** — (i) "`B2` elegível para ser apresentado" ou (ii) "`B2` continua bloqueado". **Em nenhuma hipótese o parecer desbloqueia `B2`** |

**Precondição literal de `TK-D-001`: "`F6-SG-C` concedido pelo fundador".** Nada de `SG-D`
começa antes disso — e nada aqui foi executado.

**Um fato de §37 que precisa ser dito agora, sem ser resolvido:** a condição **7** é
*"Campanha física do §28 completa, com vídeo, **em iPad**"*, e a condição **11** exige a
matriz de compatibilidade de §28.1 **integralmente executada**. Com o iPad fora desta
campanha, `TK-D-001` marcaria a condição 7 como `NÃO ATENDIDA` — e o owner de `TK-D-001` diz:
*"Uma única `NÃO ATENDIDA` ⇒ parecer (ii)"*. **Isto não é decisão deste artefato**; é o
contrato de `SG-D` lido em voz alta, para que o fundador saiba, **antes** de decidir `SG-C`,
o que espera do lado de lá.

```
SG_D_CONTRACT_STATUS = CONTÉM TRABALHO MATERIAL (5 tasks documentais, zero código,
                       zero física nova) · BLOQUEADO pela precondição "SG-C concedido"
```

---

## 11. Estado de arquivos, com a distinção exigida

| Arquivo | Estado |
|---|---|
| `package.json` | **modificado no disco, não indexado** (2 linhas) |
| `package-lock.json` | **modificado no disco, não indexado** (7 pacotes) |
| `specs/.../84_F6_SG_C_ABERTURA_PATCH_E_FRONTEIRA_FISICA.md` | **salvo no disco, untracked** |
| `node_modules/` | reconciliado por `npm install`; **não versionado** |
| Qualquer arquivo de `src/`, `scripts/`, `plugins/`, `app.json` | **intocado** |

**Nenhum `git add` foi executado. Nenhum *commit*. Nenhum *push*. Nenhum *build*.**

O patch de dependências é **código** e o artefato é **governança** — por regra de `AGENTS.md`
eles **não** entram no mesmo *commit*. São **dois** *commits* atômicos separados, a serem
produzidos quando o fundador autorizar.

---

## 12. `STOP_PHYSICAL_ACTION`

Todo o trabalho autônomo contratado de `F6-SG-C` está esgotado. O que resta **exige a mão
humana** e cabe em **um** vídeo.

```
STOP_PHYSICAL_ACTION
READY_FOR_SG_C_PHYSICAL = SIM
NUMBER_OF_REQUIRED_VIDEOS = 1
APARELHO = SM-X510 (RX2XC003LTJ)
ROTEIRO = §8.4 deste artefato
PRE-REQUISITO = Metro + adb reverse (o agente executa e confirma antes do REC)
```

`F6-SG-C` **não** foi concedido. Nenhum vão foi convertido em `PASS`. Nenhum vão foi
convertido em `FAIL`. Nenhum requisito novo de hardware foi criado. Nenhuma task nova foi
criada. Nenhum escopo de Fase 7 foi tocado.
