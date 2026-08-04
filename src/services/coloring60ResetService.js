/**
 * coloring60ResetService.js — RESET CANÔNICO da jornada de cores (C60 · Parte 6).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * [Spec 019 · S4] SEPARAÇÃO DE INTENÇÕES PARENTAIS.
 *
 * Este módulo nasceu com UMA função que fazia DUAS coisas ao mesmo tempo: apagava o progresso e
 * destruía as pinturas. Enquanto o C60 não guardava obra nenhuma isso era inofensivo. A partir do
 * S1 a política passou a SALVAR a pintura de todo usuário com acesso legítimo, e a fusão virou uma
 * armadilha: o responsável que só queria "deixar a criança fazer de novo" perdia, sem aviso e sem
 * volta, tudo o que ela já tinha pintado. Reiniciar progresso e apagar criações são intenções
 * DIFERENTES e passam a ser ações DIFERENTES:
 *
 *   · `resetColoring60Progress(storyId)`  → apaga SÓ o progresso. As pinturas ficam no disco.
 *   · `deleteColoring60Artworks(storyId)` → apaga SÓ as pinturas. A conclusão fica de pé.
 *   · `resetCreationColoringJourney(storyId)` → a composição das duas. Continua existindo porque a
 *     bancada de desenvolvimento precisa reencenar o PRIMEIRO USO, que exige as duas limpezas.
 *     NÃO é a ação parental: "Gerenciar dados" chama as duas primeiras, nunca esta.
 *
 * A ASSIMETRIA QUE DÁ SENTIDO À SEPARAÇÃO. Progresso apagado NÃO pode ser ressuscitado pela
 * presença de uma pintura preservada: a obra sobrevive, mas a atividade volta a estar incompleta e
 * só volta a contar quando a criança concluir de novo (a arte é reidratada no canvas, não no
 * placar). E pintura apagada NÃO pode apagar a conquista: a atividade continua concluída, apenas
 * sem obra guardada. Por isso a exclusão remove o DESFECHO gravado — e o remove ANTES do ponteiro e
 * do blob, identidade por identidade: é o que converte a vaga em NOT_PERSISTED honesto em vez de
 * fingir perda de dados, e é a única ordem em que uma interrupção no meio não inventa uma promessa
 * de arte que o disco já não pode cumprir (ver o docblock de `deleteColoring60Artworks`).
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 *
 * O PROBLEMA ORIGINAL. Existiam TRÊS lugares que diziam apagar o Colorir 60 e nenhum apagava tudo:
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
 *   - memória do convite pós-história do Beni          → `coloring60JourneyInvite`
 *   - memória do convite por MARCO (cena 2/7/9)        → `coloring60MilestoneInviteSeen`
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
  clearColoring60Snapshot,
  loadColoring60Done,
  loadColoring60JourneyRecord,
} from './coloring60ActivityService';
import {
  clearColoring60SavedDrawing,
  collectColoring60Orphans,
  hasColoring60SavedDrawing,
  hasColoring60SnapshotRecord,
  COLORING60_GC_REASON,
} from './coloring60DrawingStorage';
import { SNAPSHOT_STATUS } from './coloring60State';
import { clearCreationColoringInvite } from './coloring60JourneyInvite';
import { clearColoring60MilestoneInviteSeen } from './coloring60MilestoneInviteSeen';
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

function coloring60ActivityIds(storyId) {
  const activities = getColoring60Activities(storyId) || [];
  return activities.map((a) => a.activityId);
}

/**
 * [Spec 019 · S4] resetColoring60Progress(storyId) — REINICIAR O PROGRESSO, e só ele.
 *
 * Remove, para as atividades do catálogo daquela história:
 *   1. `isCurrentlyComplete`, `hasEverCompleted` e `finaleSeen` — os registros de conclusão;
 *   2. a memória do convite do Beni (pós-história E por marco), devolvendo a experiência de
 *      PRIMEIRO USO;
 *   3. os caches em memória, a última atividade aberta, a tentativa pendente, a revisão e os
 *      dados temporários de hidratação de quem estiver montado (via barramento).
 * O contador volta a 0 de 3 por DERIVAÇÃO — não existe contador guardado para "esquecer" de zerar.
 *
 * O QUE ELE NÃO TOCA, DELIBERADAMENTE: o ponteiro da pintura, o blob da pintura, o desfecho
 * gravado, as criações do Criar Livre, o entitlement, os consentimentos, as configurações
 * parentais e os dados antifarming. A obra da criança SOBREVIVE ao reset de progresso — e é por
 * isso que a verificação final NÃO consulta `hasColoring60SavedDrawing`: depois deste bloco, arte
 * preservada é RESULTADO ESPERADO, não resíduo. Contá-la como resíduo faria o reset se declarar
 * fracassado exatamente quando cumpriu o contrato.
 *
 * A ASSIMETRIA. A pintura preservada NÃO restaura a conclusão: ela é reidratada no canvas quando a
 * criança reabre a atividade, mas quem decide se a atividade conta é o registro de conclusão, que
 * acabou de ser apagado. Progresso só volta a contar depois de concluir de novo.
 *
 * Devolve `{ ok, storyId, activityIds, residual }`. NUNCA lança.
 *
 * `options.notify === false` suprime o aviso aos caches — usado SÓ pela composição, que avisa uma
 * única vez no fim. Duas notificações não corromperiam nada (invalidar cache é idempotente), mas um
 * ouvinte que conta eventos passaria a ver dois resets onde houve um.
 */
