/**
 * coloring60DrawingStorage.js — Writer DEDICADO e ISOLADO do piloto Colorir 60
 * (C60-IMPL-P3 · P3.T1..T3 · Spec 019 · bloco S1). Fronteira REAL de persistência da arte
 * por identidade composta (`storyId`, `activityId`), com namespace fechado e autoridade de
 * escrita derivada do ACESSO LEGÍTIMO ao conteúdo.
 *
 * PRINCÍPIOS (nunca violar):
 *   - A TELA É CHAMADORA, NÃO AUTORIDADE. O writer calcula a própria chave internamente
 *     (`keyDrawing60`), NUNCA aceita chave, path, `route`, `story`, `sceneId`/`cenaIndex`
 *     nem entitlement vindos do chamador. Argumentos extras do chamador são IGNORADOS.
 *     Abrir a tela NÃO constitui autorização.
 *   - IDENTIDADE SEMÂNTICA: `storyId`/`activityId` são strings validadas contra o catálogo
 *     (`coloring60Catalog`). História fora do piloto ⇒ `invalid_story`; atividade inexistente,
 *     de outra história, número, `"2"`, `"scene_02"`, vazio ou não-string ⇒ `invalid_activity`.
 *     A chave só é calculada APÓS a validação (nenhuma entrada inválida provoca escrita).
 *   - AUTORIDADE POR ACESSO LEGÍTIMO (Spec 019 · S1 — substitui a antiga autoridade por PLANO):
 *     quem tem acesso legítimo à história E à atividade salva a pintura narrativa localmente,
 *     em QUALQUER plano. Grátis em história gratuita acessível salva; Família em história
 *     premium acessível salva; conteúdo SEM acesso NUNCA salva. A decisão NÃO é tomada aqui:
 *     ela chega pronta, como objeto estruturado, da autoridade canônica
 *     (`storyContentAuthorization.deriveStoryContentAuthorization`, alimentada pelo
 *     `ProgressContext`). Este módulo apenas VERIFICA o contrato e obedece — ele não conhece
 *     sequência, trava comercial, packs, disponibilidade de mídia, entitlement nem jornada.
 *   - FAIL-CLOSED SEM I/O: ausência de contrato, contrato malformado/forjado, hidratação em
 *     curso ou acesso negado ⇒ recusa TIPADA com ZERO escrita — nenhum blob, nenhum ponteiro,
 *     nenhuma alternância de slot, nenhuma modificação da obra anterior.
 *   - SEM PORTA DE DESENVOLVIMENTO: não existe override de ambiente para escrita. Nem build de
 *     desenvolvimento, nem ferramentas internas, nem Modo Criador/QA autorizam salvar conteúdo
 *     sem acesso. A única chave é o contrato canônico — a mesma em desenvolvimento, no piloto e
 *     em produção. (A antiga exceção `isDevWriteAuthorized` do P8 §3 deixou de existir: ela só
 *     era necessária enquanto a autoridade era o plano.)
 *   - LOCAL E OFFLINE: o writer não consulta rede, loja nem entitlement. Funciona sem conexão.
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
 *     `write_failed` e o desenho anterior válido é PRESERVADO sob falha SIMPLES.
 *
 * GARANTIAS TRANSACIONAIS (C60-IMPL-P3-FIX1 — honestas quanto ao que a infraestrutura oferece;
 * o AsyncStorage/FileSystem NÃO dão transação atômica multi-recurso):
 *   1. ZERO escrita sem acesso legítimo (nem leitura): a fronteira de I/O não é sequer tocada.
 *   2. INVARIANTE central: nenhuma chave ativa aponta DELIBERADAMENTE para um blob que o próprio
 *      writer acabou de apagar. O blob novo só é descartado APÓS reler a chave e CONFIRMAR que
 *      ela não o referencia mais; em estado desconhecido, o blob novo é PRESERVADO (legível).
 *   3. Sob falha SIMPLES (arquivo, promoção OU verificação), o desenho anterior é preservado e o
 *      slot novo não referenciado é limpo — sem resíduo.
 *   4. Sob falha COMPOSTA (ex.: verificação falha E a restauração do anterior também falha), o
 *      rollback é MELHOR-ESFORÇO: o status continua `write_failed`, a chave pode permanecer com o
 *      ponteiro novo — e nesse caso o blob novo permanece LEGÍVEL. Pode restar resíduo FÍSICO
 *      (arquivo sem ponteiro), nunca um ponteiro quebrado.
 *   5. `saved` só é retornado após o estado novo ser promovido E verificado; nunca otimista.
 *   6. A limpeza do blob antigo pós-sucesso é best-effort: uma falha física ali deixa no máximo um
 *      arquivo antigo SEM ponteiro (resíduo), jamais invalida o desenho novo já ativo.
 *   7. `get` retorna `null` para ponteiro ilegível (arquivo ausente); `has` retorna `false` no mesmo
 *      caso — `get` e `has` são semanticamente COERENTES (has reusa get, sem healing/escrita).
 *
 * Governança: specs 014/015/016/017/019 · DECISIONS.md PL01A-03/PL01G ·
 * D-C60-PERSISTENCIA-TODOS-PLANOS · plan.md §6.5/§6.6/§6.7 · tasks.md P3.T1..T5 ·
 * C60-IMPL-P3-QA1 (auditoria) · C60-IMPL-P3-FIX1 (hardening) · Spec 019 bloco S1.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';
import { CONTENT_AUTH_REASON } from './storyContentAuthorization';
import { getColoring60Activity, getColoring60Activities } from '../data/coloring60Catalog';
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

/**
 * Resultados TIPADOS do salvamento (contrato estável e congelado). Spec 019 · S1 substituiu o
 * antigo desfecho genérico por UM DESFECHO POR CAUSA — "não escreveu" deixou de ser uma coisa só.
 *   - SAVED                    → arte persistida no namespace Colorir 60 (qualquer plano, com acesso).
 *   - WRITE_FAILED             → autorizado, mas a persistência não pôde ser promovida/verificada.
 *                                Sob falha simples o anterior é preservado; sob falha composta,
 *                                best-effort (ver GARANTIAS TRANSACIONAIS) — nunca um ponteiro
 *                                apontando para blob apagado. É falha de DISCO, não de direito.
 *   - ACCESS_DENIED            → contrato válido, porém sem acesso legítimo ao conteúdo (sequência,
 *                                trava comercial ou mídia indisponível): ZERO escrita.
 *   - AUTHORIZATION_NOT_READY  → a autorização ainda hidrata; nada é decidido nem escrito. Não é
 *                                negativa — é "ainda não sei", e o chamador pode tentar de novo.
 *   - INVALID_STORY            → história fora do catálogo do Colorir com o Beni.
 *   - INVALID_ACTIVITY         → atividade inexistente ou pertencente a outra história.
 *   - INVALID_AUTHORIZATION    → contrato ausente, malformado, incoerente ou de outra história.
 * Nenhum desses valores pode ser reaproveitado para outra causa: acesso negado, falha de disco,
 * estado legado, falha de autorização e escrita não realizada são desfechos DISTINTOS.
 */
