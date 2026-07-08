# Plan — M1 · Higiene de release e ferramentas internas

> **Etapa SDD 4.** Abordagem técnica conforme a Constituição e as decisões do **Portão 1**. **Portão 2: pendente.** **Não escreve código.**
> Decisões Portão 1: Q1 Modo Criador **só em development**; Q2 seção admin = Modo Criador+packs+reset guias+rever onboarding+testar desenhos+build info(+inspeção de estado se existir); Q3 "Apagar progresso" **público**; Q4 screenshots nunca de dev build; Q5 **fonte única `isInternalToolsEnabled()`** + gates específicos como defesa; Q6 Modo Igreja **fora**; Q7 `ColoringQa` na admin sob gate único, **sem rota pública**.

## Constitution Check
- **Fonte única de acesso intocada:** M1 **não** altera `accessControl`/entitlement/`creatorQaMode` (lógica). Só **consolida UI** + gate de visibilidade + smoke + docs. ✅
- **Áreas protegidas:** sem tocar conteúdo/assets/paywall/RevenueCat/R2. ✅
- **Sem exclusão** de ferramentas; **preservadas** e reposicionadas. ✅
- **Proteção build-time** (sem auth admin no app final). ✅
- Commits atômicos separados (código × governança; sem assets). ✅

## 1. Arquivos prováveis
| Arquivo | Papel |
|---|---|
| `src/config/internalTools.js` *(novo)* **ou** `src/config/featureFlags.js` | Fonte única **`isInternalToolsEnabled()`** (compõe `__DEV__` + `isCreatorQaModeAllowed()` + `isPackSandboxDevEnabled()`) |
| `src/screens/ParentAreaScreen.js` | Nova `AccordionSection` **"Administração (dev)"** consolidando as ferramentas; "Apagar progresso" segue na seção pública |
| `src/navigation/AppNavigator.js` | **Gate da rota `ColoringQa`** (como `PackSandboxDev`); **remover o FAB packs global** (acesso migra p/ a seção admin); banner Modo Criador permanece (já gated) |
| `scripts/smoke.js` | Checks anti-vazamento |
| `docs/PRODUCTION_FLAGS_CHECKLIST.md` | Matriz de visibilidade + **processo de screenshot** (governança, commit separado) |
| `eas.json` | *(verificação)* `production` sem flags; **Q4:** decidir criar perfil `screenshot` limpo (production-like) |

## 2. Mudanças planejadas por área
- **Gates:** criar `isInternalToolsEnabled()` como **gate da SEÇÃO** admin; cada ferramenta mantém seu gate específico (Modo Criador, packs) internamente (defesa em profundidade).
- **Área dos Pais:** mover para "Administração (dev)": toggle Modo Criador, entrada de packs, reset de guias, rever onboarding, testar desenhos (`ColoringQa`), build info, e inspeção de estado se já existir. **Não** mover "Apagar progresso" (público, confirmação forte).
- **Navegação:** registrar `ColoringQa` **só** sob `isInternalToolsEnabled()` (hoje é registro incondicional); **remover o overlay FAB packs** (fica a entrada na seção admin); **banner Modo Criador mantido** (útil como aviso de premium simulado, já some fora de dev).
- **Governança:** documentar a matriz + o processo de screenshot.

## 3. Estratégia de gates
```
isInternalToolsEnabled() = __DEV__ || isCreatorQaModeAllowed() || isPackSandboxDevEnabled()
```
- **Gate da seção** admin e do registro de rotas dev (`ColoringQa`, `PackSandboxDev`).
- **Cada ferramenta** conserva seu gate: Modo Criador (`isCreatorQaModeAllowed`), packs (`isPackSandboxDevEnabled` — quádruplo gate release-safe).
- **Produção sem flags** → `isInternalToolsEnabled()` **false** → seção, rotas dev, FAB e banner **todos off**.

## 4. Estratégia — seção "Administração (dev)" na Área dos Pais
- Nova `AccordionSection title="Administração (dev)"`, **`defaultOpen={false}`**, renderizada **só** quando `isInternalToolsEnabled()`.
- Agrupa os botões/toggles hoje espalhados sob `SHOW_TEST_TOOLS` + a entrada de `ColoringQa` (hoje solta, linha 968) + entrada de packs.
- Posicionada ao **final** da tela (após as seções públicas), com rótulo claro de que é ferramenta interna.
- **Não** cria feature nova grande — só reposiciona (inspeção de estado só se já existir).

