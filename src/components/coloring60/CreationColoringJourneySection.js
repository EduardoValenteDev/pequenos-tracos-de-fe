/**
 * CreationColoringJourneySection.js — seção "Colorir com o Beni" na jornada de "A Criação".
 *
 * "Colorir com o Beni" é o nome que a CRIANÇA vê ("Colorir 60" é só o nome interno). São TRÊS
 * atividades dentro da mesma aventura (não uma aba, não cenas 11/12/13): "Haja luz",
 * "O mundo cheio de vida" e "Na criação de Deus". Cada uma abre o ColoringScreen existente por
 * (storyId, activityId) — nenhuma tela nova, nenhuma rota nova, nenhum lineart alterado.
 *
 * COMPONENTE PRESENTACIONAL: recebe o estado REAL (conclusão via `loadColoring60Done`) já resolvido
 * pela tela e apenas o desenha. O progresso "N de 3" e o passo recomendado vêm SEMPRE da conclusão
 * canônica do Colorir 60 — NUNCA da mera existência de um PNG. O writer de pixels
 * (coloring60DrawingStorage) é ISOLADO ao ColoringScreen (guard C60-P3→P4.T2), então a jornada não
 * o consulta; por isso não há estado "Em andamento" aqui — seria preciso ler o storage do writer.
 *
 * Estados por atividade:
 *   - `locked`      → antes de conhecer a história (jornada não concluída): trava suave, sem
 *                     abrir o colorir, sem cadeado agressivo, sem mensagem comercial.
 *   - `new`         → liberada e ainda não concluída ("Novo").
 *   - `done`        → concluída ("Concluído", com selo ✓).
 *
 * Visibilidade e gate do piloto são decididos pela TELA (StoryDetailScreen) — este componente só
 * é montado quando pode aparecer.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SoundButton from '../SoundButton';
import { BeniAvatar } from '../beni';
import { getColoring60Activities } from '../../data/coloring60Catalog';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

const CREATION_STORY_ID = 'creation';

// Identidade visual de cada atividade (§9): ícone + acento próprios, sem miniaturas novas.
// Ícones do conjunto MaterialCommunityIcons já usado no app (sol/folha/coração).
const ACTIVITY_UI = Object.freeze({
  light: {
    icon: 'weather-sunny',
    accent: '#F9C74F', accentDeep: '#E0A21A', tint: '#FFF5D6',
    blurb: 'A primeira luz do mundo',
  },
  living_world: {
    icon: 'leaf',
    accent: '#90BE6D', accentDeep: '#5E9C3E', tint: '#EBF5E0',
    blurb: 'Plantas, bichos e o mar',
  },
  people_and_care: {
    icon: 'heart',
    accent: '#FF7A45', accentDeep: '#C85A2E', tint: '#FFE6DB',
    blurb: 'O cuidado de Deus com todos',
  },
});

function stateOf({ unlocked, done }) {
  if (!unlocked) return 'locked';
  if (done) return 'done';
  return 'new';
}

function ActivityCard({ activity, state, recommended, isTablet, onPress }) {
  const ui = ACTIVITY_UI[activity.activityId] ?? ACTIVITY_UI.light;
  const locked = state === 'locked';
  const done = state === 'done';
  const iconColor = locked ? pt.textSoft : ui.accentDeep;

  const stateLabel =
    done ? 'Concluído'
      : state === 'new' ? 'Novo'
        : null; // locked não recebe rótulo (§6: sem cadeado agressivo/comercial)

  return (
    <SoundButton
      style={[
        styles.card,
        isTablet && styles.cardTablet,
        done && styles.cardDone,
        locked && styles.cardLocked,
        recommended && { borderColor: ui.accent, borderWidth: 2 },
      ]}
      onPress={locked ? undefined : onPress}
      disabled={locked}
      activeOpacity={0.85}
      accessibilityLabel={`${activity.title}${stateLabel ? ` · ${stateLabel}` : ''}`}
    >
      <View style={[styles.cardIcon, { backgroundColor: locked ? pt.border : ui.tint }]}>
        <MaterialCommunityIcons name={ui.icon} size={26} color={iconColor} />
      </View>
      <View style={styles.cardTextCol}>
        <Text style={styles.cardTitle}>{activity.title}</Text>
        <Text style={styles.cardBlurb} numberOfLines={2}>{ui.blurb}</Text>
        {stateLabel ? (
          <View style={styles.cardStateRow}>
            {done ? (
              <View style={[styles.stateDot, { backgroundColor: pt.greenSoft }]}>
                <Text style={[styles.stateDotText, { color: pt.freeText }]}>✓</Text>
              </View>
            ) : (
              <View style={[styles.stateDot, { backgroundColor: ui.tint }]}>
                <View style={[styles.stateDotInner, { backgroundColor: ui.accent }]} />
              </View>
            )}
            <Text style={[styles.cardStateLabel, done && { color: pt.freeText }]}>{stateLabel}</Text>
            {recommended ? (
              <Text style={[styles.recommendedTag, { color: ui.accentDeep }]}>· Comece por aqui</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </SoundButton>
  );
}

export default function CreationColoringJourneySection({
  unlocked,
  isTablet,
  doneMap = {},
  onOpenActivity,
}) {
  const activities = getColoring60Activities(CREATION_STORY_ID);
  const doneCount = activities.filter((a) => doneMap[a.activityId] === true).length;
  const total = activities.length || 3;
  const allDone = unlocked && doneCount >= total;

  // Passo recomendado: primeira atividade AINDA não concluída (ordem do catálogo). Só quando
  // liberado e ainda há o que colorir. É esse o card que ganha o realce delicado.
  const recommendedId = (unlocked && !allDone)
    ? (activities.find((a) => doneMap[a.activityId] !== true)?.activityId ?? null)
    : null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <BeniAvatar variant={allDone ? 'celebrating' : unlocked ? 'pointing' : 'thinking'} size="small" />
          <View style={styles.headerTextCol}>
            <Text style={styles.title}>Colorir com o Beni</Text>
            <Text style={styles.subtitle}>
              {!unlocked
                ? 'A luz, a vida e o cuidado de Deus, do seu jeitinho.'
                : allDone
                  ? 'Você coloriu toda a criação. Que lindo!'
                  : 'Vamos dar cor ao que Deus criou?'}
            </Text>
          </View>
          {unlocked ? (
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{doneCount} de {total}</Text>
            </View>
          ) : null}
        </View>

        {!unlocked ? (
          // §6 · trava suave ANTES de conhecer a história. Convida sem parecer erro nem cobrança.
          <View style={styles.lockNote}>
            <Text style={styles.lockNoteText}>Conheça a história para liberar os desenhos.</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.cards, isTablet && styles.cardsTablet]}>
        {activities.map((activity) => (
          <ActivityCard
            key={activity.activityId}
            activity={activity}
            state={stateOf({
              unlocked,
              done: doneMap[activity.activityId] === true,
            })}
            recommended={recommendedId === activity.activityId}
            isTablet={isTablet}
            onPress={() => onOpenActivity?.(activity.activityId)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: radii.lg,
    backgroundColor: '#FFF',
    borderWidth: 1.5, borderColor: pt.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  header: { padding: 16, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  headerTextCol: { flex: 1, marginLeft: 12 },
  title: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  subtitle: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, marginTop: 2, lineHeight: 18 },
  progressPill: {
    marginLeft: 8, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radii.pill, backgroundColor: pt.freeBg,
  },
  progressPillText: { fontFamily: 'FredokaOne', fontSize: 13, color: pt.freeText },

  lockNote: {
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: radii.md, backgroundColor: '#F4EFE8',
  },
  lockNoteText: { fontFamily: 'Nunito', fontSize: 13, color: '#9B8D80', textAlign: 'center' },

  cards: { padding: 12, paddingTop: 4, gap: 10 },
  cardsTablet: { flexDirection: 'row' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: radii.md,
    padding: 14, minHeight: 84,
    borderWidth: 1.5, borderColor: pt.border,
  },
  cardTablet: { flex: 1, flexDirection: 'column', alignItems: 'flex-start' },
  cardDone: { backgroundColor: '#FCFDFB' },
  cardLocked: { opacity: 0.6 },
  cardIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTextCol: { flex: 1, marginLeft: 14 },
  cardTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  cardBlurb: { fontFamily: 'Nunito', fontSize: 12.5, color: pt.textSoft, marginTop: 2, lineHeight: 17 },
  cardStateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stateDot: {
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', marginRight: 6,
  },
  stateDotText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800' },
  stateDotInner: { width: 8, height: 8, borderRadius: 4 },
  cardStateLabel: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700' },
  recommendedTag: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', marginLeft: 4 },
});
