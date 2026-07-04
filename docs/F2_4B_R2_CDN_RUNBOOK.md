# F2.4b — Runbook: provisionar Cloudflare R2 + CDN e subir o pack piloto `david_goliath`

> **Bloco:** F2.4b (Fase 2 → infraestrutura remota definitiva). **Runbook operacional.**
> **Data:** 2026-07-04 · **Branch:** `content-integrate-coloring-3` · HEAD base `f20e887`.
> **Depende de:** [F2.4a — plano de storage](F2_4A_STORAGE_PLAN.md) (commit `f20e887`).
>
> **Natureza deste bloco:** documentação/runbook + ações **externas** no painel da Cloudflare
> executadas pelo responsável (Eduardo). **Não altera o app**, **não integra runtime de
> produção**, **não cria bucket automaticamente**, **não pede nem guarda secrets**.
> **Precedência:** subordinado a `docs/PROJECT_SOURCE_OF_TRUTH.md` e
> `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md` v2.0 (R2 já travado como storage remoto).

---

## 1. Objetivo do F2.4b

Deixar **pronta a infraestrutura remota** para servir packs premium por HTTPS, e **publicar o
pack piloto `david_goliath`** num CDN com domínio próprio — de forma que, no bloco seguinte
(F2.4c), o app (ainda dev-gated) troque a origem LAN por essa **URL HTTPS real** sem nenhuma
outra mudança de arquitetura.

**Este bloco NÃO faz:** consumo no app, download remoto no runtime, manifesto global no app,
entitlement, RevenueCat, remoção de assets do binário, novas dependências.

**Critério de saída (quando F2.4b estiver concluído por Eduardo):** as URLs públicas HTTPS do
pack piloto respondem **200**, os **bytes batem** com o manifesto gerado localmente, e os
**paths batem** com o pack do `build-story-pack.js` — tudo por **domínio próprio** (não `r2.dev`).

---

## 2. Pré-requisitos externos

| Item | Descrição |
|---|---|
| **Conta Cloudflare** | Conta ativa com R2 habilitado (exige cartão cadastrado; R2 tem free tier generoso e **egress $0**). |
| **Domínio/subdomínio CDN** | Um domínio próprio (ex.: `pequenostracosdefe.app`) e um subdomínio para CDN, ex.: **`cdn.pequenostracosdefe.app`**. O domínio precisa estar na Cloudflare (DNS gerenciado) para ligar o R2 a um Custom Domain. |
| **Bucket R2** | Um bucket, ex.: **`ptf-packs`** (nome interno, não aparece na URL pública se usar Custom Domain). |
| **Pack piloto gerado** | O `david_goliath` **v1** gerado localmente por `scripts/assets-pipeline/build-story-pack.js` (fora do repo, em `<tmp>/ptf_pack_sandbox/...`). |
| **(Opcional) Token de upload** | Token R2 **escopado** (só ao bucket de packs) **se** for subir via ferramenta/CLI. **Fica fora do repo.** |

---

## 3. Estrutura remota proposta

### 3.1 Layout por pack (bate com o `build-story-pack.js` e o `contentResolver`)

```
packs/
  david_goliath/
    v1/
      manifest.json
      pack.sha256
      cover.webp
      scenes/
        david_goliath_scene_01.webp
        ... (10 cenas)
        david_goliath_scene_10.webp
      coloring/
        scene_01.png ... scene_10.png
      audio/
        david_goliath_scene_01.mp3 ... david_goliath_scene_10.mp3
```

- **Versão no path** (`v1`) — **imutável**. Nova versão = **novo diretório** (`v2`), nunca sobrescreve `v1`.
- Os **paths relativos dentro do pack** (`cover.webp`, `scenes/<id>_scene_NN.webp`,
  `coloring/scene_NN.png`, `audio/<id>_scene_NN.mp3`) **precisam bater exatamente** com o que o
  `contentResolver` já espera — não renomear.

### 3.2 baseUrl pública (via domínio próprio)

```
https://cdn.pequenostracosdefe.app/packs/david_goliath/v1/
```

Ex.: `…/v1/manifest.json`, `…/v1/scenes/david_goliath_scene_01.webp`.

### 3.3 Manifesto global de conteúdo (SOMENTE PLANEJADO — não implementar consumo)

Na **raiz da CDN**, um índice pequeno e cacheável que lista os packs e seus `baseUrl`/`access`:

