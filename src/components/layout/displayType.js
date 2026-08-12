import { font, fontSize, displayScaleTablet } from '../../theme/tokens';
import { BANDS } from '../../hooks/useWindowBand';

/**
 * displayType — auxiliar ÚNICO do tipo de exibição (Fase 6 · F6-R1.3 · F6-SG-C ·
 * `TK-C-061`, `Q4` passo 2).
 *
 * POR QUE ESTE ARQUIVO EXISTE. `displayScaleTablet` foi declarado no A0.1 e passou
 * a Fase inteira sem um único consumidor — o defeito que `P-82`/`P-148` nomeiam:
 * *token* declarado e inerte. `TK-C-015` determinou, por escrito, que ele NÃO é
 * obsoleto: o PLAN §17.2 já havia decidido "PERTENCE — ganha consumidor real", e
 * nomeou o consumidor exigido — *"escala do tipo de exibição (`fontSize.display`,
 * `fontSize.displayXL`, família `Fraunces`) nas faixas média e expandida, aplicada
 * por um único auxiliar dos arquétipos Hub e Editorial"*.
 *
 * "UM ÚNICO AUXILIAR" É A PARTE VERIFICÁVEL. Dois arquétipos precisam da mesma
 * resposta; se cada um a calculasse, o app teria de novo duas primitivas para uma
 * decisão só — literalmente o defeito `P-30`, agora em tipografia em vez de largura.
 * Por isso a conta vive aqui e os dois PERGUNTAM. `G-RSP-2` cobra as duas coisas:
 * que os *tokens* tenham consumidor real, e que Hub e Editorial devolvam a MESMA
 * escala — o que só é verdade enquanto o auxiliar for um só.
 *
 * DOIS ESTADOS NUM SISTEMA DE TRÊS FAIXAS, DE PROPÓSITO. A compacta usa a medida
 * base; média e expandida usam a MESMA escala. Não é lapso: o PLAN §17.2 registra
 * que a faixa expandida ganha **composição** (mais colunas, região de apoio), não
 * heróis maiores — um terceiro degrau tipográfico não tem justificativa de conteúdo,
 * e inventá-lo aqui seria criar política que ninguém pediu.
 *
 * `SD-11`/`G-RSP-7`: nenhuma faixa, limiar ou escala nasce neste arquivo. `BANDS`
 * vem do hook real e os três números vêm de `tokens.js`. Este auxiliar decide
 * ONDE a escala se aplica — nunca QUANTO ela vale.
 */

/** Um decimal: mata o ruído de ponto flutuante (34 × 1,10 = 37,400000000000006). */
function arredondar(valor) {
  return Math.round(valor * 10) / 10;
}

/**
 * O fator da faixa. Média e expandida escalam; a compacta É a medida base.
 *
 * Faixa desconhecida cai em `1` — não escalar é o recuo seguro: um título grande
 * demais numa janela estreita quebra a linha e empurra o conteúdo para fora.
 */
export function displayTypeScale(band) {
  return band === BANDS.MEDIUM || band === BANDS.EXPANDED ? displayScaleTablet : 1;
}

/**
 * Os dois degraus de exibição já escalados, com a família que os desenha.
 *
 * Devolve os dois porque quem escolhe entre `display` (celebração/heróis) e
 * `displayXL` (nome no certificado) é a TELA — o arquétipo entrega a política, não
 * o texto. Nada aqui renderiza: um auxiliar que devolvesse JSX estaria redesenhando
 * tela, e nenhum arquétipo desta Fase faz isso.
 */
export function displayTypeSizes(band) {
  const scale = displayTypeScale(band);
  return Object.freeze({
    fontFamily: font.display,
    scale,
    display: arredondar(fontSize.display * scale),
    displayXL: arredondar(fontSize.displayXL * scale),
  });
}
