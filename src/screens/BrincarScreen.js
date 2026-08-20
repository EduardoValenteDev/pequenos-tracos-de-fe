/**
 * BrincarScreen — hub premium da aba Brincar (Brincar B1).
 *
 * Substitui o antigo Ateliê como TELA DA ABA. O nome "Ateliê" some da interface;
 * a IDENTIDADE de rota (`name: 'Ateliê'` em TAB_DEFS) permanece, porque o Onboarding
 * navega por ela e trocá-la quebraria a navegação. [P3J-R.1 FIX1] O hub legado
 * `AtelierScreen` e a rota `AtelierFromContext` foram REMOVIDOS: o Cultinho passou a
 * abrir o mesmo Criar livre canônico desta aba (`AtelierCanvas`, com from:'cultinho').
 *
 * ── Redesenho B1 ──────────────────────────────────────────────────────────────
 * Os QUATRO jogos do Beni têm o MESMO peso visual, numa grade 2×2 (mesma largura,
 * altura, raio, sombra, borda, botão e hierarquia). A criação (Criar livre) sai da
 * grade e ganha uma seção própria — "Crie do seu jeito" — seguida de "Minhas artes".
 * Uma faixa compacta "Beni sugere hoje" orienta sem controlar a escolha.
 *
 * FONTE DECLARATIVA ÚNICA (§18): `BENI_GAMES` alimenta tanto a grade quanto a
 * sugestão do Beni — rotas, cores e textos vêm de um só lugar (sem divergência).
 *
 * Nenhum placeholder pobre, nenhum emoji — só FaithIcon / vetores oficiais.
 *
 * Rodadas: o plano gratuito tem 2 por dia (brincarDailyService). Nada é consumido aqui
 * — o hub só INFORMA. Quem consome rodada é o jogo, quando existir.
 *
 * "Colorir uma história" NÃO é card desta aba (decisão de produto): a criança colore
 * a partir da história, em Aventuras.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Animated, AccessibilityInfo, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import SafeImage from '../components/ui/SafeImage';
import { BeniAvatar } from '../components/beni';
import HubSurface from '../components/layout/HubSurface';
import { ROUTES } from '../constants/routes';
import PalavrinhasBeniWarmer from '../components/palavrinhas/PalavrinhasBeniWarmer';
import { iniciarWarmup } from '../services/beniAssetWarmup';
import { useProfile } from '../context/ProfileContext';
import { listArts, resolveArtThumbUri } from '../services/atelierStorage';
import { hasAtelierUnlimitedAccess } from '../services/accessControl';
import { getDailyRounds, toDayKey } from '../services/brincarDailyService';
import { pickDailyIndex } from '../services/brincarSuggestion';
import { backLabelFor, isFromTab } from '../utils/originBack';

/* ══════════════════════════════════════════════════════════════════════════════
 * FONTE DECLARATIVA ÚNICA dos quatro jogos do Beni (§18). A grade E a sugestão do
 * Beni saem daqui. Famílias de cor oficiais (§11): Pares azul · Palavrinhas dourado
 * · Cadê a Ovelhinha? verde · Monte a Cena violeta. `id` (não `key`) — sem spread.
 * A abertura fica em `openGame(navigation, game)` para uma única rota por jogo.
 * ════════════════════════════════════════════════════════════════════════════ */
