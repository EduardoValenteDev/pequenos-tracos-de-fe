/**
 * ParesFlipCard.js — Carta do Pares do Beni, flip 2.5D (R2B · §2/§4/§6/§7).
 *
 * ── Por que o flip mudou ──────────────────────────────────────────────────────
 * No R2A, perto de 90° a face rotacionada virava uma FAIXA COMPRIMIDA da ilustração
 * (a Image, mais larga que a carta, aparecia como um sliver dentro do container quase
 * sem largura). Reprovado no aparelho. Agora há TRÊS camadas e o giro é 2.5D:
 *   • verso  — opaco até ~82°, depois some
 *   • lateral (ParesCardEdge) — visível só na janela ~82°–98°
 *   • frente — invisível antes de ~98°
 * Entre 82° e 98° NENHUMA textura ilustrada aparece: só a lombada marfim/dourada. Um
 * único Animated.Value (`flip`, 0→1 = 0°→180°) controla tudo; fechar é o inverso exato.
 *
 * Segue RN Animated + useNativeDriver:true (sem Reanimated). Faces sempre montadas,
 * backfaceVisibility:'hidden', source estável, sem escala no giro, sem fade geral na
 * carta, sem shouldRasterizeIOS na imagem. Perspectiva 1300 (distorção mais suave).
 *
 * ── Encontrado em 2 fases (§7) ────────────────────────────────────────────────
 * Acerto: pulso dourado + estrela + a moldura pulsa UMA vez + véu quente breve. Depois
 * de ~700 ms, assenta num CONTORNO INTERNO fino; a imagem volta à saturação normal (véu
 * some — nunca permanente) e a estrela fica pequena. Sem sombra externa, sem escalar.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, Animated, Pressable, StyleSheet, PixelRatio } from 'react-native';
import { colors as pt, radii } from '../../theme/productTheme';
import FaithIcon from '../ui/FaithIcon';
import { getStoryCoverImage } from '../../services/storyImageService';
import { getCardFraming, computeProportionalWindow } from '../../data/gameCardFraming';
import ParesCardBack from './ParesCardBack';
import ParesCardEdge from './ParesCardEdge';

const IVORY = '#FFF8EA';
const IVORY_INNER = '#F7EEDC';
const GOLD = '#E6B455';
const GOLD_DEEP = '#CE9A2E';
const PERSPECTIVE = 1300;   // §2 — 1200–1500: foreshortening mais suave

const rpx = (v) => PixelRatio.roundToNearestPixel(v);

/** Capa dentro da janela proporcional marfim. Dimensões arredondadas ao pixel (§6). */
function CartaFrenteImagem({ storyId, width, height, radius, forceNoCover = false }) {
  const cover = forceNoCover ? null : getStoryCoverImage(storyId);
  const layout = useMemo(() => {
    if (!cover) return null;
    const src = Image.resolveAssetSource(cover);
    if (!src?.width || !src?.height) return null;
    return computeProportionalWindow(src.width, src.height, width, height, getCardFraming(storyId));
  }, [storyId, width, height, cover]);

  if (!cover || !layout) {
    return (
      <View style={[styles.janelaVazia, { width, height, borderRadius: radius }]}>
        <FaithIcon name="bible" size={Math.max(16, width * 0.24)} color={pt.textSoft} />
      </View>
    );
  }

  const { window: win, image } = layout;
  const wx = rpx(win.x); const wy = rpx(win.y); const ww = rpx(win.width); const wh = rpx(win.height);
  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          left: wx, top: wy, width: ww, height: wh,
          overflow: 'hidden',
          borderRadius: Math.max(4, rpx(radius * 0.5)),
          backgroundColor: IVORY_INNER,
        }}
      >
        <Image
          source={cover}
          fadeDuration={0}
          style={{ position: 'absolute', width: rpx(image.width), height: rpx(image.height), left: rpx(image.left), top: rpx(image.top) }}
        />
      </View>
    </View>
  );
}

