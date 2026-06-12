/**
 * beniImages.js — Registro central OFICIAL das imagens do mascote Beni.
 *
 * Fonte única de verdade para as 7 poses oficiais do Beni (o cordeirinho guia).
 * Todos os require() são ESTÁTICOS e literais (o Metro exige caminhos fixos).
 * Sem caminho dinâmico, sem base64, sem URL externa.
 *
 * Arquivos físicos: assets/mascot/beni/0N_beni_*.png
 *
 * Poses → contexto de uso (ver BeniMascotImage / BeniAvatar):
 *   avatarBase — perfil, avatar, estado neutro
 *   acenando   — Home, boas-vindas, onboarding
 *   celebrando — conquistas, recompensas, conclusão
 *   comBau     — Baú e desbloqueios
 *   ensinando  — tutoriais, explicações, orientação
 *   orando     — Momento com Beni, oração, reflexão
 *   atelie     — Ateliê, pintura, desenho, colorir
 */
export const BENI_IMAGES = {
  avatarBase: require('../../../assets/mascot/beni/01_beni_avatar_base.png'),
  acenando:   require('../../../assets/mascot/beni/02_beni_acenando.png'),
  celebrando: require('../../../assets/mascot/beni/03_beni_celebrando.png'),
  comBau:     require('../../../assets/mascot/beni/04_beni_com_bau.png'),
  ensinando:  require('../../../assets/mascot/beni/05_beni_ensinando.png'),
  orando:     require('../../../assets/mascot/beni/06_beni_orando.png'),
  atelie:     require('../../../assets/mascot/beni/07_beni_atelie.png'),
};

/** Pose padrão segura (fallback universal). */
export const BENI_DEFAULT_VARIANT = 'avatarBase';

// Exports nomeados de conveniência (mesmos módulos do mapa acima).
export const beniAvatarBase = BENI_IMAGES.avatarBase;
export const beniAcenando   = BENI_IMAGES.acenando;
export const beniCelebrando = BENI_IMAGES.celebrando;
export const beniComBau     = BENI_IMAGES.comBau;
export const beniEnsinando  = BENI_IMAGES.ensinando;
export const beniOrando     = BENI_IMAGES.orando;
export const beniAtelie     = BENI_IMAGES.atelie;

/** Lista dos 7 arquivos reais — usada pelo pré-carregamento de assets. */
export const BENI_IMAGE_LIST = Object.values(BENI_IMAGES);
