/**
 * Coloring60CompletionOverlay.js — experiência AFETIVA de conclusão do piloto Colorir 60
 * (C60-IMPL-P12 · "Colorir com o Beni" · Experiência de Celebração Definitiva).
 *
 * VERDADE CENTRAL (nunca esquecer): a criança NÃO está salvando um arquivo. Ela está MOSTRANDO ao
 * Beni algo que criou. O Beni OBSERVA, REAGE, CELEBRA e CONECTA aquela criação ao significado da
 * história. Esta camada não é um recibo técnico nem um cartão administrativo — é o momento em que a
 * obra da criança faz o Beni (e o mundo) reagirem.
 *
 * MODOS (§Parte 4 — três intensidades, UM só componente, UMA só linha do tempo dirigida):
 *   - 'update'   → ATUALIZAÇÃO (2–2,6 s): a criança recoloriu uma atividade JÁ concluída. O Beni
 *                  ADMIRA a nova arte (pose admiraEsquerda/admiraDireita, escolhida pela composição
 *                  real) e diz a frase EXATA da atividade. Sem "3/3" e sem galeria.
 *   - 'activity' → PRIMEIRA CONCLUSÃO desta atividade (3,8–4,8 s): o Beni CELEBRA de frente
 *                  (celebraFrente) ou OLHA para a obra acima dele (olhaAcima, quando a geometria põe
 *                  a arte no alto). Progresso X→X+1. Três ações.
 *   - 'finale'   → GRANDE CONCLUSÃO das três (6–8 s, só em 2/3→3/3 real): "A Criação Ganha Vida". O
 *                  Beni APRESENTA a galeria das três (apresentaGaleria). Mostra "3 de 3" e o nome da
 *                  criação. JAMAIS dispara em edição.
 *
 * PRINCÍPIOS (invioláveis):
 *   - A PINTURA CONTINUA SENDO A PROTAGONISTA. Esta camada é translúcida; ENQUADRA a arte (fundo
 *     ambiental + moldura viva + partículas nascidas da própria obra) e a valoriza, mas NUNCA a
 *     esconde nem a substitui por ilustração genérica. NÃO há cartão branco central nem cara de modal
 *     administrativo: o Beni entra de CORPO INTEIRO (BeniMascotImage, contain, transparência real) e
 *     fala por um BALÃO ligado a ele.
 *   - NÃO é `Modal` de sistema e NÃO é `Alert`: é uma camada em árvore, dentro da própria tela, para
 *     que o desenho permaneça visível e congelado atrás (a tela chama resetZoom antes de montar).
 *   - NÃO concede progresso global, conquista ou moeda. O único progresso é o das TRÊS atividades do
 *     piloto (Luz · Vida · Cuidado). NÃO menciona plano, pagamento ou assinatura — o Grátis (não
 *     persistido) recebe a MESMA celebração (a honestidade técnica fica no log de dev).
 *   - Sem dependência nova: `Animated`/`Easing` do RN, `expo-linear-gradient`, `@expo/vector-icons`,
 *     `expo-haptics`, o Beni já empacotado. UM pico audiovisual por modo; háptica e som UMA vez.
 *   - Sem loop permanente e sem flashes: um DIRETOR único anima cada ato UMA vez e descansa; re-render
 *     NÃO reinicia. Respeita movimento reduzido (estado final, fades no lugar de entradas laterais,
 *     menos partículas com brilho localizado — sem alterar a lógica de estado).
 *
 * Beni (§Parte 3/5/6/7 — poses do P12, corpo inteiro, 1024×1280 RGBA transparente):
 *   admiraEsquerda / admiraDireita → ATUALIZAÇÃO (o Beni admira a obra ao seu lado).
 *   celebraFrente                  → 1ª conclusão, pico frontal.
 *   olhaAcima                      → 1ª conclusão quando a obra está no alto (o Beni olha para cima).
 *   apresentaGaleria               → grande conclusão (corpo à esquerda apresentando a galeria).
 * As cinco são AQUECIDAS pela tela ANTES do toque em "Pronto!" (ver [C60-P8B-PREWARM] em
 * ColoringScreen), então o Beni entra sem atraso perceptível. NENHUM Beni em círculo/cartão/medalhão.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BeniMascotImage from '../common/BeniMascotImage';
import SoundButton from '../SoundButton';
import { playUiSound } from '../../services/audioManager';
import { colors, radii, spacing, shadows } from '../../theme/productTheme';
import {
  parseDrawingPayload,
  isPositionedPayload,
  toArtVisual,
  computeLineartStyle,
  computePaintStyle,
} from './coloring60ArtComposition';

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
// [C60-P10-GALLERY] Composição da GALERIA da grande conclusão (§Parte 4/7). Compõe COR + CONTORNO
// numa miniatura, portando a MESMA técnica já validada no Livrinho (paint por baixo, lineart por cima
// com `mixBlendMode: 'multiply'`, ambos invisíveis até carregarem JUNTOS). A arte já vem PRONTA por
// PROPS (o ColoringScreen — única tela autorizada — leu o storage do piloto e passou o payload). Este
// overlay NUNCA importa o writer nem lê storage: recebe `paint` (payload salvo ou null) e `lineart`.
// Sem cor (Grátis não persistido / atividade sem arte / falha) → FALLBACK OFICIAL = o próprio
// contorno sozinho (asset que já existe; nunca mancha de cor sem traço).
// ─────────────────────────────────────────────────────────────────────────────
const FINALE_ART_TIMEOUT_MS = 7000;

// A MATEMÁTICA DA COMPOSIÇÃO NÃO MORA MAIS AQUI. Ela vive em `coloring60ArtComposition` e é a
// MESMA usada pela tela de coleção: eram duas cópias idênticas do parser e das três contas, e
// duas cópias divergem — foi por isso que o endurecimento de geometria do portão adversarial
// (medida não-finita nunca vira `left`/`width`) precisava ser escrito duas vezes para valer nas
// duas superfícies. Agora existe um dono só.

// ─────────────────────────────────────────────────────────────────────────────
// Atmosfera FECHADA por atividade (§Parte 6) — textos e paleta são contrato, não sugestão.
// Os títulos/falas da PRIMEIRA conclusão são o contrato EXATO do P12 · Parte 6.
// `marker` é o rótulo curto usado no progresso das três (§Parte 9).
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

// Fecho das três atividades (§Parte 7 · "A Criação Ganha Vida"): título e fala do Beni são o
// CONTRATO EXATO do P12R · ATO 5 (não reformular — textos CURTOS, sem risco de corte). A fala
// conduz a leitura da galeria (luz · vida · cuidado); a mensagem de apoio dá o sentido da coleção.
const ALL_DONE_TITLE = 'Você coloriu toda a Criação!';
const ALL_DONE_BENI_LINE = 'Olha só! Você encheu tudo de luz, vida e cuidado!';
const ALL_DONE_MESSAGE = 'Cada desenho mostrou um jeito especial de ver, cuidar e celebrar o mundo de Deus.';
// Rótulos EXATOS visíveis no fecho (§Parte 7): a contagem final e o nome da criação da criança.
const FINALE_COUNT_LABEL = '3 de 3';
const FINALE_GALLERY_LABEL = 'Minha Criação Cheia de Cor';

// [C60-PARTE-7] O MODO 'collection' FOI REMOVIDO DESTA CAMADA. Ele reaproveitava a composição da
// GRANDE CONCLUSÃO — que nasce sobre a pintura recém-feita, com o véu temático da parte aberta e os
// textos sobre a arte — para uma coisa de natureza diferente: um lugar que a criança VISITA. Daí a
// coleção mudar de fundo e de composição conforme a origem, e os textos caírem sobre as obras.
// A coleção agora é `Coloring60CollectionScreen`: tela própria, fundo neutro, nenhum texto sobre a
// obra, resultado idêntico venha de onde vier. Esta camada voltou a ser SÓ conclusão.

// ATUALIZAÇÃO (§Parte 5): quando a criança conclui DE NOVO uma atividade JÁ concluída, o Beni ADMIRA
// a nova arte e diz a frase EXATA POR ATIVIDADE (contrato P12R — não reformular). Textos CURTOS de
// propósito (§Parte 4): cabem sem corte inclusive em telas pequenas; é o "Beni percebeu minha nova
// escolha", não a grande festa. Nunca um aviso técnico seco: celebração afetiva, pintura protagonista.
const UPDATE_TEXTS = {
  light: {
    title: 'Sua luz brilhou!',
    line: 'Uau! Suas cores fizeram a luz brilhar ainda mais!',
  },
  living_world: {
    title: 'Seu mundo ganhou vida!',
    line: 'Que bonito! Suas cores acordaram a natureza!',
  },
  people_and_care: {
    title: 'Seu cuidado apareceu!',
    line: 'Que carinho! Você cuidou de cada pedacinho!',
  },
};

// Cores dos motivos no FECHO (a criação inteira floresce: luz + vida + cuidado juntos).
const MOTIF_COLOR = { dot: colors.gold, leaf: colors.green, heart: colors.coral, sparkle: colors.gold };

// [C60-P12-PARTICLES] Quantidade de partículas por modo (§Parte 9): update 7–12, primeira 12–18,
// fecho 18–24. Movimento reduzido usa um punhado estático (brilho localizado, sem subida).
const PARTICLE_COUNT = { update: 10, activity: 15, finale: 21 };
const PARTICLE_COUNT_REDUCED = 5;

// [C60-P12R-TIMELINE] O DIRETOR único (§Parte 3). Os TRÊS níveis têm ritmos DELIBERADAMENTE
// distintos, para que a criança sinta a escalada de importância (UPDATE < PRIMEIRA < GRANDE
// CONCLUSÃO) — não mais três celebrações parecidas. O momento em que as AÇÕES ficam tocáveis
// (`actionsDelay`) cai na janela de contrato de cada nível:
//   • update   → ~2,0 s (janela 2–2,5 s): "o Beni percebeu minha nova escolha". Curto e gentil.
//   • activity → ~3,6 s (janela 3,5–4,5 s): "eu consegui terminar uma parte". Beat maior, com progresso.
//   • finale   → ~5,6 s (janela 5,5–7 s): a grande conclusão respira; a galeria surge cedo e a criança
//                a contempla antes de agir (o decorativo segue até ~6,7 s). Só na 1ª transição 2→3.
// As partículas continuam DEPOIS das ações (decorativo) — a criança nunca espera elas descansarem.
const TIMELINE = {
  update: { ambient: 220, beniDelay: 160, balloonDelay: 500, particleDelay: 340, particleDur: 2100, progressDelay: 0, actionsDelay: 2000, galleryStagger: 0 },
  activity: { ambient: 320, beniDelay: 300, balloonDelay: 760, particleDelay: 720, particleDur: 3300, progressDelay: 1500, actionsDelay: 3600, galleryStagger: 0 },
  finale: { ambient: 460, beniDelay: 440, balloonDelay: 1000, particleDelay: 900, particleDur: 5800, progressDelay: 1300, actionsDelay: 5600, galleryStagger: 320 },
};

// [C60-P12-SEED] PRNG determinístico (xfnv1a → mulberry32). Semente por STRING (activityId +
// celebrationId + modo): mesmo mount ⇒ mesma disposição de partículas (nunca "pula" a cada render);
// sem `Math.random`. Só posiciona/dimensiona partículas — jamais decide desfecho.
function makeSeed(str) {
  const s = String(str);
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// [C60-P12-PARTICLES] Descreve as partículas de forma DETERMINÍSTICA (posição relativa 0..1 dentro
// do retângulo REAL da arte, tamanho, fase, motivo). Sem árvore React por partícula: os descritores
// são dados puros; a animação é UMA Animated.Value nativa interpolada por partícula (ver render).
function buildParticles(seedStr, count, allDone, baseMotif) {
  const rnd = makeSeed(seedStr);
  const motifs = allDone ? ['dot', 'leaf', 'heart', 'sparkle'] : [baseMotif, 'dot', 'sparkle'];
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      fx: +(0.08 + rnd() * 0.84).toFixed(4),
      fy: +(0.08 + rnd() * 0.84).toFixed(4),
      size: 9 + Math.round(rnd() * 9),
      phase: +(rnd() * 0.2).toFixed(4),
      peak: +(0.7 + rnd() * 0.25).toFixed(3),
      rise: 42 + Math.round(rnd() * 74),
      drift: Math.round((rnd() - 0.5) * 36),
      motif: motifs[Math.floor(rnd() * motifs.length)],
    });
  }
  return arr;
}

/** Ícone/forma de UMA partícula temática (nunca confete genérico). */
function ParticleGlyph({ motif, size, tint }) {
  if (motif === 'dot') {
    return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint }} />;
  }
  const icon = motif === 'leaf' ? 'leaf' : (motif === 'heart' ? 'heart' : 'star-four-points');
  return <MaterialCommunityIcons name={icon} size={size + 6} color={tint} />;
}

