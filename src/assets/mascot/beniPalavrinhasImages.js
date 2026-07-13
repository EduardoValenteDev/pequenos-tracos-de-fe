/**
 * beniPalavrinhasImages.js — Mapa de imagens do Beni EXCLUSIVO do "Palavrinhas do Beni" (P4.3).
 *
 * Variantes OTIMIZADAS (dimensionadas para o uso real do jogo), geradas a partir dos 11 originais
 * SEM alterá-los. Base 1x + @2x + @3x no diretório `assets/mascot/beni/palavrinhas/`; o Metro
 * resolve automaticamente a densidade do aparelho a partir do `require` do arquivo base.
 *
 *   • 4:5 (poses 01–07): base 176×220 · @2x 352×440 · @3x 528×660
 *   • 1:1 (poses 08–11): base 220×220 · @2x 440×440 · @3x 660×660
 *
 * O restante do app CONTINUA usando `beniImages.js` (originais full-res). Só o Palavrinhas usa este mapa.
 * Todos os require() são ESTÁTICOS e literais (o Metro exige caminhos fixos). Sem base64, sem URL.
 */
export const BENI_PALAVRINHAS_IMAGES = {
  avatarBase:        require('../../../assets/mascot/beni/palavrinhas/01_beni_avatar_base.png'),
  acenando:          require('../../../assets/mascot/beni/palavrinhas/02_beni_acenando.png'),
  celebrando:        require('../../../assets/mascot/beni/palavrinhas/03_beni_celebrando.png'),
  comBau:            require('../../../assets/mascot/beni/palavrinhas/04_beni_com_bau.png'),
  ensinando:         require('../../../assets/mascot/beni/palavrinhas/05_beni_ensinando.png'),
  orando:            require('../../../assets/mascot/beni/palavrinhas/06_beni_orando.png'),
  atelie:            require('../../../assets/mascot/beni/palavrinhas/07_beni_atelie.png'),
  celebrando2:       require('../../../assets/mascot/beni/palavrinhas/08_beni_celebrando_2.png'),
  descansando:       require('../../../assets/mascot/beni/palavrinhas/09_beni_descansando.png'),
  apontandoDireita:  require('../../../assets/mascot/beni/palavrinhas/10_beni_apontando_direita.png'),
  apontandoEsquerda: require('../../../assets/mascot/beni/palavrinhas/11_beni_apontando_esquerda.png'),
};

/** Pose padrão segura (fallback universal). */
export const BENI_PALAVRINHAS_DEFAULT = 'avatarBase';

/** Chaves oficiais (mesma nomenclatura de beniImages.js). */
export const BENI_PALAVRINHAS_POSE_KEYS = Object.freeze(Object.keys(BENI_PALAVRINHAS_IMAGES));

/** Proporção por pose (para enquadramento cover sem distorção). 01–07 = 4:5; 08–11 = 1:1. */
export const BENI_PALAVRINHAS_RATIO = Object.freeze({
  avatarBase: 0.8, acenando: 0.8, celebrando: 0.8, comBau: 0.8, ensinando: 0.8, orando: 0.8, atelie: 0.8,
  celebrando2: 1, descansando: 1, apontandoDireita: 1, apontandoEsquerda: 1,
});
