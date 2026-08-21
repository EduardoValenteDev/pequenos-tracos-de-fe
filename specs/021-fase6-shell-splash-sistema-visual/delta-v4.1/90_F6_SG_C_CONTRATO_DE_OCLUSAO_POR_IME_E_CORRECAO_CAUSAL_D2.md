# F6 · SG C — Contrato de oclusão por IME e correção causal de `D2`

> **Artefato 90 · delta-v4.1 · 2026-08-21**
> Sucede o `88` (perícia final de causas raiz) e o `89` (implementação da estabilização
> responsiva). Fecha a causa `D2` — *"o teclado cobre o campo de nome do Ateliê"* — e
> estabelece o **contrato de oclusão por IME** que passa a governar essa geometria.
>
> **Estado ao final deste artefato:** `READY_FOR_FINAL_PHYSICAL_REVALIDATION`.
> Nenhum `push`. Nenhum `merge`. SG C **não** está fechado.

---

## 0. Sumário executivo

`D2` não era um problema de espaço. Era um problema de **âncora**.

A campanha física de 2026-08-21 no SM-X510 (Android 16, `edgeToEdgeEnabled: true`,
New Architecture / Fabric / bridgeless) mostrou o sheet de nome do Criar livre
**debaixo do teclado**, com o portão `C1.1 §5` do smoke **verde** o tempo todo. O portão
cobrava a presença de um `KeyboardAvoidingView` com `behavior='height'`. O componente
estava lá, declarado exatamente como o portão exigia — e **inerte**.

A causa foi ratificada por leitura do fonte instalado, não por analogia: sob edge-to-edge
do Android 16 a janela **deixou de ser redimensionada** pela IME, e o
`KeyboardAvoidingView` consome **apenas** `screenY` — o campo que essa janela envenena.
O evento de teclado continua chegando, e chega **correto**; o que morreu foi o
consumidor.

A correção substitui o mecanismo por um **contrato geométrico local**
(`src/hooks/useImeOcclusion.js`), provado por um portão novo (`G-CVS-5`) que exercita a
geometria em retângulos e é submetido a **10 mutantes**, entre eles o próprio defeito
`D2` reinserido.

**Nenhuma dependência nova. Nenhuma alteração nativa. Nenhuma mudança de fluxo, texto,
CTA ou regra de negócio.**

---

## 1. A cadeia causal, ratificada

### 1.1 O que a campanha física provou

O sheet de nome abriu, o teclado subiu, e o cartão **não se moveu**. Deslocamento
observável ≈ 24 dp — imperceptível. Campo e botão "Guardar desenho" ficaram fora de
alcance no momento exato de salvar o desenho.

### 1.2 O que o logcat provou (evidência decisiva)

`C:\tmp\ptf_evidencias\SG_C_FISICA_01\logcat_dedup.txt`, a partir da linha `158317`:

```
14:11:37.623 VRI[MainActivity]@2f647f: WindowInsets changed: ime:[0,0,0,669]
14:11:37.625 VRI[MainActivity]@2f647f: Relayout returned: old=(0,0,2304,1440) new=(0,0,2304,1440)
             caller= ViewRootImpl.updateBlastSurfaceIfNeeded:3592 → relayoutWindow:11813
                   → performTraversals:4840 → doTraversal:3959
14:11:37.630 WindowManager: mAttrs={(0,0)(fillxfill) sim={adjust=resize} ...}
```

Três fatos numa mesma janela de 7 ms:

1. **A IME chega como inset** — `ime:[0,0,0,669]`, 669 px físicos.
2. **A janela NÃO encolhe** — `old=(0,0,2304,1440)` **igual a** `new=(0,0,2304,1440)`,
   apesar de `sim={adjust=resize}` estar declarado. Sob edge-to-edge o
   `adjust=resize` é **honrado como insets**, não como redimensionamento de janela.
3. **Há travessia de layout real** — `performTraversals` roda. O app **é** notificado; o
   quadro **é** recomposto.

### 1.3 O que o fonte instalado provou

Duas leituras encerraram a discussão. Ambas em `node_modules`, versão instalada:

**(a) O evento de teclado existe sob bridgeless.**

`ReactSurfaceView.kt:36-37`:

