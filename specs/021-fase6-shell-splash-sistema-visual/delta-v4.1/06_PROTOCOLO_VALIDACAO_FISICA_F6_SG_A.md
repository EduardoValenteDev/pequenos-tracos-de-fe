# `06` — Protocolo de validação **física** de `F6-SG-A`

> **Estado:** `F6-R3` **EM ANDAMENTO**. Todos os portões **automatizados** de `F6-R3` estão verdes.
> Este documento é o que falta executar — **no aparelho** — antes que `F6-SG-A` possa sequer ser
> considerado. **`F6-SG-A` NÃO está concedido** e não pode ser concedido a partir deste documento:
> ele só descreve **o que observar**. Quem aprova é o fundador, com evidência.

> **Princípio que governa esta sessão:** não estamos tentando fazer o relatório ficar verde.
> Estamos tentando **provar que o comportamento correto existe**. Um cenário que não pôde ser
> executado é registrado como **NÃO EXECUTADO** — nunca como `PASS`.

---

## 0. Referência de estado — o que exatamente se valida

| Item | Valor |
|---|---|
| Worktree canônico | `C:\tmp\ptf_fase6_shell_splash_wt` |
| Branch | `feat/fase6-shell-splash` |
| `HEAD` a validar | **`f013560`** |
| Base documental do delta | `a190b3e` |
| Upstream | **nenhum** — nada foi enviado ao remoto |

⚠️ **Existe um segundo worktree no disco** (`C:\tmp\ptf_colorir_canonical_runtime_wt`). Ele **não** é
o alvo desta validação. Iniciar o Metro na pasta errada é a forma mais fácil de validar código que
não é este — o passo 1 existe justamente para impedir isso.

---

## 1. Passos 1–4 · Confirmar worktree, branch, `HEAD` e árvore limpa (PowerShell)

Cole o bloco inteiro em **uma** janela do PowerShell. Ele **não altera nada** — só confere.

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt

Write-Host "1) PASTA  : $((Get-Location).Path)"
Write-Host "2) BRANCH : $(git rev-parse --abbrev-ref HEAD)"
Write-Host "3) HEAD   : $(git rev-parse --short HEAD)"
$sujo = git status --porcelain
if ([string]::IsNullOrWhiteSpace($sujo)) { Write-Host "4) ARVORE : LIMPA" }
else { Write-Host "4) ARVORE : SUJA — PARE"; $sujo }
```

**Aceite:** pasta `C:\tmp\ptf_fase6_shell_splash_wt` · branch `feat/fase6-shell-splash` · `HEAD`
`f013560` · árvore `LIMPA`.

**Se qualquer um dos quatro divergir, PARE e reporte.** Não reconcilie silenciosamente: um `HEAD`
diferente significa que o que está no aparelho **não é** o que este documento descreve.

---

## 2. Passo 5 · Qual *build* representa exatamente este código

### 2.1 Precisa de *build* nativo novo? **NÃO.** — e a razão técnica

`F6-R3` inteiro é **JavaScript**. Verificação objetiva, executável:

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
git diff --name-only a190b3e..HEAD -- app.json app.config.js eas.json package.json package-lock.json android ios
```

**Esse comando sai VAZIO.** Nenhum arquivo que participa da camada nativa mudou: sem dependência
nova, sem *plugin* novo, sem alteração de `app.json`/`eas.json`, e o projeto é *managed* (não existem
pastas `android/` nem `ios/` no repositório). Os 12 arquivos alterados são `scripts/` e `src/`.

**Consequência:** o binário nativo já instalado no aparelho continua sendo o binário correto. O que
mudou é **só o *bundle* JS**, e o *bundle* JS é servido pelo **Metro** em tempo real. Gerar um *build*
novo aqui seria **hábito, não necessidade** — custaria tempo de fila do EAS e não mudaria um byte do
que será exercitado.

> **Quando isso deixaria de valer:** se qualquer *commit* futuro tocar `app.json`, `eas.json`,
> `package.json` ou adicionar dependência com código nativo, um *build* novo passa a ser
> **obrigatório** e este parágrafo caduca. Reexecute o comando acima antes de confiar nele.

### 2.2 Qual *build* serve

Serve **qualquer *development build* (perfil `development` do `eas.json`) já instalado**, desde que
tenha sido gerado a partir de um *commit* em que os arquivos nativos acima estejam iguais aos de
hoje — o que, nesta branch, é **todo** *commit* de `a190b3e` em diante.

