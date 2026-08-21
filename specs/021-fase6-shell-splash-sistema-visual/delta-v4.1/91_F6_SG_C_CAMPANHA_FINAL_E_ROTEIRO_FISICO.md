# F6 · SG C — Campanha física final e roteiro humano

> **Artefato 91 · delta-v4.1 · 2026-08-21**
> Prepara a revalidação física **mínima** que fecha SG C. Sucede o `90` (contrato de
> oclusão por IME e correção causal de `D2`).
>
> **Nada aqui foi executado.** A gravação **não** foi iniciada. Nenhuma ação humana foi
> presumida. O fundador decide quando rodar.

---

## 1. O que esta campanha precisa fechar

| Item | Estado hoje | O que a campanha entrega |
|---|---|---|
| `D2` | corrigido em código, `G-CVS-5` verde | ver o cartão acima do teclado em **retrato e paisagem** |
| `A1` `A2` | `UNPROVEN` (dívida de evidência) | composição por região medida, nas duas faixas, com barra lateral |
| `B` | `UNPROVEN` (dívida de evidência) | rotação que **cai dentro** da janela de carga, com prova temporal |
| `C1` | atestado pelo fundador (§13 da ordem) | confirmação de que segue reconciliado |
| `C2` | atestado pelo fundador (§13 da ordem) | confirmação de que segue reconciliado |
| `E1` | atestado pelo fundador (§13 da ordem) | confirmação de que segue reconciliado |
| família `KAV` (3 telas) | causa **diferente** de `D2`, comportamento não observado | **sonda** não destrutiva — observação, não portão |

**`C3` não entra.** Está lacrado (`NO_PATCH_REQUIRED`). Não se refaz `C3`, não se varrem
20 pinos de novo.

---

## 2. Número de vídeos: **1**

Uma tomada contínua, quatro atos, ≈ 4 minutos. Um vídeo só **não** reduz força
probatória aqui, porque:

- as sete verificações são **disjuntas no tempo** e nenhuma contamina a seguinte;
- a única que exige precisão de milissegundos é `B`, e ela é resolvida por **sincronia
  vídeo ↔ logcat**, não por isolamento;
- a ordem dos atos é ela mesma uma **variável controlada** — ver §3.1.

---

## 3. Como `B` fica provada sem instrumentação nova

### 3.1 Os quatro carimbos

`B` só é prova se der para responder: *a rotação caiu **dentro** da janela de carga?*
Isso exige quatro marcas na mesma linha do tempo.

| Sinal | Existe hoje? | Fonte |
|---|---|---|
| **(a) toque que inicia a navegação** | ❌ não há log | **o vídeo** — o dedo tocando a aba, com precisão de quadro (33 ms) |
| **(b) primeiro layout da tela** | ❌ não há log | **o vídeo** — o primeiro quadro em que o mapa pinta |
| **(c) mudança de orientação** | ✅ **sim** | `[AppNavigator] faixa = ...` (`AppNavigator.js:274-282`) |
| **(d) layout final / estabilização** | ❌ não há log | **o vídeo** — o quadro em que a geometria para de mudar |

O vídeo **é** o instrumento que falta. Ele data (a), (b) e (d) com precisão de quadro; o
logcat data (c) com precisão de milissegundo; e `[shell] MainTabs MONTADO`
(`AppNavigator.js:267`) prova que a rotação **não remontou o shell** — a checagem cruzada
`ainda na montagem #N` já vem embutida na própria linha da faixa.

### 3.2 Por que a linha da faixa sai em toda rotação neste aparelho

`useWindowBand` corta em `600 dp` (`src/theme/tokens.js:134`). No SM-X510 a largura é
≈ `514 dp` em retrato e ≈ `823 dp` em paisagem. **Toda rotação cruza o corte**, então a
linha sai sempre:

