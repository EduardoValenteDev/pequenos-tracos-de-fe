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
import { MARKER_FILENAME, buildPublishMarker, findMarkerCollisions } from './packPublishMarker';
import { recoverStoryPack } from './packRecoveryService';
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
  'getPackFromGlobalManifest', 'warn', 'recoverStoryPack',
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
    getPackFromGlobalManifest, warn, recoverStoryPack,
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

/* ═══════════════ LP2.1a-ii-D — Identidade resolvida e coordenação segura ═══════════════ */

/** Kinds normalizados (só conhecidos, ordenados, SEM deduplicação) — igual à chave preliminar. */
function normalizeKinds(requestedKinds) {
  return (Array.isArray(requestedKinds) ? requestedKinds : [])
    .filter((k) => KNOWN_KINDS.includes(k))
    .slice()
    .sort();
}

/** Emissor de progresso seguro (mesmo contrato de onProgress; nunca lança). */
function makeReport(onProgress) {
  return (status, extra) => {
    try { if (onProgress) onProgress({ status, downloadedBytes: 0, totalBytes: 0, ...extra }); } catch { /* noop */ }
  };
}

/** Resultado de um recovery bem-sucedido, no MESMO formato público de uma instalação. */
function asInstalledResult(storyId, rec, report) {
  report(PACK_STATUS.READY, { downloadedBytes: rec.totalBytes, totalBytes: rec.totalBytes });
  return {
    ok: true, storyId, version: rec.version, kinds: rec.kinds, counts: rec.counts,
    sceneCount: rec.counts.scene || 0, totalBytes: rec.totalBytes, entry: rec.entry, recovered: true,
  };
}

/**
 * FASE 1 — resolução autoritativa ÚNICA. Executa exatamente uma vez por invocação pública: valida
 * os parâmetros, busca o manifesto global, resolve o pack por storyId, checa requires_app_update e
 * extrai a identidade de 7 campos. A fase física NÃO volta a buscar o manifesto. READ-ONLY.
 * @returns {Promise<{ok:boolean, resolved?:object, networkError?:boolean, requiresAppUpdate?:boolean, reason?:string}>}
 */
async function resolveInstallIdentity(params = {}) {
  const { storyId, globalManifestUrl, appVersion = '1.0.0', requestedKinds = ['scene'] } = params || {};
  if (!storyId || typeof storyId !== 'string') return { ok: false, reason: 'storyId inválido' };
  if (!globalManifestUrl || typeof globalManifestUrl !== 'string') return { ok: false, reason: 'globalManifestUrl inválido' };
  const kinds = normalizeKinds(requestedKinds);
  if (kinds.length === 0) return { ok: false, reason: 'requestedKinds inválido (use cover/scene/coloring/audio)' };

  const gm = await fetchGlobalContentManifest(globalManifestUrl, { appVersion });
  if (!gm.ok) {
    // GATE DE REDE — rede/timeout dispara o caminho offline; manifesto inválido/história ausente NÃO.
    const networkError = /rede indispon[ií]vel|timeout/i.test(gm.errors.join(' '));
    return { ok: false, reason: `manifesto global inválido: ${gm.errors.join(' | ')}`, networkError };
  }
  const gp = getPackFromGlobalManifest(gm.data, storyId);
  if (!gp.ok) return { ok: false, reason: gp.errors.join(' | ') };
  const pack = gp.data;
  if (pack.requiresAppUpdate) {
    return { ok: false, requiresAppUpdate: true, reason: `requires_app_update (requiredAppVersion ${pack.requiredAppVersion} > appVersion ${appVersion})` };
  }
  const resolved = {
    storyId,
    version: pack.version,
    baseUrl: pack.baseUrl,
    manifestPath: pack.manifestPath,
    manifestSha256: typeof pack.manifestSha256 === 'string' ? pack.manifestSha256.toLowerCase() : null,
    kinds,
    appVersion,
  };
  return { ok: true, resolved };
}

/**
 * FASE 2 — canonicalização determinística dos SETE campos. storyId/version/baseUrl/manifestPath/
 * appVersion: exatos (crus). manifestSha256: minúsculo, 64-hex obrigatório. kinds: filtrados,
 * ordenados, sem dedupe. Campo ausente (≠ '') ou sha inválido → null (identidade inadmissível).
 * Tupla serializada em JSON — sem delimitador vulnerável a colisão.
 */
