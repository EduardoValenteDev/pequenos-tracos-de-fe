import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt } from '../../theme/productTheme';

/**
 * AppScreen — wrapper padronizado de Safe Area para telas principais.
 *
 * Regras de uso:
 * - Use em telas headless (tab screens, headerShown: false).
 * - NÃO use em telas com Stack header nativo — o header já cuida do inset top.
 * - Para Stack screens, use apenas paddingBottom quando necessário.
 *
 * Props:
 *   children            — conteúdo da tela
 *   backgroundColor     — cor de fundo (default: pt.background)
 *   scroll              — se true, envolve em ScrollView
 *   contentContainerStyle — passado para ScrollView
 *   style               — style extra no container
 *   noBottomPadding     — se true, não aplica paddingBottom seguro
 *   applyTopInset       — se true, aplica paddingTop do inset (só para headless screens)
 */
export default function AppScreen({
  children,
  backgroundColor,
  scroll = false,
  contentContainerStyle,
  style,
  noBottomPadding = false,
  applyTopInset = false,
}) {
  const insets = useSafeAreaInsets();

  const topPad = applyTopInset ? insets.top : 0;
  const botPad = noBottomPadding ? 0 : insets.bottom;

  const bg = backgroundColor ?? pt.background;

  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: bg }, style]}
        contentContainerStyle={[
          { paddingTop: topPad, paddingBottom: botPad + 32 },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
