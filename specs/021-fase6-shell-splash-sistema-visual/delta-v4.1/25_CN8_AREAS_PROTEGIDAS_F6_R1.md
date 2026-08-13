# `CN-8` em `F6-R1` — nenhuma área protegida tocada (`TK-C-064`)

> **Pacote:** `BLOCO 6` · `F6-SG-C` · **Commit deste artefato:** `C-GOV1` ·
> **Mudança de código esperada:** **nenhuma** — evidência mecânica.

`CN-8` (PLAN §24) exige que o pacote `F6-R1` não tenha tocado **nenhum** *asset*,
manifesto, história, conquista ou regra de acesso. A prova não é uma afirmação: é a lista
de arquivos de **cada** *commit*, conferida contra a lista de áreas protegidas.

---

## 1. Nota de contagem e de método

**Contagem.** `TK-C-064` fala em **onze** saídas — `C-C1`..`C-C10` mais `C-GOV1`. Esses são
**rótulos lógicos**, não *commits* do Git. O arco real tem **29 *commits***, de `6b78b34` a
`77e1e19`, porque vários rótulos se materializaram em mais de um *commit* atômico e nove
*commits* não carregam rótulo no assunto:

| Rótulo | *Commits* |
|---|---|
| `C-C1` | 1 — `6b78b34` (é o material de `TK-C-001`/`TK-C-002`; o assunto **não** traz o rótulo) |
| `C-C2` | 2 — `1cd30df`, `c44ac28` |
| `C-C3` | 3 — `03426d7`, `957be23`, `9272760` |
| `C-C4` | 3 — `1f72438`, `4130aca`, `591bc57` |
| `C-C5` · `C-C6` · `C-C8` · `C-C10` | 1 cada — `3ef00af` · `f825459` · `76cfdf9` · `e2702d2` |
| `C-C7` | 2 — `f08f3aa`, `fd88ab9` |
| `C-C9` | 2 — `a1b4380`, `06ab3ad` |
| `C-GOV1` | 4 — `a9d1340`, `237fa8e`, `3ea12e8`, `77e1e19` |
| **sem rótulo no assunto** | 9 — `b7e496d`, `eb11061`, `d23b52f`, `55d2809`, `a4b67a6`, `1801405`, `f6e6fbd`, `da16b18`, e o próprio `6b78b34` |

Conferir 29 é **superconjunto** de conferir 11: nenhuma saída foi omitida para fechar a
conta.

**Método.** `git diff --cached --name-only` só é observável **no momento** do *commit*, e
foi de fato exibido e conferido antes de cada um deles. Retrospectivamente, o equivalente
verificável por terceiros é `git show --name-only --format='' <sha>`, que devolve
exatamente o mesmo conjunto de caminhos. É essa a saída anexada no §2.

---

## 2. As saídas, *commit* a *commit*

