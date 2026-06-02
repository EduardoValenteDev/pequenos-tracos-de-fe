# Sprint 19.2 — Relatório de Validação do Mapeamento CSV

**Data:** 2026-06-01  
**Arquivo fonte:** `docs/biblical-review/final-5-revisoes/TEXTOS_FINAIS_PARA_IMPLEMENTACAO_5_REVISOES.csv`  
**Arquivo alvo:** `src/data/stories.js`  
**Status:** APROVADO — sem erros críticos

---

## Resultado da validação

| Critério | Esperado | Encontrado | Status |
|---|---|---|---|
| Stories no CSV | 20 | 20 | ✓ |
| Cenas no CSV | 200 | 200 | ✓ |
| Textos finais não vazios | 200 | 200 | ✓ |
| StoryIds desconhecidos | 0 | 0 | ✓ |
| Duplicatas storyId + cena | 0 | 0 | ✓ |
| Aspas simples nos novos textos | 0 | 0 | ✓ |
| Cenas fora do range 1–10 | 0 | 0 | ✓ |
| Erros críticos | 0 | 0 | ✓ |
| Avisos | 0 | 0 | ✓ |

---

## Mapeamento storyId × CSV

| # CSV | storyTitleFinal | storyId (derivado do audioFileName) | Cenas |
|---|---|---|---|
| 01 | A Criação | creation | 1–10 |
| 02 | Noé e o Sinal da Aliança | noah | 1–10 |
| 03 | Davi e Golias | david_goliath | 1–10 |
| 04 | Jesus e as Crianças | jesus_children | 1–10 |
| 05 | Daniel e os Leões | daniel_lions | 1–10 |
| 06 | Jonas e o Grande Peixe | jonah_big_fish | 1–10 |
| 07 | A Ovelha Perdida | lost_sheep | 1–10 |
| 08 | O Bom Samaritano | good_samaritan | 1–10 |
| 09 | Abraão e as Estrelas | abraham_stars | 1–10 |
| 10 | José e a Túnica Especial | joseph_colorful_coat | 1–10 |
| 11 | Moisés e o Mar Vermelho | moses_red_sea | 1–10 |
| 12 | Rute e Noemi | ruth_naomi | 1–10 |
| 13 | Ester, a Rainha Corajosa | esther_queen | 1–10 |
| 14 | A Pesca Milagrosa | miraculous_catch | 1–10 |
| 15 | Samuel Ouve a Voz de Deus | samuel_hears_god | 1–10 |
| 16 | Josias, o Rei Jovem | josiah_young_king | 1–10 |
| 17 | Salomão e a Sabedoria | solomon_wisdom | 1–10 |
| 18 | Maria Recebe a Boa Notícia | mary_says_yes | 1–10 |
| 19 | Timóteo e a Fé | timothy_faith | 1–10 |
| 20 | Jesus no Templo | jesus_temple | 1–10 |

---

## Títulos com alteração aprovada

| storyId | Título anterior | Título final |
|---|---|---|
| noah | Noé e o Arco-Íris | Noé e o Sinal da Aliança |
| jonah_big_fish | Jonas e o Peixe | Jonas e o Grande Peixe |
| joseph_colorful_coat | José e o Manto Colorido | José e a Túnica Especial |
| mary_says_yes | Maria Diz Sim | Maria Recebe a Boa Notícia |

---

## Ocorrência técnica durante a aplicação

**Problema encontrado no primeiro run:** 2 cenas de `jesus_children` (cenas 3 e 7) continham `\'` (aspa simples escapada com barra invertida) no textoNarracao original — padrão `d\'Ele`. O regex inicial `[^']*` não tratava escapes e terminou prematuramente nessas aspas.

**Resolução:** O regex foi corrigido para `(?:[^'\\]|\\.)*`, que trata corretamente sequências escapadas. O stories.js foi restaurado do git antes de re-aplicar.

**Linhas afetadas no original (antes da substituição):**
- L674: `...perto d\'Ele. Isso...` (jesus_children cena 3)
- L730: `...ombro d\'Ele. Um...` (jesus_children cena 7)

**Os novos textos do CSV não contêm aspas simples** — a substituição remove a necessidade de escapes.

---

## Campos NÃO alterados (confirmado)

| Campo | Alterado? |
|---|---|
| instrucaoColorir | NÃO |
| imagemNarracao | NÃO |
| imagemColorir | NÃO |
| audio | NÃO |
| storyId (id da história) | NÃO |
| id da cena | NÃO |
| accessType | NÃO |
| status | NÃO |
| licaoCurta | NÃO |
| mensagemGuia | NÃO |
| slug | NÃO |
| referencia | NÃO |

---

## Nomes de áudio verificados

Os nomes de arquivo de áudio no CSV (campo `audioFileName`) correspondem à convenção existente do app e não foram aplicados ao campo `audio` de stories.js (que permanece `null` para histórias sem áudio gravado ainda). Nenhum nome de arquivo de áudio foi alterado.

---

## Conclusão

A validação passou sem erros críticos. Os 200 textoNarracao e os 4 títulos foram mapeados corretamente. A aplicação foi aprovada para execução.
