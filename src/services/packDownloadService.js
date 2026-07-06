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
import * as FileSystem from 'expo-file-system/legacy';
import { PACK_STATUS, getPackLocalDir, getPackTempDir, setPackEntry, getPackEntry } from './packStorageService';
import { validatePackManifest, computeFileSha256 } from './packIntegrityService';
import { fetchGlobalContentManifest, getPackFromGlobalManifest } from './globalManifestService';
import { warn } from '../utils/logger';

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

/** Kinds de mídia conhecidos de um pack (bate com o manifesto por-pack e o resolver). */
const KNOWN_KINDS = ['cover', 'scene', 'coloring', 'audio'];

/** Cede o controle à UI entre etapas pesadas (evita travar o JS thread no verify sha256). */
const yieldToUI = () => new Promise((r) => setTimeout(r, 0));

// F2.5-hardening-3 — cancelamento seguro (sentinela) + timeout de etapa de rede.
const CANCELLED = { __packCancelled: true };
const throwIfCancelled = (isCancelled) => { if (typeof isCancelled === 'function' && isCancelled()) throw CANCELLED; };

/**
 * Executa `runFactory()` com timeout. Em timeout: chama `onTimeout` (ex.: cancelar o download em
 * voo) e rejeita com erro marcado `__timeout`. Sempre limpa o timer. Não toca estado do pack.
 */
