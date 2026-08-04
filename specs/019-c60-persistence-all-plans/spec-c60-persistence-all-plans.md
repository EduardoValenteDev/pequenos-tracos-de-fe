# Spec — Persistência local do Colorir com o Beni para todos os planos

> **Feature:** `019-c60-persistence-all-plans` · **Etapa SDD:** 1–3 (Specify · Clarify · Checklist)
> **Data:** 2026-08-03 · **Base exata:** `1e2f8dd33ba6a222745e8de898a6b63b2e426da6` (HEAD validado fisicamente de `integrate/c60-pilot-activation`)
> **Branch de trabalho:** `spec/019-c60-persistence-all-plans` (nascida diretamente da base acima)
> **Identificador:** `019` (próximo livre — `018` = c60-pilot-activation)
> **Natureza:** **mudança de política de persistência** — a autoridade de escrita do Colorir 60 troca o critério de decisão. Área sensível (progresso e storage): fluxo SDD completo, revisão independente e validação física própria.
>
> **Precedência:** SoT ([`docs/PROJECT_SOURCE_OF_TRUTH.md`](../../docs/PROJECT_SOURCE_OF_TRUTH.md)) → constituição → `AGENTS.md`/`CLAUDE.md` → esta spec.
> **Não reabre** as decisões de 014/015/016/017/018, do P3J, do P3J-R.1 nem do P3J-R.1 FIX1.
>
> **Autorização do fundador (2026-08-03):** aprovação da auditoria read-only combinada + ordem "Bloco D1" com as Decisões **A** (salvamento), **B** (conclusão global) e **C** (encerramento de atividades).
>
> **Reancoragem documental (2026-08-04) — HEAD `2bca66f3142168f53e238deed47fd8c1b7715975`.** Os blocos
> **S1 · S2 · S3 · S4** estão implementados. A auditoria do S4 encontrou um **defeito bloqueante de
> ordem de exclusão**, corrigido no commit `2bca66f`. Esta reancoragem **formaliza o contrato que a
> correção estabeleceu** (§20) e o **protocolo físico correspondente** (§14.1) — ela **não reabre**
> nenhuma decisão aprovada nem amplia o escopo para outras funcionalidades.

---

## 1. Contexto

O Colorir com o Beni ("Colorir 60") está **tecnicamente completo e validado fisicamente** para "A Criação": três atividades, assets conferidos por SHA-256, navegação canônica, storage isolado com *double buffer*, conclusão, coleção, prévia e marcos nas cenas 02/07/09.

O que o piloto expôs não foi um defeito de implementação — foi uma **consequência da política de produto**. Uma criança do plano gratuito abria a atividade, pintava, concluía, recebia a celebração… e **nada do que ela pintou ficava guardado**. O desfecho `NOT_PERSISTED_FREE` era, por decisão registrada, **comportamento correto**.

Em 2026-08-03, após a aprovação física do build `3b4dea54`, o fundador **revogou essa política**:

> *"A política 'Free sem persistência no Colorir com o Beni' está formalmente REVOGADA."*

Esta spec executa a revogação **no código**, sem tocar no Criar Livre e sem antecipar o redesenho global da conclusão.

### 1.1 Causa técnica exata do não salvamento (apurada na auditoria)

É **um único `if`**, deliberado, colocado **antes de qualquer I/O**, em [`src/services/coloring60DrawingStorage.js`](../../src/services/coloring60DrawingStorage.js):

```js
// coloring60DrawingStorage.js:336-340
if (plan !== FAMILY_PLAN && !isDevWriteAuthorized()) {
  return COLORING60_SAVE_RESULT.NOT_PERSISTED_FREE;
}
```

O `return` acontece **antes** do cálculo da chave, da leitura do estado anterior e de `writeSlot`. **Zero bytes tocam o disco.** Não existe segundo portão de plano em nenhum outro ponto do caminho de escrita — o que torna a correção **cirúrgica**: um ponto, um critério.

### 1.2 Fato que dimensiona o risco

**Não existe nenhuma chave `EXPO_PUBLIC_REVENUECAT_*` declarada no `.env` nem em nenhum perfil do [`eas.json`](../../eas.json)**, e `__DEV__` é `false` no perfil `c60-pilot`. Logo `getCurrentPlan()` resolve deterministicamente para `'free'` e o ramo premium era **inalcançável** naquele binário.

**Consequência:** o caminho de **escrita** do Colorir 60 — *double buffer*, promoção de ponteiro, verificação pós-escrita, *rollback*, hidratação, edição e sobrescrita — **nunca foi exercitado em dispositivo físico**. É provado **apenas** por `scripts/smoke.js`. Esta spec abre esse caminho para **todos** os planos; por isso a validação física é **obrigatória e própria**, e **não pode ser herdada** do build `3b4dea54`.

---

## 2. Identidade da branch

| Item | Valor |
|---|---|
| **Branch desta spec** | `spec/019-c60-persistence-all-plans` |
| **HEAD de partida** | `1e2f8dd33ba6a222745e8de898a6b63b2e426da6` |
| **Branch validada e preservada** | `integrate/c60-pilot-activation` — **não recebe novos commits** |
| **Branch principal** | `main` — **não é tocada** |

---

## 3. Build físico anterior de referência

