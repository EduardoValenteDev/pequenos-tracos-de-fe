/**
 * packPublishMarker.js — Núcleo PURO do marcador de publicação validada (LP2.1a-ii-C).
 *
 * ⚠️ PURO: SEM FileSystem, SEM AsyncStorage, SEM I/O, SEM rede. Só construção e DECISÃO.
 * A casca (ler/escrever/hashear) vive no packDownloadService e no packRecoveryService.
 *
 * ── Por que este arquivo existe ──
 * A publicação de um pack são DOIS passos não atômicos: `moveAsync(.tmp → localDir)` e
 * `setPackEntry(READY)`. Um encerramento entre eles deixa o conteúdo ÍNTEGRO no disco e o índice
 * dizendo `downloading` (ou nada, numa instalação nova). O pack existe, é pago, e o app o trata
 * como ausente — para sempre, se o usuário estiver offline.
 *
 * Recuperar exige EVIDÊNCIA de que aquele conteúdo foi validado antes de ser publicado. O disco
 * sozinho não tem essa evidência: o `manifest.json` local prova apenas que o diretório é
 * auto-consistente, NÃO que aquele manifesto é o que o manifesto global ANCOROU — o
 * `manifestSha256` não é persistido em lugar nenhum (nem no índice).
 *
 * O marcador fecha essa lacuna: é escrito no `.tmp` DEPOIS de toda a validação e ANTES do move,
 * então a prova viaja junto com o conteúdo — o mesmo `moveAsync` publica os arquivos e a evidência
 * de que eles foram validados.
 *
 * ── O que ele NÃO é ──
 * NÃO é assinatura criptográfica nem proteção contra adulteração hostil: quem tem acesso ao
 * sandbox do app pode forjar marcador e conteúdo coerentes. Ele preserva a evidência de uma
 * validação JÁ REALIZADA pelo downloader — nada mais.
 *
 * NÃO é a identidade resolvida do bloco D: guarda a identidade de UMA instalação específica já
 * concluída, para fins transacionais. A coordenação de identidade ENTRE solicitações segue sendo
 * do bloco D.
 *
 * NÃO é conteúdo: é metadado interno, local. Não vem do R2, não vai para o R2, não entra em
 * `totalBytes` e não é servido a consumidores de cena/imagem/áudio.
 */

/** Nome RESERVADO do marcador, na raiz do diretório do pack. Nenhum arquivo do manifesto pode usá-lo. */
export const MARKER_FILENAME = '.ptf-publish.json';

/** Versão do schema do marcador. Desconhecida → não recuperável (conservador), nunca "adivinha". */
export const MARKER_SCHEMA_VERSION = 1;

const SHA256_HEX = /^[a-f0-9]{64}$/;
const SLUG = /^[a-z0-9_]+$/;
const SEMVER = /^\d+\.\d+\.\d+$/;

/**
 * Normaliza um caminho declarado no manifesto para COMPARAÇÃO de colisão.
 *
 * Comparar a string crua não basta: `./.ptf-publish.json`, `.\.ptf-publish.json` e
 * `.PTF-Publish.JSON` viram o MESMO arquivo em disco (iOS/APFS é case-insensitive por padrão),
 * e cada um passaria por uma comparação ingênua.
 *
 * Não substitui as regras de segurança do downloader (`/` inicial e `..` seguem rejeitados lá):
 * isto existe SÓ para decidir colisão com o nome reservado.
 *
 * @param {unknown} path
 * @returns {string} forma canônica ('' se não for string utilizável)
 */
export function normalizePackFilePath(path) {
  if (typeof path !== 'string') return '';
  let p = path.trim().replace(/\\/g, '/');   // separador do Windows → '/'
  p = p.replace(/\/{2,}/g, '/');             // '//' → '/'
  while (p.startsWith('./')) p = p.slice(2); // './x' → 'x' (repetido: './././x')
  if (p.startsWith('/')) p = p.replace(/^\/+/, '');
  return p.toLowerCase();                    // conservador: o FS alvo pode ser case-insensitive
}

/**
 * O caminho colide com o marcador reservado?
 *
 * Só a RAIZ colide: `sub/.ptf-publish.json` é outro arquivo e é permitido.
 * @param {unknown} path
 * @returns {boolean}
 */