const BENI_GAMES = [
  {
    id: 'pares', title: 'Pares do Beni', category: 'Memória', icon: 'pares',
    route: ROUTES.PARES_DO_BENI,
    tint: '#EAF1FF', border: '#BFD6FF', iconBg: '#3B82F620', color: pt.faithBlue,
    a11y: 'Pares do Beni, jogo de memória, jogar',
  },
  {
    id: 'palavrinhas', title: 'Palavrinhas do Beni', category: 'Letras', icon: 'palavrinhas',
    route: ROUTES.PALAVRINHAS_DO_BENI,
    tint: '#FFF6DE', border: '#F4D08A', iconBg: '#F4B23C20', color: pt.goldDeep,
    a11y: 'Palavrinhas do Beni, jogo de letras, jogar',
  },
  {
    id: 'ovelha', title: 'Cadê a Ovelhinha?', category: 'Atenção', icon: 'ovelha',
    route: ROUTES.CADE_A_OVELHINHA,
    tint: '#E9F8F0', border: '#B7E4CB', iconBg: '#0E9F6E20', color: pt.greenDeep,
    a11y: 'Cadê a Ovelhinha, jogo de atenção, jogar',
  },
  {
    id: 'monte', title: 'Monte a Cena', category: 'Raciocínio', icon: 'puzzle',
    route: ROUTES.MONTE_A_CENA_HOME,
    tint: '#F4EAFF', border: '#D7C2F5', iconBg: '#7C3AED20', color: pt.purple,
    a11y: 'Monte a Cena, jogo de raciocínio, jogar',
  },
];

/**
 * [F6-SG-C · TK-C-008] Largura mínima de um DESTINO do Brincar, deduzida do desenho que
 * já existe: o bloco mais largo é a grade §9, e ela só continua legível enquanto cada
 * `GameCard` mantiver a largura que hoje tem no telefone (≈184dp em 411dp). Dois cards,
 * o intervalo de 10 e as margens de 16 de cada lado somam pouco mais de 410 — daí o
 * piso. Abaixo disso a coluna não se divide, e o Brincar continua em pilha.
 *
 * Quem conhece esta medida é a TELA, nunca o arquétipo: `HubSurface` compõe com o que
 * recebe e não sabe o que é um `GameCard`.
 */
const HUB_MIN_BLOCO = 420;

/** Abertura ÚNICA de um jogo — a mesma rota para grade e sugestão (sem divergência). */
function openGame(navigation, game) {
  if (game && game.route) navigation.navigate(game.route);
}

/* Entrada suave; respeita "movimento reduzido" (§12/§19). */
function AnimatedCard({ delay, reduce, children, style }) {
  const fade = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const slide = useRef(new Animated.Value(reduce ? 0 : 20)).current;
  useEffect(() => {
    if (reduce) { fade.setValue(1); slide.setValue(0); return; }
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 420, delay, useNativeDriver: true }),
    ]).start();
  }, [reduce]);   // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={[style, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {children}
    </Animated.View>
  );
}

/** Área visual temática do card — composição vetorial simples (ícone + pontos na cor
 *  do jogo). Ainda NÃO há arte específica por jogo: usar o vetor oficial com um fundo
 *  melhor é aceitável (§11) — a arte dedicada fica documentada como necessidade futura. */
function GameArt({ game }) {
  return (
    <View style={[styles.gameArt, { backgroundColor: game.iconBg }]}>
      <View style={[styles.gameArtDot, styles.gameArtDotA, { backgroundColor: game.color + '22' }]} />
      <View style={[styles.gameArtDot, styles.gameArtDotB, { backgroundColor: game.color + '18' }]} />
      <FaithIcon name={game.icon} size={30} color={game.color} />
    </View>
  );
}

