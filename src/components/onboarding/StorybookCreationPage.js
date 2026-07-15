/**
 * StorybookCreationPage — Momento 4: o livro chega a A CRIAÇÃO (O2.2 · §14).
 *
 * Spread integrado (uma cena única, não três cards): página esquerda = capa oficial de A Criação
 * + título "A Criação" + selo "Sua primeira aventura"; página direita = texto personalizado, o
 * Beni como ilustração impressa, o selo da criança (avatar + nome) e pequenos elementos da
 * criação. Davi e Golias NÃO aparece aqui. Geometria estável (fallback do mesmo tamanho).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import StorybookBeni from './StorybookBeni';
import StorybookCover from './StorybookCover';
import AvatarImage from '../AvatarImage';
import { getAvatarImage } from '../../data/avatars';
import { OB } from '../../theme/onboardingVisualTokens';

function CreationMotifs({ size }) {
  const s = size;
  return (
    <Svg width={s} height={s * 0.4} pointerEvents="none">
      <G opacity={0.85}>
        <Circle cx={s * 0.18} cy={s * 0.14} r={7} fill={OB.goldSoft} />{/* sol/luz */}
        <Path d={`M${s * 0.4} ${s * 0.2} q 8 -10 16 0 q -8 6 -16 0`} fill="#8FBF7A" />{/* folha */}
        <Path d={`M0 ${s * 0.34} Q ${s * 0.5} ${s * 0.26} ${s} ${s * 0.34}`} stroke={OB.scarf} strokeOpacity={0.4} strokeWidth={2} fill="none" />{/* água */}
        <Circle cx={s * 0.72} cy={s * 0.1} r={2.4} fill={OB.gold} />{/* estrela */}
        <Circle cx={s * 0.86} cy={s * 0.18} r={1.8} fill={OB.gold} />
      </G>
    </Svg>
  );
}

export default function StorybookCreationPage({ width, height, name, avatarId, skinTone, alreadyComplete }) {
  const coverW = Math.min(width * 0.42, 158);
  const coverH = Math.round(coverW * 1.2);
  const displayName = (name && name.trim()) || 'Amiguinho';
  const rightText = alreadyComplete
    ? `${displayName}, o Mundo do Beni está esperando por você!`
    : `${displayName}, sua primeira aventura está pronta!`;

  return (
    <View style={styles.spread}>
      {/* Página esquerda — A Criação (com fallback real) */}
      <View style={styles.left}>
        {!alreadyComplete && <View style={styles.chapter}><Text style={styles.chapterText}>Capítulo 1</Text></View>}
        <StorybookCover storyId="creation" title="A Criação" width={coverW} height={coverH} />
        <Text style={styles.title}>A Criação</Text>
        <View style={styles.seal}><Text style={styles.sealText}>Sua primeira aventura</Text></View>
      </View>

      {/* Página direita — cena integrada com o Beni e o selo da criança */}
      <View style={styles.right}>
        <StorybookBeni pose="celebrando" mode="medallion" width={54} />
        <Text style={styles.rightText}>{rightText}</Text>
        {!alreadyComplete && <Text style={styles.rightSub}>Vamos descobrir como Deus criou o mundo?</Text>}
        {avatarId ? (
          <View style={styles.childSeal} accessibilityLabel={`Aventureiro ${displayName}`}>
            <AvatarImage source={getAvatarImage(avatarId, skinTone)} size={26} />
            <Text style={styles.childName} numberOfLines={1}>{displayName}</Text>
          </View>
        ) : null}
        <CreationMotifs size={Math.min(width * 0.38, 130)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spread: { flex: 1, flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 6 },
  left: { flex: 1, paddingRight: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  right: { flex: 1, paddingLeft: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  chapter: { backgroundColor: OB.scarf + '18', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2, borderWidth: 1, borderColor: OB.scarf + '55' },
  chapterText: { fontFamily: 'FredokaOne', fontSize: 10.5, color: OB.scarf, letterSpacing: 0.3 },
  title: { fontFamily: 'FredokaOne', fontSize: 18, color: OB.gold, textAlign: 'center' },
  seal: { backgroundColor: OB.goldFaint, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: OB.goldSoft },
  sealText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: OB.gold },
  rightText: { fontFamily: 'FredokaOne', fontSize: 15, color: OB.title, textAlign: 'center', lineHeight: 20 },
  rightSub: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '700', color: OB.textSoft, textAlign: 'center' },
  childSeal: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: OB.goldFaint,
  },
  childName: { fontFamily: 'FredokaOne', fontSize: 12, color: OB.title, maxWidth: 120 },
});
