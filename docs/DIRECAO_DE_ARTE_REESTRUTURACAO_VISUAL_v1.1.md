# DIREÇÃO DE ARTE & REESTRUTURAÇÃO VISUAL — "O LIVRO VIVO"
**Versão 1.1 · 2026-07-02 · Anexo oficial do DOCUMENTO_MESTRE_EXECUCAO_PTF_v3.1**
**Changelog v1.1:** D1–D4 respondidas pelo fundador e congeladas (Seção 8). D4 redefinida: capas multiestilo viram identidade oficial "Galeria Viva" — nenhuma recapa; a unificação é pela MOLDURA, não pela arte. Nova Seção 2.4 (Responsividade e padrão absoluto de botões — phone/tablet/iPad, texto nunca cortado). Nova Seção 10 (recursos, bibliotecas e aquisições) e Seção 11 (padrões validados por benchmark + backlog pós-lançamento). A0 ampliado com fundação responsiva.
**Base: auditoria visual de 53 telas reais do app (commit atual) + vídeo completo. Este documento define COMO cada bloco do plano v3.1 deve ser construído visualmente. Em conflito com telas atuais, este documento prevalece; em conflito de escopo, o v3.1 prevalece.**

---

## 0. COMO USAR (instruções para o Claude Code)

1. Este documento cria **1 bloco novo obrigatório (A0)** e **1 bloco de varredura final (A14)**, e define o padrão visual que TODOS os blocos A1–A13 e B4 do v3.1 devem seguir ao serem implementados. Nenhuma tela nova nasce no visual antigo a partir do A0.
2. **Não repintar telas que vão morrer.** O v3.1 já mata ou reconstrói: o painel de conclusão atual, o Ateliê como está (vira Brincar com 5 cards), o card "Desenho guiado", "Colorir uma história" dentro do Ateliê, "Criar com Beni" na Home, e os cards de texto do Baú. Todo esforço visual vai para as telas FUTURAS dessas áreas, nunca para maquiar as atuais.
3. Tokens primeiro, telas depois. Nenhum hex/tamanho/sombra hardcoded em componente após o A0 — tudo via `src/theme/tokens.js`.
4. Governança inalterada: 1 bloco por vez, validação humana com screenshot/vídeo em Android físico intermediário, gates verdes, push só com autorização.

---

## 1. A TESE OFICIAL: "O LIVRO VIVO"

O app inteiro é **um livro de histórias mágico que a criança abre** — não um aplicativo que contém histórias. *(D1 aprovada pelo fundador com a condição registrada: esta direção troca a PELE do app — cores, tipografia, componentes, estados — e nunca altera estrutura, fluxos ou escopo definidos no v3.1. Qualquer conflito entre estética e estrutura: a estrutura vence e o caso sobe para o fundador.)* O DNA visual já existe no produto: o mapa-pergaminho. O trabalho é espalhar esse DNA (papel, tinta, dourado, luz quente) para todas as telas, e aposentar tudo que é "dashboard" (cards brancos chapados, cores saturadas competindo, caixa alta espaçada, emoji de sistema).

**As 10 Leis do sistema (invioláveis a partir do A0):**

1. **Uma cor de ação.** Todo botão primário do app é terracota. Sem exceção. Verde, rosa, roxo, azul e amarelo deixam de existir como botões.
2. **Dourado é material de recompensa, não cor de UI.** Só aparece em: estrelas, certificado, molduras de conquista, linha do mapa, selos. Se tudo é dourado, nada é precioso.
3. **Zero emoji na interface.** Todo pictograma é do set próprio desenhado no traço do mundo (Seção 5). Emoji só é aceitável DENTRO de texto digitado pela criança.
4. **Zero CAIXA ALTA espaçada.** "LIÇÃO DO CORAÇÃO", "MISSÃO DE HOJE", "VOCÊ DESBLOQUEOU", "PRÓXIMA CONQUISTA" viram frases em sentence case com ornamento (estrelinha dourada ou traço fino).
5. **Um herói por tela.** Cada tela tem UM elemento dominante; o resto rebaixa. Se dois elementos disputam, um deles perde tamanho, cor ou a tela.
6. **A arte manda, a UI serve.** Ilustrações sangram na tela ou ganham moldura de página; nunca thumbnail com chip "Cena ilustrada" por cima. O chip morre.
7. **Texto é tinta sobre papel.** Nunca preto puro ou cinza frio; sempre a família tinta-sépia. Fundos nunca branco puro; sempre a família papel.
8. **Roxo aposentado da UI.** Os momentos espirituais (Momento com Beni, Guardar no coração, Cantinho) usam **céu-noite estrelado + dourado** (a mesma família das cenas da Criação). Roxo chapado não existe mais em nenhuma tela. *(D2 aprovada.)*
9. **Estados de espera têm alma.** Loading = Beni animado; vazio = Beni convidando; erro = Beni que tropeçou. Nunca spinner de sistema, nunca retângulo colorido com emoji (o "Abrindo seu livrinho…" roxo atual é o exemplo do que nunca mais pode existir).
10. **Toque de criança: um toque, um resultado.** Nada de menus de dois níveis, dropdowns, alvos < 56px, ou textos de instrução para operar ferramenta.