function canonicalResolvedKey(resolved) {
  if (!resolved) return null;
  const { storyId, version, baseUrl, manifestPath, manifestSha256, kinds, appVersion } = resolved;
  if (!storyId || !version || !baseUrl || !manifestPath || !appVersion) return null;
  if (typeof manifestSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(manifestSha256)) return null;
  const k = normalizeKinds(kinds);
  if (k.length === 0) return null;
  return JSON.stringify([storyId, version, baseUrl, manifestPath, manifestSha256, k, appVersion]);
}

/* ── Inspeção local SOMENTE LEITURA (preflight da reutilização de pack já instalado) ── */
async function readLocalPublishMarker(localDir) {
  try { return JSON.parse(await FileSystem.readAsStringAsync(`${localDir}${MARKER_FILENAME}`)); }
  catch { return null; }
}
async function readLocalPackManifest(localDir) {
  try { return JSON.parse(await FileSystem.readAsStringAsync(`${localDir}manifest.json`)); }
  catch { return null; }
}
/**
 * LP2.1a-ii-D3 — ÂNCORA REAL do manifesto local: sha256 dos BYTES de `manifest.json` no disco
 * (não a declaração do marcador). READ-ONLY, nunca escreve. Reusa `computeFileSha256` (dep), sem
 * duplicar a função de hash. Falha ao calcular → local NÃO confiável. sha normalizado minúsculo.
 * @returns {Promise<{ok:boolean, actualManifestSha256:string|null, reason:string|null}>}
 */
async function computeLocalManifestAnchor(localDir) {
  const mh = await computeFileSha256(`${localDir}manifest.json`);
  if (!mh || !mh.ok) return { ok: false, actualManifestSha256: null, reason: `sha256 do manifest.json indisponível (${mh && mh.reason})` };
  return { ok: true, actualManifestSha256: String(mh.sha256).toLowerCase(), reason: null };
}
/**
 * Estrutura mínima de um marcador de publicação. A validação OFICIAL (validatePublishMarker) é a
 * condição vinculante do D3; aqui o preflight do downloader confere a estrutura E exige igualdade
 * MATERIAL com a identidade resolvida (mais forte que schema: rejeita marcador de outra identidade).
 */
function markerStructureOk(m) {
  return !!m && typeof m === 'object' && !Array.isArray(m) && m.schemaVersion === 1
    && typeof m.storyId === 'string' && typeof m.version === 'string'
    && typeof m.manifestSha256 === 'string' && /^[a-f0-9]{64}$/.test(String(m.manifestSha256).toLowerCase())
    && typeof m.manifestPath === 'string' && Array.isArray(m.kinds) && typeof m.appVersion === 'string';
}
/**
 * Igualdade de IDENTIDADE (campos I/O-free) do pack local (marcador) × identidade resolvida — 5
 * campos; baseUrl FORA. LP2.1a-ii-D3: o `manifestSha256` NÃO entra aqui — ele é a ÂNCORA dos bytes,
 * verificada contra os BYTES REAIS de manifest.json (computeLocalManifestAnchor) contra o marcador E
 * a resolvida. Comparar declaração×declaração não prova integridade.
 */
function markerMatchesResolved(marker, resolved) {
  if (!markerStructureOk(marker) || !resolved) return false;
  return marker.storyId === resolved.storyId
    && marker.version === resolved.version
    && marker.manifestPath === resolved.manifestPath
    && normalizeKinds(marker.kinds).join(',') === normalizeKinds(resolved.kinds).join(',')
    && marker.appVersion === resolved.appVersion;
}
/**
 * Classifica o pack local para a identidade resolvida. SOMENTE LEITURA — NÃO chama recovery, NÃO
 * baixa, NÃO escreve. Reutiliza o probe real do disco, a igualdade material do marcador,
 * validatePackManifest (contrato oficial) e isReadyEntryValid.
 * @returns {Promise<{coincident:boolean, ready:boolean, marker?, manifest?, entry?, localDir?}>}
 */
