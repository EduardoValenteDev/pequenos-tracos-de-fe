import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { colors } from '../theme/colors';
import SoundButton from '../components/SoundButton';
import { QUIZZES } from '../data/quizzes';
import { isQuizDone, markQuizDone, addBonusStars } from '../services/postStoryStorage';
import { canOpenQuiz } from '../services/accessControl';
import { useProgressContext } from '../context/ProgressContext';
import PremiumLockCard from '../components/premium/PremiumLockCard';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';

const STAR_BONUS = 2;

export default function QuizScreen({ route, navigation }) {
  const { story } = route.params;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;

  const questions = (QUIZZES[story.id] ?? []).filter(q => !q.quizDraft);
  const { refreshProgress, progressByStory, postStoryStatusByStory } = useProgressContext();

  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'QuizScreen' });

  const [step, setStep] = useState('quiz'); // 'quiz' | 'feedback' | 'result'
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [bonusGranted, setBonusGranted] = useState(false);

  if (!canOpenQuiz(story)) {
    return (
      <View style={[styles.wrapper, { justifyContent: 'center' }]}>
        <PremiumLockCard
          featureName="Quiz da história"
          title="Essa atividade é Especial da Família"
          description="O quiz desta história é do Especial da Família. Peça para um responsável ver os detalhes na Área dos Pais."
          onPrimaryPress={() => navigation.navigate('ParentArea')}
          primaryLabel="Ver Área dos Pais"
          onSecondaryPress={() => navigation.goBack()}
          secondaryLabel="Voltar"
        />
      </View>
    );
  }

  const question = questions[current];
  const totalQ = questions.length;

  if (!question && step !== 'result') {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.noQuiz}>Quiz não disponível para esta história.</Text>
        <SoundButton style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </SoundButton>
      </View>
    );
  }

  async function handleConfirm() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
  }

  async function handleNext() {
    const isCorrect = selected === question.correct;
    const newAnswers = [...answers, { questionId: question.id, selected, correct: isCorrect }];
    setAnswers(newAnswers);

    if (current + 1 < totalQ) {
      setCurrent(current + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      const alreadyDone = await isQuizDone(story.id);
      if (!alreadyDone) {
        await markQuizDone(story.id);
        await addBonusStars(STAR_BONUS);
        setBonusGranted(true);
        refreshProgress();
        setTimeout(() => { checkForNewAchievements(); }, 800);
      }
      setStep('result');
    }
  }

  const correctCount = answers.filter(a => a.correct).length;

  if (step === 'result') {
    const allCorrect = correctCount === totalQ;
    return (
      <View style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={[styles.resultContent, { paddingBottom: insets.bottom + 48 }]}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={allCorrect ? ['#43A047', '#2E7D32'] : [colors.primaryDark, colors.primary]}
            style={[styles.resultHeader, { paddingTop: Math.max(insets.top, 32) }]}
          >
            <Text style={styles.resultEmoji}>{allCorrect ? '🌟' : '⭐'}</Text>
            <Text style={styles.resultTitle}>
              {allCorrect ? 'Perfeito! Você acertou tudo!' : `Você acertou ${correctCount} de ${totalQ}!`}
            </Text>
            {bonusGranted && (
              <Text style={styles.resultBonus}>+1 ⭐ estrelas ganhas!</Text>
            )}
          </LinearGradient>

          <View style={[styles.resultBody, isTablet && styles.resultBodyTablet]}>
            <Text style={styles.resultSectionTitle}>Respostas</Text>
            {questions.map((q, i) => {
              const ans = answers[i];
              const wasCorrect = ans?.correct;
              return (
                <View
                  key={q.id}
                  style={[styles.answerCard, wasCorrect ? styles.answerCorrect : styles.answerWrong]}
                >
                  <Text style={styles.answerIcon}>{wasCorrect ? '✓' : '✗'}</Text>
                  <View style={styles.answerInfo}>
                    <Text style={styles.answerQuestion}>{q.question}</Text>
                    <Text style={styles.answerText}>
                      {wasCorrect ? q.options[q.correct] : `Certo: ${q.options[q.correct]}`}
                    </Text>
                  </View>
                </View>
              );
            })}

            <SoundButton
              style={styles.doneBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Continuar →</Text>
            </SoundButton>
          </View>
        </ScrollView>
        {pendingAchievement && (
          <AchievementUnlockModal
            achievement={pendingAchievement}
            onDismiss={dismissAchievement}
          />
        )}
      </View>
    );
  }

  const isCorrectAnswer = confirmed && selected === question.correct;
  const isWrongAnswer = confirmed && selected !== question.correct;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={[styles.quizContent, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={[styles.quizHeader, { paddingTop: Math.max(insets.top, 32) }]}
        >
          <Text style={styles.quizHeaderLabel}>Quiz · {story.titulo}</Text>
          <Text style={styles.quizHeaderProgress}>Pergunta {current + 1} de {totalQ}</Text>
          <View style={styles.quizProgressBar}>
            <View style={[styles.quizProgressFill, { width: `${((current + 1) / totalQ) * 100}%` }]} />
          </View>
        </LinearGradient>

        <View style={[styles.quizBody, isTablet && styles.quizBodyTablet]}>
          <Text style={styles.questionText}>{question.question}</Text>

          {question.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrectOpt = confirmed && idx === question.correct;
            const isWrongOpt = confirmed && isSelected && idx !== question.correct;
            return (
              <SoundButton
                key={idx}
                style={[
                  styles.optionBtn,
                  isSelected && !confirmed && styles.optionBtnSelected,
                  isCorrectOpt && styles.optionBtnCorrect,
                  isWrongOpt && styles.optionBtnWrong,
                ]}
                onPress={confirmed ? undefined : () => setSelected(idx)}
                activeOpacity={confirmed ? 1 : 0.8}
              >
                <View style={[
                  styles.optionNum,
                  isSelected && !confirmed && styles.optionNumSelected,
                  isCorrectOpt && styles.optionNumCorrect,
                  isWrongOpt && styles.optionNumWrong,
                ]}>
                  <Text style={[
                    styles.optionNumText,
                    (isSelected || isCorrectOpt) && { color: '#FFF' },
                  ]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && !confirmed && styles.optionTextSelected,
                  isCorrectOpt && { color: '#2E7D32' },
                  isWrongOpt && { color: '#C62828' },
                ]}>
                  {opt}
                </Text>
              </SoundButton>
            );
          })}

          {/* Feedback message */}
          {confirmed && (
            <View style={[
              styles.feedbackCard,
              isCorrectAnswer ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}>
              <Text style={styles.feedbackText}>
                {isCorrectAnswer ? '🎉 Muito bem!' : '😊 Quase! Vamos lembrar juntos.'}
              </Text>
            </View>
          )}

          {!confirmed ? (
            <SoundButton
              style={[styles.confirmBtn, selected === null && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              activeOpacity={selected === null ? 1 : 0.85}
            >
              <Text style={styles.confirmBtnText}>Confirmar</Text>
            </SoundButton>
          ) : (
            <SoundButton
              style={styles.confirmBtn}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>
                {current + 1 < totalQ ? 'Próxima →' : 'Ver resultado →'}
              </Text>
            </SoundButton>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  noQuiz: { fontFamily: 'Nunito', fontSize: 15, color: pt.text, textAlign: 'center', marginTop: 60 },

  quizContent: {},
  quizHeader: {
    paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center',
  },
  quizHeaderLabel: {
    fontFamily: 'Nunito', fontSize: 12, color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  quizHeaderProgress: {
    fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF', marginBottom: 12,
  },
  quizProgressBar: {
    width: '80%', height: 6, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3, overflow: 'hidden',
  },
  quizProgressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 3 },

  quizBody: { padding: 20 },
  quizBodyTablet: { paddingHorizontal: 64 },

  questionText: {
    fontFamily: 'FredokaOne', fontSize: 20, color: pt.text,
    lineHeight: 28, marginBottom: 24,
  },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radii.lg, padding: 14, marginBottom: 10, gap: 12,
    borderWidth: 2, borderColor: pt.border,
    ...shadows.soft,
  },
  optionBtnSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '0C' },
  optionBtnCorrect: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  optionBtnWrong: { borderColor: '#C62828', backgroundColor: '#FFEBEE' },
  optionNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: pt.border,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  optionNumSelected: { backgroundColor: colors.primary },
  optionNumCorrect: { backgroundColor: '#2E7D32' },
  optionNumWrong: { backgroundColor: '#C62828' },
  optionNumText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  optionText: {
    flex: 1, fontFamily: 'Nunito', fontSize: 14, color: pt.text,
    lineHeight: 20, fontWeight: '700',
  },
  optionTextSelected: { color: colors.primary },

  feedbackCard: {
    borderRadius: radii.lg, padding: 14, marginBottom: 12, alignItems: 'center',
  },
  feedbackCorrect: { backgroundColor: '#E8F5E9', borderLeftWidth: 4, borderLeftColor: '#2E7D32' },
  feedbackWrong: { backgroundColor: '#FFF8E1', borderLeftWidth: 4, borderLeftColor: '#F9A825' },
  feedbackText: {
    fontFamily: 'FredokaOne', fontSize: 16, color: pt.text,
  },

  confirmBtn: {
    marginTop: 8, backgroundColor: colors.action,
    borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center',
    elevation: 4, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
  },
  confirmBtnDisabled: { backgroundColor: pt.border, elevation: 0, shadowOpacity: 0 },
  confirmBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },

  // Result
  resultContent: {},
  resultHeader: {
    alignItems: 'center', paddingHorizontal: 24, paddingBottom: 28,
  },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultTitle: {
    fontFamily: 'FredokaOne', fontSize: 20, color: '#FFF',
    textAlign: 'center', marginBottom: 6,
  },
  resultBonus: {
    fontFamily: 'FredokaOne', fontSize: 16, color: '#FFD166', marginTop: 4,
  },
  resultBody: { padding: 20 },
  resultBodyTablet: { paddingHorizontal: 64 },
  resultSectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 12,
  },
  answerCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: radii.md, padding: 12, marginBottom: 10, gap: 10,
    borderLeftWidth: 3,
  },
  answerCorrect: { backgroundColor: pt.greenSoft, borderLeftColor: pt.green },
  answerWrong: { backgroundColor: '#FFF0F0', borderLeftColor: '#E74C3C' },
  answerIcon: { fontFamily: 'FredokaOne', fontSize: 16, marginTop: 1, width: 18 },
  answerInfo: { flex: 1 },
  answerQuestion: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, marginBottom: 2 },
  answerText: { fontFamily: 'Nunito', fontSize: 13, color: pt.text, fontWeight: '700' },

  doneBtn: {
    marginTop: 20, backgroundColor: colors.action,
    borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center',
    elevation: 4, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
  },
  doneBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },

  backBtn: {
    margin: 24, backgroundColor: pt.border,
    borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center',
  },
  backBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
});
