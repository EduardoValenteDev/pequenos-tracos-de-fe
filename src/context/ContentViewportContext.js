import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useWindowBand, bandForWidth } from '../hooks/useWindowBand';

/**
 * ContentViewportContext — a REGIÃO que o conteúdo realmente recebe (Fase 6 · `F6.2`).
 *
 * ─── POR QUE ISTO EXISTE ────────────────────────────────────────────────────────
 *
 * `WINDOW VIEWPORT ≠ CONTENT VIEWPORT`. Quando o shell publica a navegação como
 * BARRA LATERAL, a janela deixa de descrever o espaço da tela: a barra é IRMÃ da
 * tela dentro de uma linha (`tabBarPosition: 'left'` → `flexDirection: 'row'`), e
 * o que sobra para a tela é a janela MENOS a barra. Quem compõe pela janela compõe
 * por um número que ninguém lhe entregou.
 *
 * O defeito não estava no shell — ele SEMPRE reservou o espaço por flex, e a
 * reserva foi conferida no fonte da biblioteca. Estava no idioma dos consumidores:
 * os quatro arquétipos e o `ContentContainer` liam a JANELA quando ninguém lhes
 * passava medida. Corrigir tela a tela foi o que `F6-SG-C` fez em Início e Brincar
 * (`G-RSP-8`), e é exatamente o que esta fase proíbe: a área disponível tem de
 * SURGIR da arquitetura de layout, não de cada tela lembrar de medir.
 *
 * ─── COMO A REGIÃO É OBTIDA ─────────────────────────────────────────────────────
 *
 * Por MEDIÇÃO, nunca por aritmética. Não existe aqui — e não pode passar a
 * existir — nenhuma subtração da largura da barra (`G-SID-3` · `RG-12` ·
 * restrição 4 de §19.1): a barra DECLARA quanto ocupa, jamais quanto sobra. O
 * provedor é uma `View` `flex: 1` montada no lugar exato onde o navegador entrega
 * a cena, e o `onLayout` dela É a resposta. Nenhuma condição por aparelho,
 * modelo, resolução ou nome de dispositivo participa da conta — não há conta.
 *
 * ─── A MEDIDA É CARIMBADA (`F6-SG-C · CAUSA B` · `G-RSP-9`) ─────────────────────
 *
 * Entre `onLayout → setState` e `useWindowDimensions` existe a defasagem de UM
 * quadro: ao girar, o quadro seguinte tem JANELA NOVA e MEDIDA VELHA. Por isso
 * cada medida guarda a janela em que foi tirada, e só vale enquanto o carimbo bate
 * com a janela corrente. Quando não bate, a resposta é a JANELA — a única grandeza
 * que pertence, com certeza, ao quadro atual. É a mesma política já lacrada no
 * mapa, no tabuleiro e na cena, aplicada agora à fundação.
 *
 * Rotação, portanto, NÃO é gatilho de correção de estado: ela apenas invalida um
 * carimbo, e o `onLayout` responde no ritmo dele.
 *
 * ─── FORA DE UM PROVEDOR ────────────────────────────────────────────────────────
 *
 * `useContentViewport()` cai na janela, e isso é CORRETO, não tolerado: telas de
 * `Stack` e `Modal` ocupam a janela inteira — não há barra lateral entre elas e a
 * borda. O contrato existe para distinguir os dois casos, não para esconder um.
 *
 * ─── O QUE ESTE MÓDULO NÃO PUBLICA, DE PROPÓSITO ────────────────────────────────
 *
 * `sidebarWidth` e `navigationMode` NÃO entram no contrato. Publicá-los criaria
 * duas coisas indesejadas: um *token* declarado e inerte (`P-82`/`P-148`), porque
 * nenhum consumidor precisa deles; e a porta aritmética que `G-SID-3` fechou. A
 * área segura também não: o dono único dela continua sendo `AppScreen` — este
 * módulo não lê, não aplica e não republica inset nenhum.
 *
 * ─── IDIOMA DO ARQUIVO ──────────────────────────────────────────────────────────
 *
 * A POLÍTICA (pura, testável fora do React) vem ANTES do componente exportado por
 * omissão, como nos quatro arquétipos: é a região que os arneses conseguem
 * carregar. E ela é a ÚNICA parte do arquivo em que a expressão de exportação por
 * omissão aparece — escrevê-la aqui em cima, mesmo entre crases num comentário,
 * faria o `loadModule` cortar o fonte no lugar errado e o arnês morrer com um
 * erro de sintaxe que não descreve defeito nenhum.
 */

