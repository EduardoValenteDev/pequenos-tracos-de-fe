# PRODUCT BLUEPRINT — Pequenos Traços de Fé

> ⚠️ **SUPERSEDED — DOCUMENTO HISTÓRICO (não normativo).** Marcado em **2026-07-21** (PTF PRODUCT LOCK 01A).
>
> **Este documento NÃO deve orientar novas decisões nem implementações.** Ele contém definições **obsoletas** — por exemplo: mascote **"Lumi"** (o oficial é **Beni**), faixa etária **3–8** (revogada por **PL01A-04**: público 6–8, acessível ~5–10), **"3 artes grátis"** (hoje grátis = **0 salvamentos**), planos **"Vitalício"/"Avulso"** (fora do lançamento) e **"tudo no bundle"** (hoje catálogo **híbrido** com 18 premium sob demanda).
>
> **Fontes vigentes (nesta ordem):** hierarquia de governança [`docs/PROJECT_SOURCE_OF_TRUTH.md`](docs/PROJECT_SOURCE_OF_TRUTH.md) → `.specify/memory/constitution.md` → `AGENTS.md` → `CLAUDE.md`; decisões de produto em [`docs/DECISIONS.md`](docs/DECISIONS.md) (**árbitro**) → [`docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md`](docs/DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md) (linha de lançamento vigente); mapa em [`docs/DOCUMENTATION_INDEX.md`](docs/DOCUMENTATION_INDEX.md).
>
> O conteúdo abaixo é **preservado apenas como histórico** e **não foi reescrito**.

> **Documento mestre de produto.** Toda decisão de feature, UI, conteúdo e monetização deve ser validada contra este documento antes de implementação.

---

## 1. Proposta Central

**Pequenos Traços de Fé** é um app infantil cristão premium que leva histórias bíblicas para crianças de 3 a 8 anos por meio de narração, colorir interativo e criação artística. Cada história é uma experiência completa: a criança ouve, vê, pinta e cria — deixando uma marca própria na jornada da fé.

O app não é uma coleção de atividades soltas. É uma jornada progressiva e afetiva, pensada para ser vivida junto com a família.

---

## 2. Público Principal

| Faixa | Relação com o app |
|---|---|
| 3–6 anos | Público primário. Precisa de toque simples, imagens grandes, narração guiada, paleta fácil. Não lê sozinha. |
| 7–8 anos | Público secundário. Já lê e quer mais autonomia. Aprecia conquistas e desafios. |
| Pais e responsáveis | Usuários indiretos. Controlam compras, acompanham progresso, escolhem conteúdo. |

**Regra de tom:** o app não pode parecer bobo para crianças maiores, nem intimidador para as menores. Simples, caloroso e encantador para todos na faixa 3–8.

---

## 3. Experiência Familiar

O app é projetado para ser usado em família:
- Criança usa a tela principal sem precisar de ajuda técnica.
- Pais acompanham pela Área dos Pais.
- Conteúdo é sempre seguro, sem anúncios, sem redes sociais, sem links externos.
- Cada sessão pode durar 5–15 minutos — ideal para hora do sono, lição dominical ou momento de leitura familiar.

---

## 4. Offline por Padrão

Após instalado, o app deve funcionar sem internet para:
- Todas as histórias já desbloqueadas
- Imagens de colorir de todas as cenas
- Áudios de narração
- Progresso, estrelas e conquistas
- Galeria de artes salvas
- Ateliê da Criação

A internet é necessária apenas para: validar compras, restaurar plano premium, verificar atualizações de conteúdo.

**Regra:** nenhuma tela principal pode ficar travada aguardando conexão. Se offline, mostrar conteúdo disponível ou mensagem amigável.

---

## 5. Sem Login Obrigatório (v1)

A primeira versão usa **perfil local da criança**:
- Nome e avatar salvos localmente
- Progresso local (AsyncStorage / armazenamento seguro)
- Desenhos salvos localmente
- Sem conta, sem senha, sem e-mail obrigatório

A arquitetura deve ser preparada para sincronização futura (backup em nuvem, restauração de compras), mas sem implementá-la agora.

---

## 6. Mascote: Lumi, o Cordeirinho Guia

- **Nome:** Lumi
- **Espécie:** Cordeirinho (ovelha pequena)
- **Personalidade:** gentil, curioso, acolhedor, levemente tímido
- **Papel:** guia a criança pelas histórias e pelo Ateliê; aparece em celebrações, conquistas e momentos de transição
- **Regra:** Lumi nunca assusta, nunca pressiona, nunca julga. Ele incentiva e celebra.
- **Uso:** telas de loading, conquistas, boas-vindas, Ateliê, tela de erro amigável
- **Regra crítica:** Nenhum personagem bíblico (Noé, Davi, Jesus etc.) pode ser usado como mascote do app.
- **Implementação (Sprint 2.1+):** `<LumiAvatar>`, `<LumiGuideCard>`, `<LumiSpeechBubble>`, `<LumiEmptyState>`, `<LumiLockedState>`, `<LumiCelebrationBadge>` — ver `src/components/lumi/`

### Presença de Lumi por tela
| Tela | Componente |
|---|---|
| Home | `LumiGuideCard` (sidebar tablet / inline mobile) |
| Aventuras | `LumiGuideCard` (sidebar tablet / inline mobile) |
| Narração | `LumiSpeechBubble` (mensagem rotativa por cena) |
| Ateliê | `LumiGuideCard` (sidebar tablet / inline mobile) |
| Coming-soon | `LumiEmptyState` |
| Premium bloqueado | `LumiLockedState` |

