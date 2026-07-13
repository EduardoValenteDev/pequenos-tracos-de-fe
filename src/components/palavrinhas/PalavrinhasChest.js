/**
 * PalavrinhasChest — conteúdo do Baú Mágico (P4R8). Beni já carregado no topo, título curto, duas
 * cartas maiores com ícone grande, nome e descrição de UMA linha (sem parágrafo). Apresentação pura.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import SoundButton from '../SoundButton';
import FaithIcon from '../ui/FaithIcon';

export default function PalavrinhasChest({ cartas, onEscolher, beni }) {
  return (
    <View style={styles.wrap}>
      {beni}
      <Text style={styles.titulo}>Baú Mágico</Text>
      <Text style={styles.sub}>Escolha um poder para guardar</Text>
      <View style={styles.cartas}>
        {cartas.map((poder) => (
          <SoundButton key={poder.id} soundType="reward" onPress={() => onEscolher(poder)} style={styles.carta} accessibilityLabel={`${poder.nome}. ${poder.dica}`}>
            <View style={styles.icon}><FaithIcon name={poder.icon} size={36} color={pt.purpleDeep} /></View>
            <Text style={styles.nome}>{poder.nome}</Text>
            <Text style={styles.dica}>{poder.dica}</Text>
          </SoundButton>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1 },
  titulo: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.purpleDeep, textAlign: 'center' },
  sub: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.textSoft, textAlign: 'center' },
  cartas: { flexDirection: 'row', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 },
  carta: { width: 160, minHeight: 168, borderRadius: radii.xl, backgroundColor: pt.surface, borderWidth: 2, borderColor: pt.purple, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 12, gap: 8, ...shadows.card },
  icon: { width: 66, height: 66, borderRadius: 33, backgroundColor: pt.lilac, alignItems: 'center', justifyContent: 'center' },
  nome: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.purpleDeep, textAlign: 'center' },
  dica: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft, textAlign: 'center' },
});
