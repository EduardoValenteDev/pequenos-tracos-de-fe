/**
 * logicalSpaceHarness.js — `TA-5`: ida e volta do formato e do ESPAÇO LÓGICO.
 *
 * Fase 6 · `F6-R3.5` · `TK-A-034` (motor VETORIAL / Ateliê).
 *
 * ─── O QUE ESTE ARNÊS PROVA ─────────────────────────────────────────────────────────
 *
 * Ele carrega o motor REAL — o JavaScript que roda dentro da WebView, extraído do
 * próprio `src/components/AtelierCanvas.js`, com os três eixos de versionamento lidos
 * das constantes reais do módulo. Não é uma segunda cópia da conta: se o motor mudar,
 * este arnês executa o motor mudado.
 *
 * Sobre esse motor real, prova:
 *   · que traço e carimbo são guardados em coordenada LÓGICA — mudar a janela não altera
 *     um único número do modelo;
 *   · que a projeção de exibição é `contain`, isotrópica, com sobra centralizada;
 *   · que o `stateJson` DECLARA `logicalW`/`logicalH` (semântica de `G-CVS-2`);
 *   · que serializar e desserializar devolve coordenadas lógicas IDÊNTICAS;
 *   · que dez ciclos de rotação não acumulam deriva nenhuma no modelo;
 *   · que obra LEGADA (sem os eixos, sem `logicalW`/`logicalH`) continua carregável, com
 *     todos os traços — nunca folha em branco, nunca regravada ao abrir;
 *   · que toque na moldura não cria traço órfão;
 *   · que o gesto em voo é fechado ATOMICAMENTE na mudança de viewport.
 *
 * ─── O QUE ESTE ARNÊS NÃO PROVA (§11.11-b) ──────────────────────────────────────────
 *
 * O `document`/`canvas` daqui é uma MAQUETE: registra as chamadas de desenho, não
 * rasteriza. Node não prova — e nada aqui alega provar — WebView real, término do
 * processo de conteúdo, `resize` nativo, Split View, Slide Over, safe area, React
 * Navigation, geometria visual real nem interação física. Que a obra APAREÇA inteira,
 * sem esticar e sem recorte num aparelho é evidência FÍSICA (§28 #7, #8) e continua
 * PENDENTE.
 *
 * Zero dependência nova: só `fs`/`path`.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const ARQ_ATELIE = path.join(RAIZ, 'src', 'components', 'AtelierCanvas.js');

/* ─── Extração do motor REAL ─────────────────────────────────────────────────────── */

/**
 * Devolve o JavaScript que roda dentro da WebView, com os `${...}` do template literal
 * já resolvidos pelos valores REAIS exportados pelo módulo. Lança se a forma esperada
 * não existir — um motor que mudou de forma precisa acender aqui, não passar em branco.
 */
function extrairMotor() {
  const src = fs.readFileSync(ARQ_ATELIE, 'utf8');

  const ini = src.indexOf('<script>');
  const fim = src.indexOf('</script>');
  if (ini < 0 || fim < 0 || fim <= ini) {
    throw new Error('TA-5: bloco <script> do motor não encontrado em AtelierCanvas.js');
  }
  let motor = src.slice(ini + '<script>'.length, fim);

  const consts = {};
  for (const nome of ['CANVAS_PAYLOAD_V', 'PAINT_SCHEMA_VERSION', 'LAYOUT_VERSION']) {
    const m = new RegExp(`export const ${nome}\\s*=\\s*(\\d+);`).exec(src);
    if (!m) throw new Error(`TA-5: constante ${nome} não encontrada em AtelierCanvas.js`);
    consts[nome] = Number(m[1]);
    motor = motor.split('${' + nome + '}').join(String(consts[nome]));
  }
  if (motor.includes('${')) {
    throw new Error('TA-5: sobrou interpolação não resolvida no motor — o arnês estaria testando texto, não código');
  }
  return { motor, consts };
}

