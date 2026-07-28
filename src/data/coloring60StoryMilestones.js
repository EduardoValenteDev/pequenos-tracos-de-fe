/**
 * coloring60StoryMilestones.js — MARCOS NARRATIVOS do piloto Colorir 60 ("A Criação").
 *
 * O QUE É. O catálogo PURO que amarra CENAS da história a ATIVIDADES de colorir do piloto. Só
 * "A Criação" tem marcos neste bloco (Noé e as demais histórias ⇒ lista vazia — nada de marco
 * fora do piloto). Cada marco diz: "depois que a criança CONCLUIR a cena X, o Beni pode convidá-la
 * a colorir a atividade Y; ao terminar, ela RETOMA a história na PRÓXIMA cena (X+1)".
 *
 * POR QUE DERIVADO, NUNCA UM ESTADO NOVO. A disponibilidade do marco NÃO é uma flag persistida: é
 * DERIVADA de um fato que já existe — a cena foi concluída. Este módulo é só o MAPA (cena→atividade
 * e cena→retorno); quem pergunta "a cena X foi concluída?" é a NarrationScreen (no fluxo real, o
 * convite só aparece na PRIMEIRA conclusão da cena, quando `!jaConcluida`). Assim não há um segundo
 * lugar guardando "marco liberado" que possa divergir do progresso verdadeiro.
 *
 * CORRESPONDÊNCIA (verificada contra `src/data/stories.js`, `cenas[]` de 'creation', 10 cenas):
 *   • cena 2  "Haja luz"         → atividade `light`           → retoma na cena 3  "O céu e as águas"
 *   • cena 7  "Animais da terra" → atividade `living_world`    → retoma na cena 8  "O ser humano"
 *   • cena 9  "Era muito bom"    → atividade `people_and_care` → retoma na cena 10 "O descanso de Deus"
 * As cenas 2/7/9 são exatamente os marcos definidos pelo fundador; as cenas de retorno 3/8/10 existem.
 *
 * AJUSTE FINAL (bloco C60 · marcos): o marco do Cuidado saiu da cena 8 para a cena 9 (retorno 9→10).
 * A cena 8 ("O ser humano") passa a TERMINAR normalmente, sem convite; a cena 9 ("Era muito bom", o
 * "tudo era muito bom" da Criação) é onde o Beni convida ao Cuidado; ao voltar, a criança retoma na
 * cena 10 ("O descanso de Deus"), que NÃO emite novo convite. `unlockAfterScene`/`resumeScene`
 * mudaram JUNTOS — o retorno acompanha o gatilho, jamais só um dos dois.
 *
 * INVARIANTE. `resumeScene === unlockAfterScene + 1` para TODO marco — "voltar à aventura" leva à
 * PRÓXIMA cena da história (decisão do fundador), nunca de volta à cena que a criança acabou de ver.
 *
 * SEM IMPORTS DE PROPÓSITO. Como o contrato de navegação, este módulo é livre de imports para que o
 * avaliador puro do smoke o execute de verdade. Uma prova do smoke cruza os `activityId` daqui com
 * `getColoring60Activities('creation')` (coloring60Catalog): se divergirem, o smoke fica vermelho —
 * nunca um marco apontando para uma atividade que não existe.
 *
 * NÚMEROS DE CENA são 1-based (o `numeroCena` que a NarrationScreen usa = `cenaIndex + 1`). A conversão
 * para `cenaIndex` (0-based) acontece na fronteira da tela/nav, nunca aqui — este módulo fala a língua
 * NARRATIVA (cena 2, cena 7…), a mesma do fundador.
 */

// Mapa fechado história → marcos. Só 'creation' neste bloco (piloto). `Object.freeze` em cada nível
// para que o catálogo seja imutável em runtime (nenhuma tela reordena/edita marcos por engano).
export const COLORING60_STORY_MILESTONES = Object.freeze({
  creation: Object.freeze([
    Object.freeze({ activityId: 'light', unlockAfterScene: 2, resumeScene: 3 }),
    Object.freeze({ activityId: 'living_world', unlockAfterScene: 7, resumeScene: 8 }),
    Object.freeze({ activityId: 'people_and_care', unlockAfterScene: 9, resumeScene: 10 }),
  ]),
});

// Fala do Beni por atividade — o texto do MODAL ÚNICO da cena-marco (2/7/9). Não há mais dois modais:
// numa cena-marco elegível, ESTE convite É a experiência pós-cena (celebra a descoberta em uma frase e
// oferece colorir), no lugar da celebração genérica; nas demais cenas, a celebração genérica segue
// como sempre. Cada texto amarra a fala ao que a criança ACABOU de ver na cena, com linguagem
// infantil, poucas palavras e sem pressão — sem emoji no corpo (o avatar do Beni carrega a emoção).
// `title` celebra o momento; `body` faz o convite; `accept`/`skip` são as DUAS escolhas claras
// ("Colorir agora" / "Continuar a história"), iguais entre marcos, mas declaradas por atividade para
// que o texto fique junto do seu contexto e o smoke consiga conferir cada um.
//
// Os textos seguem a intenção do fundador para cada cena:
//   • cena 2  (light)           "Você descobriu a luz! Vamos dar cor a esse momento?"
//   • cena 7  (living_world)    "O mundo ficou cheio de vida! Quer colorir essa parte comigo?"
//   • cena 9  (people_and_care) "A Criação ficou muito boa! Vamos mostrar nosso cuidado com as cores?"
const COLORING60_MILESTONE_INVITE_COPY = Object.freeze({
  light: Object.freeze({
    title: 'Você descobriu a luz!',
    body: 'Vamos dar cor a esse momento?',
    accept: 'Colorir agora',
    skip: 'Continuar a história',
  }),
  living_world: Object.freeze({
    title: 'O mundo ficou cheio de vida!',
    body: 'Quer colorir essa parte comigo?',
    accept: 'Colorir agora',
    skip: 'Continuar a história',
  }),
  people_and_care: Object.freeze({
    title: 'A Criação ficou muito boa!',
    body: 'Vamos mostrar nosso cuidado com as cores?',
    accept: 'Colorir agora',
    skip: 'Continuar a história',
  }),
});

