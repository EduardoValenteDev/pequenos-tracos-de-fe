# Mini-SDD · correção nativa D1 para R7

Data: 2026-08-18
Baseline: `fa417b8833db7fd457c64581c523aaa0c9e0af78`
Owner: F6-R1.1 · PF6D-D1 · P-150 · TK-C-039/TK-C-040

## PROBLEMA

O build preview R7 attempt 01 (`3a0ee8c6-dbe2-4e8d-8498-88d1cc1664d0`) terminou
`ERRORED`. `:app:lintVitalRelease` recusou a referência de manifesto
`android:screenOrientation="@integer/screen_orientation"` porque o recurso varia em
`values-sw600dp`. O attempt 01 permanece erro histórico e nunca será reclassificado.

## CAUSA

`plugins/withAndroidTabletOrientation.js` implementou a política por dois valores do mesmo recurso
de manifesto. Android permite referência a recurso em manifesto, mas não permite que esse recurso
varie por configuração. O lint também afirma que a variante `sw600dp` não seria usada; suprimir o
lint compilaria uma política sem a semântica exigida e é proibido.

## CONTRATO_D1

- telefone Android: retrato;
- tablet/large screen (`smallestScreenWidthDp >= 600`): retrato e paisagem, sem lock;
- iOS não é alterado;
- preservar target/min SDK, package, versões, `configChanges`, CNG, rotação, resize/split-screen e
  todo o comportamento JS/persistente já validado.

Faixa Android suportada: a faixa definida pelo SDK 54/RN 0.81 e pelo `minSdk` gerado, até Android
16+/targetSdk 36. A decisão usa API de `Configuration` existente desde antes do `minSdk` vigente.

## ALTERNATIVAS

| Classe | Avaliação |
|---|---|
| A · recurso variável referenciado pelo manifesto | rejeitada pela prova direta de `lintVitalRelease` |
| B · política runtime na Activity gerada | escolhida; API nativa instalada, sem dependência e reproduzível por CNG |
| C · biblioteca/API JS de orientação | desnecessária; exigiria dependência nova e iniciaria tarde demais |
| D · suppress/baseline ou lock global | rejeitada; mascara o erro ou viola uma metade de D1 |

## SOLUCAO_ESCOLHIDA

O config plugin passa a:

1. remover da `MainActivity` no manifesto o atributo `android:screenOrientation` que o plugin Expo
   gera a partir de `orientation: portrait`;
2. modificar `MainActivity.kt` pelo mod padrão `withMainActivity`;
3. importar `android.content.pm.ActivityInfo`;
4. antes de `super.onCreate`, atribuir `requestedOrientation`: `UNSPECIFIED` quando
   `resources.configuration.smallestScreenWidthDp >= 600`, senão `PORTRAIT`;
5. não gerar `screen_orientation`, `integers.xml` ou suppress de lint.

## POR_QUE

A decisão ocorre no runtime nativo, antes do React, usando a classificação Android em dp e não
modelo, fabricante ou pixels. Mantém o contrato do telefone, libera large screens, não depende de
Metro/JS e sobrevive a todo prebuild/EAS. `withMainActivity` é o mod oficial do Expo para modificar a
Activity gerada; uma transformação estreita, com âncoras e falha fechada, torna a operação repetível.

## ARQUIVOS

- `plugins/withAndroidTabletOrientation.js` — mecanismo causal;
- `scripts/testing/androidTabletOrientationPluginHarness.js` — prova focada e mutantes;
- `scripts/smoke.js` — integração do gate focado ao gate global;
- este artefato e documentação POS posterior.

Nenhum arquivo `android/` gerado é canônico ou será commitado.

## INVARIANTES

- aplicação repetida não duplica import nem política;
- ausência/ambiguidade das âncoras falha explicitamente;
- manifesto final não contém `screenOrientation` nem referência variável;
- `configChanges` permanece byte-equivalente;
- telefone usa `SCREEN_ORIENTATION_PORTRAIT` e large screen usa
  `SCREEN_ORIENTATION_UNSPECIFIED`;
- threshold único = 600dp;
- nenhuma dependência, versão, asset, storage, UI ou harness físico muda.

## TESTES

- focused harness: transformação Kotlin, manifesto, idempotência e oito mutantes M1–M8;
- duas gerações CNG limpas e comparação do output nativo relevante;
- `verify:runtime`, smoke, bundle Android e expo-doctor;
- Gradle `lintVitalRelease`/release no projeto descartável, sem suppress;
- inspeção de package, SDKs, versões e `configChanges` gerados.

## ROLLBACK_LOGICO

Reverter o commit funcional restaura exatamente o mecanismo anterior, mas ele permanece incapaz de
produzir release. Não há migração, dado persistido ou ação física a desfazer.

## RISCO_RESIDUAL

`withMainActivity` opera sobre fonte Kotlin textual do template SDK 54. Mudança futura do template
deve falhar fechada no prebuild/harness, não omitir silenciosamente a política. A validação física em
telefone Android não existe por decisão R6; essa lacuna permanece aceita, sem virar PASS.
