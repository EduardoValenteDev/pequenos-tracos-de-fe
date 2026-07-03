/**
 * coloringActivityService.js — Camada SEMÂNTICA de "atividade de colorir concluída"
 * por história (A0.10). Separa a CONCLUSÃO DA ATIVIDADE (booleano leve) do SALVAR
 * ARTE NA GALERIA (Plano Família): o Free precisa poder CONCLUIR o colorir das
 * histórias grátis mesmo que, no futuro, salvar arte na galeria seja bloqueado.
 *
 * Chave nova (leve, SEM imagem): @ptf_coloring_done_{storyId}_{sceneId} = 'true'.
 * Registrada ao tocar "Pronto" no colorir de história — vale mesmo sem galeria.
 *
 * "coloringComplete de uma história" = pelo menos UMA página concluída, via:
 *   1) chave nova @ptf_coloring_done_{storyId}_* (existência = concluído); OU
 *   2) COMPAT: desenho já salvo (@ptf_drawing_s{storyId}_c*) com tinta real.
 *
 * NÃO renomeia nem apaga chaves existentes. NÃO mexe no Ateliê livre nem na galeria.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasMeaningfulPaint } from './drawingStorage';

const DONE_PREFIX = '@ptf_coloring_done_';
const DRAWING_PREFIX = '@ptf_drawing_s';

/** Chave leve de atividade de colorir concluída, por cena. */
export function coloringActivityKey(storyId, sceneId) {
  return `${DONE_PREFIX}${storyId}_${sceneId}`;
}

/** Marca a atividade de colorir de UMA cena como concluída (booleano leve). */
export async function markStoryColoringActivityDone(storyId, sceneId) {
  try {
    await AsyncStorage.setItem(coloringActivityKey(storyId, sceneId), 'true');
  } catch { /* silencioso — nunca bloqueia o fluxo de colorir */ }
}

/**
 * Set dos storyIds com pelo menos UMA página de colorir concluída.
 * Fast path: chave nova (existência, sem ler valor). Compat: desenho com tinta real.
 * O casamento é por prefixo COMPLETO do storyId (`..._` / `..._c`), seguro para o
 * catálogo atual (nenhum storyId é prefixo de outro).
 */
export async function loadStoriesWithColoringDone(storyIds) {
  const result = new Set();
  const ids = Array.isArray(storyIds) ? storyIds : [];
  let keys;
  try { keys = await AsyncStorage.getAllKeys(); } catch { return result; }
  keys = keys || [];

  // 1) Fast path — chave nova de atividade (existência = concluído).
  for (const sid of ids) {
    if (keys.some((k) => k.startsWith(`${DONE_PREFIX}${sid}_`))) result.add(sid);
  }

  // 2) Compat — desenhos já salvos com tinta real (só para quem falta no set).
  const remaining = ids.filter((sid) => !result.has(sid));
  if (remaining.length) {
    const drawingKeys = keys.filter((k) => k.startsWith(DRAWING_PREFIX));
    for (const sid of remaining) {
      const mine = drawingKeys.filter((k) => k.startsWith(`${DRAWING_PREFIX}${sid}_c`));
      if (!mine.length) continue;
      try {
        const pairs = await AsyncStorage.multiGet(mine);
        if (pairs.some(([, v]) => hasMeaningfulPaint(v))) result.add(sid);
      } catch { /* ignora item — não derruba os demais */ }
    }
  }
  return result;
}

/** True se a história tem pelo menos UMA página de colorir concluída. */
export async function hasStoryColoringActivityDone(storyId) {
  const set = await loadStoriesWithColoringDone([storyId]);
  return set.has(storyId);
}
