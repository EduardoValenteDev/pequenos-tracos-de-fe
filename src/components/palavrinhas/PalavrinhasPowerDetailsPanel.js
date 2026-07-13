/**
 * PalavrinhasPowerDetailsPanel — painel LARGO de informação do poder (P4R9 §16).
 *
 * Abre acima do dock ao tocar num slot (NÃO ativa imediatamente). Largura = tela − 32; layout
 * horizontal (ícone grande à esquerda, nome + descrição de até 2 linhas no centro, ações à
 * direita/abaixo). Se o poder não puder ser usado agora, mostra o motivo e desabilita "Usar agora"
 * (sem consumir). Fecha ao usar/guardar/tocar fora. Apresentação pura.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import SoundButton from '../SoundButton';
import FaithIcon from '../ui/FaithIcon';

export default function PalavrinhasPowerDetailsPanel({ poder, aval, onUsar, onGuardar, largura, bottom }) {
  if (!poder) return null;
  const texto = aval && !aval.podeUsar && aval.motivo ? aval.motivo : poder.dica;
  return (
    <View style={[styles.wrap, { width: largura, bottom }]} pointerEvents="auto">
      <View style={[styles.icon, { backgroundColor: (poder.cor || pt.purple) + '22' }]}>
        <FaithIcon name={poder.icon} size={38} color={poder.cor || pt.purpleDeep} />
      </View>
      <View style={styles.centro}>
        <Text style={styles.nome} numberOfLines={1}>{poder.nome}</Text>
        <Text style={styles.desc} numberOfLines={2}>{texto}</Text>
      </View>
      <View style={styles.acoes}>
        <SoundButton
          style={[styles.usar, !(aval && aval.podeUsar) && styles.usarOff]}
          onPress={() => { if (aval && aval.podeUsar) onUsar(poder); }}
          disabled={!(aval && aval.podeUsar)}
          accessibilityRole="button"
          accessibilityLabel={`Usar ${poder.nome} agora`}
        >
          <Text style={styles.usarTxt}>Usar agora</Text>
        </SoundButton>
        <SoundButton style={styles.guardar} onPress={onGuardar} accessibilityRole="button" accessibilityLabel="Guardar o poder">
          <Text style={styles.guardarTxt}>Guardar</Text>
        </SoundButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: radii.xl,
    backgroundColor: '#FFFDF9', borderWidth: 2, borderColor: pt.purple, zIndex: 45, ...shadows.card,
  },
  icon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  centro: { flex: 1, gap: 2 },
  nome: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.purpleDeep },
  desc: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: pt.textSoft, lineHeight: 17 },
  acoes: { alignItems: 'stretch', gap: 6, flexShrink: 0 },
  usar: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: pt.beni, alignItems: 'center' },
  usarOff: { backgroundColor: '#D9CBB8' },
  usarTxt: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  guardar: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: radii.pill, backgroundColor: pt.surface, borderWidth: 1, borderColor: '#E0CDF5', alignItems: 'center' },
  guardarTxt: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: pt.purpleDeep },
});