async function inspectLocalPackIdentity(resolved) {
  const storyId = resolved.storyId;
  const localDir = getPackLocalDir(storyId, resolved.version);
  if (!localDir) return { coincident: false, ready: false };
  const probe = await probeInstalledPackDisk(localDir);
  if (probe.localDirExists !== true || probe.manifestExists !== true) return { coincident: false, ready: false };
  const marker = await readLocalPublishMarker(localDir);
  if (!markerMatchesResolved(marker, resolved)) return { coincident: false, ready: false, marker };
  const manifest = await readLocalPackManifest(localDir);
  const mv = manifest ? validatePackManifest(manifest, { appVersion: resolved.appVersion }) : { ok: false };
  if (!mv.ok) return { coincident: false, ready: false, marker };
  if (manifest.version !== resolved.version || !manifest.metadata || manifest.metadata.storyId !== storyId) {
    return { coincident: false, ready: false, marker };
  }
  // LP2.1a-ii-D3 — ÂNCORA REAL: calcula o sha256 dos BYTES de manifest.json (o elo que fecha a lacuna).
  const anchor = await computeLocalManifestAnchor(localDir);
  const entry = await getPackEntry(storyId);
  const ready = !!entry && entry.status === PACK_STATUS.READY && isReadyEntryValid(entry, probe);
  return { coincident: true, ready, marker, manifest, entry, localDir, actualSha: anchor.actualManifestSha256 };
}

/**
 * Resultado público de um READY COINCIDENTE — sem recovery, sem download, sem escrita no índice.
 * kinds/counts/totalBytes derivam SÓ do manifesto local validado (dos kinds pedidos); nunca fabrica.
 */
