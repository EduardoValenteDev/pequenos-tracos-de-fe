# Relatório de `F6-SG-C` — `TK-C-046`

> **Pacote:** `BLOCO 6` · `F6-SG-C` · **Commit deste artefato:** `C-GOV1` ·
> **Mudança de código esperada:** **nenhuma**.
>
> **Este relatório NÃO concede o subportão.** Ele entrega a base de decisão ao fundador, com
> o que está provado, o que não está, e o que só ele pode decidir.

---

## 1. Veredito

# ⛔ `F6-SG-C` **NÃO CONCEDIDO**

Três razões independentes, qualquer uma delas suficiente:

1. **O critério de ENTRADA de §27 não está cumprido.** `F6-SG-C` exige **`SG-B` concedido**;
   `SG-B` exige **`SG-A` concedido**; e `F6-SG-A` está **NÃO CONCEDIDO**, com
   `R1-PEND-1..5` abertas (artefato `14`). Todo o trabalho de `F6-R1` foi executado
   **antecipadamente** em relação à sua própria porta de entrada. Isso foi deliberado e é
   legítimo como preparação — mas **não** vira concessão.
2. **A validação física de `F6-SG-C` não começou.** Seis tasks (`TK-C-038`..`TK-C-043`)
   estão **PENDENTES**, e nenhuma propriedade visual ou de *layout* nativa pode ser
   promovida por automação.
3. **`SD-1` é NÃO CONCEDÍVEL** enquanto `TK-C-062` estiver pendente (emenda `A-13`).

---

## 2. Critérios de saída de §27, item a item

| Critério de §27 | Estado | Onde |
|---|---|---|
| `R1.1`–`R1.4` implementados | ✅ **em código** — 28 *commits*, de `6b78b34` a `da16b18` | árvore |
| `G-RSP-1..4` verdes | ✅ `[4544]` · `[4928]`/`[4929]` · `[4545]`/`[4548]` · `[4940]` | artefato `22` §1.1 |
| `G-SID-1`, `G-SID-2`, `G-SID-3` verdes | ✅ `[4933]` · `[4934]` · `[4935]` | artefato `22` §1.1 |
| As **6 restrições de §19.1** cumpridas | ⚠️ **5 de 6** — ver §3 | artefato `23` §3 |
| `MT-7`–`MT-11`, `MT-15`, `MT-16` observados falhando e revertidos | ✅ **e mais**: as **14** mutações de `R1` | artefato `22` §2 |
| **`SD-1`** nos quatro casos | ❌ **NÃO CONCEDÍVEL** — casos 1 e 3 por herança de configuração, caso 2 por equivalência, **caso 4 implementado e provado por prebuild, não por aparelho** | artefatos `21`, `23` §1 |
| **`SD-2`**, **`SD-3`**, **`SD-4`** com captura | ❌ **sem captura** — `TK-C-039`..`TK-C-043` pendentes | artefato `23` §2 |
| **`SD-9`** (Split View e Slide Over) | ❌ **sem aparelho** — exige iPad | artefato `23` §2 |
| Vídeo do tour em telefone **e** iPad, alvos da barra medidos | ❌ **sem aparelho** (nenhum dos dois) | artefato `23` §1 |
| `CN-1`, `CN-5`, `CN-6` verdes | ⚠️ **parcial** — a metade estática está verde; a metade **perceptual** de cada um é física e não foi executada. `CN-5` ainda não tem asserção dedicada (dono: `TK-C-027`) e hoje é carregado por `G-SID-4` | artefatos `17` §6.1, `19` |
| ***Build*** nativo único gerado e validado | ❌ **não gerado** — `RD-4` agrupa as mudanças nativas num único *build* ao fim de `R1`; ele ainda não existe | artefato `23` §2.1 |
| *Smoke* e *doctor* verdes | ✅ *smoke* **4942/4942**, *doctor* **18/18**, `bundle:check` `EXIT=0` | artefato `22` §1 |
| **Aprovação explícita** do fundador | ⏸️ **não solicitada** — este relatório é a base dela | — |

---

## 3. As seis restrições de §19.1

