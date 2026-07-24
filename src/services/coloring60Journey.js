/**
 * coloring60Journey.js — DERIVAÇÃO CANÔNICA da jornada de cores de "A Criação" (Colorir 60).
 *
 * As três atividades NÃO são desenhos avulsos: são as três partes de UMA pequena jornada dentro da
 * história — 1. Luz · 2. Vida · 3. Cuidado. Este módulo é a ÚNICA fonte que decide, a partir do
 * progresso real, o que a criança acabou de completar, quanto já completou, o que vem depois e
 * quais ações a experiência deve oferecer. Nada aqui é aleatório e nada aqui é reinferido em outro
 * lugar: a tela de história (cartão-trilha), a celebração (overlay) e a máquina de conclusão
 * (ColoringScreen) consomem ESTAS funções.
 *
 * CONTRATO ARQUITETURAL (por que este arquivo não importa nada):
 *   - FUNÇÕES PURAS, SÍNCRONAS e SEM DEPENDÊNCIAS: sem React, sem AsyncStorage, sem catálogo, sem
 *     navegação, sem I/O. Recebe o retrato (`doneMap`, `currentActivityId`, `order`) e devolve a
 *     derivação. Isso torna a decisão EXECUTÁVEL no smoke (o harness extrai o fonte e roda as
 *     funções REAIS — mutar uma regra muda o veredito) e impossível de "vazar" efeito colateral.
 *   - NÃO lê nem escreve conclusão (`coloring60ActivityService`) nem pixels (`coloring60DrawingStorage`):
 *     a separação CONCLUSÃO ≠ SALVAMENTO continua intacta. Este módulo só DERIVA.
 *   - NÃO decide autorização/plano. Concluir é plan-agnóstico; quem restringe persistência é o writer.
 *   - A ORDEM CANÔNICA aqui é a MESMA do catálogo fechado (`coloring60Catalog`). Não importamos o
 *     catálogo para manter o módulo puro; a coerência entre os dois é PROVADA no smoke (a prova
 *     compara ordem e títulos literais com o catálogo real — drift reprova o gate).
 *
 * LIBERDADE DA CRIANÇA (invariante de produto): a jornada RECOMENDA um caminho, nunca o impõe. Toda
 * atividade permanece abrível individualmente; `nextIncompleteActivityId` é apenas a primeira ainda
 * não concluída NA ORDEM CANÔNICA. Se a criança começar pela terceira, as cópias de "próxima parte"
 * acompanham a atividade REAL que vem a seguir — nunca um texto fixo que mentiria sobre o caminho.
 */

/** Ordem canônica das três partes: 1. Luz · 2. Vida · 3. Cuidado. Espelha o catálogo fechado. */
export const COLORING60_CANONICAL_ORDER = Object.freeze(['light', 'living_world', 'people_and_care']);

/** Títulos que a criança vê (idênticos ao catálogo — coerência provada no smoke). */
export const COLORING60_ACTIVITY_TITLE = Object.freeze({
  light: 'Haja luz',
  living_world: 'O mundo cheio de vida',
  people_and_care: 'Na criação de Deus',
});

/** Elo temático de cada parte (é o que transforma três desenhos em UMA jornada). */
export const COLORING60_ACTIVITY_THEME = Object.freeze({
  light: 'Luz',
  living_world: 'Vida',
  people_and_care: 'Cuidado',
});

/**
 * Convite da PRÓXIMA parte, por atividade de DESTINO (nunca por posição). Assim o convite continua
 * verdadeiro mesmo quando a criança escolhe a ordem que quiser.
 */
export const COLORING60_NEXT_MESSAGE = Object.freeze({
  light: 'Agora vamos acender a primeira luz do mundo!',
  living_world: 'Agora vamos colorir plantas, bichos e o mar!',
  people_and_care: 'Agora vamos mostrar cuidado em cada cor!',
});

