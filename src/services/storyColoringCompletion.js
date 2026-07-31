/**
 * storyColoringCompletion.js — PONTE (SOMENTE LEITURA) entre a jornada Colorir 60 e o
 * `coloringComplete` do journey GLOBAL da história (`storyJourneyService`).
 *
 * O PROBLEMA QUE RESOLVE. O journey global de uma história exige `coloringComplete` para marcar a
 * história como "Concluída" (e liberar a próxima na sequência). Fora do piloto, esse sinal vem da
 * fonte legada (`coloringActivityService`: uma página de colorir por história). Mas em "A Criação"
 * com o piloto ativo, o Colorir tradicional por cena dá lugar à jornada Colorir 60 (três atividades:
 * luz, vida, cuidado), gravada em OUTRO lugar. Sem esta ponte, o journey global consultaria a fonte
 * legada — que o piloto não alimenta — e a história NUNCA fecharia, por mais que a criança colorisse.
 *
 * O QUE A PONTE FAZ (e o que NÃO faz):
 *   - LÊ a jornada Colorir 60 pelo leitor reconciliado (`loadColoring60JourneyState`), que já conta
 *     por `countsAsComplete` (concluída AGORA + instantâneo íntegro) — NUNCA por `hasEverCompleted`.
 *   - Traduz isso num único booleano com a MESMA regra que o journey global já documenta:
 *     "pelo menos 1 página de colorir concluída" ⇒ `coloringComplete = completedCount >= 1`. A ponte
 *     NÃO inventa outro limiar e NÃO altera a fórmula global (só troca a FONTE do sinal de 'creation').
 *   - Só atravessa quando o piloto está ATIVO para a história (`isCreationColoringPilotActive`). Fora
 *     disso — inclusive "A Criação" com o piloto desligado, o caso de PRODUÇÃO — devolve
 *     "não se aplica" e o chamador mantém a fonte legada intacta (comportamento idêntico ao baseline).
 *
 * FALHA DE LEITURA ≠ ZERO DE TRÊS. `loadColoring60JourneyState` REJEITA quando não consegue ler o
 * progresso (disco indisponível). A ponte captura isso e devolve READ_FAILED — um estado DISTINTO de
 * "0 de 3". O chamador deve PRESERVAR o valor anterior de `coloringComplete`, nunca forçar `false`:
 * do contrário, um erro transitório de I/O apagaria a conclusão da história e mandaria a criança
 * refazer o que já terminou. Este é o mesmo princípio do leitor de baixo (ver comentário lá).
 *
 * SOMENTE LEITURA / SEM ESCRITA / SEM NAVEGAÇÃO. Não persiste nada, não cura nada, não navega. Não
 * é fonte de verdade: apenas RELATA, para o journey global, o que a jornada Colorir 60 já sabe.
 *
 * Governança: C60 Parte B (ponte segura com a jornada) · CLAUDE.md (fonte única de estado; sem
 * alterar a fórmula global; áreas de progresso mudam só com instrução direta — esta é a instrução).
 */
import { isCreationColoringPilotActive } from './coloring60Pilot';
import { loadColoring60JourneyState } from './coloring60ProgressReader';

// "Não se aplica": a história não é a do piloto (ou o piloto está desligado). O chamador mantém a
// sua fonte legada de `coloringComplete` — a ponte não opina e nada muda.
export const STORY_COLORING_NOT_APPLICABLE = Object.freeze({
  applicable: false,
  readFailed: false,
  coloringComplete: null,
  completedCount: null,
  totalActivities: null,
});

// "Falha de leitura": a história É do piloto, mas o progresso não pôde ser lido. NÃO é "zero de três":
// o chamador PRESERVA o valor anterior, nunca força `false`.
export const STORY_COLORING_READ_FAILED = Object.freeze({
  applicable: true,
  readFailed: true,
  coloringComplete: null,
  completedCount: null,
  totalActivities: null,
});

/**
 * isStoryColoringComplete(completedCount) — a regra ÚNICA de "colorir concluído" para o journey
 * global: pelo menos 1 atividade CONTADA. É exatamente a regra que `storyJourneyService` documenta
 * ("pelo menos 1 página"); a ponte a repete, não a redefine. `completedCount` vem de
 * `loadColoring60JourneyState`, que conta por `countsAsComplete`, jamais por `hasEverCompleted`.
 */
export function isStoryColoringComplete(completedCount) {
  return Number.isInteger(completedCount) && completedCount >= 1;
}

/**
 * loadStoryColoringCompletionState(storyId) — retrato do `coloringComplete` da história para o
 * journey global. NUNCA lança (captura a rejeição do leitor). Devolve um dos três formatos:
 *   - NOT_APPLICABLE  (piloto off / outra história) → use a fonte legada;
 *   - { applicable:true, readFailed:false, coloringComplete, completedCount, totalActivities };
 *   - READ_FAILED     (piloto on, leitura indisponível) → PRESERVE o valor anterior.
 */
export async function loadStoryColoringCompletionState(storyId) {
  if (!isCreationColoringPilotActive(storyId)) return STORY_COLORING_NOT_APPLICABLE;
  try {
    const journey = await loadColoring60JourneyState(storyId);
    const completedCount = Number.isInteger(journey?.completedCount) ? journey.completedCount : 0;
    const totalActivities = Number.isInteger(journey?.totalActivities) ? journey.totalActivities : 0;
    return Object.freeze({
      applicable: true,
      readFailed: false,
      coloringComplete: isStoryColoringComplete(completedCount),
      completedCount,
      totalActivities,
    });
  } catch (e) {
    // Rejeição = `record.readFailed` lá embaixo. Falha de leitura ≠ zero de três.
    return STORY_COLORING_READ_FAILED;
  }
}

/**
 * applyCreationColoringToSet(legacySet, prevSet, state, storyId) — PURA e sem efeito colateral.
 * Devolve um NOVO Set de "colorir concluído por história" (o formato que o ProgressContext guarda),
 * com a entrada de `storyId` reconciliada pela ponte:
 *   - `state` não aplicável (piloto off) ⇒ Set legado intacto (produção idêntica);
 *   - `state` READ_FAILED ⇒ PRESERVA o valor ANTERIOR de `storyId` (nunca força `false`);
 *   - leitura ok ⇒ adiciona/remove `storyId` conforme `coloringComplete`.
 * Nunca muta os Sets recebidos; entradas inválidas degradam para vazio.
 */
export function applyCreationColoringToSet(legacySet, prevSet, state, storyId) {
  const next = new Set(legacySet instanceof Set ? legacySet : []);
  if (!state || state.applicable !== true) return next;
  if (state.readFailed === true) {
    const had = prevSet instanceof Set && prevSet.has(storyId);
    if (had) next.add(storyId);
    else next.delete(storyId);
    return next;
  }
  if (state.coloringComplete === true) next.add(storyId);
  else next.delete(storyId);
  return next;
}

export default {
  STORY_COLORING_NOT_APPLICABLE,
  STORY_COLORING_READ_FAILED,
  isStoryColoringComplete,
  loadStoryColoringCompletionState,
  applyCreationColoringToSet,
};
