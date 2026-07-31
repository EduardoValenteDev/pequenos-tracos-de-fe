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
 * os marcadores derivam DESSAS coordenadas. Sem fórmula de índice como fonte final.
 * O app NÃO desenha mais a trilha (a própria arte do mapa guia) e o título não
 * aparece no pin (showLabel={false}). Chip de título da região no topo da arte.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RecoverableImage from '../ui/RecoverableImage';
import StoryMapMarker from './StoryMapMarker';
import { computeRegionHeight, getStoryMapCoord, REGION_PARCHMENT_BG } from '../../data/adventureMap';

const CHIP_SAFE_Y = 0.05; // y normalizado do chip de título (acima de todo marco)
const OVERLAY_DELAY_MS = 400; // marcadores entram logo após a 1ª pintura
// B5.3 (ajuste v2) — reveal NÍTIDO: colorida recortada até a fronteira (sem feather,
// sem blur, sem cor acima do ponto). A divisão é escondida por uma LINHA DE LUZ fina
// e dourada na fronteira ("despertar do mapa"). Estático (a animação fica no B5.4).
const REVEAL_EDGE_LIGHT_H = 12; // altura (px) da linha de luz dourada na fronteira

// B5.3 — reveal ESTÁTICO sépia→cor: base sépia (asleep) sempre + camada colorida
// (awake) recortada de baixo p/ cima até `revealFraction` (0..1, do B5.2). Sem
// animação, sem storage. O `awake` binário antigo saiu do mapa principal (o
// overview/"Ver mapa" segue com sua própria lógica no AdventureMapScreen).
export default function MapRegion({ region, width, revealFraction = 0, currentStoryId, renderImageFinal = true, getState, onPressStory, registerPinTarget }) {
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
      markerScale: coord.markerScale || 1, // escala opcional por história
      x: Math.round(coord.x * width),
      y: Math.round(coord.y * regionH),
    };
  });
  const imgs = region.images || null;
  // Base SÉPIA (asleep) sempre visível; camada COLORIDA (awake) recortada por reveal.
  // PREVIEW leve (~60 KB) decodifica quase instantâneo; arte FINAL (~400 KB) entra
  // por cima quando renderImageFinal (lazy por região) — em AMBAS as camadas.
  const asleepPreview = imgs ? imgs.asleepPreview : null;
  const asleepFinal   = imgs ? imgs.asleep : null;
  const awakePreview  = imgs ? imgs.awakePreview : null;
  const awakeFinal    = imgs ? imgs.awake : null;
  // Fração revelada (colorida), de baixo p/ cima. Clamp defensivo (o helper já clampa).
  const rf = Math.max(0, Math.min(1, revealFraction ?? 0));
  const revealH = Math.round(rf * regionH);
  const showColor = rf > 0 && !!imgs;               // rf <= 0 → região totalmente sépia
  const showEdgeLight = rf > 0 && rf < 1 && !!imgs; // linha de luz só no reveal PARCIAL
  // Topo da fronteira (colorido↔sépia). Centraliza a linha de luz fina sobre ela. Clamp >= 0.
  const edgeLightTop = Math.max(0, regionH - revealH - Math.round(REVEAL_EDGE_LIGHT_H / 2));

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

      {/* CAMADA 1 — BASE SÉPIA (asleep): preview instantâneo + final lazy. Sempre
          presente e do tamanho da caixa (top:0, altura plena) — nunca some. */}
      {asleepPreview && (
        <RecoverableImage
          source={asleepPreview}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width, height: regionH, zIndex: 1 }}
          fadeDuration={0}
        />
      )}
      {renderImageFinal && asleepFinal && (
        <RecoverableImage
          source={asleepFinal}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width, height: regionH, zIndex: 2 }}
          fadeDuration={120}
        />
      )}

      {/* CAMADA 2.5 — REVEAL COLORIDO (awake) recortado de BAIXO p/ cima até revealH.
          Janela overflow:hidden ANCORADA na base (bottom:0); colorida bottom:0 em
          TAMANHO PLENO (width × regionH) → alinhada com a base sépia. NÍTIDA: a cor
          NÃO passa de revealH (sem feather/blur). rf<=0 não renderiza; rf>=1 cobre a
          região toda (sem linha). Estático (sem animação). */}
      {showColor && (
        <View
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: revealH, overflow: 'hidden', zIndex: 2 }}
          pointerEvents="none"
        >
          {awakePreview && (
            <RecoverableImage
              source={awakePreview}
              resizeMode="cover"
              style={{ position: 'absolute', bottom: 0, left: 0, width, height: regionH }}
              fadeDuration={0}
            />
          )}
          {renderImageFinal && awakeFinal && (
            <RecoverableImage
              source={awakeFinal}
              resizeMode="cover"
              style={{ position: 'absolute', bottom: 0, left: 0, width, height: regionH }}
              fadeDuration={120}
            />
          )}
        </View>
      )}

      {/* CAMADA 2.6 — LINHA DE LUZ dourada na fronteira (colorido↔sépia): fina,
          elegante, "despertar do mapa". Fora do clip → nítida exatamente na fronteira.
          Transparente nas pontas (sem faixa branca, sem blur da arte). Só no reveal
          PARCIAL (0<rf<1). NÃO cobre pins (zIndex 2 < marcadores z7). */}
      {showEdgeLight && (
        <LinearGradient
          colors={['rgba(255,214,120,0)', 'rgba(255,226,150,0.85)', 'rgba(255,214,120,0)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, top: edgeLightTop, height: REVEAL_EDGE_LIGHT_H, zIndex: 2 }}
          pointerEvents="none"
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

      {/* CAMADA 7 — marcadores (clicáveis), após atraso curto. Sem caminho desenhado
          pelo app (a trilha da ARTE guia) e SEM título no mapa (showLabel={false} →
          o título aparece só no toque/modal e nas telas da história). */}
      {showOverlay && (
        <View style={[styles.overlayFront, { height: regionH }]} pointerEvents="box-none">
          {items.map((it) => {
            const st = getState(it.story);
            // UX 2.3.1: só o marco FOCO da jornada (current/nextLocked) é registrado
            // como alvo medível para o guia — os demais não recebem ref.
            const isFocusPin = st === 'current' || st === 'nextLocked';
            return (
              <View key={it.story.id} style={[styles.markerSlot, { left: it.x, top: it.y }]}>
                <StoryMapMarker
                  story={it.story}
                  state={st}
                  labelPos={it.labelPos}
                  markerScale={it.markerScale}
                  showLabel={false}
                  completedColor={region.completedColor}
                  currentColor={region.currentColor}
                  measureRef={isFocusPin ? registerPinTarget : undefined}
                  onPress={() => onPressStory(it.story)}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  region: { position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: REGION_PARCHMENT_BG },
  placeholder: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  veil: { ...StyleSheet.absoluteFillObject, zIndex: 3, backgroundColor: 'rgba(255,250,235,0.04)' },
  // Chip de título da região no meio (z6); marcadores na frente (z7), acima de
  // tudo. Sem caminho desenhado pelo app e sem base/círculo atrás dos pins.
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