Para conferir o que existe na conta EAS:

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
npx eas build:list --platform android --profile development --limit 5
npx eas build:list --platform ios --profile development --limit 5
```

**Se não houver nenhum *development build* instalado no aparelho**, aí sim é preciso gerar um — e
**só nesse caso**:

```powershell
npx eas build --platform android --profile development
# ou, para iPad/iPhone:
npx eas build --platform ios --profile development
```

### 2.3 Passo 8 · **Expo Go é PROIBIDO** nesta validação

Não é preferência: é impossibilidade técnica. O projeto declara `expo-dev-client` e
`react-native-purchases` (RevenueCat) — módulos nativos que **não existem** dentro do Expo Go. Abrir
o app no Expo Go produziria erro de módulo nativo ausente ou, pior, um app **parcialmente**
funcional cujo comportamento **não é** o do produto. **Um `PASS` obtido no Expo Go não vale.**

---

## 3. Passos 6, 7 e 9 · Instalar/abrir o *build* certo e **não** testar um antigo por engano

### 3.1 Passo 7 · **O Metro é OBRIGATÓRIO**

Sem Metro, o *dev client* cai no último *bundle* que conseguir — e é exatamente assim que se valida
código velho sem perceber. Com Metro rodando **nesta pasta**, o JS exercitado é o de `f013560`.

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
npm run start:dev
```

`start:dev` é `node scripts/check-env.js && expo start --dev-client --clear --lan`:

- `--dev-client` → abre no *development build*, **não** no Expo Go;
- `--clear` → **zera o cache do Metro**, que é a segunda causa mais comum de testar código velho;
- `--lan` → aparelho e PC precisam estar **na mesma rede Wi-Fi**.

### 3.2 Abrir no aparelho

1. Instale/abra o app **Pequenos Traços de Fé (development build)** no aparelho — **não** o Expo Go,
   **não** um APK de `preview`/`production`.
2. Na tela inicial do *dev client*, escolha o servidor `C:\tmp\ptf_fase6_shell_splash_wt` que aparece
   na lista, ou leia o QR do terminal.
3. Se o app já estava aberto: sacuda o aparelho → **Reload**.

### 3.3 Passo 9 · Três confirmações de que **não** é um *build* antigo

| # | Confirmação | Como |
|---|---|---|
| 1 | O Metro está servindo **esta** pasta | O terminal do Metro imprime `C:\tmp\ptf_fase6_shell_splash_wt` no cabeçalho. Se imprimir `ptf_colorir_canonical_runtime_wt`, **PARE**: pasta errada |
| 2 | O aparelho pediu o *bundle* **agora** | Ao dar *Reload*, o terminal do Metro registra a requisição do *bundle*. **Sem linha nova no terminal, o app está usando JS embutido — inválido** |
| 3 | Não é `preview` nem `production` | Esses perfis embutem o JS no binário e **ignoram** o Metro. Só o perfil `development` serve |

> **Regra dura:** se as três confirmações não forem obtidas, **nenhum** cenário abaixo pode ser
> marcado como `PASS`.

---

## 4. Passo 10 · O que observar em **cada** cenário

**Quatro invariantes ZERO valem em todos os casos aplicáveis** — e qualquer uma violada é `FAIL`,
independentemente do resto:

1. **ZERO** perda de píxel da criança;
2. **ZERO** associação da tinta ao *lineart* errado;
3. **ZERO** promoção destrutiva;
4. **ZERO** abertura silenciosa como canvas branco quando existe obra recuperável.

### 4.0 · `TK-A-062` — inventário de armazenamento **antes** (fazer primeiro)

Antes de abrir qualquer obra, registre: **quantas obras existem na galeria**, seus nomes/miniaturas
e, se possível, uma captura da galeria inteira. Ao fim de tudo, repita. **Aceite:** contagem e
integridade **idênticas**, salvo as obras que a própria sessão salvou de propósito.

### 4.1 · Os **17 casos obrigatórios** de §28.1 — *um `FAIL` aqui impede `F6-SG-A`*

