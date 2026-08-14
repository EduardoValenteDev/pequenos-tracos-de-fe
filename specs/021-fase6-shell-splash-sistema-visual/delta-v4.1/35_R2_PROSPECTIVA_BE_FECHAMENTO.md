# `35` · FECHAMENTO FORMAL DA `R2` PROSPECTIVA · BLOCOS `B`–`E` · 2026-08-14

> **Veredito consolidado por este documento:**
> ## `R2_PROSPECTIVE_BE = PASS`
>
> **Vereditos auxiliares lacrados aqui:**
> `CASE12_TWO_FILL_DEVIATION = SCOPE_DEVIATION_NONBLOCKING` ·
> `CASO 9 = NÃO REPRODUZIDO` / `NÃO BLOQUEIA` ·
> `CASE12_PANEL_DEFECT = HOST_TOOL_DEFECT`
>
> **Decisão do fundador que este documento ancora:**
> [`D-FUND-R2-BE-CLOSURE-01`](../../../docs/DECISIONS.md)
>
> **Origem prospectiva desta campanha:** `D-FUND-R2-CONTINUITY-01` **+**
> [artefato `30`](30_CURRENT_BASELINE_R2_PROSPECTIVE_ORIGIN.md) **+** o `HEAD` daquela transição.
>
> **Custódia das evidências (fora do repositório):**
> `C:\tmp\ptf_evidencias\R2_PROSPECTIVE_BE_01\`

---

## 1 · Natureza deste documento

Este artefato é um **fecho**, não uma nova medição. Ele consolida vereditos **já produzidos e já
reportados**, e lacra o acervo que os sustenta.

Para produzi-lo: **nenhum gesto físico no aparelho**, nenhum `force-stop`, nenhum `logcat -c`,
nenhuma restauração de TAR, nenhuma edição de código de produto, nenhuma reexecução de caso. As
únicas leituras novas foram `SHA256`/tamanho de arquivos **no HOST**.

O aparelho permanece **`HANDS OFF`** no canvas de *Haja luz*, exatamente onde a reabertura do
`CASO 12` o deixou.

---

## 2 · Veredito da campanha `B`–`E`

| Caso | `TK` · §28.1 | Título canônico | Bloco | Veredito | Veredito lacrado em |
|---|---|---|---|---|---|
| `CASO 7` | `TK-A-069` · #7 | *Background* e *foreground* | `B` | **`PASS`** | `out/VEREDITO_CASO7.txt` |
| `CASO 8` | `TK-A-070` · #8 | Centro de Controle | `B` | **`PASS`** | `out/VEREDITO_CASO8.txt` |
| `CASO 6` | `TK-A-068` · #6 | Reabertura após fechar o app | `C` | **`PASS`** | `out/VEREDITO_CASO6.txt` |
| `CASO 11` (histórico) | `TK-A-073` · #11 | Obra modificada e salva no formato novo | `D` | **`PASS`** | `out/VEREDITO_CASO11.txt` |
| `CASO 11` (reexecução causal) | `TK-A-073` · #11 | idem, após a correção do esquema | `D`/`G` | **`PASS`** | `out/VEREDITO_CASO11_REEXEC_CAUSAL.txt` |
| `CASO 17` | `TK-A-079` | Eixos lógicos atravessando o ponteiro | `D` | **`PASS`** | `out/VEREDITO_CASO17_TK-A-079.txt` |
| `CASO 12` | `TK-A-074` · #12 | Falha durante a gravação nova | `E` | **`PASS`** · cobertura `CASO12-PARCIAL-01` · estágio físico **`E0`** | `out/ARBITRAGEM_CASO12_TENTATIVA_01.txt` |

**Nenhum `FAIL` aberto nos blocos `B`, `C`, `D` e `E`.** As quatro invariantes `ZERO` — perda de
pixel, associação de tinta a *lineart* errado, promoção destrutiva, abertura silenciosa em branco —
permaneceram **intactas em todos os casos medidos**.

> ### `R2_PROSPECTIVE_BE = PASS`

---

## 3 · Limites da afirmação do `CASO 12` — registro literal

Estes doze pontos são o **alcance exato** do `PASS` do `CASO 12`. Nenhum deles pode ser omitido ao
citar aquele veredito.

1. O *watcher* foi disparado pelo **✓ Pronto!**.
2. O *kill* efetivo ocorreu em **`UP+117 ms`**.
3. O **salvamento havia iniciado**.
4. A morte ocorreu **antes de `T2`** — antes da criação do *blob* novo.
5. O estágio observado foi **`E0`**.
6. A **última geração válida permaneceu íntegra**.
7. `CK-E-C12` é **byte a byte idêntico** a `CK-D-C17`.
8. **Nenhuma geração parcial foi promovida.**
9. **O amarelo não persistir é comportamento compatível com `PASS`** — a tinta que morreu com o
   processo era a tinta que ainda não havia chegado ao disco.
10. **`E1` e `E2` não foram fisicamente exercitados.**
11. Os **quatro estágios injetados continuam `NÃO EXECUTADOS`**, conforme `CASO12-PARCIAL-01`.
12. **É proibido ampliar esta conclusão para "todos os pontos de falha foram testados".**

> ⛔ **O que o `CASO 12` prova é uma coisa só, e ela é estreita:** que uma morte de processo
> ocorrida **no primeiro terço da transação de salvamento** não destrói a geração anterior e não
> promove nada pela metade. Ele **não** prova o comportamento sob *blob* truncado (`E1`) nem sob
> ponteiro já promovido com *blob* antigo ainda vivo (`E2`).

---

## 4 · Desvio dos dois preenchimentos

> ### `CASE12_TWO_FILL_DEVIATION = SCOPE_DEVIATION_NONBLOCKING`

**Fundamento — os quatro fatos, e apenas eles:**

1. **Ambos os preenchimentos ocorreram ANTES do armamento** do gatilho.
2. **Nenhum dos dois chegou ao disco.**
3. **O disparo foi inequivocamente o ✓ Pronto!** — provado pela assinatura exclusiva de geometria
   `1440x2161` da `RNCWebView`, que na campanha inteira ocorre em três rajadas e em nenhuma outra
   situação.
4. **O segundo preenchimento foi induzido por instrução ambígua do painel** — defeito da
   ferramenta HOST, não conduta do operador (§5).

O desvio é **de escopo, não de causalidade**: ele não entra na cadeia que produz o veredito. Por
isso é registrado, e por isso **não** rebaixa o `PASS`.

---

## 5 · Defeito do painel — ferramenta HOST, não produto

**Classificação: `HOST_TOOL_DEFECT`.** O defeito está em `tools/caso12_host_v3.ps1`, instrumento de
condução da campanha. **Não é defeito do produto e não gera requisito de produto.**

**Causa medida.** Duas linhas do painel `v3`, ausentes na `v2`:

- a linha *"O GATILHO AINDA NAO ESTA ARMADO. Pode tocar na tela normalmente."*;
- a tabela de deixas por relógio fixo, que em `T+80` reinstruía *"UM UNICO preenchimento na FAIXA
  MAIS BAIXA (azul escuro)"* — uma ação **já concluída em `T+12`**.

**Especificação da correção — preservada, NÃO aplicada:**

1. o painel deve exibir **três estados nomeados e mutuamente exclusivos**:
   **`PREPARAÇÃO`** → **`MÃOS FORA`** → **`VERMELHO / GATILHO ARMADO`**;
2. cada deixa pertence a **exatamente um** estado e **nunca** é reemitida depois de cumprida;
3. o painel **nunca mais exibe instrução genérica de "pode tocar na tela"** — a autorização de
   toque é sempre **nominal e única**.

**Por que não corrigir agora:** a ferramenta **não será reutilizada nesta campanha**. Corrigir um
instrumento que não voltará a rodar seria custo sem informação.

`caso12_host_v3.ps1` **não foi editado** e permanece lacrado em
`3A56EF310A795A80D7B91BEBF090E0561C5DDB5B38163426965908755E6CA920` — ele é, agora, **evidência da
execução**, e uma edição silenciosa destruiria essa qualidade.

> ⛔ Este parágrafo **não** reabre o `CASO 12`, **não** repete sua execução e **não** cria requisito
> de produto.

---

## 6 · `CASO 9` — `TK-A-071` · §28.1 #9

> ### `CASO 9 = NÃO REPRODUZIDO` · `NÃO BLOQUEIA`

`onRenderProcessGone` **não apareceu espontaneamente** em nenhum momento da campanha. Varredura do
log integral (`raw_campaign.log`) por `onRenderProcessGone`, `RenderProcessGone`, `render process`,
`renderer process`, `RENDER_PROCESS`, `WebViewRenderProcess` e `AwContents.*gone`: **zero
ocorrências**.

- **Não foi provocado.**
- **Nenhuma causa foi inventada.**
- **Não é `PASS` e não é `FAIL`** — é ausência de ocorrência espontânea, e é registrada como tal.

---

## 7 · Acervo selado

Custódia em `C:\tmp\ptf_evidencias\R2_PROSPECTIVE_BE_01\`. **Nada foi movido, restaurado ou
reescrito.** Os totais abaixo foram medidos no HOST em **2026-08-14 20:21**.

| Subdiretório | Arquivos | *Bytes* |
|---|---|---|
| `acervo/` | 18 | `311 344 128` |
| `logcat/` | 4 | `86 011 055` |
| `tools/` | 12 | `77 181` |
| `out/` | 66 | `440 372` |
| `extract/` | 238 | `293 840 557` |

### 7.1 `acervo/` — cadeia de TARs

| Arquivo | *Bytes* | `SHA256` |
|---|---|---|
| `TAR-BE-PRE.tar` | `17234944` | `07397955542235F9FDA6FA48D3BE3101E7BBF68F2DF95F7B8BE8D0EDB3EC2987` |
| `TAR-ABORT-NAV-01.tar` | `17234944` | `2AC05C599858450A357B253A0DCAAED6D1DE4B64D55445DEA6CA2D602D51C9AB` |
| `TAR-BE-PRE2-POSTMOUNT.tar` | `17234944` | `2AC05C599858450A357B253A0DCAAED6D1DE4B64D55445DEA6CA2D602D51C9AB` |
| `TAR-B-C7-PRE.tar` | `17234944` | `2AC05C599858450A357B253A0DCAAED6D1DE4B64D55445DEA6CA2D602D51C9AB` |
| `CK-B-C7.tar` | `17234944` | `897BA348F5BE860004D19F3113C871ED6EB8140184ED0A11438D43DB555D4CB1` |
| `TAR-B-C8-PRE.tar` | `17234944` | `897BA348F5BE860004D19F3113C871ED6EB8140184ED0A11438D43DB555D4CB1` |
| `TAR-B-C8-PRE2-ROT.tar` | `17234944` | `897BA348F5BE860004D19F3113C871ED6EB8140184ED0A11438D43DB555D4CB1` |
| `CK-B-C8.tar` | `17234944` | `897BA348F5BE860004D19F3113C871ED6EB8140184ED0A11438D43DB555D4CB1` |
| `TAR-C-3.tar` | `17234944` | `897BA348F5BE860004D19F3113C871ED6EB8140184ED0A11438D43DB555D4CB1` |
| `TAR-C-PRE.tar` | `17234944` | `897BA348F5BE860004D19F3113C871ED6EB8140184ED0A11438D43DB555D4CB1` |
| `CK-C6.tar` | `17234944` | `58E09A225CA29CC97C99CDB7A33EC5E3D1990F2CFEB310A686240680C41A2B17` |
| `TAR-D-C11-PRE.tar` | `17234944` | `58E09A225CA29CC97C99CDB7A33EC5E3D1990F2CFEB310A686240680C41A2B17` |
| `CK-D-C11.tar` | `17416192` | `13C86C06CA09DE446C35677B5D78B0E749A4CFAB20596DE9B9C181B1D5FE2A21` |
| `TAR-E-POSFIX-PRE-RELOAD.tar` | `17416192` | `13C86C06CA09DE446C35677B5D78B0E749A4CFAB20596DE9B9C181B1D5FE2A21` |
| `REF-F-ENTRADA-REEXEC-C11.tar` | `17419264` | `E230CA55639F29E5E95E4D7AD0FC58DDFB9AA39C4EF9543E5C6F45BE520AF976` |
| **`CK-D-C17.tar`** | `17424384` | **`B931383B8FF3574F57A443310FE1AEC56D3D226ADB94DB49C04D03E523AF93F7`** |
| **`CK-E-C12.tar`** | `17424384` | **`B931383B8FF3574F57A443310FE1AEC56D3D226ADB94DB49C04D03E523AF93F7`** |
| **`CK-G-REEXEC-C11.tar`** | `17424384` | **`B931383B8FF3574F57A443310FE1AEC56D3D226ADB94DB49C04D03E523AF93F7`** |

**Coincidências de `SHA256` são resultado medido, não erro de tabela.** Elas provam **inércia
causal**: onde dois pontos consecutivos da cadeia têm o mesmo *hash*, o que aconteceu entre eles
**não escreveu no acervo**. A coincidência mais importante é a última linha tripla —
`CK-D-C17` = `CK-E-C12` = `CK-G-REEXEC-C11`: o disco não mudou **um único byte** desde `17:40:23`,
atravessando a morte de processo do `CASO 12` e a reabertura subsequente.

### 7.2 `logcat/`

| Arquivo | *Bytes* | `SHA256` |
|---|---|---|
| `raw.log` | `10569390` | `88CF5EE000AE9D969E459B6EB2293751857A6BCCA3A97CE01E6508524146D43C` |
| `raw_gap_recovery.log` | `11501399` | `230D2966C1CD08E1E361216761742DCC57CE647EE14E2F9BFA5CCC2E4FC81C04` |
| `PS3_PID.txt` | `5` | `D581BC565DFDC3E26FC755512E848245DDE53709195048A76D3E789B3FD1B0AC` |
| **`raw_campaign.log`** | `63979073` **e crescendo** | ver ressalva abaixo |

> ⚠️ **Ressalva honesta sobre `raw_campaign.log`.** O `PS3` **continua capturando** (PID de HOST
> `27288`, vivo desde `13:35:42`), e o arquivo está **aberto para escrita**. Ele **não pode receber
> `SHA256` definitivo** enquanto isso for verdade. O que existe é o *hash* de um **prefixo**:
> `SHA256` dos **primeiros `63 979 073` *bytes***, lidos em `2026-08-14 20:21:48` com
> `FileShare.ReadWrite` =
> **`421C2B947A747CDD1F2FF0E3DD338280EDEDB2D72D47A549EC8BA2DAE3E7C73F`**.
> O lacre definitivo desse arquivo exige encerrar o `PS3` com `Ctrl+C` — ato **não autorizado por
> esta missão** e portanto **não executado**. O log **nunca foi limpo** (`logcat -c` = 0 vezes).

### 7.3 `tools/` — instrumentos

| Arquivo | *Bytes* | `SHA256` |
|---|---|---|
| **`compare_state.py`** | `4380` | **`A7649DD2B92C7877ADAF12635E032DBC559F4074558B572CA1EDF8A9821EFDFD`** |
| `case_arbitration.py` | `7660` | `51C5835E4053679EB53D92DF2CD6D2B8D61B7A7F030A0F7159C9163F20A534D6` |
| `entry_arbitration.py` | `8273` | `E9035F862F6C55E8C7E226A93674F902FC1D75AAF47DF82FE5AA32D08D8178BE` |
| `postmount_arbitration.py` | `5575` | `EC08FE369DDFA915BAC1DD3B8EAFBD28B0D6666CD275E892D6E3536BF3A494CD` |
| `paint_colors.py` | `3677` | `DD9D15F058935D17DF7EC9640FB326B4BD43FD1747EAD149A479485ACBBF833C` |
| `tempos_caso.py` | `3215` | `1941C2CD1E34CBA7F305A44BD9E624D6D13D321093D5DABEA86904AF33F875BF` |
| `caso12_host.ps1` | `10189` | `F6BC7255E3EC1C4F9E08351613E7AF8916F696E99212DEE85770EFC9B1CC39E8` |
| `caso12_host_v2.ps1` | `14832` | `E20A50D6FA720204CD0038E37608FB82B0EEF8F913C027F1C5469E20A518A935` |
| `caso12_host_v3.ps1` | `17042` | `3A56EF310A795A80D7B91BEBF090E0561C5DDB5B38163426965908755E6CA920` |
| `caso12_launch_v2.ps1` | `491` | `79C1BA1D8E76C0F5FE67B489B953D83CE72FFCCB84A3154DDE9D2604D0E448A4` |
| `caso12_launch_v3.ps1` | `494` | `DEA87482E7A87787A7E57B6511EB7BEAFD3374B67033BBA78975D8FB39D8402A` |
| `cronometro.ps1` | `1353` | `5E6FE381D1C3C06BDE47972267E576EE577F631AE7A1568432A65DFB7DDA4F39` |

**`compare_state.py` permanece LACRADO e nunca foi editado.** Seu `SHA256` foi conferido **antes e
depois de cada invocação**, e bate com o valor canônico de `D-FUND-R2-PROSPECTIVE-STATE-ARBITER-01`.

### 7.4 `out/` — vereditos, preregistros e transcrições

| Arquivo | *Bytes* | `SHA256` |
|---|---|---|
| `VEREDITO_CASO7.txt` | `11892` | `2EC5D116BC05D8B9B51B9238938B3350F71A0A3C646AF8C05033495CA05F9CF6` |
| `VEREDITO_CASO8.txt` | `15755` | `87323FA574E4B0847071348FFCB2D577612CF702FCA07E6E6A35CD865B2D51F6` |
| `VEREDITO_CASO6.txt` | `23687` | `0EEA92B01848C5D5C3EB688F84A834DCFC5A0825F7D2DD3C7E415484BE5617FA` |
| `VEREDITO_CASO11.txt` | `18256` | `F17634CD74022E5618BCFB18839104C6D97CA7F3226AA034548565A4EB0E3667` |
| `VEREDITO_CASO11_REEXEC_CAUSAL.txt` | `12487` | `46AD2404017C343A855930A15745F879FAA76C1151B77B2B3D72A832634FAEA9` |
| `VEREDITO_CASO17_TK-A-079.txt` | `15272` | `EE4BFB56573ADB1AF5F94350C83A2D32D4144C7EE557B0A66C1579BC0DEE0EB0` |
| `ARBITRAGEM_CASO12_TENTATIVA_01.txt` | `30705` | `8D113F8FDB4AC291793211F57B56562B7CE98B2D64F643E96E821AB0F12E0FCF` |
| `ARBITRAGEM_RELOAD_E_REENTRADA_C11.txt` | `16515` | `34890D37BE2D394CE8B505730555F0D50F91EB9582A3B1C8EFCABE19833CC2C1` |
| `OCORRENCIA_CASO12_TENTATIVA_01_INTERROMPIDA.txt` | `3766` | `6B4AE223798E610196127779E21A5FF50D26306D2DB1DA5B9F0BC1F07DB32159` |
| `PREREGISTRO_CASO11.txt` | `8850` | `DBD94F9FE45DE3FDF75F428569FDEEE87DD9A88976569F333F3AF6BC3591E29C` |
| `PREREGISTRO_CASO11_ADENDO_01.txt` | `8635` | `F2D265AD962CF2BF30B345C0B420448EFFB80F29B156531337E0945F1BA721C1` |
| `PREREGISTRO_CASO12_TK-A-074.txt` | `13564` | `C0DD92BC7B2C5AF5F351A320A53ECE8DA3AFE8CD812968CD8651A77BFD80A87B` |
| `PREREGISTRO_CASO12_TEMPORAL_V2.txt` | `12756` | `F79337D9F6A2D402209AF76A0304A740D71D39319F9396802DE4CB929FFA3833` |
| `PREREGISTRO_CASO17_TK-A-079.txt` | `4982` | `99D854FBEB811A3ACEECFBCB24FF4B210303D173D766D1F2CF0FB268A182E5BC` |
| `HOST_CASO12_TRANSCRIPT.txt` | `2671` | `8C3511BA8A6BEA0C8EDF13933E0C9ADE1177FB660A01DFD3086B0DA248E151F1` |
| `HOST_CASO12_WATCHER.txt` | `216` | `670574EA38123BDBE8A5DD8CF209E3D013C1CC643B6E05C78B1B45CD1F77BED6` |

Os demais **50** arquivos de `out/` — saídas do comparador (`CMP_*`, `ARB_*`), provas de estado
prospectivo (`PV6`–`PV9`, `PV13`), leituras de cor e região (`CORES_*`, `REGIOES_*`), roteiros,
marcas de início e o registro do incidente de rotação pré-`C8` — permanecem no mesmo diretório,
**íntegros e não editados**.

---

## 8 · Estado do produto e do repositório

- **Código de produto:** **nenhuma alteração** produzida por este fechamento.
- A **correção funcional do esquema** continua sendo, e permanece exclusivamente, o *commit*
  **`2ffcd829fe4f35d526bb643abc0cf4044346b238`** — *"fix(f6): persistir os campos logicos do
  payload atraves do ponteiro do Colorir 60"*. Ela **não é reescrita, não é reagrupada e não é
  reassinada** por este artefato.
- **Sem *push*, sem *merge*, sem *amend*, sem *rebase*, sem *squash*.**
- Evidências **fora do repositório**, e assim permanecem.

---

## 9 · O que este artefato **NÃO** concede

- **Não** concede `F6-SG-A`. **`R2_PROSPECTIVE_BE = PASS` é diferente de `F6-SG-A = PASS`** — e a
  diferença é material, não formal: está inventariada no
  [artefato `36`](36_RECONCILIACAO_FECHAMENTO_FASE_6.md).
- **Não** concede `F6-SG-B`, `F6-SG-C`, `F6-SG-D`, `SD-1`, `R1` nem `F6_CLOSED`.
- **Não** fecha `R1-PEND-1..4`.
- **Não** promove nenhum `PASS` histórico da `R2 · Sessão 2` a `PASS` prospectivo.
- **Não** declara `E1`, `E2` ou os quatro estágios injetados do `CASO 12` como exercitados.
- **Não** converte `CASO 9` em `PASS`.
- **Não** autoriza *build*, `EAS`, instalação, nova campanha física ou qualquer gesto no aparelho.

---

> ### `R2_PROSPECTIVE_BE = PASS`
