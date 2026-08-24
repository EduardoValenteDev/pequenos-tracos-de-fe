import React from 'react';
import { View } from 'react-native';
import { maxContentWidth } from '../../theme/tokens';
import { BANDS } from '../../hooks/useWindowBand';
import { useContentViewport } from '../../context/ContentViewportContext';

/**
 * ContentContainer — A0.3 (Direção de Arte v1.1 §2.4).
 *
 * Contêiner de CONTEÚDO responsivo: fluido no phone (100% da largura) e
 * CENTRALIZADO com largura máxima em tablet/iPad (o fundo paper50 da tela preenche
 * as laterais). É isso que faz o tablet parecer desenhado, não esticado.
 *
 * A dimensão continua REATIVA (rotação, Split View, resize) e a largura máxima
 * continua vindo do token `maxContentWidth` — NUNCA de leitura congelada em módulo.
 * NÃO estiliza cor/fonte/borda; só resolve largura e centralização.
 *
 * [Fase 6 · B1 · P-30] Deixou de ser base sem uso: além do consumo direto em
 * `StoryDetailScreen`, o antigo `CenteredContent` — a SEGUNDA primitiva de largura, com
 * corte `768` e máximo `720` próprios — passou a delegar aqui. Este arquivo é agora o
 * único lugar onde a largura de coluna é decidida.
 *
 * [Fase 6 · F6-SG-C · TK-C-003 · emenda `Q-C2-1`] MUDANÇA DE MECANISMO, não de
 * comportamento: a comparação local contra `breakpoints` deu lugar a `useWindowBand`.
 * Os três degraus e os três valores são exatamente os de antes — este é o ÚNICO
 * ponto do app cuja composição já era ternária, e por isso o único onde `MEDIUM` e
 * `EXPANDED` legitimamente diferem. A asserção `A0.3` foi reapontada ao mecanismo
 * novo preservando a intenção original, não relaxada.
 *
 * [Fase 6 · F6-SG-C · TK-C-005] A decisão de largura vira POLÍTICA NOMEADA, e não
 * muda de dono. `EditorialSurface` precisa saber onde a coluna de leitura termina
 * para entregar o excedente da faixa expandida à região de apoio (`SD-3`); a única
 * forma de ele saber isso SEM reimplementar a regra é perguntando aqui. Mesma
 * expressão, mesmos degraus, mesmos tokens — só ganhou nome.
 *
 * [Fase 6 · `F6.2`] MUDANÇA DE REFERENCIAL, não de política. A faixa deixa de ser
 * lida da JANELA e passa a ser lida da REGIÃO em que este contêiner vive. Onde não
 * há barra lateral entre a tela e a borda, os dois números são o mesmo; onde há, a
 * janela era um número que ninguém entregou a esta coluna. Os três degraus, os três
 * *tokens* e a expressão continuam idênticos — quem mudou foi a origem da largura.
 */

/**
 * A largura máxima da coluna de conteúdo para uma faixa. `'100%'` na compacta
 * (fluido), número nas demais. Fonte única — `maxContentWidth`, nunca literal.
 */
export function contentColumnMaxWidth(band) {
  return (
    band === BANDS.EXPANDED ? maxContentWidth.tabletL   // ≥900 → 640
    : band === BANDS.MEDIUM ? maxContentWidth.tablet    // ≥600 → 560
    : maxContentWidth.phone                             // compacta → '100%'
  );
}

export default function ContentContainer({ children, style, ...rest }) {
  const { band } = useContentViewport();
  const maxWidth = contentColumnMaxWidth(band);

  return (
    <View
      style={[{ width: '100%', maxWidth, alignSelf: 'center' }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
