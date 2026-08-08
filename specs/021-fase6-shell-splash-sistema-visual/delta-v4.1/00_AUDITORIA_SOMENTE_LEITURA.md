# F6-DELTA0 · Auditoria somente-leitura da fundação responsiva, geométrica e de ciclo de vida

> **Natureza deste artefato.** Documental e de auditoria. **Nenhum arquivo de runtime foi
> alterado.** Nenhum defeito foi corrigido, nenhuma configuração nativa foi mudada, nenhum
> *build* foi gerado, nenhuma dependência instalada, nenhum *push* realizado.
>
> **Base auditada:** *worktree* `C:\tmp\ptf_fase6_shell_splash_wt`, *branch*
> `feat/fase6-shell-splash`, HEAD `f10370e9059d0fe1d1860c2086172f63c9c9bf8d`, árvore limpa.
>
> **Origem:** validação física em iPad realizada pelo fundador após a implementação de **B1**
> (fundação responsiva) e **B3** (*shell* de navegação) da Fase 6. A regressão em telefone não
> apontou anomalia relevante; o iPad revelou bloqueadores **estruturais**.
>
> **Precedência aplicada:** `docs/PROJECT_SOURCE_OF_TRUTH.md` → `.specify/memory/constitution.md`
> → `AGENTS.md` → `CLAUDE.md` → `spec` da 021 → este artefato.

> ### 🔁 EMENDA DO PORTÃO HUMANO 1 — 2026-08-08 (HEAD de entrada `93571c6`)
>
> Este artefato foi **emendado** após o veredito 🟡 **APROVADO CONDICIONALMENTE** do fundador. A
> emenda é **documental**: nenhum arquivo de runtime, *asset*, manifesto ou configuração de *build*
> foi tocado, nenhum *build* gerado, nenhuma dependência instalada.
>
> | Seção | Natureza da emenda |
> |---|---|
> | **§1.2** | **CORREÇÃO MATERIAL DE ERRO.** A afirmação *"iPad: retrato"* era **FALSA**. O iPad **já gira hoje**. Texto anterior preservado e tachado. |
> | **§1.2-bis** | Nova. `P-152`/`P-164` são exposição **presente**, não futura. |
> | **§1.3** | Corrigida — não há conflito com a regra de multitarefa da Apple; há coerência. |
> | **§1.4** | `O1` **rebaixada**. `D1` cobre **tablet Android**, o único vão real. Quatro vias A/B/C/D para o PLAN. |
> | **§1.5** | Nova. Reconciliação **binário físico × configuração do HEAD**, tratados separadamente. |
> | **§5.3** | **Causalidade rebaixada** a hipótese não confirmada empiricamente. |
>
> **Erro registrado não se apaga.** A versão anterior das seções corrigidas permanece legível, com
> a razão da correção — mesmo princípio da §31 da matriz de riscos.

---

## 0. Como ler este documento

| Token | Significado exato |
|---|---|
| `COMPROVADO PELO CÓDIGO` | Verificado por leitura direta do arquivo no HEAD `f10370e`. |
| `COMPROVADO PELO ARQUIVO` | Verificado por leitura direta de arquivo de configuração. |
| `OBSERVADO FISICAMENTE` | Relatado pelo fundador em aparelho real; **ainda sem prova de código isolada**. |
| `HIPÓTESE SUSTENTADA POR CÓDIGO` | Mecanismo plausível identificado no código; **falta confirmação em aparelho**. |
| `LATENTE` | O defeito existe no código mas **não se manifesta** com os dados atuais. |

Nenhuma linha deste artefato autoriza correção. Toda correção depende dos três portões humanos.

---

## 1. Auditoria (a) — Orientação, `app.json`, EAS, *plugins* e política nativa

### 1.1 Fatos verificados

`COMPROVADO PELO ARQUIVO` · `app.json`

| Chave | Valor no HEAD | Consequência |
|---|---|---|
| `expo.orientation` | `"portrait"` | **Única declaração global.** Trava telefone **e** tablet, em **iOS e Android**. |
| `expo.ios.supportsTablet` | `true` | O binário é publicado como aplicativo de iPad. |
| `expo.ios.infoPlist.UIRequiresFullScreen` | `false` | Declara suporte a **Split View / Slide Over** do iPadOS. |
| `expo.android.edgeEdgeEnabled` (`edgeToEdgeEnabled`) | `true` | Conteúdo desenha sob as barras do sistema. |
| `expo.newArchEnabled` | `true` | New Architecture ativa. |
| `expo.plugins` | `expo-font`, `expo-audio`, `expo-asset` | **Nenhum** *plugin* de orientação ou de *splash* declarado. |

`COMPROVADO PELO ARQUIVO` · `package.json` — **não existem** as dependências
`expo-screen-orientation`, `expo-splash-screen` nem `expo-device`.

`COMPROVADO PELO ARQUIVO` · ausência dos diretórios `ios/` e `android/` → o projeto opera em
**Continuous Native Generation (CNG)**. Toda a configuração nativa é derivada de `app.json` no
momento do *prebuild*; **não há código nativo a editar**, e qualquer mudança de orientação exige
**novo *build*** (não exige, porém, escrever Objective-C, Swift, Java ou Kotlin).

### 1.2 Efeito real, por plataforma — **SEÇÃO CORRIGIDA NA EMENDA DO PORTÃO 1**

> ### ⚠️ CORREÇÃO MATERIAL — a versão anterior desta seção estava **ERRADA**
>
> **O que esta seção afirmava, e que é FALSO:** *"o plugin `withOrientation` … **não** escreve a
> variante `UISupportedInterfaceOrientations~ipad`. Na ausência da variante, o iPad **herda** a
> chave base. → iPhone: retrato. **iPad: retrato.**"*
>
> **Por que estava errada:** a auditoria anterior leu **apenas** o *plugin* de orientação e
> concluiu dali o comportamento do iPad. **Faltou ler o segundo *plugin* que escreve a mesma
> família de chaves** — `withRequiresFullScreen`. O erro foi meu, não da evidência física.
>
> **O fundador estava certo:** o aplicativo **rodou em paisagem no iPad** na campanha física. A
> evidência empírica contradizia minha conclusão estática, e a evidência empírica é que estava
> correta. O texto original é preservado acima, tachado como falso, porque **erro registrado não
> se apaga** — a §31 da matriz aplica o mesmo princípio.

