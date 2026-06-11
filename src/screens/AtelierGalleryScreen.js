import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, Image, Modal, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import SafeImage from '../components/ui/SafeImage';
import { BeniEmptyState } from '../components/beni';
import {
  listArts, getArt, deleteArt, ATELIER_FREE_SAVE_LIMIT,
  resolveArtThumbUri, resolveArtPreviewUri,
} from '../services/atelierStorage';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function AtelierGalleryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingArt, setViewingArt] = useState(null);
  const [viewingArtFull, setViewingArtFull] = useState(null);

  useFocusEffect(
    useCallback(() => {
      listArts().then(list => {
        setArts(list);
        setLoading(false);
      });
    }, []),
  );

  function handleViewArt(art) {
    setViewingArt(art);
    setViewingArtFull(null);
    getArt(art.id).then(full => setViewingArtFull(full)).catch(() => {});
  }

  function closeViewer() {
    setViewingArt(null);
    setViewingArtFull(null);
  }

  function handleContinue(art) {
    navigation.navigate('AtelierCanvas', { artId: art.id });
  }

  function handleDelete(art) {
    Alert.alert(
      '🗑️ Apagar arte?',
      `Quer apagar "${art.title}" do Ateliê? Isso não pode ser desfeito.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar', style: 'destructive',
          onPress: async () => {
            await deleteArt(art.id);
            setArts(prev => prev.filter(a => a.id !== art.id));
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <SoundButton style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>‹ Voltar</Text>
        </SoundButton>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Minhas artes</Text>
          <Text style={styles.headerSub}>Suas criações ficam guardadas aqui.</Text>
        </View>
        <SoundButton
          style={styles.newArtBtn}
          onPress={() => navigation.navigate('AtelierCanvas', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.newArtBtnText}>+ Nova</Text>
        </SoundButton>
      </View>

      <FlatList
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        data={arts}
        keyExtractor={(art) => String(art.id)}
        ListHeaderComponent={
          /* Contador */
          <View style={styles.counterRow}>
            <Text style={styles.counterText}>
              🖼️ {arts.length} de {ATELIER_FREE_SAVE_LIMIT} artes salvas
            </Text>
            <View style={styles.counterBar}>
              <View style={[styles.counterBarFill, { width: `${Math.min(arts.length / ATELIER_FREE_SAVE_LIMIT, 1) * 100}%` }]} />
            </View>
          </View>
        }
        ListEmptyComponent={
          /* ── Empty state ── */
          <View style={styles.emptyContainer}>
            <BeniEmptyState
              title="Seu Ateliê ainda está vazio"
              message="Crie seu primeiro desenho para guardar aqui."
              actionLabel="Começar a desenhar"
              onPress={() => navigation.navigate('AtelierCanvas', {})}
            />
          </View>
        }
        renderItem={({ item: art }) => (
          <View style={styles.card}>
            {/* Thumbnail */}
            <SoundButton
              style={styles.thumbWrapper}
              onPress={() => handleViewArt(art)}
              activeOpacity={0.85}
            >
              <SafeImage
                source={resolveArtThumbUri(art) ? { uri: resolveArtThumbUri(art) } : null}
                style={styles.thumb}
                resizeMode="cover"
                fallbackIcon="🎨"
                fallbackColors={['#F3EEE6', '#E7DECF']}
              />
              <View style={styles.thumbViewHint}>
                <Text style={styles.thumbViewHintText}>👁</Text>
              </View>
            </SoundButton>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.artTitle} numberOfLines={1}>{art.title}</Text>
              <Text style={styles.artDate}>{formatDate(art.createdAt)}</Text>
              <View style={styles.btnRow}>
                <SoundButton
                  style={styles.continueBtn}
                  onPress={() => handleContinue(art)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>✏️ Editar</Text>
                </SoundButton>
                <SoundButton
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(art)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </SoundButton>
              </View>
            </View>
          </View>
        )}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
      />

      {/* ── VIEWER MODAL ── */}
      <Modal
        visible={!!viewingArt}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeViewer}
      >
        <View style={[
          styles.viewerOverlay,
          { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}>
          {/* Top bar */}
          <View style={styles.viewerTopBar}>
            <SoundButton style={styles.viewerCloseBtn} onPress={closeViewer}>
              <Text style={styles.viewerCloseTxt}>✕</Text>
            </SoundButton>
            <View style={styles.viewerTitleWrap}>
              <Text style={styles.viewerTitle} numberOfLines={1}>
                {viewingArt?.title}
              </Text>
              <Text style={styles.viewerDate}>{formatDate(viewingArt?.createdAt)}</Text>
            </View>
          </View>

          {/* Image area */}
          <View style={styles.viewerImageWrap}>
            {(resolveArtPreviewUri(viewingArtFull) || resolveArtThumbUri(viewingArt)) ? (
              <Image
                source={{ uri: resolveArtPreviewUri(viewingArtFull) || resolveArtThumbUri(viewingArt) }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.viewerImagePlaceholder}>
                <Text style={styles.viewerPlaceholderEmoji}>🎨</Text>
                <Text style={styles.viewerPlaceholderText}>
                  {viewingArtFull === null ? 'Carregando...' : 'Sem miniatura'}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.viewerActions}>
            <SoundButton
              style={styles.viewerEditBtn}
              onPress={() => {
                const art = viewingArt;
                closeViewer();
                handleContinue(art);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.viewerEditBtnText}>✏️ Editar</Text>
            </SoundButton>
            <SoundButton
              style={styles.viewerDeleteBtn}
              onPress={() => {
                const art = viewingArt;
                closeViewer();
                handleDelete(art);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.viewerDeleteBtnText}>🗑️ Apagar</Text>
            </SoundButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Nunito', fontSize: 16, color: colors.textLight },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pt.background,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: pt.border,
    gap: 10,
  },
  backBtn: {
    paddingVertical: 6, paddingHorizontal: 4, flexShrink: 0,
  },
  backBtnText: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.primary, fontWeight: '700',
  },
  headerTitles: { flex: 1 },
  headerTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text,
  },
  headerSub: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft,
  },
  newArtBtn: {
    backgroundColor: pt.gold,
    borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8,
    flexShrink: 0,
    elevation: 2, shadowColor: pt.gold,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.35, shadowRadius: 3,
  },
  newArtBtnText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#FFF' },

  // ── Contador ──
  counterRow: {
    backgroundColor: colors.cardBg, borderRadius: radii.md,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
    ...shadows.soft,
    gap: 8,
  },
  counterText: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700',
  },
  counterBar: {
    height: 4, backgroundColor: pt.border, borderRadius: 2, overflow: 'hidden',
  },
  counterBarFill: {
    height: '100%', backgroundColor: '#34A853', borderRadius: 2,
  },

  // ── Empty state ──
  emptyContainer: {
    paddingVertical: 24,
  },

  // ── Art card ──
  card: {
    flexDirection: 'row', backgroundColor: colors.cardBg,
    borderRadius: 20, marginBottom: 12, overflow: 'hidden',
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.09, shadowRadius: 6,
  },
  thumbWrapper: { width: 110, height: 110 },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  thumbPlaceholderEmoji: { fontSize: 36 },
  thumbViewHint: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  thumbViewHintText: { fontSize: 12 },

  cardInfo: { flex: 1, padding: 14, justifyContent: 'space-between' },
  artTitle: { fontFamily: 'FredokaOne', fontSize: 15, color: colors.text, marginBottom: 2 },
  artDate: {
    fontFamily: 'Nunito', fontSize: 11, color: colors.textLight,
    fontStyle: 'italic', marginBottom: 10,
  },
  btnRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  continueBtn: {
    flex: 1, backgroundColor: colors.primary,
    borderRadius: 14, paddingVertical: 10, alignItems: 'center',
    elevation: 3, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4,
  },
  continueBtnText: { fontFamily: 'FredokaOne', fontSize: 14, color: '#FFF' },
  deleteBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFD0D0',
  },
  deleteBtnText: { fontSize: 18 },

  // ── Viewer modal ──
  viewerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    paddingHorizontal: 16,
  },
  viewerTopBar: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, gap: 12,
  },
  viewerCloseBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  viewerCloseTxt: { fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF' },
  viewerTitleWrap: { flex: 1 },
  viewerTitle: {
    fontFamily: 'FredokaOne', fontSize: 18, color: '#FFF',
  },
  viewerDate: {
    fontFamily: 'Nunito', fontSize: 12, color: 'rgba(255,255,255,0.6)',
  },
  viewerImageWrap: {
    flex: 1, borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  viewerImage: { width: '100%', height: '100%' },
  viewerImagePlaceholder: {
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  viewerPlaceholderEmoji: { fontSize: 64 },
  viewerPlaceholderText: {
    fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.5)',
  },
  viewerActions: {
    flexDirection: 'row', gap: 12, marginTop: 14,
  },
  viewerEditBtn: {
    flex: 1, backgroundColor: colors.primary,
    borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center',
    elevation: 4, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6,
  },
  viewerEditBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
  viewerDeleteBtn: {
    flex: 1, backgroundColor: '#C0392B',
    borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center',
    elevation: 4, shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6,
  },
  viewerDeleteBtnText: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF' },
});