---

## 2. TOKENS OFICIAIS (`src/theme/tokens.js` — bloco A0)

### 2.1 Cores
```
// PAPEL (fundos)
paper50:  #FDF8EE   // fundo universal de tela
paper100: #F8F0DC   // cards/páginas
paper200: #EFE3C8   // bordas suaves, divisores, estados desabilitados
paper300: #E4D5B4   // dots inativos, trilhos de progresso

// TINTA (textos)
ink900: #3E2E1B     // títulos e corpo
ink600: #7A6A50     // secundário
ink400: #A89573     // muted, placeholders, links terciários ("Deixar para depois")

// TERRACOTA (ação — única cor de botão primário)
terra500: #C9502A   // botão primário
terra600: #A73F1F   // pressed
terra100: #F7DED2   // tint de apoio (fundos de aviso gentil)
onTerra:  #FFF6E8   // texto sobre terracota

// DOURADO (recompensa — nunca botão)
gold700: #8F6A1E    // texto sobre dourados claros
gold500: #C99A3B    // molduras, selos, linha do mapa, ornamentos
gold300: #E8C05A    // brilho de estrela, preenchimentos
gold100: #F6E7C8    // fundo de medalha/conquista

// CÉU-NOITE (mundo das histórias + rituais)
night800: #1C2B52   // capas, fundos de ritual, leitor do Livrinho
night600: #2E4370   // variação
star100:  #F2DCA0   // texto/estrelas sobre night

// SEMÂNTICOS (mínimos)
acerto   = gold300 (quiz correto: estrela acende — não existe "verde de acerto")
atencao  = terra100 + ink600 (avisos gentis; não existe vermelho no app infantil)
```
Regra: qualquer cor fora desta lista é bug de design. As cores atuais que morrem: laranja-gradiente, amarelo-botão, verde-botão, rosa-botão, roxo-UI, azul-player, azul-chip, vermelho-quiz, verde-quiz, navy-row, lavanda-row.

### 2.2 Tipografia (3 opções — fundador escolhe em D3; implementar via @expo-google-fonts)
| Par | Display (títulos) | Texto (corpo/UI) | Personalidade |
|---|---|---|---|
| **A — Icônico (recomendado)** | **Fraunces** (peso 600, eixo SOFT alto — serif de livro, redondinha) | **Nunito** (400/700) | "Livro de histórias premium"; máxima distinção no nicho |
| B — Seguro | Baloo 2 (700/800) | Quicksand (400/600) | Evolução do atual; zero risco, menos icônico |
| C — Lúdico | Gluten (600) | Nunito (400/700) | Mais brincalhão; ótimo, porém menos "clássico" |

Escala (base 17): body 17 · bodySmall 15 · caption 13 (mínimo absoluto do app — os 11–12px atuais morrem) · titleCard 22 · titleScreen 28 · display 34 (celebração/heróis) · displayXL 40 (nome no certificado). Line-height 1.35 títulos / 1.55 corpo. Peso: display sempre no display-font; UI labels 700 no texto-font.

### 2.3 Forma, sombra, textura, movimento
```
radius: { chip: 14, card: 20, hero: 24, pill: 28 }
border: 1.5px paper200 (cards) · 2px gold500 (molduras de recompensa)
sombra única: shadowColor #3E2E1B, opacity 0.10, radius 10, offsetY 3 (NUNCA mais de uma sombra por elemento)
textura: paper_grain.png em overlay 3–4% opacity nos fundos paper50/100 (asset da Seção 6)
motion: { fast:180ms, base:250ms, slow:400ms, pageTurn:450ms } · easing spring suave (damping alto) · botão primário: scale 0.96 no press ("squish")
```

### 2.4 Responsividade e o PADRÃO ABSOLUTO DE BOTÕES (phone · tablet Android · iPad)
O v3.1 congelou suporte oficial a iPad e tablet no v1 (P5) — e os prints mostram textos/botões truncados ("Sua primeira estrelinha está…", "Desenhe uma pombinha leva…", "Um momentinho de fé em f…"). A partir do A0, valem estas regras de ferro:

**Botões (componente único `BotaoPrimario`/`Secundario`/`Ghost`):**
- Altura mínima 56 (criança) / conteúdo com `paddingVertical` — **altura nunca fixa**: se o texto quebrar em 2 linhas, o botão cresce.
- **Texto de botão NUNCA é cortado.** Ordem de defesa: (1) largura fluida até `maxWidth`; (2) `adjustsFontSizeToFit` com `minimumFontScale 0.85`; (3) quebra em 2 linhas centralizadas; (4) se ainda não couber, o COPY é encurtado no bloco (nunca `ellipsizeMode`). `numberOfLines` com reticências é PROIBIDO em botões e títulos.
- Largura: `alignSelf:'stretch'` dentro do contêiner de conteúdo (nunca `width` fixo em px); em telas largas o contêiner limita, não o botão.
- Toque: alvo mínimo 56×56 com `hitSlop` quando o visual for menor; espaçamento mínimo 12 entre botões empilhados.
- Press: squish scale 0.96 + haptic leve (Seção 10).

