import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font, fontSize, fontWeight, radius } from '../../theme/tokens';

/**
 * ChipOrnamentado — A0.4 (Direção de Arte v1.1). Chip do mundo papel: fundo
 * paper100, borda gold500 fina, texto ink900 — sentence case, SEM emoji (Lei 3) e
 * SEM CAPS espaçada (Lei 4). Um ornamento opcional (nó de ilustração próprio) pode
 * ser passado via `icon` — nunca emoji. Só tokens. Não aplicado a nenhuma tela ainda.
 *
 * Props: label (string), icon (ReactNode opcional — ícone do set próprio), style, textStyle.
 */
export default function ChipOrnamentado({ label, icon = null, style, textStyle }) {
  return (
    <View style={[styles.chip, style]}>
      {icon}
      <Text style={[styles.label, icon ? styles.labelWithIcon : null, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: color.paper100,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: color.gold500,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  label: {
    fontFamily: font.bodyBold,
    fontWeight: fontWeight.uiLabel,
    fontSize: fontSize.caption,
    color: color.ink900,
  },
  labelWithIcon: { marginLeft: 6 },
});