`COMPROVADO PELO CÓDIGO` · `node_modules/@expo/config-plugins/build/ios/Orientation.js:15-39`

Ao receber `orientation: "portrait"`, o *plugin* `withOrientation` escreve **somente** a chave
base:

```js
// Orientation.js:22, :25-26, :33-39
const PORTRAIT_ORIENTATIONS = ['UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown'];
function setOrientation(config, infoPlist) {
  return { ...infoPlist, UISupportedInterfaceOrientations: getUISupportedInterfaceOrientations(orientation) };
}
```

`COMPROVADO PELO CÓDIGO` · `node_modules/@expo/config-plugins/build/ios/RequiresFullScreen.js:21-22`,
`:55-67` — **o *plugin* que a auditoria anterior não leu**

```js
const iPadInterfaceKey = 'UISupportedInterfaceOrientations~ipad';
const requiredIPadInterface = ['UIInterfaceOrientationPortrait','UIInterfaceOrientationPortraitUpsideDown',
                               'UIInterfaceOrientationLandscapeLeft','UIInterfaceOrientationLandscapeRight'];
function setRequiresFullScreen(config, infoPlist) {
  const requiresFullScreen = !!config.ios?.requireFullScreen;              // undefined -> false
  const isTabletEnabled = config.ios?.supportsTablet || config.ios?.isTabletOnly;  // true
  if (isTabletEnabled && !requiresFullScreen) {                            // ⇒ VERDADEIRO neste projeto
    infoPlist[iPadInterfaceKey] = [...new Set(existing.concat(requiredIPadInterface))];
  }
  return { ...infoPlist, UIRequiresFullScreen: requiresFullScreen };
}
```

O comentário do próprio Expo em `:61-63` explica o porquê: a chave é escrita para **evitar a
recusa `ITMS-90474` da App Store**, que exige as quatro orientações de quem declara multitarefa
em iPad.

**Efeito real, corrigido:**

| Plataforma / *idiom* | Chave efetiva | Resultado | `D1` |
|---|---|---|---|
| **iPhone** | `UISupportedInterfaceOrientations` = retrato + retrato invertido | retrato | ✅ **cumprido** |
| **iPad** | `UISupportedInterfaceOrientations~ipad` = **as quatro** | **retrato + paisagem** | ✅ **já cumprido hoje** |
| **Telefone Android** | `android:screenOrientation="portrait"` | retrato | ✅ cumprido |
| **Tablet Android** | `android:screenOrientation="portrait"` — **o manifesto Android não tem variante por *idiom*** | **retrato forçado** | ❌ **VIOLADO** |

`COMPROVADO PELO CÓDIGO` · `node_modules/@expo/config-plugins/build/android/Orientation.js:21-33`:
`setAndroidOrientation` grava `android:screenOrientation` na *activity* principal a partir da
**mesma chave global**, sem nenhuma distinção entre telefone e tablet.

`COMPROVADO PELO CÓDIGO` · prova negativa: `grep` por `ScreenOrientation`, `lockAsync`,
`OrientationLock` e `screenOrientation` em **todo o `src/`** → **zero ocorrências**. Não há
travamento nem liberação de orientação em tempo de execução.

**Conclusão factual corrigida:** `D1` **não** está integralmente violada. Está violada **apenas em
tablet Android**. Esse é o **único vão real de orientação** — e é o vão mais difícil, porque o
manifesto Android **não oferece** o mecanismo por *idiom* que o Info.plist oferece.

### 1.2-bis Consequência que muda a urgência de `F6-R3`

Como o **iPad já gira hoje**, o risco de `resize` **não** é uma exposição futura condicionada à
liberação da paisagem: **é uma exposição presente**, em qualquer binário com a forma do HEAD atual.

