# `37` — Reconciliação pós-`R2` e preparo do `HUMAN GATE` físico de `F6-SG-A`

> **Natureza deste documento.** Trabalho **somente-leitura** sobre o corpo canônico da Fase 6, mais
> **medição host-side** do acervo de evidências. **Nenhum portão é concedido. Nenhum `PASS` é
> declarado. Nenhuma linha de código foi criada, editada ou removida. O tablet não foi tocado.**
> Toda afirmação traz `arquivo:linha` ou o comando que a produziu. Onde não há prova, está escrito
> **NÃO PROVADO** — nunca uma afirmação mais forte.
>
> Este artefato é **aditivo**. Não apaga, não reescreve e não reordena nada do corpo histórico. Onde
> corrige, corrige por **errata datada com referência cruzada** — jamais por substituição silenciosa.
>
> **Data de produção:** `2026-08-14`.

---

## 1 · BASELINE VERIFICADA

`§1` da missão exige verificar, nunca presumir. Verificado:

| Item | Esperado | Medido | Veredito |
|---|---|---|---|
| Worktree | `C:\tmp\ptf_fase6_shell_splash_wt` | idem | ✅ |
| Branch | `feat/fase6-shell-splash` | idem (`git rev-parse --abbrev-ref HEAD`) | ✅ |
| `HEAD` | `e17b115` | `e17b11593fa14f6cf4211f8389af1f792f89400d` | ✅ |
| `git status --porcelain` | vazio | **vazio** | ✅ |

**`STOP_BASELINE_DIVERGENTE` NÃO acionado.** Nenhum `checkout`, `reset`, `stash`, `cherry-pick`,
`rebase`, `amend` ou reescrita de histórico foi executado — nem foi necessário.

> **Estado no fim desta missão:** a árvore deixa de estar limpa **apenas** pelos dois arquivos
> documentais desta entrega (`§16`). Nenhum arquivo de código foi tocado.

---

## 2 · ESTADO DA `R2`

### 2.1 O que a `R2` prospectiva fechou

`35_R2_PROSPECTIVA_BE_FECHAMENTO.md:4` e `docs/DECISIONS.md:4170-4171`:

> `R2_PROSPECTIVE_BE = PASS`

Casos `6`, `7`, `8`, `11`, `12`, `17` — Blocos `B`–`E` — provados **sobre o binário e o `HEAD`
atuais**. Campanha **encerrada**. `CASO 9` terminal por decisão (`NÃO REPRODUZIDO` / `NÃO BLOQUEIA`,
`35:134-143`). `CASO 12` congelado em `CASO12-PARCIAL-01` — os quatro estágios injetados permanecem
`NÃO EXECUTADOS` e **é proibido ampliar o alcance** (`35:71-73`).

**Nada nesta missão reabre a `R2`.** Não houve retorno a `reset`, não houve retorno a `R2P1`, não se
iniciou nova tentativa de `R2P1`, não se reconstruiu campanha histórica, não se reabriu `CASO`
congelado.

### 2.2 Conferência independente do lacre (`§3` da missão)

| Propriedade | Valor esperado | Valor medido | Veredito |
|---|---|---|---|
| Caminho | `C:\tmp\ptf_evidencias\R2_PROSPECTIVE_BE_01\logcat\raw_campaign.log` | idem | ✅ |
| Tamanho | `66 308 703` bytes | `66 308 703` | ✅ |
| `LastWriteTime` | `2026-08-14 20:49:43.411` | idem | ✅ |
| `SHA256` | `CCA75FB345E3176A56A6669D53BE46F545549E917BEFD4D82009B3C8847D81E2` | idem | ✅ |
| *Handle* de escrita | liberado | **LIVRE** | ✅ |

**`STOP_R2_SEAL_DIVERGENCE` NÃO acionado.** Nenhum arquivo de evidência foi reparado, recapturado,
reexecutado ou editado.

> ⚠️ **Nota de método — divergência aparente resolvida sem STOP.** A primeira medição apontou para
> `C:\tmp\ptf_evidencias\R2`, que devolveu `19` arquivos / `58 527 598` bytes e **nenhum**
> `raw_campaign.log`. Isso **pareceria** um `STOP_R2_SEAL_DIVERGENCE`. Não é: `C:\tmp\ptf_evidencias\R2`
> é a `R2` **histórica** de `2026-08-11`; a raiz da campanha prospectiva é
> `C:\tmp\ptf_evidencias\R2_PROSPECTIVE_BE_01`. Localizada pelo comando
> `Get-ChildItem C:\tmp -Recurse -Filter raw_campaign.log`. Remedida, **confere exatamente**.
> Registro aqui porque a próxima auditoria encontrará a mesma armadilha.

---

## 3 · INVENTÁRIO RECURSIVO DE EVIDÊNCIAS (`§10`–`§11`)

Varredura **recursiva a partir da raiz**, não por enumeração de subdiretórios conhecidos.

### 3.1 Contagem global

| Métrica | Valor |
|---|---|
| Arquivos (recursivo) | **350** |
| Bytes (recursivo) | **694 141 406** |
| Subdiretórios de primeiro nível | **6** |
| Diretórios (recursivo, todos os níveis) | **159** |
| Arquivos soltos na raiz | **0** |

**Confere com a expectativa da missão (`350` / `694 141 406` / `6`).** Nenhuma evidência foi editada
para fazer a contagem coincidir. Nenhum processo foi encerrado para alterar o resultado.

### 3.2 Distribuição por subdiretório

| Subdiretório | Arquivos |
|---|---|
| `acervo` | 18 |
| `extract` | 238 |
| `logcat` | 4 |
| `out` | 66 |
| `preflight` | 12 |
| `tools` | 12 |

### 3.3 *Handles* abertos

| Estado | Arquivos |
|---|---|
| Livres | **349** |
| Bloqueados | **1** — `preflight/PS1_METRO.log` |

O bloqueio é o **esperado e documentado**: o `cmd.exe` PID `20352` (lançador) mantém o *handle* de
escrita do log do Metro. **O Metro foi preservado vivo de propósito** — matá-lo apenas para fechar
`350/350` seria destruir estado sem causa, expressamente vedado por `§11`.

### 3.4 Arquivos vazios · duplicados · inesperados

| Categoria | Resultado |
|---|---|
| Arquivos de `0` byte | **17**, todos `RKStorage-journal` — *journals* SQLite legitimamente vazios (banco fechado limpo) |
| Grupos `SHA256` duplicados | **32**, todos semanticamente esperados: *snapshots* idênticos do acervo em *checkpoints* onde nada mudou, e arquivos `CMP_*.txt` de "sem diferença" |
| Arquivos inesperados | **nenhum** |

### 3.5 Processos e portas no instante da medição

| Processo | PID | Papel |
|---|---|---|
| `adb` | 5576 | *fork-server* |
| `cmd.exe` | 20352 | lançador do `PS1` — detém o *handle* de `PS1_METRO.log` |
| `node.exe` | **4372** | **o Metro real**, em `LISTEN` na `8081` |

Portas `8082` e `8083`: **livres**.

Dispositivo (consulta de estado, sem gesto):
`RX2XC003LTJ  device product:gts9fewifixx model:SM_X510 transport_id:2`

`adb reverse --list` → `UsbFfs tcp:8081 tcp:8081` — **exatamente um** mapeamento relevante. Satisfaz
o aceite de `06:238-240`, que admite o prefixo de transporte.

---

## 4 · AUDITORIA DA `ERRATA-01` (`§7`–`§9`)

A `ERRATA-01` (`36_RECONCILIACAO_FECHAMENTO_FASE_6.md:32-81`) reclassificou `R1-PEND-1..4` da classe
`B` para a classe `D`, motivada pela descoberta do sexto subdiretório `preflight/`, que a varredura
original não havia inspecionado.

**Conforme `§7`, a conclusão anterior NÃO foi herdada.** A auditoria foi refeita **a partir da
redação original** de `06_PROTOCOLO_VALIDACAO_FISICA_F6_SG_A.md:556-560` e da emenda de `2026-08-11`
(`06:566-585`).

### 4.1 Método aplicado, item a item

Para cada pendência foram determinados os sete pontos exigidos por `§8`: exigência literal · instante
temporal a que se prende · evidência originalmente exigida · evidência efetivamente existente ·
obtenibilidade prospectiva · se uma execução futura seria **apenas prospectiva** ou satisfaria
**literalmente** o requisito histórico · estado documental correto.

### 4.2 Veredito da auditoria

**A reclassificação `B → D` da `ERRATA-01` está CONFIRMADA quanto ao efeito prático** — nenhuma das
quatro pendências se fecha por execução. Mas ela **agrupa quatro itens de duas naturezas
diferentes**, e essa é a precisão que este artefato acrescenta:

| Pendência | Qualificador temporal na redação original | Natureza real | Fecha por execução futura? |
|---|---|---|---|
| `R1-PEND-1` | *"do momento da rodada"* | **Lacuna histórica de evidência** | **NÃO** — nenhuma execução de hoje é "o momento da rodada" |
| `R1-PEND-2` | **nenhum** | **Requisito prospectivamente satisfazível**, mantido aberto por **decisão de proveniência** | Já satisfeito por captura existente |
| `R1-PEND-3` | *"agora"* | **Lacuna histórica de evidência** — prova de instante | **NÃO** |
| `R1-PEND-4` | *"da rodada"* | **Lacuna histórica de evidência** | **NÃO** |

**A prova de que `R1-PEND-2` é diferente é textual e independente:** a emenda de `2026-08-11`
(`06:566-585`) **enumera** as pendências presas a instante temporal e **omite conspicuamente a
`PEND-2`**. Sua redação literal não carrega qualificador temporal, e o arquivo
`R2_PROSPECTIVE_BE_01/preflight/PS1_METRO.log` contém a linha exigida
(`Starting project at C:\tmp\ptf_fase6_shell_splash_wt`). Ela permanece aberta **por decisão de
proveniência** (`PF6SGA-R2-GATE-SANEAMENTO` / `R1-PROVENIENCIA-01`), **não por impossibilidade**.

### 4.3 Síntese `PV11` conferida

`R2_PROSPECTIVE_BE_01/preflight/PV11_R1_PEND_1_A_4.txt` (64 linhas), lido integralmente:

```
RECUPERADAS_PELO_METODO_PREVISTO        = 0 de 4
REDACAO_LITERAL_SATISFEITA_POR_CAPTURA_NOVA = 1 de 4
SUBSTITUTOS_INVENTADOS                  = 0
ARTEFATOS_RETRODATADOS                  = 0
IMPACTO NA R2                           = NENHUM
```

