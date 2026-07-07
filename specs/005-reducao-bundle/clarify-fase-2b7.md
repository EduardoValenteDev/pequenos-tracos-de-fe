# Clarify — Bloco 2 · Fase 2B.7 · Entitlement real e validade offline

> **Etapa SDD 2.** Decisões obrigatórias do Portão 1 (Eduardo, 2026-07-07). Sem `[NEEDS CLARIFICATION]` em aberto.

| # | Ponto | Decisão |
|---|---|---|
| C1 | Janela offline máxima | **7 dias.** Mesmo com `expiresAt` futuro, exigir revalidação online após 7 dias desde a última validação confiável (`lastValidatedAt`). Sem revalidar → premium bloqueia até reconectar e confirmar entitlement ativo. Reduz risco de assinatura cancelada/reembolsada/contestada/manipulada persistir só por cache. |
| C2 | Chave de storage | **Chave nova e versionada `@ptf_entitlement_v1`.** **Não** reutilizar `@ptf_plan_state_v1` — separa entitlement real de estado antigo/mock; evita migração confusa e falso premium. |
| C3 | Estado inicial e loading | No boot, entitlement carregado **antes** de navegação premium. **Sem cache válido → default seguro `free`** (nunca premium). **Com cache válido → premium provisório** enquanto revalida, **se**: `expiresAt` futuro **E** janela 7 dias não vencida **E** sem suspeita de relógio adulterado. |
| C4 | Expiração offline | **Dura:** `now > expiresAt` → `free` **mesmo offline**. `lastValidatedAt` > 7 dias → `free`/`needs_revalidation` (bloqueia premium até revalidar). |
| C5 | Cancelamento | Cancelado **dentro do período pago** (`expiresAt` futuro) → premium até `expiresAt`. Cancelado + `expiresAt` **vencido** → free. |
| C6 | Grace period / billing retry | Premium **só** se o `CustomerInfo` do RevenueCat indicar entitlement ativo. **NÃO inventar grace no client.** Offline usa só o último estado validado, respeitando `expiresAt` + janela 7 dias. |
| C7 | Defesa contra relógio (FIRME) | Persistir **`maxSeenDeviceTimestamp`** + **`lastValidatedAt`**. Relógio retrocede suspeito (`now < maxSeenDeviceTimestamp`) → bloquear premium + exigir revalidação. Janela 7 dias vencida → bloquear até revalidar. Preferir timestamp confiável (servidor/resposta de compra); **sem fonte confiável → declarar limitação + bloqueio conservador em caso suspeito**. |
| C8 | Modo Criador | Só **dev**; produção **nunca** habilita premium. Permanece coberto por **smoke/guard pré-loja**. |
| C9 | R2 público / usuário técnico | 2B.7 protege o **fluxo normal dentro do app**; **não** protege contra extração técnica de URLs públicas, arquivos locais, root/jailbreak, inspeção de storage. Trilha futura (antes de escala): R2 privado, URLs assinadas, backend de autorização, manifesto protegido, packs criptografados com chave temporária. |
| C10 | 2C continua bloqueada | A 2C **não** começa só porque a SPEC existe. Só discutível após **decisão formal** sobre: entitlement real; validade offline; janela 7 dias; Modo Criador bloqueado em produção; risco R2 público documentado; estratégia RevenueCat futura definida. |

**Sem ambiguidades pendentes.** Requisitos prontos para o Checklist.