Isso **não rebaixa** `P-152` nem `P-164` — **eleva** os dois. A formulação anterior (*"a camada
global torna-se destrutiva no instante em que `D1` liberar paisagem"*) fica **corrigida para**:
*"a camada global **já é** alcançável em iPad hoje, por rotação e por Split View"*.

### 1.3 Multitarefa da Apple — **coerência confirmada, não conflito**

A versão anterior desta seção descrevia um *"conflito latente"*: multitarefa declarada com uma
única orientação. **Isso também estava errado, pela mesma razão.** O Expo escreve a variante
`~ipad` exatamente **para manter a coerência** com a regra da Apple. Não há conflito, e um envio à
App Store **não** seria recusado por `ITMS-90474` com a configuração atual.

Permanece verdadeiro, e independe de orientação: o Split View pode entregar janelas de
**~320pt, ~507pt, ~678pt ou ~981pt** e **mudá-las em tempo de execução**. A instabilidade da §4
**já é alcançável hoje** — agora por **dois** caminhos, não um: rotação **e** multitarefa.

### 1.4 Opções técnicas — **reformuladas; `O1` REBAIXADA; nada foi alterado**

> **`O1` deixou de ser a recomendação.** Ela partia de duas premissas hoje refutadas: (a) que o
> iPad estaria travado em retrato — **não está**; (b) que *"Android permanece retrato"* satisfaria
> `D1` — **não satisfaz**, porque `D1` cobre **tablet Android** também (emenda do fundador, item 4).
> `O1` **permanece candidata apenas para a parte iOS**, onde, de fato, hoje **nada precisa mudar**.

**O problema, reduzido ao que resta:** entregar paisagem em **tablet Android** sem liberar paisagem
em **telefone Android**, sabendo que o manifesto tem **uma única** chave para os dois.

Quatro caminhos deverão ser comparados **objetivamente na etapa PLAN** — nenhum é decisão agora, e
**nenhuma dependência foi instalada**:

| Via | O que faz | A favor | Contra / a provar |
|---|---|---|---|
| **A — configuração CNG/nativa por plataforma e *idiom*** | iOS: manter o que já existe. Android: qualificador de recurso (`values-sw600dp`) ou variante de manifesto que diferencie o *idiom* | Sem dependência nova; distinção vive na plataforma, coerente com `D2` | **Provar que existe** mecanismo de manifesto que separe telefone de tablet sem código. Se não existir, A é insuficiente sozinha |
| **B — `expo-screen-orientation`** | `orientation: "default"` global + travamento em tempo de execução onde `D1` exige retrato | Cobre Android integralmente; controle explícito | **Dependência nova** — exige aprovação prévia (`AGENTS.md`); telefone passa a depender de código, não de configuração; interação com Split View a validar |
| **C — *config plugin* próprio / runtime Android específico** | *Plugin* local que escreve o manifesto Android por *idiom* | Sem dependência de terceiros | Código nativo de *build* a manter; risco de divergir do Expo a cada SDK |
| **D — comportamento nativo do Android moderno** | A partir do Android 16 (API 36) o sistema **ignora** restrições de orientação em telas grandes (≥600dp) | Pode entregar `D1` em tablet Android **sem nenhuma mudança** | **Depende da versão do Android**; não cobre tablets antigos; precisa ser medido, não presumido |

**A solução vencedora deverá, cumulativamente:** cumprir `D1` **integralmente** nos quatro casos ·
preservar multitarefa e redimensionamento no iPad · evitar dependência nova se não for necessária ·
**nunca classificar telefone em paisagem como tablet apenas por largura** · exigir ***build* nativo**
quando a configuração nativa mudar.

**Precondição inegociável, reforçada:** nada disso pode ser aplicado antes de `F6-R3` e da política
de canvas do §`PF6D-D-CANVAS`. E como o **iPad já gira**, `F6-R3` é urgente **mesmo que nenhuma
mudança de orientação seja feita**.

### 1.5 Reconciliação exigida — **binário físico × configuração que o HEAD geraria**

A emenda do fundador exige que os dois **não** sejam tratados como equivalentes. Auditoria somente
leitura, **nenhum *build* gerado**.

**A) Binário nativo efetivamente testado na campanha física**

| Item | Valor |
|---|---|
| *Build* EAS | `10fce052-222b-4d9a-aad8-92467ccd8d1d` |
| *Commit* nativo de origem | `7c12987622d07a8e305e1930fdae45751afc65d9` — existe neste repositório; *"docs(governance): registra a canonicalizacao do runtime e os contratos de build/validacao"*, 2026-07-30 |
| Natureza | *Development Client* iOS, **resignado** para o iPad do fundador |
| JS executado | **não** o do binário — veio do **Metro**, com o código da Fase 6 |

**B) Configuração que o CNG do HEAD `93571c6` produziria num *build* novo**

**Prova de equivalência da fonte de orientação** — `git diff 7c12987..HEAD`:

| Arquivo | Resultado |
|---|---|
| `app.json` | **diff vazio — byte a byte idêntico.** É a **única** fonte de orientação do projeto |
| `app.config.js` / `app.config.ts` | **não existem** |
| `plugins/` | **não existe** — nenhum *config plugin* próprio |
| `eas.json` | mudou: variáveis `EXPO_PUBLIC_*` e o perfil `c60-pilot`. **Nada relacionado a orientação, `idiom` ou Info.plist** |
| `package.json` | `expo ~54.0.35` → `~54.0.36`; *scripts* `check:env` e `start:dev` |
| `@expo/config-plugins` (*lock*) | **54.0.4** → **54.0.5** |

**Veredito da reconciliação:** **A e B produzem a mesma política de orientação.** A configuração de
orientação do binário fisicamente testado é a mesma que o HEAD atual geraria — e é por isso que o
iPad girou. A evidência física e a evidência estática **agora concordam**; antes discordavam porque
minha leitura estática estava incompleta.

**Incerteza residual, declarada e não estimada:** o binário físico foi gerado com
`@expo/config-plugins` **54.0.4**, e o que está instalado neste *worktree* é **54.0.5**. **Não li o
código da 54.0.4** — ela não está instalada, e baixá-la não é leitura de repositório. A diferença é
de *patch* dentro do mesmo SDK 54 e o comportamento de `withRequiresFullScreen` é antigo e
estável, mas **isso é inferência, não prova**. A confirmação definitiva exige inspecionar o
`Info.plist` do próprio `.ipa` — o que **não** foi feito porque exigiria baixar o artefato do EAS.
Registrado como item de conferência, não como fato.

---

## 2. Auditoria (b) e (c) — *Breakpoints*, `Dimensions`, *wrappers* responsivos

### 2.1 Achado positivo — a mecânica reativa já existe

`COMPROVADO PELO CÓDIGO` · varredura completa de `src/` e `App.js`:

- `Dimensions.get` → **zero** ocorrências reais (única aparição é um **comentário** em
  `src/theme/tokens.js:127`).
- `Dimensions.addEventListener` → **zero** ocorrências.
- **Todas** as ~34 leituras de largura/altura usam `useWindowDimensions()`, que é **reativo**.

**Consequência:** a base para **D2** já está no lugar. O que falta **não é o mecanismo de medir**,
é a **política do que fazer com a medida**. Este achado é registrado para **impedir que o delta
sobredimensione o escopo**: F6-R1 não precisa migrar leitura de dimensões.

### 2.2 A fonte única de *breakpoints*

`COMPROVADO PELO CÓDIGO` · `src/theme/tokens.js` §2.4:

```js
export const breakpoints        = { phone: 0, tablet: 600, tabletL: 900 };  // dp
export const maxContentWidth    = { phone: '100%', tablet: 560, tabletL: 640 };
export const grid               = { phone: 1, tablet: 2, tabletL: 3 };
export const displayScaleTablet = 1.10;
```

