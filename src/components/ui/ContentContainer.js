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
 * NÃO estiliza cor/fonte/borda; só resolve largura e centralização. Não é aplicado
 * a nenhuma tela ainda (A0.3 só cria a base).
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
