import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

/**
 * AvatarImage — avatar com MÁSCARA CIRCULAR real.
 *
 * Container quadrado (size×size) com borderRadius = size/2 e `overflow: 'hidden'`,
 * com a imagem PREENCHENDO o círculo (`cover` por padrão). `cover` evita o retângulo/
 * letterbox interno (importante para as variantes landscape, ex.: dark boy/girl) e dá
 * um padrão visual único a todos os avatares. O recorte circular esconde os cantos.
 * `resizeMode` é configurável por contexto, se necessário.
 *
 * Reutilizado em Home, Perfil, Sidebar, Área dos Pais, Onboarding e no modal de zoom.
 * Decoração (borda/sombra) fica no container externo de cada tela (passar via `style`).
 */
export default function AvatarImage({
  source,
  size,
  resizeMode = 'cover',
  backgroundColor = 'transparent',
  zoom = 1,
  style,
}) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor },
        style,
      ]}
    >
      <Image
        source={source}
        style={[styles.fill, zoom !== 1 && { transform: [{ scale: zoom }] }]}
        resizeMode={resizeMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
});
