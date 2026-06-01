# PARENT AREA RULES — Pequenos Traços de Fé

> **Regras da Área dos Pais.** Separa claramente o fluxo da criança do fluxo adulto. Feedback, compras e configurações sensíveis pertencem aqui — nunca no fluxo principal da criança.

---

## 1. Princípio Fundamental

**Tudo que requer julgamento adulto pertence à Área dos Pais.**

A criança nunca deve ser exposta a:
- Solicitações de compra direta
- Avaliação / feedback com formulário
- Configurações técnicas
- Opções de limpar progresso
- Informações sobre plano ou cobrança

---

## 2. Acesso à Área dos Pais

### Localização
- Botão de acesso visível na tela inicial (ícone de engrenagem ou 👨‍👩‍👧 na barra superior)
- Não deve ser chamativo demais para não distrair a criança

### Proteção simples de adulto
Ao tentar acessar:
1. Exibir tela/modal: **"Só para adultos! 👋"**
2. Desafio simples que criança pequena não resolve facilmente:
   - Opção A: campo de texto com instrução "Digite o número [X]" (X gerado aleatoriamente de 10–99)
   - Opção B: PIN de 4 dígitos configurável pelo pai
   - Opção padrão: campo numérico aleatório (simples, sem PIN cadastrado)
3. Exibir hint: "Isso é para garantir que é um adulto navegando."
4. Após acesso: nenhuma proteção adicional dentro da área (não é área bancária)

**Nota:** proteção leve, não biometria. O objetivo é evitar acesso acidental pela criança, não segurança bancária.

---

## 3. Conteúdo da Área dos Pais

### 3.1 Progresso da Criança
- Nome e avatar
- Total de estrelas ganhas
- Número de cenas concluídas / total
- Número de histórias completas
- Conquistas desbloqueadas (grid com ícones)
- Data da última atividade

### 3.2 Histórias Concluídas
- Lista de histórias com % de conclusão
- Quais cenas foram narradas, coloridas, concluídas
- Data de conclusão (quando disponível)

### 3.3 Galeria de Artes
- Miniatura de todas as artes salvas no Ateliê
- Data de criação
- Opção de apagar arte individual

### 3.4 Plano Atual
- Exibir: "Plano Gratuito" ou "Plano Premium"
- Botão: "Ver benefícios do Premium" (leva à tela futura de compra)
- Número de artes salvas / limite (se gratuito)

### 3.5 Comprar Premium
- Placeholder por enquanto: "Em breve — fique ligado!"
- Quando implementado: iniciar fluxo de compra da loja

### 3.6 Restaurar Compras
- Placeholder por enquanto
- Quando implementado: chamar `restorePurchases()` e atualizar estado local

### 3.7 Feedback
- Campo de texto livre: "O que você achou do app?"
- Envio via e-mail ou formulário (futura integração)
- **Nunca no fluxo principal da criança**

### 3.8 Avaliar o App
- Link direto para App Store / Google Play
- Após 3+ sessões da criança (contagem local)
- Mostrado apenas na Área dos Pais — nunca modal que interrompe a criança
- **Nunca** solicitar avaliação durante ou imediatamente após experiência da criança

### 3.9 Suporte
- E-mail de suporte: link `mailto:`
- FAQ básico inline (collapsible)
- Versão do app exibida (para diagnóstico)

### 3.10 Privacidade
- Texto simples sobre coleta de dados (offline-first = pouquíssimo dado)
- Link para política de privacidade completa
- Confirmação: "Este app não coleta dados pessoais das crianças"

### 3.11 Configurações de Áudio
- Ativar/desativar sons de interface
- Ativar/desativar narração (música de fundo separada se implementada)
- Volume (slider) — futuro

### 3.12 Limpar Progresso
- Opção: "Apagar todo o progresso da criança"
- Dupla confirmação: "Tem certeza? Isso apaga estrelas, conquistas e desenhos salvos."
- Segunda confirmação: campo de texto com "APAGAR" para confirmar
- Irreversível — avisar claramente

---

## 4. Feedback e Avaliação — Nunca no Fluxo da Criança

**Proibido:**
- Modal de "Avalie o app" durante uma história
- Formulário de feedback após colorir
- Pedido de avaliação após conquista
- Qualquer interrupção do fluxo da criança para fins adultos

**Permitido:**
- Banner sutil na Área dos Pais: "Gostou do app? Avalie-nos!"
- Email de acompanhamento (futura opt-in)
- Solicitação de avaliação dentro da Área dos Pais

---

## 5. Navegação da Área dos Pais

```
Área dos Pais
├── Progresso
│   ├── Resumo (estrelas, cenas, conquistas)
│   └── Por história (detalhe)
├── Galeria
├── Meu Plano
│   ├── Plano atual
│   ├── Ver premium
│   └── Restaurar compras
├── Configurações
│   ├── Áudio
│   └── Limpar progresso
└── Sobre
    ├── Feedback
    ├── Avaliar
    ├── Suporte
    └── Privacidade
```

---

## 6. Estilo Visual da Área dos Pais

- Tom mais sóbrio que o fluxo da criança (menos emojis decorativos, tipografia mais formal)
- Mesma paleta base (cream, white, deepBlue) — mas sem gradientes infantis
- Ícones claros e funcionais
- Não precisa ter o Lumi como guia (é área adulta)
- Manter `fontFamily: 'Nunito'` para consistência

---

## 7. Regras de Implementação

- A proteção de acesso deve ser implementada antes de expor qualquer funcionalidade sensível
- Toda ação destrutiva (limpar progresso, apagar arte) requer confirmação explícita
- Compras nunca são iniciadas sem estar na Área dos Pais
- A Área dos Pais não substitui o suporte técnico — manter e-mail de suporte visível
