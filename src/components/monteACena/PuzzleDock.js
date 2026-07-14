/**
 * PuzzleDock.js — MESA de peças ocupando toda a largura e todo o espaço inferior restante (item 11).
 * Fundo lavanda extremamente clara, borda superior curva + sombra superior, contorno roxo discreto.
 * Cabeçalho: "Peças restantes N · Arraste ou toque". Poços quase invisíveis (só sombra interna).
 * As peças ficam no MESMO referencial (posição dock-local vinda dos poços root-local).
 */

import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import PuzzlePiece from './PuzzlePiece';

export default function PuzzleDock({
  dockLeft, dockTop, dockW, dockH, wellSize, wells, unplaced, wellIndexOf,
  source, artW, artH, boardW, boardH, trayScale, selectedId, activeId, helpPulseId, pulseAnim,
  makePieceResponder, remaining, reduceMotion,
}) {
  return (
    <View style={[styles.dock, { left: dockLeft, top: dockTop, width: dockW, height: dockH }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Peças restantes <Text style={styles.count}>{remaining}</Text></Text>
        <Text style={styles.headerHint}>Arraste ou toque</Text>
      </View>

      {/* poços quase invisíveis */}
      {wells.map((wr, i) => (
        <View key={`w-${i}`} pointerEvents="none" style={[styles.well, { left: wr.left - dockLeft, top: wr.top - dockTop, width: wellSize, height: wellSize }]} />
      ))}

      {/* peças (dock-local; o gesto usa pageX, independe de onde a view mora) */}
      {source && unplaced.map((p) => {
        const wi = wellIndexOf(p.id); const wr = wells[wi] || wells[0];
        const spriteW = p.overscanBounds.w * boardW * trayScale;
        const spriteH = p.overscanBounds.h * boardH * trayScale;
        const isActive = activeId === p.id;
        const selected = selectedId === p.id;
        const pulsing = helpPulseId === p.id && !reduceMotion;
        return (
          <Animated.View
            key={`tp-${p.id}`}
            {...makePieceResponder(p).panHandlers}
            accessibilityRole="button"
            accessibilityLabel={`Peça ${wi + 1}. ${selected ? 'Selecionada. Toque no desenho para encaixar.' : 'Arraste ou toque para selecionar.'}`}
            style={[
              styles.piece,
              { left: (wr.cx - dockLeft) - spriteW / 2, top: (wr.cy - dockTop) - spriteH / 2, width: spriteW, height: spriteH, opacity: isActive ? 0 : 1 },
              selected && styles.selected,
              pulsing ? { transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] } : null,
            ]}
          >
            <PuzzlePiece source={source} piece={p} artW={artW} artH={artH} boardW={boardW} boardH={boardH} scale={trayScale} variant="tray" />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute', backgroundColor: '#F6F3FF',
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.14)', borderBottomWidth: 0,
    shadowColor: '#5B21B6', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: -6 }, elevation: 10,
  },
  header: { paddingTop: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.purpleDeep },
  count: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.purple },
  headerHint: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.textSoft },
  well: { position: 'absolute', borderRadius: 18, backgroundColor: 'rgba(91,33,182,0.05)' },
  piece: { position: 'absolute', zIndex: 5, alignItems: 'center', justifyContent: 'center' },
  selected: { borderWidth: 2, borderColor: pt.goldDeep, borderRadius: 14, backgroundColor: 'rgba(249,199,79,0.16)' },
});
