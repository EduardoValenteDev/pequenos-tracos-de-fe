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
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { OVELHA_BG, OVELHA_POSE_IMG, OVELHA_BG_LABELS, OVELHA_POSE_JOGO } from '../data/ovelhaAssets';
import { OVELHA_SCENES, getScene } from '../data/ovelhaScenes';
import {
  OVELHA_DIFFICULTIES, getDifficulty, computeViewport, contentRect, spriteBoxArt, hitboxPxRect,
  planPartida, criarRng, criarDeckState, spotElegivel,
} from '../services/ovelhaGameService';

const TIER_COR = { facil: '#16A34A', medio: '#B4770F', dificil: '#C0392B' };

/** Spots normalizados (0..1) de uma cena, para desenhar sobre a miniatura da galeria. */
function spotsNorm(sceneId) {
  const sc = getScene(sceneId);
  return (sc.hidingSpots || []).map((s) => ({
    id: s.id, difficulty: s.difficulty,
    x: s.pos.x / sc.designWidth, y: s.pos.y / sc.designHeight,
  }));
}

// Pose única oficial do jogo = frontal; as laterais seguem no disco, mas marcadas como legado.
const ITENS = [
  ...Object.entries(OVELHA_BG).map(([key, source]) => {
    const sc = OVELHA_SCENES.find((s) => s.id === key);
    return {
      tipo: 'background', key, source,
      label: OVELHA_BG_LABELS[key] || key,
      spots: spotsNorm(key),
      habilitada: sc ? sc.enabled !== false : true,
      aquatico: !!(sc && sc.aquatico),
    };
  }),
  ...Object.entries(OVELHA_POSE_IMG).map(([key, source]) => ({
    tipo: 'pose', key, source, spots: [],
    label: key === OVELHA_POSE_JOGO ? `ovelha ${key} (oficial do jogo)` : `ovelha ${key} (legado — fora do jogo)`,
  })),
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
        {/* Spots sobre a miniatura (validação de posição por cena, inclusive underwater). */}
        {(item.spots || []).map((sp) => (
          <View key={sp.id} pointerEvents="none"
            style={{ position: 'absolute', left: `${sp.x * 100}%`, top: `${sp.y * 100}%`, width: 8, height: 8, marginLeft: -4, marginTop: -4, borderRadius: 4, backgroundColor: TIER_COR[sp.difficulty] || '#333', borderWidth: 1, borderColor: '#FFF' }} />
        ))}
      </View>
      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.linha}>{item.tipo} · {info.w && info.h ? `${info.w}×${info.h}` : 'dims —'}</Text>
        {item.tipo === 'background' && (
          <Text style={styles.linha} numberOfLines={2}>
            spots: {item.spots.length}{item.aquatico ? ' · aquático (bolha)' : ''}{item.habilitada === false ? ' · DESABILITADA' : ''}
            {'  '}[{['facil', 'medio', 'dificil'].map((t) => `${t[0]}:${item.spots.filter((s) => s.difficulty === t).length}`).join(' ')}]
          </Text>
        )}
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