| Item | Valor |
|---|---|
| **Build** | `3b4dea54-2194-491c-8ddb-0c6bf85ad049` |
| **Commit validado** | `1e2f8dd33ba6a222745e8de898a6b63b2e426da6` |
| **Perfil** | `c60-pilot` (interno, iOS, `__DEV__ = false`) |
| **Veredito do fundador** | FIX 1 **APROVADO** · FIX 2 **APROVADO** · FIX 3 **TECNICAMENTE APROVADO** |
| **Também aprovados** | navegação, Cultinho, Criar Livre e funcionamento offline local |

**NÃO executados no build de referência** (e a causa está em §1.2, não em omissão do testador):

1. Entitlement Família real.
2. Persistência com plano Família real.
3. Download de histórias premium.
4. Testes premium sem ferramentas internas.

> **Estes quatro itens não são herdáveis.** Eles pertencem ao protocolo de validação física desta spec (§14).

---

## 4. Decisão revogada

| Registro | Efeito |
|---|---|
| [`D-FREE-SEM-SALVAR`](../../docs/DECISIONS.md) | ⚠️ **parcialmente revogada** — cai para o Colorir narrativo; **fica** para o Criar Livre |
| `D-C60-INTEGRACAO-PRODUTO` §1 regras **1, 2, 7, 8** | ❌ **revogadas** para o Colorir narrativo (regras 3–6 e 9 ficam) |
| `D-C60-INTEGRACAO-PRODUTO` §2 regras **3, 4** | ❌ **revogadas** para história acessível (regras 1, 5, 6 ficam e são reafirmadas) |
| `D-C60-PILOT-ATIVACAO` item **4**, frase *"o plano gratuito não salva a arte"* | ❌ **revogada** (todo o resto da decisão fica) |
| `D-LP-FECHAMENTO` condição obrigatória **1** da Fase 2.5 | ⚠️ **critério substituído** (camada e fail closed ficam) |
| Roadmap v5, **Fase 2.5 entrega #2** | ⚠️ **revisada** |
| Roadmap v5, **Fase 2.5 critério de saída** "zero pixels no Free" | ⚠️ **revisado** |

**NÃO revogados — e esta spec é proibida de tocá-los:** `E1-PLANO-FREE` · `E1-ARTES-SALVAR` · limite zero de `ATELIER_FREE_SAVE_LIMIT` · `D-C60-NOMEACAO-OBRAS`.

---

## 5. Nova regra

1. Toda pintura do **Colorir com o Beni** deve ser **salva localmente** quando o usuário possuir **acesso à história**.
2. O **plano gratuito salva** as pinturas das histórias gratuitas **ou de qualquer história à qual possua acesso legítimo**.
3. O **plano Família salva** as pinturas das histórias premium às quais possua **acesso legítimo**.
4. A regra de escrita **não é mais "somente Família"**.
5. A autoridade de escrita decide pela **acessibilidade real da história e da atividade**.
6. O salvamento **funciona offline**.
7. **Uma pintura visível por atividade.**
8. Uma nova conclusão **substitui com segurança** a pintura anterior da mesma atividade.
9. **Sem** histórico de múltiplas versões.
10. **Sem** sincronização em nuvem nesta fase.
11. **Sem** pedir nome para a pintura narrativa.
12. **Sem** alterar o Criar Livre.
13. **Sem** reintroduzir o Ateliê legado.
14. A **coleção** permite **rever e editar a obra real**.
15. A política suporta **três atividades em cada uma das vinte histórias** (60 slots).

> **A diferenciação comercial permanece — muda de lugar.** O Plano Família continua diferenciado
> principalmente pelo **acesso às histórias e experiências premium**, não pela retenção das pinturas
> das histórias gratuitas.

### 5.1 Downgrade de Família para Grátis

1. Pintura premium **já salva nunca é apagada** no downgrade.
2. **Arquivo e ponteiro permanecem preservados** localmente.
3. Enquanto a história premium **não estiver acessível**, a criança **não inicia nem edita** aquela atividade.
4. O aplicativo **não destrói a obra**.
5. Com o **retorno do acesso Família**, a obra **reaparece e volta a ser editável**.
6. **Sem pressão comercial infantil.**
7. **Sem prometer acesso** a história comercialmente bloqueada.
8. **Preservar dados ≠ liberar conteúdo premium.**

---

## 6. Escopo

1. Trocar o **critério** da autoridade de escrita do Colorir 60: de *plano* para *acessibilidade da história e da atividade*. A **camada** e o **fail closed** permanecem.
2. Reescrever, **por intenção e não por remoção**, as asserções de `scripts/smoke.js` que hoje travam a regra revogada.
3. Migrar a leitura do **estado legado `NOT_PERSISTED`** e aplicar a **copy transitória**.
4. Fazer a **coleção exibir `ART` real** para as pinturas persistidas por qualquer plano.
5. Endurecer **sobrescrita, edição e recuperação**, e introduzir **GC dirigido de arquivos órfãos**.
6. **Separar as três ações de reset** na Área dos Pais.
7. Governança: revogação formal (**D1**) e fechamento documental pós-validação física (**D2**).

---

## 7. Fora do escopo

**Proibido nesta spec, sem exceção:**

- Qualquer alteração no **Criar Livre** / Ateliê (§15).
- Qualquer reintrodução do **Ateliê legado** (§16).
- Qualquer implementação do **sistema global de conclusão** ou de **encerramento de jogos** (§17).
- **Cloud sync**, histórico de versões, nomeação da pintura narrativa.
- Persistência do **Monte a Cena** — mesma classe de defeito (`if (premium)` em [`MonteACenaTableGameScreen.js:142-146`](../../src/screens/MonteACenaTableGameScreen.js)), **fora** do alcance da Decisão A, que trata do Colorir com o Beni. Registrado (I-14), não corrigido.
- Correções de robustez do **colorir legado** e do **Ateliê** (I-15 da auditoria).
- Alteração de **paywall, RevenueCat, entitlements, catálogo, assets, áudios, manifestos** ou `main`.
- Alteração de `package.json`, `package-lock.json`, `bundle identifier` ou `runtimeVersion`.
- **Novas dependências.**

