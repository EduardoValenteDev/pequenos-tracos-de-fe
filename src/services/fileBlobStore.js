/**
 * fileBlobStore.js — Armazenamento local de blobs grandes em arquivos.
 *
 * Tira os blobs grandes (full-res de artes e pinturas, em base64) do
 * AsyncStorage e os grava como arquivos reais no diretório de documentos do
 * app, via expo-file-system. O AsyncStorage passa a guardar apenas ponteiros
 * (file:// URIs) + metadados leves — reduzindo risco de lentidão, travamento e
 * estouro de limite de linha do SQLite em Android fraco.
 *
 * Entrypoint legacy de propósito: `writeAsStringAsync`/`readAsStringAsync` com
 * `EncodingType.Base64` é o caminho mais estável para gravar/ler base64 no
 * SDK 54 (a API nova exigiria conversão manual atob → Uint8Array).
 *
 * Degradação segura: se o FileSystem não estiver disponível ou a escrita
 * falhar, as funções retornam null e o chamador mantém o blob inline (formato
 * antigo). Nada é perdido.
 *
 * Nomes de arquivo derivam SEMPRE de IDs internos (sanitizados via safeName),
 * NUNCA de nome da criança, título da arte ou texto livre.
 *
 * NOTA: a confirmação final do FileSystem em produção fica para a Sprint C
 * (Development Build). No Expo Go / Node validamos estrutura e comportamento.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { log } from '../utils/logger';

const ROOT_DIRNAME = 'ptf_blobs';

/** Base do diretório controlado de blobs (ou null se o FS estiver indisponível). */
function blobsRoot() {
  const doc = FileSystem.documentDirectory;
  if (!doc) return null;
  return doc + ROOT_DIRNAME + '/';
}

/** Raiz ATUAL dos blobs (documentDirectory + 'ptf_blobs/'), ou null. Wrapper fino de blobsRoot(). */
export function currentBlobsRoot() {
  return blobsRoot();
}

// ── Helpers puros (sem dependência nativa — testáveis isoladamente) ────────────

