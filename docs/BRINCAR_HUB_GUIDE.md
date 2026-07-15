# BRINCAR_HUB_GUIDE

**Última atualização:** Brincar BF — bloco de encerramento (2026-07-15)

Guia do **hub da aba Brincar** (`src/screens/BrincarScreen.js`). Descreve o estado
ATUAL e APROVADO após os blocos B1 (redesenho premium) → BF (consolidação/fechamento).
Validado no aparelho e aprovado pelo proprietário.

---

## 1. Objetivo da aba Brincar

Ser o **hub** de brincadeiras do Beni: apresentar os quatro jogos com **peso visual
igual**, orientar sem controlar a escolha (sugestão diária) e separar **jogos** de
**criação** (Criar livre / Minhas artes). O hub apenas **informa** — nunca consome
rodada nem altera regra comercial.

## 2. Arquitetura do hub

Tela única (rota de tab `Ateliê`, rótulo visível "Brincar"). Uma `ScrollView` com:
cabeçalho (gradiente + Beni) → conteúdo em `CenteredContent` (largura máx. no tablet).
Componentes internos: `GameArt`, `GameCard` (card de jogo), `AnimatedCard` (entrada
suave com respeito a movimento reduzido). Não há segunda tela: o hub **evoluiu a rota
oficial**.

## 3. Fonte declarativa dos jogos (`BENI_GAMES`)

Coleção única no topo de `BrincarScreen.js`. Cada jogo tem **uma** definição de:
`id · title · category · icon · route · tint/border/iconBg/color · a11y`. A **grade**
e a **sugestão diária** leem da MESMA fonte (sem rotas/textos/cores divergentes).
Abertura única por `openGame(navigation, game)` → `navigation.navigate(game.route)`
(Palavrinhas usa `abrirPalavrinhas` para navegação imediata, o fluxo especial já
existente). **Criar livre** e **Minhas artes** NÃO pertencem a `BENI_GAMES`. Nenhuma
configuração interna dos jogos (dificuldade, banco de palavras, cenas, áudio) vive aqui.

## 4. Ordem visual das seções

1. Cabeçalho compacto (Beni + "Brincar com o Beni" + "Qual brincadeira vamos escolher hoje?" + chip de plano).
2. Faixa **"Beni sugere hoje"**.
3. Seção **"Jogos do Beni"** — grade 2×2.
4. Seção **"Crie do seu jeito"** — Criar livre.
5. **Minhas artes**.
6. Barra inferior existente (intacta).

## 5. Regra da sugestão diária (`src/services/brincarSuggestion.js`)

Função PURA, sem dependência nem storage. `pickDailyIndex(dayKey, childId, count)`:
índice **determinístico** que avança **um por dia** (`dayOrdinal`, rotação cíclica →
equilíbrio entre os 4 jogos), deslocado por criança (`childOffset`). **Estável no mesmo
dia**; não muda por re-render (a tela calcula uma vez via `useMemo([childId])` sobre
`toDayKey(new Date())`). Fallback seguro: sem id / `count` 0/negativo/inválido → `0`,
nunca lança e **nunca sai de 0..count-1**. A sugestão só escolhe entre os quatro jogos —
**nunca Criar livre**.

## 6. Identidades visuais dos jogos

| Jogo | Cor | Categoria | Ícone |
|---|---|---|---|
| Pares do Beni | azul (`faithBlue`) | Memória | `pares` |
| Palavrinhas do Beni | dourado (`goldDeep`) | Letras | `palavrinhas` |
| Cadê a Ovelhinha? | verde (`greenDeep`) | Atenção | `ovelha` (vetor `OvelhaSvg`) |
| Monte a Cena | violeta (`purple`) | Raciocínio | `puzzle` |

Todos os cards são idênticos em tamanho/raio/sombra/borda/paddings/botão/tipografia.
A "arte" é uma composição vetorial simples (ícone + pontos na cor do jogo) — ver §15.

## 7. Separação entre jogos e criação

