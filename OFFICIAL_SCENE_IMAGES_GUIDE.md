# Guia — Imagens Oficiais de Cena (IA) | Beni Histórias

Pipeline para cadastrar, auditar e exibir as ilustrações oficiais geradas por IA,
uma por cena. 20 histórias × até 10 cenas = até **200 imagens**.

A integração no app já existe: registrar a imagem no manifesto é suficiente para
ela aparecer automaticamente na NarrationScreen e no Livrinho da Fé. Nenhum código
de tela precisa mudar.

---

## 1. Onde colocar as imagens

Uma pasta por história, com subpasta `scenes`:

```
assets/stories/<storyId>/scenes/
```

`<storyId>` é **exatamente** o `id` da história em `src/data/stories.js`:

```
creation, noah, david_goliath, jesus_children, daniel_lions,
jonah_big_fish, lost_sheep, good_samaritan, abraham_stars,
joseph_colorful_coat, moses_red_sea, ruth_naomi, esther_queen,
miraculous_catch, samuel_hears_god, josiah_young_king, solomon_wisdom,
mary_says_yes, timothy_faith, jesus_temple
```

---

## 2. Padrão de nome

```
<storyId>_scene_NN.png      (NN = 01..10, dois dígitos)
```

Exemplos:
```
assets/stories/creation/scenes/creation_scene_01.png
assets/stories/creation/scenes/creation_scene_02.png
assets/stories/noah/scenes/noah_scene_01.png
```

Formato preferido: **PNG** (jpg/webp também aceitos pela auditoria). Proporção
oficial **4:5 (retrato)** — ver a regra visual definitiva na seção 5.1.

---

## 3. Como cadastrar no manifesto

Fonte única: `src/data/storySceneIllustrations.js`.

Para **cada imagem que já existe no disco**, adicione um `require()` **estático**
no mapa da história, com a chave igual ao **número da cena** (`cena.id`, 1..10):

```js
export const STORY_SCENE_ILLUSTRATIONS = {
  creation: {
    1: require('../../assets/stories/creation/scenes/creation_scene_01.png'),
    2: require('../../assets/stories/creation/scenes/creation_scene_02.png'),
  },
  noah: {
    1: require('../../assets/stories/noah/scenes/noah_scene_01.png'),
  },
  // ...
};
```

Resolução central: `getOfficialSceneIllustration(storyId, sceneId)` em
`src/services/storyImageService.js` — retorna o asset ou `null`, sem nunca lançar erro.

Regras:
- **Só** registre depois que o arquivo existir. `require()` de arquivo inexistente
  **quebra o bundler**.
- Nada de caminho por string nem `require` dinâmico.
- Cena sem arte → não registre (resolve para `null` → fallback automático).
- Não usar imagens de **colorir** nem **capas** como ilustração oficial.

---

## 4. Como rodar a auditoria

```
npm run scene:images:audit            # global, informativo, nunca falha (exit 0)
npm run scene:images:audit:strict     # global, falha (exit 1) se faltar qualquer imagem

# Por história (escopo de 10 cenas):
npm run scene:images:audit -- --story creation
npm run scene:images:audit -- --story creation --strict
# atalhos equivalentes:
npm run scene:images:audit:story -- creation
npm run scene:images:audit:story:strict -- creation
```

A auditoria mostra: histórias avaliadas, cenas avaliadas, imagens encontradas,
imagens ausentes, **lista de ausentes por história/cena**, **lista de encontradas**
e avisos de arquivos fora do padrão de nome. No modo `--story`, também lista o
**caminho esperado de cada um dos 10 arquivos** daquela história. `storyId`
inválido → erro claro com a lista de IDs disponíveis (exit 1).

> Enquanto não houver imagens, o modo **strict falha de propósito** (0 de N).
> Isso é esperado e serve de "portão" para quando a entrega estiver completa.

---

## 4.1. Produção por história (fluxo recomendado)

Não geramos as 200 imagens de uma vez. Produzimos **uma história piloto por vez**:

