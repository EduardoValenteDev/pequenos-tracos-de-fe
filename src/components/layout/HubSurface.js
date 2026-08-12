import React from 'react';
import { View, StyleSheet } from 'react-native';
import { grid } from '../../theme/tokens';
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

/**
 * Composição efetiva do Hub: o menor entre o que a faixa permite, o que a largura
 * comporta com o cartão ainda legível, e o que o inventário realmente tem.
 *
 * `availableWidth` é medida CONTÍNUA e real — largura da região onde a grade vive.
 * `minItemWidth` é a largura abaixo da qual o cartão deixa de ser legível; quem a
 * conhece é a tela, não o arquétipo.
 */
export function hubColumns({ band, availableWidth, itemCount, minItemWidth, gap = 0 }) {
  const teto = hubColumnCeiling(band);
  if (!Number.isFinite(availableWidth) || !Number.isFinite(gap) || !(minItemWidth > 0)) return 1;

  // n colunas exigem n cartões + (n-1) intervalos; daí o `+ gap` dos dois lados.
  const cabimento = Math.floor((availableWidth + gap) / (minItemWidth + gap));
  const inventario = Number.isFinite(itemCount) && itemCount > 0 ? itemCount : 1;

  return Math.max(1, Math.min(teto, cabimento, inventario));
}

/**
 * Props:
 *   children       — nó, ou função que recebe `{ columns, band, availableWidth }`
 *   itemCount      — quantidade real de itens do inventário
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
  ...rest
}) {
  const { band, width } = useWindowBand();
  const largura = Number.isFinite(availableWidth) ? availableWidth : width;
  const columns = hubColumns({ band, availableWidth: largura, itemCount, minItemWidth, gap });

  return (
    <View style={[styles.grid, { gap }, style]} {...rest}>
      {typeof children === 'function' ? children({ columns, band, availableWidth: largura }) : children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
});
