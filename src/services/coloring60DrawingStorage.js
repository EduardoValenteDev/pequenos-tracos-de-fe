/**
 * coloring60DrawingStorage.js — Writer DEDICADO e ISOLADO do piloto Colorir 60
 * (C60-IMPL-P3 · P3.T1..T3). Fronteira REAL de persistência da arte por identidade
 * composta (`storyId`, `activityId`), com namespace fechado e entitlement interno.
 *
 * PRINCÍPIOS (nunca violar):
 *   - A TELA É CHAMADORA, NÃO AUTORIDADE. O writer calcula a própria chave internamente
 *     (`keyDrawing60`), NUNCA aceita chave, path, `route`, `story`, `sceneId`/`cenaIndex`
 *     nem entitlement vindos do chamador. Argumentos extras do chamador são IGNORADOS.
 *   - IDENTIDADE SEMÂNTICA: `storyId`/`activityId` são strings validadas contra o catálogo
 *     (`coloring60Catalog`). Número/`"2"`/`"scene_02"`/vazio/não-string ⇒ `invalid_identity`.
 *     A chave só é calculada APÓS a validação (nenhuma entrada inválida provoca escrita).
 *   - ENTITLEMENT FAIL-CLOSED (D6): o plano é reavaliado a CADA tentativa via a fonte
 *     canônica `accessControl.getCurrentPlan()` (= `entitlementService.getEntitlementPlan()`).
 *     SÓ o Plano Família (`'premium'`) persiste. Grátis, indeterminado, ausente ou erro ⇒
 *     ZERO escrita (`not_persisted_free`). Modo Criador/QA NÃO autoriza salvamento aqui.
 *   - NAMESPACE PRÓPRIO, SEM COLISÃO: pixels em `@ptf_drawing60_s<storyId>_a<activityId>`
 *     (não casa `startsWith('@ptf_drawing_')` do legado) e blobs em `ptf_blobs/drawings60/`.
 *     NÃO cria chave de conclusão (`@ptf_coloring60_done_*` é P4), NÃO migra legado, NÃO faz
 *     bump global de schema.
 *   - ISOLAMENTO: NÃO importa o writer legado (`drawingStorage.js`), a tela, a conclusão,
 *     o resolvedor remoto nem `coloringImages`. Reutiliza APENAS os helpers de blob de baixo
 *     nível (`fileBlobStore`, formato ponteiro v3), reuso explicitamente autorizado (plan §6.5.8),
 *     sem enfraquecer o isolamento — o serviço legado não vira writer genérico por chave livre.
 *   - SEM ESCRITA PARCIAL, PRESERVANDO O ANTERIOR (double-buffer): a arte com tinta vai para
 *     um de dois slots alternados (`.a.png`/`.b.png`). A gravação usa SEMPRE o slot INATIVO;
 *     só após promover (o ponteiro no AsyncStorage passa a referenciar o novo slot) e verificar
 *     é que o slot antigo é descartado. Qualquer falha (arquivo, ponteiro, verificação) retorna
 *     `write_failed`, restaura a referência anterior e limpa o slot novo — o desenho anterior
 *     válido é PRESERVADO e nenhum resíduo/órfão é deixado.
 *
 * Governança: specs 014/015/016/017 · DECISIONS.md PL01A-03/PL01G · plan.md §6.5/§6.6/§6.7 ·
 * tasks.md P3.T1..T5.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';
import { getCurrentPlan } from './accessControl';
import { getColoring60Activity } from '../data/coloring60Catalog';
import {
  writeBlob,
  readBlobAsDataUrl,
  deleteBlob,
  safeName,
  isDataUrl,
  dataUrlMime,
  currentBlobsRoot,
} from './fileBlobStore';

// Versão do ponteiro de blob (mesmo formato v3 do legado; o NAMESPACE é que difere).
const POINTER_VERSION = 3;
// Subdiretório PRÓPRIO dos blobs Colorir 60 — isolado de `drawings/` (legado).
const BLOB_SUBDIR = 'drawings60';
// Plano Família = `'premium'` na fonte canônica `getCurrentPlan()`. Único valor que autoriza
// escrita; qualquer outro (free/undefined/null/erro/loading/desconhecido) é NÃO autorizado.
const FAMILY_PLAN = 'premium';

/**
 * Resultados TIPADOS do salvamento (contrato estável e congelado).
 *   - SAVED               → arte persistida no namespace Colorir 60 (Plano Família).
 *   - NOT_PERSISTED_FREE  → sem entitlement Família confirmado (grátis/indeterminado): ZERO escrita.
 *   - WRITE_FAILED        → premium, mas a persistência falhou; nenhum resíduo, anterior preservado.
 *   - INVALID_IDENTITY    → identidade fora do catálogo/inválida: rejeitada antes de qualquer escrita.
 * `invalid_identity` NUNCA é conflado com `not_persisted_free` (razões distintas).
 */
