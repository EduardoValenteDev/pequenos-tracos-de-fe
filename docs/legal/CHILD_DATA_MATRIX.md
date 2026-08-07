# Matriz de Dados Infantis — Pequenos Traços de Fé

**Versão original:** Sprint 17.0 · 2026-06-01
**Atualização integral:** **Fase 5, Bloco 2 · 2026-08-06** — ver
[`docs/fase5-pareceres/02_PARECER_PRIVACIDADE_E_DADOS.md`](../fase5-pareceres/02_PARECER_PRIVACIDADE_E_DADOS.md)

Fonte de verdade para decisões de privacidade. Revisar a cada nova funcionalidade que colete dados.

> **Por que esta atualização foi necessária.** A versão de Sprint 17.0 listava **8 tipos de dado** e
> afirmava, em todas as linhas, `Transmitido? Não`. O levantamento da Fase 5, feito por leitura
> direta do código em 2026-08-06, encontrou **mais de 50 chaves de armazenamento** e **tráfego de
> rede real** (§4). A matriz anterior não era falsa por má-fé: ela descrevia o app de junho de 2026,
> antes do Colorir 60, do Criar Livre, do Modo Igreja, dos pacotes de conteúdo sob demanda e da
> integração de assinatura. **Não é ajuste silencioso:** a divergência está declarada aqui e no
> parecer do Bloco 2.

---

## Regra fundamental

> Dados de crianças menores de 13 anos exigem consentimento específico, destacado e em linguagem
> simples dos responsáveis legais (LGPD Art. 14; COPPA USA; GDPR-K EU).
> O app deve aplicar o princípio da minimização: coletar apenas o estritamente necessário.

---

## 1. Como ler esta matriz

- **Local** significa: gravado no aparelho, em `AsyncStorage` ou no diretório privado do app
  (`expo-file-system`), sem cópia em servidor.
- **Transmitido** responde só a uma pergunta: *este dado sai do aparelho?* Tráfego de rede que
  **não carrega** o dado não faz o dado ser "transmitido". A superfície de rede do app está
  descrita em §4, separadamente — e deve ser lida junto.
- **Dado pessoal da criança** aqui significa: identifica ou pode identificar a criança, ou é
  produção pessoal dela (nome, texto livre digitado, desenho).

---

## 2. Dados pessoais da criança — o núcleo protegido

Estes são os únicos dados do app que identificam a criança ou são produção dela.

| # | Dado | Origem | Onde fica | Transmitido? | Sensível? | Ação obrigatória |
|---|---|---|---|---|---|---|
| 1 | **Nome da criança** (texto livre, máx. 20 no onboarding / 30 na edição) | digitado pela criança ou pelo responsável | `@ptf_profile` e `@ptf_child_profiles_v1` | **Não** | **Sim** — dado pessoal de criança | manter opcional; avisar que fica só no aparelho; incluir na exclusão total quando ela existir |
| 2 | **Avatar e tom de pele** | escolhido pela criança | `@ptf_profile` (`avatarId`, `skinTone`, `avatarSkinTones`) | **Não** | **Atenção** — tom de pele é proxy de característica pessoal | não tratar como dado neutro; nunca transmitir; nunca usar para segmentação |
| 3 | **Desenhos das cenas (Colorir legado)** | produzidos pela criança | ponteiro em `@ptf_drawing_s*_c*`; imagem em `ptf_blobs/drawings/` | **Não** | **Sim** — produção pessoal | nome de arquivo derivado de id interno, **nunca** do nome da criança |
| 4 | **Pinturas do Colorir com o Beni** | produzidas pela criança | ponteiro em `@ptf_drawing60_s*_a*`; imagem em `ptf_blobs/drawings60/` | **Não** | **Sim** — produção pessoal | idem |
| 5 | **Artes do Criar Livre / Ateliê** | produzidas pela criança | `ptf_atelier_arts_v1_${id}` + índice; preview/thumb em `ptf_blobs/atelier/` | **Não** | **Sim** — produção pessoal | idem |
| 6 | **Título da arte** (texto livre, máx. 40) | digitado pela criança | campo `title` da arte e do índice | **Não** | **Sim** — texto livre de criança | não há moderação; é local e privado |
| 7 | **Reflexão pós-história** | ver §6 — natureza a confirmar | `@ptf_reflection_${storyId}` | **Não** | **A confirmar** | ver encaminhamento E5.10 |

