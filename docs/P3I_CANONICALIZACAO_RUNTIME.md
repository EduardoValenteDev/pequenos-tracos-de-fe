# P3I — Canonicalização do Runtime e Versão Única do Mundo do Beni

> **Status:** linha canônica implementada e verificada localmente. **Aguardando novo development
> build de iOS e validação física.** Nada foi enviado ao remoto. Nenhuma worktree, branch,
> aplicativo, dado local ou pintura foi apagado.
>
> **Data:** 2026-07-30 · **Branch canônica:** `integrate/colorir-canonical-runtime`
> **Worktree oficial:** `C:\tmp\ptf_colorir_canonical_runtime_wt`

---

## 1. O que foi consolidado

Existiam duas linhas funcionais separadas. Elas foram unidas em **um** merge, sem rebase, sem
reset destrutivo, sem reescrita de commits e sem squash.

| Linha | Branch | HEAD | Conteúdo |
|---|---|---|---|
| L1 | `feat/colorir-60-pilot-creation` | `795760a` | Colorir com o Beni completo (3 atividades, coleção, jornada 1/3→3/3) |
| L2 | `integrate/colorir-with-loading` | `d17a187` | Fundação loading/performance, P3H, partição do preload, contratos LF |

- **Base comum:** `6cf799c` · **46** commits exclusivos de L1 × **25** de L2 · **zero** commits
  cherry-equivalentes → **nenhuma linha é superconjunto da outra**.
- **Base do merge:** `d17a187` (*ours*). Justificativa objetiva: L2 detém a versão **endurecida**
  de todos os arquivos de contrato compartilhados (guarda do catálogo, verificador de 8 arquivos,
  `.gitattributes` com LF fixo, partição do preload, governança v5). Com essa base, um erro de
  resolução tende ao lado seguro, e o `.gitattributes` já vigora durante o próprio merge.
- **Merge:** `98d36fe` (pais `d17a187` + `795760a`).
- **As duas worktrees originais permanecem intactas**, limpas e nos HEADs declarados.

### 1.1 Conflitos e resoluções

| Arquivo | Resolução | Prova |
|---|---|---|
| `src/data/coloring60Catalog.js` | L2 | única diferença executável = guarda `hasOwnProperty`; os 3 `activityId`, 3 sha256 e dimensões são idênticos nos dois lados |
| `src/assets/coloring60LocalAssets.js` | L2 | corpo executável byte-idêntico; divergiam apenas comentários (os de L1 estavam desatualizados) |
| `scripts/verify-coloring60-assets.js` | L2 | 829 linhas × 393; cobre 8 arquivos × 3; **não** depende de `C:\tmp\ptf_colorir60_creation_production` (o gate de L1 seria vermelho no CI Linux) |
| `src/config/featureFlags.js` | **união** | 6 flags exportadas; nada removido a não ser as linhas `'preview'` estreitas que L2 já havia superado |
| `docs/DOCUMENTATION_INDEX.md` | **união editorial** | lista de superados de L2 + item dos dois mestres da raiz de L1 |
| `scripts/smoke.js` | **reconstruído** | merge de 3 vias sobre entradas com CR removido (o conflito era de arquivo inteiro, causado pela conversão para CRLF em `d9101f2`) |

Além disso, uma correção de veracidade em `PRODUCT_BLUEPRINT.md`: o banner apontava a **v4** como
linha de lançamento vigente; passou a apontar a **v5**, registrando que a v4 virou histórica em
2026-07-30.

### 1.2 Excisão auditada no smoke — **pendente de ratificação do fundador**

As duas linhas codificam contratos **mutuamente exclusivos** para
`scripts/verify-coloring60-assets.js`. A regra de monotonicidade é, nesse ponto específico,
insatisfazível **nos dois sentidos**: manter as verificações de L1 exigiria restaurar o
verificador de 393 linhas, o que (i) reduziria a cobertura de 8 para 3 arquivos, (ii) tiraria as
5 poses do Beni do gate, (iii) ancoraria o CI a um diretório local `C:\tmp\...` e (iv) apagaria as
20 verificações `P2X C60-VER` e as `P3H C60-LF` de L2.

