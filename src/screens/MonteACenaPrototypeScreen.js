/**
 * MonteACenaPrototypeScreen.js — PROTÓTIPO VISUAL ESTÁTICO (M1R1) de "Monte a Cena".
 *
 * Substitui a direção reprovada do M1A. Identidade do Mundo do Beni (fundo creme, cartões claros,
 * cantos arredondados, sombras suaves, tipografia oficial). TUDO cabe em UMA tela — SEM ScrollView,
 * SEM rolagem. Esta etapa valida composição/clareza/hierarquia/dimensões/peças/pertencimento visual.
 *
 * AINDA NÃO tem: arrasto, snap, som, vibração, progresso real, conclusão funcional. O estado exibido
 * é o "momento anterior ao primeiro movimento": cena-guia + 4 espaços de encaixe + 4 peças na bandeja.
 * A referência (olho) funciona por UM TOQUE (sem press-and-hold). Rota registrada só sob o gate interno.
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, useWindowDimensions,
} from 'react-native';
import Svg, { Path, ClipPath, Defs, Image as SvgImage } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as pt, radii, shadows } from '../theme/productTheme';
import FaithIcon from '../components/ui/FaithIcon';
import BeniAvatar from '../components/beni/BeniAvatar';
import { isCreatorQaModeEnabled } from '../services/creatorQaMode';
import { MONTE_A_CENA_SPIKE_SCENE } from '../data/monteACenaSpikeData';
import { buildSpikeGeometry } from '../services/monteACenaGeometry';

// ── Constantes de layout (dp) ──
const MARGIN = 16;
const HEADER_H = 48;
const BENI_H = 54;
const BENI_H_COLLAPSED = 30;
const TRAY_LABEL_H = 18;
const TRAY_H = 100;
const TRAY_H_MIN = 86;
const G_HEADER_BENI = 6;
const G_BENI_BOARD = 10;
const G_BOARD_LABEL = 8;
const G_LABEL_TRAY = 4;
const BOTTOM_PAD = 10;
const CREATOR_BANNER_EXTRA = 18; // altura visual da faixa "MODO CRIADOR ATIVO" além da safe area
const BOARD_MIN_W = 248;

/** Sprite de UMA peça: mesma imagem-fonte recortada pelo path (viewBox = overscan em px da arte). */
function PieceSprite({ scene, piece, boardW, boardH, scale }) {
  const { artWidth: W, artHeight: HH } = scene;
  const ob = piece.overscanBounds;
  const w = Math.max(1, ob.w * boardW * scale);
  const h = Math.max(1, ob.h * boardH * scale);
  const viewBox = `${ob.x * W} ${ob.y * HH} ${ob.w * W} ${ob.h * HH}`;
  const clipId = `mac-p-${piece.id}`;
  return (
    <Svg width={w} height={h} viewBox={viewBox}>
      <Defs>
        <ClipPath id={clipId}><Path d={piece.path} /></ClipPath>
      </Defs>
      <SvgImage href={scene.source} x={0} y={0} width={W} height={HH} preserveAspectRatio="xMidYMid meet" clipPath={`url(#${clipId})`} />
      <Path d={piece.path} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.9} />
      <Path d={piece.path} fill="none" stroke={pt.purpleDeep} strokeWidth={2} opacity={0.5} />
    </Svg>
  );
}