| # | Restrição | Portão | Estado |
|---|---|---|---|
| 1 | Fonte canônica única (`tokens.js`) | `G-SID-2` | ✅ |
| 2 | Nenhum novo *hardcode* distribuído | `G-SID-2` | ✅ |
| 3 | Nenhum *design system* paralelo | `G-RSP-4` | ✅ (inventário: artefato `23` §4) |
| 4 | Largura estrutural **nunca** como substituto de medição | `G-SID-3` | ✅ |
| 5 | Composição **distinta** em `600–899` e `>=900` | `SD-4` + **captura em `SG-C`** | ❌ **a captura não existe** |
| 6 | Telefone compacto sem regressão | `CN-1` | ⚠️ estática ✅ · perceptual ❌ |

A restrição 5 é a única que a própria §19.1 amarra a **captura física**. Ela está
implementada (`navSidebarRole` entrega `rail` na média e `full` na expandida) e provada
estaticamente — mas o critério pede a captura, e a captura não existe.

---

## 4. O que `F6-R1` entregou, e que continua valendo mesmo sem a concessão

| Entrega | Efeito verificável |
|---|---|
| **`useWindowBand`** — faixa única | 10 pontos de composição migrados; `BANDS` declarado em **um** arquivo; `Dimensions.get` erradicado (`G-RSP-1`) |
| **Quatro arquétipos** — Hub, Editorial, Immersive, Game | contrato + `TA-14` (21 cláusulas e mutantes internos); adoção nas telas de escolha e de leitura |
| **`Q4` resolvida** | `grid` e `displayScaleTablet` deixaram de ser `P-82`/`P-148` e ganharam consumidor real (`G-RSP-2`) |
| **`Q9` cumprida além da renomeação** | `navSidebarRole`/`navSidebarWidth` declaram o **cruzamento papel × faixa**, não uma constante movida |
| **Barra lateral** — defeitos 1–3 de §19 corrigidos | `G-SID-1..4`; os cinco `registerGuideTarget` preservados; **nenhum destino novo** (`D4`) |
| **`D2` lacrado** | idioma de aparelho não decide *layout* em `src` (`G-RSP-3`), provado vermelho **antes** de a orientação ser discutida |
| **Rota (C) de orientação** | qualificador `sw600dp`, sem dependência nova, sem código de tela; **geração provada por prebuild** |
| **12 portões novos ou confirmados** | cada um com **prova vermelha independente** — 14 de 14 |

---

## 5. Decisões que são do fundador, não minhas

### 5.1 A rota condicional de PLAN §33 — **NÃO ESCOLHIDA**

O PLAN registra duas rotas e diz explicitamente que **não escolhe**:

- **(i)** conceder `SG-C` **somente após** validação em tablet Android físico;
- **(ii)** conceder `SG-C` com o caso 4 **implementado e provado por *build*, porém não
  validado fisicamente**, com o vão **explicitamente registrado** e revalidação
  obrigatória quando houver aparelho.

**Nenhuma task deste delta escolhe, e este relatório também não.** Registro apenas que a
rota (ii), se escolhida, ainda **não estaria satisfeita hoje**: ela pede prova por
***build***, e o *build* nativo não foi gerado. A compilação AAPT2 da referência
`@integer/screen_orientation` — inteiro **negativo** num atributo de formato enum —
**nunca foi exercitada**, porque não há SDK Android nesta máquina. É no primeiro *build*
que ela fecha ou falha alto.

### 5.2 Duas premissas documentais defasadas, entregues sem correção unilateral

| Onde | O que está escrito | O que é fato |
|---|---|---|
| `TK-C-062` | "hoje **não tem aparelho disponível** (`P8`)" · estado `PENDENTE — SEM APARELHO` | O **tablet Android existe** (SM-X510, em uso). Quem **não** existe é o **iPad** e o **telefone Android real**. O rótulo aponta o aparelho errado — mas o `PENDENTE` continua correto, por outras duas razões (artefato `23` §1) |
| PLAN §20.3 | custeia a rota (C) como "cria `plugins/`, hoje inexistente" | `plugins/withPrivacyManifest.js` já era versionado e órfão antes de `e2702d2` (artefato `20` §9.1) |

