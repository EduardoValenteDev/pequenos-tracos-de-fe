/**
 * useResolvedStoryMedia.js — Hooks de resolução de mídia com consumo do runtime de packs
 * (Fase 2, F2.1f — PRIMEIRO consumo visual, em sandbox controlado).
 *
 * Encapsula `usePacks` (estado do pack) + `contentResolver` (decisão de origem) atrás de
 * um hook, para que a TELA nunca importe o runtime diretamente. Consumo remoto (cover/scene/
 * coloring/audio) habilitado para as histórias da camada `remote` (F2.5c — as 18 premium),
 * com FALLBACK LOCAL obrigatório. `creation`/`noah` (`starter`) seguem sempre locais.
 *
 * ⚠️ READ-ONLY: não baixa, não instala, não grava índice/AsyncStorage, não toca
 * progresso/acesso/compras. Nunca lança.
 */
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { usePacks } from '../context/PacksContext';
import { resolveStoryScene, resolveStoryCover, resolveStoryAudio, RESOLVE_SOURCE_TYPE } from '../services/contentResolver';
import { getOfficialSceneIllustration } from '../services/storyImageService';
import { getContentLayer, CONTENT_LAYERS } from '../data/contentManifest';

/**
 * SANDBOX_STORY_ID — mantido por COMPATIBILIDADE (piloto/QA e referências existentes).
 * O consumo remoto NÃO é mais limitado a ele: agora é gated pela CAMADA de conteúdo.
 */
export const SANDBOX_STORY_ID = 'david_goliath';

/**
 * isRemotePackStory — TRUE se a história é da camada `remote` (as 18 premium) e, portanto,
 * ELEGÍVEL a consumir um pack instalado (F2.5c). `creation`/`noah` são `starter` → sempre
 * local. Fonte única: `contentManifest.STORY_CONTENT_LAYER` (sem hardcode). Nunca lança.
 * Nota: consumir só faz efeito quando o pack está `ready`; sem pack → fallback local.
 */
export function isRemotePackStory(storyId) {
  return getContentLayer(storyId) === CONTENT_LAYERS.REMOTE;
}

// [P3J] REMOVIDO: `resolveRemoteColoringUri`. Resolvia o lineart legado por cena vindo de um pack
// baixado, e servia exclusivamente ao Livrinho no modo "colorido" e ao Colorir legado — ambos
// aposentados. Sem consumidor, seria só um caminho de código que ninguém percorre. O Colorir com o
// Beni não passa por aqui: tem fonte estática própria (`coloring60LocalAssets`).
// Cena, capa e áudio remotos continuam inteiros logo abaixo — nada de packs foi enfraquecido.

/**
 * resolveRemoteAudioSource — fonte de áudio remota ({ uri: 'file://…' }) SÓ p/ `remote` + pack
 * `ready` e válido; senão `null` (fallback local). PURO, não-hook, read-only (Fase 2B).
 */
export function resolveRemoteAudioSource(storyId, sceneNumber, packEntry) {
  if (!isRemotePackStory(storyId) || !packEntry) return null;
  const r = resolveStoryAudio(storyId, sceneNumber, packEntry);
  return r.sourceType === RESOLVE_SOURCE_TYPE.FILE && r.source ? r.source : null;
}

/**
 * useResolvedSceneImage — `source` da IMAGEM DE CENA (Estado A do StorySceneVisual).
 *
 * FALLBACK-FIRST + pré-checagem de existência (F2.5-hardening-1 C2), espelhando o colorir:
 * - starter (creation/noah) OU premium sem pack `ready` → require local (idêntico ao anterior).
 * - premium (camada `remote`) com pack `ready` E arquivo existente (getInfoAsync FORA do render)
 *   → `{ uri: 'file://…' }`. O `{ uri }` só é usado quando `remoteSource.uri === candidateUri`
 *   ATUAL (anti-race: mesmo antes do efeito limpar o estado, uma troca rápida de cena NUNCA
 *   reaproveita o file:// da cena anterior). Sem pack/arquivo → require imediato.
 *
 * READ-ONLY: não baixa, não grava índice, sem leitura pesada em render. Nunca lança.
 *
 * @param {string} storyId
 * @param {number} sceneId  cena.id (1..N) — a MESMA chave usada pela tela hoje
 * @returns {*} source de <Image> (require OU { uri }) ou null
 */
export function useResolvedSceneImage(storyId, sceneId) {
  const { getPackEntry } = usePacks(); // hook chamado SEMPRE (regras do React)
  const [remoteSource, setRemoteSource] = useState(null);

  // Fallback local ATUAL (require) — inalterado p/ creation/noah e p/ premium sem pack ready.
  const localSource = getOfficialSceneIllustration(storyId, sceneId);

  // Candidato remoto: só camada `remote` + pack ready → file:// (mesma chave cena.id de hoje).
  const packEntry = isRemotePackStory(storyId) ? getPackEntry(storyId) : null;
  let candidateUri = null;
  if (isRemotePackStory(storyId) && sceneId) {
    const r = resolveStoryScene(storyId, sceneId, packEntry);
    candidateUri = r.sourceType === RESOLVE_SOURCE_TYPE.FILE && r.source ? r.source.uri : null;
  }

  // Existência confirmada FORA do render; race-safe (cancelled): resultado async antigo NUNCA
  // promove a cena anterior. Dep principal = candidateUri (string estável).
  useEffect(() => {
    let cancelled = false;
    setRemoteSource(null); // reset ao trocar cena/pack → fallback local até reconfirmar
    if (!candidateUri) return () => { cancelled = true; };
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(candidateUri); // leve (metadata), sem hash
        if (!cancelled && info && info.exists) setRemoteSource({ uri: candidateUri });
      } catch { /* mantém fallback local */ }
    })();
    return () => { cancelled = true; };
  }, [candidateUri]);

  // Anti-race adicional (F2.5-hardening-1): mesmo antes de o efeito limpar o estado antigo, um
  // render intermediário só usa o remoto quando sua uri === candidateUri ATUAL — senão fallback
  // local imediato. Fecha a janela entre a troca de cena e a limpeza do useEffect.
  const safeRemoteSource =
    remoteSource && candidateUri && remoteSource.uri === candidateUri ? remoteSource : null;
  return safeRemoteSource || localSource;
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
  if (!isRemotePackStory(storyId)) {
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
  return isRemotePackStory(storyId) ? getPackEntry(storyId) : null;
}

