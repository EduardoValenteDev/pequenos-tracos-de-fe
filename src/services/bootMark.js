/**
 * bootMark.js — marca o t0 do boot JS (LP1M-A). Módulo de EFEITO COLATERAL, propositalmente mínimo.
 *
 * Por que existe: `import` em ES é hoisted — um `mark()` escrito no corpo de App.js só executaria
 * DEPOIS de todo o grafo de módulos importado por App.js (incluindo `AppNavigator`, que arrasta
 * 30+ telas com seus serviços). O t0 nasceria cego justamente para a fatia que precisamos medir.
 * Importando ESTE módulo como a 2ª linha de App.js — logo após `react-native-gesture-handler`,
 * que DEVE continuar sendo a primeira importação — o t0 é gravado antes da avaliação desse grafo.
 *
 * Só depende de `performanceTrace` (que não importa nada), então não arrasta nada consigo.
 *
 * Honestidade da baseline: mesmo assim, este NÃO é o início do processo. O que fica FORA da
 * medição: inicialização nativa, carga/parse do bundle e a avaliação de `react-native-gesture-handler`
 * e do próprio `performanceTrace`. A baseline é do boot JS do app A PARTIR daqui — nada anterior é
 * observável deste ponto, e nada anterior é inventado.
 */
import { mark } from './performanceTrace';

mark('app_render_start');

export default true;
