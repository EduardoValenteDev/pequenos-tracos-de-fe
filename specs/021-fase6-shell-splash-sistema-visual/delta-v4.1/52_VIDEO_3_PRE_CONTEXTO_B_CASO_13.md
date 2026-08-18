# Vídeo 3 · PRE · Contexto B · Caso 13

**Data:** 2026-08-18  
**Dispositivo:** SM-X510 · `RX2XC003LTJ`  
**Package:** `com.valentedev.pequenostracosdefe`

## Encadeamento

O Caso 10 foi encerrado como `PASS` pelo retry prospectivo no artefato `51`. A tentativa
contaminada do Vídeo 2 permanece preservada nos artefatos `47`/`48`; este registro não a
reescreve nem a converte retroativamente em `PASS`.

Pela ordem vinculante do protocolo executável final (`42`), o próximo bloco físico é o Caso 13
em Contexto B.

## PRE técnico

```text
DEVICE_SERIAL ............... RX2XC003LTJ
DEVICE_STATE ................ device · exatamente um elegível
TABLET_SCREEN_STATE ......... acordado/desbloqueado · Samsung Launcher em foreground
APP_PROCESS_STATE ........... STOPPED
APP_NOT_OPENED .............. SIM
CONTEXT ..................... B
METRO ....................... 8082 · packager-status:running
PORT_8081 ................... sem listener
ADB_REVERSE ................. tcp:8081 -> tcp:8082
HARNESS ..................... NÃO
EXECUTOR_ADB_UNICO .......... Codex raiz
CANONICAL_HEAD .............. dc37e32fbbd04a057c257f74aae0c68bb099ca80
CANONICAL_WORKTREE_STATUS ... limpo
ROLLBACK_HEAD ............... a190b3efe8827f92274a27d2163a51f6fd9bc0d9
ROLLBACK_WORKTREE_STATUS .... limpo
```

Metro B foi iniciado no worktree já existente
`C:\tmp\ptf_f6_CASO13_ROLLBACK_wt`; nenhum novo worktree foi criado. A captura de logcat do
Vídeo 3 está ativa antes da primeira abertura do app.

## Lacre persistente

Duas capturas consecutivas, com o processo parado:

```text
RKStorage_A = 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
RKStorage_B = 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
SIZE        = 49.152 bytes em ambas
```

O hash coincide com as duas capturas `POST_C10_ATELIE`; portanto, nenhuma mutação de
RKStorage ocorreu entre o fechamento do Caso 10 e este PRE.

Evidência no host: `C:\tmp\ptf_f6_video3_ready\PRE_VIDEO3_RX2XC003LTJ`.

## Escopo humano do Vídeo 3

Caso 13 (`TK-A-075`) e `CN-2` "antes", usando somente superfícies de leitura:

1. confirmar o Contexto B por troca de aba e rotação;
2. abrir a obra legada do Ateliê `Desenho de fé` pela miniatura/visualizador e voltar;
3. abrir a obra C60 `Haja luz` pela coleção `Minha Criação Cheia de Cor` e voltar;
4. capturar a abertura de `Mapa das Aventuras` sem rolar;
5. executar o inventário visual Nível 1: coleção C60, galeria inteira do Ateliê,
   contador `N arte(s) guardada(s)` em `Brincar com o Beni` e `Área dos Pais` →
   `Resumo da criança`.

Não desenhar, editar, apagar, salvar, concluir, limpar, iniciar história ou usar ferramenta.
Qualquer comportamento inesperado encerra a execução sem correção nem repetição.