O Bloco **B1** (`P-30`) unificou o corte: **zero** comparações literais a `768` sobrevivem em
`src/`, e `productTheme.layout.tabletBreakpoint` passou a **derivar** de `breakpoints.tablet`. O
portão `G-BP-1` do *smoke* protege essa unificação. **Isso não está em discussão e não é
reaberto.**

### 2.3 O que a unificação **não** resolveu

| Token | Consumidores em `src/` | Leitura |
|---|---|---|
| `breakpoints.tablet` (600) | **13** | Corte único e vivo. |
| `breakpoints.tabletL` (900) | **1** — `ContentContainer.js:25` | A faixa **expandida** é praticamente inexistente. |
| `grid` | **0** | Declarado e **sem nenhum consumidor**. |
| `displayScaleTablet` | **0** | Declarado e **sem nenhum consumidor**. |

**Conclusão:** o contrato de **três faixas** (`<600` compacto · `600–899` médio · `>=900`
expandido) exigido pelo delta **existe como token e não existe como comportamento**. Na prática o
aplicativo tem **duas** faixas, e a terceira só influencia a largura máxima de uma coluna.

### 2.4 Os treze consumidores do corte — a prova de `F6-RSP-02`

O **mesmo predicado** `width >= breakpoints.tablet` governa superfícies de **naturezas
diferentes**:

| Arquivo | Linha | Família da superfície |
|---|---|---|
| `src/navigation/AppNavigator.js` | 232 | *Shell* |
| `src/screens/ParentAreaScreen.js` | 288 | Editorial (adulta) |
| `src/screens/StoryDetailScreen.js` | 111 | Editorial |
| `src/screens/ReflectionScreen.js` | 51 | Editorial |
| `src/screens/PostStoryHubScreen.js` | 52 | Editorial |
| `src/screens/StoryBookScreen.js` | 197 | **Imersiva** |
| `src/screens/QuizScreen.js` | 28 | **Jogo** |
| `src/screens/TrophiesScreen.js` | 197 | Hub (grade) |
| `src/components/BeniGuideOverlay.js` | 80 | Sobreposição / tour |
| `src/components/ui/ContentContainer.js` | 25–27 | *Wrapper* transversal |
| `src/components/ui/ModalPapel.js` | 21 | Sobreposição |
| `src/theme/productTheme.js` | 113 | Tema derivado |

**Um único modelo binário para quatro famílias de superfície.** Um livro imersivo, um jogo, um
hub em grade e um texto editorial recebem **a mesma decisão** a partir da **mesma pergunta**.

### 2.5 `ContentContainer` — a evidência mais forte

`COMPROVADO PELO CÓDIGO` · `src/components/ui/ContentContainer.js`, íntegro:

```js
export default function ContentContainer({ children, style, ...rest }) {
  const { width } = useWindowDimensions();
  const maxWidth =
    width >= breakpoints.tabletL ? maxContentWidth.tabletL   // >=900 → 640
      : width >= breakpoints.tablet ? maxContentWidth.tablet //  >=600 → 560
        : maxContentWidth.phone;                             // telefone → '100%'
  return (
    <View style={[{ width: '100%', maxWidth, alignSelf: 'center' }, style]} {...rest}>
      {children}
    </View>
  );
}
```

**Uma coluna de no máximo 640dp** governa Início, Brincar, Perfil, Histórias e Detalhe de História
**indistintamente**. Em um iPad Pro em paisagem (~1366pt) isso deixa **~700pt de vazio lateral**.
Este é o mecanismo aritmético por trás dos sintomas `F6-SID-01` (barra lateral vazia) e
`F12A-BRI-01` (composição do Brincar subaproveitada). **Não é um bug de estilo: é a ausência de um
arquétipo de superfície.**

### 2.6 `CenteredContent` e `AppScreen`

- `src/components/layout/CenteredContent.js` — hoje é **delegação pura** para `ContentContainer`
  (resultado de B1/`P-30`). Antes tinha corte literal `768` e largura máxima `720`. O *docblock*
  já sinaliza a mudança 720 → 560/640 e nomeia a faixa **600–767** como ponto de validação física.
- `src/components/layout/AppScreen.js` — `forwardRef`, aplica `useSafeAreaInsets`, injeta
  `paddingTop`/`paddingBottom` **por último** para vencer o estilo do chamador, e exporta
  `APP_SCREEN_BACKGROUND`. **Não contém nenhuma lógica de largura ou de orientação**, e o próprio
  *docblock* exclui explicitamente *"geometria (alvo de tour, viewport de canvas)"*.

**Conclusão:** hoje **não existe** *wrapper* de arquétipo de superfície. `AppScreen` cuida de área
segura; `ContentContainer` cuida de uma coluna. Ninguém cuida de **qual espécie de superfície é
esta e como ela deve ocupar a janela**.

---

## 3. Auditoria (d) — `TabletSidebar` e `AppNavigator`

### 3.1 Achado positivo — travessia do corte é *re-render*, não remontagem

`COMPROVADO PELO CÓDIGO` · `src/navigation/AppNavigator.js`, `MainTabs()`:

```js
const insets = useSafeAreaInsets();
const { width } = useWindowDimensions();
const isTablet = width >= breakpoints.tablet;
...
<Tab.Navigator
  tabBar={isTablet ? (props) => <TabletSidebarTabBar {...props} /> : undefined}
  screenOptions={{
    headerShown: false,
    tabBarPosition: isTablet ? 'left' : 'bottom',
    tabBarStyle: isTablet ? undefined : { /* ... */ height: 64 + insets.bottom, /* ... */ },
  }}
>
```

O tablet recebe **a mesma árvore de navegador**, com a barra **reposicionada**. Atravessar 600dp
**não remonta as telas** — no nível do *shell*, o estado de rota sobrevive. Registrado para que o
delta **não** proponha reconstruir o que já está correto.

### 3.2 `TabletSidebar` — quatro defeitos verificados

`COMPROVADO PELO CÓDIGO` · `src/components/TabletSidebar.js`:

