import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Ellipse, Rect } from 'react-native-svg';

/**
 * Ovelha própria (Bloco 2.1) — substitui o placeholder `eye`. Ionicons não tem ovelha;
 * este SVG é legível em tamanho pequeno, monocromático (cor controlada por prop) e sem
 * detalhe excessivo. Sem dependência nova (react-native-svg já instalada).
 */
function OvelhaSvg({ size, color, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {/* lã (corpo) */}
      <Circle cx="9.5" cy="14" r="4.3" fill={color} />
      <Circle cx="13" cy="12.6" r="4.6" fill={color} />
      <Circle cx="15.8" cy="14.4" r="3.6" fill={color} />
      {/* cabeça */}
      <Ellipse cx="17.6" cy="11" rx="2.7" ry="3" fill={color} />
      {/* topete */}
      <Circle cx="17.6" cy="8.7" r="1.7" fill={color} />
      {/* pernas */}
      <Rect x="10.6" y="17.4" width="1.5" height="3.4" rx="0.75" fill={color} />
      <Rect x="14.4" y="17.6" width="1.5" height="3.4" rx="0.75" fill={color} />
    </Svg>
  );
}

const ICON_MAP = {
  home: 'home',
  adventures: 'book',
  atelier: 'color-palette',
  trophies: 'trophy',
  profile: 'person-circle',
  bible: 'book-outline',
  star: 'star',
  lock: 'lock-closed',
  heart: 'heart',
  paint: 'brush',
  gallery: 'images',
  parent: 'people',
  lumi: 'sparkles',
  play: 'play-circle',
  back: 'chevron-back',
  close: 'close',
  check: 'checkmark-circle',
  family: 'people-circle',
  eye: 'eye',
  // Coloring tool icons
  erase: 'backspace-outline',
  undo: 'arrow-undo',
  clear: 'trash',
  zoom_in: 'search',
  zoom_reset: 'scan',

  // ── Brincar (Bloco 1.1) — ícones semânticos; emoji NUNCA é solução visual ──
  brincar: 'game-controller',
  pares: 'albums',
  palavrinhas: 'text',
  bichinhos: 'paw',
  puzzle: 'extension-puzzle',
  // `ovelha` NÃO está aqui: é desenhada por OvelhaSvg (Bloco 2.1), não pelo Ionicons.
  desenho_guiado: 'color-wand',
  criar_livre: 'create',

  // ── Pares do Beni (Bloco 1.4) — modos, HUD e ações da tela de resultado ──
  classico: 'infinite',      // sem limite de tempo
  turbo: 'flash',            // contra o relógio
  timer: 'timer',
  combo: 'flame',
  restart: 'refresh',
  swap: 'swap-horizontal',
};

/**
 * FaithIcon — semantic vector icon wrapper around Ionicons.
 *
 * Props:
 *   name  — semantic name (home, adventures, atelier, trophies, profile, bible,
 *            star, lock, heart, paint, gallery, parent, lumi, play, back, close,
 *            check, family, erase, undo, clear, zoom_in, zoom_reset)
 *   size  — icon size in dp (default 24)
 *   color — icon color (default '#333')
 *   style — optional style passed to Ionicons
 */
export default function FaithIcon({ name, size = 24, color = '#333', style }) {
  if (name === 'ovelha') return <OvelhaSvg size={size} color={color} style={style} />;
  const ionName = ICON_MAP[name] ?? 'help-circle-outline';
  return <Ionicons name={ionName} size={size} color={color} style={style} />;
}
