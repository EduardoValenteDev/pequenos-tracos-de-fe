import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BeniAvatar from './BeniAvatar';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

const DEFAULT_MESSAGES = {
  home:        'Vamos continuar sua aventura de fé?',
  adventures:  'Escolha uma história e caminhe comigo.',
  atelier:     'Crie com calma. Sua imaginação também conta histórias.',
  trophies:    'Cada estrela mostra um passo da sua jornada.',
  profile:     'Aqui fica o seu cantinho especial.',
  premium:     'Essa aventura está guardada para quando um responsável liberar.',
  coming_soon: 'Essa história está sendo preparada com carinho.',
};

/**
 * BeniGuideCard — card guia com Beni para orientação emocional nas telas.
 *
 * @param {string}   [title]       — título opcional em destaque
 * @param {string}   [message]     — mensagem de Beni
 * @param {string}   [context]     — contexto para mensagem padrão se message não for passado
 * @param {string}   [variant]     — variant do BeniAvatar (padrão: 'happy')
 * @param {boolean}  [compact]     — versão compacta para mobile
 * @param {string}   [actionLabel] — texto do botão de ação
 * @param {function} [onPress]     — callback do botão
 * @param {object}   [style]       — estilo extra
 */
export default function BeniGuideCard({
  title,
  message,
  context = 'home',
  variant = 'happy',
  compact = false,
  actionLabel,
  onPress,
  style,
}) {
  const displayMessage = message ?? DEFAULT_MESSAGES[context] ?? DEFAULT_MESSAGES.home;

  if (compact) {
    return (
      <View style={[styles.compact, style]}>
        <BeniAvatar variant={variant} size="small" />
        <View style={styles.compactContent}>
          <Text style={styles.compactMessage} numberOfLines={2}>{displayMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <BeniAvatar variant={variant} size="medium" style={styles.avatar} />
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{displayMessage}</Text>
        </View>
      </View>
      {actionLabel && onPress && (
        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.82}>
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: pt.cream,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#6C9EFF30',
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { flexShrink: 0 },
  content: { flex: 1 },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 14,
    color: pt.text,
    marginBottom: 3,
  },
  message: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.textSoft,
    lineHeight: 19,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: 12,
    backgroundColor: '#6C9EFF',
    borderRadius: radii.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 14,
    color: '#FFF',
  },

  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: pt.cream,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#6C9EFF28',
    ...shadows.soft,
  },
  compactContent: { flex: 1 },
  compactMessage: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.textSoft,
    fontWeight: '700',
    lineHeight: 17,
  },
});
