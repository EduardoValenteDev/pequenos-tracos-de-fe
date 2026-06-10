/**
 * CultinhoEmCasaScreen — "Cultinho em Casa" 1.0.
 *
 * Fluxo curto de culto familiar infantil, reaproveitando recursos existentes:
 * história + conversa + colorir + oração, guiados pelo Beni. Sem backend, sem
 * notificações, sem compartilhamento e sem coleta de dado sensível.
 *
 * Etapas (rolagem simples, sem wizard rígido):
 *   1. História sugerida (vitrine)  → Abrir história
 *   2. Conversa em família (pergunta simples)
 *   3. Colorir juntos               → Abrir Ateliê
 *   4. Oração curtinha
 *   5. Concluir cultinho            → registro local + mensagem do Beni
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import { BeniGuideBubble, BeniAvatar } from '../components/beni';
import { images } from '../assets/images';
import { getStoryOfTheWeek, markFamilyWorshipCompleted } from '../services/familyWorshipService';

/* Perguntas simples por história (fallback genérico). Conteúdo fixo e leve. */
const FAMILY_QUESTIONS = {
  creation: 'O que Deus criou que você mais gosta?',
  noah: 'Como você acha que Noé cuidou dos animais com amor?',
  david_goliath: 'Onde você pode ser corajoso como Davi?',
  jesus_children: 'Como Jesus mostra que ama muito as crianças?',
};
const DEFAULT_QUESTION = 'O que essa história ensina ao seu coração?';

/* Orações curtinhas e infantis. */
const PRAYERS = [
  'Deus, obrigado por cuidar da nossa família. Amém.',
  'Jesus, obrigado por este momento juntos. Amém.',
  'Senhor, enche nossa casa de amor e paz. Amém.',
];

