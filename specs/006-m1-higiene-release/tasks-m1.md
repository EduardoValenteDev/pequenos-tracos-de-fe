# Tasks — M1 · Higiene de release e ferramentas internas

> **Etapa SDD 5.** Micro-tasks atômicas (executadas **só após Portão 3**). **Nada é executado agora.**
> **Lanes de commit:** `[código]` · `[config]` (eas.json) · `[governança]` (docs) — **nunca** misturar lanes num mesmo commit; **sem assets**.
> Decisões Portão 2: remover FAB packs global; banner Modo Criador só em development; **perfil `screenshot` dedicado limpo como production**; gate único `isInternalToolsEnabled()`; "Apagar progresso" público; `ColoringQa` sob gate, sem rota pública; Modo Igreja fora.

## T1 — Gate único `isInternalToolsEnabled()` `[código]`
Criar fonte única (novo `src/config/internalTools.js` ou em `featureFlags.js`):
```
isInternalToolsEnabled() = __DEV__ || isCreatorQaModeAllowed() || isPackSandboxDevEnabled()
```
Compõe os gates existentes; **não** os altera. Usado como gate da seção admin e do registro de rotas internas.
_Aceite:_ produção sem flags → `false`; development → `true`; preview → `true` **só** por `isPackSandboxDevEnabled` (Modo Criador segue gated à parte). Sem mudança em `creatorQaMode`/`packSandboxDevService`/`accessControl`.

## T2 — Seção "Administração (dev)" na Área dos Pais `[código]`
Nova `AccordionSection title="Administração (dev)"`, **`defaultOpen={false}`**, ao **final** da tela, renderizada **só** sob `isInternalToolsEnabled()`. Consolidar (mover, não recriar): toggle **Modo Criador**, entrada **packs** (`PackSandboxDev`), **reset de guias**, **rever onboarding**, **testar desenhos** (`ColoringQa`), **build info**, e inspeção de estado se já existir. Cada item mantém seu gate específico interno.
_Aceite:_ "Apagar progresso" **permanece** na seção pública (confirmação "APAGAR"); nenhuma ferramenta removida; seções públicas existentes intactas; seção não aparece sem gate.

## T3 — Remoção do FAB packs global `[código]`
Remover o overlay `TouchableOpacity` FAB de packs em `AppNavigator.js` (hoje ~420-425). Acesso a packs passa a ser **só** pela seção admin (T2).
_Aceite:_ nenhum FAB flutuante em qualquer tela (dev ou produção); acesso a packs preservado via seção admin; rota `PackSandboxDev` segue gated.

## T4 — Gate da rota `ColoringQa` (sem rota pública) `[código]`
Envolver o `Stack.Screen name="ColoringQa"` (hoje registro incondicional, ~331) em `{isInternalToolsEnabled() && (...)}` — espelhando `PackSandboxDev`. Entrada só pela seção admin.
_Aceite:_ sem gate, rota `ColoringQa` **não** registrada; nenhuma navegação pública para `ColoringQa`; em dev, acessível pela seção admin.

## T5 — Banner "Modo Criador" só em development `[código, verificação]`
`CreatorModeBanner` já renderiza só sob `isCreatorQaModeAllowed() && enabled` → some em produção/preview/screenshot (sem a flag). **Verificar** e **travar por smoke**; **sem** mudança de código salvo se a verificação achar gap.
_Aceite:_ banner visível **só** em development (ou build com `EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE`); nunca em production/screenshot.

## T6 — Perfil `screenshot` production-like `[config]`
Adicionar ao `eas.json` um perfil **`screenshot`** limpo, **espelhando a visibilidade de `production`**: **sem** `EXPO_PUBLIC_ENABLE_PACK_SANDBOX`/`_CREATOR_QA_MODE`/`_ENABLE_RELEASE_PACK_QA`/`_QA_BUILD`. Não mexe em loja/submissão.
_Aceite:_ perfil `screenshot` sem nenhuma flag QA; produção intocada; `expo-doctor` verde. **Commit `[config]` separado** do código.

## T7 — Smoke checks anti-vazamento `[código]`
Bloco `── M1 ──` em `scripts/smoke.js` (ver Analyze §checks): gate único off sem flags; banner/FAB/rotas/seção off em produção; `eas.json` `production` e `screenshot` sem flags QA; Modo Criador não grava `plan:'premium'`; `RELEASE_PACK_QA_ENABLED` exige 4 gates; "Apagar progresso" fora da seção dev.
_Aceite:_ `npm run smoke` verde com os novos checks.

## T8 — Testes manuais (Dev Client + production-like) `[validação, não-commit]`
- **production-like/`screenshot` (sem flags):** sem banner, sem FAB, sem seção admin, premium **não** simulável → **screenshots limpos**.
- **development:** Eduardo acessa tudo pela seção admin; Modo Criador liga/desliga premium sem resíduo; packs/reset/onboarding/`ColoringQa` operam.
- Confirmar reset de guias/onboarding **não** afeta progresso real.

## T9 — Governança `[governança]`
Atualizar `docs/PRODUCTION_FLAGS_CHECKLIST.md`: **matriz de visibilidade** (dev/preview/production/screenshot) + **processo de screenshot** (nunca de dev build; usar `production`/`screenshot`).
_Aceite:_ doc reflete o comportamento implementado. **Commit `[governança]` separado.**

## T10 — Gates + relatório `[validação]`
`npm run smoke` + `npx expo-doctor` verdes; `git diff --check`; relatório PT-BR com estado dos arquivos. **Sem push sem autorização.**

## Dependências e commits
- **Ordem:** T1 → T2 → (T3, T4, T5) → T7 → T6 → T9 → T8/T10.
- **Commits atômicos por lane:** `[código]` T1 · T2 · (T3+T4+T5 juntos, mesma área AppNavigator/UI) · T7 · | `[config]` T6 · | `[governança]` T9. Nunca misturar lanes.
