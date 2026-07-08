# M1 · Higiene de release e ferramentas internas do Eduardo

> **Feature:** `006-m1-higiene-release` · **Etapa SDD:** 1 (Specify) · **Portão 1: pendente.**
> **Base:** Fase 2B.7.4 publicada (`0b11d72`, branch `content-integrate-coloring-3` sincronizada). Roadmap [[M0–M10]] — este é o **M1**.
> **Natureza:** governança + UI de administração + smoke (áreas sensíveis: acesso/flags). **Não** toca conteúdo, assets, RevenueCat real, R2, paywall.

## 1. Problema a resolver
As ferramentas internas de dev/QA (**banner "Modo Criador Ativo"**, **FAB "packs"**, seção de teste na **Área dos Pais**) apareceram em prints do Eduardo. A auditoria M1 confirmou que **já são gated por build-time flag** e **não** aparecem em produção sem flags — os prints vieram de **development build** (`__DEV__` true). O problema real **não** é vazamento em produção, e sim: (a) **falta de consolidação** (ferramentas espalhadas), (b) **falta de governança escrita** da matriz de visibilidade, (c) **ausência de smoke anti-vazamento** que trave a regra, e (d) **processo de screenshot** que pode usar build dev por engano.

## 2. Objetivo do M1
Separar de forma **clara, governada e à prova de regressão** a experiência pública do usuário final das ferramentas internas do Eduardo, **sem excluir** as ferramentas: consolidá-las numa **seção "Administração (dev)" na Área dos Pais**, **travar por smoke** que release público não as exibe, e **formalizar** a matriz de visibilidade e o processo de screenshot.

## 3. Escopo permitido
- **Consolidar** as ferramentas internas numa seção única na Área dos Pais (reposicionar, mantendo os gates).
- **Revisar/centralizar** os gates (sem enfraquecer) — idealmente uma fonte única "ferramentas internas habilitadas?".
- **Smoke checks** anti-vazamento.
- **Governança/docs:** atualizar `PRODUCTION_FLAGS_CHECKLIST.md` com a matriz e o processo de screenshot.
- **Verificar** `eas.json` (perfil `production` sem flags QA) — sem alterar comportamento salvo justificativa.

## 4. Escopo proibido
- ❌ **Excluir** qualquer ferramenta interna sem política de acesso definida.
- ❌ Introduzir **autenticação de admin** dentro do app final (local-first; a proteção é build-time).
- ❌ Enfraquecer gates existentes (`creatorQaMode`, `packSandboxDevService`, `SHOW_TEST_TOOLS`, `RELEASE_PACK_QA_ENABLED`).
- ❌ Tocar conteúdo, assets, RevenueCat real, R2, paywall/compra/restore/produtos.
- ❌ Iniciar M2–M10.

## 5. Matriz de visibilidade por ambiente
| Ambiente | Gate | Ferramentas internas |
|---|---|---|
| **development build** (Dev Client / `__DEV__` true) | `__DEV__` | **TODAS ON** (banner, FAB, Área dos Pais dev, Modo Criador/premium simulado) |
| **preview / build interno QA** (`eas.json preview`) | flags `EXPO_PUBLIC_*` | **ON seletivo por flag** — hoje packs QA (quádruplo gate) ON; Modo Criador **só se** `EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE` for setado (hoje **não** está) → **decisão Portão 1** |
| **production release** (`eas.json production`, **sem flags**) | nenhuma | **TODAS OFF** (banner/FAB/seção dev invisíveis e inertes; sem simulação premium) |

## 6. Ferramentas internas a PRESERVAR (do Eduardo)
| Ferramenta | Onde hoje | Gate atual |
|---|---|---|
| **Modo Criador** (simula Plano Família local) | toggle na Área dos Pais + `CreatorModeBanner` global | `__DEV__ \|\| EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE` |
| **Packs** (seed/download/diagnose/verify `david_goliath`) | `PackSandboxDevScreen` + FAB | `(__DEV__ && ENABLE_PACK_SANDBOX) \|\| RELEASE_PACK_QA_ENABLED` |
| **Reset de guias/tour** | Área dos Pais (`resetAllGuides`/`resetBeniAppTour`/`requestInitialTour`) | `SHOW_TEST_TOOLS` |
| **Rever onboarding/apresentação** | Área dos Pais (`resetOnboardingForQa`) | `SHOW_TEST_TOOLS` |
| **Testar desenhos** | `ColoringQaScreen` | a confirmar entrada/gate |
| **Simular Plano Família** | = Modo Criador (via `accessControl.isPremiumUser`) | idem Modo Criador |
| **Reset/inspeção de progresso** | "Gerenciar dados → Apagar" (`resetProgress`) — **hoje é feature PÚBLICA do responsável** | público (confirmação "APAGAR") |
| **Testes internos necessários** | Área dos Pais / telas dev | `SHOW_TEST_TOOLS` |

