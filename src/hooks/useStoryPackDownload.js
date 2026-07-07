/**
 * useStoryPackDownload — hook de DOWNLOAD de pack por história (Fase 2B).
 *
 * ENCAPSULA o runtime de packs (`usePacks` + `packDownloadService`) atrás de um hook, para que
 * a TELA (StoryDetail) NUNCA importe `usePacks`/`packDownloadService` diretamente — preservando
 * o guardrail de arquitetura (nenhuma `src/screens/*` importa camada `pack*`).
 *
 * Expõe um estado de UI simples: 'not_downloaded' | 'downloading' | 'ready' | 'error', progresso
 * 0..1, e as ações download()/retry(). Baixa TODOS os kinds (cover/scene/coloring/audio) para que
 * a história premium fique 100% offline (Narration + Coloring + Livrinho). Read-only quanto a
 * progresso/acesso/compras; NÃO altera entitlement. O gate de acesso (premium-active) é da TELA.
 */
import { useCallback, useRef, useState } from 'react';
import { usePacks } from '../context/PacksContext';
import { downloadStoryPackScenesFromGlobalManifest } from '../services/packDownloadService';

const GLOBAL_MANIFEST_URL = process.env.EXPO_PUBLIC_GLOBAL_MANIFEST_URL || null;
const REQUESTED_KINDS = ['cover', 'scene', 'coloring', 'audio'];

function reasonToError(res) {
  if (!res) return 'error';
  if (res.requiresAppUpdate) return 'app_update';
  if (res.networkError) return 'network';
  if (/insufficient_space|espa[çc]o/i.test(res.reason || '')) return 'insufficient_space';
  return res.reason || 'error';
}

export function useStoryPackDownload(storyId, options = {}) {
  const appVersion = options.appVersion || '1.0.0';
  const { getStoryPackState, refreshPacks } = usePacks();
  const packState = getStoryPackState(storyId); // { layer, status, ready, ... } — reconciliado
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [error, setError] = useState(null);
  const busyRef = useRef(false);

  const download = useCallback(async () => {
    if (busyRef.current || !storyId) return { ok: false };
    if (!GLOBAL_MANIFEST_URL) { setError('config'); return { ok: false }; }
    busyRef.current = true;
    setError(null);
    setProgress(0);
    setDownloading(true);
    let res;
    try {
      res = await downloadStoryPackScenesFromGlobalManifest({
        storyId,
        globalManifestUrl: GLOBAL_MANIFEST_URL,
        appVersion,
        requestedKinds: REQUESTED_KINDS,
        onProgress: (p) => {
          const total = p && p.totalBytes;
          const done = p && p.downloadedBytes;
          if (total > 0 && Number.isFinite(done)) {
            setProgress(Math.max(0, Math.min(1, done / total)));
          }
        },
      });
    } catch (e) {
      res = { ok: false, reason: String((e && e.message) || e) };
    }
    setDownloading(false);
    busyRef.current = false;
    if (res && res.ok) {
      setProgress(1);
      try { await refreshPacks(); } catch { /* índice recarrega no próximo foco */ }
      return { ok: true };
    }
    setError(reasonToError(res));
    return { ok: false };
  }, [storyId, appVersion, refreshPacks]);

  // Estado de UI derivado (a TELA renderiza a partir daqui).
  const uiState = downloading
    ? 'downloading'
    : error
      ? 'error'
      : packState.ready
        ? 'ready'
        : 'not_downloaded';

  return {
    uiState,
    progress,
    error,
    download,
    retry: download,
    isRemote: packState.layer === 'remote',
    isReady: !!packState.ready,
    configMissing: !GLOBAL_MANIFEST_URL,
  };
}
