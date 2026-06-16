/**
 * NextAdventureBanner — faixa de convite no rodapé do Mapa Pergaminho.
 *
 * Leva para a MESMA ação do marco atual (abrir a próxima aventura via o fluxo
 * existente). Se a criança já abriu tudo o que está disponível, mostra um
 * convite gentil para revisitar. Linguagem infantil e clara.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SoundButton from '../SoundButton';

export default function NextAdventureBanner({ story, allDone, onPress }) {
  if (!story) return null;
  return (
    <SoundButton style={styles.banner} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>{allDone ? '🎉' : '🧭'}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.kicker}>{allDone ? 'Que jornada linda!' : 'Sua próxima aventura'}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {allDone ? 'Quer rever uma história?' : story.titulo}
        </Text>
      </View>
      <Text style={styles.arrow}>▶</Text>
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FF8A3D',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#FF8A3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  texts: { flex: 1, marginHorizontal: 12 },
  kicker: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#FFF3E6' },
  title: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  arrow: { fontSize: 16, color: '#FFFFFF', fontWeight: '900' },
});
