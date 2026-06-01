import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LumiAvatar from './LumiAvatar';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

/**
 * LumiLockedState — estado de conteúdo premium bloqueado com Lumi.
 * Tom suave: oportunidade, nunca punição.
 *
 * @param {string}   [title]       — título (padrão: "Aventura especial aguardando!")
 * @param {string}   [message]     — mensagem
 * @param {string}   [actionLabel] — texto do botão
 * @param {function} [onPress]
 * @param {object}   [style]
 */
export default function LumiLockedState({
  title = 'Aventura especial aguardando!',
  message = 'Explore toda a aventura com o Plano Família. Conheça Davi, Jesus e muito mais!',
  actionLabel,
  onPress,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <LumiAvatar variant="locked" size="large" style={styles.avatar} />
      <View style={styles.lockIcon}>
        <Text style={styles.lockEmoji}>🔒</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onPress && (
        <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.82}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: pt.premiumBg,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: pt.gold + '44',
    ...shadows.soft,
    position: 'relative',
  },
  avatar: {
    marginBottom: 8,
    opacity: 0.75,
  },
  lockIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: pt.cream,
    borderRadius: radii.pill,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pt.gold + '44',
  },
  lockEmoji: {
    fontSize: 16,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 17,
    color: pt.premiumText,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.textSoft,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: 16,
    backgroundColor: pt.gold,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  btnText: {
    fontFamily: 'FredokaOne',
    fontSize: 15,
    color: '#FFF',
  },
});
