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
  // Poses adicionais (arquivos já no disco) — registradas no P4R2 (aprovado).
  celebrando2:       require('../../../assets/mascot/beni/08_beni_celebrando_2.png'),
  descansando:       require('../../../assets/mascot/beni/09_beni_descansando.png'),
  apontandoDireita:  require('../../../assets/mascot/beni/10_beni_apontando_direita.png'),
  apontandoEsquerda: require('../../../assets/mascot/beni/11_beni_apontando_esquerda.png'),
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
export const beniCelebrando2       = BENI_IMAGES.celebrando2;
export const beniDescansando       = BENI_IMAGES.descansando;
export const beniApontandoDireita  = BENI_IMAGES.apontandoDireita;
export const beniApontandoEsquerda = BENI_IMAGES.apontandoEsquerda;

/** Chaves oficiais de pose (fonte estável para render e testes de existência). */
export const BENI_POSE_KEYS = Object.freeze(Object.keys(BENI_IMAGES));

/** Lista de TODOS os módulos reais — usada pelo pré-carregamento de assets. */
export const BENI_IMAGE_LIST = Object.values(BENI_IMAGES);
