# Analyze — M3.1b · Piso de versão local

> **Etapa SDD 6.** Consistência spec↔tasks + verificação adversarial de segurança.
> **Nenhum código escrito. Nada staged. Nenhum asset, R2 ou git tocado.** **Portão 3: pendente.**

## 1. Consistência spec ↔ tasks

| Eixo | Veredito |
|---|---|
| Dois momentos (mecanismo no-op → ativação por história) | ✅ spec §6/§9; tasks Momento 1 (T1–T6) e Momento 2 (T7–T10) |
| Piso avaliado **sincronamente** | ✅ spec §3.4; tasks T3.1/T3.2 |
| Ordem obrigatória: arte → bundle → R2 → piso | ✅ spec §6; tasks Momento 2, pré-condições 1–4 |
| Nada de rede, escrita de índice ou delete | ✅ spec §2/§10; tasks T1/T2/T3.3 |
| Starter intocado | ✅ spec §5; tasks T4.5 |
| Nota de validade (expira no 2C) | ✅ spec §2.1; tasks T1(c) e T4.7 (guard no smoke) |
| Produção de arte em paralelo | ✅ spec §9 (M3.1b.2 não bloqueia); tasks §Paralelismo |

**Uma divergência encontrada e corrigida** (registrada abaixo como A-D1). Após a correção: **sem divergências**.

## 2. Passagem adversarial (o que eu tentei quebrar)

### A-D1 — 🔴 Divergência real: onde mora a decisão do piso
**A spec §4 propunha** um 3º parâmetro opcional em `computeInvalidReadyIds`. **Isso está errado**, por dois motivos independentes:
1. `computeInvalidReadyIds` é consumida **dentro do `useEffect`** que faz o probe de disco — ou seja, **assíncrona**. O piso executado ali só chegaria no 2º render, **reintroduzindo o frame de arte velha** que a própria spec §3.4 quer eliminar.
2. Com o piso também no `useMemo` síncrono (T3.1), a mesma decisão passaria a existir em **dois lugares** — duas fontes de verdade divergindo no tempo.

**Correção aplicada:** `computeInvalidReadyIds` fica **intocada**; o piso vive em `computeVersionStaleIds` (puro), chamado pelo `useMemo` síncrono. Ganho colateral: **retrocompatibilidade por construção** (não por parâmetro default) e **nenhum check antigo do smoke precisa migrar** (`[14281+]` seguem válidos).

