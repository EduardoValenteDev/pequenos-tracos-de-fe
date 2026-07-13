/**
 * palavrinhasWords.js — BANCO de "Palavrinhas do Beni" (P4R · ≥120 palavras · SEM imagem).
 *
 * MÓDULO PURO: sem React Native, sem Expo, sem UI, sem áudio, **sem imagem** (nenhum `require`
 * de asset), sem storage. A PALAVRA é o centro visual — não há figura representando a palavra.
 *
 * ── Regras (P4R) ──────────────────────────────────────────────────────────────
 *   - 120 palavras únicas (40 fácil · 40 médio · 40 difícil), sem depender de assets.
 *   - `displayWord` preserva a grafia (acentos/Ç); `normalizedWord` é SÓ lógica (sem acento,
 *     Ç→C, maiúsculas) e NUNCA apaga a exibição. Letras repetidas por `letterInstances[].iid`.
 *   - Acentos/Ç são SUPORTADOS no COMPLETE (LEÃO, CORAÇÃO, AEROMOÇA, PÁSSARO, CAMINHÃO, AVIÃO…).
 *     O traçado dessas letras fica fora do P4R.
 *   - `orthographicFeatures` descreve a palavra (comprimento, acento, Ç, dígrafo, encontro
 *     consonantal, letras repetidas) — usado pela seleção e pelo validador.
 */

/** Categorias válidas. */
export const PALAVRINHAS_CATEGORIAS = Object.freeze([
  'animais', 'natureza', 'objetos', 'alimentos', 'familia', 'biblia', 'app', 'corpo', 'transporte', 'lugares',
]);

/** Confusões de letras a tratar (nunca exploradas por distratores enganosos). */
export const PALAVRINHAS_CONFUSOES = Object.freeze([
  ['B', 'D'], ['P', 'B'], ['M', 'N'], ['F', 'T'], ['C', 'G'], ['O', 'Q'], ['I', 'L'],
]);

/** Faixas de comprimento por tier (difícil aceita curtas quando têm acento/Ç). */
export const PALAVRINHAS_FAIXAS = Object.freeze({
  facil: { min: 3, max: 5 }, medio: { min: 5, max: 8 }, dificil: { min: 7, max: 12 },
});

const POOL_DISTRATOR = 'ABCDEFGHIJLMNOPQRSTUVZ'.split('');
const semAcento = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normalizar = (w) => semAcento(w).replace(/[Çç]/g, 'C').toUpperCase();
const temAcento = (w) => /[ÁÉÍÓÚÂÊÔÀÃÕ]/.test(w);
const temCedilha = (w) => /Ç/.test(w);
const temDigrafo = (w) => /(LH|NH|CH|RR|SS|QU|GU)/.test(w);
const temEncontro = (w) => /(BR|CR|DR|FR|GR|PR|TR|VR|BL|CL|FL|GL|PL)/.test(normalizar(w));
const temRepetida = (letters) => { const c = {}; for (const ch of letters) { c[ch] = (c[ch] || 0) + 1; if (c[ch] >= 2) return true; } return false; };

const gerarDistratores = (letters) => POOL_DISTRATOR.filter((c) => !letters.includes(c)).slice(0, 4);
const gerarConfundiveis = (letters) => {
  const set = new Set();
  for (const [a, b] of PALAVRINHAS_CONFUSOES) if (letters.includes(a) || letters.includes(b)) { set.add(a); set.add(b); }
  return [...set];
};

