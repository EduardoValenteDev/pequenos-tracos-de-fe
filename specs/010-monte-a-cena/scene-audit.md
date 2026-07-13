# Monte a Cena — Auditoria de Cenas (M0)

> Auditoria **read-only** de `assets/stories/<storyId>/scenes/` (ilustradas). **Nunca** folhas de colorir (`.../coloring/`). Nenhuma imagem alterada/convertida/copiada.

## 1. Inventário (fato)

- **20 histórias × 10 cenas = 200 ilustrações** em `assets/stories/<storyId>/scenes/<storyId>_scene_NN.webp`.
- **Formato:** WebP · **Dimensões:** **1122×1402** · **Razão:** **0.800 = 4:5** (retrato) · Peso ~100–312 KB/cena.
- **Compatível de fábrica** com o tabuleiro 4:5 e o pipeline `contentRect`/`computeViewport` já usado (mesma dimensão dos backgrounds da Ovelhinha).
- `assets/games/` hoje contém só `cade_a_ovelhinha/` — **nenhum** asset de Monte a Cena.

## 2. Peso por história (proxy objetivo de complexidade — KB min/média/máx)

| História | Cenas | KB min/méd/máx | Complexidade (proxy) |
|---|---|---|---|
| daniel_lions | 10 | 125/150/171 | **Baixa** |
| good_samaritan | 10 | 142/185/226 | Baixa-média |
| noah | 10 | 148/187/228 | Média |
| jesus_children | 10 | 172/209/231 | Média |
| moses_red_sea | 10 | 186/216/239 | Média |
| jonah_big_fish | 10 | 153/222/276 | Média-alta |
| creation | 10 | 103/223/312 | **Alta** (variação grande) |
| david_goliath | 10 | 181/231/300 | **Alta** |

*(Peso não é qualidade nem adequação de corte — é sinal de detalhe. A adequação real (rostos/regiões protegidas) exige **inspeção visual** no M1.)*

## 3. Método de auditoria (M0R — inspeção VISUAL REAL, não só metadados)

Inspeção visual efetiva (contact sheets renderizados a partir das WebP + grades provisórias) foi realizada em **8 histórias** — ver §11 (caminhos temporários fora do repo). **Nenhuma imagem do repositório foi copiada/alterada/convertida.** Além dos metadados (dimensão/peso), avaliou-se por olho: foco principal · rostos · personagens · mãos · objetos narrativos · áreas uniformes · contraste · detalhe · cortes em 2×2/2×3/3×3 · legibilidade de cada peça · risco de peça "só céu/chão/água" · risco de **rosto atravessado** · risco de objeto narrativo mal dividido.

### Classificação por cena (ETAPA 5)
- **APROVADA** — visual **e** narrativamente liberada. *(Nenhuma cena atinge este estado **definitivamente** neste M0: a liberação narrativa é do M3/fundador e está em fluxo.)*
- **CONDICIONAL** — boa para puzzle no visual, **mas** com pendência narrativa/visual/de substituição a confirmar.
- **QUARENTENA** — não entra em spike/piloto/lançamento.

### Descoberta visual central (M0R)
Nos três finalistas, uma **grade UNIFORME cruza o rosto do personagem focal** (Noé sempre próximo de uma linha de terço). **Conclusão:** grades uniformes **não** são seam-safe; o gerador **precisa deslocar as linhas de corte** para fora das `protectedRegions` (rosto/cabeça). Isso **valida** a exigência de "divisões deslocadas dentro de limites controlados" (ver `architecture-decision.md §4`) e é o **teste central** do spike.

### Gate narrativo (CRÍTICO — decisão do fundador/M3)
Governado por revisão bíblica (`docs/biblical-review/…`, `docs/SPRINT_19_2_*`) + estado de mídia (`mediaReadyService`, `stories.js status`), **em fluxo** (reancoragem **renumerou** cenas; há assets em **quarentena**). Só há **3 histórias com `status: available`** em `stories.js`: **Noé**, **Davi e Golias**, **Jesus e as Crianças**. As demais estão **`coming_soon`** → **excluídas** do piloto até liberação. **Toda recomendação de piloto abaixo é CONDICIONAL à confirmação M3** (não há prova de APROVADA acessível neste bloco).

