/**
 * coloring60ActivityService.js — CONCLUSÃO da atividade Colorir 60 por identidade
 * composta (`storyId`, `activityId`), C60-IMPL-P4 · P4.T1. É a fronteira semântica de
 * "esta atividade de colorir foi concluída" — um booleano leve, TOTALMENTE SEPARADO da
 * persistência de pixels (o writer `coloring60DrawingStorage.js`, P3).
 *
 * PRINCÍPIOS (nunca violar):
 *   - SEPARAÇÃO CONCLUSÃO ≠ SALVAMENTO: este serviço NÃO grava/lê pixels, NÃO importa o
 *     writer (`coloring60DrawingStorage`), `fileBlobStore`, `drawingStorage` nem `coloringImages`.
 *     Conclusão e salvamento são registros independentes: uma falha de persistência de pixels
 *     JAMAIS deve apagar uma conclusão válida, e concluir NÃO implica arte salva.
 *   - PLAN-AGNÓSTICO: concluir vale para o plano GRÁTIS e para o Plano Família. Este serviço
 *     NÃO consulta entitlement (`accessControl`/`getCurrentPlan`/`entitlementService`) — quem
 *     restringe a PERSISTÊNCIA de pixels ao Plano Família é o writer, internamente. Concluir é livre.
 *   - IDENTIDADE SEMÂNTICA FECHADA: `storyId`/`activityId` são strings validadas contra o
 *     catálogo (`coloring60Catalog`). Número/`"2"`/`"scene_02"`/vazio/não-string ⇒ rejeitado,
 *     sem escrita. Nunca é interpretado como `sceneId`/`cenaIndex`. Não recebe chave arbitrária.
 *   - NAMESPACE PRÓPRIO, SEM COLISÃO: chave `@ptf_coloring60_done_<storyId>_<activityId>` (não
 *     casa `@ptf_drawing60_` de pixels, nem `@ptf_coloring_done_` da atividade legada por cena,
 *     nem `@ptf_drawing_s` do desenho legado). NÃO cria/renomeia/apaga chaves de outra camada.
 *   - SEM EFEITO COLATERAL DE PROGRESSO: concluir NÃO concede estrela (nenhum `rewardService`/
 *     `achievement`), NÃO conclui cena narrativa (nenhum `coloringActivityService` legado /
 *     `markStoryColoringActivityDone` / `salvarCena`), NÃO integra métrica pública.
 *
 * PRÉ-CONDIÇÕES D1/D5: as condições de "lineart pronto" (D1) e "traço significativo" (D5) são
 * observáveis apenas em runtime (canvas). Elas são GARANTIDAS PELO CHAMADOR na ordem canônica
 * (ver `ColoringScreen`), ANTES de invocar `markColoring60ActivityDone`. Este serviço, por ser
 * uma fronteira por identidade, valida apenas a IDENTIDADE semântica e persiste o booleano leve.
 *
 * Governança: specs 014/015/016/017 · DECISIONS.md PL01A-03/PL01G · plan.md §6.6 · tasks.md P4.T1.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColoring60Activity } from '../data/coloring60Catalog';
import { snapshotHasMeaningfulColor } from './coloring60PaintMetrics';
import { SNAPSHOT_STATUS, isSnapshotAcceptable } from './coloring60State';

// Prefixo PRÓPRIO da conclusão Colorir 60 (isolado dos namespaces de pixels e do legado).
// `DONE` responde "está concluída AGORA" — é REVERSÍVEL (limpar o desenho a remove).
const DONE_PREFIX = '@ptf_coloring60_done_';
// `EVER` responde "já foi concluída alguma vez" — sobrevive a limpar UMA folha e só é apagada
// pelo reset canônico da jornada. Existe para que `DONE` possa voltar a falso SEM que a
// experiência trate quem já chegou lá como quem nunca chegou. NUNCA substitui `DONE` (Parte 2).
const EVER_PREFIX = '@ptf_coloring60_ever_';
// `FINALE_SEEN` é por HISTÓRIA (não por atividade): a grande conclusão das três já foi exibida.
// É o que impede a festa 3/3 de repetir a cada reedição — e o reset total a limpa.
const FINALE_SEEN_PREFIX = '@ptf_coloring60_finale_seen_';
// `SNAP` registra QUAL foi o desfecho do instantâneo no momento em que a conclusão foi gravada:
// `ready` (a arte foi guardada em disco) ou `notPersisted` (o plano Grátis não guarda pixels —
// decisão travada do projeto). Sem este registro seria impossível cumprir "não permitir 3 de 3 sem
// três instantâneos válidos" DEPOIS de reabrir o app: uma conclusão órfã (a arte sumiu do disco)
// seria indistinguível de uma conclusão legítima do plano Grátis. A ausência da chave é tratada
// como `missing` — quebra de integridade — e NÃO conta para o total.
const SNAP_PREFIX = '@ptf_coloring60_snap_';

/**
 * coloring60DoneKey(storyId, activityId) — construtor INTERNO da chave de conclusão (NÃO exportado).
 * A API pública do módulo é EXATAMENTE `{ markColoring60ActivityDone, loadColoring60Done }`; nenhum
 * chamador fornece a chave pronta — `mark`/`load` a computam internamente após validar a identidade.
 * Só produz a chave; o valor gravado é sempre `'true'` (existência = concluído). Espelha o padrão do
 * serviço legado (`coloringActivityKey`) para consistência arquitetural, sem colidir com ele.
 */
