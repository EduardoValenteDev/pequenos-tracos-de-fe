# Vídeos 7–8 · GH4/GH5 e PRE do salvamento consuntivo final

**Data:** 2026-08-18

## Vídeo 7 · GH4

O fundador declarou ter executado integralmente o roteiro. A evidência audiovisual permanece sob
custódia do fundador e não foi recebida pelo agente. O log técnico registra `INJ-06`, `INJ-07` e
`INJ-08`, cada uma seguida por `RST-TUDO` e `INS-02` sem backup pendente. O snapshot comparável
fechou com 7 chaves e 4 blobs idênticos; os dois achados eram órfãos preexistentes, não mutações.

Resultado: `VIDEO_7_RETRY_01 = PASS`; `GH4_INJ_06/07/08 = PASS`.

## Vídeo 8 · GH5

O fundador declarou ter executado integralmente o roteiro. A evidência audiovisual permanece sob
custódia do fundador e não foi recebida pelo agente.

- `INJ-01` elegeu `creation/light · logicalUri`, substituiu temporariamente o blob lógico por
  2.400 bytes não-PNG e foi restaurada;
- `INJ-02` apontou somente `logicalUri` para `_F6H_INEXISTENTE.png`, preservou `uri` e ambos os
  blobs reais, e foi restaurada;
- ambas terminaram com `RST-TUDO` e zero backups pendentes;
- PRE × POS: 7 chaves e 4 blobs idênticos; único achado, thumbnail órfão preexistente do Ateliê.

Resultado: `VIDEO_8 = PASS`; `GH5_INJ_01/02 = PASS`; mutação inesperada = não.

## `ARB-28-7-TEXTO` fechada

Decisão do fundador: `SECTION_28_7_REQUIRES_SAVE = SIM`. §28 `#7 ∪ #9` será satisfeito por **um
único salvamento consuntivo final**, nunca por dois salvamentos separados.

Consumidores obrigatórios anteriores do formato legado concluídos: Caso 10, Caso 13 no rollback,
E6/GH1, metades reversíveis de §28 #7 e #9 e GH4. GH5 consome C60; GH6 foi retirado do roteiro por
inércia medida; GH7 é opcional, de autorização nominal, e atua sobre C60. Não resta consumidor
obrigatório que dependa de `art_1786479103982_6079` ainda em v2.

## PRE final

```text
RKStorage SHA256 (2x) ....... 3ef363066ce5bad4e484cf15ab26cd98c4a4535776d3171c678c0e3e95241069
obra ........................ art_1786479103982_6079
schema ...................... 2
registro bytes .............. 19.590
preview bytes ............... 89.593
preview SHA256 .............. fdc5529619201c3cc24cfc719da719047de9a65e827a8fd934644205d9e1e248
thumbnail bytes ............. 14.730
thumbnail SHA256 ............ a5fb5908353a0e8d23c537af2711c214d6e35f2048fd0281a60f3242a48910de
backups harness ............. 0
```

Mutação esperada do ato final: atualização explícita e única do item da obra, sua representação
visual e metadados de gravação para o formato corrente; o índice pode atualizar metadados/ordenação.
Nenhuma chave ou obra adicional deve surgir. C60 e demais estados protegidos devem permanecer
byte-idênticos.
