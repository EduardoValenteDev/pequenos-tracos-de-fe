/**
 * beniAssetWarmup.js — Aquecimento CANÔNICO das imagens do Beni (PERF1).
 *
 * Cache em NÍVEL DE MÓDULO (singleton): estados por pose e a promessa de download persistem entre
 * telas e remontagens.
 *
 * PERF1 — CAMINHO ÚNICO de decodificação por pose:
 *   • Antes (P4R9) havia DOIS caminhos por tamanho (portrait 128 / event 220). O cache nativo do RN
 *     é keyed por (source + dimensões + resizeMode); como o warmer decodificava em 128/220 e a UI
 *     exibia em 72/120/128/140/158/202, `ready` não correspondia à instância visível → moldura vazia.
 *   • Agora existe UMA dimensão canônica (`BENI_CANON`) usada pelo warmer E por todas as instâncias
 *     visíveis (BeniStageCharacter). Uma única decodificação por pose, reusada por retrato e overlays.
 *   • `readyCanon` é a ÚNICA fonte de verdade; `readyPortrait`/`readyEvent` viram wrappers de compat
 *     que consultam a MESMA verdade canônica (não dependem de um tamanho que a UI não usa).
 *
 * Só `readyCanon` prova que a textura canônica está decodificada. O warmer (`PalavrinhasBeniWarmer`)
 * mantém UMA Image canônica por pose (11 no total) e chama `marcarProntaCanon` no `onLoadEnd`.
 */
import { Asset } from 'expo-asset';
// P4.3: overlays do Palavrinhas usam o mapa OTIMIZADO (não os originais full-res).
import { BENI_PALAVRINHAS_IMAGES as BENI_IMAGES, BENI_PALAVRINHAS_POSE_KEYS as BENI_POSE_KEYS } from '../assets/mascot/beniPalavrinhasImages';
import { POSES_MINIMAS } from './palavrinhasVisualDirector';

/**
 * Dimensão CANÔNICA única de decodificação. A maior apresentação atual do Beni é ≈ 202 px (overlay
 * Super); 256 é a menor potência de 2 acima disso, uniforme para TODAS as poses e TODOS os tamanhos
 * visuais (72–202). Decodifica UMA vez por pose (~256²×4 ≈ 262 KB) e é reusada por retrato e overlays.
 */
export const BENI_CANON = 256;
/** Concorrência MÁXIMA declarada do aquecimento (avança por onLoadEnd; sem timeout). */
export const CONCORRENCIA_WARMUP = 3;

const estados = {};   // pose -> { download, canon }
BENI_POSE_KEYS.forEach((p) => { estados[p] = { download: 'idle', canon: 'idle' }; });
let promessa = null;
const ouvintes = new Set();

/** Pose exibida na tela de ENTRADA — prioridade máxima no aquecimento. */
export const POSE_INICIAL_CANON = 'celebrando';
/** Ordem de PRIORIDADE do aquecimento: inicial → mínimas → restantes. */
export const ORDEM_CANON = Object.freeze([
  POSE_INICIAL_CANON,
  ...POSES_MINIMAS.filter((p) => p !== POSE_INICIAL_CANON),
  ...BENI_POSE_KEYS.filter((p) => !POSES_MINIMAS.includes(p) && p !== POSE_INICIAL_CANON),
]);
/** Compat: nome antigo (mesma ordem canônica). */
export const ORDEM_WARMUP = ORDEM_CANON;

export function statusPose(p) { return estados[p] || { download: 'idle', canon: 'idle' }; }
export function downloadStatus(p) { return (estados[p] || {}).download || 'idle'; }

/** FONTE DE VERDADE ÚNICA: bitmap canônico decodificado (mesma chave de cache do warmer e do visível). */
export function readyCanon(p) { return !!estados[p] && estados[p].canon === 'ready'; }
/** Wrappers de compat — ambos consultam a MESMA verdade canônica (não dependem do tamanho da UI). */
export function readyPortrait(p) { return readyCanon(p); }
export function readyEvent(p) { return readyCanon(p); }
export function poseReady(p) { return readyCanon(p); }

export function minimasProntas() { return POSES_MINIMAS.every(readyCanon); }
export function minimasPortraitProntas() { return minimasProntas(); }
export function minimasEventProntas() { return minimasProntas(); }
export function todasProntas() { return BENI_POSE_KEYS.every(readyCanon); }
export function posesProntas() { return BENI_POSE_KEYS.filter(readyCanon); }

export function assinar(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); }
function notificar() { ouvintes.forEach((fn) => { try { fn(); } catch (_) { /* noop */ } }); }

/** Marca o bitmap CANÔNICO como pronto (chamado pelo warmer e pela instância visível). */
export function marcarProntaCanon(pose) { if (estados[pose] && estados[pose].canon !== 'ready') { estados[pose].canon = 'ready'; notificar(); } }
/** Compat: nomes antigos apontam para a MESMA verdade canônica (um único bitmap por pose). */
export function marcarProntaPortrait(pose) { marcarProntaCanon(pose); }
export function marcarProntaEvent(pose) { marcarProntaCanon(pose); }
export function marcarErro(pose) { if (estados[pose] && estados[pose].canon !== 'ready') { estados[pose].canon = 'error'; notificar(); } }

/** Download/cacheamento dos módulos (uma vez). NÃO marca ready — quem marca é o warmer (decode canônico). */
export function iniciarWarmup() {
  if (promessa) return promessa;
  promessa = (async () => {
    for (const p of ORDEM_CANON) {
      if (estados[p].download === 'idle') estados[p].download = 'downloading';
      try { await Asset.fromModule(BENI_IMAGES[p]).downloadAsync(); estados[p].download = 'downloaded'; }
      catch (_) { /* mantém 'downloading'; o warmer decide ready/error na decodificação */ }
    }
    return true;
  })();
  return promessa;
}

/** APENAS testes: reinicia o singleton. */
export function _resetParaTeste() { promessa = null; BENI_POSE_KEYS.forEach((p) => { estados[p] = { download: 'idle', canon: 'idle' }; }); ouvintes.clear(); }
