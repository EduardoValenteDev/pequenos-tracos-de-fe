/**
 * beniTourService.js — flag local do "Tour Mágico do Beni" (UX 2.0).
 *
 * Controla se o tour inicial guiado pelo Beni (exibido UMA vez sobre a aba
 * Aventuras, logo após o onboarding) já foi visto. É só uma flag de UI:
 *   - NÃO toca em progresso, conquistas, paywall, acesso premium nem perfil.
 *   - Defensivo: qualquer falha de storage resolve para "não mostrar" (nunca quebra).
 *
 * Estado salvo em: @ptf_beni_app_tour_seen_v1 ('true' quando visto/pulado).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

const BENI_APP_TOUR_KEY = '@ptf_beni_app_tour_seen_v1';

/** True se o tour já foi visto ou pulado (não deve aparecer de novo). Nunca lança. */
export async function hasSeenBeniAppTour() {
  try {
    const raw = await AsyncStorage.getItem(BENI_APP_TOUR_KEY);
    return raw === 'true';
  } catch (e) {
    log('beniTour.read:', e);
    return true; // em dúvida, NÃO insiste no tour
  }
}

/** Marca o tour como visto (ao concluir OU pular). Idempotente. */
export async function markBeniAppTourSeen() {
  try {
    await AsyncStorage.setItem(BENI_APP_TOUR_KEY, 'true');
  } catch (e) {
    log('beniTour.markSeen:', e);
  }
}

/** Reseta a flag para rever o tour (Ferramentas do Criador). Não apaga nada além disso. */
export async function resetBeniAppTour() {
  try {
    await AsyncStorage.removeItem(BENI_APP_TOUR_KEY);
    return { success: true };
  } catch (e) {
    log('beniTour.reset:', e);
    return { success: false, error: String(e) };
  }
}
