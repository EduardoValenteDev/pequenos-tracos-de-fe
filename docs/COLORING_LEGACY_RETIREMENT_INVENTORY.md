# Inventário de aposentadoria do Colorir legado (P3J)

> **Documento de arquivo.** Registra, arquivo a arquivo, os linearts do **Colorir legado**
> retirados do repositório no macrobloco **P3J — Aposentadoria Global do Colorir Legado**.
> Nenhum PNG foi copiado para outro diretório do aplicativo: **o histórico do Git é o
> arquivo oficial**.

## 1. Identificação

| Campo | Valor |
|---|---|
| Macrobloco | P3J — Aposentadoria Global do Colorir Legado |
| Branch | `integrate/colorir-canonical-runtime` |
| **Commit anterior (ponto de recuperação)** | **`7c12987622d07a8e305e1930fdae45751afc65d9`** |
| Arquivos aposentados | **199** |
| Bytes aposentados | **293.743.663** (280,14 MB) |
| Recuperação pelo Git | **Confirmada** — os 199 arquivos estavam rastreados (`git ls-files`) e commitados em `7c12987` |

## 2. Motivo da aposentadoria

Decisão do fundador: **o Colorir legado não faz parte da versão de lançamento**. A atividade
de colorir do produto passa a ser exclusivamente o **Colorir com o Beni** (Colorir 60), hoje
disponível em *A Criação*. As histórias ainda não convertidas ficam **temporariamente sem
atividade de colorir** — sem card vazio, sem bloqueio e sem mensagem de "em breve".

Os 199 arquivos abaixo eram o mapa estático de linearts por cena
(`src/assets/coloringImages.js`, 200 `require()` literais). Com a retirada da interface
legada e do próprio mapa, **nenhum deles tem consumidor de runtime**.

### 2.1 Consequência registrada: perda funcional de acesso às pinturas legadas de teste

O motor de pintura grava **apenas a camada de tinta** da criança
(`ColoringCanvas.js` → `window.exportPaint`: `outCtx.putImageData(paintD,0,0)`); o contorno
nunca entra no arquivo salvo — ele é composto só na tela (`globalCompositeOperation=
'multiply'`). Por isso `StoryBookScreen.makeChildArtVisual` recusa exibir a pintura sem o
lineart: sem contorno não há obra, há mancha de cor.

Removidos os linearts, **as pinturas legadas deixam de ser exibíveis**. Isso é **perda
funcional de acesso**, não fallback gracioso, e foi decidido conscientemente:

1. O aplicativo **nunca foi distribuído** (`app.json`: version `1.0.0`, buildNumber `1`;
   fase corrente 2.5 de um roadmap cuja publicação é a Fase 22).
2. As únicas pinturas legadas conhecidas estão no **iPhone de teste do fundador** e são
   **dados de desenvolvimento e QA**, não dados de usuários reais.
3. **Nenhuma pintura é apagada**: os payloads em `@ptf_drawing_s<storyId>_c<sceneId>` e os
   arquivos apontados por eles **permanecem intactos e inertes**, sem consumidor. Não há
   `AsyncStorage.clear`, exclusão por prefixo nem exclusão recursiva em nenhum caminho.

> ⚠️ **Esta decisão seria inadequada depois da distribuição pública.** Retirar linearts
> que dão contorno a obras já pintadas por crianças reais exigiria, obrigatoriamente, uma
> estratégia de preservação comprovada (migração de achatamento idempotente ou pack de
> compatibilidade versionado) **antes** da remoção do asset. O que a torna segura aqui é
> exclusivamente a condição **pré-lançamento, sem usuários externos**.

## 3. Preservação obrigatória (NÃO aposentados)

| Arquivo | Bytes | SHA-256 | Papel |
|---|---:|---|---|
| `assets/stories/creation/coloring/scene_02.png` | 861.767 | `c960f1bb1c34b0cce71a6d078768e6c2a542fa13ba096cf18a964d45058e83c1` | Atividade `light` do Colorir com o Beni |
| `assets/stories/creation/coloring/activities/living_world.png` | 973.618 | `818cd917c7493f4a3e04512a7120a6eaff5a03fdd16277b7d4fdfd1ee33b6ac5` | Atividade `living_world` |
| `assets/stories/creation/coloring/activities/people_and_care.png` | 1.195.149 | `59988d9a58082a8173a328857fccb6a3716815660f4434c0df4491d6bf30d4e9` | Atividade `people_and_care` |

As **cinco poses do Colorir com o Beni** (`assets/mascot/beni/12..16`) também permanecem
byte-idênticas — ver `scripts/verify-coloring60-assets.js` e o smoke.

## 4. Economia por história

| História | Arquivos | Bytes | MB |
|---|---:|---:|---:|
| `abraham_stars` | 10 | 13.031.444 | 12,43 |
| `creation` | 9 | 25.397.057 | 24,22 |
| `daniel_lions` | 10 | 13.113.416 | 12,51 |
| `david_goliath` | 10 | 12.628.454 | 12,04 |
| `esther_queen` | 10 | 14.481.799 | 13,81 |
| `good_samaritan` | 10 | 14.728.270 | 14,05 |
| `jesus_children` | 10 | 14.778.067 | 14,09 |
| `jesus_temple` | 10 | 14.599.167 | 13,92 |
| `jonah_big_fish` | 10 | 12.913.915 | 12,32 |
| `joseph_colorful_coat` | 10 | 16.030.087 | 15,29 |
| `josiah_young_king` | 10 | 14.372.188 | 13,71 |
| `lost_sheep` | 10 | 13.975.542 | 13,33 |
| `mary_says_yes` | 10 | 15.412.375 | 14,70 |
| `miraculous_catch` | 10 | 14.077.406 | 13,43 |
| `moses_red_sea` | 10 | 15.503.202 | 14,79 |
| `noah` | 10 | 13.492.640 | 12,87 |
| `ruth_naomi` | 10 | 14.555.326 | 13,88 |
| `samuel_hears_god` | 10 | 11.035.783 | 10,52 |
| `solomon_wisdom` | 10 | 15.182.203 | 14,48 |
| `timothy_faith` | 10 | 14.435.322 | 13,77 |
| **TOTAL** | **199** | **293.743.663** | **280,14** |

## 5. Inventário arquivo a arquivo

Todos com o mesmo **motivo** (§2) e a mesma **confirmação de recuperação**: rastreados no
Git e recuperáveis por `git checkout 7c12987 -- <caminho>`.

