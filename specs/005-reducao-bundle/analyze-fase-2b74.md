# Analyze — Bloco 2 · Fase 2B.7.4 · Adapter RevenueCat

> **Etapa SDD 6.** Consistência spec↔plan↔tasks↔checklist + **confirmação dos 18 pontos obrigatórios** do Portão 2. **Nenhum código escrito, nenhuma dependência instalada, nada staged.**
> **HEAD:** `ee92507` · **Portão 3: pendente.**

## Consistência spec↔plan↔tasks↔checklist
| Eixo | Verdato |
|---|---|
| Escopo (adapter só, sem UI/paywall/produtos/compra/restore/sandbox/2C) | ✅ coerente em spec/plan/tasks |
| Dependências (`react-native-purchases` + `expo-dev-client`; **não** `-ui`) | ✅ tasks T1/T2, spec RP2, restrição travada |
| `app.json` (parada no Portão 3 com diff) | ✅ tasks T3, plan, restrição travada |
| Contrato do adapter = port existente | ✅ bate 1:1 (ver CS9/CS10) |
| Fail-closed via `decideEntitlement` | ✅ spec RP7, plan, tasks T4/T5 |
**Sem divergências.**

## Confirmação dos 18 pontos (investigação read-only executada)

| # | Ponto | Confirmação |
|---|---|---|
| CS1 | Versão via `expo install` (sem `@latest`) | `react-native-purchases` **não** está no `bundledNativeModules.json` do Expo → `npx expo install` resolve pela compat de RN. `npm view`: latest **10.4.1**, peer `react-native >= 0.73.0` / `react >= 16.6.3` → **compatível com RN 0.81.5 / React 19.1**. **Não instalei** (só `npm view`, leitura do registro). Pin final = o que `expo install` escolher no Implement; **nunca** `@latest` manual. |
| CS2 | `expo-dev-client` já existe? | **NÃO** existe no `package.json` (nem dep nem devDep) → **novo**. Expo SDK 54 o fixa em **`~6.0.21`** (`bundledNativeModules.json`). |
| CS3 | Lockfile alterado? | **SIM** — projeto usa **`package-lock.json`** (raiz). T1/T2 o atualizam (2 deps + transitivas). Sem yarn/pnpm. |
| CS4 | Arquivos tocados | `src/services/entitlementSource.js` (adapter **+ `configureRevenueCat` lazy**), `src/services/entitlementService.js` (**só comentário-cabeçalho — zero código executável**; o `configure` foi para o adapter), `scripts/smoke.js` (bloco 2B.7.4 + migração D1/D8), `package.json` + `package-lock.json` (2 deps). **`app.json` ficou INTOCADO** (config plugin não exigido). **Nenhuma tela.** |
| CS5 | Diff esperado de `app.json` | **Condicional.** Array `plugins` atual: `["expo-font", ["expo-audio", {…}], "expo-asset"]`. **Se** exigido, diff = **+1 entrada** `"react-native-purchases"` (ver bloco abaixo). **Se autolink puro bastar → `app.json` intocado.** Diff **real** exibido no Portão 3 antes de tocar; nada aplicado sem aprovação. |
| CS6 | Onde ficam as public keys | Env `EXPO_PUBLIC_*` (padrão do projeto, ex.: `featureFlags.js`), lidas por `Platform.OS` **no adapter** (`getRevenueCatApiKey`). Públicas por design (embarcadas). |
| CS7 | Secret key entra no app? | **NÃO.** Nenhuma secret key no app/repo/env; validação server-side fica no RevenueCat/backend. Adapter só usa a **public SDK key**. |
| CS8 | Nomes exatos das envs | **`EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`** e **`EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`** (adotado o padrão sugerido pelo Eduardo; coerente com `EXPO_PUBLIC_*` existente). |
| CS9 | Como `entitlements.active['premium']` vira snapshot | Adapter `mapCustomerInfo`: `const e = ci.entitlements.active['premium']`; `!e → null` (sem entitlement → free). `e` presente → monta `RawEntitlement` `{rcActive, rcCancelledButPaid, expiresAt, serverNow}` — **exatamente** o contrato do port (`entitlementSource.js` linhas 11-19). |
| CS10 | Cálculo de cada campo | ver tabela **Mapeamento final** abaixo. |
| CS11 | Adapter só monta snapshot; quem decide é `decideEntitlement` | ✅ Adapter retorna dados crus; `sanitizeEntitlement` (service, linhas 83-96) copia só campos tipados e **descarta o resto**; `decideEntitlement` (2B.7.1) é o **único** juiz (janela+relógio+expiração). |
| CS12 | Erro do RevenueCat → `null` → `free` | ✅ `fetchEntitlement` = `try { map(await getCustomerInfo()) } catch { return null }`. `null` → `refreshEntitlement` mantém cache/`free` (service linhas 109-116, já testado). |
| CS13 | App abre sem RevenueCat | ✅ `configureRevenueCat()` idempotente **no adapter**, envolto em try/catch, acionado por `fetchEntitlement()` (lazy); `initEntitlement` segue fire-and-forget (2B.7.3, linhas 125-134). Falha/sem chave → `false` → `null` → `free`, boot normal. App.js e service (executável) intocados. |
| CS14 | Sem produtos + sem compra → `free` | ✅ Sem offerings/compra, `CustomerInfo.entitlements.active` não tem `'premium'` → `mapCustomerInfo → null → free`. Prova da ausência de mudança visual. |
| CS15 | `getCurrentPlan` e telas inalterados | ✅ `accessControl.getCurrentPlan` **não** é tocado (já delega a `getEntitlementPlan` desde 2B.7.2); zero telas no diff. |
| CS16 | `entitlementPolicy`/`accessControl`/packs/downloads/assets/2C intactos | ✅ Fora do diff. `assetBundlePatterns` permanece ausente; requires premium intactos (prova 2C não iniciada). |
| CS17 | Smoke com `CustomerInfo` mockado | **9 asserts (E1–E9)** — adapter isolado (`Platform`/`Purchases`/`process` mockados) + migração D1/D8 (lista final abaixo). |
| CS18 | Sandbox real fora desta fase | ✅ Sandbox iOS/Android = **2B.7.4d** (exige produtos 2B.7.4b + Dev Client/EAS). Aqui só mock no smoke. |

