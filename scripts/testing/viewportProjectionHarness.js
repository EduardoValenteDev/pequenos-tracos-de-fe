/**
 * viewportProjectionHarness.js — arnês da projeção `contain` canônica (`TA-4`).
 *
 * Fase 6 · `F6-R3.5` · `TK-A-031`. Usado pelo smoke e executável sozinho
 * (`node scripts/testing/viewportProjectionHarness.js`, saída `0` = verde). NÃO é código
 * de aplicação: nada em `src/` o importa. Sem Jest, sem runner novo, sem dependência
 * nova (§23 do PLAN · `RG-11`).
 *
 * ─── O QUE ESTE ARNÊS PROVA ─────────────────────────────────────────────────────────
 *
 * A função REAL `computeViewportProjection`, lida do PRÓPRIO fonte de
 * `src/hooks/useViewportProjection.js` (o mesmo texto que o aparelho executa; o `import`
 * do React é removido porque o núcleo puro não o usa), sobre:
 *
 *   · `contain` — a obra inteira cabe, em toda janela testada;
 *   · isotropia — UM fator de escala; `scaleX ≠ scaleY` é impossível por construção;
 *   · `letterbox` — a sobra é centralizada, e só um dos dois eixos sobra;
 *   · ida-e-volta — `toCanonical(toScreen(p)) ≈ p` dentro da tolerância;
 *   · ausência de deriva — dez ciclos de projeção/inversão não acumulam erro;
 *   · entrada degenerada — sem projeção possível, devolve `null`, nunca coordenada
 *     inventada;
 *   · extremos reais — Slide Over estreito, tablet em paisagem, janelas minúsculas.
 *
 * ─── O QUE ESTE ARNÊS **NÃO** PROVA (§11.11-b) ──────────────────────────────────────
 *
 * Node NÃO prova sozinho, e este arquivo NÃO alega provar: sobrevivência da WebView
 * real; término de processo; `resize` nativo; Split View; Slide Over de verdade; safe
 * area; React Navigation; geometria visual real; interação física; nem que algum motor
 * de fato CONSOME esta projeção. Aqui só existe a aritmética. Que a pintura da criança
 * aparece inteira e no lugar certo em um aparelho é evidência FÍSICA (§28 #2, #6, #7) —
 * nenhuma linha abaixo pode ser apresentada no lugar dela.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/* ═══════════════════════════════ loadModule (padrão do repo) ═══════════════════════════ */

/**
 * Carrega um módulo ES do projeto sem transpilar: só remove os `import`. Se um símbolo
 * exigido sumir do fonte, isto LANÇA — nunca passa por verde silencioso.
 */
function loadModule(rel, deps = {}, exportNames = []) {
  const src = readSrc(rel);
  const code = src
    .replace(/^import[\s\S]*?;$/gm, '')
    .replace(/export default[\s\S]*?;$/gm, '')
    .replace(/export /g, '')
    + `\n; return { ${exportNames.join(', ')} };`;
  const keys = Object.keys(deps);
  return new Function(...keys, code)(...keys.map((k) => deps[k]));
}

/* ══════════════════════════════════ Utilidades do arnês ════════════════════════════════ */

const TOL = 1e-9;
const perto = (a, b, tol = TOL) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
// Tolerância RELATIVA ao tamanho lógico: comparar coordenada de 4096 com `1e-9` absoluto
// seria exigir mais precisão do que `double` oferece naquele intervalo.
const pertoRel = (a, b, escala) => Math.abs(a - b) <= Math.max(TOL, Math.abs(escala) * 1e-12);

