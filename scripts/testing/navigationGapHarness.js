/* ─────────────────────────────────────────────────────────────────────────────
 * Arnês da FRONTEIRA NAVEGAÇÃO → CONTEÚDO — `G-NAV-1` · Fase 6 · `F6.2R`
 *
 * `F6.2` provou a distinção `WINDOW VIEWPORT ≠ CONTENT VIEWPORT` e fez a região
 * chegar MEDIDA às telas. A validação física mostrou que faltava a outra metade
 * do contrato: entre a borda da barra e o primeiro pixel de conteúdo havia ZERO.
 * A tela recebia a região certa e encostava nela.
 *
 * O contrato desta fase é uma cadeia, e é ela que este arnês interroga:
 *
 *     SIDEBAR → NAVIGATION CONTENT GAP → CONTENT VIEWPORT → SCREEN
 *
 * Três perguntas, três baterias:
 *
 *   A · A fronteira existe EXATAMENTE onde existe barra, vale UM número só, e o
 *       telefone continua sem recuo lateral nenhum.
 *   B · O recuo acontece ANTES da medição — a região publicada já nasce
 *       descontada. Nenhum filho precisa lembrar de subtrair `G`.
 *   C · A área jogável cabe DENTRO da região publicada, inclusive quando a região
 *       é menor que a janela. Esta é a bateria que dá dente: é ela que morre se
 *       uma tela voltar a compor pela janela.
 *
 * Nada aqui declara faixa, largura de barra ou recuo (`SD-11` · `G-RSP-7`): a
 * faixa vem do `windowBandHarness` (dono real), a barra vem de `TabletSidebar`
 * (que DECLARA quanto ocupa) e o recuo vem do token único de `tokens.js`. Este
 * arquivo também não subtrai barra de janela para descobrir região: ele SIMULA o
 * que o flex deixa, do mesmo modo que a matriz de `F6.2` — o runtime continua
 * medindo.
 * ───────────────────────────────────────────────────────────────────────────── */

'use strict';

const fs = require('fs');
const path = require('path');
const { loadModule } = require('./packInstallHarness');
const { montarFaixa } = require('./windowBandHarness');
const { montarViewport } = require('./contentViewportHarness');

const ROOT = path.join(__dirname, '..', '..');
const lerFonte = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const HOST = 'src/components/layout/NavigationContentHost.js';
const SIDEBAR = 'src/components/TabletSidebar.js';
const TOKENS = 'src/theme/tokens.js';
const NAV = 'src/navigation/AppNavigator.js';
const JOGO = 'src/screens/CadeAOvelhinhaScreen.js';
const NUCLEO_JOGO = 'src/services/ovelhaGameService.js';

/* As larguras da varredura são MEDIDAS de aparelho e degraus de faixa já
 * documentados na campanha física — nenhuma delas é um corte inventado aqui. */
const LARGURAS = Object.freeze([360, 390, 412, 599, 600, 768, 823, 899, 900, 1024, 1317]);

/* ── Montagem: barra REAL, token REAL, política REAL ──────────────────────── */

function montarBarra() {
  const { BANDS, bandForWidth } = montarFaixa();
  const tokens = loadModule(TOKENS, {}, ['navSidebarWidth', 'navSidebarRole', 'navContentGap']);
  const barra = loadModule(SIDEBAR, {
    navSidebarWidth: tokens.navSidebarWidth,
    navSidebarRole: tokens.navSidebarRole,
    BANDS,
  }, ['sidebarWidth', 'sidebarRole']);
  return { BANDS, bandForWidth, tokens, barra };
}

/**
 * Carrega a POLÍTICA pura do recuo (`navigationContentGap`), do host real.
 *
 * O componente e o `StyleSheet` ficam depois da expressão de exportação por
 * omissão e o `loadModule` os corta: o que sobra — e o que este arnês mede — é a
 * política, sem React nenhum no caminho.
 */
function montarRecuo(mutate, mutateToken) {
  const { BANDS, bandForWidth, tokens, barra } = montarBarra();
  const navContentGap = mutateToken
    ? loadModule(TOKENS, {}, ['navContentGap'], mutateToken).navContentGap
    : tokens.navContentGap;
  const mod = loadModule(HOST, {
    navContentGap,
    sidebarRole: barra.sidebarRole,
  }, ['navigationContentGap'], mutate);
  return { ...mod, BANDS, bandForWidth, barra, navContentGap };
}

