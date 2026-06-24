# Fechamento de Conteúdo — Convenções finais (linha de lançamento)

Spec de **planejamento de conteúdo**: convenções finais para gerar/substituir/gravar assets de
forma que a **integração futura seja limpa** (sem quebrar `require` estáticos, sem renomear depois).

> Fonte: [`PLANO_OFICIAL_BENI_LANCAMENTO.md`](../PLANO_OFICIAL_BENI_LANCAMENTO.md) §4/§15 +
> [`DECISOES_E_CONFLITOS.md`](./DECISOES_E_CONFLITOS.md). Este documento **não** integra nem move
> assets — é referência para a produção do Eduardo e para os blocos de integração futuros.

## Decisões finais (travadas — Eduardo)
1. **Nome do colorir = `scene_NN.png`** (sem prefixo). Mantém o padrão já integrado; zero rename, zero churn no require map.
2. **Áudio de narração = MP3 mono ~64–96 kbps**, volume normalizado (voz definitiva do Beni).
3. **As 4 incompletas** (`solomon_wisdom`, `mary_says_yes`, `timothy_faith`, `jesus_temple`) entram **DISPONÍVEIS no lançamento** → precisam ficar **completas** (cena + colorir + narração), não "Em breve".

## 1. Convenção final de PASTAS (`assets/stories/<storyId>/`)
| Categoria | Pasta canônica | Observação |
|---|---|---|
| Cenas ilustradas | **`scenes/`** (plural) | `jesus_temple`, `mary_says_yes`, `solomon_wisdom` usam `scene/` hoje → renomear p/ `scenes/` na integração |
| Páginas de colorir | **`coloring/`** | já padrão em todas |
| Narração (áudio) | **`assets/audio/<storyId>/`** | pasta separada (NÃO em `assets/stories/...`) |
| Guias do Beni (áudio) | `assets/audio/beni_guide/<grupo>/` | manifesto próprio |
| Capas | `assets/images/<slug>_cover.png` | já integradas (`storyCovers.js`) — não mexer |

- Limpar (na integração): pastas vazias stray `assets/stories/noah/audio/` e `/narracao/`.
- `storyId` = id do catálogo (`stories.js`).

## 2. Convenção final de NOMES
| Categoria | Padrão | Exemplo |
|---|---|---|
| **Cena** | `<storyId>_scene_NN.png` (NN `01`–`10`) | `creation_scene_01.png` |
| **Colorir** | `scene_NN.png` (sem prefixo; NN `01`–`10`) | `scene_01.png` |
| **Narração** | `<storyId>_scene_NN.mp3` em `assets/audio/<storyId>/` | `noah_scene_01.mp3` |
| **Guia do Beni** | `guide_<grupo>_<nome>.mp3` em `assets/audio/beni_guide/<grupo>/` | `guide_home_welcome.mp3` |

## 3. Novos colorir (jesus_temple, solomon_wisdom, timothy_faith)
Em `assets/stories/<storyId>/coloring/` (pasta já existe, vazia), criar 10: `scene_01.png` … `scene_10.png`.
Requisitos: **4:5** (1024×1280 recomendado), **contorno fechado**, **fundo branco puro**, linha limpa (anti-aliasing mínimo) para o **flood-fill** não vazar.

## 4. Substituir sem quebrar integração
- **Regra de ouro:** substituir **no mesmo caminho e mesmo nome**. O `require()` é estático (resolve por caminho) → trocar o conteúdo no mesmo path **não** quebra a integração.
- **NUNCA** renomear/mover ao substituir.
- Após substituir: `npx expo start --clear` (limpa cache do Metro).
- **Tracked** (cenas/colorir integradas, áudio do creation): substituição aparece como **modificado** → entra por **bloco de assets auditado** (peso/4:5), nunca `git add` amplo.
- **Untracked** (4 hist. não integradas, colorir novo): substituir/criar livremente; integração = bloco separado.

## 5. Backup ANTES de substituir
- **Fora do repositório** (como `ptf-avatar-originals-backup`):
  ```
  C:\Projetos\ptf-content-backup\<AAAA-MM-DD>\
     stories\<storyId>\scenes\ ...  coloring\ ...
     audio\<storyId>\ ...
     beni_guide\ ...
     BACKUP_LOG.csv   (arquivo · caminho original · data · motivo)
  ```
- Copiar o original antes de sobrescrever; manter o log. **Untracked** só existem no disco → backup externo é **obrigatório**. Validar a contagem antes de lotes.

## 6. Lista oficial de produção
**🎨 GERAR** — colorir (10 páginas, 4:5) de **jesus_temple, solomon_wisdom, timothy_faith**.

