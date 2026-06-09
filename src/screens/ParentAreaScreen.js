import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Linking, TextInput, Alert, Switch,
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

const SUPPORT_EMAIL = productConfig.supportEmail;

// ── Componentes internos ──────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
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

  // Reset de progresso
  const [resetStep, setResetStep] = useState('idle');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Restore purchase
  const [restoreState, setRestoreState] = useState('idle');

  // Expansão do progresso por história (recolhido por padrão)
  const [storyProgressExpanded, setStoryProgressExpanded] = useState(false);

  // Configurações dos pais + consentimento
  const [parentSettings, setParentSettings] = useState({
    sundayStoryReminderEnabled: false,
    familyReminderEnabled: false,
    allowShareCards: false,
    allowProgressReports: true,
    allowChurchMode: false,
  });
  const [consent, setConsent] = useState({ accepted: false, acceptedAt: null });

  // Modo Igreja
  const [churchGroups, setChurchGroups] = useState([]);
  const [showChurchForm, setShowChurchForm] = useState(false);
  const [churchForm, setChurchForm] = useState({ name: '', leaderName: '', churchName: '' });
  const [churchSaving, setChurchSaving] = useState(false);

  useEffect(() => {
    if (!unlockedForSession) return;
    loadParentData();
  }, [unlockedForSession]);

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
        churchName: churchForm.churchName.trim(),
      });
      setChurchGroups(prev => [...prev, group]);
      setChurchForm({ name: '', leaderName: '', churchName: '' });
      setShowChurchForm(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a turma. Tente novamente.');
    } finally {
      setChurchSaving(false);
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
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 48 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <Text style={styles.headerEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.headerTitle}>Área dos Pais</Text>
          <Text style={styles.headerSub}>
            Central do responsável — progresso, privacidade e configurações da família.
          </Text>
        </LinearGradient>

        <View style={[styles.body, isTablet && styles.bodyTablet]}>

          {/* ─── 1. VISÃO GERAL DA CRIANÇA ─────────────────────────────────────── */}
          <SectionTitle>👶 Visão geral da criança</SectionTitle>
          <InfoCard>
            <View style={styles.childProfileRow}>
              <Text style={styles.childAvatarEmoji}>{childAvatarEmoji}</Text>
              <View style={styles.childProfileInfo}>
                <Text style={styles.childName}>{childDisplayName}</Text>
                <Text style={styles.childSubtitle}>Explorador(a) das histórias</Text>
              </View>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricsRow}>
                <MetricCard emoji="⭐" value={progressSummary?.totalStars ?? 0} label="Estrelas" />
                <MetricCard emoji="📖" value={startedStoriesCount} label="Iniciadas" />
                <MetricCard emoji="🏆" value={progressSummary?.completedStories ?? 0} label="Concluídas" />
              </View>
              <View style={styles.metricsRow}>
                <MetricCard emoji="🧩" value={progressSummary?.quizCompletedCount ?? 0} label="Quiz" />
                <MetricCard emoji="📚" value={progressSummary?.storyBookOpenedCount ?? 0} label="Livrinho" />
                <MetricCard emoji="🎨" value={progressSummary?.completedScenes ?? 0} label="Cenas" />
              </View>
            </View>
            <Text style={[styles.bodyText, { marginTop: 12, fontStyle: 'italic', color: pt.muted }]}>
              Este resumo é salvo apenas neste aparelho.
            </Text>
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

          {/* Dica do Beni (tom adulto) */}
          <BeniSpeechCard context="parentArea" variant="adult" style={{ marginTop: 8 }} />

          {/* ─── 2. PROGRESSO E CONQUISTAS ────────────────────────────────────── */}
          <SectionTitle>📊 Progresso e conquistas</SectionTitle>
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

          {/* ─── 3. PROGRESSO POR HISTÓRIA (recolhido por padrão) ────────────── */}
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

          {/* ─── 4. CONFIGURAÇÕES DA FAMÍLIA ─────────────────────────────────── */}
          <SectionTitle>⚙️ Configurações da família</SectionTitle>
          <InfoCard>
            <Text style={[styles.bodyText, { marginBottom: 14 }]}>
              Preferências salvas localmente. Recursos de lembrete serão ativados em sprint futuro — salvar já registra sua preferência.
            </Text>
            <ToggleRow
              label="Lembrete da história do domingo"
              description="Notificação de domingo para abrir uma história em família. (Em breve)"
              value={parentSettings.sundayStoryReminderEnabled}
              onValueChange={v => handleToggleSetting('sundayStoryReminderEnabled', v)}
            />
            <ToggleRow
              label="Lembrete para fazer em família"
              description="Notificação para experiência em família durante a semana. (Em breve)"
              value={parentSettings.familyReminderEnabled}
              onValueChange={v => handleToggleSetting('familyReminderEnabled', v)}
            />
            <ToggleRow
              label="Permitir cards compartilháveis"
              description="Permite que a criança compartilhe conquistas como imagem."
              value={parentSettings.allowShareCards}
              onValueChange={v => handleToggleSetting('allowShareCards', v)}
            />
            <ToggleRow
              label="Permitir relatórios semanais"
              description="Resumo semanal de progresso enviado por notificação. (Em breve)"
              value={parentSettings.allowProgressReports}
              onValueChange={v => handleToggleSetting('allowProgressReports', v)}
            />
            <ToggleRow
              label="Habilitar Modo Igreja"
              description="Permite criar e gerenciar uma turma local na seção abaixo."
              value={parentSettings.allowChurchMode}
              onValueChange={v => handleToggleSetting('allowChurchMode', v)}
            />
          </InfoCard>

          {/* ─── 5. DADOS E PRIVACIDADE ───────────────────────────────────────── */}
          <SectionTitle>🔒 Dados e privacidade</SectionTitle>
          <InfoCard>
            <Text style={[styles.bodyText, { fontWeight: '700', color: pt.text, marginBottom: 10 }]}>
              O que fica salvo localmente
            </Text>
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

          <InfoCard style={[styles.resetCard, { marginTop: 8 }]}>
            <Text style={[styles.bodyText, { fontWeight: '700', color: '#C62828', marginBottom: 8 }]}>
              🗑️ Limpar progresso da criança
            </Text>
            {resetStep === 'done' ? (
              <View style={styles.resetDoneBox}>
                <Text style={styles.resetDoneTitle}>✅ Progresso apagado</Text>
                <Text style={styles.resetDoneDesc}>
                  A jornada pode começar de novo. O perfil, os desenhos do Ateliê e as artes salvas foram preservados.
                </Text>
                <SoundButton style={styles.resetCancelBtn} onPress={() => setResetStep('idle')} activeOpacity={0.85}>
                  <Text style={styles.resetCancelBtnText}>Fechar</Text>
                </SoundButton>
              </View>
            ) : resetStep === 'confirm2' ? (
              <View>
                <Text style={styles.resetWarningTitle}>⚠️ Esta ação não pode ser desfeita</Text>
                <Text style={styles.bodyText}>
                  Serão apagados: cenas coloridas, quiz, reflexão, livrinho, conquistas vistas e estrelas bônus.
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
                  Isso vai apagar todo o progresso da criança neste aparelho. Perfil, nome, desenhos do Ateliê e artes salvas não serão afetados.
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

          {/* ─── 6. PLANO E ACESSO ─────────────────────────────────────────────── */}
          <SectionTitle>💎 Plano e acesso</SectionTitle>
          <InfoCard style={isPremium ? styles.premiumCard : styles.freeCard}>
            <View style={styles.planRow}>
              <Text style={styles.planEmoji}>{isPremium ? '💎' : '✨'}</Text>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{isPremium ? 'Plano Família' : 'Gratuito'}</Text>
                <Text style={styles.planDesc}>
                  {isPremium
                    ? 'Acesso completo a todas as histórias, Beni e Ateliê ilimitado.'
                    : 'Acesso às histórias gratuitas, quiz e 3 artes no Ateliê.'}
                </Text>
              </View>
            </View>
          </InfoCard>

          <InfoCard style={{ marginTop: 8 }}>
            <Text style={[styles.bodyText, { fontWeight: '700', color: pt.text, marginBottom: 10 }]}>
              ✨ Incluído gratuitamente
            </Text>
            <View style={styles.featureList}>
              {FREE_PLAN.items.map((item, idx) => (
                <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
              ))}
            </View>
          </InfoCard>

          <InfoCard style={[styles.paywallCard, { marginTop: 8 }]}>
            <Text style={styles.paywallHeadline}>
              Desbloqueie a experiência completa para sua família.
            </Text>
            <View style={styles.featureList}>
              {PREMIUM_PLAN.items.map((item, idx) => (
                <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
              ))}
            </View>
            <View style={[styles.pricingRow, isTablet && styles.pricingRowTablet]}>
              {Object.values(PLAN_PRICING).map((plan) => (
                <View key={plan.id} style={styles.pricingCard}>
                  <Text style={styles.pricingLabel}>{plan.label}</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonBadgeText}>Em breve</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.activateBtn}>
              <Text style={styles.activateBtnText}>Disponível em breve para famílias</Text>
            </View>
            <Text style={styles.activateNote}>
              Preferência salva para quando o Plano Família for ativado nesta família.
            </Text>
            <View style={styles.restoreRow}>
              <Text style={styles.restoreLabel}>🔄 Restaurar compra</Text>
              {restoreState === 'unavailable' ? (
                <Text style={styles.restoreNote}>
                  As compras ainda não estão disponíveis nesta versão de teste. A restauração será habilitada quando as compras forem lançadas.
                </Text>
              ) : (
                <>
                  <Text style={styles.restoreNote}>
                    Já tem o Plano Família? Toque abaixo para restaurar o acesso.
                  </Text>
                  <SoundButton
                    style={[styles.restoreBtn, restoreState === 'loading' && styles.restoreBtnLoading]}
                    onPress={restoreState === 'idle' ? handleRestorePurchase : undefined}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.restoreBtnText}>
                      {restoreState === 'loading' ? 'Verificando...' : 'Restaurar compra'}
                    </Text>
                  </SoundButton>
                </>
              )}
            </View>
          </InfoCard>

          <InfoCard style={[styles.comingSoonCard, { marginTop: 8 }]}>
            <Text style={[styles.bodyText, { fontWeight: '700', color: pt.text, marginBottom: 10 }]}>
              🚀 Chegando em futuras versões
            </Text>
            <View style={styles.featureList}>
              {PREMIUM_PLAN.comingSoonItems.map((item, idx) => (
                <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
              ))}
            </View>
            <Text style={styles.comingSoonFootnote}>
              Funcionalidades em desenvolvimento, disponíveis em atualizações futuras.
            </Text>
          </InfoCard>

          {/* ─── 6. MODO IGREJA ──────────────────────────────────────────────── */}
          <SectionTitle>⛪ Modo Igreja</SectionTitle>
          <InfoCard>
            <Text style={[styles.bodyText, { marginBottom: 12 }]}>
              Use este modo para organizar uma turma da igreja, acompanhar uma história da semana e orientar as famílias em casa. Tudo fica salvo apenas neste aparelho — sem internet obrigatória, sem login.
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
                    <View style={styles.churchInviteRow}>
                      <Text style={styles.churchInviteLabel}>Código da turma:</Text>
                      <Text style={styles.churchInviteCode}>{group.inviteCode}</Text>
                    </View>
                    <Text style={styles.churchProgressNote}>
                      Progresso agregado de múltiplas crianças disponível em sprint futuro.
                    </Text>
                    <SoundButton style={styles.churchDeleteBtn} onPress={() => handleDeleteChurchGroup(group.id)} activeOpacity={0.85}>
                      <Text style={styles.churchDeleteBtnText}>Excluir turma</Text>
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
                  placeholder="Nome do líder"
                  placeholderTextColor={pt.muted}
                  value={churchForm.leaderName}
                  onChangeText={v => setChurchForm(f => ({ ...f, leaderName: v }))}
                  maxLength={60}
                />
                <TextInput
                  style={styles.churchInput}
                  placeholder="Nome da igreja"
                  placeholderTextColor={pt.muted}
                  value={churchForm.churchName}
                  onChangeText={v => setChurchForm(f => ({ ...f, churchName: v }))}
                  maxLength={80}
                />
                <View style={styles.resetBtnRow}>
                  <SoundButton
                    style={styles.resetCancelBtn}
                    onPress={() => { setShowChurchForm(false); setChurchForm({ name: '', leaderName: '', churchName: '' }); }}
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

          {/* ─── 7. FERRAMENTAS DO CRIADOR (QA) ──────────────────────────────── */}
          {qaAllowed && (
            <>
              <SectionTitle>🛠️ Ferramentas do Criador</SectionTitle>
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

              <InfoCard style={styles.qaCard}>
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

              <InfoCard style={styles.qaCard}>
                <Text style={styles.qaTitle}>Build info</Text>
                <Text style={styles.qaDesc}>{productConfig.versionLabel}</Text>
                <Text style={[styles.qaDesc, { marginTop: 4 }]}>Modo QA ativo neste aparelho.</Text>
              </InfoCard>
            </>
          )}

          {/* ─── Suporte, avaliação e versão ─────────────────────────────────── */}
          <SectionTitle>💬 Suporte e feedback</SectionTitle>
          <InfoCard>
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

          <SectionTitle>⭐ Gostou do app?</SectionTitle>
          <InfoCard>
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
            <Text style={styles.bodyText}>
              Nossa política de privacidade estará disponível no site oficial em breve.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 8 }]}>
              Privacidade: <Text style={styles.emailInline}>{SUPPORT_EMAIL}</Text>
            </Text>
          </InfoCard>

          <Text style={styles.versionText}>{productConfig.versionLabel}</Text>

        </View>
      </ScrollView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  content: {},
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
  childAvatarEmoji: { fontSize: 44 },
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
