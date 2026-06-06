import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import SoundButton from '../SoundButton';
import FaithIcon from '../ui/FaithIcon';
import { BeniAvatar } from '../beni';
import { getBeniGuideMessage } from '../../data/beniGuideMessages';

/**
 * LockedStoryFallback — tela amigável para acesso premium negado.
 *
 * Mostrado quando uma tela premium é acessada por usuário gratuito.
 * Não exibe preço, não pressiona compra, não causa tela branca.
 *
 * @param {function} onBack          — navega de volta para Aventuras
 * @param {function} onCallResponsible — navega para ParentArea (gate protege a entrada)
 * @param {string}   title            — mensagem principal (opcional)
 * @param {string}   subtitle         — mensagem complementar (opcional)
 */
export default function LockedStoryFallback({
  onBack,
  onCallResponsible,
  title = 'Essa aventura é Especial da Família.',
  subtitle = 'Peça para um responsável abrir essa área com você.',
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <BeniAvatar variant="locked" size="medium" />
          <View style={styles.lockBadge}>
            <FaithIcon name="lock" size={16} color="#7C3AED" />
          </View>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.beniLine}>{getBeniGuideMessage('premiumBlocked')}</Text>

        {onBack && (
          <SoundButton style={styles.backBtn} onPress={onBack} activeOpacity={0.85}>
            <Text style={styles.backBtnText}>Voltar para Aventuras</Text>
          </SoundButton>
        )}

        {onCallResponsible && (
          <SoundButton style={styles.responsibleBtn} onPress={onCallResponsible} activeOpacity={0.85}>
            <Text style={styles.responsibleBtnText}>Chamar responsável</Text>
          </SoundButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: pt.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: radii.xl,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...shadows.card,
  },
  iconCircle: {
    marginBottom: 16,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: pt.text,
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.textSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 12,
  },
  beniLine: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: '100%',
    backgroundColor: pt.border,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 15,
    color: pt.text,
  },
  responsibleBtn: {
    width: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  responsibleBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 15,
    color: '#FFF',
  },
});
