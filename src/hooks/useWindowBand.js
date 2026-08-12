// ─────────────────────────────────────────────────────────────────────────────
// [Fase 6 · F6-R1.2 · F6-SG-C · TK-C-001] FAIXA DE JANELA — leitura ÚNICA.
//
// Este é o único ponto autorizado a traduzir MEDIDA em POLÍTICA. Antes dele a
// pergunta "sou tablet?" estava espalhada em comparações soltas, cada uma livre
// para divergir da outra — o mesmo defeito que `P-30` já corrigiu para o corte
// telefone↔tablet e que `SD-11` proíbe reintroduzir por outro caminho.
//
// A cadeia é sempre esta, e nesta ordem:
//   largura da janela → FAIXA → composição → superfície
//
// Regras que este módulo respeita e que os portões do smoke vigiam:
//   · `G-RSP-1` — nunca `Dimensions.get`: layout não é fotografia congelada.
//     `useWindowDimensions` é reativo e sobrevive a rotação, Split View e resize.
//   · `G-RSP-3` — nunca `Platform.isPad` nem `expo-device`: idioma de aparelho
//     não é medida de janela. Um iPad em Slide Over responde "sou tablet" com
//     320dp reais de largura, e a criança veria uma composição larga espremida.
//   · `G-RSP-7` — nenhum quarto breakpoint nasce aqui. Os três cortes vêm de
//     `tokens.breakpoints`, que continua a fonte única.
//
// `TK-C-001` entrega o hook SEM CONSUMIDOR, de propósito: a migração dos pontos
// que hoje comparam largura é `TK-C-003`, e a adoção por família é posterior.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { breakpoints } from '../theme/tokens';

// As três faixas do contrato. Congeladas: um quarto valor aqui seria exatamente
// o breakpoint paralelo que `G-RSP-7` existe para impedir.
export const BANDS = Object.freeze({
  COMPACT: 'compact',
  MEDIUM: 'medium',
  EXPANDED: 'expanded',
});

/**
 * Classificador PURO: largura em dp → faixa.
 *
 * Separado do hook de propósito. É o que torna a política provável em Node, sem
 * React e sem dispositivo — a prova é da CONSEQUÊNCIA (qual faixa sai de qual
 * largura), não da mera existência de um token.
 *
 * Os limiares são `>=`, então cada corte pertence à faixa de cima: `600` já é
 * média e `900` já é expandida.
 *
 * A forma `width >= breakpoints.tablet` é literal e deliberada: `CN-1` exige que
 * TODO consumidor do corte telefone↔tablet escreva a comparação da mesma
 * maneira. Um apelido local (`dp`, `w`) faria a política divergir na escrita
 * antes de divergir no valor — foi assim que os dez `768` soltos nasceram.
 */
export function bandForWidth(width) {
  if (!Number.isFinite(width)) return BANDS.COMPACT;
  if (width >= breakpoints.tabletL) return BANDS.EXPANDED;
  if (width >= breakpoints.tablet) return BANDS.MEDIUM;
  return BANDS.COMPACT;
}

/**
 * `useWindowBand() → { width, height, isLandscape, band }`
 *
 * A faixa vem da largura LÓGICA atual da janela — nunca do modelo do aparelho.
 * `isLandscape` é geometria observada, não orientação declarada pelo sistema:
 * janela quadrada conta como retrato, o que mantém o valor determinístico.
 */
export function useWindowBand() {
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => ({
      width,
      height,
      isLandscape: width > height,
      band: bandForWidth(width),
    }),
    [width, height],
  );
}
