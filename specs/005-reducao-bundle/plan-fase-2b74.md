# Plan — Bloco 2 · Fase 2B.7.4 · Adapter RevenueCat

> **Etapa SDD 4.** Abordagem técnica/arquitetural do adapter, conforme a Constituição. **Portão 2: pendente.**
> **Não escreve código.** A implementação só começa após Portão 2 (Plan) + Portão 3 (Tasks/Analyze), **e** aprovação explícita de **dependência** e **`app.json`**.

## Constitution Check
- **Fonte única de acesso:** o adapter alimenta `entitlementSource`→`entitlementService`; `accessControl.getCurrentPlan` continua sendo o único ponto de leitura de plano. ✅
- **Fail-closed:** `decideEntitlement` (2B.7.1) permanece o único juiz; adapter só produz dados. ✅
- **Áreas sensíveis (paywall/progresso/accessControl):** intocadas nesta fase. ✅
- **Dependência nova:** exige aprovação (regra do projeto) — **parada explícita** no Plan. ✅
- **Sem push/commit** sem autorização; `git add` seletivo. ✅

## Arquitetura do adapter

```
[RevenueCat SDK]  Purchases.getCustomerInfo()
        │  CustomerInfo
        ▼
entitlementSource.fetchEntitlement()   ← ADAPTER (esta fase)
        │  RawEntitlement | null   (try/catch → null; nunca lança)
        ▼
entitlementService.sanitize + saveEntitlement + decideEntitlement   (2B.7.1/2B.7.3, intactos)
        │  'premium' | 'free'
        ▼
accessControl.getCurrentPlan()  →  telas (intactas)
```

**Init (C9) — decisão FINAL (aprovada por Eduardo):** `Purchases.configure({ apiKey })` vive **NO ADAPTER** como `configureRevenueCat()` **lazy + idempotente**, acionado por `fetchEntitlement()` na revalidação. Opções consideradas:
- (A) dentro de `initEntitlement()` no service — porém faria o **service importar/conhecer** RevenueCat.
- (B) módulo próprio `revenueCatClient.js` chamado no App.js — toca App.js.
- **(C) ESCOLHIDA — dentro do adapter `entitlementSource` (lazy):** RevenueCat fica **100% isolado no adapter**; o service **não** conhece o SDK e fica **sem mudança executável**; App.js **intocado** (feedback do Eduardo em 2B.7.2). O boot/refresh da 2B.7.3 aciona `fetchEntitlement()`→`configureRevenueCat()` sob demanda. `configure` idempotente (guard) e não-bloqueante; falha/sem chave → `false` → `null` → `free`.

**Mapeamento (RP5)** vive **só** no adapter (`entitlementSource.js`); o serviço não conhece `CustomerInfo`. Chave do entitlement RevenueCat: constante `PREMIUM_ENTITLEMENT_ID = 'premium'` (a confirmar no dashboard na 2B.7.4b; adapter usa a constante).

## Dependências (parada para aprovação — regra 9)
| Pacote | Papel | Instalação | Aprovação |
|---|---|---|---|
| `react-native-purchases` | SDK RevenueCat (nativo) | `npx expo install react-native-purchases` (resolve versão p/ SDK 54) | **necessária** |
| `expo-dev-client` | rodar build com código nativo em dev (substitui Expo Go) | `npx expo install expo-dev-client` | **necessária** |

Alternativa a `expo-dev-client`: usar **EAS dev build** sem a lib. Decisão operacional no momento da instalação (ambas exigem build customizado; Expo Go deixa de servir para este fluxo).

## `app.json` (parada para aprovação — proibido salvo justificar)
Adicionar `"react-native-purchases"` ao array `plugins` (config plugin). **Justificativa:** RevenueCat requer autolink nativo via config plugin no fluxo Expo; sem ele, o SDK não linka. **Mudança mínima:** 1 entrada no array `plugins` existente; nada mais em `app.json`. → **O Implement para aqui e pede aprovação do diff de `app.json` antes de aplicar.**

