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
 * SOBRESCRITA, RECUPERAÇÃO E GC DIRIGIDO (Spec 019 · bloco S3)
 *
 *   UMA OBRA VISÍVEL POR ATIVIDADE. Cada atividade tem UMA obra ativa. Uma nova conclusão
 *   SUBSTITUI a anterior — não existe histórico de versões no lançamento. O double-buffer A/B
 *   é mecanismo de SEGURANÇA TRANSACIONAL, não uma linha do tempo: a geração inativa nunca é
 *   uma versão acessível, e depois da promoção confirmada ela pode ser removida.
 *
 *   FLUXO OBRIGATÓRIO da sobrescrita, na ordem: (1) ler o ponteiro ativo; (2) escolher o slot
 *   INATIVO; (3) gravar o novo blob; (4) CONFIRMAR que o blob existe e caiu exatamente no slot
 *   pedido, dentro de `drawings60/` (`confirmSlotUri`); (5) montar o novo ponteiro; (6) promover;
 *   (7) reler; (8) CONFIRMAR identidade, URI e revisão do que ficou gravado (`confirmPromotion`);
 *   (9) só então remover a geração anterior; (10) manter o blob novo PROTEGIDO durante a limpeza.
 *   Em qualquer falha: o ponteiro anterior continua válido, o blob anterior permanece, a coleção
 *   continua mostrando a obra anterior, a tentativa devolve falha CONTROLADA e nenhuma atividade
 *   vizinha é afetada.
 *
 *   GC DIRIGIDO (`collectColoring60Orphans`). NÃO existe varredura por prefixo aberto, nem
 *   listagem de diretório, nem GC global no boot. A limpeza é dirigida pela IDENTIDADE
 *   (`storyId` + `activityId`) e só pode considerar: os dois slots canônicos A/B daquela
 *   atividade, o ponteiro ativo validado, arquivos dentro de `drawings60/` e nomes que
 *   correspondam EXATAMENTE à identidade segura. Nunca toca arquivo de outra atividade, de outra
 *   história, do Criar Livre, do `drawingStorage` legado, desconhecido fora do subdiretório, o
 *   blob ativo, o blob anterior antes da promoção confirmada nem um blob protegido pela tentativa
 *   atual. Roda em três momentos apenas: depois de um salvamento bem-sucedido, depois da exclusão
 *   explícita de uma obra e numa reconciliação dirigida de um slot específico. Se o ponteiro ativo
 *   não puder ser lido, o estado é DESCONHECIDO e nada é apagado (fail-closed).
 *
 *   COTA. O orçamento do diretório `drawings60` é de 150 MB — 60 identidades × uma obra ativa
 *   cada, com margem. O orçamento NÃO apaga automaticamente obra válida: não há política LRU,
 *   não há despejo por idade e nenhuma obra antiga é sacrificada para abrir espaço sem ação
 *   parental explícita. Falta de espaço é ERRO REAL DE ESCRITA e vira `WRITE_FAILED`, com a obra
 *   anterior preservada. O stack atual não expõe espaço livre de forma confiável para esta
 *   fronteira, e uma medição inventada seria pior que nenhuma — por isso não existe aqui.
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
  BLOB_DELETE_OUTCOME,
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

/**
 * [Spec 019 · S3] Momentos em que a limpeza dirigida pode rodar — LISTA FECHADA. Não existe um
 * quarto momento, e em especial não existe GC de boot: uma varredura global na abertura do app é
 * exatamente o que esta spec proíbe. `RECONCILE` é a reconciliação DIRIGIDA de um slot específico
 * (uma identidade por vez), nunca um "reconciliar tudo".
 */
