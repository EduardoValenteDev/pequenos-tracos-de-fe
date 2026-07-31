/**
 * packDownloadDiagnostics — [P3J-R] DIAGNÓSTICO ESTRUTURADO do download de pack.
 *
 * POR QUE EXISTE
 * --------------
 * Na validação física do P3J o download falhou e a única informação disponível era a frase da tela,
 * "Não foi possível baixar. Tentar de novo" — a MESMA para falta de configuração, falta de rede,
 * manifesto inválido, disco cheio ou sha divergente. A causa real (variável de ambiente ausente)
 * ficou invisível por horas. Este módulo dá NOME ao estágio em que a operação morreu.
 *
 * CONTRATO
 * --------
 * · Módulo PURO: sem import, sem I/O, sem estado. `buildDownloadDiagnostic` só monta o objeto.
 * · NUNCA carrega URL, host, token, query string ou qualquer valor de configuração. O diagnóstico
 *   diz que a configuração FALTA (`failureStage: 'config'`), nunca qual seria o valor. `sanitize`
 *   é a rede de segurança: qualquer string com cara de URL/segredo é substituída por marcador.
 * · `logDownloadDiagnostic` só imprime quando `isDev` é verdadeiro — UMA linha por operação
 *   encerrada, nada em produção.
 */

/** Estágios possíveis, do mais cedo ao mais tarde. `none` = a operação terminou bem. */
export const DOWNLOAD_FAILURE_STAGES = Object.freeze([
  'config',     // EXPO_PUBLIC_GLOBAL_MANIFEST_URL ausente/vazia — NÃO tocou a rede
  'resolve',    // manifesto global: rede, JSON, schema, pack ausente, requiresAppUpdate
  'manifest',   // manifesto do pack: download, âncora sha256, schema, storyId/version, colisão
  'filter',     // nenhum arquivo dos kinds pedidos, ou kind pedido ausente no manifesto
  'space',      // espaço em disco insuficiente (precheck)
  'download',   // transferência de um arquivo do pack
  'verify',     // existência, bytes, sha256 ou contagem por kind
  'publish',    // marcador de publicação, swap .tmp→localDir ou gravação do índice
  'cancelled',  // observador cancelou / reset invalidou
  'none',       // sucesso
]);

/** Rede não é observada pelo app (não há dependência de conectividade); só inferimos do resultado. */
export const NETWORK_STATES = Object.freeze([
  'nao_consultada',   // falhou antes de tocar a rede (config)
  'indisponivel',     // o serviço sinalizou networkError
  'alcancada',        // houve resposta do servidor (sucesso ou falha posterior à rede)
  'indeterminado',    // sem sinal suficiente para afirmar
]);

const PARECE_URL = /https?:|:\/\/|\.r2\.dev|\?|token|secret|signature|apikey/i;

/** Marcador do estado de índice quando a operação NÃO chegou a gravar o índice. */
export const INDEX_NOT_COMMITTED = 'nao_commitado';

/**
 * [P3J-R.1] Estado do índice lido da ENTRADA TRANSACIONAL devolvida pelo serviço — não do espelho
 * do contexto React. É o único valor que representa o que ficou PERSISTIDO.
 */
export function indexStateFromEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const status = entry.status;
  return (typeof status === 'string' && status) ? status : null;
}

/**
 * Traduz o resultado do download no estado FINAL do índice.
 *
 * POR QUE NÃO RELER O ÍNDICE PERSISTIDO: em falha, `packDownloadService.failWith` PRESERVA de
 * propósito uma entrada READY anterior (pack antigo continua jogável). Uma releitura devolveria
 * `ready` para uma operação que fracassou — exatamente o item 10 do contrato ("falha antes do
 * commit não pode declarar `ready`").
 *
 * O QUE `res.entry` É, com precisão: a entrada de índice DEVOLVIDA pela operação — recém-commitada
 * no primeiro download, já persistida quando o pack é reutilizado. Nos dois casos ela descreve o
 * que ficou no disco, que é o que o contrato pede. Em falha ela é ignorada por construção: a guarda
 * `res.ok !== true` vem ANTES de qualquer leitura de `entry`.
 */
