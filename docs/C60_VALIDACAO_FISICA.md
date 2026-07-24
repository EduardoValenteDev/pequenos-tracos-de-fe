# C60 · Roteiro de Validação Física — 10 vídeos

**Bloco:** C60 DATA INTEGRITY, COLLECTION REBUILD E FINAL CLOSEOUT
**Piloto:** Colorir com o Beni — história **A Criação** (`creation`), três partes na ordem fechada
**"A primeira luz do mundo"** → **"Plantas, bichos e o mar"** → **"O cuidado de Deus com todos"**.
**Para quem:** o fundador, no **iPhone real** (Dev Client). Cada item abaixo é **um vídeo**.
**Ordem:** os vídeos são **cronológicos** — o estado deixado por um é a pré-condição do seguinte.

> **Por que este roteiro existe.** O smoke prova o **modelo de dados** (contagem, conclusão,
> persistência, reset, reconciliação e geometria da composição) executando as funções reais, e as
> provas foram testadas por **mutação** (quebrei o modelo de propósito para ver as provas ficarem
> vermelhas). Ainda assim, o smoke **não** julga contraste, legibilidade, tamanho de toque, fluidez
> nem "está bonito". As 13 evidências foram levantadas **no aparelho** e é **no aparelho** que elas
> se fecham. Nenhum portão automático substitui os dez vídeos abaixo.

---

## Antes de gravar (uma vez só)

1. Abrir o app no **Dev Client** do iPhone.
2. **Área dos Pais → Administração (dev)**: as ferramentas internas precisam estar **ligadas**
   (o piloto só existe em `__DEV__` com o Modo Criador, ou com a flag do piloto ligada).
3. Confirmar que **A Criação** está acessível na Estante.
4. Gravar sempre a **tela inteira**, sem recortar: cabeçalho, textos e bordas fazem parte do que
   está sendo julgado.
5. Dizer em voz alta o número do vídeo no início ("Vídeo 4, persistência"). Facilita a revisão.

**Duas ferramentas de estado (não confundir):**

| Ferramenta | O que faz | Apaga as artes do disco? |
|---|---|---|
| Bancada → **"Definir 0/1/2/3 de 3"** | ajusta só as **conclusões**; exige **pintura real** para marcar | **Não** |
| Bancada → botão de limpar → **"Limpar"** | chama o **reset canônico** (o mesmo de "Gerenciar dados") | **Sim** |
| Área dos Pais → **Gerenciar dados** (digitar `APAGAR`) | reset de progresso do app **+** o mesmo reset canônico do C60 | **Sim** |

**Convenção de aprovação:** um vídeo só passa se **todos** os itens de "Aprova se" forem
observáveis na gravação. Qualquer item de "Reprova se" invalida o vídeo — e, junto com ele, a
parte correspondente do bloco.

---

## Vídeo 1 — Primeira vez de verdade + "Pronto!" não aceita folha em branco

**Cobre as evidências 8 e 10.** · **Duração alvo:** ~90 s.

**Pré-condição:** estado **zerado de verdade, inclusive as artes em disco** — Bancada → botão de
limpar → **"Limpar"** (ou **Gerenciar dados**).
⚠️ **"Definir 0 de 3" não serve aqui:** ele desmarca as conclusões mas **preserva as artes**, e a
folha abriria já pintada.

**Passos**
1. Abrir **A Criação** e mostrar a seção **"Colorir com o Beni"** (deve dizer **0 de 3**).
2. Abrir a primeira parte e ficar **3 segundos sem tocar em nada**: contorno limpo, paleta e o
   botão **"✓ Pronto!"** visivelmente apagado.
3. Tocar em **"✓ Pronto!"** com a folha em branco.
4. Fechar o aviso e mostrar a paleta.
5. Dar **um toque só** de cor, bem pequeno, e tocar **"✓ Pronto!"** de novo.

