/**
 * coloring60LabService.js — BANCADA DE ENCENAÇÃO do Colorir 60 de "A Criação" (§Parte 12).
 *
 * POR QUE EXISTE: os três momentos que mais importam (0→1, 1→2 e a grande conclusão 2→3) só
 * aparecem UMA vez cada, na PRIMEIRA conclusão de cada parte. Sem uma forma de reencenar, validar
 * qualquer ajuste exigiria desinstalar o app — e no primeiro teste físico o fundador só conseguiu
 * ver os fluxos de reedição (UPDATE), porque as três atividades já estavam concluídas. Este módulo
 * devolve o estado a 0/3, 1/3, 2/3 ou 3/3 para que cada momento seja alcançável quantas vezes for
 * preciso, em ordem, no aparelho real.
 *
 * ⚠️ FERRAMENTA DE DESENVOLVIMENTO — NUNCA EM PRODUÇÃO. Todo ponto de entrada checa
 * `isColoring60LabAllowed()` (build de desenvolvimento **e** Modo Criador ligado) e vira NO-OP
 * silencioso fora disso. A rota da tela ainda é registrada apenas sob `isInternalToolsEnabled()`:
 * em produção a ferramenta não existe, não aparece e não é alcançável.
 *
 * ESCOPO CIRÚRGICO DO RESET (invariante que este arquivo NUNCA pode quebrar):
 *   - As chaves afetadas são CALCULADAS a partir do catálogo fechado do Colorir 60 de `creation` —
 *     uma lista finita e explícita, nunca uma varredura de armazenamento.
 *   - NÃO existe `AsyncStorage.clear()`, `getAllKeys()` nem remoção por prefixo aberto. Portanto é
 *     impossível, por construção, atingir onboarding, perfil, avatar, plano, packs, downloads,
 *     estrelas, conquistas, Livrinho, Ateliê, o colorir legado por cena ou o progresso de QUALQUER
 *     outra história — inclusive as demais partes de "A Criação" que não estejam no catálogo.
 *   - Conclusão é sempre escrita/removida pela API pública de `coloring60ActivityService` (a mesma
 *     que o app usa): a bancada não inventa formato de chave de conclusão.
 *
 * PIXELS — por que a chave é montada aqui: o writer de pixels (`coloring60DrawingStorage`) tem UM
 * único chamador autorizado por invariante arquitetural provado no smoke — o `ColoringScreen`.
 * Importá-lo aqui quebraria esse isolamento. Então a bancada apenas REMOVE o ponteiro das artes
 * daquelas três identidades, montando a chave a partir do MESMO literal do writer; o smoke prova
 * que os dois literais continuam idênticos (drift reprova o gate). É remoção de ponteiro: o
 * arquivo de imagem em disco é órfão e será sobrescrito no próximo salvamento — aceitável numa
 * bancada de desenvolvimento e, ainda assim, restrito às três identidades do piloto.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  markColoring60ActivityDone,
  loadColoring60Done,
  clearColoring60Done,
} from './coloring60ActivityService';
import { getColoring60Activities } from '../data/coloring60Catalog';
import { isCreatorQaModeEnabled } from './creatorQaMode';

/** História do piloto. A bancada NÃO opera em nenhuma outra. */
export const COLORING60_LAB_STORY_ID = 'creation';

/**
 * Prefixo do PONTEIRO de arte do Colorir 60 — espelho literal do writer
 * (`@ptf_drawing60_s<storyId>_a<activityId>`). Não é uma segunda fonte de verdade: o smoke compara
 * este literal com o do writer e reprova se divergirem.
 */
const C60_DRAWING_KEY_PREFIX = '@ptf_drawing60_s';

function drawingPointerKey(storyId, activityId) {
  return `${C60_DRAWING_KEY_PREFIX}${storyId}_a${activityId}`;
}

/**
 * isColoring60LabAllowed() — DUPLO gate exigido: build de desenvolvimento **E** Modo Criador ligado.
 * O `__DEV__` sozinho não basta (o app roda em Dev Client no aparelho do fundador com o Modo Criador
 * desligado durante testes de plano); o Modo Criador sozinho também não. Fora disso, tudo é no-op.
 */
