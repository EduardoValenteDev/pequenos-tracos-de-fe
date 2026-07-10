# M3.1b · Invalidação local de packs remote obsoletos (piso de versão)

> **Feature:** `008-m3-assets-visuais` · sub-bloco **M3.1b** · **Etapa SDD:** 1 (Specify) + 4 (Plan) · **Portão: pendente.**
> **Base:** M3.1 (diagnóstico read-only) provou que o app **não detecta** obsolescência de pack. **Nada implementado.**
> **Natureza:** código em **área sensível** (`PacksContext`, reconciliação). Não toca assets, R2, entitlement, EAS.

## 1. Problema

`contentResolver` dá precedência ao pack baixado (`ready` + `localDir` → `file://`). Um aparelho que já baixou uma das 7 histórias do M3 continuará servindo a **arte antiga**, para sempre, mesmo depois de o app ser atualizado com a arte corrigida.

Provado em M3.1: o manifesto global só é lido **dentro** do download; o download só é disparado por toque; o botão desaparece quando `ready`; a reconciliação só checa **existência de arquivo**; e o status `needs_update` existe mas **nunca é escrito**.

## 2. Solução (Opção A) — piso de versão local, em memória

Uma tabela em código diz, por `storyId`, qual é a **versão mínima aceitável** de pack. No boot, uma entry `ready` cuja `version` seja menor que o piso é tratada **em memória** como `not_downloaded`. O `contentResolver` então cai no `require` do bundle — que, no update do M3, já contém a arte corrigida.

**Sem rede. Sem escrita no índice. Sem apagar arquivo.**

### 2.1 Por que isto é aceitável AGORA (registro explícito)

Funciona **porque os assets `remote` ainda existem no binário**. Verificado: `coloringImages.js` tem 10 `require()` de José; `storySceneIllustrations.js` tem 10 de Ester; e `contentResolver` (linha ~83) cai no `require` local para "remote sem pack".

⚠️ **Dependência crítica:** depois do **2C**, quando os assets `remote` saírem do bundle, invalidar sem rebaixar deixaria a história **sem imagem**. A partir daí, a **Opção B** (bump de versão + checagem remota + estado `needs_update` + UI "Atualizar história") torna-se **obrigatória**. O piso de versão é uma ponte para o M3, **não** a solução final. Deve ser tratado como dívida técnica com prazo: **antes ou junto do 2C**.

## 3. Como funciona o piso, em detalhe

### 3.1 Tabela de pisos
Mapa `storyId → versão mínima (semver)`, apenas para as 7 histórias do M3. História ausente do mapa = **sem piso** = comportamento atual, intocado. Isso garante que as outras 13 histórias e qualquer pack válido não sejam afetados.

### 3.2 Critério de "pack não aceitável"
Uma entry é rebaixada em memória quando **todas** valem:
1. `status === 'ready'` (só um `ready` serve `file://`; os demais já caem no `require`);
2. o `storyId` tem piso definido;
3. `version` ausente, não-semver, **ou** menor que o piso.

### 3.3 Assimetria deliberada com a regra de disco (e sua justificativa)
A reconciliação de disco é **conservadora**: probe indeterminado → **mantém** o pack (não rebaixa).
O piso de versão é o **oposto**: versão ausente/ilegível → **rebaixa**.

Isso não é inconsistência. Os dois falham para o **lado seguro**, e o lado seguro é diferente:
- No disco, rebaixar por engano quebraria uma história cujos arquivos existem.
- Na versão, **cair no bundle nunca quebra nada** (pré-2C o bundle tem tudo) e ainda mostra a arte **correta**.

⚠️ Essa assimetria **se inverte depois do 2C**. Está anotada no código como condição de validade.

### 3.4 Momento da avaliação: síncrono
O piso é puro (compara duas strings) e **não precisa de I/O**. Deve ser aplicado num `useMemo` **síncrono**, antes do overlay assíncrono de disco. Motivo: o probe de disco roda em `useEffect` e só chega no segundo render — se o piso dependesse dele, haveria **um frame exibindo a arte velha**. Sendo síncrono, a arte antiga nunca aparece.

## 4. Arquivos e fluxos tocados

