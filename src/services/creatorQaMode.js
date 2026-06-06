/**
 * creatorQaMode.js — Modo Criador / QA local (override de permissão para testes).
 *
 * Permite que o criador/testador veja TODO o conteúdo Premium NESTE aparelho,
 * durante o desenvolvimento, SEM tocar no paywall global nem marcar compra real.
 *
 * Princípios de segurança:
 *   - Só PODE ser usado em ambiente permitido: __DEV__ ou a flag de build
 *     EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE === 'true'. (A flag NÃO é segredo.)
 *   - Em produção sem a flag, o modo é SEMPRE ignorado — mesmo que exista um
 *     valor salvo no AsyncStorage.
 *   - É apenas um OVERRIDE de permissão local. Nunca grava plano Premium, nunca
 *     marca compra, nunca simula recibo de loja.
 *
 * A camada central de acesso (accessControl.isPremiumUser) consulta este módulo
 * de forma SÍNCRONA — por isso o valor fica em memória, carregado no boot.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ptf_creator_qa_mode';

let _enabled = false; // valor em memória (lido de forma síncrona)
let _loaded = false;

/** Ambiente onde o Modo Criador PODE existir. Nunca liga sozinho em produção. */
export function isCreatorQaModeAllowed() {
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  const buildFlag = process.env.EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE === 'true';
  return dev || buildFlag;
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
  return _enabled;
}

/** True se o valor já foi carregado do storage (uso opcional). */
export function isCreatorQaModeLoaded() {
  return _loaded;
}
