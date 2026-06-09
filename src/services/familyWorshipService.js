/**
 * familyWorshipService.js — registro LOCAL do "Cultinho em Casa".
 *
 * Guarda apenas dados não sensíveis e prepara o terreno para um relatório
 * semanal futuro. NUNCA salva: texto livre da criança, foto, áudio, localização
 * ou qualquer dado pessoal. Tudo fica no AsyncStorage local do aparelho.
 *
 * Shape salvo em `@ptf_family_worship_v1`:
 *   { count: number, lastDate: 'YYYY-MM-DD' | null, lastStoryId: string | null }
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getShowcaseStory } from './showcaseStory';

const KEY = '@ptf_family_worship_v1';

function todayLocal() {
  // Data local em YYYY-MM-DD (sem horário, sem fuso exposto) — não é dado sensível.
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const EMPTY = { count: 0, lastDate: null, lastStoryId: null };

/** Resumo seguro dos cultinhos concluídos. Nunca lança. */
export async function getFamilyWorshipSummary() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return {
      count: Number.isFinite(parsed?.count) ? parsed.count : 0,
      lastDate: typeof parsed?.lastDate === 'string' ? parsed.lastDate : null,
      lastStoryId: typeof parsed?.lastStoryId === 'string' ? parsed.lastStoryId : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

/** Última data (YYYY-MM-DD) em que um cultinho foi concluído, ou null. */
export async function getLastFamilyWorshipDate() {
  const s = await getFamilyWorshipSummary();
  return s.lastDate;
}

/**
 * Marca um Cultinho em Casa como concluído. Incrementa a contagem e registra a
 * data local + o id da história sugerida (se houver). Retorna o novo resumo.
 */
export async function markFamilyWorshipCompleted(storyId = null) {
  const current = await getFamilyWorshipSummary();
  const next = {
    count: current.count + 1,
    lastDate: todayLocal(),
    lastStoryId: typeof storyId === 'string' ? storyId : null,
  };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Falha de escrita não pode quebrar o fluxo do cultinho.
  }
  return next;
}

/**
 * História do Domingo (PREPARO — não é a versão final).
 *
 * Hoje retorna simplesmente a história vitrine (getShowcaseStory). No futuro,
 * esta função poderá rotacionar uma "História da Semana" recomendada, SEM
 * notificações, SEM agendamento e SEM push — apenas escolha local determinística
 * (ex.: índice por número da semana). Mantida leve de propósito.
 */
export function getStoryOfTheWeek() {
  return getShowcaseStory();
}
