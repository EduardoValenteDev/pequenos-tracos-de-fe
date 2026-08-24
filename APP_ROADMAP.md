# APP ROADMAP — Pequenos Traços de Fé

> **⛔ SUPERSEDED — DOCUMENTO HISTÓRICO (2026-08-24 · bloco `F6.0`).**
>
> **Preservado para rastreabilidade histórica.** **NÃO usar como sequência operacional.**
> Este plano de sprints nunca foi reancorado no roadmap de fases do projeto e **não** descreve a
> sequência vigente. A sequência, as fases, o escopo e os portões vigentes estão em
> [`docs/roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md`](docs/roadmap/ROADMAP_MESTRE_CANONICO_MUNDO_DO_BENI_v6.0.md);
> as **decisões individuais** continuam arbitradas por [`docs/DECISIONS.md`](docs/DECISIONS.md).
> **Nada foi apagado** — o texto abaixo permanece íntegro.


> **Plano de sprints do produto.** Cada sprint tem objetivo claro, escopo definido e critérios de conclusão. Nenhum sprint pode avançar sem os critérios do anterior sendo atendidos.

---

## Sprint 1 — Fundação e Motor de Colorir ✅ (atual)

**Objetivo:** app estável, motor de colorir funcionando sem bugs críticos, documentação mestre criada.

### Entregáveis
- [x] Motor de colorir: BFS confinado ao retângulo da imagem (sem céu/chão conectando)
- [x] Camadas corretas: bg → paint → line art com `multiply` composite
- [x] Padding mínimo (SP=6): imagem grande na tela
- [x] Timeout de carregamento (7s) + retry limpo
- [x] Paleta expandida (25 cores)
- [x] Ateliê: Carimbos da Fé removido
- [x] Galeria: botão "Ateliê" adicionado
- [x] Documentação mestre criada (8 documentos)
- [x] Bug "tocar não pinta" corrigido (multiply composite)
- [x] Debug logs `[COLORING_DEBUG]` em DEV
- [x] Mensagem infantil no botão Pronto sem pintura

### Critérios de conclusão do Sprint 1
- Colorir funciona em todas as 30 cenas (3 histórias × 10 cenas)
- Sem loading infinito em nenhuma tela
- Sem regressão do BFS bounds fix
- Documentos de fundação revisados e aprovados

---

## Sprint 2 — Redesign Responsivo das Telas Principais

**Objetivo:** todas as telas principais (Home, Aventuras, Perfil, Ateliê) polidas para celular e tablet, sem espaços vazios, sem rostos cortados.

### Escopo
- Home/Perfil: redesign com Lumi, contador de estrelas em destaque, navegação clara
- Aventuras: grade responsiva (1 col celular, 2 col tablet), capas sem corte de rosto
- Tela de seleção de cena: visual de estrelas por cena claro
- Metadados de história: implementar `imageFocus`, `heroImage`, `themeColor`
- Bottom tab bar: polimento visual, ícones consistentes
- Safe area: revisar em iPhone com notch e iPhone Dynamic Island

### Proibições
- Não alterar lógica de navegação
- Não alterar estrutura de histórias (`stories.js`)
- Não alterar motor de colorir

### Critérios de conclusão
- Checklist Bloco 2 e 3 passando em celular e tablet
- Sem rosto cortado em nenhuma história
- Sem vazio em tablet landscape

---

## Sprint 3 — Progressão, Estrelas e Conquistas

**Objetivo:** sistema de estrelas e conquistas funcional, anti-duplicação, com animações.

### Escopo
- Refatorar `useProgress` para respeitar `PROGRESSION_RULES.md`
- Implementar anti-duplicação de estrelas (`alreadyGranted(storyId, cenaId, action)`)
- Estrela de narração: disparada ao completar `NarrationScreen`
- Estrela de colorir: disparada ao `onPainted` no `ColoringScreen`
- Estrela de conclusão: disparada ao `salvarCena` após Pronto
- Bônus de história: disparado ao concluir todas as cenas
- Conquistas: verificação após cada ação relevante
- Animação de conquista (overlay ou bottom sheet)
- Desafio da Imaginação: cooldown diário de 1 estrela

