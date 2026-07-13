# Monte a Cena — Plano do Architecture Spike M1 (M0 · corrigido M0R/M0F)

> Plano **executável** do próximo bloco (M1). **Não implementar agora.** Objetivo do M1: **provar (ou reprovar) a arquitetura por evidência** — **nada** está congelado no M0. Estrutura em **4 fases graduadas (M1A→M1D)**; cada fase só avança se a anterior passar nos critérios objetivos. Tudo **dev-gated**.

## 0. Trio técnico candidato do Architecture Spike (M0F — NÃO é o piloto de produto)

> **Distinção crítica (M0F):** o trio abaixo é **técnico** — existe para **estressar o motor**, não para congelar quais cenas a criança verá. O **piloto de produto** (cenas user-facing) é decidido **depois** da aprovação técnica **e** narrativa e **não é congelado neste bloco** (ver §0.1).

- **Composição simples:** `noah_scene_01` (reserva `david_goliath_scene_01`).
- **Composição intermediária:** `noah_scene_04` (reserva `david_goliath_scene_07`).
- **Composição complexa:** `noah_scene_03` (reserva `david_goliath_scene_03`).

**O trio técnico serve para testar:** (1) composição simples · (2) composição intermediária · (3) composição complexa · (4) 4 peças · (5) 6 peças · (6) 9 peças · (7) `protectedRegions` · (8) seams · (9) memória · (10) desempenho. Todas de história `status: available`, **sujeitas a sign-off narrativo M3** antes de qualquer uso **de produto**. Ver `scene-audit.md §6`. **Nenhuma cena de Daniel** enquanto não houver confirmação explícita (idade/auditoria/imagem).

### 0.1 Piloto de produto (NÃO congelado neste bloco)

O **piloto de produto** ocorre **após** a aprovação técnica (M1) **e** narrativa (M3) e deverá, **preferencialmente, ter três cenas de histórias diferentes** (variedade narrativa para a criança). **A seleção do piloto de produto NÃO é congelada aqui** — o trio técnico (todo de Noé) **não** deve ser confundido com o piloto de produto.

### 0.2 Fonte provisória DEV do M1A (exceção estritamente técnica ao gate M3)

Regra permanente: **nenhuma cena entra no pack definitivo, no piloto de produto ou em versão user-facing sem aprovação narrativa M3.** Exceção **apenas técnica**: o **M1A** pode usar uma cena **visualmente inspecionada** como **fonte provisória em DEV**, mesmo antes do fechamento integral do M3, desde que:

1. permaneça **atrás de gate interno** (`isInternalToolsEnabled`); 2. **não** seja copiada para `assets/games/monte_a_cena/scenes/`; 3. **não** seja declarada narrativamente aprovada; 4. **não** gere texto narrativo final; 5. **não** entre no Mural definitivo; 6. **não** seja publicada; 7. seja **descartável e substituível**; 8. **não** possua conflito bíblico conhecido; 9. **Daniel permaneça completamente proibido**; 10. qualquer **reprovação posterior do M3 invalide imediatamente** seu uso.

**Cena preferencial provisória do M1A:** `noah_scene_01` — **desde que** a verificação inicial confirme que **não** está marcada como **errada, duvidosa, em substituição ou em quarentena**. Caso esteja, **não usar** e **parar para diagnóstico**.

## 1. Fases graduadas do M1 (substitui o escopo linear)

- **M1A — Baseline C-SVG (1 cena simples, 4 peças):** motor geométrico offline + testes puros + render + `<ClipPath>` de 1 imagem + drag/tap/snap básicos. **Meta:** provar que o corte por SVG é nítido, sem seam e fluido no caso fácil. *Se M1A falhar → pular para M1C (sprites) sem gastar em stress.*
- **M1B — Stress C-SVG (mesma cena do trio técnico, 6 e 9 peças, Android + iPhone):** memória/FPS/carregamento nos números altos + prova de decodificação (§5) + 2 clusters de rosto (noah_03). **Meta:** provar que o SVG **escala** para 9 peças no device real.
- **M1C — Fallback B-Sprites (SÓ se M1A ou M1B reprovar):** exportar peças da MESMA geometria e medir lado a lado (memória/nº de arquivos/nitidez/seam). **Comparação obrigatória mesmo que o SVG passe** — mas execução aprofundada só se o SVG vacilar.
- **M1D — Decisão de dependência (SÓ se M1A+M1B+M1C forem insuficientes):** apresentar **evidência** e **solicitar aprovação** para **Reanimated** (arrasto na UI thread) ou **Skia** (recorte em Canvas). **Nenhuma instalação sem o portão humano.**

