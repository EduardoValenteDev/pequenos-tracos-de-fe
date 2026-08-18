# Caso 13 · Mini-SDD · Plano mínimo

## Solução

Implementar um save C60 de dupla representação, mantendo o envelope v3 e a chave
canônica. `uri` permanece o canal legado conhecido por `a190b3e`; `logicalUri` é o
canal lógico preferido pelo código atual. A promoção é indivisível no metadado e só
ocorre após escrita, integridade e releitura das duas representações.

## Arquivos e símbolos

1. `src/components/ColoringCanvas.js`
   - `window.exportPaint`: exportar, no mesmo snapshot/revisão, (a) bitmap lógico
     1:1 atual e (b) bitmap físico legado com `W/H/img*` da viewport atual.
   - ponte React Native e `handleMessage`: transportar o par como um único resultado
     de exportação, sem segundo gesto e sem alterar `paintD`.
2. `src/services/coloring60DrawingStorage.js`
   - `payloadHasPaint`, `isPointer60`, `pointerUri` e novo helper para URIs protegidas;
   - `writeSlot`, `resolvePointer60`, `confirmPromotion`,
     `rollbackFailedPromotion`, `saveColoring60DrawingState` e coleta/clear;
   - escrever e validar ambos os blobs, promover um ponteiro v3 aditivo, resolver
     preferencialmente `logicalUri`, preservar/proteger ambos em rollback e GC.
3. `scripts/testing/artworkVersionHarness.js`
   - ampliar `TA-12/TA-13` com corpus e falhas injetadas da dupla representação,
     incluindo execução do validador extraído de `a190b3e` sobre o canal `uri`.
4. `scripts/smoke.js`
   - gates estáticos e transacionais focados no contrato dual, no envelope v3 e na
     ausência de migração/leitura destrutiva.

Nenhuma alteração é prevista em `ColoringScreen.js`, assets, dependências,
manifestos, migrações globais, namespace ou rollback `a190b3e`. Se a implementação
mostrar necessidade fora dos quatro arquivos, o bloco volta ao Portão 2.

## Schema e leitura

Há evolução aditiva do schema do ponteiro: `logicalUri` e metadados de papel das
representações, sem bump de `v:3`. O contrato antigo de `uri` não muda. Ponteiro sem
`logicalUri` é legado válido; o leitor atual resolve `uri`. Ponteiro dual resolve
`logicalUri`; se esse canal não puder ser lido, retorna falha explícita/preservada ou
fallback comprovadamente válido, nunca healing. A escolha exata de fallback deve ser
coberta por teste de integridade para impedir que corrupção lógica seja mascarada.

## Escrita, promoção e limpeza

1. Capturar uma única revisão de pintura.
2. Exportar o PNG lógico e a projeção legada, ambos com a mesma `rev` e métricas.
3. Escolher um par de slots inativos que não colida com nenhuma URI ativa.
4. Persistir ambos; validar URI, identidade, dimensão, revisão e legibilidade.
5. Montar o ponteiro v3 com `uri` legado e `logicalUri` lógico.
6. Promover uma única vez no AsyncStorage.
7. Reler o ponteiro e os dois blobs; confirmar identidade, URIs, revisão e payloads.
8. Somente então remover as duas representações da geração anterior e coletar
   órfãos, protegendo as duas URIs novas.
9. Qualquer falha antes/depois do set restaura o ponteiro anterior e só remove blob
   comprovadamente não referenciado.

Para manter double-buffer sem colisões, os nomes devem explicitar geração e papel,
por exemplo `.a.legacy.png`/`.a.logical.png` e `.b.legacy.png`/`.b.logical.png`.
O GC e clear passam a tratar o conjunto de URIs do ponteiro, não uma URI isolada.

## Obras antigas e novas

- Antigas/atuais: leitura pura pelo `uri` existente; nenhum backfill automático.
- Novas: dupla representação apenas em save explícito.
- Obra histórica do FAIL: preservada como evidência; não há restauração ou promoção.
- Primeiro save sobre ponteiro simples: o ponteiro simples e seu blob permanecem
  ativos até a dupla nova ter sido integralmente relida e confirmada.

## Gates e testes negativos

- Testes focados: `artworkVersionHarness`, módulo de storage com I/O simulado e
  validador congelado de `a190b3e`.
- Negativos: falha ao exportar/gravar/ler cada blob; URI trocada; revisão divergente;
  dimensão legada divergente; logicalUri ausente/órfã; setItem muta-e-lança;
  releitura divergente; rollback/GC/clear com leitura desconhecida; payload sem tinta.
- `npm run verify:runtime` (inclui `bundle:check` antes de `smoke`).
- `npx expo-doctor`: registrar honestamente 17/18 pela divergência conhecida de patch;
  não instalar, não editar manifests e não declarar 18/18.
- Revisão de diff prova ausência de código fora do owner causal e ausência de assets,
  dependências ou mudanças nativas.
- Validação prospectiva do Caso 13 somente após novos portões/autorização; sem repetir
  o FAIL histórico e sem avançar Vídeos 4–8 antes do PASS prospectivo.

## Auditoria do Portão 2

O plano é mínimo no owner causal, mantém os eixos de versionamento, não altera o
rollback e torna a ordem write-forward verificável. Não há refatoração ampla nem
migração destrutiva. `PORTAO_2 = PASS`.
