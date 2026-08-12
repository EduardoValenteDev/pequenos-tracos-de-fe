import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { colors } from '../theme/colors';
import { images } from '../assets/images';
import SoundButton from '../components/SoundButton';
import { isQuizDone, getReflection, isStoryBookOpened } from '../services/postStoryStorage';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import LockedStoryFallback from '../components/premium/LockedStoryFallback';
import EditorialSurface from '../components/layout/EditorialSurface';
import { useWindowBand, BANDS } from '../hooks/useWindowBand';

function HubCard({ emoji, title, desc, cta, tagColor, done, onPress }) {
  return (
    <SoundButton
      style={[styles.hubCard, done && styles.hubCardDone]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.hubCardIconCircle, { backgroundColor: tagColor + '22' }]}>
        <Text style={styles.hubCardEmoji}>{emoji}</Text>
      </View>
      <View style={styles.hubCardInfo}>
        <Text style={styles.hubCardTitle}>{title}</Text>
        <Text style={styles.hubCardDesc}>{desc}</Text>
      </View>
      <View style={styles.hubCardRight}>
        {done ? (
          <View style={[styles.hubTag, { backgroundColor: pt.greenSoft }]}>
            <Text style={[styles.hubTagText, { color: pt.freeText }]}>✓ Feito</Text>
          </View>
        ) : (
          <View style={[styles.hubTag, { backgroundColor: tagColor + '22' }]}>
            <Text style={[styles.hubTagText, { color: tagColor }]}>{cta}</Text>
          </View>
        )}
        <Text style={styles.hubCardArrow}>›</Text>
      </View>
    </SoundButton>
  );
}

export default function PostStoryHubScreen({ route, navigation }) {
  const { story } = route.params;
  const insets = useSafeAreaInsets();
  // [F6-SG-C · TK-C-003] Decisão discreta ⇒ faixa, não medida. Migração neutra:
  // `MEDIUM` e `EXPANDED` seguem equivalentes, como o antigo `width >= 600`.
  const { band } = useWindowBand();
  const isTablet = band !== BANDS.COMPACT;

  const [quizDone, setQuizDone] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [bookOpened, setBookOpened] = useState(false);

  useFocusEffect(
    useCallback(() => {
      isQuizDone(story.id).then(setQuizDone);
      getReflection(story.id).then(r => setReflectionDone(!!r));
      isStoryBookOpened(story.id).then(setBookOpened);
    }, [story.id]),
  );

  if (!canOpenStoryFullExperience(story)) {
    return (
      <LockedStoryFallback
        onBack={() => navigation.navigate('Home')}
        onCallResponsible={() => navigation.navigate('ParentArea')}
      />
    );
  }

  const hasImage = story.imagemCapa && images[story.imagemCapa];

  function handleLibrinho() {
    navigation.navigate('StoryBook', { story });
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header gradient ── */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={[styles.header, { paddingTop: Math.max(insets.top, 32) }]}
        >
          <Text style={styles.headerEmoji}>🎉</Text>
          <Text style={styles.headerTitle}>Você completou a aventura!</Text>
          <Text style={styles.headerSub}>Agora veja tudo que você desbloqueou.</Text>
        </LinearGradient>

        {/* ── [F6-SG-C · TK-C-006] Família Editorial ──
            A coluna de leitura são as ESCOLHAS: o que a criança desbloqueou e para
            onde ela pode ir agora. A capa da história é o que ela acabou de viver —
            material de apoio, e por isso vai para a região lateral na faixa
            expandida. Nada foi criado para preencher espaço (`D4`): é a MESMA capa
            que já estava aqui, recolocada. Nas faixas que não abrem a região ela
            volta ao topo da coluna, como sempre esteve. */}
        <EditorialSurface
          style={[styles.body, isTablet && styles.bodyTablet]}
          support={(
            <View style={styles.storyCoverCard}>
              {hasImage ? (
                <Image
                  source={images[story.imagemCapa]}
                  style={styles.storyCoverImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.storyCoverFallback}>
                  <Text style={styles.storyCoverEmoji}>{story.emoji}</Text>
                  <Text style={styles.storyCoverTitle}>{story.titulo}</Text>
                </View>
              )}
            </View>
          )}
          supportStyle={styles.apoio}
        >

          {/* ── Unlocked label ── */}
          <Text style={styles.unlockedLabel}>Você desbloqueou:</Text>

          {/* ── Livrinho ── */}
          <HubCard
            emoji="📖"
            title="Meu Livrinho da Fé"
            desc="Veja sua história com os desenhos que você coloriu."
            cta="Abrir"
            tagColor={pt.blue}
            done={bookOpened}
            onPress={handleLibrinho}
          />

          {/* ── Quiz ── */}
          <HubCard
            emoji="⭐"
            title="Quiz da História"
            desc="Responda perguntas simples sobre o que aprendeu."
            cta="+1 ⭐"
            tagColor={pt.gold}
            done={quizDone}
            onPress={() => navigation.navigate('Quiz', { story })}
          />

          {/* ── Beni ── */}
          {/* A6: "Guardar no coração" é grátis no MVP — sem rótulo Plano Família. */}
          <HubCard
            emoji="✨"
            title="Guardar no coração"
            desc="Conte o que você aprendeu com essa história."
            cta="+1 ⭐"
            tagColor={pt.purple}
            done={reflectionDone}
            onPress={() => navigation.navigate('Reflection', { story })}
          />

          {/* ── Back ── */}
          <SoundButton
            style={styles.backBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.backBtnText}>🏠 Voltar para o início</Text>
          </SoundButton>
        </EditorialSurface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },
  container: { flex: 1 },

  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerEmoji: { fontSize: 52, marginBottom: 8 },
  headerTitle: {
    fontFamily: 'FredokaOne', fontSize: 24, color: '#FFF', marginBottom: 6,
    textAlign: 'center',
  },
  headerSub: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 20,
  },

  body: { paddingHorizontal: 16, paddingTop: 20 },
  bodyTablet: { paddingHorizontal: 48 },

  // Respiro entre a coluna de escolhas e a capa, no mesmo ritmo do resto da tela.
  apoio: { paddingLeft: 20 },

  storyCoverCard: {
    backgroundColor: '#FFF8EF',
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: 20,
    height: 160,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.soft,
  },
  storyCoverImage: { width: '100%', height: '100%' },
  storyCoverFallback: { alignItems: 'center', padding: 20 },
  storyCoverEmoji: { fontSize: 56, marginBottom: 8 },
  storyCoverTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center',
  },

  unlockedLabel: {
    fontFamily: 'FredokaOne', fontSize: 15, color: pt.text,
    marginBottom: 12,
  },

  hubCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    padding: 16, marginBottom: 12, gap: 14,
    ...shadows.card,
  },
  hubCardDone: { opacity: 0.75 },
  hubCardIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  hubCardEmoji: { fontSize: 26 },
  hubCardInfo: { flex: 1 },
  hubCardTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text, marginBottom: 3 },
  hubCardDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 17 },
  hubCardRight: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  hubTag: {
    borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3,
  },
  hubTagText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700' },
  hubCardArrow: { fontFamily: 'FredokaOne', fontSize: 20, color: pt.muted },

  backBtn: {
    marginTop: 12,
    backgroundColor: pt.border,
    borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center',
  },
  backBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },

});
