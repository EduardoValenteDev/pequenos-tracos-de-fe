/**
 * criarLivreOrientation.js — memória da orientação inicial do Criar livre (C1 · §5).
 *
 * A dica "Escolha uma cor e comece a desenhar." aparece só na PRIMEIRA utilização daquele
 * perfil e some no primeiro traço. Guardamos apenas um marcador booleano por perfil — nunca
 * conteúdo de desenho. Null-safe: falha de storage nunca quebra a tela (assume "já visto",
 * para não incomodar com a dica repetidamente em caso de erro).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warn } from '../utils/logger';

const KEY_PREFIX = '@ptf_criar_livre_orientation_seen_v1:';

function keyFor(profileId) {
  return `${KEY_PREFIX}${profileId || 'default'}`;
}

/** True se o perfil já viu a orientação inicial. Erro → true (não repete a dica). */
export async function hasSeenOrientation(profileId) {
  try {
    return (await AsyncStorage.getItem(keyFor(profileId))) === '1';
  } catch (e) {
    warn('criarLivreOrientation.hasSeen:', e);
    return true;
  }
}

/** Marca a orientação como vista para o perfil. Melhor esforço; nunca lança. */
export async function markOrientationSeen(profileId) {
  try {
    await AsyncStorage.setItem(keyFor(profileId), '1');
  } catch (e) {
    warn('criarLivreOrientation.markSeen:', e);
  }
}

export default { hasSeenOrientation, markOrientationSeen };
