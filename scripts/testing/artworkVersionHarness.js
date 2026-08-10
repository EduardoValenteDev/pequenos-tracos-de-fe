/**
 * artworkVersionHarness.js — arnês comportamental dos QUATRO EIXOS de versionamento (`TA-11`).
 *
 * Fase 6 · `F6-R3.5` · `TK-A-006`. Usado pelo smoke e executável sozinho
 * (`node scripts/testing/artworkVersionHarness.js`, saída `0` = verde). NÃO é código de
 * aplicação: nada em `src/` o importa. Sem Jest, sem runner novo, sem dependência nova
 * (§23 do PLAN · `RG-11`).
 *
 * ─── O QUE ESTE ARNÊS PROVA ─────────────────────────────────────────────────────────
 *
 * §11.5.3 declara quatro eixos INDEPENDENTES e proíbe que qualquer leitor, escritor,
 * validador, migração ou teste infira um a partir do outro:
 *
 *   1. `APP_STORAGE_SCHEMA_VERSION` → que CHAVES o AsyncStorage tem
 *   2. `POINTER_VERSION` / campo `v` do ponteiro → ONDE está o blob
 *   3. `paintSchemaVersion` → que CAMPOS o payload tem
 *   4. `layoutVersion` → o que as COORDENADAS significam
 *
 * O arnês varia esses eixos de forma independente e verifica que o *reader*, o *writer* e
 * o *validator* dos dois motores (`ColoringCanvas` = raster, `AtelierCanvas` = vetorial)
 * não se confundem. Tudo aqui é propriedade que Node REALMENTE prova: lógica pura,
 * serialização, classificação, matemática e simulação isolada devidamente modelada.
 *
 * ─── O QUE ESTE ARNÊS **NÃO** PROVA (§11.11-b) ──────────────────────────────────────
 *
 * Node NÃO prova sozinho, e este arquivo NÃO alega provar: sobrevivência da WebView real;
 * término de processo; `resize` nativo; Split View; Slide Over; safe area; React
 * Navigation; geometria visual real; interação física. Nada aqui pode ser apresentado
 * como evidência dessas propriedades.
 *
 * ─── HONESTIDADE DO DOUBLE ──────────────────────────────────────────────────────────
 *
 * Princípio herdado de `packInstallHarness.js`: só é DOUBLE o que é fronteira de mundo.
 *   REAL  → o motor da WebView, extraído do PRÓPRIO template literal do componente (o
 *           mesmo texto que o aparelho executa), com as interpolações `${...}` resolvidas
 *           a partir das constantes declaradas no módulo. Se `TK-A-001` sumir, isto LANÇA.
 *   REAL  → `isAcceptableC60Payload`, avaliado a partir do fonte de `ColoringScreen.js`.
 *   REAL  → `drawingStorage.js` (ponteiro v3) e as funções puras de `fileBlobStore.js`.
 *   DOUBLE→ canvas 2D, `Image`, `window`, `document`, disco (`writeBlob`/`readBlobAsDataUrl`).
 *
 * Limites DECLARADOS do double, para que ninguém o leia como mais forte do que é:
 *   · `toDataURL` usa um contêiner RAW modelado (`PTFRAW1`), não um codificador PNG/JPEG
 *     real — adicionar um seria dependência nova, proibida. Para a propriedade sob teste
 *     (ida-e-volta SEM perda de píxel) o modelo casa com a realidade do PNG, que também é
 *     sem perda. Ele NÃO modela JPEG com perda: miniatura/preview do Ateliê não são
 *     asseridos aqui.
 *   · A decodificação de `Image` é SÍNCRONA; a real é assíncrona. O arnês não prova
 *     ordenação assíncrona real.
 *   · O contexto 2D rasteriza de verdade `fillRect`, `clearRect`, `getImageData`,
 *     `putImageData`, `createImageData` e `drawImage` (composição `source-over` e
 *     `destination-out`). Operações de caminho/texto vetorial são inertes e ficam
 *     REGISTRADAS em `naoModelado` — o arnês não finge rasterizar vetor.
 *
 * ─── SD-8 ───────────────────────────────────────────────────────────────────────────
 *
 * Vários casos abaixo existem só para travar os invariantes ZERO: nenhum payload legado
 * pode virar folha em branco, nenhum veredito de eixo pode tornar uma obra inválida e a
 * ida-e-volta pelo ponteiro v3 não pode perder um único píxel da criança.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/* ═══════════════════════════════ loadModule (padrão do repo) ═══════════════════════════ */

/**
 * Carrega um módulo ES do projeto injetando suas dependências. Sem transpilar: só remove
 * imports. `mutate` (opcional, só para mutation check) altera o TEXTO antes de avaliar; se
 * não bater no fonte, LANÇA — uma âncora obsoleta jamais pode passar por mutante morto.
 */
function loadModule(rel, deps = {}, exportNames = [], mutate) {
  let src = readSrc(rel);
  if (mutate) {
    const mutado = mutate(src);
    if (mutado === src) throw new Error(`loadModule(${rel}): a mutação não alterou o fonte (âncora não encontrada)`);
    src = mutado;
  }
  const code = src
    .replace(/^import[\s\S]*?;$/gm, '')
    .replace(/export /g, '')
    + `\n; return { ${exportNames.join(', ')} };`;
  const keys = Object.keys(deps);
  return new Function(...keys, code)(...keys.map((k) => deps[k]));
}

/* ═══════════════════════════ Codec RAW modelado (ver cabeçalho) ════════════════════════ */

const MAGICA = 'PTFRAW1';

function codificarPixels(w, h, px, mime) {
  const cabecalho = Buffer.from(`${MAGICA}:${w}:${h}:`, 'ascii');
  const corpo = Buffer.from(px.buffer, px.byteOffset, px.length);
  return `data:${mime || 'image/png'};base64,${Buffer.concat([cabecalho, corpo]).toString('base64')}`;
}

function decodificarPixels(url) {
  if (typeof url !== 'string') return null;
  const m = /^data:([^;,]+);base64,([\s\S]*)$/.exec(url);
  if (!m) return null;
  let buf;
  try { buf = Buffer.from(m[2], 'base64'); } catch { return null; }
  const cab = /^PTFRAW1:(\d+):(\d+):/.exec(buf.subarray(0, 40).toString('ascii'));
  if (!cab) return null;
  const w = Number(cab[1]);
  const h = Number(cab[2]);
  const px = new Uint8ClampedArray(buf.subarray(cab[0].length));
  if (px.length !== w * h * 4) return null;
  return { w, h, px };
}

/**
 * Bitmap determinístico e NÃO trivial — serve de "tinta da criança" nos testes.
 *
 * A fixture é FIEL ao que o motor raster realmente produz, e isso importa: o balde de tinta
 * grava cor OPACA e a borracha grava transparência TOTAL, então o alfa da camada de pintura
 * é sempre 0 ou 255. Além disso, canvas real guarda píxel PRÉ-MULTIPLICADO: num píxel de
 * alfa 0 o RGB não sobrevive a nenhuma ida-e-volta, no aparelho ou aqui — porque não existe
 * cor invisível para preservar. Fabricar RGB colorido sob alfa 0 seria inventar um dado que
 * o app nunca escreve e transformar a asserção de SD-8 numa cobrança impossível.
 */
function fabricarPintura(w, h, semente) {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const pintado = (i % 5 !== 0);              /* buracos transparentes de propósito */
    px[i * 4] = pintado ? (i * 7 + semente) % 256 : 0;
    px[i * 4 + 1] = pintado ? (i * 13 + semente * 3) % 256 : 0;
    px[i * 4 + 2] = pintado ? (i * 29 + semente * 5) % 256 : 0;
    px[i * 4 + 3] = pintado ? 255 : 0;
  }
  return px;
}

function mesmosPixels(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/* ═══════════════════════════════ Double de DOM / canvas 2D ═════════════════════════════ */

const NOOP = function () {};

function corParaRGBA(estilo) {
  if (typeof estilo === 'string' && /^#[0-9a-f]{6}$/i.test(estilo)) {
    return [parseInt(estilo.slice(1, 3), 16), parseInt(estilo.slice(3, 5), 16), parseInt(estilo.slice(5, 7), 16), 255];
  }
  if (typeof estilo === 'string' && /^#[0-9a-f]{3}$/i.test(estilo)) {
    const r = parseInt(estilo[1] + estilo[1], 16);
    const g = parseInt(estilo[2] + estilo[2], 16);
    const b = parseInt(estilo[3] + estilo[3], 16);
    return [r, g, b, 255];
  }
  return [0, 0, 0, 255];
}

function fonteDePixels(src) {
  if (!src) return null;
  if (src._px instanceof Uint8ClampedArray) return { w: src._w, h: src._h, px: src._px };
  return null;
}

function criarContexto(cv, diag) {
  const alvo = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    globalCompositeOperation: 'source-over',
    globalAlpha: 1,
    lineWidth: 1,
    canvas: cv,

    fillRect(x, y, w, h) {
      const [r, g, b, a] = corParaRGBA(alvo.fillStyle);
      escreverRet(cv, x, y, w, h, (i, px) => { px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a; });
    },
    clearRect(x, y, w, h) {
      escreverRet(cv, x, y, w, h, (i, px) => { px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0; });
    },
    createImageData(w, h) {
      return { width: w | 0, height: h | 0, data: new Uint8ClampedArray((w | 0) * (h | 0) * 4) };
    },
    getImageData(x, y, w, h) {
      const out = new Uint8ClampedArray(w * h * 4);
      for (let ly = 0; ly < h; ly++) {
        for (let lx = 0; lx < w; lx++) {
          const sx = x + lx;
          const sy = y + ly;
          const di = (ly * w + lx) * 4;
          if (sx < 0 || sy < 0 || sx >= cv._w || sy >= cv._h) continue;
          const si = (sy * cv._w + sx) * 4;
          out[di] = cv._px[si]; out[di + 1] = cv._px[si + 1];
          out[di + 2] = cv._px[si + 2]; out[di + 3] = cv._px[si + 3];
        }
      }
      return { width: w, height: h, data: out };
    },
    /* putImageData SUBSTITUI (inclusive alfa) — é a semântica real, e é justamente ela que
       torna a ida-e-volta da tinta verificável píxel a píxel. */
    putImageData(img, dx, dy) {
      for (let ly = 0; ly < img.height; ly++) {
        for (let lx = 0; lx < img.width; lx++) {
          const tx = (dx | 0) + lx;
          const ty = (dy | 0) + ly;
          if (tx < 0 || ty < 0 || tx >= cv._w || ty >= cv._h) continue;
          const si = (ly * img.width + lx) * 4;
          const di = (ty * cv._w + tx) * 4;
          cv._px[di] = img.data[si]; cv._px[di + 1] = img.data[si + 1];
          cv._px[di + 2] = img.data[si + 2]; cv._px[di + 3] = img.data[si + 3];
        }
      }
    },
    /* [Fase 6 · C-A9] As TRÊS assinaturas reais de `drawImage`. A de NOVE argumentos
       (recorte na fonte + destino) passou a ser usada pelo motor raster para trazer a
       obra ao espaço lógico a partir do retângulo do lineart dentro do bitmap salvo.
       Modelar só a de cinco faria o arnês julgar um motor que não existe: os quatro
       primeiros números seriam lidos como destino e o caso "passaria" por engano. */
    drawImage(src, a1, a2, a3, a4, a5, a6, a7, a8) {
      const f = fonteDePixels(src);
      if (!f) { diag.naoModelado.push(`drawImage(fonte sem píxeis: ${typeof src})`); return; }
      let recX = 0, recY = 0, recW = f.w, recH = f.h, dx, dy, destW, destH;
      if (a5 !== undefined) {
        recX = a1 | 0; recY = a2 | 0; recW = a3 | 0; recH = a4 | 0;
        dx = a5 | 0; dy = a6 | 0;
        destW = (a7 === undefined) ? recW : (a7 | 0);
        destH = (a8 === undefined) ? recH : (a8 | 0);
      } else {
        dx = a1 | 0; dy = a2 | 0;
        destW = (a3 === undefined) ? f.w : (a3 | 0);
        destH = (a4 === undefined) ? f.h : (a4 | 0);
      }
      if (recW <= 0 || recH <= 0 || destW <= 0 || destH <= 0) return;
      const modo = alvo.globalCompositeOperation;
      if (modo !== 'source-over' && modo !== 'destination-out') diag.naoModelado.push(`composicao:${modo}`);
      for (let ly = 0; ly < destH; ly++) {
        for (let lx = 0; lx < destW; lx++) {
          const sx = Math.max(0, Math.min(f.w - 1, recX + Math.min(recW - 1, Math.floor(lx * recW / destW))));
          const sy = Math.max(0, Math.min(f.h - 1, recY + Math.min(recH - 1, Math.floor(ly * recH / destH))));
          const tx = (dx | 0) + lx;
          const ty = (dy | 0) + ly;
          if (tx < 0 || ty < 0 || tx >= cv._w || ty >= cv._h) continue;
          const si = (sy * f.w + sx) * 4;
          const di = (ty * cv._w + tx) * 4;
          if (modo === 'destination-out') {
            cv._px[di + 3] = Math.round(cv._px[di + 3] * (1 - f.px[si + 3] / 255));
            continue;
          }
          /* source-over canônico. Sobre destino TRANSPARENTE devolve a fonte EXATA — é o
             que garante que a ida-e-volta da tinta não invente nem perca píxel. */
          const sa = f.px[si + 3] / 255;
          const da = cv._px[di + 3] / 255;
          const oa = sa + da * (1 - sa);
          if (oa === 0) { cv._px[di] = 0; cv._px[di + 1] = 0; cv._px[di + 2] = 0; cv._px[di + 3] = 0; continue; }
          for (let k = 0; k < 3; k++) {
            cv._px[di + k] = Math.round((f.px[si + k] * sa + cv._px[di + k] * da * (1 - sa)) / oa);
          }
          cv._px[di + 3] = Math.round(oa * 255);
        }
      }
    },
    save: NOOP, restore: NOOP, translate: NOOP, scale: NOOP,
    measureText: (t) => ({ width: String(t || '').length * 8 }),
  };
  return new Proxy(alvo, {
    get(o, prop) {
      if (prop in o) return o[prop];
      if (typeof prop === 'string') { diag.naoModelado.push(`ctx.${prop}`); return NOOP; }
      return undefined;
    },
    set(o, prop, val) { o[prop] = val; return true; },
  });
}

