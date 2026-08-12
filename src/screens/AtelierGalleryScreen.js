import React, { useCallback, useEffect, useState } from 'react';
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
import { displayTitle } from '../services/atelierArtNaming';
import { useHubComposition, hubRows } from '../components/layout/HubSurface';
import { useWindowBand, BANDS } from '../hooks/useWindowBand';

/**
 * [F6-SG-C · TK-C-008] Largura mínima de uma arte guardada, medida no próprio cartão:
 * a miniatura ocupa 110 fixos e o restante precisa comportar o título numa linha e os
 * botões "Editar" e apagar lado a lado — cerca de 180 com os 14 de respiro de cada
 * lado. Abaixo disso o cartão deixa de ser cartão e vira uma coluna de rótulos.
 */
const HUB_MIN_CARD = 320;
const HUB_GAP = 12;

/** O respiro lateral do conteúdo. Vive aqui porque a conta da largura da lista precisa
 *  dele: descontar o que o padding já come é o que torna a medida REAL, e não uma
 *  estimativa de janela que faria a grade prometer uma coluna que não cabe. */
const CONTENT_PAD = 16;

/**
 * [F6-SG-C · TK-C-009] O painel de apoio mostra UMA obra, e a largura mínima de uma
 * obra esta tela já declarou: é a mesma `HUB_MIN_CARD`. Inventar uma segunda medida
 * seria criar um número sem dono.
 */
