# BRANCH_PROTECTION_GUIDE — proteção de branch (Bloco Agentes 1.1)

Este guia descreve como **ligar manualmente** a proteção de branch no GitHub. A
configuração é um **setting server-side** (não vive no repositório), por isso é feita
pela UI do GitHub (ou `gh api`) pelo responsável — não por um agente.

> Decisão atual: **exigir PR + check `smoke` obrigatório + bloquear force-push**, mantendo
> `expo-doctor` informativo e **sem** exigir review de code owner por enquanto.

## Passos (GitHub UI)

1. Repositório → **Settings** → **Branches** → **Add branch ruleset** (ou *Add classic
   branch protection rule*).
2. **Branch name pattern:** `sprint_design_system_jornada_beni`
   *(repetir depois para `main`, quando desejar o mesmo rigor lá).*
3. **Require a pull request before merging:** ✅ **ligado**
   - Required approvals: **0** (repo solo — não exigir review de code owner ainda).
   - "Require review from Code Owners": **desligado** por enquanto (o `CODEOWNERS` hoje
     só documenta ownership).
4. **Require status checks to pass before merging:** ✅ **ligado**
   - Marcar como **obrigatório** o check **`smoke`** (nome estável definido em
     `.github/workflows/ci.yml`).
   - **NÃO** marcar `expo-doctor (informativo)` como obrigatório (segue informativo).
   - "Require branches to be up to date before merging": opcional (recomendado **ligado**).
5. **Block force pushes:** ✅ **ligado** (impede `git push --force` na branch protegida).
6. **Restrict deletions:** recomendável **ligado** (evita deletar a branch protegida).

## Cuidado em repositório solo — "Include administrators"

Se você marcar **"Do not allow bypassing the above settings" / "Include administrators"**,
as regras valem **inclusive para você (admin)**. Em um repo de **um único dev**, isso pode
**travar seus próprios merges** (ex.: exigir um aprovador que não existe). Recomendação:

- **Não** exigir aprovação de revisor enquanto for solo (Required approvals = 0).
- Manter o check **`smoke`** obrigatório (não depende de 2ª pessoa).
- Avaliar "Include administrators" com cautela: ligar **apenas** as regras que você mesmo
  consegue satisfazer sozinho (check `smoke` + PR), para não se autobloquear.

## Conferir o nome do check

O check obrigatório deve casar com o **nome do job** no CI:

```yaml
# .github/workflows/ci.yml
jobs:
  smoke:
    name: smoke          # ← nome estável usado como "required status check"
```

Se o nome do job mudar, **reaponte** o required check em Settings → Branches.

## Quando promover o `expo-doctor` a obrigatório

`expo-doctor` toca a rede e pode oscilar. Mantê-lo **informativo** (`continue-on-error: true`)
até observarmos estabilidade. Quando consistente, remover o `continue-on-error` e marcá-lo
como required — em um bloco futuro, com sua aprovação.
