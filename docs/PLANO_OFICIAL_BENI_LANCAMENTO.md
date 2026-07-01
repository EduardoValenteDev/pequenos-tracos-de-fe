> ⚠️ **DOCUMENTO SUBSTITUÍDO (SUPERSEDED).** Este documento foi substituído por [`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md`](DOCUMENTO_OFICIAL_PROJETO_FINAL.md) (v2.0). Manter apenas como histórico. Em qualquer conflito, vale o documento oficial final. Mudança principal: **a aba Brincar completa entra no lançamento** (o plano abaixo sugeria MVP sem Brincar).

# Plano Oficial de Produto, Execucao e Lancamento

Projeto: Pequenos Tracos de Fe, com experiencia guiada por Beni
Versao: contexto extremo definitivo
Data: 24 de junho de 2026
Responsavel de produto: Eduardo
Uso deste documento: fonte da verdade para planejamento, prompts ao Claude Code, auditoria de escopo, beta e preparacao de loja.

> Nota de governanca (Fase 0): este documento e a fonte oficial da LINHA DE LANCAMENTO (beta/loja),
> subordinada ao roteiro mestre `docs/PROJECT_SOURCE_OF_TRUTH.md`. Conflitos com o app ja entregue e as
> decisoes finais estao registrados em `docs/launch/DECISOES_E_CONFLITOS.md`; a matriz de acesso final em
> `docs/launch/MATRIZ_DE_ACESSO.md`.

## 1. Regra Central

Este documento consolida as decisoes finais do projeto para a fase de beta e lancamento.

Qualquer implementacao futura deve respeitar estas regras:

1. Um bloco por vez.
2. Um commit por bloco.
3. `git add` seletivo.
4. `smoke` e `expo-doctor` ao fim de cada bloco.
5. Validacao visual do Eduardo antes de avancar para blocos grandes.
6. Sem push sem aprovacao explicita.
7. Nao usar `__DEV__` como regra de acesso.
8. Nao quebrar chaves de storage existentes.
9. Nao alterar rotas, bundle id, package, slug ou scheme sem plano formal de migracao.
10. Nao mover ou renomear assets existentes sem inventario e aprovacao.
11. Nao publicar versiculos, oracoes ou passagens cortadas.
12. Nao adicionar backend, login, notificacoes, analytics, compras reais ou novas permissoes sem bloco proprio e aprovacao.

## 2. Identidade Do Produto

O app deve ser uma experiencia biblica infantil guiada por Beni.

O posicionamento oficial:

1. Historias para viver.
2. Brincadeiras para lembrar.
3. Criacao para expressar.
4. Estrelinhas para celebrar.
5. Plano Familia para liberar o mundo completo do Beni.

O app nao deve parecer um conjunto solto de funcoes. Ele deve parecer um mundo infantil cristao com continuidade entre historias, jogos, colorir, livrinho, conquistas e Beni.

## 3. Navegacao Oficial

A barra inferior oficial deve ter cinco areas:

| Ordem | Aba | Funcao |
|---:|---|---|
| 1 | Inicio | Portal inicial, continuidade da aventura, missao do dia e acesso rapido |
| 2 | Aventuras | Mapa das historias, regioes, progresso e entrada nas historias |
| 3 | Brincar | Jogos, Criar com Beni e Minhas artes |
| 4 | Estrelinhas | Progresso, conquistas, celebracoes e avatares no Plano Familia |
| 5 | Perfil | Meu cantinho, dados locais, Area dos Pais e configuracoes |

Atelie deixa de ser aba principal. A antiga experiencia do Atelie passa a viver dentro de Brincar como a secao Criar com Beni.

## 4. Escopo De Conteudo Para Lancamento

Todas as historias atuais devem entrar no lancamento.

Regras:

1. A Criacao e Noe entram no plano gratis.
2. As demais historias entram no Plano Familia.
3. Todas as historias disponiveis devem estar completas para o usuario.
4. Historia disponivel significa: cenas oficiais, narracao, quiz, Momento com Beni, Livrinho e fluxo de colorir quando aplicavel.
5. Historias futuras aparecem apenas como promessa controlada, sem parecer conteudo quebrado.

## 5. Planos E Acesso

### Plano Gratis

O plano gratis libera:

1. A Criacao.
2. Noe.
3. Narracao das historias gratis.
4. Quiz das historias gratis.
5. Momento com Beni das historias gratis.
6. Livrinho das historias gratis.
7. Colorir cenas das historias gratis.
8. Criar com Beni sem salvar arte.
9. Duas rodadas gratis por dia na aba Brincar.

