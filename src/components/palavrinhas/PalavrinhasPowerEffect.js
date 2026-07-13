/**
 * PalavrinhasPowerEffect — overlay de efeito de poder com MÁQUINA VISUAL local (P4R8 §10).
 *
 * Fases: prepare → impact → resolve → finish. `onImpact` é chamado UMA vez no início de `impact`
 * (momento do consumo e da lógica no jogo); `onFinish` ao terminar (limpeza + retomada). Enquanto
 * ativo, a tela mantém o timer pausado e as letras bloqueadas. Usa apenas transform/opacity/scale
 * (native driver); posições determinísticas; respeita movimento reduzido (trajetória → fade/escala).
 * Cada poder tem cor e rótulo próprios (dados em palavrinhasPoderes), garantindo distinção clara.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import FaithIcon from '../ui/FaithIcon';
import { fxTiming } from '../../services/palavrinhasPoderes';

export default function PalavrinhasPowerEffect({ poder, reduzMovim, onImpact, onFinish }) {
  const [fase, setFase] = useState('prepare');
  const anim = useRef(new Animated.Value(0)).current;      // 0 (prepare) → 1 → 1.6 (impact) → 0 (resolve)
  const orb = useRef(new Animated.Value(0)).current;       // trajetória determinística de partículas
  const timers = useRef([]);
  const montado = useRef(true);
  const t = fxTiming(poder.id);

  useEffect(() => {
    montado.current = true;
    const push = (fn, ms) => { const id = setTimeout(() => { if (montado.current) fn(); }, ms); timers.current.push(id); };
    anim.setValue(0); orb.setValue(0);
    if (reduzMovim) { anim.setValue(1); } else {
      Animated.timing(anim, { toValue: 1, duration: t.prepare, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
      Animated.timing(orb, { toValue: 1, duration: t.prepare + t.impact, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
    }
    // impact — consumo + lógica no jogo
    push(() => {
      setFase('impact'); if (onImpact) { try { onImpact(); } catch (_) { /* noop */ } }
      if (!reduzMovim) Animated.sequence([Animated.timing(anim, { toValue: 1.6, duration: t.impact * 0.5, useNativeDriver: true }), Animated.timing(anim, { toValue: 1.2, duration: t.impact * 0.5, useNativeDriver: true })]).start();
    }, t.prepare);
    // resolve
    push(() => { setFase('resolve'); if (!reduzMovim) Animated.timing(anim, { toValue: 0, duration: t.resolve, useNativeDriver: true }).start(); }, t.prepare + t.impact);
    // finish — limpeza + retomada
    push(() => { setFase('finish'); if (onFinish) { try { onFinish(); } catch (_) { /* noop */ } } }, t.prepare + t.impact + t.resolve);
    return () => { montado.current = false; timers.current.forEach(clearTimeout); timers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const escala = anim.interpolate({ inputRange: [0, 1, 1.6], outputRange: [0.5, 1, 1.28] });
  const op = anim.interpolate({ inputRange: [0, 0.25, 1.2, 1.6], outputRange: [0, 1, 1, 1] });
  // 3 partículas em posições determinísticas ao redor do ícone
  const parts = [0, 1, 2].map((k) => {
    const ang = (k * 120 - 90) * (Math.PI / 180);
    const dx = Math.cos(ang) * 70; const dy = Math.sin(ang) * 70;
    const tx = reduzMovim ? 0 : orb.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
    const ty = reduzMovim ? 0 : orb.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
    return { k, tx, ty };
  });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap]} accessibilityLabel={poder.label} data-fase={fase}>
      <View style={styles.dim} />
      <Animated.View style={{ opacity: op, alignItems: 'center', transform: reduzMovim ? [] : [{ scale: escala }] }}>
        <View style={[styles.anel, { borderColor: poder.cor }]}>
          <View style={[styles.icon, { backgroundColor: poder.cor + '22' }]}><FaithIcon name={poder.icon} size={50} color={poder.cor} /></View>
          {parts.map((p) => (
            <Animated.View key={p.k} pointerEvents="none" style={[styles.part, { transform: [{ translateX: p.tx }, { translateY: p.ty }] }]}>
              <FaithIcon name="star" size={18} color={poder.cor} />
            </Animated.View>
          ))}
        </View>
        <Text style={[styles.label, { color: '#FFF' }]}>{poder.label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', zIndex: 29 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,10,2,0.5)' },
  anel: { width: 150, height: 150, borderRadius: 75, borderWidth: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)', ...shadows.card },
  icon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  part: { position: 'absolute', left: '50%', top: '50%', marginLeft: -9, marginTop: -9 },
  label: { fontFamily: 'FredokaOne', fontSize: 24, letterSpacing: 1, marginTop: 12, textShadowColor: '#6A3A00', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
});
