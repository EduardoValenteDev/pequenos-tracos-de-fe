/**
 * beniTourService.js — flags locais dos guias/tours do Beni (UX 2.0 / 2.1).
 *
 * Serviço ÚNICO para os guias contextuais do Beni (um por tela/contexto). Cada guia
 * tem uma flag própria "já visto". É só UI: NÃO toca em progresso, conquistas,
 * paywall, acesso premium nem perfil. Defensivo: falha de storage → "não insiste".
 *
 * Chaves (uma por guia). A 'initial' mantém a chave já existente do UX 2.0 para não
 * orfanar instalações que já viram o tour:
 *   initial    → @ptf_beni_app_tour_seen_v1   (tour inicial sobre Aventuras)
 *   adventures → @ptf_beni_guide_adventures_v1 (guias contextuais — próximos blocos)
 *   atelier    → @ptf_beni_guide_atelier_v1
 *   stars      → @ptf_beni_guide_stars_v1
 *   profile    → @ptf_beni_guide_profile_v1
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

export const GUIDE_KEYS = {
  initial: 'initial',
  adventures: 'adventures',
  home: 'home',
  atelier: 'atelier',
  stars: 'stars',
  profile: 'profile',
  parentArea: 'parentArea',
};

const GUIDE_STORAGE = {
  initial: '@ptf_beni_app_tour_seen_v1',
  adventures: '@ptf_beni_guide_adventures_v1',
  home: '@ptf_beni_guide_home_v1',
  atelier: '@ptf_beni_guide_atelier_v1',
  stars: '@ptf_beni_guide_stars_v1',
  profile: '@ptf_beni_guide_profile_v1',
  parentArea: '@ptf_beni_guide_parent_v1',
};

function storageKeyFor(key) {
  return GUIDE_STORAGE[key] || null;
}

// ── API genérica de guias ────────────────────────────────────────────────────

/** True se o guia `key` já foi visto/pulado. Nunca lança (dúvida → true = não insiste). */
export async function hasSeenGuide(key) {
  const storageKey = storageKeyFor(key);
  if (!storageKey) return true;
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    return raw === 'true';
  } catch (e) {
    log('beniGuide.read:', e);
    return true;
  }
}

/** Marca o guia `key` como visto (ao concluir OU pular). Idempotente. */
export async function markGuideSeen(key) {
  const storageKey = storageKeyFor(key);
  if (!storageKey) return;
  try {
    await AsyncStorage.setItem(storageKey, 'true');
  } catch (e) {
    log('beniGuide.markSeen:', e);
  }
}

/** Reseta a flag de UM guia (para revê-lo). Não apaga nada além disso. */
export async function resetGuide(key) {
  const storageKey = storageKeyFor(key);
  if (!storageKey) return { success: false, error: 'unknown guide' };
  try {
    await AsyncStorage.removeItem(storageKey);
    return { success: true };
  } catch (e) {
    log('beniGuide.reset:', e);
    return { success: false, error: String(e) };
  }
}

/** Reseta TODOS os guias do Beni (Ferramentas do Criador). */
export async function resetAllGuides() {
  try {
    await AsyncStorage.multiRemove(Object.values(GUIDE_STORAGE));
    return { success: true };
  } catch (e) {
    log('beniGuide.resetAll:', e);
    return { success: false, error: String(e) };
  }
}

// ── Pedido de TOUR INICIAL (independe do layout: mobile tab bar OU tablet sidebar) ──
// O onboarding/“Rever Tour” NÃO consegue, no tablet, passar route.params para a
// AdventureMapScreen (TabletLayout é custom e ignora o nested state da navegação).
// Então usamos um SINAL em memória: quem quer abrir o tour chama requestInitialTour();
// a tela de Aventuras consome; o TabletLayout assina para focar a aba Aventuras.
let _pendingInitialTour = false;
const _tourReqListeners = new Set();

/** Pede para o tour inicial abrir na próxima entrada em Aventuras (qualquer layout). */
export function requestInitialTour() {
  _pendingInitialTour = true;
  _tourReqListeners.forEach((fn) => { try { fn(); } catch { /* nunca quebra */ } });
}

/** Lê SEM consumir (o TabletLayout usa para focar a aba Aventuras). */
export function isInitialTourPending() {
  return _pendingInitialTour;
}

/** Lê e LIMPA o pedido (a tela de Aventuras chama ao abrir o tour). */
export function consumeInitialTourRequest() {
  const v = _pendingInitialTour;
  _pendingInitialTour = false;
  return v;
}

/** Assina pedidos de tour (ex.: TabletLayout focar Aventuras). Retorna unsubscribe. */
export function subscribeInitialTourRequest(fn) {
  if (typeof fn !== 'function') return () => {};
  _tourReqListeners.add(fn);
  return () => _tourReqListeners.delete(fn);
}

// ── Compatibilidade com o tour inicial (UX 2.0) ───────────────────────────────

/** True se o tour inicial já foi visto/pulado. */
export function hasSeenBeniAppTour() {
  return hasSeenGuide(GUIDE_KEYS.initial);
}

/** Marca o tour inicial como visto. */
export function markBeniAppTourSeen() {
  return markGuideSeen(GUIDE_KEYS.initial);
}

/** Reseta o tour inicial (para revê-lo). */
export function resetBeniAppTour() {
  return resetGuide(GUIDE_KEYS.initial);
}
