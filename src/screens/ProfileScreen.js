import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { AVATARS } from '../data/avatars';
import CenteredContent from '../components/layout/CenteredContent';
import { BeniGuideBubble } from '../components/beni';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { useScreenGuide } from '../hooks/useScreenGuide';
import { useGuideTargets } from '../hooks/useGuideTargets';
import { measureGuideTarget } from '../services/guideTargetRegistry';
import { PROFILE_GUIDE } from '../data/beniGuides';
import { useProfile } from '../context/ProfileContext';
import { useProgressContext } from '../context/ProgressContext';

function AvatarPicker({ selected, onSelect }) {
  return (
    <View style={styles.avatarGrid}>
      {AVATARS.map(avatar => {
        const isSelected = selected === avatar.id;
        return (
          <TouchableOpacity
            key={avatar.id}
            style={[
              styles.avatarOption,
              isSelected && styles.avatarOptionSelected,
            ]}
            onPress={() => onSelect(avatar.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarOptionEmoji}>{avatar.emoji}</Text>
            <Text style={styles.avatarOptionLabel} numberOfLines={2}>
              {avatar.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AdultCard({ emoji, title, desc, onPress, tint = '#F5F0FF' }) {
  return (
    <TouchableOpacity
      style={[styles.adultCard, { backgroundColor: tint }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.adultCardEmoji}>{emoji}</Text>
      <View style={styles.adultCardInfo}>
        <Text style={styles.adultCardTitle}>{title}</Text>
        <Text style={styles.adultCardDesc}>{desc}</Text>
      </View>
      <Text style={styles.adultCardArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  // Perfil 1.0: guia falado do Perfil ATIVO — 1ª visita pela aba (flag @ptf_beni_guide_profile_v1).
  const profileGuide = useScreenGuide('profile', true);
  // Alvos REAIS do Perfil (measureInWindow) — sem medição → fallback sem seta.
  const profileTargets = useGuideTargets();
  const measureProfileTarget = useCallback(
    (name) => profileTargets.measure(name).then((r) => r || measureGuideTarget(name)),
    [profileTargets.measure],
  );
  // Rolagem do Perfil p/ trazer o alvo do card atual à área visível antes de medir.
  const scrollRef = useRef(null);
  const scrollY = useRef(0);
  const onProfileScroll = useCallback((e) => { scrollY.current = e.nativeEvent.contentOffset.y; }, []);
  const scrollGuideTargetIntoView = useCallback((name) => {
    if (!name) { scrollRef.current?.scrollTo({ y: 0, animated: true }); return; } // Card 1: topo
    profileTargets.measure(name).then((r) => {
      if (!r) return; // sem medição → sem rolagem (overlay cai no fallback honesto)
      if (r.height >= 170) {
        const desiredTop = insets.top + 60;
        const delta = r.y - desiredTop;
        if (Math.abs(delta) > 8) scrollRef.current?.scrollTo({ y: Math.max(0, scrollY.current + delta), animated: true });
        return;
      }
      const desiredTop = insets.top + 110;
      const viewBottom = screenH - 64 - 190;
      let delta = 0;
      if (r.y < desiredTop) delta = r.y - desiredTop;
      else if (r.y + r.height > viewBottom) delta = (r.y + r.height) - viewBottom;
      if (Math.abs(delta) > 8) scrollRef.current?.scrollTo({ y: Math.max(0, scrollY.current + delta), animated: true });
    });
  }, [profileTargets, insets.top, screenH]);

  const { profile, saveProfile } = useProfile();
  const [nameInput, setNameInput] = useState(profile.name);
  useEffect(() => {
    setNameInput(profile.name);
  }, [profile.name]);

  const { progressSummary } = useProgressContext();
  const totalStars = progressSummary?.totalStars ?? 0;
  const maxStars = progressSummary?.maxTotalStars ?? 0;
  const starsPercent = maxStars > 0 ? Math.min(totalStars / maxStars, 1) : 0;

  function handleNameSubmit() {
    saveProfile({ name: nameInput.trim() });
  }

  function handleAvatarSelect(avatarId) {
    saveProfile({ avatarId });
  }

  const currentAvatar = AVATARS.find(a => a.id === profile.avatarId) ?? AVATARS[0];

  /* ── Child block ── */
  const childBlock = (
    <View style={styles.childBlock}>
      {/* Cabeçalho suave — Meu cantinho (avatar da CRIANÇA, não Beni) */}
      <LinearGradient
        colors={['#FFE6A8', '#FFD27F', '#FFC489']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.childHeader, { paddingTop: Math.max(insets.top, 20) + 8 }]}
      >
        <Text style={styles.cantinhoTitle}>Meu cantinho</Text>
        {/* Alvo do guia (Card 2 "Sua carinha"): avatar + nome da criança. */}
        <View ref={profileTargets.register('profile.identity')} collapsable={false} style={styles.identityTarget}>
          <View style={styles.bigAvatarCircle}>
            <Text style={styles.bigAvatarEmoji}>{currentAvatar.emoji}</Text>
          </View>
          <Text style={styles.childName}>
            {profile.name ? profile.name : 'Pequeno artista'}
          </Text>
        </View>
        <Text style={styles.childStars}>
          ⭐ {totalStars === 1 ? '1 estrela' : `${totalStars} estrelas`}
        </Text>
        <View style={styles.progressBarOuter}>
          <View style={[styles.progressBarInner, { width: `${starsPercent * 100}%` }]} />
        </View>
        <Text style={styles.progressBarLabel}>{totalStars}/{maxStars} estrelas alcançadas</Text>
      </LinearGradient>

      {/* Beni guia — sem substituir o avatar da criança */}
      <BeniGuideBubble
        message={getBeniGuideMessage('profile')}
        avatarVariant="happy"
        tone="yellow"
        compact
        style={styles.beniGuide}
      />

      {/* Name input */}
      <View style={styles.childSection}>
        <Text style={styles.childSectionLabel}>Como você se chama?</Text>
        <TextInput
          style={styles.nameInput}
          value={nameInput}
          onChangeText={setNameInput}
          onBlur={handleNameSubmit}
          onSubmitEditing={handleNameSubmit}
          placeholder="Digite seu nome aqui..."
          placeholderTextColor={pt.muted}
          maxLength={30}
          returnKeyType="done"
        />
      </View>

      {/* Avatar picker */}
      <View style={styles.childSection}>
        <Text style={styles.childSectionLabel}>Escolha seu avatar</Text>
        <AvatarPicker selected={profile.avatarId} onSelect={handleAvatarSelect} />
      </View>
    </View>
  );

  /* ── Adult block ── */
  const adultBlock = (
    <View style={styles.adultBlock}>
      <Text style={styles.adultBlockTitle}>🔐 Para responsáveis</Text>
      <Text style={styles.adultBlockSub}>
        Configurações e acompanhamento para responsáveis.
      </Text>

      {/* Alvo do guia (Card 3): card real da Área dos Pais (só destaca, não abre). */}
      <View ref={profileTargets.register('profile.parents')} collapsable={false} style={styles.parentsTarget}>
        <AdultCard
          emoji="👨‍👩‍👧"
          title="Área dos Pais"
          desc="Acompanhe o progresso e gerencie o perfil."
          tint="#EFF8FF"
          onPress={() => navigation.navigate('ParentArea')}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 0, paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onProfileScroll}
        scrollEventThrottle={32}
      >
        <CenteredContent>
          {childBlock}
          {adultBlock}
        </CenteredContent>
      </ScrollView>
      {profileGuide.visible && (
        <BeniGuideOverlay
          steps={PROFILE_GUIDE}
          measure={measureProfileTarget}
          finalLabel="Entendi"
          onStep={scrollGuideTargetIntoView}
          onFinish={profileGuide.close}
          onSkip={profileGuide.close}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },
  content: {},

  /* ── Child block ── */
  childBlock: { marginBottom: 8 },

  childHeader: {
    alignItems: 'center',
    paddingBottom: 18,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 4,
  },
  cantinhoTitle: {
    fontFamily: 'FredokaOne', fontSize: 14, color: '#7A5800',
    marginBottom: 10, letterSpacing: 0.3,
  },
  // Alvo medível do guia (Card 2): abraça avatar + nome, centralizado.
  identityTarget: { alignItems: 'center' },
  // Alvo medível do guia (Card 3): abraça o card da Área dos Pais.
  parentsTarget: { alignSelf: 'stretch' },
  bigAvatarCircle: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.95)',
    elevation: 4,
    shadowColor: '#C98A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bigAvatarEmoji: { fontSize: 42 },
  childName: {
    fontFamily: 'FredokaOne', fontSize: 22, color: '#3A2A1E', marginBottom: 3,
  },
  childStars: {
    fontFamily: 'Nunito', fontSize: 14, color: '#7A5800', fontWeight: '700', marginBottom: 10,
  },
  progressBarOuter: {
    width: '70%', height: 8, backgroundColor: 'rgba(122,88,0,0.18)',
    borderRadius: 4, overflow: 'hidden', marginBottom: 6,
  },
  progressBarInner: { height: '100%', backgroundColor: '#F4B400', borderRadius: 4 },
  progressBarLabel: {
    fontFamily: 'Nunito', fontSize: 11, color: '#9B7B30',
  },
  beniGuide: { marginHorizontal: 16, marginTop: 14, marginBottom: 4 },

  childSection: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 4 },
  childSectionLabel: {
    fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 10,
  },

  nameInput: {
    backgroundColor: '#FFF',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: pt.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Nunito',
    fontSize: 15,
    color: pt.text,
    ...shadows.soft,
  },

  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  avatarOption: {
    width: '22%',
    minHeight: 86,
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: 'transparent',
    ...shadows.soft,
    paddingVertical: 10, paddingHorizontal: 4,
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
    elevation: 5,
    shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 6,
  },
  avatarOptionEmoji: { fontSize: 30 },
  avatarOptionLabel: {
    fontFamily: 'Nunito', fontSize: 10, color: pt.text,
    textAlign: 'center', marginTop: 5, lineHeight: 13, fontWeight: '700',
  },

  /* ── Adult block ── */
  adultBlock: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  adultBlockTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 4,
  },
  adultBlockSub: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    lineHeight: 18, marginBottom: 16,
  },

  adultCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.lg,
    padding: 14, marginBottom: 10,
    gap: 12,
    ...shadows.soft,
    borderWidth: 1, borderColor: pt.border,
  },
  adultCardEmoji: { fontSize: 28 },
  adultCardInfo: { flex: 1 },
  adultCardTitle: {
    fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 2,
  },
  adultCardDesc: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17,
  },
  adultCardArrow: {
    fontFamily: 'FredokaOne', fontSize: 22, color: pt.muted,
  },
});
