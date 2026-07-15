/**
 * StorybookWorldPage — Momento 2: o livro aberto com DAVI E GOLIAS (O2.2 · §12).
 *
 * Spread de duas páginas. Página direita = capa oficial de "Davi e Golias" (david_goliath) com
 * título. Página esquerda = a promessa do app como SELOS IMPRESSOS (ouvir/colorir/brincar/guardar),
 * não botões nem barra de navegação. O Beni aparece como pequeno MEDALHÃO no canto — sem segunda
 * imagem grande. A Criação NÃO aparece aqui.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StorybookBeni from './StorybookBeni';
import StorybookCover from './StorybookCover';
import FaithIcon from '../ui/FaithIcon';
import { OB } from '../../theme/onboardingVisualTokens';

const STAMPS = [
  { key: 'ouvir', icon: 'play', label: 'Ouvir histórias', color: OB.scarf },
  { key: 'colorir', icon: 'atelier', label: 'Colorir', color: '#2E9E6B' },
  { key: 'brincar', icon: 'brincar', label: 'Brincar', color: '#B4708F' },
  { key: 'guardar', icon: 'heart', label: 'Guardar no coração', color: '#D9557A' },
];

function Stamp({ item }) {
  return (
    <View style={styles.stamp}>
      <View style={[styles.stampIcon, { backgroundColor: item.color + '18' }]}>
        <FaithIcon name={item.icon} size={16} color={item.color} />
      </View>
      <Text style={styles.stampLabel} numberOfLines={1}>{item.label}</Text>
    </View>
  );
}

export default function StorybookWorldPage({ width, height }) {
  const coverW = Math.min(width * 0.42, 158);
  const coverH = Math.round(coverW * 1.2);
  return (
    <View style={styles.spread}>
      {/* Página esquerda — promessa como anotações do livro, ligadas por uma linha */}
      <View style={styles.left}>
        <Text style={styles.lead}>Aqui, cada história vira uma aventura.</Text>
        <View style={styles.stamps}>
          <View style={styles.stampLine} pointerEvents="none" />
          {STAMPS.map((s) => <Stamp key={s.key} item={s} />)}
        </View>
      </View>

      {/* Página direita — capa de Davi e Golias (com fallback real) */}
      <View style={styles.right}>
        <StorybookCover storyId="david_goliath" title="Davi e Golias" width={coverW} height={coverH} />
        <Text style={styles.coverTitle}>Davi e Golias</Text>
      </View>

      {/* Medalhão do Beni no canto (sem segunda imagem grande) */}
      <StorybookBeni pose="apontandoDireita" mode="medallion" width={44} style={styles.medallion} />
    </View>
  );
}

const styles = StyleSheet.create({
  spread: { flex: 1, flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 8 },
  left: { flex: 1, paddingRight: 8, justifyContent: 'center', gap: 8 },
  right: { flex: 1, paddingLeft: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  lead: { fontFamily: 'FredokaOne', fontSize: 15, color: OB.title, lineHeight: 20, marginBottom: 2 },
  stamps: { gap: 9, paddingLeft: 10 },
  stampLine: { position: 'absolute', left: 3, top: 6, bottom: 6, width: 2, borderRadius: 1, backgroundColor: OB.goldFaint },
  stamp: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stampIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stampLabel: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '700', color: OB.text, flexShrink: 1 },
  coverTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: OB.title, textAlign: 'center' },
  medallion: { position: 'absolute', right: 2, top: 2 },
});
