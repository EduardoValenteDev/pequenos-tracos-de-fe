# Fase 5 · Bloco 5 — Plano de Medição Anônima

**Criado em 2026-08-07 · documento de especificação · nenhuma linha de runtime alterada**

**Estado deste documento: PROPOSTA APRESENTADA AO FUNDADOR. NÃO APROVADO.**

---

## 0. O que este documento é, e o que ele não é

### 0.1 O que é

É a especificação de medição pedida pelo critério de saída da Fase 5
(`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` linha 249: *"plano de medição anônima aprovado"*).

Ele converte as **12 categorias de evento ratificadas na Fase 4E** (§8.2 do artefato de Product
Lock 4E) em uma especificação auditável, declarando para cada categoria os **14 campos obrigatórios**
determinados pelo fundador, dentro da **arquitetura de três camadas** congelada na resposta do
fundador à Pergunta 4 da Fase 4E.

### 0.2 O que NÃO é

| Não é | Por quê |
|---|---|
| **Não é implementação** | Nenhum código de analytics foi escrito. `src/`, `scripts/`, `App.js`, `app.json`, `eas.json`, `package.json` e `plugins/` permanecem intocados. |
| **Não é habilitação** | Nenhuma telemetria foi ligada, em nenhum perfil de build. `performanceTrace.js` não foi alterado. |
| **Não é parecer jurídico** | Nenhum advogado revisou este texto. Onde há afirmação de conformidade legal, ela está marcada como **dependente de terceiro externo**. |
| **Não é aprovação** | O plano só passa a valer com aprovação explícita do fundador. Até lá é proposta. |
| **Não é a correção de `P-85`** | Ver §0.3 imediatamente abaixo. |

### 0.3 `P-85` NÃO está corrigido — os três estados, separados

O fundador determinou: *"`P-85` NÃO pode ser marcado como CORRIGIDO apenas porque o plano foi
especificado."* Esta seção cumpre a determinação.

| Estado | Significado | `P-85` hoje |
|---|---|---|
| **1 · Especificação produzida na Fase 5** | Existe um documento que declara o que medir, com que campos, por quanto tempo, com que agregação e sob que condição. | ✅ **FEITO — é este documento** |
| **2 · Implementação técnica futura** | Existe código em `src/` que coleta, sumariza, valida esquema, respeita o desligamento e o consentimento. | ❌ **NÃO FEITO** — Fases 6, 9, 18, 19, 20, 21 e 22 conforme §12 |
| **3 · Validação futura** | Existe prova, em aparelho real e em ambiente real, de que o implementado corresponde ao especificado, e parecer jurídico externo sobre a terminologia e os limiares. | ❌ **NÃO FEITO** — depende de validação física e de terceiro externo |

**Portanto, na matriz canônica, `P-85` permanece `ABERTO` e `risco técnico NÃO corrigido`.** A linha
de `P-85` já registra, desde o Bloco 0 da Fase 5, que a coluna `Fase implementação = 5` se refere à
**entrega documental** e que *"a Fase 19 implementa o runtime correspondente"*. Este documento é essa
entrega documental, e nada além dela.

O mesmo vale para `P-127` (Fase 9) e `P-139` (Fase 6): a especificação de desempenho abaixo **não os
corrige**.

### 0.4 Terminologia obrigatória — a palavra "anônimo"

O fundador determinou, na Fase 4E: *"NÃO chamar esses dados de 'anônimos' automaticamente. A
designação correta é **'telemetria minimizada e não identificada na origem, agregada e anonimizada no
processamento'**, sujeita a validação na Fase 5."*

Este documento honra a determinação:

- O **título** deste bloco é "Plano de Medição Anônima" porque é o nome dado pelo critério de saída da
  v5 e pelo fundador. **O título é herdado, não é uma classificação de dado.**
- **Em todo o corpo do documento**, nenhum dado é chamado de "anônimo". A designação usada é
  **telemetria minimizada e não identificada na origem**, seguida, quando aplicável, de **agregada e
  anonimizada no processamento**.
- A **validação da terminologia** exigida pela 4E é tratada em §7.4, e o seu resultado é: a Fase 5
  **confirma a designação** como correta para uso interno e de produto, e **encaminha a validação
  jurídica externa** (`E5.57`), porque a suficiência da anonimização é questão de direito, não de
  engenharia.

### 0.5 Entradas canônicas deste bloco

| Fonte | O que forneceu |
|---|---|
| `docs/fase4-product-lock/05_PRODUCT_LOCK_4E_...md` §8.1 | estado atual: zero analytics, zero crash reporting, zero envio de evento |
| idem §8.2 | as **12 categorias** e sua classificação `P` / `C` / `POS` / `X` |
| idem, **Pergunta 4 — resposta do fundador** | a **arquitetura de três camadas**, as 21 restrições da Camada 3, a lista de dados proibidos, o exemplo aprovado de atributos técnicos, as quatro bases separadas, os limiares preliminares de microssegmentação |
| idem §9 e §9.1 | os dez identificadores e as seis regras de minimização |
| idem §10, §10.1, §10.2 | os dez contextos de log e as sete coisas que nunca podem aparecer em log |
| idem, **Pergunta 5 — resposta do fundador** | o contrato de consentimento adulto revogável e a proibição de consentimento omnibus |
| `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md` §3 | as fases proprietárias (única árbitra de sequência) |
| `docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md` | `P-85`, `P-100`, `P-127`, `P-139`, `P-141` |
| Blocos 0 a 4 da Fase 5 | `E5.1` a `E5.51`; o parecer de privacidade (Bloco 2); a auditoria de SDKs (Bloco 3) |
| runtime, **somente leitura** | `performanceTrace.js`, `packDownloadDiagnostics.js`, `brincarStatsService.js`, `parentSettingsService.js`, `storageKeys.js`, `featureFlags.js` |

Nenhuma auditoria dos Blocos 0 a 4 foi repetida. Nenhum bloco anterior foi reaberto.

---

## 1. A arquitetura de três camadas (congelada — não se reabre)

Transcrição normativa da resposta do fundador à Pergunta 4 da Fase 4E, organizada para uso como
referência das 12 categorias.

### 1.1 Camada 1 — métricas agregadas de loja

O que a App Store e o Google Play já entregam ao desenvolvedor sem nenhum código no app: aquisição,
instalações, dispositivos ativos, retenção, sessões, travamentos, ANRs, desempenho e conversão.

**Regra fundadora, literal:** *"Não recriar identificadores próprios para duplicar o que a loja já
entrega."*

Consequência operacional: **antes de especificar qualquer evento próprio, é obrigatório perguntar se
a loja já entrega a mesma informação.** Se entrega, a Camada 1 é a resposta e o evento próprio não
deve existir. Este documento aplica esse teste em cada uma das 12 categorias.

O projeto **não controla** a retenção nem o processamento da Camada 1. Ele os **declara**, não os
promete (§6.2, classe `RL`).

### 1.2 Camada 2 — instrumentação local rica

Instrumentação que **nunca sai do aparelho**, destinada a builds de pesquisa e a pilotos formais,
sempre **combinada com observação humana**.

**Regra fundadora, literal:** *"Analytics não conclui sozinho se uma criança 'aprendeu'."*

Consequência operacional: nenhum número da Camada 2 pode ser publicado como conclusão pedagógica sem
observação humana correspondente. A Camada 2 mede **uso**, não **aprendizado**.

### 1.3 Camada 3 — telemetria pública mínima, opcional e de primeira parte

As **21 restrições** determinadas pelo fundador, transcritas como lista de verificação executável.
Qualquer implementação futura da Camada 3 tem de satisfazer as 21.

| # | Restrição |
|---:|---|
| 1 | desligada por padrão |
| 2 | exige autorização adulta válida |
| 3 | o app é plenamente funcional sem ela |
| 4 | nenhum SDK de analytics comportamental de terceiro no lançamento |
| 5 | nenhum identificador persistente de criança |
| 6 | nenhum identificador persistente de aparelho para analytics |
| 7 | nenhum histórico individual longitudinal entre sessões |
| 8 | sumarização local preferida antes da transmissão |
| 9 | carimbos de tempo minimizados |
| 10 | uso de buckets |
| 11 | duração em faixas |
| 12 | atributos técnicos minimizados |
| 13 | esquema por allowlist |
| 14 | propriedades não previstas recusadas |
| 15 | códigos de erro sanitizados em log público |
| 16 | sem persistência de IP |
| 17 | sem User Agent completo |
| 18 | cabeçalhos desnecessários descartados |
| 19 | sem fingerprint |
| 20 | detalhe de aparelho mínimo — exemplo aprovado: `platform=ios, os_major=27, device_class=phone, app_version=1.0.0` |
| 21 | primeira parte — nenhum intermediário de publicidade ou atribuição |

**A Camada 3 permanece desligada por padrão e condicionada ao contrato de consentimento adulto
revogável aprovado na Pergunta 5 da Fase 4E.** Ver §9.

### 1.4 Regra de precedência entre camadas

Quando mais de uma camada puder responder à mesma pergunta, vale sempre **a camada de menor
exposição**:

> **Camada 1 > Camada 2 > Camada 3.**

Ou seja: prefira o agregado de loja; se não bastar, prefira o local; a Camada 3 é o último recurso e
exige justificativa própria por evento. Nenhuma categoria pode "subir" de camada por conveniência de
análise — subir de camada exige nova decisão do fundador.

---

## 2. As onze preservações invioláveis

O fundador determinou onze preservações obrigatórias. Cada uma é declarada abaixo com o **mecanismo
concreto** que a torna verificável, e não apenas prometida.

