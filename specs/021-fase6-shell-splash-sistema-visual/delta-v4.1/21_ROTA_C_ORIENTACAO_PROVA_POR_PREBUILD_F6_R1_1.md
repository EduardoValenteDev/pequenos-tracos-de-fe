# 21 · Rota (C) de orientação — prova por prebuild

`F6-SG-C` / `F6-R1.1` · `TK-C-035` · commit `C-C10` isolado
Antecedente obrigatório: `20_ORIENTACAO_MECANISMO_E_ROTAS_F6_R1_1.md` (`TK-C-028`..`TK-C-034`).

Este artefato registra a **execução** da rota (C) e a **evidência nativa** que a sustenta.
O artefato `20` provou o mecanismo **por linha de código**; este prova o resultado **por
inspeção do que o prebuild realmente gerou**. São coisas diferentes, e a distinção é o
ponto: ler o plugin diz o que ele *pretende*; ler o manifesto gerado diz o que *saiu*.

---

## 1. A decisão que autorizou esta task, e como ela foi reformulada

A rota (C) foi aprovada pelo fundador com uma **correção de justificativa** que este
artefato adota como redação oficial:

> No SM-X510 (Android 16, `targetSdk` 36, `sw823dp`), a configuração **anterior** já
> permitia `ROTATION_0` → `ROTATION_90` → `ROTATION_0` mantendo a `MainActivity` em foco.
> Portanto (C) **não** deve ser justificada como necessária para este aparelho, mas como
> **política compatível** para satisfazer `D1` também onde a exceção do Android 16 não
> existir.

Isto é mais forte do que parece, e muda o que o plugin *é*:

- (C) **não é a causa** da rotação observada no SM-X510. Naquele aparelho a restrição de
  orientação já era ignorada pela exceção de telas grandes do Android 16.
- (C) **é a política** que faz o caso 4 de `D1` valer onde a exceção **não** incidir:
  versões anteriores do Android, OEM que não a aplique, ou janela abaixo do limiar.
- Consequência de honestidade: **nenhum relatório pode usar a rotação do SM-X510 como
  prova de que este plugin funciona.** Aquele tablet giraria com ou sem ele. A prova de
  eficácia de (C) tem de vir de outro lugar — e a §5 diz exatamente de onde.

## 2. Item em aberto do artefato 20 §5.2 — reconciliação

O artefato `20` deixou declarado um item de verificação **em aberto**: sob CNG não existe
diretório `android/`, logo nem o manifesto gerado nem o `targetSdkVersion` efetivo eram
legíveis na árvore, e versões recentes do Android relaxam restrição de orientação
justamente em telas grandes.

Estado agora, sub-item por sub-item:

| Sub-item de §5.2 | Estado | Como se fechou |
| --- | --- | --- |
| Manifesto gerado não é legível | **FECHADO** | Prebuild executado; manifesto lido e transcrito na §4 |
| `targetSdkVersion` efetivo não é legível | **FECHADO POR EVIDÊNCIA DE APARELHO** | `targetSdk` 36, medido pelo fundador no build instalado no SM-X510. A árvore gerada continua **não** o declarando: `android/app/build.gradle:94` diz `targetSdkVersion rootProject.ext.targetSdkVersion`, e quem preenche esse `ext` é o catálogo de versões do Expo em tempo de configuração do Gradle (`ExpoRootProjectPlugin.kt:30`, com *fallback* `35`). Ou seja: nem com `android/` na mão o número é legível estaticamente — só rodando Gradle, ou lendo o aparelho. Foi lido no aparelho. |
| Android recente relaxa restrição em telas grandes | **CONFIRMADO, e agora é premissa** | É exatamente a evidência do SM-X510. Passa de dúvida a fato conhecido, e é o motivo de (C) ser reclassificada de "necessária" para "compatível" (§1) |

## 3. O que foi implementado

Um único arquivo novo, `plugins/withAndroidTabletOrientation.js`, e **uma** linha
acrescentada a `app.json` (`plugins`). Nada mais.

| Restrição do fundador | Cumprida? | Medida |
| --- | --- | --- |
| `C-C10` isolado | sim | commit contém apenas o plugin, o registro em `app.json` e esta documentação |
| sem dependência nova | sim | `package.json` e `package-lock.json` com **hash idêntico** antes e depois (§6) |
| sem `expo-screen-orientation` | sim | não instalado, não importado, não citado em código |
| sem lógica de *idiom* em *runtime* | sim | zero linhas em `src/`; a pergunta "sou tablet?" não é feita por ninguém — quem responde é o sistema de recursos do Android |

