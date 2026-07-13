/**
 * beniAssetWarmup.js — Aquecimento COMPARTILHADO das imagens do Beni (P4R9).
 *
 * Cache em NÍVEL DE MÓDULO (singleton): estados por pose e a promessa de download persistem entre
 * telas e remontagens. P4R9 distingue DOWNLOAD de DECODE, e DECODE por TAMANHO:
 *   idle → downloading → downloaded  (Asset.downloadAsync — NÃO prova textura pronta)
 *   readyPortrait  = a Image PERSISTENTE de tamanho portrait disparou onLoadEnd
 *   readyEvent     = a Image PERSISTENTE de tamanho event   disparou onLoadEnd
 *   error
 *
 * Só `readyPortrait`/`readyEvent` provam que a textura está decodificada naquele tamanho. O
 * warmer (`PalavrinhasBeniWarmer`) mantém DUAS Images fixas por pose (portrait 128, event 220) e
 * chama `marcarProntaPortrait`/`marcarProntaEvent` no onLoadEnd de cada uma.
 */
import { Asset } from 'expo-asset';
import { BENI_IMAGES, BENI_POSE_KEYS } from '../assets/mascot/beniImages';
import { POSES_MINIMAS } from './palavrinhasVisualDirector';

const estados = {};   // pose -> { download, portrait, event }
BENI_POSE_KEYS.forEach((p) => { estados[p] = { download: 'idle', portrait: 'idle', event: 'idle' }; });
let promessa = null;
const ouvintes = new Set();

export const ORDEM_WARMUP = Object.freeze([
  ...POSES_MINIMAS,
  ...BENI_POSE_KEYS.filter((p) => !POSES_MINIMAS.includes(p)),
]);

export function statusPose(p) { return estados[p] || { download: 'idle', portrait: 'idle', event: 'idle' }; }
export function downloadStatus(p) { return (estados[p] || {}).download || 'idle'; }
export function readyPortrait(p) { return !!estados[p] && estados[p].portrait === 'ready'; }
export function readyEvent(p) { return !!estados[p] && estados[p].event === 'ready'; }
/** Compat: pronta em QUALQUER tamanho (evita regressões de chamadas antigas). */
export function poseReady(p) { return readyPortrait(p) || readyEvent(p); }

export function minimasPortraitProntas() { return POSES_MINIMAS.every(readyPortrait); }
export function minimasEventProntas() { return POSES_MINIMAS.every(readyEvent); }
/** Mínimo para NAVEGAR/JOGAR: pelo menos as poses mínimas decodificadas em algum tamanho. */
export function minimasProntas() { return POSES_MINIMAS.every((p) => readyPortrait(p) || readyEvent(p)); }
export function todasProntas() { return BENI_POSE_KEYS.every((p) => readyPortrait(p) && readyEvent(p)); }
export function posesProntas() { return BENI_POSE_KEYS.filter(poseReady); }

export function assinar(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); }
function notificar() { ouvintes.forEach((fn) => { try { fn(); } catch (_) { /* noop */ } }); }

export function marcarProntaPortrait(pose) { if (estados[pose] && estados[pose].portrait !== 'ready') { estados[pose].portrait = 'ready'; notificar(); } }
export function marcarProntaEvent(pose) { if (estados[pose] && estados[pose].event !== 'ready') { estados[pose].event = 'ready'; notificar(); } }
export function marcarErro(pose) { if (estados[pose]) { if (estados[pose].portrait !== 'ready') estados[pose].portrait = 'error'; if (estados[pose].event !== 'ready') estados[pose].event = 'error'; notificar(); } }

/** Download/cacheamento dos módulos (uma vez). NÃO marca ready — quem marca é o warmer (decode). */
export function iniciarWarmup() {
  if (promessa) return promessa;
  promessa = (async () => {
    for (const p of ORDEM_WARMUP) {
      if (estados[p].download === 'idle') estados[p].download = 'downloading';
      try { await Asset.fromModule(BENI_IMAGES[p]).downloadAsync(); estados[p].download = 'downloaded'; }
      catch (_) { /* mantém 'downloading'; o warmer decide ready/error na decodificação */ }
    }
    return true;
  })();
  return promessa;
}

/** APENAS testes: reinicia o singleton. */
export function _resetParaTeste() { promessa = null; BENI_POSE_KEYS.forEach((p) => { estados[p] = { download: 'idle', portrait: 'idle', event: 'idle' }; }); ouvintes.clear(); }
