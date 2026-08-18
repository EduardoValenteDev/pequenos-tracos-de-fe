# R7 · Attempt 04 · POS, PASS prospectivo e Human Gate de SG-A

**Data:** 2026-08-18
**Build:** `a5981b54-5f28-42ad-918a-9196217b5c7c`
**APK SHA-256:** `FE7F071D8269A4CD66D202654BE73AA932FCAF14BD2D12619A368693CCD67E6E`

## 1 · Evidência física recebida

O fundador declarou que executou integralmente o roteiro do Attempt 04, que todos os
testes tiveram êxito e que tudo ocorreu conforme esperado. A evidência audiovisual
permanece sob custódia do fundador e não foi recebida pelo agente.

No limite dessa atestação, ficaram confirmados:

- abertura direta do preview release sem Metro ou development launcher;
- rotação retrato → paisagem → retrato sem perda da superfície;
- narração de `Haja luz` audível;
- `Colorir com o Beni` e o card C60 `Haja luz` presentes;
- canvas de `Haja luz` carregado, sem a UI de erro do Attempt 03;
- pintura C60 existente visível, sem fallback para lineart limpo;
- `Desenho de fé` preservado em `Minhas artes`, aberto somente em visualização;
- nenhuma ação de editor, canvas, paleta, ferramenta, `✓ Pronto!`, apagar ou salvar.

Isso não reescreve o histórico: Attempts 01–03 mantêm seus estados originais.

## 2 · POS técnico e log lacrado

No POS imediato:

- device `RX2XC003LTJ`, único elegível, estado `device`;
- app em foreground, `MainActivity` retomada, PID `31178`;
- package `com.valentedev.pequenostracosdefe`, versão `1.0.0`/`1`;
- `ceDataInode=137433` e `deDataInode=127446`, preservados;
- tablet acordado e novamente em retrato (`orientation=0`);
- tela final: `Minhas artes`, conforme o roteiro humano;
- release não-debuggable: RKStorage/pointer/blobs privados continuam não aferíveis
  diretamente por `run-as`; não se fabrica comparação byte a byte.

Captura dedicada:

```text
arquivo .... C:\tmp\ptf_r7_attempt_04_evidence\t090-p139-attempt-04-logcat.txt
bytes ...... 3.702.458
SHA-256 .... 6271385582F818455419291C39D1139DF16CEF31F8302A68E0797948B17D21FA
```

O log não contém `FATAL EXCEPTION`, `[shell]`, `PAINT_INVALID`, healing, fallback para
lineart limpo, `Erro ao abrir o desenho` ou `Unable to load script`. O aviso Samsung
`Activity could not be started` às `20:12:54.406` pertence ao mecanismo antecipatório
`Active launch` do sistema; o toque real do launcher aparece em seguida, às
`20:12:54.504`, com `result code=0`, processo criado e Activity exibida. Não é falha de
inicialização do app.

O log também prova as duas mudanças de configuração físicas:

- `20:13:06.949`: `ROTATION_90`, paisagem;
- `20:13:15.797`: `ROTATION_0`, retrato.

## 3 · P-139 e T090

Uma única amostra foi emitida e aceita pelo parser canônico
`scripts/perf-baseline-report.js`; nenhuma foi descartada:

```json
{"schema":2,"terminal":"first_layout","route":"Home","fontReason":"loaded","routeReason":"end","fontGateMs":23,"routeDecisionMs":5,"splashReactMs":792,"firstLayoutMs":1174,"profileHydrationMs":24,"progressHydrationMs":29,"packsHydrationMs":3,"bufferDropped":0}
```

Reconciliação do contrato:

| Item | Resultado |
|---|---|
| schema 2 | PASS |
| terminal `first_layout` ou `ceiling` | PASS · `first_layout` |
| teto terminal de 12 s | PASS · terminal em `1174 ms` |
| rota `Home` | PASS |
| campos obrigatórios numéricos | PASS |
| `bufferDropped=0` | PASS |
| preview com trace habilitado | PASS · build/perfil periciados |
| production sem trace | PASS · cerca estática/mutante preservada |
| zero telemetria externa | PASS · implementação local/logcat |
| discriminação runtime | PASS · ausência de `[shell]` e dev launcher |
| regressão perceptível no cold launch | NÃO OBSERVADA pelo fundador |

`P139_STATUS = PASS`.
`T090_STATUS = PASS`.
`R7_ATTEMPT_04 = PASS PROSPECTIVO`.
`R7_STATUS = PASS`, preservados os estados históricos dos Attempts 01–03.

## 4 · Balanço de SG-A após R7

O último bloqueador material executável foi fechado. O ledger permanece honesto:

- matriz de compatibilidade de 17 IDs: 15 `PASS`, Caso 13 com `FAIL` histórico e
  `PASS` prospectivo, Caso 9 `NÃO REPRODUZIDO` não bloqueante;
- §28: dez `PASS`; #8 `NÃO EXECUTÁVEL NO PRODUTO CORRENTE`; #17/R6 com evidence gap
  aceito; #12–#16 pertencem a SG-B/SG-C;
- E1–E6: quatro `PASS`, um `NÃO EXECUTÁVEL`, um `NÃO APLICÁVEL`;
- R1: PASS formalizado com evidence gaps históricos aceitos;
- R6: evidence gap aceito, sem fabricar PASS de iPad ou telefone Android;
- GH8: terminal com lacunas históricas, nunca convertido em PASS;
- SD-8: honrado no alcance executado; nenhuma perda/corrupção de obra foi observada;
- §28 #8, GH8 e os gaps aceitos continuam explícitos e não viram PASS.

Não resta execução técnica de SG-A capaz de fechar os itens acima sem fabricar prova,
habilitar funcionalidade ausente ou adquirir hardware já dispensado pelo fundador.

## 5 · Human Gate final

O corpus exige decisão humana explícita; este documento não concede o subportão.

Opções legítimas:

1. `F6-SG-A = CONCEDIDO COM RESIDUAIS EXPLÍCITOS`: aceita o encerramento do alcance
   executável e os gaps já listados, sem convertê-los em PASS. Isso libera o início do
   ciclo SDD de `F6-SG-B / F6-R2 · Map Geometry Foundation`.
2. `F6-SG-A = NÃO CONCEDIDO`: mantém `OR-1` ativo e bloqueia qualquer task `TK-B-*`.

Estado atual:

```text
R7 ....................... PASS
T090 ..................... PASS
P139 ..................... PASS
F6-SG-A .................. AGUARDANDO HUMAN GATE FINAL
F6-SG-B .................. NÃO CONCEDIDO
FASE 6 ................... ABERTA
```

## 6 · Ratificação posterior do fundador

O fundador escolheu expressamente a opção 1:

```text
F6_SG_A .................. CONCEDIDO_COM_RESIDUAIS_EXPLICITOS
SG_A_MATERIAL_SCOPE ...... ESGOTADO NO ESCOPO EXECUTÁVEL
F6_SG_B .................. ABERTO PARA O CICLO SDD · NÃO CONCEDIDO
NEXT ..................... F6-SG-B / F6-R2 · Map Geometry Foundation
FASE 6 ................... ABERTA
```

A concessão não modifica o ledger acima. §28 #8, GH8, evidence gaps, FAILs e STOPs históricos
mantêm literalmente suas classificações. `OR-1` está satisfeito para iniciar as tasks `TK-B-*`,
mas nenhuma implementação de SG-B começa sem seu ciclo SDD completo.
