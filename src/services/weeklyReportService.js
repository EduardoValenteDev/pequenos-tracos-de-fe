/**
 * weeklyReportService.js — Relatório semanal de progresso dos pais.
 *
 * Calcula e persiste relatórios semanais com base nos dados locais existentes.
 * Sem notificações, sem email, sem backend, sem tela neste sprint.
 * Se não houver dados, retorna relatório vazio seguro (sem lançar erro).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageKey } from './storageKeys';
import { createWeeklyReport } from '../data/appDataModel';
import { log } from '../utils/logger';

// ── Índice por filho ──────────────────────────────────────────────────────────

async function readIndex(childId) {
  if (!childId) return [];
  try {
    const raw = await AsyncStorage.getItem(storageKey.weeklyReportsIndex(childId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(childId, index) {
  try {
    await AsyncStorage.setItem(storageKey.weeklyReportsIndex(childId), JSON.stringify(index));
  } catch (e) {
    log('weeklyReportService.writeIndex:', e);
  }
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Constrói um relatório semanal com base nos dados locais disponíveis.
 * Se não houver dados, retorna relatório com zeros (nunca lança).
 *
 * Nota: neste sprint, os valores reais (storiesCompleted, etc.) devem ser
 * passados pelo chamador — o serviço apenas estrutura e valida.
 */
export async function buildWeeklyReport({ childId, weekStart, weekEnd, storiesCompleted, drawingsSaved, quizzesCompleted, starsEarned, achievementsEarned } = {}) {
  return createWeeklyReport({
    childId,
    weekStart,
    weekEnd,
    storiesCompleted: storiesCompleted || 0,
    drawingsSaved: drawingsSaved || 0,
    quizzesCompleted: quizzesCompleted || 0,
    starsEarned: starsEarned || 0,
    achievementsEarned: achievementsEarned || 0,
  });
}

/**
 * Persiste um relatório semanal.
 * Retorna o relatório salvo.
 */
export async function saveWeeklyReport(report) {
  if (!report || !report.id || !report.childId) return report;
  try {
    await AsyncStorage.setItem(storageKey.weeklyReport(report.id), JSON.stringify(report));
    const index = await readIndex(report.childId);
    const exists = index.find(r => r.id === report.id);
    if (!exists) {
      index.unshift({ id: report.id, childId: report.childId, weekStart: report.weekStart, weekEnd: report.weekEnd, createdAt: report.createdAt });
      await writeIndex(report.childId, index);
    }
    return report;
  } catch (e) {
    log('weeklyReportService.save:', e);
    return report;
  }
}

/**
 * Retorna o relatório mais recente de uma criança, ou null.
 */
export async function getLatestWeeklyReport(childId) {
  if (!childId) return null;
  try {
    const index = await readIndex(childId);
    if (index.length === 0) return null;
    const latest = index[0];
    const raw = await AsyncStorage.getItem(storageKey.weeklyReport(latest.id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Retorna todos os relatórios de uma criança (metadados do índice). */
export async function listWeeklyReportsByChild(childId) {
  if (!childId) return [];
  return readIndex(childId);
}

/** Remove um relatório pelo ID. */
export async function deleteWeeklyReport(reportId) {
  if (!reportId) return;
  try {
    const raw = await AsyncStorage.getItem(storageKey.weeklyReport(reportId));
    if (raw) {
      const report = JSON.parse(raw);
      await AsyncStorage.removeItem(storageKey.weeklyReport(reportId));
      if (report.childId) {
        const index = await readIndex(report.childId);
        await writeIndex(report.childId, index.filter(r => r.id !== reportId));
      }
    }
  } catch (e) {
    log('weeklyReportService.delete:', e);
  }
}
