/**
 * PalavrinhasHud — HUD COMPACTO por modo (P4R8). Região superior enxuta: no máximo contagem,
 * tempo (o relógio vive no cabeçalho) e sequência/recorde. A Magia e o Bolso Mágico saíram para a
 * barra inferior (PalavrinhasPowerDock). Componente de apresentação puro (recebe números por props).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as pt } from '../../theme/productTheme';
import FaithIcon from '../ui/FaithIcon';

const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

export default function PalavrinhasHud({ nivel, cfg, tema, concluidas, brilhoTotal, comboPalavras, melhorCombo }) {
  if (nivel === 'facil') {
    return (
      <View style={styles.hud}>
        <View style={styles.trilha}>
          {Array.from({ length: cfg.metaPalavras }).map((_, i) => (
            <View key={i} style={[styles.trilhaDot, i < concluidas && { backgroundColor: tema.accent, borderColor: tema.accent }]} />
          ))}
        </View>
        <Text style={styles.hudTxt}>{concluidas} de {cfg.metaPalavras} palavras</Text>
        <View style={styles.hudTag}><FaithIcon name="star" size={13} color={pt.goldDeep} /><Text style={styles.hudTagTxt}>{brilhoTotal}</Text></View>
      </View>
    );
  }
  // modos INFINITOS (medio/dificil): N palavras · sequência N · recorde N
  return (
    <View style={styles.hud}>
      <Text style={styles.hudTxt}>{plural(concluidas, 'palavra', 'palavras')}</Text>
      <View style={styles.hudTag}><FaithIcon name="combo" size={13} color={comboPalavras > 0 ? tema.accent : '#E4C9B4'} /><Text style={styles.hudTagTxt}>sequência {comboPalavras}</Text></View>
      <View style={styles.hudTag}><FaithIcon name="star" size={13} color={pt.goldDeep} /><Text style={styles.hudTagTxt}>recorde {melhorCombo}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { width: '100%', maxWidth: 500, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, gap: 8 },
  hudTxt: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft },
  hudTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hudTagTxt: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.beniDeep },
  trilha: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  trilhaDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E6D6AE' },
});
