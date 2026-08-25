# MUNDO DO BENI · ROADMAP MESTRE CANÔNICO DE CONCLUSÃO E LANÇAMENTO

**Versão 6.0 · 24 de agosto de 2026**

**Status: PRONTO PARA RATIFICAÇÃO DO FUNDADOR**

> Documento canônico de sequência. O DOCX de mesma versão é espelho humano. Depois da ratificação, a primeira execução é F6.0, migração documental no repositório.

---

> **NOTA DE INSTALAÇÃO CANÔNICA — F6.0 · 2026-08-24**
>
> Este arquivo é a instalação canônica da v6.0 no repositório, feita pelo bloco **F6.0 · Migração documental**.
> **Caminho canônico:** `docs/roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md` — **cópia única**, sem versão concorrente no repositório.
> **Origem:** arquivo entregue pelo fundador, `ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md`, SHA256 `c3135271161dc8f7dda0d5d97d59bcadc49cca7c4c2a0f860d75ec66cbc24769`.
> **Autoridade:** esta v6 governa **sequência, fases, escopo e portões**. As **decisões individuais** continuam governadas por [`docs/DECISIONS.md`](../DECISIONS.md) (**árbitro**). A governança operacional permanece em [`docs/PROJECT_SOURCE_OF_TRUTH.md`](../PROJECT_SOURCE_OF_TRUTH.md).
>
> **ERRATA EDITORIAL 01 — separação de F6.8 e F6.9.** No texto original da v6.0, a parte detalhada da Fase 6 reunia num único item `F6.8 Campanha física e lacre` os testes/gates, a geração dos builds e a campanha física com o lacre — enquanto o **§16 CAMINHO PRÁTICO** do mesmo documento já os separava em **F6.8 (gerar Android e iOS canônicos do mesmo HEAD)** e **F6.9 (executar validação física portrait e lacrar F6)**. A parte detalhada foi normalizada para a estrutura do §16.
> **Natureza:** correção **editorial** de consistência interna do próprio documento. **Não** é decisão nova do fundador, **não** altera conteúdo de produto, **não** altera portões e **não** altera a ordem causal — os mesmos itens permanecem, na mesma sequência, apenas realocados entre dois subblocos já previstos pelo §16. A **SAÍDA F6** permanece única e ao fim do bloco.


---


# MAPA RÁPIDO DO PROJETO

Esta página é o painel de orientação. Para saber onde o projeto está, consulte primeiro esta tabela. O estado operacional atual permanece na Fase 6.

| Fase | Título | Status |
| --- | --- | --- |
| F0 | Governança e fonte de verdade | FECHADA |
| F1 | Piloto do Colorir com o Beni | FECHADA |
| F2 | Loading, performance, packs e recovery | FECHADA |
| F2.5 | Integração do Colorir com o Beni | FECHADA |
| F3 | Reconciliação completa e matriz de pendências | INCORPORADA À V6 |
| F4 | Product Lock final | RECONCILIADO NA V6 |
| F5 | Infância, privacidade, teologia e medição | CONTRATO PERMANENTE |
| F6 | Convergência portrait V1, sistema visual, tablet e builds canônicos | EM EXECUÇÃO |
| F7 | Onboarding, Home e Área dos Responsáveis | PENDENTE |
| F8 | Vozes e matriz do Beni | PENDENTE |
| F8A | Orquestração sonora | PENDENTE |
| F9 | A Criação, Story Home V2, Página Viva e aprendizagem definitiva | PENDENTE |
| F10 | Meu Livro e Escuta Tranquila | PENDENTE |
| F11 | Conclusão, próxima ação, Estrelinhas e Mapa | PENDENTE |
| F12A | Núcleo infantil, Brincar e jogos | PENDENTE |
| F12B | Meu Momento, Cultinho, recuperação, presença e Igreja | PENDENTE |
| F13 | Noé e prova da fábrica reutilizável | PENDENTE |
| F14 | Beta ampliado e matriz física real | PENDENTE |
| F15 | Fábrica das outras dezoito histórias | PENDENTE |
| F16 | Congelamento de conteúdo, mídia, acessibilidade e licenças | PENDENTE |
| F17 | Packs premium e offline completo | PENDENTE |
| F18 | Monetização, entitlements e presente Davi e Golias | PENDENTE |
| F19 | Hardening, segurança e continuidade | PENDENTE |
| F20 | Engenharia de release, contas e lojas | PENDENTE |
| F21 | Beta do Release Candidate e Launch Readiness | PENDENTE |
| F22 | Lançamento progressivo e operação inicial | PENDENTE |

> **VOCÊ ESTÁ AQUI**
>
> F6. A prioridade imediata é consolidar a fonte de verdade v6 no repositório, fechar a fundação portrait do tablet, medir performance em binário próximo de produção e gerar Android e iOS canônicos a partir do mesmo HEAD.


## Trilhas paralelas que já começam na Fase 6

* Empresa, LTDA, CNPJ, acordo societário, conta empresarial e contabilidade.
* Marca, propriedade intelectual, cessões, contratos e licenças.
* Proteção infantil, privacidade, ECA Digital, Apple e Google.
* Segurança, 2FA, inventário de acessos, continuidade e recuperação.
* Revisão bíblica, pedagógica, infantil, visual e de áudio.


# 1. AUTORIDADE, PRECEDÊNCIA E PROTOCOLO ANTIBIFURCAÇÃO

Este documento é a consolidação canônica final da linha de lançamento. Ele incorpora as decisões vigentes dos documentos enviados, as decisões posteriores registradas no projeto, o delta responsivo de agosto e as decisões explícitas do fundador nesta conversa. O objetivo é eliminar a coexistência de roteiros concorrentes.


## 1.1 Regra de autoridade a partir da aprovação desta versão

1. O arquivo canônico de execução será ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md. O DOCX de mesma versão é o espelho humano e deve conter o mesmo contrato.
2. docs/DECISIONS.md continua sendo o árbitro de decisões individuais já registradas. Durante a migração para v6, qualquer decisão deste documento que represente uma nova ratificação do fundador deve ser registrada primeiro em docs/DECISIONS.md, com ID, data e indicação do item substituído.
3. Depois da migração, PROJECT_SOURCE_OF_TRUTH, DOCUMENTATION_INDEX e demais índices devem apontar para a v6. Documentos normativos antigos ficam com banner SUPERSEDED. Evidências históricas, relatórios de auditoria, vídeos, artefatos e laudos não são apagados nem reescritos.
4. Conflito futuro entre conversa e fonte canônica não muda o produto. Mudança só existe com ratificação explícita do fundador, atualização do DECISIONS.md, atualização deste roadmap e só então código.
5. Nova ideia vai para PARKING_LOT, salvo P0, P1, obrigação legal, obrigação de loja, segurança ou decisão explícita do fundador.

> **IMPORTANTE SOBRE EXCLUIR OS DOCUMENTOS ANTIGOS**
>
> É seguro apagar as cópias locais baixadas depois de salvar esta v6. Não apagar documentos históricos, decisões ou evidências dentro do repositório antes de o Claude executar a migração documental, porque eles preservam rastreabilidade e prova de decisões.


## 1.2 Primeiro bloco executável depois da aprovação desta v6


### F6.0 · Migração documental canônica, somente documentação

1. Ler o HEAD, branch e git status reais do repositório. O último HEAD auditado no material enviado é 002872a, mas ele não deve ser tratado como constante eterna.
2. Salvar a v6 em docs/roadmap ou caminho canônico equivalente.
3. Atualizar docs/DECISIONS.md com as decisões novas desta v6 e as marcações SUPERSEDED necessárias.
4. Atualizar PROJECT_SOURCE_OF_TRUTH e DOCUMENTATION_INDEX para apontar para a v6.
5. Marcar roadmaps, adendos e planos normativos anteriores como históricos. Não apagar evidências.
6. Gerar uma matriz curta de conflitos resolvidos, confirmando que cada conflito tem vencedor explícito.
7. Rodar smoke e expo-doctor somente para provar que o bloco documental não alterou o executável, quando aplicável.
8. Commit documental seletivo, sem push até autorização.


# 2. RECONCILIAÇÃO DEFINITIVA DAS DECISÕES CONFLITANTES

Os documentos enviados contêm decisões antigas que foram formalmente revertidas depois. Esta seção impede que uma IA volte a usar a versão errada.

| Tema | Versão antiga | Contrato vigente | Autoridade |
| --- | --- | --- | --- |
| Orientação | Tablet com portrait e landscape como objetivo do V1 | V1 é portrait first. Landscape completo é pós V1. Estruturas responsivas aprendidas permanecem. | V6-D02 |
| Brincar | Folha Livre, Soletrando, Adivinhar Animal, Quebra Cabeça ou listas antigas | Quatro jogos: Pares do Beni, Palavrinhas do Beni, Cadê a Ovelhinha?, Monte a Cena. Seção criativa: Criar Livre e Minhas Artes. | E1-BRINCAR-4JOGOS |
| Colorir narrativo no grátis | Sem salvar | Usuário com acesso legítimo à história salva a pintura do Colorir narrativo, independentemente do plano. | D-C60-PERSISTENCIA-TODOS-PLANOS |
| Criar Livre no grátis | Salvar arte no grátis ou limite 3 | Pode criar, mas salvar Criar Livre continua benefício do Plano Família. | E1-ARTES-SALVAR |
| Conclusão | Narrativa completa libera próxima história | Próxima história exige conclusão total. Narrativa completa sem total vira Quase lá e recebe próxima ação orientada. | D-CONCLUSAO-TOTAL-B |
| Colorir para conclusão total | Dez ou três páginas obrigatórias | Uma de três atividades concluída satisfaz o requisito de Colorir. Três de três representa coleção completa, não gate de progressão. | D-C60-INTEGRACAO-PRODUTO |
| Design | Sistema antigo com cores múltiplas, emojis e cards dashboard | O Livro Vivo prevalece, Fraunces + Nunito, papel, tinta, terracota, dourado, arte protagonista, zero emoji de sistema. | D-DESIGN-LIVRO-VIVO |
| Story Reader | Leitor atual tratado como definitivo | Substituir na F9 por Página Viva, experiência editorial de livro vivo adaptativo. | Delta v4.1 D9 |
| Página de conclusão | Painel com muitas informações e múltiplas ações | A página informacional pesada morre. Manter celebração emocional curta e uma próxima ação principal. | V6-D07 |
| Meu Momento | Tela curta, repetir passagem e ganhar estrela | Experiência de 3 a 5 minutos com aprendizado identificável. Oração e fé não geram estrelas. | V6-D09 |
| Cultinho | Card fraco, repetitivo e centrado em A Criação | Cada história terá pelo menos um Cultinho contextual. Haverá biblioteca temática curada. | V6-D10 |
| Presença | Streak punitiva | Jornada de Presença sem reset, perda ou prêmio por tempo de tela. | V6-D11 |
| Referral | Indique e ganhe feature dentro do app | Programa adulto Presenteie uma Família com Davi e Golias, sujeito a gate jurídico e de plataforma, com compartilhamento simples. | V6-D13 |
| Preços | R$ 14,90 e R$ 119,90 como congelados em documento antigo | Modelo mensal + anual permanece. Valores finais são decisão controlada da F18, não congelar número antigo silenciosamente. | E1-MONETIZACAO-V1 |


## 2.1 Decisões v6 que devem receber IDs no DECISIONS.md

| ID | Decisão | Contrato |
| --- | --- | --- |
| V6-D01 | Fonte canônica única | A v6 governa sequência e escopo; DECISIONS.md governa decisões individuais. |
| V6-D02 | Portrait V1 | Retrato é a orientação oficialmente suportada no primeiro lançamento. Landscape completo fica residualizado. |
| V6-D03 | Convergência Android/iOS | Todo build de evidência deve ter proveniência e Android/iOS precisam derivar da mesma baseline, salvo exceção documentada. |
| V6-D04 | O Livro Vivo | A direção visual aprovada é contrato transversal do V1 e não apenas referência estética. |
| V6-D05 | Story Home V2 | Entrada da história usa capa hero, título e referência, frase central, progresso resumido e uma CTA primária. |
| V6-D06 | Página Viva | O leitor de cenas atual será substituído por uma página editorial de livro vivo, com arte dominante e texto real legível. |
| V6-D07 | Conclusão sem painel | A tela informacional pesada é removida. Celebração curta e próxima ação única substituem o painel. |
| V6-D08 | Aprendizagem como núcleo | Toda história possui objetivo pedagógico, missão, descobertas, recuperação, aplicação e revisão. |
| V6-D09 | Meu Momento com Beni | Momento de 3 a 5 minutos, reverente, sem recompensa por oração, repetição de passagem ou demonstração de fé. |
| V6-D10 | Cultinho em Casa forte | Cada história do lançamento recebe pelo menos um Cultinho contextual e o sistema admite biblioteca temática. |
| V6-D11 | Jornada de Presença | Constância é mostrada sem streak punitiva, sem reset e sem recompensa por minutos. |
| V6-D12 | Prova de aprendizado para responsáveis | Área dos Responsáveis mostra resumo simples do que a criança aprendeu. |
| V6-D13 | Presente Davi e Golias | Compartilhamento fica na Área dos Responsáveis, nunca na superfície infantil, com gate jurídico e de plataforma na F18. |
| V6-D14 | CNPJ em paralelo | A constituição começa agora sem parar F6; CNPJ ativo vira gate antes de F14. |


# 3. CONTRATO CONGELADO DO PRODUTO V1


## 3.1 Posicionamento

> Mundo do Beni é uma jornada bíblica infantil em que a criança vive histórias, descobre verdades, brinca, cria, relembra o que aprendeu e leva pequenas experiências para a vida e para a família, acompanhada pelo Beni.

A expressão Duolingo bíblico pode continuar como comparação interna de ambição. Ela não é a identidade oficial do produto nem autorização para copiar streak, ranking, pressão, culpa ou gamificação de fé.


## 3.2 Público e autonomia

* Público principal de produto: crianças de 6 a 8 anos. Faixas adjacentes devem encontrar experiência segura e compreensível.
* A criança deve conseguir usar a jornada principal sozinha na maior parte do tempo.
* Momentos em família são convidados com linguagem acolhedora, nunca impostos como ordem.
* Beni é companheiro, conselheiro educacional e guia afetivo. Não é autoridade teológica autônoma e não pressiona comportamento espiritual.
* Responsáveis controlam compra, links externos, configurações sensíveis, dados, compartilhamento e suporte.


## 3.3 Catálogo e estrutura

* 20 histórias no lançamento.
* A Criação e Noé como histórias gratuitas locais, rápidas e offline.
* 18 histórias premium distribuídas por packs remotos, com manifesto, integridade, versionamento e cache.
* Cada história tem 10 cenas narrativas oficiais.
* Cada história tem 3 atividades Colorir com o Beni. Total do catálogo: 60 atividades, não 200 páginas de Colorir.
* Quiz oficial com 4 perguntas por história, salvo nova decisão explícita do fundador registrada antes da produção em massa.


## 3.4 Navegação principal