> **Exceção pontual autorizada em 2026-08-04 (fundador, ordem "fechamento pré-build").** O `expo`
> instalado (`54.0.35`) divergia do exigido pelo catálogo do SDK 54 (`~54.0.36`), o que mantinha
> `npx expo-doctor` em **17/18** e barrava o portão. A ordem autorizou **apenas** o alinhamento mais
> restrito possível: `npx expo install expo@~54.0.36`. Efeito: **uma linha** de `package.json` (a faixa
> do `expo`) e o `package-lock.json` correspondente. **Nenhuma outra dependência declarada foi tocada**
> (as demais mudanças do lockfile são o fecho transitivo do próprio `expo`, listado no relatório do
> bloco). **`bundle identifier` e `runtimeVersion` permanecem proibidos e intocados.** A proibição
> geral desta seção **continua valendo** para todo o resto da spec.

---

## 8. Critérios de entrada

| # | Critério | Estado |
|---|---|---|
| CE1 | Auditoria read-only combinada **aprovada** pelo fundador | ✅ 2026-08-03 |
| CE2 | Branch `spec/019-c60-persistence-all-plans` criada de `1e2f8dd3` | ✅ |
| CE3 | `integrate/c60-pilot-activation` preservada em `1e2f8dd3`, sem novos commits | ✅ |
| CE4 | **D1 concluído** — revogação formal no árbitro e no roadmap v5 **antes** de qualquer código | ⬅ **este bloco** |
| CE5 | `npm run smoke` verde na base (`4319/4319`) | ✅ |
| CE6 | `node scripts/verify-coloring60-assets.js` verde (`16/16`) | ✅ |

> **CE4 é bloqueante e não negociável.** Enquanto o árbitro mandar o oposto, qualquer código que
> remova o portão contradiz [`docs/DECISIONS.md`](../../docs/DECISIONS.md) — e **26 ocorrências** do
> desfecho em `scripts/smoke.js` o defendem ativamente.

---

## 9. Critérios de saída

| # | Critério |
|---|---|
| CS1 | **Free salva uma pintura real** do Colorir narrativo. |
| CS2 | **Reinício** do app mantém a obra. |
| CS3 | **Offline** mantém a obra. |
| CS4 | **Coleção exibe `ART` real.** |
| CS5 | **Preview exibe a atividade correta.** |
| CS6 | **Editar e salvar substitui com segurança.** |
| CS7 | **Uma atividade nunca reutiliza pixels de outra.** |
| CS8 | **Família continua funcionando.** |
| CS9 | **Downgrade não apaga pinturas premium.** |
| CS10 | **`NOT_PERSISTED` legado permanece concluído.** |
| CS11 | **Repintar converte `NOT_PERSISTED` em `ART`.** |
| CS12 | **Falha de escrita preserva estado honesto** (conclusão mantida, celebração sem mentira). |
| CS13 | **Falha de sobrescrita preserva a obra anterior.** |
| CS14 | **Reset de progresso preserva pinturas.** |
| CS15 | **Exclusão de pinturas é ação parental separada.** |
| CS16 | **Criar Livre não sofre alteração.** |
| CS17 | **Ateliê legado permanece ausente.** |
| CS18 | **FIX 1, FIX 2 e FIX 3 permanecem verdes.** |
| CS19 | **Novo build físico validado.** |
| CS20 | **Nenhum arquivo órfão cresce sem limite** no fluxo normal. |

**Acrescentados na reancoragem de 2026-08-04** — decorrem do defeito encontrado na auditoria do S4 e
do contrato formalizado em §20. Não alteram CS1–CS20.

| # | Critério |
|---|---|
| CS21 | **Uma exclusão interrompida nunca reduz o contador** nem cria vaga `needsColor` por corrupção. |
| CS22 | **Nunca existe desfecho `ready` sem ponteiro e sem pixels** — em nenhum ponto da matriz §14.1. |
| CS23 | **Falha antes da limpeza lógica preserva arte, ponteiro e desfecho** — a identidade sai inteira. |
| CS24 | **Falha depois da limpeza lógica pode deixar resíduo físico**, mas a conclusão continua válida como `notPersisted`, **sem quebra de integridade**. |
| CS25 | **A segunda execução é idempotente e curativa**; matar e reabrir o app entre etapas não muda o desfecho. |
| CS26 | **A mensagem parental descreve o estado observado** — nunca afirma preservação que a reconciliação não confirmou. |

---

## 10. Estratégia de compatibilidade

**Princípio que limita todo o raio de explosão:** `NOT_PERSISTED` **não desaparece**. Muda apenas o seu **produtor** — de *"o plano é Grátis"* para *"conclusão legada sem pixels"*. Logo `Coloring60SlotStateMark`, a prévia e o leitor da coleção **continuam funcionando sem alteração de contrato**. A migração é **de dados, não de modelo**.

