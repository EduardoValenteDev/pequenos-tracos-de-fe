# Especificação — Monte a Cena (M0)

> **Status:** DRAFT · aguardando **Portão 1** da especificação. Documento **SÓ documentação** — não implementa nada.
> **Branch:** `feature/monte-a-cena-spec` (a partir de `content-integrate-coloring-3` @ `dd8841c`). Não publicada.
> **Diretório:** `specs/010-monte-a-cena/` (próximo número livre após `009-palavrinhas-do-beni`).
> **Companheiros:** [`architecture-decision.md`](./architecture-decision.md) · [`scene-audit.md`](./scene-audit.md) · [`m1-spike-plan.md`](./m1-spike-plan.md).

## 1. Nome e conceito (congelados)

- **Nome:** **Monte a Cena**.
- **Conceito:** a criança ajuda o **Beni** a **restaurar cenas das histórias bíblicas** que se "desmontaram". A atividade principal é **montar quebra-cabeças** usando as **ilustrações bíblicas do próprio projeto** (`assets/stories/<storyId>/scenes/`, WebP 1122×1402, razão 4:5 — ver `scene-audit.md`).
- **O jogo NÃO é** (proibições congeladas): quiz · jogo de ordenar histórias · modo infinito · competição de tempo · moedas · ranking · vidas · energia · **rotação de peças**.

## 2. Mecânica principal (congelada)

1. A cena aparece **completa**. 2. As **linhas das peças** aparecem. 3. As peças **se separam** visualmente. 4. As peças vão para a **área de origem** (bandeja/berço). 5. A criança **arrasta ou seleciona** uma peça. 6. A peça **encaixa magneticamente** no alvo correto. 7. A cena é **restaurada**. 8. A **imagem completa** é revelada. 9. O **Beni conecta** a cena à história. 10. A cena entra no **Mural de Aventuras**.

## 3. Dificuldades (congeladas — números finais só após o piloto M1)

| | Peças | Bandeja/berço | Referência | Snap | Extras |
|---|---|---|---|---|---|
| **Fácil** | **4** | Beni entrega **1 peça por vez** | **Imagem fantasma permanente** no tabuleiro | **Amplo** | **1ª peça demonstrada** |
| **Médio** | **6** | Bandeja **compacta** | **Miniatura** + **botão Espiar** | **Intermediário** | Sem fantasma permanente |
| **Difícil** | **9** | Todas as peças disponíveis | **Prévia inicial** + **botão Espiar** | **Mais preciso, ainda infantil** | **Cena Surpresa** ocasional; sem fantasma |

Nem toda cena aceita todas as dificuldades — a adequação (4/6/9) é decidida por cena no `scene-audit.md` (regiões protegidas / corte semântico).

## 4. Regras gerais (congeladas)

1. **Sem rotação** no lançamento. 2. **Sem cronômetro regressivo**. 3. **Sem derrota**. 4. **Sem zoom/pan no tabuleiro** no MVP. 5. Tempo **pode ser medido internamente** (não punitivo). 6. **3 cenas por partida** (sujeito a validação de duração no piloto). 7. **Estado salvo após cada encaixe**. 8. **Continuar** uma partida **não consome** nova rodada. 9. Uma partida concluída concede **no máximo 1 estrelinha**. 10. **Limite oficial compartilhado: 2 brincadeiras/dia** no Plano Grátis (`brincarDailyService`). 11. **Plano Família ilimitado**. 12. **Dev-gated** inicialmente.

## 5. Princípios de experiência (ETAPA 4)

O jogo é: **calmo · tátil · artesanal · visualmente premium · fácil de entender · sem pressão · sem punição · com progresso visível · com autonomia da criança · com o Beni como guia (não solucionador)**.

**Não pode depender de:** texto longo · leitura avançada · precisão adulta · velocidade · áudio obrigatório · haptics obrigatórios · **cor como única indicação** (usar forma/brilho/posição além da cor).

## 6. Papel do Beni — máquina comportamental (ETAPA 5, sem implementar)

**Estados mínimos:** `entrada` → `apresentando_cena` → `entrega_primeira_peca` → `observando` → `incentivo` → `oferta_ajuda` → `indicacao_estrategia` → `celebracao_peca` → `celebracao_cena` → `colocacao_mural` → `conexao_historia`.

**Regras:** (1) Beni **nunca cobre** o tabuleiro; (2) **nunca intercepta** o toque das peças; (3) **não fala após todo encaixe**; (4) usa **cooldown de falas**; (5) reage **principalmente a marcos** (1ª peça, metade, última, cena concluída); (6) **não resolve automaticamente** sem consentimento; (7) a **ajuda máxima ainda exige uma ação** da criança; (8) respeita **movimento reduzido**; (9) respeita **sons desativados**; (10) **falha de áudio não bloqueia**.

