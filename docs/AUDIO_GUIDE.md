# Audio Guide — Pequenos Traços de Fé

## Princípios

- Narração por cena, iniciada por toque — sem autoplay
- Arquivos locais embutidos no bundle — funciona offline
- Se uma cena não tiver áudio real, o player não é exibido
- Em produção o player falso é proibido
- Livrinho da Fé reutilizará os mesmos arquivos de cena

---

## Estrutura de arquivos

```
assets/
  audio/
    pop.wav                                  ← efeito de toque (SoundButton)
    {storyId}/
      {storyId}_scene_01.mp3
      {storyId}_scene_02.mp3
      …
      {storyId}_scene_10.mp3
```

Exemplo real:
```
assets/audio/creation/creation_scene_01.mp3
```

---

## Como adicionar áudio para uma cena

1. Grave e exporte o arquivo como **MP3 mono, 44100 Hz, ~128 kbps**
2. Coloque em `assets/audio/{storyId}/{storyId}_scene_NN.mp3`
3. Abra `src/data/audioManifest.js`
4. Adicione uma entrada em `_readyEntries`:

```js
const _readyEntries = [
  {
    storyId: 'creation',
    sceneKey: 'scene_01',
    audioAsset: require('../../assets/audio/creation/creation_scene_01.mp3'),
  },
];
```

5. Nunca adicione `require()` para um arquivo que ainda não existe
6. Execute `npm run audio:audit` para verificar a cobertura

> Para o fluxo completo de gravação, OBS e entrega gradual, consulte `docs/AUDIO_PIPELINE_GUIDE.md`.

---

## Verificação de cobertura

```bash
# Relatório completo
npm run audio:audit

# Modo estrito (exit 1 se qualquer cena obrigatória estiver faltando)
npm run audio:audit:strict
```

Saída esperada enquanto nenhum arquivo existe:
```
creation                     [░░░░░░░░░░] 0/10  ✗ sem áudio
noah                         [░░░░░░░░░░] 0/10  ✗ sem áudio
…
0/200 scenes ready (0%)
200 scenes missing
```

Saída esperada ao atingir cobertura total:
```
noah                         [██████████] 10/10  ✓ COMPLETA
…
200/200 scenes ready (100%)
✓ All stories have full audio coverage. App is launch-ready.
```

---

## Arquitetura

| Arquivo | Responsabilidade |
|---|---|
| `src/data/audioManifest.js` | Source of truth: mapa de todos os 200 áudios (status + asset) |
| `src/services/audioService.js` | Funções de consulta ao manifesto (sem imports de áudio) |
| `src/components/AudioPlayer.js` | Player real expo-audio: `useAudioPlayer` + `useAudioPlayerStatus` |
| `src/screens/NarrationScreen.js` | Mostra AudioPlayer apenas quando `hasSceneAudio` retorna true |
| `src/components/story/StoryBookHero.js` | Chip 🎵 só aparece quando `storyHasAllRequiredAudio` retorna true |
| `scripts/audio-audit.js` | Relatório de cobertura filesystem × manifesto |

---

## Regras absolutas

- Não tocar áudio automaticamente ao abrir uma cena
- Não habilitar gravação de áudio (`allowsRecording: false`)
- Não habilitar áudio em background (`shouldPlayInBackground: false`)
- Não criar streaming remoto, download dinâmico ou backend de áudio
- Não adicionar permissões nativas (`android.permissions` permanece `[]`)
- Não reativar o player falso (`DURACAO_SIMULADA`) em produção

---

## Configuração de áudio (expo-audio)

Configurada em `SoundButton.js` e em `AudioPlayer.js`:

```js
import { setAudioModeAsync } from 'expo-audio';

await setAudioModeAsync({
  playsInSilentMode: true,        // toca mesmo no modo silencioso do iOS
  shouldPlayInBackground: false,
  allowsRecording: false,
  interruptionMode: 'mixWithOthers',
});
```

---

## Plugin expo-audio no app.json

O plugin **deve** ser configurado como array para evitar que permissões de microfone
sejam adicionadas automaticamente ao build nativo:

```json
"plugins": [
  "expo-font",
  ["expo-audio", { "microphonePermission": false, "recordAudioAndroid": false, "enableBackgroundRecording": false }]
]
```

> **Atenção:** `MODIFY_AUDIO_SETTINGS` (Android) sempre será adicionado pelo plugin —
> isso é esperado e inofensivo. O que não deve aparecer é `RECORD_AUDIO` ou
> `NSMicrophoneUsageDescription`.

---

## Checklist antes de publicar

- [ ] `npm run audio:audit:strict` passa sem erros
- [ ] `npm run smoke` — 85/85 checks passando
- [ ] `npm run qa` — sem incompatibilidades de versão
- [ ] `npm run doctor` — sem problemas detectados
- [ ] Todos os 20 stories com 10 cenas de áudio cada (200 arquivos)
- [ ] `ENABLE_LOCAL_PREMIUM_TEST_MODE = false` em `accessControl.js`
