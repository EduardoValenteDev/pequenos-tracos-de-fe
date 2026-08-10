# 08 · Sequência operacional única de `F6-SG-A`

> **Este documento não substitui o `07`.** O `07` continua sendo o roteiro: ele define *o que* cada
> grupo verifica, o que é `PASS`, o que é `FAIL` e quais tarefas cada grupo cobre. O `08` define
> **em que ordem tudo acontece, em qual contexto e com quais comandos** — e acrescenta o que o `07`
> ainda não tinha: o **novo *development build* iOS**, o **harness temporário de validação física**
> e a **sequência única** que resolve `L-1` e `L-2`.
>
> Onde houver conflito de **sequência**, vale o `08`. Onde houver conflito de **critério**, vale o
> `07`. Onde houver conflito com o Roteiro Mestre, vale o Roteiro Mestre.

**Superseder explícito:** o `08` substitui as seções **§3** (comandos PowerShell) e **§8** (a
campanha agrupada) do `07`. Todas as demais seções do `07` — em especial **§4** (escopo), **§5**
(limitações), **§6** (`TK-A-062`), **§7** (controles negativos), **§9**, **§10** e as tabelas de
**§11** — permanecem vigentes e são referenciadas daqui.

---

## 1. O que mudou desde o `07`

| Item | Estado no `07` | Estado agora |
|---|---|---|
| `B-1` — *build* iOS | decisão pendente do fundador | **RESOLVIDO** — novo *development build* gerado e concluído (§2) |
| `L-1` — sem inspetor de armazenamento | aceito como limitação | **RESOLVIDO** — harness de inspeção (§4) |
| `L-2` — sem caminho de injeção | aceito como limitação | **RESOLVIDO em grande parte** — 12 injeções (§5); vãos nomeados em §5.4 |
| `L-3` — Android | não pressuposto | **inalterado** — Android não é pré requisito e não foi usado |
| Contextos | 2 (A e B) | **3** (A, B e **C · harness**) |
| Trocas de Metro | 2 (A→B→A) | **3** (C→A→B→C) — e o inventário passa a ser *máquina*, não olho |

---

## 2. O novo *development build* iOS — `B-1` resolvido

| Campo | Valor |
|---|---|
| **Identificador do *build*** | `b63d7bcc-464a-49b0-b266-5d46139e6068` |
| **Perfil** | `development` |
| **`developmentClient`** | `true` — serve à campanha dependente de Metro |
| **`distribution`** | `internal` · `ios.simulator: false` (aparelho físico) |
| **Commit de origem** | `1ae353f7ebec198ee1cce543bd381d00d2cbc13f` — o **estado canônico** |
| **Origem** | worktree **A** (canônico). **Não** foi gerado a partir do harness |
| ***Fingerprint* nativo** | `c8b6c521500558fde471e47202d41d5e9dda79aa` |
| **Conferência do *fingerprint*** | idêntico ao medido localmente sobre o HEAD, e confirmado pelo servidor do EAS |
| **Artefato** | `https://expo.dev/artifacts/eas/2RPJb78QAyJm8k-cJ-Lo-7GB1b46AGgEXlJRVM3lWEQ.ipa` |
| **Expira em** | **2026-08-24T13:44:39Z** — depois disso o *link* morre e um *build* novo é necessário |
| **UDID do iPad** | `00008101-000E7C811E43A01E` — **já provisionado** no perfil `9436QS7G46` |

**O perfil `c60-pilot` NÃO foi usado** — ele não declara `developmentClient` e não serviria a uma
campanha que depende de Metro.

### 2.1 ⛔ AVISO CRÍTICO DE INSTALAÇÃO — leia antes de tocar no iPad

Os **cinco** perfis de *build* compartilham o mesmo `bundleIdentifier`
`com.valentedev.pequenostracosdefe`. Consequência direta:

> **O novo *build* SUBSTITUI o app instalado.** Ele deve ser instalado **POR CIMA**.
> **NUNCA apague o app antes de instalar.**

Apagar o app destrói o *container* do iOS — AsyncStorage **e** os arquivos de `ptf_blobs/` — e com
ele **o acervo real**, que é o único insumo desta campanha. Casos 1, 13, 14, 15, 16 e os cenários
§28 #7 e #9 ficariam sem entrada e a campanha inteira seria inviabilizada.

A atualização no lugar é compatível na assinatura: mesmo *team* `UPVJN674JW`, mesmo certificado de
distribuição `213FB7F1EF0BD66785D49A3439930957`, mesmo perfil de provisionamento `9436QS7G46`.

### 2.2 Procedimento de instalação

1. **Antes de instalar**, executar `G-PRE` (§6) — quatro capturas do app **como está hoje**. É a
   rede de segurança: se algo der errado na instalação, existe registro do acervo anterior.
2. No iPad, abrir o *link* do artefato em §2 pelo **Safari**. O iOS oferece instalar.
3. **Confirmar a substituição.** Se o iOS oferecer "substituir", é o caminho certo. Se em algum
   momento aparecer a opção de **remover** o app, **recuse**.