### Dica temática — "Luz do Beni" (progressão sugerida; tempos/tentativas NÃO congelados até o piloto)

- **Nível 1:** a **peça correta brilha** discretamente (na bandeja/berço).
- **Nível 2:** o **encaixe correto pulsa** (destino no tabuleiro).
- **Nível 3:** um **rastro** liga peça e destino.
- **Nível 4:** o **Beni leva a peça para perto** do destino, e a **criança conclui** o encaixe (consentimento + ação final da criança).

Gatilho por combinação de **erros elegíveis** e **tempo ativo na mesma cena** (calibrar no M1; reusar o padrão de dicas por erros da Ovelhinha).

### Poses do Beni (M0R — SEM novo asset)

O jogo **reutiliza as 11 poses já existentes** do `BeniAvatar` (`avatarBase`, `acenando`, `ensinando`, `celebrando`, `celebrando2`, `orando`, `comBau`, `atelie`, `descansando`, `apontandoDireita`, `apontandoEsquerda`). **Nenhuma arte nova de Beni é requisito do MVP.** Mapeamento mínimo: entrada→`acenando`; apresentar/estratégia→`ensinando`/`apontando*`; entrega 1ª peça→`apontando*`; celebração peça→`celebrando`; celebração cena→`celebrando2`; conexão/mural→`ensinando`. **Obrigatório** (Núcleo): entrada · entrega da 1ª peça no Fácil · celebração da cena. **Não-interruptivo** (nunca cobre o tabuleiro nem intercepta o toque; cooldown de falas; reage a marcos). Poses adicionais (se algum dia desejadas) são **Pós-MVP**, nunca bloqueiam.

## 7. Gamificação intrínseca (ETAPA 6 — sem moedas/loja/streak/ranking/raridade/loot/energia/vidas/ads)

- **Luz da Cena:** a luminosidade da cena **aumenta** conforme as peças entram (feedback de progresso não numérico).
- **Mural de Aventuras:** cada cena concluída vira um **cartão persistente**. O cartão pode registrar: cena montada · dificuldades concluídas · **montada sem dica** · **montada sem Espiar** · história relacionada. **Selos NÃO dão estrela extra.**
- **Conjuntos narrativos:** agrupar cenas da mesma história; completar um conjunto pode **revelar uma tira narrativa** no mural.
- **Cena Surpresa:** uma cena por partida pode **esconder temporariamente o título** — **sem** alterar a mecânica.
- **Cena Viva:** após a conclusão, **1–2 hotspots opcionais** por cena (brilho · bolhas · ondas · estrelas · folhas · luz). **Não** exige animação completa de personagens.

## 7.5 Camadas de escopo (M0R — o que é obrigatório × candidato × pós-MVP)

Para evitar tratar recurso avançado como MVP obrigatório, o escopo tem **três camadas**. **Só a camada Núcleo é obrigatória** para o lançamento do jogo.

- **NÚCLEO (obrigatório):** montar a cena por **arrasto E tap-to-place** · **Fácil/Médio/Difícil** (4/6/9) · **snap** magnético · **Luz da Cena** (progresso não numérico) · **referência** (fantasma no Fácil, miniatura + Espiar no Médio/Difícil) · **Beni-guia** nos marcos (poses existentes) · **1 estrela/partida** com teto compartilhado · **persistência** técnica (retomar) · **mural** básico (cartão por cena concluída) · acessibilidade (movimento reduzido, som opcional, cor não-única).
- **CANDIDATOS AO LANÇAMENTO (entram se o piloto validar; podem cair sem adiar o jogo):** **Luz da Cena** avançada por peça · **Cena Surpresa** (esconde título) · **selos do mural** (sem/ dica, sem/ Espiar) · **Luz do Beni nível 4** (Beni leva a peça).
- **PÓS-MVP (explicitamente FORA da 1ª entrega):** **Cena Viva** / hotspots animados · **conjuntos narrativos / tiras** · **agrupamentos por história** · **rotação de peças** · **zoom/pan no tabuleiro** · expansão para 15/24+ cenas · qualquer nova arte.

**Nenhum item de "Candidatos" ou "Pós-MVP" bloqueia o lançamento do Núcleo.**

## 8. Referência da imagem (ETAPA 14)

