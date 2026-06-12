/**
 * BeniCircularArt — retrato circular do mascote Beni, com enquadramento correto.
 *
 * Por que existe: as artes oficiais do Beni são retratos 4:5 (960×1200) com fundo
 * próprio. Renderizá-las preenchendo 100% de um círculo cortava a cabeça/pés/pose
 * (quadrado mal encaixado na moldura redonda). Aqui a arte é COLOCADA INTEIRA,
 * centralizada, com uma margem de segurança (innerRatio), e o círculo funciona
 * como MOLDURA — não como corte.
 *
 * Estrutura:
 *   - container externo circular (borda, fundo/mat, sombra) = moldura
 *   - clip circular interno → arredonda os cantos (claros) do fundo da arte
 *   - arte via BeniMascotImage com resizeMode="contain" e tamanho reduzido
 *     (innerRatio) → o Beni e o fundo aparecem inteiros e centralizados
 *   - children (badge/selo) ficam por cima e podem extrapolar a moldura
 *
 * Não altera as imagens. Apenas apresentação/enquadramento.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import BeniMascotImage from './BeniMascotImage';

/** A arte ocupa 86% do diâmetro → ~7% de margem de segurança em volta. */
const DEFAULT_INNER_RATIO = 0.86;

export default function BeniCircularArt({
  variant = 'avatarBase',
  size = 64,
  innerRatio = DEFAULT_INNER_RATIO,
  backgroundColor = '#FBF8F2',
  borderColor = '#F4B400',
  borderWidth = 2.5,
  shadowColor = '#F4B400',
  showShadow = true,
  style,
  children,
  accessibilityLabel,
}) {
  const innerSize = Math.round(size * innerRatio);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        showShadow && {
          elevation: 3,
          shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.22,
          shadowRadius: 5,
        },
        style,
      ]}
    >
      {/* Clip circular: arredonda os cantos claros do fundo 4:5 sem cortar o Beni. */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: size / 2,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <BeniMascotImage
          variant={variant}
          size={innerSize}
          resizeMode="contain"
          accessibilityLabel={accessibilityLabel}
        />
      </View>
      {children}
    </View>
  );
}
