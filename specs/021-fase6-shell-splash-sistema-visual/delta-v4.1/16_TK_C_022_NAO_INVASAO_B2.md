# `TK-C-022` — Asserção de não-invasão: os defeitos 4 e 5 de §19 continuam em `B2`

> **Pacote:** `F6-R1.4` · `F6-SG-C` · **Commit auditado:** `76cfdf9` (`C-C8`) ·
> **Commit deste artefato:** `C-GOV1` · **Gate:** — (verificação documental) ·
> **Mudança de código esperada:** **nenhuma**.

`TK-C-019`, `TK-C-020` e `TK-C-021` corrigiram três defeitos de PLAN §19 dentro de
`src/components/TabletSidebar.js`. Os defeitos **4** e **5** vivem **no mesmo arquivo**, e
frequentemente **nas mesmas regras de estilo**. Esta é exatamente a situação em que um bloco
bloqueado começa a ser resolvido por acidente — alguém "aproveita que está ali". Este artefato
existe para provar que isso **não** aconteceu.

O objetivo, literal: **provar que a Fase 6 não começou `B2` por dentro.**

---

## 1. O que está bloqueado, e por quê

`B2` é o bloco de **acessibilidade e legibilidade** (`AD-3`), e continua **BLOQUEADO**. Dois
defeitos de PLAN §19 pertencem a ele:

| # | Defeito (texto do PLAN) | Onde | Norma violada |
|---|---|---|---|
| **4** | `navButton` com `paddingVertical: 13` + ícone 26 ⇒ **≈52pt** de alvo de toque | `TabletSidebar.js:200`, `:209` (numeração pré-`C-C8`) | **`RF-A7`** — mínimo **56×56** |
| **5** | `progressLabel` **10px** e `stars` **11px** | `TabletSidebar.js:192`, `:173` (idem) | **`RF-C12`** — piso de **13px** |

Nenhum dos dois foi endereçado. Ambos permanecem **abertos**.

---

## 2. Método

Revisão **linha a linha** do *diff* de `C-C8` (`76cfdf9`), em duas direções:

1. **Por linha removida** — as **20** linhas que saíram, cada uma atribuída ao defeito que a
   justifica. Uma linha removida sem defeito que a explique seria invasão.
2. **Por propriedade protegida** — as quatro medidas dos defeitos 4 e 5 lidas **antes** e
   **depois**, no arquivo inteiro, por comparação direta entre `76cfdf9^` e `76cfdf9`.

A segunda direção existe porque a primeira, sozinha, não bastaria: uma medida poderia ter sido
alterada dentro de uma linha que o *diff* mostra como modificada por outro motivo.

---

## 3. As 20 linhas removidas, com defeito atribuído

| # | Linha removida | Defeito |
|---|---|---|
| 1 | `import { colors } from '../theme/colors';` | **3** |
| 2 | `backgroundColor="#FFF8EF"` | **3** (literal que era segunda origem de cor) |
| 3 | `borderColor={colors.primary + '40'}` | **3** |
| 4 | `<FaithIcon name="star" size={14} color={colors.primary} />` | **3** (só a cor; `size={14}` reescrito idêntico) |
| 5 | `color={isActive ? colors.primary : colors.textLight}` | **3** |
| 6 | `width: 200,` | **1** |
| 7 | `backgroundColor: colors.sidebarBg,` | **3** |
| 8 | `borderRightColor: colors.border,` | **3** |
| 9 | `borderBottomColor: colors.border,` | **3** |
| 10 | `backgroundColor: colors.primary + '30',` | **3** |
| 11 | `borderColor: colors.primary + '50',` | **3** |
| 12 | `color: colors.text,` | **3** |
| 13 | `color: colors.textLight,` (`stars`) | **3** |
| 14 | `backgroundColor: colors.border,` (`progressOuter`) | **3** |
| 15 | `backgroundColor: colors.primary,` (`progressInner`) | **3** |
| 16 | `color: colors.textLight,` (`progressLabel`) | **3** |
| 17 | `navButtons: { gap: 2 },` | **2** |
| 18 | `backgroundColor: colors.activeBg,` | **3** |
| 19 | `color: colors.textLight,` (`navLabel`) | **3** |
| 20 | `color: colors.primaryDark,` (`navLabelActive`) | **3** |

