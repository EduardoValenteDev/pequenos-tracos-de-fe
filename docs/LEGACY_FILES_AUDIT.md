# Auditoria de Arquivos e Pastas Legados — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
**Regra desta sprint:** Apenas documentar. Nenhum arquivo removido.

---

## Pastas legadas de assets

| Pasta | Tipo | Importada por | Pode remover? | Risco de remover | Recomendação |
|---|---|---|---|---|---|
| `assets/stories/Davi e o Golias/` | Pasta legada com espaços | Verificar: NÃO encontrada em nenhum `require()` de `src/` | Provavelmente sim | Baixo — se nenhum require() aponta para ela | Confirmar com `grep -r "Davi e o Golias" src/`; remover se zero resultados |
| `assets/stories/Jesus e as crianças/` | Pasta legada com espaços e acento | Verificar: NÃO encontrada em `src/` | Provavelmente sim | Baixo | Confirmar com `grep -r "Jesus e as crian" src/`; remover se zero resultados |
| `assets/stories/noe/` | Pasta normalizada ✓ | `coloringImages.js` → `require('../../assets/stories/noe/colorir/...')` | Não — em uso ativo | Alto | Manter |
| `assets/stories/davi_golias/` | Pasta normalizada ✓ | `coloringImages.js` → `require('../../assets/stories/davi_golias/colorir/...')` | Não — em uso ativo | Alto | Manter |
| `assets/stories/jesus_criancas/` | Pasta normalizada ✓ | `coloringImages.js` → `require('../../assets/stories/jesus_criancas/colorir/...')` | Não — em uso ativo | Alto | Manter |
| `assets/images/noe_apontandoBackup.png` | Arquivo de backup duplicado | Verificar uso | Provavelmente sim | Baixo | Confirmar; remover se não referenciado |

---

## Verificação de referências (comandos para executar antes de remover)

```bash
# Verificar se a pasta Davi legada tem qualquer require() apontando para ela
grep -r "Davi e o Golias" src/ --include="*.js"
grep -r "davi_scene" "assets/stories/Davi e o Golias/" 2>/dev/null | head -3

# Verificar se a pasta Jesus legada tem qualquer require() apontando
grep -r "Jesus e as crian" src/ --include="*.js"

# Verificar noe_apontandoBackup
grep -r "noe_apontandoBackup" src/ --include="*.js"

# Listar arquivos não referenciados em assets/images/
grep -roh "require.*assets/images/[^'\"]*" src/ --include="*.js" | sed "s/.*assets\/images\///" | sort -u
```

---

## Scripts de geração — avaliar necessidade a longo prazo

| Script | Uso | Remover? |
|---|---|---|
| `scripts/generate-image-brief.js` | Gerou `docs/STORY_IMAGE_BRIEF_EXPORT.md` | Manter — útil para regenerar |
| `scripts/generate-narration-export.js` | Gerou exports de narração | Manter — útil para regenerar |
| `scripts/generate-narrator-package.js` | Gerou pacote ZIP para narrador | Manter — útil para regenerar |
| `scripts/audio-audit.js` | Auditoria contínua de áudio | Manter — parte do pipeline |
| `scripts/audio-audit-self-test.js` | Self-test do audit | Manter |
| `scripts/smoke.js` | 582 testes de smoke | Manter — crítico |

---

## Arquivos docs/ — inventário completo

| Arquivo | Relevância | Status |
|---|---|---|
| `docs/AUDIO_GUIDE.md` | Guia de áudio | Manter |
| `docs/AUDIO_PIPELINE_GUIDE.md` | Pipeline de gravação | Manter |
| `docs/BUILD_SIZE_LOG.md` | Log de builds | Manter |
| `docs/FIRST_AUDIO_PILOT_CHECKLIST.md` | Checklist piloto | Manter |
| `docs/MEDIA_BUDGET_GUIDE.md` | Orçamento de bundle | Manter |
| `docs/STORY_IMAGE_BRIEF_EXPORT.md` | Export gerado | Manter (gerado, regenerável) |
| `docs/NARRATOR_PACKAGE/` | Pacote narrador | Manter |
| `docs/NARRATION_EXPORT.md` | Export narração | Manter |
| `docs/NARRATION_EXPORT.csv` | CSV narração | Manter |
| `docs/NARRATION_AUDIO_FILE_MAP.md` | Mapa de arquivos | Manter |
| `docs/APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md` | Auditoria 360 | Manter |
| `docs/legal/PRIVACY_POLICY_DRAFT.md` | Política (Sprint 17) | Manter |
| `docs/legal/TERMS_OF_USE_DRAFT.md` | Termos (Sprint 17) | Manter |
| `docs/legal/CHILD_DATA_MATRIX.md` | Matriz LGPD (Sprint 17) | Manter |
| `docs/legal/STORE_COMPLIANCE_CHECKLIST.md` | Compliance (Sprint 17) | Manter |

---

## Recomendação de ação

**Sprint 17 (esta):** Apenas documentar. Zero remoções.

**Sprint 18 (próxima):**
1. Executar os comandos de verificação acima
2. Se `grep` confirmar zero referências: submeter PR removendo as pastas legadas
3. Registrar no smoke test a ausência de pastas com espaços em `assets/stories/`

---

## Nota sobre builds Windows vs CI/CD

Pastas com espaços (`Davi e o Golias`) e acentos (`Jesus e as crianças`) em paths de `require()` são problemáticas no Metro Bundler, especialmente em Windows. **Como os requires em `coloringImages.js` já apontam para as pastas normalizadas**, as pastas legadas são de baixo risco hoje — mas aumentam o tamanho do bundle sem necessidade.
