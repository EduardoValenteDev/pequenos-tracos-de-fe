import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import SoundButton from '../components/SoundButton';
import SafeScreenHeader from '../components/layout/SafeScreenHeader';
import { BeniGuideBubble } from '../components/beni';
import StorySceneVisual from '../components/story/StorySceneVisual';
import UnlockCelebration from '../components/UnlockCelebration';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { colors } from '../theme/colors';
import AudioPlayer from '../components/AudioPlayer';
import ProgressBar from '../components/ProgressBar';
import { useProgress } from '../hooks/useProgress';
import { useProgressContext } from '../context/ProgressContext';
import { getStoryCoverImage, getOfficialSceneIllustration } from '../services/storyImageService';
import { useResolvedSceneImage, useResolvedStoryAudio } from '../hooks/useResolvedStoryMedia';
import { canOpenStoryFullExperience, getStoryLockReason } from '../services/contentAccessService';
import { hasSceneAudio, getSceneAudio } from '../services/audioService';
import { isCreationColoringPilotActive } from '../services/coloring60Pilot';
import {
  getColoring60MilestoneForCompletedScene,
  derivePostSceneExperience,
  C60_POST_SCENE,
} from '../data/coloring60StoryMilestones';
import { loadColoring60Done } from '../services/coloring60ActivityService';
import {
  hasSeenColoring60MilestoneInvite,
  markColoring60MilestoneInviteSeen,
} from '../services/coloring60MilestoneInviteSeen';
import { c60OpenEditorFromMilestone } from '../services/coloring60Navigation';
import Coloring60MilestoneInvite from '../components/coloring60/Coloring60MilestoneInvite';

