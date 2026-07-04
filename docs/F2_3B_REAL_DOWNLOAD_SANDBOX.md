# F2.3b — Download REAL sandbox de `david_goliath` (LAN, dev-only)

> **Bloco:** F2.3b (Fase 2 §19). **Ferramenta dev-only — download real sandbox.**
> **Data:** 2026-07-03 · **Branch:** `content-integrate-coloring-3` · HEAD base `0dd74d3`.
> **Regra central:** baixa as **10 cenas** de `david_goliath` de um **servidor HTTP local
> (LAN)** — arquivos individuais, **sem R2, sem zip, sem dep nova, sem RevenueCat/
> entitlement** — sob **DUPLO GATE** (`__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX==='true'`).
> **Não commitado, não pushado, sem `git add`.**

---

## 1. Objetivo

Provar, no iPhone, o **download real** de um pack (só cenas) de `david_goliath` de uma origem
remota **LAN**, executando o `DOWNLOAD_FLOW`: **manifest → `.tmp` → validar bytes/existência →
mover atômico → `ready`**. Após o download válido, as 3 superfícies conectadas resolvem por
`file://`; após reset, voltam a `require`. É o passo anterior a qualquer R2/produção.

---

## 2. Como subir o servidor LAN local

1. Descubra o **IP LAN** da máquina de desenvolvimento (Windows): `ipconfig` → "IPv4 Address" (ex.: `192.168.0.10`).
2. Sirva a **pasta do pack** já gerada (F2.1b) por HTTP na porta 8787. Exemplos:

```bash
# Opção A — Node (serve)
npx serve "C:/tmp/ptf_pack_sandbox/packs/david_goliath/v1" -l 8787

# Opção B — Python
cd C:/tmp/ptf_pack_sandbox/packs/david_goliath/v1
python -m http.server 8787
```

3. Teste no navegador: `http://<IP-LAN>:8787/manifest.json` deve abrir o manifesto, e
   `http://<IP-LAN>:8787/scenes/david_goliath_scene_01.webp` deve baixar a cena.
4. iPhone e máquina **no mesmo Wi-Fi**.

> A pasta servida tem `manifest.json` + `scenes/` (10 webp) + colorir/áudio/capa — mas o F2.3b
> baixa **apenas as 10 cenas** (o resto é ignorado neste bloco).

---

## 3. Como preencher a baseUrl

- Na tela dev, campo **"Download sandbox remoto (LAN)"** → `baseUrl` = **`http://<IP-LAN>:8787/`** (com barra final).
- Padrão editável: vem de `EXPO_PUBLIC_PACK_SANDBOX_BASE_URL` (se definida) ou `http://192.168.0.10:8787/`.
- O download **valida** que a baseUrl começa com `http://`/`https://`.

---

## 4. Fluxo esperado no iPhone

1. Ligue a flag e rode: **`EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c`** → abrir no iPhone.
2. Toque o **FAB "🛠 packs"** → tela dev.
3. Ajuste a **baseUrl** (IP LAN).
4. Toque **Download david_goliath (10 cenas)** → observe o progresso `downloading · downloadedBytes/totalBytes (%)` → `verifying` → `ready`.
5. **Diagnose/Refresh:** `status=ready`, `10/10`, `usesPack=true`, `sourceType=file`, uris `file://`.
6. Abra **Davi e Golias**: NarrationScreen (cenas), Livrinho "História ilustrada" e prévia da intro renderizam por `file://`.
7. **Reset** → `sourceType=require`, `usesPack=false`; as 3 telas voltam ao fallback local.
8. Controles: Jesus e as Crianças, A Criação/Noé — normais.

---

## 5. Critérios de sucesso
- Progresso avança (downloadedBytes → totalBytes) e chega a **ready**.
- Diagnóstico: **10/10**, **usesPack=true**, **sourceType=file**, uris `file://…/packs/david_goliath@1.0.0/scenes/…`.
- As 3 superfícies renderizam por `file://` (sem tela branca/imagem quebrada).
- **Reset** volta a `require`/`usesPack=false`.
- **Falha controlada:** baseUrl errada / servidor fora → `failed`, **sem ready parcial**, fallback `require` mantido.
- **Flag desligada:** FAB/tela/rota somem; nada baixa.

---

## 6. Regras de segurança implementadas
- **Retry limpo:** `.tmp` é apagado no início de cada download (nunca reaproveita parcial).
- **Nunca ready parcial:** `setPackEntry ready` só após **10/10** validadas (existência + bytes) e **move atômico** (`.tmp → localDir`).
- **Falha → `failed` + `require`:** qualquer erro limpa o `.tmp` e registra `failed`; o app segue no fallback local.
- **Rejeições:** `storyId != david_goliath` e `version != 1.0.0` → rejeitados antes de baixar cenas.
- **Reset:** limpa índice (`clearPackEntry`) + `localDir` + `tempDir`.

---

## 7. Limitações conhecidas
- **sha256 real pendente:** validação é **bytes + existência** (sem `expo-crypto`). O hash real por arquivo virá com uma dep de crypto aprovada (F2.4+).
- **R2 fora do escopo:** a origem é **LAN local** (dev). R2/produção só no F2.4.
- **Só cenas:** áudio/colorir/capa **não** são baixados neste bloco.
- **Só `david_goliath`:** nenhuma outra história é migrada.
- **Sem entrega ao usuário final:** é **dev-only** (duplo gate); nenhum fluxo de download aparece em produção.
- **Expo Go vs build:** validado no Expo Go (mesmo ambiente das validações anteriores).

---

## 8. Gates
**smoke 1520/1520 ✓** (`[1512]`–`[1520]`; `[1510]` atualizado) · **expo-doctor 18/18 ✓** · **audio 200/200 ✓**.

---

## 9. Confirmações
- ✅ Download real **por FileSystem (LAN)** — `downloadAsync` (manifest) + `createDownloadResumable` (cenas).
- ✅ **Sem R2, sem zip/unzip, sem dep nova, sem RevenueCat/entitlement/compras.**
- ✅ **Assets do bundle não removidos**; loaders de mídia intactos; NarrationScreen/StoryBookScreen intactos.
- ✅ Duplo gate herdado (nada em produção). ✅ Sem commit/push/`git add`.
