import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StoryCoverImage from './StoryCoverImage';
import CartaoPagina from '../ui/CartaoPagina';
import TrilhoProgresso from '../ui/TrilhoProgresso';
import { color, font, fontSize, fontWeight, radius, shadow, seal } from '../../theme/tokens';
import { storyHasAllRequiredAudio } from '../../services/audioService';

/**
 * StoryBookHero — hero de detalhe da história (A0.5/A0.6, Direção de Arte v1.1).
 *
 * Componente de EXIBIÇÃO do estado pré-história: capa com MOLDURA "Galeria Viva"
 * (borda dourada + papel, arte original intacta — D4), título em Fraunces, SELOS
 * coesos (Grátis verde / Plano Família lilás / Concluída dourada), "Lição do
 * coração" como citação em papel e painel "Nesta aventura" (com variante concluída).
 *
 * O selo "Concluída" (dourado) SÓ aparece com `isFullyComplete` (cenas + Livrinho +
 * quiz + reflexão) — nunca por 10/10 cenas sozinho. O botão principal NÃO vive aqui
 * (é o StoryDetailScreen que renderiza o BotaoPrimario).
 */
export default function StoryBookHero({
  story,
  progressCount = 0,
  totalScenes = 0,
  isTablet = false,
  isFullyComplete = false,
  isComingSoon = false,
  isLocked = false,
}) {
  const xpPercent = totalScenes > 0 ? Math.min(progressCount / totalScenes, 1) : 0;
  const hasAudio = storyHasAllRequiredAudio(story.id);
  const focusTop = story.coverSafeArea === 'top';

  const isPremium = story.accessType === 'premium';
  const acessoVariant = isPremium ? 'premium' : 'free';
  const acessoLabel = isPremium ? 'Plano Família' : 'Grátis';

  // Selo de estado: "Concluída" (dourado) só quando de fato completo; "Em breve" e
  // "Em andamento" usam papel neutro (não competem com acesso/conclusão).
  const statusSeal = isFullyComplete ? { label: 'Concluída', variant: 'done' }
    : isComingSoon ? { label: 'Em breve', variant: null }
    : progressCount > 0 ? { label: 'Em andamento', variant: null }
    : null;

  const Moldura = ({ children, style }) => (
    <View style={[styles.moldura, style]} pointerEvents="box-none">
      {children}
    </View>
  );

  const Selo = ({ label, variant }) => {
    const s = (variant && seal[variant]) || { bg: color.paper100, border: color.paper200, text: color.ink600 };
    return (
      <View style={[styles.selo, { backgroundColor: s.bg, borderColor: s.border }]}>
        <Text style={[styles.seloText, { color: s.text }]} numberOfLines={1}>{label}</Text>
      </View>
    );
  };

  const InfoSection = () => (
    <View style={styles.info}>
      <View style={styles.chipRow}>
        <Selo label={acessoLabel} variant={acessoVariant} />
        {statusSeal && <Selo label={statusSeal.label} variant={statusSeal.variant} />}
      </View>

      <Text style={[styles.title, isTablet && styles.titleTablet]}>{story.titulo}</Text>

      {!!story.referencia && <Text style={styles.ref}>{story.referencia}</Text>}

      {!!story.licaoCoracao && (
        <CartaoPagina style={styles.licaoCard}>
          <Text style={styles.licaoAspas}>“</Text>
          <Text style={styles.licaoLabel}>Lição do coração</Text>
          <Text style={styles.licao}>{story.licaoCoracao}</Text>
        </CartaoPagina>
      )}

      {totalScenes > 0 && (
        <CartaoPagina style={styles.aventuraCard}>
          <Text style={styles.aventuraTitulo}>Nesta aventura</Text>
          {isFullyComplete ? (
            <>
              <Text style={styles.aventuraTexto}>
                Você {hasAudio ? 'ouviu, ' : ''}coloriu e ganhou estrelas.
              </Text>
              <Text style={[styles.aventuraTexto, styles.aventuraTexto2]}>
                Sua aventura ficou guardada no{' '}
                <Text style={styles.aventuraDestaque}>Livrinho da Fé</Text>.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.aventuraTexto}>
                Você vai {hasAudio ? 'ouvir, ' : ''}colorir e ganhar estrelas.
              </Text>
              {!isComingSoon && !isLocked && (
                <Text style={[styles.aventuraTexto, styles.aventuraTexto2]}>
                  Ao terminar, sua aventura vira um{' '}
                  <Text style={styles.aventuraDestaque}>Livrinho da Fé</Text>.
                </Text>
              )}
            </>
          )}
        </CartaoPagina>
      )}

      {progressCount > 0 && totalScenes > 0 && (
        <View style={styles.progressArea}>
          <TrilhoProgresso progress={xpPercent} height={8} />
          <Text style={styles.progressLabel}>{progressCount}/{totalScenes} cenas</Text>
        </View>
      )}

      {isLocked && !isComingSoon && (
        <Text style={styles.helper}>Peça a um responsável para desbloquear.</Text>
      )}
    </View>
  );

  if (isTablet) {
    return (
      <View style={styles.tabletRow}>
        <View style={styles.tabletInfo}>
          <InfoSection />
        </View>
        <View style={styles.tabletCoverCol}>
          <Moldura>
            <StoryCoverImage story={story} rounded style={styles.coverInner} focusTop={focusTop} />
          </Moldura>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileWrap}>
      <Moldura style={styles.mobileMoldura}>
        <StoryCoverImage story={story} rounded style={styles.coverInner} focusTop={focusTop} />
      </Moldura>
      <View style={styles.mobileInfo}>
        <InfoSection />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── MOLDURA GALERIA VIVA (borda dourada + papel; arte intacta por dentro) ──
  moldura: {
    backgroundColor: color.paper100,
    borderWidth: 2,
    borderColor: color.gold500,
    borderRadius: radius.card,
    padding: 6,
    shadowColor: shadow.color,
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    shadowOffset: shadow.offset,
    elevation: 3,
  },
  coverInner: { borderRadius: radius.chip, overflow: 'hidden' },

  mobileWrap: { marginHorizontal: 16, marginTop: 12 },
  mobileMoldura: {},
  mobileInfo: { paddingTop: 4 },

  tabletRow: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 8, gap: 24, alignItems: 'flex-start' },
  tabletInfo: { flex: 6 },
  tabletCoverCol: { flex: 4, paddingTop: 16 },

  info: { paddingTop: 14 },
  chipRow: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },

  // Selos de acesso/estado (cores coesas por tokens.seal)
  selo: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    borderRadius: radius.chip, borderWidth: 1,
    paddingVertical: 5, paddingHorizontal: 11, marginRight: 6, marginBottom: 4,
  },
  seloText: {
    fontFamily: font.bodyBold, fontWeight: fontWeight.uiLabel, fontSize: fontSize.caption,
  },

  title: {
    fontFamily: font.display,          // Fraunces
    fontSize: fontSize.titleScreen,    // 28
    color: color.ink900,
    lineHeight: fontSize.titleScreen * 1.15,
    marginBottom: 4,
  },
  titleTablet: { fontSize: fontSize.display, lineHeight: fontSize.display * 1.12 },

  ref: {
    fontFamily: font.body,
    fontSize: fontSize.caption,
    color: color.ink600,
    fontStyle: 'italic',
    marginBottom: 14,
  },

  // Lição do coração — citação em papel, sentence case (sem CAPS pesada)
  licaoCard: { marginBottom: 14 },
  licaoAspas: {
    position: 'absolute', top: 2, left: 8,
    fontFamily: font.display, fontSize: 44, color: color.gold300,
  },
  licaoLabel: {
    fontFamily: font.bodyBold, fontWeight: fontWeight.uiLabel,
    fontSize: fontSize.caption, color: color.gold700,
    marginLeft: 22, marginBottom: 4,
  },
  licao: {
    fontFamily: font.body, fontWeight: fontWeight.uiLabel,
    fontSize: fontSize.bodySmall, color: color.ink900,
    lineHeight: fontSize.bodySmall * 1.5, marginLeft: 22,
  },

  // Painel "Nesta aventura" — papel liso (não compete com a aspa dourada da lição)
  aventuraCard: { marginBottom: 14 },
  aventuraTitulo: {
    fontFamily: font.bodyBold, fontWeight: fontWeight.uiLabel,
    fontSize: fontSize.caption, color: color.ink600, marginBottom: 4,
  },
  aventuraTexto: {
    fontFamily: font.body, fontSize: fontSize.bodySmall, color: color.ink900,
    lineHeight: fontSize.bodySmall * 1.5,
  },
  aventuraTexto2: { marginTop: 6 },
  aventuraDestaque: {
    fontFamily: font.bodyBold, fontWeight: fontWeight.uiLabel, color: color.ink900,
  },

  progressArea: { marginBottom: 14 },
  progressLabel: {
    fontFamily: font.body, fontSize: fontSize.caption, color: color.ink600, marginTop: 4,
  },

  helper: {
    fontFamily: font.body, fontSize: fontSize.caption, color: color.ink600,
    textAlign: 'center', marginTop: 6,
  },
});