### 2.1 Texto livre digitado pelo **responsável** (Modo Igreja)

Não é dado da criança, mas é dado pessoal de terceiro e entra no mapa.

| Dado | Máx. | Onde fica | Transmitido? |
|---|---|---|---|
| Nome da turma | 60 | `@ptf_church_groups_v1` (`name`) | **Não** — mas pode ser **compartilhado por ação explícita do adulto** via menu do sistema (§4.4) |
| Nome do líder/professor | 60 | `@ptf_church_groups_v1` (`leaderName`) | idem |
| Faixa/grupo da turma | 40 | `@ptf_church_groups_v1` (`churchName`) | idem |
| História da semana | 60 | `@ptf_church_groups_v1` (`weeklyStoryId`) | idem |

---

## 3. Mapa completo de armazenamento

Registro técnico auditável, por chave. Nenhuma destas chaves é transmitida.

### 3.1 Perfil, esquema e migração

| Chave | Conteúdo | Pessoal? |
|---|---|---|
| `@ptf_profile` | `{ name, avatarId, skinTone, avatarSkinTones }` | **SIM** |
| `@ptf_child_profiles_v1` | lista de `{ id, name, avatarId, createdAt, updatedAt, isActive }` | **SIM** |
| `@ptf_active_child_id_v1` | id interno do perfil ativo | não |
| `@ptf_schema_version` | versão do schema local | não |
| `@ptf_migration_status_v1` | resultado da última migração | não |

### 3.2 Progresso e jornada

| Chave | Conteúdo | Pessoal? |
|---|---|---|
| `@ptf_progress_${storyId}` | mapa `{ cenaId: true }` | não |
| `@ptf_quiz_done_${storyId}` | `'true'` | não |
| `@ptf_reflection_${storyId}` | conteúdo da reflexão | **a confirmar** |
| `@ptf_storybook_opened_${storyId}` | `'true'` | não |
| `@ptf_lumi_moment_${YYYY-MM-DD}` | `'true'` — **uma chave por dia de uso** | não, mas ver §7 |
| `@ptf_lumi_moment_ever` | `'true'` | não |
| `@ptf_bonus_stars` | contador | não |
| `@ptf_achievements_seen` | ids de conquista | não |
| `@ptf_coloring_done_${storyId}_${sceneId}` | `'true'` | não |
| `@ptf_monte_a_cena_progress_v1:${profileId}` | sessão ativa do jogo | não |
| `@ptf_monte_a_cena_gallery_v1:${profileId}` | cenas completadas | não |
| `@ptf_criar_livre_orientation_seen_v1:${profileId}` | `'1'` | não |

### 3.3 Colorir com o Beni (Colorir 60)

| Chave | Conteúdo | Pessoal? |
|---|---|---|
| `@ptf_drawing60_s${storyId}_a${activityId}` | **ponteiro** `{ v, fmt, uri: 'file://…drawings60/…', mime }` | **SIM** (aponta para a pintura) |
| `@ptf_coloring60_done_*` / `_ever_*` | `'true'` | não |
| `@ptf_coloring60_finale_seen_${storyId}` | `'true'` | não |
| `@ptf_coloring60_snap_*` | metadado de desfecho | não |
| `@ptf_coloring60_milestone_invite_seen_*` | `'1'` | não |
| `@ptf_creation_colorir_invite_shown_v1` | `'1'` | não |

### 3.4 Colorir legado e Criar Livre

| Chave | Conteúdo | Pessoal? |
|---|---|---|
| `@ptf_drawing_s${storyId}_c${sceneId}` | v1 data URL · v2 layout+data · v3 ponteiro `file://` | **SIM** |
| `ptf_atelier_arts_v1_index` | índice `{ id, title, createdAt, updatedAt, schema, thumbnail* }` | **SIM** (`title`) |
| `ptf_atelier_arts_v1_${id}` | arte completa `{ …, stateJson, preview* }` | **SIM** |