**Layout responsivo (tokens em `tokens.js`):**
```
breakpoints: { phone: 0, tablet: 600, tabletL: 900 }   // dp, via useWindowDimensions
maxContentWidth: { phone: '100%', tablet: 560, tabletL: 640 }  // conteúdo centralizado; papel50 preenche as laterais
grid: Brincar/Baú/galerias = 1 coluna phone · 2 colunas ≥600 · 3 colunas ≥900
type: display +10% em ≥600 (nunca reduzir corpo)
```
- **Nada de dimensões absolutas de tela** (`Dimensions.get` congelado em módulo é bug): sempre `useWindowDimensions` + tokens, para rotação e Split View do iPad.
- Arte full-bleed (cenas, mapa) preenche a largura real; painéis de texto respeitam `maxContentWidth` — é isso que faz iPad parecer desenhado, não esticado.
- Safe areas via `react-native-safe-area-context` em TODA tela (tab bar, headers, modais, toolbar do colorir).
- **Escala de fonte do sistema:** corpo respeita até 1.3 (acessibilidade); display/botões limitam com `maxFontSizeMultiplier 1.2`. Gate de QA: app inteiro navegável com fontScale 1.3 sem corte.
- Mapa em tablet: largura máxima do pergaminho 700dp centralizado com margens de papel texturizado (o mapa é retrato; esticar a arte é proibido).
- Modais: largura `min(560, 92%)`, sempre centralizados.

**Gate automático do A0:** script de smoke que renderiza os componentes-base em 360×800, 744×1133 (iPad mini) e 820×1180 com fontScale 1.0/1.3 e falha se houver overflow de texto.


---

## 3. VARREDURA — INVENTÁRIO TELA A TELA (53 prints auditados)

Formato: **Tela — problemas encontrados — destino no plano**. Itens marcados 🪦 pertencem a telas/elementos que o v3.1 já mata — não corrigir, substituir.

