import React from 'react';
import { View, StyleSheet } from 'react-native';
import { grid } from '../../theme/tokens';
import { displayTypeSizes } from './displayType';
import { useWindowBand, BANDS } from '../../hooks/useWindowBand';

/**
 * HubSurface — arquétipo da família **Hub** (Fase 6 · F6-R1.2 · F6-SG-C · TK-C-004).
 *
 * Famílias-alvo: Início, Brincar, Conquistas, Galeria do Ateliê. São superfícies de
 * ESCOLHA: a criança varre um inventário e aponta para onde quer ir.
 *
 * QUAL CARACTERÍSTICA DO CONTEÚDO GOVERNA — a quantidade real de itens e a largura
 * mínima em que o cartão continua legível. A faixa entra como TETO, não como ordem:
 * ela diz "aqui cabe no máximo isto", e o inventário e o cabimento decidem o resto.
 * É a diferença entre compor e obedecer a uma tabela.
 *
 * O teto vem de `grid` (`tokens.js`), que até aqui existia sem consumidor. Nenhum
 * número de coluna nasce neste arquivo, e nenhum corte de largura é decidido aqui:
 * a faixa chega pronta de `useWindowBand`, a única tradução de medida em política.
 *
 * Consequências que este arquétipo aceita de propósito:
 * - faixa média com cartão largo entrega UMA coluna — o teto não é uma promessa;
 * - faixa expandida com dois itens entrega DUAS — inventário pobre não vira vazio
 *   distribuído em três colunas;
 * - nunca zero colunas, por mais estreita que a janela fique.
 *
 * `TK-C-004` cria o contrato e NENHUM consumidor. A densidade real da família é
 * `TK-C-007`; a adoção em Início/Brincar/Conquistas/Galeria é `TK-C-008` (`C-C4`),
 * com validação física própria. Este arquivo não redesenha tela nenhuma.
 */

/** Teto de colunas por faixa. Os valores são de `tokens.grid` — nunca escritos aqui. */
export const HUB_COLUMN_CEILING = Object.freeze({
  [BANDS.COMPACT]: grid.phone,
  [BANDS.MEDIUM]: grid.tablet,
  [BANDS.EXPANDED]: grid.tabletL,
});

/** O teto que a faixa permite. Faixa desconhecida cai no mais conservador. */
export function hubColumnCeiling(band) {
  return HUB_COLUMN_CEILING[band] ?? grid.phone;
}

/** Quantas linhas um inventário ocupa numa dada densidade. */
export function hubRowCount(itemCount, columns) {
  return columns > 0 && itemCount > 0 ? Math.ceil(itemCount / columns) : 0;
}

/**
 * [`TK-C-007`] A última linha é onde a grade encontra o conteúdo real.
 *
 * Quatro brincadeiras em três colunas dão `3 + 1`: um cartão sozinho no fim, com
 * dois buracos ao lado. Nada nisso fere o teto da faixa nem o cabimento — e mesmo
 * assim é composição que não olhou o inventário. Duas linhas de dois ocupam a
 * MESMA altura e não deixam ninguém sozinho.
 *
 * A condição é uma só, e não tem número mágico: recuar é legítimo enquanto não
 * custar uma linha a mais. Quando custa — dez artes em três colunas — a densidade
 * vence e o órfão fica, porque encolher a grade para poupar um canto vazio
 * alongaria a página inteira numa tela que tem largura de sobra.
 *
 * Nunca recua abaixo de duas: uma coluna é a composição da faixa compacta, e
 * chegar nela por arredondamento seria desperdiçar a largura que existe.
 */
export function hubBalanced(columns, itemCount) {
  const orfao = (n) => itemCount % n === 1;
  if (!(columns > 1) || !(itemCount > columns) || !orfao(columns)) return columns;

  const linhas = hubRowCount(itemCount, columns);
  for (let n = columns - 1; n > 1; n -= 1) {
    if (hubRowCount(itemCount, n) > linhas) break;   // recuo que custa altura não é recuo
    if (!orfao(n)) return n;
  }
  return columns;
}

/**
 * Composição efetiva do Hub: o menor entre o que a faixa permite, o que a largura
 * comporta com o cartão ainda legível, e o que o inventário realmente tem — e
 * então o ajuste de última linha.
 *
 * `availableWidth` é medida CONTÍNUA e real — largura da região onde a grade vive.
 * `minItemWidth` é a largura abaixo da qual o cartão deixa de ser legível; quem a
 * conhece é a tela, não o arquétipo.
 *
 * `limitedBy` diz QUEM decidiu, e existe para que `SD-2` seja verificável em vez de
 * declarado: se a faixa fosse a regra universal, ela responderia por tudo. A ordem
 * é a do mais específico para o mais genérico — inventário, largura, faixa —, de
 * modo que a razão relatada seja sempre a mais próxima do conteúdo.
 *
 * [`TK-C-061`] `displayType` entra na composição publicada em vez de virar um
 * contrato à parte: o título de seção de um hub é decisão da MESMA pergunta que as
 * colunas — "como esta superfície se compõe nesta faixa". A conta não é feita aqui;
 * vem de `displayType.js`, o auxiliar único que o Editorial também consulta. Quem
 * renderiza o título continua sendo a tela.
 */
