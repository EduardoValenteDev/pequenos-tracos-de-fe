# Parecer teológico e de conteúdo — Fase 5, Bloco 4

**Fase 5 · Bloco 4 · 2026-08-07** · documento **documental**, sem alteração de runtime.

Eixo do critério de saída da Fase 5 tratado aqui: *"revisão bíblica/teológica do conteúdo"*
([`DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md`](../DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v5.md) linha 247),
mais o encaminhamento explícito de v5 linha 234 — *"os encaminhamentos jurídicos e a política de
oração vão para a Fase 5"*.

---

## 0. O que este parecer é e o que não é

**É:**

- Um levantamento verificado do **estado real** do processo de revisão bíblica do projeto.
- Uma **medição objetiva de legibilidade** das 20 histórias, história a história, que resolve `E5.5`.
- A **política de oração do produto**, consolidada a partir dos árbitros já fechados.
- Um parecer sobre **neutralidade denominacional**, resolvendo a aparente contradição entre dois
  documentos.
- Um confronto entre a **política de citação bíblica** já escrita pelo projeto e o que o runtime de
  fato exibe.

**NÃO é:**

- **Não é uma revisão bíblica.** Este parecer **não aprova** nenhuma história do ponto de vista
  teológico. Nenhum revisor humano qualificado participou dele. Quem escreve este documento é um
  agente de software, e o próprio projeto já registrou — em
  [`APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md`](../APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md) linha 915 —
  que *"IA pode ter introduzido interpretações não intencionais"*. Tratar este documento como
  substituto da revisão teológica humana seria exatamente o erro que o projeto identificou.
- **Não altera runtime.** Nenhum arquivo em `src/`, `scripts/`, `assets/`, `App.js`, `app.json`,
  `eas.json`, `package.json`, `package-lock.json` ou `plugins/` foi tocado.
- **Não reabre decisão fechada.** `D-4E-IGREJA` permanece como está; o Modo Igreja permanece
  destinado à Fase 12B com a *flag* desligada; `Cultinho em Casa` continua **não tocado** pela
  supersessão da decisão #5, conforme [`DECISIONS.md`](../DECISIONS.md) linha 302.
- **Não decide sozinho o que exige o fundador.** O item que exige ratificação está isolado em §4.5.

---

## 1. Método e qualidade da evidência

Todo número deste parecer foi produzido por **medição direta e reprodutível** sobre os arquivos do
repositório, não por leitura de relatórios anteriores. Os relatórios anteriores foram lidos, mas
apenas como **alegação a verificar** — e, como §2 mostra, várias não se sustentaram.

| Evidência | Como foi obtida | Qualidade |
|---|---|---|
| Textos de narração atuais | extração direta dos 200 campos `textoNarracao` de `src/data/stories.js` em `HEAD` | **DIRETA** |
| Textos revisados originais | extração dos mesmos 200 campos na versão `c1c3a8e:src/data/stories.js` | **DIRETA** |
| Cobertura da revisão bíblica | comparação campo a campo entre as duas versões, com normalização de aspas tipográficas, travessões e espaços | **DIRETA** |
| Legibilidade | índice Flesch adaptado ao português calculado sobre o texto extraído | **DIRETA (com ressalva de método — ver §3.1)** |
| Superfícies de oração | leitura direta de `CultinhoEmCasaScreen.js`, `HomeScreen.js`, `LumiMomentScreen.js`, `lumiReflections.js`, `achievements.js` | **DIRETA** |
| Identidade do revisor humano | varredura de `docs/biblical-review/` | **DIRETA (resultado: não existe)** |
| Conteúdo do "Documento Oficial de Narração Limpo" | — | **NÃO RECUPERADO** (ver §2.4) |

### 1.1 Controle de validade do método

Antes de usar a comparação de textos para concluir qualquer coisa, ela foi submetida a um **controle**:
os 200 textos do CSV revisado
([`TEXTOS_FINAIS_PARA_IMPLEMENTACAO_5_REVISOES.csv`](../biblical-review/final-5-revisoes/TEXTOS_FINAIS_PARA_IMPLEMENTACAO_5_REVISOES.csv))
foram procurados na versão `c1c3a8e` de `stories.js` — o commit que os aplicou.

**Resultado do controle: 200 de 200 encontrados.** O método não produz falso negativo. Só depois
disso os resultados de §2 foram aceitos.

Um **segundo** controle aparece em §3.3: as três histórias cujo texto foi comprovadamente preservado
apresentam variação de legibilidade de **exatamente 0,0 ponto**. Se houvesse ruído no extrator ou no
cálculo, essas três linhas não fechariam em zero.

### 1.2 Correção de contagem declarada

A primeira medição feita neste bloco usou busca por substring no arquivo inteiro e retornou **50**
textos revisados sobreviventes. A medição definitiva, que compara **campo a campo** o valor de cada
`textoNarracao`, retornou **49**.

- **Contagem errada:** 50.
- **Contagem correta:** 49.
- **Por que divergiram:** a busca por substring encontrava um texto revisado curto contido **dentro**
  de um texto atual mais longo, contando como sobrevivente algo que não é o mesmo campo. A medição
  campo a campo não tem esse defeito.

Não houve ajuste silencioso: a contagem errada está declarada acima.

---

## 2. O estado real da revisão bíblica — o achado central

### 2.1 O que a documentação afirma

Os relatórios da Sprint 19.2 registram que as 20 histórias passaram por revisão bíblica e que os
textos finais foram aplicados ao app. Isso é **verdadeiro para o momento em que foi escrito**: o
commit `c1c3a8e` (2026-06-01, *"content: apply biblically reviewed narration texts"*) aplicou os 200
textos revisados, e o controle de §1.1 confirma que os 200 estavam lá.