export function resolveIndexAfterCommit(res) {
  if (!res || res.ok !== true) return INDEX_NOT_COMMITTED;
  return indexStateFromEntry(res.entry) || 'indeterminado';
}

/**
 * Rede de segurança contra vazamento: valores que pareçam URL/segredo viram marcador.
 * Caminhos relativos de arquivo do pack (`scenes/01.webp`) contêm `/` e TAMBÉM seriam capturados,
 * então `failedFile` usa `sanitizePath`, que preserva o caminho e barra só o que tem esquema/host.
 */
export function sanitize(value) {
  if (value == null) return null;
  const s = String(value);
  if (PARECE_URL.test(s)) return '[oculto]';
  return s;
}

/** Caminho relativo dentro do pack é seguro; só barra se trouxer esquema, host ou query. */
export function sanitizePath(value) {
  if (value == null) return null;
  const s = String(value);
  if (/https?:|:\/\/|\?/.test(s)) return '[oculto]';
  return s;
}

function asList(v) {
  if (!Array.isArray(v)) return null;
  return v.filter((x) => typeof x === 'string' && x.length > 0).map((x) => sanitize(x));
}

function asCount(v) {
  return Number.isFinite(v) && v >= 0 ? Math.trunc(v) : null;
}

function asStage(v) {
  return DOWNLOAD_FAILURE_STAGES.includes(v) ? v : 'indeterminado';
}

function asNetwork(v) {
  return NETWORK_STATES.includes(v) ? v : 'indeterminado';
}

/**
 * Monta o diagnóstico com os DOZE campos do contrato, em ordem estável. Os DEZ originais mantêm
 * nome e posição; `indexAfterCommit` e `contextAtEmit` foram acrescentados no fim (P3J-R.1).
 * Entrada tolerante: campo ausente vira `null` (nunca lança, nunca inventa valor).
 *
 * `indexAfter` é ALIAS do valor commitado quando ele existe — o campo histórico passa a dizer a
 * verdade sobre o estado persistido em vez de espelhar o contexto React ainda não re-renderizado.
 */
export function buildDownloadDiagnostic(input = {}) {
  const indexAfterCommit = sanitize(input.indexAfterCommit);
  return {
    storyId: sanitize(input.storyId),
    requestedKinds: asList(input.requestedKinds),
    manifestKinds: asList(input.manifestKinds),
    filteredFileCount: asCount(input.filteredFileCount),
    downloadedFileCount: asCount(input.downloadedFileCount),
    failedFile: sanitizePath(input.failedFile),
    failureStage: asStage(input.failureStage),
    networkState: asNetwork(input.networkState),
    indexBefore: sanitize(input.indexBefore),
    indexAfter: indexAfterCommit != null ? indexAfterCommit : sanitize(input.indexAfter),
    indexAfterCommit,
    contextAtEmit: sanitize(input.contextAtEmit),
  };
}

/**
 * Deriva o estado de rede SEM observador de conectividade: o app não possui dependência capaz de
 * informar isso, então a inferência vem do próprio resultado — e o nome do estado diz que é
 * inferência, não medição.
 */
export function inferNetworkState({ failureStage, networkError, reachedServer }) {
  if (failureStage === 'config') return 'nao_consultada';
  if (networkError) return 'indisponivel';
  if (reachedServer) return 'alcancada';
  return 'indeterminado';
}

/**
 * Imprime UMA linha por operação encerrada, e SÓ em desenvolvimento.
 * `logger` é injetável para teste; por padrão usa `console.log`.
 */
export function logDownloadDiagnostic(diagnostic, options = {}) {
  const isDev = options.isDev === true;
  if (!isDev) return false;
  const logger = typeof options.logger === 'function'
    ? options.logger
    : (typeof console !== 'undefined' && console.log ? console.log.bind(console) : null);
  if (!logger) return false;
  logger('[packDownload][diag]', JSON.stringify(diagnostic));
  return true;
}