function escreverRet(cv, x, y, w, h, escrever) {
  const x0 = Math.max(0, x | 0);
  const y0 = Math.max(0, y | 0);
  const x1 = Math.min(cv._w, (x | 0) + (w | 0));
  const y1 = Math.min(cv._h, (y | 0) + (h | 0));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) escrever((py * cv._w + px) * 4, cv._px);
  }
}

function criarCanvas(diag) {
  const cv = { _w: 0, _h: 0, _px: new Uint8ClampedArray(0), style: {} };
  const realocar = () => { cv._px = new Uint8ClampedArray(Math.max(0, cv._w * cv._h * 4)); };
  Object.defineProperty(cv, 'width', { get: () => cv._w, set: (v) => { cv._w = v | 0; realocar(); } });
  Object.defineProperty(cv, 'height', { get: () => cv._h, set: (v) => { cv._h = v | 0; realocar(); } });
  let ctx = null;
  cv.getContext = () => (ctx || (ctx = criarContexto(cv, diag)));
  cv.toDataURL = (mime) => codificarPixels(cv._w, cv._h, cv._px, mime);
  /* [Fase 6 · C-A9] Os ouvintes de toque eram ENGOLIDOS por um `NOOP`: o motor registrava
     `touchstart`/`touchmove`/`touchend` e nada guardava a referência, então nenhum caso
     conseguia tocar a superfície. Registrar aqui não afrouxa nada — só deixa de descartar
     em silêncio o que o motor real declara. */
  cv._ouvintes = {};
  cv.addEventListener = (ev, fn) => { (cv._ouvintes[ev] || (cv._ouvintes[ev] = [])).push(fn); };
  cv.removeEventListener = (ev, fn) => {
    const l = cv._ouvintes[ev];
    if (l) cv._ouvintes[ev] = l.filter((f) => f !== fn);
  };
  cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: cv._w, height: cv._h });
  return cv;
}

function criarImagem() {
  const img = { naturalWidth: 0, naturalHeight: 0, _w: 0, _h: 0, _px: new Uint8ClampedArray(0), onload: null, onerror: null };
  let src = '';
  Object.defineProperty(img, 'src', {
    get: () => src,
    set: (v) => {
      src = String(v);
      const d = decodificarPixels(src);
      if (!d) { if (typeof img.onerror === 'function') img.onerror(); return; }
      img._w = d.w; img._h = d.h; img._px = d.px;
      img.naturalWidth = d.w; img.naturalHeight = d.h;
      if (typeof img.onload === 'function') img.onload();
    },
  });
  return img;
}

/* ═══════════════════════ Extração do motor REAL do template literal ════════════════════ */

const OVERRIDES_PADRAO = { imgJson: 'null', devFlag: 'false' };

function extrairMotor(moduloSrc, rel) {
  const ini = moduloSrc.indexOf('<script>');
  const fim = moduloSrc.indexOf('</script>');
  if (ini < 0 || fim <= ini) throw new Error(`extrairMotor(${rel}): não achei o corpo <script> do template`);
  return moduloSrc.slice(ini + '<script>'.length, fim);
}

/**
 * Resolve as interpolações `${NOME}` com o valor REAL declarado no módulo. Uma interpolação
 * sem origem LANÇA: é a antitautologia da extração — se `CANVAS_PAYLOAD_V`,
 * `PAINT_SCHEMA_VERSION` ou `LAYOUT_VERSION` deixarem de existir (`TK-A-001`), o arnês morre
 * alto em vez de testar um motor inventado.
 */
function resolverInterpolacoes(corpo, moduloSrc, rel, overrides) {
  const codigo = corpo.replace(/\$\{([A-Za-z_$][\w$]*)\}/g, (_m, nome) => {
    if (Object.prototype.hasOwnProperty.call(overrides, nome)) return overrides[nome];
    const re = new RegExp(`(?:export\\s+)?const\\s+${nome}\\s*=\\s*(-?[\\d.]+)\\s*;`);
    const hit = moduloSrc.match(re);
    if (!hit) throw new Error(`resolverInterpolacoes(${rel}): \${${nome}} não tem constante numérica declarada no módulo`);
    return hit[1];
  });
  if (codigo.includes('${')) throw new Error(`resolverInterpolacoes(${rel}): sobrou interpolação não resolvida`);
  return codigo;
}

/** Lê os três eixos declarados no topo do módulo (fonte única de `TK-A-001`). */
function lerEixosDeclarados(rel) {
  const src = readSrc(rel);
  const ler = (nome) => {
    const hit = src.match(new RegExp(`export const ${nome} = (-?[\\d.]+);`));
    if (!hit) throw new Error(`lerEixosDeclarados(${rel}): \`export const ${nome}\` ausente`);
    return Number(hit[1]);
  };
  return {
    CANVAS_PAYLOAD_V: ler('CANVAS_PAYLOAD_V'),
    PAINT_SCHEMA_VERSION: ler('PAINT_SCHEMA_VERSION'),
    LAYOUT_VERSION: ler('LAYOUT_VERSION'),
  };
}

/**
 * Sobe o motor da WebView num DOM modelado e devolve o controle dele.
 * `mutate` altera o TEXTO do módulo antes da extração (mutation check); se não bater, LANÇA.
 */
function bootMotor(rel, opts = {}) {
  const largura = opts.largura || 64;
  const altura = opts.altura || 48;
  const dpr = opts.dpr || 1;

  let moduloSrc = readSrc(rel);
  if (opts.mutate) {
    const mutado = opts.mutate(moduloSrc);
    if (mutado === moduloSrc) throw new Error(`bootMotor(${rel}): a mutação não alterou o fonte (âncora não encontrada)`);
    moduloSrc = mutado;
  }

  const diag = { naoModelado: [] };
  const codigo = resolverInterpolacoes(
    extrairMotor(moduloSrc, rel), moduloSrc, rel,
    Object.assign({}, OVERRIDES_PADRAO, opts.overrides || {}),
  );

  const raiz = criarCanvas(diag);
  const msgs = [];
  const documento = {
    getElementById: (id) => ((id === 'c' || id === 'C') ? raiz : null),
    createElement: (tag) => (tag === 'canvas' ? criarCanvas(diag) : { style: {}, addEventListener: NOOP, appendChild: NOOP }),
    addEventListener: NOOP,
    body: { style: {}, addEventListener: NOOP, appendChild: NOOP },
  };
  const ouvintes = {};
  const janela = {
    innerWidth: largura,
    innerHeight: altura,
    devicePixelRatio: dpr,
    Image: function () { return criarImagem(); },
    ReactNativeWebView: { postMessage: (m) => { msgs.push(String(m)); } },
    addEventListener: (ev, fn) => { (ouvintes[ev] || (ouvintes[ev] = [])).push(fn); },
    removeEventListener: NOOP,
    onerror: null,
  };

  new Function('window', 'document', codigo)(janela, documento);

  return {
    janela, documento, raiz, msgs, diag, codigo, ouvintes,
    limpar: () => { msgs.length = 0; },
    tem: (pref) => msgs.some((m) => m.startsWith(pref)),
    ultima: (pref) => {
      for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].startsWith(pref)) return msgs[i].slice(pref.length);
      return null;
    },
    /** Dispara o `resize` registrado pelo motor, com o novo tamanho já aplicado à janela. */
    redimensionar: (w, h) => {
      janela.innerWidth = w; janela.innerHeight = h;
      (ouvintes.resize || []).forEach((fn) => fn());
    },
    /**
     * Um toque de pintura em coordenada CSS da tela — `touchstart` + `touchend`, que é o
     * gesto REAL do Colorir (o preenchimento é um toque só). Quem decide se aquele ponto
     * vira tinta é o motor, não o arnês.
     */
    tocar: (cssX, cssY) => {
      const dedo = { clientX: cssX, clientY: cssY };
      const disparar = (ev, toques, mudados) => {
        (raiz._ouvintes[ev] || []).forEach((fn) => fn({
          preventDefault() {}, touches: toques, changedTouches: mudados,
        }));
      };
      disparar('touchstart', [dedo], [dedo]);
      disparar('touchend', [], [dedo]);
    },
  };
}

/* ═════════════════════ Guarda REAL do chamador C60 (ColoringScreen.js) ═════════════════ */

/**
 * Avalia a função REAL `isAcceptableC60Payload` a partir do fonte da tela. É ela que decide
 * se o payload do canvas chega ao writer — e é ela que provaria, na prática, que emitir
 * `v: 3` do canvas descartaria a pintura da criança (§11.5.2).
 */