| Tela | Problemas encontrados nos prints | Destino |
|---|---|---|
| **Onboarding (4 telas)** | Botão amarelo com texto marrom (baixo contraste de ação); avatares em chips pequenos com rótulos "Menino/Menina" (deixar o rosto falar; rótulo de gênero desnecessário); estrelas de progresso minúsculas; muito vazio sem encanto no meio da tela 1 | A14 — Beni corpo-inteiro acenando, avatares grandes em roda, progresso = estrelinhas que acendem, botão terra500 |
| **Home — topo** | Gradiente amarelo→azul frio no header (fora do mundo papel); avatar da criança e do Beni disputando os dois cantos; balão "Hoje temos um caminho…" flutuando sem dono | A14 — header papel com saudação display; UM Beni; balão ancorado nele |
| **Home — Missão de Hoje** | Chip "✨ MISSÃO DE HOJE" caps+emoji; arte da história presa num retângulo pequeno; chips Ouvir/Colorir/Estrelas com emoji; funciona bem como conceito | A14 — vira O herói da Home: arte sangrando na largura, título display sobre ela, um botão terra |
| **Home — Sua jornada** 🪦 parcial | Fileiras saturadas cada uma de uma cor (roxo Cultinho, navy Baú com emoji de maleta vermelha, roxo Criar com Beni, lavanda Cantinho) = "lista de widgets"; "VOCÊ CONQUISTOU" caps; Criar com Beni morre no v1 | A4/A5/A14 — todas as fileiras viram cartões-página (paper100, borda paper200, ícone ilustrado, texto tinta); Criar com Beni some (v3.1 §3) |
| **Mapa — regiões (4 prints)** | O ponto mais forte do app. Pins pequenos, com miniatura "enevoada"/esbranquiçada e cadeado-emoji cinza minúsculo; fita de região é um pill cinza translúcido; chip "Ver mapa" com emoji 🗺️ | A3.5 (junto do B5.4b) — pins 64px com anel gold500 + miniatura da capa em cor plena (bloqueada = sépia, não "fosca"), cadeado ilustrado pendurado no anel; fita de região = ribbon ilustrado; "Ver mapa" com ícone próprio |
| **Mapa — modal história (Criação/Noé/Davi)** | Bom esqueleto; X flutuante; chip "Plano Família" roxo; chip "Disponível" azul; capas em estilos artísticos diversos (Davi pictórico, Pesca estilo Pixar…) — **decisão D4: é identidade, não defeito**; o que padroniza é a moldura do modal, os chips e a tipografia | A14 — modal vira "carta do mapa" (moldura-padrão: papel, borda gold fina, cantos de fita); chips no sistema novo; a arte da capa permanece intocada |
| **Detalhe da história** | Chip "Grátis" verde-emoji; "LIÇÃO DO CORAÇÃO" caps sobre amarelo; caixa azul "Nesta aventura você vai…" (cor órfã); botão laranja-gradiente com emoji ▶️ azul dentro; lista "Cenas da aventura" = linhas de app bancário com cadeado-emoji | A14 — página dupla de livro: capa à esquerda sangrada, lição como citação com aspas douradas, UM botão terra "Começar a história", cenas = trilha de 10 estrelinhas (acesas/apagadas) |
| **Lista de cenas (10 linhas)** | Repetição "Complete a cena anterior" ×9; cadeados-emoji; zero arte | A14 — trilha de estrelas substitui a lista |
| **Tela de cena (leitura)** | Chip "Cena ilustrada" sobre a arte (Lei 6); balão do Beni azul-frio; player azul com barra fina; botão "Concluir cena" roxo-gradiente com estrela-emoji; card "Hora de colorir" com paleta-emoji e botão laranja pequeno; barra de progresso do topo VERDE | A14 — arte full-bleed com painel de leitura em papel translúcido; player integrado ao rodapé em tinta/papel; Concluir = terra500; Colorir = secundário fantasma com ícone pincel; progresso = trilho paper300 preenchendo gold300 |
| **Celebração de cena "Que lindo!"** | Modal branco com PNGs de estrela espalhados por cima (colagem); botão VERDE "Continuar" + botão lavanda "Colorir esta cena"; 🎉 emoji | A1 (versão leve de cena) — celebração inline curta: estrela voa da cena ao contador (Lottie), sem modal branco; se modal, é papel com confete dourado desenhado |
| **Conclusão de história (3 prints)** 🪦 | Header laranja com **emoji 🌍 gigante como herói**; "Suas estrelas" = fileira de 10 emoji ⭐; painel de 10 ações (já diagnosticado); "VOCÊ DESBLOQUEOU" caps roxo; Resumo da aventura com bolinhas verdes + emoji por cena (🌍✨☀️🌱⭐🐟🐦👨‍👩‍👧🌈🕊️); certificado como botão perdido | A1 — morre inteira; nasce o ritual (spec §4.1). O Resumo vira páginas do Livrinho usando **as miniaturas reais das cenas** (as artes já existem!) |
| **Modais de conquista ("Primeira cena", "Pequeno artista da fé")** | Emoji em círculo rosa/creme como troféu; botão AMARELO num, ROSA no outro (caos de primário); "Beni viu essa vitória! 🎉" em roxo | A14 — template único: medalha ilustrada com moldura gold, fundo papel, botão terra; microcopy mantido (é ótimo) |
| **Livrinho — capa/opções** | Header laranja-gradiente com 📖 emoji; seleção "Como você quer ver?" boa de conceito; botão coral com ▶️ emoji | A1 — Livrinho vira objeto: capa night800 com título star100 e moldura gold; abrir = page-turn |
| **Livrinho — loading** 🪦 | **Retângulo ROXO com emoji 📖 e glow + "Abrindo seu livrinho…"** — a pior tela do app hoje | A1 — Lottie do livrinho abrindo (Beni folheando), fundo papel. Exemplo canônico da Lei 9 |
| **Livrinho — leitor** | Fundo preto funciona (modo imersivo), player azul destoa; "Cena ilustrada" chip de novo | A1 — manter imersão mas em night800 com estrelas sutis; player em star100/tinta; chip morre |
| **Baú (tela)** 🪦 parcial | Ícone do Baú = **emoji de maleta de ferramentas vermelha** (não é um baú!); header rosa-lavanda; filtros pill azul; cartinhas de arte OK de conceito; badges de check verdes | A4 — Baú vira arca ilustrada (asset §6) que ABRE na entrada; cartinhas = polaroids/relíquias (spec v3.1 §5.7); filtros em chips papel; check = selo dourado |
| **Minhas Artes** | Botão Editar amarelo com lápis-emoji; **lixeira-emoji** como botão; **olho-emoji 👁️ sobreposto nas miniaturas** (estranho/assustador); "3 de 3" com barra verde | A7 — álbum: molduras de papel, ações com ícones próprios (lápis/lixeira ilustrados), lixeira exige confirmação do Beni; limite comunicado com carinho; olho morre |
| **Criar com Beni / toolbar (3 prints)** 🪦 | Confirmado o diagnóstico: 3 abas (Cores/Pincel/Ferramentas) = menu de 2 níveis; **Salvar verde com emoji de disquete 💾** (criança de 2020 nunca viu um disquete); borracha = esponja-emoji; Limpar tudo = vassoura-emoji com borda rosa; texto de instrução "Escolha a cor e o tamanho…" (Lei 10 violada) | A7 — toolbar única da spec v3.1 §5.3: lápis/borracha ilustrados em toggle, 3 bolinhas de tamanho, desfazer, salvar=coração/estrela "Guardar"; zero abas, zero instruções |
| **Ateliê do Beni** 🪦 | Header GRADIENTE ROXO-AZUL (quebra total do mundo); Mesa criativa em card cinza-lavanda; card laranja com BORDA AZUL; botões roxo/mostarda/verde | A5 — tela morre; Brincar nasce no padrão: header papel, 5 cartões-página com ilustrações grandes |
| **Estrelinhas / Álbum** | Card roxo-lavanda gigante no topo; "PRÓXIMA CONQUISTA" com alvo-emoji 🎯; conquistas bloqueadas = cinza sobre cinza (ilegível); desbloqueadas com bordas roxa/rosa; seções com emoji (📖🧩🌙) | A14 — vira "Álbum de figurinhas": conquistas = medalhas douradas em relevo (bloqueada = medalha em silhueta papel300, legível), progresso como constelação; caps morre |
| **Perfil / Meu Cantinho** | Header gradiente laranja; avatar "Cordeiro" bloqueado com cadeado-emoji; estrutura boa | A14 — header papel; cadeado ilustrado; avatares premium com moldura gold + selo "Plano Família" |
| **Gate parental** | Funcional e correto; roxo de fundo; visual de sistema | A14 (leve) — modal papel, número em display; NADA lúdico demais (é para adulto, e a Apple olha isso) |
| **Área dos Pais (3 prints)** | Central da família azul-bebê; Dica do Beni lavanda com avatar de borda VERDE + coração-emoji; tiles de stats lavanda com emoji ⭐▶️🎨; "PRÓXIMO PASSO RECOMENDADO" caps com borda roxa | B4/A14 — herda papel/tinta sóbrio; stats com ícones próprios; accordions mantidos; aqui entra o paywall premium (spec §4.6) |
| **Cultinho em Casa (2 prints)** | Números de passo em arco-íris (1 azul, 2 roxo, 3 amarelo, 4 laranja) sem lógica; citações com bordas azul/amarela/roxa; botão Concluir ROXO + Colorir outline laranja; conceito dos 4 passos já aprovado no v3.1 | A11 — os 4 cartões guiados nascem no padrão: números em gold sobre papel, citação com aspas douradas, botão terra |
| **Cantinho do Beni** | 🏡🕯️📖 emoji como ícones de seção; lavanda | A12 — ritual diário no padrão céu-noite leve ou papel, ícones próprios, versículo→cartinha do Baú |
| **Tour do Beni (todos)** | Cards do tour OK de estrutura; links "Voltar · Sem voz · Pular" pequenos (<44px) | A14 — links viram botões-texto 44px+; card em papel com borda gold fina |