| Ordem | Aba | Função |
| --- | --- | --- |
| 1 | Início | Próxima ação, retorno e continuidade. |
| 2 | Aventuras | Mapa, regiões, estados e entrada nas histórias. |
| 3 | Brincar | Quatro jogos mais seção criativa. |
| 4 | Estrelinhas | Progresso e conquistas, sem virar moeda. |
| 5 | Perfil | Identidade local, preferências e acesso à Área dos Responsáveis. |

Ateliê não é nome público. Identificadores técnicos antigos só podem ser renomeados por bloco de migração próprio.


## 3.5 Brincar vigente

* Pares do Beni.
* Palavrinhas do Beni.
* Cadê a Ovelhinha?.
* Monte a Cena.
* Seção criativa: Criar Livre e Minhas Artes.
* GameShell compartilhado define entrada, saída, ajuda, progresso e conclusão. A área central de mecânica é específica de cada jogo.


## 3.6 Persistência criativa

* Colorir com o Beni é coleção vinculada à história. Se a história e a atividade são legitimamente acessíveis, a pintura pode ser salva em qualquer plano.
* Cada atividade mantém uma obra real visível, revisável e editável. Downgrade não destrói criações locais existentes.
* Criar Livre é autoria independente. A criança pode criar no Plano Grátis, porém salvar o Criar Livre continua benefício do Plano Família.
* Minhas Artes deve distinguir claramente obras autorais e obras do Colorir quando a arquitetura visual exigir, sem misturar semânticas.


## 3.7 Conclusão e progressão

A conclusão total da história é diferente de apenas terminar a narrativa. A próxima história só é desbloqueada quando o contrato total estiver satisfeito.

* Narrativa: 10 cenas principais concluídas.
* Quiz: respondido conforme contrato oficial.
* Colorir: pelo menos 1 das 3 atividades da história concluída.
* Passo reflexivo da história: concluído. A F9 deve reconciliar o legado ReflectionScreen, Guardar no coração e Meu Momento para existir um único requisito público, compreensível e rastreável, nunca três gates ocultos.
* Três de três atividades Colorir representam coleção completa, não requisito para liberar a próxima história.
* Narrativa concluída sem total gera estado Quase lá. O app mostra uma próxima ação recomendada, não um painel com dez pendências.

> **REGRA DE JORNADA**
>
> Nenhuma criança deve ficar presa por um requisito invisível. Todo gate necessário para avançar precisa estar representado com linguagem infantil, próximo passo único e estado persistente.


# 4. CÂNONE VISUAL DO V1, O LIVRO VIVO

O Livro Vivo é contrato aprovado, não backlog estético. O app deve parecer um livro de histórias mágico que a criança abre, e não um dashboard que contém histórias.


## 4.1 Dez leis invioláveis

1. Uma cor de ação. Botão primário usa terracota.
2. Dourado é material de recompensa, não cor de interface genérica.
3. Zero emoji de sistema como iconografia de UI. O app usa set ilustrado próprio.
4. Zero títulos em caixa alta espaçada como linguagem visual dominante.
5. Um herói por tela. A hierarquia sempre escolhe um protagonista.
6. A arte manda, a UI serve. Cena narrativa é protagonista, nunca thumbnail cercada de metadados.
7. Texto é tinta sobre papel. Evitar preto puro, cinza frio e branco clínico nas superfícies infantis.
8. Roxo chapado está aposentado da UI. Momentos espirituais usam céu noite, papel, tinta e dourado conforme o contexto.
9. Loading, vazio e erro têm alma. Beni comunica o estado com simplicidade, sem spinner genérico quando houver estado user facing.
10. Toque de criança: um toque, um resultado. Alvos principais têm no mínimo 56 por 56 dp e não exigem menus de dois níveis.


## 4.2 Tokens visuais aprovados

| Família | Contrato |
| --- | --- |
| Papel | paper50 #FDF8EE · paper100 #F8F0DC · paper200 #EFE3C8 · paper300 #E4D5B4 |
| Tinta | ink900 #3E2E1B · ink600 #7A6A50 · ink400 #A89573 |
| Ação | terra500 #C9502A · terra600 #A73F1F · terra100 #F7DED2 · onTerra #FFF6E8 |
| Recompensa | gold700 #8F6A1E · gold500 #C99A3B · gold300 #E8C05A · gold100 #F6E7C8 |
| Ritual | night800 #1C2B52 · night600 #2E4370 · star100 #F2DCA0 |
| Tipografia | Fraunces 600 para display, Nunito 400 e 700 para corpo e UI |

Regra de engenharia: não criar um segundo design system. A implementação consome tokens e componentes compartilhados já aprovados. Hex, sombra, raio e medida recorrente não devem proliferar por tela.


## 4.3 Galeria Viva

As capas das histórias podem manter estilos artísticos diferentes. Isso é identidade de coleção, não defeito. A coerência vem da moldura, tipografia, estados e mundo visual que circundam as artes. A arte muda; a moldura nunca muda.


## 4.4 Quatro famílias de superfície

| Família | Exemplos | Contrato |
| --- | --- | --- |
| Hub | Início, Brincar, Estrelinhas, Perfil | Navegação persistente, grids fluidos, uso intencional do espaço. |
| Editorial | Story Home, Área dos Responsáveis | Hero, hierarquia clara, coluna editorial e apoio somente quando houver espaço real. |
| Imersiva | Mapa, Página Viva, Colorir | Conteúdo protagonista, usa viewport real, não herda maxWidth estreito genérico. |
| Jogo | Pares, Palavrinhas, Ovelhinha, Monte a Cena | GameShell externo compartilhado; mecânica interna específica. |


## 4.5 Responsividade oficial

* COMPACTO abaixo de 600 dp.
* MÉDIO de 600 a 899 dp.
* EXPANDIDO a partir de 900 dp.
* Política depende da janela e da área útil real, nunca do nome do aparelho.
* availableWidth, availableHeight, safeInsets, sidebarWidth e contentViewport formam a geometria de consumo.
* Font scale precisa ser validado. Texto essencial e botão não podem usar reticências como solução de clipping.
* Landscape completo não é gate do V1. Entretanto, a arquitetura não pode depender de hardcodes frágeis que destruam o layout quando o sistema fornecer uma janela diferente.


# 5. EXPERIÊNCIA DE HISTÓRIA, STORY HOME V2 E PÁGINA VIVA

> **CORREÇÃO CENTRAL DESTA VERSÃO**
>
> Esta seção incorpora o contrato que faltava no roadmap v5. A mudança de layout das histórias e cenas não é genérica. Ela já havia sido aprovada e agora está explicitamente dentro da F9.


## 5.1 Story Home V2, a entrada da aventura

* A capa ou hero é o primeiro elemento visual e preserva o estado de acesso com tratamento discreto.
* Título e referência bíblica ficam próximos da arte.
* Lição do coração existe como frase central curta, com peso editorial, não como card concorrente.
* Nesta aventura sai da primeira camada. Se necessário, fica em Sobre esta aventura ou Ver meu caminho.
* Uma CTA primária somente: Começar, Continuar ou Revisitar, conforme estado.
* Progresso é resumido. A criança não vê uma lista bancária de dez cenas como primeira camada.
* Beni é contextual. Primeira visita, retomada e revisitação podem ter falas diferentes. Beni não precisa falar em toda abertura.
* A Story Home destaca parte atual e próxima recomendada. Ver todas as partes abre a visão completa.
* Na interface infantil, preferir Parte a Cena. Scene pode permanecer termo interno.


## 5.2 Página Viva, Story Reader V2

O leitor atual será substituído por uma experiência editorial de livro vivo. Em retrato, a criança deve sentir que está dentro de uma página, não em uma tela com imagem, chips e player colados ao redor.

* A ilustração é protagonista e usa a maior área útil coerente com a composição.
* O texto continua sendo componente real, acessível e selecionável pelo sistema, nunca gravado dentro do PNG.
* A leitura usa camada de contraste validada, como scrim, degradê suave ou painel de papel translúcido. A solução é escolhida pela legibilidade da arte real.
* Título da Parte e Beni podem aparecer de maneira editorial. Beni fala somente quando existe intenção contextual.
* Progresso é discreto, semelhante a marcador de página, trilha dourada ou indicação de Parte X de 10. Não rouba o herói.
* Player de narração integra o rodapé ou borda editorial da página. Não parece um componente azul de mídia desconectado do livro.
* Texto pode iniciar recolhido quando a narração estiver ativa, mas sempre precisa de acesso claro e acessível para leitura.
* A criança pode avançar com uma única ação clara. Nenhum duplo toque é necessário.
* Metadados editoriais são suportados por cena quando necessários: focalPoint, safeTextZone, preferredTextPlacement e cropPolicy.
* A experiência deve ser visualmente estável em telefone e tablet portrait. Em telas maiores, pode usar espaço de apoio sem transformar o V1 em livro aberto landscape.


### Aspecto de livro que precisa ser percebido pela criança

* Fundo e superfícies em família de papel, tinta e luz quente.
* Arte tratada como página ou ilustração de página, não como thumbnail.
* Tipografia Fraunces e Nunito criando leitura editorial infantil.
* Ornamentos discretos, marcadores e bordas com vocabulário de livro.
* Mudança de Parte percebida como continuidade de páginas. O efeito visual é suave e não vira espetáculo maior que a história.
* No Meu Livro, o page turn pode ser mais literal. No Story Reader, confiabilidade e legibilidade vencem uma animação complexa.


## 5.3 Scene Transition Engine

* Pré carregar imagem e conteúdo da próxima Parte antes da troca.
* Manter a Parte atual visível enquanto a próxima ainda não estiver pronta.
* Troca atômica ou crossfade curto. Reduce Motion usa troca direta.
* Bloquear reentrada e duplo toque durante a transição.
* Critério físico: zero frame branco ou vazio perceptível em gravação de alta taxa de quadros.
* Áudio nunca começa sobre arte vazia. Em falha de imagem, usar fallback e retry seguro antes da narração.


## 5.4 Story Reader e Meu Livro compartilham engine

F10 não cria um segundo leitor estrutural. Meu Livro e Escuta Tranquila reutilizam a engine da Página Viva e variam apenas conteúdo, modo, controles e composição parametrizada.


## 5.5 O que não fazer

* Não repintar o Story Reader atual como se ele fosse definitivo.
* Não manter chip Cena ilustrada sobre a arte.
* Não criar um player de cor órfã fora do sistema visual.
* Não fazer a criança rolar para encontrar o botão principal em uma cena padrão quando a geometria comportar a página completa.
* Não gravar texto narrativo dentro das imagens.
* Não criar um segundo reader para Meu Livro.


# 6. MOTOR DE APRENDIZAGEM E RETORNO


## 6.1 Caminho de aprendizagem por história

1. Missão da Aventura. Beni planta uma pergunta ou objetivo simples antes ou no início.
2. História. A criança acompanha as dez Partes com narração, imagem e leitura.
3. Momentos de Descoberta. Entre dois e quatro pontos leves que pedem atenção, percepção ou lembrança, sem quebrar a narrativa.
4. Reconto. A criança reorganiza, reconhece ou explica uma parte relevante com suporte visual.
5. Criação. Colorir ou outra expressão reforça a história sem virar prova.
6. Aplicação. Pequena conexão com a vida da criança, adequada à verdade central.
7. Reflexão. Um passo significativo, compreensível e sem gamificar fé.
8. Recuperação futura. A história retorna de forma breve depois, para fortalecer memória.


## 6.2 Objetivo pedagógico obrigatório

Nenhuma história entra na fábrica final sem declarar referência bíblica, verdade central, objetivo infantil, missão, descobertas, recuperação, aplicação e revisão bíblica, pedagógica e infantil.


## 6.3 Recuperação espaçada inicial

* Mesmo dia: conclusão e verdade principal.
* Aproximadamente 1 dia: pergunta curta de recuperação.
* Aproximadamente 3 dias: aplicação ou conexão.
* Aproximadamente 7 dias: reconto ou nova conexão.
* Os intervalos são hipótese piloto e podem ser calibrados no beta sem mudar a filosofia.
* Uma revisão recomendada por dia é suficiente no V1. Não criar fila opressiva de pendências.


## 6.4 JourneyOrchestrator

A Home deve responder O que eu faço agora?. O JourneyOrchestrator escolhe uma ação principal baseada em atividade iniciada, requisito de conclusão, revisão de memória, presente ou próxima história. A escolha explícita da criança continua prevalecendo sobre a recomendação.

* Prioridade alta: recuperação bloqueante real e atividade iniciada.
* Depois: requisito público necessário para concluir a aventura.
* Depois: revisão de memória.
* Depois: próxima história.
* Depois: exploração livre.
* Nunca empilhar conquista, tutorial, presente, paywall e revisão ao mesmo tempo.


## 6.5 Guarda teológica e ética

* Não dar pontos por orar.
* Não dar pontos por repetir versículo ou passagem.
* Não dar pontos por demonstrar fé.
* Não transformar oração em resposta correta.
* Não usar culpa religiosa para retenção.
* Não comparar espiritualidade entre crianças.
* Não inventar doutrina por necessidade de mecânica.
* Beni pode reconhecer atenção, persistência, cuidado, honestidade, curiosidade, compaixão, memória e criatividade.


# 7. MEU MOMENTO, CULTINHO, PRESENÇA E VALOR PARA A FAMÍLIA


## 7.1 Meu Momento com Beni

Meu Momento precisa deixar de ser uma tela que fala uma passagem, pede repetição, entrega estrela e volta à Home. O resultado da experiência precisa responder o que foi aprendido.

1. Acolhimento curto.
2. Lembrança ou contexto.
3. Passagem ou verdade central apresentada com reverência.
4. Explicação infantil simples.
5. Pergunta que convida a pensar.
6. Conexão com a vida.
7. Oração opcional, apresentada como convite.
8. Pequeno Passo opcional.
9. Encerramento: Hoje guardamos isto no coração, com resumo explícito do aprendizado.

Duração alvo: 3 a 5 minutos. Não há estrela espiritual. Se a superfície conceder alguma recompensa de sistema no futuro, ela só pode reconhecer conclusão de uma experiência de aprendizagem, nunca oração, fé ou repetição da Palavra.


## 7.2 Cultinho em Casa

Cultinho em Casa é requisito do lançamento somente se for realmente utilizável. A versão que menciona repetidamente A Criação e não oferece variedade é insuficiente.

* Cada uma das 20 histórias terá pelo menos um Cultinho contextual correspondente até o congelamento de F15.
* O Cultinho pode ser usado em família ou individualmente. A UI sugere a presença da família de maneira acolhedora, sem bloquear a criança.
* Duração alvo: 8 a 15 minutos.
* Estrutura: preparação opcional do responsável, passagem, verdade central, conversa, atividade, oração opcional, ritual de encerramento e sugestão leve para a semana.
* Além dos Cultinhos por história, o ContentRotationEngine pode oferecer biblioteca temática curada, por exemplo gratidão, coragem, perdão, amizade, obediência, cuidado, medo, confiança e generosidade.
* Toda abordagem temática precisa de passagem, contexto e revisão bíblica. Nada de gerar aconselhamento doutrinário automático sem conteúdo curado.


## 7.3 Jornada de Presença

* Mostrar dias, semanas ou calendário de experiências significativas.
* Um dia sem uso fica apenas vazio. Nada zera, quebra ou é perdido.
* Não usar ameaça de perder sequência.
* Não recompensar minutos de tela.
* Presença válida exige uma experiência significativa, como história, recuperação, Meu Momento, Cultinho, reconto ou atividade de aprendizagem definida.
* A criança pode sentir orgulho da constância, sem medo de ausência.


