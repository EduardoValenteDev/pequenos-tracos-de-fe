import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useWindowBand, BANDS } from '../../hooks/useWindowBand';

/**
 * ImmersiveSurface — arquétipo da família **Imersiva** (Fase 6 · F6-R1.2 · F6-SG-C · TK-C-004).
 *
 * Famílias-alvo: Livrinho, Leitor, Colorir, Ateliê. São superfícies onde a OBRA
 * domina: a arte é o conteúdo, e tudo o mais é camada sobre ela.
 *
 * QUAL CARACTERÍSTICA DO CONTEÚDO GOVERNA — a arte. Não há medida de linha para
 * preservar nem inventário para distribuir, então a janela inteira é o padrão nas
 * três faixas. Este arquétipo NÃO impõe coluna de leitura: espremer a ilustração
 * numa largura de texto seria trocar a família pela do lado.
 *
 * Por isso ele não conhece `ContentContainer` — a ausência é o contrato, não um
 * esquecimento.
 *
 * A faixa aqui decide CAPACIDADE de composição, jamais recorte da arte. A faixa
 * expandida comporta uma composição acompanhante (livro aberto, apoio — `D10`), mas
 * `TK-C-004` só declara a capacidade: a composição em si é entrega de `F9`, e
 * antecipá-la seria invadir fase alheia.
 *
 * `TK-C-004` cria o contrato e NENHUM consumidor, e não toca em canvas, projeção
 * nem ciclo de vida — `useViewportProjection` entra em `TK-C-010` e a adoção em
 * Livrinho/Colorir/Ateliê é `TK-C-011` (`C-C5`), sob a matriz de 17 casos.
 */

/**
 * Composição imersiva. Invariante nas três faixas: janela inteira, nenhuma coluna
 * imposta, nenhum recorte. Só a capacidade acompanhante varia.
 */
export function immersiveComposition({ band }) {
  return Object.freeze({
    fill: 'window',
    imposesColumn: false,
    cropsArt: false,
    companionCapacity: band === BANDS.EXPANDED,
  });
}

/**
 * Props:
 *   children — nó, ou função que recebe a composição (`fill`, `companionCapacity`…)
 */
export default function ImmersiveSurface({ children, style, ...rest }) {
  const { band } = useWindowBand();
  const composicao = immersiveComposition({ band });

  return (
    <View style={[styles.janela, style]} {...rest}>
      {typeof children === 'function' ? children(composicao) : children}
    </View>
  );
}

const styles = StyleSheet.create({
  janela: { flex: 1, width: '100%' },
});
