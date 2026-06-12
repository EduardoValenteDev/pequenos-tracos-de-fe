import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import { HEART_FEELINGS, HEART_KEEPS } from '../data/lumiReflections';
import { getReflection, saveReflection, addBonusStars } from '../services/postStoryStorage';
import { useProgressContext } from '../context/ProgressContext';
import BeniAvatar from '../components/beni/BeniAvatar';

const STAR_BONUS = 1;
// Bloco 4C: reflexão curta — 2 perguntas + feedback (não é quiz).
const STEPS = ['feeling', 'keep', 'done'];

function ChoiceGrid({ options, selected, onSelect, withEmoji }) {
  return (
    <View style={styles.choiceGrid}>
      {options.map((opt, idx) => {
        const label = withEmoji ? opt.label : opt;
        const emoji = withEmoji ? opt.emoji : null;
        const isSelected = selected === idx;
        return (
          <SoundButton
            key={idx}
            style={[styles.choiceBtn, isSelected && styles.choiceBtnSelected]}
            onPress={() => onSelect(idx)}
            activeOpacity={0.8}
          >
            {emoji ? (
              <Text style={styles.choiceEmoji}>{emoji}</Text>
            ) : null}
            <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
              {label}
            </Text>
          </SoundButton>
        );
      })}
    </View>
  );
}

