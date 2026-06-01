# PROGRESSION RULES — Pequenos Traços de Fé

> **Sistema de progressão coerente.** Define como estrelas, conquistas e conclusões funcionam. Toda nova mecânica de progressão deve respeitar estas regras para evitar duplicação, inflação ou perda de dados.

---

## 1. Estrelas por Cena

Cada cena pode render até **3 estrelas**. As estrelas são ações independentes:

| Ação | Estrelas | Condição |
|---|---|---|
| Ouvir / ler a narração da cena | 1 | Completar a narração (chegar ao fim da cena de narração) |
| Colorir a cena | 1 | Aplicar pelo menos uma cor no canvas (hasPainted = true) |
| Concluir a cena (botão Pronto) | 1 | Pressionar Pronto após ter colorido |

**Total máximo por cena:** 3 estrelas.
**Total máximo por história de 10 cenas:** 30 estrelas.

---

## 2. Bônus de História Completa

Ao concluir todas as cenas de uma história (todas marcadas como completas):
- **+5 estrelas de bônus**
- Animação de celebração especial
- Desbloqueio do **Selo da História**
- Desbloqueio do **Meu Livrinho da Fé** (para essa história)

---

## 3. Ateliê — Estrelas Limitadas

O Ateliê não pode gerar estrelas infinitas. Regras:

| Ação | Estrelas | Limite |
|---|---|---|
| Desafio da Imaginação concluído | 1 | 1 por dia (cooldown 24h) |
| Desenho livre salvo | 0 | Não gera estrela (pode desbloquear conquista) |
| Criar múltiplas artes no mesmo dia | 0 | Sem estrelas extras além do Desafio diário |

---

## 4. Regra Anti-Duplicação

**Nunca conceder a mesma estrela duas vezes pela mesma ação na mesma cena.**

Implementação:
- Cada combinação `{storyId, cenaId, action}` pode ter no máximo 1 estrela
- `action` ∈ `['narration', 'coloring', 'complete']`
- Verificar antes de conceder: `if (alreadyGranted(storyId, cenaId, action)) return;`
- O mesmo princípio para o bônus de história: `if (completionBonusGranted(storyId)) return;`

---

## 5. Conquistas

As conquistas são marcos one-shot — conquistadas uma vez, nunca perdidas.

| ID | Nome | Condição de desbloqueio |
|---|---|---|
| `first_scene` | Primeira Aventura | Primeira cena de qualquer história concluída |
| `first_art` | Primeiro Traço | Primeira arte salva no Ateliê |
| `first_story` | Contador de Histórias | Primeira história completa |
| `stars_5` | 5 Estrelinhas | Acumular 5 estrelas totais |
| `stars_10` | 10 Estrelinhas | Acumular 10 estrelas totais |
| `stars_30` | 30 Estrelinhas | Acumular 30 estrelas totais |
| `stars_50` | Colecionador de Luz | Acumular 50 estrelas totais |
| `first_trail` | Explorador da Fé | Primeira trilha completa (todas as histórias da trilha) |
| `artist` | Artista da Fé | Salvar 3 artes no Ateliê |
| `listener` | Pequeno Ouvinte | Ouvir 5 cenas de narração |

**Regras de conquistas:**
- Verificar desbloqueio após cada ação relevante
- Mostrar animação de conquista ao desbloquear (não durante ação — esperar conclusão da cena)
- Nunca re-exibir conquista já desbloqueada
- Salvar timestamp de desbloqueio localmente

---

## 6. Persistência e Migração

### Estrutura de dados esperada (AsyncStorage)
```javascript
// Progresso de cena
progress_{storyId} = {
  scenes: {
    [cenaId]: {
      narrationDone: boolean,
      coloringDone: boolean,
      completeDone: boolean,
      starsGranted: number, // 0–3
    }
  },
  completionBonusGranted: boolean,
  totalStars: number,
}

// Conquistas
achievements = {
  [achievementId]: {
    unlocked: boolean,
    unlockedAt: ISO string | null,
  }
}

// Total global de estrelas
globalStars = number
```

### Migração de dados antigos
Se dados antigos existirem no formato anterior:
- Leitura defensiva: `try/catch` em torno de todo acesso ao AsyncStorage
- Se o dado estiver corrompido ou no formato incompatível: usar valor padrão (0 ou false), não crashar
- Nunca deletar dados antigos sem confirmação explícita do usuário
- Logar warning em DEV: `console.warn('[Progress] migrating legacy data', key)`

---

## 7. Estrelas no Ateliê — Desafio da Imaginação

- Após completar o Desafio da Imaginação (criar arte com a missão sugerida):
  - Verificar se já foi concedida hoje (`lastChallengeDate === today`)
  - Se não: conceder 1 estrela, salvar `lastChallengeDate = today`
  - Se sim: sem estrela, sem mensagem de erro — só não conta
- "Hoje" = data local do dispositivo (não UTC)

---

## 8. Exibição de Estrelas

- Total de estrelas: exibido em destaque na tela inicial / perfil da criança
- Por cena: ícones de estrela (☆☆☆ → ★★★) no card da cena
- Por história: barra de progresso ou contador `X/30 estrelas`
- Nunca subtrair estrelas (mesmo se a cena for revisitada)
- Estrelas douradas (`#FFD700`) com animação de brilho ao ganhar

---

## 9. Cenas Revisitadas

Se a criança abrir uma cena já concluída:
- Pode colorir de novo (usando o desenho salvo ou começando do zero)
- **Não ganha estrelas novamente** (já marcadas como concedidas)
- Pode salvar o novo desenho sobrescrevendo o anterior
- O progresso (conclusão) não volta atrás

---

## 10. Validação de "Concluir"

A cena só pode ser marcada como `completeDone = true` se:
1. `coloringDone === true` (já coloriu com pelo menos uma cor)
2. O botão Pronto foi pressionado

A estrela de `coloring` é concedida quando `hasPainted` muda de false para true (primeiro toque de cor). A estrela de `complete` é concedida no momento em que o modal de celebração é exibido.
