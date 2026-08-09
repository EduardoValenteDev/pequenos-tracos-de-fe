/**
 * AtelierCanvasScreen — "Criar livre" premium (C1).
 *
 * Três zonas permanentes: CABEÇALHO compacto · PAPEL protagonista · BARRA principal fixa.
 * Cor, Pincel e Mais abrem PAINÉIS CONTEXTUAIS temporários que SOBREPÕEM o papel (absolutos)
 * — NUNCA redimensionam o canvas (o motor é uma WebView; mudar o tamanho reinicia o desenho).
 * As três abas antigas (Cores/Pincel/Ferramentas) saíram. Sem emoji, sem carimbos, sem clipart.
 *
 * Motor de desenho: `AtelierCanvas` (WebView + canvas 2D, traços vetoriais, borracha REAL por
 * destination-out). Aqui só se muda a CASCA e o histórico (Desfazer/Refazer/Limpar), a proteção
 * de saída e o fluxo de salvamento. A regra comercial de acesso é preservada.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, Animated, ActivityIndicator, AccessibilityInfo,
  BackHandler, StyleSheet, useWindowDimensions, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AtelierCanvas from '../components/AtelierCanvas';
import CriarLivreIcon from '../components/criarLivre/CriarLivreIcon';
import CriarLivreSlider from '../components/criarLivre/CriarLivreSlider';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { useProgressContext } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import { useSurfaceLifecycle } from '../hooks/useSurfaceLifecycle';
// `log` do helper central, e não um teste de ambiente escrito à mão: esta tela é vizinha do limite
// de guarda do Plano Família, e o smoke proíbe que o sinalizador de desenvolvimento apareça aqui
// como portão de produto. O helper já cala em produção sem trazer esse sinalizador para o arquivo.
import { log } from '../utils/logger';
import { isInternalToolsEnabled } from '../config/internalTools';
import {
  CL, CRIAR_LIVRE_COLORS, ORGANIZED_PALETTES, RECENT_COLORS_MAX,
  BRUSH_PRESETS, ERASER_PRESETS,
  BRUSH_MIN, BRUSH_MAX, ERASER_MIN, ERASER_MAX, isLightColor,
} from '../theme/createLivreVisualTokens';
import { saveArt, getArt, getArtCount, listArts, ATELIER_FREE_SAVE_LIMIT } from '../services/atelierStorage';
import { resolveArtTitle, displayTitle } from '../services/atelierArtNaming';
import { hasAtelierUnlimitedAccess } from '../services/accessControl';
import { hasSeenOrientation, markOrientationSeen } from '../services/criarLivreOrientation';
import { backLabelFor } from '../utils/originBack';

const haptic = (s) => { Haptics.impactAsync(s).catch(() => {}); };
const success = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };

export default function AtelierCanvasScreen({ route, navigation }) {
  const { mission, artId: routeArtId, from } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const canvasRef = useRef(null);
  const { profile } = useProfile();
  const profileId = (profile && (profile.id || profile.avatarId)) || 'default';

  // [P3J-R] O PARÂMETRO de rota continua `createWithBeni`: ele é o contrato de navegação/volta
  // (ver originBack.js) e o destino não mudou. O que muda é o NOME VISÍVEL — a experiência se chama
  // "Criar livre" (D-CRIAR-COM-BENI-STATUS). Renomear o parâmetro quebraria o botão voltar sem
  // benefício algum para a criança.
  const isCreateWithBeni = from === 'createWithBeni';
  const mode = isCreateWithBeni ? 'createWithBeni' : (mission ? 'guided' : 'free');
  const title = isCreateWithBeni ? 'Criar livre' : (mode === 'guided' ? 'Desenho guiado' : 'Criar livre');

  const unlimited = hasAtelierUnlimitedAccess();

  /* Conquistas — salvar arte pode desbloquear */
  const { progressByStory, postStoryStatusByStory } = useProgressContext();
  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'AtelierCanvasScreen' });

  /* ── Fonte ÚNICA da ferramenta (C1.1 §4): estado React + refs; o motor recebe config ATÔMICA. ── */
  const [tool, setTool] = useState('draw');            // 'draw' | 'eraser'
  const [color, setColor] = useState(CRIAR_LIVRE_COLORS[0].hex);
  const [brushWidth, setBrushWidth] = useState(BRUSH_PRESETS[1].width);
  const [eraserWidth, setEraserWidth] = useState(ERASER_PRESETS[1].width);
  const toolRef = useRef(tool); toolRef.current = tool;
  const colorRef = useRef(color); colorRef.current = color;
  const brushRef = useRef(brushWidth); brushRef.current = brushWidth;
  const eraserRef = useRef(eraserWidth); eraserRef.current = eraserWidth;

  /* Injeção ATÔMICA da ferramenta → a WebView nunca fica num estado intermediário. */
  const syncTool = useCallback(() => {
    canvasRef.current?.applyTool?.({
      tool: toolRef.current, color: colorRef.current,
      brush: brushRef.current, eraser: eraserRef.current,
    });
  }, []);

  /* ── Paletas (§9) + cores recentes (memória) ── */
  const [paletteId, setPaletteId] = useState(ORGANIZED_PALETTES[0].id);
  const [recentColors, setRecentColors] = useState([]);
  const pushRecent = useCallback((hex) => {
    setRecentColors((prev) => [hex, ...prev.filter((h) => h !== hex)].slice(0, RECENT_COLORS_MAX));
  }, []);

  /* ── Nome/identidade da arte (§5/§7) ── */
  const [savedArtId, setSavedArtId] = useState(routeArtId ?? null);
  const savedTitleRef = useRef(null);
  const [nameInput, setNameInput] = useState('');

  /* ── Estado do canvas (via HIST do motor) — §17 ── */
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBlank, setIsBlank] = useState(true);
  const [rev, setRev] = useState(0);
  const [lastSavedRevision, setLastSavedRevision] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const isDirty = rev !== lastSavedRevision;
  const canSave = !isBlank && !isSaving;

  /* Proteção ao sair — §15 (padrão beforeRemove). */
  const leavingRef = useRef(false);          // true → beforeRemove libera a saída
  const actionRef = useRef(null);            // ação de navegação pendente (goBack/gesto/hardware)
  const leaveAfterSaveRef = useRef(false);   // "Salvar e sair"

  /* ── Overlays (um por vez): 'color'|'brush'|'more'|'exit'|'clear'|'family'|'diag' ── */
  const [overlay, setOverlay] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [exitArmed, setExitArmed] = useState(false);   // §15 — 2º toque consciente
  const [diag, setDiag] = useState(null);

  /* ── Orientação inicial — §5 ── */
  const [showOrientation, setShowOrientation] = useState(false);
  const orientationHandledRef = useRef(false);

  /* ── Movimento reduzido — §22/§23 ── */
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => alive && setReduceMotion(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotion(!!v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);

  /* ── [F6-R3.2] Ciclo de vida da superfície ──
     O Ateliê era, com o Colorir, uma das duas únicas superfícies interativas sem nenhuma escuta de
     `AppState` ou de foco. A adoção é conservadora porque aqui vive a composição da criança (SD-8):
     sair para segundo plano NÃO grava, NÃO exporta e NÃO limpa; voltar NÃO relê o armazenamento e
     NÃO reaplica estado. A carga continua sendo a de abertura, disparada por `onCanvasReady` →
     `loadState`, e reler no retorno seria a reescrita silenciosa que `Q8` proíbe. Neste passo a
     escuta é observabilidade pura; a finalização atômica do gesto pertence ao motor (`TK-A-016`). */
  useSurfaceLifecycle({
    onBackground: () => {
      log('[Atelie] superfície → segundo plano/sem foco (nenhuma gravação, nenhum descarte)');
    },
    onForeground: () => {
      log('[Atelie] superfície → primeiro plano (nenhuma releitura, nenhuma reaplicação)');
    },
  });

  /* ── Animações ── */
  const panelAnim = useRef(new Animated.Value(0)).current;  // 0 fechado, 1 aberto
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (overlay) {
      Animated.timing(panelAnim, { toValue: 1, duration: reduceMotion ? 0 : CL.durPanelIn, useNativeDriver: true }).start();
    } else {
      Animated.timing(panelAnim, { toValue: 0, duration: reduceMotion ? 0 : CL.durPanelOut, useNativeDriver: true }).start();
    }
  }, [overlay]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Orientação: mostra na 1ª utilização do perfil, se o papel estiver vazio ── */
  useEffect(() => {
    let alive = true;
    hasSeenOrientation(profileId).then((seen) => {
      if (alive && !seen && isBlank) setShowOrientation(true);
    });
    return () => { alive = false; };
  }, [profileId]);   // eslint-disable-line react-hooks/exhaustive-deps

  const hideOrientation = useCallback(() => {
    if (orientationHandledRef.current) return;
    orientationHandledRef.current = true;
    setShowOrientation(false);
    markOrientationSeen(profileId);
  }, [profileId]);

  /* ── Callbacks do motor ── */
  const onCanvasReady = useCallback(() => {
    syncTool();   // envia a config atômica inicial (ferramenta + cor + tamanhos)
    if (!routeArtId) return;
    getArt(routeArtId).then((art) => {
      if (art) {
        savedTitleRef.current = displayTitle(art.title);
        if (art.stateJson) canvasRef.current?.loadState(art.stateJson);
      }
    }).catch(() => {});
  }, [routeArtId, syncTool]);

  const onHist = useCallback(({ canUndo: cu, canRedo: cr, empty, rev: r }) => {
    setCanUndo(!!cu); setCanRedo(!!cr); setIsBlank(!!empty);
    if (typeof r === 'number') setRev(r);
    if (!empty) hideOrientation();   // primeiro traço → some a orientação
  }, [hideOrientation]);

  /* ── Ferramentas ── (sempre via fonte única + syncTool atômico) ── */
  const openPanel = useCallback((id) => {
    setOverlay((cur) => (cur === id ? null : id));
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const pickColor = useCallback((hex) => {
    colorRef.current = hex; setColor(hex);
    toolRef.current = 'draw'; setTool('draw');   // escolher cor SAI da borracha
    pushRecent(hex);
    syncTool();
    haptic(Haptics.ImpactFeedbackStyle.Light);
    setOverlay(null);   // §9.9 — escolha simples pode fechar o painel (fluxo aprovado)
  }, [pushRecent, syncTool]);

  const usePencil = useCallback(() => {
    toolRef.current = 'draw'; setTool('draw');   // volta ao pincel restaurando a cor/espessura atuais
    syncTool();
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }, [syncTool]);

  const useEraser = useCallback(() => {
    // Toque em Apagar: garante a borracha ATIVA (fonte única + config atômica) e alterna o painel
    // de tamanho. Nunca desativa a borracha por reabrir/fechar o painel.
    const jaBorracha = toolRef.current === 'eraser';
    toolRef.current = 'eraser'; setTool('eraser');
    syncTool();
    haptic(Haptics.ImpactFeedbackStyle.Light);
    setOverlay((cur) => (jaBorracha && cur === 'brush' ? null : 'brush'));   // §4.3 — painel abre com a ativação
  }, [syncTool]);

  // Aplica a espessura DA FERRAMENTA ATIVA. Preset NÃO fecha o painel (§3).
  const applyWidth = useCallback((w, isPreset) => {
    if (toolRef.current === 'eraser') { eraserRef.current = w; setEraserWidth(w); }
    else { brushRef.current = w; setBrushWidth(w); }
    syncTool();
    if (isPreset) haptic(Haptics.ImpactFeedbackStyle.Light);   // sem setOverlay(null)
  }, [syncTool]);

  const onSliderPreset = useCallback(() => haptic(Haptics.ImpactFeedbackStyle.Light), []);

  const doUndo = useCallback(() => { if (!canUndo) return; canvasRef.current?.undo(); haptic(Haptics.ImpactFeedbackStyle.Light); }, [canUndo]);
  const doRedo = useCallback(() => { if (!canRedo) return; canvasRef.current?.redo(); haptic(Haptics.ImpactFeedbackStyle.Light); }, [canRedo]);

  const doClear = useCallback(() => {
    canvasRef.current?.clearAll();   // desfazível (o motor faz commit antes)
    setOverlay(null);
    haptic(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /* ── Salvar — §5/§7/§16. Primeiro salvamento pede nome; depois atualiza a MESMA arte. ── */
  const performSave = useCallback((title) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setOverlay(null);
    canvasRef.current?.exportState(async ({ stateJson, thumbnailBase64, previewBase64 }) => {
      try {
        const id = await saveArt({
          artId: savedArtId ?? null,   // §7 — mesma arte na mesma sessão (sem cópia por toque)
          title,
          mission: mission ?? null,
          stateJson, thumbnailBase64, previewBase64,
        });
        setSavedArtId(id);
        savedTitleRef.current = title;
        setLastSavedRevision(rev);   // §17 — a revisão salva vira a base "limpa"
        setIsSaving(false); savingRef.current = false;
        success();
        setSavedFlash(true);
        if (!reduceMotion) {
          glow.setValue(0);
          Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: CL.durSave * 0.4, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0, duration: CL.durSave * 0.6, useNativeDriver: true }),
          ]).start();
        }
        setTimeout(() => setSavedFlash(false), 1400);
        setTimeout(() => { checkForNewAchievements(); }, 500);
        if (leaveAfterSaveRef.current) {   // §15 — "Salvar e sair"
          leaveAfterSaveRef.current = false;
          leavingRef.current = true;
          if (actionRef.current) { navigation.dispatch(actionRef.current); actionRef.current = null; }
          else if (isCreateWithBeni) navigation.navigate('Home');
          else navigation.goBack();
        }
      } catch {
        setIsSaving(false); savingRef.current = false;
        setOverlay('saveError');   // mantém o desenho intacto, permite tentar de novo
      }
    });
  }, [savedArtId, mission, rev, reduceMotion, checkForNewAchievements, navigation, isCreateWithBeni]);   // eslint-disable-line react-hooks/exhaustive-deps

  const doSave = useCallback(async () => {
    if (!canSave || savingRef.current) return;
    if (!unlimited && !savedArtId) {
      const count = await getArtCount();
      if (count >= ATELIER_FREE_SAVE_LIMIT) { setOverlay('family'); return; }   // convite gentil, sem venda agressiva
    }
    if (savedArtId) { performSave(savedTitleRef.current || 'Desenho de fé'); return; }   // já salvo → atualiza, sem perguntar
    if (mission) { performSave(mission.slice(0, 35)); return; }                          // guiado já tem título
    setNameInput('');
    setOverlay('name');   // desenho novo → pede o nome
  }, [canSave, unlimited, savedArtId, mission, performSave]);

  const confirmName = useCallback(async () => {
    const existing = (await listArts()).map((a) => a && a.title).filter(Boolean);
    performSave(resolveArtTitle(nameInput, existing));   // vazio → "Desenho de fé N"; repetido → sufixo
  }, [nameInput, performSave]);

  /* ── Proteção ao sair — §15 ──
     `beforeRemove` cobre header/voltar, gesto do iOS e removções de navegação; o BackHandler só
     fecha um painel aberto (senão deixa o navegador tratar → cai no beforeRemove). Vazio ou já
     salvo → sai livre. Sujo → painel de saída com 2º toque consciente para "Sair sem salvar". */
  const requestBack = useCallback(() => {
    if (isCreateWithBeni) navigation.navigate('Home');
    else navigation.goBack();
  }, [isCreateWithBeni, navigation]);

  useEffect(() => {
    const off = navigation.addListener('beforeRemove', (e) => {
      if (leavingRef.current || isBlank || !isDirty || isSaving) return;   // sai livre
      e.preventDefault();
      actionRef.current = e.data.action;
      setExitArmed(false);
      setOverlay('exit');
    });
    return off;
  }, [navigation, isBlank, isDirty, isSaving]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (overlay) { setOverlay(null); return true; }   // fecha painel; senão navegador trata
      return false;
    });
    return () => sub.remove();
  }, [overlay]);

  const onBackPress = useCallback(() => {
    if (overlay) { setOverlay(null); return; }
    requestBack();   // se sujo, o beforeRemove intercepta e abre o painel de saída
  }, [overlay, requestBack]);

  const leaveNow = useCallback(() => {
    leavingRef.current = true;
    setOverlay(null);
    if (actionRef.current) { navigation.dispatch(actionRef.current); actionRef.current = null; }
    else requestBack();
  }, [navigation, requestBack]);

  const saveAndExit = useCallback(() => { leaveAfterSaveRef.current = true; setOverlay(null); doSave(); }, [doSave]);

  /* ── Diagnóstico do Criador — §20 ── */
  const openDiag = useCallback(() => {
    canvasRef.current?.getStats?.((s) => setDiag(s));
    setOverlay('diag');
  }, []);
  const diagAction = useCallback((id) => {
    const c = canvasRef.current; if (!c) return;
    if (id === 'stroke') { c.setTool('draw'); c.setColor(colorRef.current); c.setBrushSize(brushWidth); }
    else if (id === 'undo') c.undo();
    else if (id === 'redo') c.redo();
    else if (id === 'clear') c.clearAll();
    else if (id === 'saveError') { setOverlay('saveError'); return; }
    else if (id === 'refresh') c.getStats?.((s) => setDiag(s));
    setTimeout(() => c.getStats?.((s) => setDiag(s)), 60);
  }, [brushWidth]);

  /* ── Métrica ── */
  const barTotal = CL.barHeight + Math.max(insets.bottom, 6);
  const panelBottom = barTotal;
  const panelMaxH = Math.round(winH * CL.panelMaxHeightRatio);
  const currentWidth = tool === 'eraser' ? eraserWidth : brushWidth;

  const panelTranslate = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [panelMaxH + 40, 0] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] });

  return (
    <View style={styles.wrapper}>
      {/* ── CABEÇALHO compacto ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8), height: CL.headerHeight + Math.max(insets.top, 8) }]}>
        {/* [P3J-R.1 FIX1] O rótulo do voltar vem do contrato de origem (`originBack.js`), a MESMA
            convenção que as outras telas reaproveitadas usam. Equivalência preservada: sem `from`
            continua "Voltar" e `createWithBeni` continua "Voltar ao Início"; a origem `cultinho`
            ganha "Voltar para Cultinho". O DESTINO da saída não muda — segue o `goBack` da pilha. */}
        <Pressable onPress={onBackPress} style={styles.iconBtn} hitSlop={8}
          accessibilityRole="button" accessibilityLabel={backLabelFor(from)}>
          <CriarLivreIcon name="back" size={24} color={CL.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <Pressable
          onPress={doSave}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Salvar desenho"
          accessibilityState={{ disabled: !canSave }}
        >
          {isSaving
            ? <ActivityIndicator size="small" color="#FFF" />
            : <CriarLivreIcon name="save" size={20} color={canSave ? '#FFF' : CL.disabled} />}
          <Text style={[styles.saveLabel, !canSave && { color: CL.disabled }]}>{isSaving ? 'Salvando' : 'Salvar'}</Text>
        </Pressable>
      </View>

      {/* ── PAPEL protagonista (canvas nunca redimensiona) ── */}
      <View style={styles.paperArea}>
        <Animated.View style={[styles.paperFrame]}>
          <AtelierCanvas ref={canvasRef} onReady={onCanvasReady} onHist={onHist} />
          {/* brilho de sucesso — só na borda, fora da arte exportada */}
          {savedFlash && (
            <Animated.View pointerEvents="none" style={[styles.saveGlow, { opacity: reduceMotion ? 0.5 : glowOpacity }]} />
          )}
        </Animated.View>

        {/* orientação inicial (RN overlay — NÃO entra na arte) */}
        {showOrientation && isBlank && (
          <View pointerEvents="none" style={styles.orientation}>
            <Text style={styles.orientationText}>Escolha uma cor e comece a desenhar.</Text>
          </View>
        )}

        {/* "Arte guardada." — feedback curto que some sozinho */}
        {savedFlash && (
          <View pointerEvents="none" style={styles.savedToast} accessibilityLiveRegion="polite">
            <CriarLivreIcon name="check" size={18} color={CL.saveDeep} />
            <Text style={styles.savedToastText}>Arte guardada.</Text>
          </View>
        )}
      </View>

      {/* ── PAINEL CONTEXTUAL (overlay absoluto; não redimensiona o papel) ── */}
      {overlay && overlay !== 'name' && (
        <>
          <Pressable style={[styles.backdrop, { bottom: panelBottom }]} onPress={() => setOverlay(null)} accessibilityLabel="Fechar painel" />
          <Animated.View
            style={[styles.panel, { bottom: panelBottom, maxHeight: overlay === 'color' ? Math.round(winH * 0.42) : panelMaxH, transform: [{ translateY: panelTranslate }] }]}
          >
            {overlay === 'color' && (
              <ColorPanel
                color={color} tool={tool} onPick={pickColor}
                paletteId={paletteId} onPalette={setPaletteId} recent={recentColors}
              />
            )}
            {overlay === 'brush' && (
              <BrushPanel
                tool={tool} color={color} width={currentWidth}
                onPreset={(w) => applyWidth(w, true)}
                onSlide={(w) => applyWidth(w, false)}
                onSliderPreset={onSliderPreset}
              />
            )}
            {overlay === 'more' && (
              <MorePanel
                tool={tool} brushWidth={brushWidth} eraserWidth={eraserWidth} color={color}
                onClear={() => setOverlay('clear')}
                onDiag={openDiag}
              />
            )}
            {overlay === 'clear' && (
              <ConfirmSheet
                title="Limpar todo o desenho?"
                desc="Você poderá desfazer essa ação."
                confirmLabel="Limpar"
                onCancel={() => setOverlay(null)}
                onConfirm={doClear}
              />
            )}
            {overlay === 'family' && (
              <FamilySheet
                onContinue={() => setOverlay(null)}
                onSeePlan={() => { setOverlay(null); navigation.navigate('ParentArea'); }}
              />
            )}
            {overlay === 'saveError' && (
              <ConfirmSheet
                title="Não deu para guardar."
                desc="Seu desenho está seguro. Quer tentar de novo?"
                confirmLabel="Tentar de novo"
                neutral
                onCancel={() => setOverlay(null)}
                onConfirm={() => { setOverlay(null); doSave(); }}
              />
            )}
            {overlay === 'exit' && (
              <ExitSheet
                canSaveExit={unlimited && canSave}
                armed={exitArmed}
                onContinue={() => { setOverlay(null); actionRef.current = null; }}
                onSaveExit={saveAndExit}
                onLeaveArm={() => setExitArmed(true)}
                onLeave={leaveNow}
              />
            )}
            {overlay === 'diag' && isInternalToolsEnabled() && (
              <DiagPanel info={diag} onAction={diagAction} />
            )}
          </Animated.View>
        </>
      )}

      {/* ── SHEET DE NOME (§5) — KeyboardAvoidingView para o teclado não cobrir o campo ── */}
      {overlay === 'name' && (
        <View style={styles.nameOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOverlay(null)} accessibilityLabel="Fechar" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.nameKav}
            keyboardVerticalOffset={insets.top}
          >
            <View style={styles.nameCard}>
              <Text style={styles.sheetTitle}>Nomeie seu desenho</Text>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Nome do desenho"
                placeholderTextColor={CL.disabled}
                maxLength={40}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={confirmName}
                accessibilityLabel="Nome do desenho"
              />
              <View style={styles.sheetBtns}>
                <Pressable style={[styles.sheetBtn, styles.sheetBtnNeutral]} onPress={() => setOverlay(null)} accessibilityRole="button" accessibilityLabel="Cancelar">
                  <Text style={styles.sheetBtnNeutralText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.sheetBtn, styles.sheetBtnSave]} onPress={confirmName} accessibilityRole="button" accessibilityLabel="Guardar desenho">
                  <Text style={styles.sheetBtnSaveText}>Guardar desenho</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* ── BARRA principal fixa (6 controles) — §6 ── */}
      <View style={[styles.bar, { height: barTotal, paddingBottom: Math.max(insets.bottom, 6) }]}>
        <ToolButton label="Cor" active={overlay === 'color'} onPress={() => openPanel('color')} accessibilityLabel={`Cor ${colorName(color)}`}>
          <View style={[styles.swatch, { backgroundColor: color }, isLightColor(color) && styles.swatchLight]} />
        </ToolButton>
        <ToolButton label="Pincel" active={tool === 'draw' && overlay !== 'color'} amber={false}
          onPress={() => { usePencil(); openPanel('brush'); }} accessibilityLabel="Pincel">
          <CriarLivreIcon name="brush" size={CL.iconSize} color={tool === 'draw' ? CL.activeBlue : CL.text} />
        </ToolButton>
        <ToolButton label="Apagar" active={tool === 'eraser'} amber onPress={useEraser} accessibilityLabel={`Borracha${tool === 'eraser' ? ', ativa' : ''}`}>
          <CriarLivreIcon name="eraser" size={CL.iconSize} color={tool === 'eraser' ? CL.eraserAmber : CL.text} />
        </ToolButton>
        <ToolButton iconOnly disabled={!canUndo} onPress={doUndo} accessibilityLabel={`Desfazer${canUndo ? '' : ', indisponível'}`}>
          <CriarLivreIcon name="undo" size={CL.iconSize} color={canUndo ? CL.text : CL.disabled} />
        </ToolButton>
        <ToolButton iconOnly disabled={!canRedo} onPress={doRedo} accessibilityLabel={`Refazer${canRedo ? '' : ', indisponível'}`}>
          <CriarLivreIcon name="redo" size={CL.iconSize} color={canRedo ? CL.text : CL.disabled} />
        </ToolButton>
        <ToolButton iconOnly active={overlay === 'more'} onPress={() => openPanel('more')} accessibilityLabel="Mais">
          <CriarLivreIcon name="more" size={CL.iconSize} color={overlay === 'more' ? CL.activeBlue : CL.text} />
        </ToolButton>
      </View>

      {pendingAchievement && (
        <AchievementUnlockModal achievement={pendingAchievement} onDismiss={dismissAchievement} />
      )}
    </View>
  );
}