/** Fábrica de palavra. Deriva letters/letterInstances/normalizedWord/orthographicFeatures. PURO. */
const palavra = ({ id, displayWord, difficulty, category }) => {
  const letters = Array.from(displayWord);
  const letterInstances = letters.map((ch, pos) => ({ iid: `${id}#${pos}`, ch, pos }));
  const of = {
    length: letters.length,
    hasAccent: temAcento(displayWord),
    hasCedilha: temCedilha(displayWord),
    hasDigrafo: temDigrafo(displayWord),
    hasCluster: temEncontro(displayWord),
    hasRepeated: temRepetida(letters),
  };
  of.especial = of.hasAccent || of.hasCedilha;
  of.complexa = of.hasCluster || of.hasDigrafo || of.especial || of.hasRepeated;
  return Object.freeze({
    id,
    word: displayWord,
    displayWord,
    normalizedWord: normalizar(displayWord),
    letters: Object.freeze(letters),
    letterInstances: Object.freeze(letterInstances.map((li) => Object.freeze(li))),
    difficulty,
    category,
    enabled: true,                                   // P4R: todas jogáveis no COMPLETE (inclui acento/Ç)
    orthographicFeatures: Object.freeze(of),
    distractors: Object.freeze(gerarDistratores(letters)),
    confusableLetters: Object.freeze(gerarConfundiveis(letters)),
  });
};

const mk = (difficulty) => (id, displayWord, category) => palavra({ id, displayWord, difficulty, category });

/* ── FÁCIL (40) — 3–5 letras, sem acento/Ç ── */
const F = mk('facil');
const FACIL = [
  F('f_sol', 'SOL', 'natureza'), F('f_lua', 'LUA', 'natureza'), F('f_uva', 'UVA', 'alimentos'), F('f_ovo', 'OVO', 'alimentos'),
  F('f_asa', 'ASA', 'natureza'), F('f_rei', 'REI', 'biblia'), F('f_mel', 'MEL', 'alimentos'), F('f_pai', 'PAI', 'familia'),
  F('f_boi', 'BOI', 'animais'), F('f_pato', 'PATO', 'animais'), F('f_gato', 'GATO', 'animais'), F('f_bola', 'BOLA', 'objetos'),
  F('f_casa', 'CASA', 'lugares'), F('f_bolo', 'BOLO', 'alimentos'), F('f_sapo', 'SAPO', 'animais'), F('f_rato', 'RATO', 'animais'),
  F('f_dado', 'DADO', 'objetos'), F('f_vaca', 'VACA', 'animais'), F('f_lobo', 'LOBO', 'animais'), F('f_urso', 'URSO', 'animais'),
  F('f_peixe', 'PEIXE', 'animais'), F('f_suco', 'SUCO', 'alimentos'), F('f_faca', 'FACA', 'objetos'), F('f_moto', 'MOTO', 'transporte'),
  F('f_sino', 'SINO', 'objetos'), F('f_nave', 'NAVE', 'transporte'), F('f_rosa', 'ROSA', 'natureza'), F('f_pipa', 'PIPA', 'objetos'),
  F('f_mala', 'MALA', 'objetos'), F('f_gelo', 'GELO', 'natureza'), F('f_foca', 'FOCA', 'animais'), F('f_dedo', 'DEDO', 'corpo'),
  F('f_cama', 'CAMA', 'objetos'), F('f_mesa', 'MESA', 'objetos'), F('f_saia', 'SAIA', 'objetos'), F('f_fada', 'FADA', 'app'),
  F('f_trem', 'TREM', 'transporte'), F('f_bico', 'BICO', 'animais'), F('f_lixo', 'LIXO', 'objetos'), F('f_pano', 'PANO', 'objetos'),
];

