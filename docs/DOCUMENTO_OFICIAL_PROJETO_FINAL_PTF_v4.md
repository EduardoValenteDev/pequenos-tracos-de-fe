# DOCUMENTO OFICIAL DO PROJETO — Pequenos Traços de Fé — **v4**
**Fonte única de verdade da linha de lançamento (beta/loja).** · Data: 2026-07-05 · HEAD: `424972b`

> **Precedência.** Este documento é a fonte única da **linha de lançamento**, **subordinado** a:
> `docs/PROJECT_SOURCE_OF_TRUTH.md` (Roteiro Mestre) → `.specify/memory/constitution.md` →
> `AGENTS.md`/`CLAUDE.md`. As **decisões** são governadas por `docs/DECISIONS.md` (árbitro): em
> conflito, **DECISIONS.md vence**. Este v4 **supersede** `docs/DOCUMENTO_OFICIAL_PROJETO_FINAL.md`
> (v2.0) — que permanece no repo como histórico, com aviso no topo.
>
> **Rito antibifurcação:** toda sessão de IA começa lendo `DECISIONS.md`. Decisão que só existe em
> conversa não é oficial até entrar no `DECISIONS.md`.

---

## 1. Fonte única de verdade
Este documento consolida os dois "documentos oficiais" que estavam bifurcados (DOCUMENTO_MESTRE v3.1
e "Documento Oficial Final" da sessão) e incorpora o **Adendo de Alinhamento e Auditoria Final v1**
(`docs/ADENDO_ALINHAMENTO_AUDITORIA_FINAL_PTF_v1_2026_07.md`) **com as correções do fundador**
registradas no `DECISIONS.md`. Onde este texto e o adendo divergirem, valem o `DECISIONS.md` e este v4.

## 2. Estado atual real do projeto
App infantil de histórias bíblicas (**React Native + Expo SDK 54**, RN 0.81.5, React 19.1, New
Architecture, **100% JavaScript**), local-first, mascote **Beni**. Pipeline de packs remotos (Fase 2)
tecnicamente forte: download R2, sha256 real, ready-gate, correção de travamento, gates verdes.
**Risco nº 1 atual não é código — é governança de decisão** (por isso este v4 + DECISIONS.md).

## 3. HEAD carimbado
**`424972b`** — `feat: validate pack files with real sha256` (branch `content-integrate-coloring-3`).

## 4. F2.4e.1 e F2.4e.2 — concluídos
- **F2.4e.1** (`b3fdb96`): download + diagnose (dev-only) de **cover, scene, coloring, audio** do pack por kind (`requestedKinds`, default scenes-only; nunca ready parcial).
- **F2.4e.2 (+2p +2pR)** (`424972b`): **sha256 real** via `@noble/hashes` (JS puro; **sem** expo-crypto/quick-crypto), validado **antes** do ready (mismatch → falha, nunca parcial); **performance** (diagnose leve; verify profundo por botão; **travamento >10s eliminado**); **concorrência** (busyRef/mountedRef/runExclusive; auditoria adversarial). smoke **1604/1604**.

## 5. Arquitetura híbrida oficial
**Local starter** (A Criação + Noé, no binário, offline desde a instalação) **+ remoto premium**
(18 histórias como **packs** no **Cloudflare R2**, baixados sob demanda, persistidos por
`expo-file-system`, validados por sha256, promovidos por troca atômica `.tmp → localDir → ready`).
Teto do binário base: **200 MB** (alvo 40–80). **Nenhum pack premium por `require()` estático.**
Resolver único: starter→require; pack ready→`file://`; remote sem pack→**fallback require**.

## 6. Fase atual
**Fase 2 — piloto híbrido, ainda em andamento.** Piloto premium = **Davi e Golias** (10 cenas +
cover + colorir + áudio já servidos no R2; cenas já consumidas por `file://` no device). O consumo
**user-facing** de cover/colorir/áudio ainda **não** existe (só cenas estão ligadas às telas).

## 7. Próximo bloco oficial
**F2.4e.3 — consumo user-facing de COLORING remoto, com fallback local.** (Depois: F2.4e.4 cover →
F2.4e.5 áudio → offline completo do piloto → build real de medição.)

