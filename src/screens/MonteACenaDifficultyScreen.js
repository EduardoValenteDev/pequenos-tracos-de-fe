/**
 * MonteACenaDifficultyScreen.js — Mesa do Beni (M1R6). Prepara o quebra-cabeça: o quadro escolhido
 * foi posto sobre uma mesa infantil e está pronto para virar quebra-cabeça. NÃO parece uma tela de
 * configurações: superfície de mesa suave, imagem grande no centro (sem borda branca interna),
 * peças decorativas abstratas e uma pergunta lúdica.
 *
 * A quantidade (4/6/9) é escolhida em TRÊS placas táteis grandes (não três botões "Jogar", não a
 * imagem repetida três vezes). A placa selecionada sobe, ganha contorno dourado, cresce ~5%, dá
 * háptico leve e atualiza a prévia das divisões sobre a imagem. Abaixo, UM único botão principal:
 * "Começar a montar" → rodada real (motor js-safe).
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Image as SvgImage, Line, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import ROUTES from '../constants/routes';
import { getPuzzleScene, getStorySceneSource, getStoryForScene } from '../data/monteACenaStories';
import { getDifficultyConfig } from '../data/monteACenaCatalog';

const OPTIONS = [
  { count: 4, cols: 2, rows: 2, label: 'Para começar' },
  { count: 6, cols: 3, rows: 2, label: 'Vamos montar' },
  { count: 9, cols: 3, rows: 3, label: 'Grande desafio' },
];

function GridIcon({ cols, rows, active }) {
  const s = 26; const gap = 3; const cell = (s - (cols - 1) * gap) / cols; const cellH = (s - (rows - 1) * gap) / rows;
  const dots = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    dots.push(<Rect key={`${r}-${c}`} x={c * (cell + gap)} y={r * (cellH + gap)} width={cell} height={cellH} rx={2} fill={active ? '#FFF' : pt.purple} opacity={active ? 0.95 : 0.5} />);
  }
  return <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>{dots}</Svg>;
}

export default function MonteACenaDifficultyScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const scene = getPuzzleScene(route?.params?.puzzleSceneId);
  const story = scene ? getStoryForScene(scene.puzzleSceneId) : null;
  const [selected, setSelected] = useState(4);

  if (!scene) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}><Pressable style={styles.backPill} onPress={() => navigation.goBack()} hitSlop={8}><Text style={styles.backText}>‹ Voltar</Text></Pressable><View style={{ width: 60 }} /></View>
        <Text style={styles.err}>Quadro não encontrado.</Text>
      </View>
    );
  }

  const source = getStorySceneSource(scene);
  const cp = { x0: scene.crop.x * scene.artWidth, y0: scene.crop.y * scene.artHeight, w: scene.crop.w * scene.artWidth, h: scene.crop.h * scene.artHeight };
  const imgW = Math.min(screenW - 96, 250);
  const imgH = imgW * 1.2496;

  // Prévia das divisões (seams) da dificuldade selecionada, sobre a imagem.
  const preview = useMemo(() => {
    const d = getDifficultyConfig(selected);
    return { x: d.seamsX || [], y: d.seamsY || [] };
  }, [selected]);

  const onSelect = (count) => {
    setSelected(count);
    try { Haptics.selectionAsync(); } catch { /* háptico é opcional */ }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStory} numberOfLines={1}>{story ? story.storyTitle : ''}</Text>
          <Text style={styles.headerQuadro} numberOfLines={1}>{scene.title}</Text>
        </View>
        <View style={styles.headerRight}>
          {scene.premium ? (
            <View style={[styles.stateChip, styles.stateFamily]}><Text style={styles.stateFamilyText}>Família</Text></View>
          ) : (
            <View style={[styles.stateChip, styles.stateFree]}><Text style={styles.stateFreeText}>Grátis</Text></View>
          )}
        </View>
      </View>

      {/* Mesa: superfície suave com a imagem grande e peças decorativas */}
      <View style={styles.tableWrap}>
        <View style={styles.table}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.imageShadow}>
            <View style={styles.imageCard}>
              {source ? (
                <Svg width={imgW} height={imgH} style={styles.image}>
                  <SvgImage href={source} x={0} y={0} width={imgW} height={imgH} preserveAspectRatio="none" viewBox={`${cp.x0} ${cp.y0} ${cp.w} ${cp.h}`} />
                  {preview.x.map((x, i) => (<Line key={`vx-${i}`} x1={cp.x0 + x * cp.w} y1={cp.y0} x2={cp.x0 + x * cp.w} y2={cp.y0 + cp.h} stroke="#FFFFFF" strokeWidth={5} opacity={0.55} />))}
                  {preview.y.map((y, i) => (<Line key={`hy-${i}`} x1={cp.x0} y1={cp.y0 + y * cp.h} x2={cp.x0 + cp.w} y2={cp.y0 + y * cp.h} stroke="#FFFFFF" strokeWidth={5} opacity={0.55} />))}
                </Svg>
              ) : <View style={[styles.image, { width: imgW, height: imgH, backgroundColor: pt.creamStrong }]} />}
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.prompt}>Quantas peças você quer montar?</Text>

      <View style={styles.plates}>
        {OPTIONS.map((o) => {
          const active = selected === o.count;
          return (
            <Pressable key={o.count} style={[styles.plate, active && styles.plateActive]} onPress={() => onSelect(o.count)}
              accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`${o.count} peças. ${o.label}.`}>
              <View style={[styles.plateIcon, active && styles.plateIconActive]}>
                <GridIcon cols={o.cols} rows={o.rows} active={active} />
              </View>
              <Text style={[styles.plateCount, active && styles.plateCountActive]}>{o.count} peças</Text>
              <Text style={[styles.plateLabel, active && styles.plateLabelActive]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable style={styles.startBtn}
          onPress={() => navigation.navigate(ROUTES.MONTE_A_CENA_TABLE_GAME, { puzzleSceneId: scene.puzzleSceneId, pieceCount: selected, storyId: story ? story.storyId : scene.storyId })}
          accessibilityRole="button" accessibilityLabel={`Começar a montar com ${selected} peças.`}>
          <Text style={styles.startText}>Começar a montar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  err: { fontFamily: 'Nunito', fontSize: 15, color: pt.textSoft, textAlign: 'center', marginTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backPill: { backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  headerStory: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.goldDeep },
  headerQuadro: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text },
  headerRight: { width: 62, alignItems: 'flex-end' },
  stateChip: { borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 3 },
  stateFree: { backgroundColor: pt.freeBg },
  stateFreeText: { fontFamily: 'FredokaOne', fontSize: 10, color: pt.freeText },
  stateFamily: { backgroundColor: pt.goldSoft },
  stateFamilyText: { fontFamily: 'FredokaOne', fontSize: 10, color: pt.goldDeep },

  tableWrap: { alignItems: 'center', marginTop: 6 },
  table: { width: '92%', backgroundColor: '#F3E4C6', borderRadius: radii.xl, paddingVertical: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6D0A6', ...shadows.card },
  deco1: { position: 'absolute', left: 22, top: 26, width: 34, height: 34, borderRadius: 10, backgroundColor: '#E7D3AA', opacity: 0.8, transform: [{ rotate: '-12deg' }] },
  deco2: { position: 'absolute', right: 20, bottom: 24, width: 28, height: 28, borderRadius: 9, backgroundColor: '#EAD9B4', opacity: 0.85, transform: [{ rotate: '16deg' }] },
  imageShadow: { borderRadius: radii.lg, ...shadows.card, shadowOpacity: 0.18, shadowRadius: 10 },
  imageCard: { borderRadius: radii.lg, overflow: 'hidden' },
  image: { borderRadius: radii.lg },

  prompt: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text, textAlign: 'center', marginTop: 16, marginBottom: 12 },

  plates: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 16 },
  plate: { flex: 1, maxWidth: 118, backgroundColor: '#FFFDF7', borderRadius: radii.lg, borderWidth: 2, borderColor: '#EADFD2', paddingVertical: 14, alignItems: 'center', gap: 6, ...shadows.soft },
  plateActive: { borderColor: pt.goldDeep, borderWidth: 2.5, backgroundColor: '#FFFBEF', transform: [{ scale: 1.05 }, { translateY: -4 }], ...shadows.card, shadowOpacity: 0.16, shadowRadius: 9 },
  plateIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: pt.lilac, alignItems: 'center', justifyContent: 'center' },
  plateIconActive: { backgroundColor: pt.purple },
  plateCount: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  plateCountActive: { color: pt.purpleDeep },
  plateLabel: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.textSoft, textAlign: 'center' },
  plateLabelActive: { color: pt.goldDeep },

  footer: { paddingHorizontal: 24, paddingTop: 16, marginTop: 'auto' },
  startBtn: { backgroundColor: pt.beni, borderRadius: radii.pill, paddingVertical: 15, alignItems: 'center', ...shadows.card },
  startText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
});
