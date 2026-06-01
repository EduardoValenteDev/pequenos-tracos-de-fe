# Audio Pipeline Guide — Pequenos Traços de Fé

**Sprint 16 — Preparação segura para áudio real**
**Última atualização:** 2026-05-27

---

## 1. Objetivo do pipeline

O app usa **200 arquivos MP3 locais** (20 histórias × 10 cenas cada). Eles são
embutidos no bundle do app e funcionam **100% offline**.

A estratégia de entrega é **gradual**: o app funciona sem nenhum áudio, e cada cena
registrada vai sendo habilitada individualmente. Antes de qualquer entrega, o arquivo
físico **deve existir** em `assets/audio/` — nunca o contrário.

```
Fluxo correto:
  1. Grave o MP3  →  2. Coloque em assets/audio/  →  3. Registre no manifest  →  4. Teste  →  5. Commit
```

---

## 2. Convenção de caminho — regra canônica

| Elemento | Padrão | Exemplo real |
|---|---|---|
| Pasta da história | `assets/audio/{storyId}/` | `assets/audio/creation/` |
| Nome do arquivo | `{storyId}_scene_{NN}.mp3` | `creation_scene_01.mp3` |
| Caminho completo | `assets/audio/{storyId}/{storyId}_scene_{NN}.mp3` | `assets/audio/creation/creation_scene_01.mp3` |
| require() no manifest | `require('../../assets/audio/{storyId}/{storyId}_scene_{NN}.mp3')` | `require('../../assets/audio/creation/creation_scene_01.mp3')` |

`NN` usa zero-padding: `01`, `02`, …, `10`.

---

## 3. Especificação técnica do arquivo MP3

| Parâmetro | Valor |
|---|---|
| Formato | MP3 |
| Canais | Mono (1 canal) |
| Taxa de bits | 128 kbps CBR |
| Taxa de amostragem | 44,1 kHz ou 48 kHz (manter consistente no projeto) |
| Normalização | –3 dBFS de pico |
| Silêncio no início | 0,3–0,5 s (para evitar corte abrupto no play) |
| Silêncio no final | 0,5–1,0 s (para a transição de cena não parecer abrupta) |

---

## 4. Guia de gravação com OBS

### 4.1. Configuração do ambiente

- Grave em ambiente silencioso: portas fechadas, ar-condicionado desligado
- Microfone a ~20 cm da boca, levemente desviado (evita plosivos)
- Grave 5 segundos de **tom de sala** (silêncio do ambiente) antes da narração
  — use esse trecho para configurar o gate de ruído, se necessário

### 4.2. Configuração do OBS

```
Áudio → Configurações de áudio:
  Taxa de amostragem: 48000 Hz (padrão OBS) — use 44100 Hz só se o microfone exigir
  Canais: Mono

Gravação → Tipo: Arquivo padrão
  Formato: WAV (gravar em WAV, converter para MP3 depois — preserva qualidade)
  Caminho: pasta temporária antes de mover para assets/audio/
```

### 4.3. Exportar para MP3 (pós-gravação)

**Opção A — Audacity (recomendado):**
1. Abrir o WAV no Audacity
2. Efeitos → Normalizar → –3 dBFS
3. Recortar silêncio excessivo no início e no final (deixar 0,5 s em cada extremidade)
4. Arquivo → Exportar → Exportar como MP3
5. Taxa de bits: 128 kbps, Modo: Constante (CBR), Canal: Mono

**Opção B — FFmpeg (linha de comando):**
```bash
ffmpeg -i gravacao_original.wav -ac 1 -ab 128k -ar 44100 creation_scene_01.mp3
```

### 4.4. Nomenclatura da gravação piloto (29/05/2026)

```
creation_scene_01.mp3  — Cena 1 de Criação (primeira cena do piloto)
```

---

## 5. Como registrar um áudio no manifest

Somente quando o arquivo físico já estiver em `assets/audio/`:

1. Mova o MP3 para `assets/audio/{storyId}/{storyId}_scene_{NN}.mp3`
2. Abra `src/data/audioManifest.js`
3. Adicione uma entrada em `_readyEntries`:

```js
const _readyEntries = [
  {
    storyId: 'creation',
    sceneKey: 'scene_01',
    audioAsset: require('../../assets/audio/creation/creation_scene_01.mp3'),
  },
];
```

4. Execute `npm run audio:audit` — deve mostrar `1/200 ready`
5. Execute `npm run smoke` — todos os checks devem passar
6. Teste no app (ver Seção 6)
7. Faça commit apenas depois que o teste passar

**Nunca adicione `require()` para um arquivo que ainda não existe em `assets/`.**

---

## 6. Testando uma cena com áudio

### 6.1. NarrationScreen (cena individual)

1. `npx expo start`
2. Navegar até a história `creation`, entrar na Cena 1
3. Verificar:
   - O hint "O som desta cena será adicionado depois" **não aparece** (foi substituído pelo player)
   - O AudioPlayer aparece com o botão ▶
   - Tocar ▶ — narração começa
   - Narração termina normalmente — `onFinished` não engatilha na NarrationScreen (não tem auto-avanço)
   - Cenas sem áudio (`scene_02` em diante) ainda mostram o hint

