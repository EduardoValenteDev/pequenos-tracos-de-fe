import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Modal,
  Animated, StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStoryPackDownload } from '../hooks/useStoryPackDownload';
import { hasSavedDrawing } from '../services/drawingStorage';
import { preloadStorySceneIllustrations } from '../services/storyImageService';
import { hasAccess } from '../services/accessControl';
import { isStoryComingSoon, getStoryAccessStatus } from '../services/contentAccessService';
import { getStoryJourneyStatus, sceneVisualStatus } from '../services/storyJourneyService';
import { hasStoryColoringActivityDone } from '../services/coloringActivityService';
// [C60-PONTE] Em "A Criação" com o piloto ativo, coloringComplete vem da jornada Colorir 60 (ponte
// READ-ONLY), não da fonte legada por cena. Falha de leitura preserva o valor atual (não força false).
import { loadStoryColoringCompletionState } from '../services/storyColoringCompletion';
import { useProgressContext } from '../context/ProgressContext';
import { isQuizDone, getReflection, isStoryBookOpened } from '../services/postStoryStorage';
import StoryBookHero from '../components/story/StoryBookHero';
import SceneListItem from '../components/story/SceneListItem';
import { LumiEmptyState } from '../components/lumi';
import { BeniGuideBubble, BeniAvatar } from '../components/beni';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import ContentContainer from '../components/ui/ContentContainer';
import BotaoPrimario from '../components/ui/BotaoPrimario';
import { color } from '../theme/tokens';
// Piloto "Colorir com o Beni" (Colorir 60) — SÓ na jornada de "A Criação", gated pela flag do
// piloto OU por Dev Client + ferramentas internas (mesmo mecanismo único de `isColoring60PilotAllowed`).
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';
import { getColoring60Activities } from '../data/coloring60Catalog';
import { loadColoring60Done } from '../services/coloring60ActivityService';
import {
  hasSeenCreationColoringInvite, markCreationColoringInviteSeen,
} from '../services/coloring60JourneyInvite';
import CreationColoringJourneySection from '../components/coloring60/CreationColoringJourneySection';
// [C60-PARTE-7] A coleção tem rota própria; o nome vem da fonte única de rotas.
// [C60-NAV] CONTRATO ÚNICO de navegação do piloto (FLUXO 1): as entradas "Colorir" e "Ver minha
// coleção" partem daqui por destino semântico, dedup por rota. Ver src/services/coloring60Navigation.
import { c60OpenEditorFromStory, c60OpenCollectionFromStory } from '../services/coloring60Navigation';

const CREATION_STORY_ID = 'creation';

function PostStoryCard({ emoji, title, desc, done, tagColor, onPress, isTablet }) {
  return (
    <SoundButton
      style={[styles.postCard, done && styles.postCardDone, isTablet && styles.postCardTablet]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.postCardIcon, { backgroundColor: tagColor + '22' }]}>
        <Text style={styles.postCardEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.postCardTitle}>{title}</Text>
      {desc ? <Text style={styles.postCardDesc}>{desc}</Text> : null}
      {done && (
        <View style={styles.postCardBadge}>
          <Text style={styles.postCardBadgeText}>✓</Text>
        </View>
      )}
    </SoundButton>
  );
}