function coloring60DoneKey(storyId, activityId) {
  return `${DONE_PREFIX}${storyId}_${activityId}`;
}

/** Chave de "já concluiu alguma vez" (mesma identidade validada; namespace próprio). */
function coloring60EverKey(storyId, activityId) {
  return `${EVER_PREFIX}${storyId}_${activityId}`;
}

/** Chave do desfecho do instantâneo (`ready` | `notPersisted`) desta identidade. */
function coloring60SnapKey(storyId, activityId) {
  return `${SNAP_PREFIX}${storyId}_${activityId}`;
}

/** Chave da grande conclusão já exibida — por HISTÓRIA, não por atividade. */
function coloring60FinaleSeenKey(storyId) {
  return `${FINALE_SEEN_PREFIX}${storyId}`;
}

/**
 * isValidIdentity(storyId, activityId) — true SOMENTE para strings não-vazias existentes no
 * catálogo Colorir 60. Número/vazio/não-string/atividade fora do piloto ⇒ false. A chave só é
 * calculada após esta validação: identidade inválida NUNCA provoca escrita nem leitura de chave.
 */
function isValidIdentity(storyId, activityId) {
  if (
    typeof storyId !== 'string' ||
    typeof activityId !== 'string' ||
    storyId.length === 0 ||
    activityId.length === 0
  ) {
    return false;
  }
  return getColoring60Activity(storyId, activityId) != null;
}

/**
 * markColoring60ActivityDone(storyId, activityId, paintProof, snapshotStatus) — passo 7 da
 * TRANSAÇÃO ATÔMICA (Parte 4): marca a atividade como concluída AGORA. PLAN-AGNÓSTICO (Free e
 * Família concluem).
 *
 * BLOQUEIO NA FUNÇÃO DE DOMÍNIO (Parte 3). Antes, a pré-condição "tem traço" era apenas uma
 * PROMESSA do chamador — e uma promessa que se provou falsa: folha em branco e desenho apagado
 * concluíam. Agora a prova viaja junto: `paintProof` é o INSTANTÂNEO exportado pelo motor, que
 * carrega a contagem real de pixels pintados e pintáveis. Sem prova, ou com prova que não alcança
 * a cobertura mínima, NADA é escrito e o retorno é `false`. Nenhum chamador consegue mais concluir
 * uma folha vazia, mesmo que a interface falhe em desabilitar o botão.
 *
 * DESFECHO DO INSTANTÂNEO (Parte 4). `snapshotStatus` precisa ser um desfecho ACEITÁVEL — `ready`
 * (arte guardada em disco) ou `notPersisted` (plano Grátis, que por decisão travada não guarda
 * pixels). Qualquer outro valor, inclusive ausente, rejeita a conclusão: uma falha de persistência
 * NÃO vira "3 de 3".
 *
 * UMA ÚNICA AÇÃO (passo 9). As três chaves — conclusão, desfecho do instantâneo e memória de "já
 * concluiu" — vão num único `multiSet`. Se ele falhar, o retorno é `false` e nada é anunciado; um
 * eventual registro parcial só pode faltar a conclusão (que é o que conta), nunca sobrar.
 *
 * Retorna `true` em sucesso; `false` para identidade inválida, prova insuficiente, desfecho
 * inaceitável ou falha de escrita (nunca lança, nunca reporta sucesso falso). NÃO persiste pixels,
 * NÃO concede estrela, NÃO conclui cena narrativa. Marca também `hasEverCompleted` — que é
 * monotônico e NÃO substitui esta conclusão reversível.
 */