Foram removidas **89 verificações** — todas por perda de objeto, **nenhuma relaxada**:

| Família removida | Qtd. | Sucessor na linha canônica |
|---|---|---|
| `C60-P5-GATE1 [01]..[53]` | 54 | `P2X C60-VER [01]..[20]` — matriz fechada de **8** arquivos (3 linearts + 5 poses), sha256 contra os **bytes reais**, prova de *read-only*, sondas negativas, alfa das poses, inventário fechado — mais `P2X C60-*` (87) e `P3H C60-*` (38) |
| `C60-PHASE-FIX1` / `FIX2` acopladas ao verificador aposentado | 35 | as **46** provas de classificação pura permanecem intactas: `[P1]`–`[P4]`, `N1`–`N20`, `[inv1]/[inv2]`, `[reg1]`–`[reg9]`, `[fix2-7.1]`–`[fix2-7.5]`, `[fx0]`, `[anc1]`, `[anc2]` |

Auditoria rótulo a rótulo das três execuções (conjuntos, não contagens):

- Rótulos de **L2** ausentes na canônica: **2** — ambos são o **mesmo teste com texto estendido**
  (`A0.5 (9)` → `A0.5 (9)/P4`, e o de `UnlockCelebration` → versão com o piloto). Zero cobertura perdida.
- Rótulos de **L1** ausentes na canônica: **91** = as 89 acima **+ 2** de `creatorQaMode` que **L2
  já havia substituído antes do merge** pela geração B4 (`B4-1`…`B4-6`, `2B.6 (adendo)` na forma
  `preview-criador`). Zero cobertura perdida.

**Contagens:** L1 `3656/3656` · L2 `3443/3443` · **canônica `4029/4029`, 0 falhas** — superior às
duas linhas de origem.

---

## 2. Portões executados na linha canônica

| Portão | Resultado |
|---|---|
| `node scripts/smoke.js` | **4029/4029**, 0 falhas, exit 0 |
| `node scripts/verify-coloring60-assets.js` | **16/16 [OK] — VERDE**, exit 0 |
| `node --check` nos 38 `.js` alterados | todos OK |
| CR/LF nos 51 arquivos alterados | **0 bytes CR** (100% LF), medido byte a byte |
| Marcadores de conflito na árvore rastreada | **0** |
| Resíduos de merge (`.orig`/`.rej`/`_BACKUP_`) | **0** · untracked: **0** |
| `npx expo-doctor` | 17/18 — a única falha (`expo 54.0.35` × `~54.0.36`) é **pré-existente** e reproduz idêntica em `d17a187`; é de `node_modules`, não do merge (o `package.json` é byte-idêntico nas três árvores) |
| `npx expo config --type public` | resolveu |
| `npx expo config --type introspect` | resolveu |
| `npx eas-cli config --platform ios --profile development` | resolveu |
| Assets aprovados (8) comparados por sha256 nas 3 árvores | **byte-idênticos** — nada substituído |

Assets conferidos: `scene_02.png` (`c960f1bb…`), `activities/living_world.png` (`818cd917…`),
`activities/people_and_care.png` (`59988d9a…`) e as 5 poses `12_beni_admira_esquerda`,
`13_beni_admira_direita`, `14_beni_celebra_frente`, `15_beni_apresenta_galeria`,
`16_beni_olha_acima`.

---

## 3. Auditoria do development build antigo

### 3.1 Configuração efetiva (medida, não suposta)

