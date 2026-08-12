/* ─────────────────────────────────────────────────────────────────────────────
 * Arnês de FAIXA DE JANELA — `TA-6` (faixas) · `F6-R1.2` · `F6-SG-C` · `TK-C-001`
 *
 * Prova a CONSEQUÊNCIA, não a existência do token. Um portão que apenas afirmasse
 * "existe `breakpoints.tabletL`" passaria mesmo se a classificação estivesse
 * invertida. Aqui a pergunta é outra: dada uma largura de janela, QUAL faixa sai?
 *
 * O módulo REAL (`src/hooks/useWindowBand.js`) é carregado pelo `loadModule` do
 * `packInstallHarness` — o mesmo usado pelos demais arneses do projeto, para que
 * não nasça uma segunda forma de carregar módulo no repositório. Os `breakpoints`
 * injetados são os REAIS de `src/theme/tokens.js`: se alguém mudar 600 ou 900 na
 * fonte única, esta bateria muda junto e a divergência aparece.
 *
 * `SD-11` / `G-RSP-7`: este arquivo NÃO declara faixa nem limiar próprio. As
 * fronteiras da tabela abaixo são as que o produto precisa ver funcionando; os
 * VALORES de corte vêm sempre de `tokens.breakpoints`.
 * ───────────────────────────────────────────────────────────────────────────── */

const { loadModule } = require('./packInstallHarness');

const HOOK = 'src/hooks/useWindowBand.js';
const TOKENS = 'src/theme/tokens.js';

/** Os `breakpoints` REAIS da fonte única — nunca uma cópia. */
function carregarBreakpoints() {
  return loadModule(TOKENS, {}, ['breakpoints']).breakpoints;
}

/**
 * Carrega o hook REAL com dependências inertes.
 *
 * `useMemo` inerte apenas AVALIA a fábrica: o arnês mede a política de faixa, não
 * a memoização do React. `useWindowDimensions` é um duplo controlável, que é o
 * único jeito de varrer larguras sem um dispositivo.
 */
function montarFaixa(mutate) {
  const breakpoints = carregarBreakpoints();
  const janela = { width: 0, height: 0 };
  const deps = {
    useMemo: (fabrica) => fabrica(),
    useWindowDimensions: () => janela,
    breakpoints,
  };
  const mod = loadModule(HOOK, deps, ['BANDS', 'bandForWidth', 'useWindowBand'], mutate);
  return {
    ...mod,
    breakpoints,
    /** Posiciona a janela e devolve o que o hook REAL enxerga. */
    lerJanela(width, height) {
      janela.width = width;
      janela.height = height;
      return mod.useWindowBand();
    },
  };
}

/* As fronteiras exigidas pelo contrato de `F6-R1`, mais os dois extremos. Cada
 * par é uma pergunta de produto: "nesta largura, a criança vê a composição de
 * qual faixa?". `599`/`600` e `899`/`900` são os degraus; `823` é o meio real de
 * um tablet em retrato — o caso que mais aparece no aparelho do fundador. */
const FRONTEIRAS = [
  { width: 0, esperado: 'compact' },
  { width: 359, esperado: 'compact' },
  { width: 599, esperado: 'compact' },
  { width: 600, esperado: 'medium' },
  { width: 823, esperado: 'medium' },
  { width: 899, esperado: 'medium' },
  { width: 900, esperado: 'expanded' },
  { width: 1280, esperado: 'expanded' },
];

/**
 * Varre a tabela de fronteiras contra o classificador puro do módulo REAL.
 * Devolve uma linha por largura — quem decide PASS/FAIL é o chamador (o smoke).
 */
function executarFaixas(mutate) {
  const { bandForWidth } = montarFaixa(mutate);
  return FRONTEIRAS.map(({ width, esperado }) => {
    const obtido = bandForWidth(width);
    return { width, esperado, obtido, ok: obtido === esperado };
  });
}

/**
 * Prova que o HOOK (e não só a função pura) entrega o contrato completo:
 * `{ width, height, isLandscape, band }`, com a faixa vindo da MESMA política.
 */
function executarHook(mutate) {
  const faixa = montarFaixa(mutate);
  const CENARIOS = [
    { width: 411, height: 891, retrato: true },   // telefone em retrato
    { width: 891, height: 411, retrato: false },  // telefone em paisagem
    { width: 823, height: 1180, retrato: true },  // tablet em retrato
    { width: 1180, height: 823, retrato: false }, // tablet em paisagem
  ];
  return CENARIOS.map(({ width, height, retrato }) => {
    const r = faixa.lerJanela(width, height);
    return {
      width,
      height,
      obtido: r,
      ok:
        r.width === width &&
        r.height === height &&
        r.isLandscape === !retrato &&
        r.band === faixa.bandForWidth(width),
    };
  });
}

/** As três faixas declaradas pelo módulo, para o lacre de cardinalidade. */
function lerBands(mutate) {
  return montarFaixa(mutate).BANDS;
}

module.exports = { montarFaixa, executarFaixas, executarHook, lerBands, carregarBreakpoints, FRONTEIRAS };
