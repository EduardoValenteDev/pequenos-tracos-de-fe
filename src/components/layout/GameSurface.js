import React from 'react';
import { View, StyleSheet } from 'react-native';
// [F6.2] Ver `HubSurface`: o tabuleiro cabe na REGIÃO entregue à tela, não na janela.
import { useContentViewport } from '../../context/ContentViewportContext';

/**
 * GameSurface — arquétipo da família **Jogo** (Fase 6 · F6-R1.2 · F6-SG-C · TK-C-004).
 *
 * Famílias-alvo: Monte a Cena, Pares do Beni, Palavrinhas, Cadê a Ovelhinha, Quiz.
 * São superfícies de INTERAÇÃO POSICIONAL: a criança toca um lugar exato, e o lugar
 * exato precisa continuar sendo o mesmo lugar em qualquer janela.
 *
 * QUAL CARACTERÍSTICA DO CONTEÚDO GOVERNA — a proporção do tabuleiro. É a única
 * família em que a faixa NÃO participa da conta, e isso é a política, não um
 * descuido: esticar a área jogável para preencher a janela move os alvos de toque e
 * quebra o jogo. O excedente vira moldura simétrica; nunca distorção.
 *
 * OFERECIDO, NUNCA IMPOSTO. `TK-C-004` cria o contrato e NENHUM consumidor: os
 * quatro jogos e o Quiz já tratam ciclo de vida por conta própria, e refatorá-los
 * aqui seria risco sem requisito. A adoção por tela — e o `GameShell` — é `F12A`,
 * fase alheia. Nenhuma tela de jogo é migrada por esta task.
 *
 * A FRONTEIRA É MEDIDA, NÃO PROMETIDA (`TK-C-012`). Enquanto as outras três famílias
 * eram liberadas em `C-C3`/`C-C4`/`C-C5`, o risco deixou de ser "alguém adota o Jogo
 * cedo demais" e passou a ser "um jogo é arrastado por uma onda de adoção alheia".
 * Por isso são dois portões, não um: `TA-14 [11/21]` proíbe consumidor desta família,
 * e `TA-14 [20/21]` proíbe as cinco famílias de jogo de importarem arquétipo NENHUM.
 * Fora deles, a prova é `git diff` — e no `F6-SG-C` inteiro nenhuma tela de jogo foi
 * migrada para arquétipo.
 */

/**
 * Área jogável dentro do espaço disponível, com a proporção preservada.
 *
 * Devolve as medidas da área e a moldura que sobra de cada lado (`frameX`/`frameY`,
 * já pela metade — a sobra é simétrica). Entrada inválida devolve área zero em vez
 * de improvisar um tabuleiro torto.
 */
export function gameFrame({ availableWidth, availableHeight, aspectRatio }) {
  const valida = [availableWidth, availableHeight, aspectRatio].every((n) => Number.isFinite(n) && n > 0);
  if (!valida) return Object.freeze({ width: 0, height: 0, frameX: 0, frameY: 0 });

  // Altura que o tabuleiro teria se a largura mandasse. Se ela couber, manda.
  const porLargura = availableWidth / aspectRatio;
  const cabeEmAltura = porLargura <= availableHeight;

  const width = cabeEmAltura ? availableWidth : availableHeight * aspectRatio;
  const height = cabeEmAltura ? porLargura : availableHeight;

  return Object.freeze({
    width,
    height,
    frameX: (availableWidth - width) / 2,
    frameY: (availableHeight - height) / 2,
  });
}

/**
 * Props:
 *   children        — nó, ou função que recebe a área jogável (`{ width, height, … }`)
 *   aspectRatio     — proporção do tabuleiro (largura ÷ altura); quem a conhece é o jogo
 *   availableWidth  — espaço real; sem ele, vale a REGIÃO em que o arquétipo vive
 *                    (`F6.2`: a região, nunca a janela — onde há barra lateral
 *                    entre a tela e a borda, as duas divergem)
 *   availableHeight — idem
 *   frameStyle      — estilo da moldura (o que preenche a sobra é decisão da tela)
 */
export default function GameSurface({
  children,
  aspectRatio,
  availableWidth,
  availableHeight,
  style,
  frameStyle,
  ...rest
}) {
  const { width, height } = useContentViewport();
  const area = gameFrame({
    availableWidth: Number.isFinite(availableWidth) ? availableWidth : width,
    availableHeight: Number.isFinite(availableHeight) ? availableHeight : height,
    aspectRatio,
  });

  return (
    <View style={[styles.moldura, frameStyle, style]} {...rest}>
      <View style={{ width: area.width, height: area.height }}>
        {typeof children === 'function' ? children(area) : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