/* ── Bateria A · A FRONTEIRA ──────────────────────────────────────────────────
 * A pergunta não é "existe um padding?", e sim: o recuo aparece EXATAMENTE onde
 * a barra aparece, e some exatamente onde ela some?
 *
 * Três cláusulas separadas, de propósito:
 *   [A1] recuo > 0  ⟺  existe barra              — nem antes, nem depois
 *   [A2] existe UM ÚNICO valor de recuo não-nulo — a lista de exceções por faixa
 *        (e, pela mesma porta, por aparelho) é justamente o que a ordem proíbe
 *   [A3] faixa compacta ⇒ região === janela, idêntica ao que havia antes */
function executarFronteira(mutate, mutateToken) {
  let pol;
  try {
    pol = montarRecuo(mutate, mutateToken);
  } catch (e) {
    return { ausente: true, erro: e.message, linhas: [], falhas: ['política do recuo indisponível'] };
  }

  const linhas = LARGURAS.map((janela) => {
    const faixa = pol.bandForWidth(janela);
    const larguraBarra = pol.barra.sidebarWidth(faixa);
    const temBarra = larguraBarra !== null && larguraBarra !== undefined;
    const recuo = pol.navigationContentGap(faixa);
    const fimBarra = temBarra ? larguraBarra : 0;
    const inicioConteudo = fimBarra + recuo;
    const regiaoAntes = janela - fimBarra;              // `F6.2`: só a barra
    const regiao = janela - inicioConteudo;             // `F6.2R`: barra + fronteira
    return {
      janela, faixa, larguraBarra: temBarra ? larguraBarra : null, temBarra,
      recuo, fimBarra, inicioConteudo, regiaoAntes, regiao,
      faixaRegiao: pol.bandForWidth(regiao),
      a1: (recuo > 0) === temBarra,
      a2: regiao === regiaoAntes - recuo,
      a3: temBarra ? true : (recuo === 0 && regiao === janela),
    };
  });

  const recuosNaoNulos = Array.from(new Set(linhas.filter((l) => l.recuo > 0).map((l) => l.recuo)));
  const falhas = [];
  linhas.forEach((l) => {
    if (!l.a1) falhas.push(`[A1] janela ${l.janela}dp: barra=${l.temBarra ? `${l.larguraBarra}dp` : 'nenhuma'} mas recuo=${l.recuo}dp — a fronteira não acompanha a barra`);
    if (!l.a2) falhas.push(`[A2] janela ${l.janela}dp: regiao ${l.regiao} != ${l.regiaoAntes} - ${l.recuo}`);
    if (!l.a3) falhas.push(`[A3] janela ${l.janela}dp e compacta e mesmo assim recebeu recuo lateral de ${l.recuo}dp — telefone regrediu`);
  });
  if (recuosNaoNulos.length === 0) {
    falhas.push('[A2] nenhuma largura da varredura recebeu recuo — a fronteira sumiu inteira');
  } else if (recuosNaoNulos.length > 1) {
    falhas.push(`[A2] a fronteira tem ${recuosNaoNulos.length} valores distintos (${recuosNaoNulos.join(', ')}) — vira tabela por faixa, e pela mesma porta vira tabela por aparelho`);
  }

  return {
    ausente: false, linhas, falhas,
    recuo: recuosNaoNulos.length === 1 ? recuosNaoNulos[0] : null,
    comBarra: linhas.filter((l) => l.temBarra).length,
    semBarra: linhas.filter((l) => !l.temBarra).length,
  };
}

/* ── Bateria B · A ORDEM (o viewport NASCE descontado) ────────────────────────
 * O defeito que esta bateria recusa é sutil e passaria em qualquer teste de
 * forma: aplicar o recuo DENTRO do provedor. A região continuaria a ser medida
 * antes da fronteira, publicaria 643 onde o filho tem 619, e cada tela teria de
 * lembrar de subtrair `G` — que é exatamente a arquitetura que `F6.2` derrubou.
 *
 * [B1] é fato de FONTE: o host envolve o provedor, não o contrário.
 * [B2] é a CONSEQUÊNCIA, medida pela política REAL do carimbo: a largura que a
 *      tela recebe já é a pós-fronteira, e a FAIXA publicada é a dela. */