4. Abrir o app uma vez e confirmar que a coleção e a galeria continuam com o acervo de `G-PRE`.
   **Se o acervo tiver sumido, PARE e reporte** — não prossiga.

---

## 3. Os três contextos — nunca misture as funções

| | **CONTEXTO A · CANÔNICO** | **CONTEXTO B · ROLLBACK** | **CONTEXTO C · HARNESS** |
|---|---|---|---|
| **Diretório** | `C:\tmp\ptf_fase6_shell_splash_wt` | `C:\tmp\ptf_f6_CASO13_ROLLBACK_wt` | `C:\tmp\ptf_f6_PHYSICAL_HARNESS_wt` |
| **`HEAD` esperado** | `1ae353f` (no ramo `feat/fase6-shell-splash`) | `a190b3e` (destacado) | `1ae353f` (destacado) **+ harness não commitado** |
| **Porta do Metro** | **8081** | **8082** | **8083** |
| **Papel** | o produto sob teste, puro | o código **anterior** a `F6-R3` | o produto **mais** o instrumento de medida |
| **Sinal inequívoco** | console mostra `[AppNavigator] MainTabs MONTADO`; **sem tarja** | console **não** mostra `MainTabs MONTADO` | **tarja vermelha `F6 PHYSICAL HARNESS`** no topo da tela |
| **Serve para** | `G1`–`G6`, `G8`, `G-OPP` | `G7` (caso 13) | `GH1` (inventário), `GH2` (injeções), `GH3` (fechamento) |

**Regra permanente:** **um único Metro por vez.** Nunca deixe duas portas no ar. Não existe dúvida
possível entre `8081`, `8082` e `8083`: cada contexto tem porta própria e sinal visual próprio.

O **mesmo *development build*** serve aos três contextos — `npx expo config --type public` devolve
`slug` e `scheme` idênticos em A e C, e §1.1 do `07` já provou que a camada nativa de `a190b3e` e do
HEAD é idêntica. **Nenhuma reinstalação ocorre entre contextos.**

---

## 4. O harness de validação física — o que é, o que não é

### 4.1 Natureza

O harness é um **instrumento de medida temporário e descartável**. Ele **não é** *feature*, **não
pertence** ao produto, **não será commitado**, **não entra em *merge***, **não vai ao remoto** e
**não chega à produção**. Vive exclusivamente no worktree **C**, **sem commit**, por decisão
deliberada: o que nunca foi commitado nunca entra na história do produto.

### 4.2 A fronteira que ele respeita

> **O harness INJETA. O produto REAGE. O harness OBSERVA.**

Nada no harness aceita, rejeita, recupera, promove, valida ou reconstrói obra. Essa lógica é
justamente o que a campanha está tentando provar, e reimplementá la faria o teste provar a si
próprio. Toda escrita do harness é **literal e crua** (`AsyncStorage.setItem`, `FileSystem`), nunca
através de `src/services/`.

### 4.3 Superfície de acoplamento — um arquivo

O harness toca **um único arquivo do produto**: `App.js`, com duas linhas (um `import` e
`{__DEV__ && <F6PhysicalHarnessOverlay />}`, irmão dos *providers*).

Por que `App.js` e não outro lugar: `git diff --name-only a190b3e..HEAD -- src App.js index.js`
devolve **nove** arquivos, e `App.js` **não está entre eles** — está fora do código que `F6-R3`
alterou. `AppNavigator.js` **está** sob teste (`CN-6`, `TK-A-022`, `TK-A-023`, contador de montagem)
e por isso **não** foi tocado.

### 4.4 Operações disponíveis

**INSPEÇÃO** (só leitura)

| Op | O que faz |
|---|---|
| `INS-01` | Inventário completo: toda chave relevante, tipo de envelope, versão, identificador da obra, ponteiro, arquivo referenciado, existência física do *blob*, tamanho, **md5** e metadados. Emite em blocos numerados no console |
| `INS-02` | Lista *backups* pendentes **e** os *snapshots* em disco. O aparelho não pode sair da campanha com essa lista não vazia |

**SNAPSHOT**

| Op | O que faz |
|---|---|
| `SNP-ANTES` | Fotografia inicial. Vai para **arquivo**, não para AsyncStorage — sobrevive ao encerramento do app e não polui o armazenamento que está sendo medido |
| `SNP-DEPOIS` | Fotografia final |
| `SNP-DIFF` | Classifica cada diferença: criação inesperada, remoção inesperada, mudança inesperada, ponteiro órfão, *blob* órfão, referência inexistente, mudança de versão, alteração de conteúdo, mudança permitida, **órfão pré existente** (herdado, não imputável a `F6-R3`) e **permitida por prefixo padrão** (absolvida por suposição, não por declaração — precisa de conferência humana) |

**INJEÇÃO** — §5.

**RESTAURAÇÃO**