export const COLORING60_SAVE_RESULT = Object.freeze({
  SAVED: 'saved',
  WRITE_FAILED: 'write_failed',
  ACCESS_DENIED: 'access_denied',
  AUTHORIZATION_NOT_READY: 'authorization_not_ready',
  INVALID_STORY: 'invalid_story',
  INVALID_ACTIVITY: 'invalid_activity',
  INVALID_AUTHORIZATION: 'invalid_authorization',
});

// Razões canônicas aceitas no contrato. Vem da autoridade — o writer não inventa nem amplia
// esta lista, só confere que a razão recebida pertence a ela.
const CANONICAL_AUTH_REASONS = Object.freeze(Object.values(CONTENT_AUTH_REASON));

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

/**
 * identityFailure(storyId, activityId) — `null` quando a identidade é válida; senão, o desfecho
 * TIPADO da recusa (Spec 019 · S1). Separa duas coisas que o desfecho único antigo confundia:
 * "essa história não é do Colorir com o Beni" e "essa atividade não existe NESTA história".
 * A ordem importa: a história é checada primeiro, para que uma história desconhecida não seja
 * relatada como atividade inválida. `getColoring60Activities` devolve lista VAZIA (não `null`)
 * para história fora do piloto — por isso o teste é pelo tamanho.
 */
