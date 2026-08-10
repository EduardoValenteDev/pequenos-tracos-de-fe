# 07 · Campanha física de `F6-SG-A` — roteiro executável

> **Status:** `F6-R3` **EM ANDAMENTO** · `F6-SG-A` **NÃO CONCEDIDO**.
> Este documento é a execução de **`TK-A-081`** (preparar a campanha física). Ele **não** concede
> subportão, **não** declara `PASS` e **não** substitui o PLAN. Ele existe para que o fundador
> execute apenas as ações **realmente humanas** no aparelho.

---

## 0. O que este documento é — e o que ele corrige do `06`

O artefato `06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md` cobre **um** dos dois eixos de validação
física: a **matriz §28.1** (17 casos obrigatórios + `E1`..`E6`). Uma auditoria de rastreabilidade
feita antes de escrever este documento mostrou que ele **não** cobre:

| Faltava no `06` | Dono canônico |
|---|---|
| Cenários **§28 #1, #2, #3, #4, #5, #6, #8, #9, #10, #11** | `TK-A-081` (§28 é eixo próprio) |
| Controle negativo **`CN-2`** | `TK-A-020` |
| Controle negativo **`CN-4`** | `TK-A-028` |
| Controle negativo **`CN-6`** | `TK-A-022` |
| Consolidação dos controles negativos | `TK-A-060` |