| Op | O que faz |
|---|---|
| `RST-TUDO` | Devolve cada chave e cada arquivo ao estado exato anterior, apaga as marcas de *backup* e o diretório de *backup*. Restaura **arquivos antes de chaves**, para que nenhuma chave aponte, nem por um instante, para *blob* ausente. Falha ruidosamente se sobrar qualquer pendência |
| `RST-SNAP` | **Última ação da campanha.** Apaga `__f6h_snapshots__/` do iPad. Só depois de `SNP-DIFF` e da extração da evidência |

### 4.5 *Backup* e restauração — não dependem de memória humana

- Toda injeção **recusa começar** se houver *backup* pendente (`exigirLimpo`). Nenhum cenário
  começa sobre lixo do anterior.
- Toda injeção faz *backup* **antes** da primeira escrita — verificado mecanicamente nas 12.
- O *backup* de chave guarda o valor **e** registra se a chave existia. O *backup* de arquivo
  registra até a **ausência** (desfazer, nesse caso, é apagar de volta).
- `RST-TUDO` é o único desfazimento necessário — e é o mesmo para todas as 12 injeções.

### 4.6 Rastro deixado no aparelho — inventário completo

| Rastro | Caminho | Removido por |
|---|---|---|
| Marca de *backup* de chave | `__F6H_BAK__<chave>` | `RST-TUDO` |
| Marca de *backup* de arquivo | `__F6H_BAKF__<uri>` | `RST-TUDO` |
| Diretório e cópias de *backup* | `<documentDirectory>__f6h_backup__/` | `RST-TUDO` |
| *Snapshots* `ANTES.json` / `DEPOIS.json` | `<documentDirectory>__f6h_snapshots__/` | **`RST-SNAP`** |

Ao fim de `GH3`, `INS-02` deve reportar **nenhum *backup* pendente** e **nenhum *snapshot* em
disco**. Só então o aparelho está limpo.

### 4.7 As dez provas exigidas — resultado

| # | Prova | Resultado |
|---|---|---|
| 1 | Observa sem alterar o que mede | **PROVADO** — o caminho de inspeção usa só `getAllKeys`, `multiGet`, `getInfoAsync`, `readDirectoryAsync`. Os *snapshots* gravam **fora** de `ptf_blobs/` e fora do AsyncStorage; a medição acontece **antes** da gravação |
| 2 | Prepara as corrupções com *backup* e desfazimento | **PROVADO** — 12/12 injeções com `exigirLimpo` no molde, *backup* presente e *backup* **antes** da primeira escrita (verificado por análise do código) |
| 3 | Restaura | **PROVADO** — `RST-TUDO` + `RST-SNAP`; `RST-TUDO` relista as pendências depois e **lança** se sobrar alguma |
| 4 | Não muda a lógica sob teste | **PROVADO** — zero importações de `src/services`, `hooks`, `components`, `context`, `screens`, `navigation`, `theme`, `utils`, `data`; zero `require(` |
| 5 | Não toca o worktree canônico | **PROVADO** — A em `1ae353f`, `git status --porcelain` **vazio** |
| 6 | Não altera arquivos nativos | **PROVADO** — `git status --porcelain` em C devolve exatamente ` M App.js` e `?? src/devharness/`. `app.json`, `eas.json`, `package.json` e plugins **intocados**. O *fingerprint* nativo do *build* está preservado |
| 7 | Não cria dependência nativa | **PROVADO** — usa só `@react-native-async-storage/async-storage`, `expo-file-system/legacy`, `@noble/hashes`, `react`, `react-native` — **todos já instalados e já presentes no *development build*** |
| 8 | Não foi commitado no produto | **PROVADO** — `git ls-files` não conhece `devharness` em A nem em C |
| 9 | Não entra em *merge* | **PROVADO** — `git log --all -- '*devharness*'` vazio nos 537 commits de todas as *branches* |
| 10 | Não foi enviado ao remoto | **PROVADO** — `feat/fase6-shell-splash` sem *upstream*, nenhuma *ref* remota `fase6`, *reflog* só com `commit:` |

**Auditoria de não contaminação:** executada de forma adversarial e independente. Seis achados
(`F1`–`F6`); **todos corrigidos** antes do congelamento do estado. Registro honesto: dois deles —
título da obra saindo cru no console e `multiGet` sem lote — eram violações **reais** no momento em
que foram detectados.

**Estado congelado (SHA-256).** A auditoria vale para estes arquivos, exatamente:

```
f8c3bddd…8239  src/devharness/F6PhysicalHarnessOverlay.js
04140fdf…d219  src/devharness/harnessDiff.js
e7931be0…1967  src/devharness/harnessInject.js
03d4f525…2393  src/devharness/harnessLog.js
1d77c39c…c563  src/devharness/harnessOps.js
9b4de9df…5508  src/devharness/harnessStore.js
4b314b10…e5c3  App.js
```

Se qualquer arquivo mudar antes da campanha, **as provas 1–4 precisam ser refeitas**.

### 4.8 Duas travas contra o harness chegar à produção

