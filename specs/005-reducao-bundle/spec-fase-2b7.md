# Bloco 2 · Fase 2B.7 · Entitlement real e validade offline

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7 · **Etapa SDD:** 1 (Specify) · **Portão Humano 1: APROVADO com Clarify por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `0d2cee8`.
> **Natureza:** política/contrato de assinatura real. **Sem** implementar; **sem** RevenueCat; **sem** 2C. **Pré-requisito FORMAL da 2C.**

## Objetivo
Definir a **política oficial de entitlement real** (assinatura) e de **validade offline**, de forma que — quando o RevenueCat for integrado (feature própria) — o acesso premium seja **verdadeiro, revogável e não-vitalício offline**, **sem alterar nenhum consumidor** do gate já existente.

## Diagnóstico aceito
O gate está **100% centralizado** em `isPremiumUser()` → `getCurrentPlan()` ([accessControl.js](src/services/accessControl.js)); hoje `getCurrentPlan()` é **mock** (`'free'`). A 2B.6 já provou **pack ≠ acesso** e **Modo Criador impossível em produção**. A 2B.7 **preenche o contrato RP4 da 2B.6** trocando a **fonte** de `getCurrentPlan()`, mantendo os consumidores intactos.

## Direção aprovada
1. `getCurrentPlan()` continua **síncrono**. 2. A fonte deixa de ser mock → **entitlement em memória**. 3. Consumidores **não mudam**. 4. `isPremiumUser`/`hasStoryAccess`/`canOpenStoryFullExperience` seguem o **gate central**. 5. **Pack no disco nunca é autorização.** 6. 2B.7 é **pré-requisito formal da 2C**. 7. RevenueCat **não** implementado agora.

## Modelo de estado (contrato — não implementado)
Estado de entitlement em memória (carregado no boot, atualizado por listener), persistido na chave **nova e versionada `@ptf_entitlement_v1`** (**não** reutilizar `@ptf_plan_state_v1`):
```
{
  plan:            'premium' | 'free',
  status:          'active' | 'cancelled_active' | 'expired' | 'needs_revalidation' | 'unknown',
  expiresAt:              number | null,   // data de expiração do SERVIDOR (CustomerInfo)
  lastValidatedAt:        number | null,   // última validação online confiável
  maxSeenDeviceTimestamp: number,          // maior timestamp já observado (anti-retrocesso)
}
```
Constante: **`OFFLINE_MAX_WINDOW_DAYS = 7`**.

## Requisitos de política

**RP1 — Entrada do RevenueCat (Clarify).** Futuro: `react-native-purchases` (dependência nova → aprovação própria; exige **config plugin + Dev Client/EAS Build**, **não** Expo Go). Inicialização no **boot** (mesmo ponto de `loadCreatorQaMode`), entitlement identifier (ex.: `"plano_familia"`). Nada agora.

**RP2 — `getCurrentPlan()` síncrono, fonte em memória.** Deriva do estado de entitlement em memória (padrão do `creatorQaMode`: `_state` + `load` no boot + `subscribe`). **Assinatura síncrona preservada** → `isPremiumUser`/`hasStoryAccess`/`canOpenStoryFullExperience` **inalterados** → 2B.6 intacta automaticamente.

**RP3 — Estados e cancelamento (Clarify 5, 6).**
| Estado | Resultado |
|---|---|
| **active** | premium |
| **cancelled_active** (cancelado, `expiresAt` futuro) | premium **até `expiresAt`** |
| **cancelado + `expiresAt` vencido** | free |
| **expired** | free |
| **grace period / billing retry** | premium **só se o `CustomerInfo` do RevenueCat indicar entitlement ativo** — **NÃO inventar grace no client** |
| **sem internet** | último estado **validado**, respeitando `expiresAt` **e** a janela de 7 dias |

**RP4 — Estado inicial e loading (Clarify 3).** No **boot**, o entitlement é carregado **antes** de permitir navegação premium. **Sem cache válido → default seguro `free`** (nunca premium). **Com cache válido → premium provisório** enquanto revalida, **desde que**: (a) `expiresAt` no futuro; (b) janela offline de 7 dias **não** vencida; (c) **sem** suspeita de relógio adulterado.

**RP5 — `expiresAt` + expiração offline dura (Clarify 4).**
- `expiresAt` (do servidor) **obrigatório**, persistido em `@ptf_entitlement_v1`.
- **Regra dura:** `now > expiresAt` → `getCurrentPlan()` = **`free`, mesmo offline**.
- `lastValidatedAt` com **mais de 7 dias** → `free` / `needs_revalidation` (na prática **bloqueia premium até revalidar**).