**Achado transversal (resolvido pela decisão D4 — "Galeria Viva"):** as capas das 20 histórias usam estilos artísticos deliberadamente diferentes (Davi e Golias pictórico, Pesca Milagrosa estilo Pixar, Criação pintura digital luminosa…). O fundador confirmou isso como identidade: **cada história é uma obra num estilo próprio, como salas de um museu**. Consequência de design: a coerência do app passa a ser responsabilidade EXCLUSIVA do sistema que envolve as artes — moldura-padrão das capas (borda gold + cantos de fita), tipografia única sobre elas, chips padronizados, pins do mapa com o mesmo anel/tratamento sépia, e o mundo papel/tinta ao redor. Regra prática: **a arte muda de estilo; a moldura nunca muda.** É assim que multiestilo vira premium ("coleção") em vez de bagunça. Nenhuma recapa será feita.

---

## 4. SPECS DOS MOMENTOS-CHAVE (como cada bloco constrói no padrão)

### 4.1 Ritual de conclusão (bloco A1) — o piloto da linguagem
1. **Celebração** (auto, 2,5s): fundo paper50 → chuva de estrelas douradas (Lottie), Beni pose "celebrando" corpo-inteiro, display "Que aventura linda!", contador de estrelas preenchendo com som. Sem emoji-globo, sem header laranja.
2. **O Presente**: display serif "Sua aventura virou um presente", capa do Livrinho como objeto (night800, moldura gold, título star100, leve rotação 2°), botão terra "Abrir meu Livrinho", ghost ink400 "Deixar para depois", 3 dots de ritual em gold/paper300.
3. **Livrinho**: leitor imersivo night800 com estrelas a 3%; páginas = arte da cena + 1 linha de texto star100; vira-página 450ms com som de papel; **página final = Certificado**.
4. **Certificado**: pergaminho paper100 com borda ornamentada gold, nome da criança em displayXL, referência bíblica, selo de cera do Beni (asset), data. Botão secundário "Guardar uma foto" (futuro), primário "Continuar".
5. **Guardar no coração**: transição — a capa encolhe virando cartinha e voa até o ícone da arca (Lottie), Beni: "Guardei esse momento no seu Baú!".
6. **Tela final**: 3 cartões-página apenas (Quiz +1⭐ · Ver o mapa se colorir · Voltar ao início), cada um com ícone ilustrado.
Critério de aceite visual: nenhuma cor fora dos tokens; zero emoji; um herói por passo; validação em Android físico.

### 4.2 B5.4 + refino do mapa (blocos A2/A3 + A3.5)
A animação da cor subindo segue a spec técnica do v3.1 §5.2. Visual: a linha dourada usa gold500 com brilho gold300 no ponto de avanço; ao concluir, o pin da próxima história pulsa (scale 1→1.15→1, 2×) e ganha anel gold. Pins novos (A3.5): 64px, miniatura em cor plena, bloqueado = miniatura em sépia + cadeado ilustrado no anel; fita de região = ribbon com sombra única.