1. **Nunca é commitado.** Não existe caminho de *merge*, *push* ou *build* de produção que o
   alcance — ele não está no Git.
2. **`__DEV__`.** Guarda dupla: `{__DEV__ && <F6PhysicalHarnessOverlay />}` em `App.js` **e**
   `if (!__DEV__) return null` dentro do componente. Mesmo que o arquivo escapasse, ele não
   renderiza e não executa nada.

Ressalva honesta: o `import` em `App.js` é estático. Num *bundle* de produção o grafo seria
**avaliado** (três leituras de `FS.documentDirectory` para montar *strings*), apenas nunca
executado nem renderizado. A trava impede comportamento, não presença — e a presença é impedida
pela trava 1.

---

## 5. As injeções — `L-2` endereçada

Cada injeção corresponde a uma propriedade **já definida** nos contratos ou no protocolo. Nenhuma
foi inventada; todas derivam do mapeamento dos arneses de `scripts/testing/artworkVersionHarness.js`,
que já provam os mesmos cenários em Node. Cada uma declara: qual propriedade altera, valor anterior,
valor novo, qual cenário prepara e como se desfaz.

**Não existe operação ampla do tipo "corromper tudo".** Cada operação é mínima e específica — sem
isso, a reação do produto não poderia ser atribuída a uma causa única.

### 5.1 Como o alvo é escolhido — sem digitação no aparelho

O harness **não pergunta identificadores**. Ele elege a obra que o operador acabou de tocar: no
Colorir 60, a atividade cujo *blob* tem o `modificationTime` mais recente; no Ateliê, a arte de
maior `updatedAt`; no Livrinho, a primeira cena legada em ordem. **O operador controla o alvo
pintando**, e o harness **imprime** exatamente qual chave elegeu — sem ambiguidade no registro.

### 5.2 Catálogo

| Op | O que corrompe | Propriedade exercitada | Prepara | O que observar no **produto** |
|---|---|---|---|---|
| `INJ-01` | *blob* ativo do C60 vira texto não-PNG | `img.onerror` → obra existe e não abre | **`E5`** + painel de recusa | Painel *"Não consegui abrir sua pintura 😕 / … Nada foi apagado."* Arquivo continua no disco. **FAIL:** canvas branco silencioso |
| `INJ-02` | `uri` do ponteiro aponta para arquivo inexistente | `resolvePointer60` → `null` = **ausência honesta** | `E5` · ramo de ausência | *Lineart* limpo, **sem** painel. Chave e *blob* real continuam existindo. **FAIL:** apagar chave ou *blob* |
| `INJ-03` | `paintSchemaVersion: -1` num *payload* **inline** | eixo presente que mente sobre si → ramo `eixo-invalido`, que **continua candidato** | `G-VER` — controle negativo | **A obra ABRE.** Quem decide é a geometria, não o eixo. **FAIL:** recusa (o eixo condenando obra íntegra) |
| `INJ-04` | `imgW/imgH` declaram outra proporção | razão de aspecto vs. `TOL_ASPECTO_LINEART = 0.02` | **`E4`** + painel de identidade divergente + `G-CMP-6` | Painel de recusa e **zero píxel** de tinta. **FAIL — o mais grave possível:** tinta esticada sobre o *lineart* |
| `INJ-05` | `imgH` +0,6% (dentro da tolerância) | mesma checagem de `INJ-04` | `E4` — **controle negativo** | **A obra ABRE** com a pintura. **FAIL:** painel — a tolerância estaria estreita demais |
| `INJ-06` | `stateJson` do Ateliê truncado | `classificarEstado` → `ilegivel` → `LOAD_CORRUPTED` | `E5` no Ateliê | Painel *"Não consegui abrir este desenho"* **e botão de salvar INATIVO**. **FAIL:** folha em branco silenciosa |
| `INJ-07` | `stateJson` de formato desconhecido | ramo `desconhecido` → `LOAD_INCOMPATIBLE` | `E5` — ramo **distinto** de `INJ-06` | Painel de recusa, nada regravado. **FAIL:** abrir vazio, ou classificar como corrompido |
| `INJ-08` | `stateJson` com *array* no topo | `Array.isArray` → `ilegivel` | `E5` — corrompida por **tipo**, não por sintaxe | Mesmo painel de `INJ-06`. **FAIL:** folha em branco |
| `INJ-09` | ponteiro ilegível **com *blob* vivo** | fronteira do *fail-closed*: "não havia obra" ≠ "não pude saber" | **sondagem** das invariantes ZERO #1 e #3 | ⚠ **Achado em aberto, não `PASS`/`FAIL`.** Registrar literalmente o que acontece ao reabrir **e** ao salvar por cima |
| `INJ-10` | **diretório** ocupando o nome do arquivo do *slot* inativo | `writeBlob` confirma com `getInfoAsync`; falha real de I/O → `WRITE_FAILED` **antes** de qualquer promoção | **caso 12 · etapa CRIAR** | Alerta *"Quase lá! 🎨 / Não conseguimos guardar sua pintura agora."* Ponteiro anterior **intocado**. **FAIL:** ponteiro trocado ou *blob* anterior apagado |
| `INJ-11` | lixo de ~2 KB no *slot* inativo | GC dirigido, universo fechado de 2 candidatos, recusa agir sob `unknown_active` | **caso 12** — a *consequência* de "persistir interrompido" | Reabrir mostra a pintura anterior; no próximo salvamento o GC recolhe o órfão **sem tocar no ativo** |
| `INJ-12` | cena legada do Livrinho corrompida | leitor legado + `hasMeaningfulPaint` | `E5` no acervo legado | Livrinho não mostra tinta e **não apaga** a chave; nenhuma tela quebra. **FAIL:** *crash* ou remoção |

