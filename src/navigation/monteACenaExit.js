/**
 * monteACenaExit.js — SAÍDAS da conclusão de "Monte a Cena" (M1R8A). Corrige a navegação empilhada:
 * as telas intermediárias (jogo, dificuldade, história) ficavam na pilha e exigiam vários "voltar",
 * podendo reabrir a conclusão anterior.
 *
 * Estrutura real (React Navigation v7): um Stack raiz contém a tela "Home" (= abas, com a aba Brincar)
 * e, EMPILHADAS sobre ela, as telas de Monte a Cena (MonteACenaHome → História → Mesa → Jogo). Estas
 * saídas usam `StackActions.popTo` (remove tudo até o destino, sem push, sem cadeia de goBack) e
 * consultam o estado real para não assumir nomes de rota nem duplicar telas.
 */

import { StackActions, CommonActions } from '@react-navigation/native';
import ROUTES from '../constants/routes';

function exitTo(navigation, targetName, params) {
  navigation.dispatch((state) => {
    const inStack = (state.routes || []).some((r) => r.name === targetName);
    // Se o destino já está na pilha → popTo (remove as telas acima, sem duplicar). Senão, navega
    // (sem empilhar duplicata — o stack router resolve para a rota existente ou empurra uma só).
    return inStack ? StackActions.popTo(targetName, params) : CommonActions.navigate({ name: targetName, params });
  });
}

/**
 * "Voltar ao Monte a Cena": remove jogo/dificuldade/história/conclusão da pilha e deixa a Home de
 * Monte a Cena ativa. Uma única ação — o botão voltar dali vai para as abas, nunca reabre a conclusão.
 */
export function exitToMonteAcenaHome(navigation) {
  exitTo(navigation, ROUTES.MONTE_A_CENA_HOME);
}

/**
 * "Voltar ao Brincar": encerra toda a pilha de Monte a Cena e ativa diretamente a aba Brincar
 * (ACTIVITIES, rótulo "Brincar") dentro das abas (rota "Home"). Abrir Monte a Cena de novo começa na
 * Home. Sem vários toques em voltar; a conclusão antiga não fica atrás da aba.
 */
export function exitToBrincar(navigation) {
  exitTo(navigation, ROUTES.HOME, { screen: ROUTES.ACTIVITIES });
}

export default { exitToMonteAcenaHome, exitToBrincar };