/* ═══════════════════ Peças ═══════════════════ */

function colorName(hex) {
  for (const p of ORGANIZED_PALETTES) {
    const c = p.colors.find((x) => x.hex === hex);
    if (c) return c.label;
  }
  return '';
}

const ToolButton = React.memo(function ToolButton({ children, label, active, amber, disabled, iconOnly, onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.toolBtn,
        active && (amber ? styles.toolBtnAmber : styles.toolBtnActive),
        pressed && !disabled && styles.toolBtnPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
    >
      {children}
      {!iconOnly && label ? <Text style={[styles.toolLabel, active && (amber ? styles.toolLabelAmber : styles.toolLabelActive)]}>{label}</Text> : null}
    </Pressable>
  );
});

function Swatch({ c, selected, onPick, size = CL.swatchSize, cellStyle }) {
  const light = isLightColor(c.hex);
  const outer = size + 8;
  return (
    <Pressable
      onPress={() => onPick(c.hex)}
      style={cellStyle || styles.swatchCell}
      accessibilityRole="button"
      accessibilityLabel={`Cor ${c.label}${selected ? ', selecionada' : ''}`}
      accessibilityState={{ selected }}
    >
      <View style={[styles.swatchOuter, { width: outer, height: outer, borderRadius: outer / 2 }, selected && styles.swatchSelected]}>
        <View style={[styles.swatchColor, { backgroundColor: c.hex, width: size, height: size, borderRadius: size / 2 }, light && styles.swatchLight]}>
          {selected && light && <CriarLivreIcon name="check" size={Math.round(size * 0.55)} color="#3A2A1E" strokeWidth={2.4} />}
        </View>
      </View>
    </Pressable>
  );
}

