/**
 * coloring60PortraitMerge.js — LÓGICA PURA do retrato em memória da coleção (C60 · Retorno instantâneo).
 *
 * O PROBLEMA que este módulo resolve (PARTE A · causa-raiz). A coleção descartava um resultado válido
 * e o re-derivava do disco a CADA foco, atrás de uma barreira global — 3 leituras de blob base64 em
 * `Promise.all` + um portão de revelação que só liberava quando as TRÊS vagas terminavam. Daí a espera
 * intermitente em "Montando sua coleção…". A correção é stale-while-revalidate: manter o último retrato
 * válido e reconciliar em segundo plano, trocando SÓ a vaga que mudou.
 *
 * Este arquivo é a parte DECISÓRIA dessa correção, e é de propósito PURA e SEM DEPENDÊNCIAS (sem React,
 * storage, navegação, I/O): a merge SWR (A2), a KEY estável por vaga (A5) e a ordenação por geração de
 * leitura (A2) precisam ser EXECUTÁVEIS no smoke — mutar uma regra tem de mudar o veredito. O serviço
 * com estado (`coloring60CollectionPortrait`) apenas orquestra estas funções sobre a leitura real.
 *
 * LITERAIS (espelham enums reais — coerência PROVADA no smoke, drift reprova o gate):
 *   - `C60_PORTRAIT_ART_KIND = 'art'`      espelha `SLOT.ART` (coloring60CollectionReader).
 *   - status aceitáveis `ready|notPersisted` espelham `SNAPSHOT_STATUS.READY|NOT_PERSISTED`
 *     (coloring60State) — os MESMOS que `isSnapshotAcceptable` aceita.
 */

/** `kind` de uma vaga com arte componível — espelha `SLOT.ART`. */
export const C60_PORTRAIT_ART_KIND = 'art';

/** Desfechos de instantâneo ACEITÁVEIS (concluída de verdade) — espelham SNAPSHOT_STATUS READY/NOT_PERSISTED. */
export const C60_PORTRAIT_ACCEPTABLE_SNAPSHOT = Object.freeze(['ready', 'notPersisted']);

/**
 * coloring60SlotKey(storyId, slot) — KEY ESTÁVEL POR VAGA (A5). Muda SOMENTE quando a obra muda de
 * verdade: identidade (storyId+activityId), desfecho do instantâneo (snapshotStatus) e ASSINATURA do
 * payload (tamanho da tinta) + presença de contorno. NUNCA usa `activityId` sozinho (uma repintura da
 * MESMA parte tem de gerar key nova, senão a vaga fica congelada na arte antiga), NUNCA `Date.now`,
 * NUNCA aleatório (esses remontariam a vaga a cada render, reintroduzindo o piscar).
 *
 * A assinatura de payload usa o TAMANHO da tinta — a MESMA convenção de `coloring60SlotSignature` no
 * leitor canônico: duas revisões diferentes praticamente sempre diferem em tamanho, e a coerência é a
 * mesma já confiada pela coleção hoje.
 */
export function coloring60SlotKey(storyId, slot) {
  const story = typeof storyId === 'string' ? storyId : '';
  const id = slot && typeof slot.activityId === 'string' ? slot.activityId : '';
  const snap = slot && typeof slot.snapshotStatus === 'string' ? slot.snapshotStatus : 'missing';
  const paintSig = slot && typeof slot.paint === 'string' ? slot.paint.length : 0;
  const lineartSig = slot && slot.lineart ? 1 : 0;
  return `${story}:${id}:${snap}:${paintSig}:${lineartSig}`;
}

/**
 * coloring60SlotIsComposableArt(slot) — a vaga PODE ser composta como arte AGORA (tinta + contorno
 * prontos). É o único caso em que a coleção mostra a obra colorida; sem os dois não há composição
 * possível (o mesmo invariante do leitor: `paint = paint && lineart ? paint : null`).
 */
export function coloring60SlotIsComposableArt(slot) {
  return !!(slot && slot.kind === C60_PORTRAIT_ART_KIND && slot.paint && slot.lineart);
}

