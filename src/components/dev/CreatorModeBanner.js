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
// [C60-P13-HEADER] §Parte 13 — durante um momento imersivo (os atos da celebração) o selo se recolhe:
// ele é um overlay global e ficava por cima da festa. É só APRESENTAÇÃO — o Modo Criador continua
// exatamente como está (nada é ligado, desligado ou persistido aqui) e o selo volta ao fim do momento.
import { isImmersiveMomentActive, subscribeImmersiveMoment } from '../../services/immersiveMoment';

export default function CreatorModeBanner() {
  const insets = useSafeAreaInsets();
  const [enabled, setEnabled] = useState(isCreatorQaModeEnabled());
  const [immersive, setImmersive] = useState(isImmersiveMomentActive());

  useEffect(() => {
    // Sincroniza com o valor atual e assina mudanças (liga/desliga em runtime).
    setEnabled(isCreatorQaModeEnabled());
    return subscribeCreatorQaMode(() => setEnabled(isCreatorQaModeEnabled()));
  }, []);

  useEffect(() => {
    setImmersive(isImmersiveMomentActive());
    return subscribeImmersiveMoment((active) => setImmersive(active === true));
  }, []);

  if (!isCreatorQaModeAllowed() || !enabled || immersive) return null;

  // R2C/fechamento §3 — SELO minúsculo no canto superior DIREITO, ancorado NA borda da safe
  // area (não no status bar) e acima da faixa do título: não cobre título, Voltar, seletor de
  // modo nem status bar. Largura limitada, fonte pequena. Overlay pointerEvents='none'.
  return (
    <View style={[styles.wrap, { top: Math.max(insets.top, 4) }]} pointerEvents="none">
      <View style={styles.selo}>
        <Text style={styles.text}>MODO CRIADOR ATIVO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 8,                 // canto superior DIREITO, largura limitada (não ocupa a tela toda)
    alignItems: 'flex-end',
    zIndex: 9999, elevation: 9999,
  },
  selo: {
    backgroundColor: 'rgba(124,58,237,0.82)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  text: {
    fontFamily: 'FredokaOne',
    fontSize: 8,
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
