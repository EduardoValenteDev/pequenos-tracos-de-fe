/**
 * coloring60ActivityTheme.js — COR TEMÁTICA de cada parte da Criação (Colorir 60).
 *
 * FONTE ÚNICA. A mesma obra tem a MESMA cor onde quer que apareça: a miniatura na coleção "Minha
 * Criação Cheia de Cor" e a PRÉVIA AMPLIADA da mesma parte usam este mapa — a criança toca a moldura
 * dourada de "Haja luz" e abre uma prévia igualmente dourada. Um só mapa: dois não podem divergir.
 *
 * SEM COR NOVA. Só tokens já existentes do tema (productTheme): Luz = dourado, Vida = verde, Cuidado
 * = coral. Uma atividade fora do mapa cai no neutro (nunca uma cor inventada, nunca um fallback para
 * a cor de outra parte).
 *
 * Shape estável { frame, chipBg, chipText }: `frame` é a borda fina da moldura da obra; `chipBg`/
 * `chipText` são o fundo e o texto do chip do marcador ("1ª parte", etc.).
 */
import { colors } from './productTheme';

const COLORING60_ACTIVITY_THEME = Object.freeze({
  light: { frame: colors.gold, chipBg: colors.goldSoft, chipText: colors.goldDeep },
  living_world: { frame: colors.green, chipBg: colors.greenSoft, chipText: colors.greenDeep },
  people_and_care: { frame: colors.coral, chipBg: colors.beniSoft, chipText: colors.beniDeep },
});

const NEUTRAL_ACTIVITY_THEME = Object.freeze({
  frame: colors.border,
  chipBg: colors.surface,
  chipText: colors.textSoft,
});

/** Tema da parte pela IDENTIDADE (activityId). Id desconhecido/nulo ⇒ neutro, jamais a cor de outra parte. */
export function getColoring60ActivityTheme(activityId) {
  return COLORING60_ACTIVITY_THEME[activityId] ?? NEUTRAL_ACTIVITY_THEME;
}
