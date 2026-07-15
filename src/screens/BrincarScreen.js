/**
 * BrincarScreen — hub da aba Brincar (Bloco 1.2).
 *
 * Substitui o antigo Ateliê como TELA DA ABA. O nome "Ateliê" some da interface;
 * a IDENTIDADE de rota (`name: 'Ateliê'` em TAB_DEFS) permanece, porque o Onboarding
 * navega por ela e trocá-la quebraria a navegação. `AtelierScreen` continua existindo
 * para o fluxo contextual (`AtelierFromContext`, aberto pelo Cultinho).
 *
 * Atividades user-facing "Para brincar agora": Pares do Beni · Criar livre ·
 * Palavrinhas do Beni · Cadê a Ovelhinha? · Monte a Cena (todas abrem a rota oficial).
 *
 * "Desenho guiado pelo Beni" saiu DESTA TELA por decisão de produto. O fluxo continua
 * vivo: `MISSIONS` (atelierData), `AtelierScreen` e a rota `AtelierCanvas` seguem
 * intactos — só deixaram de ter card na aba.
 *
 * Nenhum placeholder pobre, nenhum emoji — só FaithIcon.
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
import { BeniAvatar } from '../components/beni';
import CenteredContent from '../components/layout/CenteredContent';
import { ROUTES } from '../constants/routes';
import PalavrinhasBeniWarmer from '../components/palavrinhas/PalavrinhasBeniWarmer';
import { iniciarWarmup } from '../services/beniAssetWarmup';
import { listArts } from '../services/atelierStorage';
import { hasAtelierUnlimitedAccess } from '../services/accessControl';
import { getDailyRounds } from '../services/brincarDailyService';
import { backLabelFor, isFromTab } from '../utils/originBack';

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

/** Card de atividade ATIVA — abre agora. `activeOpacity` dá o estado pressionado. */
function ActiveTile({ icon, title, desc, cta, tint, border, bg, btnColor, onPress }) {
  return (
    <SoundButton
      style={[styles.tile, styles.tileAtivo, { backgroundColor: tint, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${desc}`}
    >
      <View style={[styles.tileIconBg, { backgroundColor: bg }]}>
        <FaithIcon name={icon} size={24} color={btnColor} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileDesc} numberOfLines={2}>{desc}</Text>
      <View style={[styles.tileBtn, { backgroundColor: btnColor }]}>
        <Text style={styles.tileBtnText}>{cta}</Text>
      </View>
    </SoundButton>
  );
}

/** Card ATIVO LARGO (linha) — usado para Palavrinhas do Beni (user-facing, UF1). */
function WideActiveTile({ icon, title, desc, cta, hint, tint, border, bg, btnColor, onPress }) {
  return (
    <SoundButton
      style={[styles.wideTile, { backgroundColor: tint, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${desc}`}
    >
      <View style={[styles.wideIconBg, { backgroundColor: bg }]}>
        <FaithIcon name={icon} size={26} color={btnColor} />
      </View>
      <View style={styles.wideTexts}>
        <Text style={styles.wideTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.compactDesc} numberOfLines={2}>{desc}</Text>
        {hint ? <Text style={styles.wideHint}>{hint}</Text> : null}
      </View>
      <View style={[styles.compactBtn, { backgroundColor: btnColor }]}>
        <Text style={styles.compactBtnText}>{cta}</Text>
      </View>
    </SoundButton>
  );
}


export default function BrincarScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const from = route?.params?.from;
  const showBack = !isFromTab(from);

  const [artCount, setArtCount] = useState(0);
  const [rounds, setRounds] = useState(null);

  const premium = hasAtelierUnlimitedAccess();
  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;   // UF1 — limite diário grátis atingido
  const montadoRef = useRef(true);

  // P4R8: aquecimento ANTECIPADO das poses do Beni já na aba Brincar (não bloqueia esta tela).
  useEffect(() => {
    montadoRef.current = true;
    iniciarWarmup();
    return () => { montadoRef.current = false; };
  }, []);

  // P4R9 §1/§4: o primeiro toque NUNCA parece ignorado — navega IMEDIATAMENTE. A tela de destino
  // mostra "Preparando o Beni..." se as poses ainda não decodificaram (nunca moldura vazia).
  const abrirPalavrinhas = useCallback(() => {
    navigation.navigate(ROUTES.PALAVRINHAS_DO_BENI);
  }, [navigation]);

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
      // Safe area real: em iPhone com barra inferior, 28px cortavam o último card.
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER — o Beni recebe a criança; a mensagem é curta ── */}
      <LinearGradient
        colors={['#F0E8FF', '#E4D6FF', '#D6ECFF']}
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
        <View style={styles.headerRow}>
          <BeniAvatar variant="happy" size="medium" />
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Brincar com o Beni</Text>
            <Text style={styles.headerSub}>Escolha uma brincadeira. Eu fico aqui do seu lado!</Text>
          </View>
        </View>
        {roundsPill}
      </LinearGradient>

      <CenteredContent>
        {/* ── ATIVAS ── */}
        <AnimatedCard delay={70} style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Para brincar agora</Text>
          <Text style={styles.sectionSub}>Atividades prontinhas para você.</Text>
        </AnimatedCard>

        <AnimatedCard delay={120} style={styles.row}>
          <View style={styles.rowItem}>
            <ActiveTile
              icon="pares"
              title="Pares do Beni"
              desc="Encontre as figuras iguais das histórias."
              cta="Jogar"
              tint="#E8F0FF" border="#BFD6FF" bg="#3B82F620" btnColor={pt.faithBlue}
              onPress={() => navigation.navigate(ROUTES.PARES_DO_BENI)}
            />
          </View>
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
        </AnimatedCard>

        {/* UF1 — Palavrinhas do Beni: jogo de soletração user-facing (card largo, próprio). */}
        <AnimatedCard delay={165} style={styles.wideRow}>
          <WideActiveTile
            icon="palavrinhas"
            title="Palavrinhas do Beni"
            desc="Soletre e descubra as letrinhas escondidas nas palavras."
            cta="Jogar"
            hint={semRodadas ? 'As rodadas de hoje acabaram — amanhã tem mais.' : null}
            tint="#FFF4D6" border="#F4D08A" bg="#F4B23C20" btnColor={pt.goldDeep}
            onPress={abrirPalavrinhas}
          />
        </AnimatedCard>

        {/* OV4 — Cadê a Ovelhinha?: jogo de observação user-facing (card largo). O limite diário
            oficial (brincarDailyService) é aplicado DENTRO da tela, ao iniciar a partida. */}
        <AnimatedCard delay={185} style={styles.wideRow}>
          <WideActiveTile
            icon="ovelha"
            title="Cadê a Ovelhinha?"
            desc="Observe com atenção e encontre a ovelhinha escondida!"
            cta="Jogar"
            hint={semRodadas ? 'As brincadeiras de hoje acabaram — amanhã tem mais.' : null}
            tint="#E6F7EE" border="#B7E4CB" bg="#0E9F6E20" btnColor={pt.greenDeep}
            onPress={() => navigation.navigate(ROUTES.CADE_A_OVELHINHA)}
          />
        </AnimatedCard>

        {/* Monte a Cena — jogo user-facing (aprovado, fca92f5). Card LARGO igual a Palavrinhas/
            Ovelhinha, abre a ROTA OFICIAL. É conteúdo final (sem selo de desenvolvimento). A
            seção de "novidades a caminho" saiu por ficar vazia — reintroduzir só com novo jogo. */}
        <AnimatedCard delay={205} style={styles.wideRow}>
          <WideActiveTile
            icon="puzzle"
            title="Monte a Cena"
            desc="Junte as peças e revele uma cena da Bíblia."
            cta="Jogar"
            tint="#F3E8FF" border="#D7C2F5" bg="#7C3AED20" btnColor={pt.purple}
            onPress={() => navigation.navigate(ROUTES.MONTE_A_CENA_HOME)}
          />
        </AnimatedCard>

        {/* ── Minhas artes ── */}
        <AnimatedCard delay={300} style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Suas coisas</Text>
        </AnimatedCard>

        <AnimatedCard delay={330} style={styles.cardCompact}>
          <SoundButton
            style={styles.compactRow}
            onPress={() => navigation.navigate(ROUTES.ATELIER_GALLERY)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Ver minhas artes"
          >
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
      {/* Aquecedor offscreen das poses do Beni (decodifica em segundo plano; não bloqueia a tela). */}
      <PalavrinhasBeniWarmer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },

  header: {
    paddingHorizontal: 20, paddingBottom: 16, marginBottom: 2,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerTexts: { flex: 1 },
  backPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
  backPillText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#6E3FB5' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.text, marginBottom: 4 },
  headerSub: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19 },

  roundsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 9,
    marginTop: 14,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.12)',
  },
  roundsText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.text, fontWeight: '700', lineHeight: 17 },

  sectionHead: { marginTop: 20, marginHorizontal: 18 },
  sectionTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  sectionSub: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 2 },

  row: { flexDirection: 'row', gap: 10, marginTop: 10, marginHorizontal: 16 },
  rowItem: { flex: 1 },

  // UF1 — card largo (linha) do Palavrinhas do Beni.
  wideRow: { marginTop: 10, marginHorizontal: 16 },
  wideTile: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: radii.lg, borderWidth: 2, padding: 13, ...shadows.card,
  },
  wideIconBg: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  wideTexts: { flex: 1 },
  wideTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 2 },
  wideHint: { fontFamily: 'Nunito', fontSize: 11, color: '#7A5800', fontWeight: '800', marginTop: 3 },

  tile: {
    flex: 1, borderRadius: radii.lg, borderWidth: 1.5, padding: 13,
    alignItems: 'flex-start', ...shadows.soft,
  },
  // Card jogável: borda firme e sombra de cartão.
  tileAtivo: { borderWidth: 2, ...shadows.card },
  tileIconBg: {
    width: 42, height: 42, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 9,
  },
  tileTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 3, minHeight: 38 },
  tileDesc: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, lineHeight: 15, marginBottom: 10, minHeight: 30 },
  tileBtn: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 9, alignSelf: 'stretch', alignItems: 'center' },
  tileBtnText: { fontFamily: 'FredokaOne', fontSize: 12, color: '#FFF' },

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
