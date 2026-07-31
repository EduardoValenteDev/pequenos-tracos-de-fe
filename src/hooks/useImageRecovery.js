/**
 * useImageRecovery — [P3J-R] RECUPERAÇÃO LIMITADA de imagem que falhou ao carregar.
 *
 * POR QUE EXISTE
 * --------------
 * Na validação física do P3J, com a rede interrompida, a casca do app (mapa, marcadores, Benis,
 * capas) sumiu — e NÃO voltou quando a rede retornou. A ausência de retorno é o defeito real: uma
 * falha transitória de carregamento virava estado permanente, porque nenhuma superfície tentava de
 * novo. Este hook dá à imagem um número PEQUENO e FINITO de novas tentativas.
 *
 * CONTRATO (o que este hook faz — e o que se recusa a fazer)
 * ---------------------------------------------------------
 *  1. Só age depois de uma falha REAL (`failed`); imagem carregada nunca é tocada.
 *  2. Tentativas são CONTADAS e têm teto (`maxAttempts`) — nunca laço infinito.
 *  3. O token cresce no máximo `maxAttempts` vezes por orçamento; não é chave sempre crescente.
 *  4. Os atrasos são poucos e espaçados (não é polling): ver `RETRY_DELAYS_MS`.
 *  5. Voltar ao primeiro plano (AppState 'active') é SINAL SEGURO e renova o orçamento UMA vez —
 *     é a aproximação disponível de "a rede pode ter voltado", já que o app não possui, nem passa
 *     a possuir, dependência capaz de observar conectividade.
 *  6. Trocar de `sourceKey` zera tudo (imagem nova, história nova).
 *  7. Nada aqui reinstala pack, limpa índice ou altera entrada `ready`: o escopo é a CAMADA VISUAL.
 *  8. Zero dependência nova: `AppState` é do próprio react-native, já usado no app.
 *
 * Uso: o consumidor passa `failed` (houve onError) e usa `token` como `key` do <Image>. Cada novo
 * token remonta APENAS a imagem que está em erro — imagens já carregadas não piscam.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

/** Duas tentativas automáticas por orçamento. Curta para o soluço; longa para a rede voltar. */
export const RETRY_DELAYS_MS = [1500, 6000];
export const MAX_RECOVERY_ATTEMPTS = RETRY_DELAYS_MS.length;

export function useImageRecovery({ sourceKey, failed, maxAttempts = MAX_RECOVERY_ATTEMPTS } = {}) {
  const [attempt, setAttempt] = useState(0);
  // `budget` é o orçamento vigente. Voltar ao primeiro plano abre um orçamento NOVO (e só então o
  // contador volta a zero) — sem isso, uma falha no início da sessão ficaria eterna.
  const [budget, setBudget] = useState(0);
  const timerRef = useRef(null);

  const limite = Number.isFinite(maxAttempts) && maxAttempts > 0 ? Math.trunc(maxAttempts) : 0;

  // Source diferente → estado limpo. Nunca herda erro nem contador da imagem anterior.
  useEffect(() => {
    setAttempt(0);
    setBudget(0);
  }, [sourceKey]);

  // Tentativa automática, LIMITADA. Só arma o timer quando ainda há orçamento; ao esgotar, para de
  // vez e a imagem permanece no fallback até um sinal seguro (foreground/novo source).
  useEffect(() => {
    if (!failed || attempt >= limite) return undefined;
    const atraso = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
    timerRef.current = setTimeout(() => setAttempt((n) => (n < limite ? n + 1 : n)), atraso);
    return () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  }, [failed, attempt, limite, budget]);

  // `failed` lido por ref: o ouvinte de AppState é registrado UMA vez e não pode enxergar um
  // `failed` velho — nem, pior, renovar orçamento de imagem que está perfeitamente carregada.
  const failedRef = useRef(false);
  failedRef.current = failed === true;

  // SINAL SEGURO: primeiro plano. Renova o orçamento UMA vez por transição, e SOMENTE se ainda
  // houver falha — voltar ao app com tudo carregado não remonta nada (capa carregada não pisca).
  useEffect(() => {
    let anterior = AppState.currentState;
    const sub = AppState.addEventListener('change', (proximo) => {
      const voltou = anterior !== 'active' && proximo === 'active';
      anterior = proximo;
      if (voltou && failedRef.current) setBudget((b) => b + 1);
    });
    return () => { if (sub && typeof sub.remove === 'function') sub.remove(); };
  }, []);

  // Orçamento novo com falha em aberto → zera o contador (uma vez), liberando novas tentativas.
  const budgetAplicadoRef = useRef(0);
  useEffect(() => {
    if (budget === budgetAplicadoRef.current) return;
    budgetAplicadoRef.current = budget;
    if (failed) setAttempt(0);
  }, [budget, failed]);

  return {
    // Muda só quando uma nova tentativa é concedida. Serve como `key` do <Image> em erro.
    token: `${budget}:${attempt}`,
    attempt,
    esgotado: attempt >= limite,
  };
}

export default useImageRecovery;