### 4.3 Brincar (blocos A5–A10)
Header papel com título display "Brincar". 5 cartões-página verticais com ilustração grande à esquerda (Beni pintando / arca de artes / letras / animais / peças), título 22, subtítulo ink600, contador de rodadas como **2 estrelinhas do dia** (acesas = disponíveis). ResponsibleUnlockCard: paper100, Beni pose "carinhoso", texto padrão do v3.1, botão terra "Chamar responsável". Jogos internos: fundos paper50, feedback de acerto = estrela gold acende + som; erro = balanço suave + Beni orienta (nunca vermelho, nunca X).

### 4.4 Quiz (bloco 4 da Fase 1 ganha o reskin junto)
Morre A/B/C e o verde/vermelho: opções viram cartões ilustrados grandes (imagem da cena quando aplicável); correta = moldura gold + estrela acende; incorreta = shake 180ms + Beni "Quase! Vamos lembrar juntos" em balão papel. Progresso = 4 estrelinhas no topo preenchendo.

### 4.5 Rituais céu-noite (A12 + Momento com Beni + Guardar no coração)
Fundo night800→night600 com estrelas sutis (asset), texto star100, versículo como joia central (display serif, aspas douradas), botão terra sobre painel papel translúcido. O roxo atual morre nessas telas. *(Condicionado a D2.)*

### 4.6 Paywall Plano Família (bloco B4) — a tela mais rica do app
Mosaico das 20 capas em grade levemente rotacionada ao fundo (sépia→cor num gradiente de "desbloqueio"), painel papel por cima: selo gold "Plano Família", os 5 benefícios com ícones próprios, card Anual com moldura gold + badge "Economize 33%" + "sai por R$ 9,99/mês", Mensal discreto abaixo, botão terra "Desbloquear a jornada completa", Restaurar compras em ink400. Tom: convite, nunca pressão (compliance v3.1 §5.5).

### 4.7 Estados com alma (transversal, nasce no A0 e se aplica em todo bloco)
Loading global = Beni caminhando com lanterna (Lottie, fundo papel) · Loading do colorir = Beni pintando · Vazio de galeria = Beni segurando moldura vazia "Sua primeira arte vai morar aqui" · Erro = Beni tropeçado "Ops! Beni tropeçou. Toque para voltar" (já previsto no B3/Error Boundary).

---

## 5. ICONOGRAFIA PRÓPRIA — mapa de substituição (asset do A0)

Set único desenhado no traço do mundo (linha tinta ink900 1,5–2px, preenchimentos papel/gold, cantos arredondados). **24 ícones do v1:**

| Emoji atual | Ícone novo |
|---|---|
| ⭐ (todas as ocorrências) | Estrela do app (5 pontas arredondadas, gold300 com brilho) |
| 📖 Livrinho | Livrinho com marcador dourado |
| 🧰 Baú (maleta vermelha!) | **Arca de madeira com ferragens douradas** (fechada/aberta) |
| 💛/💗 corações | Coração de tinta |
| 🎨 paleta / 🖌️ pincel | Paleta e pincel do Beni |
| ✏️ lápis / 🧽 borracha | Lápis e **borracha escolar** ilustrados |
| 🧹 limpar | Folha nova (não vassoura) |
| 💾 salvar | Coração+check "Guardar" |
| 🗑️ lixeira / 👁️ olho | Lixeira ilustrada · (olho morre sem substituto) |
| 🔒 cadeados | Cadeado dourado pendurado |
| 🏠 início / 🗺️ ver mapa | Casinha · Mapa enrolado |
| 🏅 conquistas | Medalha com fita |
| 🎯 próxima conquista | Bússola |
| 📜 versículo / 🙏 oração / 💡 ideia | Pomba · Mãos em oração · Velinha/estrela-guia |
| ▶️ player / 🔁 repetir / 🔊 som / 🎵 música | Set de player em tinta |
| 🌍 (herói da conclusão) | morre — substituído pela arte real da história |
| ✨ sparkles | Trio de estrelinhas ornamentais |
| 🧩 / 🔤 / 🐾 (jogos) | Peça de quebra-cabeça · Bloquinhos de letra · Patinha |

Produção: Midjourney (mesmo estilo clay/ilustrado) → vetorização/limpeza → export SVG+PNG @1/2/3x → `assets/icons/`. Tab bar mantém os 5 ícones atuais reformulados no set (casinha, livro, pincel/estrela de brincar, medalha, rostinho).

---

## 6. PIPELINE DE ASSETS (paralelo desde o A0 — não bloqueia código)

