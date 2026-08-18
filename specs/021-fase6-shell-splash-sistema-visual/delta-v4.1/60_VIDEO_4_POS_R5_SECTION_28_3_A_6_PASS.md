# Vídeo 4 · POS · R5 §28 #3–#6 PASS

**Data:** 2026-08-18

**HEAD:** `9037e60bebf068dbaacd4dd430dfafb593128103`

**Contexto:** A · Metro 8081 · harness não · SM-X510 `RX2XC003LTJ`

## 1 · Execução humana observada pelo fundador

O fundador informou execução integral do roteiro, sem divergências:

- pintura e primeiro traço alinhados após rotação;
- segundo traço executado após a rotação;
- painel rápido sem perda de estado;
- background de aproximadamente 60 segundos e retorno por recentes preservando rota/canvas;
- tela dividida, resize e retorno à tela cheia sem recorte destrutivo;
- nenhum toque em `✓ Pronto!`, nenhum salvamento, limpeza, desfazer ou borracha;
- nenhum gesto após o encerramento do vídeo.

O audiovisual permanece sob custódia do fundador. O agente não recebeu o vídeo.

## 2 · Evidência técnica POS

O PID da tentativa foi `24166`. O log isolado registra:

- carregamento lógico válido da pintura: `load OK espacoLogico=1122x1402`;
- primeiro toque de tinta em retrato e segundo toque após rotação;
- resize para `2304×1440` e depois para a janela dividida `1145×1356`;
- `onHostPause`/`onHostResume` no ciclo de background;
- `superfície → segundo plano/sem foco (gesto fechado no modelo; nenhuma escrita, nenhum descarte)`;
- `superfície → primeiro plano (nenhuma releitura, nenhuma reaplicação)`;
- ausência de `saveDrawing`, `writeSlot`, `markColoring60ActivityDone`, `Salvando`, healing,
  `PAINT_INVALID` ou fallback para lineart limpo.

## 3 · PRE × POS

| Evidência | PRE | POS-1 | POS-2 | Resultado |
|---|---|---|---|---|
| RKStorage | `DE1DC2C111D0461ED9C5F2B8CBB438F211E7B1E421E3CB2DA8E34D689E83BD21` | mesmo | mesmo | byte-idêntico |
| blob `uri` | `D3ABCC16AD9582180FEECF5E55148F90C452D123A70EFB824964A7E165453AF4` | mesmo | — | byte-idêntico |
| blob `logicalUri` | `E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1` | mesmo | — | byte-idêntico |

O ponteiro está contido no RKStorage byte-idêntico; portanto, não mudou. Os dois traços existiam
somente no estado volátil do WebView/processo e não foram promovidos ao armazenamento.

## 4 · Reconciliação individual

```text
VIDEO_4_STATUS = PASS
SECTION_28_3   = PASS · pintar, girar e continuar pintando sem perda/alinhamento incorreto
SECTION_28_4   = PASS · painel rápido sem perda de estado
SECTION_28_5   = PASS · background ~60 s e retorno preservaram rota/canvas
SECTION_28_6   = PASS · tela dividida/resize/tela cheia sem recorte destrutivo
RKSTORAGE_CHANGED = NÃO
POINTER_CHANGED   = NÃO
BLOBS_CHANGED     = NÃO
UNEXPECTED_MUTATION = NÃO
```

## 5 · Transição

O estado volátil é descartável com `am force-stop`: encerra processo/memória sem limpar ou regravar
dados. O próximo bloco reversível na ordem de R5 é `GH2a`/§28 `#7`: abrir a obra legada do Ateliê,
registrar o referencial, continuar desenhando sem salvar e parar antes de `GH2b`.