**Aprova se**
- Antes de qualquer cor, **"✓ Pronto!"** aparece apagado.
- Ao tocá-lo sem cor, aparece **"Falta um pouquinho de cor"** / "Coloque um pouquinho de cor antes
  de terminar!" — **convite, nunca erro** — e a **paleta pulsa uma vez**.
- Com um respingo minúsculo, a conclusão **continua recusada** (existe piso de pintura).
- Nada foi concluído: ao voltar, a seção continua em **0 de 3**.

**Reprova se**
- "Pronto!" conclui sem pintura, ou aparece alerta com cara de falha/erro.
- A experiência de primeiro uso não pôde ser reproduzida (estado antigo reapareceu).

---

## Vídeo 2 — Concluir a primeira parte (cor e contorno entram juntos)

**Cobre as evidências 5 e 8.** · **Duração alvo:** ~2 min.

**Pré-condição:** o Vídeo 1 (0 de 3, primeira parte aberta).

**Passos**
1. Pintar a primeira parte de forma **claramente visível** (várias áreas, cores diferentes).
2. Tocar **"✓ Pronto!"**.
3. Deixar a celebração aparecer inteira **sem tocar** e ler em voz alta o que está escrito.
4. Mostrar as ações: **"Vamos para a próxima!"** (principal) e **"Terminar depois"**.
5. Tocar **"Terminar depois"**, voltar ao Detalhe de A Criação e mostrar a seção **1 de 3** com o
   selo **"Concluído"** no primeiro passo.
6. Tocar naquele mesmo passo para reabrir a parte e filmar a abertura **desde o primeiro quadro**.

**Aprova se**
- O botão só ficou disponível **depois** de haver cor real.
- A celebração mostra a obra com **cor e contorno na mesma posição**, encaixados.
- Há **um** caminho principal claro; a outra opção é visivelmente secundária.
- Ao reabrir, a pintura está lá, íntegra, e **nenhum quadro** mostrou o contorno sozinho.

**Reprova se**
- A obra aparece sem cor por um instante e depois "recupera" a pintura.
- Cor e contorno aparecem desencaixados em qualquer quadro.

---

## Vídeo 3 — Limpar desenho: existe, avisa antes, e o contador **cai**

**Cobre as evidências 6 e 7.** · **Duração alvo:** ~2 min.

**Pré-condição:** a primeira parte **concluída** (1 de 3) e aberta no editor (fim do Vídeo 2).

**Passos**
1. Mostrar a barra de ferramentas e tocar o botão **Limpar desenho** (ao lado de Borracha,
   Desfazer e Ver tudo).
2. **Ler a confirmação em voz alta** e mantê-la parada por 3 segundos.
3. Tocar **"Continuar colorindo"** (cancelar) e mostrar que **nada** mudou.
4. Tocar **Limpar desenho** de novo e confirmar em **"Limpar desenho"**.
5. Mostrar a folha vazia e o **"✓ Pronto!"** apagado outra vez.
6. Tocar **Desfazer** e mostrar a pintura voltando **inteira, numa única vez**.
7. Limpar de novo (confirmando), voltar ao Detalhe e filmar a seção "Colorir com o Beni".
8. Repintar e concluir a parte de novo (o Vídeo 4 precisa dela concluída).

**Aprova se**
- Existe um caminho **claro e único** para recomeçar a parte (sem apagar cor por cor com a borracha).
- A confirmação diz **"Começar este desenho de novo?"**, "Todas as cores desta parte serão
  apagadas." e — por a parte estar concluída — acrescenta **"Ela sairá da sua coleção até você
  colorir novamente."**: a consequência é dita **antes** de acontecer.
- **Desfazer** restaura tudo em **uma** operação.
- Depois de limpar, a seção volta a **0 de 3** e o passo **perde** o selo "Concluído".

**Reprova se**
- O desenho apagado continua contando como concluído em qualquer superfície.
- Alguma superfície mostra o contorno sozinho no lugar da obra apagada.