export default function NarrationScreen({ route, navigation }) {
  const { story, cenaIndex } = route.params;

  // [P3J] O Colorir TRADICIONAL por cena foi APOSENTADO globalmente: não existe mais convite
  // de colorir na cena nem botão de colorir na celebração, em nenhuma história. O que resta
  // aqui é o gate do "Colorir com o Beni" (Colorir 60), que governa APENAS os marcos narrativos
  // de "A Criação" (cenas 2/7/9). Fora de "A Criação", ou com o gate inativo, não há colorir.
  const coloring60JourneyActive = isCreationColoringPilotActive(story?.id);

  // Guard: story must have cenas populated (navigation from onboarding used to crash here)
  const hasCenas = !!(story?.cenas?.length);
  const cena = hasCenas ? story.cenas[cenaIndex] : null;

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const numeroCena = cenaIndex + 1;
  const totalCenas = hasCenas ? story.cenas.length : 0;
  const isLastCena = hasCenas ? (cenaIndex === story.cenas.length - 1) : false;
  const sceneKey = `scene_${String(cenaIndex + 1).padStart(2, '0')}`;
  const sceneAudioEntry = hasCenas ? getSceneAudio(story.id, sceneKey) : null;
  // F2.4e.5: áudio remoto (file://) p/ david_goliath com pack ready + arquivo existente;
  // fallback local (audioAsset do bundle) idêntico ao anterior nas outras condições. Hook
  // chamado SEMPRE (antes de qualquer early-return) — só troca a FONTE, não o play/cleanup.
  const resolvedAudioAsset = useResolvedStoryAudio(story?.id, numeroCena, sceneAudioEntry?.audioAsset ?? null);

  const textoNarracao = cena ? (cena.textoNarracao ?? cena.narracao ?? '') : '';
  const tituloCena = cena ? (cena.titulo ?? `Cena ${numeroCena}`) : '';
  // Fala do Beni antes da cena — vinda do catálogo central (sceneStart)
  const beniMessage = getBeniGuideMessage('sceneStart', { index: cenaIndex });

  // F2.1f: imagem da cena via resolver de packs, GATED a david_goliath (fallback local
  // idêntico quando não há pack ready). Demais histórias seguem o caminho antigo. A capa
  // (ambientação) e o áudio permanecem 100% locais.
  const officialIllustration = useResolvedSceneImage(story.id, cena?.id);
  // F2.5-hardening-1 C2: require local da cena (null-safe) p/ o onError do OfficialSceneImage.
  const officialFallback = cena?.id ? getOfficialSceneIllustration(story.id, cena.id) : null;
  const storyCover = getStoryCoverImage(story.id);

  // Progresso — conclusão da cena é desacoplada do colorir (Sprint Histórias 3.0)
  const { progresso, salvarCena } = useProgress(story.id);
  const { refreshProgress } = useProgressContext();
  const jaConcluida = cena ? (progresso[cena.id] === true) : false;

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationHandledRef = useRef(false);
  // true enquanto a celebração ainda não foi finalizada pela ação principal.
  // Permite reabrir o modal ao retornar de uma ação secundária (visita).
  const celebrationPendingRef = useRef(false);

  // [C60-MARCO] Marco narrativo DESTA cena (piloto + "A Criação" + cena 2/7/9), DERIVADO do catálogo
  // pelo número da cena — null em qualquer outra cena/história (sem fallback). O convite do Beni só
  // existe quando este marco existe; e como só a PRIMEIRA conclusão da cena abre a experiência pós-cena
  // (primaryAction = handleConcluirCena apenas quando !jaConcluida), a decisão do marco só ocorre na
  // estreia da cena. Revisita não passa por aqui.
  const sceneMilestone = coloring60JourneyActive
    ? getColoring60MilestoneForCompletedScene(story?.id, numeroCena)
    : null;
  const [showMilestoneInvite, setShowMilestoneInvite] = useState(false);

  // Fase 2B.6 (RP3): revalida ACESSO ao FOCAR (não só no mount) — protege expiração
  // durante o uso. Ao redirecionar, a tela desmonta e o AudioPlayer pausa no cleanup do
  // unmount (áudio premium não continua tocando após o bloqueio).
  useFocusEffect(
    useCallback(() => {
      if (canOpenStoryFullExperience(story)) return;
      // B1: separa trava de PLANO de falta de MÍDIA.
      //   premium → Área dos Pais (upsell legítimo);
      //   media/coming_soon → volta, sem paywall enganoso por falta de mídia.
      if (getStoryLockReason(story) === 'premium') {
        navigation.replace('ParentArea');
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Home');
      }
    }, [story]),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const guiaFade = useRef(new Animated.Value(0)).current;
  const guiaSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(guiaFade, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.timing(guiaSlide, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  }, [cenaIndex]);

  // Reexibe a celebração ao voltar de uma ação secundária (visita), enquanto o
  // hub ainda não foi encerrado pela ação principal.
  useFocusEffect(useCallback(() => {
    if (celebrationPendingRef.current && !celebrationHandledRef.current) {
      setShowCelebration(true);
    }
  }, []));

  // ── Navegação segura ──
  function handleVoltar() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('StoryDetail', { story });
  }

  function handleInicio() {
    navigation.navigate('Home');
  }

  function handleCenaAnterior() {
    if (cenaIndex <= 0) return;
    // replace mantém a pilha limpa; não conclui cena, não dá estrela, não abre colorir
    navigation.replace('Narration', { story, cenaIndex: cenaIndex - 1 });
  }

  function goToNext() {
    if (isLastCena) navigation.navigate('Congrats', { story });
    else navigation.replace('Narration', { story, cenaIndex: cenaIndex + 1 });
  }

  // ── Conclusão da cena (caminho principal) ──
  async function handleConcluirCena() {
    if (!canOpenStoryFullExperience(story)) return;
    // salvarCena é idempotente: não duplica estrela se a cena já estava concluída
    await salvarCena(cena.id);
    refreshProgress();
    // Última cena: conduz direto para o hub final (CongratsScreen), sem duplicar
    // o modal comum por cena com a tela final.
    if (isLastCena) {
      goToNext();
      return;
    }

    // [C60-MODAL-ÚNICO] A cena JÁ está registrada (salvarCena/refreshProgress acima). Agora UMA decisão
    // pura (`derivePostSceneExperience`) escolhe a experiência pós-cena: OU o convite do marco, OU a
    // celebração genérica — jamais as duas (fim do modal duplo). CAMINHO A (marco elegível + atividade
    // incompleta + convite não visto) ⇒ abre SOMENTE o convite; a celebração genérica não aparece nem
    // antes nem depois. CAMINHO B (cena comum, ou atividade já concluída, ou convite já visto) ⇒
    // celebração de sempre. O estado de conclusão/convite é lido AQUI, no instante da decisão — nunca
    // derivado do texto de um botão.
    if (sceneMilestone) {
      const [activityAlreadyComplete, inviteAlreadySeen] = await Promise.all([
        loadColoring60Done(story.id, sceneMilestone.activityId),
        hasSeenColoring60MilestoneInvite(story.id, sceneMilestone.activityId),
      ]);
      const experience = derivePostSceneExperience({
        milestone: sceneMilestone,
        activityAlreadyComplete,
        inviteAlreadySeen,
      });
      if (experience === C60_POST_SCENE.COLORING_MILESTONE_INVITE) {
        // Marca "visto" no INSTANTE da apresentação (não antes; não à espera da escolha da criança).
        // Best-effort e à prova de falha: uma escrita que falhe não quebra a história nem bloqueia a
        // próxima cena — a guarda de sessão do módulo já evita repetição imediata mesmo sem disco.
        markColoring60MilestoneInviteSeen(story.id, sceneMilestone.activityId);
        setShowMilestoneInvite(true);
        return;
      }
    }

    celebrationHandledRef.current = false;
    celebrationPendingRef.current = true;
    setShowCelebration(true);
  }

  function handleContinue() {
    if (celebrationHandledRef.current) return;
    celebrationHandledRef.current = true;
    celebrationPendingRef.current = false;
    setShowCelebration(false);
    // [C60-MODAL-ÚNICO] A celebração genérica só é exibida no CAMINHO B; sua ação principal apenas
    // AVANÇA a história. A decisão de mostrar o convite do marco acontece ANTES, em handleConcluirCena
    // — aqui não há mais interceptação por marco (o modal duplo deixou de existir). O convite tem seus
    // próprios botões (handleMilestoneAccept / handleMilestoneSkip).
    goToNext();
  }

  // [C60-MARCO] "Colorir agora": abre o editor daquele marco pelo CONTRATO CENTRAL de navegação
  // (nada de navigation.navigate espalhado). O planner consome ESTA narração (replace), então não há
  // acúmulo de pilha. Passa o alvo de RETOMADA — resumeCenaIndex = próxima cena (0-based) = decisão
  // do fundador Q1 ("Próxima cena da história") — para que "Voltar à aventura" do editor retome a
  // história na cena seguinte com um mount fresco de Narration.
  function handleMilestoneAccept() {
    if (!sceneMilestone) { goToNext(); return; }
    setShowMilestoneInvite(false);
    c60OpenEditorFromMilestone(navigation, {
      storyId: story.id,
      activityId: sceneMilestone.activityId,
      story,
      resumeCenaIndex: sceneMilestone.resumeScene - 1,
    });
  }

  // [C60-MARCO] "Agora não, continuar": pular é SEMPRE permitido — segue a história para a próxima
  // cena, exatamente o goToNext de sempre. Nada se perde: a criança ainda alcança o Colorir pela
  // jornada da StoryDetail.
  function handleMilestoneSkip() {
    setShowMilestoneInvite(false);
    goToNext();
  }

  // Rótulo + ação do botão principal conforme o estado da cena
  let primaryLabel;
  let primaryAction;
  if (isLastCena) {
    // M2d: última cena — ação/rótulo explícitos de finalização da história.
    //   NÃO concluída → conclui a cena (salvarCena idempotente = a própria estrela da cena) e
    //     segue para o Congrats. NÃO há estrela extra de conclusão da história.
    //   JÁ concluída (revisita) → apenas VÊ a conclusão: sem nova estrela, sem recompensa.
    // Sem auto-finalizar: só avança por toque do usuário (handleConcluirCena / goToNext).
    if (!jaConcluida) {
      primaryLabel = 'Concluir história ⭐';
      primaryAction = handleConcluirCena;
    } else {
      primaryLabel = 'Ver conclusão →';
      primaryAction = goToNext;
    }
  } else if (!jaConcluida) {
    primaryLabel = 'Concluir cena ⭐';
    primaryAction = handleConcluirCena;
  } else {
    primaryLabel = 'Próxima cena →';
    primaryAction = goToNext;
  }

  // ── Fallback: story sem cenas (ex: objeto de navegação incompleto) ──────────
  if (!hasCenas) {
    return (
      <View style={styles.wrapper}>
        <SafeScreenHeader
          title={story?.titulo || 'Aventura'}
          onBack={handleVoltar}
          showHome
          onHome={handleInicio}
        />
        <View style={styles.fallback}>
          <Text style={styles.fallbackEmoji}>🌟</Text>
          <Text style={styles.fallbackTitle}>Ops!</Text>
          <Text style={styles.fallbackMsg}>
            Não conseguimos abrir essa aventura agora.
          </Text>
          <TouchableOpacity
            style={styles.fallbackBtn}
            onPress={handleVoltar}
            activeOpacity={0.85}
          >
            <Text style={styles.fallbackBtnText}>Voltar para as aventuras</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* ── HEADER seguro: Voltar · título · 🏠 Início ── */}
      <SafeScreenHeader
        title={story.titulo}
        onBack={handleVoltar}
        showHome
        onHome={handleInicio}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── 1. PROGRESSO DA HISTÓRIA ── */}
          <View style={styles.progressArea}>
            <ProgressBar current={numeroCena - 1} total={totalCenas} />
            <Text style={styles.cenaLabel}>
              Cena {numeroCena} de {totalCenas}
            </Text>
          </View>

          {/* ── 2. BENI GUIA COMPACTO ── */}
          <Animated.View
            style={[
              styles.beniArea,
              { opacity: guiaFade, transform: [{ translateY: guiaSlide }] },
            ]}
          >
            <BeniGuideBubble message={beniMessage} avatarVariant="reading" tone="blue" compact />
          </Animated.View>

          {/* ── 3. VISUAL DA CENA ── */}
          <StorySceneVisual
            scene={cena}
            story={story}
            officialIllustration={officialIllustration}
            officialFallback={officialFallback}
            storyCover={storyCover}
            sceneNumber={numeroCena}
            totalScenes={totalCenas}
          />

          {/* ── 4 + 5. TÍTULO + TEXTO DA CENA ── */}
          <View style={styles.narrCard}>
            <Text style={styles.narrTitulo}>{tituloCena}</Text>
            <Text style={styles.narracao}>{textoNarracao}</Text>
          </View>

          {/* ── 6. ÁUDIO (real) ou aviso discreto de áudio futuro ── */}
          {hasSceneAudio(story.id, sceneKey) && isFocused ? (
            <AudioPlayer audioAsset={resolvedAudioAsset} />
          ) : (
            <View style={styles.noAudioHint}>
              <Text style={styles.noAudioHintText}>
                🔇 O som desta cena será adicionado depois. Você pode ler com calma.
              </Text>
            </View>
          )}

          {/* ── 7. AÇÃO PRINCIPAL — concluir / avançar a cena ── */}
          <SoundButton
            style={styles.primaryBtn}
            onPress={primaryAction}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7C3AED', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
            </LinearGradient>
          </SoundButton>

          {/* ── 8. CENA ANTERIOR — secundário, só a partir da cena 2 ──
              [P3J] O convite ao Colorir por cena foi APOSENTADO: não há card de colorir aqui,
              nem em nenhuma outra história. Nada ocupa este espaço — sem placeholder, sem
              bloqueio, sem "em breve". O colorir do produto é o "Colorir com o Beni", que
              entra pelos marcos narrativos (modal abaixo) e pela jornada da StoryDetail. */}
          {cenaIndex > 0 && (
            <SoundButton
              style={styles.prevLink}
              onPress={handleCenaAnterior}
              activeOpacity={0.8}
            >
              <Text style={styles.prevLinkText}>‹ Cena anterior</Text>
            </SoundButton>
          )}

        </Animated.View>
      </ScrollView>

      <UnlockCelebration
        visible={showCelebration}
        onContinue={handleContinue}
        sceneNumber={numeroCena}
        totalCenas={totalCenas}
      />

      {/* [C60-MODAL-ÚNICO] Convite do Beni por marco (cena 2/7/9 de "A Criação"). É o ÚNICO modal
          pós-cena nos marcos elegíveis — NO LUGAR da celebração genérica, nunca junto dela;
          handleConcluirCena decide qual dos dois mostrar. O componente não renderiza nada quando não
          há copy/marco. */}
      <Coloring60MilestoneInvite
        visible={showMilestoneInvite}
        activityId={sceneMilestone?.activityId ?? null}
        onAccept={handleMilestoneAccept}
        onSkip={handleMilestoneSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingBottom: 0 },

  // Header customizado (sem nomes internos de rota)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: colors.cardBg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  headerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  headerBtnText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.primary, fontWeight: '700',
  },
  headerHomeText: {
    fontFamily: 'FredokaOne', fontSize: 14, color: colors.primary,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'FredokaOne', fontSize: 16, color: colors.text,
    textAlign: 'center', marginHorizontal: 6,
  },

  progressArea: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 4 },
  cenaLabel: {
    fontFamily: 'Nunito', fontSize: 13, color: colors.textLight,
    textAlign: 'center', marginTop: 8,
  },

  beniArea: {
    marginHorizontal: 16,
    marginBottom: 8,
  },

  noAudioHint: {
    marginHorizontal: 20,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F0FF',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  noAudioHintText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    fontStyle: 'italic',
  },

  narrCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20, marginHorizontal: 16, marginBottom: 10,
    padding: 20, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  narrTitulo: {
    fontFamily: 'FredokaOne', fontSize: 17, color: colors.primary,
    marginBottom: 10,
  },
  narracao: {
    fontFamily: 'Nunito', fontSize: 18, color: colors.text,
    lineHeight: 30, textAlign: 'left',
  },

  // Ação principal — concluir / avançar (botão forte)
  primaryBtn: {
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 999, overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  primaryBtnGradient: {
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF' },

  // Cena anterior — o mais discreto
  prevLink: {
    marginTop: 14, alignSelf: 'center',
    paddingVertical: 6, paddingHorizontal: 12,
  },
  prevLinkText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.textLight, fontWeight: '700',
  },

  // Fallback: story sem cenas
  fallback: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fallbackEmoji: { fontSize: 56, marginBottom: 12 },
  fallbackTitle: {
    fontFamily: 'FredokaOne', fontSize: 26, color: colors.text, marginBottom: 8,
  },
  fallbackMsg: {
    fontFamily: 'Nunito', fontSize: 16, color: colors.textLight,
    textAlign: 'center', lineHeight: 24, marginBottom: 24,
  },
  fallbackBtn: {
    backgroundColor: colors.action,
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28,
    elevation: 3,
    shadowColor: colors.action, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 5,
  },
  fallbackBtnText: {
    fontFamily: 'FredokaOne', fontSize: 17, color: '#FFFFFF',
  },
});
