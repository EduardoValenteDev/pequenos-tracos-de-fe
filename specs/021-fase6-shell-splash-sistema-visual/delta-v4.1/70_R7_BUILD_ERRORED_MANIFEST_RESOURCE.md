# R7 · build ERRORED · ManifestResource na política de orientação

Data: 2026-08-18
Build ID: `3a0ee8c6-dbe2-4e8d-8498-88d1cc1664d0`
Baseline enviada: `3fe9814ec4194336e66f9e78527455356ea22168`
Fingerprint: `21e4500a30350da9482727b5451b309b1cf15e16`

## 1 · Estado terminal

O build passou de `IN_QUEUE` para `IN_PROGRESS` e terminou `ERRORED` em
`2026-08-18T20:13:43.360Z`. Não há APK nem artefato instalável. Nenhum segundo build foi
despachado, nenhum APK foi instalado e o tablet não foi alterado.

O `expo-doctor` remoto repetiu a divergência conhecida `17/18` (`expo` 54.0.36 versus
54.0.37; `expo-file-system` 19.0.23 versus 19.0.24), mas a fase terminou como warning e o
build avançou até Gradle. Portanto essa divergência não causou o erro terminal.

## 2 · Causa exata

```text
Task :app:lintVitalReportRelease
Lint found 1 error.
AndroidManifest.xml:19: Error: Resources referenced from the manifest cannot vary by
configuration. Found variation in sw600dp-v13 [ManifestResource]
android:screenOrientation="@integer/screen_orientation"
values-sw600dp/integers.xml:2: This value will not be used

Task :app:lintVitalRelease FAILED
Execution failed for task ':app:lintVitalRelease'.
BUILD FAILED in 20m 17s
```

Origem canônica: `plugins/withAndroidTabletOrientation.js` escreve:

- `values/integers.xml`: `screen_orientation = 1`;
- `values-sw600dp/integers.xml`: `screen_orientation = -1`;
- manifesto: `android:screenOrientation="@integer/screen_orientation"`.

O lint de release prova que atributos de manifesto não podem obter semântica distinta por
qualificador `sw600dp`. Logo a representação escolhida pela rota C não é apenas rejeitada pelo
gate: a variante de tablet é declarada inaplicável (`This value will not be used`). Criar baseline
ou suprimir `ManifestResource` faria o APK compilar sem provar D1 e não é correção legítima.

## 3 · Owner e limite da autorização

Owner causal: F6-R1.1 / política D1 Android / rota C, implementada por
`plugins/withAndroidTabletOrientation.js`; rastreada pelos contratos P-150 e TK-C-039/TK-C-040.

O protocolo de retomada autoriza diagnosticar um build `ERRORED`, mas proíbe alterar configuração
ou criar nova tentativa sem correção objetiva já autorizada. A autorização anterior escolheu a rota
C sob a premissa de que o recurso variável seria válido; a prova de release falsificou essa premissa.
Substituir o mecanismo exige nova especificação/clarificação entre alternativas legítimas, por
exemplo uma decisão nativa em runtime baseada no idioma real do dispositivo ou outra solução que
cumpra simultaneamente telefone Android em retrato e tablet Android em retrato/paisagem. Isso pode
afetar plugin/configuração nativa e possivelmente dependências; não está autorizado neste bloco.

## 4 · Classificação

`STOP_BUILD_CONFIGURATION`.

R7, T090 e P139 permanecem `PENDENTE`. Não há APK a periciar, instalar ou executar. Não é
`STOP_PRODUCT_DEFECT` observado em runtime, pois o preview não foi materializado; é falha objetiva
da configuração nativa durante `lintVitalRelease`. O próximo ato seguro é autorizar Mini-SDD da
política de orientação Android, com regressão de release/lint obrigatória, antes de qualquer novo
despacho EAS.
