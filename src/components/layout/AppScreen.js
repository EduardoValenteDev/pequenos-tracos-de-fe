import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../../theme/tokens';

/**
 * AppScreen — tratamento ÚNICO de área segura das telas migradas (Fase 6 · B1 · P-29).
 *
 * Antes da Fase 6 este componente existia sem nenhum consumidor e importava o tema
 * CONCORRENTE (`productTheme`). B1 resolve os dois defeitos: ele passa a ser consumido
 * de fato e passa a consumir `tokens.js` — condição inegociável do plano (§6.1.2).
 *
 * Regras de uso:
 * - Substitui o par `useSafeAreaInsets()` + `paddingTop/paddingBottom` improvisado na tela.
 * - Pode ser a raiz da tela OU o corpo rolável abaixo de um cabeçalho irmão
 *   (`<View wrapper><SafeScreenHeader/><AppScreen scroll/></View>`): em modo `scroll`
 *   o ScrollView já é `flex: 1` e ocupa o espaço restante.
 * - NÃO use para cabeçalho colorido que precisa sangrar sob a status bar, nem para
 *   geometria (alvo de tour, viewport de canvas) — esses casos NÃO são padding e
 *   continuam legitimamente lendo os insets na própria tela.
 *
 * Contrato de estilo (importa, e mudou em relação à versão morta):
 * - O padding seguro é injetado POR ÚLTIMO e, portanto, VENCE o estilo do chamador.
 *   É o que torna o tratamento "único": a tela não consegue mais divergir sem querer.
 * - Só as chaves realmente geridas são injetadas. Sem `applyTopInset`, AppScreen não
 *   escreve `paddingTop` nenhum — o `paddingTop` do chamador permanece intacto.
 * - `backgroundColor` é OPCIONAL e sem padrão. B1 é migração estrutural, não repintura:
 *   a tela mantém o fundo que já tinha. Quem quiser o fundo universal de tela usa
 *   `APP_SCREEN_BACKGROUND`.
 *
 * Props:
 *   children              — conteúdo da tela
 *   backgroundColor       — cor de fundo (default: nenhuma; não repinta a tela)
 *   scroll                — se true, envolve em ScrollView
 *   contentContainerStyle — passado para o ScrollView (antes do padding seguro)
 *   style                 — style extra no container (antes do padding seguro)
 *   noBottomPadding       — se true, não aplica paddingBottom seguro
 *   applyTopInset         — se true, aplica paddingTop do inset
 *   topExtra              — folga somada ao inset de topo (só com applyTopInset)
 *   bottomExtra           — folga somada ao inset de base (a folga que a tela já tinha)
 *
 * `ref` é encaminhado ao ScrollView (ou à View) — telas que já controlavam o scroll
 * por ref (ex.: "voltar ao topo" em Histórias) migram sem perder o controle.
 */
export const APP_SCREEN_BACKGROUND = color.paper50;

const AppScreen = React.forwardRef(function AppScreen({
  children,
  backgroundColor,
  scroll = false,
  contentContainerStyle,
  style,
  noBottomPadding = false,
  applyTopInset = false,
  topExtra = 0,
  bottomExtra = 0,
}, ref) {
  const insets = useSafeAreaInsets();

  // Só as chaves geridas entram — ver "Contrato de estilo" acima.
  const safePad = {};
  if (applyTopInset) safePad.paddingTop = insets.top + topExtra;
  if (!noBottomPadding) safePad.paddingBottom = insets.bottom + bottomExtra;

  const bg = backgroundColor ? { backgroundColor } : null;

  if (scroll) {
    return (
      <ScrollView
        ref={ref}
        style={[styles.container, bg, style]}
        contentContainerStyle={[contentContainerStyle, safePad]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View ref={ref} style={[styles.container, bg, style, safePad]}>
      {children}
    </View>
  );
});

export default AppScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