```
[AppNavigator] faixa = celular (barra inferior) · largura=514dp · ainda na montagem #1
[AppNavigator] faixa = tablet (sidebar à esquerda) · largura=823dp · ainda na montagem #1
```

*(os dp exatos devem ser **lidos** do aparelho, não assumidos; o que está provado no
código é que a linha **sai** na travessia.)*

### 3.3 Ponto de sincronia (a "claquete")

O **cold start** é o ponto comum: o quadro do vídeo em que a tela Início aparece
corresponde a `[shell] MainTabs MONTADO · montagens #1`. Precisão ≈ 100 ms, contra uma
janela de carga de 1200–1500 ms. Suficiente com folga.

### 3.4 A janela de carga **não** é curta demais

Do próprio código de `AdventureMapScreen.js`: arte final escalonada em `+300 ms`
(`pequeninos`), `+700 ms` (`descobridores`) e `+1100 ms` (`jovens_da_fe`); marcadores a
`+400 ms` (`OVERLAY_DELAY_MS`); animação de entrada de `320 ms`; 8 JPEGs de ~400 KB para
decodificar; e o `ScrollView` do mapa só monta depois do primeiro `onLayout` resolver
`mapViewportH` e `contentW`.

**Janela real: 1,2–1,5 s no melhor caso, mais em aparelho frio.** Uma rotação humana cabe
dentro dela sem esforço. A cláusula de §16 sobre *"carregamento rápido demais"* **não é
acionada**, e por isso **nenhuma instrumentação DEV foi implementada** — nem `log()` novo,
nem delay, nem trace.

### 3.5 Plano B (não implementado, apenas registrado)

Se depois da campanha a correlação por vídeo se mostrar insuficiente, existe uma proposta
de instrumentação **DEV, somente leitura**, de três linhas, toda via `log()` de
`src/utils/logger.js` (que já cala em produção por `if (__DEV__)`): montagem de
`AdventureMapScreen`, primeiro `onMapViewportLayout` por janela, e o resultado de
`reconcileMeasuredMap` (aceita/descartada). Sem timer artificial, sem `setState` novo, sem
alterar geometria. **Isso exigiria seu próprio ciclo e seu próprio gate — não faz parte
desta execução.**

---

## 4. Pré-condições — **antes** do REC

### 4.1 No PC

```powershell
C:\Android\platform-tools\adb.exe -s RX2XC003LTJ logcat -c
C:\Android\platform-tools\adb.exe -s RX2XC003LTJ logcat -v time > C:\tmp\ptf_evidencias\SG_C_FISICA_02\logcat.txt
```

*(deixar rodando durante toda a gravação; encerrar só no fim)*

### 4.2 No aparelho

1. **Rotação automática LIGADA.** Sem isso o teste inteiro é impossível.
2. **Gravador de tela do próprio aparelho** (não `adb screenrecord` — ele lida mal com
   rotação, e rotação é o objeto do teste).
3. **Bateria confortável**, brilho estável, não conectar/desconectar cabo durante a
   tomada.

### 4.3 Verificação do "Modo Criador" — **decisiva para o Ato 3**

O plano gratuito **não salva artes** (`ATELIER_FREE_SAVE_LIMIT = 0`). Sem acesso premium,
tocar em "Salvar" no Ateliê abre **"Guardar é do Plano Família"** — e o sheet de nome, que
é o objeto de `D2`, **nunca aparece**.

Antes de gravar, confirmar que o Modo Criador está ativo:

> Perfil → "Área dos Pais" → resolver a conta → "🛠️ Administração (dev)" → chave
> **"Modo Criador"** ligada.

Isto é um interruptor local de QA: **não** altera plano real, **não** marca compra, **não**
apaga nada.

### 4.4 Encerrar o app **completamente**

Depois de conferir o Modo Criador, **fechar o app pelos recentes**. O Ato 1 precisa de app
frio, e a bandeira de sessão do contrato de IME (`runtimeJaReportouIme`) precisa nascer
zerada para que o Ato 3 exponha o **pior caso**.

