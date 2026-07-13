# Monte a Cena — Decisão Arquitetural (M0)

> Documentação. Nenhuma dependência instalada, nenhum código escrito. Base para o **Architecture Spike M1**.

## 1. Auditoria da stack atual (ETAPA 7 — nada instalado neste bloco)

| Item | Instalado? | Versão | Nota p/ Monte a Cena |
|---|---|---|---|
| Expo SDK | ✅ | ~54.0.35 | SDK 54 (alvo do projeto) |
| React | ✅ | 19.1.0 | — |
| React Native | ✅ | 0.81.5 | **New Architecture** + **Hermes** ligados (`app.json newArchEnabled:true`) |
| react-native-gesture-handler | ✅ | ~2.28.0 | **arrasto/gestos** (pan/tap/long-press) — sem nova dep |
| react-native-reanimated | ❌ | — | **AUSENTE** — arrasto "sem setState/frame" via `Animated`+`useNativeDriver` |
| react-native-worklets | ❌ | — | **AUSENTE** (dependência do Reanimated 3) |
| @shopify/react-native-skia | ❌ | — | **AUSENTE** — necessário só se a arquitetura exigir recorte por path em Canvas |
| expo-haptics | ✅ | ~15.0.8 | **haptic leve opcional** no snap |
| expo-image | ✅ | ~3.0.11 | carregamento de imagem (padrão `onDisplay`/recyclingKey da Ovelhinha) |
| react-native-svg | ✅ | 15.12.1 | **`<ClipPath>`/`<Path>` Bézier** → recorte de imagem por caminho **sem Skia** |
| @react-native-async-storage/async-storage | ✅ | ^2.2.0 | persistência de estado leve |
| expo-file-system | ✅ | ~19.0.23 | manifestos/derivados por `file://` (padrão F2) |
| audioManager (expo-audio) | ✅ | ~1.1.1 | SFX oficiais reutilizados (`match_success`, `board_complete`, etc.) |
| react-native-safe-area-context | ✅ | ~5.6.0 | safe area do tabuleiro |
| brincarDailyService / brincarStatsService | ✅ | — | rodadas diárias + estrelas (teto compartilhado) |
| Padrões: movimento reduzido · AppState/blur · persistência | ✅ | — | `AccessibilityInfo` (Palavrinhas) · efeitos de pausa (Ovelhinha) · sanitização não destrutiva (Stats) |

### O que seria NOVO (por arquitetura)
- **Skia** (`@shopify/react-native-skia`): dep **nativa** → exige **rebuild nativo** (Dev Client / EAS), impacto de **bundle** (biblioteca C++/Skia ~vários MB por ABI) e curva de depuração. Compatível com SDK 54/New Arch, mas é a decisão de maior peso.
- **Reanimated + Worklets:** dep **nativa** → rebuild. Melhora o arrasto na UI thread (shared values), mas **não é obrigatória** (há caminho com `Animated` nativo).

**Impacto/risco resumo:** adicionar Skia **e/ou** Reanimated = **rebuild nativo obrigatório** + aumento de APK/AAB por ABI + risco de depuração/EAS. **Evitá-los** mantém o binário leve e o pipeline de build atual intacto.

## 2. Comparação das três arquiteturas (ETAPA 8)

### Arquitetura A — Skia dinâmico
Caminhos gerados **no app**; imagem recortada em runtime pelo Skia; layouts por seed no app.

### Arquitetura B — Sprites pré-renderizados
Script **fora do app** exporta **cada peça** como arquivo transparente (WebP/PNG com alpha); o app só **move arquivos**; manifesto guarda posições/alvos.

### Arquitetura C — Híbrida (candidata inicial do spike; **não** definitiva — ver §"Classificação")
Script **fora do app** gera **caminhos (Bézier) + manifesto** (estáveis, auditáveis, versionados por seed); o app carrega **uma única imagem** e **recorta pela geometria** — **via `react-native-svg` `<ClipPath>` (C-SVG)**, com **Skia (C-Skia) condicionada** e **exportador de sprites (B) como fallback obrigatório comparável**.

