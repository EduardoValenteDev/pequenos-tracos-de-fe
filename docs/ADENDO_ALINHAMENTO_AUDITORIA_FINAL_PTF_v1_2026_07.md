# ADENDO DE ALINHAMENTO E AUDITORIA FINAL — Pequenos Traços de Fé
**v1.0 · Julho/2026 · Documento-delta (input do fundador, transcrito para o repo)**

> **⚠️ AVISO DE PRECEDÊNCIA (correções do fundador).** Este adendo é **input** que originou o
> `DOCUMENTO_OFICIAL_PROJETO_FINAL_PTF_v4.md` e o `DECISIONS.md`. Onde este texto divergir do
> `DECISIONS.md`, **o DECISIONS.md prevalece**. Correções explícitas do fundador Eduardo aplicadas
> sobre o texto original deste adendo:
> 1. **Jogos NÃO removidos.** "Pares, Palavrinhas e Bichinhos" eram **nomes amigáveis
>    anteriores/candidatos** dos minijogos, **não** features excluídas. Os jogos (nomes brutos
>    Soletrando, Adivinhar o Animal, Quebra-Cabeça) **continuam no v1**; os nomes finais amigáveis
>    ficam **pendentes** (ver `D-NAMING-JOGOS-PENDENTE`). **Onde este adendo diz que foram removidos,
>    leia-se: renomeados/pendentes.**
> 2. **Desbloqueio da próxima história = Opção B** (exige conclusão total). O fundador escolheu a
>    Opção B; a "regra de duas camadas" que este adendo apresentava como default **não** vale.
> 3. **"Criar com Beni" NÃO é removido em código.** Seu status no v1 fica **A CONFIRMAR** pelo
>    fundador (ver `D-CRIAR-COM-BENI-STATUS`). Onde este adendo pede remoção, trata-se de proposta
>    a confirmar — sem alteração de código.
>
> Documento transcrito de forma limpa (o original chegou com problema de codificação); a substância
> foi preservada. Arbitragem final: `docs/DECISIONS.md`.

---

## 0. Diagnóstico executivo
O projeto está tecnicamente mais forte do que nunca (pipeline de packs: download R2, sha256 real via
`@noble/hashes`, ready-gate, correção do travamento de ~10s com busyRef/mountedRef/throttle, smoke
1604/1604 — trabalho de nível profissional). O **risco nº 1 hoje não é código: é governança de
decisão** — havia uma bifurcação real, com dois "documentos oficiais" e decisões congeladas
contraditórias (lista de jogos, salvamento no grátis, regra de conclusão). A bifurcação está resolvida
(§1) e o protocolo para não repetir está em §8.

## 1. Bifurcação resolvida — decisões do fundador (ver DECISIONS.md)
- **D-BRINCAR-FINAL / D-BRINCAR-JOGOS-V1** — Brincar v1 = **Folha Livre · Minhas Artes · Soletrando ·
  Adivinhar o Animal · Quebra-Cabeça**. *(Correção do fundador: os jogos não foram removidos; nomes
  amigáveis finais pendentes.)* `dailyRoundsService` (2 rodadas/dia por jogo) e ResponsibleUnlockCard =
  specs do v3.1. Único com assets novos: Adivinhar o Animal (15 ilustrações + 15 sons).
- **D-FREE-SEM-SALVAR** — plano grátis **não salva** arte (salvar/Galeria/persistência = Plano
  Família); remove o limite "3 artes"; toque em Salvar → gate parental → paywall (copy gentil);
  colorir continua valendo para progresso; "Minhas Artes"/Livrinho colorido no grátis = estado
  convidativo; Baú cartinhas "Arte" = Plano Família.
- **D-CONCLUSAO-TOTAL-B** — "Concluída" e **desbloqueio da próxima história** exigem
  `isStoryFullyComplete = 10 cenas + quiz + colorir (≥1 página, a confirmar) + Momento/Guardar no
  coração`. *(Correção do fundador: Opção B — o desbloqueio também exige a conclusão total.)* Estado
  intermediário = "Quase lá!". Implementação = bloco próprio posterior.
- Analytics anônimo do v3.1 permanece aprovado (sem AAID/PII, toggle na Área dos Pais).

## 2. Correção de rota visual — o Design System já existe
A **Direção de Arte v1.1 ("O Livro Vivo")** (D1–D4) é a direção oficial: roxo aposentado;
Fraunces+Nunito; multiestilo das capas com **moldura única** ("Galeria Viva"); tokens/hex;
responsividade §2.4. **Não criar outro Design System.** O documento visual antigo (3 histórias,
"Disney/Pixar") é **SUPERSEDED**.
**⚠️ A paleta de status paralela (verde/azul/roxo/vermelho) NÃO deve ser implementada** — viola D2
(roxo aposentado), Lei 1 (uma cor de ação) e Lei 2 (dourado = recompensa). **Status por chip + selo +
ícone + tratamento da arte.** Vocabulário oficial dos estados do card (grátis, premium bloqueada com
selo dourado, liberada não-baixada, baixando, baixada/offline, em andamento, "Quase lá!", concluída
total, erro sem vermelho, requer atualização; "Em breve" **não existe no v1**). Anatomia única do card:
capa com moldura-padrão · título Fraunces · referência Nunito · 1 chip · 1 indicador de estado · 1 CTA
terra.