### 2.2 O que aconteceu depois

Em **2026-07-09**, o commit `c265a75` (*"feat: reanchor story and quiz content to official narration"*)
reancorou o conteúdo textual em outro documento. A mensagem do próprio commit declara:

> *"Reancora o conteúdo textual no documento oficial de narração novo ("Documento Oficial de Narração
> Limpo"), que substitui o roteiro final-5-revisoes como fonte da verdade. O documento renumera cenas
> e reescreve textos em 17 das 20 histórias."*

E ainda:

> *"Os 157 MP3 de narração seguem desatualizados e serão regerados em fase própria."*

**Consequência governamental:** os textos que passaram pela revisão bíblica **não são** os textos que
a criança lê hoje, em 17 das 20 histórias. A revisão continua registrada como concluída; o objeto
revisado foi trocado.

### 2.3 Recontagem manual auditada

Não existe gerador determinístico que produza estes números; a contagem abaixo é **manual e
auditada**, obtida por extração e comparação campo a campo.

| Medida | Valor | Observação |
|---|---|---|
| Cenas com narração no app | **200** | 20 histórias × 10 cenas |
| Textos revisados aplicados em `c1c3a8e` | **200** | controle de §1.1 |
| Posições cujo texto **mudou** em `c265a75` | **157** | **confere com a mensagem do commit** |
| Posições cujo texto **não mudou** em `c265a75` | **43** | 200 − 157 |
| Textos revisados que **sobrevivem** em `HEAD` (como conteúdo) | **49** | 43 na mesma posição + 6 realocados por renumeração de cena |
| Textos revisados que **desapareceram** do app | **151** | 200 − 49 |
| Alterações de `textoNarracao` após `c265a75` | **0** | `5e36893` e todos os commits seguintes: zero mudanças |

**Divergência declarada.** A mensagem de `c265a75` afirma *"18 cenas ficam intocadas"*. A recontagem
manual encontra **13** cenas com texto preservado fora das três histórias integralmente preservadas
(43 preservadas − 30 das três histórias = 13).

- **Contagem do commit:** 18.
- **Contagem verificada:** 13.
- **Por que divergiu:** não foi possível reproduzir o critério que gerou "18". A diferença de 5 cenas
  é pequena e **não altera nenhuma conclusão** deste parecer, mas é registrada porque a mensagem de
  commit é hoje o único registro daquela operação, e ela contém um número não reprodutível.

Uma segunda alegação de mensagem de commit foi verificada: `5e36893` afirma *"titulo e textoNarracao
NÃO foram tocados"*. O `git diff` desse commit exibe 120 linhas de `textoNarracao` como alteradas, o
que **parece** contradizer a mensagem. A comparação campo a campo mostra **0 de 200** valores
diferentes: as linhas aparecem no diff porque blocos foram deslocados, não porque o texto mudou.
**A mensagem de commit estava correta; o diff é que enganava.** Registrado para que a aparente
contradição não seja "redescoberta" no futuro como se fosse defeito.

### 2.4 Estado por história

`INTEGRO` = os 10 textos revisados continuam no app · `PARCIAL` = parte sobreviveu ·
`SUBSTITUIDO` = nenhum dos 10 sobreviveu.

| História | Revisados | Sobrevivem | Estado |
|---|---:|---:|---|
| `creation` | 10 | **10** | **INTEGRO** |
| `noah` | 10 | **10** | **INTEGRO** |
| `david_goliath` | 10 | **10** | **INTEGRO** |
| `solomon_wisdom` | 10 | 5 | PARCIAL |
| `ruth_naomi` | 10 | 5 | PARCIAL |
| `timothy_faith` | 10 | 3 | PARCIAL |
| `mary_says_yes` | 10 | 2 | PARCIAL |
| `moses_red_sea` | 10 | 1 | PARCIAL |
| `esther_queen` | 10 | 1 | PARCIAL |
| `samuel_hears_god` | 10 | 1 | PARCIAL |
| `josiah_young_king` | 10 | 1 | PARCIAL |
| `jesus_children` | 10 | 0 | SUBSTITUIDO |
| `daniel_lions` | 10 | 0 | SUBSTITUIDO |
| `jonah_big_fish` | 10 | 0 | SUBSTITUIDO |
| `lost_sheep` | 10 | 0 | SUBSTITUIDO |
| `good_samaritan` | 10 | 0 | SUBSTITUIDO |
| `abraham_stars` | 10 | 0 | SUBSTITUIDO |
| `joseph_colorful_coat` | 10 | 0 | SUBSTITUIDO |
| `miraculous_catch` | 10 | 0 | SUBSTITUIDO |
| `jesus_temple` | 10 | 0 | SUBSTITUIDO |
| **TOTAL** | **200** | **49** | 3 íntegras · 8 parciais · 9 substituídas |

**Cobertura efetiva da revisão bíblica sobre o texto que a criança lê hoje: 49 de 200 cenas (24,5%),
concentradas em 3 histórias completas.**

### 2.5 O documento que substituiu a revisão não está no repositório

O "Documento Oficial de Narração Limpo" é citado por `c265a75` como a nova fonte da verdade textual.
Ele **não existe** em `docs/`. O que existe é o roteiro que ele substituiu.

Classificação: **NÃO RECUPERADO** — não "inexistente". O documento evidentemente existiu no momento
da operação; ele não está versionado. Enquanto não estiver, **não é auditável**, e a cadeia de
proveniência do texto que a criança lê hoje está interrompida.

