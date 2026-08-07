import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { breakpoints, maxContentWidth } from '../../theme/tokens';

/**
 * ContentContainer — A0.3 (Direção de Arte v1.1 §2.4).
 *
 * Contêiner de CONTEÚDO responsivo: fluido no phone (100% da largura) e
 * CENTRALIZADO com largura máxima em tablet/iPad (o fundo paper50 da tela preenche
 * as laterais). É isso que faz o tablet parecer desenhado, não esticado.
 *
 * Usa `useWindowDimensions` + os tokens (`breakpoints`, `maxContentWidth`) — NUNCA
 * leitura de dimensão congelada em módulo, para responder a rotação e Split View.
 * NÃO estiliza cor/fonte/borda; só resolve largura e centralização.
 *
 * [Fase 6 · B1 · P-30] Deixou de ser base sem uso: além do consumo direto em
 * `StoryDetailScreen`, o antigo `CenteredContent` — a SEGUNDA primitiva de largura, com
 * corte `768` e máximo `720` próprios — passou a delegar aqui. Este arquivo é agora o
 * único lugar onde a largura de coluna é decidida.
 */
export default function ContentContainer({ children, style, ...rest }) {
  const { width } = useWindowDimensions();

  const maxWidth =
    width >= breakpoints.tabletL ? maxContentWidth.tabletL   // ≥900 → 640
    : width >= breakpoints.tablet ? maxContentWidth.tablet   // ≥600 → 560
    : maxContentWidth.phone;                                 // phone → '100%'

  return (
    <View
      style={[{ width: '100%', maxWidth, alignSelf: 'center' }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