function identityFailure(storyId, activityId) {
  if (typeof storyId !== 'string' || storyId.length === 0) {
    return COLORING60_SAVE_RESULT.INVALID_STORY;
  }
  const doCatalogo = getColoring60Activities(storyId);
  if (!Array.isArray(doCatalogo) || doCatalogo.length === 0) {
    return COLORING60_SAVE_RESULT.INVALID_STORY;
  }
  if (!validateIdentity(storyId, activityId)) {
    return COLORING60_SAVE_RESULT.INVALID_ACTIVITY;
  }
  return null;
}

/**
 * authorizationFailure(authorization, storyId) — `null` quando o contrato canônico autoriza a
 * escrita NESTA gravação; senão, o desfecho TIPADO da recusa (Spec 019 · S1).
 *
 * O writer NÃO decide acesso: ele confere que recebeu de fato o contrato da autoridade canônica
 * e obedece. Por isso não basta um campo isolado — um `{ canSave: true }` (ou qualquer booleano
 * solto) é recusado como `invalid_authorization`. A conferência é estrutural e reproduz as duas
 * INVARIANTES internas de `deriveStoryContentAuthorization`:
 *     allowed === (reason === ALLOWED)
 *     canEnterStoryContent === (authorizationReady && allowed)
 * Um contrato forjado à mão que minta em qualquer um desses campos quebra a invariante e é
 * rejeitado — é isso que torna a exigência do objeto estruturado verificável, e não decorativa.
 *
 * Ordem (fail-closed): forma → coerência → identidade da história → hidratação → acesso.
 * "Ainda hidratando" é reportado ANTES de "acesso negado" porque ainda não há decisão a negar.
 */
function authorizationFailure(authorization, storyId) {
  const a = authorization;
  if (!a || typeof a !== 'object' || Array.isArray(a)) {
    return COLORING60_SAVE_RESULT.INVALID_AUTHORIZATION;
  }
  if (
    typeof a.authorizationReady !== 'boolean' ||
    typeof a.allowed !== 'boolean' ||
    typeof a.canEnterStoryContent !== 'boolean' ||
    typeof a.reason !== 'string' ||
    typeof a.storyId !== 'string' ||
    a.storyId.length === 0
  ) {
    return COLORING60_SAVE_RESULT.INVALID_AUTHORIZATION;
  }
  if (CANONICAL_AUTH_REASONS.indexOf(a.reason) === -1) {
    return COLORING60_SAVE_RESULT.INVALID_AUTHORIZATION;
  }
  if (a.allowed !== (a.reason === CONTENT_AUTH_REASON.ALLOWED)) {
    return COLORING60_SAVE_RESULT.INVALID_AUTHORIZATION;
  }
  if (a.canEnterStoryContent !== (a.authorizationReady && a.allowed)) {
    return COLORING60_SAVE_RESULT.INVALID_AUTHORIZATION;
  }
  // O contrato tem de ser DESTA gravação: uma autorização legítima de outra história não
  // empresta direito de escrita aqui.
  if (a.storyId !== storyId) {
    return COLORING60_SAVE_RESULT.INVALID_AUTHORIZATION;
  }
  if (a.authorizationReady !== true) {
    return COLORING60_SAVE_RESULT.AUTHORIZATION_NOT_READY;
  }
  if (a.canEnterStoryContent !== true) {
    return COLORING60_SAVE_RESULT.ACCESS_DENIED;
  }
  return null;
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
      // MEDIDA DA TINTA (C60 · Parte 4). `rev` casa pintura ↔ instantâneo dentro da transação
      // atômica; `paintedPx`/`paintablePx` são a prova de que a arte guardada TEM cor de verdade.
      // Sem carregar isto no ponteiro, o instantâneo relido do disco voltaria "sem medida" e uma
      // arte legítima seria classificada como vazia na reidratação. São três números — o blob
      // grande continua no arquivo, o metadado segue leve.
      rev: p.rev ?? null,
      paintedPx: p.paintedPx ?? null,
      paintablePx: p.paintablePx ?? null,
    };
  }

  const mime = dataUrlMime(dataUrl, 'image/png');
  const written = await writeBlob(BLOB_SUBDIR, slotName, dataUrl, mime);
  if (!written) {
    // Compensatório: remove qualquer arquivo parcial no slot inativo (seguro: nunca é o ativo).
    // O subdiretório é FIXADO no alvo: mesmo montado a partir da raiz atual, nada fora de
    // `ptf_blobs/drawings60/` pode ser atingido por esta limpeza.
    const root = currentBlobsRoot();
    if (root) await deleteBlob(`${root}${BLOB_SUBDIR}/${slotName}`, { requireSubdir: BLOB_SUBDIR });
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
    // A medida da tinta volta EXATAMENTE como foi gravada (C60 · Parte 4). Ponteiros antigos, sem
    // esses campos, devolvem `null` — e `coloring60PaintMetrics` trata ausência de medida como
    // "não comprovado", nunca como "tem cor". Nenhum leitor antigo quebra: `v` continua 2.
    return JSON.stringify({
      v: 2, W: p.W ?? null, H: p.H ?? null,
      imgX: p.imgX ?? null, imgY: p.imgY ?? null,
      imgW: p.imgW ?? null, imgH: p.imgH ?? null,
      rev: p.rev ?? null,
      paintedPx: p.paintedPx ?? null,
      paintablePx: p.paintablePx ?? null,
      data: dataUrl,
    });
  }
  return dataUrl; // fmt 1
}

