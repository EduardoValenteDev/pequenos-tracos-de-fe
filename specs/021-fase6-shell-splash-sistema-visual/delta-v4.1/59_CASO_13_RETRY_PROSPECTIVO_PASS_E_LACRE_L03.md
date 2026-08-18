# Caso 13 · retry prospectivo PASS · lacre L03

**Data:** 2026-08-18

**HEAD escritor corrigido:** `bff8b5c9ee37f51a20ce6aba4a19dfc8ee8e2980`

**Leitor rollback:** `a190b3efe8827f92274a27d2163a51f6fd9bc0d9`

**Dispositivo:** SM-X510 · `RX2XC003LTJ`

## 1 · Preservação da cadeia histórica

Este registro é aditivo. Ele não apaga, reclassifica nem converte retroativamente:

- o `FAIL` histórico do Caso 13 registrado nos artefatos `54` e `55`;
- `VIDEO_3_ATTEMPT_1_STOP_INFRA` do artefato `53`;
- o `STOP_INFRA` da primeira tentativa do retry pós-correção, causada pela ausência do reverse
  direto `tcp:8082 → tcp:8082` enquanto o dev client tentou
  `ws://127.0.0.1:8082/message`;
- os lacres PRE/POS, logs e hashes preservados localmente em
  `.expo/c13-retry-attempt2/`.

O resultado abaixo vale somente para a validação prospectiva da correção commitada em `bff8b5c`.

## 2 · Escrita prospectiva no leitor atual

O fundador abriu `Haja luz` no contexto A e tocou exatamente uma vez em `✓ Pronto!`, sem tocar no
canvas, paleta ou ferramentas. O writer corrigido promoveu um ponteiro v3 dual somente depois da
persistência, releitura e validação das duas representações coordenadas:

| Campo | Valor lacrado |
|---|---|
| `uri` | `_ptf_drawing60_screation_alight.b.png` |
| `logicalUri` | `_ptf_drawing60_screation_alight.b.logical.png` |
| `W/H` | `1440 × 2156` |
| `logicalW/logicalH` | `1122 × 1402` |
| `paintRev` | `1` |
| SHA-256 `uri` | `D3ABCC16AD9582180FEECF5E55148F90C452D123A70EFB824964A7E165453AF4` |
| bytes `uri` | `914002` |
| SHA-256 `logicalUri` | `E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1` |
| bytes `logicalUri` | `386880` |

## 3 · Tentativa rollback 1 · STOP_INFRA preservado

Na primeira abertura em contexto B, antes de qualquer interação de produto, o dev client exibiu
`Unable to load script`. O log provou tentativa em `127.0.0.1:8082`; o estado tinha apenas
`tcp:8081 → tcp:8082`. A tentativa é `STOP_INFRA`, não `FAIL` do Caso 13.

Antes da correção de infraestrutura, o RKStorage e os dois blobs continuavam byte-idênticos. Foi
adicionado somente `tcp:8082 → tcp:8082`, preservando `tcp:8081 → tcp:8082`. O shell do aparelho
confirmou alcance TCP de `127.0.0.1:8082`; o Metro 8082 servia o worktree limpo em `a190b3e`.

## 4 · Tentativa rollback 2 · PASS prospectivo

O fundador abriu a mesma `Haja luz` somente para leitura no rollback. A pintura apareceu colorida e
preservada. Nenhum toque foi feito no canvas, paleta, ferramentas ou `✓ Pronto!`.

Evidência técnica isolada no PID desta tentativa (`23151`):

```text
ReactHost{0}.isMetroRunning(): Async result = true
Running "main"
[ColoringCanvas WebView] img.naturalSize=1122x1402 canvas=1440x2156
[ColoringCanvas WebView] [COLORING_STATE] load OK W=1440 H=2156
```

Não houve, na janela/PID da tentativa, `PAINT_INVALID`, `healing`,
`arte guardada não aplicável` nem abertura de `lineart` limpo. As linhas de healing existentes no
log completo são do `FAIL` histórico das 13:22, em outro PID, e não pertencem ao retry.

## 5 · PRE × POS e lacre L03

| Evidência | PRE | POS | Resultado |
|---|---|---|---|
| RKStorage SHA-256 | `DE1DC2C111D0461ED9C5F2B8CBB438F211E7B1E421E3CB2DA8E34D689E83BD21` | mesmo hash | byte-idêntico |
| `uri` SHA-256 | `D3ABCC16AD9582180FEECF5E55148F90C452D123A70EFB824964A7E165453AF4` | mesmo hash | intacto |
| `logicalUri` SHA-256 | `E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1` | mesmo hash | intacto |

Duas capturas consecutivas da baseline RKStorage anterior à segunda tentativa também produziram
`DE1DC2C1…BD21`. Não houve mutação persistente durante a leitura rollback.

```text
C13_RETRY_ROLLBACK_ATTEMPT_2 = PASS
CASO_13_PROSPECTIVE_RETRY    = PASS
OLD_READER_LOAD              = PASS
HEALING_TRIGGERED            = NÃO
PAINT_INVALID                = NÃO
LINEART_CLEAN_FALLBACK       = NÃO
RKSTORAGE_CHANGED            = NÃO
DUAL_POINTER_INTACT          = SIM
HISTORICAL_FAIL              = PRESERVADO
LACRE_L03                    = FECHADO
```

## 6 · Efeito causal e próximo bloco

O requisito do artefato `55` §6 foi satisfeito: há agora um `PASS` prospectivo lacrado. Portanto, o
bloqueio específico imposto pelo Caso 13 aos Vídeos 4–8 é levantado. Isso não fabrica PASS para
qualquer outro caso e não resolve automaticamente arbitragens próprias de etapas posteriores.

A ordem do artefato `42` permanece:

```text
E6/GH1 concluído
→ R4/Caso 13 concluído e lacrado por este artefato
→ restante de R5
→ §28 #7 ∪ #9, qualquer salvamento consuntivo por último
```

O próximo bloco obrigatório é o restante reversível de R5 ainda não colhido, começando pelos
cenários de canvas C60 §28 `#3`–`#6`, em contexto A, sem salvar. Os atos consuntivos de §28 `#7` e
`#9` continuam reservados para o final e não são autorizados por este registro.