| # | Caminho anterior | História | Cena | Bytes | Dimensões | SHA-256 |
|---:|---|---|---:|---:|---|---|
| 1 | `assets/stories/abraham_stars/coloring/scene_01.png` | `abraham_stars` | 1 | 1.216.445 | 1122x1402 | `c34051472f05f9598a5c12b317b9d4d8daf397fed731f101ceec3801568a0e14` |
| 2 | `assets/stories/abraham_stars/coloring/scene_02.png` | `abraham_stars` | 2 | 1.252.777 | 1122x1402 | `e8c2a9f811cdd8464ec49f57de4c5e4f5a9ea3ec081499bfe99d1c3b1720e518` |
| 3 | `assets/stories/abraham_stars/coloring/scene_03.png` | `abraham_stars` | 3 | 1.189.035 | 1122x1402 | `9e6c5ab0823be443c34e7af10d1fd22820fc80c451480d72365bf87100429db0` |
| 4 | `assets/stories/abraham_stars/coloring/scene_04.png` | `abraham_stars` | 4 | 1.592.130 | 1122x1402 | `3571a8c066ef473b3ec679c85280be7584aea22b5dbfde07b95adb074589f159` |
| 5 | `assets/stories/abraham_stars/coloring/scene_05.png` | `abraham_stars` | 5 | 1.281.298 | 1122x1402 | `dcc9ea8ed76d0fb2d2ba890083719ad3f03077b414f427d423fe649bcf51da5e` |
| 6 | `assets/stories/abraham_stars/coloring/scene_06.png` | `abraham_stars` | 6 | 1.245.300 | 1122x1402 | `351943a8d48192eead19db91dfc8b1350499e9c9360238c0dfa803b0918526ff` |
| 7 | `assets/stories/abraham_stars/coloring/scene_07.png` | `abraham_stars` | 7 | 1.421.949 | 1122x1402 | `9719962f5c337b6d9ae2f395a6e9c4cc0522019281bcbe04859d1b21ad1de792` |
| 8 | `assets/stories/abraham_stars/coloring/scene_08.png` | `abraham_stars` | 8 | 1.312.248 | 1122x1402 | `42260d05d941ce8ba9600f6896e46772f5da58712fde3385142bf944467ac595` |
| 9 | `assets/stories/abraham_stars/coloring/scene_09.png` | `abraham_stars` | 9 | 1.276.975 | 1122x1402 | `48dbc938f139c3e28466a0d65362c7afc55c3258c0992530175af9e8ff86d50d` |
| 10 | `assets/stories/abraham_stars/coloring/scene_10.png` | `abraham_stars` | 10 | 1.243.287 | 1122x1402 | `b56ae84523f2e34e67f1061a60a86337d4125c798dc925d8531906ed569d8067` |
| 11 | `assets/stories/creation/coloring/scene_01.png` | `creation` | 1 | 589.169 | 1024x1280 | `8eb2a066973dd2ed1d68f7a5ba08a98eda04992b2d471b36dcbf8ddf014ceceb` |
| 12 | `assets/stories/creation/coloring/scene_03.png` | `creation` | 3 | 3.024.930 | 1122x1402 | `41482a5d89085b0e42cf0cf61dedb84bd5010ed0233fe4fa9b4363aa3958f7cc` |
| 13 | `assets/stories/creation/coloring/scene_04.png` | `creation` | 4 | 4.376.441 | 1122x1402 | `764809dcc2aa372bccbf66acd555aee2a93f8ad621687273dfca1e6f08573cb4` |
| 14 | `assets/stories/creation/coloring/scene_05.png` | `creation` | 5 | 3.167.462 | 1122x1402 | `a48d82462498844bee9715a2288c4348e752f9132da7cb3cca35f233d73ca05b` |
| 15 | `assets/stories/creation/coloring/scene_06.png` | `creation` | 6 | 3.560.495 | 1122x1402 | `e661fd351a12a2100adcb929bc9532f2c7ba5362a4004534be20615a2fd1d12b` |
| 16 | `assets/stories/creation/coloring/scene_07.png` | `creation` | 7 | 3.562.228 | 1122x1402 | `91be61a89554758587d7976a7bf2506e381927a824cbff1a9088c96bd7eb5594` |
| 17 | `assets/stories/creation/coloring/scene_08.png` | `creation` | 8 | 4.819.420 | 1122x1402 | `96fea34821922a199cc92d79323a2dcf3bdf482c253f65f7337fe81a914149ed` |
| 18 | `assets/stories/creation/coloring/scene_09.png` | `creation` | 9 | 1.686.145 | 1122x1402 | `30d4eee23d8e876f0d602a606d9a8d82c681c0a3ea27602e660731e8bcc14842` |
| 19 | `assets/stories/creation/coloring/scene_10.png` | `creation` | 10 | 610.767 | 1024x1280 | `ba7cc35afa89fe2e7544f6ebe5e085d820bb706dc32fe16cf6a638eea268d4d8` |
| 20 | `assets/stories/daniel_lions/coloring/scene_01.png` | `daniel_lions` | 1 | 1.060.168 | 1122x1402 | `9110430a42c8dbb37613e1a894e86a50dfd788486266343f82b5e31409b2132d` |
| 21 | `assets/stories/daniel_lions/coloring/scene_02.png` | `daniel_lions` | 2 | 1.335.049 | 1122x1402 | `cc7744e9ab358a0d06084132b26a32e3b2f74af1d31de76699c8755a837d97bf` |
| 22 | `assets/stories/daniel_lions/coloring/scene_03.png` | `daniel_lions` | 3 | 1.282.831 | 1122x1402 | `b35b7edfc42efa5c46242dd840183e9d8f1b113cae413ac0f5417b46ccfd4e02` |
| 23 | `assets/stories/daniel_lions/coloring/scene_04.png` | `daniel_lions` | 4 | 1.258.559 | 1122x1402 | `ab98e948625810d003443fc08fcdcb22f94ba1c17b04a326ba6a871f8df8f882` |
| 24 | `assets/stories/daniel_lions/coloring/scene_05.png` | `daniel_lions` | 5 | 1.382.764 | 1122x1402 | `b4efaafb45149208fb2187de97b6c13ed5b379f6e64944e375b596184cd9dc27` |
| 25 | `assets/stories/daniel_lions/coloring/scene_06.png` | `daniel_lions` | 6 | 1.277.468 | 1122x1402 | `1b39fb4615ab6a40744c382cca6343df9ad5df365e9814870b5738521f25ea9c` |
| 26 | `assets/stories/daniel_lions/coloring/scene_07.png` | `daniel_lions` | 7 | 1.523.016 | 1122x1402 | `f8f073793b1cd82355fb598f6780ffec8b757cebb1245834c8b49ec0d47e301a` |
| 27 | `assets/stories/daniel_lions/coloring/scene_08.png` | `daniel_lions` | 8 | 1.234.146 | 1122x1402 | `922d5bfd2025ab585708c820b4d459ba8693021fe3c832f55441612ca4f8e0bb` |
| 28 | `assets/stories/daniel_lions/coloring/scene_09.png` | `daniel_lions` | 9 | 1.372.886 | 1122x1402 | `bf0a95412f1301db01f3942742e569ca356837f72ea6fd5d4df4fbd2cbf3a58e` |
| 29 | `assets/stories/daniel_lions/coloring/scene_10.png` | `daniel_lions` | 10 | 1.386.529 | 1122x1402 | `d76da84b204277a449d382fb63992b7d567804689516d04564f25bac3f221d31` |
| 30 | `assets/stories/david_goliath/coloring/scene_01.png` | `david_goliath` | 1 | 1.262.019 | 1122x1402 | `8daa7c534b1c375d27a8264bc23ef0ca33cd983f3bcd265104af202991e047e7` |
| 31 | `assets/stories/david_goliath/coloring/scene_02.png` | `david_goliath` | 2 | 1.179.925 | 1122x1402 | `272bbb06325fbc323477682b2f345350d83f14dd0d13753a337cbe3b11f5518a` |
| 32 | `assets/stories/david_goliath/coloring/scene_03.png` | `david_goliath` | 3 | 1.347.423 | 1122x1402 | `34afdbc0ae9f20233aa98570ea88dadb08566c8764c91074162a6af22a0e6b48` |
| 33 | `assets/stories/david_goliath/coloring/scene_04.png` | `david_goliath` | 4 | 1.241.559 | 1122x1402 | `0876c72a81c8dc2bf9baa9955aa6504062d72fa926f31a31b5d35dc5b9cefa85` |
| 34 | `assets/stories/david_goliath/coloring/scene_05.png` | `david_goliath` | 5 | 1.369.603 | 1122x1402 | `74e9941b91ea736f5dafd13829b3ca9de0c379ae12bef4858e046e8c7cdd9ee4` |
| 35 | `assets/stories/david_goliath/coloring/scene_06.png` | `david_goliath` | 6 | 1.246.897 | 1122x1402 | `e1caaef548922720184b71a86b152a4abe51cc8c016ed628bf13f80c4835dca8` |
| 36 | `assets/stories/david_goliath/coloring/scene_07.png` | `david_goliath` | 7 | 1.179.264 | 1122x1402 | `7e3692d838f67c462f95d4956d12005f776f4516e47550205122fe21baeba931` |
| 37 | `assets/stories/david_goliath/coloring/scene_08.png` | `david_goliath` | 8 | 1.204.101 | 1122x1402 | `e93c63d31479477b0cefcc274eddd7ff662ef9ffd8ba7b721d8675d050418f0d` |
| 38 | `assets/stories/david_goliath/coloring/scene_09.png` | `david_goliath` | 9 | 1.157.535 | 1122x1402 | `82f121b9d00ffdbc0e4d8e115b18c20959333d440fc5e0843a0a0319354ddaa3` |
| 39 | `assets/stories/david_goliath/coloring/scene_10.png` | `david_goliath` | 10 | 1.440.128 | 1122x1402 | `96373c10b0f0530e2815d75e2cfcae4dae590ec4ce1500c0923a24a26d070b9e` |
| 40 | `assets/stories/esther_queen/coloring/scene_01.png` | `esther_queen` | 1 | 1.449.169 | 1122x1402 | `06a8b78d664173b80d44930413c880b64cf19b025600965115489ca2347ef46e` |
| 41 | `assets/stories/esther_queen/coloring/scene_02.png` | `esther_queen` | 2 | 1.286.303 | 1122x1402 | `0f82119a39c741adf22931e7e6ee6ad4bcfa6d3fc8efab2e0cc6d2021e177879` |
| 42 | `assets/stories/esther_queen/coloring/scene_03.png` | `esther_queen` | 3 | 1.562.496 | 1122x1402 | `e5ecb029cd12b2dda8b0a21ab27dfc43e8c0ec0840d9d874b8ef15994e425ed5` |
| 43 | `assets/stories/esther_queen/coloring/scene_04.png` | `esther_queen` | 4 | 1.445.679 | 1122x1402 | `f9385f0d9ea824a8b9dd27be11c3a90e72aa0b5545c14c8635a8f34fcbe42b47` |
| 44 | `assets/stories/esther_queen/coloring/scene_05.png` | `esther_queen` | 5 | 1.297.488 | 1122x1402 | `3b9ba2c1c87d38b3b5cf237f793a8049b6cd47aa9c086bfcc0defd1ba7257649` |
| 45 | `assets/stories/esther_queen/coloring/scene_06.png` | `esther_queen` | 6 | 1.563.326 | 1122x1402 | `00e3629af55028062f26fc8fcb2929e77f10573d9ef206f4235ae92e1292bfe6` |
| 46 | `assets/stories/esther_queen/coloring/scene_07.png` | `esther_queen` | 7 | 1.667.545 | 1122x1402 | `7fc5a98bdb5c51b2d67c11753a8f33a90bc04b66003fc91b5350be5695500f98` |
| 47 | `assets/stories/esther_queen/coloring/scene_08.png` | `esther_queen` | 8 | 1.384.883 | 1122x1402 | `7f02aa18099134cb53131c621efffd3e99862dfc78df8014a8ce98e7dd39c358` |
| 48 | `assets/stories/esther_queen/coloring/scene_09.png` | `esther_queen` | 9 | 1.268.857 | 1122x1402 | `3ac21cbf416cdbe07ceb94d0b8ccc07ef4fa5b0a90d024669035de975e089bcd` |
| 49 | `assets/stories/esther_queen/coloring/scene_10.png` | `esther_queen` | 10 | 1.556.053 | 1122x1402 | `27772b6655eaecfffbbbd05f32d1ee3de4d9ff259c2c405465ff470bce5b900b` |
| 50 | `assets/stories/good_samaritan/coloring/scene_01.png` | `good_samaritan` | 1 | 1.329.668 | 1122x1402 | `a399656ee866e4fe4643c0d53f18a23c0b617003649a2b1b71f42c0f078dd451` |
| 51 | `assets/stories/good_samaritan/coloring/scene_02.png` | `good_samaritan` | 2 | 1.591.411 | 1122x1402 | `fa90ff83793cb44368f43a9eda82217f23e261bc7394653536f7200b9bd0f6c0` |
| 52 | `assets/stories/good_samaritan/coloring/scene_03.png` | `good_samaritan` | 3 | 1.404.654 | 1122x1402 | `83140e55521e316c03fe8263e479a20abdafd4042eba565373bc5a89d5928b74` |
| 53 | `assets/stories/good_samaritan/coloring/scene_04.png` | `good_samaritan` | 4 | 1.494.882 | 1122x1402 | `c091cd4518a3471a3e95e612f13b23de5cecb48c17215595927c11b580bebc9a` |
| 54 | `assets/stories/good_samaritan/coloring/scene_05.png` | `good_samaritan` | 5 | 1.527.120 | 1122x1402 | `038738384229a34e91c78154db0a2d118422695de5966fc0ee377551b5134cbc` |
| 55 | `assets/stories/good_samaritan/coloring/scene_06.png` | `good_samaritan` | 6 | 1.514.384 | 1122x1402 | `da76cfcfae8229f2408c2ad127db98d50f9918641b2fa646a44a5d3ac326f815` |
| 56 | `assets/stories/good_samaritan/coloring/scene_07.png` | `good_samaritan` | 7 | 1.446.547 | 1122x1402 | `837bccedbe6d0064443e12521808a07326dacd458cd6c5780663befd2f5a8044` |
| 57 | `assets/stories/good_samaritan/coloring/scene_08.png` | `good_samaritan` | 8 | 1.326.237 | 1122x1402 | `795c5e61fe9beb2efdc1c4a236a1e85daec8ee467ceb6eeeeeeb0ba391327840` |
| 58 | `assets/stories/good_samaritan/coloring/scene_09.png` | `good_samaritan` | 9 | 1.542.986 | 1122x1402 | `1ff2334540731921fbd098e281ac4f77111f0ee2ccaa73d24e9ae34315365a28` |
| 59 | `assets/stories/good_samaritan/coloring/scene_10.png` | `good_samaritan` | 10 | 1.550.381 | 1122x1402 | `ea23d8925f720f76bd861e3780c59129fa8c48c3919072971c24304775ad9587` |
| 60 | `assets/stories/jesus_children/coloring/scene_01.png` | `jesus_children` | 1 | 1.494.380 | 1122x1402 | `354c301ca34473f536bde823e82e9ad8e868602d182a3338d5f4e236435a9474` |
| 61 | `assets/stories/jesus_children/coloring/scene_02.png` | `jesus_children` | 2 | 1.361.787 | 1122x1402 | `5e558a8574bffe049f13da42d9c5e6eeb66888c2ab05ce2092ed3e3ca88da5b6` |
| 62 | `assets/stories/jesus_children/coloring/scene_03.png` | `jesus_children` | 3 | 1.410.358 | 1122x1402 | `b48566d418e69ab78fc8ae508e1fb45ca65062da6469573bf3f0ec563a8595a9` |
| 63 | `assets/stories/jesus_children/coloring/scene_04.png` | `jesus_children` | 4 | 1.366.826 | 1122x1402 | `ce475665e0c3d88be5c9b907226a8a9d1b4127eda207831f18e4494172a61897` |
| 64 | `assets/stories/jesus_children/coloring/scene_05.png` | `jesus_children` | 5 | 1.526.647 | 1122x1402 | `a100b5534d04e220188512b1d263a743f449f30c00a77e971006f21ac38ec48c` |
| 65 | `assets/stories/jesus_children/coloring/scene_06.png` | `jesus_children` | 6 | 1.364.577 | 1122x1402 | `53a6126dacd2b78c30199df61f3514da21bfad0d56fecb31c1c28dabdb1f0d73` |
| 66 | `assets/stories/jesus_children/coloring/scene_07.png` | `jesus_children` | 7 | 1.507.492 | 1122x1402 | `df474b22c44d369f226fcd33ed100dee3631b15b1299b4ffcb7c6add2cf06055` |
| 67 | `assets/stories/jesus_children/coloring/scene_08.png` | `jesus_children` | 8 | 1.536.903 | 1122x1402 | `04d5fd0b6ccaf4091eb2fac99b6788b49ee5a527e896388a1525103aa4ec0264` |
| 68 | `assets/stories/jesus_children/coloring/scene_09.png` | `jesus_children` | 9 | 1.561.969 | 1122x1402 | `83b2fe905415a243bd540f51353c6aaecde5b166d74dea21be9b37fa2f728b37` |
| 69 | `assets/stories/jesus_children/coloring/scene_10.png` | `jesus_children` | 10 | 1.647.128 | 1122x1402 | `33c189bc3bea6da79df98496800261bf90b0ea3884a28a9b9db0b91378b4bb78` |
| 70 | `assets/stories/jesus_temple/coloring/scene_01.png` | `jesus_temple` | 1 | 1.433.205 | 1122x1402 | `38144729db87d7f66e33a19d233020847d13753b3a91b140ace4a08545cf019f` |
| 71 | `assets/stories/jesus_temple/coloring/scene_02.png` | `jesus_temple` | 2 | 1.491.886 | 1122x1402 | `80f107f468d7d02ba2f410543d05dda8781f20d74acda17cc74bfed77f582371` |
| 72 | `assets/stories/jesus_temple/coloring/scene_03.png` | `jesus_temple` | 3 | 1.389.366 | 1122x1402 | `ea0b2ae3948cddbdc4df3c5673214d2d6e0768444445469e1b0daee4f5568f3a` |
| 73 | `assets/stories/jesus_temple/coloring/scene_04.png` | `jesus_temple` | 4 | 1.416.987 | 1122x1402 | `a43767f5dc46a6f48da0a8c5efb7bd8ed2f7b541b98e0c09c98775940b0b08ab` |
| 74 | `assets/stories/jesus_temple/coloring/scene_05.png` | `jesus_temple` | 5 | 1.374.033 | 1122x1402 | `544b212c6e1847aca86be3b9904aa2e375f977cf4d89466abb51528aebef84f9` |
| 75 | `assets/stories/jesus_temple/coloring/scene_06.png` | `jesus_temple` | 6 | 1.627.242 | 1122x1402 | `ea8c9928e104e20c0df593182b4c927b87ba4fd7353d308687cd6f4251b65861` |
| 76 | `assets/stories/jesus_temple/coloring/scene_07.png` | `jesus_temple` | 7 | 1.400.367 | 1122x1402 | `bc7ad6f065afcc6c8406479a2f2e5ce280774a5489e9ee0a387cce13d4c0a9c4` |
| 77 | `assets/stories/jesus_temple/coloring/scene_08.png` | `jesus_temple` | 8 | 1.401.335 | 1122x1402 | `5103307408000c0b83cf30a45a67b355aaa41570bed64098f59c01405ba2236e` |
| 78 | `assets/stories/jesus_temple/coloring/scene_09.png` | `jesus_temple` | 9 | 1.658.606 | 1122x1402 | `793d4f13d51fc962f5d4e26c42ecae58d7c8be11433c350e9abaa9ffb2937f52` |
| 79 | `assets/stories/jesus_temple/coloring/scene_10.png` | `jesus_temple` | 10 | 1.406.140 | 1122x1402 | `440c447ca29016a89d7ffa150545c49fa1d87ce14946459a57390398f1f3d54e` |
| 80 | `assets/stories/jonah_big_fish/coloring/scene_01.png` | `jonah_big_fish` | 1 | 1.193.624 | 1122x1402 | `c838143e52cfd0ddc9baa8f7efe32ede8384c1fd556b40ccd2b302a8e6130820` |
| 81 | `assets/stories/jonah_big_fish/coloring/scene_02.png` | `jonah_big_fish` | 2 | 1.327.985 | 1122x1402 | `5712994ef107522d774d33314acd40cb4ed682b450bf5db073f41fd291e00aeb` |
| 82 | `assets/stories/jonah_big_fish/coloring/scene_03.png` | `jonah_big_fish` | 3 | 1.377.108 | 1122x1402 | `1ed1c694a5c6665666abbe22ab1a19bd52b5ba2e7fb8368922321f8f3f99bedc` |
| 83 | `assets/stories/jonah_big_fish/coloring/scene_04.png` | `jonah_big_fish` | 4 | 1.485.086 | 1122x1402 | `01f190433b0ab90efb3587a45b2ad2a7a89c80d3bb7a0e251a5a0ced346527fd` |
| 84 | `assets/stories/jonah_big_fish/coloring/scene_05.png` | `jonah_big_fish` | 5 | 1.346.916 | 1122x1402 | `098db1d13424512e6b1a605fd39f1af9240f2b372adbb31f41c15496cef4db91` |
| 85 | `assets/stories/jonah_big_fish/coloring/scene_06.png` | `jonah_big_fish` | 6 | 1.158.821 | 1122x1402 | `7e589402b9176164d2179bbb61c9268e2ee8b8580caa70a225e3bdd8e87ece2d` |
| 86 | `assets/stories/jonah_big_fish/coloring/scene_07.png` | `jonah_big_fish` | 7 | 1.161.096 | 1122x1402 | `e364ed30b06710dc79c6424fbc1185d53cdfbd3d3b9edff46a5196e9bba35eef` |
| 87 | `assets/stories/jonah_big_fish/coloring/scene_08.png` | `jonah_big_fish` | 8 | 1.169.180 | 1122x1402 | `cb145c1afaa192d44ea28e9d47d9632d22ebf04cfd213cc136b05dff7eed6f7f` |
| 88 | `assets/stories/jonah_big_fish/coloring/scene_09.png` | `jonah_big_fish` | 9 | 1.330.546 | 1122x1402 | `faa382126b719f2945807f4ab68be40252e7e7fb94e208df9d05186826def0cc` |
| 89 | `assets/stories/jonah_big_fish/coloring/scene_10.png` | `jonah_big_fish` | 10 | 1.363.553 | 1122x1402 | `f364b3873662580c44926e2d30d1610efcd1cb12ca2937ddf2194b073aa798a1` |
| 90 | `assets/stories/joseph_colorful_coat/coloring/scene_01.png` | `joseph_colorful_coat` | 1 | 1.538.962 | 1122x1402 | `17f692053055fb4f1d98c8588a3ddc53606907b4cf5d42dca308ab4130081677` |
| 91 | `assets/stories/joseph_colorful_coat/coloring/scene_02.png` | `joseph_colorful_coat` | 2 | 1.764.622 | 1122x1402 | `063a25ef7f015551186c388102a689dbea69d6082168b612a4f7936ab03336ba` |
| 92 | `assets/stories/joseph_colorful_coat/coloring/scene_03.png` | `joseph_colorful_coat` | 3 | 1.566.329 | 1122x1402 | `bf1ee65f4854efac0b37afd12293a280d0204a08fa5f5c3cde4c322e0d00ec9c` |
| 93 | `assets/stories/joseph_colorful_coat/coloring/scene_04.png` | `joseph_colorful_coat` | 4 | 1.454.761 | 1122x1402 | `0829107ef98d65e61957d02e9659ba7d5e27f16edb42cb0e94754f752003a6db` |
| 94 | `assets/stories/joseph_colorful_coat/coloring/scene_05.png` | `joseph_colorful_coat` | 5 | 1.693.542 | 1122x1402 | `fc0b323c984c7d4645b67cbd8eca99597ee59ab8f1f6c0acabdd5a70cfa380c8` |
| 95 | `assets/stories/joseph_colorful_coat/coloring/scene_06.png` | `joseph_colorful_coat` | 6 | 1.570.450 | 1122x1402 | `7a26028dc16728a76b7afc33690d7ad59664460931a2b6dc68c8c3d48d3542c6` |
| 96 | `assets/stories/joseph_colorful_coat/coloring/scene_07.png` | `joseph_colorful_coat` | 7 | 1.384.635 | 1122x1402 | `70526d9b4224c7a12b13aa47df1addf3a19f1006d03bc34bfc673c8aac6de20e` |
| 97 | `assets/stories/joseph_colorful_coat/coloring/scene_08.png` | `joseph_colorful_coat` | 8 | 1.464.931 | 1122x1402 | `699888f936bfc5dba5c35026a5101163a9285ab8a83c2f6bcc8a64fac570fc75` |
| 98 | `assets/stories/joseph_colorful_coat/coloring/scene_09.png` | `joseph_colorful_coat` | 9 | 1.712.046 | 1122x1402 | `85d059b38a39043c04ae5def1513ff9c4207cb623e3dfdfac01926097475938c` |
| 99 | `assets/stories/joseph_colorful_coat/coloring/scene_10.png` | `joseph_colorful_coat` | 10 | 1.879.809 | 1122x1402 | `c7e560ece973dccd8ad0c19ac1e54f2badd0ea53e300476d0541ee26f87da000` |
| 100 | `assets/stories/josiah_young_king/coloring/scene_01.png` | `josiah_young_king` | 1 | 1.415.443 | 1122x1402 | `8836f18ce4a9308f8c1fe3da3c619c2afb0258df9b708c14fd4c31e1aa634aeb` |
| 101 | `assets/stories/josiah_young_king/coloring/scene_02.png` | `josiah_young_king` | 2 | 1.388.383 | 1122x1402 | `fce19a927376362e41982d683b84acc0619a8e89e671ba0e4925345cef253afb` |
| 102 | `assets/stories/josiah_young_king/coloring/scene_03.png` | `josiah_young_king` | 3 | 1.317.446 | 1122x1402 | `dd1296352072de937e9b2517371a585f689e41434f158366974e78a213aa56ce` |
| 103 | `assets/stories/josiah_young_king/coloring/scene_04.png` | `josiah_young_king` | 4 | 1.391.541 | 1122x1402 | `7070fa6aad91a0adb8ef936dcc0e784d17b8f181f2dbe8f1e07e6d435bdb9c1c` |
| 104 | `assets/stories/josiah_young_king/coloring/scene_05.png` | `josiah_young_king` | 5 | 1.234.490 | 1122x1402 | `fc80fab5f9a8277feb5bbf93778c6507ecd7cbe2a05936a640a8bcd7183e9cb6` |
| 105 | `assets/stories/josiah_young_king/coloring/scene_06.png` | `josiah_young_king` | 6 | 1.649.259 | 1122x1402 | `3228ef8e436b70654e692a5e747590470a85234765c833c9e7bd2d59ee411d9b` |
| 106 | `assets/stories/josiah_young_king/coloring/scene_07.png` | `josiah_young_king` | 7 | 1.526.234 | 1086x1448 | `cebddc6660fe3294d577cee5365dd19b2545d5e223ff5dd88d40161119fc3fa7` |
| 107 | `assets/stories/josiah_young_king/coloring/scene_08.png` | `josiah_young_king` | 8 | 1.631.566 | 1122x1402 | `efa8d22700bdb175ffbbc4fc9c59e77c4b7fed425cf83b4858be5ac53cb45bfe` |
| 108 | `assets/stories/josiah_young_king/coloring/scene_09.png` | `josiah_young_king` | 9 | 1.497.130 | 1122x1402 | `cce2b3d66dac64a40fcd06fb5bc51d89e971b123e07753e354b8314a80f2c1e6` |
| 109 | `assets/stories/josiah_young_king/coloring/scene_10.png` | `josiah_young_king` | 10 | 1.320.696 | 1086x1448 | `aebcef32b63c4e91ecaa6a1efa58b7717e9329c28024297eb4fa286e43a593ae` |
| 110 | `assets/stories/lost_sheep/coloring/scene_01.png` | `lost_sheep` | 1 | 1.440.525 | 1122x1402 | `5f60bb59c086aa3d6eed493fe1f9c1f4886bb4475e778f137bcf2c97eb25f103` |
| 111 | `assets/stories/lost_sheep/coloring/scene_02.png` | `lost_sheep` | 2 | 1.360.105 | 1122x1402 | `322f4c2c526a232af9f8cecf2cfc865a81f0a947efc685bf5b4c28fbf2c34482` |
| 112 | `assets/stories/lost_sheep/coloring/scene_03.png` | `lost_sheep` | 3 | 1.389.821 | 1122x1402 | `8668a78bc0443fe4d93ee1754f4375fc09d7b098d72c69b84a9224b31c343d7f` |
| 113 | `assets/stories/lost_sheep/coloring/scene_04.png` | `lost_sheep` | 4 | 1.370.648 | 1122x1402 | `bd9e1927bd667c62295a6d4717de8c2143cefa0873654aaeeffe98a615049ac1` |
| 114 | `assets/stories/lost_sheep/coloring/scene_05.png` | `lost_sheep` | 5 | 1.134.134 | 1122x1402 | `15aea8fa411782c37085af35cd45370812cddb6801623dc32364f030f8e9ea2c` |
| 115 | `assets/stories/lost_sheep/coloring/scene_06.png` | `lost_sheep` | 6 | 1.387.888 | 1122x1402 | `9d4971f798a65f41369efc4da497286bb689fd6949ee042f8e7229e010fd4178` |
| 116 | `assets/stories/lost_sheep/coloring/scene_07.png` | `lost_sheep` | 7 | 1.324.321 | 1122x1402 | `5216bc7735d75eaa5917bec0e7d11980d3687792b99d36499491a1f757fb3299` |
| 117 | `assets/stories/lost_sheep/coloring/scene_08.png` | `lost_sheep` | 8 | 1.332.989 | 1122x1402 | `844806d9344f952593381d7c7a21ac6e55fa742520e4aec4fa59182a4408fceb` |
| 118 | `assets/stories/lost_sheep/coloring/scene_09.png` | `lost_sheep` | 9 | 1.707.817 | 1122x1402 | `99e7b2e8f95d47883aa08f0ac44dfb4ce6ce381c264592b489cb04c48684ec75` |
| 119 | `assets/stories/lost_sheep/coloring/scene_10.png` | `lost_sheep` | 10 | 1.527.294 | 1122x1402 | `18838b5d661728bb55e59b1eca03517e2637efd1b0ef792f32fae7fc3a7493c9` |
| 120 | `assets/stories/mary_says_yes/coloring/scene_01.png` | `mary_says_yes` | 1 | 1.370.784 | 1122x1402 | `952e8762f0ca194befd0ea3bed772717e51947bdc4d7c6d38291740c8e098ea0` |
| 121 | `assets/stories/mary_says_yes/coloring/scene_02.png` | `mary_says_yes` | 2 | 1.415.922 | 1122x1402 | `82dda9bbf39cd5751956b1f955ba22b15496bf9ec07ae609d27a47140a53cdf7` |
| 122 | `assets/stories/mary_says_yes/coloring/scene_03.png` | `mary_says_yes` | 3 | 1.642.732 | 1122x1402 | `99101a47397161fec9002173580884a96a03c52400724895fe7793462cec3682` |
| 123 | `assets/stories/mary_says_yes/coloring/scene_04.png` | `mary_says_yes` | 4 | 1.505.206 | 1122x1402 | `f1dedbe1000eff2a78de8109940195edaa4397917d3b2c1cf053936b4c17517a` |
| 124 | `assets/stories/mary_says_yes/coloring/scene_05.png` | `mary_says_yes` | 5 | 1.611.328 | 1122x1402 | `0823939f85d6fb8c44a8dd70ed47da4a48bcbbc46c73c1fc1439f49bd976a091` |
| 125 | `assets/stories/mary_says_yes/coloring/scene_06.png` | `mary_says_yes` | 6 | 1.559.249 | 1122x1402 | `fe38b4d1298485d60ac7fe51353f0b1ad042c1a89e71564947b6c98f6bba3b9d` |
| 126 | `assets/stories/mary_says_yes/coloring/scene_07.png` | `mary_says_yes` | 7 | 1.578.467 | 1122x1402 | `05c303f26bb41867d0711c6935b255f080d5548560f3924f459635b6bd0b6054` |
| 127 | `assets/stories/mary_says_yes/coloring/scene_08.png` | `mary_says_yes` | 8 | 1.735.816 | 1122x1402 | `169661e0a268f7055250103b5798e97aab1cbae8548aa13c245362b0db14bbca` |
| 128 | `assets/stories/mary_says_yes/coloring/scene_09.png` | `mary_says_yes` | 9 | 1.722.491 | 1122x1402 | `91aea50859376641e5c7f639c01b433b84ab0ea7464432415824bb54060f9cb1` |
| 129 | `assets/stories/mary_says_yes/coloring/scene_10.png` | `mary_says_yes` | 10 | 1.270.380 | 1122x1402 | `6c39e3518862986b5a31d02cb648e71af5ddf0fab11f5f93a75f602daeb6f107` |
| 130 | `assets/stories/miraculous_catch/coloring/scene_01.png` | `miraculous_catch` | 1 | 1.447.484 | 1122x1402 | `c29efe30a28e11342f02439f3851660d03c605c6ddb5ee64ed0743b97bf08db4` |
| 131 | `assets/stories/miraculous_catch/coloring/scene_02.png` | `miraculous_catch` | 2 | 1.416.238 | 1122x1402 | `93c047b7644dbe3da62c54ba98c47b4d4ed822e3ee9ded5af321a4207109d193` |
| 132 | `assets/stories/miraculous_catch/coloring/scene_03.png` | `miraculous_catch` | 3 | 1.456.723 | 1122x1402 | `5cb51a747bf53329c29a39bcd17ea74091df25eb169a6758bf4b372f662bf74b` |
| 133 | `assets/stories/miraculous_catch/coloring/scene_04.png` | `miraculous_catch` | 4 | 1.286.264 | 1122x1402 | `98fdfa89ea96265b231695f50978a337495127b2b44089c8af870f9bec48c300` |
| 134 | `assets/stories/miraculous_catch/coloring/scene_05.png` | `miraculous_catch` | 5 | 1.168.209 | 1122x1402 | `98b7d66d25f46b7ffd2cd9a5c0c97519b153a2a2db39b5fce11ad856845499ba` |
| 135 | `assets/stories/miraculous_catch/coloring/scene_06.png` | `miraculous_catch` | 6 | 1.439.781 | 1122x1402 | `c4b6b84e15a03dd330b441131e531bf5232199a09195dd5abc47436b2ab23c01` |
| 136 | `assets/stories/miraculous_catch/coloring/scene_07.png` | `miraculous_catch` | 7 | 1.466.739 | 1122x1402 | `5bd4a47204021b359eea291f8c16fa038cf580ce846ed86df0d4bce9a7dd9c66` |
| 137 | `assets/stories/miraculous_catch/coloring/scene_08.png` | `miraculous_catch` | 8 | 1.715.488 | 1122x1402 | `1d89c96be0a369e3b2339cac09334128c87cee2d7412293651981370debf83b2` |
| 138 | `assets/stories/miraculous_catch/coloring/scene_09.png` | `miraculous_catch` | 9 | 1.318.220 | 1122x1402 | `a6743250c9e63bd81e9a2bc304981ed77fdae984662f812883f0482361a94f2d` |
| 139 | `assets/stories/miraculous_catch/coloring/scene_10.png` | `miraculous_catch` | 10 | 1.362.260 | 1122x1402 | `0d3b16cef9eb4d00ee1eaddf7510b55b0ddcfbf9845542978828a81035514b14` |
| 140 | `assets/stories/moses_red_sea/coloring/scene_01.png` | `moses_red_sea` | 1 | 1.532.232 | 1122x1402 | `16c59adc3b423a9fb63d40a4eca7799bb73326a8b8dde4ba10cbf006eec0e24a` |
| 141 | `assets/stories/moses_red_sea/coloring/scene_02.png` | `moses_red_sea` | 2 | 1.592.492 | 1122x1402 | `2afc21c28624d26b3fde14cb7072c18e76f7f514302f895a52ce2c38442325c9` |
| 142 | `assets/stories/moses_red_sea/coloring/scene_03.png` | `moses_red_sea` | 3 | 1.360.760 | 1122x1402 | `58a8cc628a81032892c862c7c27d7e63be93b9da73ee579a908133304bafc2a9` |
| 143 | `assets/stories/moses_red_sea/coloring/scene_04.png` | `moses_red_sea` | 4 | 1.583.753 | 1122x1402 | `76ab2b9bc66fb300776aecd9da3a3f49191dba188c92a44b9d1444525dbd24ef` |
| 144 | `assets/stories/moses_red_sea/coloring/scene_05.png` | `moses_red_sea` | 5 | 1.440.891 | 1122x1402 | `fff9d961daede28e63ecdd4d5278b2a38398109bd7bf8c6ebfcc86a38932eaf7` |
| 145 | `assets/stories/moses_red_sea/coloring/scene_06.png` | `moses_red_sea` | 6 | 1.619.676 | 1122x1402 | `0d78a62e0f79da7d3af4af6cfcb868f659b9e0943e7d5b5d33ebd829c1e402e7` |
| 146 | `assets/stories/moses_red_sea/coloring/scene_07.png` | `moses_red_sea` | 7 | 1.679.293 | 1122x1402 | `900e2e29c5027a7fccf34b7bd8beb2ce4afb193e06b17ddd91a67428bf84c5ba` |
| 147 | `assets/stories/moses_red_sea/coloring/scene_08.png` | `moses_red_sea` | 8 | 1.625.999 | 1122x1402 | `f24c02ef4e0cb4c305a1bbf3f6da79bbb3288237e3734eac057ae7a5ba68463f` |
| 148 | `assets/stories/moses_red_sea/coloring/scene_09.png` | `moses_red_sea` | 9 | 1.522.127 | 1122x1402 | `8948678e616a035739b7e7ef1a932ffa8de67f975bc1a1829f358013b4546f6b` |
| 149 | `assets/stories/moses_red_sea/coloring/scene_10.png` | `moses_red_sea` | 10 | 1.545.979 | 1122x1402 | `4dfa40723a2450d3f1d2a1367532da5dd03e57a2d0b0df6e226a19979e4b2e3f` |
| 150 | `assets/stories/noah/coloring/scene_01.png` | `noah` | 1 | 1.492.030 | 1122x1402 | `4248a452ba4d955afc4fae410576e571909368a83c81d47f6701dc0f4975f663` |
| 151 | `assets/stories/noah/coloring/scene_02.png` | `noah` | 2 | 1.306.295 | 1122x1402 | `a9a1d33e77eacc0bd437342fc88e79487bd1f2aa5a2867d7792207c18f22c8e4` |
| 152 | `assets/stories/noah/coloring/scene_03.png` | `noah` | 3 | 1.354.220 | 1122x1402 | `f4d339bc37a487ee2f8005b53ec77797bc989110e3d2607878ef2bf221817402` |
| 153 | `assets/stories/noah/coloring/scene_04.png` | `noah` | 4 | 1.537.039 | 1122x1402 | `ccab8709820532f7f4ed187a2239a9c1a22870e2765e905cc01e313fedc924ac` |
| 154 | `assets/stories/noah/coloring/scene_05.png` | `noah` | 5 | 1.377.923 | 1122x1402 | `9f83fdc37ca553621126cdc7a389c7ce6dff2df6bc2bcee85478cada58306535` |
| 155 | `assets/stories/noah/coloring/scene_06.png` | `noah` | 6 | 1.108.561 | 1122x1402 | `fb36d842587cfdd4736abfc9752125cfb0643753f19dd9ce4f7b241ba8dba755` |
| 156 | `assets/stories/noah/coloring/scene_07.png` | `noah` | 7 | 1.229.022 | 1122x1402 | `6ba35ae7b44c09d16fd3a68435ac07e4996f392519ca5ccc09cdf9bf1677b391` |
| 157 | `assets/stories/noah/coloring/scene_08.png` | `noah` | 8 | 1.190.663 | 1122x1402 | `b44fbed3ddfd04baa7a423d6222a8277d3018994dafd1311d2fb248867e8f306` |
| 158 | `assets/stories/noah/coloring/scene_09.png` | `noah` | 9 | 1.445.731 | 1122x1402 | `4079e00b2d8775a12d3f0d1833bf8656dcbc242941469669645273c411447fe3` |
| 159 | `assets/stories/noah/coloring/scene_10.png` | `noah` | 10 | 1.451.156 | 1122x1402 | `b1415fc63974235c325d1965accdb26159353d589b6657d221b798d21282a43b` |
| 160 | `assets/stories/ruth_naomi/coloring/scene_01.png` | `ruth_naomi` | 1 | 1.631.440 | 1122x1402 | `2261b23eb88549ef2275195b155419241b4ca23c213f40cfac1c4bad6e04f454` |
| 161 | `assets/stories/ruth_naomi/coloring/scene_02.png` | `ruth_naomi` | 2 | 1.289.739 | 1122x1402 | `86e3f4d8b90ab198ab81265896fecb0caca6b7281d39a84bc2aaa8ea4a2f1667` |
| 162 | `assets/stories/ruth_naomi/coloring/scene_03.png` | `ruth_naomi` | 3 | 1.306.485 | 1122x1402 | `88428e6c56004cdb7a7883f3829d7ede8554fd9053f53d35d808d5ffe68966d8` |
| 163 | `assets/stories/ruth_naomi/coloring/scene_04.png` | `ruth_naomi` | 4 | 1.252.449 | 1122x1402 | `d07eac2c792baeb98b633d64dd137dac055166126cffc63ee9a0509b99080e63` |
| 164 | `assets/stories/ruth_naomi/coloring/scene_05.png` | `ruth_naomi` | 5 | 1.344.384 | 1122x1402 | `85a86cba2f6c77ddcffbce967a21554d0481a6e71cd525163cf6bd98f0d397fa` |
| 165 | `assets/stories/ruth_naomi/coloring/scene_06.png` | `ruth_naomi` | 6 | 1.766.702 | 1122x1402 | `b44490983002bf2d41b5599e3e119fef56b4e31f64648d29e31a6a182f79c80f` |
| 166 | `assets/stories/ruth_naomi/coloring/scene_07.png` | `ruth_naomi` | 7 | 1.561.153 | 1122x1402 | `59ae5a377f8bd484c5666db65f2a5110a54d7b39cb2e51b5317541b3d62fbcd7` |
| 167 | `assets/stories/ruth_naomi/coloring/scene_08.png` | `ruth_naomi` | 8 | 1.393.114 | 1122x1402 | `724f8fadfe9384d6baeefbfa272e0e4be591760bab001b42924fed5a40dceb7e` |
| 168 | `assets/stories/ruth_naomi/coloring/scene_09.png` | `ruth_naomi` | 9 | 1.567.185 | 1122x1402 | `9a797525bdc80b81fd1287452a84bb70ffa5d45561e816c39b9207f61467cbdb` |
| 169 | `assets/stories/ruth_naomi/coloring/scene_10.png` | `ruth_naomi` | 10 | 1.442.675 | 1122x1402 | `4f74c3002deee97b51a62f54e4376fc06565ceeaa235bd194d6e31ba59c18add` |
| 170 | `assets/stories/samuel_hears_god/coloring/scene_01.png` | `samuel_hears_god` | 1 | 1.183.725 | 1122x1402 | `57b17580cdfd6b489c87ff6a3f0ece793a927cc5eca38a579bcb94ad6138abae` |
| 171 | `assets/stories/samuel_hears_god/coloring/scene_02.png` | `samuel_hears_god` | 2 | 955.723 | 1122x1402 | `1c83c13d8d6b10d6c3b3dbf5625a500a6565f30e9f16fe31cf52370a77d1bd69` |
| 172 | `assets/stories/samuel_hears_god/coloring/scene_03.png` | `samuel_hears_god` | 3 | 984.342 | 1122x1402 | `0627ea93e3df7d965dece51b537f0eaaa049539224c60ca0f45d02b949e46617` |
| 173 | `assets/stories/samuel_hears_god/coloring/scene_04.png` | `samuel_hears_god` | 4 | 1.353.713 | 1122x1402 | `c3716074941f0f691582fd532d2befbd61cdfd1c6ecbc52143ceb319477d9f5c` |
| 174 | `assets/stories/samuel_hears_god/coloring/scene_05.png` | `samuel_hears_god` | 5 | 1.088.000 | 1122x1402 | `c872eb26b8a0bd0aee2eefc655c34b689252a6495d9a0cc8bf368039487f0aeb` |
| 175 | `assets/stories/samuel_hears_god/coloring/scene_06.png` | `samuel_hears_god` | 6 | 803.969 | 1122x1402 | `49192107aa12225c0a5c71f99be45d2a36a834a1677297bd3b37aa534b8e922f` |
| 176 | `assets/stories/samuel_hears_god/coloring/scene_07.png` | `samuel_hears_god` | 7 | 1.158.906 | 1122x1402 | `75628a099f929cf93cef24ebbfe73f1ca30ea49da74c9e060dfdcabbe7ada3ea` |
| 177 | `assets/stories/samuel_hears_god/coloring/scene_08.png` | `samuel_hears_god` | 8 | 989.797 | 1122x1402 | `4f8e9bef7cbd766d24d4842c29c80254d47dfedb17ee4cb7ae6e3280b99d45ee` |
| 178 | `assets/stories/samuel_hears_god/coloring/scene_09.png` | `samuel_hears_god` | 9 | 1.103.227 | 1122x1402 | `f2a55e8531456dd2d1546ae43fee84985304de6d8de5fd06714f71acfb5bab22` |
| 179 | `assets/stories/samuel_hears_god/coloring/scene_10.png` | `samuel_hears_god` | 10 | 1.414.381 | 1122x1402 | `8939d386f80e64b395f225cc6998c413897e7c1dbf9411fb732ddaca50349077` |
| 180 | `assets/stories/solomon_wisdom/coloring/scene_01.png` | `solomon_wisdom` | 1 | 1.534.094 | 1122x1402 | `e5290c527ff6fa3fb962063ebe129c3262223ff897255296d3b43e3a08d21808` |
| 181 | `assets/stories/solomon_wisdom/coloring/scene_02.png` | `solomon_wisdom` | 2 | 1.605.823 | 1122x1402 | `41ffa4717a359c8f6b9a07f6baec8ee7146ad0d4b9f177eb96137e105ed9b8d0` |
| 182 | `assets/stories/solomon_wisdom/coloring/scene_03.png` | `solomon_wisdom` | 3 | 1.631.158 | 1122x1402 | `4feee13b0a122a1269c3ec74b22fdae3f3d4b843fd862b32035d5ca0501fcd82` |
| 183 | `assets/stories/solomon_wisdom/coloring/scene_04.png` | `solomon_wisdom` | 4 | 1.409.851 | 1122x1402 | `424e95e606d2ab86b7c759375325fe2e0fef7fa57a3b931614a0e6d09daf3245` |
| 184 | `assets/stories/solomon_wisdom/coloring/scene_05.png` | `solomon_wisdom` | 5 | 1.555.050 | 1122x1402 | `b99b8a94d6b4c1d3322200afd1671872fb16625db6f21cb44c8e716293c4dd1a` |
| 185 | `assets/stories/solomon_wisdom/coloring/scene_06.png` | `solomon_wisdom` | 6 | 1.300.791 | 1122x1402 | `09019ca0af71bc0763eca120d8651b7e1eeaea96382db46a8c701c4119f48c74` |
| 186 | `assets/stories/solomon_wisdom/coloring/scene_07.png` | `solomon_wisdom` | 7 | 1.390.774 | 1122x1402 | `03bf4dfd5671264d76941a5534b82b33451f22ba7b2eb00b9a18485f502ac52e` |
| 187 | `assets/stories/solomon_wisdom/coloring/scene_08.png` | `solomon_wisdom` | 8 | 1.651.444 | 1122x1402 | `f035e7913eb1854c3db4ba1a62f8e6f9c3d73bcd9f6700753b8fa790aeb21cb0` |
| 188 | `assets/stories/solomon_wisdom/coloring/scene_09.png` | `solomon_wisdom` | 9 | 1.569.427 | 1122x1402 | `d762d144a8e9a361b2ff22b76bed7e310c13c42ca4f1f31422d596b94409ff0c` |
| 189 | `assets/stories/solomon_wisdom/coloring/scene_10.png` | `solomon_wisdom` | 10 | 1.533.791 | 1122x1402 | `17da6f8af292cdf29d9313ded40c0776e0e04df1b7d2c3440b973c0ef45d1da3` |
| 190 | `assets/stories/timothy_faith/coloring/scene_01.png` | `timothy_faith` | 1 | 1.468.345 | 1122x1402 | `89b3d0b756144f34bcd0bd8a31259819f0d8031f8540fedb59b2c341a0c93743` |
| 191 | `assets/stories/timothy_faith/coloring/scene_02.png` | `timothy_faith` | 2 | 1.688.686 | 1122x1402 | `3988f82865ebf92c2f787e147df6217dcbabec85b928956ee747c1fd65a58be3` |
| 192 | `assets/stories/timothy_faith/coloring/scene_03.png` | `timothy_faith` | 3 | 1.496.190 | 1122x1402 | `487049d0efc73f448335937ff4272e932b8c2905def053358b8b69cc7368d19f` |
| 193 | `assets/stories/timothy_faith/coloring/scene_04.png` | `timothy_faith` | 4 | 1.722.912 | 1122x1402 | `1370549949b8e2cc22c751f3d3195f59aeff49289b6fa9af19fc99678d721cfc` |
| 194 | `assets/stories/timothy_faith/coloring/scene_05.png` | `timothy_faith` | 5 | 1.260.637 | 1122x1402 | `087a4aead7c433e7ee40ec41efcf07414a9065b73b2d87b86dbd9b2a17c4d5c2` |
| 195 | `assets/stories/timothy_faith/coloring/scene_06.png` | `timothy_faith` | 6 | 1.393.320 | 1122x1402 | `0e3073e584f66accafc99623151470004e22c6abfcc9cb125c00dd945cb2707d` |
| 196 | `assets/stories/timothy_faith/coloring/scene_07.png` | `timothy_faith` | 7 | 1.372.126 | 1122x1402 | `03e5c8fd846720fcf026a76cd3885d5ae2053b5024d36ef4338ecc7aa0ac38ca` |
| 197 | `assets/stories/timothy_faith/coloring/scene_08.png` | `timothy_faith` | 8 | 1.378.679 | 1122x1402 | `66890a90df84e8149755b26b1651bd369e866f1338db0ccd170da4e3ed6d0ffe` |
| 198 | `assets/stories/timothy_faith/coloring/scene_09.png` | `timothy_faith` | 9 | 1.256.804 | 1122x1402 | `67d84d56f6fb4e659b0a29851022ae6d676fc52e76e49541ea6bb73a1c335869` |
| 199 | `assets/stories/timothy_faith/coloring/scene_10.png` | `timothy_faith` | 10 | 1.397.623 | 1122x1402 | `8089a2d5d69bfb9c990fe81f02d68cf561db27792da1ad3e209c771ea5c461d1` |

