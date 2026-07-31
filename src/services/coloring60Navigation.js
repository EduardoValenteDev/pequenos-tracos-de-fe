/**
 * coloring60Navigation.js — CONTRATO ÚNICO de navegação do piloto Colorir 60 ("A Criação").
 *
 * POR QUE ESTE MÓDULO EXISTE. As telas do piloto (StoryDetail → Coleção → Prévia → Editor →
 * Conclusão) viviam espalhando `navigate`/`goBack`/`replace` cada uma do seu jeito. O resultado
 * físico (reprovado pelo fundador): a pilha CRESCIA a cada ida-e-volta (Story→Coleção→Prévia→Editor→
 * Conclusão→Coleção→Prévia…), "Voltar à aventura" caía na PRÉVIA em vez da história, e "Ver minha
 * coleção" chegava a criar uma SEGUNDA coleção. A causa é sempre a mesma: navegação por CONTAGEM de
 * `goBack` (frágil, depende de quantas telas há embaixo) em vez de por DESTINO SEMÂNTICO.
 *
 * O CONTRATO. Aqui a intenção da criança tem NOME ("voltar à aventura", "ver a coleção", "editar esta
 * obra") e um único dono decide COMO realizá-la, sempre por destino:
 *   - "Voltar à aventura"  → volta DIRETO à tela da história (StoryDetail), removendo TODA tela do
 *                            piloto acima dela, num só toque. (FLUXO 5/6)
 *   - "Ver minha coleção"  → chega à coleção como INSTÂNCIA ÚNICA (nunca duas). (FLUXO 5)
 *   - "Editar desenho"     → abre o editor da PRÓPRIA obra CONSUMINDO a prévia (a prévia não fica
 *                            empilhada por baixo do editor). Sem fallback para 'light'. (FLUXO 3)
 *   - "Voltar" (na prévia) → volta à coleção (instância única), um só Voltar. (FLUXO 4)
 *   - abrir coleção/prévia → entradas por NOME (dedup por rota), sem empilhar duplicatas. (FLUXO 1/2)
 *
 * COMO É RASTREÁVEL E TESTÁVEL. A decisão é PURA: cada `planC60*` recebe os NOMES das rotas hoje na
 * pilha (`routeNames`) + os nomes-alvo e devolve um DESCRITOR (`{ op, route, params, merge }`) — sem
 * tocar em navegador nenhum. O executor `runC60Nav` só DESPACHA o descritor, defensivamente (checa
 * `typeof navigation.<op> === 'function'` e cai num caminho seguro se a API faltar). Assim o smoke
 * prova o comportamento SEM device: monta uma pilha fictícia, chama o planejador e confere o
 * descritor; e monta um navegador-gravador falso, chama o wrapper e confere o método disparado.
 *
 * SEM IMPORTS DE PROPÓSITO. O módulo é livre de imports (as constantes de rota são declaradas aqui e
 * cruzadas com `src/constants/routes.js` por uma prova no smoke) para que o avaliador puro do smoke
 * execute os planejadores E o executor de verdade. A verdade final continua sendo o teste físico.
 */

// Nomes de rota do piloto — DECLARADOS localmente (módulo livre de imports). Uma prova do smoke
// cruza estes valores com `src/constants/routes.js` (STORY_DETAIL/COLORING/COLORING60_COLLECTION/
// COLORING60_ART_PREVIEW/NARRATION): se divergirem, o smoke fica vermelho — nunca um drift
// silencioso. `narration` entrou com os MARCOS NARRATIVOS (Parte B): "voltar à aventura" depois de
// colorir um marco RETOMA a história numa cena — logo o contrato precisa saber o nome dessa rota.
export const C60_NAV_ROUTES = {
  story: 'StoryDetail',
  editor: 'Coloring',
  collection: 'Coloring60Collection',
  preview: 'Coloring60ArtPreview',
  narration: 'Narration',
};

// Operações do descritor. Um conjunto FECHADO — o executor conhece exatamente estas e nada mais.
export const C60_NAV_OP = {
  POP_TO: 'popTo',       // remove tudo acima do destino achado; com merge preserva os params dele
  POP_TO_TOP: 'popToTop',// volta à raiz (fallback honesto quando o destino não está na pilha)
  REPLACE: 'replace',    // troca o topo pela rota nova (consome a tela atual)
  NAVIGATE: 'navigate',  // entra por nome (React Navigation deduplica por nome na pilha)
  GO_BACK: 'goBack',     // recuo simples de uma tela
};

