import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import SoundButton from '../SoundButton';
import FaithIcon from '../ui/FaithIcon';
import BeniSpeechCard from '../beni/BeniSpeechCard';

/**
 * PremiumLockCard — card de bloqueio premium reutilizável.
 *
 * Usado em: histórias premium sem acesso, quiz premium, Converse com Lumi,
 * Momento com Lumi, Devocional, Ateliê no limite de salvamentos.
 *
 * @param {string}   title            — título principal (default: 'Atividade especial')
 * @param {string}   description      — texto explicativo
 * @param {string}   featureName      — nome da funcionalidade bloqueada
 * @param {function} onPrimaryPress   — callback do botão principal
 * @param {function} onSecondaryPress — callback do botão secundário (opcional)
 * @param {string}   primaryLabel     — label do botão principal (default: 'Ver Área dos Pais')
 * @param {string}   secondaryLabel   — label do botão secundário (default: 'Voltar')
 */
export default function PremiumLockCard({
  title = 'Essa aventura é Especial da Família',
  description = 'Peça para um responsável abrir essa área com você.',
  featureName,
  onPrimaryPress,
  onSecondaryPress,
  primaryLabel = 'Ver Área dos Pais',
  secondaryLabel = 'Voltar',
  showBeniLine = true,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <FaithIcon name="lock" size={38} color="#B8860B" />
      </View>

      {featureName ? (
        <Text style={styles.featureName}>{featureName}</Text>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {showBeniLine && (
        <BeniSpeechCard context="premium" avatarVariant="happy" style={styles.beniLine} />
      )}

      {onPrimaryPress && (
        <SoundButton style={styles.primaryBtn} onPress={onPrimaryPress} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
        </SoundButton>
      )}

      {onSecondaryPress && (
        <SoundButton style={styles.secondaryBtn} onPress={onSecondaryPress} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
        </SoundButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBF0',
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: '#F4B400',
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 16,
    ...shadows.card,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFF1BF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  featureName: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: '#B8860B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 22,
    color: pt.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.textSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  beniLine: { width: '100%', marginBottom: 18 },
  primaryBtn: {
    backgroundColor: '#F4B400',
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#F4B400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    marginBottom: 10,
  },
  primaryBtnText: {
    fontFamily: 'FredokaOne', fontSize: 16, color: '#3A2A00',
  },
  secondaryBtn: {
    paddingVertical: 10, paddingHorizontal: 20,
  },
  secondaryBtnText: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.muted,
    fontWeight: '700',
  },
});
