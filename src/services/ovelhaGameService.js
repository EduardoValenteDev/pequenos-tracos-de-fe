/**
 * ovelhaGameService.js — Núcleo PURO de "Cadê a Ovelhinha?" (Bloco 2.1 · corrigido no 2.1a).
 *
 * Sem I/O, sem relógio, sem React, sem áudio, nunca lança. `rnd` injetável → determinístico.
 *
 * ── Modelo ÚNICO de item (2.1a) ───────────────────────────────────────────────
 * A rodada tem UMA coleção `items`. Cada item carrega sua identidade completa:
 *
 *   { id, role: 'target'|'distractor', visualId, cx, cy, ncx, ncy, visualSize, hitbox, region }
 *
 * `targetId` aponta para EXATAMENTE um item cujo `role === 'target'`. O acerto se decide
 * comparando o ID tocado com `targetId` — nunca pelo índice do array. Assim a ordem do
 * array pode até ser embaralhada sem quebrar a ligação id↔role↔visual↔hitbox.
 *
 * O alvo é escolhido ANTES do posicionamento (não se recalcula depois). Cada item tem a
 * SUA hitbox (≥56×56, centrada no sprite). A validade da posição usa interseção REAL de
 * retângulos com folga — não só distância entre centros.
 */

/* ─────────────────────────── Dificuldade ─────────────────────────── */

export const OVELHA_HITBOX_MIN = 56;
export const OVELHA_ROUNDS = 5;

/**
 * Dificuldades. Só a Fácil é jogável neste bloco. Alvo e distrator têm tamanhos
 * SEMELHANTES (≤15% de diferença), o alvo só um pouco maior. `compFrac` encolhe a
 * área de composição para os itens parecerem uma mini-cena, não três objetos perdidos.
 */
export const OVELHA_DIFFICULTIES = Object.freeze([
  {
    id: 'facil',
    label: 'Fácil',
    premium: false,
    elementos: 3,
    alvoFrac: 0.225,   // sprite do alvo = fração da menor dimensão
    distFrac: 0.20,    // distrator ~11% menor (dentro dos 15%)
    margemFrac: 0.06,
    gapFrac: 0.035,    // folga mínima entre hitboxes
    hitboxBonus: 0.22, // hitbox = sprite × (1+bônus), respeitando o piso
    compFracW: 0.92,   // largura útil da composição (fração da área)
    compFracH: 0.72,   // altura útil (evita espalhar por toda a tela)
  },
]);

export function getDifficulty(id) {
  return OVELHA_DIFFICULTIES.find((d) => d.id === id) || OVELHA_DIFFICULTIES[0];
}

/* ─────────────────────────── Utilidades puras ─────────────────────────── */

/** Fisher-Yates com `rnd` injetável. Não muta a entrada. Identidade vive no item, não no índice. */
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

/**
 * Interseção REAL de duas hitboxes quadradas (axis-aligned), com folga `gap`.
 * `a`/`b` = { cx, cy, hitbox }. True se os retângulos (mais a folga) se cruzam.
 * Não se apoia só na distância entre centros: compara as bordas dos retângulos.
 */
export function rectsIntersect(a, b, gap = 0) {
  const am = a.hitbox / 2;
  const bm = b.hitbox / 2;
  return !(
    a.cx + am + gap <= b.cx - bm ||   // a totalmente à esquerda de b
    b.cx + bm + gap <= a.cx - am ||   // b totalmente à esquerda de a
    a.cy + am + gap <= b.cy - bm ||   // a totalmente acima de b
    b.cy + bm + gap <= a.cy - am      // b totalmente acima de a
  );
}

/** Tamanho do sprite e da hitbox (px) para uma fração e área. */
export function tamanhoSprite(frac, largura, altura, hitboxBonus = 0.22) {
  const menor = Math.max(1, Math.min(Number(largura) || 0, Number(altura) || 0));
  const size = Math.round(menor * frac);
  const hitbox = Math.max(OVELHA_HITBOX_MIN, Math.round(size * (1 + hitboxBonus)));
  return { size, hitbox };
}

