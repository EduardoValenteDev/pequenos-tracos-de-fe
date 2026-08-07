# Relatórios de Revisão Bíblica — por história

**Criado na Fase 5, Bloco 4 · 2026-08-07**

---

## Estado deste diretório: VAZIO

**Nenhum relatório de revisão bíblica existe neste repositório.** Zero de vinte.

Este diretório foi criado na Fase 5 porque
[`BIBLICAL_REVIEW_REPORT_TEMPLATE.md`](../BIBLICAL_REVIEW_REPORT_TEMPLATE.md) linha 5 instrui a
depositar os relatórios aqui — e o diretório não existia. Ele passa a existir **declaradamente
vazio**, para que a ausência dos relatórios seja um fato visível e auditável, e não uma omissão
silenciosa.

### Por que não há relatórios em branco aqui

A Fase 5 **deliberadamente não** duplicou o modelo vinte vezes. Um relatório preenchido por agente de
software, ou um modelo em branco com nome de relatório, **parece** uma revisão concluída numa
auditoria futura. Isso é o oposto do que este diretório precisa comunicar. Enquanto não houver
revisor humano, o diretório fica vazio.

---

## O portão que está violado

[`BIBLICAL_CONTENT_STANDARD.md`](../BIBLICAL_CONTENT_STANDARD.md) linha 93:

> *"Nenhuma história deve avançar para narração final ou para o pacote do narrador sem um relatório
> de revisão bíblica completo e com status `Aprovado` ou `Aprovado com ajuste documentado`."*

| Fato verificado na Fase 5 | Estado |
|---|---|
| `docs/NARRATOR_PACKAGE/` existe, com roteiro e checklist de gravação | **SIM** |
| Relatórios `REVIEW_<storyId>.md` neste diretório | **NENHUM** |
| Revisor bíblico humano identificado em qualquer documento | **NENHUM** |
| Itens classificados na escala de [`BIBLICAL_REVIEW_RISK_LEVELS.md`](../BIBLICAL_REVIEW_RISK_LEVELS.md) | **NENHUM** |

**O portão está atravessado por 20 histórias de 20.**

---

## Os 20 relatórios devidos

Nomes de arquivo esperados, conforme o modelo (`REVIEW_<storyId>.md`), com o `storyId` real de
`src/data/stories.js`. A coluna final registra quanto do texto **hoje no app** ainda é o texto que
passou pela revisão de 2026-06-01 — medição da Fase 5, Bloco 4, §2.4.

| # | Arquivo esperado | História | Cobertura da revisão sobre o texto atual |
|---:|---|---|---|
| 1 | `REVIEW_creation.md` | A Criação | **10/10 — íntegro** |
| 2 | `REVIEW_noah.md` | Noé e o Sinal da Aliança | **10/10 — íntegro** |
| 3 | `REVIEW_david_goliath.md` | Davi e Golias | **10/10 — íntegro** |
| 4 | `REVIEW_solomon_wisdom.md` | Salomão e a Sabedoria | 5/10 — parcial |
| 5 | `REVIEW_ruth_naomi.md` | Rute e Noemi | 5/10 — parcial |
| 6 | `REVIEW_timothy_faith.md` | Timóteo e a Fé | 3/10 — parcial |
| 7 | `REVIEW_mary_says_yes.md` | Maria Recebe a Boa Notícia | 2/10 — parcial |
| 8 | `REVIEW_moses_red_sea.md` | Moisés e o Mar Vermelho | 1/10 — parcial |
| 9 | `REVIEW_esther_queen.md` | Ester, a Rainha Corajosa | 1/10 — parcial |
| 10 | `REVIEW_samuel_hears_god.md` | Samuel Ouve a Voz de Deus | 1/10 — parcial |
| 11 | `REVIEW_josiah_young_king.md` | Josias, o Rei Jovem | 1/10 — parcial |
| 12 | `REVIEW_jesus_children.md` | Jesus e as Crianças | **0/10 — substituído** |
| 13 | `REVIEW_daniel_lions.md` | Daniel e os Leões | **0/10 — substituído** |
| 14 | `REVIEW_jonah_big_fish.md` | Jonas e o Grande Peixe | **0/10 — substituído** |
| 15 | `REVIEW_lost_sheep.md` | A Ovelha Perdida | **0/10 — substituído** |
| 16 | `REVIEW_good_samaritan.md` | O Bom Samaritano | **0/10 — substituído** |
| 17 | `REVIEW_abraham_stars.md` | Abraão e as Estrelas | **0/10 — substituído** |
| 18 | `REVIEW_joseph_colorful_coat.md` | José e a Túnica Especial | **0/10 — substituído** |
| 19 | `REVIEW_miraculous_catch.md` | A Pesca Milagrosa | **0/10 — substituído** |
| 20 | `REVIEW_jesus_temple.md` | Jesus no templo | **0/10 — substituído** |

**Cobertura total: 49 de 200 cenas (24,5%).**

---

## Escopo mínimo de cada relatório

Além do que o modelo já pede, a Fase 5 determina que cada relatório cubra:

1. **As 10 cenas de narração** da história, no texto **atual** do app — não no roteiro
   `final-5-revisoes`, que deixou de ser a fonte da verdade em 2026-07-09.
2. **As 8 perguntas de quiz**, e não apenas as 4 exibidas. As perguntas q5–q8 são reserva declarada e
   podem entrar em produção sem passar por revisão nova. Escopo = **160 perguntas**, não 80.
3. **A lição de coração** da história.
4. **Classificação de todo item encontrado** em um dos cinco níveis de
   [`BIBLICAL_REVIEW_RISK_LEVELS.md`](../BIBLICAL_REVIEW_RISK_LEVELS.md) — hoje nenhum item foi
   classificado.
5. **Consulta a pelo menos duas traduções**, conforme
   [`TRANSLATION_REFERENCE_POLICY.md`](../TRANSLATION_REFERENCE_POLICY.md).

---

## Quem preenche, e quando

- **Quem:** revisor humano qualificado (teólogo ou pastor), ainda **não escolhido** — encaminhamento
  `E5.33` da Fase 5, estado *dependente de terceiro externo*. A escolha é do fundador.
- **Quando:** Fase **9** (A Criação), Fase **13** (Noé) e Fase **15** (as outras dezoito), com portão
  duro na Fase **16** (congelamento editorial) — encaminhamento `E5.34`.

**Um agente de software não pode preencher estes relatórios.** O próprio projeto registrou, em
`docs/APP_360_SCALE_SECURITY_COMPLIANCE_AUDIT.md` linha 915, que *"IA pode ter introduzido
interpretações não intencionais"* — o que torna a IA a parte auditada, não a auditora.

---

Contexto completo, com método e medições:
[`docs/fase5-pareceres/04_PARECER_TEOLOGICO_E_CONTEUDO.md`](../../fase5-pareceres/04_PARECER_TEOLOGICO_E_CONTEUDO.md).