/* ── Inspetor de esconderijos: cena + tier + todos/um + navegação + hitbox + tamanho real ── */
function SpotInspector() {
  const cenas = OVELHA_SCENES;
  const [sceneIdx, setSceneIdx] = useState(0);
  const [tier, setTier] = useState('todos');           // todos|facil|medio|dificil
  const [modo, setModo] = useState('facil');           // dificuldade p/ tamanho real da ovelha
  const [telaGrande, setTelaGrande] = useState(false); // pequena vs grande
  const [umPorVez, setUmPorVez] = useState(false);
  const [idx, setIdx] = useState(0);

  const scene = cenas[sceneIdx];
  const spots = useMemo(
    () => scene.hidingSpots.filter((s) => tier === 'todos' || s.difficulty === tier),
    [scene, tier],
  );
  const dif = getDifficulty(modo);
  const vpW = telaGrande ? 300 : 190;                  // "tela grande" x "tela pequena"
  const viewport = computeViewport({ largura: vpW, altura: 9999, artW: scene.designWidth, artH: scene.designHeight });
  const cr = contentRect(scene, viewport);
  const iSel = Math.min(idx, Math.max(0, spots.length - 1));
  const bg = OVELHA_BG[scene.background.assetKey];
  const sheep = OVELHA_POSE_IMG[OVELHA_POSE_JOGO];

  const renderSpot = (sp, destaque) => {
    const escalaEf = Math.max(0.06, Math.min(0.18, sp.escala * (dif.escalaMul || 1)));
    const spotEf = { ...sp, escala: escalaEf };
    const sb = spriteBoxArt(spotEf, scene);
    const spW = sb.w * cr.scale, spH = sb.h * cr.scale;
    const left = cr.x + sb.cx * cr.scale - spW / 2;
    const top = cr.y + sb.cy * cr.scale - spH / 2;
    const hb = hitboxPxRect(spotEf, scene, viewport, dif.hitboxMin);
    const dentro = hb.x0 >= -0.5 && hb.y0 >= -0.5 && hb.x1 <= viewport.w + 0.5 && hb.y1 <= viewport.h + 0.5;
    return (
      <React.Fragment key={sp.id}>
        <View pointerEvents="none" style={{ position: 'absolute', left: hb.x0, top: hb.y0, width: hb.w, height: hb.h, borderWidth: 1.5, borderColor: dentro ? '#7C3AED' : '#C0392B', borderRadius: 6 }} />
        <ExpoImage source={sheep} pointerEvents="none" contentFit="contain" cachePolicy="memory-disk" transition={0}
          recyclingKey={`insp:${sp.id}:${modo}:${telaGrande}`} style={{ position: 'absolute', left, top, width: spW, height: spH, opacity: destaque ? 1 : 0.85 }} />
      </React.Fragment>
    );
  };

  return (
    <View style={styles.insp}>
      <Text style={styles.inspTit}>Inspetor de esconderijos</Text>
      <View style={styles.inspRow}>
        <SoundButton style={styles.miniBtn} onPress={() => { setSceneIdx((v) => (v + cenas.length - 1) % cenas.length); setIdx(0); }}><Text style={styles.miniTxt}>‹</Text></SoundButton>
        <Text style={styles.inspCena} numberOfLines={1}>{scene.id}{scene.aquatico ? ' (bolha)' : ''}</Text>
        <SoundButton style={styles.miniBtn} onPress={() => { setSceneIdx((v) => (v + 1) % cenas.length); setIdx(0); }}><Text style={styles.miniTxt}>›</Text></SoundButton>
      </View>
      <View style={styles.inspRow}>
        {['todos', 'facil', 'medio', 'dificil'].map((t) => (
          <Pressable key={t} onPress={() => { setTier(t); setIdx(0); }} style={[styles.chip, tier === t && styles.chipSel]}><Text style={[styles.chipTxt, tier === t && styles.chipTxtSel]}>{t}</Text></Pressable>
        ))}
      </View>
      <View style={styles.inspRow}>
        {OVELHA_DIFFICULTIES.map((m) => (
          <Pressable key={m.id} onPress={() => setModo(m.id)} style={[styles.chip, modo === m.id && styles.chipSel]}><Text style={[styles.chipTxt, modo === m.id && styles.chipTxtSel]}>{m.label}</Text></Pressable>
        ))}
        <Pressable onPress={() => setTelaGrande((v) => !v)} style={[styles.chip, telaGrande && styles.chipSel]}><Text style={[styles.chipTxt, telaGrande && styles.chipTxtSel]}>{telaGrande ? 'grande' : 'pequena'}</Text></Pressable>
        <Pressable onPress={() => setUmPorVez((v) => !v)} style={[styles.chip, umPorVez && styles.chipSel]}><Text style={[styles.chipTxt, umPorVez && styles.chipTxtSel]}>{umPorVez ? '1 por vez' : 'todos'}</Text></Pressable>
      </View>
      <View style={styles.inspPalco}>
        <View style={{ width: viewport.w, height: viewport.h, borderRadius: 10, overflow: 'hidden', backgroundColor: '#EAF2F5' }}>
          <ExpoImage source={bg} pointerEvents="none" contentFit="fill" cachePolicy="memory-disk" transition={0}
            recyclingKey={`inspbg:${scene.id}`} style={{ position: 'absolute', left: cr.x, top: cr.y, width: cr.w, height: cr.h }} />
          {umPorVez ? (spots[iSel] && renderSpot(spots[iSel], true)) : spots.map((sp) => renderSpot(sp, false))}
        </View>
      </View>
      {umPorVez && spots[iSel] && (
        <>
          <View style={styles.inspRow}>
            <SoundButton style={styles.miniBtn} onPress={() => setIdx((v) => (v + spots.length - 1) % spots.length)}><Text style={styles.miniTxt}>‹</Text></SoundButton>
            <Text style={styles.inspInfo}>{iSel + 1}/{spots.length} · {spots[iSel].id}</Text>
            <SoundButton style={styles.miniBtn} onPress={() => setIdx((v) => (v + 1) % spots.length)}><Text style={styles.miniTxt}>›</Text></SoundButton>
          </View>
          <Text style={styles.inspInfo}>tier {spots[iSel].difficulty} · zona {spots[iSel].zone} · grupo {spots[iSel].cluster} · escala {spots[iSel].escala}</Text>
          <Text style={styles.inspInfo}>x {(spots[iSel].pos.x / scene.designWidth).toFixed(3)} · y {(spots[iSel].pos.y / scene.designHeight).toFixed(3)}</Text>
        </>
      )}
      <Text style={styles.inspInfo}>{spots.length} spots ({tier}) · borda roxa = área de toque · vermelha = fora do viewport</Text>
    </View>
  );
}