// ORIGENS de abertura do editor. Um editor aberto por um MARCO NARRATIVO (o Beni convida no meio da
// história) carrega `origin: STORY_MILESTONE` para que a saída "Voltar à aventura" RETOME a história
// na próxima cena, em vez de sair para a tela da história (o destino da entrada normal "Colorir").
// Conjunto FECHADO: qualquer outro valor (ou ausência) é tratado como entrada normal (sem retomada).
export const C60_NAV_ORIGIN = {
  STORY_MILESTONE: 'storyMilestone',
};

// ─────────────────────────────────────────────────────────────────────────────
// PLANEJADORES PUROS (livres de navegador — o smoke executa cada um).
// `routeNames` é o array de nomes das rotas hoje na pilha, da base (história) ao topo.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "Voltar à aventura" (FLUXO 5 conclusão · FLUXO 6 coleção). Destino semântico = a tela da história.
 * - StoryDetail está na pilha (fluxo real da criança: as duas entradas do piloto partem dela) →
 *   `popTo(StoryDetail, undefined, {merge:true})`: remove TODA tela do piloto acima e PRESERVA o
 *   `story` já carregado (params undefined + merge = mantém os params existentes — verificado no
 *   reducer POP_TO do routers 7.5.5). Um só toque, destino exato.
 * - StoryDetail AUSENTE (entradas de dev: bancada Colorir 60 / Área dos Pais, onde a história não
 *   está embaixo) → `popToTop()`: sai do piloto sem NUNCA cair no ramo "não achou" do popTo (que
 *   substituiria o topo por um StoryDetail SEM `story` e quebraria o cabeçalho). Caminho seguro.
 */
export function planC60Exit(routeNames, storyRoute) {
  const names = Array.isArray(routeNames) ? routeNames : [];
  if (names.indexOf(storyRoute) !== -1) {
    return { op: C60_NAV_OP.POP_TO, route: storyRoute, params: undefined, merge: true };
  }
  return { op: C60_NAV_OP.POP_TO_TOP };
}

/**
 * "Ver minha coleção" a partir da CONCLUSÃO no editor (FLUXO 5). Instância ÚNICA, jamais duas:
 * - já existe uma coleção na pilha (veio Coleção→Prévia→Editor) → `popTo(Collection, {storyId})`:
 *   remove prévia+editor e pousa na coleção que já existia.
 * - não existe coleção (veio StoryDetail→Editor direto) → `replace(Collection, {storyId})`: o editor
 *   dá lugar à coleção, então o "Voltar à aventura" dela cai na história (não no desenho fechado).
 */
export function planC60OpenCollection(routeNames, collectionRoute, storyId) {
  const names = Array.isArray(routeNames) ? routeNames : [];
  const params = { storyId };
  if (names.indexOf(collectionRoute) !== -1) {
    return { op: C60_NAV_OP.POP_TO, route: collectionRoute, params, merge: true };
  }
  return { op: C60_NAV_OP.REPLACE, route: collectionRoute, params };
}

/**
 * "Editar desenho" a partir da PRÉVIA (FLUXO 3). `replace` CONSOME a prévia: o editor toma o lugar
 * dela, então a prévia não fica empilhada por baixo (era uma das fontes do acúmulo). Abre a PRÓPRIA
 * obra — o `activityId` é o da obra aberta, NUNCA um fallback para 'light'.
 */
export function planC60Edit(editorRoute, storyId, activityId) {
  return { op: C60_NAV_OP.REPLACE, route: editorRoute, params: { storyId, activityId } };
}

/**
 * "Voltar" na PRÉVIA (FLUXO 4). Volta à coleção como instância única:
 * - coleção na pilha (caso normal: a prévia nasceu da coleção) → `popTo(Collection, {storyId})`.
 * - sem coleção (deep-link direto à prévia) → `goBack()` honesto.
 */
export function planC60BackFromPreview(routeNames, collectionRoute, storyId) {
  const names = Array.isArray(routeNames) ? routeNames : [];
  if (names.indexOf(collectionRoute) !== -1) {
    return { op: C60_NAV_OP.POP_TO, route: collectionRoute, params: { storyId }, merge: true };
  }
  return { op: C60_NAV_OP.GO_BACK };
}

/** Abrir a COLEÇÃO a partir da história (FLUXO 1). Entrada por nome (dedup por rota). */
export function planC60OpenCollectionFromStory(collectionRoute, storyId) {
  return { op: C60_NAV_OP.NAVIGATE, route: collectionRoute, params: { storyId } };
}

/** Abrir a PRÉVIA a partir da coleção (FLUXO 2). Entrada por nome; a prévia relê a obra por identidade. */
export function planC60OpenPreview(previewRoute, storyId, activityId) {
  return { op: C60_NAV_OP.NAVIGATE, route: previewRoute, params: { storyId, activityId } };
}