```kotlin
public class ReactSurfaceView(context: Context?, private val surface: ReactSurfaceImpl) :
    ReactRootView(context)
```

É **herança**, não caminho paralelo. A lista de `override` da classe (linhas 50, 84, 107,
117, 123, 129, 134, 140, 142, 144, 155, 173, 176, 179, 184) **não contém
`onAttachedToWindow`** — logo o `CustomGlobalLayoutListener` de
`ReactRootView.java:890-932` continua sendo registrado sob bridgeless.
`keyboardDidShow` **dispara**, e `endCoordinates.height` está **correto**.

> Isto **refuta** a hipótese registrada em `RECONCILIACAO_CAUSAL.txt §5.3`, que atribuía
> o defeito a *"`keyboardDidShow` nunca dispara"*. Aquela cadeia tinha um ponto cego de
> herança. A correção documental está na §7 deste artefato.

**(b) O consumidor é que está quebrado.**

`KeyboardAvoidingView.js:236-296`. O `case 'height'` só aplica `heightStyle` quando
`this._frame != null && this.state.bottom > 0`, e `this.state.bottom` nasce
exclusivamente de `screenY` — que vem de `getWindowVisibleDisplayFrame()`, que é
justamente o que parou de encolher.

**Conclusão ratificada:** a métrica está boa, o evento está vivo, e o `KAV` olha para o
único campo envenenado. **O defeito é de ANCORAGEM, não de geometria.**

### 1.4 Geometria real do aparelho (medida, não estimada)

| Grandeza | Retrato | Paisagem |
|---|---:|---:|
| Viewport | 823 × 1317 dp | 1317 × 823 dp |
| IME real (pela inset) | 421 dp | 382 dp |
| IME reportada pelo evento | 397 dp | 358 dp |
| Banda livre acima da IME | — | ≈ 417 dp |
| Altura intrínseca do cartão | ≈ 185 dp | ≈ 185 dp |

**417 dp de banda para um cartão de 185 dp.** Nunca faltou espaço. A premissa antiga —
registrada no cabeçalho de `computeNameSheetMaxHeight` e agora corrigida no código — de
que *"em paisagem sobra menos espaço do que o cartão pede"* era **falsa**.

Note também a diferença sistemática entre a IME **real** (inset) e a IME **reportada**
(evento): 24 dp em ambas as orientações. O contrato foi projetado para conviver com essa
diferença — ver §3.

---

## 2. Inventário da família `KeyboardAvoidingView` (§4 · §7)

Varredura exaustiva de `src/**`. **Quatro** consumidores, e só quatro.

| `FILE` | `COMPONENT` | `USER_FLOW` | `CURRENT_KEYBOARD_MECHANISM` | `EDGE_TO_EDGE_EXPOSURE` | `SAME_ROOT_CAUSE_AS_D2` | `USER_VISIBLE_RISK` | `SAFE_TO_SHARE_FIX` |
|---|---|---|---|---|---|---|---|
| `src/screens/AtelierCanvasScreen.js` | sheet de nome do desenho | Brincar → "Crie do seu jeito" → "Criar livre" → desenhar → "Guardar desenho" | `KAV behavior={ios ? 'padding' : 'height'}` | **Alta** — overlay absoluto sobre a janela inteira | **SIM** | **Confirmado em campo**: campo e CTA sob o teclado | — (é a origem) |
| `src/components/ParentalGate.js` | desafio matemático | Perfil → "Área dos Pais" (modal) | `KAV behavior={ios ? 'padding' : undefined}` | Alta — `Modal` + `statusBarTranslucent` | **NÃO** | **Não provado** — caixa centrada, risco geométrico em paisagem | Não — mecanismo diferente |
| `src/screens/ParentAreaScreen.js:661` | formulários da área | Perfil → "Área dos Pais" → seções | `KAV behavior={ios ? 'padding' : undefined}` + `ScrollView keyboardShouldPersistTaps="handled"` | Alta | **NÃO** | **Não provado** — o `ScrollView` pode bastar | Não — mecanismo diferente |
| `src/screens/ProfileScreen.js:330` | edição de perfil | aba Perfil | `KAV behavior={ios ? 'padding' : undefined}` + `ScrollView keyboardShouldPersistTaps="handled"` | Alta | **NÃO** | **Não provado** | Não — mecanismo diferente |