| # | Preservação | Mecanismo de garantia especificado |
|---:|---|---|
| 1 | **Nenhum identificador local convertido em identificador remoto** | O `childId` local estável, o `avatarId`, `child_<ts>_<rand>`, `art_<ts>_<rand>`, `@ptf_active_child_id_v1` e o `inviteCode` estão em uma **lista de negação de origem**: o validador de esquema recusa qualquer propriedade cujo valor seja igual, prefixo, sufixo, truncamento ou hash de qualquer um deles. §9.1 da 4E já proíbe explicitamente a derivação por hash, prefixo ou truncamento. |
| 2 | **Nenhum nome da criança** | Nenhum campo de nome existe na allowlist de esquema (§3.5). Toda propriedade fora da allowlist é **recusada**, não sanitizada. |
| 3 | **Nenhum texto criado pela criança** | Nenhum campo de tipo texto livre existe em nenhum evento das 12 categorias. **A allowlist não admite texto livre em lugar nenhum.** |
| 4 | **Nenhuma arte da criança** | Categoria 4 proíbe nominalmente arte, miniatura, base64, caminho `file://` e nome dado à arte. Só contadores em faixa. |
| 5 | **Nenhum conteúdo de oração** | Nenhum evento de oração existe em nenhuma categoria. A política de oração (§13) proíbe registrar vida espiritual, e a proibição vale também para a medição. |
| 6 | **Nenhuma igreja** | `inviteCode` e `group.id` do Modo Igreja **nunca entram na base PRODUTO**. O cruzamento Produto + igreja identificada está na lista de cruzamentos proibidos (§8). |
| 7 | **Nenhuma denominação** | Nenhum campo denominacional existe na allowlist. Inferência denominacional está na lista de dados proibidos da 4E (§18.4). |
| 8 | **Nenhum dado de fé** | §11 declara o que a medição **nunca** pode medir, incluindo fé, religiosidade, obediência espiritual e probabilidade de conversão. |
| 9 | **Nenhuma localização** | Nenhum campo geográfico na allowlist. Sem IP persistido (restrição 16). **Sem derivação de país a partir de IP** — se um dia for necessário, é decisão nova do fundador. |
| 10 | **Nenhum identificador publicitário** | Categoria 12 é proibição absoluta, com prova negativa já medida na 4E: `installationId`, `deviceId`, `randomUUID` e `uuid` têm **zero ocorrências** em `src/`. Gate automatizado encaminhado em `E5.59`. |
| 11 | **Nenhum conteúdo infantil em diagnóstico técnico** | As sete proibições absolutas de log da §10.1 da 4E valem integralmente para a Camada 2 e a Camada 3. O único descumprimento medido — `childProfileService.js:168` sob `__DEV__` — está registrado e encaminhado à fase proprietária, **não corrigido aqui**. |

**Regra de fecho:** a allowlist é o mecanismo primário das onze. Uma propriedade não prevista é
**recusada** — o evento inteiro é descartado, e não enviado parcialmente. Descartar é mais seguro que
sanitizar, porque sanitizar pressupõe conhecer o formato do vazamento.

---

## 3. Vocabulário normativo do plano

Sem vocabulário fixo, os 14 campos de cada categoria viram texto solto. Esta seção define os termos
usados no §4, para que a especificação seja auditável campo a campo.

### 3.1 Taxonomia de nomes de evento

Formato obrigatório: `<dominio>.<objeto>_<verbo_no_particípio>`

- ASCII minúsculo, `snake_case`, sem acento, sem espaço, sem `@`, sem URL, sem JSON.
- Expressão regular normativa: `^[a-z][a-z0-9_]{1,20}\.[a-z][a-z0-9_]{1,30}$`
- Domínios permitidos, fechados: `nav`, `progresso`, `brincar`, `criar`, `perf`, `erro`, `comercial`,
  `audio`, `pack`.
- **Nenhum domínio novo pode ser criado sem decisão do fundador.**

Esta regra é coerente com o que o runtime já pratica: `performanceTrace.js:85` já valida o nome da
marca contra `SAFE_NAME` e **retorna silenciosamente** quando o nome não passa.

### 3.2 Classes de retenção

| Classe | Definição | Exclusão |
|---|---|---|
| **R0** | **Sem retenção.** Existe só na memória do processo e morre com a sessão. Nada é gravado. | automática ao encerrar o app |
| **R1** | **Local persistente, sob controle do responsável.** Fica no aparelho até o adulto apagar ou desinstalar. Nunca sai do aparelho. | "Apagar dados" na Área dos Pais · desinstalação |
| **R2** | **Local rotativo curto.** Janela fixa declarada no aparelho (padrão: **7 dias** ou **os 200 registros mais recentes**, o que vier primeiro). | rotação automática · "Apagar dados" · desinstalação |
| **R3** | **Remoto por evento, curto.** No máximo **90 dias** como registro de evento no destino; depois, destruição do registro de evento e permanência apenas do agregado irreversível. | destruição programada aos 90 dias |
| **R4** | **Remoto apenas agregado.** Nunca existe registro por evento no destino: só contadores por período e por coorte. | n/a — não há registro individual a excluir |
| **RL** | **Retenção definida pela loja.** Fora do controle do projeto. O projeto **declara** a política da loja; **não promete** prazo próprio. | conforme a loja |
| **RT** | **Retenção transacional legal.** Registro fiscal/contratual de compra, com prazo determinado por lei e pelo processador. Não é telemetria e não é minimizável por decisão de produto. | conforme obrigação legal |

### 3.3 Classes de agregação

| Classe | Definição |
|---|---|
| **A0** | **Nenhuma.** Registro individual, exclusivamente local. |
| **A1** | **Sumarização local antes de qualquer saída.** Contadores e faixas calculados no aparelho; o registro bruto nunca sai. (Restrição 8 da Camada 3.) |
| **A2** | **Agregação por coorte no processamento**, com supressão de célula abaixo do limiar `k` (§7). |
| **A3** | **Só agregado de loja.** O projeto nunca vê o registro individual. |

### 3.4 Buckets normativos

Nenhum valor contínuo sai do aparelho. As faixas abaixo são normativas e fechadas.

| Grandeza | Faixas |
|---|---|
| **Duração** | `0-2s` · `2-5s` · `5-15s` · `15-60s` · `1-5min` · `5-15min` · `15-30min` · `>30min` |
| **Contagem** | `0` · `1` · `2-3` · `4-7` · `8-15` · `16-30` · `>30` |
| **Carimbo de tempo — Camada 2 (local)** | apenas a **data** (`AAAA-MM-DD`). Nenhuma hora. |
| **Carimbo de tempo — Camada 3 (público)** | apenas **semana ISO** (`2026-W32`) + **faixa horária de 6 horas** (`00-06`, `06-12`, `12-18`, `18-24`). **Nenhum carimbo com precisão de segundo, minuto ou hora sai do aparelho.** |
| **Versão de sistema operacional** | apenas o **major** (`27`), nunca `27.1.3` |

