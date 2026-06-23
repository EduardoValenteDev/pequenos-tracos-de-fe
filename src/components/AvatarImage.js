import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

/**
 * AvatarImage — avatar com MÁSCARA CIRCULAR real.
 *
 * Container quadrado (size×size) com borderRadius = size/2 e `overflow: 'hidden'`,
 * com a imagem preenchendo por dentro. Padrão `contain` para não cortar personagens
 * (os avatares têm proporções mistas — quadrados e algumas variantes landscape);
 * o fundo suave preenche o círculo atrás da imagem. Nunca deixa "quadrado" aparente:
 * o recorte circular esconde os cantos.
 *
 * Reutilizado em Home, Perfil, Sidebar, Área dos Pais, Onboarding e no modal de zoom.
 * Decoração (borda/sombra) fica no container externo de cada tela (passar via `style`).
 */
export default function AvatarImage({
  source,
  size,
  resizeMode = 'contain',
  backgroundColor = 'transparent',
  style,
}) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor },
        style,
      ]}
    >
      <Image source={source} style={styles.fill} resizeMode={resizeMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
});
