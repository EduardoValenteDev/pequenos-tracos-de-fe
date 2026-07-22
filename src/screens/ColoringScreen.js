import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import ColoringCanvas, { ERASER_COLOR } from '../components/ColoringCanvas';
import { COLOR_PALETTE } from '../constants/colorPalette';
import SoundButton from '../components/SoundButton';
import { useResolvedColoringImage } from '../hooks/useResolvedStoryMedia';
import {
  getSavedDrawing,
  saveDrawingState,
  clearDrawingState,
  clearAllSavedDrawings,
  hasMeaningfulPaint,
} from '../services/drawingStorage';
import { markStoryColoringActivityDone } from '../services/coloringActivityService';
import { useProgressContext } from '../context/ProgressContext';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { isCreatorQaModeEnabled } from '../services/creatorQaMode';
import FaithIcon from '../components/ui/FaithIcon';
import { backLabelFor } from '../utils/originBack';
// P2.T2 (Colorir 60) — resolvedor local ADITIVO por (storyId, activityId). Consumido
// SOMENTE no ramo aditivo abaixo; o caminho legado por cena não o toca.
import {
  resolveColoring60Lineart,
  COLORING60_RESOLUTION_STATUS,
} from '../services/coloring60Resolver';
// P4.T1/T2 (Colorir 60) — conclusão por identidade (plan-agnóstica) e writer dedicado de
// pixels (revalida o plano internamente). Ambos consumidos SOMENTE no ramo aditivo abaixo:
// a CONCLUSÃO é separada do SALVAMENTO (o writer só persiste no Plano Família). O caminho
// legado por cena não toca nenhum dos dois.
import { markColoring60ActivityDone } from '../services/coloring60ActivityService';
import {
  saveColoring60DrawingState,
  COLORING60_SAVE_RESULT,
} from '../services/coloring60DrawingStorage';

// Orientação inicial do Colorir (UI-pref, não progresso): aparece UMA vez por
// dispositivo e some ao tocar "Entendi", ao pintar pela 1ª vez ou por tempo.
// Chave nova (v_start) para que a nova orientação apareça uma vez para todos.
const PAN_HINT_KEY = '@ptf_coloring_start_hint_v1';