export function collidesWithMarker(path) {
  return normalizePackFilePath(path) === MARKER_FILENAME;
}

/**
 * Todos os caminhos do manifesto que colidem com o marcador.
 *
 * Verifica a lista INTEIRA (não só os kinds pedidos): um manifesto que declara o nome reservado é
 * malformado, independentemente de aquele arquivo vir a ser baixado nesta chamada.
 * @param {Array<{path?: unknown}>|unknown} files
 * @returns {string[]} os caminhos ORIGINAIS que colidem (para a mensagem de erro)
 */
export function findMarkerCollisions(files) {
  if (!Array.isArray(files)) return [];
  return files
    .filter((f) => f && collidesWithMarker(f.path))
    .map((f) => String(f.path));
}

/**
 * Constrói o marcador. Só campos necessários — sem segredos, sem URLs (o `baseUrl` é temporário e
 * não é evidência de validação).
 *
 * @param {{ storyId: string, version: string, manifestSha256: string, manifestPath: string,
 *           kinds: string[], appVersion: string }} params
 * @returns {object} marcador pronto para serializar
 */
export function buildPublishMarker({ storyId, version, manifestSha256, manifestPath, kinds, appVersion }) {
  return {
    schemaVersion: MARKER_SCHEMA_VERSION,
    storyId: String(storyId),
    version: String(version),
    manifestSha256: String(manifestSha256).toLowerCase(),
    manifestPath: String(manifestPath),
    kinds: (Array.isArray(kinds) ? kinds : []).slice().sort(),   // forma canônica, como packInstallKey
    appVersion: String(appVersion),
  };
}