| # | Cenário | Comportamento exigido |
|---|---|---|
| 1 | `NOT_PERSISTED` antigo (Grátis legado) | **Permanece concluído.** Vaga mostra selo + copy transitória |
| 2 | `done = true` com snapshot ausente | idem #1 — a conclusão **nunca regride** |
| 3 | `ART` real premium | **intocado** — nenhuma reescrita, nenhuma renumeração |
| 4 | Ponteiro sem blob | resolve para `null` → vaga vira `needsColor` (honesto) |
| 5 | Blob órfão | preservado; **GC dirigido entra em S3** |
| 6 | Atualização por cima | chaves e diretórios **inalterados**; `POINTER_VERSION` permanece `3` |
| 7 | Reinício offline | tudo local; **nenhum caminho de rede** em nenhum ponto |
| 8 | Falha na primeira escrita | `WRITE_FAILED`; conclusão gravada com `NOT_PERSISTED`; celebração honesta |
| 9 | Falha na sobrescrita | **obra anterior intacta** — o slot ativo nunca é tocado |
| 10 | Retorno a versão anterior do app | ponteiro v3 é lido por ambas; a versão antiga apenas **não escreve**. **Sem corrupção** |

**Copy transitória oficial** (cenários 1 e 2) — Título: **"Parte concluída!"** · Mensagem: **"Pinte de novo para guardar sua criação."**

**Orçamento de armazenamento declarado:** 1 obra visível por atividade · 60 slots no lançamento · até **150 MB** em `ptf_blobs/drawings60` · *double buffer* só durante a escrita · geração anterior removida só após promoção verificada · sem histórico ilimitado · **nenhum PNG no AsyncStorage** (só ponteiro e metadados).

---

## 11. Riscos

| # | Risco | Severidade | Mitigação |
|---|---|---|---|
| RS1 | **O caminho de escrita nunca rodou em dispositivo** (§1.2) e passa a valer para ~100% dos usuários | **ALTA** | Validação física própria e obrigatória (§14); **build proibido antes do fim do S1** |
| RS2 | **26 ocorrências no smoke** defendem a regra revogada (16 `NOT_PERSISTED_FREE` + 10 `not_persisted_free`) | **ALTA** | Reescrita **por intenção** no S1; nenhuma prova apagada; total de checks **não pode diminuir** |
| RS3 | Revogação vazar para o **Criar Livre** | **ALTA** | §15 + asserção dedicada de que `ATELIER_FREE_SAVE_LIMIT` continua `0` |
| RS4 | Crescimento de **blobs órfãos** sem GC | MÉDIA | GC dirigido por identidade no **S3** + CS20 |
| RS5 | **Reset de progresso apagar pinturas** que a criança não pediu para apagar | MÉDIA | **S4** é obrigatório **antes** do build físico |
| RS6 | Ponteiro v3 é `{v, fmt, uri, mime}` — **não guarda a dimensão do canvas**, logo não há como reconciliar viewports diferentes | MÉDIA (latente) | Fora do escopo desta spec; **registrado** (I-12) |
| RS7 | Downgrade destruir obra premium | MÉDIA | §5.1 + CS9 |
| RS8 | Antecipar silenciosamente o **redesenho global** da conclusão | MÉDIA | §17 + conferência de `git diff --name-only` a cada bloco |

---

## 12. Blocos

| Bloco | Conteúdo | Natureza | Pré-requisito |
|---|---|---|---|
| **D1** | **Governança e revogação formal.** Árbitro (`D-FREE-SEM-SALVAR`, `D-C60-INTEGRACAO-PRODUTO`, `D-C60-PILOT-ATIVACAO`, `D-LP-FECHAMENTO`), roadmap v5 Fase 2.5, abertura desta spec e registro da auditoria. | documental | — (**primeiro**) |
| **S1** | **Writer do C60 orientado por acessibilidade, não por plano.** Troca do critério na autoridade única de escrita + reescrita por intenção das asserções do smoke. | código + testes | **D1** |
| **S2** | **Migração do legado `NOT_PERSISTED`**, `ART` real na coleção e **copy transitória**. | código + testes | **S1** |
| **S3** | **Sobrescrita, edição, recuperação e GC dirigido** de arquivos órfãos. | código + testes | **S2** |
| **S4** | **Separação entre reset de progresso e exclusão de criações** (3 ações parentais). | código + testes | **S3** |
| **S4-FIX** | **Ordem de exclusão: desfecho lógico antes da destruição física**, identidade por identidade. Contrato em **§20**. | código + testes | **S4** |
| **D2** | **Fechamento documental** depois da validação física. | documental | **build físico validado** |

> **Nenhum bloco além do D1 está autorizado.** Cada um dos demais exige o seu próprio Portão Humano.

**Estado em 2026-08-04 (fechamento):** D1 · S1 · S2 · S3 · S4 · **S4-FIX** implementados e commitados
nesta branch. O **D2 ABRIU e foi executado** — a validação física do build
`bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a` (commit `b24c868`) foi declarada aprovada pelo fundador e está
registrada em [`docs/C60_VALIDACAO_FISICA.md`](../../docs/C60_VALIDACAO_FISICA.md) **Parte D**;
o veredito está em **§21**. Nenhum bloco novo foi criado: o **S4-FIX** é a correção do S4, não uma
funcionalidade nova.

| Bloco | Estado final |
|---|---|
| **D1** · **S1** · **S2** · **S3** · **S4** · **S4-FIX** | ✅ implementados, commitados e cobertos pelo smoke |
| **D2** | ✅ **executado em 2026-08-04** — fechamento documental sobre validação física aprovada |

---

## 13. Gates automatizados

