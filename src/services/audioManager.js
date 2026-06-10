/**
 * audioManager.js — controle central de áudio do app (UX 1.0 — Bloco 5).
 *
 * Centraliza três coisas, sem reescrever o pipeline de narração:
 *   1. Sons de UI (tap/success/reward) — sutis, respeitam `soundsEnabled`.
 *   2. Música de fundo — infraestrutura pronta; só toca se houver trilha local
 *      segura E `musicEnabled` ligado. Não há trilha final ainda → no-op seguro.
 *   3. Coordenação com a narração — a música NUNCA se sobrepõe à narração.
 *
 * Preferências locais ficam em `@ptf_audio_prefs_v1` (chave NOVA, sem migração
 * de chaves antigas). Padrão: sons ligados, música desligada (pronta p/ ativar).
 *
 * Defensivo: nenhuma função lança; falha de áudio é sempre silenciosa.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const PREFS_KEY = '@ptf_audio_prefs_v1';

// Sons de UI. Há um único asset seguro hoje (pop.wav); success/reward apontam
// para ele até existirem assets próprios. Estrutura pronta para diferenciá-los.
const UI_SOUNDS = {
  tap: require('../../assets/audio/pop.wav'),
  success: require('../../assets/audio/pop.wav'),
  reward: require('../../assets/audio/pop.wav'),
};

// Volume sutil por tipo (tap bem discreto para não cansar).
const UI_VOLUME = { tap: 0.4, success: 0.55, reward: 0.6 };

// Trilha de fundo: NÃO há asset final/seguro ainda. Mantido null de propósito
// (sem buscar música externa, sem trilha protegida). A infraestrutura já existe.
const MUSIC_TRACK = null;

const DEFAULT_PREFS = { soundsEnabled: true, musicEnabled: false };

let prefs = { ...DEFAULT_PREFS };
let prefsLoaded = false;

let audioModeReady = false;
const uiPlayers = {};       // type → expo-audio player (criado sob demanda)
let musicPlayer = null;
let musicPlaying = false;            // música deveria estar tocando agora?
let musicPausedForNarration = false; // foi pausada por causa de narração?

const listeners = new Set();

function notify() {
  const snap = getAudioPreferences();
  listeners.forEach(l => { try { l(snap); } catch { /* listener nunca quebra */ } });
}

async function ensureAudioMode() {
  if (audioModeReady) return;
  audioModeReady = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
    });
  } catch {
    audioModeReady = false;
  }
}

// ── Preferências ──────────────────────────────────────────────────────────────

/** Carrega as preferências locais (uma vez). Nunca lança. */
export async function loadAudioPreferences() {
  if (prefsLoaded) return getAudioPreferences();
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      prefs = {
        soundsEnabled: typeof p?.soundsEnabled === 'boolean' ? p.soundsEnabled : DEFAULT_PREFS.soundsEnabled,
        musicEnabled: typeof p?.musicEnabled === 'boolean' ? p.musicEnabled : DEFAULT_PREFS.musicEnabled,
      };
    }
  } catch {
    prefs = { ...DEFAULT_PREFS };
  }
  prefsLoaded = true;
  notify();
  return getAudioPreferences();
}

/** Snapshot síncrono das preferências atuais. */
export function getAudioPreferences() {
  return { soundsEnabled: prefs.soundsEnabled, musicEnabled: prefs.musicEnabled };
}

/** Assina mudanças de preferência. Retorna unsubscribe. */
export function subscribeAudioPreferences(fn) {
  if (typeof fn === 'function') listeners.add(fn);
  return () => listeners.delete(fn);
}

async function persistPrefs() {
  try { await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ignora */ }
}

// ── Sons de UI ──────────────────────────────────────────────────────────────

/**
 * Toca um som de UI curto. Só os botões PRINCIPAIS chamam isto (ações de alta
 * repetição passam `silent` no SoundButton e não chamam). Respeita soundsEnabled.
 */
export function playUiSound(type = 'tap') {
  if (!prefs.soundsEnabled) return;
  const src = UI_SOUNDS[type] || UI_SOUNDS.tap;
  if (!src) return;
  ensureAudioMode();
  try {
    let player = uiPlayers[type];
    if (!player) {
      player = createAudioPlayer(src, { keepAudioSessionActive: true });
      player.volume = UI_VOLUME[type] ?? 0.5;
      uiPlayers[type] = player;
    }
    player.seekTo(0);
    player.play();
  } catch {
    // som falhou silenciosamente — app continua funcionando
  }
}

/** Liga/desliga os sons de botões. Aplica na hora. */
export async function setSoundsEnabled(value) {
  prefs = { ...prefs, soundsEnabled: !!value };
  await persistPrefs();
  notify();
  return prefs.soundsEnabled;
}

// ── Música de fundo ──────────────────────────────────────────────────────────

/**
 * Inicia a música de fundo (se houver trilha E musicEnabled). Garante uma única
 * música por vez. Sem trilha segura ainda → no-op (infra pronta).
 */
export async function playMusic(track = MUSIC_TRACK) {
  if (!prefs.musicEnabled) return;
  if (!track) return; // sem trilha final/segura — não toca nada
  await ensureAudioMode();
  try {
    if (!musicPlayer) {
      musicPlayer = createAudioPlayer(track, { keepAudioSessionActive: true });
      musicPlayer.loop = true;
      musicPlayer.volume = 0.22; // fundo suave, nunca compete com narração
    }
    musicPlayer.play();
    musicPlaying = true;
  } catch {
    musicPlaying = false;
  }
}

/** Para a música e zera a posição. */
export function stopMusic() {
  try {
    if (musicPlayer) { musicPlayer.pause(); musicPlayer.seekTo(0); }
  } catch { /* ignora */ }
  musicPlaying = false;
  musicPausedForNarration = false;
}

/** Pausa a música (mantém posição). */
export function pauseMusic() {
  try { if (musicPlayer) musicPlayer.pause(); } catch { /* ignora */ }
}

/** Retoma a música apenas se ela estava tocando e musicEnabled segue ligado. */
export function resumeMusic() {
  if (!prefs.musicEnabled) return;
  try { if (musicPlayer && musicPlaying) musicPlayer.play(); } catch { /* ignora */ }
}

/** Liga/desliga a música de fundo. Desligar para a música na hora. */
export async function setMusicEnabled(value) {
  prefs = { ...prefs, musicEnabled: !!value };
  await persistPrefs();
  notify();
  if (!prefs.musicEnabled) {
    stopMusic(); // desligou → silêncio imediato
  } else {
    playMusic(); // ligou → tenta tocar (no-op enquanto não houver trilha)
  }
  return prefs.musicEnabled;
}

// ── Narração ──────────────────────────────────────────────────────────────────
// Regra obrigatória: a música NUNCA se sobrepõe à narração.

/** Chamado quando uma narração começa (história, Livrinho, etc.). Pausa a música. */
export function onNarrationStart() {
  musicPausedForNarration = musicPlaying;
  pauseMusic();
}

/** Chamado quando a narração termina/sai. Retoma a música só se musicEnabled. */
export function onNarrationEnd() {
  if (musicPausedForNarration && prefs.musicEnabled) {
    resumeMusic();
  }
  musicPausedForNarration = false;
}

/**
 * A narração tem player próprio (components/AudioPlayer.js via expo-audio). Aqui
 * só coordenamos a música. Mantido para uma futura integração centralizada.
 */
export function playNarration() {
  onNarrationStart();
}

// Carrega as preferências assim que o módulo é importado (fire-and-forget).
loadAudioPreferences();