const PAINEL_LARGURA = HUB_MIN_CARD;

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
  /* [F6-SG-C · TK-C-009] Estado PRÓPRIO do painel, separado do visor de propósito: o
     painel mostra sempre alguma obra, o visor só mostra o que a criança abriu. */
  const [focoFull, setFocoFull] = useState(null);

  /* [F6-SG-C · TK-C-009] A ÚNICA superfície Hub com hierarquia lista→detalhe real e
     persistente (PLAN §18). Na faixa expandida o detalhe deixa de ser só modal e passa
     a acompanhar a lista — o mesmo detalhe, o mesmo conteúdo, as mesmas duas ações.
     Nada de destino novo para preencher vazio: `D4` proíbe, e a obra em foco é
     informação que a tela já tem. Sem artes guardadas não há hierarquia, e sem
     hierarquia não há painel — uma moldura vazia ao lado seria o defeito de volta. */
  const { band, width } = useWindowBand();
  const comPainel = band === BANDS.EXPANDED && arts.length > 0;

  // [F6-SG-C · TK-C-008] A galeria é HUB: um inventário para varrer e escolher. A
  // `FlatList` continua sendo a lista virtualizada de sempre — o que muda é que ela
  // passa a virtualizar LINHAS quando a largura comporta mais de uma arte, em vez de
  // repetir um cartão largo e solitário numa tela de 1180dp. A largura que entra na
  // conta é a da LISTA, já sem o padding e já sem o painel: prometer colunas com a
  // largura da janela seria compor sobre espaço que a tela não tem.
  const larguraLista = width - CONTENT_PAD * 2 - (comPainel ? PAINEL_LARGURA : 0);
  const { columns } = useHubComposition({
    itemCount: arts.length, minItemWidth: HUB_MIN_CARD, gap: HUB_GAP, availableWidth: larguraLista,
  });
  const emGrade = columns > 1;

  /* A obra em foco é buscada NA LISTA por id, nunca guardada à parte: assim ela se
     cura sozinha quando a arte aberta é apagada, e o painel cai para a mais recente
     em vez de exibir um fantasma. O foco ACOMPANHA `viewingArt` mas não o define — se
     definisse, girar o tablet de volta para a faixa compacta abriria o visor sozinho,
     mostrando uma arte que ninguém pediu. */
  const artaEmFoco = (viewingArt && arts.find((a) => a.id === viewingArt.id)) || arts[0] || null;
  const idEmFoco = artaEmFoco ? artaEmFoco.id : null;

  useFocusEffect(
    useCallback(() => {
      listArts().then(list => {
        setArts(list);
        setLoading(false);
      });
    }, []),
  );

  /* O painel carrega a obra em resolução cheia pelo MESMO caminho do visor (`getArt`):
     a miniatura é um JPEG pequeno, feito para caber num cartão de 110, e esticá-la num
     painel de 320 numa tela densa mostraria a arte da criança borrada. Só busca quando
     o painel existe — nas faixas sem painel isso seria leitura de disco à toa. */
  useEffect(() => {
    if (!comPainel || !idEmFoco) { return undefined; }
    let vivo = true;
    getArt(idEmFoco).then(full => { if (vivo) setFocoFull(full); }).catch(() => {});
    return () => { vivo = false; };
  }, [comPainel, idEmFoco]);

  /* Enquanto a resolução cheia não chega — e quando ela pertence à obra ANTERIOR — vale
     a miniatura: trocar para a arte certa em baixa é melhor que insistir na arte errada
     em alta. */
  const uriEmFoco = (focoFull && focoFull.id === idEmFoco ? resolveArtPreviewUri(focoFull) : null)
    || (artaEmFoco ? resolveArtThumbUri(artaEmFoco) : null);

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
      `Quer apagar "${displayTitle(art.title)}" das suas artes? Isso não pode ser desfeito.`,
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

  /* O cartão de uma arte. Extraído do `renderItem` porque agora ele é usado nos dois
     caminhos — item solto na coluna única, célula de linha na grade — e duplicá-lo
     seria abrir espaço para as duas versões divergirem. */
  function renderArt(art) {
    return (
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
          <Text style={styles.artTitle} numberOfLines={1}>{displayTitle(art.title)}</Text>
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

      {/* [F6-SG-C · TK-C-009] Lista e painel dividem a faixa expandida; abaixo dela o
          `corpo` é uma coluna só e a tela permanece exatamente a de sempre. */}
      <View style={[styles.corpo, comPainel && styles.corpoComPainel]}>
        <FlatList
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          data={emGrade ? hubRows(arts, columns) : arts}
          keyExtractor={(item, index) => (emGrade ? `row-${item[0] ? item[0].id : index}` : String(item.id))}
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
                title="Suas artes ainda vão aparecer aqui"
                message="Crie seu primeiro desenho para guardar aqui."
                actionLabel="Começar a desenhar"
                onPress={() => navigation.navigate('AtelierCanvas', {})}
              />
            </View>
          }
          renderItem={({ item }) => (
            emGrade ? (
              <View style={styles.gridRow}>
                {item.map((art) => (
                  <View key={art.id} style={styles.gridCell}>{renderArt(art)}</View>
                ))}
                {/* Última linha curta: sem as células vazias a arte solitária se esticaria
                    pela linha inteira e a miniatura de 110 ficaria perdida no meio. */}
                {Array.from({ length: columns - item.length }, (_, i) => (
                  <View key={`gap-${i}`} style={styles.gridCell} />
                ))}
              </View>
            ) : renderArt(item)
          )}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
        />

        {/* ── PAINEL DE APOIO — a MESMA obra, o MESMO detalhe e as MESMAS duas ações do
            visor, agora ao lado da lista em vez de por cima dela. Nenhum texto novo,
            nenhum destino novo: `CN-12` e `D4` proíbem preencher largura com invenção. */}
        {comPainel && artaEmFoco && (
          <View style={[styles.painel, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.painelObra}>
              {uriEmFoco ? (
                <Image source={{ uri: uriEmFoco }} style={styles.painelImagem} resizeMode="contain" />
              ) : (
                <Text style={styles.viewerPlaceholderEmoji}>🎨</Text>
              )}
            </View>
            <Text style={styles.artTitle} numberOfLines={2}>{displayTitle(artaEmFoco.title)}</Text>
            <Text style={styles.artDate}>{formatDate(artaEmFoco.createdAt)}</Text>
            <View style={styles.btnRow}>
              <SoundButton
                style={styles.continueBtn}
                onPress={() => handleContinue(artaEmFoco)}
                activeOpacity={0.85}
              >
                <Text style={styles.continueBtnText}>✏️ Editar</Text>
              </SoundButton>
              <SoundButton
                style={styles.deleteBtn}
                onPress={() => handleDelete(artaEmFoco)}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </SoundButton>
            </View>
          </View>
        )}
      </View>

      {/* ── VIEWER MODAL ──
          Com o painel aberto o modal fica quieto: seria o MESMO detalhe duas vezes,
          e a segunda por cima da primeira. */}
      <Modal
        visible={!!viewingArt && !comPainel}
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
                {displayTitle(viewingArt?.title)}
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
  content: { paddingHorizontal: CONTENT_PAD, paddingTop: 8 },

  // ── [F6-SG-C · TK-C-009] Corpo: lista + painel ──
  // Sem painel o `corpo` é só um invólucro de altura cheia — uma coluna, como sempre.
  corpo: { flex: 1 },
  corpoComPainel: { flexDirection: 'row' },
  painel: {
    width: PAINEL_LARGURA,
    paddingHorizontal: CONTENT_PAD,
    paddingTop: 8,
    borderLeftWidth: 1,
    borderLeftColor: pt.border,
  },
  // A moldura é quadrada porque a arte pode ser de qualquer proporção: com `contain`
  // dentro de um quadrado estável, trocar de obra não faz o painel inteiro pular.
  painelObra: {
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  painelImagem: { width: '100%', height: '100%' },
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

  // [TK-C-008] Linha da grade: o intervalo é do `gap`, e o que sobra se divide por
  // igual entre as células — nenhuma porcentagem, nenhum número de colunas embutido.
  gridRow: { flexDirection: 'row', gap: HUB_GAP },
  gridCell: { flex: 1 },

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
