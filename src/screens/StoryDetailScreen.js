import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Modal,
  Animated, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { warn } from '../utils/logger';
import { useStoryPackDownload } from '../hooks/useStoryPackDownload';
import { preloadStorySceneIllustrations } from '../services/storyImageService';
import { hasAccess } from '../services/accessControl';
import { isStoryComingSoon, getStoryAccessStatus } from '../services/contentAccessService';
import { getStoryJourneyStatus, sceneVisualStatus } from '../services/storyJourneyService';
// [P3J] Mesmo contrato de disponibilidade usado pelo ProgressContext — tela e mapa não podem
// discordar sobre se esta história exige colorir para fechar.
import { isStoryColoringAvailable } from '../services/storyColoringAvailability';
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
import { useWindowBand, BANDS } from '../hooks/useWindowBand';
// Piloto "Colorir com o Beni" (Colorir 60) — SÓ na jornada de "A Criação", gated pela flag do
// piloto OU por Dev Client + ferramentas internas (mesmo mecanismo único de `isColoring60PilotAllowed`).
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';
import { getColoring60Activities } from '../data/coloring60Catalog';
import { loadColoring60Done } from '../services/coloring60ActivityService';
import {
  hasSeenCreationColoringInvite, markCreationColoringInviteSeen,
} from '../services/coloring60JourneyInvite';
// A DECISÃO do convite pós-história (aparecer ou não) e o DESTINO de "Colorir agora" moram no
// serviço puro. Esta tela reúne os fatos e obedece — não guarda uma segunda regra própria.
import {
  deriveColoring60JourneyInvite, deriveColoring60InviteAction,
  orderedCompleted, COLORING60_ACTION,
} from '../services/coloring60Journey';
import CreationColoringJourneySection from '../components/coloring60/CreationColoringJourneySection';
// [C60-PARTE-7] A coleção tem rota própria; o nome vem da fonte única de rotas.
// [C60-NAV] CONTRATO ÚNICO de navegação do piloto (FLUXO 1): as entradas "Colorir" e "Ver minha
// coleção" partem daqui por destino semântico, dedup por rota. Ver src/services/coloring60Navigation.
import { c60OpenEditorFromStory, c60OpenCollectionFromStory } from '../services/coloring60Navigation';
// [FIX 2] A frase de pendência nasce no serviço puro de autorização — a tela não monta gramática
// nem decide o que falta. ROUTES identifica, sem literal solto, qual rota é ENTRADA em conteúdo.
import { describeStorySequenceLock } from '../services/storyContentAuthorization';
import { ROUTES } from '../constants/routes';
import AppScreen from '../components/layout/AppScreen';

const CREATION_STORY_ID = 'creation';

// [P3J-R] VOCABULÁRIO DA FALHA DE DOWNLOAD.
// `DOWNLOAD_BLOCKED_TEXT` = causas em que tocar de novo NÃO resolve → vira texto, sem botão.
// `DOWNLOAD_RETRY_TEXT`   = causas retentáveis → botão, com a frase correspondente à causa.
// A frase histórica ("Não foi possível baixar. Tentar de novo") permanece como PADRÃO para
// qualquer motivo não classificado; o que muda é que ela deixa de cobrir configuração ausente.
const DOWNLOAD_BLOCKED_TEXT = {
  config: 'Download indisponível nesta versão do app (configuração ausente). Não é falta de internet.',
  app_update: 'Atualize o app para baixar esta história.',
};
const DOWNLOAD_RETRY_TEXT = {
  network: 'Sem conexão agora. Tentar de novo',
  insufficient_space: 'Sem espaço no aparelho. Libere espaço e tente de novo',
  default: 'Não foi possível baixar. Tentar de novo',
};

/**
 * Consulta por chave OWN. `error` vem do serviço como string livre; um `reason` que calhe de ser
 * 'constructor'/'toString' devolveria uma FUNÇÃO pelo protótipo e quebraria o render. Mesma
 * doutrina já aplicada aos catálogos do Colorir 60.
 */
