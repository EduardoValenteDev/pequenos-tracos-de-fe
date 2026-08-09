/**
 * useSurfaceLifecycle — [F6-R3.2] contrato ÚNICO de ciclo de vida para superfícies interativas.
 *
 * POR QUE EXISTE
 * --------------
 * O app já resolvia "o app saiu / a tela perdeu o foco" cinco vezes, uma por jogo, sempre com o
 * mesmo trio de ouvintes copiado à mão (`ParesDoBeniScreen.js:322-327` é o espelho literal deste
 * hook). Duas superfícies interativas — Colorir e Ateliê — ficaram de fora e não escutam NADA:
 * abrir o Centro de Controle ou mandar o app para segundo plano passa despercebido justamente onde
 * existe pintura de criança não salva. Este hook fecha esse vão sem criar uma sexta variação do
 * padrão.
 *
 * CONTRATO (o que este hook faz — e o que se recusa a fazer)
 * ---------------------------------------------------------
 *  1. Observa `AppState` (app ativo × segundo plano) e o foco de navegação, e combina os dois num
 *     único conceito: a superfície está DISPONÍVEL quando o app está ativo e (se `pauseOnBlur`) a
 *     tela está focada.
 *  2. Só TRANSIÇÕES disparam retorno de chamada. Montar não é "voltar": `onForeground` nunca é
 *     chamado na montagem, senão toda tela que abre pareceria estar retomando de um segundo plano.
 *  3. Este hook NÃO salva, NÃO recarrega, NÃO descarta e NÃO reprojeta nada. Ele apenas AVISA. A
 *     decisão do que fazer é de quem o consome — e, sob `SD-8`, nenhuma dessas decisões pode
 *     destruir pintura existente.
 *  4. Os retornos de chamada são lidos por ref: o ouvinte de `AppState` é registrado UMA vez e
 *     nunca dispara uma versão velha. O consumidor não precisa memoizar nada para adotar o hook.
 *  5. Zero dependência nova: `AppState` é do próprio react-native e `useIsFocused` vem do
 *     `@react-navigation/native` que o app já usa.
 *
 * Uso: `const { appState, isActive, isFocused } = useSurfaceLifecycle({ onBackground, onForeground })`.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export function useSurfaceLifecycle({ onBackground, onForeground, pauseOnBlur = true } = {}) {
  const [appState, setAppState] = useState(() => AppState.currentState || 'active');
  const isFocused = useIsFocused();

  const onBackgroundRef = useRef(onBackground);
  const onForegroundRef = useRef(onForeground);
  onBackgroundRef.current = onBackground;
  onForegroundRef.current = onForeground;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (proximo) => setAppState(proximo));
    // O estado pode ter mudado entre o primeiro render e o registro do ouvinte: relê uma vez para
    // não nascer com uma fotografia velha.
    setAppState(AppState.currentState || 'active');
    return () => { if (sub && typeof sub.remove === 'function') sub.remove(); };
  }, []);

  const isActive = appState === 'active';
  const disponivel = isActive && (pauseOnBlur ? isFocused : true);

  // `null` = ainda não houve primeira leitura. Sem isso, a montagem contaria como transição.
  const anteriorRef = useRef(null);
  useEffect(() => {
    const antes = anteriorRef.current;
    if (antes === disponivel) return;
    anteriorRef.current = disponivel;
    if (antes === null) return;
    if (disponivel) onForegroundRef.current?.();
    else onBackgroundRef.current?.();
  }, [disponivel]);

  return { appState, isActive, isFocused };
}

export default useSurfaceLifecycle;
