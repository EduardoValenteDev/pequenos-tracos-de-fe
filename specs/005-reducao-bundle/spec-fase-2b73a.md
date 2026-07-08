# Bloco 2 · Fase 2B.7.3a · Progresso visual em história premium bloqueada

> **Feature:** `005-reducao-bundle` · **Subfase:** 2B.7.3a (correção de UX, fora da trilha de entitlement) · **Etapa SDD:** 1 (Specify) · **Portão 1: pendente.**
> **Branch:** `content-integrate-coloring-3` · **HEAD:** `16c6e18`.
> **Natureza:** correção visual de tela (`StoryDetailScreen`). **Sem** alterar entitlement/RevenueCat/packs/2C.

## Problema (device)
Com Modo Criador ativo, o usuário avança em uma história premium (ex.: Ester até a cena 5). Ao **desativar** o Modo Criador (sem assinatura) e abrir a história, a tela aparece **como se nada tivesse sido feito**: todas as cenas mostram "Bloqueada" + "Complete a cena anterior", apagando visualmente o progresso real já salvo.

## Diagnóstico (read-only)
- **Decisão do estado visual das cenas:** `StoryDetailScreen.getSceneStatus(cena, index)` ([:179-185](../../src/screens/StoryDetailScreen.js#L179)) + render em `SceneListItem` ([SceneListItem.js](../../src/components/story/SceneListItem.js)).
- **Bug exato — [:181](../../src/screens/StoryDetailScreen.js#L181):**
  ```
  if (isComingSoon) return 'locked';
  if (!canAccess) return 'locked';               // ← sobrescreve TUDO antes de olhar o progresso
  if (progresso[cena.id] === true) return 'completed';
  if (index === progressCount) return 'available';
  return 'locked';
  ```
  Quando premium **sem acesso** (`canAccess=false`), **todas** as cenas viram `'locked'` — inclusive as já concluídas.
- **`SceneListItem`:** `'locked'` → não-clicável (`disabled`, `onPress=undefined`, "Complete a cena anterior"); `'completed'` → clicável, ✓, badge "Concluída".

## Regra desejada
1. Progresso visual reflete o que já foi feito. 2. Acesso premium continua bloqueado sem assinatura. 3. Mostrar progresso **não** libera acesso. 4. Cenas concluídas podem aparecer concluídas. 5. Cenas não concluídas seguem bloqueadas sem acesso. 6. Ação principal continua pedindo responsável/assinatura. 7. **Não** continuar da cena 6 sem acesso. 8. **Não** liberar narração/colorir/quiz/livrinho/experiência premium nova sem acesso. 9. **Não** alterar entitlement/RevenueCat/packs/downloads/2C.

## Correção proposta
**Reordenar** a decisão visual para o progresso vir **antes** do bloqueio de acesso; a **permissão de abrir** continua onde está (guard `goToPremium` + mount guards das telas, 2B.6):
```
if (isComingSoon) return 'locked';
if (progresso[cena.id] === true) return 'completed';   // progresso visual real, MESMO sem acesso
if (!canAccess) return 'locked';                        // não-concluídas: bloqueadas sem acesso
if (index === progressCount) return 'available';
return 'locked';
```
**Efeito por caso** (única mudança: concluída-sem-acesso `locked`→`completed`):
| Cena | canAccess | progresso | Hoje (bug) | Corrigido |
|---|---|---|---|---|
| concluída | true | true | completed | completed |
| **concluída** | **false** | **true** | **locked** ✗ | **completed** ✓ |
| atual (`index===progressCount`) | true | false | available | available |
| atual | false | false | locked | locked |
| futura | true/false | false | locked | locked |

## Separação "visualização" × "permissão" (ponto 5)
- **Visual:** `getSceneStatus` (só decide o rótulo/ícone). Concluída → `completed` sempre.
- **Permissão de abrir:** `goToPremium(routeName, params)` ([:164](../../src/screens/StoryDetailScreen.js#L164)) — checa `canAccess`; sem acesso → `ParentArea` (2B.6). As telas Narration/Coloring/StoryBook revalidam no mount/foco (2B.6). Então tocar numa cena `completed` **sem acesso** → `ParentArea` (**não abre** conteúdo premium). Botão primário → "Pedir ao responsável" (`getPrimaryLabel`, `!canAccess`).

## Esclarecimentos (12 pontos)
1. **Estado visual das cenas:** `StoryDetailScreen.getSceneStatus` + `SceneListItem`. 2. **Progresso real:** `useProgress(story.id).progresso` (map `cena.id→bool`) + `progressCount`. 3. **Acesso ativo:** `canAccess = hasAccess(story)` → `isPremiumUser` (accessControl → getCurrentPlan/Modo Criador). 4. **Onde sobrescreve:** `getSceneStatus:181`. 5. **Separar:** reordenar (visual) + manter `goToPremium`/mount guards (acesso). 6. **Concluídas sem abrir:** `completed` clicável → `goToPremium` → ParentArea. 7. **Cena atual/próxima:** sem acesso, a atual **não** fica `available` (o `!canAccess` vem antes) → `locked` (não continua). 8. **Grátis sem regressão:** `canAccess=true` → fluxo idêntico (prova por caso). 9. **Premium sem progresso = hoje:** nenhuma concluída → todas caem em `!canAccess` → `locked`. 10. **Premium não liberado:** `getSceneStatus` é só visual; abertura bloqueada por `goToPremium`/telas; smoke prova. 11. **Entitlement intacto:** accessControl/entitlement* inalterados; `canAccess`/`isPremiumUser` idênticos. 12. **2B.7.4/2C fora:** nenhum RevenueCat; `app.json` sem `assetBundlePatterns`.

## Arquivos
| Pode tocar | Proibido (salvo Plan justificar + parar) |
|---|---|
| `src/screens/StoryDetailScreen.js` (`getSceneStatus`) | `entitlementPolicy`/`entitlementService`/`entitlementSource` |
| `scripts/smoke.js` (checks) | `accessControl` (salvo análise mostrar necessidade) |
| *(opcional, Plan)* helper puro de status de cena + `SceneListItem` (indicador "concluída bloqueada") | RevenueCat, `App.js`, packs/downloads, assets, requires, `app.json`, 2C |

## Gates
1. Smoke: premium **com** progresso **sem** acesso → concluídas `completed`, não-concluídas `locked`. 2. Smoke: premium **sem** progresso **sem** acesso → todas `locked`. 3. Smoke: grátis **com** progresso → idêntico. 4. Smoke: mostrar progresso **não** libera abertura (goToPremium/telas intactos). 5. Smoke: pedido ao responsável continua (`getPrimaryLabel !canAccess`). 6. Smoke: entitlement/2B.7.4 não tocados. 7. `expo-doctor`. 8. **Validação visual no device antes do commit** (é mudança de tela).

## Fora de escopo
Entitlement/RevenueCat/2B.7.4/packs/downloads/2C; liberar qualquer conteúdo premium; mudar a lógica de acesso; mudar histórias grátis.

## Critérios de aceite
1. Cena concluída em história premium **sem acesso** aparece **concluída** (não "Bloqueada").
2. Cenas não concluídas seguem **bloqueadas** sem acesso; cena atual **não** vira "Disponível" sem acesso.
3. Tocar em cena concluída sem acesso → **ParentArea** (não abre Narração/Colorir/Livrinho/Quiz).
4. Botão primário premium bloqueado segue "Pedir ao responsável".
5. Histórias **grátis** e premium **sem progresso**: comportamento **idêntico** ao atual.
6. `accessControl`/entitlement*/packs/`app.json`/RevenueCat **intocados**; 2B.7.4/2C não iniciadas.
7. Smoke (gates 1-6) verde; `expo-doctor` verde; validação visual device.
