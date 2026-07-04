# F2.3d — Validação do download real sandbox no iPhone (consolida F2.3b/F2.3c)

> **Bloco:** F2.3d (Fase 2 §19). **Documentação da validação real em device.**
> **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `0dd74d3`.
> Consolida a implementação (F2.3b) e a validação manual ponta a ponta no iPhone (F2.3c)
> do **download real sandbox LAN** de `david_goliath`, com o micro-ajuste de segurança
> (trim da baseUrl). **Não commitado, não pushado, sem `git add`.**

---

## 1. Objetivo

Registrar oficialmente que o **download real** de um pack (só cenas) de `david_goliath`, de
uma origem HTTP **LAN local**, funciona ponta a ponta no iPhone, e que o app alterna
corretamente entre **assets do bundle (`require`)** e **assets baixados (`file://`)** — tudo
**dev-only** (duplo gate), **sem R2, sem download de produção, sem RevenueCat/entitlement**.

---

## 2. Ambiente da validação
- **Device:** iPhone, Expo Go, mesmo Wi-Fi da máquina dev.
- **Origem LAN:** `http://192.168.15.98:8787/` servindo `C:/tmp/ptf_pack_sandbox/packs/david_goliath/v1` (manifest + 10 cenas .webp).
- **Flag:** `EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c`.
- **Pré-checagem automatizada (máquina dev):** manifesto ↔ disco **10/10 bytes** conferem; servibilidade HTTP provada (`GET /manifest.json` 200, `GET /scenes/…_01.webp` 200/243156B).

---

## 3. Resultado da validação manual (7 passos — TODOS aprovados)

| # | Passo | Resultado |
|---|---|---|
| 1 | **Servidor LAN** | ✅ Safari abriu `http://192.168.15.98:8787/manifest.json` |
| 2 | **Download real** | ✅ `ready`, version `1.0.0`, **10/10**, `totalBytes 2289598`, `usesPack=true`, 10 cenas `source=file`, uris `file://` no iPhone; servidor: `GET manifest.json` + 10 cenas `.webp` todas **200** |
| 3 | **Persistência** | ✅ após fechar/reabrir (dia seguinte) + Refresh: continuou `ready`, 10/10, `usesPack=true`, `file://` preservadas — **sem rebaixar** |
| 4 | **Superfícies visuais** | ✅ NarrationScreen e Livrinho de Davi e Golias abriram normais (imagens carregam, sem placeholder permanente / imagem quebrada / tela vermelha); Jesus/Criação/Noé normais |
| 5 | **Reset** | ✅ `not_downloaded`, 0/10, `usesPack=false`, cenas voltam a `require`; Davi segue pelo bundle |
| 6 | **Falha controlada** (baseUrl inválida) | ✅ `failed`, **sem ready parcial**, 0/10, `require` mantido; Davi funciona pelo fallback |
| 7 | **Retry** (baseUrl correta) | ✅ voltou a `ready`, 10/10, `usesPack=true`, `file://` |

**Conclusão:** o pipeline de **download real → validação → promoção atômica → `ready` →
`file://`** e o **fallback/reset → `require`** funcionam de ponta a ponta no aparelho, sem
ready parcial e sem afetar outras histórias.

---

## 4. Observação encontrada + micro-ajuste (F2.3d)

Durante a validação, um **espaço acidental** na URL (`http://192 .168.15.98:8787/`) virou
`http://192%20.168.15.98:8787/` e o download **falhou corretamente** (sem ready parcial).

**Micro-ajuste aplicado (mínimo e seguro):** `downloadDavidGoliathPackSandbox` agora faz
**`trim()` da baseUrl** antes de validar/usar (protege contra espaços acidentais no início/fim).
A limpeza da mensagem de erro ao iniciar nova tentativa já ocorria (a tela reescreve o status
para "Baixando…" no começo do download). **Sem expandir escopo** (espaços internos seguem
falhando corretamente; não há normalização agressiva de URL).

---

## 5. Limitações conhecidas (inalteradas)
- **sha256 real pendente:** validação é **bytes + existência** (sem `expo-crypto`).
- **R2 fora do escopo:** origem é **LAN local** (dev). Produção/R2 só no F2.4.
- **Só cenas:** capa/áudio/colorir seguem do **bundle** (não baixados) — esperado.
- **Só `david_goliath`:** nenhuma outra história migrada.
- **Dev-only:** duplo gate; nenhum fluxo de download aparece em produção; nenhum asset removido do bundle.

---

## 6. Arquivos deste bloco (F2.3d)
- `src/services/packSandboxDevService.js` — **trim** da baseUrl no download (micro-ajuste).
- `scripts/smoke.js` — guard `[1512]` atualizado (cobre o trim).
- `docs/F2_3D_REAL_DOWNLOAD_DEVICE_VALIDATION.md` — este documento.
- (F2.3b, já no working tree: serviço de download + tela + doc F2.3b + guards `[1512]`–`[1520]`.)

## 7. Gates
**smoke 1520/1520 ✓** · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

## 8. Próximo marco
**F2.4 — decisão de storage definitivo (R2) ou expansão** (demais histórias, áudio/colorir/capas via pack, dep de crypto p/ sha256 real) e, só então, RevenueCat/entitlement. Antes disso: commit/push do F2.3b + F2.3d quando você autorizar.

## 9. Confirmações
- ✅ Download real validado no device; fallback/reset/falha/retry validados.
- ✅ Micro-ajuste = **apenas trim** da baseUrl (sem expandir escopo).
- ✅ Sem R2, RevenueCat, entitlement, dep nova, remoção de assets, outras histórias, áudio/colorir/capa.
- ✅ **Sem commit, push ou `git add`.**