## 7.4 Área dos Responsáveis, prova de aprendizado

A Área dos Responsáveis deve mostrar de forma simples o valor que o aplicativo entregou, sem virar dashboard corporativo.

* O que a criança descobriu recentemente.
* Histórias ou verdades relembradas.
* Atividades e criações significativas.
* Presença em experiências de aprendizagem, não tempo de tela como objetivo.
* Sugestão de Cultinho ou conversa contextual.
* Controles parentais, privacidade, Plano Família, suporte e compartilhamento adulto.


# 8. CONCLUSÃO DE HISTÓRIA, RECOMPENSAS E PRÓXIMA AÇÃO


## 8.1 A página atual de conclusão é removida

A tela atual, que explode informações, estrelas, resumo, múltiplos cards e diversas ações, não pertence ao produto final. Ela atrapalha a sensação de término e interrompe a direção da criança.


## 8.2 Novo ritual

1. Celebração curta, aproximadamente 2 a 3 segundos. Beni celebra, estrela ou progresso reage, sem painel administrativo.
2. Verdade central ou aprendizado pode aparecer em uma frase curta, se não repetir conteúdo desnecessariamente.
3. Quando a história atingir conclusão total, o Livrinho e o Certificado podem entrar como memória emocional. Certificado funciona melhor como última página do Livro, não como botão perdido em uma dashboard.
4. Guardar no coração continua sendo transição de memória para o Baú quando fizer parte do contrato reflexivo.
5. Depois do ritual, o JourneyOrchestrator apresenta UMA ação principal. Quiz, Colorir, Meu Momento, mapa, próxima história ou retorno podem ser a ação dependendo do estado.
6. Ações secundárias permanecem acessíveis nas superfícies naturais, sem três ou dez CTAs de mesmo peso.


## 8.3 Estados de conclusão

| Estado | Significado | UI |
| --- | --- | --- |
| Em andamento | Aventura começou e ainda há requisito central pendente. | Continuar como CTA principal. |
| Narrativa completa | As dez Partes foram ouvidas/lidas, mas o total não fechou. | Quase lá, com próxima ação única. |
| Concluída total | Narrativa, quiz, Colorir mínimo e passo reflexivo concluídos. | Selo dourado, celebração e progressão liberada. |
| Coleção Colorir completa | Três de três atividades Colorir. | Conquista de coleção, não bloqueio da próxima história. |


## 8.4 Estrelinhas

* Estrelinhas são celebração e progresso, não dinheiro interno.
* Não gastar estrelinhas.
* Recompensas de jogos e histórias precisam de uma única fonte canônica de leitura para evitar saldo invisível ou duplicado.
* F11 deve reconciliar serviços legados de bonusStars com o contador visível ou remover o conceito invisível, sem perder progresso legítimo.
* Conquista e onboarding das Estrelinhas nunca ocupam a camada bloqueante ao mesmo tempo.


# 9. REGISTRO OFICIAL DE DEFEITOS, DÍVIDAS E GAPS

> **NOTA FACTUAL DE AUTORIDADE — inserida no bloco `F6.1` · 2026-08-24.**
>
> Esta tabela é a **visão executiva por fase**. O **ledger canônico único** de riscos do projeto
> continua sendo [`docs/fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md`](../fase3-reconciliacao/09_MATRIZ_DE_RISCOS_E_PENDENCIAS.md),
> adotado em **E018** e **não superado por esta `v6`** — o §17.1 desta versão não o lista entre os
> documentos rebaixados. **A baixa de qualquer item se registra no código `P-nnn`, nunca no código
> executivo desta tabela.**
>
> A correspondência linha a linha entre os 24 códigos abaixo e os códigos `P-nnn` está em
> [`docs/roadmap/V6_RISK_CROSSWALK_TO_E018.md`](V6_RISK_CROSSWALK_TO_E018.md). Sete códigos novos
> — `P-170` a `P-176` — foram acrescentados ao ledger, em acréscimo puro, para os fatos aprovados
> aqui que ainda não tinham código.
>
> **Esta nota é factual e não altera nenhuma decisão de produto:** nenhuma severidade, nenhum
> *owner*, nenhuma redação e nenhuma saída esperada da tabela abaixo foi modificada.

Todo item desta tabela possui owner. Fechar uma fase não apaga o item. Se o comportamento deixar de existir por redesign, a fase proprietária precisa registrar a prova de supersessão.

| Código | Severidade | Owner | Problema | Saída esperada |
| --- | --- | --- | --- | --- |
| F6-UX-01 | P1 | F6 | Tablet portrait colide/comprime com sidebar ou menu lateral. | contentViewport único e prova física portrait. |
| F6-PERF-01 | **P1 ATIVO (bloqueador) — causa PROVADA na fonte, correção mínima aplicada, aguardando remedição física** | F6 | **Condição disparada na F6.9.** A medição release like do SM-X510 (F6.6) deu global satisfatório, mas a perna telefone da F6.9 (SM-S928B, 360 dp, perfil `preview`) confirmou a lentidão percebida **com corroboração objetiva**: p90 de frame **200 ms**, 14,71% de frames janky, 57% com alta latência de entrada, **550 slow bitmap uploads** e RenderThread com **80,8%** de todo o CPU de thread do app (105 s em 304 s de foreground) contra 17 s da main e 8 s da thread JS. Dos 9 frames >700 ms, **5 são diretamente dominados pela fase SYNC/upload da RenderThread** (74-96% da duração: 765,9 / 896,2 / 779,9 / 585,5 / 575,6 ms) e os **outros 4 gastam 13-17% em SYNC**, sendo afetados sobretudo pelo enfileiramento atrás dos pesados; a main thread trabalhou 0,43-0,82 ms em todos — a causa próxima é o app, não o ambiente. Mecanismo na fonte: **237 assets com lado >= 1024 px** no APK e as 20 capas de história em 1456-1672 px de largura (107 MB de bitmap ARGB se decodificadas em tamanho nativo) exibidas como cards pequenos em tela de 1080 px, com **zero ocorrências de `resizeMethod`** no código. | **Localizado e corrigido na fonte** (ver bloco `F6-PERF-01 · LOCALIZAÇÃO CAUSAL`): a superfície é `AdventureMapScreen` → 20 `StoryMapMarker`, e o `resizeMethod` padrão `auto` **não** reamostra asset empacotado — as capas decodificavam em tamanho nativo (106,8 MB) para círculos de 44-77 dp. Correção mínima em um `<Image>`: `resizeMethod="resize"` + `resizeMultiplier={2}` → **7,5 MB**, com portão visual objetivo provando que a arte não degrada. **Falta o que não pode ser fabricado:** remedição física no mesmo perfil `preview` em aparelho compacto e o A/B ambiental de `F6-EVID-01`. A perna tablet da F6.10 (SM-X510, 823 dp, `MEDIUM`) rodou o APK canônico pós-fix e deu **`PASS` sem regressão e sem novo gargalo severo** — mas **não cura o sintoma compacto**, porque o tablet **já tinha `Davey! = 0` antes do fix**: nunca reproduziu o defeito e portanto não pode demonstrar a sua ausência. `COMPACT_POST_FIX_PHYSICAL = NOT_TESTED`. Enquanto o fundador não adjudicar a lacuna, o item **continua bloqueando a F6**. |
| F6-EVID-01 | P2 evidência | F6 | **Lacuna de evidência assumida.** O experimento A/B controlado no SM-S928B (economia de bateria ON/OFF x dexopt `verify`/`speed`, medindo `am start -W` e `dumpsys gfxinfo` sob estímulo fixo) **não foi executado**: o aparelho entrou em bloqueio de tela seguro e o acesso físico se encerrou. O peso relativo dos amplificadores ambientais (economia de bateria ativa em 100% da campanha; instalação sideload sem AOT, `[status=verify]`) **não está quantificado**. | Quando houver telefone Android disponível de novo, rodar o A/B antes de dar `F6-PERF-01` por resolvido, para não creditar à correção de assets um ganho que seja ambiental. |
| F6-BUILD-01 | P1 governança | F6 | iPhone instalado representa build antigo com conteúdo divergente. | Novo iOS e Android do mesmo HEAD e manifesto de proveniência. |
| F6-MAP-01 | P1 visual | F6 | Mapa mostra placeholders de inicial mesmo quando artwork existe. | Resolver source/fallback/cache e testar as 20 histórias. |
| F6-TYPE-01 | P1/P2 | F6 | Cabeçalhos e textos já apresentaram clipping com font scale. | Gate de tipografia e validação física. |
| F6-VIS-01 | P2 | F6 | Bordas cinzas/shadows inconsistentes em cards/conquistas. | Investigar componente compartilhado antes de correções locais. |
| F6-EVID-01 | GAP histórico | F6 | R1-PEND-5 raw.log não foi preservado e é irrecuperável. | Não fabricar. Registrar gap histórico. Não repetir landscape apenas para recriá-lo. |
| F7-ONB-01 | P1 | F7 | Tour/spotlights/anchors ficam desalinhados em dispositivos reais. | Destaque do componente real e anchors sem X/Y absoluto. |
| F7-BRI-01 | P2 | F7 | Brincar não é apresentado corretamente no onboarding. | Novo guia para Brincar, sem Ateliê legado. |
| F7-QA-01 | P2 | F7 | Repetição do onboarding exige reinstalação. | Reset protegido apenas para QA/pesquisa, ausente em produção. |
| F9-JRN-C60-01 | P1 | F9 | Colorir concluído pelo caminho narrativo pode não refletir estado visual imediatamente. | Reconciliar conclusão, persistência e retorno sem duplicação. |
| F9-READER-01 | P1 produto | F9 | Story Home/Reader atual ainda tem aparência de app/dashboard e não de livro. | Story Home V2 + Página Viva. |
| F9-PERF-SD-01 | P2 performance | F9 | Abertura da StoryDetail legada tem jank de montagem medido em release like no SM-X510: p90 121-150 ms, ~4 frames >120 ms e 9-11 slow bitmap uploads. Causa dominante é o custo de montagem da tela, não o bitmap. **Enquadramento retificado no bloco `F6-PERF-01`:** este residual é da **StoryDetail** e é **superfície diferente** do achado do mapa da F6.9 — nada de `F6-PERF-01` é transferido para cá. A reversão da F6.6 agora tem explicação técnica: com fonte 1456x816 numa caixa de 1080x608, o `inSampleSize` do Fresco cai em 2 (728x408 = **0,67x da caixa**), e daí o borrão. Nessa tela a capa aparece **perto do tamanho nativo**, então não há memória de bitmap a recuperar — o custo permanece atribuído à montagem. | A superfície nova (Story Home V2 + Página Viva) é medida contra essa baseline e não regride. Se a decodificação for reaberta, ela vem junto de política de variantes de asset no tamanho de exibição, com prova visual. |
| F11-STR-ONB-01 | P1 | F11 | Conquista e onboarding das Estrelinhas disputam overlay e podem travar. | Orquestrador determinístico, uma camada bloqueante por vez. |
| F11-CONC-01 | P1 UX | F11 | Conclusão atual sobrecarrega e perde próxima ação. | Remover painel e usar ritual + JourneyOrchestrator. |
| F12A-OV-01 | P1 | F12A | Cadê a Ovelhinha já apresentou inicialização dependente de mudança de estado/rotação. | Começar corretamente em portrait e concluir sem gatilho de rotação. |
| F12A-CL-01 | P1/P2 | F12A | Criar Livre precisa de saída clara e geometria estável, inclusive teclado. | Salvar/descartar/cancelar por plano e documento lógico consistente. |
| F12A-GAME-01 | P2 | F12A | Jogos possuem padrões diferentes de entrada, saída e conclusão. | GameShell compartilhado. |
| F12A-PERF-PARES-01 | P2 performance | F12A | **Hipótese não medida, registrada para não se perder.** `src/components/pares/ParesFlipCard.js` pinta as capas de `STORY_COVERS` (1456-1672 px de largura) dentro das cartas da grade de Pares do Beni com `<Image>` sem `resizeMethod` — **mesma família de risco** do `F6-PERF-01`. **Não** foi medida na campanha física da F6.9, **não** foi corrigida junto do pin do mapa (o escopo do patch exigia mecanismo provado por superfície) e **não** é `F6-PERF-01`: hipótese não medida não vira bloqueador por analogia. | Medir a montagem da grade em aparelho compacto antes de decidir. Se confirmado, aplicar a mesma política de decodificação no tamanho de exibição usada no pin, com portão visual próprio. |
| F12B-MOM-01 | P1 produto | F12B | Meu Momento atual não comunica aprendizado e gamifica demais o término. | Reescrever experiência e remover estrela espiritual. |
| F12B-CUL-01 | P1 produto | F12B | Cultinho atual é fraco, repetitivo e pouco variado. | Cultinho por história + biblioteca temática curada. |
| F16-CONT-01 | P1 release | F16 | Placeholder, mídia provisória ou conteúdo sem revisão pode sobreviver. | Congelamento integral e validação automática. |
| F17-PACK-01 | P1 release | F17 | Premium estático/linearts legados/packs podem aumentar binário ou quebrar update. | Auditar requires, manifests, integridade, atualização e rollback. |
| F18-PAY-01 | P0/P1 | F18 | Compra/restore/expiração ainda não são prova real de loja. | Sandbox real iOS/Android e entitlement único. |
| F19-SEC-01 | P0/P1 | F19 | Secrets, ferramentas internas ou dados infantis podem vazar no artefato. | Threat model, scan, inspeção do binário e fail closed. |
| F20-STORE-01 | P0/P1 | F20 | Contas, DUNS, identidade legal ou formulários podem divergir. | Ownership, empresa e store forms reconciliados. |


# 10. POLÍTICA DE BUILDS, TESTES E EVIDÊNCIA


## 10.1 Todo build físico precisa de proveniência

* Commit SHA exato e branch.
* git status e confirmação de árvore limpa ou diff autorizado.
* Versão, build number/versionCode, runtimeVersion e perfil.
* ID EAS ou identificador do artefato.
* Plataforma, aparelho, versão do sistema e data.
* Estado inicial de dados do teste.
* Roteiro executado e evidência visual/log correspondente.
* Resultado e fase proprietária de cada achado.


## 10.2 Quando gerar build

* Mudança de navegação percebida.
* Mudança visual, layout, safe area, tipografia ou animação.
* Áudio, ciclo de vida ou foco.
* Persistência, migração ou storage.
* Asset embarcado.
* Configuração nativa, dependência ou plugin.
* Compra, entitlement ou comunicação comercial.
* Qualquer comportamento que só pode ser provado em aparelho real.

Não gerar um build para cada commit pequeno. Agrupar mudanças coerentes, automatizar primeiro e gerar candidato físico depois do bloco verde.


## 10.3 Matriz física V1

* Android de entrada, meta de 2 a 3 GB de RAM quando o aparelho estiver disponível.
* Android intermediário.
* Samsung SM-X510 tablet portrait como referência atual de tablet.
* iPhone real com build canônico atualizado.
* iPhone compacto quando disponível.
* iPad é evidence gap aceito até que haja aparelho e contrato adaptativo. Não recebe PASS fictício.