| # | Fato | Linha | Consequência |
|---|---|---|---|
| 1 | `styles.sidebar: { width: 200 }` — **fixo** | 125 | Idêntica a 600dp e a 1366dp. Em um iPad grande é uma faixa estreita ao lado de um vazio enorme; num tablet de 600dp consome 1/3 da largura. |
| 2 | `navButtons: { gap: 2 }`, **sem** `flex: 1` e **sem** ancoragem inferior | 196 | Bloco de perfil (~200pt) + cinco botões (~52pt cada) ⇒ **~700pt de vazio vertical** num iPad em retrato (~1133pt). **Este é o sintoma "barra lateral vazia".** |
| 3 | `import { colors } from '../theme/colors'` | 4 | Consome o **tema legado concorrente**, não `src/theme/tokens.js`. Resíduo de `RF-C3`. |
| 4 | `navButton: { paddingVertical: 13 }` + ícone 26pt ⇒ **≈52pt** de altura | 200, 209 | **Abaixo do mínimo 56×56 de `RF-A7`** da própria *spec* da 021. |
| 5 | `progressLabel` `fontSize: 10`; `stars` `fontSize: 11` | 192, 173 | **Abaixo do piso de 13px de `RF-C12`** da própria *spec* da 021. |

Os itens **4** e **5** são **violações de requisitos já aprovados na 021** que sobreviveram ao
Bloco B3 porque B3 tratou de **hierarquia de rota**, não de **apresentação da barra**.

`TabletSidebar` também registra cinco alvos de guia (`adventures.sidebarTab`, `home.sidebarTab`,
`atelier.sidebarTab`, `stars.sidebarTab`, `profile.sidebarTab`) — o que a torna parte da
geometria do tour, e não só decoração.

### 3.3 Geometria do *callout* do tour presa ao telefone

`COMPROVADO PELO CÓDIGO` · `AppNavigator.js` — a posição do *callout* da aba deriva de
`width / TAB_DEFS.length` somado a `insets.bottom`, e é **condicionada a `!isTablet`**. No tablet
a barra está à **esquerda**, e essa aritmética **não tem equivalente**. O `tabPress` bloqueia troca
de aba enquanto `isAdventureTourActive()`.

---

## 4. Auditoria (e), (f) e (h) — Mapa, âncora canônica e ciclo de vida

### 4.1 A origem das coordenadas

`COMPROVADO PELO CÓDIGO` · `src/data/adventureMap.js`:

```js
export const MAP_ASPECT = 9 / 16;                         // 0.5625
export function computeRegionHeight(width) { return Math.round(width / MAP_ASPECT); }
export function markerFraction(index, storyCount) { if (storyCount <= 1) return 0.62; /* ... */ }
export const STORY_MAP_COORDS = {
  creation: { x: 0.73, y: 0.67, label: 'below', markerScale: 1.22 },
  noah:     { x: 0.65, y: 0.37, label: 'left',  markerScale: 1.10 },
  /* … as 20 histórias … */
};
export function getStoryMapCoord(storyId, index = 0, storyCount = 1) {
  const c = STORY_MAP_COORDS[storyId];
  if (c) return c;
  return { x: index % 2 === 0 ? 0.30 : 0.70, y: markerFraction(index, storyCount), label: 'below' };
}
export const PIN_TOP_FRACTION_OFFSET = 0.035;
```

As coordenadas são **normalizadas** (frações de 0 a 1) — isso é **correto** e é a base sobre a
qual a âncora canônica pode ser construída. **O problema não é a fonte: é o número de leitores
independentes dela.**

### 4.2 `F6-MAP-ANCHOR-01` — **cinco** derivações independentes da mesma âncora

`COMPROVADO PELO CÓDIGO` · `src/screens/AdventureMapScreen.js` e `src/components/map/MapRegion.js`:

| # | Onde | Como calcula | Fator |
|---|---|---|---|
| 1 | **Renderização do pino** — `MapRegion.js:51-57`, aplicado em `:175` | `getStoryMapCoord(s.id, i, n)` → `x: Math.round(coord.x * width)`, `y: Math.round(coord.y * regionH)`, posicionado em `styles.markerSlot, { left: it.x, top: it.y }` | — |
| 2 | **`initialOffsetY`** (memo, ~296–311) | `anchorY = regionLayout[idx].top + getStoryMapCoord(cameraStoryId).y * regionLayout[idx].height`, contra um viewport **estimado**: `const vpEst = Math.max(220, height - (insets.top + 56) - (insets.bottom + 56));` | **0.58** |
| 3 | **`onContentSize`** (~376–395) | Viewport **real** (`scrollViewH.current`); `scrollRef.current?.scrollTo({ y: target, animated: false })` | **0.58** |
| 4 | **`scrollPinIntoView`** (~429–438) | `animated: true`; comentário no código afirma *"mesma geometria da câmera"* | **0.5** |
| 5 | **Holofote / brilho do tour** | Mecanismo **inteiramente separado**: `guideTargets.register('adventures.nextPin')` + `measureInWindow` | — |

**Três defeitos derivam disso, todos verificados:**

1. **Invariante documentada e falsa.** O item 4 declara usar *"a mesma geometria da câmera"* e usa
   **0.5** onde a câmera usa **0.58**. O comentário mente sobre o código.
2. **Estimativa de viewport errada no tablet.** O item 2 subtrai `insets.bottom + 56` a título de
   barra de abas inferior. **No tablet a barra está à esquerda** — os 56pt subtraídos **não
   existem**. A câmera inicial do mapa erra a mira em tablet por construção.
3. **Divergência `LATENTE`.** Os itens 2, 3 e 4 chamam `getStoryMapCoord(cameraStoryId)` com **um**
   argumento; o item 1 chama com `(s.id, i, n)`. Para qualquer história **sem** coordenada
   explícita, o *scroll* usaria `markerFraction(0, 1) = 0.62` enquanto o pino seria desenhado em
   `markerFraction(i, n)`. As 20 histórias atuais **têm** coordenada — o defeito **não se manifesta
   hoje** e passa a se manifestar **no instante em que uma história for adicionada sem coordenada**.