function atmosphereOf(activityId) {
  return ATMOSPHERES[activityId] ?? ATMOSPHERES.light;
}

/** Preferência de movimento reduzido do sistema (mesmo padrão já usado no app). */
// [C60-P12-A11Y] A consulta de acessibilidade é ASSÍNCRONA: `reduceMotion` nasce `false` e só é
// corrigido quando `isReduceMotionEnabled()` resolve. Por isso expomos também `ready`: o diretor e o
// pico (háptica) só AGEM quando a preferência já assentou — assim quem ativou "Reduzir movimento"
// nunca vê o surto de animação nem sente a háptica que deveria ser suprimida. Rede de segurança:
// `ready` também assenta por um timeout curto, para a celebração jamais ficar presa se a consulta
// nativa faltar (método ausente) ou demorar (thread congestionada logo após montar o overlay).
function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => { if (alive) { setReduceMotion(!!v); setReady(true); } })
      .catch(() => { if (alive) setReady(true); });
    const settleGuard = setTimeout(() => { if (alive) setReady(true); }, 150);
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => { if (alive) setReduceMotion(!!v); });
    return () => { alive = false; clearTimeout(settleGuard); sub?.remove?.(); };
  }, []);
  return { reduceMotion, ready };
}

// ─────────────────────────────────────────────────────────────────────────────
// Palco da ARTE (§Parte 3). Vive dentro da área do canvas, por cima da pintura e sem capturar toque.
// Não cobre o desenho: assenta a arte com uma vinheta suave e a emoldura como um "cartão de
// exposição" (moldura externa luminosa + filete interno), revelado com leve aproximação.
// ─────────────────────────────────────────────────────────────────────────────
// [C60-P11-GEOMETRY] Retângulo REAL da arte a partir do instantâneo v2 exportado (§Parte 3). Os
// campos imgX/imgY/imgW/imgH e W/H vêm em px de backing (×DPR); as RAZÕES (imgX/W etc.) são, por
// isso, independentes de DPR e mapeiam direto para a área medida do canvas — a WebView preenche a
// `canvasArea` exatamente, então o espaço de coordenadas da moldura == o do desenho. v1 (data-URL
// puro, sem layout) e payloads inválidos → null: a moldura cai no enquadramento do canvas inteiro
// (a arte continua visível; nunca uma borda deslocada por dado ausente). ESTA é a fonte de geometria
// COMPARTILHADA pela moldura viva E pelas partículas (§Parte 9 · prova "geometria compartilhada").
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

