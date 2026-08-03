/**
 * storyContentAuthorization.js — FONTE ÚNICA da autorização de ENTRADA NO CONTEÚDO de uma história.
 *
 * O defeito que este módulo existe para matar: uma história aparecia bloqueada e, mesmo assim,
 * deixava abrir cartões de cena, iniciar a narração, avançar e GRAVAR progresso. O bloqueio era
 * aparência, não autorização. Aqui ele vira decisão de domínio, e todas as telas consultam ESTA
 * decisão — nenhuma reimplementa a regra por conta própria.
 *
 * DUAS permissões que nunca se confundem:
 *   · canViewStoryDetails  — pin no mapa, modal, capa, resumo, progresso preservado, tela de
 *                            detalhes. Uma história bloqueada CONTINUA visível e consultável.
 *   · canEnterStoryContent — iniciar/continuar cenas, abrir a NarrationScreen, avançar entre cenas,
 *                            gravar novo progresso. Uma história bloqueada NÃO entra no conteúdo.
 * Bloquear a entrada nunca fecha os detalhes; abrir os detalhes nunca autoriza a entrada.
 *
 * ESTE MÓDULO NÃO REDEFINE REGRA NENHUMA. As regras comercial, de mídia e de sequência continuam
 * morando em `storyJourneyService`/`contentAccessService`: aqui elas são apenas LIDAS do contrato
 * já calculado (`journeyStatus`) e COMPOSTAS numa resposta única. Se a regra mudar lá, muda aqui
 * junto, sem edição — é de propósito.
 *
 * Puro: sem storage, sem navegação, sem React, sem efeito colateral. Recebe fatos, devolve decisão.
 */
import { COMMERCIAL_ACCESS } from './storyJourneyService';

/**
 * Razões distinguíveis da decisão. `reason` explica os FATOS CONHECIDOS neste instante — só é uma
 * verdade sobre a história quando `authorizationReady` é true (ver `deriveStoryContentAuthorization`).
 */
export const CONTENT_AUTH_REASON = Object.freeze({
  ALLOWED: 'allowed',
  SEQUENCE_LOCKED: 'sequenceLocked',
  COMMERCIAL_LOCKED: 'commercialLocked',
  MEDIA_UNAVAILABLE: 'mediaUnavailable',
  INVALID_STORY: 'invalidStory',
});

/** Os requisitos que fecham a jornada de uma história — o vocabulário da mensagem de pendência. */
export const STORY_REQUIREMENT = Object.freeze({
  SCENES: 'scenes',
  COLORING: 'coloring',
  STORY_BOOK: 'storyBook',
  QUIZ: 'quiz',
  REFLECTION: 'reflection',
});

/** Ordem canônica em que a criança percorre a aventura — e em que a frase os lista. */
export const STORY_REQUIREMENT_ORDER = Object.freeze([
  STORY_REQUIREMENT.SCENES,
  STORY_REQUIREMENT.COLORING,
  STORY_REQUIREMENT.STORY_BOOK,
  STORY_REQUIREMENT.QUIZ,
  STORY_REQUIREMENT.REFLECTION,
]);

// Rótulos com artigo embutido: a frase se monta sem gramática espalhada pelas telas.
const REQUIREMENT_LABEL = Object.freeze({
  scenes: 'as Cenas',
  coloring: 'o Colorir com o Beni',
  storyBook: 'o Livrinho',
  quiz: 'o Quiz',
  reflection: 'a Reflexão',
});

/**
 * O que ainda falta para a jornada de uma história fechar — a EXPLICAÇÃO do veredito, nunca o
 * veredito em si (quem decide é `journeyComplete`, calculado em `storyJourneyService`).
 *
 * O Colorir só entra quando é obrigatório naquela história (`coloringRequired`): as histórias sem
 * atividade de cor nunca podem ficar devendo algo que não existe.
 *
 * Invariante coberta por prova: a lista vazia acontece exatamente quando `journeyComplete` é true.
 */
export function missingStoryRequirements(status) {
  const s = status && typeof status === 'object' ? status : null;
  if (!s) return [];
  const faltando = [];
  if (s.scenesComplete !== true) faltando.push(STORY_REQUIREMENT.SCENES);
  if (s.coloringRequired === true && s.coloringComplete !== true) faltando.push(STORY_REQUIREMENT.COLORING);
  if (s.bookOpened !== true) faltando.push(STORY_REQUIREMENT.STORY_BOOK);
  if (s.quizDone !== true) faltando.push(STORY_REQUIREMENT.QUIZ);
  if (s.reflectionDone !== true) faltando.push(STORY_REQUIREMENT.REFLECTION);
  return faltando;
}

/**
 * A decisão. Recebe o contrato JÁ calculado da história (e o da anterior, quando existe) e devolve
 * as duas permissões, a razão e — quando é a sequência que segura — o que exatamente falta.
 *
 * Precedência das razões (a sequência é a ÚLTIMA a falar, nunca sequestra as outras):
 *   invalidStory → mediaUnavailable → commercialLocked → sequenceLocked → allowed
 * Assim uma história paga fora de ordem responde COMERCIAL, e uma sem mídia responde MÍDIA — as
 * regras de pack e de paywall continuam valendo exatamente como já valiam.
 *
 * `hydrated` é a honestidade sobre o próprio conhecimento: enquanto o progresso não terminou de
 * carregar, os mapas estão vazios e TODA história fora da primeira pareceria bloqueada. Nesse
 * intervalo `authorizationReady` é false e `canEnterStoryContent` é false — falha para o lado
 * seguro (não entra), sem nunca fechar os detalhes nem exibir mensagem de pendência.
 */