**Resultados possíveis do M1:** (1) C-SVG aprovado · (2) B-Sprites aprovado · (3) solicitar Reanimated · (4) solicitar Skia · (5) interromper e revisar arquitetura.

**No M1 NÃO existe:** card user-facing · daily round · estrela · mural completo · 12 cenas · narrativa final completa. **Continua dev-gated** (rota sob `isInternalToolsEnabled`; sem card na Brincar).

## 2. Sequência do M1 (fases sugeridas)

1. **Motor geométrico offline (script Node fora do app):** gerar manifesto (paths Bézier complementares + regiões protegidas respeitadas) por (cena, dificuldade, seed). Determinístico. **Sem tocar o app.**
2. **Testes puros de geometria** (ver §3) no harness de smoke — **antes** de qualquer UI.
3. **Renderização do tabuleiro** (contain 4:5 reusando `contentRect`) + **recorte por `react-native-svg` `<ClipPath>`** de uma única imagem.
4. **Interação:** drag (gesture-handler + `Animated`/nativo) e **tap-to-place**; snap por `snapPoint` + tolerância por dificuldade; resolução única no drop (guarda `sessionId`+`pieceId`).
5. **Referência/Espiar/Beni mínimo/SFX/haptic**.
6. **Persistência técnica** (AsyncStorage): salvar após drop/encaixe/pausa/blur; retomar.
7. **Painel DEV** (seed, versão do layout, hitboxes, alternar arquitetura, forçar dificuldade, resolver auto — só DEV).
8. **Medição** (§4) + **comparação de arquitetura** (§5).
9. **Builds** Android/iOS internos + relatório dos portões.

## 3. Testes geométricos puros (ETAPA 22 — no `scripts/smoke.js`, molde ovelhaGameService)

Helper puro `monteACenaGeometry` (injetável por seed), validar:
1. **Seed determinística** (mesma entrada → mesmo layout). 2. Mesma entrada gera mesmo layout em execuções distintas. 3. **Bordas complementares** (aresta interna = mesmo path invertido nas duas peças). 4. **União das peças cobre o tabuleiro** (sem sobra). 5. **Sem buracos**. 6. **Sem interseções indevidas**. 7. **Bordas externas retas**. 8. **Tab depth** dentro do limite. 9. **Nenhuma peça degenerada**. 10. **Nenhuma área < mínimo**. 11. **Hitbox válida** por peça. 12. **Centro do alvo válido** (`snapPoint` dentro da célula). 13. **`protectedRegions` respeitadas** (nenhum corte cruza região protegida). 14–16. **Layouts 4/6/9 peças** válidos. 17. **Serialização** (manifesto → JSON → objeto). 18. **Restauração** (round-trip idêntico). 19. **Versionamento** (`pieceLayoutVersion` estável; mudança de versão só por bump explícito).

## 4. Métricas de desempenho a coletar (ETAPA 21)

Tamanho da build (antes/depois) · **Δ APK Android** · estimativa **AAB** · **Δ iOS** · **cold/warm load** · memória (**antes / 4 / 6 / 9 peças**) · **FPS no arrasto** · frames longos · **rerenders React** (instrumentação DEV temporária — remover antes da entrega) · imagens decodificadas · nº de `Canvas` · tempo de troca de cena · **vazamento após 20 montagens** · comportamento em background.

**Alvos arquiteturais a comprovar:** 1 imagem atual carregada · ≤ 1 próxima cena preloaded · **0 `setState`/frame** · só a **peça ativa** muda no drag · **caminhos cacheados** · **0 recriação de geometria por render** · **0 efeito pesado contínuo** · animações **paradas em background** · **cleanup completo** · **0 flash** da cena anterior.

## 4.1 Critérios OBJETIVOS de aprovação do M1 (M0R, ETAPA 13 — valores-alvo)

Cada critério tem número; **verde** = atinge o alvo no **device mais fraco** do teste. Um **vermelho** em M1A/M1B → aciona M1C/M1D (não "passa mesmo assim").