Mecanismo, em três peças:

```
values/integers.xml           screen_orientation =  1   → SCREEN_ORIENTATION_PORTRAIT
values-sw600dp/integers.xml   screen_orientation = -1   → SCREEN_ORIENTATION_UNSPECIFIED
AndroidManifest.xml           android:screenOrientation="@integer/screen_orientation"
```

Sobre os valores: `1` reproduz **exatamente** o comportamento de hoje no telefone — o
caso 2 de `D1` é preservado por equivalência, não por promessa. `-1` é literalmente o que
o plugin do próprio Expo escreve quando `orientation` é `'default'`
(`android/Orientation.js:34`); adotar o idioma que a ferramenta já usa é o que `RG-9`
chama de menor intervenção. Descartados de propósito: `fullSensor` (10) ignoraria o
bloqueio de rotação do usuário — política que `D1` não pede e que um app infantil não
deveria tomar; `user` (2) e `fullUser` (13) acrescentariam a mesma sobra.

## 4. Evidência — o que o prebuild gerou

Comando: `npx expo prebuild --platform android --no-install`
Versões: `expo@54.0.36`, `@expo/config-plugins@54.0.5`
Saída: `✔ Finished prebuild` (um aviso não relacionado: `userInterfaceStyle: Install
expo-system-ui…`).

**4.1 — `android/app/src/main/AndroidManifest.xml`, atributo da `MainActivity`:**

```
android:screenOrientation="@integer/screen_orientation"
```

**4.2 — `android/app/src/main/res/values/integers.xml`:**

```xml
<resources>
  <integer name="screen_orientation">1</integer>
</resources>
```

**4.3 — `android/app/src/main/res/values-sw600dp/integers.xml`:**

```xml
<resources>
  <integer name="screen_orientation">-1</integer>
</resources>
```

**4.4 — os buckets de recurso, antes e depois.** O *template* traz `values`,
`values-night` e os `drawable*`/`mipmap*`. Depois do prebuild existe também
`values-sw600dp`, e ele contém **um único arquivo**, `integers.xml`. Isto é prova de que
o bucket qualificado nasceu deste plugin e não de herança do *template*.

**4.5 — a prova de que o plugin VENCEU, e não apenas rodou.** `android/Orientation.js:34`
escreve o literal sem condição, e `config.orientation` deste projeto é `"portrait"`
(`app.json:6`). Logo `withOrientation` **escreveu `portrait` neste mesmo atributo**. O
manifesto final não diz `portrait`; diz a referência. Só há uma ordem de eventos que
produz isso: este plugin executou **depois**. A ordem LIFO deduzida no artefato `20`
(`getPrebuildConfig.js:43` antes de `:72`, com `withMod.js:197-202` encadeando ao
contrário) sai de *dedução* para *fato medido*.

**4.6 — colateral verificado, porque importa para `D1`:** a `MainActivity` gerada mantém
`android:configChanges="keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode"`.
A rotação **não** recria a Activity. Nada em (C) mexeu nisso, e é o que se quer: girar o
tablet não reinicia a história que a criança está lendo.

## 5. O que esta prova NÃO cobre — declarado, não escondido

O fundador condicionou: *"Se o mecanismo de qualificador não resolver/compilar exatamente
como previsto: HARD STOP, sem fallback silencioso."*

**Não houve divergência.** Tudo o que foi previsto no artefato `20` apareceu no artefato
gerado, byte a byte, na §4. Não há HARD STOP a declarar. Mas o verbo *compilar* pede
precisão, e a precisão é esta:

| Etapa | Estado | Por quê |
| --- | --- | --- |
| **Geração** (plugin → manifesto + recursos) | **PROVADA** | §4, por inspeção do que saiu |
| **Compilação AAPT2** (`@integer/…` num atributo de formato `enum`, e o inteiro **negativo** `-1`) | **NÃO EXERCITADA** | Não há SDK Android nesta máquina: `ANDROID_HOME` e `ANDROID_SDK_ROOT` vazios, nenhum SDK nos caminhos padrão, sem `~/.gradle`, `adb` fora do PATH. Java 21 existe, e não basta — sem AAPT2 não há como linkar recurso |
| **Resolução em tempo de execução** (o aparelho escolher o bucket certo) | **NÃO EXERCITADA** | É física, por definição |

