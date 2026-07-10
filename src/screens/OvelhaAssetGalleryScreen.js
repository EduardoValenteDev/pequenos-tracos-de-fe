/**
 * OvelhaAssetGalleryScreen — Galeria interna de assets de "Cadê a Ovelhinha?" (2.2e, DEV).
 *
 * Diagnóstico OBRIGATÓRIO antes de validar o jogo: exibe TODOS os backgrounds (5) e as 3
 * ovelhas SEM animações e SEM exigir toque, e mostra por imagem o ciclo real do expo-image:
 * status inicial → onLoad → onDisplay → onError, tempo até onDisplay, recyclingKey e o source
 * resolvido. Nunca consome rodada, salva estatística nem concede estrelinha. Nunca aparece em
 * produção (rota registrada só sob isInternalToolsEnabled).
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { OVELHA_BG, OVELHA_POSE_IMG, OVELHA_BG_LABELS } from '../data/ovelhaAssets';

const ITENS = [
  ...Object.entries(OVELHA_BG).map(([key, source]) => ({ tipo: 'background', key, source, label: OVELHA_BG_LABELS[key] || key })),
  ...Object.entries(OVELHA_POSE_IMG).map(([key, source]) => ({ tipo: 'pose', key, source, label: `ovelha ${key}` })),
];

/** Resolve dimensões/uri do módulo estático (sem rede — asset local). */
function resolveInfo(source) {
  try {
    const a = Asset.fromModule(source);
    return { w: a.width || null, h: a.height || null, uri: a.uri || a.localUri || String(a.name || source) };
  } catch (_) {
    return { w: null, h: null, uri: String(source) };
  }
}

function AssetCard({ item, now }) {
  const info = useMemo(() => resolveInfo(item.source), [item.source]);
  const [estado, setEstado] = useState('inicial');   // inicial · carregando · exibido · erro
  const [onLoadOk, setOnLoadOk] = useState(false);
  const [onDisplayOk, setOnDisplayOk] = useState(false);
  const [onErrorOk, setOnErrorOk] = useState(false);
  const [ms, setMs] = useState(null);
  const [nonce, setNonce] = useState(0);
  const t0 = useRef(now());
  const recyclingKey = `${item.tipo}:${item.key}:${nonce}`;

  const retry = useCallback(() => {
    setEstado('carregando'); setOnLoadOk(false); setOnDisplayOk(false); setOnErrorOk(false); setMs(null);
    t0.current = now();
    setNonce((n) => n + 1);
  }, [now]);

  return (
    <View style={styles.card}>
      <View style={styles.thumbBox}>
        <ExpoImage
          source={item.source}
          style={styles.thumb}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey={recyclingKey}
          onLoadStart={() => { if (estado === 'inicial') setEstado('carregando'); }}
          onLoad={() => setOnLoadOk(true)}
          onDisplay={() => { setOnDisplayOk(true); setEstado('exibido'); setMs(Math.max(0, now() - t0.current)); }}
          onError={() => { setOnErrorOk(true); setEstado('erro'); }}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.linha}>{item.tipo} · {info.w && info.h ? `${info.w}×${info.h}` : 'dims —'}</Text>
        <Text style={[styles.linha, estado === 'erro' ? styles.err : estado === 'exibido' ? styles.ok : styles.wait]}>
          status: {estado}{ms != null ? ` · ${ms}ms` : ''}
        </Text>
        <Text style={styles.flags}>onLoad {onLoadOk ? 'sim' : '—'} · onDisplay {onDisplayOk ? 'sim' : '—'} · onError {onErrorOk ? 'SIM' : '—'}</Text>
        <Text style={styles.rk} numberOfLines={1}>rk: {recyclingKey}</Text>
        <Text style={styles.rk} numberOfLines={1}>src: {info.uri}</Text>
        {estado === 'erro' && (
          <SoundButton style={styles.retry} onPress={retry}><Text style={styles.retryText}>Tentar novamente</Text></SoundButton>
        )}
      </View>
    </View>
  );
}

export default function OvelhaAssetGalleryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Relógio injetável-friendly (evita Date.now direto em muitos pontos).
  const now = useCallback(() => Date.now(), []);
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#EEF2F6', '#E7ECF2']} style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.headerRow}>
          <SoundButton style={styles.backPill} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
            <FaithIcon name="back" size={16} color={pt.text} />
          </SoundButton>
          <Text style={styles.headerTitle} numberOfLines={1}>Ovelha · Asset Gallery (dev)</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]}>
        <Text style={styles.aviso}>
          Diagnóstico sem toque: cada imagem carrega sozinha. O jogo só está pronto quando todos os
          backgrounds e as três poses mostram onDisplay = sim.
        </Text>
        {ITENS.map((item) => <AssetCard key={`${item.tipo}:${item.key}`} item={item} now={now} width={width} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingHorizontal: 14, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backPill: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: '#D5DEE8' },
  headerTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },
  scroll: { padding: 12, gap: 10 },
  aviso: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, lineHeight: 18, marginBottom: 6 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: '#FFF', borderRadius: radii.lg, padding: 10, ...shadows.soft },
  thumbBox: { width: 96, height: 120, borderRadius: 10, backgroundColor: '#EEF3F7', borderWidth: 1, borderColor: '#DCE4EC', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 96, height: 120 },
  info: { flex: 1, justifyContent: 'center' },
  nome: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  linha: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: pt.textSoft, marginTop: 2 },
  flags: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: pt.text, marginTop: 2 },
  rk: { fontFamily: 'Nunito', fontSize: 10, color: '#94A3B8', marginTop: 1 },
  ok: { color: '#0E7A50' },
  wait: { color: '#B4770F' },
  err: { color: '#C0392B' },
  retry: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: '#E2E8F0' },
  retryText: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#334155' },
});