function ColorPanel({ color, tool, onPick, paletteId, onPalette, recent }) {
  const palette = ORGANIZED_PALETTES.find((p) => p.id === paletteId) || ORGANIZED_PALETTES[0];
  const isSel = (hex) => color === hex && tool === 'draw';
  const recentColorObjs = (recent || []).map((hex) => {
    for (const p of ORGANIZED_PALETTES) { const f = p.colors.find((c) => c.hex === hex); if (f) return f; }
    return { hex, label: 'Cor recente' };
  });
  return (
    <View style={styles.panelInner}>
      {/* Seletor horizontal de paletas (§9.11) */}
      <View style={styles.paletteRow}>
        {ORGANIZED_PALETTES.map((p) => {
          const on = p.id === palette.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => onPalette(p.id)}
              style={[styles.paletteChip, on && styles.paletteChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Paleta ${p.name}${on ? ', selecionada' : ''}`}
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.paletteChipText, on && styles.paletteChipTextActive]} numberOfLines={1}>{p.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Recentes (discreto, no máx. 5) — só quando houver */}
      {recentColorObjs.length > 0 && (
        <View style={styles.recentRow}>
          <Text style={styles.recentLabel}>Recentes</Text>
          <View style={styles.recentDots}>
            {recentColorObjs.map((c) => (
              <Swatch key={`r-${c.hex}`} c={c} selected={isSel(c.hex)} onPick={onPick} size={22} cellStyle={styles.recentCell} />
            ))}
          </View>
        </View>
      )}

      {/* Grade da paleta ativa (6 por linha, sem rolagem vertical longa) */}
      <View style={styles.colorGrid}>
        {palette.colors.map((c) => (
          <Swatch key={c.hex} c={c} selected={isSel(c.hex)} onPick={onPick} size={CL.swatchSize} />
        ))}
      </View>
    </View>
  );
}

function BrushPanel({ tool, color, width, onPreset, onSlide, onSliderPreset }) {
  const isEraser = tool === 'eraser';
  const presets = isEraser ? ERASER_PRESETS : BRUSH_PRESETS;
  const min = isEraser ? ERASER_MIN : BRUSH_MIN;
  const max = isEraser ? ERASER_MAX : BRUSH_MAX;
  const previewColor = isEraser ? '#D8CBB6' : (isLightColor(color) ? '#C9BCA6' : color);
  return (
    <View style={styles.panelInner}>
      <Text style={styles.panelTitle}>{isEraser ? 'Tamanho da borracha' : 'Pincel'}</Text>
      {/* Prévia real do traço */}
      <View style={styles.brushPreview}>
        <View style={{ width: 90, height: Math.max(3, Math.min(width, 40)), borderRadius: Math.min(width, 40) / 2, backgroundColor: previewColor }} />
      </View>
      {/* Atalhos compactos */}
      <View style={styles.presetRow}>
        {presets.map((p) => {
          const on = Math.abs(width - p.width) <= 1;
          return (
            <Pressable
              key={p.id}
              onPress={() => onPreset(p.width)}
              style={[styles.presetBtn, on && styles.presetBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={`${isEraser ? 'Borracha' : 'Pincel'} ${p.label}${on ? ', selecionado' : ''}`}
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.presetLabel, on && styles.presetLabelActive]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {/* Controle contínuo */}
      <View style={styles.sliderWrap}>
        <CriarLivreSlider
          value={width} min={min} max={max}
          presets={presets.map((p) => p.width)}
          onChange={onSlide} onPreset={onSliderPreset}
          color={isEraser ? CL.eraserAmber : CL.activeBlue}
          accessibilityLabel={isEraser ? 'Tamanho da borracha' : 'Espessura do pincel'}
        />
      </View>
    </View>
  );
}

function MorePanel({ onClear, onDiag }) {
  return (
    <View style={styles.panelInner}>
      <Text style={styles.panelTitle}>Mais</Text>
      <Pressable style={styles.moreRow} onPress={onClear} accessibilityRole="button" accessibilityLabel="Limpar desenho">
        <CriarLivreIcon name="trash" size={22} color={CL.destructive} />
        <Text style={[styles.moreRowText, { color: CL.destructive }]}>Limpar desenho</Text>
      </Pressable>
      {isInternalToolsEnabled() && (
        <Pressable style={styles.moreRow} onPress={onDiag} accessibilityRole="button" accessibilityLabel="Diagnóstico do Criador">
          <CriarLivreIcon name="more" size={20} color={CL.textSoft} />
          <Text style={[styles.moreRowText, { color: CL.textSoft }]}>Diagnóstico do Criador</Text>
        </Pressable>
      )}
    </View>
  );
}

function ConfirmSheet({ title, desc, confirmLabel, neutral, onCancel, onConfirm }) {
  return (
    <View style={styles.panelInner}>
      <Text style={styles.sheetTitle}>{title}</Text>
      {desc ? <Text style={styles.sheetDesc}>{desc}</Text> : null}
      <View style={styles.sheetBtns}>
        <Pressable style={[styles.sheetBtn, styles.sheetBtnSafe]} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancelar">
          <Text style={styles.sheetBtnSafeText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.sheetBtn, neutral ? styles.sheetBtnNeutral : styles.sheetBtnDestructive]} onPress={onConfirm} accessibilityRole="button" accessibilityLabel={confirmLabel}>
          <Text style={neutral ? styles.sheetBtnNeutralText : styles.sheetBtnDestructiveText}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FamilySheet({ onContinue, onSeePlan }) {
  return (
    <View style={styles.panelInner}>
      <Text style={styles.sheetTitle}>Guardar é do Plano Família</Text>
      <Text style={styles.sheetDesc}>Você pode desenhar quanto quiser! Guardar suas artes faz parte do Plano Família.</Text>
      <View style={styles.sheetBtns}>
        <Pressable style={[styles.sheetBtn, styles.sheetBtnSafe]} onPress={onContinue} accessibilityRole="button" accessibilityLabel="Continuar desenhando">
          <Text style={styles.sheetBtnSafeText}>Continuar desenhando</Text>
        </Pressable>
        <Pressable style={[styles.sheetBtn, styles.sheetBtnNeutral]} onPress={onSeePlan} accessibilityRole="button" accessibilityLabel="Ver Plano Família">
          <Text style={styles.sheetBtnNeutralText}>Ver Plano Família</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ExitSheet({ canSaveExit, armed, onContinue, onSaveExit, onLeaveArm, onLeave }) {
  return (
    <View style={styles.panelInner}>
      <Text style={styles.sheetTitle}>Seu desenho ainda não foi salvo.</Text>
      <View style={styles.sheetColumn}>
        <Pressable style={[styles.sheetBtnWide, styles.sheetBtnSafe]} onPress={onContinue} accessibilityRole="button" accessibilityLabel="Continuar desenhando">
          <Text style={styles.sheetBtnSafeText}>Continuar desenhando</Text>
        </Pressable>
        {canSaveExit && (
          <Pressable style={[styles.sheetBtnWide, styles.sheetBtnSave]} onPress={onSaveExit} accessibilityRole="button" accessibilityLabel="Salvar e sair">
            <Text style={styles.sheetBtnSaveText}>Salvar e sair</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.sheetBtnWide, armed ? styles.sheetBtnDestructive : styles.sheetBtnGhost]}
          onPress={armed ? onLeave : onLeaveArm}
          accessibilityRole="button"
          accessibilityLabel={armed ? 'Confirmar sair sem salvar' : 'Sair sem salvar'}
        >
          <Text style={armed ? styles.sheetBtnDestructiveText : styles.sheetBtnGhostText}>
            {armed ? 'Toque de novo para sair' : 'Sair sem salvar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function DiagPanel({ info, onAction }) {
  const i = info || {};
  const Row = ({ k, v }) => (
    <View style={styles.diagRow}><Text style={styles.diagK}>{k}</Text><Text style={styles.diagV} numberOfLines={1}>{String(v)}</Text></View>
  );
  const ACTIONS = [
    { id: 'stroke', l: 'Traço teste' }, { id: 'undo', l: 'Desfazer' }, { id: 'redo', l: 'Refazer' },
    { id: 'clear', l: 'Limpar' }, { id: 'saveError', l: 'Erro salvar' }, { id: 'refresh', l: 'Atualizar' },
  ];
  return (
    <View style={styles.panelInner}>
      <Text style={styles.panelTitle}>Diagnóstico do Criador</Text>
      <View style={styles.diagGridWrap}>
        <Row k="motor" v="WebView canvas 2D" />
        <Row k="canvas" v={`${i.W ?? '—'}×${i.H ?? '—'}`} />
        <Row k="strokes" v={i.strokes ?? '—'} />
        <Row k="past/future" v={`${i.past ?? '—'}/${i.future ?? '—'}`} />
        <Row k="rev" v={i.rev ?? '—'} />
        <Row k="tool" v={i.tool ?? '—'} />
        <Row k="brush/eraser" v={`${i.brush ?? '—'}/${i.eraser ?? '—'}`} />
        <Row k="color" v={i.color ?? '—'} />
        <Row k="empty" v={i.empty ? 'sim' : 'não'} />
      </View>
      <View style={styles.diagActions}>
        {ACTIONS.map((a) => (
          <Pressable key={a.id} style={styles.diagBtn} onPress={() => onAction(a.id)} accessibilityLabel={a.l}>
            <Text style={styles.diagBtnText}>{a.l}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ═══════════════════ Estilos ═══════════════════ */
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: CL.surface },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, backgroundColor: CL.surface,
    borderBottomWidth: CL.hairline, borderBottomColor: CL.surfaceEdge,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 18, color: CL.text },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 44,
    paddingHorizontal: 14, borderRadius: CL.radiusControl, backgroundColor: CL.save,
    shadowColor: CL.saveDeep, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, shadowRadius: 2, elevation: 2,
  },
  saveBtnDisabled: { backgroundColor: CL.disabledSurface, shadowOpacity: 0, elevation: 0 },
  saveLabel: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },

  paperArea: { flex: 1, padding: CL.paperMargin },
  paperFrame: {
    flex: 1, borderRadius: CL.radiusPaper, overflow: 'hidden',
    backgroundColor: CL.paper, borderWidth: CL.hairline, borderColor: CL.paperEdge,
    ...CL.shadowPaper,
  },
  saveGlow: {
    ...StyleSheet.absoluteFillObject, borderRadius: CL.radiusPaper,
    borderWidth: 4, borderColor: CL.save,
  },

  orientation: {
    position: 'absolute', left: 0, right: 0, top: '42%', alignItems: 'center', paddingHorizontal: 30,
  },
  orientationText: {
    fontFamily: 'Nunito', fontSize: 15, fontWeight: '700',
    textAlign: 'center', color: 'rgba(90,74,50,0.5)',
  },
  savedToast: {
    position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFFEE', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#E7DCC6',
  },
  savedToastText: { fontFamily: 'FredokaOne', fontSize: 14, color: CL.saveDeep },

  /* barra principal */
  bar: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around',
    paddingTop: 8, paddingHorizontal: 6,
    backgroundColor: CL.surface,
    borderTopWidth: CL.hairline, borderTopColor: CL.surfaceEdge,
    borderTopLeftRadius: CL.radiusBar, borderTopRightRadius: CL.radiusBar,
    ...CL.shadowBar,
  },
  toolBtn: {
    minWidth: 44, minHeight: 44, borderRadius: CL.radiusControl,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 4, gap: 2,
  },
  toolBtnActive: { backgroundColor: CL.activeBlueSoft },
  toolBtnAmber: { backgroundColor: CL.eraserAmberSoft },
  toolBtnPressed: { opacity: 0.7 },
  toolLabel: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: CL.textSoft },
  toolLabelActive: { color: CL.activeBlue },
  toolLabelAmber: { color: CL.eraserAmber },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.12)' },
  swatchLight: { borderColor: '#C8B79C' },

  /* painel contextual */
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0 },
  panel: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: CL.surface,
    borderTopLeftRadius: CL.radiusPanel, borderTopRightRadius: CL.radiusPanel,
    borderTopWidth: CL.hairline, borderTopColor: CL.surfaceEdge,
    ...CL.shadowPanel,
  },
  panelInner: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  panelTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: CL.text, marginBottom: 10 },

  /* seletor de paletas (§9) */
  paletteRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  paletteChip: {
    flex: 1, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6, backgroundColor: CL.disabledSurface, borderWidth: 1.5, borderColor: 'transparent',
  },
  paletteChipActive: { backgroundColor: CL.activeBlueSoft, borderColor: CL.activeBlue },
  paletteChipText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: CL.textSoft },
  paletteChipTextActive: { color: CL.activeBlue },

  /* recentes (§9) */
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  recentLabel: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: CL.textSoft },
  recentDots: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  recentCell: { alignItems: 'center', justifyContent: 'center', minHeight: 34 },

  /* cores 6×3 */
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  swatchCell: { width: `${100 / 6}%`, alignItems: 'center', justifyContent: 'center', minHeight: CL.touchMin },
  swatchOuter: {
    width: CL.swatchSize + 8, height: CL.swatchSize + 8, borderRadius: (CL.swatchSize + 8) / 2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  swatchSelected: { borderColor: CL.activeGold },
  swatchColor: {
    width: CL.swatchSize, height: CL.swatchSize, borderRadius: CL.swatchSize / 2,
    alignItems: 'center', justifyContent: 'center',
  },

  /* pincel */
  brushPreview: { height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  presetBtn: {
    flex: 1, height: 44, borderRadius: CL.radiusControl, alignItems: 'center', justifyContent: 'center',
    backgroundColor: CL.disabledSurface, borderWidth: 2, borderColor: 'transparent',
  },
  presetBtnActive: { backgroundColor: CL.activeBlueSoft, borderColor: CL.activeBlue },
  presetLabel: { fontFamily: 'FredokaOne', fontSize: 13, color: CL.textSoft },
  presetLabelActive: { color: CL.activeBlue },
  sliderWrap: { paddingHorizontal: 4 },

  /* mais */
  moreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, paddingHorizontal: 6 },
  moreRowText: { fontFamily: 'FredokaOne', fontSize: 15 },

  /* sheet de nome (§5) */
  nameOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(40,28,12,0.28)', justifyContent: 'flex-end' },
  nameKav: { width: '100%' },
  nameCard: {
    backgroundColor: CL.surface, borderTopLeftRadius: CL.radiusPanel, borderTopRightRadius: CL.radiusPanel,
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 22, ...CL.shadowPanel,
  },
  nameInput: {
    height: 50, borderRadius: CL.radiusControl, borderWidth: 1.5, borderColor: CL.paperEdge,
    backgroundColor: CL.paper, paddingHorizontal: 14, marginTop: 10, marginBottom: 14,
    fontFamily: 'Nunito', fontSize: 16, fontWeight: '700', color: CL.text,
  },

  /* confirm/exit/family */
  sheetTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: CL.text, marginBottom: 6 },
  sheetDesc: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '700', color: CL.textSoft, marginBottom: 14, lineHeight: 18 },
  sheetBtns: { flexDirection: 'row', gap: 10 },
  sheetColumn: { gap: 8 },
  sheetBtn: { flex: 1, height: 46, borderRadius: CL.radiusControl, alignItems: 'center', justifyContent: 'center' },
  sheetBtnWide: { height: 48, borderRadius: CL.radiusControl, alignItems: 'center', justifyContent: 'center' },
  sheetBtnSafe: { backgroundColor: CL.activeBlueSoft },
  sheetBtnSafeText: { fontFamily: 'FredokaOne', fontSize: 14, color: CL.activeBlue },
  sheetBtnDestructive: { backgroundColor: CL.destructiveSoft, borderWidth: 1.5, borderColor: CL.destructive },
  sheetBtnDestructiveText: { fontFamily: 'FredokaOne', fontSize: 14, color: CL.destructive },
  sheetBtnNeutral: { backgroundColor: CL.disabledSurface },
  sheetBtnNeutralText: { fontFamily: 'FredokaOne', fontSize: 14, color: CL.text },
  sheetBtnSave: { backgroundColor: CL.save },
  sheetBtnSaveText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  sheetBtnGhost: { backgroundColor: 'transparent' },
  sheetBtnGhostText: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: CL.textSoft },

  /* diagnóstico */
  diagGridWrap: { marginBottom: 10 },
  diagRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  diagK: { fontFamily: 'Nunito', fontSize: 11, color: CL.textSoft },
  diagV: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: CL.text, maxWidth: '60%' },
  diagActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  diagBtn: { backgroundColor: CL.disabledSurface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  diagBtnText: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: CL.text },
});
