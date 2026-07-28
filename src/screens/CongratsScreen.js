import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Image, Modal,
  Animated, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../components/SoundButton';
import Confetti from '../components/Confetti';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { images } from '../assets/images';
import { stories } from '../data/stories';
import { useProgressContext } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import BeniAvatar from '../components/beni/BeniAvatar';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { getNextAdventureRecommendation } from '../services/nextAdventureService';
import StoryCoverImage from '../components/story/StoryCoverImage';
import { QUIZ_QUESTIONS_PER_STORY } from '../services/quizModel';
import { isCreationColoringPilotActive } from '../services/coloring60Pilot';
import { ROUTES } from '../constants/routes';
import { loadColoring60JourneyState } from '../services/coloring60ProgressReader';
import {
  deriveColoring60StoryBridge,
  COLORING60_ACTION,
} from '../services/coloring60Journey';

// A0.3: removida a leitura de largura de tela congelada no módulo — era código MORTO
// (a variável não era usada em lugar nenhum). Sem substituto necessário; esta tela
// não usa largura de tela aqui.

function SceneTimelineDot({ cena, done, index }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, friction: 5, tension: 80,
      delay: index * 60, useNativeDriver: true,
    }).start();
  }, []);

  const titulo = cena.titulo ?? `Cena ${cena.id}`;
  const emoji = cena.emojiCena ?? '⭐';

  return (
    <Animated.View style={[styles.dotRow, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.timelineDot, done ? styles.timelineDotDone : styles.timelineDotEmpty]}>
        <Text style={styles.timelineDotEmoji}>{done ? emoji : '○'}</Text>
      </View>
      <View style={styles.timelineDotLabel}>
        <Text style={[styles.timelineDotText, !done && styles.timelineDotTextEmpty]} numberOfLines={1}>
          {titulo}
        </Text>
        {done && <Text style={styles.timelineDotStar}>⭐ +1</Text>}
      </View>
    </Animated.View>
  );
}

/**
 * [C60-PARTE-10] PONTE PÓS-HISTÓRIA — o próximo passo, no topo, com UM convite só.
 *
 * A conclusão da história NÃO é redesenhada neste bloco: ela ganha uma HIERARQUIA. Primeiro o Beni
 * diz o que acabou e convida a colorir a Criação; depois vem tudo o que já existia, agora sob um
 * título que o organiza ("Veja tudo que você conquistou"). Nada foi removido da tela.
 *
 * Só aparece na história do piloto e só depois que o progresso REAL foi lido (o rótulo do convite
 * depende dele). Enquanto lê, a ponte não é renderizada — nunca um rótulo provisório que possa
 * mandar a criança "começar" o que ela já terminou.
 */
function CreationColoringBridge({ bridge, onPress }) {
  if (!bridge) return null;
  return (
    <View style={styles.c60Bridge}>
      <View style={styles.c60BridgeRow}>
        <BeniAvatar variant="artist" size="medium" />
        <Text style={styles.c60BridgeText}>{bridge.message}</Text>
      </View>
      <SoundButton
        style={styles.c60BridgeBtn}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={bridge.action.label}
      >
        <Text style={styles.c60BridgeBtnText}>{bridge.action.label}</Text>
      </SoundButton>
      {/* Contagem só quando ela DIZ algo: "0 de 3" antes de começar seria ruído. Mesmo formato da
          coleção ("2 de 3"), para a criança reconhecer o mesmo número nas duas superfícies. */}
      {bridge.completedCount > 0 && (
        <Text style={styles.c60BridgeCount}>{bridge.progressLabel}</Text>
      )}
    </View>
  );
}

/* Tile de recompensa (presente) — sem chevron, cara de conquista, não config. */
function RewardTile({ emoji, label, onPress }) {
  return (
    <SoundButton style={styles.rewardTile} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.rewardTileCircle}>
        <Text style={styles.rewardTileEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.rewardTileLabel} numberOfLines={2}>{label}</Text>
    </SoundButton>
  );
}

