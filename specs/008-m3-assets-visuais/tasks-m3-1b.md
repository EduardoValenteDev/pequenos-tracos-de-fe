# Tasks — M3.1b · Piso de versão local para packs remote obsoletos

> **Etapa SDD 5.** Micro-tasks atômicas. **Nada é executado antes do Portão 3.**
> Lanes de commit: `[código]` · `[governança]`. Nunca misturar. Sem assets, sem R2, sem `app.json`/`eas.json`.
> Regra estrutural: **Momento 1 = mecanismo com mapa VAZIO (no-op)**; **Momento 2 = ativação por história**, só depois de arte integrada + pack republicado.

---

## MOMENTO 1 — Mecanismo (no-op comprovado)

Nenhum pack é invalidado ao fim deste momento. O mapa de pisos sai **vazio**, e o smoke prova que a saída é idêntica à de hoje.

### T1 — `src/data/packMinVersions.js` (NOVO, puro)
Módulo de dados, sem imports de serviço, sem I/O.

- `PACK_MIN_VERSIONS` — objeto **congelado e VAZIO** neste momento (`Object.freeze({})`).
- `getPackMinVersion(storyId)` → string semver ou `null` (id ausente → `null` = sem piso).
- Comentário de cabeçalho registrando: (a) o propósito; (b) que **só as 7 histórias do M3** entrarão; (c) a **nota de validade** — este mecanismo depende de os assets `remote` ainda existirem no bundle e **expira no 2C**; (d) a **restrição de sequência**: um `storyId` só entra aqui depois de o pack ser republicado no R2 com `version` ≥ piso.

_Aceite:_ mapa vazio; acessor puro; nenhuma dependência.

### T2 — `src/services/packReconcileService.js` (ADITIVO, núcleo puro)
Não alterar nenhuma função existente. Só acrescentar.

- **T2.1** `compareSemver(a, b)` → `-1 | 0 | 1 | null`. `null` quando qualquer lado não for `x.y.z` numérico. Comparação **numérica** por componente (para `1.9.0 < 1.10.0` ser verdadeiro).
- **T2.2** `isPackVersionAcceptable(entry, minVersion)`:
  - `minVersion` falsy → `true` (sem piso → nada a avaliar);
  - `entry.status !== 'ready'` → `true` (não serve `file://`);
  - `entry.version` ausente/não-semver → `false` (rebaixa; ver assimetria na spec §3.3);
  - `compareSemver(entry.version, minVersion) < 0` → `false`; senão `true`.
- **T2.3** `computeVersionStaleIds(index, minVersions)` → `string[]` puro: ids `ready` reprovados no piso.
  > **Correção de projeto (Analyze A-D1):** a spec §4 previa um **3º parâmetro** em `computeInvalidReadyIds`. **Descartado.** Aquela função roda no `useEffect` (assíncrono); colocar o piso nela reintroduziria o frame de arte velha (spec §3.4) e criaria **duas fontes de verdade** para a mesma decisão. `computeInvalidReadyIds` fica **intocada** — retrocompatibilidade por construção, não por parâmetro default, e os checks existentes do smoke ([14281+]) não precisam migrar.

_Aceite:_ funções puras (sem FS/AsyncStorage/rede, nunca lançam); `computeInvalidReadyIds` **não é modificada**; testáveis pelo `evalReconcile()` já existente no smoke (strip de `import` + injeção de `PACK_STATUS`).

### T3 — `src/context/PacksContext.js` (contexto — área sensível)
- **T3.1** Inserir `versionGatedIndex`: `useMemo` **SÍNCRONO** sobre `normalizedIndex`, chamando `computeVersionStaleIds` (puro) e aplicando `reconcileEntry` aos ids reprovados.
  - Se **nenhum** id for reprovado (caso do mapa vazio), retornar **a MESMA referência** `normalizedIndex` — estabilidade referencial preservada (Livrinho não rebuilda timeline).
- **T3.2** Encadear: `packIndex` → `normalizedIndex` → **`versionGatedIndex`** → overlay assíncrono de disco → `reconciledIndex`.
  - O probe de disco passa a varrer o índice **já gated**: entries rebaixadas pelo piso deixam de ser `ready`, logo `needsDiskCheck` = false → **menos `getInfoAsync`**, não mais.
- **T3.3** Não gravar índice, não baixar, não importar `packDownloadService`, não tocar `getStoryPackState` (o short-circuit de `starter` por camada continua antes de qualquer consulta ao índice).

_Aceite:_ piso avaliado no 1º render (sem frame de arte velha); `PacksContext` continua READ-ONLY; mesma referência quando não há invalidação.

