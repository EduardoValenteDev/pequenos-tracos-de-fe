/* ─────────────────────────────────────────────────────────────────────────────
 * Arnês do VIEWPORT DE CONTEÚDO — `G-CVP-1` · Fase 6 · `F6.2`
 *
 * A pergunta que este arnês responde não é "o módulo existe?", e sim: DADA uma
 * janela e uma medida de região, QUAL grandeza a tela recebe — e o que muda de
 * produto quando ela é a errada.
 *
 * Só a REGIÃO PURA de `ContentViewportContext.js` é carregada, pelo `loadModule`
 * comum a todos os arneses do repositório. `bandForWidth` entra REAL, vindo do
 * `windowBandHarness`: se este arquivo declarasse a própria tradução de largura
 * em faixa, o teste provaria a cópia e não o dono — que é o defeito `P-30`.
 *
 * `SD-11` / `G-RSP-7`: nenhum limiar, faixa ou largura de barra é declarado aqui.
 * As larguras da tabela são MEDIDAS de aparelho (documentadas na campanha física),
 * não cortes de política.
 * ───────────────────────────────────────────────────────────────────────────── */

const { loadModule } = require('./packInstallHarness');
const { montarFaixa } = require('./windowBandHarness');

const MODULO = 'src/context/ContentViewportContext.js';

/**
 * Carrega a política REAL do viewport de conteúdo.
 *
 * `React` entra como duplo inerte porque a região pura ainda cria o Context no
 * topo do arquivo; o que este arnês mede é a POLÍTICA, não o React.
 */
function montarViewport(mutate) {
  const { bandForWidth, BANDS } = montarFaixa();
  const deps = { bandForWidth, React: { createContext: () => null } };
  const mod = loadModule(MODULO, deps, ['CONTENT_VIEWPORT_SOURCE', 'resolveContentViewport'], mutate);
  return { ...mod, BANDS, bandForWidth };
}

/* ── Bateria A · O CARIMBO (`F6-SG-C · CAUSA B` · `G-RSP-9`) ──────────────────
 * A sequência de quadros de UMA rotação. O quadro do meio é o defeito que a
 * política existe para recusar: a janela já virou, a medida ainda não voltou.
 * Uma medida daquela outra janela descreveria uma tela que já morreu.
 *
 * Números do SM-X510 (campanha física): retrato `823×1220`, paisagem `1317×726`.
 * A região é o que sobra da janela depois da barra lateral E da fronteira de
 * navegação (`F6.2R`) — MEDIDA, nunca subtraída. Em retrato sobram `619`; em
 * paisagem, `1053`. Os números MUDARAM em `F6.2R` e mudar aqui é o esperado: o
 * arnês descreve o que o `onLayout` passa a devolver depois que o recuo entra
 * ANTES do provedor. Se a fronteira fosse aplicada DEPOIS da medição, estes
 * seriam `643` e `1077` — e cada tela teria de subtrair 24 sozinha. */
const QUADROS = [
  {
    nome: 'q0 · retrato estável — a medida desta janela vale',
    janela: { width: 823, height: 1220 },
    medida: { width: 619, height: 1220, janelaWidth: 823, janelaHeight: 1220 },
    esperado: { width: 619, measured: true, source: 'measured' },
  },
  {
    nome: 'q1 · girou: janela nova, medida velha — vale a JANELA',
    janela: { width: 1317, height: 726 },
    medida: { width: 619, height: 1220, janelaWidth: 823, janelaHeight: 1220 },
    esperado: { width: 1317, measured: false, source: 'window' },
  },
  {
    nome: 'q2 · paisagem estável — a medida desta janela vale de novo',
    janela: { width: 1317, height: 726 },
    medida: { width: 1053, height: 726, janelaWidth: 1317, janelaHeight: 726 },
    esperado: { width: 1053, measured: true, source: 'measured' },
  },
  {
    nome: 'q3 · primeiro quadro, ninguém mediu ainda — vale a JANELA',
    janela: { width: 823, height: 1220 },
    medida: null,
    esperado: { width: 823, measured: false, source: 'window' },
  },
  {
    /* A altura vem CHEIA de propósito: uma medida degenerada nas duas dimensões
     * seria recusada por qualquer uma das duas cláusulas, e aí a cláusula da
     * LARGURA poderia sumir sem que ninguém notasse. Aqui só a largura é zero. */
    nome: 'q4 · região com largura ainda 0 (primeiro layout) — vale a JANELA',
    janela: { width: 823, height: 1220 },
    medida: { width: 0, height: 1220, janelaWidth: 823, janelaHeight: 1220 },
    esperado: { width: 823, measured: false, source: 'window' },
  },
  {
    nome: 'q5 · fora de provedor (tela de Stack) — a janela É a região',
    janela: { width: 412, height: 915 },
    medida: null,
    esperado: { width: 412, measured: false, source: 'window' },
  },
];

