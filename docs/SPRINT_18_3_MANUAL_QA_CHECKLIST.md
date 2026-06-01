# Sprint 18.3 — Checklist de QA Manual

**Data:** 2026-06-01  
**Objetivo:** Validar que as imagens comprimidas funcionam corretamente no app.

---

## Antes de começar

```bash
npx expo start
```

Aguardar o Metro Bundler recarregar completamente. Testar em device físico ou simulador.

---

## Checklist por tela

### HomeScreen

- [ ] App abre sem crash
- [ ] HomeScreen carrega corretamente
- [ ] Capa de Noé (`noe_arcoiris_capa.png`) aparece na tela inicial (card de história ou banner)
- [ ] Capa não aparece pixelada ou distorcida
- [ ] Nenhuma tela branca ou imagem quebrada

### Aventuras (StoriesScreen)

- [ ] Aventuras abre sem crash
- [ ] Cards de Noé, Davi e Jesus mostram capas comprimidas
- [ ] As capas aparecem com qualidade visual aceitável (sem artefatos visíveis a olho nu)
- [ ] As histórias sem capa mostram fallback (StoryFallbackCover)

---

## Ateliê — ColoringScreen (CRÍTICO para flood fill)

### Teste 1: Noé — 3 cenas

**Cena 1 (noe_scene_01_coloring.png):**
- [ ] Imagem de colorir carregou (não tela branca)
- [ ] **Pintar céu** (área grande superior): cor preenche sem vazar pelas bordas?
- [ ] **Pintar arca** (objeto central): preenche sem vazar para fora?
- [ ] **Pintar personagem** (área menor): preenche corretamente?
- [ ] Usar borracha sobre área colorida: apaga corretamente?
- [ ] Usar reset: limpa todo o desenho?
- [ ] Clicar em "Pronto": avança para próxima cena sem crash?

**Cena 6 (noe_scene_06_coloring.png — menor arquivo, 46 KB):**
- [ ] Imagem carregou
- [ ] Flood fill funciona em 2 áreas distintas
- [ ] Sem vazamento anormal

**Cena 9 (noe_scene_09_coloring.png):**
- [ ] Imagem carregou
- [ ] Flood fill funciona

### Teste 2: Davi e Golias — 2 cenas

**Cena 9 (davi_scene_09_coloring.png — cena com mais compressão, 62 KB):**
- [ ] Imagem carregou
- [ ] Flood fill funciona sem vazamento

**Cena 1 (davi_scene_01_coloring.png):**
- [ ] Imagem carregou
- [ ] Flood fill funciona

### Teste 3: Jesus e as Crianças — 2 cenas (borderline na análise de luminância)

**Cena 2 (jesus_children_scene_02_coloring.png — foi borderline, 90 KB):**
- [ ] Imagem carregou
- [ ] **Pintar área grande**: preenche sem vazamento?
- [ ] **Pintar área adjacente**: preenche independentemente (sem atravessar as linhas)?
- [ ] Linha rejeitada: tocar sobre linha preta mostra dica correta?

**Cena 8 (jesus_children_scene_08_coloring.png — foi borderline, 96 KB):**
- [ ] Imagem carregou
- [ ] Flood fill funciona corretamente

---

## Salvar e reabrir desenho

- [ ] Colorir parcialmente a cena 1 de Noé
- [ ] Sair da ColoringScreen (botão Voltar)
- [ ] Entrar novamente na cena 1 de Noé
- [ ] O desenho foi **salvo e recarregado** corretamente?
- [ ] As cores estão no lugar certo?
- [ ] Não há borras ou posicionamento errado?

---

## StoryBook (Livrinho)

- [ ] Completar todas as 10 cenas de Noé (ou usar histórico salvo)
- [ ] Abrir Livrinho da Fé de Noé
- [ ] As imagens coloridas aparecem corretamente no Livrinho?
- [ ] As imagens não estão distorcidas ou pixeladas?
- [ ] A navegação entre cenas funciona normalmente?

---

## NarrationScreen

- [ ] Abrir cena 1 de Noé → NarrationScreen
- [ ] O personagem guia (`noe_sorrindo.png`) aparece sem distorção?
- [ ] A imagem de narração está com qualidade visual aceitável?

---

## Checklist de ausência de regressão

- [ ] Nenhuma tela branca em nenhuma das telas testadas
- [ ] Nenhum crash durante os testes
- [ ] Nenhuma imagem quebrada (símbolo de imagem corrompida)
- [ ] Nenhum vazamento de flood fill anormal observado
- [ ] As capas comprimidas (225-329 KB) têm qualidade visual aceitável para o contexto do app
- [ ] O app responde normalmente ao toque em todas as telas

---

## Resultado do QA manual

| Item | Status | Observação |
|---|---|---|
| HomeScreen | [ ] OK / [ ] FAIL | |
| Aventuras | [ ] OK / [ ] FAIL | |
| Colorir Noé (3 cenas) | [ ] OK / [ ] FAIL | |
| Colorir Davi (2 cenas) | [ ] OK / [ ] FAIL | |
| Colorir Jesus (2 cenas) | [ ] OK / [ ] FAIL | |
| Save/Load desenho | [ ] OK / [ ] FAIL | |
| StoryBook | [ ] OK / [ ] FAIL | |
| NarrationScreen | [ ] OK / [ ] FAIL | |
| Sem crash | [ ] OK / [ ] FAIL | |
| Sem tela branca | [ ] OK / [ ] FAIL | |

---

## Se algum item falhar

1. **NÃO** commitar as mudanças
2. Identificar qual arquivo comprimido causou o problema
3. Restaurar via backup:
   ```powershell
   $bk = "tmp\asset-compression-original-backup"
   Copy-Item "$bk\assets\stories\noe\colorir\noe_scene_XX_coloring.png" "assets\stories\noe\colorir\" -Force
   ```
4. Testar novamente com o original
5. Reportar o problema com captura de tela

---

## Se todos os itens passarem

✅ A compressão está aprovada para commit.

Seguir o commit descrito em `SPRINT_18_2_APPLY_TO_ORIGINALS_PLAN.md`.