### Critérios de conclusão
- Checklist Bloco 5 passando completamente
- Testar completar a história de Noé do zero e verificar total de 35 estrelas (30 + 5 bônus)
- Migração defensiva de dados legados

---

## Sprint 4 — Área dos Pais e Monetização Preparada

**Objetivo:** área dos pais funcional com progresso, configurações e estrutura de acesso premium.

### Escopo
- Implementar `AccessControl.js` com `hasAccess()` / `getCurrentPlan()`
- Visual de bloqueio em histórias premium (opacity + cadeado + badge)
- Modal de "desbloqueio gentil" ao tocar em história premium
- Área dos Pais: todas as seções de `PARENT_AREA_RULES.md`
- Proteção de acesso adulto (desafio numérico)
- Limite do Ateliê: modal ao atingir 3 artes no gratuito
- Placeholders de "comprar premium" e "restaurar compras"

### Proibições
- Não implementar billing real
- Não alterar motor de colorir
- Não alterar estrutura de navegação principal

### Critérios de conclusão
- Histórias premium exibem bloqueio correto
- Área dos Pais acessível com proteção
- `hasAccess('free')` retorna true, `hasAccess('premium')` retorna false (por enquanto)
- Limite do ateliê funcional

---

## Sprint 5 — Meu Livrinho da Fé

**Objetivo:** recurso especial de história concluída — sequência animada com desenhos da criança.

### Escopo
- Ao concluir história, desbloquear "Meu Livrinho da Fé"
- Tela de livrinho: sequência de cenas com `paintD` + line art + narração
- Animação de virar página
- Botão de replay
- Disponível para todas as histórias concluídas (premium) e Noé (gratuito)

### Dependências
- Sprint 3 concluído (progressão de história correta)
- Sprint 4 concluído (acesso liberado por plano)
- Áudios de narração disponíveis (Sprint 6 pode ser parcialmente paralelo)

---

## Sprint 6 — Áudio Real e Narração Contínua

**Objetivo:** narração de áudio real em todas as cenas das histórias gratuitas.

### Escopo
- Gravar ou adquirir áudios de narração para A Criação e Noé
- Integrar `expo-av` para reprodução de áudio
- Sincronização de texto com áudio (highlight de parágrafo)
- Configuração de áudio na Área dos Pais
- Testes de áudio offline

### Proibições
- Não alterar estrutura de histórias
- Não fazer streaming de áudio — arquivos locais no bundle

---

## Sprint 7 — Expansão de Histórias

**Objetivo:** adicionar novas histórias premium à trilha Pequeninos.

### Escopo
- Daniel e os Leões: 10 cenas, narração, colorir (30 imagens PNG)
- Revisão completa de Davi e Golias e Jesus e as Crianças
- Qualidade das imagens de colorir: garantir que respeitem `COLORING_ENGINE_RULES.md`
- Testes de performance com mais histórias carregadas

### Proibições
- Não adicionar histórias sem PNGs de colorir finalizados
- Não adicionar histórias sem textos de narração revisados

---

## Backlog Futuro (Sem Sprint Definido)

| Item | Prioridade |
|---|---|
| Sincronização em nuvem (backup de progresso) | Média |
| Suporte a múltiplos perfis de criança | Baixa |
| Versão web (Expo for Web) | Baixa |
| Modo escuro (para leitura noturna com pais) | Baixa |
| Stickers/carimbos no Ateliê | Média |
| Compartilhar arte (via Área dos Pais) | Média |
| Widget de tela inicial com Lumi | Baixa |
| Notificações push opt-in (lembrete semanal) | Baixa |
