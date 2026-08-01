# Spec — Ativação Controlada do Piloto Colorir 60 (A Criação)

> **Feature:** `018-c60-pilot-activation` · **Etapa SDD:** 1–3 (Specify · Clarify · Checklist)
> **Data:** 2026-08-01 · **Base exata:** `e07e8bc3e7b1091edebec986d47d06c8d3b2ceeb` (HEAD publicado de `integrate/colorir-canonical-runtime`)
> **Branch de trabalho:** `integrate/c60-pilot-activation` (nascida diretamente da base acima)
> **Identificador:** `018` (próximo livre — `017` = colorir-60-creation-production-prompts)
> **Natureza:** **infraestrutura de ativação** — configuração de build, testes e governança. **Nenhuma** tela, rota, storage, progresso, catálogo, atividade, asset, áudio ou copy é alterado.
>
> **Precedência:** SoT (`docs/PROJECT_SOURCE_OF_TRUTH.md`) → constituição → `AGENTS.md`/`CLAUDE.md` → esta spec.
> **Não reabre** as decisões de 014/015/016/017, do P3J, do P3J-R.1 nem do P3J-R.1 FIX1.
>
> **Ratificações do fundador que autorizam este bloco** (2026-08-01): Ratificação 1 (testes que fixam a flag como literal `false`), Ratificação 2 (efeito observável sobre A Criação e Noé), Ratificação 3 (público Free e Família).

---

## 1. Problema

O Colorir 60 de "A Criação" está **tecnicamente completo e verificado** (3 atividades, assets com SHA-256 e dimensões conferidos, navegação canônica, storage isolado, conclusão, coleção, prévia, marcos nas cenas 02/07/09). Mas ele é **invisível em qualquer build de release**:

```js
isColoring60PilotAllowed() = COLORIR_60_CREATION_PILOT_ENABLED || (__DEV__ && isInternalToolsEnabled())
```

Com a flag literal `false`, o único braço vivo exige `__DEV__ === true` — falso em `preview`, `preview-criador`, `production` e `screenshot`. **Toda a validação física até aqui exercitou o braço `__DEV__`, nunca a flag.**

Ligar a flag para `true` resolveria a visibilidade e criaria um problema pior: **ligaria também a produção da loja**, sem nenhuma cerca.

## 2. Objetivo

Criar a **infraestrutura segura de ativação controlada**: um caminho explícito, cercado por duas condições independentes, que abre o piloto **apenas** num perfil de build interno dedicado, e que é **impossível de satisfazer por acidente** em produção.

**Fora de escopo:** gerar build, instalar, publicar, integrar, iniciar a Fase 3.

## 3. Decisões (Clarify — nenhuma ambiguidade em aberto)

| # | Pergunta | Decisão ratificada |
|---|---|---|
| D1 | Ativação pública ou controlada? | **Controlada.** Nada neste bloco autoriza publicação pública. |
| D2 | Mecanismo? | **Dupla cerca de ambiente + perfil**, no padrão já existente em `featureFlags.js` (`RELEASE_PACK_QA_ENABLED`, `CREATOR_QA_MODE_RELEASE_ENABLED`). Não há configuração remota no projeto e criar uma seria dependência nova. |
| D3 | Quais as duas condições? | `EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT === 'true'` **E** `EXPO_PUBLIC_BUILD_PROFILE === 'c60-pilot'`. Conjunção — uma isolada nunca abre. |
| D4 | Produção pode abrir? | **Nunca.** O bloco `production` do `eas.json` não declara nenhuma das duas variáveis; e o perfil exigido é comparado **literalmente**, então `production` falha por ausência dupla. |
| D5 | Público do piloto? | **Free e Família.** "A Criação" é conteúdo gratuito; o Colorir 60 **não** vira exclusivo premium. |
| D6 | Free persiste a arte? | **Não.** Free abre, pinta, conclui e celebra; o desfecho `NOT_PERSISTED_FREE` é **comportamento correto** e a coleção representa isso honestamente. Família salva. |
| D7 | Modo Criador para simular premium no release? | **Proibido.** O Modo Criador não altera `getCurrentPlan()` e não deve ser usado para falsificar entitlement. |
| D8 | Efeito sobre progresso é feature ou hipótese? | **Hipótese observável do piloto.** Nenhuma regra de progresso, conclusão ou desbloqueio é alterada. A decisão definitiva pertence ao **Product Lock da Fase 4**. |
| D9 | Migração/carência/grandfathering para instalações existentes? | **Não neste bloco.** |
| D10 | Aviso, modal, paywall ou copy nova sobre não-persistência no Free? | **Não neste bloco.** Confusão observada no teste físico vira registro para avaliação posterior. |
| D11 | Onde implementar? | Branch isolada `integrate/c60-pilot-activation`, nascida de `e07e8bc`. A branch canônica publicada **não** é alterada. |
| D12 | Atalho de build em `package.json`? | **Não.** O comando EAS será usado direto, depois, com autorização. |

## 4. Requisitos funcionais

- **RF1** — `COLORIR_60_CREATION_PILOT_ENABLED` deixa de ser literal e passa a ser a conjunção de D3.
- **RF2** — Existe o perfil EAS `c60-pilot`, de distribuição **interna**, utilizável em **iOS e Android**, declarando exatamente as duas variáveis da cerca.
- **RF3** — O perfil `c60-pilot` **não** declara Modo Criador, sandbox de packs, Release Pack QA nem variáveis de produção — logo `isInternalToolsEnabled()` é **falso** nele, e nem a "Administração (dev)" nem a Bancada C60 existem.
- **RF4** — `development`, `preview`, `preview-criador`, `production` e `screenshot` continuam com o piloto **fechado** pela flag (o Dev Client segue abrindo pelo braço `__DEV__`, que não muda).
- **RF5** — Nenhum perfil existente herda ou recebe as variáveis do piloto.
- **RF6** — Com o piloto autorizado, as **entradas infantis** (seção na tela da história, convite-modal, marcos das cenas 02/07/09, ponte de Parabéns, coleção, prévia) ficam disponíveis; as **entradas internas** continuam ausentes sem `isInternalToolsEnabled()`.

