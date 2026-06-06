# Guia — Ilustrações Oficiais de Cena (Beni Histórias)

Como adicionar as ilustrações oficiais geradas por IA, uma por cena, sem quebrar
nada do app (progresso, estrelas, quiz, livrinho, Guardar no coração, premium,
colorir, Ateliê).

Cada história tem até **10 cenas** → até **200 ilustrações** no total (20 histórias).

---

## 1. Onde salvar as imagens

Uma pasta por história, com uma subpasta `scenes`:

```
assets/stories/<storyId>/scenes/
```

O `<storyId>` é **exatamente** o `id` da história em `src/data/stories.js`.
IDs reais (não invente novos):

```
creation, noah, david_goliath, jesus_children, daniel_lions,
jonah_big_fish, lost_sheep, good_samaritan, abraham_stars,
joseph_colorful_coat, moses_red_sea, ruth_naomi, esther_queen,
miraculous_catch, samuel_hears_god, josiah_young_king, solomon_wisdom,
mary_says_yes, timothy_faith, jesus_temple
```

Exemplo:
```
assets/stories/creation/scenes/
assets/stories/noah/scenes/
```

---

## 2. Como nomear cada arquivo

```
<storyId>_scene_NN.png
```

- `NN` = número da cena com **dois dígitos** (`01`..`10`).
- Formato preferido: **PNG**. (jpg/webp também são aceitos pela auditoria.)

Exemplos:
```
assets/stories/creation/scenes/creation_scene_01.png
assets/stories/creation/scenes/creation_scene_02.png
assets/stories/noah/scenes/noah_scene_01.png
```

---

## 3. Como registrar cada imagem no manifesto

O manifesto único é `src/data/storySceneIllustrations.js`.

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

Regras de registro:
- **Só** registre o arquivo depois que ele existir no disco. `require()` para
  arquivo inexistente **quebra o bundler**.
- Nada de caminho montado por string nem `require` dinâmico.
- Cena sem arte → simplesmente **não registre** (resolve para `null`, e a tela
  usa o fallback de ambientação automaticamente).

---

## 4. Como rodar a auditoria

```
npm run scene:images:audit
```

Mostra, por história e no total, quantas ilustrações oficiais estão registradas,
quantas faltam, e avisa sobre arquivos com nome fora do padrão. **Nunca falha**
por imagem ausente — é só um relatório de status.

---

## 5. Como validar no app

1. `npm run smoke` deve continuar passando.
2. Abra a história na **NarrationScreen**:
   - Cena **com** ilustração oficial → mostra a imagem 16:9 + selo **Cena ilustrada**.
   - Cena **sem** ilustração oficial → mostra a capa desfocada como ambientação +
     selo **Cena especial** (a capa **não** finge ser a imagem da cena).

A resolução é central: `getOfficialSceneIllustration(storyId, sceneId)` em
`src/services/storyImageService.js`, consumido por `StorySceneVisual`.

---

## 6. O que NÃO fazer

- ❌ Não sobrescrever as **capas** (`assets/images/<id>_cover.png`).
- ❌ Não colocar ilustrações oficiais dentro da pasta de **colorir**.
- ❌ Não usar imagens de **colorir** como ilustração oficial (são linha-arte).
- ❌ Não alterar **IDs** de história nem de cena.
- ❌ Não alterar **textos narrativos**, **progresso** ou **estrelas**.
- ❌ Não criar `require()` para arquivo que ainda não existe.
- ❌ Não pré-carregar as 200 imagens de uma vez (carregamento é sob demanda,
  no máximo a história/cena atual).
