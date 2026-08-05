# 10 · Matriz de overlays e prioridades

> **Artefato 10 de 11 — E015 · Fase 3G · Reconciliação**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch** | `integrate/colorir-canonical-runtime` |
| **HEAD** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza

**Este artefato não implementa funcionalidade.**

> ## ⛔ ESTE DOCUMENTO **NÃO CONGELA A PRIORIDADE FINAL**
> A Visão 2 (§6) é **proposta preliminar**. A ordem definitiva de precedência entre camadas é
> **decisão de Product Lock**, e nada aqui a antecipa ou vincula.

O artefato tem **duas visões separadas e não intercambiáveis**:

| Visão | O que é | Natureza |
|---|---|---|
| **Visão 1 — Matriz do estado atual** (§5) | O que o código faz **hoje** | `COMPROVADO PELO CÓDIGO` |
| **Visão 2 — Prioridade preliminar** (§6) | O que se **propõe** discutir | `SCHEMA PRELIMINAR` |

---

## 1 · Fontes técnicas principais

| Fonte | Papel |
|---|---|
| `src/components/BeniGuideOverlay.js` | Guia do Beni — modal bloqueante e modo pass-through |
| `src/components/BeniGuideAudio.js` · `src/data/beniGuideAudio.js` | Voz do guia |
| `src/components/BeniAppTour.js` | Tour do aplicativo |
| `src/components/ParentalGate.js` | Portão parental |
| `src/components/UnlockCelebration.js` | Celebração de desbloqueio |
| `src/components/achievements/AchievementUnlockModal.js` | Revelação de conquista |
| `src/components/coloring60/Coloring60MilestoneInvite.js` | Convite de marco C60 |
| `src/components/map/StoryFocusModal.js` | Foco de história no mapa |
| `src/components/ui/ModalPapel.js` | Modal genérico do design system |
| `src/screens/PalavrinhasDoBeniScreen.js:394` | **Arbitragem local** de pausa |
| `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:515,568` | **STR ONB 01** |

---

## 2 · A ausência estrutural — **não existe fila global de overlays**

`git grep -l "<Modal" -- src` retorna **17 arquivos**: 7 componentes e 10 telas. Cada um decide
**por conta própria** quando abrir, e **nenhum consulta os demais**.

| Fato | Estado |
|---|---|
| Existe um serviço, contexto ou fila que arbitre camadas | **não** — `COMPROVADO PELO CÓDIGO` |
| Existe uma noção global de "camada bloqueante ativa" | **não** — `COMPROVADO PELO CÓDIGO` |
| Existe arbitragem **local**, em pelo menos uma superfície | **sim** — `PalavrinhasDoBeniScreen.js:394` |
| Existe colisão **já observada em aparelho** | **sim** — `STR ONB 01` |

