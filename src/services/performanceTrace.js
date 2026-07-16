/**
 * performanceTrace.js — instrumentação LOCAL do boot (LP1M-A). Diagnóstico, não produto.
 *
 * Existe para MEDIR antes de otimizar (Constituição, Princípio IV: "medir antes de refatorações
 * amplas"). Responde onde o boot gasta tempo: gate de fontes, decisão de rota, hidratação dos
 * providers e primeiro layout da rota inicial.
 *
 * Garantias (contrato do bloco):
 *  • SEM rede, SEM AsyncStorage, SEM FileSystem, SEM dependência nova, SEM analytics.
 *  • SEM PII: a metadata passa por uma ALLOWLIST de chaves e só aceita primitivos seguros —
 *    nome, avatar, perfil, e-mail, id ou texto de história são descartados por construção.
 *  • Só memória, com buffer limitado. Nunca lança: qualquer falha aqui é engolida (o app não pode
 *    quebrar por causa de diagnóstico).
 *  • Desativável: fora de DEV só liga com EXPO_PUBLIC_PTF_PERF_TRACE=1. Desligada, `mark` sai no
 *    primeiro `if` e não guarda nada.
 *  • Não faz setState, não altera readiness e não muda o comportamento do que mede.
 */

/** Teto do buffer em memória (eventos além disso são contados como descartados). */
export const TRACE_BUFFER_LIMIT = 200;
/** Máximo de chaves de metadata por evento. */
export const TRACE_MAX_META_KEYS = 4;

/**
 * ALLOWLIST de chaves de metadata — defesa primária contra PII. Nada fora daqui é gravado.
 * `reason`/`status` = 'loaded'|'error'|'timeout'; `route` = 'Home'|'Onboarding'; `attempt`/`count`
 * = número; `ok` = booleano.
 */
const ALLOWED_META_KEYS = ['reason', 'route', 'status', 'attempt', 'count', 'ok'];

/** Nome de marca: identificador curto em snake_case. */
const SAFE_NAME = /^[a-z][a-z0-9_]{0,39}$/;
/**
 * Valor string: identificador curto. Exclui por construção nome com espaço/acento, e-mail (@),
 * frase, JSON, URL e qualquer texto livre — só passa rótulo técnico.
 */
const SAFE_VALUE = /^[A-Za-z_][A-Za-z0-9_]{0,23}$/;

const events = [];
const measures = [];
const onceEmitted = new Set();
let dropped = 0;

/** Ligada em DEV; fora de DEV, só com a flag explícita de diagnóstico. */
export function isPerformanceTraceEnabled() {
  try {
    if (typeof __DEV__ !== 'undefined' && __DEV__) return true;
    return process.env.EXPO_PUBLIC_PTF_PERF_TRACE === '1';
  } catch (e) {
    return false;
  }
}

/** Relógio monotônico quando existe; Date.now() só como fallback. */
function now() {
  try {
    const perf = globalThis.performance;
    if (perf && typeof perf.now === 'function') return perf.now();
  } catch (e) { /* noop */ }
  return Date.now();
}

/** Mantém só chaves da allowlist com primitivos seguros. Qualquer outra coisa é descartada. */
export function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined;
  const out = {};
  let kept = 0;
  for (let i = 0; i < ALLOWED_META_KEYS.length; i += 1) {
    const key = ALLOWED_META_KEYS[i];
    if (kept >= TRACE_MAX_META_KEYS) break;
    if (!Object.prototype.hasOwnProperty.call(metadata, key)) continue;
    const value = metadata[key];
    if (typeof value === 'number' && Number.isFinite(value)) { out[key] = value; kept += 1; continue; }
    if (typeof value === 'boolean') { out[key] = value; kept += 1; continue; }
    if (typeof value === 'string' && SAFE_VALUE.test(value)) { out[key] = value; kept += 1; continue; }
    // objeto, array, null, string livre (nome/e-mail/frase/JSON) → descartado
  }
  return kept ? out : undefined;
}

/** Registra uma marca. Nunca lança, nunca loga por marca, nunca faz setState. */
export function mark(name, metadata) {
  try {
    if (!isPerformanceTraceEnabled()) return;
    if (typeof name !== 'string' || !SAFE_NAME.test(name)) return;
    if (events.length >= TRACE_BUFFER_LIMIT) { dropped += 1; return; }
    events.push({ name, t: now(), meta: sanitizeMetadata(metadata) });
  } catch (e) { /* diagnóstico nunca afeta o app */ }
}

/** Marca que só pode ser emitida UMA vez por boot (evento terminal / primeiro layout). */
export function markOnce(name, metadata) {
  try {
    if (!isPerformanceTraceEnabled()) return;
    if (typeof name !== 'string' || !SAFE_NAME.test(name)) return;
    if (onceEmitted.has(name)) return;
    onceEmitted.add(name);
    mark(name, metadata);
  } catch (e) { /* noop */ }
}

function firstEvent(name) {
  for (let i = 0; i < events.length; i += 1) if (events[i].name === name) return events[i];
  return null;
}

