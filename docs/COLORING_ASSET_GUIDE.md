# COLORING_ASSET_GUIDE — Sprint 9.4

**Última atualização:** Sprint 9.4 (2026-05-26)

---

## ⚠️ Desenhos atuais são provisórios (MVP técnico)

Os desenhos presentes no app até o Sprint 9.4 são **assets provisórios** criados para validar o motor de pintura. A qualidade do preenchimento por toque mobile depende criticamente de linearts especificamente desenhadas para uso infantil em tela touchscreen.

**O que muda com linearts definitivas:**
- Regiões maiores e mais fáceis de tocar
- Linhas fechadas sem lacunas
- Contornos mais grossos (≥ 4 px recomendado para MVP)
- Menos detalhes pequenos e mais áreas abertas
- Resultado de preenchimento muito mais limpo e satisfatório para a criança

**Os assets provisórios NÃO devem ser usados como referência de qualidade de preenchimento.** Avalie o motor (BFS, thresholds, multiply blend) com linearts corretas antes de qualquer ajuste no código.

---

## 1. Propósito

Este guia define os padrões de criação de imagens de colorir para o app **Pequenos Traços de Fé**. Seguir estas regras garante que o motor BFS funcione corretamente, sem falhas brancas, sem sangramento entre regiões e com preenchimento suave.

Destinatário: designer ou ilustrador que produz os arquivos PNG de lineart para as cenas de colorir.

---

## 2. Formato do arquivo

| Parâmetro | Valor |
|---|---|
| Formato | PNG com fundo branco sólido |
| Espaço de cor | sRGB |
| Resolução mínima | 800 × 800 px |
| Resolução recomendada | 1200 × 1200 px (quadrado) ou 1200 × 900 px (paisagem) |
| Máximo | 1600 px no maior lado |
| Canal alpha | **Não usar** — fundo deve ser branco sólido (#FFFFFF) |

**Por que sem alpha?** O motor de renderização usa multiply blending sobre um fundo creme (#FFFDF8). Pixels de fundo branco desaparecem com multiply (branco × cor = cor). Canal alpha quebraria a renderização.

---

## 3. Linhas

### Espessura mínima
- Linhas de contorno principais: **3 px** no arquivo original
- Linhas de detalhe internas: **2 px** mínimo

Linhas mais finas que 2 px podem não formar barreiras BFS confiáveis em telas de baixa densidade.

### Cor das linhas
- **Preto puro (#000000)** para contornos principais
- Cinzas escuros (#111–#333) são aceitos para detalhes secundários
- **Não usar** linhas coloridas — o motor usa luminância para detectar barreiras (lum < 210 para BFS, lum < 230 para rejeição de toque)

### Anti-aliasing
- Linhas devem ter anti-aliasing **ativado** — pixels de transição (lum 210–229) são tratados pelo BFS fringe threshold
- Linhas com anti-aliasing desativado (jagged) funcionam, mas o resultado visual é menos suave
- Pixels de fringe com lum < 210 são tratados como barreira — não criar transições muito longas

---

## 4. Regiões de preenchimento

Cada região que a criança vai colorir deve ser **fechada** — os contornos de toda região devem se encontrar sem lacunas.

### Checklist de fechamento

- [ ] Nenhuma linha interrompida em junctions (onde linhas se cruzam)
- [ ] Linhas alcançam a borda da imagem quando necessário (para regiões que tocam o limite)
- [ ] Nenhuma lacuna visível de 1–2 px que conectaria duas regiões

**Teste rápido:** abrir o PNG no app e tocar em cada região. Se o preenchimento vazar para uma região adjacente, há uma lacuna.

### Regiões muito pequenas
Evitar regiões menores que 10 × 10 px. O BFS preenche corretamente, mas a usabilidade é ruim (difícil tocar com precisão em iPhone).

### Regiões de fundo
O fundo do desenho (área externa, céu, chão) pode se conectar às bordas da imagem. O motor confina o BFS dentro de `[imgX, imgY, imgW, imgH]` — isso é seguro.

---

## 5. Cores de fundo no arquivo

O fundo da imagem deve ser **branco puro (#FFFFFF)**. Não usar:
- Creme, bege ou off-white no fundo
- Gradientes no fundo
- Cores de fundo — o app usa o sistema de multiply para compor o resultado visual

---

## 6. Nomenclatura e localização dos arquivos

```
src/assets/coloring/
  historia_{storyId}_cena_{cenaId}.png
```

Exemplos:
```
historia_1_cena_1.png
historia_1_cena_2.png
historia_2_cena_1.png
```

Os arquivos são registrados em `src/assets/coloringImages.js`:

```js
// coloringImages.js
const images = {
  '1_1': require('./coloring/historia_1_cena_1.png'),
  '1_2': require('./coloring/historia_1_cena_2.png'),
};
```

**Nunca** usar `require()` dinâmico (variável no path) — Metro não consegue bundlar assets dinâmicos.

---

## 7. Thresholds do motor BFS (não alterar)

| Threshold | Valor | Função |
|---|---|---|
| `isBarrier` (tap rejection) | lum < 230 | Rejeita toque inicial em cima de linha |
| `isBFSBarrier` (expansão) | lum < 210 | Barreira de expansão durante BFS |

Linhas sólidas têm lum < 80 — muito abaixo de ambos os thresholds.
Anti-aliasing pesado tem lum 80–180 — bloqueado por ambos.
Fringe externo tem lum 210–229 — livre no BFS, bloqueado no tap rejection.

**Não ajustar esses valores** sem reavaliação completa de todas as imagens do catálogo.

---

## 8. Aspect ratio e composição

O motor calcula o tamanho do canvas baseado no aspect ratio natural da imagem e no espaço disponível em tela. Imagens são exibidas com `contain` (proporção preservada, centralizada).

| Tipo | Aspect ratio recomendado | Observação |
|---|---|---|
| Cena principal | 4:3 (1200 × 900) | Ocupa bem a tela de iPhone em landscape e portrait |
| Cena quadrada | 1:1 (1200 × 1200) | Boa para cenas com personagem centralizado |
| Cena retrato | 3:4 (900 × 1200) | Usa menos da tela — evitar se possível |

Imagens muito estreitas (aspect ratio > 3:2 ou < 1:2) podem ficar pequenas na tela.

---

## 9. Checklist de validação antes de entregar

- [ ] PNG com fundo branco sólido, sem alpha
- [ ] Resolução entre 800 px e 1600 px no maior lado
- [ ] Todas as regiões fechadas (sem lacunas nas linhas)
- [ ] Linhas com espessura mínima 2 px
- [ ] Anti-aliasing ativado
- [ ] Arquivo nomeado conforme padrão `historia_{id}_cena_{id}.png`
- [ ] Registrado em `coloringImages.js`
- [ ] Testado no app (tap em cada região, sem vazamento)

---

## 10. O que NÃO fazer

| Proibido | Motivo |
|---|---|
| PNG com canal alpha | Quebra multiply blending |
| Fundo colorido ou gradiente | Aparece como cor sólida após multiply |
| Linhas de cor não-preta | Motor usa luminância para barreiras |
| Linhas com menos de 2 px | BFS pode atravessar linhas finas |
| Regiões não fechadas | BFS vaza para regiões adjacentes |
| `require()` dinâmico em coloringImages.js | Metro não bundla assets dinâmicos |
| Alterar thresholds 230/210 sem reavaliação | Pode quebrar todas as imagens existentes |
