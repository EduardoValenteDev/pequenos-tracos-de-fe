/**
 * coloring60State.js — MODELO CANÔNICO DE ESTADO do Colorir 60 (C60 · Parte 2).
 *
 * POR QUE ESTE ARQUIVO EXISTE. A implementação anterior tinha UM único booleano por atividade
 * (`done`) fazendo o trabalho de oito coisas diferentes: "tem cor na tela", "está concluída
 * agora", "já foi concluída alguma vez", "a grande conclusão já foi vista", "o instantâneo está
 * gravado", "a tela terminou de hidratar", "há mudança não gravada" e "qual versão da pintura é
 * esta". Como tudo era o mesmo bit, apagar o desenho não desfazia a conclusão, o contador dizia
 * 3 de 3 sem três artes e a grande conclusão podia repetir. Aqui esses OITO estados passam a ser
 * OITO campos distintos, cada um com uma regra própria.
 *
 * CONTRATO ARQUITETURAL (por que este arquivo não importa nada):
 *   - FUNÇÕES PURAS, SÍNCRONAS, SEM DEPENDÊNCIAS — sem React, sem AsyncStorage, sem canvas.
 *     Recebem o retrato e devolvem a derivação. O smoke executa estas funções REAIS.
 *   - Este módulo NÃO decide autorização/plano e NÃO lê nem escreve nada. Só deriva.
 *   - A derivação de JORNADA (`coloring60Journey.js`) continua sendo a fonte das AÇÕES e dos
 *     rótulos; este módulo é a fonte da INTEGRIDADE (o que pode ser contado como concluído).
 *
 * OS OITO ESTADOS (Parte 2):
 *   hasMeaningfulColor — existe cor suficiente NA TELA agora (medida real; ver coloring60PaintMetrics).
 *   isCurrentlyComplete — esta atividade está concluída AGORA. Limpar a pintura ⇒ volta a false.
 *   hasEverCompleted   — já foi concluída alguma vez. NUNCA substitui isCurrentlyComplete: serve
 *                        para não tratar quem volta como quem nunca chegou (e para não repetir
 *                        a grande conclusão por uma simples reedição).
 *   finaleSeen         — a GRANDE conclusão das três já foi exibida (por jornada, não por atividade).
 *   snapshotStatus     — situação do instantâneo gravado desta atividade (ver SNAPSHOT_STATUS).
 *   hydrationStatus    — situação do carregamento visual desta superfície (ver HYDRATION_STATUS).
 *   isDirty            — há alteração de pintura ainda NÃO refletida no que está gravado.
 *   revisionId         — versão monotônica da pintura; casa pintura ↔ instantâneo na transação.
 */

/**
 * Situação do INSTANTÂNEO (a arte gravada) de uma atividade.
 *   READY          — gravado e recuperável: a coleção pode exibi-lo.
 *   NOT_PERSISTED  — NÃO gravado POR DECISÃO DE PLANO (Grátis não salva pixels). Não é falha:
 *                    a conclusão é plan-agnóstica e continua válida. A arte em memória existe
 *                    APENAS durante a celebração imediata da própria atividade e morre com a
 *                    sessão. A coleção e todo resumo persistente derivam SOMENTE do
 *                    estado armazenado — nunca do que sobrou na memória. Este estado
 *                    significa, portanto, CONCLUSÃO SEM PIXELS GUARDADOS: nunca um
 *                    contorno sem cor, nunca uma miniatura fingida.
 *   MISSING        — deveria existir e não existe (ponteiro órfão, arquivo apagado): INTEGRIDADE
 *                    QUEBRADA. Uma atividade nesse estado não pode ser contada como concluída.
 *   FAILED         — a gravação foi tentada e falhou. Também não sustenta conclusão.
 */
export const SNAPSHOT_STATUS = Object.freeze({
  READY: 'ready',
  NOT_PERSISTED: 'notPersisted',
  MISSING: 'missing',
  FAILED: 'failed',
});

/** Situação do carregamento visual (Parte 8). `loading` NUNCA pode mostrar contorno sem cor. */
export const HYDRATION_STATUS = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
});

