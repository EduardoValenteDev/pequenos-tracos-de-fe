# Padrão Editorial Bíblico — Pequenos Traços de Fé

**Versão:** 1.0  
**Data:** 2026-06-01  
**Público:** Redatores, revisores bíblicos, narrador, equipe de QA editorial

---

## Propósito

Este documento define o padrão editorial bíblico do app Pequenos Traços de Fé. Ele estabelece o critério mínimo que todo conteúdo textual deve atender antes de ser aprovado para produção: narração, quiz, lição, mensagem do guia, instrução de colorir e conteúdo da área dos pais.

O app se destina a crianças de 4 a 8 anos. O padrão bíblico deve ser alto o suficiente para garantir fidelidade ao texto sagrado e baixo o suficiente em linguagem para que uma criança de aproximadamente 5 anos compreenda o essencial, quando a natureza do conteúdo permitir.

---

## Princípios fundamentais

### 1. Fidelidade ao texto bíblico

O conteúdo deve ser fiel ao relato bíblico canônico. Isso significa:

- **O que está no texto bíblico pode ser narrado.** Fatos, diálogos registrados nas Escrituras e sequências de eventos podem ser usados como base.
- **O que não está no texto bíblico não deve ser inventado como fato.** Diálogos imaginados, motivações internas atribuídas a personagens sem base no texto, e detalhes físicos ou emocionais não registrados devem ser identificados como adaptação, não como fato bíblico.
- **Adaptação infantil é permitida e necessária.** Simplificar linguagem, condensar eventos, omitir passagens adultas ou violentas é esperado — desde que não distorça o sentido central da história.

### 2. Identificação clara da passagem bíblica

Cada história deve ter sua passagem de referência claramente identificada. Exemplo:

> Baseado em Gênesis 6–9

A referência não precisa aparecer na narração para crianças, mas deve estar documentada nos metadados da história e no relatório de revisão bíblica.

### 3. Lição central alinhada com o texto

Cada história possui uma lição central. Essa lição deve:

- Derivar naturalmente do texto bíblico, não ser imposta sobre ele.
- Ser verificável: um leitor que abrir a Bíblia e ler a passagem deve reconhecer a lição como consistente com o texto.
- Ser acessível a crianças de 4 a 8 anos sem distorcer o sentido teológico.

### 4. Personagens bíblicos com dignidade

Personagens bíblicos — incluindo Deus, Jesus, anjos, profetas, reis e figuras históricas — devem ser retratados com:

- Dignidade compatível com seu papel no texto sagrado.
- Falas e ações consistentes com o que a Bíblia atribui a eles.
- Cuidado redobrado quando se trata de fala atribuída a Deus ou Jesus: preferir paráfrase do que está escrito, nunca inventar diálogos não registrados.

### 5. Não criar doutrinas ou interpretações proprietárias

O app não deve criar, explícita ou implicitamente, uma interpretação teológica específica que não seja amplamente aceita pelo cristianismo histórico. Pontos controversos entre denominações devem ser evitados ou tratados com neutralidade. Ver `DOCTRINAL_NEUTRALITY_GUIDE.md`.

### 6. Esperança como tom dominante

O tom de qualquer história, mesmo as que envolvem temas difíceis (julgamento, morte, obediência em sofrimento), deve preservar esperança. O app é para crianças: o sentimento que a criança leva ao terminar uma história deve ser de confiança em Deus, não de medo, culpa ou tristeza.

---

## Categorias de conteúdo e padrão por categoria

| Categoria | Padrão |
|---|---|
| Título da história | Deve refletir o personagem, evento ou lição central. Evitar títulos que prometam algo não contido na história. |
| Texto de narração | Paráfrase fiel. Sem invenção de fatos. Linguagem de 4–8 anos. |
| Lição curta | Derivada do texto. Uma frase. Positiva e memorável. |
| Mensagem do guia (Lumi) | Aplicação prática da lição. Não criar nova teologia. Linguagem infantil e afetuosa. |
| Quiz | Perguntas sobre fatos da história ou sobre a lição. Alternativas incorretas devem ser claramente diferentes, nunca confusas. |
| Instrução de colorir | Descritiva da cena. Não atribuir sentimentos ou falas a personagens além do registrado. |
| Conteúdo da área dos pais | Pode ser mais aprofundado, mas deve identificar a passagem, a lição e sugestões de conversa — sem impor interpretação denominacional. |

---

## O que nunca é permitido

- Inventar milagres não registrados na Bíblia e apresentá-los como fato bíblico.
- Atribuir a Deus, Jesus ou o Espírito Santo falas que não estão nas Escrituras como revelação ou instrução direta.
- Usar a história bíblica para apoiar uma posição política, social ou cultural não derivada do texto.
- Adaptar a história de forma que o personagem central, sua lição ou seu desfecho seja oposto ao que a Bíblia registra.
- Romantizar, minimizar ou omitir de forma que distorça consequências morais claramente presentes no texto (ex: tratar a desobediência como algo positivo).

---

## Processo de aplicação

Este padrão é aplicado via:

1. `BIBLICAL_REVIEW_CHECKLIST.md` — checklist por elemento de conteúdo
2. `BIBLICAL_REVIEW_REPORT_TEMPLATE.md` — relatório por história
3. `BIBLICAL_REVIEW_RISK_LEVELS.md` — classificação de risco por item

Nenhuma história deve avançar para narração final ou para o pacote do narrador sem um relatório de revisão bíblica completo e com status `Aprovado` ou `Aprovado com ajuste documentado`.