export default function ReflectionScreen({ route, navigation }) {
  const { story } = route.params;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;

  const { refreshProgress } = useProgressContext();

  const [step, setStep] = useState(0);
  const [feelingIdx, setFeelingIdx] = useState(null);
  const [keepIdx, setKeepIdx] = useState(null);

  // A6: "Guardar no coração" é grátis no MVP — sem trava de plano aqui.

  const stepKey = STEPS[step];

  const keepLabel = keepIdx !== null ? HEART_KEEPS[keepIdx] : '';

  async function handleGuardar() {
    const reflection = {
      feeling: HEART_FEELINGS[feelingIdx]?.label ?? null,
      keep: HEART_KEEPS[keepIdx] ?? null,
      completedAt: Date.now(),
    };
    // Preserva recompensa/progresso existentes: +1 estrela só na 1ª vez.
    const alreadyDone = !!(await getReflection(story.id));
    await saveReflection(story.id, reflection);
    if (!alreadyDone) {
      await addBonusStars(STAR_BONUS);
    }
    refreshProgress();
    navigation.goBack(); // volta para a conclusão (quem empurrou a tela)
  }

  function handleNext() {
    if (stepKey === 'feeling' && feelingIdx !== null) setStep(1);
    else if (stepKey === 'keep' && keepIdx !== null) setStep(2);
  }

  const canAdvance =
    (stepKey === 'feeling' && feelingIdx !== null) ||
    (stepKey === 'keep' && keepIdx !== null);

  return (
    <View style={styles.wrapper}>
      <SafeScreenHeader
        title="Guardar no coração"
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('Home')}
        backgroundColor="#7C3AED"
        variant="dark"
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={[styles.header, { paddingTop: 12 }]}
        >
          <View style={styles.headerContent}>
            <BeniAvatar variant="thinking" size="medium" style={styles.headerBeni} />
            <Text style={styles.headerTitle}>Guardar no coração</Text>
            <Text style={styles.headerStory} numberOfLines={1}>
              Uma lembrança do coração, não uma prova. 💜
            </Text>
          </View>
        </LinearGradient>

        <View style={[styles.body, isTablet && styles.bodyTablet]}>

          {/* ── Tela 1: como o coração ficou ── */}
          {stepKey === 'feeling' && (
            <>
              <Text style={styles.stepQuestion}>Como seu coração ficou com essa história?</Text>
              <Text style={styles.stepHint}>Escolha uma lembrança para guardar com Beni.</Text>
              <ChoiceGrid
                options={HEART_FEELINGS}
                selected={feelingIdx}
                onSelect={setFeelingIdx}
                withEmoji
              />
            </>
          )}

          {/* ── Tela 2: o que guardar no coração ── */}
          {stepKey === 'keep' && (
            <>
              <Text style={styles.stepQuestion}>O que você quer guardar no coração?</Text>
              <Text style={styles.stepHint}>Escolha uma lembrança para guardar com Beni.</Text>
              <ChoiceGrid
                options={HEART_KEEPS}
                selected={keepIdx}
                onSelect={setKeepIdx}
              />
            </>
          )}

          {/* ── Final: feedback curto do Beni ── */}
          {stepKey === 'done' && (
            <View style={styles.doneCard}>
              <BeniAvatar variant="celebrating" size="large" />
              <Text style={styles.doneTitle}>Que lindo! Beni guardou esse momento com carinho.</Text>
              {!!keepLabel && (
                <View style={styles.keepChip}>
                  <Text style={styles.keepChipText}>💛 {keepLabel}</Text>
                </View>
              )}
            </View>
          )}

          {stepKey === 'done' ? (
            <SoundButton style={styles.nextBtn} onPress={handleGuardar} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>💛 Guardar no coração</Text>
            </SoundButton>
          ) : (
            <SoundButton
              style={[styles.nextBtn, !canAdvance && styles.nextBtnDisabled]}
              onPress={canAdvance ? handleNext : undefined}
              activeOpacity={canAdvance ? 0.85 : 1}
            >
              <Text style={styles.nextBtnText}>Próximo →</Text>
            </SoundButton>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },

  header: {
    paddingHorizontal: 24, paddingBottom: 24,
  },
  headerNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', marginBottom: 12,
  },
  headerNavBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  headerNavText: { fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
  headerContent: { alignItems: 'center', width: '100%' },
  headerEmoji: { fontSize: 44, marginBottom: 6 },
  headerBeni: { marginBottom: 8 },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 22, color: '#FFF', marginBottom: 4 },
  headerStory: { fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  progressBar: {
    width: '70%', height: 6, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 3 },

  body: { padding: 20 },
  bodyTablet: { paddingHorizontal: 64 },

  lumiSays: {
    fontFamily: 'Nunito', fontSize: 12, color: '#7C3AED',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  stepQuestion: {
    fontFamily: 'FredokaOne', fontSize: 20, color: pt.text,
    lineHeight: 27, marginBottom: 6,
  },
  stepHint: {
    fontFamily: 'Nunito', fontSize: 13.5, color: pt.textSoft,
    fontWeight: '700', marginBottom: 20, lineHeight: 19,
  },

  // Final — feedback curto do Beni
  doneCard: {
    alignItems: 'center', paddingVertical: 12, marginBottom: 8,
  },
  doneTitle: {
    fontFamily: 'FredokaOne', fontSize: 19, color: pt.text,
    textAlign: 'center', lineHeight: 26, marginTop: 10, marginBottom: 14,
  },
  keepChip: {
    backgroundColor: '#F5F0FF', borderRadius: radii.pill,
    paddingHorizontal: 18, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#C4B5FD',
  },
  keepChipText: {
    fontFamily: 'FredokaOne', fontSize: 15, color: '#7C3AED',
  },

  choiceGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  choiceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF',
    borderRadius: radii.pill,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 2, borderColor: pt.border,
    ...shadows.soft,
  },
  choiceBtnSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED' + '12',
  },
  choiceEmoji: { fontSize: 18 },
  choiceText: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.text, fontWeight: '700',
  },
  choiceTextSelected: { color: '#7C3AED' },

  lumiResponseCard: {
    backgroundColor: '#F5F0FF',
    borderRadius: radii.lg, padding: 20,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: '#C4B5FD',
    ...shadows.soft,
  },
  lumiResponseEmoji: { fontSize: 40, marginBottom: 8 },
  lumiResponseTitle: {
    fontFamily: 'FredokaOne', fontSize: 17, color: '#7C3AED',
    marginBottom: 8, textAlign: 'center',
  },
  lumiResponseMsg: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.text,
    lineHeight: 21, textAlign: 'center',
  },

  verseCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg, padding: 20,
    borderLeftWidth: 4, borderLeftColor: '#A78BFA',
    marginBottom: 16, ...shadows.soft,
  },
  verseText: {
    fontFamily: 'Nunito', fontSize: 16, color: pt.text,
    fontStyle: 'italic', lineHeight: 24, marginBottom: 8,
  },
  verseRef: {
    fontFamily: 'Nunito', fontSize: 12, color: '#7C3AED', fontWeight: '700',
  },
  repeatLabel: {
    fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 10,
  },
  repeatCard: {
    backgroundColor: '#F5F0FF',
    borderRadius: radii.md, padding: 16,
    borderWidth: 1.5, borderColor: '#A78BFA',
    marginBottom: 20,
  },
  repeatText: {
    fontFamily: 'Nunito', fontSize: 14, color: '#7C3AED',
    fontStyle: 'italic', lineHeight: 21, fontWeight: '700', textAlign: 'center',
  },

  nextBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center',
    elevation: 4, shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
  },
  nextBtnDisabled: { backgroundColor: pt.border, elevation: 0, shadowOpacity: 0 },
  nextBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
});
