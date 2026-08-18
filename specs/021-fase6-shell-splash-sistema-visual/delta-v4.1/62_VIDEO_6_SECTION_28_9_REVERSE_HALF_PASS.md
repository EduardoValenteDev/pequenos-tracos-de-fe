# Vídeo 6 · §28 #9 · metade reversível PASS

**Data:** 2026-08-18

**HEAD:** `fe10fefef82a1d69fcda01f4cf43aa86ccee72c6`

## Resultado humano

O fundador abriu `Desenho de fé` em `Criar livre`, sem tocar no canvas ou nas ferramentas, e girou
de retrato para paisagem. A arte permaneceu íntegra, com dimensões e conteúdo inalterados. As áreas
laterais aumentaram e a obra permaneceu centralizada. Nenhum salvamento foi realizado.

## Classificação da moldura

O comportamento é o letterbox inerte previsto por `AtelierCanvas.js`:

```text
pS = min(W/LW, H/LH)
pX = (W - LW*pS)/2
pY = (H - LH*pS)/2
```

A sobra lateral é moldura, não obra e não área pintável. O log registra resize de `1440×2304` para
`2304×1440`, preservando o ramo `v2-legado`. A observação não é recorte destrutivo, salto de escala
do modelo nem mutação da arte.

## PRE × POS

- RKStorage PRE: `C397980D0D6AC315119BC6B5E8BF779188FFED8B5E7D562A460E26B6B81A9F94`.
- RKStorage POS estável: `96408465350603D3648D4A77FC07F928FF41AC371FCDEA0EF3ABD53834C0983C`.
- Única diferença: `@ptf_criar_livre_orientation_seen_v1:star`, valor `"1"` idêntico,
  `rowid 101→102` — exceção conhecida `AC-1/AC-2`.
- Preview legado: `FDC5529619201C3CC24CFC719DA719047DE9A65E827A8FD934644205D9E1E248`.
- Thumbnail legada: `A5FB5908353A0E8D23C537AF2711C214D6E35F2048FD0281A60F3242A48910DE`.
- Payload e índice da obra permaneceram logicamente idênticos; nenhuma ação de save ocorreu.

```text
VIDEO_6_STATUS = PASS
SECTION_28_9_REVERSIBLE_HALF = PASS
LETTERBOX_CLASSIFICATION = ESPERADO · MOLDURA INERTE
SECTION_28_9_SAVE_REOPEN = NÃO EXECUTADO · RESERVADO AO ATO FINAL
LEGACY_ART_CONSUMED = NÃO
UNEXPECTED_MUTATION = NÃO
```
