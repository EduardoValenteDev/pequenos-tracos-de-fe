# Palavrinhas do Beni — Análise cruzada (Etapa SDD 6)

> **Feature:** `009-palavrinhas-do-beni` · **Etapa SDD:** 6 (Analyze) · **🚦 Portão 3 (tasks/análise): PENDENTE.**
> **Base:** `content-integrate-coloring-3` @ `e1cffdd`. Fontes cruzadas: [spec-palavrinhas.md](spec-palavrinhas.md) · [plan-palavrinhas.md](plan-palavrinhas.md) · [tasks-palavrinhas.md](tasks-palavrinhas.md) · **código atual do repositório** (read-only).
> **Escopo:** consistência spec↔plan↔tasks↔código **antes** de implementar. Correções **apenas documentais e inequívocas**. Nenhum código/asset/build/`git`; HEAD em `e1cffdd`.

## 1. Método

Verificação read-only dos 20 itens obrigatórios contra os três documentos e o código. Fatos de código foram **confirmados por inspeção** (não presumidos): `brincarStatsService.js` (`sanitizeStats:56`, `applyResult:158`, `applyOvelhaResult:236`, chave `@ptf_brincar_stats_v1`), `CadeAOvelhinhaScreen.js` (`addBonusStars(` = **1** ocorrência), `ovelhaGameService.js` (`computeViewport:108`, `contentRect:123`, `artToPx:140`, `pxToArt:146` — puros), `App.js` (`GestureHandlerRootView:57`; import `:1`), `routes.js`/`AppNavigator.js` (padrão `isInternalToolsEnabled() && <Stack.Screen>`), `FaithIcon.js` (`palavrinhas:'text':57`), bloco Ovelhinha do `scripts/smoke.js` (eval por `new Function`).

Classificação: **Bloqueador** (impede implementar) · **Importante** (corrigir antes de codar) · **Melhoria** (recomendação).

## 2. Matriz de verificação (20 itens)

| # | Item | Resultado | Classe |
|---|---|---|---|
| 1 | Contradições spec/plan/tasks | 2 residuais documentais encontradas e **corrigidas** (R1, R2) | Importante → resolvido |
| 2 | Dependências invertidas | 1 encontrada (T-A4 dependia de T-B4, UI) e **corrigida** (I1) | Importante → resolvido |
| 3 | Tarefas sem critério de aceite | Nenhuma — todas as 27 têm aceite objetivo | OK |
| 4 | Arquivos em blocos diferentes sem justificativa | `PalavrinhasDoBeniScreen.js`/`palavrinhasGameMachine.js` tocados por vários blocos — **construção incremental legítima** (aditiva) | Melhoria (M1) |
| 5 | Risco de import RN/Expo em módulos puros | Proibido explicitamente; reuso de coordenadas exigia decisão → **resolvido** (I2) | Importante → resolvido |
| 6 | Compatibilidade com o smoke atual | Módulos puros sem imports; eval `new Function` viável; `tracadoService` autossuficiente (I2) | OK |
| 7 | Compat. retroativa de `@ptf_brincar_stats_v1` | `sanitizeStats` faz o sub-objeto `palavrinhas` nascer em zero; mesma chave; sem migração | OK |
| 8 | Nenhuma chave persistente nova | T-D1 proíbe; domínio da palavra adiado; `storageKeys.js` intocado | OK |
| 9 | Única concessão de estrela por rodada | T-D2 exige **1** `addBonusStars(` (espelha Ovelhinha, que tem 1) | OK |
| 10 | Teto diário compartilhado | T-D1 reusa `BRINCAR_DAILY_STAR_CAP` + `starsToday` compartilhado | OK |
| 11 | Plano determinístico × adaptação do Diretor | spec §7 + T-A5: Diretor ajusta **apresentação**, nunca `wordId`/`activity` do plano imutável | OK |
| 12 | Máquina pura × efeitos de UI | Máquina emite **tokens de efeito**; tela interpreta; nenhuma animação libera estado crítico | OK |
| 13 | Ordem COMPLETE→MONTE→erros→Resgate→reforço→TRACE | Build: P6→P7→P8; runtime (máquina): raciocínio→(Resgate)→traçado; coerente | OK |
| 14 | Sem dependência das 30–36 imagens antes do Visual 2 | T-E2 gated; **placeholder deve ser asset existente** → **resolvido** (I3) | Importante → resolvido |
| 15 | Uso correto das poses do Beni antes do P13 | Correção 1 aplicada: P4/P6/P7 só 7 poses; órfãos registrados+usados no **P9**; P13 sem Beni | OK |
| 16 | Proteção App.js/storageKeys/achievements/acesso/paywall | Listados como proibidos em plano+tasks; nunca tocados na v1 | OK |
| 17 | Rotas dev só sob gate de ferramentas internas | Jogo, TraceLab e AssetGallery sob `isInternalToolsEnabled()` (T-B1, T-C4, T-F1) | OK |
| 18 | Testes iPhone **e** Android para o traçado | T-C4 exige ambos os aparelhos no Portão Técnico | OK |
| 19 | Telas pequenas, Safe Area, movimento reduzido | T-B2 (SafeArea), T-C4 (telas pequenas + mov. reduzido), spec §20 | OK |
| 20 | Riscos de geometria/cobertura/checkpoints/coordenadas/tolerância | Documentados (spec §11, plan §11, T-C2); mitigados por protótipo isolado | OK |

