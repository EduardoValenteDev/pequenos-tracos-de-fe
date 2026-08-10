# 09 · `BOOT/BUNDLE BLOCKED` no Android — causa, correção e o gate que faltava

> **A campanha física de `F6-SG-A` está PAUSADA.** Nenhum caso foi marcado `PASS` ou `FAIL`
> funcional. O único veredito vigente é **`BOOT/BUNDLE BLOCKED`** — e ele é de **infraestrutura de
> bundle**, não de *lifecycle*, não de rotação, não de persistência.
>
> O *development build* Android **não é culpado**. O aparelho chegou ao Metro, pediu o bundle e
> recebeu uma `SyntaxError` de JavaScript vinda do worktree canônico. O defeito era nosso.

---

## 1. O achado físico

Primeira inicialização real do *development build* Android no **Samsung SM-X510** (Android 16,
API 36, `1440×2304`, densidade 280). O aparelho alcançou o Metro corretamente e falhou **antes** de
o aplicativo inicializar:

```
There was a problem loading the project.
com.facebook.react.common.DebugServerException: SyntaxError
src\screens\AtelierCanvasScreen.js  (213:6)
```

Build utilizado: `c05a5800-ebff-4ccd-bf0d-15324ac3fae7`, perfil `development`, distribuição
`internal`, SDK `54.0.0`, *fingerprint* `5e7343821330ea34c796e349788c9799e77a1360`. **O APK
permanece instalado e continua válido** — nada nesta correção toca a camada nativa.

---

## 2. Causa raiz — três caracteres

Em `src/screens/AtelierCanvasScreen.js`, o bloco `/* */` aberto na linha 211 era **fechado
prematuramente** no fim da linha 212. As linhas 213 a 216 — que são continuação da mesma frase —
ficavam em posição de código, e a linha 216 trazia um `*/` órfão.

```js
211  /* [Fase 6 · TK-A-044/TK-A-045] Os dois desfechos de leitura malsucedida. Nenhum deles
212     escreve, apaga ou converte: a única coisa que muda é o que a criança vê. */   ← fechava cedo
213     O diagnóstico fica no motor (`AtelierCanvas` já registra o ramo): esta tela evita `__DEV__`
214     de propósito, porque aqui ele é PROIBIDO como decisor de produto e a proteção que existe
215     contra isso é textual — introduzi-lo aqui, mesmo para um `console.log`, apagaria a única
216     defesa que o projeto tem contra `__DEV__` virar portão comercial. */   ← `*/` órfão
```

A correção remove `" */"` do fim da linha 212. **Uma linha, três caracteres.** O texto original fica
integralmente preservado — nenhuma palavra reescrita, movida ou descartada.

### 2.1 Origem

| | |
|---|---|
| **Commit** | `6a3b53d` — *"feat(fase6): C-A10 — leitor de compatibilidade somente leitura das obras antigas"* |
| **Data** | 2026-08-09 22:22:14 -0300 |
| **Bloco** | `C-A10` (`TK-A-041` a `TK-A-046`) |
| **Forma** | um **único hunk**, inteiramente aditivo — o `*/` prematuro, a prosa e o `*/` órfão nasceram juntos |
| **Janela de exposição** | 12 h 57 min · **10 commits com a árvore inbundlável** |
| **Commits posteriores na região** | **nenhum** |

### 2.2 Nenhum defeito funcional associado

O hunk foi **inteiramente aditivo** (9 linhas `+`, zero `-`), então nenhuma linha de código foi
engolida pelo comentário. A lógica de `TK-A-044`/`TK-A-045` está completa e ligada ponta a ponta:

| Elemento | Linha |
|---|---|
| `const [obraNaoAberta, setObraNaoAberta] = useState(null)` | 122 |
| `const canSave = !isBlank && !isSaving && !obraNaoAberta` | 124 |
| `onArtCorrupted` / `onArtIncompatible` | 217 / 218 |
| guarda no caminho de gravação (`if (obraNaoAberta) return`) | 323 |
| props `onLoadCorrupted` / `onLoadIncompatible` em `<AtelierCanvas>` | 441-442 |
| UI do aviso · orientação suprimida | 455 · 466 |

