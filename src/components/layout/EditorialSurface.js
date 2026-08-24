import React from 'react';
import { View, StyleSheet } from 'react-native';
import ContentContainer, { contentColumnMaxWidth } from '../ui/ContentContainer';
import { displayTypeSizes } from './displayType';
import { BANDS } from '../../hooks/useWindowBand';
// [F6.2] Ver `HubSurface`: a coluna de leitura e a região de apoio se decidem pelo
// espaço que a tela RECEBEU, não pela janela que ela vê.
import { useContentViewport } from '../../context/ContentViewportContext';

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
 *
 * [`TK-C-005`] A medida de linha ganha número, e o excedente ganha destino. Numa
 * janela de `1180dp` a coluna para em `640dp` — o que decide se a tela está certa ou
 * errada são os `540dp` que sobram: viram região de apoio (certo) ou vazio dominante
 * (`SD-3`, errado). Quem sabe onde a coluna termina continua sendo `ContentContainer`;
 * este arquivo PERGUNTA (`contentColumnMaxWidth`) em vez de reimplementar, porque a
 * segunda primitiva de largura foi exatamente o defeito `P-30`.
 */

/** A faixa expandida COMPORTA região de apoio. Comportar não é ter. */
export function editorialSupportCapacity(band) {
  return band === BANDS.EXPANDED;
}

/**
 * Composição editorial: quem é dono da coluna, se a faixa comporta apoio, e se o
 * apoio de fato existe. `hasSupport` é o chamador dizendo que TEM conteúdo — só a
 * conjunção das duas coisas abre a região.
 *
 * [`TK-C-061`] `displayType` entra aqui, e não em `editorialLayout`, porque depende
 * só da faixa — e daqui ele atravessa para o layout pela mesma difusão que já leva
 * `columnOwner`. Esta família já era dona de uma decisão tipográfica (a medida da
 * linha); o corpo do título é a outra metade da mesma pergunta. A conta vem de
 * `displayType.js` — o auxiliar único que o Hub também consulta —, e é isso que
 * impede a segunda primitiva: `P-30` foi exatamente duas respostas para uma decisão.
 */
export function editorialComposition({ band, hasSupport = false }) {
  const capacidade = editorialSupportCapacity(band);
  return Object.freeze({
    columnOwner: 'ContentContainer',
    supportCapacity: capacidade,
    support: capacidade && hasSupport === true,
    displayType: displayTypeSizes(band),
  });
}

/**
 * A conta de `SD-3`: onde a coluna de leitura termina, e para onde vai o que sobra.
 *
 * `columnMaxWidth` vem do dono — `'100%'` na compacta (fluido), número nas demais.
 * `supportWidth` é o excedente COM destino, limitado pela coluna de leitura, e
 * `supportSlack` é o que sobrou depois desse teto; `voidWidth` é o mesmo excedente
 * sem destino algum, e é essa troca que `dominantVoid` diagnostica: faixa que
 * comporta apoio, chamador que não
 * trouxe nada, e sobra de largura sem função. É esse estado que `G-RSP-6` proíbe.
 */
