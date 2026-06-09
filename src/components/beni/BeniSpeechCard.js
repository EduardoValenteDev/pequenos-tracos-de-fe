import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BeniAvatar from './BeniAvatar';
import SoundButton from '../SoundButton';
import { getBeniLine, hasBeniLineAudio } from '../../data/beniLines';
import { colors } from '../../theme/colors';

/**
 * BeniSpeechCard — cartão reutilizável de fala do Beni.
 *
 * Mostra o Beni com uma fala curta e, quando houver áudio real, um botão
 * "Ouvir Beni". Hoje não há áudio → o botão não aparece (ou mostra que a
 * narração será preparada, conforme `showAudioHint`). NUNCA trava a tela.
 *
 * @param {string}  context        — chave de beniLines (ex: 'home', 'parentArea')
 * @param {string}  [text]         — sobrescreve a fala do contexto
 * @param {number}  [index]        — força um índice da fala
 * @param {'child'|'adult'} [variant='child'] — 'adult' usa rótulo "Dica do Beni"
 * @param {string}  [avatarVariant='happy']
 * @param {function}[onListen]     — callback do botão (futuro: tocar áudio)
 * @param {boolean} [showAudioHint=false] — mostra "Narração em preparação" quando sem áudio
 * @param {object}  [style]
 */
export default function BeniSpeechCard({
  context,
  text,
  index,
  variant = 'child',
  avatarVariant,
  onListen,
  showAudioHint = false,
  style,
}) {
  const line = text != null ? { text } : getBeniLine(context, { index });
  const isAdult = variant === 'adult';
  const audioReady = hasBeniLineAudio(context, index);
  const resolvedAvatar = avatarVariant ?? (isAdult ? 'parent' : 'happy');

  return (
    <View style={[styles.card, isAdult && styles.cardAdult, style]}>
      <BeniAvatar variant={resolvedAvatar} size="small" />
      <View style={styles.content}>
        {isAdult && <Text style={styles.adultLabel}>Dica do Beni</Text>}
        <Text style={[styles.text, isAdult && styles.textAdult]}>{line.text}</Text>

        {audioReady ? (
          <SoundButton style={styles.listenBtn} onPress={onListen} activeOpacity={0.8} accessibilityLabel="Ouvir Beni">
            <Text style={styles.listenBtnText}>🔊 Ouvir Beni</Text>
          </SoundButton>
        ) : showAudioHint ? (
          <Text style={styles.audioHint}>A narração do Beni será preparada em breve.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(108,158,255,0.10)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(108,158,255,0.22)',
  },
  cardAdult: {
    backgroundColor: '#F4F1FB',
    borderColor: 'rgba(124,58,237,0.18)',
  },
  content: { flex: 1 },
  adultLabel: {
    fontFamily: 'FredokaOne', fontSize: 12, color: colors.primary, marginBottom: 2,
  },
  text: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.text, lineHeight: 20, fontWeight: '700',
  },
  textAdult: { fontWeight: '400', color: colors.textLight },
  listenBtn: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: colors.primary, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  listenBtnText: { fontFamily: 'Nunito', fontSize: 13, color: '#FFF', fontWeight: '700' },
  audioHint: {
    fontFamily: 'Nunito', fontSize: 12, color: colors.textLight,
    marginTop: 6, fontStyle: 'italic',
  },
});
