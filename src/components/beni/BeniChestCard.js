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
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../SoundButton';
import BeniAvatar from './BeniAvatar';
import SafeImage from '../ui/SafeImage';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import { resolveCardImageSource, CARD_FALLBACK } from '../../services/beniChestService';

const GOLD = '#F4B400';

/* Fundo bonito por categoria — garante que a cartinha nunca pareça vazia. */
function CategoryFallback({ card }) {
  const fb = CARD_FALLBACK[card.category] || CARD_FALLBACK.beni;
  return (
    <LinearGradient colors={fb.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fallbackFill}>
      <Text style={styles.fallbackIcon}>{fb.icon}</Text>
      <Text style={styles.fallbackLabel} numberOfLines={1}>{fb.label}</Text>
    </LinearGradient>
  );
}

function CardArt({ card }) {
  // Beni: avatar próprio (nunca usa imagem).
  if (card.beni) {
    return (
      <LinearGradient colors={CARD_FALLBACK.beni.grad} style={styles.artCenter}>
        <BeniAvatar variant="celebrating" size="large" />
      </LinearGradient>
    );
  }

  const source = resolveCardImageSource(card);
  if (!source) {
    // Sem imagem: fallback de categoria (bonito, com rótulo) — nunca vazio.
    return <CategoryFallback card={card} />;
  }

  const isArt = card.category === 'artes';
  // SafeImage: loading/erro/fallback. Em erro/ausência, mostra o fallback de
  // categoria (nunca corpo vazio). Arte usa "contain" sobre fundo creme.
  return (
    <SafeImage
      source={source}
      fill
      style={isArt ? styles.artCanvasBg : null}
      resizeMode={isArt ? 'contain' : 'cover'}
      renderFallback={() => <CategoryFallback card={card} />}
    />
  );
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
          <Text style={styles.backSub}>Continue a jornada para revelar</Text>
          <View style={styles.backLock}><Text style={styles.backLockText}>🔒</Text></View>
        </LinearGradient>
      </SoundButton>
    );
  }

  // ── Desbloqueada ──
  return (
    <SoundButton
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: shiny ? GOLD : color, borderWidth: special || shiny ? 2.5 : 2 },
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

        {/* Brilho discreto */}
        <View style={[styles.shine, shiny && styles.shineShiny]} pointerEvents="none" />
        {shiny && <Text style={styles.sparkle}>✨</Text>}

        {/* Badge "Nova" */}
        {isNew && (
          <View style={styles.newBadge}><Text style={styles.newBadgeText}>Nova</Text></View>
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{card.title}</Text>
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
  artFill: { width: '100%', height: '100%', position: 'relative' },
  artCanvasBg: { backgroundColor: '#FFFDF8', justifyContent: 'center', alignItems: 'center' },
  artCenter: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  // Fallback de categoria
  fallbackFill: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  fallbackIcon: { fontSize: 36, marginBottom: 4 },
  fallbackLabel: { fontFamily: 'FredokaOne', fontSize: 12, color: 'rgba(58,42,30,0.66)', textAlign: 'center' },

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
