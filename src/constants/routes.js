/**
 * routes.js — FONTE ÚNICA dos nomes de rota do app (Bloco 1.1 — fundação do Brincar).
 *
 * Hoje os nomes de rota são strings literais espalhadas por dezenas de arquivos
 * (`navigation.navigate('AtelierCanvas')`). Isso torna qualquer renomeação uma caçada
 * a strings. Este módulo centraliza os nomes SEM renomear nada: cada constante devolve
 * exatamente o valor que já está registrado no `AppNavigator`.
 *
 * ⚠️ Os VALORES são o contrato com o React Navigation e com o histórico de navegação.
 * Trocar um valor aqui quebra toda a navegação. Quando a aba "Ateliê" virar "Brincar"
 * na UI (Bloco 1.2), muda-se o RÓTULO visível — não estas strings.
 *
 * Puro: sem imports, sem side effects.
 */

export const ROUTES = Object.freeze({
  // ── Abas (nomes internos; o rótulo visível vive em TAB_DEFS) ──────────────
  HOME: 'Home',
  ADVENTURES: 'Aventuras',
  /** Aba de atividades. Rótulo visível migra para "Brincar" no Bloco 1.2. */
  ACTIVITIES: 'Ateliê',
  TROPHIES: 'Estrelinhas',
  PROFILE: 'Perfil',

  // ── Histórias ─────────────────────────────────────────────────────────────
  STORY_DETAIL: 'StoryDetail',
  NARRATION: 'Narration',
  QUIZ: 'Quiz',
  REFLECTION: 'Reflection',
  STORY_BOOK: 'StoryBook',
  CONGRATS: 'Congrats',
  POST_STORY_HUB: 'PostStoryHub',
  COLORING: 'Coloring',

  // ── Criação (nomes legados: NÃO renomear, quebram navegação) ──────────────
  ATELIER_CANVAS: 'AtelierCanvas',
  ATELIER_GALLERY: 'AtelierGallery',

  // ── Brincar — jogos (Bloco 1.3+) ──────────────────────────────────────────
  PARES_DO_BENI: 'ParesDoBeni',
  // Bloco 2.1 — vertical slice. Rota registrada SÓ sob o gate interno enquanto os
  // assets forem temporários (ver AppNavigator); em produção ela não existe.
  CADE_A_OVELHINHA: 'CadeAOvelhinha',

  // ── Outros ────────────────────────────────────────────────────────────────
  PARENT_AREA: 'ParentArea',
  BENI_CHEST: 'BeniChest',
  FAMILY_WORSHIP: 'FamilyWorship',

  // ── Somente desenvolvimento (registradas sob isInternalToolsEnabled) ──────
  COLORING_QA: 'ColoringQa',
  PACK_SANDBOX_DEV: 'PackSandboxDev',
  SCENE_VALIDATION: 'SceneValidation',
});

export default ROUTES;
