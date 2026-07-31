/**
 * storyColoringAvailability.js — CONTRATO EXPLÍCITO de "esta história oferece colorir HOJE?".
 *
 * O PROBLEMA QUE RESOLVE (Achado 1 do P3J). `journeyComplete` exigia `coloringComplete` de TODA
 * história. Com a aposentadoria do Colorir legado, 19 das 20 histórias deixaram de ter qualquer
 * atividade de colorir — e uma exigência que ninguém consegue cumprir não é uma exigência, é uma
 * armadilha: a história nunca fecharia, a sequência congelaria na primeira e a criança ficaria
 * presa para sempre. Este módulo dá ao journey o dado que faltava: colorir só PESA na conclusão
 * quando existe, de fato, uma atividade que a criança consegue abrir.
 *
 * A REGRA NÃO É POR `storyId`. Não há lista de histórias privilegiadas aqui, nem comparação com
 * 'creation'. A resposta é a conjunção de dois fatos VIVOS, consultados na hora:
 *   1. o PORTÃO do Colorir com o Beni está aberto (`isColoring60PilotAllowed()` — a flag oficial,
 *      que segue `false`, OU Dev Client com ferramentas internas ligadas); e
 *   2. o CATÁLOGO oferece pelo menos uma atividade para esta história (`getColoring60Activities`).
 * Quando o catálogo ganhar outras histórias, elas passam a exigir colorir sozinhas, sem tocar
 * neste arquivo. Quando o portão fecha, nenhuma história exige — inclusive "A Criação".
 *
 * SENTIDO DA FALHA: ausência de colorir NUNCA prende. `resolveColoringAvailability` sem dados
 * responde "indisponível", e indisponível significa "não exigido". A direção é deliberada: errar
 * para o lado de deixar a criança concluir, jamais para o lado de trancá-la.
 *
 * NÃO REGRIDE NADA. Este contrato só REMOVE uma condição de `journeyComplete`; nunca acrescenta.
 * Toda história que já estava concluída continua concluída (ela cumpria as cinco condições, e
 * agora precisa de quatro), e `sequenceUnlocked` — que depende da anterior estar concluída — só
 * pode destravar mais, nunca menos.
 *
 * Puro e síncrono no núcleo (`resolveColoringAvailability`), sem I/O, sem storage, sem React —
 * pode ser lido em render e avaliado direto pelo smoke. Não escreve, não navega, não apaga nada.
 *
 * Governança: P3J (Aposentadoria Global do Colorir Legado) · decisão do fundador sobre o Achado 1.
 */
import { getColoring60Activities } from '../data/coloring60Catalog';
import { isColoring60PilotAllowed } from './coloring60Pilot';

/**
 * NÚCLEO PURO. Recebe os dois fatos já apurados e devolve o retrato de disponibilidade.
 * Separado do resto para que os testes possam encenar as quatro combinações (portão aberto/fechado
 * × catálogo cheio/vazio) sem depender de flag, de `__DEV__` nem do catálogo real.
 *
 * @param {{ pilotAllowed?: boolean, activityCount?: number }} params
 * @returns {{ available: boolean, activityCount: number, reason: string }}
 *   reason ∈ 'available' | 'gate_closed' | 'no_activities'
 */
export function resolveColoringAvailability(params) {
  const p = params || {};
  const raw = p.activityCount;
  const count = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  if (p.pilotAllowed !== true) return { available: false, activityCount: count, reason: 'gate_closed' };
  if (count < 1) return { available: false, activityCount: 0, reason: 'no_activities' };
  return { available: true, activityCount: count, reason: 'available' };
}

/**
 * Quantas atividades de colorir esta história oferece AGORA. Zero quando o portão está fechado —
 * o catálogo pode ter três atividades e ainda assim a criança não ter nenhuma para abrir.
 */
export function countStoryColoringActivities(storyId) {
  return resolveColoringAvailability({
    pilotAllowed: isColoring60PilotAllowed(),
    activityCount: getColoring60Activities(storyId).length,
  }).activityCount;
}

/**
 * A pergunta que o journey faz: colorir participa de `journeyComplete` nesta história?
 * É a ÚNICA porta que os consumidores devem usar (ProgressContext, StoryDetail, mapa, perfil).
 */
export function isStoryColoringAvailable(storyId) {
  return resolveColoringAvailability({
    pilotAllowed: isColoring60PilotAllowed(),
    activityCount: getColoring60Activities(storyId).length,
  }).available;
}

export default {
  resolveColoringAvailability,
  countStoryColoringActivities,
  isStoryColoringAvailable,
};
