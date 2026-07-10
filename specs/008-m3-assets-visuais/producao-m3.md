# M3 · Tabela de produção de arte (briefing para o designer)

> Documento **autônomo**: pode ser enviado ao designer sem contexto adicional.
> **37 artes novas**, 7 histórias. Cada arte substitui um arquivo existente **mantendo exatamente o mesmo nome**.

## Regras técnicas (obrigatórias, valem para todas as artes)

| Item | Regra |
|---|---|
| **Nome do arquivo** | Idêntico ao atual. Não renomear, não criar sufixo, não mudar extensão. |
| **Folha de colorir** | `assets/stories/<historia>/coloring/scene_NN.png` — PNG, **1122 × 1402 px**, traço preto sobre fundo branco. |
| **Ilustrada** | `assets/stories/<historia>/scenes/<historia>_scene_NN.webp` — WebP. |
| **Folha de colorir: áreas fechadas** | O app usa balde de tinta (flood fill). Contornos precisam ser **fechados**, sem vazamento entre regiões. |
| **Fidelidade** | A arte deve representar **a cena descrita**, não uma variação livre do tema da história. É esse o motivo de todas as correções abaixo. |

## Padrões de erro encontrados (para não repetir)

1. **Compressão da história** — o conjunto ilustra só os primeiros momentos e repete beats, deixando o fim da narrativa sem arte. *(José: 10 folhas para 4 momentos.)*
2. **Deslocamento** — cada imagem mostra o beat da cena anterior. *(Ovelha Perdida, Bom Samaritano no trecho final.)*
3. **Elemento simbólico ausente** — a cena está "no tema", mas falta o objeto que a narração destaca. *(Abraão: falta o coração/luz e o mapa. Bom Samaritano 08: falta o pagamento.)*
4. **Duplicata** — duas folhas mostrando o mesmo momento. *(Bom Samaritano 09 e 10.)*

---

## 1. joseph_colorful_coat — 10 folhas de colorir (conjunto inteiro)

O conjunto atual reencena só os 4 primeiros momentos. **Seis cenas nunca foram desenhadas.** Refazer as 10.

| Arquivo | Cena | O que deve mostrar |
|---|---|---|
| `coloring/scene_01.png` | José, o filho amado | Jacó entrega a José a **túnica especial listrada**; irmãos ao fundo com ciúme |
| `coloring/scene_02.png` | Os sonhos de José | Céu noturno com **estrelas e espigas de trigo** |
| `coloring/scene_03.png` | Os irmãos fazem um plano | Irmãos reunidos ao longe, expressões sérias |
| `coloring/scene_04.png` | José é vendido | **Mercadores com camelos** no deserto |
| `coloring/scene_05.png` | José no Egito | **Palácio egípcio**, colunas e hieróglifos |
| `coloring/scene_06.png` | José na prisão | **Cela** com um raio de luz entrando pela janela |
| `coloring/scene_07.png` | José interpreta sonhos | **Videira com uvas** e **cesta de pão** |
| `coloring/scene_08.png` | O sonho do faraó | **Faraó com coroa** e as **vacas** no campo |
| `coloring/scene_09.png` | José governa o Egito | José com **colar e roupa real** no palácio |
| `coloring/scene_10.png` | Reconciliação | **Grande abraço** de reencontro, alegria e lágrimas |

## 2. esther_queen — 5 folhas de colorir + 7 ilustradas

Colorir e ilustrada divergem entre si; os dois lados erram, em cenas diferentes. As cenas 04, 06 e 07 **não existem em nenhum dos conjuntos**.

### Folhas de colorir
| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `coloring/scene_03.png` | O plano de Hamã | Hamã cheio de orgulho e raiva contra Mardoqueu | Mostra a coroação (cena 1) |
| `coloring/scene_04.png` | Para um momento como este | Ester à janela do palácio, horizonte dourado | Mostra Mardoqueu no portão |
| `coloring/scene_05.png` | O jejum | Pessoas orando juntas, velas acesas | Mostra o orgulho de Hamã |
| `coloring/scene_06.png` | A decisão | Ester em traje real, expressão firme e corajosa | Mostra a entrega da carta (cena 3) |
| `coloring/scene_07.png` | Diante do rei | Salão real, colunas douradas, tapetes | Mostra o jejum (cena 5) |

*(colorir 08, 09 e 10 estão corretas — não tocar.)*

### Ilustradas
| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `scenes/esther_queen_scene_03.webp` | O plano de Hamã | Hamã orgulhoso, planejando o mal | Preparação de Ester (cena 1/2) |
| `scenes/esther_queen_scene_04.webp` | Para um momento como este | Mardoqueu pede que Ester fale com o rei | Coroação (cena 1) |
| `scenes/esther_queen_scene_05.webp` | O jejum | Ester pede que o povo jejue; oração | Mardoqueu no portão |
| `scenes/esther_queen_scene_06.webp` | A decisão | Ester vestida de rainha entra no pátio; o rei a recebe | Hamã desfilando |
| `scenes/esther_queen_scene_07.webp` | Diante do rei | Ester revela seu pedido ao rei | Mardoqueu aconselha Ester (cena 4) |
| `scenes/esther_queen_scene_08.webp` | O plano descoberto | O plano de Hamã é revelado; o rei age | Jejum/oração (cena 5) |
| `scenes/esther_queen_scene_09.webp` | O povo protegido | Nova ordem escrita; tristeza vira esperança | Cetro estendido (cena 8) |