O plano gratis nao libera:

1. Salvar arte.
2. Galeria funcional de artes salvas.
3. Jogos ilimitados.
4. Historias premium.
5. Narracoes premium.
6. Avatares.
7. Downloads offline premium.

### Plano Familia

O Plano Familia libera tudo:

1. Todas as historias.
2. Todas as narracoes.
3. Todos os quizzes.
4. Todos os Momentos com Beni.
5. Todos os Livrinhos.
6. Brincar ilimitado.
7. Salvar artes.
8. Galeria.
9. Avatares.
10. Conteudo futuro incluido conforme estrategia do produto.
11. Download offline das historias premium apos liberacao do pacote.

### Planos Comerciais

Ofertas oficiais:

1. Mensal.
2. Trimestral.
3. Anual.

Nao oferecer plano vitalicio nesta fase.

Compra, assinatura, restauracao de compra e qualquer link externo devem ficar atras da Area dos Pais com gate parental.

## 6. Estrelinhas E Avatares

Estrelinhas sao progresso e celebracao. Elas nao devem ser apresentadas como dinheiro interno.

Regra:

1. A crianca ganha estrelinhas por concluir experiencias.
2. Estrelinhas iluminam conquistas.
3. Estrelinhas ajudam a comunicar progresso.
4. A crianca nunca gasta estrelinhas.
5. Avatares sao beneficio do Plano Familia.
6. Avatares nao devem ser vendidos diretamente para a crianca.

> Decisao final (ver DECISOES_E_CONFLITOS): avatares sao EXCLUSIVOS do Plano Familia. O plano gratis
> NAO desbloqueia avatares por estrelinhas. Estrelinhas seguem como progresso/celebracao, sem liberar
> avatar no gratis.

## 7. Brincar

A aba Brincar substitui a aba Atelie.

Titulo:

`Brincar com Beni`

Subtitulo:

`Jogos, desenhos e descobertas da Biblia.`

Hierarquia visual:

| Ordem | Secao | Papel |
|---:|---|---|
| 1 | Cabecalho | Identidade da aba |
| 2 | Beni guia | Explica a aba com fala curta |
| 3 | Palavrinhas do Beni | Jogo principal e mais leve |
| 4 | Bichinhos da Biblia | Jogo visual e sonoro |
| 5 | Pares do Beni | Jogo da memoria |
| 6 | Criar com Beni | Desenho guiado e criar livre |
| 7 | Minhas artes | Galeria e salvamento no Plano Familia |

Fala inicial sugerida do Beni:

`Escolha uma brincadeira. Eu te ajudo pelo caminho!`

### O Que Sai De Brincar

`Colorir uma historia` sai da aba Brincar.

Colorir historia continua existindo:

1. Dentro do fluxo das historias.
2. No final da historia.
3. Em pontos contextuais de Aventuras, se fizer sentido.

## 8. Jogos Da Aba Brincar

### 8.1 Palavrinhas Do Beni

Funcao: jogo de montar palavras ligadas a historias, personagens, animais, virtudes e objetos biblicos.

Nome oficial:

`Palavrinhas do Beni`

Modos:

| Nivel | Mecanica | Exemplo |
|---:|---|---|
| 1 | Completar letra | `A R _ A` |
| 2 | Ordenar silabas | `O VE LHA` |
| 3 | Montar letras embaralhadas | letras soltas para formar a palavra |
| 4 | Ouvir e montar | audio fala a palavra |
| 5 | Desafio com bonus de tempo | tempo gera bonus, nao punicao |

Palavras iniciais recomendadas:

| Palavra | Viculo |
|---|---|
| arca | Noe |
| luz | A Criacao |
| Davi | Davi e Golias |
| leao | Daniel |
| ovelha | A Ovelha Perdida |
| peixe | Jonas e A Pesca Milagrosa |
| pao | Jesus e as Criancas ou Bom Samaritano |
| amor | tema cristao infantil |
| fe | Timoteo e temas gerais |
| rei | Ester, Josias e Salomao |
| Maria | Maria e a Boa Noticia |
| Jesus | historias de Jesus |

Regra editorial:

1. Palavra deve ter vinculo com historia, virtude ou aprendizagem infantil.
2. Toda palavra deve ter fala curta do Beni.
3. Nao usar pressao de tempo como derrota.
4. Erro deve gerar dica, nao punicao.

