# 20 · Orientação sob CNG — mecanismo provado e rotas comparadas (`TK-C-028`..`TK-C-034`)

> **Pacote:** `F6-R1.1` · **Subportão:** `F6-SG-C` · **Tasks:** `TK-C-028`, `TK-C-029`,
> `TK-C-030`, `TK-C-031`, `TK-C-032`, `TK-C-033`, `TK-C-034` — e o mutante `MT-31`
> (`TK-C-058`), precondição de **ordem** de toda a subseção `7.6`.
> **Mudança de código esperada:** **nenhuma** — as sete tasks declaram *"Mudança
> esperada: **nenhuma**"*. Nada em `app.json`, `package.json`, `package-lock.json`,
> `eas.json` ou `plugins/` foi alterado.
> **Rota técnica:** **NÃO ESCOLHIDA.** `TK-C-035` só executa após aprovação explícita
> do fundador (`OR-6`, `RG-9`).
> **HEAD medido:** `1801405` · **Plugin medido:** `@expo/config-plugins@54.0.5`

Esta subseção existe para que a decisão de orientação seja tomada **sobre prova**, não sobre
suposição. Ela não escolhe rota, não instala dependência e não toca configuração nativa. Entrega
quatro coisas: o mecanismo real lido linha a linha, a comparação das rotas contra os quatro casos
de `D1`, a separação entre o que é estático e o que exigiria API de *runtime*, e o custo declarado
de cada caminho **antes** que alguém escolha.

---

## 0. `MT-31` (`TK-C-058`) — `D2` tem dentes **antes** de a orientação ser discutida

A emenda `A-05` faz de `G-RSP-3` precondição de **ordem** de toda a subseção `7.6`: a discussão de
orientação é o momento de maior tentação de reintroduzir idioma de aparelho, e o portão precisa
estar provado **antes** de a porta se abrir. `TK-C-060` criou `G-RSP-3` e diz explicitamente que
**não o prova**. Esta é a prova vermelha independente.

| Item | Valor |
|---|---|
| `HEAD` durante a execução | **`1801405`** |
| Árvore antes e depois | **limpa** (`git status --porcelain` vazio) |
| Mutação | `src/screens/PostStoryHubScreen.js` — `Platform` acrescentado à importação de `react-native` e `const isTablet = Platform.isPad \|\| band !== BANDS.COMPACT;` |
| Resultado | ***smoke* 4941/4942** — **uma única** falha |
| Portão vermelho | `[4545]` **`G-RSP-3 (D2 · antecipado)`: zero `Platform.isPad` e zero `expo-device` decidindo layout em `src`** |
| Reversão | `git checkout -- src/screens/PostStoryHubScreen.js` · *smoke* de volta a **4942/4942** |
| *Commit* | **nenhum** — a task manda que a mutação nunca seja commitada |

**Uma falha, exatamente como projetado.** `TK-C-060` deixou as asserções 1 e 2 de `G-RSP-3` onde
nasceram (bloco `TK-A-094`) precisamente para que `MT-31` **não** contasse duas falhas onde a task
espera uma. O comportamento observado confirma o desenho.

**Registro honesto de uma tentativa descartada.** A primeira colocação da mutação foi em
`src/components/layout/HubSurface.js` (`hubColumnCeiling` decidindo por `Platform.isPad`). Ela
acendeu `[4545]` **e** derrubou o arnês de arquétipos com exceção não tratada
(`scripts/testing/surfaceArchetypeHarness.js:143` — `Platform` não é dependência injetada na região
pura), abortando o *smoke* antes do sumário. Foi **descartada e revertida**: matava o mutante duas
vezes e escondia justamente a propriedade que a task pede ver. O achado colateral fica registrado
porque é real — **a região pura de um arquétipo não consegue sequer avaliar idioma de aparelho**,
já que o arnês só injeta as dependências declaradas.

---

## 1. `TK-C-028` — o mecanismo real, provado por linha

### 1.1 O ponto de partida: CNG puro

| Fato | Medida |
|---|---|
| Não há diretórios nativos versionados | `ls android ios` → **inexistentes** |
| Não há `app.config.js`/`.ts` | `ls` → **inexistentes** |
| `app.json` é a única fonte de configuração | `expo.orientation: "portrait"` (`app.json:6`) |
| Versão do plugin lida | `@expo/config-plugins@54.0.5` |