### 2.1 Por que os outros três NÃO compartilham a causa

Não é analogia — é o `switch` do RN. Os três declaram
`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`. No Android isso cai no
`default:` de `KeyboardAvoidingView.js`, que retorna:

```jsx
<View ref={this.viewRef} onLayout={this._onLayout} style={style} {...props}>
```

Uma `View` comum. **O `KAV` desses três nunca consumiu `screenY`** — ele é inerte
**por declaração**, e sempre foi, em qualquer versão do Android. Eles nunca dependeram
do campo envenenado, portanto **não podem** ter sido quebrados por ele.

Somente o Ateliê declarava `'height'`. Somente ele entrou no caminho que lê `screenY`.

> **`SAME_CAUSE_CONSUMERS` = `src/screens/AtelierCanvasScreen.js`, e só.**

### 2.2 Adjudicação de §7 — **Cenário 1**

A causa é **exclusiva do Ateliê**. Não há fundação compartilhada a construir por
obrigação: migrar os outros três para o contrato seria **migração estética**, o que §7
proíbe explicitamente no Cenário 1.

Os outros três ficam registrados como **residual com evidência de diferença causal**
(§2.1) e recebem uma **sonda física barata** na campanha final — porque "mecanismo
diferente" prova que não é `D2`; **não** prova que o mecanismo deles funciona sob
edge-to-edge. Essa é uma pergunta aberta, e ela é respondida por observação, não por
leitura.

O módulo criado é, ainda assim, um **hook reutilizável e puro**: não porque a migração
seja necessária hoje, mas porque a geometria que ele expressa é um conceito real
(*banda útil acima da IME*) e estará pronta se a sonda mostrar que algum dos outros
precisa dela.

---

## 3. O contrato de oclusão por IME

`src/hooks/useImeOcclusion.js` — **157 linhas**, três funções puras e um hook.

### 3.1 As três regras

**REGRA 1 — PROVENIÊNCIA.** A oclusão nasce de `endCoordinates.height`, jamais de
`screenY`. `height` é a altura da IME; `screenY` é a posição da IME **na janela visível**,
e é a janela visível que está envenenada.

**REGRA 2 — SUBSTITUIÇÃO, NÃO SOMA.** Quando a IME está presente, a reserva inferior é
`max(oclusão, safeBottom)` — **não** `oclusão + safeBottom`. A IME desenha **por cima** da
barra de navegação; somar as duas reservaria a mesma faixa duas vezes e comprimiria a
banda sem motivo.

```js
const bottomReserve = Math.max(numero(imeOcclusion), numero(safeBottom));
```

**REGRA 3 — DEGRADAÇÃO SEGURA.** Enquanto o app **nunca** recebeu métrica de teclado, o
cartão ancora no **topo** da banda (`flex-start`). Se um runtime futuro deixar de reportar
a IME, o resultado é um cartão no alto da tela — visível, usável, feio. Nunca um cartão
debaixo do teclado. O ramo seguro é o **padrão**, não a exceção.

```js
align: imeEverMeasured ? 'flex-end' : 'flex-start',
```

### 3.2 A bandeira de sessão

`everMeasured` é escopado à **sessão do app** (`let runtimeJaReportouIme` no módulo), não
à montagem do componente.

Isso corrige um defeito que a própria implementação criou e que foi detectado antes de
qualquer commit: com escopo por montagem, o cartão abria no topo da banda e **saltava
~690 dp para baixo** quando o teclado chegava — em **toda** gravação de desenho, porque o
Ateliê não tem outro campo de texto que pudesse ter "aquecido" a bandeira antes.

Com escopo de sessão, o salto acontece no máximo **uma vez por abertura do app**, e o
logcat (§1.2) prova que existe travessia de layout real para acomodá-lo. A propriedade
"este runtime reporta IME?" é do **ambiente**, não da montagem — e é assim que ela está
modelada.

### 3.3 A API

```js
resolveImeOcclusion({ keyboardHeight, safeBottom, platform })  // → dp de oclusão
computeAvailableBand({ viewportHeight, safeTop, safeBottom, imeOcclusion })
                                                    // → { top, bottomReserve, height }
computeSheetPlacement({ bandHeight, imeEverMeasured, margin })  // → { align, maxHeight }
useImeOcclusion()                                   // → { occlusion, everMeasured }
```