| Gate | Comando | Exigência |
|---|---|---|
| Smoke | `npm run smoke` (ou `node scripts/smoke.js`) | **Verde.** O total de checks **não pode diminuir** em nenhum bloco. |
| Assets C60 | `node scripts/verify-coloring60-assets.js` | **Verde (16/16).** Gate **separado e obrigatório**, não substituível pelo smoke. |
| Expo Doctor | `npx expo-doctor` | **Verde (18/18).** Ver a exceção de 2026-08-04 em §7: o alinhamento restrito de `expo@~54.0.36` foi o **único** ajuste de dependência autorizado, feito justamente para fechar este portão. |
| Higiene de diff | `git diff --check` | Sem espaço em branco quebrado. |
| Escopo | `git diff --name-only` | Confere, a cada bloco, que só o previsto mudou. |

**No D1, o resultado esperado é `4319/4319` — exatamente o da base.** Um número diferente após um bloco puramente documental significaria que o D1 tocou código ou teste, o que é proibido.

---

## 14. Protocolo de validação física

**Pré-condição:** S1, S2, S3 e S4 concluídos. ⛔ **Nenhum build entre o D1 e o fim do S1.**

**Cenários obrigatórios** (o build `3b4dea54` **não** cobre nenhum dos quatro primeiros):

1. **Entitlement Família real** — exige chave `EXPO_PUBLIC_REVENUECAT_*` declarada no perfil de build. **Sem ela, o cenário é tecnicamente inexecutável.**
2. **Persistência com plano Família real** em história premium acessível.
3. **Download de história premium** e salvamento da pintura correspondente.
4. **Teste premium sem ferramentas internas** (`isInternalToolsEnabled()` falso).
5. **Grátis salva** pintura de história gratuita; a obra sobrevive ao **fechamento total do app**.
6. **Grátis offline** — modo avião durante todo o fluxo.
7. **Editar e concluir de novo** substitui a obra; a anterior não reaparece.
8. **Coleção e prévia** exibem a atividade correta, sem troca de pixels entre atividades.
9. **Slot legado `NOT_PERSISTED`** mostra "Parte concluída!" e permanece **concluído**.
10. **Repintar o slot legado** converte para `ART`.
11. **Reset de progresso** preserva as pinturas.
12. **Exclusão de pinturas** pela ação parental separada.
13. **Downgrade simulado** não apaga a obra premium.
14. **Criar Livre** inalterado, ainda **sem salvar** no Grátis.

**Registro:** resultado por cenário em [`docs/C60_VALIDACAO_FISICA.md`](../../docs/C60_VALIDACAO_FISICA.md), com build, commit e veredito do fundador. **O bloco D2 só abre depois disso.**

### 14.1 Matriz de falhas da exclusão e critérios físicos (S4-FIX · 2026-08-04)

**Matriz de falhas.** Cada linha é um ponto de interrupção real do storage. As colunas dizem o que
**deve** ser observado — e as três últimas são as que o defeito corrigido violava. Cada modo é
exercitado **duas vezes**: imediatamente e **depois de matar e reabrir o app**.

| # | Interrupção | Arte | Ponteiro | Desfecho | Contador | Vaga | Relatório |
|---|---|---|---|---|---|---|---|
| F1 | Falha ao **limpar o desfecho** | preservada | preservado | preservado | **3 de 3** | `art` | `ok:false` · `staleOutcomes` · `failed` **vazio** |
| F2 | Falha ao **remover o ponteiro** | preservada | preservado | já limpo | **3 de 3** | `notPersisted` ou `art` | `ok:false` · `failed`/`residual` |
| F3 | Falha ao **apagar o blob** | resíduo físico | removido | já limpo | **3 de 3** | `notPersisted` | `ok:false` · `residual` |
| F4 | **`multiRemove` parcial** (remove N e rejeita) | conforme a sonda | conforme a sonda | conforme a sonda | **3 de 3** | íntegra | decidido pela **sonda**, nunca pelo código de retorno |
| F5 | **Remove tudo e ainda assim rejeita** | apagada | apagado | apagado | **3 de 3** | `notPersisted` | **`ok:true`** — o estado final está íntegro |

**Invariantes que valem em TODA a matriz, inclusive após reinício:** o contador **nunca** cai de
"3 de 3"; **nunca** aparece vaga `needsColor` por corrupção; **nunca** existe desfecho `ready` sem
ponteiro e sem pixels; **nunca** há quebra de integridade na coleção; a **segunda execução** é
idempotente e cura o que sobrou; o **Criar Livre** e o **legado** permanecem intactos.

**Critérios da validação física** (acrescentam-se aos 14 cenários acima; registro no mesmo documento):

| # | Cenário físico | Critério observável |
|---|---|---|
| 15 | Apagar pinturas com as **3 atividades concluídas** | As 3 pinturas somem da coleção; o contador continua **"3 de 3"**; as vagas mostram **"Parte concluída!"**; nenhuma marca de erro. |
| 16 | Apagar pinturas e **fechar o app por completo** | Ao reabrir, o estado é **o mesmo** — sem contador reduzido, sem `needsColor`, sem quebra. |
| 17 | Apagar pinturas **em modo avião** | Idêntico ao cenário 15 — nenhum passo depende de rede. |
| 18 | **Repetir** a exclusão logo em seguida | Sucesso silencioso e idêntico; nada regride; nenhum alerta novo. |
| 19 | **Repintar** uma atividade depois de apagar | A vaga volta a `ART` com os pixels novos; a conclusão nunca oscilou. |
| 20 | **Mensagem parental** em caso de falha | O texto descreve o que **de fato** ficou; **não** contém a frase "O progresso não foi alterado". |
| 21 | **Reiniciar progresso** logo após apagar pinturas | As duas ações permanecem separadas; nenhuma executa a outra. |
| 22 | **Criar Livre** depois de apagar as pinturas do Colorir | Galeria "Minhas artes" intacta; `ATELIER_FREE_SAVE_LIMIT` continua `0`. |

