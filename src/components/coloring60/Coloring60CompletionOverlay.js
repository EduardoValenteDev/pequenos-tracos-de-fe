/**
 * Coloring60CompletionOverlay.js — experiência afetiva de conclusão do piloto Colorir 60
 * (C60-IMPL-P8 · P8B · §6..§12). Reutilizável e SEM estado de negócio: recebe o que aconteceu
 * (atividade concluída + progresso das três) e devolve as duas escolhas da criança.
 *
 * PRINCÍPIOS (nunca violar):
 *   - A PINTURA CONTINUA SENDO A PROTAGONISTA. Esta camada é translúcida; ela ENQUADRA a arte
 *     (palco + moldura + vinheta) e a valoriza, mas NUNCA a esconde nem a substitui por uma
 *     ilustração genérica. O cartão da conclusão vive no rodapé e deixa a arte respirar acima.
 *   - NÃO é `Modal` de sistema e NÃO é `Alert`: é uma camada em árvore, dentro da própria tela,
 *     para que o desenho permaneça visível e congelado atrás (a tela chama resetZoom antes de
 *     montar esta camada — a arte aparece inteira, centralizada, sem "zoom excessivo").
 *   - NÃO concede nem exibe progresso global, conquista ou moeda de jogo. O único progresso
 *     mostrado é o das TRÊS atividades do piloto (Luz · Vida · Cuidado).
 *   - NÃO menciona plano, pagamento ou assinatura. Se a arte não pôde ser guardada, a criança
 *     ainda assim vê a mesma celebração (a honestidade técnica fica no relatório/log de dev).
 *   - Sem dependência nova: `Animated`/`Easing` do React Native, `expo-linear-gradient`,
 *     `@expo/vector-icons`, `expo-haptics` e o Beni já existentes no projeto.
 *   - Sem loop permanente, sem flashes: cada camada anima UMA vez e descansa. Respeita movimento
 *     reduzido (tudo já no estado final, sem transições e sem partículas).
 *
 * P8B — acabamento premium: revelação com leve aproximação da moldura, vinheta que assenta a arte
 * no palco, cartão com acento superior e brilho suave, bloco de progresso em "mini jornada" (trilho
 * + marcadores + selo de contagem) e um FECHO das três claramente mais forte (Beni maior e centrado,
 * aura dourada, três marcadores acesos, partículas de luz/vida/cuidado, uma háptica de conclusão).
 *
 * Beni: usa a pose oficial `celebrating2` (08_beni_celebrando_2), a mais próxima de "feliz e
 * orgulhoso" — e a única celebrando SEM o selo decorativo de estrela do BeniAvatar, que aqui daria
 * a impressão falsa de prêmio concedido. A textura é AQUECIDA pela tela ANTES do toque em "Pronto!"
 * (ver [C60-P8B-PREWARM] em ColoringScreen), então o Beni entra sem atraso perceptível. FICA
 * REGISTRADA a necessidade futura de uma pose exclusiva do Beni olhando/apontando para a pintura da
 * criança: nenhuma pose atual olha para cima, então ele celebra voltado para a criança.
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

// Utilitário local: converte um hex de 6 dígitos do tema em rgba com alfa (para vinhetas, auras e
// acentos translúcidos derivados da MESMA paleta — sem cor nova e sem dependência).
function rgba(hex, a) {
  const h = String(hex).replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

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

// Fecho das três atividades (§10): título, fala e mensagem próprios, sem inventar recompensa nova.
const ALL_DONE_TITLE = 'Minha Criação Cheia de Cor';
const ALL_DONE_BENI_LINE = 'Você viu a luz, a vida e o cuidado de Deus. Sua criação ficou linda!';
const ALL_DONE_MESSAGE = 'Você completou as três partes da criação!';
const STEP_MESSAGE = {
  1: 'Uma parte da criação ganhou cor!',
  2: 'A criação está ficando cheia de vida!',
};

// Cores dos motivos no FECHO (a criação inteira floresce: luz + vida + cuidado juntos).
const MOTIF_COLOR = { dot: colors.gold, leaf: colors.green, heart: colors.coral };

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
// Palco da ARTE (§4.1/§6/§7). Vive dentro da área do canvas, por cima da pintura e sem capturar
// toque. Não cobre o desenho: assenta a arte com uma vinheta suave nas bordas e a emoldura como um
// "cartão de exposição" (moldura externa luminosa + filete interno), revelado com leve aproximação.
// ─────────────────────────────────────────────────────────────────────────────
export function Coloring60ArtGlow({ activityId, active }) {
  const atmo = atmosphereOf(activityId);
  const reduceMotion = useReduceMotion();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return undefined;
    if (reduceMotion) { anim.setValue(1); return undefined; }
    const a = Animated.timing(anim, {
      toValue: 1,
      duration: 640,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [active, reduceMotion]);

  if (!active) return null;

  // Revelação: a moldura entra e "assenta" de 1.03 → 1.0 (leve aproximação, §7).
  const frameScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1.03, 1] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Vinheta: escurece com delicadeza o topo e a base para dar profundidade e destacar a arte
          no centro — sem tocar a leitura do desenho (o meio permanece transparente). */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: anim }]}>
        <LinearGradient
          colors={[rgba(atmo.tintDeep, 0.16), 'transparent', 'transparent', rgba(atmo.tintDeep, 0.22)]}
          locations={[0, 0.2, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {/* Moldura de exposição (palco): brilho externo tingido + filete interno suave. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, glowStyles.wrap, { opacity: anim, transform: [{ scale: frameScale }] }]}
      >
        <View style={[glowStyles.frame, { borderColor: atmo.tint, shadowColor: atmo.tintDeep }]} />
        <View style={[glowStyles.frameInner, { borderColor: atmo.tintSoft }]} />
      </Animated.View>
    </View>
  );
}

const glowStyles = StyleSheet.create({
  wrap: { alignItems: 'stretch', justifyContent: 'center' },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 6,
    borderWidth: 3,
    borderRadius: 24,
    elevation: 8,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  frameInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 11,
    borderWidth: 1.5,
    borderRadius: 19,
    opacity: 0.65,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Marcador de uma das três atividades (§9). Três estados honestos e distintos, e NENHUM deles é
// representado por estrela. No fecho (`celebratory`), os concluídos ganham um anel mais firme.
// ─────────────────────────────────────────────────────────────────────────────
function StepMarker({ step, state, celebratory }) {
  const atmo = atmosphereOf(step);
  const isCurrent = state === 'current';
  const isDone = state === 'done' || isCurrent;
  return (
    <View style={markerStyles.item}>
      <View
        style={[
          markerStyles.circle,
          isDone && { backgroundColor: atmo.tintSoft, borderColor: atmo.tint },
          celebratory && isDone && { borderColor: atmo.tint, borderWidth: 3 },
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
        style={[markerStyles.label, isDone && { color: colors.text, fontWeight: '700' }]}
        numberOfLines={1}
      >
        {atmo.marker}
      </Text>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  item: { alignItems: 'center', width: 72 },
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
  connector: { width: 16, height: 4, borderRadius: 2, marginTop: 20, marginHorizontal: -2, backgroundColor: colors.border },
});

// ─────────────────────────────────────────────────────────────────────────────
// A experiência em si.
//
// Sequência (§6/§12): camada de luz (300 ms) → Beni entra (~450 ms) → texto → progresso → ações.
// As ações aparecem por último, mas MUITO antes do fim da animação decorativa — a criança nunca
// precisa esperar as partículas descansarem para poder tocar.
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
  const message = allDone ? ALL_DONE_MESSAGE : (STEP_MESSAGE[doneCount] ?? null);
  const primaryLabel = allDone ? 'Ver meus desenhos' : 'Colorir o próximo';

  // FECHO com identidade dourada (mais nobre) sobre a moldura quente da 3ª atividade.
  const accent = allDone ? colors.gold : atmo.tint;
  const accentDeep = allDone ? colors.goldDeep : atmo.tintDeep;
  const accentSoft = allDone ? colors.goldSoft : atmo.tintSoft;
  const veilColors = allDone
    ? ['rgba(249,199,79,0)', 'rgba(249,199,79,0.13)', 'rgba(224,162,26,0.32)']
    : atmo.veil;

  const veilAnim = useRef(new Animated.Value(0)).current;
  const beniAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const moteAnims = useRef(MOTES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Uma única resposta háptica + um som curto de confirmação (o mesmo canal de UI já existente,
    // que respeita a preferência de sons da Área dos Pais). Nenhum asset novo. No FECHO das três a
    // háptica é a de "conclusão" (Success), um degrau acima do toque leve de cada etapa.
    if (!reduceMotion) {
      try {
        if (allDone) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch { /* segue sem háptica */ }
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
  const auraStyle = { opacity: beniAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }) };

  // Partículas: sobem devagar e se apagam. No FECHO cada uma é um motivo diferente (luz/vida/cuidado)
  // para a criação inteira "florescer"; nas etapas, o motivo é o da atmosfera atual.
  const motifFor = (i) => (allDone ? ['dot', 'leaf', 'heart'][i % 3] : atmo.motif);
  const motes = reduceMotion ? [] : MOTES.slice(0, allDone ? MOTES.length : 5).map((m, i) => {
    const v = moteAnims[i];
    const motif = motifFor(i);
    const tint = allDone ? MOTIF_COLOR[motif] : atmo.tint;
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
    if (motif === 'dot') {
      return (
        <Animated.View
          key={`mote-${i}`}
          style={[style, { width: m.size, height: m.size, borderRadius: m.size / 2, backgroundColor: tint }]}
        />
      );
    }
    return (
      <Animated.View key={`mote-${i}`} style={style}>
        <MaterialCommunityIcons name={motif === 'leaf' ? 'leaf' : 'heart'} size={m.size + 6} color={tint} />
      </Animated.View>
    );
  });

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      {/* Camada de luz: gradiente translúcido que realça sem esconder a pintura. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: veilAnim }]}>
        <LinearGradient
          colors={veilColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {atmo.rays && !allDone && (
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
            allDone && { borderColor: accent, borderWidth: 2 },
            rise(veilAnim, 14),
          ]}
        >
          {/* Acento superior: um filete de luz na cor da atividade (dourado no fecho). */}
          <LinearGradient
            colors={[rgba(accent, 0), accent, rgba(accent, 0)]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.cardAccent}
          />

          {allDone ? (
            <View style={styles.headColumn}>
              <View style={styles.beniWrapCol}>
                <Animated.View pointerEvents="none" style={[styles.beniAura, auraStyle]}>
                  <LinearGradient
                    colors={[rgba(accent, 0.42), rgba(accent, 0)]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0.4 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                </Animated.View>
                <Animated.View style={beniStyle}>
                  <BeniAvatar variant="celebrating2" size="hero" />
                </Animated.View>
              </View>
              <Animated.View style={[styles.headTextCol, rise(textAnim, 10)]}>
                <Text style={[styles.titleBig, { color: accentDeep }]}>{title}</Text>
                <Text style={[styles.beniLine, styles.textCenter]}>{beniLine}</Text>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.headRow}>
              <Animated.View style={beniStyle}>
                <BeniAvatar variant="celebrating2" size="medium" />
              </Animated.View>
              <Animated.View style={[styles.headText, rise(textAnim, 10)]}>
                <Text style={[styles.title, { color: accentDeep }]}>{title}</Text>
                <Text style={styles.beniLine}>{beniLine}</Text>
              </Animated.View>
            </View>
          )}

          {message !== null && (
            <Animated.Text style={[styles.message, rise(textAnim, 10)]}>{message}</Animated.Text>
          )}

          <Animated.View style={[styles.progressBox, rise(progressAnim, 10)]}>
            <Text style={styles.progressTitle}>Colorir com o Beni</Text>
            <View style={styles.markersRow}>
              {steps.map((s, i) => {
                const lit = s.done || s.id === activityId;
                return (
                  <React.Fragment key={s.id}>
                    <StepMarker
                      step={s.id}
                      state={s.id === activityId ? 'current' : (s.done ? 'done' : 'todo')}
                      celebratory={allDone}
                    />
                    {i < steps.length - 1 && (
                      <View style={[markerStyles.connector, lit && { backgroundColor: accent }]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
            <View style={[styles.countPill, { backgroundColor: accentSoft, borderColor: accent }]}>
              <Text style={[styles.countPillText, { color: accentDeep }]}>{`${doneCount} de ${total}`}</Text>
            </View>
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
    paddingTop: spacing.md + 4,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  headRow: { flexDirection: 'row', alignItems: 'center' },
  headText: { flex: 1, marginLeft: spacing.sm },

  headColumn: { alignItems: 'center' },
  beniWrapCol: { width: 176, height: 148, alignItems: 'center', justifyContent: 'flex-end' },
  beniAura: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    top: '50%',
    left: '50%',
    marginTop: -96,
    marginLeft: -88,
    overflow: 'hidden',
  },
  headTextCol: { alignItems: 'center', marginTop: spacing.xs },

  title: { fontSize: 20, fontWeight: '800' },
  titleBig: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  beniLine: { fontSize: 14, color: colors.text, marginTop: 2, lineHeight: 19 },
  textCenter: { textAlign: 'center' },
  message: { fontSize: 14, color: colors.textSoft, marginTop: spacing.sm, textAlign: 'center' },

  progressBox: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  progressTitle: { fontSize: 13, fontWeight: '700', color: colors.textSoft },
  markersRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: spacing.sm },
  countPill: {
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  countPillText: { fontSize: 13, fontWeight: '800' },

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
