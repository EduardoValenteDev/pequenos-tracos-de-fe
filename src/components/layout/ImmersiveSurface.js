import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BANDS } from '../../hooks/useWindowBand';
// [F6.2] Ver `HubSurface`: a obra ocupa a REGIÃO entregue à tela. Numa aba com barra
// lateral, projetar pela janela colocaria parte da obra debaixo da navegação.
import { useContentViewport } from '../../context/ContentViewportContext';
import { useViewportProjection } from '../../hooks/useViewportProjection';

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
 * ─── PROJEÇÃO: PEDIDA, NUNCA REFEITA (`TK-C-010`) ──────────────────────────────
 *
 * "Caber a obra na janela" já tem dono desde `F6-R3`: `useViewportProjection`, a
 * ÚNICA conta `contain` do app (`TK-A-030`). Este arquétipo CHAMA esse hook e não
 * possui uma linha de aritmética de projeção própria — nem `Math.min` de razões,
 * nem `scale`, nem `offset`.
 *
 * A regra não é estética. Duas contas para a mesma pergunta produzem duas verdades
 * sobre ONDE está o traço da criança, e é assim que a pintura acaba deslocada do
 * contorno depois de girar o aparelho. Uma família de superfícies que refizesse a
 * conta seria exatamente a arquitetura paralela que `RG-2` proíbe.
 *
 * A projeção é OFERECIDA a quem passar `logicalSize`, e some para quem não passar:
 * sem espaço lógico declarado ela nasce `valid: false`, sem inventar coordenada.
 * `TK-C-011` adota o arquétipo nas três telas SEM tocar em canvas — os motores de
 * Colorir e Ateliê continuam donos do próprio pipeline, sob a matriz de 17 casos.
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
 *   children        — nó, ou função que recebe a composição + a projeção
 *   logicalSize     — espaço lógico da obra (`{width,height}`); sem ele não há projeção
 *   availableWidth  — espaço real; sem ele, vale a REGIÃO em que o arquétipo vive
 *                    (`F6.2`: a região, nunca a janela — onde há barra lateral
 *                    entre a tela e a borda, as duas divergem)
 *   availableHeight — idem
 */
export default function ImmersiveSurface({
  children,
  logicalSize,
  availableWidth,
  availableHeight,
  style,
  ...rest
}) {
  const { band, width, height } = useContentViewport();
  const composicao = immersiveComposition({ band });

  // A conta de caber a obra NÃO acontece aqui — acontece no dono dela. Sem
  // `logicalSize` o hook devolve `valid: false`, que é a resposta honesta de quem
  // não sabe, em vez de uma coordenada inventada.
  const projection = useViewportProjection(logicalSize, {
    width: Number.isFinite(availableWidth) ? availableWidth : width,
    height: Number.isFinite(availableHeight) ? availableHeight : height,
  });

  return (
    <View style={[styles.janela, style]} {...rest}>
      {typeof children === 'function' ? children({ ...composicao, band, projection }) : children}
    </View>
  );
}

const styles = StyleSheet.create({
  janela: { flex: 1, width: '100%' },
});
