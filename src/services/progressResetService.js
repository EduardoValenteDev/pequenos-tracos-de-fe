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
 * - PRESERVA as criações guardadas: artes salvas na Galeria do Criar Livre
 *   (`ptf_atelier_arts_*`), as PINTURAS do Colorir com o Beni (`@ptf_drawing60_*`
 *   + blobs em `drawings60/`), perfil, plano, entitlement, consentimentos,
 *   configurações e dados antifarming ficam fora da whitelist e dos prefixos.
 * - [Spec 019 · S4] Apagar criações é AÇÃO PARENTAL SEPARADA — duas, na verdade,
 *   uma por storage: "Apagar pinturas das histórias" (C60) e "Apagar criações do
 *   Criar Livre". Reiniciar o progresso NUNCA as executa por tabela.
 * - Deve ser chamado apenas da Área dos Pais, após confirmação dupla.
 * - Chamar refreshProgress() externamente após este serviço completar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stories } from '../data/stories';
import { clearAllSavedDrawings } from './drawingStorage';
import { resetColoring60Progress } from './coloring60ResetService';

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
  // Este é o namespace LEGADO por cena — a marca "já colorei esta cena", um estado
  // de progresso do roteiro, e não uma obra guardada. Ele não alcança
  // `@ptf_drawing60_*` (as pinturas do Colorir com o Beni, preservadas abaixo) nem
  // `ptf_atelier_arts_*` (o Criar Livre, intocado aqui).
  let drawingsRemoved = 0;
  try {
    drawingsRemoved = await clearAllSavedDrawings();
  } catch {
    // Defensivo: nunca lança a partir do reset.
  }

  // Jornada de cores do Colorir 60 (C60 · Parte 6). A whitelist acima NÃO alcança as chaves do
  // piloto (`@ptf_coloring60_*` e `@ptf_drawing60_*`) e `clearAllSavedDrawings` filtra
  // `@ptf_drawing_` — que NÃO casa `@ptf_drawing60_`. Por isso o "3 de 3" sobrevivia a "Gerenciar
  // dados". Em vez de copiar as chaves para cá (duas listas divergem), chamamos a limpeza canônica
  // da jornada, que apaga conclusão, memória de "já concluiu", grande conclusão vista, convites e
  // caches em memória.
  //
  // [Spec 019 · S4] AQUI FICA `resetColoring60Progress`, NUNCA `resetCreationColoringJourney`. A
  // diferença entre as duas é a obra da criança. Até o S1 o C60 não guardava pintura nenhuma e
  // chamar a composição era inofensivo; agora a política SALVA a pintura de todo usuário com
  // acesso, e reiniciar o progresso deixaria de ser "fazer de novo" para virar destruição
  // silenciosa de tudo o que a criança pintou. Apagar pinturas é uma ação parental separada, com
  // confirmação própria (`deleteColoring60Artworks`). O ponteiro, o blob e o desfecho gravado
  // SOBREVIVEM a este reset; a atividade volta a estar incompleta, e a obra é reidratada no canvas
  // quando a criança reabre a parte — sem restaurar conclusão, quiz, reflexão ou cenas.
  let coloring60Reset = null;
  try {
    coloring60Reset = await resetColoring60Progress();
  } catch {
    // Defensivo: nunca lança a partir do reset.
  }

  return { removed: keys.length + drawingsRemoved, keys, coloring60Reset };
}
