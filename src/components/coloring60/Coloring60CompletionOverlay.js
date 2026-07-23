/**
 * Coloring60CompletionOverlay.js — experiência afetiva de conclusão do piloto Colorir 60
 * (C60-IMPL-P8 · P8B · P11 · §6..§12). Reutilizável e SEM estado de negócio: recebe o MODO decidido
 * pela máquina de conclusão (Diretor de Celebração) + o progresso das três, e devolve a escolha da
 * criança (duas ou três ações, conforme o modo).
 *
 * MODOS (P11 · §Parte 4 — três intensidades, um só componente e uma só linha do tempo):
 *   - 'update'   → ATUALIZAÇÃO: a criança concluiu de novo uma atividade JÁ concluída. Resposta
 *                  AFETIVA (Beni REAGE à arte + moldura viva + partículas + a frase exata), sem
 *                  repetir a festa de atividade e JAMAIS a grande conclusão; sem "3/3" e sem galeria.
 *   - 'activity' → PRIMEIRA CONCLUSÃO desta atividade: celebração curta (Beni maior, progresso 0→1/1→2).
 *   - 'finale'   → GRANDE CONCLUSÃO das três (só em 2/3→3/3 real): galeria das três + Beni grande.
 *
 * PRINCÍPIOS (nunca violar):
 *   - A PINTURA CONTINUA SENDO A PROTAGONISTA. Esta camada é translúcida; ela ENQUADRA a arte
 *     (palco + moldura + vinheta) e a valoriza, mas NUNCA a esconde nem a substitui por uma
 *     ilustração genérica. O cartão da conclusão vive no rodapé e deixa a arte respirar acima.
 *   - NÃO é `Modal` de sistema e NÃO é `Alert`: é uma camada em árvore, dentro da própria tela,
 *     para que o desenho permaneça visível e congelado atrás (a tela chama resetZoom antes de
 *     montar esta camada — a arte aparece inteira, centralizada, sem "zoom excessivo").
 *   - NÃO concede nem exibe progresso global, conquista ou moeda de jogo. O único progresso
 *     mostrado é o das TRÊS atividades do piloto (Luz · Vida · Cuidado).
 *   - NÃO menciona plano, pagamento ou assinatura. Se a arte não pôde ser guardada, a criança
 *     ainda assim vê a mesma celebração (a honestidade técnica fica no relatório/log de dev).
 *   - Sem dependência nova: `Animated`/`Easing` do React Native, `expo-linear-gradient`,
 *     `@expo/vector-icons`, `expo-haptics` e o Beni já existentes no projeto.
 *   - Sem loop permanente, sem flashes: cada camada anima UMA vez e descansa. Respeita movimento
 *     reduzido (tudo já no estado final, sem transições e sem partículas).
 *
 * P8B — acabamento premium: revelação com leve aproximação da moldura, vinheta que assenta a arte
 * no palco, cartão com acento superior e brilho suave, bloco de progresso em "mini jornada" (trilho
 * + marcadores + selo de contagem) e um FECHO das três claramente mais forte (Beni maior e centrado,
 * aura dourada, três marcadores acesos, partículas de luz/vida/cuidado, uma háptica de conclusão).
 *
 * Beni: em 'activity'/'finale' usa a pose oficial `celebrating2` (08_beni_celebrando_2), a mais
 * próxima de "feliz e orgulhoso" — e a única celebrando SEM o selo decorativo de estrela do
 * BeniAvatar, que aqui daria a impressão falsa de prêmio concedido. Em 'update' usa `pointLeft`
 * (11_beni_apontando_esquerda): a pose de "apontar/mostrar" é a que mais LÊ como reação à arte da
 * criança e também não traz selo de estrela. Ambas são AQUECIDAS pela tela ANTES do toque em
 * "Pronto!" (ver [C60-P8B-PREWARM] em ColoringScreen), então o Beni entra sem atraso perceptível.
 * FICA REGISTRADA a necessidade futura de uma pose EXCLUSIVA do Beni olhando para CIMA, para a
 * pintura: nenhuma pose atual olha para cima — nada de arte improvisada aqui.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BeniAvatar from '../beni/BeniAvatar';
import SoundButton from '../SoundButton';
import { playUiSound } from '../../services/audioManager';
import { colors, radii, spacing, shadows } from '../../theme/productTheme';

// Utilitário local: converte um hex de 6 dígitos do tema em rgba com alfa (para vinhetas, auras e
// acentos translúcidos derivados da MESMA paleta — sem cor nova e sem dependência).
function rgba(hex, a) {
  const h = String(hex).replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// [C60-P10-GALLERY] Composição da GALERIA da grande conclusão (§Parte 4). Este componente compõe
// COR + CONTORNO numa miniatura, portando a MESMA técnica já validada no Livrinho (StoryBookScreen:
// paint por baixo, lineart por cima com `mixBlendMode: 'multiply'`, ambos invisíveis até carregarem
// JUNTOS). Aqui a arte já vem PRONTA por PROPS (o ColoringScreen — única tela autorizada — leu o
// storage do piloto e passou o payload). Este overlay NUNCA importa o writer nem lê storage: recebe
// `paint` (string do payload salvo, ou null) e `lineart` (fonte local do contorno, ou null).
// Sem cor (Grátis não persistido / atividade sem arte / falha) → FALLBACK OFICIAL = o próprio
// contorno sozinho (asset que já existe; nenhuma imagem nova; nunca mancha de cor sem traço).
// ─────────────────────────────────────────────────────────────────────────────
const FINALE_ART_TIMEOUT_MS = 7000;

/** Lê o payload salvo (v1 data-URL ou v2 JSON com layout). Cópia local do parser do Livrinho. */
function parseDrawingPayload(raw) {
  if (!raw) return null;
  try {
    if (raw.startsWith('data:')) {
      return { uri: raw, W: null, H: null, imgX: null, imgY: null, imgW: null, imgH: null };
    }
    const p = JSON.parse(raw);
    if (!p?.data) return null;
    return {
      uri: p.data,
      W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
    };
  } catch {
    return null;
  }
}