### 6.2. StoryBookScreen (Livrinho auto-play)

O Livrinho só avança automaticamente quando **TODAS** as cenas da história têm áudio.
Durante entrega gradual (ex.: só scene_01 tem áudio), ele mantém controles manuais.

Para testar com cena mista (1 cena com áudio, 9 sem):
1. Certifique-se que só `creation_scene_01` está em `_readyEntries`
2. Completar as 10 cenas da história `creation` no app
3. Abrir o Livrinho
4. Na Cena 1: AudioPlayer aparece, toque ▶, narração toca
5. Narração termina → `onSceneAudioComplete` → `advanceToNextScene` → Cena 2 carrega
6. Na Cena 2: AudioPlayer **não aparece** (audioAsset é null) — controles manuais ativo
7. Verificar que não há crash, não há loop infinito, não há auto-avanço sem áudio

---

## 7. Sprint 16.1 — Plano de execução (primeira entrega real)

Executar na data de gravação (29/05/2026 ou data acordada):

```
Passos exatos:

1. Gravar creation_scene_01.mp3 com OBS (Seção 4)
2. Exportar para MP3 mono 128kbps (Audacity ou FFmpeg)
3. Validar duração e qualidade (ouvir completo)
4. Mover para: assets/audio/creation/creation_scene_01.mp3
5. Editar src/data/audioManifest.js → adicionar entrada em _readyEntries (Seção 5)
6. npm run audio:audit                → deve mostrar 1/200 ready
7. npm run smoke                      → deve passar todos os checks
8. npx expo start → testar NarrationScreen (Seção 6.1)
9. npx expo start → testar StoryBookScreen (Seção 6.2)
10. git add assets/audio/creation/creation_scene_01.mp3
    git add src/data/audioManifest.js
    git commit -m "feat(audio): add narration for creation scene 01 (pilot)"
11. npm run build:preview:android     → gerar novo APK com áudio
12. Instalar no device e testar novamente em contexto real
```

**Critérios de sucesso:**
- `npm run audio:audit` mostra `1/200 ready`
- `npm run smoke` passa 100% dos checks
- NarrationScreen: player aparece e toca sem crash
- StoryBookScreen: cena 1 toca, cena 2+ avanço manual — sem crash

---

## 8. Entrega gradual — plano de batches

| Batch | Quando | O que entregar |
|---|---|---|
| Sprint 16.1 | 29/05/2026 | creation_scene_01.mp3 (piloto) |
| Sprint 16.2 | Semana 1 após piloto | creation completo (10 cenas) |
| Sprint 16.3 | Semana 2 | noah completo (10 cenas) |
| Sprints seguintes | Conforme disponibilidade | 1–2 histórias por sprint |

O app é publicável com 0/200 áudios — o lançamento não precisa esperar cobertura total.

---

## 9. Imagens de capa e lineart

- **Capas 16:9** (Midjourney): início em 05/06/2026 — um arquivo por história
- **Linearts de colorir** (ChatGPT): início em 05/06/2026 — um por cena
- **Livrinho**: usa os desenhos pintados pelo usuário — **não há imagem narrativa separada**

Registrar em `src/assets/images.js` conforme o guia existente (`MEDIA_PLACEHOLDER_GUIDE.md`).
Nunca adicionar `require()` em `images.js` antes do arquivo existir.

---

## 10. Checklist antes de cada entrega de áudio

- [ ] Arquivo MP3 já está em `assets/audio/{storyId}/{storyId}_scene_{NN}.mp3`
- [ ] `npm run audio:audit` — contagem aumentou +1
- [ ] `npm run smoke` — 100% dos checks passando
- [ ] Testado em NarrationScreen (player aparece e toca)
- [ ] Testado em StoryBookScreen (auto-avanço ou controle manual conforme esperado)
- [ ] `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` confirmado
- [ ] Commit inclui apenas o MP3 e a alteração no manifest (nada mais)

---

## 11. Regras absolutas

1. Não adicionar `require()` para arquivo que não existe em `assets/`
2. Não definir `status: 'ready'` sem um `require()` correspondente
3. Não usar streaming remoto, CDN ou download dinâmico nesta fase
4. Não habilitar gravação de áudio (`allowsRecording: false` permanece)
5. Não habilitar áudio em background (`shouldPlayInBackground: false` permanece)
6. Não alterar `AudioPlayer.js` — arquitetura aprovada
7. Não alterar `StoryBookScreen.js` — auto-avanço já implementado e aprovado
8. Não alterar `NarrationScreen.js` — lógica de exibição condicional aprovada
9. Não instalar `expo-updates` — OTA desabilitado intencionalmente
10. `ENABLE_LOCAL_PREMIUM_TEST_MODE` deve permanecer `false` sempre