A nota normativa **`N-02`** (`05_TASKS_DELTA_F6.md`, §11.8) é explícita: §28 e §28.1 são **eixos
ortogonais** — *"nenhum cenário físico substitui caso obrigatório da matriz; nenhum caso da matriz
substitui cenário físico obrigatório"*. Executar apenas o `06` **não** satisfaria o critério de
saída de `F6-SG-A` (PLAN §27: *"roteiro físico §28 completo em iPad … `CN-1`, `CN-3`, `CN-4`
verdes"*).

**Este documento é a união dos dois eixos mais os controles negativos.** O `06` continua válido
como detalhamento da matriz §28.1; onde houver divergência de escopo, **vale este `07`**.

---

## 1. Veredito de *build* nativo — evidência objetiva

O fundador pediu reconfirmação antes de instruir, e proibiu inventar compatibilidade. Segue o que
foi **medido**, não presumido.

### 1.1 Camada nativa ao longo do ramo

```
git diff --name-only a190b3e..HEAD -- app.json app.config.js app.config.ts eas.json \
                                      package.json package-lock.json android ios
→ (vazio)
```

**Nenhum arquivo de configuração nativa mudou em todo o `F6-R3`.** Não existem pastas `android/`
nem `ios/` no repositório (projeto CNG/*managed*). Consequência direta: **o cenário A (HEAD) e o
cenário B (`a190b3e`, caso 13) têm a mesma camada nativa** — a troca de cenário é troca de
**servidor Metro**, nunca de aplicativo instalado.

### 1.2 *Fingerprint* nativo (`@expo/fingerprint` 0.15.5, já presente na árvore)

| Alvo | Plataforma | *Fingerprint* |
|---|---|---|
| **HEAD** (worktree A) | Android | `5e7343821330ea34c796e349788c9799e77a1360` |
| **HEAD** (worktree A) | iOS | `c8b6c521500558fde471e47202d41d5e9dda79aa` |

*Builds* EAS existentes (`npx eas build:list`):

| Perfil | Plataforma | *Build* | Data | *Commit* | *Fingerprint* | Serve? |
|---|---|---|---|---|---|---|
| `development` | **ANDROID** | `c05a5800-ebff-4ccd-bf0d-15324ac3fae7` | 2026-08-07 | `f10370e` | `5e73438213…` | ✅ **idêntico ao HEAD** |
| `development` | iOS | `60d0e4c1…` / `df4a4803…` | 2026-08-07 | `7c12987` | `c05a6a81…` | ⚠️ **divergente** |
| `development` | iOS | `10fce052…` | 2026-07-31 | `7c12987` | `c05a6a81…` | ⚠️ divergente |
| `c60-pilot` | iOS | `98e2b422…` / `bafb8e3f…` | 2026-08-04 | `7f96ee9` / `b24c868` | `c8b6c521…` | ❌ **sem `developmentClient`** |

### 1.3 Leitura honesta

**ANDROID — provado.** O *fingerprint* do *development build* `c05a5800` é **byte a byte o mesmo**
do HEAD. Ele é `developmentClient: true`, `distribution: internal`, `buildType: apk`. **Nenhum
*build* novo é necessário nem justificável.**

**iOS — NÃO provado.** Os *development builds* iOS estão em `c05a6a81…`; o HEAD está em
`c8b6c521…`. A conclusão anterior *"nenhum novo build nativo é necessário"* **permanece verdadeira
para Android e deixa de ser demonstrável para iOS.** Isso é reportado **antes** da validação,
conforme instruído.

**Causa exata da divergência iOS.** Entre `7c12987` e HEAD:
- `eas.json` mudou, mas **o perfil `development` não foi tocado** — as alterações estão em
  `preview`, `preview-criador`, `production` e no perfil novo `c60-pilot`. **Irrelevante.**
- `package.json` ganhou dois *scripts* (`check:env`, `start:dev`) — **ferramenta JS, irrelevante**
  — e subiu `expo` de `~54.0.35` para `~54.0.36`.
- O *lockfile* tem **42 pacotes** com versão diferente. Verificação item a item de quais carregam
  camada nativa de aplicativo (`android/`, `ios/`, `expo-module.config.json`, `.podspec`):

  ```
  TOTAL com indício de camada nativa: 1
    node_modules/expo   android=true ios=true expo-module=true podspec=true   54.0.35 -> 54.0.36
  ```

  Os outros **41** são ferramenta de *build*: `@expo/config-plugins`, `@expo/cli`,
  `@expo/metro-config`, `babel-preset-expo`, `lightningcss*`, `tar`, `undici`, `semver`, `sax`,
  `ws`, `@0no-co/graphql.web`. **`@expo/config-plugins` entra no cálculo do *fingerprint*** (medido
  diretamente: as fontes divergentes incluem `node_modules/@expo/config-plugins/build/**`), o que
  torna o *fingerprint* um sinal **conservador** — ele muda com ferramenta que nem sequer existe
  dentro do binário.

**Resumo técnico:** nenhum módulo nativo foi **adicionado, removido ou trocado de versão**. A única
diferença com camada nativa é um *patch* do pacote `expo` (54.0.35 → 54.0.36).

### 1.4 ⚠️ `B-1` — decisão que **só o fundador** pode tomar

O aparelho confirmado da campanha é o **iPad** (`P7`). É exatamente a plataforma cujo *build* não
está provado.

| Rota | O que significa | Custo |
|---|---|---|
| **(a)** Gerar *development build* iOS novo a partir do HEAD | `npx eas build --profile development --platform ios` | operação remota, ~20–40 min, exige autorização explícita (não foi iniciada) |
| **(b)** Usar o *development build* iOS existente e **registrar o vão** | Único delta nativo = *patch* do pacote `expo`; nenhum módulo nativo mudou | risco baixo, **não nulo e não provável a partir daqui** |

**Nada foi construído. Nenhum *build* foi disparado.** A campanha abaixo está escrita para
funcionar em qualquer das duas rotas; a rota escolhida é registrada em §11.5.

> `Expo Go`: **PROIBIDO** em todos os cenários — `expo-dev-client` e `react-native-purchases` são
> módulos nativos ausentes do Expo Go. Não é preferência: é impossibilidade técnica.

---

## 2. Estado canônico e os dois worktrees

| | **Worktree A — cenário atual** | **Worktree B — cenário anterior (caso 13)** |
|---|---|---|
| Caminho | `C:\tmp\ptf_fase6_shell_splash_wt` | `C:\tmp\ptf_f6_CASO13_ROLLBACK_wt` |
| Ramo | `feat/fase6-shell-splash` | **nenhum** — `HEAD` destacado |
| `HEAD` | *(HEAD final desta sessão — ver §11.1)* | **`a190b3e`** |
| Papel | Todos os grupos, exceto `G7` | **Somente** `G7` (caso 13 · `TK-A-075`) e a captura "antes" de `CN-2` |
| Porta do Metro | **8081** | **8082** |
| *upstream* | nenhum | nenhum |
| `node_modules` | real | **Junction** para o de A (mesma árvore de dependências, por construção) |
| `.env` | real | cópia idêntica |

**Por que `a190b3e`:** é o pai exato de `9c282ff` (`C-A1`), ou seja, **o último *commit* antes de
qualquer alteração de *runtime* de `F6-R3`**. Diferença intencional A ↔ B: **exatamente 9 arquivos
em `src/`** (1562 inserções / 178 remoções) — `AtelierCanvas.js`, `BeniGuideOverlay.js`,
`ColoringCanvas.js`, `useSurfaceLifecycle.js`, `useViewportProjection.js`, `AppNavigator.js`,
`AdventureMapScreen.js`, `AtelierCanvasScreen.js`, `ColoringScreen.js`. **Nada mais.**

### 2.1 Regras do worktree temporário (as dez, todas cumpridas)

1. sem *upstream* · 2. sem *push* · 3. sem *merge* · 4. não altera outra branch (`HEAD` destacado)
· 5. não contamina A (diretório separado; `node_modules` por Junction; `.gitignore` cobre `.env` e
`node_modules`) · 6. parte do estado definido pelo protocolo (`a190b3e`) · 7. identificável pelo
nome `ptf_f6_CASO13_ROLLBACK_wt` · 8. removível ao final com
`git worktree remove C:/tmp/ptf_f6_CASO13_ROLLBACK_wt` sem perda de evidência (a evidência vive
neste documento e nas capturas) · 9. sem alterações oportunistas (`git status --porcelain` vazio) ·
10. existe só pelo tempo da validação.

### 2.2 Como **provar** em qual cenário o aparelho está — sem depender de memória visual

Existe um discriminador objetivo que **não exige tocar em nenhuma linha de *runtime***:

| Sinal no console do Metro | Significa |
|---|---|
| aparece `[AppNavigator] MainTabs MONTADO · montagem #N` e `[AppNavigator] faixa = …` | **cenário A** (HEAD, com `F6-R3`) |
| **nenhuma** dessas linhas aparece, mesmo trocando de aba e girando | **cenário B** (`a190b3e`, sem `F6-R3`) |

Verificado por medição: `a190b3e` tem **0** ocorrências de `MainTabs MONTADO` e **0** de
`onContentProcessDidTerminate`; o HEAD tem **1** e **2**, respectivamente. O sinal é impossível de
falsificar por engano.

**Reforço:** a porta do Metro aparece na tela inicial do *dev client* (`http://<ip>:8081` ou
`:8082`) e é conferível na máquina por PowerShell (§3.4).

---

## 3. Comandos PowerShell — exatos, copiáveis, na ordem

> **Regra permanente:** **um único Metro por vez.** Nunca deixe 8081 e 8082 no ar juntos.

### 3.1 Passo 1 — entrar no worktree A e **provar** o estado

```powershell
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
Get-Location
git rev-parse --abbrev-ref HEAD
git rev-parse --short HEAD
git status --porcelain
git worktree list
```

**Esperado:**
- `Path` → `C:\tmp\ptf_fase6_shell_splash_wt`
- ramo → `feat/fase6-shell-splash`
- `HEAD` → o valor de §11.1
- `git status --porcelain` → **nada impresso** (árvore limpa)
- `git worktree list` → duas linhas: A no ramo, B em `a190b3e` `(detached HEAD)`

Se qualquer linha divergir, **pare** e reporte. Não prossiga "para ver no que dá".

### 3.2 Passo 2 — confirmar que nenhum *upstream* existe

```powershell
git rev-parse --abbrev-ref '@{upstream}'
git branch -vv
```

**Esperado:** o primeiro comando **falha** (`no upstream configured`) — isso é o resultado correto.
`git branch -vv` não pode exibir `[origin/…]` na linha de `feat/fase6-shell-splash`.

### 3.3 Passo 3 — subir o Metro do cenário A (porta 8081)

```powershell
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
node scripts/check-env.js
if ($?) { npx expo start --dev-client --clear --lan --port 8081 }
```

- **Metro: SIM** · **Expo Go: PROIBIDO** · **Novo *build* nativo: NÃO** (ver `B-1` em §1.4 para iOS)
- **Worktree ativo:** `C:\tmp\ptf_fase6_shell_splash_wt`
- **`HEAD` esperado:** §11.1

**Deixe esta janela visível durante toda a campanha.** Ela é a fonte de três evidências textuais:
`CN-6` (contador de montagem), caso 9 (término do processo de conteúdo) e o discriminador A/B.

### 3.4 Passo 4 — provar, na máquina, qual Metro está no ar

```powershell
$a = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
$b = Get-NetTCPConnection -LocalPort 8082 -State Listen -ErrorAction SilentlyContinue
if ($a) { "Metro 8081 (cenario A): ATIVO — PID $($a[0].OwningProcess)" } else { "Metro 8081 (cenario A): parado" }
if ($b) { "Metro 8082 (cenario B): ATIVO — PID $($b[0].OwningProcess)" } else { "Metro 8082 (cenario B): parado" }
```

**Esperado durante `G1`–`G6`, `G8`, `G9`:** 8081 ATIVO, 8082 parado.
**Esperado durante `G7`:** 8081 parado, 8082 ATIVO.

### 3.5 Troca para o cenário B — **somente** no grupo `G7`

```powershell
# 1) Derrubar o Metro do cenario A: volte a janela do Metro e pressione Ctrl+C. Depois confirme:
$a = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
if ($a) { "AINDA ATIVO — pare antes de continuar" } else { "8081 parado — ok" }

# 2) Provar o estado do worktree B
Set-Location 'C:\tmp\ptf_f6_CASO13_ROLLBACK_wt'
Get-Location
git rev-parse --short HEAD          # esperado: a190b3e
git status --porcelain              # esperado: NADA
git rev-parse --abbrev-ref HEAD     # esperado: HEAD  (destacado, sem ramo)

# 3) Subir o Metro do cenario B na porta 8082
node scripts/check-env.js
if ($?) { npx expo start --dev-client --clear --lan --port 8082 }
```

- **Metro: SIM (porta 8082)** · **Expo Go: PROIBIDO** · **Novo *build* nativo: NÃO** — o aplicativo
  instalado **é o mesmo**; §1.1 prova que a camada nativa de `a190b3e` e do HEAD é idêntica.
- **Worktree ativo:** `C:\tmp\ptf_f6_CASO13_ROLLBACK_wt` · **`HEAD` esperado:** `a190b3e`
- **Quando NÃO trocar o *build*:** **nunca** durante a campanha. Não desinstale, não reinstale, não
  gere APK/IPA novo entre A e B. Desinstalar apaga o acervo e **destrói** o caso 13.

No aparelho: no *dev client*, saia do projeto (agitar → *Go home*) e conecte-se ao servidor
`:8082`. Confirme pelo discriminador de §2.2 **antes** de executar qualquer passo do caso 13.

### 3.6 Voltar ao cenário A ao fim de `G7`

```powershell
# Ctrl+C na janela do Metro 8082, depois:
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
node scripts/check-env.js
if ($?) { npx expo start --dev-client --clear --lan --port 8081 }
```

### 3.7 Remoção do worktree temporário — **só depois** de `G7` registrado

```powershell
Set-Location 'C:\tmp\ptf_fase6_shell_splash_wt'
git worktree remove 'C:/tmp/ptf_f6_CASO13_ROLLBACK_wt'
git worktree list
```

Se `git worktree remove` reclamar de `node_modules`, remova primeiro a Junction:
`Remove-Item 'C:\tmp\ptf_f6_CASO13_ROLLBACK_wt\node_modules' -Force` (a Junction some; o
`node_modules` real de A **não** é afetado).

---

## 4. Escopo real e completo da campanha

### 4.1 Eixo §28 — sequência de validação física (parcela `SG-A`)

| §28 | Cenário | Tasks donas | Grupo |
|---|---|---|---|
| #1 | Mapa: rolar até ponto arbitrário, **girar** | `TK-A-017`, `TK-A-018`, `TK-A-019`, `TK-A-023` | `G2` |
| #2 | Girar de volta | `TK-A-018` | `G2` |
| #3 | Colorir: pintar, girar, continuar pintando | `TK-A-035`, `TK-A-016` | `G3` |
| #4 | Colorir: pintar, **Centro de Controle**, voltar | `TK-A-010`, `TK-A-012` | `G3` |
| #5 | Colorir: pintar, segundo plano, esperar, voltar | `TK-A-010`, `TK-A-014` | `G3` |
| #6 | Colorir: **Split View**, arrastar o divisor, sair | `TK-A-032`, `TK-A-033`, `TK-A-035`, `TK-A-085`, `TK-A-016` | `G3` |
| #7 | **Abrir desenho salvo antes da mudança** e continuar | **`TK-A-097`** (`CN-3`) | `G3` |
| #8 | Ateliê: desenhar, carimbar, girar | `TK-A-034` | `G6` |
| #9 | Ateliê: obra `v:2` antiga → girar → salvar → reabrir | `TK-A-048`, `TK-A-049`, `TK-A-050`, `TK-A-011` | `G6` |
| #10 | Jogo em andamento: girar e multitarefa | `TK-A-028`, `TK-A-029`, `TK-A-023` | `G2` |
| #11 | Áudio tocando: girar, segundo plano, voltar | `TK-A-025` | `G2` |
| #17 | Regressão completa em **telefone** (parcela `SG-A`) | **`TK-A-098`** (`CN-1`) | `G8` |

> §28 #12, #13, #14, #15 e #16 pertencem a `F6-SG-B`/`F6-SG-C`. **Não** entram nesta campanha.

### 4.2 Eixo §28.1 — matriz obrigatória (17) + adicionais (6)

| Caso | Task | O que se executa | Grupo |
|---|---|---|---|
| 1 | `TK-A-063` | Obra **antiga** em retrato | `G3` |
| 2 | `TK-A-064` | Mesma obra em paisagem | `G3` |
| 3 | `TK-A-065` | Retorno a retrato | `G3` |
| 4 | `TK-A-066` | *Viewport* menor (Split View estreito / Slide Over) | `G3` |
| 5 | `TK-A-067` | *Viewport* maior (tela cheia em paisagem) | `G3` |
| 6 | `TK-A-068` | Reabertura após **encerrar o app** | `G4` |
| 7 | `TK-A-069` | *Background* e *foreground* | `G3` |
| 8 | `TK-A-070` | Centro de Controle | `G3` |
| 9 | `TK-A-071` | Término do processo de conteúdo (quando reproduzível) | `G-OPP` |
| 10 | `TK-A-072` | Obra **sem modificação** — abrir e fechar sem desenhar | `G4` |
| 11 | `TK-A-073` | Obra modificada e salva no formato novo | `G5` |
| 12 | `TK-A-074` | **Falha durante a gravação** | `G5` (parcial) + `L-2` |
| 13 | `TK-A-075` | ***Rollback*** do código com acervo já misto | **`G7`** |
| 14 | `TK-A-076` | Formato legado `v1`/`v2` sem geometria completa | `G3` |
| 15 | `TK-A-077` | *Payload* visual atual (sem `paintSchemaVersion`) | `G3` |
| 16 | `TK-A-078` | Envelope atual — ponteiro `v:3` | `G3` |
| 17 | `TK-A-079` | Novo *schema* lógico (`paintSchemaVersion` + `layoutVersion`) | `G5` |
| `E1` | `TK-A-100` | Obra nova criada e reaberta na **mesma** janela | `G6` |
| `E2` | `TK-A-101` | Obra **vetorial** do Ateliê atravessando mudança de janela | `G6` |
| `E3` | `TK-A-102` | **Dez** rotações consecutivas, sem deriva | `G5` |
| `E4` | `TK-A-103` | *Payload* associado a *lineart* **divergente** | `L-2` |
| `E5` | `TK-A-104` | *Payload* **corrompido ou truncado** | `L-2` |
| `E6` | `TK-A-105` | Galeria com **acervo misto** após atualização | `G6` |

### 4.3 Itens que não pertencem a nenhum dos dois eixos

| Item | Task | Grupo |
|---|---|---|
| Inventário de armazenamento **antes × depois** | `TK-A-062` | `G1` + `G9` |
| `CN-2` — abertura do mapa idêntica | `TK-A-020` | `G2` (depois) + `G7` (antes) |
| `CN-4` — rota, áudio e sessão intactos | `TK-A-028` | `G2` |
| `CN-6` — travessia de `600dp` **não** remonta | `TK-A-022` | `G2` |
| Painéis de recusa ("não consegui abrir") | `TK-A-045`, `TK-A-051` | `L-2` |
| **`TA-5R`** — nitidez da borda do balde em tela grande | *(sem task própria; §`06`)* | `G5` |
| Consolidação dos controles negativos | `TK-A-060` | `G9` |
| Consolidação da matriz 17+6 | `TK-A-080` | `G9` |
| Vão de tablet Android | `TK-A-082` · `TK-A-013` | **bloqueado por `P8`/§33** |

---

## 5. Limitações objetivas — o que **hoje** não é executável no aparelho

Estas limitações foram descobertas por levantamento do código, não presumidas. Elas **não** são
desculpa para reduzir escopo: são vãos declarados, com decisão do fundador em §11.5.

### `L-1` — não existe inspetor de armazenamento

Levantamento: **nenhuma tela do app** exibe contagem de chaves, bytes ou uso de `ptf_blobs`
(`ParentAreaScreen`, `Coloring60LabScreen` e `AtelierGalleryScreen` foram verificados). **Nenhum
*script*** do repositório gera inventário de dispositivo (`scripts/assets-pipeline/inventory.js`
percorre `assets/` do repositório, não o aparelho). Nenhum arnês de `scripts/testing/` roda no
aparelho.

**Consequência:** `TK-A-062` (inventário byte a byte), caso 6 e caso 10 (comparação de bytes
persistidos) **não** são executáveis em nível de bytes a partir de uma máquina Windows com iPad.
§6 define o procedimento em três níveis, sendo o **Nível 1 sempre executável**.

### `L-2` — não existe caminho de injeção no acervo

Caso 12 (falha injetada em **criar · persistir · validar · reler**), `E4` (*lineart* divergente) e
`E5` (*payload* truncado) exigem **escrever** estado inválido no armazenamento do aparelho. Não há
afordância no app para isso. Os painéis de recusa (`TK-A-045`, `TK-A-051`) só são alcançáveis por
essa via.

**O que permanece executável sem injeção:** a variante física de caso 12 **matar o app durante o
salvamento** (é literalmente `TK-A-050`) — está em `G5`.

**O que permanece coberto automaticamente:** `E4` e `E5` são `Auto: sim` (arnês `TA-12`), caso 12 é
`Auto: parcial` (`TA-13`). Os arneses já rodaram verdes (`281/281`). A parcela **física** é que
está bloqueada.

### `L-3` — Android

O *development build* Android é o **único provado** (§1.3) e um APK de *dev* é depurável — o que
tornaria `L-1` e `L-2` resolvíveis por `adb`. Mas `P8` registra **tablet Android indisponível**, e
`TK-A-013` está formalmente *"bloqueada por indisponibilidade de aparelho (§33)"*.

**Pergunta objetiva para o fundador (§11.5):** existe um **telefone Android** disponível? Se sim,
ele destrava `L-1` e `L-2` e serve também ao §28 #17 (`G8`). Se não, `L-1` e `L-2` permanecem.

---

## 6. `TK-A-062` — inventário de armazenamento antes × depois

**O que interessa medir** (levantado do código, com dono real):

| Chave / caminho | Onde é declarada | O que registrar |
|---|---|---|
| `@ptf_drawing_s<storyId>_c<sceneId>` | `src/services/drawingStorage.js:33-35` | existe? ponteiro `v:3` ou *inline*? `fmt`, `uri`, `mime`, `W/H/imgX/imgY/imgW/imgH`, tamanho |
| `@ptf_drawing60_s<storyId>_a<activityId>` | `src/services/coloring60DrawingStorage.js:178-180` | idem **+ `rev`, `paintedPx`, `paintablePx`** |
| `@ptf_coloring60_done_*` · `_ever_*` · `_snap_*` | `src/services/coloring60ActivityService.js:39,43,53` | presença e valor |
| `@ptf_coloring60_finale_seen_<storyId>` | `coloring60ActivityService.js:46` | presença |
| `ptf_atelier_arts_v1_index` | `src/services/atelierStorage.js:13` | **array inteiro**: `id`, `title`, `createdAt`, `updatedAt`, `schema`, `thumbnailUri` — **e a ordem** |
| `ptf_atelier_arts_v1_<id>` | `atelierStorage.js:16-18` | uma por `id` do índice |
| `@ptf_monte_a_cena_gallery_v1:<profileId>` | `src/services/monteACenaGallery.js:10-13` | presença |
| `@ptf_schema_version` | `src/services/storageKeys.js:28` | deve ser `3` |
| `<documentDirectory>ptf_blobs/drawings/` | `drawingStorage.js:31` | caminho, bytes, `mtime` |
| `<documentDirectory>ptf_blobs/drawings60/` | `coloring60DrawingStorage.js:122` | idem — **slots `.a.png` / `.b.png`** |
| `<documentDirectory>ptf_blobs/atelier/` | `atelierStorage.js:14` | `<id>_preview.jpg`, `<id>_thumb.jpg` |

Identidades reais do Colorir 60 hoje (`src/data/coloring60Catalog.js`): `storyId = 'creation'`;
`activityId ∈ { light, living_world, people_and_care }`. As três chaves de píxeis concretas são
`@ptf_drawing60_screation_alight`, `@ptf_drawing60_screation_aliving_world`,
`@ptf_drawing60_screation_apeople_and_care`. **Não existe índice para o Colorir 60** — a coleção é
derivada do catálogo; a contagem é feita chave a chave sobre essas três identidades.

### 6.1 Procedimento em três níveis

**Nível 1 — SEMPRE executável (obrigatório).** Antes de tocar em qualquer coisa e de novo no fim,
capturar as mesmas quatro telas, na mesma ordem:

1. **Coleção do Colorir 60** (`Coloring60CollectionScreen`) — as três vagas. É a evidência visual
   mais forte que existe: uma vaga só mostra arte quando ela é **recuperável e com cor medida de
   verdade**.
2. **Galeria do Ateliê** (`AtelierGalleryScreen`) — a lista inteira, rolando até o fim.
3. **Tela Brincar** — o texto **"N arte(s) guardada(s)"** (`BrincarScreen.js:336`). É o único
   contador numérico de obras visível no app.
4. **Área dos Pais → Resumo da criança** — histórias concluídas / em andamento.

Registrar em §11.4 os números lidos. **Diferença esperada:** apenas o que a própria sessão salvou
deliberadamente. **Qualquer** vaga que deixe de mostrar arte, qualquer item que suma da galeria e
qualquer queda no contador é **corrupção** e é `FAIL` de invariante ZERO.

**Nível 2 — se o Metro permitir avaliar JS no contexto do app.** No *dev client*, agitar → abrir o
*JS debugger*. **Se** o console permitir chamar `AsyncStorage`, capturar chaves e tamanhos. Se não
permitir, **não insista** — o Nível 1 já dá o veredito de `TK-A-062`. Não altere código para
conseguir isso.

**Nível 3 — inventário byte a byte.** Exige `adb` (telefone Android de *dev*) ou macOS/Xcode →
*Devices* → *Download Container* (iPad). **Indisponível hoje** a partir de Windows + iPad (`L-1`).

### 6.2 Diferença **esperada** (não é defeito)

- **+1 arquivo** em `ptf_blobs/drawings60/` por parte pintada; ao repintar a mesma identidade, o
  arquivo alterna entre `.a.png` e `.b.png` e o antigo **desaparece** — é o *double-buffer*
  funcionando (`coloring60DrawingStorage.js:284-287`, `613-617`).
- Novas chaves `@ptf_coloring60_done_*` / `_ever_*` / `_snap_*` para identidades concluídas.
- Ateliê: nova entrada **no topo** do índice (`unshift`), nova chave `ptf_atelier_arts_v1_<id>` e
  **dois** arquivos novos em `ptf_blobs/atelier/`.
- Re-salvar a **mesma** obra do Ateliê: `updatedAt` muda, **`createdAt` não**, os dois arquivos são
  sobrescritos no mesmo caminho, a posição no índice é mantida.
- `uri` com prefixo de contêiner iOS diferente após atualização/restauração: **esperado e tratado**
  (`fileBlobStore.js:88-96,156-167`). **Não é corrupção.**

### 6.3 Diferença que significa **corrupção** (`FAIL` imediato)

1. Ponteiro **órfão**: chave `v:3` cujo `uri` não existe em disco → a obra sumiu.
2. `id` no índice do Ateliê sem a chave completa correspondente — ou o inverso.
3. `previewUri`/`thumbnailUri` nulos com `previewBase64`/`thumbnailBase64` preenchidos onde antes
   eram `file://` (regressão de escrita em disco).
4. **`createdAt` alterado** para o mesmo `id`.
5. Ordem do índice mudou para itens **não tocados**.
6. Valor truncado: chave que era ponteiro `v:3` virou *string inline* curta; ou `.png`
   drasticamente menor sem repintura correspondente.
7. **Ambos** os slots `.a.png` e `.b.png` presentes para a mesma identidade após salvamento bem
   sucedido.
8. *Blob* apontado por ponteiro **ativo** apagado — **o achado mais grave possível**.
9. Arquivo em `ptf_blobs/` fora de `drawings/`, `drawings60/` ou `atelier/`.
10. Bytes de um `.a.png`/`.b.png` mudarem **sem** o `rev` do ponteiro mudar.

**No Nível 1**, os itens observáveis são 1, 2, 3 e 8 — todos aparecem como vaga vazia, item ausente
ou miniatura quebrada. Isso é suficiente para reprovar; não é suficiente para **absolver** nos itens
4, 5, 6, 7, 9 e 10, e isso fica registrado como vão.

---

## 7. Controles negativos físicos — itens próprios, não diluídos

### `CN-2` — *"Primeira montagem do mapa mantém o comportamento atual (`comece_aqui` no topo)"*

- **Executa:** abrir o app **sem posição de mapa gravada** (primeira abertura da sessão), ir direto
  ao mapa, **não rolar**, capturar a tela.
- **Verifica:** a abertura é **indistinguível** da abertura do cenário anterior. `comece_aqui` no
  topo.
- **Como obter o "antes":** a **mesma captura** feita em `G7` (cenário B = código anterior). Não é
  preciso viagem extra: aproveita a troca de Metro já prevista.
- **`FAIL`:** a câmera de abertura mira em outro ponto; a região ativa não é a primeira; salto
  visível.
- **Evidência:** **duas capturas** (A e B), mesmo aparelho, mesma orientação (retrato), mesma janela.

### `CN-4` — *"Rota, áudio e sessão de jogo não são afetados por `R3.1`"*

- **Executa:** (i) iniciar um jogo, deixá-lo em andamento, **girar** e alternar para outro app e
  voltar; (ii) com áudio tocando, **girar**, mandar ao segundo plano, voltar; (iii) conferir que
  rota, pilha e aba são as mesmas depois de girar e de arrastar o divisor.
- **Verifica:** a sessão **sobrevive sem reinício**; o áudio não sofre corte anômalo; a rota/aba não
  muda sozinha.
- **`FAIL`:** o jogo reinicia; a pontuação/estado zera; o áudio corta e não retoma; o app cai em
  outra aba.
- **Evidência:** **vídeo contínuo** — é continuidade ao longo de *background*/*unlock*, que captura
  não prova. `TK-A-028` é `Auto: não`: **100 % do peso está aqui.**

### `CN-6` — *"Nenhuma tela remonta na travessia de `600dp`"*

- **Executa:** em Split View no iPad, **arrastar o divisor lentamente** de um lado ao outro de
  `600dp`, ida e volta, com a janela do Metro visível.
- **Verifica no console do Metro:**
  - a linha `[AppNavigator] faixa = tablet (sidebar à esquerda) · largura=…dp · ainda na montagem #1`
    **muda** para `faixa = celular (barra inferior)` (e volta) — a composição responde;
  - o número em **`ainda na montagem #N` NÃO muda**, e **nenhuma** linha nova
    `[AppNavigator] MainTabs MONTADO · montagem #N+1` aparece.
- **`FAIL`:** o contador sobe, ou aparece `MainTabs DESMONTADO`. Isso é **defeito**, não observação.
- **Evidência:** **texto copiado do console** do Metro (não precisa vídeo) **+** um vídeo curto do
  arrasto, que serve simultaneamente ao §28 #6.

---

## 8. A campanha agrupada

**Otimização:** 9 grupos · **2** trocas de Metro (A→B→A) · **1** troca de aparelho · **3**
encerramentos de app em todo o roteiro. Nenhum requisito foi alterado para ganhar velocidade; o que
foi eliminado é preparação repetida.

> **Pré condição inviolável de toda a campanha:** **NÃO desinstale o app** e **NÃO limpe os dados**
> em nenhum momento. O acervo real (obras salvas **antes** da Fase 6) é o insumo dos casos 1, 14,
> 15, 16, 13 e dos cenários §28 #7 e #9. Perdê lo inviabiliza a campanha inteira.

---

### `G0` · Preparo na máquina — **sem aparelho**

**Metro: NÃO** (ainda) · **Expo Go: PROIBIDO** · **Novo *build*: ver `B-1`** · **Worktree: A**

Executar §3.1, §3.2. Confirmar as cinco linhas esperadas. Depois §3.3 (sobe o Metro) e §3.4
(prova de porta).

---

### `G1` · Inventário **ANTES** + conferência do acervo

**Metro: SIM (8081)** · **Worktree: A** · **`HEAD`: §11.1** · Aparelho: **iPad**

| | |
|---|---|
| **Estado inicial** | App **já instalado**, com acervo real; nenhuma obra aberta |
| **Ações** | 1. Abrir o app. 2. Executar o **Nível 1** de §6.1 (4 capturas). 3. Conferir que existe **pelo menos uma obra do Colorir salva antes da Fase 6** e **pelo menos uma obra do Ateliê `v:2` antiga**. 4. Anotar os números em §11.4 |
| **Esperado** | Coleção, galeria e contador legíveis; acervo antigo presente |
| **`FAIL`** | Não existir obra anterior à Fase 6 → **pare**: os casos 1, 14, 15, 16, 13, §28 #7 e #9 ficam sem insumo e a campanha não pode começar |
| **Evidência** | 4 capturas + números anotados |
| **Cobre** | `TK-A-062` (metade "antes") |

---

### `G2` · Mapa, faixa, sessão e áudio — **uma única abertura do app**

**Metro: SIM (8081)** · **Worktree: A** · Aparelho: **iPad** · Janela: tela cheia **e** Split View

| | |
|---|---|
| **Estado inicial** | App recém aberto, **sem** obra do canvas aberta |
| **Ações** | 1. **`CN-2`:** ir ao mapa **sem rolar** e capturar a abertura. 2. **§28 #1:** rolar até um ponto arbitrário; **girar**. 3. **§28 #2:** girar de volta. 4. Usar "Ver mapa" e conferir a região ativa. 5. **`CN-6` + §28 #6 (parcial):** entrar em Split View e **arrastar o divisor** cruzando `600dp`, ida e volta, com a janela do Metro visível. 6. Conferir rota/pilha/aba após girar e após arrastar. 7. **`CN-4` (i) / §28 #10:** iniciar um jogo, deixá lo em andamento, **girar** e alternar para outro app e voltar — repetir nos **quatro** jogos. 8. **`CN-4` (ii) / §28 #11:** com áudio tocando, girar, mandar ao segundo plano, esperar, voltar |
| **Esperado** | Posição do mapa **permanece**; região ativa acompanha; sem salto ao girar de volta; largura contínua ao arrastar; contador de montagem **não muda**; rota/aba idênticas; jogo **não reinicia**; áudio sem corte anômalo |
| **`FAIL`** | Mapa volta ao topo ou salta; região ativa erra; trava/salto ao arrastar; `MainTabs MONTADO #N+1` aparece; jogo reinicia; áudio corta e não retoma |
| **Evidência** | **1 vídeo contínuo** cobrindo os passos 2→8 (o PLAN §28 exige registro em vídeo) · **1 captura** da abertura (`CN-2` "depois") · **texto copiado** do console do Metro (`CN-6`) |
| **Cobre** | §28 **#1, #2, #10, #11**; parte de **#6**; `CN-2` (depois), `CN-4`, `CN-6`; `TK-A-017`..`TK-A-020`, `TK-A-022`, `TK-A-023`, `TK-A-025`, `TK-A-028`, `TK-A-029` |

---

### `G3` · Colorir com obra **ANTIGA** — o coração da campanha

**Metro: SIM (8081)** · **Worktree: A** · Aparelho: **iPad**

> Executar **três vezes**, uma por formato de obra, para fechar os casos 14, 15 e 16. Se o
> inventário (`L-1`) não permitir distinguir formatos, use o critério observável: **(a)** obra
> criada há mais tempo, anterior à Fase 6 → caso 14/15; **(b)** obra do Colorir 60 salva
> recentemente → caso 16 (ponteiro `v:3`). Registre em §11.4 qual obra foi usada em cada caso.

| | |
|---|---|
| **Estado inicial** | Mapa aberto, retrato, tela cheia |
| **Ações** | 1. **Caso 1 / §28 #7:** abrir uma obra salva **antes** da mudança, em **retrato**. 2. **§28 #3:** pintar mais um pouco. 3. **Caso 2:** **girar** para paisagem, continuar pintando. 4. **Caso 3:** girar de volta a retrato. 5. **Caso 4 / §28 #6:** entrar em **Split View estreito**, depois **Slide Over**. 6. **Caso 5:** voltar a **tela cheia em paisagem**. 7. **Caso 8 / §28 #4:** abrir e fechar o **Centro de Controle** sobre o canvas. 8. **Caso 7 / §28 #5:** mandar ao **segundo plano**, esperar ~60 s, voltar. 9. Sair **sem salvar** |
| **Esperado** | A obra abre com a **pintura presente e alinhada ao *lineart***; ao girar, proporção preservada (`contain` + *letterbox*), tinta e *lineart* **juntos**; ao voltar, estado **idêntico ao passo 1**; nada recortado ao estreitar; **nada esticado** ao ampliar (moldura, não distorção); tocar na faixa de sobra **não** cria traço; nenhum recarregamento silencioso após Centro de Controle ou segundo plano |
| **`FAIL`** | Canvas branco onde havia obra; tinta deslocada do contorno; qualquer perda de píxel; obra esticada/recortada; traço órfão na moldura; recarregamento que apaga o trabalho |
| **Evidência** | **1 vídeo contínuo** por execução (passos 1→8) **+ capturas** nos passos 1, 3, 4, 5, 6 (deformação, escala e recorte são exatamente o que captura prova melhor que vídeo) |
| **Cobre** | Casos **1, 2, 3, 4, 5, 7, 8, 14, 15, 16**; §28 **#3, #4, #5, #6, #7**; `TK-A-063`..`TK-A-070`, `TK-A-076`..`TK-A-078`, `TK-A-097`, `TK-A-010`, `TK-A-016`, `TK-A-032`, `TK-A-033`, `TK-A-035`, `TK-A-085` |

---

### `G4` · Leitura pura — abrir **sem desenhar** e reabrir após encerrar o app

**Metro: SIM (8081)** · **Worktree: A** · Aparelho: **iPad**

| | |
|---|---|
| **Estado inicial** | Fim de `G3`; nada salvo desde `G1` |
| **Ações** | 1. **Nível 1 de §6.1** (captura curta: coleção + contador). 2. **Caso 10:** abrir uma obra, **não desenhar nada**, sair. 3. **Caso 6:** **encerrar o app** (deslizar para cima no seletor), reabrir, abrir a mesma obra. 4. **Nível 1 de §6.1** de novo |
| **Esperado** | Obra íntegra nas duas aberturas; **nenhuma gravação ocorreu** — contadores, ordem da galeria e vagas do C60 **idênticos** aos do passo 1 |
| **`FAIL`** | Contador muda; ordem da galeria muda; `updatedAt` visível muda; vaga que tinha arte deixa de ter |
| **Evidência** | 2 conjuntos de captura (antes/depois do ciclo) — **observação textual comparável basta; não precisa vídeo** |
| **Cobre** | Casos **6** e **10**; `TK-A-068`, `TK-A-072`, `TK-A-042` |

---

### `G5` · Gravação *write-forward*, dez rotações e nitidez

**Metro: SIM (8081)** · **Worktree: A** · Aparelho: **iPad**

| | |
|---|---|
| **Estado inicial** | Fim de `G4` |
| **Ações** | 1. **Caso 11:** abrir obra antiga, **pintar**, **salvar**, **reabrir**. 2. **Caso 17:** repetir com uma obra do Colorir 60 (que grava `paintSchemaVersion` + `layoutVersion`), salvar e reabrir. 3. **`E3`:** com obra complexa aberta, **dez** rotações consecutivas retrato↔paisagem; capturar a **1ª** e a **10ª**. 4. **`TA-5R`:** com a camada de tinta **ampliada** em tela grande, examinar a **borda do balde** contra o *lineart* em `multiply`. 5. **Caso 12 (parcela física executável):** iniciar um salvamento e **matar o app durante a gravação** (deslizar para cima no exato momento); reabrir e conferir |
| **Esperado** | A representação nova é criada, validada, **relida** e só então promovida; o registro anterior **não** é destruído; a 10ª rotação é **equivalente** à 1ª (sem degradação acumulada); a borda do balde aparece **limpa**, sem serrilha nem halo; após o *kill*, o **registro anterior continua vigente** e a obra abre |
| **`FAIL`** | Obra reaberta perde pintura; degradação visível entre a 1ª e a 10ª; borda do balde borrada/serrilhada em tela grande; após o *kill*, obra vazia, truncada ou irrecuperável |
| **Evidência** | **Capturas** da 1ª e 10ª rotação (comparação lado a lado) · **captura ampliada** da borda do balde (`TA-5R`) · **vídeo curto** do passo 5 (o *kill* é continuidade e precisa ser visto) |
| **Cobre** | Casos **11**, **17**, **`E3`**, parcela física do **12**; `TA-5R`; `TK-A-073`, `TK-A-079`, `TK-A-102`, `TK-A-050` |
| **Efeito colateral necessário** | Ao fim de `G5` o acervo está **misto** (formato antigo + formato novo) — pré condição de `G7` |

---

### `G6` · Ateliê, galeria e acervo misto

**Metro: SIM (8081)** · **Worktree: A** · Aparelho: **iPad**

| | |
|---|---|
| **Estado inicial** | Fim de `G5` |
| **Ações** | 1. **§28 #8 / `E2`:** abrir o Ateliê, desenhar, **carimbar**, **girar**. 2. **Caso 7/8 no Ateliê:** Centro de Controle e segundo plano com a composição aberta. 3. **§28 #9:** abrir obra `v:2` **antiga** do Ateliê, girar, **salvar**, reabrir. 4. **`E1`:** criar obra nova e reabri la **sem mudar a janela**. 5. **`E6`:** abrir a **galeria** com o acervo misto; conferir miniaturas; abrir **uma de cada formato** |
| **Esperado** | Composição **conservada** (não recortada nem deslocada); traços e carimbos reaparecem nas **mesmas posições lógicas**; nenhuma perda ao salvar a obra antiga; na `E1` **nada muda** (caso controle); a galeria exibe **os dois formatos** e **nenhuma migração em massa** ocorre |
| **`FAIL`** | Composição deslocada/recortada; carimbo migra de posição; obra `v:2` perde elementos ao salvar; galeria reescreve registros só por ser aberta (detectável pela ordem do índice e pelos contadores) |
| **Evidência** | **Capturas** antes/depois de cada rotação (deslocamento é visual) · **1 vídeo curto** do passo 2 (*background*) · **captura** da galeria completa |
| **Cobre** | §28 **#8, #9**; `E1`, `E2`, `E6`; `TK-A-034`, `TK-A-011`, `TK-A-048`..`TK-A-050`, `TK-A-100`, `TK-A-101`, `TK-A-105` |

---

### `G-OPP` · Caso 9 — término do processo de conteúdo (**oportunístico, o roteiro inteiro**)

**Não é um grupo com horário.** Durante `G2`–`G6`, manter a janela do Metro visível. **Se** aparecer:

```
[ColoringCanvas] PROCESSO DE CONTEUDO DA WEBVIEW TERMINOU · origem=ios:onContentProcessDidTerminate
  · ocorrencia=#1 · quando=… · EVENTO OBSERVADO, CAUSA NAO DETERMINADA
```

(ou a variante `[AtelierCanvas]`), **copiar a linha inteira** e conferir imediatamente que a obra
**continua íntegra na tela**.

- **`FAIL`:** a linha aparece **e** a obra é perdida, zerada ou recarregada em branco.
- **Se nunca aparecer:** registrar literalmente **"não reproduzido"**. É um veredito válido — o
  próprio `TK-A-071` prevê *"declaração explícita de não reproduzido"*.
- **PROIBIDO** escrever "causa confirmada" (guardrail `FD-12`). O registro descreve o **evento**,
  nunca a causa; não prova, não confirma e não refuta `P-164`.
- **Evidência:** a linha copiada + uma captura da obra intacta.

---

### `G7` · **Caso 13** — *rollback* do código com acervo já misto

**Metro: SIM — porta 8082** · **Worktree: B (`C:\tmp\ptf_f6_CASO13_ROLLBACK_wt`)** · **`HEAD`
esperado: `a190b3e`** · **Expo Go: PROIBIDO** · **Novo *build* nativo: NÃO** · Aparelho: **iPad**

> **Executar somente depois de `G5` e `G6`.** O caso exige acervo com obras **nos dois formatos** —
> é isso que `G5`/`G6` produzem. Executá lo antes o esvazia.

| | |
|---|---|
| **Estado inicial** | Acervo misto no aparelho; Metro 8081 **derrubado** |
| **Ações** | 1. Executar §3.5 (derrubar 8081 → provar B → subir 8082). 2. Executar §3.4 e confirmar `8081 parado / 8082 ATIVO`. 3. No *dev client*: sair do projeto e conectar em `:8082`. 4. **Confirmar o cenário pelo discriminador de §2.2** — trocar de aba e girar; **nenhuma** linha `[AppNavigator] MainTabs MONTADO` pode aparecer. **Se aparecer, você está em A: pare.** 5. Abrir uma obra do **formato antigo**. 6. Abrir uma obra do **formato novo** (salva em `G5`). 7. Abrir a **galeria** e a **coleção do C60**. 8. **`CN-2` "antes":** ir ao mapa **sem rolar** e capturar a abertura. 9. Executar o **Nível 1 de §6.1** |
| **Esperado** | O caminho revertido **consome o formato anterior** normalmente; **nenhuma obra fica órfã**; nada é apagado; a captura do passo 8 é **indistinguível** da captura `CN-2` "depois" feita em `G2` |
| **`FAIL`** | Qualquer obra some, aparece em branco ou é apagada pelo código anterior; a coleção do C60 perde vaga; a abertura do mapa difere visivelmente entre A e B |
| **Evidência** | **Vídeo** dos passos 5→7 (a transição de cenário precisa ser vista) · **captura** do passo 8 (`CN-2` "antes") · **captura** do passo 9 · **texto** do PowerShell de §3.5 comprovando `a190b3e` |
| **Cobre** | Caso **13** (`TK-A-075`) e a metade "antes" de **`CN-2`** |
| **Ao terminar** | Executar §3.6 (voltar ao cenário A). **Não** remova o worktree antes de o resultado estar registrado em §11.2 |

---

### `G8` · Regressão em **telefone** — §28 #17 (parcela `SG-A`)

**Metro: SIM (8081)** · **Worktree: A** · Aparelho: **telefone** (retrato, faixa compacta)

| | |
|---|---|
| **Estado inicial** | Telefone com o *development build* compatível e Metro A no ar |
| **Ações** | Percorrer **mapa, história, Colorir, Ateliê, galeria e os quatro jogos** em retrato, comparando com o comportamento anterior a `F6-R3` |
| **Esperado** | **`CN-1`** — **nada mudou**. Nenhuma diferença perceptível atribuível a `F6-R3` |
| **`FAIL`** | Qualquer diferença visível em telefone atribuível a `F6-R3` |
| **Evidência** | **Capturas** de cada superfície (a comparação é estática) · vídeo apenas se algo parecer diferente |
| **Cobre** | §28 **#17** parcela `SG-A`; `TK-A-098`; `CN-1` |
| **Nota** | Se o telefone for **Android**, ele usa o *build* `c05a5800` — o **único provado** (§1.3) — e destrava `L-1`/`L-2` via `adb` |

---

### `G9` · Fechamento — inventário **DEPOIS** e consolidação

**Metro: SIM (8081)** · **Worktree: A** · Aparelho: **iPad**

| | |
|---|---|
| **Ações** | 1. Repetir o **Nível 1 de §6.1** exatamente como em `G1`. 2. Comparar com §11.4 usando §6.2 (esperado) e §6.3 (corrupção). 3. Preencher §11.1, §11.2 e §11.3. 4. Registrar em §11.5 as decisões pendentes |
| **Esperado** | Contagem e integridade **idênticas**, salvo o que a própria sessão salvou deliberadamente |
| **`FAIL`** | Qualquer item de §6.3 observável no Nível 1 |
| **Evidência** | 4 capturas + tabela §11.4 preenchida |
| **Cobre** | `TK-A-062` (metade "depois"), `TK-A-060`, `TK-A-080` |

---

## 9. Fronteira de escopo durante o teste — o que fazer com o que aparecer

Nem tudo que aparecer no aparelho pertence a `F6-R3`. Classifique **antes** de agir:

| Categoria | O que é | O que fazer |
|---|---|---|
| **A** | Ciclo de vida, *resize*, *viewport* global, perda de estado — **pertence a `F6-R3`** | Registra e **pode bloquear `F6-SG-A`**. É `FAIL` da campanha |
| **B** | Defeito específico do canvas que pertence à **F9** | Registrar em **`F9-C60-LFC-01`**. **Não reconstrua F9 durante a Fase 6** |
| **C** | Pertence a outro bloco futuro da Fase 6 (`F6-R2`, `F6-R1`, `B2`) | Registrar na **task proprietária**. **Não antecipe implementação** |
| **D** | Cosmético, sem relação com o contrato | Registrar **somente se houver valor real**. **Não amplie `F6-R3`** |

Na dúvida entre A e B: se o defeito some ao voltar para o cenário B (`G7`), é **A**. Se persiste nos
dois cenários, é **B** ou **C** — não é regressão de `F6-R3`.

---

## 10. Política de evidência — proporcional ao risco

| Tipo | Quando | Por quê |
|---|---|---|
| **Vídeo contínuo** | §28 #1–#11 e #17; `CN-4`; caso 13; *kill* durante gravação | O PLAN §28 (linha 1045) **exige** literalmente *"registro em vídeo, não só em captura"* para a sequência §28. Além disso, continuidade através de *background*/*lock*/*unlock* é justamente o que captura não prova |
| **Captura** | Deformação, salto de escala, *safe area*, alinhamento, recusa visual, nitidez (`TA-5R`), `E3` 1ª×10ª, `CN-2` | Diferença **estática**: captura prova melhor e mais barato que vídeo |
| **Texto copiado** | `CN-6` (contador de montagem), caso 9 (linha de término), inventário Nível 1/2 | Já é verificável por si; vídeo de um terminal é desperdício |

**Um vídeo por grupo cobre todos os cenários §28 daquele grupo** — é assim que a exigência do PLAN
e a economia operacional convivem. Total previsto: **~5 vídeos**, não 17.

> ⚠️ **Precedência declarada:** a instrução de sessão pede não exigir vídeo onde captura basta; o
> PLAN §28 exige vídeo para a sequência §28. Pela ordem de precedência documental (PLAN > instrução
> de sessão), **o vídeo dos cenários §28 é mantido** — mas agrupado ao mínimo. Fora de §28, vale a
> política proporcional.

---

## 11. Tabelas de resultado — **para o fundador preencher**

### 11.1 Estado verificado no início e no fim

| | Valor lido | Conferido |
|---|---|---|
| `HEAD` do worktree A no **início** | `______________` | ☐ |
| `HEAD` do worktree A no **fim** | `______________` | ☐ |
| `git status --porcelain` no fim | ☐ vazio ☐ com alterações: `______________` | ☐ |
| `HEAD` do worktree B | `a190b3e` | ☐ |
| Worktree B removido ao final | ☐ sim ☐ não | ☐ |
| Nenhum *push* · nenhum *merge* · nenhum *upstream* | ☐ confirmado | ☐ |

### 11.2 Matriz §28.1 — **17 obrigatórios** (um `FAIL` impede `F6-SG-A`)

| # | Task | Caso | Grupo | Veredito | Aparelho | Janela | Evidência | Observação |
|---|---|---|---|---|---|---|---|---|
| 1 | `TK-A-063` | Obra antiga em retrato | `G3` | ☐ PASS ☐ FAIL | | | | |
| 2 | `TK-A-064` | Mesma obra em paisagem | `G3` | ☐ PASS ☐ FAIL | | | | |
| 3 | `TK-A-065` | Retorno a retrato | `G3` | ☐ PASS ☐ FAIL | | | | |
| 4 | `TK-A-066` | *Viewport* menor | `G3` | ☐ PASS ☐ FAIL | | | | |
| 5 | `TK-A-067` | *Viewport* maior | `G3` | ☐ PASS ☐ FAIL | | | | |
| 6 | `TK-A-068` | Reabertura após encerrar | `G4` | ☐ PASS ☐ FAIL | | | | |
| 7 | `TK-A-069` | *Background* / *foreground* | `G3` | ☐ PASS ☐ FAIL | | | | |
| 8 | `TK-A-070` | Centro de Controle | `G3` | ☐ PASS ☐ FAIL | | | | |
| 9 | `TK-A-071` | Término do processo | `G-OPP` | ☐ PASS ☐ FAIL ☐ **não reproduzido** | | | | |
| 10 | `TK-A-072` | Obra sem modificação | `G4` | ☐ PASS ☐ FAIL | | | | |
| 11 | `TK-A-073` | Salva no formato novo | `G5` | ☐ PASS ☐ FAIL | | | | |
| 12 | `TK-A-074` | Falha durante a gravação | `G5`/`L-2` | ☐ PASS ☐ FAIL ☐ **parcial (`L-2`)** | | | | |
| 13 | `TK-A-075` | *Rollback* com acervo misto | `G7` | ☐ PASS ☐ FAIL | | | | |
| 14 | `TK-A-076` | Legado `v1`/`v2` | `G3` | ☐ PASS ☐ FAIL | | | | |
| 15 | `TK-A-077` | *Payload* visual atual | `G3` | ☐ PASS ☐ FAIL | | | | |
| 16 | `TK-A-078` | Ponteiro `v:3` | `G3` | ☐ PASS ☐ FAIL | | | | |
| 17 | `TK-A-079` | Novo *schema* lógico | `G5` | ☐ PASS ☐ FAIL | | | | |

**Casos adicionais — `E1`..`E6`** (um `FAIL` aqui **não** bloqueia automaticamente, mas **não pode
ser omitido**):

| # | Task | Caso | Grupo | Veredito | Evidência | Observação |
|---|---|---|---|---|---|---|
| `E1` | `TK-A-100` | Mesma janela (caso controle) | `G6` | ☐ PASS ☐ FAIL | | |
| `E2` | `TK-A-101` | Vetorial atravessando janela | `G6` | ☐ PASS ☐ FAIL | | |
| `E3` | `TK-A-102` | Dez rotações | `G5` | ☐ PASS ☐ FAIL | | |
| `E4` | `TK-A-103` | *Lineart* divergente | `L-2` | ☐ PASS ☐ FAIL ☐ **bloqueado (`L-2`)** | | |
| `E5` | `TK-A-104` | *Payload* corrompido | `L-2` | ☐ PASS ☐ FAIL ☐ **bloqueado (`L-2`)** | | |
| `E6` | `TK-A-105` | Galeria com acervo misto | `G6` | ☐ PASS ☐ FAIL | | |

### 11.3 Cenários §28 e controles negativos

| Item | Task | Grupo | Veredito | Evidência | Observação |
|---|---|---|---|---|---|
| §28 #1 | `TK-A-017`/`018`/`019`/`023` | `G2` | ☐ PASS ☐ FAIL | | |
| §28 #2 | `TK-A-018` | `G2` | ☐ PASS ☐ FAIL | | |
| §28 #3 | `TK-A-035`/`016` | `G3` | ☐ PASS ☐ FAIL | | |
| §28 #4 | `TK-A-010`/`012` | `G3` | ☐ PASS ☐ FAIL | | |
| §28 #5 | `TK-A-010`/`014` | `G3` | ☐ PASS ☐ FAIL | | |
| §28 #6 | `TK-A-032`/`033`/`035`/`085` | `G2`+`G3` | ☐ PASS ☐ FAIL | | |
| §28 #7 | **`TK-A-097`** (`CN-3`) | `G3` | ☐ PASS ☐ FAIL | | |
| §28 #8 | `TK-A-034` | `G6` | ☐ PASS ☐ FAIL | | |
| §28 #9 | `TK-A-048`/`049`/`050`/`011` | `G6` | ☐ PASS ☐ FAIL | | |
| §28 #10 | `TK-A-028`/`029` | `G2` | ☐ PASS ☐ FAIL | | |
| §28 #11 | `TK-A-025` | `G2` | ☐ PASS ☐ FAIL | | |
| §28 #17 (`SG-A`) | **`TK-A-098`** (`CN-1`) | `G8` | ☐ PASS ☐ FAIL | | |
| **`CN-2`** | `TK-A-020` | `G2`+`G7` | ☐ PASS ☐ FAIL | | |
| **`CN-4`** | `TK-A-028` | `G2` | ☐ PASS ☐ FAIL | | |
| **`CN-6`** | `TK-A-022` | `G2` | ☐ PASS ☐ FAIL | | |
| `TA-5R` (nitidez em tablet) | — | `G5` | ☐ PASS ☐ FAIL | | |
| Painéis de recusa | `TK-A-045`/`051` | `L-2` | ☐ PASS ☐ FAIL ☐ **bloqueado (`L-2`)** | | |

### 11.4 `TK-A-062` — inventário antes × depois (Nível 1)

| Medida | **ANTES** (`G1`) | **DEPOIS** (`G9`) | Diferença esperada? |
|---|---|---|---|
| Vagas com arte na Coleção C60 (`/3`) | `___` | `___` | ☐ sim ☐ **não → FAIL** |
| Itens na Galeria do Ateliê | `___` | `___` | ☐ sim ☐ **não → FAIL** |
| Contador "N arte(s) guardada(s)" (Brincar) | `___` | `___` | ☐ sim ☐ **não → FAIL** |
| Histórias concluídas (Área dos Pais) | `___` | `___` | ☐ sim ☐ **não → FAIL** |
| Histórias em andamento | `___` | `___` | ☐ sim ☐ **não → FAIL** |
| Primeiro item da galeria (título) | `__________` | `__________` | ☐ sim ☐ **não → FAIL** |
| Alguma miniatura quebrada? | ☐ não ☐ sim | ☐ não ☐ sim | qualquer "sim" → **FAIL** |

Obras usadas em cada caso de formato:

| Caso | Obra escolhida | Como foi identificada |
|---|---|---|
| 14 (legado `v1`/`v2`) | `__________` | |
| 15 (*payload* visual atual) | `__________` | |
| 16 (ponteiro `v:3`) | `__________` | |

### 11.5 Decisões que dependem do fundador

| # | Decisão | Escolha |
|---|---|---|
| **`B-1`** | *Development build* iOS: gerar novo a partir do HEAD, ou usar o existente com o vão registrado? | ☐ (a) gerar novo ☐ (b) usar o existente, vão registrado |
| **`L-3`** | Existe **telefone Android** disponível? (destravaria `L-1` e `L-2` por `adb`) | ☐ sim ☐ não |
| **`L-1`** | Se não houver: `TK-A-062` fica no Nível 1, com os itens 4, 5, 6, 7, 9 e 10 de §6.3 **não verificáveis** | ☐ aceito ☐ criar ferramenta de inventário (nova task, fora de `F6-R3`) |
| **`L-2`** | Casos 12 (integral), `E4`, `E5` e painéis de recusa ficam com **parcela física bloqueada** | ☐ aceito com vão registrado ☐ criar afordância de injeção (nova task, fora de `F6-R3`) |

---

## 12. O que permanece bloqueado até o retorno físico

1. **`F6-SG-A`** — não concedido. Nenhum `PASS` foi declarado por esta sessão.
2. **`TK-A-062`** — pendente (`G1`/`G9`), com o vão de `L-1` declarado.
3. **Os 17 casos obrigatórios de §28.1** — todos pendentes de aparelho.
4. **`E1`..`E6`** — pendentes; `E4` e `E5` adicionalmente bloqueados por `L-2`.
5. **Cenários §28 #1–#11 e #17** — todos pendentes.
6. **`CN-2`, `CN-4`, `CN-6`** — parcelas físicas pendentes; `TK-A-060` não pode fechar antes.
7. **Painéis de recusa** (`TK-A-045`, `TK-A-051`) — parcela física bloqueada por `L-2`.
8. **`TA-5R` — nitidez em tablet** — pendente; é o **único** item que nenhum arnês em Node prova.
9. **`TK-A-080`, `TK-A-081`, `TK-A-083`, `TK-A-084`** — dependem dos resultados acima.
10. **`TK-A-013`** e **`TK-A-082`** — bloqueados por `P8`/§33 (tablet Android indisponível). **`SD-1`
    permanece NÃO CONCEDÍVEL.**
11. **`F6-R2`, `F6-R1` e `B2`** — **intocados**. A espera pela validação humana **não** é
    autorização para iniciar a trilha seguinte.
