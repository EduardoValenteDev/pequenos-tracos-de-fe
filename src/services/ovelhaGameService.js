/**
 * ovelhaGameService.js — Núcleo PURO do jogo "Cadê a Ovelhinha?" (Bloco 2.1 — vertical slice).
 *
 * Sem I/O, sem relógio, sem React, sem áudio, nunca lança. Recebe o aleatório por
 * parâmetro (`rnd`) para ser determinístico no teste. É este módulo — junto da máquina
 * — que o smoke exercita de verdade.
 *
 * Responsabilidade: dado o tamanho REAL da área de jogo (medido por onLayout na tela),
 * devolver a composição de uma cena — quantos sprites, quem é o alvo, e onde cada um
 * fica — de forma que:
 *   · nada saia dos limites (margem segura);
 *   · nenhuma HITBOX se sobreponha (a hitbox é quadrada, ≥ 56×56 e ≥ o sprite);
 *   · o alvo não caia na mesma região da rodada anterior;
 *   · se 30 tentativas aleatórias falharem, um fallback de GRADE com jitter — que
 *     também varia com `rnd` — garante uma composição válida.
 *
 * Trabalha em PIXELS (largura/altura passados), então "cabe em várias resoluções" se
 * testa chamando com vários tamanhos. Também devolve o centro normalizado (0..1) para
 * quem quiser animar sem depender do px.
 */

/* ─────────────────────────── Dificuldade ─────────────────────────── */

/** Piso ABSOLUTO da hitbox (px). Abaixo disso a criança erra o toque. */
export const OVELHA_HITBOX_MIN = 56;

/** Rodadas por partida — TODAS as dificuldades têm 5 (decisão do Bloco 2.1). */
export const OVELHA_ROUNDS = 5;

/**
 * Dificuldades. Só a Fácil é jogável neste bloco; a estrutura já comporta as demais
 * sem refatoração (Bloco 2.3). `alvoFrac`/`distFrac` = tamanho do sprite como fração
 * da MENOR dimensão da área (escala sozinho entre celular e tablet).
 */
export const OVELHA_DIFFICULTIES = Object.freeze([
  {
    id: 'facil',
    label: 'Fácil',
    premium: false,
    elementos: 3,
    alvoFrac: 0.26,
    distFrac: 0.24,
    margemFrac: 0.06,
    gapFrac: 0.03,     // folga extra entre hitboxes, além da soma dos meios-lados
    hitboxBonus: 0.30, // hitbox = sprite × (1 + bônus), respeitando o piso
    dicaMs: 5000,
  },
]);

export function getDifficulty(id) {
  return OVELHA_DIFFICULTIES.find((d) => d.id === id) || OVELHA_DIFFICULTIES[0];
}

/* ─────────────────────────── Utilidades puras ─────────────────────────── */