**Ordem dos plugins padrão** (`@expo/prebuild-config/build/plugins/withDefaultPlugins.js`):
`:161` — iOS aplica `IOSConfig.Orientation.withOrientation` e **depois**
`IOSConfig.RequiresFullScreen.withRequiresFullScreen`; `:194` — Android aplica
`AndroidConfig.Orientation.withOrientation`.

### 1.2 iOS — a chave base é retrato, e ela **não** é a que o iPad usa

`ios/Orientation.js:33-38` escreve `UISupportedInterfaceOrientations`. Para `'portrait'`,
`:24-26` devolve `PORTRAIT_ORIENTATIONS` (`:22`) — **duas** máscaras:
`UIInterfaceOrientationPortrait` e `UIInterfaceOrientationPortraitUpsideDown`.

Há um **guarda**: `plugins/ios-plugins.js:46-57` só aplica a ação se
`ios.infoPlist.UISupportedInterfaceOrientations` for `undefined` na configuração crua. No
`app.json` deste projeto o bloco `ios.infoPlist` (`:23-25`) declara **apenas** `UIRequiresFullScreen`
— logo o guarda **não** bloqueia, e a chave base é escrita.

### 1.3 iOS — **o iPad já gira hoje**, e não por acidente

`ios/RequiresFullScreen.js:55-67`:

```js
const requiresFullScreen = !!config.ios?.requireFullScreen;          // :56
const isTabletEnabled = config.ios?.supportsTablet || config.ios?.isTabletOnly;  // :57
if (isTabletEnabled && !requiresFullScreen) {                        // :58
  ...
  infoPlist[iPadInterfaceKey] = [...new Set(existing.concat(requiredIPadInterface))];  // :66
}
```

Aplicado ao `app.json` deste projeto:

| Entrada | Valor real | Origem |
|---|---|---|
| `config.ios.requireFullScreen` | **ausente** — `app.json` declara `ios.infoPlist.UIRequiresFullScreen: false`, que é chave **de destino**, não a propriedade abstrata | `app.json:23-25` |
| ⇒ `requiresFullScreen` | `!!undefined` = **`false`** | `:56` |
| `config.ios.supportsTablet` | **`true`** | `app.json:17` |
| ⇒ `isTabletEnabled && !requiresFullScreen` | **verdadeiro** | `:58` |
| ⇒ `UISupportedInterfaceOrientations~ipad` | `requiredIPadInterface` (`:22`) — **as quatro** máscaras | `:66` |

E `UISupportedInterfaceOrientations~ipad` é chave com **sufixo de dispositivo**: em iPad o iOS a
resolve **no lugar** da chave base. Por isso o retrato de `app.json:6` vale no iPhone e **não** vale
no iPad.

O motivo está escrito no próprio plugin, `:30-38`, e é regra de loja, não preferência:

> `ERROR ITMS-90474: "Invalid Bundle. iPad Multitasking support requires these orientations: …"`

**Conclusão de `TK-C-028`, parte iOS: `D1` casos 1 e 3 estão cumpridos hoje, por mecanismo
identificado, e nada em iOS precisa mudar.**

### 1.4 Android — uma chave, global, sem variante

`android/Orientation.js`, íntegro:

```js
function getOrientation(config) {                                    // :24
  return typeof config.orientation === 'string' ? config.orientation : null;   // :25
}
function setAndroidOrientation(config, androidManifest) {            // :27
  const orientation = getOrientation(config);                        // :28
  if (!orientation) return androidManifest;                          // :30-32
  const mainActivity = getMainActivityOrThrow(androidManifest);      // :33
  mainActivity.$['android:screenOrientation'] =                      // :34
    orientation !== 'default' ? orientation : 'unspecified';
  return androidManifest;
}
```

Três fatos, todos lidos e nenhum inferido:

1. `getOrientation` consulta **apenas** `config.orientation` de topo — não existe `android.orientation`,
   não existe variante por *idiom*, não existe leitura de qualificador de recurso;
2. o destino é **um** atributo, em **uma** `MainActivity`;
3. o único valor especial é `'default'`, que vira `'unspecified'`.

