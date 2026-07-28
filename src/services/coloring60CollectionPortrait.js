/**
 * coloring60CollectionPortrait.js — RETRATO EM MEMÓRIA da coleção (C60 · Retorno instantâneo · A2/A3).
 *
 * O QUE É. Um retrato POR `storyId` do último estado válido da coleção — o que estava na tela da
 * última vez que a leitura reconciliada teve sucesso. Guardado só em memória de módulo, para que o
 * RETORNO QUENTE ("Ver minha coleção" logo após concluir) seja instantâneo: a tela mostra este
 * retrato de imediato e reconcilia o disco em segundo plano (stale-while-revalidate).
 *
 * O QUE NÃO É (fronteiras invioláveis do bloco):
 *   - NÃO é persistência nova: nada vai para AsyncStorage nem para arquivo. Se o app fecha, o retrato
 *     some — na próxima abertura a coleção lê do disco (caminho frio honesto).
 *   - NÃO duplica blob: guarda o MESMO `paint` (data URL) que a leitura já materializou, por
 *     referência; não copia bytes para um segundo lugar.
 *   - NÃO é autoridade: o DISCO reconciliado (`loadColoring60Slots`) continua a fonte de verdade. O
 *     retrato é só o "último retrato visual válido" para evitar o piscar; toda reconciliação vem do
 *     leitor canônico, e uma leitura que falha NÃO apaga o retrato (mantém o último bom).
 *   - NÃO decide plano, autorização, conclusão ou recompensa. Só lê e reconcilia estado visual.
 *
 * COMO SE MANTÉM COERENTE:
 *   - DEDUP EM VOO (A3): uma promessa em andamento por `storyId`. Chamadas concorrentes (o `prime`
 *     pós-conclusão + o foco da tela) compartilham a MESMA leitura — nunca 3 leituras de blob a mais.
 *   - GERAÇÃO DE LEITURA (A2): cada leitura recebe uma geração crescente; uma leitura ANTIGA que
 *     pousa depois de uma mais nova é DESCARTADA (`coloring60ReadIsFresh`) — a coleção velha não
 *     reaparece sem erro aparente.
 *   - ÉPOCA DE RESET: o barramento de reset invalida o retrato E incrementa uma época; uma leitura em
 *     voo iniciada ANTES do reset e concluída DEPOIS é descartada (não repovoa o retrato apagado).
 *   - MERGE SWR (A2): `mergeColoring60Portrait` troca só a vaga que mudou, atomicamente, preservando
 *     a anterior quando a nova revisão falha (blob lento/órfão).
 */
import { loadColoring60Slots, coloring60SlotWithKind } from './coloring60CollectionReader';
import { subscribeColoring60Reset } from './coloring60ResetService';
import {
  mergeColoring60Portrait,
  coloring60ReadIsFresh,
} from './coloring60PortraitMerge';

/** storyId → { storyId, slots, finaleSeen, readGeneration, updatedAt }. Só memória. */
const portraits = new Map();
/** storyId → Promise em voo (dedup A3). */
const inFlight = new Map();
/** Geração de leitura crescente, global. */
let issuedGeneration = 0;
/** Época de reset, global. Um reset (de qualquer história) incrementa; leituras em voo antes dela caem. */
let resetEpoch = 0;

/**
 * getColoring60Portrait(storyId) — o retrato ATUAL em memória (síncrono), ou `null` se ainda não há.
 * A tela usa isto no foco para decidir o caminho: retrato presente ⇒ retorno quente (mostra já);
 * ausente ⇒ carga fria (esqueleto + "Montando sua coleção…").
 */
export function getColoring60Portrait(storyId) {
  return portraits.get(storyId) || null;
}

/**
 * primeColoring60Collection(storyId) — RECONCILIA a partir do disco e atualiza o retrato (SWR).
 *
 * Usado em DOIS momentos:
 *   • A3 — logo após a transação de conclusão (fire-and-forget, SEM bloquear a celebração), para que
 *     "Ver minha coleção" já encontre o retrato pronto;
 *   • no foco da coleção, como a revalidação em segundo plano do stale-while-revalidate.
 *
 * Faz dedup em voo por `storyId`; carimba a leitura com uma geração; ao concluir, aplica a merge SWR
 * SOMENTE se a leitura ainda for a mais nova E nenhum reset tiver ocorrido no meio. NUNCA lança para
 * o chamador: falha de leitura devolve o retrato anterior (o disco continua a autoridade; o retrato
 * apenas não regride para vazio). Devolve o retrato resultante (ou o anterior em falha).
 */
export function primeColoring60Collection(storyId) {
  if (storyId == null) return Promise.resolve(getColoring60Portrait(storyId));

  const existing = inFlight.get(storyId);
  if (existing) return existing;

  issuedGeneration += 1;
  const generation = issuedGeneration;
  const epochAtStart = resetEpoch;

  const run = loadColoring60Slots(storyId)
    .then(({ slots, finaleSeen }) => {
      // Reset ocorreu enquanto líamos: o retrato foi invalidado de propósito — não repovoar com dados
      // pré-reset (senão "3 de 3" reapareceria depois de apagar).
      if (resetEpoch !== epochAtStart) return getColoring60Portrait(storyId);

      const current = portraits.get(storyId) || null;
      // Leitura obsoleta (uma mais nova já pousou): descartar sem sobrescrever.
      if (!coloring60ReadIsFresh(generation, current ? current.readGeneration : 0)) {
        return current;
      }

      const withKind = slots.map((s) => coloring60SlotWithKind(s));
      const { cells } = mergeColoring60Portrait(current ? current.slots : null, withKind);
      const next = {
        storyId,
        slots: cells,
        finaleSeen: finaleSeen === true,
        readGeneration: generation,
        updatedAt: Date.now(),
      };
      portraits.set(storyId, next);
      return next;
    })
    .catch(() => getColoring60Portrait(storyId)) // falha de leitura ⇒ mantém o último retrato bom
    .finally(() => {
      if (inFlight.get(storyId) === run) inFlight.delete(storyId);
    });

  inFlight.set(storyId, run);
  return run;
}

/**
 * invalidateColoring60Portrait(storyId) — descarta o retrato de uma história e incrementa a época de
 * reset (para derrubar qualquer leitura em voo iniciada antes). Chamado pelo barramento de reset.
 */
export function invalidateColoring60Portrait(storyId) {
  resetEpoch += 1;
  if (storyId == null) {
    portraits.clear();
    inFlight.clear();
    return;
  }
  portraits.delete(storyId);
  inFlight.delete(storyId);
}

// O reset canônico apaga disco + caches; o retrato em memória é um desses caches. Inscrição única, no
// carregamento do módulo: quando qualquer história é resetada, o seu retrato cai e a próxima leitura
// é fria e honesta (0 de 3 por derivação, sem "3 de 3" fantasma).
subscribeColoring60Reset((storyId) => {
  invalidateColoring60Portrait(storyId);
});

export default {
  getColoring60Portrait,
  primeColoring60Collection,
  invalidateColoring60Portrait,
};
