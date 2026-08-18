# R7 · decisão QA de packs e PRE do Attempt 03

## Adjudicação

O fundador preservou o QA histórico de packs do perfil `preview`. A invariável
`PREVIEW_DEV_TOOLS=OFF` foi substituída pelo contrato preciso:

- preview é release não-DEV;
- `developmentClient` ausente/falso;
- nenhuma dependência de Metro;
- `RELEASE_PACK_QA_ENABLED=true` preservado;
- nenhuma ferramenta nova habilitada pela autorização C60;
- production sem C60, P139 ou QA interno.

## Prova de não ampliação

Antes de `31ae293`, `eas.json` já declarava no preview
`EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true`,
`EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA=true`, `EXPO_PUBLIC_QA_BUILD=true` e
`EXPO_PUBLIC_BUILD_PROFILE=preview`. Em consequência,
`RELEASE_PACK_QA_ENABLED` e `isInternalToolsEnabled()` já resolviam verdadeiro.

O diff funcional de `31ae293` adiciona ao perfil apenas
`EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT=true`, amplia a identidade aceita pela flag
C60 para o conjunto fechado `{c60-pilot, preview}` e atualiza testes. Nenhum menu,
overlay, harness físico, dev launcher, rota, tela ou registro de ferramenta foi
adicionado. `StoryDetailScreen.js`, `internalTools.js`, `ParentAreaScreen.js` e
`AppNavigator.js` permanecem byte-idênticos ao baseline anterior à mudança C60.

Production continua sem a autorização C60 e sem `EXPO_PUBLIC_PTF_PERF_TRACE`.
O perfil `c60-pilot` permanece inalterado. A correção D1 permanece em
`plugins/withAndroidTabletOrientation.js`, sem modificação.

## Gates herdados imediatamente anteriores

- harness R7 C60: 8/8 PASS;
- mutantes: 6/6 mortos;
- smoke: 4968/4968 PASS;
- `verify:runtime`: PASS, incluindo bundle Android de 2381 módulos e smoke;
- expo-doctor: 17/18, somente divergência conhecida de patches.

Nenhum arquivo executável mudou depois desses gates. O próximo ato técnico é o
despacho do R7 Attempt 03, perfil `preview`, Android. Attempts 01 e 02 preservam
integralmente suas classificações históricas.
