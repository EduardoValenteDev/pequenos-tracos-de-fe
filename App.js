import 'react-native-gesture-handler'; // DEVE ser a primeira importação
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  FredokaOne_400Regular,
} from '@expo-google-fonts/fredoka-one';
import {
  Nunito_400Regular,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import AppNavigator from './src/navigation/AppNavigator';
import { ProfileProvider } from './src/context/ProfileContext';
import { ProgressProvider } from './src/context/ProgressContext';
import { preloadCriticalAssets } from './src/services/assetPreloadService';
import { loadCreatorQaMode } from './src/services/creatorQaMode';

export default function App() {
  const [fontsLoaded] = useFonts({
    'FredokaOne': FredokaOne_400Regular,
    'Nunito': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
  });

  // Pré-carrega capas das histórias e Beni em background (não bloqueia a UI).
  // A SplashScreen (~2,5s) cobre a janela de aquecimento do cache.
  useEffect(() => {
    preloadCriticalAssets();
    // Carrega o estado do Modo Criador/QA (override de permissão local) cedo no boot.
    loadCreatorQaMode();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F0' }}>
        <ActivityIndicator size="large" color="#FF8C42" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProfileProvider>
          <ProgressProvider>
            <AppNavigator />
          </ProgressProvider>
        </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
