/**
 * guideTargetRegistry.js — registro GLOBAL de alvos medíveis do guia (Tablet 1.1).
 *
 * O guia (BeniGuideOverlay, dentro de AdventureMapScreen) precisa medir um item que
 * vive em OUTRO componente — a opção "Aventuras" da sidebar do tablet (TabletSidebar,
 * renderizada no AppNavigator). Como o `useGuideTargets` é local da tela, este
 * registro mínimo em memória permite registrar/medir alvos cross-component, sem
 * arquitetura grande nem pacote novo.
 *
 * Uso:
 *   <View collapsable={false} ref={registerGuideTarget('adventures.sidebarTab')} />
 *   measureGuideTarget('adventures.sidebarTab') → Promise<{x,y,width,height}|null>
 *
 * Seguro: sem nó/medição → null (o guia cai no fallback honesto, sem seta errada).
 */
const _nodes = {};
const _callbacks = {}; // callback ref ESTÁVEL por nome (evita churn de ref)

/** Retorna um callback ref estável que registra/limpa o nó nativo do alvo `name`. */
export function registerGuideTarget(name) {
  if (!_callbacks[name]) {
    _callbacks[name] = (node) => {
      if (node) _nodes[name] = node;
      else delete _nodes[name];
    };
  }
  return _callbacks[name];
}

/** Mede o alvo `name` (measureInWindow). null se não registrado/medível. Nunca lança. */
export function measureGuideTarget(name) {
  return new Promise((resolve) => {
    const node = _nodes[name];
    if (!node || typeof node.measureInWindow !== 'function') {
      resolve(null);
      return;
    }
    try {
      node.measureInWindow((x, y, width, height) => {
        resolve(typeof width === 'number' && width > 0 && height > 0 ? { x, y, width, height } : null);
      });
    } catch {
      resolve(null);
    }
  });
}
