# `82` · F6-SG-B · Implementação, gates locais e `STOP_PHYSICAL_ACTION`

> **Data:** 2026-08-18
>
> **Baseline documental de execução:** `da0a794`
>
> **Commit executável:** `fec7bcb` · `fix: unificar âncora responsiva do mapa`
>
> **Q6/A-18:** `0,50`, único nas três faixas
>
> **Estado terminal desta rodada:** `STOP_PHYSICAL_ACTION`

## 1 · Escopo executado

Os clusters independentes B1–B4 de `F6-SG-B / F6-R2` foram concluídos:

1. `src/services/mapAnchor.js` passou a ser a origem pura de `computeRegionLayout`,
   `getStoryAnchor`, `computeCameraTarget` e `resolveActiveRegion`;
2. `MAP_ANCHOR_FRAMING = 0.5` é único, não varia por faixa e incide somente sobre a viewport
   livre medida;
3. `MapRegion` deriva do mesmo `getStoryAnchor` o slot que contém pino, área de toque, brilho e
   anel medido pelo guia;
4. abertura, reconciliação por `onContentSizeChange` e `scrollPinIntoView` consomem
   `computeCameraTarget`;
5. o container livre é medido antes da montagem do `ScrollView`; morreram a estimativa de `56dp`
   e os fatores locais `0,58`/`0,50` da tela;
6. `comece_aqui` permanece explícito como `mode: 'regionTop'` pela mesma âncora canônica;
7. a reprojeção lógica de SG-A foi preservada e agora é reconciliada quando largura ou altura
   medida da viewport muda;
8. `getStoryMapCoord` permanece exclusivamente como primitiva interna da fonte de dados e do
   reveal; consumidores de UI não o chamam diretamente. Isso preserva a assinatura pública e o
   reveal já congelados pelo PLAN, conforme a reconciliação do artefato `81`.

Não foram alterados assets, histórias, manifestos, acesso, progresso, conquistas, storage,
dependências, tokens, faixas ou arquétipos responsivos.

## 2 · Provas locais

| Prova | Resultado |
|---|---|
| `TA-1..TA-3` / focused | `34/34 PASS` |
| matriz aritmética das 20 histórias × 3 larguras | `60/60 PASS` |
| `G-MAP-1..G-MAP-5` | `PASS` |
| `MT-2`, `MT-24`, `MT-3`, `MT-4`, `MT-25`, `MT-30` | `6/6 KILLED`, isolados em memória |
| `npm run smoke` | `4970/4970 PASS` |
| `npm run verify:runtime` | `PASS` |
| `npm run bundle:check` | `PASS` · Android `2382 modules` |
| `npx expo-doctor` | `17/18` · divergência conhecida de patch; baseline preservada |
| `git diff --check` | `PASS` |

As três larguras da auditoria aritmética foram `390dp`, `643dp` e `1077dp`, representando as
faixas compacta, média e expandida. Cada uma resolveu as 20 coordenadas reais, limites de pino e
clamp de câmera. Essa prova é de aritmética e integração estática; não é apresentada como captura
visual nem como prova de dispositivo.

## 3 · Controles negativos

- `CN-2`: mecanismo local verde (`creation` em `comece_aqui`, `regionTop`, viewport medida);
  observação física da primeira montagem ainda pendente.
- `CN-8`: verde no diff do pacote; zero arquivo protegido alterado.
- `CN-9`: verde; `mapAnchor` não importa faixa, sidebar, token ou arquétipo de `F6-R1`.
- `CN-10`: nenhum custo novo aparece nos testes, mas fluidez real de scroll permanece prova física.
- a geometria do spotlight não foi reimplementada: o registry continua medindo o anel real e
  `BeniGuideOverlay` continua convertendo janela para a origem medida do overlay.

## 4 · Clusters e estado de SG-B

```text
B1 · módulo puro e referência ........ COMPLETO
B2 · pino / toque / brilho / fallback  COMPLETO LOCALMENTE
B3 · câmera / viewport / região / D12  COMPLETO LOCALMENTE
B4 · gates / mutantes / controles ..... COMPLETO
B5 · evidência física e human gate .... PENDENTE
F6_SG_B ............................... NÃO CONCEDIDO
```

## 5 · Próximo bloco causal · validação física obrigatória

Nenhuma interação física foi feita nesta rodada. Antes do human gate, B5 exige:

1. §28 #12: abertura do mapa em retrato e paisagem no tablet, provando câmera correta, viewport
   real e ausência de pulo;
2. §28 #13: tour completo, verificando coincidência entre pino, alvo de toque, brilho e holofote;
3. §28 #14: comparação das 20 histórias nas três faixas, antes/depois, sem deslocamento
   inaceitável;
4. parcela SG-B de §28 #17: regressão em telefone; o evidence gap aceito em SG-A não vira prova
   automática de SG-B;
5. tabela objetiva 5 consumidores × 3 faixas, com captura por célula;
6. inventário de obras antes/depois, confirmando que a campanha do mapa não toca acervo;
7. observação de `CN-2`, `CN-10`, `SD-5`, `SD-6` e aprovação explícita do fundador.

O próximo ato exige autorização física própria e preparação determinística de dispositivo. Até
lá, `F6-SG-C` continua causalmente bloqueado por `OR-2`.

```text
PHYSICAL_VALIDATION_REQUIRED  SIM
SG_B_READY_FOR_HUMAN_GATE     NÃO
STOP_CATEGORY                 STOP_PHYSICAL_ACTION
NEXT_CAUSAL_ACTION            autorizar e executar o protocolo físico B5 de F6-SG-B
```