export const COLORING60_GC_REASON = Object.freeze({
  AFTER_SAVE: 'after_save',
  AFTER_CLEAR: 'after_clear',
  RECONCILE: 'reconcile',
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

/** Nome de arquivo de uma URI de blob (o trecho após a última barra). Puro, sem I/O. */
function blobFileName(uri) {
  if (typeof uri !== 'string' || !uri) return '';
  return uri.slice(uri.lastIndexOf('/') + 1);
}

/**
 * [Spec 019 · S3 · passo 4] confirmSlotUri(uri, slotName) — o blob recém-gravado está EXATAMENTE
 * onde foi pedido? `writeBlob` já confirma a existência do arquivo antes de retornar; o que falta,
 * e é o que esta função fecha, é a confirmação de ENDEREÇO: o arquivo tem de estar dentro de
 * `drawings60/` e com o nome do slot escolhido. Sem isso, um caminho vindo de outra fronteira
 * (refatoração do helper, subdiretório trocado) seria promovido a ponteiro ativo — e ficaria fora
 * do alcance da limpeza dirigida para sempre, porque nem o GC nem `deleteBlob` podem tocar o que
 * está fora do subdiretório autorizado. Órfão eterno começa aqui, então aqui ele é barrado.
 */
function confirmSlotUri(uri, slotName) {
  if (typeof uri !== 'string' || !uri || typeof slotName !== 'string' || !slotName) return false;
  return uri.endsWith(`/${BLOB_SUBDIR}/${slotName}`);
}

/**
 * [Spec 019 · S3 · passos 7 e 8] confirmPromotion(check, toStore, newUri, expectedRev, safeKey) —
 * o que foi RELIDO da chave é, comprovadamente, o estado que se pretendia promover?
 *
 * A igualdade textual (`check === toStore`) continua sendo a primeira exigência, mas ela sozinha
 * responde "gravou o que mandei", não "o que mandei estava certo". As três confirmações do
 * contrato são explícitas e verificáveis uma a uma:
 *   - IDENTIDADE: o arquivo apontado pertence a um dos dois slots canônicos DESTA identidade
 *     (`safeKey`.a/.b) — nunca ao slot de outra atividade ou de outra história;
 *   - URI: o ponteiro relido referencia exatamente o blob desta tentativa;
 *   - REVISÃO: a `rev` gravada é a `rev` do payload (o casamento pintura ↔ instantâneo).
 * Promoção INLINE (canvas sem tinta) tem contrato próprio: o que ficou gravado NÃO pode ser um
 * ponteiro — senão a chave estaria referenciando um arquivo que esta tentativa não escreveu.
 */
function confirmPromotion(check, toStore, newUris, expectedRev, safeKey) {
  if (typeof toStore !== 'string' || check !== toStore) return false;
  if (!newUris) return !isPointer60(check);
  if (!isPointer60(check)) return false;
  let p;
  try { p = JSON.parse(check); } catch { return false; }
  if (p.v !== POINTER_VERSION) return false;
  if (p.uri !== newUris.legacy) return false;
  if (newUris.logical && p.logicalUri !== newUris.logical) return false;
  const nome = blobFileName(p.uri);
  if (nome !== `${safeKey}.a.png` && nome !== `${safeKey}.b.png`) return false;
  if (newUris.logical) {
    const nomeLogico = blobFileName(p.logicalUri);
    if (nomeLogico !== nome.replace(/\.png$/, '.logical.png')) return false;
  }
  return (p.rev ?? null) === (expectedRev ?? null);
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

/** URIs vivas; ponteiro v3 anterior, sem `logicalUri`, continua retornando só `uri`. */
function pointerUris(value) {
  if (!isPointer60(value)) return [];
  try {
    const p = JSON.parse(value);
    return [p.uri, p.logicalUri].filter((uri, i, all) =>
      typeof uri === 'string' && uri && all.indexOf(uri) === i);
  } catch { return []; }
}

/**
 * [Fase 6 · F6-SG-A · CASO 17 / TK-A-079] CAMPOS LÓGICOS DO PAYLOAD — atravessam o ponteiro.
 *
 * O motor (`ColoringCanvas.exportPaint`) emite quatro campos que não são nem envelope nem
 * geometria de exibição: `paintSchemaVersion` (QUE CAMPOS o payload tem), `layoutVersion` (O QUE
 * as coordenadas significam) e o par `logicalW`/`logicalH` (o espaço lógico em que o bitmap foi
 * escrito, 1:1). Até aqui a whitelist do envelope enumerava só nove campos, e os quatro morriam
 * na ida ao disco — o payload voltava do ponteiro SEM os eixos que ele mesmo declarara. O efeito
 * observável era exatamente o do `CASO 11`: obra gravada pelo formato de hoje reabrindo pelo ramo
 * `v2-legado`, e `TK-A-079` — que exige abrir uma obra COM os dois eixos — sem estado físico
 * capaz de satisfazê-lo.
 *
 * Três regras que este bloco preserva, e que valem para as duas direções:
 *   1. cada campo é copiado PELO PRÓPRIO NOME, um por vez. Nenhum é deduzido de outro, do
 *      envelope (`v`/`fmt`/`uri`) ou da geometria (§11.5.3 regra 5 · `G-VER-3` · `MT-29`);
 *   2. campo AUSENTE continua ausente — nunca vira `null` escrito nem valor inventado. Ausência
 *      de `paintSchemaVersion` significa payload legado, ausência de `layoutVersion` significa
 *      geometria legada, e as duas ausências são INDEPENDENTES (`TK-A-002`);
 *   3. só o SAVE seguinte escreve o formato novo (write-forward, `Q8` r.8). Ler não promove,
 *      não migra e não regrava: um ponteiro legado resolve HOJE nos mesmos bytes de ontem,
 *      porque nada é acrescentado quando nada foi persistido.
 *
 * `POINTER_VERSION` NÃO muda: o acréscimo é estritamente aditivo, `isPointer60` e
 * `confirmPromotion` só testam `v === POINTER_VERSION` e a URI, e o contrato canônico congela
 * o eixo do envelope em 3 (`G-VER-2` · `TK-A-005`; subir para 4 é o mutante `MT-28`).
 */
const LOGICAL_SCHEMA_FIELDS = ['paintSchemaVersion', 'layoutVersion', 'logicalW', 'logicalH'];

/** Copia para `target` cada campo lógico PRESENTE em `source`, um a um. Devolve `target`. */
function carryLogicalSchema(source, target) {
  if (!source || typeof source !== 'object') return target;
  for (const nome of LOGICAL_SCHEMA_FIELDS) {
    const valor = source[nome];
    if (valor !== undefined && valor !== null) target[nome] = valor;
  }
  return target;
}

/**
 * writeSlot(slotName, payload, protectUri) — grava o blob grande no slot informado (INATIVO) e
 * monta o ponteiro v3. Retorna `{ ptr, uri }` em sucesso, ou `null` em falha — limpando qualquer
 * arquivo parcial NO SLOT INATIVO (nunca toca o slot ativo/anterior).
 *
 * `protectUri` é o blob ANTERIOR. O compensatório de falha é a única exclusão do writer que roda
 * sem ter lido o resultado da gravação, e por isso ele entrega o anterior como PROTEGIDO à
 * contenção: assim, mesmo que o slot calculado coincidisse com o ativo, a limpeza de um arquivo
 * parcial seria RECUSADA em vez de custar a obra que já estava salva.
 */
async function writeSlot(slotName, payload, protectUri) {
  let fmt;
  let dataUrl;
  let layout = null;
  let legacyDataUrl = null;
  let legacyLayout = null;

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
    // Os campos LÓGICOS do payload sobem junto, cada um pelo seu nome e só quando existem.
    carryLogicalSchema(p, layout);
    if (typeof p.legacyData === 'string' && p.legacyData.startsWith('data:image/')) {
      legacyDataUrl = p.legacyData;
      legacyLayout = {
        W: p.legacyW ?? null, H: p.legacyH ?? null,
        imgX: p.legacyImgX ?? null, imgY: p.legacyImgY ?? null,
        imgW: p.legacyImgW ?? null, imgH: p.legacyImgH ?? null,
      };
    }
  }

  const mime = dataUrlMime(dataUrl, 'image/png');
  // Chamadores/payloads anteriores continuam no contrato de uma URI. Só o export
  // atual, que declara `legacyData`, ativa a transação dual do Caso 13.
  if (!legacyDataUrl) {
    const writtenSingle = await writeBlob(BLOB_SUBDIR, slotName, dataUrl, mime);
    if (!writtenSingle) {
      const root = currentBlobsRoot();
      if (root) {
        await deleteBlob(`${root}${BLOB_SUBDIR}/${slotName}`, {
          requireSubdir: BLOB_SUBDIR,
          protect: protectUri || undefined,
        });
      }
      return null;
    }
    const ptrSingle = { v: POINTER_VERSION, fmt, uri: writtenSingle.uri, mime };
    if (layout) Object.assign(ptrSingle, layout);
    return {
      ptr: JSON.stringify(ptrSingle), uri: writtenSingle.uri,
      logicalUri: null, rev: layout ? (layout.rev ?? null) : null,
    };
  }
  const legacyMime = dataUrlMime(legacyDataUrl, 'image/png');
  const logicalSlot = slotName.replace(/\.png$/, '.logical.png');
  const writtenLegacy = await writeBlob(BLOB_SUBDIR, slotName, legacyDataUrl, legacyMime);
  if (!writtenLegacy) {
    const root = currentBlobsRoot();
    if (root) {
      await deleteBlob(`${root}${BLOB_SUBDIR}/${slotName}`, {
        requireSubdir: BLOB_SUBDIR, protect: protectUri || undefined,
      });
    }
    return null;
  }
  const written = await writeBlob(BLOB_SUBDIR, logicalSlot, dataUrl, mime);
  if (!written) {
    // Compensatório: remove qualquer arquivo parcial no slot inativo (seguro: nunca é o ativo).
    // O subdiretório é FIXADO no alvo: mesmo montado a partir da raiz atual, nada fora de
    // `ptf_blobs/drawings60/` pode ser atingido por esta limpeza.
    const root = currentBlobsRoot();
    if (root) {
      await deleteBlob(`${root}${BLOB_SUBDIR}/${slotName}`, {
        requireSubdir: BLOB_SUBDIR,
        protect: protectUri || undefined,
      });
      await deleteBlob(`${root}${BLOB_SUBDIR}/${logicalSlot}`, {
        requireSubdir: BLOB_SUBDIR,
        protect: protectUri || undefined,
      });
    }
    return null;
  }

  // Releitura dos DOIS bytes antes de tornar qualquer ponteiro visível.
  const [legacyCheck, logicalCheck] = await Promise.all([
    readBlobAsDataUrl(writtenLegacy.uri, legacyMime),
    readBlobAsDataUrl(written.uri, mime),
  ]);
  if (legacyCheck !== legacyDataUrl || logicalCheck !== dataUrl) {
    await deleteBlob(writtenLegacy.uri, { requireSubdir: BLOB_SUBDIR, protect: protectUri || undefined });
    await deleteBlob(written.uri, { requireSubdir: BLOB_SUBDIR, protect: protectUri || undefined });
    return null;
  }

  const ptr = {
    v: POINTER_VERSION, fmt,
    uri: writtenLegacy.uri, mime: legacyMime,
    logicalUri: written.uri, logicalMime: mime,
  };
  if (legacyLayout) Object.assign(ptr, legacyLayout);
  if (layout) {
    Object.assign(ptr, {
      rev: layout.rev, paintedPx: layout.paintedPx, paintablePx: layout.paintablePx,
    });
    carryLogicalSchema(layout, ptr);
  }
  // `rev` sobe junto para que a CONFIRMAÇÃO da promoção (passo 8) possa conferir a revisão sem
  // reparsear o payload original — a mesma revisão que casa pintura ↔ instantâneo.
  return {
    ptr: JSON.stringify(ptr), uri: writtenLegacy.uri, logicalUri: written.uri,
    rev: layout ? (layout.rev ?? null) : null,
  };
}

/** Reconstrói o payload original (v1 data URL ou v2 JSON) a partir do ponteiro v3. */
async function resolvePointer60(value) {
  let p;
  try { p = JSON.parse(value); } catch { return null; }
  const useLogical = typeof p.logicalUri === 'string' && p.logicalUri;
  const dataUrl = await readBlobAsDataUrl(
    useLogical ? p.logicalUri : p.uri,
    useLogical ? (p.logicalMime || p.mime || 'image/png') : (p.mime || 'image/png'),
  );
  if (!dataUrl) return null; // ponteiro órfão (arquivo sumiu): ausência honesta
  if (p.fmt === 2) {
    // A medida da tinta volta EXATAMENTE como foi gravada (C60 · Parte 4). Ponteiros antigos, sem
    // esses campos, devolvem `null` — e `coloring60PaintMetrics` trata ausência de medida como
    // "não comprovado", nunca como "tem cor". Nenhum leitor antigo quebra: `v` continua 2.
    const restored = {
      v: 2,
      W: useLogical ? (p.logicalW ?? p.W ?? null) : (p.W ?? null),
      H: useLogical ? (p.logicalH ?? p.H ?? null) : (p.H ?? null),
      imgX: useLogical ? 0 : (p.imgX ?? null),
      imgY: useLogical ? 0 : (p.imgY ?? null),
      imgW: useLogical ? (p.logicalW ?? p.imgW ?? null) : (p.imgW ?? null),
      imgH: useLogical ? (p.logicalH ?? p.imgH ?? null) : (p.imgH ?? null),
      rev: p.rev ?? null,
      paintedPx: p.paintedPx ?? null,
      paintablePx: p.paintablePx ?? null,
      data: dataUrl,
    };
    // Os campos LÓGICOS voltam PELO NOME, e SÓ os que foram persistidos. Ponteiro sem eles
    // resolve exatamente nos mesmos bytes de antes desta correção — ler não promove nada.
    carryLogicalSchema(p, restored);
    return JSON.stringify(restored);
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
async function rollbackFailedPromotion(k, oldRaw, newUris) {
  // 1) Restaurar o metadado anterior — melhor-esforço, jamais antes de decidir sobre o blob novo.
  try {
    if (oldRaw != null) await AsyncStorage.setItem(k, oldRaw);
    else await AsyncStorage.removeItem(k);
  } catch (e) {
    log('coloring60DrawingStorage.rollback.meta:', e);
  }
  if (!newUris) return; // promoção inline (sem blob novo): nada a descartar.

  // 2) Reler a chave e decidir com segurança. `readable === false` ⇒ estado desconhecido.
  let current;
  let readable = true;
  try {
    current = await AsyncStorage.getItem(k);
  } catch {
    readable = false;
  }
  const refsAtuais = readable ? pointerUris(current) : [];

  // 3) Só descarta o blob novo com CONFIRMAÇÃO de que nenhuma chave o referencia; senão, preserva.
  if (readable) {
    for (const newUri of newUris) {
      if (refsAtuais.includes(newUri)) continue;
      try {
        await deleteBlob(newUri, { requireSubdir: BLOB_SUBDIR });
      } catch (e) { log('coloring60DrawingStorage.rollback.delnew:', e); }
    }
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
    // [S3 · passo 1] Ler o ponteiro ativo. Esta leitura é FAIL-CLOSED e não admite degradação:
    // "não havia obra" e "não foi possível saber se havia obra" são estados DIFERENTES, e tratar o
    // segundo como o primeiro é destrutivo. Sem ponteiro conhecido, `otherSlotName` elegeria
    // `.a.png` — que pode ser exatamente o slot que a chave ilegível referencia — e a gravação
    // cairia POR CIMA da obra viva; o compensatório apagaria o que sobrou; e o rollback, lendo o
    // mesmo `null`, removeria uma chave VÁLIDA. Sem saber qual é o slot ativo não existe slot
    // INATIVO, e sem slot inativo não existe double buffer. A tentativa morre AQUI, antes de
    // qualquer escrita: ponteiro anterior válido, blob anterior intacto, coleção inalterada e
    // falha controlada de volta. É a mesma disciplina do GC, que recusa limpar quando não
    // consegue ler o ativo (`skipped: 'unknown_active'`) — o writer não pode ser mais frouxo com
    // a obra da criança do que a rotina de limpeza.
    let oldRaw = null;
    try {
      oldRaw = await AsyncStorage.getItem(k);
    } catch (e) {
      log('coloring60DrawingStorage.save.ativoIlegivel:', e);
      return COLORING60_SAVE_RESULT.WRITE_FAILED;
    }
    // Daqui para baixo `oldRaw == null` significa, comprovadamente, AUSÊNCIA de estado anterior —
    // nunca desconhecimento. É essa garantia que autoriza o rollback a remover a chave.
    const oldUris = pointerUris(oldRaw);
    const oldUri = oldUris[0] || null;

    let toStore = payload;
    let newUri = null;
    let newLogicalUri = null;
    let expectedRev = null;

    if (payloadHasPaint(payload)) {
      const slot = otherSlotName(safeKey, oldUri); // slot INATIVO
      const built = await writeSlot(slot, payload, oldUris);
      // [S3 · passo 4] Falha ao escrever OU blob fora do slot/subdiretório pedidos: em ambos os
      // casos a tentativa morre AQUI, antes de qualquer promoção — o anterior fica intocado
      // (preservado) e nenhum ponteiro passa a referenciar um arquivo que não é desta identidade.
      if (!built
        || !confirmSlotUri(built.uri, slot)
        || (built.logicalUri
          && !confirmSlotUri(built.logicalUri, slot.replace(/\.png$/, '.logical.png')))) {
        if (built && built.uri) {
          // Compensatório: o arquivo estranho é oferecido à contenção — que o recusa se estiver
          // fora de `drawings60/`. O blob ANTERIOR entra como protegido: uma escrita malsucedida
          // jamais pode custar a obra que já estava salva.
          try {
            await deleteBlob(built.uri, {
              requireSubdir: BLOB_SUBDIR,
              protect: oldUris.length ? oldUris : undefined,
            });
          } catch (e) { log('coloring60DrawingStorage.save.slotForaDaIdentidade:', e); }
          if (built.logicalUri) {
            try {
              await deleteBlob(built.logicalUri, {
                requireSubdir: BLOB_SUBDIR,
                protect: oldUris.length ? oldUris : undefined,
              });
            } catch (e) { log('coloring60DrawingStorage.save.slotLogicoForaDaIdentidade:', e); }
          }
        }
        return COLORING60_SAVE_RESULT.WRITE_FAILED;
      }
      toStore = built.ptr;
      newUri = built.uri;
      newLogicalUri = built.logicalUri;
      expectedRev = built.rev;
    }

    // Promover: o ponteiro/valor no AsyncStorage passa a referenciar o novo estado. Uma rejeição
    // de setItem NÃO garante que nada foi gravado — o rollback relê a chave e decide com segurança
    // (nunca apaga o blob novo enquanto a chave puder referenciá-lo).
    try {
      await AsyncStorage.setItem(k, toStore);
    } catch (e) {
      log('coloring60DrawingStorage.save.setItem:', e);
      await rollbackFailedPromotion(k, oldRaw, newUri ? [newUri, newLogicalUri].filter(Boolean) : null);
      return COLORING60_SAVE_RESULT.WRITE_FAILED;
    }

    // Verificar: confirma que ficou gravado exatamente o que se pretendia.
    let check;
    try {
      check = await AsyncStorage.getItem(k);
    } catch (e) {
      check = undefined;
    }
    // [S3 · passo 8] A releitura não basta: ela precisa CONFIRMAR identidade, URI e revisão.
    if (!confirmPromotion(
      check, toStore,
      newUri ? { legacy: newUri, logical: newLogicalUri } : null,
      expectedRev, safeKey,
    )) {
      // Verificação divergiu: desfazer preservando a invariante (restaura o anterior e só descarta
      // o blob novo se a chave comprovadamente não o referencia mais).
      await rollbackFailedPromotion(k, oldRaw, newUri ? [newUri, newLogicalUri].filter(Boolean) : null);
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
    for (const old of oldUris) {
      if (old === newUri || old === newLogicalUri) continue;
      try {
        await deleteBlob(old, {
          requireSubdir: BLOB_SUBDIR,
          protect: [newUri, newLogicalUri].filter(Boolean),
        });
      } catch (e) { log('coloring60DrawingStorage.save.cleanupOld:', e); }
    }

    // [S3] GC DIRIGIDO, no único momento em que ele é barato e seguro: a geração nova já está
    // promovida e CONFIRMADA, então o que sobrar no slot inativo desta MESMA identidade é órfão —
    // resíduo de uma tentativa anterior que morreu entre a escrita e a promoção. Sem isto, o fluxo
    // normal (pintar, sair, repintar) acumularia arquivos sem ponteiro indefinidamente. É
    // best-effort: nada aqui pode desfazer um `saved` já conquistado.
    try {
      await collectColoring60Orphans(storyId, activityId, {
        reason: COLORING60_GC_REASON.AFTER_SAVE,
        protect: [newUri, newLogicalUri].filter(Boolean),
      });
    } catch (e) { log('coloring60DrawingStorage.save.gc:', e); }

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
  let uris = [];
  try {
    uris = pointerUris(await AsyncStorage.getItem(k));
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
  if (removedConfirmed) {
    for (const uri of uris) {
      try {
        await deleteBlob(uri, { requireSubdir: BLOB_SUBDIR });
      } catch (e) { log('coloring60DrawingStorage.clear.delblob:', e); }
    }
  }

  // [S3] Exclusão explícita é o segundo momento autorizado do GC dirigido. A chave já não existe,
  // então NENHUM dos dois slots desta identidade tem referência viva: o que restar é resíduo, e
  // varrê-lo aqui é o que impede que uma exclusão deixe arquivo para trás. Só roda com a remoção
  // da chave CONFIRMADA — enquanto a chave puder existir, o blob que ela referencia é intocável.
  if (removedConfirmed) {
    try {
      await collectColoring60Orphans(storyId, activityId, {
        reason: COLORING60_GC_REASON.AFTER_CLEAR,
      });
    } catch (e) { log('coloring60DrawingStorage.clear.gc:', e); }
  }
}

/**
 * [Spec 019 · S3] collectColoring60Orphans(storyId, activityId, options) — LIMPEZA DIRIGIDA pela
 * identidade. Remove a geração INATIVA que ficou sem referência, e nada além disso.
 *
 * O QUE ELA NÃO É. Não é varredura: não lista diretório, não usa prefixo, não consulta
 * `getAllKeys`, não percorre o catálogo e não roda no boot. O universo de candidatos é fechado e
 * tem no máximo DOIS elementos — os slots canônicos `<safeKey>.a.png` e `<safeKey>.b.png` desta
 * identidade — e encolhe para UM quando existe ponteiro ativo reconhecível, porque aí o slot ativo
 * sequer é nomeado. Arquivo de outra atividade, de outra história, do Criar Livre, do
 * `drawingStorage` legado ou desconhecido nunca entra na lista; e `deleteBlob` ainda julga cada
 * alvo com `requireSubdir` e `protect`, de modo que mesmo um nome montado errado seria RECUSADO
 * pela contenção antes de tocar o disco.
 *
 * FAIL-CLOSED. Sem identidade válida, sem raiz de blobs ou sem conseguir LER o ponteiro ativo,
 * nada é apagado: um GC que não sabe qual é a obra viva não tem o direito de apagar nada.
 *
 * Devolve um RELATÓRIO estruturado (`examined`/`removed`/`kept`/`refused`/`failed`/`skipped`) —
 * limpeza silenciosa é indistinguível de limpeza que não aconteceu.
 */
export async function collectColoring60Orphans(storyId, activityId, options = {}) {
  const opcoes = options && typeof options === 'object' ? options : {};
  const relatorio = {
    storyId: typeof storyId === 'string' ? storyId : null,
    activityId: typeof activityId === 'string' ? activityId : null,
    reason: typeof opcoes.reason === 'string' ? opcoes.reason : COLORING60_GC_REASON.RECONCILE,
    examined: 0,
    removed: [],
    kept: [],
    refused: 0,
    failed: 0,
    skipped: null,
  };

  if (!validateIdentity(storyId, activityId)) {
    relatorio.skipped = 'invalid_identity';
    return relatorio;
  }
  const raizAtual = currentBlobsRoot();
  if (typeof raizAtual !== 'string' || !raizAtual) {
    relatorio.skipped = 'no_root';
    return relatorio;
  }

  const kAlvo = keyDrawing60(storyId, activityId);
  const safeAlvo = safeName(kAlvo);

  // Ponteiro ATIVO — a única referência que decide o que é órfão. Ilegível ⇒ estado DESCONHECIDO.
  let ativoRaw;
  try {
    ativoRaw = await AsyncStorage.getItem(kAlvo);
  } catch (e) {
    log('coloring60DrawingStorage.gc.read:', e);
    relatorio.skipped = 'unknown_active';
    return relatorio;
  }
  const ativas = pointerUris(ativoRaw);

  // Universo FECHADO de candidatos: os DOIS slots canônicos desta identidade, e nada mais. Quando
  // o ponteiro ativo é um deles, esse é EXCLUÍDO da lista antes de qualquer I/O — a obra viva
  // sequer chega a ser nomeada. Quando o estado ativo não é nenhum dos dois (payload inline, ou
  // ponteiro para fora do subdiretório), nenhum dos dois está referenciado e ambos são candidatos.
  const slots = [
    `${safeAlvo}.a.png`, `${safeAlvo}.a.logical.png`,
    `${safeAlvo}.b.png`, `${safeAlvo}.b.logical.png`,
  ];
  const nomesAtivos = ativas.map(blobFileName);
  const nomes = slots.filter((n) => !nomesAtivos.includes(n));

  // Blindagem estrutural adicional (comparada já recomposta e normalizada por `deleteBlob`):
  // a obra ativa e o blob da tentativa atual não podem ser atingidos nem por engano de nome.
  // `protect` aceita string OU lista, como a própria contenção — uma opção que parece legítima e
  // é silenciosamente ignorada seria uma armadilha: o chamador acreditaria ter blindado um blob
  // que na verdade entrou no universo de candidatos.
  const protegidas = [];
  for (const ativoUri of ativas) {
    protegidas.push(ativoUri);
    relatorio.kept.push(ativoUri);
  }
  const pedidas = Array.isArray(opcoes.protect) ? opcoes.protect : [opcoes.protect];
  for (const p of pedidas) if (typeof p === 'string' && p) protegidas.push(p);

  for (const nome of nomes) {
    const alvo = `${raizAtual}${BLOB_SUBDIR}/${nome}`;
    relatorio.examined += 1;
    let desfecho = null;
    try {
      desfecho = await deleteBlob(alvo, {
        requireSubdir: BLOB_SUBDIR,
        protect: protegidas.length ? protegidas : undefined,
      });
    } catch (e) {
      log('coloring60DrawingStorage.gc.delete:', e);
      relatorio.failed += 1;
      continue;
    }
    const out = desfecho && desfecho.outcome;
    if (out === BLOB_DELETE_OUTCOME.DELETED) relatorio.removed.push(alvo);
    else if (out === BLOB_DELETE_OUTCOME.REFUSED) relatorio.refused += 1;
    else if (out === BLOB_DELETE_OUTCOME.FAILED) relatorio.failed += 1;
  }

  return relatorio;
}
