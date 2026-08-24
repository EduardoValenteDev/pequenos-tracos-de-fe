import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
 * ─── O RODAPÉ DO SISTEMA TAMBÉM É FRONTEIRA (`F6.2R2`) ──────────────────────────
 *
 * O app é *edge-to-edge* (`edgeToEdgeEnabled`): a janela do Android vai até o pixel
 * final da tela, e a barra do sistema é desenhada POR CIMA dela. No telefone isso não
 * aparece, porque a navegação é a barra inferior e ela já reserva `64 + inset` ABAIXO
 * da cena. No tablet a navegação foi para a lateral — e o rodapé ficou SEM DONO: a
 * cena recebia a janela inteira (1316dp medidos no SM-X510) e os últimos 48dp dela
 * ficavam atrás da taskbar. Foi o que a prova física mostrou: o fim do Cantinho do
 * Beni e o card de Administração coberto pela barra do sistema.
 *
 * O eixo vertical é o mesmo contrato do horizontal, com o outro dono:
 *
 *   `APP WINDOW → SYSTEM BOTTOM INSET → SAFE CONTENT AREA → SCREEN`
 *
 * E é a MESMA pergunta qualitativa: quem já reservou o rodapé? Onde a navegação é a
 * barra inferior, ela — e somar aqui seria *double inset*, o defeito espelhado. Onde
 * a navegação é lateral, ninguém — e então é o shell. O valor é o inset REAL do
 * sistema, nunca uma altura mágica de aparelho.
 *
 * O que continua fora daqui: topo, recorte, gesto lateral e o `paddingTop` das telas.
 * `AppScreen` segue dono da área segura de quem o usa; este módulo resolve a borda
 * que a cena de aba não tinha como resolver sozinha.
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

/**
 * A altura do rodapé que pertence ao SISTEMA e que a cena não pode usar.
 *
 * `0` onde a navegação é a barra inferior — ali o inset já foi reservado abaixo da
 * cena, e somá-lo de novo seria contá-lo duas vezes. O valor nunca é constante: é o
 * inset medido, e vale zero sozinho quando o aparelho não tem barra nenhuma.
 */
export function systemBottomClearance(band, insetBottom) {
  return sidebarRole(band) ? insetBottom : 0;
}

export default function NavigationContentHost({ children }) {
  const { band } = useWindowBand();
  const insets = useSafeAreaInsets();
  const recuo = navigationContentGap(band);
  const rodape = systemBottomClearance(band, insets.bottom);

  return (
    <View
      style={recuo > 0 || rodape > 0
        ? [styles.host, { paddingLeft: recuo, paddingBottom: rodape, backgroundColor: color.paper50 }]
        : styles.host}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
