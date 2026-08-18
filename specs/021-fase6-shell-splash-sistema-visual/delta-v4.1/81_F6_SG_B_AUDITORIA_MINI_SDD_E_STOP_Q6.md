# `81` · F6-SG-B · Auditoria consolidada, Mini-SDD e `STOP_HUMAN_DECISION_Q6`

> **Data:** 2026-08-18
>
> **Baseline documental:** `21121f271e8ac198fd77189286f557db5288ce59`
>
> **Bloco:** `F6-SG-B / F6-R2 · Map Geometry Foundation`
>
> **Modo:** auditoria local e documental; sem ADB, Metro ou interação com o tablet
>
> **Veredito do Portão 1:** `FAIL · STOP_HUMAN_DECISION_Q6`

## 1 · Entrada e fronteira

O fundador concedeu `F6-SG-A` com residuais explícitos em
`D-FUND-F6-SG-A-HUMAN-GATE-FINAL-01`. Isso satisfaz `OR-1` e abre exclusivamente o ciclo SDD de
`F6-SG-B`; não concede `SG-B`, não abre `SG-C`/`SG-D` e não permite depender de `F6-R1` (`OR-3`).

O objetivo de `SG-B` é entregar `R2.1` a `R2.5`: uma origem canônica normalizada para a geometria
das histórias, consumida por pino, alvo de toque, brilho, câmera, *scroll* e medição do holofote;
viewport livre realmente medida; uma assinatura única; e primeira montagem mirando
`comece_aqui` pela mesma fonte. Texto, coreografia e semântica futura do onboarding permanecem
fora deste bloco.

## 2 · Estado real do código

### 2.1 Defeitos inequívocos em escopo

1. `src/services/mapAnchor.js` e `scripts/testing/mapAnchorHarness.js` não existem.
2. `AdventureMapScreen.initialOffsetY` ainda estima a viewport subtraindo dois literais `56` e
   usa `0.58`.
3. `onContentSize` usa a altura real, mas recalcula localmente a âncora e também usa `0.58`.
4. `scrollPinIntoView` recalcula a mesma entidade e usa `0.5`, embora o comentário declare a
   mesma geometria da câmera.
5. `MapRegion` chama `getStoryMapCoord(id, index, count)`; a tela chama `getStoryMapCoord(id)`.
   O defeito de *fallback* permanece latente.
6. `regionLayout`, a região ativa e a primeira mira de `comece_aqui` continuam derivados na tela.
7. `TA-1` a `TA-3` e `G-MAP-1` a `G-MAP-5` ainda não existem.

### 2.2 Fundação já correta e que deve ser preservada

- `adventureMap.js` mantém `MAP_ASPECT`, as 20 coordenadas explícitas normalizadas e o *fallback*.
- `mapWidth` já vem da largura realmente medida do container à direita da barra lateral.
- a altura útil vertical já é mensurável no próprio `ScrollView.onLayout`; não se deve subtrair
  largura de sidebar, safe area ou barra por token/estimativa.
- pino, toque e halo compartilham o mesmo `markerSlot`; a migração deve preservar essa
  co-localização.
- o holofote mede o anel nativo renderizado com `measureInWindow`; o registro permanece mecanismo
  de medição, sem ganhar aritmética de mapa.
- a reprojeção lógica de `F6-R3.1` (`posLogicaRef`/`reprojetarRef`) deve permanecer intacta.
- a correção estática janela → superfície de `P-168` já está presente em
  `guideTargetInOverlay`; o ledger e a prova física pós-correção continuam pendentes.

## 3 · Inventário de divergências