## 10.4 Severidade

* P0 bloqueia lançamento e interrompe a fase quando transversal.
* P1 bloqueia a saída da fase proprietária e o lançamento enquanto aberto.
* P2 é avaliado por impacto em aprendizado, confiança, usabilidade e manutenção.
* P3 pode ser documentado para pós lançamento quando não comprometer contrato.


# 11. EMPRESA, CNPJ, TITULARIDADE E CRONOGRAMA JURÍDICO


## 11.1 Decisão de timing

> **CNPJ NÃO BLOQUEIA A FASE 6**
>
> O trabalho técnico continua. Porém, abrir a LTDA e iniciar o CNPJ agora evita chegar à monetização e às lojas com um lead time empresarial de semanas.

| Momento | Obrigação |
| --- | --- |
| AGORA, durante F6 | Escolher contador e advogado; definir LTDA; viabilidade; contrato social; CNPJ; acordo de sócios; inventário de ativos; pesquisa de marca. |
| Meta antes de F9 fechar | CNPJ preferencialmente ativo; cessões em elaboração; titularidade e estratégia de contas encaminhadas. |
| PORTÃO DURO antes de F14 | CNPJ ativo; estrutura societária formalizada; responsável legal definido; titularidade essencial e documentos de piloto sob a entidade. |
| PORTÃO DURO antes de F18 | Conta bancária empresarial, contabilidade, contratos, dados fiscais e estrutura para monetização. |
| PORTÃO DURO antes de F20 | DUNS quando exigido, contas de organização, e mail corporativo, site funcional, seller/developer correto, documentos e IP coerentes com quem publica. |


## 11.2 Titularidade e contratos

* Acordo de sócios e poderes de decisão.
* Cessão ou licença adequada do código, Beni, histórias, artes, áudios, domínio e demais ativos.
* Contratos de prestadores com direitos de uso comercial e arquivos fonte quando aplicável.
* Licenças de fontes, músicas, efeitos, imagens e ferramentas documentáveis.
* Domínio, repositórios, lojas e serviços críticos sob controle institucional compatível.


## 11.3 Marca e identidade técnica

Produto e universo usados neste roadmap: Mundo do Beni. Identificadores técnicos históricos podem continuar até um bloco formal de migração. Não renomear bundle identifier, package, slug, scheme, conta de loja ou domínio silenciosamente.


# 12. ROADMAP OFICIAL POR FASE

F0 a F5 são história e contratos permanentes. A execução retomável começa em F6. Cada fase abaixo possui objetivo, escopo, ordem, saída e proibições.


## F0. Governança e fonte de verdade

Estado: FECHADA, disciplina permanente.

Preservar um árbitro, decisões versionadas, um bloco por vez, commits seletivos, validação humana e classificação de defeitos por owner.


## F1. Piloto do Colorir com o Beni

Estado: FECHADA.

Preservar o piloto aprovado, três atividades de A Criação, persistência e decisões visuais já integradas.


## F2. Loading, performance, packs e recovery

Estado: FECHADA COMO FUNDAÇÃO.

Preservar ready gate, integridade, recovery determinístico e contratos de pack. Riscos residuais seguem para F16, F17 e F19.


## F2.5. Integração do Colorir com o Beni

Estado: FECHADA.

Preservar a política vigente de persistência do Colorir narrativo para todo usuário com acesso legítimo. Criar Livre continua com salvamento Família.


## F3. Reconciliação completa

Estado: INCORPORADA À V6.

A v6 assume a matriz consolidada e resolve a bifurcação documental. F6.0 formaliza isso no repo.


## F4. Product Lock final

Estado: RECONCILIADO NA V6.

O Product Lock desta v6 substitui a leitura fragmentada anterior. Nenhuma nova feature entra sem substituir outra ou decisão explícita.


## F5. Infância, privacidade, teologia e medição

Estado: CONTRATO PERMANENTE.

Mapa de dados, minimização, parental gate, compartilhamento adulto, revisão teológica, comunicação infantil e instrumentação compatível continuam ativos em todas as fases.


## F6. Convergência portrait V1, sistema visual, tablet e builds canônicos

Estado: EM EXECUÇÃO.

Objetivo: fechar a fundação visual e responsiva do V1 em retrato, garantir que o tablet respeite a área realmente utilizável, provar performance em binário próximo de produção e eliminar divergência entre artefatos Android e iOS.


### F6.0 Governança v6

* Executar a migração documental canônica descrita na Seção 1.
* Preservar auditorias antigas como evidência, não como roadmap concorrente.


### F6.1 Baseline e builds

* Congelar branch, HEAD, árvore, versão e inventário de assets.
* Auditar o build antigo do iPhone e removê-lo da condição de evidência atual.
* Criar Build Manifest canônico.
* Adicionar Build Info protegido para QA/adulto se necessário, sem expor ferramenta interna à criança em produção.


### F6.2 Geometria de shell e tablet

* Uma fonte compartilhada de availableWidth, availableHeight, safeInsets, sidebarWidth e contentViewport.
* Corrigir colisão do conteúdo com a sidebar em portrait.
* Usar os arquétipos Hub, Editorial, Imersiva e Jogo já implementados; não criar outro sistema paralelo.
* Não programar por SM-X510. O tablet é amostra de faixa, não condição de código.


### F6.3 Livro Vivo como fundação visual

* Garantir tokens, tipografia, botões, estados e iconografia-base que F7 e F9 consumirão.
* Não redesenhar antecipadamente Story Home e Reader. F6 instala a fundação; F9 executa o redesign final.
* Nenhuma tela nova depois desta fundação nasce no visual antigo.


### F6.4 Integridade visual

* Safe areas e cabeçalhos.
* Font scale e textos essenciais.
* Placeholders do mapa quando a arte real existe.
* Fallbacks, skeletons e estados vazios.
* Bordas cinzas e sombras apenas se causa compartilhada for provada.


### F6.5 Canvas e geometria criativa

* Auditar Criar Livre e Colorir em portrait para garantir documento lógico estável entre larguras suportadas.
* Não reconstruir canvas por causa de landscape. Corrigir apenas o que afeta portrait, persistência ou consistência entre aparelhos.


### F6.6 Performance

* Medir abertura até Home utilizável, tabs, mapa, história, Colorir, Criar Livre, scroll, jogos, memória, JS thread e UI thread.
* Medir em preview/release like, não usar sensação do Development Build como única prova.
* Otimizar apenas causas comprovadas. Se a lentidão continuar perceptível em binário próximo de produção, ela bloqueia F6.

> **VEREDITO F6.6 — `PASS_WITH_KNOWN_RESIDUAL`.** Medição release like no SM-X510 (perfil `preview`, sem Metro) deu performance global satisfatória: boot, navegação, Colorir e mapa passam. Restou **um** residual, `LEGACY_STORYDETAIL_MOUNT_JANK`, com baseline **p90 121-150 ms, ~4 frames >120 ms, 9-11 slow bitmap uploads** na abertura de A Criação. A correção simples foi executada, medida e **rejeitada** (não reduziu o p90 materialmente, manteve os frames >120 ms e degradou visivelmente a arte da capa); foi revertida, e a árvore não carrega código dessa tentativa. A causa remanescente exige mudança maior na montagem da tela ou política de variantes de asset, e **não** é executada na F6.6 porque a superfície será reconstruída na F9. Owner do residual: **F9**, item `F9-PERF-SD-01` da tabela de riscos; a nova superfície precisa ser medida contra essa baseline e não regredir. O mapa em repouso a 63 fps **não** é blocker: fica como observação de eficiência futura.


### F6.7 Orientação portrait

* Contrato do V1 é portrait first.
* Validar Android 16 target API 36 em tela grande com a estratégia nativa escolhida, sem reduzir targetSdk.
* Tratar compatibilidade futura com API 37 como dívida explícita. O layout não deve quebrar catastroficamente se o sistema expuser janela diferente.
* iPhone em portrait é superfície obrigatória. iPad adaptativo e Split View não recebem PASS no V1 sem prova.

> **VEREDITO F6.7 — `PASS` (config); prova binária iOS pendente de F6.8.** Contrato V1 fechado como **portrait-first, não portrait-only**. **Android:** PASS — o telefone (`sw < 600dp`) é travado em retrato pela MainActivity e a tela grande (`sw >= 600dp`) fica `UNSPECIFIED`, com `targetSdk 36` intacto; a campanha de sobrevivência em landscape no SM-X510 deu Início, Aventuras, Brincar, Estrelinhas e Perfil **SAFE** e Colorir **DEGRADED** (utilizável: pinta, desfaz e conclui; a barra flutuante morde a faixa inferior da arte), sem crash, sem perda de estado e sem remontagem na ida e volta portrait→landscape→portrait. **iOS:** PASS de configuração — decisão do Portão Humano (OPÇÃO B): iPhone segue retrato por `expo.orientation`, o iPad declara as **quatro** orientações em `UISupportedInterfaceOrientations~ipad` e **mantém multitarefa** (`UIRequiresFullScreen` permanece `false`); nada de `lockAsync`, hack de orientação ou workaround por aparelho. O contrato é declarativo e está lacrado pelo portão `G-ORI-1` do smoke. **Landscape completo não é redesenhado na Fase 6** — é trabalho pós-V1. A prova em **binário iOS** do mesmo HEAD é de **F6.8**.


### F6.8 Builds canônicos

> *Normalizado pela ERRATA EDITORIAL 01 (ver cabeçalho), conforme o §16 CAMINHO PRÁTICO item 9.*

1. Focused tests, mutantes aplicáveis, smoke e doctor.
2. Gerar Android e iOS do mesmo HEAD.

> **VEREDITO F6.8 — `PASS`.** Os dois builds canonicos foram gerados do **mesmo** `SOURCE_HEAD` `2dcf717` (branch `feat/fase6-shell-splash`, arvore limpa em `git status --porcelain`), no perfil canonico de evidencia fisica `preview` (distribuicao interna), depois dos portoes pre-build verdes: harness de orientacao 18/18 com 8/8 mutantes mortos, portao `G-ORI-1` verde, `verify:runtime` verde com smoke **4984/4984** e `expo-doctor` **18/18**. **Proveniencia Android:** EAS `75e33bbc-14f4-4ce1-828e-5221745e74b7`, `FINISHED` em 2026-08-25T12:43:11Z, versao `1.0.0`, `versionCode 1`, SDK 54.0.0, fingerprint `5b66cacb7ca103878fb3243f450663909c84eef0`, artefato APK `https://expo.dev/artifacts/eas/HsxvRRzjp4ftQAbJ-s63hvnPSN450I3bnPGeA9lsgOY.apk`. **Proveniencia iOS:** EAS `04351ddc-fdc2-485c-a578-816212ff79c1`, `FINISHED` em 2026-08-25T12:25:42Z, versao `1.0.0`, `buildNumber 1`, SDK 54.0.0, fingerprint `f5f7a6f3b572ddc748bd1156bdada9cfd47bf287`, artefato IPA `https://expo.dev/artifacts/eas/YXQ8wooiT2BZ9s8CfTeBMIYv0g94deH0KF4v9TDBPzs.ipa`. O campo `runtimeVersion` **nao existe** neste projeto (sem `expo-updates`) e por isso e registrado como **ausente**, nao inferido; os fingerprints diferem entre as plataformas porque sao, por definicao, por plataforma. **Convergencia provada:** `ANDROID_SOURCE_HEAD == IOS_SOURCE_HEAD == 2dcf717`, e os dois sao a geracao nova — os builds imediatamente anteriores estao em `9b35cf8` (Android) e `aeda9c2` (iOS) —, nao historico recuperado do EAS. **Nenhum artefato foi instalado:** a campanha fisica pertence a F6.9. `BUILD_SOURCE_HEAD = 2dcf717`.


### F6.9 Campanha física e lacre

> *Normalizado pela ERRATA EDITORIAL 01 (ver cabeçalho), conforme o §16 CAMINHO PRÁTICO item 10.*

1. Validar tablet Android portrait, telefone Android disponível e iPhone.
2. Registrar gaps de aparelho.
3. Lacrar bugs residuais com owner.

> **F6.9 · PERNA TABLET — `PASS` (campanha parcial; telefone Android e iPhone pendentes).** Binário canônico da F6.8 instalado por **upgrade controlado** (`adb install -r`, com preservação de dados) no Samsung SM-X510 `RX2XC003LTJ` (Android 16, API 36, 1440x2304, 280 dpi, 822 dp em retrato, font scale **1.15**), sem uninstall, sem clear, sem storage reset e sem onboarding reset: `firstInstallTime` permaneceu `2026-08-10 12:03:42` e o `lastUpdateTime` passou a `2026-08-25 11:48:04`. **Cadeia de proveniência provada byte a byte:** EAS `75e33bbc-14f4-4ce1-828e-5221745e74b7` → artefato `HsxvRRzjp4ftQAbJ-s63hvnPSN450I3bnPGeA9lsgOY.apk` → `SHA256 25e06a91c437125c142844f8c020450bc8b0fd8408cc646f99925963ad7bed9c` → o `base.apk` puxado do aparelho **depois** da instalação tem o mesmo SHA256 → `com.valentedev.pequenostracosdefe` 1.0.0 / `versionCode 1` → `BUILD_SOURCE_HEAD 2dcf717`. **Atestação humana (sem vídeo externo):** o fundador executou o roteiro completo, em retrato, sem Metro e sem Dev Client, cobrindo cold start, Home, sidebar e viewport, Aventuras e mapa, história real, superfície narrativa, Colorir com o Beni, Criar livre, navegação entre superfícies e volta ao início; resultado **PASS**, sem crash, sem tela branca persistente, sem colisão visível, com progresso preservado. **Não existe arquivo de vídeo desta campanha:** a evidência humana é a atestação direta do fundador após a execução, por decisão dele, e essa ausência **não** é convertida em PASS de vídeo nem em evidência inexistente. **Evidência técnica independente:** logcat capturado com watchdog de 2026-08-25T14:51:49Z a 2026-08-25T15:02:29Z (44.588 linhas, `SHA256 c6df3c7704dcd5682f808d534541059ef33cea49f21e54516439b78e859daa94`), sem `FATAL`, sem `ANR in`, sem tombstone e sem `Force finishing`; a única linha com `AndroidRuntimeException` é do `system_server` em nível `I`, no pré-lançamento especulativo da Samsung (`doActiveLaunch`) contra pacote em estado `stopped`, e o lançamento real foi bem-sucedido 100 ms depois. O processo do app foi **um só** (`pid 24929`) do início ao fim, prova de que não houve crash nem remontagem, e **nenhum relayout em landscape** ocorreu na campanha. `Displayed` em **+295 ms** no cold start do fundador. Rotação automática do aparelho restaurada ao estado original. **Delta de runtime Android entre o binário anterior (`9b35cf8`) e o canônico é zero** — o diff é `app.json` (só chaves iOS), `scripts/smoke.js` (fora do bundle) e este roteiro —, o que autoriza a campanha mínima suficiente em vez de reauditoria ampla.

