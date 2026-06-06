import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import { BeniGuideBubble } from '../components/beni';
import CenteredContent from '../components/layout/CenteredContent';
import { MISSIONS } from '../data/atelierData';
import { listArts, ATELIER_FREE_SAVE_LIMIT } from '../services/atelierStorage';

function pickMission() {
  return MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
}

function AnimatedCard({ delay, children, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(28)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {children}
    </Animated.View>
  );
}

export default function AtelierScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [mission] = useState(pickMission);
  const [artCount, setArtCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      listArts().then(list => setArtCount(list.length));
    }, []),
  );

  const savePercent = Math.min(artCount / ATELIER_FREE_SAVE_LIMIT, 1);

  /* ── Porta 1: Pintar uma cena — AÇÃO PRINCIPAL ── */
  const pintarCenaCard = (
    <AnimatedCard delay={90} style={[styles.card, styles.cardPrincipal, styles.inMesa]}>
      <LinearGradient colors={['#EAF2FF', '#BFDCFF']} style={styles.cardGradient}>
        <View style={styles.principalTag}>
          <Text style={styles.principalTagText}>✨ Comece por aqui</Text>
        </View>
        <View style={styles.cardRow}>
          <View style={[styles.cardEmojiBg, styles.cardEmojiBgPrincipal]}>
            <Text style={styles.cardEmojiPrincipal}>🖼️</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitlePrincipal}>Pintar uma cena</Text>
            <Text style={styles.cardDesc}>
              Escolha uma história e dê cor ao desenho.
            </Text>
          </View>
        </View>
        <SoundButton
          style={[styles.cardBtn, styles.cardBtnPrincipal, { backgroundColor: '#3B82F6' }]}
          onPress={() => navigation.navigate('Aventuras')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardBtnTextPrincipal}>Escolher desenho</Text>
        </SoundButton>
      </LinearGradient>
    </AnimatedCard>
  );

  /* ── Portas secundárias: Desafio + Folha livre (2 colunas) ── */
  const secondaryDoors = (
    <AnimatedCard delay={160} style={[styles.secondaryRow, styles.inMesa]}>
      {/* Desafio do Beni */}
      <SoundButton
        style={[styles.tile, { backgroundColor: '#FFF4D6', borderColor: '#F4D08A' }]}
        onPress={() => navigation.navigate('AtelierCanvas', { mission })}
        activeOpacity={0.85}
      >
        <View style={[styles.tileEmojiBg, { backgroundColor: '#FFD70050' }]}>
          <Text style={styles.tileEmoji}>💡</Text>
        </View>
        <Text style={styles.tileTitle}>Desafio do Beni</Text>
        <Text style={styles.tileDesc} numberOfLines={2}>Uma ideia especial para desenhar hoje.</Text>
        <View style={[styles.tileBtn, { backgroundColor: '#F4B23C' }]}>
          <Text style={styles.tileBtnText}>Aceitar</Text>
        </View>
      </SoundButton>

      {/* Folha livre */}
      <SoundButton
        style={[styles.tile, { backgroundColor: '#F3E8FF', borderColor: '#D7C2F5' }]}
        onPress={() => navigation.navigate('AtelierCanvas', {})}
        activeOpacity={0.85}
      >
        <View style={[styles.tileEmojiBg, { backgroundColor: '#C4A8FF50' }]}>
          <Text style={styles.tileEmoji}>📄</Text>
        </View>
        <Text style={styles.tileTitle}>Folha livre</Text>
        <Text style={styles.tileDesc} numberOfLines={2}>Crie do seu jeito.</Text>
        <View style={[styles.tileBtn, { backgroundColor: '#8E44AD' }]}>
          <Text style={styles.tileBtnText}>Abrir</Text>
        </View>
      </SoundButton>
    </AnimatedCard>
  );

  /* ── Porta 4: Minhas artes — galeria compacta e objetiva ── */
  const minhasArtesCard = (
    <AnimatedCard delay={290} style={styles.cardCompact}>
      <SoundButton
        style={styles.compactRow}
        onPress={() => navigation.navigate('AtelierGallery')}
        activeOpacity={0.85}
      >
        <View style={[styles.compactEmojiBg, { backgroundColor: '#D8F2E2' }]}>
          <Text style={styles.compactEmoji}>🖼️</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.compactTitle}>Minhas artes</Text>
          <Text style={styles.compactDesc}>
            {artCount} de {ATELIER_FREE_SAVE_LIMIT} artes salvas
          </Text>
          <View style={styles.saveBar}>
            <View style={[styles.saveBarFill, { width: `${savePercent * 100}%` }]} />
          </View>
        </View>
        <View style={[styles.compactBtn, { backgroundColor: '#34A853' }]}>
          <Text style={styles.compactBtnText}>Ver</Text>
        </View>
      </SoundButton>
    </AnimatedCard>
  );

  /* ── Mesa criativa — container único da oficina do Beni ── */
  const mesaCriativa = (
    <AnimatedCard delay={40} style={styles.mesaPanel}>
      <View style={styles.mesaHeaderRow}>
        <Text style={styles.mesaLabel}>🎨 Mesa criativa</Text>
      </View>
      <BeniGuideBubble
        message="Vamos criar uma arte juntos?"
        avatarVariant="artist"
        tone="purple"
        compact
        style={styles.mesaBubble}
      />
      {/* Ação principal */}
      {pintarCenaCard}
      {/* Ações secundárias (2 colunas) */}
      {secondaryDoors}
    </AnimatedCard>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#F0E8FF', '#E0D4FF', '#D0EAFF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 32) }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Ateliê do Beni</Text>
            <Text style={styles.headerSub}>
              Pinte, crie e guarde suas artes de fé.
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── CONTEÚDO ── */}
      <CenteredContent>
        {mesaCriativa}
        {minhasArtesCard}
      </CenteredContent>

      <View style={{ height: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, paddingRight: 12 },
  headerTitle: {
    fontFamily: 'FredokaOne', fontSize: 26, color: pt.text,
    marginBottom: 6,
  },
  headerSub: {
    fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft,
    lineHeight: 19,
  },
  headerAvatar: { flexShrink: 0 },

  // ── Mesa criativa (container único da oficina) ──
  mesaPanel: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#FBF7FF',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: '#E5D9F7',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14,
    ...shadows.card,
  },
  mesaHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, marginLeft: 2,
  },
  mesaLabel: {
    fontFamily: 'FredokaOne', fontSize: 16, color: pt.text,
  },
  mesaBubble: { marginBottom: 2 },
  // Cards dentro da Mesa — sem margem horizontal própria
  inMesa: { marginHorizontal: 0 },

  // ── Cards (porta padrão) ──
  card: {
    marginHorizontal: 16, marginTop: 12,
    borderRadius: radii.xl, overflow: 'hidden',
    ...shadows.card,
  },
  cardPrincipal: {
    borderWidth: 2, borderColor: '#7FB2FF',
    marginTop: 14,
  },
  cardGradient: { padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardEmojiBg: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#FFD70040',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  cardEmojiBgPrincipal: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: '#A9CEFF80',
  },
  cardEmoji: { fontSize: 24 },
  cardEmojiPrincipal: { fontSize: 30 },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginBottom: 3 },
  cardTitlePrincipal: { fontFamily: 'FredokaOne', fontSize: 19, color: pt.text, marginBottom: 3 },
  cardDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 18 },

  // ── Tag "principal" ──
  principalTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.16)',
    borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    marginBottom: 10,
  },
  principalTagText: {
    fontFamily: 'Nunito', fontSize: 11, color: '#1E5BB8', fontWeight: '700',
  },
  cardBtnPrincipal: { paddingVertical: 15 },
  cardBtnTextPrincipal: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },

  // ── Portas secundárias (2 colunas: Desafio + Folha) ──
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  tile: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'flex-start',
    ...shadows.soft,
  },
  tileEmojiBg: {
    width: 40, height: 40, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  tileEmoji: { fontSize: 20 },
  tileTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 3 },
  tileDesc: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft, lineHeight: 15,
    marginBottom: 10, minHeight: 30,
  },
  tileBtn: {
    borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8,
    alignSelf: 'stretch', alignItems: 'center',
  },
  tileBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },

  // ── Cards compactos (folha livre / minhas artes) ──
  cardCompact: {
    marginHorizontal: 16, marginTop: 12,
    borderRadius: radii.lg, overflow: 'hidden',
    backgroundColor: '#FFF',
    ...shadows.soft,
  },
  compactRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 12,
  },
  compactEmojiBg: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  compactEmoji: { fontSize: 22 },
  compactTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 2 },
  compactDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 16 },
  compactBtn: {
    borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 9, flexShrink: 0,
  },
  compactBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },

  missionBox: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: radii.md, padding: 12, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: '#F4B23C',
  },
  missionText: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.text,
    fontStyle: 'italic', lineHeight: 20, fontWeight: '700',
  },

  saveCountCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  saveCountLabel: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.text, fontWeight: '700', marginBottom: 6,
  },
  saveBar: {
    height: 5, backgroundColor: 'rgba(52,168,83,0.2)', borderRadius: 3, overflow: 'hidden',
    marginTop: 5,
  },
  saveBarFill: { height: '100%', backgroundColor: '#34A853', borderRadius: 3 },

  cardBtn: {
    borderRadius: radii.lg, paddingVertical: 14, alignItems: 'center',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4,
  },
  cardBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },

  // ── Beni guide ──
  beniWrap: { marginTop: 14 },
  beniCard: { marginHorizontal: 16 },
});
