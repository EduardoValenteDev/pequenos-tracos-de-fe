# R7 · Mini-SDD · C60 no perfil preview

## Problema e causa

O R7 Attempt 02 foi um APK `preview` release válido, mas ocultou `Colorir com o
Beni`. A causa é a divergência deliberada entre perfis: o Development Build abre
pelo ramo `__DEV__`; o release `c60-pilot` abre pela cerca de build; `preview` não
possuía autorização C60 e a cerca aceitava somente o nome `c60-pilot`.

As duas variáveis do contrato são:

- `EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT=true`;
- `EXPO_PUBLIC_BUILD_PROFILE`, com identidade autorizada estrita.

## Contrato aprovado

| Perfil | C60 | DEV/tools | P139 |
|---|---:|---:|---:|
| `development` | mecanismo atual | DEV | mecanismo atual |
| `c60-pilot` | ON | OFF | OFF |
| `preview` | ON | ferramentas internas já governadas separadamente; não é DEV | ON |
| `production` | OFF | OFF | OFF |

`preview-criador` não é incluído por inferência: seu identificador efetivo é
`preview-criador`, não `preview`. A decisão nomeia somente `preview`.

## Solução mínima

1. adicionar somente `EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT=true` ao env existente
   de `preview`; `EXPO_PUBLIC_BUILD_PROFILE=preview` já existe;
2. adaptar `COLORIR_60_CREATION_PILOT_ENABLED` para exigir autorização literal e
   perfil literal pertencente ao conjunto fechado `{c60-pilot, preview}`;
3. atualizar os testes existentes da cerca e adicionar um harness focado com
   mutantes para o contrato R7;
4. atualizar somente a documentação de flags afetada.

Somente `eas.json` seria insuficiente: com a expressão atual, `preview` continuaria
falso mesmo contendo a autorização. Logo a alteração de `featureFlags.js` é causal
e necessária. `StoryDetailScreen.js` permanece intocado.

## Invariantes e testes

- preview C60 ON com as duas condições; remover qualquer uma fecha;
- preview continua sem `developmentClient` e `__DEV__` não participa da flag;
- production C60 OFF e P139 OFF, mesmo sob mutações isoladas;
- c60-pilot permanece ON e sem ferramentas internas;
- P139 continua somente no contrato vigente de preview;
- StoryDetail continua consumindo a flag oficial sem ramo especial de perfil;
- D1, package, signing, versionamento, storage, schemas, assets, navegação e UI
  permanecem intocados.

Gates: harness focado e mutantes, smoke, `npm run verify:runtime`, bundle Android,
`npx expo-doctor` com a divergência conhecida 17/18, auditoria do diff e novo EAS
Build `preview` Android.

## Risco e rollback lógico

O risco é vazamento do piloto para production ou ferramentas internas no preview;
os testes executam a configuração real e matam essas mutações. Rollback lógico:
remover a autorização C60 do env `preview` e retirar `preview` do conjunto fechado,
restaurando o contrato anterior sem migração de dados.

Portões documentais: especificação, plano mínimo e tasks/análise estão fechados pela
decisão `D-FUND-R7-PREVIEW-C60-01`. Implementação autorizada.