async function withTimeout(runFactory, ms, onTimeout) {
  let timer = null;
  try {
    return await Promise.race([
      runFactory(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          try { if (onTimeout) onTimeout(); } catch (_) { /* noop */ }
          const err = new Error('timeout'); err.__timeout = true; reject(err);
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Download GENÉRICO por storyId de um pack (F2.4d.3 → F2.4e.1), descobrindo
 * baseUrl/version/manifestPath pelo MANIFESTO GLOBAL (content-manifest.json) — sem
 * hardcode de história. Substitui o downloader hardcoded de david_goliath como única
 * opção (a função legada `downloadDavidGoliathPackSandbox` segue intacta em paralelo).
 *
 * `requestedKinds` seleciona os tipos a baixar. DEFAULT `['scene']` — preserva o
 * comportamento do F2.4d (só cenas). F2.4e.1: a camada DEV pode pedir
 * `['cover','scene','coloring','audio']`. As mídias NÃO baixadas seguem do bundle
 * (fallback require via contentResolver). Dev-only quando acionado pela tela dev; SEM
 * entitlement/RevenueCat/oferta a usuário final; SEM sha256 real (só bytes+existência).
 *
 * Segurança (fluxo já provado): `.tmp` limpo → baixa manifesto do pack → valida →
 * baixa os arquivos dos kinds pedidos → valida bytes + contagem por kind → move atômico
 * (`.tmp` → localDir) → `setPackEntry ready`. NUNCA marca ready parcial; qualquer falha
 * (inclusive contagem por kind) limpa o `.tmp`, grava status `failed` e mantém o require.
 *
 * @param {{ storyId:string, globalManifestUrl:string, appVersion?:string,
 *   requestedKinds?:string[],
 *   onProgress?:(p:{status:string, kind?:string, downloadedBytes:number, totalBytes:number})=>void }} params
 * @returns {Promise<{ ok:boolean, reason?:string, storyId?:string, version?:string,
 *   kinds?:string[], counts?:object, sceneCount?:number, totalBytes?:number,
 *   requiresAppUpdate?:boolean, entry?:object, errors?:string[] }>}
 */
export async function downloadStoryPackScenesFromGlobalManifest(params = {}) {
  const { storyId, globalManifestUrl, appVersion = '1.0.0', onProgress, requestedKinds = ['scene'],
    isCancelled, manifestTimeoutMs = 15000, fileTimeoutMs = 60000 } = params || {};
  if (!storyId || typeof storyId !== 'string') return { ok: false, reason: 'storyId inválido' };
  if (!globalManifestUrl || typeof globalManifestUrl !== 'string') return { ok: false, reason: 'globalManifestUrl inválido' };
  // Kinds solicitados: só os conhecidos; default scenes-only (compat F2.4d).
  const kinds = Array.isArray(requestedKinds) ? requestedKinds.filter((k) => KNOWN_KINDS.includes(k)) : [];
  if (kinds.length === 0) return { ok: false, reason: 'requestedKinds inválido (use cover/scene/coloring/audio)' };

  const report = (status, extra) => {
    try { if (onProgress) onProgress({ status, downloadedBytes: 0, totalBytes: 0, ...extra }); } catch { /* noop */ }
  };

  // 1) manifesto global + 2) pack por storyId (read-only)
  const gm = await fetchGlobalContentManifest(globalManifestUrl, { appVersion });
  if (!gm.ok) {
    // F2.5-hardening-3: GATE DE REDE — falha de rede/timeout no fetch do manifesto global (já com
    // timeout no globalManifestService) retorna erro LIMPO ANTES de criar .tmp ou tocar o índice.
    const networkError = /rede indispon[ií]vel|timeout/i.test(gm.errors.join(' '));
    return { ok: false, reason: `manifesto global inválido: ${gm.errors.join(' | ')}`, networkError };
  }
  const gp = getPackFromGlobalManifest(gm.data, storyId);
  if (!gp.ok) return { ok: false, reason: gp.errors.join(' | ') };
  const pack = gp.data;

  // 3) requiredAppVersion — não baixa se o app for antigo demais (requires_app_update)
  if (pack.requiresAppUpdate) {
    return { ok: false, requiresAppUpdate: true, reason: `requires_app_update (requiredAppVersion ${pack.requiredAppVersion} > appVersion ${appVersion})` };
  }

  const version = pack.version;
  const localDir = getPackLocalDir(storyId, version);
  const tempDir = getPackTempDir(storyId, version);
  if (!localDir || !tempDir) return { ok: false, reason: 'documentDirectory indisponível' };

  // F2.5-hardening-3: uma tentativa que falha NÃO pode rebaixar um pack já READY que estava
  // funcionando no device. Preserva a entry anterior se for READY (só limpa o .tmp e retorna
  // ok:false); só grava FAILED quando NÃO há READY a preservar. `extra` (ex.: { networkError:true })
  // vai no retorno. Nota: falhas ANTES do swap ocorrem com o localDir antigo intacto → a entry
  // READY anterior é legítima e preservada. Nunca marca ready parcial.
  const failWith = async (reason, errors, extra) => {
    try { await FileSystem.deleteAsync(tempDir, { idempotent: true }); } catch { /* noop */ }
    try {
      const prev = await getPackEntry(storyId);
      if (!(prev && prev.status === PACK_STATUS.READY)) {
        await setPackEntry(storyId, { version, status: PACK_STATUS.FAILED, errorMessage: reason });
      }
    } catch { /* noop */ }
    report(PACK_STATUS.FAILED, {});
    return { ok: false, reason, errors, ...(extra || {}) };
  };

  try {
    throwIfCancelled(isCancelled);
    // retry LIMPO: .tmp sempre recomeça vazio. Subdiretórios são criados por arquivo.
    await FileSystem.deleteAsync(tempDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
    report(PACK_STATUS.DOWNLOADING, {});

    // 4) URL do manifesto por-pack = baseUrl + manifestPath. baseUrl é AUTORITATIVO para o
    //    path (já traz o segmento de versão, ex.: /v1/) — NÃO montamos v1 a partir de version.
    const base = pack.baseUrl; // validado terminando com '/'
    const manifestUrl = `${base}${pack.manifestPath}`;

    // 5) baixa o manifesto por-pack para o .tmp (com TIMEOUT + cancelável — F2.5-hardening-3)
    const mTo = `${tempDir}manifest.json`;
    const mdl = FileSystem.createDownloadResumable(manifestUrl, mTo);
    await withTimeout(() => mdl.downloadAsync(), manifestTimeoutMs, () => { try { mdl.cancelAsync(); } catch (_) { /* noop */ } });
    throwIfCancelled(isCancelled);

    // 5b) manifestSha256 OBRIGATÓRIO (F2.5-hardening-3): verifica os BYTES do manifest.json baixado
    //     contra a âncora do manifesto global — ANTES de confiar no schema e de baixar arquivos.
    //     Ausente/inválido/divergente → rejeita (fallback local intacto; .tmp limpo; nunca ready).
    const expectedManifestSha = typeof pack.manifestSha256 === 'string' ? pack.manifestSha256.toLowerCase() : null;
    if (!expectedManifestSha || !/^[a-f0-9]{64}$/.test(expectedManifestSha)) {
      return failWith('manifestSha256 ausente/inválido no manifesto global (pack remoto rejeitado)');
    }
    const mh = await computeFileSha256(mTo);
    if (!mh.ok) return failWith(`manifest.json: sha256 indisponível (${mh.reason})`);
    if (mh.sha256 !== expectedManifestSha) return failWith('manifest.json com sha256 divergente da âncora (pack remoto rejeitado)');

    let manifest;
    try { manifest = JSON.parse(await FileSystem.readAsStringAsync(mTo)); }
    catch { return failWith('manifest.json do pack inválido (JSON)'); }

    // 6) valida o manifesto por-pack (schema + bytes + sha256 hex + kinds)
    const mv = validatePackManifest(manifest, { appVersion });
    if (!mv.ok) return failWith(`manifesto do pack inválido: ${mv.errors.join(' | ')}`);

    // 7) storyId bate + 8) version do pack bate com a versão do manifesto global
    if (manifest?.metadata?.storyId !== storyId) {
      return failWith(`metadata.storyId (${manifest?.metadata?.storyId}) != storyId solicitado (${storyId})`);
    }
    if (manifest?.version !== version) {
      return failWith(`version do pack (${manifest?.version}) != version global (${version})`);
    }

    // 9) seleciona os arquivos dos KINDS solicitados (path seguro). Default: só 'scene'
    //    (compat F2.4d). F2.4e.1: cover/scene/coloring/audio quando a camada dev pedir.
    const wanted = (manifest.files || []).filter((f) => f && kinds.includes(f.kind)
      && typeof f.path === 'string' && !f.path.startsWith('/') && !f.path.includes('..'));
    if (wanted.length === 0) return failWith(`manifesto do pack sem arquivos dos kinds solicitados (${kinds.join(',')})`);

    // Quantidade esperada por kind, declarada no manifesto. Cada kind pedido precisa existir.
    const expectedPerKind = {};
    for (const f of (manifest.files || [])) {
      if (f && kinds.includes(f.kind)) expectedPerKind[f.kind] = (expectedPerKind[f.kind] || 0) + 1;
    }
    const missingKind = kinds.find((k) => !expectedPerKind[k]);
    if (missingKind) return failWith(`kind solicitado ausente no manifesto: ${missingKind}`);

    const totalBytes = wanted.reduce((a, f) => a + (Number(f.bytes) || 0), 0);

    // 10) baixa cada arquivo → .tmp (garante o subdiretório; progresso por kind + cumulativo)
    //     Progresso de chunk é THROTTLED (~120ms) p/ não inundar a UI com setState.
    let completed = 0;
    const doneByKind = {};
    let lastTick = 0;
    for (const f of wanted) {
      throwIfCancelled(isCancelled); // F2.5-hardening-3: cancelamento antes de cada arquivo
      const to = `${tempDir}${f.path}`;
      const parent = to.slice(0, to.lastIndexOf('/'));
      await FileSystem.makeDirectoryAsync(parent, { intermediates: true }); // idempotente (mkdir -p)
      const dl = FileSystem.createDownloadResumable(`${base}${f.path}`, to, {}, (p) => {
        const now = Date.now();
        if (now - lastTick < 120) return; // throttle: no máx ~8 updates/s durante o chunk
        lastTick = now;
        report(PACK_STATUS.DOWNLOADING, { kind: f.kind, downloadedBytes: completed + (p.totalBytesWritten || 0), totalBytes });
      });
      // F2.5-hardening-3: timeout por arquivo (cancela o download em voo no estouro)
      await withTimeout(() => dl.downloadAsync(), fileTimeoutMs, () => { try { dl.cancelAsync(); } catch (_) { /* noop */ } });
      const info = await FileSystem.getInfoAsync(to, { size: true });
      completed += info.size || 0;
      doneByKind[f.kind] = (doneByKind[f.kind] || 0) + 1;
      report(PACK_STATUS.DOWNLOADING, { kind: f.kind, downloadedBytes: completed, totalBytes }); // 1 por arquivo
    }

    // 11) valida existência + bytes + SHA256 REAL (F2.4e.2) de TODOS os solicitados +
    //     CONTAGEM por kind. Nunca ready parcial: qualquer divergência → failWith.
    throwIfCancelled(isCancelled);
    report(PACK_STATUS.VERIFYING, { downloadedBytes: completed, totalBytes });
    const errors = [];
    const tVerify = Date.now();
    for (const f of wanted) {
      const fileUri = `${tempDir}${f.path}`;
      const info = await FileSystem.getInfoAsync(fileUri, { size: true });
      if (!info.exists) { errors.push(`${f.path}: ausente`); continue; }
      if (typeof f.bytes === 'number' && info.size !== f.bytes) { errors.push(`${f.path}: bytes ${info.size} != ${f.bytes}`); continue; }
      if (f.sha256) {
        const h = await computeFileSha256(fileUri);
        if (!h.ok) errors.push(`${f.path}: sha256 indisponível (${h.reason})`);
        else if (h.sha256 !== String(f.sha256).toLowerCase()) errors.push(`${f.path}: sha256 divergente`);
      }
      await yieldToUI(); // F2.4e.2p: cede a UI entre arquivos (não congela durante o verify)
    }
    if (__DEV__) console.log('[packDownload] verify+sha256:', Date.now() - tVerify, 'ms,', wanted.length, 'arquivos');
    for (const k of kinds) {
      if ((doneByKind[k] || 0) !== expectedPerKind[k]) errors.push(`kind ${k}: ${doneByKind[k] || 0}/${expectedPerKind[k]} baixados`);
    }
    if (errors.length) return failWith(`validação falhou (${errors.length})`, errors);

    throwIfCancelled(isCancelled); // F2.5-hardening-3: ÚLTIMO ponto cancelável — o swap não é cancelável
    // 12) promove .tmp → localDir (troca atômica) — só depois de TUDO validado.
    // F2.5-hardening-2: RE-DOWNLOAD da MESMA versão → localDir já existe; o swap delete→move
    // tem uma janela em que localDir some. Marcar DOWNLOADING ANTES do swap garante que um
    // crash na janela deixe status=DOWNLOADING (≠READY → require), nunca READY falso. Só marca
    // com existência CONFIRMADA (info.exists === true). O stat é SEGURO (try/catch isolado): se
    // getInfoAsync lançar, preExisting=false e o download SEGUE (não derruba download saudável);
    // fresh/bump não têm localDir pré-existente → sem marca (comportamento inalterado).
    let preExisting = false;
    try {
      const info = await FileSystem.getInfoAsync(localDir);
      preExisting = !!(info && info.exists === true);
    } catch { preExisting = false; }
    if (preExisting) {
      await setPackEntry(storyId, { version, status: PACK_STATUS.DOWNLOADING });
    }
    await FileSystem.deleteAsync(localDir, { idempotent: true });
    await FileSystem.moveAsync({ from: tempDir, to: localDir });

    // 13) ready (nunca parcial): só chega aqui com todos os kinds pedidos válidos + move
    const entry = await setPackEntry(storyId, {
      version,
      status: PACK_STATUS.READY,
      localDir,
      manifestPath: `${localDir}manifest.json`,
      totalBytes,
      downloadedBytes: totalBytes,
      errorMessage: null,
    });
    report(PACK_STATUS.READY, { downloadedBytes: totalBytes, totalBytes });

    // 14) resultado estruturado (counts por kind; sceneCount mantido p/ compat)
    return { ok: true, storyId, version, kinds, counts: doneByKind, sceneCount: doneByKind.scene || 0, totalBytes, entry };
  } catch (e) {
    // F2.5-hardening-3: CANCELAMENTO — NÃO grava índice (preserva a entry anterior, seja READY ou
    // qualquer outra); só limpa o .tmp. Ready nunca foi setado; a marca DOWNLOADING do hardening-2
    // fica FORA da janela de cancelamento (após o último throwIfCancelled) → índice consistente.
    if (e === CANCELLED || (e && e.__packCancelled)) {
      try { await FileSystem.deleteAsync(tempDir, { idempotent: true }); } catch (_) { /* noop */ }
      return { ok: false, cancelled: true, reason: 'cancelado' };
    }
    warn('downloadStoryPackScenesFromGlobalManifest:', e);
    // timeout de download → networkError no retorno (erro de rede controlado).
    return failWith(String((e && e.message) || e), undefined, { networkError: !!(e && e.__timeout) });
  }
}
