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
import { isReadyEntryValid } from './packReconcileService';
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

// F2.5-hardening-2b.i — margem de espaço aprovada: max(20% da estimativa, 20 MB). PURO/testável
// (sem I/O). Estimativa 0/inválida → piso de 20 MB. Usado no precheck ANTES do download pesado.
const SPACE_MARGIN_FLOOR_BYTES = 20 * 1024 * 1024; // 20 MB
function spaceNeededBytes(estimateBytes) {
  const e = Number.isFinite(estimateBytes) && estimateBytes > 0 ? estimateBytes : 0;
  return e + Math.max(Math.ceil(e * 0.2), SPACE_MARGIN_FLOOR_BYTES);
}

/**
 * Chave canônica da instalação.
 *
 * A VERSÃO não entra: ela só é conhecida DEPOIS de buscar o manifesto — mas é função de
 * (manifesto, storyId, appVersion), então duas chamadas com a mesma chave resolvem
 * necessariamente a mesma versão. Manifesto ou appVersion diferentes → chaves diferentes →
 * não compartilham (é assim que versões/manifestos incompatíveis ficam separados).
 * `requestedKinds` entra normalizado e ordenado: quem pediu o pack completo não pode receber a
 * operação de quem pediu só cenas.
 */
export function packInstallKey(params = {}) {
  const { storyId, globalManifestUrl, appVersion = '1.0.0', requestedKinds = ['scene'] } = params || {};
  const kinds = (Array.isArray(requestedKinds) ? requestedKinds : [])
    .filter((k) => KNOWN_KINDS.includes(k))
    .slice()
    .sort();
  return [String(storyId || ''), String(globalManifestUrl || ''), String(appVersion || ''), kinds.join(',')].join('|');
}

/* ═══════════════ Seam de injeção (LP2.1a-ii-A) ═══════════════ */
/*
 * UMA implementação do algoritmo, usada por produção E por teste. A factory recebe as
 * dependências explicitamente; `defaultService` (abaixo) é criado com as REAIS e os exports
 * públicos delegam a ele — nenhum call site muda.
 *
 * Por que factory e não um módulo com imports diretos: os mapas de single-flight e a fila física
 * precisam ser POR INSTÂNCIA. Em escopo de módulo, dois cenários de teste compartilhariam voos e
 * filas (um contaminaria o outro) e não haveria como provar o isolamento.
 *
 * A desestruturação abaixo SOMBREIA os imports do módulo dentro de todo o corpo da factory — por
 * isso o algoritmo permanece byte-idêntico ao anterior, sem renomeações.
 *
 * Não há flag de teste, global ou monkey patch: quem quiser doubles chama a factory.
 */
const REQUIRED_DEPS = Object.freeze([
  'FileSystem', 'PACK_STATUS', 'getPackLocalDir', 'getPackTempDir', 'setPackEntry', 'getPackEntry',
  'isReadyEntryValid', 'validatePackManifest', 'computeFileSha256', 'fetchGlobalContentManifest',
  'getPackFromGlobalManifest', 'warn',
]);

