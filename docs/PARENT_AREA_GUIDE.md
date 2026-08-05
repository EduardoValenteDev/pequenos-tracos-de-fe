# PARENT_AREA_GUIDE — Pequenos Traços de Fé

**Sprint 13 — 2026-05-27**

Guia da Área dos Pais: acesso, seções, reset de progresso, links de loja e regras de segurança.

> **📌 ANOTAÇÃO DO PRODUCT LOCK 4D (2026-08-05).** Este guia continua **descrevendo corretamente o
> código de hoje** — nada nele foi invalidado e **nenhum código foi alterado**. O que mudou é o
> **contrato de destino**: o Product Lock da Fase 4D aprovou, para o lançamento, **quatro operações
> distintas** na Área dos Pais — **A. Recomeçar a jornada**, **B. Apagar downloads**, **C. Apagar
> uma criação** e **D. Apagar todos os dados locais** —, além do **aviso obrigatório de perda por
> desinstalação**, do **painel de uso de armazenamento** e da **exportação individual de pinturas e
> artes com portão parental**. A seção 2 deste guia descreve **apenas a operação A**; as demais
> **ainda não existem no código**. O cartão **"Em preparação"** deve ser **removido ou substituído
> pela operação real antes do lançamento**. Contrato completo em
> [`## PL4D`](DECISIONS.md#pl4d--product-lock-fase-4d--dados-persistência-migração-recuperação-e-integridade)
> e no artefato
> [`docs/fase4-product-lock/04_PRODUCT_LOCK_4D_...`](fase4-product-lock/04_PRODUCT_LOCK_4D_DADOS_PERSISTENCIA_MIGRACAO_E_INTEGRIDADE.md).
> Rastreio na matriz canônica: `P-32`, `P-35`, `P-116`, `P-144`, `P-145`.

---

## 1. Acesso e gate parental

`ParentAreaScreen` é protegida por `ParentalGate` em dois momentos:

| Momento | Comportamento |
|---|---|
| Entrada na tela | Gate exibido imediatamente. Se cancelado, volta para a tela anterior. |
| Ações externas (links, email) | Gate reexibido para confirmar intenção. |

O gate usa um desafio matemático 4-dígitos (resultado entre 4–12, operandos entre 4–12). Correto → `unlockedForSession = true`. Uma vez desbloqueada na sessão, o gate não reaparece para a mesma navegação.

---

## 2. Seções da Área dos Pais

### 2.1 Plano Atual
Exibe o plano da criança: `Gratuito` ou `Plano Família`.  
Fonte: `getCurrentPlan()` de `accessControl.js`.

### 2.2 Incluído gratuitamente
Lista `FREE_PLAN.items` de `src/data/planConfig.js`.

### 2.3 Plano Família (paywall visual)
Lista `PREMIUM_PLAN.items`, preços (badge "Em breve"), botão "Ativar em breve" (desativado), nota sobre restauração.  
**Nenhum pagamento é processado nesta versão.** Botão é meramente visual.

### 2.4 Chegando em futuras versões
Lista `PREMIUM_PLAN.comingSoonItems`.

### 2.5 Progresso da criança (resumo)
Mostra total de estrelas, histórias concluídas, cenas pintadas.  
Fonte: `progressSummary` do `ProgressContext`.

### 2.6 Progresso por história (Sprint 13)
Exibe uma linha por história com:
- Emoji + título + status (Não iniciada / Em andamento / Concluída ✓)
- Barra de progresso proporcional
- Contagem `done/total` cenas
- Checkmarks: ✓ Quiz / ✓ Lumi / ✓ Livrinho

Fonte: `progressByStory`, `postStoryStatusByStory` do `ProgressContext`.

### 2.7 Limpar progresso (Sprint 13)
Fluxo de 4 etapas para evitar acidentes:

```
idle  →  confirm1  →  confirm2  →  done
```

| Etapa | O que acontece |
|---|---|
| `idle` | Botão vermelho "Limpar progresso" |
| `confirm1` | Aviso: o que será apagado (cenas, quiz, livrinho, estrelas) e o que NÃO será (perfil, artes) |
| `confirm2` | TextInput: responsável precisa digitar exatamente `APAGAR` para habilitar o botão |
| `done` | Mensagem de sucesso; `refreshProgress()` é chamado |

**Chave `resetProgress()` só é chamada quando `resetConfirmText.trim() === 'APAGAR'`.**

O serviço usado é `progressResetService.resetProgress()` — ver seção 3.

### 2.8 Avaliar o app (Sprint 13)
Quando `getStoreReviewUrl()` retorna `null` (app não publicado):  
→ Exibe badge "Em breve — aguardando publicação". Nenhum link externo é aberto.

Quando retorna uma URL válida (futuro):  
→ `Linking.openURL(url)` abre a loja nativa.

### 2.9 Contato e suporte
Link de email para `contato@pequenostracosdefe.com`. Gate reexibido antes de abrir.

### 2.10 Segurança e privacidade
Pontos informativos: sem login, sem coleta de dados, sem publicidade, dados locais, etc.

---

## 3. progressResetService

`src/services/progressResetService.js` — reset seguro por whitelist explícita.

### Chaves removidas (63 + 3):
- `@ptf_progress_{id}` × 20 histórias
- `@ptf_quiz_done_{id}` × 20
- `@ptf_reflection_{id}` × 20
- `@ptf_storybook_opened_{id}` × 20
- `@ptf_bonus_stars`
- `@ptf_achievements_seen`
- `@ptf_lumi_moment_ever`

### Chaves NUNCA removidas:
- `@ptf_profile` — nome e avatar da criança
- `ptf_atelier_arts_v1_*` — artes salvas no Ateliê
- `@ptf_drawing_s{id}_c{id}` — desenhos de colorir
- Qualquer chave fora da whitelist acima

### Uso:
```js
import { resetProgress } from '../services/progressResetService';

const { removed, keys } = await resetProgress();
// Chame refreshProgress() do ProgressContext após isso
```

**NUNCA usar `AsyncStorage.clear()`** — destrói perfil, artes e configurações irreversivelmente.

---

## 4. storeLinks.js

`src/config/storeLinks.js` — URLs das lojas. Ambas são `null` até o app ser publicado.

```js
export const APP_STORE_URL = null;    // preencher com URL real da App Store
export const PLAY_STORE_URL = null;   // preencher com URL real da Play Store
export function getStoreReviewUrl();  // retorna a URL da plataforma atual ou null
```

**Regra:** `Linking.openURL` só deve ser chamado se `getStoreReviewUrl()` retornar valor não-null.

---

## 5. Linguagem da Área dos Pais

| Correto | Errado |
|---|---|
| `Plano Família` | `Plano Familiar Premium` |
| `Ativar em breve` | `Compre agora` |
| `Gratuito` | `Free` |
| `Progresso por história` | `Story progress` |

A Área dos Pais é o único lugar onde o conceito de plano pode ser mencionado explicitamente. Na área infantil, usar apenas `Especial da Família` e `Pedir ao responsável`.

---

## 6. Checklist de integridade

- [ ] `ENABLE_LOCAL_PREMIUM_TEST_MODE` está `false`
- [ ] `getStoreReviewUrl()` retorna `null` (app não publicado)
- [ ] `resetProgress()` usa `multiRemove` (nunca `clear()`)
- [ ] Gate parental bloqueia entrada sem resolver o desafio
- [ ] Progresso por história lê `progressByStory` do ProgressContext (nunca AsyncStorage direto)
- [ ] Após reset, `refreshProgress()` é chamado para sincronizar o contexto