| Critério | A (Skia dinâmico) | B (sprites pré-render) | **C (híbrida)** |
|---|---|---|---|
| Nitidez | Alta | Alta (depende do export) | **Alta** (1 imagem-fonte, escala vetorial do clip) |
| Risco de costuras (seams) | Médio (runtime) | **Maior** (bordas exportadas independentes) | **Menor** (bordas complementares compartilham o MESMO path) |
| Memória | 1 imagem + Canvas | N imagens transparentes decodificadas | **1 imagem + N clips** |
| Tamanho APK/AAB | +Skia (nativo) | +N arquivos por cena×dif | **base (sem Skia se usar SVG)** |
| Qtd. de arquivos | 1 img + código | **Muitos** (N peças × cenas × dif) | **1 img/cena + 1 manifesto** |
| Tempo de carregamento | 1 decode + setup Skia | N decodes | **1 decode + parse de paths** |
| Fluidez (arrasto) | Boa (GPU) | Boa (Image nativa) | Boa; validar SVG clip no drag (M1) |
| Complexidade | Alta | Baixa-média | **Média** (geometria offline; runtime simples) |
| Facilidade de testes | Média (runtime) | Baixa (assets binários) | **Alta** (geometria PURA testável no smoke) |
| Reprodutibilidade | Depende do runtime | Fixa (arquivos) | **Fixa** (manifesto por seed, mesmo em todo device) |
| Persistência | Estado do app | Estado + arquivos | **Estado + manifesto** (leve) |
| Compat. Android | ✅ | ✅ | ✅ |
| Compat. iOS | ✅ | ✅ | ✅ |
| Sombra na peça | ✅ (Skia) | ✅ (na exportação) | ✅ (sombra sob o container do clip) |
| Peças curvas (Bézier) | ✅ | ✅ (fixas no export) | ✅ (paths Bézier no manifesto) |
| Manutenção | Média | **Ruim** (reexport por mudança) | **Boa** (regenera manifesto por script) |
| Fallback | — | — | **Exportador de sprites (B)** |

### Classificação (M0R — NENHUMA arquitetura é definitiva no M0)

A disponibilidade da API do `react-native-svg` **não** comprova qualidade de produção. Terminologia oficial:

- **C-SVG** — **candidata inicial** do Architecture Spike (1 imagem + `<ClipPath>` Bézier; **sem nova dep**). É a **hipótese a testar**, não a decisão.
- **B-Sprites** — **fallback OBRIGATÓRIO e comparável** (o spike o mede lado a lado, não só "se falhar"): script exporta cada peça (transparente) da MESMA geometria; app move arquivos.
- **C-Skia** — **alternativa CONDICIONADA**, só após **decisão explícita de dependência** (rebuild nativo + bundle). Não instalar no M0/M1 sem aprovação.
- **Reanimated (+Worklets)** — **alternativa CONDICIONADA** para movimentação na UI thread, **só se** a stack atual (`Animated` nativo + gesture-handler) **não** alcançar os portões de arrasto. Não instalar sem aprovação.

**A decisão é do M1, por evidência** — resultados possíveis: (1) **SVG aprovado**; (2) **sprites aprovados**; (3) **solicitar Reanimated** (com prova); (4) **solicitar Skia** (com prova); (5) **interromper o motor e revisar a arquitetura**. **`react-native-svg` já está instalado (15.12.1, recomendado pelo Expo SDK 54)** e é o ponto de partida barato — mas **não é congelado como definitivo neste M0**. Vantagens estruturais de C (borda complementar compartilhada = anti-seam; geometria auditável offline; 1 imagem/cena) **motivam** começar por C-SVG; a **prova** vem do M1 (ver [`m1-spike-plan.md`](./m1-spike-plan.md), fases **M1A/M1B/M1C/M1D**).

## 3. Motor geométrico — especificação (ETAPA 9, sem implementar)

**Regras:** (1) cada **borda interna é definida uma única vez**; (2) a peça vizinha recebe a **borda inversa exata** (mesmo array de pontos, sentido invertido); (3) **curvas Bézier suaves**; (4) **bordas externas retas**; (5) **sem encaixes pontiagudos**; (6) sem gargalos estreitos; (7) **sem peças minúsculas**; (8) evitar 4 encaixes todos p/ dentro ou todos p/ fora (salvo justificativa); (9) profundidade dos encaixes **proporcional à peça**; (10) geometria em **coordenadas normalizadas da arte** (0..1); (11) **seed fixa** por (cena, dificuldade, versão); (12) **ordem da bandeja pode variar**, geometria **não**; (13) geometria **não varia a cada partida**; (14) **mesmo manifesto em todos os aparelhos**; (15) caminhos suportam **escala sem perda** (vetoriais).

