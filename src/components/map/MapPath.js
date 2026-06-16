/**
 * MapPath — caminho do Mapa Pergaminho desenhado por CÓDIGO (SVG).
 *
 * Não vem embutido em nenhuma imagem: recebe os centros dos marcos (points) e
 * serpenteia entre eles com curvas suaves, como um rastro de pegadas pontilhado.
 * Usa react-native-svg (aprovado neste bloco). pointerEvents desligado para não
 * roubar o toque dos marcos.
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function MapPath({ width, height, points, color = '#C9A24B' }) {
  if (!points || points.length < 1) return null;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    // Curva cúbica suave entre marcos consecutivos (caminho ondulado vertical).
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      <Path
        d={d}
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray="1 18"
        fill="none"
        opacity={0.75}
      />
    </Svg>
  );
}
