# SF1 · Vídeo 1 · captura POST, reconciliação e achado responsivo

**Data:** 2026-08-18

**Dispositivo:** Samsung SM-X510 · `RX2XC003LTJ`

**Contexto:** A · Metro `8081` · harness **NÃO**

**HEAD canônico da execução:** `92f33f1e7849c5b6d7fb742f9d33e60a5e85d44c`

## 1 · Nível de evidência

O fundador declarou que executou todos os passos do Vídeo 1, sem erro funcional nem perda de
rota, estado, sessão, mapa, jogo ou áudio. O vídeo e a captura externa de `Cadê a Ovelhinha?`
permanecem sob custódia do fundador e **não foram recebidos nem inspecionados pelo agente**.

- continuidade visual/funcional: **atestação do fundador com audiovisual sob custódia externa**;
- PRE×POS de armazenamento: **evidência técnica capturada e inspecionada pelo agente**;
- screenshot responsivo: **existência atestada pelo fundador, não inspecionada pelo agente**.

## 2 · Captura POST e lacre

O POST foi capturado com o processo vivo em segundo plano (`pid 10949`) e foreground em
`br.com.ulife/.MainActivity`; nenhum `force-stop`, abertura, toque ou alteração de dados foi emitido
pelo agente. Evidência: `C:\tmp\ptf_f6_video1_ready\POST_VIDEO1_RX2XC003LTJ`.

| Objeto | PRE | POST | Resultado |
|---|---|---|---|
| `RKStorage` | `79D45E96C99B4738E383A0B68D59BA2182FD909C0D43A2306969072482430857` | `030850B6F4D79BAD4D2F0EAD049CF67E07EDB41404A144CDED71865BE490CF9A` | diferente; diferença semântica em §3 |
| journal | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | igual | vazio e idêntico |
| C60 `light` PNG | `E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1` | igual | obra intacta |

Inventário de caminhos PRE×POS: **idêntico**. Permanecem textualmente idênticas:
`@ptf_drawing60_screation_alight`, `ptf_atelier_arts_v1_art_1786479103982_6079` e
`ptf_atelier_arts_v1_index`. Abrir as obras não as regravou, não promoveu formato e não removeu
item do acervo.

## 3 · PRE × POS do `RKStorage`

Foram observadas exatamente quatro diferenças semânticas:

1. `@ptf_bonus_stars`: `1` → `3`;
2. `@ptf_brincar_daily_v1`: dia `2026-08-10`, `used:2` → dia `2026-08-18`, `used:0`;
3. `@ptf_brincar_stats_v1`: atualizações de Pares/Ovelhinha e virada do dia;
4. nova `@ptf_monte_a_cena_progress_v1:star`, sessão `creation_scene_01|4|s0`, peça `p11` colocada.

A sessão do Monte a Cena corresponde ao andamento prescrito. A virada da chave diária é
compatível com o primeiro boot de 2026-08-18. Contudo, o POST também registra:

- Pares/Fácil: `plays 1→3`, `wins 1→3`, melhor marca alterada;
- Ovelhinha/Fácil: novo `bestTimeByScene.toy_workshop_01 = 37379`;
- duas estrelas bônus adicionais.

Essas escritas **excedem o gesto mínimo prescrito**. Não alteram as obras e não refutam, por si,
a continuidade atestada, mas impedem atribuir todo o delta ao roteiro literal sem explicação.
Estado: **`DIVERGENCIA_PRE_POS_VIDEO1` ABERTA**.

## 4 · Reconciliação dos casos cobertos

| Caso | Estado | Base honesta |
|---|---|---|
| `E6/GH1` | **PASS sustentável** | atestação + obras/chaves/arquivo intactos + inventário idêntico |
| §28 `#1/#2` · mapa | **PASS por atestação externa** | audiovisual sob custódia do fundador; não recebido pelo agente |
| §28 `#10` · jogos | **continuidade PASS por atestação externa**, com ressalva | Monte a Cena persiste; delta de Pares/Ovelhinha excede o roteiro mínimo |
| §28 `#11` · áudio | **PASS por atestação externa** | audiovisual sob custódia do fundador; não recebido pelo agente |
| `CN-4` | **satisfeito quanto à continuidade**, não quanto à qualidade visual | achado responsivo separado abaixo |

## 5 · Achado `F12A-OVELHA-LANDSCAPE-01`

**Relato do fundador:** em `Cadê a Ovelhinha?`, landscape preservou sessão e funcionalidade, mas
a superfície permaneceu estreita e centralizada, com grande vazio lateral, dificultando a interação.

- natureza: **UX / UI e responsividade em tablet landscape**;
- não é falha da continuidade do Vídeo 1 (`TK-A-029`/§28 `#10`);
- é evidência adversa para `TK-C-040`/§28 `#15`, cujo critério inclui *"nenhuma coluna estreita
  cercada de vazio em >=900dp"*;
- proprietário: **Fase 12A**, `F12A-SG-A`, risco **`P-166`** (`F12A-GAME-01`), entregas
  **`E067`–`E070-R3`** e consolidação **`E072-R1`**;
- `TK-C-012` e `TK-A-029` proíbem antecipar na Fase 6 `GameSurface`/`GameShell` nos jogos;
- `P-167` trata o hub Brincar, não esta superfície interna; não é o dono primário;
- correção agora: **PROIBIDA**;
- Launch Readiness cross-check: **ABERTO — revalidar em tablet landscape após F12A**.

## 6 · Estado e gate para Vídeo 2

```text
VIDEO_1_CONTINUIDADE ........... PASS por atestação externa; audiovisual não recebido
E6_GH1 ........................ PASS sustentável por atestação + PRE×POS
OBRAS_PROTEGIDAS ............... INTACTAS
F12A-OVELHA-LANDSCAPE-01 ....... ABERTO · UX/responsividade · dono F12A/P-166
DIVERGENCIA_PRE_POS_VIDEO1 ..... ABERTA · Pares/Ovelhinha excedem gesto mínimo prescrito
READY_FOR_VIDEO_2 .............. NÃO CONCEDIDO enquanto a divergência causal estiver aberta
```