> **F6.9 · PERNA TELEFONE ANDROID — funcional `PASS`; performance `BLOQUEADOR ATIVO` (`F6-PERF-01`).** Binário canônico da F6.8 instalado **limpo** (pacote ausente antes) no Samsung **SM-S928B** `RQCY706J3VR` (Galaxy S24 Ultra, Android 15, API 35, build `AP3A.240905.015.A2.S928BXXS4BYG3`, arm64-v8a; painel físico 1440x3120 @450 dpi com override do fundador para **1080x2340 @480 dpi**; `sw360dp-w360dp-h780dp` → **360 dp = banda COMPACT**; font scale **1.0**). **Proveniência provada:** EAS `75e33bbc-14f4-4ce1-828e-5221745e74b7` → `SHA256 25e06a91c437125c142844f8c020450bc8b0fd8408cc646f99925963ad7bed9c`; o `sha256sum` do `base.apk` calculado **no próprio aparelho** depois da instalação bate byte a byte; assinatura `3351bd8d` (mesmo certificado do tablet); `firstInstallTime` = `lastUpdateTime` = `2026-08-25 12:27:11`; `BUILD_SOURCE_HEAD 2dcf717`.
>
> **Atestação humana (`HUMAN_ATTESTATION`): `PASS` funcional + `grande lentidão` percebida.** `VIDEO_EVIDENCE = AUSENTE` — não existe arquivo de vídeo desta campanha, e essa ausência **não** é convertida em PASS de vídeo nem em evidência inexistente.
>
> **Veredito funcional — `PASS`, adjudicado separadamente da performance.** Logcat da campanha preservado e congelado (`f69_phone_CAMPAIGN.log`, 87.833 linhas, 12.227.718 bytes, `SHA256 4eb980c3f9deedd2efa85caabc94d2c35db324bade514775f55dbcf1279e4898`, de `12:27:43.794` a `12:42:26.805` local): **zero** `FATAL EXCEPTION`, **zero** `ANR in`, **zero** tombstone, **zero** `Force finishing`, **zero** timeout de input dispatch e **zero** erro `ReactNativeJS` do nosso processo. As linhas de `AndroidRuntimeException` e `NATIVE_CRASH` presentes no log pertencem a **terceiros** — em especial `com.shopee.br` (PID 14617), que é ele próprio um app React Native — e ao pré-lançamento especulativo da Samsung (`doActiveLaunch`, nível `I`). O app rodou em **um único PID (17085)** do início ao fim, sem morte, kill ou remontagem. `Displayed .../.MainActivity` em **+221 ms**. `PORTRAIT_CONTRACT`: nenhum relayout em landscape. `COMPACT_LAYOUT`: 360 dp confirmado em `am get-config`, com tab bar inferior conforme o contrato de banda.
>
> **Investigação de performance — a queixa humana se confirma objetivamente.** `gfxinfo` da sessão (4835 frames): **14,71% janky**, p50 **7 ms**, **p90 200 ms**, p95 250 ms, p99 450 ms, 540 missed vsync, **2772 frames (57%) com alta latência de entrada**, 347 slow UI thread, **550 slow bitmap uploads**, 604 slow issue draw commands. Percentis de **GPU** em 2/5/15/16 ms — **a GPU não é o gargalo**. Por thread: **RenderThread 19,2% / 105 s**, main 3,2% / 17 s, `mqt_v_js` 1,5% / 8 s — a RenderThread respondeu por **80,8%** do CPU de thread do app e ficou ocupada de forma sustentada por **34,5% de um core** ao longo dos 304 s de foreground. **A thread JS não é o gargalo.** **GC descartado** (2 coletas, maior pausa 463 µs). **Térmico descartado** (`Thermal Status: 0`, AP 50,7 °C).
>
> **Causa próxima localizada dentro do nosso app.** Os 9 frames >700 ms (712-1111 ms) concentram-se entre `12:33:08.315` e `12:33:35.504`; decompondo os campos do `HWUI FrameInfo` de **todos** os nove (releitura direta do log bruto, ver `ANDROID_PHONE_RAW_LOG_PRESERVATION`), **cinco deles são diretamente dominados pela fase SYNC** (`SyncStart` → `IssueDrawCommandsStart`), com **74-96% da duração** ali: 765,9 / 896,2 / 779,9 / 585,5 / 575,6 ms. Os **outros quatro gastam apenas 13-17%** em SYNC — o tempo deles é **espera na fila**, atrás dos frames pesados (`IntendedVsync` → `Vsync`). **Retificação:** a redação anterior generalizava para os nove o que fora medido em três, dizendo que a duração inteira estava em SYNC; o correto é **5/9 diretamente dominados por SYNC e 4/9 afetados por enfileiramento**. A fase SYNC é exatamente onde ocorre o upload de bitmap para a GPU, e a **main thread trabalhou 0,43-0,82 ms** em todos eles — o diagnóstico causal **não muda**: o upload de bitmap causa cinco frames diretamente e os outros quatro por backlog. O gatilho está no log: o toque de `12:33:03.176` monta de uma vez **31 componentes `<Image>` do React Native** (contagem exata das linhas `unknown:WrappingUtils … ReactImageDownloadListener$EmptyDrawable`, estável de `12:33:05` até o toque seguinte; a redação anterior dizia ~40 e era overcount) dentro de um `ScrollView` **não virtualizado** (`D ScrollView: initGoToTop` em `12:33:03.386`). A distribuição é a assinatura do defeito: **9** imagens em `12:33:03.3`, **20 num único décimo de segundo** em `12:33:03.8` — as vinte capas dos pins, juntas, depois dos 400 ms de atraso do overlay —, mais 1 em `12:33:04.3` e 1 em `12:33:04.8`. A `libnative-imagetranscoder.so` do Fresco é carregada sob demanda em `12:33:03.416`, no meio da montagem; o toque seguinte do fundador só vem em `12:33:20.407` — **~17 s de espera** —, e o boost de toque expirou no meio do trabalho (`reason=boost timeout`, 3,4 s após o tap). **Mecanismo confirmado na fonte:** o APK carrega **237 imagens com lado >= 1024 px** (`res/` = 146,8 MB dos 265 MB) e as 20 capas de `src/assets/storyCovers.js` medem **1456-1672 px de largura** — **107 MB de bitmap ARGB** se decodificadas em tamanho nativo — para serem exibidas como cards pequenos numa tela de 1080 px; a prop `resizeMethod`, única do RN Android que reduz custo de decode/upload, tem **zero ocorrências** no código (as 66 de `resizeMode` são layout, não decode). O pico de RSS do processo foi **847 MB** (`VmHWM`) num aparelho com **196 MB livres**.
>
> **Hipótese ambiental testada e rebaixada a amplificador.** A economia de bateria estava **ativa em 100% da campanha** (a 85% de carga, por preferência do fundador), com 37/37 votos `PRIORITY_LOW_POWER_MODE_RENDER_RATE` limitando a taxa de render e 29 expirações de boost de toque — isso explica a **latência sustentada ao clique**, mas não frames de 900 ms. A instalação sideload está **sem AOT** (`[status=verify] [reason=install]`, confirmado por 4 fontes independentes) — handicap real e constante, porém sobre código Java/Kotlin, não sobre a fase nativa de upload onde o tempo foi efetivamente medido. **A hipótese de tempestade de LMK do sistema foi refutada:** houve 25 kills nos 5 min **antes** da campanha contra 11 durante, e o único episódio real de pressão de memória começou em `12:33:08.460` — **145 ms depois** do primeiro frame catastrófico, não antes dele; com 847 MB de pico, o app é candidato a **causa** dessa pressão, não vítima.
>
> **Confronto com a F6.6 (`F6_6_COMPARISON`).** A F6.6 mediu **apenas o SM-X510** e registrou o residual `LEGACY_STORYDETAIL_MOUNT_JANK` com p90 121-150 ms, ~4 frames >120 ms e **9-11 slow bitmap uploads**, concluindo que a causa dominante era o custo de montagem da tela, **não o bitmap**. O telefone **complementa e contradiz parcialmente** essa atribuição: mesma família de defeito, mas p90 **200 ms**, **9 frames >700 ms** e **550 slow bitmap uploads**, com o tempo provadamente **dentro da fase de upload de bitmap**. A F6.6 **nunca mediu** aparelho compacto de 360 dp, nunca mediu sob economia de bateria e nunca mediu instalação sem AOT — são **lacunas reveladas**, não contradições. Portanto o residual **não** pode ser simplesmente herdado pela F9 sob o enquadramento antigo.
>
> **Classificação (`PERFORMANCE_CLASSIFICATION`): `F6_PERF_EXISTING` (dominante) + `DEVICE_OR_SYSTEM_SPECIFIC` (amplificador).** **Não** é `F6_PERF_REGRESSION`: o dimensionamento dos assets e a ausência de `resizeMethod` são anteriores à Fase 6. **Não** é `TRANSIENT_FIRST_RUN` como explicação completa: a dominância da RenderThread foi sustentada pela sessão inteira, não apenas no primeiro lançamento. **`ROOT_CAUSE_STATUS = PARCIAL`** — está provado **onde** o tempo é gasto e **que** os assets estão superdimensionados sem política de decode; **não** está provado o contrafactual, porque o A/B não pôde ser executado (`F6-EVID-01`).
>
> **`ANDROID_PHONE_FURTHER_ACCESS = INDISPONÍVEL` após esta sessão.** O aparelho foi desconectado ao fim da coleta e nenhuma medição adicional é possível nesta etapa. **Nenhuma configuração de sistema foi alterada por mim:** `accelerometer_rotation` já era `1`, e tanto o `display_size_forced 1080,2340` quanto a economia de bateria são preferências do fundador, **preservadas**. Cabe ao fundador restaurar manualmente o **Bloqueador automático** (opção "Bloquear comandos por cabo USB"), que ele desativou para viabilizar o ADB, e a **Depuração USB**, se assim desejar.

> **`F6-PERF-01` · LOCALIZAÇÃO CAUSAL E CORREÇÃO MÍNIMA (bloco pós-F6.9, sem aparelho novo).** Com o logcat congelado, as métricas preservadas, o código-fonte, os assets e o histórico da F6.6, a causa saiu de **PARCIAL** para **PROVADA na fonte** — e recebeu correção de escopo mínimo.
>
> **Superfície.** `TRIGGER_SCREEN` = aba **Aventuras** → `AdventureMapScreen`; `TRIGGER_ACTION` = entrar no mapa (o toque de `12:33:03.176`); `TARGET_COMPONENT` = `StoryMapMarker` → `RecoverableImage` → `<Image>` da capa. A tela usa **um `ScrollView` não virtualizado** que monta as 4 regiões inteiras; `IMAGES_MOUNTED_AT_ONCE` = **28 a 36** `<Image>` de React Native (4 `asleepPreview` + 4 `asleepFinal` + 0-8 camadas de despertar + **20 capas de história**), espalhados por ~1,5 s pelo escalonamento de `loadedFinalIds` (0/300/700/1100 ms) somado ao `OVERLAY_DELAY_MS` de 400 ms dos pins — o que casa com as ~40 linhas em 1,5 s do log. Varredura exaustiva: nenhuma outra tela do app chega perto dessa contagem.
>
> **Mecanismo (`ROOT_CAUSE_STATUS = PROVADA` na fonte).** O `resizeMethod` padrão do React Native é `auto`, e em `ReactImageView.shouldResize()` o `auto` só gera `ResizeOptions` para URIs `content://` e `file://`. Asset empacotado por `require()` vira **recurso drawable** e decodifica em **tamanho nativo**. As 20 capas (dez de 1456x816, dez de 1672x941) somam **106,8 MB de bitmap ARGB_8888** para pintar círculos de 44-77 dp (132-231 px a 3x) — e cada bitmap vira textura de GPU. É exatamente a fase **SYNC → IssueDrawCommands** onde os nove frames de 712-1111 ms gastaram 100% da duração com a thread principal em 0,43-0,82 ms, e é contribuinte direto do `VmHWM` de 847 MB. A arte de **região** (941x1672 exibida em ~1080x1920) aparece **ampliada** — não tem o que reduzir e foi deliberadamente deixada em paz.
>
> **Correção (`PATCH_SCOPE_PROVEN = SIM`).** Uma linha de props em **um** `<Image>` de **um** arquivo (`src/components/map/StoryMapMarker.js`): `resizeMethod="resize"` + `resizeMultiplier={2}`. Bitmap dos 20 pins: **106,8 MB → 7,5 MB** a 360 dp/3.0. O multiplicador **não é folga arbitrária**: o `inSampleSize` do Fresco é potência de dois **com tolerância** (`ROUND_UP_FRACTION = 2/3`), então pedir a caixa exata pode devolver bitmap **menor** que ela. Com 2x, a matriz inteira (20 capas x 5 estados x 5 escalas x 6 densidades) devolve bitmap **1,19-2,40x maior** que o círculo. **Rejeitados por causa, não por dificuldade:** `resizeMethod` global (proibido e errado — quebraria a arte ampliada de região), variantes novas de asset (área protegida, exige auditoria e aprovação), virtualizar o mapa (arquitetural, mexe em câmera/âncora/medição do tour), memoização (a thread principal **não** era o gargalo) e montagem tardia dos pins (muda comportamento e interage com `registerPinTarget`).
>
> **Provas.** `scripts/testing/mapCoverDecodeHarness.js` — **15/15** focados, **10/10** mutantes mortos, zero dependências. `scripts/testing/mapCoverVisualGate.js` — portão **visual** objetivo nos três tamanhos de pin x 20 capas, comparando ANTES e DEPOIS contra um IDEAL Lanczos-3: o DEPOIS fica **mais perto** do ideal que o ANTES em toda média (26,9 → 31,6 dB no pin menor), pior capa **-0,78 dB** dentro da tolerância de 1 dB, detalhe entre **88% e 114%** do ideal, recorte e dimensão de saída idênticos, proporção 1:1 em ambos. `verify:runtime` verde (bundle + **4984/4984** smoke) e `expo-doctor` **18/18**.
>
> **`POST_FIX_COMPACT_PHYSICAL = INDISPONÍVEL`.** O SM-S928B não está disponível para nova coleta e **nenhum pós-fix físico compacto foi fabricado**. Tudo acima é simulação determinística do pipeline de decodificação e leitura de fonte — **não** é equivalente a prova física, e `F6-EVID-01` (o A/B ambiental) continua aberto. Por isso `F6-PERF-01` **permanece P1 ATIVO e bloqueador da F6** até a remedição no mesmo perfil `preview`.
>
> **Relação com a F6.6 (`F6_6_RELATION = SUPERFÍCIE DIFERENTE, MECANISMO RELACIONADO`).** O residual `LEGACY_STORYDETAIL_MOUNT_JANK` é da **StoryDetail**, não do mapa: são superfícies distintas, e o achado novo **não** é transferido para a F9. O que a F6.6 ganha é **explicação**: modelando o arredondamento do Fresco, a capa da StoryDetail (fonte 1456x816 numa caixa de 1080x608) cai em `sampleSize` 2 → 728x408, **0,67x da caixa** — borrão garantido. Foi por isso que a tentativa simples da F6.6 degradou a arte e teve de ser revertida, e é por isso que o multiplicador existe aqui. Na StoryDetail a capa aparece **perto do tamanho nativo** e não há memória a recuperar: o custo de montagem daquela tela segue atribuído à montagem, com a F9 como dona.
>
> **Superfície irmã registrada, não corrigida.** `src/components/pares/ParesFlipCard.js` pinta as mesmas capas em tamanho nativo dentro de cartas pequenas de grade (mesma família de defeito). **Não** foi medida na campanha física e **não** foi corrigida neste bloco — o escopo do patch exigia mecanismo provado por superfície. Fica anotada para tratamento próprio.

