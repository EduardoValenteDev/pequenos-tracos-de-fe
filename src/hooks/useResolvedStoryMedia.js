/**
 * useResolvedStoryMedia.js — Hooks de resolução de mídia com consumo do runtime de packs
 * (Fase 2, F2.1f — PRIMEIRO consumo visual, em sandbox controlado).
 *
 * Encapsula `usePacks` (estado do pack) + `contentResolver` (decisão de origem) atrás de
 * um hook, para que a TELA nunca importe o runtime diretamente. Escopo mínimo: apenas a
 * IMAGEM DE CENA, e apenas para a história sandbox `david_goliath`.
 *
 * ⚠️ READ-ONLY: não baixa, não instala, não grava índice/AsyncStorage, não toca
 * progresso/acesso/compras. Nunca lança.
 */
import { usePacks } from '../context/PacksContext';
import { resolveStoryScene } from '../services/contentResolver';
import { getOfficialSceneIllustration } from '../services/storyImageService';

/** Única história com consumo visual do resolver de packs neste bloco (sandbox técnico). */
export const SANDBOX_STORY_ID = 'david_goliath';

/**
 * useResolvedSceneImage — `source` da IMAGEM DE CENA (Estado A do StorySceneVisual).
 *
 * - Qualquer história ≠ sandbox → caminho ANTIGO intacto (`getOfficialSceneIllustration`),
 *   sem tocar packs. Comportamento idêntico ao de antes do F2.1f.
 * - `david_goliath`:
 *     • sem pack `ready` (estado real com índice vazio) → require local IDÊNTICO ao antigo;
 *     • pack `ready` (sandbox) → `{ uri: 'file://…' }` vindo do resolver.
 *
 * @param {string} storyId
 * @param {number} sceneId  cena.id (1..N) — a MESMA chave usada pela tela hoje
 * @returns {*} source de <Image> (require OU { uri }) ou null
 */
export function useResolvedSceneImage(storyId, sceneId) {
  const { getPackEntry } = usePacks(); // hook chamado SEMPRE (regras do React)

  // Histórias não-sandbox: fluxo antigo, sem packs (byte-a-byte igual ao anterior).
  if (storyId !== SANDBOX_STORY_ID) {
    return getOfficialSceneIllustration(storyId, sceneId);
  }

  // Sandbox: o resolver devolve require (fallback local) OU { uri } (pack ready).
  // Com índice vazio, getPackEntry(...) = null → fallback = getOfficialSceneIllustration
  // (idêntico ao antigo). O consumidor usa `source` diretamente em <Image>.
  const resolved = resolveStoryScene(storyId, sceneId, getPackEntry(storyId));
  return resolved.source;
}