### 5.3 ⚠ `INJ-10` — desfazimento obrigatório

O compensatório do próprio produto (`deleteBlob`) **recusa diretório** com o desfecho
`nao_e_arquivo` — e está certo em recusar. O diretório **sobrevive** à limpeza do produto e só
`RST-TUDO` o remove. **Nunca encerre a campanha com `INJ-10` sem restaurar.**

### 5.4 Vãos nomeados — o que `L-2` **não** fechou

Honestidade sobre cobertura. O caso 12 tem quatro etapas:

| Etapa | Cobertura física |
|---|---|
| **criar** | ✅ **INTEGRAL** — `INJ-10`, falha real de I/O |
| **persistir** | ❌ **não injetável** — o AsyncStorage do iOS não tem condição de falha injetável de fora. Alcançada só pela **morte do processo** (`G5` passo 5). A *consequência* é coberta por `INJ-11` |
| **validar** | ❌ **não injetável** — exige corrida de microssegundos entre escrita e releitura. Permanece coberta pelos arneses em Node e pelo mutante independente |
| **reler** | ⚠ **parcial** — a releitura *da transação* é inalcançável; a leitura *fail-closed* que a protege é sondável por `INJ-09` |

**Achado estrutural adicional.** Os eixos `paintSchemaVersion` e `layoutVersion` são
**inalcançáveis através de um ponteiro `v:3`**: `resolvePointer60` reconstrói o *payload* com lista
**fixa** de campos e os dois eixos não estão nela. Corrompê los dentro do ponteiro não produz efeito
algum. Só o *payload* **inline** chega ao motor com os eixos — e é o que `INJ-03` usa. Isso é uma
propriedade do produto, não uma falta do harness.

**Registrado também o que NÃO virou injeção:** um valor `{"v":3,…,"uri":…}` apontando para arquivo
inexistente é, fisicamente, **indistinguível** de `INJ-02`. Manter as duas seria fabricar cobertura.

### 5.5 Onde a fronteira foi respeitada — e onde ela impediria avanço

Nenhuma injeção precisou alterar o *runtime* produtivo nem modificar código cuja semântica está sob
teste. Se em algum ponto isso passar a ser necessário, a instrução é **parar essa parte e reportar**
— não construir um teste que prova a si próprio.

---

## 6. A sequência única

**Otimização:** 12 grupos · **3** trocas de Metro (`C→A→B→C`) · **1** troca de aparelho ·
**3** encerramentos de app · **1** instalação · **nenhuma** recriação de obra fora do necessário.

> **Pré condição inviolável:** **NÃO desinstale o app** e **NÃO limpe os dados** em momento algum.
> Vale também durante a instalação do novo *build* (§2.1).

| Ordem | Grupo | Contexto | Metro | Aparelho | Do `07` |
|---|---|---|---|---|---|
| 1 | `G-PRE` · captura pré instalação | — | não | iPad | novo |
| 2 | `G-INST` · instalar o novo *build* | — | não | iPad | novo |
| 3 | `GH1` · inventário **ANTES** por máquina | **C** | 8083 | iPad | resolve `L-1` / `TK-A-062` |
| 4 | `G1` · conferência visual do acervo | **A** | 8081 | iPad | `07` §8 `G1` |
| 5 | `G2` · mapa, faixa, sessão, áudio | **A** | 8081 | iPad | `07` §8 `G2` |
| 6 | `G3` · Colorir com obra antiga (×3) | **A** | 8081 | iPad | `07` §8 `G3` |
| 7 | `G4` · leitura pura | **A** | 8081 | iPad | `07` §8 `G4` |
| 8 | `G5` · *write-forward*, 10 rotações, nitidez | **A** | 8081 | iPad | `07` §8 `G5` |
| 9 | `G6` · Ateliê, galeria, acervo misto | **A** | 8081 | iPad | `07` §8 `G6` |
| 10 | `G8` · regressão em telefone | **A** | 8081 | **telefone** | `07` §8 `G8` |
| 11 | `G7` · caso 13, *rollback* | **B** | 8082 | iPad | `07` §8 `G7` |
| 12 | `GH2` · injeções controladas | **C** | 8083 | iPad | resolve `L-2` |
| 13 | `GH3` · restauração + inventário **DEPOIS** + `SNP-DIFF` | **C** | 8083 | iPad | `07` §8 `G9` |
| — | `G-OPP` · caso 9 | oportunístico, o roteiro inteiro | — | — | `07` §8 `G-OPP` |

