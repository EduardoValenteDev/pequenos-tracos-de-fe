/**
 * onboardingAssetWarmup.js — prontidão POR PÁGINA do Livro Vivo (O2.2 · §7/§8).
 *
 * Cada página tem um conjunto pequeno de assets LOCAIS; carregamos com a API oficial
 * `Asset.loadAsync` (baixa+decodifica o lote), com timeout, deduplicação e cache de sessão.
 * A transição só deve começar quando a PRÓXIMA página estiver pronta — por isso expomos
 * promessas e flags de prontidão por página. NÃO carrega histórias/cenas completas, jogos,
 * packs, áudio nem base64: só as CAPAS e as poses do Beni do onboarding.
 */
import { Asset } from 'expo-asset';
import { BENI_IMAGES } from '../assets/mascot/beniImages';
import { getStoryCover } from '../assets/storyCovers';
import { getAvatarImage } from '../data/avatars';
import { OB } from '../theme/onboardingVisualTokens';

const requested = new Set();
const cache = {};                 // pageKey -> Promise
const readyFlags = { intro: false, world: false, profile: false, creation: false };

function keyOf(mod) { return typeof mod === 'number' ? mod : JSON.stringify(mod); }

async function load(modules, timeoutMs = OB.readyTimeoutMs) {
  const fresh = (modules || []).filter(Boolean).filter((m) => {
    const k = keyOf(m);
    if (requested.has(k)) return false;
    requested.add(k);
    return true;
  });
  if (!fresh.length) return;
  const guard = new Promise((res) => setTimeout(res, timeoutMs));
  try {
    await Promise.race([Asset.loadAsync(fresh), guard]);
  } catch {
    /* best-effort — segue com fallback de geometria estável */
  }
}

const PAGE_ASSETS = {
  intro: () => [BENI_IMAGES.acenando],
  world: () => [BENI_IMAGES.apontandoDireita, getStoryCover('david_goliath')],
  profile: () => [
    BENI_IMAGES.ensinando,
    getAvatarImage('boy', 'claro'), getAvatarImage('boy', 'escuro'),
    getAvatarImage('girl', 'claro'), getAvatarImage('girl', 'escuro'),
    getAvatarImage('star', 'claro'),
  ],
  creation: () => [BENI_IMAGES.celebrando, getStoryCover('creation')],
};

/** Garante o carregamento da página (uma vez) e devolve a promessa que resolve quando pronta. */
export function ensurePageReady(key) {
  if (!PAGE_ASSETS[key]) return Promise.resolve();
  if (!cache[key]) {
    cache[key] = load(PAGE_ASSETS[key]()).then(() => { readyFlags[key] = true; }).catch(() => { readyFlags[key] = true; });
  }
  return cache[key];
}

/** Aquece tudo do onboarding: intro primeiro (bloqueante da 1ª página), resto em seguida. */
export function warmupOnboarding() {
  ensurePageReady('intro');
  // As demais páginas aquecem logo após, sem competir com a 1ª pintura.
  setTimeout(() => { ensurePageReady('world'); ensurePageReady('profile'); ensurePageReady('creation'); }, 220);
}

/** Reinicia (Modo Criador / testes). Não toca em asset algum. */
export function resetOnboardingWarmup() {
  requested.clear();
  Object.keys(cache).forEach((k) => delete cache[k]);
  Object.keys(readyFlags).forEach((k) => { readyFlags[k] = false; });
}

export default warmupOnboarding;