### A-D2 — O `localDir` sobrevive à entry rebaixada. Isso vaza?
`reconcileEntry` só troca `status`; a entry rebaixada **mantém** `localDir`. Verifiquei o consumidor: `contentResolver.decide()` exige `packEntry.status === PACK_STATUS.READY` **antes** de olhar `localDir` ([contentResolver.js:78](src/services/contentResolver.js#L78)). Sem `ready`, o `file://` nunca é montado. **Não vaza.** (É o mesmo contrato já usado pela reconciliação de disco em produção.)

### A-D3 — O probe de disco muda de comportamento ao varrer o índice já gated?
Sim, e **para melhor**. Entries reprovadas no piso deixam de ser `ready` → `needsDiskCheck()` retorna `false` → **menos** chamadas a `getInfoAsync`. Nenhuma entry passa a ser probed que não fosse antes. Não há caminho em que o piso **promova** algo a `ready` (`reconcileEntry` nunca promove).

### A-D4 — `1.9.0` vs `1.10.0`
Comparação lexicográfica diria `1.9.0 > 1.10.0` — errado. `compareSemver` deve comparar **numericamente por componente**. Coberto por T4.1. Risco real; teste obrigatório.

### A-D5 — Loop de download
O caminho é concreto: piso ativo + R2 antigo → usuário baixa → `markPackReady` grava `ready` com a versão velha → `refreshPacks()` → piso rebaixa → botão "Baixar" volta. **Não existe mitigação em código**; é sequência (spec §6). Mitigação de processo: mapa vazio no Momento 1 + ativação só após `verify-r2-pack-readiness.js` verde para aquela história.

### A-D6 — Estabilidade referencial (Livrinho)
`normalizedIndex` e `reconciledIndex` hoje preservam a **mesma referência** quando não há mudança, e `getPackEntry` depende disso (memória de timeline do Livrinho). `versionGatedIndex` **precisa** do mesmo contrato: mapa vazio ⇒ retornar `normalizedIndex` **por referência**, não uma cópia. Se retornar `{...normalizedIndex}`, o Livrinho rebuilda a timeline a cada boot. **Risco alto, mitigação barata** — T3.1 e o guard de no-op (T4.4).

### A-D7 — Downgrade-safe?
Sim. O índice persistido **não é reescrito**. Um app anterior, sem o piso, volta a considerar o pack `ready` e usa o `file://` antigo. Sem corrupção, sem migração de schema, sem `@ptf_packs_v2`.

### A-D8 — Entry com `version` nula é legítima?
`markPackReady`/`setPackEntry` sempre gravam `version` (vem do manifesto global). Uma `ready` sem `version` indica índice corrompido/legado. Tratá-la como **não aceitável** manda a história para o bundle — que pré-2C tem tudo. Falha para o lado seguro. **Documentado** como assimetria deliberada (spec §3.3), com a ressalva de que **se inverte no 2C**.

### A-D9 — O smoke consegue testar isto sem device?
Sim. O padrão já existe: `evalReconcile()` faz strip dos `import` e injeta `PACK_STATUS` ([smoke.js:14280](scripts/smoke.js#L14280)). As funções novas entram no mesmo `return {...}`. `packMinVersions.js` é puro e sem imports → carrega direto.

### A-D10 — O guardrail de arquitetura sobrevive?
Sim. Nenhuma `src/screens/*` passa a importar camada `pack*`; `PacksContext` continua sem importar `packDownloadService`; `contentResolver` não sabe que o piso existe. T4.6 assere os três.

## 3. Verificações de segurança

| # | Ponto | Veredito |
|---|---|---|
| A1 | `@ptf_packs_v1` não muda de nome, schema nem conteúdo | ✅ invalidação só em memória |
| A2 | Nenhum arquivo apagado; nenhum FS write | ✅ spec §2; tasks T3.3 |
| A3 | Nenhuma requisição de rede | ✅ o piso é comparação de strings |
| A4 | Starter (`creation`/`noah`) inalterado | ✅ short-circuit por camada em `getStoryPackState`, antes do índice |
| A5 | Remote **sem** piso inalterado | ✅ id ausente do mapa → `getPackMinVersion` = `null` → aceita |
| A6 | Nunca promove a `ready` | ✅ `reconcileEntry` só rebaixa |
| A7 | `contentResolver`, downloader, `packStorageService`, hooks e telas intocados | ✅ T4.6 |
| A8 | `computeInvalidReadyIds` retrocompatível | ✅ **não é alterada** (A-D1) |
| A9 | Progresso, entitlement, compras, `@ptf_*` de progresso | ✅ fora do caminho; nada tocado |
| A10 | Momento 1 é comprovadamente no-op | ✅ mapa vazio + guard T4.4 |
| A11 | Sem frame de arte velha | ✅ `useMemo` síncrono (A-D1) |
| A12 | Nota de validade não some numa refatoração | ✅ guard T4.7 |

## 4. Riscos por arquivo

| Arquivo | Risco | Mitigação |
|---|---|---|
| `src/data/packMinVersions.js` | Ativar um id antes da republicação → **loop de download** | Mapa vazio no Momento 1; ativação só após `verify-r2-pack-readiness.js` verde; portão por lote |
| `src/services/packReconcileService.js` | Comparador semver errado (`1.9` vs `1.10`); regressão nas funções existentes | T4.1; funções existentes **não são tocadas** |
| `src/context/PacksContext.js` | Perda de estabilidade referencial (Livrinho rebuilda); virar read-write por descuido | Retornar a mesma referência no caso vazio (A-D6); guard T4.6; device T9.8 |
| `scripts/smoke.js` | Falso verde (checar o mapa em vez do comportamento) | Testar o **núcleo puro** com entries sintéticas, não só a existência do mapa |

## 5. Cobertura de teste

**Sem device (smoke):** semver (incl. `1.9.0 < 1.10.0`), aceitação por status/versão/ausência de piso, no-op do mapa vazio, retrocompatibilidade, starter sem piso, guards de arquitetura e da nota de validade.

**Só com device (Eduardo):** tudo que depende de **persistência real** — um pack `ready` gravado **antes** da atualização do app. Não é reproduzível em smoke: exige AsyncStorage povoado + arquivos em `documentDirectory` + reinstalação. Roteiro em spec §8 / tasks T9.

**Lacuna assumida:** o Momento 1 não é validado em device (não muda comportamento). A primeira validação real acontece no Momento 2, na primeira história ativada.

## 6. Conclusão

Consistência **OK após corrigir A-D1**. Segurança verificada: índice intocado, sem rede, sem delete, starter e remote-sem-piso preservados, downgrade-safe, guardrail de arquitetura mantido. O risco dominante **não é de código** — é de **sequência** (A-D5), e está contido pelo desenho em dois momentos com portão humano.

**Pronto para o Portão 3.** Nada implementado.

## 7. Confirmação de paralelismo

A **produção externa das 37 artes** (`producao-m3.md`) é **independente** de M3.1b e **pode seguir agora**. O designer não depende de nenhuma task deste bloco. As trilhas só se encontram no **Momento 2, pré-condição 1** (arte entregue e validada). Nenhuma decisão deste documento altera o briefing de arte.