As três funções são **puras e exportadas** de propósito: é assim que `G-CVS-5` as carrega
do fonte real e as executa em Node, em retângulos, sem simulador e sem aparelho.

---

## 4. Alternativas avaliadas (§5 · §6)

A matriz de §5 foi percorrida inteira. Nenhuma variante foi escolhida por ter menos
linhas.

### `C1` — métrica local do RN (`Keyboard` API) · **ESCOLHIDA**

A condição de §5 era estrita: *"SOMENTE SE a perícia provar que fornece a métrica real da
IME no Fabric/bridgeless atual. Não selecionar se depender do mesmo evento ausente."*

A perícia **provou** (§1.3a): o evento não está ausente, e a altura está correta. O que
estava quebrado era o consumidor, não a fonte. `C1` passa no seu próprio teste de
admissão.

**Custo:** zero dependências, zero código nativo, zero configuração. Usa uma API que o
projeto já carrega.

### `C2` — `react-native-reanimated` (`useAnimatedKeyboard`) · **REJEITADA**

Das cinco condições de §5, a que decidiu foi a de **necessidade**: `useAnimatedKeyboard`
resolveria o mesmo problema com uma superfície muito maior — worklets, UI thread,
`Animated.View`, e um acoplamento novo entre uma geometria de layout e o runtime de
animação. Ganharia **suavidade de transição**, que não é o defeito. O defeito é que o
cartão fica **no lugar errado**, não que ele chegue lá bruscamente.

Trocar um problema de ancoragem por um acoplamento com o motor de animação é aumento de
risco sistêmico sem ganho no eixo do defeito. **Rejeitada por desproporção**, não por
incapacidade.

### `C3` — geometria local determinística (sem métrica de IME) · **REJEITADA**

É a variante que estima a IME em vez de medi-la. §5 exigia: *"Não aceitar constante
arbitrária de 50% sem demonstrar o envelope geométrico que a torna segura."*

Esse envelope **não existe** neste aparelho. A IME real é 421 dp em 1317 dp de retrato
(32 %) e 382 dp em 823 dp de paisagem (46 %). Uma constante única erra em pelo menos uma
das duas orientações, e erra **em faixas diferentes** conforme o teclado do usuário
(sugestões ligadas, teclado de terceiros, entrada por voz). Estimar seria programar por
aparelho — exatamente o que §19 proíbe.

**Rejeitada por não haver envelope demonstrável.** Sobrevive apenas como o *ramo de
degradação* da REGRA 3, onde o custo do erro é "feio", não "quebrado".

### `C4` — outra abordagem (nova dependência nativa) · **NÃO ACIONADA**

`react-native-keyboard-controller` resolveria isto com elegância. **Não foi instalado, não
foi avaliado como candidato executável e não é necessário**: §5 determina STOP e Human
Gate específico caso a única solução correta exigisse dependência nova. Como `C1` é
correta e suficiente, o STOP não se aplica.

> **`NEW_DEPENDENCY = NÃO`.**

### 4.1 As duas variantes de reconciliação (§2)

§2 proibia presumir qualquer das duas. Ambas foram julgadas por evidência:

**Variante A — corrigir só o Ateliê:** **ACEITA**, porque §2.1 provou por código que a
causa é exclusiva dele. Não foi aceita "automaticamente"; foi aceita depois de a leitura
do `switch` do `KeyboardAvoidingView` eliminar os outros três candidatos.

**Variante B — fundação compartilhada migrando os quatro consumidores:** **REJEITADA**,
porque a premissa que a justificaria — causa compartilhada — é **falsa**. Migrar os
outros três seria mexer em três telas sem defeito provado, incluindo a Área dos Pais,
para satisfazer uma simetria estética. §7 Cenário 1 proíbe exatamente isso.

O que sobreviveu da Variante B foi o **formato**: o contrato nasceu como hook puro e
reutilizável, pronto para receber outros consumidores **se** a sonda física mostrar que
algum precisa. A fundação existe; a migração não foi feita porque não há causa que a
justifique.

---

## 5. Portões e mutantes (§9 · §11)

### 5.1 `G-CVS-5` — o portão novo

