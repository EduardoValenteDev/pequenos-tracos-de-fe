/**
 * coloring60ResetService.js — RESET CANÔNICO da jornada de cores (C60 · Parte 6).
 *
 * O PROBLEMA. Existiam TRÊS lugares que diziam apagar o Colorir 60 e nenhum apagava tudo:
 *   - "Gerenciar dados" (`progressResetService`) não conhecia NENHUMA chave do Colorir 60 — o
 *     "3 de 3" sobrevivia a apagar o progresso inteiro;
 *   - a bancada de desenvolvimento repetia o prefixo dos pixels por conta própria e removia só o
 *     ponteiro, deixando os ARQUIVOS no disco (blobs órfãos que podiam reaparecer);
 *   - o helper de desenvolvimento da tela apagava conclusão e pixels, mas não a memória de "já
 *     concluiu", nem a grande conclusão vista, nem o convite — a experiência de primeiro uso não
 *     era reproduzível.
 *
 * A REGRA. Existe UMA função de reset — `resetCreationColoringJourney()` — e todo mundo a chama.
 * Nenhum chamador repete literais de chave: cada módulo DONO expõe sua própria limpeza e este
 * serviço apenas orquestra, na ordem certa:
 *   - conclusão / já-concluiu / grande-conclusão-vista → `coloring60ActivityService`
 *   - pintura, instantâneo e ARQUIVO FÍSICO           → `coloring60DrawingStorage`
 *   - memória do convite do Beni                       → `coloring60JourneyInvite`
 *   - caches em memória e dados temporários de hidratação → barramento de invalidação daqui
 *
 * FRONTEIRA (o que este reset NUNCA toca): onboarding, perfil, avatares, packs, downloads,
 * estrelas, conquistas, Livrinho, Baú, cultinho e QUALQUER outra história. Ele age apenas nas
 * identidades do catálogo do piloto — sem `AsyncStorage.clear()`, sem `getAllKeys()` e sem
 * remoção por prefixo aberto.
 *
 * EXCEÇÃO AO ISOLAMENTO DO WRITER (decisão deliberada, registrada no relatório do bloco): até
 * aqui SÓ `ColoringScreen` podia referenciar `coloring60DrawingStorage`. Um reset que não apaga
 * arquivos físicos não é reset — então este módulo passa a ser o SEGUNDO chamador autorizado,
 * restrito à API de LIMPEZA. O invariante que realmente importa continua intacto e ficou mais
 * forte: `saveColoring60DrawingState` (a ESCRITA de pixels) segue com um único chamador possível,
 * `ColoringScreen`, e o smoke prova isso separadamente.
 */
import {
  clearColoring60Completion,
  loadColoring60Done,
} from './coloring60ActivityService';
import { clearColoring60SavedDrawing, hasColoring60SavedDrawing } from './coloring60DrawingStorage';
import { clearCreationColoringInvite } from './coloring60JourneyInvite';
import { getColoring60Activities } from '../data/coloring60Catalog';
import { COLORING60_STORY_ID } from './coloring60Pilot';
import { warn } from '../utils/logger';

/**
 * BARRAMENTO DE INVALIDAÇÃO EM MEMÓRIA. Apagar o disco não basta: telas montadas guardam mapas de
 * conclusão, instantâneos de celebração, itens já resolvidos da coleção e o estado de hidratação.
 * Se esses caches sobrevivem, a interface continua exibindo "3 de 3" depois do reset e um
 * instantâneo apagado pode reaparecer. Quem tem cache se inscreve; o reset avisa todo mundo na
 * MESMA ação, antes de devolver o controle — por isso a interface atualiza imediatamente.
 */
const listeners = new Set();

/**
 * subscribeColoring60Reset(fn) — registra um invalidador de cache. Devolve a função de remoção
 * (para o `useEffect` de quem se inscreveu). Um ouvinte que lança NÃO impede os demais.
 */
export function subscribeColoring60Reset(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function notifyColoring60Reset(storyId) {
  listeners.forEach((fn) => {
    try { fn(storyId); } catch (e) { warn('coloring60Reset.listener:', e); }
  });
}

/**
 * resetCreationColoringJourney(storyId) — A FUNÇÃO ÚNICA de reset (Parte 6).
 *
 * Remove, para as atividades do catálogo daquela história:
 *   1. a PINTURA e o INSTANTÂNEO, incluindo o ARQUIVO FÍSICO em disco (o writer é quem sabe onde
 *      ele mora e apaga metadado-primeiro, sem deixar ponteiro órfão);
 *   2. `isCurrentlyComplete`, `hasEverCompleted` e `finaleSeen` — os registros de conclusão;
 *   3. a memória do convite do Beni, devolvendo a experiência de PRIMEIRO USO;
 *   4. os caches em memória, a última atividade aberta, a tentativa pendente, a revisão e os
 *      dados temporários de hidratação de quem estiver montado (via barramento).
 * O contador volta a 0 de 3 por DERIVAÇÃO — não existe contador guardado para "esquecer" de zerar.
 *
 * Devolve `{ ok, storyId, activityIds, residual }`. `residual` lista identidades que ainda
 * respondem "concluída" ou "tem arte" depois da limpeza — verificação de verdade, não otimismo:
 * é o que permite ao chamador (e ao relatório) saber que sobrou algo em vez de anunciar sucesso.
 * NUNCA lança.
 */
export async function resetCreationColoringJourney(storyId = COLORING60_STORY_ID) {
  const activities = getColoring60Activities(storyId) || [];
  const activityIds = activities.map((a) => a.activityId);
  let ok = true;

  // 1) PIXELS + ARQUIVO FÍSICO, por identidade. Sequencial de propósito: são três itens e a ordem
  //    determinística facilita o diagnóstico quando algo falha no aparelho.
  for (let i = 0; i < activityIds.length; i += 1) {
    try {
      await clearColoring60SavedDrawing(storyId, activityIds[i]);
    } catch (e) {
      ok = false;
      warn('coloring60Reset.drawing:', e);
    }
  }

  // 2) CONCLUSÃO (agora + alguma vez) e GRANDE CONCLUSÃO VISTA — numa única remoção em lote.
  try {
    const done = await clearColoring60Completion(storyId, activityIds);
    if (done !== true) ok = false;
  } catch (e) {
    ok = false;
    warn('coloring60Reset.completion:', e);
  }

  // 3) CONVITE do Beni: sem isso a "primeira vez" nunca voltaria a acontecer.
  try {
    await clearCreationColoringInvite();
  } catch (e) {
    ok = false;
    warn('coloring60Reset.invite:', e);
  }

  // 4) CACHES EM MEMÓRIA — na MESMA ação, antes de devolver o controle: a interface montada
  //    atualiza imediatamente para 0 de 3, sem esperar uma nova navegação.
  notifyColoring60Reset(storyId);

  // 5) VERIFICAÇÃO: o reset relata o que REALMENTE sobrou (nunca declara sucesso no escuro).
  const residual = [];
  for (let i = 0; i < activityIds.length; i += 1) {
    const id = activityIds[i];
    try {
      const stillDone = await loadColoring60Done(storyId, id);
      const stillHasArt = await hasColoring60SavedDrawing(storyId, id);
      if (stillDone === true || stillHasArt === true) residual.push(id);
    } catch (e) {
      residual.push(id);
      warn('coloring60Reset.verify:', e);
    }
  }
  if (residual.length > 0) ok = false;

  return { ok, storyId, activityIds, residual };
}

export default { resetCreationColoringJourney, subscribeColoring60Reset };