export function hubComposition({ band, availableWidth, itemCount, minItemWidth, gap = 0 }) {
  const teto = hubColumnCeiling(band);
  const medidaConfiavel = Number.isFinite(availableWidth) && Number.isFinite(gap) && minItemWidth > 0;

  // n colunas exigem n cartões + (n-1) intervalos; daí o `+ gap` dos dois lados.
  // Sem medida confiável não se inventa densidade: nada cabe, e o piso resolve.
  const cabimento = medidaConfiavel ? Math.floor((availableWidth + gap) / (minItemWidth + gap)) : 0;
  const inventario = Number.isFinite(itemCount) && itemCount > 0 ? itemCount : 1;

  const viavel = Math.max(1, Math.min(teto, cabimento, inventario));
  const columns = hubBalanced(viavel, inventario);

  const limitedBy =
    columns < viavel ? 'balance'
    : inventario <= viavel ? 'inventory'
    : cabimento <= viavel ? 'width'
    : 'band';

  return Object.freeze({
    columns,
    rows: hubRowCount(inventario, columns),
    ceiling: teto,
    fit: cabimento,
    inventory: inventario,
    limitedBy,
    displayType: displayTypeSizes(band),
  });
}

/** A densidade sozinha, para quem só precisa do número. */
export function hubColumns(params) {
  return hubComposition(params).columns;
}

/**
 * Distribui o inventário em linhas. É POLÍTICA, não JSX: `TrophiesScreen` já tinha
 * um fatiador embutido e preso ao número dois, e sem este aqui `TK-C-008` produziria
 * quatro fatiadores levemente diferentes em quatro telas. A última linha pode vir
 * curta — completá-la é da superfície, não da política.
 */
export function hubRows(items, columns) {
  const lista = Array.isArray(items) ? items : [];
  const passo = Math.max(1, Math.trunc(columns) || 1);
  const linhas = [];
  for (let i = 0; i < lista.length; i += passo) linhas.push(lista.slice(i, i + passo));
  return linhas;
}

/**
 * A composição do Hub para quem NÃO pode ser embrulhado. `FlatList` e `SectionList`
 * perdem a virtualização dentro de um contêiner que empilha tudo de uma vez, e
 * `TK-C-008` exige as listas virtualizadas preservadas. O contrato é o mesmo; muda
 * só quem o consome — a lista pede a densidade e continua sendo a lista.
 */
export function useHubComposition({ itemCount, minItemWidth, gap = 0, availableWidth }) {
  const { band, width } = useWindowBand();
  const largura = Number.isFinite(availableWidth) ? availableWidth : width;
  return hubComposition({ band, availableWidth: largura, itemCount, minItemWidth, gap });
}

/**
 * O inventário são os PRÓPRIOS filhos. Adotar a família é embrulhar o que a tela já
 * renderiza — sem mover JSX para arrays, sem `renderItem`, sem inventar identificador
 * novo: `React.Children.toArray` já entrega os nós com chave estável pela posição, e
 * a lista de destinos de um hub não se reordena entre renderizações.
 *
 * Props:
 *   children       — os destinos; ou uma função que recebe a composição (escape)
 *   itemCount      — inventário declarado, quando os filhos não o representam
 *   minItemWidth   — largura mínima legível do cartão desta tela
 *   gap            — intervalo entre cartões (a tela decide; nenhum padrão inventado)
 *   availableWidth — largura real da região; sem ela, vale a largura da janela
 */
export default function HubSurface({
  children,
  itemCount,
  minItemWidth,
  gap = 0,
  availableWidth,
  style,
  rowStyle,
  ...rest
}) {
  const { band, width } = useWindowBand();
  const largura = Number.isFinite(availableWidth) ? availableWidth : width;
  const ehFuncao = typeof children === 'function';
  const nos = ehFuncao ? [] : React.Children.toArray(children);
  const inventario = Number.isFinite(itemCount) ? itemCount : nos.length;
  const composicao = hubComposition({ band, availableWidth: largura, itemCount: inventario, minItemWidth, gap });

  if (ehFuncao) {
    return (
      <View style={[styles.stack, { gap }, style]} {...rest}>
        {children({ ...composicao, band, availableWidth: largura })}
      </View>
    );
  }

  // Uma coluna é uma pilha: nada de linhas de célula única, que só acrescentariam
  // duas Views por destino sem mudar um pixel do que a criança vê.
  if (composicao.columns <= 1) {
    return <View style={[styles.stack, { gap }, style]} {...rest}>{nos}</View>;
  }

  return (
    <View style={[styles.stack, { gap }, style]} {...rest}>
      {hubRows(nos, composicao.columns).map((linha, iLinha) => (
        <View key={`hub-row-${linha[0] ? linha[0].key : iLinha}`} style={[styles.row, { gap }, rowStyle]}>
          {linha.map((no) => <View key={no.key} style={styles.cell}>{no}</View>)}
          {/* A última linha curta ganha células vazias: sem elas o cartão solitário
              esticaria pela linha inteira e a grade perderia o alinhamento. */}
          {Array.from({ length: composicao.columns - linha.length }, (_, i) => (
            <View key={`hub-fill-${i}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  // Células iguais sem medir: o intervalo é do `gap`, o resto se divide por igual.
  cell: { flex: 1 },
});