*(ilustrada 10 está correta — não tocar.)*

## 3. good_samaritan — 5 folhas de colorir + 3 ilustradas

O desfecho da parábola ("Vai e faz o mesmo") **não existe em nenhum dos conjuntos**.

### Folhas de colorir
| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `coloring/scene_01.png` | Quem é o meu próximo? | Mestre da lei pergunta a Jesus; **rolo de papiro** | Viajante ileso (cena 2) |
| `coloring/scene_07.png` | A caminho da estalagem | Ferido **sobre o animal**, levado à estalagem | Repete o curativo (cena 6) |
| `coloring/scene_08.png` | O pagamento | Samaritano entrega **moedas** ao estalajadeiro | Transporte à estalagem (cena 7) |
| `coloring/scene_09.png` | A pergunta de Jesus | Jesus pergunta ao mestre **qual dos três foi o próximo** | Pagamento (cena 8) |
| `coloring/scene_10.png` | Vai e faz o mesmo | **Criança ajudando alguém**, cena moderna e colorida | Pagamento de novo (duplica a 09) |

*(colorir 02, 03, 04, 05 e 06 estão corretas — não tocar.)*

### Ilustradas
| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `scenes/good_samaritan_scene_08.webp` | O pagamento | Samaritano entrega **moedas** ao estalajadeiro | Cuida do ferido; **falta o pagamento** |
| `scenes/good_samaritan_scene_09.webp` | A pergunta de Jesus | Jesus e o mestre da lei | Pagamento (cena 8) |
| `scenes/good_samaritan_scene_10.webp` | Vai e faz o mesmo | Amor em ação; alguém ajudando | Jesus questiona (cena 9) |

*(ilustradas 01–07 estão corretas — não tocar. A 02 mostra o viajante antes do ataque e foi mantida por decisão.)*

## 4. lost_sheep — 3 ilustradas

As cenas finais (festa e coração) **não existem**.

| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `scenes/lost_sheep_scene_08.webp` | O pastor carrega no ombro | Ovelha **sobre os ombros**, a caminho de casa | Pastor agachado tocando a ovelha |
| `scenes/lost_sheep_scene_09.webp` | A festa | Amigos e vizinhos **celebrando juntos** | Abraço íntimo (cena 7) |
| `scenes/lost_sheep_scene_10.webp` | Você é essa ovelhinha | **Coração dourado** com a ovelhinha dentro, brilhos | Ovelha nos ombros no rebanho (cena 8) |

## 5. abraham_stars — 2 folhas de colorir

Elemento simbólico ausente nos dois casos.

| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `coloring/scene_04.png` | O coração de Abraão | Abraão crendo: **coração aberto e luz dourada** ao redor | Abraão e Sara junto à tenda; símbolo ausente |
| `coloring/scene_09.png` | A terra prometida | **Mapa** com rios, montanhas e campos | Abraão caminhando sob a lua; sem mapa |

*(colorir 01 está correta — não tocar.)*

## 6. miraculous_catch — 1 folha de colorir

| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `coloring/scene_05.png` | A pesca abundante | Pedro e as **redes se enchendo de peixes** | Jesus apontando, rede vazia (cena 4) |

## 7. samuel_hears_god — 1 ilustrada

| Arquivo | Cena | O que deve mostrar | Erro atual |
|---|---|---|---|
| `scenes/samuel_hears_god_scene_10.webp` | O profeta de Israel | Samuel **adulto**, expressão sábia, céu azul | Samuel **menino** no templo com Eli (cena 1) |

---

## Resumo de entrega

| História | Colorir | Ilustradas | Total | Lote sugerido |
|---|---|---|---|---|
| miraculous_catch | 1 | 0 | 1 | L1 |
| samuel_hears_god | 0 | 1 | 1 | L2 |
| abraham_stars | 2 | 0 | 2 | L3 |
| lost_sheep | 0 | 3 | 3 | L4 |
| good_samaritan | 5 | 3 | 8 | L5 |
| esther_queen | 5 | 7 | 12 | L6 |
| joseph_colorful_coat | 10 | 0 | 10 | L7 |
| **TOTAL** | **23** | **14** | **37** | — |

Entrega **por lote**, na ordem acima (risco crescente). Cada lote é integrado, verificado e validado em aparelho antes do próximo.

## Fora deste briefing (não produzir agora)

Pendências **visuais opcionais** — assets corretos quanto ao conteúdo, eventualmente insatisfatórios esteticamente. **Não fazem parte do M3:** `noah/coloring/scene_04.png`, `lost_sheep/coloring/scene_05.png`, `abraham_stars/coloring/scene_01.png`.
