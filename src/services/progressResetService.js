/**
 * progressResetService — reset seguro de progresso da criança.
 *
 * REGRAS CRÍTICAS:
 * - Usa whitelist explícita + prefixos dinâmicos controlados. Nunca AsyncStorage.clear.
 * - LIMPA o progresso e os estados de experiência: cenas/quiz/reflexão/Livrinho,
 *   estrelas bônus, conquistas vistas, Baú visto, Cultinho, Momentos com Beni
 *   (diários + flag permanente) e o VÍNCULO de colorir por cena
 *   (`@ptf_drawing_*` — a marca "já colorei esta cena"). Assim, após o reset uma
 *   cena não aparece mais como já colorida.
 * - PRESERVA as criações guardadas: artes salvas na Galeria do Ateliê
 *   (`ptf_atelier_arts_*`), perfil, plano e configurações ficam fora da whitelist
 *   e dos prefixos. Apagar a Galeria é uma AÇÃO SEPARADA ("Apagar todos os dados").
 * - Deve ser chamado apenas da Área dos Pais, após confirmação dupla.
 * - Chamar refreshProgress() externamente após este serviço completar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stories } from '../data/stories';
import { clearAllSavedDrawings } from './drawingStorage';

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

  // Vínculo de colorir por cena: remove TODAS as chaves `@ptf_drawing_*` E os
  // arquivos de blob apontados (sem deixar órfãos), via a função canônica do
  // drawingStorage. Assim, após o reset nenhuma cena aparece como já colorida.
  // A Galeria do Ateliê (`ptf_atelier_arts_*`) NÃO é tocada → preservada.
  // (Apagar a Galeria é o "reset total" separado em "Gerenciar dados".)
  let drawingsRemoved = 0;
  try {
    drawingsRemoved = await clearAllSavedDrawings();
  } catch {
    // Defensivo: nunca lança a partir do reset.
  }

  return { removed: keys.length + drawingsRemoved, keys };
}