/** Abrir o EDITOR a partir da história (entrada direta "Colorir"). Entrada por nome, identidade só. */
export function planC60OpenEditorFromStory(editorRoute, storyId, activityId) {
  return { op: C60_NAV_OP.NAVIGATE, route: editorRoute, params: { storyId, activityId } };
}

/**
 * Abrir o EDITOR a partir de um MARCO NARRATIVO (Parte B · "Colorir agora" do convite do Beni). A
 * interceptação acontece na NarrationScreen, então a tela de cima é a própria NARRAÇÃO da cena
 * recém-concluída: `replace` a CONSOME — o editor toma o lugar da narração, sem empilhar (a pilha
 * não cresce a cada marco, exatamente como as demais entradas do piloto).
 *
 * O editor recebe a IDENTIDADE da obra (`storyId`+`activityId`, NUNCA um fallback "light") e três
 * campos que só existem no fluxo de marco: `origin: STORY_MILESTONE` (marca o fluxo), `story` (o
 * objeto da história, para remontar a narração ao voltar) e `resumeCenaIndex` (0-based = a próxima
 * cena, decidida pelo catálogo na fronteira da NarrationScreen). O editor é agnóstico: ele só CARREGA
 * esse alvo de retomada e o devolve ao contrato quando a criança termina.
 *
 * `resolveC60StoryId` aceita `storyId` e `story.id` quando CONCORDAM (é o caso: ambos = a mesma
 * história); e o seletor do editor escolhe o ramo Colorir 60 pela PRESENÇA de `activityId` — então
 * levar o `story` junto não desvia para o corpo legado (que é escolhido pela AUSÊNCIA de activityId).
 */
export function planC60OpenEditorFromMilestone(editorRoute, storyId, activityId, story, resumeCenaIndex) {
  return {
    op: C60_NAV_OP.REPLACE,
    route: editorRoute,
    params: { storyId, activityId, story, origin: C60_NAV_ORIGIN.STORY_MILESTONE, resumeCenaIndex },
  };
}

/**
 * "Voltar à aventura" DEPOIS de colorir um marco (Parte B · decisão do fundador Q1 = "próxima cena da
 * história"). Retoma a história na cena de retorno com uma NARRAÇÃO NOVA:
 * - `story` presente e `resumeCenaIndex` inteiro ≥ 0 → `replace(Narration, { story, cenaIndex })`. O
 *   `replace` CONSOME o editor (topo) e MONTA uma narração fresca na cena de retorno. Monta fresca de
 *   propósito: a NarrationScreen deriva tudo do `cenaIndex` a cada mount e troca de cena sempre por
 *   `replace` — uma retomada por mutação de params reusaria a instância e arriscaria um AudioPlayer
 *   preso da cena anterior. Fresca = áudio/estado da cena certa, sem resíduo.
 * - `story` ausente OU `resumeCenaIndex` inválido (não-inteiro/negativo) → SAÍDA SEGURA por
 *   `planC60Exit` (volta à tela da história, ou à raiz numa entrada de dev). Nunca fabrica uma
 *   narração sem história nem "chuta" uma cena: uma retomada impossível degrada para o destino
 *   honesto da história, jamais para uma cena inventada ou para 'light'.
 */
