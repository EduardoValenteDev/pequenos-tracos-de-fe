# C60 · Roteiro de Validação Física — 17 vídeos + Ajuste Final (V1–V7)

> **Três partes no mesmo roteiro.** **Parte A · Correção Definitiva** = vídeos **1–12** (o texto
> abaixo, com sua introdução, cobertura e relatório de 16 itens — preservados como registro do bloco
> anterior). **Parte B · Marcos Narrativos + Ponte com a Jornada** = vídeos **13–17**, na seção
> seguinte, com introdução e relatório próprios. **Parte C · Ajuste Final dos Marcos** = vídeos
> **V1–V7** (numeração própria do bloco), ao final deste arquivo — cobre os 5 problemas do ajuste
> final e **supersede** dois itens do relatório da Parte B (marco do Cuidado 8→9, retorno 9→10). Onde
> uma parte diz "N vídeos", ela fala **só do seu bloco**.

---

# Parte A · Correção Definitiva — vídeos 1–12

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
- As três obras têm o **mesmo tamanho e a mesma proporção** (4:5), na ordem do catálogo, num **palco
  com acabamento** (superfície própria + prateleira), e a linha discreta **"Toque em uma criação
  para ver de perto."** aparece sob elas — **uma linha, não outro cartão**.
- Com **3 de 3**, o rodapé ancorado traz **uma única** ação — **"Voltar à aventura"**. O antigo botão
  global **"Colorir novamente"** (que sempre abria a primeira parte, Luz) **não existe mais**.
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
2. Na coleção, **tocar em uma obra** (a coleção é o seletor): abre a **prévia ampliada** daquela obra
   — filmar a hidratação da prévia desde o primeiro quadro; depois voltar à coleção pelo **"Voltar"**.
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

---
---

# Addendum — SELEÇÃO VISUAL: a coleção vira seletor + prévia ampliada + redesign

**Incremento:** a coleção **"Minha Criação Cheia de Cor"** passou a ser um **seletor visual** — cada
obra é tocável e abre uma **prévia ampliada da própria obra**, com a rampa para editar. O botão global
**"Colorir novamente"** (que sempre caía em Luz) **saiu**. A tela foi **aprimorada** (galeria
protagonista com palco, Beni integrado, rodapé ancorado) — a ideia aprovada, refinada, **não** trocada.

> **O que o smoke já garante (não precisa reprovar aqui):** que a prévia recebe **só a identidade**
> (`storyId` + `activityId` da vaga) e **relê pela mesma leitura canônica** da coleção (uma fonte de
> verdade); que tocar uma obra navega com o **activityId da própria vaga** (nunca "light"); que a prévia
> **não** repete a grande celebração; e os **estados honestos**. O que **só** o aparelho fecha: o toque,
> a proporção, a legibilidade, a fluidez e o "está bonito". Os vídeos abaixo fecham isso.

**Pré-condição geral:** **3 de 3** concluídas com pintura real (use a Bancada → **"Definir 3 de 3"**
com as artes já pintadas, ou conclua as três de verdade). Grave a **tela inteira**.

## Vídeo A — Cada obra abre a PRÓPRIA prévia (Vida ≠ Luz)

**Duração alvo:** ~2,5 min.

**Passos**
1. Abrir a coleção. Mostrar a linha discreta **"Toque em uma criação para ver de perto."**.
2. Tocar na **segunda** obra (**Vida** — "O mundo cheio de vida"). Filmar a abertura da prévia.
3. Na prévia, ler em voz alta o **título da atividade** mostrado.
4. Voltar pelo **"Voltar"**. Tocar na **terceira** obra (**Cuidado**). Confirmar que abriu **Cuidado**.
5. Voltar e tocar na **primeira** (**Luz**). Confirmar que abriu **Luz**.

**Aprova se**
- Tocar em **Vida** abre a prévia de **Vida** (não Luz); **Cuidado** abre **Cuidado**; **Luz** abre
  **Luz**. **Nunca** "cai" na primeira parte.
- A **área de toque** cobre a obra inteira (não só um cantinho).
- O título de contexto na prévia corresponde à obra tocada.

**Reprova se**
- Qualquer toque abre uma obra diferente da tocada (especialmente "sempre Luz").
- A obra só responde ao toque numa faixa estreita.

## Vídeo B — A prévia ampliada é uma VISTA (não a festa das três), e edita a obra certa

**Duração alvo:** ~2,5 min.

**Passos**
1. Abrir a prévia de uma obra concluída (pela coleção).
2. Ficar **5 segundos sem tocar**. Filmar de perto a **obra**, o **título**, a **moldura** e o **fundo**.
3. Ler a reação curta do Beni (ex.: **"Que obra linda! Olhe de pertinho."**).
4. Tocar **"Editar desenho"**: filmar o editor abrir **na mesma obra**.
5. Pintar mais um pouco, tocar **"✓ Pronto!"** e voltar. Filmar a coleção: **a miniatura daquela
   obra** reflete a edição; as **outras duas não mudam**.

**Aprova se**
- A **arte é a protagonista**: proporção correta, moldura elegante, fundo limpo, margem segura, **sem
  corte** e **nenhum texto por cima da pintura**.
- A ação principal é **"Editar desenho"**; a secundária, **"Voltar"** — ambas **ancoradas**, sempre
  acessíveis.
- **A grande celebração de 3 de 3 NÃO se repete** ao apenas ver ou editar: no máximo a reação curta do
  Beni, numa pose de reconhecimento (não de festa), sem cobrir nem encolher a arte.
- Editar abre **a mesma obra** e, ao salvar, atualiza **a miniatura correta** (as outras intactas).

**Reprova se**
- A festa das três reaparece ao ver/editar uma obra.
- "Editar" abre outra parte, ou o retorno atualiza a miniatura errada.
- Texto por cima da arte, corte, ou moldura que engole a obra.

## Vídeo C — Estados honestos (nunca o contorno sozinho no lugar da obra)

**Duração alvo:** ~2 min. · **Requer o plano Grátis** (para o estado "concluída sem pixels").

**Passos**
1. No estado em que uma parte foi **concluída no Grátis sem guardar os pixels**, abrir a prévia dessa
   parte.
2. Filmar o que a prévia mostra e o rótulo do botão.
3. Se possível, reproduzir o estado **"precisa de cor de novo"** (ponteiro órfão) e abrir a prévia.

**Aprova se**
- Em nenhum estado a prévia mostra **o contorno sozinho** fingindo ser a obra.
- Concluída-sem-pixels ⇒ mensagem honesta (**"Você coloriu esta parte!"**) + botão **"Colorir esta
  parte novamente"** (leva à **mesma** parte).
- "Precisa de cor de novo" ⇒ mensagem honesta (**"Esta parte precisa de cor de novo."**) + o convite
  para a **atividade correta**.
- Cada vaga é **independente**: o estado honesto de uma não afeta as outras.

**Reprova se**
- Aparece contorno sem cor como se fosse a obra concluída.
- Uma parte incompleta é apresentada como concluída, ou o botão leva à parte errada.

## Vídeo D — O redesign da coleção (a ideia aprovada, aprimorada)

**Duração alvo:** ~90 s.

**Passos**
1. Abrir a coleção em **3 de 3** e filmar a tela **inteira**, do topo ao rodapé, sem rolar às pressas.
2. Rolar (se houver rolagem) e mostrar que o **rodapé fica ancorado**.

**Aprova se**
- A **galeria é a protagonista**: as obras num **palco** com acabamento e profundidade (prateleira),
  bem valorizadas, com **boa ocupação de altura** e **sem grandes vazios**.
- O **Beni está integrado** à cena, sobre superfície própria, com a mensagem legível — **nunca** com
  lineart de página ao fundo do texto.
- Os **botões ficam ancorados** no rodapé, sempre acessíveis.
- O clima é **infantil, afetuoso e premium**, e a coleção é claramente um **ambiente de conquista**.

**Reprova se**
- A galeria parece secundária, com muito espaço vazio ou altura mal aproveitada.
- Algum lineart de página aparece atrás de texto.
- Os botões rolam para fora da tela em vez de ficarem ancorados.

---

