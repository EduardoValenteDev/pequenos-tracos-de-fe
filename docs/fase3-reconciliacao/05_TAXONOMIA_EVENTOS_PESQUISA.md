# 05 · Taxonomia de eventos de pesquisa

> **Artefato 5 de 11 — E015 · Fase 3G · Reconciliação**

| Campo | Valor |
|---|---|
| **Estado** | **PRELIMINAR PARA PRODUCT LOCK** |
| **Base auditada** | E009 a E014 |
| **Branch** | `integrate/colorir-canonical-runtime` |
| **HEAD** | `015c438106538595b592981fbe1b80b1d5d65e55` |
| **Data** | 5 de agosto de 2026 |

---

## 0 · Declaração de natureza e de não-autorização

**Este artefato não implementa funcionalidade.**

> ## ⛔ ESTE DOCUMENTO **NÃO AUTORIZA ANALYTICS DE PRODUÇÃO**

Ele é uma **taxonomia de pesquisa**: um vocabulário preliminar para que as Fases 4 e 5 possam
discutir medição com termos precisos. **Nada aqui autoriza:**

- integrar qualquer SDK de analytics;
- adicionar qualquer dependência;
- enviar qualquer evento para qualquer servidor;
- coletar qualquer dado de criança;
- ligar telemetria em build de produção.

**Não integrar SDK.** A decisão de medir — se, o quê, como, com que consentimento e sob qual
base legal — pertence às Fases 4, 5, 18 e 19.

---

## 1 · Fontes técnicas principais

| Fonte | Papel |
|---|---|
| `src/services/performanceTrace.js` | **Único** instrumentador existente — local, diagnóstico, sem rede |
| `package.json:63` | `react-native-purchases: ^10.4.1` (RevenueCat) |
| `src/services/accessControl.js` | Política de entitlement *fail-closed* |
| `src/services/entitlementPolicy.js` | Regras de validade do entitlement |

---

## 2 · Estado atual — **zero analytics de produto**

### 2.1 · A varredura

`git grep` por `analytics|Analytics|amplitude|mixpanel|firebase|segment\.|posthog|trackEvent|logEvent`
em `src/` retornou **duas ocorrências, ambas não-analytics**:

| Arquivo | Ocorrência | Natureza |
|---|---|---|
| `src/components/map/StoryMapMarker.js:98` | "menor **amplitude** e opacidade" | comentário de animação — falso positivo |
| `src/services/performanceTrace.js:9` | "SEM rede, SEM AsyncStorage, SEM FileSystem, SEM dependência nova, **SEM analytics**" | declaração explícita de **ausência** |

> **Conclusão:** o aplicativo **não possui analytics de produto**. Não há SDK, não há fila de
> eventos, não há envio, não há identificador de usuário para medição.
> — `COMPROVADO PELO CÓDIGO`

### 2.2 · RevenueCat **não é analytics**

`react-native-purchases` está presente em `package.json:63`. Sua função no aplicativo é
**entitlement** — determinar se o plano premium está ativo. **Não é ferramenta de medição de
produto e não é usada como tal.** — `COMPROVADO PELO ARQUIVO` (presença) · `COMPROVADO PELO CÓDIGO` (uso)

**Correção metodológica herdada de E014 (aplicada aqui):**
> ~~"Nenhum dado da criança sai do aparelho."~~
> **Correto:** *"Não existe upload explícito de conteúdo infantil no código do aplicativo. A
> integração RevenueCat existe e seu envelope técnico de dados precisa de auditoria jurídica e
> técnica nas Fases 5, 18 e 19."*

O SDK é código de terceiro. O que ele transmite internamente **não é determinado pelo código do
aplicativo** — igualmente, o **método HTTP** de suas chamadas não é determinado por nós. Este
ponto permanece **`NÃO DETERMINADO`** e é bloqueador de qualquer declaração de privacidade.

### 2.3 · O único instrumentador existente

`performanceTrace.js` é **diagnóstico local, não produto** (`:2`). Suas garantias, verbatim
do contrato do bloco (`:8-17`):