function carregarGuardaC60() {
  const src = readSrc('src/screens/ColoringScreen.js');
  const ini = src.indexOf('function isAcceptableC60Payload(');
  if (ini < 0) throw new Error('carregarGuardaC60: `isAcceptableC60Payload` não encontrada em ColoringScreen.js');
  const fim = src.indexOf('\n}\n', ini);
  if (fim < 0) throw new Error('carregarGuardaC60: não achei o fim da função');
  const corpo = src.slice(ini, fim + 2);
  return new Function(`${corpo}\n; return isAcceptableC60Payload;`)();
}

/* ═════════════════════ Eixo do ENVELOPE: drawingStorage REAL + disco duplo ═════════════ */

function carregarPonteiroReal() {
  const blob = loadModule(
    'src/services/fileBlobStore.js',
    { FileSystem: {}, log: { info: NOOP, warn: NOOP, error: NOOP } },
    ['isDataUrl', 'dataUrlMime', 'safeName'],
  );
  const disco = new Map();
  const deps = {
    AsyncStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} },
    log: { info: NOOP, warn: NOOP, error: NOOP },
    isDataUrl: blob.isDataUrl,
    dataUrlMime: blob.dataUrlMime,
    safeName: blob.safeName,
    writeBlob: async (subdir, nome, dataUrl, mime) => {
      const uri = `file:///double/${subdir}/${nome}`;
      disco.set(uri, dataUrl);
      return { uri, mime };
    },
    readBlobAsDataUrl: async (uri) => (disco.has(uri) ? disco.get(uri) : null),
    deleteBlob: async () => true,
  };
  const mod = loadModule(
    'src/services/drawingStorage.js', deps,
    ['POINTER_VERSION', 'isDrawingPointer', 'buildPointer', 'resolvePointer', 'hasMeaningfulPaint'],
  );
  return Object.assign({ disco }, mod);
}

/* ═══════════════════════════════════ Casos do TA-11 ════════════════════════════════════ */

const RASTER = 'src/components/ColoringCanvas.js';
const VETOR = 'src/components/AtelierCanvas.js';
const W = 64;
const H = 48;

/** Monta um payload de pintura variando os eixos de forma INDEPENDENTE. */
function payloadRaster({ pintura, paintSchemaVersion, layoutVersion, geometria = true, extra = null }) {
  const p = { v: 2 };
  if (paintSchemaVersion !== undefined) p.paintSchemaVersion = paintSchemaVersion;
  if (layoutVersion !== undefined) p.layoutVersion = layoutVersion;
  if (geometria) { p.W = W; p.H = H; p.imgX = 0; p.imgY = 0; p.imgW = W; p.imgH = H; }
  if (extra) Object.assign(p, extra);
  p.data = codificarPixels(W, H, pintura, 'image/png');
  return JSON.stringify(p);
}

function lerAxes(motor, pref) {
  const bruto = motor.ultima(pref);
  return bruto === null ? null : JSON.parse(bruto);
}

/**
 * Executa `TA-11` e devolve a lista de casos. Não imprime nada e não sai do processo:
 * quem consome (smoke ou o runner abaixo) decide como reportar.
 *
 * @returns {{casos: Array<{nome:string, ok:boolean, detalhe:string}>, avisos: string[]}}
 */
