/**
 * progressResetService — reset seguro de progresso da criança.
 *
 * REGRAS CRÍTICAS:
 * - Usa whitelist explícita + um prefixo dinâmico controlado. Nunca AsyncStorage.clear.
 * - LIMPA o progresso e os estados de experiência: cenas/quiz/reflexão/Livrinho,
 *   estrelas bônus, conquistas vistas, Baú visto, Cultinho e Momentos com Beni
 *   (diários + flag permanente).
 * - NUNCA remove as criações da criança: artes do Ateliê, desenhos/pinturas de
 *   colorir, perfil, plano e configurações ficam fora da whitelist e do prefixo.
 *   Apagar artes é uma AÇÃO SEPARADA (Galeria / "Apagar todos os dados").
 * - Deve ser chamado apenas da Área dos Pais, após confirmação dupla.
 * - Chamar refreshProgress() externamente após este serviço completar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stories } from '../data/stories';

const STORY_IDS = stories.map(s => s.id);

// Prefixo das chaves diárias do Momento com Beni (`@ptf_lumi_moment_<YYYY-MM-DD>`)
// e da flag permanente (`@ptf_lumi_moment_ever`). Removidas dinamicamente para
// não deixar chaves órfãs acumulando por dia. Esse prefixo é específico do
// Momento e não alcança desenhos nem artes da criança (preservados).
const LUMI_MOMENT_PREFIX = '@ptf_lumi_moment_';

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

  // Momento Lumi — flag permanente (os diários saem pelo prefixo dinâmico)
  keys.push('@ptf_lumi_moment_ever');

  // Baú do Beni — cartinhas vistas (estado de experiência, não criação)
  keys.push('@ptf_beni_chest_seen_cards_v1');

  // Cultinho em Casa — contagem/registro local
  keys.push('@ptf_family_worship_v1');

  return keys;
}

/**
 * Retorna a lista de chaves estáticas que podem ser removidas com segurança.
 * Use para exibir ao responsável antes de confirmar. (As chaves diárias do
 * Momento com Beni são removidas dinamicamente por prefixo no resetProgress.)
 */
export function getResettableKeys() {
  return buildProgressWhitelist();
}

/**
 * Remove a whitelist estática + as chaves diárias do Momento com Beni (por
 * prefixo). Preserva artes/desenhos da criança (fora da whitelist e do prefixo).
 * @returns {{ removed: number, keys: string[] }} resumo do que foi removido
 */
export async function resetProgress() {
  const staticKeys = buildProgressWhitelist();

  // Chaves diárias dinâmicas do Momento com Beni (`@ptf_lumi_moment_<date>`).
  let dailyLumiKeys = [];
  try {
    const all = await AsyncStorage.getAllKeys();
    dailyLumiKeys = (all || []).filter(k => k.startsWith(LUMI_MOMENT_PREFIX));
  } catch {
    // Defensivo: se getAllKeys falhar, segue só com a whitelist estática.
  }

  const keys = [...new Set([...staticKeys, ...dailyLumiKeys])];
  await AsyncStorage.multiRemove(keys);
  return { removed: keys.length, keys };
}