## Diff esperado de `app.json` (condicional — só se o config plugin for exigido)
```diff
   "plugins": [
     "expo-font",
     ["expo-audio", { "microphonePermission": false, ... }],
-    "expo-asset"
+    "expo-asset",
+    "react-native-purchases"
   ]
```
**Só isto.** Nenhuma permissão, chave ou campo extra. O diff **real** (ou a confirmação de que `app.json` fica intocado) é exibido no **Portão 3** antes de qualquer escrita.

## Mapeamento final `CustomerInfo` → snapshot (CS10)
| Campo | Quem calcula | Como |
|---|---|---|
| `rcActive` | **adapter** | `!!entitlements.active['premium']` |
| `rcCancelledButPaid` | **adapter** | `e.willRenew === false` (ausente ⇒ `false`) |
| `expiresAt` | **adapter** | `Date.parse(e.expirationDate)` (ms) ou `null` |
| `serverNow` | **adapter** | `Date.parse(ci.requestDate)` (ms) — relógio do servidor |
| `lastValidatedAt` | **service** (`sanitize`) | `isValidTs(raw.serverNow) ? serverNow : now` |
| `maxSeenDeviceTimestamp` | **service** (`sanitize`) | `Math.max(prevMax, rawMax, now)` — **nunca regride**; adapter **não** seta |

→ O adapter fornece **4 campos crus**; o service deriva `lastValidatedAt`/`maxSeenDeviceTimestamp`. Contrato idêntico ao port já existente — **zero mudança** em `entitlementService.sanitizeEntitlement`.

## Prova de fail-closed (CS11/CS12/CS13)
- `fetchEntitlement` nunca lança (try/catch → `null`).
- `mapCustomerInfo`: sem `'premium'` → `null`; datas inválidas → campo `null` (o `sanitize` já as descarta via `isValidTs`).
- `rcActive:true` **sozinho** não libera premium: `decideEntitlement` exige `expiresAt` válido+futuro **e** `lastValidatedAt` dentro de 7 dias (`hasValidWindow`), senão `needs_revalidation`/`free`.
- Sem chave / SDK indisponível / rede / offline → `null` → cache válido (7d) ou `free`.

