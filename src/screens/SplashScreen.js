import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import productConfig from '../config/productConfig';
import BeniAvatar from '../components/beni/BeniAvatar';
import { shouldShowOnboarding } from '../services/onboardingService';
import { BOOT_FALLBACK_ROUTE, NAV_RETRY_MS, canNavigate, canRetryNavigation, resolveBootRoute } from '../services/bootRoute';
import { warn } from '../utils/logger';

const FADE_MS = 800;            // animação aprovada (inalterada)
// Teto de SEGURANÇA — não é piso. Só age se a leitura do storage travar (nunca resolver nem
// rejeitar); jamais atrasa uma resposta válida mais rápida. Alinhado ao contrato de carregamento
// aprovado (spec 011 §14: espera máxima da 1ª revelação ≈ 1,5 s).
const DECISION_CEILING_MS = 1500;

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigatedRef = useRef(false);   // trava contra navegação dupla
  const aliveRef = useRef(true);        // descarta resultado após unmount

  useEffect(() => {
    aliveRef.current = true;
    let route = null;                   // rota decidida (null = ainda não decidida)
    let animationDone = false;
    let watchdog = null;
    let retryTimer = null;              // repescagem do replace (limitada)
    let navAttempts = 0;

    // Navega quando a rota ESTÁ decidida e a animação aprovada terminou — por prontidão,
    // nunca por relógio (LP1A: o piso fixo de 2500 ms foi removido).
    const go = () => {
      if (!canNavigate({ route, animationDone, alive: aliveRef.current, navigated: navigatedRef.current })) return;
      navigatedRef.current = true;   // trava ANTES de navegar (não pode haver 2º replace)
      try {
        navigation.replace(route);
      } catch (e) {
        // Replace falhou: devolve a trava e AGENDA a própria repescagem. Não dá para contar com o
        // watchdog — quando é ELE quem chama go() (teto), o timer já disparou e não repete, o que
        // deixaria a splash presa. A repescagem é limitada (MAX_NAV_ATTEMPTS) e espaçada
        // (NAV_RETRY_MS): nunca é loop rápido nem infinito.
        navigatedRef.current = false;
        navAttempts += 1;
        warn(`[Boot] navigation.replace falhou (tentativa ${navAttempts}):`, e);
        if (canRetryNavigation({ attempts: navAttempts, alive: aliveRef.current, scheduled: !!retryTimer })) {
          retryTimer = setTimeout(() => { retryTimer = null; go(); }, NAV_RETRY_MS);
        }
        return;
      }
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    };

    // 1) A decisão de rota começa AGORA, em paralelo com a animação (antes ela só começava
    //    depois do relógio). Falha de storage → fallback determinístico e navegável.
    shouldShowOnboarding()
      .then((showOnboarding) => { route = resolveBootRoute(showOnboarding); })
      .catch(() => { route = BOOT_FALLBACK_ROUTE; })
      .finally(() => { go(); });

    // 2) A animação existente é preservada; o FIM dela é um gatilho (não um timer novo).
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(() => { animationDone = true; go(); });

    // 3) Teto defensivo: se a decisão nunca chegar, sai mesmo assim pelo fallback.
    watchdog = setTimeout(() => {
      if (route == null) route = BOOT_FALLBACK_ROUTE;
      animationDone = true;
      go();
    }, DECISION_CEILING_MS);

    return () => {
      aliveRef.current = false;
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    };
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
