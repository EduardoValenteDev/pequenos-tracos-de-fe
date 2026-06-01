# Auditoria de Acessibilidade e UX Infantil — Pequenos Traços de Fé

**Sprint 17.0 · 2026-06-01**  
Correções implementadas nesta sprint marcadas com ✅. Pendentes marcados com ⚠.

---

## Correções implementadas na Sprint 17

| Item | Arquivo | O que foi feito |
|---|---|---|
| ✅ Labels AudioPlayer | `src/components/AudioPlayer.js` | `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` no botão play/pause e replay |
| ✅ Labels abas de navegação | `src/navigation/AppNavigator.js` | `tabBarAccessibilityLabel` em todas as 5 abas |
| ✅ Labels Restore Purchase | `src/screens/ParentAreaScreen.js` | `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` no botão de restaurar compra |

---

## Acessibilidade técnica — estado após Sprint 17

| Elemento | Estado | Detalhe |
|---|---|---|
| Abas de navegação | ✅ OK | `tabBarAccessibilityLabel` adicionado |
| Botão de áudio (play/pause) | ✅ OK | Label e role adicionados |
| Botão de replay de áudio | ✅ OK | Label e role adicionados |
| Botão Restore Purchase | ✅ OK | Label, role e hint adicionados |
| Botões de início/continuar história | ⚠ Pendente | Sem accessibilityLabel/role |
| Paleta de cores (ColoringScreen) | ⚠ Pendente | Cada cor sem label |
| Ferramentas de colorir (apagar, limpar) | ⚠ Pendente | Sem labels |
| Botões de quiz (alternativas) | ⚠ Pendente | Sem labels |
| Botões de conquistas | ⚠ Pendente | Sem labels |
| Imagens de capa de histórias | ⚠ Pendente | Sem `accessibilityLabel` descritivo |
| Campo de nome na tela de Perfil | ⚠ Pendente | Sem `accessibilityLabel` |
| Botão de salvar arte (Ateliê) | ⚠ Pendente | Sem labels |

---

## UX Infantil — avaliação por faixa etária

### 3–5 anos (Comece Aqui / Pequeninos)
| Aspecto | Estado | Nota |
|---|---|---|
| Áreas de toque | ⚠ Avaliar | Cores na paleta podem ser pequenas para 3 anos |
| Textos simples | ✓ OK | Linguagem adequada nas histórias |
| Feedback visual | ✓ OK | Confetti, estrelas, animações |
| Feedback sonoro | ✓ OK | pop.wav, SoundButton |
| Sobrecarga de informação | ✓ OK | Telas limpas |
| Ação errada sem punição | ✓ OK | Colorir fora da linha apenas rejeitado com dica |

### 6–8 anos (Descobridores / Jovens da Fé)
| Aspecto | Estado | Nota |
|---|---|---|
| Detalhe progressivo | ✓ OK | Trilhas mais complexas para idades maiores |
| Quiz interativo | ✓ OK | Feedback imediato |
| Livrinho com áudio | ✓ OK | Auto-avanço com narração |
| Navegação independente | ✓ OK | Criança pode explorar sem adulto |

---

## Tamanho de toque — análise

Guideline: mínimo 44×44 pt (Apple HIG), recomendado 56×56 pt para crianças pequenas.

| Elemento | Tamanho estimado | Adequado para 3+ anos? |
|---|---|---|
| Botão de áudio (play) | ~56×56 px | ✓ |
| Abas de navegação | ~44 pt de altura | ✓ |
| Botões de história (Começar, Continuar) | Full width | ✓ |
| Círculos de cores na paleta | ~36–40 px estimado | ⚠ Avaliar em device real |
| Ferramentas (apagar, undo) | ~44×36 px estimado | ⚠ Avaliar |
| Botões de quiz | Full width | ✓ |

---

## Contraste e legibilidade

- Cores primárias (laranja `#FF8C42`, roxo `#7C3AED`) sobre fundo branco/creme: contraste adequado ✓
- Texto em `#1A1A2E` (escuro) sobre fundo claro: ✓
- Texto muted (`#666`) em fontes pequenas: ⚠ verificar WCAG AA (4.5:1)
- Fontes: Fredoka One (títulos) + Nunito (corpo) — adequadas para leitura infantil ✓

---

## Área dos Pais — distinção visual

- Header com gradiente roxo escuro diferenciado das telas infantis ✓
- "Área dos Pais" exibida no topo com ícone de cadeado ✓
- ParentalGate impede acesso direto pela criança ✓
- Ações adultas (suporte, política, termos, compra, reset) protegidas ✓

---

## Dark Patterns — auditoria

| Padrão proibido | Estado |
|---|---|
| Pressão de compra diretamente na criança | ✓ Ausente — apenas "Pedir ao responsável" |
| Contagem regressiva falsa de oferta | ✓ Ausente |
| Conteúdo de recompensa bloqueado de forma frustrante | ✓ Ausente — fallback amigável |
| Pop-ups de compra automáticos | ✓ Ausente |
| Botão de cancelamento pequeno ou escondido | ✓ Botão Cancelar visível no ParentalGate |
| Assinatura com renovação automática sem aviso | ✓ Ausente (IAP não implementado) |

---

## Pendências para Sprint 18 — Acessibilidade

| Prioridade | Item | Arquivo |
|---|---|---|
| P1 | `accessibilityLabel` em botões de início/continuar história | `StoryDetailScreen.js` |
| P1 | `accessibilityLabel` em círculos de cor da paleta | `ColoringScreen.js` |
| P1 | `accessibilityLabel` em ferramentas de colorir | `ColoringScreen.js` |
| P2 | `accessibilityLabel` em cards de histórias | `StoryCard.js` |
| P2 | `accessibilityLabel` em alternativas de quiz | `QuizScreen.js` |
| P2 | `accessibilityLabel` em imagens de cena | `NarrationScreen.js` |
| P3 | Modo de alto contraste | Feature futura |
| P3 | Suporte a Dynamic Type (iOS) | Feature futura |