## 8. O que já está concluído
- Runtime de packs (contentResolver, PacksContext, packStorageService, packIntegrityService).
- `globalManifestService` (read-only) + `content-manifest.json` global publicado e validado no R2.
- Downloader **genérico por storyId** via manifesto global; download por kind; **sha256 real**.
- Ferramenta dev (PackSandboxDevScreen) sob duplo gate; validada ponta a ponta no iPhone.
- Bugfix do Livrinho (autoplay resiliente à trava). Gates verdes (smoke/doctor/audio).

## 9. O que falta (linha de lançamento)
- **Consumo user-facing** de coloring/cover/áudio remotos (F2.4e.3–e.5) + offline completo do piloto + **build real de medição**.
- **Migração dos 18 packs** + remoção de `require()` premium + auditoria de bundle.
- **Design System "Livro Vivo"** aplicado (A0 tokens/fontes; A14 varredura) + estados de card por chip/selo/ícone.
- **Brincar v1** (ver §13) + acesso central `can()` + `dailyRounds` + ResponsibleUnlockCard.
- **RevenueCat** (código depois do piloto; preparação externa em paralelo).
- **Plano Free sem salvar** (Bloco A) e **Conclusão total / Opção B** (bloco próprio) — ver §11–§12.
- Hardening Android 2–3 GB; ritual de conclusão; QA matriz; beta fechado; loja.

## 10. Free e Plano Família
- **Grátis:** A Criação, Noé (narração/quiz/Momento/Livrinho/colorir das grátis); Criar/colorir **sem salvar**; **2 rodadas/dia** por jogo no Brincar.
- **Plano Família:** 18 premium (download offline), **salvar arte + Galeria + persistência**, avatares exclusivos, rodadas ilimitadas, cartinhas "Arte" do Baú.
- **Acesso central `can()`** (§ do Adendo): nenhuma tela decide sozinha; UI consome `can(...)`; rotas diretas também passam por `can()`.

## 11. Plano Free sem salvar (D-FREE-SEM-SALVAR)
Salvar arte = **100% Plano Família**. O grátis desenha/colore normalmente (colorir vale para
progresso/estrela), mas **não persiste** a arte. Toque em Salvar/Guardar no grátis → gate parental →
paywall (copy gentil). "Minhas Artes"/Livrinho colorido no grátis = **estado convidativo**. Baú:
cartinhas "Arte" viram exclusivas do Plano Família (demais lembranças seguem para todos). **Remove o
limite atual "3 artes".** *Implementação = Bloco A; não agora.*

## 12. Conclusão total + desbloqueio por conclusão total (D-CONCLUSAO-TOTAL-B, Opção B)
`isStoryFullyComplete = (10 cenas narradas concluídas) AND (quiz respondido) AND (colorir concluído)
AND (Momento da história / Guardar no coração concluído)`. **Opção B (escolha do fundador):** o
**desbloqueio da próxima história** e o selo dourado "Concluída" **exigem a conclusão total**.
Estado intermediário = **"Quase lá!"** (checklist do que falta: quiz/colorir/guardar, em ícones do
set). "Colorir concluído" = **≥ 1 página** (default do adendo, **a confirmar**). *Muda progressão e
retenção → implementação em bloco próprio POSTERIOR; não agora.*

## 13. Brincar v1 — jogos brutos + naming pendente (D-BRINCAR-JOGOS-V1)
Itens do Brincar v1: **Folha Livre · Minhas Artes · Soletrando · Adivinhar o Animal · Quebra-Cabeça.**
- **⚠️ Pares, Palavrinhas e Bichinhos NÃO foram removidos** — eram **nomes amigáveis anteriores/candidatos** para estes mesmos minijogos. Não tratar como excluídos.
- **Nomes finais amigáveis = PENDENTES** (D-NAMING-JOGOS-PENDENTE) para Soletrando / Adivinhar o Animal / Quebra-Cabeça.
- 2 rodadas/dia por jogo no grátis (`dailyRounds`); ilimitado no Plano Família. Único com assets novos: **Adivinhar o Animal** (15 ilustrações + 15 sons — encomendar em paralelo). *Implementação = fase Brincar; não agora.*
- **"Criar com Beni":** status no v1 **conflitante entre documentos → A CONFIRMAR** pelo fundador (D-CRIAR-COM-BENI-STATUS). **Nenhuma remoção de código agora.**

