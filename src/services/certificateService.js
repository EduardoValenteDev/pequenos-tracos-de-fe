/**
 * certificateService.js — Registro local de certificados conquistados.
 *
 * Registra certificados por história ou trilha completada.
 * Geração visual (PDF/imagem) fica para sprint futuro.
 * Tudo local.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, storageKey } from './storageKeys';
import { createCertificateRecord, CERTIFICATE_TYPE } from '../data/appDataModel';
import { log } from '../utils/logger';

// ── Índice ────────────────────────────────────────────────────────────────────

async function readIndex() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CERTIFICATES_INDEX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(index) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CERTIFICATES_INDEX, JSON.stringify(index));
  } catch (e) {
    log('certificateService.writeIndex:', e);
  }
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Cria e persiste um certificado de história completada.
 * Retorna o certificado criado.
 */
export async function createStoryCertificate({ childId, storyId } = {}) {
  const cert = createCertificateRecord({
    childId,
    storyId,
    type: CERTIFICATE_TYPE.STORY,
    title: `História completada: ${storyId || ''}`,
  });
  await _persist(cert);
  return cert;
}

/**
 * Cria e persiste um certificado de trilha completada.
 * Retorna o certificado criado.
 */
export async function createTrackCertificate({ childId, trackId } = {}) {
  const cert = createCertificateRecord({
    childId,
    trackId,
    type: CERTIFICATE_TYPE.TRACK,
    title: `Trilha completada: ${trackId || ''}`,
  });
  await _persist(cert);
  return cert;
}

/** Retorna todos os certificados de uma criança. */
export async function listCertificatesByChild(childId) {
  if (!childId) return [];
  const index = await readIndex();
  return index.filter(c => c.childId === childId);
}

/** Retorna um certificado pelo ID, ou null se não encontrado. */
export async function getCertificate(certificateId) {
  if (!certificateId) return null;
  try {
    const raw = await AsyncStorage.getItem(storageKey.certificate(certificateId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Remove um certificado pelo ID. */
export async function deleteCertificate(certificateId) {
  if (!certificateId) return;
  try {
    await AsyncStorage.removeItem(storageKey.certificate(certificateId));
    const index = await readIndex();
    await writeIndex(index.filter(c => c.id !== certificateId));
  } catch (e) {
    log('certificateService.delete:', e);
  }
}

// ── Interno ───────────────────────────────────────────────────────────────────

async function _persist(cert) {
  try {
    await AsyncStorage.setItem(storageKey.certificate(cert.id), JSON.stringify(cert));
    const index = await readIndex();
    index.unshift({ id: cert.id, childId: cert.childId, type: cert.type, title: cert.title, createdAt: cert.createdAt });
    await writeIndex(index);
  } catch (e) {
    log('certificateService.persist:', e);
  }
}
