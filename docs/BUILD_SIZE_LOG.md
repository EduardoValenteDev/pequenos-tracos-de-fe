# Build Size Log — Pequenos Traços de Fé

Registra o tamanho dos builds EAS ao longo do tempo para detectar crescimento do bundle.
Preencher após cada build significativo (mudança de assets, nova release).

---

## Como consultar o tamanho do build

1. Após `npm run build:preview:android`, aguardar o EAS finalizar
2. Abrir [https://expo.dev](https://expo.dev) → projeto → Builds
3. Clicar no build → "Download" → anotar o tamanho exibido
4. Ou via CLI: `eas build:list --platform android --limit 1`

Para medir localmente após download do APK:
```bash
# Tamanho total do APK
ls -lh build.apk

# Peso dos assets de áudio dentro do APK (APK é um ZIP)
unzip -l build.apk | grep "assets/audio" | awk '{sum += $1} END {print sum/1024/1024 " MB"}'
```

---

## Threshold de alerta

| Tamanho do APK | Ação |
|---|---|
| < 80 MB | OK — continuar entrega local |
| 80–130 MB | Monitorar — planejar CDN para próximo batch de áudios |
| > 130 MB | Avaliar migração de áudios para CDN antes do próximo build |
| > 200 MB | Bloqueador App Store (Wi-Fi only obrigatório) |

---

## Registro de builds

| Data | Tipo | Perfil | Plataforma | Áudios ready | Imagens finais | Tamanho APK/IPA | Observação |
|---|---|---|---|---|---|---|---|
| 2026-05-27 | Preview | preview | Android | 0/200 | 0 | Ver EAS dashboard | Primeiro build real (Sprint 15) |
| 2026-07-02 | Preview | preview | Android | 200/200 | 200 cenas + 200 colorir | **869,4 MB** (911.660.166 B) | Build `eb1bad08` · commit `e6ccaa4` · **✗ >200 MB (bloqueador de loja)** · archive de upload 1,7 GB · ver seção abaixo |

---

## Build real medido — 2026-07-02 (Bloco 5)

Primeira medição real do APK com o catálogo completo (20 histórias) e narração 100%.

| Campo | Valor |
|---|---|
| **a. Data** | 2026-07-02 |
| **b. Branch** | `content-integrate-coloring-3` |
| **c. Commit** | `e6ccaa4e62dd45d0e2a6d4c689bc6aab9b4f7c3f` |
| **d. Comando** | `npx eas build --platform android --profile preview --non-interactive` |
| **e. Perfil** | `preview` (Android APK, `distribution: internal`, SDK 54, v1.0.0 / vc 1) |
| **f. Resultado** | ✅ **`finished`** (build bem-sucedido) |
| **g. Tamanho final do APK** | **869,4 MB** = **911.660.166 bytes** |
| Build ID | `eb1bad08-d5fe-4e65-9fa8-5e973bfb44b3` |
| APK (URL) | https://expo.dev/artifacts/eas/z8ODmRUNeY2PXL31IcwyKJ_rlJxycziJO8ktxJe3PXE.apk |
| Página/QR de instalação | https://expo.dev/accounts/eduardocriacao/projects/pequenos-tracos-de-fe/builds/eb1bad08-d5fe-4e65-9fa8-5e973bfb44b3 |
| Enfileirado / Início compilação / Fim | 17:08:20 · 18:43:39 (`in progress`) · 18:59:37 (`finished`) |
| Tempo total (wall-clock) | ~1h51m (a maior parte em **fila**: ~1h35m); compilação real ~16 min |

### h. Observações de peso e upload
- **BLOQUEADOR de loja confirmado empiricamente:** 869,4 MB **≫ 200 MB** (teto do módulo base do Google Play) e ≫ alvo interno ≤ 100 MB. O empacotamento **100% local** não é publicável — valida a decisão da arquitetura híbrida (DECISIONS.md #20), **ainda não implementada**.
- **Archive de upload = 1,7 GB** (o EAS avisou). É maior que os ~908 MB de assets porque inclui fontes não-bundladas (ex.: `docs/` com `NARRATOR_PACKAGE*`, scripts). Não infla o APK, mas encarece/atrasa o upload — candidato a enxugar via `.easignore` **em bloco próprio** (não feito agora).
- **`.easignore` funcionou:** `tmp/` (piloto WebP 143 MB) e `assets/maps/backup_*`/`source_*` (64 MB) **não** entraram no APK.

### Breakdown por grupo (assets em disco; o que vai para o APK)
| Grupo | Peso | No APK? |
|---|---|---|
| **stories (total)** | **730 MB** | sim |
| ├ scenes (ilustradas PNG) | 451,3 MB | sim |
| └ coloring (PNG) | 278,4 MB | sim |
| **audio** (200 MP3 + guia Beni) | 59 MB | sim (guia Beni 2,7 MB) |
| **images (UI)** | 38 MB | sim |
| **mascote (Beni)** | 14 MB | sim |
| **avatar** | ~1 MB | sim |
| **maps** (total 68 MB) | ~4 MB reais | sim (backups/sources 64 MB **excluídos** via `.easignore`) |
| fonts | 0 | — |
| _+ runtime RN/nativo (estimado)_ | ~20–40 MB | sim |
| **Assets bundlados (soma)** | **~846 MB** | → APK 869,4 MB |

> **Leitura:** o peso é dominado pelas **imagens de histórias (730 MB = scenes 451 + coloring 278)**. É onde a otimização (WebP q80 nas cenas / WebP lossless no colorir) + saída das 18 premium do binário base (packs remotos) teriam maior impacto. **Nenhuma otimização/conversão foi feita neste bloco** (Bloco 5 = só medir).

---

## Estimativas de referência

| Cenário | Áudios | Imagens | Estimativa |
|---|---|---|---|
| Estado atual (Sprint 16) | 0 | 0 | ~30 MB base |
| Piloto (Sprint 16.1) | 1 | 0 | ~31 MB |
| 1 história completa (10 áudios + 1 capa + 10 linearts) | 10 | 11 | ~47 MB |
| 5 histórias | 50 | 55 | ~105 MB |
| 10 histórias | 100 | 110 | ~180 MB ⚠ |
| 20 histórias (completo) | 200 | 220 | ~310 MB ✗ |

> Estimativas assumem: MP3 ~1,4 MB, capa ~120 KB, lineart ~80 KB.
> Medir o APK real e atualizar esta tabela conforme o projeto avança.