| Caso | Task | O que executar no aparelho | O que **observar** (critério objetivo) |
|---|---|---|---|
| **1** | `TK-A-063` | Abrir, **em retrato**, uma obra criada **antes** desta mudança | A pintura **aparece** e está **alinhada ao *lineart***. Não abre em branco |
| **2** | `TK-A-064` | **Girar para paisagem** com a obra aberta | Proporção preservada; `contain` + **moldura (*letterbox*)**; tinta e *lineart* andam **juntos**. Nada esticado, nada recortado |
| **3** | `TK-A-065` | **Girar de volta** para retrato | Estado **idêntico ao caso 1**. Nenhuma deriva: a tinta não "andou" nem um fio |
| **4** | `TK-A-066` | **Split View estreito / Slide Over** (iPad) ou janela reduzida | **Nada some**; nada é recortado em silêncio. A obra continua inteira, menor |
| **5** | `TK-A-067` | **Tela cheia em paisagem** | **Nada é esticado**: sobra vira **moldura**, nunca distorção. Círculo continua círculo |
| **6** | `TK-A-068` | **Encerrar o app** (matar de vez), reabrir, abrir a obra | Obra **íntegra**. Comparado ao inventário 4.0: **nenhuma gravação** ocorreu no ciclo anterior |
| **7** | `TK-A-069` | Com a obra aberta: ir para **segundo plano** e **voltar** | Obra **íntegra**; **nenhum recarregamento destrutivo**; o traço em curso não vira risco solto |
| **8** | `TK-A-070` | Abrir e fechar o **Centro de Controle** sobre o canvas | Igual ao caso 7. A interrupção **parcial** não pode se comportar diferente da plena |
| **9** | `TK-A-071` | **Se reproduzível**: provocar/aguardar o término do processo de conteúdo da WebView | A recuperação **preserva a obra** e o evento é **registrado**. **PROIBIDO escrever "causa confirmada"** (`FD-12`). Se não reproduzir: **"não reproduzido"**, explicitamente |
| **10** | `TK-A-072` | Abrir a obra e fechar **sem desenhar nada** | **Bytes persistidos idênticos** antes e depois. Abrir **não** migra, **não** promove, **não** reescreve |
| **11** | `TK-A-073` | **Desenhar e salvar** | Salva; reabrir mostra **exatamente** o que foi desenhado. A obra anterior nunca fica num estado meio-gravado |
| **12** | `TK-A-074` | Falha durante a gravação (ex.: matar o app **durante** o salvamento) | A representação **anterior** continua válida. **Nada destruído**. Nunca "abri e estava vazia" |
| **13** | `TK-A-075` | *Rollback* do código com acervo já **misto** — ver **§5**, exige autorização | O caminho revertido **consome o formato anterior**; **nenhuma obra órfã** |
| **14** | `TK-A-076` | Abrir obra **legada** (`v1`/`v2`, sem geometria completa) | Reconstrução **determinística** a partir dos metadados. **Jamais** usar a janela atual como se fosse a original. Na dúvida, **preserva** |
| **15** | `TK-A-077` | Abrir obra no formato de pintura **vigente** | Lida e enquadrada certo; `paintSchemaVersion` ausente ⇒ tratada como **legada, sem erro** — sem tela de erro, sem canvas branco |
| **16** | `TK-A-078` | Abrir obra guardada como **ponteiro `v:3`** de *blob* | Resolve normalmente; o *blob* **nunca é excluído** por incompatibilidade **visual** |
| **17** | `TK-A-079` | Abrir obra com **`paintSchemaVersion` + `layoutVersion`** | Lida, reprojetada e regravada **sem perda**; eixos de versão **nunca confundidos** |

### 4.2 · Os **6 casos adicionais** `E1`..`E6` — não bloqueiam `F6-SG-A`, mas entram na matriz

| Caso | Task | O que executar | O que observar |
|---|---|---|---|
| `E1` | `TK-A-100` | Obra **nova**, criada e reaberta na **mesma** janela | Reabre idêntica ao que foi fechado |
| `E2` | `TK-A-101` | Obra **vetorial do Ateliê** atravessando mudança de janela | Traços mantêm posição relativa ao espaço lógico; nada escorrega |
| `E3` | `TK-A-102` | **Dez ciclos** de rotação seguidos | **Sem deriva acumulada** — o décimo retorno é igual ao primeiro |
| `E4` | `TK-A-103` | Pintura associada a *lineart* **divergente** | **Recusa de aplicar**, com aviso legível. **Não** aplica, **não** regrava, **não** remove, **não** deforma |
| `E5` | `TK-A-104` | Payload **corrompido/truncado** | Aviso legível; a obra **não** é apagada |
| `E6` | `TK-A-105` | Galeria com **acervo misto** após atualizar o app | Todas as obras aparecem; nenhuma some da listagem |