| Arquivo | Mudança | Natureza |
|---|---|---|
| `src/data/packMinVersions.js` | **NOVO.** Mapa `storyId → semver mínimo` + acessor. Puro, sem deps. | dados |
| `src/services/packReconcileService.js` | **ADITIVO.** `compareSemver()`, `isPackVersionAcceptable()`, `computeVersionStaleIds()`. **`computeInvalidReadyIds()` NÃO é alterada** (ver nota) | núcleo puro |

> **Nota (revisão no Analyze, A-D1):** a ideia inicial era dar um 3º parâmetro opcional a `computeInvalidReadyIds`. Foi **descartada**: essa função roda no `useEffect` (assíncrono), e o piso precisa ser **síncrono** (§3.4). Colocá-lo lá traria de volta o frame de arte velha e criaria duas fontes de verdade. O piso vive em `computeVersionStaleIds` (puro), chamado pelo `useMemo` síncrono do `PacksContext`.
| `src/context/PacksContext.js` | Aplica o piso num `useMemo` síncrono sobre `normalizedIndex`, **antes** do overlay de disco. | contexto (sensível) |
| `scripts/smoke.js` | Checks novos (§7). | testes |

**Explicitamente NÃO tocados:** `contentResolver.js`, `packDownloadService.js`, `packStorageService.js`, `storageKeys.js`, `packIntegrityService.js`, `globalManifestService.js`, `useStoryPackDownload.js`, nenhuma `src/screens/*`. O guardrail "nenhuma screen importa camada `pack*`" é preservado.

**`@ptf_packs_v1` não muda de nome, não muda de schema e não é reescrito.** A invalidação é 100% em memória → **downgrade-safe** (um app antigo volta a usar o pack antigo, sem corrupção).

## 5. Convivência com starter × remote

| Camada | Comportamento |
|---|---|
| **starter** (`creation`, `noah`) | **Intocado.** `getStoryPackState()` já retorna `included` pela camada, **antes** de consultar o índice; e `contentResolver` resolve starter sempre por `require`. Nenhuma das duas histórias tem piso. |
| **remote com piso** (as 7 do M3) | Pack `ready` com `version` < piso → `not_downloaded` em memória → `require` do bundle (arte nova). |
| **remote sem piso** (as outras 11) | **Intocado.** Sem entrada no mapa → nenhuma avaliação. |
| **remote sem pack** | Já caía no `require`. Nada muda. |
| **sandbox dev** (`david_goliath`) | Sem piso → intocado. |

## 6. 🔴 Restrição de sequência (a mais importante deste bloco)

O piso invalida o pack **e o botão "Baixar história" reaparece**. Se o usuário tocar nele enquanto o R2 ainda servir a versão antiga, o download **conclui**, grava `ready` com a versão antiga, e o piso invalida **de novo** — o botão volta. **Loop de download.**

Portanto a ordem é obrigatória e não negociável:

1. Arte produzida (externa).
2. Assets integrados no bundle (commit de assets por lote).
3. **Packs republicados no R2 com `version` ≥ piso.**
4. **Só então** o piso é ativado em código.

Consequência de projeto: o mecanismo e os **valores** do piso devem ir em **commits separados** — primeiro o mecanismo com o mapa **vazio** (no-op comprovado por smoke), depois a ativação por história, à medida que cada pack for republicado. Assim o piso nunca fica ativo à frente do R2.

## 7. Riscos e mitigação

| # | Risco | Mitigação |
|---|---|---|
| R1 | **Loop de download** (piso ativo antes do R2) | §6: mapa vazio primeiro; ativação por história só após republicação; portão humano por lote |
| R2 | Rebaixamento em massa por bug no comparador | Mapa restrito a 7 ids; smoke com casos de borda; história sem piso nunca avaliada |
| R3 | Perda de estabilidade referencial → Livrinho rebuilda timeline | Retornar a **mesma referência** quando não há invalidação (padrão já usado em `reconcileEntry`) |
| R4 | Flash de arte velha no 1º frame | Piso avaliado em `useMemo` **síncrono** (§3.4) |
| R5 | Lixo em disco (pack antigo permanece) | Aceito e documentado. Limpeza = bloco próprio, opcional |
| R6 | Usuário offline não consegue rebaixar | Não é regressão: ele vê a **arte correta** do bundle. Só perde o `file://` |
| R7 | Solução vira permanente e quebra no 2C | §2.1 registrada como dívida com prazo; smoke pode assertar a nota de validade |
| R8 | `version` nula em entry legítima | Tratado como não aceitável → bundle. Seguro pré-2C (§3.3) |