> **↪ Nota normativa superveniente (2026-08-07 · abertura da Fase 6).** O trecho acima *"premium
> bloqueada com **selo dourado**"* está **SUPERADO** por
> [`D-SELOS-ESTADO-V2`](DECISIONS.md) em `docs/DECISIONS.md`: o selo do **Plano Família** passa a ser
> **azul premium luminoso e acolhedor** (nunca roxo, nunca azul-noite escuro); **Grátis** = verde
> suave; **Concluída** = dourado, reservado a recompensa. O **HEX exato ainda não existe** — será
> derivado no ciclo SDD da Fase 6. **Todo o resto deste parágrafo continua valendo integralmente:**
> proibição da paleta de status paralela, roxo aposentado, erro sem vermelho, status por chip + selo
> + ícone + tratamento da arte, vocabulário oficial dos estados e anatomia única do card. O texto
> original **foi preservado e não apagado**.

## 3. Auditoria — respostas (resumo)
Plano coerente, com dois ajustes: (a) **A0 tokens/fontes em paralelo à migração dos 18 packs**; (b)
**RevenueCat: código depois do piloto user-facing, mas preparação externa começa agora** (contas,
produtos, dashboard RC, teste fechado do Play — lead time de semanas). Riscos técnicos: premium
vazando no bundle, OOM/jank em Android 2–3 GB, base64 em fluxo de usuário, restore/entitlement, build
real revelando o que o Expo Go mascara → **build de medição logo após o piloto**. Riscos visuais: os 7
da v1.1 + estados de download com cara técnica → resolvidos pelo vocabulário de status. Tela de
detalhe desalinhada → correção em 3 tempos (estados sóbrios agora → A0 tokens → A14 página-dupla).

## 4. Sequência integrada (~8 semanas) — ver v4 §17
Caminho crítico: packs user-facing → build real → Brincar premium → RevenueCat → Android fraco → loja.
8 semanas = meta saudável; 6 = otimista; 10 = margem.

## 5. Acesso centralizado (fecha o risco de brecha)
Camada única `can('openStory'|'downloadPack'|'playAudio'|'startGameRound'|'saveArt'|'openGallery'|
'useExclusiveAvatar'|'unlimitedRounds', ctx) → { allowed, reason }`. UI nunca compara plano
diretamente; só consome `can()`. Rotas diretas (deep open premium) também passam por `can()`. Testes
de brecha no smoke: abrir premium por rota, salvar no grátis, 3ª rodada do dia, download sem
entitlement.

## 6. Checklist-padrão de bloco
Escopo permitido (arquivos listados) · arquivos proibidos · gates (smoke + expo-doctor + audits +
grep de cores fora de token pós-A0 + gate responsivo 3 larguras × fontScale 1.0/1.3 + auditoria de
requires premium) · validação humana iPhone **e** Android intermediário (blocos user-facing) ·
critério de saída explícito · risco de regressão declarado · Δ de peso reportado · commit seletivo ·
push só autorizado.

## 7. Bloco documental obrigatório (este D0.1)
HEAD `424972b` · F2.4e.1/F2.4e.2 concluídos · smoke 1604 · piloto premium = Davi e Golias · consumo
user-facing pendente (F2.4e.3–5) · D-BRINCAR-JOGOS-V1, D-FREE-SEM-SALVAR, D-CONCLUSAO-TOTAL-B ·
D1–D4 da Direção de Arte v1.1 · vocabulário de status · documento visual antigo SUPERSEDED ·
RevenueCat-prep paralelo autorizado.

## 8. Protocolo antibifurcação (causa-raiz) — ver DECISIONS.md D-ANTIBIFURCACAO
(1) Uma fonte de verdade (Documento Oficial v4). (2) DECISIONS.md é o árbitro. (3) Toda sessão de IA
começa lendo DECISIONS.md. (4) Mudança de decisão: fundador → DECISIONS.md → documentos → código.
(5) Decisão só-em-conversa não é decisão.

## 9. Não fazer agora
Paleta de status colorida · novo design system paralelo · **remover Criar com Beni em código** (status
a confirmar) · tratar Soletrando/Adivinhar o Animal/Quebra-Cabeça como removidos · backend/login/
anúncios/tracking · RevenueCat-código antes do piloto user-facing · premium no binário · repintar
telas que morrem · linguagem técnica (pack/manifesto/sha256/MB) para criança · SDKs fora da lista ·
decidir em conversa sem registrar.

---
*Incorporado ao Documento Oficial v4 no bloco documental D0.1 (2026-07-05). Arbitragem: DECISIONS.md.*
