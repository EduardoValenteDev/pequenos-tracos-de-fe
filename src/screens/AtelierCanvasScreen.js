/**
 * AtelierCanvasScreen — Tela de desenho livre.
 *
 * 3 abas inferiores:  Desenhar | Apagar | Enfeitar
 *
 * Desenhar: cores + 3 tamanhos de pincel
 * Apagar:   3 tamanhos de borracha + Desfazer + Limpar
 * Enfeitar: 6 carimbos → selecionar → tocar na folha → arrastar/resize/excluir
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, Modal, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import AtelierCanvas from '../components/AtelierCanvas';
import SoundButton from '../components/SoundButton';
import { COLOR_PALETTE } from '../constants/colorPalette';
import {
  saveArt, getArt, getArtCount,
  ATELIER_FREE_SAVE_LIMIT,
} from '../services/atelierStorage';
import { hasAtelierUnlimitedAccess } from '../services/accessControl';

const BRUSH_SIZES = [
  { id: 'P', label: 'Fino',   size: 4  },
  { id: 'M', label: 'Médio',  size: 10 },
  { id: 'G', label: 'Grosso', size: 22 },
];

const ERASER_SIZES = [
  { id: 'P', label: 'Pequena', size: 16 },
  { id: 'M', label: 'Média',   size: 32 },
  { id: 'G', label: 'Grande',  size: 56 },
];

const CORE_STAMPS = [
  { emoji: '⭐', label: 'Estrela'   },
  { emoji: '❤️', label: 'Coração'   },
  { emoji: '🌈', label: 'Arco-íris' },
  { emoji: '🕊️', label: 'Pomba'     },
  { emoji: '🐑', label: 'Beni'      },
  { emoji: '🌸', label: 'Flor'      },
];

function haptic(style) {
  Haptics.impactAsync(style).catch(() => {});
}

export default function AtelierCanvasScreen({ route, navigation }) {
  const { mission, artId: routeArtId, openTab } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const canvasRef = useRef(null);

  /* Canvas key — incrementar força remontagem limpa */
  const [canvasKey, setCanvasKey] = useState(0);

  /* Arte atual */
  const [savedArtId, setSavedArtId] = useState(routeArtId ?? null);

  /* Modo inferior */
  const [bottomTab, setBottomTab] = useState(
    openTab === 'carimbos' ? 'enfeitar' : 'desenhar',
  );

  /* Ferramentas */
  const [selectedColor, setSelectedColor]  = useState(COLOR_PALETTE[0].hex);
  const [brushSize, setBrushSizeState]     = useState(BRUSH_SIZES[1]);
  const [eraserSize, setEraserSizeState]   = useState(ERASER_SIZES[1]);

  /* Carimbos */
  const [pendingStamp, setPendingStampState]   = useState(null); // {emoji,label}
  const [selectedStampInfo, setSelectedStampInfo] = useState(null); // {id,emoji,label,size}

  /* Arte */
  const [hasPainted, setHasPainted] = useState(false);

  /* Modais */
  const [saveModalVisible,  setSaveModalVisible]  = useState(false);
  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /* ── Callbacks do canvas ── */

  function handleCanvasReady() {
    if (!savedArtId) return;
    getArt(savedArtId)
      .then(art => {
        if (!art?.stateJson) return;
        canvasRef.current?.loadState(art.stateJson);
        setHasPainted(true);
      })
      .catch(() => {});
  }

  function handleLoadCorrupted() {
    Alert.alert(
      '🎨 Arte antiga',
      'Não conseguimos abrir essa arte. Abrindo folha em branco!',
      [{ text: 'Ok!' }],
    );
    setSavedArtId(null);
  }

  function handleStampSelected(info) {
    setSelectedStampInfo(info);
    setPendingStampState(null);
  }

  function handleStampDeselected() {
    setSelectedStampInfo(null);
  }

  /* ── Troca de modo ── */

  function switchTab(tab) {
    setBottomTab(tab);
    setPendingStampState(null);
    canvasRef.current?.clearPending();
    if (tab === 'desenhar') {
      canvasRef.current?.setTool('draw');
      canvasRef.current?.setColor(selectedColor);
      canvasRef.current?.setBrushSize(brushSize.size);
    } else if (tab === 'apagar') {
      canvasRef.current?.setTool('eraser');
      canvasRef.current?.setEraserSize(eraserSize.size);
    }
  }

  /* ── Ferramentas Desenhar ── */

  function applyColor(hex) {
    setSelectedColor(hex);
    canvasRef.current?.setTool('draw');
    canvasRef.current?.setColor(hex);
    canvasRef.current?.setBrushSize(brushSize.size);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  function applyBrushSize(bs) {
    setBrushSizeState(bs);
    canvasRef.current?.setTool('draw');
    canvasRef.current?.setBrushSize(bs.size);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  /* ── Ferramentas Apagar ── */

  function applyEraserSize(es) {
    setEraserSizeState(es);
    canvasRef.current?.setTool('eraser');
    canvasRef.current?.setEraserSize(es.size);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleUndo() {
    canvasRef.current?.undo();
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleClearAll() {
    Alert.alert('🗑️ Apagar tudo?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar desenho', style: 'destructive',
        onPress: () => {
          canvasRef.current?.clearAll();
          setHasPainted(false);
          setSelectedStampInfo(null);
          setPendingStampState(null);
          haptic(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  }

  /* ── Carimbos ── */

  function handleStampPress(stamp) {
    if (pendingStamp?.emoji === stamp.emoji) {
      setPendingStampState(null);
      canvasRef.current?.clearPending();
      return;
    }
    setSelectedStampInfo(null);
    setPendingStampState(stamp);
    canvasRef.current?.setPendingStamp(stamp.emoji, stamp.label);
    haptic(Haptics.ImpactFeedbackStyle.Medium);
  }

  function handleResizeStamp(dir) {
    canvasRef.current?.resizeSelectedStamp(dir * 18);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleDeleteStamp() {
    Alert.alert('🗑️ Remover carimbo?', '', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: () => {
          canvasRef.current?.deleteSelectedStamp();
          setSelectedStampInfo(null);
          haptic(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  }

  /* ── Salvar ── */

  async function handleSavePress() {
    if (!hasPainted) {
      Alert.alert('🎨 Desenhe um pouquinho!', 'Crie algo antes de salvar!', [{ text: 'Ok!' }]);
      return;
    }
    if (!hasAtelierUnlimitedAccess() && !savedArtId) {
      const count = await getArtCount();
      if (count >= ATELIER_FREE_SAVE_LIMIT) {
        setLimitModalVisible(true);
        return;
      }
    }
    setArtTitle(mission ? mission.slice(0, 35) : '');
    setSaveModalVisible(true);
  }

  function handleSaveConfirm() {
    setSaveModalVisible(false);
    setIsSaving(true);
    canvasRef.current?.exportState(async ({ stateJson, thumbnailBase64, previewBase64 }) => {
      try {
        const id = await saveArt({
          artId: savedArtId,
          title: artTitle.trim() || 'Minha arte especial',
          mission: mission ?? null,
          stateJson,
          thumbnailBase64,
          previewBase64,
        });
        setSavedArtId(id);
        setIsSaving(false);
        Alert.alert('✨ Arte salva!', 'Sua obra ficou linda! O que quer fazer?', [
          { text: '✏️ Continuar', style: 'cancel' },
          { text: '✨ Nova arte', onPress: handleNewArt },
          { text: '🖼️ Ver galeria', onPress: () => navigation.navigate('AtelierGallery') },
        ]);
      } catch {
        setIsSaving(false);
        Alert.alert('Oops!', 'Não foi possível salvar. Tente novamente.');
      }
    });
  }

  /* Abre folha limpa sem sair da tela */
  function handleNewArt() {
    setSavedArtId(null);
    setHasPainted(false);
    setSelectedStampInfo(null);
    setPendingStampState(null);
    setBottomTab('desenhar');
    setCanvasKey(k => k + 1);
  }

  /* ── Render ── */
  return (
    <View style={styles.wrapper}>

      {/* CABEÇALHO */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <SoundButton onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </SoundButton>
        <View style={styles.headerCenter}>
          {mission ? (
            <>
              <Text style={styles.headerTitle}>Desafio do Beni</Text>
              <Text style={styles.missionText} numberOfLines={1}>{mission}</Text>
            </>
          ) : (
            <Text style={styles.headerTitle}>Minha arte</Text>
          )}
        </View>
        <SoundButton onPress={handleSavePress} style={styles.saveBtn} disabled={isSaving}>
          <Text style={styles.saveBtnText}>{isSaving ? '⏳' : '💾 Salvar'}</Text>
        </SoundButton>
      </View>

      {/* FOLHA DE DESENHO */}
      <View style={styles.canvasFrame}>
        <AtelierCanvas
          key={canvasKey}
          ref={canvasRef}
          onReady={handleCanvasReady}
          onPainted={() => setHasPainted(true)}
          onPlaced={() => setPendingStampState(null)}
          onStampSelected={handleStampSelected}
          onStampDeselected={handleStampDeselected}
          onLoadCorrupted={handleLoadCorrupted}
        />
      </View>

      {/* BARRA INFERIOR */}
      <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 6) }]}>

        {/* Painel de ferramentas */}
        <View style={styles.toolPanel}>

          {/* ─ DESENHAR ─ */}
          {bottomTab === 'desenhar' && (
            <View style={styles.desenharPanel}>
              {/* Tamanhos + indicador de cor */}
              <View style={styles.sizeRow}>
                {BRUSH_SIZES.map(bs => (
                  <SoundButton
                    key={bs.id}
                    style={[styles.sizeBtn, brushSize.id === bs.id && styles.sizeBtnActive]}
                    onPress={() => applyBrushSize(bs)}
                  >
                    <View style={[
                      styles.brushDot,
                      {
                        width: bs.size + 8, height: bs.size + 8,
                        borderRadius: (bs.size + 8) / 2,
                        backgroundColor: brushSize.id === bs.id ? selectedColor : '#C0B0A0',
                      },
                    ]} />
                    <Text style={styles.sizeBtnLabel}>{bs.label}</Text>
                  </SoundButton>
                ))}
                <View style={[styles.curColorCircle, { backgroundColor: selectedColor }]} />
              </View>
              {/* Paleta de cores */}
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorRow}
              >
                {COLOR_PALETTE.map(({ hex }) => (
                  <SoundButton key={hex} onPress={() => applyColor(hex)} style={styles.colorWrap}>
                    <View style={[
                      styles.colorDot,
                      { backgroundColor: hex },
                      hex === '#FFFFFF' && styles.colorDotWhite,
                      selectedColor === hex && styles.colorDotSelected,
                    ]} />
                  </SoundButton>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ─ APAGAR ─ */}
          {bottomTab === 'apagar' && (
            <View style={styles.apagarPanel}>
              <View style={styles.sizeRow}>
                {ERASER_SIZES.map((es, idx) => (
                  <SoundButton
                    key={es.id}
                    style={[styles.sizeBtn, eraserSize.id === es.id && styles.sizeBtnActive]}
                    onPress={() => applyEraserSize(es)}
                  >
                    <Text style={[styles.eraserCircle, { fontSize: 12 + idx * 5 }]}>⬤</Text>
                    <Text style={styles.sizeBtnLabel}>{es.label}</Text>
                  </SoundButton>
                ))}
                <View style={styles.apagarDivider} />
                <SoundButton style={styles.actionBtn} onPress={handleUndo}>
                  <Text style={styles.actionBtnIcon}>↩️</Text>
                  <Text style={styles.actionBtnLabel}>Desfazer</Text>
                </SoundButton>
                <SoundButton style={styles.actionBtn} onPress={handleClearAll}>
                  <Text style={styles.actionBtnIcon}>🗑️</Text>
                  <Text style={styles.actionBtnLabel}>Limpar</Text>
                </SoundButton>
              </View>
            </View>
          )}

          {/* ─ ENFEITAR ─ */}
          {bottomTab === 'enfeitar' && (
            <View style={styles.enfeitarPanel}>
              {selectedStampInfo ? (
                /* Carimbo selecionado: controles */
                <View style={styles.stampCtrlRow}>
                  <Text style={styles.stampCtrlEmoji}>{selectedStampInfo.emoji}</Text>
                  <Text style={styles.stampCtrlHint}>Arraste para mover</Text>
                  <SoundButton style={styles.stampCtrlBtn} onPress={() => handleResizeStamp(-1)}>
                    <Text style={styles.stampCtrlBtnTxt}>－</Text>
                  </SoundButton>
                  <SoundButton style={styles.stampCtrlBtn} onPress={() => handleResizeStamp(1)}>
                    <Text style={styles.stampCtrlBtnTxt}>＋</Text>
                  </SoundButton>
                  <SoundButton
                    style={[styles.stampCtrlBtn, styles.stampDeleteBtn]}
                    onPress={handleDeleteStamp}
                  >
                    <Text style={styles.stampCtrlBtnTxt}>🗑️</Text>
                  </SoundButton>
                </View>
              ) : pendingStamp ? (
                /* Aguardando toque na folha */
                <View style={styles.pendingRow}>
                  <Text style={styles.pendingEmoji}>{pendingStamp.emoji}</Text>
                  <Text style={styles.pendingTxt}>Toque na folha para colocar!</Text>
                  <SoundButton
                    style={styles.cancelBtn}
                    onPress={() => { setPendingStampState(null); canvasRef.current?.clearPending(); }}
                  >
                    <Text style={styles.cancelBtnTxt}>✕</Text>
                  </SoundButton>
                </View>
              ) : (
                /* Grade de carimbos */
                <ScrollView
                  horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.stampGrid}
                >
                  {CORE_STAMPS.map(s => (
                    <SoundButton key={s.emoji} style={styles.stampCard} onPress={() => handleStampPress(s)}>
                      <Text style={styles.stampCardEmoji}>{s.emoji}</Text>
                      <Text style={styles.stampCardLabel}>{s.label}</Text>
                    </SoundButton>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* 3 abas principais */}
        <View style={styles.tabRow}>
          {[
            { id: 'desenhar', label: 'Desenhar', icon: '🖌️' },
            { id: 'apagar',   label: 'Apagar',   icon: '⬜' },
            { id: 'enfeitar', label: 'Enfeitar', icon: '⭐' },
          ].map(tab => (
            <SoundButton
              key={tab.id}
              style={[styles.tabBtn, bottomTab === tab.id && styles.tabBtnActive]}
              onPress={() => switchTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, bottomTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </SoundButton>
          ))}
        </View>
      </View>

      {/* MODAL SALVAR */}
      <Modal visible={saveModalVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>💾</Text>
            <Text style={styles.modalTitle}>Dê um nome à sua obra!</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Minha arte especial"
              placeholderTextColor={colors.textLight}
              value={artTitle}
              onChangeText={setArtTitle}
              maxLength={40}
              autoFocus
            />
            <SoundButton style={styles.modalBtnPrimary} onPress={handleSaveConfirm}>
              <Text style={styles.modalBtnPrimaryText}>✨ Salvar minha arte</Text>
            </SoundButton>
            <SoundButton
              style={styles.modalBtnSecondary}
              onPress={() => setSaveModalVisible(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
            </SoundButton>
          </View>
        </View>
      </Modal>

      {/* MODAL LIMITE */}
      <Modal visible={limitModalVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>💎</Text>
            <Text style={styles.modalTitle}>Ateliê cheio!</Text>
            <Text style={styles.modalDesc}>
              Você já salvou {ATELIER_FREE_SAVE_LIMIT} desenhos no Ateliê.{'\n'}
              Para guardar mais criações, peça a um responsável.
            </Text>
            <SoundButton
              style={styles.modalBtnPrimary}
              onPress={() => { setLimitModalVisible(false); navigation.navigate('ParentArea'); }}
            >
              <Text style={styles.modalBtnPrimaryText}>💎 Ver Área dos Pais</Text>
            </SoundButton>
            <SoundButton
              style={styles.modalBtnSecondary}
              onPress={() => { setLimitModalVisible(false); navigation.navigate('AtelierGallery'); }}
            >
              <Text style={styles.modalBtnSecondaryText}>🖼️ Gerenciar minhas artes</Text>
            </SoundButton>
            <SoundButton
              style={styles.modalBtnSecondary}
              onPress={() => setLimitModalVisible(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>Fechar</Text>
            </SoundButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ─── Estilos ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5ECD8' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF8EF',
    paddingHorizontal: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#EED8C4',
    gap: 8,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#EED8C4',
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { fontFamily: 'FredokaOne', fontSize: 26, color: colors.text, lineHeight: 30 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 16, color: colors.text },
  missionText: {
    fontFamily: 'Nunito', fontSize: 12, color: colors.textLight,
    fontStyle: 'italic', textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#7CCB83',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 18,
    elevation: 3, shadowColor: '#7CCB83',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
  },
  saveBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },

  /* Canvas */
  canvasFrame: {
    flex: 1, margin: 10,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 2.5, borderColor: '#D4A855',
    elevation: 6, shadowColor: '#A0782A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8,
  },

  /* Toolbar */
  toolbar: {
    backgroundColor: '#FFF8EF',
    borderTopWidth: 1, borderTopColor: '#EED8C4',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  toolPanel: { minHeight: 90 },

  /* Desenhar */
  desenharPanel: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 2 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  sizeBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 7, borderRadius: 14,
    backgroundColor: '#F0E6D3',
    borderWidth: 2, borderColor: 'transparent',
    gap: 3, minHeight: 52,
  },
  sizeBtnActive: { backgroundColor: '#FFE8B0', borderColor: '#F4B23C' },
  brushDot: {},
  sizeBtnLabel: { fontFamily: 'Nunito', fontSize: 9, color: colors.textLight },
  curColorCircle: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2.5, borderColor: '#D4A855',
    elevation: 2,
  },
  colorRow: { gap: 5, alignItems: 'center', paddingBottom: 4 },
  colorWrap: { padding: 2 },
  colorDot: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: 'transparent', elevation: 1,
  },
  colorDotWhite: { borderColor: '#BBA890' },
  colorDotSelected: {
    borderColor: '#FFD700', borderWidth: 3.5,
    transform: [{ scale: 1.2 }], elevation: 5,
  },

  /* Apagar */
  apagarPanel: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 6 },
  apagarDivider: { width: 1, height: 44, backgroundColor: '#EED8C4', marginHorizontal: 4 },
  eraserCircle: { color: '#8A7464' },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 14,
    backgroundColor: '#F0E6D3', gap: 3, minHeight: 52,
  },
  actionBtnIcon:  { fontSize: 22 },
  actionBtnLabel: { fontFamily: 'Nunito', fontSize: 9, color: colors.text },

  /* Enfeitar */
  enfeitarPanel: { minHeight: 90, justifyContent: 'center' },
  stampGrid: { paddingHorizontal: 10, paddingVertical: 8, gap: 8, alignItems: 'center' },
  stampCard: {
    width: 70, height: 76, borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 2, borderColor: '#EED8C4',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3,
  },
  stampCardEmoji: { fontSize: 32 },
  stampCardLabel: { fontFamily: 'Nunito', fontSize: 9, color: colors.textLight },

  /* Carimbo selecionado */
  stampCtrlRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 14, gap: 8,
  },
  stampCtrlEmoji: { fontSize: 30 },
  stampCtrlHint: {
    flex: 1, fontFamily: 'Nunito', fontSize: 12, color: colors.textLight, fontStyle: 'italic',
  },
  stampCtrlBtn: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: '#F0E6D3', borderWidth: 2, borderColor: '#EED8C4',
    alignItems: 'center', justifyContent: 'center',
  },
  stampDeleteBtn: { backgroundColor: '#FFF0F0', borderColor: '#FFD0D0' },
  stampCtrlBtnTxt: { fontSize: 22 },

  /* Carimbo pendente */
  pendingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    backgroundColor: '#FFFADC',
  },
  pendingEmoji: { fontSize: 30 },
  pendingTxt: { flex: 1, fontFamily: 'FredokaOne', fontSize: 14, color: '#7A5800' },
  cancelBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EED8C4', alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnTxt: { fontFamily: 'FredokaOne', fontSize: 16, color: colors.textLight },

  /* Abas */
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2, gap: 8,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 16,
    backgroundColor: '#F0E6D3',
    borderWidth: 2, borderColor: 'transparent', gap: 5,
  },
  tabBtnActive: {
    backgroundColor: '#FFE8B0', borderColor: '#F4B23C',
    elevation: 3, shadowColor: '#F4B23C',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  tabIcon:       { fontSize: 20 },
  tabLabel:      { fontFamily: 'Nunito', fontSize: 13, color: colors.textLight, fontWeight: '700' },
  tabLabelActive:{ color: colors.primaryDark },

  /* Modais */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: colors.surface, borderRadius: 28, padding: 28,
    alignItems: 'center', width: '100%',
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20,
  },
  modalEmoji: { fontSize: 52, marginBottom: 10 },
  modalTitle: {
    fontFamily: 'FredokaOne', fontSize: 20, color: colors.text,
    marginBottom: 14, textAlign: 'center',
  },
  modalDesc: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.textLight,
    textAlign: 'center', lineHeight: 22, marginBottom: 20,
  },
  modalInput: {
    width: '100%', borderWidth: 2, borderColor: colors.border,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: 'Nunito', fontSize: 16, color: colors.text,
    backgroundColor: colors.background, marginBottom: 16,
  },
  modalBtnPrimary: {
    backgroundColor: colors.primary, borderRadius: 20,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10,
    elevation: 4, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6,
  },
  modalBtnPrimaryText:   { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  modalBtnSecondary:     { paddingVertical: 10, alignItems: 'center' },
  modalBtnSecondaryText: {
    fontFamily: 'Nunito', fontSize: 14, color: colors.textLight, textDecorationLine: 'underline',
  },
});