Análise de escopo do Babel sobre o arquivo corrigido: **zero identificadores livres**.
**Alteração comportamental: NENHUMA.**

### 2.3 Busca por irmãos — não há

Parse real com `babel-preset-expo` (o mesmo parser do Metro, não regex):

| Superfície | Arquivos | Falhas |
|---|---|---|
| `src/` + `App.js` + `index.js` | 326 | **1** (esta) |
| `scripts/` | 40 | 0 |
| JS injetado nas WebViews (`AtelierCanvas`, `ColoringCanvas`) — extraído dos *template literals* | 2 blocos, 1772 linhas | 0 |
| Os 8 outros arquivos tocados por `F6-R3` | 8 | 0 |

Dentro do próprio arquivo: 53 aberturas `/*`, 54 fechamentos — **um único órfão**. O diff de
`F6-R3` introduziu 100 linhas contendo `*/`; as outras 99 fecham corretamente.

Varredura complementar em busca do **pior cenário possível** — prosa que virasse JS *válido* por
acidente, passando pelo parser sem erro: **nenhum caso**. Os candidatos textuais eram todos `*/`
dentro de literais de regex, um identificador acentuado deliberado (`iRelê`) e rótulos de UI.

---

## 3. Por que `4854/4854` não pegou

As duas afirmações eram verdadeiras ao mesmo tempo porque **medem coisas diferentes**.

`scripts/smoke.js` lê `AtelierCanvasScreen.js` **19 vezes, todas via `readSrc`** —
`fs.readFileSync` como string — e asserta com `String.includes`/regex. **Leitura textual não
parseia.**

Cobertura real de `src/` (324 arquivos):

| Como o smoke trata | Qtd | % |
|---|---|---|
| Texto (`readSrc` / `codeOf`) | 264 | 81,5% |
| Só existência (`srcExists`) | 36 | 11,1% |
| **Executado** (`loadModule`) | 32 | 9,9% |
| **Transpilado** por Babel | 3 | 0,9% |
| **Nunca parseado por nada** | **~289** | **~89%** |

E os 32 módulos executados são **todos serviços puros — nenhuma tela**.

### 3.1 Isto é engenharia legítima, não indisciplina

Node puro não parseia JSX: `node -e "require('./src/screens/HomeScreen.js')"` →
`SyntaxError: Unexpected token '<'`. Uma tela com 20+ imports de `react-native`/`expo-*` é
impossível de carregar no runtime do smoke. Por isso `loadModule` apaga imports por regex — funciona
para serviços puros e é inviável para telas. **A arquitetura textual do smoke era a única
disponível.** A conclusão correta não é consertar o smoke: é acrescentar outro mecanismo.

### 3.2 Nenhuma outra rede existia

| Rede possível | Estado |
|---|---|
| ESLint | **não instalado**, sem configuração |
| TypeScript / `tsc` | não existe (projeto 100% JS, decisão documentada) |
| Hooks de git | só `.sample`; sem `core.hooksPath`, sem husky |
| Script local de `lint`/`build` | não existia |
| CI (`.github/workflows/ci.yml`) | só `npm run smoke` (duro) + `npx expo-doctor` (`continue-on-error`) |
| `npx expo-doctor` | os 23 checks são de dependência/config; **nenhum parseia fonte de aplicação**. `MetroConfigCheck` valida `metro.config.js`, **não roda o bundler** |
| CI teria rodado? | **Não.** A branch não tem *upstream* e os gatilhos são restritos a `main` e `sprint_design_system_jornada_beni` |

### 3.3 A ironia que define a lacuna

A linha 2136 do smoke asserta `!src.includes('if (__DEV__)')`. A prosa órfã que **quebra** o arquivo
fala exatamente de `__DEV__` — mas escreve "esta tela evita `__DEV__`", que não casa com o padrão.
**O smoke passou verde lendo o próprio texto que arruinou o módulo.**

