/**
 * coloring60MilestoneInviteSeen.js — memória do CONVITE do Beni POR MARCO da história (C60 · modal único).
 *
 * DIFERENTE do convite pós-história (`coloring60JourneyInvite.js`, uma única flag global exibida ao
 * TERMINAR "A Criação"): aqui o registro é POR ATIVIDADE de marco (light/living_world/people_and_care).
 * Numa cena-marco (2/7/9), o Beni convida a colorir num ÚNICO modal — e este marcador garante que o
 * convite apareça UMA vez por marco: revisitar a cena não repete o convite. Guardamos apenas um
 * booleano leve por chave própria (nunca conteúdo), isolado dos namespaces de progresso, conclusão e
 * pixels do Colorir 60.
 *
 * QUANDO GRAVAR: no instante em que o modal é APRESENTADO (não antes; não à espera da escolha da
 * criança). Assim, aceitar ou pular não altera "já visto" — o convite já cumpriu seu papel de aparecer.
 *
 * ROBUSTEZ (exigências do bloco):
 *   - Falha de ESCRITA nunca quebra a história nem bloqueia a próxima cena: persistência best-effort,
 *     nunca lança, diagnóstico em DEV.
 *   - "Evitar loop imediato na MESMA sessão": além do disco, uma GUARDA DE SESSÃO em memória registra
 *     os marcos já apresentados neste ciclo de vida do app — se o disco falhar, o convite ainda não se
 *     repete enquanto o app estiver aberto. A guarda zera naturalmente ao reabrir o app.
 *   - Falha de LEITURA assume "já visto" (não reexibe): o convite é um gesto, não algo a insistir se o
 *     storage falhar — mesmo padrão do convite pós-história.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warn } from '../utils/logger';

// Chave PRÓPRIA por (história, atividade). Namespace novo, sem colisão com DONE/EVER/finale/pixels.
const KEY_PREFIX = '@ptf_coloring60_milestone_invite_seen_';
function keyFor(storyId, activityId) {
  return `${KEY_PREFIX}${storyId}_${activityId}`;
}

// Guarda de SESSÃO (em memória): marcos já APRESENTADOS neste ciclo de vida do app. Protege contra
// repetir o modal na mesma sessão mesmo que a escrita em disco falhe. Não persiste — some ao reabrir.
const sessionSeen = new Set();

/**
 * hasSeenColoring60MilestoneInvite(storyId, activityId) — true se o convite daquele marco já foi
 * apresentado (nesta sessão OU em disco). Identidade inválida ⇒ true (não convida). Erro de leitura ⇒
 * true (não reexibe).
 */
export async function hasSeenColoring60MilestoneInvite(storyId, activityId) {
  if (storyId == null || activityId == null) return true;
  if (sessionSeen.has(keyFor(storyId, activityId))) return true;
  try {
    return (await AsyncStorage.getItem(keyFor(storyId, activityId))) === '1';
  } catch (e) {
    warn('coloring60MilestoneInviteSeen.hasSeen:', e);
    return true;
  }
}

/**
 * markColoring60MilestoneInviteSeen(storyId, activityId) — registra que o convite daquele marco foi
 * APRESENTADO. A guarda de sessão é gravada de forma SÍNCRONA (imediata) antes da persistência, para
 * que a proteção contra loop na mesma sessão valha mesmo se o disco falhar. Persistência best-effort;
 * nunca lança; uma falha não quebra a história nem bloqueia a próxima cena.
 */
export function markColoring60MilestoneInviteSeen(storyId, activityId) {
  if (storyId == null || activityId == null) return;
  sessionSeen.add(keyFor(storyId, activityId));
  AsyncStorage.setItem(keyFor(storyId, activityId), '1').catch((e) => {
    warn('coloring60MilestoneInviteSeen.markSeen:', e);
  });
}

/**
 * clearColoring60MilestoneInviteSeen(storyId, activityIds) — apaga a memória (sessão + disco) dos
 * convites de marco, devolvendo a experiência de PRIMEIRO USO. Chamada pelo reset canônico da jornada
 * de cores: como as chaves pertencem a este módulo, é ele quem as conhece. Melhor esforço; nunca lança.
 */
export async function clearColoring60MilestoneInviteSeen(storyId, activityIds = []) {
  sessionSeen.clear();
  const ids = Array.isArray(activityIds) ? activityIds : [];
  try {
    await Promise.all(ids.map((a) => AsyncStorage.removeItem(keyFor(storyId, a))));
  } catch (e) {
    warn('coloring60MilestoneInviteSeen.clear:', e);
  }
}

export default {
  hasSeenColoring60MilestoneInvite,
  markColoring60MilestoneInviteSeen,
  clearColoring60MilestoneInviteSeen,
};
