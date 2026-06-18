/**
 * BeniGuideAudio — player HEADLESS (sem UI) da voz do Beni no guia (UX 2.4).
 *
 * O AudioPlayer.js existente é um CONTROLE VISÍVEL de narração (toca por toque,
 * com botão/progresso) — incompatível com a voz automática do guia. Este wrapper
 * mínimo reusa o MESMO motor (expo-audio, já no projeto — sem pacote novo):
 *   - toca automaticamente ao montar;
 *   - PARA ao desmontar (troca de etapa / pular / concluir);
 *   - pausa a música durante a fala (onNarrationStart/End), como a narração.
 *
 * Não renderiza nada. Sem asset → não monta o player (null-safe).
 */
import { useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { onNarrationStart, onNarrationEnd } from '../services/audioManager';
import { log } from '../utils/logger';

const RETRY_MS = 220; // UX 2.4.4: 2ª tentativa curta se a 1ª não iniciou (race do player)

function GuideAudioInner({ audioAsset }) {
  const player = useAudioPlayer(audioAsset, { updateInterval: 250 });
  useEffect(() => {
    let cancelled = false;
    const safePlay = () => { try { player.play(); } catch { /* segue só visual */ } };
    safePlay();           // 1ª tentativa (mount)
    onNarrationStart();
    // RETRY automático único: se ainda não estiver tocando, tenta de novo. Sem
    // exigir Voltar/Próximo manual. Nunca avança o card por causa do áudio.
    const retry = setTimeout(() => {
      if (cancelled) return;
      let playing = false;
      try { playing = !!player.playing; } catch { playing = false; }
      if (!playing) {
        safePlay();
        if (typeof __DEV__ !== 'undefined' && __DEV__) log('[BeniGuideAudio] retry play()');
      }
    }, RETRY_MS);
    return () => {
      cancelled = true;
      clearTimeout(retry);
      try { player.pause(); } catch { /* ignora */ }
      onNarrationEnd();
    };
    // monta → toca (com retry); desmonta → para.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function BeniGuideAudio({ audioAsset }) {
  if (!audioAsset) return null;
  return <GuideAudioInner audioAsset={audioAsset} />;
}
