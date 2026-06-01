/**
 * storeLinks — URLs das lojas de aplicativos.
 *
 * Enquanto o app não estiver publicado, ambos os valores são null.
 * Nenhuma chamada a Linking.openURL deve ocorrer se a URL for null.
 * Para publicar: substitua null pelas URLs reais da App Store / Play Store.
 */
import { Platform } from 'react-native';

export const APP_STORE_URL = null;
export const PLAY_STORE_URL = null;

/**
 * Retorna a URL da loja para a plataforma atual, ou null se não disponível.
 */
export function getStoreReviewUrl() {
  if (Platform.OS === 'ios') return APP_STORE_URL;
  if (Platform.OS === 'android') return PLAY_STORE_URL;
  return null;
}
