# Errata aditiva ao artefato 47 · contrato dono do Caso 10 e PRE de retry

**Data:** 2026-08-18

O artefato `47` permanece integralmente preservado como registro do primeiro julgamento. Esta
errata corrige sua classificação depois da consulta à fonte dona; não o reescreve.

## 1 · Fonte dona e contrato

A cadeia normativa aplicável é `14_R2_SESSAO_2.md` §24, incorporada prospectivamente por
`38_SF1_BLOCO_1_REOBSERVACAO_BLOCO_A.md` §7.5. Ela supera a leitura simplificada de
`10_RODADA_FISICA_2_F6_SG_A.md`:

- o Caso 10 tem **duas metades obrigatórias**, `C60` e `ATELIÊ`;
- a metade C60 exige zero escrita de produto;
- a metade Ateliê usa a rota `Brincar` → `Minhas artes` → `Editar` e admite, somente sob
  delimitação prospectiva, `AC-1`: reescrita idempotente de
  `@ptf_criar_livre_orientation_seen_v1:star = '1'` com um movimento de rowid;
- `AC-2` admite `databases/RKStorage` alterado exclusivamente como efeito físico de `AC-1`;
- isso não relaxa nenhum byte de payload, índice, ponteiro, versão, blob ou metadado funcional.

Logo, `Editar` é requerido na metade Ateliê. `Visualizar` sozinho não satisfaz o Caso 10. A
reescrita observada no Vídeo 2 coincide exatamente com escritor já caracterizado e autorizado; não
é `STOP_PRODUCT_DEFECT`.

## 2 · Reclassificação da tentativa do Vídeo 2

O `FAIL` do artefato `47` é reclassificado, somente prospectivamente por esta errata, como
**`STOP` por instrumentação contaminada**: faltaram os checkpoints obrigatórios
`TAR-C10-PRE → CK-C10-C60 → CK-C10-FRONTEIRA → TAR-C10-POST`, portanto a execução conjunta
não permite adjudicar separadamente as duas metades e a fronteira. O resultado histórico não vira
`PASS` e permanece preservado.

`38:354-355` manda, diante de comparação falsa, parar e reexecutar o Caso 10 isolado antes de
adjudicar `FAIL`. Retry prospectivo é permitido sem restauração, usando o POS como nova baseline.

## 3 · PRE prospectivo lacrado

O app permaneceu vivo e em foreground, sem nova interação humana. Nenhuma restauração, limpeza
ou abertura adicional foi feita. O POS do Vídeo 2 e o novo PRE são byte-idênticos.

```text
PRE_RETRY_RK_1 ........ F7C2A5851B596A46F7CD2E1643F35EE6935072ECCFF03D2800F1DB3121DADF3E
PRE_RETRY_RK_2 ........ F7C2A5851B596A46F7CD2E1643F35EE6935072ECCFF03D2800F1DB3121DADF3E
PRE_RETRY_TAR ......... B380F5A1367695DBAA422843416F6E1C55900E8F3827CC5C2603363FB6F4BE56
POS_VIDEO2_EQUALS_PRE . TRUE
```

Evidência: `C:\tmp\ptf_f6_video2_ready\PRE_RETRY_C10_RX2XC003LTJ`.

## 4 · Execução por estágios

Para preservar atribuição causal, o retry não pode ser executado inteiro entre duas capturas. O
próximo ato seguro é somente a metade C60. Depois dela, o fundador para sem nova interação e o
agente colhe `CK-C10-C60`. A fronteira e a metade Ateliê serão liberadas apenas após esse gate.
