/**
 * beniChestSeenStorage.js — controle LOCAL e mínimo de cartinhas já vistas no
 * Baú do Beni. Salva APENAS ids de cartinhas (strings). Nunca salva texto livre,
 * nome da criança, imagem, localização ou qualquer dado sensível.
 *
 * Chave: @ptf_beni_chest_seen_cards_v1  →  string[] de ids.
 * Tudo tolerante a erro: se o storage falhar, o app não quebra.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@ptf_beni_chest_seen_cards_v1';

/** Lê os ids de cartinhas vistas. Nunca lança; retorna []. */
export async function getSeenChestCardIds() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Mantém apenas strings — descarta qualquer coisa inesperada.
    return parsed.filter(id => typeof id === 'string');
  } catch {
    return [];
  }
}

async function writeIds(ids) {
  try {
    const clean = Array.from(new Set((ids || []).filter(id => typeof id === 'string')));
    await AsyncStorage.setItem(KEY, JSON.stringify(clean));
    return clean;
  } catch {
    return null;
  }
}

/** Marca uma cartinha como vista. Tolerante a id inválido. */
export async function markChestCardSeen(cardId) {
  if (typeof cardId !== 'string' || !cardId) return;
  const current = await getSeenChestCardIds();
  if (current.includes(cardId)) return;
  await writeIds([...current, cardId]);
}

/** Marca várias cartinhas como vistas de uma vez. */
export async function markManyChestCardsSeen(cardIds) {
  const incoming = Array.isArray(cardIds) ? cardIds.filter(id => typeof id === 'string') : [];
  if (incoming.length === 0) return;
  const current = await getSeenChestCardIds();
  await writeIds([...current, ...incoming]);
}

/**
 * Dado o conjunto de cartinhas atuais, retorna as DESBLOQUEADAS que ainda não
 * foram vistas. Defensivo: aceita lista null/undefined/itens inválidos.
 */
export async function getUnseenUnlockedChestCards(cards) {
  const list = Array.isArray(cards) ? cards : [];
  const seen = await getSeenChestCardIds();
  const seenSet = new Set(seen);
  return list.filter(c => c && c.unlocked && typeof c.id === 'string' && !seenSet.has(c.id));
}