> ⚠️ "Reset de progresso" é **feature pública** (gerenciar dados) — **não** virar dev-only sem decisão (Portão 1).

## 7. Regra de produto
**O usuário final nunca vê nem acessa ferramentas internas.** Em release público não existe banner Modo Criador, FAB packs, seção dev na Área dos Pais nem simulação premium.

## 8. Regra de segurança
Como o app é **local-first e sem autenticação de admin real**, **não** publicar ferramentas dev no release confiando em "segredo". A proteção é **build-time** (perfil/flags): a ferramenta só existe no binário quando o build é dev/interno; no `production` ela **não é compilada como acessível**.

## 9. Estratégia — consolidar na Área dos Pais
Criar uma **seção "Administração (dev)"** (recolhível, ao final da Área dos Pais) que **agrupa** Modo Criador, packs, reset de guias, rever onboarding, testar desenhos e demais testes — toda a seção sob **um único gate** (ex.: `isInternalToolsEnabled()` = `__DEV__ || flags`). Mantém os gates específicos internos de cada ferramenta como defesa em profundidade.

## 10. Estratégia — remover overlays das telas públicas (produção/screenshot)
- `CreatorModeBanner` e FAB packs **já** retornam null / não renderizam sem gate. M1 **garante e trava** isso por smoke, e **verifica** que o perfil `production` não liga nenhuma flag.
- **Screenshots oficiais** devem sair de **build production-like (sem flags)** — documentar como processo; opcionalmente um perfil `eas.json` dedicado a screenshots.

## 11. Estratégia — teste premium sem liberar premium real em produção
**Preservar o Modo Criador** como está: override de permissão **local** (`isCreatorQaModeEnabled` → `accessControl.isPremiumUser`), que **nunca** grava plano, marca compra ou toca RevenueCat, e é **sempre false em produção sem flag**. M1 apenas **reposiciona** o toggle na seção admin.

## 12. Smoke checks anti-vazamento (a criar)
1. `CreatorModeBanner` → null quando `isCreatorQaModeAllowed()` falso.
2. `isPackSandboxDevEnabled()` falso sem `__DEV__`/flags → FAB e rota packs off.
3. `SHOW_TEST_TOOLS` (ou o novo `isInternalToolsEnabled`) falso sem `__DEV__`/flag → seção dev não renderiza.
4. `eas.json` `production` **sem** `ENABLE_PACK_SANDBOX`/`ENABLE_CREATOR_QA_MODE`/`ENABLE_RELEASE_PACK_QA`/`QA_BUILD`.
5. Modo Criador **nunca** grava `plan:'premium'` (só override em memória).
6. `RELEASE_PACK_QA_ENABLED` exige os **4** gates (não afrouxar).

## 13. Testes manuais (Dev Client + production-like)
- **production-like (sem flags):** sem banner, sem FAB, sem seção dev → **screenshots limpos**; premium não simulável.
- **development build:** Eduardo acessa todas as ferramentas; Modo Criador liga/desliga premium visualmente sem resíduo; packs/reset/onboarding/desenhos operam.
- Confirmar que tour/reset **não** afetam progresso real do usuário.

## 14. Critério de ENTRADA (para implementação futura)
1. **Portão 1** aprovado (decisões da §17 travadas).
2. 2B.7.4 publicada e branch sincronizada ✅.
3. Working tree limpo.
4. Validação sempre por **Dev Client** (branch não roda em Expo Go).

## 15. Critério de SAÍDA do M1
- Ferramentas internas **consolidadas** numa seção admin na Área dos Pais, **preservadas** para dev/interno.
- **Release público limpo** (sem banner/FAB/seção dev/simulação premium), **comprovado em build production-like** + smoke.
- **Smoke anti-vazamento** verde; matriz de visibilidade **documentada** (`PRODUCTION_FLAGS_CHECKLIST.md`).
- **Processo de screenshot** definido (build sem flags).
- Gates verdes (`smoke`, `expo-doctor`); validação device; **commits atômicos** (governança / código / — sem assets).

## 16. Riscos se M1 não for feito
- Screenshots/loja com banner/FAB dev (má impressão, risco de review).
- Ferramentas espalhadas → difícil manutenção e risco de, num futuro build, um gate ser afrouxado sem trava.
- Sem smoke, uma regressão poderia expor Modo Criador (premium grátis) em produção.
- Processo de screenshot ambíguo → prints de dev por engano.

## 17. Questões para o Portão 1 (decisão do Eduardo) — ver `clarify-m1.md`
Resumo: (a) preview mostra Modo Criador? (b) escopo exato da seção admin; (c) "reset de progresso" fica público ou entra na seção dev; (d) processo/perfil de screenshot; (e) unificar gates numa fonte única; (f) destino do "Modo Igreja"; (g) `ColoringQaScreen` entrada/gate.