/** true se a string é um data URL base64 ('data:...;base64,...'). */
export function isDataUrl(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

/** true se a string é um ponteiro de arquivo local (file://...). */
export function isFileUri(str) {
  return typeof str === 'string' && str.startsWith('file:');
}

/** Extrai o mime de um data URL ('data:image/png;base64,...') → 'image/png'. */
export function dataUrlMime(dataUrl, fallback = 'image/png') {
  if (!isDataUrl(dataUrl)) return fallback;
  const m = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return (m && m[1]) || fallback;
}

/** Remove o prefixo 'data:...;base64,' deixando só o base64 cru. */
export function stripDataUrlPrefix(dataUrl) {
  if (typeof dataUrl !== 'string') return '';
  const i = dataUrl.indexOf('base64,');
  return i >= 0 ? dataUrl.slice(i + 'base64,'.length) : dataUrl;
}

/** Monta um data URL a partir de base64 cru + mime. */
export function toDataUrl(base64, mime = 'image/png') {
  return 'data:' + mime + ';base64,' + base64;
}

/** Sanitiza um id para nome de arquivo seguro (somente [A-Za-z0-9_-]). */
export function safeName(id) {
  return String(id == null ? '' : id).replace(/[^A-Za-z0-9_-]/g, '_');
}

/**
 * Recompõe uma URI de blob file:// ABSOLUTA (que embute um documentDirectory antigo,
 * ex.: container iOS após restore) para a raiz de blobs ATUAL. PURO e param-based —
 * sem I/O, sem escrita, sem getInfoAsync. Não muda o formato do ponteiro v3.
 *   - não-string → inalterado
 *   - data URL   → inalterado
 *   - file:// FORA de 'ptf_blobs/' → inalterado
 *   - file:// dentro de 'ptf_blobs/' → currentBlobsRoot + (sufixo após 'ptf_blobs/')
 *   - currentBlobsRoot ausente → inalterado
 * Idempotente: recompor o já-atual devolve o mesmo valor (no-op quando o container não mudou).
 */
export function recomposeBlobUri(oldUri, currentBlobsRoot) {
  if (typeof oldUri !== 'string') return oldUri;
  if (oldUri.startsWith('data:')) return oldUri;
  const marker = ROOT_DIRNAME + '/';
  const i = oldUri.indexOf(marker);
  if (i < 0) return oldUri;
  if (!currentBlobsRoot) return oldUri;
  return currentBlobsRoot + oldUri.slice(i + marker.length);
}

// ── Operações de FileSystem (async, nativas) ───────────────────────────────────

const _dirEnsured = {};

async function ensureDir(subdir) {
  const root = blobsRoot();
  if (!root) return null;
  const dir = root + subdir + '/';
  if (_dirEnsured[dir]) return dir;
  try {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    _dirEnsured[dir] = true;
    return dir;
  } catch (e) {
    log('fileBlobStore.ensureDir:', e);
    return null;
  }
}

/**
 * Grava um data URL (ou base64 cru) em arquivo dentro de `subdir/filename`.
 * Retorna { uri, mime } em caso de sucesso, ou null em falha (o chamador então
 * mantém o blob inline, sem perda).
 *
 * Confirma a existência do arquivo ANTES de retornar — assim o chamador só
 * descarta o base64 antigo depois que a escrita está garantida.
 * Idempotente: regrava o mesmo caminho determinístico (sem duplicar arquivo).
 */
export async function writeBlob(subdir, filename, dataUrlOrBase64, mimeHint) {
  if (!dataUrlOrBase64 || typeof dataUrlOrBase64 !== 'string') return null;
  const dir = await ensureDir(subdir);
  if (!dir) return null;
  const mime = mimeHint || dataUrlMime(dataUrlOrBase64, 'image/png');
  const base64 = isDataUrl(dataUrlOrBase64)
    ? stripDataUrlPrefix(dataUrlOrBase64)
    : dataUrlOrBase64;
  if (!base64) return null;
  const uri = dir + filename;
  try {
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    return { uri, mime };
  } catch (e) {
    log('fileBlobStore.writeBlob:', e);
    return null;
  }
}

/** Lê um arquivo de blob de volta como data URL. Retorna null em falha. */
export async function readBlobAsDataUrl(uri, mime = 'image/png') {
  if (!isFileUri(uri)) return null;
  try {
    // Boundary A: tenta o URI ANTIGO primeiro; se o arquivo não existe (ex.: o
    // container iOS mudou de UUID após restore/update), recompõe pelo
    // documentDirectory ATUAL e tenta de novo. Só LÊ — nunca grava/apaga/migra.
    let target = uri;
    let info = await FileSystem.getInfoAsync(target);
    if (!info || !info.exists) {
      const recomposed = recomposeBlobUri(uri, currentBlobsRoot());
      if (recomposed === uri) return null;
      info = await FileSystem.getInfoAsync(recomposed);
      if (!info || !info.exists) return null;
      target = recomposed;
    }
    const base64 = await FileSystem.readAsStringAsync(target, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return toDataUrl(base64, mime);
  } catch (e) {
    log('fileBlobStore.readBlobAsDataUrl:', e);
    return null;
  }
}

/** Desfechos TIPADOS de uma exclusão de blob. Contrato estável — a exclusão nunca lança. */
export const BLOB_DELETE_OUTCOME = Object.freeze({
  DELETED: 'apagado',        // o arquivo existia dentro da raiz autorizada e foi removido
  ALREADY_ABSENT: 'ausente', // não existia: a limpeza já estava satisfeita (idempotência)
  REFUSED: 'recusado',       // destino não passou na validação de contenção — NADA foi tocado
  FAILED: 'falhou',          // o FileSystem recusou a operação (resíduo físico, nunca dado perdido)
});

/** Um segmento `..` (ou sua forma percent-encoded) em qualquer posição do caminho. */
const TEM_TRAVESSIA = /(^|\/)\.\.(\/|$)|%2e%2e|%2e\.|\.%2e/i;

/**
 * [P3J-R.1] Decodifica percent-encoding REPETIDAMENTE, até estabilizar.
 *
 * Necessário porque o veto de travessia não pode olhar só a forma CRUA: quem monta o caminho
 * nativo decodifica antes (`URL.path` em Swift, `Uri.getPath()` em Android). `..%2f` chega aqui
 * sem NENHUMA barra literal ao redor dos pontos — o regex não dispara — e vira `../` no kernel.
 * Encoding malformado (`%zz`) ou encadeado sem fim é hostil por construção ⇒ `null`.
 */
function decodificarTudo(texto) {
  let atual = texto;
  for (let i = 0; i < 4; i += 1) {
    if (atual.indexOf('%') < 0) return atual;
    let proximo;
    try {
      proximo = decodeURIComponent(atual);
    } catch (e) {
      return null;
    }
    if (proximo === atual) return atual;
    atual = proximo;
  }
  return null;
}

/**
 * [P3J-R.1] Normaliza o CAMINHO sem resolver `..` — resolver ESCONDERIA a travessia, e aqui ela
 * precisa continuar visível para ser recusada. Colapsa `//` repetido e remove segmentos `.`: são
 * as duas grafias que fazem o MESMO arquivo comparar "diferente" contra a lista de protegidos
 * (`…/drawings60//arte.b.png` e `…/drawings60/./arte.b.png` são o snapshot vivo). Só segmento
 * inteiro é removido — `arte.a.png` nunca é tocado, porque ali o ponto não é um segmento.
 */
function normalizarCaminho(uri) {
  if (typeof uri !== 'string') return uri;
  const m = /^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)?([\s\S]*)$/.exec(uri);
  const esquema = m[1] || '';
  let corpo = m[2];
  let anterior = null;
  while (anterior !== corpo) {
    anterior = corpo;
    corpo = corpo.replace(/\/{2,}/g, '/').replace(/(^|\/)\.(?=\/|$)/g, '$1');
  }
  return esquema + corpo;
}

/**
 * [P3J-R.1] resolveBlobDeletionTarget — decide, de forma PURA, qual caminho pode ser apagado.
 *
 * POR QUE EXISTE. `readBlobAsDataUrl` já RECOMPUNHA uma URI obsoleta para a raiz atual (Boundary A),
 * mas `deleteBlob` não recompunha NEM validava contenção. Essa assimetria é a causa real do erro
 * observado no dispositivo: um ponteiro persistido com o `documentDirectory` de um container iOS
 * ANTIGO chega ao `deleteAsync`, que — em `FileSystemLegacyModule.swift:88` — confere permissão de
 * escrita no DIRETÓRIO PAI (`url.appendingPathComponent("..")`). O `/..` NUNCA foi montado por este
 * código: é o nativo que o acrescenta. Com caminho ATUAL isso é inofensivo, porque o ramo interno
 * de `getInternalPathPermissions` compara `url.standardized.path` — e `.standardized` RESOLVE o
 * `..`, devolvendo o diretório real, que casa com o escopo do container e concede `.write`. Com
 * caminho de container ANTIGO o prefixo não casa, cai-se no ramo externo, e lá o
 * `FileManager.isWritableFile` roda sobre o caminho NÃO normalizado (`…/arte.a.png/..`): o
 * `access(2)` devolve ENOTDIR — um arquivo comum não pode ser prefixo de caminho — a permissão é
 * negada e a mensagem ecoa o caminho literal terminado em `/..`, com o blob obsoleto PERMANECENDO
 * em disco. Recompor antes de apagar remove a causa; validar a contenção impede a classe toda.
 * (Fontes conferidas em `node_modules`: expo-file-system 19.0.23 e expo-modules-core
 * `FileSystemUtilities/FileSystemLegacyUtilities.swift:98-123`.)
 *
 * Regras (fail-closed — na dúvida, recusa e nada é tocado):
 *   - não-`file:` ⇒ recusa; raiz de blobs indisponível ⇒ recusa (sem raiz não há o que validar);
 *   - qualquer segmento `..` ⇒ recusa ANTES de recompor (um ponteiro com travessia nunca vira alvo);
 *   - recompõe para a raiz ATUAL (mesma regra da leitura), então exige `startsWith` do escopo;
 *   - `requireSubdir` fixa o escopo num subdiretório (o C60 fixa `drawings60/`, isolando `drawings/`);
 *   - o restante precisa ser ARQUIVO: não-vazio e sem `/` final — nunca um diretório;
 *   - `protect` blinda URIs vivas (o snapshot recém-promovido), comparadas JÁ RECOMPOSTAS E
 *     NORMALIZADAS: assim duas URIs que só diferem pelo container antigo — ou por `//` e `/./` —
 *     não passam por "arquivos diferentes";
 *   - percent-encoding é recusado: nenhum ponteiro deste módulo contém `%` (os nomes saem de
 *     `safeName`), então decodificar mudar a string significa origem estranha ⇒ fail-closed;
 *   - opção malformada (`requireSubdir` não-string/vazio, `protect` não-string) é RECUSA, nunca
 *     degradação silenciosa: os dois modos de falha desse tipo são ABERTOS (alargam o escopo ou
 *     esvaziam a blindagem), e um erro de digitação num chamador futuro não pode custar uma arte.
 */
export function resolveBlobDeletionTarget(uri, currentRoot, options = {}) {
  if (!isFileUri(uri)) return { ok: false, reason: 'nao_e_file_uri', uri: null };
  if (typeof currentRoot !== 'string' || !currentRoot) {
    return { ok: false, reason: 'raiz_indisponivel', uri: null };
  }
  if (TEM_TRAVESSIA.test(uri)) return { ok: false, reason: 'travessia', uri: null };

  // O nativo decodifica antes de resolver: o veto tem de enxergar a forma DECODIFICADA.
  const decodificada = decodificarTudo(uri);
  if (decodificada === null) return { ok: false, reason: 'percent_suspeito', uri: null };
  if (TEM_TRAVESSIA.test(decodificada)) return { ok: false, reason: 'travessia', uri: null };
  if (decodificada !== uri) return { ok: false, reason: 'percent_suspeito', uri: null };

  // Opções malformadas falham FECHADO — antes de qualquer cálculo de escopo.
  const subBruto = options.requireSubdir;
  if (subBruto != null && (typeof subBruto !== 'string' || !subBruto.replace(/^\/+|\/+$/g, ''))) {
    return { ok: false, reason: 'opcoes_invalidas', uri: null };
  }
  const protectBruto = options.protect == null
    ? []
    : (Array.isArray(options.protect) ? options.protect : [options.protect]);
  if (protectBruto.some((p) => typeof p !== 'string' || !p)) {
    return { ok: false, reason: 'opcoes_invalidas', uri: null };
  }

  const raiz = normalizarCaminho(currentRoot.endsWith('/') ? currentRoot : currentRoot + '/');
  const sub = typeof subBruto === 'string' ? subBruto.replace(/^\/+|\/+$/g, '') : '';
  const escopo = sub ? raiz + sub + '/' : raiz;

  const alvo = normalizarCaminho(recomposeBlobUri(uri, raiz));
  if (TEM_TRAVESSIA.test(alvo)) return { ok: false, reason: 'travessia', uri: null };
  if (!alvo.startsWith(escopo)) return { ok: false, reason: 'fora_da_raiz', uri: null };

  const resto = alvo.slice(escopo.length);
  if (!resto || resto.endsWith('/')) return { ok: false, reason: 'nao_e_arquivo', uri: null };

  const protegidas = protectBruto.map((p) => normalizarCaminho(recomposeBlobUri(p, raiz)));
  if (protegidas.includes(alvo)) return { ok: false, reason: 'protegido', uri: null };

  return { ok: true, reason: 'contido', uri: alvo };
}

/**
 * Apaga UM arquivo de blob, e somente dentro da raiz autorizada. Nunca lança, nunca é recursiva,
 * nunca apaga por prefixo e nunca toca um diretório — o alvo é sempre um caminho de arquivo único
 * resolvido por `resolveBlobDeletionTarget`. Ausência do arquivo é limpeza JÁ SATISFEITA, não erro,
 * e por isso a existência é sondada antes de chamar o nativo. Idempotente por construção.
 *
 * `options.requireSubdir` fixa o subdiretório autorizado; `options.protect` blinda URIs vivas.
 */
export async function deleteBlob(uri, options = {}) {
  const alvo = resolveBlobDeletionTarget(uri, currentBlobsRoot(), options);
  if (!alvo.ok) {
    // Recusa é RESULTADO, não exceção: uma limpeza best-effort jamais invalida a obra já salva.
    // `nao_e_file_uri` é o caso trivial (payload inline) e não merece ruído no log.
    if (alvo.reason !== 'nao_e_file_uri') log('fileBlobStore.deleteBlob: recusado —', alvo.reason);
    return { outcome: BLOB_DELETE_OUTCOME.REFUSED, reason: alvo.reason };
  }
  try {
    const info = await FileSystem.getInfoAsync(alvo.uri);
    if (!info || !info.exists) {
      return { outcome: BLOB_DELETE_OUTCOME.ALREADY_ABSENT, reason: 'inexistente' };
    }
    // Última barreira ANTES do nativo: o nome pode ser de arquivo e o inode ser um diretório.
    // Exclusão de blob jamais atinge diretório — nem por engano, nem por ponteiro corrompido.
    if (info.isDirectory) {
      log('fileBlobStore.deleteBlob: recusado — alvo é diretório');
      return { outcome: BLOB_DELETE_OUTCOME.REFUSED, reason: 'e_diretorio' };
    }
    await FileSystem.deleteAsync(alvo.uri, { idempotent: true });
    return { outcome: BLOB_DELETE_OUTCOME.DELETED, reason: 'contido' };
  } catch (e) {
    log('fileBlobStore.deleteBlob:', e);
    return { outcome: BLOB_DELETE_OUTCOME.FAILED, reason: 'erro' };
  }
}