/* ─────────────────────────── Composição ─────────────────────────── */

/**
 * Caixa de composição CENTRADA e mais compacta que a área toda — evita "três itens
 * perdidos num painel gigante". Os itens ficam longe do topo/base extremos.
 */
function caixaComposicao({ largura, altura, margem, compFracW, compFracH }) {
  const larguraUtil = Math.min(largura - margem * 2, largura * compFracW);
  const alturaUtil = Math.min(altura - margem * 2, altura * compFracH);
  return {
    x0: (largura - larguraUtil) / 2,
    y0: (altura - alturaUtil) / 2,
    x1: (largura + larguraUtil) / 2,
    y1: (altura + alturaUtil) / 2,
  };
}

/**
 * Posiciona itens (com hitbox PRÓPRIA cada) dentro da caixa, sem interseção real.
 * Tenta aleatório (até 40× por item); se falhar, cai no fallback de grade. Determinístico.
 *
 * @param specs Array<{ hitbox }> — a ordem importa: o item 0 (alvo) é colocado primeiro,
 *              com mais espaço, e pode evitar a região anterior.
 * @returns Array<{ cx, cy }> na MESMA ordem de `specs`.
 */
export function posicionarItens({ largura, altura, margem, gap, specs, rnd = Math.random, regiaoAnterior = null, evitarPrimeiro = false }) {
  const caixa = caixaComposicao({ largura, altura, margem, compFracW: 0.92, compFracH: 0.72 });
  const colocados = [];

  const limites = (hb) => {
    const meia = hb / 2;
    return {
      minX: Math.max(margem + meia, caixa.x0 + meia),
      maxX: Math.min(largura - margem - meia, caixa.x1 - meia),
      minY: Math.max(margem + meia, caixa.y0 + meia),
      maxY: Math.min(altura - margem - meia, caixa.y1 - meia),
    };
  };

  let precisaFallback = false;
  for (let idx = 0; idx < specs.length; idx++) {
    const spec = specs[idx];
    const L = limites(spec.hitbox);
    let posto = false;
    if (L.maxX > L.minX && L.maxY > L.minY) {
      const querEvitar = evitarPrimeiro && idx === 0 && regiaoAnterior != null;
      for (let t = 0; t < 40; t++) {
        const cand = {
          cx: L.minX + rnd() * (L.maxX - L.minX),
          cy: L.minY + rnd() * (L.maxY - L.minY),
          hitbox: spec.hitbox,
        };
        const cruza = colocados.some((c) => rectsIntersect(c, cand, gap));
        const regiaoRuim = querEvitar && t < 30
          && regiaoDe(cand.cx, cand.cy, largura, altura) === regiaoAnterior;
        if (!cruza && !regiaoRuim) { colocados.push(cand); posto = true; break; }
      }
    }
    if (!posto) { precisaFallback = true; break; }
  }

  if (!precisaFallback && colocados.length === specs.length) {
    return colocados.map((c) => ({ cx: c.cx, cy: c.cy }));
  }
  return fallbackGrade({ largura, altura, margem, gap, specs, rnd });
}

/**
 * Grade determinística com jitter. Sempre válida e sem interseção quando a área comporta.
 * Colunas dimensionadas pela MAIOR hitbox → quebra em linhas numa tela estreita.
 */