```
$ for c in $(git log --reverse --format=%h e393768..HEAD); do
    echo "### $c"; git show --name-only --format='' $c | sed '/^$/d'; done

### 6b78b34                                    ### f08f3aa
    scripts/smoke.js                               scripts/smoke.js
    scripts/testing/windowBandHarness.js           scripts/testing/surfaceArchetypeHarness.js
    src/hooks/useWindowBand.js                     src/components/layout/EditorialSurface.js
### b7e496d                                        src/components/layout/HubSurface.js
    specs/.../05_TASKS_DELTA_F6.md                 src/components/layout/displayType.js
### 1cd30df                                        src/theme/tokens.js          ← Q9
    scripts/smoke.js                           ### 591bc57
    src/components/BeniGuideOverlay.js             scripts/smoke.js
    src/components/ui/ContentContainer.js      ### fd88ab9
    src/navigation/AppNavigator.js                 scripts/smoke.js
    src/screens/ParentAreaScreen.js                src/theme/tokens.js          ← Q9
    src/screens/PostStoryHubScreen.js          ### 76cfdf9
    src/screens/QuizScreen.js                      src/components/TabletSidebar.js
    src/screens/ReflectionScreen.js            ### 237fa8e
    src/screens/StoryBookScreen.js                 specs/.../16_TK_C_022_NAO_INVASAO_B2.md
    src/screens/StoryDetailScreen.js           ### 06ab3ad
    src/screens/TrophiesScreen.js   ← §4           scripts/smoke.js
### c44ac28                                    ### eb11061
    scripts/smoke.js                               scripts/smoke.js
    scripts/testing/surfaceArchetypeHarness.js ### 3ea12e8
    src/components/layout/EditorialSurface.js      specs/.../17_MUTANTES_BARRA_LATERAL...md
    src/components/layout/GameSurface.js       ### d23b52f
    src/components/layout/HubSurface.js            specs/.../18_GEOMETRIA_CALLOUT_LATERAL...md
    src/components/layout/ImmersiveSurface.js  ### 55d2809
### 03426d7                                        scripts/smoke.js
    scripts/smoke.js                               src/components/BeniGuideOverlay.js
    scripts/testing/surfaceArchetypeHarness.js     src/navigation/AppNavigator.js
    src/components/layout/EditorialSurface.js  ### a4b67a6
    src/components/ui/ContentContainer.js          scripts/smoke.js
### 957be23                                    ### 1801405
    scripts/smoke.js                               specs/.../19_INVENTARIO_ANTES_DEPOIS_F6_R1.md
    scripts/testing/surfaceArchetypeHarness.js ### f6e6fbd
    src/components/layout/EditorialSurface.js      specs/.../20_ORIENTACAO_MECANISMO_E_ROTAS...md
### 9272760                                    ### e2702d2
    scripts/smoke.js                               app.json
    src/components/layout/EditorialSurface.js      plugins/withAndroidTabletOrientation.js
    src/screens/ParentAreaScreen.js            ### da16b18
    src/screens/PostStoryHubScreen.js              specs/.../21_ROTA_C_ORIENTACAO_PROVA...md
    src/screens/ReflectionScreen.js            ### 77e1e19
    src/screens/StoryDetailScreen.js               specs/.../22_PROVAS_VERMELHAS...md
### 1f72438                                        specs/.../23_VERIFICACOES_FINAIS...md
    scripts/smoke.js                               specs/.../24_RELATORIO_F6_SG_C.md
    scripts/testing/surfaceArchetypeHarness.js
    src/components/layout/HubSurface.js
    src/screens/AtelierGalleryScreen.js
    src/screens/BrincarScreen.js
    src/screens/HomeScreen.js
    src/screens/TrophiesScreen.js   ← §4
### 4130aca
    src/screens/AtelierGalleryScreen.js
### 3ef00af
    scripts/smoke.js
    src/components/layout/ImmersiveSurface.js
    src/screens/AtelierCanvasScreen.js
    src/screens/ColoringScreen.js
    src/screens/StoryBookScreen.js
### f825459
    scripts/smoke.js
    src/components/layout/CenteredContent.js
    src/components/layout/GameSurface.js
### a1b4380
    scripts/smoke.js
### a9d1340
    specs/.../15_Q4_DETERMINACAO_DOS_TOKENS.md
```

**Só duas linhas do arco inteiro carregam marcação:** `src/theme/tokens.js` (área protegida
**autorizada**, §3.1) e `src/screens/TrophiesScreen.js` (o caso que exige declaração
explícita, §4).

---

## 3. Inventário consolidado e varredura mecânica

`git diff --name-only e393768..77e1e19` devolve **40 arquivos**:

| Grupo | Arquivos | Área protegida? |
|---|---|---|
| **Configuração / *plugin* nativo** | `app.json` · `plugins/withAndroidTabletOrientation.js` | não |
| **Portões e arneses** | `scripts/smoke.js` · `scripts/testing/surfaceArchetypeHarness.js` · `scripts/testing/windowBandHarness.js` | não |
| **Governança** | 11 arquivos em `specs/021-.../delta-v4.1/` (`05_TASKS` + artefatos `15`–`24`) | não |
| **`src/components/layout/`** (6) | `CenteredContent` · `displayType` · `EditorialSurface` · `GameSurface` · `HubSurface` · `ImmersiveSurface` | não |
| **Outros componentes** (3) | `BeniGuideOverlay` · `TabletSidebar` · `ui/ContentContainer` | não |
| **Hook / navegação** (2) | `hooks/useWindowBand.js` · `navigation/AppNavigator.js` | não |
| **Telas** (12) | `AtelierCanvas` · `AtelierGallery` · `Brincar` · `Coloring` · `Home` · `ParentArea` · `PostStoryHub` · `Quiz` · `Reflection` · `StoryBook` · `StoryDetail` · `Trophies` | não — ver §4 |
| ***Design system*** (1) | `src/theme/tokens.js` | **SIM — autorizada** (`Q9`) |

**5 + 11 + 6 + 3 + 2 + 12 + 1 = 40.** `src/components/layout/AppScreen.js` e
`src/components/layout/SafeScreenHeader.js`, embora estejam na lista `MODULOS_LAYOUT`
avaliada por `G-RSP-4`, **não** foram tocados pelo pacote — são vigiados, não modificados.

### 3.1 A varredura

```
$ git diff --name-only e393768..HEAD | grep -E \
    "^assets/|^src/data/stories/|accessControl|achievement|Achievement|manifest|Manifest|/audio/|/scenes/|/cenas/"
→ (nenhuma ocorrência)
```