export async function resetColoring60Progress(storyId = COLORING60_STORY_ID, options = {}) {
  const activityIds = coloring60ActivityIds(storyId);
  let ok = true;

  // 1) CONCLUSÃO (agora + alguma vez) e GRANDE CONCLUSÃO VISTA — numa única remoção em lote.
  try {
    const done = await clearColoring60Completion(storyId, activityIds);
    if (done !== true) ok = false;
  } catch (e) {
    ok = false;
    warn('coloring60Reset.completion:', e);
  }

  // 2) CONVITE do Beni: sem isso a "primeira vez" nunca voltaria a acontecer. São DUAS memórias
  //    independentes — a do convite pós-história (uma flag global) e a do convite por MARCO (uma por
  //    atividade, cena 2/7/9). Ambas precisam voltar ao zero para reencenar o primeiro uso.
  try {
    await clearCreationColoringInvite();
  } catch (e) {
    ok = false;
    warn('coloring60Reset.invite:', e);
  }
  try {
    await clearColoring60MilestoneInviteSeen(storyId, activityIds);
  } catch (e) {
    ok = false;
    warn('coloring60Reset.milestoneInvite:', e);
  }

  // 3) CACHES EM MEMÓRIA — na MESMA ação, antes de devolver o controle: a interface montada
  //    atualiza imediatamente para 0 de 3, sem esperar uma nova navegação.
  if (options.notify !== false) notifyColoring60Reset(storyId);

  // 4) VERIFICAÇÃO: o reset relata o que REALMENTE sobrou (nunca declara sucesso no escuro). Aqui
  //    "sobrou" significa CONCLUSÃO sobrevivente — e nada mais.
  const residual = [];
  for (let i = 0; i < activityIds.length; i += 1) {
    const id = activityIds[i];
    try {
      const stillDone = await loadColoring60Done(storyId, id);
      if (stillDone === true) residual.push(id);
    } catch (e) {
      residual.push(id);
      warn('coloring60Reset.verify:', e);
    }
  }
  if (residual.length > 0) ok = false;

  return { ok, storyId, activityIds, residual };
}