Confere com a auditoria independente acima. **Nenhuma evidência foi fabricada, reconstruída ou
sintetizada. Nenhuma evidência prospectiva de hoje foi convertida em prova retrospectiva.**

### 4.4 O que esta auditoria **não** faz

Não concede `PASS` a caso histórico · não concede `F6-SG-A` · não cria *allowlist* · não cria `AC-5`
· não redefine *baseline* histórica · **não atribui ao fundador nenhuma decisão que não esteja
documentalmente concedida**.

---

## 5 · `R1-PEND-1..4` — UMA LINHA POR ITEM

| Item | Redação (essência literal) | Reobtenível? | Estado documental correto |
|---|---|---|---|
| `R1-PEND-1` | evidência **"do momento da rodada"** | **NÃO** | `LACUNA HISTÓRICA DE EVIDÊNCIA` · aberta · só se encerra por decisão do fundador (`S0.3`) · **execução nenhuma resolve** |
| `R1-PEND-2` | linha de projeto do Metro apontando o worktree canônico | **SIM — já existe** (`preflight/PS1_METRO.log`) | `REDAÇÃO LITERAL SATISFEITA` · aberta **apenas por proveniência** · custo zero para fechar · ato formal, não execução |
| `R1-PEND-3` | requisição do *bundle* **"agora"** — prova de instante | **NÃO** | `LACUNA HISTÓRICA DE EVIDÊNCIA` · aberta · `S0.3` |
| `R1-PEND-4` | saída **"da rodada"** | **NÃO** | `LACUNA HISTÓRICA DE EVIDÊNCIA` · aberta · `S0.3` |

> **`R1-PEND-5` NÃO está nesta tabela** e **não é reaberta aqui**. Ver `§18.3` — há uma contradição
> material medida, que é matéria de decisão humana, não de reclassificação por agente.

---

## 6 · MATRIZ RESIDUAL DE `F6-SG-A`

**Categorias (`§13`):** `A` concluído e provado · `B` lacuna histórica de evidência · `C`
prospectivamente executável **SEM** tablet · `D` prospectivamente executável **COM** tablet · `E`
exige binário *Preview* · `F` exige decisão do fundador · `G` bloqueado por dependência anterior ·
`H` não pertence mais a `SG-A` · `I` já superado por evidência posterior válida.

**Sessões:** `SF1` = `SM-X510` + Dev Build + Metro canônico · `SF2` = *rollback* `a190b3e` ·
`SF3` = iPad + telefone · `SF4` = *Preview*.

| # | ITEM | CAT | FONTE | CRITÉRIO LITERAL | ESTADO | DEPEND. | EVIDÊNCIA NECESSÁRIA | AÇÃO RESTANTE | PARALELIZA COM | STOP |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `R2` prospectiva `B`–`E` (`6,7,8,11,12,17`) | **A** | `35:4`; `DEC:4170` | `R2_PROSPECTIVE_BE = PASS` | Provado | — | Lacrada (350 arq.) | Nenhuma | — | — |
| 2 | `CASO 9` | **A** | `35:134-143` | `NÃO REPRODUZIDO` / `NÃO BLOQUEIA` | Terminal | — | Já feita | Nenhuma — *não provocar, não inventar causa* | — | — |
| 3 | `CASO 12` — 4 estágios injetados | **A** | `35:71-73` | *"continuam **NÃO EXECUTADOS**"* | Congelado | — | Nenhuma | Proibido ampliar alcance | — | — |
| 4 | `R1-PEND-5` | **B** | `DEC:4092-4104` | `EVIDENCE_GAP_ACCEPTED_BY_FOUNDER` | Aceito | — | Nenhuma | **Não reabrir** — mas ver `§18.3` | — | Proibido fabricar/retrodatar |
| 5 | `R1-PEND-1` | **F** (natureza `B`) | `36:53-56`; `DEC:2588` | *"do momento da rodada"* | ABERTA | `S0.3` | **Nenhuma** | Decisão | Todas | — |
| 6 | `R1-PEND-2` | **F** (custo zero) | `36:161-164` | sem qualificador temporal | ABERTA formalmente | `S0.3` | **Já existe** | Ato formal | Todas | — |
| 7 | `R1-PEND-3` | **F** (natureza `B`) | `36:55` | *"agora"* | ABERTA | `S0.3` | **Nenhuma** | Decisão | Todas | — |
| 8 | `R1-PEND-4` | **F** (natureza `B`) | `36:56` | *"da rodada"* | ABERTA | `S0.3` | **Nenhuma** | Decisão | Todas | — |
| 9 | **`R1` — veredito da rodada** *(ausente da matriz `36`)* | **F** | `DEC:2448`,`2465` | *"`PASS` NÃO FORMALIZÁVEL … Não é `PASS`. Não é `FAIL`"* | Não formalizado | `S0.3` | Nenhuma nova | Fechar `PEND-1..4` ⇒ `R1` vira `PASS` por leitura direta | Todas | — |
| 10 | **`R1` — observação física sobre binário substituído** *(ausente)* | **F** | `36:94-96`; `DEC:2446` | *"Prova colhida sobre o binário anterior **não se herda**"* | Não classificado | `S0.3` | Se a regra valer: reobservar *cold start* / `MainTabs` | Fundador declara se o eixo nativo alcança a `R1` | Bloco 0 de `SF1` | `06:294-296` |
| 11 | `R2` histórica Bloco `A` (`1,10,14 v2,15,16`) | **D** | `36:274`; `14:3040-3048` | `CASO10_AND_BLOCO_A_FINAL_GATE_PASS` × eixos nativo/JS | `PASS` histórico íntegro em `92781ea`, **não herdável** | `S0.1` | 5 reobservações + cadeia de TARs | Reobservar em `SF1` **ou** `S0.1` aceita (→ `F`, custo zero) | `R3`resize e `R5` | `06:294-296` |
| 12 | **`CASO 14 v1`** *(ausente da matriz `36`)* | **F** | `14:3045`,`14:3053-3056` | `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL` | Nem `PASS` nem `FAIL` | Human Gate | **Nenhuma** | Decisão sobre um dos 17 obrigatórios sem estado terminal | Todas | Proibido fabricar *writer* |
| 13 | `R3` — metade **resize**: `caso 4` + `E2` (+ `caso 5` parcial) | **D** | `06:403-404`,`06:430`; `36:281` | *"**Nada some**; nada é recortado em silêncio"* | **Nunca medida** | `SF1` | Vídeo contínuo + `FOTO-A`..`H` + par de TARs | Executar no `SM-X510` já instalado | `R2` Bloco `A` e `R5` | `06:294-296` |
| 14 | `R3` — metade **rotação**: `2`, `3`, `5`, `E3` | **H** *(contestada — ver `§18.2`)* | `06:304-313`; `DEC:2335-2340` | `NÃO EXECUTÁVEL EM ANDROID — política de orientação congelada para SG-C` | Congelada | `F3b-ARB-01` | Registro literal do token | Registrar **ou** reabrir por decisão | Todas | *"é proibido alterar `F6-R1.1` durante `SG-A`"* (`06:312`) |
| 15 | **Tratamento dos obrigatórios `2`,`3`,`5` em `NÃO EXECUTÁVEL`** *(ausente)* | **F** | `06:396` × `06:310-311` × `06:464` | *"um `FAIL` aqui impede `F6-SG-A`"* × *"continua **bloqueando**"* | **Conflito não resolvido** | Human Gate | Nenhuma | Fundador decide se `NÃO EXECUTÁVEL` dispensa obrigatório | Todas | — |
| 16 | `R4` / `CASO 13` — *rollback* isolado | **D** | `06:284`,`06:412`,`06:447-472`; `07:664` | *"O caminho revertido **consome o formato anterior**; **nenhuma obra órfã**"* | `NÃO EXECUTADO`; worktree `a190b3e` já existe | autorização (`06:468`) + acervo já misto | Vídeo `5→7` + captura `8` e `9` + texto do PowerShell provando `a190b3e` + `TA-13` + inventário pós-reversão | Executar **isolado** em `SF2` | **Com nada** | `06:294-296` |
| 17 | `R4` — compatibilidade do JS de `a190b3e` com `BUILD NATIVE 01` | **F** | `06:449` × `36:94-96` | premissa *"a camada nativa não mudou"* é **anterior à troca do binário** | **Não medida** | `SF2` | Arranque do *dev client* sobre o worktree | Fundador decide medir ou aceitar | — | `06:294-296` |
| 18 | `R5` — `E1`, `E4`, `E5`, `E6` | **D** | `06:285`,`06:429-434` | `E4`: *"**Recusa de aplicar**, com aviso legível"*; `E5`: *"a obra **não** é apagada"* | Não executada | `SF1` (**por último**) | Capturas + TAR por caso | Executar | Bloco `A` e `R3`resize, **depois deles** | `DEC:2346` — *"'não bloqueia automaticamente' nunca significa 'não conta'"* |
| 19 | `R5` — cenário `§28 #7` (`TK-A-097`) | **D** | `06:440` | *"sem salto de escala nem desalinhamento ao retomar"* | Não executado | `SF1` | Vídeo | Executar | idem | `06:294-296` |
| 20 | `R5` — dois painéis de recusa (`TK-A-045`, `TK-A-051`) | **D** | `06:442` | *"os **dois** avisos precisam ser **lidos em tela** … **sem** oferecer 'apagar' como saída"* | Não executado | `SF1` | Captura legível dos dois painéis | Executar | idem | — |
| 21 | `R5` — `TA-5R` (nitidez em tablet) | **D** | `06:443` | *"a **borda do balde** aparece **limpa** … o único item que **nenhum** arnês em Node consegue provar"* | Não executado | `SF1` | Captura ampliada | Executar | idem | — |
| 22 | `R6` — iPad (`§27`, literal) | **F** | `DEC:2247-2251` | *"**Samsung Android NÃO substitui iPad** … O critério permanece **literal**"* | Sem caminho de hardware | `S0.2` | iPad físico | Adquirir (→`SF3`) **ou** aceitar formalmente o gap | `SF3` | `06:294-296` |
| 23 | `R6` — telefone físico real (`§28 #17` / `CN-1`) | **F** | `DEC:2257-2262` | *"o **SM-X510 é tablet e NÃO satisfaz `CN-1`** … o item é **`NÃO EXECUTADO`**, nunca `PASS` e nunca `FAIL`"* | Sem aparelho | `S0.2` | Telefone Android real | Adquirir **ou** aceitar o gap | `SF3` | `06:294-296` |
| 24 | Backup somente-leitura do acervo antes de qualquer instalação | **D** | `06:184`; `DEC:2281-2282` | *"**backup somente-leitura do acervo por `adb` antes** de qualquer instalação"* | Não feito para o *preview* | cabeça de `SF4` | TAR validado (`Get-FileHash`, `tar -tf`) | Executar | cabeça de `SF4` | `DEC:2321` — *"só é declarado válido se puder ser lido/listado"* |
| 25 | Gerar binário `preview` não-`DEV` (`S7`) | **E** | `06:151-176`; `DEC:2273-2277` | `npx eas build --platform android --profile preview` | Não gerado | `R1`–`R6` inteiras antes (`06:183`) | Artefato EAS + `SHA256` | Gerar — **etapa não física** | Nenhuma sessão física | — |
| 26 | `R7` — `T090` / `F-PERF` / `P-139` | **E** | `06:187-195`; `DEC:2264-2272` | `[PTF_PERF_SAMPLE]` emitido · `schema 2` · terminal `first_layout` **ou** `ceiling` · `preview` com `PERF_TRACE` · `production` **comprovadamente sem** · zero telemetria externa | Não executado | `SF4` | `raw.log` do *preview* | Executar após `adb install -r` | áudio na mesma `SF4` | `06:294-296` |
| 27 | `R7` — discriminação de perfil em *runtime* | **E** | `06:187-191` | *"o **discriminador válido é a AUSÊNCIA das linhas `[shell]`** … usar a presença de `[PTF_PERF_SAMPLE]` é **proibido**"* | Não executado | `SF4` | Log sem `[shell]` | Verificar antes de qualquer veredito | — | — |
| 28 | `R7` — validações de áudio | **E** | `06:287` | *"`T090`/`P-139` + validações de áudio apropriadas"* | Não executadas | `SF4` | Registro em vídeo com som | Executar | `T090` | `06:294-296` |
| 29 | Extensão do árbitro de estado a `R3`/`R4`/`R5`/`R7` | **F** | `DEC:4111`,`4141-4143` | *"aplicável **somente de forma prospectiva** à campanha `B`–`E`"* | **Não decidida** | antes de `SF1` | Nenhuma | Fundador estende (mantendo `compare_state.py` lacrado) ou declara outro árbitro | Todas | `HARD STOP` de escritor novo, **se** estendido |
| 30 | Consolidação documental dos **17** vereditos | **G** | `06:396`,`06:288` | *"os **17 casos obrigatórios** de `§28.1` — um `FAIL` aqui impede `F6-SG-A`"* | Impossível antes das rodadas | todas as rodadas | Tabela única com 17 estados terminais | Consolidar (documental) | — | — |
| 31 | **Human Gate final de `F6-SG-A`** (`S9`) | **G** | `06:288`; `36:222` | *"**Human Gate final**"* | `NÃO CONCEDIDO` | `R1`…`R7` + `S0.*` | Todas as acima | **Decisão humana** | — | — |
| 32 | `F6-SG-B` / `SG-C` / `SG-D` | **H** | `36:225-245`; `DEC:2015` | ordem obrigatória `SG-A → SG-B → SG-C → SG-D` | Fora de `SG-A` | `SG-A` concedido | — | Trilhos 2 e 3 | — | — |
| 33 | `B2`, `B2′`, `B4`, `B5`, `B6`, `B7` | **H** | `36:290-295` | critério de saída da Fase 6 = `B4`+`B5` | Fora de `SG-A` | `SG-D` | — | Trilho 4 | `B6` exige *preview* **do estado final** | — |
| 34 | Gates automáticos no `HEAD` (`PRE-0`) | **I** | `36:109` | `bundle:check` verde (`2381` módulos) · `smoke` `4954/4954` · `expo-doctor` `18/18` | Verdes em `2ffcd82`; `e17b115` é *commit* documental | — | Reexecução só no estado final (`B7`) | Nenhuma para `SG-A` | — | — |

