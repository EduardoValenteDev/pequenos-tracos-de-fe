/**
 * useImeOcclusion — contrato de OCLUSÃO POR IME (Fase 6 · F6-SG-C · CAUSA D2).
 *
 * Responde uma pergunta só, e responde para o app inteiro: **quanto da janela o
 * teclado está cobrindo agora, e que faixa sobrou para pôr conteúdo alcançável?**
 *
 * ─── POR QUE ESTE MÓDULO EXISTE ────────────────────────────────────────────────
 *
 * Na campanha física de 2026-08-21, o sheet "Nomeie seu desenho" do Ateliê apareceu
 * DEBAIXO do teclado: o campo e o botão "Guardar desenho" ficaram fora de alcance.
 * O desenho foi salvo assim mesmo — pela tecla Done da própria IME —, o que separa
 * com precisão o que estava íntegro (persistência) do que estava quebrado
 * (composição responsiva com o teclado aberto).
 *
 * A causa NÃO era falta de espaço. Em paisagem sobravam ~417 dp acima do teclado
 * para um cartão de ~185 dp. A causa era ANCORAGEM, e a cadeia é esta:
 *
 *   1. `ReactRootView.java:890-932` emite `keyboardDidShow` com dois campos úteis:
 *      `endCoordinates.height`, que vale `imeInsets.bottom - barInsets.bottom`, e
 *      `screenY`, tirado de `getWindowVisibleDisplayFrame()`.
 *   2. `ReactSurfaceView.kt` não sobrescreve `onAttachedToWindow`, então o
 *      `CustomGlobalLayoutListener` continua registrado sob bridgeless/Fabric — o
 *      evento EXISTE na New Architecture.
 *   3. Sob edge-to-edge do Android 16 a janela NÃO é redimensionada pela IME. O
 *      logcat da campanha mostra o mesmo `mDisplayFrame` antes e depois de
 *      `WindowInsets changed: ime:[...]`. Logo `getWindowVisibleDisplayFrame()` não
 *      encolhe e `screenY` fica ENVENENADO.
 *   4. `KeyboardAvoidingView` consome EXCLUSIVAMENTE `screenY`. Com `screenY`
 *      envenenado ele calcula um deslocamento de ~24 dp: inerte na prática.
 *
 * Ou seja: o campo que serve está certo, e o mecanismo pronto do React Native usa o
 * outro. Este módulo lê o campo certo e transforma-o em geometria.
 *
 * ─── AS TRÊS REGRAS DO CONTRATO ───────────────────────────────────────────────
 *
 * (1) PROVENIÊNCIA — a oclusão nasce da ALTURA do evento, nunca de `screenY`, e é
 *     reconstituída até o retângulo REAL do teclado. No Android o evento já
 *     descontou a barra do sistema (`- barInsets.bottom`), então ela precisa
 *     voltar; no iOS a altura já vem cheia e não há o que devolver.
 *
 * (2) SUBSTITUIÇÃO, NÃO SOMA — o teclado ocupa o mesmo canto de tela que a barra de
 *     navegação. A reserva inferior é o MAIOR dos dois, jamais a soma: somar
 *     desconta a mesma faixa duas vezes; ignorar o piso joga o conteúdo em cima da
 *     barra de gestos assim que o teclado fecha.
 *
 * (3) DEGRADAÇÃO SEGURA — enquanto a IME nunca foi medida NESTA SESSÃO do app, o
 *     conteúdo vai para o TOPO da banda, que é a única região que teclado nenhum
 *     ocupa. Assim a correção não depende do único elo que leitura estática não
 *     fecha (se `onGlobalLayout` dispara numa travessia que não redimensiona):
 *     com métrica o cartão encosta no teclado, sem métrica ele fica no topo, e nos
 *     dois ramos o CTA é alcançável.
 *
 * As três funções puras moram fora do hook de propósito: `G-CVS-5` as carrega do
 * fonte real e as executa em Node, contra retângulos, incluindo um cenário em que o
 * teclado está na tela e o app não recebeu métrica nenhuma. A regra é geométrica e
 * vale para qualquer teclado — nenhuma medida de aparelho entra no código.
 */
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const numero = (v) => (Number.isFinite(v) && v > 0 ? v : 0);