**Cobertura das 15 provas do incremento (o que o aparelho confirma além do smoke):** toque na área
inteira (A) · id próprio, nunca light (A) · prévia como vista, sem repetir celebração (B) · editar a
obra certa e atualizar a miniatura certa (B) · arte protagonista sem corte/texto por cima (B) ·
estados honestos, nunca contorno sozinho (C) · galeria protagonista, Beni integrado, rodapé ancorado,
sem lineart-fundo (D).

---
---

# Addendum 2 — CORREÇÃO DEFINITIVA DE NAVEGAÇÃO, HIDRATAÇÃO E ACABAMENTO — 12 vídeos

> **Por que este addendum existe.** O bloco **SELEÇÃO VISUAL** acima (vídeos A–D) foi **reprovado
> fisicamente** pelo fundador no iPhone, com **9 evidências concretas**. Este bloco — *Correção
> Definitiva* — corrige **cada uma** delas sem trocar a ideia aprovada: a coleção continua sendo
> seletor e a prévia continua sendo vista; o que muda é a **navegação** (que acumulava telas), a
> **hidratação** (que às vezes abria moldura vazia) e o **acabamento** (topo, moldura, Beni, falas).
> Os vídeos A–D **não são apagados** (ficam como histórico), mas **para revalidar, valem os 12
> vídeos abaixo.** Eles substituem A–D como critério de aceite deste bloco.

**As 9 evidências físicas reprovadas (verbatim resumido):**

| # | Evidência reprovada no aparelho | Vídeo(s) que fecha |
|---|---|---|
| 1 | A navegação **acumula telas**: era preciso apertar "Voltar" muitas vezes para sair | 1, 12 |
| 2 | Na conclusão, **"Voltar à aventura"** ia para uma prévia ampliada, não para **A Criação** | 2 |
| 3 | A coleção "Minha Criação Cheia de Cor" tinha **cara de protótipo** (painel branco, cartões genéricos, bordas artificiais, enquadramento errado/duplo, obras espremidas, barra horizontal inútil, dica solta, Beni isolado, vazios sem propósito) | 3 |
| 4 | O kicker **"SUA CRIAÇÃO DE PERTINHO"** colidia com o "Voltar" do topo, nas 3 prévias | 4 |
| 5 | A prévia tinha **dois "Voltar"** (topo + rodapé) — redundância | 5 |
| 6 | O **Beni + balão** era cortado/coberto pelo rodapé (sem reserva de SafeArea) | 6 |
| 7 | As 3 prévias usavam a **mesma frase genérica** ("Que obra linda! Olhe de pertinho.") | 7 |
| 8 | A prévia de **A Vida**, reaberta, mostrou uma **moldura completamente vazia** | 8 |
| 9 | O enquadramento da arte tinha **borda branca em excesso** — a arte não era protagonista | 9 |

**Limite honesto (o que o smoke já garante e não precisa reprovar no aparelho):** o contrato de
navegação foi **executado** por 12 provas sobre um modelo fiel do stack navigator (pilha não
acumula; "Voltar à aventura" resolve para **A Criação**; a prévia tem um só caminho de volta); a
remontagem por **chave de identidade+pintura**, o **reset atômico** antes do `onLoad`, o **portão de
revelação** (cor **e** contorno juntos) e os **estados honestos** foram provados no fonte; as **falas
por atividade** e o **mapa de cor único** (coleção ↔ prévia) foram provados executando a derivação
real; e **8 controles negativos** quebram cada variante reprovada de propósito para ver a prova
correspondente ficar **vermelha**. O que **só o aparelho fecha**: contraste sobre a arte,
legibilidade, tamanho de toque, fluidez e "está bonito". É o que os 12 vídeos julgam.

**Pré-condição geral:** **3 de 3** concluídas com pintura real (Bancada → **"Definir 3 de 3"** com as
artes já pintadas, ou conclua as três de verdade). Grave sempre a **tela inteira** e diga o número do
vídeo em voz alta no início.

---

## Vídeo 1 (CD) — A navegação **não acumula** telas (evidência 1)

**Duração alvo:** ~2,5 min.

**Passos**
1. Detalhe de **A Criação** → "Colorir com o Beni" → **"Ver minha coleção"**.
2. Na coleção, tocar uma obra → abre a **prévia**. Tocar **"Editar desenho"** → abre o editor **na
   mesma obra**. Tocar **"✓ Pronto!"** → sair por **"Ver minha coleção"**.
3. **Repetir o passo 2 umas 6–8 vezes seguidas**, com obras diferentes.
4. A cada volta à coleção, tocar **uma única vez** em **"Voltar à aventura"** e observar onde cai.
5. Repetir o ciclo mais algumas vezes e, ao fim, tocar **"Voltar à aventura"**.

**Aprova se**
- Depois de muitos ciclos, **um único toque** em "Voltar à aventura" leva a **A Criação** — nunca a
  uma pilha de telas que exige "Voltar" repetido.
- A profundidade percebida **não cresce** ciclo a ciclo (o editor **toma o lugar** da prévia; a
  coleção nunca aparece duplicada).
- O botão físico/gesto de voltar do sistema também chega a um lugar previsível.

**Reprova se**
- É preciso apertar "Voltar" **várias vezes** para sair (a evidência 1 volta).
- Aparecem **duas coleções** empilhadas, ou a prévia fica por baixo do editor.

---

## Vídeo 2 (CD) — "Voltar à aventura" cai **direto em A Criação** (evidência 2)

**Duração alvo:** ~90 s.

**Passos**
1. Concluir (ou reeditar e concluir) uma parte até chegar à **tela de conclusão do editor**.
2. Filmar as ações oferecidas.
3. Tocar **"Voltar à aventura"**.
4. Mostrar, sem cortes, **onde** a tela parou.

**Aprova se**
- "Voltar à aventura" leva **direto ao Detalhe de A Criação** (com o cabeçalho e a capa da história),
  **não** a uma prévia ampliada nem a uma tela intermediária.
- A seção "Colorir com o Beni" reflete o progresso real ao chegar.

**Reprova se**
- Cai numa prévia, na coleção sozinha ou em qualquer tela que **não** seja A Criação.

> **Nota de escopo:** a **tela após "Pronto" não foi redesenhada** neste bloco — só a **navegação das
> ações** foi corrigida. Não julgue aqui o layout dessa tela; julgue apenas **para onde** cada ação
> leva.

---

## Vídeo 3 (CD) — A coleção **sem cara de protótipo** (evidência 3)

**Duração alvo:** ~2 min. **É um dos vídeos centrais deste bloco.**

**Passos**
1. Abrir a coleção em **3 de 3** e filmar a tela **inteira**, do topo ao rodapé, devagar.
2. Parar 5 segundos e ler os textos em voz alta.
3. Se houver rolagem, rolar e mostrar o rodapé.

**Aprova se**
- **Não há** o grande painel branco de antes; **não há** barra horizontal inútil sob as obras;
  **não há** bordas brancas artificiais nem enquadramento duplo.
- As três obras aparecem em **molduras finas e temáticas** (Luz, Vida, Cuidado com cores próprias),
  na proporção **4:5**, **bem ocupadas** — sem ficarem espremidas nem perdidas em vazio.
- O **Beni está integrado** à cena (sobre superfície própria, com a mensagem legível) e a instrução
  **"Toque em uma criação para ver de perto."** é **uma linha discreta**, conectada às obras — não
  um Beni isolado nem um cartão solto.
- O clima é **infantil, afetuoso e premium**; a coleção parece um **ambiente de conquista**, não um
  protótipo.

**Reprova se**
- Reaparece o painel branco, a barra inútil, o enquadramento duplo, as obras espremidas, o Beni
  isolado ou os vazios sem propósito.

---

## Vídeo 4 (CD) — O **topo limpo** da prévia (evidência 4)

**Duração alvo:** ~2 min.

**Passos**
1. Abrir a prévia de **Luz**. Filmar o **topo** por 5 segundos.
2. Voltar; abrir a prévia de **Vida**; filmar o topo.
3. Voltar; abrir a prévia de **Cuidado**; filmar o topo.

**Aprova se**
- Em **nenhuma** das três prévias aparece o kicker **"SUA CRIAÇÃO DE PERTINHO"** colidindo com o
  topo. O cabeçalho é só o **título da atividade** + um **chip de marcador** discreto.
- Nada encosta na área segura do topo (notch/ilha dinâmica) de forma desconfortável.