| Garantia | Estado |
|---|---|
| Sem rede, sem AsyncStorage, sem FileSystem, sem dependência nova, **sem analytics** | `COMPROVADO PELO CÓDIGO` |
| **Sem PII** — metadata passa por **allowlist** e só aceita primitivos seguros | `COMPROVADO PELO CÓDIGO` |
| Só memória, buffer limitado (`TRACE_BUFFER_LIMIT = 200`) | `COMPROVADO PELO CÓDIGO` |
| **Nunca lança** — falha de diagnóstico não quebra o app | `COMPROVADO PELO CÓDIGO` |
| Desligado fora de DEV, salvo `EXPO_PUBLIC_PTF_PERF_TRACE=1` | `COMPROVADO PELO CÓDIGO` |
| Não faz `setState`, não altera *readiness*, não muda o que mede | `COMPROVADO PELO CÓDIGO` |

**Este módulo é o precedente arquitetural desta taxonomia.** Seu desenho de allowlist
(`ALLOWED_META_KEYS = ['reason','route','status','attempt','count','ok']`, `:29`) e seus regex de
saneamento (`SAFE_NAME`, `SAFE_VALUE`, `:32-37`) já excluem **por construção** nome com espaço ou
acento, e-mail, frase, JSON e URL. A taxonomia abaixo **estende esse mesmo princípio**.

---

## 3 · Proibições preliminares — o que **nunca** pode virar evento

> Esta lista é **preliminar** e **restritiva por padrão**. Nenhum item abaixo pode ser coletado,
> derivado, inferido, agregado ou transmitido — em nenhuma fase — sem aprovação jurídica
> específica e explícita.

| # | Proibido | Observação |
|--:|---|---|
| 1 | **Nome da criança** | inclusive iniciais, apelido e forma abreviada |
| 2 | **Texto livre digitado pela criança** | qualquer campo aberto, em qualquer superfície |
| 3 | **Conteúdo das pinturas** | imagem, traço, base64, miniatura ou hash do desenho |
| 4 | **Áudio da criança** | gravação, amostra, duração de fala ou nível de voz |
| 5 | **Contatos** | agenda, telefone, e-mail, qualquer identificador de terceiro |
| 6 | **Localização precisa** | GPS, endereço, coordenada, rede Wi-Fi, torre |
| 7 | **Identificador de publicidade** | IDFA, GAID, ou qualquer substituto |
| 8 | **Conteúdo de oração** | texto, seleção, tema ou intenção registrada |
| 9 | **Dados de igreja** | congregação, líder, turma, cidade da comunidade — **sem aprovação específica** |

### 3.1 · Corolários

- **Nenhum identificador estável de pessoa.** Se houver identificador, ele é **efêmero por
  sessão**, não persistido e não correlacionável entre instalações.
- **Nenhum campo de texto livre**, em nenhum evento, jamais. Só valores de enumeração fechada.
- **Nenhum dado derivado** que permita reconstruir um item proibido.
- **Faixa etária, se algum dia coletada, é faixa** — nunca data de nascimento.

---

## 4 · As 18 categorias de evento

> Nomes de categoria em `snake_case`, seguindo `SAFE_NAME` de `performanceTrace.js:32`.
> **Todas `SCHEMA PRELIMINAR`. Nenhuma implementada.**

| # | Categoria | Escopo | Superfícies (artefato 01) |
|--:|---|---|---|
| 1 | `app_lifecycle` | boot, retomada, suspensão | global |
| 2 | `onboarding` | primeira execução, criação de perfil | Onboarding |
| 3 | `navigation` | transição entre superfícies | global |
| 4 | `content_discovery` | mapa, vitrine, listas, trilhas | Home, Aventuras, Histórias |
| 5 | `story_reading` | leitura por cena no Livrinho | StoryBook |
| 6 | `audio_playback` | narração e trilha | StoryBook, Narration |
| 7 | `quiz` | perguntas e respostas | Quiz |
| 8 | `reflection` | momento de reflexão pós-história | Reflection |
| 9 | `coloring` | Colorir e Ateliê | Coloring, AtelierCanvas, AtelierGallery |
| 10 | `optional_activity` | jogos opcionais | Pares, Ovelhinha, Palavrinhas, Monte a Cena |
| 11 | `progress` | avanço, conclusão, retomada | global |
| 12 | `achievement` | conquistas, estrelinhas, presentes | Estrelinhas, BeniChest |
| 13 | `guide_overlay` | Beni, modais, celebrações | global |
| 14 | `devotional` | Cultinho e Meu Momento | Cultinho, LumiMoment |
| 15 | `parent_area` | área dos pais e portão parental | ParentArea, ParentalGate |
| 16 | `entitlement` | paywall, compra, restauração | Paywall |
| 17 | `pack_delivery` | download, verificação, instalação, recuperação | global (serviços) |
| 18 | `failure_recovery` | erro, fallback, reparo | global |