**Nenhuma linha órfã.** Toda remoção é explicada pelo defeito 1, 2 ou 3.

---

## 4. As quatro medidas protegidas, antes e depois

Comparação direta entre `76cfdf9^` e `76cfdf9`:

| Propriedade | Defeito | Antes | Depois | Linha antes → depois | Veredito |
|---|---|---|---|---|---|
| `navButton.paddingVertical` | 4 | `13` | `13` | `200 → 290` | **intacta** |
| `navIcon.width` | 4 | `26` | `26` | `209 → 299` | **intacta** |
| `FaithIcon size` do `navButton` | 4 | `isActive ? 24 : 21` | `isActive ? 24 : 21` | `91 → 179` | **intacta** |
| `stars.fontSize` | 5 | `11` | `11` | `173 → 261` | **intacta** |
| `progressLabel.fontSize` | 5 | `10` | `10` | `192 → 280` | **intacta** |

Também intactos, embora não sejam os defeitos: `navButton.paddingHorizontal: 14`,
`navButton.borderRadius: 14` e o `size={14}` do ícone de estrela do perfil. **Só as linhas
mudaram de número** — o *diff* deslocou o arquivo em ~90 linhas por causa do cabeçalho de
documentação e da região pura de `TK-C-019`.

---

## 5. A exceção honesta: a **cor** de `stars` e `progressLabel` mudou

O *diff* **toca** as regras `stars` e `progressLabel` — remove `color: colors.textLight` e
escreve `color: color.ink600`. É preciso dizer isso com clareza, porque a redação de `TK-C-022`
("nenhuma linha altera … `progressLabel` ou `stars`") lida ao pé da letra proibiria qualquer
toque nessas regras.

**Por que isto não é invasão de `B2`:**

1. **O defeito 5 é de TAMANHO, não de cor.** `RF-C12` é um piso de **13px**. A norma citada não
   fala de cor. As duas medidas que o defeito nomeia — `11` e `10` — estão inalteradas (§4).
2. **Era inevitável dado `TK-C-021`.** Remover `import { colors }` exige tocar **todo** consumo
   de `colors` no arquivo. Deixar essas duas regras com a origem legada manteria o `import`
   vivo e faria `TK-C-021` falhar por construção. As duas tasks são do mesmo pacote `C-C8` e o
   corpus as ordena `TK-C-020 → TK-C-021`, ciente de que ambas caem no mesmo arquivo.
3. **Não melhora nem piora a legibilidade em disputa.** A troca `#8A7464 → #7A6A50` (`ink600`)
   é levemente **mais escura** sobre fundo claro, ou seja, não reduz contraste; e não altera o
   tamanho, que é onde `RF-C12` foi violada. `B2` continuará tendo exatamente o mesmo trabalho:
   subir 10px e 11px para o piso de 13px.

**Leitura adotada:** a propriedade protegida por `TK-C-022` é a **medida** nomeada em cada
defeito, não a regra de estilo inteira. Fica registrado que esta é uma interpretação, e que a
alternativa literal seria incompatível com `TK-C-021` no mesmo pacote.

---

## 6. O que este artefato **não** prova

- **Não** prova ausência de destino de navegação novo. Esse é **`G-SID-4`**, criado em
  **`TK-C-023`**, com prova vermelha independente em `MT-23` (`TK-C-057`).
- **Não** prova que a correção do defeito 2 funcionou. Vazio vertical **não é automatizável**:
  a prova é **captura física comparativa em iPad retrato**, medida em pontos, cenário **§28 #16**,
  dentro de `SD-4` — **PENDENTE**.
- **Não** libera `B2`. `TK-D-005` emite parecer; o desbloqueio é decisão do fundador.

---

## 7. Conclusão

**Nenhuma linha do *diff* de `C-C8` endereça os defeitos 4 ou 5 de PLAN §19.** As cinco medidas
que os constituem estão byte a byte idênticas. As 20 remoções são todas atribuíveis aos defeitos
1, 2 e 3. A única regra protegida tocada teve a **origem** da cor trocada, com a **medida**
preservada, por exigência de `TK-C-021` no mesmo pacote.

**`B2` continua BLOQUEADO.**
