# Media Budget Guide — Pequenos Traços de Fé

**Sprint 16 — Estimativas de bundle size e decisões de hospedagem**
**Última atualização:** 2026-05-27

---

## 1. Contexto

Todos os assets (áudio + imagens) são **bundled localmente** nesta fase. Funciona
offline, sem CDN, sem backend. Isso é uma escolha deliberada para o lançamento piloto.

O risco principal é que o bundle pode ultrapassar o limite recomendado de ~200 MB
antes que todos os 200 áudios e 420 imagens estejam prontos.

---

## 2. Estimativas de peso por tipo

| Tipo | Quantidade | Peso unitário estimado | Peso total estimado |
|---|---|---|---|
| Narração MP3 (128kbps, ~90s média) | 200 | ~1,4 MB | ~280 MB |
| Capa de história 16:9 (JPEG/WebP 600px) | 20 | ~120 KB | ~2,4 MB |
| Lineart de colorir (PNG 390×600 transparente) | 200 | ~80 KB | ~16 MB |
| SoundButton tap (pop.wav) | 1 | ~20 KB | ~20 KB |
| **Total estimado completo** | — | — | **~298 MB** |

> Limite recomendado pelo Google Play: 150 MB para APK sem OBB.
> Limite da App Store: 4 GB, mas downloads Wi-Fi only acima de 200 MB.
> Limite prático para não assustar usuário: < 150 MB.

**Conclusão: 200 áudios + 420 imagens EXCEDE o limite recomendado de 150 MB.**

---

## 3. Plano por fases de bundle

### Fase 1 — Lançamento piloto (Sprint 16–20)
- 0–20 áudios (histórias iniciais do piloto)
- 20 capas + 200 linearts
- Estimativa: ~28 + 2,4 + 16 = **~46 MB**
- Bem dentro do limite ✓

### Fase 2 — Expansão de áudio (pós-lançamento)
- 20–100 áudios
- Estimativa: ~140 MB + imagens = **~158 MB** (perto do limite)
- Avaliar CDN para áudios ao atingir 80+ arquivos

### Fase 3 — Cobertura total
- 200 áudios locais provavelmente excede o limite
- Decisão: CDN (stream) ou Asset Bundle Splitting (Expo)
- Não decidir agora — medir o APK real primeiro

---

## 4. Como medir o APK gerado

Após `npm run build:preview:android`, o EAS fornece link para download do APK.

```bash
# Tamanho do APK gerado pelo EAS (via dashboard ou CLI)
eas build:list --platform android

# Localmente (após download do APK)
ls -lh build.apk

# Descompactar e ver o que pesa (APK é um ZIP)
unzip -l build.apk | grep "assets/audio" | awk '{sum += $1} END {print sum/1024/1024 " MB"}'
```

---

## 5. Limite para decisão de CDN

| Condição | Ação recomendada |
|---|---|
| APK < 80 MB com todos os assets presentes | Manter tudo local |
| APK entre 80 MB–150 MB | Monitorar; planejar CDN para o lote seguinte |
| APK > 150 MB | Migrar áudios para CDN antes do próximo build |
| APK > 200 MB | Bloqueador para App Store (Wi-Fi only obrigatório) |

---

## 6. Opções de hospedagem futura (se necessário)

| Opção | Prós | Contras |
|---|---|---|
| Expo Asset Bundle (EAS) | Sem CDN externo, integrado | Limite ainda existe no install |
| Cloudflare R2 | Barato, CDN global, S3-compatible | Requer lógica de download/cache |
| AWS S3 + CloudFront | Maduro, escalável | Mais complexo para configurar |
| Supabase Storage | Simples, PostgreSQL integrado | Menos otimizado para media |

**Recomendação quando necessário:** Cloudflare R2 — zero custo de egress, API S3-compatible,
sem necessidade de backend próprio.

---

## 7. Imagens — decisão por fase

| Tipo | Fase 1 | Fase 2+ |
|---|---|---|
| Capas 16:9 (20 arquivos) | Local — peso baixo (~2 MB total) | Local |
| Linearts colorir (200 PNG) | Local — peso gerenciável (~16 MB) | Local |
| Screenshots de loja | Não bundled (só para submissão) | Não bundled |

Linearts são usados offline (no Ateliê) — **devem permanecer locais**.
Capas são pequenas — **devem permanecer locais**.
Áudios são o único candidato a CDN no futuro.

---

## 8. Risco real por fase — não minimizar

| Fase | Áudios | Risco | Ação |
|---|---|---|---|
| 1 áudio (piloto) | 1 | Baixo (~31 MB) | Monitorar |
| 20 áudios | 20 | Baixo (~57 MB) | Medir APK |
| 80 áudios | 80 | Médio (~140 MB) | Avaliar estratégia CDN |
| 200 áudios | 200 | **Alto (~310 MB)** | CDN para áudios obrigatório |

**O risco é real.** Com 200 áudios locais o app excede o limite do Google Play sem OBB e
entra em regime de "Wi-Fi only" na App Store. A decisão de CDN precisa estar tomada
antes de atingir 80 áudios — não apenas quando o problema aparecer.

Registrar tamanho de cada build em `docs/BUILD_SIZE_LOG.md`.

---

## 9. Checklist antes de cada build com novos assets

- [ ] Contar arquivos de áudio: `ls assets/audio/**/*.mp3 2>/dev/null | wc -l`
- [ ] Ver tamanho total: `du -sh assets/`
- [ ] Verificar tamanho do APK gerado (EAS dashboard ou download local)
- [ ] Preencher `docs/BUILD_SIZE_LOG.md`
- [ ] Se APK > 80 MB → planejar CDN antes do próximo batch de áudios
- [ ] Se APK > 130 MB → não adicionar mais áudios sem estratégia CDN
- [ ] Nunca adicionar require() para arquivo que não existe (proteção no smoke)

---

## 10. Regras de bundle

1. Não usar `require()` para URLs remotas — violaria "assets locais" e poderia exigir permissão de rede
2. Não instalar `expo-updates` para tentar fazer delivery de áudio via OTA — proibido
3. Não usar `react-native-track-player` ou outra lib de streaming — não instalado
4. Lineart PNGs devem ser transparentes (fundo alfa) — evitar conversão para JPEG que perderia canal alfa
5. Capas: usar JPEG ou WebP com qualidade 85 — evitar PNG para imagens fotográficas