export function planC60ResumeStory(narrationRoute, storyRoute, routeNames, story, resumeCenaIndex) {
  const validIndex = Number.isInteger(resumeCenaIndex) && resumeCenaIndex >= 0;
  const validStory = story != null && typeof story === 'object';
  if (validStory && validIndex) {
    return { op: C60_NAV_OP.REPLACE, route: narrationRoute, params: { story, cenaIndex: resumeCenaIndex } };
  }
  return planC60Exit(routeNames, storyRoute);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTOR — despacha o descritor no navegador REAL, defensivamente. Nenhuma decisão de destino aqui.
// ─────────────────────────────────────────────────────────────────────────────

/** Nomes das rotas hoje na pilha (base→topo). Tolera navegador ausente/estado atípico. */
export function c60RouteNames(navigation) {
  try {
    const state = navigation && typeof navigation.getState === 'function' ? navigation.getState() : null;
    const routes = state && Array.isArray(state.routes) ? state.routes : [];
    return routes.map((r) => (r && r.name) || null).filter((n) => n != null);
  } catch (e) {
    return [];
  }
}

/**
 * Executa UM descritor de plano. Cada `op` tem um caminho principal (API do stack v7) e um fallback
 * seguro se aquele método não existir no navegador (ex.: um navegador sem stack): assim a intenção
 * nunca vira um beco sem saída.
 */
export function runC60Nav(navigation, plan) {
  if (!navigation || !plan || !plan.op) return;
  const merge = plan.merge === true ? { merge: true } : undefined;
  switch (plan.op) {
    case C60_NAV_OP.POP_TO:
      if (typeof navigation.popTo === 'function') { navigation.popTo(plan.route, plan.params, merge); return; }
      navigation.navigate(plan.route, plan.params); // fallback: pula para a rota existente ou empilha
      return;
    case C60_NAV_OP.POP_TO_TOP:
      if (typeof navigation.popToTop === 'function') { navigation.popToTop(); return; }
      navigation.goBack();
      return;
    case C60_NAV_OP.REPLACE:
      if (typeof navigation.replace === 'function') { navigation.replace(plan.route, plan.params); return; }
      navigation.navigate(plan.route, plan.params);
      return;
    case C60_NAV_OP.NAVIGATE:
      navigation.navigate(plan.route, plan.params);
      return;
    case C60_NAV_OP.GO_BACK:
    default:
      if (typeof navigation.goBack === 'function') navigation.goBack();
      return;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WRAPPERS DE ALTO NÍVEL — o que as telas chamam. Leem a pilha, planejam e despacham. UM ponto por
// intenção; nenhuma tela decide método de navegação por conta própria.
// ─────────────────────────────────────────────────────────────────────────────

/** FLUXO 5/6 — "Voltar à aventura": DIRETO à história, removendo todo o piloto acima. */
export function c60ExitToStory(navigation) {
  runC60Nav(navigation, planC60Exit(c60RouteNames(navigation), C60_NAV_ROUTES.story));
}

/** FLUXO 5 — "Ver minha coleção" (da conclusão): instância única. */
export function c60OpenCollectionFromCompletion(navigation, storyId) {
  runC60Nav(navigation, planC60OpenCollection(c60RouteNames(navigation), C60_NAV_ROUTES.collection, storyId));
}

/** FLUXO 3 — "Editar desenho" (da prévia): consome a prévia, abre a própria obra. */
export function c60EditFromPreview(navigation, storyId, activityId) {
  runC60Nav(navigation, planC60Edit(C60_NAV_ROUTES.editor, storyId, activityId));
}

/** FLUXO 4 — "Voltar" (da prévia): à coleção, instância única. */
export function c60BackFromPreview(navigation, storyId) {
  runC60Nav(navigation, planC60BackFromPreview(c60RouteNames(navigation), C60_NAV_ROUTES.collection, storyId));
}

/** FLUXO 1 — abrir a coleção a partir da história. */
export function c60OpenCollectionFromStory(navigation, storyId) {
  runC60Nav(navigation, planC60OpenCollectionFromStory(C60_NAV_ROUTES.collection, storyId));
}

/** FLUXO 2 — abrir a prévia a partir da coleção. */
export function c60OpenPreview(navigation, storyId, activityId) {
  runC60Nav(navigation, planC60OpenPreview(C60_NAV_ROUTES.preview, storyId, activityId));
}

/** Entrada direta "Colorir" da história → editor. */
export function c60OpenEditorFromStory(navigation, storyId, activityId) {
  runC60Nav(navigation, planC60OpenEditorFromStory(C60_NAV_ROUTES.editor, storyId, activityId));
}

/**
 * Parte B — "Colorir agora" do convite do Beni: abre o editor do marco CONSUMINDO a narração da cena.
 * Recebe os campos por NOME (fácil de ler no ponto de chamada; storyId/activityId/story/resumeCenaIndex
 * são fáceis de trocar por posição). `story` e `resumeCenaIndex` só existem para a RETOMADA posterior.
 */
export function c60OpenEditorFromMilestone(navigation, { storyId, activityId, story, resumeCenaIndex } = {}) {
  runC60Nav(
    navigation,
    planC60OpenEditorFromMilestone(C60_NAV_ROUTES.editor, storyId, activityId, story, resumeCenaIndex),
  );
}

/**
 * Parte B — "Voltar à aventura" do editor de um marco: retoma a história na próxima cena (narração
 * fresca). Lê a pilha atual para a saída segura do `planC60ResumeStory` (quando não dá para montar a
 * narração). Chamado pela ColoringScreen SOMENTE quando `origin === STORY_MILESTONE`.
 */
export function c60ResumeStoryAfterMilestone(navigation, { story, resumeCenaIndex } = {}) {
  runC60Nav(
    navigation,
    planC60ResumeStory(C60_NAV_ROUTES.narration, C60_NAV_ROUTES.story, c60RouteNames(navigation), story, resumeCenaIndex),
  );
}
