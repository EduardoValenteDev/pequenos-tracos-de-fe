/**
 * Coloring60CompletionOverlay.js — experiência afetiva de conclusão do piloto Colorir 60
 * (C60-IMPL-P8 · §6..§12). Reutilizável e SEM estado de negócio: recebe o que aconteceu
 * (atividade concluída + progresso das três) e devolve as duas escolhas da criança.
 *
 * PRINCÍPIOS (nunca violar):
 *   - A PINTURA CONTINUA SENDO O ELEMENTO PRINCIPAL. Esta camada é translúcida, ocupa o
 *     rodapé com o cartão e NUNCA substitui a arte por uma ilustração genérica.
 *   - NÃO é `Modal` de sistema e NÃO é `Alert`: é uma camada em árvore, dentro da própria
 *     tela, para que o desenho permaneça visível e congelado atrás.
 *   - NÃO concede nem exibe progresso global, conquista ou moeda de jogo. O único progresso
 *     mostrado é o das TRÊS atividades do piloto (Luz · Vida · Cuidado).
 *   - NÃO menciona plano, pagamento ou assinatura. Se a arte não pôde ser guardada, a criança
 *     ainda assim vê a mesma celebração (a honestidade técnica fica no relatório/log de dev,
 *     nunca na experiência infantil).
 *   - Sem dependência nova: `Animated`/`Easing` do React Native, `expo-linear-gradient`,
 *     `@expo/vector-icons`, `expo-haptics` e o Beni já existentes no projeto.
 *   - Sem loop permanente, sem flashes: cada camada anima UMA vez e descansa.
 *
 * Beni: usa a pose oficial `celebrating2` (08_beni_celebrando_2), a mais próxima de "feliz e
 * orgulhoso" entre as disponíveis — e a única celebrando SEM o selo decorativo de estrela do
 * BeniAvatar, que aqui daria a impressão falsa de prêmio concedido (§13). FICA REGISTRADA a
 * necessidade futura de uma pose exclusiva do Beni olhando/apontando para a pintura da criança:
 * nenhuma pose atual olha para cima, então ele celebra voltado para a criança.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BeniAvatar from '../beni/BeniAvatar';
import SoundButton from '../SoundButton';
import { playUiSound } from '../../services/audioManager';
import { colors, radii, spacing, shadows } from '../../theme/productTheme';

// ─────────────────────────────────────────────────────────────────────────────
// Atmosfera FECHADA por atividade (§7) — textos e paleta são contrato, não sugestão.
// `marker` é o rótulo curto usado no progresso das três (§9).
// ─────────────────────────────────────────────────────────────────────────────
const ATMOSPHERES = {
  light: {
    title: 'A luz ganhou cor!',
    beniLine: 'Você trouxe luz e cor para a criação!',
    marker: 'Luz',
    icon: 'white-balance-sunny',
    tint: colors.gold,
    tintDeep: colors.goldDeep,
    tintSoft: colors.goldSoft,
    veil: ['rgba(249,199,79,0)', 'rgba(249,199,79,0.10)', 'rgba(224,162,26,0.30)'],
    motif: 'dot',
    rays: true,
  },
  living_world: {
    title: 'O mundo ficou cheio de vida!',
    beniLine: 'Olha quanta vida você ajudou a colorir!',
    marker: 'Vida',
    icon: 'leaf',
    tint: colors.green,
    tintDeep: colors.greenDeep,
    tintSoft: colors.greenSoft,
    veil: ['rgba(79,195,247,0)', 'rgba(79,195,247,0.12)', 'rgba(144,190,109,0.30)'],
    motif: 'leaf',
    rays: false,
  },
  people_and_care: {
    title: 'Uma criação cheia de carinho!',
    beniLine: 'Você coloriu a criação com carinho. Deus fez cada pessoa com amor!',
    marker: 'Cuidado',
    icon: 'heart',
    tint: colors.coral,
    tintDeep: colors.beniDeep,
    tintSoft: colors.beniSoft,
    veil: ['rgba(255,122,69,0)', 'rgba(255,122,69,0.12)', 'rgba(249,199,79,0.26)'],
    motif: 'heart',
    rays: false,
  },
};

// Fecho das três atividades (§10): título e fala próprios, sem inventar recompensa nova.
const ALL_DONE_TITLE = 'Minha Criação Cheia de Cor';
const ALL_DONE_BENI_LINE = 'Você viu a luz, a vida e o cuidado de Deus. Sua criação ficou linda!';
const STEP_MESSAGE = {
  1: 'Uma parte da criação ganhou cor!',
  2: 'A criação está ficando cheia de vida!',
};

// Partículas discretas, com posição FIXA (nada de aleatório: a cena não pode "pular" a cada
// render). Ficam na metade de cima, sobre a pintura, e somem sozinhas — sem loop.
const MOTES = [
  { left: '11%', top: '46%', size: 11 },
  { left: '25%', top: '22%', size: 15 },
  { left: '41%', top: '52%', size: 10 },
  { left: '57%', top: '18%', size: 14 },
  { left: '72%', top: '40%', size: 12 },
  { left: '86%', top: '25%', size: 9 },
  { left: '33%', top: '10%', size: 11 },
];

function atmosphereOf(activityId) {
  return ATMOSPHERES[activityId] ?? ATMOSPHERES.light;
}

/** Preferência de movimento reduzido do sistema (mesmo padrão já usado no app). */
function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => alive && setReduceMotion(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotion(!!v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);
  return reduceMotion;
}

