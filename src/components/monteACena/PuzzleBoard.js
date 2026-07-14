/**
 * PuzzleBoard.js — moldura tipo "página de livro infantil" (marfim, contorno dourado discreto,
 * cantos arredondados, sombra suave, detalhes de canto). Mostra a cena-guia (10–14%), as divisões
 * MUITO discretas (some ao concluir / brilho dourado só no alvo próximo) e as peças já encaixadas.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Image as SvgImage } from 'react-native-svg';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import PuzzlePiece from './PuzzlePiece';

export default function PuzzleBoard({
  source, geometry, level, placed, glowTargetId, boardLeft, boardTop, boardW, boardH,
  done, selectedId, onBoardPress, pieceById, artW, artH,
}) {
  const cp = geometry.cropPx;
  const guideViewBox = `${cp.x0} ${cp.y0} ${cp.w} ${cp.h}`;
  return (
    <View style={[styles.board, { left: boardLeft, top: boardTop, width: boardW, height: boardH }]}>
      {/* detalhes de canto discretos */}
      <View style={[styles.corner, styles.cTL]} />
      <View style={[styles.corner, styles.cTR]} />
      <View style={[styles.corner, styles.cBL]} />
      <View style={[styles.corner, styles.cBR]} />

      {!source ? null : (
        <Svg width={boardW} height={boardH} viewBox={guideViewBox} pointerEvents="none">
          <SvgImage href={source} x={0} y={0} width={artW} height={artH} preserveAspectRatio="xMidYMid meet" opacity={done ? 1 : level.guideOpacity} />
          {!done && geometry.pieces.filter((p) => !placed.includes(p.id)).map((p) => (
            <Path key={`d-${p.id}`} d={p.path} fill="none"
              stroke={glowTargetId === p.id ? pt.goldDeep : pt.purpleDeep}
              strokeWidth={glowTargetId === p.id ? 5 : 2}
              opacity={glowTargetId === p.id ? 0.9 : 0.13} strokeLinejoin="round" />
          ))}
        </Svg>
      )}

      {source && placed.map((id) => {
        const p = pieceById[id]; const ob = p.overscanBounds;
        return (
          <View key={`pl-${id}`} pointerEvents="none" style={{ position: 'absolute', left: ob.x * boardW, top: ob.y * boardH }}>
            <PuzzlePiece source={source} piece={p} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={1} variant="placed" />
          </View>
        );
      })}

      {selectedId && !done && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onBoardPress}
          accessibilityRole="button" accessibilityLabel="Colocar a peça selecionada aqui"
          accessibilityHint="Toque no lugar da peça no desenho para encaixar" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'absolute', backgroundColor: '#FFFDF7', borderRadius: radii.lg + 4, overflow: 'hidden',
    borderWidth: 2, borderColor: '#F0D9A0', ...shadows.card,
  },
  corner: { position: 'absolute', width: 14, height: 14, borderColor: '#E9C877', zIndex: 2 },
  cTL: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
  cTR: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
  cBL: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
  cBR: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
});