## 3. Achados e tratamento

### Bloqueadores — **0**
Nenhum. As duas correções que o Eduardo condicionou ao Portão 2 (ordem de registro das poses do Beni; quantidade 30–36 de imagens) já foram incorporadas à spec e ao plano **antes** desta análise.

### Importantes — 5 (todos **corrigidos** nesta etapa, apenas documental)

- **I1 · Dependência invertida (tasks).** `T-A4` (módulo **puro** de brilho/fila) listava dependência de `T-B4` (tarefa de **UI** MONTE). Módulo puro não pode depender de UI. **Correção:** dependência de `T-A4` passa a `T-A2, T-A3`; nota de que é agendada na Fase 3 sem acoplamento a T-B4. *(tasks: linha da sequência + corpo de T-A4.)*
- **I2 · Reuso de coordenadas × smoke (plan).** `tracadoService` reusaria `computeViewport/contentRect/artToPx/pxToArt` de `ovelhaGameService`; importar de lá quebraria o eval `new Function` (que remove imports). **Correção:** decisão registrada — `tracadoService` **autossuficiente** (própria função arte↔px no protótipo) ou extração futura para `src/services/geo2d.js` puro; **proibido** importar de `ovelhaGameService`. *(plan §3.)*
- **I3 · Placeholder de imagem (plan).** `T-B2` usa "placeholder" antes do P13; se apontar para asset inexistente, viola "nenhum `require` inexistente". **Correção:** placeholder **deve** ser um asset já existente (ex.: `assets/avatar/avatar_star.png` ou pose do Beni) + rótulo textual; nenhuma palavra exige imagem inexistente antes do P13. *(plan P4 riscos.)*
- **R1 · Residual "estilo → Portão 1" (spec §10.2 rodapé).** Texto antigo dizia "Estilo (avatar vs flashcard) → decisão do Portão 1" e "30 exigem arte nova". **Correção:** atualizado para padrão único (decidido) + **30–36** + avaliação das 6 no Portão Visual 2. *(spec §10.2.)*
- **R2 · Residual "10 letras" no protótipo (spec §23, bloco 3.8).** Dizia "Protótipo de traçado (10 letras)" / `letterPaths.js (10 letras)`, conflitando com a decisão A/O/L. **Correção:** atualizado para **somente A, O, L**, com expansão só após o Portão Técnico. *(spec §23.)*

### Melhorias — 3 (recomendações; não bloqueiam)

- **M1 · Toques incrementais em arquivos compartilhados.** `PalavrinhasDoBeniScreen.js` e `palavrinhasGameMachine.js` são estendidos por vários blocos. É legítimo (construção incremental), mas cada adição deve ser **aditiva** (sem retrabalho/regressão); recomenda-se, na Etapa Implement, revisar o diff acumulado por bloco.
- **M2 · Extrair cedo utilitários compartilhados.** Avaliar extrair o **util de animação** (bounce/pulse) e o **`geo2d.js`** logo (P5/P9) para evitar duplicação e facilitar testes puros.
- **M3 · Nomear o placeholder definitivo na Implement.** I3 fixa a regra (asset existente); na Implement, escolher e documentar o asset concreto do placeholder para as palavras ainda sem arte.

## 4. Conclusão de consistência

Após as correções desta etapa, **spec ↔ plan ↔ tasks ↔ código estão consistentes**: 0 bloqueadores, 5 importantes resolvidos, 3 melhorias registradas para a Implement. Os invariantes críticos estão cobertos por tarefas verificáveis: módulos puros sem RN/Expo (compatíveis com o smoke), chave `@ptf_brincar_stats_v1` retrocompatível sem chave nova, concessão única de estrela, teto diário compartilhado, plano imutável vs. ajuste do Diretor, máquina pura vs. efeitos de UI, poses do Beni corretas antes do P13, imagens só após o Portão Visual 2 (30–36 + manifesto 36/36), rotas dev sob gate, traçado testado em iPhone e Android, e proteção de `App.js`/`storageKeys.js`/`achievements.js`/acesso/paywall.

**Recomendação:** aprovar o Portão 3 (tasks/análise) e prosseguir para a Etapa Implement começando pela Fase 0 (T-A1 → T-A2 → T-A3), respeitando os 5 portões humanos.
