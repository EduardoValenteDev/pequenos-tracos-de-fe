/**
 * PackSandboxDevScreen.js — Tela SOMENTE DE DESENVOLVIMENTO (F2.2b) para semear, resetar
 * e diagnosticar o pack sandbox `ready` de david_goliath no device.
 *
 * ⚠️ Só é acessível sob o DUPLO GATE (a rota nem é registrada sem ele — ver AppNavigator).
 * Defesa em profundidade: se o gate estiver falso, a tela mostra um aviso e não opera.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePacks } from '../context/PacksContext';
import {
  isPackSandboxDevEnabled,
  seedDavidGoliathPackSandbox,
  resetDavidGoliathPackSandbox,
  diagnoseDavidGoliathPackSandbox,
  downloadDavidGoliathPackSandbox,
} from '../services/packSandboxDevService';
// F2.4d.4: downloader GENÉRICO por storyId via manifesto global (só cenas).
import { downloadStoryPackScenesFromGlobalManifest } from '../services/packDownloadService';

// baseUrl padrão (dev): pode vir de env; editável na tela. Nunca em produção (duplo gate).
const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_PACK_SANDBOX_BASE_URL || 'http://192.168.0.10:8787/';
// F2.4d.4 (dev only, duplo gate): fluxo genérico via manifesto global. URL/storyId editáveis.
// NÃO hardcodamos o domínio de storage remoto aqui (preserva o invariante de "sem storage
// remoto hardcoded" na ferramenta dev): o padrão é um placeholder ou o env; a URL real do
// manifesto global é colada manualmente na validação (igual ao campo LAN legado).
const DEFAULT_GLOBAL_MANIFEST_URL = process.env.EXPO_PUBLIC_GLOBAL_MANIFEST_URL
  || 'https://SEU-DOMINIO/content-manifest.json';
const DEFAULT_STORY_ID = 'david_goliath';
// F2.4e.1: kinds baixáveis pela camada dev; resumo por kind do retorno do downloader.
const ALL_KINDS = ['cover', 'scene', 'coloring', 'audio'];
const kindSummary = (c) => (c ? `cover ${c.cover || 0} · cenas ${c.scene || 0} · colorir ${c.coloring || 0} · áudio ${c.audio || 0}` : '');

export default function PackSandboxDevScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { refreshPacks } = usePacks();
  const [diag, setDiag] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [dl, setDl] = useState(null); // progresso: { status, downloadedBytes, totalBytes }
  // F2.4d.4 — fluxo genérico via manifesto global.
  const [globalUrl, setGlobalUrl] = useState(DEFAULT_GLOBAL_MANIFEST_URL);
  const [storyId, setStoryId] = useState(DEFAULT_STORY_ID);
  const [dlG, setDlG] = useState(null); // progresso do fluxo genérico
  const enabled = isPackSandboxDevEnabled();

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setBusy(true);
    try { setDiag(await diagnoseDavidGoliathPackSandbox()); }
    finally { setBusy(false); }
  }, [enabled]);

  useEffect(() => { refresh(); }, [refresh]);

  const onSeed = useCallback(async () => {
    setBusy(true); setMsg('Semeando…');
    const r = await seedDavidGoliathPackSandbox();
    await refreshPacks();          // PacksContext reflete o novo estado → resolver usa file://
    setMsg(r.ok ? `Seed OK (${r.totalBytes} bytes)` : `Seed falhou: ${r.reason}`);
    await refresh();
  }, [refreshPacks, refresh]);

  const onReset = useCallback(async () => {
    setBusy(true); setMsg('Resetando…');
    const r = await resetDavidGoliathPackSandbox();
    await refreshPacks();
    setMsg(r.ok ? 'Reset OK (voltou a require)' : `Reset falhou: ${r.reason}`);
    await refresh();
  }, [refreshPacks, refresh]);

  const onDownload = useCallback(async () => {
    setBusy(true); setMsg('Baixando…'); setDl({ status: 'downloading', downloadedBytes: 0, totalBytes: 0 });
    const r = await downloadDavidGoliathPackSandbox(baseUrl, (p) => setDl(p));
    await refreshPacks();
    setMsg(r.ok ? `Download OK (${r.totalBytes} bytes)` : `Download falhou: ${r.reason}`);
    await refresh();
  }, [baseUrl, refreshPacks, refresh]);

  // F2.4d.4 — download GENÉRICO por storyId via manifesto global (SÓ CENAS; default).
  const onDownloadGeneric = useCallback(async () => {
    setBusy(true); setMsg('Baixando (genérico — só cenas)…');
    setDlG({ status: 'downloading', downloadedBytes: 0, totalBytes: 0 });
    const r = await downloadStoryPackScenesFromGlobalManifest({
      storyId,
      globalManifestUrl: globalUrl,
      appVersion: '1.0.0',
      onProgress: (p) => setDlG(p),
    });
    await refreshPacks();
    setMsg(r.ok
      ? `Download OK (${kindSummary(r.counts)} · ${r.totalBytes} bytes)`
      : `Download falhou: ${r.reason}`);
    await refresh();
  }, [storyId, globalUrl, refreshPacks, refresh]);

  // F2.4e.1 — download de TODAS as mídias (cover+scene+coloring+audio) via manifesto global.
  const onDownloadAllMedia = useCallback(async () => {
    setBusy(true); setMsg('Baixando TODAS as mídias (via manifesto global)…');
    setDlG({ status: 'downloading', downloadedBytes: 0, totalBytes: 0 });
    const r = await downloadStoryPackScenesFromGlobalManifest({
      storyId,
      globalManifestUrl: globalUrl,
      appVersion: '1.0.0',
      requestedKinds: ALL_KINDS,
      onProgress: (p) => setDlG(p),
    });
    await refreshPacks();
    setMsg(r.ok
      ? `Download TODAS OK (${kindSummary(r.counts)} · ${r.totalBytes} bytes)`
      : `Download TODAS falhou: ${r.reason}`);
    await refresh();
  }, [storyId, globalUrl, refreshPacks, refresh]);

  if (!enabled) {
    return (
      <View style={[styles.wrap, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Pack Sandbox (dev)</Text>
        <Text style={styles.warn}>Duplo gate desligado. Defina EXPO_PUBLIC_ENABLE_PACK_SANDBOX="true" em modo dev.</Text>
        <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.goBack()}><Text style={styles.btnGhostTxt}>‹ Voltar</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 16 }}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>🛠 Pack Sandbox — david_goliath</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.btnGhostTxt}>‹ Voltar</Text></TouchableOpacity>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, styles.btnSeed]} onPress={onSeed} disabled={busy}><Text style={styles.btnTxt}>Seed (bundle)</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnReset]} onPress={onReset} disabled={busy}><Text style={styles.btnTxt}>Reset</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnRefresh]} onPress={refresh} disabled={busy}><Text style={styles.btnTxt}>Refresh</Text></TouchableOpacity>
      </View>

      {/* F2.3b — Download real sandbox (LAN, SÓ as 10 cenas). Duplo gate herdado. */}
      <View style={styles.card}>
        <Text style={styles.k}>Download sandbox remoto (LAN)</Text>
        <TextInput
          style={styles.input}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="http://IP:8787/"
          placeholderTextColor="#6A6A78"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
        <TouchableOpacity style={[styles.btn, styles.btnDownload]} onPress={onDownload} disabled={busy}>
          <Text style={styles.btnTxt}>Download david_goliath (10 cenas)</Text>
        </TouchableOpacity>
        {dl && (
          <Text style={styles.msg}>
            {dl.status} · {dl.downloadedBytes}/{dl.totalBytes} bytes
            {dl.totalBytes > 0 ? `  (${Math.round((dl.downloadedBytes / dl.totalBytes) * 100)}%)` : ''}
          </Text>
        )}
      </View>

      {/* F2.4d.4 — Download GENÉRICO por storyId via MANIFESTO GLOBAL (dev, duplo gate). Só cenas. */}
      <View style={styles.card}>
        <Text style={styles.k}>Download genérico via manifesto global (dev)</Text>
        <TextInput
          style={styles.input}
          value={globalUrl}
          onChangeText={setGlobalUrl}
          placeholder="https://…/content-manifest.json"
          placeholderTextColor="#6A6A78"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
        <TextInput
          style={styles.input}
          value={storyId}
          onChangeText={setStoryId}
          placeholder="storyId (ex.: david_goliath)"
          placeholderTextColor="#6A6A78"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
        <TouchableOpacity style={[styles.btn, styles.btnGeneric]} onPress={onDownloadGeneric} disabled={busy}>
          <Text style={styles.btnTxt}>Download genérico ({storyId}) — só cenas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnGenericAll]} onPress={onDownloadAllMedia} disabled={busy}>
          <Text style={styles.btnTxt}>Download TODAS as mídias ({storyId}) — cover+cenas+colorir+áudio</Text>
        </TouchableOpacity>
        {dlG && (
          <Text style={styles.msg}>
            {dlG.status}{dlG.kind ? ` · ${dlG.kind}` : ''} · {dlG.downloadedBytes}/{dlG.totalBytes} bytes
            {dlG.totalBytes > 0 ? `  (${Math.round((dlG.downloadedBytes / dlG.totalBytes) * 100)}%)` : ''}
          </Text>
        )}
      </View>

      {busy && <ActivityIndicator style={{ marginVertical: 8 }} color="#F5B301" />}
      {!!msg && <Text style={styles.msg}>{msg}</Text>}

      {diag && (
        <View style={styles.card}>
          <Text style={styles.k}>status: <Text style={styles.v}>{diag.status}</Text></Text>
          <Text style={styles.k}>version: <Text style={styles.v}>{String(diag.version)}</Text></Text>
          {diag.byKind && ['cover', 'scene', 'coloring', 'audio'].map((k) => {
            const g = diag.byKind[k] || { found: 0, total: 0, file: 0, bytes: 0 };
            const okAll = g.total > 0 && g.found === g.total;
            return (
              <Text key={k} style={styles.k}>
                {k}: <Text style={[styles.v, okAll ? styles.ok : styles.no]}>{g.found}/{g.total}</Text>
                {'  '}· file:{g.file} · {g.bytes}B
              </Text>
            );
          })}
          <Text style={styles.k}>totalBytes: <Text style={styles.v}>{diag.totalBytes}</Text></Text>
          <Text style={styles.k}>usesPack: <Text style={[styles.v, diag.usesPack ? styles.ok : styles.no]}>{String(diag.usesPack)}</Text></Text>
          <Text style={styles.k}>localDir:</Text>
          <Text style={styles.uri}>{diag.localDir}</Text>
        </View>
      )}

      {diag?.scenes?.map((s) => (
        <View key={s.n} style={styles.scene}>
          <Text style={styles.sceneHead}>
            cena {s.n}  ·  {s.exists ? '✓ existe' : '✗ ausente'} ({s.size}B)  ·  <Text style={s.sourceType === 'file' ? styles.ok : styles.no}>{s.sourceType}</Text>
          </Text>
          {s.uri && <Text style={styles.uri}>{s.uri}</Text>}
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.k}>Validação no iPhone</Text>
        <Text style={styles.help}>1) Seed → status deve virar "ready", arquivos 10/10, usesPack true, sourceType "file".</Text>
        <Text style={styles.help}>2) Abra Davi e Golias: NarrationScreen (cenas), Livrinho (História ilustrada) e a prévia da intro — devem renderizar por file://.</Text>
        <Text style={styles.help}>3) Reset → sourceType volta a "require", usesPack false; confirme que as telas voltam ao fallback local.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#14141C' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFF', flexShrink: 1 },
  warn: { fontFamily: 'Nunito', color: '#FFD27A', marginVertical: 16, paddingHorizontal: 16, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnSeed: { backgroundColor: '#2E7D32' }, btnReset: { backgroundColor: '#8E2E2E' }, btnRefresh: { backgroundColor: '#2E4A8E' },
  btnDownload: { backgroundColor: '#6A4AAE', marginTop: 8 },
  btnGeneric: { backgroundColor: '#2E7D6A', marginTop: 8 },
  btnGenericAll: { backgroundColor: '#3A6EA5', marginTop: 8 },
  input: { backgroundColor: '#0F0F16', color: '#FFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontFamily: 'Nunito', fontSize: 12, marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#2A2A38' },
  btnTxt: { fontFamily: 'Nunito', fontWeight: '700', color: '#FFF', fontSize: 13 },
  btnGhost: { alignSelf: 'center', marginTop: 20 }, btnGhostTxt: { fontFamily: 'Nunito', color: '#8FB7FF', fontSize: 13 },
  msg: { fontFamily: 'Nunito', color: '#F5B301', marginBottom: 8 },
  card: { backgroundColor: '#1E1E2A', borderRadius: 12, padding: 12, marginVertical: 8 },
  k: { fontFamily: 'Nunito', color: '#B9B9C7', fontSize: 12, marginBottom: 2 },
  v: { color: '#FFF', fontWeight: '700' },
  ok: { color: '#7CE38B' }, no: { color: '#FF9E9E' },
  uri: { fontFamily: 'Nunito', color: '#7FA6FF', fontSize: 10, marginBottom: 4 },
  scene: { borderBottomWidth: 1, borderBottomColor: '#26263440', paddingVertical: 6 },
  sceneHead: { fontFamily: 'Nunito', color: '#E7E7EF', fontSize: 12 },
  help: { fontFamily: 'Nunito', color: '#B9B9C7', fontSize: 12, marginTop: 4, lineHeight: 17 },
});
