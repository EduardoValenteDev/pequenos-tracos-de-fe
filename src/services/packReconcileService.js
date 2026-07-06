/**
 * packReconcileService.js — Núcleo PURO de reconciliação índice↔disco (Fase 2, F2.5-hardening-2).
 *
 * ⚠️ PURO: SEM FileSystem, SEM AsyncStorage, SEM I/O, SEM rede. Só DECISÃO. A casca de disco
 * (getInfoAsync) vive no PacksContext (`probePackDisk`), que passa o resultado para cá.
 *
 * Objetivo: o índice local `@ptf_packs_v1` pode afirmar `ready` sem que os arquivos existam no
 * disco (crash na janela delete→move de um re-download, limpeza manual, restore). Estas funções
 * derivam o ESTADO EFETIVO em memória — um `ready` cujo disco não bate é tratado como
 * `NOT_DOWNLOADED` (o resolver cai no require local). NÃO grava nada; o índice persistido é
 * intocado (read-only preservado; downgrade-safe).
 *
 * Regra CONSERVADORA (evita falso-negativo): só rebaixa em `exists:false` DEFINITIVO. Se a casca
 * não conseguiu observar o disco (getInfoAsync lançou → probe indeterminado `null`), MANTÉM o
 * pack — o render já é protegido pelo getInfoAsync dos hooks (F2.5-hardening-1).
 */
import { PACK_STATUS } from './packStorageService';

/**
 * True se a entry PRECISA de checagem de disco: só `ready` COM `localDir` reivindica arquivos.
 * (`included`/`not_downloaded`/`downloading`/`failed`/… não servem `file://` → nada a invalidar.)
 * @param {object|null} entry CacheEntry do índice
 * @returns {boolean}
 */
export function needsDiskCheck(entry) {
  return !!entry && entry.status === PACK_STATUS.READY && !!entry.localDir;
}

/**
 * Decisão PURA: a reivindicação `ready` desta entry é VÁLIDA, dado o que a casca observou no disco?
 * @param {object|null} entry
 * @param {{ localDirExists: boolean|null, manifestExists: boolean|null }} [diskProbe]
 *   `null` (indeterminado, ex.: getInfoAsync lançou) → NÃO invalida (conservador).
 * @returns {boolean} false SÓ quando o disco confirma ausência (exists:false definitivo).
 */
export function isReadyEntryValid(entry, diskProbe) {
  if (!needsDiskCheck(entry)) return true;            // não-ready → nada a invalidar
  const p = diskProbe || {};
  if (p.localDirExists === false) return false;       // localDir sumiu → inválido
  if (p.manifestExists === false) return false;       // move não concluiu → inválido
  return true;                                        // true/null → mantém (conservador)
}

/**
 * Varre o índice + os probes e retorna os storyIds cujo `ready` é INVÁLIDO no disco.
 * @param {Record<string, object>} index   mapa storyId→entry (já normalizado)
 * @param {Record<string, object>} probes  mapa storyId→diskProbe
 * @returns {string[]} storyIds a rebaixar em memória
 */
export function computeInvalidReadyIds(index, probes) {
  const out = [];
  if (!index || typeof index !== 'object') return out;
  for (const sid of Object.keys(index)) {
    const e = index[sid];
    if (needsDiskCheck(e) && !isReadyEntryValid(e, probes && probes[sid])) out.push(sid);
  }
  return out;
}

/**
 * Aplica o rebaixamento EM MEMÓRIA: `ready` inválido → `not_downloaded`. Nunca promove para ready.
 * Preserva a MESMA referência quando não há mudança (estabilidade referencial → sem re-render/
 * rebuild de timeline à toa).
 * @param {object|null} entry
 * @param {boolean} isInvalid  este storyId está no conjunto de inválidos?
 * @returns {object|null} entry (rebaixada) ou a MESMA referência
 */
export function reconcileEntry(entry, isInvalid) {
  if (!entry || typeof entry !== 'object') return entry;
  if (entry.status === PACK_STATUS.READY && isInvalid) {
    return { ...entry, status: PACK_STATUS.NOT_DOWNLOADED };
  }
  return entry;                                       // válido → MESMA referência
}
