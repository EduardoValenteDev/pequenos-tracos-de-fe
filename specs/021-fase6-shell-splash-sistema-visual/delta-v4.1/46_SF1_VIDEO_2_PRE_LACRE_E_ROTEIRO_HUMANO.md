# SF1 · Vídeo 2 · PRE, lacre e roteiro humano

**Data:** 2026-08-18

**Dispositivo:** `RX2XC003LTJ` · Samsung `SM-X510`
**Package:** `com.valentedev.pequenostracosdefe`

## 1 · Fecho do Vídeo 1

O adendo `45` fecha por declaração expressa do fundador os deltas de Pares, estrelas,
Ovelhinha e foreground preservados no artefato `44`. `F12A-OVELHA-LANDSCAPE-01` e
`TABLET-JANK-TRANSITIONS-01` permanecem achados separados, sem correção nesta campanha.

## 2 · PRE técnico

```text
DEVICE_SERIAL .............. RX2XC003LTJ
DEVICE_STATE ............... device · único elegível
CONTEXT .................... A
METRO ...................... 8081 · packager-status:running · PID host 2744
ADB_REVERSE ................ tcp:8081 -> tcp:8081 · único reverse
HARNESS .................... NÃO
APP_PROCESS_STATE .......... STOPPED
TABLET_SCREEN_STATE ........ awake, unlocked, launcher Samsung em foreground
APP_NOT_OPENED_APÓS_STOP ... SIM
CANONICAL_HEAD_NO_PRE ....... 425fea043ecef4750adba7b67da112074bc4cc26
CANONICAL_WORKTREE_STATUS ... limpo
```

Antes do `force-stop`, o app estava vivo e em foreground, coerente com o screenshot pós-vídeo.
Foram colhidos dois RKStorage consecutivos idênticos e um TAR integral. O TAR e o RKStorage são
também idênticos ao POS do Vídeo 1: não havia escrita pendente nem obra dependente do processo
vivo. `am force-stop` não limpa dados e foi usado somente para fixar o estado inicial.

```text
RKStorage.pre1 SHA256 ....... 030850B6F4D79BAD4D2F0EAD049CF67E07EDB41404A144CDED71865BE490CF9A
RKStorage.pre2 SHA256 ....... 030850B6F4D79BAD4D2F0EAD049CF67E07EDB41404A144CDED71865BE490CF9A
appdata_pre.tar SHA256 ...... B87C0349F242EAFA06696F50CFB6585F81ED807C1433593A7DC22610FFFD4C31
light.a.png SHA256 .......... E267D4C0FB4C5C964D9F708DDF1433AE2DDFCB1148BA22CB03CFB449B93F33E1
atelier preview SHA256 ...... FDC5529619201C3CC24CFC719DA719047DE9A65E827A8FD934644205D9E1E248
atelier thumb SHA256 ........ A5FB5908353A0E8D23C537AF2711C214D6E35F2048FD0281A60F3242A48910DE
```

Evidência no host: `C:\tmp\ptf_f6_video2_ready`. O `logcat` foi limpo uma vez para o bloco e a
captura contínua foi iniciada em `LOGCAT_VIDEO2_RX2XC003LTJ\raw.log`, por um único executor ADB.

## 3 · Escopo e roteiro humano fechado

Vídeo 2 = `SF1 Bloco 1`, reobservação em **retrato** dos casos `1`, `10`, `14 v2`, `15` e `16`.
Durante todo o vídeo: não rotacionar; não desenhar; não tocar `Salvar`, `Pronto!`, paleta,
ferramentas, `Pintar de novo`, `Limpar desenho` ou `Apagar`; não encerrar o app.

1. Começar a gravação mostrando o tablet inteiro e a barra do sistema, ainda no launcher.
2. Abrir o app **Beni** pelo ícone. A superfície esperada é `Início`. Se surgir launcher de
   desenvolvimento, erro, tela diferente ou pedido do sistema, manter a evidência e encerrar.
3. Manter o tablet em retrato. Em `Início`, tocar a aba `Aventuras`; em `Mapa das Aventuras`, tocar
   o pin `A Criação`; tocar `Rever aventura`; na tela `A Criação`, descer até a seção
   `Colorir com o Beni` e tocar o card `Haja luz`.
4. Em `Haja luz`, somente observar: a pintura deve aparecer, alinhada ao traço e não em branco.
   Não tocar no canvas nem nos controles. Tocar somente `← Voltar`.
5. Ir à aba `Brincar`; tocar o card `Minhas artes`; em `Minhas artes`, tocar a obra
   `Desenho de fé`.
6. Somente observar a obra: deve abrir sem tela de erro, sem branco e sem desalinhamento. Essa é a
   obra legada `v2` sem geometria completa; cobre a reconstrução legada e a leitura sem erro.
   Não tocar em nenhuma ferramenta. Tocar somente o botão de voltar do cabeçalho.
7. Ainda em `Minhas artes`, abrir novamente `Desenho de fé`, observar sem tocar na obra e voltar
   pelo mesmo botão. Esta abertura isolada é a observação visual do caso 10; a igualdade de bytes
   será julgada pelo agente no POS.
8. Voltar a `Aventuras` → `Mapa das Aventuras` → pin `A Criação` → `Rever aventura` →
   seção `Colorir com o Beni` → card `Haja luz`.
9. Somente observar que `Haja luz` resolve normalmente e continua com a pintura presente. Não
   tocar no canvas nem nos controles. Tocar somente `← Voltar` e parar na tela `A Criação`.
10. Encerrar a gravação sem sair do app e não tocar mais no tablet. Informar, para cada abertura,
    se houve branco, erro, desalinhamento, perda da pintura ou qualquer comportamento inesperado.

Se algo inesperado ocorrer: não corrigir, não repetir, preservar a evidência e encerrar.

## 4 · Plano audiovisual

```text
TOTAL_PHYSICAL_VIDEOS_PLANNED ... 8
COMPLETED ....................... 1
CURRENT ......................... 2
REMAINING_AFTER_VIDEO_2 ......... 6
```