### T4 — `scripts/smoke.js` (bloco `── M3.1b ──`)
- **T4.1** `compareSemver`: `1.0.0 < 1.1.0`; `1.9.0 < 1.10.0`; iguais → `0`; entrada inválida → `null`.
- **T4.2** `isPackVersionAcceptable`: sem piso → aceita; `ready` + versão abaixo → rejeita; versão ausente/ilegível → rejeita; status ≠ `ready` → aceita.
- **T4.3** **Retrocompatibilidade:** `computeInvalidReadyIds(index, probes)` (2 args) devolve exatamente o mesmo resultado de hoje.
- **T4.4** **Prova do no-op:** `PACK_MIN_VERSIONS` está **vazio** ⇒ nenhum storyId invalidado por piso.
- **T4.5** **Starter:** `creation` e `noah` não têm piso.
- **T4.6** Guard anti-regressão: `PacksContext` não contém `setPackEntry`/`savePackIndex` nem importa `packDownloadService`; `contentResolver.js` **inalterado** (nenhuma menção a piso/minVersion).
- **T4.7** Guard de validade: `packMinVersions.js` cita a expiração no 2C (a nota não pode sumir numa refatoração).

_Aceite:_ smoke verde, contagem crescida; nenhum check antigo migrado sem justificativa.

### T5 — Gates + relatório
`npm run smoke` · `npx expo-doctor` · `git diff --check`. Relatório PT-BR distinguindo salvo/untracked/modificado/staged/commitado.

### T6 — Commit `[código]` do mecanismo
`git add` seletivo de: `src/data/packMinVersions.js`, `src/services/packReconcileService.js`, `src/context/PacksContext.js`, `scripts/smoke.js`.
Mensagem sugerida: `feat: add local pack version floor (no-op mechanism)`.
**Sem push sem autorização.** Device **não** é necessário neste momento (comportamento inalterado, provado por smoke) — mas um smoke visual rápido é bem-vindo.

**🚦 Portão — fim do Momento 1.**

---

## MOMENTO 2 — Ativação por história (um lote por vez)

**Pré-condições, todas obrigatórias, por história:**
1. Arte nova entregue e validada contra `producao-m3.md`;
2. Assets integrados no bundle e **commitados** (lane de assets, `git add` seletivo);
3. **Pack republicado no R2** com `version` ≥ piso e `verify-r2-pack-readiness.js` verde;
4. Só então o `storyId` entra em `PACK_MIN_VERSIONS`.

> Inverter esta ordem produz **loop de download** (spec §6). Não há mitigação em código — é sequência.

### T7 — Ativar `storyId` no mapa
Uma linha em `packMinVersions.js` por história, com o piso igual à versão republicada.

### T8 — Smoke da ativação
Assertar que o piso do `storyId` existe, é semver válido e que histórias **fora** do M3 continuam sem piso.

### T9 — Device (Eduardo) — obrigatório
Roteiro da spec §8, com o estado que só existe em aparelho: **baixar a história ANTES de atualizar o app**.
1. Pack `ready` com arte antiga → 2. atualizar app → 3. arte **nova** + botão "Baixar" reaparece → 4. **modo avião**: história abre com a arte nova (bundle) → 5. rebaixar: fica `ready` e **não** volta ao botão (sem loop) → 6. história `remote` fora do M3 segue `ready`/offline → 7. `creation`/`noah` inalteradas → 8. Livrinho sem flicker/rebuild.

### T10 — Commit `[código]` da ativação
`packMinVersions.js` + `scripts/smoke.js`. Mensagem: `feat: activate pack version floor for <story>`.

**🚦 Portão por lote.**

---

## T11 — Governança
Commit `[governança]` com os docs SDD do M3/M3.1b (`spec-m3.md`, `producao-m3.md`, `spec-m3-1b.md`, `tasks-m3-1b.md`, `analyze-m3-1b.md`) — **separado** de código e de assets.

---

## Ordem e lanes

| # | Momento | Lane | Device |
|---|---|---|---|
| T1–T6 | Mecanismo (no-op) | `[código]` | não |
| T7–T10 | Ativação (por história) | `[código]` | **sim** |
| assets | Integração da arte | `[assets]` | sim (visual) |
| T11 | Docs SDD | `[governança]` | não |

**Nunca no mesmo commit:** código × assets × governança.

## Paralelismo confirmado
A **produção externa das 37 artes** (`producao-m3.md`) é **independente** deste bloco e pode seguir agora. O designer não depende de nenhuma task acima; o encontro das trilhas é o Momento 2, pré-condição 1.

## Fora do escopo
Opção B (checagem remota / `needs_update` / UI "Atualizar história") · limpeza de packs em disco · apagar arquivos · migrar `@ptf_packs_v1` · tocar R2 · **2C** · **Camada de Alma** · qualquer mudança em `contentResolver`, downloader, entitlement ou telas.