/**
 * rollbackFailedPromotion(k, oldRaw, newUri) — desfaz uma promoção que NÃO pôde ser confirmada
 * (setItem lançou, OU a verificação divergiu), preservando a INVARIANTE central: "nenhuma chave
 * ativa aponta para um blob que o próprio writer acabou de apagar".
 *   1) Restaura PRIMEIRO o metadado anterior (`oldRaw`) — ou remove a chave, se não havia estado
 *      anterior. NUNCA apaga o blob novo antes disto.
 *   2) RELÊ a chave. O blob novo só é descartado se, comprovadamente, a chave NÃO o referencia mais.
 *   3) Se a chave não pôde ser relida (estado DESCONHECIDO) ou ainda referencia o blob novo, o blob
 *      novo é PRESERVADO (permanece legível). Sob falha composta isso pode deixar resíduo físico,
 *      jamais um ponteiro quebrado.
 * Não presume que uma rejeição de `setItem` signifique que nada foi gravado (o metadado é tratado
 * como potencialmente desconhecido após uma falha de escrita).
 */
async function rollbackFailedPromotion(k, oldRaw, newUri) {
  // 1) Restaurar o metadado anterior — melhor-esforço, jamais antes de decidir sobre o blob novo.
  try {
    if (oldRaw != null) await AsyncStorage.setItem(k, oldRaw);
    else await AsyncStorage.removeItem(k);
  } catch (e) {
    log('coloring60DrawingStorage.rollback.meta:', e);
  }
  if (!newUri) return; // promoção inline (sem blob novo): nada a descartar.

  // 2) Reler a chave e decidir com segurança. `readable === false` ⇒ estado desconhecido.
  let current;
  let readable = true;
  try {
    current = await AsyncStorage.getItem(k);
  } catch {
    readable = false;
  }
  const keyStillRefsNew = readable && pointerUri(current) === newUri;

  // 3) Só descarta o blob novo com CONFIRMAÇÃO de que nenhuma chave o referencia; senão, preserva.
  if (readable && !keyStillRefsNew) {
    try {
      await deleteBlob(newUri, { requireSubdir: BLOB_SUBDIR });
    } catch (e) { log('coloring60DrawingStorage.rollback.delnew:', e); }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública (fechada e mínima)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * saveColoring60DrawingState(storyId, activityId, payload, options) — AUTORIDADE de escrita.
 *
 * `options.authorization` é o contrato canônico de acesso ao conteúdo, produzido por
 * `deriveStoryContentAuthorization` e entregue pelo chamador POR INTEIRO (objeto estruturado;
 * booleano solto não serve). O writer confere o contrato e obedece — ele não recalcula acesso.
 *
 * Ordem: (1) valida identidade → `invalid_story`/`invalid_activity`; (2) confere o contrato,
 * fail-closed → `invalid_authorization`/`authorization_not_ready`/`access_denied`, todos com
 * ZERO escrita; (3) só então calcula a chave e persiste via double-buffer (slot inativo →
 * promover → verificar → descartar o slot antigo); (4) resultado tipado. NUNCA marca conclusão,
 * NUNCA chama o writer legado, NUNCA cai em chave/namespace de cena, NUNCA consulta plano/rede.
 */
export async function saveColoring60DrawingState(storyId, activityId, payload, options) {
  // 1) Identidade PRIMEIRO — entrada inválida não provoca nenhuma escrita.
  const falhaIdentidade = identityFailure(storyId, activityId);
  if (falhaIdentidade) return falhaIdentidade;

  // 2) Acesso legítimo, conferido AGORA, a cada tentativa, fail-closed. Sem contrato válido e
  //    correspondente a ESTA gravação, a fronteira de I/O não é sequer tocada.
  const falhaAutorizacao = authorizationFailure(
    options && typeof options === 'object' ? options.authorization : null,
    storyId,
  );
  if (falhaAutorizacao) return falhaAutorizacao;

  // 3) Só APÓS validar identidade e confirmar o acesso a chave é calculada e escrita.
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

    // Promover: o ponteiro/valor no AsyncStorage passa a referenciar o novo estado. Uma rejeição
    // de setItem NÃO garante que nada foi gravado — o rollback relê a chave e decide com segurança
    // (nunca apaga o blob novo enquanto a chave puder referenciá-lo).
    try {
      await AsyncStorage.setItem(k, toStore);
    } catch (e) {
      log('coloring60DrawingStorage.save.setItem:', e);
      await rollbackFailedPromotion(k, oldRaw, newUri);
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
      // Verificação divergiu: desfazer preservando a invariante (restaura o anterior e só descarta
      // o blob novo se a chave comprovadamente não o referencia mais).
      await rollbackFailedPromotion(k, oldRaw, newUri);
      return COLORING60_SAVE_RESULT.WRITE_FAILED;
    }

    // Sucesso: descarta o slot ANTIGO (se era um arquivo diferente do novo). Best-effort — uma
    // falha física aqui deixa no máximo um arquivo antigo SEM ponteiro (resíduo), nunca invalida
    // o desenho novo já promovido e verificado.
    //
    // [P3J-R.1] `protect: newUri` é a blindagem ESTRUTURAL do snapshot atual. A comparação
    // `oldUri !== newUri` acima é textual, e um ponteiro antigo pode trazer o `documentDirectory` de
    // um container iOS anterior: duas URIs textualmente distintas apontariam para o MESMO arquivo
    // depois de recompostas. O double-buffer A/B já torna essa colisão improvável (o slot novo é
    // sempre o inativo), mas a preservação da pintura recém-salva não pode depender disso — aqui ela
    // é garantida por contenção, comparada já recomposta.
    if (oldUri && oldUri !== newUri) {
      try {
        await deleteBlob(oldUri, { requireSubdir: BLOB_SUBDIR, protect: newUri });
      } catch (e) { log('coloring60DrawingStorage.save.cleanupOld:', e); }
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
 * hasColoring60SavedDrawing(storyId, activityId) — true SOMENTE quando existe um desenho
 * RECUPERÁVEL com tinta real. Reusa `getColoring60SavedDrawing` (que resolve o ponteiro lendo
 * o arquivo) e aplica `payloadHasPaint` ao payload EFETIVAMENTE recuperado — assim `has` e `get`
 * ficam semanticamente COERENTES: um ponteiro v3 cujo blob sumiu (órfão) devolve `get === null`
 * e, portanto, `has === false`. NÃO consulta entitlement, NÃO escreve, NÃO faz healing.
 */
export async function hasColoring60SavedDrawing(storyId, activityId) {
  if (!validateIdentity(storyId, activityId)) return false;
  const payload = await getColoring60SavedDrawing(storyId, activityId);
  return payloadHasPaint(payload);
}

/**
 * [C60-PARTE-10] hasColoring60SnapshotRecord(storyId, activityId) — SONDA LEVE: existe REGISTRO de
 * instantâneo recuperável para esta identidade?
 *
 * POR QUE EXISTE (e por que NÃO substitui `hasColoring60SavedDrawing`). Superfícies que só precisam
 * do CONTADOR da jornada (a ponte pós-história, por exemplo) não podem pagar o preço de carregar
 * três imagens em base64 só para descobrir "faltam quantas partes" — seria memória grande e leitura
 * de arquivo numa tela de celebração. Esta sonda lê APENAS o metadado no AsyncStorage:
 *   - ponteiro v3 (arte em arquivo) ⇒ true SEM abrir o arquivo;
 *   - valor inline ⇒ aplica o mesmo critério de tinta real do módulo;
 *   - ausência/erro ⇒ false.
 *
 * LIMITE HONESTO, DECLARADO: por não abrir o arquivo, um ponteiro cujo blob sumiu (órfão) ainda
 * responde `true` aqui. Por isso quem EXIBE a arte (a tela da coleção) continua obrigada a usar
 * `getColoring60SavedDrawing`/`hasColoring60SavedDrawing` — a evidência FORTE, que resolve o
 * ponteiro e devolve ausência honesta. Esta sonda serve a rótulo/roteamento, nunca a desenho.
 * NÃO consulta entitlement, NÃO escreve, NÃO faz healing.
 */
export async function hasColoring60SnapshotRecord(storyId, activityId) {
  if (!validateIdentity(storyId, activityId)) return false;
  try {
    const raw = await AsyncStorage.getItem(keyDrawing60(storyId, activityId));
    if (!raw) return false;
    if (isPointer60(raw)) return true;
    return payloadHasPaint(raw);
  } catch {
    return false;
  }
}

/**
 * clearColoring60SavedDrawing(storyId, activityId) — remove SOMENTE a arte daquela atividade
 * (metadado + blob). METADATA-FIRST: remove a chave e CONFIRMA a ausência ANTES de apagar o blob,
 * preservando a invariante — se a remoção da chave falhar (ou não puder ser confirmada), o blob é
 * PRESERVADO, de modo que a chave remanescente nunca aponte para um arquivo apagado (sem ponteiro
 * órfão; no máximo resíduo físico sem referência). Idempotente; ausência não é erro. NÃO remove
 * conclusão, NÃO remove arte de outra atividade, NÃO toca o namespace legado. Não recebe chave arbitrária.
 */
export async function clearColoring60SavedDrawing(storyId, activityId) {
  if (!validateIdentity(storyId, activityId)) return;
  const k = keyDrawing60(storyId, activityId);

  // 1) Localizar o blob a partir do estado atual. Falha de leitura ⇒ no-op seguro (idempotente).
  let uri = null;
  try {
    uri = pointerUri(await AsyncStorage.getItem(k));
  } catch (e) {
    log('coloring60DrawingStorage.clear.read:', e);
    return;
  }

  // 2) METADATA-FIRST: remover a chave e CONFIRMAR a ausência antes de tocar no blob.
  let removedConfirmed = false;
  try {
    await AsyncStorage.removeItem(k);
    removedConfirmed = (await AsyncStorage.getItem(k)) == null;
  } catch (e) {
    log('coloring60DrawingStorage.clear.remove:', e);
    removedConfirmed = false;
  }

  // 3) Só apagar o blob depois que a chave PROVADAMENTE não o referencia mais. Se o metadado não
  //    pôde ser removido/confirmado, PRESERVA o blob (sem ponteiro órfão).
  if (uri && removedConfirmed) {
    try {
      await deleteBlob(uri, { requireSubdir: BLOB_SUBDIR });
    } catch (e) { log('coloring60DrawingStorage.clear.delblob:', e); }
  }
}
