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

/**
 * resolveSceneImageForStory — versão PURA (não-hook) da resolução da imagem de cena
 * (F2.1h v2). Recebe o `packEntry` JÁ RESOLVIDO — para uso em FUNÇÕES PURAS / LOOPS
 * onde hooks não podem ser chamados (ex.: timeline do Livrinho na StoryBookScreen).
 *
 * Gated a `david_goliath`: outras histórias seguem `getOfficialSceneIllustration`
 * (caminho antigo, intacto). Com `packEntry` nulo (índice vazio) → require local idêntico.
 * Retorna SEMPRE um `source` de <Image> (require OU `{ uri }`), NUNCA o envelope do resolver.
 *
 * @param {string} storyId
 * @param {number} sceneId  cena.id (1..N)
 * @param {*} packEntry     CacheEntry do PacksContext (ou null)
 * @returns {*} source de <Image> (require OU { uri }) ou null
 */
export function resolveSceneImageForStory(storyId, sceneId, packEntry = null) {
  if (storyId !== SANDBOX_STORY_ID) {
    return getOfficialSceneIllustration(storyId, sceneId);
  }
  return resolveStoryScene(storyId, sceneId, packEntry).source;
}

/**
 * useSandboxScenePackEntry — devolve o VALOR do `packEntry` do sandbox (`david_goliath`),
 * ou `null` para qualquer outra história (F2.1h v2). Read-only.
 *
 * Retorna um VALOR (não um callback): com índice vazio é `null` (estável) — assim, usado
 * como dependência do `useMemo` do Livrinho, NÃO recompõe a timeline no load de packs
 * (`null === null`). A timeline só reconstrói quando o packEntry realmente muda.
 */
export function useSandboxScenePackEntry(storyId) {
  const { getPackEntry } = usePacks(); // hook chamado SEMPRE (regras do React)
  return storyId === SANDBOX_STORY_ID ? getPackEntry(storyId) : null;
}
