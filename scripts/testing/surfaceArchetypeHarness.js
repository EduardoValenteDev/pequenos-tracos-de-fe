/* ─────────────────────────────────────────────────────────────────────────────
 * Arnês de ARQUÉTIPOS POR FAMÍLIA — `TA-14` · `F6-R1.2` · `F6-SG-C` · `TK-C-004`
 *
 * O que este arnês existe para impedir: que "responsividade" volte a significar
 * uma regra universal de colunas ligada à faixa. `Q3` decidiu o contrário — a
 * composição deriva da FAMÍLIA e do CONTEÚDO REAL, e a faixa é insumo, não regra.
 * Um portão que apenas verificasse "os quatro arquivos existem" passaria mesmo se
 * as quatro famílias tivessem exatamente a mesma política. A pergunta aqui é
 * outra: dada a mesma família com conteúdos e faixas diferentes, QUAL composição
 * sai — e ela é distinta entre famílias?
 *
 * Só a REGIÃO PURA dos quatro módulos é carregada. O `loadModule` do
 * `packInstallHarness` (o mesmo dos demais arneses, para não nascer uma segunda
 * forma de carregar módulo no repositório) apaga tudo a partir de
 * `export default` — por isso os arquétipos declaram a política ANTES do
 * componente, e o JSX fica fora do alcance deste arnês. É proposital: `TA-14`
 * prova POLÍTICA, não layout nativo.
 *
 * `SD-11` / `G-RSP-7`: este arquivo NÃO declara faixa, limiar nem teto de colunas
 * próprios. `BANDS` vem do hook REAL e `grid` vem de `src/theme/tokens.js`.
 * ───────────────────────────────────────────────────────────────────────────── */

const { loadModule } = require('./packInstallHarness');
const { montarFaixa } = require('./windowBandHarness');

/** As quatro famílias de `Q3`, cada uma com a política que lhe é própria. */
const ARQUETIPOS = {
  hub: {
    rotulo: 'Hub',
    arquivo: 'src/components/layout/HubSurface.js',
    exports: ['HUB_COLUMN_CEILING', 'hubColumnCeiling', 'hubColumns'],
  },
  editorial: {
    rotulo: 'Editorial',
    arquivo: 'src/components/layout/EditorialSurface.js',
    exports: ['editorialSupportCapacity', 'editorialComposition'],
  },
  imersiva: {
    rotulo: 'Imersiva',
    arquivo: 'src/components/layout/ImmersiveSurface.js',
    exports: ['immersiveComposition'],
  },
  jogo: {
    rotulo: 'Jogo',
    arquivo: 'src/components/layout/GameSurface.js',
    exports: ['gameFrame'],
  },
};

/** `BANDS` e `grid` REAIS — nunca uma cópia local. */
function fontesCanonicas() {
  const { BANDS } = montarFaixa();
  const { grid } = loadModule('src/theme/tokens.js', {}, ['grid']);
  return { BANDS, grid };
}

/**
 * Carrega a região pura de UM arquétipo. Arquivo ausente não derruba o smoke:
 * devolve `{ ausente: true }` e vira VERMELHO reportado pelo chamador — que é a
 * diferença entre um portão que falha e um processo que morre.
 */
function carregarArquetipo(chave, mutate) {
  const meta = ARQUETIPOS[chave];
  if (!meta) throw new Error(`carregarArquetipo: família desconhecida "${chave}"`);
  const { BANDS, grid } = fontesCanonicas();
  try {
    const mod = loadModule(meta.arquivo, { BANDS, grid }, meta.exports, mutate);
    const faltando = meta.exports.filter((n) => mod[n] === undefined);
    return { ausente: false, faltando, mod, BANDS, grid };
  } catch (e) {
    return { ausente: true, faltando: meta.exports.slice(), erro: e.message, BANDS, grid };
  }
}

/* ── Hub ─────────────────────────────────────────────────────────────────────
 * Cada linha é uma pergunta de produto: "com este inventário, nesta largura,
 * nesta faixa — quantas colunas a criança vê?". As três últimas existem para
 * matar a regra universal: faixa média que dá UMA coluna (cartão largo), faixa
 * expandida que dá DUAS (inventário pobre) e o mesmo conteúdo produzindo
 * composições distintas entre média e expandida (`SD-2`). */
