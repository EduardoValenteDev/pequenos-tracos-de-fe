/**
 * coloring60CollectionReader.js — LEITURA CANÔNICA RECONCILIADA das obras do Colorir 60.
 *
 * FONTE ÚNICA de "o que existe DE FATO em cada vaga da coleção". Duas telas leem daqui:
 *   • a COLEÇÃO (as três obras juntas — `loadColoring60Slots`);
 *   • a PRÉVIA AMPLIADA de UMA obra (`loadColoring60Slot`).
 * Extrair esta leitura para um módulo próprio cumpre uma exigência explícita do bloco: a prévia
 * NÃO pode ter uma SEGUNDA fonte de verdade. Ela lê a MESMA reconciliação (retrato de conclusão
 * gravado × pixels no disco × contorno oficial) que a coleção — venha de onde vier, a mesma obra
 * é a mesma obra, com o mesmo estado honesto.
 *
 * Faz I/O de LEITURA (retrato + pintura guardada + contorno). NUNCA escreve, NUNCA conclui, NUNCA
 * concede recompensa. Toda falha vira ESTADO HONESTO — jamais uma obra inventada, jamais um
 * contorno sem cor no lugar da arte. A "evidência forte" (abrir o blob salvo e medir cor real com
 * `snapshotHasMeaningfulColor`) é o que separa "arte válida" de "ponteiro órfão": só arte
 * recuperável de verdade vira `SLOT.ART`.
 */
import { getColoring60Activities } from '../data/coloring60Catalog';
import {
  resolveColoring60Lineart,
  COLORING60_RESOLUTION_STATUS,
} from './coloring60Resolver';
import { loadColoring60JourneyRecord } from './coloring60ActivityService';
import {
  getColoring60SavedDrawing,
  hasColoring60SnapshotRecord,
} from './coloring60DrawingStorage';
import { snapshotHasMeaningfulColor } from './coloring60PaintMetrics';
import {
  reconcileSnapshotStatus,
  deriveColoring60ActivityState,
  HYDRATION_STATUS,
  COLORING60_SLOT_KIND,
  coloring60SlotKind,
} from './coloring60State';

/**
 * Estados possíveis de UMA vaga. Só `art` desenha imagem; nenhum outro estado usa o contorno
 * sozinho — contorno sem cor no lugar da obra é justamente a mentira que a Parte 8 proíbe.
 *
 * O VOCABULÁRIO NÃO NASCE MAIS AQUI: ele mora no modelo canônico (`coloring60State`), porque a
 * galeria da grande conclusão precisa da MESMA classificação e não pode depender deste leitor
 * (que faz I/O). `SLOT` continua existindo como o nome pelo qual as telas da coleção e da prévia
 * já o conhecem — mesmo objeto, um dono só.
 */
export const SLOT = COLORING60_SLOT_KIND;

// Rótulo curto (marcador temático) de cada parte, EXIBIDO SOB a obra — nunca por cima.
export const COLORING60_SLOT_MARKERS = Object.freeze({
  light: 'Luz',
  living_world: 'Vida',
  people_and_care: 'Cuidado',
});

/**
 * Assinatura de revisão de um conjunto de vagas: id + situação do instantâneo + tamanho do payload.
 * NÃO guarda arte — guarda só a informação de que ESTA revisão é a mesma. Qualquer pintura nova,
 * limpeza ou mudança de plano muda a assinatura. Usada pelo cache em memória da coleção.
 */
export function coloring60SlotSignature(slots) {
  return slots
    .map((s) => `${s.activityId}:${s.snapshotStatus}:${s.paint ? s.paint.length : 0}`)
    .join('|');
}

/**
 * slotKindOf(slot, state) — estado visual de UMA vaga. A REGRA em si não vive mais aqui: este é o
 * ponto onde a evidência FÍSICA que só o leitor conhece (o payload aberto e medido, o contorno
 * resolvido) é traduzida em fatos e entregue ao seletor compartilhado. Assim a coleção e a galeria
 * da grande conclusão respondem à mesma pergunta com a mesma boca — o que a Parte 8 já exigia
 * dentro da coleção passa a valer também entre telas.
 */
export function slotKindOf(slot, state) {
  return coloring60SlotKind({
    activityId: slot.activityId,
    isCurrentlyComplete: state.isCurrentlyComplete,
    hasEverCompleted: state.hasEverCompleted,
    snapshotStatus: slot.snapshotStatus,
    hasPaint: !!slot.paint,
    hasLineart: !!slot.lineart,
  });
}

/**
 * reconcileSlot — reconcilia UM registro de conclusão + metadados da atividade num "slot cru"
 * (sem `kind`). É o coração compartilhado: abre o blob salvo (evidência forte), mede cor real,
 * reconcilia o instantâneo com o disco e resolve o contorno oficial. Sem contorno não há
 * composição possível, então a pintura é descartada para o caminho de arte (`paint = null`).
 *
 * MIGRAÇÃO PREGUIÇOSA DO LEGADO (S2 · Spec 019). Quando a evidência forte não encontra arte,
 * ainda restam DOIS passados possíveis, e eles não podem ser confundidos: "nunca houve pintura
 * guardada" (conclusão legada — normal) e "havia e sumiu" (ponteiro órfão — integridade quebrada).
 * A pergunta que desempata é barata e não abre arquivo nenhum: EXISTE registro de instantâneo?
 * Ela só é feita quando o desempate importa — se a arte apareceu, o caso já está resolvido e não
 * se gasta uma segunda leitura. Nada aqui escreve, apaga ou reescreve chave: a compatibilidade
 * acontece na leitura, e o disco sai desta função exatamente como entrou.
 */
