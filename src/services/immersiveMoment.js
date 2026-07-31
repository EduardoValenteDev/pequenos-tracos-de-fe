/**
 * immersiveMoment.js — SINAL de "momento imersivo em cena" (§Parte 13).
 *
 * Existe por um motivo concreto: durante os atos da celebração do Colorir 60 a tela inteira vira
 * história — o cabeçalho some, os controles somem — mas o SELO "MODO CRIADOR ATIVO", que é um overlay
 * global montado acima de tudo no navegador, continuava aparecendo por cima da festa. Este módulo é
 * a ponte mínima entre "uma tela entrou em um momento imersivo" e "os enfeites globais de
 * desenvolvimento se recolhem", SEM que a tela precise conhecer o banner nem o banner conhecer a tela.
 *
 * CONTRATO:
 *   - CONTADOR, não booleano: `beginImmersiveMoment()` devolve a função que ENCERRA aquele momento
 *     (idempotente). Dois momentos simultâneos não se atropelam — o sinal só desliga quando o último
 *     termina. Encerrar duas vezes não zera o contador de outra tela.
 *   - SÓ APRESENTAÇÃO: não decide autorização, não persiste nada, não conhece o Modo Criador. Quem
 *     assina decide o que fazer. Um assinante que lança NÃO derruba os demais.
 *   - Sem I/O e sem React: pode ser chamado de efeito, de handler ou de limpeza de desmontagem.
 *
 * NÃO É um modo de tela cheia do sistema: não mexe em status bar, orientação nem navegação.
 */

let _depth = 0;
const _listeners = new Set();

function notify() {
  const active = _depth > 0;
  _listeners.forEach((fn) => { try { fn(active); } catch { /* um assinante ruim nunca derruba os outros */ } });
}

/** True enquanto houver ao menos um momento imersivo em cena. Síncrono. */
export function isImmersiveMomentActive() {
  return _depth > 0;
}

/**
 * Abre um momento imersivo e devolve o ENCERRADOR daquele momento (idempotente — chamar duas vezes
 * não desconta duas). Use como retorno de `useEffect` para que a saída da tela SEMPRE restaure.
 */
export function beginImmersiveMoment() {
  _depth += 1;
  if (_depth === 1) notify();
  let ended = false;
  return function endImmersiveMoment() {
    if (ended) return;
    ended = true;
    _depth = Math.max(0, _depth - 1);
    if (_depth === 0) notify();
  };
}

/** Inscreve um callback para mudanças do sinal. Retorna a função de cancelamento. */
export function subscribeImmersiveMoment(cb) {
  if (typeof cb !== 'function') return () => {};
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}
