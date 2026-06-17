/**
 * StoryStoneSlot — base visual (disco de pedra/pergaminho) atrás de cada marcador.
 *
 * Como as artes do mapa agora são só CENÁRIO (sem círculos desenhados pela IA), o
 * app desenha aqui uma BASE neutra sob cada história, dando "encaixe" ao marcador
 * sem parecer botão nem medalhão premium. É puramente DECORATIVA (pointerEvents
 * none) — o toque é do StoryMapMarker, que fica por cima na MESMA âncora (slot 0×0).
 *
 * Tons quentes de pedra/areia/pergaminho, borda sutil e sombra leve. Maior que o
 * avatar (~104px) para emoldurá-lo, mas com opacidade controlada para integrar-se
 * ao mapa. Sem cor forte (sem verde/azul fortes).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE_SIZE = 104; // maior que o avatar (pin ~80), sem dominar o mapa

export default function StoryStoneSlot({ size = BASE_SIZE }) {
  const r = size / 2;
  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { width: size, height: size, marginLeft: -r, marginTop: -r }]}
    >
      {/* Anel de pedra/areia — gradiente quente e suave, com leve sombra de contato */}
      <LinearGradient
        colors={['#DCCCA8', '#C9B689', '#B6A176']}
        start={{ x: 0.25, y: 0.05 }}
        end={{ x: 0.75, y: 0.95 }}
        style={[styles.ring, { width: size, height: size, borderRadius: r }]}
      >
        {/* Miolo de pergaminho claro — dá leitura de "encaixe" sob o avatar */}
        <View
          style={[styles.inner, { width: size * 0.74, height: size * 0.74, borderRadius: size * 0.37 }]}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center', opacity: 0.92 },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(120,98,60,0.35)',
    elevation: 2,
    shadowColor: '#3A2A12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inner: {
    backgroundColor: 'rgba(243,233,210,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(150,128,90,0.28)',
  },
});