/* ─── Maquete do ambiente da WebView ─────────────────────────────────────────────── */

function novoCtx(canvas) {
  const g = {
    canvas,
    globalCompositeOperation: 'source-over',
    strokeStyle: '', fillStyle: '', lineWidth: 1, lineCap: '', lineJoin: '',
    font: '', textAlign: '', textBaseline: '',
    /* Transforma acumulada do `setTransform` — é assim que o arnês descobre COM QUE
       projeção o motor decidiu desenhar, sem precisar rasterizar. */
    t: { a: 1, d: 1, e: 0, f: 0 },
    clips: [],
    ops: [],
    setTransform(a, b, c, d, e, f) { g.t = { a, d, e, f }; g.ops.push(['setTransform', a, d, e, f]); },
    clearRect(x, y, w, h) { g.ops.push(['clearRect', x, y, w, h]); },
    fillRect(x, y, w, h) { g.ops.push(['fillRect', x, y, w, h, g.fillStyle, { ...g.t }]); },
    save() { g.ops.push(['save']); },
    restore() { g.ops.push(['restore']); },
    beginPath() { g.ops.push(['beginPath']); },
    rect(x, y, w, h) { g._ultimoRect = [x, y, w, h]; g.ops.push(['rect', x, y, w, h]); },
    clip() { g.clips.push(g._ultimoRect); g.ops.push(['clip', g._ultimoRect]); },
    moveTo(x, y) { g.ops.push(['moveTo', x, y, { ...g.t }]); },
    lineTo(x, y) { g.ops.push(['lineTo', x, y, { ...g.t }]); },
    arc(x, y, r) { g.ops.push(['arc', x, y, r, { ...g.t }]); },
    stroke() { g.ops.push(['stroke']); },
    fill() { g.ops.push(['fill']); },
    setLineDash() {},
    measureText() { return { width: 40 }; },
    fillText(txt, x, y) { g.ops.push(['fillText', txt, x, y, { ...g.t }]); },
    drawImage(fonte, ...r) { g.ops.push(['drawImage', fonte && fonte.__nome, ...r]); },
  };
  return g;
}

function novoCanvas(nome) {
  const c = { __nome: nome, width: 0, height: 0, _listeners: {} };
  c.getContext = () => (c._ctx || (c._ctx = novoCtx(c)));
  c.addEventListener = (tipo, fn) => { (c._listeners[tipo] = c._listeners[tipo] || []).push(fn); };
  c.getBoundingClientRect = () => ({ left: 0, top: 0, width: c.width, height: c.height });
  c.toDataURL = () => 'data:image/jpeg;base64,TA5';
  return c;
}

/**
 * Sobe uma instância do motor real numa janela `w`×`h`. Devolve o painel de controle do
 * arnês: a API `window.*` do motor, as mensagens que ele mandou ao RN, e os ganchos para
 * simular toque e mudança de janela.
 */