## 6. Como recuperar

```bash
# um arquivo
git checkout 7c12987 -- assets/stories/noah/coloring/scene_01.png

# todos os linearts aposentados de uma história
git checkout 7c12987 -- assets/stories/noah/coloring/

# conferir o conteúdo sem restaurar
git show 7c12987:assets/stories/noah/coloring/scene_01.png | sha256sum
```

---

## 7. Política de dados do usuário

Decisão do fundador, ratificada antes da exclusão: **nenhuma pintura é apagada**. A aposentadoria
retira o *contorno* (lineart) e a *tela* que o abria — nunca o que a criança pintou.

### 7.1 O que o P3J NÃO fez (proibições respeitadas)

| Proibição | Estado |
|---|---|
| `AsyncStorage.clear()` | não usado — nenhuma ocorrência introduzida |
| Exclusão por prefixo (`@ptf_drawing_*`) | não executada |
| Exclusão recursiva de diretórios do app | não executada |
| Remoção de dados do Colorir com o Beni | não executada |
| Limpeza de dados no aparelho | não executada |
| Limpeza automática de packs já instalados | não implementada |
| Migração de achatamento das pinturas legadas | não implementada |
| Namespace `@ptf_drawing_flat_*` | não criado |
| Bloco P3K de compatibilidade das pinturas de teste | não criado |
| Cópia dos PNGs para outro diretório do app | não executada |

