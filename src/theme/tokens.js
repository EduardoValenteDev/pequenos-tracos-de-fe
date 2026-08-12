/**
 * tokens.js — Tokens oficiais da Direção de Arte v1.1 ("O Livro Vivo").
 *
 * FONTE ÚNICA de cor/tipografia/forma/movimento/responsividade a partir do A0.
 * Valores EXATOS de `docs/DIRECAO_DE_ARTE_REESTRUTURACAO_VISUAL_v1.1.md` §2.
 *
 * A0.1 (este bloco): SÓ define os tokens. NÃO migra telas, NÃO carrega fontes
 * (Fraunces é registrada no A0.2), NÃO cria componentes-base (A0.4). Os temas
 * antigos (`colors.js`, `productTheme.js`, `theme.js`) seguem VIVOS em paralelo —
 * a migração para tokens acontece por tela nos blocos seguintes / A14.
 */

// ── §2.1 CORES ────────────────────────────────────────────────────────────────
export const color = {
  // PAPEL (fundos) — nunca branco puro
  paper50: '#FDF8EE',   // fundo universal de tela
  paper100: '#F8F0DC',  // cards/páginas
  paper200: '#EFE3C8',  // bordas suaves, divisores, desabilitado
  paper300: '#E4D5B4',  // dots inativos, trilhos de progresso

  // TINTA (textos) — nunca preto puro/cinza frio
  ink900: '#3E2E1B',    // títulos e corpo
  ink600: '#7A6A50',    // secundário
  ink400: '#A89573',    // muted, placeholders, links terciários

  // TERRACOTA (ação — ÚNICA cor de botão primário)
  terra500: '#C9502A',  // botão primário
  terra600: '#A73F1F',  // pressed
  terra100: '#F7DED2',  // tint de apoio (aviso gentil)
  onTerra: '#FFF6E8',   // texto sobre terracota

  // DOURADO (recompensa — NUNCA botão)
  gold700: '#8F6A1E',   // texto sobre dourados claros
  gold500: '#C99A3B',   // molduras, selos, linha do mapa, ornamentos
  gold300: '#E8C05A',   // brilho de estrela, preenchimentos
  gold100: '#F6E7C8',   // fundo de medalha/conquista

  // CÉU-NOITE (mundo das histórias + rituais)
  night800: '#1C2B52',  // capas, fundos de ritual, leitor do Livrinho
  night600: '#2E4370',  // variação
  star100: '#F2DCA0',   // texto/estrelas sobre night
};

// SEMÂNTICOS mínimos — sem "verde de acerto", sem vermelho de erro.
export const semantic = {
  acerto: color.gold300,                              // quiz correto: a estrela acende
  atencao: { bg: color.terra100, text: color.ink600 }, // avisos gentis
};

// SELOS de acesso/estado (A0.6 · cor premium revista no A0.7) — coesos e DISTINTOS.
//   free → Grátis (verde) · premium → Plano Família (AZUL-NOITE) · done → Concluída (dourado)
// NOTA DE GOVERNANÇA (A0.7): o premium foi MIGRADO de roxo/lilás → AZUL-NOITE, derivado
// da família `night` da paleta oficial v1.1 (texto = night800), RESOLVENDO a tensão com a
// decisão congelada D2 ("roxo aposentado da UI") — não há mais roxo na UI, nem marrom no
// premium. Só o verde de "Grátis" segue como exceção pontual dos selos (fora da
// paleta-núcleo, aprovada pelo fundador), sempre com fundo claro + texto escuro.
export const seal = {
  free:    { bg: '#E8F3E4', border: '#A9CFA0', text: '#2E6B33' },        // verde (Grátis)
  premium: { bg: '#E5EAF4', border: '#A9BAD9', text: color.night800 },   // azul-noite (Plano Família)
  done:    { bg: color.gold100, border: color.gold500, text: color.gold700 }, // dourado (Concluída)
};

// ── §2.2 TIPOGRAFIA ───────────────────────────────────────────────────────────
// Famílias PREVISTAS (Fraunces display / Nunito texto). A0.1 só NOMEIA; o
// carregamento efetivo (registro no App.js) é o A0.2 — não feito aqui.
export const font = {
  display: 'Fraunces',      // títulos/heróis (peso 600)
  body: 'Nunito',           // corpo/UI (400)
  bodyBold: 'Nunito-Bold',  // labels de UI (700)
};