function montarMotor(codigoMotor, w, h) {
  const C = novoCanvas('C');
  const criados = [];

  const document = {
    getElementById: (id) => (id === 'C' ? C : null),
    createElement: (tag) => {
      if (tag !== 'canvas') throw new Error('TA-5: motor criou elemento inesperado: ' + tag);
      const c = novoCanvas('criado#' + criados.length);
      criados.push(c);
      return c;
    },
  };

  const mensagens = [];
  const window = {
    innerWidth: w,
    innerHeight: h,
    ReactNativeWebView: { postMessage: (m) => mensagens.push(String(m)) },
    _listeners: {},
    addEventListener: (tipo, fn) => { (window._listeners[tipo] = window._listeners[tipo] || []).push(fn); },
  };

  // eslint-disable-next-line no-new-func
  new Function('window', 'document', 'console', 'setTimeout', codigoMotor)(
    window, document, { log() {}, warn() {} }, (fn) => fn(),
  );

  const disparar = (tipo, x, y) => {
    const fns = C._listeners[tipo] || [];
    const ev = { preventDefault() {}, touches: (tipo === 'touchend' ? [] : [{ clientX: x, clientY: y }]) };
    for (const fn of fns) fn(ev);
  };

  const painel = {
    window, document, C, criados, mensagens,
    /** Traça uma linha da criança, ponto a ponto, em coordenada de TELA. */
    tracar(pontos) {
      disparar('touchstart', pontos[0].x, pontos[0].y);
      for (let i = 1; i < pontos.length; i++) disparar('touchmove', pontos[i].x, pontos[i].y);
      disparar('touchend', 0, 0);
    },
    tocar(tipo, x, y) { disparar(tipo, x, y); },
    /** Muda a janela como o sistema faria: novo tamanho + evento `resize`. */
    redimensionar(nw, nh) {
      window.innerWidth = nw; window.innerHeight = nh;
      for (const fn of (window._listeners.resize || [])) fn();
    },
    /** Último `STATE_EXPORT` — o payload que seria de fato gravado. */
    exportar() {
      const antes = mensagens.length;
      window.exportState();
      const msg = mensagens.slice(antes).find((m) => m.startsWith('STATE_EXPORT:'));
      if (!msg) throw new Error('TA-5: exportState não emitiu STATE_EXPORT');
      const env = JSON.parse(msg.slice('STATE_EXPORT:'.length));
      return { envelope: env, payload: JSON.parse(env.stateJson) };
    },
    estatisticas() {
      const antes = mensagens.length;
      window.getStats();
      const msg = mensagens.slice(antes).find((m) => m.startsWith('STATS:'));
      if (!msg) throw new Error('TA-5: getStats não emitiu STATS');
      return JSON.parse(msg.slice('STATS:'.length));
    },
    ultimo(prefixo) {
      for (let i = mensagens.length - 1; i >= 0; i--) {
        if (mensagens[i].startsWith(prefixo)) return JSON.parse(mensagens[i].slice(prefixo.length));
      }
      return null;
    },
  };
  return painel;
}

/* ─── Casos ──────────────────────────────────────────────────────────────────────── */

const RETRATO = { w: 390, h: 844 };
const PAISAGEM = { w: 844, h: 390 };
const SLIDE_OVER = { w: 320, h: 1024 };
const TABLET_P = { w: 834, h: 1194 };

