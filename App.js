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
// A0.2 (Direção de Arte v1.1 / D3): Fraunces (display, peso 600) passa a ser
// carregada junto. FredokaOne segue carregada TEMPORARIAMENTE (as 317 telas atuais
// ainda a usam — a migração para Fraunces é por tela, em blocos futuros).
import {
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import AppNavigator from './src/navigation/AppNavigator';
import { ProfileProvider } from './src/context/ProfileContext';
import { ProgressProvider } from './src/context/ProgressContext';
import { PacksProvider } from './src/context/PacksContext';
import { preloadCriticalAssets } from './src/services/assetPreloadService';
import { loadCreatorQaMode } from './src/services/creatorQaMode';
import { initEntitlement } from './src/services/entitlementService';
import { runLocalMigrations } from './src/services/storageMigrationService';

export default function App() {
  const [fontsLoaded] = useFonts({
    'FredokaOne': FredokaOne_400Regular, // temporário (telas atuais) — sai por tela
    'Nunito': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
    'Fraunces': Fraunces_600SemiBold,    // A0.2: display oficial da v1.1 (tokens.font.display)
  });

  // Pré-carrega capas das histórias e Beni em background (não bloqueia a UI).
  // A SplashScreen (~2,5s) cobre a janela de aquecimento do cache.
  useEffect(() => {
    preloadCriticalAssets();
    loadCreatorQaMode();
    initEntitlement(); // Fase 2B.7.3: boot fire-and-forget do entitlement (cache + refresh por AppState)
    // Migração local de schema — roda em background, nunca bloqueia a UI.
    // Se falhar, o app continua abrindo normalmente.
    runLocalMigrations().catch(e => console.warn('[Migration]', e));
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
            {/* F2.1d: estado READ-ONLY de packs (sem consumo visual — nenhuma tela lê ainda). */}
            <PacksProvider>
              <AppNavigator />
            </PacksProvider>
          </ProgressProvider>
        </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