function ParesFlipCard({
  carta, aberta, casada, errando,
  width, height, radius = radii.md, indice = 0,
  reduceMotion = false, flipDuration = 280, forceNoCover = false,
  onPress, onFlipEnd,
}) {
  const virada = aberta || casada;

  const flip = useRef(new Animated.Value(virada ? 1 : 0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const entrada = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const pulso = useRef(new Animated.Value(0)).current;     // anel de luz (uma vez)
  const celebra = useRef(new Animated.Value(0)).current;   // R2C — contorno+brilho da celebração (entra e SAI)
  const estrelaIn = useRef(new Animated.Value(0)).current; // R2C — estrela surge e FICA
  const [pressionada, setPressionada] = useState(false);

  // Entrada escalonada (transitória; assenta em 1 e nunca mais muda o frame). Suprimida em reduzido.
  useEffect(() => {
    if (reduceMotion) { entrada.setValue(1); return undefined; }
    const anim = Animated.timing(entrada, {
      toValue: 1, duration: 260, delay: Math.min(indice * 22, 320), useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // Giro: 260–300 ms normal; reduzido é curto. Só o giro de ABERTURA avisa (virada && finished).
  // Fechar reproduz a MESMA animação ao contrário (flip → 0).
  useEffect(() => {
    const anim = Animated.timing(flip, {
      toValue: virada ? 1 : 0,
      duration: reduceMotion ? 150 : flipDuration,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished && virada && onFlipEnd) onFlipEnd(indice);
    });
    return () => anim.stop();
  }, [virada]);   // eslint-disable-line react-hooks/exhaustive-deps

  // R2C §1 — encontrado em 3 fases (normal → matchedCelebrating → matchedSettled). Sem
  // escalar a carta. A CELEBRAÇÃO (contorno grosso + brilho + pulso) entra e SAI em ~650 ms;
  // no fim, sobra SÓ a estrela pequena. Nada de véu, nada de contorno interno permanente.
  useEffect(() => {
    if (!casada) { celebra.setValue(0); estrelaIn.setValue(0); pulso.setValue(0); return undefined; }
    const anims = [];
    // A estrela surge e FICA (não some com a celebração).
    const estrela = Animated.timing(estrelaIn, { toValue: 1, duration: 220, useNativeDriver: true });
    estrela.start(); anims.push(estrela);
    if (!reduceMotion) {
      const anel = Animated.timing(pulso, { toValue: 1, duration: 520, useNativeDriver: true });
      anel.start(); anims.push(anel);
    }
    // matchedCelebrating (600–700 ms): contorno+brilho sobem e DESCEM até 0 → matchedSettled.
    const cel = Animated.sequence([
      Animated.timing(celebra, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(reduceMotion ? 260 : 300),
      Animated.timing(celebra, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    cel.start(); anims.push(cel);
    return () => anims.forEach((a) => a.stop());
  }, [casada]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Erro: chacoalhada curta e leve.
  useEffect(() => {
    if (!errando) return undefined;
    const passo = (val, d) => Animated.timing(shake, { toValue: val, duration: d, useNativeDriver: true });
    const anim = Animated.sequence([passo(-1, 60), passo(1, 70), passo(-0.7, 70), passo(0.7, 70), passo(0, 80)]);
    anim.start();
    return () => anim.stop();
  }, [errando]);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Interpolações do flip (0→1 = 0°→180°) ──
  const rotVerso = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotFrente = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  // Verso opaco até ~82° (0.456); frente invisível antes de ~98° (0.544); no meio, só a lateral.
  const versoOp = flip.interpolate({ inputRange: [0, 0.45, 0.456], outputRange: [1, 1, 0], extrapolate: 'clamp' });
  const frenteOp = flip.interpolate({ inputRange: [0, 0.544, 0.56], outputRange: [0, 0, 1], extrapolate: 'clamp' });
  const edgeOp = flip.interpolate({ inputRange: [0.44, 0.456, 0.544, 0.56], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });
  // Reduzido: compressão horizontal curta + crossfade, SEM rotação completa.
  const scaleXreduced = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.86, 1] });
  const versoOpReduced = flip.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
  const frenteOpReduced = flip.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-7, 7] });
  const entradaScale = entrada.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });
  // Pulso fica DENTRO do frame (0.7→1.0): não invade o gap da grade (§2).
  const pulsoScale = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const pulsoOpacity = pulso.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.6, 0] });
  const celebraOpacity = celebra;   // 0→1→0: contorno grosso + brilho da celebração
  const brilhoOpacity = celebra.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] });
  const estrelaOpacity = estrelaIn;
  const estrelaScale = estrelaIn.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  const versoTransform = reduceMotion ? [{ scaleX: scaleXreduced }] : [{ perspective: PERSPECTIVE }, { rotateY: rotVerso }];
  const frenteTransform = reduceMotion ? [{ scaleX: scaleXreduced }] : [{ perspective: PERSPECTIVE }, { rotateY: rotFrente }];
  const versoOpacity = reduceMotion ? versoOpReduced : versoOp;
  const frenteOpacity = reduceMotion ? frenteOpReduced : frenteOp;

  const w = width; const h = height;
  // R2C §1 — estrela reduzida ~18% (0.24→0.20 badge · 0.15→0.125 ícone), dentro do frame.
  const starSize = Math.max(8, Math.round(w * 0.125));
  const starBadge = Math.max(14, Math.round(w * 0.20));

  return (
    <Pressable
      onPress={onPress}
      disabled={virada}
      hitSlop={2}
      onPressIn={() => setPressionada(true)}
      onPressOut={() => setPressionada(false)}
      accessibilityRole="button"
      accessibilityLabel={casada ? 'Par encontrado' : virada ? 'Carta virada' : 'Carta fechada'}
      accessibilityState={{ disabled: virada }}
    >
      <Animated.View
        style={[
          styles.box,
          pressionada && !virada && styles.boxPressionada,
          // Frame externo IMUTÁVEL entre estados (§3): sem escala persistente; só a
          // entrada transitória e a chacoalhada de erro tocam o transform.
          { width: w, height: h, borderRadius: radius, transform: [{ translateX: shakeX }, { scale: entradaScale }] },
        ]}
      >
        {/* ── VERSO premium ── */}
        <Animated.View style={[styles.face, { borderRadius: radius, opacity: versoOpacity, transform: versoTransform }]}>
          <ParesCardBack width={w} height={h} radius={radius} />
        </Animated.View>

        {/* ── FRENTE premium ── */}
        {/* R2C §1: a borda BASE é sempre NEUTRA (nunca dourada permanente). Fechada, aberta
            e encontrada têm a MESMA moldura externa; o ouro do acerto vive só nos overlays. */}
        <Animated.View
          style={[
            styles.face, styles.frente,
            { borderRadius: radius, borderColor: errando ? '#E8A33D' : '#EADFC6' },
            { opacity: frenteOpacity, transform: frenteTransform },
          ]}
        >
          {/* bevel interno (profundidade sem sombra externa) */}
          <View pointerEvents="none" style={[styles.bevel, { borderRadius: Math.max(2, radius - 1) }]} />

          <CartaFrenteImagem storyId={carta.storyId} width={w} height={h} radius={radius} forceNoCover={forceNoCover} />

          {/* CELEBRAÇÃO (matchedCelebrating): brilho suave + contorno dourado grosso + pulso.
              Tudo absoluto, pointerEvents:none, e some por completo ao assentar (matchedSettled).
              Nunca altera largura/altura/padding/borda do container. */}
          {casada && (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: '#FFE9B8', opacity: brilhoOpacity }]} />
          )}
          {casada && (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.contornoGrosso, { borderRadius: radius, opacity: celebraOpacity }]} />
          )}
          {casada && !reduceMotion && (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.pulso, { borderRadius: radius, opacity: pulsoOpacity, transform: [{ scale: pulsoScale }] }]} />
          )}

          {/* matchedSettled: sobra SÓ a estrela pequena, no canto, TOTALMENTE dentro do frame. */}
          {casada && (
            <Animated.View
              pointerEvents="none"
              style={[styles.estrela, { width: starBadge, height: starBadge, borderRadius: starBadge / 2, right: 4, bottom: 4, opacity: estrelaOpacity, transform: [{ scale: estrelaScale }] }]}
            >
              <FaithIcon name="star" size={starSize} color="#FFF" />
            </Animated.View>
          )}
        </Animated.View>

        {/* ── LATERAL 2.5D — não roda; visível só na janela ~82°–98° ── */}
        {!reduceMotion && (
          <Animated.View style={[styles.face, { opacity: edgeOp }]}>
            <ParesCardEdge height={h} width={Math.max(3, Math.min(4, w * 0.045))} radius={2} />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    // §4 — profundidade vem da MOLDURA/bevel, não de sombra extensa: sombra curta,
    // raio pequeno, opacidade baixa; elevação SÓ no pressionado. Sem sombra dourada.
    backgroundColor: IVORY,
    shadowColor: '#3A2A12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 0,
  },
  boxPressionada: { opacity: 0.92, elevation: 3 },
  face: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  frente: { backgroundColor: IVORY, borderWidth: 2 },
  bevel: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(58,42,18,0.10)',   // fio escuro de profundidade
  },
  janelaVazia: { alignItems: 'center', justifyContent: 'center', backgroundColor: IVORY_INNER },
  // R2C §1 — só o contorno GROSSO da celebração (some ao assentar). Sem contorno interno fino
  // permanente e sem borda externa dourada: matchedSettled = moldura base + estrela.
  contornoGrosso: { borderWidth: 2.5, borderColor: GOLD },
  pulso: { borderWidth: 3, borderColor: GOLD_DEEP },
  estrela: {
    position: 'absolute',
    backgroundColor: GOLD_DEEP,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default React.memo(ParesFlipCard);