/** De onde veio a grandeza publicada — informação de PROVA, não de decoração. */
export const CONTENT_VIEWPORT_SOURCE = Object.freeze({
  MEASURED: 'measured',
  WINDOW: 'window',
});

/**
 * A política do carimbo, pura.
 *
 *   `measure` — `{ width, height, janelaWidth, janelaHeight }` ou nulo.
 *   `window`  — `{ width, height }` da janela CORRENTE.
 *
 * A medida só é adotada quando foi tirada NESTA janela e descreve uma região real.
 * Caso contrário vale a janela, com `measured: false` para quem quiser esperar.
 */
export function resolveContentViewport({ measure, window }) {
  const janelaW = Number.isFinite(window?.width) ? window.width : 0;
  const janelaH = Number.isFinite(window?.height) ? window.height : 0;

  const daJanela = Boolean(measure)
    && measure.janelaWidth === janelaW
    && measure.janelaHeight === janelaH;
  const real = Boolean(measure)
    && Number.isFinite(measure.width) && measure.width > 0
    && Number.isFinite(measure.height) && measure.height > 0;
  const vale = daJanela && real;

  const width = vale ? measure.width : janelaW;
  const height = vale ? measure.height : janelaH;

  return Object.freeze({
    width,
    height,
    band: bandForWidth(width),
    isLandscape: width > height,
    measured: vale,
    source: vale ? CONTENT_VIEWPORT_SOURCE.MEASURED : CONTENT_VIEWPORT_SOURCE.WINDOW,
  });
}

const ContentViewportContext = React.createContext(null);

/**
 * Envolve a cena entregue pelo navegador e publica a região dela.
 *
 * Montado UMA vez, no `screenLayout` do `Tab.Navigator`: é o ponto em que a barra
 * lateral já consumiu o espaço dela por flex e o restante pertence à tela.
 */
export default function ContentViewportProvider({ children, style }) {
  const { width, height } = useWindowBand();
  const [medida, setMedida] = React.useState(null);

  const aoMedir = React.useCallback((evento) => {
    const regiao = evento?.nativeEvent?.layout;
    if (!regiao) return;
    setMedida((anterior) => (
      anterior
        && anterior.width === regiao.width
        && anterior.height === regiao.height
        && anterior.janelaWidth === width
        && anterior.janelaHeight === height
        ? anterior
        : { width: regiao.width, height: regiao.height, janelaWidth: width, janelaHeight: height }
    ));
  }, [width, height]);

  const valor = React.useMemo(
    () => resolveContentViewport({ measure: medida, window: { width, height } }),
    [medida, width, height],
  );

  return (
    <ContentViewportContext.Provider value={valor}>
      <View style={[styles.regiao, style]} onLayout={aoMedir}>
        {children}
      </View>
    </ContentViewportContext.Provider>
  );
}

/**
 * A região onde este componente vive: `{ width, height, band, isLandscape,
 * measured, source }`.
 *
 * `band` é derivada da largura da REGIÃO, e a derivação é a do dono
 * (`bandForWidth`) — nenhum quarto corte nasce aqui (`G-RSP-7` · `SD-11`).
 */
export function useContentViewport() {
  const doProvedor = React.useContext(ContentViewportContext);
  const janela = useWindowBand();
  return React.useMemo(
    () => doProvedor ?? resolveContentViewport({
      measure: null,
      window: { width: janela.width, height: janela.height },
    }),
    [doProvedor, janela.width, janela.height],
  );
}

const styles = StyleSheet.create({
  regiao: { flex: 1 },
});
