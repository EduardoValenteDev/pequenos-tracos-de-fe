# Pipeline de Assets — Feature 001 (Fase 1)

Ferramentas **documentais e de auditoria** para a *Fundação de Arquitetura e Orçamento
de Assets*. **Nada aqui altera o app, move/converte/renomeia assets nem adiciona
`assets/stories/*` ao Git.** São scripts de leitura/relatório (Node puro, sem dependências).

> Fonte de verdade: `specs/001-asset-architecture-budget/` (spec, plan, tasks, research,
> data-model, contract). Em conflito, vale `docs/PROJECT_SOURCE_OF_TRUTH.md` → constituição
> → `AGENTS.md`.

## Pipeline obrigatório (D9)

Todo lote de assets novo segue, em ordem:

1. **Auditar** — inventário + medição (`assets:inventory`, `assets:measure`); estado
   tracked/untracked; peso por categoria.
2. **Padronizar** — conferir nome/diretório/dimensão/proporção contra o padrão canônico
   (ver [`NAMING.md`](./NAMING.md)). **Sem renomear nesta feature** — apenas sinalizar.
3. **Otimizar** — (fase futura) WebP para cenas; WebP lossless/PNG otimizado para colorir,
   com teste de flood-fill; preservar 4:5. **Não nesta Fase 1.**
4. **Decidir camada** — `starter` (binário, grátis), `remote` (baixável sob demanda) ou
   `coming_soon` (fora do bundle). **Não nesta Fase 1.**
5. **Versionar** — starter otimizado no Git comum (seletivo); packs remotos fora do Git;
   `assets/stories/*` permanecem untracked até auditoria/aprovação.

## Scripts

| Comando | Arquivo | O que faz |
|---|---|---|
| `npm run assets:inventory` | `inventory.js` | Inventário JSON determinístico (categorias × tracked/untracked × bytes) — FR-001 |
| `npm run assets:measure` | `measure-size.js` | Tamanhos mensuráveis (assets, src, .git) + "N/A" para export/bundle/builds — FR-002 |
| `npm run assets:guard` | `check-untracked-guard.js` | **Falha** se `assets/stories/*` estiver staged — FR-013/D9 |
| `npm run assets:validate-manifest -- <m.json>` | `validate-pack-manifest.js` | Valida um manifesto de pack contra `packManifestService` — FR-018 |
| `npm run assets:budget` | `budget-report.js` | Orçamento: assets tracked (proxy) vs meta ~150 MB — FR-003/FR-004 |
| `npm run assets:growth` | `growth-projection.js` | Projeção 20 histórias + >=25% de reserva — FR-003 |
| `npm run assets:traceability` | `traceability.js` | Cruza história ↔ camada ↔ requires ↔ existência/tracked — FR-011 |
| `npm run assets:check-ratio` | `check-ratio.js` | Valida 4:5 SÓ de cenas/colorir (isenta capas/mapas/avatares); só reporta, `--strict` falha — FR-008 |
| `npm run assets:optimize-scene -- --in <cena> [--dry-run]` | `optimize-scene.js` | Piloto: CENA → WebP lossy (sharp). Saída fora de `assets/`; recusa colorir; nunca toca originais — T013 |

### `optimize-scene.js` — regras de segurança (T013)

- **Encoder:** `sharp` (**devDependency**, build-time; **nunca** importado por `src/`/runtime).
- **Só CENAS** coloridas (WebP **lossy**). **RECUSA** arquivos de **colorir** (flood-fill é sensível → lossless/PNG em `optimize-coloring`, bloco futuro).
- **Saída sempre FORA de `assets/`** (padrão `tmp/assets-pipeline/`, gitignored) — **falha** se a saída cair em `assets/` ou `assets/stories/`.
- **Nunca** sobrescreve/move/renomeia/altera o original; entrada é só leitura.
- Suporta `--dry-run` (não escreve) e `--help`; reporta dimensões, ratio 4:5, bytes antes/depois e % de redução.

## Guard de Git — `assets/stories/*` (T005a)

`assets/stories/*` **não podem entrar por `git add` acidental**. O guard lê
`git diff --cached --name-only` e:

- **Sai com erro (exit 1)** se houver qualquer `assets/stories/*` staged;
- Está **integrado ao `npm run smoke`** (o smoke falha no mesmo caso);
- **Não bloqueia** uma adição **futura, auditada e aprovada**: use o override explícito
  e documentado **`ALLOW_STORY_ASSETS=1`** (ex.: `ALLOW_STORY_ASSETS=1 npm run assets:guard`).

O override existe para o dia em que um lote for **auditado** (peso, proporção 4:5,
flood-fill) e **aprovado** para entrada seletiva — nunca para contornar a auditoria.

## Limites desta Fase 1 (não implementado aqui)

Sem `contentResolver`, sem `packManifestService`, sem download remoto, sem R2, sem
conversão de imagem, sem mover/renomear assets, sem dependências novas. Esses itens
pertencem às fases seguintes da feature 001 (ver `specs/.../tasks.md`).
