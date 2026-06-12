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
import { BENI_IMAGES, BENI_IMAGE_LIST } from './mascot/beniImages';

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

/** Pré-carrega os 7 arquivos reais (poses oficiais). */
export const BENI_ASSET_LIST = BENI_IMAGE_LIST;
