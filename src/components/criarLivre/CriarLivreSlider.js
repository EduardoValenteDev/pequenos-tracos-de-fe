/**
 * CriarLivreSlider.js — slider compacto e ESTÁVEL do Criar livre (C1.1 · §2).
 *
 * ── Causa da instabilidade no C1 ──────────────────────────────────────────────
 * A versão anterior lia `e.nativeEvent.locationX` no PanResponder. `locationX` é relativo ao
 * elemento TOCADO — quando o dedo arrasta por cima do polegar (um View filho), a referência
 * vira o polegar e o valor SALTA/volta. Aqui usamos SEMPRE coordenada ABSOLUTA de tela
 * (`pageX`/`gestureState.moveX`) menos a posição absoluta da trilha (medida com `measureInWindow`),
 * com `clamp`. Uma referência única e estável — sem saltos.
 *
 * O gesto é PROTEGIDO (`onPanResponderTerminationRequest: false`, `onShouldBlockNativeResponder`)
 * para o backdrop do painel NUNCA roubar o toque — o painel não fecha ao arrastar. O polegar é
 * um Animated.Value setado direto no gesto (acompanha o dedo na hora), e o `value` externo (preset)
 * reposiciona o polegar quando não há arrasto.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function CriarLivreSlider({
  value, min, max, onChange, onPreset, presets = [],
  color = '#2B5BA1', trackColor = '#EFE6D4', accessibilityLabel = 'Tamanho',
}) {
  const wrapRef = useRef(null);
  const trackXRef = useRef(0);
  const trackWRef = useRef(1);
  const draggingRef = useRef(false);
  const posAnim = useRef(new Animated.Value(0)).current;   // posição do polegar em px (imediata)
  const lastPresetRef = useRef(null);

  // O PanResponder é criado UMA vez; enxerga min/max/callbacks atuais por ref (sem recriar).
  const cfg = useRef({ min, max, onChange, onPreset, presets });
  cfg.current = { min, max, onChange, onPreset, presets };

  const measure = () => new Promise((res) => {
    if (!wrapRef.current?.measureInWindow) { res(); return; }
    wrapRef.current.measureInWindow((x, y, w) => {
      trackXRef.current = x; trackWRef.current = Math.max(1, w); res();
    });
  });

  const applyTouch = (absX) => {
    const { min: lo, max: hi, onChange: oc, onPreset: op, presets: ps } = cfg.current;
    const px = clamp(absX - trackXRef.current, 0, trackWRef.current);
    posAnim.setValue(px);
    const v = Math.round(clamp(lo + (px / trackWRef.current) * (hi - lo), lo, hi));
    oc && oc(v);
    if (ps.length) {
      const near = ps.find((p) => Math.abs(p - v) <= 1);
      if (near != null && near !== lastPresetRef.current) { lastPresetRef.current = near; op && op(near); }
      else if (near == null) lastPresetRef.current = null;
    }
  };

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,   // NÃO cede o gesto → painel não fecha
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: (e) => {
      draggingRef.current = true;
      lastPresetRef.current = null;
      const px = e.nativeEvent.pageX;
      measure().then(() => applyTouch(px));
    },
    onPanResponderMove: (e, g) => applyTouch(g.moveX),   // moveX = X absoluto de tela
    onPanResponderRelease: () => { draggingRef.current = false; },
    onPanResponderTerminate: () => { draggingRef.current = false; },
  })).current;

  const syncThumb = () => {
    const frac = (clamp(value, min, max) - min) / Math.max(1, max - min);
    posAnim.setValue(frac * trackWRef.current);
  };

  // value externo (preset) → reposiciona o polegar quando NÃO está arrastando.
  useEffect(() => { if (!draggingRef.current) syncThumb(); }, [value, min, max]);   // eslint-disable-line

  return (
    <View
      ref={wrapRef}
      onLayout={() => measure().then(() => { if (!draggingRef.current) syncThumb(); })}
      style={styles.wrap}
      {...pan.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: Math.round(value) }}
    >
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.fill, { width: posAnim, backgroundColor: color }]} />
        {presets.map((p) => {
          const f = (p - min) / Math.max(1, max - min);
          return <View key={p} style={[styles.tick, { left: `${f * 100}%` }]} />;
        })}
      </View>
      <Animated.View style={[styles.thumb, { transform: [{ translateX: Animated.subtract(posAnim, 13) }], borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 48, justifyContent: 'center' },   // área de toque alta (§11.3)
  track: { height: 8, borderRadius: 4 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4 },
  tick: { position: 'absolute', top: -2, width: 2, height: 12, marginLeft: -1, borderRadius: 1, backgroundColor: 'rgba(58,42,18,0.18)' },
  thumb: {
    position: 'absolute', left: 0, width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#FFFDF8', borderWidth: 3, top: 11,
    shadowColor: '#3A2A12', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
});

export default React.memo(CriarLivreSlider);
