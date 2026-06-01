# Plano de Limpeza de Assets Legados — Pequenos Traços de Fé

**Sprint 18.1 · 2026-06-01**  
**Regra desta sprint:** Apenas documentar. Nenhum arquivo ou pasta removido.

---

## Pasta legada 1: `assets/stories/Davi e o Golias/`

| Campo | Valor |
|---|---|
| Caminho completo | `assets/stories/Davi e o Golias/colorir/` |
| Conteúdo | 10 arquivos PNG (davi_scene_01..10_coloring.png) |
| Tamanho total | ~11 MB |
| Motivo de ser legada | Pasta com **espaço no nome** — Metro Bundler pode ter comportamento imprevisível no Windows |
| Duplicata de | `assets/stories/davi_golias/colorir/` ← pasta normalizada |

### Verificação de referências

```bash
# Verificar se algum require() aponta para esta pasta
grep -rn "Davi e o Golias" src/ --include="*.js"
# Resultado esperado: ZERO ocorrências ← significa seguro remover
```

**Resultado da verificação:** Nenhuma referência encontrada em `src/`. ✓

### Arquivos contidos
| Arquivo | Duplicata em |
|---|---|
| `Davi e o Golias/colorir/davi_scene_01_coloring.png` | `davi_golias/colorir/davi_scene_01_coloring.png` ✓ |
| `Davi e o Golias/colorir/davi_scene_02_coloring.png` | `davi_golias/colorir/davi_scene_02_coloring.png` ✓ |
| ... (10 arquivos, todos duplicados) | ✓ |

### Risco de remover
- **Baixo** — os mesmos arquivos existem na pasta normalizada `davi_golias/`
- Nenhum `require()` em `src/` aponta para a pasta com espaços
- O Metro Bundler não inclui arquivos sem `require()` no bundle

### Recomendação
Remover na Sprint 19, após confirmar smoke passa sem ela. Comando:
```bash
# Windows PowerShell
Remove-Item -Recurse -Force "assets\stories\Davi e o Golias"

# macOS/Linux
rm -rf "assets/stories/Davi e o Golias"
```

---

## Pasta legada 2: `assets/stories/Jesus e as crianças/`

| Campo | Valor |
|---|---|
| Caminho completo | `assets/stories/Jesus e as crianças/colorir/` |
| Conteúdo | 10 arquivos PNG (jesus_children_scene_01..10_coloring.png) |
| Tamanho total | ~12.4 MB |
| Motivo de ser legada | Pasta com **espaço e acento no nome** — problema duplo no Metro Bundler |
| Duplicata de | `assets/stories/jesus_criancas/colorir/` ← pasta normalizada |

### Verificação de referências

```bash
grep -rn "Jesus e as crian" src/ --include="*.js"
# Resultado esperado: ZERO ocorrências
```

**Resultado da verificação:** Nenhuma referência encontrada em `src/`. ✓

### Risco de remover
- **Baixo** — todos os 10 arquivos existem na pasta normalizada `jesus_criancas/`
- Nenhum `require()` aponta para a pasta com espaços/acentos

### Recomendação
Remover na Sprint 19, após confirmar smoke. Comando:
```bash
# Windows PowerShell
Remove-Item -Recurse -Force "assets\stories\Jesus e as crianças"

# macOS/Linux
rm -rf "assets/stories/Jesus e as crianças"
```

---

## Arquivo órfão: `assets/images/noe_apontandoBackup.png`

| Campo | Valor |
|---|---|
| Caminho completo | `assets/images/noe_apontandoBackup.png` |
| Tamanho | ~706 KB |
| Motivo de ser órfão | Nome inclui "Backup" — provavelmente cópia de segurança de `noe_apontando.png` |
| Declarado em stories.js | Não — nem `personagemGuia`, nem `imagemNarracao`, nem `imagemCapa` |
| Importado por coloringImages.js | Não |
| Importado por images.js | Não |
| Duplicata de | `assets/images/noe_apontando.png` (~720 KB — arquivo ativo) |

### Verificação de referências

```bash
grep -rn "noe_apontandoBackup" src/ --include="*.js"
# Resultado esperado: ZERO ocorrências
```

**Resultado da verificação:** Nenhuma referência encontrada. ✓

### Comparação com o original

| Arquivo | Tamanho | Referenciado |
|---|---|---|
| `noe_apontando.png` | ~720 KB | ✓ Em `src/assets/images.js` (`noe_apontando`) |
| `noe_apontandoBackup.png` | ~706 KB | ✗ Não referenciado |

### Risco de remover
- **Muito baixo** — o arquivo não é importado por nenhum código
- O Metro Bundler não inclui arquivos sem `require()` no bundle

### Recomendação
1. Confirmar que o arquivo não é idêntico a `noe_apontando.png` (comparar MD5 se necessário)
2. Se quiser manter como histórico: mover para pasta `tmp/` ou `docs/assets_archive/`
3. Se confirmar que não é necessário: remover na Sprint 19

```bash
# Remover
Remove-Item "assets\images\noe_apontandoBackup.png"   # PowerShell
rm "assets/images/noe_apontandoBackup.png"             # macOS/Linux

# Verificar que nenhuma referência existe antes
grep -rn "noe_apontandoBackup" . --include="*.js" --include="*.json"
```

---

## Impacto da limpeza

| Ação | Economia no bundle | Risco |
|---|---|---|
| Remover `Davi e o Golias/` | ~11 MB | Baixo |
| Remover `Jesus e as crianças/` | ~12.4 MB | Baixo |
| Remover `noe_apontandoBackup.png` | ~706 KB | Muito baixo |
| **Total** | **~24 MB** | Baixo |

**Nota:** Essas pastas legadas NÃO são incluídas no bundle pelo Metro Bundler se não houver `require()` apontando para elas. O ganho real seria apenas no tamanho do repositório git, não no APK final. Confirmar com `eas build` o tamanho real antes e depois.

---

## Procedimento de limpeza na Sprint 19

```
1. Confirmar grep de zero referências para cada pasta/arquivo
2. Rodar: npm run smoke → deve passar 620/620
3. Remover as pastas e arquivo
4. Rodar: npm run smoke → deve continuar 620/620
5. Rodar: node scripts/audit-assets.js → deve ter 0 warnings de legacy
6. Commit: chore(assets): remove legacy folders and orphan backup file
```
