/**
 * OnboardingScreen.js — Onboarding progressivo com Beni.
 *
 * 5 etapas: boas-vindas → nome → avatar → primeira aventura → confirmação.
 * Visual infantil, mágico e sem fricção. Apenas nome e avatar — nenhum dado sensível.
 * Ao concluir, salva perfil (legado + nova estrutura) e marca onboarding feito.
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
import { AVATARS, DEFAULT_AVATAR_ID } from '../data/avatars';
import { useProfile } from '../context/ProfileContext';
import { createChildProfile } from '../services/childProfileService';
import { markOnboardingCompleted } from '../services/onboardingService';
import { stories as allStories } from '../data/stories';
import { colors } from '../theme/colors';
import { log } from '../utils/logger';

// ── Dados das histórias de estreia (visual apenas — nunca usar como objeto final) ──

const STARTER_STORIES = [
  {
    id: 'creation',
    titulo: 'A Criação',
    referencia: 'Gênesis 1',
    shortDescription: 'Deus criou o mundo com amor.',
    themeColor: '#4FC3F7',
    emoji: '🌍',
    badge: '⭐ Recomendado',
    recommended: true,
  },
  {
    id: 'noah',
    titulo: 'Noé e o Sinal da Aliança',
    referencia: 'Gênesis 6–9',
    shortDescription: 'Deus cuida de Noé e suas promessas.',
    themeColor: '#F4B400',
    emoji: '🌈',
    badge: '🎨 Para colorir',
    recommended: false,
  },
];

/**
 * Retorna a história completa (com cenas) a partir do catálogo canônico.
 * Fallback: retorna A Criação se o id não existir.
 */
function resolveFullStory(id) {
  const found = allStories.find(s => s.id === id);
  return found ?? allStories.find(s => s.id === 'creation') ?? allStories[0];
}

// ── Etapas ────────────────────────────────────────────────────────────────────

const STEPS = ['welcome', 'name', 'avatar', 'adventure', 'confirm'];
const TOTAL_STEPS = STEPS.length;

const BENI_VARIANTS = {
  welcome:   'happy',
  name:      'pointing',
  avatar:    'celebrating',
  adventure: 'reading',
  confirm:   'celebrating',
};

const BENI_MESSAGES = {
  welcome:   'Olá! Eu sou o Beni.\nVou caminhar com você nas aventuras da Bíblia.',
  name:      'Como posso te chamar\nnessa jornada?',
  avatar:    'Escolha um rostinho\npara caminhar comigo.',
  adventure: 'Vamos começar com\numa história especial?',
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
  starDone: { color: colors.primary },
  starActive: { color: colors.action, fontSize: 22 },
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
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [selectedStoryId, setSelectedStoryId] = useState('creation');
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

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      const name = childName.trim() || 'Amiguinho';
      const selectedAvatar = avatarId || DEFAULT_AVATAR_ID;

      // 1. Atualiza o perfil legado (@ptf_profile) → HomeScreen e ProfileScreen continuam funcionando
      await saveProfile({ name, avatarId: selectedAvatar });

      // 2. Cria perfil na nova estrutura de múltiplos filhos (Sprint 1)
      await createChildProfile({ name, avatarId: selectedAvatar }).catch(e => log('onboarding.createChild:', e));

      // 3. Marca onboarding concluído
      await markOnboardingCompleted();

      // 4. Resolve a história completa (com cenas) do catálogo canônico — nunca STARTER_STORIES
      const fullStory = resolveFullStory(selectedStoryId);
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'StoryDetail', params: { story: fullStory } },
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
        return (
          <View style={styles.welcomeDecor} pointerEvents="none">
            <Text style={styles.decorStar1}>✨</Text>
            <Text style={styles.decorStar2}>⭐</Text>
            <Text style={styles.decorStar3}>🌟</Text>
          </View>
        );

      case 'avatar':
        return (
          <View style={styles.avatarGrid}>
            {AVATARS.map(av => (
              <TouchableOpacity
                key={av.id}
                style={[styles.avatarCell, avatarId === av.id && styles.avatarCellSelected]}
                onPress={() => setAvatarId(av.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                <Text style={styles.avatarLabel}>{av.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'adventure':
        return (
          <View style={styles.storiesColumn}>
            {STARTER_STORIES.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.storyCard,
                  { borderColor: s.themeColor },
                  selectedStoryId === s.id && { backgroundColor: s.themeColor + '22', borderWidth: 3 },
                ]}
                onPress={() => setSelectedStoryId(s.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.storyEmoji}>{s.emoji}</Text>
                <View style={styles.storyInfo}>
                  <Text style={styles.storyTitle} numberOfLines={2}>{s.titulo}</Text>
                  <Text style={styles.storyRef}>{s.referencia}</Text>
                  <Text style={styles.storyDesc} numberOfLines={2}>{s.shortDescription}</Text>
                  <View style={[styles.storyBadge, { backgroundColor: s.themeColor + '33' }]}>
                    <Text style={[styles.storyBadgeText, { color: s.recommended ? '#2666A8' : '#7A5200' }]}>
                      {s.badge}
                    </Text>
                  </View>
                </View>
                {selectedStoryId === s.id && (
                  <Text style={[styles.selectedCheck, { color: s.themeColor }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'confirm': {
        const chosenAvatar = AVATARS.find(a => a.id === avatarId);
        const chosenStory = STARTER_STORIES.find(s => s.id === selectedStoryId);
        return (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmEmoji}>{chosenAvatar?.emoji ?? '⭐'}</Text>
            <Text style={styles.confirmName}>{childName.trim() || 'Amiguinho'}</Text>
            <Text style={styles.confirmStory}>Primeira história:</Text>
            <Text style={styles.confirmStoryName}>{chosenStory?.titulo}</Text>
          </View>
        );
      }

      default:
        return null;
    }
  }

  const isLastStep = currentStep === 'confirm';
  const buttonLabel = isLastStep ? 'Começar aventura 🚀' : 'Avançar →';

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
  welcomeDecor: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorStar1: { fontSize: 36, position: 'absolute', left: '15%', top: 0 },
  decorStar2: { fontSize: 28, position: 'absolute', right: '20%', top: 10 },
  decorStar3: { fontSize: 40, position: 'absolute', left: '42%', bottom: 0 },

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
  avatarCellSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF3CC',
    borderWidth: 3,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarLabel: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: colors.textLight,
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
  confirmEmoji: {
    fontSize: 52,
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

  // Botão principal
  button: {
    backgroundColor: colors.action,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.action,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
