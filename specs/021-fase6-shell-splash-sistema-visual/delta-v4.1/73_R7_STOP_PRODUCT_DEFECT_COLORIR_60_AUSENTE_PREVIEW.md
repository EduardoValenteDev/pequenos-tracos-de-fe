# R7 · STOP_PRODUCT_DEFECT · Colorir 60 ausente no preview

## Achado físico preservado

- `PRODUCT_DEFECT`: `Colorir com o Beni` ausente em `A Criação` no Preview R7.
- Superfície: `StoryDetail` / `A Criação`.
- Esperado pelo roteiro e confirmado pelo fundador: seção presente na posição
  canônica previamente validada.
- Real: seção ausente; não é viewport nem falta de scroll.
- Primeira observação: R7 Attempt 02, build
  `34518222-4b6f-4dd3-9fca-dbfb6cad09df`, source executável `32c8262`.
- APK SHA-256:
  `53FC038BD7CC4F8F369E41DFB3016A038118F68A2AF1CC18AB092D274DB5A199`.
- Package/version: `com.valentedev.pequenostracosdefe`, `1.0.0` (`1`).
- Evidência audiovisual externa permanece sob custódia do fundador.
- Nenhuma nova interação humana foi solicitada depois do achado.

R7/T090/P139 permanecem não adjudicados. O log físico foi congelado em
`C:\tmp\ptf_r7_attempt_02_evidence\t090-p139-physical-logcat.txt`, com
SHA-256 `7DB37407569F770FC85A734C177A36A6E770D630DC06865438CD1098AD67DBC6`.
Ele contém uma amostra P139 schema 2 com terminal `first_layout`, mas isso não
converte o bloco interrompido em PASS.

## Dono e condição de renderização

- Owner de composição: `src/screens/StoryDetailScreen.js`.
- Componente: `src/components/coloring60/CreationColoringJourneySection.js`.
- Gate: `story.id === 'creation'` e
  (`COLORIR_60_CREATION_PILOT_ENABLED` ou `__DEV__ === true` com ferramentas
  internas habilitadas).
- A seção é renderizada fora do bloco de conclusão da história; progresso,
  entitlement e conteúdo dos blobs não podem torná-la visível quando esse gate
  de build está falso.
- Owner da flag: `src/config/featureFlags.js`; perfis: `eas.json`.

## Development versus preview

No Development Build, `__DEV__ === true` e as ferramentas internas tornam o gate
verdadeiro. No perfil `preview`, `__DEV__ === false` e não existem
`EXPO_PUBLIC_ENABLE_COLORIR_60_PILOT=true` nem
`EXPO_PUBLIC_BUILD_PROFILE=c60-pilot`. Portanto o gate é falso por construção.

O perfil `c60-pilot` é o único release autorizado pelo contrato atual a habilitar
a seção. O próprio comentário owner declara expressamente que `preview`,
`preview-criador`, `screenshot` e `production` permanecem fechados.

## Bundle, estado e D1

O bundle do APK contém os símbolos e textos `Colorir com o Beni`, `Haja luz` e as
atividades C60: o código foi compilado, não removido. A seção está presente no
bundle, mas não é renderizada porque o gate efetivo é falso.

O desaparecimento independe de RKStorage. O update in-place preservou assinatura e
`ceDataInode`; a inspeção privada POS ficou indisponível porque o novo release é
corretamente não-debuggable. As obras C60 não controlam o gate de renderização, e
nenhuma evidência aponta perda de índice ou blob.

O diff executável `fa417b8..32c8262` toca apenas o config plugin D1 e seus testes.
Não toca StoryDetail, flags, catálogo C60 ou perfil preview. A política D1 também
foi observada no Android como `SCREEN_ORIENTATION_UNSPECIFIED` no tablet. Não há
caminho causal da correção D1 para o desaparecimento.

## Causa e commit causal

- Classificação: `REGRESSION_BUILD_PROFILE` no contexto da expectativa R7.
- Causa: R7 escolheu o perfil `preview`, enquanto a campanha anterior observou C60
  em Development Build; os dois perfis possuem gates deliberadamente diferentes.
- Commit que estabeleceu a separação: `8464954 feat(config): add guarded c60 pilot
  build profile`.
- O Attempt 02 revelou a incompatibilidade preexistente entre o roteiro R7 e o
  contrato do perfil; `32c8262` não a introduziu.

## Decisão necessária antes de corrigir

Não existe uma única correção autorizável sem alterar contrato de produto/build:

1. habilitar C60 no perfil `preview`, ampliando deliberadamente o escopo desse
   perfil interno e adaptando a cerca dupla; ou
2. criar/adjudicar um perfil composto release, com P139 e C60, e alterar o contrato
   de R7 que hoje exige especificamente `preview`; ou
3. manter os perfis atuais e retirar C60 do comportamento esperado de R7, o que
   contradiz a adjudicação física atual do fundador.

Até a decisão, não há Mini-SDD de correção, mudança executável ou Attempt 03.
Estado terminal: `STOP_HUMAN_DECISION` subordinado ao `STOP_PRODUCT_DEFECT` já
confirmado.
