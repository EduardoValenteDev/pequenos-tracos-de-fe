/**
 * BeniGuideOverlay — guia falado do Beni (UX 2.4.2, fluxo único e bloqueante).
 *
 * Profissional e PRECISO: o destaque (moldura/seta) só aparece quando o alvo é
 * MEDIDO de verdade (measureInWindow via `measure`) E está visível; senão, só o
 * card numa posição segura — nunca aponta errado. O guia roda dentro de um Modal
 * que BLOQUEIA a navegação (mapa/pins/tab bar) durante o tour; só os botões do
 * próprio guia respondem.
 *
 * Recursos: aviso de som inicial (com voz / sem voz), voz por etapa (BeniGuideAudio,
 * respeitando soundsEnabled), "Sem voz" durante o tour, Voltar (a partir do 2º
 * card), debounce no avançar (sem duplo toque / sem som duplo), progresso contínuo,
 * e CTA final só no último card.
 *
 * Props: steps[], measure?, finalLabel?, onFinish, onSkip, onStep?(target),
 *        withAudioPrompt?
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from './SoundButton';
import BeniAvatar from './beni/BeniAvatar';
import BeniGuideAudio from './BeniGuideAudio';
import { getBeniGuideAudio, preloadGuideAudio } from '../data/beniGuideAudio';
import { getAudioPreferences, subscribeAudioPreferences } from '../services/audioManager';

const CARD_H = 168;        // altura estimada do card (posicionamento)
const CARD_H_TALL = 200;   // estimativa GENEROSA p/ colisão (card real c/ texto de 3 linhas passa de CARD_H)
const TABBAR_APPROX = 64;  // altura aproximada da tab bar (não cobrir)
const GAP = 18;            // folga card↔alvo (UX 2.4.3: card não cobre o pin/botão)
const ARROW_HALF = 10;     // metade da base da seta
const MEASURE_SETTLE_MS = 320; // espera o layout/scroll estabilizar antes de medir

export default function BeniGuideOverlay({
  steps = [],
  measure,
  finalLabel = 'Entendi',
  onFinish,
  onSkip,
  onStep,
  onTargetPress, // UX 2.4.3: toque no alvo medido no ÚLTIMO card (ex.: pin do brilho)
  onViewMap,     // MAPA 1.1: toque no botão "Ver mapa" medido durante o tour (não avança)
  withAudioPrompt = false,
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState(withAudioPrompt ? 'prompt' : 'steps');
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [busy, setBusy] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true); // por-tour (o aviso de som define)

  const [soundsOn, setSoundsOn] = useState(() => getAudioPreferences().soundsEnabled);
  useEffect(() => subscribeAudioPreferences(() => setSoundsOn(getAudioPreferences().soundsEnabled)), []);

  const safeSteps = steps.length ? steps : [{ title: '', text: '' }];
  const isLast = index === safeSteps.length - 1;
  const step = safeSteps[index];
  // Tablet (sidebar) vs mobile (tab bar). No tablet, o passo com highlightTab vira um
  // alvo MEDIDO da sidebar ('adventures.sidebarTab'); no mobile usa o realce de tab bar.
  const isTabletLayout = width >= 768;
  // Realce de aba por chave (mobile=tab bar / tablet=sidebar). Generalizado p/ Início
  // e Aventuras (mesma lógica premium). Índice da aba (mobile) e alvo da sidebar (tablet).
  const TAB_INDEX_BY_KEY = { home: 0, adventures: 1, atelier: 2 };
  const SIDEBAR_TARGET_BY_KEY = { home: 'home.sidebarTab', adventures: 'adventures.sidebarTab', atelier: 'atelier.sidebarTab' };
  const targetFor = (s) =>
    s?.target || (isTabletLayout && s?.highlightTab ? (SIDEBAR_TARGET_BY_KEY[s.highlightTab] || null) : null);
  // Voz da etapa: só com aviso "com voz" + soundsEnabled + áudio existente.
  const stepAudio = phase === 'steps' && voiceOn && soundsOn && step.audioKey
    ? getBeniGuideAudio(step.audioKey)
    : null;

  // UX 2.4.4: COMMIT MODEL — para etapas com alvo, NÃO renderiza o card em posição
  // provisória. Ao trocar de etapa: avisa a tela (onStep → scroll), espera o settle,
  // MEDE, e só então comita índice + rect JUNTOS (card já na posição final + áudio
  // junto). O card anterior fica visível durante o intervalo (sem pulo/flicker).
  const commitTimer = useRef(null);
  const commitStep = (to) => {
    if (to < 0 || to > safeSteps.length - 1) return;
    setBusy(true);
    if (commitTimer.current) clearTimeout(commitTimer.current);
    const target = targetFor(safeSteps[to]);
    onStep?.(target);
    const finish = (r) => { setIndex(to); setRect(r || null); setBusy(false); };
    if (target && typeof measure === 'function') {
      commitTimer.current = setTimeout(() => {
        measure(target).then(finish).catch(() => finish(null));
      }, MEASURE_SETTLE_MS);
    } else {
      finish(null); // sem alvo → comita na hora (1↔2, 2↔3 sem medição)
    }
  };
  // Ao entrar nas etapas (após o aviso de som), prepara o 1º card já posicionado.
  useEffect(() => {
    if (phase === 'steps') commitStep(0);
    return () => { if (commitTimer.current) clearTimeout(commitTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Pulso discreto (Beni + moldura do alvo).
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const beniScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  const handleNext = () => {
    if (busy) return; // anti duplo-toque (sem som de clique — a voz é a resposta)
    if (isLast) onFinish?.();
    else commitStep(index + 1);
  };
  const handleBack = () => {
    if (busy || index === 0) return;
    commitStep(index - 1); // re-mede + re-toca o áudio do card anterior
  };

  const startWithVoice = async () => {
    setVoiceOn(true);
    await preloadGuideAudio(safeSteps.map((s) => s.audioKey)); // 1ª fala sem atraso
    setPhase('steps');
  };
  const startNoVoice = () => { setVoiceOn(false); setPhase('steps'); };

  // ── Realce (mobile=tab bar / tablet=sidebar) + posicionamento do card ─────────
  const tabTop = height - (TABBAR_APPROX + insets.bottom);
  const ringPad = 6;
  const isBigArea = rect && rect.width > width * 0.85 && rect.height > height * 0.5;
  const inViewport = !!rect && rect.y + rect.height > insets.top && rect.y < tabTop;
  const showRing = !!rect && !isBigArea && inViewport;

  // Realce de aba (Card "Seu início"/"Seu mapa de aventuras"): no MOBILE, moldura
  // determinística na tab bar; no TABLET, o alvo é MEDIDO (item da sidebar → showRing).
  // Sem medição → fallback sem seta. Generalizado para Início (idx 0) e Aventuras (idx 1).
  const curTarget = targetFor(step);
  const isSidebarTarget = !!curTarget && curTarget.endsWith('.sidebarTab');
  // Step com noRing (ex.: Home "Sua aventura atual"): mede e aponta com a seta, mas
  // NÃO desenha a moldura/halo (a seta já basta). Isolado por step — os demais cards
  // seguem com halo. Não afeta posicionamento, scroll, nem o fallback honesto.
  const hideRing = phase === 'steps' && !!step.noRing;
  const glowTabIndex = step.highlightTab != null ? TAB_INDEX_BY_KEY[step.highlightTab] : undefined;
  const showTabGlow = phase === 'steps' && !!step.highlightTab && !isTabletLayout && glowTabIndex != null;
  const TAB_COUNT = 5;
  const tabItemW = width / TAB_COUNT;
  const tabCenterX = tabItemW * ((glowTabIndex ?? 1) + 0.5);
  const tabHaloW = Math.min(tabItemW - 10, 96);
  const tabHaloH = 54;
  const tabHaloLeft = tabCenterX - tabHaloW / 2;
  const tabHaloTop = tabTop + 3;

  const usableBottom = tabTop;
  let cardTop;
  let cardLeft = 16;
  let cardRight = 16;
  let arrow = null;      // 'up' | 'down' | 'left'
  let arrowLeft = null;  // x da seta (up/down) — aponta para o centro do alvo
  let arrowTop = null;   // y da seta (left) — aponta para o centro vertical do alvo
  if (showRing && isSidebarTarget) {
    // Alvo na SIDEBAR (esquerda): card à DIREITA da sidebar (não a cobre), seta p/ a esquerda.
    cardLeft = Math.min(rect.x + rect.width + 18, Math.round(width * 0.42));
    cardRight = 16;
    cardTop = Math.max(insets.top + 8, Math.min(rect.y + rect.height / 2 - CARD_H / 2, usableBottom - CARD_H - 8));
    arrow = 'left';
    arrowTop = Math.max(12, Math.min(CARD_H - 24, (rect.y + rect.height / 2) - cardTop - ARROW_HALF));
  } else if (showRing) {
    // Colisão card↔halo (Home 1.3): o card NUNCA cobre a moldura medida — antes a
    // "linha amarela" aparecia atrás do card porque o card real (texto de 3 linhas)
    // passa de CARD_H. Usamos CARD_H_TALL (generoso) e posicionamos o card no lado
    // que o COMPORTA inteiro, fora do halo. Sem espaço em nenhum lado (alvo muito
    // alto), encosta o card embaixo SEM seta (não cortar a borda do halo).
    const haloTop = rect.y - ringPad;
    const haloBottom = rect.y + rect.height + ringPad;
    const fitsBelow = (usableBottom - 8) - (haloBottom + GAP) >= CARD_H_TALL;
    const fitsAbove = (haloTop - GAP) - (insets.top + 8) >= CARD_H_TALL;
    if (fitsBelow) { cardTop = haloBottom + GAP; arrow = 'up'; }
    else if (fitsAbove) { cardTop = haloTop - GAP - CARD_H_TALL; arrow = 'down'; }
    else { cardTop = usableBottom - CARD_H_TALL - 8; arrow = null; }
    if (arrow) cardTop = Math.max(insets.top + 8, Math.min(cardTop, usableBottom - CARD_H_TALL - 8));
    const targetCx = rect.x + rect.width / 2;
    arrowLeft = arrow ? Math.max(12, Math.min((width - 32) - ARROW_HALF * 2 - 12, targetCx - 16 - ARROW_HALF)) : null;
  } else if (showTabGlow) {
    // Card 2 (mobile): card acima da tab bar, seta CURTA para baixo no item Aventuras.
    cardTop = Math.max(insets.top + 8, tabHaloTop - CARD_H - 16);
    arrow = 'down';
    arrowLeft = Math.max(12, Math.min((width - 32) - ARROW_HALF * 2 - 12, tabCenterX - 16 - ARROW_HALF));
  } else {
    cardTop = usableBottom - CARD_H - 8;
  }

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={() => onSkip?.()}>
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Véu = escudo de toque: BLOQUEIA o que está atrás (mapa/pins/tab bar). LEVE
            para a tela (mapa + abas) continuar claramente visível por trás. */}
        <View style={styles.veil} pointerEvents="auto" />

        {/* Realce CLARO do item Aventuras (Card 2): moldura pulsante no ícone+texto.
            Decorativo (pointerEvents none) — a tab bar continua bloqueada pelo véu. */}
        {showTabGlow && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.tabHalo,
              { left: tabHaloLeft, top: tabHaloTop, width: tabHaloW, height: tabHaloH, opacity: ringOpacity, transform: [{ scale: beniScale }] },
            ]}
          />
        )}

        {/* Voz do Beni (headless). Some no aviso e ao trocar etapa/pular/concluir. */}
        {phase === 'steps' && (
          <BeniGuideAudio key={`guide-audio-${index}-${voiceOn}-${soundsOn}`} audioAsset={stepAudio} />
        )}

        {phase === 'prompt' ? (
          <View style={styles.promptWrap} pointerEvents="box-none">
            <LinearGradient colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.promptCard}>
              <BeniAvatar variant="happy" size="large" />
              <Text style={styles.promptTitle}>Quer ouvir o Beni?</Text>
              <Text style={styles.promptText}>Ative o som do celular para escutar o guia.</Text>
              <SoundButton style={styles.promptPrimary} onPress={startWithVoice} activeOpacity={0.9} silent>
                <LinearGradient colors={['#FFB15A', '#FF7A2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promptPrimaryGrad}>
                  <Text style={styles.promptPrimaryText}>Começar com som</Text>
                </LinearGradient>
              </SoundButton>
              <SoundButton style={styles.promptSecondary} onPress={startNoVoice} activeOpacity={0.7} silent>
                <Text style={styles.promptSecondaryText}>Continuar sem voz</Text>
              </SoundButton>
            </LinearGradient>
          </View>
        ) : (
          <>
            {showRing && !hideRing && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.ring,
                  {
                    left: rect.x - ringPad,
                    top: rect.y - ringPad,
                    width: rect.width + ringPad * 2,
                    height: rect.height + ringPad * 2,
                    borderRadius:
                      Math.abs(rect.width - rect.height) <= 10
                        ? (Math.max(rect.width, rect.height) + ringPad * 2) / 2
                        : Math.min(18, (rect.height + ringPad * 2) / 2),
                    opacity: ringOpacity,
                  },
                ]}
              />
            )}

            {/* MAPA 1.1: no card "Ver a região", o botão "Ver mapa" MEDIDO fica
                tocável → abre a Visão Geral suave SEM avançar nem fechar o tour
                (o tour continua atrás; ao fechar o overview, volta a este card). */}
            {!isLast && showRing && curTarget === 'adventures.viewMapButton' && typeof onViewMap === 'function' && (
              <SoundButton
                silent
                activeOpacity={0.85}
                accessibilityLabel="Ver o mapa inteiro"
                onPress={onViewMap}
                style={{
                  position: 'absolute',
                  left: rect.x - ringPad,
                  top: rect.y - ringPad,
                  width: rect.width + ringPad * 2,
                  height: rect.height + ringPad * 2,
                  borderRadius: 14,
                }}
              />
            )}

            {/* Card FINAL: o alvo medido (pin do brilho) também é tocável → abre a
                história (comportamento normal). Só o pin destacado; nada mais. */}
            {isLast && showRing && typeof onTargetPress === 'function' && (
              <SoundButton
                silent
                activeOpacity={0.85}
                accessibilityLabel="Abrir a aventura em destaque"
                onPress={onTargetPress}
                style={{
                  position: 'absolute',
                  left: rect.x - ringPad,
                  top: rect.y - ringPad,
                  width: rect.width + ringPad * 2,
                  height: rect.height + ringPad * 2,
                  borderRadius: (Math.max(rect.width, rect.height) + ringPad * 2) / 2,
                }}
              />
            )}

            <View style={[styles.cardWrap, { top: cardTop, left: cardLeft, right: cardRight }]} pointerEvents="box-none">
              {/* Seta para a ESQUERDA (alvo na sidebar do tablet). */}
              {arrow === 'left' && <View style={[styles.arrowSide, { top: arrowTop }]} />}
              {arrow === 'up' && <View style={[styles.arrow, styles.arrowUp, arrowLeft != null && { alignSelf: 'flex-start', marginLeft: arrowLeft }]} />}
              <LinearGradient colors={['#FBF1D8', '#F4E3BE', '#EAD3A0']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Animated.View style={{ transform: [{ scale: beniScale }] }}>
                    <BeniAvatar variant={step.variant || 'happy'} size="medium" />
                  </Animated.View>
                  <View style={styles.cardBody}>
                    {!!step.title && <Text style={styles.title} numberOfLines={1}>{step.title}</Text>}
                    {!!step.text && <Text style={styles.text} numberOfLines={3}>{step.text}</Text>}
                  </View>
                </View>

                {/* Linha de progresso + links (Voltar / Pular / Sem voz) — contínua */}
                <View style={styles.metaRow}>
                  <View style={styles.dots}>
                    {safeSteps.map((_, i) => (
                      <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                    ))}
                  </View>
                  <View style={styles.links}>
                    {index > 0 && (
                      <SoundButton style={styles.linkBtn} onPress={handleBack} activeOpacity={0.7} disabled={busy} silent>
                        <Text style={styles.linkText}>Voltar</Text>
                      </SoundButton>
                    )}
                    {voiceOn && soundsOn && (
                      <SoundButton style={styles.linkBtn} onPress={() => setVoiceOn(false)} activeOpacity={0.7} silent>
                        <Text style={styles.linkText}>Sem voz</Text>
                      </SoundButton>
                    )}
                    <SoundButton style={styles.linkBtn} onPress={onSkip} activeOpacity={0.7} silent>
                      <Text style={styles.linkText}>Pular</Text>
                    </SoundButton>
                  </View>
                </View>

                {/* CTA largura total → "Começar minha jornada" cabe inteiro (só no fim) */}
                <SoundButton style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.9} disabled={busy} silent>
                  <LinearGradient colors={['#FFB15A', '#FF7A2F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGrad}>
                    <Text style={styles.primaryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                      {isLast ? finalLabel : 'Próximo'}
                    </Text>
                  </LinearGradient>
                </SoundButton>
              </LinearGradient>
              {arrow === 'down' && <View style={[styles.arrow, styles.arrowDown, arrowLeft != null && { alignSelf: 'flex-start', marginLeft: arrowLeft }]} />}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
  // Véu LEVE (UX 2.4.4): bloqueia o toque, mas deixa o mapa e a tab bar visíveis.
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,28,12,0.22)' },
  // Moldura do item Aventuras na tab bar (Card 2) — clara, mas elegante.
  tabHalo: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'rgba(255,205,110,0.98)',
    backgroundColor: 'rgba(255,222,150,0.18)',
    shadowColor: '#FFB15A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: 'rgba(255,205,110,0.95)',
    backgroundColor: 'rgba(255,222,150,0.10)',
  },
  // Aviso de som — centralizado
  promptWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 24 },
  promptCard: {
    width: '100%', maxWidth: 360, borderRadius: 24, paddingVertical: 22, paddingHorizontal: 20, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(180,140,70,0.45)',
    elevation: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16,
  },
  promptTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: '#5A4420', marginTop: 8 },
  promptText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '700', color: '#6B5733', textAlign: 'center', marginTop: 6 },
  promptPrimary: { alignSelf: 'stretch', borderRadius: 16, overflow: 'hidden', marginTop: 18 },
  promptPrimaryGrad: { paddingVertical: 13, alignItems: 'center' },
  promptPrimaryText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFFFFF' },
  promptSecondary: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12 },
  promptSecondaryText: { fontFamily: 'Nunito', fontSize: 13.5, fontWeight: '800', color: '#8A7350', textDecorationLine: 'underline' },
  // Card de etapa
  cardWrap: { position: 'absolute', left: 16, right: 16 },
  arrow: { alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  arrowUp: { borderBottomWidth: 12, borderBottomColor: '#FBF1D8' },
  arrowDown: { borderTopWidth: 12, borderTopColor: '#EAD3A0' },
  // Seta apontando para a ESQUERDA (alvo na sidebar), na borda esquerda do card.
  arrowSide: {
    position: 'absolute',
    left: -12,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FBF1D8',
  },
  card: {
    borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: 'rgba(180,140,70,0.45)',
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  cardBody: { flex: 1, marginLeft: 12 },
  title: { fontFamily: 'FredokaOne', fontSize: 16, color: '#5A4420' },
  text: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: '#6B5733', marginTop: 2, lineHeight: 18 },
  metaRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4, backgroundColor: 'rgba(120,95,55,0.30)' },
  dotActive: { backgroundColor: '#E08A2E', width: 14 },
  links: { flexDirection: 'row', alignItems: 'center' },
  linkBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  linkText: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: '#8A7350' },
  primaryBtn: { marginTop: 10, borderRadius: 14, overflow: 'hidden' },
  primaryGrad: { paddingVertical: 11, alignItems: 'center' },
  primaryText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFFFFF' },
});