/** Card de jogo — TODOS idênticos em tamanho/estrutura. Card inteiro clicável + botão. */
function GameCard({ game, onPress }) {
  return (
    <SoundButton
      style={[styles.gameCard, { backgroundColor: game.tint, borderColor: game.border }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={game.a11y}
    >
      <GameArt game={game} />
      <Text style={styles.gameTitle} numberOfLines={2}>{game.title}</Text>
      <View style={styles.gameCatRow}>
        <Text style={[styles.gameCat, { color: game.color }]} numberOfLines={1}>{game.category}</Text>
      </View>
      <View style={[styles.gameBtn, { backgroundColor: game.color }]}>
        <Text style={styles.gameBtnText}>Jogar</Text>
      </View>
    </SoundButton>
  );
}

export default function BrincarScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();

  const from = route?.params?.from;
  const showBack = !isFromTab(from);

  // [F6-SG-C · CAUSA A1] Mesma medida da Home: a aba vive à direita da barra lateral,
  // então a janela publicada é maior que a região que o hub realmente ocupa. Quem
  // precisa do espaço MEDE — a tela não conhece, nem subtrai, a largura da barra.
  const [gradeW, setGradeW] = useState(0);
  const onGradeLayout = useCallback((e) => {
    const w = Math.round(e.nativeEvent.layout.width);
    setGradeW((prev) => (prev === w ? prev : w));
  }, []);

  const [artCount, setArtCount] = useState(0);
  const [recentThumb, setRecentThumb] = useState(null);
  const [rounds, setRounds] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const premium = hasAtelierUnlimitedAccess();

  /* Movimento reduzido (§12/§19). */
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => vivo && setReduceMotion(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotion(!!v));
    return () => { vivo = false; sub?.remove?.(); };
  }, []);

  // P4R8: aquecimento ANTECIPADO das poses do Beni já na aba Brincar (não bloqueia esta tela).
  useEffect(() => { iniciarWarmup(); }, []);

  // P4R9 §1/§4: o primeiro toque NUNCA parece ignorado — navega IMEDIATAMENTE. A tela de destino
  // mostra "Preparando o Beni..." se as poses ainda não decodificaram (nunca moldura vazia).
  const abrirPalavrinhas = useCallback(() => {
    navigation.navigate(ROUTES.PALAVRINHAS_DO_BENI);
  }, [navigation]);

  // Abre um jogo da grade/sugestão. Palavrinhas usa o caminho de navegação imediata.
  const abrirJogo = useCallback((game) => {
    if (game?.id === 'palavrinhas') { abrirPalavrinhas(); return; }
    openGame(navigation, game);
  }, [navigation, abrirPalavrinhas]);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      listArts().then((list) => {
        if (!vivo) return;
        setArtCount(list.length);
        // Miniatura mais recente (só exibição): usa a que já existe, sem re-exportar (§15).
        setRecentThumb(list.length ? resolveArtThumbUri(list[0]) : null);
      }).catch(() => {});
      getDailyRounds().then((r) => { if (vivo) setRounds(r); }).catch(() => {});
      return () => { vivo = false; };
    }, []),
  );

  /* ── Sugestão diária do Beni (§8): determinística, estável no dia, por criança. ── */
  const childId = (profile && (profile.id || profile.avatarId)) || 'default';
  const suggested = useMemo(() => {
    const dayKey = toDayKey(new Date()) || '';
    return BENI_GAMES[pickDailyIndex(dayKey, childId, BENI_GAMES.length)] || BENI_GAMES[0];
  }, [childId]);

  /* ── Chip compacto do plano (§6): não altera regra, só a apresentação. ── */
  const planText = premium
    ? 'Brincadeiras sem limite'
    : rounds == null
      ? 'Preparando suas rodadas de hoje…'
      : rounds.remaining > 0
        ? `Hoje: ${rounds.remaining} rodada${rounds.remaining === 1 ? '' : 's'} para brincar`
        : 'As rodadas de hoje acabaram — amanhã tem mais!';

  return (
    <ScrollView
      style={styles.container}
      // Safe area real: o último card precisa rolar por completo acima da barra inferior.
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER compacto — o Beni recebe, a mensagem é curta; canto superior direito
             fica livre para o selo do Modo Criador (overlay global, não cobre nada). ── */}
      <LinearGradient
        colors={['#F0E8FF', '#E4D6FF', '#D6ECFF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 28) }]}
      >
        {showBack && (
          <SoundButton
            style={styles.backPill}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate(ROUTES.HOME))}
            activeOpacity={0.85}
            accessibilityLabel={backLabelFor(from)}
          >
            <Text style={styles.backPillText}>‹ {backLabelFor(from)}</Text>
          </SoundButton>
        )}
        <View style={styles.headerRow}>
          <BeniAvatar variant="happy" size="small" />
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Brincar com o Beni</Text>
            <Text style={styles.headerSub} numberOfLines={1}>Qual brincadeira vamos escolher hoje?</Text>
          </View>
          <View style={[styles.planChip, premium ? styles.planChipPremium : styles.planChipFree]}>
            <FaithIcon name="star" size={12} color={premium ? pt.greenDeep : pt.goldDeep} />
            <Text style={styles.planChipText} numberOfLines={1}>{planText}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* [F6-SG-C · TK-C-008] Brincar é HUB: quatro destinos, e a faixa é TETO, não ordem.
          Na compacta o teto é uma coluna — exatamente a pilha de hoje. Na largura de
          tablet a coluna deixa de ser estreita-e-centralizada (PLAN §18) e os destinos
          se compõem lado a lado quando cada metade ainda comporta a grade legível. */}
      <HubSurface
        minItemWidth={HUB_MIN_BLOCO}
        availableWidth={gradeW > 0 ? gradeW : undefined}
        onLayout={onGradeLayout}
      >
        {/* ── Beni sugere hoje (§8): faixa compacta, cor do jogo sugerido, botão pequeno ── */}
        <AnimatedCard delay={60} reduce={reduceMotion} style={styles.suggestWrap}>
          <SoundButton
            style={[styles.suggestBand, { backgroundColor: suggested.tint, borderColor: suggested.border }]}
            onPress={() => abrirJogo(suggested)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Beni sugere hoje: ${suggested.a11y}`}
          >
            <View style={[styles.suggestIconBg, { backgroundColor: suggested.iconBg }]}>
              <FaithIcon name={suggested.icon} size={22} color={suggested.color} />
            </View>
            <View style={styles.suggestTexts}>
              <Text style={styles.suggestKicker}>Beni sugere hoje</Text>
              <Text style={styles.suggestTitle} numberOfLines={1}>{suggested.title}</Text>
            </View>
            <View style={[styles.suggestBtn, { backgroundColor: suggested.color }]}>
              <Text style={styles.suggestBtnText}>Jogar</Text>
            </View>
          </SoundButton>
        </AnimatedCard>

        {/* ── Jogos do Beni (§9): grade 2×2, cards idênticos ──
            O título e a grade são UM destino: separá-los em células diferentes deixaria
            o rótulo órfão ao lado do que ele nomeia. */}
        <View>
          <AnimatedCard delay={110} reduce={reduceMotion} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Jogos do Beni</Text>
            <Text style={styles.sectionSub}>Cada brincadeira tem uma descoberta diferente.</Text>
          </AnimatedCard>

          <AnimatedCard delay={150} reduce={reduceMotion} style={styles.grid}>
            {[[0, 1], [2, 3]].map((pair) => (
              <View key={`row-${pair[0]}`} style={styles.gridRow}>
                {pair.map((i) => (
                  <View key={BENI_GAMES[i].id} style={styles.gridCell}>
                    <GameCard game={BENI_GAMES[i]} onPress={() => abrirJogo(BENI_GAMES[i])} />
                  </View>
                ))}
              </View>
            ))}
          </AnimatedCard>
        </View>

        {/* ── Crie do seu jeito (§14): Criar livre em card horizontal próprio ── */}
        <View>
          <AnimatedCard delay={210} reduce={reduceMotion} style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Crie do seu jeito</Text>
          </AnimatedCard>

          <AnimatedCard delay={240} reduce={reduceMotion} style={styles.creativeWrap}>
            <SoundButton
              style={styles.creativeCard}
              onPress={() => navigation.navigate(ROUTES.ATELIER_CANVAS, {})}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Criar livre, atividade de desenho, abrir folha"
            >
              <View style={styles.creativeArt}>
                <View style={[styles.creativeSheet]} />
                <View style={[styles.creativeDot, { backgroundColor: pt.faithBlue, left: 12 }]} />
                <View style={[styles.creativeDot, { backgroundColor: pt.goldDeep, left: 22 }]} />
                <View style={[styles.creativeDot, { backgroundColor: pt.greenDeep, left: 32 }]} />
                <FaithIcon name="criar_livre" size={24} color={pt.purple} />
              </View>
              <View style={styles.creativeTexts}>
                <Text style={styles.creativeTitle}>Criar livre</Text>
                <Text style={styles.creativeDesc} numberOfLines={2}>Desenhe, invente e guarde suas criações.</Text>
              </View>
              <View style={[styles.creativeBtn, { backgroundColor: pt.purple }]}>
                <Text style={styles.creativeBtnText}>Abrir folha</Text>
              </View>
            </SoundButton>
          </AnimatedCard>
        </View>

        {/* ── Minhas artes (§15): continuação natural — criar → guardar → rever ── */}
        <AnimatedCard delay={280} reduce={reduceMotion} style={styles.cardCompact}>
          <SoundButton
            style={styles.compactRow}
            onPress={() => navigation.navigate(ROUTES.ATELIER_GALLERY)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              premium
                ? `Minhas artes, ${artCount} guardada${artCount === 1 ? '' : 's'}, ver`
                : 'Minhas artes, guardar é do Plano Família, ver'
            }
          >
            <View style={[styles.compactIconBg, { backgroundColor: '#D8F2E2' }]}>
              {premium && recentThumb
                ? <SafeImage source={{ uri: recentThumb }} style={styles.compactThumb} resizeMode="cover" fallbackLabel="" />
                : <FaithIcon name="gallery" size={20} color={pt.greenDeep} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.compactTitle}>Minhas artes</Text>
              <Text style={styles.compactDesc} numberOfLines={2}>
                {premium
                  ? `${artCount} arte${artCount === 1 ? '' : 's'} guardada${artCount === 1 ? '' : 's'}`
                  : 'Guardar suas artes é do Plano Família.'}
              </Text>
            </View>
            <View style={[styles.compactBtn, { backgroundColor: pt.greenDeep }]}>
              <Text style={styles.compactBtnText}>Ver</Text>
            </View>
          </SoundButton>

          {!premium && (
            <View style={styles.familyNote}>
              <FaithIcon name="family" size={16} color="#7A5800" />
              <Text style={styles.familyNoteText}>
                Com o Plano Família você guarda todas as suas artes e brinca sem limite de rodadas.
              </Text>
            </View>
          )}
        </AnimatedCard>
      </HubSurface>
      <View style={{ height: 8 }} />
      {/* Aquecedor offscreen das poses do Beni (decodifica em segundo plano; não bloqueia a tela). */}
      <PalavrinhasBeniWarmer />
    </ScrollView>
  );
}

const HAIR = 1;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },

  /* Header compacto (mais baixo que o anterior → mais jogo na 1ª tela). */
  header: {
    paddingHorizontal: 18, paddingBottom: 14, marginBottom: 2,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTexts: { flex: 1 },
  backPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    marginBottom: 8, borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
  backPillText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#6E3FB5' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.text, marginBottom: 2 },
  headerSub: { fontFamily: 'Nunito', fontSize: 12.5, color: pt.textSoft },

  /* Chip do plano (compacto, canto do header). */
  planChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6,
    maxWidth: 132, borderWidth: HAIR,
  },
  planChipPremium: { backgroundColor: 'rgba(255,255,255,0.85)', borderColor: 'rgba(94,156,62,0.35)' },
  planChipFree: { backgroundColor: 'rgba(255,255,255,0.85)', borderColor: 'rgba(224,162,26,0.35)' },
  planChipText: { fontFamily: 'Nunito', fontSize: 10.5, fontWeight: '800', color: pt.text, flexShrink: 1 },

  /* Beni sugere hoje (faixa compacta, não maior que os cards da grade). */
  suggestWrap: { marginHorizontal: 16, marginTop: 14 },
  suggestBand: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    borderRadius: radii.lg, borderWidth: 1.5, padding: 11, ...shadows.soft,
  },
  suggestIconBg: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  suggestTexts: { flex: 1 },
  suggestKicker: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft },
  suggestTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginTop: 1 },
  suggestBtn: { borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 8, flexShrink: 0 },
  suggestBtnText: { fontFamily: 'FredokaOne', fontSize: 12.5, color: '#FFF' },

  sectionHead: { marginTop: 18, marginHorizontal: 18 },
  sectionTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  sectionSub: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 2 },

  /* Grade 2×2 — duas linhas de dois cards flex:1 (responsivo, sem número mágico). */
  grid: { marginTop: 10, marginHorizontal: 16, gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },
  gridCell: { flex: 1 },

  /* Card de jogo — TODOS idênticos: mesma borda, raio, sombra, paddings, botão. */
  gameCard: {
    flex: 1, borderRadius: radii.lg, borderWidth: 2, padding: 12,
    alignItems: 'flex-start', ...shadows.card,
  },
  gameArt: {
    alignSelf: 'stretch', height: 62, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden',
  },
  gameArtDot: { position: 'absolute', borderRadius: 999 },
  gameArtDotA: { width: 40, height: 40, top: -10, right: -8 },
  gameArtDotB: { width: 26, height: 26, bottom: -6, left: -4 },
  gameTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 5, minHeight: 38 },
  gameCatRow: { marginBottom: 10 },
  gameCat: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800' },
  gameBtn: { borderRadius: radii.pill, paddingVertical: 9, alignSelf: 'stretch', alignItems: 'center', minHeight: 38, justifyContent: 'center' },
  gameBtnText: { fontFamily: 'FredokaOne', fontSize: 12.5, color: '#FFF' },

  /* Crie do seu jeito — card horizontal violeta. */
  creativeWrap: { marginHorizontal: 16, marginTop: 10 },
  creativeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F7F0FF', borderRadius: radii.lg, borderWidth: 1.5, borderColor: '#E0D0F5',
    padding: 12, ...shadows.card,
  },
  creativeArt: {
    width: 54, height: 54, borderRadius: 15, backgroundColor: '#EBDCFB',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, overflow: 'hidden',
  },
  creativeSheet: {
    position: 'absolute', width: 30, height: 36, borderRadius: 5, backgroundColor: '#FFFDF8',
    borderWidth: HAIR, borderColor: '#E0D0F5', top: 9,
  },
  creativeDot: { position: 'absolute', bottom: 9, width: 6, height: 6, borderRadius: 3 },
  creativeTexts: { flex: 1 },
  creativeTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 2 },
  creativeDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 16 },
  creativeBtn: { borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 9, flexShrink: 0 },
  creativeBtnText: { fontFamily: 'FredokaOne', fontSize: 12.5, color: '#FFF' },

  /* Minhas artes. */
  cardCompact: {
    marginHorizontal: 16, marginTop: 12,
    borderRadius: radii.lg, overflow: 'hidden',
    backgroundColor: '#FFF', ...shadows.soft,
  },
  compactRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  compactIconBg: {
    width: 46, height: 46, borderRadius: 14, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  compactThumb: { width: 46, height: 46 },
  compactTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 2 },
  compactDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 16 },
  compactBtn: { borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 9, flexShrink: 0 },
  compactBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },

  familyNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: pt.goldSoft, marginHorizontal: 12, marginBottom: 12,
    borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: pt.gold + '66',
  },
  familyNoteText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: '#7A5800', fontWeight: '700', lineHeight: 17 },
});