/*
 * Bandeira de SESSÃO: `true` assim que QUALQUER superfície do app recebeu um evento de
 * teclado desde a abertura.
 *
 * A pergunta que a regra (3) faz é "este runtime reporta a IME?". Isso é propriedade do
 * AMBIENTE — versão do Android, edge-to-edge, arquitetura —, não da montagem da tela. Uma
 * bandeira por montagem responderia "não sei" toda vez que o Ateliê abrisse, e o cartão
 * nasceria no topo para só então descer até o teclado: um deslocamento de centenas de dp
 * em TODA gravação, pago para reaprender algo que o app já sabia.
 *
 * Com escopo de sessão o ramo seguro continua inteiro — num runtime que não reporta, nada
 * nunca liga a bandeira e o cartão fica no topo, alcançável — e o caminho saudável fica
 * sem salto: o cartão abre embaixo, como sempre foi, e SOBE junto com o teclado.
 *
 * O preço honesto é uma transição visível na primeira vez que um teclado aparece na sessão,
 * que é exatamente o instante em que o app ainda não tem como saber a resposta.
 */
let runtimeJaReportouIme = false;

/**
 * Retângulo REAL de oclusão do teclado, medido a partir da borda inferior da janela.
 *
 * `keyboardHeight` é `endCoordinates.height` do evento; `safeBottom` é o inset
 * inferior do sistema; `platform` é `Platform.OS`. Teclado fechado é `0` — inventar
 * teclado é tão errado quanto ignorá-lo.
 */
export function resolveImeOcclusion({ keyboardHeight, safeBottom, platform }) {
  const altura = numero(keyboardHeight);
  if (altura <= 0) return 0;
  return platform === 'android' ? altura + numero(safeBottom) : altura;
}

/**
 * Faixa da janela que sobra para conteúdo alcançável: abaixo do inset superior e
 * acima do que estiver ocupando a borda inferior (teclado OU barra do sistema).
 *
 * Devolve `{ top, bottomReserve, height }` — `bottomReserve` é o que o container
 * precisa reservar embaixo para que `flex-end` signifique "encostado no teclado" em
 * vez de "no rodapé de uma janela que não encolheu".
 */
export function computeAvailableBand({ viewportHeight, safeTop, safeBottom, imeOcclusion }) {
  const janela = numero(viewportHeight);
  const topo = numero(safeTop);
  const bottomReserve = Math.max(numero(imeOcclusion), numero(safeBottom));
  return { top: topo, bottomReserve, height: Math.max(0, janela - topo - bottomReserve) };
}

/**
 * Onde o cartão se ancora dentro da banda, e qual é o teto de altura dele.
 *
 * `imeEverMeasured` é o interruptor da regra (3): enquanto nenhum evento de teclado
 * chegou nesta sessão, o app não sabe se há teclado na tela — e o topo da banda é
 * o único lugar em que a resposta não importa.
 */
export function computeSheetPlacement({ bandHeight, imeEverMeasured, margin }) {
  return {
    align: imeEverMeasured ? 'flex-end' : 'flex-start',
    maxHeight: Math.max(0, numero(bandHeight) - numero(margin)),
  };
}

/**
 * Assina os eventos de teclado e devolve `{ occlusion, everMeasured }` já
 * reconstituído para o retângulo real, em dp.
 *
 * `everMeasured` vira `true` no PRIMEIRO evento de teclado da SESSÃO — inclusive
 * num `Hide`, porque receber o `Hide` já prova que o mecanismo responde.
 */
export function useImeOcclusion() {
  const insets = useSafeAreaInsets();
  const [evento, setEvento] = useState(() => ({ height: 0, everMeasured: runtimeJaReportouIme }));

  useEffect(() => {
    const iOS = Platform.OS === 'ios';
    const abrir = iOS ? 'keyboardWillShow' : 'keyboardDidShow';
    const fechar = iOS ? 'keyboardWillHide' : 'keyboardDidHide';
    const registra = (altura) => {
      runtimeJaReportouIme = true;
      setEvento({ height: altura, everMeasured: true });
    };
    const abriu = (e) => registra(numero(e?.endCoordinates?.height));
    const fechou = () => registra(0);
    const assinaAbre = Keyboard.addListener(abrir, abriu);
    const assinaFecha = Keyboard.addListener(fechar, fechou);
    return () => { assinaAbre.remove(); assinaFecha.remove(); };
  }, []);

  return useMemo(() => ({
    occlusion: resolveImeOcclusion({
      keyboardHeight: evento.height, safeBottom: insets.bottom, platform: Platform.OS,
    }),
    everMeasured: evento.everMeasured,
  }), [evento.height, evento.everMeasured, insets.bottom]);
}