/**
 * [Spec 019 · S4] SONDA DO DESFECHO GRAVADO — "o desfecho desta identidade AINDA está no storage?".
 *
 * Pergunta feita ao LEITOR CANÔNICO do registro de conclusão, não a um construtor de chave repetido
 * aqui: continua valendo que só o módulo dono sabe montar suas chaves. São TRÊS respostas, e a
 * distinção entre elas é o que impede as duas mentiras opostas:
 *   `absent`  — o desfecho não está mais lá. Vale mesmo que a remoção tenha reportado erro:
 *               `multiRemove` pode remover e ainda assim rejeitar (ver o docblock abaixo);
 *   `present` — o desfecho continua lá;
 *   `unknown` — não deu para ler. NÃO é `absent`: não verificar nunca autoriza destruir.
 */
const OUTCOME_PROBE = Object.freeze({ ABSENT: 'absent', PRESENT: 'present', UNKNOWN: 'unknown' });

async function probeStoredOutcome(storyId, activityId) {
  try {
    const registro = await loadColoring60JourneyRecord(storyId, [activityId]);
    if (!registro || registro.readFailed === true) return OUTCOME_PROBE.UNKNOWN;
    const vaga = (registro.activities || [])[0];
    if (!vaga) return OUTCOME_PROBE.UNKNOWN;
    return vaga.storedSnapshotStatus === SNAPSHOT_STATUS.MISSING
      ? OUTCOME_PROBE.ABSENT
      : OUTCOME_PROBE.PRESENT;
  } catch (e) {
    warn('coloring60Delete.sondaDesfecho:', e);
    return OUTCOME_PROBE.UNKNOWN;
  }
}

/**
 * [Spec 019 · S4] deleteColoring60Artworks(storyId) — APAGAR AS PINTURAS, e só elas.
 *
 * Ação PARENTAL explícita e destrutiva. Cada identidade do catálogo é processada SOZINHA, e dentro
 * dela a ordem é a INVERSA da intuição — o registro LÓGICO sai antes dos pixels:
 *   1. o DESFECHO gravado (`snap`) DESTA identidade — via `clearColoring60Snapshot(storyId, [id])`,
 *      preservando `done`/`ever`. Lote de UMA chave: uma remoção parcial que atinja meia jornada
 *      deixa de ser possível por construção;
 *   2. a SONDA que confirma a ausência do desfecho. É ela — e não o código de retorno — que
 *      autoriza o passo seguinte. Sem confirmação, a obra desta identidade NÃO é tocada;
 *   3. só então o PONTEIRO e o ARQUIVO FÍSICO — via `clearColoring60SavedDrawing`, que é
 *      metadado-primeiro, confina a exclusão a `drawings60/` e recolhe o resíduo da geração
 *      inativa. Nenhum caminho é montado aqui: a fronteira do writer continua sendo a única que
 *      sabe onde os blobs moram.
 *
 * POR QUE O DESFECHO SAI PRIMEIRO. Porque é a única ordem em que NENHUMA interrupção mente:
 *   · quebrou ANTES do passo 1 → nada foi tocado. Arte, ponteiro e desfecho seguem de pé e a vaga
 *     continua exatamente como o responsável a viu; basta repetir a operação;
 *   · quebrou DEPOIS do passo 1 → sobra resíduo FÍSICO, e só ele. Sem desfecho gravado a vaga
 *     reconcilia para "concluída, sem registro de arte" — ou para READY, se a arte tiver
 *     sobrevivido. Em nenhuma das duas a conclusão cai nem a coleção acusa quebra.
 * A ordem oposta — pixels primeiro — admite um terceiro estado que não tem dono: desfecho `ready`
 * apontando para arte que já não existe. Isso não é resíduo, é CORRUPÇÃO: `reconcileSnapshotStatus`
 * cai em `missing`, a vaga vira NEEDS_COLOR, o contador CAI e a coleção acusa quebra de integridade
 * — o app culpando a si mesmo por uma exclusão que o RESPONSÁVEL pediu. E, ao contrário do resíduo
 * físico, esse estado ATRAVESSA o reinício do app: só uma nova execução da exclusão o cura.
 *
 * A SONDA TEM A ÚLTIMA PALAVRA, e nas duas direções. `multiRemove` NÃO é transacional por contrato:
 * no iOS ele percorre chave a chave, ACUMULA os erros sem abortar e escreve o manifesto uma única
 * vez no fim — "removeu e mesmo assim rejeitou" é desfecho previsto, não hipótese. Obedecer ao
 * código de retorno erraria dos dois lados: recusaria continuar sobre um estado já limpo e
 * anunciaria fracasso sobre um disco íntegro. Por isso quem decide é a LEITURA do que ficou — antes
 * de destruir (passo 2) e outra vez no fim, sobre a jornada inteira.
 *
 * O QUE NÃO É TOCADO: conclusão, quiz, reflexão, Livrinho, convites, Criar Livre, entitlement,
 * dados de compra, consentimentos, configurações parentais e antifarming.
 *
 * RELATÓRIO ESTRUTURADO — cada campo com UM significado, porque a ação corretiva difere entre eles:
 *   `failed`              a exclusão FÍSICA falhou nestas identidades ("não consegui apagar a obra");
 *   `residual`            resíduo FÍSICO observado: ponteiro, blob ou arquivo sobrevivente;
 *   `staleOutcomes`       resíduo LÓGICO observado: desfecho gravado que continuou no storage. Nestas
 *                         identidades a obra NÃO foi tocada — de propósito;
 *   `completionPreserved` a sonda final confirmou que nenhuma conclusão se perdeu no caminho;
 *   `verified`            as sondas puderam ser lidas (relatório OBSERVADO, não presumido);
 *   `removedPointers` / `removedBlobs` contagens MEDIDAS por sondas antes e depois — só conta como
 *                         removido o que existia antes e não existe depois.
 * `ok` é falso diante de qualquer falha, de resíduo de um tipo ou do outro, de conclusão perdida ou
 * de verificação impossível — a interface só pode anunciar sucesso quando a verificação passa.
 * NUNCA lança.
 */
