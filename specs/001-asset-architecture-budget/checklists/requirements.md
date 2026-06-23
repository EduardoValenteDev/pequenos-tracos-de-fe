# Requirements Quality Checklist: Fundação de Arquitetura e Orçamento de Assets

**Purpose**: Validar a qualidade dos requisitos da spec (completude, clareza, consistência, mensurabilidade, cobertura) antes do Portão Humano 1 e do Plano. "Testes unitários" da spec — avaliam o que está **escrito**, não a implementação.
**Created**: 2026-06-22
**Feature**: [spec.md](../spec.md)

**Note**: Gerado por `/speckit.checklist`. `[x]` = requisito atende; `[ ]` = lacuna/ambiguidade a resolver. Itens com `[Gap]/[Ambiguity]/[Deferred]` trazem nota inline.

## Requirement Completeness

- [x] CHK001 Os requisitos definem um inventário reproduzível por categoria (capas, cenas, colorir, mapas, UI, áudio)? [Completeness, Spec §FR-001]
- [x] CHK002 Há requisito de medição (repo/Metro/bundle/builds) com tratamento explícito de "não mensurável neste ambiente"? [Completeness, Spec §FR-002, §Edge Cases]
- [x] CHK003 A projeção de crescimento tem escopo de catálogo definido? [Completeness, Spec §FR-003]
- [x] CHK004 O orçamento cobre as 5 dimensões (download, instalação, atualização, memória, armazenamento)? [Completeness, Spec §FR-004]
- [x] CHK005 O padrão canônico por categoria cobre nome, diretório, dimensão, proporção, formato e qualidade? [Completeness, Spec §FR-005]
- [x] CHK006 A garantia offline do conteúdo "ativo" está definida? [Completeness, Spec §FR-006]
- [x] CHK007 Há requisito de preservação de linhas/áreas fechadas para o flood-fill? [Completeness, Spec §FR-007]
- [x] CHK008 Há requisito protegendo imagens fora de 4:5 contra esticamento/corte automático? [Completeness, Spec §FR-008]
- [x] CHK009 A rastreabilidade asset↔história↔manifest↔require↔disponibilidade está definida? [Completeness, Spec §FR-011]
- [x] CHK010 Há critério impedindo conteúdo "em breve" de inflar o bundle? [Completeness, Spec §FR-012]
- [x] CHK011 A estratégia de migração, rollback e validação em clone limpo está definida? [Completeness, Spec §FR-010]

## Requirement Clarity & Measurability

- [x] CHK012 O teto de orçamento está quantificado (~150 MB para download/instalação)? [Clarity, Spec §FR-004, §SC-002]
- [x] CHK013 "Conteúdo ativo" está definido sem ambiguidade (grátis no binário + premium após download)? [Clarity, Spec §FR-006]
- [x] CHK014 A magnitude da "reserva para novos packs" está quantificada? [Ambiguity, Spec §FR-003, §SC-003] — *Resolvido: ≥25% de folga (≈5 packs), sem entrar no bundle inicial.*
- [x] CHK015 Há critério WHAT-level de qualidade do flood-fill (contornos fechados + funcionamento aceitável)? [Clarity, Spec §FR-020] — *Resolvido no nível WHAT; o limiar numérico de anti-aliasing fica explicitamente para o Plano Técnico.*
- [x] CHK016 Os critérios de sucesso (SC-001..008) são tecnologia-agnósticos e verificáveis? [Measurability, Spec §Success Criteria]

## Requirement Consistency

- [x] CHK017 As decisões de `## Clarifications` estão refletidas de forma consistente nos FR/SC correspondentes? [Consistency, Spec §Clarifications, §FR-003/004/006]
- [x] CHK018 O fora de escopo (FR-013) é consistente com os requisitos (não contradiz nenhum FR)? [Consistency, Spec §FR-013]
- [x] CHK019 Nenhum requisito decide formato/armazenamento/entrega antecipadamente (mantido para o Plano)? [Consistency, Spec §FR-009, §Nota de escopo]

## Incorporação das Clarificações (Q1–Q3)