| Área protegida | Ocorrências no arco |
|---|---|
| `assets/**` (incl. `assets/stories/*`) | **0** |
| Manifestos de áudio e de cenas | **0** |
| `src/data/stories/**` | **0** |
| Serviços/armazenamento de conquistas | **0** |
| `accessControl` / controle de acesso a conteúdo | **0** |
| *Paywall* e progresso | **0** |
| `src/theme/tokens.js` (*design system*) | **2 *commits*** — `f08f3aa`, `fd88ab9` — **autorizados** |

### 3.2 A única área protegida que aparece, e por quê

`src/theme/tokens.js` é *design system* e portanto área protegida. Aparece
**legitimamente**: `Q9` autoriza expressamente a mudança, `TK-C-061` e `TK-C-016`..`018`
são as tasks, e o *diff* inteiro está periciado item a item no artefato `23` §3 — **+44/−2,
nenhum símbolo removido, nenhum valor pré-existente alterado**. A autorização é *de jure*,
não uma leitura generosa da regra.

**Erro corrigido no caminho.** A conferência mecânica desta task mediu o *diff* de novo e
achou **+44/−2**, contra **+40/−2** na primeira redação do artefato `23`. Errata aberta
naquele artefato, `git diff --numstat` anexado. O número **não** sustenta nenhuma
conclusão de `TK-C-044` — o que sustenta é a tabela item a item —, mas um número errado num
artefato de prova é dívida, não detalhe. A mensagem de `77e1e19` carrega o valor antigo e
**não** é reescrita.

---

## 4. O caso que exige declaração explícita: `TrophiesScreen.js`

A tela de **Conquistas** foi tocada em dois *commits* (`1cd30df`, `1f72438`): **+46/−28**.
"Conquistas" está na lista de áreas protegidas, então a distinção precisa ser feita em voz
alta, e não assumida.

**O que foi tocado é a TELA; o que é protegido é o DOMÍNIO.** As 12 linhas alteradas que
sequer mencionam `achievement`/`Achievement` são, uma a uma: comentários de `TK-C-008`, a
remoção da *prop* `isTablet` da assinatura de `AchievementCard`
(`{ achievement, unlocked, ctx, isTablet, onPress }` → `{ achievement, unlocked, ctx, onPress }`)
e reindentação de JSX. **Nenhuma** toca regra de desbloqueio, cálculo, ordem, categoria ou
persistência. Os serviços e o armazenamento de conquistas têm **zero** *commits* no arco
(§3.1). A mudança é de **composição**, exatamente como em qualquer outra das 12 telas.

O mesmo raciocínio, sem repetir a tabela, vale para
`AtelierCanvasScreen`/`ColoringScreen` (Ateliê — o *canvas* e seu ciclo de vida não são
*assets*) e para `StoryBookScreen`/`StoryDetailScreen` (as **telas** de história;
`src/data/stories/**` não foi tocado).

---

## 5. Regra de `git add` seletivo

Em **nenhum** *commit* do arco houve `git add .` ou `git add -A`. Toda indexação foi
caminho a caminho, com `git diff --cached --name-only` conferido antes de cada *commit*.
Nenhum arquivo pessoal (`.claude/settings.local.json`) entrou. Código, *assets* e
governança **não** se misturaram: os 11 arquivos de `specs/**` saíram em nove *commits*
documentais próprios — nenhum deles toca `src/` — e o único *commit* que junta configuração
e *plugin* (`e2702d2`) o faz porque `app.json` **é** o registro do *plugin*: separá-los
deixaria a árvore inconsistente entre os dois (`OR-6`).

---

## 6. Veredito

# ✅ `CN-8` **VERDE** em `F6-R1`

Zero *assets*, zero manifestos, zero histórias, zero domínio de conquistas, zero
`accessControl`, zero *paywall*, zero progresso. A única área protegida presente é
`src/theme/tokens.js`, **autorizada por `Q9`** e periciada linha a linha.

*Execuções irmãs, fora do escopo deste artefato:* `TK-A-099` em `F6-R3` e `TK-B-046` em
`F6-R2`.

**O próprio *commit* deste artefato não muda o veredito.** Ele acrescenta dois arquivos ao
arco — este artefato `25` e a errata no artefato `23` —, ambos em `specs/**`. Documentação
pura: não é área protegida, não toca `src/`, e por isso **não** dispara o portão de
bundleabilidade (`AGENTS.md`). Medido depois dele, o arco passa a 30 *commits* e 41
arquivos, com a mesma varredura devolvendo zero.

---

## 7. Referências

`TK-C-064`, `TK-C-008`, `TK-C-016`..`018`, `TK-C-061` · PLAN §24 (`CN-8`) · `Q9` · `OR-6` ·
`RG-3` · `AGENTS.md` (áreas protegidas · `git add` seletivo) · artefatos `22`, `23`, `24`.
