# R7 · Attempt 03 · APK, instalação e PRE físico

## Build

- ID: `f6c2c54d-fdeb-4923-aadd-a39076a7a252`.
- Status: `FINISHED`.
- Perfil/plataforma/distribuição: `preview` / Android / internal.
- Source HEAD: `d3703805240d235ede606c2db5f90f70693bc0d7`.
- Fingerprint: `b972429644472aa125d8b6e394adb050aee3fb63`.
- Criado: `2026-08-18T21:40:05.617Z`.
- Concluído: `2026-08-18T22:02:45.879Z`.
- Attempts históricos preservados: 01 `ERRORED`; 02 `FINISHED` com
  `STOP_PRODUCT_DEFECT` físico; nenhum deles é convertido em PASS.

## APK periciado

- Evidência fora do repositório:
  `C:\tmp\ptf_r7_attempt_03_evidence\r7-preview-attempt-03.apk`.
- SHA-256: `47258F7568EFF3B98E7D9F9AB88F17CFFA5D8AAB7EBB6A1916D0ECE3FCD1EEB1`.
- Tamanho: `265335298` bytes.
- Package: `com.valentedev.pequenostracosdefe`.
- Version name/code: `1.0.0` / `1`.
- minSdk/targetSdk/compileSdk: `24` / `36` / `36`.
- Release não-debuggable; sem dev client; bundle Hermes embarcado; nenhuma
  dependência de Metro.
- Assinatura: V2 válida; certificado SHA-256
  `05A1891555446C4B529D6CDC4C2A6C6D73D115DFFEE678D8C90E902FF5A618A5`,
  idêntico ao instalado e ao Attempt 02.

O bundle contém `Colorir com o Beni`, `Haja luz`, atividades C60,
`PTF_PERF_SAMPLE` e `first_layout`. O build metadata prova perfil `preview` sobre
o source que declara a autorização C60. Production permanece sem autorização C60
e sem P139 nas fontes. O QA histórico de packs foi preservado sem novo menu, rota,
overlay ou ferramenta.

A decompilação de `MainActivity` confirmou novamente D1: em `onCreate`, antes de
`super.onCreate(null)`, usa `UNSPECIFIED` para
`smallestScreenWidthDp >= 600` e `PORTRAIT` para telas compactas.

## Instalação preservadora

O app anterior estava ativo na tela do achado e foi encerrado com `force-stop`
depois de preservados os logs. Não houve limpeza de dados. O release instalado é
não-debuggable, logo o sistema recusa `run-as`; RKStorage e blobs privados não
podem ser relidos diretamente nesse perfil.

Compatibilidade prévia: mesmo package, versionCode e certificado. A instalação foi
somente `adb install -r` e retornou `Success`. Não houve uninstall, `pm clear`,
`-d` ou restore. Depois:

- package/version inalterados;
- `ceDataInode=137433`, idêntico ao PRE e à instalação anterior;
- app parado, PID ausente, `stopped=true`;
- nenhuma UI do Beni foi aberta por ADB.

A preservação estrutural está provada por update in-place, assinatura e inode. A
confirmação de conteúdo C60/Ateliê integra a prova visual física porque o release
não concede leitura privada por `run-as`.

## PRE T090/P139

- Métrica: amostra P139 válida e ausência de regressão perceptível no cold launch.
- Threshold: schema 2; terminal `first_layout` ou `ceiling`; ceiling máximo 12000 ms.
- Runs: uma execução física causalmente limpa do Attempt 03.
- Superfície: cold launch do preview release até primeiro layout estável.
- PASS: abertura direta sem dev launcher/Metro, amostra terminal parseável,
  loading sem regressão percebida, D1 no tablet, narração, C60 novamente presente
  e acervos preservados.

O logcat foi limpo e uma captura dedicada foi iniciada em
`C:\tmp\ptf_r7_attempt_03_evidence\t090-p139-attempt-03-logcat.txt`.

Estado inicial: app Beni parado; um popup do Calendário Samsung está em foreground.
Ele deve ser fechado humanamente no início da gravação antes de tocar no ícone do
Beni. Nenhum input ADB será usado. Estado: `STOP_PHYSICAL_ACTION`.