```
https://cdn.pequenostracosdefe.app/content-manifest.json
```
```json
{
  "manifestVersion": 1,
  "minAppVersion": "1.0.0",
  "generatedAt": "2026-07-XXT..Z",
  "packs": [
    { "id":"david_goliath", "version":1, "type":"story", "access":"premium",
      "title":"Davi e Golias", "bytes": <totalBytes>, "sha256":"<hash do indice do pack>",
      "requiredAppVersion":"1.0.0",
      "baseUrl":"https://cdn.pequenostracosdefe.app/packs/david_goliath/v1/" }
  ]
}
```

> No F2.4b este arquivo é **opcional** (pode ou não ser publicado). O **consumo no app** só
> chega no F2.4d. Não implementar leitura do manifesto global agora.

---

## 4. O que Eduardo precisa executar fora do repo (painel Cloudflare)

Passos **manuais externos** (nenhum executado por este bloco):

1. **Criar/acessar** a conta Cloudflare e habilitar **R2**.
2. **Criar o bucket** (ex.: `ptf-packs`).
3. **Configurar o domínio próprio/subdomínio CDN** (Custom Domain do R2, ex.: `cdn.pequenostracosdefe.app`) — **evitar `r2.dev` como domínio público de produção final** (o `r2.dev` pode servir só para um teste rápido, mas o alvo de produção é o domínio próprio).
4. **(Se usar CLI)** criar um **token escopado** apenas ao bucket de packs. **Não** compartilhar o secret no chat se não for necessário; **não** commitar no repo.
5. **Subir o pack piloto** `david_goliath/v1` (todos os arquivos, preservando a estrutura de paths).
6. **Validar as URLs públicas HTTPS** (seção 6).

> Regra: **segredos ficam fora do repo**. Se precisar registrar algo, use um cofre pessoal
> (gerenciador de senhas / variáveis de ambiente locais), **nunca** um arquivo versionado.

---

## 5. Comandos locais de exemplo (seguros — NÃO executar nada com secret aqui)

Opções de upload (à escolha de Eduardo, **fora** do fluxo deste bloco):

### 5.1 Painel web da Cloudflare
Arrastar a pasta `packs/david_goliath/v1/` para o bucket, mantendo a estrutura. **Sem CLI, sem token local.** É o caminho mais simples para o piloto.

### 5.2 Wrangler (CLI da Cloudflare) — opcional
```bash
# Pré-requisito: instalar o CLI externo (fora do projeto)
npm i -g wrangler        # ou: npx wrangler ...

# Login interativo (abre o navegador) — credencial NUNCA entra no projeto
wrangler login

# Exemplo de upload de um objeto (ajustar bucket/paths reais):
wrangler r2 object put ptf-packs/packs/david_goliath/v1/manifest.json \
  --file "C:/tmp/ptf_pack_sandbox/packs/david_goliath/v1/manifest.json"
# ... repetir para pack.sha256, cover.webp, cada scenes/*, coloring/*, audio/*
```

**Se optar por Wrangler, deixar claro:**
- É **dependência de CLI externa** (global/`npx`) — **não** é dependência do projeto (nada entra em `package.json`).
- **Login/token ficam fora do repo** (`wrangler login` guarda credencial no perfil do usuário, não no projeto).
- **Nenhuma credencial** é salva no projeto; **nenhum** `wrangler.toml` sensível é commitado.

### 5.3 rclone / aws-cli (S3-compatible) — opcional
R2 é S3-compatível; qualquer cliente S3 serve, apontando para o endpoint R2 com **credencial em variável de ambiente local** (nunca no repo).

> **Este runbook não executa nenhum desses comandos** (todos dependem de secret/conta). São
> apenas exemplos documentados para Eduardo executar no ambiente dele.

---

## 6. Validações esperadas (por HTTPS, após o upload)

Substituir `<CDN>` por `https://cdn.pequenostracosdefe.app`.