export function editorialLayout({ band, availableWidth, hasSupport = false }) {
  const composicao = editorialComposition({ band, hasSupport });
  const columnMaxWidth = contentColumnMaxWidth(band);

  const largura = Number.isFinite(availableWidth) ? availableWidth : 0;
  // Na compacta a coluna é fluida (`'100%'`), então ela É a largura — e nada sobra.
  const coluna = typeof columnMaxWidth === 'number' ? Math.min(columnMaxWidth, largura) : largura;
  const excedente = Math.max(0, largura - coluna);

  // A família é de LEITURA: a região de apoio ACOMPANHA a coluna, nunca a domina.
  // Sem teto, o apoio absorve todo o excedente e passa a coluna em janela larga
  // (1317dp de tablet em paisagem: apoio 677 contra leitura 640) — a hierarquia que
  // dá nome ao arquétipo invertida pela aritmética. O teto é a PRÓPRIA coluna: número
  // novo aqui seria a segunda primitiva de largura que o defeito `P-30` já custou.
  const apoio = composicao.support ? Math.min(excedente, coluna) : 0;

  const capacidadeOciosa = composicao.supportCapacity && !composicao.support;

  // Onde o conteúdo de apoio VIVE — e a razão de existir um terceiro estado: se a
  // faixa não abre a região, o material não pode simplesmente sumir. Ele volta para
  // a coluna, acima do corpo de leitura. `'none'` é só a ausência de material.
  const supportPlacement = composicao.support ? 'aside' : (hasSupport === true ? 'column' : 'none');

  return Object.freeze({
    ...composicao,
    columnMaxWidth,
    supportPlacement,
    supportWidth: apoio,
    // O que o teto barrou não desaparece do diagnóstico: `supportWidth + supportSlack`
    // fecha com o excedente. Jogar a sobra em `voidWidth` seria mentir — `voidWidth` é
    // o excedente SEM destino, e este tem destino: é margem da região de apoio.
    supportSlack: composicao.support ? excedente - apoio : 0,
    voidWidth: composicao.support ? 0 : excedente,
    dominantVoid: capacidadeOciosa && excedente > 0,
  });
}

/**
 * Escotilha para telas cujo material de apoio NÃO vive no topo da coluna.
 *
 * A rede de segurança do componente recoloca o apoio no início do corpo, e para a
 * maioria das telas é exatamente onde ele já estava. Quando não é — material que
 * hoje aparece no meio da leitura —, subi-lo mudaria a ordem de leitura no telefone,
 * e o arquétipo não redesenha tela. Nesse caso a tela pergunta antes: entrega o
 * material como apoio quando a região abre, e o mantém no lugar de sempre quando não.
 */
export function useEditorialSupport() {
  const { band } = useContentViewport();
  return editorialSupportCapacity(band);
}

/**
 * Props:
 *   children       — o corpo de leitura, sempre dentro de `ContentContainer`
 *   support        — conteúdo da região de apoio; sem ele, região nenhuma aparece
 *   supportStyle   — estilo da região de apoio (a tela decide o que ela é)
 *   availableWidth — espaço real quando a tela já o conhece; sem ele, vale a REGIÃO em que o arquétipo vive
 *                    (`F6.2`: a região, nunca a janela — onde há barra lateral
 *                    entre a tela e a borda, as duas divergem)
 */
export default function EditorialSurface({
  children,
  support = null,
  style,
  supportStyle,
  availableWidth,
  ...rest
}) {
  const { band, width } = useContentViewport();
  const largura = Number.isFinite(availableWidth) ? availableWidth : width;
  const layout = editorialLayout({ band, availableWidth: largura, hasSupport: support != null });

  if (!layout.support) {
    // Faixa que não abre a região: o apoio desce para dentro da coluna, no topo.
    // É a mesma leitura de cima a baixo que a família sempre teve — e nenhum
    // conteúdo se perde por mudança de faixa.
    return (
      <ContentContainer style={style} {...rest}>
        {support}
        {children}
      </ContentContainer>
    );
  }

  return (
    <View style={[styles.comApoio, style]} {...rest}>
      <View style={[styles.leitura, { width: layout.columnMaxWidth }]}>
        <ContentContainer>{children}</ContentContainer>
      </View>
      <View style={[styles.apoio, supportStyle, { maxWidth: layout.supportWidth }]}>{support}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  comApoio: { flexDirection: 'row', width: '100%' },
  // A coluna de leitura recebe a largura que `ContentContainer` decide e NÃO encolhe:
  // sem isto ela cederia espaço ao apoio e a medida de linha viraria sobra do layout.
  // O excedente é da região de apoio — por isso só ela cresce (`flex: 1`).
  leitura: { flexShrink: 0 },
  // Cresce com o excedente, mas o teto de `editorialLayout` vem depois de
  // `supportStyle` no array: a tela decide o que a região É, o arquétipo garante
  // que ela não passe a coluna de leitura.
  apoio: { flex: 1 },
});
