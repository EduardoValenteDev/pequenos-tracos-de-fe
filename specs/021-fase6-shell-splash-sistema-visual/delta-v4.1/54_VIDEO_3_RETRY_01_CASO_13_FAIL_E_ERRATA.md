# Vídeo 3 · retry 01 · Caso 13 FAIL · errata do roteiro

**Data:** 2026-08-18  
**Dispositivo:** SM-X510 · `RX2XC003LTJ`  
**Contexto:** B · rollback `a190b3efe8827f92274a27d2163a51f6fd9bc0d9`

## Evidência humana

O fundador concluiu `VIDEO_3_RETRY_01`. A evidência audiovisual permanece sob custódia do
fundador e não foi recebida pelo agente.

- `Colorir com o Beni` estava em 1/3; o CTA `Ver minha coleção` não existia;
- o card `Haja luz` abriu, mas sem a pintura previamente armazenada;
- nenhuma pintura, ferramenta, gravação ou conclusão foi executada;
- `Minhas artes`: 1 item;
- `Resumo da criança`: 10 estrelas, 10 cenas e demais indicadores visíveis zerados.

## Errata rastreável do roteiro

O roteiro do artefato `52` pressupôs incorretamente que `Ver minha coleção` estaria disponível
no Contexto B. O CTA só existe quando as três atividades C60 estão concluídas; o estado real tinha
somente `Haja luz` concluída. A ausência do CTA é **esperada para 1/3**, não desvio humano nem
defeito. O fundador agiu corretamente ao não forçar rota inexistente.

## PRE_RETRY × POS

```text
RKStorage PRE A/B = 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
RKStorage POS A/B = 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
```

As 28 chaves e todos os valores permaneceram byte-idênticos. Os 14 arquivos persistentes
continuam presentes. As únicas diferenças do escopo capturado foram cache de bundle, perfil do
runtime e lista de projeto recente do dev launcher, consequências esperadas da troca A → B.

Inventário de produto, byte-idêntico:

```text
Ateliê index .......... 1 item · Desenho de fé · art_1786479103982_6079
Ateliê preview ........ FDC5529619201C3CC24CFC719DA719047DE9A65E827A8FD934644205D9E1E248
Ateliê thumbnail ...... A5FB5908353A0E8D23C537AF2711C214D6E35F2048FD0281A60F3242A48910DE
C60 light pointer ...... v=3 · fmt=2 · rev=2 · paintSchemaVersion=1 · layoutVersion=1
C60 light state ........ done=true · ever=true · snap=ready
C60 light blob ......... 386.880 B
C60 light blob SHA256 .. E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1
```

## Causa visual de `Haja luz`

O logcat do rollback registra, na abertura da obra:

```text
[COLORING_STATE] saved state invalid/incompatible — healing (clear + fresh)
[Coloring60] arte guardada não aplicável; abrindo lineart limpo
```

Portanto:

1. o pointer e o blob foram encontrados e preservados;
2. o leitor anterior recusou o payload lógico produzido pelo código novo;
3. a superfície apresentou lineart limpo no lugar da pintura existente;
4. nenhuma mutação persistente ocorreu.

Esse é o comportamento causal procurado pelo Caso 13, cujo contrato exige que o rollback consuma
a representação anterior e não deixe obra órfã. A pintura ficou visualmente órfã no Contexto B,
embora seus bytes tenham sobrevivido. Pelo critério explícito de `G7` — obra que aparece em branco
— o Caso 13 é `FAIL`.

## Inventário e CN-2

- `Minhas artes = 1` coincide com o índice persistente real;
- `Cenas = 10` coincide com `@ptf_progress_creation`, cenas 1..10 verdadeiras;
- `Estrelas = 10` e demais indicadores zerados foram observados pelo fundador, sem mutação de
  RKStorage durante o retry;
- `CN-2 "antes"` possui evidência externa sob custódia do fundador, mas o agente não recebeu a
  captura comparativa A × B; seu estado permanece `PENDENTE DE COMPARAÇÃO HUMANA`, não fabricado
  como `PASS`.

## Veredito

```text
VIDEO_3_RETRY_01 ............ CONCLUÍDO COM ACHADO CAUSAL
CASO_13 ..................... FAIL
COLLECTION_CTA_ABSENCE ...... ESPERADA EM 1/3 · ERRATA DO ROTEIRO
C60_LIGHT_UNCOLORED ......... DIFERENÇA CAUSAL DO CASO 13 · FAIL
RKSTORAGE_CHANGED ........... NÃO
NEXT ........................ HARD STOP · NÃO AVANÇAR AO VÍDEO 4
```

Evidência técnica no host:
`C:\tmp\ptf_f6_video3_ready\POS_VIDEO3_RETRY_01_RX2XC003LTJ`.