function executarTA11() {
  const casos = [];
  const avisos = [];
  const ok = (nome, condicao, detalhe = '') => casos.push({ nome, ok: !!condicao, detalhe: condicao ? '' : detalhe });

  const eixosRaster = lerEixosDeclarados(RASTER);
  const eixosVetor = lerEixosDeclarados(VETOR);
  const guardaC60 = carregarGuardaC60();
  const pintura = fabricarPintura(W, H, 11);

  /* ── 1. Escritor raster: emite os dois eixos novos e NUNCA `v:3` ───────────────────── */
  {
    const m = bootMotor(RASTER, { largura: W, altura: H });
    ok('1.0 raster sobe e fica pronto', m.tem('READY'), `mensagens: ${m.msgs.join(' | ')}`);
    m.limpar();
    m.janela.loadPaint(payloadRaster({ pintura, paintSchemaVersion: 1, layoutVersion: 1 }));
    ok('1.1 pintura carregada é aplicada', m.tem('PAINT_APPLIED'), m.msgs.join(' | '));
    m.limpar();
    m.janela.exportPaint();
    const bruto = m.ultima('PAINT_EXPORT:');
    ok('1.2 exportPaint publica payload', bruto !== null, m.msgs.join(' | '));
    const p = bruto ? JSON.parse(bruto) : {};
    ok('1.3 campo `v` CONGELADO em 2 (nunca 3)', p.v === eixosRaster.CANVAS_PAYLOAD_V && p.v === 2, `v=${p.v}`);
    ok('1.4 `paintSchemaVersion` emitido por nome', p.paintSchemaVersion === eixosRaster.PAINT_SCHEMA_VERSION, `paintSchemaVersion=${p.paintSchemaVersion}`);
    ok('1.5 `layoutVersion` emitido por nome', p.layoutVersion === eixosRaster.LAYOUT_VERSION, `layoutVersion=${p.layoutVersion}`);
    const antigos = ['W', 'H', 'imgX', 'imgY', 'imgW', 'imgH', 'rev', 'paintedPx', 'paintablePx', 'data'];
    const faltando = antigos.filter((k) => p[k] === undefined);
    ok('1.6 adição ESTRITAMENTE aditiva: nenhum campo antigo sumiu', faltando.length === 0, `faltando: ${faltando.join(', ')}`);
    /* SD-8: a tinta que entrou tem de sair idêntica, píxel a píxel. */
    const volta = decodificarPixels(p.data);
    ok('1.7 SD-8 · ida-e-volta da tinta SEM perda de píxel', volta && volta.w === W && volta.h === H && mesmosPixels(volta.px, pintura), 'os píxeis exportados divergem da pintura carregada');
    ok('1.8 guarda REAL do C60 ACEITA o payload novo', guardaC60(bruto) === true, 'isAcceptableC60Payload rejeitou o payload do canvas');
    ok('1.9 guarda REAL do C60 REJEITA ponteiro v3 (eixos não se confundem)',
      guardaC60(JSON.stringify({ v: 3, fmt: 2, uri: 'file:///x.png', mime: 'image/png' })) === false,
      'a guarda aceitou um ponteiro vindo do canvas');
    ok('1.10 o double não encontrou operação não modelada relevante',
      m.diag.naoModelado.length === 0, `não modelado: ${[...new Set(m.diag.naoModelado)].join(', ')}`);
  }

  /* ── 2. Escritor vetorial: mesmos eixos, `v` congelado, estado preservado ──────────── */
  {
    const m = bootMotor(VETOR, { largura: W, altura: H });
    ok('2.0 vetorial sobe e fica pronto', m.tem('READY'), m.msgs.join(' | '));
    const estado = { v: 2, strokes: [{ id: 's1', color: '#FF0000', size: 8, eraser: false, points: [{ x: 1, y: 2 }, { x: 3, y: 4 }] }], stamps: [{ id: 'e1', emoji: '⭐', label: 'estrela', x: 5, y: 6, size: 40 }], bgColor: '#FFEECC' };
    m.limpar();
    m.janela.loadState(JSON.stringify(estado));
    ok('2.1 estado legado v2 carrega', m.tem('STATE_LOADED'), m.msgs.join(' | '));
    m.limpar();
    m.janela.exportState();
    const env = JSON.parse(m.ultima('STATE_EXPORT:') || '{}');
    const st = env.stateJson ? JSON.parse(env.stateJson) : {};
    ok('2.2 campo `v` CONGELADO em 2 (nunca 3)', st.v === eixosVetor.CANVAS_PAYLOAD_V && st.v === 2, `v=${st.v}`);
    ok('2.3 `paintSchemaVersion` emitido por nome', st.paintSchemaVersion === eixosVetor.PAINT_SCHEMA_VERSION, `paintSchemaVersion=${st.paintSchemaVersion}`);
    ok('2.4 `layoutVersion` emitido por nome', st.layoutVersion === eixosVetor.LAYOUT_VERSION, `layoutVersion=${st.layoutVersion}`);
    ok('2.5 SD-8 · traços, carimbos e fundo voltam idênticos',
      JSON.stringify(st.strokes) === JSON.stringify(estado.strokes)
      && JSON.stringify(st.stamps) === JSON.stringify(estado.stamps)
      && st.bgColor === estado.bgColor,
      `stateJson=${env.stateJson}`);
  }

  /* ── 3. Leitor raster: as quatro combinações de presença/ausência dos dois eixos ───── */
  {
    const combinacoes = [
      { nome: 'nenhum eixo (legado puro)', paint: undefined, layout: undefined, paintLegacy: true, layoutLegacy: true },
      { nome: 'só `paintSchemaVersion`', paint: 1, layout: undefined, paintLegacy: false, layoutLegacy: true },
      { nome: 'só `layoutVersion`', paint: undefined, layout: 1, paintLegacy: true, layoutLegacy: false },
      { nome: 'os dois eixos', paint: 1, layout: 1, paintLegacy: false, layoutLegacy: false },
    ];
    for (const c of combinacoes) {
      const m = bootMotor(RASTER, { largura: W, altura: H });
      m.limpar();
      m.janela.loadPaint(payloadRaster({ pintura, paintSchemaVersion: c.paint, layoutVersion: c.layout }));
      const ax = lerAxes(m, 'LOAD_PAINT_AXES:');
      ok(`3.${combinacoes.indexOf(c) + 1}a classificação independente — ${c.nome}`,
        ax && ax.paint.legacy === c.paintLegacy && ax.layout.legacy === c.layoutLegacy,
        `esperado paint.legacy=${c.paintLegacy} layout.legacy=${c.layoutLegacy}, veio ${JSON.stringify(ax)}`);
      ok(`3.${combinacoes.indexOf(c) + 1}b SD-8 · nenhuma combinação impede carregar a obra — ${c.nome}`,
        m.tem('PAINT_APPLIED') && !m.tem('LOAD_PAINT_CORRUPTED'), m.msgs.join(' | '));
    }
  }

  /* ── 4. Leitor raster: sem inferência cruzada e sem destruição ─────────────────────── */
  {
    /* 4.1 — eixo de PINTURA declarado NÃO torna a GEOMETRIA declarada: sem W/H, o
       fallback histórico pelo tamanho natural do bitmap continua valendo. */
    const m1 = bootMotor(RASTER, { largura: W, altura: H });
    m1.limpar();
    m1.janela.loadPaint(payloadRaster({ pintura, paintSchemaVersion: 1, geometria: false }));
    const ax1 = lerAxes(m1, 'LOAD_PAINT_AXES:');
    ok('4.1 `paintSchemaVersion` NÃO declara geometria (zero inferência cruzada)',
      ax1 && ax1.paint.legacy === false && ax1.layout.legacy === true && m1.tem('PAINT_APPLIED'),
      `axes=${JSON.stringify(ax1)} msgs=${m1.msgs.join(' | ')}`);

    /* 4.2 — quem DECLARA `layoutVersion` e omite W/H se contradiz: o leitor não adivinha
       geometria pelos píxeis. Vai para o ramo de incompatibilidade, que NÃO apaga nada. */
    const m2 = bootMotor(RASTER, { largura: W, altura: H });
    m2.limpar();
    m2.janela.loadPaint(payloadRaster({ pintura, layoutVersion: 1, geometria: false }));
    ok('4.2 `layoutVersion` declarado sem W/H → incompatível, NUNCA corrompido',
      m2.tem('LOAD_PAINT_INCOMPATIBLE') && !m2.tem('LOAD_PAINT_CORRUPTED') && !m2.tem('PAINT_APPLIED'),
      m2.msgs.join(' | '));

    /* 4.3 — v1 legado (data URL cru): nenhum eixo declarado, e continua carregando. */
    const m3 = bootMotor(RASTER, { largura: W, altura: H });
    m3.limpar();
    m3.janela.loadPaint(codificarPixels(W, H, pintura, 'image/png'));
    const ax3 = lerAxes(m3, 'LOAD_PAINT_AXES:');
    ok('4.3 v1 legado (data URL cru) → dois eixos ausentes e obra aplicada',
      ax3 && ax3.paint.legacy === true && ax3.layout.legacy === true && m3.tem('PAINT_APPLIED'),
      `axes=${JSON.stringify(ax3)} msgs=${m3.msgs.join(' | ')}`);

    /* 4.4 — obra salva quando a JANELA era outra.
       Enquanto o buffer de pintura vivia no espaço da janela, recusar era o comportamento
       seguro possível: aplicar significaria colar tinta em coordenadas que não eram dela.
       Com o espaço lógico do lineart (`TK-A-035`: "o buffer de pintura é definido no
       retângulo lógico do lineart; a projeção acontece na exibição, nunca no armazenamento")
       recusar deixou de ser o seguro e virou o LESIVO: o payload declara o próprio retângulo
       de origem, é inteiramente recuperável, e devolver folha em branco para obra recuperável
       é exatamente o que `SD-8` proíbe. O caso mantém a propriedade de sempre — Q8 regra 3,
       nada é destruído — e passa a exigir a propriedade mais forte que agora existe: a obra
       volta INTEIRA. Isto é supersessão declarada de comportamento, não afrouxamento: a
       asserção ficou mais exigente, não menos.

       A obra de origem é a pintura de 64×48 ampliada 2× por vizinho-mais-próximo. A
       reprojeção de volta amostra `sx = 2·lx`, `sy = 2·ly`, então a igualdade píxel a píxel
       é EXATA — não é tolerância disfarçada de igualdade. */
    const grande = new Uint8ClampedArray(W * 2 * H * 2 * 4);
    for (let y = 0; y < H * 2; y++) {
      for (let x = 0; x < W * 2; x++) {
        const o = (y * W * 2 + x) * 4;
        const i = ((y >> 1) * W + (x >> 1)) * 4;
        grande[o] = pintura[i]; grande[o + 1] = pintura[i + 1];
        grande[o + 2] = pintura[i + 2]; grande[o + 3] = pintura[i + 3];
      }
    }
    const m4 = bootMotor(RASTER, { largura: W, altura: H });
    m4.limpar();
    m4.janela.loadPaint(JSON.stringify({
      v: 2, paintSchemaVersion: 1, layoutVersion: 1, W: W * 2, H: H * 2,
      imgX: 0, imgY: 0, imgW: W * 2, imgH: H * 2,
      data: codificarPixels(W * 2, H * 2, grande, 'image/png'),
    }));
    ok('4.4a Q8 regra 3 · obra de OUTRA viewport: nada corrompido, nada recusado em silêncio',
      m4.tem('PAINT_APPLIED') && !m4.tem('LOAD_PAINT_CORRUPTED') && !m4.tem('LOAD_PAINT_INCOMPATIBLE'),
      m4.msgs.join(' | '));
    m4.limpar();
    m4.janela.exportPaint();
    const volta44 = decodificarPixels(JSON.parse(m4.ultima('PAINT_EXPORT:') || '{}').data || '');
    ok('4.4b SD-8 · a obra de outra viewport volta INTEIRA no espaço lógico, píxel a píxel',
      !!volta44 && volta44.w === W && volta44.h === H && mesmosPixels(volta44.px, pintura),
      volta44 ? `voltou ${volta44.w}x${volta44.h} e os píxeis não conferem` : 'não voltou bitmap algum');

    /* 4.5 — bitmap ilegível é CORROMPIDO, não "incompatível": os dois caminhos seguem
       distintos e nenhum deles apaga a obra armazenada. */
    const m5 = bootMotor(RASTER, { largura: W, altura: H });
    m5.limpar();
    m5.janela.loadPaint(JSON.stringify({ v: 2, paintSchemaVersion: 1, layoutVersion: 1, W, H, data: 'data:image/png;base64,QUJD' }));
    ok('4.5 bitmap ilegível → CORROMPIDO (caminho distinto de incompatível)',
      m5.tem('LOAD_PAINT_CORRUPTED') && !m5.tem('PAINT_APPLIED'), m5.msgs.join(' | '));
  }

  /* ── 5. Leitor vetorial: eixo por NOME antes dos ramos legados, sem perder obra ────── */
  {
    const tracos = [{ id: 's9', color: '#00AA00', size: 5, eraser: false, points: [{ x: 9, y: 9 }] }];

    /* 5.1 — payload que declara `paintSchemaVersion` e NÃO tem `v`. Antes de TK-A-002 este
       caminho caía no `else` final e a obra voltava como folha em branco. */
    const m1 = bootMotor(VETOR, { largura: W, altura: H });
    m1.limpar();
    m1.janela.loadState(JSON.stringify({ paintSchemaVersion: 1, layoutVersion: 1, strokes: tracos, stamps: [], bgColor: '#ABCDEF' }));
    m1.limpar();
    m1.janela.exportState();
    const st1 = JSON.parse(JSON.parse(m1.ultima('STATE_EXPORT:') || '{}').stateJson || '{}');
    ok('5.1 SD-8 · payload sem `v` mas com eixo declarado NÃO volta como folha em branco',
      JSON.stringify(st1.strokes) === JSON.stringify(tracos) && st1.bgColor === '#ABCDEF',
      `strokes=${JSON.stringify(st1.strokes)} bgColor=${st1.bgColor}`);

    /* 5.2 — ramo legado `v:2` INTACTO. */
    const m2 = bootMotor(VETOR, { largura: W, altura: H });
    m2.janela.loadState(JSON.stringify({ v: 2, strokes: tracos, stamps: [], bgColor: '#123456' }));
    m2.limpar();
    m2.janela.exportState();
    const st2 = JSON.parse(JSON.parse(m2.ultima('STATE_EXPORT:') || '{}').stateJson || '{}');
    ok('5.2 ramo legado `v:2` INTACTO', JSON.stringify(st2.strokes) === JSON.stringify(tracos) && st2.bgColor === '#123456', JSON.stringify(st2));

    /* 5.3 — ramo legado `ops` INTACTO. */
    const m3 = bootMotor(VETOR, { largura: W, altura: H });
    m3.janela.loadState(JSON.stringify({ ops: [{ type: 'stroke', id: 'o1', points: [{ x: 1, y: 1 }] }, { type: 'shape' }], bgColor: '#0F0F0F' }));
    m3.limpar();
    m3.janela.exportState();
    const st3 = JSON.parse(JSON.parse(m3.ultima('STATE_EXPORT:') || '{}').stateJson || '{}');
    ok('5.3 ramo legado `ops` INTACTO (migra traços, ignora shapes)',
      Array.isArray(st3.strokes) && st3.strokes.length === 1 && st3.strokes[0].id === 'o1' && st3.bgColor === '#0F0F0F',
      JSON.stringify(st3));

    /* 5.4 — classificação vetorial independente, nas quatro combinações. */
    const combos = [
      { paint: undefined, layout: undefined, pl: true, ll: true },
      { paint: 1, layout: undefined, pl: false, ll: true },
      { paint: undefined, layout: 1, pl: true, ll: false },
      { paint: 1, layout: 1, pl: false, ll: false },
    ];
    let todas = true;
    let detalhe = '';
    for (const c of combos) {
      const m = bootMotor(VETOR, { largura: W, altura: H });
      const d = { v: 2, strokes: tracos, stamps: [], bgColor: '#FFFDF8' };
      if (c.paint !== undefined) d.paintSchemaVersion = c.paint;
      if (c.layout !== undefined) d.layoutVersion = c.layout;
      m.limpar();
      m.janela.loadState(JSON.stringify(d));
      const ax = lerAxes(m, 'STATE_AXES:');
      if (!ax || ax.paint.legacy !== c.pl || ax.layout.legacy !== c.ll) { todas = false; detalhe += `${JSON.stringify(c)}→${JSON.stringify(ax)} `; }
    }
    ok('5.4 classificação vetorial independente nas 4 combinações', todas, detalhe);
  }

  /* ── 6. Validador: veredito POR EIXO, informativo, sem consultar o envelope ────────── */
  {
    const m = bootMotor(RASTER, { largura: W, altura: H });

    m.limpar();
    m.janela.validatePaint(payloadRaster({ pintura }));
    const ax1 = lerAxes(m, 'PAINT_AXES:');
    ok('6.1 legado puro → dois eixos ausentes e payload VÁLIDO',
      ax1 && ax1.paint.legacy === true && ax1.layout.legacy === true && m.tem('PAINT_VALID'), `${JSON.stringify(ax1)} | ${m.msgs.join(' | ')}`);

    m.limpar();
    m.janela.validatePaint(payloadRaster({ pintura, paintSchemaVersion: 1, layoutVersion: 1 }));
    const ax2 = lerAxes(m, 'PAINT_AXES:');
    ok('6.2 eixos declarados → veredito por eixo e payload VÁLIDO',
      ax2 && ax2.paint.declared === 1 && ax2.layout.declared === 1 && ax2.paint.ok && ax2.layout.ok && m.tem('PAINT_VALID'),
      `${JSON.stringify(ax2)} | ${m.msgs.join(' | ')}`);

    /* Eixo de pintura MENTINDO sobre si mesmo (string em vez de inteiro): o veredito é
       negativo SÓ para ele, o outro eixo não é contaminado — e, por Q8 regra 3, a obra
       NÃO passa a ser inválida por causa disso. */
    m.limpar();
    m.janela.validatePaint(payloadRaster({ pintura, paintSchemaVersion: '1', layoutVersion: 1 }));
    const ax3 = lerAxes(m, 'PAINT_AXES:');
    ok('6.3 eixo defeituoso NÃO contamina o outro eixo',
      ax3 && ax3.paint.ok === false && ax3.layout.ok === true && ax3.layout.declared === 1, JSON.stringify(ax3));
    ok('6.4 Q8 regra 3 · veredito de eixo é INFORMATIVO: nada vira inválido por causa dele',
      m.tem('PAINT_VALID') && !m.tem('PAINT_INVALID'), m.msgs.join(' | '));

    /* O validador não olha o envelope: campos `fmt`/`uri` de ponteiro não fabricam eixo. */
    m.limpar();
    m.janela.validatePaint(payloadRaster({ pintura, extra: { fmt: 2, uri: 'file:///double/x.png' } }));
    const ax4 = lerAxes(m, 'PAINT_AXES:');
    ok('6.5 validador NÃO deduz eixo a partir do envelope (`fmt`/`uri`)',
      ax4 && ax4.paint.legacy === true && ax4.layout.legacy === true, JSON.stringify(ax4));

    /* Simetria: o eixo de LAYOUT defeituoso também não contamina o de PINTURA. */
    m.limpar();
    m.janela.validatePaint(payloadRaster({ pintura, paintSchemaVersion: 1, layoutVersion: 0 }));
    const ax5 = lerAxes(m, 'PAINT_AXES:');
    ok('6.6 simetria: eixo de layout defeituoso não contamina o de pintura',
      ax5 && ax5.layout.ok === false && ax5.paint.ok === true && ax5.paint.declared === 1, JSON.stringify(ax5));
  }

  return { casos, avisos, eixosRaster, eixosVetor, pintura, guardaC60 };
}