// ─────────────────────────────────────────────────────────────────────────────
// Brilho progressivo da MOLDURA da arte (§6). Vive dentro da área do canvas, por cima
// dele e sem capturar toque — a pintura continua inteira, só ganha um contorno de luz.
// ─────────────────────────────────────────────────────────────────────────────
export function Coloring60ArtGlow({ activityId, active }) {
  const atmo = atmosphereOf(activityId);
  const reduceMotion = useReduceMotion();
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return undefined;
    if (reduceMotion) { glow.setValue(1); return undefined; }
    const anim = Animated.timing(glow, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [active, reduceMotion]);

  if (!active) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyles.wrap, { opacity: glow }]}>
      <View style={[glowStyles.frame, { borderColor: atmo.tint, shadowColor: atmo.tintDeep }]} />
      <View style={[glowStyles.frameInner, { borderColor: atmo.tintSoft }]} />
    </Animated.View>
  );
}

const glowStyles = StyleSheet.create({
  wrap: { alignItems: 'stretch', justifyContent: 'center' },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderWidth: 3,
    borderRadius: 20,
    elevation: 6,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  frameInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 8,
    borderWidth: 2,
    borderRadius: 16,
    opacity: 0.7,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Marcador de uma das três atividades (§9). Três estados honestos e distintos, e
// NENHUM deles é representado por estrela.
// ─────────────────────────────────────────────────────────────────────────────
function StepMarker({ step, state }) {
  const atmo = atmosphereOf(step);
  const isCurrent = state === 'current';
  const isDone = state === 'done' || isCurrent;
  return (
    <View style={markerStyles.item}>
      <View
        style={[
          markerStyles.circle,
          isDone && { backgroundColor: atmo.tintSoft, borderColor: atmo.tint },
          isCurrent && { backgroundColor: atmo.tint, borderColor: atmo.tintDeep, borderWidth: 3 },
        ]}
      >
        <MaterialCommunityIcons
          name={atmo.icon}
          size={isCurrent ? 22 : 20}
          color={isCurrent ? '#FFFFFF' : (isDone ? atmo.tintDeep : colors.muted)}
        />
      </View>
      <Text
        style={[
          markerStyles.label,
          isDone && { color: colors.text, fontWeight: '700' },
        ]}
        numberOfLines={1}
      >
        {atmo.marker}
      </Text>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  item: { alignItems: 'center', width: 74 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  label: { marginTop: 4, fontSize: 12, color: colors.textSoft },
});

// ─────────────────────────────────────────────────────────────────────────────
// A experiência em si.
//
// Sequência (§6/§12): camada de luz (300 ms) → Beni entra (450 ms) → texto → progresso
// → ações. As ações aparecem por último, mas MUITO antes do fim da animação decorativa —
// a criança nunca precisa esperar as partículas descansarem para poder tocar.
// ─────────────────────────────────────────────────────────────────────────────
export default function Coloring60CompletionOverlay({
  activityId,
  steps = [],
  bottomInset = 0,
  onPrimary,
  onSecondary,
}) {
  const reduceMotion = useReduceMotion();
  const atmo = atmosphereOf(activityId);

  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length || 3;
  const allDone = total > 0 && doneCount >= total;

  const title = allDone ? ALL_DONE_TITLE : atmo.title;
  const beniLine = allDone ? ALL_DONE_BENI_LINE : atmo.beniLine;
  const message = allDone ? null : STEP_MESSAGE[doneCount] ?? null;
  const primaryLabel = allDone ? 'Ver meus desenhos' : 'Colorir o próximo';

  const veilAnim = useRef(new Animated.Value(0)).current;
  const beniAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const moteAnims = useRef(MOTES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Uma única resposta háptica suave + um som curto de confirmação (o mesmo canal de UI
    // já existente, que respeita a preferência de sons da Área dos Pais). Nenhum asset novo.
    if (!reduceMotion) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); } catch { /* segue sem háptica */ }
    }
    playUiSound('success');
  }, []);

  useEffect(() => {
    const values = [veilAnim, beniAnim, textAnim, progressAnim, actionsAnim];
    if (reduceMotion) {
      // Movimento reduzido: tudo já no estado final, sem transições e sem partículas.
      values.forEach((v) => v.setValue(1));
      return undefined;
    }
    const step = (value, duration, delay) => Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const anim = Animated.parallel([
      step(veilAnim, 300, 0),        // camada de luz — 250..400 ms
      Animated.spring(beniAnim, {    // Beni entra com movimento suave — ~450 ms
        toValue: 1, delay: 150, tension: 55, friction: 8, useNativeDriver: true,
      }),
      step(textAnim, 240, 480),      // texto SÓ depois do Beni
      step(progressAnim, 240, 700),  // progresso depois da mensagem
      step(actionsAnim, 220, 880),   // ações por último (ainda assim < 1,1 s)
      Animated.stagger(90, moteAnims.map((v) => Animated.timing(v, {
        toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }))),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion]);

  const rise = (value, distance) => ({
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

  const beniStyle = {
    opacity: beniAnim,
    transform: [
      { scale: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
      { translateY: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
    ],
  };

  // Partículas: sobem devagar e se apagam. `heart`/`leaf` são ícones já disponíveis; a
  // atmosfera de luz usa pontos luminosos simples (View redonda), sem asset novo.
  const motes = reduceMotion ? [] : MOTES.slice(0, allDone ? MOTES.length : 5).map((m, i) => {
    const v = moteAnims[i];
    const style = {
      position: 'absolute',
      left: m.left,
      top: m.top,
      opacity: v.interpolate({ inputRange: [0, 0.25, 0.7, 1], outputRange: [0, 0.85, 0.6, 0] }),
      transform: [
        { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, -22] }) },
        { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.05] }) },
      ],
    };
    if (atmo.motif === 'dot') {
      return (
        <Animated.View
          key={`mote-${i}`}
          style={[style, { width: m.size, height: m.size, borderRadius: m.size / 2, backgroundColor: atmo.tint }]}
        />
      );
    }
    return (
      <Animated.View key={`mote-${i}`} style={style}>
        <MaterialCommunityIcons
          name={atmo.motif === 'leaf' ? 'leaf' : 'heart'}
          size={m.size + 6}
          color={atmo.motif === 'leaf' ? atmo.tint : atmo.tintDeep}
        />
      </Animated.View>
    );
  });

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      {/* Camada de luz: gradiente translúcido que realça sem esconder a pintura. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: veilAnim }]}>
        <LinearGradient
          colors={atmo.veil}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {atmo.rays && (
          <View style={styles.rays} pointerEvents="none">
            <View style={[styles.ray, { backgroundColor: atmo.tint, transform: [{ rotate: '-18deg' }] }]} />
            <View style={[styles.ray, { backgroundColor: atmo.tintSoft, transform: [{ rotate: '6deg' }] }]} />
            <View style={[styles.ray, { backgroundColor: atmo.tint, transform: [{ rotate: '24deg' }] }]} />
          </View>
        )}
        {motes}
      </Animated.View>

      <View style={[styles.dock, { paddingBottom: bottomInset + 12 }]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            allDone && { borderColor: atmo.tint, borderWidth: 2 },
            rise(veilAnim, 14),
          ]}
        >
          <View style={styles.headRow}>
            <Animated.View style={beniStyle}>
              <BeniAvatar variant="celebrating2" size={allDone ? 'large' : 'medium'} />
            </Animated.View>
            <Animated.View style={[styles.headText, rise(textAnim, 10)]}>
              <Text style={[styles.title, { color: atmo.tintDeep }]}>{title}</Text>
              <Text style={styles.beniLine}>{beniLine}</Text>
            </Animated.View>
          </View>

          {message !== null && (
            <Animated.Text style={[styles.message, rise(textAnim, 10)]}>{message}</Animated.Text>
          )}

          <Animated.View style={[styles.progressBox, rise(progressAnim, 10)]}>
            <Text style={styles.progressTitle}>Colorir com o Beni</Text>
            <View style={styles.markersRow}>
              {steps.map((s) => (
                <StepMarker
                  key={s.id}
                  step={s.id}
                  state={s.id === activityId ? 'current' : (s.done ? 'done' : 'todo')}
                />
              ))}
            </View>
            <Text style={styles.progressCount}>{`${doneCount} de ${total}`}</Text>
          </Animated.View>

          <Animated.View style={[styles.actions, rise(actionsAnim, 10)]}>
            <SoundButton
              style={[styles.primaryBtn, { backgroundColor: colors.beni }]}
              accessibilityLabel={primaryLabel}
              onPress={onPrimary}
            >
              <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
            </SoundButton>
            <SoundButton
              style={styles.secondaryBtn}
              accessibilityLabel="Voltar à aventura"
              onPress={onSecondary}
            >
              <Text style={styles.secondaryBtnText}>Voltar à aventura</Text>
            </SoundButton>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rays: {
    position: 'absolute',
    top: '4%',
    left: 0,
    right: 0,
    height: '46%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0.28,
  },
  ray: { width: 8, height: '100%', borderRadius: 4 },

  dock: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },

  headRow: { flexDirection: 'row', alignItems: 'center' },
  headText: { flex: 1, marginLeft: spacing.sm },
  title: { fontSize: 20, fontWeight: '800' },
  beniLine: { fontSize: 14, color: colors.text, marginTop: 2, lineHeight: 19 },
  message: { fontSize: 14, color: colors.textSoft, marginTop: spacing.sm, textAlign: 'center' },

  progressBox: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  progressTitle: { fontSize: 13, fontWeight: '700', color: colors.textSoft },
  markersRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  progressCount: { marginTop: spacing.xs, fontSize: 13, fontWeight: '700', color: colors.text },

  actions: { marginTop: spacing.md },
  primaryBtn: {
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  secondaryBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  secondaryBtnText: { color: colors.textSoft, fontSize: 15, fontWeight: '700' },
});
