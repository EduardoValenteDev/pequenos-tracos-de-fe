/**
 * MonteACenaGameV2Screen.js — RODADA V2 (M1R2R). Reconstrução integral. Compõe os componentes de
 * `components/monteACena` com o motor `usePuzzleController` (mesmo motor p/ 4/6/9 peças). Layout FIXO
 * (o tabuleiro nunca muda de posição durante a rodada), SEM ScrollView, a mesa inferior ocupa TODO o
 * espaço restante (sem área branca vazia). Só sob o gate interno (ver AppNavigator).
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, useWindowDimensions } from 'react-native';
import Svg, { Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import FaithIcon from '../components/ui/FaithIcon';
import { isInternalToolsEnabled } from '../config/internalTools';
import { useProfile } from '../context/ProfileContext';
import { getCatalogScene, buildCatalogLevel, MONTE_A_CENA_CATALOG } from '../data/monteACenaCatalog';
import ROUTES from '../constants/routes';
import usePuzzleController from '../hooks/usePuzzleController';
import PuzzleCoach from '../components/monteACena/PuzzleCoach';
import PuzzleBoard from '../components/monteACena/PuzzleBoard';
import PuzzleDock from '../components/monteACena/PuzzleDock';
import PuzzleDragOverlay from '../components/monteACena/PuzzleDragOverlay';
import PuzzleEffectsLayer from '../components/monteACena/PuzzleEffectsLayer';

const HEADER_H = 46;
const COACH_H = 52;
const GAP = 10;
const DOCK_SIDE = 18;
const DOCK_HEADER_H = 30;
const WELL_GAP = 14;
const BOARD_SIDE = 44;

export default function MonteACenaGameV2Screen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { profile } = useProfile();
  const profileId = (profile && (profile.id || profile.avatarId)) || 'default';
  const params = route?.params || {};
  const scene = getCatalogScene(params.puzzleSceneId) || MONTE_A_CENA_CATALOG[0];
  const pieceCount = params.pieceCount || 4;
  const level = useMemo(() => buildCatalogLevel(scene, pieceCount), [scene, pieceCount]);
  const ratio = 1.2496; // 4:5 (crop preserva a proporção)
  // Próxima cena do catálogo (mesma quantidade de peças), se houver.
  const nextScene = useMemo(() => {
    const i = MONTE_A_CENA_CATALOG.findIndex((s) => s.puzzleSceneId === scene.puzzleSceneId);
    return i >= 0 && i < MONTE_A_CENA_CATALOG.length - 1 ? MONTE_A_CENA_CATALOG[i + 1] : null;
  }, [scene]);

  // ── Layout FIXO ──
  const geomLayout = useMemo(() => {
    const coachTop = insets.top + HEADER_H + GAP;
    const boardTop = coachTop + COACH_H + GAP;
    const dockCols = level.pieceCount === 4 ? 2 : 3;
    const dockRows = Math.ceil(level.pieceCount / dockCols);
    const innerW = screenW - DOCK_SIDE * 2;
    const wellSize = Math.max(54, Math.min(78, Math.floor((innerW - (dockCols - 1) * WELL_GAP) / dockCols)));
    const dockH = DOCK_HEADER_H + dockRows * wellSize + (dockRows + 1) * WELL_GAP + 8;
    const dockTop = screenH - insets.bottom - dockH;
    const boardAvailH = dockTop - GAP - boardTop;
    let boardW = Math.min(screenW - BOARD_SIDE * 2, boardAvailH / ratio);
    boardW = Math.max(150, boardW);
    const boardH = boardW * ratio;
    const boardLeft = (screenW - boardW) / 2;
    // poços centralizados no dock
    const gridW = dockCols * wellSize + (dockCols - 1) * WELL_GAP;
    const wellLeft0 = (screenW - gridW) / 2;
    const wellTop0 = dockTop + DOCK_HEADER_H + WELL_GAP;
    const wells = [];
    for (let i = 0; i < level.pieceCount; i++) {
      const col = i % dockCols; const row = Math.floor(i / dockCols);
      const left = wellLeft0 + col * (wellSize + WELL_GAP);
      const top = wellTop0 + row * (wellSize + WELL_GAP);
      wells.push({ left, top, cx: left + wellSize / 2, cy: top + wellSize / 2 });
    }
    const wellRect = (i) => wells[i] || wells[0];
    return {
      coachTop, boardTop, boardLeft, boardW, boardH, dockTop, dockH, dockCols, dockRows, wellSize, wells, wellRect,
      rootW: screenW, marginL: 10, marginR: 10, minTop: boardTop - GAP, maxBottom: screenH - insets.bottom,
    };
  }, [screenW, screenH, insets.top, insets.bottom, level.pieceCount, ratio]);

  const c = usePuzzleController(level, geomLayout, navigation, {
    scene,
    profileId,
    onNext: nextScene ? () => navigation.replace(ROUTES.MONTE_A_CENA_GAME_V2, { puzzleSceneId: nextScene.puzzleSceneId, pieceCount }) : null,
  });
  const { boardTop, boardLeft, boardW, boardH, dockTop, dockH, wellSize, wells } = geomLayout;

  // progresso com pequena animação ao encaixar
  const progA = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (c.reduceMotion) return;
    progA.setValue(0.7);
    Animated.spring(progA, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }).start();
  }, [c.progress.placed, c.reduceMotion, progA]);

  const unplaced = c.geometry.pieces.filter((p) => !c.placed.includes(p.id));
  const refSize = Math.min(screenW - 80, 300);

  return (
    <View style={styles.root} ref={c.rootRef} onLayout={c.measureRoot}>
      {/* ── CABEÇALHO ── */}
      <View style={[styles.header, { marginTop: insets.top, height: HEADER_H }]}>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{scene.storyTitle}</Text>
        <View style={styles.headerRight}>
          <Animated.View style={[styles.progressPill, { transform: [{ scale: progA }] }]}>
            <Text style={styles.progressText}>{c.progress.placed} de {c.progress.total}</Text>
          </Animated.View>
          <Pressable style={styles.eyeBtn} onPress={() => c.reference.setOpen(true)} accessibilityRole="button" accessibilityLabel="Ver a cena completa" hitSlop={8}>
            <FaithIcon name="eye" size={20} color={pt.purpleDeep} />
          </Pressable>
        </View>
      </View>

      {/* ── FAIXA BENI (fixa) ── */}
      <PuzzleCoach
        top={geomLayout.coachTop} height={COACH_H} left={16} right={16}
        expanded={c.beni.expanded} message={c.beni.msg} celebrating={c.done}
        onToggle={() => c.beni.setExpanded((v) => !v)}
      />

      {/* ── TABULEIRO ── */}
      <PuzzleBoard
        source={c.source} geometry={c.geometry} level={level} placed={c.placed}
        glowTargetId={c.glowTargetId} boardLeft={boardLeft} boardTop={boardTop} boardW={boardW} boardH={boardH}
        done={c.done} selectedId={c.selectedId} onBoardPress={c.onBoardPress} pieceById={c.pieceById} artW={c.artW} artH={c.artH}
      />

      {/* ── MESA (dock) ── */}
      {!c.done && (
        <PuzzleDock
          dockLeft={0} dockTop={dockTop} dockW={screenW} dockH={dockH} wellSize={wellSize} wells={wells}
          unplaced={unplaced} wellIndexOf={c.wellIndexOf} source={c.source} artW={c.artW} artH={c.artH}
          boardW={boardW} boardH={boardH} trayScale={c.trayScale}
          selectedId={c.selectedId} activeId={c.activeId} helpPulseId={c.helpPulseId} pulseAnim={c.pulse}
          makePieceResponder={c.makePieceResponder} remaining={unplaced.length} reduceMotion={c.reduceMotion}
        />
      )}

      {/* ── CAMADA ATIVA + EFEITOS ── */}
      <PuzzleDragOverlay activePiece={c.activePiece} source={c.source} artW={c.artW} artH={c.artH} boardW={boardW} boardH={boardH} pan={c.pan} />
      <PuzzleEffectsLayer effect={c.effect} reduceMotion={c.reduceMotion} />

      {/* ── CONTEMPLAÇÃO (sem modal cobrindo o quadro) ── */}
      {c.phase === 'viewingArtwork' && (
        <Pressable style={[styles.contemplateHint, { top: boardTop + boardH + 16 }]} onPress={c.revealActions} accessibilityRole="button" accessibilityLabel="Ver o que fazer agora">
          <Text style={styles.contemplateTitle}>Cena completa!</Text>
          <Text style={styles.contemplateText}>Toque para ver o que fazer agora</Text>
        </Pressable>
      )}

      {/* ── AÇÕES (abaixo do quadro, sem cobrir a imagem) ── */}
      {c.phase === 'showingActions' && (
        <View style={[styles.actionsBar, { top: boardTop + boardH + 12, bottom: insets.bottom + 8 }]}>
          <Text style={styles.actionsTitle}>Você montou tudo direitinho!</Text>
          <View style={styles.actionsRow}>
            {c.hasNext && (
              <Pressable style={[styles.actBtn, styles.actBtnPrimary]} onPress={c.goNext} accessibilityRole="button" accessibilityLabel="Próxima cena">
                <Text style={styles.actBtnTextPrimary}>Próxima cena</Text>
              </Pressable>
            )}
            <Pressable style={styles.actBtn} onPress={c.reset} accessibilityRole="button" accessibilityLabel="Montar novamente">
              <Text style={styles.actBtnText}>Montar novamente</Text>
            </Pressable>
            <Pressable style={styles.actBtn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Escolher outra cena">
              <Text style={styles.actBtnText}>Escolher outra cena</Text>
            </Pressable>
            {c.isPremium && (
              <Pressable style={styles.actBtn} onPress={() => navigation.navigate(ROUTES.MONTE_A_CENA_GALLERY)} accessibilityRole="button" accessibilityLabel="Ver Meus Quadros">
                <Text style={styles.actBtnText}>Meus Quadros</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* ── REFERÊNCIA (um toque) ── */}
      {c.reference.open && c.source && (
        <Pressable style={styles.refBackdrop} onPress={() => c.reference.setOpen(false)} accessibilityRole="button" accessibilityLabel="Voltar ao jogo">
          <View style={styles.refCard}>
            <Text style={styles.refTitle}>Veja a cena</Text>
            <Svg width={refSize} height={refSize * (c.geometry.boardRatio)}>
              <SvgImage href={c.source} x={0} y={0} width={refSize} height={refSize * c.geometry.boardRatio}
                preserveAspectRatio="none" viewBox={`${c.geometry.cropPx.x0} ${c.geometry.cropPx.y0} ${c.geometry.cropPx.w} ${c.geometry.cropPx.h}`} />
            </Svg>
            <Pressable style={styles.refClose} onPress={() => c.reference.setOpen(false)} accessibilityRole="button" accessibilityLabel="Voltar ao jogo">
              <Text style={styles.refCloseText}>Voltar ao jogo</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* ── DIAGNÓSTICO INTERNO (fechado por padrão; só Modo Criador) ── */}
      {isInternalToolsEnabled() && (
        <Pressable style={[styles.devDot, { top: insets.top + 6 }]} onPress={() => c.dev.setOpen((v) => !v)} accessibilityLabel="Diagnóstico interno">
          <Text style={styles.devDotText}>•</Text>
        </Pressable>
      )}
      {isInternalToolsEnabled() && c.dev.open && (
        <View style={[styles.devDrawer, { top: insets.top + 30 }]}>
          {c.dev.diag ? (
            <>
              <Text style={styles.devLine}>finger {c.dev.diag.finger?.join(',')}  page {c.dev.diag.page?.join(',')}</Text>
              <Text style={styles.devLine}>rootWin {c.dev.diag.rootWin?.join(',')}</Text>
              <Text style={styles.devLine}>active {c.dev.diag.active?.join(',')}  size {c.dev.diag.activeSize?.join(',')}</Text>
              <Text style={styles.devLine}>center {c.dev.diag.center?.join(',')}  target {c.dev.diag.target?.join(',')}</Text>
              <Text style={styles.devLine}>dist {c.dev.diag.dist} / tol {c.dev.diag.tol}</Text>
            </>
          ) : <Text style={styles.devLine}>arraste uma peça…</Text>}
          <Text style={styles.devLine}>áudio ready {String(c.dev.audioStatus.ready)}  err {c.dev.audioStatus.lastError || '—'}</Text>
          <View style={styles.devBtns}>
            <Pressable style={styles.devBtn} onPress={c.dev.testMatch}><Text style={styles.devBtnText}>Testar encaixe</Text></Pressable>
            <Pressable style={styles.devBtn} onPress={c.dev.testComplete}><Text style={styles.devBtnText}>Testar conclusão</Text></Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  backPill: { backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  title: { flex: 1, textAlign: 'center', fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressPill: { backgroundColor: pt.goldSoft, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 5 },
  progressText: { fontFamily: 'FredokaOne', fontSize: 12, color: pt.goldDeep },
  eyeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: pt.cream, alignItems: 'center', justifyContent: 'center', ...shadows.soft },

  // Contemplação: SÓ um aviso discreto FORA da imagem (nunca cobre o quadro).
  contemplateHint: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 40 },
  contemplateTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.greenDeep, marginBottom: 4 },
  contemplateText: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft },
  // Ações abaixo do quadro (não cobrem a imagem).
  actionsBar: { position: 'absolute', left: 12, right: 12, alignItems: 'center', justifyContent: 'center', zIndex: 40 },
  actionsTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.greenDeep, marginBottom: 12, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  actBtn: { backgroundColor: pt.cream, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 12, ...shadows.soft },
  actBtnPrimary: { backgroundColor: pt.purple },
  actBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  actBtnTextPrimary: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },

  refBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(90,72,60,0.30)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 60 },
  refCard: { backgroundColor: pt.background, borderRadius: radii.lg, padding: 16, alignItems: 'center', ...shadows.card },
  refTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 10 },
  refClose: { marginTop: 14, backgroundColor: pt.purple, borderRadius: radii.pill, paddingHorizontal: 24, paddingVertical: 10 },
  refCloseText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },

  devDot: { position: 'absolute', right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(124,58,237,0.12)', alignItems: 'center', justifyContent: 'center', zIndex: 90 },
  devDotText: { color: pt.purpleDeep, fontSize: 18, lineHeight: 20 },
  devDrawer: { position: 'absolute', right: 6, backgroundColor: 'rgba(15,18,32,0.92)', borderRadius: 10, padding: 8, zIndex: 90, maxWidth: 220 },
  devLine: { color: '#CFE', fontSize: 10, fontFamily: 'Nunito' },
  devBtns: { flexDirection: 'row', gap: 6, marginTop: 6 },
  devBtn: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  devBtnText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito', fontWeight: '700' },
});