**Reprova se**
- Reaparece o kicker, ou qualquer texto colide/sobrepõe o topo.

---

## Vídeo 5 (CD) — **Um só "Voltar"** na prévia (evidência 5)

**Duração alvo:** ~90 s.

**Passos**
1. Abrir a prévia de uma obra. Filmar a tela **inteira**, do topo ao rodapé.
2. Apontar (com o dedo, na gravação) todos os caminhos de "voltar" visíveis.

**Aprova se**
- A prévia tem **um único** caminho de volta — a ação **"Voltar"** no **rodapé ancorado** (ao lado de
  **"Editar desenho"**). **Não** existe um segundo "Voltar" no topo.
- O rodapé fica sempre acessível (ancorado, não rola para fora).

**Reprova se**
- Aparece um "Voltar" no topo **e** outro no rodapé (a redundância reprovada).

---

## Vídeo 6 (CD) — O **Beni acima do rodapé**, nunca cortado (evidência 6)

**Duração alvo:** ~2 min.

**Passos**
1. Abrir a prévia de uma obra. Filmar o **Beni e o balão** de fala de perto.
2. Repetir num aparelho/rotação em que o rodapé fique mais alto (ou com fonte do sistema ampliada,
   se possível), para estressar o espaço vertical.

**Aprova se**
- O **Beni e o balão aparecem inteiros**, **acima** do rodapé, sempre — nunca cortados nem cobertos.
- Há **respiro** entre o Beni e o rodapé (reserva de SafeArea/rodapé), em qualquer tamanho de tela.

**Reprova se**
- O Beni ou o balão é cortado, encostado ou coberto pelo rodapé em qualquer condição.

---

## Vídeo 7 (CD) — **Falas por atividade** (evidência 7)

**Duração alvo:** ~2 min.

**Passos**
1. Abrir a prévia de **Luz** e ler a fala do Beni em voz alta.
2. Voltar; abrir **Vida**; ler a fala.
3. Voltar; abrir **Cuidado**; ler a fala.

**Aprova se**
- As três falas são **distintas e específicas**:
  - **Luz** → **"Olha como a sua luz ficou brilhante!"**
  - **Vida** → **"Quanta vida você encheu de cor!"**
  - **Cuidado** → **"Seu cuidado deixou a Criação especial!"**
- **Nenhuma** usa a frase-modelo reprovada ("Que obra linda! Olhe de pertinho.").

**Reprova se**
- Duas ou mais prévias repetem a mesma frase, ou volta a frase-modelo genérica.

---

## Vídeo 8 (CD) — **A Vida reaberta nunca aparece vazia** (evidência 8)

**Duração alvo:** ~2,5 min. **É o vídeo que fecha a evidência mais grave.**

**Passos**
1. Abrir a prévia de **A Vida** e filmar a hidratação **desde o primeiro quadro**.
2. Voltar à coleção e **reabrir A Vida** — repetir **5 vezes seguidas**, sempre filmando o primeiro
   quadro.
3. Repetir uma reabertura com o iPhone em **modo de baixa energia** (carregamento mais lento).
4. Ativar o **modo avião** e reabrir de novo.

**Aprova se**
- Em **nenhuma** reabertura, em **nenhuma** condição, a prévia mostra uma **moldura vazia** ou o
  **contorno sozinho**: ou aparece a **obra composta** (cor **e** contorno juntos, num fade), ou —
  se houver demora — um estado de carregamento honesto que **converge** para a obra.
- Se, por falha real de leitura, a obra não puder abrir, aparece a **mensagem honesta**
  ("Não conseguimos abrir esta criação agora / Suas pinturas continuam guardadas...") — **nunca**
  uma moldura vazia silenciosa.

**Reprova se**
- Qualquer reabertura mostra **moldura vazia**, contorno pelado, ou pisca sem cor antes de "recuperar".

---

## Vídeo 9 (CD) — A **arte protagonista**, moldura fina (evidência 9)

**Duração alvo:** ~90 s.

**Passos**
1. Abrir a prévia de uma obra bem colorida.
2. Filmar de perto a **moldura** e as **margens** da arte.

**Aprova se**
- A arte **preenche a moldura** (moldura **fina e temática**, sem matte/borda branca larga
  empurrando a obra para dentro). A **arte é a protagonista**.
- A proporção é **4:5**, sem corte e sem texto por cima da pintura.

**Reprova se**
- Reaparece a **borda branca em excesso**, ou a moldura "engole" a obra.

---

## Vídeo 10 (CD) — Regressão: **conclusão opaca** e **festa única**

**Duração alvo:** ~2,5 min.

**Passos**
1. Do estado **0 de 3**, concluir a **primeira** parte e deixar a celebração 1/3 rodar inteira.
2. Concluir a **segunda** (2/3) e a **terceira** (3/3), deixando cada conclusão rodar.
3. Reabrir uma parte concluída, pintar um pouco e tocar **"✓ Pronto!"** de novo.

**Aprova se**
- Em 1/3, 2/3 e 3/3 a arte da conclusão entra **100% opaca e legível** — **nunca** semitransparente.
- A **grande festa das três acontece uma vez**; ao **reeditar**, não se repete (no máximo a celebração
  curta com "Ver minha coleção" / "Continuar neste desenho" / "Voltar à aventura").

**Reprova se**
- A arte da conclusão aparece esmaecida, ou a festa grande repete a cada reedição.

---

## Vídeo 11 (CD) — Regressão: **folha em branco não conclui** + reset limpa as **duas** vistas

**Duração alvo:** ~2,5 min.

**Passos**
1. Bancada → **"Limpar"** (reset canônico). Abrir a primeira parte e, **sem pintar**, tocar
   **"✓ Pronto!"**.
2. Mostrar que **nada** concluiu (segue **0 de 3**).
3. Concluir as três de verdade (**3 de 3**).
4. Abrir a **coleção** e a **prévia** de uma obra (mostrar que ambas exibem as artes).
5. **Área dos Pais → Gerenciar dados → APAGAR**.
6. Voltar e abrir de novo a **coleção** e a **prévia**.

**Aprova se**
- Folha em branco **não** conclui (existe piso de pintura real).
- Depois do reset, **tanto a coleção quanto a prévia** refletem o estado limpo (nenhuma obra exposta) —
  as duas vistas assinam o **mesmo** reset canônico.

**Reprova se**
- Folha em branco conclui, ou alguma das duas vistas continua mostrando obra apagada.

---

## Vídeo 12 (CD) — Regressão: cada obra abre **a si mesma** (Vida ≠ Luz) + editar preserva a identidade

**Duração alvo:** ~2 min.

**Passos**
1. Na coleção, tocar em **Vida** → confirmar que abriu **Vida** (título de contexto).
2. Voltar; tocar em **Cuidado** → abriu **Cuidado**. Voltar; tocar em **Luz** → abriu **Luz**.
3. Numa dessas prévias (ex.: Vida), tocar **"Editar desenho"** → confirmar que o editor abriu **na
   mesma obra** (Vida).
4. Pintar mais um pouco, concluir, voltar à coleção — a miniatura **de Vida** reflete a edição; as
   outras **não** mudam.

**Aprova se**
- Cada obra abre **a própria prévia** — **nunca** "cai" sempre em Luz.
- Editar abre **a mesma obra**; ao salvar, atualiza **a miniatura certa** (as outras intactas).

**Reprova se**
- Algum toque abre outra obra (especialmente "sempre Luz"), ou editar troca a identidade.

---

## Cobertura: evidência reprovada → vídeo (Correção Definitiva)

| # | Evidência reprovada | Vídeo(s) |
|---|---|---|
| 1 | Navegação acumula telas | 1, 12 |
| 2 | "Voltar à aventura" não ia para A Criação | 2 |
| 3 | Coleção com cara de protótipo | 3 |
| 4 | Kicker "SUA CRIAÇÃO DE PERTINHO" colidia com o topo | 4 |
| 5 | Prévia com dois "Voltar" | 5 |
| 6 | Beni + balão cortado pelo rodapé | 6 |
| 7 | Falas genéricas iguais nas 3 prévias | 7 |
| 8 | A Vida reaberta com moldura vazia | 8 |
| 9 | Borda branca em excesso na arte | 9 |
| — | Regressão (conclusão opaca, festa única, piso de pintura, reset, identidade) | 10, 11, 12 |

