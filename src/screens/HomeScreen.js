import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView,
  Animated, StyleSheet, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
// [F6.3A] Fundação visual "O Livro Vivo": papel, tinta, terracota, dourado, céu-noite e as
// duas famílias oficiais vêm de `tokens.js`. A tela não inventa mais cor nem família.
import { color, font, seal } from '../theme/tokens';
import { stories } from '../data/stories';
import { images } from '../assets/images';
import SoundButton from '../components/SoundButton';
import RecoverableImage from '../components/ui/RecoverableImage';
import FaithIcon from '../components/ui/FaithIcon';
import HubSurface from '../components/layout/HubSurface';
import { BeniAvatar } from '../components/beni';
import BeniGuideOverlay from '../components/BeniGuideOverlay';
import { useScreenGuide } from '../hooks/useScreenGuide';
import { useGuideTargets } from '../hooks/useGuideTargets';
import { measureGuideTarget } from '../services/guideTargetRegistry';
import { HOME_GUIDE } from '../data/beniGuides';
import { useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../context/ProfileContext';
import { useProgressContext } from '../context/ProgressContext';
import { getAvatarImage, getProfileAvatarSkinTone } from '../data/avatars';
import AvatarImage from '../components/AvatarImage';
import { canOpenMomentoLumi } from '../services/accessControl';
import { isStoryColoringAvailable } from '../services/storyColoringAvailability';
import { getHomePrimaryAction } from '../services/homeService';
import { getShowcaseStory } from '../services/showcaseStory';
import { getBeniGuideMessage } from '../data/beniGuideMessages';
import { getBeniLine } from '../data/beniLines';
import { listArts } from '../services/atelierStorage';
import { buildCtx } from '../services/achievementService';
import { buildBeniChestCards, getBeniChestSummary } from '../services/beniChestService';
import { emitSummaryOnce, markOnce } from '../services/performanceTrace';
import { MISSIONS } from '../data/atelierData';
import { ROUTES } from '../constants/routes';

/* ── Conteúdo rotativo ─────────────────────────────────────────── */
const DAILY_MESSAGES = [
  { emoji: '🌈', text: 'Deus cuida de você hoje e sempre!' },
  { emoji: '🎨', text: 'Pinte uma cena e ganhe estrelas!' },
  { emoji: '💛', text: 'Cada história ensina um pedacinho do amor de Deus.' },
  { emoji: '⭐', text: 'Seja forte e corajoso, Deus está com você!' },
  { emoji: '🕊️', text: 'Confie em Deus com todo o seu coração.' },
  { emoji: '✨', text: 'O Senhor é meu pastor e nada me faltará!' },
  { emoji: '✨', text: 'Sua fé move montanhas!' },
];

const DAILY_PRAYERS = [
  { emoji: '🙏', text: 'Obrigado, Deus, por mais um dia para aprender e brincar.' },
  { emoji: '💛', text: 'Senhor, cuida da minha família com o Seu amor.' },
  { emoji: '🌟', text: 'Jesus, me ajuda a ser bom com todo mundo hoje.' },
  { emoji: '🕊️', text: 'Deus, coloca paz no meu coraçãozinho.' },
  { emoji: '✨', text: 'Obrigado, Senhor, por cuidar de mim sempre.' },
];

const DAILY_CHALLENGES = [
  { emoji: '🌈', text: 'Colorir uma cena e ganhar uma estrela!', short: 'colorir uma cena' },
  { emoji: '📖', text: 'Ler uma história completa com a família.', short: 'ler com a família' },
  { emoji: '⭐', text: 'Completar duas cenas de uma aventura hoje.', short: 'completar duas cenas' },
  { emoji: '🎨', text: 'Usar 5 cores diferentes em um único desenho.', short: 'usar várias cores' },
  { emoji: '💛', text: 'Descobrir a lição do coração de Davi.', short: 'fazer uma boa ação' },
  { emoji: '🙏', text: 'Orar por alguém depois de ler a história.', short: 'orar por alguém' },
  { emoji: '🌟', text: 'Contar uma história bíblica para alguém especial.', short: 'contar uma história' },
];

function dayIndex(listLength) {
  return Math.floor(Date.now() / 86400000) % listLength;
}

/**
 * [F6-SG-C · TK-C-008] Largura mínima de um destino da Home. O gabarito é o cartão
 * mais exigente — o Cultinho —, que numa linha só põe ícone, título, a etiqueta de
 * "⏱️ 5 min" e o botão "Começar": pouco mais de 400dp somando os respiros. Abaixo
 * disso o título e a etiqueta se atropelam, e a coluna não deve se dividir.
 *
 * Sem `gap`: cada cartão já traz `marginHorizontal: 16`, e a calha entre colunas sai
 * dos 16 de cada lado. Somar um intervalo novo seria inventar espaçamento.
 */
const HUB_MIN_CARD = 420;

/* ═══════════════════════════════════════════════════════════════════
   BeniHeroScene — cena de entrada do mundo
═══════════════════════════════════════════════════════════════════ */
function BeniHeroScene({ greeting, totalStars, avatarImage, insets, bubbleMessage }) {
  return (
    <View style={heroS.wrapper}>
      <LinearGradient
        colors={[color.paper50, color.paper100, color.paper200]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[heroS.sky, { paddingTop: Math.max(insets.top, 20) + 4 }]}
      >
        {/* Nuvens decorativas */}
        <View style={heroS.cloud1} />
        <View style={heroS.cloud2} />
        <View style={heroS.cloud3} />

        {/* Saudação + Beni (compacto) */}
        <View style={heroS.contentRow}>
          <View style={heroS.childCircle}>
            <AvatarImage source={avatarImage} size={42} />
          </View>
          <View style={heroS.greetingCol}>
            <Text style={heroS.greetingText} numberOfLines={1}>{greeting}</Text>
            <View style={heroS.starsPill}>
              <FaithIcon name="star" size={13} color={color.gold700} />
              <Text style={heroS.starsText}>
                {totalStars}{' '}
                {totalStars === 1 ? 'estrelinha' : 'estrelinhas'}
              </Text>
            </View>
          </View>
          <View style={heroS.beniCol}>
            <BeniAvatar variant="pointing" size="medium" />
          </View>
        </View>

        {/* Fala única do Beni — vinda do catálogo central, aponta para o portal */}
        <View style={heroS.bubbleWrap}>
          <Text style={heroS.bubbleText}>
            {bubbleMessage}
          </Text>
          {/* Pontinha apontando para baixo */}
          <View style={heroS.bubbleTipDown} />
        </View>
      </LinearGradient>

      {/* Colinas de transição */}
      <View style={heroS.hillsRow}>
        <View style={heroS.hillBack} />
        <View style={heroS.hillFront} />
      </View>
    </View>
  );
}

const heroS = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  sky: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  cloud1: {
    position: 'absolute', top: 18, right: 10,
    width: 88, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  cloud2: {
    position: 'absolute', top: 34, right: 64,
    width: 54, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  cloud3: {
    position: 'absolute', bottom: 44, left: -6,
    width: 66, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  contentRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginTop: 4, marginBottom: 10,
  },
  greetingCol: { flex: 1 },
  childCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.65)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
    flexShrink: 0, elevation: 2,
    shadowColor: color.gold500,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  greetingText: {
    fontFamily: font.bodyBold, fontSize: 20, color: color.ink900, marginBottom: 5,
  },
  starsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
    alignSelf: 'flex-start', borderWidth: 1,
    borderColor: color.gold300, elevation: 1,
  },
  starsText: {
    fontFamily: font.body, fontSize: 12, color: color.gold700, fontWeight: '700',
  },
  beniCol: { alignItems: 'center', flexShrink: 0 },
  bubbleWrap: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: color.paper200,
    alignItems: 'center',
  },
  bubbleText: {
    fontFamily: font.body, fontSize: 13, color: color.ink900,
    fontWeight: '700', lineHeight: 18, textAlign: 'center',
  },
  bubbleTipDown: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderLeftColor: 'transparent',
    borderRightWidth: 6, borderRightColor: 'transparent',
    borderTopWidth: 8, borderTopColor: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  hillsRow: { height: 18, overflow: 'hidden', marginTop: -1 },
  hillBack: {
    position: 'absolute', bottom: 0, left: -20, right: -20, height: 36,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    backgroundColor: color.gold100, opacity: 0.35,
  },
  hillFront: {
    position: 'absolute', bottom: 0, left: -20, right: -20, height: 24,
    borderTopLeftRadius: 34, borderTopRightRadius: 34,
    backgroundColor: pt.background,
  },
});