| Achado | Classificação | Tratamento |
|---|---|---|
| Cinco derivações / duas assinaturas / `0.58 × 0.5` | `DEFECT_IN_SCOPE` | clusters 1–4 abaixo |
| Dois `56` na viewport inicial | `DEFECT_IN_SCOPE` | medição real, sem compensação |
| `P-168` janela × superfície | `CODE_PRESENT_EVIDENCE_PENDING` | não reimplementar; revalidar em aparelho |
| recortes verticais observados no spotlight | `PHYSICAL_DIAGNOSIS_PENDING` | preservar como achado SG-B; não antecipar correção sem causalidade |
| tipografia/*fontScale*, botão de 34pt e chrome estimado do modal overview | `OUT_OF_SCOPE` | B2/fase proprietária; não ampliar R2 |
| `P-169` safe area inferior global | `OWNER_SG-C` | SG-B apenas consome medidas reais |
| semântica de alvo/coreografia de onboarding | `OWNER_F7` | R2 entrega só a infraestrutura geométrica |

## 4 · Mini-SDD por cluster causal

### Cluster B1 · módulo puro e provas de referência

**Escopo proposto:** criar `src/services/mapAnchor.js` e
`scripts/testing/mapAnchorHarness.js` com `computeRegionLayout`, `getStoryAnchor`,
`computeCameraTarget` e `resolveActiveRegion`.

**Invariantes:** módulo sem React/RN, sem faixa/arquétipo; mesma coleção `regionsVisual` alimenta
layout e âncora; casos dirigidos para `creation`, história da primeira região visual e história sem
coordenada explícita; clamp em `[0, contentH - viewportH]`; nenhuma compensação mensurável.

**Estado:** tecnicamente definido, porém `computeCameraTarget` depende da decisão `Q6` descrita no
§5. Não implementar parcialmente uma API cuja semântica central permanece aberta.

### Cluster B2 · pino, toque, brilho e *fallback*

**Escopo proposto:** migrar `MapRegion` para `getStoryAnchor` sem separar o `markerSlot`; preservar
o reveal sépia → cor e seu *fallback*.

**Tensão resolvível no plano:** `TK-B-020` manda remover `getStoryMapCoord`, enquanto
`adventureMap.js` ainda o usa para o reveal. A interpretação mínima é deixar a primitiva de
coordenada como detalhe interno da fonte de dados e proibir chamadas diretas nos consumidores de
UI. Não duplicar a API nem mover regra de progresso para `mapAnchor`.

### Cluster B3 · câmera, viewport, região ativa e `D12`

**Escopo proposto:** migrar `initialOffsetY`, `onContentSize`, `scrollPinIntoView` e a sonda de
região para o módulo puro; representar `comece_aqui` pela âncora de `creation` em modo
`regionTop`; preservar integralmente a reprojeção de SG-A.

**Barreira de ordem de eventos:** remover a estimativa exige coordenar `onLayout` e
`onContentSizeChange`. A inicialização só pode ocorrer quando `viewportH` e `contentH` reais
existirem, e ambos os callbacks devem poder disparar a reconciliação; o retorno antecipado atual
não pode deixar o mapa no topo se `contentSize` chegar primeiro.

### Cluster B4 · gates, mutantes e controles

**Escopo proposto:** adicionar `TA-1/2/3`, `G-MAP-1..5`, `CN-2/8/9/10` e executar isoladamente os
seis mutantes canônicos: `MT-2`, `MT-24`, `MT-3`, `MT-4`, `MT-25`, `MT-30`.

`G-MAP-1` deve obedecer à emenda posterior `A-18`: a cardinalidade legítima de
`MAP_ANCHOR_FRAMING` é `0..1`, não “exatamente uma”. Zero é obrigatório quando não há resíduo
estético; um só é legítimo após a decisão humana condicional.

### Cluster B5 · evidência física e fechamento

Exige protocolo SG-B próprio: §28 #12, #13, #14 e parcela SG-B de #17; matriz objetiva dos cinco
consumidores nas três faixas; 20 histórias × três faixas, antes/depois; prova pós-correção de
`P-168`; inventário de obras; controles de áreas protegidas; regressão em telefone e aprovação
explícita do fundador. A campanha SG-A não substitui essas provas.

## 5 · `Q6/A-18` — ambiguidade material confirmada

A medição real resolve a geometria derivável: o `ScrollView` já fornece a viewport livre abaixo do
cabeçalho, e a largura útil já é medida depois da sidebar. Isso elimina os `56` fantasmas e impede
compensações de barra/safe area.

Entretanto, para uma história avançada, câmera e `scrollPinIntoView` ainda precisam decidir **onde
a âncora repousa dentro da viewport livre medida**. Essa decisão não é derivável das dimensões: o
estado atual demonstra duas escolhas perceptuais, `0.58` e `0.5`. Logo existe um resíduo
genuinamente estético.

Pela sequência congelada de `A-18`, nenhum agente pode escolher silenciosamente `0.58`, `0.5` ou
um terceiro valor. A decisão só é legítima com comparação visual nas três faixas. O Portão 1,
portanto, não pode ser concedido e nenhuma alteração executável começa.

## 6 · Decisão humana necessária

### Opção A · comparação prospectiva isolada — recomendada

Autorizar um comparador/harness visual **não canônico**, sem promover valor de produto, que use a
mesma viewport medida e produza capturas equivalentes de `0.50` e `0.58` nas três faixas. Depois,
o fundador escolhe o enquadramento, o Mini-SDD é ratificado e os clusters B1–B4 podem ser
implementados atomicamente.

**Consequência:** preserva literalmente `Q6/A-18`; exige uma rodada visual curta antes da
implementação final. Nenhuma das variantes vira produto sem a decisão posterior.

### Opção B · emenda humana direta do contrato

O fundador escolhe expressamente `0.50`, `0.58` ou outro valor e dispensa a comparação prévia.

**Consequência:** desbloqueia a implementação, mas emenda explicitamente a exigência vigente de
capturas comparativas nas três faixas; a decisão e a dispensa precisam ser lavradas em
`DECISIONS.md`. O agente não recomenda esta via sem evidência visual.

## 7 · Portões e estado terminal deste bloco documental

```text
PORTAO_1 ................ FAIL · STOP_HUMAN_DECISION_Q6
PORTAO_2 ................ NÃO INICIADO
PORTAO_3 ................ NÃO INICIADO
IMPLEMENTATION_STARTED .. NÃO
EXECUTABLE_FILES_CHANGED  0
ADB / METRO / TABLET .... NÃO USADOS
SG_B_READY_FOR_PHYSICAL . NÃO
SG_B_READY_FOR_GATE ..... NÃO
NEXT_SAFE_ACTION ........ decisão do fundador entre A e B
```

## 8 · Opção A executada · comparador não canônico

O fundador escolheu a opção A. O comparador foi gerado fora do repositório em:

```text
C:\tmp\ptf_sgb_q6_comparator
```

Propriedades congeladas:

- conteúdo real: assets canônicos finais do mapa, em ordem visual
  `jovens_da_fe → descobridores → pequeninos → comece_aqui`;
- alvo idêntico nos seis quadros: `david_goliath`, coordenada normalizada `(0,69; 0,90)` da região
  `pequeninos`, com a capa local canônica;
- largura da região: `contentW`; altura: `round(contentW / (9/16))`, como no produto;
- compacta: `390 × 844dp`, `contentW=390`, viewport livre vertical `696dp`;
- média: `823 × 1317dp`, sidebar `180dp`, `contentW=643`, viewport livre vertical `1247dp`;
- expandida: `1317 × 823dp`, sidebar `240dp`, `contentW=1077`, viewport livre vertical `753dp`;
- escala de saída: `2×`;
- nenhuma subtração ou compensação de `56dp`;
- dentro de cada par, somente o fator de âncora muda: `0,50` × `0,58`.

| Arquivo | Bytes | SHA256 |
|---|---:|---|
| `compact_050.png` | 3.043.388 | `A15B9D7E57B8C91EB3B980593AD084D07991D7068A1EE816A843CFFBFD731BA0` |
| `compact_058.png` | 3.051.679 | `6A6179206BD5B67C231C3C121DA8615ECC81E4349858E9A629434A532925A8C2` |
| `compact_side_by_side.png` | 6.194.021 | `36F1692C12158DCFCC7D9B5CAFDE4F9D35B75003F70672291E58DB1E6A327CD6` |
| `medium_050.png` | 8.872.538 | `40503BE55BDA1A0A731ACC024901DD3CCBF402B77173CE116A1190A02FF11B83` |
| `medium_058.png` | 8.882.651 | `E6D46D900D8DF4035B18F35C0755D9FFEE336557FDEB52C65BDB467A682E4816` |
| `medium_side_by_side.png` | 18.081.633 | `AD5EF7FB24D3CD912850EA4D36EB399915496172D9D846FDA7E69C0AC522A526` |
| `expanded_050.png` | 7.688.315 | `5B7DC05933D04EAEB443D6706FB5943ACEFC3115AA36E47B6255212C47BA9EF4` |
| `expanded_058.png` | 7.974.432 | `08D431FDF4CD76574ABC6A7AF4264C2B230654BD4FBF36B82B069ED9229DC096` |
| `expanded_side_by_side.png` | 16.156.048 | `2845BBBDB6BDBEA201067103FDE193440C12680FADA9EECA657525620DCE9CA5` |
| `manifest.json` | 3.381 | `8B1F309E59ADA855F3389C003E49AEB35C361BAD31422CE80F01DD2EB8FF7ECA` |

O renderizador descartável `render-comparator.cjs` e todas as imagens permanecem fora do
worktree. Nenhum `.js` canônico, token, asset ou arquivo de produto foi alterado. Nenhum valor foi
promovido. O Portão 1 continua aguardando a escolha visual do fundador.

```text
COMPARATOR_STATUS ........ GERADO · NÃO CANÔNICO
CANONICAL_PROMOTION ...... NÃO
FOUNDER_DECISION_REQUIRED  SIM
```