/**
 * Parte ASSÍNCRONA do `TA-11`: o eixo do ENVELOPE (`POINTER_VERSION`), com o
 * `drawingStorage.js` REAL sobre um disco em memória.
 */
async function executarTA11Ponteiro() {
  const casos = [];
  const avisos = [];
  const ok = (nome, condicao, detalhe = '') => casos.push({ nome, ok: !!condicao, detalhe: condicao ? '' : detalhe });

  const ptr = carregarPonteiroReal();
  const eixosRaster = lerEixosDeclarados(RASTER);
  const pintura = fabricarPintura(W, H, 23);
  const payloadNovo = payloadRaster({ pintura, paintSchemaVersion: 1, layoutVersion: 1 });

  ok('7.1 `POINTER_VERSION` permanece CONGELADO em 3', ptr.POINTER_VERSION === 3, `POINTER_VERSION=${ptr.POINTER_VERSION}`);

  const chaves = readSrc('src/services/storageKeys.js');
  const app = chaves.match(/export const APP_STORAGE_SCHEMA_VERSION = (\d+);/);
  ok('7.2 `APP_STORAGE_SCHEMA_VERSION` permanece CONGELADO em 3', !!app && Number(app[1]) === 3, `valor lido=${app && app[1]}`);

  const c60 = readSrc('src/services/coloring60DrawingStorage.js').match(/const POINTER_VERSION = (\d+);/);
  ok('7.3 `POINTER_VERSION` do Colorir 60 também congelado em 3', !!c60 && Number(c60[1]) === 3, `valor lido=${c60 && c60[1]}`);

  ok('7.4 payload do canvas com os dois eixos novos NÃO é ponteiro',
    ptr.isDrawingPointer(payloadNovo) === false, 'declarar `paintSchemaVersion` transformou o payload em ponteiro');
  ok('7.5 ponteiro v3 continua sendo reconhecido como ponteiro',
    ptr.isDrawingPointer(JSON.stringify({ v: 3, fmt: 2, uri: 'file:///double/a.png', mime: 'image/png' })) === true,
    'o reconhecimento do ponteiro v3 quebrou');
  ok('7.6 eixo do envelope é ORTOGONAL: variar `paintSchemaVersion` não muda a classificação',
    [undefined, 1, 2, 7].every((v) => ptr.isDrawingPointer(payloadRaster({ pintura, paintSchemaVersion: v })) === false),
    'algum valor de `paintSchemaVersion` mudou a classificação de envelope');
  ok('7.7 medida de tinta (`hasMeaningfulPaint`) não depende dos eixos novos',
    ptr.hasMeaningfulPaint(payloadNovo) === ptr.hasMeaningfulPaint(payloadRaster({ pintura })),
    'declarar eixo novo mudou a medida de tinta');

  /* Ida-e-volta REAL pelo ponteiro v3: o que não pode acontecer, sob SD-8, é perder píxel. */
  const ponteiro = await ptr.buildPointer('teste.png', payloadNovo);
  ok('7.8 `buildPointer` materializa o ponteiro v3', typeof ponteiro === 'string' && ptr.isDrawingPointer(ponteiro), `ponteiro=${ponteiro}`);
  const resolvido = await ptr.resolvePointer(ponteiro);
  const original = JSON.parse(payloadNovo);
  const devolta = resolvido ? JSON.parse(resolvido) : {};
  ok('7.9 SD-8 · ida-e-volta pelo ponteiro v3 NÃO perde um píxel da criança',
    devolta.data === original.data, 'o blob voltou diferente do que entrou');
  ok('7.10 o payload resolvido continua sendo aceito pela guarda REAL do C60',
    carregarGuardaC60()(resolvido) === true, 'a guarda rejeitou o payload resolvido do ponteiro');

  /* O payload resolvido volta pelo leitor real: tem de aplicar a tinta, não folha em branco. */
  const m = bootMotor(RASTER, { largura: W, altura: H });
  m.limpar();
  m.janela.loadPaint(resolvido);
  ok('7.11 SD-8 · a obra que voltou do ponteiro é APLICADA (nunca canvas vazio)',
    m.tem('PAINT_APPLIED') && !m.tem('LOAD_PAINT_CORRUPTED'), m.msgs.join(' | '));
  m.limpar();
  m.janela.exportPaint();
  const reexport = JSON.parse(m.ultima('PAINT_EXPORT:') || '{}');
  const voltaPx = decodificarPixels(reexport.data || '');
  ok('7.12 SD-8 · píxeis idênticos depois de ponteiro → leitura → reexportação',
    voltaPx && mesmosPixels(voltaPx.px, pintura), 'a tinta mudou na ida-e-volta completa');
  ok('7.13 o `v` continua 2 depois da ida-e-volta completa',
    reexport.v === eixosRaster.CANVAS_PAYLOAD_V && reexport.v === 2, `v=${reexport.v}`);

  /* DÍVIDA REGISTRADA — não é asserção: é aviso deliberado, para não passar em silêncio. */
  if (devolta.paintSchemaVersion === undefined || devolta.layoutVersion === undefined) {
    avisos.push(
      'DÍVIDA (TK-A-049) · `drawingStorage.buildPointer`/`resolvePointer` copiam apenas '
      + '{W,H,imgX,imgY,imgW,imgH}: os eixos `paintSchemaVersion` e `layoutVersion` NÃO '
      + 'sobrevivem à ida-e-volta pelo ponteiro v3 e a obra volta classificada como legado. '
      + 'Hoje isso é NÃO destrutivo (casos 7.9 a 7.13 provam que nenhum píxel se perde e que '
      + 'o ramo legado lê a obra corretamente), mas o write-forward de `C-A11` precisa '
      + 'preservar os dois eixos. Registrado, não corrigido nesta task.',
    );
  }

  return { casos, avisos };
}

/* ═══════════════════════════ Casos do TA-12 · compatibilidade ══════════════════════════ */

/**
 * Lê o CONJUNTO FECHADO de ramos que o classificador REAL pode devolver, direto do fonte
 * do motor. É isto que torna a exaustividade uma propriedade **verificada** em vez de uma
 * declaração de boa intenção: se alguém acrescentar um ramo ao leitor sem acrescentar a
 * entrada correspondente ao corpus, `G-CMP-1` acende — porque passaria a existir um
 * caminho de leitura sobre o qual ninguém nunca disse o que acontece com a obra da
 * criança, e é exatamente daí que nasce a folha em branco silenciosa.
 */
function ramosDeclarados(rel, nomeFn) {
  const src = readSrc(rel);
  const ini = src.indexOf(`function ${nomeFn}(`);
  if (ini < 0) throw new Error(`ramosDeclarados: \`${nomeFn}\` não encontrada em ${rel}`);
  const fim = src.indexOf('\n}\n', ini);
  if (fim < 0) throw new Error(`ramosDeclarados: não achei o fim de \`${nomeFn}\` em ${rel}`);
  const corpo = src.slice(ini, fim);
  const achados = new Set();
  const re = /ramo:'([a-z0-9-]+)'/g;
  let m;
  while ((m = re.exec(corpo)) !== null) achados.add(m[1]);
  return [...achados].sort();
}

/**
 * Corpus RASTER (`ColoringCanvas`). Cada entrada declara o ramo esperado, se é candidata
 * a abrir e se representa **obra que existe** — a última decide se o motor tem obrigação
 * de GRITAR quando não conseguir abrir. `ausente` é o único caso em que a folha nova é a
 * resposta certa; em todo o resto, silêncio seria indistinguível de perda.
 */
function corpusRaster(pintura) {
  const dataUrl = codificarPixels(W, H, pintura, 'image/png');
  const geo = { W, H, imgX: 0, imgY: 0, imgW: W, imgH: H };
  return [
    { id: '12.1', nome: 'ausência total (`null`)', json: null, ramo: 'ausente', candidato: false, existeObra: false },
    { id: '12.2', nome: 'string vazia', json: '', ramo: 'ausente', candidato: false, existeObra: false },
    { id: '12.3', nome: 'v1 — data URL cru, sem envelope nenhum', json: dataUrl, ramo: 'v1-datauri', candidato: true, existeObra: true },
    { id: '12.4', nome: '`v:2` com geometria e SEM os eixos novos (ausência de eixos)', json: JSON.stringify(Object.assign({ v: 2 }, geo, { data: dataUrl })), ramo: 'v2-legado', candidato: true, existeObra: true },
    { id: '12.5', nome: '`v:2` sem geometria (fallback histórico pelo bitmap)', json: JSON.stringify({ v: 2, data: dataUrl }), ramo: 'v2-legado', candidato: true, existeObra: true },
    { id: '12.6', nome: 'representação atual — os dois eixos declarados', json: JSON.stringify(Object.assign({ v: 2, paintSchemaVersion: 1, layoutVersion: 1, logicalW: W, logicalH: H }, geo, { data: dataUrl })), ramo: 'logico', candidato: true, existeObra: true },
    { id: '12.7', nome: 'ponteiro `fmt:1` chegando NÃO resolvido ao motor', json: JSON.stringify({ v: 3, fmt: 1, uri: 'file:///double/a.png', mime: 'image/png' }), ramo: 'envelope-nao-resolvido', candidato: false, existeObra: true },
    { id: '12.8', nome: 'ponteiro `fmt:2` chegando NÃO resolvido ao motor', json: JSON.stringify(Object.assign({ v: 3, fmt: 2, uri: 'file:///double/b.png', mime: 'image/png' }, geo)), ramo: 'envelope-nao-resolvido', candidato: false, existeObra: true },
    { id: '12.9', nome: 'payload TRUNCADO (JSON inválido)', json: '{"v":2,"W":64,"data":"data:im', ramo: 'ilegivel', candidato: false, existeObra: true },
    { id: '12.10', nome: 'JSON válido que não é objeto (array)', json: '[1,2,3]', ramo: 'ilegivel', candidato: false, existeObra: true },
    { id: '12.11', nome: 'eixo declarado com valor INVÁLIDO (segue candidata — `TK-A-002`)', json: JSON.stringify(Object.assign({ v: 2, paintSchemaVersion: 'x' }, geo, { data: dataUrl })), ramo: 'eixo-invalido', candidato: true, existeObra: true },
    { id: '12.12', nome: 'envelope sem tinta e sem ponteiro', json: JSON.stringify(Object.assign({ v: 2 }, geo)), ramo: 'sem-tinta', candidato: false, existeObra: true },
  ];
}

