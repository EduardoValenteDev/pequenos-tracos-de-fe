import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Linking, TextInput, Alert, Share, Switch,
  TouchableOpacity, useWindowDimensions,
} from 'react-native';
import ParentalGate from '../components/ParentalGate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { FREE_PLAN, PREMIUM_PLAN, PLAN_PRICING } from '../data/planConfig';
import { getCurrentPlan } from '../services/accessControl';
import {
  isCreatorQaModeAllowed,
  isCreatorQaModeEnabled,
  setCreatorQaModeEnabled,
} from '../services/creatorQaMode';
import { resetOnboardingForQa } from '../services/onboardingService';
import { resetBeniAppTour, resetAllGuides, requestInitialTour } from '../services/beniTourService';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { useScreenGuide } from '../hooks/useScreenGuide';
import { PARENT_GUIDE_BASE, PARENT_GUIDE_CREATOR_STEP } from '../data/beniGuides';
import productConfig from '../config/productConfig';
import { useProgressContext } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';
import { AVATARS } from '../data/avatars';
import { stories } from '../data/stories';
import { resetProgress } from '../services/progressResetService';
import { getStoreReviewUrl } from '../config/storeLinks';
import SoundButton from '../components/SoundButton';
import { BeniSpeechCard } from '../components/beni';
import {
  getParentSettings,
  updateParentSettings,
  getParentalConsent,
  acceptParentalConsent,
  revokeParentalConsent,
} from '../services/parentSettingsService';
import {
  getChurchGroups,
  createChurchGroup as createGroup,
  deleteChurchGroup,
} from '../services/churchModeService';
import { PARENTAL_CONSENT_FLOW_ENABLED } from '../config/featureFlags';
import {
  getAudioPreferences,
  loadAudioPreferences,
  setSoundsEnabled,
  setMusicEnabled,
} from '../services/audioManager';

const SUPPORT_EMAIL = productConfig.supportEmail;

// Ferramentas de teste do responsável (Modo Criador, rever Beni, build info).
// Aparecem em DEV/Expo Go/teste local; ficam ocultas em produção real.
// __DEV__ é true em desenvolvimento; isCreatorQaModeAllowed() também cobre a
// flag de build EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE.
const SHOW_TEST_TOOLS =
  (typeof __DEV__ !== 'undefined' && __DEV__ === true) || isCreatorQaModeAllowed();

// ── Componentes internos ──────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/**
 * AccordionSection — seção recolhível (UX 1.0 — Bloco 4E). A Área dos Pais abre
 * mostrando só o essencial: apenas "Resumo da criança" inicia aberta; as demais
 * iniciam fechadas, com uma frase-resumo (hint) visível quando recolhidas.
 */