### 3.5 Conquistas, certificados, cards e relatórios

| Chave | Conteúdo | Pessoal? |
|---|---|---|
| `@ptf_certificates_v1_index` · `@ptf_certificate_v1_${id}` | `{ id, childId, type, title, createdAt }` | não — `childId` é id interno, `title` é gerado pelo sistema |
| `@ptf_share_cards_v1_index` · `@ptf_share_card_v1_${id}` | `{ childId, storyId, shareType, safeForSharing }` | não — sem nome nem imagem por design |
| `@ptf_weekly_reports_v1_index_${childId}` · `@ptf_weekly_report_v1_${id}` | contadores agregados da semana | não |

> **Nota de estado:** certificados e share cards **registram** dados, mas hoje **não geram nem
> exportam** nenhum arquivo, imagem ou PDF. São registros locais de intenção.

### 3.6 Configurações, consentimento e Modo Igreja

| Chave | Conteúdo | Pessoal? |
|---|---|---|
| `@ptf_parent_settings_v1` | flags de notificação, compartilhamento, relatórios, Modo Igreja | não |
| `@ptf_parental_consent_v1` | `{ accepted, acceptedAt, metadata }` | não |
| `@ptf_church_groups_v1` | ver §2.1 | **SIM** (dados do responsável) |

### 3.7 Plano, compras e conteúdo

| Chave | Conteúdo | Pessoal? |
|---|---|---|
| `@ptf_entitlement_v1` | snapshot sanitizado de assinatura: flags e timestamps | não é dado da criança; é estado de compra |
| `@ptf_packs_v1` | mapa `storyId → { status, versão, localDir, bytes }` | não |
| `@ptf_plan_state_v1` | **declarada e não utilizada** — nenhuma escrita ou leitura encontrada | não |

### 3.8 Preferências, tours e jogos

`@ptf_audio_prefs_v1` · `@ptf_creator_qa_mode` · `@ptf_beni_app_tour_seen_v1` ·
`@ptf_beni_guide_{adventures,home,atelier,stars,profile,parent}_v1` ·
`@ptf_beni_chest_seen_cards_v1` · `@ptf_family_worship_v1` · `@ptf_brincar_daily_v1` ·
`@ptf_brincar_stats_v1` · `@ptf_onboarding_v1` — **nenhuma contém dado pessoal.**

Dois serviços declaram a garantia no próprio código: o Baú do Beni *"nunca salva texto livre, nome,
imagem"* e o Cultinho em Casa *"NUNCA salva texto livre, foto, áudio, localização"*.

### 3.9 Arquivos gravados no aparelho

Raiz: `documentDirectory + 'ptf_blobs/'`.

| Diretório | Conteúdo | Nomeação |
|---|---|---|
| `ptf_blobs/drawings/` | pinturas do Colorir legado (PNG) | derivada de **id interno sanitizado** |
| `ptf_blobs/drawings60/` | pinturas do Colorir com o Beni | idem |
| `ptf_blobs/atelier/` | preview e miniatura de cada arte | idem |
| `documentDirectory/packs/<storyId>@<version>/` | **conteúdo do app** baixado sob demanda | não é dado pessoal |

> **Garantia verificada:** nenhum nome de arquivo é derivado do nome da criança. A exclusão de blob
> passa por validação de contenção (anti *path traversal*); não há remoção por prefixo aberto.

---

## 4. Superfície de rede — o que sai do aparelho

Esta seção corrige a afirmação da versão Sprint 17.0 de que **nada** era transmitido.

