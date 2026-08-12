import React from 'react';
import { View, StyleSheet } from 'react-native';
import ContentContainer from '../ui/ContentContainer';
import { useWindowBand, BANDS } from '../../hooks/useWindowBand';

/**
 * EditorialSurface — arquétipo da família **Editorial** (Fase 6 · F6-R1.2 · F6-SG-C · TK-C-004).
 *
 * Famílias-alvo: Detalhe da história, Reflexão, Pós-história, Área dos Pais. São
 * superfícies de LEITURA: alguém lê de cima a baixo, e o que importa é a medida da
 * linha.
 *
 * QUAL CARACTERÍSTICA DO CONTEÚDO GOVERNA — a legibilidade do texto. Linha longa
 * demais cansa; por isso a coluna NÃO cresce junto com a janela. Contagem de coluna
 * não é assunto desta família.
 *
 * `ContentContainer` continua sendo o dono da coluna editorial — este arquétipo
 * compõe COM ele e não reimplementa `maxWidth` nem lê `maxContentWidth`. Duas
 * primitivas de largura foi exatamente o defeito `P-30`, e ele não volta por aqui.
 *
 * REGIÃO DE APOIO — capacidade, não conteúdo. Na faixa expandida sobra largura
 * depois da coluna de leitura, e `SD-3` proíbe que isso vire vazio dominante. O que
 * `TK-C-004` entrega é a REGIÃO opcional: ela só existe quando a faixa comporta E o
 * chamador de fato traz algo para ela. Este arquivo não cria conteúdo, não inventa
 * painel e não decide o que vai nele — inventar destino para preencher vazio é
 * exatamente o que `D4` proíbe.
 *
 * `TK-C-004` cria o contrato e NENHUM consumidor. A medida de leitura da família é
 * `TK-C-005`; a adoção nas quatro telas é `TK-C-006` (`C-C3`), com 12 capturas. Nada
 * aqui toca Story Home V2 nem Página Viva — são `F9`.
 */

/** A faixa expandida COMPORTA região de apoio. Comportar não é ter. */
export function editorialSupportCapacity(band) {
  return band === BANDS.EXPANDED;
}

/**
 * Composição editorial: quem é dono da coluna, se a faixa comporta apoio, e se o
 * apoio de fato existe. `hasSupport` é o chamador dizendo que TEM conteúdo — só a
 * conjunção das duas coisas abre a região.
 */
export function editorialComposition({ band, hasSupport = false }) {
  const capacidade = editorialSupportCapacity(band);
  return Object.freeze({
    columnOwner: 'ContentContainer',
    supportCapacity: capacidade,
    support: capacidade && hasSupport === true,
  });
}

/**
 * Props:
 *   children     — o corpo de leitura, sempre dentro de `ContentContainer`
 *   support      — conteúdo da região de apoio; sem ele, região nenhuma aparece
 *   supportStyle — estilo da região de apoio (a tela decide o que ela é)
 */
export default function EditorialSurface({ children, support = null, style, supportStyle, ...rest }) {
  const { band } = useWindowBand();
  const composicao = editorialComposition({ band, hasSupport: support != null });

  if (!composicao.support) {
    return (
      <ContentContainer style={style} {...rest}>
        {children}
      </ContentContainer>
    );
  }

  return (
    <View style={[styles.comApoio, style]} {...rest}>
      <View style={styles.leitura}>
        <ContentContainer>{children}</ContentContainer>
      </View>
      <View style={[styles.apoio, supportStyle]}>{support}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  comApoio: { flexDirection: 'row', width: '100%' },
  // A coluna de leitura mantém a medida que `ContentContainer` impõe; o excedente
  // da faixa é para a região de apoio, e é por isso que só ela cresce.
  leitura: { flexShrink: 1 },
  apoio: { flex: 1 },
});
