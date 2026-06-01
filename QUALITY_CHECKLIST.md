# QUALITY CHECKLIST — Pequenos Traços de Fé

> **Lista de verificação obrigatória.** Antes de considerar qualquer tarefa concluída, passe por todos os itens relevantes desta lista. Itens marcados como CRÍTICO não podem ser ignorados em nenhuma entrega.

---

## Bloco 1 — Inicialização

- [ ] **[CRÍTICO]** App abre sem travamento em dispositivo Android físico
- [ ] **[CRÍTICO]** App abre sem travamento em iOS (iPhone físico ou simulador)
- [ ] App abre sem crash em tablet Android (ex.: Samsung Tab)
- [ ] App abre sem crash em iPad (simulador ou físico)
- [ ] Tela de loading/splash não fica presa indefinidamente
- [ ] Navegação principal (abas) aparece corretamente

---

## Bloco 2 — Tela Home / Aventuras

- [ ] **[CRÍTICO]** Home carrega sem loading infinito
- [ ] Cards de histórias aparecem com capa, título e número de estrelas
- [ ] Histórias gratuitas estão acessíveis sem bloqueio
- [ ] Histórias premium exibem visual de bloqueio (cadeado / badge)
- [ ] Sem rostos cortados nas capas em celular
- [ ] Sem rostos cortados nas capas em tablet
- [ ] Sem espaços vazios excessivos em tablet landscape
- [ ] Toque em história gratuita abre corretamente

---

## Bloco 3 — Fluxo de História

- [ ] **[CRÍTICO]** História abre sem erro
- [ ] **[CRÍTICO]** Cena de narração carrega e exibe texto/imagem
- [ ] Narração de áudio inicia (se disponível)
- [ ] Botão de avançar cena funciona
- [ ] Botão de voltar cena funciona
- [ ] Barra de progresso da história atualiza corretamente

---

## Bloco 4 — Colorir (CRÍTICO — não pode ter regressão)

- [ ] **[CRÍTICO]** Tela de colorir abre sem loading infinito
- [ ] **[CRÍTICO]** Imagem de colorir é exibida inteira (sem corte, sem stretch)
- [ ] **[CRÍTICO]** Imagem ocupa espaço adequado (não minúscula, sem excesso de margem)
- [ ] **[CRÍTICO]** Canvas dimensionado ao aspect ratio da imagem (sem letterboxing excessivo em imagens landscape)
- [ ] **[CRÍTICO]** Tocar em área branca da imagem aplica cor
- [ ] **[CRÍTICO]** A cor aparece visível (não coberta pela line art)
- [ ] **[CRÍTICO]** As linhas pretas continuam visíveis por cima da cor
- [ ] **[CRÍTICO]** Trocar cor na paleta muda a cor imediatamente
- [ ] **[CRÍTICO]** Tocar com a nova cor aplica a nova cor (não a anterior)
- [ ] **[CRÍTICO]** Desfazer (↩️) remove a última pintura
- [ ] **[CRÍTICO]** Limpar (🗑️) remove toda a pintura
- [ ] **[CRÍTICO]** O fundo externo (margem do canvas) não é colorível
- [ ] **[CRÍTICO]** Céu e chão NÃO se conectam ao pintar pela margem externa
- [ ] **[CRÍTICO]** Tocar na linha preta não pinta (linha é barreira)
- [ ] Zoom (pinch) funciona
- [ ] **[CRÍTICO]** Fazer zoom (pinch) não aciona fill ao soltar os dedos
- [ ] **[CRÍTICO]** Soltar os dois dedos ao mesmo tempo após zoom não pinta
- [ ] Zoom ↺ reseta o zoom
- [ ] Pan (arrastar) funciona quando com zoom
- [ ] **[CRÍTICO]** Botão "Pronto!" sem pintura exibe mensagem: "Pinte um pedacinho da cena antes de continuar!"
- [ ] **[CRÍTICO]** Botão "Pronto!" após pintura avança corretamente
- [ ] **[CRÍTICO]** Retry funciona e recarrega o canvas limpo
- [ ] Salvar o desenho funciona (canvasRef.exportPaint)
- [ ] Abrir cena salva restaura o desenho anterior
- [ ] Cancelar a restauração começa do zero