---

## Vídeo 4 — A pintura sobrevive ao fechamento do app

**Cobre a evidência 5.** · **Duração alvo:** ~2 min.

**Pré-condição:** **2 de 3** concluídas, com pintura bem visível (conclua a segunda parte antes de
gravar).

**Passos**
1. Mostrar o Detalhe de A Criação com a seção em **2 de 3**.
2. **Fechar o app pelo multitarefa** (matar o processo, não apenas sair da tela).
3. Reabrir o app e voltar a **A Criação**.
4. Abrir a **primeira** parte concluída e filmar **desde o primeiro quadro**.
5. Voltar e repetir com a **segunda**.

**Aprova se**
- As duas obras voltam **com a pintura**, encaixadas no contorno.
- Em nenhuma abertura aparece contorno sem cor antes da pintura.
- A seção continua em **2 de 3**.

**Reprova se**
- Alguma obra volta vazia, trocada de lugar, ou pisca sem cor antes de "recuperar" a pintura.

---

## Vídeo 5 — A grande conclusão das três acontece **uma vez**

**Cobre as evidências 5 e 11 (peso do encerramento).** · **Duração alvo:** ~2,5 min.

**Pré-condição:** **2 de 3** (fim do Vídeo 4), terceira parte por colorir.

**Passos**
1. Colorir e concluir a **terceira** parte.
2. Deixar a **grande conclusão** rodar inteira, sem tocar; filmar de perto as **três obras**.
3. Mostrar as ações: **"Ver meus desenhos"**, **"Voltar à aventura"** e **"Colorir novamente"**.
4. Tocar **"Voltar à aventura"** e mostrar a seção em **3 de 3**.
5. Reabrir **uma** parte já concluída, pintar mais um pouco e tocar **"✓ Pronto!"** de novo.
6. Filmar o que aparece agora e as ações oferecidas.

**Aprova se**
- A grande conclusão mostra as **três** obras coloridas, na mesma proporção e posição.
- A seção diz **3 de 3**.
- Na reedição, **a festa das três não se repete**: aparece a celebração curta, com
  **"Ver minha coleção"**, **"Continuar neste desenho"** e **"Voltar à aventura"**.

**Reprova se**
- A festa grande repete a cada reedição (perde o peso do encerramento).
- Alguma das três obras aparece sem cor na conclusão.

---

## Vídeo 6 — A coleção é uma **tela**, não uma camada sobre o desenho

**Cobre as evidências 1, 2, 3, 4, 12 e 13. É o vídeo mais importante do bloco.**
**Duração alvo:** ~2,5 min. · **Pré-condição:** **3 de 3** (fim do Vídeo 5).

**Passos**
1. **Entrada A:** reeditar uma parte, tocar **"✓ Pronto!"** e sair pela ação **"Ver minha coleção"**.
2. Parar **5 segundos** na coleção sem tocar. Filmar de perto o **fundo** e os **textos**.
3. Tocar **"← Voltar"** e mostrar para onde voltou.
4. **Entrada B:** repetir o passo 1 a partir de **outra** parte (outra atividade de origem).
5. **Entrada C:** Detalhe de A Criação → seção "Colorir com o Beni" → **"Ver minha coleção"**.
6. Comparar as três entradas na gravação, lado a lado se possível.

**Aprova se**
- A coleção ocupa a tela **inteira**, com o título **"Minha Criação Cheia de Cor"**, e o **fundo é
  o mesmo nas três entradas** — não muda conforme a parte de origem.
- **Nenhum** resquício do desenho aberto aparece atrás (nem colorido, nem contorno).
- Todo texto fica sobre **superfície própria**, legível — nunca por cima da arte.
- As três obras têm o **mesmo tamanho e a mesma proporção** (4:5), na ordem do catálogo.
- Voltar leva a um lugar previsível, sem empilhar telas.

