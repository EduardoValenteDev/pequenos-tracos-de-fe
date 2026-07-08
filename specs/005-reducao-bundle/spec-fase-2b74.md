# Bloco 2 · Fase 2B.7.4 · Adapter RevenueCat da entitlementSource

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.4 · **Etapa SDD:** 1 (Specify) · **Portão 1: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `ee92507`.
> **Natureza:** integração de fonte real (RevenueCat) atrás do port `entitlementSource`, **fail-closed**. **Sem** telas/paywall/produtos/compra; **sem** 2C.

## Objetivo
Planejar a implementação do **adapter RevenueCat** que substitui o stub de `entitlementSource.fetchEntitlement()`, lendo o entitlement real do `CustomerInfo` e mapeando-o para o `RawEntitlement` já contratado (2B.7.3) — mantendo **fail-closed** e **sem** tocar telas/UI antes dos portões.

## Diagnóstico (estado técnico)
- `entitlementSource.fetchEntitlement()` é stub (`null`→free). `entitlementService` já persiste/sanitiza/decide via `decideEntitlement`. `getCurrentPlan` delega.
- `react-native-purchases` e `expo-dev-client` **não** instalados. `app.json` tem `plugins` array; **New Architecture** ativa; **EAS** configurado (`projectId`). Fluxo de dev atual = **Expo Go**.

## Decisão de fatiamento (pontos de atenção 3-5)
RevenueCat completo = várias peças; **NÃO misturar**. Fatiamento recomendado, cada fase própria com aprovação:
| Fase | Escopo | Toca UI? |
|---|---|---|
| **2B.7.4 (esta)** | **Adapter**: dependência + config plugin + init + `fetchEntitlement` lê `CustomerInfo`. **Sem** produtos/paywall/compra. | **Não** |
| 2B.7.4b | Produtos nas lojas (App Store Connect / Play Console) + offerings + **tela de assinatura (paywall)** | Sim |
| 2B.7.4c | Compra (`purchasePackage`) + **restore** (`restorePurchases`) | Sim |
| 2B.7.4d | Validação **sandbox** iOS + Android (StoreKit config / License testers) | — |

Esta rodada (planejamento) **não instala nada**; a implementação do adapter (após Portão 3) exigirá **aprovação explícita de dependência + `app.json`**.

## Requisitos / esclarecimentos (20 pontos)

**RP1 — Dependência real ou preparo? (ponto 1)** A 2B.7.4 implementa o **adapter REAL** (dependência instalada), mas **só o adapter** — sem paywall/produtos/compra (fases próprias). A instalação exige aprovação (dependência + app.json).

**RP2 — Pacote e compat (ponto 2, atenção 1).** **`react-native-purchases`** (RevenueCat SDK oficial). **Verificar no momento da instalação** a versão compatível com **Expo SDK 54 / RN 0.81.5 / React 19.1 / New Architecture** (RevenueCat 8.x suporta New Arch; instalar via `npx expo install react-native-purchases`). **Não funciona no Expo Go** (código nativo) → exige **config plugin + Dev Client/EAS Build**. Isso **muda o fluxo de teste no iPhone** (Expo Go → Dev Client), impacto registrado (ponto atenção 2).

**RP3 — Arquivos tocados (ponto 3).** (implementação futura) `package.json` (`react-native-purchases` + `expo-dev-client`), `app.json` (**config plugin** — proibido salvo justificar; **justificado**: obrigatório p/ RevenueCat no Expo → **PARA para aprovação**), `src/services/entitlementSource.js` (adapter), `src/services/entitlementService.js` (init com API key, se necessário), `scripts/smoke.js`. **Nenhuma tela.**

**RP4 — API keys (pontos 4, 5, 8).** RevenueCat usa **public SDK keys** (iOS e Android) — **públicas por design**, embarcadas no app; **não são segredo**. Ficam em env `EXPO_PUBLIC_REVENUECAT_IOS_KEY`/`_ANDROID_KEY` (padrão do projeto). O **secret key** (validação server-side) **NUNCA** entra no app — vive no RevenueCat dashboard/backend. Nenhum segredo privado no app.

**RP5 — Mapeamento `CustomerInfo` → `RawEntitlement` (ponto 6).**
```
const e = customerInfo.entitlements.active['premium'];   // entitlement identifier
rcActive            = e != null;                          // ativo (inclui grace do provedor)
rcCancelledButPaid  = e != null && e.willRenew === false; // cancelado, ainda no período pago
expiresAt           = e ? Date.parse(e.expirationDate) : null;
serverNow           = Date.parse(customerInfo.requestDate); // relógio do SERVIDOR → lastValidatedAt
// maxSeenDeviceTimestamp: NÃO vem do RC — o service atualiza (2B.7.3).
```
Retorna `RawEntitlement` (ou `null` se sem entitlement/erro). O `entitlementService.sanitize` + `decideEntitlement` (2B.7.1/2B.7.3) fazem a decisão final.

