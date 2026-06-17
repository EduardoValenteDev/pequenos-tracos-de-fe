/**
 * MapRegion — região do Mapa Pergaminho (M3, geometria base).
 *
 * Modo PRINCIPAL (Caminhada Cinematográfica): largura total, altura proporcional
 * (computeRegionHeight = width/MAP_ASPECT). A arte usa dimensões EXPLÍCITAS
 * (width × regionH) com resizeMode="cover": como caixa e arte têm a MESMA proporção
 * 9:16, a imagem encolhe para a caixa e aparece INTEIRA, sem distorcer e sem recorte
 * (absoluteFill deixava a Image no tamanho do arquivo → overflow mostrava só o
 * centro = "zoom"). Container e imagem têm a MESMA altura (sem faixa morta).
 *
 * Geometria por COORDENADAS NORMALIZADAS explícitas (adventureMap.STORY_MAP_COORDS):
 * marcadores, labels e o CAMINHO (MapPath) usam os MESMOS pontos. Sem fórmula de
 * índice como fonte final. Chip de título interno em zona segura no topo da arte.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';
import { computeRegionHeight, getStoryMapCoord, REGION_PARCHMENT_BG } from '../../data/adventureMap';

const CHIP_SAFE_Y = 0.05; // y normalizado do chip de título (acima de todo marco)

export default function MapRegion({ region, width, awake, currentStoryId, renderImage, getState, onPressStory }) {
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
    // Sem sobreposição nem faixas de transição: cada região 9:16 aparece de TOPO A
    // BASE, sem cobrir o círculo inferior da arte. As regiões se tocam exatamente
    // (altura == imagem), sem gap e sem corte.
    <View style={[styles.region, { height: regionH }]}>
      {/* CAMADA 0 — arte de fundo da região (dimensão EXPLÍCITA = caixa; sem
          absoluteFill, sem gate por carregamento). Sempre monta quando há source. */}
      {renderImage && source && (
        <Image
          source={source}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width, height: regionH, zIndex: 0 }}
          fadeDuration={120}
        />
      )}

      {/* CAMADA 1 — véu bem transparente (não esconde a arte) */}
      <View style={styles.veil} pointerEvents="none" />

      {/* CAMADA 2 — chip de título INTERNO em zona segura (acima de todo marco) */}
      <View style={[styles.chipWrap, { top: Math.round(regionH * CHIP_SAFE_Y) }]} pointerEvents="none">
        <View style={styles.chip}>
          <Text style={styles.chipTitle}>{region.title}</Text>
        </View>
      </View>

      {/* CAMADA 3 — caminho + marcadores (acima da arte e do véu) */}
      <View style={[styles.overlay, { height: regionH }]} pointerEvents="box-none">
        <MapPath width={width} height={regionH} points={points} color="#FFF6E0" highlightIndex={highlightIndex} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  region: { position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: REGION_PARCHMENT_BG },
  veil: { ...StyleSheet.absoluteFillObject, zIndex: 1, backgroundColor: 'rgba(255,250,235,0.04)' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 },
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
