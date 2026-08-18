# R7 · correção do asset release, gates e PRE build Attempt 04

## Implementação

- Commit funcional: `29c7b84a908822673498e9de15bfb61e475af883` —
  `fix: resolver lineart C60 no preview Android`.
- Escopo executável: `ColoringCanvas.js`, harness focado novo e integração do
  harness ao smoke global.
- Nenhuma mudança em assets, dependências, schema, storage, reader/writer C60,
  feature flags, D1 ou contratos do Caso 13.
- O reparo reconhece exclusivamente o identificador Android de drawable sem
  esquema, copia-o pelo módulo nativo já instalado do `expo-asset` para cache e
  entrega o `file://` ao pipeline existente.

## Gates

- focused release asset: `7/7 PASS`.
- mutantes release asset: `5/5 KILLED`.
- cerca preview C60/P139: `8/8 PASS`; mutantes `6/6 KILLED`.
- TA-11/TA-12/TA-13 e Caso 13: `211/211 PASS`.
- `npm run verify:runtime`: PASS.
- bundle Android: PASS, 2.381 módulos.
- smoke: `4969/4969 PASS`.
- `npx expo-doctor`: `17/18`, divergência conhecida e aceita de patches:
  `expo 54.0.36` vs `~54.0.37` e `expo-file-system 19.0.23` vs `~19.0.24`.
  Nenhuma instalação ou alteração de dependência foi feita.

## Prova release anterior que ancora o gate do Attempt 04

No APK lacrado do Attempt 03, AAPT prova os três recursos C60:

- `drawable/assets_stories_creation_coloring_scene_02` → `res/OZ.png`,
  PNG `1122×1402`, lineart visual de `Haja luz`;
- `...activities_living_world` → `res/Iw.png`, SHA fonte
  `818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5`;
- `...activities_people_and_care` → `res/zy.png`, SHA fonte
  `59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9`.

O Attempt 04 só poderá ir ao físico se a perícia do novo APK repetir a
presença/referência dos três recursos, comprovar preview não-DEV, C60 ON,
P139 ON, produção OFF e assinatura/package preservados.

## Estado de campanha

- Attempt 01: `ERRORED build`, preservado.
- Attempt 02: `STOP_PRODUCT_DEFECT` — C60 ausente, preservado.
- Attempt 03: `STOP_PRODUCT_DEFECT` — rota abre e lineart falha, preservado.
- Attempt 04: autorizado para despacho; ainda sem resultado físico.
- `T090` e `P139` continuam não adjudicados.