Isto é exatamente o que **D11** exige corrigir: *uma âncora canônica controla pino, alvo de toque,
brilho, *scroll* e holofote*. Hoje são cinco.

### 4.3 `F6-LFC-01` — a linha que descarta o estado da criança

`COMPROVADO PELO CÓDIGO` · `src/screens/AdventureMapScreen.js`:

```js
// :123-127
const [contentW, setContentW] = useState(0);
const mapWidth = contentW > 0 ? contentW : width;
const onContainerLayout = useCallback((e) => {
  const w = Math.round(e.nativeEvent.layout.width);
  setContentW((prev) => (prev === w ? prev : w));
}, []);

// :367
useEffect(() => { didInitScroll.current = false; }, [mapWidth]);
```

**Qualquer** mudança de largura — rotação de iPad, entrada ou saída de Split View, redimensionamento
do painel, travessia do corte de 600dp — **reinicia `didInitScroll`**. O `onContentSize` seguinte
volta a disparar e o `scrollTo` **puxa o mapa de volta para a âncora da câmera**, descartando a
posição onde a criança estava. `userScrolledRef` **também não é reposto**, de modo que o
`activeIdx` e o acompanhamento de região do "Ver mapa" ficam **dessincronizados** do que está na
tela.

**Uma única linha amarra D11, D2 e a preservação de estado.** Girar o iPad joga fora a posição do
mapa da criança.

### 4.4 Inventário de ciclo de vida

`COMPROVADO PELO CÓDIGO` · **15** pontos de escuta de `AppState` em `src/`:

`AudioPlayer.js:209` · `useImageRecovery.js:66-67` · `usePuzzleController.js:135` ·
`CadeAOvelhinhaScreen.js:612, :614, :748` · `MonteACenaGameScreen.js:213` ·
`MonteACenaSpikeScreen.js:185` · `PalavrinhasDoBeniScreen.js:335` ·
`ParesDoBeniScreen.js:323, :325, :507` · `StoryBookScreen.js:344` · `entitlementService.js:130`.

`onLayout` aparece **49** vezes em **15** arquivos.

**Fato decisivo:** **os quatro jogos tratam `AppState`. O Colorir e o Ateliê não tratam.** (§5)

### 4.5 Superfícies em que `orientation`/`resize` podem destruir estado — item (h)

| Superfície | O que se perde | Mecanismo | Estado |
|---|---|---|---|
| **Mapa de Aventuras** | Posição de *scroll*, região ativa, coerência do holofote | `AdventureMapScreen.js:367` (§4.3) | `COMPROVADO PELO CÓDIGO` |
| **Colorir com o Beni** | Alinhamento entre pintura e traço; integridade do preenchimento | `ColoringCanvas.js` `resize()` (§5.2) | `COMPROVADO PELO CÓDIGO` |
| **Ateliê / Criar Livre** | Composição e posição da arte | `AtelierCanvas.js` `resize()` + coordenadas absolutas (§5.1) | `COMPROVADO PELO CÓDIGO` |
| **Tour / guias** | Geometria do *callout*, alvo do holofote | `AppNavigator.js` (`!isTablet`), `guideTargetRegistry` remede sem invalidar | `HIPÓTESE SUSTENTADA POR CÓDIGO` |
| **Livrinho (`StoryBookScreen`)** | Cena corrente sob mudança de largura | Trata `AppState` (`:344`); **não** trata `resize` | `HIPÓTESE SUSTENTADA POR CÓDIGO` |
| **Jogos** | Sessão em andamento | Tratam `AppState`; **nenhum** trata `resize` | `HIPÓTESE SUSTENTADA POR CÓDIGO` |
| **Áudio** | — | `AudioPlayer.js:209` trata `AppState`; `resize` não afeta áudio | Sem risco identificado |
| **Rota** | — | `Tab.Navigator` único; travessia é *re-render* (§3.1) | Sem risco identificado |

**Nenhuma superfície do aplicativo implementa política de `resize`.** O aplicativo nunca precisou:
está travado em retrato desde sempre. É por isso que `F6-RSP-01` **não pode** ser aplicada antes de
`F6-R3`.

---

## 5. Auditoria (g) — Colorir e Ateliê · global × *canvas-specific*

Objetivo estrito, conforme o escopo: determinar se o sintoma observado após o Centro de Controle
**pode nascer da fundação global** ou se é **específico do canvas**. **Nada foi corrigido.**

### 5.1 `AtelierCanvas` — modelo **vetorial**, dado sobrevive, composição não

`COMPROVADO PELO CÓDIGO` · `src/components/AtelierCanvas.js`:

```js
function resize(){
  W=window.innerWidth|0; H=window.innerHeight|0;
  C.width=W; C.height=H;
  render();
}
window.addEventListener('resize',resize);
resize();
```

`render()` **redesenha a partir do modelo vetorial** (`strokes[]`, `stamps[]`) — portanto atribuir
`C.width`, que limpa o *bitmap*, **não perde o desenho**. Porém os traços são gravados em
**coordenadas absolutas de pixel**:

```
:220  return { x:(t.clientX-r.left)|0, y:(t.clientY-r.top)|0 };
:232  var ns = { id:genId(), emoji:…, x:p.x, y:p.y, size:72 };
:265  points:[{ x:p.x, y:p.y }]
:292  curStroke.points.push({ x:p.x, y:p.y });
```

**Classificação:** ao redimensionar, o Ateliê **preserva o dado** e **corrompe a composição** — a
arte não é reescalada, ela é recortada e deslocada dentro de um quadro de outra forma.
**Recuperável, mas geometricamente errado.**

### 5.2 `ColoringCanvas` — modelo **raster**, resize **corrompe**

`COMPROVADO PELO CÓDIGO` · `src/components/ColoringCanvas.js`:

