/**
 * NextAdventureBanner — faixa de convite no rodapé do Mapa Pergaminho (M2.2).
 *
 * Reforça a CAMINHADA para cima e leva à MESMA ação do marco atual: ao tocar,
 * abre o card de foco da próxima aventura (via onPress, na tela). Tom dourado/
 * pergaminho (combina com o mapa), não laranja chapado. Se a criança já abriu
 * tudo o que está disponível, convida a rever uma história.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../SoundButton';

export default function NextAdventureBanner({ story, allDone, onPress }) {
  if (!story) return null;
  return (
    <SoundButton style={styles.wrap} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={['#F6C76A', '#E0A23C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.iconBubble}>
          <Text style={styles.icon}>{allDone ? '🎉' : '⛰️'}</Text>
        </View>
        <View style={styles.texts}>
          <Text style={styles.kicker}>{allDone ? 'Que jornada linda!' : 'Subir para a próxima aventura'}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {allDone ? 'Rever uma história' : story.titulo}
          </Text>
        </View>
        <Text style={styles.arrow}>▴</Text>
      </LinearGradient>
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#9A6B16',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
  },
  banner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  texts: { flex: 1, marginHorizontal: 12 },
  kicker: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#6B4A10' },
  title: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  arrow: { fontSize: 18, color: '#FFFFFF', fontWeight: '900' },
});