---

## 5. ROTEIRO HUMANO — tomada única

> Leia o roteiro **inteiro** antes de apertar REC.
> Onde diz "espere", espere de verdade: o vídeo é a régua.
> Onde diz **NÃO TOQUE**, não toque.

---

### ▶ ATO 0 — partida (≈ 15 s)

1. Aparelho em **RETRATO**.
2. Inicie a **gravação de tela**.
3. Espere **3 s** com a tela parada (folga para o corte).
4. Abra o app **Pequenos Traços de Fé**.
5. Espere a tela **Início** aparecer e conte **3 s** parado. *(este é o ponto de
   sincronia — não toque em nada)*

---

### ▶ ATO 1 — `B` no mapa · `C1` · `C2` · `A1`/`A2` (≈ 60 s)

6. **`A1`/`A2` retrato.** Sem tocar, observe a tela Início por **3 s**: barra de abas
   embaixo, conteúdo dentro da largura, nada cortado nem esticado.

7. **`B` — o estímulo.** Toque na aba **"Aventuras"** e, **cerca de meio segundo
   depois** — assim que o mapa começar a pintar e **antes** de os pinos aparecerem —
   **gire o tablet para PAISAGEM** num movimento só.
   - **NÃO arraste o mapa.** Nem antes, nem durante, nem depois.
   - Se você errar o tempo e girar tarde (mapa já estável), **fale em voz alta "girei
     tarde"** e repita apenas este passo 7: volte para retrato, toque em outra aba, volte
     em "Aventuras" e gire de novo. Até **três** tentativas; se não sair, siga adiante e
     registre.

8. Espere **5 s** parado, em paisagem, **sem tocar na tela**.
   - **Observe:** o mapa se estabiliza numa geometria coerente? Alguma região ficou com a
     largura da orientação antiga? A rolagem parou num lugar impossível?

9. **`C2` — mapa em paisagem.** Continue **sem tocar** por mais **3 s**.
   - **Observe:** o mapa está **contido e centralizado**, com faixas laterais/superiores
     se necessário. **Não** pode parecer um pergaminho gigante ampliado além da tela.

10. **`A1`/`A2` paisagem.** Ainda sem tocar, confira: a **barra lateral** está à
    esquerda, e o conteúdo compõe dentro do que sobrou — **não** contra a janela inteira.

11. **`C1` — o lugar é mantido.** **Sem nunca ter arrastado o mapa**, gire de volta para
    **RETRATO**. Espere **3 s**.
    - **Observe:** o mapa continua aproximadamente na **mesma região lógica**. Não pode
      ter saltado para o começo nem para um lugar aleatório.

---

### ▶ ATO 2 — `E1` · `B` na Ovelhinha (≈ 45 s)

12. Toque na aba **"Brincar"**.

13. Toque no card **"Cadê a Ovelhinha?"** e, **cerca de meio segundo depois**, **gire para
    PAISAGEM**. Espere **5 s** sem tocar.
    - **Observe:** a tela de entrada montou coerente na orientação final? Algum elemento
      ficou dimensionado pela orientação anterior?

14. **`E1`.** Toque em **"Começar no Fácil"**.
    - **Observe:** a tela de apresentação aparece e o botão **"Vamos procurar!"** está
      presente e tocável **sem** precisar de nenhuma rotação para destravar.

15. Toque em **"Agora não"** *(volta para a entrada; não consome rodada, não inicia
    partida)*.

16. Gire de volta para **RETRATO**.

---

### ▶ ATO 3 — `D2`, o coração da campanha (≈ 90 s)

> ⚠️ **Armadilha conhecida.** O card **"Criar livre" da tela Início** abre o Ateliê com
> uma missão e **pula o sheet de nome**. Ele **não** reproduz `D2`.
> O caminho correto é o de baixo, pela aba **Brincar**.