**Conclusão de `TK-C-028`, parte Android: a rota (A) é *provadamente* insuficiente para o caso 4
de `D1`** — `portrait` viola o caso 4, e `default` → `unspecified` liberaria **também** o telefone
Android, violando o caso 2. **Não existe terceiro valor** que separe os dois, porque não existe
segunda chave.

---

## 2. `TK-C-029` — a menor intervenção suficiente (`RG-9`)

O objetivo declarado da task não é escolher a rota mais poderosa: é a **mais barata que resolva os
quatro casos**.

### 2.1 Matriz rota × caso de `D1`

| Rota | Caso 1 · iPhone retrato | Caso 2 · Telefone Android retrato | Caso 3 · iPad retrato **e** paisagem | Caso 4 · **Tablet Android retrato e paisagem** |
|---|---|---|---|---|
| **HEAD hoje** | ✅ | ✅ | ✅ | ❌ **vão único** |
| **(A)** só `app.json` | ✅ | ✅ com `portrait`; ❌ com `default` | ✅ | ❌ **impossível** — chave única |
| **(B)** `expo-screen-orientation` | ✅ | ✅ | ✅ | ⚠️ resolvível — **se** houver sinal de *idiom* confiável |
| **(C)** *config plugin* próprio (qualificador Android) | ✅ | ✅ | ✅ | ⚠️ resolvível — **a verificar em *build*** (§5.2) |
| **(D)** alternativa do runtime atual | ✅ | ✅ | ✅ | ❓ nenhuma identificada |

### 2.2 Custo e reversibilidade

| Rota | Dependência nova | *Build* nativo | Toca código de tela | Reversibilidade | Conflito com `D2` |
|---|---|---|---|---|---|
| **(A)** | não | **sim** | não | trivial — uma linha em `app.json` | nenhum |
| **(B)** | **sim** — aprovação prévia obrigatória (`SD-11`) | **sim** | **sim** — alguém precisa chamar `lockAsync`/`unlockAsync` | média — remover dependência + chamadas | **alto**: exige responder *"sou um tablet?"*; usar largura corrente classificaria telefone em paisagem como tablet, **proibido** por `F6-R1.1` |
| **(C)** | não | **sim** | não | boa — remover o plugin de `app.json.plugins` e reconstruir | **nenhum**: quem decide é o sistema, por `smallestWidthDp`, não o app |
| **(D)** | — | — | — | — | — |

