# ACCESS AND MONETIZATION RULES — Pequenos Traços de Fé

> **Arquitetura de acesso e monetização.** Nenhuma compra real será implementada agora. Este documento define a estrutura que o código deve respeitar para que compras possam ser adicionadas sem refatoração destrutiva.

---

## 1. Planos Disponíveis

### 1.1 Gratuito (padrão, sem ação)
- Acesso imediato, sem login, sem pagamento
- Conteúdo incluído:
  - Trilha Comece Aqui completa: A Criação + Noé e o Arco-Íris
  - Ateliê da Criação (máximo 3 artes salvas)
  - Meu Livrinho da Fé da história de Noé
  - Todas as conquistas relacionadas ao conteúdo gratuito

### 1.2 Premium (futuro)
- Desbloqueio por compra na loja (App Store / Google Play)
- Conteúdo incluído:
  - Tudo do plano gratuito
  - Trilha Pequeninos completa (Davi, Jesus, Daniel e mais)
  - Trilhas futuras (Descobridores, Jovens da Fé)
  - Ateliê ilimitado
  - Meu Livrinho da Fé de todas as histórias
  - Novas histórias automaticamente

### 1.3 História Avulsa (futuro)
- Compra única por história específica
- Desbloqueia: a história + colorir + Meu Livrinho da Fé dessa história
- Não inclui outras histórias ou futuros conteúdos

### 1.4 Plano Mensal (futuro)
- Assinatura recorrente mensal
- Mesmos benefícios do Premium enquanto ativa

### 1.5 Plano Anual (futuro)
- Assinatura recorrente anual
- Desconto em relação ao mensal
- Mesmos benefícios do Premium enquanto ativa

### 1.6 Vitalício (futuro)
- Compra única permanente
- Todos os benefícios do Premium para sempre, incluindo conteúdos futuros

---

## 2. O Que Cada Plano Libera

| Conteúdo | Gratuito | Avulso | Mensal/Anual | Vitalício |
|---|---|---|---|---|
| A Criação | ✅ | ✅ | ✅ | ✅ |
| Noé e o Arco-Íris | ✅ | ✅ | ✅ | ✅ |
| Davi e Golias | ❌ | ✅ (se comprar avulso) | ✅ | ✅ |
| Jesus e as Crianças | ❌ | ✅ | ✅ | ✅ |
| Daniel e os Leões | ❌ | ✅ | ✅ | ✅ |
| Histórias futuras | ❌ | ❌ | ✅ | ✅ |
| Ateliê ilimitado | ❌ (3 artes) | ❌ | ✅ | ✅ |
| Livrinho todas histórias | ❌ | ✅ (da história comprada) | ✅ | ✅ |

---

## 3. Arquitetura de Controle de Acesso

### 3.1 Função Central
```javascript
// src/services/accessControl.js
export function hasAccess(accessType) {
  // accessType: 'free' | 'premium'
  // Verifica plano atual do usuário
  // Retorna: boolean
}

export function getCurrentPlan() {
  // Retorna: 'free' | 'premium' | 'monthly' | 'annual' | 'lifetime'
  // Por enquanto: sempre retorna 'free'
}
```

### 3.2 Enum de tipos de acesso (em stories.js)
```javascript
export const ACCESS_TYPE = {
  FREE: 'free',
  PREMIUM: 'premium',
};
```

Cada história tem `accessType: ACCESS_TYPE.FREE | ACCESS_TYPE.PREMIUM`.

### 3.3 Verificação na UI
```javascript
const canAccess = hasAccess(story.accessType);
if (!canAccess) {
  // Exibir estado bloqueado
}
```

---

## 4. Como Exibir Bloqueios

### Regras de bloqueio gentil
- Nunca exibir tela de erro agressiva
- Nunca interromper a navegação com modal obrigatório
- O card da história bloqueada deve aparecer, mas com visual de "locked"
- Ao tocar no card bloqueado: exibir modal de benefícios, não proibição

### Modal de desbloqueio
```
Título: "✨ [Nome da história] é especial!"
Descrição: "Explore toda a aventura com o plano premium. Conheça Davi, Jesus e muito mais!"
Botão 1: "Ver benefícios ✨" → Tela de compra (futura)
Botão 2: "Voltar" → Fechar modal
```

**Nunca usar:** "Você não pode acessar", "Conteúdo bloqueado", "Compre agora" em tom imperativo.

### Visual do card bloqueado
- `opacity: 0.70` no conteúdo do card
- Ícone 🔒 no canto superior direito
- Badge "Premium ✨" em dourado suave
- Sem riscar o título ou alterar o texto

---

## 5. Proteção de Compras por Área dos Pais

**Todas as compras devem ser iniciadas apenas pela Área dos Pais.**

- O botão de compra na tela da criança leva para a Área dos Pais (com confirmação simples: "Só adultos aqui. Você é um adulto?")
- A confirmação de compra nunca é apresentada diretamente à criança
- Histórico de compras visível apenas na Área dos Pais

---

## 6. Restauração de Compras (Futura)

- Botão "Restaurar compras" na Área dos Pais
- Chama API da loja (StoreKit / Google Play Billing)
- Atualiza plano local
- Disponível offline para conteúdo já baixado

**Implementação futura — não implementar agora.** Preparar apenas a interface e o placeholder da função.

---

## 7. Offline com Conteúdo Liberado

Conteúdo desbloqueado pelo plano deve funcionar offline:
- Histórias e imagens estão no bundle do app (não requerem download)
- Progresso local não depende de verificação online
- A verificação de plano usa cache local do receipt de compra (futuro)
- Se offline e plano não verificável: usar último estado conhecido (não bloquear)

---

## 8. Não Implementar Compras Reais Agora

O código atual deve:
- ✅ Definir `accessType` em cada história (`'free'` ou `'premium'`)
- ✅ Ter função `hasAccess()` que retorna `true` para `'free'` e `false` para `'premium'` por padrão
- ✅ Exibir visual de bloqueio correto nos cards premium
- ❌ NÃO chamar APIs de compra (StoreKit, Google Play Billing)
- ❌ NÃO processar receipts
- ❌ NÃO cobrar nada

**Quando compras forem implementadas:** substituir apenas a função `hasAccess()` e adicionar o serviço de billing — sem refatorar as telas.

---

## 9. Limite do Ateliê no Plano Gratuito

- `ATELIER_FREE_SAVE_LIMIT = 3` (definido em `atelierStorage.js`)
- Ao tentar salvar acima do limite: exibir modal gentil
- Modal: "Sua galeria está cheia! Com o plano premium você salva artes ilimitadas. 🎨"
- Opções: "Ver premium" | "Apagar uma arte" | "Cancelar"

---

## 10. Comunicação de Valor ao Usuário

Nunca comunicar bloqueio como punição. Sempre como oportunidade:

| Evitar | Preferir |
|---|---|
| "Conteúdo bloqueado" | "Aventura especial aguardando!" |
| "Você não tem acesso" | "Descubra ainda mais histórias!" |
| "Compre para desbloquear" | "Explore com o plano premium ✨" |
| "Limite atingido" | "Sua galeria está cheia de arte!" |