/* ── Simular partidas (dev): mostra variedade/repetição do baralho rotativo, sem tocar progresso ── */
const SIM_QTD = { facil: 6, medio: 4, dificil: 3 };
function SimuladorPartidas() {
  const [dif, setDif] = useState('facil');
  const [run, setRun] = useState(null);

  const simular = () => {
    const qtd = SIM_QTD[dif];
    let deck = criarDeckState();
    const games = [];
    const spotCount = {}, clusterCount = {};
    let totalAp = 0, repSpot = 0, repCluster = 0, semRepSeq = 0, maxSeq = 0;
    for (let g = 0; g < qtd; g++) {
      const r = planPartida({ rng: criarRng(9001 + g * 37 + dif.length), dificuldade: dif, deckState: deck });
      deck = r.deckState;
      const rounds = r.plano.map((p, idx) => {
        totalAp += 1;
        const sk = `${p.sceneId}:${p.spotId}`;
        const ck = `${p.sceneId}:${p.cluster}`;
        const repS = !!spotCount[sk];
        const repC = !!clusterCount[ck];
        if (repS) repSpot += 1; if (repC) repCluster += 1;
        spotCount[sk] = (spotCount[sk] || 0) + 1;
        clusterCount[ck] = (clusterCount[ck] || 0) + 1;
        if (repS) semRepSeq = 0; else { semRepSeq += 1; maxSeq = Math.max(maxSeq, semRepSeq); }
        const key = `${p.sceneId}::${dif}`;
        const restam = deck.decks[key] ? deck.decks[key].restantes.length : 0;
        return { g: g + 1, r: idx + 1, sceneId: p.sceneId, spotId: p.spotId, cluster: p.cluster, zone: p.zone, tier: p.difficulty, repS, repC, restam };
      });
      games.push(rounds);
    }
    // cobertura = spots únicos / elegíveis totais no modo
    let elig = 0;
    for (const sc of OVELHA_SCENES) elig += sc.hidingSpots.filter((s) => spotElegivel(s, dif)).length;
    const uniqueSpots = Object.keys(spotCount).length;
    const uniqueClusters = Object.keys(clusterCount).length;
    setRun({
      games,
      resumo: { totalAp, uniqueSpots, uniqueClusters, repSpot, repCluster, maxSeq, cobertura: elig ? Math.round((uniqueSpots / elig) * 100) : 0, elig },
    });
  };

  return (
    <View style={styles.insp}>
      <Text style={styles.inspTit}>Simular partidas (dev)</Text>
      <View style={styles.inspRow}>
        {OVELHA_DIFFICULTIES.map((m) => (
          <Pressable key={m.id} onPress={() => { setDif(m.id); setRun(null); }} style={[styles.chip, dif === m.id && styles.chipSel]}>
            <Text style={[styles.chipTxt, dif === m.id && styles.chipTxtSel]}>{m.label} ×{SIM_QTD[m.id]}</Text>
          </Pressable>
        ))}
        <Pressable onPress={simular} style={[styles.chip, styles.chipGo]}><Text style={[styles.chipTxt, styles.chipTxtSel]}>Simular</Text></Pressable>
      </View>
      {run && (
        <>
          {run.games.map((rounds, gi) => (
            <View key={gi} style={styles.simGame}>
              <Text style={styles.simGameTit}>Partida {gi + 1}</Text>
              {rounds.map((rd) => (
                <Text key={`${rd.g}-${rd.r}`} style={[styles.simRow, (rd.repS || rd.repC) && styles.simRep]}>
                  {rd.r}. {rd.sceneId.split('_')[0]} · {rd.spotId} · {rd.cluster} · {rd.zone} · {rd.tier} · restam {rd.restam}
                  {rd.repS ? '  ↺SPOT' : ''}{rd.repC ? '  ↺GRUPO' : ''}
                </Text>
              ))}
            </View>
          ))}
          <View style={styles.simResumo}>
            <Text style={styles.simResumoTxt}>aparições {run.resumo.totalAp} · spots únicos {run.resumo.uniqueSpots} · grupos únicos {run.resumo.uniqueClusters}</Text>
            <Text style={styles.simResumoTxt}>repetições de spot {run.resumo.repSpot} · repetições de grupo {run.resumo.repCluster}</Text>
            <Text style={styles.simResumoTxt}>maior sequência sem repetir {run.resumo.maxSeq} · cobertura {run.resumo.cobertura}% ({run.resumo.uniqueSpots}/{run.resumo.elig})</Text>
          </View>
        </>
      )}
      <Text style={styles.inspInfo}>Simula {SIM_QTD[dif]} partidas seguidas consumindo o baralho rotativo. Não consome rodada, não salva progresso.</Text>
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
        <SpotInspector />
        <SimuladorPartidas />
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
  // Inspetor de esconderijos + Simulador (dev)
  insp: { backgroundColor: '#FFF', borderRadius: radii.lg, padding: 10, ...shadows.soft, gap: 6 },
  inspTit: { fontFamily: 'FredokaOne', fontSize: 14, color: pt.text },
  inspRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  inspCena: { flex: 1, textAlign: 'center', fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text },
  inspPalco: { alignItems: 'center', marginVertical: 4 },
  inspInfo: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.textSoft },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#EEF2F6', borderWidth: 1, borderColor: '#D5DEE8' },
  chipSel: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipGo: { backgroundColor: '#0E7A50', borderColor: '#0E7A50' },
  chipTxt: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#334155' },
  chipTxtSel: { color: '#FFF' },
  miniBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2F6', borderWidth: 1, borderColor: '#D5DEE8' },
  miniTxt: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, lineHeight: 20 },
  simGame: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#EEF2F6', paddingTop: 4 },
  simGameTit: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '900', color: pt.text },
  simRow: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '700', color: pt.textSoft, marginTop: 1 },
  simRep: { color: '#C0392B', fontWeight: '900' },
  simResumo: { marginTop: 8, backgroundColor: '#F1F5F9', borderRadius: 10, padding: 8, gap: 2 },
  simResumoTxt: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: '#334155' },
});