## 4. Ficha de auditoria por cena (a preencher no M1, com inspeção visual)

Campos obrigatórios por cena candidata: `storyId` · `sceneId` · `caminho` · `dimensões` · `proporção` · `peso` · `composição` · `contraste` · `complexidade` · `áreas vazias` · `rostos` · `elemento central` · `adequação 4 peças` · `adequação 6 peças` · `adequação 9 peças` · `risco de cortes` · `narrativa aprovada (M3)` · `observações`.

*(Preencher com inspeção visual — este bloco não faz julgamento visual às cegas; registra o método.)*

## 5. Candidatas (12 — pós-inspeção visual; **narrativa CONDICIONAL a M3**)

> **Daniel e os Leões REMOVIDO** de toda recomendação (ver §7). Prioriza `available` (Noé, Davi) para o **trio técnico** do spike; demais entram só quando o M3 liberar. **Trio técnico ≠ piloto de produto** (ver §6.1).

| # | storyId | sceneId | Compl. | `status` | Classe | Nota visual (inspecionada) |
|---|---|---|---|---|---|---|
| 1 | noah | noah_scene_01 | Baixa | available | **CONDICIONAL** | Noé central-esq + vila + árvore; 1 rosto (Noé); ótima p/ 4 |
| 2 | noah | noah_scene_04 | Média | available | **CONDICIONAL** | Noé esq + girafa/elefante/ovelhas/coelhos + arca; muitos focos → 6 |
| 3 | noah | noah_scene_03 | Alta | available | **CONDICIONAL** | construção da arca; 2 clusters de rosto (Noé esq + família dir); base de madeira segura → 9 |
| 4 | noah | noah_scene_06 | Baixa-méd | available | CONDICIONAL | arca na praia; poucos rostos; risco de céu uniforme no topo |
| 5 | noah | noah_scene_10 | Média | available | CONDICIONAL | arco-íris + família; **vários rostos** (família) → corte cuidadoso |
| 6 | david_goliath | david_goliath_scene_01 | Baixa-méd | available | **CONDICIONAL** | Davi (menino) + ovelhas + colinas; gentil (sem violência); 1 rosto |
| 7 | david_goliath | david_goliath_scene_07 | Média | available | CONDICIONAL | Davi ajoelhado no riacho pegando pedras; água+rochas+flores; 1 rosto |
| 8 | david_goliath | david_goliath_scene_03 | Alta | available | CONDICIONAL | acampamento (rei+soldados+Davi); **muitos rostos** → 9 difícil |
| 9 | david_goliath | david_goliath_scene_10 | Média | available | CONDICIONAL | Davi + exército ao fundo; muito céu (risco de peça só-céu) |
| 10 | good_samaritan | good_samaritan_scene_02 | Baixa | coming_soon | CONDICIONAL | menino caminhando na estrada; foco único + paisagem (estilo de arte difere) |
| 11 | moses_red_sea | moses_red_sea_scene_06 | Média | coming_soon | CONDICIONAL | mar aberto; áreas amplas; poucos rostos (validar quando liberado) |
| 12 | jonah_big_fish | jonah_big_fish_scene_02 | Méd-alta | coming_soon | CONDICIONAL | mar/peixe; foco central forte (validar quando liberado) |

**Excluída da lista:** `jesus_children_*` — inspeção mostrou **densidade altíssima de rostos** (Jesus + muitas crianças) + fundo de folhagem uniforme em **todas** as 10 cenas → quase nenhuma peça seam-safe. **Não recomendada** para corte (salvo Fácil 4 com corte muito cuidadoso; alto risco).

## 6. Trio técnico candidato do Architecture Spike (3 cenas — de `available`, CONDICIONAL a M3)

> **Trio TÉCNICO, não piloto de produto** (M0F). Estas 3 cenas de Noé existem para **estressar o motor** (composição simples/intermediária/complexa · 4/6/9 peças · `protectedRegions` · seams · memória · desempenho) — **não** para congelar o que a criança verá. O **piloto de produto** está em §6.1.
> **Não são "condicionadas a inspeção futura"** — a inspeção visual **foi feita**. A única condição restante é a **confirmação narrativa M3** (nenhuma é provably APROVADA neste bloco). Se o M3 reprovar alguma, usar a **reserva** correspondente.

