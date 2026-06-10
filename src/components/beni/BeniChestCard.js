/**
 * BeniChestCard — cartinha colecionável do Baú do Beni.
 *
 * Estados: unlocked | locked | new (badge "Nova" quando unlocked e não vista).
 * Raridade: common | special | shiny (apenas brilho/moldura, sem economia).
 *
 * Bloqueada vira "verso de cartinha" (gradiente + cadeado + "Cartinha escondida"),
 * nunca um quadrado vazio ou texto de interrogação.
 *
 * TODO(assets): substituir por molduras/versos/brilho shiny próprios e ícones
 * de categoria quando os assets existirem (baú fechado/aberto, verso, molduras).
 */
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../SoundButton';
import BeniAvatar from './BeniAvatar';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import { resolveCardImageSource, CARD_FALLBACK } from '../../services/beniChestService';

const GOLD = '#F4B400';

/* Rede de segurança ATRÁS de uma imagem real (raramente visível). Usa o
   gradiente vivo para que, se a imagem falhar, ainda apareça algo premium. */
function CategoryFallback({ card }) {
  const fb = CARD_FALLBACK[card.category] || CARD_FALLBACK.beni;
  return (
    <LinearGradient colors={fb.gradStrong || fb.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fallbackFill}>
      <Text style={styles.fallbackIcon}>{fb.icon}</Text>
      <Text style={styles.fallbackLabel} numberOfLines={1}>{fb.label}</Text>
    </LinearGradient>
  );
}

/* Fallback PREMIUM da cartinha DESBLOQUEADA sem imagem: fundo vivo + ícone
   grande + selo "Desbloqueada" + origem curta. NUNCA parece um card vazio ou
   o verso bloqueado (apagado). */
function PremiumFallback({ card }) {
  const fb = CARD_FALLBACK[card.category] || CARD_FALLBACK.beni;
  return (
    <LinearGradient colors={fb.gradStrong || fb.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumFill}>
      <View style={styles.premiumSeal}>
        <Text style={styles.premiumSealText}>✓ Desbloqueada</Text>
      </View>
      <Text style={styles.premiumIcon}>{card.emoji || fb.icon}</Text>
      {!!card.origin && (
        <Text style={styles.premiumOrigin} numberOfLines={2}>{card.origin}</Text>
      )}
    </LinearGradient>
  );
}

/* Assinatura estável do source → usada como key para resetar o estado de
   load/erro quando a imagem da cartinha muda (sem vazar entre cards). */
function sourceSignature(source) {
  if (source == null) return 'none';
  if (typeof source === 'number') return `req:${source}`;
  if (typeof source === 'object' && source.uri) return `uri:${String(source.uri).slice(0, 32)}`;
  return 'obj';
}

/**
 * BeniChestCardImage — imagem da cartinha com fallback PREMIUM por baixo.
 *
 * Começa mostrando o PremiumFallback (vivo + selo + origem). A imagem real só
 * fica visível quando onLoad confirma o carregamento (opacity 0 até lá) — assim
 * NUNCA aparece o ícone pequeno/estado quebrado durante o load. Em onError, a
 * imagem é removida e o fallback premium permanece. O estado é por instância e
 * reseta via key (card.id + assinatura do source) — não vaza ao rolar a lista.
 */
