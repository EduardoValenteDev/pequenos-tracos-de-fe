# Bloco 2 · Fase 2B.6 · Política de acesso e download premium

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.6 · **Etapa SDD:** 1 (Specify) · **Portão Humano 1: APROVADO com ajustes por Eduardo (2026-07-07).**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `77be545`.
> **Bloqueio:** a **2C permanece bloqueada** até a 2B.6 estar **implementada, validada e publicada**. Segurança de receita é bloqueador.

## Decisão principal
**Pack baixado NÃO é autorização de acesso.** A autorização vem de **entitlement ativo + progressão + regra de produto** — nunca de "tem arquivo no disco". Uma assinatura curta não pode virar acesso vitalício ao conteúdo premium offline.

## Diagnóstico aceito
1. O **resolver** (`contentResolver.decide`) continua **agnóstico**: decide de ONDE vem o byte, não SE o usuário pode consumir.
2. O **gate de acesso** continua em `accessControl` + `contentAccessService` + telas de conteúdo.
3. **Risco real:** hoje o download está liberado para **qualquer** história premium remote quando `isPremiumUser()` é verdadeiro (bloco `canAccess && isRemote && !isComingSoon` no StoryDetail, **sem progressão**).
4. O download precisa **respeitar progressão**.
5. A **abertura** de conteúdo premium precisa respeitar **assinatura ativa** mesmo com o pack já no disco.
6. **Creation** e **Noah** seguem livres e offline sempre (`starter`).

**Estado atual (base):** as 3 telas de conteúdo (Narration :82-93, Coloring :77-85, StoryBook :501-503) **já re-checam** `canOpenStoryFullExperience` ao montar; o gate de abertura existe. Os gaps são: download sem progressão; consistência do gate; validade de assinatura; retenção de pack.

## Requisitos de política

### RP1 — Download gated por progressão (atual OU concluída) · ajuste Portão 2
Só é permitido baixar uma história **premium remote** se, cumulativamente:
1. o usuário tem **premium active** (`isPremiumUser()`);
2. a história é **remote**;
3. a história **não** é coming soon; **e**
4. a história é a **ATUAL da jornada** OU **já foi CONCLUÍDA** na jornada.

**Regra esperada:**
- História **futura** bloqueada pela jornada → **não** mostra download.
- História **atual** da jornada → mostra download.
- História premium **já concluída** → **pode** mostrar download (se não estiver baixada ou precisar rebaixar).
- História **baixada não libera abertura** sem premium active.

> "Atual OU concluída, exceto futuras" **é exatamente `sequenceUnlocked`** (jornada linear). Bloqueia download em massa de futuras **sem** punir quem já avançou e quer rebaixar/revisitar. A proteção de receita continua sendo o **gate de abertura** por entitlement ativo, não o arquivo existir no disco.

### RP2 — Pack ≠ acesso
O gate de abertura permanece **exclusivamente** entitlement-based (`canOpenStoryFullExperience`), **nunca** "tem pack". O resolver segue **agnóstico** (sem regra de entitlement).

### RP3 — Abertura checa assinatura ativa (FIRME) + parada de mídia · ajuste Portão 2
- **StoryDetail deve checar `canAccess` ANTES de navegar** para Narração, Colorir ou Livrinho — **inclusive no ramo `isCompleted`** (:160-168). **Não** depender apenas do guard da tela seguinte.
- **Rechecagem em FOCO:** Narration, Coloring e StoryBook **revalidam acesso ao receber foco** (`useFocusEffect`), não só no `mount` — protege expiração **durante o uso**.
- **Parada de mídia (obrigatória):** ao bloquear em foco, **interromper qualquer mídia premium em andamento**. Crítico em **Narração** (áudio tocando) e **Livrinho** (autoplay/narração); **Colorir** (sem áudio) apenas bloqueia e sai seguro. **Nunca** pode haver tela bloqueada com áudio premium ainda tocando.

### RP4 — Assinatura expirada bloqueia mesmo com arquivo local (contrato)
- Mesmo com pack no disco, **assinatura expirada bloqueia** a abertura premium.
- Quando RevenueCat entrar, `getCurrentPlan()` precisa refletir **active vs expired/cancelled**.
- **Contrato offline (registrado, não implementado agora):** a integração futura deve **persistir o estado de entitlement com validade conhecida** (ex.: `expiresAt`). **Se a validade local já passou → bloqueia premium mesmo offline.** Isso evita que "premium em cache" vire acesso perpétuo sem rede. Nenhuma implementação de RevenueCat nesta fase — apenas o contrato fica registrado.

### RP5 — Creation/Noah livres e offline
`starter` → `hasStoryAccess` free → sempre abre, sem download. **Nenhuma mudança.**

### RP6 — Retenção do pack (aprovado com ressalva)
- **Não** tornar limpeza de packs obrigatória agora. **Manter o pack no disco após perder premium é aceitável, desde que a abertura esteja bloqueada** — ajuda quem reassina e evita rebaixar tudo de novo.
- **A proteção de receita vem do gate de abertura, não de apagar arquivo.**
- **Trilha futura OPCIONAL (registrada, fora desta fase):** limpeza de packs premium sem acesso; limite de armazenamento; botão para limpar downloads.