### 2.6 O portão do próprio projeto está violado

[`BIBLICAL_CONTENT_STANDARD.md`](../biblical-review/BIBLICAL_CONTENT_STANDARD.md) linha 93 estabelece:

> *"Nenhuma história deve avançar para narração final ou para o pacote do narrador sem um relatório
> de revisão bíblica completo e com status `Aprovado` ou `Aprovado com ajuste documentado`."*

Verificação direta:

| Fato | Estado |
|---|---|
| `docs/NARRATOR_PACKAGE/` existe, com roteiro e checklist de gravação | **SIM** — 5 arquivos |
| `docs/biblical-review/reports/` existe | **NÃO** |
| Relatórios `REVIEW_<storyId>.md` no repositório | **NENHUM** (varredura em todo `docs/`) |

O pacote do narrador foi produzido; os relatórios que o portão exige nunca foram escritos. **O portão
está violado por 20 histórias de 20.**

### 2.7 Nenhum revisor humano foi identificado

Varredura em `docs/biblical-review/`: a única ocorrência de "Revisor(es)" é o campo **em branco** do
modelo (`BIBLICAL_REVIEW_REPORT_TEMPLATE.md` linha 15). Nenhum teólogo, pastor ou revisor está
nomeado em documento algum.

Isso é coerente com `APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md` linha 1388, que ainda lista
*"Revisão teológica: escolha do teólogo/pastor revisor"* como decisão em aberto.

### 2.8 A escala de risco nunca foi aplicada

[`BIBLICAL_REVIEW_RISK_LEVELS.md`](../biblical-review/BIBLICAL_REVIEW_RISK_LEVELS.md) define cinco
níveis e determina que *"todo item identificado durante o processo de revisão … deve receber um desses
cinco níveis"*. Não há nenhum item classificado em nenhum nível, em nenhum documento do repositório —
consequência direta de §2.6: sem relatórios, não há onde classificar.

---

## 3. Legibilidade por história — resolução de `E5.5`

`E5.5` foi aberto no Bloco 1 como *"verificação de que os textos das 20 histórias efetivamente
atendem à referência de linguagem de ~5 anos, história a história"*, encaminhado a este bloco.

A faixa oficial do produto está **congelada em 4 a 8 anos**, com referência de linguagem *"texto
simples e compreensível, idealmente acessível a uma criança de aproximadamente 5 anos quando a
natureza do conteúdo permitir"*.

### 3.1 Método e sua ressalva

Índice Flesch adaptado ao português:

```
IFL = 248,835 − 1,015 × (palavras / frases) − 84,6 × (sílabas / palavras)
```

Faixas: **> 75** muito fácil · **50–75** fácil · **25–50** difícil · **< 25** muito difícil.

**Ressalva honesta de método.** O índice mede estrutura de superfície — comprimento de frase e
densidade silábica. Ele **não** mede se um conceito é compreensível para uma criança de 5 anos.
"Deus fez uma aliança" e "Deus fez um bolo" pontuam igual. Portanto o índice **não substitui** a
avaliação humana; ele identifica **onde olhar primeiro**. A contagem silábica é aproximada
(agrupamento vocálico), o que introduz erro sistemático pequeno e **igual para todas as histórias** —
por isso a comparação entre histórias é confiável mesmo que o valor absoluto tenha margem.

### 3.2 Resultado — 20 histórias, texto atual

| História | Palavras | Pal./frase | Síl./pal. | **IFL** | % palavras ≥ 4 sílabas |
|---|---:|---:|---:|---:|---:|
| `good_samaritan` | 300 | 9,7 | 2,13 | **59,1** | 10,7% |
| `timothy_faith` | 281 | 10,8 | 2,08 | **61,7** | 10,7% |
| `jesus_temple` | 322 | 10,7 | 2,03 | **66,4** | 11,5% |
| `miraculous_catch` | 323 | 11,1 | 2,02 | **67,0** | 9,0% |
| `joseph_colorful_coat` | 301 | 10,0 | 2,03 | **67,2** | 6,6% |
| `samuel_hears_god` | 288 | 9,6 | 2,02 | **67,8** | 8,7% |
| `solomon_wisdom` | 280 | 10,4 | 1,98 | **70,6** | 8,6% |
| `lost_sheep` | 317 | 10,2 | 1,97 | **72,2** | 5,4% |
| `jesus_children` | 308 | 11,0 | 1,95 | **72,3** | 6,5% |
| `mary_says_yes` | 300 | 10,0 | 1,96 | **73,2** | 6,7% |
| `esther_queen` | 317 | 10,6 | 1,95 | **73,4** | 6,9% |
| `jonah_big_fish` | 341 | 11,4 | 1,93 | **74,1** | 7,6% |
| `josiah_young_king` | 295 | 10,5 | 1,93 | **75,0** | 7,8% |
| `daniel_lions` | 363 | 12,1 | 1,90 | **75,7** | 7,4% |
| `ruth_naomi` | 318 | 10,3 | 1,91 | **76,7** | 5,3% |
| `abraham_stars` | 303 | 10,4 | 1,89 | **78,2** | 5,9% |
| `moses_red_sea` | 323 | 10,8 | 1,86 | **80,5** | 5,6% |
| `noah` | 427 | 10,9 | 1,83 | **82,6** | 5,2% |
| `david_goliath` | 431 | 11,1 | 1,82 | **83,5** | 3,9% |
| `creation` | 433 | 10,8 | 1,68 | **95,4** | 2,5% |
| **AGREGADO** | **6 571** | **10,6** | **1,93** | **74,5** | **6,9%** |