Isto **não** é um fallback silencioso: é o inverso — é o registro explícito de que duas
das três etapas continuam por provar, com o nome de cada uma.

**Onde cada uma fecha:**

- A **compilação** fecha no primeiro build nativo que consumir esta árvore. `RD-4` já
  agrupa todas as mudanças nativas da Fase 6 num único build ao fim de `R1` — e é
  exatamente por isso que `OR-6` põe a orientação por último. Se AAPT2 recusar a
  referência ou o valor negativo, o build **falha alto**, no lugar certo, antes de
  qualquer aparelho. Falha de build é o modo de falha desejável aqui.
- A **resolução física** fecha nos cenários §28 **#6, #15, #16, #17** e em `TK-C-062`.

**Consequência formal, e ela é dura:** o caso 4 de `D1` **continua NÃO satisfeito** com
base neste artefato. O que existe é a política correta, gerada corretamente. `SD-1`
permanece **não concedível** enquanto `TK-C-062` (tablet Android físico, retrato e
paisagem) estiver pendente — emenda `A-13`, inalterada.

**Fragilidade nomeada, para não virar surpresa.** A ordem que faz (C) funcionar é
propriedade da versão `54.0.5`, não do contrato público. Se ela se inverter,
`withOrientation` passa a escrever depois e apaga a referência — e o tablet volta a
travar em retrato **sem erro nenhum**. Nada dentro de um mod consegue observar o que roda
depois dele; a única prova é externa. Fica a obrigação, registrada também no cabeçalho do
plugin: **ao subir `expo`/`@expo/config-plugins`, repetir o prebuild e conferir o
atributo.**

## 6. Higiene da árvore — CNG preservado

`.gitignore:42-43` ignora `/ios` e `/android`. O prebuild é instrumento de prova, não
mudança de arquitetura: o diretório `android/` gerado foi **removido** após a inspeção, e
a árvore voltou a não ter diretório nativo.

O prebuild tem um efeito colateral próprio, e ele foi **revertido**: `expo prebuild`
reescreve os scripts `android`/`ios` de `package.json` de `expo start --android`/`--ios`
para `expo run:android`/`run:ios`. Isso é consequência de gerar projeto nativo, não parte
da rota (C), e a orientação operacional vigente proíbe antecipar mudanças em
`package.json`. Revertido com `git checkout -- package.json`.

Verificação por hash (`sha1`), antes do prebuild e depois da limpeza:

| Arquivo | Antes | Depois | |
| --- | --- | --- | --- |
| `package.json` | `47452896…` | `47452896…` | idêntico |
| `package-lock.json` | `28334a5a…` | `28334a5a…` | idêntico |
| `eas.json` | `ff377262…` | `ff377262…` | idêntico |
| `.gitignore` | `86691530…` | `86691530…` | idêntico |
| `app.json` | `13dfe407…` | alterado **de propósito** | +1 linha em `plugins` |

`SD-11` preservado: nenhuma dependência instalada.

## 7. Rollback

Reverter `C-C10` desfaz a rota inteira e nada além dela: some o registro em `app.json` e
some `plugins/withAndroidTabletOrientation.js`. Sem o registro, `withOrientation` volta a
ser o último a escrever e o manifesto volta a `android:screenOrientation="portrait"` —
o comportamento anterior, sem resíduo. É o que `OR-6` exige do commit isolado, e é por
isso que o estudo (`TK-C-028`..`TK-C-034`) saiu em commit documental separado: reverter a
rota não pode reverter o estudo que a justificou.

## 8. Referências

`TK-C-035`, `TK-C-028`..`TK-C-034`, `TK-C-062`, `D1` (casos 1–4), `D2`, `RD-4`, `RG-9`,
`OR-6`, `SD-1`, `SD-9`, `SD-11`, emenda `A-13`, PLAN §20, SPEC `F6-R1.1`, artefato
`20_ORIENTACAO_MECANISMO_E_ROTAS_F6_R1_1.md`, cenários físicos §28 #6/#15/#16/#17.
