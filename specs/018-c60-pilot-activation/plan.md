# Plan — 018 · Ativação Controlada do Piloto Colorir 60

> **Etapa SDD:** 4 (Plan + Constitution Check) · **Base:** `e07e8bc3e7b1091edebec986d47d06c8d3b2ceeb`
> Proporcional ao escopo: configuração + testes + governança. Nenhuma remodelação.

---

## 1. Abordagem técnica

### 1.1 Mecanismo da flag

`src/config/featureFlags.js` — o literal vira uma conjunção, no **mesmo padrão** dos gates já aprovados no arquivo:

```js
export const COLORIR_60_CREATION_PILOT_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT === 'true' &&
  process.env.EXPO_PUBLIC_BUILD_PROFILE === 'c60-pilot';
```

Propriedades desenhadas:

- **Fail-closed por ausência.** Env vazio ⇒ `undefined === 'true'` ⇒ `false`. Produção não declara nada ⇒ fechada por ausência dupla.
- **Comparação literal e estrita.** `'true'` e `'c60-pilot'` exatos: `'True'`, `'1'`, `'c60-pilot '`, `'C60-Pilot'` não abrem.
- **Conjunção real.** Cada variável isolada é inerte.
- **Sem novo conceito.** `EXPO_PUBLIC_BUILD_PROFILE` já é o discriminador de perfil usado por `RELEASE_PACK_QA_ENABLED` e `CREATOR_QA_MODE_RELEASE_ENABLED`.

O portão `isColoring60PilotAllowed()` **não muda**: continua `flag || (__DEV__ && isInternalToolsEnabled())`. O Dev Client segue funcionando exatamente como antes.

### 1.2 Perfil EAS

`eas.json` ganha `c60-pilot`, **sem `extends`** (para não herdar nada):

```json
"c60-pilot": {
  "distribution": "internal",
  "env": {
    "EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT": "true",
    "EXPO_PUBLIC_BUILD_PROFILE": "c60-pilot"
  },
  "ios": { "resourceClass": "m-medium" },
  "android": { "buildType": "apk", "resourceClass": "medium" }
}
```

Consequências verificáveis:

| Exigência | Como o perfil satisfaz |
|---|---|
| Distribuição interna | `"distribution": "internal"` |
| iOS e Android | bloco `ios` + bloco `android` com `buildType: "apk"` (instalação direta) |
| Sem Modo Criador | não declara `EXPO_PUBLIC_ENABLE_CREATOR_QA_MODE` ⇒ `CREATOR_QA_MODE_RELEASE_ENABLED = false` |
| Sem sandbox de packs / Release Pack QA | não declara `ENABLE_PACK_SANDBOX`, `ENABLE_RELEASE_PACK_QA`, `QA_BUILD` ⇒ `RELEASE_PACK_QA_ENABLED = false` |
| Sem Administração dev / Bancada C60 | consequência: `isInternalToolsEnabled() = false || false || false = false` |
| Sem variáveis de produção | não declara `EXPO_PUBLIC_GLOBAL_MANIFEST_URL` |
| `__DEV__ = false` | build de release (sem `developmentClient`) |

**Nenhum perfil existente é alterado.** `preview-criador` já **redeclara** todo o seu `env`, então não pode herdar do novo perfil; e o novo perfil não estende ninguém.

### 1.3 Estratégia de prova (a decisão técnica central)

O reflexo antigo — casar o texto `= false` por regex — não serve mais e **não deve ser substituído por outro regex**. A prova passa a ser por **execução real do arquivo**, usando o `loadModule` já existente em `scripts/testing/packInstallHarness.js`:

```js
loadModule('src/config/featureFlags.js', { process: { env: <env encenado> } }, ['COLORIR_60_CREATION_PILOT_ENABLED'])
```

`loadModule` remove `import`/`export` e avalia o fonte com as dependências injetadas como parâmetros — então o parâmetro `process` **sombreia** o `process` global e a expressão real do arquivo é executada sob o env encenado. Não há reimplementação da regra no teste: quem responde é o código de produção.

O env encenado de cada perfil é **lido do `eas.json`**, não digitado no teste — assim o dia em que alguém adicionar a variável ao bloco `production`, a prova fica vermelha sozinha.

Mesma técnica para as camadas acima:

- `src/config/internalTools.js` + `src/services/creatorQaMode.js` → `isInternalToolsEnabled()` sob o env do perfil (prova de que a Administração (dev) e a Bancada não existem no `c60-pilot`);
- `src/services/coloring60Pilot.js` → `isColoring60PilotAllowed()` / `isCreationColoringPilotActive()` com a flag resolvida de verdade;
- `src/services/storyColoringAvailability.js` + `src/services/storyJourneyService.js` → o efeito sobre `journeyComplete` e, por composição com a fórmula intacta de `isStorySequenceUnlocked`, sobre Noé.

### 1.4 Tratamento das 9 asserções históricas

Nenhuma é apagada. Cada uma **preserva o rótulo histórico** (bloco de origem: `C60-P0.T8`, `C60-P1.T5`, `C60-P2`, `C60-P3`, `C60-P3-FIX1`, `C60-P10`, `P3J-R`, `P3J-R.1`, `P3J-R.1 FIX1`) e troca a metade "o literal é `false`" por um helper único:

```js
c60PilotSealed()  // o piloto continua fechado por padrão e só abre pela cerca dupla autorizada
```

O helper é executado, não lido. A intenção original — *"esta fase/bloco não liga o piloto"* — passa a ser provada de forma **mais forte**: antes bastava o texto `= false`; agora exige que o piloto resolva `false` sob env vazio, sob todos os perfis existentes, e que a única porta seja a cerca dupla.

## 2. Constitution Check

| Regra | Situação |
|---|---|
| Nenhum código antes dos portões humanos | Ratificações 1–3 recebidas por escrito; spec/plan/tasks nesta ordem |
| `git add` seletivo, sem `.`/`-A` | Commits por caminho explícito |
| Um bloco lógico = um commit | 4 commits: spec · config · testes · docs |
| Não misturar código, assets e governança | Config, testes e docs separados; **zero asset** |
| Sem push sem aprovação | Nenhum push neste bloco |
| Áreas protegidas só com instrução direta | Progresso/storage/assets **não** são tocados (§ escopo proibido da spec) |
| Nenhuma dependência nova | Nenhuma |
| Smoke + expo-doctor verdes | Gate obrigatório da Etapa 10 |
| 100% JavaScript | Sem TypeScript, sem `tsconfig.json` |

## 3. Riscos do plano e mitigação

| Risco | Mitigação |
|---|---|
| Regex do teste antigo casar o texto novo por acaso | A prova deixa de ser textual; passa a ser execução |
| Alguém adicionar a variável ao `production` no futuro | Check estrutural lê o `eas.json` real e falha |
| Teste "verde por construção" (tautologia) | Controles negativos que mutam o fonte da flag e exigem que a prova **caia** |
| Perfil novo herdar env por engano | Novo perfil sem `extends`; check exige que os perfis não-piloto não tenham as variáveis |
| Total de checks cair | Contagem final comparada com o baseline 4185 |

## 4. Arquivos previstos

| Arquivo | Natureza |
|---|---|
| `specs/018-c60-pilot-activation/*` | governança (spec/plan/tasks) |
| `src/config/featureFlags.js` | configuração |
| `eas.json` | configuração |
| `scripts/smoke.js` | testes |
| `docs/PRODUCTION_FLAGS_CHECKLIST.md` | governança |
| `docs/DECISIONS.md` | governança |
| `docs/P3I_CANONICALIZACAO_RUNTIME.md` | governança |

**Nenhum outro.**