/** Corpus VETORIAL (`AtelierCanvas`) — mesma leitura, formatos históricos próprios. */
function corpusVetor() {
  const tracos = [{ id: 's1', color: '#F44336', size: 9, eraser: false, points: [{ x: 4, y: 5 }, { x: 20, y: 26 }] }];
  const ops = [{ type: 'stroke', id: 'o1', color: '#2196F3', size: 7, eraser: false, points: [{ x: 2, y: 3 }, { x: 9, y: 11 }] }];
  return [
    { id: '12.13', nome: 'ausência total (string vazia)', json: '', ramo: 'ausente', candidato: false, existeObra: false, tracos: 0 },
    { id: '12.14', nome: 'estado atual — os dois eixos declarados', json: JSON.stringify({ v: 2, paintSchemaVersion: 1, layoutVersion: 1, logicalW: 800, logicalH: 600, strokes: tracos, stamps: [], bgColor: '#FFFDF8' }), ramo: 'logico', candidato: true, existeObra: true, tracos: 1 },
    { id: '12.15', nome: '`v:2` legado (sem eixos novos)', json: JSON.stringify({ v: 2, strokes: tracos, stamps: [], bgColor: '#FFEECC' }), ramo: 'v2-legado', candidato: true, existeObra: true, tracos: 1 },
    { id: '12.16', nome: '`ops[]` — o formato mais antigo do Ateliê', json: JSON.stringify({ ops, bgColor: '#EEFFEE' }), ramo: 'ops-legado', candidato: true, existeObra: true, tracos: 1 },
    { id: '12.17', nome: 'eixo declarado com valor INVÁLIDO (segue candidata)', json: JSON.stringify({ v: 2, layoutVersion: -3, strokes: tracos, stamps: [], bgColor: '#FFFDF8' }), ramo: 'eixo-invalido', candidato: true, existeObra: true, tracos: 1 },
    { id: '12.18', nome: 'payload TRUNCADO (JSON inválido)', json: '{"strokes":[{"id":"s1",', ramo: 'ilegivel', candidato: false, existeObra: true, tracos: 0 },
    { id: '12.19', nome: 'JSON válido que não é objeto (array)', json: '[{"id":"s1"}]', ramo: 'ilegivel', candidato: false, existeObra: true, tracos: 0 },
    { id: '12.20', nome: 'objeto de forma DESCONHECIDA (nem `v:2`, nem `ops[]`, nem eixo)', json: JSON.stringify({ formatoDoFuturo: true, conteudo: 'x' }), ramo: 'desconhecido', candidato: false, existeObra: true, tracos: 0 },
  ];
}

/** Mensagens que, se aparecerem DURANTE uma carga, significam que abrir gravou. */
const SAIDA_DE_BYTES = ['PAINT_EXPORT:', 'STATE_EXPORT:'];

/**
 * `TA-12` — arnês de compatibilidade (`TK-A-046`). Roda o corpus contra os DOIS motores
 * REAIS e sustenta dois portões:
 *
 *   `G-CMP-1` · a classificação é EXAUSTIVA e DETERMINÍSTICA, e incompatibilidade
 *               **nunca** apaga, limpa ou substitui por canvas branco;
 *   `G-CMP-2` · abrir obra **não grava nada**.
 *
 * O detector de `G-CMP-1` não é a mensagem: é a TINTA. O motor recebe primeiro uma obra
 * boa, e só então o payload do corpus. Se um ramo terminal zerar o modelo — que é
 * literalmente o mutante `MT-13` —, a reexportação volta em branco e o caso acende. Uma
 * asserção sobre a mensagem provaria apenas que o motor AVISA; esta prova que ele
 * PRESERVA.
 *
 * Limite declarado (§11.11-b): isto é lógica pura, serialização e classificação — o que
 * Node de fato prova. WebView real, término de processo, `resize` nativo, Split View e
 * geometria física continuam sendo evidência FÍSICA, pendente.
 *
 * @returns {Promise<{casos: Array<{nome:string, ok:boolean, detalhe:string}>, avisos: string[]}>}
 */