/* ── Título de seção ─────────────────────────────────────────────── */
function SectionTitle({ title, style }) {
  return <Text style={[styles.sectionTitle, style]}>{title}</Text>;
}

/* ═══════════════════════════════════════════════════════════════════
   MissaoDeHoje — coração do Portal do Beni: a história recomendada como
   missão única e clara (capa grande, lição do coração, o que vou viver,
   CTA forte e promessa do Livrinho).
═══════════════════════════════════════════════════════════════════ */
function MissaoDeHoje({
  primaryAction,
  heroStory,
  getProgressCount,
  onAdventure,
  adventureLabel,
  onCriar,
  beniLine,
  targetRef,
}) {
  const allDone = primaryAction.targetType === 'openAdventures' && !primaryAction.storyId;
  const story = heroStory;
  const hasThumb = story?.imagemCapa && images[story.imagemCapa];
  const progCount = story ? getProgressCount(story.id) : 0;
  const progTotal = story?.totalCenas ?? 1;
  const progPct = Math.min(progCount / progTotal, 1) * 100;
  const isContinue = primaryAction.targetType === 'continueStory';
  const isPending = primaryAction.targetType === 'pendingRewards';
  // [P3J-R] Disponibilidade REAL de colorir nesta história (portão do C60 + catálogo), não uma
  // promessa fixa. É a mesma porta consultada pelo journey e pelo herói do detalhe.
  const hasColoring = story ? isStoryColoringAvailable(story.id) : false;

  if (allDone) {
    return (
      <View style={styles.missionHero}>
        <View ref={targetRef} collapsable={false} style={styles.missionAllDone}>
          <View style={styles.missionAllDoneIcon}>
            <FaithIcon name="trophies" size={34} color={color.gold700} />
          </View>
          <Text style={styles.missionAllDoneTitle}>{primaryAction.title}</Text>
          <Text style={styles.missionAllDoneSub}>{primaryAction.description}</Text>
          <SoundButton style={styles.missionBtn} onPress={onAdventure} activeOpacity={0.85}>
            <LinearGradient
              colors={[pt.beni, pt.beniDeep]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.missionBtnGradient}
            >
              <Text style={styles.missionBtnText}>{adventureLabel}</Text>
            </LinearGradient>
          </SoundButton>
        </View>
      </View>
    );
  }

  const badgeText = isPending
    ? 'PRESENTES ESPERANDO'
    : isContinue
      ? 'CONTINUE SUA AVENTURA'
      : 'MISSÃO DE HOJE';
  const badgeIcon = isPending ? 'gift' : 'lumi';

  return (
    <View style={styles.missionHero}>
      {/* Selo da missão + Beni guia */}
      <View style={styles.missionTopRow}>
        <View style={styles.missionBadge}>
          <FaithIcon name={badgeIcon} size={13} color={color.gold700} />
          <Text style={styles.missionBadgeText}>{badgeText}</Text>
        </View>
        <BeniAvatar variant="pointing" size="small" />
      </View>

      {/* Uma única fala do Beni, ligada à missão */}
      <Text style={styles.missionBeniLine}>{beniLine}</Text>

      {/* ALVO do guia (Card 2 "Sua aventura atual"): capa + título da história —
          o indicador visual mais CLARO da aventura atual (halo justo, não a seção). */}
      <View ref={targetRef} collapsable={false} style={styles.missionTargetWrap}>
        {/* Capa grande — a história em destaque */}
        {hasThumb ? (
          <View style={styles.missionCover}>
            <RecoverableImage
              source={images[story.imagemCapa]}
              style={styles.missionCoverImg}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(20,12,4,0.55)']}
              style={styles.missionCoverShade}
            />
          </View>
        ) : (
          <View style={[styles.missionCover, styles.missionCoverFallback]}>
            <Text style={styles.missionCoverEmoji}>{story?.emoji ?? '⛵'}</Text>
          </View>
        )}

        <Text style={styles.missionTitle} numberOfLines={2}>
          {story?.titulo ?? primaryAction.title}
        </Text>
        {story?.referencia ? (
          <Text style={styles.missionRef}>{story.referencia}</Text>
        ) : null}
      </View>

      {story?.licaoCoracao ? (
        <Text style={styles.missionLesson} numberOfLines={2}>💛 {story.licaoCoracao}</Text>
      ) : null}

      {/* O que vou viver nesta aventura — [P3J-R] o chip "Colorir" DERIVA da disponibilidade real
          (mesma porta do journey). Sem C60 na história, a Home não promete colorir. */}
      <View style={styles.missionFeatures}>
        <View style={styles.missionFeature}>
          <FaithIcon name="sound" size={12} color={color.ink600} />
          <Text style={styles.missionFeatureText}>Ouvir</Text>
        </View>
        {hasColoring && (
          <View style={styles.missionFeature}>
            <FaithIcon name="atelier" size={12} color={color.ink600} />
            <Text style={styles.missionFeatureText}>Colorir</Text>
          </View>
        )}
        <View style={styles.missionFeature}>
          <FaithIcon name="star" size={12} color={color.gold500} />
          <Text style={styles.missionFeatureText}>Estrelas</Text>
        </View>
      </View>

      {/* Progresso visual quando a aventura já começou */}
      {isContinue && story && (
        <View style={styles.missionBar}>
          <View style={[styles.missionBarFill, { width: `${progPct}%` }]} />
        </View>
      )}

      {/* CTA principal — forte, impossível de não achar */}
      <SoundButton style={styles.missionBtn} onPress={onAdventure} activeOpacity={0.85}>
        <LinearGradient
          colors={[color.terra500, color.terra600]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.missionBtnGradient}
        >
          <Text style={styles.missionBtnText}>{adventureLabel}</Text>
        </LinearGradient>
      </SoundButton>

      {/* Promessa emocional do Livrinho */}
      <Text style={styles.missionPromise}>📖 Sua aventura fica guardada no Livrinho da Fé.</Text>

      {/* Atalho discreto para criar — apoio, não ação principal.
          [P3J-R] Nome oficial da experiência: "Criar livre" (D-CRIAR-COM-BENI-STATUS). Mesmo
          destino de sempre; só o nome deixou de prometer uma experiência que não existe. */}
      <SoundButton
        style={styles.missionCriar}
        onPress={onCriar}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Criar livre"
        accessibilityHint="Abre a tela de desenho livre com o Beni"
      >
        <FaithIcon name="atelier" size={15} color={color.terra600} />
        <Text style={styles.missionCriarText}>Criar livre</Text>
        <Text style={styles.missionCriarArrow}>→</Text>
      </SoundButton>
    </View>
  );
}