/* ── MÉDIO (40) — 5–8 letras, dígrafos/encontros, sem acento pesado ── */
const M = mk('medio');
const MEDIO = [
  M('m_ovelha', 'OVELHA', 'animais'), M('m_pomba', 'POMBA', 'biblia'), M('m_estrela', 'ESTRELA', 'natureza'), M('m_cavalo', 'CAVALO', 'animais'),
  M('m_chuva', 'CHUVA', 'natureza'), M('m_galinha', 'GALINHA', 'animais'), M('m_coelho', 'COELHO', 'animais'), M('m_boneca', 'BONECA', 'objetos'),
  M('m_sapato', 'SAPATO', 'objetos'), M('m_banana', 'BANANA', 'alimentos'), M('m_igreja', 'IGREJA', 'biblia'), M('m_chave', 'CHAVE', 'objetos'),
  M('m_abelha', 'ABELHA', 'animais'), M('m_formiga', 'FORMIGA', 'animais'), M('m_janela', 'JANELA', 'objetos'), M('m_escola', 'ESCOLA', 'lugares'),
  M('m_caderno', 'CADERNO', 'objetos'), M('m_baleia', 'BALEIA', 'animais'), M('m_macaco', 'MACACO', 'animais'), M('m_panela', 'PANELA', 'objetos'),
  M('m_tomate', 'TOMATE', 'alimentos'), M('m_laranja', 'LARANJA', 'alimentos'), M('m_cenoura', 'CENOURA', 'alimentos'), M('m_morango', 'MORANGO', 'alimentos'),
  M('m_cebola', 'CEBOLA', 'alimentos'), M('m_girafa', 'GIRAFA', 'animais'), M('m_zebra', 'ZEBRA', 'animais'), M('m_cobra', 'COBRA', 'animais'),
  M('m_castelo', 'CASTELO', 'lugares'), M('m_estrada', 'ESTRADA', 'lugares'), M('m_planeta', 'PLANETA', 'natureza'), M('m_chinelo', 'CHINELO', 'objetos'),
  M('m_telhado', 'TELHADO', 'lugares'), M('m_pipoca', 'PIPOCA', 'alimentos'), M('m_vestido', 'VESTIDO', 'objetos'), M('m_sorvete', 'SORVETE', 'alimentos'),
  M('m_caminho', 'CAMINHO', 'lugares'), M('m_floresta', 'FLORESTA', 'natureza'), M('m_biscoito', 'BISCOITO', 'alimentos'), M('m_presente', 'PRESENTE', 'objetos'),
  // ── P4.4: +20 médio (5–8 letras, sem acento; objetos/lugares/natureza/transporte/família) ──
  M('m_tesoura', 'TESOURA', 'objetos'), M('m_martelo', 'MARTELO', 'objetos'), M('m_vassoura', 'VASSOURA', 'objetos'), M('m_cadeira', 'CADEIRA', 'objetos'),
  M('m_garrafa', 'GARRAFA', 'objetos'), M('m_mochila', 'MOCHILA', 'objetos'), M('m_caneta', 'CANETA', 'objetos'), M('m_pincel', 'PINCEL', 'objetos'),
  M('m_tambor', 'TAMBOR', 'objetos'), M('m_barco', 'BARCO', 'transporte'), M('m_foguete', 'FOGUETE', 'transporte'), M('m_padaria', 'PADARIA', 'lugares'),
  M('m_mercado', 'MERCADO', 'lugares'), M('m_fazenda', 'FAZENDA', 'lugares'), M('m_piscina', 'PISCINA', 'lugares'), M('m_parque', 'PARQUE', 'lugares'),
  M('m_montanha', 'MONTANHA', 'natureza'), M('m_fogueira', 'FOGUEIRA', 'natureza'), M('m_nuvem', 'NUVEM', 'natureza'), M('m_vizinho', 'VIZINHO', 'familia'),
];