> **`F6-PERF-01` · PAR CANÔNICO REGERADO E PROVENIÊNCIA (rebuild pós-patch).** O fundador **adjudicou o patch como candidato aprovado**. Os dois binários canônicos foram **regerados do mesmo `SOURCE_HEAD`**, nos mesmos perfis usados na F6.8 (`preview` / `INTERNAL`), sem qualquer alteração de código, configuração ou documentação entre o disparo e o término dos dois builds.
>
> `BUILD_SOURCE_HEAD` = **`645e6275c94b2061aa424e49cdc5edfec8ba8c7c`** · branch `feat/fase6-shell-splash` · árvore limpa no disparo.
>
> | Plataforma | EAS build ID | Status | Perfil / distribuição | Versão | `versionCode`/`buildNumber` | Fingerprint | SDK |
> | --- | --- | --- | --- | --- | --- | --- | --- |
> | Android | `b86b2cea-3c23-4183-b34b-3e3a31d8273d` | `FINISHED` | `preview` / `INTERNAL` | 1.0.0 | 1 | `5b66cacb7ca103878fb3243f450663909c84eef0` | 54.0.0 |
> | iOS | `da48afb6-11c7-4955-81cc-d9eef4c42b6f` | `FINISHED` | `preview` / `INTERNAL` | 1.0.0 | 1 | `f5f7a6f3b572ddc748bd1156bdada9cfd47bf287` | 54.0.0 |
>
> Artefatos: Android `https://expo.dev/artifacts/eas/LO5c21oFZQvshbLdaEt7N82Ke78ByCrMMkZYgtkyg5I.apk` · iOS `https://expo.dev/artifacts/eas/DASvn_2R2vP6M5ybCCLNLDdgM2W84sAfJqraNGx2gm0.ipa`.
>
> **`SAME_SOURCE_HEAD_PROOF`.** O `gitCommitHash` reportado pelo EAS é **idêntico nas duas plataformas** e igual ao `SOURCE_HEAD` congelado — `645e6275c94b2061aa424e49cdc5edfec8ba8c7c` —, com a mesma `gitCommitMessage` (`docs: registrar a localização causal do F6-PERF-01 e retificar o enquadramento da F6.6`). Os *fingerprints* diferem entre Android e iOS **por construção** (são impressões por plataforma), o que não afeta a prova de origem comum.
>
> **Builds da F6.8 ficam `SUPERSEDED`.** Android `75e33bbc-14f4-4ce1-828e-5221745e74b7` e iOS `04351ddc-fdc2-485c-a578-816212ff79c1`, ambos de `BUILD_SOURCE_HEAD 2dcf717`, **deixam de ser candidatos finais** da F6 — o código mudou. O APK que rodou na campanha da F6.9 continua válido **como evidência do estado pré-fix**, nunca como candidato.
>
> **`ANDROID_PHONE_RAW_LOG_PRESERVATION = PRESERVED`.** O logcat congelado da campanha **existe e foi reconciliado**: `f69_phone_CAMPAIGN.log`, **12.227.718 bytes**, **87.833 linhas**, `SHA256 = 4eb980c3f9deedd2efa85caabc94d2c35db324bade514775f55dbcf1279e4898`, no scratchpad da sessão de coleta (`.../Temp/claude/c--tmp-ptf-fase6-shell-splash-wt/1176adf8-.../scratchpad/f69/`). Uma declaração anterior de que o arquivo teria se perdido estava **errada** — a busca havia coberto só o repositório e o scratchpad da sessão seguinte. Com o log em mãos foram reverificados na evidência bruta: o toque de `12:33:03.176`, os 9 `Davey!` de 712-1111 ms, o `ScrollView` não virtualizado, as 31 `<Image>` montadas (20 num único décimo de segundo), a carga da `libnative-imagetranscoder.so` e as métricas de `gfxinfo`/`threads`/`proc_status` (p90 200 ms · 14,71% janky · 550 slow bitmap uploads · RenderThread 80,8% · `VmHWM` 867.544 kB = 847 MB). Essa releitura **confirmou** o diagnóstico e **corrigiu** duas afirmações exageradas (a fase SYNC em 9 frames e a contagem "~40 imagens"), retificadas acima.
>
> **`POST_FIX_COMPACT_ANDROID_PHYSICAL = EVIDENCE_GAP`.** Não existe medição física pós-fix em telefone Android compacto: o SM-S928B não está disponível nesta etapa. O gap **não** é convertido em `PASS` nem em `FAIL` — fica declarado como lacuna. Por isso **`F6-PERF-01` permanece `P1 ATIVO` e `BLOCKS_F6 = SIM`**, e `F6-EVID-01` (o A/B ambiental) continua aberto. `READY_FOR_POST_FIX_PHYSICAL_VALIDATION = SIM`: há par canônico novo, íntegro e rastreável para a validação física ainda possível (tablet Android disponível; iPhone físico sem USB para o PC; S24 Ultra indisponível). A adjudicação de como fechar o gap cabe ao fundador no próximo bloco.

> **`F6-PERF-01` · F6.10 · VALIDAÇÃO FÍSICA PÓS-FIX EM TABLET ANDROID (SM-X510).** Campanha física executada no único aparelho Android disponível, com o APK canônico pós-fix, **sem Metro e sem Dev Client** (preview standalone), **sem `uninstall`, sem `clear data` e sem reset de storage/onboarding** — os dados existentes do tablet foram preservados (`adb install -r`).
>
> **`BUILD_IDENTITY = CONFIRMADO_BYTE_A_BYTE`.** O `sha256sum` do `base.apk` calculado **dentro do próprio dispositivo** após a instalação é igual ao do artefato canônico: `0061e294eaf437cfb9b7826a759fd18fdc0eebd9fda420489121daae1681341d` (265.651.682 bytes), oriundo do build EAS `b86b2cea-3c23-4183-b34b-3e3a31d8273d`, `BUILD_SOURCE_HEAD 645e6275c94b2061aa424e49cdc5edfec8ba8c7c`. **O APK antigo de `2dcf717` não foi usado.**
>
> **Alvo.** `SM-X510` (Galaxy Tab S9 FE, `gts9fewifixx`, serial `RX2XC003LTJ`) · Android 16 / API 36 · 1440×2304 px @ 280 dpi → **823 × 1317 dp** · `RESPONSIVE_CLASS = MEDIUM` · painel adaptativo de **90 Hz**. **Não é um telefone compacto** e **não é o SM-S928B** da perna telefone.
>
> **Atestação humana (`HUMAN_PERFORMANCE_ATTESTATION`).** Todas as respostas rápidas · primeira entrada em Aventuras **rápida** · travamento perceptível **NÃO** · capas e pins **sem degradação visual percebida** · rolagem do mapa normal · segunda entrada em Aventuras rápida · nenhuma outra anomalia percebida. **`VIDEO_EVIDENCE = AUSENTE`** — não houve gravação externa e **nada foi fabricado** para substituí-la.
>
> **Evidência bruta congelada.** `tablet_CAMPAIGN.log`, **2.287.838 bytes**, **16.300 linhas**, `SHA256 = 08448387eb3364e00e9694a4c339bf921655cdeda06215c9866b8d5ccc3bfb56`, janela `08-25 16:02:48.003 → 16:11:04.113` (relógio do tablet), mais `gfxinfo`, `gfxinfo framestats`, `meminfo`, `thermal`, `battery`, `proc_status`, `threads` e `thread_cpu`, no scratchpad da sessão (`.../fe3592e9-.../scratchpad/f6perf01/tablet/`).
>
> **Veredito funcional.** `MAP_FUNCTIONAL = PASS` — toque em `16:08:26.514`, `ScrollView` do mapa inicializado em `16:08:26.636` (**122 ms**), 20 capas de pin montadas entre `16:08:27.098` e `16:08:27.114` (**16 ms**, após o atraso de 400 ms do overlay) e a última imagem em `16:08:27.754`. `VISUAL_DEGRADATION = NENHUMA PERCEBIDA` · `PORTRAIT_RESPONSIVENESS = PASS` · `SEVERE_SLOWNESS_REPRODUCED = NÃO`. Zero `FATAL`, zero `ANR`, zero morte de processo, zero `Davey!`, zero `Skipped frames`, `Thermal Status 0` durante toda a campanha.
>
> **Métricas pós-fix no tablet.** 5.224 frames · p50 **14 ms** / p90 **17 ms** / p95 **18 ms** / p99 **21 ms** · **Slow bitmap uploads = 3** · Missed Vsync = 1 · Slow UI thread = 27 · apenas **2 frames ≥ 150 ms** · `VmHWM` **492.000 kB (480 MB)** · 60 threads. **Ressalva metodológica:** os 38,99% de “janky” contra 9,44% de “janky (legacy)” e os 3.939 frames de alta latência de entrada são **artefato do alvo de 11,11 ms do painel de 90 Hz** com produção próxima de 60 fps — não são defeito severo do app; o histograma mostra a massa concentrada em 12-17 ms. O balde `4950ms=2` do histograma de GPU é o *catch-all* da escala, não duas medições de 4,95 s. O `framestats` guarda só os últimos 120 frames (≈ 2,0 s) e **não cobre a entrada em Aventuras**.
>
> **Ressalva sobre a segunda entrada.** A segunda entrada em Aventuras **não gerou novo `initGoToTop` nem novas montagens de imagem** — a tela permaneceu montada. Ela confirma a fluidez percebida, mas **não reexercita o caminho de decodificação** de forma independente.
>
> **`COMPACT_POST_FIX_PHYSICAL = NOT_TESTED`.** O SM-S928B está `INDISPONÍVEL PARA NOVA VALIDAÇÃO` e **não foi solicitado**. **O tablet não é o contrafactual compacto** e o resultado dele **não é convertido em prova física do Android `COMPACT`**.

> **`F6-PERF-01` · F6.10 · COMPARAÇÃO COM ENQUADRAMENTO CORRETO (não é um A/B).** As duas medições são **de aparelhos, classes de tela, densidades, taxas de atualização e versões de Android diferentes**. Ficam nomeadas em separado e **não** são tratadas como braços de um mesmo experimento.
>
> | | `PRE_FIX_S24_COMPACT` | `POST_FIX_SM_X510_MEDIUM` |
> | --- | --- | --- |
> | Aparelho | SM-S928B (S24 Ultra) | SM-X510 (Tab S9 FE) |
> | Classe / densidade | `COMPACT`, 360 dp, fator 3,0 | `MEDIUM`, 823 dp, fator 1,75 |
> | Painel | 120 Hz | 90 Hz |
> | Código | pré-fix (`2dcf717`) | pós-fix (`645e627`) |
> | `Davey!` (>700 ms) | **9** (712-1111 ms) | **0** |
> | Slow bitmap uploads | 550 | 3 |
> | p90 / p99 de frame | 200 ms / 450 ms | 17 ms / 21 ms |
> | Missed Vsync | 540 | 1 |
> | Frames ≥ 150 ms | 549 | 2 |
> | `VmHWM` | 867.544 kB (847 MB) | 492.000 kB (480 MB) |
> | Threads | 98 | 60 |
> | RenderThread (do trio RT+main+JS) | 80,8% | 52,6% |
>
> Esses deltas são **indicativos e direcionalmente coerentes** com o mecanismo corrigido, e **nada mais**: trocar de aparelho troca simultaneamente o código, a densidade (logo o tamanho de decode alvo), a taxa de atualização, a versão do Android e a memória disponível. **Não são prova de causalidade do patch.**
>
> **O que existe de mesmo aparelho — e o que isso vale.** Foi recuperado o logcat **pré-fix do próprio SM-X510** (mesmo serial `RX2XC003LTJ`): `f69_tablet.log`, **6.661.194 bytes**, **50.591 linhas**, `SHA256 = c0442558f6b593f244b1d4ebc5c0af0b0160f9bb83379bce0852780b18e9e37f`, janela `08-25 11:49:28.677 → 12:08:22.110`. Ele permite uma comparação **de mesmo aparelho**, porém **só sobre métricas derivadas de log** — **não existe `gfxinfo` pré-fix do tablet**, então **nenhum A/B numérico de frames é possível nem foi inventado**.
>
> | Mesmo aparelho (SM-X510) | pré-fix `2dcf717` | pós-fix `645e627` |
> | --- | --- | --- |
> | `Davey!` / `Skipped frames` / `ANR` / `FATAL` | **0 / 0 / 0 / 0** | **0 / 0 / 0 / 0** |
> | Toque → `initGoToTop` do mapa | 146 ms | 122 ms |
> | Janela de montagem das 20 capas | 50 ms (`05.734`→`05.784`) | **16 ms** (`27.098`→`27.114`) |
> | GC do app na campanha inteira | 26 | 10 |
> | `firstLayoutMs` / `splashReactMs` (telemetria do app) | 1107 / 800 | 1129 / 791 |
>
> **A conclusão honesta desse par é desconfortável e precisa ser dita:** o tablet já tinha **`Davey! = 0` ANTES do fix**. Ele **nunca reproduziu o sintoma severo**, logo **não pode demonstrar a cura dele**. O que a perna tablet prova é **ausência de regressão** e **indicadores favoráveis específicos do mecanismo** (montagem das capas 3× mais concentrada, 2,6× menos GC, uploads lentos em 3), **não** “reproduzir e curar”.
>
> **Uma métrica que não melhorou, declarada:** o `Displayed` da `MainActivity` foi `+235 ms` / `+295 ms` pré-fix e `+424 ms` pós-fix. A execução pós-fix foi a **primeira após `adb install -r`** (perfil ART invalidado), o caminho de boot **não** é o caminho do mapa e a telemetria própria do app ficou dentro de 2% (`firstLayoutMs` 1107 → 1129). Com **n = 1** pós-fix **não é possível separar** o efeito de pós-instalação da variação normal — fica registrado como observação, **não** como regressão provada nem descartada.