function asReadyEntry(resolved, entry, localManifest, report) {
  const wanted = (localManifest.files || []).filter((f) => f && resolved.kinds.includes(f.kind));
  const counts = {};
  for (const f of wanted) counts[f.kind] = (counts[f.kind] || 0) + 1;
  const totalBytes = wanted.reduce((a, f) => a + (Number(f.bytes) || 0), 0);
  report(PACK_STATUS.READY, { downloadedBytes: totalBytes, totalBytes });
  return {
    ok: true, storyId: resolved.storyId, version: resolved.version, kinds: resolved.kinds.slice(),
    counts, sceneCount: counts.scene || 0, totalBytes, entry, recovered: false,
  };
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
async function downloadStoryPackScenesFromGlobalManifestImpl(resolved, params = {}) {
  const { onProgress, isCancelled, manifestTimeoutMs = 15000, fileTimeoutMs = 60000 } = params || {};
  const storyId = resolved.storyId;
  const kinds = resolved.kinds;
  const appVersion = resolved.appVersion;
  const version = resolved.version;
  const report = makeReport(onProgress);

  // LP2.1a-ii-D — PREFLIGHT LOCAL (read-only) contra a identidade RESOLVIDA. O recovery mutável só
  // é chamado DEPOIS de confirmar a identidade local; nunca antes (isso substitui a antiga ordem do
  // bloco C "recuperar antes de qualquer rede", superseded pela identidade resolvida).
  const insp = await inspectLocalPackIdentity(resolved);
  if (insp.coincident) {
    // LP2.1a-ii-D3 — ÂNCORA REAL: o pack local só é reutilizável se os BYTES de manifest.json batem
    // com o sha do MARCADOR E com o da identidade RESOLVIDA (autoridade online). Declaração ≠
    // integridade: um manifesto adulterado (schema-válido, sha real ≠ âncora) NÃO é reutilizado.
    const markerSha = String(insp.marker.manifestSha256).toLowerCase();
    const anchored = insp.actualSha != null && insp.actualSha === markerSha && insp.actualSha === resolved.manifestSha256;
    if (anchored) {
      //  a) READY coincidente E ancorado → sucesso local sem recovery/download/escrita (D-ID-25/30).
      if (insp.ready) return asReadyEntry(resolved, insp.entry, insp.manifest, report);
      //  b) coincidente-não-READY E ancorado → promove SÓ o candidato correspondente (expectedVersion),
      //     sem baixar. O recovery recalcula o sha real (validatePublishMarker) — dupla proteção.
      const rec1 = await recoverStoryPack({ storyId, requestedKinds: kinds, appVersion, expectedVersion: version });
      if (rec1.recovered) return asInstalledResult(storyId, rec1, report);
    }
    // âncora real divergente/indisponível → NÃO reusa nem recupera o candidato; download abaixo (D-ID-31/32/35).
  }
  //  c) divergente/ausente/inválido/âncora-divergente → instala a identidade resolvida (download abaixo).
  //     NÃO chama recovery mutável para candidato divergente; um READY anterior válido é preservado no
  //     failWith (hardening-3) e NUNCA é devolvido como sucesso desta identidade.

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
    const base = resolved.baseUrl; // validado terminando com '/'
    const manifestUrl = `${base}${resolved.manifestPath}`;

    // 5) baixa o manifesto por-pack para o .tmp (com TIMEOUT + cancelável — F2.5-hardening-3)
    const mTo = `${tempDir}manifest.json`;
    const mdl = FileSystem.createDownloadResumable(manifestUrl, mTo);
    await withTimeout(() => mdl.downloadAsync(), manifestTimeoutMs, () => { try { mdl.cancelAsync(); } catch (_) { /* noop */ } });
    throwIfCancelled(isCancelled);

    // 5b) manifestSha256 OBRIGATÓRIO (F2.5-hardening-3): verifica os BYTES do manifest.json baixado
    //     contra a âncora do manifesto global — ANTES de confiar no schema e de baixar arquivos.
    //     Ausente/inválido/divergente → rejeita (fallback local intacto; .tmp limpo; nunca ready).
    const expectedManifestSha = typeof resolved.manifestSha256 === 'string' ? resolved.manifestSha256.toLowerCase() : null;
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

    // 8b) LP2.1a-ii-C: `.ptf-publish.json` é nome RESERVADO do marcador de publicação. Um manifesto
    //     que o declare sobrescreveria (ou seria sobrescrito por) a evidência de validação — e como
    //     o marcador é escrito DEPOIS do verify, o pack seria publicado com o arquivo trocado, sem
    //     ninguém notar. Rejeita ANTES de baixar qualquer coisa. Verifica a lista INTEIRA (não só os
    //     kinds pedidos): declarar o nome reservado torna o manifesto malformado, ponto. A
    //     comparação é NORMALIZADA (`./x`, `\`, caixa) — a string crua deixaria variantes passarem.
    const collisions = findMarkerCollisions(manifest.files);
    if (collisions.length) {
      return failWith(`manifesto usa o caminho reservado do marcador (${MARKER_FILENAME}): ${collisions.join(', ')}`);
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

    // 11b) LP2.1a-ii-C: MARCADOR DE PUBLICAÇÃO VALIDADA. Só chega aqui com TUDO validado: manifesto
    //      global resolvido, âncora manifestSha256 conferida, schema do manifesto, storyId/version,
    //      lista + contagem por kind, e bytes + sha256 de cada arquivo. Escrito no .tmp para que o
    //      MESMO moveAsync publique o conteúdo e a prova de que ele foi validado — é isso que torna
    //      um pack recuperável offline depois de um crash antes do READY (o manifestSha256 não é
    //      persistido em lugar nenhum, então sem o marcador não há evidência da âncora no disco).
    //      Falhar aqui ABORTA a publicação: sem marcador, nenhuma instalação nova é publicada.
    const marker = buildPublishMarker({
      storyId, version, manifestSha256: expectedManifestSha, manifestPath: resolved.manifestPath, kinds, appVersion,
    });
    try {
      await FileSystem.writeAsStringAsync(`${tempDir}${MARKER_FILENAME}`, JSON.stringify(marker));
    } catch (e) {
      return failWith(`marcador de publicação não pôde ser escrito: ${(e && e.message) || e}`);
    }

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

/* ── Caminho OFFLINE (LP2.1a-ii-D): resolveInstallIdentity falhou com networkError=true ── */
/*
 * Preserva os RESULTADOS FUNCIONAIS do bloco C sob indisponibilidade REAL de rede. A tentativa de
 * fetch registrada ANTES do recovery é agora comportamento AUTORIZADO (Opção 1 — a ordem antiga
 * "recuperar antes de qualquer rede" foi superseded pela identidade resolvida). Melhor esforço:
 *   1) READY local VÁLIDO (índice + probe + marcador coerente + manifesto válido) → sucesso local.
 *   2) candidato recuperável → recovery de melhor esforço promove.
 *   3) nenhum local válido → erro de indisponibilidade.
 * `recovered=false` NÃO é "indisponível": só significa que não houve promoção agora.
 */
async function installOfflineBestEffort(params = {}) {
  const { storyId, appVersion = '1.0.0', requestedKinds = ['scene'] } = params || {};
  const kinds = normalizeKinds(requestedKinds);
  const report = makeReport(params && params.onProgress);
  const entry = await getPackEntry(storyId);
  if (entry && entry.status === PACK_STATUS.READY && entry.version) {
    const localDir = getPackLocalDir(storyId, entry.version);
    const probe = await probeInstalledPackDisk(localDir);
    if (isReadyEntryValid(entry, probe)) {
      const marker = await readLocalPublishMarker(localDir);
      const manifest = await readLocalPackManifest(localDir);
      const mv = manifest ? validatePackManifest(manifest, { appVersion }) : { ok: false };
      // READY VÁLIDO com evidência coerente → sucesso local (D-ID-26). Sem evidência (READY legado/
      // inválido) NÃO fabrica sucesso (D-ID-29): cai no recovery, que sem promoção devolve erro.
      if (markerStructureOk(marker) && marker.storyId === storyId && marker.version === entry.version && mv.ok) {
        // LP2.1a-ii-D3 — ÂNCORA REAL offline: sem identidade remota, os BYTES de manifest.json têm de
        // bater com o sha do MARCADOR. Adulterado (sha real ≠ marcador) ou hash indisponível → NÃO
        // reusa e NÃO chama recovery (índice já READY tem fast-path); devolve indisponibilidade sem
        // declarar o índice íntegro (D-ID-33/35). Preserva o índice anterior.
        const anchor = await computeLocalManifestAnchor(localDir);
        if (anchor.ok && anchor.actualManifestSha256 === String(marker.manifestSha256).toLowerCase()) {
          return asReadyEntry({ storyId, version: entry.version, kinds, appVersion }, entry, manifest, report);
        }
        return { ok: false, networkError: true, reason: 'rede indisponível (READY local não verificável: sha do manifest.json diverge da âncora)' };
      }
    }
  }
  const rec = await recoverStoryPack({ storyId, requestedKinds: kinds, appVersion });
  if (rec.recovered) return asInstalledResult(storyId, rec, report);
  return { ok: false, networkError: true, reason: 'rede indisponível ao buscar content-manifest.json' };
}

/* ───────────── Single-flight por IDENTIDADE RESOLVIDA (LP2.1a-ii-D / PK-01) ───────────── */
/*
 * O compartilhamento é pela identidade RESOLVIDA de 7 campos (não mais pela chave preliminar):
 * duas solicitações só compartilham a instalação física quando resolvem EXATAMENTE a mesma
 * identidade. Versões/SHAs diferentes → conclusões lógicas INDEPENDENTES. `packInstallKey`
 * (preliminar) permanece exportado só por compatibilidade de testes — NÃO decide mais o voo.
 */
const inFlightInstalls = new Map();

/** Só para teste/diagnóstico: quantas instalações físicas estão em voo NESTA instância (mapa resolvido). */
function inFlightInstallCount() {
  return inFlightInstalls.size;
}

/* ── LP2.1a-ii-E — Progresso compartilhado: FlightRecord por identidade resolvida ── */
/*
 * Cada voo guarda um FlightRecord { promise, subscribers, latestProgress, settled } em vez de uma
 * Promise nua. Participantes (criador + joiners COM onProgress) recebem CADA evento; um joiner tardio
 * recebe um replay do ÚLTIMO snapshot. `onProgress` NÃO faz parte da identidade; o MESMO callback em
 * duas chamadas = DOIS participantes (Symbol por chamada, sem dedupe por referência). Exceção de
 * callback é isolada e o retorno é ignorado (Promise/thenable rejeitado absorvido). Offline e
 * `isCancelled` NÃO participam do fan-out (não há resolvedKey/record neles). Nada de cancelamento (F).
 */

/** Notifica UM participante com cópia PRÓPRIA do snapshot; isola exceção síncrona e retorno rejeitado. */
function notifyProgressSubscriber(callback, snapshot) {
  try {
    Promise.resolve(callback({ ...snapshot })).catch(() => {});
  } catch { /* o callback não pode afetar o voo, a Promise compartilhada nem os outros participantes */ }
}

/** Distribui um evento a TODOS os participantes ativos (fotografia); ignora emissões após o settlement. */
function emitProgress(record, snapshot) {
  if (record.settled) return;
  record.latestProgress = { ...snapshot };                       // último snapshot, por-record (nunca cruza keys)
  const subscribers = Array.from(record.subscribers.values());   // FOTOGRAFIA (reentrância)
  for (const sub of subscribers) notifyProgressSubscriber(sub.onProgress, record.latestProgress);
}

/** Replay do ÚLTIMO snapshot a um joiner recém-registrado; não reproduz histórico nem itera outros. */
function replayLatestProgress(record, callback) {
  if (!record.latestProgress) return;
  notifyProgressSubscriber(callback, record.latestProgress);
}

/** Higiene do E: ao settle, marca o record, libera subscribers/snapshot e remove o record da PRÓPRIA key. */
function cleanupRecord(key, record) {
  record.settled = true;
  for (const sub of record.subscribers.values()) {              // LP2.1a-ii-F: solta os listeners de signal
    try { sub.detach(); } catch { /* detach nunca afeta o settle nem o resultado */ }
  }
  record.subscribers.clear();
  record.latestProgress = null;
  if (inFlightInstalls.get(key) === record) inFlightInstalls.delete(key);   // um finally ANTIGO não apaga record novo
}

/* ── LP2.1a-ii-F — Lifecycle dos participantes: `participantSignal` ADITIVO ──────────────
 * `participantSignal` controla SÓ a observação (progresso/replay). NÃO aborta a rede nem a
 * instalação física; NÃO entra na identidade nem em `canonicalResolvedKey`; NÃO altera o
 * resultado; NÃO é persistido. Signal ausente ou inválido → subscriber PERMANENTE (E). Signal
 * já abortado, ou com getters/métodos hostis, → NÃO registra (fail closed), sem afetar o voo.
 * O criador não tem privilégio: sair remove só o próprio subscriber; ZERO subscribers NÃO
 * cancela a instalação. `isCancelled` (exclusivo) e o caminho offline seguem FORA disto. */

/** Classifica um participantSignal protegendo toda leitura de getter hostil (nunca deixa exceção escapar). */
function inspectParticipantSignal(signal) {
  if (!signal) return { kind: 'absent' };
  try {
    const aborted = Boolean(signal.aborted);
    const add = signal.addEventListener;
    const remove = signal.removeEventListener;
    if (typeof add !== 'function' || typeof remove !== 'function') return { kind: 'invalid' };
    return { kind: aborted ? 'aborted' : 'active', signal, add, remove };
  } catch {
    return { kind: 'broken' };   // algum getter lançou → fail closed
  }
}

/** Remove UM subscriber pelo id e chama seu detach; idempotente; nunca lança; não toca os demais nem o voo. */
function removeProgressSubscriber(record, subscriberId) {
  const sub = record.subscribers.get(subscriberId);
  if (!sub) return false;
  record.subscribers.delete(subscriberId);
  try { sub.detach(); } catch { /* detach isola a própria exceção */ }
  return true;
}

/** Registra um subscriber de progresso; retorna o Symbol ou null. Fail closed em signal quebrado/abortado. */
function registerProgressSubscriber(record, onProgress, participantSignal) {
  if (typeof onProgress !== 'function') return null;   // sem callback → não é subscriber
  if (record.settled) return null;
  const inspected = inspectParticipantSignal(participantSignal);
  if (inspected.kind === 'aborted' || inspected.kind === 'broken') return null;   // não registra
  const id = Symbol();
  if (inspected.kind !== 'active') {                   // absent | invalid → permanente (detach no-op idempotente)
    record.subscribers.set(id, { onProgress, detach: () => {} });
    return id;
  }
  // active: instala o listener com o `this` correto e captura um detach idempotente que não relê getters.
  const handler = () => { removeProgressSubscriber(record, id); };
  let detached = false;
  const detach = () => {
    if (detached) return;
    detached = true;
    try { inspected.remove.call(inspected.signal, 'abort', handler); } catch { /* isola */ }
  };
  record.subscribers.set(id, { onProgress, detach });
  try {
    inspected.add.call(inspected.signal, 'abort', handler);
  } catch {
    record.subscribers.delete(id);   // FAIL CLOSED: a instalação do listener lançou
    detach();
    return null;
  }
  if (inspectParticipantSignal(participantSignal).kind !== 'active') handler();   // corrida: abortou durante o registro
  return record.subscribers.has(id) ? id : null;
}

/* ── Exclusão pelo RECURSO FÍSICO (storyId@version) — a fila por história permanece ── */
/*
 * O recurso que o fluxo destrói e publica (`.tmp`/`localDir`) deriva de storyId@version. Identidades
 * resolvidas diferentes da MESMA história não compartilham conclusão, mas ainda aguardam a MESMA
 * fila física (instalam uma depois da outra, reavaliando o estado local ao entrar) — sem disputa
 * de `.tmp`. O chamador cancelável também passa por aqui, mesmo sem entrar no mapa de compartilhamento.
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

/** Executa a instalação física (identidade resolvida) em série por história, sem disputa de `.tmp`. */
function guardedInstall(resolved, params) {
  return runExclusiveByStory(resolved.storyId, () => downloadStoryPackScenesFromGlobalManifestImpl(resolved, params));
}

/**
 * Instala o pack de uma história. LP2.1a-ii-D:
 *   Fase 1 — resolve a identidade INDEPENDENTEMENTE (uma busca do manifesto por invocação pública).
 *   Fase 2 — single-flight pela identidade RESOLVIDA (7 campos): mesma identidade compartilha a
 *            instalação física; identidades diferentes NÃO compartilham a conclusão lógica.
 *   Fase 3 — a instalação recebe o MESMO objeto resolvido (não busca o manifesto de novo).
 *
 * Offline (networkError na resolução): melhor esforço serializado por história (preserva o C).
 * Cancelável (`isCancelled`): DONO EXCLUSIVO do resultado, mas ainda passa pela fila física.
 * `cleanupRecord` limpa o mapa no `finally`: uma falha nunca deixa a chave travada; o retry executa.
 * LP2.1a-ii-E — PROGRESSO COMPARTILHADO: quem JOINA um voo AGORA recebe os eventos de `onProgress`
 * (fan-out por FlightRecord) e um replay do último snapshot. Contrato público inalterado.
 */
async function downloadStoryPackScenesFromGlobalManifest(params = {}) {
  const idr = await resolveInstallIdentity(params);
  if (!idr.ok) {
    if (idr.networkError) return runExclusiveByStory(params && params.storyId, () => installOfflineBestEffort(params));
    return idr.requiresAppUpdate
      ? { ok: false, requiresAppUpdate: true, reason: idr.reason }
      : { ok: false, reason: idr.reason };
  }
  const resolved = idr.resolved;

  // Dono exclusivo (cancelável): não compartilha o resultado, mas AINDA passa pela fila física.
  if (typeof (params && params.isCancelled) === 'function') return guardedInstall(resolved, params);

  const key = canonicalResolvedKey(resolved);
  if (!key) return guardedInstall(resolved, params);   // identidade inadmissível → instala sem compartilhar

  const existing = inFlightInstalls.get(key);
  if (existing) {
    // JOINER: registra o PRÓPRIO participante (Symbol por chamada, via registerProgressSubscriber) e,
    // SE o registro foi bem-sucedido, recebe replay do último snapshot. Signal já abortado/quebrado → sem
    // registro e sem replay. NÃO inicia instalação, NÃO altera a identidade, NÃO substitui o criador;
    // chamada sem callback ainda aguarda a MESMA Promise final sem virar subscriber.
    const id = registerProgressSubscriber(existing, params.onProgress, params.participantSignal);
    if (id) replayLatestProgress(existing, params.onProgress);
    return existing.promise;   // mesma identidade resolvida, mesma conclusão lógica
  }

  // CRIADOR: monta o FlightRecord, registra o próprio participante (se houver callback) e SÓ ENTÃO insere
  // no mapa — com a Promise JÁ atribuída (o record nunca entra no mapa com promise:null). O motor físico
  // só começa na microtask do `.then`, então o criador já está inscrito antes do primeiro evento; e o
  // `set` fica adjacente (sem `await`) ao get, preservando a atomicidade do single-flight.
  const record = { promise: null, subscribers: new Map(), latestProgress: null, settled: false };
  registerProgressSubscriber(record, params.onProgress, params.participantSignal);
  const internalParams = { ...params, onProgress: (snapshot) => emitProgress(record, snapshot) };
  record.promise = Promise.resolve()
    .then(() => guardedInstall(resolved, internalParams))
    .finally(() => cleanupRecord(key, record));
  inFlightInstalls.set(key, record);
  return record.promise;
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
  recoverStoryPack,
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