---

## Relatório final do bloco — Correção Definitiva (16 itens)

1. **Escopo.** Corrigir as **9 evidências físicas** reprovadas pelo fundador no iPhone, sem trocar a
   ideia aprovada (coleção-seletor + prévia-vista); só a **navegação**, a **hidratação** e o
   **acabamento** mudaram.
2. **ETAPA 0 — auditoria.** Mapa real de navegação (React Navigation v7 / StackRouter), ciclo de
   hidratação e composição — sem supor comportamento de `popTo`/`replace`/`reset` sem verificar.
3. **ETAPA 1 — contrato único de navegação.** `src/services/coloring60Navigation.js` (novo,
   *untracked*): planejadores puros por **destino semântico** + executor `runC60Nav` com fallbacks;
   nada de `CommonActions`/`replace`/`reset` espalhados por telas.
4. **ETAPA 2 — hidratação atômica.** Chave de remontagem por identidade+pintura, reset síncrono em
   `useLayoutEffect` **antes** do `onLoad`, portão de revelação (cor **e** contorno) e **erro
   honesto** — moldura vazia silenciosa proibida.
5. **ETAPA 3 — redesign da coleção.** Sem painel branco/barra inútil/enquadramento duplo; 3 molduras
   temáticas 4:5, Beni integrado, dica em linha, rodapé ancorado.
6. **ETAPA 4 — redesign da prévia.** Topo limpo (sem kicker), **um só "Voltar"** (rodapé), arte
   protagonista em moldura fina, Beni acima do rodapé, **falas por atividade**, estados honestos.
7. **ETAPA 5 — provas.** **40 provas numeradas** (NAV 01–12 executando o contrato real sobre um modelo
   fiel do navigator; HIDRATAÇÃO 13–22; VISUAL 23–32; REGRESSÃO 33–40) + **8 controles negativos**.
8. **Falsificabilidade.** Os 8 controles negativos **mutam** cada variante reprovada e exigem a prova
   correspondente **vermelha** — nenhuma prova passa por acidente.
9. **Portão smoke.** `npm run smoke` no worktree: **3542/3542** (baseline **3494** + **48** novas);
   **nenhuma** prova antiga removida; smoke final **≥** baseline.
10. **Portão expo-doctor.** **17/18**. A única falha é um **desencontro de patch pré-existente**
    (`expo 54.0.35` vs `~54.0.36` esperado), **alheio** a este bloco (só `scripts/smoke.js` foi
    tocado); dependências são área protegida e **não** foram alteradas.
11. **Sintaxe.** `node --check scripts/smoke.js` OK; os módulos puros (navegação, jornada, tema,
    métricas) são **carregados e executados** pelo próprio smoke, não só lidos.
12. **Áreas não tocadas.** Paywall, progresso, conquistas, `accessControl`, manifestos, histórias e
    **assets** intactos; a **tela pós-"Pronto" não foi redesenhada** (só a navegação das ações);
    **cenas 2/7/8 não foram avançadas**.
13. **Piloto OFF por padrão.** `COLORIR_60_CREATION_PILOT_ENABLED=false`; o piloto só existe em
    `__DEV__`/Modo Criador ou com a flag ligada.
14. **Estados de arquivo (worktree `feat/colorir-60-pilot-creation`).**
    *Modificados* (salvos no disco, **não** indexados): `scripts/smoke.js`,
    `docs/C60_VALIDACAO_FISICA.md`, `src/components/coloring60/Coloring60CompletionOverlay.js`,
    `src/constants/routes.js`, `src/navigation/AppNavigator.js`,
    `src/screens/Coloring60CollectionScreen.js`, `src/screens/ColoringScreen.js`,
    `src/screens/StoryDetailScreen.js`, `src/services/coloring60Journey.js`.
    *Untracked* (salvos no disco, nunca versionados): `src/screens/Coloring60ArtPreviewScreen.js`,
    `src/services/coloring60CollectionReader.js`, `src/services/coloring60Navigation.js`,
    `src/theme/coloring60ActivityTheme.js`. **Nenhum `git add` foi executado.**
15. **Sem commit, sem push.** Aguardando a **validação física** e a **autorização explícita** do
    fundador (conforme instrução).
16. **Sem declaração de aprovação visual.** O smoke prova o **contrato** (navegação, remontagem,
    estrutura, mapa de cor). Contraste, legibilidade, toque e fluidez seguem para o **aparelho**, com
    os **12 vídeos acima**. Este relatório **não** declara aprovação: ela é do fundador, no iPhone.

---
---

# Parte B · Marcos Narrativos + Ponte com a Jornada — vídeos 13–17

**Bloco:** C60 · **RETORNO INSTANTÂNEO À COLEÇÃO, MARCOS NARRATIVOS 2/7/8 E PONTE SEGURA COM A
JORNADA** (a Parte A — retorno instantâneo à coleção — fechou o portão A→B; esta Parte B trata dos
**marcos** e da **ponte**).
**Piloto:** Colorir com o Beni — história **A Criação** (`creation`).
**Para quem:** o fundador, no **iPhone real** (Dev Client). Cada item abaixo é **um vídeo**.

> **O que a Parte B acrescenta.** No meio da história, ao **concluir** certas cenas, o **Beni convida**
> a criança a colorir a parte que combina com o que ela acabou de ver; ao terminar, ela **volta para a
> aventura na PRÓXIMA cena** — não para o desenho fechado nem para a tela da história. E, por baixo, uma
> **ponte só-leitura** faz o colorir do piloto contar como o `coloringComplete` do *journey* global, de
> modo que **A Criação** feche como **Concluída** quando a criança colorir (a produção, com o piloto
> desligado, não muda em nada).
>
> **Decisões do fundador travadas neste bloco:** **Q1 — "próxima cena da história"** (voltar do editor
> retoma na cena X+1: 3, 8 ou 9); **Q2 — "Modal do Beni, com pular"** (o convite é sempre **opcional**;
> "Agora não, continuar" segue a história direto).
>
> **Marcos (fechados):** cena **2 "Haja luz"** → **Luz** → retoma na cena **3 "O céu e as águas"** ·
> cena **7 "Animais da terra"** → **Vida** → retoma na cena **8 "O ser humano"** · cena **8 "O ser
> humano"** → **Cuidado** → retoma na cena **9 "Era muito bom"**. **Nenhuma outra cena** convida.
>
> **O que o smoke já provou (e o que não pode julgar).** As **64 novas provas** (32 provas + 12
> controles negativos + 20 gates) executam o catálogo de marcos, o contrato de navegação e a ponte
> **de verdade** (funções reais), e cada afirmação-chave foi testada por **mutação** (quebrei o modelo
> de propósito para ver a prova ficar vermelha). O smoke **não** julga se o modal do Beni está
> agradável, se a transição entre editor e cena é fluida, se o áudio da cena de retomada toca certo,
> nem se a criança entende o convite. **É isto** que os cinco vídeos abaixo fecham, no aparelho.

## Antes de gravar a Parte B (uma vez só)

1. Abrir o app no **Dev Client** do iPhone, com **Administração (dev)** ligada e o **piloto ativo**
   para **A Criação** (Modo Criador em `__DEV__`, ou a flag do piloto ligada).
2. Estado de partida limpo: Bancada → **"Limpar"** (reset canônico) — a seção **"Colorir com o Beni"**
   deve mostrar **0 de 3** e a história **não** concluída.
3. Gravar a **tela inteira**; dizer o número do vídeo no início ("Vídeo 13, marco da Luz").
4. **Convenção de aprovação:** um vídeo só passa se **todos** os itens de "Aprova se" forem
   observáveis; qualquer item de "Reprova se" invalida o vídeo e a parte correspondente do bloco.

---

## Vídeo 13 — Marco da **Luz** (cena 2): convite do Beni → colorir → retomada na **cena 3**

**Cobre:** interceptação (Q2), abertura por marco pelo contrato, retomada na próxima cena (Q1).
**Duração alvo:** ~2 min.

**Passos**
1. Abrir **A Criação** e entrar na narração. Avançar até a **cena 2 "Haja luz"**.
2. Tocar em **concluir a cena**; deixar a **celebração** aparecer e tocar em **continuar**.
3. Observar o **modal do Beni** com o título **"Que luz linda!"** e dois botões: **"Colorir agora"** e
   **"Agora não, continuar"**.