```js
function resize(){
  var cssW=window.innerWidth|0, cssH=window.innerHeight|0;
  W=Math.round(cssW*DPR); H=Math.round(cssH*DPR);
  C.style.width=cssW+'px'; C.style.height=cssH+'px';
  C.width=W;   C.height=H;
  off.width=W; off.height=H;
  tmp.width=W; tmp.height=H;
  INITIAL_VIEW_BOTTOM_SAFE_INSET=Math.round(H*INITIAL_VIEW_BOTTOM_SAFE_FRAC);
  if(baseD) renderAll();
}
window.addEventListener('resize',resize);
```

Depois de um `resize` **posterior à inicialização**, quatro estruturas ficam com a dimensão
**antiga** e **não** são recalculadas por `resize()`:

| Estrutura | Onde é criada | Recalculada em `resize()`? | Efeito |
|---|---|---|---|
| `baseD` (traço de referência do preenchimento) | `:614` / `:665`, dentro de `initCanvas` | **Não** | O `flood fill` passa a consultar um mapa de referência de outra dimensão. |
| `paintD` (camada de pintura da criança) | `:616` / `:666` | **Não** | `renderAll()` faz `tmpCtx.putImageData(paintD,0,0)` num `tmp` já redimensionado — `putImageData` **não estica**: blita com as dimensões antigas em (0,0). **A pintura desalinha do traço.** |
| `imgX / imgY / imgW / imgH` (retângulo do traço) | dentro de `initCanvas` | **Não** | O traço é redesenhado com a geometria antiga sobre um canvas novo. |
| `qBuf` / `visBuf` (filas do BFS) | `allocBufs()` — chamado **apenas** em `initCanvas` (`:622`) e no ramo em branco (`:669`) | **Não** | Numa janela **maior**, `qBuf`/`visBuf` ficam **subdimensionados**. A guarda de `:233` testa apenas `!qBuf`, **nunca o tamanho** — escritas fora do limite de `TypedArray` são **silenciosamente descartadas** e leituras devolvem `undefined`. O preenchimento **degenera sem erro visível**. |

**Classificação:** no Colorir, **qualquer redimensionamento posterior à inicialização produz
desalinhamento geométrico entre arte e pintura e corrompe o preenchimento**. Não é degradação
estética: é corrupção de estado.

O próprio código já documenta a fragilidade — `src/screens/AtelierCanvasScreen.js:6`, textualmente:

> *"— NUNCA redimensionam o canvas (o motor é uma WebView; mudar o tamanho reinicia o desenho)."*

O aplicativo **depende de nunca redimensionar**. **D1 remove essa garantia.**

### 5.3 O sintoma após o Centro de Controle — **HIPÓTESE CAUSAL PRIORITÁRIA, NÃO CONFIRMADA**

> ### ⚠️ CORREÇÃO DE CAUSALIDADE — emenda do Portão Humano 1, item 6
>
> **Status desta seção, congelado:**
> **`HIPÓTESE CAUSAL PRIORITÁRIA / MECANISMO COMPATÍVEL COM A EVIDÊNCIA ESTÁTICA, AINDA NÃO
> CONFIRMADO EMPIRICAMENTE`.**
>
> **É proibido escrever** — aqui ou em qualquer artefato do delta — que *"o sintoma é explicado por
> encerramento do processo da `WKWebView`"* **como fato confirmado**.
>
> **O que esta auditoria provou:** que existem, no código, **vulnerabilidades reais e compatíveis**
> com o sintoma relatado — ausência de escuta de `onContentProcessDidTerminate` e ausência de
> revalidação em `AppState` nas duas telas de canvas. Isso é prova de **ausência de defesa**.
>
> **O que esta auditoria NÃO provou:** que abrir e fechar o Centro de Controle **de fato** provocou
> `onContentProcessDidTerminate` no aparelho do fundador. A execução física **não capturou** essa
> evidência. Ausência de defesa **não é** demonstração de causa.
>
> **Confirmação causal exige** instrumentação e reprodução no subportão apropriado (`F6-SG-A`),
> com captura do evento em aparelho — não inferência estática.
>
> **`P-152` e `P-164` permanecem, sem rebaixamento.** A incerteza é sobre a **causa**, não sobre o
> **risco**: as ausências de defesa estão comprovadas e continuam abertas independentemente de qual
> mecanismo tenha disparado o sintoma observado.

O Centro de Controle do iOS **não redimensiona** a janela; ele leva o aplicativo a `inactive`.
Portanto §5.2 **não** explica sozinho o sintoma. A auditoria encontrou uma segunda ausência:

`COMPROVADO PELO CÓDIGO` · varredura de **todo** o `src/`:

- `onContentProcessDidTerminate` → **zero** ocorrências.
- `onRenderProcessGone` → **zero** ocorrências.
- `ColoringScreen.js` — **nenhum** `AppState`, **nenhum** `useFocusEffect`, **nenhum** `isFocused`,
  **nenhum** `reload`.
- `AtelierCanvasScreen.js` — **nenhum** `AppState`.
- `AtelierCanvas.js` — `<WebView key={webViewKey} … onError={…} />`; `webViewKey` só avança em
  `handleRetry()`, um botão **manual**.
- `ColoringCanvas.js` — `<WebView key={retryKey} … />` (`:997-998`), `retryKey` (`:786`) igualmente
  manual.

Em iOS, quando o processo de conteúdo do `WKWebView` é encerrado por pressão de memória — o que
segundo plano e transições de sistema tornam mais provável — **`onError` não dispara**. O único
sinal é `onContentProcessDidTerminate`, que **não é escutado em lugar nenhum**. **Se** esse
encerramento ocorrer, o resultado **seria** uma `WebView` em branco **sem recuperação automática**;
e como nenhuma das duas telas escuta `AppState`, **nada reavalia a integridade do canvas quando o
aplicativo volta a `active`** — isso último é fato, e vale para **qualquer** causa de perda, não só
para esta hipótese.

**Classificação exigida pelo escopo:**