**Sem dívida fantasma:** cada linha tem fonte literal. Os **cinco itens ausentes** da matriz do
artefato `36` (linhas 9, 10, 12, 15, 29) estão aqui pela primeira vez, com a fonte que os sustenta.

### 6.1 Separação histórico × prospectivo (`§8` da missão)

| Natureza | Itens |
|---|---|
| **Lacuna histórica de evidência** — nenhuma execução resolve | 4, 5, 7, 8 |
| **Prospectivamente executável SEM tablet** | 25 (build EAS), 30 (consolidação documental) |
| **Prospectivamente executável COM tablet** | 11, 13, 16, 18, 19, 20, 21, 24, 26, 27, 28 |
| **Só decisão do fundador** | 6, 9, 10, 12, 15, 17, 22, 23, 29 |
| **Fora de `SG-A`** | 14 (contestada), 32, 33 |

---

## 7 · CAMPANHA FÍSICA — SEQUÊNCIA NUMERADA

**Número mínimo de sessões físicas para fechar `F6-SG-A`: 3** — **4** se `S0.2` = *adquirir* o
hardware de `R6`.

| Sessão | Aparelho / binário | Conteúdo | Funde com outra? |
|---|---|---|---|
| **`SF1`** | `SM-X510` · Dev Build já instalado · Metro `:8081` | Bloco 0 (pré-voo) · reobservação da `R1` **se** decidida · `R2` Bloco `A` **se `S0.1` não aceitar** · `R3` metade *resize* · `R5` inteira | — |
| **`SF2`** | `SM-X510` · Metro do *rollback* `:8082` | `R4` / `CASO 13` | **NÃO** |
| **`SF3`** | iPad + telefone físico real | `R6` | **NÃO** — condicional a `S0.2` |
| **`SF4`** | `SM-X510` com o `preview` instalado | backup do acervo · `R7` (`T090`/`P-139` + áudio) | **NÃO** — obrigatoriamente a última |

### 7.1 Ordem interna obrigatória dentro de `SF1`

```
Bloco 0  pré-voo (as quatro confirmações de §3.3 — POR SESSÃO)
   ↓
Bloco 1  R2 Bloco A (casos 1, 10, 14 v2, 15, 16)      [somente se S0.1 = reobservar]
   ↓                                                   TAR de checkpoint
Bloco 2  R3 metade resize (caso 4, caso 5 parcial, E2)
   ↓                                                   TAR de checkpoint
Bloco 3  R5 (E1, E4, E5, E6, §28 #7, painéis de recusa, TA-5R)
```

**A ordem é causal, não estética.** O `CASO 10` exige *baseline* *"imediatamente antes"*, e
`14:866-867` já registra o erro de reaproveitar TAR: *"usar o mesmo baseline atribuiria ao `CASO 10`
mutações de"* casos anteriores. E `E4`/`E5`/`E6` (`06:432-434`) **injetam** *lineart* divergente,
*payload* corrompido e acervo misto — mutando exatamente o acervo que os casos do Bloco `A` leem.
Com TAR de *checkpoint* entre blocos, **uma sessão basta**.

### 7.2 Por que `SF2` não se funde com `SF1` — quatro razões literais

1. `06:284` e `06:469` classificam a rodada como ***"isolado"***.
2. **Troca-se o código servido:** `--port 8082` + `adb reverse tcp:8081 tcp:8082` (`06:470-471`).
   Qualquer outro caso observado nessa janela seria medido contra `a190b3e`, **não** contra o `HEAD`.
3. A pré-condição é *"acervo já **misto**"* (`06:449`) — estado que só existe **depois** de `SF1`.
4. Ao terminar é preciso *"devolver o aparelho ao Metro canônico"* (`06:471-472`).

### 7.3 Por que `SF4` é obrigatoriamente a última

`06:179-181`, verbatim: *"o APK `preview` **substitui** o Development Build e **compartilha o mesmo
contêiner de dados** (`ptf_blobs` + AsyncStorage), e o acervo real é o **único insumo** da campanha"*.
Instalar antes **destrói o insumo de tudo que veio antes**.

---

## 8 · BLOCO POWERSHELL — PRÉ-VOO DE `SF1` (copiar e colar)

> **NADA AQUI FOI EXECUTADO POR MIM.** Este bloco é **preparação**, conforme `§17`. As três janelas
> são independentes e obedecem a `06:317-329`: **`PS1`** = Metro · **`PS2`** = controle ADB ·
> **`PS3`** = `logcat` em primeiro plano, encerrado **explicitamente com Ctrl+C**.
> **Não usar `Start-Process` para o `logcat`.**

### 8.1 `PS0` — verificação host-side (não toca no aparelho)

```powershell
# --- PS0 : estado do repositorio -------------------------------------------
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
Write-Host "WORKTREE : $((Get-Location).Path)"
Write-Host "BRANCH   : $(git rev-parse --abbrev-ref HEAD)"
Write-Host "HEAD     : $(git rev-parse HEAD)"
$dirty = git status --porcelain
if ([string]::IsNullOrWhiteSpace($dirty)) { Write-Host "TREE     : LIMPA" }
else { Write-Host "TREE     : SUJA"; $dirty }
```

**Aceite:** `WORKTREE = C:\tmp\ptf_fase6_shell_splash_wt` · `BRANCH = feat/fase6-shell-splash` ·
`TREE = LIMPA`.
**Se `WORKTREE` imprimir `ptf_colorir_canonical_runtime_wt` → PARE** (`06:265-266`).

### 8.2 `PS2` — transporte e identidade do aparelho

```powershell
# --- PS2 : ADB -------------------------------------------------------------
$ADB = "C:\Android\platform-tools\adb.exe"
$SER = "RX2XC003LTJ"
$PKG = "com.valentedev.pequenostracosdefe"

& $ADB devices -l
& $ADB -s $SER shell getprop ro.product.model
& $ADB -s $SER shell dumpsys package $PKG | Select-String -Pattern "versionCode|versionName" | Select-Object -First 2
```

**Aceite:** aparece `RX2XC003LTJ  device … model:SM_X510` e o pacote está instalado.

### 8.3 `PS2` — pré-voo de `adb reverse` (obrigatório antes de abrir o app)

```powershell
& $ADB -s $SER reverse --remove-all
& $ADB -s $SER reverse tcp:8081 tcp:8081
& $ADB -s $SER reverse --list
```