| Dimensão | Métrica | Alvo (verde) | Amarelo | Vermelho |
|---|---|---|---|---|
| **Render** | 1º frame do tabuleiro (9 peças, warm) | ≤ **250 ms** | 250–500 ms | > 500 ms |
| **Arrasto (FPS)** | mediana durante drag de 1 peça, 9 no tabuleiro | ≥ **58 fps** | 50–58 | < 50 |
| **Arrasto (frames longos)** | frames > 32 ms em 10 s de drag | **0** | 1–3 | > 3 |
| **Snap** | latência toque-solto → encaixe visual | ≤ **80 ms** | 80–150 | > 150 |
| **Memória** | pico com 9 peças montadas vs. 0 peças | ≤ **+40 MB** | +40–80 | > +80 MB |
| **Decode** | nº de repr. internas decodificadas por cena (§5) | **1 = alvo preferencial** | 2 (aceitável se memória verde) | reprovar **só** se causar memória/vazamento vermelho |
| **Load (cold)** | abrir a cena do zero | ≤ **900 ms** | 900–1500 | > 1500 |
| **Interação (drop)** | resoluções por drop (guarda) | **1** | — | > 1 (double-resolve) |
| **Seam** | costuras visíveis nas bordas internas (1x/2x/3x) | **0** | — | ≥ 1 |
| **Vazamento** | Δ memória após 20 montagens | ≤ **+5 MB** | +5–15 | > +15 MB |
| **Bundle (só M1A/C-SVG)** | Δ **dependências nativas** vs. baseline | **0** (sem nova lib) | — | > 0 sem aprovação |

> **Decode (M0F):** `decode = 1` é **alvo preferencial**, **não** condição isolada obrigatória. Se a implementação nativa mantiver **mais de uma representação interna**, a arquitetura **pode permanecer candidata** desde que: (1) memória abaixo do orçamento; (2) memória **estabiliza**; (3) **sem crescimento contínuo**; (4) carga dentro do orçamento; (5) troca de cena faz **cleanup**; (6) desempenho permanece **verde**; (7) a **evidência é documentada**. A **reprovação ocorre por impacto real** (memória/carga/vazamento/perf), **não** apenas pela contagem interna de decodes.

> **Bundle (M0F) — o "0" vale SÓ para o M1A/C-SVG:** no M1A o **delta de dependências nativas é zero** (nenhuma nova biblioteca), **nenhuma cópia derivada dentro de `assets/`**, **uso temporário da imagem-fonte** e **nenhum pack final criado**. Isso **NÃO** significa que o **produto final** terá delta zero. Será necessário **medir separadamente**, quando aplicável: (1) **sprites** (se usados); (2) **Skia** (se aprovado); (3) **Reanimated** (se aprovado); (4) **assets derivados** do pack próprio; (5) **12 cenas** user-facing; (6) **APK**; (7) **AAB**; (8) **iOS**.

## 5. Comparação de arquitetura no M1 (ETAPA 8/14 → decisão por evidência)

Prototipar o recorte por **(a) C-SVG `<ClipPath>`** (candidata, sem nova dep) e **medir B-Sprites lado a lado** (mesma geometria exportada). Medir, no device mais fraco, com **9 peças**: FPS no arrasto · memória · nitidez (1x/2x/3x) · **seams** · nº de decodes. **C-SVG só é confirmado** se ficar **verde** na tabela §4.1; caso contrário aciona-se **M1C** (sprites) e, se ainda insuficiente, **M1D** (solicitar Reanimated/Skia com prova). **Nada é "congelado no M0".**

### 5.1 Prova de decodificação da imagem (M0R, ETAPA 14 — método)

Hipótese a **testar, não presumir**: no C-SVG, N `<ClipPath>` sobre a **mesma** `<Image href>` deveriam compartilhar **1 decode**. Método (não remover a investigação): (1) **medir imagem completa**; (2) medir com **4 peças**; (3) **6 peças**; (4) **9 peças**; (5) **repetir montagens**; (6) **trocar cenas**; (7) verificar **estabilização de memória**. `decode = 1` é o **alvo preferencial** (critério §4.1), **não** condição isolada. Se o SVG mantiver >1 representação interna mas a **memória ficar dentro do orçamento, estabilizar, sem crescimento contínuo, com cleanup na troca de cena e desempenho verde**, a arquitetura **permanece candidata** (evidência documentada); a **reprovação é por impacto real**, não pela contagem. Comparar sempre com **B-Sprites** (N arquivos → N decodes esperados) para reponderar memória/nitidez.

## 6. Portões do M1 (resumo — detalhe no `spec-monte-a-cena.md` §16)