**Por que esta ordem.** `GH1` vem primeiro porque a fotografia **ANTES** tem que preceder qualquer
ação. `G7` vem depois de `G5`/`G6` porque o caso 13 exige acervo **misto**, que é o que esses grupos
produzem. `GH2` vem por último porque as injeções são a única parte destrutiva-e-restaurada — e
porque assim as trocas de Metro caem para três. `G8` (telefone) fica encaixado antes de `G7` para
não exigir uma quarta troca.

**Os grupos `G1`–`G8` e `G-OPP` executam exatamente como o `07` §8 os define** — ações, esperado,
`FAIL`, evidência e cobertura. O `08` só altera a **ordem**, o **contexto** e os **comandos**.

---

## 7. Os grupos novos, em detalhe

### `G-PRE` · Captura pré instalação — **sem Metro, sem harness**

| | |
|---|---|
| **Estado inicial** | O app **como está hoje**, ainda com o *build* antigo |
| **Ações** | Executar o **Nível 1 de §6.1 do `07`** — as 4 capturas — no app instalado |
| **Esperado** | Coleção, galeria e contadores legíveis |
| **`FAIL`** | Não existir obra anterior à Fase 6 → **pare**: casos 1, 13, 14, 15, 16, §28 #7 e #9 ficam sem insumo |
| **Evidência** | 4 capturas |
| **Por que existe** | Rede de segurança antes da substituição do app (§2.1) |

### `G-INST` · Instalar o novo *build*

Executar §2.2, passos 2 a 4. **Evidência:** captura da tela do app aberto após a instalação,
mostrando o acervo íntegro.

### `GH1` · Inventário **ANTES** por máquina — resolve `L-1`

| | |
|---|---|
| **Contexto** | **C** · Metro **8083** · tarja vermelha visível |
| **Ações** | 1. Confirmar a **tarja vermelha**. 2. `INS-02` — deve reportar **nenhum *backup* pendente** e **nenhum *snapshot***. 3. `SNP-ANTES`. 4. Copiar os blocos numerados do console |
| **Esperado** | O *snapshot* lista as chaves relevantes, os envelopes, os ponteiros, os *blobs* e os **md5** |
| **`FAIL`** | `INS-02` reportar pendências (aparelho sujo de sessão anterior) → rodar `RST-TUDO` antes de tudo |
| **Evidência** | Texto do console (blocos numerados) + resumo compartilhado |
| **Cobre** | `TK-A-062` metade "antes" — agora com **evidência real**, não estimativa visual |

### `GH2` · Injeções controladas — resolve `L-2`

| | |
|---|---|
| **Contexto** | **C** · Metro **8083** |
| **Regra de ferro** | **Uma injeção por vez.** Executar a injeção → observar o produto → `RST-TUDO` → conferir `INS-02` limpo → só então a próxima |
| **Ações** | Percorrer `INJ-01` … `INJ-12` na ordem, cada uma com o ciclo acima |
| **Esperado** | A coluna "o que observar no produto" de §5.2, injeção por injeção |
| **`FAIL`** | Qualquer desvio da coluna, **em especial**: canvas branco silencioso onde existe obra recuperável; tinta sobre o *lineart* errado; qualquer remoção de chave ou *blob* |
| **Evidência** | **1 captura do painel** por injeção que produz painel (`INJ-01`, `04`, `06`, `07`, `08`) · **1 vídeo curto** de `INJ-10` (o alerta é transitório) · **texto do console** por injeção (o bloco `INJ-xx·INJETADO` já traz alvo, valor anterior e valor novo) |
| **Cobre** | `E4`, `E5`, painéis de recusa (`TK-A-045`, `TK-A-051`), caso 12 etapa **criar**, `G-VER`, `G-CMP-6` |

> **`INJ-04` e `INJ-05` exigem ponteiro `fmt:2`.** Se o harness recusar com essa mensagem, pinte e
> salve a atividade nesta versão do app (isso acontece naturalmente em `G5`) e repita.

### `GH3` · Fechamento — inventário **DEPOIS**, `SNP-DIFF` e limpeza

