/**
 * bootRoute.js — regras PURAS do contrato de boot (LP1A). Sem I/O, sem imports, nunca lança.
 *
 * Por que existe: as transições do boot (fonte carregada × fonte com erro; onboarding pendente ×
 * concluído; storage falhando; desmontagem antes da decisão; conclusão em dobro) precisam ser
 * provadas por TESTE, não por leitura de regex. O projeto não tem jest/react-test-renderer e
 * adicionar um seria dependência nova (proibida) — então a lógica decidível fica aqui, pura, e o
 * smoke a executa de verdade. Mesmo padrão já usado por `onboardingName.js`.
 *
 * Quem orquestra continua sendo quem sempre foi: App.js (fontes) e SplashScreen (rota).
 */

/** Destino determinístico quando não há motivo para desviar (inclui falha de storage). */
export const BOOT_FALLBACK_ROUTE = 'Home';

/** Teto de espera das fontes. O `error` do useFonts NÃO cobre uma Promise que fica pendente. */
export const FONT_TIMEOUT_MS = 1500;

/** Tentativas de navegação do boot: a 1ª + repescagens. Limitado — nunca vira loop. */
export const MAX_NAV_ATTEMPTS = 3;
/** Espaçamento das repescagens (evita loop rápido). */
export const NAV_RETRY_MS = 250;

/** Rota oficial de destino do boot. Só um onboarding pendente desvia o fluxo. */
export function resolveBootRoute(showOnboarding) {
  return showOnboarding ? 'Onboarding' : BOOT_FALLBACK_ROUTE;
}

/**
 * Ainda esperando as fontes?
 * Só enquanto NÃO carregou, NÃO falhou e NÃO estourou o teto. Erro é motivo para SEGUIR
 * (degradação segura), nunca para esperar — tratar "carregando" e "falhou" como o mesmo estado
 * era o P0 LP0-BOOT-01. O teto cobre o caso que o `error` do hook NÃO cobre: a Promise das
 * fontes ficar pendente para sempre (nem resolve, nem rejeita).
 */
export function isWaitingForFonts(fontsLoaded, fontError, fontTimedOut) {
  return !fontsLoaded && !fontError && !fontTimedOut;
}

/**
 * Pode tentar navegar de novo depois de um `navigation.replace` que lançou?
 * Só enquanto montado, sem repescagem já agendada e dentro do limite — a retentativa é
 * LIMITADA por construção (nunca infinita) e não depende de um timer que já disparou.
 */
export function canRetryNavigation({ attempts, alive, scheduled }) {
  return !!alive && !scheduled && (attempts || 0) < MAX_NAV_ATTEMPTS;
}

/**
 * Pode navegar? Exige, ao mesmo tempo:
 *  - `alive`: ainda montado (nada de navegar/atualizar depois do unmount);
 *  - `!navigated`: ainda não navegou (trava contra navegação dupla);
 *  - `route != null`: a rota já foi DECIDIDA (prontidão, não relógio);
 *  - `animationDone`: a animação aprovada terminou.
 */
export function canNavigate({ route, animationDone, alive, navigated }) {
  return !!alive && !navigated && route != null && !!animationDone;
}

export default resolveBootRoute;