| Papel | storyId | sceneId | Caminho | `status`/M3 | Motivo | Dif. permitidas | protectedRegions (norm. aprox.) | Linhas de corte aceitáveis | Riscos | **Reserva** |
|---|---|---|---|---|---|---|---|---|---|---|
| **Simples** | noah | noah_scene_01 | `assets/stories/noah/scenes/noah_scene_01.webp` | available / **M3 a confirmar** | 1 rosto, foco claro, paisagem legível | 4, 6 | rosto/cabeça de Noé ≈ **x[0.28–0.52] y[0.12–0.34]**; grupo de vila (dir, pequeno) ≈ x[0.72–0.98] y[0.42–0.55] | vertical **deslocada p/ direita do rosto** (~x0.60); horizontal **abaixo do rosto** (~y0.62) | grade uniforme corta o rosto (exige deslocamento) | david_goliath_scene_01 |
| **Média** | noah | noah_scene_04 | `assets/stories/noah/scenes/noah_scene_04.webp` | available / **M3 a confirmar** | vários focos (Noé, arca, girafa, elefante, ovelhas) → 6 | 4, 6 | rosto de Noé ≈ **x[0.22–0.42] y[0.30–0.46]**; cabeças de animais (secundário) | vertical à **direita** do rosto (~x0.44); grade 3×2 evitando o rosto | rosto de Noé no terço-esq (deslocar seam) | david_goliath_scene_07 |
| **Complexa** | noah | noah_scene_03 | `assets/stories/noah/scenes/noah_scene_03.webp` | available / **M3 a confirmar** | detalhe rico (madeira/ferramentas) legível → **stress 9** | 6, 9 | Noé ≈ **x[0.30–0.52] y[0.28–0.46]**; família (mulher+criança+homem) ≈ **x[0.62–0.98] y[0.42–0.62]** | topo (arca/céu) e base (madeira) livres; verticais deslocadas em torno dos **2 clusters** de rosto | **2 clusters de rosto** (mais difícil) — bom teste do gerador | david_goliath_scene_03 |

Se **não** houver 3 cenas plenamente seguras após o M3, **reduzir o trio técnico a 1–2** (qualidade > quantidade). Hoje há **3 candidatas visualmente sólidas** (Noé 01/04/03), todas pendentes de sign-off narrativo.

### 6.1 Piloto de produto (NÃO congelado neste bloco)

O **piloto de produto** (cenas user-facing) ocorre **após** a aprovação **técnica** (M1) **e narrativa** (M3) e deverá, **preferencialmente, ter três cenas de histórias diferentes** (variedade para a criança) — **não** o trio técnico de Noé. **Sua seleção NÃO é congelada aqui.**

### 6.2 Uso provisório DEV no M1A (exceção estritamente técnica ao gate M3)

Regra permanente: **nenhuma cena entra no pack definitivo, no piloto de produto ou em versão user-facing sem aprovação narrativa M3.** Exceção **apenas técnica**: o **M1A** pode usar uma cena **visualmente inspecionada** como **fonte provisória em DEV**, antes do fechamento integral do M3, desde que — (1) atrás de **gate interno**; (2) **não** copiada para `assets/games/monte_a_cena/scenes/`; (3) **não** declarada narrativamente aprovada; (4) **não** gera texto narrativo final; (5) **não** entra no Mural definitivo; (6) **não** publicada; (7) **descartável/substituível**; (8) **sem** conflito bíblico conhecido; (9) **Daniel proibido**; (10) reprovação posterior do M3 **invalida imediatamente** o uso. **Preferencial:** `noah_scene_01`, **só se** a verificação inicial confirmar que **não** está errada/duvidosa/em substituição/quarentena — caso contrário **não usar** e **parar para diagnóstico**.

## 7. Cenas removidas / QUARENTENA