### 8.2 Bichinhos Da Biblia

Funcao: jogo de adivinhar animais com imagem, audio, pistas e ligacao biblica.

Nome oficial:

`Bichinhos da Biblia`

Modo principal:

`Que bichinho e esse?`

Escopo inicial:

1. 15 animais.
2. 15 audios de sons dos animais.
3. Imagens geradas no estilo visual do app.
4. Audio curto e padronizado.
5. Imagens otimizadas.

Niveis:

| Nivel | Mecanica | Revelacao |
|---:|---|---|
| Facil | Animal inteiro aparece | Mostra nome e historia ligada |
| Medio | Som, pista ou imagem parcial simples | Revela animal inteiro depois |
| Dificil | Parte do animal ou pista mais indireta | Revela animal inteiro depois |

Regra tecnica:

1. Nao criar tres imagens por animal para cada nivel.
2. Usar a mesma imagem base e recortar ou mascarar na interface.
3. Usar WebP ou formato leve equivalente.
4. Audios devem ser curtos.
5. Packs futuros devem ser remotos.

Animais iniciais recomendados:

| Animal | Historia ou tema |
|---|---|
| leao | Daniel |
| ovelha | A Ovelha Perdida |
| peixe | Jonas e A Pesca Milagrosa |
| pomba | Noe |
| corvo | Noe |
| jumento | Bom Samaritano |
| camelo | Abraao e contexto biblico |
| passarinho | A Criacao |
| cordeiro | cuidado e linguagem biblica |
| cavalo | reis e jornadas |
| boi | vida no campo e contexto biblico |
| vaca | vida no campo |
| cobra | A Criacao e queda, com cuidado visual |
| burro | jornadas biblicas |
| cabra | vida pastoral biblica |

### 8.3 Pares Do Beni

Funcao: jogo da memoria.

Nome oficial:

`Pares do Beni`

Motivo do nome:

1. Comunica a mecanica de pares.
2. E infantil.
3. Nao parece que o jogo e apenas sobre historias.
4. Permite usar capas, cenas, personagens e objetos futuramente.

Versao inicial:

1. Usar capas atuais das historias.
2. Comecar com poucos pares.
3. Progressao por quantidade de cartas.
4. Pode usar cenas selecionadas no futuro.

Modos:

| Nivel | Cartas | Fonte visual |
|---:|---:|---|
| Facil | 6 cartas | capas |
| Medio | 8 cartas | capas |
| Dificil | 12 cartas | capas e cenas |

Regra:

1. Priorizar performance.
2. Reaproveitar assets existentes.
3. Evitar carregar imagens gigantes.
4. Precarregar apenas as cartas da rodada.

## 9. Regra Das Duas Rodadas Gratis

O plano gratis libera duas rodadas por dia na aba Brincar.

Regra:

1. Contador diario compartilhado por todos os jogos de Brincar.
2. O contador reseta a cada novo dia local.
3. Deve persistir em storage.
4. Deve ser centralizado no controle de acesso.
5. Trocar de tela ou fechar o app nao pode burlar o limite.
6. O limite nao deve depender de `__DEV__`.

Mensagem sugerida quando acabar:

`Voce ja brincou suas rodadas de hoje. Para brincar sem limite, peca para um adulto conhecer o Plano Familia.`

## 10. Criar Com Beni E Minhas Artes

Criar com Beni tem duas opcoes:

1. Desenho guiado pelo Beni.
2. Criar livre.

No plano gratis:

1. A crianca pode desenhar.
2. A crianca nao pode salvar.
3. Antes de abrir a folha, a UI deve avisar com carinho que salvar e beneficio do Plano Familia.

No Plano Familia:

1. Pode salvar.
2. Pode acessar galeria.
3. Pode ver contador e thumbnails.

Nao remover o sistema de salvamento.

Motivo:

1. Remover salvamento nao reduz de forma relevante o tamanho inicial do app.
2. O peso principal vem de assets empacotados, imagens e audios.
3. Salvamento e valor emocional forte para familias.
4. O projeto ja tem caminho tecnico melhor: arquivos no filesystem e metadados no storage.

## 11. Mapa De Aventuras

Todas as regioes atuais devem continuar coerentes com o conteudo disponivel.

Adicionar horizonte de futuro no topo da ultima regiao disponivel.

Texto sugerido:

`Novas aventuras em breve`

Subtexto:

`Beni esta preparando novos caminhos.`

Comportamento:

