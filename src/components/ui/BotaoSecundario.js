import React, { useRef } from 'react';
import { Pressable, Text, Animated, StyleSheet } from 'react-native';
import { color, font, fontSize, fontWeight, radius, border, motion } from '../../theme/tokens';

/**
 * BotaoSecundario — A0.4 (Direção de Arte v1.1). Ação secundária "fantasma":
 * contorno terracota sobre papel, texto terracota. NÃO compete com o primário
 * (um herói por tela). Mesmas regras de §2.4 dos botões: altura mínima 56,
 * texto nunca cortado (2 linhas), largura fluida, alvo ≥56, squish 0.96.
 * Só tokens. Não aplicado a nenhuma tela ainda.
 */
const MIN_TOUCH = 56;

export default function BotaoSecundario({ label, onPress, disabled = false, style, textStyle }) {
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
  wrap: { alignSelf: 'stretch' },
  btn: {
    minHeight: MIN_TOUCH,
    minWidth: MIN_TOUCH,
    borderRadius: radius.pill,
    backgroundColor: color.paper50,
    borderWidth: 1.5,
    borderColor: color.terra500,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { borderColor: color.paper200 },
  label: {
    fontFamily: font.bodyBold,
    fontWeight: fontWeight.uiLabel,
    fontSize: fontSize.body,
    color: color.terra500,
    textAlign: 'center',
  },
});