export default function StoryDetailScreen({ route, navigation }) {
  const { story } = route.params;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;

  // [P4 · FONTE ÚNICA] O progresso de cenas desta tela vem do ProgressContext — a MESMA fonte que a
  // NarrationScreen atualiza (refreshProgress após salvar cada cena) — e não mais de uma leitura
  // própria só-no-mount (useProgress lia o AsyncStorage uma vez no useEffect de montagem e nunca
  // revia). Sem isto, ao SAIR da história antes do fim a StoryDetail seguia mostrando o "N de 10", o
  // passo recomendado e o selo do ESTADO ANTIGO até sair ao Mapa e reentrar (defeito físico observado).
  // O formato é idêntico ao do useProgress ({ [cenaId]: true }): getStoryProgress devolve o mesmo
  // objeto salvo por cena; a contagem usa a mesma derivação Object.values(...).filter(Boolean).length.
  const {
    isStorySequenceUnlocked,
    getStoryProgress,
    getCompletedScenesCount,
    refreshProgress,
  } = useProgressContext();
  const progresso = getStoryProgress(story.id);
  const progressCount = getCompletedScenesCount(story.id);
  const totalScenes = story.totalCenas ?? 0;
  const xpPercent = totalScenes > 0 ? progressCount / totalScenes : 0;
  const isCompleted = progressCount >= totalScenes && totalScenes > 0;

  // §8 · Piloto "Colorir com o Beni": visível SÓ na jornada de "A Criação" e SÓ quando o piloto
  // pode aparecer — a flag oficial ligada OU Dev Client (__DEV__) com ferramentas internas ativas.
  // Espelha EXATAMENTE `isColoring60PilotAllowed()` da ColoringScreen (mesmo mecanismo único, sem
  // flag paralela). Com a flag `false` em produção, este valor é `false` e a seção some por completo
  // — o parâmetro de rota sozinho nunca autoriza, e a própria ColoringScreen revalida na entrada.
  const creationColoringVisible =
    story.id === CREATION_STORY_ID &&
    (COLORIR_60_CREATION_PILOT_ENABLED ||
      (typeof __DEV__ !== 'undefined' && __DEV__ === true && isInternalToolsEnabled()));

  // B1: "Em breve" inclui histórias sem mídia suficiente (não só catálogo).
  const isComingSoon = isStoryComingSoon(story);
  const canAccess = hasAccess(story);
  // A0.10: sequência da jornada — só abre se a história ANTERIOR estiver journeyComplete.
  const sequenceUnlocked = isStorySequenceUnlocked(story.id);
  // Fase 2B: estado de download do pack remoto vem do hook dedicado em src/hooks; a tela
  // consome só esse hook e não acessa o runtime de conteúdo diretamente (guardrail preservado).
  // O bloco de download só aparece p/ premium-active (canAccess) + história remote (hook.isRemote).
  const packDownload = useStoryPackDownload(story.id);
  // Fase 2B.6 (RP1): download só p/ história premium remote LIBERADA pela jornada.
  // sequenceUnlocked = história atual da jornada OU já concluída (exclui futuras bloqueadas)
  // → permite baixar/rebaixar concluídas e a atual; bloqueia download em massa de futuras.
  const canDownload = canAccess && packDownload.isRemote && !isComingSoon && sequenceUnlocked;

  const [savedDrawings, setSavedDrawings] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [bookOpened, setBookOpened] = useState(false);
  const [coloringDone, setColoringDone] = useState(false);

  // §5/§10 · Estado REAL das 3 atividades do Colorir 60, derivado SEMPRE da CONCLUSÃO canônica
  // (loadColoring60Done) — nunca da existência do PNG. O writer de pixels (coloring60DrawingStorage)
  // é arquiteturalmente ISOLADO ao ColoringScreen (guard C60-P3→P4.T2 do smoke); a jornada não o
  // consulta. Por isso os estados aqui são Bloqueado / Novo / Concluído (sem "Em andamento", que
  // exigiria ler o storage do writer). O progresso "N de 3" e o passo recomendado vêm só da conclusão.
  const [c60Done, setC60Done] = useState({});
  // §7 · convite do Beni (após terminar a história pela 1ª vez), exibido UMA única vez.
  const [inviteVisible, setInviteVisible] = useState(false);

  // Preload leve das ilustrações oficiais da história atual (reduz atraso visual
  // ao abrir as cenas). Fire-and-forget; no-op se a história ainda não tem artes.
  useEffect(() => {
    if (story?.id) preloadStorySceneIllustrations(story.id);
  }, [story?.id]);

  useEffect(() => {
    if (!story.cenas?.length) return;
    async function checkDrawings() {
      const result = {};
      for (const cena of story.cenas) {
        result[cena.id] = await hasSavedDrawing(story.id, cena.id);
      }
      setSavedDrawings(result);
    }
    checkDrawings();
  }, [progressCount]);

  // [P4 · REVALIDAÇÃO COMPLEMENTAR] Ao focar (voltar da história ou do Colorir), revalida o progresso
  // na fonte única. A sincronização PRIMÁRIA já vem da NarrationScreen (refreshProgress após cada cena
  // salva); esta é a rede complementar para qualquer caminho que não passe por lá. refreshProgress é
  // estável (loadAll com deps []), então o efeito roda uma vez por foco — sem laço de re-render.
  useFocusEffect(
    useCallback(() => { refreshProgress(); }, [refreshProgress]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isCompleted) return;
      isQuizDone(story.id).then(setQuizDone);
      getReflection(story.id).then(r => setReflectionDone(!!r));
      isStoryBookOpened(story.id).then(setBookOpened);
      // [C60-PONTE] "A Criação" (piloto) tira coloringComplete da jornada Colorir 60; as demais
      // histórias — e "A Criação" com o piloto off — mantêm a fonte legada por cena. `creationColoringVisible`
      // é exatamente o gate do piloto. Falha de leitura PRESERVA o valor atual (não chama setColoringDone).
      if (creationColoringVisible) {
        loadStoryColoringCompletionState(story.id).then((r) => {
          if (r.applicable && !r.readFailed) setColoringDone(r.coloringComplete === true);
        });
      } else {
        hasStoryColoringActivityDone(story.id).then(setColoringDone);
      }
    }, [story.id, isCompleted, creationColoringVisible]),
  );

  // §5/§10 · Carrega a CONCLUSÃO real das 3 atividades ao focar a tela (reflete conclusões feitas no
  // ColoringScreen e o retorno da celebração por "Voltar à aventura"/"Ver meus desenhos"). Só quando
  // a seção pode aparecer; caso contrário nem toca no service de conclusão do Colorir 60. Lê APENAS a
  // conclusão (loadColoring60Done) — jamais o writer de pixels, isolado ao ColoringScreen.
  useFocusEffect(
    useCallback(() => {
      if (!creationColoringVisible) return undefined;
      let active = true;
      (async () => {
        const activities = getColoring60Activities(CREATION_STORY_ID);
        const done = {};
        for (const activity of activities) {
          done[activity.activityId] = await loadColoring60Done(CREATION_STORY_ID, activity.activityId);
        }
        if (active) setC60Done(done);
      })();
      return () => { active = false; };
    }, [creationColoringVisible, isCompleted]),
  );

  // §7 · Convite do Beni: aparece UMA vez, quando a criança já terminou a história (isCompleted) e
  // o convite ainda não foi mostrado. Marca como visto no MESMO instante em que decide exibir, para
  // nunca repetir a cada reabertura da cena 10. Registro próprio (coloring60JourneyInvite), separado
  // do progresso e da conclusão. Fora do gate/isCompleted, nunca aparece.
  useFocusEffect(
    useCallback(() => {
      if (!creationColoringVisible || !isCompleted) return undefined;
      let active = true;
      hasSeenCreationColoringInvite().then((seen) => {
        if (active && !seen) {
          setInviteVisible(true);
          markCreationColoringInviteSeen();
        }
      });
      return () => { active = false; };
    }, [creationColoringVisible, isCompleted]),
  );

  // A0.10: status público via FONTE ÚNICA (storyJourneyService) — mesma regra do
  // mapa e do card. journeyComplete = cenas + Livrinho + quiz + reflexão + colorir
  // (≥1 página). O progresso de cenas ("10/10") segue separado (journey.progress) e
  // NÃO dispara o selo "Concluída" sozinho.
  const journey = getStoryJourneyStatus({
    totalScenes,
    sceneDoneCount: progressCount,
    postStoryStatus: { storyBookOpened: bookOpened, quizDone, reflectionDone },
    coloringComplete: coloringDone,
    accessStatus: getStoryAccessStatus(story),
    accessType: story.accessType,
    isFirstStory: true, // sequência tratada à parte (sequenceUnlocked)
  });
  const isFullyComplete = journey.journeyComplete;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const startCenaIndex = progressCount > 0 && !isCompleted ? progressCount : 0;

  function getPrimaryLabel() {
    // A0.5: sentence case, SEM emoji de UI (Lei 3). Terracota é a única cor de ação.
    // A0.10: sequência primeiro (jornada não chegou → "Complete a aventura anterior",
    // desabilitado). "Rever a aventura" SÓ com journeyComplete. Cenas completas mas
    // jornada pendente → "Continuar aventura".
    if (isComingSoon) return 'Em breve';
    if (!sequenceUnlocked) return 'Complete a aventura anterior';
    if (!canAccess) return 'Pedir ao responsável';
    if (isFullyComplete) return 'Rever a aventura';
    if (progressCount > 0) return 'Continuar aventura';
    return 'Começar a história';
  }

  // Fase 2B.6 (RP3): navega p/ conteúdo premium só com canAccess; senão → Área dos Pais.
  // Guard obrigatório ANTES de navegar — vale inclusive p/ história concluída (isCompleted),
  // sem depender apenas do guard da tela seguinte.
  function goToPremium(routeName, params) {
    if (!canAccess) { navigation.navigate('ParentArea'); return; }
    navigation.navigate(routeName, params);
  }

  function handlePrimary() {
    if (isComingSoon) return;
    if (!sequenceUnlocked) return; // jornada não chegou — ação bloqueada (botão desabilitado)
    if (isCompleted) {
      goToPremium('Narration', { story, cenaIndex: 0 });
      return;
    }
    goToPremium('Narration', { story, cenaIndex: startCenaIndex });
  }

  // Fase 2B.7.3a: delega a decisão VISUAL à função pura (o progresso reflete o histórico REAL,
  // mesmo sem acesso ativo). A PERMISSÃO de abrir NÃO muda: cena concluída segue clicando em
  // goToPremium → ParentArea sem acesso; não concluída fica bloqueada. Só o rótulo muda.
  function getSceneStatus(cena, index) {
    return sceneVisualStatus({
      isComingSoon,
      isDone: progresso[cena.id] === true, // progresso REAL salvo (ProgressContext · fonte única), independe de canAccess
      canAccess,
      isCurrent: index === progressCount,
    });
  }

  // §12 · A Criação é GRÁTIS: todas as crianças abrem as 3 atividades — SEM gate de plano aqui
  // (o ColoringScreen trata plano internamente: Grátis conclui sem persistir; Família persiste).
  // NÃO passa o `story` completo nem cria rota nova: só (storyId, activityId). O retorno da
  // celebração ("Voltar à aventura"/"Ver meus desenhos") volta a ESTA tela pelo goBack já existente.
  function openCreationColoring(activityId) {
    c60OpenEditorFromStory(navigation, CREATION_STORY_ID, activityId);
  }

  // [C60-PARTE-7] "Ver minha coleção" (cartão em 3 de 3). A coleção é uma TELA PRÓPRIA e lê tudo do
  // armazenamento: por isso NÃO recebe atividade nenhuma. Antes ela abria a tela de colorir na última
  // parte pedindo uma camada por cima — e a mesma coleção mudava de fundo e de composição conforme a
  // parte de origem. Agora a entrada é a mesma venha de onde vier: só a história.
  // Abrir a coleção NÃO conclui nada e NÃO repete a grande conclusão.
  function openCreationColoringCollection() {
    c60OpenCollectionFromStory(navigation, CREATION_STORY_ID);
  }

  // §7 · "Colorir agora": abre a PRIMEIRA atividade ainda não concluída (ordem do catálogo); se
  // nada foi iniciado, começa por "Haja luz" (light). Fecha o convite antes de navegar.
  function handleInviteColorNow() {
    setInviteVisible(false);
    const activities = getColoring60Activities(CREATION_STORY_ID);
    const firstNotDone = activities.find((a) => c60Done[a.activityId] !== true) ?? activities[0];
    openCreationColoring(firstNotDone?.activityId ?? 'light');
  }

  // §7 · "Continuar depois": não força pintura; volta para a jornada com a seção disponível.
  function handleInviteLater() {
    setInviteVisible(false);
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── STORY BOOK HERO (A0.5) — hero de exibição em papel/tinta ── */}
          <StoryBookHero
            story={story}
            progressCount={progressCount}
            totalScenes={totalScenes}
            isTablet={isTablet}
            isFullyComplete={isFullyComplete}
            isComingSoon={isComingSoon}
            isLocked={!canAccess}
          />

          {/* ── AÇÃO PRINCIPAL (A0.5) — BotaoPrimario terracota, centralizado no
              tablet/iPad via ContentContainer. Toda a lógica de acesso/navegação
              (handlePrimary) permanece intacta. ── */}
          <ContentContainer style={styles.ctaWrap}>
            <BotaoPrimario
              label={getPrimaryLabel()}
              onPress={handlePrimary}
              disabled={isComingSoon || !sequenceUnlocked}
              style={styles.ctaBtn}
            />
          </ContentContainer>

          {/* ── Fase 2B: download de pack remoto (só premium-active + história remote) ── */}
          {canDownload && (
            <ContentContainer style={styles.downloadWrap}>
              {packDownload.uiState === 'ready' ? (
                <Text style={styles.downloadReady}>Baixado ✓ · funciona offline</Text>
              ) : packDownload.uiState === 'downloading' ? (
                <View style={styles.downloadBox}>
                  <Text style={styles.downloadLabel}>Baixando… {Math.round(packDownload.progress * 100)}%</Text>
                  <View style={styles.downloadTrack}>
                    <View style={[styles.downloadFill, { width: `${Math.round(packDownload.progress * 100)}%` }]} />
                  </View>
                </View>
              ) : (
                <SoundButton
                  style={styles.downloadBtn}
                  onPress={packDownload.uiState === 'error' ? packDownload.retry : packDownload.download}
                  activeOpacity={0.85}
                >
                  <Text style={styles.downloadBtnText}>
                    {packDownload.uiState === 'error' ? 'Não foi possível baixar. Tentar de novo' : 'Baixar história (usar offline)'}
                  </Text>
                </SoundButton>
              )}
            </ContentContainer>
          )}

          {/* ── ENTRADA GUIADA PELO BENI ── */}
          {!isComingSoon && (
            <ContentContainer style={styles.beniWrap}>
              <BeniGuideBubble
                message={
                  !canAccess
                    ? getBeniGuideMessage('premiumBlocked')
                    : isCompleted
                      ? getBeniGuideMessage('storyCompleted')
                      : progressCount > 0
                        ? getBeniGuideMessage('continueStory')
                        : getBeniGuideMessage('storyIntro')
                }
                avatarVariant={isCompleted ? 'celebrating' : !canAccess ? 'thinking' : 'pointing'}
                tone={!canAccess ? 'yellow' : 'soft'}
                compact
                style={styles.beniEntry}
              />
            </ContentContainer>
          )}

          {/* ── PÓS-CENAS — pendências da jornada (Livrinho, Quiz, Guardar, Colorir) ── */}
          {/* A0.10: cabeçalho só diz "Aventura concluída!" quando journeyComplete
              (cenas + Livrinho + quiz + reflexão + colorir). Com apenas as cenas,
              evita "Concluída" e conduz às atividades pendentes (✓ em cada card já
              feito). Gradiente em AZUL-NOITE (tokens) — roxo aposentado (Lei 9). */}
          {isCompleted && (
            <View style={styles.completedSection}>
              <LinearGradient
                colors={[color.night800, color.night600]}
                style={styles.completedHeader}
              >
                <Text style={styles.completedEmoji}>{isFullyComplete ? '🎉' : '🎬'}</Text>
                <Text style={styles.completedTitle}>
                  {isFullyComplete ? 'Aventura concluída!' : 'Você terminou as cenas!'}
                </Text>
                <Text style={styles.completedSub}>
                  {isFullyComplete
                    ? 'Agora escolha uma atividade especial.'
                    : 'Ainda falta completar as atividades da aventura.'}
                </Text>
              </LinearGradient>
              <View style={[styles.completedCards, isTablet && styles.completedCardsTablet]}>
                <PostStoryCard
                  emoji="📖"
                  title="Livrinho da Fé"
                  desc="Ver minha história colorida"
                  done={bookOpened}
                  tagColor={color.night600}
                  isTablet={isTablet}
                  onPress={() => goToPremium('StoryBook', { story })}
                />
                <PostStoryCard
                  emoji="⭐"
                  title="Quiz"
                  desc="Responder perguntas"
                  done={quizDone}
                  tagColor={color.gold500}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('Quiz', { story })}
                />
                <PostStoryCard
                  emoji="✨"
                  title="Guardar no coração"
                  desc="O que ficou no coração"
                  done={reflectionDone}
                  tagColor={color.terra500}
                  isTablet={isTablet}
                  onPress={() => navigation.navigate('Reflection', { story })}
                />
                {/* P10 · PARTE 1 · Colorir LEGADO oculto SÓ quando a jornada "Colorir com o Beni"
                    está visível (história "A Criação" + piloto autorizado): ali a seção nova é a
                    ÚNICA porta de entrada do colorir, e ver dois "Colorir" ao mesmo tempo confundia.
                    Fora desse caso (qualquer outra história OU piloto desligado) o card legado
                    continua EXATAMENTE como antes — rota, storage e desenhos legados intactos. */}
                {!creationColoringVisible && (
                  <PostStoryCard
                    emoji="🎨"
                    title="Colorir"
                    desc="Pintar uma cena"
                    done={coloringDone}
                    tagColor={color.gold300}
                    isTablet={isTablet}
                    onPress={() => goToPremium('Narration', { story, cenaIndex: 0 })}
                  />
                )}
              </View>
            </View>
          )}

          {/* ── COLORIR COM O BENI (piloto "A Criação") ──
              Fora do `{isCompleted && ...}`: aparece ANTES da história (trava suave, §6) e
              DEPOIS (liberada, §5). Gate próprio (`creationColoringVisible`) — invisível em
              produção com a flag `false`. Estado REAL das 3 atividades vem por props. */}
          {creationColoringVisible && (
            <CreationColoringJourneySection
              unlocked={isCompleted}
              isTablet={isTablet}
              doneMap={c60Done}
              onOpenActivity={openCreationColoring}
              onOpenCollection={openCreationColoringCollection}
            />
          )}

          {/* ── LISTA DE CENAS ── */}
          {story.cenas?.length > 0 ? (
            <View style={[styles.scenesSection, isTablet && styles.scenesSectionTablet]}>
              <Text style={styles.scenesTitle}>Cenas da aventura</Text>
              {story.cenas.map((cena, index) => (
                <SceneListItem
                  key={cena.id}
                  cena={cena}
                  index={index}
                  status={getSceneStatus(cena, index)}
                  hasDrawing={savedDrawings[cena.id] === true && !creationColoringVisible}
                  onPress={() => goToPremium('Narration', { story, cenaIndex: index })}
                />
              ))}
            </View>
          ) : isComingSoon ? (
            <View style={styles.emptySection}>
              <LumiEmptyState
                title="Essa história está sendo preparada!"
                message="Em breve você vai poder explorar todas as cenas dessa aventura com Beni."
              />
            </View>
          ) : null}

        </Animated.View>
      </ScrollView>

      {/* §7 · Convite do Beni após terminar a história (uma vez). Overlay leve; "Continuar depois"
          não força pintura. Só existe sob o gate do piloto. */}
      {creationColoringVisible && (
        <Modal
          visible={inviteVisible}
          transparent
          animationType="fade"
          onRequestClose={handleInviteLater}
        >
          <View style={styles.inviteBackdrop}>
            <View style={styles.inviteCard}>
              <BeniAvatar variant="celebrating" size="large" />
              <Text style={styles.inviteTitle}>Agora vamos colorir o que aprendemos?</Text>
              <Text style={styles.inviteSupport}>
                A luz, a vida e o cuidado de Deus estão esperando suas cores!
              </Text>
              <BotaoPrimario
                label="Colorir agora"
                onPress={handleInviteColorNow}
                style={styles.invitePrimary}
              />
              <SoundButton
                style={styles.inviteSecondary}
                onPress={handleInviteLater}
                activeOpacity={0.8}
              >
                <Text style={styles.inviteSecondaryText}>Continuar depois</Text>
              </SoundButton>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: color.paper50 }, // A0.5: fundo papel (Lei 7)
  ctaWrap: { marginHorizontal: 20, marginTop: 18 },
  // A0.5 ajuste: botão mais elegante — largura capada e centralizada (não full-bleed,
  // não encosta nas bordas). Mantém alvo 56 e terracota (do BotaoPrimario).
  ctaBtn: { alignSelf: 'center', width: '100%', maxWidth: 340 },

  // Fase 2B — bloco de download de pack remoto (premium-active + história remote).
  // Ação secundária abaixo do CTA; acento azul-noite (mesmo tom da seção "completed").
  downloadWrap: { marginHorizontal: 20, marginTop: 10, alignItems: 'center' },
  downloadReady: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, textAlign: 'center',
  },
  downloadBox: { width: '100%', maxWidth: 340, alignSelf: 'center' },
  downloadLabel: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', marginBottom: 6,
  },
  downloadTrack: {
    height: 8, borderRadius: 4, backgroundColor: pt.border, overflow: 'hidden',
  },
  downloadFill: { height: '100%', borderRadius: 4, backgroundColor: color.night600 },
  downloadBtn: {
    alignSelf: 'center', width: '100%', maxWidth: 340, alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: radii.pill, borderWidth: 1.5, borderColor: color.night600,
    backgroundColor: 'transparent',
  },
  downloadBtnText: {
    fontFamily: 'FredokaOne', fontSize: 15, color: color.night600, textAlign: 'center',
  },

  beniWrap: { marginTop: 2 },
  beniEntry: { marginHorizontal: 16, marginTop: 14 },
  container: { flex: 1 },
  content: {},

  completedSection: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: radii.lg, overflow: 'hidden',
    ...shadows.card,
  },
  completedHeader: {
    paddingVertical: 16, paddingHorizontal: 20,
    alignItems: 'center',
  },
  completedEmoji: { fontSize: 32, marginBottom: 4 },
  completedTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF', marginBottom: 2,
  },
  completedSub: {
    fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.85)',
  },
  completedCards: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 12, gap: 8,
  },
  completedCardsTablet: {
    flexDirection: 'row',
  },
  postCard: {
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1.5, borderColor: pt.border,
    position: 'relative',
  },
  postCardTablet: {
    flex: 1,
  },
  postCardDone: { opacity: 0.7 },
  postCardIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  postCardEmoji: { fontSize: 26 },
  postCardTitle: {
    fontFamily: 'FredokaOne', fontSize: 14, color: pt.text,
    textAlign: 'center', marginBottom: 2,
  },
  postCardDesc: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    textAlign: 'center', lineHeight: 17,
  },
  postCardBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: pt.greenSoft,
    borderRadius: radii.pill,
    width: 22, height: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  postCardBadgeText: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.freeText, fontWeight: '700',
  },

  scenesSection: {
    paddingHorizontal: 16, marginTop: 24,
  },
  scenesSectionTablet: { paddingHorizontal: 24 },
  scenesTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 12,
  },
  emptySection: {
    marginHorizontal: 16, marginTop: 24,
  },

  // §7 — convite do Beni (modal leve). Backdrop suave; cartão em papel; ações claras.
  inviteBackdrop: {
    flex: 1, backgroundColor: 'rgba(20,14,10,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 28,
  },
  inviteCard: {
    width: '100%', maxWidth: 360,
    backgroundColor: color.paper50,
    borderRadius: radii.lg,
    padding: 24, alignItems: 'center',
    ...shadows.card,
  },
  inviteTitle: {
    fontFamily: 'FredokaOne', fontSize: 20, color: pt.text,
    textAlign: 'center', marginTop: 14,
  },
  inviteSupport: {
    fontFamily: 'Nunito', fontSize: 14.5, color: pt.textSoft,
    textAlign: 'center', marginTop: 8, lineHeight: 21,
  },
  invitePrimary: { alignSelf: 'stretch', marginTop: 20 },
  inviteSecondary: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  inviteSecondaryText: {
    fontFamily: 'Nunito', fontSize: 15, color: pt.textSoft, fontWeight: '700',
  },
});
