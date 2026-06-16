/**
 * MapRegion — uma das 4 regiões verticais do Mapa Pergaminho (M2.2).
 *
 * Fundo = imagem REAL da região (assets/maps/), par DESPERTA (A) / ADORMECIDA (B):
 * `awake` escolhe qual. A altura respeita a PROPORÇÃO REAL da imagem (768×2048),
 * então o mapa aparece INTEIRO, sem corte (resizeMode cover = encaixe exato).
 *
 * Sentido da jornada: dentro da região o caminho SOBE — a 1ª história fica
 * embaixo (entrada) e a última no topo (parte épica). As regiões se sobrepõem
 * levemente (margem negativa) + seams de névoa, para não parecerem coladas. O
 * caminho (SVG) fica por cima do mapa, atrás dos marcos.
 */
import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';

const MARKER_W = 140;
const SEAM_H = 54;
const OVERLAP = 26; // sobreposição entre regiões (margem negativa)

// Banda vertical onde os marcos vivem (fração da altura da região), de baixo para
// cima. Poucas histórias → banda central-baixa (mostra o topo épico do mapa);
// muitas → banda mais ampla para caber com folga.
function band(n) {
  return n <= 3 ? { top: 0.34, bottom: 0.82 } : { top: 0.12, bottom: 0.88 };
}

export default function MapRegion({ region, width, awake, currentStoryId, isTop, getState, onPressStory }) {
  const list = region.stories || [];
  const pad = 16;
  const innerW = width - pad * 2;
  const colX = [pad + innerW * 0.29, pad + innerW * 0.71]; // zigue-zague

  // Altura proporcional à imagem real (768×2048) → mapa inteiro, sem corte.
  const regionH = Math.round((width * 2048) / 768);

  const n = list.length;
  const b = band(n);
  const fracFor = (i) => (n <= 1 ? 0.60 : b.bottom - ((b.bottom - b.top) / (n - 1)) * i);

  // 1ª história embaixo (i=0), última no topo → caminho sobe.
  const points = list.map((s, i) => ({ x: colX[i % 2], y: Math.round(regionH * fracFor(i)) }));

  const highlightIndex = currentStoryId ? list.findIndex((s) => s.id === currentStoryId) : -1;
  const source = region.images ? (awake ? region.images.awake : region.images.asleep) : null;

  return (
    <ImageBackground
      source={source}
      resizeMode="cover"
      style={[styles.region, { height: regionH, backgroundColor: region.tint, marginTop: isTop ? 0 : -OVERLAP }]}
    >
      <View style={styles.veil} pointerEvents="none" />

      {/* Seams de névoa de pergaminho — unem as regiões (topo e base) */}
      <LinearGradient colors={['rgba(43,33,20,0.6)', 'rgba(251,244,230,0)']} style={[styles.seam, { top: 0, height: SEAM_H }]} pointerEvents="none" />
      <LinearGradient colors={['rgba(251,244,230,0)', 'rgba(43,33,20,0.6)']} style={[styles.seam, { bottom: 0, height: SEAM_H }]} pointerEvents="none" />

      {/* Chip da região, integrado ao mapa (no alto) */}
      <View style={styles.headerRow}>
        <View style={styles.chip}>
          <Text style={styles.chipTitle}>{region.title}</Text>
          <Text style={styles.chipSub}>{region.subtitle}</Text>
        </View>
      </View>

      {/* Caminho por código (SVG), com brilho até a próxima aventura */}
      <MapPath width={width} height={regionH} points={points} color="#FFF6E0" highlightIndex={highlightIndex} />

      {/* Marcos (capas) por cima */}
      {list.map((story, i) => (
        <View key={story.id} style={[styles.markerSlot, { left: points[i].x - MARKER_W / 2, top: points[i].y - 60 }]}>
          <StoryMapMarker story={story} state={getState(story)} onPress={() => onPressStory(story)} />
        </View>
      ))}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  region: { width: '100%', overflow: 'hidden' },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,250,235,0.06)' },
  seam: { position: 'absolute', left: 0, right: 0 },
  headerRow: { alignItems: 'center', paddingTop: SEAM_H - 8 },
  chip: {
    backgroundColor: 'rgba(40,30,15,0.50)',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chipTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  chipSub: { fontFamily: 'Nunito', fontSize: 11.5, color: '#F3E8D0', fontWeight: '700' },
  markerSlot: { position: 'absolute', width: MARKER_W, alignItems: 'center' },
});