> **Limite honesto desta matriz.** Os modos F1–F5 são induzidos **no arnês** (`scripts/smoke.js`), onde
> a falha do storage pode ser provocada. Em dispositivo eles **não são reproduzíveis sob demanda** — o
> que o teste físico verifica são os **cenários 15–22** e os **invariantes** acima. A matriz responde
> pelo comportamento sob falha; o aparelho responde pelo caminho real.

---

## 15. Proibição de alterar o Criar Livre

**O Criar Livre não é tocado por esta spec — em nenhum bloco, por nenhum motivo.**

Permanecem **integralmente vigentes**: `E1-PLANO-FREE` ("Criar Livre sem salvar") · `E1-ARTES-SALVAR` ("Grátis = zero salvamentos") · `ATELIER_FREE_SAVE_LIMIT = 0` · a trava de smoke que fixa esse limite · o fluxo de nomeação da obra · a galeria "Minhas artes" · a proteção de saída sem salvar.

**Fundamento:** [`D-C60-NOMEACAO-OBRAS`](../../docs/DECISIONS.md) — **Colorir com o Beni é COLEÇÃO** (obra derivada de um lineart, sem nome, uma por atividade); **Criar Livre é AUTORIA** (obra do zero, com nome, ilimitada). A revogação alcança **a coleção** e **não** a autoria.

**Verificação:** `git diff --name-only` não pode conter `atelierStorage`, `AtelierCanvasScreen`, `AtelierGalleryScreen` nem qualquer arquivo do Criar Livre.

---

## 16. Proibição de reintroduzir o Ateliê legado

A tela-hub **"Ateliê do Beni"** (`src/screens/AtelierScreen.js`) e a rota `AtelierFromContext` foram **removidas** em P3J-R.1 FIX1, por decisão **final e irrevogável** do proprietário registrada em `D-CULTINHO-CRIAR-LIVRE`, após reprovação em validação física.

**Esta spec não os recria, não os referencia e não cria variante equivalente.** Nenhum menu intermediário entre uma origem e a criação. O resíduo declarado (`ATELIER_GUIDE` e as 5 entradas `guide.atelier.*`) **permanece intocado** — mexer nele alteraria manifesto de áudio, **área protegida**.

---

## 17. Proibição de implementar a conclusão global nesta spec

As Decisões **B** (sistema global de conclusão das histórias) e **C** (linguagem global de encerramento de jogos e atividades) estão **registradas como decisões de produto** no árbitro, e o seu **contrato técnico NÃO está congelado**.

**Nada delas é implementado aqui.** Em particular, esta spec **não** cria `CompletionShell`, `StoryCompletionTemplate`, `GameCompletionTemplate`, `ActivityCompletionTemplate`, `CompletionActionPolicy`, `ReturnNavigationPolicy` nem `CompletionContentModel`; **não** unifica `CongratsScreen` com `PostStoryHubScreen`; **não** altera `planC60Exit`; **não** adiciona campos de conclusão às histórias; **não** mexe no `STAR_BONUS` do Quiz; **não** padroniza os encerramentos dos quatro jogos.

**Congelamento previsto: Product Lock da Fase 4.** Os achados que impedem o congelamento imediato estão em [`AUDITORIA_READONLY_C60_CONCLUSAO.md`](AUDITORIA_READONLY_C60_CONCLUSAO.md) e em `D-CONCLUSAO-ESTADO-ATUAL`.

> **Orientação explícita do fundador:** *"Não antecipe silenciosamente o redesenho global na branch atual."*

---

## 18. Checklist de qualidade dos requisitos (Etapa SDD 3)

- [x] Nenhum `[NEEDS CLARIFICATION]` em aberto — as Decisões A, B e C e o downgrade foram ditados pelo fundador.
- [x] Todo critério de saída é **observável** (§9) e tem cenário físico correspondente (§14).
- [x] Escopo proibido explícito e verificável por diff (§7, §15, §16, §17).
- [x] Risco de regressão do Criar Livre identificado e endereçado (RS3).
- [x] Sequenciamento **documento antes de código** declarado e justificado (CE4, §12).
- [x] Estado transitório **declarado**, não escondido (⛔ sem build entre D1 e S1).
- [x] Rastreabilidade preservada: as asserções do smoke mudam de **critério**, nunca de **intenção**.

## 19. Critérios de reversão

1. **Reversão total:** descartar a branch `spec/019-c60-persistence-all-plans`. A linha validada permanece intacta em `1e2f8dd3`.
2. **Reversão documental:** reverter o commit do D1 restaura o árbitro anterior — **e o código nunca terá sido alterado**, já que D1 antecede S1.
3. **Reversão pós-implementação:** nenhuma migração destrutiva é executada; ponteiros v3 e blobs continuam legíveis por versões anteriores, que apenas **não escrevem**. Nenhum dado do aparelho é apagado por uma reversão.

---

## 20. Contrato canônico da exclusão de pinturas (S4-FIX · reancorado em 2026-08-04)

