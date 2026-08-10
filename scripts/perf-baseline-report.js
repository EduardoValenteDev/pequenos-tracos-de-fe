#!/usr/bin/env node
/**
 * perf-baseline-report.js — agrega amostras `[PTF_PERF_SAMPLE]` do boot (LP1M-B).
 *
 * Uso:
 *   node scripts/perf-baseline-report.js C:\tmp\ptf_perf_baseline.log
 *
 * Contrato: só LÊ o arquivo (nunca escreve nele), ignora ruído (log do Metro etc.), valida o
 * schema, rejeita amostra inválida e reporta quantas entraram e quantas caíram. Sem dependência.
 *
 * Estatística: mediana e p90 são os indicadores. A MÉDIA é omitida de propósito — poucas amostras
 * com um outlier (boot térmico, GC) deslocam a média e sugerem otimização sem evidência.
 *
 * Valor ausente é `null` e é CONTADO, nunca substituído por zero: "não medido" ≠ "instantâneo".
 */
'use strict';

const fs = require('fs');

const PREFIX = '[PTF_PERF_SAMPLE]';
// v2 — [F6-R3.x · P-139] acrescentou `terminal`. Nenhuma amostra v1 foi coletada (o coletor
// nunca foi alcançável fora de `__DEV__`), então a subida não descarta baseline alguma.
const SCHEMA = 2;

const METRICS = [
  'fontGateMs',
  'routeDecisionMs',
  'splashReactMs',
  'firstLayoutMs',
  'profileHydrationMs',
  'progressHydrationMs',
  'packsHydrationMs',
];

/** Campos obrigatórios (podem ser null, mas têm de existir). */
const FIELDS = ['schema', 'terminal', 'route', 'fontReason', 'routeReason', ...METRICS, 'bufferDropped'];

/* ─────────────────────────── Leitura tolerante a encoding ─────────────────────────── */
/*
 * O PowerShell do Windows grava `Tee-Object`/`>` em UTF-16LE com BOM. Ler o arquivo como UTF-8
 * (fixo) fazia o agregador encontrar ZERO amostras num log que tinha 11 — ou seja, ele não era
 * compatível com o fluxo de coleta que ele mesmo documenta. A detecção abaixo é por BOM (fato,
 * não palpite) com uma heurística defensiva só para UTF-16LE sem BOM.
 */

/** Só é UTF-16LE sem BOM se os bytes ímpares forem NUL de forma sistemática. */
function looksLikeUtf16LeNoBom(buf) {
  const n = Math.min(buf.length, 512);
  if (n < 4) return false;
  let pairs = 0;
  let oddNul = 0;
  let evenNul = 0;
  for (let i = 0; i + 1 < n; i += 2) {
    pairs += 1;
    if (buf[i] === 0x00) evenNul += 1;
    if (buf[i + 1] === 0x00) oddNul += 1;
  }
  if (!pairs) return false;
  // Texto UTF-8 legítimo praticamente não tem NUL, então oddNul/pairs fica ~0 e isto dá false.
  return (oddNul / pairs) >= 0.9 && (evenNul / pairs) <= 0.1;
}

/**
 * Decodifica o Buffer para texto. Devolve { text, encoding, truncated }.
 * NÃO adivinha conteúdo: só escolhe o decodificador. Lança em caso não suportado.
 */
function decodeBuffer(buf) {
  if (buf.length === 0) return { text: '', encoding: 'vazio', truncated: false };

  // UTF-8 com BOM
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    return { text: buf.slice(3).toString('utf8'), encoding: 'utf8-bom', truncated: false };
  }
  // UTF-16LE com BOM (o caso do PowerShell)
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
    const body = buf.slice(2);
    const even = body.length - (body.length % 2);
    return {
      text: body.slice(0, even).toString('utf16le'),
      encoding: 'utf16le-bom',
      truncated: even !== body.length,
    };
  }
  // UTF-16BE com BOM: Node não decodifica BE, então trocamos os bytes numa CÓPIA.
  if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
    const body = buf.slice(2);
    const even = body.length - (body.length % 2);
    const copy = Buffer.from(body.slice(0, even));   // cópia: o buffer de entrada não é mexido
    copy.swap16();                                   // exige comprimento par (garantido acima)
    return { text: copy.toString('utf16le'), encoding: 'utf16be-bom', truncated: even !== body.length };
  }
  // UTF-16LE sem BOM (defensivo)
  if (looksLikeUtf16LeNoBom(buf)) {
    const even = buf.length - (buf.length % 2);
    return {
      text: buf.slice(0, even).toString('utf16le'),
      encoding: 'utf16le-sem-bom',
      truncated: even !== buf.length,
    };
  }
  // UTF-8 sem BOM (padrão)
  return { text: buf.toString('utf8'), encoding: 'utf8', truncated: false };
}

