# Tasks + Analyze — 018 · Ativação Controlada do Piloto Colorir 60

> **Etapas SDD:** 5 (Tasks) e 6 (Analyze) · **Base:** `e07e8bc3e7b1091edebec986d47d06c8d3b2ceeb`

---

## 1. Tasks (cronológicas e atômicas)

| # | Task | Arquivo | Saída verificável |
|---|---|---|---|
| T1 | Substituir o literal da flag pela conjunção de dupla cerca, com cabeçalho explicando fail-closed, comparação literal e a proibição de produção | `src/config/featureFlags.js` | flag resolve `false` sob env vazio e `true` só com as duas condições |
| T2 | Criar o perfil `c60-pilot` sem `extends`, interno, iOS + Android, com exatamente duas variáveis | `eas.json` | JSON válido; nenhum perfil existente alterado |
| T3 | Criar o helper de resolução real (`loadModule` com `process` injetado) e as fixtures de env lidas do `eas.json` | `scripts/smoke.js` | resolvedor executável, sem reimplementar a regra |
| T4 | Reescrever as 9 asserções históricas para `c60PilotSealed()`, preservando rótulo e intenção | `scripts/smoke.js` | 9 rótulos históricos mantidos, agora provados por execução |
| T5 | Fechar **L1** (produção resolve `false`) e **L2** (uma condição isolada não ativa) | `scripts/smoke.js` | checks novos |
| T6 | Fechar **L3** (bloco `production` do `eas.json` sem o par) e a exigência de que nenhum perfil não-piloto tenha as variáveis | `scripts/smoke.js` | check estrutural sobre o `eas.json` real |
| T7 | Fechar **L4** (entradas infantis disponíveis com o piloto autorizado; entradas internas ausentes sem `isInternalToolsEnabled()`) | `scripts/smoke.js` | execução de `isColoring60PilotAllowed` e `isInternalToolsEnabled` sob env do perfil |
| T8 | Fechar **L5** (efeito sobre `journeyComplete` e Noé) **sem alterar lógica** | `scripts/smoke.js` | execução real de `storyColoringAvailability` + `storyJourneyService` + fórmula intacta da sequência |
| T9 | Fechar **L6** (verificador de assets segue gate obrigatório separado) e **L7** (`PRODUCTION_FLAGS_CHECKLIST.md` documenta a flag) | `scripts/smoke.js` | dois checks |
| T10 | Controles negativos antitautológicos: mutar o fonte da flag e exigir que as provas caiam | `scripts/smoke.js` | cada CN registra que o mutante **não** sobreviveu |
| T11 | Documentar a política de ativação | `docs/PRODUCTION_FLAGS_CHECKLIST.md` | linha da flag + matriz por perfil + perfil `c60-pilot` |
| T12 | Registrar a decisão | `docs/DECISIONS.md` | decisão com mecanismo, público, hipótese de progresso e proibição de publicação |
| T13 | Fechar a decisão em aberto nº 2 | `docs/P3I_CANONICALIZACAO_RUNTIME.md` §7 | referência atualizada, sem reescrever histórico |
| T14 | Portões: smoke, expo-doctor, verificador C60, parse, diff, LF, contagem | — | todos verdes; total de checks ≥ 4185 |
| T15 | Commits atômicos seletivos | — | 4 commits, `git diff --cached --name-only` exibido antes de cada um |

## 2. Analyze (Etapa SDD 6) — consistência spec ↔ plan ↔ tasks

### 2.1 Cobertura dos requisitos

| Requisito | Task | Critério de aceite |
|---|---|---|
| RF1 (conjunção) | T1 | CA1, CA2, CA3 |
| RF2 (perfil `c60-pilot`) | T2 | CA3, CA4 |
| RF3 (sem ferramentas internas) | T2, T7 | CA8 |
| RF4 (demais perfis fechados) | T5, T6 | CA4, CA5 |
| RF5 (sem herança) | T2, T6 | CA5 |
| RF6 (entradas infantis / internas) | T7 | CA7, CA8 |
| RN1 (`__DEV__ = false`) | T2 | documentado em T11 |
| RN2 (env não é segredo) | T1, T11 | — |
| RN3 (smoke não diminui) | T14 | — |
| RN4 (resolvedor real) | T3, T5, T7, T8 | CA1–CA9 |
| RN5 (verificador separado) | T9 | CA verificador |
| §7 (hipótese de progresso) | T8, T11, T12 | CA9 |
| §6 (escopo proibido) | T14, T15 | CA12 |
| §10 (reversão) | T12 | — |

**Nenhum requisito sem task. Nenhuma task sem requisito. Nenhum critério de aceite sem prova.**

### 2.2 Conflitos verificados

| Verificação | Resultado |
|---|---|
| A spec contradiz o SoT ou a constituição? | Não — é infraestrutura de build, testes e governança |
| O plano introduz dependência nova? | Não |
| Alguma task toca área protegida? | Não — nenhuma toca tela, rota, storage, progresso, catálogo, asset ou áudio |
| Alguma task altera `package.json`/`package-lock.json`? | Não (D12) |
| Alguma task apaga contrato anterior? | Não — T4 preserva rótulo e **fortalece** a intenção |
| Alguma task reduz o total de checks? | Não — T4 substitui metade de asserção, T5–T10 acrescentam |
| Alguma task antecipa a Fase 3 ou o Product Lock da Fase 4? | Não — T8 e T12 registram **hipótese observável**, não regra |
| Alguma task gera build, instalação, push, PR, merge ou tag? | Não |

### 2.3 Risco residual aceito

| Risco | Por que é aceitável |
|---|---|
| O build `c60-pilot` mostrará o Colorir 60 com progresso retroativo | Autorizado pela Ratificação 2 como hipótese observável, com restauração por 1 atividade |
| No Free a arte não é guardada | Autorizado pela Ratificação 3 como comportamento correto do piloto |
| A ausência de `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` no perfil deixa superfícies de pack sem configuração | Inócuo para o C60 (100% local); registrado na documentação para não gerar falso alarme |

**Veredito da análise:** spec, plan e tasks estão consistentes entre si e com as três ratificações. Implementação liberada dentro deste escopo.
