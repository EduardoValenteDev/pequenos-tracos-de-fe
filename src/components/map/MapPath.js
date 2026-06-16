/**
 * MapPath — caminho do Mapa Pergaminho desenhado por CÓDIGO (SVG).
 *
 * Não vem embutido em nenhuma imagem: recebe os centros dos marcos (points) e
 * serpenteia entre eles com curvas suaves — uma TRILHA sobre o pergaminho, não
 * pontinhos de placeholder. Duas camadas (sombra + trilha clara) para ler bem
 * sobre a arte variada do mapa. pointerEvents desligado p/ não roubar o toque.
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function MapPath({ width, height, points, color = '#FFF6E0' }) {
  if (!points || points.length < 1) return null;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    // Curva cúbica suave entre marcos consecutivos (trilha ondulada vertical).
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      {/* Sombra sutil por baixo para destacar a trilha sobre a arte */}
      <Path d={d} stroke="rgba(60,40,15,0.35)" strokeWidth={11} strokeLinecap="round" fill="none" />
      {/* Trilha clara, traço suave e contínuo (dash longo, não bolinhas) */}
      <Path
        d={d}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="16 13"
        fill="none"
        opacity={0.92}
      />
    </Svg>
  );
}