**Aceite (`06:238-240`):** existe **exatamente UM** mapeamento relevante contendo `tcp:8081 tcp:8081`.
Prefixo de transporte (`UsbFfs …`) **é permitido** — o gate **não** é literal.
**`FAIL` de pré-voo** apenas se a `8081` do tablet não apontar para a `8081` do host, ou se houver
mais de um mapeamento relevante concorrente.

### 8.4 `PS1` — Metro (janela dedicada, deixar aberta a sessão inteira)

```powershell
# --- PS1 : METRO -----------------------------------------------------------
Set-Location C:\tmp\ptf_fase6_shell_splash_wt
npm run start:dev
```

`start:dev` = `node scripts/check-env.js && expo start --dev-client --clear --lan` (`package.json`).
`--dev-client` abre no **development build**, não no Expo Go. `--clear` zera o cache do Metro.
`--lan` é irrelevante nesta rota — o transporte é o `adb reverse`.

**Aceite:** o cabeçalho do Metro imprime `C:\tmp\ptf_fase6_shell_splash_wt`.

### 8.5 `PS3` — captura do `logcat` (primeiro plano, NUNCA `Start-Process`)

```powershell
# --- PS3 : LOGCAT ----------------------------------------------------------
New-Item -ItemType Directory -Force "C:\tmp\ptf_evidencias\SF1_R3_RESIZE_01\logcat" | Out-Null
C:\Android\platform-tools\adb.exe -s RX2XC003LTJ logcat -v threadtime |
  Out-File "C:\tmp\ptf_evidencias\SF1_R3_RESIZE_01\logcat\raw.log" -Encoding utf8
```

- **Não usar `Start-Process`** (`06:326`);
- **`Tee-Object` não é necessário** (`06:327`);
- **preservar o `raw.log` íntegro** — o filtro é sempre arquivo **adicional**, nunca substituto
  (`06:328`);
- encerrar **apenas com Ctrl+C**, nunca fechando a janela.

### 8.6 `PS2` — sequência de abertura (ordem obrigatória)

```powershell
& $ADB -s $SER shell am force-stop $PKG
& $ADB -s $SER logcat -c
# --- CONFIRMAR QUE O PS3 JA ESTA RODANDO ANTES DA LINHA SEGUINTE ---
& $ADB -s $SER shell am start -a android.intent.action.VIEW `
  -d "pequenostracosdefe://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

Ordem literal de `06:329-330`: `force-stop` → `logcat -c` → **`PS3` já rodando** → só então o
*deep link*. A forma **URL-encoded** é a canônica (`06:248-253`) e deve ser usada **tanto no cold
start quanto em todas as reaberturas da rodada**.

### 8.7 As quatro confirmações de `§3.3` — **por sessão**, regra dura

| # | Confirmação | Onde | Se falhar |
|---|---|---|---|
| 1 | O cabeçalho do Metro imprime `C:\tmp\ptf_fase6_shell_splash_wt` | `PS1` | **PARE** |
| 2 | O aparelho requisitou o *bundle* **agora** (linha de requisição no `PS1`) | `PS1` | **PARE** |
| 3 | **Não** é `preview` nem `production` — as linhas `[shell]` **aparecem** | `PS3` | **PARE** |
| 4 | `adb reverse --list` mostra **exatamente um** mapeamento contendo `tcp:8081 tcp:8081` | `PS2` | **PARE** |

> **`06` é explícito:** sem as quatro, **nenhum cenário pode ser marcado `PASS`**.
> `[shell]` vem de `logger.log`, que é `__DEV__`-only — por isso a **ausência** de `[shell]` é o
> discriminador válido de `preview`, e a presença de `[PTF_PERF_SAMPLE]` **não** discrimina perfil.

### 8.8 Bloco de `SF2` (`R4`/`CASO 13`) — **preparado, NÃO autorizado**

> ⚠️ **Colisão literal registrada, não resolvida.** `06:470-471` manda
> `adb reverse tcp:8081 tcp:8082`. Mas `adb reverse` indexa mapeamentos **pela porta REMOTA (do
> aparelho)**: `tcp:8081 tcp:8082` **substitui** `tcp:8081 tcp:8081`; os dois **não coexistem**. Isso
> é operacionalmente correto para `SF2` (é exatamente o que se quer: o aparelho pedindo `8081` cai no
> Metro do *rollback* em `8082`), mas invalida qualquer leitura de que os dois mapeamentos ficariam
> lado a lado. Ver `§18.5`.

---

## 9 · GESTOS FÍSICOS EM ORDEM EXATA — `SF1`, Bloco 2 (`R3` metade *resize*)

> **Protocolo fechado antes de a câmera ligar (`§16`).** O fundador opera sozinho: nenhuma instrução
> interativa durante a gravação. Câmera externa enquadrando **o tablet inteiro**, com a **barra de
> sistema do Android** visível, a superfície do app, as mãos e a **continuidade temporal**.
> **Não usar SmartCapture como substituto da câmera externa.** Se a câmera parar antes de um
> *checkpoint*, **registrar a descontinuidade** — nunca fingir continuidade inexistente.

| # | Gesto literal |
|---|---|
| 1 | `PS2`: `am force-stop com.valentedev.pequenostracosdefe` |
| 2 | `PS2`: `logcat -c` |
| 3 | `PS3` em primeiro plano, já capturando (`§8.5`) |
| 4 | Abrir o app **pelo ícone**, em **retrato, tela cheia**. Aguardar `MainTabs` |
| 5 | `PS3`/Metro: conferir **uma** linha `[shell] MainTabs MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado`. **Anotar o número de `montagens` — é o número congelado da rodada** |
| 6 | Abrir a **obra antiga do Colorir** usada no caso `1`. Capturar **`FOTO-A` — linha de base** |
| 7 | **PRÉ-0:** invocar a tela dividida do Android (Recentes → menu do app → tela dividida). **Gravar esta tentativa em vídeo, mesmo que falhe.** Se o sistema recusar → **STOP `S-MW`** |
| 8 | Com o app em janela reduzida, capturar **`FOTO-B` — viewport menor** (caso `4`) |
| 9 | Arrastar o divisor **estreitando** até o mínimo permitido. **Vídeo contínuo.** Capturar **`FOTO-C` — viewport mínimo** |
| 10 | `PS3`/Metro: copiar em texto **todas** as linhas `[AppNavigator] faixa =`, com `largura=…dp` e `ainda na montagem #` |
| 11 | Arrastar o divisor **ampliando** até o máximo permitido. Capturar **`FOTO-D` — viewport maior** (caso `5`, **parcial**) |
| 12 | Sair da tela dividida, voltando a **tela cheia retrato**. Capturar **`FOTO-E` — retorno** |
| 13 | Enviar ao **segundo plano** ~5 s e **voltar**. Conferir tela, aba e obra |
| 14 | `PS3`/Metro: conferir que `montagens #` **continua o do passo 5** e que **não** apareceu `[shell] MainTabs DESMONTADO`, `vivos 2/1`, `ANOMALIA: duas_arvores_vivas` nem `ANOMALIA: desmontagem_sem_montagem` |
| 15 | **`E2`:** fechar a obra do Colorir; abrir a obra **vetorial do Ateliê** (com traços **e** carimbos). Capturar **`FOTO-F`** |
| 16 | Repetir 7 → 12 com a obra vetorial. Capturar **`FOTO-G`** (janela reduzida) e **`FOTO-H`** (retorno) |
| 17 | `PS3`: encerrar com **Ctrl+C**. **Preservar `raw.log` íntegro** |
| 18 | Registrar no diário: `2` / `3` / `E3` = `NÃO EXECUTÁVEL EM ANDROID — política de orientação congelada para SG-C`, **mais** a pendência `F3b-ARB-01` (`§18.2`) |

### 9.1 `PASS` / `FAIL` / `STOP` — Bloco 2 de `SF1` (`§19`)

**Pré-condições** — todas verificadas antes do gesto 1:

| # | Pré-condição | Se falhar |
|---|---|---|
| `PRÉ-0` | O app **entra** em tela dividida no `SM-X510` | **STOP `S-MW`** — marcar `NÃO EXECUTÁVEL — multi-janela indisponível` |
| `PRÉ-1` | `R2` fechada — casos `1,6,7,8,9,10,11,12,14,15,16,17` executados | **STOP** — rodada fora de ordem |
| `PRÉ-2` | Caso `1` com resultado registrado | **STOP** — sem linha de base não há comparação |
| `PRÉ-3` | Acervo real intacto — **não** desinstalar, **não** `pm clear` | **STOP** — campanha inviabilizada |
| `PRÉ-4` | Três janelas PowerShell montadas conforme `06:317-329` | **STOP** — evidência inválida |
| `PRÉ-5` | Existe obra vetorial do Ateliê com `strokes` **e** `stamps` | `E2` = `NÃO EXECUTÁVEL — sem insumo` |
| `PRÉ-6` | Binário confirmado: `BUILD NATIVE 01`, `com.valentedev.pequenostracosdefe` | **STOP** — binário errado |

**Resultado esperado (redação canônica):**

| Gesto | Esperado |
|---|---|
| 8–10 (caso `4`) | *"**Nada some**; nada é recortado em silêncio. A obra continua inteira, menor"* (`06:403`) |
| 11 (caso `5`, parcial) | *"**Nada é esticado**: sobra vira **moldura**, nunca distorção. Círculo continua círculo"* (`06:404`) |
| 12–13 | Obra íntegra; rota, pilha e aba idênticas (`05:545`) |
| 14 | `montagens #N` **não muda**; zero `DESMONTADO`; zero anomalia (`06:540-541`) |
| 15–16 (`E2`) | *"Traços mantêm posição relativa ao espaço lógico; nada escorrega"* (`06:430`) |

**Checkpoints:**

| ID | Momento | Verificação |
|---|---|---|
| `CK-0` | após gesto 7 | O app **entrou** em tela dividida? |
| `CK-1` | após gesto 5 | Exatamente **uma** `[shell] MainTabs MONTADO`, `vivos 1/1` |
| `CK-2` | após gesto 10 | Linhas `faixa` coletadas (ou ausência justificada por não-travessia de `600dp`) |
| `CK-3` | após gesto 12 | Layout com moldura, sem distorção e sem recorte |
| `CK-4` | após gesto 14 | `montagens #` inalterado, zero `DESMONTADO`, zero `ANOMALIA` |
| `CK-5` | após gesto 16 | Traços e carimbos nas mesmas posições lógicas |

