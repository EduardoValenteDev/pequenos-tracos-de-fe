/**
 * StorybookProfilePage — Momento 3: a página "Este livro pertence a..." (O2.2 · §13).
 *
 * Personalização como página interna do livro. ESTRUTURA ÚNICA (não muda com o teclado): o
 * selo do Beni, o indicador e a imagem NUNCA são desmontados por estado de teclado (o
 * deslocamento é feito pela tela, por transform). `onSubmitEditing` só faz `Keyboard.dismiss()`.
 * Avatares base, sem rótulo visível de gênero (só acessibilidade); seleção por borda + check.
 */
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import AvatarImage from '../AvatarImage';
import FaithIcon from '../ui/FaithIcon';
import StorybookBeni from './StorybookBeni';
import { ONBOARDING_AVATAR_OPTIONS, getAvatarImage } from '../../data/avatars';
import { NAME_MAX } from '../../services/onboardingName';
import { OB } from '../../theme/onboardingVisualTokens';

// Geometria da grade de avatares (fonte única para o cálculo do layout e para os estilos).
const AV_CELL = 58;   // largura/altura da célula (área de toque)
const AV_GAP = 9;     // gap horizontal entre células

function a11yFor(opt) {
  if (opt.avatarId === 'star') return 'Estrela';
  const papel = opt.avatarId === 'girl' ? 'Aventureira' : 'Aventureiro';
  return `${papel}, ${opt.skinTone === 'escuro' ? 'pele escura' : 'pele clara'}`;
}

function AvatarCell({ opt, avatarId, skinTone, onPickAvatar }) {
  const selected = avatarId === opt.avatarId && (opt.avatarId === 'star' || skinTone === opt.skinTone);
  return (
    <TouchableOpacity
      style={[styles.cell, selected && styles.cellSelected]}
      onPress={() => onPickAvatar(opt.avatarId, opt.skinTone)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={a11yFor(opt)}
      accessibilityState={{ selected }}
    >
      <AvatarImage source={getAvatarImage(opt.avatarId, opt.skinTone)} size={44} />
      {selected && <View style={styles.check}><FaithIcon name="check" size={16} color={OB.gold} /></View>}
    </TouchableOpacity>
  );
}

export default function StorybookProfilePage({
  width, name, onChangeName, avatarId, skinTone, onPickAvatar, error, showAvatarHint, profileReady,
}) {
  // Layout simétrico: 5 em linha só quando a fileira inteira (5 células + 4 gaps) cabe na largura
  // da página; senão 3 + 2 centralizados. O limiar vem da geometria real — evita cortar as células
  // externas no pageArea (overflow hidden) e preserva o 5-em-linha nas telas largas já aprovadas.
  const opts = ONBOARDING_AVATAR_OPTIONS;
  const fiveRowWidth = AV_CELL * 5 + AV_GAP * 4;
  const fiveFit = (width || 320) >= fiveRowWidth;
  const rows = fiveFit ? [opts] : [opts.slice(0, 3), opts.slice(3)];

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <StorybookBeni pose="ensinando" mode="seal" width={40} />
        <View style={styles.titles}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Este livro pertence a...</Text>
            {profileReady && <View style={styles.stamp}><FaithIcon name="check" size={13} color={OB.gold} /></View>}
          </View>
          <Text style={styles.subtitle}>Como posso chamar você?</Text>
        </View>
      </View>

      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Seu nome ou apelido"
        placeholderTextColor="rgba(90,74,50,0.4)"
        value={name}
        onChangeText={onChangeName}
        maxLength={NAME_MAX}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
        blurOnSubmit
        accessibilityLabel="Seu nome ou apelido"
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : (
        <Text style={styles.trust}>Seu nome fica somente neste aparelho.</Text>
      )}

      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((opt) => (
              <AvatarCell key={opt.key} opt={opt} avatarId={avatarId} skinTone={skinTone} onPickAvatar={onPickAvatar} />
            ))}
          </View>
        ))}
      </View>

      {showAvatarHint && (
        <Text style={styles.hint} accessibilityLiveRegion="polite">Agora escolha seu rostinho.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titles: { alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: 'FredokaOne', fontSize: 17, color: OB.title },
  stamp: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF6DD', borderWidth: 1.5, borderColor: OB.goldSoft, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: OB.textSoft },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 2.5, borderColor: OB.gold,
    paddingHorizontal: 16, paddingVertical: 13, minHeight: 54, width: '100%', maxWidth: 380,
    fontFamily: 'Nunito', fontSize: 18, color: OB.title, textAlign: 'center', fontWeight: '700',
  },
  inputError: { borderColor: '#E5533D' },
  error: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: '#E5533D', textAlign: 'center' },
  trust: { fontFamily: 'Nunito', fontSize: 12, color: OB.textSoft, textAlign: 'center' },
  grid: { alignItems: 'center', gap: 9, marginTop: 2 },
  gridRow: { flexDirection: 'row', justifyContent: 'center', gap: AV_GAP },
  cell: {
    width: AV_CELL, height: AV_CELL, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: 'rgba(58,42,18,0.12)',
  },
  cellSelected: { borderColor: OB.gold, backgroundColor: '#FFF6DD' },
  check: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FFFDF5', borderRadius: 11, padding: 1 },
  hint: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: OB.gold, textAlign: 'center' },
});