async function executarTA12() {
  const casos = [];
  const avisos = [];
  const ok = (nome, condicao, detalhe = '') => casos.push({ nome, ok: !!condicao, detalhe: condicao ? '' : detalhe });

  const pintura = fabricarPintura(W, H, 41);
  const boaRaster = JSON.stringify({
    v: 2, paintSchemaVersion: 1, layoutVersion: 1, logicalW: W, logicalH: H,
    W, H, imgX: 0, imgY: 0, imgW: W, imgH: H, data: codificarPixels(W, H, pintura, 'image/png'),
  });
  const boaVetor = JSON.stringify({
    v: 2, paintSchemaVersion: 1, layoutVersion: 1, logicalW: 800, logicalH: 600,
    strokes: [{ id: 'prev', color: '#4CAF50', size: 11, eraser: false, points: [{ x: 1, y: 1 }, { x: 30, y: 40 }] }],
    stamps: [], bgColor: '#FFFDF8',
  });

  /* ── A. Exaustividade: o corpus cobre TODO ramo que o motor sabe devolver ──────────── */
  const listaRaster = corpusRaster(pintura);
  const listaVetor = corpusVetor();
  {
    const declaradosR = ramosDeclarados(RASTER, 'classificarPayload');
    const cobertosR = [...new Set(listaRaster.map((e) => e.ramo))].sort();
    ok('12.0a G-CMP-1 · o corpus RASTER cobre EXATAMENTE os ramos do classificador real',
      declaradosR.join(',') === cobertosR.join(','),
      `motor=[${declaradosR.join(', ')}] corpus=[${cobertosR.join(', ')}]`);
    const declaradosV = ramosDeclarados(VETOR, 'classificarEstado');
    const cobertosV = [...new Set(listaVetor.map((e) => e.ramo))].sort();
    ok('12.0b G-CMP-1 · o corpus VETORIAL cobre EXATAMENTE os ramos do classificador real',
      declaradosV.join(',') === cobertosV.join(','),
      `motor=[${declaradosV.join(', ')}] corpus=[${cobertosV.join(', ')}]`);
  }

  /* ── B. Corpus RASTER, entrada por entrada ────────────────────────────────────────── */
  for (const e of listaRaster) {
    const m = bootMotor(RASTER, { largura: W, altura: H });
    /* Obra boa ANTES: é ela que denuncia quem apaga. */
    m.janela.loadPaint(boaRaster);
    const aplicouAntes = m.tem('PAINT_APPLIED');
    m.limpar();
    const entrada = e.json;
    m.janela.loadPaint(entrada);
    const ramoBruto = m.ultima('LOAD_PAINT_BRANCH:');
    const cls = ramoBruto ? JSON.parse(ramoBruto) : null;

    ok(`${e.id}-a G-CMP-1 · ${e.nome} → ramo REGISTRADO`, ramoBruto !== null,
      'nenhum `LOAD_PAINT_BRANCH:` foi publicado — a classificação passou em silêncio');
    ok(`${e.id}-b G-CMP-1 · ${e.nome} → ramo \`${e.ramo}\``, cls && cls.ramo === e.ramo,
      `ramo observado=${cls && cls.ramo} | esperado=${e.ramo}`);
    ok(`${e.id}-c G-CMP-1 · ${e.nome} → candidata=${e.candidato}`, cls && cls.candidato === e.candidato,
      `candidato observado=${cls && cls.candidato}`);

    if (e.candidato) {
      ok(`${e.id}-d G-CMP-1 · ${e.nome} → obra recuperável ABRE (nunca folha em branco)`,
        m.tem('PAINT_APPLIED') && !m.tem('LOAD_PAINT_CORRUPTED') && !m.tem('LOAD_PAINT_INCOMPATIBLE'),
        m.msgs.join(' | '));
    } else if (e.existeObra) {
      ok(`${e.id}-d G-CMP-1 · ${e.nome} → obra que existe e não abriu é ANUNCIADA`,
        m.tem('LOAD_PAINT_INCOMPATIBLE') || m.tem('LOAD_PAINT_CORRUPTED'), m.msgs.join(' | '));
    } else {
      ok(`${e.id}-d G-CMP-1 · ${e.nome} → não havia obra: silêncio é o certo, sem alarme falso`,
        !m.tem('LOAD_PAINT_INCOMPATIBLE') && !m.tem('LOAD_PAINT_CORRUPTED'), m.msgs.join(' | '));
    }

    /* O detector de MT-13: a tinta anterior continua inteira depois de um ramo terminal. */
    if (!e.candidato) {
      m.limpar();
      m.janela.exportPaint();
      const volta = decodificarPixels(JSON.parse(m.ultima('PAINT_EXPORT:') || '{}').data || '');
      ok(`${e.id}-e G-CMP-1 · ${e.nome} → a tinta que já estava no modelo NÃO foi apagada`,
        aplicouAntes && volta && mesmosPixels(volta.px, pintura),
        'o modelo perdeu píxeis depois de um ramo terminal — incompatibilidade virou dano');
    }
  }

  /* ── C. G-CMP-2 no RASTER: a carga, sozinha, não produz saída de bytes ────────────── */
  for (const e of listaRaster) {
    const m = bootMotor(RASTER, { largura: W, altura: H });
    m.limpar();
    m.janela.loadPaint(e.json);
    const vazou = m.msgs.filter((s) => SAIDA_DE_BYTES.some((p) => s.startsWith(p)));
    ok(`${e.id}-g G-CMP-2 · ${e.nome} → abrir NÃO grava: zero saída de bytes na carga`,
      vazou.length === 0, `mensagens de saída durante a carga: ${vazou.map((s) => s.slice(0, 24)).join(' | ')}`);
    /* Determinismo: o mesmo payload, motor novo, cai no mesmo ramo — sempre. */
    const m2 = bootMotor(RASTER, { largura: 128, altura: 96, dpr: 2 });
    m2.limpar();
    m2.janela.loadPaint(e.json);
    ok(`${e.id}-h G-CMP-1 · ${e.nome} → classificação DETERMINÍSTICA (janela diferente, mesmo ramo)`,
      m2.ultima('LOAD_PAINT_BRANCH:') === m.ultima('LOAD_PAINT_BRANCH:'),
      `janela A=${m.ultima('LOAD_PAINT_BRANCH:')} | janela B=${m2.ultima('LOAD_PAINT_BRANCH:')}`);
  }

  /* ── D. Corpus VETORIAL, entrada por entrada ──────────────────────────────────────── */
  for (const e of listaVetor) {
    const m = bootMotor(VETOR, { largura: 320, altura: 240 });
    m.janela.loadState(boaVetor);
    m.limpar();
    m.janela.loadState(e.json);
    const ramoBruto = m.ultima('STATE_BRANCH:');
    const cls = ramoBruto ? JSON.parse(ramoBruto) : null;

    ok(`${e.id}-a G-CMP-1 · [vetor] ${e.nome} → ramo REGISTRADO`, ramoBruto !== null,
      'nenhum `STATE_BRANCH:` foi publicado');
    ok(`${e.id}-b G-CMP-1 · [vetor] ${e.nome} → ramo \`${e.ramo}\``, cls && cls.ramo === e.ramo,
      `ramo observado=${cls && cls.ramo} | esperado=${e.ramo}`);
    ok(`${e.id}-c G-CMP-1 · [vetor] ${e.nome} → candidata=${e.candidato}`, cls && cls.candidato === e.candidato,
      `candidato observado=${cls && cls.candidato}`);

    if (!e.candidato && e.existeObra) {
      ok(`${e.id}-d G-CMP-1 · [vetor] ${e.nome} → anunciada, e SEM \`STATE_LOADED\``,
        (m.tem('LOAD_CORRUPTED') || m.tem('LOAD_INCOMPATIBLE')) && !m.tem('STATE_LOADED'),
        `${m.msgs.join(' | ')} — "não abri" e "abri e estava vazia" não podem chegar iguais`);
    } else {
      ok(`${e.id}-d G-CMP-1 · [vetor] ${e.nome} → abre e conclui`,
        m.tem('STATE_LOADED') && !m.tem('LOAD_CORRUPTED') && !m.tem('LOAD_INCOMPATIBLE'), m.msgs.join(' | '));
    }

    /* Detector de MT-13 no vetorial: os traços que já estavam continuam lá. */
    m.limpar();
    m.janela.exportState();
    const exp = JSON.parse(m.ultima('STATE_EXPORT:') || '{}');
    const st = exp.stateJson ? JSON.parse(exp.stateJson) : null;
    const nTracos = st && Array.isArray(st.strokes) ? st.strokes.length : -1;
    if (!e.candidato && e.existeObra) {
      ok(`${e.id}-e G-CMP-1 · [vetor] ${e.nome} → o traço anterior NÃO foi apagado`,
        nTracos === 1, `traços no modelo depois do ramo terminal: ${nTracos} (esperado 1)`);
    } else {
      ok(`${e.id}-e G-CMP-1 · [vetor] ${e.nome} → o modelo reflete a obra lida (${e.tracos} traço/s)`,
        nTracos === e.tracos, `traços=${nTracos} | esperado=${e.tracos}`);
    }
  }

  /* ── E. G-CMP-2 no VETORIAL: carregar, sozinho, não exporta ───────────────────────── */
  for (const e of listaVetor) {
    const m = bootMotor(VETOR, { largura: 320, altura: 240 });
    m.limpar();
    m.janela.loadState(e.json);
    const vazou = m.msgs.filter((s) => SAIDA_DE_BYTES.some((p) => s.startsWith(p)));
    ok(`${e.id}-f G-CMP-2 · [vetor] ${e.nome} → abrir NÃO grava: zero saída de bytes na carga`,
      vazou.length === 0, `mensagens de saída durante a carga: ${vazou.map((s) => s.slice(0, 24)).join(' | ')}`);
  }

  /* ── F. G-CMP-2 no ARMAZENAMENTO REAL: abrir não escreve e não apaga blob ─────────── */
  {
    const ptr = carregarPonteiroReal();
    const ponteiro = await ptr.buildPointer('ta12.png', boaRaster);
    const antes = JSON.stringify([...ptr.disco.entries()]);
    const resolvido = await ptr.resolvePointer(ponteiro);
    const m = bootMotor(RASTER, { largura: W, altura: H });
    m.limpar();
    m.janela.loadPaint(resolvido);
    const depois = JSON.stringify([...ptr.disco.entries()]);
    ok('12.21 G-CMP-2 · resolver o ponteiro + abrir NÃO altera um byte do disco',
      antes === depois && antes.length > 0, 'o armazenamento mudou só porque a obra foi aberta');
    ok('12.22 G-CMP-2 · o blob NÃO é excluído ao abrir (Q8 regra 3)',
      ptr.disco.size >= 1, 'o blob sumiu do disco durante a abertura');
    ok('12.23 G-CMP-1 · a obra vinda do ponteiro ABRE (nunca folha em branco)',
      m.tem('PAINT_APPLIED'), m.msgs.join(' | '));
    /* Ler duas vezes seguidas é idêntico: não há conversão acumulando a cada abertura. */
    m.limpar();
    m.janela.loadPaint(resolvido);
    const segundaLeitura = JSON.stringify([...ptr.disco.entries()]);
    ok('12.24 G-CMP-2 · abrir DUAS vezes continua sem escrever (nenhuma migração ao abrir)',
      segundaLeitura === antes, 'a segunda abertura escreveu no armazenamento');
    m.limpar();
    m.janela.exportPaint();
    const volta = decodificarPixels(JSON.parse(m.ultima('PAINT_EXPORT:') || '{}').data || '');
    ok('12.25 SD-8 · depois de duas aberturas, a tinta continua píxel a píxel a mesma',
      volta && mesmosPixels(volta.px, pintura), 'a obra mudou entre aberturas');
  }

  /* ── G. G-CMP-6 · IDENTIDADE DO LINEART (TK-A-051 · invariante ZERO #2) ────────────
     Todo o corpus acima roda com `imgJson: 'null'` — ou seja, SEM lineart. Sem lineart
     não existe identidade de lineart a conferir, e a verificação de `TK-A-051` nunca é
     exercida. Esta seção é a única que injeta um lineart REAL no motor, e por isso é a
     única que pode provar (ou derrubar) `G-CMP-6`.

     O lineart tem 640×480, então o espaço lógico é 640×480 e a razão de referência é
     4:3. A obra boa (`boaRaster`) declara os eixos e traz um bitmap 64×48 — mesma razão,
     resolução menor: a reamostragem é uma reampliação uniforme LEGÍTIMA, e precisa
     continuar entrando. Os casos de recusa mudam a RAZÃO do retângulo salvo, que é o
     que acontece de fato quando o lineart de uma atividade é trocado por outro desenho. */
  {
    const LWfix = 640;
    const LHfix = 480;
    const lineart = codificarPixels(LWfix, LHfix, fabricarPintura(LWfix, LHfix, 7), 'image/png');
    const comLineart = (extra) => bootMotor(RASTER, Object.assign({
      largura: W, altura: H, overrides: { imgJson: JSON.stringify(lineart) },
    }, extra || {}));
    /* Payload LEGADO (sem eixos declarados) que ESCREVE o retângulo do lineart: é o
       ramo em que `imgX/imgY/imgW/imgH` mandam, exatamente o contrato de `TK-A-051`. */
    const legadoComRetangulo = (iw, ih) => JSON.stringify({
      v: 2, W: LWfix, H: LHfix, imgX: 0, imgY: 0, imgW: iw, imgH: ih,
      data: codificarPixels(LWfix, LHfix, fabricarPintura(LWfix, LHfix, 23), 'image/png'),
    });

    const mBoa = comLineart();
    mBoa.janela.loadPaint(boaRaster);
    ok('12.26 G-CMP-6 · obra na MESMA razão do lineart (4:3, resolução menor) ABRE normalmente',
      mBoa.tem('PAINT_APPLIED'), mBoa.msgs.join(' | '));

    {
      const m = comLineart();
      m.janela.loadPaint(legadoComRetangulo(640, 483));   /* 1,3251 contra 1,3333 = 0,6% */
      ok('12.27 G-CMP-6 · divergência de ARREDONDAMENTO (0,6%) NÃO é recusa — obra legada legítima abre',
        m.tem('PAINT_APPLIED'), m.msgs.join(' | '));
    }

    /* O caso central: retângulo QUADRADO gravado sob um lineart 4:3. Sem a verificação,
       `drawImage` estica 480 para 640 na horizontal e a tinta entra deformada sobre
       linhas que não são as dela — estrago silencioso, sem nenhuma mensagem de erro. */
    const mDiv = comLineart();
    mDiv.janela.loadPaint(boaRaster);                      /* obra BOA já aberta e viva */
    mDiv.limpar();
    mDiv.janela.exportPaint();
    const tintaAntes = mDiv.ultima('PAINT_EXPORT:');
    mDiv.limpar();
    mDiv.janela.loadPaint(legadoComRetangulo(480, 480));   /* 1,0 contra 1,3333 = 25% */
    const durante = mDiv.msgs.slice(0);
    ok('12.28 G-CMP-6 · retângulo de OUTRA razão (1:1 sob lineart 4:3) é RECUSADO — a tinta não é composta',
      !mDiv.tem('PAINT_APPLIED'), mDiv.msgs.join(' | '));
    ok('12.29 G-CMP-6 · a recusa declara o MOTIVO `identidade-lineart` (distinta de "sem retângulo")',
      /"motivo":"identidade-lineart"/.test(mDiv.ultima('LOAD_PAINT_ORIGIN:') || ''),
      `LOAD_PAINT_ORIGIN ausente ou com outro motivo: ${mDiv.ultima('LOAD_PAINT_ORIGIN:')}`);
    mDiv.limpar();
    mDiv.janela.exportPaint();
    ok('12.30 SD-8 · a recusa por identidade NÃO apaga a obra que já estava aberta',
      tintaAntes && mDiv.ultima('PAINT_EXPORT:') === tintaAntes,
      'a tinta viva mudou depois de um payload recusado por identidade');
    ok('12.31 G-CMP-2 · a recusa por identidade não emite NENHUMA saída de bytes',
      durante.every((s) => !SAIDA_DE_BYTES.some((p) => s.startsWith(p))),
      `saída de bytes durante a recusa: ${durante.join(' | ')}`);

    /* Os DOIS pontos de entrada precisam concordar (a regra de `TK-A-041`): se
       `validatePaint` dissesse "pode continuar pintando" e a carga recusasse, a criança
       veria a oferta e receberia a folha limpa — a divergência é que produz o estrago. */
    {
      const m = comLineart();
      m.janela.validatePaint(legadoComRetangulo(480, 480));
      ok('12.32 G-CMP-6 · `validatePaint` CONCORDA com a carga e responde `PAINT_INVALID`',
        m.tem('PAINT_INVALID') && !m.tem('PAINT_VALID'), m.msgs.join(' | '));
      const m2 = comLineart();
      m2.janela.validatePaint(boaRaster);
      ok('12.33 G-CMP-6 · `validatePaint` continua aceitando a obra de razão compatível',
        m2.tem('PAINT_VALID') && !m2.tem('PAINT_INVALID'), m2.msgs.join(' | '));
    }

    /* Fronteira que impede a regressão de C-A9: SEM lineart (folha livre) não há
       identidade a conferir, e a obra pintada em retrato precisa continuar reabrindo em
       paisagem. Se `G-CMP-6` passasse a valer aqui, ele destruiria justamente o caso que
       C-A9 existe para salvar. */
    {
      const m = bootMotor(RASTER, { largura: W, altura: H });
      m.janela.loadPaint(JSON.stringify({
        v: 2, paintSchemaVersion: 1, layoutVersion: 1, logicalW: 48, logicalH: 64,
        W: 48, H: 64, imgX: 0, imgY: 0, imgW: 48, imgH: 64,
        data: codificarPixels(48, 64, fabricarPintura(48, 64, 31), 'image/png'),
      }));
      ok('12.34 G-CMP-6 · folha livre (sem lineart): razão diferente NÃO é recusada — C-A9 preservado',
        m.tem('PAINT_APPLIED'), m.msgs.join(' | '));
    }
  }

  return { casos, avisos };
}