function executarOrdem(mutate, mutateToken, fonteNavOverride) {
  const fronteira = executarFronteira(mutate, mutateToken);
  if (fronteira.ausente) {
    return { ausente: true, erro: fronteira.erro, falhas: fronteira.falhas, linhas: [] };
  }

  const fonteNav = fonteNavOverride !== undefined ? fonteNavOverride : lerFonte(NAV);
  const colapsada = fonteNav.replace(/\s+/g, ' ');
  const foraParaDentro = /<NavigationContentHost>\s*<ContentViewportProvider>\{children\}<\/ContentViewportProvider>\s*<\/NavigationContentHost>/.test(colapsada);
  const invertida = /<ContentViewportProvider>\s*<NavigationContentHost>/.test(colapsada);

  const falhas = [...fronteira.falhas];
  if (!foraParaDentro) {
    falhas.push('[B1] `screenLayout` nao envolve o `ContentViewportProvider` com o `NavigationContentHost` — a ordem GAP -> VIEWPORT nao esta no fonte');
  }
  if (invertida) {
    falhas.push('[B1] o recuo passou para DENTRO do provedor: a regiao seria medida ANTES da fronteira e cada tela voltaria a ter de subtrair o recuo sozinha');
  }

  let vp;
  try {
    vp = montarViewport();
  } catch (e) {
    return { ausente: true, erro: `politica do carimbo indisponivel: ${e.message}`, falhas, linhas: [] };
  }

  const alto = 2000;
  const linhas = fronteira.linhas.map((l) => {
    const publicado = vp.resolveContentViewport({
      measure: { width: l.regiao, height: alto, janelaWidth: l.janela, janelaHeight: alto },
      window: { width: l.janela, height: alto },
    });
    const faixaEsperada = vp.bandForWidth(l.regiao);
    const ok = publicado.width === l.regiao
      && publicado.band === faixaEsperada
      && publicado.measured === true
      && (l.temBarra ? publicado.width < l.regiaoAntes : publicado.width === l.janela);
    return {
      janela: l.janela, temBarra: l.temBarra, recuo: l.recuo,
      regiaoAntes: l.regiaoAntes, regiaoDepois: l.regiao,
      publicado: publicado.width, faixaPublicada: publicado.band, faixaEsperada,
      // O que o filho teria de subtrair sozinho se a ordem fosse a errada:
      subtracaoQueSobrariaAoFilho: l.regiaoAntes - l.regiao,
      ok,
    };
  });

  linhas.forEach((l) => {
    if (!l.ok) {
      falhas.push(`[B2] janela ${l.janela}dp: a regiao publicada foi ${l.publicado}dp (faixa ${l.faixaPublicada}), esperado ${l.regiaoDepois}dp (faixa ${l.faixaEsperada}) — o viewport nao nasceu descontado da fronteira`);
    }
  });

  return { ausente: false, falhas, linhas, foraParaDentro, invertida, fronteira };
}

/* ── Bateria C · A ÁREA JOGÁVEL CABE NA REGIÃO ────────────────────────────────
 * `playableRect ⊆ contentViewport`, com a geometria REAL do jogo (`computeViewport`,
 * `contentRect`, `artToPx`, `pxToArt` e `hitboxPxRect` de `ovelhaGameService` —
 * território provado e proibido de tocar) e com as constantes que a PRÓPRIA TELA
 * declara, lidas do fonte e nunca copiadas.
 *
 * A tela e hoje uma tela de `Stack`: janela e regiao coincidem. A bateria varre
 * mesmo assim regioes MENORES que a janela, e e isso que a torna util — ela
 * responde "e se esta cena passar a coexistir com a barra?" antes de o aparelho
 * responder. Quando a tela le a JANELA, a cena estoura a regiao; quando le a
 * REGIAO, cabe sempre. Nenhuma coordenada, esconderijo, sprite ou dificuldade e
 * lida, alterada ou consultada aqui: a cena de prova tem as dimensoes de arte
 * padrao e o ponto de prova e sintetico, porque o que se mede e a TRANSFORMACAO,
 * nao o conteudo. */
const CENA_PROVA = Object.freeze({ designWidth: 1122, designHeight: 1402 });
const PONTOS_ARTE = Object.freeze([
  { x: 0, y: 0 }, { x: 561, y: 701 }, { x: 1122, y: 1402 }, { x: 300, y: 1100 },
]);
const SPOT_PROVA = Object.freeze({ pos: { x: 700, y: 900 }, escala: 0.12, pose: 'front' });

