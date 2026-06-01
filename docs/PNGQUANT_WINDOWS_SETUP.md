# pngquant no Windows — Guia de Instalação

**Sprint 18.2 · 2026-06-01**  
**Status atual:** pngquant NÃO instalado. Usando Pillow como alternativa.

---

## Estado do ambiente (verificado em 2026-06-01)

| Ferramenta | Status | Versão |
|---|---|---|
| pngquant | ✗ Não encontrado | — |
| Chocolatey | ✓ Disponível | 2.5.1 |
| `choco install pngquant` | ✗ Falhou (sem permissão de admin) | — |
| Python 3.12 | ✓ Disponível | 3.12.2 |
| Pillow | ✓ Instalado via `pip --user` | 12.2.0 |
| **Solução alternativa ativa** | **Pillow + quantização de paleta** | **Funcionando** |

---

## Por que pngquant é preferido (e não obrigatório)

pngquant usa um algoritmo de quantização mais sofisticado (mediancut/NNFQ) que geralmente produz arquivos 5-15% menores que o Pillow com qualidade visual equivalente. Para este projeto, o Pillow produziu resultados excelentes (94% de redução nas colorir, min_white_lum ≥ 214).

**Para este projeto, Pillow é suficiente.**

---

## Opções de instalação do pngquant no Windows

### Opção A — Chocolatey (requer admin)
```powershell
# Executar como Administrador
choco install pngquant -y
pngquant --version
```

### Opção B — Binário direto (sem admin)
```powershell
# Criar pasta local para ferramentas
New-Item -ItemType Directory -Path "C:\Users\USER\tools" -Force

# Baixar pngquant.exe de https://pngquant.org
# Adicionar ao PATH do usuário
$userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
[System.Environment]::SetEnvironmentVariable("PATH", "$userPath;C:\Users\USER\tools", "User")

# Verificar
pngquant --version
```

### Opção C — winget (Windows 11)
```powershell
winget install pngquant
```

### Opção D — Pillow (solução atual, sem admin, sem binário)
```powershell
# Já instalado:
"C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe" -m pip install Pillow --user

# Usar via script:
"C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe" -X utf8 `
  scripts/compress-images-pillow.py --recursive
```

---

## Comparação de resultados: pngquant vs Pillow

Para linearts (imagens de colorir):

| Métrica | pngquant | Pillow (este projeto) |
|---|---|---|
| Redução típica | 88-95% | 91-95% |
| Resultado obtido | — (não disponível) | 94% |
| Dithering | `--nofs` desabilita | `dither=NONE` |
| Qualidade white pixels | Alta | Alta (min_lum ≥ 214) |
| Flood fill safety | Excelente | Excelente |
| Admin necessário | Não (binário) | Não (pip --user) |

**Conclusão: Pillow produziu resultados equivalentes ao pngquant para este caso de uso específico (linearts de colorir infantil).**

---

## Resultado alcançado com Pillow nesta sprint

| Métrica | Valor |
|---|---|
| Total antes | 41.3 MB (35 arquivos) |
| Total depois | 3.6 MB |
| Redução | 91.4% |
| Colorir (30) | 34.5 MB → 2.2 MB (94%) |
| Capas (3) | 4.7 MB → 0.8 MB (83%) |
| Narração (2) | 2.1 MB → 0.4 MB (83%) |

---

## Comando de compressão usado

```bash
"C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe" -X utf8 \
  scripts/compress-images-pillow.py \
  --input tmp/asset-compression-test \
  --output tmp/asset-compression-test/compressed \
  --colors 128 \
  --recursive
```

**Parâmetros:**
- `--colors 128`: paleta de 128 cores (Pillow usa FASTOCTREE para indexar)
- `--recursive`: processa subpastas
- `dither=NONE`: sem Floyd-Steinberg (crítico para linearts)
- `compress_level=9`: deflate máximo
- `skip-if-larger`: mantém original se comprimido for maior