**Nenhuma história cai na faixa "difícil".** A pior (`good_samaritan`, 59,1) permanece confortavelmente
dentro de "fácil". O agregado (74,5) fica no topo de "fácil", quase em "muito fácil".

### 3.3 Comparação controlada — o texto revisado *versus* o texto atual

A tabela de §3.2 sozinha permitiria uma leitura enganosa: as três histórias mais legíveis são
exatamente as três cujo texto revisado sobreviveu. Isso poderia ser coincidência de conteúdo. A
comparação controlada — **a mesma história, antes e depois** — elimina a dúvida.

| História | IFL revisado | IFL atual | Δ |
|---|---:|---:|---:|
| `good_samaritan` | 70,3 | 59,1 | **−11,2** |
| `jesus_temple` | 72,4 | 66,4 | −6,0 |
| `timothy_faith` | 67,0 | 61,7 | −5,2 |
| `josiah_young_king` | 79,7 | 75,0 | −4,7 |
| `samuel_hears_god` | 72,5 | 67,8 | −4,7 |
| `daniel_lions` | 80,4 | 75,7 | −4,6 |
| `jonah_big_fish` | 78,5 | 74,1 | −4,4 |
| `mary_says_yes` | 76,3 | 73,2 | −3,1 |
| `ruth_naomi` | 79,1 | 76,7 | −2,4 |
| `jesus_children` | 74,1 | 72,3 | −1,8 |
| `esther_queen` | 75,2 | 73,4 | −1,8 |
| `abraham_stars` | 80,0 | 78,2 | −1,7 |
| `solomon_wisdom` | 71,8 | 70,6 | −1,2 |
| `joseph_colorful_coat` | 68,4 | 67,2 | −1,2 |
| `miraculous_catch` | 67,9 | 67,0 | −0,9 |
| `lost_sheep` | 72,0 | 72,2 | +0,2 |
| `moses_red_sea` | 74,3 | 80,5 | **+6,2** |
| `creation` \* | 95,4 | 95,4 | **0,0** |
| `noah` \* | 82,6 | 82,6 | **0,0** |
| `david_goliath` \* | 83,5 | 83,5 | **0,0** |

\* histórias cujo texto revisado foi 100% preservado — **delta esperado zero, delta obtido zero**.
Esta é a validação interna do método.

- **15 das 17** histórias reescritas ficaram **menos** legíveis; 2 ficaram mais.
- Variação média nas 17: **−2,9 pontos**.
- Volume total de texto praticamente inalterado: 6 616 → 6 571 palavras (−0,7%).

**Leitura honesta do resultado.** A direção é sistemática — 15 de 17 no mesmo sentido não é ruído.
A **magnitude é pequena**: −2,9 pontos numa escala de 100, e nenhuma história mudou de faixa. Seria
incorreto apresentar isto como degradação grave da linguagem. O que o dado mostra é que a reescrita
**não foi neutra**: ela trocou um texto que passou por revisão de adequação infantil por um texto
que, medido pelo mesmo critério, é consistentemente um pouco mais denso. O problema de governança
continua sendo o de §2 — a troca sem nova revisão — e não a legibilidade em si.

### 3.4 Parecer de legibilidade (`E5.5`)

**`E5.5` está RESOLVIDO NESTA FASE**, no que é verificável por medição:

1. As 20 histórias estão, sem exceção, em faixa "fácil" ou "muito fácil" pelo índice adaptado.
2. Frase média de 10,6 palavras e 1,93 sílabas por palavra são compatíveis com leitura em voz alta
   para 4–8 anos.
3. **Duas histórias formam o piso e merecem olhar editorial prioritário**: `good_samaritan` (59,1) e
   `timothy_faith` (61,7) — ambas com 10,7% de palavras de 4+ sílabas, o dobro da média.
4. `jesus_temple` tem a maior densidade de palavras longas (11,5%).

O que a medição **não** resolve — a compreensibilidade conceitual para uma criança de ~5 anos — não
pode ser resolvido nesta fase, porque depende de revisão humana (§2.7) e de teste com crianças
reais. Isso segue em `E5.40`.

---

## 4. Política de oração

v5 linha 234 determina que *"a política de oração"* vem para a Fase 5. A §19.9 do artefato de
Product Lock 4E encerra dizendo *"Aprofundamento na **Fase 5**"*. Este é o aprofundamento.

### 4.1 O que já está fechado e não se reabre

[`05_PRODUCT_LOCK_4E_...md`](../fase4-product-lock/05_PRODUCT_LOCK_4E_PRIVACIDADE_AREA_DOS_PAIS_ANALYTICS_E_MODO_IGREJA.md)
§19.9, transcrita literalmente:

> **19.9 Política de oração**
>
> O Beni **pode convidar** o grupo a orar; **o adulto conduz**; o guia **pode sugerir** uma oração.
> **Evitar**: forçar repetição, registrar decisões espirituais, pontuar oração, dar estrelinhas por
> orar, julgar fé, ou dizer que Deus está mais feliz porque a criança respondeu corretamente.

Esse texto está **fechado**. Ele nasceu no capítulo do **Modo Igreja** (§19), e `DECISIONS.md`
linha 302 registra que a supersessão do Modo Igreja **não toca** o Cultinho em Casa.

### 4.2 A questão que a Fase 5 precisa responder

Se §19.9 vale para o encontro na igreja, **vale também para a criança sozinha com o app em casa?**

Esta pergunta não é uma reabertura: v5 mandou a política de oração para a Fase 5 sem restringi-la ao
Modo Igreja, e a própria §19.9 pediu o aprofundamento aqui. Responder é o trabalho deste bloco.