### 7.2 Verificação em código

| Prova | Resultado |
|---|---|
| Linhas ADICIONADAS pelo P3J com API de exclusão (`clear`/`multiRemove`/`removeItem`/`deleteAsync`/`deleteBlob`) em `src/` e `scripts/` | **0** |
| Linhas REMOVIDAS com API de exclusão | 12 — todas em `ColoringScreen` (ramo legado), `NarrationScreen`, `StoryBookScreen` e `StoryDetailScreen`, isto é, **leitores/escritores da tela aposentada** |
| `src/services/drawingStorage.js` | íntegro (v1/v2/v3, leitura e escrita); diff do P3J = **7 linhas de comentário, 0 de código** |
| `src/services/storyColoringAvailability.js` (novo) | módulo puro — não importa AsyncStorage nem FileSystem |
| `hasSavedDrawing` | continua ligado a `achievementService.js` (reconhecimento legado de `first_drawing` e `artist_ark`) |

Remover *chamadas de exclusão* reduz — nunca aumenta — a chance de apagar dado do usuário.

### 7.3 Perda funcional de acesso (assumida, não minimizada)

As pinturas legadas de teste **continuam em disco** (AsyncStorage + `drawings/` no filesystem), mas
**não há mais como reabri-las**: sem lineart e sem a tela legada, o payload salvo não tem sobre o
que ser recomposto. Isso é **perda funcional de acesso**, não "ausência de perda". A decisão é
segura **agora**, antes da distribuição pública, porque as únicas pinturas existentes são de QA.
**Seria inadequada depois do lançamento** — registrado aqui para que a exceção não seja reutilizada
como precedente.

