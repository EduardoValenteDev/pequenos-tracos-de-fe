/**
 * OnboardingScreen.js — "O Livro Vivo do Beni" (Onboarding O2.3).
 *
 * Polimento sobre a arquitetura aprovada (O2.2), sem reconstruir. Correções desta rodada:
 *  • RENDER READINESS: a virada só começa quando a próxima página está assetReady (arquivo
 *    decodificado, `ensurePageReady`) E renderReady (um <Image> real pintou, via OnboardingImageProbe)
 *    — nunca moldura vazia/imagem atrasada durante a virada.
 *  • CTA + ABAS sincronizados à virada (duas camadas cruzando com o mesmo valor; o rótulo/estado
 *    novo só assume ao concluir; leitor de tela ignora a página oculta e a nova etapa é anunciada no fim).
 *  • TECLADO: usa keyboardWillShow/Hide (iOS) com a duração do evento; o livro/rodapé deslocam por
 *    transform já no mesmo instante, sem salto tardio; CTA ancorado acima do teclado.
 *  • Haptic leve na conclusão da virada (expo-haptics já usado no projeto). Sem áudio. Persistência intacta.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, AccessibilityInfo,
  Keyboard, ScrollView, useWindowDimensions, Platform, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import StorybookBackground from '../components/onboarding/StorybookBackground';
import StorybookBook from '../components/onboarding/StorybookBook';
import StorybookIntroPage from '../components/onboarding/StorybookIntroPage';
import StorybookWorldPage from '../components/onboarding/StorybookWorldPage';
import StorybookProfilePage from '../components/onboarding/StorybookProfilePage';
import StorybookCreationPage from '../components/onboarding/StorybookCreationPage';
import OnboardingImageProbe from '../components/onboarding/OnboardingImageProbe';
import { OB } from '../theme/onboardingVisualTokens';
import { useProfile } from '../context/ProfileContext';
import { useProgressContext } from '../context/ProgressContext';
import { createChildProfile } from '../services/childProfileService';
import { markOnboardingCompleted } from '../services/onboardingService';
import { requestInitialTour } from '../services/beniTourService';
import { warmupOnboarding, ensurePageReady } from '../services/onboardingAssetWarmup';
import { finalizeName, isValidName, normalizeName } from '../services/onboardingName';
import { BENI_IMAGES } from '../assets/mascot/beniImages';
import { getStoryCover } from '../assets/storyCovers';
import { DEFAULT_AVATAR_ID, DEFAULT_SKIN_TONE, getAvatarImage, isAvatarUnlocked } from '../data/avatars';
import { stories } from '../data/stories';
import { log } from '../utils/logger';

const MOMENTS = ['encounter', 'world', 'profile', 'creation'];
const READY_KEY = ['intro', 'world', 'profile', 'creation'];
const TOTAL = MOMENTS.length;
const CREATION_STORY = stories.find((s) => s.id === 'creation') || null;

function labelForMoment(m, creationDone) {
  return m === 'encounter' ? 'Abrir meu livro'
    : m === 'world' ? 'Quero explorar'
      : m === 'profile' ? 'Esse sou eu'
        : creationDone ? 'Explorar Aventuras' : 'Começar A Criação';
}

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { profile, saveProfile } = useProfile();
  const progressCtx = useProgressContext();
  const creationDone = !!progressCtx?.isStoryJourneyComplete?.('creation');
  const reviewMode = !!(profile && profile.name);

  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(null);           // { from, to, dir }
  const [name, setName] = useState(reviewMode ? (profile.name || '') : '');
  const [avatarId, setAvatarId] = useState(reviewMode ? (profile.avatarId || 'star') : null);
  const [skinTone, setSkinTone] = useState((profile && profile.skinTone) || DEFAULT_SKIN_TONE);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [assetReadyState, setAssetReadyState] = useState([false, false, false, false]);
  const [renderReady, setRenderReady] = useState([false, false, false, false]);

  const savingRef = useRef(false);
  const lockRef = useRef(false);
  const pendingRef = useRef(null);
  const indexRef = useRef(index); indexRef.current = index;
  const turnValue = useRef(new Animated.Value(0)).current;
  const bookFade = useRef(new Animated.Value(0)).current;
  const bookShift = useRef(new Animated.Value(0)).current;
  const bookScale = useRef(new Animated.Value(1)).current;
  const footerShift = useRef(new Animated.Value(0)).current;
  const ctaGlow = useRef(new Animated.Value(0)).current;

  const moment = MOMENTS[index];   // COMMITTED — CTA/abas não mudam antes da virada concluir

  // Módulos CRÍTICOS por página (para a prova de render readiness). O selo da criança na página
  // de A Criação usa o AVATAR SELECIONADO (que, em modo revisão, pode ser um avatar desbloqueável
  // não pré-aquecido) — por isso ele entra na prova da página 4 e as deps incluem avatarId/skinTone.
  const CRITICAL = useMemo(() => [
    [BENI_IMAGES.acenando],
    [BENI_IMAGES.apontandoDireita, getStoryCover('david_goliath')],
    [BENI_IMAGES.ensinando, getAvatarImage('boy', 'claro'), getAvatarImage('boy', 'escuro'), getAvatarImage('girl', 'claro'), getAvatarImage('girl', 'escuro'), getAvatarImage('star', 'claro')],
    [BENI_IMAGES.celebrando, getStoryCover('creation'), getAvatarImage(avatarId || 'star', skinTone)],
  ], [avatarId, skinTone]);

  const pageReady = useCallback((i) => assetReadyState[i] && renderReady[i], [assetReadyState, renderReady]);
  const booted = pageReady(0);

  // Trocar o avatar antes de chegar em A Criação re-arma a prova da página 4 (o novo selo precisa
  // estar pintado antes da virada). Não re-arma se já estiver na página de A Criação.
  useEffect(() => {
    if (indexRef.current < 3) setRenderReady((r) => (r[3] ? [r[0], r[1], r[2], false] : r));
  }, [avatarId, skinTone]);

  /* Movimento reduzido. */
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => alive && setReduceMotion(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotion(!!v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);

  /* Teclado — inicia o deslocamento JUNTO do teclado (iOS: will*), com a duração do evento. */
  useEffect(() => {
    const isIOS = Platform.OS === 'ios';
    const showEvt = isIOS ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = isIOS ? 'keyboardWillHide' : 'keyboardDidHide';
    const animate = (bookY, scale, footerY, dur) => {
      const cfg = { duration: dur || OB.durKb, easing: Easing.out(Easing.ease), useNativeDriver: true };
      Animated.parallel([
        Animated.timing(bookShift, { toValue: bookY, ...cfg }),
        Animated.timing(bookScale, { toValue: scale, ...cfg }),
        Animated.timing(footerShift, { toValue: footerY, ...cfg }),
      ]).start();
    };
    const show = (e) => {
      const kbH = e?.endCoordinates?.height || 0;
      setKeyboardOpen(true);
      animate(-Math.min(kbH * 0.34, 120), 0.95, -Math.max(kbH - insets.bottom - 6, 0), e?.duration);
    };
    const hide = (e) => { setKeyboardOpen(false); animate(0, 1, 0, e?.duration); };
    const s1 = Keyboard.addListener(showEvt, show);
    const s2 = Keyboard.addListener(hideEvt, hide);
    return () => { s1.remove(); s2.remove(); };
  }, [bookShift, bookScale, footerShift, insets.bottom]);

  /* Aquecimento + prontidão de ARQUIVO por página. */
  useEffect(() => {
    let alive = true;
    warmupOnboarding();
    READY_KEY.forEach((k, i) => ensurePageReady(k).then(() => {
      if (alive) setAssetReadyState((s) => { if (s[i]) return s; const n = [...s]; n[i] = true; return n; });
    }));
    // Teto de segurança: nunca trava a 1ª página nem as viradas.
    const t = setTimeout(() => {
      if (alive) { setAssetReadyState([true, true, true, true]); setRenderReady((r) => r.map(() => true)); }
    }, OB.readyTimeoutMs + 800);
    return () => { alive = false; clearTimeout(t); };
  }, []);

  const markRenderReady = useCallback((i) => {
    setRenderReady((s) => { if (s[i]) return s; const n = [...s]; n[i] = true; return n; });
  }, []);

  useEffect(() => {
    if (!booted) return;
    if (reduceMotion) { bookFade.setValue(1); return; }
    Animated.timing(bookFade, { toValue: 1, duration: OB.durReady, useNativeDriver: true }).start();
  }, [booted, reduceMotion]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* Brilho discreto do CTA enquanto espera a próxima página. */
  useEffect(() => {
    if (waiting && !reduceMotion) {
      Animated.loop(Animated.sequence([
        Animated.timing(ctaGlow, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(ctaGlow, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])).start();
    } else { ctaGlow.stopAnimation(); ctaGlow.setValue(0); }
  }, [waiting, reduceMotion, ctaGlow]);

  const doTurn = useCallback((next, dir) => {
    const from = indexRef.current;
    const haptic = () => { if (!reduceMotion) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); };
    if (reduceMotion) { setIndex(next); lockRef.current = false; haptic(); return; }
    setTurn({ from, to: next, dir });
    turnValue.setValue(0);
    Animated.timing(turnValue, { toValue: 1, duration: OB.durTurn, useNativeDriver: true }).start(() => {
      setIndex(next); setTurn(null); lockRef.current = false; haptic();
    });
  }, [reduceMotion, turnValue]);

  const resolvePending = useCallback(() => {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    setWaiting(false);
    doTurn(p.next, p.dir);
  }, [doTurn]);

  // A virada só começa com a próxima página assetReady + renderReady (timeout seguro → fallback já montado).
  const startTurnGated = useCallback((next, dir) => {
    if (lockRef.current || next < 0 || next >= TOTAL) return;
    lockRef.current = true;
    if (pageReady(next)) { doTurn(next, dir); return; }
    pendingRef.current = { next, dir };
    setWaiting(true);
    setTimeout(() => { if (pendingRef.current && pendingRef.current.next === next) resolvePending(); }, OB.readyTimeoutMs);
  }, [pageReady, doTurn, resolvePending]);

  // Quando a página pendente fica pronta, dispara a virada.
  useEffect(() => {
    if (pendingRef.current && pageReady(pendingRef.current.next)) resolvePending();
  }, [assetReadyState, renderReady, pageReady, resolvePending]);

  const nameError = useMemo(() => {
    const n = name.trim();
    return n.length > 0 && !isValidName(name) ? 'Escolha um nome com pelo menos uma letra' : '';
  }, [name]);

  const avatarChosen = avatarId != null;
  const profileReady = isValidName(name) && avatarChosen;
  const showAvatarHint = moment === 'profile' && isValidName(name) && !avatarChosen && !keyboardOpen;

  const advance = useCallback(() => {
    if (moment === 'profile') setName(normalizeName(name));
    startTurnGated(index + 1, 'forward');
  }, [moment, name, index, startTurnGated]);

  const back = useCallback(() => { Keyboard.dismiss(); startTurnGated(index - 1, 'back'); }, [index, startTurnGated]);
  const pickAvatar = useCallback((id, tone) => { setAvatarId(id); setSkinTone(tone); }, []);
  const onChangeName = useCallback((v) => setName(v), []);

  const finish = useCallback(async (dest) => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      const finalName = finalizeName(name) || (reviewMode ? (profile.name || 'Amiguinho') : 'Amiguinho');
      const candidate = avatarId || DEFAULT_AVATAR_ID;
      // Revisão: preserva o avatar já existente do perfil (pode ser um desbloqueável por estrelas).
      // O escape-hatch de isAvatarUnlocked (avatarId === currentAvatarId) evita rebaixá-lo para 'star'.
      const currentAvatarId = reviewMode ? (profile && profile.avatarId) : null;
      const selectedAvatar = isAvatarUnlocked(candidate, 0, currentAvatarId) ? candidate : DEFAULT_AVATAR_ID;
      // Mantém os tons por-avatar já gravados (merge), atualizando só o do avatar humano escolhido.
      const baseTones = (profile && profile.avatarSkinTones) || {};
      const avatarSkinTones = (selectedAvatar === 'boy' || selectedAvatar === 'girl')
        ? { ...baseTones, [selectedAvatar]: skinTone }
        : baseTones;

      await saveProfile({ name: finalName, avatarId: selectedAvatar, skinTone, avatarSkinTones });
      await createChildProfile({ name: finalName, avatarId: selectedAvatar }).catch((e) => log('onboarding.createChild:', e));
      await markOnboardingCompleted();
      requestInitialTour();

      const tabsState = {
        index: 1,
        routes: [
          { name: 'Início' },
          { name: 'Aventuras', params: { startBeniTour: true } },
          { name: 'Ateliê' },
          { name: 'Estrelinhas' },
          { name: 'Perfil' },
        ],
      };
      const routes = [{ name: 'Home', state: tabsState }];
      if (dest === 'creation' && CREATION_STORY) routes.push({ name: 'StoryDetail', params: { story: CREATION_STORY } });
      navigation.dispatch(CommonActions.reset({ index: routes.length - 1, routes }));
    } catch (e) {
      log('onboarding.finish:', e);
      savingRef.current = false;
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
    }
  }, [name, avatarId, skinTone, reviewMode, profile, saveProfile, navigation]);

  const skip = useCallback(() => { Keyboard.dismiss(); if (!savingRef.current) finish('adventures'); }, [finish]);

  const primaryLabel = labelForMoment(moment, creationDone);
  const ctaDisabled = moment === 'profile' && !profileReady;

  const onPrimary = useCallback(() => {
    if (lockRef.current) return;
    if (moment === 'creation') { finish(creationDone ? 'adventures' : 'creation'); return; }
    advance();
  }, [moment, creationDone, finish, advance]);

  /* Geometria do livro. */
  const bookW = Math.min(width - 28, OB.bookMaxWidth);
  const bookH = Math.min(height * 0.62, 520);
  const pw = bookW - 32;
  const ph = bookH - 44;

  const renderPage = useCallback((i) => {
    const m = MOMENTS[i];
    if (m === 'encounter') return <StorybookIntroPage width={pw} height={ph} />;
    if (m === 'world') return <StorybookWorldPage width={pw} height={ph} />;
    if (m === 'profile') {
      return (
        <StorybookProfilePage
          width={pw}
          name={name} onChangeName={onChangeName}
          avatarId={avatarId} skinTone={skinTone} onPickAvatar={pickAvatar}
          error={nameError} showAvatarHint={showAvatarHint} profileReady={profileReady}
        />
      );
    }
    return (
      <StorybookCreationPage
        width={pw} height={ph}
        name={name} avatarId={avatarId} skinTone={skinTone} alreadyComplete={creationDone}
      />
    );
  }, [pw, ph, name, onChangeName, avatarId, skinTone, pickAvatar, nameError, showAvatarHint, profileReady, creationDone]);

  const glowOpacity = ctaGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] });
  const ctaFromOp = turnValue.interpolate({ inputRange: [0, 0.35, 0.55, 1], outputRange: [1, 1, 0, 0] });
  const ctaToOp = turnValue.interpolate({ inputRange: [0, 0.5, 0.7, 1], outputRange: [0, 0, 1, 1] });

  return (
    <View style={styles.fill}>
      <StorybookBackground width={width} height={height} bookRect={{ x: (width - bookW) / 2, y: insets.top + 52, w: bookW, h: bookH }} />

      {/* Provas de render readiness (ocultas): garantem que as páginas já pintaram antes da virada */}
      {[0, 1, 2, 3].map((i) => (!renderReady[i] ? (
        <OnboardingImageProbe key={i} modules={CRITICAL[i]} onReady={() => markRenderReady(i)} />
      ) : null))}

      {/* Navegação superior (fixa) */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.topSlot}>
          {index > 0 && (
            <TouchableOpacity onPress={back} style={styles.topBtn} accessibilityRole="button" accessibilityLabel="Voltar">
              <Text style={styles.topBtnText}>‹ Voltar</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.topSlotRight}>
          {moment !== 'creation' && (
            <TouchableOpacity onPress={skip} style={styles.topBtn} accessibilityRole="button" accessibilityLabel="Pular apresentação">
              <Text style={styles.topBtnDiscreet}>Pular</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Livro (persistente) — desloca por transform quando o teclado abre */}
      <Animated.View style={[styles.bookArea, { transform: [{ translateY: bookShift }, { scale: bookScale }] }]}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: bookFade }}>
            <StorybookBook
              width={bookW} height={bookH} current={index} total={TOTAL}
              turn={turn} turnValue={turnValue} renderPage={renderPage} reduceMotion={reduceMotion}
            />
          </Animated.View>
        </ScrollView>
      </Animated.View>

      {/* Ações na base — desloca acima do teclado; CTA sincronizado à virada */}
      <Animated.View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10), transform: [{ translateY: footerShift }] }]}>
        <View>
          <Animated.View style={[styles.ctaGlow, { opacity: glowOpacity }]} pointerEvents="none" />
          {turn ? (
            <View style={styles.cta} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={[styles.ctaText, styles.ctaSpacer]}>{labelForMoment(MOMENTS[turn.to], creationDone)}</Text>
              <Animated.Text style={[styles.ctaText, styles.ctaAbs, { opacity: ctaFromOp }]}>{labelForMoment(MOMENTS[turn.from], creationDone)}</Animated.Text>
              <Animated.Text style={[styles.ctaText, styles.ctaAbs, { opacity: ctaToOp }]}>{labelForMoment(MOMENTS[turn.to], creationDone)}</Animated.Text>
              <View style={styles.ctaNotch} pointerEvents="none" />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.cta, ctaDisabled && styles.ctaDisabled]}
              onPress={onPrimary}
              activeOpacity={0.9}
              disabled={ctaDisabled}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}
              accessibilityState={{ disabled: ctaDisabled }}
            >
              <Text style={[styles.ctaText, ctaDisabled && styles.ctaTextDisabled]}>{primaryLabel}</Text>
              <View style={styles.ctaNotch} pointerEvents="none" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.secondarySlot}>
          {moment === 'creation' && !creationDone && !turn && (
            <TouchableOpacity onPress={() => finish('adventures')} activeOpacity={0.7} style={styles.secondary} accessibilityRole="button" accessibilityLabel="Explorar Aventuras">
              <Text style={styles.secondaryText}>Explorar Aventuras</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: OB.bgCenter },
  topBar: { flexDirection: 'row', paddingHorizontal: 12, minHeight: 40, alignItems: 'center', justifyContent: 'space-between', zIndex: 5 },
  topSlot: { flex: 1, alignItems: 'flex-start' },
  topSlotRight: { flex: 1, alignItems: 'flex-end' },
  topBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, minHeight: OB.touchMin, justifyContent: 'center' },
  topBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: OB.textSoft },
  topBtnDiscreet: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: OB.textSoft, opacity: 0.75 },

  bookArea: { flex: 1, justifyContent: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8 },

  footer: { paddingHorizontal: 26, paddingTop: 6 },
  ctaGlow: { ...StyleSheet.absoluteFillObject, borderRadius: OB.radiusCTA + 4, backgroundColor: OB.goldGlow, transform: [{ scale: 1.04 }] },
  cta: {
    backgroundColor: OB.ctaBg, borderRadius: OB.radiusCTA, paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: OB.ctaShadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 7, elevation: 3,
  },
  ctaDisabled: { backgroundColor: OB.ctaDisabled, shadowOpacity: 0 },
  ctaText: { fontFamily: 'FredokaOne', fontSize: 19, color: OB.ctaText, letterSpacing: 0.3 },
  ctaTextDisabled: { color: OB.ctaDisabledText },
  ctaSpacer: { opacity: 0 },
  ctaAbs: { position: 'absolute' },
  ctaNotch: {
    position: 'absolute', bottom: -7, alignSelf: 'center',
    width: 0, height: 0, borderLeftWidth: 9, borderRightWidth: 9, borderTopWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: OB.ctaBg,
  },
  secondarySlot: { minHeight: OB.touchMin, alignItems: 'center', justifyContent: 'center' },
  secondary: { paddingVertical: 6, paddingHorizontal: 16, minHeight: OB.touchMin, justifyContent: 'center' },
  secondaryText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: OB.textSoft },
});
