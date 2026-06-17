/**
 * MapRegion — região do Mapa Pergaminho (M3, geometria base).
 *
 * Modo PRINCIPAL (Caminhada Cinematográfica): largura total, altura proporcional
 * (computeRegionHeight = width*2048/768), arte em resizeMode="stretch" (container
 * na MESMA proporção da imagem → sem distorcer/cortar, sem contain, sem frame, sem
 * borda lateral). Container e imagem têm a MESMA altura (sem faixa morta).
 *
 * Geometria por COORDENADAS NORMALIZADAS explícitas (adventureMap.STORY_MAP_COORDS):
 * marcadores, labels e o CAMINHO (MapPath) usam os MESMOS pontos. Sem fórmula de
 * índice como fonte final. Chip de título interno em zona segura no topo da arte.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';
import { computeRegionHeight, getStoryMapCoord, REGION_PARCHMENT_BG } from '../../data/adventureMap';

const SEAM_H = 56;
const OVERLAP = 28;       // sobreposição entre regiões (sem gap/faixa morta)
const CHIP_SAFE_Y = 0.05; // y normalizado do chip de título (acima de todo marco)

export default function MapRegion({ region, width, awake, currentStoryId, isTop, renderImage, getState, onPressStory }) {
  const list = region.stories || [];
  const n = list.length;

  // Altura proporcional (modo principal). Container == imagem (sem faixa morta).
  const regionH = computeRegionHeight(width);

  // FONTE ÚNICA: coordenadas normalizadas explícitas por história.
  const items = list.map((s, i) => {
    const coord = getStoryMapCoord(s.id, i, n);
    return {
      story: s,
      labelPos: coord.label,
      x: Math.round(coord.x * width),
      y: Math.round(coord.y * regionH),
    };
  });
  const points = items.map((it) => ({ x: it.x, y: it.y }));
  const highlightIndex = currentStoryId ? list.findIndex((s) => s.id === currentStoryId) : -1;
  const source = region.images ? (awake ? region.images.awake : region.images.asleep) : null;

  return (
    <View style={[styles.region, { height: regionH, marginTop: isTop ? 0 : -OVERLAP }]}>
      {renderImage && source && (
        <Image source={source} resizeMode="stretch" style={StyleSheet.absoluteFill} fadeDuration={120} />
      )}

      <View style={styles.veil} pointerEvents="none" />

      {/* Seams de névoa — unem as regiões (topo/base), sem faixa morta */}
      <LinearGradient colors={['rgba(43,33,20,0.6)', 'rgba(231,214,176,0)']} style={[styles.seam, { top: 0, height: SEAM_H }]} pointerEvents="none" />
      <LinearGradient colors={['rgba(231,214,176,0)', 'rgba(43,33,20,0.6)']} style={[styles.seam, { bottom: 0, height: SEAM_H }]} pointerEvents="none" />

      {/* Chip de título INTERNO em zona segura (acima de todo marco) */}
      <View style={[styles.chipWrap, { top: Math.round(regionH * CHIP_SAFE_Y) }]} pointerEvents="none">
        <View style={styles.chip}>
          <Text style={styles.chipTitle}>{region.title}</Text>
        </View>
      </View>

      {/* Caminho (SVG) com os MESMOS pontos dos marcadores */}
      <MapPath width={width} height={regionH} points={points} color="#FFF6E0" highlightIndex={highlightIndex} />

      {/* Marcadores nas coordenadas explícitas; label no lado seguro */}
      {items.map((it) => (
        <View key={it.story.id} style={[styles.markerSlot, { left: it.x, top: it.y }]}>
          <StoryMapMarker
            story={it.story}
            state={getState(it.story)}
            labelPos={it.labelPos}
            onPress={() => onPressStory(it.story)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  region: { width: '100%', overflow: 'hidden', backgroundColor: REGION_PARCHMENT_BG },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,250,235,0.05)' },
  seam: { position: 'absolute', left: 0, right: 0 },
  chipWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 2 },
  chip: {
    backgroundColor: 'rgba(40,30,15,0.55)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,236,190,0.30)',
  },
  chipTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF1D6' },
  // O slot é a ÂNCORA (centro do marco) em 0×0; o pin e o label se posicionam ao
  // redor dele (o label sai para o lado seguro sem clipar).
  markerSlot: { position: 'absolute', width: 0, height: 0, alignItems: 'center', justifyContent: 'center' },
});
