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
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapPath from './MapPath';
import StoryMapMarker from './StoryMapMarker';
import { computeRegionHeight, getStoryMapCoord, REGION_PARCHMENT_BG } from '../../data/adventureMap';

const CHIP_SAFE_Y = 0.05; // y normalizado do chip de título (acima de todo marco)
const OVERLAY_DELAY_MS = 400; // path/marcadores entram logo após a 1ª pintura

export default function MapRegion({ region, width, awake, currentStoryId, renderImageFinal = true, getState, onPressStory }) {
  const list = region.stories || [];
  const n = list.length;

  // Caminho + marcadores entram após um atraso CURTO (não 0 → não "flutuam" sobre o
  // pergaminho no 1º frame; não dependem de onLoadEnd → nunca somem por 30s).
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowOverlay(true), OVERLAY_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

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
  const imgs = region.images || null;
  // PREVIEW leve (~60 KB) — decodifica quase instantâneo, aparece de imediato.
  const previewSource = imgs ? (awake ? imgs.awakePreview : imgs.asleepPreview) : null;
  // Arte FINAL nítida (~400 KB) — entra POR CIMA da preview quando renderImageFinal.
  const source = imgs ? (awake ? imgs.awake : imgs.asleep) : null;

  return (
    // Sem sobreposição nem faixas de transição: cada região 9:16 aparece de TOPO A
    // BASE, sem cobrir o círculo inferior da arte. As regiões se tocam exatamente
    // (altura == imagem), sem gap e sem corte.
    <View style={[styles.region, { height: regionH }]}>
      {/* CAMADA 0 — PLACEHOLDER de pergaminho (atrás da arte). Enquanto a arte
          decodifica, mostra um pergaminho com variação sutil — não bege chapado. */}
      <LinearGradient
        colors={['#EFE0C2', '#E2CEA6', '#E8D6B2']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.placeholder}
        pointerEvents="none"
      />

      {/* CAMADA 1 — PREVIEW leve (dimensão EXPLÍCITA = caixa; sem absoluteFill).
          Decodifica quase na hora e cobre o placeholder → o usuário vê o mapa de
          imediato (em baixa resolução), sem fundo bege perceptível. */}
      {previewSource && (
        <Image
          source={previewSource}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width, height: regionH, zIndex: 1 }}
          fadeDuration={0}
        />
      )}

      {/* CAMADA 2 — arte FINAL nítida (dimensão EXPLÍCITA = caixa; sem absoluteFill).
          Só monta quando renderImageFinal (lazy por região). Ao decodificar, cobre a
          preview e fica nítida — sem parecer bug. */}
      {renderImageFinal && source && (
        <Image
          source={source}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width, height: regionH, zIndex: 2 }}
          fadeDuration={120}
        />
      )}

      {/* CAMADA 3 — véu bem transparente (não esconde a arte) */}
      <View style={styles.veil} pointerEvents="none" />

      {/* CAMADA 6 — chip de título INTERNO em zona segura (acima do caminho) */}
      <View style={[styles.chipWrap, { top: Math.round(regionH * CHIP_SAFE_Y) }]} pointerEvents="none">
        <View style={styles.chip}>
          <Text style={styles.chipTitle}>{region.title}</Text>
        </View>
      </View>

      {/* CAMADAS 4 e 7 — caminho (DECORATIVO, atrás) e marcadores (CLICÁVEIS,
          frente). Entram após atraso curto (showOverlay). Sem base/círculo atrás
          dos marcos: as histórias ficam diretamente sobre o cenário do mapa. */}
      {showOverlay && (
        <>
          {/* CAMADA 4 — caminho (atrás dos pins). Não clicável. */}
          <View style={[styles.overlayBack, { height: regionH }]} pointerEvents="none">
            <MapPath width={width} height={regionH} points={points} color="#FFF6E0" highlightIndex={highlightIndex} />
          </View>

          {/* CAMADA 7 — marcadores (clicáveis, acima do chip e do caminho) */}
          <View style={[styles.overlayFront, { height: regionH }]} pointerEvents="box-none">
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  region: { position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: REGION_PARCHMENT_BG },
  placeholder: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  veil: { ...StyleSheet.absoluteFillObject, zIndex: 3, backgroundColor: 'rgba(255,250,235,0.04)' },
  // Caminho fica ATRÁS (z4); chip no meio (z6); marcadores na frente (z7) → o
  // caminho não cobre o chip e os pins ficam acima de tudo. Sem base/círculo.
  overlayBack: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 4 },
  overlayFront: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 7 },
  chipWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 6 },
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
