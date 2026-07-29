/**
 * creatorQaMode.js — Modo Criador / QA local (override de permissão para testes).
 *
 * Permite que o criador/testador veja TODO o conteúdo Premium NESTE aparelho,
 * durante o desenvolvimento, SEM tocar no paywall global nem marcar compra real.
 *
 * Princípios de segurança:
 *   - Só PODE ser usado em ambiente permitido: __DEV__ ou um build Release de QA
 *     interno que satisfaça o QUÍNTUPLO gate CREATOR_QA_MODE_RELEASE_ENABLED
 *     (src/config/featureFlags.js). Nenhuma flag isolada libera o modo — em
 *     particular, EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE sozinha é inerte.
 *   - Em produção, o modo é SEMPRE ignorado — mesmo que exista um valor salvo
 *     no AsyncStorage por um build anterior.
 *   - É apenas um OVERRIDE de permissão local. Nunca grava plano Premium, nunca
 *     marca compra, nunca simula recibo de loja.
 *
 * A camada central de acesso (accessControl.isPremiumUser) consulta este módulo
 * de forma SÍNCRONA — por isso o valor fica em memória, carregado no boot.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CREATOR_QA_MODE_RELEASE_ENABLED } from '../config/featureFlags';

const STORAGE_KEY = '@ptf_creator_qa_mode';

let _enabled = false; // valor em memória (lido de forma síncrona)
let _loaded = false;

// Assinantes (ex.: banner global) — notificados quando o modo liga/desliga.
const _listeners = new Set();
function notifyListeners() {
  _listeners.forEach(fn => { try { fn(_enabled); } catch { /* nunca quebra */ } });
}

/** Inscreve um callback para mudanças do Modo Criador. Retorna unsubscribe. */
export function subscribeCreatorQaMode(cb) {
  if (typeof cb !== 'function') return () => {};
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

/**
 * Ambiente onde o Modo Criador PODE existir. Nunca liga sozinho em produção.
 *   - Em desenvolvimento (`__DEV__`), continua liberado como sempre foi.
 *   - Em Release, só o perfil interno `preview-criador` com as 5 flags simultâneas
 *     (CREATOR_QA_MODE_RELEASE_ENABLED) autoriza. `preview` e `production` = false.
 */
export function isCreatorQaModeAllowed() {
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev || CREATOR_QA_MODE_RELEASE_ENABLED;
}

/**
 * Carrega o valor persistido para a memória (chamar uma vez no boot).
 * Em ambiente não permitido, força desligado e ignora o que estiver salvo.
 */
export async function loadCreatorQaMode() {
  try {
    if (!isCreatorQaModeAllowed()) {
      _enabled = false;
      return false;
    }
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    _enabled = raw === 'true';
  } catch {
    _enabled = false;
  } finally {
    _loaded = true;
  }
  notifyListeners();
  return _enabled;
}

/**
 * True se o Modo Criador está ATIVO e permitido neste ambiente. Síncrono.
 * Em produção sem flag → sempre false (mesmo com valor salvo).
 */
export function isCreatorQaModeEnabled() {
  if (!isCreatorQaModeAllowed()) return false;
  return _enabled === true;
}

/** Liga/desliga o modo. Só persiste e surte efeito quando permitido. */
export async function setCreatorQaModeEnabled(value) {
  if (!isCreatorQaModeAllowed()) {
    _enabled = false;
    return false;
  }
  _enabled = !!value;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, _enabled ? 'true' : 'false');
  } catch {
    // falha de storage não deve quebrar o app — mantém valor em memória
  }
  notifyListeners();
  return _enabled;
}

/** True se o valor já foi carregado do storage (uso opcional). */
export function isCreatorQaModeLoaded() {
  return _loaded;
}