## Chaves/segredo (RP4, C7)
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` e `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` (públicas por design; padrão `EXPO_PUBLIC_` do projeto). Adapter escolhe por `Platform.OS` (`getRevenueCatApiKey`).
- **Nenhum secret key** no app/repo. Sem chave configurada → `configure` não roda / `fetchEntitlement`→`null`→`free` (app abre).

## Fail-closed (RP6/RP7/RP8)
- `fetchEntitlement`: `try { const ci = await Purchases.getCustomerInfo(); return mapCustomerInfo(ci); } catch { return null; }`.
- `mapCustomerInfo`: se `entitlements.active['premium']` ausente → `null`. Datas via `Date.parse`; se `NaN` → campo `null` (o `sanitize`/`isValidTs` já descartam). Nenhum booleano solto libera premium — `decideEntitlement` exige janela+relógio.
- Sem `CustomerInfo`/SDK indisponível/rede → `null` → cache válido (7d) ou `free`.

## Estratégia de teste (smoke — RP9a)
Novo bloco `── Fase 2B.7.4 ──` em `scripts/smoke.js`, carregando **só a função de mapeamento** isolada (padrão `new Function(...)` com `CustomerInfo` mockado — sem importar o SDK nativo):
1. entitlement ativo (`willRenew:true`, `expirationDate` futuro) → `{rcActive:true, rcCancelledButPaid:false, expiresAt>now}`.
2. cancelado mas pago (`willRenew:false`, futuro) → `{rcActive:true, rcCancelledButPaid:true}`.
3. expirado / `active` vazio → `null`.
4. malformado (`expirationDate` inválido, `requestDate` ausente) → não lança; datas inválidas viram `null`.
5. `getCustomerInfo` lança → `fetchEntitlement` → `null` (fail-closed).
6. **Regressão:** com adapter presente mas sem entitlement ativo, `getEntitlementPlan()` continua `'free'` (prova "sem mudança visual", C8/ponto 19).
7. **Guard:** `entitlementSource.js` não importa telas/paywall; `app.json` sem secret; `assetBundlePatterns` ausente (prova 2C não iniciada, ponto 20).

## Impacto no fluxo de teste (atenção 1/2)
Expo Go **deixa de rodar** o app após o config plugin (código nativo). Validação passa a exigir **Dev Client** (build local/EAS). Registrar no relatório; a validação device desta fase (adapter sem produtos) prova apenas **app abre + resolve `free`** — premium real fica para sandbox (2B.7.4d).

## Sequência de implementação (detalhada em tasks.md após Portão 2)
1. `expo install react-native-purchases` + `expo-dev-client` (aprovado).
2. `app.json`: **ficou INTOCADO** — config plugin não exigido pela instalação (era condicional; parada não necessária).
3. `entitlementSource.js`: `getRevenueCatApiKey` + `configureRevenueCat` (lazy/idempotente) + `mapCustomerInfo` + `fetchEntitlement` real (try/catch→null).
4. `entitlementService.js`: **só comentário-cabeçalho** (a fonte deixou de ser stub); o `configure` ficou no adapter (passo 3), **não** no service.
5. `scripts/smoke.js`: bloco 2B.7.4 (**9 asserts** E1–E9) + migração D1/D8.
6. Gates: `npm run smoke` + `expo-doctor` + `git diff --check`.
7. Relatório PT-BR (estado dos arquivos) → validação device (Dev Client) por Eduardo → commit seletivo → push só com autorização.

## Fora de escopo (reafirmado)
Paywall/tela de assinatura, produtos/offerings nas lojas, `purchasePackage`, `restorePurchases`, sandbox real, 2C, qualquer toque em telas/`accessControl`/`entitlementPolicy`/packs.

## Riscos
| Risco | Mitigação |
|---|---|
| Versão RevenueCat incompatível com SDK 54/New Arch | `expo install` resolve; validar `expo-doctor`; se incompatível, **parar** e reportar |
| Config plugin quebra build | diff mínimo (1 linha), aprovação prévia, `expo-doctor` |
| Premium liberado indevido | `decideEntitlement` (janela+relógio) — adapter não decide |
| App não abre se SDK falhar | init fire-and-forget try/catch; `fetchEntitlement`→null→free |
| Expo Go para de funcionar | esperado; documentar migração p/ Dev Client |

**Portão 2 — aguardando aprovação do Plan.** Após aprovação: Tasks (SDD 5) → Analyze (SDD 6) → Portão 3.