| | |
|---|---|
| **Contexto** | **C** · Metro **8083** |
| **Ações** | 1. `RST-TUDO`. 2. `INS-02` — **tem** que reportar nenhum *backup* pendente. 3. `SNP-DEPOIS`. 4. `SNP-DIFF`. 5. Copiar o relatório. 6. **`RST-SNAP`**. 7. `INS-02` de novo — nenhuma pendência **e** nenhum *snapshot* |
| **Esperado** | `SNP-DIFF` reporta **nenhuma assinatura grave de corrupção**. As diferenças restantes caem em "mudança permitida" (o que a campanha salvou de propósito) ou em "órfão pré existente" (lixo herdado, **não imputável** a `F6-R3`) |
| **`FAIL`** | Qualquer achado das classes **graves**: ponteiro órfão novo, *blob* órfão novo, remoção inesperada, referência inexistente |
| **Conferência humana obrigatória** | A lista `conferirContraOQueVoceFez` reúne alteração de conteúdo, criação inesperada, **permitida por prefixo padrão** e mudança de versão. O harness **não sabe** o que você fez de propósito — cada linha dessa lista precisa casar com um salvamento que você de fato realizou. Linha sem correspondência é achado |
| **Evidência** | Texto do relatório `SNP-DIFF` + confirmação de `INS-02` limpo |
| **Cobre** | `TK-A-062` metade "depois", `TK-A-060`, `TK-A-080` |

---

## 8. PowerShell — blocos copiáveis, um por contexto

> **Regra permanente:** um único Metro por vez. Antes de subir um, prove que o anterior caiu.

### 8.1 Prova de porta — use entre **todas** as trocas

```powershell
foreach ($p in 8081,8082,8083) {
  $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($c) { "porta $p : ATIVO — PID $($c[0].OwningProcess)" } else { "porta $p : parado" }
}
```

**Esperado:** exatamente **uma** porta ATIVA, e ela deve ser a do contexto em que você está.

---

### 8.2 `CONTEXTO C · HARNESS` — porta **8083**

Usado em `GH1`, `GH2` e `GH3`.

```powershell
# --- CONTEXTO C · HARNESS ---
Set-Location 'C:\tmp\ptf_f6_PHYSICAL_HARNESS_wt'
Get-Location                         # esperado: C:\tmp\ptf_f6_PHYSICAL_HARNESS_wt
git rev-parse --short HEAD           # esperado: 1ae353f
git rev-parse --abbrev-ref HEAD      # esperado: HEAD  (destacado, sem ramo)
git status --porcelain               # esperado: EXATAMENTE duas linhas -> " M App.js" e "?? src/devharness/"
node scripts/check-env.js
if ($?) { npx expo start --dev-client --clear --lan --port 8083 }
```

- **`HEAD` esperado:** `1ae353f` **destacado**, com o harness **não commitado**.
- **Resultado esperado no aparelho:** **tarja vermelha `F6 PHYSICAL HARNESS`** no topo, com botão
  `ABRIR`. **Se a tarja não aparecer, você não está no contexto C — pare.**
- **Prova na máquina:** §8.1 deve mostrar `8083 ATIVO`, `8081 parado`, `8082 parado`.

---

### 8.3 `CONTEXTO A · CANÔNICO` — porta **8081**

Usado em `G1`–`G6`, `G8` e `G-OPP`.

```powershell
# --- CONTEXTO A · CANONICO ---
# 1) Derrube o Metro anterior (Ctrl+C na janela dele) e prove:
foreach ($p in 8082,8083) {
  $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($c) { "porta $p AINDA ATIVA — pare antes de continuar" } else { "porta $p parada — ok" }
}

# 2) Prove o estado do worktree A
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
Get-Location                         # esperado: C:\tmp\ptf_fase6_shell_splash_wt
git rev-parse --abbrev-ref HEAD      # esperado: feat/fase6-shell-splash
git rev-parse --short HEAD           # esperado: 1ae353f
git status --porcelain               # esperado: NADA impresso
git rev-parse --abbrev-ref '@{upstream}'   # esperado: FALHA "no upstream configured" -- isso e o certo
git worktree list                    # esperado: A no ramo, B em a190b3e, C em 1ae353f (ambos detached)

# 3) Suba o Metro do contexto A
node scripts/check-env.js
if ($?) { npx expo start --dev-client --clear --lan --port 8081 }
```

- **`HEAD` esperado:** `1ae353f` no ramo `feat/fase6-shell-splash`, árvore **limpa**.
- **Resultado esperado no aparelho:** **nenhuma tarja**. Console mostra
  `[AppNavigator] MainTabs MONTADO · montagem #N` ao trocar de aba e girar.
- **Deixe esta janela visível.** Ela é a fonte de três evidências textuais: `CN-6` (contador de
  montagem), caso 9 (término do processo de conteúdo) e o discriminador A/B.

---

### 8.4 `CONTEXTO B · ROLLBACK` — porta **8082**

Usado **somente** em `G7`.

```powershell
# --- CONTEXTO B · ROLLBACK ---
# 1) Derrube o Metro 8081 (Ctrl+C) e prove:
foreach ($p in 8081,8083) {
  $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($c) { "porta $p AINDA ATIVA — pare antes de continuar" } else { "porta $p parada — ok" }
}

# 2) Prove o estado do worktree B
Set-Location 'C:\tmp\ptf_f6_CASO13_ROLLBACK_wt'
Get-Location                         # esperado: C:\tmp\ptf_f6_CASO13_ROLLBACK_wt
git rev-parse --short HEAD           # esperado: a190b3e
git rev-parse --abbrev-ref HEAD      # esperado: HEAD  (destacado)
git status --porcelain               # esperado: NADA impresso

# 3) Suba o Metro do contexto B
node scripts/check-env.js
if ($?) { npx expo start --dev-client --clear --lan --port 8082 }
```