> A ausência de fila global é a **causa-raiz comum** de STR ONB 01 e da colisão entre conquista e
> guia. Levantado por E015 como `E015-N27` e reconciliado no artefato 09 como **`DUPLICADO DE
> `P-16``** — o código canônico é **`P-16`**, que já carrega a prova negativa de E011 ("zero
> gerenciador central de overlays em todo `src/`"). A origem `E015-N27` fica preservada como
> evidência acrescentada.

### 2.1 · A única arbitragem que existe é local

```js
// src/screens/PalavrinhasDoBeniScreen.js:394
const pausadoAgora = useCallback(() =>
  estadoRef.current.fase !== FASES.PENSANDO
  || telaBauRef.current
  || inputTravadoRef.current
  || overlayAtivoRef.current
  || pausaModalRef.current
  || pausaPedagoRef.current
  || !!poderFxAtivoRef.current, []);
```

**Sete condições** de pausa, todas locais à tela. É uma solução correta e defensiva — e é
**exatamente o padrão que uma fila global tornaria desnecessário replicar** em cada superfície.
— `COMPROVADO PELO CÓDIGO`

---

## 3 · STR ONB 01 — a colisão já registrada

`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md:515`, verbatim:

> **STR ONB 01** — *"Guia inicial das Estrelinhas e revelação de conquista disputam a mesma
> superfície e a tela fica sem ação possível"* · **P1** · Fase **11** · origem **E005**.

E `:739`, verbatim, o princípio já registrado como direção:
> *"Apenas **uma camada bloqueante** poderá aparecer por vez (mesmo princípio de STR ONB 01)."*

`specs/020-onboarding-first-adventure/spec-onboarding-first-adventure.md:275` referencia o mesmo
caso como *"comportamento oposto ao observado em STR ONB 01 nas Estrelinhas"*, e `:365` registra
E005 como **CONCLUÍDA (registrada, Fase 11)** — ou seja, **registrada, não corrigida**.

> **E015 não reabre, não corrige e não fecha STR ONB 01.** — `COMPROVADO PELO DOCUMENTO`

---

## 4 · A voz do guia sob o modal

`BeniGuideOverlay.js` tem **dois modos**, e a diferença é arquitetural:

| Modo | Linha | Comportamento |
|---|---|---|
| **Modal (padrão)** | `:433` — `<Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={…}>` | **Bloqueante**. Nada por baixo recebe toque. |
| **Embedded (pass-through)** | `:48` — `embedded = false, // Fase 1.1.2: modo PASS-THROUGH (sem Modal). Default = modal bloqueante.` | Camada absoluta **dentro** da tela; o mapa por baixo **recebe pan** (`:429-430`). |

A **voz** é renderizada **dentro** da camada (`:294`):
```js
<BeniGuideAudio key={`guide-audio-${index}-${voiceOn}-${soundsOn}`} audioAsset={stepAudio} />
```
e só existe sob conjunção tripla (`:87-88`): `phase === 'steps' && voiceOn && soundsOn && step.audioKey`.

**Consequência comprovada:** a voz do guia é **filha do modal**. Se outra camada bloqueante se
sobrepuser, a voz continua tocando por baixo dela — não há mecanismo que a interrompa, porque não
há quem saiba que houve sobreposição. — `COMPROVADO PELO CÓDIGO`

**Nota de precisão sobre o botão voltar:** no modo *embedded* o `onRequestClose` do `Modal` não
existe, então o `BackHandler` é interceptado manualmente (`:65-67`). São **dois caminhos de
fechamento distintos** para a mesma camada.

---

## 5 · Visão 1 — matriz do estado atual (19 camadas × 15 campos)

### 5.1 · Tabela A — identidade e natureza (campos 1 a 7)

| # | 2 Camada | 3 Arquivo | 4 Tipo | 5 Bloqueante | 6 Superfície | 7 Disparo |
|--:|---|---|---|---|---|---|
| 1 | Guia do Beni — modo modal | `BeniGuideOverlay.js:433` | `Modal` RN | **sim** | várias | primeira visita à superfície |
| 2 | Guia do Beni — modo embedded | `BeniGuideOverlay.js:48,429` | camada absoluta | **não** (pass-through) | Mapa | primeira visita ao mapa |
| 3 | Voz do guia | `BeniGuideAudio.js` · `:294` | áudio dentro da camada | não | junto do guia | etapa do guia |
| 4 | Tour do aplicativo | `BeniAppTour.js` | sequência guiada | **sim** | global | onboarding |
| 5 | Portão parental | `ParentalGate.js` | `Modal` RN | **sim** | Perfil, Área dos Pais | ação restrita |
| 6 | Celebração de desbloqueio | `UnlockCelebration.js` | `Modal` RN | **sim** | pós-compra, pós-marco | desbloqueio |
| 7 | Revelação de conquista | `achievements/AchievementUnlockModal.js` | `Modal` RN | **sim** | Estrelinhas e outras | conquista atingida |
| 8 | Convite de marco C60 | `coloring60/Coloring60MilestoneInvite.js` | `Modal` RN | **sim** | Livrinho (`creation`) | cenas 2 · 7 · 9 |
| 9 | Foco de história no mapa | `map/StoryFocusModal.js` | `Modal` RN | **sim** | Aventuras | toque no marcador |
| 10 | Modal genérico de papel | `ui/ModalPapel.js` | `Modal` RN | **sim** | design system | chamador |
| 11 | Confete | `Confetti.js` | camada decorativa | **não** | celebrações | acompanha celebração |
| 12 | Modal do mapa | `AdventureMapScreen.js` | `Modal` RN | **sim** | Aventuras | local |
| 13 | Modal da galeria do Ateliê | `AtelierGalleryScreen.js` | `Modal` RN | **sim** | Ateliê | local |
| 14 | Modal do Baú do Beni | `BeniChestScreen.js` | `Modal` RN | **sim** | Baú | local |
| 15 | Modal de Parabéns | `CongratsScreen.js` | `Modal` RN | **sim** | pós-história | local |
| 16 | Modal do Cultinho | `CultinhoEmCasaScreen.js` | `Modal` RN | **sim** | Cultinho | local |
| 17 | Modal de Monte a Cena | `MonteACenaStoryScreen.js` | `Modal` RN | **sim** | Monte a Cena | local |
| 18 | Modais de perfil e listas | `ProfileScreen` · `StoriesScreen` · `StoryDetailScreen` · `TrophiesScreen` | `Modal` RN | **sim** | 4 telas | local |
| 19 | Palavrinhas — pausa e efeito | `PalavrinhasDoBeniScreen.js:174,394` · `PalavrinhasPowerEffect.js` | estado local + overlay | **sim** (local) | Palavrinhas | 7 condições locais |

### 5.2 · Tabela B — comportamento, colisão e estado (campos 8 a 15)

| # | 8 Áudio | 9 Fecha por | 10 Botão voltar | 11 Coexiste | 12 Colisão conhecida | 13 Estado | 14 Prior. atual | 15 Evidência |
|--:|---|---|---|---|---|---|---|---|
| 1 | **sim** (voz) | Pular / concluir | `onRequestClose` | não arbitrado | **STR ONB 01** | ATIVA | **nenhuma** | `COMPROVADO PELO CÓDIGO` |
| 2 | sim (voz) | Pular | `BackHandler` manual | permite pan por baixo | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 3 | — | fim da etapa | n/a | **segue tocando sob outra camada** | **voz órfã** | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 4 | sim | conclusão | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 5 | não | acerto / cancelar | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 6 | sim | toque | `onRequestClose` | não arbitrado | com conquista | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 7 | sim | toque | `onRequestClose` | não arbitrado | **STR ONB 01** | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 8 | sim (fala do Beni) | aceitar / continuar | `onRequestClose` | **mutuamente exclusivo** com celebração genérica (`C60_POST_SCENE`) | — | ATIVA | **local, resolvida** | `COMPROVADO PELO CÓDIGO` |
| 9 | não | toque fora | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 10 | não | chamador | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 11 | não | fim da animação | n/a | decorativa | — | ATIVA | n/a | `COMPROVADO PELO CÓDIGO` |
| 12 | não | local | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 13 | não | local | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 14 | sim | local | `onRequestClose` | não arbitrado | com conquista | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 15 | sim | local | `onRequestClose` | não arbitrado | com conquista | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 16 | não | local | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 17 | não | local | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 18 | não | local | `onRequestClose` | não arbitrado | — | ATIVA | nenhuma | `COMPROVADO PELO CÓDIGO` |
| 19 | sim (efeito) | fim / retomada | local | **arbitragem local de 7 condições** | — | ATIVA | **local, resolvida** | `COMPROVADO PELO CÓDIGO` |

### 5.3 · Leitura da Visão 1

| Constatação | Contagem |
|---|---:|
| Camadas bloqueantes | **16** de 19 |
| Camadas com arbitragem declarada | **2** (C60 e Palavrinhas) — ambas **locais** |
| Camadas sem nenhuma arbitragem | **17** |
| Camadas com colisão já registrada | **3** (guia, conquista, voz órfã) |
| Fila global | **0** |

> **As duas únicas soluções de arbitragem que existem — `C60_POST_SCENE` e o `pausadoAgora` de
> Palavrinhas — foram construídas isoladamente, dentro da sua própria superfície.** São a prova de
> que o problema é reconhecido na prática e resolvido caso a caso.

---

## 6 · Visão 2 — prioridade **preliminar** para Product Lock

> ## ⚠️ **PROPOSTA. NÃO CONGELADA. NÃO VINCULANTE.**
> Serve para dar vocabulário à discussão de Product Lock. A ordem final é decisão do Product Lock.

### 6.1 · Ordem preliminar proposta

| Nível | Classe de camada | Justificativa preliminar |
|--:|---|---|
| **N0** | Portão parental | proteção; nunca pode ser encoberto |
| **N1** | Erro bloqueante e recuperação | a criança não pode ficar presa |
| **N2** | Conquista e desbloqueio | momento emocional único e não repetível |
| **N3** | Convite de marco (C60) | oportunidade ligada à cena que acabou de passar |
| **N4** | Celebração genérica | substituível por N3 — regra já implementada |
| **N5** | Guia e tour | pode esperar; é orientação, não evento |
| **N6** | Foco e modais de consulta | iniciados pela criança |
| **N7** | Decorativos (confete) | nunca bloqueiam |

### 6.2 · Regras preliminares propostas

1. **Uma só camada bloqueante por vez** — princípio já registrado em `v5:739`.
2. **Voz pertence à camada visível.** Se a camada é encoberta ou fechada, a voz para.
3. **Camada de nível mais alto enfileira, não descarta**, a de nível mais baixo.
4. **Nível N0 e N1 interrompem** qualquer camada ativa.
5. **Toda camada declara seu nível** — não há camada sem classificação.
6. **Fechamento tem caminho único**, mesmo quando há dois mecanismos (`onRequestClose` e `BackHandler`).

### 6.3 · O que a Visão 2 explicitamente **não** faz

- Não decide se a fila global será implementada.
- Não decide em qual fase.
- Não altera nenhuma camada existente.
- Não fecha STR ONB 01 nem `P-16` (código canônico da ausência de fila global, origem `E015-N27`).

---

## 7 · Decisões já aprovadas que não podem ser reabertas

1. **STR ONB 01 está registrado como P1, Fase 11, origem E005** — registrado, **não corrigido**.
2. **`C60_POST_SCENE` define duas experiências mutuamente exclusivas** após a conclusão de cena
   (`coloring60StoryMilestones.js:136-172`).
3. **O guia do mapa é pass-through por decisão explícita** (Fase 1.1.2) — o mapa por baixo
   recebe pan.
4. **"Apenas uma camada bloqueante por vez"** é princípio já registrado em `v5:739`.
5. **Marcos C60 nas cenas 2, 7 e 9**, com retomada em 3, 8 e 10.

## 8 · Itens não determinados

1. Se haverá fila global e em que fase.
2. Como a voz deve se comportar sob sobreposição — nenhuma decisão registrada.
3. Se o modo *embedded* se estende a outras superfícies além do mapa.
4. Comportamento das camadas em tela de tablet — ver artefato 07, linha 6.
5. Se as 17 camadas sem arbitragem já colidiram em aparelho — **só STR ONB 01 tem registro**.

## 9 · Fases proprietárias

| Assunto | Fase |
|---|---|
| Prioridade final entre camadas | **Product Lock** |
| Correção de STR ONB 01 | **11** |
| Fila global de overlays, se aprovada | **9** e **11** |
| Conteúdo e copy das camadas | **5** |

---

*Fim do artefato 10 de 11. A prioridade final **não** foi congelada. Nenhuma camada foi alterada.*
