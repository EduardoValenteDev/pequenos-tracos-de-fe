/**
 * StorybookBook — o LIVRO PERSISTENTE do onboarding (O2.2 · §4/§5/§9/§10).
 *
 * Papel marfim COM VOLUME: espessura de páginas (camadas deslocadas), sombra lateral, borda
 * dourada fina, vinco central, cantos arredondados, ornamentos de canto e ABAS de capítulo
 * (indicador integrado, "Capítulo X de 4"). O livro NÃO desmonta entre momentos — só o CONTEÚDO
 * das páginas muda, com uma VIRADA DE PÁGINA (rotateY + backface hidden, padrão já aprovado no
 * ParesFlipCard). Durante a virada, o papel permanece sob as duas páginas — nunca há fundo vazio,
 * skeleton ou moldura vazia. Movimento reduzido → troca imediata.
 */
import React from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OB } from '../../theme/onboardingVisualTokens';

const PAD = 16;   // margem interna segura para o conteúdo

function ProgressTabs({ current, total, turn, turnValue }) {
  // Destaque coordenado com a virada: a aba anterior esmaece na 1ª metade, a seguinte acende na
  // 2ª metade. O rótulo acessível "Capítulo X de 4" usa SEMPRE o COMMITTED (só muda ao concluir).
  return (
    <View
      style={styles.tabs}
      accessibilityRole="progressbar"
      accessibilityLabel={`Capítulo ${current + 1} de ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
    >
      {Array.from({ length: total }).map((_, i) => {
        // Cada aba interpola EXATAMENTE até o seu valor pós-virada (comprometido) — sem "pop" no fim.
        let opacity;
        let scaleY;
        if (turn && i === turn.from) {
          const after = turn.to > turn.from ? 0.9 : 0.4;   // vira passada (0.9) ou futura (0.4)
          opacity = turnValue.interpolate({ inputRange: [0, 1], outputRange: [1, after] });
          scaleY = turnValue.interpolate({ inputRange: [0, 1], outputRange: [1.35, 1] });
        } else if (turn && i === turn.to) {
          const before = turn.to > turn.from ? 0.4 : 0.9;
          opacity = turnValue.interpolate({ inputRange: [0, 1], outputRange: [before, 1] });
          scaleY = turnValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
        } else {
          opacity = i === current ? 1 : (i < current ? 0.9 : 0.4);
          scaleY = i === current ? 1.35 : 1;
        }
        return (
          <Animated.View
            key={i}
            style={[
              styles.tab,
              { backgroundColor: OB.markers[i % OB.markers.length], opacity, transform: [{ scaleY }] },
            ]}
          />
        );
      })}
    </View>
  );
}

function CornerOrnaments() {
  return (
    <>
      <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />
    </>
  );
}

export default function StorybookBook({
  width, height, current, total, turn, turnValue, renderPage, reduceMotion,
}) {
  const innerW = width - PAD * 2;
  const innerH = height - PAD * 2 - 14;   // 14 = faixa das abas no topo

  const rotate = turnValue.interpolate({
    inputRange: [0, 1],
    outputRange: turn?.dir === 'back' ? ['0deg', '180deg'] : ['0deg', '-180deg'],
  });
  const sheen = turnValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.28, 0] });

  const pageStyle = { position: 'absolute', left: 0, top: 0, width: innerW, height: innerH };

  return (
    <View style={[styles.wrap, { width, height }]}>
      {/* Espessura de páginas (camadas deslocadas) */}
      <View style={[styles.thickness, styles.thickness2, { width, height }]} pointerEvents="none" />
      <View style={[styles.thickness, styles.thickness1, { width, height }]} pointerEvents="none" />

      {/* Papel principal */}
      <View style={[styles.paper, { width, height }]}>
        {/* Abas de capítulo (indicador integrado, sincronizado com a virada) */}
        <View style={styles.tabsRow}><ProgressTabs current={current} total={total} turn={turn} turnValue={turnValue} /></View>

        {/* Vinco central (spine) */}
        <LinearGradient
          colors={[OB.paperShade, 'rgba(246,238,221,0)', OB.paperShade]}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={[styles.crease, { left: width / 2 - 6, height: innerH, top: PAD + 14 }]}
          pointerEvents="none"
        />

        <CornerOrnaments />

        {/* Área de conteúdo (o papel persiste sob as duas páginas) */}
        <View style={[styles.pageArea, { left: PAD, top: PAD + 14, width: innerW, height: innerH }]}>
          {/* Base = página de destino (durante a virada) ou a página atual */}
          <View style={pageStyle}>{renderPage(turn ? turn.to : current)}</View>

          {/* Página que vira (só durante a transição) */}
          {turn && !reduceMotion && (
            <Animated.View
              style={[
                pageStyle,
                styles.turningPage,
                { transform: [{ perspective: 1000 }, { rotateY: rotate }] },
              ]}
            >
              {renderPage(turn.from)}
              <Animated.View style={[styles.sheen, { opacity: sheen }]} pointerEvents="none" />
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  thickness: {
    position: 'absolute', borderRadius: OB.radiusBook, backgroundColor: OB.paperShade,
    borderWidth: 1, borderColor: OB.paperEdge,
  },
  thickness1: { transform: [{ translateX: 3 }, { translateY: 4 }] },
  thickness2: { transform: [{ translateX: 6 }, { translateY: 8 }], opacity: 0.7 },

  paper: {
    borderRadius: OB.radiusBook, backgroundColor: OB.paper,
    borderWidth: 1.5, borderColor: OB.paperEdge, overflow: 'hidden',
    shadowColor: OB.bookShadow, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  tabsRow: { position: 'absolute', top: -2, left: 0, right: 0, alignItems: 'center', zIndex: 3 },
  tabs: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  tab: { width: 26, height: 12, borderTopLeftRadius: 6, borderTopRightRadius: 6, alignItems: 'center', justifyContent: 'flex-end' },

  crease: { position: 'absolute', width: 12 },
  corner: { position: 'absolute', width: 16, height: 16, borderColor: OB.paperEdge },
  cornerTL: { top: 20, left: 8, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 },
  cornerTR: { top: 20, right: 8, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 6 },

  pageArea: { position: 'absolute', overflow: 'hidden' },
  turningPage: { backgroundColor: OB.paper, backfaceVisibility: 'hidden' },
  sheen: { ...StyleSheet.absoluteFillObject, backgroundColor: OB.goldGlow },
});