// [C60-P12-GEOMETRY] Retângulo da arte em COORDENADAS DE TELA. Combina a área medida do canvas
// (`canvasFrame`, passada pela ColoringScreen via onLayout) com as RAZÕES de `artRectFromSnapshot`
// (a MESMA fonte da moldura viva) — daí "geometria compartilhada moldura↔partículas". Sem geometria
// (v1 / ausente) → o retângulo do canvas inteiro (a arte segue visível). Sem `canvasFrame` medido
// ainda → null (o chamador cai numa faixa medida da própria tela).
function artScreenRectOf(canvasFrame, snapshot) {
  if (!canvasFrame || !(canvasFrame.width > 0) || !(canvasFrame.height > 0)) return null;
  const rect = artRectFromSnapshot(snapshot);
  if (rect) {
    return {
      x: canvasFrame.x + rect.fx * canvasFrame.width,
      y: canvasFrame.y + rect.fy * canvasFrame.height,
      w: rect.fw * canvasFrame.width,
      h: rect.fh * canvasFrame.height,
    };
  }
  return { x: canvasFrame.x, y: canvasFrame.y, w: canvasFrame.width, h: canvasFrame.height };
}

// Ordem canônica FECHADA das três atividades (espelha o catálogo do piloto). Usada só para dar às
// duas poses laterais e ao "olhar para cima" um caminho DETERMINÍSTICO e ALCANÇÁVEL quando a
// geometria do instantâneo não desempata (caso comum destes linearts, que preenchem toda a largura).
const C60_ACTIVITY_ORDER = ['light', 'living_world', 'people_and_care'];
function activityOrderIndex(activityId) {
  const i = C60_ACTIVITY_ORDER.indexOf(activityId);
  return i < 0 ? 0 : i; // fora do piloto → trata como a primeira (estável, nunca quebra)
}

// [C60-P12R-BENI-POSE] Pose do Beni — DETERMINÍSTICA por estado + composição (§Parte 2). Cada uma
// das CINCO poses tem um caminho REAL e justificável (nunca aleatório; nunca todas na mesma sessão):
//   finale   → apresentaGaleria (fixo): a grande conclusão apresenta as três obras.
//   update   → admira a obra AO LADO. Se a geometria mostra a arte claramente deslocada, o Beni fica
//              no lado OPOSTO para olhá-la; senão (arte centrada), ALTERNA por atividade — assim
//              admiraEsquerda E admiraDireita aparecem ao longo das três (corrige "só vi uma pose").
//   activity → olhaAcima quando a obra está no ALTO do canvas (a obra fica acima do Beni no rodapé);
//              e, como fallback determinístico, na PRIMEIRA atividade ("Haja luz" — a luz nasce no
//              alto, o Beni ergue o olhar). Demais primeiras conclusões → celebraFrente (pico frontal).
function pickBeniPose(mode, canvasFrame, artRect, activityId, nextIsLast = false) {
  // A grande conclusão apresenta as três obras. (A COLEÇÃO usa a mesma pose, mas na tela própria —
  // ver Coloring60CollectionScreen; aqui não existe mais modo de coleção.)
  if (mode === 'finale') return 'apresentaGaleria';
  if (mode === 'update') {
    return pickBeniSide(mode, canvasFrame, artRect, activityId) === 'right'
      ? 'admiraEsquerda'
      : 'admiraDireita';
  }
  // Primeira conclusão (§Partes 3/4/11): a pose é DETERMINADA PELA JORNADA, nunca pela composição
  // nem por sorteio. 0→1 (ainda faltam duas) → comemora de frente; 1→2 (a próxima é a última, a
  // jornada está quase no alto) → ergue o olhar. Assim as cinco poses têm caminho real e fixo.
  if (nextIsLast) return 'olhaAcima';
  return 'celebraFrente';
}

// Lado em que o Beni fica ('left' | 'right'). No update ele fica no lado que o faz OLHAR para a obra:
//   1) se a arte está nitidamente à esquerda/direita do centro (≥6% da largura), fica no lado oposto;
//   2) senão (arte centrada — comum aqui), ALTERNA determinado pela ordem da atividade, garantindo
//      que as duas poses laterais tenham caminho real. Nos demais modos fica à esquerda (leitura estável).
function pickBeniSide(mode, canvasFrame, artRect, activityId) {
  if (mode !== 'update') return 'left';
  if (artRect && canvasFrame && canvasFrame.width > 0) {
    const artCenterX = artRect.x + artRect.w / 2;
    const canvasMidX = canvasFrame.x + canvasFrame.width / 2;
    const dx = (artCenterX - canvasMidX) / canvasFrame.width;
    if (dx < -0.06) return 'right'; // arte à esquerda → Beni à direita (admiraEsquerda)
    if (dx > 0.06) return 'left';   // arte à direita  → Beni à esquerda (admiraDireita)
  }
  // Arte centrada: alterna por atividade (Luz=direita→admiraDireita · Vida=esquerda→admiraEsquerda ·
  // Cuidado=direita→admiraDireita). Determinístico e estável entre re-renders.
  return activityOrderIndex(activityId) % 2 === 1 ? 'right' : 'left';
}

export function Coloring60ArtGlow({ activityId, active, snapshot = null }) {
  const atmo = atmosphereOf(activityId);
  const { reduceMotion, ready } = useReduceMotion();
  const anim = useRef(new Animated.Value(0)).current;
  // Tamanho MEDIDO da área do canvas (a moldura vive no mesmo espaço). Recalcula sozinho em mudança
  // de orientação/tamanho (onLayout redispara) e em troca de atividade (o ramo remonta pela key).
  const [box, setBox] = useState(null);

  useEffect(() => {
    // Espera a preferência de a11y assentar (§Parte 11): sem `ready`, quem ativou "Reduzir movimento"
    // veria o reveal de 640ms antes do snap. Com `ready`, o ramo correto roda de uma vez só.
    if (!active || !ready) return undefined;
    if (reduceMotion) { anim.setValue(1); return undefined; }
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: 640,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [active, ready, reduceMotion]);

  // Mede a área continuamente (mesmo inativa): quando a celebração começa, a moldura já nasce no
  // lugar certo, sem um primeiro quadro deslocado. Só atualiza o estado quando o tamanho muda.
  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  };

  // A moldura entra e "assenta" de 1.02 → 1.0 (leve aproximação, dentro do teto de escala ~1.02 da
  // §Parte 6 — a ARTE em si nunca é escalada nem remontada; só a moldura decorativa respira).
  const frameScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1] });

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
// Marcador de uma das três atividades (§Parte 9). Três estados honestos e distintos, e NENHUM deles
// é representado por estrela. No fecho (`celebratory`), os concluídos ganham um anel mais firme.
// ─────────────────────────────────────────────────────────────────────────────
function StepMarker({ step, state, celebratory }) {
  const atmo = atmosphereOf(step);
  const isCurrent = state === 'current';
  const isDone = state === 'done' || isCurrent;
  // 'next' = a PRÓXIMA RECOMENDADA (§Parte 3/4): ainda não concluída, mas é o caminho principal.
  // Ganha um anel tracejado na cor da atividade — visivelmente diferente de "concluída" e de
  // "disponível", sem prometer que já está pronta.
  const isNext = state === 'next';
  return (
    <View style={markerStyles.item}>
      <View
        style={[
          markerStyles.circle,
          isDone && { backgroundColor: atmo.tintSoft, borderColor: atmo.tint },
          celebratory && isDone && { borderColor: atmo.tint, borderWidth: 3 },
          isCurrent && { backgroundColor: atmo.tint, borderColor: atmo.tintDeep, borderWidth: 3 },
          isNext && markerStyles.circleNext,
          isNext && { borderColor: atmo.tint },
        ]}
      >
        <MaterialCommunityIcons
          name={atmo.icon}
          size={isCurrent ? 22 : 20}
          color={isCurrent ? '#FFFFFF' : (isDone ? atmo.tintDeep : (isNext ? atmo.tintDeep : colors.muted))}
        />
      </View>
      <Text
        style={[markerStyles.label, (isDone || isNext) && { color: colors.text, fontWeight: '700' }]}
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
  // Próxima recomendada: anel TRACEJADO (convite), nunca preenchido como as concluídas.
  circleNext: { borderWidth: 2, borderStyle: 'dashed', backgroundColor: colors.surface },
});