- **Miniatura:** sempre no Médio; opcional/recolhível no Difícil; acessível; **não cobre o tabuleiro**.
- **Espiar (press-and-hold):** pressiona e segura → imagem original aparece **sobre o tabuleiro**; soltar restaura o puzzle; **sem flash**, sem interromper a sessão, **não conta como erro**.
- **Referência ampliada:** toque na miniatura → **modal simples** com a imagem completa + botão de fechar grande; **sem pinch**.
- **Fácil:** usa **imagem fantasma permanente** no tabuleiro.

## 9. Tabuleiro e layout (ETAPA 13)

Quatro regiões: **cabeçalho** · **área do Beni** · **tabuleiro 4:5** · **bandeja/origem das peças**.

O tabuleiro: usa **contain** (nunca `fill`, nunca corta a arte) · ocupa a **maior área possível** · respeita safe area · **mantém proporção** · **não desloca durante o arrasto** · **não rola** junto com a bandeja. *(Reusar `computeViewport`/`contentRect` do padrão da Ovelhinha — 4:5 já suportado.)*

**Modelos de bandeja a comparar (recomendação por dificuldade no `m1-spike-plan.md`):** A) grade fixa · B) paginada · C) carrossel horizontal com arbitragem de gestos. Avaliar conflito entre **arrastar peça × rolar bandeja × tocar peça × manter pressionado Espiar**. **Sem zoom/pan no MVP.**

## 10. Interação de arrasto (ETAPA 15) + alternativa sem arrasto (ETAPA 16, obrigatória)

**Arrasto:** (1) a peça acompanha o dedo na **UI thread**; (2) **sobe levemente** acima do dedo; (3) escala suave ao selecionar; (4) sombra aumenta; (5) `zIndex` máximo; (6) a tela **não rola** durante o arrasto; (7) **sem `setState` por frame**; (8) validação **apenas no drop**; (9) o **drop resolve uma vez**; (10) peça incorreta **retorna** suave; (11) peça correta faz **snap**; (12) peça encaixada fica **imutável**; (13) **duas peças não ocupam o mesmo alvo**; (14) **callbacks antigos não afetam nova cena** (guarda por `sessionId`+`pieceId`). Tolerância **proporcional ao menor lado da peça**, calibrada por dificuldade (números só após o spike).

> **Nota técnica:** sem `react-native-reanimated` instalado, o "seguir o dedo sem `setState`/frame" usa `Animated.event` com `useNativeDriver` para o `transform` da peça arrastada (nativo, sem JS por frame) + `react-native-gesture-handler` para o gesto. Validar fluidez no M1. Ver `architecture-decision.md`.

**Tap-to-place (obrigatória desde o MVP):** (1) tocar na peça → **selecionada**; (2) tocar no destino; (3) correto → peça **anima** até o local; (4) incorreto → **feedback suave**; (5) seleção **cancelável**; (6) **foco acessível preservado**. **Recomendação:** ativar tap-to-place **automaticamente quando "reduzir movimento"/leitor de tela estiver ativo**, e oferecer **alternância explícita** (toggle no Perfil e/ou na entrada) — os dois modos coexistem (não exclusivos).

## 11. Snap e feedback (ETAPA 17)

- **Encaixe correto:** snap magnético curto · **som oficial reutilizado** (`match_success`/`board_complete`) · **haptic leve opcional** (`expo-haptics`) · brilho curto · progresso atualizado · **nenhuma tela interrompe**.
- **Tentativa incorreta:** retorno suave · **sem haptic negativo** · sem tela vermelha · **sem perder pontos** · **sem mensagem de falha** · **Beni não fala a cada erro**.
- **Conclusão:** linhas desaparecem · imagem inteira · **Luz da Cena completa** · cena pode **ganhar vida** (hotspot opcional) · Beni comemora · **frase narrativa curta** · cartão entra no **mural**.

## 12. Estado e persistência (ETAPA 18)

**Máquina de estado conceitual:** `entrada` · `apresentando` · `desmontando` · `preparando` · `montando` · `resolvendo_drop` · `encaixando` · `pausado` · `concluindo` · `cena_revelada` · `transicao` · `resultado` · `erro_recuperavel`.

**Persistir (M0R — modelo SIMPLIFICADO, 14 campos, derivável do manifesto):**

1. `sessionId` · 2. `sceneId` · 3. `difficulty` · 4. `pieceLayoutVersion` · 5. `seed` · 6. `placedPieceIds` (**apenas os ids** das peças já encaixadas — o alvo/posição vem do manifesto pela seed) · 7. `interactionMode` (drag | tap) · 8. `hintLevelReached` · 9. `peekUsed` (bool) · 10. `activeMs` (tempo ativo acumulado) · 11. `matchProgress` (nº encaixadas / total, derivável) · 12. `completedDifficulties` (por cena) · 13. `muralCardIds` (cartões conquistados) · 14. `lastSavedAt`.