/** Janelas reais que a Fase 6 precisa atravessar (§11.3, §28.1). */
const JANELAS = [
  { nome: 'celular retrato', w: 390, h: 844 },
  { nome: 'celular paisagem', w: 844, h: 390 },
  { nome: 'tablet retrato', w: 834, h: 1194 },
  { nome: 'tablet paisagem', w: 1194, h: 834 },
  { nome: 'Split View 50/50 (tablet paisagem)', w: 592, h: 834 },
  { nome: 'Split View 1/3 estreito', w: 375, h: 1024 },
  { nome: 'Slide Over estreito', w: 320, h: 1024 },
  { nome: 'faixa exatamente no corte (600dp)', w: 600, h: 800 },
  { nome: 'janela minúscula', w: 1, h: 1 },
  { nome: 'janela enorme', w: 8192, h: 4096 },
];

/** Espaços lógicos representativos dos dois motores. */
const LOGICOS = [
  { nome: 'quadrado 1024', W: 1024, H: 1024 },
  { nome: 'retrato 3:4', W: 768, H: 1024 },
  { nome: 'paisagem 4:3', W: 1024, H: 768 },
  { nome: 'lineart estreito', W: 300, H: 1200 },
  { nome: 'lineart largo', W: 1200, H: 300 },
];

/* ═══════════════════════════════════════ TA-4 ══════════════════════════════════════════ */