// ─────────────────────────────────────────────────────────────────────────────
// [C60-P10-GALLERY] Miniatura de UMA arte no fecho. Compõe COR + CONTORNO (paint por baixo, lineart
// por cima com multiply) e SÓ revela a composição quando as duas imagens carregam JUNTAS — nunca cor
// sem traço. A arte chega por PROPS; este componente não lê storage.
//
// [C60-PARTE-8] O CONTORNO SOZINHO SAIU DAQUI. Ele fazia dois papéis proibidos: placeholder enquanto
// a cor não chegava (a obra "aparecia sem cor e depois recuperava a pintura" — a evidência física) e
// fallback definitivo quando não havia cor (o que exibe como "obra" justamente o que a criança NÃO
// pintou). Nos dois casos o lugar agora é um espaço NEUTRO: enquanto carrega, papel silencioso; sem
// arte para mostrar, papel com um sinal discreto. O contorno só existe COMPOSTO sobre a tinta.
// ─────────────────────────────────────────────────────────────────────────────
const FINALE_THUMB_W = 92;
const FINALE_THUMB_H = 116; // ~4:5 retrato, a mesma proporção dos linearts do piloto (1122×1402)

function FinaleDrawingThumb({ paint, lineart, marker, tint, tintDeep, tintSoft, revealStyle }) {
  const parsed = paint ? parseDrawingPayload(paint) : null;
  const positioned = isPositionedPayload(parsed);
  const visual = toArtVisual(parsed, lineart);
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

  // [C60-PARTE-8] Enquanto a composição colorida não está pronta, o espaço fica NEUTRO (papel).
  // Quando não há arte a mostrar — ou a leitura falhou/estourou —, ele permanece neutro com um sinal
  // discreto. Em nenhum dos dois casos aparece contorno sem cor.
  const showPlaceholder = !colorReady;
  const showEmptyMark = !hasColor || giveUp;

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

        {showPlaceholder && (
          <View style={[StyleSheet.absoluteFill, galleryStyles.thumbEmpty]}>
            {showEmptyMark ? <MaterialCommunityIcons name="image-outline" size={22} color={tintSoft} /> : null}
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
// [C60-P13-BALLOON] Balão de fala LIGADO ao Beni — RECONSTRUÇÃO DEFINITIVA (§Parte 8).
//
// O que estava REPROVADO: o rabicho era um QUADRADO ROTACIONADO a 45° com duas bordas. As bordas do
// quadrado girado continuam como uma DIAGONAL que sobe pelo canto inferior em direção ao texto — o
// artefato visto no teste físico. Nenhum deslocamento conserta isso: a construção foi SUBSTITUÍDA.
//
// Estrutura obrigatória (§Parte 8, item a item):
//   1. Wrapper externo (`outer`) com `overflow: 'visible'` — o rabicho pode viver fora dele.
//   2. Corpo (`body`) arredondado INDEPENDENTE — só ele tem raio, borda e o texto dentro.
//   3. Rabicho COMPLETAMENTE EXTERNO ao corpo: `tailWrap` começa exatamente na borda inferior do
//      corpo (`bottom: -TAIL_H`, altura TAIL_H) — nenhum pixel do rabicho entra na área de conteúdo.
//   4. Triângulo EXTERNO (`tailOuter`) na COR DA BORDA — é o contorno do rabicho.
//   5. Triângulo INTERNO branco (`tailInner`), MENOR, sobreposto, subido de exatamente a espessura
//      da borda: apaga a linha da borda na "boca" do rabicho e continua o branco do corpo.
//   6. Nada do triângulo invade o conteúdo: o texto vive no `body`, o rabicho vive fora dele.
//   7. Padding do texto INDEPENDENTE do rabicho (não há mais "folga para a seta").
//   8/9/10. `tailSide` aponta para o Beni e vale nos DOIS lados (esquerda e direita) — o único ajuste
//      é a âncora horizontal, mantida além do raio do canto para o rabicho nascer em borda reta.
//
// PROIBIDO aqui (e provado no smoke): quadrado rotacionado, `rotate: '45deg'`, borda diagonal que
// continua no cartão, qualquer linha subindo para o texto, rabicho atrás da tipografia, corte de texto.
// FALLBACK AUTORIZADO (§Parte 8): `tailless` remove o rabicho e mantém o cartão arredondado junto ao
// Beni — a ausência do rabicho é preferível a qualquer artefato.
// ─────────────────────────────────────────────────────────────────────────────
// REVISÃO ADVERSARIAL (Portão 9) — dois defeitos residuais encontrados e corrigidos aqui:
//   (a) o preenchimento era SEMI-TRANSPARENTE (alfa 0.97). O triângulo interno pinta POR CIMA do
//       triângulo de contorno e por cima da borda inferior do corpo: com alfa < 1 sobrava um
//       resíduo da cor da borda atravessando o branco — exatamente o tipo de linha fantasma que
//       o teste físico reprovou. O preenchimento agora é OPACO, então a boca some por completo.
//   (b) o triângulo interno tinha medidas "a olho" (16×10), o que engrossava o contorno lateral
//       (~2,9 px) e deixava a ponta pesada. 18×11 é a solução geométrica para contorno uniforme
//       de 2 px num triângulo 24×14 (arestas deslocadas 2 px pela normal interna).
const BALLOON_BG = '#FFFFFF';
const BALLOON_BORDER_W = 2;
const BALLOON_TAIL_W = 24;   // base do triângulo externo (contorno)
const BALLOON_TAIL_H = 14;   // altura do rabicho, INTEIRA fora do corpo
const BALLOON_TAIL_INNER_W = 18; // base do triângulo interno (menor, contorno de 2 px uniforme)
const BALLOON_TAIL_INNER_H = 11;
const BALLOON_TAIL_ANCHOR = 26;  // > raio do canto (18): o rabicho nasce em borda reta

function SpeechBalloon({ title, line, tailSide, accent, accentDeep, maxWidth, tailless = false }) {
  return (
    <View style={[balloonStyles.outer, maxWidth ? { maxWidth } : null]}>
      <View style={[balloonStyles.body, { borderColor: accent }]}>
        {/* §Parte 9 · SEM `numberOfLines` e SEM `adjustsFontSizeToFit`: o balão CRESCE com o conteúdo
            e o texto aparece INTEIRO, em fonte legível para criança. Sem teto de linhas não há
            reticências possíveis — o corte deixou de ser uma opção do componente. */}
        {title ? <Text style={[balloonStyles.title, { color: accentDeep }]}>{title}</Text> : null}
        <Text style={balloonStyles.line}>{line}</Text>
      </View>
      {!tailless && (
        <View
          pointerEvents="none"
          style={[
            balloonStyles.tailWrap,
            tailSide === 'right' ? balloonStyles.tailWrapRight : balloonStyles.tailWrapLeft,
          ]}
        >
          <View style={[balloonStyles.tailOuter, { borderTopColor: accent }]} />
          <View style={balloonStyles.tailInner} />
        </View>
      )}
    </View>
  );
}

const balloonStyles = StyleSheet.create({
  // 1. Wrapper externo: overflow VISÍVEL (o rabicho é desenhado fora dele, por baixo do corpo).
  outer: { alignSelf: 'stretch', overflow: 'visible' },
  // 2. Corpo independente. Sem sombra: a sombra do cartão desenhava uma linha própria junto ao
  //    rabicho no Android (elevation) e ainda o empurrava para trás do corpo. A borda de 2px na cor
  //    da atividade já dá a separação — e o balão fica limpo, que é o critério do §Parte 8.
  body: {
    backgroundColor: BALLOON_BG,
    borderRadius: 18,
    borderWidth: BALLOON_BORDER_W,
    // 7. Padding do texto INDEPENDENTE do rabicho (simétrico; nada de folga extra embaixo).
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '800', lineHeight: 23 },
  line: { fontSize: 15, color: colors.text, lineHeight: 21, marginTop: 3 },
  // 3. Faixa do rabicho: começa EXATAMENTE na borda inferior do corpo e desce TAIL_H para fora.
  tailWrap: {
    position: 'absolute',
    bottom: -BALLOON_TAIL_H,
    width: BALLOON_TAIL_W,
    height: BALLOON_TAIL_H,
    zIndex: 2,
  },
  tailWrapLeft: { left: BALLOON_TAIL_ANCHOR },
  tailWrapRight: { right: BALLOON_TAIL_ANCHOR },
  // 4. Triângulo EXTERNO (contorno): técnica de borda do RN — largura/altura zero, laterais
  //    transparentes e a borda SUPERIOR colorida formando um triângulo que aponta para BAIXO.
  tailOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: BALLOON_TAIL_W / 2,
    borderRightWidth: BALLOON_TAIL_W / 2,
    borderTopWidth: BALLOON_TAIL_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // 5. Triângulo INTERNO branco, menor e subido pela espessura da borda: cobre a linha da borda na
  //    boca do rabicho (o branco do corpo continua no rabicho, sem emenda visível).
  tailInner: {
    position: 'absolute',
    top: -BALLOON_BORDER_W,
    left: (BALLOON_TAIL_W - BALLOON_TAIL_INNER_W) / 2,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: BALLOON_TAIL_INNER_W / 2,
    borderRightWidth: BALLOON_TAIL_INNER_W / 2,
    borderTopWidth: BALLOON_TAIL_INNER_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: BALLOON_BG,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// [C60-P13-ACTIONS] Botões da experiência — os RÓTULOS vêm da DERIVAÇÃO CANÔNICA (§Parte 1). Este
// componente não escolhe texto nem destino: recebe as três ações já decididas e as apresenta na
// hierarquia certa (principal cheia · secundária discreta · terciária em estilo de link).
//
// §Parte 10 · enquanto o preload da próxima parte não termina, a AÇÃO PRINCIPAL mostra um estado
// curto ("Preparando…") em vez de abrir uma tela vazia com rodinha. Isso NUNCA trava: a tela libera
// o botão quando o preload conclui, quando ele falha (segue pelo fluxo normal) ou pelo teto de tempo.
// ─────────────────────────────────────────────────────────────────────────────
const PRIMARY_PENDING_LABEL = 'Preparando…';

function C60ActionButtons({
  primaryAction,
  secondaryAction,
  tertiaryAction,
  primaryPending,
  onPrimary,
  onSecondary,
  onTertiary,
}) {
  const pending = primaryPending === true;
  const primaryLabel = pending ? PRIMARY_PENDING_LABEL : (primaryAction?.label ?? '');
  return (
    <>
      <SoundButton
        style={[styles.primaryBtn, { backgroundColor: colors.beni }, pending && styles.primaryBtnPending]}
        accessibilityLabel={pending ? 'Preparando a próxima parte' : primaryLabel}
        accessibilityState={{ disabled: pending }}
        silent={pending}
        onPress={pending ? () => {} : onPrimary}
      >
        <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
      </SoundButton>
      {secondaryAction && typeof onSecondary === 'function' && (
        <SoundButton style={styles.secondaryBtn} accessibilityLabel={secondaryAction.label} onPress={onSecondary}>
          <Text style={styles.secondaryBtnText}>{secondaryAction.label}</Text>
        </SoundButton>
      )}
      {tertiaryAction && typeof onTertiary === 'function' && (
        <SoundButton style={styles.tertiaryBtn} accessibilityLabel={tertiaryAction.label} onPress={onTertiary}>
          <Text style={styles.tertiaryBtnText}>{tertiaryAction.label}</Text>
        </SoundButton>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// A experiência em si — um DIRETOR único (§Parte 4). O MODO é decidido pela MÁQUINA DE CONCLUSÃO
// (ColoringScreen), a única autoridade sobre o desfecho. O overlay NÃO reinfere o desfecho: apenas
// APRESENTA o modo recebido, com sua linha do tempo, sua pose de Beni e seus textos de contrato.
// ─────────────────────────────────────────────────────────────────────────────
export default function Coloring60CompletionOverlay({
  mode = 'activity',
  activityId,
  steps = [],
  finaleItems = null,
  snapshot = null,
  canvasFrame = null,
  celebrationId = null,
  bottomInset = 0,
  // [C60-P13-JOURNEY] §Parte 1 · a DERIVAÇÃO CANÔNICA da jornada (coloring60Journey) chega pronta.
  // O overlay não reinfere desfecho nem inventa rótulo: ele APRESENTA o que a derivação decidiu
  // (contagem, trilha, convite da próxima parte e os rótulos das ações primária/secundária/terciária).
  journey = null,
  // §Parte 10 · o preload da próxima parte ainda não terminou: a ação principal mostra um estado
  // curto em vez de abrir uma tela vazia. Nunca trava — a tela libera por conclusão OU por teto.
  primaryPending = false,
  onPrimary,
  onSecondary,
  onTertiary,
}) {
  const { reduceMotion, ready } = useReduceMotion();
  const atmo = atmosphereOf(activityId);
  const isUpdate = mode === 'update';
  const isFinale = mode === 'finale';
  // [C60-PARTE-7] `allDone` significa "a GRANDE CONCLUSÃO está acontecendo agora" — e só isso. Antes
  // ele também valia para a visita à coleção, e era esse empate que fazia um LUGAR ser desenhado com
  // a gramática de um EVENTO (véu, pico, galeria sobre a pintura aberta).
  const allDone = isFinale;

  // §Parte 1 · a contagem vem da derivação (concordância correta, sem improviso na interface); os
  // `steps` continuam sendo a fonte do desenho da trilha.
  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length || 3;
  const countLabel = journey?.countLabel ?? `${doneCount} de ${total}`;
  const nextPart = isUpdate || allDone ? null : (journey?.nextPart ?? null);

  // Acento por modo (grande conclusão = dourado, mais nobre; senão a cor da atividade).
  const accent = allDone ? colors.gold : atmo.tint;
  const accentDeep = allDone ? colors.goldDeep : atmo.tintDeep;
  const accentSoft = allDone ? colors.goldSoft : atmo.tintSoft;
  const veilColors = allDone
    ? ['rgba(249,199,79,0)', 'rgba(249,199,79,0.13)', 'rgba(224,162,26,0.32)']
    : atmo.veil;

  // Textos por modo (contrato EXATO do P12 · Partes 5/6/7). Três modos, três textos — sem coleção.
  const updateText = UPDATE_TEXTS[activityId] ?? UPDATE_TEXTS.light;
  const title = isFinale ? ALL_DONE_TITLE : (isUpdate ? updateText.title : atmo.title);
  const beniLine = isFinale ? ALL_DONE_BENI_LINE : (isUpdate ? updateText.line : atmo.beniLine);

  // [C60-P13-ACTIONS] §Parte 3–7 · TODOS os rótulos vêm da derivação canônica. Se (e só se) a
  // jornada não chegar, resta uma saída honesta e nunca um beco sem saída.
  const primaryAction = journey?.primaryAction ?? { label: 'Voltar à aventura' };
  const secondaryAction = journey?.secondaryAction ?? null;
  const tertiaryAction = journey?.tertiaryAction ?? null;
  const helperText = journey?.nextPart?.helperText ?? null;

  // Tamanho da tela (fallback de posicionamento quando ainda não há `canvasFrame` medido).
  const [screen, setScreen] = useState(null);
  const onRootLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setScreen((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  };

  // [C60-P12-GEOMETRY] Retângulo REAL da arte na tela (mesma base do quadro de brilho:
  // artRectFromSnapshot + a área do canvas). Origem COMPARTILHADA das partículas e da pose do Beni.
  const artRect = useMemo(() => artScreenRectOf(canvasFrame, snapshot), [canvasFrame, snapshot]);

  // Pose e lado do Beni por composição real + estado (determinístico, §Parte 2).
  const beniPose = pickBeniPose(mode, canvasFrame, artRect, activityId, nextPart?.isLast === true);
  const beniSide = pickBeniSide(mode, canvasFrame, artRect, activityId); // 'left' | 'right'

  // [C60-P12-SEED] Semente determinística (§Parte 9): capturada UMA vez no mount → mesma disposição
  // de partículas em todo re-render (nunca "pula"); varia por atividade + celebração + modo.
  const seedRef = useRef(null);
  if (seedRef.current === null) {
    seedRef.current = `${activityId ?? 'light'}|${celebrationId ?? mode}|${mode}`;
  }
  const particleCount = reduceMotion
    ? Math.min(PARTICLE_COUNT_REDUCED, PARTICLE_COUNT[mode] ?? 12)
    : (PARTICLE_COUNT[mode] ?? 12);
  const particles = useMemo(
    () => buildParticles(seedRef.current, particleCount, allDone, atmo.motif),
    [particleCount, allDone, atmo.motif],
  );

  // Animated values — UM diretor único (nenhum useEffect espalhado por prop).
  const ambientAnim = useRef(new Animated.Value(0)).current;
  const beniAnim = useRef(new Animated.Value(0)).current;
  const balloonAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  // Revelação em sequência das TRÊS artes do fecho (§Parte 7). Uma por atividade (Luz · Vida · Cuidado).
  const galleryAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  // [C60-P12-PEAK] UM pico audiovisual por modo (§Parte 10): UMA háptica + UM som curto, à prova de
  // falha (não bloqueia a linha do tempo, §Parte 4/13). O botão "Pronto!" é `silent` na tela — o som
  // de sucesso NÃO se soma ao 'tap'. Intensidade acompanha o modo. Só dispara quando a preferência de
  // a11y já assentou (`ready`) e uma ÚNICA vez (`peakFiredRef`): assim a háptica é de fato suprimida
  // sob "Reduzir movimento" e nunca dobra por re-render/troca de valor. O som é acessível a todos.
  const peakFiredRef = useRef(false);
  useEffect(() => {
    if (!ready || peakFiredRef.current) return undefined;
    peakFiredRef.current = true;
    // §Parte 6 · háptica de RECONHECIMENTO no início, por nível (nunca vibração repetitiva):
    //   UPDATE   → leve (selection): "o Beni percebeu".
    //   FIRST    → médio (impact Medium): "eu consegui terminar uma parte".
    //   FINALE   → leve no início (impact Light) — o PICO médio vem depois (efeito separado abaixo).
    if (!reduceMotion) {
      try {
        if (isUpdate) Haptics.selectionAsync?.().catch(() => {});
        else if (allDone) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch { /* segue sem háptica */ }
    }
    try { playUiSound('success'); } catch { /* som é best-effort: nunca bloqueia */ }
    return undefined;
  }, [ready]);

  // [C60-P12R-FINALE-PEAK] §Parte 6 · a GRANDE conclusão tem "leve no início + ÚNICO pico médio":
  // depois do toque leve de reconhecimento, um único impacto médio marca o clímax (a galeria já
  // revelada). Timer ÚNICO, limpo no unmount (sair durante a timeline cancela), e SUPRIMIDO sob
  // "Reduzir movimento" (§Parte 7). Não é vibração repetitiva — é o pico afetivo da coleção completa.
  const finalePeakRef = useRef(false);
  useEffect(() => {
    if (!ready || !isFinale || reduceMotion || finalePeakRef.current) return undefined;
    finalePeakRef.current = true;
    const t = setTimeout(() => {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); } catch { /* sem háptica */ }
    }, 900);
    return () => clearTimeout(t);
  }, [ready, isFinale, reduceMotion]);

  // [C60-P12-DIRECTOR] Linha do tempo dirigida (§Parte 4): 5 atos, UM só efeito, deps estáveis
  // ([ready, reduceMotion]) → re-render NÃO reinicia. Sair da tela cancela (anim.stop no cleanup,
  // §Parte 4). Só arranca quando a preferência de a11y assentou (`ready`, §Parte 11): antes disso a
  // obra da criança fica visível e a celebração ainda não desabrochou — nada de surto de movimento
  // para quem pediu "Reduzir movimento". Movimento reduzido: tudo no estado final, sem transições
  // laterais e sem subida de partículas.
  useEffect(() => {
    if (!ready) return undefined;
    const values = [ambientAnim, beniAnim, balloonAnim, progressAnim, actionsAnim];
    if (reduceMotion) {
      values.forEach((v) => v.setValue(1));
      particleAnim.setValue(1);
      galleryAnims.forEach((v) => v.setValue(1));
      return undefined;
    }
    const T = TIMELINE[mode] ?? TIMELINE.activity;
    const step = (value, duration, delay) => Animated.timing(value, {
      toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    });
    const anim = Animated.parallel([
      step(ambientAnim, T.ambient, 0),                    // Ato 1 — o ambiente acende
      Animated.spring(beniAnim, {                          // Ato 3 — o Beni entra (fade + leve subida)
        toValue: 1, delay: T.beniDelay, tension: 55, friction: 8, useNativeDriver: true,
      }),
      step(balloonAnim, 240, T.balloonDelay),              // Ato 4 — o Beni fala
      Animated.timing(particleAnim, {                      // Ato 2/4 — a obra ganha vida (partículas)
        toValue: 1, duration: T.particleDur, delay: T.particleDelay, easing: Easing.linear, useNativeDriver: true,
      }),
      step(progressAnim, 260, T.progressDelay),            // Ato 5 — progresso/galeria
      step(actionsAnim, 220, T.actionsDelay),              // Ato 5 — ações (bem antes do fim decorativo)
      // Galeria do fecho: cada arte entra em sequência (Luz → Vida → Cuidado). As ações já estão
      // tocáveis antes de a última assentar — a criança nunca espera a revelação terminar.
      Animated.stagger(T.galleryStagger, galleryAnims.map((v) => step(v, 300, T.progressDelay))),
    ]);
    anim.start();
    return () => anim.stop();
  }, [ready, reduceMotion]);

  const rise = (value, distance) => ({
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

  // Entradas por FADE (+ leve subida vertical) — nunca lateral (respeita movimento reduzido, §Parte 11).
  const beniEnter = reduceMotion ? { opacity: 1 } : {
    opacity: beniAnim,
    transform: [
      { scale: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
      { translateY: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
    ],
  };
  const balloonEnter = reduceMotion ? { opacity: 1 } : rise(balloonAnim, 10);
  const progressEnter = reduceMotion ? { opacity: 1 } : rise(progressAnim, 10);
  const actionsEnter = reduceMotion ? { opacity: 1 } : rise(actionsAnim, 10);

  // Tamanho do Beni de corpo inteiro, responsivo à altura da tela (presença sem esmagar a arte).
  // §Parte 9 · quando a cena ganha a área "Próxima parte", o Beni cede altura ANTES de qualquer
  // texto pensar em encolher: adaptar a composição vem sempre antes de cortar palavra.
  const screenH = screen?.h ?? 760;
  const beniH = nextPart
    ? Math.round(Math.min(172, Math.max(126, screenH * 0.22)))
    : Math.round(Math.min(206, Math.max(150, screenH * 0.27)));
  const beniW = Math.round(beniH * 0.8); // PNGs 1024×1280 (4:5) — contain
  const finaleBeniH = Math.round(Math.min(168, Math.max(128, screenH * 0.21)));
  const finaleBeniW = Math.round(finaleBeniH * 0.8);

  // §Parte 9 · largura do balão ADAPTATIVA: em telas estreitas o balão estreita (e cresce em altura)
  // em vez de encolher a fonte ou cortar a fala. O piso garante que a fala nunca vire uma coluna.
  const screenW = screen?.w ?? 390;
  const balloonMaxWidth = Math.max(168, Math.min(320, screenW - beniW - spacing.md * 2 - spacing.xs * 2));

  // [C60-P12-PARTICLES] Origem das partículas = retângulo REAL da arte; sem ele, a área do canvas;
  // sem canvas medido ainda, uma faixa medida da própria tela (nunca confete solto no vazio).
  const partOrigin = artRect
    || (canvasFrame && canvasFrame.width > 0
      ? { x: canvasFrame.x, y: canvasFrame.y, w: canvasFrame.width, h: canvasFrame.height }
      : (screen ? { x: screen.w * 0.1, y: screen.h * 0.12, w: screen.w * 0.8, h: screen.h * 0.42 } : null));

  const particleNodes = !partOrigin ? null : particles.map((p, i) => {
    const left = partOrigin.x + p.fx * partOrigin.w;
    const top = partOrigin.y + p.fy * partOrigin.h;
    const tint = allDone ? (MOTIF_COLOR[p.motif] ?? atmo.tint) : atmo.tint;
    if (reduceMotion) {
      // Brilho LOCALIZADO estático (§Parte 11): sem subida, opacidade suave.
      return (
        <View key={`p-${i}`} style={{ position: 'absolute', left, top, opacity: p.peak * 0.5 }} pointerEvents="none">
          <ParticleGlyph motif={p.motif} size={p.size} tint={tint} />
        </View>
      );
    }
    const end = Math.min(1, p.phase + 0.8);
    const opacity = particleAnim.interpolate({
      inputRange: [p.phase, p.phase + 0.08, p.phase + 0.55, end],
      outputRange: [0, p.peak, p.peak * 0.6, 0],
      extrapolate: 'clamp',
    });
    const translateY = particleAnim.interpolate({ inputRange: [p.phase, end], outputRange: [0, -p.rise], extrapolate: 'clamp' });
    const translateX = particleAnim.interpolate({ inputRange: [p.phase, end], outputRange: [0, p.drift], extrapolate: 'clamp' });
    const scale = particleAnim.interpolate({ inputRange: [p.phase, end], outputRange: [0.6, 1.05], extrapolate: 'clamp' });
    return (
      <Animated.View
        key={`p-${i}`}
        pointerEvents="none"
        style={{ position: 'absolute', left, top, opacity, transform: [{ translateY }, { translateX }, { scale }] }}
      >
        <ParticleGlyph motif={p.motif} size={p.size} tint={tint} />
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
    // [C60-P12R-BOXNONE] §Parte 5 · a raiz da camada NÃO captura toque por si (box-none): só os
    // controles reais (os botões de ação, quando surgem) recebem o toque. Durante os atos ativos não
    // há botão nem controle clicável exposto — a criança apenas assiste, sem nada morto sob o dedo.
    // O canvas atrás já está inerte (pointerEvents 'none' na tela) e a moldura/partículas são 'none'.
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill} onLayout={onRootLayout} accessibilityViewIsModal>
      {/* Ato 1 — FUNDO AMBIENTAL temático (translúcido; realça sem esconder a pintura). */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: ambientAnim }]}>
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
      </Animated.View>

      {/* Ato 2/4 — PARTÍCULAS nascidas da obra (mesma geometria da moldura viva). */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>{particleNodes}</View>

      {allDone ? (
        // ─── FECHO (§Parte 7 · "A Criação Ganha Vida") ────────────────────────────────────────────
        <View style={[styles.sceneBottom, { paddingBottom: bottomInset + 14 }]} pointerEvents="box-none">
          <Animated.Text style={[styles.finaleKicker, { color: accentDeep }, progressEnter]} pointerEvents="none">
            {FINALE_GALLERY_LABEL}
          </Animated.Text>
          <Animated.View style={[styles.gallery, progressEnter]} pointerEvents="none">
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

          <View style={styles.finaleHeadRow} pointerEvents="box-none">
            {/* Beni de CORPO INTEIRO apresentando a galeria (apresentaGaleria) — corpo à esquerda. */}
            <Animated.View style={[styles.finaleBeni, beniEnter]} pointerEvents="none">
              <View style={[styles.beniGlow, { width: finaleBeniW, backgroundColor: rgba(accent, 0.20) }]} />
              <BeniMascotImage
                variant="apresentaGaleria"
                style={{ width: finaleBeniW, height: finaleBeniH }}
                accessibilityLabel="Beni apresentando a sua criação"
              />
            </Animated.View>
            <Animated.View style={[styles.finaleTextCol, balloonEnter]} pointerEvents="none">
              {/* §Parte 9 · título e fala aparecem COMPLETOS: sem teto de linhas e sem ajuste de
                  fonte — nada aqui pode virar reticência. Os textos de contrato são curtos e o
                  bloco cresce em altura se precisar. */}
              <Text style={[styles.titleBig, { color: accentDeep }]}>{title}</Text>
              <Text style={styles.beniLine}>{beniLine}</Text>
              <View style={[styles.countPill, styles.countPillStart, { backgroundColor: accentSoft, borderColor: accent }]}>
                <Text style={[styles.countPillText, { color: accentDeep }]}>{FINALE_COUNT_LABEL}</Text>
              </View>
            </Animated.View>
          </View>

          <Animated.Text style={[styles.message, styles.messageFinale, progressEnter]} pointerEvents="none">
            {ALL_DONE_MESSAGE}
          </Animated.Text>

          <Animated.View style={[styles.actions, actionsEnter]}>
            <C60ActionButtons
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              tertiaryAction={tertiaryAction}
              primaryPending={primaryPending}
              onPrimary={onPrimary}
              onSecondary={onSecondary}
              onTertiary={onTertiary}
            />
          </Animated.View>
        </View>
      ) : (
        // ─── ATUALIZAÇÃO (§Parte 5) e PRIMEIRA CONCLUSÃO (§Parte 6) ────────────────────────────────
        <View style={[styles.sceneBottom, { paddingBottom: bottomInset + 14 }]} pointerEvents="box-none">
          {/* Beni de CORPO INTEIRO + BALÃO de fala (nunca em círculo/cartão/medalhão). O lado do Beni
              e a seta do balão acompanham a composição real (o Beni "olha" para a obra no update). */}
          <View style={[styles.beniRow, beniSide === 'right' && styles.beniRowReverse]} pointerEvents="box-none">
            <Animated.View style={[styles.beniFigure, beniEnter]} pointerEvents="none">
              <View style={[styles.beniGlow, { width: beniW, backgroundColor: rgba(accent, 0.18) }]} />
              <BeniMascotImage
                variant={beniPose}
                style={{ width: beniW, height: beniH }}
                accessibilityLabel={isUpdate ? 'Beni admirando as suas novas cores' : 'Beni celebrando o seu desenho'}
              />
            </Animated.View>
            <Animated.View style={[styles.balloonWrap, balloonEnter]} pointerEvents="none">
              <SpeechBalloon
                title={title}
                line={beniLine}
                tailSide={beniSide === 'right' ? 'right' : 'left'}
                accent={accent}
                accentDeep={accentDeep}
                maxWidth={balloonMaxWidth}
              />
            </Animated.View>
          </View>

          {/* [C60-P13-TRAIL] §Parte 1/3/4/6 · a TRILHA das três partes aparece em TODOS os momentos
              (inclusive na atualização): a criança sempre vê quanto já completou e o que vem depois.
              O passo recém-preenchido é o `current`; o próximo recomendado ganha o anel pontilhado.
              A contagem usa a concordância da derivação ("1 de 3 concluída" · "2 de 3 concluídas"). */}
          <Animated.View style={[styles.progressTrail, progressEnter]} pointerEvents="none">
            <View style={styles.markersRow}>
              {steps.map((s, i) => {
                const lit = s.done || s.id === activityId;
                const isNext = !!nextPart && s.id === nextPart.activityId;
                return (
                  <React.Fragment key={s.id}>
                    <StepMarker
                      step={s.id}
                      state={s.id === activityId ? 'current' : (s.done ? 'done' : (isNext ? 'next' : 'todo'))}
                      celebratory={false}
                    />
                    {i < steps.length - 1 && (
                      <View style={[markerStyles.connector, lit && { backgroundColor: accent }]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
            <View style={[styles.countPill, { backgroundColor: accentSoft, borderColor: accent }]}>
              <Text style={[styles.countPillText, { color: accentDeep }]}>{countLabel}</Text>
            </View>
          </Animated.View>

          {/* [C60-P13-NEXTPART] §Parte 3/4 · a ÁREA DA PRÓXIMA PARTE. É o que transforma três desenhos
              soltos numa jornada: a criança lê o que vem depois ANTES de decidir. Só na PRIMEIRA
              conclusão e só quando existe uma próxima parte real (nunca sugerir o que não há). */}
          {nextPart && (
            <Animated.View
              style={[styles.nextPart, { borderColor: accent, backgroundColor: rgba(accent, 0.10) }, progressEnter]}
              pointerEvents="none"
            >
              <Text style={[styles.nextPartKicker, { color: accentDeep }]}>{nextPart.sectionTitle}</Text>
              <View style={styles.nextPartRow}>
                <MaterialCommunityIcons
                  name={atmosphereOf(nextPart.activityId).icon}
                  size={20}
                  color={atmosphereOf(nextPart.activityId).tintDeep}
                />
                <Text style={styles.nextPartTitle}>{nextPart.activityTitle}</Text>
              </View>
              <Text style={styles.nextPartMessage}>{nextPart.message}</Text>
            </Animated.View>
          )}

          <Animated.View style={[styles.actions, actionsEnter]}>
            <C60ActionButtons
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              tertiaryAction={tertiaryAction}
              primaryPending={primaryPending}
              onPrimary={onPrimary}
              onSecondary={onSecondary}
              onTertiary={onTertiary}
            />
            {/* §Parte 3/4 · "Seu progresso fica guardado." — a criança pode parar sem perder nada.
                Nenhuma urgência, nenhuma punição: é só a garantia de que dá para voltar depois. */}
            {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
          </Animated.View>
        </View>
      )}
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

  // Cena no rodapé: cresce de baixo para cima; a arte respira acima (nunca coberta no centro).
  sceneBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-end',
  },

  // Beni de corpo inteiro + balão lado a lado (row-reverse quando o Beni fica à direita).
  beniRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.sm },
  beniRowReverse: { flexDirection: 'row-reverse' },
  beniFigure: { alignItems: 'center', justifyContent: 'flex-end' },
  // "Luz do chão" difusa sob o Beni — NÃO é um medalhão/círculo de moldura; é ambiente.
  beniGlow: { position: 'absolute', bottom: 6, height: 44, borderRadius: 60, opacity: 0.55 },
  balloonWrap: { flex: 1, justifyContent: 'flex-end', paddingBottom: 26, paddingHorizontal: spacing.xs },

  titleBig: { fontSize: 23, fontWeight: '800' },
  beniLine: { fontSize: 14, color: colors.text, marginTop: 3, lineHeight: 19 },
  message: { fontSize: 14, color: colors.textSoft, marginTop: spacing.sm, textAlign: 'center' },
  messageFinale: { fontSize: 14, color: colors.text, lineHeight: 20, marginTop: spacing.sm, textAlign: 'center' },

  // Fecho: rótulo da criação + galeria + linha do Beni.
  finaleKicker: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xs, letterSpacing: 0.3 },
  gallery: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  finaleHeadRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.md },
  finaleBeni: { alignItems: 'center', justifyContent: 'flex-end' },
  finaleTextCol: { flex: 1, marginLeft: spacing.sm, justifyContent: 'flex-end', paddingBottom: 6 },

  progressTrail: { alignItems: 'center', marginBottom: spacing.sm },
  markersRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  countPill: {
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'center',
  },
  countPillStart: { alignSelf: 'flex-start', marginTop: spacing.xs },
  countPillText: { fontSize: 13, fontWeight: '800' },

  // [C60-P13-NEXTPART] Área da PRÓXIMA PARTE (§Parte 3/4): um convite curto e legível, com a cor da
  // atividade de DESTINO no ícone. Sem teto de linhas em nenhum texto — cresce se precisar.
  nextPart: {
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderRadius: radii.lg ?? 18,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  nextPartKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  nextPartRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  nextPartTitle: { flex: 1, marginLeft: 6, fontSize: 17, fontWeight: '800', color: colors.text },
  nextPartMessage: { marginTop: 2, fontSize: 14, color: colors.text, lineHeight: 19 },

  actions: { marginTop: spacing.sm, alignSelf: 'stretch', maxWidth: 440, width: '100%' },
  primaryBtn: {
    minHeight: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.card,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  // §Parte 10 · estado curto de preparo: o botão continua no lugar (nada "pula"), só mais discreto.
  primaryBtnPending: { opacity: 0.72 },
  // §Parte 3/4 · "Seu progresso fica guardado." — discreto, logo abaixo das ações.
  helperText: { marginTop: spacing.xs, fontSize: 13, color: colors.textSoft, textAlign: 'center' },
  secondaryBtn: {
    minHeight: 46,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  tertiaryBtn: { minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  tertiaryBtnText: { color: colors.textSoft, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
});
