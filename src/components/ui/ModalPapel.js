import React from 'react';
import { Modal, View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { color, radius, shadow, maxContentWidth } from '../../theme/tokens';

/**
 * ModalPapel — A0.4 (Direção de Arte v1.1). Modal do mundo papel: backdrop quente,
 * card paper100 CENTRALIZADO com largura RESPONSIVA `min(560, 92%)` (560 =
 * maxContentWidth.tablet dos tokens), via useWindowDimensions — nunca esticado em
 * tablet/iPad. Sombra única. Só tokens. Não aplicado a nenhuma tela ainda.
 *
 * Props: visible, onRequestClose (toque fora/back), children, style, dismissOnBackdrop.
 */
export default function ModalPapel({
  visible,
  onRequestClose,
  children,
  style,
  dismissOnBackdrop = true,
}) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(maxContentWidth.tablet, Math.round(width * 0.92)); // min(560, 92%)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissOnBackdrop ? onRequestClose : undefined}
          accessibilityLabel="Fechar"
        />
        <View style={[styles.card, { width: cardWidth }, style]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,20,10,0.55)', // escurecido quente (não preto puro)
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    maxWidth: maxContentWidth.tablet,
    backgroundColor: color.paper100,
    borderRadius: radius.hero,
    borderWidth: 1.5,
    borderColor: color.paper200,
    padding: 18,
    shadowColor: shadow.color,
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    shadowOffset: shadow.offset,
    elevation: 12,
  },
});
