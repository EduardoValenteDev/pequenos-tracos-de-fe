/**
 * quizzes.js — Banco de questões de quiz por história.
 *
 * 20 histórias — 8 questões completas cada.
 * Campo `correct` é o índice da opção correta no array `options`.
 */

export const QUIZZES = {

  // ─── Trilha: Comece Aqui ─────────────────────────────────────────────────

  creation: [
    { id: 'creation_q1', question: 'O que havia no começo, antes de Deus criar o mundo?', options: ['Escuridão e vazio', 'Muita luz', 'Animais em todo lugar'], correct: 0 },
    { id: 'creation_q2', question: 'O que Deus disse para fazer a luz aparecer?', options: ['"Haja luz!"', '"Apareça o sol!"', '"Venha a claridade!"'], correct: 0 },
    { id: 'creation_q3', question: 'O que Deus criou no terceiro dia?', options: ['A terra seca e as plantas', 'Os animais do mar', 'O ser humano'], correct: 0 },
    { id: 'creation_q4', question: 'O que foi criado no quarto dia?', options: ['O sol, a lua e as estrelas', 'Os pássaros', 'A terra seca'], correct: 0 },
    { id: 'creation_q5', question: 'O que Deus disse sobre tudo que criou?', options: ['Que era muito bom', 'Que estava quase pronto', 'Que era bonito mas imperfeito'], correct: 0 },
    { id: 'creation_q6', question: 'Quando foi criado o ser humano?', options: ['No sexto dia', 'No primeiro dia', 'No sétimo dia'], correct: 0 },
    { id: 'creation_q7', question: 'O que Deus fez no sétimo dia?', options: ['Descansou e abençoou o dia', 'Criou mais animais', 'Criou o arco-íris'], correct: 0 },
    { id: 'creation_q8', question: 'Por que Deus criou o mundo?', options: ['Com amor e cuidado', 'Para ter um lugar para descansar', 'Por acidente'], correct: 0 },
  ],

  noah: [
    { id: 'noah_q1', question: 'Quem ouviu o aviso de Deus?', options: ['Noé', 'Golias', 'Saul'], correct: 0 },
    { id: 'noah_q2', question: 'O que Noé construiu?', options: ['Uma arca', 'Uma torre', 'Um castelo'], correct: 0 },
    { id: 'noah_q3', question: 'Quem entrou na arca com Noé?', options: ['Sua família e os animais', 'Só os passarinhos', 'Só Noé'], correct: 0 },
    { id: 'noah_q4', question: 'O que Deus colocou no céu como sinal da sua promessa?', options: ['Um arco nas nuvens', 'Uma escada', 'Uma estrela gigante'], correct: 0 },
    { id: 'noah_q5', question: 'O que Noé fez quando saiu da arca?', options: ['Agradeceu a Deus', 'Ficou bravo', 'Foi dormir'], correct: 0 },
    { id: 'noah_q6', question: 'O que essa história nos ensina?', options: ['Deus cuida e cumpre suas promessas', 'Não devemos ajudar ninguém', 'Devemos ter medo da chuva'], correct: 0 },
    { id: 'noah_q7', question: 'Por quanto tempo caiu a chuva?', options: ['Quarenta dias e quarenta noites', 'Sete dias', 'Um ano inteiro'], correct: 0 },
    { id: 'noah_q8', question: 'O que a pombinha trouxe de volta no bico?', options: ['Uma folha de oliveira', 'Um peixe', 'Uma pedra'], correct: 0 },
  ],

  // ─── Trilha: Pequeninos ──────────────────────────────────────────────────

  david_goliath: [
    { id: 'david_q1', question: 'O que Davi cuidava no campo?', options: ['Ovelhas', 'Barcos', 'Cavalos de guerra'], correct: 0 },
    { id: 'david_q2', question: 'Quem era o gigante da história?', options: ['Golias', 'Noé', 'Daniel'], correct: 0 },
    { id: 'david_q3', question: 'Como Davi enfrentou o desafio?', options: ['Com coragem e confiança em Deus', 'Com medo e raiva', 'Fugindo para longe'], correct: 0 },
    { id: 'david_q4', question: 'O que Davi escolheu no riacho?', options: ['Pedrinhas lisas', 'Flores', 'Pães'], correct: 0 },
    { id: 'david_q5', question: 'Davi era grande como Golias?', options: ['Não, mas confiava em Deus', 'Sim, era maior que Golias', 'Não aparece na história'], correct: 0 },
    { id: 'david_q6', question: 'O que essa história nos ensina?', options: ['Com Deus, posso ter coragem', 'Só os grandes vencem', 'Não precisamos confiar em Deus'], correct: 0 },
    { id: 'david_q7', question: 'Por quanto tempo Golias desafiou o exército de Israel?', options: ['Durante muitos dias', 'Só um dia', 'Durante uma semana'], correct: 0 },
    { id: 'david_q8', question: 'Em cujo nome Davi disse que lutava contra Golias?', options: ['Em nome do Senhor dos Exércitos', 'Em seu próprio nome', 'No nome do rei Saul'], correct: 0 },
  ],

  jesus_children: [
    { id: 'jesus_q1', question: 'Quem queria chegar perto de Jesus?', options: ['As crianças', 'Os soldados', 'Os animais'], correct: 0 },
    { id: 'jesus_q2', question: 'O que os discípulos fizeram no começo?', options: ['Tentaram impedir as crianças', 'Chamaram todos para brincar', 'Foram pescar'], correct: 0 },
    { id: 'jesus_q3', question: 'Como Jesus tratou as crianças?', options: ['Com amor e carinho', 'Com distância', 'Com pressa'], correct: 0 },
    { id: 'jesus_q4', question: 'O que Jesus fez com as crianças?', options: ['Abençoou e acolheu', 'Mandou embora', 'Escondeu delas'], correct: 0 },
    { id: 'jesus_q5', question: 'Jesus queria que as crianças chegassem perto?', options: ['Sim, com toda certeza', 'Não', 'Só de longe'], correct: 0 },
    { id: 'jesus_q6', question: 'O que essa história nos ensina?', options: ['Jesus ama e valoriza as crianças', 'Crianças não são importantes', 'Ninguém pode falar com Jesus'], correct: 0 },
    { id: 'jesus_q7', question: 'Como Jesus reagiu quando viu os discípulos impedindo as crianças?', options: ['Ficou indignado e as chamou', 'Concordou com os discípulos', 'Foi embora do lugar'], correct: 0 },
    { id: 'jesus_q8', question: 'O que Jesus disse sobre o Reino de Deus?', options: ['Que pertence a quem tem a fé de uma criança', 'Que é só para os adultos', 'Que é muito difícil de entrar'], correct: 0 },
  ],

  daniel_lions: [
    { id: 'daniel_q1', question: 'Por que Daniel foi jogado na cova dos leões?', options: ['Porque continuou orando a Deus', 'Porque roubou do rei', 'Porque fugiu da cidade'], correct: 0 },
    { id: 'daniel_q2', question: 'O que Deus fez para proteger Daniel?', options: ['Enviou um anjo para fechar as bocas dos leões', 'Fez Daniel invisível', 'Removeu os leões da cova'], correct: 0 },
    { id: 'daniel_q3', question: 'O que o rei fez logo cedo na manhã seguinte?', options: ['Correu até a cova para ver se Daniel estava vivo', 'Mandou trazer outro prisioneiro', 'Pediu para ninguém contar o que aconteceu'], correct: 0 },
    { id: 'daniel_q4', question: 'Quantas vezes por dia Daniel orava?', options: ['Três vezes por dia', 'Uma vez por dia', 'Só nos fins de semana'], correct: 0 },
    { id: 'daniel_q5', question: 'O que Daniel fez quando soube da lei que proibia orar?', options: ['Continuou orando como sempre fazia', 'Parou de orar por medo', 'Fugiu da cidade'], correct: 0 },
    { id: 'daniel_q6', question: 'Como Daniel saiu da cova dos leões?', options: ['Ileso, sem nenhum arranhão', 'Com alguns machucados', 'Ajudado pelos soldados do rei'], correct: 0 },
    { id: 'daniel_q7', question: 'O que o rei Dario declarou depois de ver Daniel livre?', options: ['Que todos reverenciassem o Deus de Daniel', 'Que Daniel era o novo rei', 'Que os leões seriam soltos'], correct: 0 },
    { id: 'daniel_q8', question: 'O que essa história nos ensina?', options: ['Deus protege quem confia Nele', 'Devemos ter medo dos animais', 'Nunca devemos obedecer aos reis'], correct: 0 },
  ],

  jonah_big_fish: [
    { id: 'jonah_q1', question: 'Para onde Deus mandou Jonas ir?', options: ['Para a cidade de Nínive', 'Para Belém', 'Para o deserto'], correct: 0 },
    { id: 'jonah_q2', question: 'Por quanto tempo Jonas ficou dentro do peixe?', options: ['Três dias e três noites', 'Sete dias', 'Um mês'], correct: 0 },
    { id: 'jonah_q3', question: 'O que Jonas fez dentro do peixe?', options: ['Orou a Deus com arrependimento', 'Dormiu o tempo todo', 'Ficou em silêncio'], correct: 0 },
    { id: 'jonah_q4', question: 'O que Jonas fez em vez de obedecer a Deus?', options: ['Fugiu num navio na direção contrária', 'Foi direto para Nínive', 'Ficou parado sem fazer nada'], correct: 0 },
    { id: 'jonah_q5', question: 'Como Nínive reagiu à pregação de Jonas?', options: ['Se arrependeu e pediu perdão a Deus', 'Expulsou Jonas da cidade', 'Não prestou atenção na mensagem'], correct: 0 },
    { id: 'jonah_q6', question: 'O que aconteceu com Jonas depois de três dias no peixe?', options: ['O peixe o deixou em terra seca', 'Foi levado para o fundo do mar', 'Ficou dentro do peixe para sempre'], correct: 0 },
    { id: 'jonah_q7', question: 'O que Jonas aprendeu sobre Deus nessa história?', options: ['Que Deus é cheio de misericórdia com todos', 'Que Deus só perdoa as pessoas boas', 'Que é possível fugir de Deus'], correct: 0 },
    { id: 'jonah_q8', question: 'O que essa história nos ensina?', options: ['Deus nos perdoa e dá segundas chances', 'Devemos ter medo do mar', 'Nunca devemos ir a cidades perigosas'], correct: 0 },
  ],

  lost_sheep: [
    { id: 'lost_q1', question: 'Quantas ovelhas tinha o pastor da parábola?', options: ['Cem ovelhas', 'Dez ovelhas', 'Cinquenta ovelhas'], correct: 0 },
    { id: 'lost_q2', question: 'O que o pastor fez quando percebeu que uma ovelha havia se perdido?', options: ['Deixou as 99 e foi procurar a que se perdeu', 'Esperou ela voltar sozinha', 'Comprou outra ovelha'], correct: 0 },
    { id: 'lost_q3', question: 'O que Jesus diz que acontece no céu quando um pecador se arrepende?', options: ['Há mais alegria do que por 99 que não precisam de arrependimento', 'Não acontece nada especial', 'Os anjos ficam com medo'], correct: 0 },
    { id: 'lost_q4', question: 'Como o pastor trouxe a ovelhinha de volta?', options: ['Nos ombros, com alegria', 'Ela voltou sozinha', 'Amarrada com uma corda'], correct: 0 },
    { id: 'lost_q5', question: 'O que o pastor fez ao encontrar a ovelhinha?', options: ['A abraçou com alegria e a colocou nos ombros', 'A repreendeu por fugir', 'A deixou no campo mais um pouco'], correct: 0 },
    { id: 'lost_q6', question: 'O que o pastor fez ao chegar em casa com a ovelha?', options: ['Chamou amigos e vizinhos para comemorar', 'Guardou a ovelha sozinho', 'Dormiu cansado sem contar para ninguém'], correct: 0 },
    { id: 'lost_q7', question: 'Quem é o "pastor" nessa história que Jesus contou?', options: ['Jesus, que nos busca com amor', 'Um pastor de verdade da Galileia', 'Os discípulos de Jesus'], correct: 0 },
    { id: 'lost_q8', question: 'O que essa história nos ensina?', options: ['Cada pessoa é preciosa para Deus', 'Ovelhas são os animais preferidos de Deus', 'Devemos morar perto de um pastor'], correct: 0 },
  ],

  good_samaritan: [
    { id: 'samaritan_q1', question: 'Quem parou para ajudar o homem ferido no caminho?', options: ['O samaritano', 'O sacerdote', 'O levita'], correct: 0 },
    { id: 'samaritan_q2', question: 'O que o sacerdote e o levita fizeram ao ver o homem ferido?', options: ['Passaram de largo sem ajudar', 'Chamaram mais gente para ajudar', 'Foram buscar remédio'], correct: 0 },
    { id: 'samaritan_q3', question: 'O que Jesus disse ao fim da história?', options: ['"Vá e faça o mesmo"', '"Não se envolva com os problemas dos outros"', '"Cuide só da sua família"'], correct: 0 },
    { id: 'samaritan_q4', question: 'Qual pergunta levou Jesus a contar essa história?', options: ['"Quem é o meu próximo?"', '"Como entro no céu?"', '"Quem é o maior no Reino?"'], correct: 0 },
    { id: 'samaritan_q5', question: 'O que o samaritano usou para cuidar das feridas do homem?', options: ['Azeite e vinho', 'Água e mel', 'Ervas e barro'], correct: 0 },
    { id: 'samaritan_q6', question: 'Para onde o samaritano levou o homem ferido?', options: ['Para uma estalagem', 'Para o templo', 'Para a cidade de Jericó'], correct: 0 },
    { id: 'samaritan_q7', question: 'Que tipo de pessoa era o samaritano?', options: ['Considerado inimigo pelos judeus', 'Um sacerdote importante', 'Um discípulo de Jesus'], correct: 0 },
    { id: 'samaritan_q8', question: 'O que o samaritano prometeu ao estalajadeiro?', options: ['Pagar as despesas extras ao voltar', 'Mandar seus filhos para ajudar', 'Trazer comida no dia seguinte'], correct: 0 },
  ],

  // ─── Trilha: Descobridores ───────────────────────────────────────────────

  abraham_stars: [
    { id: 'abraham_q1', question: 'O que Deus disse a Abraão logo no início da visão?', options: ['"Não tenha medo — Eu sou o seu escudo"', '"Você deve construir um altar"', '"Saia desta terra agora"'], correct: 0 },
    { id: 'abraham_q2', question: 'Qual era a preocupação de Abraão com a promessa de Deus?', options: ['Ele não tinha filhos para herdar', 'Ele não tinha terra suficiente', 'Ele estava com medo dos inimigos'], correct: 0 },
    { id: 'abraham_q3', question: 'O que Deus mostrou a Abraão para falar sobre seus descendentes?', options: ['As estrelas do céu', 'As pedras do chão', 'As folhas das árvores'], correct: 0 },
    { id: 'abraham_q4', question: 'Como Abraão reagiu à promessa impossível de Deus?', options: ['Creu em Deus', 'Pediu um sinal diferente', 'Achou que era impossível e desistiu'], correct: 0 },
    { id: 'abraham_q5', question: 'O que Abraão fez enquanto esperava a promessa de Deus?', options: ['Confiou e esperou diante de Deus', 'Subiu numa montanha alta', 'Desistiu e foi embora'], correct: 0 },
    { id: 'abraham_q6', question: 'O que passou entre os animais para selar a aliança?', options: ['A presença de Deus', 'Abraão com seu cajado', 'Um forte vento de tempestade'], correct: 0 },
    { id: 'abraham_q7', question: 'O que foi contado como justiça para Abraão?', options: ['A fé dele na promessa de Deus', 'Os animais que ele sacrificou', 'O trabalho duro que ele fez'], correct: 0 },
    { id: 'abraham_q8', question: 'O que a história de Abraão nos ensina sobre Deus?', options: ['Deus cumpre Suas promessas mesmo quando parecem impossíveis', 'Precisamos de muita coragem para agradar a Deus', 'Deus só fala com pessoas muito importantes'], correct: 0 },
  ],

  joseph_colorful_coat: [
    { id: 'joseph_q1', question: 'O que o pai de José lhe deu como presente especial?', options: ['Uma túnica especial', 'Uma coroa dourada', 'Um cajado de prata'], correct: 0 },
    { id: 'joseph_q2', question: 'O que José sonhou que causou mais ciúmes nos irmãos?', options: ['Que os irmãos se curvavam para ele', 'Que ele voava acima das nuvens', 'Que ele encontrava um tesouro'], correct: 0 },
    { id: 'joseph_q3', question: 'O que os irmãos de José fizeram com ele por ciúmes?', options: ['Venderam ele como escravo para mercadores', 'Esconderam ele numa floresta', 'Mandaram ele para longe da família'], correct: 0 },
    { id: 'joseph_q4', question: 'Mesmo no Egito como escravo, o que a Bíblia diz sobre José?', options: ['Deus estava com ele em tudo', 'Ele ficou com raiva de Deus', 'Ele perdeu a fé por completo'], correct: 0 },
    { id: 'joseph_q5', question: 'Como José saiu da prisão para o palácio?', options: ['Interpretando o sonho do faraó', 'Fugindo da prisão', 'O rei o libertou por compaixão'], correct: 0 },
    { id: 'joseph_q6', question: 'Por que os irmãos de José foram ao Egito?', options: ['Por causa de uma grande fome', 'Para pedir perdão a José', 'Para visitar o faraó'], correct: 0 },
    { id: 'joseph_q7', question: 'O que José disse aos irmãos quando os perdoou?', options: ['Deus transformou o mal em bem para salvar vidas', 'Vocês ainda vão me pagar', 'Nunca mais nos veremos'], correct: 0 },
    { id: 'joseph_q8', question: 'O que a história de José nos ensina?', options: ['O que é planejado para o mal, Deus pode transformar em bem', 'Devemos guardar rancor de quem nos machuca', 'A vida é sempre fácil para quem ama a Deus'], correct: 0 },
  ],

  moses_red_sea: [
    { id: 'moses_q1', question: 'Por que o povo de Israel saiu do Egito com alegria?', options: ['Deus os havia libertado da escravidão', 'O faraó os convidou a partir', 'Eles conquistaram o exército egípcio'], correct: 0 },
    { id: 'moses_q2', question: 'O que o faraó fez depois de deixar Israel partir?', options: ['Mandou o exército perseguir o povo', 'Pediu que voltassem', 'Ficou contente com a partida'], correct: 0 },
    { id: 'moses_q3', question: 'O que Moisés disse ao povo quando estavam com medo do exército?', options: ['"Não tenham medo — Deus lutará por vocês!"', '"Fujam para o deserto!"', '"Vamos nos entregar"'], correct: 0 },
    { id: 'moses_q4', question: 'O que Deus colocou entre Israel e o exército egípcio?', options: ['A coluna de nuvem', 'Uma muralha de pedras', 'Um rio profundo'], correct: 0 },
    { id: 'moses_q5', question: 'O que Deus mandou Moisés fazer para abrir o caminho?', options: ['Estender a mão sobre o mar', 'Gritar bem alto para o mar', 'Jogar pedras no mar'], correct: 0 },
    { id: 'moses_q6', question: 'Como Israel atravessou o Mar Vermelho?', options: ['Em terra seca com paredes de água dos dois lados', 'Num barco especial', 'Nadando com ajuda dos anjos'], correct: 0 },
    { id: 'moses_q7', question: 'O que aconteceu com o exército egípcio no caminho do mar?', options: ['Deus confundiu os seus carros', 'Chegaram em segurança do outro lado', 'Voltaram ao Egito antes do mar'], correct: 0 },
    { id: 'moses_q8', question: 'O que Miriam e o povo fizeram depois de chegar em segurança?', options: ['Cantaram e dançaram louvando a Deus', 'Voltaram para o Egito', 'Ficaram em silêncio de gratidão'], correct: 0 },
  ],

  ruth_naomi: [
    { id: 'ruth_q1', question: 'O que aconteceu com a família de Noemi em Moabe?', options: ['O marido e os dois filhos morreram', 'Eles ficaram muito ricos', 'Eles voltaram para Belém juntos'], correct: 0 },
    { id: 'ruth_q2', question: 'O que Noemi disse a Rute antes de partir para Belém?', options: ['Que Rute podia voltar para sua própria família', 'Que Rute deveria ficar no Egito', 'Que Rute precisava se casar imediatamente'], correct: 0 },
    { id: 'ruth_q3', question: 'O que Rute disse quando Noemi quis que ela voltasse?', options: ['"Aonde você for, eu irei — seu Deus será o meu Deus"', '"Vou ir embora mas voltarei"', '"Preciso cuidar da minha família primeiro"'], correct: 0 },
    { id: 'ruth_q4', question: 'O que Rute fez para cuidar de si e de Noemi em Belém?', options: ['Foi ao campo apanhar as sobras da colheita', 'Trabalhou como costureira', 'Vendeu as joias que tinha'], correct: 0 },
    { id: 'ruth_q5', question: 'Quem era Boaz e por que ele é importante nessa história?', options: ['Era parente de Noemi e tratou Rute com bondade', 'Era o rei de Belém', 'Era o sacerdote do templo'], correct: 0 },
    { id: 'ruth_q6', question: 'Por que Boaz tratou Rute com tanta bondade?', options: ['Porque soube da lealdade dela com Noemi', 'Porque ela era muito bonita', 'Porque o rei mandou cuidar dela'], correct: 0 },
    { id: 'ruth_q7', question: 'Quem nasceu de Rute e Boaz?', options: ['Obede, avô do rei Davi', 'Samuel', 'Josias'], correct: 0 },
    { id: 'ruth_q8', question: 'O que a história de Rute nos ensina?', options: ['A lealdade e bondade abrem portas que só Deus pode abrir', 'Devemos sempre ficar com nossa própria família', 'A vida é fácil para quem é fiel'], correct: 0 },
  ],

  esther_queen: [
    { id: 'esther_q1', question: 'Como Ester se tornou rainha?', options: ['O rei a escolheu para ser rainha', 'Ela conquistou o trono com seu exército', 'O povo judeu a indicou para o rei'], correct: 0 },
    { id: 'esther_q2', question: 'O que Hamã planejou fazer com o povo judeu?', options: ['Destruir todos os judeus do império', 'Expulsar os judeus da Pérsia', 'Fazer os judeus pagar mais impostos'], correct: 0 },
    { id: 'esther_q3', question: 'O que Mardoqueu disse sobre o propósito de Ester ser rainha?', options: ['"Talvez você chegou ao reino para um momento como este"', '"Aproveite os benefícios de ser rainha"', '"Não se envolva em problemas políticos"'], correct: 0 },
    { id: 'esther_q4', question: 'O que Ester fez antes de ir ao rei sem ser chamada?', options: ['Pediu que todos os judeus jejuassem e orassem por ela', 'Foi direto ao rei sem se preparar', 'Escreveu uma carta para o rei antes'], correct: 0 },
    { id: 'esther_q5', question: 'O que Ester decidiu, mostrando sua coragem?', options: ['Mesmo com medo, decidiu ir falar com o rei', 'Esperar o rei chamá-la primeiro', 'Fugir do palácio em segredo'], correct: 0 },
    { id: 'esther_q6', question: 'O que o rei fez quando viu Ester entrar sem ser chamada?', options: ['A recebeu com favor', 'Ficou muito bravo com ela', 'Mandou os guardas a prender'], correct: 0 },
    { id: 'esther_q7', question: 'O que Ester revelou no banquete que preparou?', options: ['O plano de Hamã de destruir o povo judeu', 'Que ela era filha de um rei', 'Que Mardoqueu era seu tio'], correct: 0 },
    { id: 'esther_q8', question: 'O que a história de Ester nos ensina?', options: ['Deus nos coloca onde estamos por uma razão especial', 'Devemos sempre evitar o perigo', 'A coragem é não ter nenhum medo'], correct: 0 },
  ],

  miraculous_catch: [
    { id: 'miraculous_q1', question: 'O que Pedro e seus amigos fizeram a noite toda antes de Jesus chegar?', options: ['Pescaram a noite toda sem pegar nada', 'Dormiram no barco', 'Consertaram as redes na praia'], correct: 0 },
    { id: 'miraculous_q2', question: 'O que Jesus pediu a Pedro para poder ensinar a multidão?', options: ['Que emprestasse seu barco', 'Que levasse pessoas até Ele', 'Que preparasse comida para todos'], correct: 0 },
    { id: 'miraculous_q3', question: 'O que Jesus mandou Pedro fazer depois de ensinar?', options: ['Remar para o fundo e lançar as redes', 'Voltar para casa descansar', 'Distribuir peixe para o povo'], correct: 0 },
    { id: 'miraculous_q4', question: 'O que Pedro disse antes de obedecer ao pedido de Jesus?', options: ['"Na Tua palavra lançarei as redes"', '"Já tentei e não funcionou"', '"Posso tentar mas não vai dar certo"'], correct: 0 },
    { id: 'miraculous_q5', question: 'O que aconteceu quando Pedro lançou as redes?', options: ['Ficaram tão cheias de peixes que quase rasgaram', 'Vieram alguns peixes pequenos', 'As redes quebraram na corrente'], correct: 0 },
    { id: 'miraculous_q6', question: 'O que Pedro fez ao ver o milagre?', options: ['Caiu de joelhos aos pés de Jesus reconhecendo sua pecaminosidade', 'Correu para contar a todos os pescadores', 'Ficou olhando sem reação'], correct: 0 },
    { id: 'miraculous_q7', question: 'O que Jesus disse a Pedro depois do milagre?', options: ['"De agora em diante você pescará homens"', '"Continue pescando que você é muito bom"', '"Vá vender esses peixes no mercado"'], correct: 0 },
    { id: 'miraculous_q8', question: 'O que Pedro, Tiago e João fizeram ao final?', options: ['Deixaram tudo e seguiram Jesus', 'Venderam os peixes e foram para casa', 'Convidaram Jesus para pescar todo dia'], correct: 0 },
  ],

  // ─── Trilha: Jovens da Fé ────────────────────────────────────────────────

  samuel_hears_god: [
    { id: 'samuel_q1', question: 'O que Samuel fazia no templo?', options: ['Servia a Deus com o sacerdote Eli', 'Pastoreava ovelhas perto do templo', 'Ensinava as crianças do povo'], correct: 0 },
    { id: 'samuel_q2', question: 'Onde Samuel estava quando ouviu a voz de Deus?', options: ['Deitado no tabernáculo, à noite', 'No campo ao amanhecer', 'Em casa com sua mãe'], correct: 0 },
    { id: 'samuel_q3', question: 'Quantas vezes Deus chamou Samuel antes de Eli entender?', options: ['Três vezes', 'Duas vezes', 'Uma vez'], correct: 0 },
    { id: 'samuel_q4', question: 'O que Eli ensinou Samuel a dizer quando ouvisse a voz?', options: ['"Fala, Senhor, o Teu servo ouve"', '"Estou aqui, pode continuar"', '"Vou ouvir se você se identificar"'], correct: 0 },
    { id: 'samuel_q5', question: 'O que Deus falou a Samuel naquela noite?', options: ['Uma mensagem importante sobre a casa de Eli', 'Que Samuel seria rei de Israel', 'Que o templo seria destruído em breve'], correct: 0 },
    { id: 'samuel_q6', question: 'Por que Samuel hesitou em contar a Eli o que ouviu?', options: ['Porque a mensagem era difícil e ele tinha medo', 'Porque havia esquecido as palavras', 'Porque Eli estava dormindo'], correct: 0 },
    { id: 'samuel_q7', question: 'Como Eli reagiu ao ouvir a mensagem de Deus?', options: ['Reconheceu que o Senhor havia falado', 'Disse que a mensagem não era de Deus', 'Mandou Samuel não contar a ninguém'], correct: 0 },
    { id: 'samuel_q8', question: 'O que a história de Samuel nos ensina?', options: ['Devemos ter ouvidos e coração abertos para ouvir Deus', 'Somente os adultos podem ouvir a voz de Deus', 'Deus só fala durante o dia'], correct: 0 },
  ],

  josiah_young_king: [
    { id: 'josiah_q1', question: 'Como Josias era quando se tornou rei?', options: ['Ainda muito jovem', 'Já bem velho', 'Um homem de meia-idade'], correct: 0 },
    { id: 'josiah_q2', question: 'O que a Bíblia diz sobre o comportamento de Josias?', options: ['Que ele fez o que era reto aos olhos do Senhor desde jovem', 'Que ele foi um rei cruel no início', 'Que ele obedecia apenas quando convinha'], correct: 0 },
    { id: 'josiah_q3', question: 'O que Josias mandou fazer com o templo que estava deteriorado?', options: ['Mandou restaurar e reconstruir', 'Mandou demolir e construir um novo', 'Deixou como estava por ser antigo'], correct: 0 },
    { id: 'josiah_q4', question: 'O que foi encontrado durante a restauração do templo?', options: ['O livro da lei de Moisés que estava perdido', 'Um tesouro escondido pelos reis anteriores', 'Antigas pinturas dos profetas'], correct: 0 },
    { id: 'josiah_q5', question: 'Como Josias reagiu quando a lei foi lida para ele?', options: ['Ficou profundamente tocado e arrependido', 'Ficou animado e festejou', 'Mandou guardar o livro na biblioteca'], correct: 0 },
    { id: 'josiah_q6', question: 'O que Josias fez ao ouvir a Lei de Deus?', options: ['Buscou orientação e levou a palavra de Deus a sério', 'Ignorou o que estava escrito', 'Escondeu o livro do povo'], correct: 0 },
    { id: 'josiah_q7', question: 'O que Josias e o povo prometeram a Deus juntos?', options: ['Obedecer a Deus com todo o coração e toda a alma', 'Construir um templo ainda maior', 'Fazer ofertas todo dia'], correct: 0 },
    { id: 'josiah_q8', question: 'O que a Bíblia diz sobre Josias entre todos os reis de Israel?', options: ['Nenhum rei como ele amou a Deus com todo o coração', 'Ele foi o mais rico entre todos os reis', 'Ele foi o rei que mais guerras venceu'], correct: 0 },
  ],

  solomon_wisdom: [
    { id: 'solomon_q1', question: 'Quem era Salomão?', options: ['Filho do rei Davi que se tornou rei de Israel', 'Um profeta de Deus no deserto', 'Um sacerdote que servia no templo'], correct: 0 },
    { id: 'solomon_q2', question: 'O que Deus disse a Salomão no sonho?', options: ['"Pede o que você quiser e Eu darei"', '"Você será um grande guerreiro"', '"Construa um templo para Mim"'], correct: 0 },
    { id: 'solomon_q3', question: 'O que Salomão reconheceu ao se tornar rei?', options: ['Que precisava da ajuda de Deus para governar', 'Que sabia governar sozinho', 'Que era o mais preparado para reinar'], correct: 0 },
    { id: 'solomon_q4', question: 'O que Salomão pediu a Deus?', options: ['Sabedoria para governar o povo com justiça', 'Muitas riquezas e ouro', 'Vitória sobre todos os inimigos'], correct: 0 },
    { id: 'solomon_q5', question: 'Por que Deus ficou contente com o pedido de Salomão?', options: ['Porque ele não pediu coisas para si mesmo', 'Porque era o pedido mais fácil de atender', 'Porque Salomão era o favorito de Deus'], correct: 0 },
    { id: 'solomon_q6', question: 'Além de sabedoria, o que mais Deus deu a Salomão?', options: ['Riqueza e honra que ele não havia pedido', 'Um exército invencível', 'Longa vida de cem anos'], correct: 0 },
    { id: 'solomon_q7', question: 'Como a fama de Salomão chegou a outros povos?', options: ['Pessoas de todo o mundo vinham ouvir sua sabedoria', 'Ele enviou mensageiros para todos os países', 'O faraó espalhou a notícia pelo mundo'], correct: 0 },
    { id: 'solomon_q8', question: 'O que a história de Salomão nos ensina sobre sabedoria?', options: ['A verdadeira sabedoria começa com o amor e o respeito a Deus', 'Sabedoria vem apenas de muitos estudos', 'Só os mais inteligentes recebem sabedoria de Deus'], correct: 0 },
  ],

  mary_says_yes: [
    { id: 'mary_q1', question: 'Quem era Maria e onde ela morava?', options: ['Uma jovem simples de Nazaré prometida a José', 'Uma princesa de Jerusalém', 'Uma sacerdotisa do templo'], correct: 0 },
    { id: 'mary_q2', question: 'Quem Deus enviou para falar com Maria?', options: ['O anjo Gabriel', 'O anjo Miguel', 'Um profeta de Israel'], correct: 0 },
    { id: 'mary_q3', question: 'Como o anjo cumprimentou Maria?', options: ['"Salve, cheia de graça! O Senhor está contigo"', '"Você foi escolhida para uma missão perigosa"', '"Escute — tenho um recado urgente"'], correct: 0 },
    { id: 'mary_q4', question: 'O que o anjo disse para tranquilizar Maria?', options: ['"Não tenha medo — você achou graça diante de Deus"', '"Tudo ficará bem no final"', '"Não precisa fazer nada difícil"'], correct: 0 },
    { id: 'mary_q5', question: 'O que o anjo anunciou a Maria?', options: ['Que ela conceberia e teria um filho chamado Jesus, o Filho de Deus', 'Que ela seria a rainha de Israel', 'Que ela receberia um grande tesouro'], correct: 0 },
    { id: 'mary_q6', question: 'O que Maria perguntou ao anjo?', options: ['"Como isso pode acontecer se ainda não sou casada?"', '"Por que eu fui escolhida?"', '"Quando isso vai acontecer?"'], correct: 0 },
    { id: 'mary_q7', question: 'O que o anjo disse para explicar como seria possível?', options: ['O Espírito Santo viria sobre Maria e para Deus nada é impossível', 'Seria um milagre misterioso que ela não precisava entender', 'Um anjo ajudaria a cuidar da criança'], correct: 0 },
    { id: 'mary_q8', question: 'O que Maria respondeu ao anjo?', options: ['"Eis a serva do Senhor — seja feito em mim conforme a Tua palavra"', '"Preciso pensar mais antes de decidir"', '"Vou conversar com José primeiro"'], correct: 0 },
  ],

  timothy_faith: [
    { id: 'timothy_q1', question: 'Onde a fé de Timóteo começou a ser cultivada?', options: ['Dentro de casa, com sua família', 'Numa escola de Roma', 'Sozinho, sem ninguém'], correct: 0 },
    { id: 'timothy_q2', question: 'Quem foi descrita por Paulo como mulher de fé genuína — avó de Timóteo?', options: ['Loide', 'Eunice', 'Maria'], correct: 0 },
    { id: 'timothy_q3', question: 'Quem era Eunice?', options: ['A mãe de Timóteo, de fé sincera', 'A avó de Timóteo', 'A esposa do apóstolo Paulo'], correct: 0 },
    { id: 'timothy_q4', question: 'Desde quando Timóteo conhecia as Sagradas Escrituras?', options: ['Desde que era ainda bebê e criança', 'Desde que Paulo chegou a Listra', 'A partir dos doze anos'], correct: 0 },
    { id: 'timothy_q5', question: 'O que Paulo reconheceu na vida de Timóteo?', options: ['Uma fé genuína, não fingida, transmitida pela família', 'Uma habilidade especial para pregar', 'Um dom de cura e milagres'], correct: 0 },
    { id: 'timothy_q6', question: 'O que Timóteo se tornou junto do apóstolo Paulo?', options: ['Colaborador de Paulo na obra do evangelho', 'Alguém que recusou o chamado', 'Um soldado do exército romano'], correct: 0 },
    { id: 'timothy_q7', question: 'O que Paulo disse que Timóteo deveria ser, mesmo sendo jovem?', options: ['Um exemplo no falar, no amor, na fé e na pureza', 'Um soldado forte e temido', 'Alguém que esconde sua fé'], correct: 0 },
    { id: 'timothy_q8', question: 'O que a história de Timóteo nos ensina?', options: ['A fé que aprendemos em casa é um tesouro para toda a vida', 'Só os que viajam muito conhecem Deus de verdade', 'A fé é algo que cada um descobre sozinho'], correct: 0 },
  ],

  jesus_temple: [
    { id: 'temple_q1', question: 'Por que a família de Jesus ia a Jerusalém todo ano?', options: ['Para celebrar a Páscoa no templo', 'Para fazer negócios na cidade', 'Para visitar parentes'], correct: 0 },
    { id: 'temple_q2', question: 'Quantos anos tinha Jesus quando ficou no templo?', options: ['Doze anos', 'Oito anos', 'Quinze anos'], correct: 0 },
    { id: 'temple_q3', question: 'Por quanto tempo Maria e José procuraram Jesus?', options: ['Três dias', 'Um dia', 'Uma semana'], correct: 0 },
    { id: 'temple_q4', question: 'Onde Jesus foi encontrado?', options: ['No templo, sentado entre os doutores ouvindo e perguntando', 'Na praça da cidade brincando', 'Na casa de parentes em Jerusalém'], correct: 0 },
    { id: 'temple_q5', question: 'Como as pessoas reagiram às respostas de Jesus?', options: ['Ficaram maravilhadas com Sua sabedoria', 'Acharam que ele era muito jovem para falar', 'Ficaram indiferentes'], correct: 0 },
    { id: 'temple_q6', question: 'O que Maria disse a Jesus quando o encontrou?', options: ['"Seu pai e eu te procuramos angustiados"', '"Você nos assustou muito — nunca mais faça isso"', '"Estávamos com raiva porque você sumiu"'], correct: 0 },
    { id: 'temple_q7', question: 'O que Jesus respondeu a seus pais?', options: ['"Não sabiam que eu preciso estar na casa de meu Pai?"', '"Estava apenas estudando com os doutores"', '"Perdi a hora de voltar — desculpem"'], correct: 0 },
    { id: 'temple_q8', question: 'Como a Bíblia descreve o crescimento de Jesus?', options: ['Crescia em sabedoria, estatura e graça diante de Deus e dos homens', 'Era como qualquer outra criança de Nazaré', 'Crescia rápido demais para sua idade'], correct: 0 },
  ],
};