/**
 * A geometria REAL do jogo, carregada do fonte.
 *
 * `OVELHA_HITBOX_MIN` entra INJETADO, e o motivo é mecânico, não de política: a
 * segunda linha de `import` do serviço termina em comentário, e o recorte de
 * imports do `loadModule` (`^import[\s\S]*?;$`) segue procurando o `;` de fim de
 * linha até encontrá-lo — na declaração do piso, três linhas abaixo. O piso é
 * lido do PRÓPRIO fonte logo antes de ser injetado: continua havendo uma fonte
 * única, e mudá-la lá muda aqui. Tocar no serviço para acomodar o arnês está
 * fora de questão (`computeViewport`/`contentRect` são território provado).
 */
function carregarNucleoJogo() {
  const inerte = () => undefined;
  const fonte = lerFonte(NUCLEO_JOGO);
  const m = /OVELHA_HITBOX_MIN\s*=\s*(\d+)/.exec(fonte);
  if (!m) throw new Error('o serviço deixou de declarar `OVELHA_HITBOX_MIN` — a âncora do piso da hitbox sumiu');
  return loadModule(NUCLEO_JOGO, {
    getScene: inerte, OVELHA_SCENES: [], OVELHA_POSES: {}, OVELHA_ORIENTACOES: {},
    OVELHA_MODOS: {}, cenasHabilitadas: () => [], FASES: {}, EFEITOS: {},
    OVELHA_HITBOX_MIN: Number(m[1]),
  }, ['computeViewport', 'contentRect', 'artToPx', 'pxToArt', 'hitboxPxRect']);
}

/** As constantes de enquadramento da tela, lidas do fonte dela. */
function lerEnquadramentoDaTela(fonteTela) {
  const m = /largura:\s*\([^)]*\)\s*\|\|\s*Math\.min\(width\s*-\s*(\d+),\s*(\d+)\)/.exec(fonteTela);
  const p = /cenaWrap:\s*\{[^}]*paddingHorizontal:\s*(\d+)/.exec(fonteTela);
  return {
    folga: m ? Number(m[1]) : NaN,          // o `width - 20` do primeiro quadro
    maxLargura: m ? Number(m[2]) : NaN,     // o teto de 560dp da cena
    recuoCena: p ? Number(p[1]) : NaN,      // `paddingHorizontal` do `cenaWrap`
  };
}

/* Pares (janela, regiao) da varredura: os dois primeiros tem barra e por isso
 * regiao MENOR que a janela; o terceiro e o telefone, em que coincidem. */
const REGIOES_JOGO = Object.freeze([
  { nome: 'tablet estreito com barra — regiao bem menor que a janela', janela: 700, regiao: 496 },
  { nome: 'SM-X510 em retrato com barra — regiao pos-fronteira', janela: 823, regiao: 619 },
  { nome: 'telefone — janela e regiao coincidem', janela: 412, regiao: 412 },
]);

