# Caso 13 · STOP_PRODUCT_DEFECT · análise de owner

**Data:** 2026-08-18  
**Decisão do fundador:** `CASO_13 = FAIL` · `STOP_PRODUCT_DEFECT = SIM`  
**Escopo deste artefato:** análise e documentação; nenhuma edição executável.

## Lacre da evidência

O artefato `54` está commitado em `de82844`. A cópia congelada do logcat é usada no lacre;
o arquivo vivo de captura continua aberto pelo coletor e não é a autoridade de hash.

```text
PRE ancestor TAR ........ 77A4D15ED234DE286C382E4B962E1AA6F39671BB3324D1F4C66F3DB5ADB729FA
PRE_RETRY RK A .......... 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
PRE_RETRY RK B .......... 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
POS RK A ................ 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
POS RK B ................ 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
POS appdata scoped TAR .. 4181F22C7DBF7758B1EF370157511B2BF5551C5B73D5DD92F32A92C143557492
POS logcat congelado .... 168336D06F5DB55B9C6F638A5CB962B4F48E3D01FABD22F606C8E71DB874BA67
Bundle B testado ........ 8D8E3C9E314F37F547C98BED12C024C5DFDAC18FE7206109AED27963B005882D
```

Tamanhos respectivos: 17.423.872; 49.152; 49.152; 49.152; 49.152; 17.285.120;
4.916.529; 17.246.298 bytes. Os caminhos permanecem sob
`C:\tmp\ptf_f6_video2_ready` e `C:\tmp\ptf_f6_video3_ready`.

## Owner exato

```text
FASE .................... Fase 6
PACOTE .................. F6-R3.5 · Lifecycle & Resize Stability / compatibilidade
SUBPORTÃO ............... F6-SG-A
TASK DO CASO ............ TK-A-075 · Caso 13 · rollback
PRECONDIÇÃO VIOLADA .... TK-A-050 · rollback determinístico / Q8 r.9
WRITER/GATE ............. TK-A-048..TK-A-050 · TK-A-053 · TA-13 · G-CMP-4
RISCO/BLOQUEADOR ........ RG-1 · SD-8
```

Não pertence a uma fase futura. O próprio PLAN torna os 17 casos critério de saída de
`F6-SG-A`, e `TK-A-075` pertence nominalmente a `F6-R3.5`.

## Contrato violado

`Q8` §41.5, principalmente regra 9: o rollback deve continuar capaz de consumir o formato
anterior enquanto existir obra nesse formato. Também foram violados o resultado exigido de
`TK-A-075` (nenhuma obra órfã) e a invariante `SD-8` de zero desaparecimento/substituição visual.

A regra 3 também é atingida na apresentação: incompatibilidade não autoriza substituição por
canvas limpo. Os bytes não foram apagados, mas a pintura foi substituída visualmente por lineart
limpo.

## Causa-raiz no código

O writer atual, em `src/components/ColoringCanvas.js:705-709`, exporta o payload lógico com:

```text
W/H = LW/LH = 1122/1402
logicalW/logicalH = 1122/1402
paintSchemaVersion/layoutVersion = 1/1
```

O rollback `a190b3e`, em `ColoringCanvas.js:500-523`, conhece apenas a regra antiga. Depois de
resolver o pointer/blob, `validatePaint` compara estritamente `p.W === W && p.H === H`, onde
`W/H` são o canvas da viewport do rollback (`1440/2156` na execução). Como
`1122/1402 != 1440/2156`, emite `PAINT_INVALID`.

`ColoringCanvas.js:961-963` registra o healing e chama `onPaintInvalid`; depois
`ColoringScreen.js:858-863` descarta o candidato em memória e escolhe o modo `lineart`. Daí as
duas linhas causais observadas. Não é colisão do pointer `v:3`, corrupção do PNG ou ausência de
tinta: é incompatibilidade dimensional entre a nova semântica de `W/H` e o validador antigo.

## Menor correção causal admissível

O rollback exato não pode ser alterado, pois deixaria de provar rollback para uma versão já
publicada. A correção deve ser no writer atual: produzir uma representação ativa que mantenha
um ramo visual consumível pelo leitor antigo e, simultaneamente, preserve a representação lógica
para o leitor novo. A forma mínima plausível é um payload aditivo com:

1. ramo `data` + `W/H` de compatibilidade legado, projetado para a geometria histórica;
2. ramo nomeado de dados lógicos para o leitor atual;
3. leitor atual escolhendo o ramo lógico; leitor antigo ignorando campos novos e consumindo o ramo
   legado;
4. promoção somente após releitura dos dois ramos; nenhuma exclusão da representação anterior
   antes da prova de rollback.

Se a investigação de implementação demonstrar que o payload único não satisfaz todas as
viewports suportadas, o escopo mínimo sobe para retenção explícita de duas representações no
writer/storage. Isso deve ser decidido no mini-fluxo SDD; não se altera `a190b3e`.

Arquivos provavelmente afetados:

- `src/components/ColoringCanvas.js` — exportador e leitor do ramo novo;
- `src/services/coloring60DrawingStorage.js` — somente se for necessário reter/promover dois
  artefatos;
- `scripts/testing/artworkVersionHarness.js` — regressão real do leitor `a190b3e`;
- `scripts/smoke.js` — gate estrutural, se o contrato exigir lacre textual;
- artefatos `spec/plan/tasks/analyze` de `F6-R3.5` e registro prospectivo.

Nenhuma mudança nativa foi identificada: o escopo causal é JavaScript/storage. Novo build nativo
não é exigido; a validação usa o mesmo dev client e troca de Metro.

## Dependência dos vídeos seguintes

O protocolo `42` fixa `R4/CASO 13` concluído **e lacrado** antes do restante de `R5` e, com mais
força, antes do ato consuntivo final `#7 ∪ #9`. Um `FAIL` não satisfaz essa precondição.
Portanto, os Vídeos 4–8 estão bloqueados.

## Bloco mínimo proposto — não autorizado para implementação

1. mini-SDD de defeito em `F6-R3.5`: adendo de spec → clarify/checklist → Portão 1 → plano
   causal → Portão 2 → tasks/analyze → Portão 3;
2. implementar compatibilidade reversa no writer, sem dependência e sem alterar dados existentes;
3. regressão que executa o validador real de `a190b3e` contra o payload novo, mais `TA-13`,
   `G-CMP-4`, mutante vermelho e inventário de pointer/blobs;
4. `npm run verify:runtime`, testes focados e `npx expo-doctor`, preservando a divergência de patch
   já ratificada;
5. nova validação prospectiva do Caso 13, com nova obra de prova produzida somente quando o
   fundador autorizar escrita; o FAIL histórico permanece imutável;
6. somente um `PASS` prospectivo lacrado pode desbloquear o Vídeo 4.

```text
CURRENT_F6_STATUS = F6-SG-A BLOQUEADO · STOP_PRODUCT_DEFECT
NEXT_SAFE_BLOCK    = MINI-SDD DE CORREÇÃO F6-R3.5 · AGUARDAR AUTORIZAÇÃO
```