// Ferramenta compacta: só ícone (sem rótulo embaixo) com área tocável segura.
// Ferramentas de alta repetição (borracha/desfazer): sem som (Bloco 5).
function CompactTool({ children, onPress, active, accessibilityLabel }) {
  return (
    <SoundButton
      silent
      accessibilityLabel={accessibilityLabel}
      style={[styles.compactTool, active && styles.compactToolActive]}
      onPress={onPress}
    >
      {children}
    </SoundButton>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// P2.T2 — Ramo ADITIVO Colorir 60 por `activityId`.
//
// `ColoringScreen` (export default) é um wrapper FINO e SEM hooks: se a rota traz
// `activityId` (string semântica), delega ao ramo Colorir 60; caso contrário, delega
// ao corpo LEGADO 100% intocado (`LegacyColoringScreen`). Como o wrapper não chama
// hooks e cada instância montada tem params fixos, não há violação das Regras de Hooks.
//
// Exposição pública: NENHUMA superfície pública passa `activityId` neste bloco (flag
// COLORIR_60_CREATION_PILOT_ENABLED segue off; nenhum botão/rota criado). O ramo é
// alcançável apenas por navegação direta com o param — o gate de exposição pertence a P7.
// ─────────────────────────────────────────────────────────────────────────────
export default function ColoringScreen({ route, navigation }) {
  // `activityId` é semântico: presença (não-nula) seleciona o caminho Colorir 60.
  if (route.params?.activityId != null) {
    return <Coloring60ActivityScreen route={route} navigation={navigation} />;
  }
  return <LegacyColoringScreen route={route} navigation={navigation} />;
}

// [C60-P4-STORYID] Fonte ÚNICA de storyId (Etapa 8). `route.params.storyId` é a identidade
// primária. Se `route.params.story?.id` também vier e DIVERGIR, a identidade é contraditória:
// não escolhe silenciosamente — devolve null (→ resolvedor 'unknown', estado honesto). Sem
// divergência, aceita a que existir. Nunca coage a número nem interpreta como cena/índice.
function resolveC60StoryId(params) {
  const primary = params?.storyId ?? null;
  const alt = params?.story?.id ?? null;
  if (primary != null && alt != null && primary !== alt) return null; // contradição → não resolve
  return primary ?? alt;
}

// [C60-P4-PAYLOAD] Validação de payload NO CHAMADOR (Etapa 9), SEM alterar o contrato do writer.
// Aceita SOMENTE um data URL de imagem OU o JSON v2 do canvas ({ v:2, ..., data:<data URL> }).
// Rejeita null/undefined/vazio/malformado e QUALQUER ponteiro (v3): o writer é quem materializa
// v3 internamente; o caller nunca lhe envia um ponteiro. Assim o writer nunca recebe lixo.
function isAcceptableC60Payload(payload) {
  if (typeof payload !== 'string' || payload.length === 0) return false;
  if (payload.startsWith('data:image/')) return payload.length > 1000;
  let obj;
  try { obj = JSON.parse(payload); } catch { return false; }
  if (!obj || typeof obj !== 'object') return false;
  if (obj.v === 3 || typeof obj.uri === 'string') return false; // ponteiro v3 nunca vem do canvas
  return obj.v === 2
    && typeof obj.data === 'string'
    && obj.data.startsWith('data:image/')
    && obj.data.length > 1000;
}

// Ramo Colorir 60: presentacional e local-first. Resolve por (storyId, activityId), respeita os
// três estados honestos e — no estado `available` (P4.T2) — compõe o `ColoringCanvas` existente
// (SEM alterar seu contrato) com paleta e "Pronto". A CONCLUSÃO (booleano leve, plan-agnóstica) é
// SEPARADA do SALVAMENTO de pixels (writer, que só persiste no Plano Família): concluir vale para
// Grátis e Família; salvar pixels é gated pelo writer. NÃO usa o caminho legado (`getColoringImage`/
// cena), NÃO faz fallback para scene_02, NÃO concede estrela, NÃO conclui cena narrativa, NÃO chama
// refreshProgress (o ramo dormente não tem métrica pública). deferred/unknown mostram estado honesto.
function Coloring60ActivityScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const canvasRef = useRef(null);
  const [c60Color, setC60Color] = useState(COLOR_PALETTE[0].hex);
  const [c60Ready, setC60Ready] = useState(false);      // D1: lineart carregado no canvas
  const [c60HasPainted, setC60HasPainted] = useState(false); // D5: houve traço significativo
  const [c60Saving, setC60Saving] = useState(false);

  const storyId = resolveC60StoryId(route.params);
  const activityId = route.params?.activityId ?? null;
  const resolution = resolveColoring60Lineart(storyId, activityId);
  const available = resolution.status === COLORING60_RESOLUTION_STATUS.AVAILABLE;

  // [C60-P4-HANDLER-START] Ordem canônica (Etapa 11): D1(lineart pronto) → D5(traço) → export →
  // validar payload no caller → MARCAR CONCLUSÃO (plan-agnóstica, antes do writer) → chamar o
  // writer (revalida o plano internamente; Grátis=not_persisted_free, Família=saved) → resultado
  // tipado tratado SEPARADAMENTE, sem apagar a conclusão nem anunciar salvamento falso → voltar.
  function handleC60Pronto() {
    if (!available || c60Saving) return;
    if (!c60Ready) return;       // D1: sem lineart pronto não conclui nem salva
    if (!c60HasPainted) return;  // D5: sem traço significativo não conclui nem salva
    setC60Saving(true);
    canvasRef.current?.exportPaint(async (exportData) => {
      // Rejeita payload inválido/ponteiro ANTES de marcar conclusão ou chamar o writer.
      if (!isAcceptableC60Payload(exportData) || !hasMeaningfulPaint(exportData)) {
        setC60Saving(false);
        return;
      }
      // CONCLUSÃO ≠ SALVAMENTO: marca a conclusão (plan-agnóstica) ANTES do writer e de forma
      // INDEPENDENTE do resultado de persistência — Grátis conclui mesmo sem pixels salvos.
      await markColoring60ActivityDone(storyId, activityId);
      // Writer dedicado: revalida o plano INTERNAMENTE (Família persiste; Grátis não persiste).
      const result = await saveColoring60DrawingState(storyId, activityId, exportData);
      // Resultados tipados tratados SEPARADAMENTE — todos NEUTROS no ramo dormente (sem anúncio):
      //   SAVED (Família): pixels persistidos; NOT_PERSISTED_FREE (Grátis): conclusão vale, sem
      //   pixels; WRITE_FAILED: conclusão PRESERVADA, nada de "salvo" falso. Falha JAMAIS apaga
      //   a conclusão já registrada.
      const resultLabel =
        result === COLORING60_SAVE_RESULT.SAVED ? 'saved'
        : result === COLORING60_SAVE_RESULT.NOT_PERSISTED_FREE ? 'not_persisted_free'
        : result === COLORING60_SAVE_RESULT.WRITE_FAILED ? 'write_failed'
        : 'invalid_identity';
      if (__DEV__) console.log('[Coloring60] conclusão preservada; persistência:', resultLabel);
      setC60Saving(false);
      navigation.goBack();
    });
  }
  // [C60-P4-HANDLER-END]

  const eraserActive = c60Color === ERASER_COLOR;

  if (available) {
    return (
      <View style={styles.container}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
          <SoundButton style={styles.topBarNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.topBarNavBtnText}>← Voltar</Text>
          </SoundButton>
          <Text style={styles.topBarTitle} numberOfLines={1}>Hora de Colorir</Text>
          <View style={styles.topBarActions}>
            <SoundButton
              style={[styles.prontoBtn, c60Saving && styles.prontoBtnSaving]}
              onPress={handleC60Pronto}
              activeOpacity={0.85}
              disabled={c60Saving}
            >
              <Text style={styles.prontoBtnText}>{c60Saving ? 'Salvando...' : '✓ Pronto!'}</Text>
            </SoundButton>
          </View>
        </View>

        {/* Canvas: composição do motor existente SEM alterar seu contrato. `imageSource` aceita o
            módulo do resolvedor; sinais D1 (onReadyChange) e D5 (onPainted) são consumidos por
            composição. Sem sceneNumber numérico (identidade Colorir 60 é semântica). */}
        <View style={styles.canvasArea}>
          <ColoringCanvas
            ref={canvasRef}
            selectedColor={c60Color}
            imageSource={resolution.source}
            storyId={storyId}
            onReadyChange={setC60Ready}
            onPainted={() => setC60HasPainted(true)}
            onGoBack={() => navigation.goBack()}
          />
        </View>

        <View style={[styles.overlayPanel, { bottom: insets.bottom + 8 }]}>
          <View style={styles.toolsRow}>
            <CompactTool
              active={eraserActive}
              accessibilityLabel="Borracha"
              onPress={() => setC60Color(ERASER_COLOR)}
            >
              <MaterialCommunityIcons name="eraser" size={24} color={eraserActive ? '#6B4F00' : '#666'} />
            </CompactTool>
            <CompactTool accessibilityLabel="Desfazer" onPress={() => canvasRef.current?.undo()}>
              <FaithIcon name="undo" size={22} color="#666" />
            </CompactTool>
            <CompactTool accessibilityLabel="Ver tudo (centralizar)" onPress={() => canvasRef.current?.resetZoom()}>
              <FaithIcon name="zoom_reset" size={22} color="#666" />
            </CompactTool>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.paletteScroll}
            contentContainerStyle={styles.paletteContent}
          >
            {COLOR_PALETTE.map(({ hex }) => (
              <SoundButton key={hex} silent style={styles.dotWrapper} onPress={() => setC60Color(hex)}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: hex },
                    hex === '#FFFFFF' && styles.colorDotWhiteBorder,
                    c60Color === hex && styles.colorDotSelected,
                  ]}
                />
              </SoundButton>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  // deferred OU unknown → estado honesto, SEM lineart, SEM scene_02, SEM legado.
  const isDeferred = resolution.status === COLORING60_RESOLUTION_STATUS.DEFERRED;
  return (
    <View style={[c60Styles.container, c60Styles.emptyCenter, { paddingTop: insets.top }]}>
      <Text style={c60Styles.emptyTitle}>
        {isDeferred ? 'Este desenho ainda está a caminho' : 'Atividade indisponível'}
      </Text>
      <Text style={c60Styles.emptyText}>
        {isDeferred
          ? 'Em breve você poderá colorir esta atividade.'
          : 'Não encontramos esta atividade.'}
      </Text>
    </View>
  );
}

const c60Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyCenter: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 15, color: colors.textLight, textAlign: 'center', marginTop: 8 },
});

