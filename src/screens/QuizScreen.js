import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { colors } from '../theme/colors';
import SoundButton from '../components/SoundButton';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import { BeniSpeechCard } from '../components/beni';
import { QUIZZES } from '../data/quizzes';
import { prepareQuizQuestions, getCorrectOptionText, QUIZ_QUESTIONS_PER_STORY } from '../services/quizModel';
import { isQuizDone, markQuizDone, addBonusStars } from '../services/postStoryStorage';
import { canOpenQuiz } from '../services/accessControl';
import { useProgressContext } from '../context/ProgressContext';
import PremiumLockCard from '../components/premium/PremiumLockCard';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { breakpoints } from '../theme/tokens';
import AppScreen from '../components/layout/AppScreen';

const STAR_BONUS = 2;

export default function QuizScreen({ route, navigation }) {
  const { story } = route.params;
  const { width } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;

  const { refreshProgress, progressByStory, postStoryStatusByStory } = useProgressContext();

  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'QuizScreen' });

  // Normaliza (modelo por id) e EMBARALHA uma vez na carga. Estável após o toque:
  // o inicializador do useState roda só uma vez, então as opções não trocam mais.
  // Bloco 4 (DECISIONS.md #4): exatamente QUIZ_QUESTIONS_PER_STORY (4) perguntas por
  // história — as 4 PRIMEIRAS (q1–q4, determinístico; prepareQuizQuestions não
  // reordena, só embaralha as opções). q5–q8 seguem em quizzes.js como reserva.
  const [questions] = useState(() =>
    prepareQuizQuestions((QUIZZES[story.id] ?? []).filter(q => !q.quizDraft))
      .slice(0, QUIZ_QUESTIONS_PER_STORY),
  );

  const [step, setStep] = useState('quiz'); // 'quiz' | 'feedback' | 'result'
  const [current, setCurrent] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [bonusGranted, setBonusGranted] = useState(false);

  function handleBack() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('StoryDetail', { story });
  }

  if (!canOpenQuiz(story)) {
    return (
      <View style={[styles.wrapper, { justifyContent: 'center' }]}>
        <PremiumLockCard
          featureName="Quiz da história"
          title="Essa atividade é Plano Família"
          description="O quiz desta história é do Plano Família. Peça para um responsável ver os detalhes na Área dos Pais."
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
    if (selectedOptionId === null || confirmed) return;
    setConfirmed(true);
  }

  async function handleNext() {
    // Validação por ID — nunca por posição/letra.
    const isCorrect = selectedOptionId === question.correctOptionId;
    const newAnswers = [...answers, { questionId: question.id, selectedOptionId, correct: isCorrect }];
    setAnswers(newAnswers);

    if (current + 1 < totalQ) {
      setCurrent(current + 1);
      setSelectedOptionId(null);
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
        <SafeScreenHeader
          title="Quiz"
          subtitle={story.titulo}
          onBack={handleBack}
          showHome
          onHome={() => navigation.navigate('Home')}
          backgroundColor={allCorrect ? '#2E7D32' : colors.primaryDark}
          variant="dark"
        />
        <AppScreen
          scroll
          bottomExtra={48}
          contentContainerStyle={styles.resultContent}
        >
          <LinearGradient
            colors={allCorrect ? ['#43A047', '#2E7D32'] : [colors.primaryDark, colors.primary]}
            style={[styles.resultHeader, { paddingTop: 20 }]}
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
                      {wasCorrect ? getCorrectOptionText(q) : `Certo: ${getCorrectOptionText(q)}`}
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
        </AppScreen>
        {pendingAchievement && (
          <AchievementUnlockModal
            achievement={pendingAchievement}
            onDismiss={dismissAchievement}
          />
        )}
      </View>
    );
  }

  const isCorrectAnswer = confirmed && selectedOptionId === question.correctOptionId;
  const isWrongAnswer = confirmed && selectedOptionId !== question.correctOptionId;

  return (
    <View style={styles.wrapper}>
      <SafeScreenHeader
        title="Quiz"
        subtitle={story.titulo}
        onBack={handleBack}
        showHome
        onHome={() => navigation.navigate('Home')}
        backgroundColor={colors.primaryDark}
        variant="dark"
      />
      <AppScreen
        scroll
        bottomExtra={48}
        contentContainerStyle={styles.quizContent}
      >
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={[styles.quizHeader, { paddingTop: 20 }]}
        >
          <Text style={styles.quizHeaderLabel}>Quiz · {story.titulo}</Text>
          <Text style={styles.quizHeaderProgress}>Pergunta {current + 1} de {totalQ}</Text>
          <View style={styles.quizProgressBar}>
            <View style={[styles.quizProgressFill, { width: `${((current + 1) / totalQ) * 100}%` }]} />
          </View>
        </LinearGradient>

        <View style={[styles.quizBody, isTablet && styles.quizBodyTablet]}>
          {/* Beni só na primeira pergunta — incentivo, sem poluir */}
          {current === 0 && (
            <BeniSpeechCard context="quizStart" avatarVariant="pointing" style={{ marginBottom: 16 }} />
          )}
          <Text style={styles.questionText}>{question.question}</Text>

          {question.options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOpt = confirmed && opt.id === question.correctOptionId;
            const isWrongOpt = confirmed && isSelected && opt.id !== question.correctOptionId;
            return (
              <SoundButton
                key={opt.id}
                style={[
                  styles.optionBtn,
                  isSelected && !confirmed && styles.optionBtnSelected,
                  isCorrectOpt && styles.optionBtnCorrect,
                  isWrongOpt && styles.optionBtnWrong,
                ]}
                onPress={confirmed ? undefined : () => setSelectedOptionId(opt.id)}
                activeOpacity={confirmed ? 1 : 0.8}
              >
                <View style={[
                  styles.optionNum,
                  isSelected && !confirmed && styles.optionNumSelected,
                  isCorrectOpt && styles.optionNumCorrect,
                  isWrongOpt && styles.optionNumWrong,
                ]}>
                  {/* Letra = só rótulo visual da posição embaralhada */}
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
                  {opt.text}
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
              style={[styles.confirmBtn, selectedOptionId === null && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              activeOpacity={selectedOptionId === null ? 1 : 0.85}
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
      </AppScreen>
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
