/**
 * packRecoveryService.js — Recuperação de instalação interrompida na publicação (LP2.1a-ii-C).
 *
 * ── O problema ──
 * Publicar um pack são DOIS passos não atômicos: `moveAsync(.tmp → localDir)` e
 * `setPackEntry(READY)`. Um encerramento entre eles deixa o conteúdo ÍNTEGRO no disco e o índice
 * dizendo `downloading` (re-instalação) ou NADA (instalação nova — o caso mais comum, porque toda
 * primeira instalação é nova). O app trata o pack como ausente e re-baixa. Offline, a criança
 * simplesmente não tem a história que a família pagou — apesar de ela estar ali, inteira.
 *
 * ── O contrato (spec 012 §6) ──
 * Um pack só é recuperado como READY quando existe EVIDÊNCIA LOCAL PERSISTENTE de que o manifesto
 * ancorado e todos os arquivos foram integralmente validados ANTES da publicação. A existência do
 * diretório, do `manifest.json` ou de uma entrada `downloading` NUNCA é evidência suficiente.
 *
 * Essa evidência é o marcador `.ptf-publish.json` (packPublishMarker), escrito no `.tmp` depois de
 * toda a validação e antes do move — logo, publicado pelo mesmo move que publica o conteúdo.
 *
 * ── Sob demanda, nunca no boot ──
 * Roda quando uma história pede seu pack, DENTRO da fila física por história (o downloader o chama
 * de dentro de `runExclusiveByStory`), e nunca em paralelo com uma instalação da mesma história.
 * Não há varredura de packs no boot: com o índice já READY, sai no primeiro passo, sem I/O de
 * descoberta.
 *
 * ── Não presume atomicidade de `moveAsync` ──
 * A segurança vem da VALIDAÇÃO INTEGRAL, não de uma propriedade do filesystem. Um destino com só o
 * marcador, com o manifesto faltando, com um arquivo a menos, com byte trocado ou com tamanho
 * divergente é rejeitado do mesmo jeito.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { PACK_STATUS, getPackLocalDir, getPackEntry, setPackEntry } from './packStorageService';
import { validatePackManifest, computeFileSha256 } from './packIntegrityService';
import { MARKER_FILENAME, validatePublishMarker, selectStoryPackDirs, parsePackDirName } from './packPublishMarker';
import { warn } from '../utils/logger';

const REQUIRED_DEPS = Object.freeze([
  'FileSystem', 'PACK_STATUS', 'getPackLocalDir', 'getPackEntry', 'setPackEntry',
  'validatePackManifest', 'computeFileSha256', 'warn',
]);

/**
 * Cria o serviço com dependências explícitas — mesmo seam do packDownloadService (LP2.1a-ii-A):
 * produção e teste executam a MESMA implementação, sem flag, global ou monkey patch.
 * @param {object} deps
 */