1. **Folha de poses do Beni (16):** acenando · celebrando (confete) · apontando · pensando · pintando · dormindo · abraçando livrinho · segurando lanterna · tropeçado (erro) · carinhoso (unlock card) · com lupa · orando · com fone (som) · caminhando · aplaudindo · segurando moldura vazia. Prompt-base Midjourney: *"cute 3D clay-style white lamb mascot 'Beni' wearing light blue scarf, [POSE], soft warm lighting, cream background, children's book character, consistent character design, front 3/4 view --style raw"* + refs das imagens atuais. Export PNG transparente 1024px.
2. **Ícone do app + splash:** rosto do Beni em close sobre pergaminho quente, moldura gold sutil; splash = mesmo mundo com estrelinhas; testar em grade de ícones real (print de home screen).
3. **Texturas:** paper_grain (tileável, 3–4%), starfield_night (para rituais), gold_foil (para selos).
4. **Lotties (5):** estrela-voando · confete-dourado · Beni-pintando (loading colorir) · arca-abrindo · livrinho-abrindo/page-turn. Ferramenta: After Effects→Bodymovin ou LottieFiles editor; peso alvo < 150KB cada.
5. **Selo de cera do Beni** (certificado) + **medalhas de conquista** (template com variações).
6. **Kit da Galeria Viva** (substitui a recapa — D4): moldura-padrão vetorial das capas (borda gold + cantos de fita, aplicada por componente, não na imagem), diretriz de miniatura dos pins (sépia bloqueado / cor plena disponível) e auditoria das 20 capas apenas quanto a ENQUADRAMENTO e legibilidade do título sobre a arte.

---

## 7. INTEGRAÇÃO COM O PLANO v3.1 — ORDEM DE EXECUÇÃO

**Bloco A0 — Fundação visual (NOVO, entra imediatamente após a Fase 1 de bugs, antes do A1):**
`tokens.js` completo (incluindo breakpoints/maxContentWidth da §2.4) · carregamento das fontes **Fraunces + Nunito** (D3 aprovada) via @expo-google-fonts · **fundação responsiva** (§2.4: useWindowDimensions, contêiner de conteúdo, safe areas) · componentes-base refatorados para tokens: BotaoPrimario/Secundario/Ghost, CartaoPagina, ChipOrnamentado, ModalPapel, cabeçalhos, tab bar reformada, trilho de progresso · primeiros 12 ícones do set · textura de papel nos fundos · Error/Loading/Empty padrão (com placeholders do Beni até os Lotties chegarem). *Critérios de aceite: uma tela-vitrine (Home topo ou Detalhe da história) renderizada 100% em tokens; gate de responsividade da §2.4 verde (3 larguras × 2 fontScales, zero corte); validada em Android físico E num viewport de tablet/iPad (simulador aceito no A0; físico obrigatório no B8); aprovação do fundador: "essa é a cara".*

**Daí em diante, cada bloco do v3.1 JÁ NASCE no padrão** (nenhuma trilha nova):
A1 ritual (§4.1, piloto completo da linguagem) → A2/A3 B5.4 + **A3.5 refino do mapa** (§4.2) → A4 Baú/arca → A5–A10 Brincar e jogos (§4.3) → A11/A12 rituais (§4.5) → A13 sons → B4 paywall (§4.6). O reskin do Quiz (§4.4) acopla ao bloco 4 da Fase 1 ou ao A1, o que vier depois do A0.

**Bloco A14 — Varredura final (NOVO, antes do B7/B8):** Home hero · tela de cena full-bleed · detalhe da história/trilha de estrelas · Estrelinhas-álbum · Perfil · Área dos Pais · onboarding · gate · tours · qualquer resíduo fora de token (rodar um grep de cores hardcoded como gate).

**Custo honesto:** A0 ≈ 1 semana · A3.5 + A14 ≈ 1,5–2 semanas somadas · o resto é absorvido pelos blocos já existentes (construir bonito custa quase o mesmo que construir feio quando os tokens existem). Assets correm em paralelo com você + Midjourney.

---

## 8. DECISÕES DO FUNDADOR — RESOLVIDAS EM 2026-07-02 (congeladas)

| # | Decisão | Resolução |
|---|---|---|
| D1 | Tese "O Livro Vivo" + 10 Leis | **Aprovada**, com condição registrada: a direção visual nunca altera a estrutura/fluxos/escopo do v3.1 e mantém o padrão premium sem perda de qualidade. Conflito estética↔estrutura → estrutura vence e sobe ao fundador. |
| D2 | Roxo | **Aposentado da UI.** Rituais (Momento com Beni, Guardar no coração, Cantinho) migram para céu-noite estrelado + dourado. |
| D3 | Tipografia | **Par A: Fraunces (display) + Nunito (texto)**, via @expo-google-fonts. |
| D4 | Estilo das capas | **Multiestilo é identidade oficial ("Galeria Viva").** Nenhuma recapa. Cada história mantém seu estilo artístico (Davi pictórico, Pesca estilo Pixar etc.); a coerência vem da moldura-padrão, tipografia, chips e pins — "a arte muda, a moldura nunca". |

## 9. CRITÉRIOS DE ACEITE VISUAIS (gate de todo bloco pós-A0)
Zero emoji na UI · zero caps espaçada · zero cor fora de tokens (grep automático) · um botão primário por tela, sempre terra500 · texto mínimo 13px · alvos ≥ 56px para criança · **nenhum texto ou botão cortado** (gate §2.4: 3 larguras × fontScale 1.0/1.3) · toda arte sem chip por cima · loading/vazio/erro com Beni · sombra única · validado em Android intermediário E iPhone **E viewport de tablet/iPad** · screenshot das 3 larguras anexado ao relatório do bloco.