// Escala (base 17). Os 11–12px atuais morrem; caption 13 é o mínimo absoluto.
export const fontSize = {
  caption: 13,      // mínimo absoluto
  bodySmall: 15,
  body: 17,         // base
  titleCard: 22,
  titleScreen: 28,
  display: 34,      // celebração/heróis
  displayXL: 40,    // nome no certificado
};

export const lineHeight = {
  title: 1.35,
  body: 1.55,
};

export const fontWeight = {
  body: '400',
  uiLabel: '700',   // UI labels no texto-font (Nunito 700)
  display: '600',   // Fraunces SemiBold
};

// ── §2.3 FORMA · SOMBRA · TEXTURA · MOVIMENTO ─────────────────────────────────
export const radius = { chip: 14, card: 20, hero: 24, pill: 28 };

export const border = {
  card: { width: 1.5, color: color.paper200 },   // cards
  reward: { width: 2, color: color.gold500 },     // molduras de recompensa
};

// SOMBRA ÚNICA — NUNCA mais de uma sombra por elemento.
export const shadow = {
  color: '#3E2E1B',
  opacity: 0.10,
  radius: 10,
  offset: { width: 0, height: 3 },
};

// TEXTURA — apenas REFERÊNCIA (asset paper_grain.png ainda NÃO existe; §6). Sem
// asset novo neste bloco: o token registra a intenção (overlay 3–4%) para quando
// o asset chegar.
export const texture = {
  paperGrain: { asset: 'paper_grain.png', opacity: 0.035, exists: false },
};

export const motion = {
  fast: 180,
  base: 250,
  slow: 400,
  pageTurn: 450,
  pressScale: 0.96,      // "squish" do botão primário no press
  easing: 'spring-soft', // spring suave (damping alto) — referência
};

// ── §2.4 RESPONSIVIDADE ───────────────────────────────────────────────────────
// Consumidos via useWindowDimensions + estes tokens (nunca Dimensions.get em módulo).
//
// [Fase 6 · B1 · P-30] FONTE ÚNICA DE BREAKPOINT. `breakpoints.tablet` é o ÚNICO
// valor de corte telefone↔tablet do app. Nenhum arquivo pode comparar largura com
// um literal (era `width >= 768` em 10 pontos, cada um livre para divergir).
// `productTheme.layout.tabletBreakpoint` passou a DERIVAR daqui — não é mais um
// segundo valor. O gate G-BP-1 no smoke trava esta regra.
export const breakpoints = { phone: 0, tablet: 600, tabletL: 900 };            // dp
export const maxContentWidth = { phone: '100%', tablet: 560, tabletL: 640 };   // conteúdo centralizado
// [Fase 6 · F6-SG-C · TK-C-015 + TK-C-061] `Q4` RESOLVIDA — os dois deixaram de ser
// "declarados e inertes" (`P-82`/`P-148`) e ganharam consumidor NOMEADO, sem mudar de
// nome nem de valor. `grid` é TETO de colunas, nunca ordem: o valor efetivo é
// `min(grid[faixa], cabimento, inventário)` — ver `HubSurface.hubComposition`. E o
// `+10%` vale nas faixas MÉDIA e EXPANDIDA (a forma de dois estados num sistema de três
// faixas é intencional: a expandida ganha composição, não heróis maiores), aplicado
// por um auxiliar ÚNICO que Hub e Editorial consultam. `G-RSP-2` trava as duas coisas.
export const grid = { phone: 1, tablet: 2, tabletL: 3 };                        // colunas por faixa → HubSurface.js
export const displayScaleTablet = 1.10;                                         // display +10% (média/expandida) → displayType.js

// Agregador conveniente (uso opcional: `import tokens from '../theme/tokens'`).
export const tokens = {
  color,
  semantic,
  font,
  fontSize,
  lineHeight,
  fontWeight,
  radius,
  border,
  shadow,
  texture,
  motion,
  breakpoints,
  maxContentWidth,
  grid,
  displayScaleTablet,
};

export default tokens;
