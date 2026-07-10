/**
 * BrincarScreen — hub da aba Brincar (Bloco 1.2).
 *
 * Substitui o antigo Ateliê como TELA DA ABA. O nome "Ateliê" some da interface;
 * a IDENTIDADE de rota (`name: 'Ateliê'` em TAB_DEFS) permanece, porque o Onboarding
 * navega por ela e trocá-la quebraria a navegação. `AtelierScreen` continua existindo
 * para o fluxo contextual (`AtelierFromContext`, aberto pelo Cultinho).
 *
 * Seis atividades:
 *   ATIVAS  — Desenho guiado pelo Beni · Criar livre (reaproveitam AtelierCanvas)
 *   EM PREPARO — Pares do Beni · Palavrinhas do Beni · Bichinhos da Bíblia · Cadê a Ovelhinha?
 *
 * Os cards em preparo NÃO abrem tela: são parte do produto, com visual próprio e
 * selo honesto. Nenhum placeholder pobre, nenhum emoji — só FaithIcon.
 *
 * Rodadas: o plano gratuito tem 2 por dia (brincarDailyService). Nada é consumido aqui
 * — o hub só INFORMA. Quem consome rodada é o jogo, quando existir.
 *
 * "Colorir uma história" NÃO é card desta aba (decisão de produto): a criança colore
 * a partir da história, em Aventuras.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { BeniGuideBubble } from '../components/beni';
import CenteredContent from '../components/layout/CenteredContent';
import { ROUTES } from '../constants/routes';
import { MISSIONS } from '../data/atelierData';
import { listArts } from '../services/atelierStorage';
import { hasAtelierUnlimitedAccess } from '../services/accessControl';
import { getDailyRounds } from '../services/brincarDailyService';
import { backLabelFor, isFromTab } from '../utils/originBack';

function pickMission() {
  return MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
}

/** Atividades ainda em preparação. Ordem = ordem de chegada planejada. */
const EM_PREPARO = [
  { key: 'ovelha', icon: 'ovelha', title: 'Cadê a Ovelhinha?', desc: 'Procure a ovelhinha escondida.', tint: '#E6F7EE', border: '#B7E4CB', bg: '#0E9F6E20' },
  { key: 'palavrinhas', icon: 'palavrinhas', title: 'Palavrinhas do Beni', desc: 'Monte palavras da Bíblia.', tint: '#FFF4D6', border: '#F4D08A', bg: '#F4B23C20' },
  { key: 'bichinhos', icon: 'bichinhos', title: 'Bichinhos da Bíblia', desc: 'Descubra os animais das histórias.', tint: '#F3E8FF', border: '#D7C2F5', bg: '#7C3AED20' },
];

function AnimatedCard({ delay, children, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 460, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 460, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {children}
    </Animated.View>
  );
}

/** Card de atividade ATIVA — abre agora. */
function ActiveTile({ icon, title, desc, cta, tint, border, bg, btnColor, onPress }) {
  return (
    <SoundButton style={[styles.tile, { backgroundColor: tint, borderColor: border }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.tileIconBg, { backgroundColor: bg }]}>
        <FaithIcon name={icon} size={22} color={btnColor} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileDesc} numberOfLines={2}>{desc}</Text>
      <View style={[styles.tileBtn, { backgroundColor: btnColor }]}>
        <Text style={styles.tileBtnText}>{cta}</Text>
      </View>
    </SoundButton>
  );
}

/** Card de atividade EM PREPARO — não abre tela, e não parece um erro. */
function ComingTile({ icon, title, desc, tint, border, bg }) {
  return (
    <View style={[styles.tile, styles.tileComing, { backgroundColor: tint, borderColor: border }]}>
      <View style={styles.comingBadge}>
        <Text style={styles.comingBadgeText}>Chegando</Text>
      </View>
      <View style={[styles.tileIconBg, { backgroundColor: bg }]}>
        <FaithIcon name={icon} size={22} color={pt.textSoft} />
      </View>
      <Text style={[styles.tileTitle, styles.tileTitleComing]}>{title}</Text>
      <Text style={styles.tileDesc} numberOfLines={2}>{desc}</Text>
      <View style={styles.comingFoot}>
        <Text style={styles.comingFootText}>O Beni está preparando</Text>
      </View>
    </View>
  );
}