Criado **antes** de qualquer código de produção, e **falhou pelo motivo certo**:

- **`G_CVS_5_PRE_PATCH = RED`** — falha única `[4974]`, suíte `4977/4978`.
  `RED_REASON`: cláusula `(A)` — o módulo `src/hooks/useImeOcclusion.js` não existia —
  mais `(J)` e `(K)×4`, as cláusulas de consumo pela tela.
- **`G_CVS_5_POST_PATCH = GREEN`** — `[4974] ✓`, suíte `4978/4978`.

O portão exercita **8 cenários** em retângulos (`viewport`, `safeInsets`, `imeRect`,
`sheetRect`, `inputRect`, `ctaRect`), cada um carregando **duas** verdades: `imeReal` (a
inset física) e `alturaEvento` (o que o app foi informado). É essa separação que permite
cobrar que o cartão não intersecte a IME **real** mesmo quando o evento subestima em
24 dp.

**Cláusulas:** `(B)` proveniência · `(C)` banda dentro do viewport · `(D)` substituição,
não soma · `(E)` teto · `(F)` cartão ∩ IME real = ∅ · `(G)` limites dos insets seguros ·
`(H)` ausência do mecanismo envenenado · `(I)` ausência de números de aparelho ·
`(J)`/`(K)` consumo pela tela.

O eixo textual `(H)`/`(I)` foi extraído para a função `violacoesTexto()` **de propósito**:
o mutation check precisa das **mesmas** cláusulas. Um mutante que sobrevivesse por cair
num caminho que só o eixo principal exercita não estaria provando nada.

### 5.2 Os 10 mutantes — `MUTANTS = 10/10 mortos`

Cada mutante é uma versão **plausível** do contrato: a forma que o defeito teria se
alguém "simplificasse" o módulo daqui a seis meses.

| # | Mutação | Morre em |
|---|---|---|
| `M1` | a oclusão volta a nascer de `screenY` — **o defeito `D2` em pessoa** | `(H)` |
| `M2` | a IME **soma-se** ao inset inferior em vez de substituí-lo | `(D)` |
| `M3` | a reserva inferior perde o piso do inset do sistema | `(D)` `(G)` |
| `M4` | o cartão ancora sempre embaixo, mesmo sem métrica nenhuma | `(F)` |
| `M5` | o teclado é **estimado** como metade da tela em vez de medido | `(D)` `(F)` `(I)` |
| `M6` | entra uma medida do aparelho da campanha (`382`) como reserva | `(B)` `(I)` |
| `M7` | o teto do cartão passa a ultrapassar a banda | `(E)` `(G)` |
| `M8` | as assinaturas de teclado deixam de ser removidas | `(H)` |
| `M9` | o contrato assina duas vezes a **abertura** e nunca o fechamento | `(H)` |
| `M10` | a banda esquece o inset superior e começa na borda da tela | `(C)` `(G)` |

Cobertura de cláusulas pelos mutantes: `B` `C` `D` `E` `F` `G` `H` `I`.

**Guarda antitautologia:** `loadModule` recusa mutação cuja âncora não exista mais. Uma
refatoração futura que desative silenciosamente o mutation check **derruba a suíte** em
vez de deixá-la verde por vacuidade.

`M1` merece registro à parte: é o próprio `D2` reinserido. Se algum dia ele sobreviver, o
portão parou de proteger a coisa que nasceu para proteger.

### 5.3 `C1.1 §5` — o portão legado, reexpresso

O portão que estava verde durante o defeito **não foi apagado**. Foi reexpresso.

Ele cobrava o **mecanismo** (`KeyboardAvoidingView` + `styles.nameKav` +
`behavior='height'`). Agora cobra o **contrato**, lido contra `scrN` (o fonte sem
comentários — a tela legitimamente *cita* o `KeyboardAvoidingView` ao explicar por que
ele saiu):

```js
check('C1.1 §5 (teclado não cobre): sheet de nome ancorado na banda útil acima da IME',
  /useImeOcclusion\(\)/.test(scrN)
  && /computeAvailableBand\(\{[\s\S]{0,240}imeOcclusion/.test(scrN)
  && /justifyContent: nameSheetPlacement\.align/.test(scrN)
  && /bottom: nameSheetBand\.bottomReserve/.test(scrN)
  && !/KeyboardAvoidingView/.test(scrN),
  'o sheet de nome não protege o campo do teclado');
```