**RP6 — Estados (pontos 7-13).**
| Estado | Mapeamento |
|---|---|
| **ativa** | `rcActive:true` → policy `premium` (se janela válida) |
| **cancelada mas paga** | `rcActive:true, rcCancelledButPaid:true, expiresAt` futuro → `premium` até `expiresAt` |
| **expirada** | `e==null` (ou `now>=expiresAt`) → `free` |
| **restore purchase** | `getCustomerInfo()` pós-restore → mesmo mapeamento (restore em si é 2B.7.4c) |
| **erro de rede** | try/catch → `null` → mantém cache/`free` (conservador) |
| **RevenueCat indisponível** | try/catch → `null` → `free` |
| **offline** | usa último cache dentro da janela de 7 dias (2B.7.3); sem cache → `free` |

**RP7 — Anti-premium-acidental (pontos 14, 15).** **Nenhum booleano solto libera premium.** O adapter só monta `RawEntitlement`; `sanitize` descarta campos estranhos; **`decideEntitlement` é o único que decide** (janela/relógio/expiração). `rcActive:true` só vira premium com `expiresAt` válido+futuro + `lastValidatedAt` recente (2B.7.1).

**RP8 — App abre mesmo se RC falhar (ponto 18, regra 7).** `fetchEntitlement` do adapter é **try/catch → null**, nunca lança. `initEntitlement` fire-and-forget (2B.7.3). Falha de init/config/rede → `free`, app abre normal.

**RP9 — Testes sem compra real (pontos 16, 17, atenção 3).** (a) **Adapter isolado no smoke:** `CustomerInfo` mockado (ativo/cancelado/expirado/malformado/erro) → mapeamento correto + fail-closed, sem loja. (b) **Sandbox** (fase 2B.7.4d): iOS via **StoreKit Configuration file / sandbox tester**; Android via **License testers / closed testing** — requer produtos (2B.7.4b) e Dev Client/EAS.

## Provas exigidas
- **Sem mudança visual acidental (ponto 19):** o adapter **não** toca telas; sem produtos/compra, ninguém tem entitlement → `getCurrentPlan()==='free'` (idêntico). Com entitlement ativo (sandbox), premium é liberado **via `decideEntitlement`** (esperado, não acidental). Smoke + Dev Client device.
- **2C não iniciada (ponto 20):** `assetBundlePatterns` ausente; requires premium intactos; nada de bundle.

## Arquivos
| Pode tocar (impl. futura) | Proibido |
|---|---|
| `src/services/entitlementSource.js` (adapter) | telas/mapa/histórias/perfil/progresso/**paywall**/packs/downloads |
| `src/services/entitlementService.js` (init/API key, se preciso) | `entitlementPolicy`, `accessControl`, `contentResolver`, `ProgressContext` |
| `package.json` (`react-native-purchases`+`expo-dev-client` — **aprovação**) | assets, requires, `assetBundlePatterns`, 2C |
| `app.json` (**config plugin** — justificar + **parar**) | segredo/secret key (jamais no app) |
| `scripts/smoke.js` | — |

## Fora de escopo
Tela de assinatura/paywall (2B.7.4b); produtos nas lojas (2B.7.4b); compra/restore (2B.7.4c); validação sandbox (2B.7.4d); 2C; liberar premium sem `decideEntitlement`; secret key no app.

## Critérios de aceite (para a futura implementação do adapter)
1. `react-native-purchases` compatível com SDK 54/RN 0.81/New Arch, instalado via `expo install` (dependência aprovada).
2. Config plugin no `app.json` (aprovado); Dev Client/EAS documentado; Expo Go descontinuado para este fluxo.
3. `fetchEntitlement` lê `CustomerInfo` → `RawEntitlement` (mapeamento RP5); **null** em erro; **nunca lança**.
4. `rcActive`/`rcCancelledButPaid`/`expiresAt`/`serverNow` mapeados; `maxSeenDeviceTimestamp` pelo service.
5. Só `public SDK keys` (env `EXPO_PUBLIC_`); nenhum secret no app.
6. Nenhum premium sem `decideEntitlement`; erro/rede/offline/indisponível → conservador; app abre sempre.
7. Adapter testado no smoke com `CustomerInfo` mockado (estados RP6).
8. Sem tela/paywall/produto/compra; `entitlementPolicy`/`accessControl` intocados; 2C não iniciada; `expo-doctor` verde.