**Reprova se**
- Aparece qualquer parte do editor por trás da coleção.
- Fundo, tamanho das obras ou composição mudam conforme a entrada.
- Algum texto fica ilegível sobre a arte.

---

## Vídeo 7 — Abrir as obras: nunca contorno sozinho, venha de onde vier

**Cobre as evidências 4, 5 e 13.** · **Duração alvo:** ~2,5 min. · **Pré-condição:** **3 de 3**.

**Passos**
1. Abrir a coleção e filmar **desde o primeiro quadro**, sem cortar o começo.
2. Na coleção, tocar **"Colorir novamente"** e filmar a abertura da obra desde o primeiro quadro.
3. Voltar ao Detalhe e abrir a **segunda** e a **terceira** partes tocando direto nos passos da
   jornada — filmando cada abertura desde o primeiro quadro.
4. Repetir uma abertura com o iPhone em **modo de baixa energia** (o carregamento fica mais lento
   e expõe o quadro intermediário).
5. Ativar o **modo avião** e repetir uma abertura.

**Aprova se**
- Enquanto a coleção carrega, aparecem **espaços neutros** e a linha "Montando sua coleção..." —
  **nunca** um contorno sem cor que depois "vira" obra.
- Em **nenhum** quadro, de **nenhuma** abertura, o contorno aparece sozinho.
- A composição é **idêntica** vindo da coleção, da celebração ou do Detalhe.
- Sem internet, tudo continua funcionando (é local-first).

**Reprova se**
- Qualquer piscada de contorno sem cor, em qualquer condição.
- A arte muda de tamanho, corte ou posição conforme o caminho de entrada.

---

## Vídeo 8 — A tela pós-história oferece **um** próximo passo

**Cobre a evidência 11.** · **Duração alvo:** ~2 min (três gravações curtas).

**Pré-condições (uma por gravação):** **0 de 3**, **1 de 3** e **3 de 3**, ajustados pela
Bancada com **"Definir 0/1/3 de 3"** — que preserva as artes, então pode ir e voltar à vontade.

**Passos (repetir nos três estados)**
1. Chegar à tela de conclusão de **A Criação**.
2. Filmar o **topo** da tela, sem rolar, por 5 segundos.
3. Só então rolar até o fim, devagar.
4. Tocar no convite do Beni e mostrar onde ele leva.

**Aprova se**
- **No topo**, antes de tudo, aparece a fala do Beni: **"A história terminou. / Agora vamos dar cor
  à Criação?"**, com **um único** botão.
- O rótulo acompanha o progresso real: **"Começar a jornada de cores"** (0 de 3),
  **"Continuar a jornada de cores"** (1–2 de 3), **"Ver minha coleção"** (3 de 3).
- O botão abre exatamente **a próxima parte que falta** (ou a coleção, em 3 de 3).
- Todo o resto (livrinho, quiz, próxima aventura, recompensas) continua na tela, **abaixo**, sob
  **"Veja tudo que você conquistou"**.

**Reprova se**
- O próximo passo não é o primeiro elemento, ou disputa espaço com botões de mesmo peso.
- O botão abre uma parte já concluída em vez da que falta.

---

## Vídeo 9 — "Gerenciar dados" apaga o Colorir 60 de verdade

**Cobre as evidências 9 e 10.** · **Duração alvo:** ~3 min.

**Pré-condição:** **3 de 3** concluídas e a **grande conclusão já vista** (volte a esse estado com
a Bancada, se preciso). Antes de apagar, entre no **Ateliê** e mostre que existe pelo menos um
desenho na **Galeria** — ela é preservada por decisão de produto e serve de controle.

**Passos**
1. Mostrar a coleção com as três obras (o "antes").
2. **Área dos Pais → Gerenciar dados** → digitar **APAGAR** → confirmar.
3. Voltar à Estante, abrir **A Criação** e filmar a seção "Colorir com o Beni".
4. Abrir a primeira parte e mostrar a folha.
5. Pintar rapidamente as **três** partes (um rabisco largo em cada já basta) e concluir.
6. Filmar o que acontece ao concluir a terceira.
7. Abrir o **Ateliê → Galeria** e mostrar que os desenhos continuam lá.

