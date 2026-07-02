/**
 * BeniGuideAudio — player HEADLESS (sem UI) da voz do Beni no guia (UX 2.4).
 *
 * O AudioPlayer.js existente é um CONTROLE VISÍVEL de narração (toca por toque,
 * com botão/progresso) — incompatível com a voz automática do guia. Este wrapper
 * mínimo reusa o MESMO motor (expo-audio, já no projeto — sem pacote novo):
 *   - toca automaticamente assim que o asset CARREGA;
 *   - PARA ao desmontar (troca de etapa / pular / concluir);
 *   - pausa a música durante a fala (onNarrationStart/End), como a narração.
 *
 * Confiabilidade (Perfil 1.1): a 1ª fala agora espera `status.isLoaded` antes de
 * tocar. Antes o play() saía no mount/retry mesmo sem o asset carregado (áudio
 * frio — ex.: arquivos maiores do Perfil) → no-op silencioso, exigindo Voltar/
 * Próximo para a fala sair. Esperar o load torna o 1º play determinístico para
 * TODOS os guias. O retry curto fica como rede de segurança.
 *
 * Não renderiza nada. Sem asset → não monta o player (null-safe).
 */
import { useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { onNarrationStart, onNarrationEnd, ensureAudioMode } from '../services/audioManager';
import { log } from '../utils/logger';

const RETRY_MS = 220; // UX 2.4.4: 2ª tentativa curta se a 1ª não iniciou (race do player)

function GuideAudioInner({ audioAsset }) {
  const player = useAudioPlayer(audioAsset, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const startedRef = useRef(false);
  // V1 — garante o audio mode (playsInSilentMode) ANTES de tocar. Idempotente: a 1ª
  // fala do tour não fica muda no iPhone em modo silencioso; chamadas seguintes são
  // no-op (audioModeReady). Não silencia a narração (caminho separado do AudioPlayer).
  const safePlay = () => { ensureAudioMode(); try { player.play(); } catch { /* segue só visual */ } };

  // PRIMÁRIO: toca assim que o asset está carregado (determinístico, sem fala muda).
  useEffect(() => {
    if (!status.isLoaded || startedRef.current) return;
    startedRef.current = true;
    safePlay();
    onNarrationStart();
    if (typeof __DEV__ !== 'undefined' && __DEV__) log('[BeniGuideAudio] play (asset carregado)');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.isLoaded]);

  // RETRY automático único (rede de segurança) + PARA no unmount. Se em RETRY_MS
  // ainda não estiver tocando, tenta de novo — sem marcar started (deixa o efeito
  // de isLoaded assumir). Nunca avança o card por causa do áudio.
  useEffect(() => {
    ensureAudioMode(); // V1: no mount, aquece o audio mode (async) antes do 1º play
    const retry = setTimeout(() => {
      let playing = false;
      try { playing = !!player.playing; } catch { playing = false; }
      if (!playing && !startedRef.current) {
        safePlay();
        if (typeof __DEV__ !== 'undefined' && __DEV__) log('[BeniGuideAudio] retry play()');
      }
    }, RETRY_MS);
    return () => {
      clearTimeout(retry);
      try { player.pause(); } catch { /* ignora */ }
      onNarrationEnd();
    };
    // monta → toca quando carregar (com retry); desmonta → para.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function BeniGuideAudio({ audioAsset }) {
  if (!audioAsset) return null;
  return <GuideAudioInner audioAsset={audioAsset} />;
}
