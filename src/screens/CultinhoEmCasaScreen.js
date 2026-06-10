/**
 * CultinhoEmCasaScreen — "Cultinho em Casa" 2.0 (UX 1.0 — Bloco 4B).
 *
 * Pequeno culto familiar infantil de 3–5 min. NÃO repete a aventura: não reabre
 * a história inteira como etapa. Estrutura limpa e espiritual:
 *   1. A passagem de hoje (cena/frase + referência) — "Rever a história" é só link
 *   2. Beni explica (3–5 frases curtas, tom de pastor infantil)
 *   3. Conversa em família (uma pergunta)
 *   4. Oração curtinha (em destaque)
 *   + Colorir juntos é OPCIONAL ao final (abre o Ateliê com from:'cultinho')
 *   + Concluir → registro local (alimenta a cartinha de Coração no Baú)
 *
 * Sem backend, sem IA em tempo real, sem texto livre da criança.
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
import { getCultinhoForStory } from '../data/cultinhoData';

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

  // História sugerida — escolhida 1x por sessão (só ambienta a passagem do dia).
  const [story] = useState(() => getStoryOfTheWeek());
  const [cultinho] = useState(() => getCultinhoForStory(getStoryOfTheWeek()));
  const [done, setDone] = useState(false);

  const coverImg = story?.imagemCapa ? images[story.imagemCapa] : null;

  // "Rever a história" é apenas um link discreto — não compete com o Cultinho.
  function handleReviewStory() {
    if (story) navigation.navigate('StoryDetail', { story });
    else navigation.navigate('Home', { screen: 'Aventuras' });
  }

  function handleColorirJuntos() {
    // Ação opcional ao final — abre o Ateliê por contexto (volta ao Cultinho).
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
        subtitle="Um momentinho de fé em família (3–5 min)."
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
          message="Vamos ter um cultinho rapidinho juntos?"
          avatarVariant="reading"
          tone="purple"
          compact
          style={{ marginBottom: 14 }}
        />

        {/* Intro acolhedora */}
        <Text style={styles.intro}>
          Uma passagem, uma conversa e uma oração com Beni. 💜
        </Text>

        {/* 1. A passagem de hoje (cena/frase + referência) — sem reabrir a história */}
        <StepCard number="1" accent={pt.faithBlue} title="A passagem de hoje">
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
          <View style={styles.verseBox}>
            <Text style={styles.verseText}>“{cultinho.fraseDoDia}”</Text>
          </View>
          <SoundButton style={styles.reviewLink} onPress={handleReviewStory} activeOpacity={0.7}>
            <Text style={styles.reviewLinkText}>Rever a história</Text>
          </SoundButton>
        </StepCard>

        {/* 2. Beni explica (3–5 frases curtas) */}
        <StepCard number="2" accent={pt.purple} title="Beni explica">
          <View style={styles.beniExplainRow}>
            <BeniAvatar variant="reading" size="small" />
            <View style={styles.beniExplainTextWrap}>
              {cultinho.beniExplica.map((line, i) => (
                <Text key={i} style={styles.beniExplainLine}>{line}</Text>
              ))}
            </View>
          </View>
        </StepCard>

        {/* 3. Conversa em família */}
        <StepCard number="3" accent={pt.gold} title="Conversa em família">
          <Text style={styles.questionLabel}>Conversem juntos:</Text>
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>💬 {cultinho.pergunta}</Text>
          </View>
        </StepCard>

        {/* 4. Oração curtinha (em destaque) */}
        <StepCard number="4" accent={pt.beni} title="Oração curtinha">
          <View style={styles.prayerBox}>
            <Text style={styles.prayerText}>🙏 {cultinho.oracao}</Text>
          </View>
        </StepCard>

        {/* Concluir */}
        <SoundButton style={styles.concludeBtn} onPress={handleConcluir} activeOpacity={0.85}>
          <LinearGradient
            colors={['#9B6FE0', '#5B21B6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.concludeGradient}
          >
            <Text style={styles.concludeText}>Concluir cultinho ✨</Text>
          </LinearGradient>
        </SoundButton>

        {/* Colorir juntos — ação OPCIONAL ao final (não é etapa do fluxo) */}
        <SoundButton style={styles.optionalColorBtn} onPress={handleColorirJuntos} activeOpacity={0.85}>
          <Text style={styles.optionalColorText}>🎨 Colorir juntos (opcional)</Text>
        </SoundButton>
      </ScrollView>

      {/* Sucesso */}
      <Modal visible={done} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setDone(false)}>
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <BeniAvatar variant="celebrating" size="large" />
            <Text style={styles.successTitle}>Cultinho guardado!</Text>
            <Text style={styles.successSub}>Esse momento ficou guardado no coração. 💜</Text>
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
  storyRef: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, fontWeight: '700', marginBottom: 10 },

  // Frase do dia (passagem) — destaque suave, não é citação literal de versículo
  verseBox: {
    backgroundColor: pt.faithBlueSoft || '#EAF0FA', borderRadius: radii.md,
    padding: 14, borderLeftWidth: 3, borderLeftColor: pt.faithBlue, marginBottom: 10,
  },
  verseText: { fontFamily: 'Nunito', fontSize: 15, color: pt.faithBlueDeep || '#1E3A66', fontWeight: '800', lineHeight: 21, fontStyle: 'italic' },

  // "Rever a história" — link discreto (não compete com o fluxo)
  reviewLink: { alignSelf: 'flex-start', paddingVertical: 4 },
  reviewLinkText: { fontFamily: 'Nunito', fontSize: 13, color: pt.faithBlue, fontWeight: '800', textDecorationLine: 'underline' },

  // Beni explica
  beniExplainRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  beniExplainTextWrap: { flex: 1, gap: 6 },
  beniExplainLine: { fontFamily: 'Nunito', fontSize: 14, color: pt.text, fontWeight: '600', lineHeight: 20 },

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

  // Colorir juntos — opcional ao final (secundário, claramente não obrigatório)
  optionalColorBtn: {
    marginTop: 10, borderRadius: radii.pill, paddingVertical: 13, alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: pt.beni,
  },
  optionalColorText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.beni },

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
