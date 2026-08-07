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
// Este sinal nasceu porque o tablet tinha um shell CUSTOM que ignorava o state aninhado
// da navegação — logo, `route.params` não chegava à AdventureMapScreen. A Fase 6 · B3
// removeu esse shell: hoje quem pede o tour NAVEGA de verdade nos dois formatos, e o
// foco da aba é responsabilidade do navegador, não deste módulo.
// O sinal permanece por um motivo que continua real e independe de layout: a tela de
// Aventuras pode JÁ ESTAR MONTADA quando o pedido chega (ex.: "Rever Tour" na Área dos
// Pais) — aí só um params novo não basta, e a tela reage pela assinatura.
let _pendingInitialTour = false;
const _tourReqListeners = new Set();

/** Pede para o tour inicial abrir na próxima entrada em Aventuras (qualquer layout). */
export function requestInitialTour() {
  _pendingInitialTour = true;
  _tourReqListeners.forEach((fn) => { try { fn(); } catch { /* nunca quebra */ } });
}

/**
 * Lê SEM consumir. Era usado pelo `TabletLayout` para escolher a aba inicial; com o
 * shell único da Fase 6 · B3 ficou SEM consumidor em `src/`. Mantido de propósito:
 * é leitura pura, sem efeito, e remover exportação de serviço não é escopo de B3.
 */
export function isInitialTourPending() {
  return _pendingInitialTour;
}

/** Lê e LIMPA o pedido (a tela de Aventuras chama ao abrir o tour). */
export function consumeInitialTourRequest() {
  const v = _pendingInitialTour;
  _pendingInitialTour = false;
  return v;
}

/** Assina pedidos de tour (a tela de Aventuras já montada). Retorna unsubscribe. */
export function subscribeInitialTourRequest(fn) {
  if (typeof fn !== 'function') return () => {};
  _tourReqListeners.add(fn);
  return () => _tourReqListeners.delete(fn);
}

// ── Sinal: tour de Aventuras ATIVO (Fase 1.1.3) ───────────────────────────────
// O tour do mapa é pass-through (sem Modal), então a tab bar/sidebar continuam
// nativas. Este sinal em memória avisa o AppNavigator/TabletSidebar para BLOQUEAR
// a troca para outras abas enquanto o tour está ativo — sem Modal, sem cobrir o
// mapa, sem travar o pan. É só UI/navegação: não toca progresso/acesso.
let _adventureTourActive = false;
const _advTourListeners = new Set();

/** Liga/desliga o lock de navegação do tour de Aventuras. */
export function setAdventureTourActive(active) {
  const v = !!active;
  if (v === _adventureTourActive) return;
  _adventureTourActive = v;
  _advTourListeners.forEach((fn) => { try { fn(v); } catch { /* nunca quebra */ } });
}

/** True enquanto o tour de Aventuras estiver ativo (lê SEM consumir). */
export function isAdventureTourActive() {
  return _adventureTourActive;
}

/** Assina mudanças do lock (ex.: re-render do tab/sidebar). Retorna unsubscribe. */
export function subscribeAdventureTourActive(fn) {
  if (typeof fn !== 'function') return () => {};
  _advTourListeners.add(fn);
  return () => _advTourListeners.delete(fn);
}

// ── Sinal: REALCE da aba Aventuras na tab bar (Fase 1.1.4.3) ───────────────────
// Diferente do lock acima: este liga SÓ no passo específico que explica a aba
// (card "Seu mapa de aventuras"), não no tour inteiro. A tab bar desenha a moldura
// decorativa (pointerEvents none) sobre o item Aventuras só quando isto é true.
let _advTabCallout = false;
const _advTabCalloutListeners = new Set();

/** Liga/desliga a moldura da aba Aventuras (só no passo do card que explica a aba). */
export function setAdventureTabCalloutActive(active) {
  const v = !!active;
  if (v === _advTabCallout) return;
  _advTabCallout = v;
  _advTabCalloutListeners.forEach((fn) => { try { fn(v); } catch { /* nunca quebra */ } });
}

/** True só durante o passo que realça a aba Aventuras. */
export function getAdventureTabCalloutActive() {
  return _advTabCallout;
}

/** Assina mudanças da moldura da aba (re-render da tab bar). Retorna unsubscribe. */
export function subscribeAdventureTabCalloutActive(fn) {
  if (typeof fn !== 'function') return () => {};
  _advTabCalloutListeners.add(fn);
  return () => _advTabCalloutListeners.delete(fn);
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