**NÃO persistir (M0R — proibições explícitas):** ❌ posição de peça **por frame**; ❌ **coordenada de arrasto** em andamento; ❌ **peça flutuante** (a que está na mão no momento); ❌ **posições livres arbitrárias** de todas as peças na bandeja. As peças **não encaixadas** voltam para a **bandeja gerada pela seed** (ordem pode variar, mas **não** se guarda coordenada livre). Ao retomar, reconstrói-se o estado a partir de `seed` + `placedPieceIds` — **sem** blob de layout.

**NÃO gravar por frame.** Gravar após: **drop · encaixe · pausa · AppState inativo · blur · troca de cena**. Reusar `AsyncStorage`/`expo-file-system` e o padrão de sanitização não destrutiva (como `brincarStatsService`). **Continuar sessão não consome nova rodada.**

## 13. Regras oficiais do app (ETAPA 19 — reuso integral, sem chave nova)

Reusar: `brincarDailyService` · `brincarStatsService` · **teto compartilhado de estrelas** (`BRINCAR_DAILY_STAR_CAP`) · Plano Família · `audioManager` · preferências de som · movimento reduzido.

- **Rodada:** abrir tela **não consome**; escolher dificuldade **não consome**; abrir mural **não consome**; **iniciar nova partida consome 1×**; as **3 cenas não consomem 3×** (1 partida = 1 rodada); **continuar partida salva não consome**; jogar novamente **reconsulta o limite**; abandonar **não concede** estrela.
- **Estrela:** conclusão da partida pode conceder **1** (máx. 1); **dicas não impedem**; **Espiar não impede**; **selos do mural não dão estrela**; **remontar resultado não duplica**. (Molde: `applyInfinitoResult`/`applyOvelhaResult` — novo objeto `monteACena` dentro de `@ptf_brincar_stats_v1`, **sem chave nova**.)

## 14. Meta de conteúdo (ETAPA 20)

**Qualidade > quantidade.** Architecture Spike: **1 cena**. **Trio técnico** do spike: **3 cenas** de Noé (composição simples/intermediária/complexa) — para **estressar o motor**, não é o piloto de produto. **Piloto de produto:** **3 cenas** decididas **após** aprovação técnica (M1) **e** narrativa (M3), **preferencialmente de 3 histórias diferentes** — **não congelado neste bloco** (ver `scene-audit.md §6.1`). Meta user-facing inicial: **12 cenas** de alta qualidade. Expansão: 15/24+ **após o motor aprovado**. Estimativas de esforço/QA e impacto de APK no `scene-audit.md` e `m1-spike-plan.md`. **Não congelar 24 cenas para a 1ª entrega.**

## 15. Desempenho e orçamentos (ETAPA 21 — métricas medidas no M1)

Medir (antes/depois): tamanho da build · Δ APK Android · estimativa AAB · Δ iOS · cold/warm load · memória (antes / 4 / 6 / 9 peças) · FPS no arrasto · frames longos · rerenders React · imagens decodificadas · nº de Canvas · tempo de troca de cena · vazamento após 20 montagens · comportamento em background.

**Requisitos arquiteturais:** 1 imagem atual carregada · no máx. **próxima cena** preloaded · **nenhum `setState` por frame** · só a **peça ativa** muda no drag · **caminhos cacheados** · **nenhuma recriação de geometria por render** · nenhum efeito pesado contínuo · **animações paradas em background** · **cleanup completo** · **nenhum flash da cena anterior**.

## 16. Portões de qualidade (ETAPA 23)

- **Técnico:** deps compatíveis · build Android · build iOS · memória · FPS · bundle · sem crash.
- **Visual:** nitidez · **sem seams** · sombras · bordas · referência · bandeja · Beni · telas pequenas · fontes ampliadas · movimento reduzido.
- **Interação:** peça acompanha o dedo · offset correto · snap justo · retorno correto · **sem conflito de scroll** · toque alternativo · **sem double resolve** · **sem peça presa**.
- **Infantil:** objetivo entendido sem adulto · criança consegue mover · dica compreendida · **Beni não fala demais** · partida **não longa** · sem frustração recorrente · referência é encontrada · conclusão satisfatória.
- **Narrativo:** cena correta · personagens corretos · cronologia correta · texto final correto · **nenhuma cena M3 pendente**.