/**
 * Modos de conclusão (semântica canônica):
 *   UPDATE — a atividade JÁ estava concluída antes de salvar (recolorir/editar).
 *   FIRST  — primeira conclusão desta atividade e ainda falta parte (0→1 ou 1→2).
 *   FINALE — primeira conclusão E transição REAL 2→3 (jamais se repete em edições posteriores).
 * O valor de fio de FIRST é 'activity' — nome já estabelecido no contrato do overlay e nas provas
 * comportamentais existentes. A semântica é a de PRIMEIRA CONCLUSÃO; o literal é histórico.
 */
export const COLORING60_MODE = Object.freeze({ UPDATE: 'update', FIRST: 'activity', FINALE: 'finale' });

/**
 * Intenções de ação (o QUE fazer), separadas do rótulo (o que a criança lê) e de COMO navegar (a
 * tela decide). Nenhuma ação daqui navega: elas descrevem a intenção.
 */
export const COLORING60_ACTION = Object.freeze({
  OPEN_NEXT: 'openNext',        // abrir DIRETO a próxima parte incompleta (sem voltar à lista)
  STAY: 'stayHere',             // fechar a celebração e continuar NESTE desenho
  BACK: 'backToStory',          // voltar à aventura, com o progresso guardado
  COLLECTION: 'openCollection', // ver a coleção das três obras
  RESTART: 'restart',           // recomeçar a jornada pela primeira parte
});

/** Estados visuais de cada passo da trilha. */
export const COLORING60_STEP_STATE = Object.freeze({
  LOCKED: 'locked',
  DONE: 'done',
  NEXT: 'next',
  IN_PROGRESS: 'inProgress',
  AVAILABLE: 'available',
});

/** Texto auxiliar único: a criança pode parar quando quiser, sem perder nada. */
export const COLORING60_HELPER_TEXT = 'Seu progresso fica guardado.';

/** Nome da coleção completa (mesma identificação usada na grande conclusão). */
export const COLORING60_COLLECTION_TITLE = 'Minha Criação Cheia de Cor';

/**
 * Modo de fio da COLEÇÃO. Não entra em `COLORING60_MODE` porque não é um modo de CONCLUSÃO: ninguém
 * "conclui em coleção". É uma VISTA revisitável (a criança pode abrir a coleção quantas vezes quiser,
 * sem que isso conte como nova conclusão nem repita a grande conclusão — §Parte 5).
 */
export const COLORING60_COLLECTION_MODE = 'collection';

function normalizeOrder(order) {
  if (!Array.isArray(order)) return COLORING60_CANONICAL_ORDER;
  const ids = order.filter((id) => typeof id === 'string' && id.length > 0);
  return ids.length > 0 ? ids : COLORING60_CANONICAL_ORDER;
}

function isDone(doneMap, id) {
  return !!doneMap && doneMap[id] === true;
}

/** Concluídas na ORDEM CANÔNICA (nunca na ordem em que a criança pintou). */
export function orderedCompleted(doneMap, order) {
  return normalizeOrder(order).filter((id) => isDone(doneMap, id));
}

/** Primeira atividade ainda NÃO concluída na ordem canônica; null quando as três estão prontas. */
export function nextIncompleteActivityId(doneMap, order) {
  const found = normalizeOrder(order).find((id) => !isDone(doneMap, id));
  return found === undefined ? null : found;
}

/** "2 de 3 concluídas" / "1 de 3 concluída" — concordância correta, sem improviso na interface. */
export function completionCountLabel(count, total) {
  return `${count} de ${total} ${count === 1 ? 'concluída' : 'concluídas'}`;
}

/**
 * deriveColoring60Completion — DERIVAÇÃO CANÔNICA do momento de conclusão (§Parte 1).
 *
 * Entrada: o retrato ANTES de salvar (`doneMapBefore`), a atividade que acabou de ser concluída
 * (`currentActivityId`) e a ordem (padrão: canônica).
 * Saída (congelada): completedBefore/After, contagens, atividade atual, próxima incompleta, se tudo
 * está completo, o modo e as ações primária/secundária/terciária — mais a trilha e o convite da
 * próxima parte já prontos para a interface.
 *
 * Identidade desconhecida (fora da ordem) ⇒ NADA é dado como concluído e o modo cai em UPDATE: a
 * derivação jamais inventa progresso a partir de um id que não reconhece.
 */
