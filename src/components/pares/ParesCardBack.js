/**
 * ParesCardBack.js — Verso PREMIUM da carta do Pares do Beni (R2A · refinado R2B §5).
 *
 * Tudo é vetor (react-native-svg): nenhum raster novo. Hierarquia (fora → dentro):
 *   moldura marfim FINA + fio escuro de profundidade (1 pt) → contorno dourado interno →
 *   painel com gradiente lavanda (contraste um pouco maior) → brilho superior discreto →
 *   estrelinhas de baixa opacidade → cantos coerentes → medalhão MENOR com cruz NÍTIDA.
 *
 * R2B afina a moldura, dá profundidade pela borda (não por sombra), encolhe o medalhão e
 * deixa a cruz mais limpa — sem AUMENTAR a quantidade de elementos. A profundidade física
 * (elevação) e o estado pressionado ficam no container do flip.
 */
import React from 'react';
import Svg, {
  Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Path, G,
} from 'react-native-svg';

/** Sparkle de 4 pontas (concavo) centrado em (cx,cy). */
function sparkle(cx, cy, r) {
  const d = r * 0.32;
  return `M${cx} ${cy - r} L${cx + d} ${cy - d} L${cx + r} ${cy} L${cx + d} ${cy + d} `
    + `L${cx} ${cy + r} L${cx - d} ${cy + d} L${cx - r} ${cy} L${cx - d} ${cy - d} Z`;
}

function ParesCardBack({ width = 84, height = 92, radius = 16 }) {
  const W = Math.max(1, width);
  const H = Math.max(1, height);
  const R = Math.max(2, radius);

  // Moldura marfim mais FINA que no R2A (0.075 → 0.058).
  const pad = Math.max(3.5, Math.min(W, H) * 0.058);
  const innerR = Math.max(2, R - pad * 0.55);
  const pw = W - pad * 2;
  const ph = H - pad * 2;

  // Medalhão MENOR (0.235 → 0.20).
  const cx = W / 2;
  const cy = H / 2;
  const med = Math.min(pw, ph) * 0.20;

  // Cruz mais nítida: barras um pouco mais finas, cantos menos arredondados.
  const barW = med * 0.22;
  const vTop = cy - med * 0.6;
  const vH = med * 1.2;
  const hY = cy - med * 0.14;
  const hW = med * 0.82;
  const cr = barW * 0.28;

  const gold = '#E6B455';
  const goldDeep = '#C8942A';
  const ivory = '#FFF8EA';
  const depth = '#2A1E10';

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="pcbPanel" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E2D2F8" />
          <Stop offset="0.5" stopColor="#AFA0E7" />
          <Stop offset="1" stopColor="#7FA6DE" />
        </LinearGradient>
        <RadialGradient id="pcbGlow" cx="0.5" cy="0.14" r="0.55">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.42" />
          <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.08" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="pcbMed" cx="0.5" cy="0.4" r="0.6">
          <Stop offset="0" stopColor="#FFFDF6" />
          <Stop offset="0.7" stopColor="#FBEFD2" />
          <Stop offset="1" stopColor="#F1DCA9" />
        </RadialGradient>
      </Defs>

      {/* Moldura marfim + fio escuro de profundidade (1 pt) — depth pela borda, não por sombra */}
      <Rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx={R} ry={R} fill={ivory} stroke={depth} strokeOpacity="0.28" strokeWidth="1" />

      {/* Painel com gradiente lavanda (contraste maior) */}
      <Rect x={pad} y={pad} width={pw} height={ph} rx={innerR} ry={innerR} fill="url(#pcbPanel)" />

      {/* Contorno de ouro interno */}
      <Rect
        x={pad} y={pad} width={pw} height={ph} rx={innerR} ry={innerR}
        fill="none" stroke={gold} strokeOpacity="0.9" strokeWidth={Math.max(1, W * 0.013)}
      />

      {/* Brilho superior discreto */}
      <Rect x={pad} y={pad} width={pw} height={ph} rx={innerR} ry={innerR} fill="url(#pcbGlow)" />

      {/* Estrelinhas de baixa opacidade */}
      <G fill="#FFFFFF" fillOpacity="0.2">
        <Path d={sparkle(pad + pw * 0.2, pad + ph * 0.22, med * 0.22)} />
        <Path d={sparkle(pad + pw * 0.82, pad + ph * 0.3, med * 0.15)} />
        <Path d={sparkle(pad + pw * 0.26, pad + ph * 0.78, med * 0.14)} />
        <Path d={sparkle(pad + pw * 0.76, pad + ph * 0.8, med * 0.2)} />
        <Circle cx={pad + pw * 0.5} cy={pad + ph * 0.13} r={med * 0.055} />
      </G>

      {/* Cantos coerentes (arcos de ouro) — mesma fórmula em qualquer dificuldade */}
      <G fill="none" stroke={gold} strokeOpacity="0.5" strokeWidth={Math.max(1, W * 0.011)} strokeLinecap="round">
        <Path d={`M${pad + pw * 0.06} ${pad + ph * 0.2} Q${pad + pw * 0.06} ${pad + ph * 0.06} ${pad + pw * 0.2} ${pad + ph * 0.06}`} />
        <Path d={`M${pad + pw * 0.94} ${pad + ph * 0.2} Q${pad + pw * 0.94} ${pad + ph * 0.06} ${pad + pw * 0.8} ${pad + ph * 0.06}`} />
        <Path d={`M${pad + pw * 0.06} ${pad + ph * 0.8} Q${pad + pw * 0.06} ${pad + ph * 0.94} ${pad + pw * 0.2} ${pad + ph * 0.94}`} />
        <Path d={`M${pad + pw * 0.94} ${pad + ph * 0.8} Q${pad + pw * 0.94} ${pad + ph * 0.94} ${pad + pw * 0.8} ${pad + ph * 0.94}`} />
      </G>

      {/* Medalhão central (menor) + cruz nítida */}
      <Circle cx={cx} cy={cy} r={med} fill="url(#pcbMed)" stroke={gold} strokeWidth={Math.max(1, W * 0.018)} />
      <Circle cx={cx} cy={cy} r={med * 0.83} fill="none" stroke={goldDeep} strokeOpacity="0.32" strokeWidth={Math.max(0.6, W * 0.007)} />
      <G fill={goldDeep}>
        <Rect x={cx - barW / 2} y={vTop} width={barW} height={vH} rx={cr} ry={cr} />
        <Rect x={cx - hW / 2} y={hY} width={hW} height={barW} rx={cr} ry={cr} />
      </G>
    </Svg>
  );
}

export default React.memo(ParesCardBack);
