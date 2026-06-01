import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LumiAvatar from './LumiAvatar';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

/**
 * LumiEmptyState — estado vazio com Lumi.
 * Usado em galeria sem artes, conquistas futuras, histórias em preparação.
 *
 * @param {string}   title       — título do estado vazio
 * @param {string}   message     — mensagem de Lumi
 * @param {string}   [actionLabel]
 * @param {function} [onPress]
 * @param {object}   [style]
 */
export default function LumiEmptyState({ title, message, actionLabel, onPress, style }) {
  return (
    <View style={[styles.container, style]}>
      <LumiAvatar variant="thinking" size="large" style={styles.avatar} />
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
    padding: 32,
    backgroundColor: pt.cream,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: pt.border,
    ...shadows.soft,
  },
  avatar: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: pt.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.textSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
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