/**
 * VOCABULÁRIO ÚNICO DAS VAGAS. Toda superfície que representa COLEÇÃO ou CONJUNTO FINAL — a
 * galeria da grande conclusão e a tela da coleção — classifica cada vaga com ESTES quatro nomes e
 * mais nenhum.
 *
 * POR QUE ELE SUBIU PARA CÁ. A regra morava só no leitor da coleção, e a galeria do fecho
 * improvisava a sua ("tem pintura ⇒ mostra; não tem ⇒ moldura vazia"). Duas regras para a mesma
 * pergunta produziram exatamente a cena que o plano Grátis mostrava à criança: a parte recém
 * pintada aparecia como obra (ainda estava na memória da sessão) e as outras duas como quadros
 * quebrados — enquanto o contador dizia, corretamente, 3 de 3. O modelo passa a ser UM só; as
 * telas apenas renderizam o resultado.
 *
 *   ART            — há obra VERDADEIRA e recuperável para compor (cor + contorno, instantâneo READY).
 *   NOT_PERSISTED  — concluída, e a pintura não foi guardada POR DECISÃO DE PLANO. É um desfecho
 *                    POSITIVO: conta como conclusão e JAMAIS pode ser desenhado como perda, falha
 *                    ou carregamento incompleto.
 *   NEEDS_COLOR    — concluída sem obra recuperável e SEM decisão de plano (ponteiro órfão,
 *                    gravação falhada, contorno indisponível): integridade quebrada.
 *   EMPTY          — ainda não concluída. Pintura antiga no disco não sustenta conclusão.
 */
export const COLORING60_SLOT_KIND = Object.freeze({
  ART: 'art',
  NOT_PERSISTED: 'notPersisted',
  NEEDS_COLOR: 'needsColor',
  EMPTY: 'empty',
});

/**
 * Um instantâneo em READY ou NOT_PERSISTED é um desfecho LEGÍTIMO; MISSING/FAILED são quebras.
 * É esta função que impede "3 de 3 fantasma": só desfecho legítimo entra na contagem.
 */
export function isSnapshotAcceptable(status) {
  return status === SNAPSHOT_STATUS.READY || status === SNAPSHOT_STATUS.NOT_PERSISTED;
}

/**
 * reconcileSnapshotStatus(storedStatus, artRecoverable) — a REGRA DE LEITURA que cura o retrato
 * gravado com o que existe DE FATO no disco (Parte 4/8). Quem chama é a superfície que tem acesso
 * aos pixels (a tela da coleção); este módulo continua sem I/O.
 *
 *   arte recuperável            ⇒ READY (mesmo que a chave de instantâneo seja antiga/ausente:
 *                                 conclusões anteriores a esta chave são CURADAS, não descartadas);
 *   sem arte, gravado NOT_PERSISTED ⇒ NOT_PERSISTED (Grátis não grava pixels — não é falha);
 *   sem arte, qualquer outro    ⇒ MISSING (integridade quebrada: não conta como concluída).
 *
 * É esta função que impede as duas mentiras opostas: "3 de 3" com arte inexistente e "0 de 3" para
 * quem concluiu antes de a chave existir.
 */
export function reconcileSnapshotStatus(storedStatus, artRecoverable) {
  if (artRecoverable === true) return SNAPSHOT_STATUS.READY;
  if (storedStatus === SNAPSHOT_STATUS.NOT_PERSISTED) return SNAPSHOT_STATUS.NOT_PERSISTED;
  return SNAPSHOT_STATUS.MISSING;
}

/** Estado inicial de UMA atividade — tudo desligado, nada assumido. */
export function createColoring60ActivityState(activityId = null) {
  return Object.freeze({
    activityId,
    hasMeaningfulColor: false,
    isCurrentlyComplete: false,
    hasEverCompleted: false,
    snapshotStatus: SNAPSHOT_STATUS.MISSING,
    hydrationStatus: HYDRATION_STATUS.LOADING,
    isDirty: false,
    revisionId: 0,
  });
}