/** Lê o arquivo (somente leitura) e devolve texto normalizado só para parsing. */
function readTextFile(file) {
  const buf = fs.readFileSync(file);          // Buffer: nunca escreve, nunca altera a entrada
  const out = decodeBuffer(buf);
  // Um BOM residual viraria lixo na 1a linha e quebraria o match do prefixo.
  if (out.text.charCodeAt(0) === 0xFEFF) out.text = out.text.slice(1);
  return out;
}

/** Extrai o JSON de uma linha com o prefixo. Ruído → null. */
function parseLine(line) {
  const at = line.indexOf(PREFIX);
  if (at === -1) return null;
  const raw = line.slice(at + PREFIX.length).trim();
  try {
    const obj = JSON.parse(raw);
    return (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : null;
  } catch (e) {
    return null;   // linha truncada/entrelaçada pelo Metro → descartada, não adivinhada
  }
}

/** Valida o schema. Devolve { ok, reason }. */
function validate(sample) {
  if (!sample) return { ok: false, reason: 'json invalido' };
  if (sample.schema !== SCHEMA) return { ok: false, reason: `schema ${JSON.stringify(sample.schema)} != ${SCHEMA}` };
  for (const f of FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(sample, f)) return { ok: false, reason: `campo ausente: ${f}` };
  }
  for (const m of METRICS) {
    const v = sample[m];
    if (v !== null && (typeof v !== 'number' || !Number.isFinite(v))) {
      return { ok: false, reason: `${m} nao e numero nem null` };
    }
  }
  if (sample.route !== null && typeof sample.route !== 'string') return { ok: false, reason: 'route invalida' };
  if (sample.terminal !== 'first_layout' && sample.terminal !== 'ceiling') {
    return { ok: false, reason: `terminal ${JSON.stringify(sample.terminal)} desconhecido` };
  }
  // Defesa em profundidade: amostra com TODAS as métricas nulas não é boot medido — é ruído
  // (ex.: emissor destravado por reavaliação de módulo com o buffer já limpo). Não entra.
  //
  // EXCEÇÃO [F6-R3.x · P-139]: a amostra por TETO é o caso em que "nada foi medido" é o
  // próprio achado — o boot começou e não chegou a lugar nenhum. Descartá-la devolveria o
  // silêncio que este bloco existe para acabar. Ela entra, e o relatório a separa.
  if (sample.terminal !== 'ceiling' && METRICS.every((m) => sample[m] === null)) {
    return { ok: false, reason: 'amostra sem nenhuma metrica medida' };
  }
  return { ok: true };
}

const sortNum = (a, b) => a - b;