- **REGRA DE DANIEL (obrigatória):** **NENHUMA** cena de `daniel_lions` no spike/piloto/lançamento enquanto não houver confirmação **explícita e documental + visual** de que (1) a idade visual de Daniel está correta, (2) a cena passou na auditoria narrativa, (3) não repete o **"Daniel jovem indevido" já identificado**. `daniel_lions_scene_04` **REMOVIDA** da recomendação anterior.
- **Excluir sempre:** cena errada · duvidosa · em substituição · personagem incorreto · cronologia incorreta · pertencente a pack `coming_soon` não liberado · pendente no M3 · **sem confirmação visual**.
- **QUARENTENA:** quaisquer assets da reancoragem em quarentena — **nunca** usar (e **nunca** `git restore`).

## 8. Pipeline de imagem (ETAPA 12 — planejar, **não executar**)

1. **Preservar** a imagem original (`assets/stories/.../scenes/*.webp` intactas). 2. Gerar **cópia derivada específica do jogo**. 3. Armazenar em **`assets/games/monte_a_cena/scenes/`**. 4–14. Validar nitidez/contraste/dimensão/peso; **impedir distorção/crop**; **manter 4:5**; **manter hash da origem** + registrar `sourcePath`.

**Preferência inicial:** **1024×1280** (4:5), **WebP de alta qualidade** (ou **lossless** quando a compressão gerar artefatos nas bordas de corte). **Testes objetivos de compressão a definir:** SSIM/PSNR mínimo vs. original; inspeção de **artefatos nas bordas dos cortes**; peso-alvo por cena; comparação q80/q90/lossless. **Nenhuma conversão neste bloco.**

**Estrutura proposta (sem criar):**
```
assets/games/monte_a_cena/
  scenes/
    <storyId>_<scene>/         # derivado do jogo
      image.webp               # 1024×1280 (4:5)
  manifests/
    <storyId>_<scene>.<dif>.json   # geometria por seed/versão (fora do app)
```

## 9. Estimativas para a meta de conteúdo (ETAPA 20)

- **Configurações por cena:** até **3** (Fácil/Médio/Difícil) × 1 manifesto cada = até 3 manifestos + 1 imagem derivada. QA por cena ≈ inspeção visual + verificação geométrica (seams/regiões) + teste em 1–2 aparelhos.
- **Impacto de APK:** **1 imagem derivada/cena** (WebP ~150–300 KB) + manifestos JSON (leves). 12 cenas ≈ ~2–4 MB de imagem + KBs de manifesto (arquitetura C, **sem** N sprites). Arquitetura B multiplicaria por nº de peças.
- **Variedade/repetição:** 12 cenas de histórias distintas dão boa variedade inicial; com 3 cenas/partida e reconsulta de limite, a repetição percebida é baixa no MVP; expandir para 15/24 reduz ainda mais.

---

## Changelog M0F (2026-07-13)

- **Correção 1 — trio técnico ≠ piloto de produto:** §6 renomeado para **"Trio técnico candidato do Architecture Spike"**; o trio de Noé (01/04/03) estressa o motor (composição/peças/`protectedRegions`/seams/memória/desempenho) e **não** é o piloto de produto. **§6.1** define o **piloto de produto** (após M1+M3, preferencialmente 3 histórias diferentes, **não congelado aqui**).
- **Correção 2 — uso provisório DEV (§6.2):** exceção estritamente técnica ao gate M3 para o M1A (10 condições; atrás de gate interno; sem cópia para `assets/games/...`; descartável; **Daniel proibido**; reprovação M3 invalida). Preferencial `noah_scene_01` só se não estiver errada/duvidosa/em substituição/quarentena — senão parar para diagnóstico.
- **Terminologia:** ocorrências de "piloto" que designavam o trio técnico foram ajustadas para **"trio técnico"**; o gate narrativo M3 e a **regra de Daniel** (quarentena) permanecem inalterados.
- **Pack próprio:** distribuição em `assets/games/monte_a_cena/scenes/` (derivado, §8) mantida; consome camada **DERIVED** (ver `architecture-decision.md §5.5`). Nenhuma cópia/derivação criada neste bloco.