async function reconcileSlot(storyId, activityMeta, stored) {
  let paint = null;
  try {
    const saved = await getColoring60SavedDrawing(storyId, activityMeta.activityId);
    if (snapshotHasMeaningfulColor(saved)) paint = saved;
  } catch (err) {
    if (__DEV__) console.log(`[Coloring60] leitura de ${activityMeta.activityId} falhou:`, err?.message);
  }
  let hasSnapshotRecord = null;
  if (paint == null) {
    try {
      hasSnapshotRecord = await hasColoring60SnapshotRecord(storyId, activityMeta.activityId);
    } catch (err) {
      // Sem resposta confiável, NÃO se inventa um passado: a evidência fica indefinida e a regra
      // canônica mantém o comportamento conservador (integridade quebrada continua visível).
      hasSnapshotRecord = null;
      if (__DEV__) console.log(`[Coloring60] sonda de registro de ${activityMeta.activityId} falhou:`, err?.message);
    }
  }
  const snapshotStatus = reconcileSnapshotStatus(
    stored.storedSnapshotStatus,
    paint != null,
    hasSnapshotRecord === null ? {} : { hasSnapshotRecord },
  );
  const res = resolveColoring60Lineart(storyId, activityMeta.activityId);
  const lineart = res.status === COLORING60_RESOLUTION_STATUS.AVAILABLE ? res.source : null;
  return {
    activityId: activityMeta.activityId,
    title: activityMeta.title,
    marker: COLORING60_SLOT_MARKERS[activityMeta.activityId] ?? activityMeta.title,
    isCurrentlyComplete: stored.isCurrentlyComplete === true,
    hasEverCompleted: stored.hasEverCompleted === true,
    snapshotStatus,
    paint: paint && lineart ? paint : null, // sem contorno não há composição possível
    lineart,
  };
}

/** Estado canônico normalizado a partir de um slot cru (fonte de `kind` para as duas telas). */
function slotStateOf(slot) {
  return deriveColoring60ActivityState({
    activityId: slot.activityId,
    isCurrentlyComplete: slot.isCurrentlyComplete,
    hasEverCompleted: slot.hasEverCompleted,
    snapshotStatus: slot.snapshotStatus,
    hydrationStatus: HYDRATION_STATUS.READY,
  });
}

/**
 * coloring60SlotWithKind(slot) — anexa a UM slot cru o seu `kind` reconciliado, pela MESMA derivação
 * que `loadColoring60Slot` usa para a prévia. É o ponto único de anexação de `kind` para a coleção:
 * o retrato em memória guarda slots JÁ com `kind`, e a tela não recalcula estado visual por conta
 * própria. `slotStateOf` continua privada; ninguém reimplementa a derivação de fora.
 */
export function coloring60SlotWithKind(slot) {
  return { ...slot, kind: slotKindOf(slot, slotStateOf(slot)) };
}

/**
 * loadColoring60Slots(storyId) — LEITURA ÚNICA e completa da jornada: retrato de conclusão (um
 * multiGet) + pintura guardada de cada parte + contorno oficial. Devolve os espaços já
 * reconciliados. Sem `kind` (a coleção calcula o `kind` junto do estado derivado que ela também
 * usa para a integridade). Falha de leitura do registro vira ERRO honesto (throw), NUNCA uma
 * coleção vazia inventada que apagaria três obras existentes.
 */
export async function loadColoring60Slots(storyId) {
  const activities = getColoring60Activities(storyId); // ordem fechada: Luz · Vida · Cuidado
  const ids = activities.map((a) => a.activityId);
  const record = await loadColoring60JourneyRecord(storyId, ids);
  if (record.readFailed === true) {
    throw new Error('coloring60: leitura da coleção indisponível');
  }
  const byId = new Map((record.activities || []).map((a) => [a.activityId, a]));
  const slots = await Promise.all(
    activities.map((a) => reconcileSlot(storyId, a, byId.get(a.activityId) || {})),
  );
  return { slots, finaleSeen: record.finaleSeen === true };
}

/**
 * loadColoring60Slot(storyId, activityId) — LEITURA de UMA obra, para a PRÉVIA AMPLIADA. Devolve o
 * slot JÁ com o `kind` reconciliado, ou `null` quando a identidade não pertence a esta história
 * (o chamador cai num estado honesto). Usa EXATAMENTE a mesma reconciliação de `loadColoring60Slots`
 * — a prévia carrega a obra pela leitura canônica, não por bytes vindos da navegação.
 */
export async function loadColoring60Slot(storyId, activityId) {
  const activities = getColoring60Activities(storyId);
  const meta = activities.find((a) => a.activityId === activityId);
  if (!meta) return null; // identidade fora do piloto/história ⇒ estado honesto, nunca 'light'
  const record = await loadColoring60JourneyRecord(storyId, [activityId]);
  if (record.readFailed === true) {
    throw new Error('coloring60: leitura da obra indisponível');
  }
  const stored = (record.activities || []).find((a) => a.activityId === activityId) || {};
  const slot = await reconcileSlot(storyId, meta, stored);
  return { ...slot, kind: slotKindOf(slot, slotStateOf(slot)) };
}