/** Normaliza um retrato parcial no estado canônico completo (campos ausentes ⇒ conservadores). */
export function deriveColoring60ActivityState(input = {}) {
  const revision = Number.isFinite(input.revisionId) ? Math.floor(input.revisionId) : 0;
  const snapshotStatus = Object.values(SNAPSHOT_STATUS).indexOf(input.snapshotStatus) >= 0
    ? input.snapshotStatus
    : SNAPSHOT_STATUS.MISSING;
  const hydrationStatus = Object.values(HYDRATION_STATUS).indexOf(input.hydrationStatus) >= 0
    ? input.hydrationStatus
    : HYDRATION_STATUS.LOADING;
  const isCurrentlyComplete = input.isCurrentlyComplete === true;
  return Object.freeze({
    activityId: typeof input.activityId === 'string' ? input.activityId : null,
    hasMeaningfulColor: input.hasMeaningfulColor === true,
    isCurrentlyComplete,
    // hasEverCompleted é MONOTÔNICO: concluir agora implica já ter concluído alguma vez, mas o
    // inverso NUNCA vale — é exatamente o uso proibido pela Parte 2.
    hasEverCompleted: input.hasEverCompleted === true || isCurrentlyComplete,
    snapshotStatus,
    hydrationStatus,
    isDirty: input.isDirty === true,
    revisionId: revision,
  });
}

/**
 * countsAsComplete(state) — a atividade pode ser CONTADA no "x de 3"?
 * Só quando está concluída AGORA **e** o instantâneo teve desfecho legítimo. É a regra que
 * cumpre a Parte 4: não existe 3 de 3 sem três artes atualmente completas e com instantâneo
 * íntegro (READY quando o plano grava; NOT_PERSISTED quando, por decisão de plano, não grava).
 */
export function countsAsComplete(state) {
  if (!state || state.isCurrentlyComplete !== true) return false;
  return isSnapshotAcceptable(state.snapshotStatus);
}

/**
 * hasIntegrityBreak(state) — marcada como concluída mas SEM instantâneo íntegro. É o caso que a
 * Parte 8 manda tratar como ERRO DE INTEGRIDADE (recuperação determinística, diagnóstico
 * registrado), em vez de fingir uma folha sem cor.
 */
export function hasIntegrityBreak(state) {
  if (!state || state.isCurrentlyComplete !== true) return false;
  return !isSnapshotAcceptable(state.snapshotStatus);
}

/**
 * coloring60SlotKind(evidence) — O SELETOR COMPARTILHADO das vagas. Recebe a EVIDÊNCIA de UMA vaga
 * (nunca uma tela, nunca um componente, nunca um retrato de outra atividade) e devolve o
 * vocabulário único acima. Quem renderiza apenas obedece: nenhuma superfície reimplementa a regra.
 *
 *   evidence.isCurrentlyComplete / hasEverCompleted / snapshotStatus — o retrato canônico da parte;
 *   evidence.hasPaint    — existe payload de pintura recuperável PARA ESTA vaga;
 *   evidence.hasLineart  — existe contorno oficial para compor a obra.
 *
 * A ORDEM DOS TESTES É DELIBERADA. `EMPTY` vem primeiro porque conclusão é pré-requisito de tudo:
 * quem limpou a folha volta à vaga vazia mesmo que sobre pintura antiga no disco (Parte 9). `ART`
 * exige as TRÊS provas juntas — pintura, contorno e instantâneo READY — porque compor meia obra é
 * a mentira que este seletor existe para impedir. `NOT_PERSISTED` vem ANTES do desfecho genérico
 * para que a decisão de plano nunca seja confundida com quebra de integridade: são coisas
 * diferentes e precisam continuar visualmente distinguíveis.
 */
export function coloring60SlotKind(evidence = {}) {
  const state = deriveColoring60ActivityState({
    activityId: evidence.activityId ?? null,
    isCurrentlyComplete: evidence.isCurrentlyComplete,
    hasEverCompleted: evidence.hasEverCompleted,
    snapshotStatus: evidence.snapshotStatus,
    hydrationStatus: HYDRATION_STATUS.READY,
  });
  if (state.isCurrentlyComplete !== true) return COLORING60_SLOT_KIND.EMPTY;
  if (evidence.hasPaint === true && evidence.hasLineart === true
    && state.snapshotStatus === SNAPSHOT_STATUS.READY) return COLORING60_SLOT_KIND.ART;
  if (state.snapshotStatus === SNAPSHOT_STATUS.NOT_PERSISTED) return COLORING60_SLOT_KIND.NOT_PERSISTED;
  return COLORING60_SLOT_KIND.NEEDS_COLOR;
}