export const COLORING60_SAVE_RESULT = Object.freeze({
  SAVED: 'saved',
  NOT_PERSISTED_FREE: 'not_persisted_free',
  WRITE_FAILED: 'write_failed',
  INVALID_IDENTITY: 'invalid_identity',
});

// ─────────────────────────────────────────────────────────────────────────────
// Identidade + chave (funções FECHADAS — sem valor livre da tela)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * keyDrawing60(storyId, activityId) — construtor FECHADO da chave de pixels. Interno ao
 * serviço: só é chamado após `validateIdentity`, com IDs já confirmados no catálogo (slugs
 * limpos). Sem normalização silenciosa (que poderia colidir IDs distintos) e sem colisão com
 * o legado `@ptf_drawing_s<storyId>_c<sceneId>` (o prefixo `@ptf_drawing60_` diverge no 12º char).
 */
function keyDrawing60(storyId, activityId) {
  return `@ptf_drawing60_s${storyId}_a${activityId}`;
}

/**
 * validateIdentity(storyId, activityId) — retorna a atividade do catálogo, ou `null` se a
 * identidade for inválida. STRINGS SEMÂNTICAS não-vazias E existentes no catálogo. Um número
 * (ex.: 2), `"2"`, `"scene_02"`, vazio ou não-string JAMAIS validam — nunca viram cena/índice.
 */
function validateIdentity(storyId, activityId) {
  if (
    typeof storyId !== 'string' ||
    typeof activityId !== 'string' ||
    storyId.length === 0 ||
    activityId.length === 0
  ) {
    return null;
  }
  return getColoring60Activity(storyId, activityId); // null quando fora do piloto
}

// ─────────────────────────────────────────────────────────────────────────────
// Slots de blob (double-buffer) + ponteiro v3 próprio
// ─────────────────────────────────────────────────────────────────────────────

/**
 * otherSlotName(safeKey, oldUri) — nome do slot INATIVO. Se o ponteiro atual usa o slot `.a`,
 * o novo vai para `.b`, e vice-versa; sem ponteiro anterior (ou inline) → `.a`. Assim a gravação
 * nunca sobrescreve o arquivo que o ponteiro atual ainda referencia (anterior preservado).
 */
function otherSlotName(safeKey, oldUri) {
  const usesA = typeof oldUri === 'string' && oldUri.endsWith(`${safeKey}.a.png`);
  return usesA ? `${safeKey}.b.png` : `${safeKey}.a.png`;
}

/** true se o payload tem tinta REAL (mesmo critério do legado; canvas em branco fica inline). */
function payloadHasPaint(payload) {
  if (!payload || typeof payload !== 'string') return false;
  if (payload.startsWith('data:image/png;base64,')) return payload.length > 1000;
  try {
    const p = JSON.parse(payload);
    if (p?.v === POINTER_VERSION && typeof p?.uri === 'string') return true;
    return typeof p?.data === 'string' && p.data.length > 1000;
  } catch {
    return false;
  }
}

/** true se o valor armazenado é um ponteiro v3 (blob em arquivo). */
function isPointer60(value) {
  if (typeof value !== 'string' || value[0] !== '{') return false;
  try {
    const p = JSON.parse(value);
    return !!p && p.v === POINTER_VERSION && typeof p.uri === 'string';
  } catch {
    return false;
  }
}