// [P3J] REMOVIDO: `useResolvedColoringImage`. Era o hook que entregava o lineart por cena ao
// Colorir legado — fallback local (`getColoringImage`) com promoção a `file://` quando havia pack
// baixado. Com a atividade aposentada, ele não tinha mais tela para servir, e seu fallback local
// era o único motivo pelo qual os 199 linearts precisavam continuar no bundle.
//
// O Colorir com o Beni NÃO usava este hook e não usa agora: as três atividades de "A Criação" vêm
// de `coloring60LocalAssets` (require estático próprio), sem packs e sem resolvedor remoto. Os
// hooks de cena, capa e áudio abaixo seguem intactos.

/**
 * useResolvedStoryCover — `source` da CAPA da história (16:9) para superfícies user-facing
 * (Fase 2, F2.4e.4). Mesma estratégia do coloring (F2.4e.3): FALLBACK LOCAL sempre; remoto
 * `{ uri: file:// }` só p/ david_goliath + pack `ready` (resolveStoryCover sourceType FILE) +
 * arquivo EXISTENTE (checagem leve `getInfoAsync` FORA do render).
 *
 * O `localSource` é passado pela superfície (o registro local que ela já usa — `getStoryCover`,
 * `images[imagemCapa]`, …), então o hook NÃO se acopla a nenhum registro específico e serve a
 * qualquer tela/card. READ-ONLY: não baixa, não calcula sha256, sem leitura pesada em render.
 * Reseta ao trocar história/pack — nunca aponta para um `file://` antigo após um reset.
 *
 * @param {string} storyId
 * @param {*} localSource  fonte de capa LOCAL atual da superfície (require OU null)
 * @returns {*} source de <Image>: local (fallback) OU { uri: 'file://…' }
 */
export function useResolvedStoryCover(storyId, localSource) {
  const { getPackEntry } = usePacks(); // hook chamado SEMPRE (regras do React)
  const [remoteSource, setRemoteSource] = useState(null);

  const packEntry = isRemotePackStory(storyId) ? getPackEntry(storyId) : null;
  let candidateUri = null;
  if (isRemotePackStory(storyId)) {
    const r = resolveStoryCover(storyId, packEntry);
    candidateUri = r.sourceType === RESOLVE_SOURCE_TYPE.FILE && r.source ? r.source.uri : null;
  }

  useEffect(() => {
    let cancelled = false;
    setRemoteSource(null); // reset ao trocar história/pack: fallback local até reconfirmar
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

/**
 * useResolvedStoryAudio — `source` do ÁUDIO de narração de uma cena para o AudioPlayer
 * (expo-audio) — Fase 2, F2.4e.5. Mesma estratégia de coloring/cover: FALLBACK LOCAL sempre;
 * remoto `{ uri: file:// }` só p/ david_goliath + pack `ready` (resolveStoryAudio sourceType
 * FILE) + arquivo EXISTENTE (checagem leve `getInfoAsync` FORA do render).
 *
 * `useAudioPlayer` (expo-audio) aceita nativamente `{ uri }` além de require — SEM pipeline
 * novo. O `localAudioAsset` (require do bundle) é passado pela superfície; o hook não se acopla
 * ao audioService. READ-ONLY: não baixa, não calcula sha256, sem leitura pesada em render.
 * Retorno é referência ESTÁVEL (state) → o player não reinicializa à toa; reseta ao trocar
 * cena/pack (nunca aponta para um `file://` antigo após reset). Não altera play/pause/autoplay/
 * cleanup — apenas a FONTE.
 *
 * @param {string} storyId
 * @param {number} sceneNumber  posição da cena (1..N)
 * @param {*} localAudioAsset   áudio LOCAL atual (require) OU null
 * @returns {*} source do player: local (fallback) OU { uri: 'file://…' }
 */
export function useResolvedStoryAudio(storyId, sceneNumber, localAudioAsset) {
  const { getPackEntry } = usePacks(); // hook chamado SEMPRE (regras do React)
  const [remoteSource, setRemoteSource] = useState(null);

  const n = Number.isInteger(sceneNumber) ? sceneNumber : 0;
  const packEntry = isRemotePackStory(storyId) ? getPackEntry(storyId) : null;
  let candidateUri = null;
  if (isRemotePackStory(storyId) && n > 0) {
    const r = resolveStoryAudio(storyId, n, packEntry);
    candidateUri = r.sourceType === RESOLVE_SOURCE_TYPE.FILE && r.source ? r.source.uri : null;
  }

  useEffect(() => {
    let cancelled = false;
    setRemoteSource(null); // reset ao trocar cena/pack: fallback local até reconfirmar
    if (!candidateUri) return () => { cancelled = true; };
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(candidateUri); // leve (metadata), sem hash
        if (!cancelled && info && info.exists) setRemoteSource({ uri: candidateUri });
      } catch { /* mantém fallback local */ }
    })();
    return () => { cancelled = true; };
  }, [candidateUri]);

  return remoteSource || localAudioAsset;
}