| # | Tráfego | Destino | Disparo | Carrega dado pessoal da criança? |
|---|---|---|---|---|
| 1 | **Validação de assinatura** — `Purchases.getCustomerInfo()` (RevenueCat) | servidores da RevenueCat | **automático**, a cada retorno do app ao primeiro plano (`AppState → 'active'`) | **Não.** Trafegam identificadores de dispositivo/compra do SDK. **Nenhum** nome, desenho ou progresso |
| 2 | **Manifesto de conteúdo** — `fetch` | bucket público Cloudflare R2 declarado nos perfis `preview`, `preview-criador` e `production` do `eas.json` | **só por toque** no botão "Baixar história (usar offline)" | **Não** — é download, não upload |
| 3 | **Download de pacote de história** | mesmo bucket R2 | idem | **Não** |
| 4 | **E-mail de suporte** — `Linking.openURL('mailto:…')` | app de e-mail do aparelho | **só por toque de adulto**, após o portão parental | o que o adulto escrever |
| 5 | **Compartilhar orientação do Modo Igreja** — `Share.share` | escolhido pelo adulto no menu do sistema | **só por toque de adulto** | pode conter os textos de turma de §2.1 |
| 6 | **Link de avaliação na loja** | — | **inoperante hoje**: as duas URLs de loja valem `null` | — |

### 4.1 Precisões que importam

1. A chamada da RevenueCat **não ocorre no boot frio**. `initEntitlement()` executa
   `loadEntitlement()`, que lê **apenas o `AsyncStorage`**. O que dispara a rede é o listener de
   `AppState`, no **retorno ao primeiro plano**.
2. A chamada é **fail-closed**: sem chave de API configurada no build, o SDK não é configurado e
   **nenhuma requisição ocorre**.
3. **A presença ou ausência da chave de API no build de produção NÃO PÔDE SER RECUPERADA** neste
   repositório: `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` e `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` não
   aparecem em `eas.json`, `app.json`, `.env.example` nem `package.json`. Podem estar em EAS
   Secrets, fora do repositório. **Este documento não afirma que a chamada ocorre nem que não
   ocorre em produção — o dado está classificado como NÃO RECUPERADO.**

### 4.2 O que **NÃO EXISTE** — verificado

Nenhum SDK de **analytics** · **publicidade** · **crash reporting** · **rastreamento/ATT** ·
**push notifications** · **expo-updates** · **câmera** · **microfone em runtime** ·
**biblioteca de mídia** · **geolocalização** · **login** · **backend próprio** · **chat** ·
**conteúdo gerado por terceiros**.

`app.json` declara `NSPrivacyTracking: false` e `NSPrivacyTrackingDomains: []`; a única permissão
Android é `MODIFY_AUDIO_SETTINGS`; o `expo-audio` está configurado com `microphonePermission: false`.
Um teste automatizado (`scripts/smoke.js`) trava a ausência de `NSUserTrackingUsageDescription`.

### 4.3 `performanceTrace.js`

Existe, mede tempos de boot **em memória**, com allowlist de chaves e regex que rejeita e-mail e
texto livre. **Não envia nada para fora**: a única saída é `console.log` local. Fora de `__DEV__`,
só liga com `EXPO_PUBLIC_PTF_PERF_TRACE=1`, que **não está declarado em nenhum perfil do `eas.json`**.

---

## 5. Dados que NUNCA devem ser coletados (crianças)

| Categoria | Exemplos | Estado verificado |
|---|---|---|
| Dados de contato | e-mail, telefone, WhatsApp da criança | **não coletados** ✓ |
| Localização | GPS, cidade, CEP | **não coletada** ✓ |
| Biometria | Face ID, digital | **não coletada** ✓ |
| Imagem real | foto, selfie | **não coletada** ✓ — nenhuma dependência de câmera |
| Voz | microfone, gravação | **não coletada** ✓ — microfone desativado no `app.json` |
| Identificadores de rastreamento | IDFA, GAID, fingerprint | **não coletados pelo app** ✓ — ver §4 quanto ao SDK de assinatura |
| Idade da criança | data de nascimento, faixa | **não coletada** ✓ — coerente com `PL01A-04` e `PF5-FAIXA-ETARIA` |
| Histórico de navegação externa | sites visitados | **não coletado** ✓ |

> **Campo preparado e não conectado:** `createParentProfile` prevê um campo `email` do responsável,
> mas **nenhuma tela o utiliza** e nenhuma chamada a essa função foi encontrada. Deve permanecer
> desconectado enquanto não houver decisão de produto e base legal.

---

## 6. Exclusão de dados — estado real