/* ── Você conquistou — recompensa em destaque (dourado), leva ao Álbum ── */
function ConquistaCard({ lastCompleted, totalStars, onPress }) {
  let title, sub;
  if (totalStars > 0) {
    title = `${totalStars} estrelinha${totalStars !== 1 ? 's' : ''} na sua jornada`;
    sub = lastCompleted
      ? `Última aventura: ${lastCompleted.titulo}`
      : 'Continue brilhando para ganhar mais!';
  } else {
    title = 'Sua primeira estrelinha está pertinho';
    sub = 'Complete uma cena para começar a brilhar.';
  }
  return (
    <SoundButton onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={[color.paper50, color.paper100]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.conquistaCard}
      >
        <View style={styles.conquistaMedal}>
          <FaithIcon name={totalStars > 0 ? 'star' : 'lumi'} size={24} color={color.gold700} />
        </View>
        <View style={styles.conquistaInfo}>
          <Text style={styles.conquistaLabel}>VOCÊ CONQUISTOU</Text>
          <Text style={styles.conquistaTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.conquistaSub} numberOfLines={1}>{sub}</Text>
        </View>
        <Text style={styles.conquistaChevron}>›</Text>
      </LinearGradient>
    </SoundButton>
  );
}

/* ── Cultinho em Casa — atalho compacto para a rotina familiar ─────── */
function CultinhoCard({ onPress, targetRef }) {
  return (
    <SoundButton onPress={onPress} activeOpacity={0.88} style={styles.cultinhoWrap}>
     <View ref={targetRef} collapsable={false}>
      <View style={styles.cultinhoCard}>
        <View style={styles.cultinhoIcon}>
          <FaithIcon name="cultinho" size={23} color={color.star100} />
        </View>
        <View style={styles.cultinhoInfo}>
          <View style={styles.cultinhoTitleRow}>
            <Text style={styles.cultinhoTitle}>Cultinho em Casa</Text>
            <View style={styles.cultinhoMin}>
              <FaithIcon name="timer" size={11} color={color.ink900} />
              <Text style={styles.cultinhoMinText}>5 min</Text>
            </View>
          </View>
          <Text style={styles.cultinhoDesc} numberOfLines={2}>
            Faça uma história curtinha em família com Beni.
          </Text>
        </View>
        <View style={styles.cultinhoBtn}>
          <Text style={styles.cultinhoBtnText}>Começar</Text>
        </View>
      </View>
     </View>
    </SoundButton>
  );
}