## Risco registrado — URL pública R2 (novo)
Enquanto packs e manifesto estiverem em **URL pública R2**, a proteção é **suficiente para o fluxo normal dentro do app** (o app bloqueia abertura sem entitlement), mas **não é proteção forte contra um usuário técnico** que extraia URLs **fora do app** e baixe os arquivos diretamente. Para proteção comercial mais forte **no futuro** (antes de escala alta), avaliar: **backend com URLs assinadas, token temporário ou manifesto protegido por entitlement**. **Não implementar agora** — registrado como risco e possível trilha futura.

## Adendo (Portão 3) — Análise de burla e proteção de receita
Reforço obrigatório. Registra o que a 2B.6 protege **agora** e os riscos que ficam para **fases futuras** (sem mudar o escopo desta fase).

1. **Offline ≠ acesso vitalício (contrato).** Ver RP4: `getCurrentPlan()` refletirá active/expired/cancelled; premium offline só até `expiresAt` local; validade vencida → bloqueia e pede **revalidação online**. Documentado em `accessControl` (comentário), não implementado.
2. **Modo Criador impossível em produção — EVIDÊNCIA (já coberto).** `creatorQaMode.isCreatorQaModeAllowed()` = `__DEV__ === true || EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE === 'true'`; `enabled`/`set`/`load` forçam `false` quando não permitido (produção ignora até valor salvo). `accessControl.ENABLE_LOCAL_PREMIUM_TEST_MODE = false`. Smoke cobre (checks 143-189 + check 2B.6). **A flag NÃO aparece em `eas.json`/`app.json`/`.env*`** → não vaza para build. **Não é bloqueador.** *Risco residual (checklist pré-loja):* nunca adicionar `EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE=true` a um perfil de produção — o check 2B.6 do smoke **falha** se a flag entrar em `eas.json`/`app.json`.
3. **R2 público — risco comercial (trilha futura).** Protege o fluxo normal do app, não impede extração externa de URLs por usuário técnico. Antes de escala alta, avaliar: **R2 privado; manifesto protegido; backend valida entitlement; URLs assinadas temporárias; Cloudflare Worker autorizando download.** Não implementar agora.
4. **Pack local ≠ autorização (regra 2B.6).** Pack no disco nunca libera premium; abertura depende de `canAccess`/entitlement ativo (RP2/RP3). Núcleo desta fase.
5. **Pack local ≠ proteção contra usuário técnico (risco futuro).** Root/jailbreak/backup extraído/inspeção de storage podem acessar arquivos locais. Mitigação futura: **packs criptografados no disco; chave temporária entregue por backend após validação de entitlement; chave expira junto com a assinatura.** Não implementar agora.
6. **Revalidar em todas as entradas.** StoryDetail (guard antes de navegar), Narration/Coloring/StoryBook (mount + **foco** + parada de mídia). Nenhuma rota premium depende só de botão escondido.
7. **Gate da 2C (atualizado).** A 2C só sai do bloqueio quando, cumulativamente: (a) **2B.6 implementada e validada em device**; (b) **Modo Criador seguro para produção** (evidência acima) ou explicitamente bloqueado fora de dev; (c) **contrato de entitlement offline documentado** (RP4 ✓); (d) **risco de R2 público registrado** como trilha futura (✓).

## Critérios de aceite obrigatórios (15 — ajuste Portão 2)
1. Premium active pode baixar a história premium **atual** da jornada.
2. Premium active pode baixar ou **rebaixar** história premium **já concluída**.
3. Premium active **não** pode baixar história premium **futura bloqueada** pela jornada.
4. Pack baixado **não** libera abertura sem premium active.
5. **Modo Criador off** com pack baixado **bloqueia** Narração, Colorir e Livrinho.
6. StoryDetail **não navega** para conteúdo premium sem `canAccess` — **inclusive se concluída**.
7. Rechecagem em foco **bloqueia** acesso premium inválido.
8. Rechecagem em foco **interrompe áudio/autoplay premium** em andamento.
9. Resolver **continua sem** regra de entitlement.
10. Creation e Noah continuam livres e offline.
11. Smoke cobre download gated por **atual, concluída e futura bloqueada**.
12. Smoke cobre **pack ready sem entitlement não liberando conteúdo**.
13. Device valida: baixar com Modo Criador on → desligar → abrir offline → **bloqueio premium**.
14. **Nenhuma** mudança em RevenueCat.
15. **Nenhuma** mudança em 2C, `app.json`, `assetBundlePatterns`, requires premium ou assets.

## Fora de escopo
Implementar RevenueCat; iniciar 2C; alterar `app.json`/`assetBundlePatterns`/requires/assets; apagar packs automaticamente (retenção = RP6, trilha futura); reescrever o resolver; backend/URLs assinadas (risco futuro registrado).