**Manifesto (proposto):** `{ version, sceneId, difficulty, seed, grid:{cols,rows}, pieces:[{ id, targetCell, path:[bezierSegments], bbox, anchor, snapPoint, edges:{top,right,bottom,left: edgeId|null} }], sharedEdges:[{ edgeId, path, pieceA, pieceB }] }`.

### Anti-seam (ETAPA 9)
(1) **borda complementar compartilhada** (fonte única do path por aresta interna); (2) **overscan mínimo controlado** (dilatação sub-pixel do clip para cobrir arredondamento); (3) **tolerância sub-pixel**; (4) testar em **1x/2x/3x**; (5) **sem frestas claras**; (6) **sem sobreposição visível**; (7) **mesma fonte de imagem** para todas as peças; (8) **mesma transformação** para tabuleiro e peças; (9) **amostragem de alta qualidade**; (10) **nenhum filtro que altere cor por peça**.

### Geometria da peça — abas ultrapassam a célula-base (M0R, ETAPA 15)

Tabs (saliências) e blanks (reentrâncias) **ultrapassam** a `cellRect`. Cada peça carrega **8 caixas/pontos** distintos:

1. **`cellRect`** — a célula-base da grade (antes das abas).
2. **`visualBounds`** — a extensão REAL do desenho da peça (inclui tabs) — **é o que a bandeja usa** para reservar espaço (nunca a `cellRect`).
3. **`clipBounds`** — retângulo do `<ClipPath>`.
4. **`overscanBounds`** — `clipBounds` + dilatação sub-pixel (anti-seam).
5. **`hitBounds`** — área de toque ampliada (touch target infantil ≥ mínimo).
6. **`dragAnchor`** — ponto onde a peça "sobe" sob o dedo.
7. **`snapPoint`** — centro do alvo (destino).
8. **`trayFootprint`** — espaço que a peça ocupa na bandeja/berço (derivado de `visualBounds`).

Regras: **nenhuma aba pode ser cortada** pelo container da peça (usar `visualBounds`, não `cellRect`); **nenhuma peça sobrepõe outra** de forma que impeça a seleção na bandeja.

## 4. Regiões protegidas e corte semântico (ETAPA 10)

Cada cena carrega: `focalRect` · `protectedRegions[]` · `keyCharacters[]` · `keyObjects[]` · `safeCutAssessment` · `dificuldadesPermitidas[]`.

**Regiões protegidas (o corte não pode dividir):** rostos · olhos · mãos importantes · **cabeça de Jesus** · crianças · objetos narrativos centrais · texto acidental · símbolos importantes · expressões emocionais.

O gerador **desloca divisões dentro de limites controlados** para não cair em região protegida. Se uma cena **não** comporta 9 peças sem violar regiões protegidas, é aprovada **só para Fácil/Médio**. **Não forçar** toda cena a aceitar todas as dificuldades.

## 5. Estratégia de fallback

Ordem de degradação: **C (SVG clip)** → **C (Skia clip)** se performance exigir → **B (sprites exportados)** se o recorte em runtime for inviável em algum device. O **manifesto de geometria é o mesmo** nos três (o exportador de sprites consome os mesmos paths), garantindo paridade visual.

## 5.5 Camadas de asset — SOURCE / RUNTIME / REMOTE / DERIVED (M0R, ETAPA 9)

**Não generalizar "todas as 200 cenas são WebP 1122×1402" sem distinguir a camada.** Confirmado **por arquivo** apenas o SOURCE:

| Camada | O que é | Confirmado neste M0? | Dimensão/formato |
|---|---|---|---|
| **SOURCE** | `assets/stories/<storyId>/scenes/<storyId>_scene_NN.webp` | ✅ (amostras medidas) | **WebP 1122×1402 (4:5)** nas amostras; o restante segue o padrão mas **exige medição por arquivo** antes do uso |
| **RUNTIME (histórias)** | como a tela de histórias carrega a cena (bundle/`require` ou `file://`) | ⚠️ **não** re-verificado aqui | pode diferir por história/pack |
| **REMOTE (R2 packs)** | packs premium baixados (pipeline F2) | ⚠️ fora do escopo do jogo | **Monte a Cena NÃO depende** de pack remoto |
| **DERIVED (Monte a Cena)** | cópia própria em `assets/games/monte_a_cena/scenes/` | ❌ **não criada** (M1+) | **proposta 1024×1280 WebP** (validar compressão) |

