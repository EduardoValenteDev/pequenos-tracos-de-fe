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
 *   - EXPO_PUBLIC_BUILD_PROFILE           === 'preview' OU 'preview-criador'
 *
 * A última condição é uma LISTA FECHADA de perfis internos (`distribution: internal`),
 * não um curinga: `preview` é o laboratório de packs; `preview-criador` é o MESMO
 * laboratório acrescido do Modo Criador (B4). Qualquer outro valor — inclusive vazio —
 * mantém a ferramenta desligada.
 *
 * PRODUÇÃO NUNCA liga: o perfil `production` do eas.json NÃO define nenhuma dessas flags;
 * e mesmo que EXPO_PUBLIC_ENABLE_PACK_SANDBOX vazasse sozinho, faltariam as outras três
 * (em especial BUILD_PROFILE em um perfil interno). Flags NÃO são segredo (EXPO_PUBLIC_*).
 * A ferramenta continua TÉCNICA e restrita (FAB/rota dev), NUNCA child-facing.
 */
export const RELEASE_PACK_QA_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true' &&
  process.env.EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA === 'true' &&
  process.env.EXPO_PUBLIC_QA_BUILD === 'true' &&
  (process.env.EXPO_PUBLIC_BUILD_PROFILE === 'preview' ||
    process.env.EXPO_PUBLIC_BUILD_PROFILE === 'preview-criador');

/**
 * CREATOR_QA_MODE_RELEASE_ENABLED — autoriza o **Modo Criador** em build Release de QA
 * interno (B4). É a única porta de entrada do Modo Criador fora de `__DEV__`.
 *
 * ⚠️ QUÍNTUPLO gate — reaproveita as 4 condições de RELEASE_PACK_QA_ENABLED e soma duas
 * exigências próprias, resultando em:
 *   - EXPO_PUBLIC_ENABLE_PACK_SANDBOX      === 'true'   (via RELEASE_PACK_QA_ENABLED)
 *   - EXPO_PUBLIC_ENABLE_RELEASE_PACK_QA   === 'true'   (via RELEASE_PACK_QA_ENABLED)
 *   - EXPO_PUBLIC_QA_BUILD                 === 'true'   (via RELEASE_PACK_QA_ENABLED)
 *   - EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE   === 'true'
 *   - EXPO_PUBLIC_BUILD_PROFILE            === 'preview-criador'  (exato, sem 'preview')
 *
 * Consequências desenhadas de propósito:
 *   - Uma flag isolada NÃO libera nada: EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE sozinha é inerte.
 *   - `preview` (o perfil de packs) continua SEM Modo Criador — o nome do perfil é checado
 *     literalmente e `preview !== preview-criador`.
 *   - `production` e `screenshot` não declaram nenhuma env: fail-closed por ausência.
 *   - Este perfil é de distribuição INTERNA e NÃO deve ser usado para distribuição pública.
 */
export const CREATOR_QA_MODE_RELEASE_ENABLED =
  RELEASE_PACK_QA_ENABLED &&
  process.env.EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE === 'true' &&
  process.env.EXPO_PUBLIC_BUILD_PROFILE === 'preview-criador';

/**
 * COLORIR_60_CREATION_PILOT_ENABLED — piloto do Colorir 60 de "A Criação"
 * (3 atividades semânticas por `activityId`: `light`, `living_world`, `people_and_care`).
 *
 * Introduzida em C60-IMPL-P0 (P0.T7) como literal `false`: enquanto fechada, NENHUMA
 * superfície do Colorir 60 aparece — sem catálogo exposto, sem rota nova, sem entrada de QA.
 * O portão continua sendo `isColoring60PilotAllowed()` = esta flag OU (`__DEV__` com
 * ferramentas internas); o Dev Client NÃO muda de comportamento.
 *
 * ⚠️ [spec 018] O literal virou CERCA DUPLA porque `__DEV__` é false em todo build de release:
 * com o literal, o piloto era inalcançável num APK/IPA — e trocá-lo por `true` ligaria também a
 * LOJA, sem cerca nenhuma. As duas condições precisam bater ao mesmo tempo (conjunção, não flag
 * simples), no mesmo padrão release-safe de RELEASE_PACK_QA_ENABLED / CREATOR_QA_MODE_RELEASE_ENABLED:
 *   - EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT === 'true'
 *   - EXPO_PUBLIC_BUILD_PROFILE           === 'c60-pilot' OU 'preview' (nomes EXATOS)
 *
 * Consequências desenhadas de propósito:
 *   - FAIL-CLOSED POR AUSÊNCIA: env vazio ⇒ `undefined === 'true'` ⇒ false. É o estado padrão.
 *   - UMA VARIÁVEL ISOLADA É INERTE: se EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT vazasse sozinha,
 *     faltaria o perfil; se o perfil vazasse sozinho, faltaria a autorização explícita.
 *   - PRODUÇÃO NUNCA LIGA: o perfil `production` do eas.json não declara NENHUMA das duas —
 *     falha por ausência dupla. `preview-criador` e `screenshot` também não satisfazem a cerca.
 *   - R7: o perfil interno `preview` declara a autorização e é identidade permitida para a prova
 *     release não-DEV de T090/P139; isso não habilita `production` nem ferramentas internas.
 *   - COMPARAÇÃO LITERAL E ESTRITA: 'True', '1', 'C60-Pilot' ou 'c60-pilot ' (com espaço) NÃO abrem.
 *   - O perfil `c60-pilot` é de distribuição INTERNA e NÃO serve para distribuição pública.
 *     Ele também não declara Modo Criador, sandbox de packs nem Release Pack QA — logo
 *     `isInternalToolsEnabled()` é false nele: sem "Administração (dev)", sem Bancada C60.
 *
 * Flags NÃO são segredo (EXPO_PUBLIC_* vai embutida no bundle); a proteção é BUILD-TIME, por
 * ausência de declaração — exatamente como nas demais flags release-safe deste arquivo.
 * Governança: specs 014/015/016/017/018 · DECISIONS.md PL01A-03/PL01G/D-C60-PILOT-ATIVACAO ·
 * docs/PRODUCTION_FLAGS_CHECKLIST.md.
 */
export const COLORIR_60_CREATION_PILOT_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT === 'true' &&
  ['c60-pilot', 'preview'].includes(process.env.EXPO_PUBLIC_BUILD_PROFILE);
