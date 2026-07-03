import React, { useRef } from 'react';
import { Pressable, Text, Animated, StyleSheet } from 'react-native';
import { color, font, fontSize, fontWeight, radius, motion } from '../../theme/tokens';

/**
 * BotaoPrimario — A0.4 (Direção de Arte v1.1). ÚNICA cor de ação: terracota.
 *
 * Regras de ferro (§2.4): altura MÍNIMA 56 (nunca fixa), texto NUNCA cortado
 * (sem reticências, sem truncar em 1 linha — quebra em até 2 linhas), largura
 * FLUIDA (alignSelf stretch, sem width fixo), alvo ≥56×56, "squish" scale 0.96 no
 * press. Só tokens — zero hex hardcoded. Não aplicado a nenhuma tela ainda.
 *
 * Props: label (string), onPress, disabled, style, textStyle.
 * (Haptics NÃO é acionado neste bloco — preparado para o A0.5/A13.)
 */
const MIN_TOUCH = 56;

export default function BotaoPrimario({ label, onPress, disabled = false, style, textStyle }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to) =>
    Animated.timing(scale, { toValue: to, duration: motion.fast, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => !disabled && press(motion.pressScale)}
        onPressOut={() => press(1)}
        hitSlop={8}
        style={[styles.btn, disabled && styles.disabled]}
      >
        <Text style={[styles.label, textStyle]} numberOfLines={2} minimumFontScale={0.85} adjustsFontSizeToFit>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },                 // largura fluida (nunca width fixo)
  btn: {
    minHeight: MIN_TOUCH,                          // cresce se o texto quebrar em 2 linhas
    minWidth: MIN_TOUCH,
    borderRadius: radius.pill,
    backgroundColor: color.terra500,              // ÚNICA cor de ação
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { backgroundColor: color.paper200 },
  label: {
    fontFamily: font.bodyBold,
    fontWeight: fontWeight.uiLabel,
    fontSize: fontSize.body,
    color: color.onTerra,
    textAlign: 'center',
  },
});
