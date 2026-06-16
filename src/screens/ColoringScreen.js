import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, Pressable, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import ColoringCanvas, { ERASER_COLOR } from '../components/ColoringCanvas';
import { COLOR_PALETTE } from '../constants/colorPalette';
import SoundButton from '../components/SoundButton';
import { getColoringImage } from '../assets/coloringImages';
import {
  getSavedDrawing,
  saveDrawingState,
  clearDrawingState,
  clearAllSavedDrawings,
} from '../services/drawingStorage';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import FaithIcon from '../components/ui/FaithIcon';
import { backLabelFor } from '../utils/originBack';

// Dica de primeira vez do Modo Colorir Grande (UI-pref, não progresso): aparece
// UMA vez por dispositivo e some sozinha — nunca fica fixa na tela.
const PAN_HINT_KEY = '@ptf_coloring_biggie_hint_v1';


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

export default function ColoringScreen({ route, navigation }) {
  const { story, cenaIndex, from } = route.params;
  const cena = story.cenas[cenaIndex];
  const canvasRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

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

  useEffect(() => {
    if (!canOpenStoryFullExperience(story)) {
      navigation.replace('ParentArea');
    }
  }, []);

  // Check for a previously saved drawing when the screen opens
  useEffect(() => {
    getSavedDrawing(story.id, cena.id).then(saved => {
      if (saved) {
        setSavedDrawing(saved);
        setShowResumeDialog(true);
      }
    });
  }, []);

  // First-time hint: "use dois dedos para mover o desenho". Mostra UMA vez por
  // dispositivo (flag persistida) e some sozinha — nunca fixa, nunca ocupa espaço
  // permanente. Só faz sentido com imagem de história (Modo Colorir Grande).
  useEffect(() => {
    if (!imageSource) return;
    let cancelled = false;
    AsyncStorage.getItem(PAN_HINT_KEY).then(seen => {
      if (cancelled || seen) return;
      setShowPanHint(true);
      AsyncStorage.setItem(PAN_HINT_KEY, '1').catch(() => {});
      panHintTimerRef.current = setTimeout(() => setShowPanHint(false), 4000);
    }).catch(() => {});
    return () => {
      cancelled = true;
      if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
    };
  }, []);

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
  const imageSource = getColoringImage(story.id, cena.id);

  // Adaptive canvas height: size canvas to image aspect ratio, capped at available screen
  // space so the Pronto button and tools are always visible regardless of image shape.
  const CANVAS_MARGIN = 2; // px on each side — mínimo seguro (V2: foco no desenho)
  let canvasHeight = undefined;
  if (imageSource) {
    try {
      const asset = Image.resolveAssetSource(imageSource);
      if (asset?.width && asset?.height) {
        // topBar ≈ 50px content + safe area top. bottomPanel V2 ≈ 96px
        // (ícones compactos + paleta menor, sem moldura) + safe area bottom.
        const approxTopH = 50 + Math.max(insets.top || 0, 8);
        const approxBottomH = 96 + (insets.bottom || 0);
        const maxCanvasH = Math.max(200, screenH - approxTopH - approxBottomH - CANVAS_MARGIN * 2);
        const canvasW = screenW - CANVAS_MARGIN * 2;
        const naturalH = Math.round(canvasW / (asset.width / asset.height));
        canvasHeight = Math.min(naturalH, maxCanvasH);
      }
    } catch (_) {}
  }

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

      {/* ── CANVAS — wrapper centers canvas vertically in available space ── */}
      <View style={styles.canvasWrapper}>
        <View style={[
          styles.canvasArea,
          canvasHeight != null ? { height: canvasHeight } : { flex: 1 },
          { margin: CANVAS_MARGIN },
        ]}>
          <ColoringCanvas
            ref={canvasRef}
            selectedColor={selectedColor}
            imageSource={imageSource}
            storyId={story.id}
            sceneNumber={cena.id}
            onReadyChange={setCanvasReady}
            onPainted={() => setHasPainted(true)}
            onFillRejected={handleFillRejected}
            onGoBack={() => navigation.goBack()}
            onLoadCorrupted={() => {
              Alert.alert(
                '🎨 Atenção',
                'Esse desenho salvo teve um problema, mas você pode começar de novo.',
                [{ text: 'Tudo bem!' }],
              );
            }}
            onLoadIncompatible={() => {
              // Saved state from a different screen size — silently start fresh
              if (__DEV__) console.log('[ColoringScreen] [COLORING_STATE] incompatible state — starting fresh');
            }}
          />
        </View>
      </View>

      {/* ── BOTTOM PANEL (compacto — foco no desenho) ──────────────── */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 4 }]}>

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

      {/* ── PAN HINT — dica de primeira vez do Modo Colorir Grande ── */}
      {showPanHint && (
        <View
          style={[styles.panHint, { top: Math.max(insets.top, 8) + 54 }]}
          pointerEvents="none"
        >
          <Text style={styles.panHintText}>✌️ Use dois dedos para mover o desenho</Text>
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

  /* ── Canvas ── */
  canvasWrapper: {
    flex: 1,
    /* V2.2: desenho ANCORADO embaixo (flex-end) → a barra de ferramentas/paleta
       fica colada no fim da arte, sem vão vazio entre o desenho e a barra.
       Como a imagem 4:5 é limitada pela LARGURA da tela (não dá para crescer em
       altura sem cortar), a folga vertical inevitável vai para CIMA — entre o
       header e o desenho — fora da relação desenho + ferramentas. */
    justifyContent: 'flex-end',
  },
  canvasArea: {
    /* margin is set dynamically via CANVAS_MARGIN constant */
    /* V2: moldura removida (sem borda) — o desenho é o protagonista. */
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    backgroundColor: '#FFFDF8',
  },

  /* ── Bottom panel (compacto — máxima área para o desenho) ── */
  bottomPanel: {
    backgroundColor: colors.cardBg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    paddingTop: 6,
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