export function deriveColoring60Completion({
  doneMapBefore = {},
  currentActivityId = null,
  order = null,
} = {}) {
  const ids = normalizeOrder(order);
  const total = ids.length;
  const known = typeof currentActivityId === 'string' && ids.indexOf(currentActivityId) >= 0;
  const wasAlreadyDone = known && isDone(doneMapBefore, currentActivityId);

  const completedBefore = ids.filter((id) => isDone(doneMapBefore, id));
  const doneMapAfter = {};
  ids.forEach((id) => {
    doneMapAfter[id] = isDone(doneMapBefore, id) || (known && id === currentActivityId);
  });
  const completedAfter = ids.filter((id) => doneMapAfter[id] === true);
  const completedCountBefore = completedBefore.length;
  const completedCountAfter = completedAfter.length;
  const allActivitiesComplete = total > 0 && completedCountAfter >= total;

  const nextFound = ids.find((id) => doneMapAfter[id] !== true);
  const nextId = nextFound === undefined ? null : nextFound;

  // UPDATE quando já estava concluída (ou quando a identidade é desconhecida — nada foi concluído).
  // FINALE só na transição REAL 2→3 de PRIMEIRA vez. FIRST no restante das primeiras conclusões.
  const completionMode = (!known || wasAlreadyDone)
    ? COLORING60_MODE.UPDATE
    : (allActivitiesComplete ? COLORING60_MODE.FINALE : COLORING60_MODE.FIRST);

  // A próxima é a ÚLTIMA que falta? Muda o título da área e o rótulo do convite ("última" vs "próxima").
  const nextIsLast = nextId != null && completedCountAfter === total - 1;

  let primaryAction = null;
  let secondaryAction = null;
  let tertiaryAction = null;

  if (completionMode === COLORING60_MODE.UPDATE) {
    if (allActivitiesComplete) {
      // §Parte 7 · UPDATE com 3 de 3: NÃO existe próxima parte — não se sugere o que não há.
      primaryAction = { kind: COLORING60_ACTION.COLLECTION, label: 'Ver minha coleção', targetActivityId: ids[total - 1] ?? null };
      secondaryAction = { kind: COLORING60_ACTION.STAY, label: 'Continuar neste desenho' };
      tertiaryAction = { kind: COLORING60_ACTION.BACK, label: 'Voltar à aventura', link: true };
    } else {
      // §Parte 6 · UPDATE com progresso incompleto: a jornada continua sendo o caminho principal.
      primaryAction = { kind: COLORING60_ACTION.OPEN_NEXT, label: 'Continuar a jornada', targetActivityId: nextId };
      secondaryAction = { kind: COLORING60_ACTION.STAY, label: 'Continuar neste desenho' };
      tertiaryAction = { kind: COLORING60_ACTION.BACK, label: 'Terminar depois', link: true };
    }
  } else if (completionMode === COLORING60_MODE.FINALE) {
    // §Parte 5 · grande conclusão: ver a coleção, voltar à aventura, colorir novamente (link).
    primaryAction = { kind: COLORING60_ACTION.COLLECTION, label: 'Ver meus desenhos', targetActivityId: currentActivityId };
    secondaryAction = { kind: COLORING60_ACTION.BACK, label: 'Voltar à aventura' };
    tertiaryAction = { kind: COLORING60_ACTION.RESTART, label: 'Colorir novamente', targetActivityId: ids[0] ?? null, link: true };
  } else {
    // §Parte 3/4 · primeira conclusão: avançar DIRETO para a próxima parte, ou terminar depois.
    primaryAction = {
      kind: COLORING60_ACTION.OPEN_NEXT,
      label: nextIsLast ? 'Vamos para a última!' : 'Vamos para a próxima!',
      targetActivityId: nextId,
    };
    secondaryAction = { kind: COLORING60_ACTION.BACK, label: 'Terminar depois' };
    tertiaryAction = null;
  }

  // Trilha do momento: o que já está cheio de cor, o que acabou de ser preenchido e o que vem depois.
  const steps = ids.map((id) => Object.freeze({
    activityId: id,
    title: COLORING60_ACTIVITY_TITLE[id] ?? id,
    theme: COLORING60_ACTIVITY_THEME[id] ?? '',
    done: doneMapAfter[id] === true,
    justCompleted: known && id === currentActivityId && !wasAlreadyDone,
    next: id === nextId,
  }));

  // Convite da próxima parte — SÓ na primeira conclusão (§Parte 3/4). Em UPDATE e no FINALE não há
  // convite: no primeiro a criança já conhece o caminho, no segundo não há mais parte alguma.
  const nextPart = (completionMode === COLORING60_MODE.FIRST && nextId != null)
    ? Object.freeze({
      activityId: nextId,
      isLast: nextIsLast,
      sectionTitle: nextIsLast ? 'Última parte' : 'Próxima parte',
      activityTitle: COLORING60_ACTIVITY_TITLE[nextId] ?? '',
      message: COLORING60_NEXT_MESSAGE[nextId] ?? '',
      helperText: COLORING60_HELPER_TEXT,
    })
    : null;

  return Object.freeze({
    completedBefore: Object.freeze(completedBefore),
    completedAfter: Object.freeze(completedAfter),
    completedCountBefore,
    completedCountAfter,
    totalActivities: total,
    currentActivityId: known ? currentActivityId : null,
    nextIncompleteActivityId: nextId,
    allActivitiesComplete,
    completionMode,
    primaryAction: Object.freeze(primaryAction),
    secondaryAction: Object.freeze(secondaryAction),
    tertiaryAction: tertiaryAction ? Object.freeze(tertiaryAction) : null,
    // Derivados prontos para a interface (nenhuma tela recalcula contagem nem concordância):
    doneMapAfter: Object.freeze(doneMapAfter),
    steps: Object.freeze(steps),
    nextPart,
    countLabel: completionCountLabel(completedCountAfter, total),
  });
}

