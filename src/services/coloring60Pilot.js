/**
 * coloring60Pilot.js — gate COMPARTILHADO do piloto "Colorir com o Beni" (Colorir 60).
 *
 * Fonte única para as telas que precisam saber se, na jornada de "A Criação", o Colorir
 * TRADICIONAL (por cena, LegacyColoringScreen) deve dar lugar às três atividades de
 * "Colorir com o Beni". Reusa EXATAMENTE o mesmo mecanismo já usado pela ColoringScreen
 * (`isColoring60PilotAllowed`) e pela StoryDetailScreen (`creationColoringVisible`): a flag
 * OFICIAL do piloto (default `false`, inalterada) OU Dev Client (__DEV__) com as ferramentas
 * internas realmente habilitadas — nenhuma configuração paralela é criada.
 *
 * IMPORTANTE (governança do piloto):
 *   - Não autoriza nada por si só: só decide VISIBILIDADE de entradas legadas. A autorização
 *     de conteúdo continua na ColoringScreen (que revalida na entrada) e no accessControl.
 *   - Com a flag `false` e fora do Dev Client, devolve `false` → o app permanece IDÊNTICO ao
 *     baseline (todas as entradas legadas de colorir seguem visíveis).
 *   - NÃO apaga storage, assets nem rotas antigas: apenas OCULTA entradas quando o piloto está
 *     ativo em "A Criação". Piloto desativado ⇒ comportamento anterior restaurado por completo.
 *
 * Puro e síncrono — pode ser lido em render.
 */
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';

// Identidade da ÚNICA história do piloto. Mantida aqui como fonte única para os consumidores
// deste gate (a StoryDetailScreen guarda a sua própria constante para o cálculo já existente).
export const COLORING60_STORY_ID = 'creation';

/**
 * O piloto pode aparecer? Espelha `isColoring60PilotAllowed()` da ColoringScreen (mesmo
 * mecanismo único). Flag oficial ligada OU Dev Client com ferramentas internas ativas.
 */
export function isColoring60PilotAllowed() {
  if (COLORIR_60_CREATION_PILOT_ENABLED) return true;
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev && isInternalToolsEnabled();
}

/**
 * A jornada de colorir do piloto está ATIVA para esta história? Verdadeiro SOMENTE quando a
 * história é "A Criação" E o piloto pode aparecer. É este o sinal que oculta as entradas do
 * Colorir tradicional dentro do fluxo de "A Criação" (chip "Arte salva", convites por cena,
 * recompensa de colorir), sem tocar outras histórias e sem apagar nada.
 */
export function isCreationColoringPilotActive(storyId) {
  return storyId === COLORING60_STORY_ID && isColoring60PilotAllowed();
}