/**
 * O marcador é estruturalmente válido? (só forma — correspondência é `validatePublishMarker`)
 * @param {unknown} marker
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateMarkerSchema(marker) {
  const errors = [];
  if (!marker || typeof marker !== 'object' || Array.isArray(marker)) {
    return { ok: false, errors: ['marcador: deve ser objeto'] };
  }
  if (marker.schemaVersion !== MARKER_SCHEMA_VERSION) {
    errors.push(`marcador.schemaVersion: deve ser ${MARKER_SCHEMA_VERSION}`);
  }
  if (typeof marker.storyId !== 'string' || !SLUG.test(marker.storyId)) {
    errors.push('marcador.storyId: slug [a-z0-9_]');
  }
  if (typeof marker.version !== 'string' || !SEMVER.test(marker.version)) {
    errors.push('marcador.version: semver x.y.z');
  }
  if (typeof marker.manifestSha256 !== 'string' || !SHA256_HEX.test(marker.manifestSha256)) {
    errors.push('marcador.manifestSha256: hex de 64 caracteres minúsculo');
  }
  if (typeof marker.manifestPath !== 'string' || !marker.manifestPath) {
    errors.push('marcador.manifestPath: string obrigatória');
  }
  if (!Array.isArray(marker.kinds) || marker.kinds.length === 0
      || !marker.kinds.every((k) => typeof k === 'string' && k)) {
    errors.push('marcador.kinds: array de strings não vazio');
  }
  if (typeof marker.appVersion !== 'string' || !marker.appVersion) {
    errors.push('marcador.appVersion: string obrigatória');
  }
  return { ok: errors.length === 0, errors };
}

/**
 * DECISÃO PURA: este marcador comprova que ESTE diretório, com ESTE manifesto, foi validado antes
 * de ser publicado — e serve à história/versão/kinds que se pede agora?
 *
 * NÃO valida os arquivos (isso exige I/O; é a casca do recovery que hashea e chama isto).
 *
 * Sobre `appVersion`: é EVIDÊNCIA de quando a validação ocorreu, NÃO um portão. Bloquear por ela
 * quebraria a recuperação depois de todo update do app. A compatibilidade real é o `minAppVersion`
 * do manifesto, revalidado contra o app ATUAL pelo `validatePackManifest` da casca.
 *
 * @param {unknown} marker              o marcador lido do disco
 * @param {object} ctx
 * @param {string} ctx.storyId          história solicitada
 * @param {string} ctx.dirStoryId       storyId derivado do NOME do diretório
 * @param {string} ctx.dirVersion       version derivada do NOME do diretório
 * @param {string} ctx.manifestSha256   sha256 REAL do manifest.json do disco (calculado pela casca)
 * @param {object} ctx.manifest         manifesto local já parseado
 * @param {string[]} ctx.requestedKinds kinds que o chamador pediu agora
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validatePublishMarker(marker, ctx) {
  const schema = validateMarkerSchema(marker);
  if (!schema.ok) return schema;

  const errors = [];
  const { storyId, dirStoryId, dirVersion, manifestSha256, manifest, requestedKinds } = ctx || {};

  // Identidade: marcador × pedido × NOME DO DIRETÓRIO × manifesto — os quatro têm de concordar.
  if (marker.storyId !== storyId) errors.push(`marcador.storyId (${marker.storyId}) != solicitado (${storyId})`);
  if (marker.storyId !== dirStoryId) errors.push(`marcador.storyId (${marker.storyId}) != diretório (${dirStoryId})`);
  if (marker.version !== dirVersion) errors.push(`marcador.version (${marker.version}) != diretório (${dirVersion})`);
  if (!manifest || typeof manifest !== 'object') {
    errors.push('manifesto local ausente/inválido');
  } else {
    if (manifest?.metadata?.storyId !== marker.storyId) {
      errors.push(`manifesto.metadata.storyId (${manifest?.metadata?.storyId}) != marcador (${marker.storyId})`);
    }
    if (manifest?.version !== marker.version) {
      errors.push(`manifesto.version (${manifest?.version}) != marcador (${marker.version})`);
    }
  }

  // O ELO QUE FECHA A LACUNA: os bytes do manifesto local batem com a âncora preservada.
  // É isto — e só isto — que prova que o manifesto do disco é o que o manifesto global ancorou.
  if (typeof manifestSha256 !== 'string' || manifestSha256.toLowerCase() !== marker.manifestSha256) {
    errors.push('manifest.json do disco com sha256 divergente da âncora preservada no marcador');
  }

  // O que foi publicado precisa COBRIR o que se pede: instalar só cenas e pedir cenas+áudio não serve.
  const have = new Set(marker.kinds);
  const missing = (Array.isArray(requestedKinds) ? requestedKinds : []).filter((k) => !have.has(k));
  if (missing.length) errors.push(`kinds pedidos ausentes na publicação: ${missing.join(',')}`);

  return { ok: errors.length === 0, errors };
}

/**
 * Extrai `{storyId, version}` do NOME de um diretório de pack (`<storyId>@<version>`).
 *
 * O separador é seguro: `storyId` é slug `[a-z0-9_]` e `version` é semver — nenhum contém '@'.
 * @param {unknown} name nome simples do diretório (sem barras)
 * @returns {{ storyId: string, version: string }|null} null se não casar com o formato
 */
export function parsePackDirName(name) {
  if (typeof name !== 'string') return null;
  const at = name.indexOf('@');
  if (at <= 0 || at === name.length - 1) return null;
  const storyId = name.slice(0, at);
  const version = name.slice(at + 1);
  if (!SLUG.test(storyId) || !SEMVER.test(version)) return null;
  return { storyId, version };
}

/**
 * Filtra nomes de diretório que pertencem EXATAMENTE a esta história.
 *
 * Compara o storyId PARSEADO, nunca prefixo de string: `startsWith('noah')` capturaria
 * `noah_ark@1.0.0`, abrindo candidatos de OUTRA história — proibido pelo contrato.
 * Descarta `.tmp` (que vive dentro de `packs/`) e qualquer nome fora do formato.
 *
 * @param {string[]} names nomes crus de `readDirectoryAsync(packs/)`
 * @param {string} storyId
 * @returns {Array<{ name: string, storyId: string, version: string }>}
 */
export function selectStoryPackDirs(names, storyId) {
  if (!Array.isArray(names) || !storyId) return [];
  const out = [];
  for (const name of names) {
    const parsed = parsePackDirName(name);
    if (!parsed) continue;                    // '.tmp' e lixo caem aqui
    if (parsed.storyId !== storyId) continue; // igualdade, NUNCA prefixo
    out.push({ name, ...parsed });
  }
  return out;
}