| Item | Valor resolvido |
|---|---|
| `name` / `slug` | `Beni` / `pequenos-tracos-de-fe` |
| `version` / `ios.buildNumber` | `1.0.0` / `1` |
| `scheme` do app | `pequenostracosdefe` |
| Esquemas registrados no iOS | `pequenostracosdefe`, `com.valentedev.pequenostracosdefe`, **`exp+pequenos-tracos-de-fe`** |
| `ios.bundleIdentifier` | `com.valentedev.pequenostracosdefe` |
| EAS `projectId` | `ccf727af-fd51-4722-bf88-787cd48553c8` |
| `runtimeVersion` | **não declarado** (e hoje sem consumidor) |
| `updates` | **ausente** |
| `expo-updates` | **não instalado** |
| `newArchEnabled` | `true` |
| Plugins de config | `expo-font`, `expo-audio`, `expo-asset` |
| `expo-dev-client` / `-launcher` / `-menu` | `6.0.21` / `6.0.21` / `7.0.19` |
| `NSLocalNetworkUsageDescription` / `NSBonjourServices` | **ausentes** (nenhum pacote Expo os injeta) |
| Perfil `development` do `eas.json` | `developmentClient: true`, `distribution: internal`, `ios.simulator: false`, `credentialsSource: remote`, **sem `env`** |
| Bundle id por perfil | **um só** para os 5 perfis (`development`, `preview`, `preview-criador`, `production`, `screenshot`) |

### 3.2 Por que o app instalado abre versão antiga e o Metro fica em "No apps connected"

O QR de `npx expo start --dev-client` emite `exp+pequenos-tracos-de-fe://expo-development-client`.
Esse esquema **está correto**: é o que o `expo-dev-client` gera a partir do `slug`. O problema não
é o esquema.

Duas causas locais, ambas compatíveis com o sintoma observado, em ordem de probabilidade:

1. **O binário instalado é de perfil Release.** `expo-dev-launcher` e `expo-dev-menu` são
   `debugOnly: true` na Apple: um build `preview`, `preview-criador`, `production` ou `screenshot`
   **registra** `exp+pequenos-tracos-de-fe` (o esquema vem da config, não do launcher) mas **não
   possui o launcher**. Resultado exato: o link abre o app, o app sobe o JS **embutido no binário**
   e o Metro nunca recebe conexão. O commit `ba396d1` (2026-07-29) documenta um build `preview`
   sendo instalado no aparelho.
2. **Binário anterior a `0b11d72` (2026-07-08).** Foi nesse commit que `expo-dev-client` e
   `react-native-purchases` entraram no projeto. Qualquer binário mais antigo não registra
   `exp+` nem tem launcher.

Em qualquer dos dois casos, **sem `expo-updates` não existe caminho de atualização OTA**: o JS
fica congelado no binário até reinstalar. Não há canais, branches nem *embedded update* a auditar.

> ⚠️ **Não é possível afirmar, só com o repositório, qual é o tipo do binário instalado.** Isso
> exige evidência do aparelho ou do EAS — ver §3.3.

Uma terceira causa, **independente do tipo do build**, deve ser descartada no aparelho: como
nenhum pacote injeta `NSLocalNetworkUsageDescription`, o iOS pede a permissão de **Rede local**
na primeira tentativa de conexão. Se ela foi negada uma vez, o dev client legítimo também fica
sem alcançar o Metro em `--lan`.

### 3.3 Evidência que falta (a coletar no aparelho / no EAS)

1. `npx eas-cli build:list --platform ios --limit 10` → qual `profile` gerou o build instalado,
   sua data e o `buildNumber`.
2. No iPhone: **Ajustes → Geral → VPN e Gerenciamento de Dispositivo** (ou o próprio app) →
   versão/compilação exibidas.
3. No iPhone: **Ajustes → Beni → Rede local** ligado?
4. Ao abrir o app: ele mostra a tela do **dev launcher** ("Development servers") ou entra direto
   no app? Entrar direto = binário Release, confirmado.

### 3.4 Nenhuma mudança de configuração é necessária

A config já resolvida registra os três esquemas e o perfil `development` já é um dev client de
distribuição interna. **Não foi criada nenhuma segunda identidade do Mundo do Beni** e nenhuma
variante nova foi introduzida. O que falta é **um binário novo do perfil `development`**.

Observação: as dependências nativas mudaram pela última vez em `fca92f5` (2026-07-14,
`react-native-reanimated@~4.1.1` + `react-native-worklets@0.5.1`), **antes da base comum**. Ou
seja, o rebuild nativo já era obrigatório de qualquer forma; **o merge não acrescentou nenhuma
dependência nativa**.

### 3.5 O piloto aparece sem mexer na flag