function executarCarimbo(mutate) {
  let mod;
  try {
    mod = montarViewport(mutate);
  } catch (e) {
    return { ausente: true, erro: e.message, linhas: [] };
  }
  const linhas = QUADROS.map((q) => {
    const obtido = mod.resolveContentViewport({ measure: q.medida, window: q.janela });
    const ok = obtido.width === q.esperado.width
      && obtido.measured === q.esperado.measured
      && obtido.source === q.esperado.source;
    return { nome: q.nome, esperado: q.esperado, obtido: { width: obtido.width, measured: obtido.measured, source: obtido.source }, ok };
  });
  return { ausente: false, linhas };
}

/* ── Bateria B · A FAIXA É DA REGIÃO, NUNCA DA JANELA ─────────────────────────
 * Existe uma zona em que os dois referenciais DISCORDAM de faixa, não só de
 * magnitude: janela em faixa média com região que já é compacta. É lá que compor
 * pela janela deixa de ser "um pouco largo demais" e passa a ser a política
 * errada inteira. A tabela precisa conter ao menos um caso desses — sem ele o
 * portão não descreveria defeito nenhum. */
const REFERENCIAIS = [
  { nome: 'tablet 768dp em retrato com trilho — janela média, região COMPACTA', janela: 768, regiao: 564 },
  { nome: 'SM-X510 em retrato — mesma faixa, magnitude diferente', janela: 823, regiao: 619 },
  { nome: 'tablet grande — janela expandida, região MÉDIA', janela: 1080, regiao: 816 },
  { nome: 'telefone — sem barra lateral, os dois referenciais coincidem', janela: 412, regiao: 412 },
];

function executarReferenciais(mutate) {
  let mod;
  try {
    mod = montarViewport(mutate);
  } catch (e) {
    return { ausente: true, erro: e.message, linhas: [], divergentes: 0 };
  }
  const linhas = REFERENCIAIS.map((c) => {
    const alto = 2000;
    const resolvido = mod.resolveContentViewport({
      measure: { width: c.regiao, height: alto, janelaWidth: c.janela, janelaHeight: alto },
      window: { width: c.janela, height: alto },
    });
    const faixaJanela = mod.bandForWidth(c.janela);
    const faixaRegiao = mod.bandForWidth(c.regiao);
    return {
      nome: c.nome,
      faixaJanela,
      faixaRegiao,
      publicada: resolvido.band,
      divergem: faixaJanela !== faixaRegiao,
      // A faixa publicada é sempre a da REGIÃO — nunca a da janela.
      ok: resolvido.band === faixaRegiao && resolvido.width === c.regiao,
    };
  });
  return { ausente: false, linhas, divergentes: linhas.filter((l) => l.divergem).length };
}

/* ── Bateria C · A CONSEQUÊNCIA DE PRODUTO (Estrelinhas no SM-X510) ──────
 * As duas baterias acima provam a POLÍTICA. Esta prova por que ela importa — e
 * é a que dá dente ao portão: sem ela, `G-CVP-1` seria um teste de forma.
 *
 * Estrelinhas compõe um Hub e era, até `F6.2R`, a única família que NÃO passava
 * `availableWidth` próprio: aceitava a largura que o arquétipo tivesse. Era,
 * portanto, a tela em que a diferença entre janela e região aparecia crua — e a
 * última devedora do contrato `G-RSP-8`, dívida que o artefato 88 §11 havia
 * adiado para a fase dona e que `F6.2R` pagou.
 *
 * Piso do cartão, intervalo e recuo lateral são os que A PRÓPRIA TELA declara
 * (`HUB_MIN_CARD`, `HUB_GAP`, `content.paddingHorizontal`) — este arnês não
 * inventa nenhum deles, e a bateria D confere que continuam sendo esses.
 *
 * A grade real é sempre a da REGIÃO menos o recuo: o desenho acontece lá, tenha
 * a composição perguntado a quem tiver perguntado. É justamente essa assimetria
 * — compor por uma largura e desenhar em outra — que produz um cartão ABAIXO do
 * piso que a tela exigiu, sem que nenhum número pareça errado isoladamente. Com
 * `G-RSP-8` aplicado, a tela passou a compor pela GRADE que mede, e a assimetria
 * fechou: é essa a largura que a coluna `pelaFundacao` usa. O braço `peloDefeito`
 * continua compondo pela JANELA, porque um portão que perde o defeito deixa de
 * provar a cura. */
