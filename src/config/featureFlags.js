/**
 * featureFlags — chaves simples para ligar/desligar recursos do app
 * sem deletar código.
 *
 * STAMPS_ENABLED — Carimbos da Fé no Canvas do Ateliê.
 *   Desligado (false) no fluxo principal para reduzir confusão de ferramentas
 *   (UX 1.0 — Bloco 3). O código dos carimbos permanece no AtelierCanvas e no
 *   AtelierCanvasScreen; apenas a interface de seleção/uso não é renderizada.
 *   Religar é trocar para `true` (sem migração de dados).
 */
export const STAMPS_ENABLED = false;

/**
 * PARENTAL_CONSENT_FLOW_ENABLED — fluxo formal de registrar/revogar consentimento
 * parental na Área dos Pais.
 *   Desligado (false) enquanto NÃO houver compartilhamento, conta, envio externo,
 *   imagem/áudio da criança ou recurso sensível — nesse cenário o consentimento
 *   formal não libera nenhuma função, então não deve aparecer como ação principal
 *   (UX 1.0 — Bloco 4E). No lugar, mostra-se um texto informativo. O código do
 *   fluxo (parentSettingsService + handlers) permanece; basta voltar para `true`
 *   quando um recurso sensível existir.
 */
export const PARENTAL_CONSENT_FLOW_ENABLED = false;

/**
 * SHOW_CHURCH_MODE — seção "Modo Igreja" (turmas/professores/"Criar turma") na
 * Área dos Pais.
 *   Decisão CONGELADA (DECISIONS.md #5): o Modo Igreja NÃO aparece no v1 — fica
 *   atrás de uma flag de BUILD, escondido por padrão em produção. Só é exibido
 *   quando `EXPO_PUBLIC_ENABLE_CHURCH_MODE === 'true'` (desenvolvimento controlado).
 *   O código do churchModeService permanece; apenas a entrada visível é ocultada.
 *   IMPORTANTE: o Cultinho em Casa (rota FamilyWorship) é feature SEPARADA e segue
 *   visível no v1 — NÃO depende desta flag. A flag não é segredo (EXPO_PUBLIC_*).
 */
export const SHOW_CHURCH_MODE =
  process.env.EXPO_PUBLIC_ENABLE_CHURCH_MODE === 'true';