- **`HEAD` esperado:** `a190b3e` destacado, árvore limpa.
- **Resultado esperado no aparelho:** **nenhuma tarja** e, ao trocar de aba e girar, **nenhuma**
  linha `[AppNavigator] MainTabs MONTADO`. **Se aparecer, você está em A — pare.**
- **Novo *build* nativo: NÃO.** O app instalado é o mesmo; §1.1 do `07` prova que a camada nativa de
  `a190b3e` e do HEAD é idêntica. **Não desinstale, não reinstale.**

---

### 8.5 No aparelho — trocar de servidor sem reinstalar

No *dev client*: agitar o aparelho → *Go home* → conectar ao servidor da porta do contexto novo.
**Nunca** desinstale o app para trocar de contexto.

---

### 8.6 Limpeza dos worktrees temporários — **só depois** de tudo registrado

```powershell
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
git worktree remove 'C:/tmp/ptf_f6_CASO13_ROLLBACK_wt'
git worktree remove --force 'C:/tmp/ptf_f6_PHYSICAL_HARNESS_wt'   # --force: o harness nao esta commitado, e e por isso que ele some junto
git worktree list                    # esperado: apenas A
git status --porcelain               # esperado: NADA — A continua limpo
```

Se `git worktree remove` reclamar de `node_modules`, remova antes a Junction:
`Remove-Item '<caminho>\node_modules' -Force` — a Junction some e o `node_modules` real de A **não**
é afetado.

> O `--force` no worktree C é **deliberado**: o harness nunca foi commitado, então removê lo é a
> forma de garantir que ele desapareça sem deixar rastro no Git.

---

## 9. Evidência mínima por cenário — proporcional ao risco

| Tipo de cenário | Evidência mínima | Por quê |
|---|---|---|
| Continuidade e movimento (rotação em curso, gesto, *background*, *kill*) | **vídeo contínuo** | o defeito está na transição, não no quadro final |
| Deformação, escala, recorte, alinhamento tinta↔*lineart* | **capturas** antes/depois | comparação estática prova melhor que vídeo |
| Contadores, ordem de galeria, vagas do C60 | **captura + número anotado** | o dado é textual |
| Console (`CN-6`, caso 9, discriminador A/B) | **texto copiado** | captura de console é ilegível e não pesquisável |
| Painel de recusa (injeções) | **1 captura por painel** | o texto do painel é o critério |
| `INJ-10` | **vídeo curto** | o alerta é transitório |
| Inventário `ANTES`/`DEPOIS` e `SNP-DIFF` | **texto do console** | é o próprio dado |

**Total previsto:** 5 vídeos contínuos (`G2`, `G3`×3, `G5` passo 5) + vídeos curtos (`G6` passo 2,
`G7`, `INJ-10`) + capturas conforme a tabela.

---

## 10. Tabela curta de respostas — o que Eduardo escreve

**Não redija relatório técnico durante a campanha.** Responda em linha curta. A consolidação é
feita depois.

Formato: `<ID> PASS` ou `<ID> FAIL, <evidência>` ou `<ID> NÃO REPRODUZIDO`.

```
G-PRE     ____        GH1       ____        G3.1  ____   G5    ____
G-INST    ____        G1        ____        G3.2  ____   G6    ____
                      G2        ____        G3.3  ____   G8    ____
                      G4        ____                     G7    ____

INJ-01 ____  INJ-02 ____  INJ-03 ____  INJ-04 ____  INJ-05 ____  INJ-06 ____
INJ-07 ____  INJ-08 ____  INJ-09 ____  INJ-10 ____  INJ-11 ____  INJ-12 ____

GH3       ____        G-OPP     ____ (ou "não reproduzido")
```

Exemplos válidos: `G2 PASS` · `G3.2 FAIL, vídeo 3` · `INJ-09 achado, ver vídeo 7` ·
`G-OPP não reproduzido`.

**`INJ-09` não é `PASS`/`FAIL`** — é sondagem. Descreva em uma linha o que aconteceu ao reabrir
**e** ao salvar por cima.

---

## 11. Fronteira de escopo — o que fazer com o que aparecer

Mantida a de `07` §9, com um acréscimo:

- Defeito que **não** pertence a `F6-SG-A` → **anotar e seguir**. Não vira escopo desta campanha.
- `F6-R2`, `F6-R1` e `B2` permanecem **fechados** — nada nesta campanha os abre.
- Achado do harness que revele necessidade de alterar o *runtime* produtivo → **parar essa parte e
  reportar**. Não construir um teste que prova a si próprio.

---

## 12. O que continua bloqueado até o retorno físico

`F6-SG-A` **não está concedido** e não pode ser concedido por nenhum agente. A concessão depende
exclusivamente da execução física e do retorno de Eduardo com os resultados desta sequência.
