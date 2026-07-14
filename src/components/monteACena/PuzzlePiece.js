/**
 * PuzzlePiece.js — UMA peça de "Monte a Cena". Recorta a MESMA imagem (full-art) pelo Path do nível
 * (viewBox já inclui o crop). Desenha as bordas a partir do MESMO Path (M1R6 §10 — materialidade):
 *   tray:     contorno externo marfim (3–3.5) + secundário lavanda (1.5) + brilho superior → peça física.
 *   selected: contorno dourado forte (4.5) + secundário claro → seleção impossível de ignorar.
 *   active:   contorno branco evidente (arrastando).
 *   placed:   sem stroke externo (funde à cena, sem borda branca entre peças encaixadas).
 * O overscan da geometria garante espaço p/ borda/halo/sombra.
 */

import React from 'react';
import Svg, { Path, ClipPath, Defs, Image as SvgImage, LinearGradient, Stop } from 'react-native-svg';
import { colors as pt } from '../../theme/productTheme';

export default function PuzzlePiece({ source, piece, artW, artH, boardW, boardH, scale = 1, variant = 'tray' }) {
  const ob = piece.overscanBounds;
  const w = Math.max(1, ob.w * boardW * scale);
  const h = Math.max(1, ob.h * boardH * scale);
  const clipId = `mac-${piece.id}-${variant}`;
  const glossId = `gloss-${piece.id}-${variant}`;
  return (
    <Svg width={w} height={h} viewBox={piece.viewBox} pointerEvents="none">
      <Defs>
        <ClipPath id={clipId}><Path d={piece.path} /></ClipPath>
        <LinearGradient id={glossId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={variant === 'placed' ? 0 : 0.28} />
          <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <SvgImage href={source} x={0} y={0} width={artW} height={artH} preserveAspectRatio="xMidYMid meet" clipPath={`url(#${clipId})`} />
      {variant !== 'placed' && (
        <Path d={piece.path} fill={`url(#${glossId})`} opacity={0.9} />
      )}
      {variant === 'tray' && (
        <>
          <Path d={piece.path} fill="none" stroke="#FFF8EC" strokeWidth={3.2} strokeLinejoin="round" opacity={0.96} />
          <Path d={piece.path} fill="none" stroke="#C9B8F2" strokeWidth={1.5} strokeLinejoin="round" opacity={0.72} />
        </>
      )}
      {variant === 'selected' && (
        <>
          <Path d={piece.path} fill="none" stroke="#FFF8EC" strokeWidth={3.4} strokeLinejoin="round" opacity={0.98} />
          <Path d={piece.path} fill="none" stroke={pt.goldDeep} strokeWidth={4.5} strokeLinejoin="round" opacity={0.95} />
          <Path d={piece.path} fill="none" stroke="#FFF3CC" strokeWidth={1.5} strokeLinejoin="round" opacity={0.9} />
        </>
      )}
      {variant === 'active' && (
        <>
          <Path d={piece.path} fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" opacity={0.98} />
          <Path d={piece.path} fill="none" stroke={pt.goldDeep} strokeWidth={1.8} strokeLinejoin="round" opacity={0.5} />
        </>
      )}
    </Svg>
  );
}
