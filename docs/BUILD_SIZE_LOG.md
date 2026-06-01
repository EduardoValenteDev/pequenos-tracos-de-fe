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
| — | — | — | — | — | — | — | Preencher após Sprint 16.1 |

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
