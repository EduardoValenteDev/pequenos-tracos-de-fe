# Execução ampliada SG-A · GH8, E1/E3 e preflight R7

**Data:** 2026-08-18
**Entrada:** `76f3d5c6be2582c3d6d0cfac0146f076ef3e69b5`

## 1 · Sweep das lacunas GH8

| Requisito literal | Owner | Evidência existente | Recuperável hoje? | Estado |
|---|---|---|---|---|
| zero backups e `INS-02` limpo | `39` · GH8-1 | GH4/GH5 terminaram com `RST-TUDO`, `INS-02` e zero backups | já satisfeito | `PASS` material |
| nenhum resíduo indevido | `39` · GH8-2 | inventário final sem backup pendente; C60 dual intacto | parcialmente | representação `.b.png` é agora intencional por `bff8b5c`; expectativa antiga de inexistência é `NÃO APLICÁVEL` |
| schema corrente | `39` · GH8-3 | leitor pós-save registrou ramo lógico; L05 prova promoção | já satisfeito materialmente | `PASS` material |
| `INS-03 + SNP-DIFF` contra `INS-01` | `39` · GH8-4 | PRE/POS e hashes por blocos, mas não o artefato nominal agregado | não retrospectivamente | lacuna histórica; não PASS |
| `TAR-R5-DEPOIS` + hash + listagem | `39` · GH8-5 | hashes dirigidos do RKStorage e blobs no L05 | não no instante histórico | lacuna histórica; não PASS |
| `raw.log` único e contínuo GH0→GH8 | `39` · GH8-6 | logs parciais lacrados por tentativa | não | lacuna histórica irrecuperável; não PASS |
| encerrar câmera e registrar descontinuidade | `39` · GH8-7 | vídeos sob custódia do fundador e término declarado | documentalmente reconciliado | satisfeito no limite da custódia externa |
| voltar ao canônico 8081 | `39` · GH8-8 | app parado; reverse 8081→8081; HEAD/worktree registrados | sim e já provado | `PASS` material |

Resultado preservado: `GH8 = TERMINAL COM LACUNAS · NÃO PASS`. Nenhuma das três provas históricas
ausentes é reconstruída ou convertida em PASS. Nenhuma depende de código novo ou hardware; elas
dependem do instante já encerrado.

## 2 · E1

```text
OWNER ............... TK-A-100 · F6-R3.5 / F6-SG-A
CONTRACT ............ obra nova criada e reaberta na mesma janela; quatro invariantes ZERO
PREREQUISITES ....... matriz obrigatória 1–17 concluída no alcance executável
CURRENT_EVIDENCE .... harness/testes automáticos verdes; nenhuma execução física própria adjudicada
REQUIRED_ACTION ...... criar obra nova, salvar, reabrir sem mudar a janela e comparar
```

O contrato exige confirmação em aparelho e acervo real. Análise estática, smoke e o retry do Caso
13 não substituem essa ação: o Caso 13 salvou estado C60 existente e testou rollback, não criou a
obra-controle de E1. `E1_STATUS = PHYSICAL_ACTION_PREPARED`.

## 3 · E3

```text
OWNER ............... TK-A-102 · F6-R3.5 / F6-SG-A
CONTRACT ............ dez ciclos consecutivos de rotação com obra complexa
PREREQUISITES ....... TK-A-036 + matriz obrigatória 1–17
CURRENT_EVIDENCE .... ciclos isolados e resize passaram; nenhuma série adjudicada de dez ciclos
REQUIRED_ACTION ...... comparar visualmente o primeiro e o décimo retorno
```

O gate `G-CVS-1` e os testes locais provam a política matemática, mas a fonte dona exige captura
física obrigatória. `E3_STATUS = PHYSICAL_ACTION_PREPARED`.

## 4 · §28 #8

Permanece `NÃO EXECUTÁVEL NO PRODUTO CORRENTE`, sem PASS ou FAIL. A governança permite carregá-lo
explicitamente até o Human Gate: os 17 casos obrigatórios da matriz são família distinta, enquanto
os casos adicionais não bloqueiam automaticamente; o residual não pode ser omitido.