**Leitura.** A rota (A) é a mais barata e **não resolve**. Entre as duas que resolvem, (B) compra a
solução com **duas** moedas que o projeto trata como caras — dependência nova e uma pergunta que
`D2` proíbe — enquanto (C) compra com **uma**: um arquivo de plugin e um *build*. Pela regra de
decisão do PLAN §20.3 (*"evitar dependência nova se não for necessária"* · *"nunca classificar
telefone em paisagem como tablet"*), **a menor intervenção suficiente identificada é (C)** — que é
também a candidata preferida do PLAN. **Identificar não é escolher:** a escolha é do fundador.

---

## 3. `TK-C-030` — configuração estática × necessidade real de API de *runtime*

| Caso | O que exige | Estático ou *runtime*? |
|---|---|---|
| 1 · iPhone retrato | valor único por plataforma | **estático** — já resolvido |
| 2 · Telefone Android retrato | valor único por plataforma | **estático** — já resolvido |
| 3 · iPad retrato e paisagem | valor por *idiom*, decidido pelo iOS | **estático** — já resolvido pelo sufixo `~ipad` |
| 4 · Tablet Android retrato e paisagem | valor por **classe de aparelho**, decidido pelo Android | **estático** — o sistema resolve por qualificador de recurso (`sw600dp`) |

**Nenhum dos quatro casos exige decisão em tempo de execução.** Os quatro são "que orientação este
aparelho permite", pergunta cuja resposta **não muda durante a sessão** — e é exatamente o tipo de
pergunta que sistema de recursos responde na instalação/inicialização, sem código.

**Prova negativa, medida agora:** o produto não tem, em lugar algum, requisito de travar orientação
**por tela** (o que seria a necessidade legítima de API de *runtime*).

```
$ grep -rn "ScreenOrientation|lockAsync|unlockAsync|OrientationLock" src/ App.js index.js
(nenhuma ocorrência)
$ ls node_modules/expo-screen-orientation
No such file or directory
```

`00_AUDITORIA_SOMENTE_LEITURA.md:138` já registrava a mesma ausência por prova negativa.

**Conclusão de `TK-C-030`: não existe caso que **só** uma API de *runtime* resolva.** A rota (B)
entregaria **capacidade sem requisito** — e cobraria por ela uma dependência nova e uma consulta de
idioma de aparelho que `D2` proíbe.

---

## 4. `TK-C-031` — implicações iOS

**Em iOS não há o que mudar, e mexer custa caro.** O estado atual é o único que satisfaz
simultaneamente `D1` casos 1 e 3, a regra de submissão e `SD-9`:

| Se alguém tentar… | Consequência |
|---|---|
| Restringir o iPad a retrato mantendo `UIRequiresFullScreen: false` | **`ITMS-90474`** — rejeição na submissão. O texto do erro está no comentário do próprio plugin (`ios/RequiresFullScreen.js:34`) |
| Restringir o iPad a retrato via `ios.requireFullScreen: true` | Passa na loja, mas `:58` deixa de escrever a chave `~ipad` e `:70` grava `UIRequiresFullScreen: true` — **Split View e Slide Over deixam de existir**, quebrando `SD-9` e o cenário físico §28 **#6** |
| Escrever `ios.infoPlist.UISupportedInterfaceOrientations` à mão | O guarda de `ios-plugins.js:50-55` passa a **ignorar** `expo.orientation` e só emite aviso. Duas fontes de verdade para a mesma coisa |

**Nota de mecanismo relevante para o futuro:** `RequiresFullScreen.js:61-63` avisa, em comentário,
que **não há mecanismo seguro de desfazer** a escrita da chave `~ipad` a não ser
`npx expo prebuild --clear`. Sob CNG isso é inócuo — não há `ios/` versionado —, mas a observação
fica registrada para quem um dia adotar fluxo *bare*.

**`SD-9` e o iPad:** a multitarefa do iPad é a razão pela qual `F6-R1` inteiro decide composição por
**largura de janela** e não por modelo: em Split View, um iPad entrega 320dp de largura real. A
orientação liberada **é pré-requisito** de `SD-9`, não um efeito colateral dele.

**Física futura: sim** — §28 **#6** (Colorir em Split View, arrastar o divisor, sair). Registrada,
**não** executada. Nada nesta seção declara `SD-9` cumprido.

---

## 5. `TK-C-032` — implicações Android

### 5.1 O limite, e o vão de aparelho

O limite está provado em §1.4: **uma** chave, global, sem variante por *idiom*. Qualquer rota que
resolva o caso 4 tem de introduzir a variação **fora** do que o plugin padrão sabe escrever — seja
por qualificador de recurso (C), seja em tempo de execução (B).

**Vão de validação (`P8`).** O caso 4 é o único vão real de `D1`, e ele é **de aparelho**, não de
código. O PLAN §33 registra que existe um tablet Android físico identificado — **Samsung SM-X510** —
mas `TK-C-062` permanece **`PENDENTE — SEM APARELHO`** e a emenda `A-13` mantém **`SD-1` NÃO
CONCEDÍVEL** enquanto o cenário físico de tablet Android (retrato **e** paisagem) não for executado.
**Física bloqueada por indisponibilidade de aparelho** — é o que a própria task declara. Nada aqui
altera esse estado, e nada aqui declara `SD-1` cumprido por automação.

### 5.2 Item de verificação **em aberto**, declarado e não resolvido

A rota (C) pressupõe que `android:screenOrientation` referencie um recurso variável por
`smallestWidthDp` e que o sistema honre a restrição. **Isto não foi verificado neste repositório**, e
a razão é estrutural: sob CNG **não existe** diretório `android/`, então nem o `AndroidManifest.xml`
gerado nem o `targetSdkVersion` efetivo são legíveis na árvore — ambos vêm do *template* de
*prebuild* do Expo 54 no momento do *build*.

Some-se a isso que versões recentes do Android **relaxam ou ignoram** restrições de orientação em
telas grandes, que é exatamente a classe de aparelho do caso 4. **Não afirmo aqui qual é o
comportamento efetivo** — afirmo que é uma pergunta aberta, que ela incide precisamente sobre o
único caso que falta, e como se responde: gerar o *prebuild*, ler o manifesto e o `targetSdkVersion`
resultantes, e observar o aparelho. Enquanto não for respondida, **nenhuma rota deve ser declarada
suficiente para o caso 4 com base apenas em configuração**.

Esta é a diferença entre o que `TK-C-028` provou (o mecanismo do **plugin**, por linha) e o que
ainda não foi provado (o comportamento do **sistema operacional**, que exige *build* e aparelho).

---

## 6. `TK-C-033` — necessidade de novo *build* nativo

| Rota | Muda configuração nativa? | Exige *build* novo? |
|---|---|---|
| **(A)** | sim — `android:screenOrientation` no manifesto | **sim** |
| **(B)** | sim — módulo nativo novo | **sim** |
| **(C)** | sim — plugin + recursos Android | **sim** |

**Nenhuma rota é aplicável por atualização de JavaScript.** Toda alteração de orientação atravessa o
manifesto ou o binário, e portanto atravessa o *build*.

`eas.json` **não foi alterado** (§7) e nenhum perfil novo é necessário: os seis perfis existentes
(`development`, `preview`, `preview-criador`, `production`, `screenshot`, `c60-pilot`) já produzem o
artefato que a validação física precisa.

**`RD-4` — custo de ciclo.** A mitigação já decidida no PLAN §20.3 é agrupar **todas** as mudanças
de configuração nativa da Fase 6 em **um único** *build*, no fim de `F6-R1`. Isso reforça `OR-6`: a
orientação é o **último** passo do último pacote justamente porque é o que obriga a reconstruir.

---

## 7. `TK-C-034` — nenhuma dependência instalada, e a prova é medida

A regra é inviolável (`AGENTS.md`, `CLAUDE.md`, Constituição §I): **dependência nova exige aprovação
prévia**. `SD-11` acrescenta a exigência estática — sem `Dimensions.get`, sem *breakpoint* novo, sem
dependência nova — e já tem portão antecipado (`TK-A-094`, emenda `A-14`).

```
$ git diff HEAD -- package.json package-lock.json eas.json app.json
(vazio)
$ git diff --name-only 04bd479..HEAD -- package.json package-lock.json eas.json app.json plugins/
(vazio)
$ ls node_modules/expo-screen-orientation
No such file or directory
```

A segunda medida é a mais forte: em **todo** o pacote `F6-R1`, da base `04bd479` até `HEAD`,
**nenhuma** dessas superfícies foi tocada. Não é promessa de intenção — é o registro do que
aconteceu.

**Se a rota aprovada exigir dependência**, o caminho é: proposta ao fundador → aprovação explícita →
`npx expo install` (catálogo Expo) → verificação de compatibilidade com SDK 54 / RN 0.81.5 /
React 19.1 / New Architecture. **Nesta ordem, e não em outra.**

**Conclusão de `TK-C-034`: nenhuma dependência instalada. `SD-11` preservado.**

---

## 8. O que permanece **não decidido** — e por quê

`TK-C-035` tem, literalmente, esta precondição: *"`TK-C-034` **e aprovação explícita do fundador
sobre a rota**"*. O cabeçalho da subseção `7.6` é ainda mais direto: *"a rota técnica **permanece
não escolhida** neste artefato. **Não instale `expo-screen-orientation`. Não presuma que uma
dependência será necessária.**"*

Este artefato entrega a base da decisão e **para aqui**. O que ele **não** faz:

- não escolhe rota;
- não instala nem propõe instalar dependência sem aprovação;
- não altera `app.json`, `eas.json`, `package.json`, `package-lock.json` ou `plugins/`;
- não declara `SD-1` cumprido — `TK-C-062` (tablet Android físico) continua **`PENDENTE`**, e a
  emenda `A-13` mantém `SD-1` **NÃO CONCEDÍVEL** até que ele seja executado;
- não antecipa a **rota condicional do §33** (conceder `SG-C` só após validação física em tablet
  Android **ou** conceder com o caso 4 provado por *build* e o vão explicitamente registrado). Essa
  também é decisão do fundador, no próprio subportão.

---

## 9. Divergências e colisões registradas (não corrigidas aqui)

### 9.1 O diretório `plugins/` **já existe** — o PLAN §20.3 está desatualizado neste ponto

O PLAN §20.3 avalia a rota (C) com o custo *"cria `plugins/`, hoje inexistente"*. **Medido hoje,
isso é falso:**

| Medida | Resultado |
|---|---|
| `git ls-files plugins/` | `plugins/withPrivacyManifest.js` — **versionado** desde `7484a5b` |
| Registrado em `app.json.plugins`? | **não** — o array (`app.json:60-71`) tem `expo-font`, `expo-audio`, `expo-asset` |
| Estado declarado pelo próprio arquivo | *"PLUGIN SUPERSEDIDO … NÃO está registrado em app.json"* (`plugins/withPrivacyManifest.js:2-15`) |
| Já catalogado como risco | **`P-92`** — *"plugin órfão"* (`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md:707`) |

**Consequência para a decisão — e ela corta nos dois sentidos.** A rota (C) **não** cria o
diretório: ele existe. Mas ela seria o **primeiro plugin local efetivamente ligado** a
`app.json.plugins` neste projeto — o mecanismo nunca foi exercitado aqui. O custo real de (C),
portanto, não é *"criar infraestrutura nova"*; é *"ligar pela primeira vez uma infraestrutura que
existe e está morta"*. **Registrado, não corrigido:** editar o PLAN por conta própria seria esta
task reescrever documento de precedência superior. `P-92` é anterior a `F6-R1` e tem dono na Fase 20.

### 9.2 Colisão de identificador de *commit* — `C-C10`

`TK-C-028`..`TK-C-034` declaram **Commit: `C-C10`**. Mas `TK-C-035` declara *"`C-C10` (**isolado**, o
último de `R1`)"*, com *"Rollback: reverter `C-C10` — e **somente** `C-C10`, sem tocar no restante do
pacote"*, e `OR-6` repete *"`C-C10` isolado"*. As duas coisas não cabem no mesmo *commit*: se este
artefato entrasse em `C-C10`, reverter a rota reverteria também o estudo que a justificou.

