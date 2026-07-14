/**
 * PuzzleDragOverlay.js — camada ABSOLUTA da peça arrastada (item 5/16). Tamanho EXATO do alvo
 * (activeWidth/activeHeight), SEM transform de escala — o `pan` guarda a posição root-local
 * (esquerda/topo) calculada pelo modelo "peça acima do dedo". `pointerEvents="none"` (nunca
 * intercepta o gesto original, que continua na peça invisível da mesa).
 */

import React from 'react';
import { Animated } from 'react-native';
import PuzzlePiece from './PuzzlePiece';

export default function PuzzleDragOverlay({ activePiece, source, artW, artH, boardW, boardH, pan }) {
  if (!activePiece || !source) return null;
  const w = activePiece.overscanBounds.w * boardW;
  const h = activePiece.overscanBounds.h * boardH;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 0, top: 0, width: w, height: h, zIndex: 50,
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 16,
      }}
    >
      <PuzzlePiece source={source} piece={activePiece} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={1} variant="active" />
    </Animated.View>
  );
}