**A intenção — "o teclado não cobre o campo" — continua valendo e ficou mais forte.** O
que saiu foi a exigência de um mecanismo provado inerte. Jamais a exigência de proteger
o campo.

### 5.4 `G-CVS-4` — limitação documentada (§9)

`G-CVS-4` segue **verde** (`[4973] ✓`), sem regressão. Seu cabeçalho passou a registrar
explicitamente o que ele **não** prova:

> **`G-CVS-4` prova apenas `computeNameSheetMaxHeight`. `G-CVS-4` não prova resposta real
> à IME.**

Era precisamente essa confusão — portão de política de teto lido como portão de resposta
ao teclado — que deixou `D2` passar.

### 5.5 Resultados dos portões de qualidade (§11)

```
[gate:platform-scope] OK — nenhum arquivo próprio com sufixo .ios/.android/.native
                            em 1471 arquivos
Android Bundled 2105ms index.js (2383 modules)
[4973] ✓  G-CVS-4
[4974] ✓  G-CVS-5
── Result: 4978/4978 passed, 0 failed ──
npx expo-doctor → 18/18 checks passed. No issues detected!
```

| Portão | Resultado |
|---|---|
| `G_CVS_5_PRE_PATCH` | **RED** (motivo legítimo — `(A)`+`(J)`+`(K)×4`) |
| `G_CVS_5_POST_PATCH` | **GREEN** |
| `MUTANTS` | **10/10 mortos** |
| `G-CVS-4` | **GREEN**, sem regressão |
| `npm run smoke` | **4978/4978** |
| `npm run bundle:check` | **verde** (2383 módulos) |
| `npm run verify:runtime` | **verde** |
| `npx expo-doctor` | **18/18** |
| `npm run gate:platform-scope` | **OK** (1471 arquivos) |

---

## 6. Sentinelas de inset (§12) — gatilho **não** acionado

§12 exigia sentinelas *"se a solução escolhida puder influenciar insets fora do sheet"*.
A condição é **falsa**, e isso é verificável:

1. O diff em `AtelierCanvasScreen.js` está **inteiramente contido** no sheet de nome.
   Canvas, ferramentas, cabeçalho, persistência e o documento lógico
   (`AtelierCanvas.js`) não foram tocados.
2. `useImeOcclusion` apenas **lê** `useSafeAreaInsets()`. Não instala provider, não
   envolve árvore, não altera `SafeAreaProvider`, não muda `app.json`, não muda
   configuração de janela ou nativa.
3. O hook não é consumido por **nenhuma outra tela**.

Não havendo caminho pelo qual a variante pudesse alterar insets fora do sheet, a suíte
verde inteira (4978/4978, que inclui os portões de inset já existentes) mais a
bundleabilidade servem como sentinela **estática**. As sentinelas **dinâmicas** — Início,
sidebar, Perfil, Área dos Pais, inset superior/inferior, barra de navegação do Android,
superfície sem teclado — permanecem cobertas pela campanha física de §16, sem custo
extra: elas são o próprio percurso do roteiro.

---

## 7. Correções documentais em `RECONCILIACAO_CAUSAL.txt`

O documento de reconciliação da campanha física contém duas afirmações que a perícia
posterior **refutou**. Elas ficam registradas aqui — o arquivo de evidência original
**não é reescrito**, porque evidência de campanha não se edita retroativamente.

**§5.3 — cadeia "`keyboardDidShow` nunca dispara":** **REFUTADA**. Os passos `(a)`, `(b)`
e `(d)` daquela cadeia partiam de um ponto cego de herança: supunham que
`ReactSurfaceView` fosse um caminho paralelo a `ReactRootView`. `ReactSurfaceView.kt:36`
prova que é **subclasse**, e a ausência de `override fun onAttachedToWindow` prova que o
listener global de layout continua registrado. **O evento dispara. A altura está
correta.** O defeito é o consumidor (`KeyboardAvoidingView` lendo `screenY`), não a
fonte.