`isColoring60PilotAllowed()` = `COLORIR_60_CREATION_PILOT_ENABLED || (__DEV__ && isInternalToolsEnabled())`.
Num development build `__DEV__` é `true`, então **o Colorir com o Beni fica visível sem alterar a
flag**, que permanece `false` na linha canônica, como exige a governança. O modo de release de
teste interno continua determinístico: `preview` (packs) e `preview-criador` (packs + Modo Criador)
seguem exigindo o conjunto fechado de variáveis do `eas.json`; `production` e `screenshot` não
declaram nenhuma.

---

## 4. Procedimento do novo development build (requer autorização — nada foi executado)

> **Build no EAS é operação paga e não foi executada.** Os comandos abaixo estão prontos para o
> fundador autorizar e rodar.

```bat
cd C:\tmp\ptf_colorir_canonical_runtime_wt

:: 1. Confirmar a árvore
git status
git log --oneline -3

:: 2. Portões locais
npm run smoke
node scripts\verify-coloring60-assets.js
npx expo-doctor

:: 3. Registrar o iPhone (obrigatório em distribution: internal / ad hoc)
npx eas-cli device:create
npx eas-cli device:list

:: 4. Saber o que já existe no EAS (ajuda a identificar o binário instalado)
npx eas-cli build:list --platform ios --limit 10

:: 5. O BUILD (PAGO — só com autorização explícita)
npx eas-cli build --platform ios --profile development
```

> `app.json` **não deve ser alterado pelo EAS**. Se o `eas build` mexer nele, restaurar com
> `git restore app.json` antes de qualquer commit.

Instalação no iPhone: abrir a página do build no EAS pelo **Safari do próprio iPhone** e tocar em
*Install*, ou ler o QR da página do build. Depois, confiar o perfil em **Ajustes → Geral → VPN e
Gerenciamento de Dispositivo**, se solicitado.

Servidor de desenvolvimento:

```bat
cd C:\tmp\ptf_colorir_canonical_runtime_wt
npx expo start --dev-client --clear --lan
```

Se a rede local do iPhone estiver bloqueada ou a rede for isolada, usar `--tunnel` em vez de
`--lan`.

---

## 5. Validação física — roteiro preparado (não executado, nada aprovado)

### 5.1 Passos

1. Instalar o novo build de `development` no iPhone.
2. Confirmar em **Ajustes → Beni → Rede local** que a permissão está **ligada**.
3. Rodar `npx expo start --dev-client --clear --lan` na worktree canônica.
4. Ler o QR **pela câmera do iPhone** e abrir no app.
5. Confirmar que o app abre a tela do **dev launcher** (não vai direto ao conteúdo).
6. Confirmar no terminal a linha de **bundle para o iPhone** (`iOS Bundled … ms`).
7. Confirmar que o Metro **deixou** de mostrar "No apps connected".
8. Testar `r` (reload) no terminal e confirmar que o app recarrega.
9. Confirmar que **não** aparece "Expo Go app detected" — o Expo Go deixa de ser fonte de validação.
10. Confirmar que o RevenueCat **não** entra em "Browser Mode" (comportamento nativo esperado);
    se entrar, registrar a limitação em vez de contorná-la.
11. Percorrer a jornada completa de "A Criação".

### 5.2 Checklist visual (print ou vídeo de cada item)

1. Home carrega sem tela branca e sem *flicker* de capa.
2. "A Criação" abre com o hero correto.
3. A seção **Colorir com o Beni** aparece na história (piloto ativo por `__DEV__`).
4. A entrada do Colorir **legado** está oculta **apenas** em "A Criação".
5. Atividade **`light`** abre com a arte nova de `scene_02`.
6. Atividade **`living_world`** abre com a arte aprovada.
7. Atividade **`people_and_care`** abre com a arte aprovada.
8. Progressão **0 → 1/3**, com o texto correto.
9. Progressão **1/3 → 2/3**.
10. Progressão **2/3 → 3/3** e **overlay de conclusão**.
11. Marco de **`people_and_care` na cena 09** ("Era muito bom") e retorno correto.
12. **Coleção** carrega as três atividades (`light`, `living_world`, `people_and_care`).
13. **Art Preview** abre em tela cheia com a pintura da criança.
14. Fechar e reabrir o app: a pintura **persiste** (retomada).
15. Colorir **legado** continua funcionando em outra história (ex.: Noé) — sem regressão.