> **`F6-PERF-01` · F6.10 · CLASSIFICAÇÃO E RECOMENDAÇÃO (sem baixar o item automaticamente).**
>
> `TABLET_POST_FIX_RESULT` = **`PASS_SEM_REGRESSÃO_E_SEM_NOVO_GARGALO_SEVERO`**. **Não** é um `PASS` compacto e **não** é usado como tal.
>
> **Recomendação ao fundador: `ELIGIBLE_FOR_GAP_ADJUDICATION`.** O fundamento é que **o trabalho técnico disponível acabou**, e o que resta é uma decisão, não uma tarefa: (1) a causa está provada na fonte e no log do aparelho afetado; (2) a correção é mínima, em um único `<Image>`, e ataca exatamente o mecanismo medido; (3) o *harness* de decodificação prova 106,8 MB → 7,5 MB com margem de nitidez ≥ 1,194× (15/15 focados, 10/10 mutantes mortos); (4) o portão visual objetivo prova que a arte não degrada; (5) a perna física possível foi executada e não achou regressão nem gargalo novo; (6) o único item que falta — remedição física em telefone compacto — depende de **hardware indisponível**, não de esforço.
>
> **O que a adjudicação estaria aceitando, explicitamente:** encerrar `F6-PERF-01` com prova causal + prova de decodificação + portão visual + ausência de regressão em `MEDIUM`, **sem** confirmação física em `COMPACT` de que os 9 `Davey!` desapareceram, e **sem** o A/B ambiental de `F6-EVID-01` que separaria o ganho do patch do peso da economia de bateria e do `[status=verify]`.
>
> **Até a adjudicação, nada foi rebaixado:** `F6-PERF-01` permanece **`P1 ATIVO`** e **`BLOCKS_F6 = SIM`**; `POST_FIX_COMPACT_ANDROID_PHYSICAL` permanece **`EVIDENCE_GAP`**, sem virar `PASS` nem `FAIL`; `F6-EVID-01` permanece aberto; `F12A-PERF-PARES-01` permanece hipótese não medida, sem virar bloqueador por analogia. `DOCUMENTATION_HEAD` desta atualização é **posterior** e **separado** do `BUILD_SOURCE_HEAD 645e627`, que permanece **imutável** — nenhum código foi alterado nesta execução.

> **SAÍDA F6**
>
> Nenhum P0/P1 F6 em portrait; tablet sem colisão com sidebar/UI do sistema; performance release like aceitável; Android e iOS canônicos e equivalentes; evidência física rastreável; landscape residualizado sem PASS fictício.


## F7. Onboarding, Home e Área dos Responsáveis

Objetivo: primeira sessão compreensível, elegante e robusta, sem coordenadas frágeis.


### Escopo

* Redesenhar o tour para destacar o componente real. O ícone alvo recebe estado visual; remover moldura baseada em X/Y absoluto.
* Mensagens do tour em regiões estáveis. Anchors apontam para componentes reais.
* Primeira entrada no Mapa centraliza Comece Aqui e A Criação.
* Apresentar Aventuras e Brincar. Nunca reintroduzir Ateliê.
* Não ensinar Meu Momento obrigatoriamente antes de F12B torná-lo útil de verdade.
* Reset interno de onboarding/tours para QA, protegido e ausente em produção.
* Home com uma ação principal do JourneyOrchestrator e exploração secundária.
* Área dos Pais é renomeada para Área dos Responsáveis quando este bloco tocar textos públicos.
* Área dos Responsáveis usa seções claras, prova de aprendizado, privacidade, Plano Família, Cultinho, som, dados, suporte e compartilhamento adulto.

> **SAÍDA F7**
>
> Criança entende onde começar; tour aponta para alvos corretos em portrait; responsável compreende proposta e controles; primeira sessão pode ser repetida em QA sem reinstalar.


## F8. Vozes e matriz do Beni

* Separar voz de narração e voz do Beni.
* Matriz de fala por contexto: onboarding, primeira visita, retomada, missão, descoberta, conclusão, recovery, jogos, Meu Momento, Cultinho, erro e offline.
* Eliminar fala genérica repetida sem significado.
* Versionar arquivo, hash, duração e transcrição.
* Script bíblico/infantil aprovado antes da gravação.

> **SAÍDA F8**
>
> Nenhuma fala órfã, genérica ou semanticamente deslocada.


## F8A. Orquestração sonora

* Gerenciador central, prioridade, ducking, fade, pausa e retomada.
* Background/foreground, interrupções do sistema e fone/alto falante.
* Fila de falas e regra para tutorial, conquista e celebração.
* Controles de música e sons de interface acessíveis; narração tem política própria.
* Reduce Motion não altera regras de áudio indevidamente.

> **SAÍDA F8A**
>
> Zero áudio simultâneo indevido, zero voz tocando sobre camada bloqueada sem contexto.


## F9. A Criação como produto definitivo de aprendizagem

Objetivo: transformar A Criação no padrão vendável e replicável, incluindo a mudança de layout de histórias e cenas que estava ausente do v5.


### F9A Story Home V2

* Capa hero, título, referência, Lição do coração, uma CTA, progresso resumido e Beni contextual.
* Parte atual e próxima recomendada. Lista integral atrás de Ver todas as partes.


### F9B Página Viva

* Implementar integralmente a Seção 5 deste roadmap.
* Arte dominante, texto real, contraste editorial, player integrado, progresso discreto, metadata visual por cena.
* Scene Transition Engine com preload e zero frame vazio.


### F9C Aprendizagem

* Objetivo infantil explícito.
* Missão da Aventura.
* Dois a quatro Momentos de Descoberta.
* Reconto e aplicação.
* Perguntas de recuperação.


### F9D Colorir narrativo

* Resolver JRN C60 01.
* A conclusão do Colorir volta à história imediatamente e persiste sem duplicar.
* Arte da criança é protagonista na conclusão da atividade.
* Uma de três atividades satisfaz o gate de conclusão total.


### F9E Conclusão e próximo passo

* Matar o painel atual.
* Celebração curta e próxima ação única.
* Reconciliar o passo reflexivo que participa da conclusão total, sem gate invisível.


### F9F Meu Momento e Cultinho piloto de A Criação

Criar o conteúdo piloto que F12B transformará em motor reutilizável. A experiência precisa ser semanticamente correta desde F9, ainda que a rotação completa só venha em F12B.

> **SAÍDA F9**
>
> A Criação parece um Livro Vivo, ensina de maneira reconhecível, tem jornada coerente, nenhuma divergência de estado entre rotas e possui uma conclusão simples que conduz a próxima ação.


## F10. Meu Livro e Escuta Tranquila

* Reutilizar a Página Viva, sem segundo reader.
* Livro como objeto emocional da jornada.
* Arte real da criança quando houver, ilustração oficial como fallback.
* Texto, imagem, narração, retomada e reconto.
* Escuta contínua sem loop infinito nem áudio concorrente.
* Page turn pode ser mais literal no Livro, com Reduce Motion equivalente.
* Certificado pode ser última página quando conclusão total estiver satisfeita.

> **SAÍDA F10**
>
> Livro e escuta são estáveis, reutilizam engine e transformam consumo em memória.


## F11. Conclusão, próxima ação, Estrelinhas e Mapa

* JourneyOrchestrator como fonte de próxima ação.
* Estados de história consistentes em Home, Mapa, Story Home e Estrelinhas.
* Quase lá e Concluída total com semântica única.
* Resolver STR ONB 01, uma camada bloqueante por vez.
* Reconciliar rewards/bonusStars para uma fonte visível e idempotente.
* Baú funciona como álbum de memórias visuais reais, não cards genéricos.
* MapAnchor canônico para pin, hit target, glow, scroll e spotlight.
* Ver mapa usa destino semântico, não scrollTop literal.

> **SAÍDA F11**
>
> Zero deadlock de modal, zero recompensa invisível incoerente e próxima ação compreensível em todos os estados.


## F12A. Núcleo infantil, Brincar e jogos


### Brincar final

* Pares do Beni.
* Palavrinhas do Beni.
* Cadê a Ovelhinha?.
* Monte a Cena.
* Criar Livre e Minhas Artes em seção criativa.
* Composição portrait usa largura real e não inventa cards para preencher espaço.


### GameShell

* Entrada previsível: nome, objetivo curto, modo/dificuldade quando aplicável e Jogar.
* Durante: sair, título, progresso e ajuda em zonas previsíveis.
* Saída antecipada consistente.
* Conclusão compartilhada: repetir, mudar modo quando existir, voltar ao Brincar ou Início conforme hierarquia.


### Cadê a Ovelhinha?

* Corrigir inicialização para que a ovelha apareça sem depender de rotação.
* Preservar Modo Infinito e contratos user facing aprovados.
* Evitar derrota punitiva; dicas progressivas e meta clara.


### Criar Livre

* Documento lógico independente do viewport.
* Plano Família: salvar, descartar, cancelar e persistir.
* Plano Grátis: criar sem salvar, com convite gentil ao responsável no momento de salvar.
* Não repetir confirmação redundante depois de um aviso comercial.
* Teclado, safe area e controles permanecem acessíveis em portrait.

> **SAÍDA F12A**
>
> Nenhuma criança fica presa, cada jogo começa e termina de forma previsível, Criar Livre tem saída segura e Brincar parece uma superfície única.


## F12B. Meu Momento, Cultinho, recuperação, presença e Igreja


### ContentRotationEngine

* Entradas: última história, verdade central, tempo desde conclusão, conteúdo já exibido, histórico de repetição e disponibilidade offline.
* Saídas para Meu Momento, Cultinho e sugestões controladas.


### Meu Momento

Executar integralmente o contrato da Seção 7.1.


### Cultinho em Casa

Executar integralmente o contrato da Seção 7.2. A Criação e Noé precisam provar variedade antes da fábrica das demais histórias.


### Recuperação e Jornada de Presença

Implementar recuperação espaçada piloto e presença não punitiva. Nenhuma notificação infantil coercitiva.


### Modo Igreja V1

* Não criar backend tradicional de igreja no V1 por precaução.
* A experiência piloto pode usar conteúdos, presets e materiais locais/offline.
* Uso coletivo deve funcionar dentro do contrato portrait. Projetor/landscape avançado é evolução adaptativa, não gate do V1.
* Piloto com líder sem ajuda do desenvolvedor. Não coletar dados infantis desnecessários.

> **SAÍDA F12B**
>
> Meu Momento tem aprendizado identificável; Cultinho é útil e variado; recuperação funciona sem pressão; presença é saudável; piloto familiar e de igreja demonstra utilidade real.


## F13. Noé e prova da fábrica reutilizável

* Aplicar Story Home V2 e Página Viva sem nova arquitetura.
* Objetivo, missão, descobertas, recuperação, aplicação, 10 cenas, 3 Colorir, quiz, Meu Momento, Cultinho e Livro.
* Mesmos schemas e engines de A Criação.
* Alternância A Criação e Noé sem vazamento de estado.
* Offline e retomada.

> **SAÍDA F13**
>
> Noé prova que a fábrica é reutilizável. Se uma segunda história exigir nova engine, parar e corrigir a fábrica antes de escalar.


## F14. Beta ampliado e matriz física real

> **PORTÃO DE ENTRADA**
>
> CNPJ ativo e estrutura societária mínima formalizada. Produto principal já provado em A Criação e Noé.

* Famílias reais, com crianças de 6 a 8 anos no centro e familiaridade bíblica variada.
* Android de entrada, Android intermediário, tablet Android portrait e iPhone.
* iPad continua evidence gap se indisponível.
* Testar aprendizagem: recontar, ordenar, recuperar verdade depois e compreender aplicação.
* Testar usabilidade: ação principal, ajuda, tour, Meu Momento, Cultinho, jogos e retorno.
* Testar performance em dispositivo de entrada e tablet.
* Piloto igreja dentro do escopo V1.
* Feedback vira correção apenas quando viola contrato do V1.

> **SAÍDA F14**
>
> Nenhum problema estrutural antes da escala de conteúdo. P0 e P1 corrigidos e retestados.


## F15. Fábrica das outras dezoito histórias

Princípio: nenhuma história cria nova arquitetura. Uma história por lote e aprovação.


### Contrato obrigatório por história

* storyId imutável, referência bíblica, verdade central e objetivo infantil.
* 10 cenas com imagem, texto, narração, metadata visual e fallback.
* Missão e dois a quatro Momentos de Descoberta.
* Perguntas de recuperação e aplicação.
* Quiz com contrato oficial.
* 3 atividades Colorir com o Beni.
* Meu Livro e entrada de reconto.
* Meu Momento com Beni.
* Pelo menos 1 Cultinho em Casa correspondente.
* Presente/memória quando aplicável.
* Pack, offline e compatibilidade.
* Revisões bíblica, pedagógica, infantil, visual, áudio e QA técnico.
* Aprovação do fundador.

> **SAÍDA F15**
>
> As vinte histórias atingem o mesmo contrato de A Criação/Noé sem exceção arquitetural.


## F16. Congelamento de conteúdo, mídia, acessibilidade e licenças

* 20 histórias, 200 cenas narrativas, 60 atividades Colorir e seus conteúdos derivados.
* Zero placeholder, áudio provisório ou texto sem revisão.
* Revisão bíblica e teológica completa.
* Revisão pedagógica e infantil.
* Acessibilidade de textos, labels, touch targets, font scaling e Reduce Motion.
* Licenças, autoria, cessões e proveniência documentáveis.
* Auditoria de assets premium que não podem continuar embarcados no bundle base.

> **SAÍDA F16**
>
> Zero conteúdo provisório e zero ativo sem origem ou licença adequada.


## F17. Packs premium e offline completo

* 18 packs premium versionados.
* Manifestos, hashes, bytes, MIME, dimensões e minAppVersion.
* Download, pause/cancel quando aplicável, retry e retomada.
* Corrupção, falta de espaço, atualização e redownload.
* Kill switch e conteúdo incompatível bloqueado com segurança.
* Janela offline de entitlement conforme contrato vigente.
* Auditoria contra base64 pesado e OOM em Android de entrada.
* Nenhum require premium esquecido no binário base.

> **SAÍDA F17**
>
> Conteúdo premium confiável online e offline, atualizável e recuperável.


## F18. Monetização, entitlements e presente Davi e Golias

> **PORTÃO DE ENTRADA**
>
> Conta bancária empresarial, contabilidade, dados fiscais, contratos e estrutura para monetização estão prontos.


### Plano Família

* RevenueCat como fonte de entitlement.
* Mensal e anual. Sem trimestral, vitalício ou compra avulsa no V1.
* Valores finais, desconto anual e eventual teste são decisão controlada desta fase e precisam de ratificação explícita.
* Apple IAP e Google Play Billing.
* Restore real, expiração, downgrade, reinstalação, outro aparelho e falha de pagamento.
* Paywall adulto atrás da Área dos Responsáveis e gate parental. Nunca pressão infantil.


### Presenteie uma Família com Davi e Golias

* Superfície exclusivamente adulta, na Área dos Responsáveis.
* Compartilhamento em um toque pelo share sheet nativo.
* Card compartilhável com marca e benefício do app, sem dados pessoais da criança por padrão.
* Nova família elegível recebe Davi e Golias como benefício promocional, dentro do mecanismo de entitlement aprovado pela Apple/Google e pela revisão jurídica.
* Quem recebeu também pode compartilhar com outras famílias. Compartilhamento pode ser ilimitado.
* Não acumular cópias de conteúdo nem moeda. O indicador pode receber reconhecimento de impacto, por exemplo número de famílias alcançadas.
* Atribuição first party com token/link. Evitar SDK invasivo de atribuição em app infantil.
* Antifraude proporcional: idempotência, nova família, sem autoindicação, sem duplicar por reinstalação, rate limits e detecção de padrões anormais.
* Não prometer impossibilidade absoluta de fraude. O objetivo é reduzir incentivo econômico e bloquear abuso trivial.
* Se a solução exigir backend, criar somente serviço first party mínimo, restrito ao responsável e sem dados infantis. Backend geral, login infantil e CMS continuam proibidos sem decisão própria.

