/**
 * PackSandboxDevScreen.js — Tela SOMENTE DE DESENVOLVIMENTO (F2.2b) para semear, resetar
 * e diagnosticar o pack sandbox `ready` de david_goliath no device.
 *
 * ⚠️ Só é acessível sob o DUPLO GATE (a rota nem é registrada sem ele — ver AppNavigator).
 * Defesa em profundidade: se o gate estiver falso, a tela mostra um aviso e não opera.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  verifyDavidGoliathPackSandboxSha256,
} from '../services/packSandboxDevService';
// F2.4d.4: downloader GENÉRICO por storyId via manifesto global (só cenas).
import { downloadStoryPackScenesFromGlobalManifest } from '../services/packDownloadService';
// DEVICE-TOOLS1: Laboratório de Recovery (dev) — semeia estados e chama o recovery REAL.
import {
  RECOVERY_LAB_PRESETS,
  applyRecoveryLabPreset,
  inspectRecoveryState,
  runRecoveryReal,
  cleanupRecoveryLab,
} from '../services/recoveryLabDevService';

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
  const [verify, setVerify] = useState(null); // resumo sha256 (do download OU do verify profundo)
  // DEVICE-TOOLS1 — Laboratório de Recovery: storyId de teste dedicado (isolado do sandbox david_goliath).
  const [labStoryId, setLabStoryId] = useState('recovery_lab');
  const [labVersion, setLabVersion] = useState('2.0.0');
  const [labPrev, setLabPrev] = useState('1.0.0');
  const [labOther, setLabOther] = useState('recovery_lab_b');
  const [labMsg, setLabMsg] = useState('');
  const [labState, setLabState] = useState(null); // inspeção estruturada por história
  const [labRun, setLabRun] = useState(null);     // resultado do recovery REAL (antes/depois)
  const enabled = isPackSandboxDevEnabled();

  // F2.4e.2pR — guardas de concorrência/ciclo de vida:
  //  • busyRef: trava SÍNCRONA (fecha o TOCTOU de duplo-toque; serializa as ações pesadas).
  //  • mountedRef: evita setState após desmontar (ex.: "Voltar" no meio do download).
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const safeSet = useCallback((setter, value) => { if (mountedRef.current) setter(value); }, []);

  // Diagnóstico LEVE (sem busy próprio; chamado no mount e ao fim das ações).
  const loadDiag = useCallback(async () => {
    if (!enabled) return;
    const d = await diagnoseDavidGoliathPackSandbox();
    safeSet(setDiag, d);
  }, [enabled, safeSet]);

  // Executa uma ação pesada de forma EXCLUSIVA: guarda síncrona + libera busy sempre.
  const runExclusive = useCallback(async (fn) => {
    if (busyRef.current) return;      // duplo-toque/duas ações no mesmo frame → ignora a 2ª
    busyRef.current = true;
    safeSet(setBusy, true);
    try { await fn(); }
    finally {
      busyRef.current = false;
      if (mountedRef.current) setBusy(false); // busy SEMPRE liberado (nunca trava a tela)
    }
  }, [safeSet]);

  const refresh = useCallback(() => runExclusive(loadDiag), [runExclusive, loadDiag]);

  useEffect(() => { loadDiag(); }, [loadDiag]); // mount: só diagnóstico leve

  const onSeed = useCallback(() => runExclusive(async () => {
    // limpa integridade/progresso stale ao trocar o conjunto de arquivos (F2.4e.2pR)
    safeSet(setMsg, 'Semeando…'); safeSet(setVerify, null); safeSet(setDl, null); safeSet(setDlG, null);
    const r = await seedDavidGoliathPackSandbox();
    await refreshPacks();          // PacksContext reflete o novo estado → resolver usa file://
    safeSet(setMsg, r.ok ? `Seed OK (${r.totalBytes} bytes)` : `Seed falhou: ${r.reason}`);
    await loadDiag();
  }), [runExclusive, safeSet, refreshPacks, loadDiag]);

  const onReset = useCallback(() => runExclusive(async () => {
    safeSet(setMsg, 'Resetando…'); safeSet(setVerify, null); safeSet(setDl, null); safeSet(setDlG, null);
    const r = await resetDavidGoliathPackSandbox();
    await refreshPacks();
    safeSet(setMsg, r.ok ? 'Reset OK (voltou a require)' : `Reset falhou: ${r.reason}`);
    await loadDiag();
  }), [runExclusive, safeSet, refreshPacks, loadDiag]);

  const onDownload = useCallback(() => runExclusive(async () => {
    safeSet(setMsg, 'Baixando…'); safeSet(setVerify, null); safeSet(setDl, { status: 'downloading', downloadedBytes: 0, totalBytes: 0 });
    const r = await downloadDavidGoliathPackSandbox(baseUrl, (p) => safeSet(setDl, p));
    await refreshPacks();
    safeSet(setMsg, r.ok ? `Download OK (${r.totalBytes} bytes)` : `Download falhou: ${r.reason}`);
    await loadDiag();
  }), [runExclusive, safeSet, baseUrl, refreshPacks, loadDiag]);

  // F2.4d.4 — download GENÉRICO por storyId via manifesto global (SÓ CENAS; default).
  const onDownloadGeneric = useCallback(() => runExclusive(async () => {
    safeSet(setMsg, 'Baixando (genérico — só cenas)…');
    safeSet(setVerify, null); safeSet(setDlG, { status: 'downloading', downloadedBytes: 0, totalBytes: 0 });
    const r = await downloadStoryPackScenesFromGlobalManifest({
      storyId,
      globalManifestUrl: globalUrl,
      appVersion: '1.0.0',
      onProgress: (p) => safeSet(setDlG, p),
    });
    await refreshPacks();
    // sha256 já foi validado DENTRO do download (antes do ready) — registra sem re-hashear.
    safeSet(setVerify, r.ok ? { source: 'download', ok: true, kinds: r.kinds || ['scene'] } : null);
    safeSet(setMsg, r.ok
      ? `Download OK (${kindSummary(r.counts)} · ${r.totalBytes} bytes · sha256 validado)`
      : `Download falhou: ${r.reason}`);
    await loadDiag();
  }), [runExclusive, safeSet, storyId, globalUrl, refreshPacks, loadDiag]);

  // F2.4e.1 — download de TODAS as mídias (cover+scene+coloring+audio) via manifesto global.
  const onDownloadAllMedia = useCallback(() => runExclusive(async () => {
    safeSet(setMsg, 'Baixando TODAS as mídias (via manifesto global)…');
    safeSet(setVerify, null); safeSet(setDlG, { status: 'downloading', downloadedBytes: 0, totalBytes: 0 });
    const r = await downloadStoryPackScenesFromGlobalManifest({
      storyId,
      globalManifestUrl: globalUrl,
      appVersion: '1.0.0',
      requestedKinds: ALL_KINDS,
      onProgress: (p) => safeSet(setDlG, p),
    });
    await refreshPacks();
    safeSet(setVerify, r.ok ? { source: 'download', ok: true, kinds: r.kinds || ALL_KINDS } : null);
    safeSet(setMsg, r.ok
      ? `Download TODAS OK (${kindSummary(r.counts)} · ${r.totalBytes} bytes · sha256 validado)`
      : `Download TODAS falhou: ${r.reason}`);
    await loadDiag();
  }), [runExclusive, safeSet, storyId, globalUrl, refreshPacks, loadDiag]);

  // F2.4e.2p — verificação sha256 PROFUNDA (dev, sob demanda, com yields; não roda no refresh).
  const onVerifySha = useCallback(() => runExclusive(async () => {
    safeSet(setMsg, 'Verificando sha256 (profundo, pode levar alguns segundos)…');
    const v = await verifyDavidGoliathPackSandboxSha256();
    if (!v.enabled) { safeSet(setMsg, 'gate desligado'); return; }
    safeSet(setVerify, v.ok ? { source: 'deep', ok: true, byKind: v.byKind, ms: v.ms }
      : { source: 'deep', ok: false, byKind: v.byKind, reason: v.reason, ms: v.ms });
    safeSet(setMsg, v.ok ? `sha256 profundo OK (${v.checked} arquivos, ${v.ms}ms)` : `sha256 profundo: ${v.reason || 'divergência'}`);
  }), [runExclusive, safeSet]);

  // DEVICE-TOOLS1 — as histórias tocadas pelo laboratório (só as selecionadas).
  const labIds = useCallback(() => (labOther ? [labStoryId, labOther] : [labStoryId]), [labStoryId, labOther]);

  const onApplyPreset = useCallback((presetId) => runExclusive(async () => {
    safeSet(setLabMsg, `Aplicando ${presetId}…`); safeSet(setLabRun, null);
    const r = await applyRecoveryLabPreset(presetId, { storyId: labStoryId, version: labVersion, prevVersion: labPrev, otherStoryId: labOther });
    safeSet(setLabMsg, r.ok ? `${presetId} aplicado (${(r.envolvidos || []).join(', ')})` : `${presetId} falhou: ${r.reason}`);
    const st = await inspectRecoveryState(labIds());
    safeSet(setLabState, st.enabled ? st : null);
  }), [runExclusive, safeSet, labStoryId, labVersion, labPrev, labOther, labIds]);

  const onLabInspect = useCallback(() => runExclusive(async () => {
    const st = await inspectRecoveryState(labIds());
    safeSet(setLabState, st.enabled ? st : null);
    safeSet(setLabMsg, 'Estado inspecionado');
  }), [runExclusive, safeSet, labIds]);

  const onLabRecovery = useCallback(() => runExclusive(async () => {
    safeSet(setLabMsg, 'Executando recovery REAL…');
    const r = await runRecoveryReal(labStoryId, labOther || undefined);
    safeSet(setLabRun, r.enabled ? r : null);
    if (r.enabled) safeSet(setLabState, r.depois);
    await refreshPacks();
    safeSet(setLabMsg, 'Recovery executado');
  }), [runExclusive, safeSet, labStoryId, labOther, refreshPacks]);

  const onLabCleanup = useCallback(() => runExclusive(async () => {
    safeSet(setLabMsg, 'Limpando histórias de teste…');
    const r = await cleanupRecoveryLab(labIds());
    await refreshPacks();
    const st = await inspectRecoveryState(labIds());
    safeSet(setLabState, st.enabled ? st : null); safeSet(setLabRun, null);
    safeSet(setLabMsg, r.ok ? `Limpo: ${(r.limpos || []).join(', ')}` : `Limpeza falhou: ${r.reason}`);
  }), [runExclusive, safeSet, labIds, refreshPacks]);

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
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={busy}><Text style={styles.btnGhostTxt}>‹ Voltar</Text></TouchableOpacity>
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

      {/* F2.4e.2p — Integridade sha256: validada no download; verificação profunda sob demanda. */}
      <View style={styles.card}>
        <Text style={styles.k}>Integridade sha256 (dev)</Text>
        <TouchableOpacity style={[styles.btn, styles.btnVerify]} onPress={onVerifySha} disabled={busy}>
          <Text style={styles.btnTxt}>Verificar sha256 (profundo)</Text>
        </TouchableOpacity>
        {verify?.source === 'download' && (
          <Text style={[styles.msg, styles.ok]}>sha256 validado no download ✓ ({(verify.kinds || []).join(', ')})</Text>
        )}
        {verify?.source === 'deep' && (
          <>
            <Text style={[styles.msg, verify.ok ? styles.ok : styles.no]}>
              sha256 profundo: {verify.ok ? 'OK ✓' : `FALHOU (${verify.reason || 'divergência'})`}{verify.ms ? ` · ${verify.ms}ms` : ''}
            </Text>
            {verify.byKind && ['cover', 'scene', 'coloring', 'audio'].map((k) => {
              const g = verify.byKind[k];
              if (!g) return null;
              return (
                <Text key={k} style={styles.k}>
                  {k}: <Text style={g.ok === g.total ? styles.ok : styles.no}>{g.ok}/{g.total}</Text>
                </Text>
              );
            })}
          </>
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

      {/* DEVICE-TOOLS1 — Laboratório de Recovery (dev): semeia estados e chama o recovery REAL. Só toca os storyId abaixo. */}
      <View style={styles.card}>
        <Text style={styles.title}>🧪 Laboratório de Recovery</Text>
        <Text style={styles.warn}>Ferramenta interna (dev/QA). Semeia estados de teste e chama o recovery REAL — toca apenas os storyId abaixo; não altera progresso, perfil ou outras histórias.</Text>
        <Text style={styles.k}>storyId de teste</Text>
        <TextInput style={styles.input} value={labStoryId} onChangeText={setLabStoryId} autoCapitalize="none" placeholderTextColor="#6A6A78" />
        <View style={styles.btnRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.k}>versão atual</Text>
            <TextInput style={styles.input} value={labVersion} onChangeText={setLabVersion} autoCapitalize="none" placeholderTextColor="#6A6A78" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.k}>versão antiga</Text>
            <TextInput style={styles.input} value={labPrev} onChangeText={setLabPrev} autoCapitalize="none" placeholderTextColor="#6A6A78" />
          </View>
        </View>
        <Text style={styles.k}>2º storyId (P5 — duas histórias)</Text>
        <TextInput style={styles.input} value={labOther} onChangeText={setLabOther} autoCapitalize="none" placeholderTextColor="#6A6A78" />
        <Text style={styles.k}>URL do manifesto global (não-secreta, editável)</Text>
        <TextInput style={styles.input} value={globalUrl} onChangeText={setGlobalUrl} autoCapitalize="none" placeholderTextColor="#6A6A78" />
        <Text style={styles.help}>Presets (limpam só os storyId acima antes de semear):</Text>
        {RECOVERY_LAB_PRESETS.map((p) => (
          <TouchableOpacity key={p.id} style={[styles.btn, styles.btnPreset]} onPress={() => onApplyPreset(p.id)} disabled={busy}>
            <Text style={styles.btnTxt}>{p.id} — {p.nome}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, styles.btnGeneric]} onPress={onLabRecovery} disabled={busy}><Text style={styles.btnTxt}>Executar recovery</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnRefresh]} onPress={onLabInspect} disabled={busy}><Text style={styles.btnTxt}>Inspecionar</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnReset]} onPress={onLabCleanup} disabled={busy}><Text style={styles.btnTxt}>Limpar</Text></TouchableOpacity>
        </View>
        {!!labMsg && <Text style={styles.msg}>{labMsg}</Text>}
        {labRun && labRun.resultados && Object.keys(labRun.resultados).map((sid) => {
          const r = labRun.resultados[sid];
          return (
            <Text key={sid} style={styles.k}>{sid}: <Text style={r.recovered ? styles.ok : styles.no}>recovered={String(r.recovered)}</Text>{r.ambiguous ? ' · ambíguo' : ''}{r.version ? ` · v${r.version}` : ''}{r.reason ? ` · ${r.reason}` : ''}</Text>
          );
        })}
        {labState && labState.historias && Object.keys(labState.historias).map((sid) => {
          const hh = labState.historias[sid];
          return (
            <View key={sid} style={styles.scene}>
              <Text style={styles.sceneHead}>{sid} · índice: <Text style={styles.v}>{hh.indexEntry ? `${hh.indexEntry.status}@${hh.indexEntry.version}` : 'ausente'}</Text> · disco: {hh.versoesNoDisco.map((x) => x.version).join(',') || '—'}{hh.tmpPresente ? ' · .tmp' : ''}</Text>
              {hh.versoesNoDisco.map((x) => (
                <Text key={x.version} style={styles.k}>  {x.version}: manifest {x.temManifest ? '✓' : '✗'} · marcador {x.temMarcador ? '✓' : '✗'} · arquivos {x.arquivos.filter((a) => a.exists).length}/{x.arquivos.length}</Text>
              ))}
            </View>
          );
        })}
        {(labRun || labState) && (
          <>
            <Text style={styles.k}>Diagnóstico textual (selecione para copiar):</Text>
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              value={JSON.stringify({ resultados: labRun && labRun.resultados, estado: labState && labState.historias, when: (labRun && labRun.when) || (labState && labState.when) }, null, 1)}
              multiline editable={false} selectTextOnFocus
            />
          </>
        )}
      </View>

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
  btnVerify: { backgroundColor: '#7A5C2E', marginTop: 4 },
  btnPreset: { backgroundColor: '#4A3A6E', marginTop: 4 },
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
