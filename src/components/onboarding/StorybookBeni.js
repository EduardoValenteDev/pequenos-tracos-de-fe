/**
 * StorybookBeni — o Beni como ILUSTRAÇÃO IMPRESSA na página (O2.2/O2.3 · §6/§8).
 *
 * Poses OPACAS (fundo creme). mode: "illustration" (full-bleed cover), "medallion"/"seal"
 * (redondo, contain). `fadeDuration={0}` (asset local aquecido — aparece com a página, sem fade
 * próprio). FALLBACK em erro: mantém a MESMA geometria e mostra um medalhão vetorial com o
 * símbolo do Beni (sparkles) — nunca uma moldura vazia.
 */
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import FaithIcon from '../ui/FaithIcon';
import { BENI_IMAGES, BENI_DEFAULT_VARIANT } from '../../assets/mascot/beniImages';
import { OB } from '../../theme/onboardingVisualTokens';

export default function StorybookBeni({ pose = 'acenando', mode = 'medallion', width = 96, height, style }) {
  const src = BENI_IMAGES[pose] || BENI_IMAGES[BENI_DEFAULT_VARIANT];
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [pose]);

  if (mode === 'illustration') {
    const w = width;
    const h = height || Math.round(width / 0.82);
    return (
      <View style={[styles.illWrap, { width: w, height: h }, style]}>
        {failed ? (
          <View style={styles.illFallback}><FaithIcon name="lumi" size={Math.round(w * 0.4)} color={OB.gold} /></View>
        ) : (
          <Image source={src} style={{ width: w, height: h }} resizeMode="cover" fadeDuration={0} onError={() => setFailed(true)} />
        )}
        <View style={[styles.illRim, { width: w, height: h }]} pointerEvents="none" />
      </View>
    );
  }
  const d = width;
  return (
    <View style={[styles.round, { width: d, height: d, borderRadius: d / 2 }, style]}>
      {failed ? (
        <FaithIcon name="lumi" size={Math.round(d * 0.5)} color={OB.gold} />
      ) : (
        <Image source={src} style={{ width: d, height: d }} resizeMode="contain" fadeDuration={0} onError={() => setFailed(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  illWrap: { borderRadius: 12, overflow: 'hidden', backgroundColor: OB.beniBg },
  illFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illRim: { position: 'absolute', left: 0, top: 0, borderRadius: 12, borderWidth: 1.5, borderColor: OB.goldGlow },
  round: {
    overflow: 'hidden', backgroundColor: OB.beniBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: OB.goldSoft,
  },
});
