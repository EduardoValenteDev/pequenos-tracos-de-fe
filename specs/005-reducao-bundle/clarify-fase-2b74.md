# Clarify — Bloco 2 · Fase 2B.7.4 · Adapter RevenueCat

> **Etapa SDD 2.** Resolve ambiguidades da `spec-fase-2b74.md` antes do Plan.

| # | Ponto | Resolução |
|---|---|---|
| C1 | Esta rodada instala a dependência? | **Não.** Esta é SDD até o **Portão 2** (SPEC→Plan). A implementação do adapter (após Portão 3) instala `react-native-purchases`, **com aprovação explícita de dependência + `app.json`** (config plugin). |
| C2 | RevenueCat real ou só preparo de adapter? | **Adapter REAL** (dependência + config plugin + `fetchEntitlement` lê `CustomerInfo`), mas **só o adapter** — sem paywall/produtos/compra/restore (fases próprias 2B.7.4b/c/d). |
| C3 | Pacote e compatibilidade | **`react-native-purchases`** (RevenueCat oficial). Verificar a versão compatível com SDK 54/RN 0.81/New Arch no momento da instalação (via `npx expo install`). RevenueCat 8.x suporta New Architecture. |
| C4 | Expo Go? | **Não suporta** RevenueCat (código nativo). Exige **config plugin + Dev Client/EAS Build**. → **Muda o fluxo de teste no iPhone** (Expo Go → Dev Client). Registrado como impacto. |
| C5 | `app.json` | **Config plugin obrigatório** (RevenueCat no Expo). `app.json` está na lista de proibidos **salvo justificar + parar** → o Plan **para para aprovação** do `app.json` antes de tocar. |
| C6 | `expo-dev-client`? | Necessário para o **dev flow** com código nativo (ou usar EAS dev build). Decisão do Plan: preferir Dev Client (`expo-dev-client`, dep nova aprovável) ou EAS build. |
| C7 | API keys | **Public SDK keys** (iOS/Android) — públicas, embarcadas, **não segredo** — em env `EXPO_PUBLIC_REVENUECAT_*`. **Secret key JAMAIS no app** (fica no RevenueCat/backend). |
| C8 | Sem produtos, o que o adapter resolve? | Sem offerings/compra configurados, `CustomerInfo` não tem entitlement ativo → `fetchEntitlement` → `null` → **`free`** (sem mudança visual). Premium só aparece com entitlement real/sandbox (via `decideEntitlement`). |
| C9 | Init do SDK | `Purchases.configure({ apiKey })` no boot (fire-and-forget, try/catch — molde `initEntitlement`). Ponto exato decidido no Plan; nunca bloqueia a abertura. |
| C10 | Testar sandbox nesta fase? | **Não.** Sandbox iOS/Android é **2B.7.4d** (requer produtos 2B.7.4b + Dev Client/EAS). Nesta fase, o adapter é testado no **smoke** com `CustomerInfo` mockado. |

**Sem ambiguidades pendentes.** Requisitos prontos para o Checklist.