1. Ao chegar no topo da ultima regiao, a crianca ve o aviso.
2. Ao puxar, aparece o indicador de futuro.
3. Ao soltar, volta suavemente para a ultima regiao disponivel.
4. Nao usar loading tecnico se nada sera carregado.
5. Nao parecer erro de carregamento.

## 12. Livrinho

Livrinho e experiencia emocional central.

Pendencias obrigatorias:

1. Melhorar transicao.
2. Evitar base64 pesado em troca de paginas.
3. Usar arquivos locais quando possivel.
4. Precarregar proxima pagina.
5. Medir antes e depois em build de release.
6. Manter dois modos claros quando aplicavel: historia ilustrada e meu livrinho.

Critico:

1. Nao mexer por tentativa.
2. Seguir a spec ja criada para performance do Livrinho.
3. Validar em dispositivo real.

## 13. Cantinho Com Beni

Regra absoluta:

Nenhum texto biblico, oracao ou passagem pode aparecer cortado de forma enganosa.

Acoes:

1. Revisar todos os textos.
2. Adicionar expansao quando necessario.
3. Diferenciar resumo editorial de citacao biblica.
4. Exibir referencia formal quando houver passagem biblica.
5. Testar em telas pequenas e tablets.

## 14. Onboarding E Guia Do Beni

Onboarding precisa ser claro, curto e visual.

Deve explicar:

1. Aventuras.
2. Brincar.
3. Criar com Beni.
4. Estrelinhas.
5. Plano Familia apenas em linguagem para adulto quando necessario.

Regras:

1. Beni guia sem cobrir elementos importantes.
2. Card do guia nao deve tampar o alvo.
3. Alvo visual deve ser justo.
4. Linha ou destaque nao deve cortar perfil, mapa, cards ou tabs.
5. Deve existir opcao de pular.
6. Deve existir opcao sem voz.
7. Deve existir opcao de rever apresentacao do Beni.

## 15. Peso, Assets E Conteudo Remoto

O app tera narracao completa e muitos assets. Por isso, peso e arquitetura de midia sao prioridade de lancamento.

Decisoes:

1. A Criacao e Noe podem vir completos no binario.
2. Premium deve usar download por historia.
3. Narracoes premium devem ser baixadas sob demanda.
4. Bichinhos da Biblia deve nascer preparado para pack remoto.
5. Packs futuros nao devem inflar o binario.
6. Imagens coloridas devem usar WebP quando aprovado visualmente.
7. Imagens de colorir devem preservar contorno, fundo branco e flood fill.
8. Audios devem ser comprimidos com qualidade suficiente para voz infantil.
9. Volume deve ser padronizado.
10. O app deve medir tamanho real de build, nao apenas tamanho da pasta.

## 16. Compliance Infantil

O app deve ser seguro para criancas e familias.

Regras:

1. Sem anuncio no lancamento.
2. Sem leaderboard publico.
3. Sem chat.
4. Sem conteudo gerado por usuario publico.
5. Sem coleta desnecessaria de dados da crianca.
6. Sem links externos acessiveis para crianca sem gate parental.
7. Compra apenas na Area dos Pais.
8. Politica de privacidade obrigatoria.
9. Data Safety do Google precisa refletir o app real.
10. App Privacy da Apple precisa refletir o app real.
11. Revisar SDKs antes de loja.

## 17. Desenvolvedor Apple E Google

### Apple Developer Program

Momento de aquisicao:

Fase 11, preparacao de beta e loja.

Comprar antes se for necessario testar fluxo real de assinatura em TestFlight ou preparar submissao com antecedencia.

Uso:

1. TestFlight.
2. App Store Connect.
3. Configuracao de produtos de assinatura.
4. App Privacy.
5. Submissao para revisao.

### Google Play Console

Momento de aquisicao:

Fase 11, preparacao de beta e loja.

Comprar antes se for necessario configurar teste fechado, produtos de assinatura e trilha interna.

Uso:

1. Closed testing.
2. Internal testing.
3. Produtos de assinatura.
4. Data Safety.
5. Classificacao etaria.
6. Pedido de acesso a producao, se aplicavel.

Observacao:

Contas pessoais novas do Google Play podem exigir teste fechado com pelo menos 12 testadores por 14 dias continuos antes de producao. Planejar essa janela no cronograma.

## 18. Fases De Execucao

### Fase 0: Congelamento Do Documento Fonte

Objetivo:

Transformar este documento na fonte oficial do projeto.

Entregas:

