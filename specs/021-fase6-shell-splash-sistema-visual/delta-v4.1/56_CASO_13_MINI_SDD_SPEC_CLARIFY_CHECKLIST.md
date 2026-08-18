# Caso 13 · Mini-SDD · Spec, clarify e checklist

## Escopo e autoridade

Bloco documental `F6-R3.5 / F6-SG-A / TK-A-075`, aberto pelo `CASO_13 = FAIL`
preservado no artefato 54 e pela análise causal do artefato 55. Este documento não
converte a tentativa histórica em PASS e não autoriza código, Metro, ADB, restauração,
migração na abertura nem interação com o tablet.

Fontes donas auditadas: `Q8` regras 3, 8 e 9; `SD-8`; `TK-A-048..050`;
`TK-A-075`; `G-CMP-4`; `TA-13`; artefatos 54 e 55; writer/leitor atuais; leitor de
`a190b3e`.

## Contratos fechados

- `OLD_READER_EXPECTATION`: JSON v2 com `data` PNG, `W` e `H` iguais ao canvas
  físico corrente; o storage antigo resolve exclusivamente `pointer.v === 3` e
  `pointer.uri`. Campos adicionais são ignorados.
- `CURRENT_WRITER_OUTPUT`: JSON v2 cujo `data` é o bitmap lógico 1:1;
  `W/H = logicalW/logicalH = 1122/1402` no caso observado; o storage externaliza
  somente `data` e conserva a geometria no ponteiro v3.
- `CURRENT_READER_EXPECTATION`: prefere payload lógico declarado e mantém leitura
  dos formatos v1/v2 legados; diferença de viewport não autoriza apagar, regravar,
  fazer healing ou substituir por lineart.
- `COMPATIBILITY_INVARIANT`: após uma gravação explícita bem-sucedida, o mesmo
  estado lógico deve possuir (a) uma representação lógica 1:1 consumível pelo
  leitor atual e (b) uma projeção no formato histórico consumível por `a190b3e`.
  Ambas devem ser persistidas, relidas e validadas antes da promoção atômica; uma
  falha preserva integralmente o ponteiro e blobs anteriores.
- `MINIMAL_FORWARD_COMPATIBLE_REPRESENTATION`: ponteiro v3 aditivo com `uri`
  continuando a apontar para o PNG/payload legado e `logicalUri` apontando para o
  PNG lógico. A geometria histórica em `W/H/img*` descreve `uri`; os campos
  `logicalW/logicalH`, versões lógicas e metadados da pintura descrevem
  `logicalUri`. O leitor atual prefere `logicalUri`, mas cai em `uri` quando o campo
  novo inexiste ou não é utilizável. O leitor antigo ignora `logicalUri` e continua
  usando `uri`.

## Clarify · alternativas comparadas

### A · payload único aditivo

Reprovada. Se `data` continuar lógico, `a190b3e` rejeita porque compara `W/H` com
a viewport. Se `data` virar a projeção física, o leitor atual deixa de receber o
bitmap lógico 1:1 e passa por reamostragem lógica → física → lógica. Acrescentar um
segundo bitmap dentro do mesmo JSON não evita dois blobs reais, e o storage atual
externaliza apenas `data`. A alternativa não prova preservação semântica de Q8/SD-8.

### B · duas representações explícitas

Aprovada. Mantém os bytes lógicos canônicos sem reamostragem, fornece ao leitor
antigo exatamente o canal que ele já conhece e permite promoção conjunta. O custo
é um segundo PNG somente para novas gravações explícitas. Não há novo backend,
mudança de namespace, dependência, asset ou alteração de `a190b3e`.

Limite honesto: a representação legada conserva a limitação histórica do próprio
leitor — `W/H` deve coincidir com a viewport em que ela foi exportada. A validação
prospectiva do Caso 13 deve salvar e abrir o rollback na mesma geometria inicial;
rotação universal do leitor antigo não pode ser criada sem modificá-lo e não é o
contrato de rollback de Q8 regra 9.

## Compatibilidade e não migração

- Ponteiros existentes com apenas `uri` continuam abrindo no leitor atual pelo
  fallback; nenhuma leitura os regrava.
- Payloads inline v1/v2 e ponteiros v3 atuais permanecem aceitos.
- A obra que causou o FAIL histórico não é restaurada nem convertida em background.
- A dupla representação nasce somente no próximo save explicitamente autorizado.
- `POINTER_VERSION` permanece 3 e `APP_STORAGE_SCHEMA_VERSION` permanece 3; não há
  degrau em `storageMigrationService`.

## Checklist do Portão 1

- [x] Fonte dona e owner causal identificados.
- [x] Contratos do leitor antigo, writer atual e leitor atual demonstrados no código.
- [x] Q8 regra 3 preservada: incompatibilidade nunca autoriza lineart/healing.
- [x] Q8 regras 8–9 preservadas por promoção conjunta e fallback legado.
- [x] SD-8 preservado sem reamostragem do bitmap lógico canônico.
- [x] Alternativas A/B comparadas e A rejeitada por contradição verificável.
- [x] Sem migração na abertura, restauração, mudança de rollback ou fabricação de PASS.
- [x] Ambiguidade material remanescente: nenhuma dentro do contrato do Caso 13.

`PORTAO_1 = PASS`.