/** URI do blob referenciado por um ponteiro v3 (ou null). */
function pointerUri(value) {
  if (!isPointer60(value)) return null;
  try { return JSON.parse(value).uri || null; } catch { return null; }
}

/**
 * writeSlot(slotName, payload) — grava o blob grande no slot informado (INATIVO) e monta o
 * ponteiro v3. Retorna `{ ptr, uri }` em sucesso, ou `null` em falha — limpando qualquer
 * arquivo parcial NO SLOT INATIVO (nunca toca o slot ativo/anterior).
 */
async function writeSlot(slotName, payload) {
  let fmt;
  let dataUrl;
  let layout = null;

  if (isDataUrl(payload)) {
    fmt = 1;
    dataUrl = payload;
  } else {
    let p;
    try { p = JSON.parse(payload); } catch { return null; }
    if (!p || typeof p.data !== 'string') return null;
    fmt = 2;
    dataUrl = p.data;
    layout = {
      W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
    };
  }

  const mime = dataUrlMime(dataUrl, 'image/png');
  const written = await writeBlob(BLOB_SUBDIR, slotName, dataUrl, mime);
  if (!written) {
    // Compensatório: remove qualquer arquivo parcial no slot inativo (seguro: nunca é o ativo).
    const root = currentBlobsRoot();
    if (root) await deleteBlob(`${root}${BLOB_SUBDIR}/${slotName}`);
    return null;
  }

  const ptr = { v: POINTER_VERSION, fmt, uri: written.uri, mime };
  if (layout) Object.assign(ptr, layout);
  return { ptr: JSON.stringify(ptr), uri: written.uri };
}

