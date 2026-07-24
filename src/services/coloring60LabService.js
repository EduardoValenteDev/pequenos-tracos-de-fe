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
 * SEEDS COM PINTURA DE VERDADE (C60 · Parte 6). Antes, "definir 2/3" escrevia apenas FLAGS: o
 * aparelho ficava em um estado que o app real nunca produz — concluído sem arte — e foi exatamente
 * assim que a bancada passou a MASCARAR os defeitos que deveria expor. Agora a bancada só marca uma
 * parte como concluída quando existe, no armazenamento, uma PINTURA REAL com instantâneo íntegro
 * daquela identidade: ela LÊ a arte guardada e a entrega como prova de cor. Sem arte, a bancada
 * RECUSA e diz o que falta ("pinte esta parte uma vez"). Nenhum estado impossível é fabricado.
 *
 * PIXELS — leitura sim, escrita jamais: `saveColoring60DrawingState` continua com UM único chamador
 * possível em todo o `src/` (o `ColoringScreen`), e o smoke prova isso separadamente. A bancada usa
 * apenas as APIs de LEITURA e de LIMPEZA do serviço de pixels — nunca cria arte.
 *
 * RESET — a bancada NÃO tem reset próprio: ela chama `resetCreationColoringJourney()`, a MESMA
 * função usada por "Gerenciar dados" na Área dos Pais. Era aqui que ficava a segunda lista de
 * chaves do piloto (que removia o ponteiro e deixava o ARQUIVO no disco); ela deixou de existir.
 */
import {
  markColoring60ActivityDone,
  loadColoring60Done,
  clearColoring60Done,
} from './coloring60ActivityService';
import {
  getColoring60SavedDrawing,
  hasColoring60SavedDrawing,
} from './coloring60DrawingStorage';
import { snapshotHasMeaningfulColor } from './coloring60PaintMetrics';
import { SNAPSHOT_STATUS } from './coloring60State';
import { resetCreationColoringJourney } from './coloring60ResetService';
import { getColoring60Activities } from '../data/coloring60Catalog';
import { isCreatorQaModeEnabled } from './creatorQaMode';

/** História do piloto. A bancada NÃO opera em nenhuma outra. */
export const COLORING60_LAB_STORY_ID = 'creation';

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
 * readColoring60LabArtMap() — quais partes têm PINTURA REAL guardada. É o que a bancada mostra ao
 * lado de cada estado: sem arte, o estado correspondente não pode ser semeado (e a tela explica).
 */
export async function readColoring60LabArtMap() {
  if (!isColoring60LabAllowed()) return {};
  const ids = coloring60LabActivityIds();
  const map = {};
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop -- três leituras pontuais numa tela de bancada.
    map[id] = (await hasColoring60SavedDrawing(COLORING60_LAB_STORY_ID, id)) === true;
  }
  return map;
}

/**
 * markLabActivityFromRealArt(activityId) — marca UMA parte como concluída usando a PINTURA REAL
 * guardada como prova de cor. Devolve `true` só quando existe arte íntegra e com cor suficiente:
 * flag sem pintura é exatamente o estado impossível que esta bancada não pode mais fabricar.
 */
async function markLabActivityFromRealArt(activityId) {
  const art = await getColoring60SavedDrawing(COLORING60_LAB_STORY_ID, activityId);
  if (!snapshotHasMeaningfulColor(art)) return false; // sem pintura real ⇒ não semeia
  return markColoring60ActivityDone(
    COLORING60_LAB_STORY_ID, activityId, art, SNAPSHOT_STATUS.READY,
  );
}

/**
 * setColoring60LabProgress(count) — deixa EXATAMENTE as `count` primeiras partes concluídas (na
 * ordem canônica) e as demais não concluídas. É o que torna cada momento alcançável:
 *   0 → a próxima conclusão encena "0 para 1";
 *   1 → encena "1 para 2";
 *   2 → a próxima conclusão é a GRANDE CONCLUSÃO (2 para 3);
 *   3 → tudo concluído: encena os fluxos de reedição (UPDATE) e a coleção.
 *
 * CONSISTÊNCIA (Parte 6): só marca o que TEM pintura real guardada. As partes sem arte ficam não
 * concluídas e voltam em `missingArt` — a bancada diz "pinte esta parte uma vez" em vez de fabricar
 * um "3 de 3" que o app real nunca produziria. Devolve `{ state, missingArt }`.
 */
export async function setColoring60LabProgress(count) {
  if (!isColoring60LabAllowed()) return { state: {}, missingArt: [] };
  const ids = coloring60LabActivityIds();
  const target = Math.max(0, Math.min(ids.length, Number.isFinite(count) ? Math.trunc(count) : 0));
  const missingArt = [];
  for (let i = 0; i < ids.length; i += 1) {
    if (i < target) {
      // eslint-disable-next-line no-await-in-loop -- ordem importa: o retrato final precisa ser exato.
      const marked = await markLabActivityFromRealArt(ids[i]);
      if (marked !== true) {
        missingArt.push(ids[i]);
        // eslint-disable-next-line no-await-in-loop
        await clearColoring60Done(COLORING60_LAB_STORY_ID, ids[i]); // sem arte ⇒ não fica concluída
      }
    } else {
      // eslint-disable-next-line no-await-in-loop
      await clearColoring60Done(COLORING60_LAB_STORY_ID, ids[i]);
    }
  }
  return { state: await readColoring60LabState(), missingArt };
}

/**
 * prepareColoring60LabUpdate(activityId) — garante que a parte indicada esteja CONCLUÍDA antes de
 * abri-la, para que salvar ali caia no fluxo de REEDIÇÃO (UPDATE) e não numa primeira conclusão.
 * Não altera as outras partes: é assim que se testa "reedição com progresso incompleto" (§Parte 6)
 * separadamente de "reedição com tudo concluído" (§Parte 7). Exige pintura real, como todo o resto.
 */
export async function prepareColoring60LabUpdate(activityId) {
  if (!isColoring60LabAllowed()) return false;
  if (coloring60LabActivityIds().indexOf(activityId) < 0) return false;
  return markLabActivityFromRealArt(activityId);
}

/**
 * clearColoring60Lab() — volta ao 0/3 chamando o RESET CANÔNICO da jornada, o mesmo de "Gerenciar
 * dados". A bancada não tem mais lista de chaves própria: conclusão, memória de "já concluiu",
 * grande conclusão vista, pixels, ARQUIVOS FÍSICOS, convite e caches em memória saem todos pela
 * função única. Devolve o retrato final (tudo falso) lido do disco.
 */
export async function clearColoring60Lab() {
  if (!isColoring60LabAllowed()) return {};
  await resetCreationColoringJourney(COLORING60_LAB_STORY_ID);
  return readColoring60LabState();
}
