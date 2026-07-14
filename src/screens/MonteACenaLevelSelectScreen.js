/**
 * MonteACenaLevelSelectScreen.js — SELEÇÃO DE NÍVEIS (M1R2R). Tela clara e infantil. Painel do Beni
 * + TRÊS cartões grandes e coloridos por tema (calm/adventure/challenge). No Modo Criador NENHUM
 * aparece bloqueado / "Em breve" / "Ajustando" — os três abrem a rodada V2 (mesmo motor de gesto).
 * Nenhum nível escrito no JSX (vêm do manifesto).
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import BeniGuideBubble from '../components/beni/BeniGuideBubble';
import ROUTES from '../constants/routes';
import { MONTE_A_CENA_LEVELS, getLevelSource, buildLevelGeometry } from '../data/monteACenaLevels';
import { getCompletedLevels } from '../services/monteACenaSession';

const THEMES = {
  calm: { bg: '#E6F7EE', border: '#B7E4CB', chipBg: '#CFEFDD', chipText: pt.greenDeep, btn: pt.greenDeep },
  adventure: { bg: '#FFF3D6', border: '#F4D08A', chipBg: '#FCE7B5', chipText: pt.goldDeep, btn: pt.goldDeep },
  challenge: { bg: '#F3E8FF', border: '#D7C2F5', chipBg: '#E7DEFB', chipText: pt.purpleDeep, btn: pt.purple },
};

function LevelCard({ level, done, onPlay }) {
  const source = getLevelSource(level);
  const geo = buildLevelGeometry(level);
  const cp = geo.cropPx;
  const th = THEMES[level.theme] || THEMES.calm;
  const thumbW = 88;
  const thumbH = thumbW * geo.boardRatio;
  return (
    <Pressable
      style={[styles.card, { backgroundColor: th.bg, borderColor: th.border }]}
      onPress={onPlay}
      accessibilityRole="button"
      accessibilityLabel={`${level.title}. ${level.chip}. ${level.indicator}.${done ? ' Concluído.' : ''} Jogar.`}
    >
      <View style={styles.thumbWrap}>
        {source ? (
          <Svg width={thumbW} height={thumbH} style={styles.thumb}>
            <SvgImage href={source} x={0} y={0} width={thumbW} height={thumbH} preserveAspectRatio="none"
              viewBox={`${cp.x0} ${cp.y0} ${cp.w} ${cp.h}`} />
          </Svg>
        ) : <View style={[styles.thumb, { width: thumbW, height: thumbH, backgroundColor: pt.creamStrong }]} />}
      </View>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>{level.title}</Text>
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: th.chipBg }]}><Text style={[styles.chipText, { color: th.chipText }]}>{level.chip}</Text></View>
          <View style={[styles.chip, styles.indicator]}><Text style={styles.indicatorText}>{level.indicator}</Text></View>
          {done && <View style={[styles.chip, styles.doneChip]}><Text style={styles.doneChipText}>Concluído</Text></View>}
        </View>
        <View style={[styles.playBtn, { backgroundColor: th.btn }]}><Text style={styles.playText}>Jogar</Text></View>
      </View>
    </Pressable>
  );
}

export default function MonteACenaLevelSelectScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [done, setDone] = useState(() => getCompletedLevels());
  useFocusEffect(useCallback(() => { setDone(getCompletedLevels()); }, []));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Monte a Cena</Text>
        <View style={{ width: 72 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.beniWrap}>
          <BeniGuideBubble message="Escolha um desafio e vamos montar juntos!" avatarVariant="happy" compact />
        </View>
        {MONTE_A_CENA_LEVELS.map((level) => (
          <LevelCard key={level.id} level={level} done={done.includes(level.id)}
            onPlay={() => navigation.navigate(ROUTES.MONTE_A_CENA_GAME_V2, { levelId: level.id })} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backPill: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  beniWrap: { marginTop: 6, marginBottom: 14 },

  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radii.lg + 4, borderWidth: 2, padding: 14, marginBottom: 14, ...shadows.card },
  thumbWrap: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#FFFFFF', ...shadows.soft },
  thumb: { borderRadius: 14 },
  texts: { flex: 1 },
  title: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontFamily: 'FredokaOne', fontSize: 11 },
  indicator: { backgroundColor: 'rgba(255,255,255,0.7)' },
  indicatorText: { fontFamily: 'FredokaOne', fontSize: 11, color: pt.textSoft },
  doneChip: { backgroundColor: pt.greenSoft },
  doneChipText: { fontFamily: 'FredokaOne', fontSize: 11, color: pt.greenDeep },
  playBtn: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingHorizontal: 26, paddingVertical: 11 },
  playText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },
});