export async function deleteColoring60Artworks(storyId = COLORING60_STORY_ID, options = {}) {
  const activityIds = coloring60ActivityIds(storyId);
  const relatorio = {
    ok: true,
    storyId,
    requested: activityIds.length,
    removedPointers: 0,
    removedBlobs: 0,
    failed: [],
    residual: [],
    staleOutcomes: [],
    completionPreserved: true,
    verified: true,
  };

  // RETRATO INICIAL, numa única leitura em lote: quais identidades chegaram aqui CONCLUÍDAS. Esta
  // função não toca a chave de conclusão — mas "a conquista foi preservada" não pode ser uma
  // promessa do código sobre si mesmo. Com o retrato, vira COMPARAÇÃO medida no fim.
  const doneAntes = new Map();
  let retratoInicial = null;
  try {
    retratoInicial = await loadColoring60JourneyRecord(storyId, activityIds);
  } catch (e) {
    warn('coloring60Delete.retratoInicial:', e);
  }
  if (retratoInicial && retratoInicial.readFailed !== true) {
    (retratoInicial.activities || []).forEach((a) => {
      doneAntes.set(a.activityId, a.isCurrentlyComplete === true);
    });
  } else if (activityIds.length > 0) {
    relatorio.verified = false;
  }

  for (let i = 0; i < activityIds.length; i += 1) {
    const id = activityIds[i];
    // Em qual ETAPA esta identidade estava se algo explodir. É o que permite ao relatório dizer
    // QUAL passo falhou, em vez de despejar as duas naturezas de falha no mesmo campo.
    let etapa = 'sonda';
    let tinhaObra = false;
    try {
      // ANTES. Duas sondas com propósitos distintos: a leve responde "existe ponteiro?" sem abrir
      // arquivo; a forte resolve o ponteiro e responde "existe obra RECUPERÁVEL?". Medir as duas
      // separadamente é o que permite distinguir "apaguei uma obra" de "apaguei um ponteiro órfão".
      const tinhaPonteiro = await hasColoring60SnapshotRecord(storyId, id);
      const tinhaBlob = await hasColoring60SavedDrawing(storyId, id);
      tinhaObra = tinhaPonteiro || tinhaBlob;

      // ─── PASSO 1 · O DESFECHO LÓGICO, ANTES DE QUALQUER DESTRUIÇÃO ────────────────────────────
      // Lote de UMA chave: o que quer que aconteça, o estrago não atravessa para outra identidade.
      etapa = 'desfecho';
      await clearColoring60Snapshot(storyId, [id]);

      // ─── PASSO 2 · A CONFIRMAÇÃO QUE AUTORIZA DESTRUIR ────────────────────────────────────────
      // Desfecho ainda presente, ou impossível de ler ⇒ esta identidade sai INTEIRA daqui: obra,
      // ponteiro e desfecho intactos. Um estado consistente e repetível é infinitamente melhor do
      // que uma obra destruída sob um desfecho que continua prometendo arte.
      const desfecho = await probeStoredOutcome(storyId, id);
      if (desfecho !== OUTCOME_PROBE.ABSENT) {
        relatorio.staleOutcomes.push(id);
        if (tinhaObra) relatorio.residual.push(id);
        continue; // eslint-disable-line no-continue
      }

      // ─── PASSO 3 · O PONTEIRO E O ARQUIVO ─────────────────────────────────────────────────────
      etapa = 'fisico';
      await clearColoring60SavedDrawing(storyId, id);

      const aindaPonteiro = await hasColoring60SnapshotRecord(storyId, id);
      const aindaBlob = await hasColoring60SavedDrawing(storyId, id);

      if (tinhaPonteiro && !aindaPonteiro) relatorio.removedPointers += 1;
      if (tinhaBlob && !aindaBlob) relatorio.removedBlobs += 1;
      if (aindaPonteiro || aindaBlob) relatorio.residual.push(id);

      // RESÍDUO FÍSICO. As duas sondas acima falam pelo METADADO: sem ponteiro, as duas dizem
      // "não há obra" mesmo que o ARQUIVO tenha sobrevivido no disco. Uma exclusão que perde a
      // chave e deixa os pixels para trás se declararia um sucesso completo — e o responsável
      // acreditaria ter apagado algo que continua no aparelho. A segunda passada da limpeza
      // DIRIGIDA (universo fechado: os dois slots canônicos desta identidade, nada mais) é quem
      // responde pelo disco. Ela é idempotente: com tudo já apagado, examina e não encontra nada.
      // Só `failed`/`refused` significam ARQUIVO SOBREVIVENTE; `skipped` significa que não deu
      // para verificar — e não verificar é motivo suficiente para não anunciar sucesso.
      let varredura = null;
      try {
        varredura = await collectColoring60Orphans(storyId, id, {
          reason: COLORING60_GC_REASON.AFTER_CLEAR,
        });
      } catch (e) {
        warn('coloring60Delete.residuo:', e);
      }
      const naoVerificou = !varredura || varredura.skipped != null;
      const sobreviveu = !!varredura && (varredura.failed > 0 || varredura.refused > 0);
      if ((naoVerificou || sobreviveu) && !relatorio.residual.includes(id)) relatorio.residual.push(id);
    } catch (e) {
      // A NATUREZA DA FALHA depende da etapa. Explodiu limpando o desfecho ⇒ a obra não foi tocada
      // (o `await` que lançou está ANTES do passo 3): é resíduo LÓGICO, e dizer `failed` ali seria
      // afirmar "não consegui apagar a pintura" sobre uma pintura intacta. Explodiu no passo físico
      // ⇒ é falha de exclusão de verdade. Campos distintos porque a ação corretiva é distinta.
      if (etapa === 'desfecho') {
        if (!relatorio.staleOutcomes.includes(id)) relatorio.staleOutcomes.push(id);
        if (tinhaObra && !relatorio.residual.includes(id)) relatorio.residual.push(id);
      } else if (!relatorio.failed.includes(id)) {
        relatorio.failed.push(id);
      }
      warn('coloring60Delete.artwork:', e);
    }
  }

  // ─── SONDA FINAL · O RELATÓRIO PASSA A DESCREVER O QUE FICOU, NÃO O QUE SE TENTOU ─────────────
  // Uma leitura em lote sobre a jornada inteira, depois de tudo. Ela corrige o relatório nos DOIS
  // sentidos: apaga da lista de resíduo lógico a identidade cujo desfecho o storage removeu apesar
  // de ter rejeitado (caso previsto do `multiRemove`), e acusa a que ficou para trás em silêncio.
  // É também aqui que "a conclusão continua de pé" deixa de ser promessa e vira medição.
  if (activityIds.length > 0) {
    let retratoFinal = null;
    try {
      retratoFinal = await loadColoring60JourneyRecord(storyId, activityIds);
    } catch (e) {
      warn('coloring60Delete.retratoFinal:', e);
    }
    if (retratoFinal && retratoFinal.readFailed !== true) {
      const observados = [];
      (retratoFinal.activities || []).forEach((a) => {
        if (a.storedSnapshotStatus !== SNAPSHOT_STATUS.MISSING) observados.push(a.activityId);
        if (doneAntes.get(a.activityId) === true && a.isCurrentlyComplete !== true) {
          relatorio.completionPreserved = false;
        }
      });
      relatorio.staleOutcomes = observados;
    } else {
      // Sem leitura final não há relatório observado. Preserva-se o que as sondas por identidade
      // apuraram e assume-se o não verificado — nunca o contrário.
      relatorio.verified = false;
    }
  }

  // CACHES EM MEMÓRIA: a coleção guarda itens já resolvidos. Sem avisar, a obra apagada continuaria
  // desenhada na tela montada.
  if (options.notify !== false) notifyColoring60Reset(storyId);

  if (
    relatorio.failed.length > 0
    || relatorio.residual.length > 0
    || relatorio.staleOutcomes.length > 0
    || relatorio.completionPreserved !== true
    || relatorio.verified !== true
  ) {
    relatorio.ok = false;
  }
  return relatorio;
}