function AccordionSection({ title, defaultOpen = false, hint, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <View style={styles.accordion}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Text style={styles.accordionChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {!open && hint ? <Text style={styles.accordionHint}>{hint}</Text> : null}
      {open ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

function InfoCard({ children, style }) {
  return <View style={[styles.infoCard, style]}>{children}</View>;
}

function FeatureRow({ emoji, label }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

function SecurityPoint({ text }) {
  return (
    <View style={styles.securityRow}>
      <Text style={styles.securityDot}>•</Text>
      <Text style={styles.securityText}>{text}</Text>
    </View>
  );
}

function MetricCard({ emoji, value, label }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricEmoji}>{emoji}</Text>
      <Text style={styles.metricValue}>{String(value)}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ToggleRow({ label, description, value, onValueChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? <Text style={styles.toggleDesc}>{description}</Text> : null}
      </View>
      <Switch
        value={!!value}
        onValueChange={onValueChange}
        trackColor={{ false: '#CBD5E1', true: pt.green }}
        thumbColor="#FFF"
      />
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function ParentAreaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const currentPlan = getCurrentPlan();
  const isPremium = currentPlan === 'premium';

  const { progressSummary, progressByStory, postStoryStatusByStory, refreshProgress } = useProgressContext();
  const { profile } = useProfile();

  // Gate
  const [unlockedForSession, setUnlockedForSession] = useState(false);
  const [gateVisible, setGateVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);

  // QA
  const qaAllowed = isCreatorQaModeAllowed();
  const [qaEnabled, setQaEnabled] = useState(isCreatorQaModeEnabled());
  const [beniResetDone, setBeniResetDone] = useState(false);

  // UX 2.3: guia da Área dos Pais DESATIVADO (reprovado) — só reativa no bloco UX 2.8.
  const parentGuide = useScreenGuide('parentArea', false);
  const parentGuideSteps = SHOW_TEST_TOOLS
    ? [...PARENT_GUIDE_BASE, PARENT_GUIDE_CREATOR_STEP]
    : PARENT_GUIDE_BASE;

  // Reset de progresso
  const [resetStep, setResetStep] = useState('idle');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Restore purchase
  const [restoreState, setRestoreState] = useState('idle');

  // Expansão do progresso por história (recolhido por padrão)
  const [storyProgressExpanded, setStoryProgressExpanded] = useState(false);
  // Métricas secundárias (recolhidas por padrão — só 3 principais no topo)
  const [metricsExpanded, setMetricsExpanded] = useState(false);

  // Configurações dos pais + consentimento
  const [parentSettings, setParentSettings] = useState({
    sundayStoryReminderEnabled: false,
    familyReminderEnabled: false,
    allowShareCards: false,
    allowProgressReports: true,
    allowChurchMode: false,
  });
  const [consent, setConsent] = useState({ accepted: false, acceptedAt: null });

  // Preferências de áudio (sons de botões + música de fundo)
  const [audioPrefs, setAudioPrefs] = useState(getAudioPreferences());

  // Modo Igreja
  const [churchGroups, setChurchGroups] = useState([]);
  const [showChurchForm, setShowChurchForm] = useState(false);
  const [churchForm, setChurchForm] = useState({ name: '', leaderName: '', ageGroup: '', weeklyStory: '' });
  const [churchSaving, setChurchSaving] = useState(false);

  useEffect(() => {
    if (!unlockedForSession) return;
    loadParentData();
  }, [unlockedForSession]);

  // Carrega as preferências de áudio salvas (sons/música).
  useEffect(() => {
    let alive = true;
    loadAudioPreferences().then(p => { if (alive) setAudioPrefs(p); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  async function handleToggleSounds(value) {
    const applied = await setSoundsEnabled(value);
    setAudioPrefs(p => ({ ...p, soundsEnabled: applied }));
  }

  async function handleToggleMusic(value) {
    const applied = await setMusicEnabled(value);
    setAudioPrefs(p => ({ ...p, musicEnabled: applied }));
  }

  async function loadParentData() {
    try {
      const [settings, con, groups] = await Promise.all([
        getParentSettings(),
        getParentalConsent(),
        getChurchGroups(),
      ]);
      setParentSettings(s => ({ ...s, ...settings }));
      setConsent(con);
      setChurchGroups(groups);
    } catch {
      // silently ignore — defaults já definidos
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleToggleSetting(key, value) {
    try {
      const updated = await updateParentSettings({ [key]: value });
      setParentSettings(s => ({ ...s, ...updated }));
    } catch {
      // silently ignore
    }
  }

  // Consentimento parental formal — só usado quando PARENTAL_CONSENT_FLOW_ENABLED.
  // Mantido (não deletado) para quando existir recurso sensível/envio externo.
  async function handleAcceptConsent() {
    const result = await acceptParentalConsent({ version: '1.0' });
    if (result) setConsent(result);
  }

  function handleRevokeConsent() {
    Alert.alert(
      'Revogar consentimento',
      'Deseja revogar o consentimento parental? O app continuará funcionando normalmente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revogar',
          style: 'destructive',
          onPress: async () => {
            const result = await revokeParentalConsent();
            if (result) setConsent(result);
          },
        },
      ],
    );
  }

  async function handleCreateChurchGroup() {
    if (!churchForm.name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, informe o nome da turma.');
      return;
    }
    setChurchSaving(true);
    try {
      const group = await createGroup({
        name: churchForm.name.trim(),
        leaderName: churchForm.leaderName.trim(),
        churchName: churchForm.ageGroup.trim(), // faixa/grupo guardado no campo existente
      });
      // anexa metadados locais (faixa e história da semana) ao grupo retornado
      const enriched = { ...group, ageGroup: churchForm.ageGroup.trim(), weeklyStory: churchForm.weeklyStory.trim() };
      setChurchGroups(prev => [...prev, enriched]);
      setChurchForm({ name: '', leaderName: '', ageGroup: '', weeklyStory: '' });
      setShowChurchForm(false);
    } catch {
      Alert.alert('Não foi possível criar a turma agora', 'Tente novamente em instantes.');
    } finally {
      setChurchSaving(false);
    }
  }

  async function handleShareChurchGuidance(group) {
    const story = group.weeklyStory?.trim() || 'a história da semana';
    const message =
      `Olá, famílias! Nesta semana nossa turma "${group.name}" vai acompanhar ${story} no Pequenos Traços de Fé. ` +
      'Separem um momento em casa para conversar, colorir e guardar o aprendizado no coração. 💛';
    try {
      await Share.share({ message });
    } catch {
      // se o compartilhamento falhar, mostramos a mensagem para copiar manualmente
      Alert.alert('Orientação para as famílias', message);
    }
  }

  function handleDeleteChurchGroup(groupId) {
    Alert.alert(
      'Excluir turma',
      'Deseja excluir esta turma? O código de convite deixará de funcionar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteChurchGroup(groupId);
            setChurchGroups(prev => prev.filter(g => g.id !== groupId));
          },
        },
      ],
    );
  }

  async function handleToggleQa(value) {
    const applied = await setCreatorQaModeEnabled(value);
    setQaEnabled(applied);
    refreshProgress();
  }

  async function handleResetBeniOnboarding() {
    const result = await resetOnboardingForQa();
    if (result.success) {
      setBeniResetDone(true);
    } else {
      Alert.alert('Erro', 'Não foi possível resetar o onboarding. Tente novamente.');
    }
  }

  // Rever o Tour INICIAL do Beni: limpa a flag e abre a aba Aventuras com o gatilho.
  async function handleReviewBeniTour() {
    await resetBeniAppTour();
    requestInitialTour(); // tablet: foca Aventuras via sinal; mobile: também usa o param
    navigation.navigate('Home', { screen: 'Aventuras', params: { startBeniTour: true } });
  }

  // Resetar TODOS os guias contextuais do Beni (inicial + por aba) para revê-los.
  async function handleResetAllGuides() {
    const result = await resetAllGuides();
    Alert.alert(
      result?.success ? 'Guias resetados' : 'Erro',
      result?.success
        ? 'Os guias do Beni vão aparecer de novo quando você abrir as telas.'
        : 'Não foi possível resetar os guias. Tente novamente.',
    );
  }

  const handleRestorePurchase = useCallback(() => {
    setRestoreState('loading');
    setTimeout(() => setRestoreState('unavailable'), 1200);
  }, []);

  function openWithGate(url) {
    setPendingUrl(url);
    setGateVisible(true);
  }

  function handleGatePass() {
    if (!unlockedForSession) {
      setUnlockedForSession(true);
      return;
    }
    setGateVisible(false);
    if (pendingUrl) Linking.openURL(pendingUrl);
    setPendingUrl(null);
  }

  function handleGateCancel() {
    setGateVisible(false);
    if (!unlockedForSession) {
      if (navigation.canGoBack()) navigation.goBack();
    }
    setPendingUrl(null);
  }

  async function handleExecuteReset() {
    if (resetConfirmText.trim() !== 'APAGAR') return;
    setResetLoading(true);
    try {
      await resetProgress();
      refreshProgress();
      setResetStep('done');
      setResetConfirmText('');
    } catch {
      Alert.alert('Erro', 'Não foi possível limpar o progresso. Tente novamente.');
    } finally {
      setResetLoading(false);
    }
  }

  // ── Dados derivados ───────────────────────────────────────────────────────────

  const playableStories = stories.filter(s => (s.totalCenas ?? 0) > 0);

  const startedStoriesCount = playableStories.filter(s => {
    const prog = progressByStory[s.id] ?? {};
    const done = Object.values(prog).filter(Boolean).length;
    return done > 0 && done < (s.totalCenas ?? 0);
  }).length;

  function getStoryStatus(story) {
    const prog = progressByStory[story.id] ?? {};
    const done = Object.values(prog).filter(Boolean).length;
    const total = story.totalCenas ?? 0;
    if (done === 0) return 'Não iniciada';
    if (done >= total) return 'Concluída ✓';
    return 'Em andamento';
  }

  const childAvatarObj = AVATARS.find(a => a.id === profile.avatarId);
  const childAvatarEmoji = childAvatarObj?.emoji ?? '⭐';
  const childDisplayName = profile.name?.trim() || 'Ainda não definido';
  const storeUrl = getStoreReviewUrl();

  // ── Próximo passo recomendado (dados locais simples) ──
  const completedStoriesCount = progressSummary?.completedStories ?? 0;
  const coloredScenesCount = progressSummary?.completedScenes ?? 0;
  const storyBookOpenedCount = progressSummary?.storyBookOpenedCount ?? 0;
  const nextStep = (() => {
    if (startedStoriesCount > 0) {
      return { emoji: '▶️', title: 'Continue uma história', desc: 'Há uma aventura começada esperando para ser concluída.' };
    }
    if (coloredScenesCount > 0 && storyBookOpenedCount === 0) {
      return { emoji: '📖', title: 'Abra o Livrinho da Fé', desc: 'As cenas coloridas já formam um livrinho especial para rever.' };
    }
    if (completedStoriesCount === 0 && startedStoriesCount === 0) {
      return { emoji: '✨', title: 'Comece a primeira história', desc: 'A primeira aventura gratuita é um ótimo ponto de partida.' };
    }
    return { emoji: '🌱', title: 'Continue explorando', desc: 'Cada história traz um novo ensino para descobrir com calma.' };
  })();

  // ── Gate screen ───────────────────────────────────────────────────────────────

  if (!unlockedForSession) {
    return (
      <View style={styles.gateWrapper}>
        <ParentalGate visible onPass={handleGatePass} onCancel={handleGateCancel} />
        <LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.gateBg}>
          <Text style={styles.gateBgEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.gateBgTitle}>Área dos Pais</Text>
          <Text style={styles.gateBgSub}>
            Peça para um responsável resolver o desafio para continuar.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // ── Tela principal ────────────────────────────────────────────────────────────

  return (
    <>
      <ParentalGate visible={gateVisible} onPass={handleGatePass} onCancel={handleGateCancel} />
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.body, isTablet && styles.bodyTablet, { paddingTop: insets.top + 14 }]}>

          {/* ── Topo compacto (central simples) ── */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Central da família</Text>
            <Text style={styles.welcomeSub}>
              O essencial primeiro. Toque numa seção para ver os detalhes.
            </Text>
          </View>
          <BeniSpeechCard
            context="parentArea"
            variant="adult"
            text="Pequenos momentos frequentes ajudam mais do que sessões longas."
            style={{ marginTop: 8 }}
          />

          {/* ─── 1. RESUMO DA CRIANÇA (única aberta por padrão) ─────────────────── */}
          <AccordionSection title="Resumo da criança" defaultOpen>
            <InfoCard>
              <View style={styles.childProfileRow}>
                <Text style={styles.childAvatarEmoji}>{childAvatarEmoji}</Text>
                <View style={styles.childProfileInfo}>
                  <Text style={styles.childName}>{childDisplayName}</Text>
                  <Text style={styles.childSubtitle}>Explorador(a) das histórias</Text>
                </View>
              </View>
              <View style={styles.metricsRow}>
                <MetricCard emoji="⭐" value={progressSummary?.totalStars ?? 0} label="Estrelas" />
                <MetricCard emoji="▶" value={startedStoriesCount} label="Em andamento" />
                <MetricCard emoji="🎨" value={coloredScenesCount} label="Cenas" />
              </View>
              {!metricsExpanded ? (
                <TouchableOpacity onPress={() => setMetricsExpanded(true)} style={styles.detailsLink} activeOpacity={0.7}>
                  <Text style={styles.detailsLinkText}>Ver detalhes</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View style={[styles.metricsRow, { marginTop: 10 }]}>
                    <MetricCard emoji="🏆" value={completedStoriesCount} label="Concluídas" />
                    <MetricCard emoji="🧩" value={progressSummary?.quizCompletedCount ?? 0} label="Quiz" />
                    <MetricCard emoji="📚" value={storyBookOpenedCount} label="Livrinho" />
                  </View>
                  <TouchableOpacity onPress={() => setMetricsExpanded(false)} style={styles.detailsLink} activeOpacity={0.7}>
                    <Text style={styles.detailsLinkText}>Recolher</Text>
                  </TouchableOpacity>
                </>
              )}
            </InfoCard>

            {/* Próximo passo recomendado */}
            <InfoCard style={styles.nextStepCard}>
              <Text style={styles.nextStepLabel}>Próximo passo recomendado</Text>
              <View style={styles.nextStepRow}>
                <Text style={styles.nextStepEmoji}>{nextStep.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextStepTitle}>{nextStep.title}</Text>
                  <Text style={styles.nextStepDesc}>{nextStep.desc}</Text>
                </View>
              </View>
            </InfoCard>
          </AccordionSection>

          {/* ─── 2. JORNADA E PROGRESSO ───────────────────────────────────────── */}
          <AccordionSection
            title="Jornada e progresso"
            hint="Estrelas, histórias concluídas e o progresso de cada aventura."
          >
            <InfoCard>
              {progressSummary !== null && (
                <View style={styles.progressRow}>
                  <Text style={styles.progressStar}>⭐</Text>
                  <View>
                    <Text style={styles.progressValue}>
                      {progressSummary.totalStars} estrela{progressSummary.totalStars !== 1 ? 's' : ''} conquistada{progressSummary.totalStars !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.progressNote}>
                      {progressSummary.completedStories} histór{progressSummary.completedStories !== 1 ? 'ias' : 'ia'} concluída{progressSummary.completedStories !== 1 ? 's' : ''} · {progressSummary.completedScenes} cenas coloridas
                    </Text>
                  </View>
                </View>
              )}
              <Text style={[styles.bodyText, progressSummary !== null && { marginTop: 12 }]}>
                Cada cena colorida vale <Text style={styles.bold}>1 estrela</Text>. Quiz vale{' '}
                <Text style={styles.bold}>+1</Text>, reflexão com Beni vale{' '}
                <Text style={styles.bold}>+1</Text> e Livrinho vale{' '}
                <Text style={styles.bold}>+1 estrela</Text>.
              </Text>
            </InfoCard>

            {/* Progresso por história (recolhido por padrão) */}
            <SectionTitle>📖 Progresso por história</SectionTitle>
            <InfoCard>
              <TouchableOpacity
                style={styles.storyToggleRow}
                onPress={() => setStoryProgressExpanded(e => !e)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.storyToggleTitle}>
                    {playableStories.length} histórias · {progressSummary?.completedStories ?? 0} concluídas · {startedStoriesCount} em andamento
                  </Text>
                  <Text style={styles.storyToggleSub}>
                    Veja o progresso de cada história em detalhes.
                  </Text>
                </View>
                <Text style={styles.storyToggleChevron}>
                  {storyProgressExpanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {!storyProgressExpanded && (
                <SoundButton
                  style={styles.storyToggleShowBtn}
                  onPress={() => setStoryProgressExpanded(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.storyToggleShowBtnText}>Ver histórias</Text>
                </SoundButton>
              )}

              {storyProgressExpanded && (
                <View style={{ marginTop: 14 }}>
                  {playableStories.map(story => {
                    const prog = progressByStory[story.id] ?? {};
                    const done = Object.values(prog).filter(Boolean).length;
                    const total = story.totalCenas ?? 0;
                    const pss = postStoryStatusByStory[story.id];
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    const status = getStoryStatus(story);
                    const isFree = story.accessType === 'free';
                    return (
                      <View key={story.id} style={styles.storyProgressRow}>
                        <View style={styles.storyProgressHeader}>
                          <Text style={styles.storyProgressEmoji}>{story.emoji}</Text>
                          <View style={styles.storyProgressInfo}>
                            <Text style={styles.storyProgressTitle} numberOfLines={1}>{story.titulo}</Text>
                            <Text style={styles.storyProgressPlan}>
                              {isFree ? '✨ Grátis' : '💎 Plano Família'} · {status}
                            </Text>
                          </View>
                          <Text style={styles.storyProgressPct}>{pct}%</Text>
                        </View>
                        <View style={styles.storyProgressBar}>
                          <View style={[styles.storyProgressFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.storyProgressDetail}>
                          {done}/{total} cenas
                          {pss?.quizDone ? ' · Quiz ✓' : ''}
                          {pss?.reflectionDone ? ' · Beni ✓' : ''}
                          {pss?.storyBookOpened ? ' · Livrinho ✓' : ''}
                        </Text>
                      </View>
                    );
                  })}
                  <SoundButton
                    style={styles.storyToggleHideBtn}
                    onPress={() => setStoryProgressExpanded(false)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.storyToggleHideBtnText}>▲ Recolher</Text>
                  </SoundButton>
                </View>
              )}
            </InfoCard>
          </AccordionSection>

          {/* ─── 3. PLANO ──────────────────────────────────────────────────────── */}
          <AccordionSection
            title="Plano familiar"
            hint={isPremium ? 'Plano atual: Família.' : 'Plano atual: gratuito · 2 histórias gratuitas e recursos básicos.'}
          >
            <InfoCard style={isPremium ? styles.premiumCard : styles.freeCard}>
              <Text style={styles.cardHeading}>{isPremium ? 'Plano atual: Família' : 'Plano atual: gratuito'}</Text>
              <Text style={styles.bodyText}>
                {isPremium
                  ? 'Acesso completo a todas as histórias, Beni e Ateliê ilimitado.'
                  : '2 histórias gratuitas (trilha Comece Aqui), quiz dessas histórias e 3 artes salvas no Ateliê.'}
              </Text>
              <View style={styles.featureList}>
                {FREE_PLAN.items.map((item, idx) => (
                  <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
                ))}
              </View>
            </InfoCard>

            {/* Apresentação do Plano Família — informativa, sem botões acionáveis */}
            <InfoCard style={[styles.planPrepCard, { marginTop: 8 }]}>
              <Text style={styles.cardHeading}>Plano Família</Text>
              <Text style={styles.bodyText}>
                Mais histórias e recursos familiares para continuar a jornada. Será liberado quando as compras estiverem ativas; os conteúdos já estão preparados.
              </Text>
              <View style={[styles.featureList, { marginTop: 10 }]}>
                {PREMIUM_PLAN.items.map((item, idx) => (
                  <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
                ))}
              </View>
              <View style={[styles.comingSoonBadge, { alignSelf: 'flex-start', marginTop: 12 }]}>
                <Text style={styles.comingSoonBadgeText}>Disponível em uma próxima atualização</Text>
              </View>
            </InfoCard>
          </AccordionSection>

          {/* ─── SONS E MÚSICA ────────────────────────────────────────────────── */}
          <AccordionSection
            title="Sons e música"
            hint="Ligue ou desligue os sons de botões e a música de fundo."
          >
            <InfoCard>
              <ToggleRow
                label="Sons de botões"
                description="Toques sutis nos botões principais do app."
                value={audioPrefs.soundsEnabled}
                onValueChange={handleToggleSounds}
              />
              <ToggleRow
                label="Música de fundo"
                description="Música suave nas telas de navegação. Pausa sozinha durante a narração das histórias."
                value={audioPrefs.musicEnabled}
                onValueChange={handleToggleMusic}
              />
            </InfoCard>
          </AccordionSection>

          {/* ─── 4. SEGURANÇA E PRIVACIDADE ───────────────────────────────────── */}
          <AccordionSection
            title="Segurança e privacidade"
            hint="Este app salva apenas dados locais neste aparelho. Nada é enviado automaticamente para a internet."
          >
            {/* Resumo de privacidade (mensagem principal, curta) */}
            <InfoCard style={styles.privacySummaryCard}>
              <Text style={styles.cardHeading}>Resumo de privacidade</Text>
              <Text style={styles.bodyText}>
                Este app salva apenas dados locais. Os dados ficam neste aparelho e nada é enviado automaticamente para a internet. O app funciona sem login e o responsável pode apagar o progresso quando quiser.
              </Text>
            </InfoCard>

            <InfoCard style={{ marginTop: 8 }}>
              <Text style={styles.cardHeading}>O que fica salvo localmente</Text>
              <SecurityPoint text="Sem login e sem cadastro." />
              <SecurityPoint text="Nome ou apelido da criança (somente o que você digitar)." />
              <SecurityPoint text="Avatar escolhido." />
              <SecurityPoint text="Progresso nas histórias: cenas coloridas, quiz, reflexão e livrinho." />
              <SecurityPoint text="Desenhos salvos no Ateliê." />
              <SecurityPoint text="Conquistas e estrelas." />
              <SecurityPoint text="Configurações desta tela." />
              <View style={styles.privacyGuaranteeBox}>
                <Text style={styles.privacyGuaranteeText}>
                  🔒 O app não pede e não armazena email, telefone, idade, localização ou senha da criança. Todos os dados ficam apenas neste aparelho. Nenhuma informação é transmitida para servidores externos.
                </Text>
              </View>
            </InfoCard>

            {/* Consentimento parental — informativo enquanto não houver recurso sensível */}
            {PARENTAL_CONSENT_FLOW_ENABLED ? (
              <InfoCard style={{ marginTop: 8 }}>
                <Text style={[styles.bodyText, { fontWeight: '700', color: pt.text, marginBottom: 10 }]}>
                  Consentimento parental
                </Text>
                <Text style={[styles.bodyText, { marginBottom: 12 }]}>
                  Registre seu consentimento como responsável pelo uso deste app pela criança. Fica salvo apenas neste aparelho.
                </Text>
                <View style={styles.consentStatusRow}>
                  <Text style={styles.consentStatusText}>
                    {consent.accepted ? '✅ Consentimento registrado' : '⏳ Consentimento ainda não registrado'}
                  </Text>
                  {consent.acceptedAt ? (
                    <Text style={styles.consentDate}>
                      Em: {new Date(consent.acceptedAt).toLocaleDateString('pt-BR')}
                    </Text>
                  ) : null}
                </View>
                {!consent.accepted && (
                  <SoundButton style={styles.consentAcceptBtn} onPress={handleAcceptConsent} activeOpacity={0.85}>
                    <Text style={styles.consentAcceptBtnText}>Registrar consentimento</Text>
                  </SoundButton>
                )}
                {consent.accepted && (
                  <SoundButton style={styles.consentRevokeBtn} onPress={handleRevokeConsent} activeOpacity={0.85}>
                    <Text style={styles.consentRevokeBtnText}>Revogar consentimento</Text>
                  </SoundButton>
                )}
              </InfoCard>
            ) : (
              <InfoCard style={{ marginTop: 8 }}>
                <Text style={[styles.bodyText, { fontWeight: '700', color: pt.text, marginBottom: 8 }]}>
                  Consentimento
                </Text>
                <Text style={styles.bodyText}>
                  Quando houver recursos de compartilhamento ou envio externo, o responsável será avisado antes. Por enquanto, tudo funciona só com dados locais neste aparelho.
                </Text>
              </InfoCard>
            )}
          </AccordionSection>

          {/* ─── 5. GERENCIAR DADOS ───────────────────────────────────────────── */}
          <AccordionSection
            title="Gerenciar dados"
            hint="Limpar progresso ou apagar dados — com confirmação."
          >
            <InfoCard style={styles.resetCard}>
              <Text style={[styles.bodyText, { fontWeight: '700', color: '#C62828', marginBottom: 8 }]}>
                🗑️ Limpar progresso da criança
              </Text>
              {resetStep === 'done' ? (
                <View style={styles.resetDoneBox}>
                  <Text style={styles.resetDoneTitle}>✅ Progresso apagado</Text>
                  <Text style={styles.resetDoneDesc}>
                    A jornada pode começar de novo. O perfil e todos os desenhos e artes (do Ateliê e das histórias coloridas) foram preservados.
                  </Text>
                  <SoundButton style={styles.resetCancelBtn} onPress={() => setResetStep('idle')} activeOpacity={0.85}>
                    <Text style={styles.resetCancelBtnText}>Fechar</Text>
                  </SoundButton>
                </View>
              ) : resetStep === 'confirm2' ? (
                <View>
                  <Text style={styles.resetWarningTitle}>⚠️ Esta ação não pode ser desfeita</Text>
                  <Text style={styles.bodyText}>
                    Será apagado o progresso da jornada: estrelas e cenas concluídas, quiz, reflexão, Livrinho, conquistas vistas, o que já foi visto no Baú, o Cultinho e os Momentos com Beni. As pinturas e artes da criança NÃO são apagadas.
                  </Text>
                  <Text style={[styles.bodyText, { marginTop: 10, fontWeight: '700', color: pt.text }]}>
                    Digite APAGAR para confirmar:
                  </Text>
                  <TextInput
                    style={styles.resetInput}
                    value={resetConfirmText}
                    onChangeText={setResetConfirmText}
                    placeholder="APAGAR"
                    placeholderTextColor={pt.muted}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  <View style={styles.resetBtnRow}>
                    <SoundButton style={styles.resetCancelBtn} onPress={() => { setResetStep('idle'); setResetConfirmText(''); }} activeOpacity={0.85}>
                      <Text style={styles.resetCancelBtnText}>Cancelar</Text>
                    </SoundButton>
                    <SoundButton
                      style={[styles.resetConfirmBtn, resetConfirmText.trim() !== 'APAGAR' && styles.resetConfirmBtnDisabled]}
                      onPress={handleExecuteReset}
                      disabled={resetConfirmText.trim() !== 'APAGAR' || resetLoading}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.resetConfirmBtnText}>
                        {resetLoading ? 'Apagando...' : 'Apagar definitivamente'}
                      </Text>
                    </SoundButton>
                  </View>
                </View>
              ) : resetStep === 'confirm1' ? (
                <View>
                  <Text style={styles.resetWarningTitle}>⚠️ Confirmar reset</Text>
                  <Text style={styles.bodyText}>
                    Isso vai apagar o progresso da jornada da criança neste aparelho. Perfil, nome, e todos os desenhos e artes (do Ateliê e das histórias coloridas) não serão afetados.
                  </Text>
                  <View style={styles.resetBtnRow}>
                    <SoundButton style={styles.resetCancelBtn} onPress={() => setResetStep('idle')} activeOpacity={0.85}>
                      <Text style={styles.resetCancelBtnText}>Cancelar</Text>
                    </SoundButton>
                    <SoundButton style={styles.resetNextBtn} onPress={() => setResetStep('confirm2')} activeOpacity={0.85}>
                      <Text style={styles.resetNextBtnText}>Continuar →</Text>
                    </SoundButton>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.bodyText}>
                    Use esta opção apenas se quiser que a criança recomece a jornada do zero neste aparelho.
                  </Text>
                  <SoundButton style={styles.resetStartBtn} onPress={() => setResetStep('confirm1')} activeOpacity={0.85}>
                    <Text style={styles.resetStartBtnText}>🗑️ Apagar progresso</Text>
                  </SoundButton>
                </View>
              )}

              <View style={styles.deleteAllBox}>
                <Text style={styles.deleteAllTitle}>Apagar todos os dados locais</Text>
                <Text style={styles.deleteAllDesc}>
                  Esta opção apagará também o perfil, os desenhos e as configurações. Estará disponível em uma atualização futura, com confirmação adicional de segurança.
                </Text>
                <View style={[styles.comingSoonBadge, { alignSelf: 'flex-start' }]}>
                  <Text style={styles.comingSoonBadgeText}>Em preparação</Text>
                </View>
              </View>
            </InfoCard>
          </AccordionSection>

          {/* ─── 6. SOBRE E SUPORTE ───────────────────────────────────────────── */}
          <AccordionSection
            title="Sobre e suporte"
            hint="Suporte, feedback, avaliação, privacidade em resumo e versão."
          >
            <InfoCard>
              <Text style={styles.cardHeading}>💬 Suporte e feedback</Text>
              <Text style={styles.bodyText}>
                Dúvidas, sugestões ou problemas? Entre em contato pelo email abaixo.
              </Text>
              <SoundButton style={styles.supportBtn} onPress={() => openWithGate(`mailto:${SUPPORT_EMAIL}?subject=Suporte%20Beni`)} activeOpacity={0.85}>
                <Text style={styles.supportBtnText}>✉ {SUPPORT_EMAIL}</Text>
              </SoundButton>
              <SoundButton style={[styles.supportBtn, { marginTop: 8 }]} onPress={() => openWithGate(`mailto:${SUPPORT_EMAIL}?subject=Feedback%20Beni`)} activeOpacity={0.85}>
                <Text style={styles.supportBtnText}>Enviar feedback por email</Text>
              </SoundButton>
            </InfoCard>

            <InfoCard style={{ marginTop: 8 }}>
              <Text style={styles.cardHeading}>⭐ Gostou do app?</Text>
              <Text style={styles.bodyText}>
                Quando o app estiver publicado nas lojas, você poderá avaliar e ajudar outras famílias a descobrirem!
              </Text>
              {storeUrl ? (
                <SoundButton style={[styles.supportBtn, { marginTop: 14 }]} onPress={() => Linking.openURL(storeUrl)} activeOpacity={0.85}>
                  <Text style={styles.supportBtnText}>⭐ Avaliar o app</Text>
                </SoundButton>
              ) : (
                <View style={[styles.comingSoonBadge, { marginTop: 12, alignSelf: 'flex-start' }]}>
                  <Text style={styles.comingSoonBadgeText}>Em breve, aguardando publicação nas lojas</Text>
                </View>
              )}
            </InfoCard>

            <InfoCard style={{ marginTop: 8 }}>
              <Text style={styles.cardHeading}>Privacidade em resumo</Text>
              <Text style={styles.bodyText}>
                Sem login, sem cadastro e sem coleta de dados pessoais da criança. Tudo fica apenas neste aparelho. Para dúvidas sobre privacidade, fale com a gente:
              </Text>
              <Text style={[styles.bodyText, { marginTop: 6 }]}>
                <Text style={styles.emailInline}>{SUPPORT_EMAIL}</Text>
              </Text>
            </InfoCard>

            <Text style={styles.versionText}>{productConfig.versionLabel}</Text>
          </AccordionSection>

          {/* ─── 7. FERRAMENTAS DO CRIADOR (QA) — discreta ────────────────────── */}
          {SHOW_TEST_TOOLS && (
            <AccordionSection
              title="🛠️ Ferramentas do Criador"
              hint="Apenas para desenvolvimento e testes neste aparelho."
            >
              <InfoCard style={styles.qaCard}>
                <View style={styles.qaRow}>
                  <View style={styles.qaText}>
                    <Text style={styles.qaTitle}>Modo Criador</Text>
                    <Text style={styles.qaDesc}>Desbloquear todo o conteúdo neste aparelho para testes.</Text>
                  </View>
                  <Switch
                    value={qaEnabled}
                    onValueChange={handleToggleQa}
                    trackColor={{ false: '#CBD5E1', true: pt.green }}
                    thumbColor="#FFF"
                  />
                </View>
                <Text style={styles.qaWarning}>
                  Este modo libera todo o conteúdo apenas neste aparelho para validação do app. Ele não altera o plano dos usuários reais.
                </Text>
              </InfoCard>

              <InfoCard style={[styles.qaCard, { marginTop: 8 }]}>
                {beniResetDone ? (
                  <View>
                    <Text style={styles.qaTitle}>✅ Pronto!</Text>
                    <Text style={styles.qaDesc}>
                      Na próxima abertura do app, o Beni vai guiar a entrada novamente.
                    </Text>
                    <SoundButton style={styles.qaResetDoneBtn} onPress={() => setBeniResetDone(false)} activeOpacity={0.85}>
                      <Text style={styles.qaResetDoneBtnText}>Fechar</Text>
                    </SoundButton>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.qaTitle}>Rever apresentação do Beni</Text>
                    <Text style={styles.qaDesc}>
                      Mostra novamente o onboarding na próxima abertura, sem apagar progresso.
                    </Text>
                    <SoundButton style={styles.qaResetBtn} onPress={handleResetBeniOnboarding} activeOpacity={0.85}>
                      <Text style={styles.qaResetBtnText}>Rever apresentação do Beni</Text>
                    </SoundButton>
                  </View>
                )}
              </InfoCard>

              <InfoCard style={[styles.qaCard, { marginTop: 8 }]}>
                <Text style={styles.qaTitle}>Testar Desenhos (QA)</Text>
                <Text style={styles.qaDesc}>
                  Abre todos os desenhos de colorir (inclusive de histórias bloqueadas) para validação. Não altera progresso, plano nem conquistas.
                </Text>
                <SoundButton style={styles.qaResetBtn} onPress={() => navigation.navigate('ColoringQa')} activeOpacity={0.85}>
                  <Text style={styles.qaResetBtnText}>Abrir galeria de QA</Text>
                </SoundButton>
              </InfoCard>

              <InfoCard style={[styles.qaCard, { marginTop: 8 }]}>
                <Text style={styles.qaTitle}>Rever Tour Inicial do Beni</Text>
                <Text style={styles.qaDesc}>
                  Mostra novamente o tour inicial do Beni sobre a aba Aventuras. Só visual — não altera progresso nem acesso.
                </Text>
                <SoundButton style={styles.qaResetBtn} onPress={handleReviewBeniTour} activeOpacity={0.85}>
                  <Text style={styles.qaResetBtnText}>Rever Tour Inicial do Beni</Text>
                </SoundButton>
                <SoundButton style={[styles.qaResetBtn, { marginTop: 8 }]} onPress={handleResetAllGuides} activeOpacity={0.85}>
                  <Text style={styles.qaResetBtnText}>Resetar Guias do Beni</Text>
                </SoundButton>
              </InfoCard>

              <InfoCard style={[styles.qaCard, { marginTop: 8 }]}>
                <Text style={styles.qaTitle}>Build info</Text>
                <Text style={styles.qaDesc}>{productConfig.versionLabel}</Text>
                <Text style={[styles.qaDesc, { marginTop: 4 }]}>Modo QA ativo neste aparelho.</Text>
              </InfoCard>
            </AccordionSection>
          )}

          {/* ─── 8. MODO IGREJA — discreta, fechada, no fim ───────────────────── */}
          <AccordionSection
            title="⛪ Modo Igreja"
            hint="Recurso em preparação para turmas, professores e encontros infantis."
          >
            <InfoCard>
              <Text style={[styles.bodyText, { marginBottom: 12 }]}>
                Recurso em preparação para turmas, professores e encontros infantis. Use para organizar uma turma local, acompanhar uma história da semana e orientar as famílias em casa. Tudo fica salvo apenas neste aparelho — sem internet obrigatória, sem login.
              </Text>

              {/* Como funciona — 3 passos */}
              <View style={styles.churchStepsBox}>
                {[
                  { n: '1', t: 'Crie uma turma local' },
                  { n: '2', t: 'Escolha a História da Semana' },
                  { n: '3', t: 'Compartilhe uma orientação com as famílias' },
                ].map(step => (
                  <View key={step.n} style={styles.churchStepRow}>
                    <View style={styles.churchStepNum}><Text style={styles.churchStepNumText}>{step.n}</Text></View>
                    <Text style={styles.churchStepText}>{step.t}</Text>
                  </View>
                ))}
              </View>

              <BeniSpeechCard context="churchMode" variant="adult" style={{ marginBottom: 12 }} />

              {churchGroups.length === 0 && !showChurchForm && (
                <View style={styles.churchEmptyBox}>
                  <Text style={styles.churchEmptyText}>
                    Você ainda não tem turmas. Crie a primeira para começar a acompanhar uma história da semana com o grupo.
                  </Text>
                  <SoundButton style={styles.churchCreateBtn} onPress={() => setShowChurchForm(true)} activeOpacity={0.85}>
                    <Text style={styles.churchCreateBtnText}>+ Criar turma</Text>
                  </SoundButton>
                </View>
              )}

              {churchGroups.length > 0 && !showChurchForm && (
                <View style={styles.churchGroupsList}>
                  {churchGroups.map(group => (
                    <View key={group.id} style={styles.churchGroupCard}>
                      <Text style={styles.churchGroupName}>{group.name || 'Turma sem nome'}</Text>
                      {group.churchName ? (
                        <Text style={styles.churchGroupChurch}>{group.churchName}</Text>
                      ) : null}
                      {group.leaderName ? (
                        <Text style={styles.churchGroupLeader}>Líder: {group.leaderName}</Text>
                      ) : null}
                      {group.ageGroup ? (
                        <Text style={styles.churchGroupLeader}>Faixa/grupo: {group.ageGroup}</Text>
                      ) : null}
                      <Text style={styles.churchGroupWeekly}>
                        História da semana: {group.weeklyStory?.trim() || 'a definir'}
                      </Text>
                      <View style={styles.churchInviteRow}>
                        <Text style={styles.churchInviteLabel}>Código da turma:</Text>
                        <Text style={styles.churchInviteCode}>{group.inviteCode}</Text>
                      </View>
                      <Text style={styles.churchProgressNote}>
                        Progresso local da turma: começa zerado e cresce conforme as crianças avançam.
                      </Text>
                      <SoundButton style={styles.churchShareBtn} onPress={() => handleShareChurchGuidance(group)} activeOpacity={0.85}>
                        <Text style={styles.churchShareBtnText}>Compartilhar orientação</Text>
                      </SoundButton>
                      <SoundButton style={styles.churchDeleteBtn} onPress={() => handleDeleteChurchGroup(group.id)} activeOpacity={0.85}>
                        <Text style={styles.churchDeleteBtnText}>Apagar turma</Text>
                      </SoundButton>
                    </View>
                  ))}
                  <SoundButton style={[styles.churchCreateBtn, { marginTop: 8 }]} onPress={() => setShowChurchForm(true)} activeOpacity={0.85}>
                    <Text style={styles.churchCreateBtnText}>+ Nova turma</Text>
                  </SoundButton>
                </View>
              )}

              {showChurchForm && (
                <View style={styles.churchForm}>
                  <Text style={[styles.bodyText, { fontWeight: '700', marginBottom: 12 }]}>Nova turma</Text>
                  <TextInput
                    style={styles.churchInput}
                    placeholder="Nome da turma *"
                    placeholderTextColor={pt.muted}
                    value={churchForm.name}
                    onChangeText={v => setChurchForm(f => ({ ...f, name: v }))}
                    maxLength={60}
                  />
                  <TextInput
                    style={styles.churchInput}
                    placeholder="Nome do líder ou professor"
                    placeholderTextColor={pt.muted}
                    value={churchForm.leaderName}
                    onChangeText={v => setChurchForm(f => ({ ...f, leaderName: v }))}
                    maxLength={60}
                  />
                  <TextInput
                    style={styles.churchInput}
                    placeholder="Faixa ou grupo (ex.: 4 a 6 anos)"
                    placeholderTextColor={pt.muted}
                    value={churchForm.ageGroup}
                    onChangeText={v => setChurchForm(f => ({ ...f, ageGroup: v }))}
                    maxLength={40}
                  />
                  <TextInput
                    style={styles.churchInput}
                    placeholder="História da semana (opcional)"
                    placeholderTextColor={pt.muted}
                    value={churchForm.weeklyStory}
                    onChangeText={v => setChurchForm(f => ({ ...f, weeklyStory: v }))}
                    maxLength={60}
                  />
                  <View style={styles.resetBtnRow}>
                    <SoundButton
                      style={styles.resetCancelBtn}
                      onPress={() => { setShowChurchForm(false); setChurchForm({ name: '', leaderName: '', ageGroup: '', weeklyStory: '' }); }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.resetCancelBtnText}>Cancelar</Text>
                    </SoundButton>
                    <SoundButton
                      style={[styles.resetNextBtn, churchSaving && { opacity: 0.6 }]}
                      onPress={handleCreateChurchGroup}
                      disabled={churchSaving}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.resetNextBtnText}>{churchSaving ? 'Criando...' : 'Criar turma'}</Text>
                    </SoundButton>
                  </View>
                </View>
              )}
            </InfoCard>
          </AccordionSection>

        </View>
      </ScrollView>

      {/* UX 2.2 — Guia da Área dos Pais (tom para responsáveis; só após o gate). */}
      {parentGuide.visible && (
        <BeniGuideOverlay steps={parentGuideSteps} finalLabel="Entendi" onFinish={parentGuide.close} onSkip={parentGuide.close} />
      )}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  content: {},

  // Topo compacto (substitui o banner roxo gigante)
  welcomeCard: {
    backgroundColor: '#EAF4FF',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#CFE6FB',
    padding: 16,
  },
  welcomeTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 4 },
  welcomeSub: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19 },

  // Seções recolhíveis (accordion)
  accordion: {
    marginTop: 12, backgroundColor: '#FFF', borderRadius: radii.lg,
    borderWidth: 1, borderColor: pt.border, overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  accordionTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 16, color: pt.text },
  accordionChevron: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, marginLeft: 10 },
  accordionHint: {
    fontFamily: 'Nunito', fontSize: 12.5, color: pt.textSoft,
    paddingHorizontal: 16, paddingBottom: 14, marginTop: -4, lineHeight: 18,
  },
  accordionBody: { paddingHorizontal: 12, paddingBottom: 12, gap: 0 },

  cardHeading: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 8 },
  detailsLink: { alignSelf: 'flex-start', marginTop: 12, paddingVertical: 4 },
  detailsLinkText: { fontFamily: 'Nunito', fontSize: 13, color: '#5B21B6', fontWeight: '700' },

  privacySummaryCard: { backgroundColor: '#F0FAF4', borderWidth: 1, borderColor: '#BDE5CC' },
  planPrepCard: { borderWidth: 1, borderColor: pt.border, backgroundColor: '#FFFDF6' },

  churchGroupWeekly: { fontFamily: 'Nunito', fontSize: 13, color: pt.text, fontWeight: '700', marginTop: 4 },
  churchShareBtn: {
    marginTop: 10, backgroundColor: '#EDE9FE', borderRadius: radii.pill,
    paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: '#C4B5FD',
  },
  churchShareBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#5B21B6' },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerEmoji: { fontSize: 32, marginBottom: 4 },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 19, color: '#fff', marginBottom: 4 },
  headerSub: { fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  // Próximo passo recomendado
  nextStepCard: { marginTop: 8, borderLeftWidth: 4, borderLeftColor: pt.primary ?? '#7C3AED' },
  nextStepLabel: {
    fontFamily: 'FredokaOne', fontSize: 12, color: pt.muted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  nextStepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextStepEmoji: { fontSize: 30 },
  nextStepTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 2 },
  nextStepDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 18 },

  // Modo Igreja — 3 passos
  churchStepsBox: { gap: 8, marginBottom: 12 },
  churchStepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  churchStepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#EDE7F6',
    justifyContent: 'center', alignItems: 'center',
  },
  churchStepNumText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#7C3AED' },
  churchStepText: { flex: 1, fontFamily: 'Nunito', fontSize: 13, color: pt.text, fontWeight: '700' },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  bodyTablet: { paddingHorizontal: 48 },

  sectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 17, color: pt.text,
    marginTop: 20, marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#fff', borderRadius: radii.lg,
    padding: 16, ...shadows.card, marginBottom: 4,
  },
  freeCard: { backgroundColor: '#F0FAF0', borderWidth: 1, borderColor: '#A5D6A7' },
  premiumCard: { backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: '#F4B400' },
  paywallCard: { borderWidth: 2, borderColor: '#F4B400', backgroundColor: '#FFFBF0' },
  qaCard: { borderWidth: 1.5, borderColor: '#94A3B8', backgroundColor: '#F1F5F9' },
  comingSoonCard: { borderWidth: 1, borderColor: pt.border, backgroundColor: '#F8F8F8' },
  resetCard: { borderWidth: 1.5, borderColor: '#FFCDD2', backgroundColor: '#FFF8F8' },

  // Visão geral da criança
  childProfileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  childAvatarEmoji: { fontSize: 36 },
  childProfileInfo: { flex: 1 },
  childName: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text },
  childSubtitle: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, marginTop: 2 },
  metricsGrid: { gap: 8 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metricCard: {
    flex: 1, backgroundColor: '#F5F3FF', borderRadius: radii.md,
    paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 3,
  },
  metricEmoji: { fontSize: 20 },
  metricValue: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.text },
  metricLabel: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, textAlign: 'center' },

  // Privacidade
  privacyGuaranteeBox: {
    backgroundColor: '#F0FFF4', borderRadius: radii.md,
    borderWidth: 1, borderColor: '#A5D6A7', padding: 12, marginTop: 12,
  },
  privacyGuaranteeText: { fontFamily: 'Nunito', fontSize: 13, color: '#2E7D32', lineHeight: 20 },
  consentStatusRow: { marginBottom: 12 },
  consentStatusText: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  consentDate: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 2 },
  consentAcceptBtn: {
    backgroundColor: '#7C3AED', borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
  },
  consentAcceptBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  consentRevokeBtn: {
    backgroundColor: pt.border, borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
  },
  consentRevokeBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  deleteAllBox: {
    marginTop: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#FFCDD2',
  },
  deleteAllTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: '#9E9E9E', marginBottom: 6 },
  deleteAllDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.muted, lineHeight: 19, marginBottom: 10 },

  // Configurações (toggle rows)
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: pt.border,
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  toggleDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 2, lineHeight: 17 },

  // Plano
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planEmoji: { fontSize: 32, marginRight: 12 },
  planInfo: { flex: 1 },
  planName: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 2 },
  planDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 18 },
  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  featureLabel: { fontFamily: 'Nunito', fontSize: 14, color: pt.text, flex: 1, fontWeight: '600' },
  paywallHeadline: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 14, lineHeight: 22 },
  pricingRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 4 },
  pricingRowTablet: {},
  pricingCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: radii.md,
    borderWidth: 1.5, borderColor: pt.border,
    paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', gap: 6,
  },
  pricingLabel: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  comingSoonBadge: { backgroundColor: pt.border, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 },
  comingSoonBadgeText: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, fontWeight: '700' },
  activateBtn: {
    marginTop: 14, backgroundColor: pt.border, borderRadius: radii.pill,
    paddingVertical: 14, alignItems: 'center', opacity: 0.65,
  },
  activateBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.muted },
  activateNote: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
  restoreRow: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: pt.border },
  restoreLabel: { fontFamily: 'Nunito', fontSize: 14, color: pt.muted, fontWeight: '700', marginBottom: 2 },
  restoreNote: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, fontStyle: 'italic', marginBottom: 8 },
  restoreBtn: {
    marginTop: 6, paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: radii.pill, borderWidth: 1.5, borderColor: pt.border,
    alignSelf: 'flex-start', backgroundColor: pt.background,
  },
  restoreBtnLoading: { opacity: 0.6 },
  restoreBtnText: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, fontWeight: '700' },
  comingSoonFootnote: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, lineHeight: 17, marginTop: 12, fontStyle: 'italic' },

  // Modo Igreja
  churchEmptyBox: { alignItems: 'center', paddingVertical: 12 },
  churchEmptyText: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, marginBottom: 12 },
  churchCreateBtn: {
    backgroundColor: '#7C3AED', borderRadius: radii.pill,
    paddingVertical: 12, paddingHorizontal: 24,
    alignItems: 'center', alignSelf: 'center',
  },
  churchCreateBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  churchGroupsList: { gap: 12 },
  churchGroupCard: {
    backgroundColor: '#F5F3FF', borderRadius: radii.md,
    borderWidth: 1, borderColor: '#C4B5FD', padding: 14, gap: 4,
  },
  churchGroupName: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  churchGroupChurch: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft },
  churchGroupLeader: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft },
  churchInviteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  churchInviteLabel: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft },
  churchInviteCode: {
    fontFamily: 'FredokaOne', fontSize: 16, color: '#7C3AED',
    backgroundColor: '#EDE9FE', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, letterSpacing: 2,
  },
  churchProgressNote: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, fontStyle: 'italic', marginTop: 4 },
  churchDeleteBtn: {
    marginTop: 8, backgroundColor: '#FFCDD2', borderRadius: radii.pill,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#EF9A9A',
  },
  churchDeleteBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#C62828' },
  churchForm: { marginTop: 12, gap: 10 },
  churchInput: {
    backgroundColor: '#FFF', borderRadius: radii.md,
    borderWidth: 1.5, borderColor: pt.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: 'Nunito', fontSize: 15, color: pt.text,
  },

  // QA
  qaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  qaText: { flex: 1 },
  qaTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  qaDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, marginTop: 2, lineHeight: 18 },
  qaWarning: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, marginTop: 10, lineHeight: 17, fontStyle: 'italic' },
  qaResetBtn: {
    marginTop: 10, backgroundColor: '#E0E7FF', borderRadius: radii.pill,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#A5B4FC',
  },
  qaResetBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#3730A3' },
  qaResetDoneBtn: { marginTop: 10, backgroundColor: pt.border, borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center' },
  qaResetDoneBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },

  // Progresso
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  progressStar: { fontSize: 32 },
  progressValue: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  progressNote: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft },
  // ── Story toggle (collapsible) ───────────────────────────────────────────────
  storyToggleRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 4,
  },
  storyToggleTitle: {
    fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.text, lineHeight: 18,
  },
  storyToggleSub: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 2,
  },
  storyToggleChevron: {
    fontFamily: 'Nunito', fontSize: 16, color: pt.textSoft, marginLeft: 12, paddingTop: 2,
  },
  storyToggleShowBtn: {
    marginTop: 14, borderRadius: radii.pill, paddingVertical: 10, paddingHorizontal: 20,
    backgroundColor: '#EDE9FE', alignSelf: 'flex-start',
  },
  storyToggleShowBtnText: {
    fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: '#5B21B6',
  },
  storyToggleHideBtn: {
    marginTop: 12, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: radii.pill, backgroundColor: '#F1F5F9',
  },
  storyToggleHideBtnText: {
    fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft,
  },
  storyProgressRow: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: pt.border },
  storyProgressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  storyProgressEmoji: { fontSize: 24, marginRight: 10 },
  storyProgressInfo: { flex: 1 },
  storyProgressTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  storyProgressPlan: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, marginTop: 1 },
  storyProgressPct: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  storyProgressBar: { height: 6, backgroundColor: pt.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  storyProgressFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 3 },
  storyProgressDetail: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, fontWeight: '700' },

  // Security
  securityRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  securityDot: { fontFamily: 'Nunito', fontSize: 16, color: pt.textSoft, lineHeight: 21, width: 10 },
  securityText: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 20, flex: 1 },

  // Suporte
  supportBtn: {
    marginTop: 12, borderWidth: 1.5, borderColor: pt.primary,
    borderRadius: radii.pill, paddingVertical: 11, alignItems: 'center',
  },
  supportBtnText: { fontFamily: 'Nunito', fontSize: 14, color: pt.primary, fontWeight: '700' },

  // Reset
  resetWarningTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: '#C62828', marginBottom: 10 },
  resetBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  resetCancelBtn: { flex: 1, backgroundColor: pt.border, borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center' },
  resetCancelBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  resetNextBtn: { flex: 1, backgroundColor: '#FF8A80', borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center' },
  resetNextBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  resetInput: {
    marginTop: 10, backgroundColor: '#FFF', borderRadius: radii.md,
    borderWidth: 2, borderColor: '#EF9A9A',
    paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: 'FredokaOne', fontSize: 16, color: '#C62828', letterSpacing: 2,
  },
  resetConfirmBtn: { flex: 1, backgroundColor: '#C62828', borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center' },
  resetConfirmBtnDisabled: { backgroundColor: pt.border },
  resetConfirmBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },
  resetStartBtn: {
    marginTop: 12, backgroundColor: '#FFCDD2', borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#EF9A9A',
  },
  resetStartBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#C62828' },
  resetDoneBox: { alignItems: 'center' },
  resetDoneTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: '#2E7D32', marginBottom: 10 },
  resetDoneDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', lineHeight: 19, marginBottom: 16 },

  // Textos
  bodyText: { fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, lineHeight: 21 },
  bold: { fontWeight: '700', color: pt.text },
  emailInline: { fontFamily: 'Nunito', fontSize: 14, color: pt.primary, fontWeight: '700' },
  versionText: { fontFamily: 'Nunito', fontSize: 12, color: pt.muted, textAlign: 'center', marginTop: 24, marginBottom: 8 },

  // Gate
  gateWrapper: { flex: 1 },
  gateBg: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  gateBgEmoji: { fontSize: 56, marginBottom: 16 },
  gateBgTitle: { fontFamily: 'FredokaOne', fontSize: 26, color: '#FFF', marginBottom: 10 },
  gateBgSub: { fontFamily: 'Nunito', fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },
});