> **Natureza:** formalização do contrato que o commit `2bca66f` estabeleceu em
> [`src/services/coloring60ResetService.js`](../../src/services/coloring60ResetService.js) e em
> [`src/screens/ParentAreaScreen.js`](../../src/screens/ParentAreaScreen.js). **Não reabre** decisão
> aprovada e **não amplia** o escopo: descreve a ação parental "Apagar pinturas" já decidida em §12/S4
> e em `D-C60-PERSISTENCIA-TODOS-PLANOS` §4.

### 20.1 O defeito que este contrato elimina

A versão anterior destruía **ponteiro e blob de cada identidade** e só depois limpava os desfechos
gravados **das três de uma vez, num único lote**. Uma falha naquele lote deixava desfecho `ready`
apontando para pixels que já não existiam: a reconciliação caía em `missing`, a vaga virava
`needsColor`, o contador caía de **3 de 3 para 0** e a coleção acusava quebra de integridade — e,
diferente do resíduo físico, **esse estado atravessava o reinício do app**.

### 20.2 A ordem obrigatória — por identidade, lógica primeiro

Para **cada** atividade do catálogo, **isoladamente** e **nesta ordem**:

1. **Limpeza lógica individual.** `clearColoring60Snapshot(storyId, [id])` — **lote de UMA chave**.
   O estrago de uma identidade **não pode atravessar** para outra. Um lote com as três é violação
   deste contrato, ainda que "funcione" no caminho feliz.
2. **Sonda canônica do estado.** Reler o desfecho pelo **leitor canônico da jornada** e classificar em
   **`absent` · `present` · `unknown`**. A sonda **não** pode reimplementar literais de chave.
3. **Destruição física.** `clearColoring60SavedDrawing(storyId, id)` — ponteiro, blob e varredura
   dirigida de órfãos — **somente** se o passo 2 devolveu `absent`.

Permanecem íntegras todas as proteções já aprovadas: **restrição ao subdiretório** `drawings60/`,
**identidade do catálogo**, **GC dirigido** por identidade e **preservação da conclusão**
(`done` / `ever` nunca são tocados por esta ação).

### 20.3 Por que a sonda decide — e não o código de retorno

**`multiRemove` não é transacional por contrato.** Na implementação nativa ele percorre chave a
chave, **acumula erros sem abortar** e grava o manifesto uma única vez no fim. Logo *"removeu tudo e
ainda assim rejeitou"* é **desfecho previsto**, não hipótese. Obedecer ao código de retorno erraria
nos dois sentidos: recusaria prosseguir sobre um estado já limpo e anunciaria fracasso sobre um disco
íntegro. **Quem decide é a leitura do que ficou** — antes de destruir (§20.2 passo 2) e outra vez no
fim, em **leitura em lote sobre a jornada inteira**.

### 20.4 Proibição de destruir sob estado lógico presente ou não verificável

Se o passo 2 devolver **`present`** *ou* **`unknown`**, a identidade **sai inteira**: obra, ponteiro e
desfecho **preservados**. **Não verificar não autoriza destruir.** É deliberadamente conservador:
um estado consistente e repetível vale mais do que uma obra destruída sob um desfecho que continua
prometendo arte. A operação devolve `ok: false` e a interface convida a repetir.

### 20.5 Relatório — três resíduos, três significados

| Campo | Significado **único** | Ação corretiva |
|---|---|---|
| `failed` | A exclusão **física** falhou nesta identidade. | Repetir a exclusão. |
| `residual` | Resíduo **físico** observado: ponteiro, blob ou arquivo sobrevivente. | Repetir a exclusão. |
| `staleOutcomes` | Resíduo **lógico** observado: desfecho gravado que permaneceu. **A obra dessas identidades não foi tocada — de propósito.** | Repetir a exclusão. |

**É proibido** usar `failed` para representar ao mesmo tempo falha física e falha lógica sem dizer
qual etapa quebrou. `removedPointers` e `removedBlobs` são **contagens medidas** por sondas antes e
depois — só conta como removido o que existia antes e não existe depois.

### 20.6 `completionPreserved` e `verified`

| Campo | Contrato |
|---|---|
| `completionPreserved` | **Medição, não promessa.** Um retrato inicial em lote registra quais identidades chegaram concluídas; o retrato final compara. Vira `false` **apenas** se alguma conclusão realmente se perdeu. |
| `verified` | **O relatório é observado, não presumido.** Vira `false` quando um dos retratos não pôde ser lido. Sem leitura final, preserva-se o que as sondas por identidade apuraram e **assume-se o não verificado** — nunca o contrário. |

A sonda final **corrige o relatório nos dois sentidos**: retira da lista de resíduo lógico a
identidade cujo desfecho o storage removeu apesar de ter rejeitado, e acusa a que ficou para trás em
silêncio. **`ok` é falso** diante de falha, de resíduo de qualquer natureza, de conclusão perdida ou
de verificação impossível. **Remoção completa com erro reportado no fim, sobre estado final íntegro,
resulta em `ok: true`** — o fracasso não pode ser automático quando o disco está limpo.

### 20.7 Mensagens parentais derivadas do estado observado

A frase **"O progresso não foi alterado" está proibida** nesta ação: ela era escrita **antes** de
olhar o resultado, enquanto o `refreshProgress()` que roda logo acima já podia ter redesenhado o
contador na frente do responsável. Cada frase passa a corresponder a um **campo medido**:

| Condição | O que a mensagem diz |
|---|---|
| `completionPreserved === false` | O progresso **mudou** — e convida a conferir. |
| `verified === false` | **Não foi possível confirmar** o estado; a conclusão continua de pé. |
| `staleOutcomes.length > 0` | Pinturas **mantidas como estavam, de propósito**; repetir é seguro. |
| resíduo físico | Pinturas podem **não ter saído por completo**; repetir. |