4. Tocar em **"Colorir agora"**: o **editor** abre já na parte **Luz** (contexto correto, não outra
   obra). Colorir o suficiente e tocar **"✓ Pronto!"**.
5. Ver a recompensa/festa de conclusão e tocar no **único** botão **"Voltar à aventura"**.

**Aprova se**
- O modal aparece **depois** da celebração da cena 2, com a fala **da Luz** (não um texto genérico).
- "Colorir agora" abre o editor **na parte Luz**; a tela do editor mostra **só** "Voltar à aventura"
  (sem "Ver minha coleção" nem outros botões neste fluxo de marco).
- "Voltar à aventura" leva à **cena 3 "O céu e as águas"** — a **próxima** cena — com a narração e o
  **áudio da cena 3** tocando do começo (mount fresco), **sem** voltar ao desenho nem à tela da história.
- A pilha **não** incha: dá para sair da história normalmente depois (sem telas empilhadas de sobra).

**Reprova se**
- O convite não aparece na cena 2, ou aparece com fala genérica.
- O editor abre em outra parte (ex.: "sempre Luz" seria correto **aqui**, mas conferir a fala/contexto).
- "Voltar à aventura" cai na cena 2 de novo, na tela da história, no desenho fechado, **ou** monta a
  cena 3 com **áudio preso** da cena anterior.

---

## Vídeo 14 — **Pular** o convite (cena 7): "Agora não, continuar" segue a história **sem** editor

**Cobre:** o convite é **opcional** (Q2); pular = o avanço de sempre.
**Duração alvo:** ~90 s.

**Passos**
1. Continuar de onde parou (ou avançar) até a **cena 7 "Animais da terra"**.
2. Concluir a cena, deixar a celebração e tocar em **continuar**.
3. No **modal do Beni** ("Quanta vida!"), tocar em **"Agora não, continuar"**.

**Aprova se**
- O modal da **Vida** aparece na cena 7.
- "Agora não, continuar" **fecha o convite** e vai **direto** para a **cena 8 "O ser humano"** — **sem**
  abrir o editor e **sem** deixar o modal reaparecer.
- A seção "Colorir com o Beni" **não** muda de contagem por ter pulado (pular não conclui nada).

**Reprova se**
- Pular abre o editor, trava a história, ou o modal reabre sozinho ao chegar na cena 8.

---

## Vídeo 15 — Marco do **Cuidado** (cena 8) → retomada na **cena 9**; cenas **não-marco não convidam**

**Cobre:** terceiro marco + a **ausência** de convite nas cenas comuns.
**Duração alvo:** ~2,5 min.

**Passos**
1. Concluir a **cena 8 "O ser humano"**; no modal **"Quanto carinho!"**, tocar **"Colorir agora"**.
2. Colorir a parte **Cuidado**, concluir e tocar **"Voltar à aventura"** → deve retomar na **cena 9
   "Era muito bom"**.
3. Para contraste, concluir uma cena **comum** — por exemplo a **cena 4 "A terra e as plantas"** (ou
   1, 3, 5, 6, 9, 10): tocar em concluir, celebração, **continuar**.

**Aprova se**
- Cena 8 convida com a fala do **Cuidado** e "Voltar à aventura" leva à **cena 9**.
- A cena comum (4 ou outra não-marco) **NÃO** mostra o modal do Beni: a história segue direto, como
  sempre foi. Só **2, 7 e 8** convidam.

**Reprova se**
- A cena 8 não convida, retoma na cena errada, ou **alguma** cena não-marco mostra o convite.

---

## Vídeo 16 — **Ponte com a jornada:** colorir **fecha** "A Criação"; **0 colorido** não fecha

**Cobre:** a ponte só-leitura alimenta o `coloringComplete` do *journey* global (regra "pelo menos 1").
**Duração alvo:** ~3 min.

**Passos**
1. Bancada → **"Limpar"**. Levar a história a ter **cenas vistas + Livrinho + quiz + reflexão**
   **concluídos**, mas com **0 de 3** no Colorir. Mostrar que **A Criação NÃO** aparece como
   **Concluída** (e a próxima da sequência **não** liberou).
2. Colorir **pelo menos uma** das partes (por um marco ou pela seção "Colorir com o Beni").
3. Voltar à **Estante/história** e observar o estado.

**Aprova se**
- Com **0** partes coloridas, mesmo com todo o resto pronto, **A Criação não fecha** (o colorir é
  fator real da conclusão).
- Ao colorir **≥ 1** parte, **A Criação passa a "Concluída"** e a **próxima** história da sequência
  **libera** — sem precisar fechar/reabrir o app (basta voltar/focar a tela).
- Um erro **transitório** de leitura (se acontecer) **não** apaga uma conclusão já obtida (a história
  não "desconclui" sozinha ao reabrir).

**Reprova se**
- A história fecha **sem** nenhum colorir, **ou** não fecha mesmo depois de colorir, **ou** um reabrir
  apaga a conclusão já conquistada.

---

## Vídeo 17 — Não-regressão: **produção (piloto OFF)** e **saída honesta** sem história

**Cobre:** a produção não muda; a retomada nunca inventa cena/atalho.
**Duração alvo:** ~2 min.

**Passos**
1. **Desligar o piloto** (Modo Criador off / flag off) para "A Criação" e reabrir a história.
2. Concluir a **cena 2** normalmente: celebração e **continuar**.
3. (Opcional, dev) Abrir o editor de uma parte por uma **entrada de dev** (sem a história na pilha) e
   usar **"Voltar à aventura"**.

**Aprova se**
- Com o piloto **OFF**, a cena 2 **NÃO** mostra o convite do Beni: o fluxo é **idêntico** ao de
  produção de sempre (colorir por cena legado, se aplicável).
- Numa entrada **sem história embaixo**, "Voltar à aventura" faz uma **saída honesta** (volta à raiz do
  piloto), **nunca** monta uma narração sem história nem "chuta" uma cena.

**Reprova se**
- O convite aparece com o piloto desligado, ou a saída sem história trava/abre uma narração inventada.

---

## Cobertura Parte B: comportamento → vídeo

| Comportamento (Parte B) | Vídeo(s) |
|---|---|
| Convite do Beni intercepta a conclusão da cena-marco (Q2) | 13, 14, 15 |
| "Colorir agora" abre o editor **na parte certa**, pelo contrato central | 13, 15 |
| "Voltar à aventura" retoma na **próxima cena** (Q1: 3/8/9), mount fresco | 13, 15 |
| Convite é **opcional**: "Agora não, continuar" segue a história | 14 |
| Cenas **não-marco** nunca convidam | 15 |
| Ponte: colorir fecha **A Criação** como Concluída (≥ 1 parte) | 16 |
| Ponte: falha de leitura **não** apaga conclusão (≠ zero de três) | 16 |
| Produção (piloto **OFF**) inalterada | 17 |
| Retomada sem história = **saída honesta** (nunca cena inventada) | 17 |

---

## Relatório final — Parte B · Marcos Narrativos + Ponte (19 itens)

1. **Escopo.** Adicionar, **só em "A Criação"**, os **marcos narrativos 2/7/8** (o Beni convida a
   colorir ao concluir a cena) e a **ponte só-leitura** que faz o colorir do piloto contar como o
   `coloringComplete` do *journey* global. **Nada** de marcos em Noé ou em outras histórias.
2. **Gate A→B respeitado.** A **Parte A** (retorno instantâneo à coleção) fechou primeiro; a Parte B
   só começou depois, sem reabrir a Parte A.
3. **Decisão Q1 (retorno).** "Voltar à aventura" do editor de marco retoma na **próxima cena**
   (`resumeScene = unlockAfterScene + 1` ⇒ 3/8/9), via `resumeCenaIndex = resumeScene − 1` na fronteira
   da tela. Fórmula do índice provada em ambos os sentidos (0-based ↔ 1-based).
4. **Decisão Q2 (convite).** **Modal do Beni** interceptando a conclusão da cena, **sempre com pular**;
   o skip é exatamente o `goToNext` de antes. O convite **não** cria estado novo: é **derivado** de a
   cena ter sido concluída.