---

## 10. RECURSOS, BIBLIOTECAS E AQUISIÇÕES (o que instalar/comprar — sinalizado ao fundador)

### 10.1 Bibliotecas (grátis — instalar no A0/A13; todas compatíveis com Expo SDK 54 / New Architecture)
| Pacote | Para quê | Bloco |
|---|---|---|
| `@expo-google-fonts/fraunces` + `@expo-google-fonts/nunito` + `expo-font` | Par tipográfico oficial (D3) | A0 |
| `lottie-react-native` (~7.3.x) | As 5 animações de alma (estrela, confete, Beni pintando, arca, livrinho) | A0/A1 |
| `expo-haptics` | Vibração sutil no squish do botão, estrela conquistada, encaixe do quebra-cabeça — com toggle na Área dos Pais junto de Sons | A0 (base) / A13 (toggle) |
| `react-native-safe-area-context` (já no projeto — auditar uso universal) | Safe areas em todas as telas/tablet | A0 |
| *(já previstos no v3.1)* `react-native-purchases`, `expo-updates`, `@sentry/react-native`, `expo-file-system` | Receita/OTA/crash/download | B1–B4 |
Regra: **nada além disto entra sem decisão** — cada lib nova é peso no bundle e risco de regressão.

### 10.2 Serviços e ferramentas (conta do fundador)
- **LottieFiles** (grátis p/ criar/otimizar .lottie; Pro opcional ~US$ 24/mês só se precisar do editor avançado — provavelmente não).
- **Vetorização dos ícones**: Recraft.ai ou vectorizer.ai (planos ~US$ 10–20/mês, 1 mês basta para os 24 ícones) — Midjourney gera, vetorizador limpa, export SVG/PNG.
- **Sons de UI infantis**: pacote pago único (~US$ 20–40) em Zapsplat/AudioJungle ("kids game UI sounds") ou curadoria CC0 no Freesound — 12 sons: toque, estrela, acerto, quase-lá, vira-página, arca abre, confete, encaixe, salvar, celebração, ducking-safe. Comprar 1 pacote coeso > garimpar 12 avulsos.
- **Trilha (P6)**: 3 loops instrumentais — banco royalty-free com licença de app (Artlist/Uppbeat ~US$ 10–20/mês por 1 mês, ou encomenda única ~R$ 300–600 com músico da comunidade). Licença precisa cobrir uso comercial em app.
- *(já no v3.1)* Apple Developer US$ 99/ano · Play Console US$ 25 · RevenueCat free tier · Sentry free tier.

### 10.3 Aparelhos (aquisição/empréstimo — bloqueia o B8, sinalizado desde já)
1. **Android intermediário físico** (Moto G / Galaxy A2x, usado ~R$ 600–900) — o aparelho-referência de TODO bloco visual.
2. **Android de entrada** (2–3 GB RAM, usado ~R$ 300–500).
3. **Tablet Android** (Galaxy Tab A9 ~R$ 800–1.000) — exigido pela P5.
4. **iPad** (emprestado ou usado; simulador vale para layout durante os blocos, físico obrigatório no B8) — exigido pela P5.
5. iPhone antigo suportado (o atual de testes já cobre parcialmente).

## 11. PADRÕES VALIDADOS POR BENCHMARK (o que os melhores apps infantis confirmam)
Pesquisa em Khan Academy Kids, Toca Boca, Duolingo ABC e guias de UX infantil confirma — e o nosso plano já cobre quase tudo:
1. **Alvos grandes e texto grande** (ícones 60–80px, texto legível ≥ ~24pt em contexto infantil) → nossas Leis 10 e §2.4. ✅
2. **Sessões curtas e recompensadas (3–5 min)** aumentam conclusão → valida quiz de 4, cenas curtas e 2 rodadas/dia. ✅
3. **Feedback multissensorial** (som + animação + haptic leve, com controle dos pais) → Lotties + expo-haptics + toggle. ✅ (haptics é a única adição, §10.1)
4. **Design não-destrutivo / sem medo de errar** (Toca Boca: sem punição, sem vermelho, reset sem drama) → nosso quiz sem X vermelho e "Limpar tudo" com confirmação do Beni. ✅
5. **Ícone-literal e navegação rasa** (a criança reconhece imagem antes de texto; zero menus profundos) → set de ícones ilustrados + Lei 10. ✅
6. **Offline funciona** → arquitetura local-first do v3.1. ✅
**Backlog pós-lançamento (NÃO entram no v1 — registrar e esquecer):** toggle "reduzir animações" na Área dos Pais (conforto sensorial); cenas com toque-anima (padrão Bible App for Kids); modo noturno de leitura. Qualquer um destes exige decisão nova do fundador.

---
*Fim. Alterações exigem autorização do fundador e atualização deste documento + DECISIONS.md.*