**`PASS`** — só se **todos** valerem simultaneamente: `CK-0` positivo · `CK-1` **e** `CK-4` verdes
(**uma única instância viva de `MainTabs` do início ao fim**) · `CK-3` verde em `FOTO-B`, `FOTO-C` e
`FOTO-D` · `CK-5` verde · `FOTO-E` equivalente a `FOTO-A`.

> **`PASS` do caso `5` é impossível nesta rodada**: a redação canônica exige *"Tela cheia em
> paisagem"* (`06:404`) e paisagem está bloqueada. O máximo registrável é
> **`COBERTURA PARCIAL — objetivo de ampliação verificado sem paisagem`** (`05:1185`).

**`FAIL`** — qualquer um: algo **some** ou é **recortado** ao estreitar · algo é **esticado** ao
ampliar (círculo deixa de ser círculo) · tinta e *lineart* se separam · traços/carimbos **escorregam**
de posição lógica · `montagens #` **sobe** ou aparece `DESMONTADO` (*"Isso é **defeito**, não
observação"*, `07:506`) · qualquer `ANOMALIA` · rota/pilha/aba mudam sozinhas · a obra volta em branco
ou com salto de escala.

**`STOP`** — `S-MW` (não entra em tela dividida) · `S-SHELL` (`montagens` sobe / `DESMONTADO` /
`ANOMALIA`) · `S-GEO` (recorte, distorção, escorregamento) · `S-ACERVO` (sinal de perda ou reescrita
de obra) · `S-ROT` (alguém propõe destravar paisagem "só para testar").

**Proibido após `STOP`:** corrigir código · prosseguir para `R4` · reexecutar o caso buscando
resultado melhor · alterar `app.json`, o plugin de orientação ou qualquer coisa de `F6-R1.1` ·
reinstalar / desinstalar / `pm clear` · gerar build novo · sobrescrever ou truncar o `raw.log` ·
converter `NÃO EXECUTÁVEL` em `PASS` ou `FAIL` · conceder Human Gate · registrar "causa confirmada"
sem prova.

---

## 10 · EVIDÊNCIAS — NOMES E DESTINOS

> ⚠️ **`06:323` fixa apenas `C:\tmp\ptf_evidencias\R1\`.** Não existe convenção canônica de diretório
> para `R3`, `R4`, `R5` ou `R7`. Os nomes abaixo são **propostos**, seguindo o padrão já usado em
> `R2_PROSPECTIVE_BE_01`, e **dependem de confirmação do fundador** (`§18.7`).

| Sessão / bloco | Diretório proposto | Artefatos |
|---|---|---|
| `SF1` Bloco 0 | `C:\tmp\ptf_evidencias\SF1_PREFLIGHT_01\` | `PS0_REPO.txt` · `PS1_METRO.log` · `PS2_ADB.txt` · `REVERSE_LIST.txt` |
| `SF1` Bloco 1 (`R2` Bloco `A`) | `…\SF1_R2_BLOCO_A_01\` | `logcat\raw.log` · `acervo\TAR_*.tar` + `SHA256` · capturas por caso |
| `SF1` Bloco 2 (`R3` resize) | `…\SF1_R3_RESIZE_01\` | `logcat\raw.log` (íntegro) · `logcat\filtrado.log` (**adicional**) · `video\resize_7a13.mp4` · `video\resize_16.mp4` · `foto\FOTO-A..H` · `faixa_lines.txt` |
| `SF1` Bloco 3 (`R5`) | `…\SF1_R5_01\` | `logcat\raw.log` · TAR por caso · captura legível dos **dois** painéis de recusa · captura ampliada de `TA-5R` |
| `SF2` (`R4`/`CASO 13`) | `…\SF2_R4_ROLLBACK_01\` | vídeo dos passos `5→7` · captura do passo `8` (`CN-2` "antes") · captura do passo `9` · **texto do PowerShell comprovando `a190b3e`** · `TA-13` · inventário do acervo **após** a reversão |
| `SF4` (`R7`) | `…\SF4_R7_PREVIEW_01\` | backup TAR **validado** (`Get-FileHash` + `tar -tf`) **antes** da instalação · `logcat\raw.log` do *preview* · vídeo com som |

**Regra transversal:** o `raw.log` é sempre preservado **íntegro**; qualquer filtro é arquivo
**adicional**, nunca substituto (`06:328`).

---

## 11 · `CASO 13` (`R4`) — RECONSTRUÍDO DA SPEC

**Reconstruído de `07` e `05`, não de memória.**

### 11.1 Evidência exigida — verbatim

`07:664`:
> *"**Vídeo** dos passos 5→7 … · **captura** do passo 8 (`CN-2` "antes") · **captura** do passo 9 ·
> **texto** do PowerShell de `§3.5` comprovando `a190b3e`"*

`05:1226`:
> *"**Prova:** `TA-13` + **inventário do acervo após a reversão**"*

### 11.2 O discriminador A/B — `CP-4`, o *checkpoint* mais forte

`07:159-161` fixa o par: em `a190b3e` há **0** ocorrências de `MainTabs MONTADO` e **0** de
`onContentProcessDidTerminate`; no `HEAD` há **1** e **2**.
> *"Se aparecer, você está em A — pare."*

Isso é o que prova, objetivamente, que o JS servido é o do *rollback* e não o do `HEAD`.

### 11.3 O "rollback" é de **JS**, não de binário

`06:269`: o Development Build serve JS ao vivo via Metro; `preview`/`production` embutem o JS e
ignoram o Metro. Logo `SF2` **não gera build** — troca-se o Metro (`--port 8082` sobre o worktree
`a190b3e`) e redireciona-se o `adb reverse`.

### 11.4 `PASS` — a spec **não define critério positivo**

Não existe, no corpo canônico, uma frase que diga "`CASO 13` = `PASS` se X". O `PASS` é
**derivado**: ausência integral das condições de `FAIL` + conformidade com o "Esperado" + as **quatro
invariantes ZERO** (`06:350-356`).

**`FAIL`, verbatim** (`07:663`):
> *"Qualquer obra some, aparece em branco ou é apagada pelo código anterior; a coleção do `C60` perde
> vaga; a abertura do mapa difere visivelmente entre A e B"*

### 11.5 `CASO 13` **não** pode dividir sessão com o *resize* — quatro fundamentos

1. A palavra **"isolado"** aparece em **cinco** fontes canônicas independentes.
2. Uma tentativa de fusão **já foi explicitamente recusada** (`10:36`).
3. O *resize* testa exatamente o código que **não existe** em `a190b3e` — incluindo
   `useSurfaceLifecycle.js` e `useViewportProjection.js`.
4. A ordem dos grupos foi desenhada para **minimizar trocas de Metro** (`08:315-319`).

### 11.6 O que **não** existe para `CASO 13`

Não existe token de `STOP` específico do caso · não existe destino canônico de artefatos · não existe
árbitro de estado designado. A doutrina `R2P1` (`ROLLBACK_ATTEMPTS = 1`) **não é herdada** — isso está
explícito.

**Nada disto foi executado. `CASO 13` permanece `NÃO EXECUTADO`.**

---

## 12 · RESIZE E MULTI-JANELA

A sequência física completa, o "Esperado" canônico, os *checkpoints* e os critérios estão em `§9`
acima — não repetidos aqui.

### 12.1 A premissa de multi-janela **nunca foi declarada nem medida**

Busca exaustiva no repositório: **nada** declara `android:resizeableActivity`. O `app.json` não o
declara; o plugin `withAndroidTabletOrientation` **não o toca**; e o manifesto efetivo **não é
inspecionável neste worktree** (não há `android/` gerado).

**Consequência:** `36:190` afirma executabilidade do *resize* **sem evidência**. Se o `SM-X510`
recusar a tela dividida, o resultado correto é `NÃO EXECUTÁVEL — multi-janela indisponível`, **nunca**
`FAIL`. Por isso `PRÉ-0` existe e é o **primeiro** *checkpoint* (`CK-0`).

### 12.2 Ausência de crash **não** é `PASS`

O contrato exige mais: *"nada some"*, *"nada é esticado"*, *"traços mantêm posição relativa ao espaço
lógico"*, `montagens #` inalterado, zero `DESMONTADO`, zero `ANOMALIA`, e `FOTO-E ≡ FOTO-A`. Um app
que sobrevive ao *resize* com a obra recortada é `FAIL`, não `PASS`.

### 12.3 Inventário somente-leitura de código e testes (`§15`)

| Superfície | Arquivo | Teste automatizado existente | Lacuna |
|---|---|---|---|
| Instância única de `MainTabs` | `src/navigation/AppNavigator.js` | contrato de log `[shell]` (textual no `smoke`) | **contagem viva só se prova em aparelho** |
| Travessia de faixa | `useWindowBand.js` + `AppNavigator.js` | `scripts/testing/windowBandHarness.js` | limiar real de `600dp` não medido fisicamente |
| Projeção de viewport | `useViewportProjection.js` | `scripts/testing/viewportProjectionHarness.js` | reprojeção sob *resize* real |
| Arquétipos de superfície | `src/components/layout/*` | `scripts/testing/surfaceArchetypeHarness.js` | — |
| Espaço lógico do Ateliê | — | `scripts/testing/logicalSpaceHarness.js` | `E2` (traços+carimbos sob *resize*) |
| `P-139` / `T090` | — | — | **pertence a `R7`, não a `R3`** |

**Fato estrutural:** `package.json` declara **um único** `devDependency` (`sharp`). **Não existe
Jest, Vitest, Mocha, Jasmine, AVA nem Testing Library.** Toda a suíte é `scripts/smoke.js` (54 461
linhas, **4954 asserções**, majoritariamente **leitura textual**) mais **seis arneses**.
`bundle:check` prova bundleabilidade e **não executa nada**; o `smoke` prova regras de produto e
**não parseia**. Nenhum dos dois prova renderização, layout, toque, gesto, áudio, persistência em
aparelho, orientação física ou comportamento multi-janela.

**Nenhum código foi alterado. Nenhuma refatoração cosmética foi iniciada.**

---

## 13 · `PREVIEW` E `R7`

### 13.1 O que exige `Preview` e o que não exige

| Item | Exige `Preview`? | Fundamento |
|---|---|---|
| `R2` Bloco `A`, `R3` *resize*, `R5` | **NÃO** | Dev Build já instalado serve o JS do `HEAD` via Metro |
| `R4` / `CASO 13` | **NÃO** | *rollback* é de **JS**; Dev Build + Metro `:8082` |
| `R6` (iPad / telefone) | **NÃO** por perfil — bloqueado por **hardware** | `§14` |
| `R7` — `T090` / `F-PERF` / `P-139` + áudio | **SIM** | `D-3` (`PF6SGA-D3`, `DECISIONS.md:2264-2277`) |

### 13.2 Por que um build novo é inevitável para `R7` — cadeia de seis elos

1. A variável `EXPO_PUBLIC_PTF_PERF_TRACE` só entrou em `eas.json` no commit `456ac1b`.
2. Variáveis `EXPO_PUBLIC_*` são **assadas no momento do build**.
3. Ambos os *previews* Android existentes **expiraram**.
4. O *preview* iOS existente **não tem** a variável.
5. **Não há rota OTA** para injetá-la.
6. O *preview* **não se conecta ao Metro** — não há como servir JS novo a ele.

Verificado em `eas.json`: `build.preview.env` contém `"EXPO_PUBLIC_PTF_PERF_TRACE": "1"`;
`build.production.env` contém **apenas** `EXPO_PUBLIC_GLOBAL_MANIFEST_URL`.

> ⚠️ **Lacuna aberta:** o aceite exige *"`production` **comprovadamente sem**"* o `PERF_TRACE`, mas
> **nada no corpo canônico diz COMO o lado `production` é provado**. Ver `§18.8`.

### 13.3 Timing — gerar o `Preview` **agora** é desperdício provado

Três condições precisam valer antes de gerar. **Nenhuma vale hoje.** Medição:

```
git log --oneline 521d59c..HEAD -- src/ App.js index.js app.json package.json plugins/
→ 1 linha:
  2ffcd82 fix(f6): persistir os campos logicos do payload atraves do ponteiro do Colorir 60
```

Esse commit tocou `scripts/smoke.js` (+210) e `src/services/coloring60DrawingStorage.js` (+48/−2) —
ou seja, **o grafo executável mudou depois do último binário**. E `06:183` exige que `R1`–`R6` sejam
executadas **inteiras antes**. Gerar o `Preview` agora produziria um binário que
**necessariamente** seria invalidado.

**Nenhum build foi gerado nesta missão. Nenhum APK foi instalado.** O comando autorizado, quando a
hora chegar, é exatamente um: `npx eas build --platform android --profile preview`.

### 13.4 O discriminador de perfil

`06:188`, verbatim: *"o **discriminador válido é a AUSÊNCIA das linhas `[shell]`** … Usar a presença
de `[PTF_PERF_SAMPLE]` como prova de estar no `preview` é **proibido**"*. Confirmado por leitura de
código: `[shell]` vem de `logger.log`, que é `__DEV__`-only; `[PTF_PERF_SAMPLE]` é emitido também
pelo Dev Build.

---

## 14 · HARDWARE — MATRIZ COM VOCABULÁRIO FECHADO

**Vocabulário permitido (`§22`):** `PASS FÍSICO` · `FAIL FÍSICO` ·
`NÃO EXECUTADO POR INDISPONIBILIDADE DE DISPOSITIVO` · `COBERTURA INDIRETA` ·
`EVIDÊNCIA SUBSTITUTIVA PERMITIDA POR SPEC`.

| Requisito | Hardware exigido | Disponível? | Estado no vocabulário fechado |
|---|---|---|---|
| Cenários de tablet Android (`R2 A`, `R3` resize, `R5`) | `SM-X510` | **SIM** | executável — hoje `NÃO EXECUTADO`, aguardando `SF1` |
| `R4` / `CASO 13` | `SM-X510` + Metro `:8082` | **SIM** | executável — hoje `NÃO EXECUTADO`, aguardando `SF2` |
| `R6` — iPad (`§27`) | **iPad físico** | **NÃO** | `NÃO EXECUTADO POR INDISPONIBILIDADE DE DISPOSITIVO` |
| `R6` — telefone (`§28 #17` / `CN-1`) | **telefone Android real** | **NÃO** | `NÃO EXECUTADO POR INDISPONIBILIDADE DE DISPOSITIVO` |
| `R7` | `SM-X510` + APK `preview` | binário **não existe** | `NÃO EXECUTADO` — bloqueado por `§13.3` |

### 14.1 Não existe evidência substitutiva permitida por spec

Duas decisões congeladas fecham a porta, verbatim:

- `PF6SGA-D1` (`DECISIONS.md:2247`): *"**Samsung Android NÃO substitui iPad**"* · *"**NÃO emendar o
  `§27`**"*;
- `PF6SGA-D2` (`DECISIONS.md:2259`): *"O **`SM-X510` é tablet e NÃO satisfaz `CN-1`**"* · *"até lá o
  item é **`NÃO EXECUTADO`**, nunca `PASS` e nunca `FAIL`"*.

As categorias `COBERTURA INDIRETA` e `EVIDÊNCIA SUBSTITUTIVA PERMITIDA POR SPEC` **não têm nenhuma
instância aplicável** em todo o corpus.

**Não se recomenda compra nesta missão. Não se redefine requisito para fabricar 100% de cobertura.
Não se declara telefone `PASS` sem telefone. Não se declara iPad `PASS` sem iPad.**

### 14.2 A única saída é decisional — e já existe molde

`D-FUND-R1-PEND5-EVIDENCE-GAP-01` (`DECISIONS.md:4092-4104`) é o **molde reutilizável** de dez
elementos para dispor de uma lacuna irrecuperável, incluindo o registro de um **token terminal**
(no caso: `R1_PEND_5 = EVIDENCE_GAP_ACCEPTED_BY_FOUNDER`) e três negativas explícitas.
`S0.2` pode usar o mesmo molde — **se e quando o fundador decidir**. Não é decidido aqui.

**Distinção preservada em todos os casos:** *não validado fisicamente naquele hardware* **≠** *falha
funcional observada*.

---

## 15 · `F6-SG-B` — PRÉ-TRABALHO SOMENTE-LEITURA (`§23`)

> **Nenhum portão é concedido. Nada foi implementado. Nada foi refatorado.**

### 15.1 Fato de primeira ordem

**`F6-R2` / *Map Geometry Foundation* tem ZERO implementação.**
`src/services/mapAnchor.js` — **NÃO ENCONTRADO**. `scripts/testing/mapAnchorHarness.js` — **NÃO
ENCONTRADO**. `MAP_ANCHOR_FRAMING` em `src/` — **NÃO ENCONTRADO**. Portões `G-MAP-1..5` em
`scripts/smoke.js` — **NÃO ENCONTRADOS**. `git log --all --grep="TK-B-"` devolve **dois** commits,
**ambos documentais**.

### 15.2 Grafo `FONTE → TRANSFORMAÇÃO → CONSUMIDOR` (resumo)

| Cadeia | Fonte | Transformação | Consumidor final |
|---|---|---|---|
| Largura | `useWindowDimensions().width` (`AdventureMapScreen.js:94`) + `onContainerLayout` (`:127-130`) | `mapWidth` (`:126`) → `computeRegionHeight` (`adventureMap.js:105-107`) | `regionLayout` (`:176-186`) e prop `width` (`:548`) |
| Coord → pino | `STORY_MAP_COORDS` (`adventureMap.js:146-171`) | `getStoryMapCoord(id,i,n)` → `x/y` px (`MapRegion.js:56-57`) | `markerSlot` (`:175`,`:215`) → `StoryMapMarker.js:108` |
| Coord → câmera inicial | mesma fonte + `height`/`insets` | `vpEst` **estimado** (`:302`) → `anchorY` (`:311`) → `−vpEst*0.58` (`:313`) | `contentOffset` do `ScrollView` (`:540`) |
| Coord → câmera medida | `onScrollLayout` (`:400`) + `onContentSizeChange` (`:401`) | `anchorY` (`:434`) → `−vp*0.58` (`:435`) | `scrollTo` (`:439`) |
| Coord → `scrollPinIntoView` | `onTourStep` (`:498-500`) | `anchorY` (`:489`) → `−vp*0.5` (`:493`) | `scrollTo` (`:494`) |
| Holofote do tour | `measureInWindow` (`useGuideTargets.js:37`) | `guideTargetInOverlay` (`BeniGuideOverlay.js:77-84`) | halo/anel/seta (`:299-304`) |
| Região ativa (`F6-R3.1`, já implementada) | `onScroll` (`:453`) | `regiaoDe(offset+90)` (`:391-398`) | `activeIdx` → overview (`:625`) |
| Reveal | `ProgressContext` | `getStoryRevealFraction` (`adventureMap.js:224-229`, usa `getStoryMapCoord` em `:226`) | clip de `MapRegion.js:117` |
| Overview "Ver mapa" | `useWindowDimensions()` | `ovImg` (`:105-120`) + `computeImageRect` (`adventureMap.js:111-127`) | `<Image>` (`:647`,`:656`) |

### 15.3 Candidatos a múltiplas fontes de verdade — classificados

| Ref | Achado | Classificação |
|---|---|---|
| **A** | Fator de enquadramento: `0.58` (`:313`) × `0.58` (`:435`) × `0.5` (`:493`) | **SUSPEITA · ATIVO** — é o defeito canônico `F6-MAP-ANCHOR-01`. Agravante: o comentário de `:481-483` diz *"mesma geometria da câmera"* e a linha usa `0.5` — **o comentário mente sobre o código** |
| **B** | `anchorY` calculado **três vezes**, textualmente idêntico (`:311`,`:434`,`:489`); busca do índice triplicada (`:304`,`:424`,`:487`) | **SUSPEITA · ATIVO** |
| **C** | `contentH` por três caminhos: estimado (`:301`), medido (`:401`,`:423`), estimado de novo (`:490-491`) | **SUSPEITA · ATIVO** |
| **D** | Viewport estimada (`:302`) × medida (`:400`→`:422`) | **SUSPEITA · ATIVO** — é literalmente `F6-R2.3` |
| **E** | `computeRegionHeight` chamado em dois lugares independentes (`:180`, `MapRegion.js:47`) | **LEGÍTIMA hoje · ATIVO, mas frágil** — mesma função pura, mesma entrada |
| **F** | Assinatura `(id,i,n)` × `(id)` de `getStoryMapCoord` | **SUSPEITA · LATENTE · ATIVO no grafo** — dorme porque as 20 histórias têm coordenada explícita |
| **G** | O número `90` da sonda, duas vezes (`:415`,`:454`), sem justificativa no código | **SUSPEITA · ATIVO** |
| **H** | Sonda de região **já unificada** em `regiaoDe` por `F6-R3.1` | **LEGÍTIMA · ATIVO** — `TK-B-018` deve **preservar** essa propriedade |
| **I** | "Alvo de toque" separado do pino **não existe hoje** — o botão **é** o pino | **LEGÍTIMA · ATIVO** — a premissa de `TK-B-010`/`MT-24` está defasada |
| **J** | Código **MORTO** pinado por portão: `MapPath.js`, `NextAdventureBanner.js`, `styles.regionPill*`, `REGION_TITLE_SAFE` | **MORTO · pinado** — não remover: quebraria o `smoke` |
| **K** | `markerFraction` / `regionMarkerBand` — segunda fonte de verdade vertical, alcançável só pelo caminho latente | **LEGADO ATIVO-LATENTE** |
| **L** | Duas "zonas seguras de topo": `REGION_TITLE_SAFE = 0.16` (morta) × `CHIP_SAFE_Y = 0.05` (ativa) | **SUSPEITA conceitual** — divergem 3× |
| **M** | **Três números para a MESMA barra inferior:** `64 + insets.bottom` real (`AppNavigator.js:336`) × `insets.bottom + 56` do mapa (`:302`) × `TABBAR_APPROX = 64` do guia (`BeniGuideOverlay.js:33`) | **SUSPEITA · ATIVO — maior do que a SPEC descreve** |
| **N** | Geometria do overview — sistema paralelo de *contain* | **LEGÍTIMA · ATIVO** — fora de `mapAnchor` |

### 15.4 Três achados que mudam o planejamento de `SG-B`

1. **As linhas `:NNN` citadas em SPEC/PLAN/TASKS estão defasadas** — `F6-R3.1` já entrou na árvore.
   Existe mapa de conversão completo no pré-trabalho (`FRENTE_F4 §3.6`).
2. **11 asserções de `scripts/smoke.js` fixam textualmente exatamente o código que `F6-R2` tem de
   matar.** Sem emendá-las **no mesmo commit** da migração, `npm run smoke` fica **vermelho** — e o
   próximo agente concluirá, erradamente, que quebrou o app.
3. **A "INCERTEZA LOCALIZADA" de `TK-B-020` está resolvida** por este pré-trabalho: os chamadores de
   `getStoryMapCoord` em `src/` são **quatro** (`MapRegion.js:51`, `AdventureMapScreen.js:311`,
   `:433`, `:489`) mais **um interno** (`adventureMap.js:226`).

**`F6-SG-B` não é concedido. Nada foi implementado.**

---

## 16 · COMMITS

Conforme `§26`, esta missão **não autoriza implementação funcional** — portanto **não existe commit
de código**. Dois commits documentais, atômicos e separados:

| # | Escopo | Arquivo |
|---|---|---|
| `C1` | `ERRATA-02` — precisão semântica do lacre `POWER_SAFE` | `specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/35_R2_PROSPECTIVA_BE_FECHAMENTO.md` |
| `C2` | Reconciliação pós-`R2` e preparo do `HUMAN GATE` físico | `specs/021-fase6-shell-splash-sistema-visual/delta-v4.1/37_RECONCILIACAO_POS_R2_E_PREPARO_SG_A.md` |

`git add` **seletivo, caminho a caminho**. `git add .` e `git add -A` **não são usados**.
`git status --short` e `git diff --cached --name-only` exibidos antes de cada commit.
**Sem push. Sem merge. Sem rebase. Sem squash. Sem amend.**

### 16.1 A `ERRATA-02` — resumo do que `C1` acrescenta

Acrescentada como `§10.10` do artefato `35`, **aditiva**, sem apagar uma linha do texto histórico:

- **Reconferência independente do lacre** (tabela de `§2.2` acima) e do inventário recursivo.
- **Correção pontual ao `§10.3`:** a linha *"Metro `20352` · **VIVO**"* nomeia o processo **errado** —
  `20352` é o `cmd.exe` lançador que detém o *handle* de `PS1_METRO.log`; o Metro é o `node.exe` PID
  `4372`. **O fato (Metro preservado vivo) está correto; apenas o PID estava errado.**
- **As oito camadas de durabilidade**, com o que está provado e o que não está — ver `§17.3`.
- **Onde o rótulo excede a prova**, e o token preciso que fica registrado:
  **`R2_RAW_CAMPAIGN_LOG_SEALED_AND_HASHED`** — dentro da família `R2_RAW_CAMPAIGN_LOG_SEALED_*` já
  existente, **sem inventar identificador canônico novo**.
- **Por que nenhum *flush* foi executado** (`§17.4`).
- **Defasagem documental sinalizada, não corrigida:** `docs/DECISIONS.md:4189-4193` ainda diz que o
  `raw_campaign.log` está *"aberto para escrita pelo `PS3`"*. **`DECISIONS.md` não foi editado** —
  apenas referência cruzada, e o item vai ao registro `PENDING HUMAN DECISION` (`§18.6`).
- O bloco de tokens de encerramento **preserva o rótulo histórico** e remete à errata.

---

## 17 · GATES

### 17.1 Gates aplicáveis

Esta entrega é **documentação pura** — altera apenas `specs/**`. Pela regra global de
bundleabilidade (`AGENTS.md`), documentação pura **não dispara** `verify:runtime`. Nenhum arquivo
`.js` alcançável foi tocado — **nem em comentário**.

| Gate | Aplicável? | Fundamento |
|---|---|---|
| `git diff --check` | **SIM** | exigido por `§27` para entrega documental |
| `npm run bundle:check` | NÃO | nenhum arquivo do grafo executável tocado |
| `npm run smoke` | NÃO | idem |
| `npx expo-doctor` | NÃO | nenhuma dependência, `app.json` ou config Expo tocada |

O resultado do `git diff --check` é exibido no relatório da sessão. **Nenhum gate é declarado verde
sem mostrar o resultado.**

### 17.2 Gates medidos no `HEAD` (contexto, não reexecutados aqui)

`36:109`: `bundle:check` verde (`2381` módulos) · `smoke` **`4954/4954`** · `expo-doctor` **`18/18`**
— medidos em `2ffcd82`. `e17b115` é *commit* documental. Reexecução completa pertence ao estado final
(`B7`).

### 17.3 Auditoria de `POWER_SAFE` — as oito camadas (`§12`)

| # | Camada | Estado |
|---|---|---|
| 1 | Processo encerrado | **PROVADO** |
| 2 | *Handle* liberado | **PROVADO** |
| 3 | Tamanho estável | **PROVADO** |
| 4 | *Hash* estável | **PROVADO** |
| 5 | Arquivo fechado | **PROVADO** |
| 6 | *Flush* do buffer da aplicação | **NÃO PROVADO** — `Stop-Process -Force` é `TerminateProcess`, que **não faz flush**. O que está provado é mais fraco: último byte `0x0A` e delta pós-kill de `0` bytes |
| 7 | *Flush* explícito do SO | **NÃO EXECUTADO** |
| 8 | Durabilidade contra queda abrupta de energia | **NÃO MEDIDA** |

**Conclusão:** o rótulo `POWER_SAFE` afirma a camada 8. A prova alcança até a 5. **Não se mantém uma
afirmação mais forte que a prova** — daí o token preciso `R2_RAW_CAMPAIGN_LOG_SEALED_AND_HASHED`.

### 17.4 Por que **nenhum** *flush* host-side foi executado

1. Não há método host-side **comprovadamente** não-destrutivo, sem alteração de conteúdo, sem
   truncamento, sem recriação e sem substituição de arquivo, disponível neste ambiente. `§12` é
   explícita: *"Se houver qualquer risco de mutação … **não execute o flush**."*
2. **Decisivo:** um *flush* de hoje **não repara a afirmação**. `POWER_SAFE` é uma asserção sobre o
   **lacre**, no instante `20:49:43.411`. Um *flush* executado agora provaria durabilidade **a partir
   de agora** — jamais retroativamente.

**Preferiu-se corrigir a precisão semântica a executar operação duvidosa.**

---

## 18 · `STOP`s E REGISTRO `PENDING HUMAN DECISION`

### 18.1 `STOP`s globais — nenhum acionado

| `STOP` | Acionado? |
|---|---|
| `STOP_BASELINE_DIVERGENTE` | **NÃO** |
| `STOP_R2_SEAL_DIVERGENCE` | **NÃO** (divergência aparente resolvida — `§2.2`) |
| Árvore suja de proveniência desconhecida | **NÃO** |
| Tamanho inexplicado / arquivo histórico alterado | **NÃO** |
| Necessidade de reconstruir evidência | **NÃO** |
| Necessidade de `reset` / `data clear` / reinstalação / toque físico / build remoto | **NÃO** |
| Risco de destruir evidência | **NÃO** |
| Mudança fora de escopo | **NÃO** |
| Falha de gate obrigatório | **NÃO** |

Nenhuma frente independente foi bloqueada. O tablet permaneceu **HANDS OFF** do início ao fim.

### 18.2 `PENDING HUMAN DECISION` — registro completo

Nenhum item abaixo é decidido por agente. Nenhum atribui ao fundador decisão que não esteja
documentalmente concedida.

| ID | Questão | Por que só o fundador decide |
|---|---|---|
| `S0.1` | Reobservar a `R2` Bloco `A` (`1,10,14 v2,15,16`) sobre o binário atual, **ou** aceitar o `PASS` histórico de `92781ea` como suficiente? | `36:94-96` diz que prova colhida sobre binário anterior **não se herda**. Aceitar é decisão; reobservar é execução. **Determina o primeiro bloco de `SF1`** |
| `S0.2` | `R6` — adquirir iPad e telefone físico, **ou** aceitar formalmente a lacuna com o molde de `D-FUND-R1-PEND5`? | `PF6SGA-D1`/`D2` fecham qualquer substituição. Não há caminho técnico |
| `S0.3` | `R1-PEND-1/3/4` — aceitar como lacunas históricas irrecuperáveis? `R1-PEND-2` — fechar por ato formal? | Execução nenhuma resolve `1/3/4`; `2` já está satisfeita e aberta só por proveniência |
| `F3b-ARB-01` | **O congelamento da metade rotação apoia-se em premissa contrariada pelo binário instalado.** `06:304` afirma *"`app.json` declara `orientation: portrait` **global**, **sem override Android**"* — mas `app.json:71` carrega `./plugins/withAndroidTabletOrientation`, que **é** um override Android, e `git merge-base --is-ancestor e2702d2 521d59c` → **EXIT 0** prova que o plugin **está no binário instalado**. Além disso `06:310` condiciona o carimbo a *"**se** a rotação permanecer bloqueada"* — é condicional, não afirmativo | Decidir reclassificaria os casos `2`, `3`, `5` de `NÃO EXECUTÁVEL` para **executáveis**. Muda o conteúdo de `SF1` |
| `F3b-ARB-02` | Multi-janela **nunca foi declarada nem medida**; `36:190` afirma executabilidade sem evidência | Só se resolve no aparelho |
| `F3b-ARB-03` | Caso `5` na variante Android cobre o **objetivo** mas não a **execução literal** (`06:404` × `05:1185`) | A spec não autoriza a substituição |
| `F3b-ARB-04` | Diretórios de evidência de `R3`/`R4`/`R5`/`R7` **não têm nome canônico** — `06:323` fixa apenas `\R1\` | Convenção do responsável (proposta em `§10`) |
| `ARB-CASO14v1` | `CASO 14 v1` = `INEXECUTÁVEL_POR_AUSÊNCIA_DE_WRITER_REPRODUZÍVEL` — **um dos 17 obrigatórios, sem estado terminal, e ausente da matriz do artefato `36`** | Nem `PASS` nem `FAIL`. Proibido fabricar *writer* |
| `ARB-17-OBRIG` | `06:396` diz *"um `FAIL` aqui impede `F6-SG-A`"*; `06:464` diz que o caso *"continua **bloqueando**, porque é um dos 17 obrigatórios"*. **Como se trata um obrigatório em `NÃO EXECUTÁVEL`?** | Conflito literal não resolvido pelo corpus |
| `ARB-ARBITRO` | Estender o árbitro de estado (`compare_state.py`) a `R3`/`R4`/`R5`/`R7`? `DEC:4111` limita-o *"somente de forma prospectiva à campanha `B`–`E`"* | Se estendido, vale o `HARD STOP` de escritor novo (`DEC:4141-4143`) |
| `ARB-R4-NATIVO` | `06:449` afirma *"a camada nativa não mudou"* — premissa **anterior** à troca do binário (`36:94-96`) | Medir antes ou aceitar a premissa é decisão |
| `ARB-R4-REVERSE` | `06:470-471` manda `adb reverse tcp:8081 tcp:8082`, mas o `adb` indexa pela porta **remota**: esse mapeamento **substitui** `tcp:8081 tcp:8081`, não coexiste | Operacionalmente correto; a redação sugere coexistência. Cabe ao responsável confirmar a leitura |
| `ARB-R4-ORFA` | `06:412` exige *"nenhuma obra órfã"* e o `FAIL` fala em obra *"indistinguível"* — **nenhum dos dois termos é definido** no corpus | Sem definição, o critério não é verificável objetivamente |
| `ARB-PROD-SEM-TRACE` | O aceite de `R7` exige *"`production` **comprovadamente sem**"* `PERF_TRACE`, mas **nada diz COMO** provar o lado `production` | O corpus não fornece método |
| `ARB-DEC-4189` | `docs/DECISIONS.md:4189-4193` está **defasado**: ainda diz que o `raw_campaign.log` está *"aberto para escrita pelo `PS3`"* e tem *"apenas hash de prefixo"*. O arquivo está fechado, com *handle* livre e hash íntegro do arquivo completo | `DECISIONS.md` é registro canônico — **não editado por agente nesta missão** |
| `ARB-R1PEND5` | **Contradição material medida** — ver `§18.3` | Matéria de fundador, não de reclassificação |

### 18.3 `R1-PEND-5` — contradição material medida, **não adjudicada**

`06:539-540` (`§7.2`, cabeçalho: *"`RODADA 1` repetida sobre `aa58849` (**2026-08-11**)"*) cita
*"`Start proc: PID 9913` e, no complemento, `Start proc 14015`"* e a linha observada
`MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado`.

**Em disco, medido:**

| Diretório | Arquivo | Bytes | Conteúdo decisivo |
|---|---|---|---|
| `R1` | `raw.log` | 50 877 886 | L330882: `08-10 23:05:01.876 … Start proc 4262:com.valentedev.pequenostracosdefe` |
| `R1` | `shell.log` | 360 | `08-10 23:05:58.286 4262 … [shell] MainTabs MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado` |
| `R1_RETRY_01` | `raw.log` | 1 879 076 | L169: `08-10 23:36:22.944 … Start proc 9913` · L86: `adbd … am start -a android.intent.action.VIEW -d 'pequenostracosdefe://expo-de…'` · 1ª linha: `--------- beginning of main` |
| `R1_RETRY_01` | `shell.log` | 182 | `08-10 23:37:03.849 9913 … MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado` |
| `R1_RETRY_01_SHELL_SUPPLEMENT` | `raw.log` | 1 805 757 | L657: `08-10 23:46:35.335 … Start proc 14015` · L541: mesmo `adbd` do *deep link* · 1ª linha: `--------- beginning of main` |
| `R1_RETRY_01_SHELL_SUPPLEMENT` | `shell_e_erros.log` | 697 | `08-10 23:46:42.113 14015 … MONTADO · montagens #1 · vivos 1/1 · pico 1 · desmontagens 0 · pareado` |

A tabela "Observado" de `§7.2` é sourceada **exatamente** desses três diretórios preservados — a
palavra *"complemento"* mapeia **1:1** no diretório literalmente chamado
`R1_RETRY_01_SHELL_SUPPLEMENT`. Os carimbos de aparelho são de **`2026-08-10`, 23:05–23:47**, não de
`2026-08-11`.

**Ambas as metades de `R1-PEND-5` aparecem materialmente presentes:** os `raw.log` preservados **e** a
evidência da ordem exigida (`--------- beginning of main` = buffer limpo, seguido do *deep link*
URL-encoded).

Isso colide com `D-FUND-R1-PEND5-EVIDENCE-GAP-01` (`docs/DECISIONS.md:4098-4100`), verbatim:
> *"**não foi preservado à época** e é, hoje, **irrecuperável**. **O log não existe mais e nenhuma
> operação pode fazê-lo existir.**"*

**Duas leituras são possíveis** — erro de rótulo de data, **ou** `§7.2` citando evidência de outra
sessão. **Ambas são matéria do fundador.**

> **Eu NÃO declaro `R1-PEND-5` fechada, satisfazível nem reaberta.** Nenhuma evidência foi fabricada,
> retrodatada ou sintetizada. O item permanece `EVIDENCE_GAP_ACCEPTED_BY_FOUNDER` **até que o
> fundador diga outra coisa**. Registrado como `PENDING HUMAN DECISION`.

### 18.4 Defeitos residuais do artefato `36` (registrados, não corrigidos no `36`)

| Local | Defeito |
|---|---|
| `36:282`,`36:299` | `R4` · *"`BUILD?` A definir²"* — **sem lastro**: `06:449-451` e `06:467-472` já respondem: **sem build** |
| `36:281` | Enumeração da metade *resize* de `R3` — nenhuma fonte enumera; é derivável de `06:403`+`06:430` |
| `36:284` | Citação imprecisa — *"artefato `27` `§18` item `6`"*; `27:346` trata de `TK-C-038/041/042/043` (`SG-C`), não de `R6` |
| `36:274` | Bloco `A` descrito como *"`PASS` reais"*; `14:3045` registra `CASO 14 v1` = `INEXECUTÁVEL…` |
| `36` (matriz `§5`) | **Cinco omissões:** `R1` como rodada · eixo nativo sobre a `R1` · `CASO 14 v1` · extensão do árbitro · consolidação dos 17 dentro de `SG-A` |

Todos passam a existir na matriz de `§6` deste artefato. **O texto do `36` não foi alterado** —
correção **aditiva**, por referência cruzada, conforme `§25`.

---

## 19 · PRÓXIMA AÇÃO ÚNICA DO FUNDADOR

> # Responda `S0.1`.

**Uma palavra basta: `REOBSERVAR` ou `ACEITAR`.**

**A pergunta literal:** os casos `1`, `10`, `14 v2`, `15`, `16` da `R2` Bloco `A` têm `PASS` histórico
íntegro, colhido em `92781ea` — **mas sobre um binário que foi substituído**. `36:94-96` estabelece
que *"prova colhida sobre o binário anterior **não se herda** por este eixo"*.

- **`REOBSERVAR`** → `SF1` começa pelo Bloco 1 (cinco reobservações + cadeia de TARs) e só depois vai
  ao *resize* e à `R5`.
- **`ACEITAR`** → o Bloco 1 desaparece, `SF1` começa direto no *resize*, e o item migra da categoria
  `D` para a `F` com **custo zero de execução**.

**Por que esta é a primeira e não outra.** É a única decisão pendente que muda **o primeiro bloco
executado** na primeira sessão física. Todas as demais podem ser respondidas depois sem custo:
`F3b-ARB-01` só é necessária antes do **segundo** bloco de `SF1`; `S0.2` só afeta `SF3`, que talvez
nem exista; `S0.3` **não altera a contagem de sessões** — a `ERRATA-01` já removeu esse trilho da
execução (`36:328`), porque é *"um item que **execução nenhuma resolve**"*.

**Depois da sua resposta**, o próximo passo é abrir `PS0` e rodar o bloco de `§8.1`. Nada no tablet
é tocado até lá.

---

## `HUMAN GATE` FÍSICO — `F6-SG-A` / `SF1`

> **Este é o portão humano real, não artificial.** Ele está imediatamente antes da primeira ação
> física da campanha (`am force-stop`, gesto 1 de `§9`).
>
> **O trabalho host-side está esgotado:** baseline verificada · lacre reconferido · inventário
> recursivo completo (`350`/`694 141 406`/`6`) · `ERRATA-01` auditada pela redação original ·
> `POWER_SAFE` precisado · matriz residual de 34 itens construída sem dívida fantasma · campanha
> física preparada com comandos, *checkpoints*, `PASS`/`FAIL`/`STOP` e roteiro humano fechado ·
> `SG-B` pré-mapeado.
>
> **Nada foi executado no aparelho. Nenhum build foi gerado. Nenhum portão foi concedido.**

---

### `F6-SG-A` = `NÃO CONCEDIDO`
### `F6-SG-B` = `NÃO CONCEDIDO`
### `R2_PROSPECTIVE_BE` = `PASS` *(inalterado)*
### `R2_RAW_CAMPAIGN_LOG_SEALED_AND_HASHED` *(precisão de `ERRATA-02`; rótulo histórico preservado no artefato `35`)*
### `SF1` = `AGUARDANDO S0.1 E AUTORIZAÇÃO DO FUNDADOR`