/**
 * resetCreationColoringJourney(storyId) — COMPOSIÇÃO das duas limpezas (progresso + pinturas).
 *
 * Reencena o PRIMEIRO USO por inteiro, e é isso que a bancada de desenvolvimento e o helper de
 * depuração da tela precisam. NÃO é a ação parental de "Gerenciar dados": ali as duas intenções
 * aparecem separadas, cada uma com sua própria confirmação. Mantida como função para que exista um
 * único lugar sabendo a ordem correta (obras primeiro, progresso depois).
 *
 * Devolve `{ ok, storyId, activityIds, residual, artworks }`. NUNCA lança.
 */
export async function resetCreationColoringJourney(storyId = COLORING60_STORY_ID) {
  // Um único aviso aos caches no fim: quem escuta viu UM reset, não dois.
  const artworks = await deleteColoring60Artworks(storyId, { notify: false });
  const progress = await resetColoring60Progress(storyId, { notify: false });
  notifyColoring60Reset(storyId);
  const residual = [...progress.residual];
  artworks.residual.forEach((id) => { if (!residual.includes(id)) residual.push(id); });
  return {
    ok: progress.ok === true && artworks.ok === true,
    storyId,
    activityIds: progress.activityIds,
    residual,
    artworks,
  };
}

export default {
  resetColoring60Progress,
  deleteColoring60Artworks,
  resetCreationColoringJourney,
  subscribeColoring60Reset,
};