export function isColoring60LabAllowed() {
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev && isCreatorQaModeEnabled() === true;
}

/** Ids das três partes, na ordem canônica do catálogo fechado. */
export function coloring60LabActivityIds() {
  return getColoring60Activities(COLORING60_LAB_STORY_ID).map((a) => a.activityId);
}

/**
 * readColoring60LabState() — retrato ATUAL da conclusão das três partes (`{ [activityId]: bool }`).
 * Só lê. Fora do ambiente permitido devolve um retrato vazio sem tocar em armazenamento.
 */
export async function readColoring60LabState() {
  if (!isColoring60LabAllowed()) return {};
  const ids = coloring60LabActivityIds();
  const map = {};
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop -- três leituras pontuais numa tela de bancada.
    map[id] = (await loadColoring60Done(COLORING60_LAB_STORY_ID, id)) === true;
  }
  return map;
}

/**
 * setColoring60LabProgress(count) — deixa EXATAMENTE as `count` primeiras partes concluídas (na
 * ordem canônica) e as demais não concluídas. É o que torna cada momento alcançável:
 *   0 → a próxima conclusão encena "0 para 1";
 *   1 → encena "1 para 2";
 *   2 → a próxima conclusão é a GRANDE CONCLUSÃO (2 para 3);
 *   3 → tudo concluído: encena os fluxos de reedição (UPDATE) e a coleção.
 * Não mexe em pixels: a arte já pintada continua lá, e é justamente isso que permite reencenar a
 * primeira conclusão rapidamente. Devolve o novo retrato.
 */
export async function setColoring60LabProgress(count) {
  if (!isColoring60LabAllowed()) return {};
  const ids = coloring60LabActivityIds();
  const target = Math.max(0, Math.min(ids.length, Number.isFinite(count) ? Math.trunc(count) : 0));
  for (let i = 0; i < ids.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- ordem importa: o retrato final precisa ser exato.
    if (i < target) await markColoring60ActivityDone(COLORING60_LAB_STORY_ID, ids[i]);
    // eslint-disable-next-line no-await-in-loop
    else await clearColoring60Done(COLORING60_LAB_STORY_ID, ids[i]);
  }
  return readColoring60LabState();
}

/**
 * prepareColoring60LabUpdate(activityId) — garante que a parte indicada esteja CONCLUÍDA antes de
 * abri-la, para que salvar ali caia no fluxo de REEDIÇÃO (UPDATE) e não numa primeira conclusão.
 * Não altera as outras partes: é assim que se testa "reedição com progresso incompleto" (§Parte 6)
 * separadamente de "reedição com tudo concluído" (§Parte 7).
 */
export async function prepareColoring60LabUpdate(activityId) {
  if (!isColoring60LabAllowed()) return false;
  if (coloring60LabActivityIds().indexOf(activityId) < 0) return false;
  return markColoring60ActivityDone(COLORING60_LAB_STORY_ID, activityId);
}

/**
 * clearColoring60Lab() — apaga SÓ o Colorir 60 de "A Criação": as três conclusões e os três
 * ponteiros de arte. Nada mais. As chaves são as três do catálogo, uma a uma — nenhuma varredura,
 * nenhum prefixo aberto, nenhuma chave de outra camada. Devolve o retrato final (tudo falso).
 */
export async function clearColoring60Lab() {
  if (!isColoring60LabAllowed()) return {};
  const ids = coloring60LabActivityIds();
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop -- três remoções pontuais numa tela de bancada.
    await clearColoring60Done(COLORING60_LAB_STORY_ID, id);
  }
  try {
    await AsyncStorage.multiRemove(ids.map((id) => drawingPointerKey(COLORING60_LAB_STORY_ID, id)));
  } catch {
    // Falhar ao limpar ponteiro de arte NUNCA invalida o reset de conclusão (que é o que encena os
    // momentos). A bancada segue devolvendo o retrato real do que ficou.
  }
  return readColoring60LabState();
}