function textoPorCausa(mapa, chave, padrao = null) {
  return (typeof chave === 'string' && Object.prototype.hasOwnProperty.call(mapa, chave))
    ? mapa[chave]
    : padrao;
}

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
  // [F6-SG-C · TK-C-003] Decisão discreta ⇒ faixa, não medida. Migração neutra:
  // `MEDIUM` e `EXPANDED` seguem equivalentes, como o antigo `width >= 600`.
  // `isTablet` continua descendo como PROP para `StoryBookHero` e
  // `CreationColoringJourneySection`: eles recebem contrato, não leem janela.
  const { band } = useWindowBand();
  const isTablet = band !== BANDS.COMPACT;

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
    getStoryContentAuthorization,
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
  // [FIX 2] AUTORIZAÇÃO DE ENTRADA NO CONTEÚDO — decisão pronta, vinda da fonte única. Esta tela
  // CONSULTA; não recalcula sequência, regra comercial nem disponibilidade de mídia. Bloquear a
  // entrada NÃO fecha esta tela: os detalhes, a capa e o progresso continuam visíveis.
  const contentAuthorization = getStoryContentAuthorization(story.id);
  const canEnterStoryContent = contentAuthorization.canEnterStoryContent === true;
  // A frase acolhedora que diz o que EXATAMENTE falta na aventura anterior (null quando não há o
  // que dizer — outra razão de bloqueio, progresso ainda carregando ou nada pendente).
  const sequenceLockCopy = describeStorySequenceLock({
    reason: contentAuthorization.reason,
    authorizationReady: contentAuthorization.authorizationReady,
    storyTitle: story.titulo,
    previousStoryTitle: contentAuthorization.previousStoryTitle,
    missingRequirements: contentAuthorization.missingRequirements,
  });
  // Fase 2B: estado de download do pack remoto vem do hook dedicado em src/hooks; a tela
  // consome só esse hook e não acessa o runtime de conteúdo diretamente (guardrail preservado).
  // O bloco de download só aparece p/ premium-active (canAccess) + história remote (hook.isRemote).
  const packDownload = useStoryPackDownload(story.id);
  // Fase 2B.6 (RP1): download só p/ história premium remote LIBERADA pela jornada.
  // sequenceUnlocked = história atual da jornada OU já concluída (exclui futuras bloqueadas)
  // → permite baixar/rebaixar concluídas e a atual; bloqueia download em massa de futuras.
  const canDownload = canAccess && packDownload.isRemote && !isComingSoon && sequenceUnlocked;
  // [P3J-R] A frase da falha passa a DERIVAR da causa. Antes, toda falha — inclusive configuração
  // ausente, que sequer toca a rede — virava "Não foi possível baixar. Tentar de novo", e a família
  // (e o próprio time) lia isso como falta de internet. Estados NÃO-RETENTÁVEIS viram texto, porque
  // tocar de novo não muda nada; os retentáveis continuam botão, com a frase certa.
  const downloadBlockedText = packDownload.uiState === 'error'
    ? textoPorCausa(DOWNLOAD_BLOCKED_TEXT, packDownload.error)
    : (packDownload.configMissing ? DOWNLOAD_BLOCKED_TEXT.config : null);
  const downloadErrorText = textoPorCausa(DOWNLOAD_RETRY_TEXT, packDownload.error, DOWNLOAD_RETRY_TEXT.default);

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

  // [P3J] O varredor de desenhos legados por cena (hasSavedDrawing × N cenas) saiu com o selo
  // "desenho salvo" da lista de cenas: sem Colorir legado, nenhuma cena nova pode receber pintura.
  // Nada foi apagado — drawingStorage segue íntegro; esta tela apenas deixou de lê-lo.

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

  // §5/§7/§10 · Carrega a CONCLUSÃO real das 3 atividades ao focar a tela (reflete conclusões feitas
  // no ColoringScreen e o retorno da celebração por "Voltar à aventura"/"Ver meus desenhos") e, com
  // esse retrato em mãos, decide o convite do Beni. Só quando a seção pode aparecer; caso contrário
  // nem toca no service de conclusão do Colorir 60. Lê APENAS a conclusão (loadColoring60Done) —
  // jamais o writer de pixels, isolado ao ColoringScreen.
  //
  // UM ÚNICO EFEITO, de propósito. Antes eram dois efeitos irmãos: um carregava a conclusão e o
  // outro decidia o convite sem nunca olhar para ela — e podia decidir ANTES de ela chegar. Agora a
  // conclusão vem primeiro e a decisão usa o retrato recém-lido, nunca o estado antigo da tela.
  // A REGRA em si não está aqui: quem decide é `deriveColoring60JourneyInvite` (serviço puro). Esta
  // tela só reúne os fatos, obedece ao resultado e registra o que aconteceu.
  useFocusEffect(
    useCallback(() => {
      if (!creationColoringVisible) return undefined;
      let active = true;
      (async () => {
        const activities = getColoring60Activities(CREATION_STORY_ID);
        const order = activities.map((a) => a.activityId);
        const done = {};
        for (const activity of activities) {
          done[activity.activityId] = await loadColoring60Done(CREATION_STORY_ID, activity.activityId);
        }
        if (!active) return;
        setC60Done(done);

        // Primeira consulta SEM a marca: se o convite já está descartado por outro motivo (piloto,
        // história inacabada ou as três partes prontas), nem chega a abrir o registro do convite.
        const fatos = {
          pilotVisible: creationColoringVisible,
          storyScenesComplete: isCompleted,
          completedCount: orderedCompleted(done, order).length,
          totalActivities: order.length,
        };
        if (!deriveColoring60JourneyInvite({ ...fatos, inviteSeen: false }).visible) return;

        const seen = await hasSeenCreationColoringInvite();
        if (!active) return;
        if (!deriveColoring60JourneyInvite({ ...fatos, inviteSeen: seen }).visible) return;

        setInviteVisible(true);
        // A marca é AGUARDADA e seu resultado é tratado: uma gravação que falha não passa mais em
        // silêncio. Falhar não repete o convite depois de "3 de 3" — quem cala o convite ali é a
        // conclusão das três atividades, no predicado acima, que não depende desta chave.
        const marked = await markCreationColoringInviteSeen();
        if (!marked) warn('StoryDetailScreen: convite do Colorir 60 exibido, mas a marca não ficou gravada');
      })();
      return () => { active = false; };
    }, [creationColoringVisible, isCompleted]),
  );

  // A0.10: status público via FONTE ÚNICA (storyJourneyService) — mesma regra do
  // mapa e do card. journeyComplete = cenas + Livrinho + quiz + reflexão + colorir
  // QUANDO HÁ COLORIR. O progresso de cenas ("10/10") segue separado (journey.progress)
  // e NÃO dispara o selo "Concluída" sozinho.
  // [P3J] `coloringAvailable` vem do MESMO contrato que o ProgressContext usa — a tela e o
  // mapa não podem discordar sobre se esta história exige colorir.
  const journey = getStoryJourneyStatus({
    totalScenes,
    sceneDoneCount: progressCount,
    postStoryStatus: { storyBookOpened: bookOpened, quizDone, reflectionDone },
    coloringComplete: coloringDone,
    coloringAvailable: isStoryColoringAvailable(story.id),
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
  // [FIX 2] Portão de navegação: a rota de ENTRADA EM CONTEÚDO (a narração) só passa com a
  // autorização central. As demais rotas (Livrinho, Quiz, Reflexão, Área dos Pais) seguem exatamente
  // como antes — bloquear a entrada na história nunca fecha o que só leva a ver/consultar.
  function goToPremium(routeName, params) {
    if (!canAccess) { navigation.navigate('ParentArea'); return; }
    if (routeName === ROUTES.NARRATION && !canEnterStoryContent) return;
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
      // [FIX 2] Sem autorização de entrada, NENHUMA cena é a "atual": a próxima deixa de aparecer
      // como "Disponível" e cai em bloqueada. As já concluídas continuam mostrando que foram
      // concluídas (o dado nunca é alterado para a interface "parecer" certa).
      isCurrent: canEnterStoryContent && index === progressCount,
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

  // §7 · "Colorir agora": o DESTINO vem do serviço puro, pela mesma condição de conclusão que decide
  // o convite. Antes a escolha era feita aqui — "a primeira ainda não concluída, ou então a primeira
  // de todas" — e aquele "ou então" reabria "Haja luz" quando as três já estavam prontas. Agora,
  // sem parte a colorir, o botão leva à COLEÇÃO. Fecha o convite antes de navegar.
  function handleInviteColorNow() {
    setInviteVisible(false);
    const activities = getColoring60Activities(CREATION_STORY_ID);
    const order = activities.map((a) => a.activityId);
    const action = deriveColoring60InviteAction({
      completedCount: orderedCompleted(c60Done, order).length,
      totalActivities: order.length,
      doneMap: c60Done,
      order,
    });
    if (action.kind === COLORING60_ACTION.COLLECTION) {
      openCreationColoringCollection();
      return;
    }
    openCreationColoring(action.targetActivityId);
  }

  // §7 · "Continuar depois": não força pintura; volta para a jornada com a seção disponível.
  function handleInviteLater() {
    setInviteVisible(false);
  }

  return (
    <View style={styles.wrapper}>
      <AppScreen
        scroll
        bottomExtra={24}
        style={styles.container}
        contentContainerStyle={styles.content}
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

          {/* ── [FIX 2] O que ainda falta na aventura anterior. Diz SÓ o que está pendente, com
              carinho e sem cobrança — nada de "complete a aventura anterior" genérico, e nada de
              listar o que a criança já terminou. O texto vem pronto do serviço puro. ── */}
          {sequenceLockCopy && (
            <ContentContainer style={styles.sequenceLockWrap}>
              <View style={styles.sequenceLockBox} accessibilityRole="text">
                <Text style={styles.sequenceLockTitle}>{sequenceLockCopy.title}</Text>
                <Text style={styles.sequenceLockText}>{sequenceLockCopy.description}</Text>
              </View>
            </ContentContainer>
          )}

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
              ) : downloadBlockedText ? (
                <Text style={styles.downloadBlocked} accessibilityRole="text">{downloadBlockedText}</Text>
              ) : (
                <SoundButton
                  style={styles.downloadBtn}
                  onPress={packDownload.uiState === 'error' ? packDownload.retry : packDownload.download}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={packDownload.uiState === 'error' ? downloadErrorText : 'Baixar história para usar offline'}
                >
                  <Text style={styles.downloadBtnText}>
                    {packDownload.uiState === 'error' ? downloadErrorText : 'Baixar história (usar offline)'}
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
                {/* [P3J] O card "Colorir · Pintar uma cena" foi REMOVIDO: era a porta do Colorir
                    legado por cena, aposentado globalmente. Nas histórias sem "Colorir com o Beni"
                    a grade simplesmente tem três cards — sem card vazio, bloqueado ou "em breve".
                    Em "A Criação" com o piloto ativo, a seção CreationColoringJourneySection abaixo
                    continua sendo a única porta de entrada do colorir. */}
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
                  entryBlocked={!canEnterStoryContent}
                  lockedHint={sequenceLockCopy ? sequenceLockCopy.sceneHint : undefined}
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
      </AppScreen>

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

  // [FIX 2] Bloco do que falta na aventura anterior. Acolhedor e discreto: é uma explicação, não
  // um aviso de erro — nenhum vermelho, nenhum ícone de alerta, nenhuma tela nova.
  sequenceLockWrap: { marginHorizontal: 20, marginTop: 12 },
  sequenceLockBox: {
    alignSelf: 'center', width: '100%', maxWidth: 340,
    backgroundColor: pt.cream, borderWidth: 1, borderColor: pt.border,
    borderRadius: radii.md, paddingVertical: 14, paddingHorizontal: 16,
  },
  sequenceLockTitle: {
    fontFamily: 'Baloo2_700Bold', fontSize: 16, color: pt.text, textAlign: 'center',
  },
  sequenceLockText: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft,
    textAlign: 'center', marginTop: 4, lineHeight: 20,
  },

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
  // [P3J-R] estado NÃO-RETENTÁVEL (configuração ausente / app desatualizado): texto, não botão —
  // oferecer "tentar de novo" para algo que tocar de novo não resolve é mentir para a família.
  downloadBlocked: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    textAlign: 'center', maxWidth: 340, alignSelf: 'center',
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