/** Reconstrói o payload original (v1 data URL ou v2 JSON) a partir do ponteiro v3. */
async function resolvePointer60(value) {
  let p;
  try { p = JSON.parse(value); } catch { return null; }
  const dataUrl = await readBlobAsDataUrl(p.uri, p.mime || 'image/png');
  if (!dataUrl) return null; // ponteiro órfão (arquivo sumiu): ausência honesta
  if (p.fmt === 2) {
    return JSON.stringify({
      v: 2, W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
      data: dataUrl,
    });
  }
  return dataUrl; // fmt 1
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública (fechada e mínima)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * saveColoring60DrawingState(storyId, activityId, payload) — AUTORIDADE de escrita.
 * Ordem: (1) valida identidade → `invalid_identity`; (2) reavalia entitlement (D6),
 * fail-closed → só `'premium'` segue, senão `not_persisted_free` com ZERO escrita;
 * (3) só então calcula a chave e persiste via double-buffer (slot inativo → promover →
 * verificar → descartar o slot antigo); (4) resultado tipado. NUNCA marca conclusão,
 * NUNCA chama o writer legado, NUNCA cai em chave/namespace de cena.
 */
export async function saveColoring60DrawingState(storyId, activityId, payload) {
  // 1) Identidade PRIMEIRO — entrada inválida não provoca nenhuma escrita.
  if (!validateIdentity(storyId, activityId)) {
    return COLORING60_SAVE_RESULT.INVALID_IDENTITY;
  }

  // 2) Entitlement reavaliado AGORA, na fonte canônica, fail-closed. Autoridade é o serviço.
  let plan;
  try {
    plan = getCurrentPlan();
  } catch (e) {
    plan = null; // erro ao consultar entitlement ⇒ tratado como não autorizado
  }
  if (plan !== FAMILY_PLAN) {
    // Grátis OU indeterminado (undefined/null/erro/loading/desconhecido): 0 escrita.
    return COLORING60_SAVE_RESULT.NOT_PERSISTED_FREE;
  }

  // 3) Só APÓS validar identidade e confirmar Plano Família a chave é calculada e escrita.
  const k = keyDrawing60(storyId, activityId);
  const safeKey = safeName(k);
  try {
    // Estado anterior (para double-buffer e para preservar/limpar sem órfão).
    let oldRaw = null;
    try { oldRaw = await AsyncStorage.getItem(k); } catch { oldRaw = null; }
    const oldUri = pointerUri(oldRaw);

    let toStore = payload;
    let newUri = null;

    if (payloadHasPaint(payload)) {
      const slot = otherSlotName(safeKey, oldUri); // slot INATIVO
      const built = await writeSlot(slot, payload);
      if (!built) {
        // Falha ao escrever o slot novo: anterior intocado (preservado), sem resíduo.
        return COLORING60_SAVE_RESULT.WRITE_FAILED;
      }
      toStore = built.ptr;
      newUri = built.uri;
    }

    // Promover: o ponteiro/valor no AsyncStorage passa a referenciar o novo estado.
    try {
      await AsyncStorage.setItem(k, toStore);
    } catch (e) {
      if (newUri) await deleteBlob(newUri); // remove o slot novo não referenciado; anterior preservado
      log('coloring60DrawingStorage.save.setItem:', e);
      return COLORING60_SAVE_RESULT.WRITE_FAILED;
    }

    // Verificar: confirma que ficou gravado exatamente o que se pretendia.
    let check;
    try {
      check = await AsyncStorage.getItem(k);
    } catch (e) {
      check = undefined;
    }
    if (check !== toStore) {
      if (newUri) await deleteBlob(newUri);
      // Restaura a referência anterior (preserva o desenho válido quando possível).
      try {
        if (oldRaw != null) await AsyncStorage.setItem(k, oldRaw);
        else await AsyncStorage.removeItem(k);
      } catch { /* best-effort */ }
      return COLORING60_SAVE_RESULT.WRITE_FAILED;
    }

    // Sucesso: descarta o slot ANTIGO (se era um arquivo diferente do novo).
    if (oldUri && oldUri !== newUri) {
      try { await deleteBlob(oldUri); } catch { /* best-effort */ }
    }
    return COLORING60_SAVE_RESULT.SAVED;
  } catch (e) {
    log('coloring60DrawingStorage.save:', e);
    return COLORING60_SAVE_RESULT.WRITE_FAILED;
  }
}

/**
 * getColoring60SavedDrawing(storyId, activityId) — payload salvo (v1/v2), ou `null`.
 * Valida identidade, calcula a chave internamente, resolve ponteiro v3 lendo o arquivo de
 * volta (ponteiro órfão → `null` honesto). NÃO consulta cena/namespace legado, NÃO consulta
 * entitlement (ler arte já persistida não é gated), NÃO modifica o storage ao ler.
 */
export async function getColoring60SavedDrawing(storyId, activityId) {
  if (!validateIdentity(storyId, activityId)) return null;
  try {
    const raw = await AsyncStorage.getItem(keyDrawing60(storyId, activityId));
    if (!raw) return null;
    if (isPointer60(raw)) return await resolvePointer60(raw);
    return raw; // inline (canvas sem tinta significativa)
  } catch {
    return null;
  }
}

/**
 * hasColoring60SavedDrawing(storyId, activityId) — true se há arte com tinta REAL salva.
 * Valida identidade, calcula a chave internamente. NÃO consulta entitlement.
 */
export async function hasColoring60SavedDrawing(storyId, activityId) {
  if (!validateIdentity(storyId, activityId)) return false;
  try {
    const v = await AsyncStorage.getItem(keyDrawing60(storyId, activityId));
    if (v == null) return false;
    return payloadHasPaint(v);
  } catch {
    return false;
  }
}

/**
 * clearColoring60SavedDrawing(storyId, activityId) — remove SOMENTE a arte daquela atividade
 * (metadado + blob). Idempotente; ausência não é erro. NÃO remove conclusão, NÃO remove arte
 * de outra atividade, NÃO toca o namespace legado. Não recebe chave arbitrária.
 */
export async function clearColoring60SavedDrawing(storyId, activityId) {
  if (!validateIdentity(storyId, activityId)) return;
  const k = keyDrawing60(storyId, activityId);
  try {
    const raw = await AsyncStorage.getItem(k);
    const uri = pointerUri(raw);
    if (uri) await deleteBlob(uri);
    await AsyncStorage.removeItem(k);
  } catch (e) {
    log('coloring60DrawingStorage.clear:', e);
  }
}