1. Documento salvo no repo.
2. Decisoes antigas conflitantes marcadas como substituidas.
3. Matriz de acesso final criada.

Aceite:

1. Claude Code consegue seguir o documento sem perguntar regras basicas.
2. Eduardo aprova escopo final.

### Fase 1: Auditoria De Estado Atual

Objetivo:

Saber exatamente o que ja existe, o que esta integrado e o que falta.

Entregas:

1. Inventario de historias.
2. Inventario de cenas.
3. Inventario de paginas de colorir.
4. Inventario de narracoes.
5. Inventario de audios do Beni.
6. Inventario de imagens fora de padrao.
7. Relatorio de peso dos assets.

Aceite:

1. Nenhuma escrita no repo sem aprovacao.
2. Lista de pendencias por historia.

### Fase 2: Regras De Acesso E Plano Familia

Objetivo:

Centralizar a logica de acesso.

Entregas:

1. Matriz gratis e Plano Familia.
2. Bloqueio de salvar arte no gratis.
3. Duas rodadas gratis por dia em Brincar.
4. Avatares apenas no Plano Familia.
5. Premium desbloqueia tudo.

Aceite:

1. Regra nao depende de `__DEV__`.
2. Nao ha regra duplicada espalhada por telas.

### Fase 3: Conteudo De Lancamento

Objetivo:

Fechar historias atuais para lancamento.

Entregas:

1. Todas as historias atuais com status conhecido.
2. Narracoes planejadas e nomeadas.
3. Faltas de imagem listadas.
4. Faltas de colorir listadas.
5. Faltas de Momento com Beni listadas.

Aceite:

1. Nenhuma historia disponivel aparece incompleta para usuario final.

### Fase 4: Performance E Peso

Objetivo:

Reduzir peso e evitar travamentos.

Entregas:

1. WebP aprovado aplicado por lote.
2. Colorir otimizado sem quebrar flood fill.
3. Audio comprimido e padronizado.
4. Conteudo premium preparado para download por historia.
5. Medicao de build real.

Aceite:

1. Build nao cresce sem justificativa.
2. App continua fluido em Android intermediario.

### Fase 5: Correcoes Centrais De UX

Objetivo:

Resolver problemas ja mencionados repetidamente.

Entregas:

1. Cantinho com Beni sem textos cortados.
2. Livrinho com transicao melhor.
3. Mapa com guia e horizonte de futuro.
4. Onboarding revisado.
5. Beni expansivel.
6. Estrelinhas revisadas.

Aceite:

1. Validacao visual em dispositivo.
2. Nenhuma tela central parece improvisada.

### Fase 6: Aba Brincar

Objetivo:

Substituir Atelie por Brincar.

Entregas:

1. Tab renomeada.
2. Tela reorganizada.
3. Beni guia no topo.
4. Cards dos tres jogos.
5. Criar com Beni.
6. Minhas artes com comportamento por plano.

Aceite:

1. Brincar parece uma nova area.
2. Colorir historia nao aparece como opcao da aba.

### Fase 7: Pares Do Beni

Objetivo:

Implementar primeiro jogo.

Entregas:

1. Rodadas com capas atuais.
2. Niveis por quantidade de cartas.
3. Contador de rodada gratis.
4. Recompensa com estrelinhas.

Aceite:

1. Jogo leve.
2. Sem travamento.
3. Respeita limite gratis.

### Fase 8: Palavrinhas Do Beni

Objetivo:

Implementar jogo de palavras.

Entregas:

1. Manifesto inicial de palavras.
2. Niveis de dificuldade.
3. Feedback do Beni.
4. Audio opcional por palavra.
5. Recompensas.

Aceite:

1. Educativo.
2. Biblicamente coerente.
3. Leve.

### Fase 9: Bichinhos Da Biblia

Objetivo:

Implementar jogo de animais.

Entregas:

1. 15 animais.
2. 15 audios.
3. Niveis facil, medio e dificil.
4. Revelacao do animal completo apos acerto ou erro.
5. Pack preparado para expansao remota.

Aceite:

1. Imagens otimizadas.
2. Audios curtos.
3. Nao inflar demais o binario.

### Fase 10: Offline E Packs

Objetivo:

Preparar arquitetura de conteudo pesado.

Entregas:

1. Download por historia.
2. Cache local.
3. Estado baixado, disponivel, baixando e erro.
4. Fallback quando sem internet.
5. Preparacao para packs de animais.

Aceite:

1. Usuario premium pode usar historia baixada offline.
2. App nao quebra quando download falha.

