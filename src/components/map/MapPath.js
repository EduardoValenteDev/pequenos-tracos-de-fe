/**
 * MapPath — caminho do Mapa Pergaminho desenhado por CÓDIGO (SVG).
 *
 * Recebe os centros dos marcos (points) e serpenteia entre eles com curvas
 * suaves — uma TRILHA sobre o pergaminho que reforça a SUBIDA (os points vêm de
 * baixo para cima). Duas camadas (sombra + trilha clara) para ler bem sobre a
 * arte. Se `highlightIndex` aponta para a próxima aventura, o trecho até ela
 * ganha um brilho dourado. pointerEvents desligado p/ não roubar o toque.
 */
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

function segPath(points) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function MapPath({ width, height, points, color = '#FFF6E0', highlightIndex = -1 }) {
  if (!points || points.length < 1) return null;
  const d = segPath(points);

  // Trecho destacado até a próxima aventura (do marco anterior ao atual).
  let hd = null;
  if (highlightIndex >= 1 && highlightIndex < points.length) {
    hd = segPath([points[highlightIndex - 1], points[highlightIndex]]);
  }
  const hp = highlightIndex >= 0 && highlightIndex < points.length ? points[highlightIndex] : null;

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      {/* Sombra sutil por baixo para destacar a trilha sobre a arte */}
      <Path d={d} stroke="rgba(60,40,15,0.35)" strokeWidth={11} strokeLinecap="round" fill="none" />
      {/* Trilha clara, contínua e suave (dash longo) */}
      <Path d={d} stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray="16 13" fill="none" opacity={0.92} />
      {/* Trecho dourado da próxima aventura + brilho no marco */}
      {hd && <Path d={hd} stroke="#FFD56A" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.95} />}
      {hp && <Circle cx={hp.x} cy={hp.y} r={11} fill="rgba(255,213,106,0.45)" />}
    </Svg>
  );
}
