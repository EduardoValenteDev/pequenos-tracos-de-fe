/**
 * coloring60ProgressReader.js — LEITOR RECONCILIADO do progresso da jornada Colorir 60
 * (C60 · Parte 10). SOMENTE LEITURA: não escreve nada, não cura nada, não navega.
 *
 * POR QUE ESTE ARQUIVO EXISTE. A partir da Parte 4 existem DOIS registros independentes por
 * atividade: a conclusão leve (`coloring60ActivityService`) e o instantâneo da arte
 * (`coloring60DrawingStorage`). Nenhum dos dois, sozinho, responde "quantas partes estão
 * concluídas AGORA": a conclusão pode ser órfã (a arte sumiu do disco) e a arte pode existir
 * sem conclusão atual (a folha foi limpa depois). Quem responde é a RECONCILIAÇÃO dos dois com
 * o modelo canônico (`coloring60State`) — e ela precisa ficar em UM lugar só, senão cada tela
 * inventa a sua contagem e o app volta a mentir em superfícies diferentes.
 *
 * DIVISÃO DE EVIDÊNCIA (deliberada, não é descuido):
 *   - Aqui usa-se a EVIDÊNCIA LEVE (`hasColoring60SnapshotRecord`): lê metadado, não abre o blob.
 *     Serve a quem só precisa de CONTADOR e RÓTULO (a ponte pós-história), sem carregar imagens.
 *   - A tela da COLEÇÃO, que EXIBE a arte, continua usando a EVIDÊNCIA FORTE
 *     (`getColoring60SavedDrawing` + medida de cor real): ela precisa dos pixels de qualquer forma
 *     e é a superfície onde uma arte irrecuperável tem de aparecer como estado honesto.
 *   Consequência declarada: num ponteiro órfão, o rótulo da ponte pode dizer "ver sua coleção"
 *   e a coleção mostrar a parte como "precisa de cor". A coleção — a evidência forte — é a
 *   autoridade visível, e ela mesma oferece o caminho de volta ao desenho. O inverso (a ponte
 *   dizer "continuar" com tudo pronto) seria pior: mandaria a criança refazer o que já terminou.
 *
 * Governança: C60 Partes 2/4/9/10 · CLAUDE.md (fonte única de estado, sem paleta paralela).
 */
import { getColoring60Activities } from '../data/coloring60Catalog';
import { loadColoring60JourneyRecord } from './coloring60ActivityService';
import { hasColoring60SnapshotRecord } from './coloring60DrawingStorage';
import {
  deriveColoring60ActivityState,
  deriveColoring60JourneyState,
  reconcileSnapshotStatus,
  HYDRATION_STATUS,
} from './coloring60State';

/**
 * loadColoring60JourneyState(storyId) — retrato ÍNTEGRO da jornada: um `multiGet` da conclusão +
 * uma sonda leve de instantâneo por atividade, reconciliados e derivados pelo modelo canônico.
 *
 * Devolve exatamente o que `deriveColoring60JourneyState` devolve (`completedCount`,
 * `isFullyComplete`, `nextIncompleteActivityId`, `doneMap`, `finaleSeen`, `finaleDue`,
 * `countLabel`, `hasIntegrityBreak`, `integrityBrokenIds`, `totalActivities`).
 *
 * História fora do piloto ⇒ jornada vazia (`totalActivities: 0`), nunca erro. Falha de leitura
 * PROPAGA (rejeita): a superfície decide o que fazer com a falha — este leitor não inventa um
 * "0 de 3" que faria a criança começar de novo o que já terminou.
 */
export async function loadColoring60JourneyState(storyId) {
  const activities = getColoring60Activities(storyId); // ordem fechada do catálogo
  const ids = activities.map((a) => a.activityId);
  if (ids.length === 0) return deriveColoring60JourneyState({ activities: [], finaleSeen: false });

  const record = await loadColoring60JourneyRecord(storyId, ids);
  // O registro NUNCA lança — ele carimba. Aqui a marca vira rejeição de verdade: sem conseguir ler,
  // este leitor prefere não responder a responder "0 de 3". Quem chama (a ponte pós-história) já
  // trata a rejeição escondendo o convite, e esconder é infinitamente melhor do que mandar a
  // criança recomeçar o que ela já terminou.
  if (record.readFailed === true) {
    throw new Error('coloring60: leitura do progresso indisponível');
  }
  const byId = new Map((record.activities || []).map((a) => [a.activityId, a]));

  const states = await Promise.all(ids.map(async (activityId) => {
    const stored = byId.get(activityId) || {};
    const artRecorded = await hasColoring60SnapshotRecord(storyId, activityId);
    return deriveColoring60ActivityState({
      activityId,
      isCurrentlyComplete: stored.isCurrentlyComplete === true,
      hasEverCompleted: stored.hasEverCompleted === true,
      // Cura conclusões anteriores à chave de instantâneo e derruba conclusões órfãs (Parte 4).
      //
      // A MESMA sonda responde às DUAS perguntas da regra canônica, e é por isso que ela aparece
      // duas vezes aqui. Como `artRecorded`: "dá para promover a READY?". Como `hasSnapshotRecord`:
      // "existe algum registro de instantâneo?" — a evidência que, quando NEGATIVA, identifica a
      // CONCLUSÃO LEGADA (sem pixels, nunca houve ponteiro) e a preserva como conclusão válida em
      // vez de derrubá-la como quebra de integridade. Sem isso, uma conclusão antiga sumiria do
      // "x de 3" e a criança seria mandada refazer o que já terminou (S2 · Spec 019).
      snapshotStatus: reconcileSnapshotStatus(
        stored.storedSnapshotStatus,
        artRecorded,
        { hasSnapshotRecord: artRecorded },
      ),
      hydrationStatus: HYDRATION_STATUS.READY,
    });
  }));

  return deriveColoring60JourneyState({ activities: states, finaleSeen: record.finaleSeen === true });
}
