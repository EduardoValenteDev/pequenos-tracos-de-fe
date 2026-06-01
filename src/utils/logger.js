/**
 * logger.js — Helper centralizado de logs para o app.
 *
 * Regras:
 *   - Em produção (__DEV__ === false): nenhum log verboso.
 *   - Em desenvolvimento: logs normais.
 *   - Nunca logar dados pessoais de crianças, tokens, progresso individual
 *     sensível, conteúdo de desenhos ou dados de compra.
 *
 * Uso:
 *   import { log, warn } from '../utils/logger';
 *   log('MinhaFuncao:', erro);   // equivale a console.log em __DEV__
 *   warn('ProgressContext:', e); // equivale a console.warn em __DEV__
 */

export function log(...args) {
  if (__DEV__) console.log(...args);
}

export function warn(...args) {
  if (__DEV__) console.warn(...args);
}

export function error(...args) {
  if (__DEV__) console.error(...args);
}
