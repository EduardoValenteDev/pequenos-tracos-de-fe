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

// ─────────────────────────────────────────────────────────────────────────────
// AÇÃO PRIMÁRIA POR ORIGEM — MARCO NARRATIVO vs JORNADA INDEPENDENTE (C60 · CTA contextual)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Origem da abertura do editor Colorir 60. Decide o CONTRATO da ação primária após "Pronto" — e o faz
 * por FATO estrutural (de onde a criança veio), NUNCA pelo texto de um botão.
 *   STORY_MILESTONE — o editor foi aberto por um MARCO da narrativa: a criança está DENTRO da história.
 *   STANDALONE      — aberto fora da narrativa (cartão-trilha/coleção): a jornada de cores é o contexto.
 */
export const COLORING60_OPEN_ORIGIN = Object.freeze({
  STORY_MILESTONE: 'storyMilestone',
  STANDALONE: 'standalone',
});

/**
 * Dois destinos DISTINTOS ⇒ dois textos DISTINTOS (decisão do bloco: "não usar o mesmo texto para
 * dois destinos"):
 *   CONTINUAR A HISTÓRIA — RETOMA a narrativa na cena de retorno do marco (a criança volta para a
 *                          história de onde veio; não "sai" do Colorir 60 para fora).
 *   VOLTAR À AVENTURA    — SAI do Colorir 60 para a StoryDetail de "A Criação" (encerra a jornada de
 *                          cores). Reservado ao fluxo INDEPENDENTE — nunca reaproveitado no marco.
 */
export const COLORING60_CONTINUE_STORY_LABEL = 'Continuar a história';
export const COLORING60_BACK_TO_STORY_LABEL = 'Voltar à aventura';

/**
 * deriveColoring60PrimaryAction — a AÇÃO PRIMÁRIA do cartão de conclusão após "Pronto", decidida por
 * FATOS estruturados, JAMAIS lendo o texto de um botão. Entradas: origin, activityId, returnSceneId
 * (cena 1-based de retorno do marco), completionMode e collectionComplete.
 *
 * FLUXO DE MARCO (origin = STORY_MILESTONE): a criança está DENTRO da história ⇒ a ação é SEMPRE
 * CONTINUAR A HISTÓRIA (retoma na cena de retorno). Isso NÃO varia por `completionMode` (parcial,
 * 3/3/finale, atualização) nem por `collectionComplete` — mesmo num 3/3 legítimo dentro da narrativa,
 * não se oferece "ver coleção"/"próxima parte", que tirariam a criança da história. `activityId` entra
 * no contrato mas não altera a decisão do marco (o `activityId` real segue no roteamento da tela). O
 * `kind` é BACK (a tela roteia o marco pela retomada, por `origin`, não pelo texto); o RÓTULO é distinto
 * do da saída, para os dois destinos nunca se confundirem.
 *
 * SEM `storyId` DE PROPÓSITO: este módulo é STORY-AGNOSTIC (invariante travado — só conhece as três
 * atividades). A identidade da obra vive na camada de navegação/catálogo, e a decisão do marco não
 * depende dela (o piloto é exclusivo de "A Criação" e o rótulo é o mesmo para qualquer história).
 *
 * FLUXO INDEPENDENTE (qualquer outra origem): devolve `null` — a tela mantém a ação da PRÓPRIA jornada
 * (onde "Voltar à aventura" segue significando SAIR para a StoryDetail).
 */
export function deriveColoring60PrimaryAction({
  origin = null,
  activityId = null,
  returnSceneId = null,
  completionMode = null,
  collectionComplete = null,
} = {}) {
  // activityId/completionMode/collectionComplete são ACEITOS de propósito e IGNORADOS no marco: fazê-los
  // parte da assinatura torna a INVARIÂNCIA por modo/estado provável no smoke (mudar qualquer um deles
  // não muda a ação do marco). Referência inócua para deixar a intenção explícita no código.
  void activityId; void completionMode; void collectionComplete;
  if (origin === COLORING60_OPEN_ORIGIN.STORY_MILESTONE) {
    return Object.freeze({
      kind: COLORING60_ACTION.BACK,
      label: COLORING60_CONTINUE_STORY_LABEL,
      returnSceneId: Number.isInteger(returnSceneId) ? returnSceneId : null,
    });
  }
  return null;
}