Pior: `codeOf` remove comentários por regex (`/\/\*[\s\S]*?\*\//g`). Nesta classe de defeito a regex
apaga 211-212 e **deixa a prosa solta** no texto que os checks depois analisam — ela não só falha em
detectar, ela mascara.

### 3.4 A classe de defeito

> **"Árvore com smoke integralmente verde, mas aplicativo incapaz de gerar bundle por erro em módulo
> alcançável pelo runtime."**

Outros membros da mesma classe que passariam igualmente: import de módulo inexistente, export
ausente consumido pelo importador, asset referenciado e ausente, dependência não instalada usada por
uma tela, JSX malformado.

---

## 4. O gate — `npm run bundle:check`

```json
"bundle:check": "expo export:embed --platform android --entry-file index.js --dev false --minify false --bundle-output .expo/bundle-check.jsbundle"
```

**É a ferramenta que o próprio build nativo invoca** para gerar o bundle embarcado. Verde aqui
significa que o bundle do build sai.

| Propriedade | Valor medido |
|---|---|
| Custo (verde) | **11 s**, 2374 módulos |
| Custo (vermelho) | ~1 s — falha cedo |
| Rede / credencial | **nenhuma** |
| Build nativo | **não** |
| Dependência nova | **nenhuma** |
| Saída | `.expo/bundle-check.jsbundle` (~13 MB) — já em `.gitignore` **e** `.easignore` |
| Sujeira no repositório | **zero** (`git status --porcelain` e `--ignored=matching` inalterados) |
| *Fingerprint* nativo | **não muda** — script de `package.json` não entra no cálculo |
| Saída em falha | exit ≠ 0 |

### 4.1 O que ele prova — e o que NÃO prova

**Prova:** o grafo executável inteiro a partir de `index.js` transforma e serializa sem erro. Por
percorrer o **grafo alcançável**, vai além de sintaxe **de graça**: pega também **falha de resolução
de módulo e de asset**.

**Não prova nada em runtime.** Não executa o bundle, não pega `TypeError`, ciclo de import, estado,
UI, layout, gesto, canvas ou áudio. **Não substitui `npm run smoke`** (propriedades disjuntas) **nem
a validação visual e física.**

### 4.2 Android sozinho basta — com evidência

Os grafos reais de `android` e `ios` foram construídos a partir de `index.js` e comparados:

- android **2378** módulos · ios **2379** módulos;
- restritos aos arquivos **do repositório**: **827 em ambos, diff literalmente vazio — conjuntos
  idênticos**;
- **100% da divergência está dentro de `node_modules`** (`MaskedView.android.js` ↔ `.ios.js` etc.).

Causa técnica: `git ls-files` não devolve **nenhum** arquivo com sufixo de plataforma
(`.android.js`, `.ios.js`, `.native.js`, `.web.js`). O `platformExtensions` do resolver só diverge
quando esses arquivos existem — e `Platform.OS === … ? require(A) : require(B)` **não** cria
divergência: o Metro coleta os dois `require` estaticamente. Para **erro sintático**, android e ios
usam o mesmo `@babel/parser` com os mesmos plugins; a plataforma afeta transformações posteriores,
nunca o *parsing*.

> **⚠ Condição de revisão:** se algum dia entrar um `Algo.ios.js` **próprio** no repositório, esta
> conclusão precisa ser revisitada e o gate passa a exigir `--platform all` (custo ~1,8×).

### 4.3 Alternativas descartadas

| Candidato | Por que não |
|---|---|
| `expo export --platform android` | Mesma prova, ~2× o custo, **copia 157–218 MB de assets por execução**. **Fica como fallback direto** caso `expo export:embed` — marcado `(Internal)` na CLI — mude de nome |
| `--platform all` | 1,8× o custo para cobrir apenas `.ios.js` de terceiros (§4.2) |
| Varredura `@babel/core` sobre `src/` | 1 s mais rápida, mas mede **por diretório, não por alcançabilidade**: 18 dos 324 `.js` de `src/` não estão no grafo executável, então ficaria **vermelha por arquivo morto**. E é **cega a falha de resolução** — comprovado no mutante `M2` |
| Script próprio sobre `Metro.buildGraph` | 23,6 s — **mais lento** que a CLI, reimplementando o que ela já faz |
| ESLint | **não instalado e sem configuração** → exigiria dependência nova, proibida sem aprovação prévia. E seria mais fraco: não percorre grafo nem resolve assets |

