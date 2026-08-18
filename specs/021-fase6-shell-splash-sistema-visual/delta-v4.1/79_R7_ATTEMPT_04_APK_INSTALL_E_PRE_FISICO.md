# R7 · Attempt 04 · APK, instalação preservadora e PRE físico

## Histórico preservado

- Attempt 01: `ERRORED` no build por `ManifestResource`; não é PASS.
- Attempt 02: `STOP_PRODUCT_DEFECT`, C60 ausente no preview; não é PASS.
- Attempt 03: `STOP_PRODUCT_DEFECT`, rota C60 presente e lineart não carregada; não é PASS.
- O Attempt 04 é uma tentativa prospectiva nova. `T090`, `P139` e `R7` continuam não
  adjudicados até a execução física.

## Build Attempt 04

- Build ID: `a5981b54-5f28-42ad-918a-9196217b5c7c`.
- Status: `FINISHED`.
- Perfil/plataforma/distribuição: `preview` / Android / internal.
- Source HEAD: `6f54b1969ddf7c49af9a276b207f7d28b18806a7`.
- Fix causal incluído: `29c7b84` (`fix: resolver lineart C60 no preview Android`).
- Fingerprint nativo: `b972429644472aa125d8b6e394adb050aee3fb63`.
- Criado: `2026-08-18T22:37:35.228Z`.
- Concluído: `2026-08-18T23:00:18.595Z`.

## APK periciado

- Evidência fora do repositório:
  `C:\tmp\ptf_r7_attempt_04_evidence\r7-preview-attempt-04.apk`.
- Tamanho: `265335678` bytes.
- SHA-256: `FE7F071D8269A4CD66D202654BE73AA932FCAF14BD2D12619A368693CCD67E6E`.
- Package: `com.valentedev.pequenostracosdefe`.
- Version name/code: `1.0.0` / `1`.
- minSdk/targetSdk/compileSdk: `24` / `36` / `36`.
- Assinatura APK Signature Scheme V2 válida; certificado SHA-256
  `05A1891555446C4B529D6CDC4C2A6C6D73D115DFFEE678D8C90E902FF5A618A5`,
  idêntico aos Attempts 02/03 e ao app instalado.
- Release não-debuggable, sem development client e com bundle Hermes embarcado; não
  depende de Metro.

O bytecode embarcado contém `resolveLineartReadableUri`. A desassemblagem prova o
caminho causal novo: depois de `Asset.fromModule`, uma URI sem `:` passa por
`Asset.fromURI`, `downloadAsync` e leitura de `localUri`. Objetos `{ uri }` continuam
retornando sua URI diretamente. Portanto o caso standalone que falhou no Attempt 03
está materialmente presente no APK, sem alterar storage ou o leitor de pintura.

### Recursos C60 no APK

O resource table do APK aponta:

| Atividade | Recurso Android | Arquivo APK | Dimensões | SHA-256 do arquivo APK |
|---|---|---|---:|---|
| `Haja luz` | `drawable/assets_stories_creation_coloring_scene_02` | `res/OZ.png` | 1122×1402 | `207F14CAEA53531503B0A174B733A9CBE03E3553DD6F2F0381251CF4072CA6D0` |
| `O mundo ganhou vida` | `drawable/assets_stories_creation_coloring_activities_living_world` | `res/Iw.png` | 1122×1402 | `818CD917C7493F4A3E04512A7120A6EAFF5A03FDD16277B7D4FDFD1EE33B6AC5` |
| `Pessoas e cuidado` | `drawable/assets_stories_creation_coloring_activities_people_and_care` | `res/zy.png` | 1122×1402 | `59988D9A58082A8173A328857FCCB6A3716815660F4434C0DF4491D6BF30D4E9` |

Os três PNGs decodificam. `Haja luz` mantém as mesmas dimensões e o mesmo binário
processado pelo AAPT já periciado no Attempt 03; a diferença para o hash fonte é o
processamento lossless normal do AAPT, não ausência ou corrupção do recurso.

A decompilação de `MainActivity` também confirma D1 no mesmo APK: antes de
`super.onCreate(null)`, `smallestScreenWidthDp >= 600` recebe
`SCREEN_ORIENTATION_UNSPECIFIED`; telas compactas recebem
`SCREEN_ORIENTATION_PORTRAIT`.

## Baseline e instalação preservadora

Antes da instalação, o Attempt 03 ainda estava vivo no PID `24714`, com a
`MainActivity` no estado da falha histórica. O tablet estava em `Dozing`; package
`1.0.0`/`1`; `ceDataInode=137433`; `stopped=false`.

O perfil release é não-debuggable e o Android recusa `run-as`. Logo RKStorage,
pointer e blobs privados não podem ser aferidos diretamente sem trocar o binário ou
usar ação destrutiva. Não se fabrica equivalência byte a byte: a preservação é
estrutural e será corroborada visualmente pela abertura somente leitura das mesmas
obras.

Depois do lacre, o processo foi encerrado com `force-stop`. A atualização foi somente:

`adb -s RX2XC003LTJ install -r r7-preview-attempt-04.apk`

Resultado: `Success`. Não houve uninstall, `pm clear`, `-d`, restore ou abertura da UI.
Depois da instalação:

- package/version continuam `com.valentedev.pequenostracosdefe` / `1.0.0` / `1`;
- `ceDataInode=137433` e `deDataInode=127446`, idênticos ao PRE;
- `firstInstallTime=2026-08-10 12:03:42`, preservado;
- app sem PID, `stopped=true`;
- launcher é a Activity retomada;
- tablet em retrato (`ROTATION_0`), autorrotação habilitada, estado `Dozing`.

## PRE físico T090/P139/R7

- Nenhum Metro ou reverse participa deste perfil.
- Uma captura limpa de logcat está ativa, com executor único, em
  `C:\tmp\ptf_r7_attempt_04_evidence\t090-p139-attempt-04-logcat.txt`.
- Estado inicial: tablet em `Dozing`, launcher subjacente, app Beni parado.
- O primeiro lançamento deve ser humano pelo ícone normal e compõe a única amostra
  física de cold launch do Attempt 04.
- Não usar editor, canvas, paleta, ferramentas, `✓ Pronto!`, apagar ou salvar.
- A obra `Desenho de fé` e a pintura C60 existente em `Haja luz` serão abertas somente
  em leitura para corroborar preservação, sem substituir a limitação técnica de
  `run-as` por afirmação inventada.

Estado: `STOP_PHYSICAL_ACTION`. O próximo ato é exclusivamente a execução humana do
roteiro consolidado do Attempt 04.