/**
 * canCompleteNow(state) — o botão "Pronto" pode concluir? Exige COR REAL na tela; a folha em
 * branco (e a folha que acabou de ser limpa) nunca conclui, por mais que já tenha sido concluída
 * antes — `hasEverCompleted` não abre esta porta.
 */
export function canCompleteNow(state) {
  return !!state && state.hasMeaningfulColor === true;
}

/**
 * applyClear(state) — efeito canônico de LIMPAR DESENHO (Parte 5) sobre UMA atividade: sem cor,
 * não concluída agora, instantâneo removido, alteração pendente, revisão nova. `hasEverCompleted`
 * é PRESERVADO (a memória de já ter chegado lá não é apagada por limpar uma folha).
 */
export function applyClear(state) {
  const base = state || createColoring60ActivityState();
  return deriveColoring60ActivityState({
    ...base,
    hasMeaningfulColor: false,
    isCurrentlyComplete: false,
    snapshotStatus: SNAPSHOT_STATUS.MISSING,
    isDirty: true,
    revisionId: (base.revisionId || 0) + 1,
  });
}

/**
 * deriveColoring60JourneyState — retrato ÍNTEGRO da jornada a partir dos estados das atividades.
 * `completedCount` conta SOMENTE atividades que passam em `countsAsComplete`. Por isso o contador
 * volta sozinho quando uma arte é limpa (Parte 9) e nunca chega a 3 de 3 sem as três artes.
 */
export function deriveColoring60JourneyState({ activities = [], finaleSeen = false } = {}) {
  const list = Array.isArray(activities) ? activities : [];
  const total = list.length;
  const completed = list.filter((a) => countsAsComplete(a));
  const completedCount = completed.length;
  const broken = list.filter((a) => hasIntegrityBreak(a));
  const nextFound = list.find((a) => !countsAsComplete(a));
  return Object.freeze({
    totalActivities: total,
    completedCount,
    isFullyComplete: total > 0 && completedCount >= total,
    nextIncompleteActivityId: nextFound ? (nextFound.activityId ?? null) : null,
    // Mapa plano no formato que a derivação da jornada (`coloring60Journey`) já consome.
    doneMap: Object.freeze(list.reduce((acc, a) => {
      if (a && typeof a.activityId === 'string') acc[a.activityId] = countsAsComplete(a);
      return acc;
    }, {})),
    integrityBrokenIds: Object.freeze(broken.map((a) => a.activityId ?? null)),
    hasIntegrityBreak: broken.length > 0,
    finaleSeen: finaleSeen === true,
    // A GRANDE conclusão só é devida quando as três estão íntegras E ela ainda não foi vista.
    // É o que impede a festa de repetir a cada reedição (Parte 9) — e o reset total, ao limpar
    // `finaleSeen`, devolve a primeira vez de verdade (Parte 6).
    finaleDue: total > 0 && completedCount >= total && finaleSeen !== true,
    countLabel: `${completedCount} de ${total}`,
  });
}

/**
 * createResetColoring60JourneyState — o retrato depois do RESET CANÔNICO (Parte 6): os QUATRO
 * estados de progresso zerados (isCurrentlyComplete, hasEverCompleted, finaleSeen e o contador),
 * sem instantâneo e sem revisão pendente. É o alvo que o serviço de reset precisa produzir e a
 * referência que o smoke compara.
 */
export function createResetColoring60JourneyState(activityIds = []) {
  const ids = Array.isArray(activityIds) ? activityIds.filter((id) => typeof id === 'string') : [];
  return deriveColoring60JourneyState({
    activities: ids.map((id) => createColoring60ActivityState(id)),
    finaleSeen: false,
  });
}