### 4.3 As três superfícies de oração que existem hoje no produto

Levantamento direto no runtime, sem alteração:

| # | Superfície | Arquivo | O que faz | Recompensa? |
|---|---|---|---|---|
| 1 | **Cultinho em Casa**, passo 4 | `src/screens/CultinhoEmCasaScreen.js:143-148` | exibe uma "Oração curtinha" (`cultinho.oracao`); o passo é parte de um fluxo de 4 passos | **Sim, indiretamente** |
| 2 | **Momento com Beni** | `src/screens/LumiMomentScreen.js` | Beni em avatar `praying`; "Repita com Beni:" seguido de um versículo; botão "✓ Completar (+1 ⭐)" | **Sim, diretamente** |
| 3 | **Cantinho na Home** | `src/screens/HomeScreen.js:531-535`, dados em `:49-55` | exibe passivamente "🙏 Uma oração curtinha" do array `DAILY_PRAYERS` | **Não** |

Detalhamento das duas primeiras:

**Superfície 1 — Cultinho em Casa.** O botão "Concluir cultinho ✨" leva a um modal de sucesso cujo
botão secundário é literalmente *"Ver minhas estrelinhas"*. A conclusão alimenta a conquista
`first_family_worship` (`src/data/achievements.js:408-419`): *"Primeiro cultinho — Concluiu um
Cultinho em Casa com Beni."* O passo 4 do fluxo concluído é a oração.

Precisão necessária: o app **não verifica** que houve oração. A oração é **exibida**; a criança ou o
adulto aperta "Concluir". Portanto o app não "pontua oração" no sentido estrito de detectá-la e
premiá-la. Mas a conquista está atrelada a um ritual do qual a oração é passo declarado, e a tela de
sucesso convida a ver as estrelinhas. **Do ponto de vista da criança, a sequência vivida é: orar →
concluir → ganhar.** É essa percepção, não a implementação, que §19.9 quer evitar.

**Superfície 2 — Momento com Beni.** É a mais direta. `LUMI_MOMENT_MESSAGES`
(`src/data/lumiReflections.js:93+`) tem 7 mensagens em rodízio diário. A de índice 5 é:

```js
{ emoji: '🙏', text: 'Uma oração pequena vale muito para Deus!',
  verse: 'Orai sem cessar.', verseRef: '1 Tessalonicenses 5:17' }
```

Nesse dia, a tela: (a) mostra o Beni em avatar **`praying`**; (b) diz **"Repita com Beni:"** e
apresenta *"Orai sem cessar."*; (c) oferece o botão **"✓ Completar (+1 ⭐)"**; (d) ao completar,
exibe *"+1 ⭐ estrela ganha hoje!"*.

Confrontando com a lista de §19.9:

| Item que §19.9 manda evitar | Ocorre na superfície 2? |
|---|---|
| forçar repetição | **Sim** — "Repita com Beni" é instrução direta de repetição |
| dar estrelinhas por orar | **Sim, em 1 de 7 dias** — a mensagem do dia é sobre oração e o rodízio é determinístico por data |
| pontuar oração | **Sim, no efeito** — a estrela é concedida por completar a tela |
| registrar decisões espirituais | Não |
| julgar fé | Não |
| dizer que Deus está mais feliz porque a criança respondeu corretamente | Não |

### 4.4 A política de oração do produto — consolidação

Derivada de §19.9 (fechada), estendida ao produto inteiro conforme o mandato de v5 linha 234:

> **Política de oração — Mundo do Beni**
>
> 1. **O Beni pode convidar; o Beni não conduz.** Convite é aceitável em qualquer superfície. Quem
>    conduz a oração é o adulto, ou a própria criança em suas palavras.
> 2. **Oração é sempre optativa e sempre visivelmente pulável.** Nenhum fluxo pode ficar bloqueado
>    porque a criança não quis orar.
> 3. **Nenhuma recompensa é concedida por orar.** Nem estrela, nem conquista, nem selo, nem
>    progresso. Isso vale para recompensa direta e para recompensa atrelada a um ritual cujo passo
>    declarado seja a oração.
> 4. **Nenhuma repetição induzida.** O app não instrui a criança a repetir palavras de oração. Pode
>    oferecer um texto para ler junto com o adulto; não pode comandar a repetição.
> 5. **Nenhum registro de vida espiritual.** O app não guarda se a criança orou, quantas vezes, nem
>    qualquer decisão espiritual. (Coerente com o parecer de privacidade do Bloco 2.)
> 6. **Nenhum juízo de fé.** O app não avalia, compara nem qualifica a fé da criança, e não sugere
>    que Deus responde melhor a quem acerta.
> 7. **A oração é da família, não do app.** Onde houver oração sugerida, a formulação deve permitir
>    que a família use a própria — inclusive a própria tradição denominacional.

Os pontos 1, 3, 4, 5 e 6 são **transcrição ou consequência direta** de §19.9. Os pontos 2 e 7 são
consequência de §19.7–19.8 (*"o Beni não arbitra silenciosamente divergência cristã legítima"*) e do
princípio de neutralidade tratado em §5 deste parecer.

### 4.5 O que exige o fundador — e o que este parecer NÃO decide

A política acima descreve o produto **como ele deve ser**. O runtime de hoje **diverge dela em dois
pontos** (superfícies 1 e 2 de §4.3).

Este parecer **não** decide como corrigir, e **não** corrige. Corrigir é mudança de comportamento de
recompensa — área protegida (progresso e conquistas) e fora do escopo documental da Fase 5. Existem
pelo menos três caminhos possíveis, e a escolha entre eles é de produto:

| Caminho | O que implica |
|---|---|
| **A — Desatrelar** | Manter a oração nas telas e remover a recompensa dos fluxos que a contêm. Custo: a conquista "Primeiro cultinho" perde a âncora; o Momento com Beni perde a estrela em 1 de 7 dias. |
| **B — Separar o passo** | Manter as recompensas, mas tornar a oração um passo explicitamente **fora** do fluxo recompensado (como "Criar juntos (opcional)" já é hoje no Cultinho). |
| **C — Reescrever a mensagem** | Manter estrutura e recompensa, e retirar a oração do que é repetido/recompensado — trocar "Repita com Beni" por convite não imperativo e remover a mensagem de índice 5 do rodízio recompensado. |

**A escolha entre A, B e C é decisão de produto e depende do fundador.** Registrada como `E5.41`,
com estado **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA**. Ela deve ser apresentada junto com o Bloco 5.

---

## 5. Neutralidade denominacional

### 5.1 A aparente contradição

| Documento | Texto |
|---|---|
| [`DOCTRINAL_NEUTRALITY_GUIDE.md`](../biblical-review/DOCTRINAL_NEUTRALITY_GUIDE.md) linha 13 | *"…teologicamente honesto, biblicamente fiel e denominacionalmente neutro **onde a neutralidade é possível e necessária**."* |
| [`DECISIONS.md`](../DECISIONS.md) linha 1549 (`D-4E-IGREJA`) | *"**núcleo bíblico compartilhado** sem alegar neutralidade teológica"* |

### 5.2 Parecer — não há contradição real

Lidos por inteiro, os dois textos dizem a mesma coisa com ênfases diferentes:

- O guia **não** promete neutralidade absoluta. A oração subordinada *"onde a neutralidade é possível
  e necessária"* já reconhece que há pontos em que ela não é possível. O princípio central do guia é
  explícito: *"onde denominações divergem em interpretação, o app apresenta o fato narrativo sem a
  interpretação controversa"* — isto é **abstenção**, não neutralidade proclamada.
- `D-4E-IGREJA` proíbe **alegar** neutralidade teológica, o que é uma proibição sobre o **discurso de
  marketing e de posicionamento**, não sobre o método editorial.

**Conclusão:** o método editorial (abster-se onde há divergência) e a proibição de discurso (não se
declarar neutro) são compatíveis e complementares. `DECISIONS.md` prevalece na hierarquia, e o que
ele proíbe — a alegação — **não** está no guia.

**Reconciliação documental aplicada:** nenhuma alteração de texto é necessária em nenhum dos dois
documentos. A leitura conjunta acima passa a ser o registro canônico. `E5.50`, **RESOLVIDO NESTA
FASE**.

Regra operacional que decorre: **o produto pratica abstenção denominacional; o produto não se
anuncia como denominacionalmente neutro.** Materiais de loja, site e Área dos Pais não podem conter
a afirmação "neutro" — o que também é relevante para os textos de loja ainda em `[PLACEHOLDER]`
(Bloco 3).

---

## 6. Citação bíblica *versus* a política de tradução do próprio projeto

[`TRANSLATION_REFERENCE_POLICY.md`](../biblical-review/TRANSLATION_REFERENCE_POLICY.md) estabelece,
em tabela normativa:

| Uso | Permitido? | Observação |
|---|---|---|
| Citação isolada de versículo curto (1–2 linhas) | ✓ Sim, com moderação | **Indicar tradução usada.** Preferir traduções de domínio público quando possível. |
| Uso de tradução como única referência sem indicação | ✗ **Não** | **Sempre indicar a fonte** |

O runtime exibe versículos citados diretamente, entre aspas, em `LUMI_MOMENT_MESSAGES` e em
`HomeScreen`. Confronto verificado:

| # | Achado | Evidência | Contraria |
|---|---|---|---|
| 1 | **Nenhuma citação indica a tradução.** Todas trazem livro e capítulo, nenhuma traz a versão | os 7 itens de `lumiReflections.js:93+` | a regra "sempre indicar a fonte" |
| 2 | **Dois versículos truncados com reticências** — *"Deus amou o mundo de tal maneira…"* (Jo 3:16) e *"Se tiverdes fé do tamanho de um grão de mostarda…"* (Mt 17:20) | idem | a citação corta exatamente antes do conteúdo teológico da passagem |
| 3 | **Registro linguístico misto** — *"Orai sem cessar"*, *"Confia no Senhor de todo o teu coração"*, *"Se tiverdes fé"* usam segunda pessoa arcaica (tu/vós), enquanto o resto do app fala "você" | idem | adequação de linguagem para 4–8 anos (Bloco 1) |
| 4 | **Referência abreviada de forma inconsistente** — `'Fp 4:13'` abreviado; os demais por extenso (`'Salmos 145:9'`, `'1 Tessalonicenses 5:17'`) | idem | consistência editorial |
| 5 | **Fp 4:13 renderizado como *"Posso fazer tudo por meio de Cristo"*** | idem | leitura descontextualizada conhecida; item para o revisor humano, **não** arbitrado aqui |

O achado 2 merece nota: as reticências não são estilo — elas removem, em João 3:16, justamente a
oração que dá sentido à primeira metade. Uma criança que lê *"Deus amou o mundo de tal maneira…"* e
para ali não recebe uma frase incompleta; recebe uma frase sem predicado.

Nenhum destes achados foi corrigido: correção é runtime.

---

## 7. Quiz

### 7.1 Hipótese verificada e DESCARTADA

Durante o levantamento, notou-se que **todas as 160 perguntas** de `src/data/quizzes.js` têm
`correct: 0` — a resposta certa é sempre a primeira opção do array. Isso pareceria um defeito grave
de conteúdo infantil: uma criança aprenderia a acertar escolhendo sempre a primeira.