### 4.4 ⛔ `node --check` foi testado e REJEITADO

Em Node 24, a presença de sintaxe ESM (`import`) faz `node --check` **sair 0** mesmo com `*/` órfão,
JSX solto ou parêntese aberto. Ele **sai 0 no arquivo comprovadamente quebrado**. Um gate construído
sobre ele seria uma **segunda lacuna, indistinguível de verde real**. Verificado
independentemente por duas frentes desta investigação.

### 4.5 Modo de falha do gate

Se `expo export:embed` for removido ou renomeado numa versão futura do SDK, o comando **falha alto**
(comando desconhecido → exit ≠ 0 → vermelho). Ele **não degrada para verde silencioso** — que é a
propriedade que realmente importa num portão.

---

## 5. Mutantes — a prova de que o gate morde

Executados **depois** da correção, sobre árvore commitada, e **integralmente revertidos**. Nenhum
mutante foi commitado (`git log --all -S` não encontra rastro).

### `M1` — a classe exata do defeito

Reintrodução do `*/` prematuro na linha 212.

| Gate | Resultado |
|---|---|
| `npm run bundle:check` | **exit 1** · `SyntaxError: Missing semicolon. (213:6)` — idêntico ao erro do tablet |
| `npm run smoke` | **exit 0 · `4854/4854 passed, 0 failed`** |

A lacuna foi **reproduzida empiricamente**: sobre a mesma árvore inbundlável, o smoke afirma estar
tudo verde e o gate novo reprova.

### `M2` — falha de resolução, noutro arquivo do grafo

Import de `../services/esteModuloNaoExiste` acrescentado a `src/screens/ColoringScreen.js`.

| Mecanismo | Resultado |
|---|---|
| Varredura Babel por arquivo (o gate barato) | **324 arquivos, 0 falhas, exit 0 — NÃO detectou** |
| `npm run bundle:check` | **exit 1** · `Unable to resolve module ../services/esteModuloNaoExiste` |

É a justificativa empírica de §4.3: o candidato mais barato teria ficado verde sobre uma árvore que
não gera bundle.

---

## 6. Prova operacional — o bundle que antes falhava

O gate roda com `--dev false`; **o aparelho pede `dev=true`**. Por isso a prova final foi feita
contra o Metro real, pedindo exatamente o que o Samsung pediu:

```
GET http://127.0.0.1:8081/index.bundle?platform=android&dev=true&minify=false
HTTP 200 · 17.281.064 bytes · 19 s
corpo inicia com: var __BUNDLE_START_TIME__=… ,__DEV__=true,…
```

| Verificação | Resultado |
|---|---|
| Envelope `"type":"TransformError"` no corpo | **0** |
| `AtelierCanvasScreen` presente no bundle | 13 ocorrências |
| `obraNaoAberta` (conteúdo da tela corrigida) | 6 ocorrências |
| Contra-prova: pedido de módulo inexistente | **HTTP 404** + `{"type":"UnableToResolveError",…}` |

A contra-prova importa: como o Metro devolve 404/500 com envelope JSON quando falha, um **200 com
17,3 MB e `__DEV__=true`** é bundle real, não erro disfarçado. As 21 ocorrências da palavra
`SyntaxError` no corpo são um regex `ERROR_FORMAT` do LogBox **dentro** do bundle.

---

## 7. Retomada no Samsung — procedimento mínimo

> **NÃO desinstale o app. NÃO rode `pm clear`. NÃO gere outro build nativo.** O APK
> `c05a5800-ebff-4ccd-bf0d-15324ac3fae7` continua válido: a correção é 100% JavaScript e não altera
> o *fingerprint* nativo.

**Contexto:** `CONTEXTO A · CANÔNICO` — `C:\tmp\ptf_fase6_shell_splash_wt`, porta **8081**.