- **Técnico:** deps compatíveis · build Android · build iOS · memória · FPS · bundle · sem crash.
- **Visual:** nitidez · sem seams · sombras · bordas · referência · bandeja · Beni · telas pequenas · fontes ampliadas · movimento reduzido.
- **Interação:** peça segue o dedo · offset · snap justo · retorno · sem conflito de scroll · toque alternativo · sem double-resolve · sem peça presa.
- **Infantil:** entende sem adulto · consegue mover · dica compreendida · Beni não fala demais · partida curta · sem frustração · referência achável · conclusão satisfatória.
- **Narrativo:** cena/personagens/cronologia/texto corretos · sem pendência M3.

## 7. Arquivos que provavelmente serão criados no M1 (referência — não criar agora)

- `scripts/monte-a-cena/generate-manifest.js` (motor geométrico offline, Node) + saída em `assets/games/monte_a_cena/manifests/*.json`.
- `assets/games/monte_a_cena/scenes/<cena>/image.webp` (derivado — via pipeline aprovado).
- `src/services/monteACenaGeometry.js` (puro; leitura/validação de manifesto + hitbox/snap; testável no smoke).
- `src/services/monteACenaGameMachine.js` (máquina de estado pura, se necessária).
- `src/screens/MonteACenaScreen.js` (tela DEV-gated).
- `src/navigation/AppNavigator.js` (rota **sob `isInternalToolsEnabled`** — sem card).
- `scripts/smoke.js` (testes geométricos + estruturais).
- **Sem** `brincarStatsService`/daily/estrela/mural no M1.

## 8. Critérios de saída do M1 (para habilitar o M2 user-facing)

Recomendação de arquitetura **confirmada por medição** · geometria/anti-seam **verdes** nos testes puros · **FPS/memória** dentro do orçamento nas 3 cenas do **trio técnico** · interação (drag + tap-to-place) **aprovada no Portão Infantil** · **builds Android/iOS** gerados · **cenas do piloto de produto aprovadas no Portão Narrativo (M3)** (seleção definida no M2, não aqui). Só então planejar M2 (daily/estrela/mural/card user-facing/12 cenas).

---

## Changelog M0R (2026-07-13)

- **Fases graduadas M1A→M1D** substituem o escopo linear: baseline SVG (4 peças) → stress SVG (6/9, Android+iPhone) → fallback sprites (só se SVG reprovar) → decisão de dependência (só se ambos insuficientes, com portão humano). Nada congelado no M0.
- **Trio técnico (§0):** `noah_scene_01/04/03` (reservas `david_goliath_01/07/03`), **CONDICIONAL a M3**. **Daniel EXCLUÍDO** de todo o spike.
- **§4.1 critérios OBJETIVOS** com valores-alvo (render/FPS/frames longos/snap/memória/decode/load/drop/seam/vazamento/bundle) e semáforo verde/amarelo/vermelho no device mais fraco.
- **§5.1 método de prova de decodificação** (SVG deve manter 1 decode para 4/6/9 peças; senão reponderar vs. sprites).
- Comparação de arquitetura reescrita como **decisão por evidência** (5 resultados possíveis), não "congelar C".

## Changelog M0F (2026-07-13)

- **Correção 1 — trio técnico ≠ piloto de produto:** o trio de Noé (§0) é o **trio técnico candidato do Architecture Spike** (estressa o motor). O **piloto de produto** (§0.1) vem após aprovação técnica + narrativa, **preferencialmente com 3 histórias diferentes**, e **não é congelado** neste bloco.
- **Correção 2 — fonte provisória DEV do M1A (§0.2):** exceção estritamente técnica ao gate M3 (10 condições; atrás de gate interno; não copiada para `assets/games/...`; descartável; Daniel proibido; reprovação M3 invalida). Cena preferencial provisória `noah_scene_01` só se **não** estiver errada/duvidosa/em substituição/quarentena — senão parar para diagnóstico.
- **Correção 3 — alvo de bundle (§4.1):** o `0` vale **só** para M1A/C-SVG (delta de **deps nativas** = 0; sem cópia em `assets/`; imagem-fonte temporária; sem pack final). **Produto final ≠ delta zero** → medir separadamente sprites/Skia/Reanimated/assets derivados/12 cenas/APK/AAB/iOS.
- **Correção 4 — decode=1 preferencial (§4.1/§5.1):** `decode=1` é **alvo preferencial**, não condição isolada; a arquitetura pode seguir candidata com >1 representação interna se memória/carga/cleanup/perf ficarem verdes e a evidência for documentada; **reprovação por impacto real**, não pela contagem.
