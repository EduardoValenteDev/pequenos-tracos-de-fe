import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { color, font, fontSize, fontWeight } from '../../theme/tokens';

/**
 * EstadoCarregando — a espera, desenhada no papel (`F6.3A` · "O Livro Vivo").
 *
 * POR QUE ESTA PRIMITIVA EXISTE. O contrato visual da v6 nomeia "loading" como uma
 * das categorias que precisam de FONTE CANÔNICA, e o app não tinha nenhuma: cada
 * superfície montava o seu próprio `ActivityIndicator` com um hex escolhido na hora
 * — inclusive o portão de fontes do `App.js`, que abria o app num laranja
 * (`#FF8C42`) sobre um creme (`#FFF8F0`) que não existem na paleta. A PRIMEIRA
 * coisa que a criança vê estava fora do sistema.
 *
 * O QUE ELA DECIDE, E SÓ ISSO: que a espera acontece sobre PAPEL e que o sinal de
 * atividade é TERRACOTA — a cor de ação. Não decide layout, não impõe altura, não
 * conhece rota nem motivo da espera. Quem preenche a tela inteira passa `fundo`;
 * quem espera dentro de um card não passa nada.
 *
 * NÃO É UMA BIBLIOTECA NOVA: é o menor componente que fecha a categoria, com
 * consumidor real desde o primeiro commit (`App.js`). Uma primitiva sem consumidor
 * seria o defeito `P-82` outra vez, agora em componente em vez de *token*.
 *
 * Props: `rotulo` (texto opcional sob o indicador), `fundo` (preenche a janela),
 * `tamanho` ('small' | 'large'), `style`.
 */
export default function EstadoCarregando({ rotulo, fundo = false, tamanho = 'large', style }) {
  return (
    <View style={[styles.base, fundo && styles.fundo, style]}>
      <ActivityIndicator size={tamanho} color={color.terra500} />
      {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  fundo: { flex: 1, backgroundColor: color.paper50 },
  rotulo: {
    fontFamily: font.body,
    fontWeight: fontWeight.uiLabel,
    fontSize: fontSize.caption,
    color: color.ink600,
    textAlign: 'center',
    marginTop: 10,
  },
});
