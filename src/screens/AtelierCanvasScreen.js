/**
 * AtelierCanvasScreen — Mesa de arte do Beni (Criar livre / Desenho guiado).
 *
 * Modos desta tela (Parte 1):
 *   - free   → Criar livre (sem missão): liberdade criativa.
 *   - guided → Desenho guiado pelo Beni (com `mission`): missão do Beni.
 *   (Colorir uma cena da história é a ColoringScreen, rota separada.)
 *
 * Painel inferior por ABAS (Parte 3):  Cores | Pincel | Ferramentas
 *   Cores:       famílias de cores (principais primeiro), seleção clara.
 *   Pincel:      Pequeno / Médio / Grande com preview do traço.
 *   Ferramentas: Desenhar · Borracha · Carimbos · Desfazer · Limpar tudo.
 *
 * NÃO troca o motor de desenho — apenas a casca visual e a organização.
 *
 * ── Retenção (Plano Mestre — preparado, NÃO implementado aqui) ───────────────
 *   Ganchos futuros, sem código novo nesta sprint:
 *     • Modo Cultinho em Casa  — sessão guiada família + arte.
 *     • História do Domingo     — destaque semanal recorrente.
 *     • Relatório semanal       — resumo de progresso (Área dos Pais).
 *     • Card compartilhável seguro — somente via Área dos Pais, nunca social.
 *   Salvar arte já alimenta conquistas (Parte 7) via savedDrawingCount.
 *   Segurança: nenhum desenho sai da Área dos Pais; nenhum log com nome/conteúdo.
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, Modal, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { colors as pt, radii } from '../theme/productTheme';
import AtelierCanvas from '../components/AtelierCanvas';
import SoundButton from '../components/SoundButton';
import { BeniAvatar } from '../components/beni';
import AchievementUnlockModal from '../components/achievements/AchievementUnlockModal';
import { useProgressContext } from '../context/ProgressContext';
import { useAchievementCelebration } from '../hooks/useAchievementCelebration';
import { COLOR_PALETTE, COLOR_FAMILIES } from '../constants/colorPalette';
import {
  saveArt, getArt, getArtCount,
  ATELIER_FREE_SAVE_LIMIT,
} from '../services/atelierStorage';
import { hasAtelierUnlimitedAccess } from '../services/accessControl';
import { STAMPS_ENABLED } from '../config/featureFlags';

const BRUSH_SIZES = [
  { id: 'P', label: 'Pequeno', size: 4  },
  { id: 'M', label: 'Médio',   size: 10 },
  { id: 'G', label: 'Grande',  size: 22 },
];

const ERASER_SIZES = [
  { id: 'P', label: 'Pequena', size: 16 },
  { id: 'M', label: 'Média',   size: 32 },
  { id: 'G', label: 'Grande',  size: 56 },
];

// Hotfix H1 + H1.1 — altura RESERVADA fixa da área de conteúdo do painel.
// Mantém o canvas ESTÁVEL (trocar de aba/Borracha não comprime o desenho) e foi
// COMPACTADA (H1.1): o maior estado (Ferramentas + Borracha: chips + ações +
// linha de tamanhos Pequena/Média/Grande) cabe SEM rolagem em ~148px, devolvendo
// área de canvas. A dica da borracha foi removida e os controles ficaram menores.
// O ScrollView interno é só rede de segurança (fonte do sistema muito ampliada).
const PANEL_CONTENT_H = 148;

// Carimbos da Fé — recurso SECUNDÁRIO até termos assets próprios (Parte 5).
// TODO(assets): substituir estes emojis por ilustrações próprias do Beni.
// Máx. 5, apenas os mais coerentes; sem cruz/itens que pareçam emoji solto.
const CORE_STAMPS = [
  { emoji: '⭐', label: 'Estrela'     },
  { emoji: '❤️', label: 'Coração'     },
  { emoji: '🌈', label: 'Arco-íris'   },
  { emoji: '🕊️', label: 'Pombinha'    },
  { emoji: '🐑', label: 'Cordeirinho' },
];

function haptic(style) {
  Haptics.impactAsync(style).catch(() => {});
}

export default function AtelierCanvasScreen({ route, navigation }) {
  const { mission, artId: routeArtId, openTab, from } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const canvasRef = useRef(null);

  // Modo da mesa: criar com Beni (contexto) > guiado (com missão) > criação livre.
  const isCreateWithBeni = from === 'createWithBeni';
  const mode = isCreateWithBeni ? 'createWithBeni' : (mission ? 'guided' : 'free');
  // Quando veio de "Criar com Beni" pela Home, o voltar leva ao Início.
  const goBackFromHeader = () => {
    if (isCreateWithBeni) navigation.navigate('Home');
    else navigation.goBack();
  };

  /* Conquistas — salvar arte pode desbloquear (Parte 7) */
  const { progressByStory, postStoryStatusByStory } = useProgressContext();
  const { pendingAchievement, checkForNewAchievements, dismissAchievement } =
    useAchievementCelebration({ progressByStory, postStoryStatusByStory, source: 'AtelierCanvasScreen' });

  /* Canvas key — incrementar força remontagem limpa */
  const [canvasKey, setCanvasKey] = useState(0);

  /* Arte atual */
  const [savedArtId, setSavedArtId] = useState(routeArtId ?? null);

  /* Painel inferior: aba ativa (cores | pincel | ferramentas) */
  // Carimbos escondidos por flag (UX 1.0 — Bloco 3): openTab='carimbos' é ignorado.
  const [panelTab, setPanelTab] = useState(STAMPS_ENABLED && openTab === 'carimbos' ? 'ferramentas' : 'cores');

  /* Ferramenta de desenho ativa (desenhar | borracha | carimbos) */
  const [activeTool, setActiveTool] = useState(STAMPS_ENABLED && openTab === 'carimbos' ? 'carimbos' : 'desenhar');

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
  const [rewardVisible, setRewardVisible] = useState(false);
  const [rewardCount, setRewardCount] = useState(0);
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

  /* ── Seleção de ferramenta (aba Ferramentas) ── */

  function selectTool(tool) {
    setActiveTool(tool);
    setPendingStampState(null);
    canvasRef.current?.clearPending();
    if (tool === 'desenhar') {
      canvasRef.current?.setTool('draw');
      canvasRef.current?.setColor(selectedColor);
      canvasRef.current?.setBrushSize(brushSize.size);
    } else if (tool === 'borracha') {
      canvasRef.current?.setTool('eraser');
      canvasRef.current?.setEraserSize(eraserSize.size);
    } else if (tool === 'carimbos') {
      // Base volta para desenho; a colocação do carimbo é por toque na folha.
      canvasRef.current?.setTool('draw');
      canvasRef.current?.setColor(selectedColor);
      canvasRef.current?.setBrushSize(brushSize.size);
    }
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  /* ── Ferramentas Desenhar ── */

  function applyColor(hex) {
    setSelectedColor(hex);
    setActiveTool('desenhar');
    canvasRef.current?.setTool('draw');
    canvasRef.current?.setColor(hex);
    canvasRef.current?.setBrushSize(brushSize.size);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  function applyBrushSize(bs) {
    setBrushSizeState(bs);
    setActiveTool('desenhar');
    canvasRef.current?.setTool('draw');
    canvasRef.current?.setColor(selectedColor);
    canvasRef.current?.setBrushSize(bs.size);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  /* ── Ferramentas Borracha ── */

  function applyEraserSize(es) {
    setEraserSizeState(es);
    setActiveTool('borracha');
    canvasRef.current?.setTool('eraser');
    canvasRef.current?.setEraserSize(es.size);
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleUndo() {
    canvasRef.current?.undo();
    haptic(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleClearAll() {
    Alert.alert('🧹 Limpar tudo?', 'Isso apaga o desenho inteiro e não pode ser desfeito.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar tudo', style: 'destructive',
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
        const count = await getArtCount();
        setRewardCount(count);
        setIsSaving(false);
        setRewardVisible(true); // microfeedback de retenção (Parte 6)
      } catch {
        setIsSaving(false);
        Alert.alert('Oops!', 'Não foi possível salvar. Tente novamente.');
      }
    });
  }

  // Fecha a recompensa e, em seguida, verifica conquistas de arte (Parte 7).
  function closeReward(next) {
    setRewardVisible(false);
    if (next) next();
    // pequeno atraso: deixa a recompensa fechar antes da conquista (se houver).
    setTimeout(() => { checkForNewAchievements(); }, 450);
  }

  /* Abre folha limpa sem sair da tela */
  function handleNewArt() {
    setSavedArtId(null);
    setHasPainted(false);
    setSelectedStampInfo(null);
    setPendingStampState(null);
    setActiveTool('desenhar');
    setPanelTab('cores');
    setCanvasKey(k => k + 1);
  }

  const limitReached = !hasAtelierUnlimitedAccess() && rewardCount >= ATELIER_FREE_SAVE_LIMIT;

  /* ── Render ── */
  return (
    <View style={styles.wrapper}>

      {/* CABEÇALHO — integrado, com salvar destacado mas não isolado */}
      <LinearGradient
        colors={mode === 'guided' ? ['#FFF7E6', '#FFE9C7'] : ['#F4ECFF', '#E9DCFF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}
      >
        <SoundButton onPress={goBackFromHeader} style={isCreateWithBeni ? styles.backPill : styles.backBtn} accessibilityLabel={isCreateWithBeni ? 'Voltar ao Início' : 'Voltar'}>
          <Text style={isCreateWithBeni ? styles.backPillText : styles.backBtnText}>
            {isCreateWithBeni ? '‹ Início' : '‹'}
          </Text>
        </SoundButton>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isCreateWithBeni ? 'Criar com Beni' : (mode === 'guided' ? 'Desenho guiado pelo Beni' : 'Criar livre')}
          </Text>
          <Text style={styles.headerSub}>
            {isCreateWithBeni
              ? (mission || 'Sua missão criativa de hoje com Beni 🎨')
              : (mode === 'guided' ? (mission || 'Uma ideia especial para hoje') : 'Desenhe do seu jeito ✨')}
          </Text>
        </View>
        <SoundButton onPress={handleSavePress} style={styles.saveBtn} disabled={isSaving} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{isSaving ? '⏳' : '💾'}</Text>
          <Text style={styles.saveBtnLabel}>{isSaving ? 'Salvando' : 'Salvar'}</Text>
        </SoundButton>
      </LinearGradient>

      {/* FOLHA DE DESENHO — papel central com moldura premium */}
      <View style={styles.canvasOuter}>
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
      </View>

      {/* PAINEL INFERIOR POR ABAS */}
      <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 6) }]}>

        {/* Conteúdo do painel ativo — altura RESERVADA fixa (H1): o conteúdo rola
            por dentro e NUNCA empurra/comprime o canvas. */}
        <View style={styles.panelContent}>
          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

          {/* ─ ABA CORES ─ */}
          {panelTab === 'cores' && (
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorRow}
            >
              {COLOR_FAMILIES.map(fam => (
                <View key={fam.name} style={styles.colorFamily}>
                  <Text style={styles.colorFamilyLabel}>{fam.name}</Text>
                  <View style={styles.colorFamilyDots}>
                    {fam.colors.map(hex => (
                      <SoundButton key={hex} silent onPress={() => applyColor(hex)} style={styles.colorWrap}>
                        <View style={[
                          styles.colorDot,
                          { backgroundColor: hex },
                          hex === '#FFFFFF' && styles.colorDotWhite,
                          selectedColor === hex && activeTool === 'desenhar' && styles.colorDotSelected,
                        ]} />
                      </SoundButton>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* ─ ABA PINCEL ─ */}
          {panelTab === 'pincel' && (
            <View style={styles.pincelPanel}>
              {BRUSH_SIZES.map(bs => (
                <SoundButton
                  key={bs.id}
                  silent
                  style={[styles.brushBtn, brushSize.id === bs.id && activeTool === 'desenhar' && styles.brushBtnActive]}
                  onPress={() => applyBrushSize(bs)}
                >
                  {/* Preview do traço */}
                  <View style={styles.brushPreview}>
                    <View style={{
                      width: 54, height: bs.size,
                      borderRadius: bs.size / 2,
                      backgroundColor: selectedColor === '#FFFFFF' ? '#E2D8C8' : selectedColor,
                    }} />
                  </View>
                  <Text style={styles.brushLabel}>{bs.label}</Text>
                </SoundButton>
              ))}
            </View>
          )}

          {/* ─ ABA FERRAMENTAS ─ */}
          {panelTab === 'ferramentas' && (
            <View style={styles.ferramentasPanel}>
              {/* Seletor de ferramenta */}
              <View style={styles.toolSelectRow}>
                {[
                  { id: 'desenhar', label: 'Desenhar', icon: '🖌️' },
                  { id: 'borracha', label: 'Borracha', icon: '🧽' },
                  // Carimbos escondidos no fluxo principal (UX 1.0 — Bloco 3).
                  ...(STAMPS_ENABLED ? [{ id: 'carimbos', label: 'Carimbos', icon: '⭐' }] : []),
                ].map(t => (
                  <SoundButton
                    key={t.id}
                    silent
                    style={[styles.toolChip, activeTool === t.id && styles.toolChipActive]}
                    onPress={() => selectTool(t.id)}
                  >
                    <Text style={styles.toolChipIcon}>{t.icon}</Text>
                    <Text style={[styles.toolChipLabel, activeTool === t.id && styles.toolChipLabelActive]}>
                      {t.label}
                    </Text>
                  </SoundButton>
                ))}
              </View>

              {/* Ações: Desfazer + Limpar tudo (separado, secundário) */}
              <View style={styles.actionRow}>
                <SoundButton style={styles.actionBtn} onPress={handleUndo}>
                  <Text style={styles.actionBtnIcon}>↩️</Text>
                  <Text style={styles.actionBtnLabel}>Desfazer</Text>
                </SoundButton>
                <SoundButton style={[styles.actionBtn, styles.clearAllBtn]} onPress={handleClearAll}>
                  <Text style={styles.actionBtnIcon}>🧹</Text>
                  <Text style={[styles.actionBtnLabel, styles.clearAllLabel]}>Limpar tudo</Text>
                </SoundButton>
              </View>

              {/* Contexto da ferramenta ativa */}
              {activeTool === 'borracha' && (
                <View style={styles.toolContext}>
                  {/* H1.1: dica removida deste modo — os tamanhos ficam visíveis
                      sem rolagem; os rótulos Pequena/Média/Grande já orientam. */}
                  <View style={styles.sizeRow}>
                    {ERASER_SIZES.map((es, idx) => (
                      <SoundButton
                        key={es.id}
                        silent
                        style={[styles.sizeBtn, eraserSize.id === es.id && styles.sizeBtnActive]}
                        onPress={() => applyEraserSize(es)}
                      >
                        <View style={[
                          styles.eraserChip,
                          { width: 18 + idx * 8, height: 13 + idx * 5 },
                          eraserSize.id === es.id && styles.eraserChipActive,
                        ]} />
                        <Text style={styles.sizeBtnLabel}>{es.label}</Text>
                      </SoundButton>
                    ))}
                  </View>
                </View>
              )}

              {STAMPS_ENABLED && activeTool === 'carimbos' && (
                <View style={styles.toolContext}>
                  {selectedStampInfo ? (
                    <View style={styles.stampCtrlRow}>
                      <Text style={styles.stampCtrlEmoji}>{selectedStampInfo.emoji}</Text>
                      <Text style={styles.stampCtrlHint}>Arraste para mover</Text>
                      <SoundButton style={styles.stampCtrlBtn} onPress={() => handleResizeStamp(-1)}>
                        <Text style={styles.stampCtrlBtnTxt}>－</Text>
                      </SoundButton>
                      <SoundButton style={styles.stampCtrlBtn} onPress={() => handleResizeStamp(1)}>
                        <Text style={styles.stampCtrlBtnTxt}>＋</Text>
                      </SoundButton>
                      <SoundButton style={[styles.stampCtrlBtn, styles.stampDeleteBtn]} onPress={handleDeleteStamp}>
                        <Text style={styles.stampCtrlBtnTxt}>🗑️</Text>
                      </SoundButton>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.toolContextHint}>Escolha um carimbo e toque na folha.</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stampGrid}>
                        {CORE_STAMPS.map(s => (
                          <SoundButton
                            key={s.emoji}
                            silent
                            style={[styles.stampCard, pendingStamp?.emoji === s.emoji && styles.stampCardActive]}
                            onPress={() => handleStampPress(s)}
                          >
                            <Text style={styles.stampCardEmoji}>{s.emoji}</Text>
                            <Text style={styles.stampCardLabel}>{s.label}</Text>
                          </SoundButton>
                        ))}
                      </ScrollView>
                    </>
                  )}
                </View>
              )}

              {activeTool === 'desenhar' && (
                <Text style={styles.toolContextHintMuted}>
                  Escolha a cor e o tamanho do pincel nas abas Cores e Pincel.
                </Text>
              )}
            </View>
          )}
          </ScrollView>
        </View>

        {/* Abas do painel */}
        <View style={styles.panelTabsRow}>
          {[
            { id: 'cores', label: 'Cores', icon: '🎨' },
            { id: 'pincel', label: 'Pincel', icon: '🖊️' },
            { id: 'ferramentas', label: 'Ferramentas', icon: '🧰' },
          ].map(tab => (
            <SoundButton
              key={tab.id}
              style={[styles.panelTab, panelTab === tab.id && styles.panelTabActive]}
              onPress={() => setPanelTab(tab.id)}
            >
              <Text style={styles.panelTabIcon}>{tab.icon}</Text>
              <Text style={[styles.panelTabLabel, panelTab === tab.id && styles.panelTabLabelActive]}>
                {tab.label}
              </Text>
            </SoundButton>
          ))}
        </View>
      </View>

      {/* MODAL: dar nome à arte */}
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
            <SoundButton style={styles.modalBtnSecondary} onPress={() => setSaveModalVisible(false)}>
              <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
            </SoundButton>
          </View>
        </View>
      </Modal>

      {/* MODAL: recompensa ao salvar (microfeedback de retenção) */}
      <Modal visible={rewardVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.rewardBox}>
            <BeniAvatar variant="celebrating" size="large" />
            <Text style={styles.rewardTitle}>Arte guardada!</Text>
            <Text style={styles.rewardSub}>Beni salvou sua criação com carinho.</Text>

            {/* Progresso de artes guardadas */}
            <View style={styles.rewardProgress}>
              <Text style={styles.rewardProgressText}>
                {hasAtelierUnlimitedAccess()
                  ? `🖼️ ${rewardCount} arte${rewardCount === 1 ? '' : 's'} guardada${rewardCount === 1 ? '' : 's'}`
                  : `🖼️ ${rewardCount} de ${ATELIER_FREE_SAVE_LIMIT} artes guardadas`}
              </Text>
              {!hasAtelierUnlimitedAccess() && (
                <View style={styles.rewardBar}>
                  <View style={[styles.rewardBarFill, { width: `${Math.min(rewardCount / ATELIER_FREE_SAVE_LIMIT, 1) * 100}%` }]} />
                </View>
              )}
            </View>

            {/* Promessa do Livrinho */}
            <Text style={styles.rewardLivrinho}>📖 Essa arte pode entrar no seu Livrinho da Fé.</Text>

            <SoundButton
              style={styles.rewardBtnPrimary}
              onPress={() => closeReward(() => navigation.navigate('AtelierGallery'))}
            >
              <Text style={styles.rewardBtnPrimaryText}>🖼️ Ver minhas artes</Text>
            </SoundButton>
            <View style={styles.rewardBtnRow}>
              <SoundButton style={styles.rewardBtnSecondary} onPress={() => closeReward()}>
                <Text style={styles.rewardBtnSecondaryText}>✏️ Continuar desenhando</Text>
              </SoundButton>
              {!limitReached && (
                <SoundButton style={styles.rewardBtnSecondary} onPress={() => closeReward(handleNewArt)}>
                  <Text style={styles.rewardBtnSecondaryText}>🎨 Nova arte</Text>
                </SoundButton>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: limite gratuito */}
      <Modal visible={limitModalVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>💛</Text>
            <Text style={styles.modalTitle}>Ateliê cheinho!</Text>
            <Text style={styles.modalDesc}>
              Você já guardou {ATELIER_FREE_SAVE_LIMIT} artes.{'\n'}
              Para salvar mais, use o Modo Criador nos testes ou aguarde o Plano Família.
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
            <SoundButton style={styles.modalBtnSecondary} onPress={() => setLimitModalVisible(false)}>
              <Text style={styles.modalBtnSecondaryText}>Fechar</Text>
            </SoundButton>
          </View>
        </View>
      </Modal>

      {/* Conquista desbloqueada ao salvar (Parte 7) */}
      {pendingAchievement && (
        <AchievementUnlockModal achievement={pendingAchievement} onDismiss={dismissAchievement} />
      )}
    </View>
  );
}

/* ─── Estilos ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FBF3E4' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: 10,
    gap: 10,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  backBtnText: { fontFamily: 'FredokaOne', fontSize: 26, color: colors.text, lineHeight: 30 },
  // Voltar ao Início (contexto "Criar com Beni") — pílula com rótulo claro.
  backPill: {
    height: 42, borderRadius: 21, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  backPillText: { fontFamily: 'FredokaOne', fontSize: 15, color: colors.text },
  headerCenter: { flex: 1, alignItems: 'flex-start' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: colors.text },
  headerSub: {
    fontFamily: 'Nunito', fontSize: 12, color: '#7A6A58', fontWeight: '700',
    lineHeight: 17, marginTop: 1,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: pt.green,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: radii.pill,
    elevation: 3, shadowColor: pt.greenDeep,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
  },
  saveBtnText: { fontSize: 15 },
  saveBtnLabel: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },

  /* Canvas — papel central com moldura premium */
  canvasOuter: {
    flex: 1,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
  },
  canvasFrame: {
    flex: 1,
    borderRadius: 22, overflow: 'hidden',
    backgroundColor: '#FFFDF8',
    borderWidth: 5, borderColor: '#FFFFFF',
    elevation: 8, shadowColor: '#7A5A22',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22, shadowRadius: 12,
  },

  /* Toolbar */
  toolbar: {
    backgroundColor: '#FFFDF7',
    borderTopWidth: 1, borderTopColor: '#EFE2CE',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6,
    paddingTop: 6,
  },
  // Altura RESERVADA fixa (H1): não cresce com a aba/Borracha → canvas estável.
  panelContent: { height: PANEL_CONTENT_H },
  panelScroll: { flex: 1 },
  panelScrollContent: { flexGrow: 1, justifyContent: 'center' },

  /* Aba Cores */
  colorRow: { gap: 12, alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 8 },
  colorFamily: { },
  colorFamilyLabel: {
    fontFamily: 'Nunito', fontSize: 9, color: colors.textLight, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4, marginLeft: 4,
  },
  colorFamilyDots: { flexDirection: 'row', gap: 4 },
  colorWrap: { padding: 2 },
  colorDot: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: 'transparent', elevation: 1,
  },
  colorDotWhite: { borderColor: '#C8B79C' },
  colorDotSelected: {
    borderColor: '#FFD700', borderWidth: 4,
    transform: [{ scale: 1.16 }], elevation: 5,
  },

  /* Aba Pincel */
  pincelPanel: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'stretch',
  },
  brushBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 18,
    backgroundColor: '#F6EEDD',
    borderWidth: 2, borderColor: 'transparent', gap: 8,
  },
  brushBtnActive: { backgroundColor: '#FFF3D6', borderColor: '#F4B23C' },
  brushPreview: { height: 26, justifyContent: 'center', alignItems: 'center' },
  brushLabel: { fontFamily: 'FredokaOne', fontSize: 13, color: colors.text },

  /* Aba Ferramentas (H1.1: compacto, cabe sem rolagem) */
  ferramentasPanel: { paddingHorizontal: 12, paddingTop: 5, paddingBottom: 2 },
  toolSelectRow: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  toolChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 16,
    backgroundColor: '#F6EEDD',
    borderWidth: 2, borderColor: 'transparent', gap: 5,
  },
  toolChipActive: {
    backgroundColor: '#FFF3D6', borderColor: '#F4B23C',
    elevation: 2, shadowColor: '#F4B23C',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3,
  },
  toolChipIcon: { fontSize: 18 },
  toolChipLabel: { fontFamily: 'Nunito', fontSize: 13, color: colors.textLight, fontWeight: '700' },
  toolChipLabelActive: { color: colors.primaryDark },

  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 14,
    backgroundColor: '#F0E6D3', gap: 6,
  },
  clearAllBtn: { backgroundColor: '#FFEFEA', borderWidth: 1.5, borderColor: '#F3C3B2' },
  actionBtnIcon:  { fontSize: 18 },
  actionBtnLabel: { fontFamily: 'Nunito', fontSize: 12, color: colors.text, fontWeight: '700' },
  clearAllLabel: { color: '#C0512F' },

  toolContext: { marginTop: 6 },
  toolContextHint: {
    fontFamily: 'Nunito', fontSize: 12, color: colors.textLight, fontWeight: '700',
    textAlign: 'center', marginBottom: 8,
  },
  toolContextHintMuted: {
    fontFamily: 'Nunito', fontSize: 12, color: '#B0A48F', fontWeight: '700',
    textAlign: 'center', marginTop: 6,
  },

  /* Tamanhos (borracha) */
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sizeBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 5, borderRadius: 14,
    backgroundColor: '#F6EEDD',
    borderWidth: 2, borderColor: 'transparent',
    gap: 3, minHeight: 42,
  },
  sizeBtnActive: { backgroundColor: '#FFF3D6', borderColor: '#F4B23C' },
  sizeBtnLabel: { fontFamily: 'Nunito', fontSize: 10, color: colors.textLight, fontWeight: '700' },
  eraserChip: {
    backgroundColor: '#FFF', borderRadius: 5,
    borderWidth: 1.5, borderColor: '#C8B59A',
  },
  eraserChipActive: { borderColor: '#F4B23C', backgroundColor: '#FFF7E6' },

  /* Carimbos */
  stampGrid: { paddingVertical: 4, gap: 8, alignItems: 'center' },
  stampCard: {
    width: 66, height: 72, borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 2, borderColor: '#EED8C4',
    alignItems: 'center', justifyContent: 'center', gap: 2,
    elevation: 1,
  },
  stampCardActive: { borderColor: '#F4B23C', backgroundColor: '#FFF7E6' },
  stampCardEmoji: { fontSize: 30 },
  stampCardLabel: { fontFamily: 'Nunito', fontSize: 9, color: colors.textLight, fontWeight: '700' },

  stampCtrlRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  stampCtrlEmoji: { fontSize: 28 },
  stampCtrlHint: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: colors.textLight, fontStyle: 'italic' },
  stampCtrlBtn: {
    width: 48, height: 48, borderRadius: 15,
    backgroundColor: '#F0E6D3', borderWidth: 2, borderColor: '#EED8C4',
    alignItems: 'center', justifyContent: 'center',
  },
  stampDeleteBtn: { backgroundColor: '#FFF0F0', borderColor: '#FFD0D0' },
  stampCtrlBtnTxt: { fontSize: 20 },

  /* Abas do painel */
  panelTabsRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2, gap: 8,
  },
  panelTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 16,
    backgroundColor: '#F3EADA',
    borderWidth: 2, borderColor: 'transparent', gap: 5,
  },
  panelTabActive: {
    backgroundColor: pt.faithBlueSoft, borderColor: pt.faithBlue,
  },
  panelTabIcon: { fontSize: 17 },
  panelTabLabel: { fontFamily: 'Nunito', fontSize: 12, color: colors.textLight, fontWeight: '800' },
  panelTabLabelActive: { color: pt.faithBlueDeep },

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

  /* Recompensa ao salvar */
  rewardBox: {
    backgroundColor: '#FFFDF8', borderRadius: 28, padding: 24,
    alignItems: 'center', width: '100%',
    borderWidth: 1.5, borderColor: '#F0E2C6',
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20,
  },
  rewardTitle: {
    fontFamily: 'FredokaOne', fontSize: 22, color: pt.text, marginTop: 6, marginBottom: 4,
  },
  rewardSub: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft, fontWeight: '700',
    textAlign: 'center', marginBottom: 14,
  },
  rewardProgress: { width: '100%', alignItems: 'center', marginBottom: 12 },
  rewardProgressText: {
    fontFamily: 'FredokaOne', fontSize: 13, color: '#7A5800', marginBottom: 6,
  },
  rewardBar: {
    width: '70%', height: 7, backgroundColor: '#F0E2C6', borderRadius: 4, overflow: 'hidden',
  },
  rewardBarFill: { height: '100%', backgroundColor: pt.gold, borderRadius: 4 },
  rewardLivrinho: {
    fontFamily: 'Nunito', fontSize: 12.5, color: pt.purpleDeep, fontWeight: '700',
    textAlign: 'center', marginBottom: 18,
  },
  rewardBtnPrimary: {
    backgroundColor: pt.beni, borderRadius: radii.pill,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10,
    elevation: 3, shadowColor: pt.beniDeep,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 5,
  },
  rewardBtnPrimaryText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
  rewardBtnRow: { flexDirection: 'row', gap: 8, width: '100%' },
  rewardBtnSecondary: {
    flex: 1, backgroundColor: '#F3EADA', borderRadius: radii.pill,
    paddingVertical: 11, alignItems: 'center',
  },
  rewardBtnSecondaryText: { fontFamily: 'FredokaOne', fontSize: 12, color: '#7A5A2E' },
});