export function createPackDownloadService(deps) {
  // Dependência ausente falha AQUI, alto e claro — nunca vira `undefined is not a function`
  // no meio de um download (nenhuma dep é opcional em silêncio).
  if (!deps || typeof deps !== 'object') throw new Error('createPackDownloadService: deps obrigatório');
  const missing = REQUIRED_DEPS.filter((k) => deps[k] == null);
  if (missing.length) throw new Error(`createPackDownloadService: dependências ausentes: ${missing.join(', ')}`);

  const {
    FileSystem, PACK_STATUS, getPackLocalDir, getPackTempDir, setPackEntry, getPackEntry,
    isReadyEntryValid, validatePackManifest, computeFileSha256, fetchGlobalContentManifest,
    getPackFromGlobalManifest, warn,
  } = deps;

/**
 * Casca de disco do downloader: o `localDir` existe? e o `manifest.json` dentro dele?
 *
 * Mesmo CONTRATO da casca do PacksContext (`probePackDisk`) — de propósito: a DECISÃO é a mesma
 * função pura (`isReadyEntryValid`), então UI e downloader nunca discordam sobre o que é um pack
 * instalado. A casca é duplicada porque o núcleo de reconciliação é PURO (sem I/O) e o
 * packStorageService é protegido (F2.5-hardening-2 exige que ele fique sem essa lógica);
 * `failWith` também não pode depender de React/PacksContext.
 *
 * `localDir` ausente/vazio → `{false,false}` SEM I/O (ausência de caminho é evidência conclusiva).
 * `getInfoAsync` lançando → `{null,null}` = INDETERMINADO → o núcleo é conservador (preserva).
 * Nunca lança.
 */
async function probeInstalledPackDisk(localDir) {
  if (!localDir) return { localDirExists: false, manifestExists: false };
  try {
    const d = await FileSystem.getInfoAsync(localDir);
    if (!d || !d.exists) return { localDirExists: false, manifestExists: false };
    const m = await FileSystem.getInfoAsync(`${localDir}manifest.json`);
    return { localDirExists: true, manifestExists: !!(m && m.exists) };
  } catch (e) {
    return { localDirExists: null, manifestExists: null };
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
async function downloadStoryPackScenesFromGlobalManifestImpl(params = {}) {
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
      const prev = await getPackEntry(storyId);   // índice CRU (a reconciliação do contexto é só em memória)
      // LP2.1a-iR2: só preserva um READY anterior com EVIDÊNCIA de disco. Preservar por status
      // deixava um `ready` inválido (sem localDir, ou sem diretório/manifest.json) persistido como
      // READY e impedia registrar a falha. A decisão usa a MESMA regra da reconciliação
      // (isReadyEntryValid) — não uma regra paralela; só a casca de I/O é do storage.
      // Probe INDETERMINADO (getInfoAsync lançou) → conservador: preserva (não destrói uma
      // instalação possivelmente válida por causa de um erro transitório de FS).
      const isReadyPrev = !!prev && prev.status === PACK_STATUS.READY;
      // O `localDir` PERSISTIDO não é confiável: no iOS o container muda de UUID entre
      // updates/restores, então o file:// absoluto gravado fica inválido. O boundary de leitura
      // do app recompõe por (storyId, version) — F2.5-hardening-1 C3, mesma regra do
      // PacksContext (normalizedIndex). Sondar o caminho CRU aqui rebaixaria para FAILED um
      // READY que está VÁLIDO no disco (falso-negativo). Sem version → cai no cru.
      const prevDir = (isReadyPrev && prev.version)
        ? (getPackLocalDir(prev.storyId || storyId, prev.version) || prev.localDir)
        : (prev && prev.localDir) || null;
      const probe = isReadyPrev ? await probeInstalledPackDisk(prevDir) : null;
      const preservable = isReadyPrev && isReadyEntryValid(prev, probe);
      if (!preservable) {
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

    // F2.5-hardening-2b.i: PRECHECK DE ESPAÇO — antes do download PESADO. Estimativa = totalBytes
    // (Σ wanted[].bytes: preciso por requestedKinds → parcial NÃO sofre falso bloqueio; NÃO usa
    // pack.bytes cego). API SEGURA: só chama getFreeDiskStorageAsync se for função; se lançar/
    // retornar não-número → PROSSEGUE (o fail-safe de ENOSPC no download cobre o caso real). Abort
    // reusa failWith → limpa .tmp, preserva READY anterior, sem baixar arquivos pesados.
    const neededBytes = spaceNeededBytes(totalBytes);
    let freeBytes = null;
    if (typeof FileSystem.getFreeDiskStorageAsync === 'function') {
      try { freeBytes = await FileSystem.getFreeDiskStorageAsync(); } catch (_) { freeBytes = null; }
    }
    if (typeof freeBytes === 'number' && freeBytes < neededBytes) {
      return failWith('insufficient_space');
    }

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

/* ───────────────── Single-flight por identidade de pack (LP2 / PK-01) ───────────────── */
/*
 * Antes, a única trava era o `busyRef` do hook — por INSTÂNCIA. Duas telas pedindo a mesma
 * história abriam DUAS instalações físicas que calculam o MESMO `.tmp`
 * (packs/.tmp/<id>@<version>/): a primeira coisa que o fluxo faz é limpar esse diretório, então
 * uma destruía o download da outra. Agora a operação é compartilhada por chave canônica.
 */
const inFlightInstalls = new Map();


/** Só para teste/diagnóstico: quantas instalações físicas estão em voo NESTA instância. */
  function inFlightInstallCount() {
    return inFlightInstalls.size;
  }

/* ── Exclusão pelo RECURSO FÍSICO (não pela chave do pedido) ── */
/*
 * A chave canônica serve para COMPARTILHAR o resultado, e inclui `requestedKinds`. Mas o recurso
 * que o fluxo destrói e publica — `.tmp` e `localDir` — deriva de storyId@version, SEM kinds.
 * Logo, duas chamadas da MESMA história com kinds diferentes têm chaves diferentes, não
 * compartilham e cairiam no MESMO `.tmp`, uma apagando o download da outra (o fluxo começa
 * limpando o `.tmp`). A fila abaixo garante que só exista UMA execução física por história de
 * cada vez — inclusive para o chamador com `isCancelled`, que não entra no mapa de compartilhamento.
 */
const storyInstallChains = new Map();

function runExclusiveByStory(storyId, task) {
  const key = String(storyId || '');
  const prev = storyInstallChains.get(key) || Promise.resolve();
  const run = prev.then(task);
  // A corrente nunca carrega rejeição: uma instalação que falha não trava a próxima da mesma história.
  const settled = run.then(() => undefined, () => undefined);
  storyInstallChains.set(key, settled);
  settled.then(() => { if (storyInstallChains.get(key) === settled) storyInstallChains.delete(key); });
  return run;
}

/** Executa a instalação física em série por história (uma por vez, sem disputa de `.tmp`). */
function guardedInstall(params) {
  return runExclusiveByStory(params && params.storyId, () => downloadStoryPackScenesFromGlobalManifestImpl(params));
}

/**
 * Instala o pack de uma história a partir do manifesto global.
 *
 * SINGLE-FLIGHT: chamadas concorrentes com a mesma chave canônica compartilham UMA operação
 * física (download + validação + extração + publicação + registro) e recebem a mesma conclusão
 * lógica. A entrada sai do mapa em `finally`, então uma falha nunca deixa a chave travada e o
 * retry seguinte executa de verdade.
 *
 * Cancelamento: um chamador que passa `isCancelled` é DONO EXCLUSIVO do RESULTADO (não é
 * compartilhado), justamente para que a desistência dele nunca cancele o que outro ainda
 * precisa — mas ele ainda passa pela fila física, senão disputaria o `.tmp`. Hoje nenhum
 * chamador de produto passa `isCancelled`: a UI que "cancela" apenas deixa de observar.
 *
 * LIMITAÇÃO CONHECIDA (aceita neste bloco): quem JOINA um voo em andamento não recebe
 * `onProgress` — só o `onProgress` de quem criou o voo é repassado. O resultado final é o mesmo
 * para todos; apenas a barra de progresso de um segundo observador ficaria parada em 0% até a
 * conclusão. Resolver exige multiplexar os inscritos ({ promise, subscribers }) — mudança de
 * estrutura que não é necessária para a integridade e fica para quando houver caso real.
 *
 * Contrato público inalterado (mesmos parâmetros, mesmo formato de retorno).
 */
async function downloadStoryPackScenesFromGlobalManifest(params = {}) {
  // Dono exclusivo (cancelável): não compartilha o resultado, mas AINDA passa pela fila física —
  // senão disputaria o `.tmp` com uma instalação compartilhada da mesma história.
  if (typeof (params && params.isCancelled) === 'function') return guardedInstall(params);

  const key = packInstallKey(params);
  const existing = inFlightInstalls.get(key);
  if (existing) return existing;   // mesma operação física, mesma conclusão lógica

  const flight = guardedInstall(params).finally(() => { inFlightInstalls.delete(key); });
  inFlightInstalls.set(key, flight);
  return flight;
  }

  return { downloadStoryPackScenesFromGlobalManifest, inFlightInstallCount, packInstallKey };
}

/* ═══════════════ Instância de PRODUÇÃO (singleton, dependências reais) ═══════════════ */
const defaultService = createPackDownloadService({
  FileSystem,
  PACK_STATUS,
  getPackLocalDir,
  getPackTempDir,
  setPackEntry,
  getPackEntry,
  isReadyEntryValid,
  validatePackManifest,
  computeFileSha256,
  fetchGlobalContentManifest,
  getPackFromGlobalManifest,
  warn,
});

/* Exports públicos INALTERADOS — delegam ao singleton (nenhum call site muda). */

/**
 * Instala o pack de uma história a partir do manifesto global. Ver createPackDownloadService.
 * SINGLE-FLIGHT + exclusão física por história; contrato de retorno inalterado.
 */
export async function downloadStoryPackScenesFromGlobalManifest(params = {}) {
  return defaultService.downloadStoryPackScenesFromGlobalManifest(params);
}

/** Só para teste/diagnóstico: quantas instalações físicas estão em voo (instância de produção). */
export function inFlightInstallCount() {
  return defaultService.inFlightInstallCount();
}
