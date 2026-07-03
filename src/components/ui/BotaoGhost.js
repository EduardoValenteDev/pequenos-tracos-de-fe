import React, { useRef } from 'react';
import { Pressable, Text, Animated, StyleSheet } from 'react-native';
import { color, font, fontSize, fontWeight, motion } from '../../theme/tokens';

/**
 * BotaoGhost — A0.4 (Direção de Arte v1.1). Ação terciária discreta ("Deixar para
 * depois"): sem fundo, sem borda, texto ink400 (muted). Mesmas regras de §2.4:
 * altura mínima 56, texto nunca cortado (2 linhas), largura fluida, alvo ≥56,
 * squish 0.96. Só tokens. Não aplicado a nenhuma tela ainda.
 */
const MIN_TOUCH = 56;

export default function BotaoGhost({ label, onPress, disabled = false, style, textStyle }) {
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
        style={styles.btn}
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
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: font.body,
    fontWeight: fontWeight.body,
    fontSize: fontSize.body,
    color: color.ink400,
    textAlign: 'center',
  },
});