function executarTA4() {
  const casos = [];
  const avisos = [];
  const add = (nome, ok, detalhe) => casos.push({ nome, ok: !!ok, detalhe: detalhe || '' });

  let mod;
  try {
    mod = loadModule('src/hooks/useViewportProjection.js', {}, ['computeViewportProjection', 'useViewportProjection']);
  } catch (err) {
    add('0.1 o módulo REAL da projeção carrega', false, `loadModule falhou: ${err && err.message}`);
    return { casos, avisos };
  }
  const projetar = mod.computeViewportProjection;

  add('0.1 o módulo REAL da projeção carrega', typeof projetar === 'function',
    'computeViewportProjection não foi exportada por src/hooks/useViewportProjection.js');
  add('0.2 o hook React existe ao lado do núcleo puro', typeof mod.useViewportProjection === 'function',
    'useViewportProjection não foi exportada');
  if (typeof projetar !== 'function') return { casos, avisos };

  /* ── 1. contain: a obra INTEIRA cabe, em toda janela ───────────────────────────── */
  {
    let falhas = [];
    for (const L of LOGICOS) {
      for (const J of JANELAS) {
        const p = projetar({ width: L.W, height: L.H }, { width: J.w, height: J.h });
        const cantos = [{ x: 0, y: 0 }, { x: L.W, y: 0 }, { x: 0, y: L.H }, { x: L.W, y: L.H }].map(p.toScreen);
        const dentro = cantos.every((c) => c.x >= -TOL && c.y >= -TOL && c.x <= J.w + TOL && c.y <= J.h + TOL);
        if (!dentro) falhas.push(`${L.nome} em ${J.nome}`);
      }
    }
    add('1.1 `contain` · os quatro cantos lógicos caem DENTRO da janela — nada é recortado',
      falhas.length === 0, `recorte em: ${falhas.join(' · ')}`);
  }

  /* ── 2. isotropia: um só fator; nada estica ────────────────────────────────────── */
  {
    let falhas = [];
    for (const L of LOGICOS) {
      for (const J of JANELAS) {
        const p = projetar({ width: L.W, height: L.H }, { width: J.w, height: J.h });
        const o = p.toScreen({ x: 0, y: 0 });
        const dx = p.toScreen({ x: L.W, y: 0 }).x - o.x;
        const dy = p.toScreen({ x: 0, y: L.H }).y - o.y;
        const escalaX = dx / L.W;
        const escalaY = dy / L.H;
        if (!perto(escalaX, escalaY, 1e-12) || !perto(escalaX, p.scale, 1e-12)) {
          falhas.push(`${L.nome} em ${J.nome}: x=${escalaX} y=${escalaY} scale=${p.scale}`);
        }
      }
    }
    add('2.1 isotropia · a escala em X é IDÊNTICA à escala em Y (proibido `scaleX ≠ scaleY`)',
      falhas.length === 0, falhas.join(' · '));
  }
  {
    // A razão de aspecto lógica sobrevive: um quadrado lógico continua quadrado na tela.
    const p = projetar({ width: 1000, height: 500 }, { width: 300, height: 900 });
    const a = p.toScreen({ x: 100, y: 100 });
    const b = p.toScreen({ x: 200, y: 200 });
    add('2.2 isotropia · um quadrado lógico continua quadrado na tela',
      perto(b.x - a.x, b.y - a.y, 1e-12), `largura=${b.x - a.x} altura=${b.y - a.y}`);
  }
  {
    const p = projetar({ width: 1024, height: 768 }, { width: 1024, height: 768 });
    add('2.3 janela igual ao espaço lógico · escala 1, sem deslocamento',
      perto(p.scale, 1) && perto(p.offsetX, 0) && perto(p.offsetY, 0),
      `scale=${p.scale} offsetX=${p.offsetX} offsetY=${p.offsetY}`);
  }
  {
    // `contain`, e não `cover`: numa janela mais larga que a obra, `cover` daria
    // `max` (=2) e recortaria em cima e embaixo. `contain` dá `min` (=1).
    const p = projetar({ width: 100, height: 100 }, { width: 200, height: 100 });
    add('2.4 é `contain` e NÃO `cover` · a escala é o `min`, jamais o `max`',
      perto(p.scale, 1), `scale=${p.scale} (cover daria 2)`);
  }

  /* ── 3. letterbox: só um eixo sobra, e a sobra é centralizada ──────────────────── */
  {
    const p = projetar({ width: 100, height: 100 }, { width: 300, height: 100 });
    add('3.1 `letterbox` horizontal · sobra dos DOIS lados, em partes iguais',
      perto(p.offsetX, 100) && perto(p.offsetY, 0) && perto(p.displayW, 100) && perto(p.displayH, 100),
      `offsetX=${p.offsetX} offsetY=${p.offsetY} displayW=${p.displayW} displayH=${p.displayH}`);
  }
  {
    const p = projetar({ width: 100, height: 100 }, { width: 100, height: 300 });
    add('3.2 `letterbox` vertical · sobra em cima e embaixo, em partes iguais',
      perto(p.offsetY, 100) && perto(p.offsetX, 0),
      `offsetX=${p.offsetX} offsetY=${p.offsetY}`);
  }
  {
    let falhas = [];
    for (const L of LOGICOS) {
      for (const J of JANELAS) {
        const p = projetar({ width: L.W, height: L.H }, { width: J.w, height: J.h });
        // Um dos dois offsets é sempre ~0: o eixo apertado é o que define a escala.
        if (!(perto(p.offsetX, 0, 1e-9) || perto(p.offsetY, 0, 1e-9))) {
          falhas.push(`${L.nome} em ${J.nome}: offsetX=${p.offsetX} offsetY=${p.offsetY}`);
        }
        // E a área exibida nunca ultrapassa a janela.
        if (p.displayW > J.w + TOL || p.displayH > J.h + TOL) {
          falhas.push(`${L.nome} em ${J.nome}: exibição maior que a janela`);
        }
      }
    }
    add('3.3 `letterbox` · sobra em UM eixo só, e a exibição nunca excede a janela',
      falhas.length === 0, falhas.join(' · '));
  }
  {
    // O centro lógico cai no centro da janela: a moldura é simétrica, nunca só de um lado.
    let falhas = [];
    for (const L of LOGICOS) {
      for (const J of JANELAS) {
        const p = projetar({ width: L.W, height: L.H }, { width: J.w, height: J.h });
        const c = p.toScreen({ x: L.W / 2, y: L.H / 2 });
        if (!perto(c.x, J.w / 2, 1e-9) || !perto(c.y, J.h / 2, 1e-9)) {
          falhas.push(`${L.nome} em ${J.nome}: centro=(${c.x},${c.y}) esperado=(${J.w / 2},${J.h / 2})`);
        }
      }
    }
    add('3.4 `letterbox` · o centro lógico cai exatamente no centro da janela',
      falhas.length === 0, falhas.join(' · '));
  }

  /* ── 4. ida-e-volta idempotente ────────────────────────────────────────────────── */
  {
    let falhas = [];
    let comparacoes = 0;
    for (const L of LOGICOS) {
      for (const J of JANELAS) {
        const p = projetar({ width: L.W, height: L.H }, { width: J.w, height: J.h });
        for (let i = 0; i <= 8; i++) {
          for (let j = 0; j <= 8; j++) {
            const alvo = { x: (L.W * i) / 8, y: (L.H * j) / 8 };
            const volta = p.toCanonical(p.toScreen(alvo));
            comparacoes++;
            if (!pertoRel(volta.x, alvo.x, L.W) || !pertoRel(volta.y, alvo.y, L.H)) {
              falhas.push(`${L.nome}/${J.nome} (${alvo.x},${alvo.y}) → (${volta.x},${volta.y})`);
            }
          }
        }
      }
    }
    add(`4.1 ida-e-volta · \`toCanonical(toScreen(p)) ≈ p\` em ${comparacoes} pontos`,
      falhas.length === 0, falhas.slice(0, 4).join(' · '));
  }
  {
    // O sentido inverso também: um toque na tela vira lógico e volta ao mesmo píxel.
    let falhas = [];
    for (const J of JANELAS) {
      const p = projetar({ width: 1024, height: 768 }, { width: J.w, height: J.h });
      for (let i = 0; i <= 4; i++) {
        const alvo = { x: (J.w * i) / 4, y: (J.h * i) / 4 };
        const volta = p.toScreen(p.toCanonical(alvo));
        if (!pertoRel(volta.x, alvo.x, J.w) || !pertoRel(volta.y, alvo.y, J.h)) {
          falhas.push(`${J.nome} (${alvo.x},${alvo.y}) → (${volta.x},${volta.y})`);
        }
      }
    }
    add('4.2 ida-e-volta inversa · `toScreen(toCanonical(p)) ≈ p` (o toque volta ao mesmo píxel)',
      falhas.length === 0, falhas.slice(0, 4).join(' · '));
  }

  /* ── 5. sem deriva: dez ciclos de rotação não acumulam erro ────────────────────── */
  {
    // Simula §28.1 `E3` na parte que Node PODE provar: a coordenada lógica é a fonte de
    // cada projeção. Reprojetar dez vezes a partir do MODELO não acumula erro; a deriva
    // só apareceria se alguém reprojetasse a partir da tela anterior.
    const retrato = { width: 834, height: 1194 };
    const paisagem = { width: 1194, height: 834 };
    const logico = { width: 1024, height: 1024 };
    const ponto = { x: 137.5, y: 902.25 };
    let atual = { x: ponto.x, y: ponto.y };
    for (let ciclo = 0; ciclo < 10; ciclo++) {
      const pa = projetar(logico, ciclo % 2 === 0 ? paisagem : retrato);
      atual = pa.toCanonical(pa.toScreen(atual));
    }
    add('5.1 dez ciclos de rotação a partir do MODELO lógico não acumulam deriva',
      pertoRel(atual.x, ponto.x, logico.width) && pertoRel(atual.y, ponto.y, logico.height),
      `depois de 10 ciclos: (${atual.x},${atual.y}) · esperado (${ponto.x},${ponto.y})`);
  }
  {
    // Contraprova do caso 5.1: se a cadeia partisse da TELA anterior tratando-a como
    // espaço lógico, o erro seria enorme. Isto não testa o módulo — demonstra POR QUE o
    // contrato exige reprojetar do modelo, e por isso é asserido como divergência.
    const logico = { width: 1024, height: 1024 };
    let px = { x: 137.5, y: 902.25 };
    let janelaAtual = { width: 834, height: 1194 };
    const p0 = projetar(logico, janelaAtual);
    px = p0.toScreen(px);
    for (let ciclo = 0; ciclo < 10; ciclo++) {
      const proxima = ciclo % 2 === 0 ? { width: 1194, height: 834 } : { width: 834, height: 1194 };
      // O erro: tratar as coordenadas de TELA como se fossem lógicas.
      const errado = projetar(janelaAtual, proxima);
      px = errado.toScreen(px);
      janelaAtual = proxima;
    }
    const voltaFinal = projetar(logico, janelaAtual).toCanonical(px);
    add('5.2 contraprova · encadear a partir da TELA anterior DESLOCA a obra (por isso é proibido)',
      !pertoRel(voltaFinal.x, 137.5, 1024) || !pertoRel(voltaFinal.y, 902.25, 1024),
      `a cadeia errada devolveu (${voltaFinal.x},${voltaFinal.y}) — se isto casou com o original, o caso 5.1 perdeu o sentido`);
  }

  /* ── 6. entrada degenerada: null, nunca coordenada inventada ───────────────────── */
  {
    const degeneradas = [
      ['largura lógica zero', { width: 0, height: 100 }, { width: 300, height: 300 }],
      ['altura lógica zero', { width: 100, height: 0 }, { width: 300, height: 300 }],
      ['janela ainda não medida', { width: 100, height: 100 }, { width: 0, height: 0 }],
      ['largura negativa', { width: -10, height: 100 }, { width: 300, height: 300 }],
      ['tamanho lógico ausente', undefined, { width: 300, height: 300 }],
      ['janela ausente', { width: 100, height: 100 }, undefined],
      ['NaN', { width: NaN, height: 100 }, { width: 300, height: 300 }],
      ['Infinity', { width: Infinity, height: 100 }, { width: 300, height: 300 }],
    ];
    let falhas = [];
    for (const [nome, L, J] of degeneradas) {
      const p = projetar(L, J);
      if (p.valid !== false) falhas.push(`${nome}: valid=${p.valid}`);
      if (p.toScreen({ x: 1, y: 1 }) !== null) falhas.push(`${nome}: toScreen não devolveu null`);
      if (p.toCanonical({ x: 1, y: 1 }) !== null) falhas.push(`${nome}: toCanonical não devolveu null`);
    }
    add('6.1 entrada degenerada · `valid:false` e `null` — nunca uma coordenada inventada',
      falhas.length === 0, falhas.join(' · '));
  }
  {
    const p = projetar({ width: 100, height: 100 }, { width: 300, height: 300 });
    add('6.2 ponto degenerado · `toScreen`/`toCanonical` de coordenada inválida devolvem `null`',
      p.toScreen(null) === null && p.toScreen({ x: NaN, y: 0 }) === null && p.toCanonical({ x: 0, y: undefined }) === null,
      'um ponto inválido produziu coordenada em vez de null');
  }

  /* ── 7. extremos reais nomeados (§28.1) ────────────────────────────────────────── */
  {
    // Slide Over estreito sobre um lineart largo: o eixo apertado é a LARGURA, e a
    // moldura vertical fica enorme. A obra continua inteira — é este o ponto.
    const p = projetar({ width: 1200, height: 300 }, { width: 320, height: 1024 });
    const cantoBaixoDireita = p.toScreen({ x: 1200, y: 300 });
    add('7.1 Slide Over estreito (320×1024) sobre lineart largo · obra inteira, moldura vertical',
      perto(p.scale, 320 / 1200, 1e-12) && perto(p.offsetX, 0) && p.offsetY > 0
        && cantoBaixoDireita.x <= 320 + TOL && cantoBaixoDireita.y <= 1024 + TOL,
      `scale=${p.scale} offsetX=${p.offsetX} offsetY=${p.offsetY}`);
  }
  {
    const p = projetar({ width: 768, height: 1024 }, { width: 1194, height: 834 });
    add('7.2 tablet em paisagem (1194×834) sobre obra em retrato · moldura horizontal',
      perto(p.scale, 834 / 1024, 1e-12) && p.offsetX > 0 && perto(p.offsetY, 0),
      `scale=${p.scale} offsetX=${p.offsetX} offsetY=${p.offsetY}`);
  }
  {
    const p = projetar({ width: 1024, height: 1024 }, { width: 1, height: 1 });
    add('7.3 janela de 1×1 · ainda projeta, ainda cabe, ainda inverte',
      p.valid && perto(p.scale, 1 / 1024, 1e-15) && perto(p.toCanonical(p.toScreen({ x: 512, y: 512 })).x, 512, 1e-9),
      `scale=${p.scale}`);
  }
  {
    // A mesma obra nas duas orientações: a escala muda, o CONTEÚDO lógico não.
    const logico = { width: 1024, height: 768 };
    const a = projetar(logico, { width: 834, height: 1194 });
    const b = projetar(logico, { width: 1194, height: 834 });
    const alvo = { x: 800, y: 200 };
    add('7.4 girar muda a escala mas NÃO muda a coordenada lógica do traço',
      a.scale !== b.scale
        && pertoRel(a.toCanonical(a.toScreen(alvo)).x, 800, 1024)
        && pertoRel(b.toCanonical(b.toScreen(alvo)).x, 800, 1024),
      `scaleRetrato=${a.scale} scalePaisagem=${b.scale}`);
  }

  /* ── 8. a moldura é fora do espaço lógico (insumo de TK-A-033) ─────────────────── */
  {
    // O arnês NÃO decide a política de toque (isso é TK-A-033, dentro de cada motor).
    // Ele só fixa o fato aritmético que a política vai usar: um ponto na faixa de sobra
    // inverte para FORA de [0,W]×[0,H], e por isso é reconhecível sem ambiguidade.
    const p = projetar({ width: 100, height: 100 }, { width: 300, height: 100 });
    const naMoldura = p.toCanonical({ x: 10, y: 50 });   // faixa esquerda
    const naObra = p.toCanonical({ x: 150, y: 50 });     // centro
    add('8.1 um toque na moldura inverte para FORA do retângulo lógico (reconhecível, não ambíguo)',
      naMoldura.x < 0 && naObra.x >= 0 && naObra.x <= 100,
      `moldura.x=${naMoldura.x} obra.x=${naObra.x}`);
  }

  avisos.push(
    'TA-4 prova ARITMÉTICA de projeção. Que a obra apareça inteira, sem esticar e sem '
    + 'recorte num aparelho real é evidência FÍSICA (§28 #2, #6, #7) e continua PENDENTE. '
    + 'Nenhum motor consome esta projeção ainda: TK-A-030 cria o hook SEM consumidor.',
  );

  return { casos, avisos };
}

/* ═════════════════════════════════════ CLI ═════════════════════════════════════════════ */

function main() {
  let casos = [];
  let avisos = [];
  try {
    const r = executarTA4();
    casos = r.casos;
    avisos = r.avisos;
  } catch (err) {
    console.error(`\n✖ TA-4 abortou: ${err && err.message}`);
    console.error(err && err.stack);
    process.exit(1);
    return;
  }

  console.log('\n── TA-4 · projeção `contain` canônica ──\n');
  let falhas = 0;
  for (const c of casos) {
    if (c.ok) { console.log(`  ✓ ${c.nome}`); } else { falhas++; console.log(`  ✖ ${c.nome}\n      ${c.detalhe}`); }
  }
  for (const a of avisos) console.log(`\n  ⚠ ${a}`);
  console.log(`\n── TA-4: ${casos.length - falhas}/${casos.length} casos verdes, ${falhas} vermelhos ──\n`);
  process.exit(falhas === 0 ? 0 : 1);
}

if (require.main === module) main();

module.exports = { executarTA4, loadModule, JANELAS, LOGICOS };
