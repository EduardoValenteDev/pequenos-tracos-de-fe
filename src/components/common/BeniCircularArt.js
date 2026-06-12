/**
 * BeniCircularArt — retrato circular do mascote Beni (estilo foto de perfil).
 *
 * As artes do Beni são retratos 4:5 (960×1200) com fundo próprio. Para um avatar
 * circular bonito, o círculo é uma JANELA DE RECORTE: a arte PREENCHE o círculo
 * (resizeMode="cover") com um leve zoom e centralização controlada — como ao
 * escolher uma foto de perfil. Não aparece quadrado/retângulo nem faixa lateral.
 * Corta-se um pouco do fundo/extremidades (esperado), nunca o rosto do Beni.
 *
 * Dois modos:
 *   - mode="avatar" (padrão) → cover + crop controlado (cropScale/cropX/cropY).
 *   - mode="full"           → contain (mostra a arte INTEIRA; só para exibição
 *                             grande fora de avatar circular).
 *
 * Não altera os arquivos PNG. Apenas apresentação/enquadramento.
 */
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BENI_IMAGES, BENI_DEFAULT_VARIANT } from '../../assets/mascot/beniImages';
import BeniMascotImage from './BeniMascotImage';

/**
 * Presets de enquadramento por pose (zoom + centralização), estilo foto de perfil.
 * cropScale levemente > 1 (zoom); cropX/cropY como fração do diâmetro (recentrar).
 * Ajustar APENAS cropX/cropY caso alguma pose fique baixa/alta/lateralizada.
 */
const CROP_PRESETS = {
  avatarBase: { cropScale: 1.08, cropX: 0, cropY: 0 },
  acenando:   { cropScale: 1.10, cropX: 0, cropY: 0 },
  celebrando: { cropScale: 1.08, cropX: 0, cropY: 0 },
  comBau:     { cropScale: 1.12, cropX: 0, cropY: 0 },
  ensinando:  { cropScale: 1.10, cropX: 0, cropY: 0 },
  orando:     { cropScale: 1.08, cropX: 0, cropY: 0 },
  atelie:     { cropScale: 1.12, cropX: 0, cropY: 0 },
};
const DEFAULT_CROP = { cropScale: 1.08, cropX: 0, cropY: 0 };

export default function BeniCircularArt({
  variant = 'avatarBase',
  size = 64,
  mode = 'avatar',
  // Overrides opcionais do preset (caso uma tela precise ajustar pontualmente).
  cropScale,
  cropX,
  cropY,
  backgroundColor = '#FBF8F2',
  borderColor = '#F4B400',
  borderWidth = 2.5,
  shadowColor = '#F4B400',
  showShadow = true,
  style,
  children,
  accessibilityLabel,
}) {
  const source = BENI_IMAGES[variant] || BENI_IMAGES[BENI_DEFAULT_VARIANT];
  const preset = CROP_PRESETS[variant] || DEFAULT_CROP;
  const sScale = cropScale ?? preset.cropScale;
  const sX = cropX ?? preset.cropX;
  const sY = cropY ?? preset.cropY;

  // Wrapper externo: carrega a sombra e a posição (sem overflow, para o badge
  // poder extrapolar a moldura).
  const wrapperStyle = [
    { width: size, height: size, borderRadius: size / 2 },
    showShadow && {
      elevation: 3,
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 5,
    },
    style,
  ];

  // Janela de recorte circular.
  const clipStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Anel de borda por cima (não corta a imagem, mantém o recorte preenchendo).
  const ringStyle = {
    ...StyleSheet.absoluteFillObject,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
  };

  let content;
  if (mode === 'full') {
    // Exibição completa: arte inteira (contain), reduzida com margem de respiro.
    content = (
      <BeniMascotImage
        variant={variant}
        size={Math.round(size * 0.86)}
        resizeMode="contain"
        accessibilityLabel={accessibilityLabel}
      />
    );
  } else {
    // Avatar: cover + zoom/crop controlado preenchendo o círculo (foto de perfil).
    const frame = size * sScale; // frame maior que o círculo → preenche e sobra p/ recorte
    const inset = (size - frame) / 2; // negativo: centraliza o frame ampliado
    content = (
      <Image
        source={source}
        resizeMode="cover"
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel || 'Beni, o cordeirinho guia'}
        style={{
          position: 'absolute',
          width: frame,
          height: frame,
          left: inset + sX * size,
          top: inset + sY * size,
        }}
      />
    );
  }

  return (
    <View style={wrapperStyle}>
      <View style={clipStyle}>{content}</View>
      <View pointerEvents="none" style={ringStyle} />
      {children}
    </View>
  );
}