const CENARIOS_HUB = [
  { nome: 'compacta · 12 itens, cartão pequeno — o teto da faixa manda',
    band: 'compact', availableWidth: 360, itemCount: 12, minItemWidth: 150, gap: 12, esperado: 1 },
  { nome: 'compacta · largura absurdamente pequena — nunca zero colunas',
    band: 'compact', availableWidth: 100, itemCount: 12, minItemWidth: 220, gap: 16, esperado: 1 },
  { nome: 'média · 12 itens, cartão de 320 — cabem duas',
    band: 'medium', availableWidth: 700, itemCount: 12, minItemWidth: 320, gap: 16, esperado: 2 },
  { nome: 'média · MESMO inventário, cartão de 400 — cabe UMA (tablet não é "duas")',
    band: 'medium', availableWidth: 640, itemCount: 12, minItemWidth: 400, gap: 16, esperado: 1 },
  { nome: 'expandida · 12 itens, cartão pequeno — o teto da faixa segura em três',
    band: 'expanded', availableWidth: 1180, itemCount: 12, minItemWidth: 220, gap: 16, esperado: 3 },
  { nome: 'expandida · MESMA largura, só 2 itens — o inventário manda',
    band: 'expanded', availableWidth: 1180, itemCount: 2, minItemWidth: 220, gap: 16, esperado: 2 },
  { nome: 'expandida · 1 item — expandida também não é "três"',
    band: 'expanded', availableWidth: 1180, itemCount: 1, minItemWidth: 220, gap: 16, esperado: 1 },
];

/* O mesmo conteúdo atravessando as três faixas: a prova de `SD-2` pedida pela
 * Conclusão de `TK-C-007` e o insumo do item "mesma família, faixas diferentes". */
const TRAVESSIA_HUB = {
  itemCount: 9,
  minItemWidth: 220,
  gap: 16,
  larguras: { compact: 411, medium: 823, expanded: 1180 },
  esperado: { compact: 1, medium: 2, expanded: 3 },
};

function executarHub(mutate) {
  const { ausente, faltando, mod, BANDS } = carregarArquetipo('hub', mutate);
  if (ausente || faltando.length) return { ausente: true, faltando, linhas: [], travessia: [] };

  const linhas = CENARIOS_HUB.map((c) => {
    const obtido = mod.hubColumns({
      band: BANDS[c.band.toUpperCase()],
      availableWidth: c.availableWidth,
      itemCount: c.itemCount,
      minItemWidth: c.minItemWidth,
      gap: c.gap,
    });
    return { ...c, obtido, ok: obtido === c.esperado };
  });

  const travessia = Object.keys(TRAVESSIA_HUB.larguras).map((faixa) => {
    const obtido = mod.hubColumns({
      band: BANDS[faixa.toUpperCase()],
      availableWidth: TRAVESSIA_HUB.larguras[faixa],
      itemCount: TRAVESSIA_HUB.itemCount,
      minItemWidth: TRAVESSIA_HUB.minItemWidth,
      gap: TRAVESSIA_HUB.gap,
    });
    return { faixa, obtido, esperado: TRAVESSIA_HUB.esperado[faixa], ok: obtido === TRAVESSIA_HUB.esperado[faixa] };
  });

  return { ausente: false, faltando: [], linhas, travessia };
}

/* ── Editorial ───────────────────────────────────────────────────────────────
 * Duas regras, e a segunda é a que costuma ser violada: a região de apoio é uma
 * CAPACIDADE da faixa expandida, mas só existe quando o chamador de fato traz
 * conteúdo para ela. `TK-C-004` não inventa painel, não decide o que vai nele e
 * não cria conteúdo — expõe a região opcional. */
const CENARIOS_EDITORIAL = [
  { nome: 'compacta · o chamador traz apoio — a faixa não tem capacidade', band: 'compact', hasSupport: true, capacidade: false, apoio: false },
  { nome: 'média · o chamador traz apoio — a faixa ainda não tem capacidade', band: 'medium', hasSupport: true, capacidade: false, apoio: false },
  { nome: 'expandida · SEM conteúdo de apoio — capacidade sim, painel não', band: 'expanded', hasSupport: false, capacidade: true, apoio: false },
  { nome: 'expandida · COM conteúdo de apoio — a região aparece', band: 'expanded', hasSupport: true, capacidade: true, apoio: true },
];

function executarEditorial(mutate) {
  const { ausente, faltando, mod, BANDS } = carregarArquetipo('editorial', mutate);
  if (ausente || faltando.length) return { ausente: true, faltando, linhas: [] };

  const linhas = CENARIOS_EDITORIAL.map((c) => {
    const band = BANDS[c.band.toUpperCase()];
    const r = mod.editorialComposition({ band, hasSupport: c.hasSupport });
    return {
      ...c,
      obtido: r,
      ok:
        r.supportCapacity === c.capacidade &&
        r.support === c.apoio &&
        r.columnOwner === 'ContentContainer' &&
        mod.editorialSupportCapacity(band) === c.capacidade,
    };
  });

  return { ausente: false, faltando: [], linhas };
}