> **GATE DE PLATAFORMA E JURÍDICO**
>
> Antes de publicar o presente Davi e Golias, validar a forma de entitlement, a regra de incentivo da App Store, Google Play, privacidade e enquadramento promocional brasileiro. Se a recompensa não puder ser implementada com segurança, o compartilhamento orgânico adulto permanece e a recompensa é replanejada sem bloquear o núcleo infantil.

> **SAÍDA F18**
>
> Compra, restore, entitlement e presente promocional aprovado funcionam em sandbox real, sem brecha infantil e sem divergência entre lojas.


## F19. Hardening, segurança e continuidade

* Error Boundary global e recuperação amigável.
* Storage corrompido, pack ausente, arquivo de mídia ausente e migrações.
* Threat model e testes de abuso.
* Secrets fora do cliente. Rotação do que tiver sido exposto.
* Logs minimizados e sem dados infantis indevidos.
* Ferramentas internas e rotas de QA ausentes em produção.
* 2FA, gerenciador de senhas, códigos de recuperação e inventário de acessos.
* Backup de credenciais críticas e capacidade de continuar publicando sem um único computador.
* Revisão de dependências, licenças e vulnerabilidades.
* Playbook de incidente, severidade, contatos e rollback.

> **SAÍDA F19**
>
> Nenhum defeito crítico sem recuperação segura e nenhum segredo/ferramenta interna no artefato final.


## F20. Engenharia de release, contas e lojas

> **PORTÃO DE ENTRADA**
>
> DUNS e contas de organização quando exigidos, site funcional, e mail corporativo, identidade legal, documentos e IP coerentes.

* Versionamento, build number, versionCode, runtimeVersion e canais.
* Staging, production, EAS Build, EAS Update, rollout e rollback.
* Target API 36 ou superior conforme requisito vigente do Google Play.
* Compatibilidade Android de páginas de memória de 16 KB quando aplicável.
* Xcode/SDK e requisitos atuais da Apple na data da submissão.
* TestFlight e faixas internas/fechadas do Google Play.
* Metadata, screenshots e materiais coerentes com a versão real.
* Privacy Policy, Terms, App Privacy, Data Safety, classificação etária e suporte.
* Política de update: OTA compatível, binário nativo e bloqueio de update incompatível.
* Release Manifest do RC com SHA, dependências, hashes e artefatos.

> **SAÍDA F20**
>
> Builds e contas prontos, store forms refletem o binário real e rollback foi demonstrado.


## F21. Beta do Release Candidate e Launch Readiness

Objetivo: provar o exato artefato que será publicado e fechar todos os gates transversais.

* Instalação limpa, atualização, rollback, migração e reinstalação.
* Onboarding, Home, Story Home V2, Página Viva, missões, recuperação e conclusão.
* Meu Momento, Cultinho, Meu Livro, Colorir, Brincar e jogos.
* Packs, offline, storage baixo e rede lenta.
* Compra, restore, expiração, downgrade e outro aparelho.
* Presente Davi e Golias no cenário aprovado.
* Android de entrada, Android intermediário, tablet Android portrait e iPhone.
* Font scale ampliado, TalkBack, VoiceOver, Reduce Motion e touch targets.
* Background/foreground e interrupções de áudio.
* Performance e memória do RC, não do Development Build.
* Privacy/Data Safety/App Privacy reconciliados com SDKs reais.
* Conteúdo, licenças, empresa, contas, suporte, segurança e rollback rechecados.


### Critério de severidade

* Zero P0.
* Zero P1.
* Nenhum P2 que prejudique aprendizagem, pagamento, download, segurança, privacidade ou confiança.

> **SAÍDA F21**
>
> LAUNCH_READINESS_PASS somente quando produto, empresa, conteúdo, privacidade, pagamento, segurança, beta, RC e operação estão simultaneamente verdes.


## F22. Lançamento progressivo e operação inicial

* Liberar para grupo pequeno primeiro.
* Monitorar crash, ANR, memória, download, recovery, compra, restore, cancelamento, suporte e reviews.
* Corrigir bloqueadores antes de ampliar.
* Rollback e lista de hotfix prontos.
* Primeira semana prioriza estabilidade, não nova feature.
* Expandir gradualmente quando os sinais técnicos e de suporte estiverem saudáveis.

> **SAÍDA F22**
>
> Produto publicado e operado de forma controlada, com capacidade real de observar, corrigir e continuar.


# 13. GATES GLOBAIS DE LANÇAMENTO

| Gate | Nome | Fechamento |
| --- | --- | --- |
| L1 | Produto técnico final | RC estável, instalação/update, offline/recovery, mídia, pagamento, responsividade portrait, acessibilidade, lifecycle, testes físicos e rollback. |
| L2 | Conteúdo e revisão | Conteúdo fechado, narração, revisão bíblica, QA, licenças e proveniência. |
| L3 | Empresa e titularidade | CNPJ, conta empresarial, acordo de sócios, poderes, titularidade e serviços essenciais. |
| L4 | Marca, IP e contratos | Pesquisa/depósito, cessões, contratos, fontes, músicas, artes e arquivos fonte. |
| L5 | Proteção infantil e privacidade | Mapa de dados, minimização, parental gates, documentos, App Privacy, Data Safety e consentimento quando aplicável. |
| L6 | Assinatura e suporte | Compra, renovação, cancelamento, restore, falha, entitlement, troca de aparelho, FAQ e incidentes. |
| L7 | Segurança e continuidade | 2FA, secrets, vulnerabilidades, backups, incident response e inspeção do artefato. |
| L8 | Beta real | Famílias reais e pilotos, sem bloqueador de segurança, dados, compra ou perda de progresso. |
| L9 | Observabilidade | Crash, ANR, pagamentos, restore, downloads, suporte, custos e incidentes com fonte e owner. |
| L10 | Prontidão de distribuição | Materiais e suporte coerentes com o produto real. Não é plano de marketing. |
| L11 | Rollout e rollback | Grupo pequeno, observação, correção e expansão progressiva. |
| L12 | Caixa e operação | Gastos, fluxo de caixa, burn/runway e capacidade de operar o produto. |


# 14. ITENS FORA DO CAMINHO CRÍTICO DO V1

* Landscape adaptativo completo em todo o aplicativo.
* Livro aberto/supporting pane landscape da Página Viva. A arquitetura fica preservada para evolução futura, mas o V1 fecha portrait.
* iPad plenamente adaptativo, multitarefa e Split View.
* Projetor/TV com composição horizontal avançada do Modo Igreja.
* Novas histórias além das 20.
* Backend geral, login infantil, CMS e sincronização cloud ampla.
* Notificações infantis para streak ou presença.
* Ranking de crianças, ligas ou competição espiritual.
* Recompensa econômica/material para embaixadores antes de revisão própria.
* SDK de atribuição invasivo por conveniência.
* Recapa das 20 histórias para uniformizar estilo. Galeria Viva preserva multiestilo.
* Repintar telas que serão substituídas pela F9/F11/F12.


## 14.1 Ideias que não podem voltar silenciosamente

* Ateliê como nome público.
* Bichinhos/Adivinhar Animal/Soletrando como substitutos da lista vigente de jogos.
* Três salvamentos grátis no Criar Livre.
* Bloqueio de salvamento do Colorir narrativo por plano em história legitimamente acessível.
* Paleta paralela de sete cores para status.
* Roxo como cor padrão de Plano Família ou momentos espirituais.
* Página de conclusão dashboard.
* Reader atual como layout final.
* Desbloqueio da próxima história só pela narrativa.
* Preços antigos tratados como definitivos sem gate da F18.


# 15. PROTOCOLO OPERACIONAL PARA CHATGPT, CLAUDE E CODEX


## 15.1 Ao iniciar qualquer sessão

1. Ler docs/DECISIONS.md.
2. Ler o bloco da fase atual neste roadmap v6.
3. Ler o Launch Readiness Lock somente como cross check de lançamento.
4. Declarar a fase, owner do achado e arquivos permitidos antes de escrever código.
5. Confirmar HEAD, branch e git status reais.


## 15.2 Antes de implementar

1. Separar fato, decisão, hipótese e proposta.
2. Verificar se a tela atual vai sobreviver à fase. Se vai morrer, não maquiá-la.
3. Mapear contratos compartilhados e riscos de regressão.
4. Definir focused tests, mutantes quando úteis, smoke e prova física.
5. Se houver dúvida de produto que realmente muda contrato, STOP e Founder Gate.


## 15.3 Durante

* Um bloco causal por vez.
* Tarefas independentes de documentação/auditoria podem rodar em paralelo.
* Não misturar correção de fase futura.
* Sem push/merge sem autorização.
* Sem criar nova arquitetura porque parece mais elegante.


## 15.4 Ao encerrar um bloco

1. Estado inicial e final.
2. Arquivos alterados e motivo.
3. Testes e resultados.
4. Mutantes e evidência de que os testes têm dentes quando aplicável.
5. Evidência física necessária e roteiro completo para o fundador.
6. Achados novos com severidade e fase proprietária.
7. Pendências transferidas, sem escondê-las.
8. git status, HEAD e build manifest quando houver.
9. LAUNCH READINESS CROSS CHECK: itens fechados, pendentes, não pertencentes e confirmação de zero scope creep.


## 15.5 Regra para validação física solo

Quando o fundador precisar gravar vídeo externo sozinho, o roteiro completo deve ser entregue antes de começar. Se ocorrer comportamento inesperado durante uma gravação contínua, parar de interagir, manter a câmera quando possível e reportar em texto pelo computador. Não improvisar uma sequência nova no meio da prova.


# 16. CAMINHO PRÁTICO A PARTIR DE AGORA

Esta é a ordem imediata. Ela transforma o documento em execução sem abrir uma nova discussão de roadmap.

1. F6.0. Migrar a governança do repositório para v6, docs only.
2. F6.1. Reconhecer a baseline real, HEAD, árvore, builds e divergência iOS/Android.
3. F6.2. Corrigir contentViewport, sidebar e safe areas no tablet portrait.
4. F6.3. Consolidar a fundação O Livro Vivo que F7/F9 consumirão, sem redesenhar telas futuras antes da hora.
5. F6.4. Corrigir integridade visual transversal, placeholders e clipping.
6. F6.5. Auditar geometria criativa em portrait.
7. F6.6. Medir performance em build release like e otimizar somente gargalos comprovados.
8. F6.7. Validar contrato portrait em Android 16 e iPhone.
9. F6.8. Gerar Android e iOS canônicos do mesmo HEAD.
10. F6.9. Executar validação física portrait e lacrar F6.
11. F7. Corrigir onboarding/tour, Home e Área dos Responsáveis.
12. F8/F8A. Fechar vozes e áudio antes de transformar A Criação em Livro Vivo na F9.

> **DEPOIS DISSO**
>
> Seguir F9 até F22 na ordem deste documento. Nenhuma nova análise de roadmap é necessária, salvo se surgir um bloqueador real, obrigação legal/loja ou decisão explícita de reversão.


# 17. MATRIZ DE RASTREABILIDADE DAS FONTES INCORPORADAS

| Origem | O que foi incorporado |
| --- | --- |
| ROADMAP v5.0 | Estrutura F0 a F22, portrait V1, CNPJ, build provenance, aprendizagem, Cultinho, presença, referral. |
| ROADMAP v4.1 Delta 08/08 | Story Home V2, Página Viva, Scene Transition Engine, quatro arquétipos, MapAnchor, GameShell. |
| Direção de Arte UX v1.1 | O Livro Vivo, 10 leis, tokens, Fraunces/Nunito, Galeria Viva, ritual, página de cena e Livro. |
| DECISIONS.md vigente, recuperado nas auditorias | Brincar 4 jogos, conclusão total B, Colorir persistente em histórias acessíveis, Criar Livre sem salvar no grátis, Ovelhinha, status cards. |
| Auditoria F6 SG C Verde | Arquitetura responsiva implementada/auditada, HEAD histórico 002872a, gaps de evidência, build tecnicamente autorizável. |
| Launch Readiness Lock | Gates de produto, empresa, IP, privacidade, pagamentos, segurança, beta, observabilidade e rollout. |
| Decisões desta conversa | Portrait V1, tour sem moldura frágil, performance, conclusão sem dashboard, aprendizagem, Meu Momento, Cultinho, presença, prova para pais, presente Davi e Golias. |


## 17.1 O que permanece apenas histórico

* Listas antigas do Brincar que conflitam com E1-BRINCAR-4JOGOS.
* Política antiga de não persistir Colorir narrativo no Plano Grátis.
* Orientação antiga que fazia landscape de tablet ser requisito do V1.
* Roadmaps anteriores como fonte de sequência.
* Layouts atuais destinados a morrer, inclusive conclusão dashboard e Story Reader antigo.


# 18. REFERÊNCIAS EXTERNAS OFICIAIS PARA GATES DE RELEASE

| Fonte | URL | Uso no roadmap |
| --- | --- | --- |
| Apple Developer, Program Enrollment | https://developer.apple.com/help/account/membership/program-enrollment/ | Entidade jurídica, DUNS e requisitos de organização. |
| Apple Developer, D-U-N-S | https://developer.apple.com/help/account/membership/D-U-N-S/ | DUNS para organização. |
| Google Play Console, organization account information | https://support.google.com/googleplay/android-developer/answer/13628312?hl=pt-BR | DUNS e dados de organização. |
| Redesim, Abrir CNPJ | https://www.gov.br/empresas-e-negocios/pt-br/redesim/abrir-cnpj | Fluxo oficial de registro empresarial. |
| Android Developers, orientação e resizability | https://developer.android.com/develop/adaptive-apps/guides/app-orientation-aspect-ratio-resizability | Comportamento de telas grandes e Android 16. |
| Google Play, target API | https://developer.android.com/google/play/requirements/target-sdk | Requisitos atuais de targetSdk. |
| Apple App Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ | Kids, compras, privacidade, links e IAP. |
| Google Play Families Policies | https://support.google.com/googleplay/android-developer/answer/9893335 | Políticas para apps direcionados a crianças. |
| ECA Digital, Lei 15.211/2025 | https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm | Proteção de crianças e adolescentes em produtos digitais. |
| ANPD, ECA Digital | https://www.gov.br/anpd/pt-br/assuntos/eca-digital | Orientações regulatórias e proteção de dados. |
| OWASP MASVS | https://mas.owasp.org/MASVS/ | Referência de hardening e segurança mobile. |


# 19. DECLARAÇÃO FINAL DE CONGELAMENTO

> O objetivo não é avançar rapidamente por uma lista. O objetivo é concluir cada contrato sem criar dívida invisível e sem reabrir decisões já resolvidas.

* Esta v6 substitui o v5.0 como roadmap de execução.
* O Livro Vivo, Story Home V2 e Página Viva agora estão explicitamente protegidos e não podem desaparecer do caminho de lançamento.
* F6 é a fase atual. O primeiro passo é a migração documental F6.0, depois a conclusão portrait.
* Depois de F6, seguir F7 a F22 sem criar fases paralelas.
* Uma reversão futura precisa ser nomeada como REVERSÃO e aprovada pelo fundador.
* Nenhuma IA pode declarar LAUNCH_READY sem fechar todos os gates L1 a L12 e a F21.

> **STATUS FINAL DESTE DOCUMENTO**
>
> PRONTO PARA RATIFICAÇÃO DO FUNDADOR. Após ratificação, executar F6.0 e tornar a v6 a única fonte operacional de sequência.