> **Aprovação física não é declarada aqui.** Só o fundador aprova, depois de executar o roteiro.

---

## 6. Aposentadoria segura do aplicativo antigo — **bloqueada até a aprovação física**

> **Não apagar o aplicativo antigo antes de o novo build estar instalado, conectado ao Metro e
> aprovado fisicamente.**

### 6.1 O que está em risco (levantamento real do código)

- Os dados do app instalado vivem no contêiner de **`com.valentedev.pequenostracosdefe`** —
  progresso, conquistas, desenhos do Colorir legado e do Colorir 60 (`@ptf_drawing60_s…_a…`),
  galeria do Ateliê.
- A validação do Colorir 60 relatada pelo fundador ocorreu **no Expo Go**. Pinturas feitas ali
  vivem no contêiner do **Expo Go**, não no do app. Apagar o Expo Go apaga essas pinturas.
- **O app não possui exportação/backup real.** `shareCardService` registra apenas *intenções* de
  compartilhamento ("compartilhamento real fica para sprint futuro"). Não existe caminho in-app
  para exportar as artes.

### 6.2 Risco não óbvio — a instalação, e não a remoção, é o momento perigoso

Os **cinco perfis do `eas.json` compartilham o mesmo bundle id**. Instalar o novo development
build **sobre** o app atual é uma substituição no mesmo contêiner:

- se a assinatura/provisionamento forem compatíveis, o iOS trata como atualização e **preserva** o
  contêiner;
- se **não** forem, o iOS recusa a instalação e exige apagar o app antes — **e isso apaga os dados**.

### 6.3 Perguntas bloqueantes ao fundador (antes de qualquer instalação)

1. As pinturas/progresso que estão **no app instalado** têm valor a preservar, ou são descartáveis?
2. Existe backup do iPhone (iCloud ou Finder) recente o bastante para servir de rede de proteção?
3. Autoriza que, se o iOS exigir remoção para instalar o novo build, o contêiner antigo seja
   descartado — ou prefere primeiro um backup completo do aparelho?
4. As pinturas feitas **no Expo Go** devem ser preservadas? (Se sim, o Expo Go **não** pode ser
   apagado — e não há caminho in-app para migrá-las.)

### 6.4 Ordem de execução autorizada (só depois das respostas)

1. Backup do iPhone (iCloud ou Finder), se as respostas indicarem preservação.
2. Registrar o dispositivo no EAS e gerar o build de `development` (autorização do fundador).
3. Instalar. Se o iOS recusar por assinatura, **parar** e reconfirmar a decisão 3 acima.
4. Validar fisicamente pelo roteiro da §5.
5. **Só então** aposentar: remover o app antigo (se ainda houver um binário separado) e retirar o
   Expo Go da rotina de validação.
6. Manter as duas worktrees originais e as duas branches **intactas** — a aposentadoria é do
   **binário antigo** e das **linhas divergentes de desenvolvimento**, não dos recursos legados.

> O **Colorir legado não foi removido**: ele continua atendendo as demais histórias. O que fica
> oculto é apenas a entrada legada **dentro de "A Criação"**, e somente quando o piloto está ativo.

---

## 7. Decisões abertas para o fundador

1. **Ratificar a excisão** das 89 verificações descritas em §1.2 (ou determinar o caminho oposto,
   com as quatro perdas listadas).
2. **`COLORIR_60_CREATION_PILOT_ENABLED`** permanece `false` na linha canônica? (Hoje sim; o
   piloto aparece no dev build por `__DEV__`, sem alterar a flag.)
3. **`C:\tmp\ptf_colorir60_creation_production`** — as artes de produção aprovadas que vivem fora
   do repositório devem ser arquivadas em local versionado/auditado ou descartadas?
4. **Push** da branch `integrate/colorir-canonical-runtime`: **não** foi feito e aguarda
   autorização explícita.
