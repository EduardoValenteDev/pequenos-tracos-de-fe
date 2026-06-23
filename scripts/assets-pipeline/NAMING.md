# Padrão Canônico de Nomes e Diretórios — Feature 001 (T005b · FR-005)

Padrão **documentado** por categoria de asset. Esta Fase 1 **apenas define e sinaliza**
desvios — **não renomeia nem move** nenhum arquivo. A validação executável
(`check-naming.js`) é um follow-up; este documento é a referência canônica.

> **Validar ANTES** de integrar **Rute, José, Ester, Moisés, Samuel e Josias** — esses
> lotes têm desvios conhecidos e exigem auditoria/aprovação visual antes de qualquer entrada.

## Convenções por categoria

| Categoria | Diretório canônico | Nome canônico | Proporção | Formato (alvo) |
|---|---|---|---|---|
| Capas | `assets/images/` | `<slug>_cover.png` | livre (capa) | PNG hoje → WebP (futuro) |
| Cenas ilustradas | `assets/stories/<story>/scenes/` | `<story>_scene_NN.png` | **4:5** | PNG → WebP lossy (futuro) |
| Páginas de colorir | `assets/stories/<story>/coloring/` | `<story>_coloring_NN.png` | **4:5** | PNG/WebP lossless (flood-fill) |
| Mapas | `assets/maps/` | `R<n>{A|B}.jpg` (+ `_preview`) | 9:16 | JPG |
| UI / avatares | `assets/avatar/`, `assets/...` | descritivo estável | livre | PNG |
| Áudio | `assets/audio/<story>/` | `<story>_scene_NN.mp3` | — | MP3 (expo-audio) |

## Divergências conhecidas (sinalizar, NÃO corrigir nesta feature)

- **(a) `scene/` vs `scenes/`** — subpasta inconsistente entre histórias. Canônico: **`scenes/`**.
- **(b) `scene_NN.png` vs `<story>_scene_NN.png`** — alguns lotes usam nome curto sem o
  prefixo da história. Canônico: **`<story>_scene_NN.png`** (idem `coloring`).
- **(c) `coloring/`** — diretório canônico das páginas de colorir; nomes devem seguir
  `<story>_coloring_NN.png` (vários hoje usam `scene_NN.png`).
- **(d) Cenas ilustradas** — devem viver em `scenes/` com prefixo de história e proporção 4:5.
- **(e) Proporção fora de 4:5** — ex.: `ruth_naomi`, `samuel_hears_god`, `miraculous_catch`
  (0.512–0.800 medidos na auditoria). **Requer aprovação visual explícita**; nunca
  esticar/cortar automaticamente.

## Regras de ouro

1. **Nesta feature não se renomeia/move nada** — só inventário, medição e sinalização.
2. Proporção **4:5** é canônica para cenas/colorir; desvios exigem aprovação visual.
3. Páginas de colorir devem preservar **contornos fechados** (flood-fill) — validação
   de qualidade é pré-requisito de qualquer otimização (fase futura).
4. `assets/stories/*` permanecem **untracked** até auditoria/aprovação (ver
   [`PIPELINE.md`](./PIPELINE.md) e o guard).
