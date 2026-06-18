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

function GuideAudioInner({ audioAsset }) {
  const player = useAudioPlayer(audioAsset, { updateInterval: 300 });
  useEffect(() => {
    try { player.play(); } catch { /* ignora — guia segue só visual */ }
    onNarrationStart();
    return () => {
      try { player.pause(); } catch { /* ignora */ }
      onNarrationEnd();
    };
    // monta → toca; desmonta → para. (player estável para o asset montado)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function BeniGuideAudio({ audioAsset }) {
  if (!audioAsset) return null;
  return <GuideAudioInner audioAsset={audioAsset} />;
}
