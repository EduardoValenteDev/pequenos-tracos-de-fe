import React from 'react';
import { View, StyleSheet } from 'react-native';
import { color, navContentGap } from '../../theme/tokens';
import { useWindowBand } from '../../hooks/useWindowBand';
import { sidebarRole } from '../TabletSidebar';

/**
 * NavigationContentHost — a FRONTEIRA entre a navegação e o conteúdo (Fase 6 · `F6.2R`).
 *
 * ─── POR QUE ISTO EXISTE ────────────────────────────────────────────────────────
 *
 * `F6.2` provou que a janela não descreve o espaço da tela quando a navegação é uma
 * barra lateral, e fez a região ser MEDIDA. Ficou correto e ficou insuficiente: a
 * região começava no MESMO x em que a barra terminava. Entre a borda direita da
 * navegação e o primeiro pixel de conteúdo havia ZERO dp — o único separador era a
 * hairline pintada DENTRO da própria barra, porque RN é *border-box*. Na validação
 * física, o primeiro card do Cantinho do Beni nascia a 16dp da barra (recuo DELE,
 * repetido seis vezes) e o herói acima dele nascia a 0dp, colado.
 *
 * O contrato agora é um só, e vale para TODA superfície que coexista com a barra:
 *
 *   `SIDEBAR → NAVIGATION CONTENT GAP → CONTENT VIEWPORT → SCREEN`
 *
 * ─── O GAP É GEOMETRIA, NÃO DECORAÇÃO ───────────────────────────────────────────
 *
 * Ele é aplicado ANTES do provedor de região, e é por isso que o consertar aqui
 * conserta todo mundo: o `onLayout` que publica o viewport acontece DENTRO deste
 * recuo, então a grandeza que os arquétipos, o `ContentContainer`, os jogos e o
 * canvas recebem já nasce descontada. Nenhum consumidor precisa lembrar de subtrair
 * `G`; nenhuma tela precisa saber que existe barra lateral; nenhum jogo precisa
 * deslocar coordenada. A alternativa — publicar a região cheia e pedir que cada
 * filho recue — é a lista de exceções por tela que `F6.2R` existe para não criar.
 *
 * ─── NÃO EXISTE ARITMÉTICA DE BARRA AQUI ────────────────────────────────────────
 *
 * Este arquivo não lê, não importa e não subtrai a largura da barra (`G-SID-3` ·
 * `RG-12`). A única pergunta que ele faz à navegação é qualitativa — "esta faixa TEM
 * papel lateral?" —, e quem responde é o dono do papel. Onde a resposta é não (o
 * telefone, cuja navegação é a barra inferior), a fronteira lateral não existe e o
 * recuo é zero: o caminho compacto fica idêntico ao que era.
 *
 * ─── A ÁREA SEGURA CONTINUA SENDO DE `AppScreen` ────────────────────────────────
 *
 * Nenhum inset é lido, aplicado ou republicado aqui. Recorte, barra de status e
 * gesto continuam com o dono que já tinham — este módulo resolve UMA distância.
 *
 * ─── A FAIXA DO GAP É PINTADA ───────────────────────────────────────────────────
 *
 * Um vão transparente mostraria o fundo do navegador (cinza de biblioteca) entre uma
 * barra creme e uma página creme — uma listra, que é pior que o defeito. O vão recebe
 * o fundo universal de tela, e assim a fronteira lê como respiro da página, não como
 * buraco. Superfície *full-bleed* preenche o VIEWPORT DE CONTEÚDO — nunca o espaço
 * atrás da barra —, então esse vão é a moldura dela, e é deliberado.
 *
 * ─── IDIOMA DO ARQUIVO ──────────────────────────────────────────────────────────
 *
 * A política pura vem antes do componente, como nos arquétipos e no referencial de
 * região: é a parte que os arneses carregam e mutam.
 */

/**
 * A distância entre a borda visível da navegação e o início da superfície útil.
 *
 * `0` onde não há barra lateral — e o zero é resposta, não omissão: no telefone a
 * navegação não divide o eixo horizontal com o conteúdo.
 */
export function navigationContentGap(band) {
  return sidebarRole(band) ? navContentGap : 0;
}

export default function NavigationContentHost({ children }) {
  const { band } = useWindowBand();
  const recuo = navigationContentGap(band);

  return (
    <View
      style={recuo > 0
        ? [styles.host, { paddingLeft: recuo, backgroundColor: color.paper50 }]
        : styles.host}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