---

## 7. Trilhas

### 7.1 Comece Aqui (Gratuita)
Introdução à experiência. Histórias fundamentais do Antigo Testamento.

| História | Status |
|---|---|
| A Criação | Gratuita |
| Noé e o Arco-Íris | Gratuita |

### 7.2 Pequeninos (Premium)
Histórias para os menores, com linguagem adaptada para 3–5 anos.

| História | Status |
|---|---|
| Davi e Golias | Premium |
| Jesus e as Crianças | Premium |
| Daniel e os Leões | Premium (futuro) |

### 7.3 Descobridores (Futuro, Premium)
Histórias com mais profundidade para 6–8 anos.

### 7.4 Jovens da Fé (Futuro, Premium)
Histórias para crianças de 8+ com desafios de memorização e reflexão.

---

## 8. Papel do Ateliê da Criação

O Ateliê é o espaço livre de criação:
- **Minha Folha Mágica:** canvas em branco para desenho livre
- **Desafio da Imaginação:** missão diária com tema sugerido
- **Galeria dos Pequenos Artistas:** artes salvas pela criança

O Ateliê faz parte do MVP e não pode ser removido. No plano gratuito, a galeria é limitada a 3 artes. No premium, ilimitada.

---

## 9. Papel do Colorir

O colorir interativo é o coração emocional do app:
- Cada cena da história tem uma imagem para colorir
- A criança escolhe as cores e preenche os espaços
- Ao concluir com pelo menos uma cor, a cena é marcada como pintada
- Os desenhos são salvos e usados futuramente no Meu Livrinho da Fé

**Regra:** colorir não pode ser opcional na experiência central. É o momento de expressão pessoal da criança na história.

---

## 10. Papel das Estrelas

Estrelas são a moeda de conquista do app. Elas medem engajamento e esforço — não perfeição.
- Ganhas por ouvir, colorir e concluir cenas
- Exibidas em destaque na tela da criança
- Usadas para desbloquear conquistas especiais
- Nunca perdidas (só aumentam)

Detalhamento em [PROGRESSION_RULES.md].

---

## 11. Papel das Conquistas

Conquistas (selos/badges) são marcos visuais que celebram a jornada:
- Primeira cena concluída, primeira arte salva, primeira história completa, etc.
- Cada conquista tem animação e mensagem especial
- Visíveis no perfil da criança e na Área dos Pais

Detalhamento em [PROGRESSION_RULES.md].

---

## 12. Papel do Meu Livrinho da Fé

Recurso especial ativado ao concluir uma história completa:
- Monta uma sequência animada com os desenhos coloridos da criança
- Narração contínua da história
- A criança "vê o livro que ela mesma fez"
- Disponível apenas para histórias do plano premium (e Noé como gratuito)
- Implementação futura (Sprint 5)

---

## 13. Plano Gratuito vs. Premium

| Recurso | Gratuito | Premium |
|---|---|---|
| Trilha Comece Aqui (A Criação + Noé) | ✅ Completo | ✅ |
| Trilha Pequeninos | ❌ Bloqueado | ✅ |
| Trilhas futuras | ❌ | ✅ |
| Ateliê | ✅ (3 artes) | ✅ Ilimitado |
| Meu Livrinho da Fé | ✅ (Noé) | ✅ Todas |
| Novas histórias | ❌ | ✅ Automático |

---

## 14. Padrões de Componentes Visuais (Sprint 2.1+)

Os seguintes componentes são os padrões obrigatórios para novos desenvolvimentos:

| Situação | Componente obrigatório |
|---|---|
| Badge de acesso de história | `<StatusBadge type="free|premium|coming_soon|..." />` |
| Capa de história sem imagem real | `<StoryFallbackCover themeColor={...} icon={...} />` |
| Capa de história com imagem real (16:9) | `<StoryCoverImage story={story} />` — nunca `<Image resizeMode="contain">` |
| Hero da tela de detalhe | `<StoryBookHero />` — capa 16:9, sem moldura falsa |
| Guia emocional nas telas | `<LumiGuideCard context="..." />` |
| Narração + orientação | `<LumiSpeechBubble message={...} />` |
| Estado vazio de trilha | `<LumiEmptyState />` |
| Estado de conteúdo premium | `<LumiLockedState />` |

**Design tokens:** sempre importar de `src/theme/productTheme.js` — ver DESIGN_SYSTEM.md seção 13.

---

## 15. Princípios de Produto

1. **A criança primeiro.** Interface pensada para mãos pequenas e atenção curta.
2. **Offline por padrão.** Nenhuma funcionalidade core depende de internet.
3. **Zero frustração.** Bloqueios devem ser gentis, explicativos e nunca abruptos.
4. **Conteúdo bíblico fiel e acessível.** Adaptado para crianças, sem perder a essência.
5. **Progressão visível.** A criança sempre sabe o que conquistou e o que vem a seguir.
6. **Familiar e seguro.** Pais confiam porque o app é fechado, sem ads, sem links externos.
7. **Polido antes de amplo.** Melhor ter 2 histórias perfeitas do que 10 com bugs.
8. **Não redesenhar o que funciona.** Evoluir incrementalmente, sem regressões.