const { carregarArquetipo } = require('./surfaceArchetypeHarness');

const ESTRELINHAS = Object.freeze({
  tela: 'src/screens/TrophiesScreen.js',
  janela: 823,        // SM-X510 em RETRATO, medido em campanha física
  regiao: 619,        // o que sobra depois do trilho E da fronteira (`F6.2R`) — MEDIDO
  recuoLateral: 32,   // `content: { paddingHorizontal: 16 }` × 2 lados
  itens: 12,
});

function celulaDe(grade, colunas, gap) {
  return (grade - gap * (colunas - 1)) / colunas;
}

function executarProduto(mutate) {
  let vp;
  try {
    vp = montarViewport(mutate);
  } catch (e) {
    return { ausente: true, erro: e.message };
  }
  const hub = carregarArquetipo('hub');
  if (hub.ausente) return { ausente: true, erro: `arquétipo Hub indisponível: ${hub.erro}` };

  // Piso e intervalo lidos do FONTE da tela: se ela mudar de opinião, o portão
  // acompanha em vez de provar um número fossilizado aqui dentro.
  const fonteTela = require('fs').readFileSync(
    require('path').join(__dirname, '..', '..', ESTRELINHAS.tela), 'utf8',
  );
  const lerConst = (nome) => {
    const m = new RegExp(`${nome}\\s*=\\s*(\\d+)`).exec(fonteTela);
    return m ? Number(m[1]) : NaN;
  };
  const piso = lerConst('HUB_MIN_CARD');
  const gap = lerConst('HUB_GAP');
  if (!Number.isFinite(piso) || !Number.isFinite(gap)) {
    return { ausente: true, erro: 'a tela deixou de declarar `HUB_MIN_CARD`/`HUB_GAP` — a âncora do portão sumiu' };
  }

  const alto = 2000;
  const resolvido = vp.resolveContentViewport({
    measure: { width: ESTRELINHAS.regiao, height: alto, janelaWidth: ESTRELINHAS.janela, janelaHeight: alto },
    window: { width: ESTRELINHAS.janela, height: alto },
  });

  const grade = ESTRELINHAS.regiao - ESTRELINHAS.recuoLateral;
  const compor = (largura) => {
    const colunas = hub.mod.hubComposition({
      band: vp.bandForWidth(largura),
      availableWidth: largura,
      itemCount: ESTRELINHAS.itens,
      minItemWidth: piso,
      gap,
    }).columns;
    return { largura, colunas, celula: celulaDe(grade, colunas, gap) };
  };

  const peloDefeito = compor(ESTRELINHAS.janela);   // como era: a janela inteira
  // Como fica: a GRADE que a tela mede (`G-RSP-8`), dentro da região que a
  // fundação publica. Compor pela região e desenhar na grade era a assimetria.
  const pelaFundacao = compor(grade);

  return {
    ausente: false,
    piso,
    gap,
    grade,
    resolvido: resolvido.width,
    peloDefeito,
    pelaFundacao,
    // O defeito precisa continuar REPRODUZÍVEL: sem isso o portão não descreve nada.
    reproduzDefeito: peloDefeito.celula < piso,
    // E a cura precisa devolver a criança a um cartão legível.
    cura: pelaFundacao.celula >= piso && resolvido.width === ESTRELINHAS.regiao,
  };
}

module.exports = {
  montarViewport, executarCarimbo, executarReferenciais, executarProduto,
  QUADROS, REFERENCIAIS, ESTRELINHAS,
};
