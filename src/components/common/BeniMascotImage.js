/**
 * BeniMascotImage — componente reutilizável para exibir o mascote Beni.
 *
 * Renderiza uma das 7 poses oficiais (beniImages.js) como imagem simples, sem
 * moldura. Para o avatar circular com badge, use BeniAvatar.
 *
 * Regras:
 *   - require ESTÁTICO (sem caminho dinâmico, sem base64, sem URL externa).
 *   - variant padrão = avatarBase; fallback seguro = avatarBase.
 *   - resizeMode padrão = 'contain' → nunca estica nem corta o Beni.
 */
import React from 'react';
import { Image } from 'react-native';
import { BENI_IMAGES, BENI_DEFAULT_VARIANT } from '../../assets/mascot/beniImages';

/**
 * @param {'avatarBase'|'acenando'|'celebrando'|'comBau'|'ensinando'|'orando'|'atelie'} [variant='avatarBase']
 * @param {number} [size] — lado em px (aplica width/height quadrados). Opcional.
 * @param {object|Array} [style] — estilos extras (têm prioridade sobre size).
 * @param {'contain'|'cover'|'center'|'stretch'|'repeat'} [resizeMode='contain']
 * @param {string} [accessibilityLabel]
 */
export default function BeniMascotImage({
  variant = BENI_DEFAULT_VARIANT,
  size,
  style,
  resizeMode = 'contain',
  accessibilityLabel,
}) {
  // Fallback seguro: pose desconhecida → avatarBase (nunca null/tela branca).
  const source = BENI_IMAGES[variant] || BENI_IMAGES[BENI_DEFAULT_VARIANT];
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : null;

  return (
    <Image
      source={source}
      resizeMode={resizeMode}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel || 'Beni, o cordeirinho guia'}
      style={[sizeStyle, style]}
    />
  );
}