**Aprova se**
- Depois de apagar, a seção volta a **0 de 3**, nenhum passo tem selo "Concluído" e o convite do
  Beni voltou ao estado inicial.
- A primeira parte abre **em branco**: os arquivos da pintura saíram do disco, não só as marcas.
- **A primeira vez volta a ser primeira vez:** ao fechar as três, a **grande conclusão acontece de
  novo**, inteira.
- A **Galeria do Ateliê** continua intacta (o reset de progresso não a apaga).

**Reprova se**
- Alguma parte continua concluída depois do apagamento.
- Alguma pintura antiga reaparece ao abrir uma parte.
- A grande conclusão **não** volta.

---

## Vídeo 10 — A Bancada não fabrica conclusão sem pintura

**Cobre as evidências 8 e 10.** · **Duração alvo:** ~90 s.

**Pré-condição:** disco **sem nenhuma arte guardada** — Bancada → botão de limpar → **"Limpar"**.

**Passos**
1. **Área dos Pais → Bancada · Colorir 60**; mostrar a linha **"Estado atual"**.
2. Tocar **"Definir 3 de 3"** com o disco vazio.
3. Ler o aviso em voz alta e mostrar que o estado **continuou 0 de 3**.
4. Sair, colorir e concluir **uma** parte de verdade.
5. Voltar à Bancada e tocar **"Definir 1 de 3"**.
6. Tocar o botão de limpar e ler a confirmação inteira em voz alta.

**Aprova se**
- Com o disco vazio, a Bancada **recusa** e explica: **"Falta pintura de verdade"**, nomeando as
  partes sem arte.
- Só depois de existir arte real o estado pedido é aplicado.
- A confirmação de limpeza diz explicitamente que usa **o mesmo reset de "Gerenciar dados"** e
  lista o que **não** é tocado (onboarding, perfil, plano, packs, downloads, estrelas, conquistas e
  o progresso das outras histórias).

**Reprova se**
- A Bancada marca "3 de 3" sem três artes — o estado impossível que este bloco veio matar.

---

## Cobertura: evidência física → vídeo

| # | Evidência física relatada | Vídeo(s) |
|---|---|---|
| 1 | Coleção exibida sobre o desenho aberto | 6 |
| 2 | Fundo muda conforme Luz / Vida / Cuidado | 6 |
| 3 | Textos sobre a obra perdem legibilidade | 6 |
| 4 | Composição varia conforme a atividade de origem | 6, 7 |
| 5 | Obras surgem sem cor e depois recuperam a pintura | 2, 4, 5, 7 |
| 6 | Não existe opção clara para limpar todas as cores | 3 |
| 7 | Desenho apagado ainda aceito como concluído | 3 |
| 8 | "Pronto" marca conclusão sem pintura válida | 1, 2, 10 |
| 9 | Gerenciar dados não remove o estado do Colorir 60 | 9 |
| 10 | Não é possível reproduzir a experiência de primeiro uso | 1, 9, 10 |
| 11 | Tela pós-história sobrecarregada, sem o Colorir | 5, 8 |
| 12 | "Ver coleção" repete contraste e sobreposição | 6 |
| 13 | Coleção aparece sobre desenho colorido ou lineart | 6, 7 |

---

## Se algum vídeo reprovar

Anotar **o número do vídeo, o passo exato e o segundo da gravação**. Cada reprovação volta à parte
correspondente do bloco — modelo de dados → Partes 2/4 · limpar → Parte 5 · reset → Parte 6 ·
coleção → Parte 7 · hidratação → Parte 8 · contador → Parte 9 · ponte pós-história → Parte 10 —
porque **não se corrige no visual o que quebrou no dado**.
