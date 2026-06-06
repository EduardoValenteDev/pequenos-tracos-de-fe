import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BeniAvatar from './BeniAvatar';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

/**
 * BeniGuideBubble — Beni + balão de fala reutilizável (guia da criança).
 *
 * Avatar à esquerda + balão de texto curto à direita. Tom visual configurável.
 * Sem animação complexa. Texto curto, legível, não ocupa a tela inteira.
 *
 * @param {string}   message        — fala do Beni (curta)
 * @param {string}   [avatarVariant='happy'] — variant do BeniAvatar
 * @param {'soft'|'purple'|'yellow'|'blue'|'success'} [tone='soft']
 * @param {boolean}  [compact=false] — versão compacta (avatar menor, menos padding)
 * @param {string}   [actionLabel]   — rótulo opcional de um botão de ação
 * @param {function} [onAction]      — callback do botão de ação
 * @param {object}   [style]         — estilo extra no container
 */
const TONES = {
  soft:    { bg: pt.cream,      border: '#F4B40033', tip: pt.cream,      action: pt.gold,   actionText: '#FFF' },
  purple:  { bg: pt.lilac,      border: '#C4B5FD',   tip: pt.lilac,      action: '#8E44AD', actionText: '#FFF' },
  yellow:  { bg: pt.goldSoft,   border: pt.gold + '55', tip: pt.goldSoft, action: pt.gold,   actionText: '#FFF' },
  blue:    { bg: pt.blueSoft,   border: pt.blue + '55', tip: pt.blueSoft, action: pt.blue,   actionText: '#FFF' },
  success: { bg: pt.greenSoft,  border: pt.green + '55', tip: pt.greenSoft, action: pt.green, actionText: '#FFF' },
};

export default function BeniGuideBubble({
  message,
  avatarVariant = 'happy',
  tone = 'soft',
  compact = false,
  actionLabel,
  onAction,
  style,
}) {
  const t = TONES[tone] ?? TONES.soft;

  return (
    <View style={[styles.row, style]}>
      <BeniAvatar
        variant={avatarVariant}
        size={compact ? 'small' : 'medium'}
        style={styles.avatar}
      />
      <View style={styles.bubbleWrap}>
        <View
          style={[
            styles.bubble,
            compact && styles.bubbleCompact,
            { backgroundColor: t.bg, borderColor: t.border },
          ]}
        >
          {/* Ponta do balão apontando para o Beni */}
          <View style={[styles.tip, { borderRightColor: t.tip }]} />
          <Text style={[styles.text, compact && styles.textCompact]} numberOfLines={3}>
            {message}
          </Text>

          {actionLabel && onAction && (
            <TouchableOpacity
              style={[styles.action, { backgroundColor: t.action }]}
              onPress={onAction}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionText, { color: t.actionText }]}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: { flexShrink: 0 },
  bubbleWrap: { flex: 1 },
  bubble: {
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    position: 'relative',
    ...shadows.soft,
  },
  bubbleCompact: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.sm,
  },
  tip: {
    position: 'absolute',
    left: -7,
    top: '42%',
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
  },
  text: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.text,
    lineHeight: 20,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  action: {
    marginTop: 10,
    borderRadius: radii.pill,
    paddingVertical: 9,
    alignItems: 'center',
  },
  actionText: {
    fontFamily: 'FredokaOne',
    fontSize: 14,
  },
});
