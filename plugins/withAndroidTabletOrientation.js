/**
 * withAndroidTabletOrientation — rota (C) de `F6-R1.1` (`TK-C-035` · `D1` caso 4).
 *
 * PROBLEMA. `@expo/config-plugins/build/android/Orientation.js:25` lê APENAS
 * `config.orientation` de topo e `:34` escreve UM `android:screenOrientation` na
 * `MainActivity`. Uma chave, global, sem variante por *idiom*. Logo `portrait` viola o
 * caso 4 de `D1` (tablet Android em retrato E paisagem) e `default` -> `unspecified`
 * liberaria também o telefone Android, violando o caso 2. Não existe terceiro valor
 * porque não existe segunda chave.
 *
 * SOLUÇÃO. Trocar o valor literal por uma REFERÊNCIA de recurso e deixar o próprio
 * Android escolher qual valor a referência resolve, pelo qualificador `sw600dp`:
 *
 *     values/integers.xml          screen_orientation = 1   (PORTRAIT)
 *     values-sw600dp/integers.xml  screen_orientation = -1  (UNSPECIFIED)
 *     AndroidManifest.xml          android:screenOrientation="@integer/screen_orientation"
 *
 * POR QUE ISTO E NAO OUTRA COISA. `D2` proíbe decidir composição por modelo de
 * aparelho, e `G-RSP-3` lacra isso em `src/`. Aqui a pergunta "sou um tablet?" NÃO é
 * feita: quem responde é o sistema de recursos do Android, pela mesma noção de
 * `smallestWidthDp` que o resto da plataforma usa. Não há código de tela, não há API de
 * *runtime* e não há dependência nova — `expo-screen-orientation` NÃO foi instalado
 * (`SD-11`).
 *
 * OS VALORES, E POR QUE ESTES.
 * - `1` é `ActivityInfo.SCREEN_ORIENTATION_PORTRAIT`: comportamento IDÊNTICO ao que o
 *   `app.json` produz hoje para telefone. O caso 2 de `D1` fica preservado por
 *   equivalência, não por promessa.
 * - `-1` é `ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED`, exatamente o valor que o
 *   plugin do próprio Expo escreve quando `orientation` é `'default'`
 *   (`android/Orientation.js:34`). Adotar o idioma que a ferramenta já usa é o que
 *   `RG-9` chama de menor intervenção. Descartados de propósito: `fullSensor` (10)
 *   ignoraria o bloqueio de rotação do usuário, e `user` (2)/`fullUser` (13)
 *   acrescentariam política que `D1` não pede.
 *
 * ORDEM DE EXECUÇÃO — POR QUE ESTE PLUGIN VENCE. `getPrebuildConfig.js:43` aplica os
 * plugins do usuário e só depois, em `:72`, `withAndroidExpoPlugins` (que contém
 * `withOrientation`). E `withMod` encadeia em LIFO (`withMod.js:197-202`: a ação roda e
 * então delega ao `nextMod`, que é o registrado ANTES). Logo `withOrientation` executa
 * primeiro e este plugin executa depois, sobrescrevendo o literal pela referência.
 * Isso está PROVADO por prebuild, não suposto — ver artefato `21`.
 *
 * MANUTENÇÃO. Aquela ordem é propriedade de `@expo/config-plugins@54.0.5`, não do
 * contrato público. Se ela se inverter, `withOrientation` passa a escrever DEPOIS e
 * apaga a referência — o tablet volta a travar em retrato SEM erro nenhum. Nada dentro
 * de um mod consegue observar o que roda depois dele, então a única prova é externa:
 * ao subir a versão de `expo`/`@expo/config-plugins`, REPETIR o prebuild e conferir
 * que `android:screenOrientation` continua valendo `@integer/screen_orientation`.
 *
 * iOS NÃO É TOCADO. `expo.orientation: "portrait"` continua valendo, e é ele que dá
 * retrato ao iPhone (caso 1). O iPad já gira hoje por
 * `ios/RequiresFullScreen.js:66`, que grava `UISupportedInterfaceOrientations~ipad` com
 * as quatro máscaras porque `supportsTablet` é verdadeiro e `requireFullScreen` é falso
 * (caso 3). Nenhum dos dois passa por aqui.
 *
 * EVIDÊNCIA FÍSICA QUE MOTIVA A REDAÇÃO ACIMA. No SM-X510 (Android 16, `targetSdk` 36,
 * `sw823dp`) a configuração ANTERIOR já permitia `ROTATION_0` -> `ROTATION_90` ->
 * `ROTATION_0` com a `MainActivity` em foco: naquele aparelho a restrição de orientação
 * já era ignorada pela exceção de telas grandes do Android 16. Este plugin, portanto,
 * NÃO é o que faz aquele tablet girar — ele é a política que satisfaz `D1` também onde
 * a exceção NÃO existir (Android anterior, OEM que não a aplique, janela abaixo do
 * limiar). O plugin é compatibilidade, não causa.
 */

const { AndroidConfig, XML, withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');

const RECURSO = 'screen_orientation';
const REFERENCIA = `@integer/${RECURSO}`;
const ARQUIVO = 'integers.xml';

/** `ActivityInfo.SCREEN_ORIENTATION_*` — o que cada bucket de recurso resolve. */
const VALOR_POR_BUCKET = {
  values: 1,             // PORTRAIT — telefone, idêntico ao comportamento de hoje
  'values-sw600dp': -1,  // UNSPECIFIED — tablet, o mesmo que o Expo escreve para `default`
};

/**
 * Escreve (ou funde) o inteiro no bucket pedido. Ler antes de escrever não é zelo
 * decorativo: se um dia o *template* do Expo passar a trazer `integers.xml`, sobrescrever
 * o arquivo apagaria recursos alheios em silêncio.
 */
async function gravarInteiro(res, bucket, valor) {
  const caminho = path.join(res, bucket, ARQUIVO);
  const xml = await AndroidConfig.Resources.readResourcesXMLAsync({ path: caminho });

  const itens = Array.isArray(xml.resources.integer) ? xml.resources.integer : [];
  const existente = itens.find((item) => item?.$?.name === RECURSO);

  if (existente) {
    existente._ = String(valor);
  } else {
    itens.push({ $: { name: RECURSO }, _: String(valor) });
  }

  xml.resources.integer = itens;
  await XML.writeXMLAsync({ path: caminho, xml });
  return caminho;
}

const withRecursosDeOrientacao = (config) =>
  withDangerousMod(config, [
    'android',
    async (cfg) => {
      const res = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
      for (const [bucket, valor] of Object.entries(VALOR_POR_BUCKET)) {
        await gravarInteiro(res, bucket, valor);
      }
      return cfg;
    },
  ]);

const withReferenciaNoManifesto = (config) =>
  withAndroidManifest(config, (cfg) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults);
    mainActivity.$[AndroidConfig.Orientation.SCREEN_ORIENTATION_ATTRIBUTE] = REFERENCIA;
    return cfg;
  });

module.exports = function withAndroidTabletOrientation(config) {
  return withReferenciaNoManifesto(withRecursosDeOrientacao(config));
};

module.exports.RECURSO = RECURSO;
module.exports.REFERENCIA = REFERENCIA;
module.exports.VALOR_POR_BUCKET = VALOR_POR_BUCKET;
