# Plan — Bloco 2 · Fase 2A: Inventário e mapa de consumo do bundle

> **Feature:** `005-reducao-bundle` · **Subfase:** 2A (inventário, READ-ONLY). **Etapa SDD:** 3 (Checklist) + 4 (Plan). **Portão Humano 2: APROVADO por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `e4d2a8a` · Spec: [spec.md](./spec.md).

## Checklist aprovado (Etapa 3)
| # | Item | Veredito |
|---|---|---|
| CHK-1 | Fase 2A é 100% read-only (inventário/evidência, zero alteração) | ✅ scripts só leem + imprimem JSON |
| CHK-2 | Ferramentas existem e são invocáveis | ✅ `npm run assets:*` |
| CHK-3 | Cobre require→asset→superfície | ✅ 4 registries × loaders × telas |
| CHK-4 | Cobre pesos por tipo e por história | ✅ inventory + du/find |
| CHK-5 | Cobre backups em assets/maps + prova de (não)consumo | ✅ find + grep |
| CHK-6 | Não depende de build (expo export = N/A honesto) | ✅ AAB real fica p/ 2C/2D |
| CHK-7 | Entrega = relatório antes de qualquer implementação | ✅ |
| CHK-8 | Não invade 2B/2C | ✅ |

## Objetivo
Inventário completo + mapa de consumo do bundle, 100% read-only; entregar relatório — base para 2B (wiring) e 2C (strip). Zero alteração de runtime/assets; sem git add/commit/push.

## Execução (read-only)
1. `npm run assets:inventory` — categoriza assets, tracked×untracked.
2. `npm run assets:measure` + `du`/`find` — pesos por tipo e por história (creation+noah × 18 premium).
3. `npm run assets:budget` — assets versionados × meta ~150 MB (bundle real = N/A sem expo export).
4. `npm run assets:traceability` — asset↔história↔manifest↔require↔estado; sinaliza require→AUSENTE / require→UNTRACKED.
5. `npm run assets:growth` + `npm run assets:guard` — contexto.

## Mapa require → asset → superfície
Registries (coloringImages 202 / storySceneIllustrations 204 / audioManifest 204 / storyCovers 20 / adventureMap 16) × loaders (storyImageService/audioService/contentResolver) × superfícies (StoryBookScreen/NarrationScreen/ColoringScreen/StoryDetail/mapa/cards via useResolvedStoryMedia).

## Backups em assets/maps
`find` por backup/source/old/copy + `du`; grep de referências no `src/` para provar (não)consumo; plano de preservação (git-tracked, saída do bundle só por patterns — nunca `git rm`).

## Entrega
Relatório inline: (1) inventário por tipo/história; (2) mapa require→asset→superfície; (3) pesos starter×premium; (4) backups + prova de (não)consumo + preservação; (5) starter (creation+noah) × remote (18); (6) recomendações p/ 2B. Persistência do relatório só com autorização.

## Parada obrigatória
Se algum script read-only apontar **inconsistência crítica** (ex.: require→arquivo AUSENTE, require→UNTRACKED que quebraria clone limpo) → **parar e reportar** antes de qualquer próxima fase.

## Riscos e rollback
Risco ~nulo (read-only; sem expo export; sem tocar R2/assets/registries). Nada a reverter.

## O que NÃO tocar
Runtime, assets, registries, app.json, R2, RevenueCat, motor de pintura, Bloco 1/3. Sem wiring (2B) nem strip/patterns (2C).

## Tasks (Etapa 5) + Analyze (Etapa 6)
- **T1** rodar os 6 `npm run assets:*` (read-only) e capturar JSON.
- **T2** du/find: pesos por tipo e por história; localizar backups em assets/maps.
- **T3** grep de referências no src p/ cada backup (prova de (não)consumo).
- **T4** montar mapa require→asset→superfície cruzando registries×loaders×telas.
- **T5** consolidar relatório inline + riscos + recomendações 2B.
- **Analyze:** cobertura completa dos 15 pontos da spec §questões; nenhuma alteração; parada obrigatória se inconsistência crítica. CONSISTENTE.
