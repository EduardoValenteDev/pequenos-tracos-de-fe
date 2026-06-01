# MEDIA_PLACEHOLDER_GUIDE — Pequenos Traços de Fé

**Sprint 13 — 2026-05-26**

Guia de como tratar ausência temporária de mídia (imagens, capas, linearts, áudios)
de forma bonita, honesta e intencional.

---

## 1. Princípio

A ausência de mídia final é planejada — o app funciona completamente sem ela.
Nunca exibir erro técnico, imagem quebrada ou texto confuso para a criança.
Toda ausência deve parecer uma "cena que ainda vai ser revelada", não um bug.

---

## 2. Histórias sem capa final (StoryCard 16:9)

**Comportamento atual:** `StoryFallbackCover` com cor do tema + FaithIcon + título.

**Regras:**
- Usar `StoryFallbackCover` — nunca `<Image>` para source inexistente
- Usar `themeColor` da história ou cor padrão da trilha
- Manter proporção 16:9
- Não exibir "placeholder" ou "sem imagem" para a criança
- Preparado para trocar por capa real: basta adicionar `imagemCapa` em `stories.js`
  e registrar em `src/assets/images.js`

**Texto permitido (visual interno ao card):** nenhum — apenas emoji + título curto

---

## 3. Cenas sem imagem de narração (NarrationScreen)

**Comportamento atual:** `LinearGradient` com cor do tema + emoji + título da cena.

**Fallback visual:**
```jsx
<LinearGradient colors={[corTema, corTema + 'BB']} style={styles.ilustracaoFallback}>
  <Text>{emojiCena}</Text>
  <Text>{tituloCena}</Text>
  <Text style={styles.fallbackSub}>Ilustração em breve</Text>
</LinearGradient>
```

**Texto permitido para criança:** "Ilustração em breve"
**Texto proibido:** "sem imagem", "missing", "erro", "null", "placeholder"

---

## 4. Cenas sem áudio (NarrationScreen / AudioPlayer)

**Comportamento:** `hasSceneAudio()` retorna false → AudioPlayer não é montado.
Em vez disso, exibe texto suave de orientação.

**Texto infantil (NarrationScreen):**
> "🔇 O som desta cena será adicionado depois. Você pode ler com calma."

**Estilo:** `noAudioHint` — fundo roxo suave, letra itálica, discreta.

**Regra crítica:** `audioManifest.js` não deve ser alterado para incluir um `require()`
em `_readyEntries` sem que o arquivo de áudio real exista em `assets/audio/`.
O `audio:audit` reportará `0/200 ready` enquanto não houver áudio real — isso é
esperado e correto. O contador aumentará gradualmente conforme os áudios forem entregues.

---

## 5. Livrinho sem arte colorida (StoryBookScreen)

**`resolveStoryBookVisual()` retorna um de 4 tipos:**
| Tipo | Situação | Visual |
|---|---|---|
| `paintWithLineart` | Pintura v2 + lineart disponíveis | Overlay perfeito |
| `paintOnly` | Pintura v1 ou sem layout | Só a pintura |
| `lineartOnly` | Sem pintura, lineart existe | Cena original sem cor |
| `fallback` | Sem pintura, sem lineart | Gradiente + emoji + título |

**O fallback já é bonito e intencional.** Não adicionar texto técnico.
O `fallback` usa `cena.corTema` e `cena.emojiCena` para visual coerente.

---

## 6. Textos PROIBIDOS para a criança em qualquer tela

| Proibido | Substituir por |
|---|---|
| `missing` | silencioso ou mensagem suave |
| `undefined` | vazio ou fallback visual |
| `null` | vazio ou fallback visual |
| `erro` / `error` | mensagem amigável |
| `sem asset` | visual de placeholder |
| `no audio file` | "Som chegando em breve" |
| `placeholder técnico` | FaithIcon + cor do tema |
| `imagem indisponível` | fallback visual colorido |
| `áudio indisponível` | texto suave ou silêncio |
| `falha ao carregar` | retry amigável |

---

## 7. Textos PERMITIDOS por área

### Área infantil (telas da criança)
- "Ilustração em breve"
- "🔇 O som desta cena será adicionado depois. Você pode ler com calma."
- "Esta aventura já pode ser explorada."
- "⭐ Pinte sua primeira cena para acender a primeira estrelinha!"
- "Imagem especial chegando em breve."

### Área dos Pais (ParentAreaScreen)
- "Áudios ainda não foram adicionados — serão incluídos em atualização futura."
- "Imagens finais serão adicionadas em etapa futura."
- "Conteúdo visual provisório para MVP."

---

## 8. Checklist por tela

| Tela | Sem capa | Sem áudio | Sem arte | Estado vazio |
|---|---|---|---|---|
| StoriesScreen | ✅ StoryFallbackCover | — | — | ✅ (histórias sempre presentes) |
| StoryDetailScreen | ✅ StoryFallbackCover | — | — | — |
| NarrationScreen | ✅ Gradiente | ✅ Texto suave | — | — |
| StoryBookScreen | — | ✅ Manual | ✅ fallback visual | — |
| TrophiesScreen | — | — | — | ✅ Incentivo positivo |
| AtelierGalleryScreen | — | — | — | ✅ "Comece a desenhar" |
| ProfileScreen | — | — | — | ✅ "Pequeno artista" |
| ParentAreaScreen | — | — | — | ✅ Progresso mostra 0 |

---

## 9. Como substituir mídia provisória por final

### Capa de história
1. Colocar PNG 16:9 em `assets/images/`
2. Registrar em `src/assets/images.js`
3. Adicionar `imagemCapa: 'chave_da_imagem'` na história em `src/data/stories.js`
4. `StoryCoverImage` ou `StoryCard` detecta automaticamente

### Áudio de narração
1. Colocar MP3 em `assets/audio/`
2. Registrar em `src/data/audioManifest.js` com `ready: true`
3. `hasSceneAudio()` passa a retornar `true` para aquela cena
4. AudioPlayer é montado automaticamente em NarrationScreen e StoryBookScreen

### Lineart de colorir
1. Colocar PNG em `assets/coloring/`
2. Registrar em `src/assets/coloringImages.js`
3. Tela de colorir detecta via `getColoringImage(storyId, cenaId)`

---

## 10. Pendências futuras

- [ ] Capas finais 16:9 para todas as 20 histórias
- [ ] Narrações MP3 para todas as cenas (A Criação: 10, Noé: 10, Davi: 10, Jesus: 10...)
- [ ] Revisão visual das linearts provisórias
- [ ] Imagens de narração para cenas sem ilustração
