/**
 * StoryMapMarker — marcador (pin médio) do Mapa Pergaminho (M3).
 *
 * O pin fica CENTRADO na âncora (coordenada normalizada da história) e o label
 * sai SEMPRE para um lado seguro (below/left/right), em até 2 linhas, sem cortar
 * pela tela. Tamanhos MÉDIOS (presença sem cobrir o mapa). A capa grande aparece
 * no StoryFocusModal. Estados: completed (✓), current (anel dourado + halo),
 * available (anel branco), locked (anel cinza + cadeado, capa esmaecida). Sem emoji.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import SoundButton from '../SoundButton';
import RecoverableImage from '../ui/RecoverableImage';
import { color, font } from '../../theme/tokens';
import { getStoryCover } from '../../assets/storyCovers';
import { useResolvedStoryCover } from '../../hooks/useResolvedStoryMedia';

// Tamanhos reduzidos de novo (B3.2): pins mais delicados sobre a arte, ainda com
// avatar/badge legíveis e bons de tocar. As histórias ficam diretamente sobre o
// cenário do mapa (sem base/círculo atrás — removido na correção do B2.8).
// `nextLocked` (B3.7) = próxima história da jornada que está BLOQUEADA: visual de
// locked (tamanho/cadeado) mas com pulso sutil na cor da região, indicando "a
// jornada continua aqui" sem liberar acesso.
const SIZE = { current: 68, available: 58, completed: 58, locked: 56, nextLocked: 56 };
const RING = {
  completed:  { color: '#5EBE6E', width: 3 },
  current:    { color: '#F4B73E', width: 4 },
  available:  { color: '#FFFFFF', width: 3 },
  locked:     { color: '#D8CFC0', width: 2 },
  nextLocked: { color: '#D8CFC0', width: 2 },
};
// Cor GLOBAL de "próxima aventura bloqueada" (B3.8): azul celeste com brilho claro,
// visível sobre mapas sépia (a cor da região se misturava demais). Convite a
// continuar a jornada — não erro/alerta, não "desbloqueado".
const NEXTLOCKED_COLOR = '#4FC3FF';
const NEXTLOCKED_GLOW = '#EAFBFF';

const LABEL_W = 84; // legenda ainda menor (B3.2) — ocupa menos do mapa

// Caixa do label posicionada por lado, mantendo-se SEMPRE dentro da tela (o pin
// está em x ~0.40–0.78, então uma caixa de ~84px ao redor cabe nos dois lados).
function labelBoxStyle(side, size) {
  const below = { top: size + 3, left: (size - LABEL_W) / 2, width: LABEL_W, alignItems: 'center' };
  if (side === 'left') return { ...below, left: (size - LABEL_W) / 2 - 12, alignItems: 'flex-start' };
  if (side === 'right') return { ...below, left: (size - LABEL_W) / 2 + 12, alignItems: 'flex-end' };
  return below;
}

export default function StoryMapMarker({
  story,
  state = 'locked',
  labelPos = 'below',
  showLabel = true,
  markerScale = 1,
  completedColor = '#5EBE6E', // default seguro p/ uso fora do mapa; no mapa vem da região
  currentColor = '#F4B73E',   // idem; no mapa = cor da região (B3.6)
  measureRef,                 // UX 2.3.1: ref de MEDIÇÃO (só no marco current/nextLocked)
  onPress,
}) {
  // F2.4e.4: capa remota (file://) p/ david_goliath com pack ready + arquivo existente;
  // fallback local (getStoryCover) idêntico ao anterior para todas as outras condições.
  const cover = useResolvedStoryCover(story.id, getStoryCover(story.id));
  const isCurrent = state === 'current';
  const isNextLocked = state === 'nextLocked';
  const isLocked = state === 'locked';
  const showLock = isLocked || isNextLocked; // cadeado + acessibilidade "(bloqueada)"
  const shouldPulse = isCurrent || isNextLocked; // só UM pulsa por vez (definido fora)
  // Escala opcional por história (coord.markerScale) — permite um pin maior/menor
  // que os do mesmo estado SEM mudar o tamanho global. Limites de segurança.
  const scale = Math.min(1.25, Math.max(0.85, markerScale || 1));
  const size = Math.round((SIZE[state] || SIZE.available) * scale);
  const ring = RING[state] || RING.available;
  const inner = size - ring.width * 2;
  // Cor da BORDA por estado: completed → completedColor (região); current →
  // currentColor (região); nextLocked → azul celeste GLOBAL (não some no sépia);
  // demais mantêm a cor do estado.
  const ringColor = state === 'completed' ? completedColor
    : isCurrent ? currentColor
    : isNextLocked ? NEXTLOCKED_COLOR
    : ring.color;
  // Brilho do pulso: current na cor da região; nextLocked no azul celeste global.
  const haloFill = isNextLocked ? `${NEXTLOCKED_COLOR}40` : `${currentColor}33`;
  const haloBorder = isNextLocked ? `${NEXTLOCKED_GLOW}CC` : `${currentColor}99`;
  // Capa esmaecida: locked mais apagada; nextLocked só levemente (não "desativado").
  const coverDim = isLocked ? 0.55 : isNextLocked ? 0.78 : 1;

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!shouldPulse) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shouldPulse, pulse]);
  // nextLocked pulsa MAIS sutil que current (menor amplitude e opacidade).
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, isNextLocked ? 1.1 : 1.16] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: isNextLocked ? [0.3, 0.6] : [0.35, 0.7] });

  // O pin (SoundButton) tem tamanho `size` e fica centrado na âncora (slot 0×0).
  return (
    <SoundButton
      accessibilityLabel={`${story.titulo}${showLock ? ' (bloqueada)' : ''}`}
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.pin, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }]}
    >
      {shouldPulse && (
        <Animated.View
          style={[
            styles.halo,
            {
              width: size + 16,
              height: size + 16,
              borderRadius: (size + 16) / 2,
              backgroundColor: haloFill, // brilho translúcido (região ou azul global)
              borderColor: haloBorder,
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
          ]}
        />
      )}
      <View
        ref={measureRef}
        collapsable={measureRef ? false : undefined}
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: ringColor, borderWidth: ring.width },
          isCurrent
            ? [styles.currentShadow, { shadowColor: currentColor }]
            : isNextLocked
              ? [styles.currentShadow, { shadowColor: NEXTLOCKED_COLOR }]
              : styles.softShadow,
        ]}
      >
        <View style={[styles.circle, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          {/* [P3J-R] A capa é a mesma de antes (source via hook); só ganhou recarga limitada. Se
              falhar, a inicial da história entra ATRÁS e o pin continua identificável — sem estado
              de carregamento morando aqui. */}
          {cover ? (
            <RecoverableImage source={cover} style={[styles.cover, coverDim < 1 && { opacity: coverDim }]} resizeMode="cover"
              renderFallback={() => (
                <View style={[styles.fallback, styles.fallbackBehind, { backgroundColor: story.corCapa || story.themeColor || '#BCA77E' }]}>
                  <Text style={styles.fallbackText}>{(story.titulo || '?').trim().charAt(0).toUpperCase()}</Text>
                </View>
              )}
            />
          ) : (
            <View style={[styles.fallback, { backgroundColor: story.corCapa || story.themeColor || '#BCA77E' }]}>
              <Text style={styles.fallbackText}>{(story.titulo || '?').trim().charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        {state === 'completed' && (
          <View style={[styles.badge, styles.doneBadge, { backgroundColor: completedColor }]}><Text style={styles.doneBadgeText}>✓</Text></View>
        )}
        {showLock && (
          <View style={[styles.badge, styles.lockBadge]}><Text style={styles.lockBadgeText}>🔒</Text></View>
        )}
      </View>

      {/* Label opcional (showLabel). No MAPA fica oculto (showLabel={false}) p/ não
          poluir a arte — o título segue no accessibilityLabel, no modal e nas telas
          da história. Quando exibido: dentro da tela, lado seguro, até 2 linhas. */}
      {showLabel && (
        <View style={[styles.labelBox, labelBoxStyle(labelPos, size)]}>
          <View style={[styles.labelPill, isLocked && styles.labelPillLocked]}>
            <Text
              style={[styles.label, isLocked && styles.labelLocked]}
              numberOfLines={2}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {story.titulo}
            </Text>
          </View>
        </View>
      )}
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  pin: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: 'rgba(244,183,62,0.30)', borderWidth: 2, borderColor: 'rgba(255,214,120,0.55)' },
  ring: { alignItems: 'center', justifyContent: 'center', backgroundColor: color.paper50 },
  // [F6.4A] Era a única sombra PRETA do sistema visual, a 0.25 — e ela se repete em cada
  // pin de cada região. O contrato do papel pede tinta quente e sombra suave, como já
  // valia em todas as primitivas de `ui/`. O relevo continua; o que sai é o halo
  // cinza-frio que endurecia o pin contra a arte do mapa.
  softShadow: { elevation: 3, shadowColor: color.ink900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  currentShadow: { elevation: 8, shadowColor: '#F4B73E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10 },
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: color.paper300 },
  cover: { width: '100%', height: '100%' },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  // Só quando existe capa: a inicial ocupa o círculo sem empurrar a imagem para fora.
  fallbackBehind: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  fallbackText: { fontFamily: 'FredokaOne', fontSize: 26, color: '#FFFFFF' },
  badge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doneBadge: { backgroundColor: '#5EBE6E' },
  doneBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  lockBadge: { backgroundColor: '#8C8478' },
  lockBadgeText: { fontSize: 9 },
  labelBox: { position: 'absolute' },
  labelPill: {
    backgroundColor: 'rgba(255,250,238,0.94)',
    borderRadius: 8,
    paddingVertical: 1.5,
    paddingHorizontal: 6,
  },
  labelPillLocked: { backgroundColor: 'rgba(247,242,232,0.80)' },
  label: { fontFamily: font.body, fontSize: 9, fontWeight: '800', color: color.ink900, textAlign: 'center' },
  labelLocked: { color: '#8A7C66' },
});
