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

/**
 * RELEASE_PACK_QA_ENABLED — libera a ferramenta técnica de QA de packs (seed/download/
 * diagnose do pack sandbox `david_goliath`) em build **preview/internal** (release, onde
 * `__DEV__` é false), para provar o **offline real do REMOTO** num app instalado (F2.4e.7b).
 *
 * ⚠️ RELEASE-SAFE por QUÁDRUPLO gate — TODAS precisam bater (conjunção, não flag simples):
 *   - EXPO_PUBLIC_ENABLE_PACK_SANDBOX     === 'true'
 *   - EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA  === 'true'
 *   - EXPO_PUBLIC_QA_BUILD                === 'true'
 *   - EXPO_PUBLIC_BUILD_PROFILE           === 'preview'
 *
 * PRODUÇÃO NUNCA liga: o perfil `production` do eas.json NÃO define nenhuma dessas flags;
 * e mesmo que EXPO_PUBLIC_ENABLE_PACK_SANDBOX vazasse sozinho, faltariam as outras três
 * (em especial BUILD_PROFILE === 'preview'). Flags NÃO são segredo (EXPO_PUBLIC_*). A
 * ferramenta continua TÉCNICA e restrita (FAB/rota dev), NUNCA child-facing.
 */
export const RELEASE_PACK_QA_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true' &&
  process.env.EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA === 'true' &&
  process.env.EXPO_PUBLIC_QA_BUILD === 'true' &&
  process.env.EXPO_PUBLIC_BUILD_PROFILE === 'preview';