function executarJogo(mutateTela) {
  let nucleo;
  try {
    nucleo = carregarNucleoJogo();
  } catch (e) {
    return { ausente: true, erro: `nucleo do jogo indisponivel: ${e.message}`, linhas: [], falhas: [] };
  }

  let fonteTela = lerFonte(JOGO);
  if (mutateTela) {
    const mutada = mutateTela(fonteTela);
    if (mutada === fonteTela) {
      return { ausente: true, erro: 'a mutacao da tela nao alterou o fonte (ancora nao encontrada)', linhas: [], falhas: [] };
    }
    fonteTela = mutada;
  }

  const enq = lerEnquadramentoDaTela(fonteTela);
  if (!Number.isFinite(enq.folga) || !Number.isFinite(enq.maxLargura) || !Number.isFinite(enq.recuoCena)) {
    return {
      ausente: true,
      erro: 'a tela deixou de declarar o enquadramento (`Math.min(width - N, M)` / `cenaWrap.paddingHorizontal`) — a ancora do portao sumiu',
      linhas: [], falhas: [],
    };
  }

  /* De QUAL grandeza a tela tira a largura do primeiro quadro. E esta linha —
   * e so ela — que decide se a cena cabe na regiao ou vaza por cima da barra. */
  const leRegiao = /const\s*\{\s*width\s*\}\s*=\s*useContentViewport\(\)/.test(fonteTela);
  const leJanela = /const\s*\{\s*width\s*\}\s*=\s*useWindowDimensions\(\)/.test(fonteTela);

  const falhas = [];
  if (!leRegiao) {
    falhas.push('[C0] a tela do jogo nao tira `width` de `useContentViewport()` — a cena e dimensionada por uma grandeza que ninguem lhe entregou');
  }

  const linhas = REGIOES_JOGO.map((c) => {
    const grandeza = leRegiao ? c.regiao : c.janela;          // o que a tela leria
    const larguraCena = Math.min(grandeza - enq.folga, enq.maxLargura);
    const vp = nucleo.computeViewport({
      largura: larguraCena, altura: 9999,
      artW: CENA_PROVA.designWidth, artH: CENA_PROVA.designHeight,
    });

    /* A cena e centrada dentro do `cenaWrap`, que ja vive na REGIAO e tem o
     * recuo proprio dele. O retangulo jogavel, em coordenadas da regiao: */
    const util = c.regiao - enq.recuoCena * 2;
    const x0 = enq.recuoCena + (util - vp.w) / 2;
    const x1 = x0 + vp.w;
    const cabe = x0 >= 0 && x1 <= c.regiao + 0.5;

    // Toque e desenho no MESMO referencial: a hitbox nasce onde a arte cai.
    const alvo = nucleo.artToPx(SPOT_PROVA.pos, CENA_PROVA, vp);
    const hb = nucleo.hitboxPxRect(SPOT_PROVA, CENA_PROVA, vp);
    const hitboxCentrada = Math.abs(hb.cx - alvo.px) < 0.5 && Math.abs(hb.cy - alvo.py) < 0.5;
    const idaEVolta = PONTOS_ARTE.every((p) => {
      const px = nucleo.artToPx(p, CENA_PROVA, vp);
      const volta = nucleo.pxToArt(px.px, px.py, CENA_PROVA, vp);
      return Math.abs(volta.x - p.x) < 0.5 && Math.abs(volta.y - p.y) < 0.5;
    });

    return {
      nome: c.nome, janela: c.janela, regiao: c.regiao, grandezaLida: grandeza,
      larguraCena, cenaW: vp.w, cenaH: vp.h,
      x0: Math.round(x0 * 10) / 10, x1: Math.round(x1 * 10) / 10,
      excedente: Math.round(Math.max(0, x1 - c.regiao) * 10) / 10,
      cabe, hitboxCentrada, idaEVolta,
      ok: cabe && hitboxCentrada && idaEVolta,
    };
  });

  linhas.forEach((l) => {
    if (!l.cabe) falhas.push(`[C1] regiao ${l.regiao}dp (janela ${l.janela}dp): a cena ocupa [${l.x0}, ${l.x1}] e vaza ${l.excedente}dp para fora da regiao — a area jogavel invadiu a navegacao`);
    if (!l.hitboxCentrada) falhas.push(`[C2] regiao ${l.regiao}dp: a hitbox deixou de nascer centrada no ponto de arte — toque e desenho em referenciais diferentes`);
    if (!l.idaEVolta) falhas.push(`[C3] regiao ${l.regiao}dp: a conversao arte -> px -> arte deixou de fechar`);
  });

  return { ausente: false, linhas, falhas, enquadramento: enq, leRegiao, leJanela };
}

/* ── Bateria D · A RESIDUAL DE ESTRELINHAS, VARRIDA ───────────────────────────
 * `F6.2` deixou um resíduo declarado de forma contraditória: "falha em janela
 * entre 900 e 1140" e "1024 corrigida" não podem ser verdade ao mesmo tempo.
 * Esta bateria substitui o intervalo aproximado por uma VARREDURA dp a dp, com a
 * composição REAL do Hub e os números que a própria tela declara.
 *
 * A assimetria que produz o resíduo é a mesma de `G-RSP-8`: a tela COMPUNHA pela
 * REGIÃO e DESENHAVA na GRADE (região menos o recuo lateral dela). Onde a região
 * dá para mais uma coluna e a grade não, sai um cartão abaixo do piso que a
 * própria tela exigiu — e nenhum número parece errado isoladamente.
 *
 * `usaGrade` é lido do FONTE: a tela precisa medir (`onLayout`) e entregar
 * (`availableWidth`). Removida qualquer das duas pontas, a varredura volta a
 * reprovar — que é como o mutante da lógica antiga morre.
 *
 * A faixa vem da REGIÃO mesmo quando a largura de composição é a grade: é o que
 * `useHubComposition` faz (a faixa é do viewport, a largura é a entregue), e
 * modelar diferente aqui provaria uma tela que não existe. */
const TROFEUS = 'src/screens/TrophiesScreen.js';
const VARREDURA = Object.freeze({ de: 360, ate: 1400 });
const ITENS_ESTRELINHAS = 12;

function lerConstante(fonte, nome) {
  const m = new RegExp(nome + '\\s*=\\s*(\\d+)').exec(fonte);
  return m ? Number(m[1]) : NaN;
}