**§5.7 — "`ParentalGate` / `ParentAreaScreen` / `ProfileScreen` herdam a mesma
inércia":** **FALSA**. Os três declaram `behavior: undefined` no Android e caem no
`default:` do `KeyboardAvoidingView`, que retorna uma `View` comum. Eles são inertes **por
declaração**, sempre foram, e **nunca consumiram `screenY`** — logo não podem ter sido
quebrados por ele. Podem ter outros problemas sob edge-to-edge; não têm **este**.

---

## 8. Arquivos tocados

| Arquivo | Estado | Δ |
|---|---|---|
| `src/hooks/useImeOcclusion.js` | **criado** | 157 linhas |
| `src/screens/AtelierCanvasScreen.js` | modificado | +77 / −35 |
| `scripts/smoke.js` | modificado | +360 |
| `specs/.../90_...md` | **criado** (este) | — |

**Não tocados, por decisão explícita:** `src/components/ParentalGate.js` ·
`src/screens/ParentAreaScreen.js` · `src/screens/ProfileScreen.js` ·
`src/screens/AtelierCanvas.js` (documento lógico) · `src/components/map/StoryMapMarker.js`
· `src/components/RecoverableImage.js` (**`C3` está lacrado — ver §9**) · qualquer arquivo
nativo, `app.json`, `babel.config.js`, `metro.config.js`, `package.json`.

---

## 9. Residuais preservados (§14)

Este artefato **não resolve** nada abaixo, e registrar não é reabrir:

- **`C3` — LACRADO.** `C3_FINAL_CLASSIFICATION = NO_PATCH_REQUIRED`. Não reaberto, não
  tocado, não discutido. `StoryMapMarker.js` e `RecoverableImage.js` intactos.
- **Composição futura** (owner próprio, fora de SG C): Pares do Beni · Palavrinhas do
  Beni · Monte a Cena (exceto estado/toque) · Minhas Artes · Colorir com o Beni · cenas
  narrativas · Livrinho da Fé · Guardar no coração.
- **Bordas cinzas:** residual **não bloqueante**, já adjudicado.
- **Desalinhamento do onboarding/tour:** defeito **pré-existente** com owner próprio.
- **"Transições duras":** observação de UX, **não** de posse desta correção.
- **Questões puramente composicionais em paisagem:** já diferidas.
- **`ParentalGate` / `ParentAreaScreen` / `ProfileScreen`:** residual com **evidência de
  diferença causal** (§2.1), com sonda física barata na campanha final.

---

## 10. Raio físico remanescente

O que este artefato **não pode** provar sozinho, e por quê:

| Item | Estado | O que falta |
|---|---|---|
| `D2` | corrigido em código, **portão verde** | ver o cartão acima do teclado, retrato **e** paisagem |
| `A1` `A2` | `UNPROVEN` — **dívida de evidência** | encerramento físico direcionado |
| `B` | `UNPROVEN` — **dívida de evidência** | o estímulo exato **durante a montagem** |
| `C1` `C2` `E1` | atestados pelo fundador (§13) | confirmação de que seguem reconciliados |
| família `KAV` (3 telas) | causa diferente, comportamento **não observado** | sonda de teclado não destrutiva |

> Os itens `UNPROVEN` são **dívida de evidência**. **Não** são seis defeitos de código.

A campanha que fecha esse raio está especificada no artefato de campanha e no roteiro
humano entregue junto a este documento. Enquanto ela não correr, **SG C permanece
aberto**.

---

## 11. Estado

```
SG_C_CURRENT_STATE ........... IMPLEMENTACAO_CONCLUIDA_AGUARDANDO_REVALIDACAO_FISICA
READY_FOR_FINAL_PHYSICAL_REVALIDATION ... SIM
NEW_DEPENDENCY ............... NAO
C3_LOCK_STATUS ............... LACRADO — nao reaberto, nao tocado
PUSH / MERGE / RELEASE ....... NENHUM
```

O objetivo nunca foi fazer `D2` **parecer bom** no SM-X510. Foi estabelecer um contrato de
layout que leve a região da IME em conta explicitamente, e que valha em retrato, em
paisagem, sob edge-to-edge do Android 16, sob New Architecture / Fabric / bridgeless e
dentro das faixas responsivas já existentes.

**Corrigir a fundação quando houver causa compartilhada. Não programar por aparelho. Não
redesenhar superfícies que possuem owner futuro.**