| # | Verificação | Esperado |
|---|---|---|
| 1 | `GET <CDN>/packs/david_goliath/v1/manifest.json` | **200** + `application/json` |
| 2 | `GET <CDN>/packs/david_goliath/v1/pack.sha256` | **200** |
| 3 | `GET <CDN>/packs/david_goliath/v1/scenes/david_goliath_scene_01.webp` … `_10.webp` | **200** (as **10 cenas**) |
| 4 | `GET <CDN>/packs/david_goliath/v1/cover.webp` | **200** (existe no storage, mesmo que o app ainda não baixe) |
| 5 | `GET <CDN>/packs/david_goliath/v1/coloring/scene_01.png` … | **200** (existem no storage) |
| 6 | `GET <CDN>/packs/david_goliath/v1/audio/david_goliath_scene_01.mp3` … | **200** (existem no storage) |
| 7 | **Bytes batem** | tamanho de cada objeto == `files[].bytes` do `manifest.json` |
| 8 | **Paths batem** | cada `files[].path` do manifesto existe no CDN sob o mesmo caminho |

**Exemplo de checagem manual (Content-Length):**
```bash
curl -I https://cdn.pequenostracosdefe.app/packs/david_goliath/v1/scenes/david_goliath_scene_01.webp
# comparar o Content-Length com files[].bytes do manifest.json
```

> Observação: no F2.4b o **app ainda não baixa** cover/coloring/audio — mas eles **devem existir
> no storage** para o piloto ficar completo e pronto para o F2.4e (expansão de mídia).

---

## 7. Regras de cache

- **Packs por versão = imutáveis** → `Cache-Control: public, max-age=31536000, immutable`. Como a versão vive no path (`/v1/`), nunca há invalidação: nova versão = novo path.
- **content-manifest.json (índice) = mutável** → cache **curto** + revalidação por `ETag`
  (`Cache-Control: public, max-age=60, must-revalidate` ou similar). É o único arquivo que muda ao publicar packs novos.
- Servir sempre pelo **domínio próprio** (cache/CDN da Cloudflare na frente do R2).

---

## 8. Decisão de segurança (reforço)

1. **R2 não é DRM** — não prometer proteção anti-cópia absoluta.
2. **Entitlement no app** — o download premium será liberado só quando `isActive` (RevenueCat) for verdadeiro; isso chega **depois** (F2.4f/Fase 5), **não** neste bloco.
3. **Paths não triviais no futuro** — para o piloto os paths são legíveis; na evolução, considerar prefixos menos adivinháveis (sem virar DRM).
4. **Manifesto premium completo não exposto a Free** — antes da decisão de acesso, o índice premium completo não deve ser servido a usuários grátis em telas do app.
5. **Domínio próprio, não `r2.dev`** em produção final.
6. **Segredos fora do repo** — nenhum token/credencial em arquivo versionado; nada de secret no chat sem necessidade.
7. **GitHub não é storage de premium** — descartado por governança (conteúdo premium público, sem controle de acesso).

---

## 9. O que NÃO deve ir para o repo

- Tokens/credenciais R2, chaves de API, endpoints com secret.
- `wrangler.toml` ou config equivalente com dados sensíveis.
- Os **arquivos do pack** (`assets/stories/*` premium, o pack gerado) — o pack vive **fora do repo** (`<tmp>/ptf_pack_sandbox`) e no **R2**, nunca no Git.
- Qualquer `.env` com valores reais de produção.

---

## 10. Checklist para Eduardo executar no painel da Cloudflare

- [ ] Conta Cloudflare com **R2 habilitado**.
- [ ] Bucket criado (ex.: `ptf-packs`).
- [ ] Domínio próprio na Cloudflare + **Custom Domain** do R2 (ex.: `cdn.pequenostracosdefe.app`).
- [ ] (Se CLI) token **escopado** ao bucket, guardado **fora do repo**.
- [ ] Pack `david_goliath/v1` **gerado localmente** (`build-story-pack.js`) — completo (manifest, pack.sha256, cover, 10 scenes, coloring, audio).
- [ ] Upload preservando a **estrutura de paths** (seção 3.1).
- [ ] Regras de **cache** aplicadas (imutável nos packs; curto no índice).
- [ ] Validações **1–8** (seção 6) todas **200** e **bytes/paths batendo**.
- [ ] Confirmado que a origem pública é o **domínio próprio** (não `r2.dev`).
- [ ] Nenhum secret commitado; nenhum arquivo de pack no Git.

Quando este checklist estiver verde, o **F2.4c** (trocar origem LAN → HTTPS real, ainda dev-gated) fica desbloqueado.

---

## 11. Próximo bloco
**F2.4c — Pack remoto de 1 história em ambiente controlado:** apontar o downloader **dev-gated**
para a **baseUrl HTTPS real** do R2/CDN (em vez da LAN) e validar o download no device. Só então
F2.4d (generalizar o downloader + manifesto global no runtime).