/**
 * getColoring60StoryMilestones(storyId) — os marcos desta história, em ordem, ou lista VAZIA quando a
 * história não faz parte do piloto (Noé e demais ⇒ []). Nunca lança; entrada inválida ⇒ [].
 */
export function getColoring60StoryMilestones(storyId) {
  if (storyId == null) return [];
  const list = COLORING60_STORY_MILESTONES[storyId];
  return Array.isArray(list) ? list : [];
}

/**
 * getColoring60MilestoneForCompletedScene(storyId, completedSceneNumber) — o marco cujo gatilho é a
 * cena RECÉM-concluída, ou `null` se aquela cena NÃO é um marco. É a leitura que a interceptação da
 * NarrationScreen faz com o `numeroCena` da cena concluída.
 *
 * SEM FALLBACK PARA 'light'. Uma cena não-marco (1, 3, 4, 5, 6, 8, 10) devolve `null` — jamais um
 * marco "chutado". Só as cenas 2/7/9 abrem convite; qualquer outra segue a história direto.
 */
export function getColoring60MilestoneForCompletedScene(storyId, completedSceneNumber) {
  if (!Number.isInteger(completedSceneNumber)) return null;
  const list = getColoring60StoryMilestones(storyId);
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].unlockAfterScene === completedSceneNumber) return list[i];
  }
  return null;
}

/**
 * getColoring60MilestoneByActivityId(storyId, activityId) — o marco de uma atividade específica, ou
 * `null` se aquela atividade não é um marco desta história. Usado quando já se tem a identidade da
 * obra (ex.: ao decidir a cena de retorno a partir do `activityId` aberto).
 */
export function getColoring60MilestoneByActivityId(storyId, activityId) {
  if (activityId == null) return null;
  const list = getColoring60StoryMilestones(storyId);
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].activityId === activityId) return list[i];
  }
  return null;
}

/**
 * getColoring60MilestoneInviteCopy(activityId) — a fala do Beni (título, corpo, rótulos dos dois
 * botões) para o convite daquela atividade, ou `null` se a atividade não tem convite. `null` significa
 * "sem convite", nunca um texto genérico inventado.
 */
export function getColoring60MilestoneInviteCopy(activityId) {
  if (activityId == null) return null;
  return COLORING60_MILESTONE_INVITE_COPY[activityId] || null;
}

/**
 * C60_POST_SCENE — as DUAS experiências mutuamente exclusivas que podem seguir a conclusão de uma cena.
 * Não coexistem: o fluxo escolhe UMA. Nomeá-las evita "montar dois modais e esconder um por estilo".
 *   • GENERIC_CELEBRATION     — a celebração de cena que já existia (cena comum, ou marco não elegível).
 *   • COLORING_MILESTONE_INVITE — o modal ÚNICO do marco (celebra + convida a colorir), no lugar dela.
 */
export const C60_POST_SCENE = Object.freeze({
  GENERIC_CELEBRATION: 'genericCelebration',
  COLORING_MILESTONE_INVITE: 'coloringMilestoneInvite',
});

/**
 * derivePostSceneExperience — DECISÃO PURA de qual experiência mostrar ao concluir uma cena. É o único
 * lugar que decide entre celebração genérica e convite de marco; a tela só obedece ao resultado (nunca
 * monta os dois). Sem storage, sem navegação, sem efeitos — só entrada → saída, para o smoke executar.
 *
 * CAMINHO A → COLORING_MILESTONE_INVITE: a cena é um marco elegível (`milestone` presente), a atividade
 *   AINDA não foi concluída e o convite daquele marco AINDA não foi visto. Só então o convite substitui
 *   a celebração genérica — que NÃO deve aparecer antes nem depois dele.
 * CAMINHO B → GENERIC_CELEBRATION: cena comum (`milestone` nulo) OU atividade já concluída OU convite
 *   já visto. Segue a celebração de sempre; o convite não abre. (Fail-safe: qualquer dúvida cai aqui —
 *   pior caso é a celebração normal, nunca um convite repetido.)
 *
 * @param {object} p
 * @param {object|null} p.milestone               marco da cena recém-concluída (null se não é marco)
 * @param {boolean}     p.activityAlreadyComplete  a atividade de colorir daquele marco já foi concluída?
 * @param {boolean}     p.inviteAlreadySeen        o convite daquele marco já foi apresentado antes?
 * @returns {'genericCelebration'|'coloringMilestoneInvite'}
 */
export function derivePostSceneExperience({
  milestone = null,
  activityAlreadyComplete = false,
  inviteAlreadySeen = false,
} = {}) {
  if (milestone && !activityAlreadyComplete && !inviteAlreadySeen) {
    return C60_POST_SCENE.COLORING_MILESTONE_INVITE;
  }
  return C60_POST_SCENE.GENERIC_CELEBRATION;
}

export default {
  COLORING60_STORY_MILESTONES,
  C60_POST_SCENE,
  getColoring60StoryMilestones,
  getColoring60MilestoneForCompletedScene,
  getColoring60MilestoneByActivityId,
  getColoring60MilestoneInviteCopy,
  derivePostSceneExperience,
};
