# Analyze — M1 · Higiene de release e ferramentas internas

> **Etapa SDD 6.** Consistência spec↔clarify↔checklist↔plan↔tasks + verificação dos 10 pontos do Portão 2. **Nenhum código escrito, nada staged.** **Portão 3: pendente.**

## Consistência spec↔plan↔tasks
| Eixo | Verdato |
|---|---|
| Decisões Portão 1/2 refletidas (Q1–Q7 + FAB/banner/screenshot) | ✅ tasks T1–T9 |
| Nenhuma exclusão de ferramenta (só reposição) | ✅ T2 (mover, não recriar) |
| Sem tocar accessControl/entitlement/creatorQaMode(lógica)/RevenueCat/R2/paywall/2C | ✅ spec §4, plan §12 |
| "Apagar progresso" público | ✅ T2, T7 |
| Modo Igreja fora | ✅ plan §12 |
**Sem divergências.**

## Verificação dos 10 pontos (Portão 2)

| # | Ponto | Verdato |
|---|---|---|
| A1 | **Tasks não misturam código/governança/config** | ✅ Lanes explícitas: `[código]` T1/T2/T3/T4/T5/T7 · `[config]` T6 (eas.json) · `[governança]` T9 (docs). Commits separados por lane; sem assets. |
| A2 | **Production continua limpo** | ✅ `production` sem flags → `isInternalToolsEnabled()` false → seção/rotas/FAB/banner off; premium não simulável. Smoke T7 trava. |
| A3 | **Development mantém acesso do Eduardo** | ✅ `isInternalToolsEnabled()` inclui `__DEV__` → seção admin + todas as ferramentas acessíveis; `ColoringQa` via seção. |
| A4 | **Preview/QA só liga por flags explícitas** | ✅ Preview: `isPackSandboxDevEnabled` true (quádruplo gate) → seção admin visível **para packs**; **Modo Criador off** (sem `EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE`) — defesa em profundidade por-ferramenta. |
| A5 | **Modo Criador não vaza para release** | ✅ `isCreatorQaModeAllowed()` = `__DEV__ \|\| flag`; produção/preview/screenshot sem a flag → false; nunca grava plano/compra. Smoke T7. |
| A6 | **Packs não aparecem em telas públicas** | ✅ FAB global **removido** (T3); acesso só na seção admin gated; rota `PackSandboxDev` gated. |
| A7 | **`ColoringQa` não fica acessível publicamente** | ✅ Rota gated por `isInternalToolsEnabled()` (T4); entrada só pela seção admin; sem navegação pública. |
| A8 | **Screenshots protegidos de ferramentas internas** | ✅ Perfil `screenshot` limpo como production (T6); regra "nunca de dev build" documentada (T9); smoke confirma perfis sem flags. |
| A9 | **Nenhum bloco M2–M10 iniciado** | ✅ Escopo restrito a higiene/consolidação; sem conteúdo/assets/2C/entitlement/paywall. |
| A10 | **Escopo pequeno para impl. segura** | ✅ Mudança **aditiva** (novo gate + nova seção + remover 1 FAB + gatear 1 rota + smoke + 1 perfil eas + 1 doc). Sem refatorar acesso; sem risco em áreas protegidas. |

## Checks de smoke finais (T7) — o que provar
1. `isInternalToolsEnabled()` **false** sem `__DEV__`/flags (simular env de produção).
2. `CreatorModeBanner` → null quando `isCreatorQaModeAllowed()` false.
3. FAB packs **ausente** do `AppNavigator` (não há mais overlay global de packs).
4. Rotas `ColoringQa` e `PackSandboxDev` registradas **só** sob gate.
5. Seção "Administração (dev)" **não renderiza** sem gate.
6. `eas.json`: `production` **e** `screenshot` **sem** `ENABLE_PACK_SANDBOX`/`_CREATOR_QA_MODE`/`_ENABLE_RELEASE_PACK_QA`/`_QA_BUILD`.
7. Modo Criador **nunca** grava `plan:'premium'` (só override em memória — regressão de `accessControl`/`creatorQaMode` intactos).
8. `RELEASE_PACK_QA_ENABLED` exige os **4** gates (não afrouxado).
9. "Apagar progresso" **permanece** na seção pública (fora de "Administração (dev)").

## Riscos residuais / mitigação
| Risco | Mitigação |
|---|---|
| Afrouxar gate ao consolidar | Gates específicos preservados + smoke 1/7/8 |
| Quebrar seção pública da Área dos Pais | Mudança aditiva; não altera seções existentes; T8 device |
| `eas.json` `screenshot` divergir de production | T6 espelha visibilidade; smoke 6 |
| Banner sumir em dev por engano | T5 preserva `isCreatorQaModeAllowed` (inclui `__DEV__`) |
| Remover FAB quebrar acesso | Acesso preservado na seção admin (T2) |

## Conclusão
Consistência **OK**; 10 pontos **verdes**; escopo **pequeno e aditivo**, sem tocar áreas protegidas. Pronto para **Portão 3**. **Nada implementado, nada staged.**