## 5 · R7 / T090 / P-139

Owner: protocolo `06` §2.4 e R7; `T090/F-PERF/P-139` é complemento obrigatório do Human Gate.

Preflight realizado:

- `eas.json`: `preview` é interno, Android APK, não é dev client e liga somente
  `EXPO_PUBLIC_PTF_PERF_TRACE=1`; `production` não declara a flag;
- `performanceTrace.js`: schema 2, terminal `first_layout` ou `ceiling`, memória limitada, zero
  rede/AsyncStorage/FileSystem/analytics;
- credencial EAS válida para `eduardocriacao`; projeto acessível;
- previews Android existentes `eb1bad08` e `51bc7e68`: expirados e anteriores à instrumentação;
  não reutilizáveis;
- `npm run verify:runtime`: PASS; bundle Android 2.381 módulos; smoke `4967/4967`;
- `npx expo-doctor`: `17/18`, somente divergência conhecida de patch (`expo 54.0.36` versus
  `54.0.37`; `expo-file-system 19.0.23` versus `19.0.24`), sem atualização autorizada.

Um novo preview Android é necessário. Ele não foi disparado porque a ordem congelada exige R5
inteira antes de gerar/instalar o preview, e E1/E3 ainda aguardam ação física. Depois deles: gerar
`eas build --platform android --profile preview`; antes de instalar, backup somente-leitura válido;
instalação somente com `adb install -r`; nunca desinstalar ou usar `pm clear`; então executar T090,
P-139 e áudio no SM-X510. O build Development não satisfaz R7.

## 6 · Recontagem e Launch Readiness

Ledger decisório S0 antes: 7 itens — `EVIDENCE_GAP_ACCEPTED=1` (R1-PEND-5) e
`PENDENTE_HUMAN_GATE=6` (R1-PEND-1..4 + duas classes de hardware R6).

Ledger decisório S0 depois: 7 itens — `EVIDENCE_GAP_ACCEPTED=6` (R1-PEND-1/3/4/5 + iPad + telefone)
e `SATISFEITO_POR_EVIDENCIA=1` (R1-PEND-2). Zero decisão S0 pendente.

Universo funcional preservado:

- matriz 17: `PASS=15`, `PASS_PROSPECTIVO_COM_FAIL_HISTORICO=1` (Caso 13),
  `NAO_APLICAVEL=1` (Caso 9 não reproduzido); variante 14-v1 separada como `NAO_EXECUTAVEL`;
- §28: `PASS=10`, `NAO_EXECUTAVEL=1` (#8), `EVIDENCE_GAP_ACCEPTED=1` (#17/R6),
  `FORA_DO_SG_A=5` (#12–#16);
- extras E1–E6: `PASS=2`, `NAO_EXECUTAVEL=1`, `NAO_APLICAVEL=1`,
  `PENDENTE_EXECUTAVEL=2` (E1/E3);
- histórico de tentativas: `FAIL=1` (Caso 13 histórico) e `STOP_HISTORICO=4` (Caso 10 contaminado,
  Vídeo 3 tentativa 1, Caso 13 rollback tentativa 1 e Vídeo 7 tentativa 1).

No cross-check de Launch Readiness, S0.2 e S0.3 ficam fechados nesta execução; R6 fica aceito com
gap; §28 #8 não executável; E1/E3 e R7 ainda bloqueiam SG-A. Privacidade, termos, Restore Purchase,
Kids Category, nome, Data Safety, Nutrition Label, assets, screenshots, metadata e builds de
distribuição permanecem nos owners futuros existentes. Nenhum requisito novo foi criado.

## 7 · Condição de parada

`STOP_PHYSICAL_ACTION`: a próxima prova causal é E1 + E3 no Development Build. Todo preparo local
independente possível foi concluído. R7 não pode ultrapassar esse ponto sem violar a ordem R5→R7.
