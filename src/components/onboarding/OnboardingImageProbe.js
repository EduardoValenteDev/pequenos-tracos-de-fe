/**
 * OnboardingImageProbe — prova de RENDER READINESS por página (O2.3 · §5/§6).
 *
 * `Asset.loadAsync` garante que o arquivo foi baixado/decodificado (assetReady), mas NÃO que um
 * <Image> real montou e pintou. Esta prova monta, OCULTA, os módulos críticos da próxima página
 * como <Image> reais e chama `onReady` só depois que TODOS dispararam `onLoad` OU `onError` —
 * garantindo que, na virada, a página já aparece pintada (renderReady). Em erro, marca ready do
 * mesmo jeito (o fallback da página assume). Oculta ao leitor de tela e sem interação.
 */
import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function OnboardingImageProbe({ modules, onReady }) {
  const list = Array.isArray(modules) ? modules.filter(Boolean) : [];
  const total = list.length;
  const doneRef = useRef(0);
  const firedRef = useRef(false);

  const fire = () => { if (!firedRef.current) { firedRef.current = true; onReady?.(); } };
  const mark = () => { doneRef.current += 1; if (doneRef.current >= total) fire(); };

  useEffect(() => { if (total === 0) fire(); }, []);   // nada a carregar → pronto

  return (
    <View style={styles.hidden} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {list.map((m, i) => (
        <Image key={i} source={m} style={styles.px} onLoad={mark} onError={mark} fadeDuration={0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, left: -9999, top: -9999 },
  px: { width: 1, height: 1 },
});
