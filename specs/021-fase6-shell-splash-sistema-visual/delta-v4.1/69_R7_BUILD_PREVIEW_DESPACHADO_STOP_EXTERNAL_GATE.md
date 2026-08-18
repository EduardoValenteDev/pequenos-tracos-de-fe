# R7 · build preview despachado · STOP_EXTERNAL_GATE

Data: 2026-08-18
Baseline documental: `3fe9814ec4194336e66f9e78527455356ea22168`
Baseline executável contida: `bff8b5c`
Escopo: F6-SG-A · R7 · T090 · P139

## 1 · Pré-condições satisfeitas

- E1 e E3: `PASS`, formalizados no artefato 68;
- `npm run verify:runtime`: `PASS` (`bundle:check` Android, 2.381 módulos; smoke `4967/4967`);
- `npx expo-doctor`: `17/18`, divergência conhecida de alinhamento de patch, sem atualização;
- perfil `preview`: distribuição interna, APK, sem dev client e com `EXPO_PUBLIC_PTF_PERF_TRACE=1`;
- credencial Android remota existente: `Build Credentials sY31pjNJH0 (default)`;
- nenhum pedido de custo, assinatura ou nova credencial foi apresentado;
- app físico permaneceu parado; nenhum APK foi instalado e nenhum dado do tablet foi alterado.

## 2 · Despacho remoto

```text
BUILD_ID ............ 3a0ee8c6-dbe2-4e8d-8498-88d1cc1664d0
PLATFORM ............ ANDROID
PROFILE ............. preview
DISTRIBUTION ........ INTERNAL
SDK ................. 54.0.0
GIT_COMMIT .......... 3fe9814ec4194336e66f9e78527455356ea22168
FINGERPRINT ......... 21e4500a30350da9482727b5451b309b1cf15e16
ACTOR ................ eduardocriacao
STATUS .............. IN_QUEUE
```

O primeiro comando local expirou antes do upload e não criou build. A repetição concluiu o upload e
criou exatamente o build acima. A listagem remota confirmou ausência de build duplicado novo.

## 3 · Classificação e limite

Após aferições consecutivas, o provedor manteve o build em `IN_QUEUE`, sem APK ou URL de artefato.
Logo ainda não é possível:

1. declarar o build `PASS`;
2. baixar e calcular SHA-256 do APK;
3. conferir o manifesto/binário resultante;
4. preparar instalação in-place e roteiro físico de T090/P139 com artefato identificado;
5. classificar T090 ou P139.

Classificação: `STOP_EXTERNAL_GATE`. O bloqueio é exclusivamente o build remoto ainda não
materializado. Não é defeito de produto, decisão humana, falha de E1/E3 nem autorização para usar
um preview antigo. Quando o build terminar, a continuação mínima é baixar e lacrar o APK, validar o
artefato e então parar em `STOP_PHYSICAL_ACTION` com um único roteiro humano R7. Instalação,
abertura e teste físico não ocorreram neste bloco.

## 4 · Estado SG-A nesta parada

- matriz de compatibilidade (17 IDs): `PASS=15`, `PASS_PROSPECTIVO_COM_FAIL_HISTORICO=1`,
  `NAO_REPRODUZIDO_NAO_BLOQUEANTE=1`;
- §28: `PASS=10`, `NAO_EXECUTAVEL=1` (#8), `EVIDENCE_GAP_ACCEPTED=1` (#17/R6),
  `FORA_DO_SG_A=5`;
- extras E1–E6: `PASS=4`, `NAO_EXECUTAVEL=1`, `NAO_APLICAVEL=1`;
- R1: `PASS FORMALIZADO COM EVIDENCE GAPS HISTORICOS ACEITOS`;
- R6: `EVIDENCE_GAP_ACCEPTED_BY_FOUNDER`, sem PASS de iPad ou telefone Android;
- GH8: `TERMINAL COM LACUNAS · NAO PASS`;
- R7/T090/P139: pendentes deste gate externo e da validação física posterior;
- §28 #8: `NAO EXECUTAVEL NO PRODUTO CORRENTE`, nunca convertido em PASS.

SG-A não está pronto para Human Gate enquanto R7/T090/P139 não forem concluídos. Fase 6 permanece
aberta; SG-B, SG-C e SG-D não foram iniciados nesta execução.
