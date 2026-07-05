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
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { usePacks } from '../context/PacksContext';
import { resolveStoryScene, resolveStoryColoring, RESOLVE_SOURCE_TYPE } from '../services/contentResolver';
import { getOfficialSceneIllustration } from '../services/storyImageService';
import { getColoringImage } from '../assets/coloringImages';

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

/**
 * useResolvedColoringImage — `source` da PÁGINA DE COLORIR (lineart) para o ColoringScreen
 * (Fase 2, F2.4e.3 — primeiro consumo user-facing de coloring remoto).
 *
 * - **Fallback local SEMPRE:** qualquer história ≠ sandbox, OU david_goliath sem pack `ready`,
 *   OU arquivo remoto ausente → retorna o require local ATUAL (`getColoringImage(story.id,
 *   cena.id)`) — byte-a-byte idêntico ao comportamento de antes (A Criação/Noé/demais intactas).
 * - **Remoto file:// só quando TODAS as condições valem:** `story.id === 'david_goliath'` E o
 *   pack está `ready` (índice local — os arquivos foram validados por bytes+sha256 no download) E
 *   o arquivo de colorir da cena EXISTE no disco (checagem leve `getInfoAsync`, FORA do render).
 *
 * READ-ONLY: NÃO baixa, NÃO calcula sha256, NÃO grava índice, NÃO faz leitura pesada em render.
 * O `{ uri }` é resolvido em estado (referência estável) e é resetado ao trocar de cena/pack —
 * nunca aponta para um `file://` antigo após um reset.
 *
 * @param {object} story       objeto da história (com `id` e `cenas`)
 * @param {number} cenaIndex   índice 0-based da cena (posição = cenaIndex+1)
 * @returns {*} source de imagem para o canvas: require local (fallback) OU { uri: 'file://…' }
 */
export function useResolvedColoringImage(story, cenaIndex) {
  const { getPackEntry } = usePacks(); // hook chamado SEMPRE (regras do React)
  const [remoteSource, setRemoteSource] = useState(null);

  const storyId = story && story.id;
  const cena = story && Array.isArray(story.cenas) ? story.cenas[cenaIndex] : null;
  // Fallback local ATUAL — a mesma fonte que a tela usava antes (nunca muda p/ outras histórias).
  const localSource = cena ? getColoringImage(storyId, cena.id) : null;

  // Candidato remoto: só existe quando david_goliath + pack ready → file:// do resolver
  // (mesma convenção de path das cenas). sceneNumber = posição (cenaIndex+1).
  const sceneNumber = Number.isInteger(cenaIndex) ? cenaIndex + 1 : 0;
  const packEntry = storyId === SANDBOX_STORY_ID ? getPackEntry(storyId) : null;
  let candidateUri = null;
  if (storyId === SANDBOX_STORY_ID && sceneNumber > 0) {
    const r = resolveStoryColoring(storyId, sceneNumber, packEntry);
    candidateUri = r.sourceType === RESOLVE_SOURCE_TYPE.FILE && r.source ? r.source.uri : null;
  }

  // Existência confirmada FORA do render (nunca aponta p/ arquivo ausente → evita canvas de erro).
  // candidateUri é string estável enquanto pack/cena não mudam → efeito não re-dispara à toa.
  useEffect(() => {
    let cancelled = false;
    setRemoteSource(null); // reset ao trocar cena/pack: garante fallback até confirmar de novo
    if (!candidateUri) return () => { cancelled = true; };
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(candidateUri); // leve (metadata), sem hash
        if (!cancelled && info && info.exists) setRemoteSource({ uri: candidateUri });
      } catch { /* mantém fallback local */ }
    })();
    return () => { cancelled = true; };
  }, [candidateUri]);

  return remoteSource || localSource;
}