/* ── Baú do Beni — atalho compacto para a coleção de cartinhas ─────── */
function BauDoBeniCard({ onPress, count, targetRef }) {
  return (
    <SoundButton onPress={onPress} activeOpacity={0.88} style={styles.bauWrap}>
     <View ref={targetRef} collapsable={false}>
      <View style={styles.bauCard}>
        <View style={styles.bauIcon}>
          <FaithIcon name="bau" size={22} color={color.paper50} />
        </View>
        <View style={styles.bauInfo}>
          <View style={styles.bauTitleRow}>
            <Text style={styles.bauTitle}>Baú do Beni</Text>
            {count != null && (
              <View style={styles.bauCountPill}>
                <Text style={styles.bauCountText}>{count} encontrada{count === 1 ? '' : 's'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.bauDesc} numberOfLines={1}>Suas cartinhas de fé</Text>
        </View>
        <View style={styles.bauBtn}>
          <Text style={styles.bauBtnText}>Abrir</Text>
        </View>
      </View>
     </View>
    </SoundButton>
  );
}

/* ── Criar livre — atalho para missão criativa contextual ─────────────
   [P3J-R] Nome oficial da experiência = "Criar livre" (D-CRIAR-COM-BENI-STATUS). O destino, a
   missão sorteada e o parâmetro de rota permanecem exatamente os mesmos. */
function CriarLivreCard({ onPress, targetRef }) {
  return (
    <SoundButton
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.criarWrap}
      accessibilityRole="button"
      accessibilityLabel="Criar livre"
      accessibilityHint="Abre a tela de desenho livre com o Beni"
    >
     <View ref={targetRef} collapsable={false}>
      <View style={styles.criarCard}>
        <View style={styles.criarIcon}>
          <FaithIcon name="atelier" size={22} color={color.onTerra} />
        </View>
        <View style={styles.criarInfo}>
          <Text style={styles.criarTitle}>Criar livre</Text>
          <Text style={styles.criarDesc} numberOfLines={1}>Uma missão criativa com Beni</Text>
        </View>
        <View style={styles.criarBtn}>
          <Text style={styles.criarBtnText}>Criar</Text>
        </View>
      </View>
     </View>
    </SoundButton>
  );
}

/* ── Cantinho do Beni — bloco especial: ideia + versículo + oração ── */
function CantinhoDoBeni({ idea, verse, prayer, canAccess, onVerse, targetRef }) {
  return (
    <View ref={targetRef} collapsable={false} style={styles.cantinho}>
      {/* Cabeçalho com Beni presente */}
      <LinearGradient
        colors={[color.paper100, color.paper50]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.cantinhoHeader}
      >
        <BeniAvatar variant="happy" size="medium" />
        <View style={styles.cantinhoHeaderText}>
          <Text style={styles.cantinhoTitle}>Cantinho do Beni</Text>
          <Text style={styles.cantinhoSubtitle}>Um carinho de fé para hoje 💜</Text>
        </View>
      </LinearGradient>

      <View style={styles.cantinhoBody}>
        {/* Uma ideia para hoje */}
        <View style={styles.cantinhoItem}>
          <Text style={styles.cantinhoItemLabel}>💡 Uma ideia para hoje</Text>
          <Text style={styles.cantinhoItemText} numberOfLines={2}>{idea.text}</Text>
        </View>

        <View style={styles.cantinhoDivider} />

        {/* Um versículo para guardar (abre o momento com Beni) */}
        <SoundButton style={styles.cantinhoAction} onPress={onVerse} activeOpacity={0.85}>
          <View style={styles.cantinhoItem}>
            <Text style={styles.cantinhoItemLabel}>🕊️ Um versículo para guardar</Text>
            <Text style={styles.cantinhoItemText} numberOfLines={2}>{verse.text}</Text>
          </View>
          <Text style={[styles.cantinhoLink, !canAccess && styles.cantinhoLinkLocked]} numberOfLines={1}>
            {canAccess ? 'Abrir →' : 'Pedir ao responsável'}
          </Text>
        </SoundButton>

        <View style={styles.cantinhoDivider} />

        {/* Uma oração curtinha */}
        <View style={styles.cantinhoItem}>
          <Text style={styles.cantinhoItemLabel}>🙏 Uma oração curtinha</Text>
          <Text style={styles.cantinhoItemText} numberOfLines={2}>{prayer.text}</Text>
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Tela principal
═══════════════════════════════════════════════════════════════════ */
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  // Home 1.0: guia falado da Home ATIVO — 1ª visita à Home (flag @ptf_beni_guide_home_v1).
  const homeGuide = useScreenGuide('home', true);
  // Alvos REAIS dos módulos da Home (measureInWindow) — sem medição → fallback sem seta.
  const homeTargets = useGuideTargets();
  // Medição combinada: alvos LOCAIS (cards da Home) + GLOBAL (item Início da sidebar
  // no tablet, registrado em TabletSidebar). No mobile o item da sidebar não existe → null.
  const measureHomeTarget = useCallback(
    (name) => homeTargets.measure(name).then((r) => r || measureGuideTarget(name)),
    [homeTargets.measure],
  );
  // [F6-SG-C · CAUSA A1] A grade compõe a partir do espaço que ELA tem, não da
  // janela que a tela vê. No tablet a aba vive à direita da barra lateral: a janela
  // publica 1317dp e esta região mede ~1077dp. Compor pela janela abriria três
  // colunas onde cabem duas, com cartão abaixo do piso declarado logo acima.
  // A tela MEDE — nunca subtrai a largura da barra, que ela não deve nem conhecer.
  const [gradeW, setGradeW] = useState(0);
  const onGradeLayout = useCallback((e) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setGradeW((prev) => (prev === w ? prev : w));
  }, []);

  // Rolagem da Home p/ trazer o alvo do card atual à área visível antes de medir.
  const scrollRef = useRef(null);
  const scrollY = useRef(0);
  const onHomeScroll = useCallback((e) => { scrollY.current = e.nativeEvent.contentOffset.y; }, []);
  const scrollGuideTargetIntoView = useCallback((name) => {
    if (!name) { scrollRef.current?.scrollTo({ y: 0, animated: true }); return; } // Card 1: topo
    homeTargets.measure(name).then((r) => {
      if (!r) return; // sem medição → sem rolagem (o overlay cai no fallback honesto)
      // Alvo ALTO (ex.: capa + título): leva o TOPO para perto do topo da tela, para
      // sobrar espaço ABAIXO p/ o card do Beni — assim o halo não fica atrás do card.
      if (r.height >= 170) {
        const desiredTop = insets.top + 60;
        const delta = r.y - desiredTop;
        if (Math.abs(delta) > 8) {
          scrollRef.current?.scrollTo({ y: Math.max(0, scrollY.current + delta), animated: true });
        }
        return;
      }
      // Alvo pequeno: só traz a uma posição confortável se estiver fora da tela.
      const desiredTop = insets.top + 110;        // posição confortável abaixo do topo
      const viewBottom = screenH - 64 - 190;       // espaço p/ tab bar + card do guia
      let delta = 0;
      if (r.y < desiredTop) delta = r.y - desiredTop;
      else if (r.y + r.height > viewBottom) delta = (r.y + r.height) - viewBottom;
      if (Math.abs(delta) > 8) {
        scrollRef.current?.scrollTo({ y: Math.max(0, scrollY.current + delta), animated: true });
      }
    });
  }, [homeTargets, insets.top, screenH]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const { profile } = useProfile();
  const greeting = profile.name ? `Olá, ${profile.name}!` : 'Olá!';

  const { progressByStory, progressSummary, postStoryStatusByStory, refreshProgress } = useProgressContext();

  function getProgressCount(storyId) {
    const p = progressByStory[storyId] || {};
    return Object.values(p).filter(Boolean).length;
  }

  const totalStars = progressSummary?.totalStars ?? 0;
  const maxStars = progressSummary?.maxTotalStars ?? 0;
  const starsPercent = maxStars > 0 ? totalStars / maxStars : 0;

  const primaryAction = useMemo(() => getHomePrimaryAction({
    progressByStory,
    progressSummary,
    stories,
    postStoryStatusByStory,
  }), [progressByStory, progressSummary, postStoryStatusByStory]);

  const primaryStory = useMemo(
    () => (primaryAction.storyId ? stories.find(s => s.id === primaryAction.storyId) ?? null : null),
    [primaryAction.storyId],
  );

  useFocusEffect(
    useCallback(() => {
      refreshProgress();
    }, []),
  );

  // Contador leve do Baú do Beni (cartinhas encontradas) — nunca bloqueia render.
  const [chestCount, setChestCount] = useState(null);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const arts = await listArts().catch(() => []);
          const ctx = await buildCtx(progressByStory, stories, { postStoryStatusByStory }).catch(() => null);
          if (!alive) return;
          const cards = buildBeniChestCards({ progressByStory, stories, arts, ctx });
          setChestCount(getBeniChestSummary(cards).unlocked);
        } catch {
          /* contador é opcional — silencioso */
        }
      })();
      return () => { alive = false; };
    }, [progressByStory, postStoryStatusByStory]),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const dailyMsg = DAILY_MESSAGES[dayIndex(DAILY_MESSAGES.length)];
  const dailyChallenge = DAILY_CHALLENGES[dayIndex(DAILY_CHALLENGES.length)];
  const dailyPrayer = DAILY_PRAYERS[dayIndex(DAILY_PRAYERS.length)];

  const playableStories = stories.filter(s => (s.totalCenas ?? 0) > 0);
  const completedStories = playableStories.filter(s => getProgressCount(s.id) >= s.totalCenas);
  const lastCompleted = completedStories[completedStories.length - 1] ?? null;

  function handleAdventurePress() {
    const targetStory = primaryStory ?? getShowcaseStory();
    if (!targetStory) {
      // Home é tela de ABA: o irmão 'Aventuras' está no mesmo navegador. Fase 6 · B3
      // fez isso valer também no tablet (antes o shell custom entregava a navegação
      // do stack, e a troca de aba não acontecia).
      navigation.navigate(ROUTES.ADVENTURES);
      return;
    }
    if (primaryAction.targetType === 'pendingRewards') {
      navigation.navigate('PostStoryHub', { story: targetStory });
      return;
    }
    navigation.navigate('StoryDetail', { story: targetStory });
  }

  function getAdventureButtonLabel() {
    switch (primaryAction.targetType) {
      case 'startFirstStory': return 'Entrar na aventura →';
      case 'continueStory':   return 'Continuar aventura →';
      case 'pendingRewards':  return 'Abrir presentes →';
      case 'openAdventures':
        return primaryAction.storyId ? 'Entrar na aventura →' : 'Rever aventura →';
      default: return 'Ver aventuras →';
    }
  }

  /* ── Missão de Hoje — coração do Portal do Beni ── */
  const heroStory = primaryStory ?? getShowcaseStory();
  const missionBeniLine =
    primaryAction.targetType === 'continueStory'
      ? getBeniLine('sceneComplete').text
      : getBeniLine('home').text;

  // Criar livre — fluxo CONTEXTUAL (missão criativa), não Ateliê genérico. O parâmetro de rota
  // `createWithBeni` é preservado de propósito: é o contrato de volta (originBack.js), não um nome.
  function onCriarLivre() {
    const mission = Array.isArray(MISSIONS) && MISSIONS.length
      ? MISSIONS[Math.floor(Math.random() * MISSIONS.length)]
      : null;
    navigation.navigate('AtelierCanvas', { from: 'createWithBeni', mission });
  }

  const jornadaBlock = (
    <MissaoDeHoje
      primaryAction={primaryAction}
      heroStory={heroStory}
      getProgressCount={getProgressCount}
      onAdventure={handleAdventurePress}
      adventureLabel={getAdventureButtonLabel()}
      onCriar={onCriarLivre}
      beniLine={missionBeniLine}
      targetRef={homeTargets.register('home.continue')}
    />
  );

  /* ── Conquista recente — recompensa em destaque ── */
  const achievementBlock = (
    <>
      <SectionTitle title="Sua jornada" style={{ marginTop: 20 }} />
      <ConquistaCard
        lastCompleted={lastCompleted}
        totalStars={totalStars}
        onPress={() => navigation.navigate(ROUTES.TROPHIES)}
      />
    </>
  );

  /* ── Cultinho em Casa (rotina familiar curta) ── */
  const cultinhoEmCasaBlock = (
    <CultinhoCard onPress={() => navigation.navigate('FamilyWorship')} targetRef={homeTargets.register('home.cultinho')} />
  );

  /* ── Baú do Beni (coleção de cartinhas) ── */
  const bauBlock = (
    <BauDoBeniCard onPress={() => navigation.navigate('BeniChest')} count={chestCount} targetRef={homeTargets.register('home.bau')} />
  );

  /* ── Criar livre (atalho para missão criativa contextual) ── */
  const criarBlock = (
    <CriarLivreCard onPress={onCriarLivre} targetRef={homeTargets.register('home.criar')} />
  );

  /* ── Cantinho do Beni (ideia + versículo agrupados) ── */
  const canLumi = canOpenMomentoLumi();
  const cantinhoBlock = (
    <>
      <CantinhoDoBeni
        idea={dailyChallenge}
        verse={dailyMsg}
        prayer={dailyPrayer}
        canAccess={canLumi}
        onVerse={canLumi
          ? () => navigation.navigate('LumiMoment')
          : () => navigation.navigate('ParentArea')
        }
        targetRef={homeTargets.register('home.momento')}
      />
    </>
  );

  return (
    // LP1M-A: `onLayout` só OBSERVA o primeiro layout da raiz (uma vez por boot). Não muda
    // geometria, não cria View e não afirma "interativo" — só que o layout foi confirmado.
    <View style={{ flex: 1 }} onLayout={() => { markOnce('home_first_layout'); emitSummaryOnce(); }}>
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      onScroll={onHomeScroll}
      scrollEventThrottle={32}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* 1. Cena de entrada */}
        <BeniHeroScene
          greeting={greeting}
          totalStars={totalStars}
          avatarImage={getAvatarImage(profile.avatarId, getProfileAvatarSkinTone(profile, profile.avatarId))}
          insets={insets}
          bubbleMessage={getBeniGuideMessage('home', {
            hasProgress:
              primaryAction.targetType === 'continueStory' ||
              primaryAction.targetType === 'pendingRewards',
          })}
        />

        {/* Alvos do guia da Home: o ref medível fica no PRÓPRIO card (halo justo).
            Card 1 (Seu início) destaca a aba Início (tab bar / sidebar).

            [F6-SG-C · TK-C-008] A Missão de Hoje fica FORA da grade: ela é a ação
            principal do app, não um destino entre pares. Os outros cinco são o
            inventário do hub — a criança varre e escolhe —, e é neles que a faixa
            larga deixa de ser coluna estreita cercada de vazio (PLAN §18). */}
        {jornadaBlock}

        <HubSurface
          minItemWidth={HUB_MIN_CARD}
          availableWidth={gradeW > 0 ? gradeW : undefined}
          onLayout={onGradeLayout}
        >
          {achievementBlock}
          {cultinhoEmCasaBlock}
          {bauBlock}
          {criarBlock}
          {cantinhoBlock}
        </HubSurface>
      </Animated.View>
    </ScrollView>
      {homeGuide.visible && (
        <BeniGuideOverlay
          steps={HOME_GUIDE}
          measure={measureHomeTarget}
          finalLabel="Entendi"
          onStep={scrollGuideTargetIntoView}
          onFinish={homeGuide.close}
          onSkip={homeGuide.close}
        />
      )}
    </View>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.paper50 },

  sectionTitle: {
    fontFamily: font.bodyBold, fontSize: 16, color: color.ink900,
    marginHorizontal: 16, marginBottom: 8, marginTop: 4,
  },

  // ── Missão de Hoje (coração do Portal do Beni) ──
  missionHero: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 6,
    backgroundColor: color.paper50,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: color.paper200,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    elevation: 5,
    shadowColor: color.gold500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  missionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  missionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: color.gold100,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: color.gold300,
  },
  missionBadgeText: {
    fontFamily: font.bodyBold, fontSize: 11, color: color.gold700,
    letterSpacing: 0.4,
  },
  missionBeniLine: {
    fontFamily: font.body, fontSize: 13, color: color.ink600,
    fontWeight: '700', lineHeight: 18, marginBottom: 10,
  },
  // Alvo do guia (Card 2): abraça só capa + título (halo justo, leitura clara).
  missionTargetWrap: { borderRadius: radii.lg },
  missionCover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: color.paper100,
    position: 'relative',
  },
  missionCoverImg: { width: '100%', height: '100%' },
  missionCoverShade: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%',
  },
  missionCoverFallback: { justifyContent: 'center', alignItems: 'center' },
  missionCoverEmoji: { fontSize: 56 },
  missionTitle: {
    fontFamily: font.display, fontSize: 20, color: color.ink900,
    lineHeight: 26, marginBottom: 2,
  },
  missionRef: {
    fontFamily: font.body, fontSize: 12, color: color.ink400,
    fontWeight: '700', marginBottom: 6,
  },
  missionLesson: {
    fontFamily: font.body, fontSize: 13.5, color: color.gold700,
    fontWeight: '700', lineHeight: 19, marginBottom: 10,
  },
  missionFeatures: {
    flexDirection: 'row', gap: 8, marginBottom: 12,
  },
  // [F6.3A-R2] Estes chips DESCREVEM a aventura — não são conquista. Dourado é
  // conquista/estrela/presente; portanto a superfície vira papel e só o ícone de
  // estrela guarda a dose de ouro.
  missionFeature: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: color.paper100,
    borderRadius: radii.pill,
    paddingHorizontal: 11, paddingVertical: 6,
    borderWidth: 1, borderColor: color.paper200,
  },
  missionFeatureText: {
    fontFamily: font.body, fontSize: 12, color: color.ink600, fontWeight: '800',
  },
  missionBar: {
    height: 6, backgroundColor: color.paper200, borderRadius: 3,
    overflow: 'hidden', marginBottom: 12,
  },
  missionBarFill: { height: '100%', backgroundColor: pt.green, borderRadius: 3 },
  missionBtn: {
    borderRadius: radii.pill, overflow: 'hidden',
    elevation: 3, shadowColor: color.terra600,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 8,
  },
  missionBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  missionBtnText: { fontFamily: font.bodyBold, fontSize: 18, color: color.onTerra },
  missionPromise: {
    fontFamily: font.body, fontSize: 12, color: color.ink600,
    textAlign: 'center', marginTop: 10, fontWeight: '600',
  },
  missionCriar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.terra100,
    borderRadius: radii.pill,
    paddingVertical: 11, marginTop: 10,
    borderWidth: 1, borderColor: color.paper200, gap: 6,
  },
  missionCriarText: { fontFamily: font.bodyBold, fontSize: 14, color: color.terra600 },
  missionCriarArrow: { fontFamily: font.bodyBold, fontSize: 14, color: color.terra600 },
  missionAllDone: { alignItems: 'center', paddingVertical: 10 },
  missionAllDoneIcon: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: color.gold100,
    borderWidth: 1.5, borderColor: color.gold300,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  missionAllDoneTitle: {
    fontFamily: font.display, fontSize: 19, color: color.ink900,
    textAlign: 'center', marginBottom: 4,
  },
  missionAllDoneSub: {
    fontFamily: font.body, fontSize: 13, color: color.ink600,
    textAlign: 'center', marginBottom: 14, lineHeight: 19,
  },

  // ── Tudo concluído ──
  allDoneCard: {
    backgroundColor: pt.greenSoft,
    borderRadius: radii.lg, marginHorizontal: 16, marginBottom: 14,
    padding: 20, alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: pt.green, ...shadows.soft,
  },
  allDoneEmoji: { fontSize: 44, marginBottom: 8 },
  allDoneTitle: {
    fontFamily: font.display, fontSize: 18, color: color.ink900,
    textAlign: 'center', marginBottom: 4,
  },
  allDoneSub: {
    fontFamily: font.body, fontSize: 13, color: color.ink600, textAlign: 'center',
  },

  // ── Portal da aventura ──
  portalCard: {
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: radii.xl, overflow: 'hidden',
    ...shadows.card, backgroundColor: color.paper100,
  },
  portalArch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  portalOpenLabel: {
    fontFamily: font.bodyBold, fontSize: 11,
    color: color.ink600, fontWeight: '700',
    letterSpacing: 0.3,
  },
  portalBody: {
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14,
  },
  portalCoverWindow: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: color.paper100,
  },
  portalCoverImg: { width: '100%', height: '100%' },
  portalCoverFallback: {
    justifyContent: 'center', alignItems: 'center',
  },
  portalCoverEmoji: { fontSize: 52 },
  portalPendingLabel: {
    fontFamily: font.body, fontSize: 11, color: color.ink600,
    fontWeight: '700', marginBottom: 4,
  },
  portalTitle: {
    fontFamily: font.display, fontSize: 18, color: color.ink900,
    lineHeight: 24, marginBottom: 4, textAlign: 'center',
  },
  portalProgress: {
    fontFamily: font.body, fontSize: 12, color: color.ink400,
    textAlign: 'center', marginBottom: 8,
  },
  portalBar: {
    height: 5, backgroundColor: color.paper200, borderRadius: 3,
    overflow: 'hidden', marginBottom: 16,
  },
  portalBarFill: { height: '100%', backgroundColor: pt.green, borderRadius: 3 },
  portalBtn: {
    borderRadius: radii.pill, overflow: 'hidden',
    elevation: 3, shadowColor: color.terra600,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6,
  },
  portalBtnGradient: { paddingVertical: 15, alignItems: 'center' },
  portalBtnText: { fontFamily: font.bodyBold, fontSize: 17, color: color.onTerra },

  // ── Portinha do Ateliê ──
  atelierWrapper: { marginHorizontal: 16, marginBottom: 4 },
  atelierLabel: {
    fontFamily: font.body, fontSize: 10, color: color.ink400,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 4, marginLeft: 2,
  },
  atelierShortcut: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: color.paper100,
    borderRadius: radii.lg,
    padding: 13,
    borderWidth: 1.5, borderColor: color.paper200,
    ...shadows.soft, gap: 10,
  },
  atelierIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: color.paper200,
    flexShrink: 0, position: 'relative',
  },
  atelierIconEmoji: { fontSize: 22 },
  atelierIconSparkle: {
    position: 'absolute', top: -3, right: -3, fontSize: 11,
  },
  atelierInfo: { flex: 1 },
  atelierTitle: {
    fontFamily: font.bodyBold, fontSize: 15, color: color.ink900, marginBottom: 1,
  },
  atelierDesc: {
    fontFamily: font.body, fontSize: 12, color: color.ink600, lineHeight: 17,
  },
  atelierBtn: {
    backgroundColor: color.terra500,
    borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8, flexShrink: 0,
  },
  atelierBtnText: { fontFamily: font.bodyBold, fontSize: 13, color: color.onTerra },

  // ── Você conquistou ──
  // [F6.3A-R2] O dourado migrou da SUPERFÍCIE para a MEDALHA: o cartão é papel, e a
  // dose de ouro fica onde ela significa alguma coisa — a estrela, o rótulo e a seta.
  conquistaCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 4,
    borderRadius: radii.lg, padding: 14, gap: 14,
    borderWidth: 1, borderColor: color.paper200,
    ...shadows.soft,
  },
  conquistaMedal: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: color.gold100,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: color.gold300,
    elevation: 2,
  },
  conquistaInfo: { flex: 1 },
  conquistaLabel: {
    fontFamily: font.bodyBold, fontSize: 10, color: color.gold700,
    letterSpacing: 0.6, marginBottom: 2,
  },
  conquistaTitle: {
    fontFamily: font.bodyBold, fontSize: 16, color: color.ink900, marginBottom: 1,
  },
  conquistaSub: { fontFamily: font.body, fontSize: 12, color: color.ink600, fontWeight: '700' },
  conquistaChevron: { fontFamily: font.display, fontSize: 26, color: color.gold500, marginLeft: 4 },

  // ── Cultinho em Casa (atalho compacto) ──
  cultinhoWrap: { marginHorizontal: 16, marginTop: 14 },
  // [F6.3A-R] O tint claro da família azul-noite já existe em `seal.premium`
  // (bg/borda derivados de `night`): nenhum token novo nasce aqui.
  cultinhoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: radii.xl, paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: seal.premium.bg,
    borderWidth: 1.5, borderColor: seal.premium.border,
    ...shadows.soft,
  },
  cultinhoIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: color.night600,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  cultinhoInfo: { flex: 1 },
  cultinhoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cultinhoTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.night800 },
  cultinhoMin: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: color.gold100, borderRadius: radii.pill,
    borderWidth: 1, borderColor: color.gold300,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  cultinhoMinText: { fontFamily: font.body, fontSize: 10, color: color.ink900, fontWeight: '800' },
  cultinhoDesc: { fontFamily: font.body, fontSize: 12, color: color.ink600, lineHeight: 16, fontWeight: '600' },
  cultinhoBtn: {
    backgroundColor: color.night600, borderRadius: radii.pill,
    paddingHorizontal: 16, paddingVertical: 9, flexShrink: 0,
  },
  cultinhoBtnText: { fontFamily: font.bodyBold, fontSize: 13, color: color.star100 },

  // ── Baú do Beni (atalho compacto) ──
  bauWrap: { marginHorizontal: 16, marginTop: 10 },
  // [F6.3A-R2] O Baú continua sendo memória/presente — por isso o ouro fica no ícone,
  // na borda, no selo de contagem e no CTA. A SUPERFÍCIE, não: ela é papel.
  bauCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: radii.xl, paddingVertical: 11, paddingHorizontal: 14,
    backgroundColor: color.paper100,
    borderWidth: 1.5, borderColor: color.gold300,
    ...shadows.soft,
  },
  bauIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: color.gold500,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  bauInfo: { flex: 1 },
  bauTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  bauTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink900 },
  bauCountPill: {
    backgroundColor: color.gold100, borderRadius: radii.pill,
    borderWidth: 1, borderColor: color.gold300,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  bauCountText: { fontFamily: font.body, fontSize: 10, color: color.ink900, fontWeight: '800' },
  bauDesc: { fontFamily: font.body, fontSize: 12, color: color.ink600, fontWeight: '600' },
  bauBtn: {
    backgroundColor: color.gold500, borderRadius: radii.pill,
    paddingHorizontal: 16, paddingVertical: 9, flexShrink: 0,
  },
  bauBtnText: { fontFamily: font.bodyBold, fontSize: 13, color: color.ink900 },

  // ── Criar livre (atalho compacto) ──
  criarWrap: { marginHorizontal: 16, marginTop: 10 },
  criarCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: radii.xl, paddingVertical: 11, paddingHorizontal: 14,
    backgroundColor: color.terra100,
    borderWidth: 1.5, borderColor: color.terra500 + '55',
    ...shadows.soft,
  },
  criarIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: color.terra500,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  criarInfo: { flex: 1 },
  criarTitle: { fontFamily: font.bodyBold, fontSize: 15, color: color.ink900, marginBottom: 1 },
  criarDesc: { fontFamily: font.body, fontSize: 12, color: color.ink600, fontWeight: '600' },
  criarBtn: {
    backgroundColor: color.terra500, borderRadius: radii.pill,
    paddingHorizontal: 16, paddingVertical: 9, flexShrink: 0,
  },
  criarBtnText: { fontFamily: font.bodyBold, fontSize: 13, color: color.onTerra },

  // ── Cantinho do Beni (bloco especial: ideia + versículo + oração) ──
  // [F6.3A-R2] A moldura de ouro grosso competia com o Beni. Ela afina para um traço
  // dourado claro; o bloco continua "especial" pela presença do mascote, não pelo metal.
  cantinho: {
    backgroundColor: color.paper50,
    marginHorizontal: 16, marginTop: 20, marginBottom: 4,
    borderRadius: radii.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: color.gold300,
    ...shadows.soft,
  },
  cantinhoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  cantinhoHeaderText: { flex: 1 },
  cantinhoTitle: { fontFamily: font.display, fontSize: 17, color: color.ink900 },
  cantinhoSubtitle: {
    fontFamily: font.body, fontSize: 12, color: color.ink600, fontWeight: '700', marginTop: 1,
  },
  cantinhoBody: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 14 },
  cantinhoItem: { flex: 1 },
  cantinhoItemLabel: {
    fontFamily: font.display, fontSize: 12, color: color.ink900, marginBottom: 2,
  },
  cantinhoItemText: {
    fontFamily: font.body, fontSize: 12, color: color.ink600, lineHeight: 17,
  },
  cantinhoDivider: {
    height: 1, backgroundColor: color.paper200, marginVertical: 10,
  },
  cantinhoAction: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  cantinhoLink: {
    fontFamily: font.bodyBold, fontSize: 13, color: color.terra600, flexShrink: 0,
  },
  cantinhoLinkLocked: { color: color.ink400, fontSize: 11 },
});
