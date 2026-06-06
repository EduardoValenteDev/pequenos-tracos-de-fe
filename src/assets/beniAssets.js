/**
 * beniAssets.js — Manifest dos assets de imagem do mascote Beni.
 *
 * Usado pelo serviço de pré-carregamento (assetPreloadService) para aquecer o
 * cache do Beni no início do app. Os mesmos arquivos são consumidos por
 * BeniAvatar; o Metro deduplica módulos por caminho, então pré-carregar aqui
 * aquece exatamente o mesmo asset usado na renderização.
 *
 * Apenas os 7 arquivos físicos (variants happy/locked/parent/neutral reusam
 * idle/thinking/main, já cobertos abaixo). Requires estáticos — sem caminho
 * dinâmico.
 */
export const BENI_ASSETS = {
  main:        require('../../assets/mascot/beni/beni_main.png'),
  idle:        require('../../assets/mascot/beni/beni_idle.png'),
  pointing:    require('../../assets/mascot/beni/beni_pointing.png'),
  celebrating: require('../../assets/mascot/beni/beni_celebrating.png'),
  artist:      require('../../assets/mascot/beni/beni_artist.png'),
  thinking:    require('../../assets/mascot/beni/beni_thinking.png'),
  reading:     require('../../assets/mascot/beni/beni_reading.png'),
};

// Exports nomeados de conveniência (mesmos módulos do mapa acima).
export const beniMain        = BENI_ASSETS.main;
export const beniIdle        = BENI_ASSETS.idle;
export const beniPointing    = BENI_ASSETS.pointing;
export const beniCelebrating = BENI_ASSETS.celebrating;
export const beniArtist      = BENI_ASSETS.artist;
export const beniThinking    = BENI_ASSETS.thinking;
export const beniReading     = BENI_ASSETS.reading;

export const BENI_ASSET_LIST = Object.values(BENI_ASSETS);
