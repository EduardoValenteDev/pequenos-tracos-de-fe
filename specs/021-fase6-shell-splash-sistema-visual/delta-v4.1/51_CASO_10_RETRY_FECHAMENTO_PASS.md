# Caso 10 · retry prospectivo · fechamento PASS

**Data:** 2026-08-18

Este registro preserva integralmente a tentativa contaminada dos artefatos `47`/`48` e encerra
somente o retry prospectivo iniciado no artefato `49`.

## Cadeia causal

```text
PRE_RETRY / C60 ........ B380F5A1367695DBAA422843416F6E1C55900E8F3827CC5C2603363FB6F4BE56
CK-C10-C60 ............. B380F5A1367695DBAA422843416F6E1C55900E8F3827CC5C2603363FB6F4BE56
CK-C10-FRONTEIRA ....... B380F5A1367695DBAA422843416F6E1C55900E8F3827CC5C2603363FB6F4BE56
TAR-C10-POST ........... 77A4D15ED234DE286C382E4B962E1AA6F39671BB3324D1F4C66F3DB5ADB729FA
```

- **Metade C60:** `PASS`; TAR integral byte-idêntico.
- **Fronteira:** `PASS`; TAR integral byte-idêntico.
- **Metade Ateliê:** `PASS` sob `AC-1`/`AC-2` prospectivamente declaradas.

## AC-1 / AC-2

Na janela `CK-C10-FRONTEIRA × TAR-C10-POST`:

- 28 chaves antes e depois;
- zero chave adicionada, removida ou com valor alterado;
- `MAX_ROWID 95→96`;
- exatamente um movimento:
  `@ptf_criar_livre_orientation_seen_v1:star`, rowid `95→96`, valor `'1'` idêntico;
- exatamente um arquivo alterado: `databases/RKStorage`, 49.152 B em ambos;
- `integrity_check = ok` antes e depois;
- nenhum arquivo criado ou removido;
- payload, `stateJson`, índice, metadados, preview, thumbnail, ponteiro C60 e todos os blobs
  permaneceram byte-idênticos.

Assinatura observada = `AC-1` exata; alteração física = `AC-2` exata. Nenhum escritor fora de
`AC-1`/`AC-2` apareceu.

## Veredito

```text
C10_C60_HALF ........... PASS
C10_FRONTIER ........... PASS
C10_ATELIE_HALF ........ PASS
AC_1_AC_2_STATUS ....... SATISFEITAS EXATAMENTE
CASO_10_RETRY .......... PASS
CASO_10_FINAL_STATUS ... PASS PELO RETRY PROSPECTIVO
ATTEMPT_VIDEO2 ......... STOP histórico preservado · não convertido em PASS
```

Evidência no host:

- `C:\tmp\ptf_f6_video2_ready\PRE_RETRY_C10_RX2XC003LTJ`;
- `C:\tmp\ptf_f6_video2_ready\CK_C10_C60_RX2XC003LTJ`;
- `C:\tmp\ptf_f6_video2_ready\CK_C10_FRONTEIRA_RX2XC003LTJ`;
- `C:\tmp\ptf_f6_video2_ready\POST_C10_ATELIE_RX2XC003LTJ`.
