# Tasks — Bloco 2 · Fase 2B.7.4 · Adapter RevenueCat

> **Etapa SDD 5.** Micro-tasks atômicas e cronológicas da implementação do **adapter** (executadas **só após Portão 3**). **Nada é executado agora.**
> **Portão 2:** aprovado com ajustes (Eduardo). **Portão 3:** pendente.

## Restrições travadas (ajustes obrigatórios do Portão 2)
- Instalar **no máximo** `react-native-purchases` e, **se necessário**, `expo-dev-client`. **Proibido** `react-native-purchases-ui`.
- **Sem** paywall/tela de assinatura, produtos/offerings, compra, restore, sandbox real, mudança visual, 2C.
- Config plugin no `app.json`: **mostrar diff exato no Analyze e PARAR no Portão 3** antes de tocar.
- Fluxo de teste do Eduardo no iPhone **muda para Dev Client** quando testar RevenueCat real (Expo Go **não** roda código nativo — não há "modo preview" que rode RevenueCat no Expo Go).

## Tasks

**T1 — Instalar `react-native-purchases` (dependência aprovada).**
`npx expo install react-native-purchases` (resolve a versão compatível com SDK 54/RN 0.81; **nunca** `@latest` manual). **NÃO** instalar `react-native-purchases-ui`.
_Aceite:_ aparece em `dependencies`; `package-lock.json` atualizado; `expo-doctor` verde.

**T2 — Instalar `expo-dev-client` (novo — não existe no projeto).**
`npx expo install expo-dev-client` (Expo SDK 54 fixa `~6.0.21`). Necessário porque RevenueCat é nativo e **não** roda no Expo Go; alternativa equivalente = EAS dev build.
_Aceite:_ aparece em `dependencies`/`devDependencies`; `package-lock.json` atualizado.

**T3 — `app.json` config plugin (PARADA no Portão 3).**
Se a versão instalada exigir config plugin, adicionar **1 entrada** ao array `plugins` existente. **Mostrar o diff exato no Analyze; NÃO aplicar sem aprovação.** Se a versão **não** exigir (autolink puro), `app.json` fica **intocado** — confirmar qual caso no Implement.
_Aceite:_ diff aprovado antes de escrever; `app.json` sem secret; `expo-doctor` verde.

**T4 — Adapter COMPLETO em `src/services/entitlementSource.js` (inclui o `configure`).**
Implementar `getRevenueCatApiKey()` (public key por `Platform.OS`), `configureRevenueCat()` (**idempotente via guard, DENTRO do adapter**), `mapCustomerInfo()` (puro, null-safe) e `fetchEntitlement()` (fail-closed; configura sob demanda):
```
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
const PREMIUM_ENTITLEMENT_ID = 'premium';
export function getRevenueCatApiKey() {   // EXPO_PUBLIC_REVENUECAT_{IOS|ANDROID}_API_KEY por Platform.OS
  return Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
                               : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
}
let _configured = false;
export function configureRevenueCat() {   // idempotente; sem chave → false (não configura); nunca lança
  try {
    if (_configured) return true;
    const apiKey = getRevenueCatApiKey();
    if (!apiKey) return false;
    Purchases.configure({ apiKey }); _configured = true; return true;
  } catch { return false; }
}
export function mapCustomerInfo(ci) { /* → RawEntitlement | null (puro; datas → ts válido ou null) */ }
export async function fetchEntitlement() {
  try {
    if (!configureRevenueCat()) return null;    // sem chave/SDK → free
    return mapCustomerInfo(await Purchases.getCustomerInfo());
  } catch { return null; }                       // fail-closed → service resolve free
}
```
_Aceite:_ nunca lança; sem entitlement/erro/chave → `null`; `configure` idempotente **no adapter**; sem import de telas/paywall/`-ui`.

**T5 — `src/services/entitlementService.js`: SEM mudança executável (só comentário).**
**Decisão real (aprovada):** o `Purchases.configure` **NÃO** vai no service — vive no adapter como `configureRevenueCat()` lazy+idempotente (T4), acionado por `fetchEntitlement()`. Assim o service **não** importa nem conhece RevenueCat; a fronteira "**service orquestra, adapter conhece a fonte externa**" fica preservada e o boot/refresh da 2B.7.3 segue idêntico (`refreshEntitlement()`→`fetchEntitlement()`→configura sob demanda). Única alteração: **comentário-cabeçalho** (a fonte deixou de ser stub).
_Aceite:_ `entitlementService` sem `import 'react-native-purchases'`; **zero** mudança de código executável; App.js **intocado**.

**T6 — Envs públicas (documentação/uso).**
Usar `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` e `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` (públicas por design, padrão `EXPO_PUBLIC_*` do projeto). **Nenhuma secret key** no app/repo.
_Aceite:_ nenhum literal de chave secreta; só leitura de `process.env.EXPO_PUBLIC_*`.

**T7 — Smoke `── Fase 2B.7.4 ──` em `scripts/smoke.js`.**
Carregar o adapter isolado (`new Function` com `Platform`/`Purchases`/`process` mockados — sem importar o SDK nativo). **9 asserts** (E1–E9, ver Analyze CS17). Migrar também D1 (port real) e D8 (fronteira: service sem RC, adapter pode).
_Aceite:_ smoke verde; cobre ativo/cancelado/sem-premium/malformado/erro/chave-ausente/fetch-ok/decideEntitlement-juiz/guardrails.

**T8 — Gates.**
`npm run smoke` verde · `npx expo-doctor` verde · `git diff --check` · `git diff --cached --check`.

**T9 — Relatório PT-BR + validação device (Dev Client) pelo Eduardo.**
Relatório com estado dos arquivos (salvo/untracked/modificado/staged). Device: **Dev Client** prova app abre + resolve `free` (sem produtos, premium real fica p/ 2B.7.4d).

**T10 — Commit seletivo (só após device PASS + autorização).**
`git add` caminho-a-caminho (services + smoke + package.json + package-lock.json + app.json se tocado). **Sem `git add .`/`-A`. Sem push sem autorização.**

## Dependências entre tasks
T1,T2 → T3 → T4,T5,T6 → T7 → T8 → T9 → T10. (T4/T5/T6 paralelizáveis após T3.)
