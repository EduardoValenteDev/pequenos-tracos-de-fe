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

// Efeitos dos jogos da aba Brincar (Bloco 1.4). Curtos, sintetizados para o app.
// Ficam separados dos sons de UI: têm volume próprio e podem ser liberados quando
// a tela do jogo sai, sem afetar os botões do resto do app.
const GAME_SFX = {
  card_flip: require('../../assets/audio/sfx/card_flip.wav'),
  match_success: require('../../assets/audio/sfx/match_success.wav'),
  match_error: require('../../assets/audio/sfx/match_error.wav'),
  game_victory: require('../../assets/audio/sfx/game_victory.wav'),
  turbo_end: require('../../assets/audio/sfx/turbo_end.wav'),
  // Bloco 1.4b — contagem regressiva, alarme e vinhetas de encerramento.
  countdown_tick: require('../../assets/audio/sfx/countdown_tick.wav'),
  time_up_alarm: require('../../assets/audio/sfx/time_up_alarm.wav'),
  board_complete: require('../../assets/audio/sfx/board_complete.wav'),
  classic_victory_jingle: require('../../assets/audio/sfx/classic_victory_jingle.wav'),
  turbo_result_jingle: require('../../assets/audio/sfx/turbo_result_jingle.wav'),
};

const GAME_SFX_VOLUME = {
  card_flip: 0.30, match_success: 0.50, match_error: 0.34,
  game_victory: 0.55, turbo_end: 0.5,
  countdown_tick: 0.38, time_up_alarm: 0.5, board_complete: 0.5,
  classic_victory_jingle: 0.55, turbo_result_jingle: 0.55,
};

// Intervalo mínimo entre duas execuções do MESMO efeito. Toques rápidos numa carta
// não podem empilhar dezenas de reproduções.
const SFX_MIN_INTERVAL_MS = 70;

/**
 * Throttle por efeito, quando o padrão não serve.
 * `countdown_tick` bate 1× por segundo: 300 ms impede um toque duplo no mesmo
 * segundo sem NUNCA barrar o tique seguinte. As vinhetas são longas: um segundo
 * disparo dentro delas seria eco.
 */
const SFX_INTERVAL_OVERRIDE = {
  countdown_tick: 300,
  time_up_alarm: 1200,
  classic_victory_jingle: 2600,
  turbo_result_jingle: 2400,
};

// Trilha de fundo: NÃO há asset final/seguro ainda. Mantido null de propósito
// (sem buscar música externa, sem trilha protegida). A infraestrutura já existe.
const MUSIC_TRACK = null;

const DEFAULT_PREFS = { soundsEnabled: true, musicEnabled: false };

let prefs = { ...DEFAULT_PREFS };
let prefsLoaded = false;

let audioModeReady = false;
const uiPlayers = {};       // type → expo-audio player (criado sob demanda)
const sfxPlayers = {};      // nome → expo-audio player dos jogos
const sfxLastPlayedAt = {}; // nome → timestamp (throttle)
let musicPlayer = null;
let musicPlaying = false;            // música deveria estar tocando agora?
let musicPausedForNarration = false; // foi pausada por causa de narração?

const listeners = new Set();

function notify() {
  const snap = getAudioPreferences();
  listeners.forEach(l => { try { l(snap); } catch { /* listener nunca quebra */ } });
}

// V1 — idempotente e reaproveitável: garante o audio mode (playsInSilentMode) antes
// de qualquer fala. Já usada por sons de UI/música; EXPORTADA para o guia do Beni
// garantir a voz do tour mesmo com a chave de silencioso do iPhone ligada.
export async function ensureAudioMode() {
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

// ── Efeitos dos jogos (Brincar) ──────────────────────────────────────────────
// Nenhuma destas funções lança: um jogo NUNCA quebra por causa de som.

function sfxPlayer(nome) {
  const src = GAME_SFX[nome];
  if (!src) return null;
  if (!sfxPlayers[nome]) {
    const p = createAudioPlayer(src, { keepAudioSessionActive: true });
    p.volume = GAME_SFX_VOLUME[nome] ?? 0.45;
    sfxPlayers[nome] = p;
  }
  return sfxPlayers[nome];
}

/**
 * Pré-carrega os efeitos do jogo (evita atraso no primeiro toque de carta).
 * `nomes` limita ao que a tela realmente usa.
 */
export function preloadGameSfx(nomes = Object.keys(GAME_SFX)) {
  ensureAudioMode();
  for (const nome of nomes) {
    try { sfxPlayer(nome); } catch { /* segue sem som */ }
  }
}

/**
 * Toca um efeito do jogo. Respeita `soundsEnabled` (mesma preferência global dos
 * botões) e ignora repetições coladas do mesmo efeito.
 */
/**
 * Toca um efeito do jogo. Respeita `soundsEnabled` (mesma preferência global dos
 * botões) e ignora repetições coladas do mesmo efeito.
 *
 * ⚠️ `seekTo()` do expo-audio é ASSÍNCRONO (devolve Promise). O código anterior fazia
 * `p.seekTo(0); p.play();` — e o `play()` rodava ANTES do seek resolver. Na primeira
 * execução o player já estava na posição 0 e o som saía; na segunda ele estava parado
 * no FIM do arquivo, o `play()` não tinha o que tocar, e o seek voltava para 0 em
 * silêncio. Era exatamente o "segundo par não toca". O play agora espera o seek.
 */
export function playGameSfx(nome) {
  if (!prefs.soundsEnabled) return;
  const agora = Date.now();
  const minimo = SFX_INTERVAL_OVERRIDE[nome] ?? SFX_MIN_INTERVAL_MS;
  if (agora - (sfxLastPlayedAt[nome] || 0) < minimo) return;
  sfxLastPlayedAt[nome] = agora;
  ensureAudioMode();
  try {
    const p = sfxPlayer(nome);
    if (!p) return;
    if (p.playing) p.pause();          // rearma sem sobrepor a execução anterior
    const seek = p.seekTo(0);
    if (seek && typeof seek.then === 'function') {
      seek.then(() => { try { p.play(); } catch { /* som falhou; jogo segue */ } })
        .catch(() => { try { p.play(); } catch { /* melhor esforço */ } });
    } else {
      p.play();                        // implementação síncrona (web/mocks)
    }
  } catch {
    // som falhou silenciosamente — o jogo continua
  }
}

/**
 * Silencia um efeito já tocando (ex.: o relógio, quando a partida pausa ou acaba).
 * Não destrói o player — o próximo `playGameSfx` volta a usá-lo.
 */
export function stopGameSfx(nome) {
  try {
    const p = sfxPlayers[nome];
    if (p) { p.pause(); p.seekTo(0); }
  } catch { /* ignora */ }
}

/** Libera os players dos efeitos (chamar no unmount da tela do jogo). */
export function releaseGameSfx() {
  for (const nome of Object.keys(sfxPlayers)) {
    try { sfxPlayers[nome].remove(); } catch { /* ignora */ }
    delete sfxPlayers[nome];
    delete sfxLastPlayedAt[nome];
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
