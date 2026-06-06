import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SoundButton from '../SoundButton';
import { colors } from '../../theme/colors';

/**
 * SafeScreenHeader — cabeçalho seguro e global do app.
 *
 * Garante que os botões do topo (Voltar / Início) NUNCA sejam cortados,
 * espremidos ou sobrepostos, em qualquer iPhone (notch, tela pequena, título
 * longo). Três zonas horizontais: esquerda e direita com LARGURA MÍNIMA FIXA,
 * centro flexível que TRUNCA o título (numberOfLines=1 + ellipsizeMode="tail")
 * sem nunca empurrar os botões laterais.
 *
 * Safe Area: paddingTop = insets.top (status bar nunca é invadido).
 * Área tocável dos botões: mínimo 44×44 + hitSlop generoso.
 *
 * @param {string}   title
 * @param {string}   [subtitle]
 * @param {string}   [leftLabel='Voltar']
 * @param {function} [onBack]              — sem onBack, a zona esquerda fica vazia
 * @param {boolean}  [showHome=false]
 * @param {function} [onHome]
 * @param {string}   [backgroundColor]
 * @param {string}   [titleColor]
 * @param {string}   [buttonColor]
 * @param {'light'|'dark'} [variant='light']
 */
const SIDE_MIN = 104;          // cabe "‹ Voltar" / "🏠 Início" sem cortar
const HIT = { top: 12, bottom: 12, left: 12, right: 12 };

export default function SafeScreenHeader({
  title,
  subtitle,
  leftLabel = 'Voltar',
  onBack,
  showHome = false,
  onHome,
  backgroundColor = colors.cardBg,
  titleColor,
  buttonColor,
  variant = 'light',
}) {
  const insets = useSafeAreaInsets();
  const isDark = variant === 'dark';
  const tColor = titleColor ?? (isDark ? '#FFFFFF' : colors.text);
  const bColor = buttonColor ?? (isDark ? '#FFFFFF' : colors.primary);
  const subColor = isDark ? 'rgba(255,255,255,0.8)' : colors.textLight;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) + 6, backgroundColor }]}>
      {/* Zona esquerda — largura mínima fixa */}
      <View style={styles.leftZone}>
        {onBack ? (
          <SoundButton
            onPress={onBack}
            hitSlop={HIT}
            style={styles.sideBtn}
            activeOpacity={0.7}
            accessibilityLabel={leftLabel}
          >
            <Text style={[styles.sideText, { color: bColor }]} numberOfLines={1}>‹ {leftLabel}</Text>
          </SoundButton>
        ) : null}
      </View>

      {/* Zona central — flexível e truncável */}
      <View style={styles.centerZone}>
        <Text style={[styles.title, { color: tColor }]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: subColor }]} numberOfLines={1} ellipsizeMode="tail">
            {subtitle}
          </Text>
        )}
      </View>

      {/* Zona direita — largura mínima fixa */}
      <View style={styles.rightZone}>
        {showHome ? (
          <SoundButton
            onPress={onHome}
            hitSlop={HIT}
            style={[styles.sideBtn, styles.sideBtnRight]}
            activeOpacity={0.7}
            accessibilityLabel="Início"
          >
            <Text style={[styles.sideText, { color: bColor }]} numberOfLines={1}>🏠 Início</Text>
          </SoundButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    minHeight: 52,
  },
  leftZone: {
    minWidth: SIDE_MIN,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightZone: {
    minWidth: SIDE_MIN,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  centerZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  // Área tocável mínima 44×44, nunca depende de largura automática
  sideBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
  },
  sideBtnRight: { alignItems: 'flex-end' },
  sideText: { fontFamily: 'FredokaOne', fontSize: 15, fontWeight: '700' },
  title: { fontFamily: 'FredokaOne', fontSize: 16, textAlign: 'center' },
  subtitle: { fontFamily: 'Nunito', fontSize: 12, textAlign: 'center', marginTop: 1 },
});
