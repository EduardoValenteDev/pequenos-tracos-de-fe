# DECISIONS.md — Decisões Congeladas do Projeto Pequenos Traços de Fé

> **Fonte:** `DOCUMENTO_MESTRE_EXECUCAO_PTF_v3.1.md` (fonte única de verdade de escopo e sequência).
> **Registrado em:** 2026-07-02 · **Commit-base do registro:** `b1ed31a` (branch `content-integrate-coloring-3`).
> **Regra:** as decisões abaixo são **CONGELADAS**. Nenhuma IA (Claude Code, Codex ou consultiva) pode reabri-las. Se uma implementação parecer conflitar com uma decisão congelada, **parar e reportar — não improvisar**. Alterações exigem autorização explícita do fundador e atualização deste arquivo.

## Microcorreção aplicada (Seção 0, item 4 do Documento Mestre)
As decisões da Seção 2 (P1–P10) estão **RESOLVIDAS E CONGELADAS** (não mais "pendentes"). Não reabrir P1 a P10. Se uma implementação depender de conta **Apple Developer** ou **Google Play Console** ainda não criada, registrar como **dependência externa do fundador** e continuar apenas com os blocos que **não** dependem das contas.

## Dependência externa (não bloqueia blocos técnicos independentes)
- **Contas de loja (Bloco 0.1):** as contas **Apple Developer** (US$ 99/ano, aprovação pode levar dias) e **Google Play Console** (taxa única US$ 25) **serão assinadas pelo fundador amanhã (a partir de 2026-07-03)**. Até lá, tratar como **dependência externa temporária**.
- **Bloqueiam** (não iniciar até as contas existirem): RevenueCat real, produtos de assinatura, IAP sandbox, TestFlight externo, faixa fechada do Google Play, store assets finais, submissões.
- **Preferir** conta Google Play de **organização (CNPJ)** se disponível (evita a exigência de teste fechado). Se a conta Play for pessoal e nova (criada após 13/nov/2023): planejar **teste fechado com 12 testadores por 14 dias contínuos** desde o início.

---

## SEÇÃO 1 — DECISÕES CONGELADAS

### Produto e conteúdo
1. **Lançamento com 20 histórias** (10 cenas cada — conteúdo completo e verificado: 200 cenas, 200 colorir, ~224 MP3). Nenhuma história é cortada; nenhuma história 21+ entra antes do lançamento.
2. **Público 3–8 anos.** "Jovens da Fé" é nome de **região do mapa**, não faixa etária.
3. **Mascote: Beni.** Resíduo interno "Lumi" é **dívida técnica pós-lançamento** (0 ocorrências visíveis ao usuário — **não tocar antes da loja**).
4. **Quiz: exatamente 4 perguntas por história.** Config e copy devem dizer o mesmo número. Perguntas excedentes viram banco reserva para revisitas.
5. **Modo Igreja NÃO aparece no v1.** Cultinho em Casa fica. Modo Igreja, "Criar turma" e qualquer "em preparação" ficam atrás de flag de build.
6. **Ferramentas internas invisíveis em produção:** Modo QA/Criador, Testar Desenhos, Resetar Guias, Build info — atrás de flag.
7. **Nenhuma feature aparece antes de ser apresentada** (introdução progressiva). Ex.: o Baú só aparece na Home após a primeira história concluída, anunciado pelo Beni.

### Aba Brincar (decisão inegociável do fundador)
8. **A aba Ateliê deixa de existir. Nome oficial: Brincar.**
9. **Brincar tem exatamente 5 entradas:** Folha Livre · Minhas Artes (salvar arte) · **Soletrando** · **Adivinhar o Animal** · **Quebra-Cabeça**.
10. **Saem do v1:** "Colorir uma história" dentro do Brincar (colorir vive **só** dentro da jornada das histórias); Desenho guiado pelo Beni (volta pós-lançamento); Pares/Palavrinhas/Bichinhos (substituídos pelos 3 jogos oficiais).
11. **Cada jogo tem 2 rodadas grátis por dia** (contador separado por jogo, por perfil, por data local). Plano Família = ilimitado.
12. **Ao esgotar as rodadas:** card carinhoso "solicitar ao responsável" → **gate parental** → tela do Plano Família → compra. Nunca preço, urgência ou compra direta para a criança.

