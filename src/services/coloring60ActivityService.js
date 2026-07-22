/**
 * coloring60ActivityService.js — CONCLUSÃO da atividade Colorir 60 por identidade
 * composta (`storyId`, `activityId`), C60-IMPL-P4 · P4.T1. É a fronteira semântica de
 * "esta atividade de colorir foi concluída" — um booleano leve, TOTALMENTE SEPARADO da
 * persistência de pixels (o writer `coloring60DrawingStorage.js`, P3).
 *
 * PRINCÍPIOS (nunca violar):
 *   - SEPARAÇÃO CONCLUSÃO ≠ SALVAMENTO: este serviço NÃO grava/lê pixels, NÃO importa o
 *     writer (`coloring60DrawingStorage`), `fileBlobStore`, `drawingStorage` nem `coloringImages`.
 *     Conclusão e salvamento são registros independentes: uma falha de persistência de pixels
 *     JAMAIS deve apagar uma conclusão válida, e concluir NÃO implica arte salva.
 *   - PLAN-AGNÓSTICO: concluir vale para o plano GRÁTIS e para o Plano Família. Este serviço
 *     NÃO consulta entitlement (`accessControl`/`getCurrentPlan`/`entitlementService`) — quem
 *     restringe a PERSISTÊNCIA de pixels ao Plano Família é o writer, internamente. Concluir é livre.
 *   - IDENTIDADE SEMÂNTICA FECHADA: `storyId`/`activityId` são strings validadas contra o
 *     catálogo (`coloring60Catalog`). Número/`"2"`/`"scene_02"`/vazio/não-string ⇒ rejeitado,
 *     sem escrita. Nunca é interpretado como `sceneId`/`cenaIndex`. Não recebe chave arbitrária.
 *   - NAMESPACE PRÓPRIO, SEM COLISÃO: chave `@ptf_coloring60_done_<storyId>_<activityId>` (não
 *     casa `@ptf_drawing60_` de pixels, nem `@ptf_coloring_done_` da atividade legada por cena,
 *     nem `@ptf_drawing_s` do desenho legado). NÃO cria/renomeia/apaga chaves de outra camada.
 *   - SEM EFEITO COLATERAL DE PROGRESSO: concluir NÃO concede estrela (nenhum `rewardService`/
 *     `achievement`), NÃO conclui cena narrativa (nenhum `coloringActivityService` legado /
 *     `markStoryColoringActivityDone` / `salvarCena`), NÃO integra métrica pública.
 *
 * PRÉ-CONDIÇÕES D1/D5: as condições de "lineart pronto" (D1) e "traço significativo" (D5) são
 * observáveis apenas em runtime (canvas). Elas são GARANTIDAS PELO CHAMADOR na ordem canônica
 * (ver `ColoringScreen`), ANTES de invocar `markColoring60ActivityDone`. Este serviço, por ser
 * uma fronteira por identidade, valida apenas a IDENTIDADE semântica e persiste o booleano leve.
 *
 * Governança: specs 014/015/016/017 · DECISIONS.md PL01A-03/PL01G · plan.md §6.6 · tasks.md P4.T1.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColoring60Activity } from '../data/coloring60Catalog';

// Prefixo PRÓPRIO da conclusão Colorir 60 (isolado dos namespaces de pixels e do legado).
const DONE_PREFIX = '@ptf_coloring60_done_';

/**
 * coloring60DoneKey(storyId, activityId) — construtor INTERNO da chave de conclusão (NÃO exportado).
 * A API pública do módulo é EXATAMENTE `{ markColoring60ActivityDone, loadColoring60Done }`; nenhum
 * chamador fornece a chave pronta — `mark`/`load` a computam internamente após validar a identidade.
 * Só produz a chave; o valor gravado é sempre `'true'` (existência = concluído). Espelha o padrão do
 * serviço legado (`coloringActivityKey`) para consistência arquitetural, sem colidir com ele.
 */
function coloring60DoneKey(storyId, activityId) {
  return `${DONE_PREFIX}${storyId}_${activityId}`;
}

/**
 * isValidIdentity(storyId, activityId) — true SOMENTE para strings não-vazias existentes no
 * catálogo Colorir 60. Número/vazio/não-string/atividade fora do piloto ⇒ false. A chave só é
 * calculada após esta validação: identidade inválida NUNCA provoca escrita nem leitura de chave.
 */
function isValidIdentity(storyId, activityId) {
  if (
    typeof storyId !== 'string' ||
    typeof activityId !== 'string' ||
    storyId.length === 0 ||
    activityId.length === 0
  ) {
    return false;
  }
  return getColoring60Activity(storyId, activityId) != null;
}

/**
 * markColoring60ActivityDone(storyId, activityId) — marca a atividade como concluída (booleano
 * leve). PLAN-AGNÓSTICO (Free e Família concluem). Retorna `true` em sucesso, `false` se a
 * identidade for inválida OU se a escrita falhar (nunca lança, nunca reporta sucesso falso).
 * NÃO persiste pixels, NÃO concede estrela, NÃO conclui cena narrativa.
 */
export async function markColoring60ActivityDone(storyId, activityId) {
  if (!isValidIdentity(storyId, activityId)) return false;
  try {
    await AsyncStorage.setItem(coloring60DoneKey(storyId, activityId), 'true');
    return true;
  } catch {
    return false;
  }
}

/**
 * loadColoring60Done(storyId, activityId) — true SOMENTE quando a atividade tem conclusão
 * registrada (chave === `'true'`). Valida identidade (identidade inválida ⇒ false, ainda que
 * exista uma chave espúria). Nunca lança; erro de leitura ⇒ false. Não escreve, não faz healing.
 */
export async function loadColoring60Done(storyId, activityId) {
  if (!isValidIdentity(storyId, activityId)) return false;
  try {
    return (await AsyncStorage.getItem(coloring60DoneKey(storyId, activityId))) === 'true';
  } catch {
    return false;
  }
}
