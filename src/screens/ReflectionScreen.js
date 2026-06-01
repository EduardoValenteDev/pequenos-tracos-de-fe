import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import {
  LUMI_FEELINGS, LUMI_LEARNED, LUMI_PRAYERS, LEARNING_VERSES,
} from '../data/lumiReflections';
import { getReflection, saveReflection, addBonusStars } from '../services/postStoryStorage';
import { canOpenLumi } from '../services/accessControl';
import { useProgressContext } from '../context/ProgressContext';
import PremiumLockCard from '../components/premium/PremiumLockCard';

const STAR_BONUS = 1;
const STEPS = ['feeling', 'learned', 'prayer', 'response'];

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
  const [learnedIdx, setLearnedIdx] = useState(null);
  const [prayerIdx, setPrayerIdx] = useState(null);

  if (!canOpenLumi(story)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#FDF8EE' }}>
        <PremiumLockCard
          featureName="Converse com Lumi"
          title="Essa reflexão é especial"
          description="Conversar com Lumi é uma experiência Especial da Família. Peça para um responsável ver os detalhes na Área dos Pais."
          onPrimaryPress={() => navigation.navigate('ParentArea')}
          primaryLabel="Ver Área dos Pais"
          onSecondaryPress={() => navigation.goBack()}
          secondaryLabel="Voltar"
        />
      </View>
    );
  }

  const stepKey = STEPS[step];

  const feelingLabel = feelingIdx !== null ? LUMI_FEELINGS[feelingIdx].label.toLowerCase() : '';
  const learnedLabel = learnedIdx !== null ? LUMI_LEARNED[learnedIdx] : '';
  const verse = learnedLabel ? (LEARNING_VERSES[learnedLabel] ?? {
    text: 'O Senhor é bom para todos.',
    ref: 'Salmos 145:9',
  }) : null;

  async function handleNext() {
    if (stepKey === 'response') {
      const reflection = {
        feelingIdx, learnedIdx, prayerIdx,
        feeling: LUMI_FEELINGS[feelingIdx]?.label,
        learned: LUMI_LEARNED[learnedIdx],
        prayer: LUMI_PRAYERS[prayerIdx],
        completedAt: Date.now(),
      };
      const alreadyDone = !!(await getReflection(story.id));
      await saveReflection(story.id, reflection);
      if (!alreadyDone) {
        await addBonusStars(STAR_BONUS);
      }
      refreshProgress();
      navigation.goBack();
      return;
    }
    setStep(step + 1);
  }

  const canAdvance =
    (stepKey === 'feeling' && feelingIdx !== null) ||
    (stepKey === 'learned' && learnedIdx !== null) ||
    (stepKey === 'prayer' && prayerIdx !== null) ||
    stepKey === 'response';

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}
        >
          <View style={styles.headerNav}>
            <SoundButton style={styles.headerNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.headerNavText}>← Voltar</Text>
            </SoundButton>
            <SoundButton style={styles.headerNavBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.7}>
              <Text style={styles.headerNavText}>🏠</Text>
            </SoundButton>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🐑</Text>
            <Text style={styles.headerTitle}>Conversa com Lumi</Text>
            <Text style={styles.headerStory} numberOfLines={1}>{story.titulo}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.body, isTablet && styles.bodyTablet]}>

          {/* ── Feeling ── */}
          {stepKey === 'feeling' && (
            <>
              <Text style={styles.lumiSays}>🐑 Lumi pergunta:</Text>
              <Text style={styles.stepQuestion}>Como você se sentiu com essa história?</Text>
              <ChoiceGrid
                options={LUMI_FEELINGS}
                selected={feelingIdx}
                onSelect={setFeelingIdx}
                withEmoji
              />
            </>
          )}

          {/* ── Learned ── */}
          {stepKey === 'learned' && (
            <>
              <Text style={styles.lumiSays}>🐑 Lumi pergunta:</Text>
              <Text style={styles.stepQuestion}>O que você aprendeu?</Text>
              <ChoiceGrid
                options={LUMI_LEARNED}
                selected={learnedIdx}
                onSelect={setLearnedIdx}
              />
            </>
          )}

          {/* ── Prayer ── */}
          {stepKey === 'prayer' && (
            <>
              <Text style={styles.lumiSays}>🐑 Lumi pergunta:</Text>
              <Text style={styles.stepQuestion}>O que você quer dizer para Deus?</Text>
              <ChoiceGrid
                options={LUMI_PRAYERS}
                selected={prayerIdx}
                onSelect={setPrayerIdx}
              />
            </>
          )}

          {/* ── Response ── */}
          {stepKey === 'response' && verse && (
            <>
              <View style={styles.lumiResponseCard}>
                <Text style={styles.lumiResponseEmoji}>🐑</Text>
                <Text style={styles.lumiResponseTitle}>Lumi ouviu você com carinho.</Text>
                <Text style={styles.lumiResponseMsg}>
                  {`Você se sentiu ${feelingLabel} e aprendeu que ${learnedLabel.toLowerCase()}. Que lindo! 💛`}
                </Text>
              </View>

              <View style={styles.verseCard}>
                <Text style={styles.verseText}>"{verse.text}"</Text>
                <Text style={styles.verseRef}>{verse.ref}</Text>
              </View>

              <Text style={styles.repeatLabel}>Repita com Lumi:</Text>
              <View style={styles.repeatCard}>
                <Text style={styles.repeatText}>"{verse.text}"</Text>
              </View>
            </>
          )}

          <SoundButton
            style={[styles.nextBtn, !canAdvance && styles.nextBtnDisabled]}
            onPress={canAdvance ? handleNext : undefined}
            activeOpacity={canAdvance ? 0.85 : 1}
          >
            <Text style={styles.nextBtnText}>
              {stepKey === 'response' ? '✓ Concluir (+1 ⭐)' : 'Próximo →'}
            </Text>
          </SoundButton>
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
    lineHeight: 27, marginBottom: 20,
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