export default function CongratsScreen({ route, navigation }) {
  const { story } = route.params;
  const insets = useSafeAreaInsets();
  const { progressByStory, postStoryStatusByStory } = useProgressContext();
  const { profile } = useProfile();
  const progresso = progressByStory[story.id] ?? {};

  const [showCertificate, setShowCertificate] = useState(false);

  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'CongratsScreen' });

  const completedScenesCount = Object.values(progresso).filter(Boolean).length;
  const scenesPercent = story.totalCenas > 0 ? completedScenesCount / story.totalCenas : 0;

  // Piloto "Colorir com o Beni" (Colorir 60): em "A Criação" com o piloto ativo, o Colorir
  // TRADICIONAL por cena dá lugar à jornada "Colorir com o Beni" (na StoryDetailScreen). Aqui
  // isso oculta a recompensa "Colorir" (que abriria o Colorir legado por cena) — sem apagar
  // nada e sem afetar outras histórias. Piloto off ⇒ recompensa volta a aparecer.
  const creationColoringPilot = isCreationColoringPilotActive(story?.id);
  const creationColoringHidden = creationColoringPilot;

  // [C60-PARTE-10] Progresso REAL da jornada de cores, reconciliado (conclusão + instantâneo).
  // `null` = ANTES da primeira leitura (nada a mostrar ainda). Quando a leitura FALHA depois de já
  // termos uma ponte válida, PRESERVAMOS a última (não voltamos a "nada" nem a "0 de 3"); se falhar
  // sem estado anterior, caímos numa ponte HONESTA (readFailed) em vez de convidar errado — um
  // "Começar" para quem já pintou duas partes seria uma mentira pequena com custo grande.
  const [c60Bridge, setC60Bridge] = useState(null);

  // Recarrega ao FOCAR: a criança pode sair daqui para colorir e voltar. O rótulo do convite tem de
  // refletir o progresso de AGORA, não o de quando esta tela montou.
  useFocusEffect(useCallback(() => {
    if (!creationColoringPilot) return undefined;
    let alive = true;
    loadColoring60JourneyState(story.id)
      .then((state) => {
        if (!alive) return;
        setC60Bridge(deriveColoring60StoryBridge({
          doneMap: state.doneMap,
          order: Object.keys(state.doneMap),
        }));
      })
      .catch((err) => {
        if (__DEV__) console.log('[Coloring60] ponte pós-história: leitura falhou:', err?.message);
        // Leitura falhou: PRESERVA a última ponte válida; sem estado anterior, mostra a ponte
        // honesta (readFailed) — nunca volta a `null`/branco e nunca assume 0 de 3.
        if (alive) setC60Bridge((prev) => prev ?? deriveColoring60StoryBridge({ readFailed: true }));
      });
    return () => { alive = false; };
  }, [creationColoringPilot, story.id]));

  // A ponte tem UMA ação; a tela decide COMO realizá-la (a derivação nunca navega).
  function handleC60Bridge() {
    const action = c60Bridge?.action ?? null;
    if (!action) return;
    if (action.kind === COLORING60_ACTION.COLLECTION) {
      navigation.navigate(ROUTES.COLORING60_COLLECTION, { storyId: story.id });
      return;
    }
    if (action.kind === COLORING60_ACTION.OPEN_NEXT && action.targetActivityId) {
      navigation.navigate(ROUTES.COLORING, { storyId: story.id, activityId: action.targetActivityId });
    }
  }

  // Recomendação inteligente de continuidade (nunca recomenda história concluída)
  const recommendation = getNextAdventureRecommendation({
    currentStoryId: story.id,
    stories,
    progressByStory,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(starsAnim, { toValue: 1, duration: 1200, delay: 400, useNativeDriver: false }),
    ]).start();
    // Verificar novas conquistas após a tela de parabéns ser exibida
    const timer = setTimeout(() => { checkForNewAchievements(); }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const animatedProgress = starsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${scenesPercent * 100}%`],
  });

  // Ação principal "Próxima aventura" (contextual à recomendação).
  function handleNextAdventure() {
    if (recommendation.state === 'A' && recommendation.story) {
      navigation.navigate('StoryDetail', { story: recommendation.story });
    } else if (recommendation.state === 'B') {
      navigation.navigate('ParentArea');
    } else {
      navigation.navigate('Aventuras');
    }
  }
  const nextLabel = recommendation.state === 'C' ? 'Ver aventuras' : 'Próxima aventura';
  const nextSub =
    recommendation.state === 'A' && recommendation.story
      ? recommendation.story.titulo
      : recommendation.state === 'B'
        ? 'Um novo caminho com o responsável'
        : 'Reveja suas histórias quando quiser';

  return (
    <View style={styles.wrapper}>
      <View style={styles.confettiLayer} pointerEvents="none">
        <Confetti visible={true} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.pageContent, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        }]}>

          {/* ── HERO ── */}
          <LinearGradient colors={[colors.action, '#E8703A']} style={styles.heroHeader}>
            <Text style={styles.heroEmoji}>{story.emoji}</Text>
            <Text style={styles.heroTitle}>Aventura concluída!</Text>
            <Text style={styles.heroSub}>
              {getBeniGuideMessage('storyCompleted')}
            </Text>
            <BeniAvatar variant="celebrating" size="medium" style={styles.heroBeni} />
          </LinearGradient>

          {/* ── [C60-PARTE-10] PONTE: o próximo passo vem ANTES de tudo o que já existia ── */}
          {creationColoringPilot && (
            <CreationColoringBridge bridge={c60Bridge} onPress={handleC60Bridge} />
          )}

          {/* Título que organiza o RESTANTE da conclusão (nada foi removido daqui para baixo). */}
          {creationColoringPilot && !!c60Bridge && (
            <Text style={styles.c60RestTitle}>{c60Bridge.restSectionTitle}</Text>
          )}

          {/* ── LIÇÃO DO CORAÇÃO ── */}
          <View style={styles.licaoBox}>
            <Text style={styles.licaoLabel}>Lição do Coração</Text>
            <Text style={styles.licao}>"{story.licaoCoracao}"</Text>
          </View>

          {/* ── STARS ── */}
          <View style={styles.starsCard}>
            <Text style={styles.starsCardTitle}>Suas estrelas</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: story.totalCenas }).map((_, i) => (
                <Text key={i} style={[styles.starIcon, i < completedScenesCount ? styles.starOn : styles.starOff]}>
                  ⭐
                </Text>
              ))}
            </View>
            <View style={styles.starsBarOuter}>
              <Animated.View style={[styles.starsBarInner, { width: animatedProgress }]} />
            </View>
            <Text style={styles.starsCount}>{completedScenesCount} / {story.totalCenas} estrelas</Text>
          </View>

          {/* ── REWARD SECTION ── */}
          <View style={styles.rewardSection}>
            <Text style={styles.rewardSectionTitle}>Sua aventura virou um presente!</Text>
            <Text style={styles.rewardSectionSub}>
              Beni guardou essa jornada com carinho. Veja tudo que você ganhou.
            </Text>

            {/* ── PRIMEIRA DOBRA: 3 ações principais ── */}
            {/* 1. Presente principal: Livrinho da Fé */}
            <SoundButton
              style={styles.livrinhoBtn}
              onPress={() => navigation.navigate('StoryBook', { story, fromStoryCompletion: true, from: 'storyComplete' })}
              activeOpacity={0.85}
            >
              <Text style={styles.livrinhoBtnEmoji}>📖</Text>
              <View style={styles.livrinhoBtnInfo}>
                <Text style={styles.livrinhoBtnTitle}>Abrir Livrinho da Fé</Text>
                <Text style={styles.livrinhoBtnSub}>Seu presente principal — a aventura em páginas</Text>
              </View>
              <Text style={styles.livrinhoBtnArrow}>›</Text>
            </SoundButton>

            {/* 2. Responder Quiz */}
            <SoundButton
              style={styles.mainActionBtn}
              onPress={() => navigation.navigate('Quiz', { story })}
              activeOpacity={0.85}
            >
              <View style={[styles.mainActionCircle, { backgroundColor: '#FFF3CC' }]}>
                <Text style={styles.mainActionEmoji}>⭐</Text>
              </View>
              <View style={styles.mainActionInfo}>
                <Text style={styles.mainActionTitle}>Responder Quiz</Text>
                <Text style={styles.mainActionSub}>{QUIZ_QUESTIONS_PER_STORY} perguntas. Ganhe +1 ⭐!</Text>
              </View>
              <Text style={styles.mainActionArrow}>›</Text>
            </SoundButton>

            {/* 3. Próxima aventura */}
            <SoundButton
              style={styles.mainActionBtn}
              onPress={handleNextAdventure}
              activeOpacity={0.85}
            >
              <View style={[styles.mainActionCircle, { backgroundColor: '#E3ECF7' }]}>
                <Text style={styles.mainActionEmoji}>🧭</Text>
              </View>
              <View style={styles.mainActionInfo}>
                <Text style={styles.mainActionTitle}>{nextLabel}</Text>
                <Text style={styles.mainActionSub} numberOfLines={1}>{nextSub}</Text>
              </View>
              <Text style={styles.mainActionArrow}>›</Text>
            </SoundButton>

            {/* ── VOCÊ DESBLOQUEOU — cards de recompensa (sem chevron) ── */}
            <Text style={styles.rewardUnlocked}>Você desbloqueou</Text>
            <View style={styles.rewardGrid}>
              <RewardTile emoji="🎴" label="Baú" onPress={() => navigation.navigate('BeniChest', { fromStoryCompletion: true, from: 'storyComplete' })} />
              <RewardTile emoji="⭐" label="Estrelinhas" onPress={() => navigation.navigate('EstrelinhasCena', { fromStoryCompletion: true, from: 'storyComplete' })} />
              {!creationColoringHidden && (
                <RewardTile emoji="🎨" label="Colorir" onPress={() => navigation.navigate('Coloring', { story, cenaIndex: 0, from: 'storyComplete' })} />
              )}
              <RewardTile emoji="✨" label="Guardar no coração" onPress={() => navigation.navigate('Reflection', { story })} />
            </View>

            {/* Secundárias: Rever + Certificado */}
            <SoundButton
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('StoryDetail', { story })}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewBtnText}>▶ Rever aventura</Text>
            </SoundButton>
            <SoundButton
              style={styles.certBtn}
              onPress={() => setShowCertificate(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.certBtnEmoji}>🏅</Text>
              <Text style={styles.certBtnText}>Ver Certificado da aventura</Text>
            </SoundButton>
          </View>

          {/* ── Caminho bloqueado / tudo concluído (info, quando aplicável) ── */}
          {recommendation.state === 'B' && recommendation.story && (
            <View style={styles.blockedCard}>
              <View style={styles.blockedCoverWrap}>
                <StoryCoverImage story={recommendation.story} rounded={false} />
                <View style={styles.blockedTint} pointerEvents="none" />
                <View style={styles.blockedBadge}>
                  <Text style={styles.blockedBadgeText}>🔒 Com responsável</Text>
                </View>
              </View>
              <View style={styles.blockedInfo}>
                <Text style={styles.blockedTitle}>Novo caminho para descobrir</Text>
                <Text style={styles.blockedSub}>
                  {getBeniGuideMessage('premiumBlocked')}
                </Text>
                <SoundButton
                  style={styles.blockedBtn}
                  onPress={() => navigation.navigate('ParentArea')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.blockedBtnText}>Chamar responsável</Text>
                </SoundButton>
              </View>
            </View>
          )}

          {recommendation.state === 'C' && (
            <View style={styles.allDoneCard}>
              <Text style={styles.allDoneEmoji}>🌟</Text>
              <Text style={styles.allDoneTitle}>Que jornada linda!</Text>
              <Text style={styles.allDoneSub}>
                Você pode rever suas aventuras quando quiser.
              </Text>
            </View>
          )}

          {/* Voltar ao início */}
          <SoundButton
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.homeBtnText}>🏠 Voltar ao início</Text>
          </SoundButton>

          {/* ── RESUMO DA AVENTURA (secundário, abaixo das ações principais) ── */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Resumo da aventura</Text>
            <View style={styles.timelineList}>
              {story.cenas.map((cena, index) => (
                <SceneTimelineDot
                  key={cena.id}
                  cena={cena}
                  done={!!progresso[cena.id]}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* ── FRASE DE RETENÇÃO ── */}
          <Text style={styles.retentionPhrase}>
            Cada aventura completa guarda novas páginas, cartinhas e estrelinhas.
          </Text>

        </Animated.View>
      </ScrollView>

      {pendingAchievement && (
        <AchievementUnlockModal
          achievement={pendingAchievement}
          onDismiss={dismissAchievement}
        />
      )}

      {/* ── CERTIFICADO LOCAL (modal simples, sem compartilhamento) ── */}
      <Modal
        visible={showCertificate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCertificate(false)}
      >
        <View style={styles.certOverlay}>
          <View style={styles.certCard}>
            <Text style={styles.certCardEmoji}>🏅</Text>
            <Text style={styles.certCardLabel}>Certificado da aventura</Text>
            <Text style={styles.certCardName}>
              {profile?.name?.trim() || 'Pequeno explorador'}
            </Text>
            <Text style={styles.certCardStory}>{story.titulo}</Text>
            {!!story.referencia && (
              <Text style={styles.certCardRef}>{story.referencia}</Text>
            )}
            <Text style={styles.certCardMsg}>
              Completou esta aventura com amor e fé!
            </Text>
            <BeniAvatar variant="celebrating" size="small" style={{ marginVertical: 8 }} />
            <Text style={styles.certCardBeniMsg}>
              Beni está muito orgulhoso de você! 🌟
            </Text>
            <SoundButton style={styles.certCloseBtn} onPress={() => setShowCertificate(false)} activeOpacity={0.85}>
              <Text style={styles.certCloseBtnText}>Fechar</Text>
            </SoundButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  confettiLayer: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  container: { flex: 1 },
  pageContent: {},

  heroHeader: {
    paddingTop: 52, paddingBottom: 28,
    paddingHorizontal: 24, alignItems: 'center',
  },
  heroEmoji: { fontSize: 60, marginBottom: 10 },
  heroTitle: {
    fontFamily: 'FredokaOne', fontSize: 30, color: '#FFF',
    textAlign: 'center', marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4,
  },
  heroBeni: { marginTop: 12 },
  heroSub: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  // ── [C60-PARTE-10] Ponte pós-história ─────────────────────────────────────
  // Superfície SÓLIDA e clara, com a borda do ateliê (mesma família visual do Colorir com o Beni na
  // tela da história). Fica logo abaixo do HERO, com respiro suficiente para ler como "primeiro
  // passo" e não como mais um cartão da lista de recompensas.
  c60Bridge: {
    backgroundColor: '#FFF9ED',
    borderRadius: radii.lg,
    borderWidth: 2, borderColor: '#F4B400',
    paddingVertical: 16, paddingHorizontal: 16,
    marginHorizontal: 16, marginTop: 16,
    ...shadows.soft,
  },
  c60BridgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  c60BridgeText: {
    flex: 1,
    fontFamily: 'FredokaOne', fontSize: 16, color: colors.text, lineHeight: 22,
  },
  c60BridgeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 14, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 14,
    ...shadows.soft,
  },
  c60BridgeBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  c60BridgeCount: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', marginTop: 8,
  },
  c60RestTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: pt.textSoft,
    textAlign: 'center', marginTop: 22, marginHorizontal: 20,
  },

  licaoBox: {
    backgroundColor: '#FFF8EC',
    borderRadius: radii.lg, padding: 18,
    marginHorizontal: 20, marginTop: 16,
    borderLeftWidth: 4, borderLeftColor: colors.accent,
    ...shadows.soft,
  },
  licaoLabel: {
    fontFamily: 'FredokaOne', fontSize: 11, color: colors.primary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  licao: {
    fontFamily: 'Nunito', fontSize: 16, color: colors.text,
    fontStyle: 'italic', lineHeight: 24, textAlign: 'center',
  },

  starsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg, padding: 20,
    marginHorizontal: 20, marginTop: 16,
    ...shadows.soft, alignItems: 'center',
  },
  starsCardTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: colors.text, marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 4, marginBottom: 14,
  },
  starIcon: { fontSize: 22 },
  starOn: { opacity: 1 },
  starOff: { opacity: 0.2 },
  starsBarOuter: {
    width: '100%', height: 10,
    backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden', marginBottom: 8,
  },
  starsBarInner: { height: '100%', backgroundColor: colors.accent, borderRadius: 5 },
  starsCount: { fontFamily: 'Nunito', fontSize: 13, color: colors.textLight },

  timelineCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg, padding: 20,
    marginHorizontal: 20, marginTop: 16,
    ...shadows.soft,
  },
  timelineTitle: {
    fontFamily: 'FredokaOne', fontSize: 16, color: colors.text, marginBottom: 14,
  },
  timelineList: { gap: 10 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineDot: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  timelineDotDone: { backgroundColor: colors.success },
  timelineDotEmpty: { backgroundColor: colors.border },
  timelineDotEmoji: { fontSize: 16 },
  timelineDotLabel: { flex: 1 },
  timelineDotText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.text, fontWeight: '700',
  },
  timelineDotTextEmpty: { color: colors.textLight, fontWeight: 'normal' },
  timelineDotStar: { fontFamily: 'Nunito', fontSize: 11, color: colors.success },

  // Reward section
  rewardSection: {
    marginHorizontal: 16, marginTop: 24, marginBottom: 8,
  },
  rewardSectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 20, color: pt.text,
    textAlign: 'center', marginBottom: 6,
  },
  rewardSectionSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', lineHeight: 19, marginBottom: 16,
  },
  rewardUnlocked: {
    fontFamily: 'FredokaOne', fontSize: 14, color: '#7C3AED',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  // Estado B — novo caminho bloqueado
  blockedCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    marginHorizontal: 16, marginBottom: 14,
    overflow: 'hidden',
    ...shadows.card,
    borderLeftWidth: 4, borderLeftColor: '#7C3AED',
  },
  blockedCoverWrap: { position: 'relative' },
  blockedTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124,58,237,0.16)',
  },
  blockedBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4,
  },
  blockedBadgeText: { fontFamily: 'Nunito', fontSize: 11, color: '#7C3AED', fontWeight: '700' },
  blockedInfo: { padding: 14 },
  blockedTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 4 },
  blockedSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19, marginBottom: 12,
  },
  blockedBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: radii.pill, paddingVertical: 13, alignItems: 'center',
    elevation: 3, shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  blockedBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  // Estado C — todas concluídas
  allDoneCard: {
    backgroundColor: pt.greenSoft,
    borderRadius: radii.lg, marginHorizontal: 16, marginBottom: 14,
    padding: 20, alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: pt.green, ...shadows.soft,
  },
  allDoneEmoji: { fontSize: 40, marginBottom: 8 },
  allDoneTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center', marginBottom: 4,
  },
  allDoneSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center', marginBottom: 14,
  },
  allDoneBtn: {
    backgroundColor: pt.green,
    borderRadius: radii.pill, paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center',
  },
  allDoneBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  reviewBtn: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 20, marginTop: 12,
    borderRadius: radii.pill, paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    ...shadows.soft,
  },
  reviewBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: colors.primary },

  homeBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 20, marginTop: 12,
    borderRadius: radii.pill, paddingVertical: 16,
    alignItems: 'center',
    elevation: 4, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6,
  },
  homeBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },

  // Botão principal do Livrinho
  livrinhoBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: radii.lg, padding: 16,
    marginHorizontal: 16, marginBottom: 12,
    borderWidth: 2, borderColor: '#93C5FD', gap: 12,
    elevation: 3, shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6,
  },
  livrinhoBtnEmoji: { fontSize: 32 },
  livrinhoBtnInfo: { flex: 1 },
  livrinhoBtnTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: '#1E40AF' },
  livrinhoBtnSub: { fontFamily: 'Nunito', fontSize: 12, color: '#3B82F6', lineHeight: 16 },
  livrinhoBtnArrow: { fontFamily: 'FredokaOne', fontSize: 22, color: '#93C5FD' },

  // Ações principais 2 e 3 (Quiz, Próxima aventura)
  mainActionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radii.lg, padding: 14,
    marginHorizontal: 16, marginBottom: 12, gap: 12,
    borderWidth: 1.5, borderColor: pt.border,
    ...shadows.soft,
  },
  mainActionCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  mainActionEmoji: { fontSize: 24 },
  mainActionInfo: { flex: 1 },
  mainActionTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 2 },
  mainActionSub: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 16 },
  mainActionArrow: { fontFamily: 'FredokaOne', fontSize: 22, color: pt.muted },

  // Você desbloqueou — grade de recompensas (tiles sem chevron)
  rewardGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  rewardTile: {
    width: '48%', alignItems: 'center',
    backgroundColor: '#FFFDF7',
    borderRadius: radii.lg, paddingVertical: 16, paddingHorizontal: 8,
    marginBottom: 10,
    borderWidth: 1.5, borderColor: '#F0E2C6',
    ...shadows.soft,
  },
  rewardTileCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#FFF3CC',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: '#F2DFA0',
  },
  rewardTileEmoji: { fontSize: 24 },
  rewardTileLabel: {
    fontFamily: 'FredokaOne', fontSize: 13, color: pt.text, textAlign: 'center', lineHeight: 17,
  },

  // Certificado
  certBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 16, marginBottom: 14, paddingVertical: 12,
    borderRadius: radii.lg, borderWidth: 1.5, borderColor: '#F2DFA0',
    backgroundColor: '#FFFDF7',
  },
  certBtnEmoji: { fontSize: 20 },
  certBtnText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', color: '#9A6B12' },

  // Modal do Certificado
  certOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  certCard: {
    backgroundColor: '#FFFDF7', borderRadius: 24, padding: 28,
    alignItems: 'center', width: '100%',
    borderWidth: 2, borderColor: '#F2DFA0',
    elevation: 12, shadowColor: '#B07A2E',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16,
  },
  certCardEmoji: { fontSize: 52, marginBottom: 6 },
  certCardLabel: { fontFamily: 'FredokaOne', fontSize: 11, color: '#9A6B12', letterSpacing: 1.2, marginBottom: 12 },
  certCardName: { fontFamily: 'FredokaOne', fontSize: 24, color: '#1A1A1A', textAlign: 'center', marginBottom: 4 },
  certCardStory: { fontFamily: 'FredokaOne', fontSize: 17, color: colors.primary, textAlign: 'center', marginBottom: 2 },
  certCardRef: { fontFamily: 'Nunito', fontSize: 13, color: '#9A6B12', textAlign: 'center', marginBottom: 10 },
  certCardMsg: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 4 },
  certCardBeniMsg: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft ?? '#666', textAlign: 'center', marginBottom: 16 },
  certCloseBtn: {
    backgroundColor: colors.primary, borderRadius: radii.pill,
    paddingVertical: 12, paddingHorizontal: 36,
  },
  certCloseBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  // Frase de retenção
  retentionPhrase: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft ?? '#888',
    textAlign: 'center', marginHorizontal: 24, marginTop: 16, marginBottom: 8,
    lineHeight: 20, fontStyle: 'italic',
  },
});