### Fluxo pós-história (arquitetura de ritual)
13. A conclusão de história deixa de ser painel com ~10 ações e vira **ritual sequencial**: Celebração curta → Livrinho como presente principal → **Certificado é a última página do Livrinho** → **Guardar no coração é a transição que envia a lembrança ao Baú** → tela final com **apenas 3 caminhos**: Responder Quiz (+1⭐) · **"Ver o mapa se colorir"** · Voltar ao início. "Rever aventura" mora só no card da história.
14. **Baú = álbum de memórias visuais reais** (arte da criança, cena-chave, certificado, versículo sobre arte da história, capa do Livrinho, lembrança do Cultinho). Cards de texto genérico com fundo colorido são eliminados ou ganham arte real.
15. **B5.4 = momento guiado** com CTA "Ver o mapa se colorir" (arquitetura na Seção 5.2 do Documento Mestre). O patch pausado `ptf_b5_4_3` é **descartado, não reaproveitado**. **Sem persistência nova (`@ptf_*`)** para o reveal; fallback = estático B5.3.1.

### Monetização e acesso
16. **Grátis:** Criação + Noé completas · colorir das grátis liberado · **salvar até 3 artes** (não remover salvamento do grátis) · 2 rodadas/dia por jogo · Livrinho/quiz/rituais das histórias grátis liberados.
17. **Plano Família:** 20 histórias, jogos ilimitados, artes ilimitadas, avatares exclusivos (estado a inventariar), tudo offline após download.
18. **Compra via RevenueCat** (`react-native-purchases`), iniciada apenas pela Área dos Pais, com **Restore real**. **Preços congelados (P3): Anual R$ 119,90** (oferta-herói, badge "Economize 33%", equivalência "R$ 9,99/mês") **+ Mensal R$ 14,90.** Sem trimestral (P4), sem compra avulsa por história, sem vitalício no v1 (pode virar promoção futura).
19. Bloqueios sempre gentis (padrão já existente: "Peça a um responsável para desbloquear").

### Técnica, peso e operação
20. **Empacotamento híbrido:** Criação + Noé + app no bundle (**~60–80 MB alvo**); 18 histórias premium baixadas sob demanda (manifesto + checksum + cache offline + barra de progresso). Confirmação final condicionada à medição do build preview (aritmética antecipa: catálogo completo otimizado ≈ 230–290 MB > limite de 200 MB do Play).
21. **Formatos congelados:** cenas ilustradas **WebP q80** (piloto real: −91,6%) · colorir **WebP lossless** (−43%, pixel-idêntico = flood fill garantido; qualquer compressão **lossy em colorir é PROIBIDA**) · áudio **MP3 mono 96 kbps** após validação auditiva em 2 histórias (atual ~143 kbps).
22. **Sem backend próprio no v1. Sem Supabase. Sem login.** Conteúdo premium via bucket estático (R2 ou equivalente — provedor é detalhe; manifesto+cache é a arquitetura).
23. **Operação pós-lançamento obrigatória antes da loja:** EAS Update (OTA para JS) + Sentry (sem PII: `sendDefaultPii:false`, sem nome de perfil, sem conteúdo digitado) + Error Boundary global com tela amigável do Beni.
24. **Privacidade infantil:** zero Advertising ID/IDFA, zero localização, zero microfone/câmera, zero PII de criança, nada de desenhos/nome/texto saindo do aparelho. Analytics apenas anônimo/agregado, com toggle na Área dos Pais, declarado no Data Safety (Play) e App Privacy (Apple). Funil de compra pelo RevenueCat; retenção/crash pelas lojas e Sentry.
25. **Backups de arte saem de `assets/`** (`assets/maps/source_*`, `backup_*` → pasta fora do caminho de bundle).
26. **Controles de som acessíveis à criança** (sem gate parental): atalho na Home/Perfil com 2 toggles — 🎵 Música · 🔊 Sons de interface. A **narração nunca é silenciada** por esse atalho. A Área dos Pais mantém controles completos.