/**
 * deriveColoring60CardState — DERIVAÇÃO do cartão-trilha "Colorir com o Beni" na tela da história
 * (§Parte 2). Mesma ordem canônica, mesma noção de "próxima recomendada" e a AÇÃO PRINCIPAL dinâmica
 * por progresso (0/3 começar · 1/3 continuar · 2/3 completar · 3/3 ver a coleção).
 *
 * `inProgressMap` é OPCIONAL e hoje NÃO é alimentado: o writer de pixels é arquiteturalmente isolado
 * ao ColoringScreen (guard C60-P3→P4.T2), então a tela da história não sabe de arte parcial. O estado
 * "Em andamento" existe aqui para quando esse sinal existir — sem ele, nenhum passo o recebe.
 */
export function deriveColoring60CardState({
  doneMap = {},
  unlocked = false,
  inProgressMap = null,
  order = null,
} = {}) {
  const ids = normalizeOrder(order);
  const total = ids.length;
  const completed = ids.filter((id) => isDone(doneMap, id));
  const completedCount = completed.length;
  const allComplete = unlocked === true && total > 0 && completedCount >= total;

  const nextFound = (unlocked === true && !allComplete)
    ? ids.find((id) => !isDone(doneMap, id))
    : undefined;
  const nextId = nextFound === undefined ? null : nextFound;

  const steps = ids.map((id) => {
    let state;
    if (unlocked !== true) state = COLORING60_STEP_STATE.LOCKED;
    else if (isDone(doneMap, id)) state = COLORING60_STEP_STATE.DONE;
    else if (inProgressMap && inProgressMap[id] === true) state = COLORING60_STEP_STATE.IN_PROGRESS;
    else if (id === nextId) state = COLORING60_STEP_STATE.NEXT;
    else state = COLORING60_STEP_STATE.AVAILABLE;
    return Object.freeze({
      activityId: id,
      title: COLORING60_ACTIVITY_TITLE[id] ?? id,
      theme: COLORING60_ACTIVITY_THEME[id] ?? '',
      state,
      done: state === COLORING60_STEP_STATE.DONE,
      recommended: state === COLORING60_STEP_STATE.NEXT,
    });
  });

  let primaryAction = null;
  if (unlocked === true) {
    if (allComplete) {
      primaryAction = { kind: COLORING60_ACTION.COLLECTION, label: 'Ver minha coleção', targetActivityId: ids[total - 1] ?? null };
    } else if (completedCount === 0) {
      primaryAction = { kind: COLORING60_ACTION.OPEN_NEXT, label: 'Começar a jornada de cores', targetActivityId: nextId ?? ids[0] ?? null };
    } else if (completedCount === total - 1) {
      primaryAction = { kind: COLORING60_ACTION.OPEN_NEXT, label: 'Completar a jornada de cores', targetActivityId: nextId };
    } else {
      primaryAction = { kind: COLORING60_ACTION.OPEN_NEXT, label: 'Continuar a jornada de cores', targetActivityId: nextId };
    }
  }

  return Object.freeze({
    completedCount,
    totalActivities: total,
    allComplete,
    nextIncompleteActivityId: nextId,
    steps: Object.freeze(steps),
    primaryAction: primaryAction ? Object.freeze(primaryAction) : null,
    progressLabel: `${completedCount} de ${total}`,
  });
}