/* ═══════════════ TA-13 · write-forward, releitura e rollback (`TK-A-053`) ══════════════
   Cria `G-CMP-4`: promoção só depois de validar integridade e PROVAR releitura (`Q8`
   regras 7, 8 e 9). Esta função NÃO prova o portão — quem o prova é `MT-14`
   (`TK-A-054`), injetado por outra task.

   O que a leitura dirigida `TK-A-096` encontrou, e que muda o que esta prova pode
   afirmar honestamente: NÃO existe um ponto único de promoção. Existem três cadeias de
   salvamento, com quatro pontos de promoção, e elas divergem materialmente:

     · `coloring60DrawingStorage.js:581` — o ÚNICO caminho vivo do Colorir. Já implementa
       o write-forward inteiro: blob no slot INATIVO (double-buffer A/B) → promover →
       RELER a chave → `confirmPromotion` (identidade, URI e revisão) → `rollback` na
       divergência → só então descartar o blob antigo. `Q8` r.7-9 SATISFEITAS.
     · `drawingStorage.js:140` — escritor LEGADO. `TA-13` confirma que ele não tem
       chamador de runtime: escrever um write-forward aqui seria cerimônia sobre código
       morto, não proteção da obra de ninguém. O LEITOR do mesmo módulo continua vivo
       (o Livrinho lê as 199 cenas legadas por `getSavedDrawing`), e por isso o módulo
       permanece INTOCADO.
     · `atelierStorage.js:138` e `:146` — DOIS `setItem` não atômicos entre si, blob de
       preview sobrescrito em caminho determinístico ANTES da promoção, e nenhuma
       releitura, confirmação ou rollback. É a divergência real, e `atelierStorage.js`
       não aparece na lista de arquivos de NENHUMA task de `F6-R3`.

   Divisão honesta da prova. Os casos de ORDEM abaixo são propriedade ESTÁTICA lida do
   fonte — eles fixam a SEQUÊNCIA, que nenhum teste comportamental fixa. A prova
   COMPORTAMENTAL das mesmas regras já existe e é independente: os 30 cenários `S3` do
   `scripts/smoke.js` executam o writer REAL com disco e AsyncStorage duplos
   (`S3 [03]` promoção só depois do blob, `[04]` releitura + confirmação, `[05]` descarte
   só depois de confirmar, `[07]` rollback, `[21]` interrupção antes da promoção,
   `[30]` confirmação de endereço). `MT-14` derruba as duas metades ao mesmo tempo. */
async function executarTA13() {
  const casos = [];
  const avisos = [];
  const ok = (nome, condicao, detalhe = '') => casos.push({ nome, ok: !!condicao, detalhe: condicao ? '' : detalhe });

  const C60 = 'src/services/coloring60DrawingStorage.js';
  const src = readSrc(C60);
  const ini = src.indexOf('export async function saveColoring60DrawingState');
  const corpo = ini >= 0 ? src.slice(ini, src.indexOf('\n}\n', ini)) : '';
  const at = (agulha) => corpo.indexOf(agulha);
  const iBlob = at('await writeSlot(');
  const iPromo = at('await AsyncStorage.setItem(k, toStore)');
  const iRelê = at('check = await AsyncStorage.getItem(k)');
  const iConf = at('confirmPromotion(check, toStore');
  const iDel = at('await deleteBlob(oldUri');

  ok('13.0 G-CMP-4 · o ponto de promoção congelado por `TK-A-096` continua no lugar declarado',
    corpo.length > 0 && iBlob > 0 && iPromo > 0, `não localizei o corpo de saveColoring60DrawingState em ${C60}`);
  ok('13.1 G-CMP-4 · `Q8` r.9 [estática] o blob novo é gravado ANTES da promoção do ponteiro',
    iBlob > 0 && iPromo > iBlob, `writeSlot=${iBlob} promoção=${iPromo}`);
  ok('13.2 G-CMP-4 · `Q8` r.8 [estática] a chave é RELIDA depois da promoção',
    iRelê > iPromo, `promoção=${iPromo} releitura=${iRelê}`);
  ok('13.3 G-CMP-4 · `Q8` r.8 [estática] a releitura é CONFIRMADA (não basta reler: identidade, URI e revisão)',
    iConf > iRelê && /function confirmPromotion\(/.test(src), `releitura=${iRelê} confirmação=${iConf}`);
  /* `iConf > 0` explícito: sem ele, remover a confirmação faria `iConf` valer -1 e a
     comparação passaria VACUAMENTE — o caso ficaria verde justamente no defeito que
     deveria denunciar. Foi `MT-14` que expôs isso, e é a razão de o mutante existir. */
  ok('13.4 G-CMP-4 · `Q8` r.7 [estática] o blob ANTIGO só é descartado DEPOIS da confirmação',
    iConf > 0 && iDel > iConf, `confirmação=${iConf} descarte=${iDel}`);
  {
    /* Os DOIS caminhos de falha — `setItem` rejeitado e confirmação divergente — precisam
       desfazer. Um deles sem rollback deixaria a criança com um ponteiro que não se prova. */
    const rb = (corpo.match(/await rollbackFailedPromotion\(/g) || []).length;
    ok('13.5 G-CMP-4 · `Q8` r.9 [estática] os DOIS caminhos de falha da promoção fazem rollback',
      rb >= 2, `chamadas a rollbackFailedPromotion no corpo: ${rb}`);
    const rbIni = src.indexOf('async function rollbackFailedPromotion');
    const rbCorpo = rbIni >= 0 ? src.slice(rbIni, src.indexOf('\n}\n', rbIni)) : '';
    ok('13.6 G-CMP-4 · `Q8` r.9 [estática] o rollback RESTAURA o anterior antes de descartar o blob novo',
      rbCorpo.indexOf('setItem') > 0 && (rbCorpo.indexOf('deleteBlob') < 0
        || rbCorpo.indexOf('setItem') < rbCorpo.indexOf('deleteBlob')),
      'o rollback descarta o blob novo antes de devolver a chave ao estado anterior');
  }

  /* ── O escritor legado: registrado, não "consertado" ───────────────────────────────── */
  {
    const alvos = [];
    (function andar(dir) {
      for (const nome of fs.readdirSync(path.join(ROOT, dir))) {
        const rel = `${dir}/${nome}`;
        if (fs.statSync(path.join(ROOT, rel)).isDirectory()) andar(rel);
        else if (nome.endsWith('.js')) alvos.push(rel);
      }
    })('src');
    const citantes = alvos.filter((rel) => rel !== 'src/services/drawingStorage.js'
      && /\bsaveDrawingState\s*\(/.test(readSrc(rel)));
    ok('13.7 `TK-A-096` · o escritor legado `saveDrawingState` NÃO tem chamador de runtime',
      citantes.length === 0, `chamadores encontrados: ${citantes.join(', ')}`);
    const leitores = alvos.filter((rel) => rel !== 'src/services/drawingStorage.js'
      && /\bgetSavedDrawing\s*\(/.test(readSrc(rel)));
    ok('13.8 `Q8` r.11 · o LEITOR legado continua vivo — o módulo não pode ser tocado nem removido',
      leitores.length >= 1, 'nenhum leitor de getSavedDrawing: a premissa de compatibilidade mudou');
  }

  /* ── Ateliê: o que HOJE segura `SD-8`, e o que falta ───────────────────────────────── */
  {
    const AT = 'src/services/atelierStorage.js';
    const aSrc = readSrc(AT);
    const aIni = aSrc.indexOf('export async function saveArt(');
    const aCorpo = aIni >= 0 ? aSrc.slice(aIni, aSrc.indexOf('\n}\n', aIni)) : '';
    /* Esta é a asserção que importa para `SD-8`, e ela continua verdadeira mesmo depois
       de um eventual write-forward: `stateJson` — a obra de verdade — viaja num ÚNICO
       `setItem` por chave. `setItem` é atômico por chave, então uma falha ou uma
       interrupção deixa o valor ANTERIOR vigente. Nenhuma leitura-modificação-escrita
       sobre a obra; nenhum caminho apaga `artKey(id)` durante o salvamento. */
    const gravacoesDaObra = (aCorpo.match(/setItem\(artKey\(/g) || []).length;
    ok('13.9 SD-8 · [Ateliê] a obra (`stateJson`) viaja num ÚNICO `setItem` por chave — falha deixa a anterior vigente',
      gravacoesDaObra === 1 && !/removeItem\(artKey\(/.test(aCorpo),
      `gravações de artKey no salvamento: ${gravacoesDaObra}`);
    const temReleitura = /getItem\(artKey\(/.test(aCorpo);
    const temRollback = /rollback/i.test(aCorpo);
    if (!temReleitura || !temRollback) {
      avisos.push('DÍVIDA (TK-A-096 · desvio registrado) · `atelierStorage.saveArt` NÃO implementa o write-forward '
        + 'de `Q8` r.7-9: são DOIS `setItem` não atômicos entre si (obra em `:138`, índice em `:146`), o blob de '
        + 'preview é sobrescrito em caminho determinístico ANTES da promoção, e não há releitura, confirmação nem '
        + 'rollback. Severidade avaliada: MÉDIA, não `SD-8` — o caso 13.9 prova que a obra da criança não é '
        + 'destruída por falha nem por interrupção; o que se perde numa interrupção é coerência de preview/índice, '
        + 'que é derivada e recuperável. NÃO corrigido nesta fase: `atelierStorage.js` não consta da lista de '
        + 'arquivos de NENHUMA task de `F6-R3` (`TK-A-049` nomeia `drawingStorage.js`, que é o escritor MORTO). '
        + 'Exige decisão do fundador antes de qualquer alteração.');
    }
  }

  /* ── O único caso COMPORTAMENTAL: a ida-e-volta real não perde a obra ─────────────── */
  {
    const pintura = fabricarPintura(W, H, 71);
    const payload = JSON.stringify({
      v: 2, paintSchemaVersion: 1, layoutVersion: 1, logicalW: W, logicalH: H,
      W, H, imgX: 0, imgY: 0, imgW: W, imgH: H, data: codificarPixels(W, H, pintura, 'image/png'),
    });
    const ptr = carregarPonteiroReal();
    const ponteiro = await ptr.buildPointer('ta13.png', payload);
    const resolvido = await ptr.resolvePointer(ponteiro);
    const m = bootMotor(RASTER, { largura: W, altura: H });
    m.janela.loadPaint(resolvido);
    m.limpar();
    m.janela.exportPaint();
    const volta = decodificarPixels(JSON.parse(m.ultima('PAINT_EXPORT:') || '{}').data || '');
    ok('13.10 `Q8` r.9 [comportamental] a obra sobrevive à ida-e-volta pelo ponteiro REAL, píxel a píxel',
      volta && mesmosPixels(volta.px, pintura), 'a promoção pelo ponteiro alterou a obra');
  }

  return { casos, avisos };
}

/* ═══════════════════════════════════════ Runner ════════════════════════════════════════ */

async function main() {
  let casos = [];
  let avisos = [];
  try {
    const sincrono = executarTA11();
    const assincrono = await executarTA11Ponteiro();
    const compat = await executarTA12();
    const wf = await executarTA13();
    casos = sincrono.casos.concat(assincrono.casos, compat.casos, wf.casos);
    avisos = sincrono.avisos.concat(assincrono.avisos, compat.avisos, wf.avisos);
  } catch (err) {
    console.error(`\n✖ TA-11 abortou: ${err && err.message}`);
    console.error(err && err.stack);
    process.exit(1);
    return;
  }

  console.log('\n── TA-11 (quatro eixos) + TA-12 (compatibilidade) + TA-13 (write-forward) ──\n');
  let falhas = 0;
  for (const c of casos) {
    if (c.ok) { console.log(`  ✓ ${c.nome}`); } else { falhas++; console.log(`  ✖ ${c.nome}\n      ${c.detalhe}`); }
  }
  for (const a of avisos) console.log(`\n  ⚠ ${a}`);
  console.log(`\n── TA-11+TA-12+TA-13: ${casos.length - falhas}/${casos.length} casos verdes, ${falhas} vermelhos ──\n`);
  process.exit(falhas === 0 ? 0 : 1);
}

if (require.main === module) main();

module.exports = {
  executarTA11,
  executarTA11Ponteiro,
  executarTA12,
  executarTA13,
  ramosDeclarados,
  bootMotor,
  loadModule,
  lerEixosDeclarados,
  carregarGuardaC60,
  carregarPonteiroReal,
  codificarPixels,
  decodificarPixels,
  fabricarPintura,
  mesmosPixels,
  payloadRaster,
  RASTER,
  VETOR,
};
