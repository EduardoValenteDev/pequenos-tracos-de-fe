/**
 * ParesStreakMeter.js — medidor de sequência no cabeçalho (R2B · §8/§9).
 *
 * Uma chama que cresce com o nível + o rótulo ("Sequência 2×", "Fogo da Memória!"). Sem
 * streak, mostra só um contorno apagado (não some do layout, para o cabeçalho não pular).
 * A chama é maior do que no vídeo antigo. Pulsa a cada NOVO par (via `eventId`) e ganha um
 * brilho quente no Fogo da Memória. Clássico e Turbo usam o MESMO medidor.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors as pt } from '../../theme/productTheme';
import FaithIcon from '../ui/FaithIcon';

const COR_NIVEL = ['#C9BEB0', '#F3722C', '#E25A12', '#E0A21A'];   // apagado · acesa · maior · fogo
const TAM_NIVEL = [18, 22, 25, 29];

function ParesStreakMeter({ streak = 0, level = 0, label = '', fogo = false, eventId = 0, reduceMotion = false }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  // Pulso a cada novo par (evento). Reduzido: sem pulso.
  useEffect(() => {
    if (!eventId || reduceMotion) return undefined;
    pulse.setValue(1);
    const anim = Animated.sequence([
      Animated.timing(pulse, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [eventId]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Brilho quente contínuo e discreto no Fogo da Memória.
  useEffect(() => {
    if (!fogo || reduceMotion) { glow.stopAnimation(); glow.setValue(0); return undefined; }
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.25, duration: 520, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [fogo]);   // eslint-disable-line react-hooks/exhaustive-deps

  const cor = COR_NIVEL[level] || COR_NIVEL[0];
  const tam = TAM_NIVEL[level] || TAM_NIVEL[0];
  const ativo = level > 0;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale: pulse }] }]}>
      <View style={styles.chamaBox}>
        {fogo && (
          <Animated.View
            pointerEvents="none"
            style={[styles.glow, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] }) }]}
          />
        )}
        <FaithIcon name="combo" size={tam} color={ativo ? cor : COR_NIVEL[0]} />
      </View>
      {ativo && label ? (
        <Text style={[styles.label, fogo && styles.labelFogo]} numberOfLines={1}>{label}</Text>
      ) : (
        <Text style={styles.labelApagado} numberOfLines={1}>Sequência</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 96, justifyContent: 'center' },
  chamaBox: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute', width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FFB84D',
  },
  label: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.beniDeep },
  labelFogo: { color: '#B5480A' },
  labelApagado: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: '#C9BEB0' },
});

export default React.memo(ParesStreakMeter);