export default function MonteACenaPrototypeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const scene = MONTE_A_CENA_SPIKE_SCENE;

  const [beniOpen, setBeniOpen] = useState(true);
  const [refOpen, setRefOpen] = useState(false);

  const geometry = useMemo(
    () => buildSpikeGeometry({
      sceneId: scene.sceneId, artWidth: scene.artWidth, artHeight: scene.artHeight,
      seed: scene.seed, seams: scene.seams, protectedRegions: scene.protectedRegions,
    }),
    [scene],
  );

  const creatorActive = isCreatorQaModeEnabled();
  const boardRatio = scene.artHeight / scene.artWidth; // altura/largura (4:5 → 1.2495)

  // ── Dimensionamento responsivo (sem rolagem). Prioridade ao encolher:
  //    1º espaçamentos → 2º recolher Beni → 3º reduzir bandeja → preserva tabuleiro jogável. ──
  const layout = useMemo(() => {
    const topInset = insets.top + (creatorActive ? CREATOR_BANNER_EXTRA : 0);
    const usableH = screenH - topInset - insets.bottom;
    const maxBoardW = screenW - MARGIN * 2;

    const compute = (beniH, trayH) => {
      const chrome = HEADER_H + beniH + TRAY_LABEL_H + trayH
        + G_HEADER_BENI + G_BENI_BOARD + G_BOARD_LABEL + G_LABEL_TRAY + BOTTOM_PAD;
      const boardMaxH = usableH - chrome;
      const boardW = Math.min(maxBoardW, boardMaxH / boardRatio);
      return { boardW, boardH: boardW * boardRatio, beniH, trayH };
    };

    let r = compute(beniOpen ? BENI_H : BENI_H_COLLAPSED, TRAY_H);
    if (r.boardW < BOARD_MIN_W) r = compute(BENI_H_COLLAPSED, TRAY_H);       // 2º: recolher Beni
    if (r.boardW < BOARD_MIN_W) r = compute(BENI_H_COLLAPSED, TRAY_H_MIN);   // 3º: reduzir bandeja
    r.boardW = Math.max(r.boardW, BOARD_MIN_W);
    r.boardH = r.boardW * boardRatio;
    r.topInset = topInset;
    return r;
  }, [screenW, screenH, insets.top, insets.bottom, creatorActive, beniOpen, boardRatio]);

  const { boardW, boardH, trayH, topInset } = layout;

  // Duas escalas independentes: boardScale = 1.0 (peça no tamanho REAL do tabuleiro);
  // trayScale (peça na bandeja) é claramente MENOR — derivada como fração de boardScale.
  const boardScale = 1.0;
  const trayScale = useMemo(() => {
    const trayPad = 10;
    const slotGap = 8;
    const slotW = (boardW - trayPad * 2 - slotGap * 3) / 4;
    const slotH = trayH - 20;
    let s = 1;
    for (const p of geometry.pieces) {
      const pw = p.visualBounds.w * boardW;
      const ph = p.visualBounds.h * boardH;
      s = Math.min(s, slotW / pw, slotH / ph);
    }
    return boardScale * Math.max(0.18, Math.min(0.42, s));
  }, [geometry, boardW, boardH, trayH, boardScale]);

  const noSource = !scene.source;

  return (
    <View style={[styles.root, { paddingTop: topInset, paddingBottom: insets.bottom }]}>
      {/* ── CABEÇALHO ── */}
      <View style={[styles.header, { height: HEADER_H }]}>
        <Pressable
          style={styles.backPill}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
        >
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>

        <Text style={styles.title} numberOfLines={1}>Monte a Cena</Text>

        <View style={styles.headerRight}>
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>0 de 4</Text>
          </View>
          <Pressable
            style={styles.eyeBtn}
            onPress={() => setRefOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Ver a cena completa"
            hitSlop={8}
          >
            <FaithIcon name="eye" size={20} color={pt.purpleDeep} />
          </Pressable>
        </View>
      </View>

      {/* ── FALA DO BENI (compacta, recolhível) ── */}
      {beniOpen ? (
        <Pressable
          style={[styles.beniRow, { height: BENI_H, marginTop: G_HEADER_BENI }]}
          onPress={() => setBeniOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Beni diz: Vamos completar esta cena? Toque para recolher."
        >
          <BeniAvatar variant="happy" size="small" />
          <View style={styles.beniBubble}>
            <Text style={styles.beniText} numberOfLines={2}>Vamos completar esta cena?</Text>
          </View>
          <Text style={styles.beniChevron}>▾</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.beniCollapsed, { height: BENI_H_COLLAPSED, marginTop: G_HEADER_BENI }]}
          onPress={() => setBeniOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Mostrar a fala do Beni"
        >
          <Text style={styles.beniCollapsedText}>Beni ▸</Text>
        </Pressable>
      )}

      {/* ── TABULEIRO (cartão claro, cena-guia + espaços de encaixe) ── */}
      <View style={{ alignItems: 'center', marginTop: G_BENI_BOARD }}>
        <View style={[styles.board, { width: boardW, height: boardH }]}>
          {noSource ? (
            <View style={styles.boardFallback}><Text style={styles.boardFallbackText}>cena indisponível</Text></View>
          ) : (
            <Svg width={boardW} height={boardH} viewBox={`0 0 ${scene.artWidth} ${scene.artHeight}`}>
              {/* cena-guia discreta (12–18%) */}
              <SvgImage
                href={scene.source}
                x={0} y={0} width={scene.artWidth} height={scene.artHeight}
                preserveAspectRatio="xMidYMid meet" opacity={0.15}
              />
              {/* espaços de encaixe: contornos suaves e claros (nunca pretos) */}
              {geometry.pieces.map((p) => (
                <Path key={p.id} d={p.path} fill="none" stroke={pt.purpleDeep} strokeWidth={4} opacity={0.28} strokeDasharray="14 10" strokeLinejoin="round" />
              ))}
            </Svg>
          )}
        </View>
      </View>

      {/* ── LEGENDA DA BANDEJA ── */}
      <Text style={[styles.trayLabel, { height: TRAY_LABEL_H, marginTop: G_BOARD_LABEL }]}>Escolha uma peça</Text>

      {/* ── BANDEJA (4 peças visíveis, sem rolagem) ── */}
      <View style={[styles.tray, { height: trayH, marginTop: G_LABEL_TRAY, marginHorizontal: MARGIN }]}>
        {!noSource && geometry.pieces.map((p) => (
          <View key={p.id} style={styles.traySlot}>
            <View style={styles.trayPieceShadow}>
              <PieceSprite scene={scene} piece={p} boardW={boardW} boardH={boardH} scale={trayScale} />
            </View>
          </View>
        ))}
      </View>

      {/* ── REFERÊNCIA (um toque; overlay claro, sem preto pesado) ── */}
      {refOpen && !noSource && (
        <Pressable style={styles.refBackdrop} onPress={() => setRefOpen(false)} accessibilityRole="button" accessibilityLabel="Fechar referência">
          <View style={styles.refCard}>
            <Text style={styles.refTitle}>A cena completa</Text>
            <Svg width={Math.min(screenW - 80, 300)} height={Math.min(screenW - 80, 300) * boardRatio}>
              <SvgImage
                href={scene.source} x={0} y={0}
                width={Math.min(screenW - 80, 300)} height={Math.min(screenW - 80, 300) * boardRatio}
                preserveAspectRatio="xMidYMid meet"
              />
            </Svg>
            <Pressable style={styles.refClose} onPress={() => setRefOpen(false)} accessibilityRole="button" accessibilityLabel="Fechar">
              <Text style={styles.refCloseText}>Fechar</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background, paddingHorizontal: 0 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: MARGIN,
  },
  backPill: {
    backgroundColor: 'rgba(124,58,237,0.10)', borderRadius: radii.pill,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  backText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.purpleDeep },
  title: { flex: 1, textAlign: 'center', fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressPill: {
    backgroundColor: pt.goldSoft, borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  progressText: { fontFamily: 'FredokaOne', fontSize: 12, color: pt.goldDeep },
  eyeBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: pt.cream,
    alignItems: 'center', justifyContent: 'center', ...shadows.soft,
  },

  beniRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: MARGIN, paddingHorizontal: 10,
    backgroundColor: pt.cream, borderRadius: radii.lg, ...shadows.soft,
  },
  beniBubble: { flex: 1 },
  beniText: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text, lineHeight: 18 },
  beniChevron: { fontFamily: 'Nunito', fontSize: 16, color: pt.textSoft, paddingHorizontal: 4 },
  beniCollapsed: {
    alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 14,
    backgroundColor: pt.cream, borderRadius: radii.pill, ...shadows.soft,
  },
  beniCollapsedText: { fontFamily: 'FredokaOne', fontSize: 12, color: pt.purpleDeep },

  board: {
    backgroundColor: '#FFFFFF', borderRadius: radii.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: pt.creamStrong, ...shadows.card,
  },
  boardFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boardFallbackText: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft },

  trayLabel: {
    textAlign: 'center', fontFamily: 'Nunito', fontSize: 12, fontWeight: '800',
    color: pt.textSoft, letterSpacing: 0.3,
  },
  tray: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: pt.creamStrong, borderRadius: radii.lg, paddingHorizontal: 10,
    ...shadows.soft,
  },
  traySlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  trayPieceShadow: {
    ...shadows.soft,
    shadowOpacity: 0.18,
  },

  refBackdrop: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(90,72,60,0.32)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  refCard: {
    backgroundColor: pt.background, borderRadius: radii.lg, padding: 16, alignItems: 'center',
    ...shadows.card,
  },
  refTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 10 },
  refClose: {
    marginTop: 14, backgroundColor: pt.purple, borderRadius: radii.pill,
    paddingHorizontal: 26, paddingVertical: 10,
  },
  refCloseText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
});