---

## Bloco 5 — Progressão e Estrelas

- [ ] **[CRÍTICO]** Estrelas não duplicam ao abrir e fechar a mesma cena
- [ ] Estrela de narração concedida após completar narração
- [ ] Estrela de colorir concedida após primeira tinta aplicada
- [ ] Estrela de conclusão concedida após Pronto
- [ ] Bônus de +5 estrelas concedido ao completar história
- [ ] Conquistas desbloqueiam corretamente (testar "primeira cena" e "primeiro traço")
- [ ] Animação de conquista exibida ao desbloquear
- [ ] Contador total de estrelas atualiza na home

---

## Bloco 6 — Ateliê da Criação

- [ ] **[CRÍTICO]** Ateliê abre sem erro
- [ ] Folha mágica (canvas livre) abre
- [ ] Desenho livre funciona (touch aplica cor)
- [ ] Salvar arte funciona
- [ ] Galeria exibe artes salvas com thumbnail e data
- [ ] Continuar arte salva carrega o desenho
- [ ] Apagar arte funciona com confirmação
- [ ] Limite de 3 artes no plano gratuito exibe mensagem correta

---

## Bloco 7 — Offline e Performance

- [ ] **[CRÍTICO]** App funciona sem internet depois de instalado (histórias gratuitas)
- [ ] **[CRÍTICO]** Colorir funciona offline
- [ ] Ateliê funciona offline
- [ ] Progresso salva offline
- [ ] Sem loading infinito em qualquer tela sem conexão
- [ ] Performance aceitável em dispositivo mid-range Android (ex.: Moto G)

---

## Bloco 8 — Robustez e Qualidade

- [ ] **[CRÍTICO]** Nenhuma tela fica em loading infinito (timeout máximo 7s no colorir)
- [ ] Mensagens de erro são amigáveis, sem código ou stack trace
- [ ] Fechar e reabrir o app preserva progresso
- [ ] Navegar rapidamente entre telas não causa crash
- [ ] Memória não cresce indefinidamente (sem leak em WebView)
- [ ] DEV: logs de diagnóstico `[COLORING_DEBUG]` aparecem no console em desenvolvimento
- [ ] DEV: `[COLORING_STATE]` logs aparecem ao carregar/ignorar estado salvo incompatível
- [ ] PROD: nenhum log de diagnóstico visível para o usuário final
- [ ] **[CRÍTICO]** Abrir cena com desenho salvo de sessão anterior não causa sobreposição de layers
- [ ] **[CRÍTICO]** Estado salvo incompatível (dimensões diferentes) é descartado silenciosamente — canvas abre limpo
- [ ] **[CRÍTICO]** Não é necessário fechar e reabrir a cena para ver o desenho corretamente
- [ ] DEV: `__devClearColoringDrawing()` e `__devClearAllColoringDrawings()` disponíveis no console

---

## Bloco 9 — Identidade Visual Premium (Sprint 2.1+)

### Lumi — Mascote Oficial
- [ ] **[CRÍTICO]** Nenhum personagem bíblico (Noé, Davi, Jesus) aparece como mascote do app
- [ ] Lumi (🐑) aparece como guia em NarrationScreen via `LumiSpeechBubble`
- [ ] `LumiGuideCard` presente na Home, Aventuras e Ateliê (tablet: sidebar; mobile: inline)
- [ ] `LumiEmptyState` usado para trilhas/histórias coming_soon
- [ ] Nenhum emoji 🐑 solto como solução final — usar `<LumiAvatar />`

### StatusBadge — Badges Centralizados
- [ ] **[CRÍTICO]** Histórias premium exibem badge "Premium" (dourado) independentemente de `devUnlocked`
- [ ] Histórias gratuitas exibem badge "Grátis" (verde)
- [ ] Histórias coming_soon exibem badge "Em preparação" (azul)
- [ ] Nenhuma badge criada ad hoc com View + Text — usar `<StatusBadge />`