/**
 * deriveColoring60CollectionView — DERIVAÇÃO da vista "minha coleção": as três obras reunidas como
 * UMA criação. É o destino de `COLORING60_ACTION.COLLECTION` (grande conclusão, UPDATE 3/3 e cartão
 * 3/3) e é REVISITÁVEL — abrir a coleção não conclui nada, não repete a grande conclusão e não
 * concede recompensa; por isso é uma VISTA (`COLORING60_COLLECTION_MODE`), não um modo de conclusão.
 *
 * As imagens reais NÃO vêm daqui (este módulo é puro e não lê pixels): a tela é quem carrega as artes
 * salvas. Daqui vêm a identificação, a contagem, a trilha completa e as ações.
 *
 * A coleção também é derivada quando ainda FALTA parte (a criança pode chegar por um caminho que a
 * exiba parcial): nesse caso `allComplete` é falso e a ação principal convida a completar em vez de
 * mentir que a criação está inteira.
 */
export function deriveColoring60CollectionView({ doneMap = {}, order = null } = {}) {
  const ids = normalizeOrder(order);
  const total = ids.length;
  const completed = ids.filter((id) => isDone(doneMap, id));
  const completedCount = completed.length;
  const allComplete = total > 0 && completedCount >= total;
  const nextFound = allComplete ? undefined : ids.find((id) => !isDone(doneMap, id));
  const nextId = nextFound === undefined ? null : nextFound;

  const steps = ids.map((id) => Object.freeze({
    activityId: id,
    title: COLORING60_ACTIVITY_TITLE[id] ?? id,
    theme: COLORING60_ACTIVITY_THEME[id] ?? '',
    done: isDone(doneMap, id),
    justCompleted: false,
    next: id === nextId,
  }));

  // AÇÕES DA TELA PRÓPRIA DE COLEÇÃO (C60 · Parte 7). A coleção deixou de ser uma camada sobre o
  // desenho aberto e virou uma TELA — então "Continuar neste desenho" não existe mais aqui: não há
  // "este desenho". Com as três prontas, a ação principal é sair pela porta da frente (voltar à
  // aventura) e a secundária é recomeçar a jornada de cores. Faltando parte, a principal convida a
  // completar em vez de fingir que a criação está inteira.
  const primaryAction = allComplete
    ? { kind: COLORING60_ACTION.BACK, label: 'Voltar à aventura' }
    : { kind: COLORING60_ACTION.OPEN_NEXT, label: 'Completar a jornada de cores', targetActivityId: nextId };
  const secondaryAction = allComplete
    ? { kind: COLORING60_ACTION.RESTART, label: 'Colorir novamente', targetActivityId: ids[0] ?? null }
    : { kind: COLORING60_ACTION.BACK, label: 'Voltar à aventura' };

  return Object.freeze({
    mode: COLORING60_COLLECTION_MODE,
    collectionTitle: COLORING60_COLLECTION_TITLE,
    completedCount,
    totalActivities: total,
    allActivitiesComplete: allComplete,
    nextIncompleteActivityId: nextId,
    steps: Object.freeze(steps),
    primaryAction: Object.freeze(primaryAction),
    secondaryAction: Object.freeze(secondaryAction),
    tertiaryAction: null,
    countLabel: `${completedCount} de ${total}`,
    progressLabel: `${completedCount} de ${total}`,
  });
}