### Fase 11: Contas, Assinaturas E Loja

Objetivo:

Preparar beta externo e lojas.

Entregas:

1. Comprar Apple Developer Program.
2. Comprar Google Play Console.
3. Configurar produtos mensal, trimestral e anual.
4. Preparar TestFlight.
5. Preparar trilha interna ou teste fechado Google.
6. Politica de privacidade.
7. App Privacy.
8. Data Safety.
9. Classificacao etaria.
10. Screenshots.
11. Notas de revisao.

Aceite:

1. Tudo pronto para beta real.
2. Nenhuma compra acessivel sem gate parental.

### Fase 12: Beta Com Familias

Objetivo:

Validar produto antes de loja publica.

Entregas:

1. Roteiro de teste.
2. Teste em iPhone pequeno.
3. Teste em iPad.
4. Teste em Android intermediario.
5. Teste em tablet Android.
6. Teste com pais.
7. Teste com criancas supervisionadas.
8. Lista de bugs por severidade.

Aceite:

1. Sem bloqueador critico.
2. Sem fluxo premium quebrado.
3. Sem texto sagrado cortado.
4. Sem travamento em fluxos principais.

### Fase 13: Lancamento

Objetivo:

Publicar com seguranca.

Entregas:

1. Build final.
2. Submissao Apple.
3. Submissao Google.
4. Revisao de metadata.
5. Plano de suporte.
6. Lista de melhorias pos lancamento.

Aceite:

1. App aprovado.
2. Produto coerente com promessa.
3. Primeiro ciclo de feedback pronto.

## 19. Ordem Pratica Recomendada

Para comecar agora:

1. Aprovar este documento.
2. Enviar este documento ao Claude Code.
3. Pedir auditoria read only da Fase 1.
4. Atualizar matriz de acesso.
5. Corrigir bloqueadores de UX.
6. Implementar Brincar.
7. Implementar Pares do Beni.
8. Implementar Palavrinhas do Beni.
9. Implementar Bichinhos da Biblia.
10. Otimizar midia.
11. Preparar beta.

## 20. Prompt Base Para Claude Code

Use este prompt ao abrir uma nova execucao:

```text
Voce esta trabalhando no app infantil biblico Pequenos Tracos de Fe, guiado por Beni, em React Native e Expo.

Leia o documento docs/PLANO_OFICIAL_BENI_LANCAMENTO.md como fonte da verdade. Nao implemente nada antes de confirmar que entendeu as regras.

Regras obrigatorias:
1. Um bloco por commit.
2. git add seletivo.
3. Rodar smoke e expo-doctor ao fim de cada bloco.
4. Sem push sem aprovacao.
5. Nao usar __DEV__ para acesso.
6. Nao alterar chaves de storage, rotas, bundle id, package, slug ou scheme sem plano de migracao.
7. Nao mover ou renomear assets sem aprovacao.
8. Nao publicar versiculos, oracoes ou passagens truncadas.
9. Nao adicionar backend, login, notificacoes, analytics, compras reais ou novas permissoes sem bloco aprovado.

Primeira tarefa:
Fazer auditoria read only da Fase 1.

Entregar:
1. Inventario de historias.
2. Inventario de cenas.
3. Inventario de paginas de colorir.
4. Inventario de narracoes.
5. Inventario de audios do Beni.
6. Inventario de assets pesados.
7. Lista de pendencias por historia.
8. Riscos para lancamento.
9. Nenhuma escrita no repo.
```

## 21. Criterio Final De Excelencia

O app so deve avancar para loja publica quando:

1. A promessa da loja for igual ao que o app entrega.
2. As duas historias gratis estiverem completas e fortes.
3. Historias premium disponiveis estiverem completas.
4. Narracao estiver integrada conforme escopo.
5. Brincar estiver funcional e limitado corretamente no gratis.
6. Plano Familia liberar tudo corretamente.
7. Nenhum texto biblico estiver truncado.
8. Livrinho estiver fluido.
9. Mapa estiver claro.
10. Onboarding estiver compreensivel.
11. Peso do app estiver sob controle.
12. Politicas de privacidade e dados estiverem coerentes.
13. Beta com familias nao apontar bloqueador critico.

Este documento substitui decisoes anteriores conflitantes da linha de lancamento. Em caso de conflito com o roteiro mestre `docs/PROJECT_SOURCE_OF_TRUTH.md`, ver `docs/launch/DECISOES_E_CONFLITOS.md`.