/**
 * reframeColoring60JourneyForMilestone — reenquadra a jornada de conclusão para o MARCO: UMA única
 * ação primária (CONTINUAR A HISTÓRIA), sem secundária/terciária. A jornada VISUAL (contagens, modo,
 * trilha, celebração) segue INTACTA — só as AÇÕES exibidas mudam. Puro; deriva a ação por
 * `deriveColoring60PrimaryAction` (origem = marco), nunca pelo texto do botão original.
 */
export function reframeColoring60JourneyForMilestone(journey, { returnSceneId = null } = {}) {
  const base = journey && typeof journey === 'object' ? journey : {};
  return {
    ...base,
    primaryAction: deriveColoring60PrimaryAction({
      origin: COLORING60_OPEN_ORIGIN.STORY_MILESTONE,
      activityId: base.currentActivityId ?? null,
      returnSceneId,
      completionMode: base.completionMode ?? null,
      collectionComplete: base.allActivitiesComplete === true,
    }),
    secondaryAction: null,
    tertiaryAction: null,
  };
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

  // AÇÕES DA TELA PRÓPRIA DE COLEÇÃO (C60 · Parte 7 + seleção visual). A coleção deixou de ser uma
  // camada sobre o desenho aberto e virou uma TELA — então "Continuar neste desenho" não existe
  // mais aqui: não há "este desenho".
  //
  // Com as três prontas há UMA única ação: "Voltar à aventura". O antigo botão global "Colorir
  // novamente" foi REMOVIDO de propósito: ele reabria SEMPRE a primeira parte (Luz), uma
  // preferência arbitrária, sem deixar a criança escolher qual obra rever. A própria COLEÇÃO é
  // agora o seletor — cada uma das três obras é tocável e abre a SUA prévia ampliada (com o SEU
  // activityId, jamais 'light'). Por isso `secondaryAction` é `null` no estado completo: nada de
  // botão que atropela a escolha. Faltando parte, a principal convida a completar (sem fingir que
  // a criação está inteira) e a secundária continua sendo a saída sem culpa.
  const primaryAction = allComplete
    ? { kind: COLORING60_ACTION.BACK, label: 'Voltar à aventura' }
    : { kind: COLORING60_ACTION.OPEN_NEXT, label: 'Completar a jornada de cores', targetActivityId: nextId };
  const secondaryAction = allComplete
    ? null
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

/**
 * Instrução DISCRETA sob as obras: ensina que a coleção é o seletor (tocar abre a prévia ampliada).
 * É uma linha curta, não um cartão — a galeria continua sendo a protagonista da tela.
 */
export const COLORING60_COLLECTION_TAP_HINT = 'Toque em uma criação para ver de perto.';

// ─────────────────────────────────────────────────────────────────────────────
// PRÉVIA AMPLIADA DE UMA OBRA (C60 · seleção visual)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reconhecimento do Beni na PRÉVIA de uma obra CONCLUÍDA (kind = art), POR ATIVIDADE. O bloco reprovou
 * a fala ÚNICA e genérica ("Que obra linda! Olhe de pertinho.") repetida IGUAL nas três prévias — cara
 * de template (EVID 7). Cada parte da Criação merece um reconhecimento próprio, ligado ao que a criança
 * pintou. Texto literal aprovado — não parafrasear. Uma atividade fora do mapa cai numa admiração
 * neutra: nunca a frase-template reprovada e nunca "de pertinho".
 */
export const COLORING60_PREVIEW_ART_REACTION = Object.freeze({
  light: 'Olha como a sua luz ficou brilhante!',
  living_world: 'Quanta vida você encheu de cor!',
  people_and_care: 'Seu cuidado deixou a Criação especial!',
});
export const COLORING60_PREVIEW_ART_REACTION_FALLBACK = 'Que obra linda você fez!';

/**
 * Pose do Beni na prévia, por TIPO de vaga. São poses JÁ EXISTENTES (nenhum asset novo) e a reação
 * é CURTA — jamais a grande celebração de 3 de 3, que aqui não se repete. Ver/editar uma obra
 * concluída é uma vista, não uma festa.
 */
export const COLORING60_PREVIEW_POSE = Object.freeze({
  art: 'admiraDireita',       // admira a obra ao lado — reconhecimento, não celebração
  notPersisted: 'ensinando',  // acolhe com honestidade: "você coloriu, o plano não guardou os pixels"
  needsColor: 'atelie',       // convida a dar cor de novo
  empty: 'atelie',            // convida a colorir esta parte
});

/**
 * deriveColoring60ArtPreview — DERIVAÇÃO da PRÉVIA AMPLIADA de UMA obra (C60 · seleção visual).
 *
 * PURO e SÍNCRONO: recebe o TIPO já reconciliado da vaga (`kind` ∈ art | notPersisted | needsColor |
 * empty — os MESMOS literais de `SLOT` no leitor canônico) e devolve o que a tela mostra: se a arte
 * aparece, a reação curta do Beni, a pose (existente) e os rótulos das DUAS saídas. Um `kind`
 * desconhecido cai em `empty` (estado honesto) — jamais em "arte válida".
 *
 * O `activityId` entra APENAS para escolher o reconhecimento por atividade (EVID 7) — NUNCA decide
 * navegação: `editAction` jamais carrega `targetActivityId`, então a tela injeta o id da vaga e é
 * impossível esta derivação "cair em light". E NÃO conclui, NÃO celebra, NÃO escreve: é uma vista.
 *
 * ESTADOS HONESTOS (exigência do bloco):
 *   art          — pintura válida ⇒ a prévia mostra a obra; ação principal edita o desenho.
 *   notPersisted — concluída no plano Grátis, sem pixels guardados ⇒ não finge uma prévia; oferece
 *                  colorir a parte de novo.
 *   needsColor   — concluída sem arte recuperável (ponteiro órfão) ⇒ "precisa de cor de novo".
 *   empty        — ainda não concluída ⇒ não se apresenta como concluída; convida a colorir.
 */
export function deriveColoring60ArtPreview({ kind = 'empty', activityId = null } = {}) {
  const k = ['art', 'notPersisted', 'needsColor', 'empty'].indexOf(kind) >= 0 ? kind : 'empty';
  const artVisible = k === 'art';

  const editLabel = k === 'art'
    ? 'Editar desenho'
    : (k === 'empty' ? 'Colorir esta parte' : 'Colorir esta parte novamente');

  // Obra CONCLUÍDA (art): reconhecimento POR ATIVIDADE (EVID 7) — cada parte tem a sua fala, jamais a
  // frase-template única. Estados honestos seguem por TIPO: a mensagem acolhedora não depende de qual
  // parte é (só de "concluída-sem-pixels" / "precisa de cor" / "ainda falta colorir").
  const reaction = k === 'art'
    ? (COLORING60_PREVIEW_ART_REACTION[activityId] ?? COLORING60_PREVIEW_ART_REACTION_FALLBACK)
    : {
        notPersisted: 'Você coloriu esta parte!',
        needsColor: 'Esta parte precisa de cor de novo.',
        empty: 'Ainda falta colorir esta parte.',
      }[k];

  return Object.freeze({
    kind: k,
    artVisible,
    // A ação principal SEMPRE leva ao editor da PRÓPRIA obra (a tela injeta o activityId da vaga).
    editAction: Object.freeze({ kind: COLORING60_ACTION.RESTART, label: editLabel }),
    backAction: Object.freeze({ kind: COLORING60_ACTION.BACK, label: 'Voltar' }),
    reaction,
    beniPose: COLORING60_PREVIEW_POSE[k],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PONTE PÓS-HISTÓRIA (C60 · Parte 10)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fala do Beni no topo da conclusão da história, VARIÁVEL pelo progresso REAL reconciliado da coleção.
 * O bug físico era uma mensagem ÚNICA ("A história terminou. Agora vamos dar cor à Criação?") que
 * convidava a "começar" mesmo para quem já tinha 1, 2 ou 3 partes coloridas. Agora cada estado tem sua
 * própria fala + rótulo de ação, na linguagem infantil aprovada pelo fundador:
 *   start      (0 de N)   — ainda não começou            → "Colorir com o Beni"
 *   continue   (1..N-2)   — começou, faltam algumas       → "Continuar colorindo"
 *   lastOne    (N-1 de N)  — falta só a última            → "Colorir a última parte"
 *   complete   (N de N)    — coleção completa             → "Ver minha coleção"
 *   readFailed (?)         — leitura indisponível: HONESTO → "Ver minha coleção" (nunca "começar")
 * `message` e `label` ficam JUNTOS por estado para não espalhar a lógica 0/1/2/3 por várias telas.
 */
export const COLORING60_STORY_BRIDGE_COPY = Object.freeze({
  start: Object.freeze({ message: 'A história terminou. Vamos começar a dar cor à Criação?', label: 'Colorir com o Beni' }),
  continue: Object.freeze({ message: 'Você começou sua coleção! Vamos colorir mais uma parte?', label: 'Continuar colorindo' }),
  lastOne: Object.freeze({ message: 'Falta só uma criação para completar sua coleção!', label: 'Colorir a última parte' }),
  complete: Object.freeze({ message: 'Sua coleção da Criação está completa!', label: 'Ver minha coleção' }),
  readFailed: Object.freeze({ message: 'Não consegui carregar sua coleção agora.', label: 'Ver minha coleção' }),
});

/**
 * Título que passa a abrigar TODO o restante da conclusão (livrinho, quiz, próxima aventura,
 * recompensas, certificado, resumo). A tela pós-história não é redesenhada neste bloco: ela ganha
 * uma hierarquia — primeiro o próximo passo, depois o que foi conquistado.
 */
export const COLORING60_STORY_REST_TITLE = 'Veja tudo que você conquistou';

/**
 * deriveColoring60StoryBridge — DERIVAÇÃO da mensagem pós-história pelo estado REAL reconciliado
 * (§Parte 10 · PROBLEMA 4). A mensagem e o rótulo variam pelo MESMO `doneMap` reconciliado que a
 * coleção usa — nunca uma frase única que convida a "começar" para quem já pintou 1, 2 ou 3 partes:
 *   0 de N   ⇒ start      "…Vamos começar a dar cor à Criação?"  · ação "Colorir com o Beni"     (OPEN_NEXT)
 *   1..N-2   ⇒ continue   "Você começou sua coleção!…"           · ação "Continuar colorindo"    (OPEN_NEXT)
 *   N-1 de N ⇒ lastOne    "Falta só uma criação…"                · ação "Colorir a última parte" (OPEN_NEXT)
 *   N de N   ⇒ complete   "Sua coleção da Criação está completa!" · ação "Ver minha coleção"       (COLLECTION)
 *
 * LEITURA INDISPONÍVEL (`readFailed: true`): o chamador só passa isso quando a leitura reconciliada
 * FALHOU. Aqui NÃO se assume 0 de 3, NÃO se exibe o convite de "começar" e NÃO se olha "já concluiu
 * alguma vez" — devolve uma fala HONESTA e uma ação segura ("Ver minha coleção"), com `completedCount`
 * nulo para a tela esconder o contador. A tela, por sua vez, preserva a última ponte válida quando a
 * tem; este ramo é a rede honesta quando não há estado anterior para preservar.
 *
 * A lógica 0/1/2/3 vive AQUI e só aqui — mensagem e rótulo saem juntos de `COLORING60_STORY_BRIDGE_COPY`,
 * um par por estado, para não se espalhar por várias telas. Puro e síncrono: recebe o retrato, devolve
 * a decisão. Não navega, não lê. `state` é exposto para o smoke provar cada estado sem inferir por texto.
 */
export function deriveColoring60StoryBridge({ doneMap = {}, order = null, readFailed = false } = {}) {
  if (readFailed) {
    const copy = COLORING60_STORY_BRIDGE_COPY.readFailed;
    return Object.freeze({
      state: 'readFailed',
      readFailed: true,
      message: copy.message,
      restSectionTitle: COLORING60_STORY_REST_TITLE,
      completedCount: null,
      totalActivities: 0,
      allActivitiesComplete: false,
      nextIncompleteActivityId: null,
      action: Object.freeze({ kind: COLORING60_ACTION.COLLECTION, label: copy.label, targetActivityId: null }),
      progressLabel: null,
    });
  }

  const ids = normalizeOrder(order);
  const total = ids.length;
  const completedCount = ids.filter((id) => isDone(doneMap, id)).length;
  const allComplete = total > 0 && completedCount >= total;
  const nextId = allComplete ? null : nextIncompleteActivityId(doneMap, ids);

  let state;
  if (allComplete) state = 'complete';
  else if (completedCount === 0) state = 'start';
  else if (total > 0 && completedCount === total - 1) state = 'lastOne';
  else state = 'continue';

  const copy = COLORING60_STORY_BRIDGE_COPY[state];
  const action = allComplete
    ? { kind: COLORING60_ACTION.COLLECTION, label: copy.label, targetActivityId: null }
    : { kind: COLORING60_ACTION.OPEN_NEXT, label: copy.label, targetActivityId: nextId ?? ids[0] ?? null };

  return Object.freeze({
    state,
    readFailed: false,
    message: copy.message,
    restSectionTitle: COLORING60_STORY_REST_TITLE,
    completedCount,
    totalActivities: total,
    allActivitiesComplete: allComplete,
    nextIncompleteActivityId: nextId,
    action: Object.freeze(action),
    progressLabel: `${completedCount} de ${total}`,
  });
}
