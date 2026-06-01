import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Linking, TextInput, Alert,
  useWindowDimensions,
} from 'react-native';
import ParentalGate from '../components/ParentalGate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { FREE_PLAN, PREMIUM_PLAN, PLAN_PRICING } from '../data/planConfig';
import { getCurrentPlan } from '../services/accessControl';
import { useProgressContext } from '../context/ProgressContext';
import { stories } from '../data/stories';
import { resetProgress } from '../services/progressResetService';
import { getStoreReviewUrl } from '../config/storeLinks';
import SoundButton from '../components/SoundButton';

const SUPPORT_EMAIL = 'contato@pequenostracosdefe.com';

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

export default function ParentAreaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const currentPlan = getCurrentPlan();
  const isPremium = currentPlan === 'premium';

  const { progressSummary, progressByStory, postStoryStatusByStory, refreshProgress } = useProgressContext();

  const [unlockedForSession, setUnlockedForSession] = useState(false);
  const [gateVisible, setGateVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);

  // Reset de progresso
  const [resetStep, setResetStep] = useState('idle'); // idle | confirm1 | confirm2 | done
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Restore Purchase — placeholder protegido (IAP ainda não integrado)
  // Estados: 'idle' | 'loading' | 'unavailable'
  const [restoreState, setRestoreState] = useState('idle');
  const handleRestorePurchase = useCallback(() => {
    setRestoreState('loading');
    // IAP não está integrado nesta versão. Simula resposta e informa honestamente.
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

  const playableStories = stories.filter(s => (s.totalCenas ?? 0) > 0);

  function getStoryStatus(story) {
    const prog = progressByStory[story.id] ?? {};
    const done = Object.values(prog).filter(Boolean).length;
    const total = story.totalCenas ?? 0;
    if (done === 0) return 'Não iniciada';
    if (done >= total) return 'Concluída ✓';
    return 'Em andamento';
  }

  const storeUrl = getStoreReviewUrl();

  if (!unlockedForSession) {
    return (
      <View style={styles.gateWrapper}>
        <ParentalGate visible onPass={handleGatePass} onCancel={handleGateCancel} />
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={styles.gateBg}
        >
          <Text style={styles.gateBgEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.gateBgTitle}>Área dos Pais</Text>
          <Text style={styles.gateBgSub}>
            Peça para um responsável resolver o desafio para continuar.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <>
      <ParentalGate visible={gateVisible} onPass={handleGatePass} onCancel={handleGateCancel} />
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <LinearGradient
          colors={['#7C3AED', '#A78BFA']}
          style={styles.header}
        >
          <Text style={styles.headerEmoji}>👨‍👩‍👧</Text>
          <Text style={styles.headerTitle}>Área dos Pais</Text>
          <Text style={styles.headerSub}>
            Acompanhe o progresso e conheça tudo que o app oferece.
          </Text>
        </LinearGradient>

        <View style={[styles.body, isTablet && styles.bodyTablet]}>

          {/* ── Plano atual ── */}
          <SectionTitle>📋 Plano Atual</SectionTitle>
          <InfoCard style={isPremium ? styles.premiumCard : styles.freeCard}>
            <View style={styles.planRow}>
              <Text style={styles.planEmoji}>{isPremium ? '💎' : '✨'}</Text>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>
                  {isPremium ? 'Plano Família' : 'Gratuito'}
                </Text>
                <Text style={styles.planDesc}>
                  {isPremium
                    ? 'Acesso completo a todas as histórias, Lumi e Ateliê ilimitado.'
                    : 'Acesso às histórias gratuitas, quiz e 3 artes no Ateliê.'}
                </Text>
              </View>
            </View>
          </InfoCard>

          {/* ── Incluído gratuitamente ── */}
          <SectionTitle>✨ Incluído gratuitamente</SectionTitle>
          <InfoCard>
            <View style={styles.featureList}>
              {FREE_PLAN.items.map((item, idx) => (
                <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
              ))}
            </View>
          </InfoCard>

          {/* ── Plano Família (paywall visual) ── */}
          <SectionTitle>💎 Plano Família</SectionTitle>
          <InfoCard style={styles.paywallCard}>
            <Text style={styles.paywallHeadline}>
              Desbloqueie a experiência completa para sua família.
            </Text>

            <View style={styles.featureList}>
              {PREMIUM_PLAN.items.map((item, idx) => (
                <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
              ))}
            </View>

            {/* Pricing placeholder — monthly / annual */}
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

            {/* Disabled activate button */}
            <View style={styles.activateBtn}>
              <Text style={styles.activateBtnText}>Ativar em breve</Text>
            </View>
            <Text style={styles.activateNote}>
              A ativação do plano estará disponível em uma próxima atualização.
            </Text>

            {/* Restore purchase — placeholder seguro (IAP não integrado) */}
            <View style={styles.restoreRow}>
              <Text style={styles.restoreLabel}>🔄 Restaurar compra</Text>
              {restoreState === 'unavailable' ? (
                <Text style={styles.restoreNote}>
                  As compras ainda não estão disponíveis nesta versão de teste.
                  A restauração será habilitada quando as compras forem lançadas.
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
                    accessibilityLabel="Restaurar compra do Plano Família"
                    accessibilityRole="button"
                    accessibilityHint="Recupera o acesso premium se você já adquiriu o plano"
                  >
                    <Text style={styles.restoreBtnText}>
                      {restoreState === 'loading' ? 'Verificando...' : 'Restaurar compra'}
                    </Text>
                  </SoundButton>
                </>
              )}
            </View>
          </InfoCard>

          {/* ── Chegando em futuras versões ── */}
          <SectionTitle>🚀 Chegando em futuras versões</SectionTitle>
          <InfoCard style={styles.comingSoonCard}>
            <View style={styles.featureList}>
              {PREMIUM_PLAN.comingSoonItems.map((item, idx) => (
                <FeatureRow key={idx} emoji={item.emoji} label={item.label} />
              ))}
            </View>
            <Text style={styles.comingSoonFootnote}>
              Funcionalidades em desenvolvimento, disponíveis em atualizações futuras.
            </Text>
          </InfoCard>

          {/* ── Progresso da criança ── */}
          <SectionTitle>⭐ Progresso da criança</SectionTitle>
          <InfoCard>
            {progressSummary !== null && (
              <View style={styles.progressRow}>
                <Text style={styles.progressStar}>⭐</Text>
                <View>
                  <Text style={styles.progressValue}>
                    {progressSummary.totalStars} estrela{progressSummary.totalStars !== 1 ? 's' : ''} conquistada{progressSummary.totalStars !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.progressNote}>
                    {progressSummary.completedStories} histór{progressSummary.completedStories !== 1 ? 'ias' : 'ia'} concluída{progressSummary.completedStories !== 1 ? 's' : ''} · {progressSummary.completedScenes} cenas pintadas
                  </Text>
                </View>
              </View>
            )}
            <Text style={[styles.bodyText, progressSummary !== null && { marginTop: 12 }]}>
              Cada cena colorida vale <Text style={styles.bold}>1 estrela</Text>. Quiz vale{' '}
              <Text style={styles.bold}>+1 estrela</Text>, reflexão com Lumi vale{' '}
              <Text style={styles.bold}>+1 estrela</Text> e Livrinho vale{' '}
              <Text style={styles.bold}>+1 estrela</Text>.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 8, fontStyle: 'italic', color: pt.muted }]}>
              Este resumo é salvo apenas neste aparelho.
            </Text>
          </InfoCard>

          {/* ── Segurança e privacidade ── */}
          <SectionTitle>🔒 Segurança e privacidade</SectionTitle>
          <InfoCard>
            <SecurityPoint text="Sem login ou cadastro — nenhum dado pessoal é solicitado." />
            <SecurityPoint text="Sem coleta de dados pessoais de crianças." />
            <SecurityPoint text="Todo o progresso é salvo localmente no dispositivo." />
            <SecurityPoint text="Sem publicidade ou conteúdo patrocinado." />
            <SecurityPoint text="Sem chat aberto ou conteúdo gerado por usuários." />
            <SecurityPoint text="Sem comunicação entre usuários." />
            <SecurityPoint text="Conteúdo adequado para crianças de 4 a 8 anos." />
            <SecurityPoint text="Desenvolvido para uso com supervisão dos pais nas primeiras sessões." />
            <SecurityPoint text="Sem compras ocultas — toda ativação de plano é informada ao responsável." />
          </InfoCard>

          {/* ── Armazenamento ── */}
          <SectionTitle>💾 Armazenamento</SectionTitle>
          <InfoCard>
            <Text style={styles.bodyText}>
              O progresso, desenhos e configurações são salvos localmente no dispositivo. Para
              liberar espaço, é possível limpar os dados do app nas configurações do sistema.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 8 }]}>
              Nenhuma informação é transmitida para servidores externos.
            </Text>
          </InfoCard>

          {/* ── Progresso por história ── */}
          <SectionTitle>📖 Progresso por história</SectionTitle>
          <InfoCard>
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
                    {pss?.reflectionDone ? ' · Lumi ✓' : ''}
                    {pss?.storyBookOpened ? ' · Livrinho ✓' : ''}
                  </Text>
                </View>
              );
            })}
          </InfoCard>

          {/* ── Avaliar o app ── */}
          <SectionTitle>⭐ Gostou do app?</SectionTitle>
          <InfoCard>
            <Text style={styles.bodyText}>
              Quando o app estiver publicado nas lojas, você poderá avaliar e deixar um comentário.
              Sua avaliação ajuda outras famílias a descobrirem o app!
            </Text>
            {storeUrl ? (
              <SoundButton
                style={[styles.supportBtn, { marginTop: 14 }]}
                onPress={() => Linking.openURL(storeUrl)}
                activeOpacity={0.85}
              >
                <Text style={styles.supportBtnText}>⭐ Avaliar o app</Text>
              </SoundButton>
            ) : (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonBadgeText}>Em breve — aguardando publicação nas lojas</Text>
              </View>
            )}
          </InfoCard>

          {/* ── Limpar progresso ── */}
          <SectionTitle>🗑️ Limpar progresso</SectionTitle>
          <InfoCard style={styles.resetCard}>
            {resetStep === 'done' ? (
              <View style={styles.resetDoneBox}>
                <Text style={styles.resetDoneTitle}>✅ Progresso apagado</Text>
                <Text style={styles.resetDoneDesc}>
                  A jornada pode começar de novo. O perfil, os desenhos do Ateliê e as
                  artes salvas foram preservados.
                </Text>
                <SoundButton
                  style={styles.resetCancelBtn}
                  onPress={() => setResetStep('idle')}
                  activeOpacity={0.85}
                >
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
                  <SoundButton
                    style={styles.resetCancelBtn}
                    onPress={() => { setResetStep('idle'); setResetConfirmText(''); }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.resetCancelBtnText}>Cancelar</Text>
                  </SoundButton>
                  <SoundButton
                    style={[
                      styles.resetConfirmBtn,
                      resetConfirmText.trim() !== 'APAGAR' && styles.resetConfirmBtnDisabled,
                    ]}
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
                  Isso vai apagar todo o progresso da criança neste aparelho: cenas pintadas,
                  quiz, reflexão com Lumi e livrinho de todas as histórias.
                </Text>
                <Text style={[styles.bodyText, { marginTop: 10 }]}>
                  Perfil, nome, desenhos do Ateliê e artes salvas não serão afetados.
                </Text>
                <View style={styles.resetBtnRow}>
                  <SoundButton
                    style={styles.resetCancelBtn}
                    onPress={() => setResetStep('idle')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.resetCancelBtnText}>Cancelar</Text>
                  </SoundButton>
                  <SoundButton
                    style={styles.resetNextBtn}
                    onPress={() => setResetStep('confirm2')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.resetNextBtnText}>Continuar →</Text>
                  </SoundButton>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.bodyText}>
                  Use esta opção apenas se quiser que a criança recomece a jornada do zero
                  neste aparelho.
                </Text>
                <SoundButton
                  style={styles.resetStartBtn}
                  onPress={() => setResetStep('confirm1')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resetStartBtnText}>🗑️ Apagar progresso</Text>
                </SoundButton>
              </View>
            )}
          </InfoCard>

          {/* ── Suporte e feedback ── */}
          <SectionTitle>💬 Suporte e feedback</SectionTitle>
          <InfoCard>
            <Text style={styles.bodyText}>
              Dúvidas, sugestões ou problemas? Entre em contato pelo e-mail abaixo. Respondemos o
              mais breve possível.
            </Text>
            <SoundButton
              style={styles.supportBtn}
              onPress={() =>
                openWithGate(
                  `mailto:${SUPPORT_EMAIL}?subject=Suporte%20Pequenos%20Tra%C3%A7os%20de%20F%C3%A9`,
                )
              }
              activeOpacity={0.85}
            >
              <Text style={styles.supportBtnText}>✉ {SUPPORT_EMAIL}</Text>
            </SoundButton>
            <SoundButton
              style={[styles.supportBtn, { marginTop: 8 }]}
              onPress={() =>
                openWithGate(
                  `mailto:${SUPPORT_EMAIL}?subject=Feedback%20Pequenos%20Tra%C3%A7os%20de%20F%C3%A9`,
                )
              }
              activeOpacity={0.85}
            >
              <Text style={styles.supportBtnText}>Enviar feedback por e-mail</Text>
            </SoundButton>
          </InfoCard>

          {/* ── Política de privacidade ── */}
          <SectionTitle>📄 Política de privacidade</SectionTitle>
          <InfoCard>
            <Text style={styles.bodyText}>
              Nossa política de privacidade estará disponível no site oficial do app em breve.
            </Text>
            <Text style={[styles.bodyText, { marginTop: 8 }]}>
              Para questões sobre privacidade, entre em contato:{' '}
              <Text style={styles.emailInline}>{SUPPORT_EMAIL}</Text>
            </Text>
          </InfoCard>

          {/* ── Versão ── */}
          <Text style={styles.versionText}>Pequenos Traços de Fé · v1.0 MVP</Text>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  content: {},
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  headerEmoji: { fontSize: 44, marginBottom: 8 },
  headerTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 26,
    color: '#fff',
    marginBottom: 6,
  },
  headerSub: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  bodyTablet: { paddingHorizontal: 48 },

  sectionTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 17,
    color: pt.text,
    marginTop: 20,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: radii.lg,
    padding: 16,
    ...shadows.card,
    marginBottom: 4,
  },
  freeCard: {
    backgroundColor: '#F0FAF0',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  premiumCard: {
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: '#F4B400',
  },
  paywallCard: {
    borderWidth: 2,
    borderColor: '#F4B400',
    backgroundColor: '#FFFBF0',
  },
  comingSoonCard: {
    borderWidth: 1,
    borderColor: pt.border,
    backgroundColor: '#F8F8F8',
  },

  planRow: { flexDirection: 'row', alignItems: 'center' },
  planEmoji: { fontSize: 32, marginRight: 12 },
  planInfo: { flex: 1 },
  planName: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: pt.text,
    marginBottom: 2,
  },
  planDesc: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.textSoft,
    lineHeight: 18,
  },

  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  featureLabel: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.text,
    flex: 1,
    fontWeight: '600',
  },

  paywallHeadline: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: pt.text,
    marginBottom: 14,
    lineHeight: 22,
  },

  pricingRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 4,
  },
  pricingRowTablet: {},
  pricingCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: pt.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 6,
  },
  pricingLabel: {
    fontFamily: 'FredokaOne',
    fontSize: 15,
    color: pt.text,
  },
  comingSoonBadge: {
    backgroundColor: pt.border,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  comingSoonBadgeText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: pt.muted,
    fontWeight: '700',
  },

  activateBtn: {
    marginTop: 14,
    backgroundColor: pt.border,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
    opacity: 0.65,
  },
  activateBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: pt.muted,
  },
  activateNote: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.muted,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  restoreRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: pt.border,
  },
  restoreLabel: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.muted,
    fontWeight: '700',
    marginBottom: 2,
  },
  restoreNote: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.muted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  restoreBtn: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: pt.border,
    alignSelf: 'flex-start',
    backgroundColor: pt.background,
  },
  restoreBtnLoading: {
    opacity: 0.6,
  },
  restoreBtnText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.textSoft,
    fontWeight: '700',
  },

  comingSoonFootnote: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.muted,
    lineHeight: 17,
    marginTop: 12,
    fontStyle: 'italic',
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  progressStar: { fontSize: 32 },
  progressValue: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: pt.text,
  },
  progressNote: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.textSoft,
  },

  securityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  securityDot: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: pt.textSoft,
    lineHeight: 21,
    width: 10,
  },
  securityText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: pt.textSoft,
    lineHeight: 20,
    flex: 1,
  },

  supportBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: pt.primary,
    borderRadius: radii.pill,
    paddingVertical: 11,
    alignItems: 'center',
  },
  supportBtnText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.primary,
    fontWeight: '700',
  },

  bodyText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.textSoft,
    lineHeight: 21,
  },
  bold: { fontWeight: '700', color: pt.text },
  emailInline: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.primary,
    fontWeight: '700',
  },

  gateWrapper: { flex: 1 },
  gateBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  gateBgEmoji: { fontSize: 56, marginBottom: 16 },
  gateBgTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 26,
    color: '#FFF',
    marginBottom: 10,
  },
  gateBgSub: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  versionText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: pt.muted,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },

  // Progresso por história
  storyProgressRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: pt.border,
  },
  storyProgressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  storyProgressEmoji: { fontSize: 24, marginRight: 10 },
  storyProgressInfo: { flex: 1 },
  storyProgressTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  storyProgressPlan: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, marginTop: 1 },
  storyProgressPct: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  storyProgressBar: {
    height: 6, backgroundColor: pt.border, borderRadius: 3,
    overflow: 'hidden', marginBottom: 4,
  },
  storyProgressFill: {
    height: '100%', backgroundColor: '#7C3AED', borderRadius: 3,
  },
  storyProgressDetail: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.muted, fontWeight: '700',
  },

  // Reset de progresso
  resetCard: {
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF8F8',
  },
  resetWarningTitle: {
    fontFamily: 'FredokaOne', fontSize: 15, color: '#C62828', marginBottom: 10,
  },
  resetBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  resetCancelBtn: {
    flex: 1, backgroundColor: pt.border, borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
  },
  resetCancelBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  resetNextBtn: {
    flex: 1, backgroundColor: '#FF8A80', borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
  },
  resetNextBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  resetInput: {
    marginTop: 10,
    backgroundColor: '#FFF',
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: '#EF9A9A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: '#C62828',
    letterSpacing: 2,
  },
  resetConfirmBtn: {
    flex: 1, backgroundColor: '#C62828', borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
  },
  resetConfirmBtnDisabled: { backgroundColor: pt.border },
  resetConfirmBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },
  resetStartBtn: {
    marginTop: 12, backgroundColor: '#FFCDD2', borderRadius: radii.pill,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#EF9A9A',
  },
  resetStartBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#C62828' },
  resetDoneBox: { alignItems: 'center' },
  resetDoneTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: '#2E7D32', marginBottom: 10,
  },
  resetDoneDesc: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', lineHeight: 19, marginBottom: 16,
  },
});
