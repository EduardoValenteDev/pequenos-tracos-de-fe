/**
 * coloring60JourneyInvite.js — memória do CONVITE do Beni para colorir "A Criação" (C60 · §7).
 *
 * Depois que a criança termina a história ("A Criação") pela PRIMEIRA vez, o Beni convida com
 * carinho: "Agora vamos colorir o que aprendemos?". Este marcador garante que o convite apareça
 * UMA única vez — nunca a cada vez que a cena 10 é reaberta. Guardamos apenas um booleano leve
 * (nunca conteúdo). É um registro PRÓPRIO do convite, SEPARADO do progresso de cenas e da
 * conclusão da história: ver o convite não conclui nada, e concluir a história não é o convite.
 *
 * Null-safe: falha de storage nunca quebra a tela. Em erro, assume "já visto" — o convite é um
 * gesto de boas-vindas, não algo que valha reexibir insistentemente se o storage falhar. Espelha
 * o padrão de `criarLivreOrientation.js` (marcador booleano por chave própria, sem colisão).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { warn } from '../utils/logger';

// Chave PRÓPRIA do convite (isolada dos namespaces de progresso, conclusão e pixels do Colorir 60).
const INVITE_KEY = '@ptf_creation_colorir_invite_shown_v1';

/** True se o convite do Beni já foi exibido. Erro de leitura → true (não reexibe). */
export async function hasSeenCreationColoringInvite() {
  try {
    return (await AsyncStorage.getItem(INVITE_KEY)) === '1';
  } catch (e) {
    warn('coloring60JourneyInvite.hasSeen:', e);
    return true;
  }
}

/** Marca o convite como exibido. Melhor esforço; nunca lança. */
export async function markCreationColoringInviteSeen() {
  try {
    await AsyncStorage.setItem(INVITE_KEY, '1');
  } catch (e) {
    warn('coloring60JourneyInvite.markSeen:', e);
  }
}

/**
 * clearCreationColoringInvite() — apaga a memória do convite, devolvendo a EXPERIÊNCIA DE
 * PRIMEIRO USO (C60 · Parte 6). Chamada apenas pelo reset canônico da jornada de cores: como o
 * convite pertence a este módulo, é ele quem conhece a chave — o reset não repete o literal.
 * Melhor esforço; nunca lança.
 */
export async function clearCreationColoringInvite() {
  try {
    await AsyncStorage.removeItem(INVITE_KEY);
  } catch (e) {
    warn('coloring60JourneyInvite.clear:', e);
  }
}

export default { hasSeenCreationColoringInvite, markCreationColoringInviteSeen, clearCreationColoringInvite };
