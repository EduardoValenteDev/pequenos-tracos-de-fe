# `40` · RETOMADA DETERMINÍSTICA APÓS PERDA DE SESSÃO · PRÉ-`SF1` · ARBITRAGENS MINIMIZADAS

> **Natureza deste artefato.** Missão conduzida **inteiramente do lado do *host*, em modo leitura**.
> Nenhum comando `adb` foi emitido · nenhum Metro foi iniciado · nenhum *build* foi gerado ·
> nenhum *worktree* foi criado · **o tablet não foi tocado, acordado nem desbloqueado** · nenhum
> código funcional foi alterado. Tudo abaixo é **aditivo e rastreável**: nenhuma afirmação histórica
> foi apagada, e nenhuma decisão é atribuída ao fundador sem ato documental correspondente.
>
> **Estado alvo alcançado:** `PRE_SF1_ARBITRATIONS_MINIMIZED`.

---

## 1 · Baseline confirmado

| | Esperado | Medido | |
|---|---|---|---|
| Raiz | `C:\tmp\ptf_fase6_shell_splash_wt` | idem | ✅ |
| *Branch* | `feat/fase6-shell-splash` | idem | ✅ |
| `HEAD` | `07f83c8` | `07f83c8727e1ce704582c1ae12acc8d70a832e07` | ✅ |
| `git status --porcelain` | vazio | vazio **na abertura da missão** | ✅ |
| *Upstream* | — | **nenhum configurado** | ✅ |

**Não houve `STOP_RECOVERY_BASELINE_DIVERGENCE`.** Nada foi resetado, guardado em *stash*,
rebaseado, sobrescrito ou removido. O histórico não foi alterado.

---

## 2 · Efeito da interrupção externa

A sessão anterior morreu por **atualização de driver de vídeo no *host***, e o tablet foi
**bloqueado manualmente**. Os dois eventos ocorreram **antes** de `SF1` começar.

- **`SF1` permanece `NÃO INICIADA`.** Não há sessão parcial, não há evidência meio-colhida, não há
  `raw.log` aberto e não há lacre pendente.
- **Não há quebra de continuidade probatória.** Nenhum lacre da campanha depende de processo vivo
  no *host* ou de aparelho desperto. Os lacres de `35` §7 são arquivos em disco, já *hasheados*.
- **A ausência dos processos antigos (Metro, `PS3`, `logcat`) não é falha de evidência** — é a
  consequência esperada de um *host* reiniciado. A topologia operacional **não** foi restaurada
  nesta missão, conforme instruído.

---

## 3 · Estado das seis arbitragens

| Arbitragem | Onde | Estado ao fim desta missão |
|---|---|---|
| `ARB-JS-BINARIO` | `39:995` | **Metade técnica RESOLVIDA** (§4.1 abaixo) · metade documental **já respondida no corpus** |
| `ARB-28-ESCOPO` | `39:996` | **RESOLVIDA TECNICAMENTE** — e sobredeterminada (§4.2) |
| `ARB-TAR-REDE` | `39:991` | **HUMANA** — e o conjunto que ela cobre **aumentou** (§5.1) |
| `ARB-INJ-CAMINHO` | `39:992` | **HUMANA** — a "refutação por fato" da Saída B **não se sustenta** (§5.2) |
| `ARB-28-7-TIRO-UNICO` | `39:993` | **HUMANA**, mas com escopo drasticamente reduzido (§5.3) |
| `ARB-OBRA-NOVA` | `39:994` | **HUMANA na metade "é aceitável?"** · metade técnica **encerrada** (§5.4) |

> **Correção de contagem.** O corpus escreve *"cinco arbitragens bloqueadoras"* em `39:66`, `39:976`,
> `37:1077`, `38:504` e `38:512`. São **seis** — ver `ERRATA-07` ponto `E7-1`. Além destas, existem
> arbitragens **não bloqueadoras** já abertas no próprio `39` (`ARB-07-PRECEDENCIA`, `:1010`,
> classificada **Circular**; `ARB-HARNESS-README`, `:1036`, higiene documental) e **uma nova**
> nomeada nesta missão: **`ARB-ORDEM-R4R5`** (§5.5).

---

## 4 · O que ficou resolvido tecnicamente

### 4.1 `ARB-JS-BINARIO` — revisão JS exata da futura `SF1`

**O *delta* completo `521d59c`..`07f83c8` são 16 arquivos, +11 272 / −2.** Classificado
exaustivamente, sem amostragem:

| Classe | Arquivos | Medida |
|---|---|---|
| **JS de produto (grafo executável)** | **1** — `src/services/coloring60DrawingStorage.js` | **+46 / −2** |
| **Nativo ou configuração** | **0** — nenhum `app.json`, `app.config.*`, `package.json`, `babel.config.js`, `metro.config.js`, plugin ou diretório nativo | — |
| **Assets** | **0** | — |
| **Documentação** | **13** — artefatos `28`–`39` (novos), `08` (modificado), `docs/DECISIONS.md` (modificado) | — |
| **Testes / instrumentação** | **1** — `scripts/smoke.js` (+210 / −0). **Roda no *host*; não pertence ao grafo do app** | — |

**Portanto `ARB-JS-BINARIO` não é "HEAD contra `521d59c`" em geral. É exatamente um *commit*,
`2ffcd82`, e exatamente um comportamento:** se os quatro eixos lógicos atravessam ou não o ponteiro
do Colorir 60. Tudo o mais que distingue as duas revisões é documentação.

**Prova de qual base representa a superfície que `SF1` pretende validar — quatro razões, nenhuma
delas "porque é a atual":**

1. **O corpus já lavrou prova física sob o `HEAD`.** `36:120-121`: os `PASS` dos casos `6`, `7`, `8`,
   `11` (histórico **e** reexecução causal), `12` e `17` foram *"medidos sobre o binário atual e
   sobre o `HEAD` atual"*. Servir `521d59c` em `SF1` mediria um JS que o próprio corpus já declarou
   **não** ser o que produziu a prova vigente.
