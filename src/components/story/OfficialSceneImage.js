import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import {
  OFFICIAL_IMAGE_RESIZE_MODE,
  computeSceneImageSize,
  computeBookImageSize,
} from '../../constants/officialImage';

/**
 * OfficialSceneImage — ÚNICO responsável por renderizar a imagem oficial 4:5.
 *
 * Tamanho RESPONSIVO por perfil:
 *   variant="scene" → tela de história (≈46% da altura útil)
 *   variant="book"  → Livrinho da Fé (≈56% da altura útil, mais protagonista)
 *
 * Mantém 4:5 real (largura derivada da altura máxima), centralizada, com bordas
 * arredondadas e selo opcional. NUNCA ocupa a tela inteira. Como o arquivo já é
 * 4:5 dentro de um quadro 4:5, `cover` preenche sem corte perceptível.
 *
 * @param {*}        source
 * @param {*}        [fallbackSource=null]  require local p/ onError (F2.5-hardening-1 C2)
 * @param {'scene'|'book'} [variant='scene']
 * @param {boolean}  [showSeal=true]
 * @param {string}   [sealLabel='Cena ilustrada']
 * @param {object}   [style]       — estilo extra na moldura
 * @param {object}   [frameStyle]  — override da moldura
 * @param {function} [onLoadEnd]
 */
export default function OfficialSceneImage({
  source,
  fallbackSource = null,
  variant = 'scene',
  showSeal = true,
  sealLabel = 'Cena ilustrada',
  style,
  frameStyle,
  onLoadEnd,
}) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const size = variant === 'book'
    ? computeBookImageSize(screenW, screenH)
    : computeSceneImageSize(screenW, screenH);

  // F2.5-hardening-1 C2: se o `source` (ex.: file:// de pack) falhar no decode, cair UMA vez
  // para o require local (`fallbackSource`) — nunca deixar a moldura escura. Reseta ao trocar
  // cena/pack (source OU fallback mudam). Sem loop: a troca só ocorre uma vez.
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [source, fallbackSource]);
  const effectiveSource = failed && fallbackSource ? fallbackSource : source;

  return (
    <View
      style={[
        styles.frame,
        { width: size.width, height: size.height },
        frameStyle,
        style,
      ]}
    >
      <Image
        source={effectiveSource}
        style={styles.image}
        resizeMode={OFFICIAL_IMAGE_RESIZE_MODE}
        onLoadEnd={onLoadEnd}
        onError={() => { if (!failed && fallbackSource) setFailed(true); }}
      />
      {showSeal && (
        <View style={styles.seal} pointerEvents="none">
          <Text style={styles.sealText}>{sealLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Moldura 4:5 responsiva — width/height calculados, centralizada
  frame: {
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#10131A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  image: { width: '100%', height: '100%' },
  seal: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sealText: { fontFamily: 'Nunito', fontSize: 12, color: '#FFF', fontWeight: '700' },
});