function executarEstrelinhas(mutateTela, mutateToken) {
  const { carregarArquetipo } = require('./surfaceArchetypeHarness');
  let pol;
  try {
    // `mutateToken` existe para o RELATORIO: e assim que se pergunta "e como
    // estava ANTES da fronteira?" sem duplicar a aritmetica da varredura.
    pol = montarRecuo(undefined, mutateToken);
  } catch (e) {
    return { ausente: true, erro: e.message, falhas: [], intervalos: [] };
  }
  const hub = carregarArquetipo('hub');
  if (hub.ausente) return { ausente: true, erro: `arquetipo Hub indisponivel: ${hub.erro}`, falhas: [], intervalos: [] };

  let fonte = lerFonte(TROFEUS);
  if (mutateTela) {
    const mutada = mutateTela(fonte);
    if (mutada === fonte) {
      return { ausente: true, erro: 'a mutacao de Estrelinhas nao alterou o fonte (ancora nao encontrada)', falhas: [], intervalos: [] };
    }
    fonte = mutada;
  }

  const piso = lerConstante(fonte, 'HUB_MIN_CARD');
  const gap = lerConstante(fonte, 'HUB_GAP');
  const recuoM = /content:\s*\{[^}]*paddingHorizontal:\s*(\d+)/.exec(fonte);
  if (!Number.isFinite(piso) || !Number.isFinite(gap) || !recuoM) {
    return { ausente: true, erro: 'Estrelinhas deixou de declarar `HUB_MIN_CARD`/`HUB_GAP`/`content.paddingHorizontal`', falhas: [], intervalos: [] };
  }
  const recuoLateral = Number(recuoM[1]) * 2;

  // A tela cumpre `G-RSP-8` quando MEDE e ENTREGA. Falta qualquer das pontas e a
  // composição volta a ser a da região — a lógica antiga.
  const usaGrade = /\bonLayout\s*=\s*\{/.test(fonte) && /\bavailableWidth\s*:/.test(fonte);

  const linhas = [];
  for (let janela = VARREDURA.de; janela <= VARREDURA.ate; janela += 1) {
    const faixaJanela = pol.bandForWidth(janela);
    const barra = pol.barra.sidebarWidth(faixaJanela) || 0;
    const recuo = pol.navigationContentGap(faixaJanela);
    const regiao = janela - barra - recuo;
    const grade = regiao - recuoLateral;
    const larguraComposicao = usaGrade ? grade : regiao;
    const colunas = hub.mod.hubComposition({
      band: pol.bandForWidth(regiao),
      availableWidth: larguraComposicao,
      itemCount: ITENS_ESTRELINHAS,
      minItemWidth: piso,
      gap,
    }).columns;
    const celula = (grade - gap * (colunas - 1)) / colunas;
    linhas.push({ janela, regiao, grade, colunas, celula, falha: celula < piso });
  }

  // Os intervalos CONTÍGUOS de falha, fechados à esquerda e abertos à direita.
  const intervalos = [];
  let inicio = null;
  linhas.forEach((l, i) => {
    if (l.falha && inicio === null) inicio = l.janela;
    const fim = !l.falha || i === linhas.length - 1;
    if (inicio !== null && fim) {
      intervalos.push([inicio, l.falha ? l.janela + 1 : l.janela]);
      inicio = null;
    }
  });

  const falhas = [];
  if (!usaGrade) {
    falhas.push('[D0] Estrelinhas nao mede a propria grade nem entrega a largura ao arquetipo — voltou a compor pela regiao e a desenhar na grade');
  }
  intervalos.forEach(([a, b]) => {
    falhas.push(`[D1] janelas em [${a}, ${b}) produzem cartao abaixo do piso ${piso}dp em Estrelinhas — a residual de F6.2 continua aberta nessa faixa`);
  });

  return {
    ausente: false, falhas, intervalos, linhas, piso, gap, recuoLateral, usaGrade,
    varredura: VARREDURA, itens: ITENS_ESTRELINHAS,
  };
}

module.exports = {
  LARGURAS, REGIOES_JOGO, CENA_PROVA, SPOT_PROVA, PONTOS_ARTE,
  montarBarra, montarRecuo, carregarNucleoJogo, lerEnquadramentoDaTela,
  executarFronteira, executarOrdem, executarJogo, executarEstrelinhas,
  VARREDURA, ITENS_ESTRELINHAS, TROFEUS,
  HOST, SIDEBAR, TOKENS, NAV, JOGO, NUCLEO_JOGO,
};
