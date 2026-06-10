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