/* ── DIFÍCIL (40) — 7–12 letras E/OU acento/Ç/repetidas/encontros ── */
const D = mk('dificil');
const DIFICIL = [
  D('d_leao', 'LEÃO', 'animais'), D('d_coracao', 'CORAÇÃO', 'familia'), D('d_aviao', 'AVIÃO', 'transporte'), D('d_passaro', 'PÁSSARO', 'animais'),
  D('d_caminhao', 'CAMINHÃO', 'transporte'), D('d_aeromoca', 'AEROMOÇA', 'transporte'), D('d_familia', 'FAMÍLIA', 'familia'), D('d_maca', 'MAÇÃ', 'alimentos'),
  D('d_limao', 'LIMÃO', 'alimentos'), D('d_botao', 'BOTÃO', 'objetos'), D('d_arara', 'ARARA', 'animais'), D('d_elefante', 'ELEFANTE', 'animais'),
  D('d_borboleta', 'BORBOLETA', 'animais'), D('d_tartaruga', 'TARTARUGA', 'animais'), D('d_macarrao', 'MACARRÃO', 'alimentos'), D('d_dinossauro', 'DINOSSAURO', 'animais'),
  D('d_bicicleta', 'BICICLETA', 'transporte'), D('d_abacaxi', 'ABACAXI', 'alimentos'), D('d_chocolate', 'CHOCOLATE', 'alimentos'), D('d_professora', 'PROFESSORA', 'familia'),
  D('d_computador', 'COMPUTADOR', 'objetos'), D('d_crocodilo', 'CROCODILO', 'animais'), D('d_joaninha', 'JOANINHA', 'animais'), D('d_passarinho', 'PASSARINHO', 'animais'),
  D('d_cachoeira', 'CACHOEIRA', 'natureza'), D('d_estrelinha', 'ESTRELINHA', 'natureza'), D('d_brinquedo', 'BRINQUEDO', 'objetos'), D('d_trenzinho', 'TRENZINHO', 'transporte'),
  D('d_margarida', 'MARGARIDA', 'natureza'), D('d_abobora', 'ABÓBORA', 'alimentos'), D('d_pirulito', 'PIRULITO', 'alimentos'), D('d_borracha', 'BORRACHA', 'objetos'),
  D('d_pinguim', 'PINGUIM', 'animais'), D('d_garotinho', 'GAROTINHO', 'familia'), D('d_presepio', 'PRESÉPIO', 'biblia'), D('d_corujinha', 'CORUJINHA', 'animais'),
  D('d_girassol', 'GIRASSOL', 'natureza'), D('d_cavalinho', 'CAVALINHO', 'animais'), D('d_melao', 'MELÃO', 'alimentos'), D('d_feijao', 'FEIJÃO', 'alimentos'),
  // ── P4.4: +20 difícil (7–12 letras e/ou acento; objetos/lugares/transporte/natureza) ──
  D('d_geladeira', 'GELADEIRA', 'objetos'), D('d_televisao', 'TELEVISÃO', 'objetos'), D('d_escorregador', 'ESCORREGADOR', 'objetos'), D('d_brincadeira', 'BRINCADEIRA', 'objetos'),
  D('d_travesseiro', 'TRAVESSEIRO', 'objetos'), D('d_guardanapo', 'GUARDANAPO', 'objetos'), D('d_ventilador', 'VENTILADOR', 'objetos'), D('d_hospital', 'HOSPITAL', 'lugares'),
  D('d_biblioteca', 'BIBLIOTECA', 'lugares'), D('d_supermercado', 'SUPERMERCADO', 'lugares'), D('d_aeroporto', 'AEROPORTO', 'transporte'), D('d_helicoptero', 'HELICÓPTERO', 'transporte'),
  D('d_aquario', 'AQUÁRIO', 'lugares'), D('d_catavento', 'CATAVENTO', 'objetos'), D('d_cachoeirinha', 'CACHOEIRINHA', 'natureza'), D('d_caracol', 'CARACOL', 'animais'),
  D('d_formiguinha', 'FORMIGUINHA', 'animais'), D('d_passaporte', 'PASSAPORTE', 'objetos'), D('d_escadaria', 'ESCADARIA', 'lugares'), D('d_melancia', 'MELANCIA', 'alimentos'),
];

/** Banco completo (P4.4: 160 — 40 fácil · 60 médio · 60 difícil). */
export const PALAVRINHAS_WORDS = Object.freeze([...FACIL, ...MEDIO, ...DIFICIL]);

export function getWord(id) {
  return PALAVRINHAS_WORDS.find((w) => w.id === id) || null;
}

export function palavrasHabilitadas() {
  return PALAVRINHAS_WORDS.filter((w) => w.enabled !== false);
}