2. **`CASO 17` só existe sob o `HEAD`.** `35:45` lavra `CASO 17` — *"Eixos lógicos atravessando o
   ponteiro"* — como **`PASS`**. Esse enunciado é **irrealizável** sob `521d59c`, cuja *whitelist* de
   `writeSlot` (`:376-403`) não carrega campo lógico algum.
3. **Servir `521d59c` seria regressão medida, não conservadorismo.** Se o acervo do SM-X510 já
   contém ponteiro com os eixos (ver `E7-11`), o leitor de `521d59c` os **descarta** na
   reidratação — `SF1` observaria um defeito que o produto **não tem mais**.
4. **A "Consequência congelada" já recebeu sua errata, e ela preserva o que importa.**
   `ERRATA-C60-EIXOS-01` (`docs/DECISIONS.md:2797-2838`, 2026-08-15) declara a premissa de
   `:2789-2791` **falsa para o `HEAD`** e **verdadeira para `7de7085` e para o binário `521d59c`**;
   e em *"O que NÃO muda"* (`:2819-2822`) **preserva expressamente** a conclusão do Caso 14. A
   pergunta de `39:995` — *"A «Consequência congelada» recebe errata?"* — **já está respondida no
   corpus**, e `39` não registrou isso.

> **Recomendação (não é decisão):** servir `SF1` com o **`HEAD`**, gravando `CK-JS` = `07f83c8`.
>
> **Condição inseparável, e é o preço honesto desta escolha:** sob o `HEAD`, `INJ-04` e `INJ-05`
> ficam **inertes** sobre qualquer ponteiro C60 gravado por esse mesmo JS (`ERRATA-07` `E7-10`).
> Elas precisam ser **reclassificadas como `NÃO APLICÁVEL`** nessa condição — nunca executadas e
> lidas como `FAIL`. A cobertura de `E4` perde o par `INJ-04`/`INJ-05` e **isso deve ser declarado**,
> não absorvido em silêncio.

**Lacuna de governança descoberta:** **nenhuma porta `P3-x` exige resposta escrita a
`ARB-JS-BINARIO`** — e no entanto `P3-2` (`39:379`) manda conferir *"`CK-JS` gravado e igual ao
declarado"* contra um "declarado" que **nenhum gate obriga a declarar**. Falta uma porta
`P3-JS`: *"Base JS de `SF1` decidida por escrito (`ARB-JS-BINARIO`); `CK-JS` esperado registrado
antes de subir o Metro."*

### 4.2 `ARB-28-ESCOPO` — a resposta é **ONZE**, e é sobredeterminada

A pergunta de `39:996` é *"Quantos cenários §28 entram em `R5` — **um** (`#7`) ou **onze**
(`#1`–`#11`)?"*. Ela foi lavrada contra um conjunto de fontes incompleto (`ERRATA-07` `E7-6`).
Aberto o conjunto completo, **nenhuma fonte do corpus afirma "só `#7`"** — `37:297` e `38:25` apenas
**omitem**. Seis fontes independentes dizem o contrário:

| Fonte | O que diz |
|---|---|
| **`docs/DECISIONS.md:2288`** — `PF6SGA-ORDEM`, **ato do fundador, precedência máxima** | *"**`R5`** extras restantes + **cenários §28 de `SG-A`**"* — **plural**, e é a fonte de maior hierarquia do corpus inteiro |
| **`04:1047-1065`** — tabela do próprio PLAN, **fonte primária do eixo §28** | Coluna `Subportão`, que define **quais** são `SG-A`: **`#1` a `#11`** (o `#6` é `SG-A`/`SD-9`); `#12`–`#16` são `SG-B`/`SG-C`; `#17` é `SG-A`, `SG-B`, `SG-C` |
| `05:2822-2825` — **Emenda `A-12`** | *"o roteiro físico final é a **UNIÃO, nunca a substituição**. Os **17 cenários do PLAN §28 permanecem integralmente**"* |
| `05:2829-2839` | Espelho da tabela nas `TASKS`, com a mesma atribuição de *subportão* |
| `05:1267` | *"`TK-A-081` · … (§28 **#1–#11** + parcela `SG-A` do **#17**)"* |
| `07:12-18` | Auditoria que declara **`#1`–`#6` e `#8`–`#11` FALTANTES no `06`** — não excluídos |
| `07:282-299` | §4.1 enumera `#1`…`#17`; **só `#12`–`#16`** são excluídos da campanha |
| `06:285` · `10:37` | `R5` = *"cenários **§28 de `SG-A`**"* — **plural**; e `10:37` amarra o plural à `R5` |

