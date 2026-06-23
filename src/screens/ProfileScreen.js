import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { getAvatarById, getAvatarImage, isAvatarUnlocked, getAvatarUnlockStars, avatarHasSkinTones, getProfileAvatarSkinTone, SKIN_TONES, PROFILE_AVATAR_ORDER } from '../data/avatars';
import AvatarImage from '../components/AvatarImage';
import CenteredContent from '../components/layout/CenteredContent';
import { BeniGuideBubble } from '../components/beni';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { useScreenGuide } from '../hooks/useScreenGuide';
import { useGuideTargets } from '../hooks/useGuideTargets';
import { measureGuideTarget } from '../services/guideTargetRegistry';
import { PROFILE_GUIDE } from '../data/beniGuides';
import { preloadGuideAudio } from '../data/beniGuideAudio';
import { useProfile } from '../context/ProfileContext';
import { useProgressContext } from '../context/ProgressContext';

function AvatarPicker({ profile, onSelect, onLockedPress, totalStars = 0 }) {
  const currentAvatarId = profile.avatarId;
  return (
    <View style={styles.avatarGrid}>
      {PROFILE_AVATAR_ORDER.map(id => {
        const avatar = getAvatarById(id);
        const isSelected = currentAvatarId === avatar.id;
        const unlocked = isAvatarUnlocked(avatar.id, totalStars, currentAvatarId);
        return (
          <TouchableOpacity
            key={avatar.id}
            style={[
              styles.avatarOption,
              isSelected && styles.avatarOptionSelected,
              !unlocked && styles.avatarOptionLocked,
            ]}
            onPress={() => { unlocked ? onSelect(avatar.id) : onLockedPress?.(avatar); }}
            activeOpacity={0.8}
            accessibilityState={{ selected: isSelected }}
          >
            <View style={styles.avatarOptionImgWrap}>
              <AvatarImage
                source={getAvatarImage(avatar.id, getProfileAvatarSkinTone(profile, avatar.id))}
                size={44}
                style={!unlocked && styles.avatarOptionImageLocked}
              />
              {!unlocked && (
                <View style={styles.avatarLockBadge}>
                  <Text style={styles.avatarLockEmoji}>🔒</Text>
                </View>
              )}
            </View>
            <Text style={styles.avatarOptionLabel} numberOfLines={1}>
              {avatar.label}
            </Text>
            {!unlocked && (
              <Text style={styles.avatarUnlockHint} numberOfLines={2}>
                Libera com {getAvatarUnlockStars(avatar.id)} ⭐
              </Text>
            )}
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

  // Perfil 1.1: aquece os 3 áudios do guia ANTES de mostrá-lo, para a 1ª fala sair
  // sem atraso (o BeniGuideAudio toca quando o asset carrega; o preload adianta isso).
  useEffect(() => {
    preloadGuideAudio(PROFILE_GUIDE.map((s) => s.audioKey));
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[ProfileGuide][DEV] preload áudios do Perfil');
  }, []);

  const { profile, saveProfile } = useProfile();
  const [nameInput, setNameInput] = useState(profile.name);
  const [avatarZoom, setAvatarZoom] = useState(false); // modal de ampliação do avatar atual
  const [lockedInfo, setLockedInfo] = useState(null);   // {label, stars} do avatar bloqueado tocado
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

  function handleLockedPress(avatar) {
    setLockedInfo({ label: avatar.label, stars: getAvatarUnlockStars(avatar.id) });
  }

  // Troca de tom (claro/escuro) do avatar ATUAL — só boy/girl. Atualiza SOMENTE
  // avatarSkinTones[avatarId] (independente): trocar boy não afeta girl e vice-versa.
  function handleSkinToneChange(tone) {
    const avatarId = profile.avatarId;
    if (getProfileAvatarSkinTone(profile, avatarId) === tone) return;
    saveProfile({ avatarSkinTones: { ...(profile.avatarSkinTones || {}), [avatarId]: tone } });
  }

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
          <Pressable
            style={styles.bigAvatarCircle}
            onPress={() => setAvatarZoom(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Ver avatar maior"
          >
            <AvatarImage source={getAvatarImage(profile.avatarId, getProfileAvatarSkinTone(profile, profile.avatarId))} size={72} />
          </Pressable>
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

      {/* Modal simples de ampliação do avatar ATUAL (tocar no avatar) — sem navegação nova */}
      <Modal
        visible={avatarZoom}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarZoom(false)}
      >
        <Pressable style={styles.avatarZoomBackdrop} onPress={() => setAvatarZoom(false)}>
          <View style={styles.avatarZoomCard}>
            <AvatarImage
              source={getAvatarImage(profile.avatarId, getProfileAvatarSkinTone(profile, profile.avatarId))}
              size={184}
              zoom={1.14}
              style={styles.avatarZoomImage}
            />
            <TouchableOpacity
              style={styles.avatarZoomClose}
              onPress={() => setAvatarZoom(false)}
              accessibilityRole="button"
            >
              <Text style={styles.avatarZoomCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Explicação ao tocar em avatar BLOQUEADO — linguagem positiva, sem cobrança */}
      <Modal
        visible={!!lockedInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setLockedInfo(null)}
      >
        <Pressable style={styles.avatarZoomBackdrop} onPress={() => setLockedInfo(null)}>
          <View style={styles.lockedCard}>
            <Text style={styles.lockedEmoji}>🔒</Text>
            <Text style={styles.lockedText}>
              Continue sua jornada para liberar este avatar com {lockedInfo?.stars} estrelinhas.
            </Text>
            <TouchableOpacity
              style={styles.avatarZoomClose}
              onPress={() => setLockedInfo(null)}
              accessibilityRole="button"
            >
              <Text style={styles.avatarZoomCloseText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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
        <AvatarPicker
          profile={profile}
          onSelect={handleAvatarSelect}
          onLockedPress={handleLockedPress}
          totalStars={totalStars}
        />

        {/* Tom de pele do avatar atual — só menino/menina; salva apenas skinTone */}
        {avatarHasSkinTones(profile.avatarId) && (
          <View style={styles.toneRow}>
            <Text style={styles.toneLabel}>Cor da pele</Text>
            <View style={styles.toneOptions}>
              {SKIN_TONES.map(tone => {
                const active = getProfileAvatarSkinTone(profile, profile.avatarId) === tone;
                return (
                  <TouchableOpacity
                    key={tone}
                    style={[styles.toneChip, active && styles.toneChipActive]}
                    onPress={() => handleSkinToneChange(tone)}
                    activeOpacity={0.8}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.toneChipText, active && styles.toneChipTextActive]}>
                      {tone === 'claro' ? 'Claro' : 'Escuro'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
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
  avatarZoomBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  avatarZoomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 18,
    maxWidth: 300,
  },
  // Anel que DEFINE o círculo do avatar contra o card branco (evita "imagem estreita
  // num quadrado branco"). overflow hidden + zoom no AvatarImage preenchem o círculo.
  avatarZoomImage: {
    borderWidth: 4,
    borderColor: '#EADFD2',
  },
  avatarZoomClose: {
    backgroundColor: pt.primary ?? '#7C3AED',
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  avatarZoomCloseText: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: '#FFFFFF',
  },
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
  avatarOptionLabel: {
    fontFamily: 'Nunito', fontSize: 10, color: pt.text,
    textAlign: 'center', marginTop: 5, lineHeight: 13, fontWeight: '700',
  },
  avatarOptionLocked: {
    backgroundColor: '#F4F1EA',
  },
  avatarOptionImgWrap: {
    width: 44, height: 44, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarOptionImageLocked: { opacity: 0.35 },
  avatarLockBadge: {
    position: 'absolute', right: -4, bottom: -2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(58,42,30,0.62)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLockEmoji: { fontSize: 11 },
  avatarUnlockHint: {
    fontFamily: 'Nunito', fontSize: 9, color: '#9A6B12', fontWeight: '700',
    textAlign: 'center', marginTop: 2, lineHeight: 11,
  },

  // Toggle de tom de pele (Perfil) — só boy/girl
  toneRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  toneLabel: {
    fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft,
  },
  toneOptions: { flexDirection: 'row', gap: 8 },
  toneChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: pt.border,
  },
  toneChipActive: {
    backgroundColor: colors.primary + '1A', borderColor: colors.primary,
  },
  toneChipText: {
    fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft,
  },
  toneChipTextActive: { color: '#7A5800' },

  // Modal de avatar bloqueado
  lockedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginHorizontal: 8,
    alignItems: 'center',
    gap: 14,
    maxWidth: 320,
  },
  lockedEmoji: { fontSize: 36 },
  lockedText: {
    fontFamily: 'Nunito', fontSize: 15, fontWeight: '700', color: pt.text,
    textAlign: 'center', lineHeight: 21,
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
