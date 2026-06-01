/**
 * progressResetService — reset seguro de progresso da criança.
 *
 * REGRAS CRÍTICAS:
 * - Usa whitelist explícita de chaves. Nunca AsyncStorage.clear.
 * - Não remove: perfil da criança, artes do Ateliê, desenhos salvos de colorir,
 *   flags de plano, configurações, qualquer chave fora da whitelist.
 * - Deve ser chamado apenas da Área dos Pais, após confirmação dupla.
 * - Chamar refreshProgress() externamente após este serviço completar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stories } from '../data/stories';

const STORY_IDS = stories.map(s => s.id);

function buildProgressWhitelist() {
  const keys = [];

  // Progresso de cenas por história
  STORY_IDS.forEach(id => keys.push(`@ptf_progress_${id}`));

  // Quiz, reflexão e livrinho por história
  STORY_IDS.forEach(id => {
    keys.push(`@ptf_quiz_done_${id}`);
    keys.push(`@ptf_reflection_${id}`);
    keys.push(`@ptf_storybook_opened_${id}`);
  });

  // Estrelas bônus (quiz + reflexão)
  keys.push('@ptf_bonus_stars');

  // Conquistas vistas (modal já exibido)
  keys.push('@ptf_achievements_seen');

  // Momento Lumi — flag permanente
  keys.push('@ptf_lumi_moment_ever');

  return keys;
}

/**
 * Retorna a lista de chaves que podem ser removidas com segurança.
 * Use para exibir ao responsável antes de confirmar.
 */
export function getResettableKeys() {
  return buildProgressWhitelist();
}

/**
 * Remove apenas as chaves da whitelist.
 * @returns {{ removed: number, keys: string[] }} resumo do que foi removido
 */
export async function resetProgress() {
  const keys = buildProgressWhitelist();
  await AsyncStorage.multiRemove(keys);
  return { removed: keys.length, keys };
}