export async function markColoring60ActivityDone(storyId, activityId, paintProof, snapshotStatus) {
  if (!isValidIdentity(storyId, activityId)) return false;
  if (!snapshotHasMeaningfulColor(paintProof)) return false; // fail-closed: sem cor real, sem conclusão
  if (!isSnapshotAcceptable(snapshotStatus)) return false; // fail-closed: sem instantâneo íntegro, sem conclusão
  try {
    await AsyncStorage.multiSet([
      [coloring60DoneKey(storyId, activityId), 'true'],
      [coloring60SnapKey(storyId, activityId), snapshotStatus],
      [coloring60EverKey(storyId, activityId), 'true'],
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * loadColoring60Done(storyId, activityId) — true SOMENTE quando a atividade tem conclusão
 * registrada (chave === `'true'`). Valida identidade (identidade inválida ⇒ false, ainda que
 * exista uma chave espúria). Nunca lança; erro de leitura ⇒ false. Não escreve, não faz healing.
 */
export async function loadColoring60Done(storyId, activityId) {
  if (!isValidIdentity(storyId, activityId)) return false;
  try {
    return (await AsyncStorage.getItem(coloring60DoneKey(storyId, activityId))) === 'true';
  } catch {
    return false;
  }
}

/**
 * clearColoring60Done(storyId, activityId) — REMOVE a marca de conclusão desta atividade
 * (operação SIMÉTRICA de `markColoring60ActivityDone`). Existe para o RESET seguro do Dev Client
 * (§Parte 1/10 · P12R): reencenar os estados 0/3, 1/3, 2/3 e 3/3 sem apagar onboarding, perfil,
 * packs, downloads nem qualquer outro dado. Age SÓ na chave de conclusão desta identidade validada
 * — NÃO toca pixels (writer), estrelas, conquistas nem o legado. Identidade inválida ⇒ no-op(false).
 * Nunca lança; falha de escrita ⇒ false. Remover uma chave inexistente é sucesso silencioso (true).
 */
export async function clearColoring60Done(storyId, activityId) {
  if (!isValidIdentity(storyId, activityId)) return false;
  try {
    // SIMÉTRICO de verdade: o desfecho do instantâneo sai JUNTO com a conclusão. Deixá-lo para trás
    // criaria um registro fantasma — "instantâneo pronto" para uma atividade que não está concluída.
    await AsyncStorage.multiRemove([
      coloring60DoneKey(storyId, activityId),
      coloring60SnapKey(storyId, activityId),
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * loadColoring60JourneyRecord(storyId, activityIds) — LEITURA EM LOTE do registro de conclusão da
 * jornada inteira, numa única ida ao storage (`multiGet`). É a fonte que alimenta a derivação do
 * estado canônico (`coloring60State.deriveColoring60JourneyState`).
 *
 * Devolve `{ storyId, finaleSeen, activities: [{ activityId, isCurrentlyComplete, hasEverCompleted,
 * storedSnapshotStatus }] }`. `storedSnapshotStatus` é o que está GRAVADO — `ready`,
 * `notPersisted`, ou `missing` quando não há registro (conclusões antigas, anteriores a esta chave,
 * caem aqui). Quem tem acesso aos pixels reconcilia isso com a existência da arte antes de derivar;
 * este serviço não lê pixels (SEPARAÇÃO CONCLUSÃO ≠ SALVAMENTO).
 *
 * NUNCA LANÇA — mas também NUNCA CONFUNDE "não fez" com "não deu para ler" (C60 · portão adversarial
 * de persistência). Quando o `multiGet` falha, o retrato volta todo falso E MARCADO com
 * `readFailed: true`. A marca existe porque um retrato falso indistinguível de "criança não começou"
 * é exatamente a mentira que este bloco veio matar: a ponte pós-história convidaria a "começar a
 * jornada de cores" quem já pintou as três partes. Quem só desenha rótulo pode ignorar a marca;
 * quem decide o que a criança faz a seguir (o leitor reconciliado, a coleção) é obrigado a olhá-la.
 */
export async function loadColoring60JourneyRecord(storyId, activityIds = []) {
  const ids = isValidStory(storyId) && Array.isArray(activityIds)
    ? activityIds.filter((id) => isValidIdentity(storyId, id))
    : [];
  const empty = {
    storyId,
    finaleSeen: false,
    activities: ids.map((id) => ({
      activityId: id,
      isCurrentlyComplete: false,
      hasEverCompleted: false,
      storedSnapshotStatus: SNAPSHOT_STATUS.MISSING,
    })),
  };
  if (ids.length === 0) return empty;

  const keys = [];
  ids.forEach((id) => {
    keys.push(coloring60DoneKey(storyId, id));
    keys.push(coloring60SnapKey(storyId, id));
    keys.push(coloring60EverKey(storyId, id));
  });
  keys.push(coloring60FinaleSeenKey(storyId));

  let map;
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    map = new Map(pairs);
  } catch {
    // Leitura INDISPONÍVEL ≠ jornada vazia. O valor continua utilizável (tudo falso) para quem só
    // precisa desenhar, mas carimbado para quem precisa da verdade.
    return { ...empty, readFailed: true };
  }

  const readSnap = (raw) => (
    raw === SNAPSHOT_STATUS.READY || raw === SNAPSHOT_STATUS.NOT_PERSISTED
      ? raw
      : SNAPSHOT_STATUS.MISSING
  );

  return {
    storyId,
    finaleSeen: map.get(coloring60FinaleSeenKey(storyId)) === 'true',
    activities: ids.map((id) => ({
      activityId: id,
      isCurrentlyComplete: map.get(coloring60DoneKey(storyId, id)) === 'true',
      hasEverCompleted: map.get(coloring60EverKey(storyId, id)) === 'true',
      storedSnapshotStatus: readSnap(map.get(coloring60SnapKey(storyId, id))),
    })),
  };
}

/**
 * loadColoring60Ever(storyId, activityId) — "esta atividade já foi concluída ALGUMA VEZ?".
 * Somente-leitura. Este sinal NUNCA é usado no lugar de `loadColoring60Done` para dizer que algo
 * está concluído agora (Parte 2): ele existe para não repetir a primeira vez e para reconhecer
 * quem volta. Erro de leitura ⇒ false.
 */
export async function loadColoring60Ever(storyId, activityId) {
  if (!isValidIdentity(storyId, activityId)) return false;
  try {
    return (await AsyncStorage.getItem(coloring60EverKey(storyId, activityId))) === 'true';
  } catch {
    return false;
  }
}

/**
 * loadColoring60FinaleSeen(storyId) / markColoring60FinaleSeen(storyId) — a GRANDE conclusão das
 * três já foi exibida nesta história? Registro por HISTÓRIA. É o que impede a festa 3/3 de
 * repetir a cada reedição (Parte 9); o reset canônico o apaga, devolvendo a primeira vez real.
 * `storyId` é validado pela existência de PELO MENOS uma atividade do piloto naquela história.
 */
function isValidStory(storyId) {
  return typeof storyId === 'string' && storyId.length > 0;
}

export async function loadColoring60FinaleSeen(storyId) {
  if (!isValidStory(storyId)) return false;
  try {
    return (await AsyncStorage.getItem(coloring60FinaleSeenKey(storyId))) === 'true';
  } catch {
    return false;
  }
}

export async function markColoring60FinaleSeen(storyId) {
  if (!isValidStory(storyId)) return false;
  try {
    await AsyncStorage.setItem(coloring60FinaleSeenKey(storyId), 'true');
    return true;
  } catch {
    return false;
  }
}

/**
 * [Spec 019 · S4] clearColoring60Snapshot(storyId, activityIds) — remove SOMENTE o DESFECHO
 * gravado (`@ptf_coloring60_snap_*`) das identidades informadas. Preserva `done`, `ever` e a marca
 * da grande conclusão.
 *
 * POR QUE ELA PRECISA EXISTIR. A exclusão parental das pinturas tem de dizer a verdade: a criança
 * CONCLUIU aquela parte, e apagar a arte não desfaz o que ela fez. Sem esta primitiva só havia
 * dois caminhos, e os dois MENTEM:
 *   · apagar só o ponteiro/blob deixa o desfecho gravado em `ready` sem arte nenhuma. A evidência
 *     vira "prometi uma obra e ela sumiu": `reconcileSnapshotStatus` cai em `missing`, a vaga é
 *     classificada como NEEDS_COLOR, o contador CAI de 3/3 para 2/3 e a coleção acusa quebra de
 *     integridade — como se o APARELHO tivesse perdido a obra, e não como se o responsável a
 *     tivesse apagado de propósito.
 *   · `clearColoring60Done` / `clearColoring60Completion` levam o `done` junto, e a vaga vira
 *     EMPTY: "ainda falta colorir", isto é, NUNCA REALIZADA. Apagar a pintura teria apagado a
 *     conquista da criança.
 * Removendo APENAS o desfecho, a evidência passa a ser "concluída, sem registro de arte" — que é
 * exatamente o que produz o NOT_PERSISTED honesto ("Parte concluída!" + "Pinte de novo para
 * guardar sua criação."). A atividade continua contando no "x de 3".
 *
 * Age SÓ nas identidades informadas, montadas a partir do catálogo canônico: sem `getAllKeys`,
 * sem prefixo aberto, sem `clear()`. Nunca lança.
 */
export async function clearColoring60Snapshot(storyId, activityIds = []) {
  if (!isValidStory(storyId)) return false;
  const ids = Array.isArray(activityIds)
    ? activityIds.filter((id) => isValidIdentity(storyId, id))
    : [];
  if (ids.length === 0) return true;
  try {
    await AsyncStorage.multiRemove(ids.map((id) => coloring60SnapKey(storyId, id)));
    return true;
  } catch {
    return false;
  }
}

/**
 * clearColoring60Completion(storyId, activityIds) — apaga TODO o registro de CONCLUSÃO desta
 * história: "concluída agora" e "já concluiu alguma vez" de cada atividade informada, mais a
 * marca da grande conclusão vista.
 *
 * FONTE ÚNICA DE CHAVES (Parte 6): este é o único lugar que sabe montar as chaves de conclusão.
 * O reset canônico (`coloring60ResetService`) chama esta função em vez de repetir prefixos —
 * assim não existem duas listas de chaves para divergirem. Age SÓ nas identidades informadas:
 * sem `getAllKeys`, sem prefixo aberto, sem `clear()`. Nunca lança.
 *
 * [S4] NÃO é a primitiva da exclusão parental de pinturas — esta apaga a CONQUISTA junto. Quem
 * apaga a obra preservando a conclusão é `clearColoring60Snapshot`, logo acima.
 */
export async function clearColoring60Completion(storyId, activityIds = []) {
  if (!isValidStory(storyId)) return false;
  const ids = Array.isArray(activityIds)
    ? activityIds.filter((id) => isValidIdentity(storyId, id))
    : [];
  const keys = [];
  ids.forEach((id) => {
    keys.push(coloring60DoneKey(storyId, id));
    keys.push(coloring60SnapKey(storyId, id));
    keys.push(coloring60EverKey(storyId, id));
  });
  keys.push(coloring60FinaleSeenKey(storyId));
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch {
    return false;
  }
}
