# F2.4d.3 — Downloader genérico de cenas por storyId (via manifesto global)

> **Bloco:** F2.4d.3 (Opção B, passo 3). **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `9fc5c71`.
> Implementa o download **genérico por storyId** das **cenas** de um pack, descobrindo
> `baseUrl`/`version`/`manifestPath` pelo `content-manifest.json` global (F2.4d.1/F2.4d.2).
> Relacionado: [F2.4d.0](F2_4D_0_REMOTE_DOWNLOADER_PLAN.md) · [contrato F2.4d.1](F2_4D_1_GLOBAL_MANIFEST_CONTRACT.md) · [serviço F2.4d.2](F2_4D_2_GLOBAL_MANIFEST_SERVICE.md).

## 1. Objetivo

Sair do downloader hardcoded de `david_goliath` como **única** opção e oferecer uma função
**genérica** que baixa cenas de qualquer `storyId`, consumindo o manifesto global para
descobrir a origem — **ainda em modo de desenvolvimento**, **sem** alterar a experiência do
usuário final, **sem** entitlement/RevenueCat.

## 2. Arquivos alterados

- **`src/services/packDownloadService.js`** — nova função genérica + imports (FileSystem, `getPackTempDir`, globalManifestService, logger). Stubs F2.1a e `markPackReady` inalterados.
- **`scripts/smoke.js`** — +13 checks F2.4d.3; 1 check F2.1a atualizado (o download real agora é legítimo, isolado na função genérica).
- **`docs/F2_4D_3_GENERIC_STORY_SCENE_DOWNLOADER.md`** — este documento.

**Não** tocados: `packSandboxDevService.js` (função legada intacta), `PackSandboxDevScreen.js`, `contentResolver.js`, `packStorageService.js`, `packIntegrityService.js`, `globalManifestService.js`, `stories.js`, `StoryBookScreen.js`, entitlement, assets, deps.

## 3. Função genérica criada

```
downloadStoryPackScenesFromGlobalManifest({ storyId, globalManifestUrl, appVersion, onProgress })
  → { ok, reason?, storyId?, version?, sceneCount?, totalBytes?, requiresAppUpdate?, entry?, errors? }
```

A função legada **`downloadDavidGoliathPackSandbox`** (em `packSandboxDevService.js`) foi
**preservada intacta** (não virou wrapper) — a UI dev atual continua funcionando igual.

## 4. Fluxo do download

1. `fetchGlobalContentManifest(globalManifestUrl, { appVersion })` (read-only).
2. `getPackFromGlobalManifest(data, storyId)`.
3. Valida `requiredAppVersion` — se `requiresAppUpdate`, retorna `requires_app_update` e **não baixa**.
4. Monta a URL do manifesto por-pack = **`baseUrl` + `manifestPath`** (baseUrl autoritativo; **não** monta `v1` a partir de `version`).
5. Baixa o `manifest.json` do pack para `.tmp`.
6. `validatePackManifest` (schema + bytes + sha256 hex + kinds).
7. Confirma `metadata.storyId === storyId`.
8. Confirma `manifest.version === version` (a do manifesto global).
9. Filtra **apenas cenas** (`kind === 'scene'`, path seguro).
10. Baixa **só as cenas** para `.tmp` (progresso cumulativo).
11. Valida **existência + bytes** de cada cena.
12. **Move atômico** `.tmp → localDir` (só após tudo válido).
13. `setPackEntry ready` (nunca parcial).
14. Retorna resultado estruturado.

## 5. Relação com o `content-manifest.json` global

O manifesto global é a **fonte de descoberta**: fornece `baseUrl`, `version`, `manifestPath`
e `access`/`requiredAppVersion` por pack. O downloader **não** conhece URLs fixas de história
— tudo vem do índice. O `manifest.json` **por-pack** (resolvido por `baseUrl + manifestPath`)
continua sendo a **fonte de verdade** dos arquivos (path/bytes/sha256/kind).

## 6. Como garante que baixa só cenas

- Filtro explícito `f.kind === 'scene'` (+ path seguro: sem `/` inicial, sem `..`).
- **Nenhuma** referência a `cover.webp`, `coloring/`, `audio/` ou `.mp3` na função (verificado por smoke).
- `totalBytes` = soma **apenas** das cenas; `cover`/`colorir`/`áudio` seguem do **bundle** (fallback require via contentResolver).

## 7. Como evita ready parcial

- `.tmp` limpo a cada tentativa (nunca reaproveita parcial).
- `setPackEntry ready` **só** após: manifesto validado + storyId/version conferidos + **todas** as cenas baixadas e com **bytes conferidos** + **move atômico** concluído.
- Qualquer falha → `failWith`: limpa `.tmp`, grava status **`failed`**, mantém o **fallback require**.
- Ordem garantida por smoke: `errors → failWith` **antes** do `move`, e `move` **antes** do `ready`.

## 8. O que ainda NÃO faz

- Não baixa cover/colorir/áudio (só cenas — F2.4e).
- Não tem verificação **sha256 real** (só bytes+existência; pende de dep de crypto — F2.4e).
- **Não está conectada à tela dev** (`PackSandboxDevScreen` segue usando a função legada). A conexão é o **F2.4d.4**.
- Não oferece download a usuário final; sem entitlement/RevenueCat.

## 9. Como validar no iPhone

Como a **tela dev ainda não foi conectada** a esta função (fica para F2.4d.4), a validação
deste bloco é **de serviço** (a genérica ainda não tem botão). Opções:
- **Validação técnica (agora):** os smoke checks cobrem contrato/fluxo/segurança estaticamente; o `fetchGlobalContentManifest` já foi validado contra o R2 real (F2.4d.2c).
- **Validação visual completa (F2.4d.4):** quando a tela dev chamar `downloadStoryPackScenesFromGlobalManifest({ storyId: 'david_goliath', globalManifestUrl })`, repetir no iPhone: Reset → Download (novo fluxo) → `ready`, `10/10` cenas, `usesPack=true`, `source=file`, Davi e Golias abre normal, Reset → `require`.

## 10. Limitações

- `r2.dev` é temporário (produção exige domínio próprio).
- Só `david_goliath` tem pack publicado hoje (a função é genérica, mas só há 1 pack no índice).
- sha256 real pendente (F2.4e).

## 11. Próximos passos

- **F2.4d.4:** conectar `PackSandboxDevScreen` à função genérica (campo de storyId + URL do manifesto global), preservando a função legada.
- **F2.4d.5:** validação no iPhone do fluxo genérico.
- **F2.4e:** cover/colorir/áudio + sha256 real (dep de crypto aprovada).