**RP6 — Defesa contra relógio alterado (Clarify 1, 7 — requisito FIRME).**
1. Persistir **`maxSeenDeviceTimestamp`** (anti-retrocesso) e **`lastValidatedAt`**.
2. **Relógio retrocede de forma suspeita** (`now < maxSeenDeviceTimestamp`) → **bloquear premium** + exigir revalidação online.
3. **Janela offline de 7 dias vencida** → bloquear premium **até revalidar** (mesmo com `expiresAt` futuro — reduz risco de assinatura cancelada/reembolsada/contestada/manipulada persistir só por cache).
4. Preferir **timestamp confiável** de servidor / resposta de compra. **Se não houver fonte confiável → declarar limitação e manter bloqueio conservador em caso suspeito.**

**RP7 — Modo Criador impossível em produção (Clarify 8).** Só **dev**; produção **nunca** habilita premium. Coberto por **smoke/guard pré-loja** (evidência 2B.6: `isCreatorQaModeAllowed` = `__DEV__ || flag`; flag não vaza p/ build). `isPremiumUser = getCurrentPlan(real) || isCreatorQaModeEnabled(dev)` — em produção só o real conta.

**RP8 — Onde revalidar.** (a) **Boot** (`App.js`, molde `loadCreatorQaMode`): carrega cache + refresh online se houver rede; (b) **Foco do app** (`AppState 'active'`); (c) **Retorno da internet** (NetInfo online); (d) após **compra/restore**. As telas premium da 2B.6 já revalidam em foco (`canOpenStoryFullExperience`) → passam a ler o entitlement real.

**RP9 — Pack no disco nunca é autorização (Clarify 5).** Mantém RP2 da 2B.6: entitlement real é a **única** fonte de acesso; resolver **agnóstico**. `expired`/`needs_revalidation` → telas bloqueiam **mesmo com pack no disco**.

**RP10 — Conversa com 2B.6 / packs R2 / 2C (Clarify 10).** A 2B.7 preenche o RP4 da 2B.6 (getCurrentPlan real + `expiresAt`); a mecânica de gate/foco/parada de mídia opera com entitlement **real**. Download gated por `canAccess = isPremiumUser real`. **Pré-requisito da 2C.**

## Fora de escopo agora (Clarify 13)
Implementar RevenueCat, backend, 2C, URLs assinadas, criptografia, mudança em `app.json`/`assetBundlePatterns`/requires/assets. A 2B.7 é **só a política/contrato**.

## Riscos residuais (Clarify 9)
- A 2B.7 **protege o fluxo normal dentro do app**. **NÃO** protege contra: extração técnica de URLs públicas, arquivos locais, root/jailbreak, inspeção de storage.
- Antes de escala alta, **trilha futura:** R2 privado, URLs assinadas, backend de autorização, manifesto protegido e, se necessário, **packs criptografados com chave temporária** (que expira com a assinatura).

## 2C continua bloqueada (Clarify 10)
A 2C **não** começa só porque esta SPEC existe. Só poderá ser **discutida** após **decisão formal** sobre: (1) entitlement real; (2) validade offline; (3) janela de 7 dias; (4) Modo Criador bloqueado em produção; (5) risco R2 público documentado; (6) estratégia RevenueCat futura definida.

## Critérios de aceite (para a futura implementação)
1. `getCurrentPlan()` reflete active / cancelled_active / expired / grace / offline-válido corretamente.
2. `now > expiresAt` → `free` **mesmo offline**.
3. `lastValidatedAt` > 7 dias → `free`/`needs_revalidation` (bloqueia até revalidar).
4. Retrocesso de relógio (`now < maxSeenDeviceTimestamp`) → bloqueia premium.
5. Revalidação no **boot + foco + retorno de internet + compra/restore**.
6. Boot: entitlement carregado antes de navegação premium; sem cache → `free`.
7. `isPremiumUser`/`canOpenStoryFullExperience`/`hasStoryAccess` **inalterados** (só a fonte muda) → 2B.6 intacta.
8. Modo Criador **nunca** habilita premium em produção (smoke/guard).
9. Pack no disco **nunca** libera sem entitlement ativo.
10. Cobertura: smoke (contrato/estados/decisão pura) + device (assinar → cancelar → expirar → offline → adiantar/atrasar relógio → janela 7d → confirmar bloqueio).
