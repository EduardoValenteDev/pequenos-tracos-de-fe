# Caso 13 · Mini-SDD · Tasks e análise final

## Tasks atômicas propostas

- `C13-FIX-01` — acrescentar ao export do canvas a projeção legada derivada do mesmo
  `paintD`/`paintRev`, preservando sem alteração o PNG lógico 1:1.
- `C13-FIX-02` — modelar ponteiro v3 dual, helpers de URI por papel e resolução atual
  preferencial do canal lógico, com fallback de ponteiro simples.
- `C13-FIX-03` — persistir o par em geração inativa e validar bytes, geometria,
  identidade e revisão antes da promoção.
- `C13-FIX-04` — tornar confirmação, rollback, clear e GC conscientes das duas URIs,
  com proteção fail-closed sob estado desconhecido.
- `C13-TEST-01` — provar que o writer atual produz estado aceito pelo leitor atual.
- `C13-TEST-02` — entregar o `uri` do mesmo ponteiro ao validador congelado de
  `a190b3e` e provar aceitação (`W/H` da viewport de exportação).
- `C13-TEST-03` — provar que rollback abre a pintura, não lineart limpo, e não dispara
  `PAINT_INVALID`/healing para o payload compatível.
- `C13-TEST-04` — provar leitura pura de data URL v1, JSON v2 legado, ponteiro v3
  simples atual e ponteiro v3 dual.
- `C13-TEST-05` — injetar falhas em cada etapa e provar pointer/blobs anteriores
  byte-idênticos, sem órfão referenciado e sem promoção parcial.
- `C13-TEST-06` — provar que promoção só sucede após releitura válida dos dois blobs.
- `C13-TEST-07` — provar semântica: PNG lógico mantém `logicalW/H` e conteúdo 1:1;
  PNG legado mantém `W/H/img*` físicos e representa a mesma pintura/revisão.
- `C13-GATE-01` — executar testes focados e mutantes negativos.
- `C13-GATE-02` — executar `npm run verify:runtime`.
- `C13-GATE-03` — executar `npx expo-doctor`, registrar 17/18 conhecido sem correção.
- `C13-GATE-04` — auditoria final do diff e lacre de hashes.
- `C13-PHYS-01` — sob autorização futura, nova baseline e validação prospectiva
  mínima do Caso 13; tentativa histórica permanece FAIL.

## Matriz obrigatória

| Estado | Leitor atual | `a190b3e` | Escrita/healing |
|---|---|---|---|
| v1 data URL legado | abre | abre segundo contrato histórico | zero na abertura |
| v2 JSON legado | abre | abre quando W/H coincidem | zero na abertura |
| ponteiro v3 simples existente | resolve `uri` e abre | resolve `uri` e abre | zero/backfill zero |
| ponteiro v3 dual novo | resolve `logicalUri`; lógico 1:1 | ignora adições, resolve `uri`; pintura visível | zero na abertura |
| falha antes da promoção | estado anterior íntegro | estado anterior íntegro | promoção zero |
| falha/releitura divergente após set | rollback ao anterior; novos só removidos com prova | anterior continua consumível | healing zero |
| `logicalUri` inválida | erro/fallback somente se validade comprovada; nunca lineart silencioso | `uri` legado intacto | zero destrutivo |
| `uri` legado inválida | canal atual não mascara quebra do contrato de rollback | recusa explícita no teste | promoção proibida |

## Análise de consistência

- Spec → plano: a contradição da representação única é resolvida por canais
  explícitos; `uri` mantém a ABI antiga e `logicalUri` preserva o bitmap atual.
- Plano → tasks: export, storage transacional, compatibilidade, negativos e gates têm
  task própria; nenhuma task pressupõe mudança no rollback.
- Tasks → código real: os pontos vivos são `window.exportPaint`, `writeSlot`,
  `resolvePointer60`, `confirmPromotion`, `rollbackFailedPromotion`,
  `saveColoring60DrawingState` e rotinas de GC/clear já existentes.
- Q8/SD-8: abertura permanece leitura pura; a geração anterior só perde autoridade
  depois da dupla releitura válida; falha nunca autoriza healing ou folha limpa.
- Versionamento: `POINTER_VERSION = 3`, payload canvas `v = 2` e
  `APP_STORAGE_SCHEMA_VERSION = 3` permanecem congelados. O acréscimo é aditivo.
- Escopo: quatro arquivos; qualquer dependência, asset, migração global, tela ou
  alteração de `a190b3e` invalida o plano e exige retorno aos portões.

Não existe ambiguidade material para iniciar implementação sob autorização futura.
Ainda falta autorização executável, execução dos testes/gates e validação física
prospectiva; portanto este artefato declara prontidão de implementação, não PASS do
Caso 13.

`PORTAO_3 = PASS` · `IMPLEMENTATION_READY = SIM`.