5. **B1 — catálogo puro** `src/data/coloring60StoryMilestones.js` (*untracked*): mapa fechado
   cena→atividade→retorno, `Object.freeze` em todos os níveis, **livre de imports**, **sem fallback
   para "light"**; falas do convite por atividade, **sem emoji** no corpo.
6. **B2 — contrato central** `src/services/coloring60Navigation.js` (*untracked*, estendido): novos
   planejadores **puros** `planC60OpenEditorFromMilestone` e `planC60ResumeStory` + os wrappers
   `c60OpenEditorFromMilestone`/`c60ResumeStoryAfterMilestone` e a origem `STORY_MILESTONE`. **Nenhuma
   tela** decide navegação de marco por conta própria.
7. **B3 — interceptação** na `NarrationScreen.js` (*modificado*) + componente
   `Coloring60MilestoneInvite.js` (*untracked*): o convite só é derivado no **piloto**
   (`creationColoringHidden ? getColoring60MilestoneForCompletedScene(story?.id, numeroCena) : null`);
   Beni **feliz**, botão "pular" **silencioso**, `onRequestClose` = pular (nunca beco sem saída).
8. **B4 — saída do editor por marco** na `ColoringScreen.js` (*modificado*): `c60MilestoneFlow`
   derivado de `origin === STORY_MILESTONE` **e** índice inteiro ≥ 0; a tela reenquadra o *journey*
   para um **único** "Voltar à aventura" e **retoma a história ANTES** do `c60ExitToStory` padrão.
9. **B5 — ponte só-leitura** `src/services/storyColoringCompletion.js` (*untracked*): traduz a jornada
   Colorir 60 em `coloringComplete` com a **mesma** regra do *journey* ("pelo menos 1"). **Nunca lança**;
   **falha de leitura = READ_FAILED**, um estado **distinto** de "0 de 3" — o chamador **preserva** o
   valor anterior, jamais força `false`. **Não** usa `hasEverCompleted`.
10. **B6 — fiação da ponte.** `ProgressContext.js` (*modificado*) reconcilia o `coloringDone` da
    história no `loadAll` via `applyCreationColoringToSet`; `StoryDetailScreen.js` (*modificado*) usa a
    ponte no piloto e **ignora READ_FAILED** (só grava quando `applicable && !readFailed`).
11. **Fórmula global intacta.** `storyJourneyService` continua com
    `journeyComplete = scenesComplete && bookOpened && quizDone && reflectionDone && coloringComplete`;
    a ponte **troca a FONTE** do sinal de `creation`, **não** a fórmula nem o limiar.
12. **B10 — provas (32) + controles (12) + gates (20) = 64 novas** em `scripts/smoke.js` (*modificado*):
    catálogo, contrato, ponte e fiação executados **de verdade** (módulos puros avaliados; telas por
    varredura de fonte com âncoras byte-exatas).
13. **Falsificabilidade.** Os **12 controles negativos** **mutam** cada garantia (invariante do retorno,
    no-fallback, `origin` obrigatório, activityId real, guard de índice, limiar `>= 1`, gate do piloto,
    preservação no READ_FAILED, `resumeScene − 1`, interceptação, guard e reframe da ColoringScreen) e
    exigem a prova correspondente **vermelha** — nenhuma passa por acidente.
14. **Correspondência com stories.js.** Provas cruzam os títulos reais: **Luz@2 = "Haja luz"**,
    **Vida@7 = "Animais da terra"**, **Cuidado@8 = "O ser humano"**; e as cenas de retorno **3/8/9**
    existem e **não** são a última.
15. **Portão smoke.** `node scripts/smoke.js` no worktree: **3633/3633, 0 falhas** (baseline **3569** +
    **64** novas). Acima do piso exigido (**≥ 3542**); **nenhuma** prova anterior removida ou
    enfraquecida.
16. **Áreas não tocadas / não avançadas.** **Sem** marcos em Noé/outras histórias; **sem** assets ou
    imagens gerados; **sem** dependências novas; paywall/progresso/conquistas/`accessControl`/manifestos
    intactos; a **fórmula global** não mudou; **produção com piloto OFF** inalterada.
17. **Estados de arquivo — Parte B (worktree `feat/colorir-60-pilot-creation`, HEAD `c20e222`).**
    *Modificados* (salvos no disco, **não** indexados): `scripts/smoke.js`,
    `docs/C60_VALIDACAO_FISICA.md`, `src/screens/NarrationScreen.js`, `src/screens/ColoringScreen.js`,
    `src/screens/StoryDetailScreen.js`, `src/context/ProgressContext.js`.
    *Untracked* (salvos no disco, nunca versionados): `src/data/coloring60StoryMilestones.js`,
    `src/services/storyColoringCompletion.js`, `src/components/coloring60/Coloring60MilestoneInvite.js`
    e o `src/services/coloring60Navigation.js` (criado na Parte A, **estendido** aqui).
    **Nenhum `git add` foi executado; nada está indexado/staged.** (Os demais arquivos modificados e
    untracked do worktree — Overlay, rotas, navigator, coleção, prévia, temas — são da **Parte A**.)
18. **Sem commit, sem push, sem git add.** Aguardando a **validação física** e a **autorização
    explícita** do fundador (conforme instrução do bloco).
19. **Sem declaração de aprovação visual.** O smoke prova o **modelo e o contrato**; convite, transição,
    áudio de retomada e clareza do fluxo seguem para o **aparelho**, com os **vídeos 13–17 acima**. Este
    relatório **não** declara aprovação: ela é do fundador, no iPhone.

---

# Parte C · Ajuste Final dos Marcos — vídeos V1–V7

**Bloco:** C60 AJUSTE FINAL DOS MARCOS NARRATIVOS, CTA CONTEXTUAL, CONVITE UNIFICADO E MENSAGEM
PÓS-HISTÓRIA. **Piloto:** Colorir com o Beni — história **A Criação** (`creation`).
**Para quem:** o fundador, no **iPhone real** (Dev Client). Cada item é **um vídeo** (V1–V7).
**Ordem:** cronológica — o estado de um vídeo é a pré-condição do seguinte.

> **Por que esta parte existe.** Não é um redesenho — é o **ajuste dos 5 problemas provados** no
> aparelho: (1) o terceiro marco caía cedo demais; (2) o botão de conclusão dentro da história não
> era contextual; (3) apareciam **dois** modais (festa + convite) na cena-marco; (4) a mensagem
> pós-história não acompanhava o quanto já foi colorido; (5) o retorno à coleção precisava ser
> reauditado. O smoke prova o **modelo e os textos por mutação** (3654/3654); estes sete vídeos
> julgam o que o smoke não julga: tempo, clareza, ausência de "piscar" e a sensação de continuidade.

> **Supersede o registro anterior.** Esta parte **atualiza** dois itens do relatório da Parte B: o
> marco do **Cuidado** passou da **cena 8 para a cena 9** e o retorno de **9 para 10** (Parte B, itens
> 3 e 14 — onde se lia "Cuidado@8" e "retornos 3/8/9", leia-se **"Cuidado@9"** e **"3/8/10"**). Os
> marcos de **Luz@2→3** e **Vida@7→8** seguem inalterados. Nenhuma outra decisão da Parte B muda.

## Antes de gravar (Parte C)