## 8. Critérios de teste

**Puros (smoke, sem device):**
- `compareSemver` cobre `1.0.0 < 1.1.0`, `1.9.0 < 1.10.0`, iguais, e entradas inválidas.
- `isPackVersionAcceptable`: sem piso → aceita; `ready` + versão < piso → rejeita; versão ausente/ilegível → rejeita; status ≠ `ready` → aceita (nada a invalidar).
- `computeInvalidReadyIds` sem o 3º parâmetro se comporta **exatamente** como hoje (retrocompatibilidade).
- Starter nunca é avaliado; história sem piso nunca é avaliada.
- Guard: mapa de pisos **vazio** ⇒ nenhuma invalidação (prova do no-op do 1º commit).
- Guard anti-regressão: `PacksContext` continua sem gravar índice e sem importar `packDownloadService`.

**Device (Eduardo, obrigatório — envolve persistência real):**
1. **Antes** de atualizar o app: baixar uma história do M3 (pack fica `ready`) e confirmar que a arte antiga aparece.
2. Atualizar o app (piso ativo, R2 já republicado).
3. Abrir a história: **arte nova** aparece; a tela de detalhe volta a oferecer "Baixar história".
4. **Modo avião:** a história continua abrindo com a arte nova (bundle).
5. Rebaixar: download conclui, vira `ready`, **permanece** `ready` (sem loop) e serve `file://`.
6. **Não-regressão:** uma história `remote` fora do M3 com pack baixado continua `ready` e offline.
7. **Não-regressão:** `creation` e `noah` (starter) inalteradas.
8. **Não-regressão:** Livrinho abre sem rebuild/flicker (estabilidade referencial).

## 9. Subfases e portões

- **M3.1b.0 — Spec + Plan** (este documento). **🚦 Portão 1.**
- **M3.1b.1 — Tasks + Analyze.** Micro-tasks, consistência, verificação de segurança. **🚦 Portão 2.**
- **M3.1b.2 — Implementação do MECANISMO (mapa vazio).** `packMinVersions.js` + núcleo puro + `PacksContext` + smoke. Comprovadamente **no-op**: nenhum pack é invalidado. Gates + commit `[código]`. **🚦 Portão 3.**
- **M3.1b.3 — Ativação por história.** Um `storyId` entra no mapa **apenas depois** de seu pack ser republicado no R2 (M3.4). Um commit por lote, ou um commit ao final da republicação. Device obrigatório. **🚦 Portão por lote.**
- **M3.1b.4 — Governança.** Docs SDD em commit próprio.

Sequência global: **arte → assets no bundle → republicação R2 → ativação do piso.**

## 10. Fora do escopo
- ❌ Opção B (checagem remota, `needs_update`, UI "Atualizar história") — **obrigatória antes do 2C**, spec própria.
- ❌ Limpeza de packs antigos em disco.
- ❌ Apagar arquivos, migrar `@ptf_packs_v1`, tocar R2, produzir arte.
- ❌ **2C** e **Camada de Alma**.
- ❌ Qualquer mudança em `contentResolver`, downloader, entitlement ou telas.

## 11. Critérios de aceite
- Pack `ready` com versão abaixo do piso deixa de servir `file://` e a história exibe a arte do bundle.
- Nada é escrito em `@ptf_packs_v1`; nenhum arquivo é apagado; nenhuma requisição de rede é feita.
- Histórias starter, remote sem piso e packs válidos permanecem exatamente como hoje.
- Sem loop de download (piso sempre atrás da republicação).
- `npm run smoke` e `npx expo-doctor` verdes; roteiro de device §8 aprovado por Eduardo.
- A nota de validade (§2.1) registrada no código: **esta solução expira no 2C**.