function LegacyColoringScreen({ route, navigation }) {
  const { refreshProgress } = useProgressContext();
  const { story, cenaIndex, from } = route.params;
  const cena = story.cenas[cenaIndex];
  const canvasRef = useRef(null);
  const insets = useSafeAreaInsets();

  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);
  const [hasPainted, setHasPainted] = useState(false);
  const [showPaintFirst, setShowPaintFirst] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Lineart carregado? Sem isso a arte ficaria sem contorno — bloqueia o salvar.
  const [canvasReady, setCanvasReady] = useState(false);

  // Drawing restore state
  const [savedDrawing, setSavedDrawing] = useState(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Touch feedback: shown briefly when user taps on a line instead of white area
  const [showLineTip, setShowLineTip] = useState(false);
  const lineTipTimerRef = useRef(null);

  // Menu compacto de opções (guarda "Limpar tudo" fora do destaque)
  const [showMenu, setShowMenu] = useState(false);

  // Dica de primeira vez "use dois dedos para mover o desenho" (Modo Colorir Grande)
  const [showPanHint, setShowPanHint] = useState(false);
  const panHintTimerRef = useRef(null);

  // Fase 2B.6 (RP3): revalida ACESSO ao FOCAR (não só no mount). Sem áudio → bloquear e
  // sair seguro. QA do Criador (duplo-gate) mantém o bypass só em dev/permitido; o fluxo
  // normal da criança segue com paywall — pack no disco NÃO libera abertura.
  useFocusEffect(
    useCallback(() => {
      const qaBypass = route.params?.qa === true && isCreatorQaModeEnabled();
      if (!qaBypass && !canOpenStoryFullExperience(story)) {
        navigation.replace('ParentArea');
      }
    }, [story, route.params?.qa]),
  );

  // Check for a previously saved drawing when the screen opens.
  // O modal "Você já começou este desenho" NÃO é decidido só pela existência da
  // chave: o desenho salvo precisa ter tinta real E ser CARREGÁVEL no canvas atual.
  // Por isso passamos o payload para o canvas VALIDAR (validatePaint) antes de
  // mostrar o modal — onPaintValid abre o modal; onPaintInvalid cura (limpa a chave
  // incompatível/corrompida e abre a cena como nova, sem modal falso).
  useEffect(() => {
    let alive = true;
    getSavedDrawing(story.id, cena.id).then(saved => {
      if (!alive) return;
      if (saved && hasMeaningfulPaint(saved)) {
        setSavedDrawing(saved);
        // O canvas enfileira a validação até estar pronto (READY).
        canvasRef.current?.validatePaint(saved);
      } else if (saved) {
        // Chave existente sem tinta real (vazia) → remove e abre como nova.
        clearDrawingState(story.id, cena.id);
        setSavedDrawing(null);
      }
    });
    return () => { alive = false; };
  }, []);

  // Cura um estado salvo inválido (incompatível/corrompido): remove a chave da cena
  // e abre limpa — nunca deixa modal de continuar nem "concluído" falso.
  function healInvalidSavedDrawing() {
    clearDrawingState(story.id, cena.id);
    setSavedDrawing(null);
    setShowResumeDialog(false);
  }

  // Orientação inicial: "toque numa parte branca para começar" + gesto de mover.
  // Mostra UMA vez por dispositivo (flag persistida) e some sozinha — nunca fixa.
  // Só faz sentido com imagem de história (Modo Colorir Grande).
  useEffect(() => {
    if (!imageSource) return;
    let cancelled = false;
    AsyncStorage.getItem(PAN_HINT_KEY).then(seen => {
      if (cancelled || seen) return;
      setShowPanHint(true);
      AsyncStorage.setItem(PAN_HINT_KEY, '1').catch(() => {});
      panHintTimerRef.current = setTimeout(() => setShowPanHint(false), 8000);
    }).catch(() => {});
    return () => {
      cancelled = true;
      if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
    };
  }, []);

  // Some ao tocar "Entendi" ou ao pintar pela 1ª vez.
  function dismissStartHint() {
    if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
    setShowPanHint(false);
  }

  // DEV: expose console helpers to clear saved state during testing
  useEffect(() => {
    if (!__DEV__) return;
    global.__devClearColoringDrawing = async () => {
      await clearDrawingState(story.id, cena.id);
      setSavedDrawing(null);
      setShowResumeDialog(false);
      console.log('[DEV] Cleared drawing for scene', story.id, cena.id);
    };
    global.__devClearAllColoringDrawings = async () => {
      const count = await clearAllSavedDrawings();
      console.log('[DEV] Cleared', count, 'saved drawings');
    };
    console.log('[DEV ColoringScreen] Helpers: __devClearColoringDrawing() | __devClearAllColoringDrawings()');
    return () => {
      delete global.__devClearColoringDrawing;
      delete global.__devClearAllColoringDrawings;
    };
  }, []);

  // Field aliases for backward compatibility
  const tituloColorir = cena.tituloColorir ?? cena.instrucaoColorir ?? cena.colorirElemento ?? '';
  // F2.4e.3: colorir remoto (file://) p/ david_goliath com pack ready + arquivo existente;
  // fallback local (getColoringImage) idêntico ao anterior para todas as outras condições.
  const imageSource = useResolvedColoringImage(story, cenaIndex);

  // COLORIR IMERSIVO V1: o canvas não é mais dimensionado à altura exata da imagem
  // 4:5 (isso prendia o desenho numa faixa curta e deixava sobra vertical). Agora o
  // canvas ocupa TODA a área entre o header e o fim da tela (flex:1, full-bleed) e as
  // ferramentas/paleta viram um overlay flutuante que SOBREPÕE o canvas (não rouba
  // faixa). O desenho abre em modo grande (zoom inicial) dentro desse viewport maior;
  // o pan de dois dedos (com inset inferior no clamp) alcança a parte sob o overlay e
  // "Ver tudo" reenquadra a imagem inteira.

  if (__DEV__ && !imageSource) {
    console.warn(`[ColoringScreen] Imagem ausente — história ${story.id} cena ${cena.id}.`);
  }

  /* ── Missing image early return ───────────────────────────────── */
  if (!imageSource) {
    return (
      <View style={styles.missingContainer}>
        <LinearGradient
          colors={[cena.corTema || colors.secondary, (cena.corTema || colors.secondary) + 'AA']}
          style={styles.missingGradient}
        >
          <Text style={styles.missingEmoji}>{cena.emojiCena ?? '🎨'}</Text>
          <Text style={styles.missingTitle}>{tituloColorir || cena.titulo}</Text>
          <Text style={styles.missingSub}>
            Este desenho ainda está a caminho!{'\n'}Em breve você poderá colorir esta cena. ✨
          </Text>
          <SoundButton
            style={styles.missingBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.missingBtnText}>Voltar para a cena ▶</Text>
          </SoundButton>
        </LinearGradient>
      </View>
    );
  }

  /* ── Resume drawing handlers ──────────────────────────────────── */
  function handleContinueDrawing() {
    setShowResumeDialog(false);
    canvasRef.current?.loadPaint(savedDrawing);
    setHasPainted(true);
  }

  function handleStartFresh() {
    Alert.alert(
      'Apagar as cores? 🎨',
      'Tem certeza que quer apagar as cores deste desenho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar cores',
          style: 'destructive',
          onPress: async () => {
            await clearDrawingState(story.id, cena.id);
            setSavedDrawing(null);
            setShowResumeDialog(false);
          },
        },
      ],
    );
  }

  /* ── Actions ─────────────────────────────────────────────────── */
  // Colorir é atividade complementar: APENAS salva a arte da criança e volta
  // para a cena. Nunca conclui cena, nunca dá estrela, nunca avança a história.
  // A conclusão da cena acontece somente na NarrationScreen.
  function handleProximo() {
    if (!hasPainted) {
      setShowPaintFirst(true);
      return;
    }
    // Não salvar sem o contorno carregado — evita arte sem lineart.
    if (!canvasReady) {
      Alert.alert(
        'Quase lá! 🎨',
        'O desenho ainda está carregando. Espere um instante e toque em Pronto de novo.',
        [{ text: 'Ok!' }],
      );
      return;
    }
    setIsSaving(true);
    canvasRef.current?.exportPaint(async (exportData) => {
      await saveDrawingState(story.id, cena.id, exportData);
      // A0.10: marca a ATIVIDADE de colorir concluída (booleano leve, independente
      // de salvar arte na galeria) — alimenta journeyComplete mesmo se, no futuro,
      // salvar na galeria for bloqueado para Free. Não altera o save acima.
      await markStoryColoringActivityDone(story.id, cena.id);
      // Propaga ao contexto (mapa/estante/pais) — como StoryBook/Quiz/Reflexão fazem —
      // para o journeyComplete refletir na hora se colorir foi a última pendência.
      refreshProgress();
      setIsSaving(false);
      navigation.goBack();
    });
  }

  function handleSelectColor(cor) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColor(cor);
  }

  function handleUndo() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    canvasRef.current?.undo();
  }

  function handleClearAll() {
    Alert.alert(
      'Apagar as cores deste desenho?',
      'Você pode continuar colorindo depois.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            canvasRef.current?.clearCanvas();
            await clearDrawingState(story.id, cena.id);
            setSavedDrawing(null);
          },
        },
      ],
    );
  }

  function handleResetZoom() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    canvasRef.current?.resetZoom();
  }

  function handleFillRejected() {
    setShowLineTip(true);
    if (lineTipTimerRef.current) clearTimeout(lineTipTimerRef.current);
    lineTipTimerRef.current = setTimeout(() => setShowLineTip(false), 2500);
  }

  useEffect(() => {
    return () => { if (lineTipTimerRef.current) clearTimeout(lineTipTimerRef.current); };
  }, []);

  const eraserActive = selectedColor === ERASER_COLOR;

  return (
    <View style={styles.container}>

      {/* ── TOP BAR ────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <SoundButton style={styles.topBarNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.topBarNavBtnText}>← {backLabelFor(from)}</Text>
        </SoundButton>
        <Text style={styles.topBarTitle} numberOfLines={1}>Hora de Colorir</Text>
        <View style={styles.topBarActions}>
          <SoundButton style={styles.topBarHomeBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
            <Text style={styles.topBarHomeBtnText}>🏠</Text>
          </SoundButton>
          <SoundButton
            style={[styles.prontoBtn, isSaving && styles.prontoBtnSaving]}
            onPress={handleProximo}
            activeOpacity={0.85}
            disabled={isSaving}
          >
            <Text style={styles.prontoBtnText}>{isSaving ? 'Salvando...' : '✓ Pronto!'}</Text>
          </SoundButton>
        </View>
      </View>

      {/* ── CANVAS — full-bleed, ocupa TODA a área entre header e fim da tela ── */}
      <View style={styles.canvasArea}>
        <ColoringCanvas
            ref={canvasRef}
            selectedColor={selectedColor}
            imageSource={imageSource}
            storyId={story.id}
            sceneNumber={cena.id}
            onReadyChange={setCanvasReady}
            onPainted={() => { setHasPainted(true); dismissStartHint(); }}
            onFillRejected={handleFillRejected}
            onGoBack={() => navigation.goBack()}
            // Validação do desenho salvo (probe, antes de aplicar):
            onPaintValid={() => setShowResumeDialog(true)}
            onPaintInvalid={healInvalidSavedDrawing}
            onLoadCorrupted={() => {
              // Falha ao aplicar de verdade (raro, p.ex. ao "Continuar"): cura e avisa.
              healInvalidSavedDrawing();
              Alert.alert(
                '🎨 Atenção',
                'Esse desenho salvo teve um problema, mas você pode começar de novo.',
                [{ text: 'Tudo bem!' }],
              );
            }}
            onLoadIncompatible={() => {
              // Estado de um tamanho de tela diferente — cura (limpa) e abre limpa.
              if (__DEV__) console.log('[ColoringScreen] [COLORING_STATE] incompatible state — healing');
              healInvalidSavedDrawing();
            }}
          />
      </View>

      {/* ── OVERLAY flutuante — ferramentas + paleta SOBRE o canvas (não empurra) ── */}
      <View style={[styles.overlayPanel, { bottom: insets.bottom + 8 }]}>

        {/* Menu pequeno: guarda "Limpar tudo" fora do destaque (com confirmação). */}
        {showMenu && (
          <>
            <Pressable style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
            <View style={styles.menuPopover}>
              <SoundButton
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); handleClearAll(); }}
              >
                <Text style={styles.menuItemText}>🧹  Limpar tudo</Text>
              </SoundButton>
            </View>
          </>
        )}

        {/* Ferramentas principais — ícones compactos (no máx.: Borracha, Desfazer,
            Ver tudo, Mais). O botão de ampliar saiu — zoom é por gesto de dois dedos. */}
        <View style={styles.toolsRow}>
          <CompactTool
            active={eraserActive}
            accessibilityLabel="Borracha"
            onPress={() => handleSelectColor(ERASER_COLOR)}
          >
            <MaterialCommunityIcons name="eraser" size={24} color={eraserActive ? '#6B4F00' : '#666'} />
          </CompactTool>
          <CompactTool accessibilityLabel="Desfazer" onPress={handleUndo}>
            <FaithIcon name="undo" size={22} color="#666" />
          </CompactTool>
          <CompactTool accessibilityLabel="Ver tudo (centralizar)" onPress={handleResetZoom}>
            <FaithIcon name="zoom_reset" size={22} color="#666" />
          </CompactTool>
          <CompactTool active={showMenu} accessibilityLabel="Mais opções" onPress={() => setShowMenu(v => !v)}>
            <Text style={styles.moreDots}>⋯</Text>
          </CompactTool>
        </View>

        {/* Paleta — faixa compacta, rolagem horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.paletteScroll}
          contentContainerStyle={styles.paletteContent}
        >
          {COLOR_PALETTE.map(({ hex }) => (
            <SoundButton
              key={hex}
              silent
              style={styles.dotWrapper}
              onPress={() => handleSelectColor(hex)}
            >
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: hex },
                  hex === '#FFFFFF' && styles.colorDotWhiteBorder,
                  selectedColor === hex && styles.colorDotSelected,
                ]}
              />
            </SoundButton>
          ))}
        </ScrollView>

      </View>

      {/* ── ORIENTAÇÃO INICIAL — 1ª vez: tocar numa parte branca + gesto de mover ── */}
      {showPanHint && (
        <View style={[styles.panHint, { top: Math.max(insets.top, 8) + 54 }]}>
          <Text style={styles.startHintTitle}>👆 Toque em uma parte branca para começar a colorir.</Text>
          <Text style={styles.startHintSub}>✌️ Use dois dedos para aproximar ou mover o desenho.</Text>
          <SoundButton style={styles.startHintBtn} onPress={dismissStartHint} activeOpacity={0.85}>
            <Text style={styles.startHintBtnText}>Entendi</Text>
          </SoundButton>
        </View>
      )}

      {/* ── LINE TIP — shown when user taps on a line ──────────── */}
      {showLineTip && (
        <View
          style={[styles.lineTip, { bottom: 168 + insets.bottom }]}
          pointerEvents="none"
        >
          <Text style={styles.lineTipText}>Toque dentro de uma parte branca para colorir</Text>
        </View>
      )}

      {/* ── RESUME DIALOG ──────────────────────────────────────── */}
      {showResumeDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogEmoji}>🎨</Text>
            <Text style={styles.dialogTitle}>Você já começou este desenho!</Text>
            <Text style={styles.dialogSub}>Quer continuar de onde parou?</Text>
            <SoundButton style={styles.dialogBtnPrimary} onPress={handleContinueDrawing} activeOpacity={0.85}>
              <Text style={styles.dialogBtnPrimaryText}>✨ Continuar meu desenho</Text>
            </SoundButton>
            <SoundButton style={styles.dialogBtnSecondary} onPress={handleStartFresh} activeOpacity={0.85}>
              <Text style={styles.dialogBtnSecondaryText}>Começar de novo</Text>
            </SoundButton>
          </View>
        </View>
      )}

      {/* ── PINTE PRIMEIRO MODAL ───────────────────────────────── */}
      {showPaintFirst && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogEmoji}>🎨</Text>
            <Text style={styles.dialogTitle}>Pinte um pouquinho primeiro!</Text>
            <Text style={styles.dialogSub}>Pinte um pedacinho da cena antes de continuar!</Text>
            <SoundButton
              style={styles.dialogBtnPrimary}
              onPress={() => setShowPaintFirst(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.dialogBtnPrimaryText}>Tá bom! 🖌️</Text>
            </SoundButton>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },

  /* ── Top bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 5,
    backgroundColor: colors.cardBg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  topBarNavBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F0EAE0',
  },
  topBarNavBtnText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  topBarTitle: {
    flex: 1,
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarHomeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarHomeBtnText: { fontSize: 20 },
  prontoBtn: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  prontoBtnSaving: {
    backgroundColor: '#9E9E9E',
    elevation: 0,
    shadowOpacity: 0,
  },
  prontoBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  /* ── Canvas — IMERSIVO: full-bleed, ocupa toda a área entre header e fim da tela ── */
  canvasArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFDF8',
  },

  /* ── Overlay flutuante (ferramentas + paleta) — SOBRE o canvas, não rouba faixa ──
     Creme com leve transparência, sombra suave, cantos arredondados, compacto. */
  overlayPanel: {
    position: 'absolute',
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255,253,248,0.94)',
    borderRadius: 22,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },

  /* Ferramentas — ícones compactos (sem rótulo), área tocável ~44pt */
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 2,
    paddingBottom: 6,
  },
  compactTool: {
    width: 46,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EAE0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  compactToolActive: {
    backgroundColor: '#FFE066',
    elevation: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  moreDots: { fontFamily: 'FredokaOne', fontSize: 22, color: '#666', lineHeight: 24 },

  /* Menu pequeno (Limpar tudo) */
  menuBackdrop: { ...StyleSheet.absoluteFillObject, top: -1000 },
  menuPopover: {
    position: 'absolute',
    right: 12,
    top: -46,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE0D4',
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 18 },
  menuItemText: { fontFamily: 'Nunito', fontSize: 14, color: '#6B4F00', fontWeight: '700' },

  /* Paleta — faixa compacta; bolinhas menores, área tocável segura (~46pt) */
  paletteScroll: { flexGrow: 0 },
  paletteContent: {
    paddingHorizontal: 12,
    paddingBottom: 2,
    alignItems: 'center',
    gap: 3,
  },
  dotWrapper: { padding: 8 },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotWhiteBorder: {
    borderColor: '#CCC',
  },
  colorDotSelected: {
    borderColor: '#FFD700',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
    elevation: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  /* ── Dialogs (resume + pinte primeiro) ── */
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  dialogBox: {
    backgroundColor: '#FFFAF4',
    borderRadius: 28,
    padding: 28,
    width: '82%',
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  dialogEmoji: { fontSize: 52, marginBottom: 10 },
  dialogTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  dialogSub: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  dialogBtnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  dialogBtnPrimaryText: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: '#FFF',
  },
  dialogBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  dialogBtnSecondaryText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'underline',
  },

  /* ── Pan hint toast (primeira vez, Modo Colorir Grande) ── */
  panHint: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(50,50,50,0.88)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  panHintText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  startHintTitle: {
    fontFamily: 'Nunito',
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  startHintSub: {
    fontFamily: 'Nunito',
    fontSize: 12.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  startHintBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  startHintBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 13,
    color: '#333333',
  },

  /* ── Line tip toast ── */
  lineTip: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(50,50,50,0.88)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lineTipText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: '#FFF',
    textAlign: 'center',
  },

  /* ── Missing image placeholder ── */
  missingContainer: { flex: 1 },
  missingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  missingEmoji: { fontSize: 80, marginBottom: 20 },
  missingTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 22,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  missingSub: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  missingBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  missingBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: '#FFF',
  },
});
