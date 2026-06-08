import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import productConfig from '../config/productConfig';
import BeniAvatar from '../components/beni/BeniAvatar';
import { shouldShowOnboarding } from '../services/onboardingService';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(async () => {
      // Decide entre onboarding (primeiro acesso) ou app principal (usuário retornando).
      // Se a verificação falhar por qualquer motivo, vai direto para Home.
      try {
        const showOnboarding = await shouldShowOnboarding();
        navigation.replace(showOnboarding ? 'Onboarding' : 'Home');
      } catch {
        navigation.replace('Home');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <BeniAvatar variant="main" size="hero" style={styles.mascot} />
        <Text style={styles.title}>{productConfig.appName}</Text>
        <Text style={styles.subtitle}>{productConfig.appSubtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  mascot: {
    marginBottom: 28,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 40,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});