function BeniChestCardImage({ card, source, resizeMode }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  return (
    <View style={styles.artFill}>
      <PremiumFallback card={card} />
      {!errored && (
        <Image source={source}
          style={[styles.artImgAbsolute, !loaded && styles.imgHidden]}
          resizeMode={resizeMode}
          fadeDuration={0}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </View>
  );
}

function CardArt({ card }) {
  // Beni: avatar próprio (nunca usa imagem).
  if (card.beni) {
    return (
      <LinearGradient colors={CARD_FALLBACK.beni.gradStrong || CARD_FALLBACK.beni.grad} style={styles.artCenter}>
        <BeniAvatar variant="celebrating" size="large" />
      </LinearGradient>
    );
  }

  const source = resolveCardImageSource(card);
  const isArt = card.category === 'artes';

  // Arte: enquadramento "contain" sobre fundo creme (evita corte ruim).
  if (isArt && source) {
    return (
      <View style={[styles.artFill, styles.artCanvasBg]}>
        <Image source={source} style={styles.artImg} resizeMode="contain" />
      </View>
    );
  }

  // Com imagem (cena/história): PremiumFallback por baixo + imagem que só aparece
  // após onLoad → nunca mostra ícone pequeno/quebrado enquanto carrega.
  if (source) {
    return (
      <BeniChestCardImage
        key={`img-${card.id}-${sourceSignature(source)}`}
        card={card}
        source={source}
        resizeMode="cover"
      />
    );
  }

  // Sem imagem: fallback PREMIUM (vivo, selo + origem) — recompensa real, nunca vazio.
  return <PremiumFallback card={card} />;
}

export default function BeniChestCard({ card, isNew = false, onPress, style }) {
  if (!card) return null;
  const color = card.color || GOLD;
  const rarity = card.rarity || 'common';
  const shiny = rarity === 'shiny';
  const special = rarity === 'special';

  // ── Bloqueada: verso de cartinha ──
  if (!card.unlocked) {
    return (
      <SoundButton activeOpacity={0.85} onPress={onPress} style={[styles.card, style]}>
        <LinearGradient
          colors={[color + '22', '#EFE7DA']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.backCover}
        >
          <Text style={styles.backIcon}>🧰</Text>
          <Text style={styles.backTitle}>Cartinha escondida</Text>
          <Text style={styles.backSub}>Continue a aventura para revelar.</Text>
          <View style={styles.backLock}><Text style={styles.backLockText}>🔒</Text></View>
        </LinearGradient>
      </SoundButton>
    );
  }

  // ── Desbloqueada ──
  // Cartinhas com imagem/avatar ganham o selo de check ✓ "Desbloqueada"; as
  // sem imagem usam o PremiumFallback (que já traz o selo "Desbloqueada").
  const hasRealImage = !!card.beni || !!resolveCardImageSource(card);
  return (
    <SoundButton
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: shiny ? GOLD : color, borderWidth: special || shiny ? 3 : 2.5 },
        shiny ? styles.cardShiny : shadows.card,
        style,
      ]}
    >
      <View style={styles.artWrap}>
        <CardArt card={card} />

        {/* Selo de tipo */}
        <View style={[styles.typeBadge, { backgroundColor: color }]}>
          <Text style={styles.typeBadgeText}>{card.type}</Text>
        </View>

        {/* Selo "Desbloqueada" (check) — diferencia na hora do verso bloqueado */}
        {hasRealImage && (
          <View style={styles.unlockedSeal} pointerEvents="none">
            <Text style={styles.unlockedSealText}>✓</Text>
          </View>
        )}

        {/* Brilho discreto */}
        <View style={[styles.shine, shiny && styles.shineShiny]} pointerEvents="none" />
        {shiny && <Text style={styles.sparkle}>✨</Text>}

        {/* Badge "Nova" */}
        {isNew && (
          <View style={styles.newBadge}><Text style={styles.newBadgeText}>Nova</Text></View>
        )}
      </View>
      {/* Rodapé com tom da categoria → fundo vivo, nunca creme apagado */}
      <Text style={[styles.cardTitle, { backgroundColor: color + '14' }]} numberOfLines={2}>{card.title}</Text>
    </SoundButton>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: radii.lg,
    marginBottom: 12, overflow: 'hidden',
  },
  cardShiny: {
    elevation: 5, shadowColor: GOLD,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,
  },

  artWrap: { width: '100%', aspectRatio: 1, position: 'relative', backgroundColor: '#F3EEE6' },
  artImg: { width: '100%', height: '100%' },
  artImgAbsolute: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  imgHidden: { opacity: 0 },
  artFill: { width: '100%', height: '100%', position: 'relative' },
  artCanvasBg: { backgroundColor: '#FFFDF8', justifyContent: 'center', alignItems: 'center' },
  artCenter: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  // Fallback de categoria (rede de segurança atrás da imagem)
  fallbackFill: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  fallbackIcon: { fontSize: 36, marginBottom: 4 },
  fallbackLabel: { fontFamily: 'FredokaOne', fontSize: 12, color: 'rgba(255,255,255,0.92)', textAlign: 'center' },

  // Fallback PREMIUM (desbloqueada sem imagem) — vivo, com selo e origem
  premiumFill: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  premiumIcon: {
    fontSize: 52, marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  premiumSeal: {
    position: 'absolute', top: 8, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  premiumSealText: { fontFamily: 'FredokaOne', fontSize: 10, color: '#2E7D32' },
  premiumOrigin: {
    fontFamily: 'Nunito', fontSize: 11, color: '#FFFFFF', fontWeight: '800',
    textAlign: 'center', lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.22)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },

  // Selo "Desbloqueada" (check) nas cartinhas com imagem
  unlockedSeal: {
    position: 'absolute', bottom: 8, left: 8,
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#2E7D32',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  unlockedSealText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF', marginTop: -1 },

  typeBadge: {
    position: 'absolute', top: 8, left: 8, borderRadius: radii.pill,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  typeBadgeText: { fontFamily: 'Nunito', fontSize: 10, color: '#FFF', fontWeight: '800' },

  shine: {
    position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  shineShiny: { backgroundColor: 'rgba(249,199,79,0.4)', width: 52, height: 52, borderRadius: 26 },
  sparkle: { position: 'absolute', bottom: 6, right: 8, fontSize: 16 },

  newBadge: {
    position: 'absolute', top: 8, right: 8, backgroundColor: '#E23B5A',
    borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1.5, borderColor: '#FFF',
  },
  newBadgeText: { fontFamily: 'FredokaOne', fontSize: 10, color: '#FFF' },

  cardTitle: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.text, paddingHorizontal: 10, paddingVertical: 9, minHeight: 38, lineHeight: 17 },

  // Verso (bloqueada)
  backCover: {
    width: '100%', aspectRatio: 1 / 1.18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, position: 'relative',
  },
  backIcon: { fontSize: 34, opacity: 0.5, marginBottom: 6 },
  backTitle: { fontFamily: 'FredokaOne', fontSize: 13, color: '#8A7A64', textAlign: 'center' },
  backSub: { fontFamily: 'Nunito', fontSize: 10.5, color: '#A89A86', fontWeight: '700', textAlign: 'center', marginTop: 2, lineHeight: 14 },
  backLock: {
    position: 'absolute', bottom: 8, right: 8,
    width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  backLockText: { fontSize: 11 },
});
