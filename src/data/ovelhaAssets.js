/**
 * ovelhaAssets.js — `require` estático dos assets de "Cadê a Ovelhinha?" (2.2e).
 *
 * Fonte ÚNICA dos módulos de imagem (backgrounds processados + 3 poses), compartilhada pelo
 * jogo e pela Asset Gallery interna. Os backgrounds antigos (warehouse_01/farm_01) foram
 * removidos; aqui só existem os cinco ambientes novos. `underwater_01` é registrada para a
 * galeria, mas a cena está DESABILITADA no jogo (ver ovelhaScenes: requires_sheep_diver).
 */

/** Backgrounds em WebP real (processed/). Chave = assetKey da cena. */
export const OVELHA_BG = {
  farm_lively_01: require('../../assets/games/cade_a_ovelhinha/backgrounds/processed/farm_lively_01.webp'),
  bakery_01: require('../../assets/games/cade_a_ovelhinha/backgrounds/processed/bakery_01.webp'),
  toy_workshop_01: require('../../assets/games/cade_a_ovelhinha/backgrounds/processed/toy_workshop_01.webp'),
  laundry_yard_01: require('../../assets/games/cade_a_ovelhinha/backgrounds/processed/laundry_yard_01.webp'),
  underwater_01: require('../../assets/games/cade_a_ovelhinha/backgrounds/processed/underwater_01.webp'),
};

/** Ovelhas recortadas por alpha bbox (processed/). Chave = pose. */
export const OVELHA_POSE_IMG = {
  front: require('../../assets/games/cade_a_ovelhinha/sheep/processed/sheep_front.png'),
  peekLeft: require('../../assets/games/cade_a_ovelhinha/sheep/processed/sheep_peek_left.png'),
  peekRight: require('../../assets/games/cade_a_ovelhinha/sheep/processed/sheep_peek_right.png'),
};

/** Rótulos amigáveis para a galeria interna. */
export const OVELHA_BG_LABELS = {
  farm_lively_01: 'Fazenda animada',
  bakery_01: 'Padaria',
  toy_workshop_01: 'Oficina de brinquedos',
  laundry_yard_01: 'Quintal da lavanderia',
  underwater_01: 'Fundo do mar (desabilitado)',
};
