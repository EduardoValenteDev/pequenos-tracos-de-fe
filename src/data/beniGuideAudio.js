/**
 * beniGuideAudio.js — manifesto dos áudios FALADOS do guia do Beni (UX 2.4).
 *
 * Voz do Beni que acompanha cada passo do tour inicial e do guia de Aventuras.
 * Indexado por `audioKey` (string pontilhada) → require() ESTÁTICO (Metro exige).
 * SEGURO PARA NULO: chave ausente → null (o guia segue em texto, sem quebrar).
 *
 * NÃO é a narração das histórias (audioManifest/audioService) — é uma camada
 * separada, só do guia. Arquivos: assets/audio/beni_guide/*.mp3
 */
const BENI_GUIDE_AUDIO = {
  // Tour inicial (pós-onboarding)
  'guide.initial.welcome':           require('../../assets/audio/beni_guide/guide_initial_welcome.mp3'),
  'guide.initial.adventures':        require('../../assets/audio/beni_guide/guide_initial_adventures.mp3'),
  'guide.initial.glow':              require('../../assets/audio/beni_guide/guide_initial_glow.mp3'),
  // Guia contextual da aba Aventuras
  'guide.adventures.path':           require('../../assets/audio/beni_guide/guide_adventures_path.mp3'),
  'guide.adventures.next_available': require('../../assets/audio/beni_guide/guide_adventures_next_available.mp3'),
  'guide.adventures.next_locked':    require('../../assets/audio/beni_guide/guide_adventures_next_locked.mp3'),
  'guide.adventures.view_region':    require('../../assets/audio/beni_guide/guide_adventures_view_region.mp3'),
};

/**
 * Retorna o asset de áudio do guia para a `audioKey`, ou null se não existir.
 * Nunca lança (chave ausente/indefinida → null).
 */
export function getBeniGuideAudio(audioKey) {
  if (!audioKey) return null;
  return BENI_GUIDE_AUDIO[audioKey] ?? null;
}

export default BENI_GUIDE_AUDIO;