**Resolução adotada:** este artefato sai em ***commit* documental próprio**, e **`C-C10` permanece
reservado** para a implementação da rota em `TK-C-035`. É também o que `AGENTS.md` exige — governança
não se mistura com código. Vai para o `PARKING_LOT` como item **(g)**, na mesma família de (d), (e)
e (f).

---

## 10. Estado dos portões

| Portão | Estado |
|---|---|
| `npm run smoke` | **4942/4942**, 0 falhas — na árvore limpa, após a reversão de `MT-31` |
| `G-RSP-3` | **verde** hoje · **provado vermelho** por `MT-31` (§0) |
| `verify:runtime` | **não** re-executado para este artefato: alteração é documental pura (`specs/**`), que por `AGENTS.md` **não** dispara bundleabilidade. O *smoke* rodou aqui porque `MT-31` **é** alteração de `src/` — e a árvore voltou verde |
| `npx expo-doctor` | **não** executado — nenhuma configuração, dependência ou superfície Expo foi alterada (§7). Rodá-lo aqui seria ritual |

---

## 11. Referências

`TK-C-028`..`TK-C-034` (`05_TASKS:2061-2123`) · `TK-C-035` (`:2124-2131`) · `TK-C-058`
(`:2325-2333`) · `TK-C-060` (`:2343-2351`) · `TK-C-062` · emendas `A-05`, `A-12`, `A-13`, `A-14` ·
PLAN §20.1-20.3 (`04_PLAN:830-873`), §33 (`:1153-1189`), §36 (`:1203-1206`) · SPEC `F6-R1.1`
(`01_SPEC:116-140`) · `D1`, `D2`, `RD-1`, `RD-4`, `RG-9`, `OR-6`, `SD-1`, `SD-9`, `SD-11`, `P8`,
`P-92` · `@expo/config-plugins@54.0.5`: `android/Orientation.js:22-36`, `ios/Orientation.js:15-39`,
`ios/RequiresFullScreen.js:21-22, :30-38, :55-72`, `plugins/ios-plugins.js:46-57`,
`@expo/prebuild-config/build/plugins/withDefaultPlugins.js:161, :194` · artefatos irmãos: `17`
(mutantes da barra), `18` (geometria do *callout*), `19` (inventário antes/depois).