**🔄 SUBSTITUIR** (com backup) — **voz definitiva do Beni**: narração de `creation` (re-gravar) + **gravar as 19 restantes** + **27 guias do Beni**; cenas/colorir pontuais (mesmo path/nome).

**🔍 REVISAR** (antes de integrar) — 27 imagens fora de **4:5**; renomear `scene/`→`scenes/` (jesus_temple, mary_says_yes, solomon_wisdom); limpar pastas vazias do `noah`.

**🔌 INTEGRAR DEPOIS** (bloco auditado, `git add` seletivo) — cenas das **4** (40); colorir das **8** já no disco (esther_queen, joseph_colorful_coat, moses_red_sea, ruth_naomi, miraculous_catch, samuel_hears_god, josiah_young_king, mary_says_yes) + os **3** novos; narração das **20** no `audioManifest`.

## 7. Convenção exata do `audioManifest`
- **Local:** `assets/audio/<storyId>/<storyId>_scene_NN.mp3` (NN `01`–`10`).
- **Chave por história:** `storyId` (catálogo; `STORY_IDS` já lista as 20).
- **Chave por cena:** `sceneKey: 'scene_NN'` (`scene_01`…`scene_10`).
- **Formato:** MP3 mono ~64–96 kbps, normalizado, curto por cena.
- **Entrada (só com o arquivo no disco):**
  ```js
  { storyId: 'noah', sceneKey: 'scene_01',
    audioAsset: require('../../assets/audio/noah/noah_scene_01.mp3') },
  ```
- **Fluxo:** arquivo → `_readyEntries` → `npm run audio:audit` (+N ready) → `npm run smoke`. Nunca require de inexistente.
- Guia: `docs/AUDIO_PIPELINE_GUIDE.md` / `docs/AUDIO_GUIDE.md`.

## 8. Áudios do Guia do Beni 2.0
- **Pasta/nome/chave:** `assets/audio/beni_guide/<grupo>/guide_<grupo>_<nome>.mp3` · `guide.<grupo>.<nome>`.
- **Regravar (voz definitiva):** todos os **27** atuais (`guide.initial.*`, `guide.adventures.*`, `guide.home.*`, `guide.atelier.*`, `guide.stars.*`, `guide.profile.*`).
- **Grupo `atelier` → `brincar`:**
  - **Aposentar:** `guide.atelier.welcome`, `guide.atelier.coloring`, `guide.atelier.guided_drawing`, `guide.atelier.free_draw`, `guide.atelier.gallery`.
  - **Criar:** `guide.brincar.welcome`, `guide.brincar.palavrinhas`, `guide.brincar.bichinhos`, `guide.brincar.pares`, `guide.brincar.criar`, `guide.brincar.minhas_artes` (aviso "salvar = Plano Família").
- **Novos (onboarding §14, se expandir):** `guide.initial.brincar`, `guide.initial.estrelinhas`, `guide.initial.plano_familia`.
- **Storage:** `@ptf_beni_guide_atelier_v1` → `@ptf_beni_guide_brincar_v1` (migração/manter p/ não re-disparar o tour).
- *(Copy/áudio final do Brincar depende do design da aba — Fase 6; aqui fica a convenção de chaves.)*

## 9. Medir peso antes/depois (pipeline existente)
- `npm run assets:inventory` · `assets:measure` · `assets:budget` · `assets:check-ratio`.
- **Protocolo:** baseline antes + medição depois de cada lote. Registrar: total `assets/`; cenas; colorir; capas; narrações (`assets/audio/<story>`); guias (`assets/audio/beni_guide`); peso por história.
- **Atenção:** narração + colorir novos **aumentam** o peso → otimização WebP/áudio (Fase 4) vem **depois** do conteúdo travado.

## 10. Checklist de aceite — "história pronta"
- [ ] Capa integrada (`assets/images/<slug>_cover.png`).
- [ ] **10 cenas** `scenes/<storyId>_scene_01..10.png`.
- [ ] **10 colorir** `coloring/scene_01..10.png`, 4:5, contorno fechado/fundo branco.
- [ ] **10 narrações** `assets/audio/<storyId>/<storyId>_scene_01..10.mp3` (voz definitiva, normalizadas) + integradas no `audioManifest`.
- [ ] Quiz presente (`quizzes.js`) — ✅ nas 20.
- [ ] Momento com Beni (genérico/diário) — ✅.
- [ ] Livrinho abre (deriva das cenas) — ✅ se cenas ok.
- [ ] Proporção 4:5 sem desvio não-aprovado (`assets:check-ratio`).
- [ ] Peso dentro do esperado (medição §9).
- [ ] Nomes/pasta corretos (`scenes/` plural; sem stray; require integrado).
- [ ] `npm run smoke` + `npx expo-doctor` verdes após integração.
