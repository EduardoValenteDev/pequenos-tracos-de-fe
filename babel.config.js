module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // ⚠️ NÃO adicionar 'react-native-worklets/plugin' nem 'react-native-reanimated/plugin' aqui:
    // no Expo SDK 54 o `babel-preset-expo` já os injeta automaticamente quando o pacote está
    // instalado (ver babel-preset-expo/build/index.js). Duplicar o plugin causava CRASH NATIVO no
    // primeiro gesto (dupla transformação de worklets). — M1R5R.
  };
};