O convite a repetir aparece **sempre**, porque repetir é seguro e idempotente.

### 20.8 Idempotência, reinício e resíduo aceitável

1. **Idempotência.** A segunda execução converge e **cura** o que sobrou. Sobre estado já limpo, as
   sondas examinam e não encontram nada — sem erro, sem regressão.
2. **Reinício seguro.** Matar e reabrir o app **entre quaisquer duas etapas** não reduz o contador,
   não cria vaga `needsColor` por corrupção e não muda o desfecho da execução seguinte.
3. **Resíduo físico é aceitável; resíduo lógico não.** Falha **depois** da limpeza lógica pode deixar
   arquivo no aparelho — a vaga reconcilia para `notPersisted`, **a conclusão continua válida e não há
   quebra de integridade**. Falha **antes** dela preserva tudo. **O estado proibido em qualquer
   interrupção é desfecho `ready` sem ponteiro e sem pixels.**
4. **A limpeza do resíduo não é automática:** `ok: false` e a mensagem pedem a repetição.

### 20.9 Rastreabilidade

| Artefato | Onde |
|---|---|
| Implementação | `src/services/coloring60ResetService.js` · `src/screens/ParentAreaScreen.js` |
| Provas executáveis | `scripts/smoke.js` — série **S4C [01/13]…[13/13]** e controles negativos **CN-S4** |
| Matriz de falhas e critérios físicos | **§14.1** |
| Critérios de saída correspondentes | **CS21–CS26** (§9) |

> **O que estas provas não cobrem.** Os modos de falha são induzidos em arnês Node; `AsyncStorage` e
> `expo-file-system` **reais** não foram exercitados sob falha. A validação física (§14.1, cenários
> 15–22) permanece **obrigatória** — e a Spec 019 **não** está fisicamente aprovada por este bloco.
>
> ✅ **Cumprido em 2026-08-04.** A validação física exigida acima foi executada no build
> `bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a` e **aprovada pelo fundador**. Ver **§21**.

---

## 21. Fechamento físico e veredito da Spec 019 (2026-08-04)

### 21.1 Build validado

| Item | Valor |
|---|---|
| **Build ID** | `bafb8e3f-4fd5-43b6-873b-aca69a4a8a6a` |
| **Commit validado** | `b24c86842a03bf7216d62b90a7fba6514cfb3f98` |
| **Branch de origem** | `spec/019-c60-persistence-all-plans` |
| **Perfil** | `c60-pilot` · distribuição **interna** · iOS |
| **Fingerprint** | `c8b6c521500558fde471e47202d41d5e9dda79aa` |
| **Data da validação física** | **2026-08-04** · iPhone real do fundador |
| **Registro completo** | [`docs/C60_VALIDACAO_FISICA.md`](../../docs/C60_VALIDACAO_FISICA.md) **Parte D** |

### 21.2 Resultado declarado pelo fundador

**Aprovação visual — A1 a A5:** Colorir com o Beni em *A Criação* · as três atividades do piloto · o
Cultinho direcionando ao Criar Livre atual · paridade entre Criar Juntos e Criar Livre · ausência do
Ateliê legado. **Todos APROVADOS.**

**Validação de persistência e exclusão — P1 a P10:** persistência das três pinturas após encerramento
completo do app · substituição sem duplicação · contador preservado em `3 de 3` · reiniciar progresso
preservando as pinturas · apagar pinturas preservando conclusão e Criar Livre · `notPersisted` sem
`needsColor` nem quebra de integridade · apagar criações do Criar Livre sem tocar no Colorir ·
persistência do estado após reinício com segunda exclusão idempotente · execução em Modo Avião ·
mensagens parentais coerentes com o estado observado. **Todos APROVADOS.**

**Portões automatizados no commit validado:** `npm run smoke` **4512/4512, 0 falhas** ·
`npx expo-doctor` **18/18** · parse Babel dos módulos tocados **3/3**.

### 21.3 O que este veredito NÃO cobre

Os cenários **1, 2, 3 e 13** de §14 permanecem **NÃO VALIDADOS** e o cenário **4** permanece
**PARCIAL** — por **impossibilidade técnica do perfil**, exatamente como §1.2 e §3 já previam: o
`c60-pilot` não declara chave `EXPO_PUBLIC_REVENUECAT_*` e `configureRevenueCat()` é *fail closed*,
de modo que o binário opera permanentemente no plano Grátis.

**Não são registrados como aprovados nem como reprovados.** Por decisão do fundador em 2026-08-04,
tornam-se **obrigatórios na Fase 18** (RevenueCat, Stripe e Plano Família) com **revalidação
obrigatória na Fase 21** (Beta do candidato).

### 21.4 Veredito

> ## ✅ **SPEC 019 — FISICAMENTE APROVADA** no eixo executável do perfil `c60-pilot`
>
> Persistência local, conclusão, coleção, substituição de obra, separação entre reset de progresso e
> exclusão de criações, contrato canônico de exclusão (**§20**), comportamento offline e honestidade
> das mensagens parentais estão **validados em dispositivo físico** no **Plano Grátis**.
>
> **Todos os blocos — D1, S1, S2, S3, S4, S4-FIX e D2 — estão concluídos.**
> **A Spec 019 está encerrada.**

**Preservação.** Os comportamentos A1–A5 e P1–P10 **não podem ser reabertos silenciosamente**.
Qualquer alteração futura que os toque exige spec própria, provas de regressão e nova validação física.
