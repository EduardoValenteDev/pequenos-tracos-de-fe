/**
 * OnboardingScreen.js — Onboarding progressivo com Beni.
 *
 * 4 etapas: boas-vindas → nome → avatar → confirmação (UX 2.1).
 * Visual infantil, mágico e sem fricção. Apenas nome e avatar — nenhum dado sensível.
 * Ao concluir, salva perfil (legado + nova estrutura), marca onboarding feito e abre
 * a aba Aventuras com o Tour do Beni (sem escolher história aqui).
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import BeniAvatar from '../components/beni/BeniAvatar';
import AvatarImage from '../components/AvatarImage';
import {
  DEFAULT_AVATAR_ID, DEFAULT_SKIN_TONE, getAvatarImage,
  ONBOARDING_AVATAR_OPTIONS, isAvatarUnlocked,
} from '../data/avatars';
import { useProfile } from '../context/ProfileContext';
import { createChildProfile } from '../services/childProfileService';
import { markOnboardingCompleted } from '../services/onboardingService';
import { requestInitialTour } from '../services/beniTourService';
import { colors } from '../theme/colors';
import { log } from '../utils/logger';

// ── Etapas (UX 2.1: onboarding curto — só nome + avatar + entrada na jornada) ──
// A escolha de história saiu: a primeira visão passou a ser o Mapa das Aventuras,
// com o Tour do Beni por cima. Não há mais navegação para StoryDetail aqui.

const STEPS = ['welcome', 'name', 'avatar', 'confirm'];
const TOTAL_STEPS = STEPS.length;

const BENI_VARIANTS = {
  welcome:   'happy',
  name:      'pointing',
  avatar:    'celebrating',
  confirm:   'celebrating',
};

const BENI_MESSAGES = {
  welcome:   'Olá! Eu sou o Beni.\nVou caminhar com você nas aventuras da Bíblia.',
  name:      'Como posso te chamar\nnessa jornada?',
  avatar:    'Escolha um rostinho\npara caminhar comigo.',
  confirm:   'Prontinho! Sua jornada\nde fé vai começar.',
};

// ── Componentes internos ──────────────────────────────────────────────────────

function ProgressStars({ currentStep }) {
  return (
    <View style={starStyles.row}>
      {STEPS.map((_, i) => (
        <Text
          key={i}
          style={[
            starStyles.star,
            i < currentStep && starStyles.starDone,
            i === currentStep && starStyles.starActive,
          ]}
        >
          {i < currentStep ? '★' : i === currentStep ? '✦' : '☆'}
        </Text>
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  star: { fontSize: 18, color: colors.border },
  starDone: { color: '#D99A1E' },
  starActive: { color: '#C9870F', fontSize: 22 },
});

function BeniSpeech({ message }) {
  return (
    <View style={speechStyles.bubble}>
      <Text style={speechStyles.text}>{message}</Text>
    </View>
  );
}

const speechStyles = StyleSheet.create({
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary + '55',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
  },
  text: {
    fontFamily: 'Nunito',
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
});

// ── Tela principal ────────────────────────────────────────────────────────────

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { saveProfile } = useProfile();

  const [stepIndex, setStepIndex] = useState(0);
  const [childName, setChildName] = useState('');
  // Estrela PRÉ-SELECIONADA por padrão: se ninguém tocar em nada e clicar Avançar,
  // salva avatarId='star' e a tela final mostra a Estrela (nunca círculo vazio).
  const [avatarId, setAvatarId] = useState('star');
  const [skinTone, setSkinTone] = useState(DEFAULT_SKIN_TONE);
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const currentStep = STEPS[stepIndex];

  const goToStep = useCallback((nextIndex) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStepIndex(nextIndex);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  function handleAdvance() {
    if (currentStep === 'name') {
      const trimmed = childName.trim();
      if (!trimmed) { setNameError('Escreve seu nome ou apelido aqui 😊'); return; }
      setChildName(trimmed);
      setNameError('');
    }
    if (stepIndex < TOTAL_STEPS - 1) goToStep(stepIndex + 1);
  }

  function handleBack() {
    if (saving) return;
    setNameError('');
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      const name = childName.trim() || 'Amiguinho';
      // Segurança: se por edge case o avatar escolhido estiver bloqueado (0 estrelinhas
      // no onboarding), cai no default 'star' (sempre grátis/válido).
      const candidateAvatar = avatarId || DEFAULT_AVATAR_ID;
      const selectedAvatar = isAvatarUnlocked(candidateAvatar, 0, null) ? candidateAvatar : DEFAULT_AVATAR_ID;

      // Tom por avatar (independente): só boy/girl carregam tom; star ignora.
      const avatarSkinTones = (selectedAvatar === 'boy' || selectedAvatar === 'girl')
        ? { [selectedAvatar]: skinTone }
        : {};

      // 1. Atualiza o perfil legado (@ptf_profile). Mantém skinTone legado p/ compat
      //    e grava avatarSkinTones (novo, por avatar). HomeScreen/ProfileScreen seguem.
      await saveProfile({ name, avatarId: selectedAvatar, skinTone, avatarSkinTones });

      // 2. Cria perfil na nova estrutura de múltiplos filhos (Sprint 1)
      await createChildProfile({ name, avatarId: selectedAvatar }).catch(e => log('onboarding.createChild:', e));

      // 3. Marca onboarding concluído
      await markOnboardingCompleted();

      // 3.1 Sinaliza o tour inicial (independe do layout — mobile param + tablet sidebar).
      requestInitialTour();

      // 4. UX 2.0: em vez de cair direto numa história, a primeira visão é a aba
      // AVENTURAS (mapa) com o "Tour Mágico do Beni" por cima (startBeniTour). O
      // tour aparece uma única vez (guardado pelo beniTourService).
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              state: {
                index: 1, // aba Aventuras
                routes: [
                  { name: 'Início' },
                  { name: 'Aventuras', params: { startBeniTour: true } },
                  { name: 'Ateliê' },
                  { name: 'Estrelinhas' },
                  { name: 'Perfil' },
                ],
              },
            },
          ],
        }),
      );
    } catch (e) {
      log('onboarding.finish:', e);
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
    } finally {
      setSaving(false);
    }
  }

  // ── Layout dedicado da etapa de nome ────────────────────────────────────────
  // Não usa o footer compartilhado. Tudo em um ScrollView único:
  // Beni → balão → input → erro → botão → estrelas.
  // Isso garante que o TextInput seja sempre visível acima do botão,
  // independente da altura disponível ou do teclado.
  function renderNameStep() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#FFF4E0', '#FFF8EF', '#EDF4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={[styles.container, { paddingTop: insets.top + 8 }]}
        >
          <ScrollView
            contentContainerStyle={styles.nameStepScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Beni compacto */}
            <BeniAvatar
              variant="pointing"
              size="medium"
              style={styles.beniAvatarCompact}
            />

            {/* 2. Balão de fala */}
            <BeniSpeech message={BENI_MESSAGES.name} />

            {/* 3. Campo de nome — sempre antes do botão, nunca comprimido pelo footer */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.nameInput, nameError ? styles.nameInputError : null]}
                placeholder="Digite seu nome ou apelido"
                placeholderTextColor={colors.textLight}
                value={childName}
                onChangeText={t => { setChildName(t); setNameError(''); }}
                maxLength={20}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleAdvance}
              />

              {/* 4. Erro, se houver */}
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* 5. Botão próprio — não depende do footer compartilhado */}
            <TouchableOpacity
              style={[styles.button, styles.nameStepButton]}
              onPress={handleAdvance}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Avançar →</Text>
            </TouchableOpacity>

            {stepIndex > 0 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <Text style={styles.backBtnText}>← Voltar</Text>
              </TouchableOpacity>
            )}

            {/* 6. Trilha de estrelas */}
            <ProgressStars currentStep={stepIndex} />
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  // ── Renderização das demais etapas ──────────────────────────────────────────

  function renderStepContent() {
    switch (currentStep) {
      case 'welcome':
        // Primeira tela limpa: o protagonista é o Beni (componente real) + a fala.
        // Sem estrelas-emoji decorativas (empobreciam a tela).
        return null;

      case 'avatar':
        return (
          <View style={styles.avatarGrid}>
            {/* Onboarding: 5 cards finais já com o tom embutido (sem seletor separado). */}
            {ONBOARDING_AVATAR_OPTIONS.map(opt => {
              const isSel = avatarId === opt.avatarId
                && (opt.avatarId === 'star' || skinTone === opt.skinTone);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.avatarCell, isSel && styles.avatarCellSelected]}
                  onPress={() => { setAvatarId(opt.avatarId); setSkinTone(opt.skinTone); }}
                  activeOpacity={0.7}
                >
                  <AvatarImage source={getAvatarImage(opt.avatarId, opt.skinTone)} size={52} />
                  <Text style={styles.avatarLabel} numberOfLines={1}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'confirm':
        return (
          <View style={styles.confirmCard}>
            <AvatarImage source={getAvatarImage(avatarId || 'star', skinTone)} size={96} zoom={1.14} style={styles.confirmAvatar} />
            <Text style={styles.confirmName}>{childName.trim() || 'Amiguinho'}</Text>
            <Text style={styles.confirmStory}>Sua jornada vai começar!</Text>
          </View>
        );

      default:
        return null;
    }
  }

  const isLastStep = currentStep === 'confirm';
  const buttonLabel = isLastStep ? 'Começar aventura' : 'Avançar →';

  // Etapa de nome tem layout próprio: TextInput sempre antes do botão, sem dependência do footer
  if (currentStep === 'name') return renderNameStep();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFF4E0', '#FFF8EF', '#EDF4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}
      >
        {/* Cabeçalho com Beni */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <BeniAvatar
            variant={BENI_VARIANTS[currentStep]}
            size="hero"
            style={styles.beniAvatar}
          />
          <BeniSpeech message={BENI_MESSAGES[currentStep]} />
        </Animated.View>

        {/* Conteúdo da etapa */}
        <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderStepContent()}
          </ScrollView>
        </Animated.View>

        {/* Rodapé com botão e estrelas de progresso */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={isLastStep ? handleFinish : handleAdvance}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.buttonText}>{saving ? 'Carregando…' : buttonLabel}</Text>
          </TouchableOpacity>
          {stepIndex > 0 && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBack}
              activeOpacity={0.7}
              disabled={saving}
              accessibilityRole="button"
            >
              <Text style={styles.backBtnText}>← Voltar</Text>
            </TouchableOpacity>
          )}
          <ProgressStars currentStep={stepIndex} />
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  beniAvatar: {
    marginBottom: 18,
  },
  beniAvatarCompact: {
    marginBottom: 12,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  // Layout exclusivo da etapa de nome
  nameStepScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
  nameStepButton: {
    marginTop: 4,
    alignSelf: 'stretch',
  },

  // Estrelas decorativas na etapa de boas-vindas
  // Input de nome — borda dourada unmistakable, branco sólido, altura mínima garantida
  inputWrapper: {
    width: '100%',
    marginTop: 4,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 64,
    width: '100%',
    fontFamily: 'Nunito',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  nameInputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 8,
  },

  // Grid de avatares
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  avatarCell: {
    width: 76,
    height: 84,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  // Estado selecionado NÃO altera borderWidth/padding/tamanho (evita salto de layout):
  // só muda cor da borda + fundo. A borda tem largura constante (2) em ambos os estados.
  avatarCellSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF3CC',
  },
  avatarLabel: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: colors.textLight,
    height: 16,
    textAlignVertical: 'center',
  },

  // Cards de história — empilhados verticalmente, layout horizontal interno
  storiesColumn: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    borderWidth: 2,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  storyEmoji: {
    fontSize: 38,
  },
  storyInfo: {
    flex: 1,
    gap: 3,
  },
  storyTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  storyRef: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: colors.textLight,
  },
  storyDesc: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 17,
  },
  storyBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  storyBadgeText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: 'bold',
  },
  selectedCheck: {
    fontFamily: 'FredokaOne',
    fontSize: 24,
    marginLeft: 4,
  },

  // Card de confirmação
  confirmCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 32,
    width: '100%',
    gap: 6,
    borderWidth: 2,
    borderColor: colors.primary + '44',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmAvatar: {
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  confirmName: {
    fontFamily: 'FredokaOne',
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
  },
  confirmStory: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  confirmStoryName: {
    fontFamily: 'Nunito',
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },

  // Botão principal — dourado suave (âmbar mel do app), infantil e leve, texto marrom
  // escuro para bom contraste. Sem laranja/marrom chapado pesado.
  button: {
    backgroundColor: '#FFC94D',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#E0A21E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 7,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: '#5A3E1B',
    letterSpacing: 0.3,
  },
  backBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  backBtnText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
});
