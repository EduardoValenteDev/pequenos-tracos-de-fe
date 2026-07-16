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
const SCHEMA = 1;

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
const FIELDS = ['schema', 'route', 'fontReason', 'routeReason', ...METRICS, 'bufferDropped'];

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
  if (!sample) return { ok: false, reason: 'json inválido' };
  if (sample.schema !== SCHEMA) return { ok: false, reason: `schema ${JSON.stringify(sample.schema)} ≠ ${SCHEMA}` };
  for (const f of FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(sample, f)) return { ok: false, reason: `campo ausente: ${f}` };
  }
  for (const m of METRICS) {
    const v = sample[m];
    if (v !== null && (typeof v !== 'number' || !Number.isFinite(v))) {
      return { ok: false, reason: `${m} não é número nem null` };
    }
  }
  if (sample.route !== null && typeof sample.route !== 'string') return { ok: false, reason: 'route inválida' };
  // Defesa em profundidade: amostra com TODAS as métricas nulas não é boot medido — é ruído
  // (ex.: emissor destravado por reavaliação de módulo com o buffer já limpo). Não entra.
  if (METRICS.every((m) => sample[m] === null)) return { ok: false, reason: 'amostra sem nenhuma métrica medida' };
  return { ok: true };
}

const sortNum = (a, b) => a - b;

/** Percentil por interpolação linear (o método padrão de "percentil exclusivo/linear"). */
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

function fmt(v) { return v == null ? '—' : String(v); }
function pad(s, n) { s = String(s); return s + ' '.repeat(Math.max(0, n - s.length)); }

function table(title, samples) {
  const lines = [];
  lines.push('');
  lines.push(`${title}  (n=${samples.length})`);
  lines.push(`  ${pad('métrica', 22)}${pad('n', 5)}${pad('ausente', 9)}${pad('min', 9)}${pad('mediana', 10)}${pad('p90', 9)}${pad('máx', 9)}`);
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
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');   // somente leitura — a entrada nunca é alterada
  } catch (e) {
    console.error(`não foi possível ler ${file}: ${e.message}`);
    process.exit(2);
  }

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

  console.log('── Baseline do caminho JavaScript (LP1M-B) ──');
  console.log(`arquivo: ${file}`);
  console.log(`linhas com ${PREFIX}: ${withPrefix} · aceitas: ${accepted.length} · descartadas: ${rejected.length}`);
  if (rejected.length) {
    const why = new Map();
    rejected.forEach((r) => why.set(r, (why.get(r) || 0) + 1));
    for (const [reason, count] of why) console.log(`  descartada ×${count}: ${reason}`);
  }
  if (!accepted.length) {
    console.log('\nNenhuma amostra válida — nada a reportar. (Não são inventados números.)');
    process.exit(1);
  }

  const dropped = accepted.filter((s) => s.bufferDropped > 0).length;
  if (dropped) console.log(`aviso: ${dropped} amostra(s) com bufferDropped > 0 (buffer do trace estourou)`);

  console.log(table('TODAS as amostras', accepted));

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
  console.log('Indicadores = mediana e p90 (média omitida de propósito: outlier engana com n pequeno).');
  console.log('Ausente = não medido neste boot; NUNCA lido como zero.');
  console.log('Esta baseline NÃO mede init nativo, splash nativa, parse do bundle nem nada anterior ao bootMark.');
}

if (require.main === module) main();

module.exports = { parseLine, validate, percentile, median, statsFor, groupBy, PREFIX, SCHEMA, METRICS };