/**
 * coloring60SlotIntegrityBreak(slot) — ANOMALIA de integridade: a parte está marcada como concluída
 * AGORA, mas o instantâneo não é componível nem é um desfecho aceitável (não é o `notPersisted` honesto
 * do plano Grátis). É o sinal que distingue "a leitura falhou por um instante" (blob lento/órfão) de
 * "a criança realmente mudou a obra" (limpou → deixa de estar concluída). Só neste caso a merge
 * PRESERVA a arte anterior em vez de piscar um quadro vazio.
 */
export function coloring60SlotIntegrityBreak(slot) {
  if (!slot || slot.isCurrentlyComplete !== true) return false;
  if (coloring60SlotIsComposableArt(slot)) return false;
  const snap = typeof slot.snapshotStatus === 'string' ? slot.snapshotStatus : 'missing';
  return C60_PORTRAIT_ACCEPTABLE_SNAPSHOT.indexOf(snap) < 0;
}

/**
 * mergeColoring60Portrait(prevSlots, nextSlots) — MERGE STALE-WHILE-REVALIDATE (A2).
 *
 * Recebe o retrato anterior (o que já está na tela) e a nova leitura reconciliada. Devolve
 * `{ cells, changedIds }`: a lista de vagas a exibir e quais mudaram de verdade. Regra por vaga:
 *
 *   1. NOVA arte componível  → sempre vence (pintura nova ou repintada).
 *   2. Leitura nova NÃO componível MAS marca a parte concluída (anomalia de integridade) E havia arte
 *      anterior componível → PRESERVA a anterior (não pisca um quadro vazio no lugar de uma obra
 *      válida quando o blob demora/falha por um instante).
 *   3. Estado honesto genuíno (limpou, Grátis-não-persistido, ainda vazio) → assume a leitura nova.
 *
 * `changedIds` só inclui vagas cujo conteúdo mudou (KEY diferente) — a vaga preservada (regra 2) e a
 * inalterada NÃO entram, então a tela troca ATOMICAMENTE só o que mudou, sem remontar as outras.
 * PURA: não navega, não lê, não escreve, não decide plano/autorização.
 */
export function mergeColoring60Portrait(prevSlots, nextSlots) {
  const prevById = new Map(
    (Array.isArray(prevSlots) ? prevSlots : []).map((s) => [s && s.activityId, s]),
  );
  const changedIds = [];
  const cells = (Array.isArray(nextSlots) ? nextSlots : []).map((next) => {
    const prev = prevById.get(next && next.activityId) || null;

    // (1) Arte nova componível sempre vence.
    if (coloring60SlotIsComposableArt(next)) {
      if (!prev || coloring60SlotKey('', prev) !== coloring60SlotKey('', next)) {
        changedIds.push(next.activityId);
      }
      return next;
    }

    // (2) Falha/atraso de leitura (integridade quebrada) com obra anterior válida → preserva a anterior.
    if (coloring60SlotIntegrityBreak(next) && coloring60SlotIsComposableArt(prev)) {
      return prev; // nada muda visualmente: NÃO entra em changedIds
    }

    // (3) Mudança honesta genuína.
    if (!prev || coloring60SlotKey('', prev) !== coloring60SlotKey('', next)) {
      changedIds.push(next.activityId);
    }
    return next;
  });
  return { cells, changedIds };
}

/**
 * coloring60ReadIsFresh(incomingGeneration, portraitGeneration) — ORDENAÇÃO POR GERAÇÃO (A2). Um
 * resultado de leitura só se aplica se for MAIS NOVO do que o retrato já reflete. Uma leitura ANTIGA
 * que pousa DEPOIS de uma mais nova (foco seguido de foco, ou reset no meio) NÃO pode sobrescrever o
 * retrato — senão a coleção velha reapareceria sem erro aparente. Estritamente maior: uma leitura da
 * mesma geração também não reescreve (idempotência).
 */
export function coloring60ReadIsFresh(incomingGeneration, portraitGeneration) {
  return (
    typeof incomingGeneration === 'number'
    && incomingGeneration > (typeof portraitGeneration === 'number' ? portraitGeneration : 0)
  );
}
