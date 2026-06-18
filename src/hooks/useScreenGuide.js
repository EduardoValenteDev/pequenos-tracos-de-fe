/**
 * useScreenGuide — guia contextual do Beni por tela (UX 2.2).
 *
 * Mostra o guia da tela na PRIMEIRA visita (flag por chave em beniTourService),
 * uma vez. Pode ser pulado/concluído → marca a flag → não volta no uso normal.
 *
 * Seguro: se a leitura da flag falhar, NÃO mostra (não atrapalha). Usa
 * useFocusEffect para checar ao focar a tela (não empilha em telas não-focadas).
 *
 *   const guide = useScreenGuide('home');           // ou outra GUIDE_KEY
 *   {guide.visible && <BeniGuideOverlay ... onFinish={guide.close} onSkip={guide.close} />}
 */
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { hasSeenGuide, markGuideSeen } from '../services/beniTourService';

export function useScreenGuide(guideKey, enabled = true, delay = 450) {
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      let timer;
      if (enabled && guideKey && !shownRef.current) {
        hasSeenGuide(guideKey).then((seen) => {
          if (alive && !seen && !shownRef.current) {
            shownRef.current = true;
            timer = setTimeout(() => { if (alive) setVisible(true); }, delay);
          }
        });
      }
      return () => { alive = false; if (timer) clearTimeout(timer); };
    }, [guideKey, enabled, delay]),
  );

  const close = useCallback(() => {
    setVisible(false);
    markGuideSeen(guideKey);
  }, [guideKey]);

  return { visible, close };
}
