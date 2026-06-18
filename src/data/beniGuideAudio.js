/**
 * beniGuideAudio.js — manifesto dos áudios FALADOS do guia do Beni (UX 2.4).
 *
 * Voz do Beni que acompanha cada passo do tour inicial e do guia de Aventuras.
 * Indexado por `audioKey` (string pontilhada) → require() ESTÁTICO (Metro exige).
 * SEGURO PARA NULO: chave ausente → null (o guia segue em texto, sem quebrar).
 *
 * NÃO é a narração das histórias (audioManifest/audioService) — é uma camada
 * separada, só do guia. Arquivos organizados por CONTEXTO em subpastas:
 *   assets/audio/beni_guide/{initial,adventures,home,atelier,stars,profile,parents,common}/
 * (Audio 1.0). Só `initial/` e `adventures/` têm áudio hoje; as demais pastas
 * existem para os guias futuros — o plano de chaves está em docs/BENI_GUIDE_AUDIO_PLAN.md.
 * REGRA: nunca adicionar require() aqui para um arquivo que ainda não existe.
 */
const BENI_GUIDE_AUDIO = {
  // Tour inicial (pós-onboarding) — assets/audio/beni_guide/initial/
  'guide.initial.welcome':           require('../../assets/audio/beni_guide/initial/guide_initial_welcome.mp3'),
  'guide.initial.adventures':        require('../../assets/audio/beni_guide/initial/guide_initial_adventures.mp3'),
  'guide.initial.glow':              require('../../assets/audio/beni_guide/initial/guide_initial_glow.mp3'),
  // Guia contextual da aba Aventuras — assets/audio/beni_guide/adventures/
  'guide.adventures.path':           require('../../assets/audio/beni_guide/adventures/guide_adventures_path.mp3'),
  'guide.adventures.next_available': require('../../assets/audio/beni_guide/adventures/guide_adventures_next_available.mp3'),
  'guide.adventures.next_locked':    require('../../assets/audio/beni_guide/adventures/guide_adventures_next_locked.mp3'),
  'guide.adventures.view_region':    require('../../assets/audio/beni_guide/adventures/guide_adventures_view_region.mp3'),
  // Guia da aba Início/Home (Home 1.0) — assets/audio/beni_guide/home/
  'guide.home.welcome':              require('../../assets/audio/beni_guide/home/guide_home_welcome.mp3'),
  'guide.home.continue':             require('../../assets/audio/beni_guide/home/guide_home_continue.mp3'),
  'guide.home.cultinho':             require('../../assets/audio/beni_guide/home/guide_home_cultinho.mp3'),
  'guide.home.bau_beni':             require('../../assets/audio/beni_guide/home/guide_home_bau_beni.mp3'),
  'guide.home.create_beni':          require('../../assets/audio/beni_guide/home/guide_home_create_beni.mp3'),
  'guide.home.momento_beni':         require('../../assets/audio/beni_guide/home/guide_home_momento_beni.mp3'),
  // Guia da aba Ateliê (Ateliê 1.0) — assets/audio/beni_guide/atelier/
  'guide.atelier.welcome':           require('../../assets/audio/beni_guide/atelier/guide_atelier_welcome.mp3'),
  'guide.atelier.coloring':          require('../../assets/audio/beni_guide/atelier/guide_atelier_coloring.mp3'),
  'guide.atelier.guided_drawing':    require('../../assets/audio/beni_guide/atelier/guide_atelier_guided_drawing.mp3'),
  'guide.atelier.free_draw':         require('../../assets/audio/beni_guide/atelier/guide_atelier_free_draw.mp3'),
  'guide.atelier.gallery':           require('../../assets/audio/beni_guide/atelier/guide_atelier_gallery.mp3'),
};

/**
 * Retorna o asset de áudio do guia para a `audioKey`, ou null se não existir.
 * Nunca lança (chave ausente/indefinida → null).
 */
export function getBeniGuideAudio(audioKey) {
  if (!audioKey) return null;
  return BENI_GUIDE_AUDIO[audioKey] ?? null;
}

/**
 * Pré-carrega (aquece o cache de) os áudios das audioKeys dadas, para a 1ª fala
 * tocar sem atraso. Usa expo-asset (já no projeto). Nunca lança.
 */
export async function preloadGuideAudio(audioKeys) {
  try {
    const { Asset } = require('expo-asset');
    const assets = Array.from(new Set((audioKeys || []).map(getBeniGuideAudio).filter(Boolean)));
    await Promise.allSettled(assets.map((a) => Asset.fromModule(a).downloadAsync()));
  } catch {
    /* pré-carregamento é best-effort — o guia segue mesmo se falhar */
  }
}

export default BENI_GUIDE_AUDIO;
