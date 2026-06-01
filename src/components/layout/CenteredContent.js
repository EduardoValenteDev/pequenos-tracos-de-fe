import React from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';

const MAX_WIDTH = 720;

export default function CenteredContent({ children, style }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  return (
    <View style={[styles.base, isTablet && styles.tablet, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { width: '100%' },
  tablet: { maxWidth: MAX_WIDTH, alignSelf: 'center' },
});
