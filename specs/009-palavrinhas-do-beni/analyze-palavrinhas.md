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

---

## 5. Redefinição do P4 (Portão Visual 1 reprovado 2×) — auditoria e consistência

### 5.1 Causa da reprovação
Não foi só acabamento: a **concepção central divergiu da visão do proprietário**. O jogo foi construído em torno de **imagens representando palavras** — abordagem agora **CANCELADA**. A palavra passa a ser o herói visual; o Beni é o personagem/guia central; não há figura da palavra.

### 5.2 Auditoria do P4 atual (`PalavrinhasDoBeniScreen.js`, não commitado)

| Parte | Classificação | Observação |
|---|---|---|
| Lógica de imagens (`AVATAR_IMG`, `imagemDaPalavra`, `POOL_WORDS`, `figuraMoldura`, `ExpoImage` da figura) | **REMOVER** | abordagem cancelada; nenhuma figura de palavra |
| Restrição do pool às 5 ilustradas | **REMOVER** | usar o banco completo (imagens não são necessárias) |
| Fala "Olhe a figura…" | **REMOVER/REESCREVER** | não há figura (spec §R.6) |
| Layout do "Livro" (card + gradiente + faixa-título) | **ADAPTAR** | manter a linguagem visual, redesenhar em torno da **palavra herói** (sem medalhão de figura) |
| Temporizador (setInterval + `+5s` + `fimPorTempo`) | **ADAPTAR** | trocar pela **reutilização real do contrato dos Pares** (spec §R.5): `countdown_tick`/`time_up_alarm`, moldura de 4 faixas, `addTurboTime`, limpeza de som |
| Alerta vermelho (pulso na borda do card) | **ADAPTAR** | virar **moldura de bordas EXTERNAS** (padrão `MolduraAlerta`) + som de relógio + Beni alerta |
| Balões do Beni (`falaBeni`, `BeniGuideBubble`, `BeniAvatar`) | **REUTILIZAR/ADAPTAR** | manter; expandir falas por estado (entrada/1º erro/2º erro/Resgate/acerto/combo/tempo/fim), sem "figura" |
| `Pressable` das letras (pressed instantâneo) | **REUTILIZAR/ADAPTAR** | manter o toque instantâneo; **adicionar** animação letra→lacuna (acerto) e balanço (erro) |
| Tela final (3 caixas) | **ADAPTAR** | adicionar melhor combo + tempo bônus + **4 botões** + mensagem de participação (spec §R.8) |
| Integração com a máquina pura | **REUTILIZAR** | a Fase 0 (multi-lacuna, brilho, Resgate) permanece; combo/−2s = estado de sessão/UI |
| Cabeçalho vs banner Modo Criador | **ADAPTAR** | compensar a **altura do banner** (spec §R.9), não margem por aparelho |
| Testes P4/P4-rev (smoke) | **ADAPTAR** | virar bloco **P4R**; remover checks de imagem sem reduzir cobertura real |
| Rotas/nav/BrincarScreen (`DEV_ROTAS`, Stack.Screen gated) | **REUTILIZAR** | integração já correta; permanece |

**Itens reutilizáveis:** rotas/nav/entrada da Brincar; máquina + planPartida da Fase 0; balões/poses do Beni (7 registradas); Pressable instantâneo; linguagem visual (tema/sombras/gradientes); contrato de timer dos Pares (helpers puros + sons + moldura).
**Itens a remover:** toda a lógica de imagem por palavra; pool restrito às ilustradas; fala "Olhe a figura"; medalhão de figura; blocos de imagem (Portão Visual 2 / P13 / Portão de Assets / manifesto).

### 5.3 Verificação de consistência da nova direção (docs)

| Item | Resultado |
|---|---|
| Imagem por palavra removida em spec/plan/tasks | **OK** (banner de supersessão + §2.2 + §R + P4R; blocos de imagem cancelados) |
| Acentos/Ç habilitados no COMPLETE (supersede Portão 1 §3) | **Registrado** — muda `enabled` no banco (T-R1) e o validador (T-R2); só o **traçado** de acentuadas fica adiado |
| Banco ≥120 (40/40/40) sem assets | **Proposto** (spec §R.1) → implementação em T-R1 |
| Dificuldade por letras+lacunas+ortografia | **Definido** (spec §R.2) |
| Timer = reuso REAL dos Pares (não imitação) | **Auditado + contratado** (spec §R.5; fontes: `paresGameService.js`, `paresGameMachine.js`, `ParesDoBeniScreen.js`, `PARES_SOUND_EVENTS`, `MolduraAlerta`) |
| Módulos puros continuam sem RN/Expo | **OK** (T-R1/R2/R3 puros; UI só na tela) |
| `@ptf_brincar_stats_v1` sem chave nova / estrela única / teto | **Inalterado** (fora do P4R) |
| Compensação do banner Modo Criador (sem margem por aparelho) | **Contratado** (spec §R.9; padrão `criadorAtivo ? 22 : 0`) |
| Combo/−2s: plano imutável vs estado de sessão | **Separado** — combo/−2s = sessão/UI; se exigir efeito de máquina (2º erro), **volta ao artefato** (T-R3) |
| P5/traçado não iniciados | **OK** (bloqueado até o novo Portão Visual 1) |

### 5.4 Classificação de achados
- **Bloqueadores:** 0 (a redefinição é documental e coerente).
- **Importante:** (1) T-R1 muda `palavrinhasWords.js` (hoje 36, acentuadas `enabled:false`, commit `c906903`) → o P4R **expande e reabilita**; o commit da Fase 0 não é revertido, é **evoluído** por novo commit. (2) Decidir cedo (T-R3) se o "2º erro na mesma lacuna" precisa de efeito de máquina, para não misturar sessão/UI com o núcleo puro.
- **Melhoria:** extrair um helper de timer compartilhável se o P4R e um futuro jogo temporizado divergirem do dos Pares (não necessário agora — reutiliza-se o dos Pares).

### 5.5 Critérios do novo Portão Visual 1 (P4R)
Ver plano §14.5 (10 critérios): sem imagem/contradição; palavra herói; Beni reagindo em todos os estados; toque instantâneo + letra→lacuna; dificuldade por lacunas + acentos no Difícil; tempo (+5s/−2s/alerta vermelho/som/limpeza); combo; sem linha/sem vazio/cabeçalho livre do banner/Safe Area/iPhone+Android; tela final com 4 botões + mensagem de participação; gates verdes + P5 não iniciado + sem pose órfã + sem asset novo.