Mesma preparação da Parte A (Dev Client, ferramentas internas ligadas, **A Criação** acessível,
gravar a tela inteira, dizer o número do vídeo em voz alta). As mesmas duas ferramentas de estado
valem aqui (**"Definir 0/1/2/3 de 3"** ajusta só conclusões; **"Limpar"**/**Gerenciar dados** é o
reset canônico que apaga as artes do disco). Para reencenar o **primeiro convite**, é preciso
**"Limpar"** — só ele zera a memória do convite por marco (`coloring60MilestoneInviteSeen`).

---

## Vídeo V1 — **Terceiro marco na cena 9** (Problema 1)

**Duração alvo:** ~2,5 min.

**Pré-condição:** **"Limpar"** (reset canônico) — história e convites zerados.

**Passos**
1. Abrir **A Criação** e avançar a narração até concluir a **cena 8** ("O ser humano").
2. Mostrar que a **cena 8 termina normalmente** — a história segue para a cena 9 **sem** convite de colorir.
3. Concluir a **cena 9** ("Era muito bom").
4. Quando o convite do Beni aparecer, tocar **"Colorir agora"**, concluir a arte do **Cuidado** e
   usar **"Continuar a história"**.
5. Mostrar em qual cena a história retoma.

**Aprova se**
- A **cena 8 não** dispara convite (o marco antigo saiu dali).
- A **cena 9** dispara o convite do **Cuidado** ("A Criação ficou muito boa!").
- Ao voltar, a história **retoma na cena 10** ("O descanso de Deus") — a próxima, nunca a cena 9 de novo.

**Reprova se**
- O convite do Cuidado aparece na cena 8, ou a retomada cai na cena 9 (ou em qualquer cena ≠ 10).

---

## Vídeo V2 — **Um único modal na cena-marco** (Problema 3)

**Duração alvo:** ~2 min. **É o vídeo que fecha o "dois modais".**

**Pré-condição:** **"Limpar"**. Estado de primeira vez.

**Passos**
1. Avançar a narração e concluir a **cena 2** ("Haja luz").
2. Filmar **exatamente** o que aparece ao concluir a cena.
3. Ler o modal em voz alta e mostrar os **dois** botões.

**Aprova se**
- Aparece **UM** modal só: o **convite do Beni** ("Você descobriu a luz! / Vamos dar cor a esse
  momento?"), com **"Colorir agora"** e **"Continuar a história"**.
- **Não** aparece a celebração genérica **antes nem depois** do convite — nunca as duas telas em sequência.
- O corpo do convite **não tem emoji**; quem carrega a emoção é o **avatar do Beni**.

**Reprova se**
- Surge a celebração genérica **e** o convite (em qualquer ordem), ou o modal aparece sem texto.

---

## Vídeo V3 — **O convite não se repete; cena comum não convida** (Problema 3)

**Duração alvo:** ~2,5 min.

**Passos**
1. A partir do estado do V2 (cena 2 já concluída uma vez), **voltar** e reabrir a narração da cena 2
   (ou concluí-la de novo pelo fluxo): mostrar que **o convite não reaparece** (`invitationSeen`).
2. Avançar e concluir uma **cena comum não-marco** (ex.: cena 4 ou 5): mostrar que ela **termina
   sem** convite de colorir.
3. Concluir a **cena 7** ("Animais da terra"): o convite do **Vida** aparece; tocar **"Continuar a
   história"** (o **pular**) e mostrar que a narração segue direto para a **cena 8**.

**Aprova se**
- O convite de uma cena-marco **já vista não reaparece** (sem loop).
- Cena **comum** (não 2/7/9) **nunca** convida.
- **"Continuar a história"** (pular) leva à **próxima cena** sem abrir o editor e sem beco sem saída.

**Reprova se**
- O mesmo convite reabre em loop, uma cena comum convida, ou o "pular" trava/volta ao início.

---

## Vídeo V4 — **CTA contextual ao concluir dentro da história** (Problema 2)

**Duração alvo:** ~2,5 min.

**Passos**
1. Numa cena-marco, tocar **"Colorir agora"** para abrir o editor **a partir do marco**.
2. Colorir e tocar **"✓ Pronto!"** para concluir.
3. Filmar de perto as **ações da celebração**.
4. Tocar a ação e mostrar **onde** a história retoma.
5. Para contraste: abrir a mesma parte pela **coleção/StoryDetail** (fora de marco) e mostrar que ali
   a saída é **"Voltar à aventura"**, um caminho diferente.

**Aprova se**
- Concluindo **a partir do marco**, a celebração oferece **uma única** ação principal
  **"Continuar a história"**, que **retoma na cena de retorno** do marco.
- **"Continuar a história"** (dentro da história) e **"Voltar à aventura"** (saída para a StoryDetail)
  são **textos distintos** e destinos distintos — nunca o mesmo botão com dois nomes.

**Reprova se**
- Dentro do marco aparece "próxima parte"/"ver coleção"/"continuar neste desenho" tirando a criança
  da história, ou os dois rótulos colidem, ou a retomada cai na cena errada.

---

## Vídeo V5 — **Mensagem pós-história acompanha o quanto foi colorido** (Problema 4)

**Duração alvo:** ~3 min. **Usa a bancada "Definir N de 3".**

**Passos**
1. Bancada → **"Definir 0 de 3"**. Chegar à tela de **conclusão da história** (CongratsScreen) e
   filmar a **ponte** (mensagem + botão).
2. Repetir com **"Definir 1 de 3"**, **"Definir 2 de 3"** e **"Definir 3 de 3"**, filmando a ponte
   em cada estado.

**Aprova se** — cada estado mostra **exatamente**:
- **0 de 3:** "A história terminou. Vamos começar a dar cor à Criação?" · botão **"Colorir com o Beni"** · sem contador.
- **1 de 3:** "Você começou sua coleção! Vamos colorir mais uma parte?" · botão **"Continuar colorindo"**.
- **2 de 3:** "Falta só uma criação para completar sua coleção!" · botão **"Colorir a última parte"**.
- **3 de 3:** "Sua coleção da Criação está completa!" · botão **"Ver minha coleção"**.
- Em **3 de 3**, o botão **nunca** é "Colorir com o Beni".

**Reprova se**
- Qualquer texto diverge (uma palavra que seja), a ação não corresponde ao estado, ou o convite de
  **começar** aparece com a coleção já **completa**.

---

## Vídeo V6 — **Leitura honesta na falha + piloto desligado não convida** (Problema 4 · regressão)

**Duração alvo:** ~2,5 min.

> **Nota honesta.** Forçar uma **falha de leitura** (READ_FAILED) no aparelho é difícil sem
> ferramenta de injeção; este ramo é provado por **mutação no smoke** (prova 42 + controle NEG 16:
> desligar o ramo `readFailed` faz a leitura falha assumir "0 de 3" e a prova fica **vermelha**). O
> vídeo cobre o **observável**: se a coleção **não** puder ser lida, a ponte é **honesta**.

**Passos**
1. Se houver como induzir uma leitura falha (ex.: estado corrompido de teste), filmar a ponte.
   Caso contrário, **declarar em voz alta** que o ramo é coberto pelo smoke e passar ao passo 2.
2. **Regressão do piloto desligado:** com o piloto **OFF** (ferramentas internas desligadas e flag
   do piloto off), percorrer as cenas-marco 2/7/9 de **A Criação** e mostrar que **nenhum convite**
   de colorir aparece — a história termina como sempre.

**Aprova se**
- Numa falha de leitura, a ponte **não** assume "0 de 3", **não** mostra o convite de **começar**,
  exibe uma **mensagem honesta** e a ação segura **"Ver minha coleção"** — nunca uma tela em branco.
- Com o **piloto OFF**, **nenhum** convite/modal de marco aparece em nenhuma das cenas.

**Reprova se**
- A falha de leitura vira "0 de 3" ou convite de começar; ou o piloto desligado exibe convite.

---

## Vídeo V7 — **Retorno quente à coleção + reset + sem crash** (Problema 5 · regressões)

**Duração alvo:** ~3 min.

**Passos**
1. Do estado **3 de 3**, tocar **"Ver minha coleção"** e filmar o **primeiro quadro** da tela.
2. **Voltar e reabrir** a coleção **5 vezes seguidas**, sempre filmando o primeiro quadro.
3. Repetir uma reabertura em **modo de baixa energia**.
4. **Área dos Pais → Gerenciar dados → APAGAR** (reset canônico) e reabrir a coleção.
5. Ao longo de todo o fluxo (concluir → coleção → editar → voltar), observar se há **algum
   travamento/crash**.

**Aprova se**
- No **retorno quente**, a coleção aparece **de imediato** (sem "Montando sua coleção…" por cima de
  obras válidas); a revalidação do disco acontece **em segundo plano**, sem piscar as vagas prontas.
- Depois do **reset**, a coleção reflete o estado **limpo** (0 de 3 por derivação, sem "3 de 3" fantasma).
- **Nenhum crash** no fluxo — em especial, nada relacionado a estado de "já pintou" (a regressão do
  `setC60HasPainted`, já removida, **não** reaparece).

**Reprova se**
- "Montando sua coleção…" cobre obras já válidas no retorno quente, o reset deixa obra exposta, ou
  ocorre qualquer travamento/crash.

---

## Relatório final — Parte C (Ajuste Final)

*(A **aprovação** é do fundador, no iPhone, com os vídeos V1–V7. A seção abaixo registra só o **estado
de engenharia** — o que o smoke e a revisão independente já garantem, e o que fica para o aparelho.)*

1. **Escopo.** Só os **5 problemas provados** do ajuste final. O redesenho já aprovado (coleção como
   lugar, prévia ampliada, festa opaca) **não** foi reaberto.
2. **P1 — terceiro marco em 9/10.** `coloring60StoryMilestones.js:44-46`: `light{2→3}`,
   `living_world{7→8}`, `people_and_care{9→10}`. Invariante `resumeScene === unlockAfterScene + 1`
   em todos; gatilhos `{2,7,9}` e retornos `{3,8,10}` distintos; a **cena 8 deixou de ser gatilho**
   (sem convite back-to-back); a cena 10 ("O descanso de Deus") existe em `stories.js`.
3. **P2 — CTA contextual por ORIGEM.** `reframeColoring60JourneyForMilestone`/
   `deriveColoring60PrimaryAction` puros: fora de marco devolvem `null`; `c60MilestoneFlow` exige
   `origin===STORY_MILESTONE` **e** índice inteiro ≥ 0. Rótulos **distintos** ("Continuar a história"
   × "Voltar à aventura"). **Sem off-by-one**: o `returnSceneId` é decorativo (para o smoke); a
   navegação real usa `resumeCenaIndex` (0-based) sem dupla conversão. A máquina de jornada é
   preservada por `{...base}` — só as três ações mudam.
4. **P3 — modal ÚNICO por marco.** `derivePostSceneExperience` retorna **um** valor; CAMINHO A faz
   `setShowMilestoneInvite(true); return;` **antes** de qualquer celebração — nunca as duas telas.
   `invitationSeen` (sessão em memória + disco) marca 'visto' no instante da apresentação; **sem loop**
   (a decisão nem reexecuta na revisita, pois `jaConcluida`). Falha de storage **nunca** rejeita
   (`.catch()` fire-and-forget; leituras à prova de exceção). Sem copy ⇒ não renderiza.
5. **P4 — mensagem pós-história por estado.** `deriveColoring60StoryBridge` (pura) mapeia
   0/1/2/3 → start/continue/lastOne/complete + `readFailed` **honesto** (não assume 0/3, ação segura
   "Ver minha coleção", contador nulo). Textos batem **caractere a caractere** com o travado; **não
   usa `hasEverCompleted`**; a lógica de estado vive **só** nessa função (a tela apenas consome). O
   `catch` da `CongratsScreen` **preserva o estado anterior** (`prev ?? readFailed`), nunca volta a
   branco. `3/3` nunca exibe "Colorir com o Beni"; contador oculto em 0 e em falha.
6. **P5 — retorno quente AUDITADO, sem reescrita.** A arquitetura A1–A6 (retrato em memória + SWR +
   dedup em voo + geração de leitura + época de reset) já estava implementada e **provada** (bloco
   C60-A). **Sem evidência de falha**: corrida geração×época barrada (`epochAtStart`/`resetEpoch`
   checados antes de qualquer escrita), leitura pré-reset não repovoa o apagado (disco limpo antes do
   `notify`), `prime` fire-and-forget não derruba a festa (`.catch`/`.finally` sem relançar), e o
   portão por vaga **nunca** revela contorno sem tinta. Conforme a regra: **não reescrever sem
   evidência de falha**.
7. **Invariante STORY-AGNOSTIC preservado.** `coloring60Journey.js` não menciona `storyId` em código
   (só em comentário), mesmo após a ponte por estado — reafirmado pelo **gate 23**.
8. **Regressões nomeadas confirmadas.** `setC60HasPainted` = **0 ocorrências** em `src/` (o setter que
   causava crash não voltou; o `hasPainted` legado do canvas é conceito distinto). **`journeyComplete`
   mantém a fórmula** (`scenesComplete && bookOpened && quizDone && reflectionDone && coloringComplete`).
   **Piloto OFF não exibe convites** (dupla proteção: gate `isCreationColoringPilotActive` + copy nula).
9. **Supersessão documental.** Esta parte atualiza a Parte B: **Cuidado 8→9** e retorno **9→10** (itens
   3 e 14 da Parte B). Luz@2→3 e Vida@7→8 inalterados.
10. **Portão smoke.** `node scripts/smoke.js` no worktree: **3654/3654, 0 falhas** (baseline **3633** +
    **21**: provas **33–43**, controles **NEG 13–18**, gates **21–24**). Acima do piso (**≥ 3633**);
    **nenhuma** prova anterior removida ou enfraquecida.
11. **Falsificabilidade.** Os **6 novos controles negativos** mutam cada garantia (guard do modal único,
    guard de origem do CTA, igualdade de rótulos, ramo `readFailed`, rótulo de "começar" no estado
    completo, `setC60Bridge(null)` no catch) e **exigem** a prova correspondente **vermelha** —
    passaram em verde, logo as mutações de fato falsificam.
12. **Revisão adversarial independente (2 revisores).** Ambos, lendo o código real linha a linha e
    tentando **refutar** cada decisão travada, concluíram **cumpre / sem evidência de falha** nos 5
    problemas e nas 3 regressões nomeadas. Nenhum defeito encontrado.
13. **Contradição sinalizada (conforme instrução do bloco).** A sugestão de entradas do fundador para
    o P4 listava `storyId`, mas `coloring60Journey.js` deve permanecer **story-agnostic** (invariante
    travado). **Resolução:** `storyId` **não** entrou ali; a identidade fica no **chamador**
    (`CongratsScreen` lê por `story.id` e passa `doneMap`); o gate 23 reafirma. Nota correlata: a ponte
    usa **evidência leve** (registro de instantâneo) e a coleção usa **evidência forte** (abre o blob)
    — divergência **deliberada e documentada** (direção segura), não um defeito.
14. **Áreas não tocadas / não avançadas.** **Sem** imagens/assets gerados; **sem** dependências novas
    ou atualizadas; paywall/progresso/conquistas/`accessControl`/manifestos **intactos**; a **fórmula
    global** não mudou; **nenhuma outra história** recebeu marco; **produção com piloto OFF** inalterada.
15. **Estados de arquivo (worktree `feat/colorir-60-pilot-creation`, HEAD `c20e222`).** O worktree
    carrega o piloto acumulado (Partes A+B+C); os **arquivos tocados por ESTE ajuste final** estão
    marcados com ⟐.
    *Modificados* (salvos no disco, **não** indexados): `scripts/smoke.js` ⟐,
    `docs/C60_VALIDACAO_FISICA.md` ⟐, `src/services/coloring60Journey.js` ⟐,
    `src/screens/CongratsScreen.js` ⟐, `src/screens/NarrationScreen.js` ⟐,
    `src/screens/ColoringScreen.js` ⟐, `src/services/coloring60ResetService.js` ⟐,
    `src/components/coloring60/Coloring60CompletionOverlay.js` ⟐, `src/screens/StoryDetailScreen.js`,
    `src/screens/Coloring60CollectionScreen.js`, `src/context/ProgressContext.js`,
    `src/constants/routes.js`, `src/navigation/AppNavigator.js`.
    *Untracked* (salvos no disco, nunca versionados): `src/data/coloring60StoryMilestones.js` ⟐,
    `src/services/coloring60MilestoneInviteSeen.js` ⟐,
    `src/components/coloring60/Coloring60MilestoneInvite.js` ⟐, `src/services/coloring60Navigation.js`,
    `src/services/coloring60CollectionPortrait.js`, `src/services/coloring60CollectionReader.js`,
    `src/services/coloring60PortraitMerge.js`, `src/services/storyColoringCompletion.js`,
    `src/theme/coloring60ActivityTheme.js`, `src/screens/Coloring60ArtPreviewScreen.js`,
    `docs/C60_COLECAO_DIAGNOSTICO.md`.
    **Nenhum `git add` foi executado; nada está staged/indexado, commitado nem enviado ao remoto.**
16. **Sem commit, sem push, sem git add, sem aprovação visual.** O smoke prova o **modelo, os textos e
    o contrato**; convite, transição, áudio de retomada, legibilidade e clareza seguem para o
    **aparelho**, com os vídeos **V1–V7**. Este relatório **não** declara aprovação — ela é do fundador,
    no iPhone.
