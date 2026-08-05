# Matriz de Acesso — Grátis × Plano Família (Linha de Lançamento)

Fonte: [`PLANO_OFICIAL_BENI_LANCAMENTO.md`](../PLANO_OFICIAL_BENI_LANCAMENTO.md) §5/§6/§10 +
decisões em [`DECISOES_E_CONFLITOS.md`](./DECISOES_E_CONFLITOS.md).

> Documento de **referência** (Fase 0). A implementação real fica no Bloco A (Fase 2), centralizada em
> `src/services/accessControl.js` / `contentAccessService.js` — **sem** `__DEV__` em regra de produto,
> **sem** quebrar chaves `@ptf_*`. "Já existe" = comportamento atual no código; "Novo" = a implementar.

> 🔄 **Atualizado em 2026-08-05 pelo Product Lock da Fase 4B** (`docs/DECISIONS.md` §PL4B). Foram corrigidas
> as linhas de **Colorir com o Beni**, **Criar Livre** e **salvamento**, e acrescentadas as regras
> transversais de **degustação**, **prévia editorial** e **recomendação filtrada**. Em qualquer conflito,
> vale `docs/DECISIONS.md`.

## Matriz por funcionalidade

| Funcionalidade | Grátis | Plano Família | Situação |
|---|---|---|---|
| **A Criação** e **Noé** (história completa) | ✅ | ✅ | Já existe |
| Demais histórias (18 premium) | ❌ | ✅ | Já existe (`accessType`) |
| Narração das histórias **grátis** | ✅ | ✅ | Requisito (lacuna de execução) |
| Narração das histórias **premium** | ❌ | ✅ | Requisito |
| Quiz | grátis: ✅ · premium: ❌ | ✅ | Já existe |
| Momento com Beni | grátis: ✅ · premium: ❌ | ✅ | Já existe |
| Livrinho | grátis: ✅ · premium: ❌ | ✅ | Já existe |
| **Colorir com o Beni** (atividade narrativa dentro da história) | grátis: ✅ · premium: ❌ | ✅ | Já existe (piloto **A Criação**) |
| **Salvar a pintura do Colorir com o Beni** | ✅ **em toda história acessível** — inclusive no grátis (uma obra real por atividade) | ✅ | Já existe (Spec 019, validada fisicamente) |
| **Criar Livre** (desenhar do zero) | ✅ (**sem salvar**) | ✅ | Já existe |
| **Salvar arte do Criar Livre** | ❌ **(0 no grátis)** | ✅ | **Mudança** (hoje 3 grátis → 0) |
| **Galeria / Minhas artes** (obras do **Criar Livre**) funcional | ❌ | ✅ | Mudança (acompanha o salvar do Criar Livre) |
| **Brincar — rodadas/dia** | **2/dia** (compartilhado) | ilimitado | **Novo** (não existe limite hoje) |
| Jogos ilimitados | ❌ | ✅ | Novo (com os jogos) |
| **Avatares** | ❌ (só base, não extras) | ✅ | **Mudança** (hoje liberam por estrelinhas) |
| Downloads offline premium | ❌ | ✅ (após pacote) | Novo (Fase 10) |

## Regras transversais
- **Estrelinhas**: progresso/celebração. A criança **nunca gasta**. **Não** liberam avatares no grátis.
- **Avatares**: benefício **exclusivo** do Plano Família; nunca vendidos diretamente à criança.
- **Compra/assinatura/links externos**: somente na **Área dos Pais** com gate parental.
- **Planos comerciais**: **mensal e anual**, e **somente** esses dois. **Sem trimestral** e **sem vitalício** (Fase 4A · `D-4A-PRODUTOS-E-PERIODICIDADE`). O anual traz economia aproximada de **25%** sobre doze mensalidades e é o **único** com **teste grátis de 7 dias**.
- **Limite de rodadas**: centralizado no controle de acesso; reset por dia local; persistido; não burlável por troca de tela/fechar app; **sem `__DEV__`**. ⚠️ **Conflito preservado, não resolvido nesta fase:** a linha da tabela diz "**compartilhado**" (entre os jogos) e `DECISIONS.md:57` (`E1-PLANO-FREE`) diz "**por criança**"; `DECISOES_E_CONFLITOS.md` C3 diz "compartilhadas". A escolha entre **por criança** e **por dispositivo/jogo** fica para o bloco decisório próprio do Brincar — **não** decidir aqui.
- **Duas experiências criativas, dois contratos (Fase 4B · `D-4B-SALVAMENTO-DUAS-EXPERIENCIAS`)**: **Criar Livre** = autoria livre, **não salva no grátis**; **Colorir com o Beni** = coleção narrativa, **salva no grátis** em qualquer história acessível. **Não existe uma terceira experiência chamada "Criar com Beni"**; *"Criar Juntos"* é **chamada contextual** para o Criar Livre, não funcionalidade independente.
- **Sem degustação de história premium (Fase 4B · `D-4B-SEM-DEGUSTACAO`)**: **A Criação** e **Noé** são as duas histórias gratuitas **completas**; as outras **18** são **integralmente premium**. **Não** há cena, atividade, quiz, reflexão, áudio, Colorir, recompensa ou marco liberado dentro de história premium, e **não existe autorização por cena**.
- **Prévia editorial infantil (Fase 4B · `D-4B-PREVIA-EDITORIAL`)**: sobre conteúdo bloqueado a criança pode ver **somente** capa, título, sinopse curta, região/posição no Mapa, selo neutro do Plano Família e estado visual protegido. **Nunca**: cena integral, áudio narrado, quiz, reflexão, Colorir, recompensa, progresso fabricado, **preço, desconto, teste grátis, urgência ou botão de assinar**. Ao tocar, a criança recebe **orientação neutra para chamar um adulto**; o **gate parental vem antes** de qualquer paywall ou informação comercial. A proibição comercial alcança também `accessibilityLabel`, leitor de tela e qualquer mensagem falada.
- **Recomendações filtradas (Fase 4B · `D-4B-FILTRO-RECOMENDACAO`)**: **Cultinho** e **Meu Momento** recomendam **apenas conteúdo autorizado**. No grátis: A Criação, Noé e atividades gratuitas. Sem conteúdo novo acessível, recomendam **revisitação** do que é gratuito. **Nenhuma recomendação pode terminar em toque sem resposta**, bloqueio ou paywall.

## Onde isso vive no código (referência — Bloco A)
- Acesso central: `src/services/accessControl.js` (`isPremiumUser()`, `hasAtelierUnlimitedAccess()`, `ENABLE_LOCAL_PREMIUM_TEST_MODE`), `src/services/contentAccessService.js`.
- Salvar arte: `src/services/atelierStorage.js` (`ATELIER_FREE_SAVE_LIMIT`), `src/screens/AtelierCanvasScreen.js`.
- Avatares: `src/data/avatars.js` (`isAvatarUnlocked`), `src/screens/ProfileScreen.js`.
- Rodadas/dia: **novo** serviço + chave `@ptf_brincar_daily_v1` (a criar no Bloco A).
- Storage: `src/services/storageKeys.js` (não quebrar chaves existentes).
