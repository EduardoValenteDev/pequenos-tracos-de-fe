/**
 * beniAssets.js — Manifest de pré-carregamento dos assets do mascote Beni.
 *
 * Usado pelo assetPreloadService para aquecer o cache do Beni no início do app.
 * As imagens reais vivem em beniImages.js (registro central oficial); aqui só
 * mapeamos os nomes legados de pose → as novas poses oficiais (compatibilidade),
 * sem duplicar require. O Metro deduplica por caminho, então pré-carregar a
 * lista oficial aquece exatamente os mesmos assets usados na renderização.
 *
 * Requires estáticos (em beniImages.js) — sem caminho dinâmico.
 */
import { BENI_IMAGES, BENI_BOOT_IMAGE_LIST } from './mascot/beniImages';

// Mapa de COMPATIBILIDADE: nomes antigos de pose → novas poses oficiais.
export const BENI_ASSETS = {
  main:        BENI_IMAGES.avatarBase,
  idle:        BENI_IMAGES.avatarBase,
  pointing:    BENI_IMAGES.ensinando,
  celebrating: BENI_IMAGES.celebrando,
  artist:      BENI_IMAGES.atelie,
  thinking:    BENI_IMAGES.ensinando,
  reading:     BENI_IMAGES.ensinando,
};

// Exports nomeados de conveniência (compatibilidade com imports existentes).
export const beniMain        = BENI_ASSETS.main;
export const beniIdle        = BENI_ASSETS.idle;
export const beniPointing    = BENI_ASSETS.pointing;
export const beniCelebrating = BENI_ASSETS.celebrating;
export const beniArtist      = BENI_ASSETS.artist;
export const beniThinking    = BENI_ASSETS.thinking;
export const beniReading     = BENI_ASSETS.reading;

/**
 * Conjunto do preload de INICIALIZAÇÃO: as 11 poses de boot, sem as 5 do Colorir 60.
 * O inventário completo continua em BENI_IMAGE_LIST (beniImages.js) e as poses do Colorir
 * seguem exportadas e acessíveis — elas só não são aquecidas antes de existir consumidor.
 */
export const BENI_ASSET_LIST = BENI_BOOT_IMAGE_LIST;