| Camada | Natureza | Dono |
|---|---|---|
| Ausência de tratamento de término do processo da `WebView` e ausência de revalidação em `AppState` nas duas telas de canvas | **`CANVAS-SPECIFIC`** — os quatro jogos tratam `AppState`; **só** Colorir e Ateliê não tratam | **Fase 9** (`F9-C60-LFC-01`) |
| Ausência de qualquer política de `resize`/orientação em toda a aplicação, que deixa o canvas destrutível sob rotação e sob multitarefa — **ambas já alcançáveis hoje em iPad** (§1.2-bis) | **`GLOBAL`** | **Fase 6** (`F6-LFC-01` / **F6-R3**) |

**As duas ausências de defesa são reais, comprovadas e distintas** — e essa afirmação **não**
depende da hipótese causal. A camada global **não seria** a explicação do sintoma do Centro de
Controle; a camada específica **não** protege contra rotação. Corrigir uma sem a outra deixa a
exposição de pé. **Nada foi corrigido nesta auditoria.**

**Qual delas explica o sintoma observado permanece indeterminado** — inclusive a possibilidade de
uma terceira causa ainda não levantada. A determinação é tarefa de `F6-SG-A`, com instrumentação.

---

## 6. Achados adicionais e tensões registradas — **não resolvidas aqui**

| # | Achado | Estado |
|---|---|---|
| **AD-1** | A série `E000–E089` do *checklist* mestre **não existe** neste repositório. Varredura exaustiva de `docs/` + `specs/` devolve apenas `E003–E018`, `E022`, `E023`, `E039`, `E042`, `E075`, `E076`, `E077`. O próprio `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:282` afirma textualmente que `E039` e `E042` *"**não** possuem representação versionada neste repositório"*. A identidade canônica de pendência aqui é a matriz **`P-01..P-167`**. → `Q1` **RESOLVIDA** na emenda do Portão 1: `E` e `P` são **taxonomias paralelas**, sem relação obrigatória 1:1; a ausência material de `E000–E089` **não** autoriza inventar, recriar, migrar `E`→`P` nem substituir o *checklist* mestre. Ver `DECISIONS.md` §`PF6D-Q1`. | **Resolvido pela emenda** |
| **AD-2** | `P-103` está na matriz como `IMPLEMENTADO SEM CONSUMIDOR` (*"`ADVENTURES_GUIDE` sem consumidor e `BeniAppTour` órfão"*). Porém o tour de Aventuras **executa em aparelho** — `isAdventureTourActive()` é consumido por `AppNavigator.js:291` e pela `TabletSidebar`, e o fundador observou o tour rodando com marcação errada. **Tensão entre a matriz e o comportamento observado.** **Não reclassifiquei `P-103`** — reclassificar exigiria evidência que esta auditoria não produziu. → **Encaminhado à Fase 7.** | Registrado, não resolvido |
| **AD-3** | `TabletSidebar` viola `RF-A7` (alvo 56×56) e `RF-C12` (piso 13px) — requisitos **já aprovados** na *spec* da 021. São violações de requisito existente, **não** achados novos; pertencem ao Bloco **B2**, que está **BLOQUEADO** por **D18**. | Registrado |
| **AD-4** | `grid` e `displayScaleTablet` em `tokens.js` são *tokens* **sem nenhum consumidor** — a mesma natureza de `P-82`/`P-148` (código declarado e morto). **Não criei código de risco novo por isso**: a regra do fundador em §27.2 da matriz proíbe criar código por simples ampliação de evidência, e o fato passa a ser **coberto** por `F6-RSP-02`, que enuncia a ausência do modelo de três faixas. | Registrado, sem código novo |
| **AD-5** | O Split View do iPadOS **já pode** entregar larguras variáveis hoje (`UIRequiresFullScreen: false`), **sem** nenhuma mudança de orientação. A instabilidade de `resize` **não é hipotética nem futura**. **Reforçado pela emenda:** a §1.2 corrigida prova que o iPad **também já gira**, então são **dois** caminhos de `resize` abertos hoje, não um. | Registrado — **agravado** |
| **AD-7** | *(novo, emenda do Portão 1)* O manifesto Android gerado pelo CNG **não possui variante por *idiom***: `android:screenOrientation` é uma chave única para telefone e tablet (`@expo/config-plugins/build/android/Orientation.js:21-33`). Entregar `D1` em **tablet Android** sem liberar paisagem em **telefone Android** é, hoje, um problema **sem solução de configuração conhecida e provada** neste repositório. → comparação obrigatória das vias **A/B/C/D** na etapa PLAN (§1.4). | Registrado, não resolvido |
| **AD-6** | O *smoke* atual (portões `G-BP-1/2`, `G-SAFE`, `G-NAV-1/2`, `G-A11Y-1/2`, `G-MOTION`, `G-SPLASH`, `G-STATUS`, `G-ICON`) **não tem nenhum portão** de âncora de mapa, de faixa expandida, de política de orientação ou de estabilidade sob `resize`. O *checklist* do delta (`02_CLARIFY_E_CHECKLIST.md` §3) propõe esses portões. | Registrado |

---

## 7. O que esta auditoria **não** fez

Não alterou `app.json`, `eas.json`, `package.json`, nenhum arquivo de `src/`, nenhum *asset*,
nenhum manifesto. Não instalou dependência. Não gerou *build*. Não executou validação física. Não
executou `npm run smoke` (por determinação explícita do fundador para esta etapa documental). Não
corrigiu nenhum defeito. Não reclassificou nenhuma pendência existente. Não reabriu nenhuma das
decisões `D1`–`D18`. Não fez *push*, não fez *merge* e não trocou de *worktree*.

**A emenda do Portão Humano 1 (2026-08-08) também não fez:** não baixou o `.ipa` do *build*
`10fce052`, não consultou o EAS, não gerou *build*, não instalou `expo-screen-orientation` nem
qualquer outra dependência, não alterou `app.json`, não escolheu entre as vias A/B/C/D, não
rebaixou `P-152` nem `P-164`, não reclassificou `P-103` e não alterou a linha `P-141` — que foi
**verificada e está correta** (167/167 linhas da matriz com exatamente 22 colunas, com contagem
que honra o escape `\|` do Markdown).
