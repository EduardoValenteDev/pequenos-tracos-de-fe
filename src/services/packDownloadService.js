/**
 * packDownloadService.js — Download/instalação de packs premium (Fase 2, F2.1a — base).
 *
 * PREPARADO para o piloto SANDBOX do F2.1b. NESTE BLOCO: NÃO baixa da internet, NÃO
 * cria pack real, NÃO move/copia assets do app, NÃO toca R2. O fluxo seguro está
 * DESENHADO (tmp → validar → mover atômico → ready); a execução real vem no F2.1b.
 *
 * `markPackReady` é a única operação efetiva aqui — e é só ÍNDICE (AsyncStorage via
 * packStorageService), sem sistema de arquivos.
 */
import { PACK_STATUS, getPackLocalDir, setPackEntry } from './packStorageService';
import { validatePackManifest } from './packIntegrityService';

/** Passos oficiais do fluxo de download (documentação executável). */
export const DOWNLOAD_FLOW = Object.freeze([
  'validar manifesto (schema + minAppVersion)',
  'baixar files → diretório .tmp',
  'validar bytes/sha256 por arquivo e agregado',
  'mover .tmp → documentDirectory/packs/<id>@<version>/ (troca atômica)',
  'gravar índice status=ready (após TUDO validado)',
]);

/**
 * Fluxo de download a partir de um manifesto. F2.1a: NÃO executa (sem rede/R2).
 * Retorna um plano documentado. Valida o manifesto (barato, sem I/O) para já
 * sinalizar manifesto inválido antes de qualquer download futuro.
 * @returns {Promise<{ok:boolean, executed:boolean, reason:string, manifestOk:boolean, plan:string[]}>}
 */
export async function downloadPackFromManifest(manifest, options = {}) {
  const v = validatePackManifest(manifest, { appVersion: options.appVersion });
  return {
    ok: false,
    executed: false,
    manifestOk: v.ok,
    reason: 'F2.1a: download não executado (sem rede/R2). Preparado para o piloto sandbox do F2.1b.',
    plan: DOWNLOAD_FLOW.slice(),
  };
}

/**
 * Instala um pack a partir de um DIRETÓRIO LOCAL (sandbox) — o F2.1b usará isto no
 * lugar de R2. F2.1a: PREPARADO, NÃO executa cópia de arquivos.
 * @returns {Promise<{ok:boolean, executed:boolean, reason:string, sourceDir:string|null, targetDir:string|null}>}
 */
export async function simulateInstallLocalPack(manifest, sourceDir, targetDir, options = {}) {
  return {
    ok: false,
    executed: false,
    reason: 'F2.1a: instalação sandbox não executada. Preparado para o F2.1b (copiar sourceDir → targetDir + validar bytes).',
    sourceDir: sourceDir || null,
    targetDir: targetDir || null,
  };
}

/**
 * Marca um pack como READY no índice (após instalação + validação bem-sucedidas).
 * Operação de ÍNDICE apenas (sem sistema de arquivos). Usada pelo F2.1b ao fim do fluxo.
 * @returns {Promise<object|null>} a CacheEntry salva ou null.
 */
export async function markPackReady(storyId, version, localDir, manifest) {
  if (!storyId || !version) return null;
  const totalBytes = typeof manifest?.totalBytes === 'number' ? manifest.totalBytes : 0;
  const dir = localDir || getPackLocalDir(storyId, version);
  return setPackEntry(storyId, {
    version,
    status: PACK_STATUS.READY,
    localDir: dir,
    manifestPath: dir ? `${dir}manifest.json` : null,
    totalBytes,
    downloadedBytes: totalBytes,
    errorMessage: null,
  });
}
