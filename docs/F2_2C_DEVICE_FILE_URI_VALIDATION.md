# F2.2c — Validação oficial de `file://` real no iPhone (`david_goliath`)

> **Bloco:** F2.2c (Fase 2 §19). **Documentação da validação ponta a ponta em device.**
> **Data:** 2026-07-03 · **Natureza:** documental — **nenhum código alterado**.
> Registra a prova, no aparelho, de que o runtime de packs resolve mídia por `file://`
> real quando o pack está `ready`, e por `require` (fallback local) quando não está.

---

## 1. Branch e HEAD base
- **Branch:** `content-integrate-coloring-3`
- **HEAD base:** `c768841` (feat: add dev pack sandbox device tool)
- Único arquivo deste bloco: `docs/F2_2C_DEVICE_FILE_URI_VALIDATION.md`.

## 2. Objetivo da validação
Provar, **no iPhone**, que:
- as 3 superfícies conectadas de `david_goliath` renderizam por **`file://` real** quando existe um pack `ready` local;
- o **fallback local (`require`)** volta após o reset;
- toda a ferramenta é **dev-only** (some com a flag desligada).
Tudo em **sandbox**, sem R2, sem download real, sem RevenueCat/entitlement.

## 3. Ambiente usado
- **Device:** iPhone (mesmo ambiente das validações anteriores — Expo Go).
- **Bundler:** Metro (Expo SDK 54), bundle limpo (`-c`).
- **Runtime:** New Architecture (Fabric/Hermes), RN 0.81.5, React 19.1.0.
- **Pack sandbox:** cenas copiadas do bundle → `documentDirectory/packs/david_goliath@1.0.0/scenes/` (via `expo-asset` + `expo-file-system`).

## 4. Como a flag foi ligada
- Variável de ambiente (dev): **`EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true`**.
- Comando: **`EXPO_PUBLIC_ENABLE_PACK_SANDBOX=true npx expo start -c`** → abrir no iPhone.
- Duplo gate efetivo: `__DEV__ && EXPO_PUBLIC_ENABLE_PACK_SANDBOX === 'true'`.
- Com a flag ligada, apareceu o **FAB "🛠 packs"** → abriu a **tela dev** `PackSandboxDev`.

## 5. Resultado com seed
- **Seed executou com sucesso** (cópia das 10 cenas do bundle → `documentDirectory`).
- Pack `david_goliath@1.0.0` marcado **`ready`** no índice `@ptf_packs_v1` (só após 10/10 válidas).

## 6. Resultado do diagnóstico (pós-seed)
| Campo | Valor observado |
|---|---|
| `status` | **ready** |
| arquivos | **10/10** |
| `usesPack` | **true** |
| `sourceType` (por cena) | **file** |
| `uri` | começa com **`file://`** (`…/packs/david_goliath@1.0.0/scenes/…`) |

## 7. Superfícies validadas (Davi e Golias, com pack `ready`)
- ✅ **NarrationScreen** (cenas) — abriu normalmente, renderizando por `file://`.
- ✅ **Livrinho — "História ilustrada"** (páginas) — abriu normalmente por `file://`.
- ✅ **Livrinho — prévia da intro** (thumbnail) — apareceu normalmente por `file://`.
- Sem tela branca, imagem quebrada ou flicker perceptível.

## 8. Controles validados (outras histórias — caminho antigo)
- ✅ **Jesus e as Crianças** — funcionou normalmente (fallback local, não afetado pelo pack de david).
- ✅ **A Criação / Noé** — funcionou normalmente.

## 9. Resultado do reset
- **Reset executou** (limpou a entrada do índice + apagou o diretório local).
- Diagnóstico voltou para **`sourceType = require`** e **`usesPack = false`**.
- **Davi e Golias continuou funcionando** pelo **fallback local (`require`)**.

## 10. Resultado com a flag desligada
- ❌ **FAB "🛠 packs" não apareceu.**
- ❌ **Tela dev não ficou acessível** (rota não registrada).
- **Nenhum seed/reset rodou.**
- App normal: **Davi e Golias**, **Jesus e as Crianças** e o **Livrinho** abriram normalmente.

## 11. Gates finais
- **`npm run smoke`: 1511/1511 ✓**
- **`npx expo-doctor`: 18/18 ✓**
- **`npm run audio:audit`: 200/200 launch-ready ✓**

## 12. Conclusão técnica
O runtime híbrido de packs está **provado ponta a ponta no device**: com um pack `ready`
local, o `contentResolver` resolve as cenas de `david_goliath` por **`file://` real**
(confirmado por diagnóstico `sourceType=file`/`usesPack=true`/`uri file://` **e** visualmente
nas 3 superfícies), e retorna ao **fallback `require`** após o reset — sem afetar as demais
histórias. A infraestrutura (resolver, PacksContext, índice `@ptf_packs_v1`, `localDir`
`documentDirectory/packs/<id>@<version>/`, cópia de assets do bundle) funciona no aparelho,
**sem R2, sem download real, sem RevenueCat/entitlement**. A ferramenta é **estritamente
dev-only** (duplo gate), confirmado com a flag desligada.

## 13. Próximo marco recomendado — **F2.3a (auditoria de download real sandbox)**
Auditar e planejar a substituição da cópia-do-bundle por um **download real controlado**
(de um servidor sandbox local/HTTP, ainda **sem R2**), reaproveitando `packDownloadService`
(fluxo `.tmp → validar → mover atômico → ready`) + `packIntegrityService` (bytes/sha256).
Escopo mínimo, gated, com `manifest.json` + integridade, antes de qualquer R2.

## 14. O que ainda NÃO foi feito
- **R2** (armazenamento remoto real) — não iniciado.
- **Download real** (rede) — não iniciado (o seed atual copia do bundle).
- **RevenueCat / entitlement / compras** — não tocados.
- **Áudio, colorir, capas premium** via pack — não conectados (seguem locais).
- **BeniChest** ("Cartinha de Cena") — não conectado (decisão do F2.1j: adiado).
- **Demais 17 histórias** — não migradas (só `david_goliath` é sandbox).
- **`manifest.json` + sha256 real no device** — pendentes (dep de crypto + F2.3+).