**A circularidade de `ARB-07-PRECEDENCIA` (`39:1010`) é irrelevante para esta pergunta, porque os
dois chifres dão a mesma resposta:** por `07:31` (*"onde houver divergência de escopo, **vale este
`07`**"*) vale `07:282-297` = `#1`–`#11`; por `10:14-15` (*"Em qualquer divergência, **vale o
`06`**"*) vale `06:285` = plural. Não é preciso desempatar para responder.

**E há um caminho que dispensa até esse desempate.** `DECISIONS:2288` é **ato do fundador**, no topo
da precedência, e define `R5` como *"extras restantes + **cenários §28 de `SG-A`**"*. `04:1047-1065`
é a tabela do PLAN que diz **quais** cenários são `SG-A`. Compondo as duas — uma diz *"os de `SG-A`"*,
a outra diz *"estes são os de `SG-A`"* — a resposta sai por **substituição direta, sem interpretação
e sem hierarquia em disputa**.

> **Resposta: `R5` recebe os cenários §28 `#1`–`#11`, mais a parcela `SG-A` do `#17`.**
> `ARB-07-PRECEDENCIA` permanece **Circular** e **não** foi resolvida aqui — nem precisou ser.

**Consequência dura, e ela é nova.** Sob "onze", `§28 #9` — *"Ateliê: abrir obra `v:2` antiga,
girar, **salvar**, reabrir · Nenhuma perda; gravação *write-forward*"* (`04:1057`) — entra na `R5`.
E `#9` **também consome a única obra legada, e também a salva** — o enunciado dele **exige** que ela
ainda seja `v:2` antiga. Sob "só `#7`" há **um** consumidor consuntivo da obra legada; sob
"onze" há **dois**, disputando **uma** peça (`39:210`: obra única).

**Mas os dois enunciados são quase o mesmo ato, e isso é a saída.** Confrontados lado a lado:

| | Texto normativo | Abrir | Modificar | Salvar | Reabrir |
|---|---|---|---|---|---|
| `#7` | `TK-A-097`, `05:1013` — *"abrir uma obra salva **antes** da mudança, continuar pintando, **salvar**, reabrir"* | obra legada | continuar pintando | ✔ | ✔ |
| `#9` | `04:1057` — *"abrir obra `v:2` antiga, **girar**, **salvar**, reabrir"* | obra legada | girar | ✔ | ✔ |

Diferem **apenas no gesto de modificação**. Logo existe ordem causal que preserva ambos: **fundi-los
em uma única execução física** — abrir a obra legada, continuar pintando **e** girar, **salvar uma
só vez**, reabrir — satisfazendo os dois textos ao custo de **uma** consumação, não duas.

> **Ressalva honesta:** a fusão custa o isolamento de `#9`. Se a reabertura falhar, o gesto culpado
> (pintura ou rotação) fica indeterminado. A mitigação é observar e registrar **entre** os gestos,
> antes do salvamento único — o que `GH2a` (`39:606`, *"SEM SALVAR — reversível"*) já permite. A
> fusão deve ser **declarada por escrito**, nunca silenciosa.

---

## 5 · O que permanece humano — com recomendação explícita para cada

### 5.1 `ARB-TAR-REDE` — o conjunto coberto **aumentou**

`39 §6.7` lista **dois** itens sem rede. São **três**: `ERRATA-07` `E7-13` prova que o caminho
**"Pintar de novo" → "Pronto"** a partir do painel de `E5` **não tem rede de chave**, porque
`INJ-01` — a única injeção de `E5` que levanta painel — chama `fazerBackupArquivo` mas **nunca**
`fazerBackup(a.chave)` (`harnessInject.js:168` × `harnessStore.js:297`). A proibição de `39 §4.3`
continua correta; a justificativa (*"mesmo reversível"*) não.

**Pontos exatos de irreversibilidade, verificados em código:**

| Ação | Instante irreversível | Rede |
|---|---|---|
| `GH2b` (salvar sobre a obra legada) | `fileBlobStore.js:140` (`writeAsStringAsync`), alcançado por `atelierStorage.js:106` — **antes** de qualquer escrita em `AsyncStorage` | **Nenhuma.** `:127` declara a escrita *"idempotente: regrava o mesmo caminho determinístico"*; sem *double-buffer*, sem `protect`, sem *rollback* |
| Salvamento C60 (`GH3`, `#7`, painel de `E5`) | `coloring60DrawingStorage.js:625` (ponteiro) + `:657-659` (`deleteBlob(oldUri)`) | Rede **só** via injeção do harness; **ausente** no caminho do painel de `E5` |
| `E1` (conclusão) | `coloring60ActivityService.js:129-133` (`multiSet` de 3 chaves) + `:284` condicional | `done`/`snap` reversíveis pelo produto; `ever` e `finale_seen` **não** |

> **Recomendação (não é decisão):** manter a **proibição de restauração intacta**, e **corrigir a
> justificativa** — a proibição vale porque a restauração é juridicamente vedada (`32:131`), não
> porque o gesto seja reversível. E **acrescentar o caminho do painel de `E5` à lista de `§6.7`**
> antes de `SF1`, para que o operador saiba que ali não há volta.

### 5.2 `ARB-INJ-CAMINHO` — estratégia final de harness

**Retifico explicitamente uma conclusão anterior desta própria missão:** a Saída B **não** está
"refutada por fato".

- **O que é fato verificado:** uma escrita externa via `sqlite` consome `rowid` **fora** da
  contabilidade do app, tornando indecidível o autor de cada realocação e liquidando o
  discriminador de `13:246-248` — *"Um instrumento que só compara valores não prova ausência de
  mutação"*. `13:177` chama a forense de `rowid` de *"a prova mais forte deste acervo"*.
- **O que NÃO decorre:** o segundo fundamento alegado (`14:644`, *"Falha de `run-as` ou `TAR`
  truncado"* na lista de `STOP`) **pune a falha, não o uso** — e `run-as` **já é o canal canônico de
  captura de evidência da campanha inteira**. Pior: há **conflito de fontes** sobre o peso dessa
  falha — `14:644` a trata como `STOP`, enquanto `06:393` manda *"registrar a limitação"* e
  `10:569` diz literalmente *"**não pare**, mas **registre a limitação**"*. **Não escolho entre
  elas.**
- **A premissa de `L-3` virou.** `07:378-379` diz que *"um APK de dev é depurável — o que tornaria
  `L-1` e `L-2` resolvíveis por `adb`"*, mas registra **tablet Android indisponível**. Hoje ele
  existe. As quatro passagens que endossam a via `adb` (`07:378-379`, `:383`, `:682`, `:828`) foram
  todas escritas sob uma premissa **hoje falsa** — o que torna a Saída B *mais* disponível, não
  menos, e exige decisão em vez de descarte.

> **Recomendação (não é decisão): Saída A** — *worktree* novo no `HEAD`, cópia de `src/devharness/`,
> reaplicação do enxerto de 7 linhas em `App.js`, Metro na **8083** com tarja. Base mecânica
> verificada: lacre de `08` §4.7 **7/7 batendo**, enxerto **bit-exato** (`App.js` tem o mesmo *blob*
> `a4b12ea…` em `1ae353f`, `521d59c` e `07f83c8`), dependências presentes, **8081/8082/8083 livres**.
>
> **Três condições, e a terceira é nova:**
> 1. `06:453` — criar *worktree* é **alteração de repositório** e exige **autorização explícita**.
> 2. Reauditar o catálogo `INJ-*` contra o `HEAD` (`39:494`) — **usando o mapa de deslocamento real,
>    que NÃO é uniforme**: `writeSlot` `:376`→`:414` (**+38**); `resolvePointer60` `:429`→`:469`
>    (**+40**); `saveColoring60DrawingState` `:509`→`:553` (**+44**); `collectColoring60Orphans`
>    `:770`→`:814` (**+44**). O arquivo passou de **847** para **891** linhas (**+44** líquido, não
>    "+46"). Aplicar um deslocamento uniforme **erra todas as quatro citações do catálogo**.
> 3. Reclassificar `INJ-04`/`INJ-05` conforme `E7-10`/`E7-12` **antes** de executá-las.
>
> **A Saída B permanece disponível e é uma troca real** — cobertura física de `E4`/`E5` e dos
> painéis **contra** valor probatório futuro do `rowid`. Essa troca é do fundador, não minha.

### 5.3 `ARB-28-7-TIRO-UNICO` — a cadeia de provas exigida, cumprida

Conforme instruído, **não** pergunto simplesmente se o fundador autoriza destruir a obra.

1. **Quem ainda depende dela.** `CASO 14 v2` e `CASO 15` (Bloco 1, **leitura**), a metade
   "formato antigo" de `E6` (`GH1`, **leitura pura**), `§28 #7`/`GH2b` (**salva**, `05:1013`) e —
   **novo, sob `ARB-28-ESCOPO = onze`** — `§28 #9`, que **também salva** (`04:1057`).
2. **O salvamento de `GH2b` elimina esses insumos?** Sim para os de leitura: `39:620-621` —
   *"O *write-forward* grava os quatro eixos e **a obra deixa de ser legada para sempre**. Morrem
   junto os insumos dos casos `14 v2`, `15` e a metade 'formato antigo' de `E6`"*.
3. **Essas provas podem ser executadas antes?** **Sim — e já estão desenhadas assim.**
4. **Existe ordem causal que preserve todas?** **Sim, e é quase a ordem que já está escrita**, o que
   significa que a regra "não consumir estado insubstituível antes do último consumidor" **já está
   satisfeita pelo protocolo**: `38:268` (`TAR-SF1-BASE → CASO 1 → CASO 15 → CASO 14 v2 → CASO 16 →
   CASO 10 → TAR-SF1-FIM`), depois `39:584` (`GH1` — *"LEITURA PURA, **PRIMEIRO DE TODOS**"*),
   depois `39:912` (`E6 → §28 #7 → TA-5R+E1 → painel Ateliê → E5 → E4`). **A única inserção
   necessária é a fusão `#7` × `#9`** demonstrada em §4.2 — que reduz de dois para **um** o número
   de salvamentos consuntivos sobre a peça única.
5. **Algum *backup* autorizado restauraria o estado sem invalidar a prova?** **Os bytes existem;
   a autorização, não.** A obra sobrevive **fora do aparelho**, lacrada e *hasheada*: `13:147`
   (`…_preview.jpg`, `89 593 B`) e `13:148` (`…_thumb.jpg`, `14 730 B`), extraídos dos `TAR`
   (`13:142`), com o `stateJson` dentro do `RKStorage` do mesmo contêiner; e `39:579` **manda**
   capturar `TAR-R5-ANTES` com `Get-FileHash` + `tar -tf` antes de prosseguir. Mas restaurar
   **como conserto** permanece *"terminantemente proibido"* (`32:131`), e a janela que poderia
   autorizá-lo está morta: `D-FUND-R2P1-CLOSURE-01` item 7 proíbe `RETRY_04` *"sem exceção"* e o
   item 5 fixa `F6_CLOSURE_BLOCKER = NÃO`.

> **Resta escolha consuntiva inevitável — e é esta, precisamente delimitada:**
>
> 🚦 **HUMAN DECISION.** Não é *"autorizo destruir a obra do fundador?"*. É:
> **"autorizo gastar o último estado legado do aparelho, depois que todos os seus consumidores de
> leitura já foram servidos, sabendo que os bytes permanecem lacrados na evidência e que devolvê-los
> ao aparelho é ato hoje proibido?"**
>
> **Recomendação (não é decisão): SIM, condicionada a três coisas** — (i) `GH1`, `CASO 15` e
> `CASO 14 v2` **encerrados e lacrados** antes; (ii) `TAR-R5-ANTES` capturado, *hasheado* e
> conferido (`39:579`); (iii) **`#7` e `#9` fundidos por escrito num único salvamento** (§4.2),
> porque sob `ARB-28-ESCOPO = onze` os dois disputam a mesma peça única e a fusão é o que impede
> que ela seja consumida duas vezes.

### 5.4 `ARB-OBRA-NOVA` — metade técnica encerrada

**Impacto exato de `GH3`/`E1`, verificado em código:** `markColoring60ActivityDone`
(`coloring60ActivityService.js:124-138`) grava **sempre três** chaves — `done`, `snap`, `ever` — e
**condicionalmente uma quarta**, `@ptf_coloring60_finale_seen_creation`, disparada por
`markColoring60FinaleSeen` (`:281-289`) a partir de `ColoringScreen.js:1044-1052`, **somente quando
o salvamento fecha a história em 3/3 pela primeira vez**.

**Existe desfazimento cirúrgico, e ele é alcançável pelo produto** — `ColoringScreen.js:1418`
(*"Limpar desenho"*) → `:1222-1223` → `clearColoring60Done` + `clearColoring60SavedDrawing`,
removendo `done` **e** `snap` (`:167-170`). Isso **refuta `39:660-661`**, que afirmava não haver
desfazimento cirúrgico (`ERRATA-07` `E7-3`). Sobrevivem: `ever`, por desenho deliberado
(`ColoringScreen.js:1201-1202`), e `finale_seen`, que **só o reset canônico devolve** (`:1043`).

**O achado decisivo para esta arbitragem — a segunda obra nova custa categoricamente mais que a
primeira.** `src/data/coloring60Catalog.js:22-24` fixa que `creation` tem **exatamente três**
atividades — `light`, `living_world`, `people_and_care` — e `:63` que **só `creation`** tem
atividades no piloto. `light` está concluída (`39:208`, `rev:22`); os dois *slots* vazios
(`39:221-222`) são as outras duas. Portanto:

- **Pintar o primeiro** *slot* → 2/3. Sem `finale_seen`. Reversível em `done`+`snap`.
- **Pintar o segundo** → 3/3 inédito → `finale_seen` gravado, **sem desfazimento cirúrgico algum**.

*(Nota operacional: `coloring60StoryMilestones.js:45-46` condiciona `living_world` à cena 7 e
`people_and_care` à cena 9 — a disponibilidade dos *slots* depende do progresso de cenas e deve ser
conferida no Bloco 0.)*

**Sobre o `STOP #15` da `R2`:** `39:386` (`P3-9`) registra que a obra nova *"torna o acervo não
conforme a `14` §11 `#15`"*. Isso condiciona a **reobservação corrente**? **Não a invalida** — mas
torna o acervo permanentemente não conforme àquele `STOP`, e essa não conformidade **não tem volta
autorizada**, porque o único caminho de volta é o reset canônico do catálogo
(`coloring60ResetService.js:139`).

**A criação pode ser adiada?** **Sim.** Nenhum insumo de `GH1`, `CASO 15`, `CASO 14 v2` ou `E6`
depende de obra nova. `TA-5R` e `E1` são os únicos itens que a exigem, e `P3-9` já prevê o desfecho
`NÃO EXECUTADO` para ambos se a decisão for negativa.

> **Recomendação (não é decisão): autorizar UMA obra nova, no *slot* `living_world`, e apenas uma.**
> Ela entrega `TA-5R` e `E1` ao custo de um `ever` irreversível e de um *slot* escasso. **A segunda
> obra não deve ser autorizada nesta sessão**, porque acrescentaria `finale_seen` — estado que só o
> reset canônico devolve, e o reset canônico está fora do caminho crítico da Fase 6 por decisão do
> próprio fundador.

### 5.5 `ARB-ORDEM-R4R5` — arbitragem **nova**, necessária antes de `SF2` (não antes de `SF1`)

Três fatos, todos verificados, em tensão:

- A ordem **`R4` antes de `R5`** está **congelada por ato do fundador** — `docs/DECISIONS.md:2279`
  (`PF6SGA-ORDEM`), dentro de `PF6SGA-GATE` (`:2240`), cujas decisões são declaradas *"tomadas na
  preparação da campanha física final de `F6-SG-A`, **antes** de qualquer execução"* (`:2242-2243`);
  `:2287-2288` traz `R4` = caso 13 isolado, `R5` = extras + cenários §28. `06:277`: *"**A ordem é
  congelada** e não é uma sugestão."* E `36:331-332` ainda preserva `S4` = `R4` antes de `S5` = `R5`.
- `07:655-656` esvazia `R4`-antes-de-`R5`: *"Executar somente depois de `G5` e `G6`. O caso exige
  acervo com obras **nos dois formatos** … Executá-lo antes o esvazia."* E o efeito de esvaziá-lo
  **não** é "`PASS` trivial": o passo 6 de `07:661` fica inexecutável, o caso cai em
  **`NÃO EXECUTADO`**, e por `06:464-465` **continua bloqueando `F6-SG-A`**.
- `37:283-286` e `39:363-372` **já inverteram** para `SF1`(`R5`) → `SF2`(`R4`), e `39:367` declara
  *"Resolvido por leitura, não por arbitragem"* — **afirmação de agente**. Medido: **`SF2` tem
  `0` ocorrências em `docs/DECISIONS.md`**; o termo só existe em `37` e `39`.

> **Isto bloqueia `SF1`?** **Retifico outra conclusão anterior desta missão: a resposta não é um
> "não" limpo.** As treze portas de entrada de `SF1` (`39:378-390`) realmente **não** pedem o
> *worktree* `a190b3e` nem a porta 8082 — e `38:166` faz de "Metro em 8082" um **`PARE`** de `SF1`.
> Mas o objeto em disputa **não é o Metro; é o estado "acervo misto"** (`06:449`), e esse estado
> **tem consumidor dentro de `SF1`**: `E6`/`TK-A-105` (`06:434`) está em `R5` (`06:285`), e `39:584`
> abre o Bloco 3 justamente com *"`GH1` — `E6`, acervo misto · **LEITURA PURA, PRIMEIRO DE TODOS**"*.
>
> **Recomendação (não é decisão):** `ARB-ORDEM-R4R5` **não precisa ser arbitrada para `SF1`
> começar**, mas **precisa ser arbitrada antes de `SF2`**, e a inversão **não deve ser tratada como
> resolvida** — `39:367` não tem lastro. Registrar a decisão como ato do fundador, ou reverter à
> ordem congelada.

---

## 6 · DAG do acervo insubstituível · último consumidor · ordem causal segura

### 6.1 Estados insubstituíveis e seus consumidores

| Estado | Consumidores futuros (em ordem) | **Último consumidor não destrutivo** | Primeiro ponto seguro para consumir |
|---|---|---|---|
| **Obra legada do Ateliê** `art_1786479103982_6079` (`39:210`; quatro eixos **ausentes**) | `CASO 15` · `CASO 14 v2` (Bloco 1, leitura) → `E6` metade antiga (`GH1`, leitura pura) → `GH2a` (abrir e pintar **sem salvar**, `39:606`) → **`§28 #7` ∪ `#9` — salvamento único** | **`GH2a`** (`39:606`) — e antes dele **`GH1`** (`39:584`) é o último consumidor de *outro* artefato | Só depois de `GH1` **e** `GH2a`, e só uma vez |
| **Ponteiro C60** `screation_alight` + *blob* `.a.png` (`39:208-209`) | `E6` · `INJ-*` sobre C60 · `§28 #3/#4/#5` | `E6`/`GH1` | Após `GH1`; injeções têm rede, **exceto** o painel de `E5` (`E7-13`) |
| ***Slot* `living_world`** (vazio) | `TA-5R` · `E1` · `GH3` | — (estado de ausência) | Consumível; custo = 1 `ever` |
| ***Slot* `people_and_care`** (vazio) | idem | — | **Consumi-lo fecha 3/3 e grava `finale_seen`** — sem volta cirúrgica |
| **Ausência de `.b.png`** (`13:167`) | `P3-4` (`39:381`) | `P3-4` / `INS-01` | Após `INS-01` registrado |
| **Contabilidade de `rowid`** (`13:177`, *"a prova mais forte deste acervo"*) | Toda perícia futura do acervo | — | **Destruída pela Saída B**; preservada por A e C |

### 6.2 Ordem causal segura — **já é a ordem desenhada**

```
Bloco 0   TAR-R5-ANTES + hash + tar -tf  ·  INS-01 (inventário ANTES)   [leitura]
Bloco 1   TAR-SF1-BASE → CASO 1 → CASO 15 → CASO 14 v2 → CASO 16
          → CASO 10 → TAR-SF1-FIM → comparação                (38:268)  [leitura]
Bloco 3   GH1 — E6, acervo misto · LEITURA PURA, PRIMEIRO DE TODOS      (39:584)
          → §28 #1, #2, #10, #11        [rotação/áudio/jogo — sem salvar]
          → §28 #3, #4, #5              [Colorir — salvam]
          → §28 #8                      [Ateliê — desenhar/carimbar/girar; obra NOVA]
          → GH2a — abrir a obra legada, pintar E girar, SEM SALVAR       (39:606)
                   [último consumidor não destrutivo; se houver dúvida, PARAR AQUI — 39:616]
          → §28 #7 ∪ #9 — SALVAMENTO ÚNICO  ← PONTO DE NÃO RETORNO da obra legada
          → TA-5R + E1  → painel Ateliê → E5 → E4             (39:912)
```

**A regra do mandato — "não consumir estado insubstituível antes do último consumidor" — já está
satisfeita pelo protocolo como escrito.** As duas inserções que esta missão acrescenta são: (a) os
cenários §28 puramente observacionais **antes** dos que salvam; (b) a **fusão `#7` ∪ `#9` num
salvamento único**, sem a qual `ARB-28-ESCOPO = onze` faria a peça única ser consumida **duas vezes**.

**Nota sobre `#8` e a obra nova.** `§28 #8` (*"Ateliê: desenhar, carimbar, girar"*, `04:1056`) pede
composição nova, **não** a obra legada — logo não compete por ela e pode rodar antes com segurança.
Já `TA-5R`/`E1` (Colorir) consomem *slot* C60, assunto de `ARB-OBRA-NOVA`, não desta cadeia.

---

## 7 · Impacto do tablet bloqueado

O aparelho está **bloqueado e `HANDS OFF`**. Isso **não** é quebra de continuidade probatória:
`SF1` nunca começou, nenhum lacre depende de tela acesa, e o último estado medido do acervo está
selado em `35` §7.1. **Nenhuma tentativa foi feita de reproduzir o estado anterior**, conforme
instruído.

**Mas há uma consequência dura, e ela é o achado mais importante desta missão para o Bloco 0:**
`39 §4.1` — titulada *"perícia, não estimativa"* — descreve o acervo pelo lacre `TAR-POST03.tar`
(**17 033 728 B**, 2026-08-11), e **pelo menos quatro lacres posteriores o superaram**: a cadeia de
`35:169-186` abre em **17 234 944 B** e fecha em **17 424 384 B** (**+390 656 B**), em
**2026-08-14**, **depois** de `2ffcd82` (2026-08-14 16:53:20). No mesmo dia, `35:44` lavrou
`CASO 11 (reexecução causal)` — *"obra modificada e **salva** no formato novo"* — como `PASS`
*"após a correção do esquema"*, e `36:120-121` declarou esses `PASS` *"medidos sobre o binário atual
e sobre o `HEAD` atual"*.

⇒ **Houve escrita no acervo depois do lacre que `§4.1` descreve, e parte dela sob o JS que grava os
eixos lógicos.** Isso não prova que a contagem de **arquivos** mudou, mas prova que `rev:22` e a
ausência dos eixos **não podem ser presumidos correntes**. E `P3-4` (`39:381`) e o passo 10 do
Bloco 0 (`39:582`) mandam conferir `INS-01` **contra `§4.1`**, com desfecho **"pare"** — de modo que,
na forma escrita, **disparariam `pare` contra um acervo legítimo**. Ver `ERRATA-07` `E7-11` e `E7-12`.

**Nada disso é mensurável do *host*.** A verificação é o primeiro ato de `SF1`, e exige o aparelho —
o que esta missão não faz.

---

## 8 · Errata produzida

**`ERRATA-07`**, apensa ao fim do artefato `39` (aditiva; nada acima foi reescrito), com **14
pontos**: `E7-1` (contagem 6 × 5, sete sítios) · `E7-2` (mecanismo destrutivo errado em `:530-531`) ·
`E7-3` (`:660-661` contraditado por código vivo) · `E7-4` (autocontradição em `:517`) · `E7-5` (seis
intervalos deslocados em §6.3) · `E7-6` (`ARB-28-ESCOPO` lavrada sobre fontes incompletas) · `E7-7`
(85 × **86** *commits*) · `E7-8` (`P3-10` proibido **e** desnecessário) · `E7-9` (três origens do
acervo misto, não uma) · `E7-10` (`INJ-04`/`INJ-05` inertes sob JS do `HEAD`, **condicional ao
ponteiro eleito**) · `E7-11` (`§4.1` superada por quatro lacres) · `E7-12` (`INS-01` não registra o
bit que decide `INJ-04`/`INJ-05`) · `E7-13` (terceiro caminho sem rede) · `E7-14` (`X-01` nomeia um
consumidor consuntivo da obra legada; sob `ARB-28-ESCOPO = onze` são **dois**).

**Erratas devidas por outros artefatos** — medidas nesta missão, **não** lavradas por ela (cabem ao
artefato dono): `36:97-99` (numstat) · `37:9-10` × `37:244,297` (dez cenários §28 suprimidos sem a
errata que o próprio `37` se impõe) · `23:43-44` (vencida quanto à árvore de origem; **não** quanto
ao conteúdo do APK, que segue `APK_BINARY_MANIFEST_NOT_DECODED_WITH_AVAILABLE_TOOL`) · `08:181`
(prova 5 declara *"A em `1ae353f`"*; `A` está em `07f83c8`).

---

## 9 · Rotação — nada foi executado

O achado de `withAndroidTabletOrientation` / `sw600dp` / **BUILD NATIVE 01** está **preservado e
intocado**, e o desenho dos ramos **`R-A`** e **`R-B`** permanece como está. **Nenhum teste físico
foi executado.** Registro apenas a disciplina de precisão que a verificação adversarial impôs: está
provado que a **árvore de origem** do binário contém a configuração (`e2702d2` **é** ancestral de
`521d59c`, verificado por `git merge-base --is-ancestor`), e **não** está provado que o **APK
empacotado** a contenha — essa medição nunca foi feita (`28:328-337`).

---

## 10 · Estado final

| Item | Estado |
|---|---|
| `SF1` | **NÃO INICIADA** — e não foi iniciada por esta missão |
| Tablet | **`HANDS OFF`**, bloqueado, **não tocado** |
| `adb` | **nenhum comando emitido** |
| Metro | **não iniciado** |
| *Build* | **não gerado** |
| *Worktree* novo | **não criado** |
| Código funcional | **não alterado** |
| `npm run verify:runtime` | **não disparado** — a missão é documentação pura; nenhum arquivo do grafo executável foi tocado |
| Arbitragens bloqueadoras | de **6** para **4** humanas (`ARB-TAR-REDE`, `ARB-INJ-CAMINHO`, `ARB-28-7-TIRO-UNICO`, `ARB-OBRA-NOVA`) + **1 nova** não bloqueante de `SF1` (`ARB-ORDEM-R4R5`) |

> ⛔ **Esta missão não concede portão.** Não declara `PASS`, não decide arbitragem, não autoriza
> escrita e não atribui ao fundador decisão que ele não tenha tomado. O que ela entrega é o
> **`HUMAN GATE` verdadeiro**: quatro decisões humanas, cada uma reduzida ao menor enunciado
> possível, com recomendação explícita e fundamento verificado.

---

## `ERRATA-08` — o sentido do "acervo misto" está invertido no corpus, e isso muda duas recomendações deste próprio artefato (aditiva; nada acima foi reescrito)

> **Origem.** Verificação tardia do roteiro `07` §`G5`–`G7`, integralmente. **Nada acima foi
> apagado ou reescrito** — os pontos abaixo corrigem, datados, o que ficou errado, inclusive erros
> **meus**, escritos nas seções `5.3`, `5.5` e `6.2` deste artefato.

### `E8-1` — `GH2b` **não cria** o acervo misto: ele o **encerra**

`39:371-372` afirma: *"No SM-X510 o 'misto' dependeria do salvamento de §28 `#7` (`GH2b`) … **Se
`GH2b` não for autorizado, `SF2` fica sem pré-condição**"*. **O sentido está invertido**, e a prova
é a definição operacional do misto, não uma interpretação:

- `07:621` passo 5 define `E6` como *"abrir a **galeria** com o acervo misto; conferir miniaturas;
  **abrir uma de cada formato**"*. Misto ⇒ **um de cada** ⇒ o formato antigo tem de **sobreviver**.
- `13:321` mede o acervo: **`len(index) == 1`**. Existe **uma única** obra do Ateliê.
- `GH2b` promove essa única obra (`39:620`: *"deixa de ser legada **para sempre**"*). Depois dela,
  o acervo tem **zero** obras do formato antigo — **o misto deixa de existir**.

**Quem cria o misto é a obra NOVA**, não o salvamento da antiga. Enumerando as quatro combinações:

| `ARB-OBRA-NOVA` | `ARB-28-7-TIRO-UNICO` | Antigas | Novas | Misto? |
|---|---|---|---|---|
| SIM | **NÃO** | 1 | 1 | ✅ **é a única combinação que produz misto** |
| SIM | SIM | 0 | 2 | ❌ |
| NÃO | SIM | 0 | 1 | ❌ |
| NÃO | NÃO | 1 | 0 | ❌ |

> **Retifico o que escrevi.** `ERRATA-07` `E7-9` diz que a pré-condição de `SF2` *"só desaparece se
> **ambas** forem negadas"*. **Errado, e errado no mesmo sentido que `39:372`.** Ela desaparece em
> **três** das quatro combinações, e sobrevive **exatamente** naquela em que `GH2b` é **negado**.

### `E8-2` — `CASO 13` exige obra do formato antigo **sobrevivente**, e `SF1` a consumiria

`07:661` passo 5, verbatim: **"Abrir uma obra do *formato antigo*"** — e o passo 6, *"Abrir uma obra
do **formato novo** (salva em `G5`)"*. `CASO 13` precisa dos **dois**. Como `06:464-465` lavra que,
não executado, *"o caso 13 fica **NÃO EXECUTADO** — e continua **bloqueando** `F6-SG-A`, porque é um
dos 17 obrigatórios"*, **consumir a obra legada em `SF1` bloqueia o portão em `SF2`**.

**A raiz é que `07` pressupõe estoque plural de obras antigas.** Quatro passos exigem uma obra
antiga **depois** de outro passo já ter salvado sobre uma: `G5` passo 1 (`Caso 11` — *"abrir obra
antiga, pintar, **salvar**"*, `07:605`), `G6` passo 3 (`§28 #9`, `07:621`), `G6` passo 5 (`E6` —
*"uma de cada formato"*) e `G7` passo 5 (`CASO 13`). Isso é coerente num iPad com galeria povoada —
e `07:600`, `:616` e `:653` dizem literalmente **"Aparelho: iPad"**. **No SM-X510 há uma só obra**
(`13:321`), e o roteiro deixa de fechar.

### `E8-3` — existe ordem que preserva TUDO, logo a escolha consuntiva **não é inevitável**

O §11 do mandato manda provar isto antes de devolver `HUMAN DECISION`. **A prova fecha:**

```
SF1  Bloco 0/1        leitura pura                          [obra antiga intacta]
SF1  Bloco 3  §28 #8 e/ou E1/GH3  → cria obra NOVA          [1 antiga + 1 nova = MISTO ✅]
SF1  Bloco 3  E6 / GH1            → "uma de cada formato"   [consome o misto, sem gastá-lo]
SF1  Bloco 3  #7→GH2a e #9→girar  → observar SEM SALVAR     [39:606, reversível]
SF2  CASO 13                      → passo 5 antiga + 6 nova [MISTO ainda existe ✅]
DEPOIS de CASO 13   →  salvamento único de #7 ∪ #9          ← ponto de não retorno, por último
```

**Nenhum insumo morre antes do seu último consumidor.** O salvamento sobre a obra legada deixa de
ser um dilema e passa a ser um **item de ordenação**: ele é o **último ato consuntivo da campanha
inteira**, não um passo no meio de `SF1`.

### `E8-4` — as recomendações que mudam

| Seção | O que eu recomendei | O que passa a valer |
|---|---|---|
| `5.3` `ARB-28-7-TIRO-UNICO` | *"**SIM**, condicionada a três coisas"* | **NÃO salvar durante `SF1`.** `#7` para em `GH2a` — desfecho que `P3-8` (`39:385`) **já prevê** — e `#9` para antes do salvamento. A decisão humana encolhe para: **"autorizo mover as metades de salvamento de `#7` e `#9` para depois do `CASO 13`?"** |
| `5.4` `ARB-OBRA-NOVA` | *"**UMA** obra, em `living_world`"* | **Mantida, e agora é NECESSÁRIA, não apenas aceitável** — sem obra nova não há misto, e sem misto morrem `E6` (`07:621` passo 5) **e** `CASO 13` (`07:661` passo 6) |
| `5.5` `ARB-ORDEM-R4R5` | *"não bloqueia `SF1`; precede `SF2`"* | **Precisa estar resolvida antes do BLOCO 3 de `SF1`**, não antes de `SF2`. `SF1` pode **abrir** (Blocos 0 e 1 são leitura pura), mas o Bloco 3 contém o passo que consome o insumo de `R4` |
| `4.2` / `6.2` fusão `#7` ∪ `#9` | fundir num salvamento único | **Mantida e reforçada** — a fusão continua certa; o que muda é **quando**: depois do `CASO 13`, não dentro de `SF1` |

**A ordem congelada pelo fundador estava causalmente certa.** `DECISIONS:2287-2288` põe `R4` (caso 13)
**antes** de `R5`. A inversão para `SF1`(`R5`) → `SF2`(`R4`), declarada em `39:367` como
*"**Resolvido por leitura, não por arbitragem**"*, repousa sobre a premissa invertida de `E8-1`.
**`ARB-ORDEM-R4R5` não é higiene documental: é a arbitragem que decide se `CASO 13` sobrevive.**

### `E8-5` — `CASO 11` recebeu dois `PASS` sem que a obra seja identificada

`35:43-44` lavra `CASO 11` (histórico **e** reexecução causal) como **`PASS`**, descrito como
*"Obra modificada e **salva no formato novo**"*. **O artefato não nomeia a obra** — buscas por
`1786479103982`, `atelier_arts`, `screation_alight` e `drawing60` em `35` retornam **zero
ocorrências**. Somado a `E7-11` (o `TAR` cresceu **+390 656 B** entre o lacre de `39 §4.1` e o
fecho da `R2`), a consequência é dura e **não é mensurável do *host***:

> **Não está estabelecido que a obra legada ainda seja legada.** Um `PASS` de *"obra modificada e
> salva no formato novo"* é exatamente o gesto que a promoveria.

Isso **não** invalida nada retroativamente — e reforça `E7-12`: `INS-01` precisa registrar **dois**
bits que hoje não registra — se o ponteiro C60 traz `logicalW`/`logicalH`, **e** se a obra do Ateliê
ainda está sem `paintSchemaVersion`. **Sem esses dois bits, `ARB-28-7-TIRO-UNICO` e `ARB-OBRA-NOVA`
podem estar discutindo um estado que já não existe.**

### O que esta errata NÃO faz

Não converte `☐` em `PASS`, não decide arbitragem, não autoriza escrita, *build*, Metro, `adb` nem
toque no aparelho, e não atribui decisão ao fundador. O tablet permanece **`HANDS OFF`**.

> **Nota de método.** Estes pontos nasceram de um *workflow* de verificação em segundo plano. Ele
> apontou consumidores não contabilizados — e **errou o sentido**, afirmando que `GH2b` *criaria* o
> insumo de `E6`. `07:621` passo 5 (*"abrir uma de cada formato"*) refuta isso. **O achado
> aproveitado foi o rastro, não a conclusão.**
