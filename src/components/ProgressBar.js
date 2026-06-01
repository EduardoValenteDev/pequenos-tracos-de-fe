import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ProgressBar({ current, total }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [current, total]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.outer}>
      <Animated.View style={[styles.inner, { width: animatedWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  inner: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 5,
  },
});
