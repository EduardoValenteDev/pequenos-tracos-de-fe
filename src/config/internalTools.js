/**
 * internalTools.js — M1: FONTE ÚNICA do gate de ferramentas internas ("Administração (dev)").
 *
 * `isInternalToolsEnabled()` controla:
 *   - a seção "Administração (dev)" na Área dos Pais;
 *   - o registro das rotas internas (ColoringQa, PackSandboxDev).
 *
 * Cada ferramenta MANTÉM seu gate específico como DEFESA EM PROFUNDIDADE:
 *   - Modo Criador → `isCreatorQaModeAllowed()` (creatorQaMode);
 *   - packs → `isPackSandboxDevEnabled()` (packSandboxDevService, quádruplo gate release-safe).
 *
 * ⚠️ Em produção/screenshot (sem `__DEV__` e sem flags) → SEMPRE `false`: nenhuma ferramenta
 * interna é exibida ou acessível. A proteção é BUILD-TIME (não há auth de admin no app final).
 *
 * Composição LEVE (não importa `packSandboxDevService`, que puxa deps nativas): usa
 * `isCreatorQaModeAllowed` + `RELEASE_PACK_QA_ENABLED`. É equivalente a
 * `__DEV__ || isCreatorQaModeAllowed() || isPackSandboxDevEnabled()` porque o ramo DEV do
 * pack sandbox (`__DEV__ && ENABLE_PACK_SANDBOX`) já está coberto por `__DEV__`.
 */
import { isCreatorQaModeAllowed } from '../services/creatorQaMode';
import { RELEASE_PACK_QA_ENABLED } from './featureFlags';

/** True se as ferramentas internas PODEM existir neste build. Produção sem flags → false. */
export function isInternalToolsEnabled() {
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev || isCreatorQaModeAllowed() || RELEASE_PACK_QA_ENABLED;
}
