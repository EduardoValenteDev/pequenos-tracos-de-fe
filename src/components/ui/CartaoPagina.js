import React from 'react';
import { View, StyleSheet } from 'react-native';
import { color, radius, shadow } from '../../theme/tokens';

/**
 * CartaoPagina — A0.4 (Direção de Arte v1.1). O "cartão-página" do mundo papel:
 * fundo paper100, borda paper200, radius de card e a SOMBRA ÚNICA dos tokens
 * (nunca mais de uma sombra por elemento). Substitui os "cards brancos chapados"
 * do dashboard antigo. Só tokens. Não aplicado a nenhuma tela ainda.
 *
 * Props: children, style (override de layout externo).
 */
export default function CartaoPagina({ children, style, ...rest }) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.paper100,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: color.paper200,
    padding: 14,
    // SOMBRA ÚNICA (tokens.shadow) — uma sombra por elemento.
    shadowColor: shadow.color,
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    shadowOffset: shadow.offset,
    elevation: 3,
  },
});