/** Fisher-Yates com `rnd` injetável. Não muta a entrada. */
export function shuffle(arr, rnd = Math.random) {
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Região grosseira (grade 3×3) de um centro, para evitar repetição do alvo. */
export function regiaoDe(cx, cy, largura, altura) {
  const w = Number(largura) > 0 ? largura : 1;
  const h = Number(altura) > 0 ? altura : 1;
  const col = clamp(Math.floor((cx / w) * 3), 0, 2);
  const lin = clamp(Math.floor((cy / h) * 3), 0, 2);
  return lin * 3 + col;
}

/** Distância de Chebyshev — a métrica certa para quadrados (hitboxes). */
function chebyshev(a, b) {
  return Math.max(Math.abs(a.cx - b.cx), Math.abs(a.cy - b.cy));
}

/** Duas hitboxes quadradas colidem? (com folga). */
function colide(a, b, gap) {
  return chebyshev(a, b) < (a.hitbox + b.hitbox) / 2 + gap;
}

/* ─────────────────────────── Geometria ─────────────────────────── */

/**
 * Tamanho do sprite e da hitbox (px) para uma dificuldade e área.
 * @returns {{ size:number, hitbox:number }}
 */
export function tamanhoSprite(frac, largura, altura, hitboxBonus = 0.3) {
  const menor = Math.max(1, Math.min(Number(largura) || 0, Number(altura) || 0));
  const size = Math.round(menor * frac);
  const hitbox = Math.max(OVELHA_HITBOX_MIN, Math.round(size * (1 + hitboxBonus)));
  return { size, hitbox };
}

/**
 * Posiciona N sprites sem sobreposição de hitbox, dentro da margem. PURO.
 * Cada item de `specs` = { hitbox, size }. Devolve centros na MESMA ordem.
 *
 * Tenta aleatório (até 30× por sprite); se não couber, cai no fallback de grade
 * com jitter determinístico (nunca falha).
 *
 * @returns {Array<{cx:number, cy:number}>}
 */
export function posicionarSprites({ largura, altura, margem, gap, specs, rnd = Math.random }) {
  const w = Number(largura) > 0 ? largura : 0;
  const h = Number(altura) > 0 ? altura : 0;
  const colocados = [];

  const dentro = (cx, cy, hb) => {
    const meia = hb / 2;
    return cx >= margem + meia && cx <= w - margem - meia
      && cy >= margem + meia && cy <= h - margem - meia;
  };

  let precisaFallback = false;
  for (const spec of specs) {
    const meia = spec.hitbox / 2;
    const minX = margem + meia;
    const maxX = w - margem - meia;
    const minY = margem + meia;
    const maxY = h - margem - meia;

    let posto = false;
    if (maxX > minX && maxY > minY) {
      for (let t = 0; t < 30; t++) {
        const cand = {
          cx: minX + rnd() * (maxX - minX),
          cy: minY + rnd() * (maxY - minY),
          hitbox: spec.hitbox,
        };
        if (!colocados.some((c) => colide(c, cand, gap))) {
          colocados.push(cand);
          posto = true;
          break;
        }
      }
    }
    if (!posto) { precisaFallback = true; break; }
  }

  if (!precisaFallback && colocados.length === specs.length) {
    return colocados.map((c) => ({ cx: c.cx, cy: c.cy }));
  }

  // ── Fallback: grade 2D jittered. Nunca falha, nunca sobrepõe. ──
  return fallbackGrade({ largura: w, altura: h, margem, gap, specs, rnd });
}

/**
 * Grade determinística com jitter por `rnd`. Sempre válida e sem sobreposição.
 *
 * As colunas são dimensionadas pela MAIOR hitbox — numa tela estreita a grade quebra
 * em linhas (2D), em vez de espremer tudo numa fileira que estouraria a largura. O
 * jitter é limitado para nunca encostar na célula vizinha.
 */
export function fallbackGrade({ largura, altura, margem, gap = 0, specs, rnd = Math.random }) {
  const n = specs.length;
  const maiorHb = Math.max(...specs.map((s) => s.hitbox), OVELHA_HITBOX_MIN);
  const areaW = Math.max(maiorHb, largura - margem * 2);
  const areaH = Math.max(maiorHb, altura - margem * 2);

  // Tantas colunas quantas caibam a maior hitbox (≥1, ≤n). cellW ≥ maiorHb garantido.
  const cols = Math.min(n, Math.max(1, Math.floor(areaW / maiorHb)));
  const rows = Math.ceil(n / cols);
  const cellW = areaW / cols;
  const cellH = areaH / rows;

  return specs.map((spec, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const meia = spec.hitbox / 2;
    const baseX = margem + cellW * (col + 0.5);
    const baseY = margem + cellH * (row + 0.5);
    // jitter deixa uma folga de `gap` para a célula vizinha (nunca colide)
    const folgaX = Math.max(0, cellW / 2 - meia - gap);
    const folgaY = Math.max(0, cellH / 2 - meia - gap);
    const jx = (rnd() - 0.5) * 2 * folgaX;
    const jy = (rnd() - 0.5) * 2 * folgaY;
    return {
      cx: clamp(baseX + jx, margem + meia, largura - margem - meia),
      cy: clamp(baseY + jy, margem + meia, altura - margem - meia),
    };
  });
}

/* ─────────────────────────── Composição da rodada ─────────────────────────── */

/**
 * Monta uma cena completa. PURO. Escolhe quem é o alvo evitando a região anterior.
 *
 * @returns {{
 *   alvoIndex:number, regiaoAlvo:number,
 *   sprites: Array<{ id:string, tipo:'alvo'|'distrator', kind:string,
 *                    cx:number, cy:number, ncx:number, ncy:number, size:number, hitbox:number }>
 * }}
 */
export function buildRound({ dif, largura, altura, rnd = Math.random, regiaoAnterior = null }) {
  const d = dif || getDifficulty('facil');
  const n = d.elementos;
  const margem = Math.round(Math.min(largura, altura) * d.margemFrac);
  const gap = Math.round(Math.min(largura, altura) * d.gapFrac);

  const alvoT = tamanhoSprite(d.alvoFrac, largura, altura, d.hitboxBonus);
  const distT = tamanhoSprite(d.distFrac, largura, altura, d.hitboxBonus);

  // HITBOX UNIFORME (a maior) para TODOS. O visual difere (o alvo é maior), mas a
  // hitbox não — assim escolher o alvo DEPOIS do posicionamento nunca faz a hitbox
  // dele estourar a margem/colidir. Também deixa o toque igualmente confortável.
  const hitbox = Math.max(alvoT.hitbox, distT.hitbox);
  const specs = Array.from({ length: n }, () => ({ hitbox, size: hitbox }));
  const centros = posicionarSprites({ largura, altura, margem, gap, specs, rnd });

  const regioes = centros.map((c) => regiaoDe(c.cx, c.cy, largura, altura));

  // Alvo = uma posição cuja região difira da anterior, se possível.
  const candidatos = regiaoAnterior == null
    ? centros.map((_, i) => i)
    : centros.map((_, i) => i).filter((i) => regioes[i] !== regiaoAnterior);
  const poolAlvo = candidatos.length ? candidatos : centros.map((_, i) => i);
  const alvoIndex = poolAlvo[Math.floor(rnd() * poolAlvo.length)];

  // Distratores temporários "claramente diferentes" (formas vetoriais na tela).
  const kindsDistrator = shuffle(['gato', 'pato', 'coelho', 'porco'], rnd);
  let di = 0;

  const sprites = centros.map((c, i) => {
    const alvo = i === alvoIndex;
    return {
      id: `r-${i}`,
      tipo: alvo ? 'alvo' : 'distrator',
      kind: alvo ? 'ovelha' : kindsDistrator[di++ % kindsDistrator.length],
      cx: Math.round(c.cx),
      cy: Math.round(c.cy),
      ncx: largura ? c.cx / largura : 0,
      ncy: altura ? c.cy / altura : 0,
      // Visual: o alvo é maior; a HITBOX é uniforme (toque igual, sem overflow).
      size: alvo ? alvoT.size : distT.size,
      hitbox,
    };
  });

  return { alvoIndex, regiaoAlvo: regioes[alvoIndex], sprites };
}

/** Nenhuma hitbox de `sprites` se sobrepõe? (verificação usada nos testes) */
export function semSobreposicao(sprites, gap = 0) {
  for (let i = 0; i < sprites.length; i++) {
    for (let j = i + 1; j < sprites.length; j++) {
      if (colide(sprites[i], sprites[j], gap)) return false;
    }
  }
  return true;
}

/** Todos os sprites cabem na área, respeitando a margem? */
export function todosDentro(sprites, largura, altura, margem) {
  return sprites.every((s) => {
    const meia = s.hitbox / 2;
    return s.cx - meia >= margem - 0.5 && s.cx + meia <= largura - margem + 0.5
      && s.cy - meia >= margem - 0.5 && s.cy + meia <= altura - margem + 0.5;
  });
}

/**
 * Eventos de som — valores são as CHAVES do audioManager (reaproveitadas do Pares;
 * NENHUM arquivo novo neste bloco). A tela nunca conhece caminho de asset.
 */
export const OVELHA_SOUND_EVENTS = Object.freeze({
  TOQUE: 'card_flip',
  ACERTO: 'match_success',
  ERRO: 'match_error',
  TROCA: 'board_complete',
  VITORIA: 'classic_victory_jingle',
});
