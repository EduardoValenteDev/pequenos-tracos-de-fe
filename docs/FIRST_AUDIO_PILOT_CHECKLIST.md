# Checklist do Primeiro Áudio Piloto — Pequenos Traços de Fé

**Sprint 16.1 — Integração do primeiro MP3 real**
**História:** A Criação — Cena 1
**Data prevista:** 29/05/2026

---

## ANTES DE GRAVAR

- [ ] Escolher a Cena 1 da história **A Criação** (`creation`)
- [ ] Ler o texto da cena no app antes de gravar
- [ ] Gravar em ambiente silencioso (portas fechadas, ar-condicionado desligado)
- [ ] Microfone a ~20 cm da boca, levemente desviado (evita plosivos)
- [ ] Gravar 5–10 segundos de **silêncio do ambiente** antes de começar a narrar
  (serve como referência para remoção de ruído no Audacity)
- [ ] Falar devagar — crianças pequenas precisam de tempo para absorver
- [ ] Sorrir enquanto fala — muda o timbre da voz para mais acolhedor
- [ ] Uma cena por arquivo — não misturar cenas

---

## GRAVAÇÃO E EXPORTAÇÃO

- [ ] Gravar em OBS como WAV (qualidade total, converte depois)
- [ ] Abrir no Audacity → normalizar para –3 dBFS
- [ ] Aparar silêncio excessivo no início e no final (deixar ~0,5 s de margem)
- [ ] Exportar como **MP3**:
  - Canais: **Mono**
  - Taxa de bits: **128 kbps CBR**
  - Taxa de amostragem: **44.1 kHz** ou **48 kHz**
- [ ] Nome do arquivo: **`creation_scene_01.mp3`** — exatamente esse, sem espaços, sem acento
- [ ] Tamanho esperado: menos de 1,5 MB (90 s de narração típica)

---

## VALIDAÇÃO ANTES DE INTEGRAR

- [ ] Ouvir o arquivo completo fora do app (player de mídia do computador)
- [ ] Confirmar que não está estourado (distorção)
- [ ] Confirmar que não tem eco ou reverberação forte
- [ ] Confirmar que não tem ruído de fundo alto
- [ ] Confirmar que o nome está **exatamente** `creation_scene_01.mp3`
- [ ] Confirmar que a extensão é `.mp3` (não `.MP3`, não `.m4a`, não `.wav`)
- [ ] Confirmar tamanho: de 500 KB a 1,5 MB é normal para ~90 s a 128 kbps

---

## INTEGRAÇÃO NO SPRINT 16.1

- [ ] Mover arquivo para: `assets/audio/creation/creation_scene_01.mp3`
- [ ] Abrir `src/data/audioManifest.js`
- [ ] Adicionar entrada em `_readyEntries` (entre os colchetes `[` e `]`):

```js
const _readyEntries = [
  {
    storyId: 'creation',
    sceneKey: 'scene_01',
    audioAsset: require('../../assets/audio/creation/creation_scene_01.mp3'),
  },
];
```

  ⚠ **Não adicionar `status:`** — ele é gerado automaticamente por `_entry()`.

- [ ] Executar: `npm run audio:audit`
  - Resultado esperado: `1/200 ready`
  - Se aparecer `✗ INTEGRITY ERROR` → o arquivo não está no caminho certo
- [ ] Executar: `npm run smoke`
  - Resultado esperado: todos os checks passando
- [ ] Executar: `npm run audio:audit:self-test`
  - Resultado esperado: 13/13 scenarios passed

---

## TESTE NO APP (NarrationScreen)

- [ ] `npx expo start`
- [ ] Navegar até **A Criação** → entrar na **Cena 1**
- [ ] Verificar que o **AudioPlayer aparece** (botão ▶ laranja)
- [ ] Verificar que o hint "O som desta cena será adicionado depois" **não aparece**
- [ ] Tocar ▶ — narração começa sem crash
- [ ] Narração termina — botão muda para ✓ (done)
- [ ] Navegar para a **Cena 2** — verificar que o hint aparece (sem áudio ainda)
- [ ] Confirmar que não há crash em nenhuma dessas navegações

---

## TESTE NO APP (StoryBookScreen — Livrinho)

- [ ] Completar as 10 cenas da história **A Criação** (colorir todas)
- [ ] Abrir o **Livrinho da Fé** → apertar "Iniciar Livrinho"
- [ ] **Cena 1**: AudioPlayer aparece → toque ▶ → narração toca
- [ ] Narração da Cena 1 termina → **Cena 2 carrega automaticamente** (auto-avanço)
- [ ] **Cena 2**: AudioPlayer **não aparece** (sem áudio) → controles manuais ativos
- [ ] Usar ▶▶ para avançar manualmente — sem crash
- [ ] Repetir até a Cena 10 → tela "Livrinho Pronto!" aparece
- [ ] Confirmar ausência de player falso (não deve aparecer ▶ em cenas sem áudio)

---

## COMMIT E BUILD

- [ ] Verificar que apenas 2 arquivos mudaram:
  - `assets/audio/creation/creation_scene_01.mp3` (novo)
  - `src/data/audioManifest.js` (1 entrada adicionada em `_readyEntries`)
- [ ] **Não commitar** nenhum outro arquivo
- [ ] Fazer commit:

```
feat(audio): add narration for creation scene 01 (pilot)

First real audio file. Validates the full pipeline:
NarrationScreen player, StoryBookScreen auto-advance chain.
```

- [ ] `npm run build:preview:android` — gerar novo APK com o áudio
- [ ] Instalar APK no device e testar novamente (confirmar que o áudio toca no device físico)

---

## O QUE NÃO FAZER

- Não adicionar mais de uma cena no Sprint 16.1 (testar um de cada vez)
- Não adicionar cenas de outras histórias ainda
- Não adicionar música de fundo
- Não adicionar efeitos sonoros
- Não alterar AudioPlayer, StoryBookScreen ou NarrationScreen
- Não commitar com `ENABLE_LOCAL_PREMIUM_TEST_MODE = true`