---

## 8. Packs já instalados — resíduo de QA (não bloqueante)

Packs premium baixados **antes** do P3J trazem os linearts dentro do diretório instalado. Eles
**não são apagados** e **não são lidos**: `resolveStoryMediaFromPackEntry` devolve envelope de erro
explícito para o kind `coloring`, e nenhuma tela pede esse kind.

**Evidência medida** (sandbox de QA da máquina de desenvolvimento):

| Pack instalado | Arquivos | Bytes | Só colorir | Bytes de colorir |
|---|---|---|---|---|
| `david_goliath@1.0.0` | 33 | 18.540.881 | 10 | 12.628.454 (**68,1%**) |

**Comportamento novo:** `REQUESTED_KINDS = ['cover', 'scene', 'audio']` — instalações futuras nunca
mais transferem lineart. `KNOWN_KINDS` (parser de manifesto) **continua** aceitando `coloring`, para
que manifestos já publicados sejam lidos sem erro (decisão ratificada nº 7).

**Classificação:** resíduo de QA, **não bloqueante**. Ocupa espaço apenas nos aparelhos de teste que
já baixaram packs antigos e desaparece sozinho com reinstalação do app ou com a próxima versão do
pack. **Nenhuma limpeza automática será implementada** — remover arquivos do aparelho exigiria
código de exclusão que este bloco decidiu não escrever.

---

*Gerado durante o P3J, antes da exclusão física. Governança: `docs/PROJECT_SOURCE_OF_TRUTH.md`,
`docs/DECISIONS.md`, `AGENTS.md`.*
