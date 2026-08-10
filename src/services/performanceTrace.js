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
    // [F6-R3.x · P-139] O t0 do boot arma o terminal próprio do coletor. É o ÚNICO ponto
    // de armamento, e reaproveita uma marca que já existia: nenhuma superfície nova é
    // instrumentada por causa disto. Armar não imprime nada — só agenda.
    if (name === 'app_render_start') armSampleTerminal();
  } catch (e) { /* diagnóstico nunca afeta o app */ }
}

/**
 * Agenda o terminal próprio do coletor. Silencioso: só cria o timer.
 *
 * Declarado depois de `mark` de propósito — é uma FunctionDeclaration, então já existe
 * quando `mark` roda, e a leitura de cima para baixo continua contando a história na
 * ordem certa (marcar primeiro, terminar depois).
 */
function armSampleTerminal() {
  try {
    if (terminalTimer || sampleEmitted) return;
    terminalTimer = setTimeout(() => {
      terminalTimer = null;
      emitSummaryOnce({ terminal: 'ceiling' });
    }, SAMPLE_TERMINAL_CEILING_MS);
  } catch (e) { /* noop */ }
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
    sampleEmitted = false;
    sampleTerminal = 'first_layout';
    if (sampleTimer) { clearTimeout(sampleTimer); sampleTimer = null; }
    if (terminalTimer) { clearTimeout(terminalTimer); terminalTimer = null; }
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

/* ───────────────────────── Amostra reproduzível (LP1M-B) ───────────────────────── */

/** Prefixo fixo da amostra — é o que o agregador procura. */
export const SAMPLE_PREFIX = '[PTF_PERF_SAMPLE]';
/**
 * Versão do schema da amostra (o agregador rejeita o que não bater).
 *
 * v2 — [F6-R3.x · P-139] acrescentou o campo `terminal`. A subida de versão é segura
 * porque NENHUMA amostra v1 chegou a ser coletada: o coletor nunca foi alcançável fora
 * de `__DEV__` (a flag não existia em perfil de build algum), e é exatamente isso que
 * este bloco conserta. Não há baseline histórica a perder.
 */
export const SAMPLE_SCHEMA = 2;
/** Teto para esperar os terminais dos providers. Não bloqueia o app: só adia a IMPRESSÃO. */
export const SAMPLE_PROVIDERS_CEILING_MS = 3000;
/**
 * Teto do EVENTO TERMINAL PRÓPRIO do coletor.
 *
 * [F6-R3.x · P-139 · F-03] O coletor só emitia quando `home_first_layout` ou
 * `onboarding_first_layout` acontecia — e só era CHAMADO pelos `onLayout` dessas duas
 * telas. Todo boot que não chegasse a uma delas ficava indistinguível de "trace
 * desligado" e de "app não instrumentado": silêncio idêntico, três causas diferentes.
 * Um coletor que só mede quando tudo dá certo não mede o que interessa.
 *
 * Este teto dá ao coletor um terminal que NÃO depende do primeiro layout. Ele é armado a
 * partir do t0 que o `bootMark` já marcava — nenhuma superfície nova é instrumentada.
 * Valor: folga larga sobre o pior boot previsto pelos contratos (portão de fonte 1500 ms
 * + teto de decisão 1500 ms + render), para nunca roubar a amostra do caminho feliz.
 */
export const SAMPLE_TERMINAL_CEILING_MS = 12000;

let sampleEmitted = false;
let sampleTimer = null;
/** Como a amostra terminou: `'first_layout'` (caminho feliz) ou `'ceiling'` (o teto venceu). */
let sampleTerminal = 'first_layout';
let terminalTimer = null;

const TERMINAL_FONT = ['font_gate_loaded', 'font_gate_error', 'font_gate_timeout'];
const TERMINAL_ROUTE = ['route_decision_end', 'route_decision_error', 'route_decision_timeout'];
/** Terminal de um gate = o que chegou PRIMEIRO (menor t). Nunca por ordem de lista. */
function terminalEvent(names) {
  return names.map(firstEvent).filter(Boolean).sort((a, b) => a.t - b.t)[0] || null;
}
function deltaBetween(a, b) {
  const x = firstEvent(a);
  const y = firstEvent(b);
  return (x && y) ? Math.round(y.t - x.t) : null;   // ausente = null, nunca inventado
}

/** Os 3 providers já publicaram um terminal (end OU error)? */
function providersSettled() {
  return ['profile', 'progress', 'packs'].every(
    (p) => firstEvent(`${p}_hydration_end`) || firstEvent(`${p}_hydration_error`),
  );
}

/** Monta a amostra. Só lê o que foi medido; o que não existe vira `null`. */
export function buildSample() {
  try {
    if (!isPerformanceTraceEnabled()) return null;
    // Sem t0 não houve boot observado: `sampleEmitted` e `events` vivem no MESMO estado de módulo,
    // então uma reavaliação (Fast Refresh) ou um `reset()` destrava o emissor E apaga as marcas ao
    // mesmo tempo. Sem este guard, sairia uma 2ª amostra inteiramente nula poluindo a baseline.
    if (!firstEvent('app_render_start')) return null;
    const fontEv = terminalEvent(TERMINAL_FONT);
    const routeEv = terminalEvent(TERMINAL_ROUTE);
    const route = routeEv && routeEv.meta && routeEv.meta.route ? routeEv.meta.route : null;
    // A rota do boot decide QUAL first layout conta — o da outra rota seria tempo de interação.
    const layoutMark = route === 'Onboarding' ? 'onboarding_first_layout'
      : route === 'Home' ? 'home_first_layout' : null;
    return {
      schema: SAMPLE_SCHEMA,
      // Como esta amostra terminou. Sem este campo, uma amostra com `firstLayoutMs: null`
      // seria ambígua: "não medi o layout" e "o layout nunca aconteceu" são coisas
      // diferentes, e só a segunda é um achado.
      terminal: sampleTerminal,
      route,
      fontReason: fontEv ? fontEv.name.replace('font_gate_', '') : null,
      routeReason: routeEv ? routeEv.name.replace('route_decision_', '') : null,
      fontGateMs: fontEv ? deltaBetween('font_gate_start', fontEv.name) : null,
      routeDecisionMs: routeEv ? deltaBetween('route_decision_start', routeEv.name) : null,
      splashReactMs: deltaBetween('splash_mount', 'navigation_replace_success'),
      firstLayoutMs: layoutMark ? deltaBetween('app_render_start', layoutMark) : null,
      profileHydrationMs: deltaBetween('profile_hydration_start', 'profile_hydration_end'),
      progressHydrationMs: deltaBetween('progress_hydration_start', 'progress_hydration_end'),
      packsHydrationMs: deltaBetween('packs_hydration_start', 'packs_hydration_end'),
      bufferDropped: dropped,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Emite UMA linha de amostra por processo, para coleta reproduzível.
 *
 * Regras: só com o trace ligado; pelo caminho normal, nunca antes do primeiro layout da rota
 * inicial (senão as durações ainda não existem); espera os terminais dos providers SEM bloquear
 * o app (adia só a impressão, com teto); imprime uma única linha JSON (nunca marca a marca);
 * nunca lança. A emissão NÃO altera durações: todas as marcas já foram gravadas antes.
 *
 * [F6-R3.x · P-139] `options.terminal === 'ceiling'` é o terminal PRÓPRIO do coletor, armado
 * pelo t0 do boot. Ele — e só ele — dispensa a exigência de primeiro layout, porque a ausência
 * do layout é justamente o que ele existe para relatar. Sem argumento, o comportamento é o de
 * sempre: chamada de `onLayout` que ainda não teve layout continua devolvendo `false`.
 */
export function emitSummaryOnce(options) {
  try {
    if (!isPerformanceTraceEnabled()) return false;
    // 1 por INSTÂNCIA DO MÓDULO (é o que o estado de módulo garante — um Fast Refresh que
    // reavalie este arquivo zera a trava; nesse caso o guard de t0 em buildSample é quem barra).
    if (sampleEmitted) return false;
    const porTeto = !!(options && options.terminal === 'ceiling');
    if (!porTeto && !firstEvent('home_first_layout') && !firstEvent('onboarding_first_layout')) return false;
    sampleTerminal = porTeto ? 'ceiling' : 'first_layout';

    const print = () => {
      try {
        if (sampleEmitted) return;
        sampleEmitted = true;
        if (sampleTimer) { clearTimeout(sampleTimer); sampleTimer = null; }
        if (terminalTimer) { clearTimeout(terminalTimer); terminalTimer = null; }
        const sample = buildSample();
        if (!sample) return;
        // Uma linha, prefixo fixo, JSON válido. Não imprime marca por marca.
        console.log(`${SAMPLE_PREFIX} ${JSON.stringify(sample)}`);
      } catch (e) { /* noop */ }
    };

    if (providersSettled()) { print(); return true; }

    // Providers ainda hidratando: adia a IMPRESSÃO (o app segue normal) com teto defensivo.
    if (!sampleTimer) {
      const startedAt = now();
      const poll = () => {
        try {
          if (sampleEmitted) return;
          if (providersSettled() || (now() - startedAt) >= SAMPLE_PROVIDERS_CEILING_MS) { print(); return; }
          sampleTimer = setTimeout(poll, 100);
        } catch (e) { /* noop */ }
      };
      sampleTimer = setTimeout(poll, 100);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/** Cancela as esperas pendentes da amostra — a dos providers E a do teto (cleanup). Nunca lança. */
export function cancelSampleEmission() {
  try {
    if (sampleTimer) { clearTimeout(sampleTimer); sampleTimer = null; }
    if (terminalTimer) { clearTimeout(terminalTimer); terminalTimer = null; }
  } catch (e) { /* noop */ }
}

// Leitura em DEV sem tela nova e sem botão user-facing: no console do dev,
// `__ptfPerf.summary()` ou `__ptfPerf.snapshot()`. Não existe quando desligado.
try {
  if (isPerformanceTraceEnabled()) {
    globalThis.__ptfPerf = { summary: summarize, snapshot: getSnapshot, sample: buildSample, reset };
  }
} catch (e) { /* noop */ }

export default mark;
