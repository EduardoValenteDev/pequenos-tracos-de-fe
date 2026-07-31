/**
 * CreationColoringJourneySection.js — seção "Colorir com o Beni" na jornada de "A Criação".
 *
 * "Colorir com o Beni" é o nome que a CRIANÇA vê ("Colorir 60" é só o nome interno). São TRÊS
 * atividades dentro da mesma aventura (não uma aba, não cenas 11/12/13): "Haja luz",
 * "O mundo cheio de vida" e "Na criação de Deus". Cada uma abre o ColoringScreen existente por
 * (storyId, activityId) — nenhuma tela nova, nenhuma rota nova, nenhum lineart alterado.
 *
 * [C60-P13-CARD] §Parte 2 — as três atividades NÃO são desenhos avulsos: são as três partes de UMA
 * jornada (1. Luz · 2. Vida · 3. Cuidado). Por isso a seção mostra, além dos três cards, uma TRILHA
 * visual que liga as partes pelos símbolos que já existem (sol · folha · coração) e UMA ação
 * principal que muda com o progresso (começar · continuar · completar · ver a coleção). A liberdade
 * de escolha é preservada: cada card continua abrindo direto a sua parte, em qualquer ordem.
 *
 * COMPONENTE PRESENTACIONAL: recebe o estado REAL (conclusão via `loadColoring60Done`) já resolvido
 * pela tela e apenas o desenha. Quem DERIVA "quanto completei / qual é a próxima / qual ação
 * oferecer" é `coloring60Journey` — a MESMA função que dirige a celebração, para que o cartão e a
 * festa jamais discordem. O progresso "N de 3" e o passo recomendado vêm SEMPRE da conclusão
 * canônica do Colorir 60 — NUNCA da mera existência de um PNG. O writer de pixels
 * (coloring60DrawingStorage) é ISOLADO ao ColoringScreen (guard C60-P3→P4.T2), então a jornada não
 * o consulta; por isso "Em andamento" existe na derivação mas nenhum passo o recebe aqui.
 *
 * Estados por atividade:
 *   - `locked`      → antes de conhecer a história (jornada não concluída): trava suave, sem
 *                     abrir o colorir, sem cadeado agressivo, sem mensagem comercial.
 *   - `next`        → liberada, ainda não concluída e é a PRÓXIMA recomendada.
 *   - `available`   → liberada e ainda não concluída ("Novo").
 *   - `done`        → concluída ("Concluído", com selo ✓).
 *
 * Visibilidade e gate do piloto são decididos pela TELA (StoryDetailScreen) — este componente só
 * é montado quando pode aparecer. Com o piloto desligado nada disto entra em cena e a experiência
 * anterior da tela de história permanece exatamente como era.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SoundButton from '../SoundButton';
import { BeniAvatar } from '../beni';
import { getColoring60Activities } from '../../data/coloring60Catalog';
import {
  deriveColoring60CardState,
  COLORING60_ACTION,
  COLORING60_STEP_STATE,
} from '../../services/coloring60Journey';
import { colors as pt, radii, shadows } from '../../theme/productTheme';

const CREATION_STORY_ID = 'creation';

// Identidade visual de cada atividade (§9): ícone + acento próprios, sem miniaturas novas.
// Ícones do conjunto MaterialCommunityIcons já usado no app (sol/folha/coração) — são ELES que
// fazem a conexão temática da trilha (Luz → Vida → Cuidado), sem nenhum asset novo.
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

// Rótulo de estado que a criança lê no card. `locked` não recebe rótulo (§6: sem cadeado agressivo).
const STATE_LABEL = Object.freeze({
  [COLORING60_STEP_STATE.DONE]: 'Concluído',
  [COLORING60_STEP_STATE.NEXT]: 'Próxima',
  [COLORING60_STEP_STATE.IN_PROGRESS]: 'Em andamento',
  [COLORING60_STEP_STATE.AVAILABLE]: 'Novo',
  [COLORING60_STEP_STATE.LOCKED]: null,
});

/**
 * [C60-P13-CARD] TRILHA compacta: três símbolos ligados por um fio. É a leitura de UM segundo — "já
 * fiz isto, estou aqui, falta aquilo" — sem virar uma tela gigante. Decorativa para o leitor de tela
 * (a informação já está nos cards e na contagem), por isso sai da árvore de acessibilidade.
 */