Nos dois casos **não** alterei o texto normativo. Corrigir premissa de PLAN ou de TASKS por
iniciativa própria seria reorganizar o roteiro sem portão humano.

---

## 6. Estado dos arquivos — com a distinção exigida

| Estado | Arquivos |
|---|---|
| **Commitado** (28 *commits*, `6b78b34`..`da16b18`, branch local `feat/fase6-shell-splash`) | todo o código de `F6-R1`, os portões em `scripts/smoke.js`, `plugins/withAndroidTabletOrientation.js`, `app.json`, e os artefatos `15`–`21` |
| **Salvo no disco · untracked** | `specs/.../22_PROVAS_VERMELHAS_CONSOLIDADAS_F6_SG_C.md` · `specs/.../23_VERIFICACOES_FINAIS_E_FISICA_PENDENTE_F6_SG_C.md` · `specs/.../24_RELATORIO_F6_SG_C.md` (este) |
| **Modificado** | nenhum |
| **Staged / indexado** | **nenhum** — nenhum `git add` ocorreu até a redação desta linha |
| **Enviado ao remoto** | **NADA.** Zero *push*, zero *merge* — a branch local está à frente do remoto e assim permanece até autorização explícita |

As **14 mutações** foram revertidas com `git checkout --` e **nenhuma** foi commitada.
Árvore limpa ao fim de cada uma e ao fim da série.

---

## 7. Riscos reais que ficam abertos

| # | Risco | Por que é real |
|---|---|---|
| 1 | **A ordem de *mods* que faz a rota (C) funcionar é propriedade da versão `@expo/config-plugins@54.0.5`** | Se ela se inverter, `withOrientation` escreve depois, apaga a referência, e o tablet volta a travar em retrato **sem erro nenhum**. Nada dentro de um *mod* observa o que roda depois dele. Obrigação registrada no cabeçalho do *plugin* |
| 2 | **AAPT2 nunca viu a referência** | Inteiro negativo em atributo de formato enum. Se recusar, o **primeiro *build*** falha — no lugar certo, antes de qualquer aparelho, mas ainda assim é um risco não retirado |
| 3 | **Três das seis tasks físicas dependem de aparelho que não existe** | iPad (`TK-C-041` Split View, `TK-C-043` §28 #16) e telefone Android real (`TK-C-038`). As outras três dependem do *build* nativo. `SD-9` e §28 #16 são iPad **por definição** — nenhum tablet Android os cobre (`D-1`) |
| 4 | **`CN-5` não tem asserção dedicada** | Hoje é carregado por `G-SID-4`; o dono canônico (`TK-C-027`) não a criou. Registrado no artefato `17` §6.1, não reaberto |
| 5 | **`F6-SG-A` continua não concedido com `R1-PEND-1..5` abertas** | Todo `F6-R1` está construído sobre uma porta que ainda não abriu |

---

## 8. Próximo ponto causal

`TK-C-062` e as seis tasks físicas convergem para **um único gatilho**: o **primeiro
*build* nativo** de Fase 6 (`RD-4`). Ele é, ao mesmo tempo, a prova de compilação da rota
(C) e a precondição de `TK-C-039`/`TK-C-040` no SM-X510.

**Não gero esse *build*.** Gerar EAS *build* exige gate de bundleabilidade verde (está) **e**
decisão do fundador sobre quando a Fase 6 consome uma rodada nativa — e a orientação
vigente proíbe antecipar `eas.json`, `package.json` e dependência de orientação.

---

## 9. Referências

`TK-C-036`..`TK-C-046`, `TK-C-062` · PLAN §19.1, §20.3, §27, §28, §33 · `SD-1`..`SD-4`,
`SD-9`, `SD-11` · `CN-1`, `CN-5`, `CN-6`, `CN-11` · `Q4`, `Q9` · `RD-4`, `RG-9`, `RG-10`,
`OR-6` · `P8` · emendas `A-08`, `A-12`, `A-13`, `A-16` · artefatos `14`, `17`, `19`, `20`,
`21`, `22`, `23`.
