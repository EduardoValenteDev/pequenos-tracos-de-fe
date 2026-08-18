# `43` — `SF1` · Pré-execução: decisões do fundador e lacre do harness reconciliado

> **Natureza:** documentação pura. Nenhum arquivo executável do worktree canônico foi alterado.
> **Tablet:** `HANDS OFF`. Nenhum gesto humano ocorreu durante esta lavratura.

## 1 · Base canônica

- Worktree: `C:\tmp\ptf_fase6_shell_splash_wt`
- Branch: `feat/fase6-shell-splash`
- Base anterior: `bec0dd511f311c9901f2b0964211d9f01441a191`
- Artefato `42`: commit `bec0dd5`, SHA256
  `F1C13B2B1944A7673D1884E4E9E45F66FA29B0E122F19CD8FA7B8DB80C114BA8`, 560 linhas
- Grafo executável contra `bec0dd5`: **zero diferenças** antes deste registro.

## 2 · Ratificações do fundador

### 2.1 · `AMB-E6-SUPERFICIE`

`AMB-E6-SUPERFICIE = A — ATRAVÉS DO ACERVO`.

Em `E6`, *"uma de cada formato"* significa:

1. obra legada do Ateliê `art_1786479103982_6079`; e
2. obra C60 `light`, chave `@ptf_drawing60_screation_alight`.

A leitura estrita dentro da Galeria do Ateliê não governa. `ARB-OBRA-NOVA` não reabre por causa de
`E6`. O caso permanece leitura pura e não requer fabricar insumo.

Registro canônico: `docs/DECISIONS.md`, `D-FUND-SG-A-E6-SUPERFICIE-A-01`.

### 2.2 · Baseline Expo

Preservar durante a campanha:

- `expo 54.0.36`;
- `expo-file-system 19.0.23`.

Medição literal: `npx expo-doctor` = **17/18**. O único check falho pede os patches
`expo ~54.0.37` e `expo-file-system ~19.0.24`.

**Veredito de bloqueância:**

- **não bloqueante para a campanha física corrente**: nenhuma dependência, configuração ou camada
  nativa mudou; o bundle exato do harness serializou; smoke `4954/4954`; o binário e o acervo sob
  teste permanecem os mesmos. Não há evidência concreta de invalidação causal ou de runtime;
- **bloqueante para fechamento terminal que exija `SD-10`/`B7` verde**: `17/18` não é `18/18` e
  não será apresentado como tal.

Não atualizar, não modificar manifests, não instalar correção e não gerar *build* por este motivo.
Registro canônico: `docs/DECISIONS.md`, `D-FUND-SG-A-PATCH-BASELINE-01`.

## 3 · Lacre do harness reconciliado

- Worktree: `C:\tmp\ptf_f6_PHYSICAL_HARNESS_RECONCILED_wt`
- `HEAD` base destacado: `bec0dd511f311c9901f2b0964211d9f01441a191`
- `git status --short` esperado e medido:

```text
 M App.js
?? src/devharness/
```

### 3.1 · Único diff tracked

Somente `App.js`: import do overlay temporário e renderização sob dupla guarda `__DEV__`. O diff é
byte-equivalente ao enxerto histórico e seu SHA256 textual é:

```text
AF3AB8A9FB21A8A252952C60877429164091ADCBEF349ACCCCE56ABF83C5768D
```

Nenhum outro arquivo tracked está modificado no harness.

### 3.2 · Inventário instrumental

| Arquivo | Bytes | SHA256 |
|---|---:|---|
| `F6PhysicalHarnessOverlay.js` | 8 868 | `F8C3BDDDAD882198353ACACF58201B50F7E9CB02DF8CD256CDD21CDA50898239` |
| `harnessDiff.js` | 9 415 | `04140FDFEFAE9E6BFB749EBD678085A896CD3B5DA24EAC809425CB222586D219` |
| `harnessInject.js` | 25 614 | `DC44BAE519DE79D9EC66D8151D7577738F732686B52F0CC50292B852E88ED1DE` |
| `harnessLog.js` | 2 569 | `03D4F525B27C2D73A33EEA0E51279C87FB0EDC4DEA9347B410926AB03EFE2393` |
| `harnessOps.js` | 7 656 | `1D77C39C9D3AE6A933243BB058D3F69B32A661796A594BA0246B1E296AACC563` |
| `harnessStore.js` | 18 681 | `9B4DE9DF4A0E7C4E138419A30442D900EC4B588B94691A097CB80131A63F5508` |
| `README_HARNESS.md` | 3 644 | `D56B00FF1C9C5A3C66B44ADDBB79935B935D632E47D8A41361196967E8D76F2A` |

`harnessInject.js` difere do lacre histórico somente para: (a) retirar identificadores em texto que
o smoke confundia com consumo real; e (b) preservar descrições semanticamente equivalentes. O
harness continua sem imports de `src/services`, `src/hooks`, `src/components` ou `src/context`.

### 3.3 · Produto versus instrumento

- Código de produto alterado para facilitar o teste: **NÃO**.
- `App.js` pertence somente ao worktree descartável e contém apenas o ponto de montagem do overlay.
- Instrumentos commitados/mergeados/enviados: **NÃO**.
- Worktree canônico contaminado pelo harness: **NÃO**.
- `npm run verify:runtime` no harness: **verde** — bundle Android verde; smoke `4954/4954`.
- `npx expo-doctor`: **17/18**, divergência de patch preservada por decisão do fundador.

## 4 · Declaração operacional do Vídeo 1

- Contexto: **A — CANÔNICO**.
- Porta Metro: **8081**.
- Harness: **NÃO**.
- Executor ADB único: **Codex, agente raiz desta sessão**. Nenhum agente auxiliar ou fundador emite
  comandos ADB.
- Processo do app no início da gravação: **parado**, sem processo do pacote vivo; a abertura humana
  dentro do vídeo cria o processo observado.
- Tela do tablet no início da gravação: **tela de bloqueio ou tela apagada**, sem app visível. A
  primeira abertura do app faz parte da sequência humana determinística.
- Gravação: câmera externa; gravação de tela e Samsung SmartCapture proibidos.

## 5 · Estado

```text
AMB-E6-SUPERFICIE .............. ENCERRADA — A, através do acervo
ARB-OBRA-NOVA .................. NÃO REABERTA
EXPO_DOCTOR .................... 17/18 — divergência conhecida, nunca declarar 18/18
PATCH_DIVERGENCE_PHYSICAL ...... NÃO BLOQUEANTE
PATCH_DIVERGENCE_FINAL_GATE .... BLOQUEANTE PARA SD-10/B7
CANONICAL_RUNTIME_VS_BEC0DD5 ... IDÊNTICO
HARNESS_RUNTIME_GATE ........... VERDE — 4954/4954
TABLET ......................... HANDS OFF
VIDEO_1 ........................ AINDA NÃO AUTORIZADO
```