/* ── Imersiva ────────────────────────────────────────────────────────────────
 * A obra domina a superfície nas três faixas. A faixa expandida ganha CAPACIDADE
 * de composição acompanhante (`D10`) — a composição em si é entrega de `F9`. O
 * que nunca varia: janela inteira, nenhuma coluna imposta, nenhum recorte. */
function executarImersiva(mutate) {
  const { ausente, faltando, mod, BANDS } = carregarArquetipo('imersiva', mutate);
  if (ausente || faltando.length) return { ausente: true, faltando, linhas: [] };

  const linhas = ['compact', 'medium', 'expanded'].map((faixa) => {
    const r = mod.immersiveComposition({ band: BANDS[faixa.toUpperCase()] });
    const capacidadeEsperada = faixa === 'expanded';
    return {
      faixa,
      obtido: r,
      ok:
        r.fill === 'window' &&
        r.imposesColumn === false &&
        r.cropsArt === false &&
        r.companionCapacity === capacidadeEsperada,
    };
  });

  return { ausente: false, faltando: [], linhas };
}

/* ── Jogo ────────────────────────────────────────────────────────────────────
 * Aqui a faixa não entra na conta, e isso É a política da família: quem governa
 * é a proporção do tabuleiro. O excedente vira moldura simétrica; a área jogável
 * nunca é distorcida nem transborda. */
const CENARIOS_JOGO = [
  { nome: 'paisagem larga · 1200x600 com tabuleiro 4:3 — sobra moldura lateral', availableWidth: 1200, availableHeight: 600, aspectRatio: 4 / 3, molduraX: true, molduraY: false },
  { nome: 'retrato estreito · 400x900 com tabuleiro 4:3 — sobra moldura superior/inferior', availableWidth: 400, availableHeight: 900, aspectRatio: 4 / 3, molduraX: false, molduraY: true },
  { nome: 'tablet em paisagem · 1180x820 com tabuleiro 1:1', availableWidth: 1180, availableHeight: 820, aspectRatio: 1, molduraX: true, molduraY: false },
  { nome: 'encaixe exato · 800x600 com tabuleiro 4:3 — moldura zero', availableWidth: 800, availableHeight: 600, aspectRatio: 4 / 3, molduraX: false, molduraY: false },
];

const EPSILON = 1e-9;

function executarJogo(mutate) {
  const { ausente, faltando, mod } = carregarArquetipo('jogo', mutate);
  if (ausente || faltando.length) return { ausente: true, faltando, linhas: [] };

  const linhas = CENARIOS_JOGO.map((c) => {
    const r = mod.gameFrame({
      availableWidth: c.availableWidth,
      availableHeight: c.availableHeight,
      aspectRatio: c.aspectRatio,
    });
    const proporcao = r.height > 0 ? r.width / r.height : 0;
    return {
      ...c,
      obtido: r,
      ok:
        Math.abs(proporcao - c.aspectRatio) < EPSILON &&        // NUNCA distorção
        r.width <= c.availableWidth + EPSILON &&                 // nunca transborda
        r.height <= c.availableHeight + EPSILON &&
        r.frameX >= -EPSILON && r.frameY >= -EPSILON &&          // o excedente é moldura
        (r.frameX > EPSILON) === c.molduraX &&
        (r.frameY > EPSILON) === c.molduraY,
    };
  });

  return { ausente: false, faltando: [], linhas };
}

/** Quais dos quatro arquivos ainda não existem (ou não expõem a política). */
function familiasIncompletas(mutate) {
  return Object.keys(ARQUETIPOS)
    .map((chave) => ({ chave, r: carregarArquetipo(chave, mutate) }))
    .filter(({ r }) => r.ausente || r.faltando.length)
    .map(({ chave, r }) => `${ARQUETIPOS[chave].rotulo}: ${r.erro || `sem ${r.faltando.join('/')}`}`);
}

module.exports = {
  ARQUETIPOS,
  carregarArquetipo,
  familiasIncompletas,
  executarHub,
  executarEditorial,
  executarImersiva,
  executarJogo,
  CENARIOS_HUB,
  TRAVESSIA_HUB,
  CENARIOS_EDITORIAL,
  CENARIOS_JOGO,
};
