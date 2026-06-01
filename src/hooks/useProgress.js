import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

const PROGRESS_KEY = '@ptf_progress';

export function useProgress(historiaId) {
  const [progresso, setProgresso] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    obterProgresso();
  }, [historiaId]);

  async function obterProgresso() {
    try {
      const raw = await AsyncStorage.getItem(`${PROGRESS_KEY}_${historiaId}`);
      setProgresso(raw ? JSON.parse(raw) : {});
    } catch (e) {
      log('useProgress.obterProgresso:', e);
    } finally {
      setCarregando(false);
    }
  }

  const salvarCena = useCallback(async (cenaId) => {
    try {
      const novo = { ...progresso, [cenaId]: true };
      await AsyncStorage.setItem(`${PROGRESS_KEY}_${historiaId}`, JSON.stringify(novo));
      setProgresso(novo);
    } catch (e) {
      log('useProgress.salvarCena:', e);
    }
  }, [historiaId, progresso]);

  async function limparProgresso() {
    try {
      await AsyncStorage.removeItem(`${PROGRESS_KEY}_${historiaId}`);
      setProgresso({});
    } catch (e) {
      log('useProgress.limparProgresso:', e);
    }
  }

  return { progresso, salvarCena, limparProgresso, carregando };
}