**Monte a Cena consome o DERIVED** (não o SOURCE em produção, não o RUNTIME de histórias, não o REMOTE) — garante offline, path estável e compressão auditável (ver `scene-audit.md §8`).

## 5.6 Prova de decodificação da imagem (M0R, ETAPA 14) — NÃO presumir compartilhamento

Ao repetir a MESMA imagem em vários `<ClipPath>` (C-SVG), o M1 **deve verificar** se resulta em: (a) **1 fonte decodificada compartilhada**; (b) **múltiplas decodificações**; (c) cache interno; (d) crescimento proporcional ao nº de peças. **Registrar memória:** imagem completa · 4 peças · 6 peças · 9 peças · após desmontar · após trocar de cena. **Se a memória crescer excessivamente** (indício de N decodificações), **priorizar sprites (B) ou outra arquitetura**. Método detalhado no `m1-spike-plan.md`.

## 6. Riscos obrigatórios (ETAPA 25)

1. **Custo de Skia no bundle** (nativo, por ABI) — mitigado por C-SVG primário. 2. **Falta de Reanimated** — arrasto via `Animated`+nativo; validar fluidez. 3. **Rebuild nativo** se Skia/Reanimated entrarem. 4. **Seams** — mitigado por borda compartilhada + overscan. 5. **Transparência** (só em B) — alpha correto no export. 6. **Memória das imagens** (1122×1402 decodifica ~6 MB) — 1 atual + no máx. 1 preload. 7. **Conflito de gestos** (arrastar × rolar bandeja × Espiar). 8. **Bandeja pequena** em telas estreitas. 9. **Faces cortadas** — regiões protegidas. 10. **Cenas narrativamente incorretas** — gate M3. 11. **APK já grande** (~upload 902 MB do projeto; usar WebP; `.easignore` de `archive`). 12. **Persistência de shared values** (se Reanimated) — irrelevante sem Reanimated. 13. **Diferenças Android/iOS** no clip/anti-alias. 14. **Haptic indisponível** — opcional, degradação silenciosa. 15. **Movimento reduzido** — desliga animações. 16. **Complexidade de cluster snapping** (encaixes agrupados) — MVP sem cluster. 17. **Escopo do mural** — MVP mínimo. 18. **Excesso de fala do Beni** — cooldown + marcos. 19. **Duração da partida** — validar 3 cenas no piloto. 20. **Expansão 12→24 cenas** — QA por cena.

---

## Changelog M0R (2026-07-13)

- **Reclassificação arquitetural:** nenhuma arquitetura é definitiva no M0. Terminologia **C-SVG** (candidata inicial) · **B-Sprites** (fallback obrigatório e comparável) · **C-Skia** (condicionada, só com decisão de dependência) · **Reanimated** (condicionada). Decisão é do **M1 por evidência** (M1A/B/C/D).
- **Geometria (ETAPA 15):** adicionadas as 8 caixas/pontos por peça (`cellRect`/`visualBounds`/`clipBounds`/`overscanBounds`/`hitBounds`/`dragAnchor`/`snapPoint`/`trayFootprint`); bandeja usa `visualBounds` (abas ultrapassam a célula).
- **Camadas de asset (ETAPA 9):** distinção SOURCE/RUNTIME/REMOTE/DERIVED; só o SOURCE foi medido por arquivo; Monte a Cena consome o DERIVED.
- **Prova de decodificação (ETAPA 14):** exigência de medir memória por nº de peças; sem presumir compartilhamento de decode no SVG.

## Changelog M0F (2026-07-13)

- **C-SVG segue APENAS candidata** (nada congelado): reforçado. A comparação "1 decode + parse de paths" na tabela §2 é **descritiva**; o critério operacional de decode/bundle vive em `m1-spike-plan.md §4.1/§5.1`.
- **Decode=1 = alvo preferencial** (não condição isolada): a arquitetura pode permanecer candidata com >1 representação interna se memória/carga/cleanup/desempenho ficarem verdes (impacto real, não contagem) — ver `m1-spike-plan.md`.
- **Bundle:** delta zero vale **só** para o M1A/C-SVG (deps nativas); produto final medido à parte (sprites/Skia/Reanimated/assets derivados/12 cenas/APK/AAB/iOS).
- **Trio técnico ≠ piloto de produto** e **uso provisório DEV** do M1A: definidos em `scene-audit.md §6/§6.1/§6.2` e `m1-spike-plan.md §0`. **Daniel** permanece proibido/quarentena.