| Mecanismo | Apaga | Preserva | Existe hoje? |
|---|---|---|---|
| **"Reiniciar progresso"** (Área dos Pais) | progresso, quiz, reflexão, Livrinho, estrelas bônus, conquistas vistas, momentos do Beni, Baú, Cultinho, **desenhos do Colorir legado** (chave + arquivo) e o progresso do Colorir 60 | pinturas do Colorir com o Beni, artes do Criar Livre, perfil, plano, entitlement, consentimentos, configurações, antifarming | **SIM** |
| **"Apagar pinturas do Colorir com o Beni"** | ponteiros + arquivos de `drawings60/`, com sonda de verificação | todo o resto | **SIM** |
| **"Apagar criações do Criar Livre"** | artes + arquivos de `atelier/` | todo o resto | **SIM** |
| **Desinstalar o app** | tudo | — | **SIM** |
| **"Apagar TODOS os dados locais"** | — | — | **NÃO EXISTE.** A tela mostra o texto e um selo *"Em preparação"*, **sem ação associada** |
| **Excluir perfil de criança** | apenas a entrada da lista de perfis | **não apaga** progresso, desenhos nem o perfil legado | existe, mas **não é exclusão de dados** |

Nenhum fluxo usa `AsyncStorage.clear()`; todos usam listas explícitas de chaves.

**Lacuna registrada:** não existe, hoje, um caminho único pelo qual o responsável apague **o nome da
criança e todas as produções** de uma vez. Ver E5.7 no parecer do Bloco 2.

---

## 7. Retenção

**NÃO EXISTE** política de retenção, TTL, expiração ou limpeza automática de dado pessoal. Toda
remoção depende de **ação explícita do responsável** (§6) ou da desinstalação.

Dois pontos técnicos correlatos, que **não** são retenção:

- `@ptf_lumi_moment_${data}` cria **uma chave por dia de uso** e só é removida em massa dentro do
  "Reiniciar progresso". Não há expurgo por idade.
- O `expiresAt` do entitlement é regra de **assinatura**, não de retenção de dado pessoal.

---

## 8. Portabilidade

**NÃO EXISTE** exportação de dados: nenhum "baixe seus dados", nenhum JSON/CSV/PDF, nenhuma gravação
na galeria do aparelho (não há `expo-media-library` nem `expo-sharing`). Os desenhos da criança
**não podem ser extraídos do app** por nenhum caminho oferecido ao responsável.

---

## 9. Consentimento — estado atual vs. necessário

| Item | Estado atual | O que falta |
|---|---|---|
| Nome da criança | coletado; a Área dos Pais informa que os dados ficam no aparelho | vincular o aviso ao **momento da coleta**, no onboarding |
| Progresso e produções | coletados pelo uso | mencionar explicitamente na política |
| Registro de consentimento | chave `@ptf_parental_consent_v1` existe e é gravável | o fluxo está atrás de flag; **não há consentimento verificável** no sentido do COPPA |
| Consentimento para envio externo | não existe | exigido **antes** de qualquer sincronização futura |
| Aviso sobre a validação de assinatura | **não existe em nenhum texto ao usuário** | ver E5.8 no parecer do Bloco 2 |

---

## 10. Quando sincronização em nuvem for implementada

1. **Consentimento explícito** dos responsáveis ANTES da primeira sincronização.
2. **Política de privacidade** atualizada com servidor, país de hospedagem e retenção.
3. Dados de crianças e de responsáveis em **tabelas separadas**.
4. **Criptografia em trânsito** (HTTPS TLS 1.2+).
5. **Criptografia em repouso** para dados pessoais.
6. **Direito de exclusão** com UI própria na Área dos Pais.

---

## 11. Responsável por este documento

[PLACEHOLDER — Nome do DPO ou responsável legal do projeto]
Revisão recomendada: a cada 6 meses ou quando nova funcionalidade de dados for adicionada.

> **Nota de escopo.** Este documento descreve o que o código faz, verificado por leitura em
> 2026-08-06. Ele **não** é parecer jurídico e **não** afirma conformidade legal. A revisão por
> advogado especializado permanece pendente e é dependência de terceiro externo.
