import React from 'react';
import { Ionicons } from '@expo/vector-icons';

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
  /** PROVISÓRIO: o Ionicons não tem ovelha. Trocar por SVG próprio
   *  (react-native-svg, já instalada) no bloco de assets do Brincar. */
  ovelha: 'eye',
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
  const ionName = ICON_MAP[name] ?? 'help-circle-outline';
  return <Ionicons name={ionName} size={size} color={color} style={style} />;
}