---

## 5 · Os 10 campos obrigatórios por evento

| # | Campo | Tipo | Regra | Marcação |
|--:|---|---|---|---|
| 1 | `name` | string | `snake_case`, ≤ 40 caracteres, enumeração fechada — mesmo `SAFE_NAME` de `performanceTrace.js:32` | `SCHEMA PRELIMINAR` |
| 2 | `category` | enum | uma das **18** da §4 | `SCHEMA PRELIMINAR` |
| 3 | `schema` | inteiro | versão do schema do evento; começa em `1`, como já faz `SAMPLE_SCHEMA` (`:211`) | `SCHEMA PRELIMINAR` |
| 4 | `t` | número | **carimbo relativo monotônico** ao início da sessão — **nunca** relógio de parede, **nunca** data local | `SCHEMA PRELIMINAR` |
| 5 | `session` | string | identificador **efêmero**, gerado por execução, **não persistido**, **não correlacionável** | `SCHEMA PRELIMINAR` |
| 6 | `surface` | enum | superfície de origem, do inventário do artefato 01 | `SCHEMA PRELIMINAR` |
| 7 | `outcome` | enum | `ok` · `error` · `timeout` · `cancelled` · `skipped` — espelha `reason`/`status` de `performanceTrace.js:29` | `SCHEMA PRELIMINAR` |
| 8 | `durationMs` | número ou `null` | **`null` quando não medido — nunca inventado**, regra já praticada em `deltaBetween` (`:227`) | `SCHEMA PRELIMINAR` |
| 9 | `params` | objeto | **allowlist fechada**, no máximo 4 chaves, só primitivos seguros — extensão direta de `sanitizeMetadata` (`:64-79`) | `SCHEMA PRELIMINAR` |
| 10 | `trigger` | enum | `user` · `system` · `timer` · `recovery` — o que originou o disparo | `SCHEMA PRELIMINAR` |

### 5.1 · Regras transversais

1. **Allowlist, nunca *denylist*.** O que não está explicitamente permitido é descartado.
2. **Nenhum valor de texto livre** — `SAFE_VALUE` (`:37`) exclui espaço, acento, `@`, frase, JSON e URL por construção.
3. **Ausência é `null`**, jamais valor inventado ou zero de conveniência.
4. **Nunca lança** — instrumentação com defeito não pode quebrar a experiência da criança.
5. **Buffer limitado** com contagem de descartes, como `dropped` (`:42`, `:263`).
6. **Desligado por padrão** fora de desenvolvimento.

---

## 6 · O que a taxonomia **não** define

| Assunto | Fase proprietária |
|---|---|
| Se o produto terá analytics | **4** |
| Qual ferramenta ou SDK, se algum | **4** e **5** |
| Base legal, consentimento e aviso de privacidade | **18** e **19** |
| Retenção, agregação e destino dos dados | **18** e **19** |
| Auditoria do envelope técnico do RevenueCat | **5**, **18** e **19** |
| Metas numéricas de produto | **4** |

---

## 7 · Decisões já aprovadas que não podem ser reabertas

1. **Nenhuma dependência nova sem aprovação prévia** — integrar SDK de analytics é adicionar dependência.
2. **Local-first**: progresso, desenhos e galeria vivem em AsyncStorage e sistema de arquivos.
3. **`performanceTrace` é diagnóstico, não produto**, e permanece sem rede.
4. **Entitlement é *fail-closed*** — nenhum evento pode ser usado para inferir ou conceder acesso.

## 8 · Itens não determinados

1. O envelope técnico de dados do SDK RevenueCat — **não auditado**.
2. Se o produto adotará qualquer medição — **decisão não tomada**.
3. Qual a base legal aplicável a um app infantil nas jurisdições-alvo — **não levantado**.
4. Se algum evento desta taxonomia é sequer necessário — a lista é **vocabulário**, não requisito.

## 9 · Fases proprietárias

| Assunto | Fase |
|---|---|
| Decisão sobre medição e taxonomia final | **4** |
| Conteúdo e instrumentação editorial | **5** |
| Implementação, se aprovada | **9** e **11** |
| Privacidade, base legal e conformidade | **18** e **19** |

---

*Fim do artefato 5 de 11. Nenhum SDK foi integrado. Nenhum evento foi implementado.
Nenhuma coleta foi autorizada.*