function JourneyTrail({ steps }) {
  return (
    <View style={styles.trail} importantForAccessibility="no-hide-descendants" accessible={false}>
      {steps.map((step, i) => {
        const ui = ACTIVITY_UI[step.activityId] ?? ACTIVITY_UI.light;
        const done = step.state === COLORING60_STEP_STATE.DONE;
        const isNext = step.state === COLORING60_STEP_STATE.NEXT;
        const locked = step.state === COLORING60_STEP_STATE.LOCKED;
        const prevDone = i > 0 && steps[i - 1].state === COLORING60_STEP_STATE.DONE;
        return (
          <React.Fragment key={step.activityId}>
            {i > 0 ? (
              <View style={[styles.trailLink, prevDone && done && { backgroundColor: ui.accent }]} />
            ) : null}
            <View style={styles.trailItem}>
              <View
                style={[
                  styles.trailMarker,
                  { backgroundColor: locked ? pt.border : ui.tint, borderColor: locked ? pt.border : ui.accent },
                  done && { backgroundColor: ui.accent, borderColor: ui.accentDeep },
                  isNext && styles.trailMarkerNext,
                ]}
              >
                <MaterialCommunityIcons
                  name={ui.icon}
                  size={18}
                  color={done ? '#FFF' : (locked ? pt.textSoft : ui.accentDeep)}
                />
              </View>
              <Text style={[styles.trailTheme, locked && { color: pt.textSoft }]} numberOfLines={1}>
                {step.theme}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

function ActivityCard({ activity, state, recommended, isTablet, onPress }) {
  const ui = ACTIVITY_UI[activity.activityId] ?? ACTIVITY_UI.light;
  const locked = state === COLORING60_STEP_STATE.LOCKED;
  const done = state === COLORING60_STEP_STATE.DONE;
  const iconColor = locked ? pt.textSoft : ui.accentDeep;

  const stateLabel = STATE_LABEL[state] ?? null;

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
  onOpenCollection,
}) {
  const activities = getColoring60Activities(CREATION_STORY_ID);
  // [C60-P13-CARD] Uma única derivação (§Parte 1/2): contagem, estado de cada passo, próxima
  // recomendada e a AÇÃO PRINCIPAL dinâmica. Nada é recalculado aqui — nem aqui nem na celebração.
  const journey = deriveColoring60CardState({
    doneMap,
    unlocked: unlocked === true,
    order: activities.map((a) => a.activityId),
  });
  const stateById = {};
  journey.steps.forEach((s) => { stateById[s.activityId] = s; });
  const allDone = journey.allComplete;
  const primaryAction = journey.primaryAction;

  function handlePrimary() {
    if (!primaryAction) return;
    if (primaryAction.kind === COLORING60_ACTION.COLLECTION) {
      // Sem destino de coleção ligado, a ação cai no caminho de sempre: reabrir a última parte.
      if (typeof onOpenCollection === 'function') onOpenCollection(primaryAction.targetActivityId ?? null);
      else onOpenActivity?.(primaryAction.targetActivityId ?? null);
      return;
    }
    if (primaryAction.targetActivityId != null) onOpenActivity?.(primaryAction.targetActivityId);
  }

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
                  : 'Três partes, uma criação: luz, vida e cuidado.'}
            </Text>
          </View>
          {unlocked ? (
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{journey.progressLabel}</Text>
            </View>
          ) : null}
        </View>

        {/* [C60-P13-CARD] §Parte 2 · a trilha aparece SEMPRE (inclusive travada, apagadinha): é ela
            que diz, antes de qualquer toque, que as três partes formam uma coisa só. */}
        <JourneyTrail steps={journey.steps} />

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
            state={stateById[activity.activityId]?.state ?? COLORING60_STEP_STATE.LOCKED}
            recommended={stateById[activity.activityId]?.recommended === true}
            isTablet={isTablet}
            onPress={() => onOpenActivity?.(activity.activityId)}
          />
        ))}
      </View>

      {/* [C60-P13-CARD] §Parte 2 · AÇÃO PRINCIPAL dinâmica: um caminho evidente, sem tirar a escolha
          livre (os três cards acima continuam abrindo direto). Some quando ainda está travada. */}
      {primaryAction ? (
        <View style={styles.ctaWrap}>
          <SoundButton
            style={styles.ctaBtn}
            onPress={handlePrimary}
            activeOpacity={0.85}
            accessibilityLabel={primaryAction.label}
          >
            <Text style={styles.ctaBtnText}>{primaryAction.label}</Text>
          </SoundButton>
        </View>
      ) : null}
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

  // Trilha compacta (símbolos + fio): leitura imediata da jornada, sem virar tela.
  trail: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 12 },
  trailItem: { alignItems: 'center', width: 74 },
  trailMarker: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  trailMarkerNext: { borderStyle: 'dashed' },
  trailTheme: { fontFamily: 'Nunito', fontSize: 11.5, fontWeight: '700', color: pt.text, marginTop: 4 },
  trailLink: { height: 3, flex: 1, maxWidth: 34, borderRadius: 2, backgroundColor: pt.border, marginTop: 15 },

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

  ctaWrap: { paddingHorizontal: 12, paddingBottom: 14, paddingTop: 2 },
  ctaBtn: {
    minHeight: 52, borderRadius: radii.pill,
    backgroundColor: pt.beni,   // laranja Beni = ação principal infantil (papel de cor do tema)
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 18,
  },
  ctaBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF', textAlign: 'center' },
});