export default function BrincarScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const from = route?.params?.from;
  const showBack = !isFromTab(from);

  const [mission] = useState(pickMission);
  const [artCount, setArtCount] = useState(0);
  const [rounds, setRounds] = useState(null);

  const premium = hasAtelierUnlimitedAccess();

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      listArts().then((list) => { if (vivo) setArtCount(list.length); });
      getDailyRounds().then((r) => { if (vivo) setRounds(r); });
      return () => { vivo = false; };
    }, []),
  );

  /* ── Aviso discreto das rodadas do dia ── */
  const roundsPill = (
    <View style={styles.roundsPill}>
      <FaithIcon name="star" size={14} color={pt.goldDeep} />
      <Text style={styles.roundsText}>
        {premium
          ? 'Você pode brincar quantas vezes quiser.'
          : rounds == null
            ? 'Preparando suas rodadas de hoje…'
            : rounds.remaining > 0
              ? `Você tem ${rounds.remaining} rodada${rounds.remaining === 1 ? '' : 's'} para brincar hoje.`
              : 'As rodadas de hoje acabaram. Amanhã tem mais!'}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#F0E8FF', '#E0D4FF', '#D0EAFF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 32) }]}
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
        <Text style={styles.headerTitle}>Brincar com o Beni</Text>
        <Text style={styles.headerSub}>Jogos e desenhos para aprender se divertindo.</Text>
      </LinearGradient>

      <CenteredContent>
        <AnimatedCard delay={40} style={styles.panel}>
          <BeniGuideBubble
            message="Escolha uma brincadeira! Eu fico aqui do seu lado."
            avatarVariant="happy"
            tone="purple"
            compact
            style={{ marginBottom: 4 }}
          />
          {roundsPill}
        </AnimatedCard>

        {/* ── ATIVAS ── */}
        <AnimatedCard delay={110} style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Para brincar agora</Text>
        </AnimatedCard>

        <AnimatedCard delay={150} style={styles.row}>
          <View style={styles.rowItem}>
            <ActiveTile
              icon="pares"
              title="Pares do Beni"
              desc="Encontre as figuras iguais das histórias."
              cta="Jogar"
              tint="#E8F0FF" border="#BFD6FF" bg="#3B82F620" btnColor="#2B5BA1"
              onPress={() => navigation.navigate(ROUTES.PARES_DO_BENI)}
            />
          </View>
          <View style={styles.rowItem}>
            <ActiveTile
              icon="desenho_guiado"
              title="Desenho guiado pelo Beni"
              desc="Receba uma ideia simples para desenhar hoje."
              cta="Começar"
              tint="#FFF4D6" border="#F4D08A" bg="#FFD70050" btnColor={pt.goldDeep}
              onPress={() => navigation.navigate(ROUTES.ATELIER_CANVAS, { mission })}
            />
          </View>
        </AnimatedCard>

        <AnimatedCard delay={190} style={styles.row}>
          <View style={styles.rowItem}>
            <ActiveTile
              icon="criar_livre"
              title="Criar livre"
              desc="Desenhe do seu jeito, com as cores que quiser."
              cta="Abrir folha"
              tint="#F3E8FF" border="#D7C2F5" bg="#C4A8FF50" btnColor={pt.purple}
              onPress={() => navigation.navigate(ROUTES.ATELIER_CANVAS, {})}
            />
          </View>
          <View style={styles.rowItem} />
        </AnimatedCard>

        {/* ── EM PREPARO ── */}
        <AnimatedCard delay={230} style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Chegando em breve</Text>
          <Text style={styles.sectionSub}>Novas brincadeiras a caminho.</Text>
        </AnimatedCard>

        <AnimatedCard delay={270} style={styles.row}>
          <View style={styles.rowItem}><ComingTile {...EM_PREPARO[0]} /></View>
          <View style={styles.rowItem}><ComingTile {...EM_PREPARO[1]} /></View>
        </AnimatedCard>
        <AnimatedCard delay={310} style={styles.row}>
          <View style={styles.rowItem}><ComingTile {...EM_PREPARO[2]} /></View>
          <View style={styles.rowItem} />
        </AnimatedCard>

        {/* ── Minhas artes ── */}
        <AnimatedCard delay={330} style={styles.cardCompact}>
          <SoundButton style={styles.compactRow} onPress={() => navigation.navigate(ROUTES.ATELIER_GALLERY)} activeOpacity={0.85}>
            <View style={[styles.compactIconBg, { backgroundColor: '#D8F2E2' }]}>
              <FaithIcon name="gallery" size={20} color={pt.greenDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.compactTitle}>Minhas artes</Text>
              <Text style={styles.compactDesc}>
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
      </CenteredContent>
      <View style={{ height: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },

  header: { paddingHorizontal: 20, paddingBottom: 18, marginBottom: 4 },
  backPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
  backPillText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#6E3FB5' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 26, color: pt.text, marginBottom: 6 },
  headerSub: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19 },

  panel: {
    marginTop: 12, marginHorizontal: 16,
    backgroundColor: '#FBF7FF', borderRadius: radii.xl,
    borderWidth: 1.5, borderColor: '#E5D9F7',
    paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12,
    ...shadows.card,
  },

  roundsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8,
    marginTop: 8,
  },
  roundsText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.text, fontWeight: '700', lineHeight: 17 },

  sectionHead: { marginTop: 18, marginHorizontal: 18 },
  sectionTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  sectionSub: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 2 },

  row: { flexDirection: 'row', gap: 10, marginTop: 10, marginHorizontal: 16 },
  rowItem: { flex: 1 },

  tile: {
    flex: 1, borderRadius: radii.lg, borderWidth: 1.5, padding: 12,
    alignItems: 'flex-start', ...shadows.soft,
  },
  tileComing: { opacity: 0.94 },
  tileIconBg: {
    width: 40, height: 40, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  tileTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 3, minHeight: 38 },
  tileTitleComing: { color: pt.textSoft },
  tileDesc: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, lineHeight: 15, marginBottom: 10, minHeight: 30 },
  tileBtn: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 9, alignSelf: 'stretch', alignItems: 'center' },
  tileBtnText: { fontFamily: 'FredokaOne', fontSize: 12, color: '#FFF' },

  comingBadge: {
    alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 3,
    marginBottom: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  comingBadgeText: { fontFamily: 'Nunito', fontSize: 10, fontWeight: '800', color: pt.textSoft },
  comingFoot: {
    alignSelf: 'stretch', alignItems: 'center',
    borderRadius: radii.pill, paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  comingFootText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft },

  cardCompact: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: radii.lg, overflow: 'hidden',
    backgroundColor: '#FFF', ...shadows.soft,
  },
  compactRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  compactIconBg: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
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