**A hipótese foi verificada e está descartada.** `src/screens/QuizScreen.js:41` chama
`prepareQuizQuestions`, que em `src/services/quizModel.js` aplica `shuffle(n.options)` a cada
pergunta. As opções são embaralhadas uma vez na carga e ficam estáveis durante a partida. O
`correct: 0` uniforme é convenção de autoria no arquivo de dados, não o que a criança vê.

Registrado aqui para que a suspeita não seja levantada de novo, e como aplicação da regra de não
reportar defeito sem verificar.

### 7.2 Alcance real da revisão sobre o quiz

`QUIZ_QUESTIONS_PER_STORY = 4`, e `QuizScreen.js:41-42` usa `.slice(0, 4)` — **as 4 primeiras**
perguntas de cada história. As perguntas q5–q8 permanecem em `quizzes.js` como reserva declarada.

Consequência para a revisão bíblica: **80 perguntas chegam à criança; 160 existem.** Um relatório de
revisão que cubra só o que é exibido deixaria 80 perguntas sem revisão, prontas para entrar em
produção numa futura troca de reserva. O escopo da revisão deve ser **as 160**.

### 7.3 As 44 perguntas reancoradas

`c265a75` declara: *"quizzes.js — 44 perguntas reancoradas na narração oficial. A narração nova
removeu eventos inteiros… Preservadas as 24 perguntas de creation, noah e david_goliath"* — 24 = 3
histórias × 8, o que confere com a estrutura verificada (20 × 8 = 160).

Essas 44 perguntas foram reescritas **depois** da revisão bíblica e não passaram por nova revisão.
Mesma natureza do achado de §2, aplicada ao quiz.

---

## 8. O diretório `docs/biblical-review/reports/`

O modelo de relatório instrui: *"Duplicar este arquivo e renomear para `REVIEW_[storyId].md` dentro
de `docs/biblical-review/reports/`"*. O diretório **não existia**.

Este bloco **cria o diretório** com um único arquivo: um
[`README.md`](../biblical-review/reports/README.md) que declara, de forma verificável, que **nenhum
relatório existe**, que o portão de `BIBLICAL_CONTENT_STANDARD.md:93` está violado, e quais são os
20 relatórios devidos.

**Deliberadamente não foram criados 20 relatórios em branco.** Preencher o modelo sem revisor humano
produziria artefatos que **parecem** revisões concluídas e que poluiriam a auditoria futura — o
oposto do que este bloco existe para fazer. O diretório passa a existir vazio e declaradamente vazio.

---

## 9. Encaminhamentos do Bloco 4

Estados possíveis, conforme arbitragem: **RESOLVIDO NESTA FASE** · **ENCAMINHADO À FASE
PROPRIETÁRIA** · **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** · **DEPENDENTE DE TERCEIRO EXTERNO**.

Fases proprietárias atribuídas conforme o **árbitro de sequência** (v5 §3): Fase 8 (matriz de falas
do Beni), Fase 8A (orquestração sonora), Fase 9 (A Criação definitiva — narração, cenas, quiz,
Momento), Fase 11 (Conclusão, Estrelinhas e conquistas), Fase 12B (Rituais — Cultinho em Casa),
Fase 13 (Noé), Fase 15 (produção das outras dezoito histórias), Fase 16 (congelamento editorial).

| # | Encaminhamento | Destino | Estado |
|---|---|---|---|
| **E5.33** | **Revisão bíblica humana das 20 histórias.** Nenhum teólogo ou pastor revisor está identificado em documento algum (§2.7) | escolha e contratação do revisor pelo fundador | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.34** | **Os 20 relatórios `REVIEW_<storyId>.md` não existem** e o portão de `BIBLICAL_CONTENT_STANDARD.md:93` está violado (§2.6) | Fases **9**, **13** e **15**, com portão duro na Fase **16** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.35** | **A escala de 5 níveis de risco nunca foi aplicada** a nenhum item (§2.8) | Fases **9**, **13**, **15** — junto com E5.34 | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.36** | **151 dos 200 textos revisados foram substituídos sem nova revisão bíblica** (§2.3) | Fases **9**, **13**, **15**; portão na **16** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.37** | **O "Documento Oficial de Narração Limpo" não está versionado** — cadeia de proveniência do texto atual interrompida (§2.5). Classificado **NÃO RECUPERADO** | Fase **16** (congelamento editorial) | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.38** | **157 MP3 de narração estão desatualizados** em relação ao texto atual, conforme o próprio `c265a75` | Fases **8A**, **9**, **13**, **15** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.39** | **44 perguntas de quiz reancoradas após a revisão**, sem nova revisão (§7.3) | Fases **9**, **13**, **15** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.40** | **Legibilidade medida história a história** (§3). A parte mensurável está resolvida; a compreensibilidade conceitual para ~5 anos depende de revisor humano e de teste com crianças | medição: **resolvida aqui**; compreensibilidade: E5.33 | **RESOLVIDO NESTA FASE** (parte mensurável) |
| **E5.41** | **Escolha entre os caminhos A, B e C para desatrelar recompensa de oração** (§4.5) | fundador — apresentar junto com o Bloco 5 | **DEPENDENTE DE VALIDAÇÃO HUMANA EXTERNA** |
| **E5.42** | **Momento com Beni concede +1 ⭐ em dia cuja mensagem é sobre oração** (`lumiReflections.js`, índice 5) — contraria §19.9 (§4.3) | Fase **9** (Momento) e Fase **11** (Estrelinhas), após E5.41 | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.43** | **Conquista `first_family_worship` premia concluir o Cultinho**, cujo passo 4 é a oração (§4.3) | Fase **12B** (Cultinho) e Fase **11** (conquistas), após E5.41 | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.44** | **"Repita com Beni" é instrução de repetição**, que §19.9 manda evitar (§4.3) | Fase **8** (matriz de falas do Beni) | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.45** | **Dois versículos truncados com reticências** removem o núcleo da passagem (§6, achado 2) | Fases **8** e **9** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.46** | **Nenhuma citação bíblica indica a tradução usada**, contra `TRANSLATION_REFERENCE_POLICY` (§6, achado 1) | Fases **8**, **9** e **16** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.47** | **Registro linguístico misto** (tu/vós arcaico convivendo com "você") nos versículos (§6, achado 3) | Fases **8** e **9** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.48** | **Referência abreviada inconsistente** (`Fp 4:13` × `1 Tessalonicenses 5:17`) (§6, achado 4) | Fase **16** | **ENCAMINHADO À FASE PROPRIETÁRIA** |
| **E5.49** | **Fp 4:13 como *"Posso fazer tudo por meio de Cristo"*** — risco de leitura descontextualizada; item para o revisor humano, não arbitrado aqui (§6, achado 5) | revisor bíblico (E5.33) | **DEPENDENTE DE TERCEIRO EXTERNO** |
| **E5.50** | **Aparente contradição sobre neutralidade denominacional** entre o guia e `D-4E-IGREJA` (§5) — reconciliada por leitura conjunta, sem alteração de texto | — | **RESOLVIDO NESTA FASE** |
| **E5.51** | **80 perguntas de reserva (q5–q8) não chegam à criança mas entram em produção numa futura troca** — o escopo da revisão deve ser 160, não 80 (§7.2) | Fases **9**, **13**, **15** | **ENCAMINHADO À FASE PROPRIETÁRIA** |