Os quatro **jogos** ficam na grade 2×2. A **criação** (Criar livre) sai da grade e
ganha a seção própria "Crie do seu jeito", seguida de "Minhas artes". Isso evita que
Criar livre pareça um "5º jogo".

## 8. Integração com Criar Livre

Card horizontal violeta "Criar livre" → `navigation.navigate(ROUTES.ATELIER_CANVAS, {})`
(parâmetros aprovados, inalterados). O motor/slider/borracha/storage/galeria do Criar
livre **não** são tocados pelo hub.

## 9. Integração com Minhas artes

Card compacto → `navigation.navigate(ROUTES.ATELIER_GALLERY)`. Mostra a **miniatura da
arte mais recente** via `resolveArtThumbUri(list[0])` + `SafeImage` (**só exibição, sem
re-exportar**, fallback seguro). Contagem por `listArts().length`, atualizada no foco
(`useFocusEffect`). Estado vazio e regras de acesso preservados. O hub não altera o
armazenamento nem a galeria.

## 10. Regras comerciais exibidas pelo hub

O hub **informa** e **nunca consome** rodada (`getDailyRounds`, sem `consumeRound`).
Chip de plano: **Plano Família** → "Brincadeiras sem limite"; **grátis** → rodadas reais
("Hoje: N rodada(s)…", singular/plural corretos; "acabaram — amanhã tem mais!"). Nunca
mostra "sem limite" para quem não tem acesso. O consumo real continua **dentro de cada
jogo**. Limites, contadores, resets e chaves de storage **inalterados**.

## 11. Safe area

`useSafeAreaInsets`: header por `paddingTop: Math.max(insets.top, 28)`; rodapé por
`paddingBottom: insets.bottom + 28` (o último card sobe acima da barra). Um único
controle de safe area (a `ScrollView`). Sem cabeçalho sticky.

## 12. Responsividade

Grade por células `flex:1` em duas linhas (`[[0,1],[2,3]].map`) — sem número mágico;
mesmas larguras por linha, alturas iguais por estrutura idêntica (título 2 linhas com
`minHeight`). `CenteredContent` limita a largura no tablet. Estruturalmente estável de
320 a 430+.

## 13. Acessibilidade

Cada jogo: `accessibilityLabel` "nome, jogo de X, jogar". Sugestão anuncia "Beni sugere
hoje: …". Criar livre: "atividade de desenho, abrir folha". Minhas artes: nome +
contagem + ação. Movimento reduzido respeitado (`AccessibilityInfo` → entrada sem
animação). Feedback de toque por `activeOpacity` (não só cor). Card inteiro clicável;
os botões internos ("Jogar"/"Abrir folha"/"Ver") são decorativos (uma navegação por card).

## 14. Modo Criador

O selo "MODO CRIADOR ATIVO" é um overlay **global** (`src/components/dev/CreatorModeBanner.js`),
**não** implementado dentro da BrincarScreen. Fica no canto superior direito ancorado na
safe area, `pointerEvents="none"`, protegido por `isCreatorQaModeAllowed()` (invisível em
produção). O header do hub deixa o canto superior direito livre para ele.

## 15. Limitações conhecidas

- **Arte por jogo:** ainda é o vetor oficial + fundo temático (não há ilustração
  dedicada por jogo).
- **Sugestão:** cíclica por dia e estável por sessão — não reavalia à meia-noite com o
  app aberto (decisão desta etapa).
- **"Recentes"/miniatura:** só a arte mais recente, exibição pura.

## 16. Melhorias futuras (opcionais — sem pendência obrigatória)

1. Ilustrações autorais dedicadas para cada jogo.
2. Estado real de "Continuar".
3. Estado real de "Jogado hoje".
4. Atualização automática da sugestão à meia-noite com o app aberto.

Estes itens são **possibilidades**, não compromissos deste bloco.

---

## Arquivos do hub

- `src/screens/BrincarScreen.js` — tela do hub.
- `src/services/brincarSuggestion.js` — sugestão diária (pura).
- `src/services/brincarDailyService.js` — rodadas diárias (fonte das rodadas exibidas).
- `src/constants/routes.js` — rotas oficiais dos jogos/criação.