## 14. Direção visual "O Livro Vivo" (D-DESIGN-LIVRO-VIVO)
Direção de Arte v1.1 é a oficial (roxo aposentado; Fraunces+Nunito; uma cor de ação; dourado =
recompensa; moldura única "Galeria Viva"; tokens/hex; responsividade §2.4). **Status do card por
chip + selo + ícone + tratamento da arte** — **não** por paleta paralela (D-STATUS-CARDS). "Em breve"
**não existe no v1**.

## 15. Documento visual antigo
O documento visual antigo (3 histórias, "estilo Disney/Pixar") é **SUPERSEDED / referência histórica**
— **não é fonte atual** (não está versionado no repo; se aparecer, marcar SUPERSEDED sem apagar).

## 16. Protocolo antibifurcação (D-ANTIBIFURCACAO)
Uma fonte de verdade (este v4) + **DECISIONS.md como árbitro** + toda sessão de IA lê o DECISIONS.md +
mudança de decisão passa por: fundador → DECISIONS.md → documentos → código. Decisão só-em-conversa
não é oficial.

## 17. Roadmap das próximas semanas (fusão dos planos — meta ~8 semanas)
| Sem. | Trilha técnica | Em paralelo (sem código) |
|---|---|---|
| 1 | F2.4e.3 coloring → e.4 cover → e.5 áudio → offline do piloto → **build real de medição** | Bloco documental (este) · contas Apple/Play + teste fechado · **prep RevenueCat** (dashboard/produtos) |
| 2–3 | Migração dos 18 packs + manifesto + remoção de requires premium + auditoria de bundle | **A0**: tokens + Fraunces/Nunito + componentes-base · assets do Adivinhar (15 animais + sons) |
| 4 | Brincar Shell (lista §13) + `can()` central + `dailyRounds` + ResponsibleUnlockCard | loops de trilha |
| 5 | Soletrando + Quebra-Cabeça | Adivinhar o Animal (assets prontos) |
| 6 | RevenueCat **código**: entitlement, paywall, sandbox, restore, gating | Data Safety + App Privacy |
| 7 | Ritual de conclusão (D-CONCLUSAO-TOTAL-B) + B5.4 + hardening Android 2–3 GB | A14 varredura visual |
| 8 | Builds finais, QA matriz (incl. tablet), beta fechado, loja | screenshots/metadata |

Caminho crítico: packs user-facing → build real → Brincar premium → RevenueCat → Android fraco → loja.

## 18. RevenueCat — preparação externa em paralelo (sem código)
Autorizada AGORA: contas Apple/Play, produtos, dashboard RC, teste fechado do Play, acordos
fiscais/bancários — **nada disso toca código** e tem lead time de semanas.

## 19. RevenueCat — código só depois do piloto user-facing
O **código** de entitlement/paywall/restore só entra **depois** de F2.4e.3–e.5 (piloto user-facing
dos packs) e do build real de medição.

## 20. Restrições invioláveis
**Nada** de: backend/login, anúncios, tracking infantil, premium no binário, SDK fora da lista
(Sentry + RevenueCat + analytics anônimo), linguagem técnica (pack/manifesto/sha256/MB) para a
criança, paleta de status paralela, "Criar com Beni" alterado sem confirmação, decisão em conversa
sem registro no DECISIONS.md.

---

### Changelog
- **v4 (2026-07-05):** consolida a bifurcação; incorpora o Adendo v1 com as correções do fundador
  (jogos NÃO removidos + naming pendente; Opção B de desbloqueio; Criar com Beni a confirmar);
  registra F2.4e.1/e.2 concluídos (HEAD `424972b`); institui DECISIONS.md como árbitro; supersede a
  v2.0. Bloco documental **D0.1** (docs-only, sem código).
