# Bloco 2 · Fase 2A — Inventário e mapa de consumo do bundle (RELATÓRIO)

> Read-only. 6 scripts `assets:*` rodaram exit 0, sem erros. Nenhum arquivo alterado. Branch `content-integrate-coloring-3`, HEAD `e4d2a8a`. **APROVADO por Eduardo (2026-07-07).**

## 1. Inventário por tipo (`assets:inventory`/`assets:budget`)
| Categoria | Arquivos | MB |
|---|---|---|
| colorir | 200 | 277,97 |
| mapas | 60 | 67,38 |
| áudio | 251 | 57,48 |
| cenas | 200 | 33,78 |
| other (mascote) | 15 | 13,68 |
| capas | 20 | 2,87 |
| ui | 10 | 0,91 |
| **TOTAL assets/** | **756** | **454,06** (0 untracked) |

Proxy 454 MB vs meta ~150 MB (headroom −304). Bundle real = N/A sem `expo export`. `assets:guard` OK. `.git`=2150 MB (higiene de repo, fora do bundle).

## 2. Starter × premium
- Starter (`free`, bundle-only): creation, noah.
- Premium (`remote`/`premium`, todas `available`): as 18 restantes.

| Tipo | Starter | Premium (18) |
|---|---|---|
| colorir | 41 MB | ~237 MB |
| cenas | 5 MB | ~29 MB |
| áudio | 8 MB | ~49 MB |
| capas | ~0,3 MB | ~2,6 MB |
| **conteúdo** | **~54 MB** | **~318 MB** |

## 3. Mapa require → asset → superfície
| Registry (requires) | Loader | Superfícies |
|---|---|---|
| storyCovers.js (20) | getStoryCover | StoryCard · StoryFocusModal · mapa · StoryDetail |
| storySceneIllustrations.js (202) | getOfficialSceneIllustration/resolveSceneImageForStory | NarrationScreen · StoryBookScreen |
| coloringImages.js (200) | getColoringImage/useResolvedColoringImage | ColoringScreen · StoryBookScreen (lineart child) |
| audioManifest.js (201) | getSceneAudio | AudioPlayer (Narration + Livrinho) |
| adventureMap.js (16) | require direto | AdventureMapScreen (compartilhado, não premium) |

Registries a strip na 2C = coloringImages, storySceneIllustrations, audioManifest, storyCovers (só as 18 premium). adventureMap fica.

## 4. Conta do bundle
- Fica (starter + compartilhado): ~54 + mapas req 4 + mascote 14 + images 3 + ui 0,9 + avatar 1 ≈ **~77 MB**.
- Sai na 2C (18 premium): ~318 MB.
- **Após 2C: ~136 MB** (sob ~200, suficiente). Com exclusão dos backups de mapas: **~73 MB**. Compressão (2D) reduz mais.
- Conclusão: bundle-only creation+noah é suficiente; compressão sozinha não seria.

## 5. Backups em assets/maps (evidência + não-consumo + preservação)
- 5 subpastas, 44 arquivos tracked, ~63 MB: source_png_backup(23), source_no_circles_final(23), source_new_6circles(13), backup_before_no_circles_maps(5), backup_before_6circles_fix(3).
- Prova de não-consumo: grep no src por cada pasta = 0 referências; `maps/source_`/`maps/backup_` = vazio. Mapas requeridos (16 R*.jpg raiz) = 4 MB.
- Todos git-tracked → sair do bundle via `assetBundlePatterns` mantendo no repo (sem `git rm`). Ganho seguro de ~63 MB, independente da remoção premium. **NÃO fazer agora.**

## 6. Rastreabilidade/integridade
`missingCount:0`, `untrackedRequiredCount:0`. Requires: capas 20 · cenas 202 · colorir 200 · áudio 201. Nenhuma inconsistência crítica → sem parada obrigatória.

## 7. Riscos
Nenhum bloqueador novo. Risco central = ordem 2B→2C (remover require premium antes do consumo R2 quebraria o fallback local `contentResolver.js:83-85`). `.git` grande = higiene de repo (trilha própria).

## 8. Recomendações para 2B
1. Generalizar consumo remoto: remover gate `david_goliath` em `useResolvedStoryMedia`; ligar `contentResolver`/`PacksContext` genérico por camada.
2. UX de download no StoryDetail (baixar/baixando/pronto offline/erro) via `PacksContext` + `packDownloadService`.
3. Manter fallback local intacto durante 2B (assets ainda bundlados) → zero regressão.
4. Validar device com pack R2 real de premium antes de planejar 2C.
5. Pré-condição 2C (fora do escopo): 18 packs R2 buildados+publicados+no manifesto vivo+validados. 2C bloqueada até lá.
6. Bônus seguro: excluir 44 backups de mapas (~63 MB) via `assetBundlePatterns` (preservados no git) — 2C ou micro-fase própria.