---

## SEÇÃO 2 — DECISÕES DO FUNDADOR RESOLVIDAS EM 2026-07-02 (CONGELADAS)

| # | Decisão | Resolução |
|---|---|---|
| **P1** | Nome de loja | **Título de loja: "Beni: Histórias da Bíblia"** (25 caracteres). Nome sob o ícone (`app.json.name`): **"Beni"**. Marca "Pequenos Traços de Fé" vive no subtítulo (Apple), na descrição e como identidade do estúdio. Recomendado: consulta de marca no INPI para "Beni" (classe de apps educacionais infantis) antes de marketing. |
| **P2** | Nome da 4ª aba | **"Estrelinhas"** (mantém o atual). |
| **P3** | Preços | **Anual R$ 119,90** (herói) · **Mensal R$ 14,90**. Copy obrigatório do paywall: mensal×12 = R$ 178,80 → **"Economize 33% no plano anual"** + equivalência **"sai por R$ 9,99/mês"**. Badge de destaque no anual. |
| **P4** | Trimestral | **Não existe no v1.** |
| **P5** | iPad e tablets | **Suporte oficial a iPad e tablet Android no v1.** Manter `supportsTablet: true`. QA obrigatório em **iPad físico/simulador e tablet Android** (B8/B9). Store assets incluem **screenshots de iPad** (exigência Apple) e de tablet Android. |
| **P6** | Trilha sonora | **Entra no v1.** 2–3 loops instrumentais suaves (navegação · história · colorir/jogos), ~1–2 MB, volume baixo, **ducking automático sob narração e falas do Beni**, respeitando o toggle 🎵. Bloco A13 obrigatório. |
| **P7** | Contas de loja | **Ainda não existem — criar ambas (Apple Developer + Google Play Console) IMEDIATAMENTE** (Bloco 0.1). Preferir Play de organização/CNPJ. Se Play pessoal e nova: teste fechado 12 testadores / 14 dias contínuos desde o início. *(Contexto 2026-07-02: fundador assina amanhã — dependência externa temporária.)* |
| **P8** | Lojas | **Lançamento simultâneo Android + iOS.** Apple Developer necessária desde já; revisão Apple infantil mais rigorosa (gate parental/privacidade/IAP já cobertos). Suporte iPad/tablet (P5) coberto por B8/B9. |
| **P9** | Palavras do Soletrando | **Vocabulário geral infantil** (objetos, animais, cores, família, natureza — ex.: BOLA, GATO, SOL, CASA, FLOR). Sem exigência temática bíblica. 30 palavras (10 fáceis 3–4 letras · 10 médias 5–6 · 10 difíceis), progressão automática, sem teclado livre. |
| **P10** | Vozes | **Duas vozes oficiais distintas:** (a) **Voz da Narração** — exclusiva das histórias/cenas; (b) **Voz do Beni** — tours, celebrações, onboarding, Cultinho, Cantinho **e instruções dos jogos**. Exceção: no Adivinhar o Animal, os sons dos animais são **efeitos sonoros reais/característicos**, não voz. Nenhum áudio novo do Beni é produzido antes de a navegação congelar (Brincar Shell aprovado). |

---

## O QUE NÃO FAZER DE JEITO NENHUM
Backend/Supabase/login · histórias 21+ · Modo Igreja visível · limpeza Lumi pré-lançamento · reaproveitar patch B5.4.3 · compressão lossy em páginas de colorir · SDK com Advertising ID · compra fora do gate parental · preço/urgência para criança · teclado nativo ou microfone nos jogos · features novas fora do Documento Mestre v3.1 · reabrir decisões congeladas · avançar bloco sem autorização.

---
*Este arquivo espelha as decisões congeladas do Documento Mestre v3.1. Em qualquer conflito com instruções anteriores, prevalece o Documento Mestre v3.1. Atualizações exigem autorização explícita do fundador.*