## 5. Requisitos não funcionais / invariantes

- **RN1** — `__DEV__` é `false` no build `c60-pilot`: ele exercita **a flag**, não o braço de desenvolvimento.
- **RN2** — As variáveis `EXPO_PUBLIC_*` **não são segredo** (são embutidas no bundle). A proteção é *build-time*, por ausência de declaração em produção — igual às flags já aprovadas.
- **RN3** — O total de checks do smoke **não pode diminuir**.
- **RN4** — Provas por **resolvedor/execução real** sempre que possível; texto e comentário não bastam.
- **RN5** — O verificador de assets C60 continua sendo gate **obrigatório e separado** do smoke.

## 6. Escopo proibido (lacrado)

Não alterar: telas · navegação · storage · `ProgressContext` · lógica de desbloqueio · catálogo C60 · atividades · assets · áudios · poses · falas · modos de conclusão · marcos das cenas 02/07/09 · Criar livre · Cultinho · packs · download · recovery · RevenueCat · entitlements · bundle identifier · `runtimeVersion` · `main` · `package.json` · `package-lock.json`.

## 7. Efeito de progresso — hipótese autorizada, não regra

Cadeia real, **sem nenhuma alteração de código**:

1. `creation` é a primeira história ordenada.
2. Piloto ativo ⇒ `isStoryColoringAvailable('creation')` passa a `true`.
3. `getStoryJourneyStatus` passa a exigir `coloringComplete` para `journeyComplete` dessa história.
4. `journeyComplete` é **derivado ao vivo, nunca persistido** ⇒ o efeito é retroativo.
5. `isStorySequenceUnlocked('noah') = isStoryJourneyComplete('creation')` ⇒ **Noé pode voltar a exibir o bloqueio de sequência**.
6. Concluir **uma** das três atividades (`count >= 1`) restaura o requisito atual.

Isto é **observação do piloto**, registrada como evidência para o Product Lock da Fase 4. Não é Product Lock de progressão e **não autoriza publicação pública**.

## 8. Critérios de aceite

| # | Critério | Como se prova |
|---|---|---|
| CA1 | Piloto fechado por padrão (env vazio) | resolvedor real da flag |
| CA2 | Uma variável isolada não abre | resolvedor real, dois casos |
| CA3 | Abre só com as duas condições, perfil **exatamente** `c60-pilot` | resolvedor real |
| CA4 | `production`, `preview`, `preview-criador`, `screenshot`, `development` fechados | resolvedor real com o env **lido do `eas.json`** |
| CA5 | `production` não contém nenhuma das duas variáveis | leitura estrutural do `eas.json` |
| CA6 | Ausência/adulteração de uma condição fecha | resolvedor real (caixa, espaço, valor alternativo) |
| CA7 | Entradas infantis disponíveis com o piloto autorizado | execução real do portão + estrutura das telas |
| CA8 | Entradas internas ausentes sem `isInternalToolsEnabled()` | execução real de `isInternalToolsEnabled()` sob env do perfil |
| CA9 | Efeito sobre `journeyComplete`/Noé provado sem alterar lógica | execução real de `storyJourneyService` + `storyColoringAvailability` |
| CA10 | Contratos anteriores semanticamente protegidos | asserções herdadas, reescritas em intenção, nunca apagadas |
| CA11 | `PRODUCTION_FLAGS_CHECKLIST.md` documenta a flag | asserção de smoke sobre o documento |
| CA12 | Zero alteração em tela/rota/storage/progresso/asset | `git diff --name-only` contra a base |

## 9. Checklist de qualidade dos requisitos (Etapa SDD 3)

- [x] Todo requisito é observável e verificável por execução, não por leitura de texto.
- [x] Nenhum `[NEEDS CLARIFICATION]` em aberto (§3 fecha D1–D12).
- [x] Escopo proibido explícito e verificável por diff (§6, CA12).
- [x] Risco identificado e endereçado como hipótese, não como mudança silenciosa (§7).
- [x] Reversão definida (§10).
- [x] Rastreabilidade preservada: os contratos antigos mudam de **mecanismo**, não de **intenção** (§CA10).

## 10. Critérios de reversão

1. **Reversão total:** descartar a branch `integrate/c60-pilot-activation`. A linha canônica publicada permanece intacta em `e07e8bc`.
2. **Reversão parcial em runtime:** não construir com o perfil `c60-pilot`. Qualquer outro perfil mantém o piloto fechado sem tocar em código.
3. **Reversão de emergência pós-build:** desinstalar o APK/IPA interno. Nenhum dado do aparelho é apagado pela ativação — o efeito de progresso é derivado, não persistido, e se desfaz sozinho ao voltar para um build sem a cerca.

## 11. Governança

- Registro em `docs/DECISIONS.md`, `docs/PRODUCTION_FLAGS_CHECKLIST.md` e fechamento da decisão em aberto nº 2 de `docs/P3I_CANONICALIZACAO_RUNTIME.md` §7.
- **Nenhum resultado deste bloco autoriza publicação pública.**