export function createPackRecoveryService(deps) {
  if (!deps || typeof deps !== 'object') throw new Error('createPackRecoveryService: deps obrigatório');
  const missing = REQUIRED_DEPS.filter((k) => deps[k] == null);
  if (missing.length) throw new Error(`createPackRecoveryService: dependências ausentes: ${missing.join(', ')}`);
  const {
    FileSystem, PACK_STATUS, getPackLocalDir, getPackEntry, setPackEntry,
    validatePackManifest, computeFileSha256, warn,
  } = deps;

  /** Raiz local dos packs (onde vivem `<storyId>@<version>/` e `.tmp/`). null se o FS não estiver pronto. */
  const packsRoot = () => {
    const doc = FileSystem.documentDirectory;
    return doc ? `${doc}packs/` : null;
  };

  /** Lê e parseia um JSON do disco. Nunca lança: ausente/ilegível/malformado → null. */
  const readJson = async (uri) => {
    try {
      return JSON.parse(await FileSystem.readAsStringAsync(uri));
    } catch {
      return null;   // não distingue ausente de corrompido: nos dois casos NÃO é evidência
    }
  };

  /**
   * Valida INTEGRALMENTE um candidato. Só devolve `ok` quando toda a evidência bate.
   *
   * Ordem (a mais barata primeiro, para não hashear um candidato que já se sabe inválido):
   * marcador → schema do marcador → manifesto → hash do manifesto × âncora do marcador →
   * schema do manifesto (revalida minAppVersion contra o app ATUAL) → identidade → arquivos.
   *
   * @returns {{ ok: boolean, reason?: string, version?: string, kinds?: string[],
   *             totalBytes?: number, counts?: object }}
   */
  const validateCandidate = async ({ storyId, dirName, version, requestedKinds, appVersion }) => {
    const dir = getPackLocalDir(storyId, version);
    if (!dir) return { ok: false, reason: 'documentDirectory indisponível' };

    // 1) marcador — sem ele NÃO há evidência da âncora (pack legado ou publicação anterior ao bloco C)
    const marker = await readJson(`${dir}${MARKER_FILENAME}`);
    if (!marker) return { ok: false, reason: 'sem marcador de publicação' };

    // 2) manifesto local
    const manifest = await readJson(`${dir}manifest.json`);
    if (!manifest) return { ok: false, reason: 'manifest.json ausente ou inválido' };

    // 3) o ELO: os bytes do manifesto do disco batem com a âncora preservada no marcador?
    const mh = await computeFileSha256(`${dir}manifest.json`);
    if (!mh.ok) return { ok: false, reason: `manifest.json: sha256 indisponível (${mh.reason})` };

    const parsed = parsePackDirName(dirName) || {};
    const dec = validatePublishMarker(marker, {
      storyId,
      dirStoryId: parsed.storyId,
      dirVersion: parsed.version,
      manifestSha256: mh.sha256,
      manifest,
      requestedKinds,
    });
    if (!dec.ok) return { ok: false, reason: dec.errors.join(' | ') };

    // 4) schema do manifesto — revalida minAppVersion contra o app ATUAL (o marcador guarda o
    //    appVersion de quando foi validado, mas isso é evidência, não portão: bloquear por ele
    //    quebraria a recuperação depois de todo update do app).
    const mv = validatePackManifest(manifest, { appVersion });
    if (!mv.ok) return { ok: false, reason: `manifesto inválido: ${mv.errors.join(' | ')}` };

    // 5) arquivos: valida TUDO que foi publicado (os kinds do marcador), não só o que se pede agora
    const publicados = (manifest.files || []).filter((f) => f && marker.kinds.includes(f.kind)
      && typeof f.path === 'string' && !f.path.startsWith('/') && !f.path.includes('..'));
    if (publicados.length === 0) return { ok: false, reason: 'manifesto sem arquivos dos kinds publicados' };

    const counts = {};
    let totalBytes = 0;
    for (const f of publicados) {
      const uri = `${dir}${f.path}`;
      let info;
      try {
        info = await FileSystem.getInfoAsync(uri, { size: true });
      } catch (e) {
        return { ok: false, reason: `${f.path}: disco ilegível (${(e && e.message) || e})` };
      }
      if (!info || !info.exists) return { ok: false, reason: `${f.path}: ausente` };
      if (typeof f.bytes === 'number' && info.size !== f.bytes) {
        return { ok: false, reason: `${f.path}: bytes ${info.size} != ${f.bytes}` };
      }
      if (f.sha256) {
        const h = await computeFileSha256(uri);
        if (!h.ok) return { ok: false, reason: `${f.path}: sha256 indisponível (${h.reason})` };
        if (h.sha256 !== String(f.sha256).toLowerCase()) return { ok: false, reason: `${f.path}: sha256 divergente` };
      }
      counts[f.kind] = (counts[f.kind] || 0) + 1;
      totalBytes += Number(f.bytes) || 0;   // CONTEÚDO apenas: o marcador nunca entra em totalBytes
    }

    return { ok: true, version, kinds: marker.kinds, totalBytes, counts };
  };

  /**
   * Reúne os candidatos DESTA história — e só dela.
   *
   * `expectedVersion` (identidade já resolvida pela rede) → candidato único e direto, sem listar.
   * Senão: C1 pelo índice (direto, sem listar) + C2 listando SÓ os nomes da raiz de packs.
   * Nunca abre candidato de outra história; nunca valida packs de outras histórias.
   */
  const collectCandidates = async ({ storyId, entry, expectedVersion }) => {
    const out = new Map();   // version → dirName (dedup)

    const add = (version) => {
      if (version && !out.has(version)) out.set(version, `${storyId}@${version}`);
    };

    if (expectedVersion) {
      add(expectedVersion);
      return [...out].map(([version, name]) => ({ version, name }));
    }

    // C1: a entrada do índice diz a versão — isso É identidade resolvida, então o candidato é
    // ÚNICO e direto, sem listar o diretório (plan §7.2: "C1: entry.version existe? → candidato
    // direto; NÃO lista o diretório"; §8.1: "priorizar o candidato da versão indicada pelo índice").
    //
    // Só a VERSÃO é aproveitada — `localDir`, `manifestPath` e `totalBytes` herdados NÃO são
    // evidência da instalação nova (a marca DOWNLOADING passa só {version, status} e o merge herda
    // o resto do READY anterior).
    //
    // Por que retornar aqui em vez de somar os candidatos do disco: um bump NÃO apaga o diretório
    // antigo (spec §7.5.2), então um `story@1.0.0` íntegro convive com o `story@2.0.0` que o índice
    // aponta. Somando os dois: (a) o par vira "2+ válidos" e o fluxo declara ambiguidade ARTIFICIAL,
    // recusando offline um pack cuja identidade o índice já resolveu; (b) pior, se o candidato
    // indicado estiver corrompido, o antigo passa a ser o "único válido" e é PROMOVIDO — servindo
    // uma versão que o índice nunca indicou, contra §8.7. Se o candidato indicado não for íntegro,
    // o certo é "0 válidos" → fluxo normal com rede (§7.2 passo 5), nunca um fallback silencioso.
    if (entry && entry.version) {
      add(entry.version);
      return [...out].map(([version, name]) => ({ version, name }));
    }

    // C2: sem identidade no índice, a evidência está só no disco.
    const root = packsRoot();
    if (root) {
      let names = [];
      try {
        names = await FileSystem.readDirectoryAsync(root);
      } catch {
        names = [];   // raiz ainda não existe → simplesmente não há candidato
      }
      // Igualdade de storyId PARSEADO, nunca prefixo: `startsWith('noah')` abriria `noah_ark@…`.
      // `.tmp` (que vive dentro de packs/) e nomes fora do formato caem fora aqui.
      for (const d of selectStoryPackDirs(names, storyId)) add(d.version);
    }

    return [...out].map(([version, name]) => ({ version, name }));
  };

  /**
   * Tenta recuperar o pack de uma história a partir da evidência local.
   *
   * NUNCA usa rede. NUNCA apaga nada. Só PROMOVE — e só com evidência integral.
   *
   * @param {object} params
   * @param {string} params.storyId
   * @param {string[]} params.requestedKinds
   * @param {string} params.appVersion
   * @param {string} [params.expectedVersion] identidade já resolvida (2ª tentativa, desambiguação)
   * @returns {Promise<{recovered: boolean, reason?: string, ambiguous?: boolean, version?: string,
   *                    kinds?: string[], counts?: object, totalBytes?: number, entry?: object}>}
   */
  async function recoverStoryPack(params = {}) {
    const { storyId, requestedKinds = ['scene'], appVersion = '1.0.0', expectedVersion } = params;
    if (!storyId) return { recovered: false, reason: 'storyId ausente' };

    try {
      const entry = await getPackEntry(storyId);

      // FAST PATH: já pronto → nada a recuperar, e ZERO I/O de descoberta (nenhum readdir, nenhum
      // hash). Devolve `recovered:false` de propósito: quem chamou o download querendo REINSTALAR
      // continua reinstalando — o recovery não sequestra esse fluxo.
      if (entry && entry.status === PACK_STATUS.READY) {
        return { recovered: false, reason: 'entrada já ready' };
      }

      const candidates = await collectCandidates({ storyId, entry, expectedVersion });
      if (candidates.length === 0) return { recovered: false, reason: 'nenhum candidato local' };

      const validos = [];
      for (const c of candidates) {
        const r = await validateCandidate({
          storyId, dirName: c.name, version: c.version, requestedKinds, appVersion,
        });
        if (r.ok) validos.push(r);
      }

      if (validos.length === 0) return { recovered: false, reason: 'nenhum candidato com evidência válida' };

      // AMBIGUIDADE: duas versões da mesma história, ambas íntegras e com marcador válido (o bump
      // de versão não apaga o diretório antigo). Nenhuma é "a certa" sem saber qual o manifesto
      // global aponta. É PROIBIDO escolher por maior versão, data, ordem do filesystem ou nome:
      // devolve `ambiguous` e o fluxo normal resolve a identidade — depois disso, a 2ª tentativa
      // (com `expectedVersion`) recupera só o candidato correspondente.
      if (validos.length > 1) {
        return {
          recovered: false,
          ambiguous: true,
          reason: `múltiplos candidatos válidos (${validos.map((v) => v.version).join(', ')}) — identidade não resolvida`,
        };
      }

      const v = validos[0];
      const localDir = getPackLocalDir(storyId, v.version);

      // PROMOÇÃO: metadados RECALCULADOS do conteúdo validado agora — nada é reaproveitado do
      // índice antigo. `errorMessage: null` limpa o erro de tentativas anteriores (contrato do
      // commit 3485b95). Passa por setPackEntry, que já roda inteiro dentro da fila serializada.
      const saved = await setPackEntry(storyId, {
        version: v.version,
        status: PACK_STATUS.READY,
        localDir,
        manifestPath: `${localDir}manifest.json`,
        totalBytes: v.totalBytes,
        downloadedBytes: v.totalBytes,
        errorMessage: null,
      });

      return {
        recovered: true, version: v.version, kinds: v.kinds,
        counts: v.counts, totalBytes: v.totalBytes, entry: saved,
      };
    } catch (e) {
      // Recovery é um ATALHO: se qualquer coisa der errado, o fluxo normal segue e baixa. Nunca
      // derruba a instalação por causa de uma tentativa de recuperação.
      warn('packRecoveryService.recoverStoryPack:', e);
      return { recovered: false, reason: `recovery falhou: ${(e && e.message) || e}` };
    }
  }

  return { recoverStoryPack };
}

/* ═══════════════ Instância de PRODUÇÃO (singleton, dependências reais) ═══════════════ */
const defaultService = createPackRecoveryService({
  FileSystem,
  PACK_STATUS,
  getPackLocalDir,
  getPackEntry,
  setPackEntry,
  validatePackManifest,
  computeFileSha256,
  warn,
});

/** Contrato público — delega ao singleton. */
export async function recoverStoryPack(params = {}) {
  return defaultService.recoverStoryPack(params);
}