17. Ainda na aba **"Brincar"**, role até a seção **"Crie do seu jeito"** e toque em
    **"Abrir folha"**, no card **"Criar livre"**.

18. **Rabisque** na folha por **3 a 4 segundos** — traços largos, qualquer coisa. É só
    para habilitar o "Salvar".

19. **`D2` RETRATO.** Toque em **"Salvar"**, no topo da tela.
    - **Se aparecer "Guardar é do Plano Família":** o Modo Criador está desligado. **PARE
      o Ato 3**, volte à §4.3, ligue-o, feche o app pelos recentes e refaça a campanha do
      Ato 0. `D2` **não** é testável sem isso.
    - **Se aparecer "Nomeie seu desenho":** siga.

20. **Não digite nada ainda.** Espere **5 s** com o teclado aberto e observe.
    - **O cartão pode fazer UM movimento aqui, e isso é esperado.** É o primeiro teclado
      da sessão: o cartão nasce no alto da faixa e desce para junto do teclado quando a
      medida chega. Um movimento é correto. Um cartão que fica no alto **e não desce**
      significa outra coisa — ver a tabela de leitura em §6.
    - **Observe os TRÊS elementos:** o campo **"Nome do desenho"**, o botão **"Cancelar"**
      e o botão **"Guardar desenho"**. Os três precisam estar **inteiramente visíveis
      acima do teclado**.

21. Toque em **"Cancelar"** *(fecha o sheet; **o desenho continua na folha**)*. Espere o
    teclado fechar.

22. Gire para **PAISAGEM**. Espere **2 s**.

23. **`D2` PAISAGEM.** Toque em **"Salvar"** de novo.
    - Agora o app **já sabe** medir o teclado nesta sessão: o cartão deve nascer embaixo e
      subir junto com o teclado. Espere **5 s** sem digitar.
    - **Observe os mesmos três elementos.** Esta é a orientação mais apertada — é aqui que
      o defeito original doía mais.

24. Digite um nome curto — por exemplo **`teste`** — e toque em **"Guardar desenho"**.
    - **Observe:** salvou; a tela reage normalmente.

25. Gire de volta para **RETRATO**.

---

### ▶ ATO 4 — sonda da família `KAV` · **nada destrutivo** (≈ 60 s)

> Isto é **sonda, não portão**. Estas três telas têm mecanismo **diferente** de `D2` e
> **não** foram alteradas. O que se procura é se alguma delas tem um problema **próprio**
> sob edge-to-edge — que, se existir, vai para o registro de residuais, **sem patch nesta
> execução**.

26. Toque na aba **"Perfil"**. Role até **"🔐 Para responsáveis"**.

27. **Gire para PAISAGEM antes de abrir** *(paisagem é o caso apertado)*.

28. Toque no card **"Área dos Pais"**.
    - Abre o cartão **"Área dos Pais"** com uma conta de multiplicação e o teclado
      **já aberto**.
    - **Observe:** a conta, o campo **"Resposta"** e os botões **"Cancelar"** / **"Entrar"**
      estão visíveis acima do teclado? *(se estiverem cortados: é **achado novo**, causa
      diferente de `D2` — anote e siga; não é motivo de parada)*

29. Resolva a conta e toque em **"Entrar"**.

30. Role até a seção **"⛪ Modo Igreja"**, abra-a e toque em **"+ Criar turma"**.

31. Toque no campo **"Nome da turma *"**. O teclado abre.
    - **Observe:** o campo continua visível? Dá para rolar até ele com o teclado aberto?
      *(este é o mecanismo `ScrollView` + `keyboardShouldPersistTaps`, que é o que essas
      telas realmente usam)*

32. Toque em **"Cancelar"** *(nada é criado; o formulário é descartado)*.

33. 🚫 **NÃO abra "Gerenciar dados". NÃO toque em nada escrito "Apagar", "Excluir",
    "Apagar turma", "Apagar progresso", "Apagar todos os dados locais" ou "Apagar
    definitivamente". NÃO digite "APAGAR" em campo nenhum. Se qualquer confirmação
    destrutiva aparecer por engano: toque em "Cancelar" e continue.**

