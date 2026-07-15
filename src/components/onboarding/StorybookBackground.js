/**
 * StorybookBackground — fundo externo PERSISTENTE do Livro Vivo (O2.2 · §5).
 *
 * Creme quente com luz suave no centro, azul-céu discreto no topo, nuvens nos cantos, colinas
 * e folhas nas bordas inferiores, ramos lineares dourados, pontos de luz e a SOMBRA projetada
 * pelo livro. Tudo vetorial (react-native-svg), visível no aparelho mas controlado. Decorativo:
 * pointerEvents="none", fora da árvore de acessibilidade, sem animação em loop.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Path, Circle, G, RadialGradient, Defs, Stop, Rect } from 'react-native-svg';
import { OB, OB_BG_GRADIENT } from '../../theme/onboardingVisualTokens';

export default function StorybookBackground({ width, height, bookRect }) {
  const w = width;
  const h = height;
  // Retângulo do livro (para projetar a sombra). Fallback central.
  const bx = bookRect?.x ?? w * 0.08;
  const by = bookRect?.y ?? h * 0.16;
  const bw = bookRect?.w ?? w * 0.84;
  const bh = bookRect?.h ?? h * 0.6;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={OB_BG_GRADIENT} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="centerLight" cx="50%" cy="42%" r="60%">
            <Stop offset="0" stopColor="#FFFDF6" stopOpacity="0.7" />
            <Stop offset="1" stopColor="#FFFDF6" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Luz suave no centro */}
        <Rect x="0" y="0" width={w} height={h} fill="url(#centerLight)" />

        {/* Sombra projetada pelo livro */}
        <Ellipse cx={bx + bw / 2} cy={by + bh + 10} rx={bw * 0.46} ry={16} fill={OB.bookShadow} opacity={0.5} />

        {/* Nuvens nos cantos superiores */}
        <G opacity={0.7}>
          <Ellipse cx={w * 0.14} cy={h * 0.07} rx={58} ry={22} fill="#FFFFFF" opacity={0.6} />
          <Ellipse cx={w * 0.26} cy={h * 0.09} rx={40} ry={16} fill="#FFFFFF" opacity={0.45} />
          <Ellipse cx={w * 0.88} cy={h * 0.05} rx={50} ry={20} fill="#FFFFFF" opacity={0.55} />
          <Ellipse cx={w * 0.78} cy={h * 0.08} rx={34} ry={14} fill="#FFFFFF" opacity={0.4} />
        </G>
        {/* Céu discreto (azul profundo só na borda superior) */}
        <Path d={`M0 0 L${w} 0 L${w} ${h * 0.04} Q ${w * 0.5} ${h * 0.09} 0 ${h * 0.04} Z`} fill={OB.skyTop} opacity={0.5} />

        {/* Ramos lineares dourados nos cantos */}
        <G stroke={OB.goldSoft} strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.7}>
          <Path d={`M${w * 0.06} ${h * 0.16} q 18 -10 30 4 q -6 6 -14 2`} />
          <Path d={`M${w * 0.94} ${h * 0.15} q -18 -10 -30 4 q 6 6 14 2`} />
        </G>

        {/* Colinas suaves + folhas embaixo */}
        <Path d={`M0 ${h} L0 ${h * 0.9} Q ${w * 0.3} ${h * 0.83} ${w * 0.55} ${h * 0.89} Q ${w * 0.82} ${h * 0.95} ${w} ${h * 0.88} L${w} ${h} Z`} fill={OB.peach} opacity={0.55} />
        <Path d={`M0 ${h} L0 ${h * 0.95} Q ${w * 0.4} ${h * 0.9} ${w * 0.72} ${h * 0.94} L${w} ${h * 0.93} L${w} ${h} Z`} fill={OB.lilac} opacity={0.5} />
        <G opacity={0.75}>
          <Path d={`M${w * 0.08} ${h * 0.95} q 14 -18 30 -8 q -8 18 -30 8 Z`} fill="#8FBF7A" />
          <Path d={`M${w * 0.9} ${h * 0.94} q -14 -18 -30 -8 q 8 18 30 8 Z`} fill="#8FBF7A" opacity={0.9} />
          <Circle cx={w * 0.12} cy={h * 0.91} r={4} fill={OB.goldSoft} />
          <Circle cx={w * 0.86} cy={h * 0.9} r={4} fill="#E58AA6" />
        </G>

        {/* Pontos de luz difusa (estáticos) */}
        <G opacity={0.75}>
          <Circle cx={w * 0.22} cy={h * 0.28} r={2.6} fill={OB.goldSoft} />
          <Circle cx={w * 0.8} cy={h * 0.22} r={2.2} fill={OB.goldSoft} />
          <Circle cx={w * 0.64} cy={h * 0.12} r={1.8} fill={OB.gold} />
          <Circle cx={w * 0.1} cy={h * 0.46} r={2} fill={OB.goldSoft} opacity={0.7} />
        </G>
      </Svg>
    </View>
  );
}
