# Vídeo 5 · GH2a / §28 #7 PASS

**Data:** 2026-08-18

**HEAD:** `e151b647db4dff7c7f50fc494bb860936bba3fa7`

## Resultado humano

O fundador abriu `Brincar → Minhas artes → Desenho de fé → Editar`, registrou o referencial visual,
fez um único traço novo e informou sucesso, sem salto de escala nem desalinhamento. Parou no editor
`Criar livre` sem salvar e não realizou interação posterior. O audiovisual permanece sob custódia
do fundador e não foi recebido pelo agente.

## Evidência técnica

- PID da tentativa: `25237`.
- O leitor selecionou `STATE_BRANCH:{"ramo":"v2-legado","candidato":true}`.
- Não houve acionamento de `Salvar desenho` nem alteração do payload/índice da obra.
- Preview legado permaneceu
  `FDC5529619201C3CC24CFC719DA719047DE9A65E827A8FD934644205D9E1E248`.
- Thumbnail legada permaneceu
  `A5FB5908353A0E8D23C537AF2711C214D6E35F2048FD0281A60F3242A48910DE`.

O RKStorage mudou fisicamente de `DE1DC2C1…BD21` para `C397980D…9F94`. A comparação lógica e de
rowid encontrou exatamente a exceção canônica `AC-1/AC-2`, já delimitada nos artefatos `48` e `51`:

```text
@ptf_criar_livre_orientation_seen_v1:star
valor PRE = "1" · valor POS = "1"
rowid PRE = 96 · rowid POS = 101
```

Nenhuma chave foi adicionada/removida e nenhum valor funcional mudou. O efeito é a reescrita
idempotente conhecida de `markOrientationSeen`, não salvamento da obra. Após o lacre, `am
force-stop` descartou o traço volátil; o RKStorage permaneceu `C397980D…9F94`, provando que o
force-stop não limpou nem regravou dados.

```text
VIDEO_5_STATUS       = PASS
GH2A                 = PASS
SECTION_28_7_READ_AND_CONTINUE = PASS
GH2B                 = NÃO EXECUTADO
LEGACY_ART_SAVED     = NÃO
LEGACY_ART_CONSUMED  = NÃO
UNSAVED_TRACE        = VOLÁTIL · DESCARTADO POR FORCE-STOP
AC_1_AC_2            = SATISFEITAS EXATAMENTE
UNEXPECTED_MUTATION  = NÃO
```

## Gate seguinte

O próximo número canônico é §28 `#8`, mas sua ação obrigatória inclui `carimbar`. No HEAD atual,
`STAMPS_ENABLED = false` e a interface de carimbos não é renderizada. O cenário literal não é
executável sem alterar código ou usar instrumentação fora do produto. A arbitragem geral
`ARB-NAOEXEC` permanece aberta no artefato `42`; portanto, este registro não pula, não dispensa e
não fabrica PASS para `#8`.