- [x] CHK020 Q1 (orçamento ~150 MB) está incorporada em requisito **e** critério? [Traceability, Spec §FR-004, §SC-002]
- [x] CHK021 Q2 (20 histórias + reserva de packs) está incorporada? [Traceability, Spec §FR-003, §SC-003, §Assumptions]
- [x] CHK022 Q3 (grátis no binário + premium offline após download; "em breve" fora do bundle) está incorporada? [Traceability, Spec §FR-006, §FR-012]

## Preservação da Arquitetura Híbrida

- [x] CHK023 A spec define a distinção entre **starter pack local** e **packs premium/remotos baixáveis** como unidades discretas? [Completeness, Spec §FR-015, §FR-016] — *Resolvido: FR-015 (starter local) + FR-016 (packs remotos distintos).*
- [x] CHK024 Há requisito de **persistência offline** do conteúdo baixado (reuso sem rede)? [Completeness, Spec §FR-017] — *Resolvido: FR-017 (offline persistente até remoção explícita).*
- [x] CHK025 Há requisito de **manifesto versionado** descrevendo cada pack? [Completeness, Spec §FR-018] — *Resolvido: FR-018 (id/versão/arquivos/tamanhos/regras visuais/compatibilidade).*
- [x] CHK026 Há requisito de **verificação de integridade** do conteúdo de cada pack antes de "pronto"? [Completeness, Spec §FR-019, §SC-010] — *Resolvido WHAT-level; algoritmo/provedor ficam no Plano.*
- [x] CHK027 Está registrado "sem backend complexo no MVP" (local-first nesta feature)? [Completeness, Spec §Assumptions, §FR-021]
- [x] CHK028 As **possibilidades futuras** (R2, Supabase, RevenueCat, URLs assinadas, Edge Functions) estão registradas como fase posterior, sem decisão agora? [Completeness, Spec §FR-021] — *Resolvido: FR-021 difere provedores/mecanismos ao Plano/fases futuras e exige compatibilidade com acesso futuro sem backend complexo no MVP.*

## Ausência de Promessa de Implementação (antes do Plano)

- [x] CHK029 A spec evita escolher formato (WebP/PNG)? [Consistency, Spec §Nota de escopo, §FR-013]
- [x] CHK030 A spec evita escolher armazenamento (Git comum/Git LFS/CDN)? [Consistency, Spec §Assets untracked, §FR-013]
- [x] CHK031 A spec evita escolher entrega (bundle/EAS Update/remoto) — mantém como comparação no Plano? [Consistency, Spec §FR-009]
- [x] CHK032 A spec evita comprometer migração de áudio, RevenueCat, Git LFS ou conversão WebP? [Consistency, Spec §FR-013]

## Cobertura de Cenários & Edge Cases

- [x] CHK033 Edge cases de assets cobertos (MISSING; referenciado-porém-untracked; proporção fora de 4:5; anti-aliasing; medição N/A)? [Coverage, Spec §Edge Cases]
- [x] CHK034 Cenário de **estouro de orçamento** (projeção excede o teto) está coberto? [Coverage, Spec §Edge Cases]
- [x] CHK035 A distinção entre peso de **repositório** e peso de **app/instalação** está coberta? [Coverage, Spec §Edge Cases]

## Dependências & Assunções

- [x] CHK036 As assunções estão documentadas e ancoradas em medições reais? [Assumption, Spec §Assumptions]
- [x] CHK037 Existe esquema de IDs de requisitos/critérios (FR/SC) para rastreabilidade? [Traceability, Spec §Requirements, §Success Criteria]

## Notes

- **Resultado (revisão 2026-06-22)**: **37/37 aprovados** (era 30/37). As 7 lacunas foram fechadas pela adição de requisitos **WHAT-level** de arquitetura híbrida (FR-015…FR-021), pela quantificação da reserva (FR-003/SC-003: ≥25%) e por um critério WHAT-level de flood-fill (FR-020).
- **Sem decisão prematura**: nenhum item escolhe formato (WebP/PNG), armazenamento (Git/LFS/CDN), entrega (bundle/EAS Update/remoto), provedor (R2/Supabase/RevenueCat), algoritmo de integridade ou mecanismo de URL — tudo permanece para o Plano (Etapa SDD 4).
- **Único item com parte deferida**: CHK015 — o **WHAT** (contornos fechados + flood-fill aceitável) está na spec (FR-020); o **limiar numérico** de anti-aliasing fica explicitamente para o Plano Técnico.
