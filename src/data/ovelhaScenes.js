/**
 * ovelhaScenes.js — CENAS AUTORAIS de "Cadê a Ovelhinha?" (Bloco 2.2a — contrato).
 *
 * A partir do 2.2a o jogo deixa de sortear 3 ícones em posições livres e passa a
 * sortear ESCONDERIJOS previamente compostos dentro de cenas ilustradas. Este arquivo
 * é o CONTRATO de dados — não contém arte oficial (só mocks internos claramente
 * provisórios). A arte real (fundo 4:5, ovelha em poses, oclusores) entra num bloco
 * dedicado, depois da validação.
 *
 * ── Coordenadas ──────────────────────────────────────────────────────────────
 * Tudo em COORDENADAS DE ARTE (px do design `designWidth × designHeight`, 4:5). A tela
 * converte arte→viewport por um fator de escala único (ver ovelhaGameService).
 *
 * ── Estrutura ────────────────────────────────────────────────────────────────
 *   scene = { id, background, designWidth, designHeight, safeArea, foregrounds,
 *             decorativeLayers, hidingSpots }
 *   hidingSpot = { id, pos, escala, pose, orientacao, foreground, visivelFrac,
 *                  hitbox, dificuldades, ordem }
 */

/** Poses que o sistema aceita para a ovelha. Contrato — sem arte neste bloco. */
export const OVELHA_POSES = Object.freeze([
  'front', 'peekLeft', 'peekRight', 'crouched', 'found', 'celebrating',
]);

/** Orientações válidas (espelhamento horizontal quando não inverte detalhe importante). */
export const OVELHA_ORIENTACOES = Object.freeze(['normal', 'flip']);

/**
 * Cena dourada de referência: `campo_com_cerca_01`. Fundo vertical 4:5, quatro
 * esconderijos planejados (arbusto, muro de pedra, feno, cerca baixa).
 *
 * ATENCAO: `background`/`foregrounds` apontam para IDs de asset que AINDA NÃO EXISTEM — o
 * `tipo: 'placeholder'` sinaliza à tela para desenhar um mock interno. Nenhum arquivo
 * de arte é versionado neste bloco.
 */
const CAMPO_COM_CERCA_01 = Object.freeze({
  id: 'campo_com_cerca_01',
  background: { assetId: 'campo_com_cerca_01_bg', tipo: 'placeholder' },
  designWidth: 1080,
  designHeight: 1350,   // 4:5
  safeArea: { x: 64, y: 80, w: 952, h: 1190 },

  // Oclusores autorais da cena (parte da arte). `tipo:'placeholder'` → mock interno.
  foregrounds: Object.freeze({
    arbusto_frente: { assetId: 'campo_com_cerca_01_arbusto', tipo: 'placeholder', mock: 'arbusto' },
    muro_pedra: { assetId: 'campo_com_cerca_01_muro', tipo: 'placeholder', mock: 'pedra' },
    feno: { assetId: 'campo_com_cerca_01_feno', tipo: 'placeholder', mock: 'feno' },
    cerca_baixa: { assetId: 'campo_com_cerca_01_cerca', tipo: 'placeholder', mock: 'cerca' },
  }),

  // Cenário decorativo (não recebe toque; parte da composição). Mock provisório.
  decorativeLayers: Object.freeze([
    { id: 'arv-1', tipo: 'arvore', pos: { x: 170, y: 300 }, size: 260 },
    { id: 'flor-1', tipo: 'flor', pos: { x: 880, y: 360 }, size: 120 },
    { id: 'grama-1', tipo: 'grama', pos: { x: 520, y: 1180 }, size: 150 },
    { id: 'grama-2', tipo: 'grama', pos: { x: 210, y: 1120 }, size: 130 },
    { id: 'flor-2', tipo: 'flor', pos: { x: 900, y: 1150 }, size: 110 },
  ]),

  // Quatro esconderijos autorais. `pos` = centro da ovelha (arte). `hitbox` = retângulo
  // tocável (arte). `visivelFrac` = fração da ovelha aparente (o resto fica atrás do
  // foreground). `ordem` = z dentro da camada de sprite.
  hidingSpots: Object.freeze([
    {
      id: 'spot_arbusto', pos: { x: 300, y: 980 }, escala: 1.0,
      pose: 'peekRight', orientacao: 'normal', foreground: 'arbusto_frente',
      visivelFrac: 0.5, hitbox: { w: 340, h: 320 }, dificuldades: ['facil'], ordem: 1,
    },
    {
      id: 'spot_muro', pos: { x: 800, y: 1030 }, escala: 1.05,
      pose: 'peekLeft', orientacao: 'flip', foreground: 'muro_pedra',
      visivelFrac: 0.55, hitbox: { w: 340, h: 300 }, dificuldades: ['facil'], ordem: 2,
    },
    {
      id: 'spot_feno', pos: { x: 360, y: 630 }, escala: 0.95,
      pose: 'crouched', orientacao: 'normal', foreground: 'feno',
      visivelFrac: 0.5, hitbox: { w: 320, h: 300 }, dificuldades: ['facil'], ordem: 3,
    },
    {
      id: 'spot_cerca', pos: { x: 760, y: 650 }, escala: 1.0,
      pose: 'peekLeft', orientacao: 'flip', foreground: 'cerca_baixa',
      visivelFrac: 0.6, hitbox: { w: 320, h: 300 }, dificuldades: ['facil'], ordem: 4,
    },
  ]),
});

/** Todas as cenas autorais disponíveis. Hoje só a cena dourada. */
export const OVELHA_SCENES = Object.freeze([CAMPO_COM_CERCA_01]);

export function getScene(id) {
  return OVELHA_SCENES.find((s) => s.id === id) || OVELHA_SCENES[0];
}

/** A cena padrão do vertical slice. */
export const OVELHA_SCENE_PADRAO = 'campo_com_cerca_01';