## 17. Referências cruzadas

- **Arquitetura, motor geométrico, anti-seam, regiões protegidas, stack, riscos:** [`architecture-decision.md`](./architecture-decision.md).
- **Inventário de cenas, 12 candidatas, trio técnico (3 cenas), piloto de produto, uso provisório DEV, exclusões, pipeline de imagem:** [`scene-audit.md`](./scene-audit.md).
- **Plano executável do Architecture Spike M1, testes geométricos:** [`m1-spike-plan.md`](./m1-spike-plan.md).

## 18. Decisões que dependem do fundador (Portão 1)

Nome ✅ (Monte a Cena) · dinâmica/mecânica ✅ (congeladas neste doc) · **arquitetura NÃO congelada** (C-SVG é só a candidata inicial do spike; a decisão é do M1 por evidência, entre C-SVG / B-Sprites / solicitar Reanimated / solicitar Skia / revisar — ver `architecture-decision.md §"Classificação"`) · **trio técnico do spike CONDICIONAL** (Noé 01/04/03 com reservas Davi; **Daniel excluído**; sign-off narrativo M3) · **piloto de produto NÃO congelado** (definido após M1+M3, preferencialmente 3 histórias diferentes — `scene-audit.md §6.1`) · **recursos avançados NÃO são MVP** (só a camada Núcleo do §7.5 é obrigatória) · **persistência simplificada** (14 campos do §12; sem posições livres) · **produção da imagem derivada** (pipeline — confirmar formato/resolução) · **snap/dicas finais** (calibrar no piloto) · **tap-to-place** (modo padrão) · **duração** (3 cenas — validar no piloto).

### Itens que o fundador ainda NÃO autorizou congelar (M0R/M0F)
1. `react-native-svg` como arquitetura **definitiva** — segue como candidata, decidida no M1.
2. As **cenas do piloto de produto** — condicionais a M1 + M3, não congeladas neste bloco (o **trio técnico** de Noé é só para estressar o motor).
3. **Recursos avançados** como MVP obrigatório — ficam em Candidatos/Pós-MVP (§7.5).
4. **Persistência de posições livres** de todas as peças — substituída pelo modelo de 14 campos (§12).

---

## Changelog M0R (2026-07-13)

- **§7.5 Camadas de escopo** (novo): Núcleo obrigatório × Candidatos ao lançamento × Pós-MVP. Recursos avançados (Cena Viva, tiras narrativas, conjuntos, rotação, zoom/pan) **saem** do MVP obrigatório.
- **§6 Poses do Beni** (novo): reutiliza as **11 poses existentes**; nenhum asset novo é requisito; distinção obrigatório × não-interruptivo.
- **§12 Persistência simplificada:** modelo de **14 campos** (só ids de peças encaixadas + seed); **proibições explícitas** (sem posição por frame, sem coordenada de arrasto, sem peça flutuante, sem posições livres arbitrárias).
- **§18 Arquitetura NÃO congelada** + lista dos **4 itens que o fundador não autorizou congelar** (SVG definitivo / 3 cenas / recursos avançados como MVP / posições livres).
- Alinhado com `scene-audit.md` (trio Noé 01/04/03, Daniel excluído) e `m1-spike-plan.md` (M1A–M1D, critérios objetivos).

---

## Changelog M0F (2026-07-13)

- **Correção 1 — trio técnico ≠ piloto de produto:** §14/§17/§18 ajustados. O trio de Noé (01/04/03) é o **trio técnico** do Architecture Spike (estressa o motor); o **piloto de produto** (3 cenas, preferencialmente de histórias diferentes) é definido após M1+M3 e **não é congelado** aqui.
- **Correção 2 — uso provisório DEV:** detalhado em `scene-audit.md §6.2` e `m1-spike-plan.md §0.2` (exceção estritamente técnica ao gate M3 para o M1A; 10 condições; Daniel proibido).
- **Correção 3 — bundle:** o alvo `0` vale **só** para o M1A/C-SVG (delta de deps nativas = 0); o **produto final não** é delta-zero — medição separada de sprites/Skia/Reanimated/assets/12 cenas/APK/AAB/iOS (`m1-spike-plan.md §4.1`).
- **Correção 4 — decode=1:** reclassificado como **alvo preferencial**, não condição isolada; reprovação por **impacto real** (`m1-spike-plan.md §4.1/§5.1`).
- **Não alteradas** as decisões do M0R (escopo Núcleo/Candidatos/Pós-MVP, poses do Beni, persistência de 14 campos, arquitetura não congelada).