**19 encaminhamentos, `E5.33` a `E5.51`. Nenhum sem destino.**

---

## 10. Parecer

**Sobre a revisão bíblica do conteúdo — o eixo que a Fase 5 tinha de avaliar:**

O projeto **construiu um processo de revisão bíblica sério** — padrão de conteúdo, checklist, modelo
de relatório por história, escala de cinco níveis de risco, guia de neutralidade doutrinária, guia de
linguagem segura para crianças e política de tradução. É um arcabouço acima da média para um app
infantil independente.

**Esse processo não foi concluído, e o que foi concluído foi parcialmente desfeito.**

1. Os relatórios por história — o produto final do processo — **nunca foram escritos**, nem um.
2. O portão que o próprio projeto criou (nada vai para o pacote do narrador sem relatório aprovado)
   **foi atravessado**: o pacote existe, os relatórios não.
3. Os textos que passaram por revisão de conteúdo **foram substituídos em 151 das 200 cenas**, por um
   documento que não está versionado, sem que nova revisão ocorresse.
4. **Nenhum revisor humano jamais foi identificado.** A revisão que consta como feita foi feita por
   IA, e o próprio projeto registrou que isso pode ter introduzido interpretações não intencionais.

A cobertura efetiva da revisão bíblica sobre o texto que uma criança lê hoje é de **49 de 200 cenas
(24,5%)**, concentradas em três histórias: `creation`, `noah` e `david_goliath`.

**Parecer: o eixo teológico da Fase 5 NÃO pode ser declarado aprovado.** Ele pode ser declarado
**auditado, medido e integralmente encaminhado**, que é o máximo que uma fase documental sem revisor
humano é capaz de entregar com honestidade. Declarar aprovação aqui seria transformar ausência de
revisão em prova de adequação.

**Sobre adequação etária e linguagem (`E5.5`):** aprovado no que é mensurável. As 20 histórias estão
em faixa "fácil" ou "muito fácil"; nenhuma exige leitura acima da faixa. Duas histórias
(`good_samaritan`, `timothy_faith`) formam o piso e merecem prioridade editorial. A reescrita de
julho reduziu a legibilidade de forma sistemática mas pequena (−2,9 pontos em média, 15 de 17
histórias) — relevante como sinal, não como falha.

**Sobre a política de oração:** consolidada em §4.4 a partir de §19.9, que já estava fechada. A
política é clara e o produto **hoje diverge dela em duas superfícies**. A correção é runtime, está
fora do escopo da Fase 5, e a escolha do caminho é do fundador (`E5.41`).

**Sobre neutralidade denominacional:** não havia contradição real. Resolvido documentalmente sem
alterar nenhum documento.

**Nenhum arquivo de runtime foi alterado por este bloco.**

---

## 11. O que este bloco NÃO fez

- **Não revisou biblicamente nenhuma história.** Não é competência deste agente e o parecer diz isso
  explicitamente em §0.
- **Não criou relatórios `REVIEW_<storyId>.md`**, nem em branco — pelo motivo exposto em §8.
- **Não alterou nenhum texto de narração, quiz, versículo ou oração.**
- **Não removeu nem alterou nenhuma estrela, conquista ou recompensa.**
- **Não decidiu** entre os caminhos A, B e C de §4.5.
- **Não recuperou** o "Documento Oficial de Narração Limpo" — classificado NÃO RECUPERADO, não
  inexistente.
- **Não avaliou** a fidelidade bíblica de nenhuma cena, nem classificou nenhum item na escala de
  cinco níveis — fazê-lo sem revisor humano seria produzir exatamente o artefato falso que §8 recusa
  a criar.
- **Não testou com crianças reais** e não substitui esse teste.