1. **Escolha uma história piloto** (ex.: `creation`).
2. **Gere as 10 imagens em 4:5 (retrato)** (uma por cena).
3. **Salve cada imagem** no caminho correto:
   `assets/stories/creation/scenes/creation_scene_01.png` … `_scene_10.png`.
4. **Registre cada `require()`** em `src/data/storySceneIllustrations.js` (só após
   o arquivo existir).
5. **Rode a auditoria da história:**
   `npm run scene:images:audit -- --story creation` (e `--strict` para o portão).
6. **Teste a NarrationScreen** das cenas: deve mostrar a imagem oficial + **Cena ilustrada**.
7. **Teste o Livrinho → História ilustrada:** usa as imagens oficiais.
8. **Teste o Livrinho → Livrinho misto:** oficial + arte da criança como slides separados.
9. **Só então avance** para a próxima história.

A história está **pronta** quando:
`npm run scene:images:audit -- --story <storyId> --strict` → **exit 0** (10 de 10).

Acompanhe o progresso em [`OFFICIAL_SCENE_IMAGES_CHECKLIST.md`](OFFICIAL_SCENE_IMAGES_CHECKLIST.md).

---

## 5. Como validar no app

Depois de registrar e rodar a auditoria:

- **NarrationScreen**: a cena com imagem oficial mostra a imagem 4:5 + selo
  **Cena ilustrada** (via `StorySceneVisual`). Sem imagem → capa como ambientação +
  **Cena especial**.
- **Livrinho da Fé → História ilustrada**: usa a imagem oficial; sem ela, fallback
  **Cena especial / "Imagem da cena em breve."** Nunca usa arte da criança.
- **Livrinho da Fé → Livrinho misto**: mostra a imagem oficial **e** a arte da
  criança como **slides separados** da mesma cena.
- **Livrinho da Fé → Minhas artes**: usa só arte da criança; **não** usa oficial.

Carregamento antecipado: ao abrir o Livrinho, `preloadStorySceneIllustrations(storyId)`
prepara só as imagens **da história aberta** (sem preload global de 200).

---

## 5.1. Regra visual definitiva (4:5 retrato, responsiva)

As imagens oficiais de cena são produzidas em **4:5 (retrato)** e, no app, devem
**sempre aparecer** maiores e imersivas, **sem ocupar a tela inteira** — sempre
sobra espaço confortável para texto, áudio, botões e Safe Area.

O tamanho é **responsivo**, calculado a partir da altura útil da tela mantendo
4:5 real (constantes/funções em `src/constants/officialImage.js`):

```
OFFICIAL_IMAGE_ASPECT_RATIO = 4 / 5    // largura/altura
computeSceneImageSize(w, h)  → ~46% da altura útil   (NarrationScreen)
computeBookImageSize(w, h)   → ~56% da altura útil   (Livrinho, mais protagonista)
resizeMode: 'cover'          // arquivo 4:5 em quadro 4:5 → preenche sem corte
```

- **NarrationScreen:** imagem oficial 4:5 centralizada, ocupando ~46% da altura
  útil — protagonista, com texto e botões logo abaixo.
- **Livrinho da Fé:** imagem 4:5 um pouco maior (~56% da altura útil), logo abaixo
  do header, com painel inferior compacto (título, contador, controles).

Em telas pequenas o tamanho reduz automaticamente; em tablets a largura é limitada.
A imagem **nunca** vira página de tela cheia, **nunca** distorce/achata e
**nunca** corta de forma agressiva (4:5 em 4:5 não corta). Os controles ficam em
área separada, respeitando a Safe Area inferior.

---

## 6. O que acontece quando a imagem ainda não existe

Nada quebra. `getOfficialSceneIllustration` devolve `null` e a tela cai no
fallback elegante (gradiente da cor-tema + emoji + título + selo **Cena especial**).
A experiência atual continua idêntica até a imagem ser cadastrada.

---

## 7. O que NÃO fazer

- ❌ `require()` para arquivo inexistente.
- ❌ Sobrescrever capas (`assets/images/<id>_cover.png`).
- ❌ Misturar com a pasta de colorir.
- ❌ Alterar IDs de história/cena, textos narrativos, progresso ou estrelas.
- ❌ Pré-carregar as 200 imagens de uma vez.