Justificativa da faixa horária de 6 horas: hora exata de uso, combinada com plataforma e versão, é
uma assinatura de rotina familiar. Faixa de 6 horas preserva a utilidade ("as crianças usam mais à
noite") sem produzir assinatura.

### 3.5 Allowlist de atributos técnicos — fechada em quatro

O fundador aprovou literalmente o exemplo `platform=ios, os_major=27, device_class=phone,
app_version=1.0.0`. Este plano **congela exatamente esses quatro** e nada mais:

| Atributo | Valores permitidos |
|---|---|
| `platform` | `ios` · `android` |
| `os_major` | inteiro |
| `device_class` | `phone` · `tablet` |
| `app_version` | versão publicada do app (`1.0.0`) |

**Proibidos explicitamente:** modelo do aparelho, fabricante, resolução, densidade de tela, idioma,
fuso horário, operadora, memória, `deviceName`, tipo de rede, e qualquer combinação adicional. Cada
atributo extra multiplica o poder de singularização; quatro atributos com esses domínios produzem
coortes largas.

### 3.6 As quatro condições que todo evento declara

- **Condição de coleta** — o que precisa ser verdade para o evento sequer existir.
- **Condição de desligamento** — o que, sendo verdade, faz o evento parar. Todo evento tem de ter
  pelo menos uma condição de desligamento **que não dependa de rede** (um interruptor remoto de
  desligamento seria, ele próprio, configuração remota — proibida pela categoria 11).
- **Destino** — uma das quatro bases separadas (§8).
- **Fase proprietária** — a fase do roteiro v5 §3 que implementa. Nunca "a Fase 5".

---

## 4. As doze categorias ratificadas — especificação completa

Legenda da 4E §8.2, mantida: **P** permitido no lançamento · **C** só com ação/consentimento do
responsável · **POS** posterior ao lançamento · **X** proibido.

Contagem exclusiva corrigida na §0.4 da 4E, mantida sem alteração: **0** com envio · **6** locais
(2, 3, 4, 5, 8, 9) · **2** posteriores (1, 6) · **2** condicionadas (7, 10) · **2** proibidas
(11, 12) = **12**.

---

### 4.1 Categoria 1 — Navegação da criança · `POS` (e `C` se sair do aparelho)

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | `nav.tela_aberta` — contagem por tela. Métrica derivada: **número de telas distintas por sessão**, em faixa. **Proibido o caminho ordenado de navegação.** |
| **2 · Finalidade** | Saber se as crianças **encontram** as áreas do app (Aventuras, Brincar, Criar, Estrelinhas), para corrigir descoberta ruim de funcionalidade. |
| **3 · Camada** | **2** no aparelho, em piloto formal. **3** apenas após o lançamento, e só com consentimento. Teste da §1.4: a loja **não** entrega navegação interna, então a Camada 1 não resolve. |
| **4 · Campos permitidos** | `screen_id` de allowlist fechada de rotas · `count_bucket` (§3.4) · os quatro atributos técnicos (§3.5) |
| **5 · Campos proibidos** | **a sequência ordenada de telas** · carimbo por evento · duração exata · `childId` · `avatarId` · qualquer texto · qualquer conteúdo de tela |
| **6 · Retenção** | **R2** local (7 dias / 200 registros). **R4** se algum dia sair — nunca R3, porque o registro por evento de navegação é a própria assinatura. |
| **7 · Agregação** | **A1** no aparelho · **A2** no processamento, `k ≥ 20` |
| **8 · Condição de coleta** | Somente em **build de pesquisa/piloto** com observação humana declarada. **Ausente do build de loja no lançamento.** |
| **9 · Condição de desligamento** | Não existe no build de produção — desligamento por **ausência de código no perfil de build**, que não depende de rede. Em piloto: fim do piloto, ou revogação, apaga a fila local e interrompe. |
| **10 · Consentimento adulto** | **Não** para a Camada 2 dentro de um piloto formal que já tem termo próprio. **Sim, obrigatório e específico**, para qualquer envio. |
| **11 · Destino** | Base **PRODUTO**. Nunca CRM, nunca PESQUISA identificada. |
| **12 · Risco de identificação** | **ALTO.** O trajeto de navegação é uma assinatura comportamental estável; duas sessões do mesmo aparelho seriam reconhecíveis mesmo sem identificador. |
| **13 · Mecanismo de prevenção** | Proibição da sequência ordenada (o risco está na ordem, não na tela) · faixas de contagem · allowlist fechada de `screen_id` · `k ≥ 20` · sem carimbo por evento |
| **14 · Fase proprietária** | **Fase 19** (instrumentação local e hardening) · **Fase 20** (declaração Data Safety / App Privacy) · **Fase 22** (qualquer habilitação pós-lançamento, com spec própria) |

---

### 4.2 Categoria 2 — Progresso de história e cena · `P` local · `C` para envio

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | `progresso.historia_iniciada` · `progresso.historia_concluida` · `progresso.cena_concluida` · `progresso.quiz_concluido`. Métrica central: **taxa de conclusão por história** e **cena de abandono mais frequente**. |
| **2 · Finalidade** | Saber quais histórias as crianças terminam e onde abandonam, para corrigir ritmo, duração e dificuldade — **do conteúdo**, não da criança. |
| **3 · Camada** | **2** (já é o próprio produto: o progresso local existe e é a funcionalidade). **3** apenas com consentimento, e apenas em forma de contador. |
| **4 · Campos permitidos** | `storyId` · `sceneId` · `quizId` — §9 da 4E declara que são **conteúdo, não pessoa** · `concluida` (booleano) · `duracao_bucket` · atributos técnicos (§3.5) |
| **5 · Campos proibidos** | nome · `childId` · `avatarId` · carimbo com precisão de segundo · **o conjunto completo de histórias concluídas em um único evento** · **histórico longitudinal individual entre sessões** (restrição 7) · resposta de quiz correlacionada ao aparelho |
| **6 · Retenção** | **R1** local — é o progresso do app, e apagá-lo por causa de telemetria seria dano à criança. **R3** (90 dias) se enviado. |
| **7 · Agregação** | **A0** local · **A1** antes de sair · **A2**, `k ≥ 20` |
| **8 · Condição de coleta** | Local: **sempre** — já ocorre hoje e é o produto. Envio: só com consentimento válido e não revogado. |
| **9 · Condição de desligamento** | Envio desligado por padrão. Revogação para o envio imediatamente. **Desligar a telemetria NUNCA apaga nem degrada o progresso local da criança** — esta é uma regra dura. |
| **10 · Consentimento adulto** | **Não** para o uso local. **Sim** para qualquer envio. |
| **11 · Destino** | Base **PRODUTO**. |
| **12 · Risco de identificação** | **MÉDIO.** O conjunto de histórias concluídas é quase único por criança; combinado com plataforma e versão, singulariza dentro de coorte pequena. |
| **13 · Mecanismo de prevenção** | **Nunca enviar o conjunto por aparelho:** cada história vira um contador independente, sem chave que os una · faixas de duração · `k ≥ 20` · sem histórico entre sessões |
| **14 · Fase proprietária** | **Fase 19** (runtime da camada local e do envio opcional) · **Fase 20** (declaração) |

Nota de qualidade de pergunta de quiz: contadores de acerto e erro **por pergunta**, sem chave de
aparelho, são permitidos na Camada 3, porque medem a **pergunta** — e o Bloco 4 mostrou que há
perguntas a corrigir. O que é proibido é a trajetória de respostas de uma criança.

---

### 4.3 Categoria 3 — Jogos do Brincar · `P` apenas local

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | Já existe e **não precisa de código novo**: `@ptf_brincar_stats_v1` (`storageKeys.js:53`), com a forma declarada em `brincarStatsService.js:18-20` — `pares: {facil,medio,dificil} × {plays, wins, bestMs, bestErros, bestMoves}` · `turbo × {plays, bestScore, bestPairs, bestCombo}` · `ovelha × {plays, encontradas, bestSequencia}` |
| **2 · Finalidade** | Calibrar dificuldade e equilíbrio dos três jogos. |
| **3 · Camada** | **2, exclusivamente.** A 4E determinou: *"apenas local (`@ptf_brincar_stats_v1`, sem ranking online)"*. |
| **4 · Campos permitidos** | os campos numéricos acima, por jogo e por dificuldade |
| **5 · Campos proibidos** | **ranking online** · comparação entre crianças · envio de recorde individual · nome · apelido · `childId` · `avatarId` |
| **6 · Retenção** | **R1** local. |
| **7 · Agregação** | **A0** local. **A1** obrigatória se algum dia houver envio: só **distribuição por faixa**, jamais o recorde. |
| **8 · Condição de coleta** | Sempre, localmente. Já ocorre hoje. |
| **9 · Condição de desligamento** | Não há envio a desligar. A exclusão é "Apagar dados" na Área dos Pais e a desinstalação. |
| **10 · Consentimento adulto** | **Não** — nada sai do aparelho. |
| **11 · Destino** | O aparelho. Nenhuma base remota. |
| **12 · Risco de identificação** | **BAIXO** enquanto local. **ALTO** se virar ranking: um recorde é quase único e, exibido publicamente, reidentifica. |
| **13 · Mecanismo de prevenção** | Proibição nominal de ranking online e de envio de recorde individual, já registrada na 4E e reafirmada aqui. |
| **14 · Fase proprietária** | **Fase 12A** (núcleo infantil e jogos), caso algum campo novo seja desejado. **Nenhuma alteração é necessária para este plano** — a instrumentação local suficiente já existe. |

---

### 4.4 Categoria 4 — Ateliê e Colorir · `P` apenas local

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | Contagem de artes criadas · contagem de desenhos de Colorir concluídos · uso de ferramenta em faixa. Nomes: `criar.arte_salva` · `criar.colorir_concluido`. |
| **2 · Finalidade** | Saber se as crianças **usam** o Ateliê e o Colorir e se terminam o que começam. |
| **3 · Camada** | **2, exclusivamente, no lançamento.** |
| **4 · Campos permitidos** | `activityId` / `coloringId` de allowlist fechada · `count_bucket` · `app_version` |
| **5 · Campos proibidos — o núcleo desta categoria** | **a arte** · a miniatura · o base64 · o caminho `file://` · **o nome dado pela criança à arte** · qualquer traço, cor por traço ou coordenada · `art_<ts>_<rand>` e o composto de 60 do Colorir (**são identificadores com carimbo temporal embutido: revelam a hora exata de uso**) |
| **6 · Retenção** | **R1** local. |
| **7 · Agregação** | **A0** local. |
| **8 · Condição de coleta** | Sempre, localmente. **Nenhum envio no lançamento**, nem com consentimento: o objeto medido é criação infantil, e só a contagem poderia algum dia sair — o que exigiria spec própria. |
| **9 · Condição de desligamento** | Não há envio a desligar. |
| **10 · Consentimento adulto** | **Não** para o uso local. Qualquer envio futuro exige consentimento **e** spec própria **e** decisão nova do fundador. |
| **11 · Destino** | O aparelho. |
| **12 · Risco de identificação** | **CRÍTICO** se qualquer campo de conteúdo escapar. Uma arte é conteúdo criado por criança identificável pelos pais; um nome de arte é texto livre infantil. |
| **13 · Mecanismo de prevenção** | Allowlist que **recusa** propriedade não prevista (restrição 14) · proibição nominal do campo de arte e do nome da arte · proibição de `art_<ts>_<rand>` por causa do carimbo · nenhum campo de texto livre existe em lugar nenhum do esquema (§2, preservação 3) |
| **14 · Fase proprietária** | **Fase 19.** **Dependência dura:** a contagem só é confiável depois de `P-141` resolvido — hoje o endereço de armazenamento varia com o `avatarId`, então trocar o avatar corrompe qualquer contador de artes. Encaminhado em `E5.60`. |

---

### 4.5 Categoria 5 — Desempenho (boot, latência, FPS) · `P` local e em build interno · `C` para envio

Riscos vinculados: `P-127` (boot instrumentado sem amostra) e `P-139` (coletor inalcançável em
qualquer perfil de build).

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | `perf.boot` com as fases **já instrumentadas** por `performanceTrace.js`: portão de fonte (`font_gate_*`), decisão de rota (`route_decision_*`), tempo até interativo. Medidas via `measure(name, startMark, endMark)` (`:108-115`). |
| **2 · Finalidade** | Ter uma **linha de base de desempenho** e detectar regressão entre versões — sobretudo em Android de baixa memória (objetivo declarado da Fase 19). |
| **3 · Camada** | **2** em build interno. **3** apenas com consentimento. Teste da §1.4: a loja **já entrega** métricas de desempenho agregadas (Camada 1) — por isso a Camada 3 de desempenho **não é prioritária** e pode nunca ser necessária. |
| **4 · Campos permitidos** | nome de marca validado pela allowlist já existente — `SAFE_NAME = /^[a-z][a-z0-9_]{0,39}$/` (`performanceTrace.js:32`), aplicada em `:85` e `:95` · **duração em faixa** (§3.4) · os quatro atributos técnicos (§3.5) · motivo do portão (`fontReason`, `routeReason`, `:254-257`) |
| **5 · Campos proibidos** | **qualquer conteúdo infantil em `metadata`** · `storyId` correlacionado ao progresso da criança · identificador de aparelho · **modelo exato do aparelho** · carimbo absoluto · duração com precisão de milissegundo saindo do aparelho |
| **6 · Retenção** | **R0** hoje — `events` e `measures` são arrays em memória (`:40`), destruídos no fim do processo. **R2** se persistido em build interno. **R3** (90 dias) se algum dia enviado. |
| **7 · Agregação** | **A1** no aparelho · **A2** no processamento, com percentis calculados sobre coorte, `k ≥ 20` |
| **8 · Condição de coleta** | Hoje: **só** em `__DEV__` **ou** com `EXPO_PUBLIC_PTF_PERF_TRACE` ligada (`:44-52`) — e essa variável **não é declarada por nenhum dos cinco perfis do `eas.json`**, que é exatamente `P-139`. A Fase 6 habilita em perfil interno; a Fase 9 coleta a linha de base. |
| **9 · Condição de desligamento** | **Ausência da variável de ambiente = desligado**, e essa condição não depende de rede. Nenhum envio sem consentimento. |
| **10 · Consentimento adulto** | **Não** para uso local e build interno (não sai do aparelho e o build não é público). **Sim** para qualquer envio público. |
| **11 · Destino** | Base **PRODUTO** (saúde técnica). **Nunca cruzado com identidade infantil.** |
| **12 · Risco de identificação** | **MÉDIO.** `device_class` + `os_major` + `app_version` + duração fina aproxima-se de fingerprint. É por isso que a duração sai em faixa e que o modelo do aparelho é proibido. |
| **13 · Mecanismo de prevenção** | A allowlist `SAFE_NAME` (`:32`) **já existe no runtime** e rejeita espaço, acento, `@`, URL e JSON — nome inválido faz `mark` **retornar silenciosamente** (`:85`) · faixas de duração · exatamente quatro atributos técnicos · `metadata` passa por `sanitizeMetadata` (`:64`, aplicada em `:87`) |
| **14 · Fase proprietária** | **Fase 6** — habilitar o coletor em perfil interno (`P-139`) · **Fase 9** — coletar a linha de base em aparelho real (`P-127`) · **Fase 19/20** para qualquer envio |

**A Fase 5 não alterou `performanceTrace.js` nem `eas.json`.** A divergência de fase registrada em
`P-139` (Fase 3 na v5 e em `DECISIONS.md`, Fase 9 no baseline, Fase 6 na matriz) **não é resolvida
aqui** — ela já estava registrada como divergência não resolvida e permanece assim.

---

### 4.6 Categoria 6 — Erros e crashes · `POS`

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | **No lançamento: nenhum evento próprio.** A métrica é a **taxa de travamento e de ANR entregue pela loja** (Camada 1). Se algum dia houver coletor próprio: `erro.excecao_capturada`. |
| **2 · Finalidade** | Saber se o app quebra, e onde. v5 Fase 22 determina literalmente *"monitoramento de falhas sem dados pessoais"*. |
| **3 · Camada** | **1** no lançamento. **3** só depois, com spec própria. |
| **4 · Campos permitidos** | Camada 1: o que a loja entrega, agregado. Camada 3 futura: `error_code` **sanitizado, de allowlist fechada** (restrição 15) · `screen_id` · os quatro atributos técnicos. |
| **5 · Campos proibidos** | **stack trace bruto** (vaza caminho de arquivo e, em alguns ambientes, nome de usuário do sistema) · mensagem de erro livre · conteúdo de estado da aplicação · qualquer campo das sete proibições absolutas de log (§10.1 da 4E) · qualquer conteúdo infantil |
| **6 · Retenção** | **RL** — definida pela loja, fora do controle do projeto e **declarada, não prometida**. **R3** (90 dias) caso algum dia haja coletor próprio. |
| **7 · Agregação** | **A3** (loja) · **A2** se próprio |
| **8 · Condição de coleta** | **Nenhuma coleta própria no lançamento.** A 4E mediu: zero crash reporting em `src/`. Adotar coletor próprio exige spec própria e decisão do fundador. |
| **9 · Condição de desligamento** | Não existe para desligar — é o estado atual e é o estado desejado no lançamento. |
| **10 · Consentimento adulto** | **Não aplicável à Camada 1** — o canal é da loja, e o desenvolvedor não é o controlador desse fluxo. **Sim, obrigatório**, para qualquer coletor próprio. |
| **11 · Destino** | Console da loja · base **PRODUTO** se algum dia próprio |
| **12 · Risco de identificação** | **ALTO no formato bruto.** É por isso que a proibição incide sobre o formato (stack trace, mensagem livre) e não apenas sobre o dado. |
| **13 · Mecanismo de prevenção** | **Nenhum SDK de crash reporting de terceiro no lançamento** (restrição 4) · allowlist fechada de código de erro · sanitização obrigatória · auditoria de SDK a cada release (`E5.59`) |
| **14 · Fase proprietária** | **Fase 20** (declaração e configuração dos consoles) · **Fase 22** (operação: *"monitoramento de falhas sem dados pessoais"*) |

---

### 4.7 Categoria 7 — Eventos comerciais · `C` (superfície adulta)

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | `comercial.paywall_exibido` · `comercial.compra_iniciada` · `comercial.compra_concluida` · `comercial.restauracao_executada`. Fonte real dos dados: **RevenueCat e os consoles das lojas**, não instrumentação própria. |
| **2 · Finalidade** | Funil comercial adulto: entender se o Plano Família é compreendido e concluído. |
| **3 · Camada** | Fora das três camadas de telemetria de produto: é **transacional e contratual**. O funil derivado é Camada 1/2. |
| **4 · Campos permitidos** | `product_id` · `plan_id` · resultado (`sucesso`, `cancelado`, `erro`) · `app_version` · `platform`. O `appUserID` do RevenueCat **existe e sai do aparelho** — pertence à base **COMERCIAL ADULTA**, nunca à base PRODUTO. |
| **5 · Campos proibidos** | `childId` · `avatarId` · **qualquer derivação do `childId` por hash, prefixo ou truncamento dentro do `appUserID`** (§9.1 da 4E, proibição literal) · progresso infantil · nome da criança · igreja · denominação |
| **6 · Retenção** | **RT** — prazo legal e contratual, definido pelo processador e pela obrigação fiscal. **Não é minimizável por decisão de produto**, e este plano não finge que seja. |
| **7 · Agregação** | **A0** na base transacional (legítimo e necessário) · **A2** quando publicado como funil |
| **8 · Condição de coleta** | Somente na **superfície adulta**, atrás do portão. **Nenhum evento comercial pode ser disparado por tela infantil.** |
| **9 · Condição de desligamento** | Não desligável — é transacional. **O que é desligável não é o evento, é o cruzamento com a base PRODUTO — e esse cruzamento é proibido, não opcional.** |
| **10 · Consentimento adulto** | O consentimento de **telemetria** não se aplica: a base legal é **execução de contrato**. Declarar essa distinção corretamente nos formulários é obrigação da Fase 20. Confundir as duas bases legais seria erro de conformidade. |
| **11 · Destino** | Bases **COMERCIAL ADULTA** e **TRANSACIONAL**. |
| **12 · Risco de identificação** | **ALTO de correlação** — o `appUserID` é hoje **o único identificador que já sai do aparelho** (4E §9). Ele é o ponto de junção mais perigoso do sistema inteiro. |
| **13 · Mecanismo de prevenção** | Proibição literal de escrever `childId` no `appUserID` · separação física de bases · **nenhum join entre COMERCIAL e PRODUTO**, em nenhuma direção · revisão dessa proibição a cada release |
| **14 · Fase proprietária** | **Fase 18** (RevenueCat e Plano Família) · **Fase 20** (declaração de conformidade) |

---

### 4.8 Categoria 8 — Áudio (autoplay, mudo) · `P` apenas local

Risco vinculado: `P-100`.

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | Preferências já persistidas em `@ptf_audio_prefs_v1` (`storageKeys.js`): mudo, volume, autoplay. Contador local de bloqueio de autoplay: `audio.autoplay_bloqueado`. |
| **2 · Finalidade** | Saber se as famílias desligam o som e se o autoplay é bloqueado pelo sistema — decisão de orquestração sonora da Fase 8A. |
| **3 · Camada** | **2, exclusivamente.** |
| **4 · Campos permitidos** | booleanos e enums locais de preferência · `count_bucket` de bloqueio |
| **5 · Campos proibidos** | **qualquer gravação de voz** — não existe no app e é proibida · qualquer amostra de áudio · qualquer identificação |
| **6 · Retenção** | **R1** local. |
| **7 · Agregação** | **A0** local. |
| **8 · Condição de coleta** | Sempre, localmente. |
| **9 · Condição de desligamento** | Não há envio a desligar. |
| **10 · Consentimento adulto** | **Não.** A Pergunta 5 da 4E é literal: *"ouvir áudio local não equivale a enviar dado"*, e o **áudio do Beni não é agrupado ao consentimento de telemetria**. `P-100` é resolvido por um cartão acolhedor de primeiro contato, não por um pedido de consentimento. |
| **11 · Destino** | O aparelho. |
| **12 · Risco de identificação** | **BAIXO.** |
| **13 · Mecanismo de prevenção** | Nada sai · nenhuma permissão de microfone é solicitada pelo app · nenhuma captura de áudio existe |
| **14 · Fase proprietária** | **Fase 8A** (orquestração sonora). |

---

### 4.9 Categoria 9 — Diagnóstico de download de packs · `P` apenas local e em DEV

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | **Já existe e já é seguro por construção:** `packDownloadDiagnostics.js`. Campos: `FAILURE_STAGES` (`config`, `publish`, `cancelled`, `none`) · `NETWORK_STATES` (`nao_consultada`, `indisponivel`, `alcancada`, `indeterminado`) · estado do índice (`indexStateFromEntry`, `INDEX_NOT_COMMITTED`) · `failedFile` passado por `sanitizePath`. |
| **2 · Finalidade** | Diagnosticar falha de download de pack de conteúdo durante o desenvolvimento. |
| **3 · Camada** | **2, e apenas em DEV.** |
| **4 · Campos permitidos** | os enums fechados acima · `packId` · caminho relativo dentro do pack (`scenes/01.webp`) · `app_version` |
| **5 · Campos proibidos** | URL · host · query · token · assinatura · `apikey` — **já barrados pelo runtime**: `PARECE_URL` (`:43`) e as funções `sanitize` / `sanitizePath` (`:81-94`) substituem o valor por `[oculto]`. Também proibido: **qualquer conteúdo infantil**. |
| **6 · Retenção** | **R0** (console) ou **R2** se algum dia persistido; somente em DEV. |
| **7 · Agregação** | **A0.** |
| **8 · Condição de coleta** | Somente em DEV. A Fase 19 entrega literalmente *"revisão de superfícies internas e ferramentas de desenvolvimento"* e *"nenhuma ferramenta interna alcançável em produção"* — é lá que a inalcançabilidade em produção é **provada**, não presumida. |
| **9 · Condição de desligamento** | Ausência em produção por construção do build; não depende de rede. |
| **10 · Consentimento adulto** | **Não** — nada sai do aparelho. |
| **11 · Destino** | Console de desenvolvimento. |
| **12 · Risco de identificação** | **BAIXO** enquanto local e em DEV. **MÉDIO** se algum dia enviado: `packId` mais falha revela qual conteúdo a família adquiriu. |
| **13 · Mecanismo de prevenção** | A rede de segurança contra vazamento **já implementada** no runtime · proibição de envio · prova de inalcançabilidade em produção na Fase 19 |
| **14 · Fase proprietária** | **Fase 19.** |

---

### 4.10 Categoria 10 — Pesquisa com responsáveis · `C`, nunca dirigida à criança

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | **Não é evento de telemetria.** É instrumento de pesquisa: questionário voluntário, aplicado **fora do app** ou atrás do portão adulto, apenas em **piloto formal**. |
| **2 · Finalidade** | Entender a experiência da família — o que analytics, por determinação do fundador, **não conclui sozinho**. |
| **3 · Camada** | **2**, combinada com observação humana. Nunca alimenta a Camada 3. |
| **4 · Campos permitidos** | respostas **do adulto** sobre a experiência, em base **PESQUISA** isolada, com consentimento próprio, específico e informado |
| **5 · Campos proibidos** | **dirigir a pesquisa à criança** · qualquer resposta que contenha nome, igreja, denominação ou localização — e, se contiver, a resposta é **descartada, não sanitizada** · cruzamento com PRODUTO ou CRM |
| **6 · Retenção** | Prazo declarado no termo do piloto, limitado ao necessário. Como a pesquisa **é identificada por natureza**, a exclusão a pedido **é possível** — e é justamente por ser identificada que ela **não pode encostar** na base PRODUTO. |
| **7 · Agregação** | **A2** na publicação: `k ≥ 20`, e `k ≥ 50` para qualquer recorte religioso (§7). |
| **8 · Condição de coleta** | Só em piloto formal com termo próprio. **Nenhum questionário geral in-app na versão 1** — determinação literal da Pergunta 5 da 4E. |
| **9 · Condição de desligamento** | Participação recusável a qualquer momento, **sem prejuízo de nada no app**. Fim do piloto encerra a coleta. |
| **10 · Consentimento adulto** | **Sim** — específico, informado, revogável, e **separado** do consentimento de telemetria. Agrupar os dois seria consentimento omnibus, proibido. |
| **11 · Destino** | Base **PESQUISA**, isolada das outras três. |
| **12 · Risco de identificação** | **ALTO por natureza** — a pesquisa é identificada. O risco é gerenciado por **isolamento**, não por minimização. |
| **13 · Mecanismo de prevenção** | Isolamento físico de base · proibição absoluta de join · descarte de resposta aberta que contenha dado sensível · nunca dirigida à criança |
| **14 · Fase proprietária** | **Fase 21** (beta fechado com famílias reais). |

---

### 4.11 Categoria 11 — Testes A/B e configuração remota · `X` no lançamento

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | **Nenhum. Proibido.** |
| **2 · Finalidade** | Não se aplica — a categoria existe para ser negada explicitamente. |
| **3 · Camada** | Nenhuma. |
| **4 · Campos permitidos** | **Nenhum campo.** |
| **5 · Campos proibidos** | Todos. Em especial: **experimentar com criança sem consentimento**, que é o motivo ético da proibição — a criança seria sujeito de experimento sem poder consentir e sem que o adulto soubesse. |
| **6 · Retenção** | Não se aplica. |
| **7 · Agregação** | Não se aplica. |
| **8 · Condição de coleta** | **Proibida.** |
| **9 · Condição de desligamento** | Já desligado: **nenhum SDK de configuração remota ou de experimentação existe no projeto** (medido na Fase 4E e na auditoria de SDKs do Bloco 3). |
| **10 · Consentimento adulto** | **Irrelevante — proibição não é suprida por consentimento.** Nem com autorização adulta esta categoria é liberada no lançamento. |
| **11 · Destino** | Nenhum. |
| **12 · Risco de identificação** | Não é o risco principal. O risco principal é **ético e regulatório**: experimentação comportamental com público infantil. |
| **13 · Mecanismo de prevenção** | Proibição de adotar SDK de configuração remota ou experimentação · auditoria de SDK a cada release (`E5.59`) · qualquer adoção **reabre esta decisão com o fundador** |
| **14 · Fase proprietária** | **Nenhuma. SEM FASE PROPRIETÁRIA** — não há fase que implemente o que é proibido. |

**Distinção normativa obrigatória — EAS Update NÃO é configuração remota** (`E5.62`). A v5 Fase 20
prevê *"estratégia de atualização entre versões"* com EAS Update, e a Fase 21 exige provar a
atualização real de uma versão instalada para a seguinte. **EAS Update entrega código e asset iguais
para todos**; ele não segmenta crianças, não sorteia variantes, não observa comportamento e não
retorna dado. Confundir os dois criaria uma contradição falsa entre este plano e o roteiro. **EAS
Update é permitido; segmentação comportamental por configuração remota é proibida.**

---

### 4.12 Categoria 12 — Identificador de dispositivo, atribuição e publicidade · `X` proibido

| Campo obrigatório | Declaração |
|---|---|
| **1 · Evento ou métrica** | **Nenhum. Proibição absoluta.** |
| **2 · Finalidade** | Não se aplica. |
| **3 · Camada** | Nenhuma. |
| **4 · Campos permitidos** | **Nenhum.** |
| **5 · Campos proibidos** | Advertising ID · IDFA · AAID · Android ID · IMEI · IMSI · MAC · SSID · BSSID · qualquer identificador persistente equivalente · `installationId` · `deviceId` · `randomUUID` gerado para fim de analytics · fingerprint de aparelho · qualquer SDK de atribuição |
| **6 · Retenção** | Não se aplica. |
| **7 · Agregação** | Não se aplica. |
| **8 · Condição de coleta** | **Proibida.** Prova negativa medida na Fase 4E: `installationId`, `deviceId`, `randomUUID` e `uuid` têm **zero ocorrências** em `src/`. |
| **9 · Condição de desligamento** | Já ausente. O estado atual é o estado desejado, permanentemente. |
| **10 · Consentimento adulto** | **Irrelevante — proibição absoluta.** Nem com autorização adulta. |
| **11 · Destino** | Nenhum. |
| **12 · Risco de identificação** | Seria **CRÍTICO**: um identificador publicitário destrói de uma vez todas as onze preservações da §2. |
| **13 · Mecanismo de prevenção** | Proibição de SDK de atribuição · auditoria de SDK antes de cada release · declaração **"não coletado"** nos formulários Data Safety e App Privacy · **teste automatizado de regressão que falha se qualquer um desses nomes aparecer em `src/`** (`E5.59`) |
| **14 · Fase proprietária** | **Fase 19** (gate automatizado) e **Fase 20** (declaração). **Nenhuma fase implementa a coleta, porque a coleta é proibida.** |

---

## 5. Quadro-resumo das doze categorias

| # | Categoria | 4E | Camada | Retenção | Agregação | Consentimento | Destino | Risco | Fase proprietária |
|---:|---|:--:|:--:|:--:|:--:|:--:|---|:--:|---|
| 1 | Navegação da criança | `POS` | 2 → 3 | R2 / R4 | A1·A2 | só p/ envio | PRODUTO | ALTO | 19 · 20 · 22 |
| 2 | Progresso de história e cena | `P`/`C` | 2 → 3 | R1 / R3 | A0·A1·A2 | só p/ envio | PRODUTO | MÉDIO | 19 · 20 |
| 3 | Jogos do Brincar | `P` | 2 | R1 | A0 | não | aparelho | BAIXO | 12A (se houver campo novo) |
| 4 | Ateliê e Colorir | `P` | 2 | R1 | A0 | não | aparelho | CRÍTICO se vazar | 19 (depende de `P-141`) |
| 5 | Desempenho | `P`/`C` | 1 · 2 → 3 | R0 / R2 / R3 | A1·A2 | só p/ envio | PRODUTO | MÉDIO | **6** · **9** · 19/20 |
| 6 | Erros e crashes | `POS` | 1 | RL / R3 | A3 / A2 | só se próprio | loja | ALTO se bruto | 20 · 22 |
| 7 | Eventos comerciais | `C` | transacional | RT | A0 / A2 | base legal ≠ consentimento | COMERCIAL · TRANSACIONAL | ALTO (correlação) | 18 · 20 |
| 8 | Áudio | `P` | 2 | R1 | A0 | **não** | aparelho | BAIXO | 8A |
| 9 | Diagnóstico de packs | `P` | 2 (DEV) | R0 / R2 | A0 | não | console DEV | BAIXO | 19 |
| 10 | Pesquisa com responsáveis | `C` | 2 | termo do piloto | A2 | **sim, separado** | PESQUISA | ALTO por natureza | 21 |
| 11 | A/B e config remota | `X` | — | — | — | irrelevante | — | ético/regulatório | **sem fase** |
| 12 | Identificador publicitário | `X` | — | — | — | irrelevante | — | seria CRÍTICO | 19 (gate) · 20 (declaração) |

**Categorias que enviam dado no lançamento: 0.** Isso não mudou em relação ao estado medido na
Fase 4E — este plano especifica o futuro, não altera o presente.

---

## 6. Retenção, exclusão e anonimização — congeladas nesta fase

A Fase 4E declarou: *"Apenas direção conservadora nesta fase; retenção, exclusão e anonimização
definitivas são congeladas na Fase 5."* Esta seção cumpre a delegação.

### 6.1 As classes de retenção estão congeladas

As classes `R0`, `R1`, `R2`, `R3`, `R4`, `RL` e `RT` da §3.2 são **normativas** a partir da aprovação
deste plano. Nenhuma categoria pode usar classe fora dessa lista, e nenhuma classe pode ser afrouxada
sem decisão do fundador.

Prazos congelados: **R2 = 7 dias ou 200 registros** · **R3 = 90 dias como registro de evento**, com
destruição programada e permanência apenas do agregado irreversível.

### 6.2 Retenção que o projeto NÃO controla — declarada, não prometida

`RL` (loja) e `RT` (transacional) estão **fora do controle do projeto**. Este plano se recusa a
prometer prazos que não pode cumprir. A obrigação correspondente é **declarar corretamente** essas
retenções nos formulários da Fase 20 — obrigação, não promessa (`E5.58`).

### 6.3 Exclusão

| Caminho | O que apaga | Onde vive |
|---|---|---|
| **"Apagar dados" na Área dos Pais** | tudo que for `R1` e `R2` — progresso, jogos, artes, preferências, diagnósticos locais | Área dos Pais, Fase 7 |
| **Desinstalação** | todo o armazenamento local do app | sistema operacional |
| **Revogação do consentimento** | **interrompe o envio futuro** e apaga a fila local ainda não enviada | motor de consentimento, Fase 19 |
| **Destruição programada (R3)** | o registro de evento no destino, aos 90 dias | processamento |

### 6.4 A consequência honesta: exclusão individual é impossível na Camada 3

**Esta é uma consequência inevitável do desenho, e este plano a declara em vez de escondê-la**
(`E5.63`).

A Camada 3 é, por construção, **não identificada na origem**: não há identificador de criança nem de
aparelho (restrições 5 e 6). Logo, **não existe chave capaz de localizar "os dados desta família" no
destino** — e portanto a exclusão individual do que já foi enviado é tecnicamente impossível.

Três consequências normativas decorrem disso, e todas são vinculantes:

1. **A revogação vale para o futuro.** O contrato de consentimento (§9) tem de dizer isso com
   clareza, em linguagem simples, **antes** de o adulto aceitar. Prometer exclusão retroativa seria
   mentira.
2. **A retenção da Camada 3 tem de ser curta.** É por isso que `R3` é 90 dias e não mais.
3. **A Camada 3 só pode enviar aquilo que uma família aceitaria não poder recuperar.** Este é o
   critério de decisão para qualquer evento futuro que alguém queira acrescentar à Camada 3. Se a
   resposta for "não", o evento não pertence à Camada 3.

### 6.5 O pipeline de anonimização — sete passos, nesta ordem

1. **Sumarização local** — contadores e faixas calculados no aparelho (restrição 8).
2. **Validação por allowlist na origem** — o esquema recusa propriedade não prevista; o evento
   inteiro é **descartado**, nunca enviado parcialmente (restrições 13 e 14).
3. **Descarte de rede na borda** — IP não persistido, User Agent completo não registrado, cabeçalhos
   desnecessários descartados (restrições 16, 17, 18).
4. **Bucketização** — nenhum valor contínuo, nenhum carimbo fino (restrições 9, 10, 11 e §3.4).
5. **Supressão por limiar `k`** no processamento — célula abaixo de `k` é **suprimida**, não
   arredondada (§7).
6. **Agregação irreversível** — o agregado publicado não permite reconstruir o evento.
7. **Destruição do registro de evento aos 90 dias** (`R3`).

**Só depois do passo 7 o dado pode ser chamado de anonimizado.** Antes disso, a designação correta é
"minimizado e não identificado na origem". É exatamente a distinção que o fundador exigiu em §0.4.

---

## 7. Microssegmentação e limiar de reidentificação

### 7.1 O que a Fase 4E deixou para cá

A 4E fixou uma referência **preliminar, a validar na Fase 5**: cerca de **20 sessões** como mínimo
geral, e preferencialmente **50 ou mais** em contexto de Modo Igreja ou religioso, declarando-a
*"salvaguarda operacional inicial, NÃO declaração jurídica definitiva"*.

### 7.2 Validação da Fase 5 — o que fica congelado

A Fase 5 **confirma e congela** os limiares como **salvaguarda operacional**:

| Regra | Valor congelado |
|---|---|
| Coorte geral publicada ou analisada | **`k ≥ 20`** |
| Coorte que toque Modo Igreja ou contexto religioso | **`k ≥ 50`** |
| Célula abaixo do limiar | **suprimida**, nunca arredondada — arredondar preserva a informação de que a célula existe |
| Cruzamento que reduza qualquer célula abaixo de `k` | **proibido**, ainda que cada tabela isolada satisfaça `k` |
| Número máximo de atributos que definem simultaneamente uma coorte | **3** |
| Texto livre em qualquer coorte | **nenhum, em nenhuma hipótese** |

As três últimas regras são **acréscimos da Fase 5**, e existem porque o limiar `k` sozinho não
protege: a reidentificação prática costuma vir do **cruzamento sucessivo de tabelas individualmente
seguras**, não de uma célula pequena isolada.

### 7.3 Por que 50 no contexto religioso

Uma congregação é uma população pequena e geograficamente concentrada. Um recorte religioso com 20
sessões pode corresponder a um único grupo identificável — e o dado inferido seria dado de fé, que a
§2 preservação 8 proíbe. `k ≥ 50` é a compensação operacional. Encaminhado à Fase 12B (`E5.64`).

### 7.4 Validação da terminologia — o que a Fase 5 pode e o que não pode afirmar

| Afirmação | Estado |
|---|---|
| A designação *"telemetria minimizada e não identificada na origem, agregada e anonimizada no processamento"* descreve corretamente o desenho especificado neste plano | ✅ **Confirmado pela Fase 5** — é descrição de engenharia, e a engenharia está especificada acima |
| Os limiares `k ≥ 20` e `k ≥ 50` são salvaguardas operacionais razoáveis | ✅ **Confirmado pela Fase 5** como salvaguarda operacional |
| Os dados resultantes são **legalmente** anônimos sob LGPD, GDPR/GDPR-K, COPPA ou equivalentes | ❌ **A Fase 5 NÃO pode afirmar isso.** É questão de direito. **`E5.57` — DEPENDENTE DE TERCEIRO EXTERNO** |
| Os limiares são suficientes para a autoridade competente | ❌ **Não afirmado.** Mesma dependência. |

**Nenhuma ausência de evidência foi convertida em prova de ausência nesta seção.** Onde falta parecer
jurídico, está escrito que falta.

---

## 8. As quatro bases separadas e os cruzamentos proibidos

Congelado conforme a Pergunta 4 da Fase 4E.

| Base | O que contém | Identificada? |
|---|---|---|
| **PRODUTO** | telemetria minimizada e não identificada na origem, das categorias 1, 2, 5 e (futuramente) 6 | **não** |
| **PESQUISA** | respostas de adultos em piloto formal, categoria 10 | **sim, por natureza** |
| **COMERCIAL ADULTA** | funil e assinatura, categoria 7, incluindo o `appUserID` | **sim** |
| **TRANSACIONAL** | registro fiscal e contratual de compra | **sim, por obrigação legal** |

**Cruzamentos proibidos** (transcrição da 4E, mantida sem alteração):

- Produto + CRM
- Produto + identidade infantil
- Produto + religião
- Produto + denominação
- Produto + igreja identificada

**Regra de fecho da 4E, literal:** *"Nenhum 'superperfil'."*

**Acréscimo normativo da Fase 5:** a proibição incide sobre o **cruzamento**, não apenas sobre o
armazenamento conjunto. Manter as bases em sistemas distintos não autoriza uni-las em um relatório,
em uma planilha ou em uma consulta ad hoc. A proibição vale para a análise, não só para a
infraestrutura.

---

## 9. O contrato de consentimento adulto revogável

Congelado na Pergunta 5 da Fase 4E. Esta seção especifica o que a implementação futura tem de
satisfazer, e registra a divergência medida no runtime atual.

### 9.1 As seis condições do contrato

| # | Condição (literal da 4E) | Verificação futura |
|---:|---|---|
| 1 | **desligada por padrão** | estado inicial sem consentimento = sem envio |
| 2 | **autorização específica em ambiente adulto** | atrás do portão da Área dos Pais |
| 3 | **recusa não prejudica o app** | app plenamente funcional, sem degradação, sem lembrete recorrente |
| 4 | **decisão revogável** | revogação disponível no mesmo lugar da concessão, com o mesmo número de toques |
| 5 | **sem dark patterns** | recusa e aceite com o mesmo peso visual; nenhum botão de recusa apagado |
| 6 | **opção de recusa digna** | a recusa não é apresentada como perda |

### 9.2 Nenhuma recompensa infantil por consentir

Determinação literal do fundador: *"o Beni não fica triste se o adulto recusar"*, e **nenhuma
estrelinha ou benefício da criança depende disso**. Esta regra é dura e vale para qualquer superfície.

### 9.3 Consentimento omnibus é proibido — e o runtime atual não atende

**Divergência medida, somente leitura, não corrigida aqui.**

`parentSettingsService.js:63-103` implementa o consentimento como um **booleano único**:

```
{ accepted, acceptedAt, metadata, revokedAt }
```

persistido em `@ptf_parental_consent_v1` (`storageKeys.js:60`). Há concessão
(`acceptParentalConsent`) e revogação (`revokeParentalConsent`) — o que é bom — mas **um único
booleano não consegue expressar consentimento por finalidade**. Um adulto que aceite compartilhar
desempenho não estaria, com isso, aceitando compartilhar navegação; a estrutura atual não distingue.

Isso é exatamente o que a Pergunta 5 da 4E proíbe ao vedar o **consentimento omnibus**.

**Encaminhado, não corrigido:** `E5.55`. A estrutura precisa passar a registrar **finalidade por
finalidade**, com carimbo e versão do texto aceito. Superfície na **Fase 7** (Área dos Pais), motor na
**Fase 19**.

Registra-se também que `PARENTAL_CONSENT_FLOW_ENABLED = false` (`featureFlags.js:23`) mantém o fluxo
desligado hoje, e que a justificativa falsa desse desligamento **já estava registrada na Fase 4E** —
`featureFlags.js` **não foi editado** nem na 4E nem aqui (`E5.56`, Fase 7).

### 9.4 O que não entra no consentimento

- **Áudio do Beni não é agrupado ao consentimento de telemetria** — *"ouvir áudio local não equivale a
  enviar dado"* (categoria 8).
- **Nenhum questionário geral in-app na versão 1** (categoria 10).
- **Eventos comerciais não dependem do consentimento de telemetria** — a base legal é execução de
  contrato, e confundir as duas seria erro de conformidade (categoria 7).

---

## 10. O mecanismo de desligamento

Toda categoria declarou uma condição de desligamento em §4. Esta seção consolida a regra geral.

| Nível | Mecanismo | Depende de rede? |
|---|---|---|
| **1 — ausência de código** | a Camada 3 não é compilada no perfil de build | **não** |
| **2 — ausência de variável de ambiente** | `EXPO_PUBLIC_PTF_PERF_TRACE` ausente = coletor desligado (`performanceTrace.js:44-52`) | **não** |
| **3 — bandeira de compilação** | `featureFlags.js` desligado por padrão | **não** |
| **4 — ausência de consentimento** | estado inicial; sem consentimento não há envio | **não** |
| **5 — revogação** | o adulto revoga; a fila local é apagada e o envio para | **não** |

**Regra dura:** **nenhum nível de desligamento pode depender de resposta de servidor.** Um
interruptor remoto de desligamento seria, ele próprio, configuração remota — proibida pela
categoria 11. O app tem de ser capaz de estar desligado sem falar com ninguém.

**Regra de falha segura:** em qualquer dúvida — consentimento ilegível, esquema desconhecido, versão
de contrato divergente, erro de leitura do armazenamento — o estado resultante é **desligado**.
Ausência de prova de consentimento **nunca** é tratada como consentimento.

---

## 11. O que a medição nunca pode medir

Transcrição normativa da Fase 4E, mantida sem alteração e reafirmada aqui como parte do plano.

**Pode medir:** produto, ativação, engajamento, conclusão, retenção agregada, confiabilidade, uso
offline, uso de recurso, Modo Igreja (agregado, com `k ≥ 50`), funil comercial adulto, saúde técnica.

**Nunca pode medir:**

| # | Proibição |
|---:|---|
| 1 | fé |
| 2 | religiosidade |
| 3 | obediência espiritual |
| 4 | valor moral |
| 5 | preferência doutrinária |
| 6 | perfil psicológico |
| 7 | probabilidade de conversão |
| 8 | ranking espiritual |

**Acréscimo da Fase 5, decorrente da política de oração (§13):** a medição também **não registra se a
criança orou**, quantas vezes, nem qualquer decisão espiritual. A regra 5 da política de oração
consolidada no Bloco 4 — *"nenhum registro de vida espiritual"* — é ao mesmo tempo regra de produto e
**regra de medição**, e as duas se reforçam.

---

## 12. Separação de estados por categoria: especificação · implementação · validação

O fundador exigiu esta separação explícita. Nenhuma linha abaixo declara implementado o que é apenas
especificado.

| # | Categoria | Especificação (Fase 5) | Implementação futura | Validação futura |
|---:|---|:--:|---|---|
| 1 | Navegação | ✅ feita | ❌ Fase 19 · 22 | física em piloto |
| 2 | Progresso | ✅ feita | ❌ Fase 19 | física + conferência de esquema |
| 3 | Brincar | ✅ feita | ✅ **local já existe** — nada a implementar | conferência de campos na Fase 12A |
| 4 | Ateliê e Colorir | ✅ feita | ❌ Fase 19, **bloqueada por `P-141`** | física em estado migrado |
| 5 | Desempenho | ✅ feita | ❌ **Fase 6** (`P-139`) · **Fase 9** (`P-127`) | **física obrigatória**, `P-127` |
| 6 | Erros e crashes | ✅ feita | ❌ Fase 20 · 22 | consoles das lojas após publicação |
| 7 | Comerciais | ✅ feita | ❌ Fase 18 · 20 | Fase 21 (revalidação dos cinco cenários) |
| 8 | Áudio | ✅ feita | ❌ Fase 8A | física (autoplay depende do sistema) |
| 9 | Packs | ✅ feita | ✅ **runtime seguro já existe** | Fase 19: provar inalcançável em produção |
| 10 | Pesquisa | ✅ feita | ❌ Fase 21 | termo do piloto, revisão humana |
| 11 | A/B e config remota | ✅ feita (proibição) | — sem fase | auditoria de SDK a cada release |
| 12 | Identificador publicitário | ✅ feita (proibição) | ❌ gate na Fase 19 · declaração na Fase 20 | teste automatizado + auditoria |

**Riscos que permanecem `ABERTO` e `NÃO corrigido` após este bloco:** `P-85`, `P-100`, `P-127`,
`P-139`, `P-141`.

---

## 13. `E5.41` — Política de oração: os caminhos A, B e C

**Apresentado separadamente, conforme determinação do fundador. Este documento NÃO escolhe.**

### 13.1 O que já está fechado e não se reabre

Fase 4E §19.9, literal: *"O Beni **pode convidar** o grupo a orar; **o adulto conduz**; o guia **pode
sugerir** uma oração. **Evitar**: forçar repetição, registrar decisões espirituais, pontuar oração,
dar estrelinhas por orar, julgar fé, ou dizer que Deus está mais feliz porque a criança respondeu
corretamente."*

O Bloco 4 estendeu essa política ao produto inteiro, conforme mandato da v5 linha 234, em sete regras
(§4.4 do Bloco 4). **Essas sete regras não estão em questão aqui.**

### 13.2 A divergência medida entre a política e o runtime de hoje

| Superfície | Arquivo | Divergência medida |
|---|---|---|
| **Cultinho em Casa**, passo 4 | `CultinhoEmCasaScreen.js:143-148` | a oração é passo declarado de um ritual cuja conclusão alimenta a conquista `first_family_worship` (`achievements.js:408-419`) e cujo modal de sucesso convida a *"Ver minhas estrelinhas"*. O app **não verifica** que houve oração — mas a sequência vivida pela criança é **orar → concluir → ganhar** |
| **Momento com Beni** | `LumiMomentScreen.js` · `lumiReflections.js:93+` | em **1 de 7 dias** do rodízio determinístico, a mensagem é sobre oração (`'Uma oração pequena vale muito para Deus!'`, *"Orai sem cessar."*), o Beni aparece em avatar `praying`, a tela diz **"Repita com Beni:"** e oferece **"✓ Completar (+1 ⭐)"** |

### 13.3 Os três caminhos — sem escolha feita

| Caminho | O que implica | Custo | O que resolve | O que não resolve |
|---|---|---|---|---|
| **A — Desatrelar** | Manter a oração nas telas e **remover a recompensa** dos fluxos que a contêm | a conquista "Primeiro cultinho" perde a âncora; o Momento com Beni perde a estrela em 1 de 7 dias — e a criança pode perceber a perda | elimina a percepção "orar → ganhar" nas duas superfícies | reduz o incentivo ao Cultinho em Casa, que é um ritual de família desejado pelo produto |
| **B — Separar o passo** | Manter as recompensas e tornar a oração um passo **explicitamente fora** do fluxo recompensado — como "Criar juntos (opcional)" já é hoje no Cultinho | reestruturação do fluxo de 4 passos do Cultinho | preserva o incentivo ao ritual e tira a oração da conta | exige que a separação seja **legível para a criança**, e não apenas verdadeira no código |
| **C — Reescrever a mensagem** | Manter estrutura e recompensa, e **retirar a oração do que é repetido e recompensado** — trocar "Repita com Beni" por convite não imperativo e remover a mensagem de índice 5 do rodízio recompensado | menor custo técnico; mexe em texto e em um índice de rodízio | elimina a repetição induzida e a estrela em dia de oração | o Cultinho continua com a oração dentro do fluxo recompensado — resolve a superfície 2, **não a 1** |

**Observação técnica, não recomendação:** os caminhos não são mutuamente exclusivos. **C** endereça a
superfície 2 e **B** endereça a superfície 1; combinados, cobrem as duas. **A** cobre as duas ao custo
de recompensa. **A escolha é do fundador, e este documento não a faz.**

### 13.4 Estado e consequências

- **Estado de `E5.41`: DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** (decisão do fundador).
- **Nada foi alterado.** Corrigir seria mudança de comportamento de recompensa — área protegida
  (progresso e conquistas), fora do escopo documental da Fase 5.
- **Fase proprietária da implementação, qualquer que seja a escolha:** **Fase 11** (conclusão,
  presentes, Estrelinhas) para a mecânica de recompensa e **Fase 12B** (rituais e Modo Igreja) para o
  Cultinho em Casa.
- **Consequência para este plano de medição:** **nenhuma.** Em qualquer dos três caminhos, a regra de
  medição é a mesma — **o app nunca registra se a criança orou** (§11).

---

## 14. Encaminhamentos do Bloco 5 — `E5.52` a `E5.65`

Os quatro estados obrigatórios determinados pelo fundador: **RESOLVIDO NESTA FASE** · **ENCAMINHADO À
FASE PROPRIETÁRIA** · **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** · **DEPENDENTE DE TERCEIRO EXTERNO**.
Nenhum encaminhamento fica sem destino.

| Código | Assunto | Estado | Destino |
|---|---|---|---|
| **E5.52** | Habilitar o coletor de desempenho em perfil interno do `eas.json` (`P-139`). A Fase 5 **não alterou** `eas.json` | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 6** |
| **E5.53** | Coletar a linha de base de desempenho em aparelho real (`P-127`) | DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA | **Fase 9** |
| **E5.54** | Implementar o runtime da Camada 2 (sumarização local, allowlist de esquema, buckets) | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 19** |
| **E5.55** | O consentimento é hoje um **booleano único** (`parentSettingsService.js:63-103`), incompatível com a proibição de consentimento omnibus: é preciso consentimento **por finalidade**, com versão do texto aceito | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 7** (superfície) · **Fase 19** (motor) |
| **E5.56** | `PARENTAL_CONSENT_FLOW_ENABLED = false` com justificativa falsa, já registrada na 4E; `featureFlags.js` **não foi editado** | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 7** |
| **E5.57** | Validação **jurídica** externa da terminologia *"telemetria minimizada e não identificada na origem, agregada e anonimizada no processamento"* e da suficiência de `k ≥ 20` / `k ≥ 50` | **DEPENDENTE DE TERCEIRO EXTERNO** | advogado especializado em dados e público infantil |
| **E5.58** | Preencher Data Safety (Google) e App Privacy (Apple) **coerentes com este plano**, declarando corretamente `RL` e `RT` como retenções fora do controle do projeto | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 20** |
| **E5.59** | Auditoria de SDK a cada release **e** teste automatizado que falhe se qualquer identificador de publicidade ou de aparelho aparecer em `src/` | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 19** (teste) · **Fase 20** (auditoria de release) |
| **E5.60** | A medição do Ateliê e do Colorir depende de `P-141` resolvido: enquanto o endereço de armazenamento variar com o `avatarId`, nenhum contador de artes é confiável | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 19** |
| **E5.61** | Termo do piloto formal com famílias, base PESQUISA isolada, questionário nunca dirigido à criança | DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA | **Fase 21** |
| **E5.62** | Distinção normativa entre **EAS Update** (permitido) e **configuração remota de experimentação** (proibida) | **RESOLVIDO NESTA FASE** (§4.11) | — |
| **E5.63** | Exclusão individual é **tecnicamente impossível** na Camada 3 por ausência de identificador; as três consequências normativas ficam declaradas | **RESOLVIDO NESTA FASE** (§6.4) | — |
| **E5.64** | Modo Igreja: `k ≥ 50` obrigatório e proibição de telemetria de igreja e de denominação | ENCAMINHADO À FASE PROPRIETÁRIA | **Fase 12B** |
| **E5.65** | `P-85` permanece `ABERTO` e `risco técnico NÃO corrigido`: a especificação da Fase 5 **não é** a correção | **RESOLVIDO NESTA FASE** (registro, §0.3) · implementação **ENCAMINHADA** | **Fase 19** |

**Reapresentado, não novo:** `E5.41` (política de oração) — **DEPENDENTE DE VALIDAÇÃO HUMANA
EXTERNA**, §13.

---

## 15. Parecer do Bloco 5

1. **O plano de medição está especificado.** As 12 categorias ratificadas na Fase 4E foram declaradas
   com os 14 campos obrigatórios, dentro da arquitetura de três camadas congelada, sem reabrir
   nenhuma decisão fechada.

2. **As onze preservações estão garantidas por mecanismo, não por promessa.** O mecanismo primário é
   a allowlist de esquema que **recusa** — descartando o evento inteiro — qualquer propriedade não
   prevista. Nenhum campo de texto livre existe em nenhum evento de nenhuma categoria.

3. **Nenhuma categoria envia dado no lançamento.** O estado medido na Fase 4E — zero analytics, zero
   crash reporting, zero envio de evento — permanece inalterado, porque este bloco é documental.

4. **A Camada 3 permanece desligada por padrão**, condicionada ao contrato de consentimento adulto
   revogável, com cinco níveis de desligamento e **nenhum deles dependente de rede**.

5. **Retenção, exclusão e anonimização estão congeladas** conforme a delegação da Fase 4E, incluindo
   a declaração honesta de que a exclusão individual é impossível na Camada 3 — com as três
   consequências normativas que decorrem disso.

6. **Duas divergências foram medidas no runtime e encaminhadas, não corrigidas:** o consentimento
   booleano único (`E5.55`) e a dependência de `P-141` para a medição de criação (`E5.60`).

7. **`P-85`, `P-100`, `P-127`, `P-139` e `P-141` permanecem `ABERTO` e `risco técnico NÃO
   corrigido`.** Especificar não é implementar, e implementar não é validar.

8. **`E5.41` é apresentado sem escolha.** Os caminhos A, B e C estão descritos com custo e alcance de
   cada um. A decisão é do fundador.

9. **Este plano não está aprovado.** Ele é a proposta que o critério de saída da Fase 5 exige que o
   fundador aprove.

---

## 16. O que este bloco NÃO fez

- Não escreveu código de analytics.
- Não criou identificador remoto.
- Não alterou `performanceTrace.js`.
- Não alterou `eas.json`.
- Não alterou `featureFlags.js`.
- Não alterou nenhum arquivo de `src/`, `scripts/`, `assets/`, `App.js`, `app.json`, `package.json`,
  `package-lock.json` ou `plugins/`.
- Não instalou dependência nem SDK.
- Não gerou build, não abriu Metro, não instalou app, não fez validação física.
- Não fez push, não fez merge.
- Não repetiu as auditorias dos Blocos 0 a 4 nem reabriu qualquer um deles.
- Não escolheu entre os caminhos A, B e C de `E5.41`.
- Não declarou `P-85` corrigido.
- Não declarou o plano de medição aprovado.
- Não declarou a Fase 5 encerrada.
- Não iniciou o Bloco 6 nem o Bloco 7.

---

Documento anterior: [`04_PARECER_TEOLOGICO_E_CONTEUDO.md`](04_PARECER_TEOLOGICO_E_CONTEUDO.md)
Fonte das 12 categorias e da arquitetura de três camadas:
[`05_PRODUCT_LOCK_4E_...md`](../fase4-product-lock/05_PRODUCT_LOCK_4E_PRIVACIDADE_AREA_DOS_PAIS_ANALYTICS_E_MODO_IGREJA.md)