/** Escala do RETÂNGULO DA ARTE dentro da miniatura (mesma matemática do Livrinho). */
function computeArtworkScale(containerW, containerH, v) {
  if (!containerW || !containerH || !v.canvasW || !v.canvasH || !v.lineartImgW || !v.lineartImgH) {
    return null;
  }
  const scale = Math.min(containerW / v.lineartImgW, containerH / v.lineartImgH);
  const rectW = v.lineartImgW * scale;
  const rectH = v.lineartImgH * scale;
  const rectLeft = (containerW - rectW) / 2;
  const rectTop = (containerH - rectH) / 2;
  return { scale, rectW, rectH, rectLeft, rectTop };
}
function computeLineartStyle(containerW, containerH, v) {
  const a = computeArtworkScale(containerW, containerH, v);
  if (!a) return { position: 'absolute', opacity: 0 };
  return { position: 'absolute', left: a.rectLeft, top: a.rectTop, width: a.rectW, height: a.rectH };
}
function computePaintStyle(containerW, containerH, v) {
  const a = computeArtworkScale(containerW, containerH, v);
  if (!a) return null;
  return {
    position: 'absolute',
    left: a.rectLeft - v.lineartImgX * a.scale,
    top: a.rectTop - v.lineartImgY * a.scale,
    width: v.canvasW * a.scale,
    height: v.canvasH * a.scale,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Atmosfera FECHADA por atividade (§7) — textos e paleta são contrato, não sugestão.
// `marker` é o rótulo curto usado no progresso das três (§9).
// ─────────────────────────────────────────────────────────────────────────────
const ATMOSPHERES = {
  light: {
    title: 'Sua luz ganhou cor!',
    beniLine: 'Você escolheu tantas cores para iluminar a Criação!',
    marker: 'Luz',
    icon: 'white-balance-sunny',
    tint: colors.gold,
    tintDeep: colors.goldDeep,
    tintSoft: colors.goldSoft,
    veil: ['rgba(249,199,79,0)', 'rgba(249,199,79,0.10)', 'rgba(224,162,26,0.30)'],
    motif: 'dot',
    rays: true,
  },
  living_world: {
    title: 'A vida floresceu!',
    beniLine: 'Olha quanta vida você encheu de cor!',
    marker: 'Vida',
    icon: 'leaf',
    tint: colors.green,
    tintDeep: colors.greenDeep,
    tintSoft: colors.greenSoft,
    veil: ['rgba(79,195,247,0)', 'rgba(79,195,247,0.12)', 'rgba(144,190,109,0.30)'],
    motif: 'leaf',
    rays: false,
  },
  people_and_care: {
    title: 'Seu cuidado deixou tudo especial!',
    beniLine: 'Você cuidou de cada pedacinho com muito carinho!',
    marker: 'Cuidado',
    icon: 'heart',
    tint: colors.coral,
    tintDeep: colors.beniDeep,
    tintSoft: colors.beniSoft,
    veil: ['rgba(255,122,69,0)', 'rgba(255,122,69,0.12)', 'rgba(249,199,79,0.26)'],
    motif: 'heart',
    rays: false,
  },
};

// Fecho das três atividades (§10 / P10 Parte 4): título e mensagem são CONTRATO EXATO (não
// reformular). A fala do Beni conduz a leitura da galeria (luz · vida · cuidado) sem inventar
// recompensa nova nem prometer prêmio.
const ALL_DONE_TITLE = 'Você encheu a Criação de cor!';
const ALL_DONE_BENI_LINE = 'Você viu a luz, a vida e o cuidado de Deus. Olha a sua criação!';
const ALL_DONE_MESSAGE = 'Cada desenho mostrou um jeito especial de ver, cuidar e celebrar o mundo de Deus.';
const STEP_MESSAGE = {
  1: 'Uma parte da criação ganhou cor!',
  2: 'A criação está ficando cheia de vida!',
};

// Atualização (P11 · Parte 5): quando a criança conclui DE NOVO uma atividade JÁ concluída, ela
// recebe uma resposta AFETIVA — não a festa de atividade e JAMAIS a grande conclusão, mas também
// nunca um "aviso técnico" seco. O Beni REAGE à arte (pose apontando para a pintura) e diz a frase
// EXATA abaixo (contrato — não reformular). A pintura segue protagonista, com a moldura viva.
const UPDATE_BENI_LINE = 'Eu vi suas novas cores! Seu desenho ficou ainda mais especial!';

// Cores dos motivos no FECHO (a criação inteira floresce: luz + vida + cuidado juntos).
const MOTIF_COLOR = { dot: colors.gold, leaf: colors.green, heart: colors.coral };

// Partículas discretas, com posição FIXA (nada de aleatório: a cena não pode "pular" a cada
// render). Ficam na metade de cima, sobre a pintura, e somem sozinhas — sem loop.
const MOTES = [
  { left: '11%', top: '46%', size: 11 },
  { left: '25%', top: '22%', size: 15 },
  { left: '41%', top: '52%', size: 10 },
  { left: '57%', top: '18%', size: 14 },
  { left: '72%', top: '40%', size: 12 },
  { left: '86%', top: '25%', size: 9 },
  { left: '33%', top: '10%', size: 11 },
];

function atmosphereOf(activityId) {
  return ATMOSPHERES[activityId] ?? ATMOSPHERES.light;
}

/** Preferência de movimento reduzido do sistema (mesmo padrão já usado no app). */
function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => alive && setReduceMotion(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotion(!!v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);
  return reduceMotion;
}

// ─────────────────────────────────────────────────────────────────────────────
// Palco da ARTE (§4.1/§6/§7). Vive dentro da área do canvas, por cima da pintura e sem capturar
// toque. Não cobre o desenho: assenta a arte com uma vinheta suave nas bordas e a emoldura como um
// "cartão de exposição" (moldura externa luminosa + filete interno), revelado com leve aproximação.
// ─────────────────────────────────────────────────────────────────────────────
// [C60-P11-GEOMETRY] Retângulo REAL da arte a partir do instantâneo v2 exportado (§Parte 3). Os
// campos imgX/imgY/imgW/imgH e W/H vêm em px de backing (×DPR); as RAZÕES (imgX/W etc.) são, por
// isso, independentes de DPR e mapeiam direto para a área medida do canvas — a WebView preenche a
// `canvasArea` exatamente, então o espaço de coordenadas da moldura == o do desenho. v1 (data-URL
// puro, sem layout) e payloads inválidos → null: a moldura cai no enquadramento do canvas inteiro
// (a arte continua visível; nunca uma borda deslocada por dado ausente).
function artRectFromSnapshot(snapshot) {
  if (typeof snapshot !== 'string' || snapshot.length === 0) return null;
  if (snapshot.startsWith('data:')) return null; // v1 sem layout → fallback de canvas inteiro
  let p;
  try { p = JSON.parse(snapshot); } catch { return null; }
  if (!p || typeof p !== 'object') return null;
  const { W, H, imgX, imgY, imgW, imgH } = p;
  const nums = [W, H, imgX, imgY, imgW, imgH];
  if (!nums.every((n) => typeof n === 'number' && isFinite(n))) return null;
  if (!(W > 0 && H > 0 && imgW > 0 && imgH > 0)) return null;
  const fx = imgX / W;
  const fy = imgY / H;
  const fw = imgW / W;
  const fh = imgH / H;
  // Sanidade: a arte cabe no canvas (tolerância mínima para o arredondamento do export).
  if (fw <= 0 || fh <= 0 || fw > 1.02 || fh > 1.02) return null;
  if (fx < -0.02 || fy < -0.02 || fx + fw > 1.02 || fy + fh > 1.02) return null;
  return { fx, fy, fw, fh };
}

const FRAME_PAD = 6;

export function Coloring60ArtGlow({ activityId, active, snapshot = null }) {
  const atmo = atmosphereOf(activityId);
  const reduceMotion = useReduceMotion();
  const anim = useRef(new Animated.Value(0)).current;
  // Tamanho MEDIDO da área do canvas (a moldura vive no mesmo espaço). Recalcula sozinho em mudança
  // de orientação/tamanho (onLayout redispara) e em troca de atividade (o ramo remonta pela key).
  const [box, setBox] = useState(null);

  useEffect(() => {
    if (!active) return undefined;
    if (reduceMotion) { anim.setValue(1); return undefined; }
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: 640,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [active, reduceMotion]);

  // Mede a área continuamente (mesmo inativa): quando a celebração começa, a moldura já nasce no
  // lugar certo, sem um primeiro quadro deslocado. Só atualiza o estado quando o tamanho muda.
  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  };

  // A moldura entra e "assenta" de 1.03 → 1.0 (leve aproximação, §7).
  const frameScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1.03, 1] });

  // §Parte 3 — a moldura segue os LIMITES REAIS da arte (nunca a barra de ferramentas nem a área
  // vazia embaixo). Com o instantâneo v2 + a área medida, calcula a caixa exata (inflada por uma
  // folga suave). Sem geometria (v1 / dado ausente / ainda não medido) → enquadra o canvas inteiro,
  // preservando "a arte visível durante toda a celebração".
  const rect = artRectFromSnapshot(snapshot);
  const artBox = (rect && box && box.w > 0 && box.h > 0)
    ? {
        left: rect.fx * box.w - FRAME_PAD,
        top: rect.fy * box.h - FRAME_PAD,
        width: rect.fw * box.w + FRAME_PAD * 2,
        height: rect.fh * box.h + FRAME_PAD * 2,
      }
    : null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {!active ? null : (
        <>
          {/* Vinheta: escurece com delicadeza o topo e a base para dar profundidade e destacar a
              arte no centro — sem tocar a leitura do desenho (o meio permanece transparente). */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: anim }]}>
            <LinearGradient
              colors={[rgba(atmo.tintDeep, 0.16), 'transparent', 'transparent', rgba(atmo.tintDeep, 0.22)]}
              locations={[0, 0.2, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          {/* Moldura de exposição (palco): brilho externo tingido + filete interno suave. Segue os
              limites reais da arte quando conhecidos; senão, o canvas inteiro (fallback honesto). */}
          {artBox ? (
            <Animated.View
              pointerEvents="none"
              style={[glowStyles.frameLayer, artBox, { opacity: anim, transform: [{ scale: frameScale }] }]}
            >
              <View style={[glowStyles.frameFill, { borderColor: atmo.tint, shadowColor: atmo.tintDeep }]} />
              <View style={[glowStyles.frameFillInner, { borderColor: atmo.tintSoft }]} />
            </Animated.View>
          ) : (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, glowStyles.wrap, { opacity: anim, transform: [{ scale: frameScale }] }]}
            >
              <View style={[glowStyles.frame, { borderColor: atmo.tint, shadowColor: atmo.tintDeep }]} />
              <View style={[glowStyles.frameInner, { borderColor: atmo.tintSoft }]} />
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
}

const glowStyles = StyleSheet.create({
  wrap: { alignItems: 'stretch', justifyContent: 'center' },
  // Camada da moldura ANCORADA no retângulo real da arte (escala em torno do centro da arte).
  frameLayer: { position: 'absolute' },
  frameFill: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderRadius: 20,
    elevation: 8,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  frameFillInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 5,
    borderWidth: 1.5,
    borderRadius: 15,
    opacity: 0.65,
  },
  // Fallback (sem geometria): emoldura o canvas inteiro — a arte segue visível, sem borda deslocada.
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 6,
    borderWidth: 3,
    borderRadius: 24,
    elevation: 8,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  frameInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 11,
    borderWidth: 1.5,
    borderRadius: 19,
    opacity: 0.65,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Marcador de uma das três atividades (§9). Três estados honestos e distintos, e NENHUM deles é
// representado por estrela. No fecho (`celebratory`), os concluídos ganham um anel mais firme.
// ─────────────────────────────────────────────────────────────────────────────
function StepMarker({ step, state, celebratory }) {
  const atmo = atmosphereOf(step);
  const isCurrent = state === 'current';
  const isDone = state === 'done' || isCurrent;
  return (
    <View style={markerStyles.item}>
      <View
        style={[
          markerStyles.circle,
          isDone && { backgroundColor: atmo.tintSoft, borderColor: atmo.tint },
          celebratory && isDone && { borderColor: atmo.tint, borderWidth: 3 },
          isCurrent && { backgroundColor: atmo.tint, borderColor: atmo.tintDeep, borderWidth: 3 },
        ]}
      >
        <MaterialCommunityIcons
          name={atmo.icon}
          size={isCurrent ? 22 : 20}
          color={isCurrent ? '#FFFFFF' : (isDone ? atmo.tintDeep : colors.muted)}
        />
      </View>
      <Text
        style={[markerStyles.label, isDone && { color: colors.text, fontWeight: '700' }]}
        numberOfLines={1}
      >
        {atmo.marker}
      </Text>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  item: { alignItems: 'center', width: 72 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  label: { marginTop: 4, fontSize: 12, color: colors.textSoft },
  connector: { width: 16, height: 4, borderRadius: 2, marginTop: 20, marginHorizontal: -2, backgroundColor: colors.border },
});

// ─────────────────────────────────────────────────────────────────────────────
// [C60-P10-GALLERY] Miniatura de UMA arte no fecho. Compõe COR + CONTORNO (paint por baixo, lineart
// por cima com multiply) e SÓ revela a composição quando as duas imagens carregam JUNTAS — nunca cor
// sem traço. Sem cor (Grátis não persistido / atividade sem arte / falha/timeout) → FALLBACK OFICIAL
// = o contorno sozinho (asset existente). A arte chega por PROPS; este componente não lê storage.
// ─────────────────────────────────────────────────────────────────────────────
const FINALE_THUMB_W = 92;
const FINALE_THUMB_H = 116; // ~4:5 retrato, a mesma proporção dos linearts do piloto (1122×1402)

function FinaleDrawingThumb({ paint, lineart, marker, tint, tintDeep, tintSoft, revealStyle }) {
  const parsed = paint ? parseDrawingPayload(paint) : null;
  const positioned = !!(
    parsed && parsed.W && parsed.H
    && parsed.imgX !== null && parsed.imgY !== null && parsed.imgW && parsed.imgH
  );
  const visual = parsed
    ? {
        paintUri: parsed.uri, baseImage: lineart,
        canvasW: parsed.W, canvasH: parsed.H,
        lineartImgX: parsed.imgX, lineartImgY: parsed.imgY,
        lineartImgW: parsed.imgW, lineartImgH: parsed.imgH,
      }
    : null;
  const hasColor = !!(parsed && lineart);

  const [paintLoaded, setPaintLoaded] = useState(false);
  const [lineartLoaded, setLineartLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const paintAbsStyle = positioned ? computePaintStyle(FINALE_THUMB_W, FINALE_THUMB_H, visual) : null;
  const lineartAbsStyle = positioned ? computeLineartStyle(FINALE_THUMB_W, FINALE_THUMB_H, visual) : null;
  const measured = !positioned || !!paintAbsStyle;
  const colorReady = hasColor && paintLoaded && lineartLoaded && measured;
  const giveUp = hasColor && !colorReady && (failed || timedOut);

  useEffect(() => {
    if (!hasColor || colorReady || failed) return undefined;
    const t = setTimeout(() => setTimedOut(true), FINALE_ART_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [hasColor, colorReady, failed]);

  // O contorno sozinho serve de placeholder honesto enquanto a cor não chega E de fallback oficial
  // definitivo (sem cor, ou quando a cor falha/estoura). Some assim que a composição colorida fica
  // pronta → nunca dois contornos ao mesmo tempo, nunca cor sem traço.
  const showLineartAlone = !!lineart && !colorReady;
  const lineartSoloStyle = positioned && lineartAbsStyle ? lineartAbsStyle : StyleSheet.absoluteFill;

  return (
    <Animated.View style={[galleryStyles.thumbCol, revealStyle]}>
      <View style={[galleryStyles.frame, { borderColor: tint }]}>
        <View style={galleryStyles.paper} />

        {hasColor && !giveUp && (
          <View style={[StyleSheet.absoluteFill, { opacity: colorReady ? 1 : 0 }]}>
            <Image
              source={{ uri: visual.paintUri }}
              style={positioned && paintAbsStyle ? paintAbsStyle : StyleSheet.absoluteFill}
              resizeMode={positioned ? 'stretch' : 'contain'}
              fadeDuration={0}
              onLoad={() => setPaintLoaded(true)}
              onError={() => setFailed(true)}
            />
            <Image
              source={lineart}
              style={positioned && lineartAbsStyle
                ? [lineartAbsStyle, galleryStyles.multiply]
                : [StyleSheet.absoluteFill, galleryStyles.multiply]}
              resizeMode={positioned ? 'stretch' : 'contain'}
              fadeDuration={0}
              onLoad={() => setLineartLoaded(true)}
              onError={() => setFailed(true)}
            />
          </View>
        )}

        {showLineartAlone && (
          <Image source={lineart} style={lineartSoloStyle} resizeMode={positioned ? 'stretch' : 'contain'} fadeDuration={0} />
        )}

        {!lineart && (
          <View style={[StyleSheet.absoluteFill, galleryStyles.thumbEmpty]}>
            <MaterialCommunityIcons name="image-outline" size={22} color={tintSoft} />
          </View>
        )}
      </View>
      <Text style={[galleryStyles.thumbLabel, { color: tintDeep }]} numberOfLines={1}>{marker}</Text>
    </Animated.View>
  );
}

const galleryStyles = StyleSheet.create({
  thumbCol: { alignItems: 'center', marginHorizontal: 5 },
  frame: {
    width: FINALE_THUMB_W,
    height: FINALE_THUMB_H,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#FFFDF8',
  },
  paper: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFFDF8' },
  multiply: { mixBlendMode: 'multiply' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  thumbLabel: { marginTop: 5, fontSize: 12, fontWeight: '800' },
});

// ─────────────────────────────────────────────────────────────────────────────
// A experiência em si.
//
// Sequência (§6/§12): camada de luz (300 ms) → Beni entra (~450 ms) → texto → progresso → ações.
// As ações aparecem por último, mas MUITO antes do fim da animação decorativa — a criança nunca
// precisa esperar as partículas descansarem para poder tocar.
// ─────────────────────────────────────────────────────────────────────────────
export default function Coloring60CompletionOverlay({
  mode = 'activity',
  activityId,
  steps = [],
  finaleItems = null,
  bottomInset = 0,
  onPrimary,
  onSecondary,
  onTertiary,
}) {
  const reduceMotion = useReduceMotion();
  const atmo = atmosphereOf(activityId);

  // O MODO é decidido pela MÁQUINA DE CONCLUSÃO (ColoringScreen), a única autoridade sobre o desfecho
  // (Diretor de Celebração, §Parte 4): 'update' (atualização afetiva de arte JÁ concluída), 'activity'
  // (primeira conclusão desta atividade) ou 'finale' (grande conclusão das três, só em 2/3→3/3 real).
  // O overlay NÃO reinfere o desfecho a partir do progresso — ele apenas APRESENTA o modo recebido.
  const isUpdate = mode === 'update';
  const allDone = mode === 'finale';

  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length || 3;

  const title = allDone ? ALL_DONE_TITLE : atmo.title;
  const beniLine = allDone ? ALL_DONE_BENI_LINE : atmo.beniLine;
  const message = allDone ? ALL_DONE_MESSAGE : (isUpdate ? null : (STEP_MESSAGE[doneCount] ?? null));
  const primaryLabel = isUpdate
    ? 'Continuar colorindo'
    : (allDone ? 'Ver meus desenhos' : 'Colorir o próximo');

  // FECHO com identidade dourada (mais nobre) sobre a moldura quente da 3ª atividade.
  const accent = allDone ? colors.gold : atmo.tint;
  const accentDeep = allDone ? colors.goldDeep : atmo.tintDeep;
  const accentSoft = allDone ? colors.goldSoft : atmo.tintSoft;
  const veilColors = allDone
    ? ['rgba(249,199,79,0)', 'rgba(249,199,79,0.13)', 'rgba(224,162,26,0.32)']
    : atmo.veil;

  const veilAnim = useRef(new Animated.Value(0)).current;
  const beniAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const moteAnims = useRef(MOTES.map(() => new Animated.Value(0))).current;
  // Revelação em sequência das TRÊS artes do fecho (§Parte 4). Uma por atividade (Luz · Vida · Cuidado).
  const galleryAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // UMA resposta háptica + UM som curto de confirmação (o mesmo canal de UI já existente, que
    // respeita a preferência de sons da Área dos Pais). Nenhum asset novo. A intensidade acompanha o
    // modo: FECHO = Success (conclusão), atividade = Light (impacto), atualização = selection (a mais
    // leve). O som positivo ('success') vale para os três — a ATUALIZAÇÃO é celebração, não um aviso
    // técnico seco (§Parte 5) — e playUiSound é internamente à prova de falha (não bloqueia, §Parte 8).
    if (!reduceMotion) {
      try {
        if (allDone) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        else if (isUpdate) Haptics.selectionAsync?.().catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch { /* segue sem háptica */ }
    }
    playUiSound('success');
  }, []);

  useEffect(() => {
    const values = [veilAnim, beniAnim, textAnim, progressAnim, actionsAnim];
    if (reduceMotion) {
      // Movimento reduzido: tudo já no estado final, sem transições e sem partículas.
      values.forEach((v) => v.setValue(1));
      galleryAnims.forEach((v) => v.setValue(1));
      return undefined;
    }
    const step = (value, duration, delay) => Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const anim = Animated.parallel([
      step(veilAnim, 300, 0),        // camada de luz — 250..400 ms
      Animated.spring(beniAnim, {    // Beni entra com movimento suave — ~450 ms
        toValue: 1, delay: 150, tension: 55, friction: 8, useNativeDriver: true,
      }),
      step(textAnim, 240, 480),      // texto SÓ depois do Beni
      step(progressAnim, 240, 700),  // progresso/mensagem do fecho depois do texto
      step(actionsAnim, 220, 880),   // ações por último (ainda assim < 1,1 s)
      Animated.stagger(90, moteAnims.map((v) => Animated.timing(v, {
        toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }))),
      // Galeria do fecho: cada arte entra em sequência (Luz → Vida → Cuidado). As ações já estão
      // tocáveis antes de a última assentar — a criança nunca espera a revelação terminar.
      Animated.stagger(150, galleryAnims.map((v) => step(v, 300, 620))),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion]);

  const rise = (value, distance) => ({
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

  const beniStyle = {
    opacity: beniAnim,
    transform: [
      { scale: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
      { translateY: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
    ],
  };
  const auraStyle = { opacity: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }) };

  // Partículas: sobem devagar e se apagam. No FECHO cada uma é um motivo diferente (luz/vida/cuidado)
  // para a criação inteira "florescer"; nas etapas, o motivo é o da atmosfera atual.
  const motifFor = (i) => (allDone ? ['dot', 'leaf', 'heart'][i % 3] : atmo.motif);
  // Atualização recebe o conjunto CHEIO de partículas temáticas (§Parte 5: 6–10) — é celebração de
  // verdade; a atividade fica num conjunto mais enxuto. O FECHO usa todas, com os três motivos.
  const moteCount = allDone || isUpdate ? MOTES.length : 5;
  const motes = reduceMotion ? [] : MOTES.slice(0, moteCount).map((m, i) => {
    const v = moteAnims[i];
    const motif = motifFor(i);
    const tint = allDone ? MOTIF_COLOR[motif] : atmo.tint;
    const style = {
      position: 'absolute',
      left: m.left,
      top: m.top,
      opacity: v.interpolate({ inputRange: [0, 0.25, 0.7, 1], outputRange: [0, 0.85, 0.6, 0] }),
      transform: [
        { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, -22] }) },
        { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.05] }) },
      ],
    };
    if (motif === 'dot') {
      return (
        <Animated.View
          key={`mote-${i}`}
          style={[style, { width: m.size, height: m.size, borderRadius: m.size / 2, backgroundColor: tint }]}
        />
      );
    }
    return (
      <Animated.View key={`mote-${i}`} style={style}>
        <MaterialCommunityIcons name={motif === 'leaf' ? 'leaf' : 'heart'} size={m.size + 6} color={tint} />
      </Animated.View>
    );
  });

  // Dados da galeria do fecho: ordem canônica (Luz · Vida · Cuidado) vinda do progresso; a arte
  // (payload salvo + contorno) já chega PRONTA por props — este overlay não lê storage nem o writer.
  const orderIds = steps.length ? steps.map((s) => s.id) : ['light', 'living_world', 'people_and_care'];
  const finaleById = new Map((finaleItems || []).map((it) => [it.activityId, it]));
  const galleryData = orderIds.map((id) => {
    const a = atmosphereOf(id);
    const it = finaleById.get(id);
    return {
      key: id, marker: a.marker, tint: a.tint, tintDeep: a.tintDeep, tintSoft: a.tintSoft,
      paint: it?.paint ?? null, lineart: it?.lineart ?? null,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      {/* Camada de luz: gradiente translúcido que realça sem esconder a pintura. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: veilAnim }]}>
        <LinearGradient
          colors={veilColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {atmo.rays && !allDone && (
          <View style={styles.rays} pointerEvents="none">
            <View style={[styles.ray, { backgroundColor: atmo.tint, transform: [{ rotate: '-18deg' }] }]} />
            <View style={[styles.ray, { backgroundColor: atmo.tintSoft, transform: [{ rotate: '6deg' }] }]} />
            <View style={[styles.ray, { backgroundColor: atmo.tint, transform: [{ rotate: '24deg' }] }]} />
          </View>
        )}
        {motes}
      </Animated.View>

      <View style={[styles.dock, { paddingBottom: bottomInset + 12 }]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            allDone && { borderColor: accent, borderWidth: 2 },
            rise(veilAnim, 14),
          ]}
        >
          {/* Acento superior: um filete de luz na cor da atividade (dourado no fecho). */}
          <LinearGradient
            colors={[rgba(accent, 0), accent, rgba(accent, 0)]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.cardAccent}
          />

          {allDone ? (
            <View style={styles.headColumn}>
              <View style={styles.beniWrapCol}>
                <Animated.View pointerEvents="none" style={[styles.beniAura, auraStyle]}>
                  <LinearGradient
                    colors={[rgba(accent, 0.42), rgba(accent, 0)]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0.4 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                </Animated.View>
                <Animated.View style={beniStyle}>
                  <BeniAvatar variant="celebrating2" size="hero" />
                </Animated.View>
              </View>
              <Animated.View style={[styles.headTextCol, rise(textAnim, 10)]}>
                <Text style={[styles.titleBig, { color: accentDeep }]}>{title}</Text>
                <Text style={[styles.beniLine, styles.textCenter]}>{beniLine}</Text>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.headRow}>
              {/* §Parte 4/5 · celebração de atividade OU atualização: Beni com presença MAIOR (large),
                  ao lado do texto — a pintura da criança continua protagonista, visível atrás. Na
                  ATUALIZAÇÃO o Beni REAGE à arte (pose apontando para a pintura); na atividade, celebra
                  voltado à criança (celebrating2). Nenhuma pose atual olha para cima — limitação de arte
                  registrada no cabeçalho deste arquivo; nada é improvisado. */}
              <Animated.View style={beniStyle}>
                <BeniAvatar variant={isUpdate ? 'pointLeft' : 'celebrating2'} size="large" />
              </Animated.View>
              <Animated.View style={[styles.headText, rise(textAnim, 10)]}>
                {isUpdate ? (
                  <Text style={styles.updateLine}>{UPDATE_BENI_LINE}</Text>
                ) : (
                  <>
                    <Text style={[styles.title, { color: accentDeep }]}>{title}</Text>
                    <Text style={styles.beniLine}>{beniLine}</Text>
                  </>
                )}
              </Animated.View>
            </View>
          )}

          {allDone ? (
            <>
              {/* GALERIA da grande conclusão (§Parte 4): as TRÊS artes da criança lado a lado, cada
                  uma com seu marcador (Luz · Vida · Cuidado), reveladas em sequência. A arte é a
                  PROTAGONISTA do fecho; sem preencher com área vazia. Sem desenho salvo → o próprio
                  contorno oficial (fallback honesto), nunca cor solta e nunca imagem nova. */}
              <Animated.View style={[styles.gallery, rise(progressAnim, 8)]}>
                {galleryData.map((it, i) => (
                  <FinaleDrawingThumb
                    key={it.key}
                    paint={it.paint}
                    lineart={it.lineart}
                    marker={it.marker}
                    tint={it.tint}
                    tintDeep={it.tintDeep}
                    tintSoft={it.tintSoft}
                    revealStyle={reduceMotion ? null : {
                      opacity: galleryAnims[i],
                      transform: [
                        { translateY: galleryAnims[i].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
                        { scale: galleryAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                      ],
                    }}
                  />
                ))}
              </Animated.View>
              {message !== null && (
                <Animated.Text style={[styles.message, styles.messageFinale, rise(progressAnim, 10)]}>
                  {message}
                </Animated.Text>
              )}
            </>
          ) : isUpdate ? null : (
            // §Parte 5 · a ATUALIZAÇÃO é leve: Beni reagindo + a frase exata + partículas + duas ações.
            // Sem mensagem de etapa, SEM o bloco de progresso (nunca o "3/3") e SEM a galeria do fecho.
            <>
              {message !== null && (
                <Animated.Text style={[styles.message, rise(textAnim, 10)]}>{message}</Animated.Text>
              )}
              <Animated.View style={[styles.progressBox, rise(progressAnim, 10)]}>
                <Text style={styles.progressTitle}>Colorir com o Beni</Text>
                <View style={styles.markersRow}>
                  {steps.map((s, i) => {
                    const lit = s.done || s.id === activityId;
                    return (
                      <React.Fragment key={s.id}>
                        <StepMarker
                          step={s.id}
                          state={s.id === activityId ? 'current' : (s.done ? 'done' : 'todo')}
                          celebratory={allDone}
                        />
                        {i < steps.length - 1 && (
                          <View style={[markerStyles.connector, lit && { backgroundColor: accent }]} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
                <View style={[styles.countPill, { backgroundColor: accentSoft, borderColor: accent }]}>
                  <Text style={[styles.countPillText, { color: accentDeep }]}>{`${doneCount} de ${total}`}</Text>
                </View>
              </Animated.View>
            </>
          )}

          <Animated.View style={[styles.actions, rise(actionsAnim, 10)]}>
            <SoundButton
              style={[styles.primaryBtn, { backgroundColor: colors.beni }]}
              accessibilityLabel={primaryLabel}
              onPress={onPrimary}
            >
              <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
            </SoundButton>
            <SoundButton
              style={styles.secondaryBtn}
              accessibilityLabel="Voltar à aventura"
              onPress={onSecondary}
            >
              <Text style={styles.secondaryBtnText}>Voltar à aventura</Text>
            </SoundButton>
            {allDone && typeof onTertiary === 'function' && (
              // §Parte 7 · a grande conclusão oferece TRÊS caminhos: ver os desenhos, voltar à
              // aventura e colorir novamente (recomeçar as três, sem apagar nada do que foi salvo).
              <SoundButton
                style={styles.tertiaryBtn}
                accessibilityLabel="Colorir novamente"
                onPress={onTertiary}
              >
                <Text style={styles.tertiaryBtnText}>Colorir novamente</Text>
              </SoundButton>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rays: {
    position: 'absolute',
    top: '4%',
    left: 0,
    right: 0,
    height: '46%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0.28,
  },
  ray: { width: 8, height: '100%', borderRadius: 4 },

  dock: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingTop: spacing.md + 4,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  headRow: { flexDirection: 'row', alignItems: 'center' },
  headText: { flex: 1, marginLeft: spacing.sm },

  headColumn: { alignItems: 'center' },
  beniWrapCol: { width: 176, height: 148, alignItems: 'center', justifyContent: 'flex-end' },
  beniAura: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    top: '50%',
    left: '50%',
    marginTop: -96,
    marginLeft: -88,
    overflow: 'hidden',
  },
  headTextCol: { alignItems: 'center', marginTop: spacing.xs },

  title: { fontSize: 20, fontWeight: '800' },
  titleBig: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  beniLine: { fontSize: 14, color: colors.text, marginTop: 2, lineHeight: 19 },
  textCenter: { textAlign: 'center' },
  message: { fontSize: 14, color: colors.textSoft, marginTop: spacing.sm, textAlign: 'center' },
  messageFinale: { fontSize: 14, color: colors.text, lineHeight: 20, marginTop: spacing.sm },

  gallery: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },

  progressBox: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  progressTitle: { fontSize: 13, fontWeight: '700', color: colors.textSoft },
  markersRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: spacing.sm },
  countPill: {
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  countPillText: { fontSize: 13, fontWeight: '800' },

  actions: { marginTop: spacing.md },
  primaryBtn: {
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  secondaryBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  secondaryBtnText: { color: colors.textSoft, fontSize: 15, fontWeight: '700' },
  tertiaryBtn: { minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  tertiaryBtnText: { color: colors.textSoft, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },

  // §Parte 5 · atualização: a frase EXATA do Beni como uma "fala" presente (sem título técnico seco).
  updateLine: { fontSize: 16, color: colors.text, fontWeight: '700', lineHeight: 22 },
});
