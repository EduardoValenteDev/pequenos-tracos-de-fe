import 'react-native-gesture-handler'; // DEVE ser a primeira importação
import React, { useEffect, useState } from 'react';
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
import { FONT_TIMEOUT_MS, isWaitingForFonts } from './src/services/bootRoute';
import { warn } from './src/utils/logger';

export default function App() {
  // LP1A: `useFonts` devolve [loaded, error]. Consumir só o primeiro tratava "ainda carregando" e
  // "falhou de vez" como o MESMO estado — qualquer .ttf que falhasse prendia o app num spinner
  // eterno (LP0-BOOT-01, P0). Agora o erro é um estado de saída, não de espera.
  const [fontsLoaded, fontError] = useFonts({
    'FredokaOne': FredokaOne_400Regular, // temporário (telas atuais) — sai por tela
    'Nunito': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
    'Fraunces': Fraunces_600SemiBold,    // A0.2: display oficial da v1.1 (tokens.font.display)
  });

  // Teto da espera das fontes. O `error` do hook cobre a FALHA, mas não cobre a Promise que fica
  // PENDENTE (nem resolve, nem rejeita) — sem teto, isso seria um spinner eterno com outra causa.
  // Se a fonte chegar antes do teto, ela é usada normalmente; o timer é limpo no cleanup e nunca
  // atualiza estado depois do unmount.
  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    if (fontsLoaded || fontError) return undefined;   // já resolveu: não arma o teto
    let alive = true;
    const timer = setTimeout(() => {
      if (!alive) return;
      setFontTimedOut(true);
      warn(`[Fonts] teto de ${FONT_TIMEOUT_MS} ms atingido — seguindo com o tipo do sistema.`);
    }, FONT_TIMEOUT_MS);
    return () => { alive = false; clearTimeout(timer); };
  }, [fontsLoaded, fontError]);

  // Degradação segura (spec 011 §14: "falha de asset = fallback + seguir"): o app abre mesmo sem a
  // fonte. Uma `fontFamily` não registrada cai no tipo do SISTEMA (iOS: RCTFont; Android:
  // ReactFontManager) — o texto continua legível, só muda o desenho da letra. Por isso nenhuma
  // proteção extra é necessária no tema (design system = área protegida; trocar 4 famílias em
  // ~317 telas seria refatoração ampla, proibida pela Constituição, Princípio IV).
  useEffect(() => {
    if (fontError) warn('[Fonts] falha ao carregar fonte — seguindo com o tipo do sistema:', fontError);
  }, [fontError]);

  // Trabalho NÃO crítico do boot: continua fire-and-forget (a 1ª rota não espera nada disto).
  // LP1A só garante que nenhuma rejeição fique sem tratamento.
  useEffect(() => {
    // Pré-carrega capas e Beni em background. Pode REJEITAR (Promise.race com preloadModules).
    preloadCriticalAssets().catch(e => warn('[Preload]', e));
    // `async` com try/catch, mas notifyListeners() roda fora do try — pode rejeitar.
    loadCreatorQaMode().catch(e => warn('[CreatorQa]', e));
    // Fase 2B.7.3: boot fire-and-forget do entitlement (cache + refresh por AppState).
    // NÃO retorna Promise (é síncrona e já engole tudo internamente) — encadear .catch aqui
    // lançaria TypeError e derrubaria o boot.
    initEntitlement();
    // Migração local de schema — roda em background, nunca bloqueia a UI.
    // Se falhar, o app continua abrindo normalmente.
    runLocalMigrations().catch(e => console.warn('[Migration]', e));
  }, []);

  // Espera SÓ enquanto está de fato carregando. Em erro OU no teto, segue (nunca prende).
  if (isWaitingForFonts(fontsLoaded, fontError, fontTimedOut)) {
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
