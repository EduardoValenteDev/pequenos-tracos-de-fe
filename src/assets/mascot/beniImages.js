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
  // Poses de celebração do "Colorir com o Beni" (Colorir 60 · P12) — corpo inteiro,
  // 1024×1280 RGBA transparente. Beni ADMIRA/CELEBRA/APRESENTA a criação da criança.
  //   admiraEsquerda   — obra à esquerda do Beni (Beni olha p/ a esquerda)
  //   admiraDireita    — obra à direita do Beni (Beni olha p/ a direita)
  //   celebraFrente    — pico da 1ª conclusão, Beni de frente comemorando
  //   apresentaGaleria — grande conclusão, Beni apresenta a galeria (corpo à esquerda)
  //   olhaAcima        — obra acima do personagem (Beni olha/ergue a pata p/ cima)
  admiraEsquerda:   require('../../../assets/mascot/beni/12_beni_admira_esquerda.png'),
  admiraDireita:    require('../../../assets/mascot/beni/13_beni_admira_direita.png'),
  celebraFrente:    require('../../../assets/mascot/beni/14_beni_celebra_frente.png'),
  apresentaGaleria: require('../../../assets/mascot/beni/15_beni_apresenta_galeria.png'),
  olhaAcima:        require('../../../assets/mascot/beni/16_beni_olha_acima.png'),
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
export const beniAdmiraEsquerda    = BENI_IMAGES.admiraEsquerda;
export const beniAdmiraDireita     = BENI_IMAGES.admiraDireita;
export const beniCelebraFrente     = BENI_IMAGES.celebraFrente;
export const beniApresentaGaleria  = BENI_IMAGES.apresentaGaleria;
export const beniOlhaAcima         = BENI_IMAGES.olhaAcima;

/** Chaves oficiais de pose (fonte estável para render e testes de existência). */
export const BENI_POSE_KEYS = Object.freeze(Object.keys(BENI_IMAGES));

/** Lista de TODOS os módulos reais (as 16 poses). Inventário completo do registro. */
export const BENI_IMAGE_LIST = Object.values(BENI_IMAGES);

/**
 * Chaves das poses do "Colorir com o Beni" — as ÚNICAS que ficam fora do preload de
 * inicialização. Elas só aparecem depois que a criança conclui uma atividade de colorir,
 * então aquecê-las no boot custa peso crítico por um asset que talvez nunca seja exibido.
 * Medição: as 5 somam 4.287.389 bytes sobre uma base de 14.285.454 (+30,0% no boot).
 */
export const BENI_COLORING60_POSE_KEYS = Object.freeze([
  'admiraEsquerda', 'admiraDireita', 'celebraFrente', 'apresentaGaleria', 'olhaAcima',
]);

// PARTIÇÃO derivada numa passagem só, a partir do MESMO mapa: por construção a união das
// duas listas é BENI_IMAGES e a interseção é vazia. Nenhuma das duas é escrita à mão, então
// não existe o modo de falha "registrei a pose num lugar e esqueci do outro": uma pose nova
// e não classificada cai no boot (e a contagem reprova no smoke), jamais some das duas.
const BENI_POSE_ENTRIES = Object.entries(BENI_IMAGES);
const ehPoseColoring60 = ([chave]) => BENI_COLORING60_POSE_KEYS.includes(chave);

/** Poses aquecidas no BOOT (11) — exatamente o conjunto crítico anterior ao Colorir 60. */
export const BENI_BOOT_IMAGE_LIST = Object.freeze(
  BENI_POSE_ENTRIES.filter((entrada) => !ehPoseColoring60(entrada)).map(([, modulo]) => modulo),
);

/**
 * Poses do Colorir 60 (5) — preload OPCIONAL e escopado, NUNCA no boot. Hoje esta lista
 * não tem consumidor: quem exibir o overlay de conclusão é que deve aquecê-la antes. Não
 * há preload escopado aqui de propósito — código morto não é completude.
 */
export const BENI_COLORING60_IMAGE_LIST = Object.freeze(
  BENI_POSE_ENTRIES.filter(ehPoseColoring60).map(([, modulo]) => modulo),
);
