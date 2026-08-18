# Fase 6 · R7 · Attempt 02 preview e PRE T090/P139

## Resultado do redespacho

- `R7_BUILD_ATTEMPT_01 = ERRORED` permanece histórico, conforme artefato 70.
- `R7_BUILD_ATTEMPT_02 = FINISHED`.
- Build ID: `34518222-4b6f-4dd3-9fca-dbfb6cad09df`.
- Perfil/plataforma: `preview` / Android.
- Source HEAD: `32c8262495b1101390c6ece1f85c8aca28ee9179`.
- Fingerprint: `bb6ac6367735c4d58838b4ea6a3d5364a39e8a11`.
- Finalização EAS: `2026-08-18T21:05:53.092Z`.

O sucesso remoto encerra a lacuna do gate exato `:app:lintVitalRelease`, que não
pôde ser executado localmente porque o host não possui Android SDK configurado.
Não houve suppress de lint.

## Perícia do APK

- Arquivo de evidência, fora do repositório: `C:\tmp\ptf_r7_attempt_02_evidence\r7-preview-attempt-02.apk`.
- SHA-256: `53FC038BD7CC4F8F369E41DFB3016A038118F68A2AF1CC18AB092D274DB5A199`.
- Tamanho: `265335322` bytes.
- Package: `com.valentedev.pequenostracosdefe`.
- Version name/code: `1.0.0` / `1`.
- minSdk/targetSdk/compileSdk: `24` / `36` / `36`.
- Release não-debuggable; bundle `assets/index.android.bundle` embarcado; sem
  classes de dev launcher/dev menu na inspeção estática.
- Assinatura V2 válida. SHA-256 do certificado:
  `05A1891555446C4B529D6CDC4C2A6C6D73D115DFFEE678D8C90E902FF5A618A5`.
- Certificado idêntico ao APK previamente instalado: update in-place compatível.

A inspeção do bytecode release confirmou que `MainActivity.onCreate` aplica, antes
de `super.onCreate(null)`, `UNSPECIFIED` quando
`smallestScreenWidthDp >= 600` e `PORTRAIT` nos demais aparelhos. A referência
variável `@integer/screen_orientation` que derrubou o attempt 01 não existe. O
valor literal de fallback gerado pelo Expo no Manifest não governa o resultado
final em runtime, pois a Activity aplica a política D1 explicitamente.

## P139 no artefato

O bundle preview contém `PTF_PERF_SAMPLE`, `isPerformanceTraceEnabled` e o evento
terminal `first_layout`. O perfil preview efetivo habilita `PERF_TRACE`; o perfil
production permanece sem essa variável. A prova física deve confirmar uma amostra
real, não apenas a presença estática.

## Instalação preservadora

Dispositivo único: `RX2XC003LTJ`, Samsung `SM-X510`. Antes da instalação, o app
estava parado, com PID ausente, version code `1`, certificado compatível e
`ceDataInode=137433`.

Foram lacradas duas leituras PRE idênticas de RKStorage:
`f2deb87f491a49621cb812fd2ef48662c8ff26f64578c0638e83de94629329e1`,
além dos hashes C60 e Ateliê no diretório externo de evidência.

A instalação foi exclusivamente `adb install -r` e retornou `Success`. Não houve
uninstall, `pm clear`, downgrade nem restauração. Depois dela, package, version,
assinatura e `ceDataInode=137433` permaneceram iguais; o app continuou parado e
sem PID. O novo release é corretamente não-debuggable, portanto `run-as` deixou
de permitir a releitura direta dos bytes privados. Assim, `DATA_PRESERVED` é
fortemente sustentado pelo update in-place, assinatura e inode invariantes, mas a
prova POS direta de RKStorage não está disponível. A abertura somente leitura das
mesmas obras integra o roteiro físico para fechar essa limitação sem salvar dados.

## Contrato congelado T090/P139

- `T090_METRIC`: emissão e validade estrutural da amostra P139, terminalidade da
  primeira carga e ausência de regressão perceptível no carregamento do preview
  não-development.
- `T090_THRESHOLD`: amostra schema 2 com terminal `first_layout` ou `ceiling`; se
  houver ceiling, deve respeitar o teto contratual de `12000 ms`.
- `T090_RUNS`: uma execução física real.
- `T090_SURFACE`: cold launch do preview release instalado até o primeiro layout
  estável.
- `T090_PASS_RULE`: app abre diretamente sem dev launcher/Metro; log contém amostra
  válida e terminal; relatório P139 é parseável; fundador não observa regressão
  de loading/performance; áudio apropriado funciona.
- `P139_TRACE_SCHEMA = 2`.
- `P139_TERMINAL = first_layout | ceiling`.
- `P139_CEILING = 12000 ms`.

Não existe baseline quantitativa anterior que autorize inventar um limite adicional.

## PRE físico e roteiro consolidado

Em `2026-08-18`, o release preview ficou instalado e parado, PID ausente, launcher
em foreground e notification shade como foco de janela mensurável. Nenhum Metro é
necessário. O logcat foi limpo e uma captura dedicada foi iniciada em
`C:\tmp\ptf_r7_attempt_02_evidence\t090-p139-physical-logcat.txt`.

A rota de áudio resolvida contra o HEAD é:
`Mapa das Aventuras` → `A Criação` → `Cenas da aventura` → `Haja luz` → controle
`Ouvir narração`.

Para corroborar a preservação de dados privados sem escrita, o roteiro também abre
somente em visualização a obra existente em `Minhas artes` e a pintura C60 existente
em `Haja luz`. Não usar editor, canvas, ferramentas nem `✓ Pronto!`.

Estado: `STOP_PHYSICAL_ACTION`. O próximo ato autorizado depende exclusivamente da
execução humana do roteiro consolidado, com vídeo externo e áudio audível.
