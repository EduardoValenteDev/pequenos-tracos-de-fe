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
  // Feature 009 — "Palavrinhas do Beni". P4 = protótipo visual (Portão Visual 1).
  // Registrada SÓ sob o gate interno enquanto o jogo está em desenvolvimento.
  PALAVRINHAS_DO_BENI: 'PalavrinhasDoBeni',

  // ── Outros ────────────────────────────────────────────────────────────────
  PARENT_AREA: 'ParentArea',
  BENI_CHEST: 'BeniChest',
  FAMILY_WORSHIP: 'FamilyWorship',

  // ── Somente desenvolvimento (registradas sob isInternalToolsEnabled) ──────
  COLORING_QA: 'ColoringQa',
  PACK_SANDBOX_DEV: 'PackSandboxDev',
  // Colorir 60 — bancada para reencenar 0/3, 1/3, 2/3, 3/3 e as reedições no aparelho real.
  // SÓ dev-gated (rota) + Modo Criador (tela). Ver coloring60LabService.
  COLORING60_LAB: 'Coloring60Lab',
  SCENE_VALIDATION: 'SceneValidation',
  OVELHA_ASSET_GALLERY: 'OvelhaAssetGallery',
  // Monte a Cena — Architecture Spike M1A (baseline C-SVG, 4 peças). SÓ dev-gated. Legado técnico.
  MONTE_A_CENA_SPIKE: 'MonteACenaSpike',
  // Monte a Cena — protótipo visual M1R1 (tela clara, sem rolagem). SÓ dev-gated. Legado.
  MONTE_A_CENA_PROTOTYPE: 'MonteACenaPrototype',
  // Monte a Cena — seleção de níveis + rodada. SÓ dev-gated. GAME = legado M1R2.1; GAME_V2 = M1R2R.
  MONTE_A_CENA_LEVELS: 'MonteACenaLevels',
  MONTE_A_CENA_GAME: 'MonteACenaGame',
  MONTE_A_CENA_GAME_V2: 'MonteACenaGameV2',
  // M1R3 — entrada (catálogo de cenas), escolha de dificuldade e galeria "Meus Quadros".
  MONTE_A_CENA_HOME: 'MonteACenaHome',
  MONTE_A_CENA_DIFFICULTY: 'MonteACenaDifficulty',
  MONTE_A_CENA_GALLERY: 'MonteACenaGallery',
  // M1R6 — tela da HISTÓRIA (quadros em grade 2×2). Entra entre Home (galeria de histórias) e a
  // Mesa do Beni (dificuldade). SÓ dev-gated como o resto de Monte a Cena.
  MONTE_A_CENA_STORY: 'MonteACenaStory',
  // M1R4 Portão 1 — laboratório isolado do motor de gestos. SÓ Modo Criador.
  PUZZLE_GESTURE_LAB: 'PuzzleGestureLab',
  // M1R5 — RODADA REAL integrada (motor usePuzzleEngine). É a rota que a criança usa.
  MONTE_A_CENA_TABLE_GAME: 'MonteACenaTableGame',
});

export default ROUTES;