function StepCard({ number, accent, title, children }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function CultinhoEmCasaScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // História sugerida — vitrine/História do Domingo (preparo). Escolhida 1x por sessão.
  const [story] = useState(() => getStoryOfTheWeek());
  const [prayer] = useState(() => PRAYERS[Math.floor(Math.random() * PRAYERS.length)]);
  const [done, setDone] = useState(false);

  const question = (story && FAMILY_QUESTIONS[story.id]) || DEFAULT_QUESTION;
  const coverImg = story?.imagemCapa ? images[story.imagemCapa] : null;

  function handleOpenStory() {
    if (story) navigation.navigate('StoryDetail', { story });
    else navigation.navigate('Home', { screen: 'Aventuras' });
  }

  function handleOpenAtelier() {
    // Abre o Ateliê empurrado por contexto → permite voltar para o Cultinho.
    navigation.navigate('AtelierFromContext', { from: 'cultinho' });
  }

  async function handleConcluir() {
    await markFamilyWorshipCompleted(story?.id ?? null);
    setDone(true);
  }

  return (
    <View style={styles.wrapper}>
      <SafeScreenHeader
        title="Cultinho em Casa"
        subtitle="Um momento especial para fazer juntos."
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('Home')}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Beni guia */}
        <BeniGuideBubble
          message="Vamos viver uma história com carinho?"
          avatarVariant="reading"
          tone="purple"
          compact
          style={{ marginBottom: 14 }}
        />

        {/* Intro acolhedora */}
        <Text style={styles.intro}>
          Uma história, uma conversa e uma oração com Beni. 💜
        </Text>

        {/* 1. História sugerida */}
        <StepCard number="1" accent={pt.faithBlue} title="A história de hoje">
          <View style={styles.storyCover}>
            {coverImg ? (
              <Image source={coverImg} style={styles.storyCoverImg} resizeMode="cover" />
            ) : (
              <View style={[styles.storyCoverImg, styles.storyCoverFallback]}>
                <Text style={styles.storyCoverEmoji}>{story?.emoji ?? '📖'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.storyTitle}>{story?.titulo ?? 'Uma aventura da fé'}</Text>
          {story?.referencia ? <Text style={styles.storyRef}>{story.referencia}</Text> : null}
          <SoundButton style={[styles.primaryBtn, { backgroundColor: pt.faithBlue }]} onPress={handleOpenStory} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Abrir história</Text>
          </SoundButton>
        </StepCard>

        {/* 2. Conversa em família */}
        <StepCard number="2" accent={pt.gold} title="Conversa em família">
          <Text style={styles.questionLabel}>Conversem juntos:</Text>
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>💬 {question}</Text>
          </View>
        </StepCard>

        {/* 3. Colorir juntos */}
        <StepCard number="3" accent={pt.beni} title="Colorir juntos">
          <Text style={styles.stepBody}>Depois da história, vocês podem colorir uma cena juntos.</Text>
          <SoundButton style={[styles.primaryBtn, { backgroundColor: pt.beni }]} onPress={handleOpenAtelier} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>🎨 Abrir Ateliê</Text>
          </SoundButton>
        </StepCard>

        {/* 4. Oração curtinha */}
        <StepCard number="4" accent={pt.purple} title="Oração curtinha">
          <View style={styles.prayerBox}>
            <Text style={styles.prayerText}>🙏 {prayer}</Text>
          </View>
        </StepCard>

        {/* 5. Concluir */}
        <SoundButton style={styles.concludeBtn} onPress={handleConcluir} activeOpacity={0.85}>
          <LinearGradient
            colors={['#9B6FE0', '#5B21B6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.concludeGradient}
          >
            <Text style={styles.concludeText}>Concluir cultinho ✨</Text>
          </LinearGradient>
        </SoundButton>
      </ScrollView>

      {/* Sucesso */}
      <Modal visible={done} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setDone(false)}>
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <BeniAvatar variant="celebrating" size="large" />
            <Text style={styles.successTitle}>Cultinho guardado!</Text>
            <Text style={styles.successSub}>Beni ficou feliz com esse momento em família. 💜</Text>
            <SoundButton
              style={styles.successBtnPrimary}
              onPress={() => { setDone(false); navigation.navigate('Home'); }}
              activeOpacity={0.85}
            >
              <Text style={styles.successBtnPrimaryText}>Voltar para o início</Text>
            </SoundButton>
            <SoundButton
              style={styles.successBtnSecondary}
              onPress={() => { setDone(false); navigation.navigate('Home', { screen: 'Estrelinhas' }); }}
              activeOpacity={0.85}
            >
              <Text style={styles.successBtnSecondaryText}>Ver minhas estrelinhas</Text>
            </SoundButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  intro: {
    fontFamily: 'Nunito', fontSize: 13.5, color: pt.textSoft, fontWeight: '700',
    textAlign: 'center', marginBottom: 16, lineHeight: 19,
  },

  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: pt.border,
    ...shadows.card,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumberText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  stepTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text },
  stepBody: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19, marginBottom: 12 },

  storyCover: {
    width: '100%', aspectRatio: 16 / 9, borderRadius: radii.lg,
    overflow: 'hidden', marginBottom: 10, backgroundColor: '#EAF0FA',
  },
  storyCoverImg: { width: '100%', height: '100%' },
  storyCoverFallback: { justifyContent: 'center', alignItems: 'center' },
  storyCoverEmoji: { fontSize: 48 },
  storyTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 2 },
  storyRef: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, fontWeight: '700', marginBottom: 12 },

  primaryBtn: {
    borderRadius: radii.pill, paddingVertical: 13, alignItems: 'center',
  },
  primaryBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  questionLabel: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, fontWeight: '700', marginBottom: 8 },
  questionBox: {
    backgroundColor: pt.goldSoft, borderRadius: radii.md,
    padding: 14, borderLeftWidth: 3, borderLeftColor: pt.gold,
  },
  questionText: { fontFamily: 'Nunito', fontSize: 15, color: '#5A3E12', fontWeight: '700', lineHeight: 21 },

  prayerBox: {
    backgroundColor: pt.lilac, borderRadius: radii.md,
    padding: 14, borderLeftWidth: 3, borderLeftColor: pt.purple,
  },
  prayerText: { fontFamily: 'Nunito', fontSize: 15, color: pt.purpleDeep, fontWeight: '700', lineHeight: 21, fontStyle: 'italic' },

  concludeBtn: {
    borderRadius: radii.pill, overflow: 'hidden', marginTop: 4,
    elevation: 4, shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6,
  },
  concludeGradient: { paddingVertical: 16, alignItems: 'center' },
  concludeText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },

  // Sucesso
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28,
  },
  successBox: {
    backgroundColor: '#FFFDF8', borderRadius: radii.xl, padding: 26,
    width: '100%', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E0D2FA',
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20,
  },
  successTitle: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.text, marginTop: 8, marginBottom: 6 },
  successSub: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, fontWeight: '700', textAlign: 'center', lineHeight: 20, marginBottom: 18 },
  successBtnPrimary: {
    backgroundColor: pt.purple, borderRadius: radii.pill,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 8,
  },
  successBtnPrimaryText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
  successBtnSecondary: { paddingVertical: 10, alignItems: 'center' },
  successBtnSecondaryText: { fontFamily: 'Nunito', fontSize: 14, color: pt.muted, fontWeight: '700', textDecorationLine: 'underline' },
});
