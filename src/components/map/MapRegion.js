/**
 * MapRegion — PAINEL completo de uma região do Mapa Pergaminho (Full Map Region View).
 *
 * Cada região é um PAINEL com a altura do viewport (uma região por tela). A arte
 * aparece INTEIRA via resizeMode="contain" dentro do imageRect (sem zoom, sem
 * corte). Como os mapas são 3:8 (estreitos), as laterais são preenchidas pela
 * PRÓPRIA imagem em cover+blur com baixa opacidade + véu de pergaminho — ambiente,
 * não moldura/borda. O caminho (SVG) e os PINS se posicionam dentro do imageRect.
 *
 * Camada de arte separada deixa pronta a futura revelação A/B. Sentido da jornada:
 * 1ª história embaixo, última no topo (markerFraction). Sem CTA, sem emoji dormindo.
 */
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';
import { computeImageRect, markerFraction, REGION_PARCHMENT_BG } from '../../data/adventureMap';

const PIN_SLOT = 88; // área de toque/rótulo do pin (menor que as capas antigas)

export default function MapRegion({ region, width, panelHeight, awake, currentStoryId, renderImage, getState, onPressStory }) {
  const list = region.stories || [];
  const n = list.length;

  // Retângulo REAL da imagem (contain) dentro do painel da tela.
  const rect = computeImageRect(width, panelHeight);

  // Coordenadas relativas ao imageRect (caminho e pins nunca saem da arte).
  const colXFrac = [0.30, 0.70]; // zigue-zague dentro da imagem
  const points = list.map((s, i) => ({
    x: Math.round(rect.left + rect.width * colXFrac[i % 2]),
    y: Math.round(rect.top + rect.height * markerFraction(i, n)),
  }));

  const highlightIndex = currentStoryId ? list.findIndex((s) => s.id === currentStoryId) : -1;
  const source = region.images ? (awake ? region.images.awake : region.images.asleep) : null;

  return (
    <View style={[styles.panel, { width, height: panelHeight }]}>
      {renderImage && source && (
        <>
          {/* AMBIENTE: a própria imagem em cover+blur, baixa opacidade + véu de
              pergaminho — preenche as laterais sem parecer borda. */}
          <Image source={source} resizeMode="cover" blurRadius={14} style={[StyleSheet.absoluteFill, styles.ambient]} />
          <View style={styles.ambientVeil} pointerEvents="none" />
          {/* IMAGEM PRINCIPAL: região INTEIRA (contain) dentro do imageRect. */}
          <Image
            source={source}
            resizeMode="contain"
            fadeDuration={120}
            style={{ position: 'absolute', left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
          />
        </>
      )}

      {/* Caminho (SVG) em coords do imageRect, com brilho até a próxima aventura */}
      <MapPath width={width} height={panelHeight} points={points} color="#FFF6E0" highlightIndex={highlightIndex} />

      {/* Pins pequenos por cima (a capa grande aparece só no StoryFocusModal) */}
      {list.map((story, i) => (
        <View key={story.id} style={[styles.pinSlot, { left: points[i].x - PIN_SLOT / 2, top: points[i].y - PIN_SLOT / 2 }]}>
          <StoryMapMarker story={story} state={getState(story)} onPress={() => onPressStory(story)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { overflow: 'hidden', backgroundColor: REGION_PARCHMENT_BG },
  ambient: { opacity: 0.30 },
  ambientVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(231,214,176,0.34)' },
  pinSlot: { position: 'absolute', width: PIN_SLOT, alignItems: 'center', justifyContent: 'flex-start' },
});
