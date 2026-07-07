# Relatório Final — Bloco 2 · Fase 2B: Consumo R2 user-facing

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B · **Etapa SDD:** 7–9 (Implement → Testes/validação → Commit).
> **Branch:** `content-integrate-coloring-3` · **HEAD anterior:** `e4d2a8a`.
> **Status:** IMPLEMENTADO · validado em iPhone · aprovado para commit (sem push).

## 1. Objetivo entregue
Download **user-facing** de pack remoto na StoryDetail (premium-active + história `remote`) e consumo da mídia remota no **Livrinho** (áudio + lineart child), **sem** remover o bundle e **preservando os 6 guardrails de arquitetura**. Fallback local permanece como origem-padrão; o remoto (`file://`) só é usado quando o pack está `ready`+válido.

## 2. Abordagem corrigida (por que não foi por import direto)
A 1ª tentativa importou `usePacks`/`packDownloadService` (StoryDetail) e `contentResolver` (StoryBookScreen) **direto na tela**, o que quebrou 8 checks de guardrail (por import/camada). Corrigido conforme decisão do Portão:
- **Telas nunca** importam `usePacks`/`PacksContext`/`contentResolver`/`packStorageService`/`packDownloadService`/`packIntegrityService`.
- StoryBookScreen consome remoto **só** via `src/hooks/useResolvedStoryMedia` (2 resolvers puros novos).
- StoryDetail consome **só** o hook novo `src/hooks/useStoryPackDownload` (encapsula o runtime).
- Migração **fiel** apenas dos 2 checks de shape de `makeChildArtVisual` — sem relaxar guardrail.

## 3. Arquivos
| Arquivo | Tipo | Conteúdo |
|---|---|---|
| `src/hooks/useResolvedStoryMedia.js` | modificado | +2 resolvers puros `resolveRemoteColoringUri` / `resolveRemoteAudioSource` (`file://` só com pack ready+válido; senão `null`) |
| `src/hooks/useStoryPackDownload.js` | novo | hook que encapsula `usePacks`+`packDownloadService`; expõe `uiState/progress/error/download/retry/isRemote/isReady/configMissing`; read-only quanto a entitlement |
| `src/screens/StoryDetailScreen.js` | modificado | consome só o hook; bloco de estado (baixar/baixando/pronto/erro+retry) gated a `canAccess && isRemote && !isComingSoon`; +8 estilos |
| `src/screens/StoryBookScreen.js` | modificado | áudio + lineart child por resolvers da camada permitida; local é default e só é sobrescrito; único hook `scenePackEntry` no topo |
| `scripts/smoke.js` | modificado | +8 checks 2B + migração fiel dos 2 shape checks |
| `specs/005-reducao-bundle/*` | novo | spec/plan (2A+2B), inventário 2A e este relatório |

## 4. Os 10 checks do Portão
1. `npm run smoke` verde — **1826/1826**. 2. `npx expo-doctor` — **18/18**. 3. 6 guardrails preservados (F2.1d/e/h/i + F2.4e verdes). 4. Só os 2 shape checks migrados. 5. StoryBookScreen sem `contentResolver`/`pack*` direto. 6. StoryDetail sem `usePacks`/`packDownloadService` direto. 7. Fallback local preservado. 8. remote+ready → `file://`. 9. Grátis sem botão de download. 10. Premium-active (Modo Criador) com baixar/progresso/pronto/erro/retry.

## 5. Validação em iPhone (device) — APROVADA (nenhum item falhou)
1. Davi e Golias com Modo Criador ligado. 2. Download com progresso até estado pronto. 3. Pack Sandbox mostrando uso do pack remoto (`file://`). 4. Funcionamento offline após download. 5. Narração, Colorir e Livrinho funcionando após download. 6. Reset do pack e fallback local. 7. Modo Criador desligado sem botão de download. 8. A Criação e Noé normais (starter, offline). 9. Erro de rede e retry.

## 6. Invariantes preservados
- **Bundle intocado:** `app.json` não mudou; loaders de mídia seguem `require` (nenhum vira `file://` no bundle); nenhum `require` premium removido. Redução do bundle (assetBundlePatterns + strip) é a **Fase 2C**, ainda bloqueada até os 18 packs estarem publicados no R2.
- **Assets:** nenhum movido/apagado/renomeado; nada de `git rm`.
- **Áreas sensíveis:** motor de pintura, LIVRINHO_FIX_1 e LIVRINHO_UX_1 intocados (só muda a FONTE da mídia). Sem RevenueCat/compra/entitlement.
- **Regra dos hooks:** `useSandboxScenePackEntry` chamado 1× no topo; timeline recebe `scenePackEntry` por parâmetro; resolvers usados em loop são puros/não-hook.

## 7. Pendências (próximos blocos, fora da 2B)
- **Fase 2C** (remoção efetiva do bundle) — só após os 18 packs premium publicados/validados no R2.
- **Fases 2D/2E** conforme spec do Bloco 2.
- Refinamento menor opcional: gatear o botão por `!configMissing` (hoje, sem a env de manifesto, o tap devolve erro retriável — no device a env está presente).