## Casos de smoke finais (CS17) — E1–E9 implementados + D1/D8 migrados
1. **E1 ativo** (`willRenew:true`, `expirationDate` futuro, `requestDate` válido) → `{rcActive:true, rcCancelledButPaid:false, expiresAt>now, serverNow>0}`.
2. **E2 cancelado mas pago** (`willRenew:false`, futuro) → `{rcActive:true, rcCancelledButPaid:true}`.
3. **E3 sem premium** (`active` sem `premium` / `null` / `{}` / sem `entitlements`) → `null`.
4. **E4 malformado** (`expirationDate` inválido / `requestDate` ausente) → não lança; datas → `null`; `rcActive` segue `true`.
5. **E5 fail-closed** — `getCustomerInfo` lança → `fetchEntitlement` → `null`.
6. **E6 chave ausente** — sem `EXPO_PUBLIC_REVENUECAT_*` → `getRevenueCatApiKey()===undefined`, `configureRevenueCat()===false`, `fetchEntitlement()===null` (app abre → `free`).
7. **E7 fetch ok** — chave presente + premium ativo → `RawEntitlement` (`rcActive:true`, `expiresAt` futuro).
8. **E8 `decideEntitlement` juiz** — `{rcActive:true}` sem janela → **não** premium; `{plan:'premium'}` solto → **não** premium; com janela válida → `premium`.
9. **E9 guardrails** — adapter (código, sem comentários) sem `purchasePackage/restorePurchases/getOfferings/presentPaywall/-ui/RevenueCatUI`; service sem import RC; `app.json` sem plugin RC nem secret; `assetBundlePatterns` ausente (2C intacta).

Migração: **D1** (port real: `entitlementSource` async + é o adapter, sem `-ui`) e **D8** (fronteira: service sem import RC, adapter pode).

## NÃO aprovados nesta fase (confirmado fora do diff)
`react-native-purchases-ui` · RevenueCat Paywalls · tela de assinatura · compra (`purchasePackage`) · restore (`restorePurchases`) · offerings · sandbox real · qualquer mudança visual · 2C. **Nenhum** aparece em spec/plan/tasks como ação desta fase.

## Riscos / notas de atenção
| Risco | Nota |
|---|---|
| Versão que `expo install` fixa | resolvida no Implement (não `@latest`); se `expo-doctor` acusar incompat com SDK 54/New Arch → **parar e reportar**, não forçar |
| Config plugin obrigatório ou não | **condicional à versão**; diff real (ou "sem mudança") mostrado no Portão 3 antes de tocar `app.json` |
| Expo Go | RevenueCat é **nativo**: **não** roda no Expo Go (não há "modo preview" que o habilite lá). Funcionalidade real e compra exigem **Dev Client/EAS**. **O fluxo de teste do Eduardo no iPhone muda para Dev Client** ao testar RevenueCat real |
| Entitlement **sem expiração** (lifetime/não-assinatura) | com `expirationDate:null`, o modelo de janela resolve **`free`** (conservador). Fora de escopo do **Plano Família** (assinatura, sempre com expiração). Se um SKU vitalício for adicionado no futuro, a **policy** precisará de um ramo não-expira (fase própria) — **não** nesta |
| Premium indevido | impossível por booleano solto: `sanitize` + `decideEntitlement` (janela+relógio) |

## Conclusão
Consistência **spec↔plan↔tasks↔checklist OK**; 18 pontos **confirmados**; contrato do adapter **idêntico** ao port existente (`entitlementService` **não** muda o `sanitize`). Pronto para **Portão 3**.

## Alinhamento pós-implementação (Portão 3 executado)
Registro da decisão real aprovada por Eduardo, para manter o doc rastreável ao código:
- **`Purchases.configure` vive NO ADAPTER** (`configureRevenueCat()` lazy + idempotente, acionado por `fetchEntitlement()`), **não** no `entitlementService`. Motivo: preservar a fronteira "service orquestra, adapter conhece a fonte externa" e deixar o service **sem** conhecer RevenueCat.
- **`entitlementService.js`** teve **só o comentário-cabeçalho** alterado — **zero** código executável; **não importa** `react-native-purchases`.
- **`app.json` INTOCADO** (SHA `572bdf6a…` idêntico); config plugin **não** exigido pela instalação.
- Dependências resolvidas por `expo install`: `react-native-purchases@10.4.1`, `expo-dev-client@6.0.21` (novo). `react-native-purchases-ui` **não** instalado.
- Gates: **`npm run smoke` 1870/1870**, **`npx expo-doctor` 18/18** (sem reclamação de dev build). **Nada staged/commitado/enviado.**