34. Gire para **RETRATO**, volte para a tela anterior, espere **3 s** e **encerre a
    gravação**.

### ▶ Encerramento no PC

```powershell
# Ctrl+C no logcat, e depois:
C:\Android\platform-tools\adb.exe -s RX2XC003LTJ shell dumpsys display | Select-String "mBaseDisplayInfo|density"
```

*(opcional — só para carimbar a densidade real do aparelho na evidência)*

Guarde vídeo e `logcat.txt` juntos em
`C:\tmp\ptf_evidencias\SG_C_FISICA_02\`.

---

## 6. Como ler o resultado de `D2` — auto-desambiguante

Os três desfechos possíveis são **visualmente distintos**. Não há zona cinzenta:

| O que você vê | Significado | Veredito |
|---|---|---|
| O cartão fica **junto ao teclado**, com campo e os dois botões inteiramente visíveis (retrato **e** paisagem) | A métrica da IME chega correta e a âncora funciona | ✅ **`D2` CORRIGIDA** |
| O cartão fica **no alto da tela** e **permanece lá** com o teclado aberto — campo e botões visíveis, mas longe do teclado | O runtime **não** reportou a IME; a **REGRA 3** (degradação segura) segurou. Feio, usável, **não quebrado** | ⚠️ **CONTRATO OK, MÉTRICA DEGRADADA** — reportar; não é falha do patch |
| Campo ou qualquer um dos botões **debaixo do teclado** | A correção não resolveu | ❌ **`D2` FALHOU** — parar e reportar |

O segundo caso é exatamente o que a REGRA 3 existe para produzir. Registrá-lo como falha
seria erro de leitura.

---

## 7. Condições de PARADA

Pare a gravação, guarde vídeo **e** logcat, e reporte — **sem tentar consertar durante a
campanha**:

| # | Gatilho | Ação |
|---|---|---|
| 1 | Campo ou botão do sheet de nome **debaixo do teclado** | **PARE.** `D2` falhou. Não repita compulsivamente. |
| 2 | **"Guardar é do Plano Família"** em vez de "Nomeie seu desenho" | **PARE o Ato 3.** Ligue o Modo Criador (§4.3), feche o app, refaça do Ato 0. |
| 3 | Crash, tela branca, ou o app não volta de uma rotação | **PARE.** O `logcat.txt` é a evidência — não o descarte. |
| 4 | Em paisagem **não** aparece barra lateral | **PARE.** A premissa de faixa está errada; o teste inteiro perde o eixo. |
| 5 | Qualquer confirmação destrutiva aparece | Toque em **"Cancelar"**. Nunca confirme. |
| 6 | Três tentativas de girar durante a carga e nenhuma caiu dentro | **Não insista.** Siga o roteiro e registre — `B` fica em dívida, e isso é um resultado honesto. |

**Nunca:** confirmar exclusão · apagar dados do aparelho · limpar armazenamento do app ·
desinstalar · reinstalar · trocar de conta.

---

## 8. Depois da campanha

Com vídeo e logcat em mãos, a reconciliação faz três coisas e para:

1. **Datar `B`** — subtrair o timestamp da linha `[AppNavigator] faixa` do quadro do vídeo
   em que o dedo tocou "Aventuras", e verificar se a diferença cai dentro dos 1200–1500 ms
   de carga.
2. **Adjudicar `D2`** pela tabela de §6.
3. **Registrar** `A1`, `A2`, `C1`, `C2`, `E1` e a sonda `KAV` — cada um como
   `RECONCILED`, `RESIDUAL` ou `STILL_UNPROVEN`, **com a evidência ao lado**.

Só então SG C vai ao Portão Humano. **Nenhum `push`, nenhum `merge`, nenhum fechamento
antecipado.**