/** Mensagem em superfície sólida sob as três obras (C60 · Parte 7). */
export const COLORING60_COLLECTION_MESSAGE = 'Você encheu a Criação de luz, vida e cuidado!';

/** Texto do carregamento da coleção — nunca lineart piscando no lugar da obra (C60 · Parte 8). */
export const COLORING60_COLLECTION_LOADING = 'Montando sua coleção...';

// ─────────────────────────────────────────────────────────────────────────────
// PONTE PÓS-HISTÓRIA (C60 · Parte 10)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fala do Beni no topo da conclusão da história. Duas linhas, na ordem exata: primeiro reconhece o
 * que acabou, depois convida ao passo seguinte. É o texto literal aprovado — não parafrasear.
 */
export const COLORING60_STORY_BRIDGE_MESSAGE = 'A história terminou.\nAgora vamos dar cor à Criação?';

/**
 * Título que passa a abrigar TODO o restante da conclusão (livrinho, quiz, próxima aventura,
 * recompensas, certificado, resumo). A tela pós-história não é redesenhada neste bloco: ela ganha
 * uma hierarquia — primeiro o próximo passo, depois o que foi conquistado.
 */
export const COLORING60_STORY_REST_TITLE = 'Veja tudo que você conquistou';

/**
 * deriveColoring60StoryBridge — DERIVAÇÃO da ponte entre a história e a jornada de cores (§Parte 10).
 *
 * Uma ÚNICA ação, dinâmica pelo progresso REAL (o mesmo `doneMap` reconciliado que a coleção usa):
 *   0 de 3   ⇒ "Começar a jornada de cores"   (abre a primeira parte que falta)
 *   1–2 de 3 ⇒ "Continuar a jornada de cores" (abre a próxima parte que falta, na ordem canônica)
 *   3 de 3   ⇒ "Ver minha coleção"            (abre a coleção; não há parte a sugerir)
 *
 * Por que a ponte NÃO oferece um leque de opções: a evidência física era justamente uma tela
 * sobrecarregada, em que o próximo passo (colorir com o Beni) não aparecia. Aqui existe UM convite;
 * tudo o mais continua na tela, abaixo, sob `COLORING60_STORY_REST_TITLE`.
 *
 * Puro e síncrono como o resto do módulo: recebe o retrato, devolve a decisão. Não navega, não lê.
 */
export function deriveColoring60StoryBridge({ doneMap = {}, order = null } = {}) {
  const ids = normalizeOrder(order);
  const total = ids.length;
  const completedCount = ids.filter((id) => isDone(doneMap, id)).length;
  const allComplete = total > 0 && completedCount >= total;
  const nextId = allComplete ? null : nextIncompleteActivityId(doneMap, ids);

  const action = allComplete
    ? { kind: COLORING60_ACTION.COLLECTION, label: 'Ver minha coleção', targetActivityId: null }
    : {
      kind: COLORING60_ACTION.OPEN_NEXT,
      label: completedCount === 0 ? 'Começar a jornada de cores' : 'Continuar a jornada de cores',
      targetActivityId: nextId ?? ids[0] ?? null,
    };

  return Object.freeze({
    message: COLORING60_STORY_BRIDGE_MESSAGE,
    restSectionTitle: COLORING60_STORY_REST_TITLE,
    completedCount,
    totalActivities: total,
    allActivitiesComplete: allComplete,
    nextIncompleteActivityId: nextId,
    action: Object.freeze(action),
    progressLabel: `${completedCount} de ${total}`,
  });
}