export function fallbackGrade({ largura, altura, margem, gap = 0, specs, rnd = Math.random }) {
  const n = specs.length;
  const maiorHb = Math.max(...specs.map((s) => s.hitbox), OVELHA_HITBOX_MIN);
  const caixa = caixaComposicao({ largura, altura, margem, compFracW: 0.94, compFracH: 0.8 });
  const areaW = Math.max(maiorHb, caixa.x1 - caixa.x0);
  const areaH = Math.max(maiorHb, caixa.y1 - caixa.y0);

  const cols = Math.min(n, Math.max(1, Math.floor(areaW / maiorHb)));
  const rows = Math.ceil(n / cols);
  const cellW = areaW / cols;
  const cellH = areaH / rows;

  return specs.map((spec, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const meia = spec.hitbox / 2;
    const baseX = caixa.x0 + cellW * (col + 0.5);
    const baseY = caixa.y0 + cellH * (row + 0.5);
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

const KINDS_DISTRATOR = ['gato', 'pato', 'coelho', 'porco'];

/**
 * Monta uma rodada COMPLETA. PURO. O alvo é decidido ANTES do posicionamento e colocado
 * primeiro (com mais espaço). Devolve o modelo único `{ roundId, targetId, items, ... }`.
 * Os itens vêm EMBARALHADOS (a identidade vive no id, não na ordem).
 */
export function buildRound({ dif, largura, altura, rnd = Math.random, regiaoAnterior = null, roundId = 0 }) {
  const d = dif || getDifficulty('facil');
  const n = d.elementos;
  const margem = Math.round(Math.min(largura, altura) * d.margemFrac);
  const gap = Math.round(Math.min(largura, altura) * d.gapFrac);

  const alvoT = tamanhoSprite(d.alvoFrac, largura, altura, d.hitboxBonus);
  const distT = tamanhoSprite(d.distFrac, largura, altura, d.hitboxBonus);

  // Alvo primeiro (índice 0), depois distratores — cada um com sua hitbox.
  const specs = [alvoT, ...Array.from({ length: n - 1 }, () => distT)];
  const centros = posicionarItens({
    largura, altura, margem, gap, specs, rnd,
    regiaoAnterior, evitarPrimeiro: true,
  });

  const kinds = shuffle(KINDS_DISTRATOR, rnd);
  const tiposOc = shuffle(TIPOS_OCLUSOR, rnd);
  const targetId = `r${roundId}-target`;
  const faixa = (min, max) => min + rnd() * (max - min);

  // Item 0 = alvo; demais = distratores. Cada um com id/role/visual/hitbox/oclusor.
  const brutos = centros.map((c, i) => {
    const alvo = i === 0;
    const spec = alvo ? alvoT : distT;
    // Oclusão PARCIAL: o alvo fica mais escondido (sem passar do mínimo visível),
    // os distratores só encostam no cenário (continuam claramente visíveis).
    const coberturaFrac = alvo
      ? faixa(OCLUSAO.ALVO_MIN, OCLUSAO.ALVO_MAX)
      : faixa(OCLUSAO.DIST_MIN, OCLUSAO.DIST_MAX);
    return {
      id: alvo ? targetId : `r${roundId}-distractor-${String(i).padStart(2, '0')}`,
      role: alvo ? 'target' : 'distractor',
      visualId: alvo ? 'ovelha' : kinds[(i - 1) % kinds.length],
      cx: Math.round(c.cx),
      cy: Math.round(c.cy),
      ncx: largura ? c.cx / largura : 0,
      ncy: altura ? c.cy / altura : 0,
      visualSize: spec.size,
      hitbox: spec.hitbox,
      region: regiaoDe(c.cx, c.cy, largura, altura),
      // Oclusor frontal (cenário provisório) que cobre a BASE do sprite. Só visual;
      // não altera a hitbox nem recebe toque.
      occluder: {
        tipo: tiposOc[i % tiposOc.length],
        coberturaFrac: Math.round(coberturaFrac * 100) / 100,
      },
    };
  });

  const alvo = brutos[0];
  return {
    roundId,
    targetId,
    regiaoAlvo: alvo.region,
    // Cenário decorativo de fundo (tufos/flores). Puro, sem toque, não afeta hitbox.
    decor: gerarDecor({ largura, altura, margem, rnd, roundId }),
    // Embaralha a ORDEM visual (z-order/entrada) — a identidade segue no id.
    items: shuffle(brutos, rnd),
  };
}

/** Decoração de fundo (tufos de grama/flores). Puro, apenas visual. */
function gerarDecor({ largura, altura, margem, rnd, roundId }) {
  const caixa = caixaComposicao({ largura, altura, margem, compFracW: 0.96, compFracH: 0.86 });
  const tipos = ['grama', 'flor', 'grama', 'folha'];
  const n = 5;
  return Array.from({ length: n }, (_, i) => {
    const size = Math.round(Math.min(largura, altura) * (0.06 + rnd() * 0.05));
    return {
      id: `r${roundId}-decor-${i}`,
      tipo: tipos[Math.floor(rnd() * tipos.length)],
      cx: Math.round(caixa.x0 + rnd() * (caixa.x1 - caixa.x0)),
      cy: Math.round(caixa.y0 + rnd() * (caixa.y1 - caixa.y0)),
      size,
    };
  });
}

/* ─────────────────────────── Invariantes ─────────────────────────── */

/** Exatamente um item com role 'target', e ele é o `targetId`. */
export function exactlyOneTarget(round) {
  if (!round || !Array.isArray(round.items)) return false;
  const alvos = round.items.filter((it) => it.role === 'target');
  return alvos.length === 1 && alvos[0].id === round.targetId;
}

/** O alvo existe, tem visual de ovelha e tamanho renderizável. */
export function targetIsRenderable(round) {
  const t = round?.items?.find((it) => it.id === round.targetId);
  return !!t && t.role === 'target' && t.visualId === 'ovelha' && t.visualSize > 0 && t.hitbox >= OVELHA_HITBOX_MIN;
}

/** O alvo está inteiro dentro dos limites da área. */
export function targetInsideBounds(round, largura, altura, margem) {
  const t = round?.items?.find((it) => it.id === round.targetId);
  if (!t) return false;
  const meia = t.hitbox / 2;
  return t.cx - meia >= margem - 0.5 && t.cx + meia <= largura - margem + 0.5
    && t.cy - meia >= margem - 0.5 && t.cy + meia <= altura - margem + 0.5;
}

/** Nenhuma hitbox se cruza (interseção real, sem folga exigida). */
export function semSobreposicao(items, gap = 0) {
  const rs = (items || []).map((s) => ({ cx: s.cx, cy: s.cy, hitbox: s.hitbox }));
  for (let i = 0; i < rs.length; i++) {
    for (let j = i + 1; j < rs.length; j++) {
      if (rectsIntersect(rs[i], rs[j], gap)) return false;
    }
  }
  return true;
}

/** A rodada inteira é válida e jogável? Inclui a oclusão parcial do alvo (2.1b). */
export function roundValido(round, largura, altura, margem) {
  if (!round || !Array.isArray(round.items) || round.items.length < 2) return false;
  return exactlyOneTarget(round)
    && targetIsRenderable(round)
    && targetInsideBounds(round, largura, altura, margem)
    && targetHitboxValid(round)
    && targetVisibleAreaMinima(round)   // alvo parcialmente escondido, nunca 100% oculto
    && semSobreposicao(round.items);
}

/** Todos os itens cabem na área (usado nos testes). */
export function todosDentro(items, largura, altura, margem) {
  return (items || []).every((s) => {
    const meia = s.hitbox / 2;
    return s.cx - meia >= margem - 0.5 && s.cx + meia <= largura - margem + 0.5
      && s.cy - meia >= margem - 0.5 && s.cy + meia <= altura - margem + 0.5;
  });
}

/** Margem em px de uma dificuldade e área (helper para a tela e os testes). */
export function margemDe(dif, largura, altura) {
  const d = dif || getDifficulty('facil');
  return Math.round(Math.min(largura, altura) * d.margemFrac);
}

/**
 * Eventos de som — CHAVES do audioManager (reaproveitadas do Pares; nenhum arquivo novo).
 */
export const OVELHA_SOUND_EVENTS = Object.freeze({
  TOQUE: 'card_flip',
  ACERTO: 'match_success',
  ERRO: 'match_error',
  TROCA: 'board_complete',
  VITORIA: 'classic_victory_jingle',
});

/**
 * Regras de DICA (2.1b). A ajuda não revela a posição cedo. Níveis:
 *   0 nenhuma · 1 incentivo (só mensagem) · 2 halo em anel · 3 anel mais evidente
 * Disparo por TEMPO de busca (ms) OU ERROS ELEGÍVEIS (o que vier primeiro).
 *
 * ⚠️ `erros` aqui é o contador de ERRO ELEGÍVEL POR RODADA (não o cumulativo da
 * partida). Spam no mesmo distrator não escala a dica — ver a regra de elegibilidade
 * na tela (item diferente OU cooldown). Reinicia a cada rodada.
 */
export const DICA = Object.freeze({
  T1_MS: 10000, T2_MS: 14000, T3_MS: 18000,   // tempo de busca sem acerto
  E1: 2, E2: 3, E3: 5,                          // nº de erros ELEGÍVEIS
});

/** Cooldown para um erro no MESMO item contar de novo para a dica (anti-spam). */
export const ERRO_ELEGIVEL_COOLDOWN_MS = 700;

/**
 * Decide se um erro CONTA para a progressão da dica (é "elegível"). PURO.
 * Conta se for item DIFERENTE do último erro, OU se passou o cooldown. Assim,
 * repetir o mesmo distrator rápido não infla a ajuda.
 */
export function erroElegivel({ id, ultimoId, agoraMs, ultimoMs }, cooldown = ERRO_ELEGIVEL_COOLDOWN_MS) {
  if (id !== ultimoId) return true;
  return (Number(agoraMs) - Number(ultimoMs)) >= cooldown;
}

/** Nível de dica dado o tempo de busca (ms) e os erros ELEGÍVEIS da rodada. PURO. */
export function nivelDica(elapsedMs, errosElegiveis) {
  const t = Number(elapsedMs) || 0;
  const e = Number(errosElegiveis) || 0;
  let nivel = 0;
  if (t >= DICA.T1_MS || e >= DICA.E1) nivel = 1;
  if (t >= DICA.T2_MS || e >= DICA.E2) nivel = 2;
  if (t >= DICA.T3_MS || e >= DICA.E3) nivel = 3;
  return nivel;
}

/* ─────────────────────────── Oclusão parcial (2.1b) ─────────────────────────── */

/**
 * Cobertura de oclusão por papel. O ALVO fica parcialmente escondido (mas sempre
 * ≥40% visível); os distratores ficam levemente encostados no cenário (≥70% visíveis,
 * para não parecerem bugs). Fração = quanto da altura do sprite o oclusor cobre (base).
 */
export const OCLUSAO = Object.freeze({
  ALVO_MIN: 0.40, ALVO_MAX: 0.55,          // alvo: 40–55% coberto → 45–60% visível
  DIST_MIN: 0.12, DIST_MAX: 0.30,          // distrator: 12–30% coberto
  VISIVEL_MIN_ALVO: 0.40,                  // invariante: alvo ≥40% aparente
});

const TIPOS_OCLUSOR = ['arbusto', 'pedra', 'feno', 'moita'];

/** Fração visível do sprite (1 − cobertura). PURO. */
export function visivelFrac(item) {
  const cob = Number(item?.occluder?.coberturaFrac) || 0;
  return Math.max(0, 1 - cob);
}

/** O alvo mantém a fração visível mínima? (oclusão parcial, nunca total). PURO. */
export function targetVisibleAreaMinima(round, min = OCLUSAO.VISIVEL_MIN_ALVO) {
  const t = round?.items?.find((it) => it.id === round.targetId);
  if (!t) return false;
  const vis = visivelFrac(t);
  return vis >= min && vis < 1;   // ≥ mínimo E não totalmente descoberto
}

/** Hitbox do alvo válida (≥ piso). PURO. */
export function targetHitboxValid(round) {
  const t = round?.items?.find((it) => it.id === round.targetId);
  return !!t && t.hitbox >= OVELHA_HITBOX_MIN;
}