```powershell
# --- PASSO 1 · confirmar HEAD e arvore ---
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
git branch --show-current            # esperado: feat/fase6-shell-splash
git status --porcelain               # esperado: NADA impresso

# o HEAD tem de estar ACIMA da correcao e do gate; confirme que ambos existem:
git log --oneline -n 4               # devem aparecer 8621362 (gate) e ea07b47 (correcao)
git log --oneline -1 ea07b47         # fix(fase6): fechar o comentario de TK-A-044/TK-A-045…

# --- PASSO 2 · confirmar o tablet, SEM tocar no app instalado ---
adb devices -l                                                   # o SM-X510 deve aparecer como "device"
adb shell pm list packages | Select-String pequenostracosdefe    # o APK DEVE continuar listado

# --- PASSO 3 · ponte de rede (dispensa IP, dispensa QR Code) ---
adb reverse tcp:8081 tcp:8081
adb reverse --list                   # esperado: uma linha com tcp:8081 tcp:8081

# --- PASSO 4 · subir o Metro (deixe esta janela aberta) ---
node scripts/check-env.js
if ($?) { npx expo start --dev-client --port 8081 }
```

Numa **segunda** janela do PowerShell, com o Metro já no ar:

```powershell
# --- PASSO 5 · abrir o app pelo deep link do dev client (sem camera, sem QR) ---
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
adb shell am start -a android.intent.action.VIEW `
  -d "pequenostracosdefe://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

**Se `adb` não estiver no PATH**, use o caminho completo — normalmente
`%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`.

**Alternativa** (abre o *dev client* na tela de servidores, sem o *deep link*):

```powershell
adb shell monkey -p com.valentedev.pequenostracosdefe -c android.intent.category.LAUNCHER 1
```

### 7.1 Confirmar que passou do ponto que falhava

**Sinal de sucesso:** o app abre e chega ao **mapa da aventura**. Na janela do Metro aparece
`Android Bundled … index.js`, e o console mostra `[AppNavigator] MainTabs MONTADO`.

**Sinal de falha:** qualquer reaparecimento de `There was a problem loading the project.` ou
`DebugServerException`. Nesse caso **pare** e reporte com a mensagem literal — não prossiga para o
baseline.

**Só depois desse sinal de sucesso** inicie o baseline Android.

### 7.2 Se `adb reverse` não bastar

Cabo USB e depuração USB autorizada são pré-requisitos do `adb reverse`. No mesmo Wi-Fi, a
alternativa é trocar `localhost` pelo IP da máquina na URL do passo 5 — mas prefira `adb reverse`,
que independe da rede.

---

## 8. Estado e vereditos

| | |
|---|---|
| **`F6-R3`** | **EM ANDAMENTO** |
| **`F6-SG-A`** | **NÃO CONCEDIDO** |
| **Campanha física Android** | **PAUSADA** · veredito único `BOOT/BUNDLE BLOCKED` |
| **Nenhum caso** | marcado `PASS` ou `FAIL` funcional de *lifecycle* |
| **`F6-R2`, `F6-R1`, `B2`** | **INTOCADOS** |
| **Worktree do harness** (`ptf_f6_PHYSICAL_HARNESS_wt`) | **não tocado** · arquivos não commitados preservados |
| **Worktree de rollback** (`ptf_f6_CASO13_ROLLBACK_wt`) | **não tocado** · congelado em `a190b3e` |

`BOOT/BUNDLE BLOCKED` está **resolvido no lado automatizável**. A reabertura física no Samsung é o
que resta — e é dele que depende sair deste veredito.

---

## 9. Lição registrada

Um gate verde só vale pela propriedade que ele realmente mede. `npm run smoke` mede **regras de
produto** com altíssima densidade (4854 casos) e nunca prometeu medir **bundleabilidade** — a
ausência era do conjunto de portões, não um defeito do smoke. Onze segundos de `npm run bundle:check`
teriam poupado um *build* nativo, uma viagem ao aparelho e 10 commits sobre uma árvore que não
inicializava.
