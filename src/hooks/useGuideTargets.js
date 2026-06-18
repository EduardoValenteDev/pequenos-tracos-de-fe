/**
 * useGuideTargets — registro + MEDIÇÃO REAL de alvos para os guias do Beni (UX 2.3).
 *
 * A tela registra elementos por nome (ex.: 'adventures.viewMapButton') e o
 * BeniGuideOverlay mede o alvo de verdade (measureInWindow) antes de destacar. Sem
 * medição → sem contorno (nunca aponta para o lugar errado).
 *
 * Uso na tela:
 *   const g = useGuideTargets();
 *   <View ref={g.register('adventures.map')} collapsable={false}> ... </View>
 *   <BeniGuideOverlay ... measure={g.measure} />
 *
 * measure(name) → Promise<{x,y,width,height} | null> (null = não medível → fallback).
 */
import { useRef, useCallback } from 'react';

export function useGuideTargets() {
  const nodes = useRef({}).current;

  const register = useCallback(
    (name) => (node) => {
      if (node) nodes[name] = node;
      else delete nodes[name];
    },
    [nodes],
  );

  const measure = useCallback(
    (name) =>
      new Promise((resolve) => {
        const node = nodes[name];
        if (!node || typeof node.measureInWindow !== 'function') {
          resolve(null);
          return;
        }
        try {
          node.measureInWindow((x, y, width, height) => {
            if (typeof width === 'number' && width > 0 && height > 0) {
              resolve({ x, y, width, height });
            } else {
              resolve(null);
            }
          });
        } catch {
          resolve(null);
        }
      }),
    [nodes],
  );

  return { register, measure };
}