/** Duração entre duas marcas (primeira ocorrência de cada). Devolve null se faltar alguma. */
export function measure(name, startMark, endMark) {
  try {
    if (!isPerformanceTraceEnabled()) return null;
    const a = firstEvent(startMark);
    const b = firstEvent(endMark);
    if (!a || !b) return null;
    const duration = b.t - a.t;
    measures.push({ name, startMark, endMark, duration });
    return duration;
  } catch (e) {
    return null;
  }
}

/** Cópia do estado atual. Só em DEV ou com a flag ligada. */
export function getSnapshot() {
  try {
    if (!isPerformanceTraceEnabled()) return null;
    return {
      events: events.map((e) => ({ ...e })),
      measures: measures.map((m) => ({ ...m })),
      dropped,
      limit: TRACE_BUFFER_LIMIT,
    };
  } catch (e) {
    return null;
  }
}

/** Limpa tudo (inclusive as marcas de uma-vez). */
export function reset() {
  try {
    events.length = 0;
    measures.length = 0;
    onceEmitted.clear();
    dropped = 0;
  } catch (e) { /* noop */ }
}

const ROUND = (n) => Math.round(n);

/**
 * Resumo textual do boot, para leitura humana em DEV. NÃO persiste e NÃO envia nada.
 * Só reporta o que foi realmente observado — o que não tiver marca aparece como "—".
 */
export function summarize() {
  try {
    if (!isPerformanceTraceEnabled()) return null;
    const start = firstEvent('app_render_start');
    if (!start) return 'performanceTrace: sem marcas (boot não instrumentado nesta execução).';

    const since = (name) => { const e = firstEvent(name); return e ? ROUND(e.t - start.t) : null; };
    const between = (a, b) => {
      const x = firstEvent(a); const y = firstEvent(b);
      return (x && y) ? ROUND(y.t - x.t) : null;
    };
    const fmt = (v, suffix = ' ms') => (v == null ? '—' : `${v}${suffix}`);

    // O terminal de um gate é o que CHEGOU PRIMEIRO (menor `t`) — nunca o primeiro da lista.
    // Escolher por ordem de array faria um `..._end` tardio esconder o `..._timeout` que de fato
    // encerrou o gate e governou o boot. Se houver mais de um, o resumo sinaliza.
    const terminalOf = (names) => {
      const found = names.map(firstEvent).filter(Boolean).sort((a, b) => a.t - b.t);
      return { ev: found[0] || null, extra: Math.max(0, found.length - 1) };
    };
    const suffix = (n) => (n > 0 ? ` (+${n} terminais)` : '');

    const font = terminalOf(['font_gate_loaded', 'font_gate_error', 'font_gate_timeout']);
    const fontReason = font.ev ? font.ev.name.replace('font_gate_', '') : null;
    const route = terminalOf(['route_decision_end', 'route_decision_error', 'route_decision_timeout']);
    const routeName = route.ev && route.ev.meta && route.ev.meta.route ? route.ev.meta.route : null;

    // O primeiro layout só é reportado para a rota que REALMENTE governou este boot. Sem isso,
    // um boot que foi para o Onboarding reportaria "Home first layout" medindo, na verdade, o
    // tempo até a criança navegar até a Home — interação, não boot.
    const layoutFor = (routeId, markName) => (
      routeName === routeId ? fmt(since(markName)) : (firstEvent(markName) ? 'n/a (não foi a rota do boot)' : '—')
    );

    const lines = [
      `Fonte: ${fmt(font.ev ? between('font_gate_start', font.ev.name) : null)}, ${fontReason || '—'}${suffix(font.extra)}`,
      `Decisão de rota: ${fmt(route.ev ? between('route_decision_start', route.ev.name) : null)}, ${routeName || '—'}${suffix(route.extra)}`,
      `Splash React (montagem→replace): ${fmt(between('splash_mount', 'navigation_replace_success'))}`,
      `Home first layout: ${layoutFor('Home', 'home_first_layout')}`,
      `Onboarding first layout: ${layoutFor('Onboarding', 'onboarding_first_layout')}`,
      `Perfil: ${fmt(between('profile_hydration_start', 'profile_hydration_end'))}`,
      `Progresso: ${fmt(between('progress_hydration_start', 'progress_hydration_end'))}`,
      `Packs: ${fmt(between('packs_hydration_start', 'packs_hydration_end'))}`,
      `(eventos: ${events.length}/${TRACE_BUFFER_LIMIT}${dropped ? `, descartados: ${dropped}` : ''})`,
    ];
    return lines.join('\n');
  } catch (e) {
    return null;
  }
}

// Leitura em DEV sem tela nova e sem botão user-facing: no console do dev,
// `__ptfPerf.summary()` ou `__ptfPerf.snapshot()`. Não existe quando desligado.
try {
  if (isPerformanceTraceEnabled()) {
    globalThis.__ptfPerf = { summary: summarize, snapshot: getSnapshot, reset };
  }
} catch (e) { /* noop */ }

export default mark;