## 5. Estratégia — esconder FAB packs e banner fora de development
- **FAB packs (overlay global):** **remover** o overlay; acesso a packs passa a ser **só** pela seção admin (menos poluição mesmo em dev; nada de FAB flutuante em screenshot).
- **Banner "Modo Criador Ativo":** **manter** (já retorna null sem gate) — é aviso útil de que o premium está simulado; garantido **off** em produção por smoke.
- Ambos **comprovados null em produção** via smoke.

## 6. Estratégia — `ColoringQa` sem rota pública
- Envolver o `Stack.Screen name="ColoringQa"` em **`{isInternalToolsEnabled() && (...)}`** (espelha `PackSandboxDev`).
- Entrada **só** pela seção "Administração (dev)"; nenhuma navegação pública para `ColoringQa`.

## 7. Estratégia — screenshots production-like limpos
- **Regra documentada:** screenshots oficiais **nunca** de development build. Saem de **`production`** (sem flags) ou de um perfil **`screenshot`** limpo (sem `ENABLE_PACK_SANDBOX`/`_CREATOR_QA_MODE`/`_RELEASE_PACK_QA`/`_QA_BUILD`).
- **Q4:** decidir no Plan/impl se cria o perfil `screenshot` no `eas.json` (production-like, instalável) — se criado, deve ser **tão limpo quanto production**.
- Registrar o processo em `PRODUCTION_FLAGS_CHECKLIST.md`.

## 8. Smoke checks planejados
1. `isInternalToolsEnabled()` **false** sem `__DEV__`/flags → não expõe seção/rotas.
2. `CreatorModeBanner` → null quando `isCreatorQaModeAllowed()` false.
3. Rota/FAB `PackSandboxDev` e rota `ColoringQa` **off** sem gate.
4. Seção "Administração (dev)" **não renderiza** sem gate.
5. `eas.json` `production` **sem** as 4 flags QA; se existir perfil `screenshot`, idem limpo.
6. Modo Criador **nunca** grava `plan:'premium'` (só override em memória).
7. `RELEASE_PACK_QA_ENABLED` exige os **4** gates.
8. "Apagar progresso" **permanece na seção pública** (não migrou para dev).

## 9. Testes manuais planejados
- **production-like (sem flags):** sem banner, sem FAB, sem seção admin, premium **não** simulável → **screenshots limpos**.
- **development build:** Eduardo acessa tudo pela seção "Administração (dev)"; Modo Criador liga/desliga premium sem resíduo; packs/reset/onboarding/desenhos operam; `ColoringQa` só pela seção.
- Confirmar que reset de guias/onboarding/tour **não** afeta progresso real.

## 10. Riscos e mitigação
| Risco | Mitigação |
|---|---|
| Afrouxar um gate ao consolidar | Manter gates específicos + smoke (itens 1–7) |
| Quebrar seções públicas da Área dos Pais | Mudança aditiva (nova seção) + testes; não mexer nas seções existentes |
| Remover FAB quebrar acesso do Eduardo | Acesso preservado na seção admin |
| Gate esconder `ColoringQa` em dev | Gate inclui `__DEV__` → sempre disponível em dev |
| Screenshot de dev por engano | Regra documentada + smoke do perfil |

## 11. Sequência de implementação proposta (para as Tasks)
1. **Código — gate único:** `isInternalToolsEnabled()` (fonte única).
2. **Código — Área dos Pais:** seção "Administração (dev)" consolidando as ferramentas; manter "Apagar progresso" público.
3. **Código — navegação:** gate da rota `ColoringQa`; remover FAB packs global; banner mantido.
4. **Código — smoke:** checks anti-vazamento.
5. **Governança (commit separado):** `PRODUCTION_FLAGS_CHECKLIST.md` (matriz + screenshot); decisão do perfil `screenshot` no `eas.json`.
6. **Gates + validação device:** `smoke`/`expo-doctor` verdes; device dev + production-like.
> **Commits:** 1–4 (código) e 5 (governança) **separados**; **sem assets**.

## 12. Fora do M1 (explícito)
- **Modo Igreja** (Q6) — feature de negócio adiada, bloco próprio.
- **Perfil interno dedicado para premium fora do dev** (Q1) — futuro, explícito, nunca no preview/production genérico.
- Qualquer mudança em **`accessControl`/entitlement/`creatorQaMode` (lógica)**, RevenueCat real, paywall/compra/restore/produtos, R2.
- **Redesenho do "Apagar progresso"** (segue público como está).
- Conteúdo, assets, M2–M10.

**Portão 2 — aguardando aprovação do Plan.** Após aprovação: Tasks (SDD 5) → Analyze (SDD 6) → Portão 3.