function executarTA5() {
  const casos = [];
  const avisos = [];
  const ok = (nome, cond, detalhe) => casos.push({ nome, ok: !!cond, detalhe: detalhe || '' });

  let motorSrc = null; let consts = null;
  try {
    const r = extrairMotor();
    motorSrc = r.motor; consts = r.consts;
    ok('0.1 motor real extraído de AtelierCanvas.js, com os eixos resolvidos pelos valores do módulo', true);
  } catch (e) {
    ok('0.1 motor real extraído de AtelierCanvas.js, com os eixos resolvidos pelos valores do módulo', false, e.message);
    return { casos, avisos };
  }

  ok('0.2 campo `v` do payload continua CONGELADO em 2 (nunca 3 — ver TK-A-001)',
    consts.CANVAS_PAYLOAD_V === 2, `v=${consts.CANVAS_PAYLOAD_V}`);

  /* ── 1. O modelo é lógico: mudar a janela não move um número ─────────────────── */
  const m1 = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m1.tracar([{ x: 100, y: 200 }, { x: 140, y: 260 }, { x: 200, y: 300 }]);
  const antes1 = JSON.stringify(m1.exportar().payload.strokes);
  m1.redimensionar(PAISAGEM.w, PAISAGEM.h);
  const depois1 = JSON.stringify(m1.exportar().payload.strokes);
  ok('1.1 girar o aparelho NÃO altera um único número do modelo (traço em coordenada lógica)',
    antes1 === depois1 && antes1.length > 20, 'o modelo mudou ao girar — há píxel de dispositivo dentro dele');

  const st1 = m1.estatisticas();
  ok('1.2 o espaço lógico permanece o da criação; a janela é outra coisa e tem outro nome',
    st1.LW === RETRATO.w && st1.LH === RETRATO.h && st1.W === PAISAGEM.w && st1.H === PAISAGEM.h,
    `LW=${st1.LW} LH=${st1.LH} W=${st1.W} H=${st1.H}`);

  ok('1.3 a trava do espaço lógico fecha no primeiro conteúdo (folha com obra não readota a janela)',
    st1.espacoTravado === true, 'a trava não fechou — a próxima rotação redefiniria o espaço da obra');

  /* ── 2. A projeção de exibição é `contain` ───────────────────────────────────── */
  const escalaEsperada = Math.min(PAISAGEM.w / RETRATO.w, PAISAGEM.h / RETRATO.h);
  ok('2.1 escala de exibição é `min(w/W, h/H)` — um fator só, isotrópico',
    Math.abs(st1.scale - escalaEsperada) < 1e-9, `scale=${st1.scale} esperado=${escalaEsperada}`);
  ok('2.2 a sobra é centralizada nos dois eixos (letterbox simétrico)',
    Math.abs(st1.offX - (PAISAGEM.w - RETRATO.w * escalaEsperada) / 2) < 1e-9
    && Math.abs(st1.offY - (PAISAGEM.h - RETRATO.h * escalaEsperada) / 2) < 1e-9,
    `offX=${st1.offX} offY=${st1.offY}`);
  ok('2.3 `contain` e nunca `cover`: a obra inteira cabe na janela',
    RETRATO.w * st1.scale <= PAISAGEM.w + 1e-9 && RETRATO.h * st1.scale <= PAISAGEM.h + 1e-9,
    'parte da obra ficaria fora da janela');

  /* ── 3. `G-CVS-2` (semântica): o stateJson DECLARA o espaço lógico ───────────── */
  const exp3 = m1.exportar().payload;
  ok('3.1 o stateJson do Ateliê DECLARA logicalW e logicalH',
    Number.isFinite(exp3.logicalW) && exp3.logicalW > 0
    && Number.isFinite(exp3.logicalH) && exp3.logicalH > 0,
    `logicalW=${exp3.logicalW} logicalH=${exp3.logicalH}`);
  ok('3.2 o espaço declarado é o HISTÓRICO da obra, não a viewport de quem exportou (Q8 regra 4)',
    exp3.logicalW === RETRATO.w && exp3.logicalH === RETRATO.h,
    'o export gravou a janela atual como se fosse o espaço da obra');
  ok('3.3 os quatro eixos continuam separados e nenhum é inferido do outro',
    exp3.v === 2 && exp3.paintSchemaVersion === consts.PAINT_SCHEMA_VERSION
    && exp3.layoutVersion === consts.LAYOUT_VERSION,
    `v=${exp3.v} paint=${exp3.paintSchemaVersion} layout=${exp3.layoutVersion}`);
  ok('3.4 os campos que já existiam continuam presentes (adição estritamente aditiva)',
    Array.isArray(exp3.strokes) && Array.isArray(exp3.stamps) && typeof exp3.bgColor === 'string',
    'um campo do payload antigo sumiu');

  /* ── 4. Ida e volta do formato ───────────────────────────────────────────────── */
  const m4 = montarMotor(motorSrc, TABLET_P.w, TABLET_P.h);
  m4.window.loadState(JSON.stringify(exp3));
  const volta4 = m4.exportar().payload;
  ok('4.1 serializar → desserializar → serializar devolve coordenadas lógicas IDÊNTICAS',
    JSON.stringify(volta4.strokes) === JSON.stringify(exp3.strokes)
    && JSON.stringify(volta4.stamps) === JSON.stringify(exp3.stamps),
    'a ida e volta alterou as coordenadas da obra');
  ok('4.2 a ida e volta preserva o espaço lógico declarado, mesmo abrindo numa janela MAIOR',
    volta4.logicalW === exp3.logicalW && volta4.logicalH === exp3.logicalH,
    `abriu como ${volta4.logicalW}x${volta4.logicalH}, deveria ser ${exp3.logicalW}x${exp3.logicalH}`);
  ok('4.3 abrir declara publicamente em que espaço a obra foi lida, e que ele veio DECLARADO',
    (() => { const a = m4.ultimo('STATE_AXES:'); return a && a.logical && a.logical.declared === true
      && a.logical.w === exp3.logicalW && a.logical.h === exp3.logicalH; })(),
    'STATE_AXES não informa o espaço lógico da leitura');

  /* ── 5. Dez ciclos de rotação: zero deriva ───────────────────────────────────── */
  const m5 = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m5.tracar([{ x: 33, y: 77 }, { x: 111, y: 222 }, { x: 301, y: 640 }]);
  const base5 = JSON.stringify(m5.exportar().payload.strokes);
  for (let i = 0; i < 10; i++) {
    m5.redimensionar(PAISAGEM.w, PAISAGEM.h);
    m5.redimensionar(RETRATO.w, RETRATO.h);
  }
  ok('5.1 dez ciclos de rotação não acumulam UM dígito de deriva no modelo',
    JSON.stringify(m5.exportar().payload.strokes) === base5,
    'a rotação repetida degradou o modelo — há reamostragem em cadeia');

  /* ── 6. Compatibilidade: obra LEGADA continua carregável ─────────────────────── */
  const legado = JSON.stringify({
    v: 2,
    strokes: [{ id: 'a', color: '#F44336', size: 10, eraser: false, points: [{ x: 50, y: 60 }, { x: 90, y: 120 }] }],
    stamps: [{ id: 'b', emoji: '⭐', label: 'estrela', x: 200, y: 300, size: 72 }],
    bgColor: '#FFFDF8',
  });
  const m6 = montarMotor(motorSrc, PAISAGEM.w, PAISAGEM.h);
  m6.window.loadState(legado);
  const lido6 = m6.exportar().payload;
  ok('6.1 obra LEGADA (sem eixos, sem logicalW/H) carrega com TODOS os traços — nunca folha em branco',
    lido6.strokes.length === 1 && lido6.stamps.length === 1
    && lido6.strokes[0].points.length === 2,
    'SD-8: obra recuperável abriu como canvas vazio');
  ok('6.2 as coordenadas legadas chegam INTACTAS — abrir não converte, não migra e não reescreve (Q8 regras 2 e 7)',
    lido6.strokes[0].points[0].x === 50 && lido6.strokes[0].points[0].y === 60
    && lido6.stamps[0].x === 200 && lido6.stamps[0].y === 300,
    'abrir uma obra legada mexeu nos números dela');
  ok('6.3 o espaço da obra legada é reconstruído de forma DETERMINÍSTICA (a janela de leitura), sem adivinhação',
    lido6.logicalW === PAISAGEM.w && lido6.logicalH === PAISAGEM.h,
    `reconstruiu ${lido6.logicalW}x${lido6.logicalH}`);
  ok('6.4 abrir uma obra legada NÃO emite gravação nenhuma (nenhum STATE_EXPORT espontâneo)',
    m6.mensagens.filter((m) => m.startsWith('STATE_EXPORT:')).length === 1,
    'o motor exportou por conta própria ao abrir — isso seria migração silenciosa');
  ok('6.5 o ramo legado é reconhecido POR AUSÊNCIA de eixo, não por defeito',
    (() => { const a = m6.ultimo('STATE_AXES:'); return a && a.paint.legacy === true && a.paint.ok === true
      && a.layout.legacy === true && a.logical.declared === false; })(),
    'a classificação por eixo tratou ausência como erro');

  /* Payload ainda mais antigo: `ops`. Continua sendo caminho de leitura de 1ª classe. */
  const m6b = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m6b.window.loadState(JSON.stringify({
    ops: [{ type: 'stroke', id: 'z', color: '#000', size: 8, eraser: false, points: [{ x: 10, y: 10 }] }],
    bgColor: '#FFF',
  }));
  ok('6.6 o formato mais antigo (`ops`) continua carregável e intacto — o ramo legado não foi tocado',
    m6b.exportar().payload.strokes.length === 1
    && m6b.exportar().payload.strokes[0].points[0].x === 10,
    'o ramo `ops` deixou de carregar');

  /* ── 7. Moldura inerte (TK-A-033) ────────────────────────────────────────────── */
  /* Obra 390x844 aberta numa janela 844x390: sobra larga à esquerda e à direita. */
  const m7 = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m7.tracar([{ x: 10, y: 10 }, { x: 20, y: 20 }]);
  m7.redimensionar(PAISAGEM.w, PAISAGEM.h);
  const st7 = m7.estatisticas();
  const nAntes7 = m7.exportar().payload.strokes.length;
  ok('7.0 a janela escolhida realmente produz moldura (senão o caso 7.1 não testaria nada)',
    st7.offX > 5, `offX=${st7.offX}`);
  m7.tracar([{ x: 2, y: 195 }, { x: 5, y: 200 }]);   // dentro da moldura, fora do papel
  ok('7.1 gesto que NASCE na moldura não cria traço órfão',
    m7.exportar().payload.strokes.length === nAntes7,
    'tocar na sobra criou traço fora do espaço lógico — ele sumiria na próxima janela');

  /* Gesto que começa DENTRO e escapa para a moldura é fixado à borda lógica. */
  m7.tocar('touchstart', st7.offX + 10, 200);
  m7.tocar('touchmove', 2, 200);
  m7.tocar('touchend', 0, 0);
  const ult7 = m7.exportar().payload.strokes.slice(-1)[0];
  ok('7.2 gesto que começa DENTRO e passa pela moldura é FIXADO à borda lógica, não perdido',
    ult7 && ult7.points.length >= 2 && ult7.points.every((p) => p.x >= 0 && p.x <= st7.LW && p.y >= 0 && p.y <= st7.LH),
    'o traço em andamento saiu do retângulo lógico ou foi descartado no meio');

  /* A garantia visual não depende da aritmética do toque: há `clip` ao retângulo. */
  ok('7.3 a moldura é inerte por RECORTE, não por confiança na aritmética do toque',
    m7.C.getContext('2d').clips.some((r) => r && Math.abs(r[2] - st7.LW * st7.scale) < 1e-6
      && Math.abs(r[3] - st7.LH * st7.scale) < 1e-6),
    'o desenho não é recortado ao retângulo lógico');

  /* ── 8. Gesto em voo fechado atomicamente (TK-A-016) ─────────────────────────── */
  const m8 = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m8.tocar('touchstart', 100, 100);
  m8.tocar('touchmove', 150, 160);
  m8.tocar('touchmove', 200, 220);
  const n8 = m8.exportar().payload.strokes.length;
  m8.redimensionar(PAISAGEM.w, PAISAGEM.h);   // rotação NO MEIO do gesto
  const dep8 = m8.exportar().payload.strokes;
  ok('8.1 rotação no meio do gesto COMITA o traço em voo — nada de pixel infantil perdido',
    dep8.length === n8 + 1, 'o traço em andamento sumiu na rotação');
  ok('8.2 o traço comitado sai INTEIRO, numa projeção só — nunca metade em cada janela',
    dep8.slice(-1)[0].points.length === 3,
    'o traço ficou partido entre duas projeções');

  const m8b = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m8b.tocar('touchstart', 100, 100);
  m8b.tocar('touchmove', 150, 160);
  m8b.window.commitGesture();
  ok('8.3 `commitGesture` (ida para segundo plano) fecha o gesto sem gravar e sem descartar',
    m8b.exportar().payload.strokes.length === 1, 'commitGesture não comitou o gesto em voo');
  m8b.window.commitGesture();
  ok('8.4 `commitGesture` é idempotente — chamar sem gesto em voo não inventa traço',
    m8b.exportar().payload.strokes.length === 1, 'commitGesture criou traço do nada');

  /* ── 9. Folha em branco: a janela PODE ser adotada ───────────────────────────── */
  const m9 = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m9.redimensionar(PAISAGEM.w, PAISAGEM.h);
  const st9 = m9.estatisticas();
  ok('9.1 folha genuinamente em branco adota a janela — girar antes do 1º traço dá a folha INTEIRA',
    st9.LW === PAISAGEM.w && st9.LH === PAISAGEM.h && st9.offX === 0 && st9.offY === 0,
    `LW=${st9.LW} LH=${st9.LH} offX=${st9.offX} offY=${st9.offY}`);
  m9.tracar([{ x: 400, y: 100 }, { x: 500, y: 200 }]);
  m9.redimensionar(RETRATO.w, RETRATO.h);
  const st9b = m9.estatisticas();
  ok('9.2 depois do primeiro traço a trava fecha e a janela NUNCA mais redefine o espaço',
    st9b.LW === PAISAGEM.w && st9b.LH === PAISAGEM.h,
    'o espaço lógico foi redefinido com obra dentro — é exatamente a corrupção que F6-CVS-01 descreve');

  /* ── 10. A imagem salva nasce do MODELO, no espaço lógico ────────────────────── */
  const m10 = montarMotor(motorSrc, RETRATO.w, RETRATO.h);
  m10.tracar([{ x: 60, y: 60 }, { x: 300, y: 700 }]);
  m10.redimensionar(SLIDE_OVER.w, SLIDE_OVER.h);
  m10.exportar();
  const criados10 = m10.criados;
  ok('10.1 a imagem exportada tem as dimensões do ESPAÇO LÓGICO, não as da janela de agora',
    criados10.length >= 2
    && criados10.some((c) => c.width === RETRATO.w && c.height === RETRATO.h)
    && !criados10.some((c) => c.width === SLIDE_OVER.w && c.height === SLIDE_OVER.h),
    'a obra salva ficou refém da orientação em que a criança apertou "salvar"');
  ok('10.2 a exportação NUNCA reamostra do buffer de tela (nada de `drawImage(C, …)`)',
    !criados10.some((c) => (c._ctx ? c._ctx.ops : []).some((o) => o[0] === 'drawImage' && o[1] === 'C')),
    'a exportação copiou a tela — gravaria a moldura desta janela dentro da obra');

  avisos.push(
    'TA-5 executa o MOTOR REAL, mas num `canvas` MAQUETE que registra chamadas e não '
    + 'rasteriza. Node não prova WebView real, término do processo de conteúdo, `resize` '
    + 'nativo, Split View, Slide Over, safe area nem geometria visual real: que a obra '
    + 'APAREÇA inteira, sem esticar e sem recorte num aparelho é evidência FÍSICA '
    + '(§28 #7, #8) e continua PENDENTE.',
  );
  avisos.push(
    'O motor RASTER (Colorir) não é coberto aqui: `TK-A-035`/`TK-A-036` pertencem ao '
    + 'commit `C-A9` e ganharão a sua metade de TA-5.',
  );

  return { casos, avisos };
}

module.exports = { executarTA5, extrairMotor, montarMotor };

/* Execução direta: `node scripts/testing/logicalSpaceHarness.js` */
if (require.main === module) {
  const { casos, avisos } = executarTA5();
  let falhas = 0;
  for (const c of casos) {
    if (c.ok) { console.log(`  ✓ ${c.nome}`); } else { falhas++; console.log(`  ✗ ${c.nome}\n       → ${c.detalhe}`); }
  }
  for (const a of avisos) console.log(`  ⚠ ${a}`);
  console.log(`\n── TA-5: ${casos.length - falhas}/${casos.length} ──`);
  process.exit(falhas > 0 ? 1 : 0);
}