export function deriveStoryContentAuthorization(params) {
  const p = params && typeof params === 'object' ? params : {};
  const storyId = typeof p.storyId === 'string' && p.storyId.length > 0 ? p.storyId : null;
  const previousStoryId = typeof p.previousStoryId === 'string' && p.previousStoryId.length > 0
    ? p.previousStoryId
    : null;
  const status = p.journeyStatus && typeof p.journeyStatus === 'object' ? p.journeyStatus : null;
  const previousStatus = p.previousStatus && typeof p.previousStatus === 'object' ? p.previousStatus : null;
  const authorizationReady = p.hydrated === true;

  // História conhecida = existe no catálogo E tem contrato calculado. Sem isso não há o que mostrar
  // nem o que abrir: é a única situação em que os detalhes também não fazem sentido.
  const knownStory = storyId !== null && p.knownStory !== false && status !== null;
  const canViewStoryDetails = knownStory;

  let reason = CONTENT_AUTH_REASON.INVALID_STORY;
  if (knownStory) {
    const access = status.access;
    if (access === COMMERCIAL_ACCESS.COMING_SOON) {
      reason = CONTENT_AUTH_REASON.MEDIA_UNAVAILABLE;
    } else if (access !== COMMERCIAL_ACCESS.FREE && access !== COMMERCIAL_ACCESS.PREMIUM) {
      reason = CONTENT_AUTH_REASON.COMMERCIAL_LOCKED;
    } else if (status.sequenceUnlocked !== true) {
      reason = CONTENT_AUTH_REASON.SEQUENCE_LOCKED;
    } else {
      reason = CONTENT_AUTH_REASON.ALLOWED;
    }
  }

  const allowed = reason === CONTENT_AUTH_REASON.ALLOWED;
  const sequenceLocked = reason === CONTENT_AUTH_REASON.SEQUENCE_LOCKED;

  return {
    // `allowed` responde "os fatos conhecidos permitem entrar?"; `canEnterStoryContent` responde
    // "este toque pode abrir conteúdo AGORA?" — que exige, além disso, fatos confiáveis.
    allowed,
    reason,
    storyId,
    previousStoryId,
    missingRequirements: sequenceLocked ? missingStoryRequirements(previousStatus) : [],
    canViewStoryDetails,
    canEnterStoryContent: authorizationReady && allowed,
    authorizationReady,
  };
}

// "o Livrinho, o Quiz e a Reflexão" — vírgula até o penúltimo, "e" antes do último.
function joinRequirementLabels(ids) {
  const rotulos = ids.map(id => REQUIREMENT_LABEL[id]).filter(Boolean);
  if (rotulos.length === 0) return '';
  if (rotulos.length === 1) return rotulos[0];
  return `${rotulos.slice(0, -1).join(', ')} e ${rotulos[rotulos.length - 1]}`;
}

function orderRequirements(lista) {
  if (!Array.isArray(lista)) return [];
  return STORY_REQUIREMENT_ORDER.filter(id => lista.indexOf(id) > -1);
}

/**
 * A explicação que a criança lê quando a sequência segura a história — e SOMENTE nesse caso.
 * Lista apenas o que realmente falta: nada de "complete a aventura anterior" genérico, e nada de
 * cobrar o que já foi feito. Sem culpa, sem ameaça, sem perda, sem linguagem comercial.
 *
 * Devolve `null` quando não há o que dizer (outra razão, dados ainda hidratando ou nada pendente),
 * para que a tela simplesmente não renderize o bloco.
 */
export function describeStorySequenceLock(params) {
  const p = params && typeof params === 'object' ? params : {};
  if (p.reason !== CONTENT_AUTH_REASON.SEQUENCE_LOCKED) return null;
  if (p.authorizationReady !== true) return null;

  const faltando = orderRequirements(p.missingRequirements);
  if (faltando.length === 0) return null;

  const anterior = typeof p.previousStoryTitle === 'string' && p.previousStoryTitle.length > 0
    ? p.previousStoryTitle
    : null;
  const atual = typeof p.storyTitle === 'string' && p.storyTitle.length > 0 ? p.storyTitle : null;

  return {
    title: anterior ? `Falta um pouquinho em ${anterior}` : 'Falta um pouquinho na aventura anterior',
    description: `Para abrir ${atual || 'a próxima aventura'}, termine ${joinRequirementLabels(faltando)}.`,
    sceneHint: anterior ? `Termine ${anterior} primeiro` : 'Termine a aventura anterior primeiro',
    missingRequirements: faltando,
  };
}

export default {
  CONTENT_AUTH_REASON,
  STORY_REQUIREMENT,
  STORY_REQUIREMENT_ORDER,
  missingStoryRequirements,
  deriveStoryContentAuthorization,
  describeStorySequenceLock,
};
