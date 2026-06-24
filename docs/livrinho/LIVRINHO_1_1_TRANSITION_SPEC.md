# Spec curta — Bloco Livrinho 1.1: transição da arte colorida (file:// + preload)

**Tipo:** correção de performance (área **sensível** — desenhos/persistência/canvas) · **Modo:** SDD leve, rigor proporcional ao risco · **Base:** `origin/sprint_design_system_jornada_beni`.

> Documento de **especificação** (o quê e por quê). **Não** contém código. Implementação só após o Portão Humano.

## 1. Problema observado (usuário)

No **Livrinho da Fé**, ao transicionar de uma página com **arte colorida da criança** para outra, há uma **demora perceptível** — a próxima imagem "trava"/mostra "Carregando desenho…" antes de aparecer.

## 2. Causa raiz (confirmada no diagnóstico Livrinho 1.0)

- A arte da criança é exibida como **data URL base64 full-resolution** em `<Image source={{ uri: visual.paintUri }}>`.
- O componente `ChildArtWithLineart` só revela a página quando **`paintLoaded && lineartLoaded`** — ou seja, **espera o decode do base64** antes de mostrar.
- **Não há `Image.prefetch`/preload** da próxima página em todo o projeto → o decode começa **só na transição**.
- O **`file://`** da arte **já existe** no ponteiro v3 (`drawingStorage` → `buildPointer`), mas `getSavedDrawing`/`resolvePointer` o **reconverte para base64** (`fileBlobStore.readBlobAsDataUrl`) para preservar o contrato dos consumidores.
- Data URIs base64 passam a string inteira pela bridge e **não** aproveitam o cache nativo de imagem do RN como `file://`.

## 3. Objetivo da correção

Tornar a transição entre artes coloridas **rápida e fluida**, exibindo a arte por **`file://`** (decode nativo com cache) e **pré-carregando** a próxima página — **sem** alterar a forma como os desenhos são **salvos/editados** e **sem** regressão visual (cor + contorno juntos, sem flicker).

## 4. Caminho display-only por `file://` (ponteiros v3)

- Adicionar um caminho **somente de EXIBIÇÃO** (ex.: um resolvedor `getSavedDrawingDisplay` / um campo `paintUri = file://` derivado do ponteiro v3) usado **apenas pelo Livrinho**.
- Quando o desenho é v3 (tem `uri: file://`), o Livrinho renderiza **direto do arquivo** (`<Image source={{ uri: 'file://…' }}>`) — sem converter para base64.
- Os campos de **layout** (W/H/imgX/imgY/imgW/imgH) necessários ao alinhamento do lineart (modo v2 posicionado) continuam vindo do ponteiro, **inalterados**.

## 5. Fallback base64 para v1/v2 legados

- Desenhos antigos **v1** (data URL inline) e **v2** (JSON com `data`) **não têm arquivo** → continuam sendo exibidos por **base64** (caminho atual), **sem regressão**.
- O caminho display-only só usa `file://` quando o ponteiro v3 existe; senão, base64.

## 6. Preload / prefetch da próxima página

- Com `file://`, habilitar **`Image.prefetch(paintUri_da_próxima_página)`** durante a página atual (decode antecipado).
- O preload é **best-effort** (não bloqueia, falha silenciosa); aplica-se à(s) próxima(s) página(s) com arte da criança.
- Considerar prefetch também do **lineart** (asset) da próxima página, se medir ganho.

## 7. Preservação do contrato atual de `getSavedDrawing`

- **`getSavedDrawing` permanece inalterado** (continua retornando o payload v1/v2/base64) — a **ColoringScreen** e `hasMeaningfulPaint` dependem dele.
- A novidade é **aditiva** (um caminho display-only), **não** uma troca do contrato global.

## 8. Proibição: NÃO mexer na ColoringScreen neste bloco

- ❌ Não alterar `ColoringScreen`/canvas/WebView, `saveDrawingState`, `buildPointer`, migração A5 nem o formato de armazenamento.
- ❌ Não tocar Ateliê/Galeria, WebP, assets reais, `assets/stories/*`, nem o `298f227`.

## 9. Medir antes e depois (Constituição IV — medir antes de refatorar)

- **Antes:** instrumentar o tempo de transição/decode numa amostra (algumas cenas com arte da criança real) — registrar a latência percebida.
- **Depois:** repetir a medição com `file://` + prefetch e **comparar** (esperado: queda significativa).
- Registrar os números num breve relatório (sem assets), como nos pilotos de WebP.

## 10. Testes de regressão

- `parseDrawingPayload` v1 (data URL), v2 (JSON+data), v3 (ponteiro) seguem corretos.
- `hasMeaningfulPaint` inalterado (limiar, v1/v2/v3).
- **Arte v3** renderiza por `file://`; **v1/v2** renderiza por base64 (fallback) — ambos sem flicker (cor + contorno juntos).
- Alinhamento do **lineart no modo v2 posicionado** preservado (mesmas fórmulas `computeLineartStyle`/`computePaintStyle`).
- Estados de **fallback/erro/timeout** do `ChildArtWithLineart` preservados.
- `npm run smoke` + `npx expo-doctor` verdes.

## 11. Validação visual em device (obrigatória)

- iPhone (e tela menor): abrir o Livrinho de uma história **com várias cenas coloridas pela criança**; transicionar entre páginas e confirmar **transição rápida**, **sem** flash de cor sem contorno, **sem** "Carregando desenho…" perceptível.
- Conferir desenhos **antigos** (v1/v2) ainda aparecem corretamente.
- Comparar a latência com o estado atual (antes/depois).

## 12. Critérios de aceite (da futura implementação)

1. Arte v3 exibida por `file://` no Livrinho; v1/v2 por base64 (fallback).
2. Preload da próxima página ativo (best-effort).
3. `getSavedDrawing` e a ColoringScreen **inalterados**.
4. Sem regressão visual (cor+contorno juntos; alinhamento v2).
5. Medição antes/depois registrada (ganho comprovado).
6. `smoke` + `expo-doctor` verdes; validação visual em device aprovada.
7. Commit seletivo; sem tocar assets/`assets/stories`/`298f227`.

## Arquivos prováveis (na implementação — NÃO neste bloco de spec)

`src/services/drawingStorage.js` (resolvedor display-only aditivo) e/ou `src/services/storyBookPagesService.js` (expor `paintUri=file://`), `src/screens/StoryBookScreen.js` (usar `file://` + `Image.prefetch`), `scripts/smoke.js` (asserts de regressão), e um breve relatório de medição em `docs/`.