### 4.3 · Cenários §28 e as duas telas de recusa

| Item | Task | O que observar |
|---|---|---|
| §28 **#7** | `TK-A-097` | Abrir desenho salvo **antes** da mudança **e continuar desenhando** por cima — sem salto de escala nem desalinhamento ao retomar |
| §28 **#17** | `TK-A-098` (`CN-1`) | **Regressão completa em telefone** (não só tablet): mapa, tour, Livrinho, Ateliê e Colorir sem regressão visível |
| Painéis "não consegui abrir" | `TK-A-045`, §28.1 caso 15 | Os **dois** avisos precisam ser **lidos em tela**: texto legível para criança, sem termo técnico, e **sem** oferecer "apagar" como saída. Hoje também alcançáveis pela **recusa de identidade** de `TK-A-051` |
| Nitidez em tablet | `TA-5R` (aviso) | Com o *lineart* em `multiply` e a camada de tinta **ampliada** em tela grande: a **borda do balde** aparece **limpa**, sem serrilhado grosseiro nem halo. Este é o único item que **nenhum** arnês em Node consegue provar |

---

## 5. Caso 13 (`TK-A-075`) — o único que exige preparo especial

O caso pede *rollback* do código **com acervo já misto**. Como a camada nativa não mudou (§2.1), ele
**não** exige um *build* antigo instalável: basta apontar o Metro para o código anterior, mantendo o
**mesmo** aparelho e o **mesmo** acervo.

Isso, porém, cria um segundo *worktree* — **alteração de repositório que exige autorização explícita
do fundador** e por isso **não** foi executada. Sob autorização, seria:

```powershell
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
git worktree add C:\tmp\ptf_f6_rollback_wt a190b3e   # detached, só leitura de código
Set-Location C:\tmp\ptf_f6_rollback_wt
npx expo start --dev-client --clear --lan
```

Depois de observar, **remover** o *worktree* temporário (`git worktree remove`). Enquanto essa
autorização não vier, o caso 13 fica **NÃO EXECUTADO** — e continua **bloqueando** `F6-SG-A`, porque
é um dos 17 obrigatórios.

---

## 6. Registro do resultado (`TK-A-080`) — preencher **durante**, não depois

Para cada linha das tabelas §4.1 e §4.2, registrar: **veredito** (`PASS` / `FAIL` / `NÃO EXECUTADO`),
**aparelho**, **janela/orientação**, **captura (print ou vídeo)** e **quais invariantes ZERO** foram
verificadas. As duas famílias ficam **visualmente separadas**: o veredito de `F6-SG-A` lê **primeiro
os 17**.

---

## 7. Se a validação física revelar defeito

**Classificar antes de corrigir.** A classificação decide **onde** o conserto pertence:

| Classificação | Significa | Destino |
|---|---|---|
| Defeito de **`F6-R3`** | Ciclo de vida, *resize* ou *viewport*: salto de escala, deslocamento de alinhamento, corrupção de *padding*/safe area, perda indevida de estado | Corrigir **aqui**, com regressão própria |
| Defeito **interno ao canvas** que pertence à reconstrução posterior | Não é ciclo de vida nem projeção; é o motor por dentro | **Registrar** conforme o contrato canônico — inclusive **`F9-C60-LFC-01`** quando aplicável. **Não** antecipar a reconstrução da `F9` |
| Dívida já registrada | Ex.: `atelierStorage.saveArt` (§11.16-c das `TASKS`, destino `F12A`) | **Não** reabrir aqui |

**Se a classificação não puder ser demonstrada com evidência, não escolha arbitrariamente:** mostre a
cadeia causal — o que foi observado, em que ordem, sob que janela — e **reporte** para decisão.

**A validação física não pode expandir escopo em silêncio.** Um achado fora de `F6-R3` vira registro,
não vira trabalho não autorizado.

---

## 8. Depois

Com os 17 obrigatórios `PASS` e a matriz preenchida, a decisão sobre **`F6-SG-A`** volta ao fundador.
Até essa decisão, o estado correto continua sendo **`F6-R3` EM ANDAMENTO** — e `F6-R2`, `F6-R1` e
`B2` permanecem **fechados**.
