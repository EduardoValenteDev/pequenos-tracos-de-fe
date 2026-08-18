# Vídeo 3 · tentativa 1 STOP_INFRA · PRE do retry 01

**Data:** 2026-08-18  
**Dispositivo:** SM-X510 · `RX2XC003LTJ`

## Tentativa histórica

```text
VIDEO_3_ATTEMPT_1 = STOP_INFRA
CASO_13            = NÃO EXECUTADO / NÃO CLASSIFICADO
```

Ao abrir o app pelo ícone, antes de qualquer interação de produto, o dev client exibiu
`There was a problem loading the project` / `java.lang.RuntimeException: Unable to load script`.
A evidência audiovisual externa permanece sob custódia do fundador. Não houve `Reload`,
`Go To Home`, troca de Metro, restauração ou tentativa de produto.

O estado foi preservado antes da correção:

- processo do package: PID `18457`;
- foreground: `DevLauncherErrorActivity`;
- reverse listado: somente `tcp:8081 -> tcp:8082`;
- Metro 8082: HTTP 200, `packager-status:running`;
- Metro iniciado em `C:\tmp\ptf_f6_CASO13_ROLLBACK_wt`;
- comando efetivo: Expo `start --dev-client --port 8082`;
- HEAD do worktree servido: `a190b3efe8827f92274a27d2163a51f6fd9bc0d9`;
- worktree rollback limpo.

## Causa-raiz

O logcat registra que o dev client tentou conectar a
`ws://127.0.0.1:8082/message?...` e obteve `isMetroRunning(): Async result = false`. A porta
`127.0.0.1:8082` do dispositivo recusava conexão porque o reverse existente expunha Metro 8082
somente como porta 8081 no dispositivo.

Prova anterior à correção:

```text
device 127.0.0.1:8081 = conexão aceita
device 127.0.0.1:8082 = connection refused
```

Logo, o reverse estava funcional, mas não cobria a URL persistida e efetivamente solicitada pelo
dev client. Não foi Metro morto, contexto errado nem erro de bundle.

Teste de bundle no host, contra o Metro B:

```text
GET /index.bundle?platform=android&dev=true&minify=false = HTTP 200
SIZE   = 17.246.298 bytes
SHA256 = 8D8E3C9E314F37F547C98BED12C024C5DFDAC18FE7206109AED27963B005882D
```

## Correção exclusivamente infraestrutural

O reverse original foi preservado e foi acrescentado somente o mapeamento exigido pela URL real:

```text
tcp:8081 -> tcp:8082
tcp:8082 -> tcp:8082
```

Depois da correção, conexões para ambas as portas retornaram sucesso a partir do dispositivo.
Nenhum arquivo, dependência, dado do app ou código foi alterado.

## PRE prospectivo · VIDEO_3_RETRY_01

O processo foi encerrado por `am force-stop`, sem limpeza de dados. Estado final: package parado,
Samsung Launcher em foreground e app não reaberto.

```text
RKStorage_A = 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
RKStorage_B = 77ED8589883D473B2A88ED93DAC3D369EBB2C9097E41FF195440A2707A78A8E2
```

As duas capturas são idênticas ao PRE da tentativa 1 e ao POST do Caso 10. Portanto,
`RKSTORAGE_CHANGED = NÃO`. Nova captura de logcat foi iniciada antes do retry.

Evidência técnica no host:
`C:\tmp\ptf_f6_video3_ready\ATTEMPT_1_STOP_INFRA` e
`C:\tmp\ptf_f6_video3_ready\PRE_VIDEO3_RETRY_01_RX2XC003LTJ`.