/** Percentil por interpolação linear — método INCLUSIVO (R-7 / PERCENTILE.INC). */
function percentile(values, p) {
  if (!values.length) return null;
  const v = values.slice().sort(sortNum);
  if (v.length === 1) return v[0];
  const idx = (v.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return v[lo];
  return v[lo] + (v[hi] - v[lo]) * (idx - lo);
}

const median = (v) => percentile(v, 0.5);
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

function statsFor(samples, metric) {
  const present = samples.map((s) => s[metric]).filter((v) => typeof v === 'number');
  const missing = samples.length - present.length;
  if (!present.length) return { n: 0, missing, min: null, median: null, p90: null, max: null };
  const sorted = present.slice().sort(sortNum);
  return {
    n: present.length,
    missing,
    min: sorted[0],
    median: round1(median(present)),
    p90: round1(percentile(present, 0.9)),
    max: sorted[sorted.length - 1],
  };
}

function fmt(v) { return v == null ? '-' : String(v); }
function pad(s, n) { s = String(s); return s + ' '.repeat(Math.max(0, n - s.length)); }

function table(title, samples) {
  const lines = [];
  lines.push('');
  lines.push(`${title}  (n=${samples.length})`);
  lines.push(`  ${pad('metrica', 22)}${pad('n', 5)}${pad('ausente', 9)}${pad('min', 9)}${pad('mediana', 10)}${pad('p90', 9)}${pad('max', 9)}`);
  for (const m of METRICS) {
    const s = statsFor(samples, m);
    lines.push(`  ${pad(m, 22)}${pad(s.n, 5)}${pad(s.missing, 9)}${pad(fmt(s.min), 9)}${pad(fmt(s.median), 10)}${pad(fmt(s.p90), 9)}${pad(fmt(s.max), 9)}`);
  }
  return lines.join('\n');
}

function groupBy(samples, key) {
  const out = new Map();
  for (const s of samples) {
    const k = s[key] == null ? '(null)' : String(s[key]);
    if (!out.has(k)) out.set(k, []);
    out.get(k).push(s);
  }
  return out;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('uso: node scripts/perf-baseline-report.js <arquivo.log>');
    process.exit(2);
  }
  let decoded;
  try {
    decoded = readTextFile(file);           // somente leitura; detecta UTF-8/UTF-16 por BOM
  } catch (e) {
    console.error(`ERRO: nao foi possivel ler ${file}: ${e.message}`);
    process.exit(2);
  }
  const text = decoded.text;

  const lines = text.split(/\r?\n/);
  const accepted = [];
  const rejected = [];
  let withPrefix = 0;

  for (const line of lines) {
    if (line.indexOf(PREFIX) === -1) continue;   // ruído do Metro → ignorado silenciosamente
    withPrefix += 1;
    const parsed = parseLine(line);
    const v = validate(parsed);
    if (v.ok) accepted.push(parsed);
    else rejected.push(v.reason);
  }

  console.log('== Baseline do caminho JavaScript (LP1M-B) ==');
  console.log(`encoding detectado: ${decoded.encoding}${decoded.truncated ? ' (arquivo truncado: byte final impar descartado)' : ''}`);
  console.log(`arquivo: ${file}`);
  console.log(`linhas com ${PREFIX}: ${withPrefix} | aceitas: ${accepted.length} | descartadas: ${rejected.length}`);
  if (rejected.length) {
    const why = new Map();
    rejected.forEach((r) => why.set(r, (why.get(r) || 0) + 1));
    for (const [reason, count] of why) console.log(`  descartada x${count}: ${reason}`);
  }
  if (!accepted.length) {
    console.log('\nNenhuma amostra valida - nada a reportar. (Numeros nao sao inventados.)');
    process.exit(1);
  }

  const dropped = accepted.filter((s) => s.bufferDropped > 0).length;
  if (dropped) console.log(`aviso: ${dropped} amostra(s) com bufferDropped > 0 (buffer do trace estourou)`);

  // Boots que nunca chegaram ao primeiro layout. NAO sao ruido: sao o achado.
  const porTeto = accepted.filter((s) => s.terminal === 'ceiling').length;
  if (porTeto) {
    console.log(`ATENCAO: ${porTeto} boot(s) terminaram por TETO (o primeiro layout da rota inicial nunca chegou).`);
  }

  console.log(table('TODAS as amostras', accepted));
  for (const [term, group] of groupBy(accepted, 'terminal')) {
    console.log(table(`Por terminal: ${term}`, group));
  }

  for (const [route, group] of groupBy(accepted, 'route')) {
    console.log(table(`Por rota: ${route}`, group));
  }
  for (const [reason, group] of groupBy(accepted, 'fontReason')) {
    console.log(table(`Por fontReason: ${reason}`, group));
  }
  for (const [reason, group] of groupBy(accepted, 'routeReason')) {
    console.log(table(`Por routeReason: ${reason}`, group));
  }

  console.log('');
  console.log('Indicadores = mediana e p90 (media omitida de proposito: outlier engana com n pequeno).');
  console.log('Ausente = nao medido neste boot; NUNCA lido como zero.');
  console.log('Esta baseline NAO mede init nativo, splash nativa, parse do bundle nem nada anterior ao bootMark.');
}

if (require.main === module) main();

module.exports = {
  parseLine, validate, percentile, median, statsFor, groupBy,
  readTextFile, decodeBuffer, looksLikeUtf16LeNoBom,
  PREFIX, SCHEMA, METRICS,
};
