/**
 * CreatorModeBanner — faixa fixa e discreta "MODO CRIADOR ATIVO".
 *
 * Aparece em TODAS as telas enquanto o Modo Criador/QA estiver ligado, para
 * impedir testes contaminados do plano gratuito (o Modo Criador libera conteúdo
 * Premium localmente). Some sozinha quando o modo é desligado.
 *
 * Overlay no topo, pointerEvents='none' (não bloqueia toques). Só renderiza em
 * ambiente permitido (__DEV__ / flag de QA).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  isCreatorQaModeEnabled, isCreatorQaModeAllowed, subscribeCreatorQaMode,
} from '../../services/creatorQaMode';

export default function CreatorModeBanner() {
  const insets = useSafeAreaInsets();
  const [enabled, setEnabled] = useState(isCreatorQaModeEnabled());

  useEffect(() => {
    // Sincroniza com o valor atual e assina mudanças (liga/desliga em runtime).
    setEnabled(isCreatorQaModeEnabled());
    return subscribeCreatorQaMode(() => setEnabled(isCreatorQaModeEnabled()));
  }, []);

  if (!isCreatorQaModeAllowed() || !enabled) return null;

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 4) }]} pointerEvents="none">
      <Text style={styles.text}>🛠️ MODO CRIADOR ATIVO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(124,58,237,0.92)',
    alignItems: 'center',
    paddingBottom: 3,
    zIndex: 9999, elevation: 9999,
  },
  text: {
    fontFamily: 'FredokaOne',
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 1,
  },
});
