import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Animated, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import { LumiGuideCard } from '../components/lumi';
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

  /* ── Cards ── */
  const folhaMagicaCard = (
    <AnimatedCard delay={80} style={styles.card}>
      <LinearGradient colors={['#FFF4D6', '#FFEAA0']} style={styles.cardGradient}>
        <View style={styles.cardRow}>
          <View style={styles.cardEmojiBg}>
            <Text style={styles.cardEmoji}>📄✨</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Minha Folha Mágica</Text>
            <Text style={styles.cardDesc}>
              Comece com uma folha em branco e crie uma arte só sua.
            </Text>
          </View>
        </View>
        <SoundButton
          style={styles.cardBtn}
          onPress={() => navigation.navigate('AtelierCanvas', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.cardBtnText}>✏️ Criar minha arte</Text>
        </SoundButton>
      </LinearGradient>
    </AnimatedCard>
  );

  const desafioCard = (
    <AnimatedCard delay={180} style={styles.card}>
      <LinearGradient colors={['#E8F5FD', '#C8E6F9']} style={styles.cardGradient}>
        <View style={styles.cardRow}>
          <View style={[styles.cardEmojiBg, { backgroundColor: '#BDD9F280' }]}>
            <Text style={styles.cardEmoji}>💡</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Desafio da Imaginação</Text>
            <Text style={styles.cardDesc}>Uma ideia especial para desenhar hoje.</Text>
          </View>
        </View>
        <View style={styles.missionBox}>
          <Text style={styles.missionText}>"{mission}"</Text>
        </View>
        <SoundButton
          style={[styles.cardBtn, { backgroundColor: '#5BAAD4' }]}
          onPress={() => navigation.navigate('AtelierCanvas', { mission })}
          activeOpacity={0.85}
        >
          <Text style={styles.cardBtnText}>🌟 Criar com essa ideia</Text>
        </SoundButton>
      </LinearGradient>
    </AnimatedCard>
  );

  const galeriaCard = (
    <AnimatedCard delay={280} style={styles.card}>
      <LinearGradient colors={['#F3E8FF', '#E0C8FF']} style={styles.cardGradient}>
        <View style={styles.cardRow}>
          <View style={[styles.cardEmojiBg, { backgroundColor: '#D4A8FF80' }]}>
            <Text style={styles.cardEmoji}>🖼️</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Galeria dos Pequenos Artistas</Text>
            <Text style={styles.cardDesc}>Veja suas artes salvas e continue desenhando.</Text>
          </View>
        </View>
        <View style={styles.saveCountCard}>
          <Text style={styles.saveCountLabel}>
            🗂️ {artCount} de {ATELIER_FREE_SAVE_LIMIT} artes salvas
          </Text>
          <View style={styles.saveBar}>
            <View style={[styles.saveBarFill, { width: `${savePercent * 100}%` }]} />
          </View>
        </View>
        <SoundButton
          style={[styles.cardBtn, { backgroundColor: '#8E44AD' }]}
          onPress={() => navigation.navigate('AtelierGallery')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardBtnText}>🖼️ Ver minhas artes</Text>
        </SoundButton>
      </LinearGradient>
    </AnimatedCard>
  );

  const lumiCard = (
    <AnimatedCard delay={360} style={styles.lumiCardWrap}>
      <LumiGuideCard context="atelier" style={styles.lumiCard} />
    </AnimatedCard>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER (full width) ── */}
      <LinearGradient
        colors={['#FFF8EF', '#FFEEC7', '#E8F5FD']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 32) }]}
      >
        <Text style={styles.headerEmoji}>🎨</Text>
        <Text style={styles.headerTitle}>Ateliê da Criação</Text>
        <Text style={styles.headerSub}>
          Desenhe, pinte e salve suas criações.
        </Text>
      </LinearGradient>

      {/* ── COLUNA ÚNICA CENTRALIZADA ── */}
      <CenteredContent>
        {folhaMagicaCard}
        {desafioCard}
        {galeriaCard}
        {lumiCard}
      </CenteredContent>

      <View style={{ height: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },

  header: {
    alignItems: 'center', paddingBottom: 28,
    paddingHorizontal: 24, marginBottom: 4,
  },
  headerEmoji: { fontSize: 52, marginBottom: 8 },
  headerTitle: {
    fontFamily: 'FredokaOne', fontSize: 28, color: pt.text,
    marginBottom: 8, textAlign: 'center',
  },
  headerSub: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft,
    textAlign: 'center', lineHeight: 20,
  },

  card: {
    marginHorizontal: 16, marginTop: 14,
    borderRadius: radii.xl, overflow: 'hidden',
    ...shadows.card,
  },
  cardGradient: { padding: 18 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardEmojiBg: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: '#FFD70040',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text, marginBottom: 3 },
  cardDesc: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 18 },

  missionBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.md, padding: 12, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: '#5BAAD4',
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
    height: 5, backgroundColor: 'rgba(142,68,173,0.2)', borderRadius: 3, overflow: 'hidden',
  },
  saveBarFill: { height: '100%', backgroundColor: '#8E44AD', borderRadius: 3 },

  cardBtn: {
    backgroundColor: colors.action,
    borderRadius: radii.lg, paddingVertical: 14, alignItems: 'center',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  cardBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },

  lumiCardWrap: { marginTop: 14 },
  lumiCard: { marginHorizontal: 16 },
});