### StoryFallbackCover — Sem Blocos Cinza
- [ ] **[CRÍTICO]** Nenhuma história ou cena exibe fundo cinza como fallback de imagem
- [ ] Histórias sem `imagemCapa` usam `StoryFallbackCover` com `themeColor`
- [ ] A Criação (coming_soon) exibe fallback azul (#4FC3F7) com ícone 🌍
- [ ] Daniel e os Leões (coming_soon) exibe fallback laranja com ícone 🦁
- [ ] Placeholder cards no catálogo usam `StoryFallbackCover`, não `colors.locked`

### Capas 16:9 — StoryCoverImage
- [ ] **[CRÍTICO]** Capas de histórias NÃO usam `resizeMode="contain"`
- [ ] **[CRÍTICO]** Nenhuma capa aparece pequena centralizada dentro de espaço grande
- [ ] **[CRÍTICO]** Nenhuma moldura decorativa falsa (tela, quadro, papel) em volta da capa
- [ ] Home mostra próxima aventura com capa preenchendo o topo do card em 16:9
- [ ] Aventuras mostra StoryCard com thumbnail cover sem distorção
- [ ] Detalhe da história (mobile): capa 16:9 no topo do card, sem faixas brancas
- [ ] Detalhe da história (tablet): capa 16:9 na coluna direita, proporcional
- [ ] Histórias sem `imagemCapa` usam `StoryFallbackCover` com `themeColor` (nunca cinza)
- [ ] Todas as histórias têm `coverAspectRatio`, `coverFit`, `coverSafeArea`, `coverFormat` em stories.js

### Fluxo Pós-História — Sem Duplicidade
- [ ] **[CRÍTICO]** História concluída NÃO exibe botão amarelo isolado "Abrir Meu Livrinho da Fé"
- [ ] **[CRÍTICO]** Painel "Aventura concluída!" aparece quando história está concluída
- [ ] Painel exibe três opções: Livrinho da Fé, Quiz, Lumi
- [ ] Botão "Livrinho da Fé" navega para PostStoryHub
- [ ] Botão "Quiz" navega para Quiz
- [ ] Botão "Lumi" navega para Reflection
- [ ] Quiz e Lumi concluídos exibem check ✓ no card
- [ ] Painel aparece ANTES da lista de cenas

### StoryBookHero — Capa 16:9
- [ ] **[CRÍTICO]** Imagem de capa no StoryDetail não corta rosto ou corpo em celular
- [ ] **[CRÍTICO]** Imagem de capa no StoryDetail não corta rosto ou corpo em tablet
- [ ] Mobile: capa 16:9 no topo do card, info abaixo
- [ ] Tablet: layout 2 colunas (info esquerda, capa direita em 16:9)
- [ ] Sem moldura de livro ou tela ao redor da imagem
- [ ] Sem `resizeMode="contain"` no StoryBookHero

### Layout Tablet — Coluna Única Centralizada
- [ ] Home em tablet: coluna única centralizada (CenteredContent, maxWidth 720)
- [ ] Aventuras em tablet: coluna única centralizada com LumiGuideCard ao final
- [ ] Ateliê em tablet: coluna única centralizada
- [ ] Perfil em tablet: coluna única centralizada
- [ ] TrophiesScreen em tablet: mantém grid 2 colunas (exceção aprovada)
- [ ] StoryDetail em tablet: StoryBookHero usa layout 2 colunas interno

### Catálogo de Histórias
- [ ] Comece Aqui: exibe exatamente Noé + A Criação (nessa ordem)
- [ ] Pequeninos: exibe Davi + Jesus + Daniel (nessa ordem)
- [ ] Noé NÃO aparece dentro de Pequeninos
- [ ] Jesus e as Crianças exibe badge "Premium" (nunca "Grátis")
- [ ] Davi e Golias exibe badge "Premium"

---

## Instruções de Uso do Checklist

1. **Antes de cada PR/commit:** marcar todos os itens do bloco relevante
2. **Regressões:** qualquer item CRÍTICO que falhar bloqueia a entrega
3. **Novos recursos:** adicionar novos itens ao bloco correspondente antes de implementar
4. **Dispositivos de teste obrigatórios:**
   - Android: celular físico mid-range (ou emulador API 31+)
   - iOS: iPhone 13+ (ou simulador iOS 17+)
   - Tablet: emulador 10" (ou físico se disponível)
