/**
 * CriarLivreIcon.js — conjunto de ícones VETORIAIS do Criar livre (C1 · §7).
 *
 * Todos compartilham a MESMA linguagem: viewBox 24, traço único (strokeWidth 2), pontas e
 * junções arredondadas, sem preenchimento (exceto pontos do "mais"). Nenhum emoji, nenhum
 * clipart. Usa react-native-svg (já instalado) — nenhuma dependência nova.
 *
 * Nomes: back · save · brush · eraser · undo · redo · more · check · plus · minus · close · trash
 */
import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

const PATHS = {
  back: (c, w) => <Path d="M15 5 L8 12 L15 19" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  save: (c, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 5 H15.5 L19 8.5 V18 A1 1 0 0 1 18 19 H6 A1 1 0 0 1 5 18 Z" />
      <Path d="M8 5 V9 H15 V5" />
      <Path d="M8.5 19 V14 H15.5 V19" />
    </G>
  ),
  brush: (c, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15.5 4.5 L19.5 8.5 L12.5 15.5 L8.5 11.5 Z" />
      <Path d="M8.5 11.5 L5 15 C4 16 4 18.5 5.5 19.5 C6.8 20.3 9 20 10 18.5 L12.5 15.5" />
    </G>
  ),
  eraser: (c, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7.5 16.5 L14 10 A1.6 1.6 0 0 1 16.2 10 L19 12.8 A1.6 1.6 0 0 1 19 15 L14.5 19.5 H9 Z" />
      <Path d="M12 12.5 L16.5 17" />
      <Path d="M6 19.5 H12" />
    </G>
  ),
  undo: (c, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8.5 7 L4 11.5 L8.5 16" />
      <Path d="M4 11.5 H14 A5.5 5.5 0 0 1 14 22.5 H11" />
    </G>
  ),
  redo: (c, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15.5 7 L20 11.5 L15.5 16" />
      <Path d="M20 11.5 H10 A5.5 5.5 0 0 0 10 22.5 H13" />
    </G>
  ),
  more: (c, w) => (
    <G fill={c}>
      <Circle cx="6" cy="12" r={w * 0.9} />
      <Circle cx="12" cy="12" r={w * 0.9} />
      <Circle cx="18" cy="12" r={w * 0.9} />
    </G>
  ),
  check: (c, w) => <Path d="M5 12.5 L10 17.5 L19 7" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  plus: (c, w) => <Path d="M12 6 V18 M6 12 H18" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  minus: (c, w) => <Path d="M6 12 H18" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  close: (c, w) => <Path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  trash: (c, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 7 H19" />
      <Path d="M9 7 V5 H15 V7" />
      <Path d="M6.5 7 L7.5 20 H16.5 L17.5 7" />
      <Path d="M10 10.5 V16.5 M14 10.5 V16.5" />
    </G>
  ),
};

function CriarLivreIcon({ name, size = 24, color = '#2F241D', strokeWidth = 2 }) {
  const draw = PATHS[name];
  if (!draw) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {draw(color, strokeWidth)}
    </Svg>
  );
}

export default React.memo(CriarLivreIcon);
