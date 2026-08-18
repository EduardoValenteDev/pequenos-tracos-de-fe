# SF1 · Vídeo 2 · POS, reconciliação e HARD STOP do caso 10

**Data:** 2026-08-18

## 1 · Evidência recebida e divergências humanas

O audiovisual permanece sob custódia do fundador e não foi recebido pelo agente. O fundador
atestou ausência de branco, erro, desalinhamento, perda de pintura ou falha de abertura.

Divergências de roteiro, preservadas sem normalização retroativa:

1. em `A Criação`, tocou brevemente `Continuar história`, abriu a primeira cena, voltou e seguiu
   para `Colorir com o Beni`; não concluiu cena;
2. em `Minhas artes` / `Desenho de fé`, abriu primeiro `Visualizar` e depois `Editar`; em `Editar`
   não desenhou, apagou, usou ferramentas, salvou, concluiu ou limpou.

## 2 · Lacres PRE×POS

```text
PRE RKStorage ........ 030850B6F4D79BAD4D2F0EAD049CF67E07EDB41404A144CDED71865BE490CF9A
POS RKStorage #1 ..... F7C2A5851B596A46F7CD2E1643F35EE6935072ECCFF03D2800F1DB3121DADF3E
POS RKStorage #2 ..... F7C2A5851B596A46F7CD2E1643F35EE6935072ECCFF03D2800F1DB3121DADF3E
PRE TAR .............. B87C0349F242EAFA06696F50CFB6585F81ED807C1433593A7DC22610FFFD4C31
POS TAR .............. B380F5A1367695DBAA422843416F6E1C55900E8F3827CC5C2603363FB6F4BE56
POS logcat ........... 2009E693D9CB7378E02C78CCB5AC83EEB108D2ED43B27119589E994A48D718E1
```

As duas capturas POS são idênticas: o estado final estava estável. Evidência no host em
`C:\tmp\ptf_f6_video2_ready`.

## 3 · Produto e acervo

- As 28 chaves e todos os 28 valores lógicos do RKStorage são idênticos PRE×POS.
- `@ptf_progress_creation` permaneceu exatamente com cenas `1..10 = true`; o toque em
  `Continuar história` não mudou progresso.
- O índice e o payload de `art_1786479103982_6079` permaneceram idênticos, inclusive
  `createdAt == updatedAt == 2026-08-11T20:11:43.982Z`, `schema:2` e `stateJson v:2`.
- Preview legado: `FDC5529619201C3CC24CFC719DA719047DE9A65E827A8FD934644205D9E1E248`.
- Thumb legado: `A5FB5908353A0E8D23C537AF2711C214D6E35F2048FD0281A60F3242A48910DE`.
- Ponteiro C60 `@ptf_drawing60_screation_alight` permaneceu idêntico: `v:3`, `fmt:2`,
  `paintSchemaVersion:1`, `layoutVersion:1`, `logicalW:1122`, `logicalH:1402`, `rev:2`.
- Blob C60 light permaneceu idêntico:
  `E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1`.
- Nenhum arquivo foi criado ou removido; os três blobs do acervo mantiveram bytes e tamanho.

## 4 · Diferença proibida e causa fechada

`databases/RKStorage` mudou fisicamente, apesar da igualdade lógica:

- 49.152 B em ambos;
- 110 bytes distintos, em oito faixas;
- contador SQLite `93→94` e `version-valid-for 93→94`;
- sem página livre, `integrity_check = ok`;
- a única diferença no dump é a posição física da linha
  `@ptf_criar_livre_orientation_seen_v1:star = '1'`.

Causa demonstrada no HEAD: abrir uma obra não vazia em `Editar` faz `onHist(!empty)` chamar
`hideOrientation()`, que chama `markOrientationSeen(profileId)` e executa
`AsyncStorage.setItem(key, '1')` mesmo quando o valor já era `'1'`
(`AtelierCanvasScreen.js:221-225`, `criarLivreOrientation.js:29-34`). A divergência humana de abrir
`Editar` explica a transação, mas não a torna leitura pura.

Quatro diferenças adicionais são infraestrutura de cold start/WebView já pré-registrada:
`profileInstalled`, `ActivityThread.IDS.xml`, `recentyopenedapps.xml` e
`WebViewChromiumPrefs.xml`. Não houve `FATAL EXCEPTION`, crash ou erro React Native relevante no
logcat.

## 5 · Reconciliação dos casos

| Caso | Resultado | Fundamento |
|---|---|---|
| `1` | `PASS` | atestação externa: pintura presente/alinhada/não branca; blob C60 intacto |
| `14 v2` | `PASS` | obra v2 abriu sem erro/desalinhamento; payload e blobs legados idênticos |
| `15` | `PASS` | payload visual abriu e foi enquadrado sem erro; valores lógicos intactos |
| `16` | `PASS` | ponteiro v3 e blob C60 permaneceram byte a byte idênticos |
| `10` | **`FAIL`** | requisito literal de bytes persistidos idênticos violado por reescrita automática no RKStorage |

## 6 · Gate

```text
VIDEO_2_FUNCTIONAL_VISUAL ........ PASS por atestação externa + lacre do acervo
CASO_10_LEITURA_PURA ............. FAIL
MUTACAO_SEM_CAUSA ................ NÃO · causa localizada
MUTACAO_PROIBIDA ................. SIM · abertura de Editar reescreveu RKStorage
READY_FOR_VIDEO_3 ................ NÃO
HARD_STOP ........................ ATIVO
```

Nenhuma correção, restauração ou repetição foi executada. O tablet permanece no estado POS.
