/**
 * PalavrinhasPowerDock — barra INFERIOR do Bolso Mágico (P4R8, só na Corrida).
 *
 * Esquerda: medidor da Magia (N de 4) ou "Baú pronto". Direita: até 2 slots de poder (toque ≥ 56,
 * ícone + nome curto). Slot com poder pulsa. Coach mark curto na primeira vez. Acessibilidade:
 * role button, label com nome, hint curto, estado desabilitado quando bloqueado. Apresentação pura.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Easing } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import FaithIcon from '../ui/FaithIcon';

export default function PalavrinhasPowerDock({ magia, bauApos, bauPronto, bolso, onUsar, onAbrirBau, coach, reduzMovim, bloqueado, escudoArmado }) {
  const pulso = useRef(new Animated.Value(0)).current;
  const coachAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduzMovim || bolso.length === 0) { pulso.stopAnimation(); pulso.setValue(0); return undefined; }
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulso, { toValue: 1, duration: 620, useNativeDriver: true }),
      Animated.timing(pulso, { toValue: 0, duration: 620, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [reduzMovim, bolso.length, pulso]);
  // Onboarding: entrada fade (+translateY se houver movimento); saída fade.
  useEffect(() => {
    if (coach) {
      coachAnim.setValue(0);
      Animated.timing(coachAnim, { toValue: 1, duration: reduzMovim ? 240 : 240, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    } else {
      Animated.timing(coachAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [coach, reduzMovim, coachAnim]);
  const escala = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const coachTy = reduzMovim ? 0 : coachAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <View style={styles.dock}>
      {/* Faixa de onboarding LARGA acima do dock (nunca presa à largura do slot; não bloqueia toques) */}
      {coach ? (
        <Animated.View
          pointerEvents="none"
          accessibilityRole="text"
          accessibilityLabel="Poder guardado! Toque nele quando quiser usar."
          style={[styles.coachBand, { opacity: coachAnim, transform: [{ translateY: coachTy }] }]}
        >
          <View style={styles.coachIcon}><FaithIcon name="star" size={18} color={pt.purpleDeep} /></View>
          <Text style={styles.coachTxt} numberOfLines={2}>Poder guardado! Toque nele quando quiser usar.</Text>
        </Animated.View>
      ) : null}
      <View style={styles.esq}>
        <View style={styles.tituloLinha}>
          <Text style={styles.titulo}>Poderes do Beni</Text>
          {escudoArmado ? <View style={styles.escudoBadge}><FaithIcon name="heart" size={12} color={pt.goldDeep} /></View> : null}
        </View>
        {bauPronto ? (
          <Pressable onPress={() => onAbrirBau && onAbrirBau()} accessibilityRole="button" accessibilityLabel="Abrir o Baú pronto" style={({ pressed }) => [styles.bauPronto, pressed && styles.bauProntoPress]}>
            <FaithIcon name="star" size={13} color={pt.goldDeep} /><Text style={styles.bauProntoTxt}>Baú pronto</Text>
          </Pressable>
        ) : (
          <View style={styles.magiaLinha}>
            <FaithIcon name="lumi" size={14} color={pt.purple} />
            <Text style={styles.magiaTxt}>Magia {magia} de {bauApos}</Text>
          </View>
        )}
      </View>
      <View style={styles.slots}>
        {[0, 1].map((i) => {
          const pd = bolso[i];
          if (!pd) return <View key={i} style={styles.slotVazio}><FaithIcon name="star" size={16} color="#D8C7B4" /></View>;
          const Cont = reduzMovim ? View : Animated.View;
          return (
            <Cont key={pd.id} style={reduzMovim ? null : { transform: [{ scale: escala }] }}>
              <Pressable
                onPress={() => onUsar(pd)}
                disabled={!!bloqueado}
                accessibilityRole="button"
                accessibilityLabel={`Usar ${pd.nome}`}
                accessibilityHint="Toque para usar este poder"
                style={({ pressed }) => [styles.slot, pressed && styles.slotPress, bloqueado && styles.slotOff]}
              >
                <FaithIcon name={pd.icon} size={22} color={pt.purpleDeep} />
                <Text style={styles.slotNome} numberOfLines={1}>{pd.curto}</Text>
              </Pressable>
            </Cont>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { width: '100%', maxWidth: 500, minHeight: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, backgroundColor: '#FBF4FF', borderWidth: 2, borderColor: '#E7D4F5', ...shadows.card },
  esq: { alignItems: 'flex-start', gap: 4 },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titulo: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  escudoBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: pt.goldSoft, borderWidth: 1.5, borderColor: pt.goldDeep, alignItems: 'center', justifyContent: 'center' },
  magiaLinha: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  magiaTxt: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.purple },
  bauPronto: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32, paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.pill, backgroundColor: pt.goldSoft, borderWidth: 1.5, borderColor: pt.goldDeep },
  bauProntoPress: { transform: [{ scale: 0.95 }], backgroundColor: '#FFEFC0' },
  bauProntoTxt: { fontFamily: 'FredokaOne', fontSize: 12, color: pt.premiumText },
  slots: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  slotVazio: { width: 56, height: 56, borderRadius: radii.lg, backgroundColor: '#F3ECFA', borderWidth: 2, borderColor: '#E0CDF5', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  slot: { minWidth: 56, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 8, borderRadius: radii.lg, backgroundColor: pt.lilac, borderWidth: 2, borderColor: pt.purple, ...shadows.soft },
  slotPress: { transform: [{ scale: 0.94 }], backgroundColor: '#EAD9FB' },
  slotOff: { opacity: 0.5 },
  slotNome: { fontFamily: 'FredokaOne', fontSize: 12, color: pt.purpleDeep },
  // Faixa LARGA acima do dock: left/right (responsiva), nunca presa à largura do slot; até 2 linhas.
  coachBand: {
    position: 'absolute', left: 0, right: 0, bottom: '100%', marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: radii.lg,
    backgroundColor: pt.lilac, borderWidth: 1.5, borderColor: pt.purple, ...shadows.soft,
  },
  coachIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFFAA', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  coachTxt: { flex: 1, fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.purpleDeep, lineHeight: 18 },
});
