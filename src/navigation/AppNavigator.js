import React, { useRef, useState, useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import TabletSidebar from '../components/TabletSidebar';
import FaithIcon from '../components/ui/FaithIcon';
import { useProgressContext } from '../context/ProgressContext';
import { isInitialTourPending, subscribeInitialTourRequest, isAdventureTourActive, getAdventureTabCalloutActive, subscribeAdventureTabCalloutActive } from '../services/beniTourService';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import StoriesScreen from '../screens/StoriesScreen';
import AdventureMapScreen from '../screens/AdventureMapScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import NarrationScreen from '../screens/NarrationScreen';
import ColoringScreen from '../screens/ColoringScreen';
import Coloring60CollectionScreen from '../screens/Coloring60CollectionScreen';
import Coloring60ArtPreviewScreen from '../screens/Coloring60ArtPreviewScreen';
import Coloring60LabScreen from '../screens/Coloring60LabScreen';
import SceneValidationScreen from '../screens/SceneValidationScreen';
import CongratsScreen from '../screens/CongratsScreen';
import TrophiesScreen from '../screens/TrophiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BrincarScreen from '../screens/BrincarScreen';
import ParesDoBeniScreen from '../screens/ParesDoBeniScreen';
import CadeAOvelhinhaScreen from '../screens/CadeAOvelhinhaScreen';
import OvelhaAssetGalleryScreen from '../screens/OvelhaAssetGalleryScreen';
import PalavrinhasDoBeniScreen from '../screens/PalavrinhasDoBeniScreen';
// Monte a Cena — Architecture Spike M1A (baseline técnico, legado). Rota SÓ sob o gate interno.
import MonteACenaSpikeScreen from '../screens/MonteACenaSpikeScreen';
// Monte a Cena — protótipo visual M1R1 (legado). Rota SÓ sob o gate interno.
import MonteACenaPrototypeScreen from '../screens/MonteACenaPrototypeScreen';
// Monte a Cena — núcleo jogável M1R2 (seleção de níveis + rodada). Rotas SÓ sob o gate interno.
import MonteACenaLevelSelectScreen from '../screens/MonteACenaLevelSelectScreen';
import MonteACenaGameScreen from '../screens/MonteACenaGameScreen';
// Monte a Cena — RODADA V2 (M1R2R, reconstrução integral). Rota de validação atual.
import MonteACenaGameV2Screen from '../screens/MonteACenaGameV2Screen';
// Monte a Cena — M1R3: entrada (catálogo), escolha de peças e galeria "Meus Quadros".
import MonteACenaHomeScreen from '../screens/MonteACenaHomeScreen';
// M1R6 — tela da história (quadros 2×2), entre a galeria de histórias e a Mesa do Beni.
import MonteACenaStoryScreen from '../screens/MonteACenaStoryScreen';
import MonteACenaDifficultyScreen from '../screens/MonteACenaDifficultyScreen';
import MonteACenaGalleryScreen from '../screens/MonteACenaGalleryScreen';
// M1R4 Portão 1 — laboratório isolado do motor de gestos.
import PuzzleGestureLabScreen from '../screens/PuzzleGestureLabScreen';
// M1R5 — RODADA REAL integrada (motor definitivo usePuzzleEngine). Rota que a criança usa.
import MonteACenaTableGameScreen from '../screens/MonteACenaTableGameScreen';
import AtelierCanvasScreen from '../screens/AtelierCanvasScreen';
import AtelierGalleryScreen from '../screens/AtelierGalleryScreen';
import PostStoryHubScreen from '../screens/PostStoryHubScreen';
import QuizScreen from '../screens/QuizScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import LumiMomentScreen from '../screens/LumiMomentScreen';
import ParentAreaScreen from '../screens/ParentAreaScreen';
import StoryBookScreen from '../screens/StoryBookScreen';
import CultinhoEmCasaScreen from '../screens/CultinhoEmCasaScreen';
import BeniChestScreen from '../screens/BeniChestScreen';
import CreatorModeBanner from '../components/dev/CreatorModeBanner';
// F2.2b — ferramenta dev-only de pack sandbox (rota SÓ sob o DUPLO GATE).
import { isPackSandboxDevEnabled } from '../services/packSandboxDevService';
import PackSandboxDevScreen from '../screens/PackSandboxDevScreen';
// M1 — gate único das ferramentas internas (Administração dev): rotas internas só sob ele.
import { isInternalToolsEnabled } from '../config/internalTools';
import { breakpoints } from '../theme/tokens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  backgroundColor: colors.cardBg,
  elevation: 2,
  shadowOpacity: 0.1,
};

const headerTitleStyle = {
  fontFamily: 'FredokaOne',
  fontSize: 18,
  color: colors.text,
};

const headerTintColor = colors.primary;

// Reserva largura para o botão de voltar customizado, evitando corte ("‹ V")
// quando o título é longo nas telas que ainda usam header nativo.
const headerLeftContainerStyle = { minWidth: 120, paddingLeft: 4 };
const headerTitleContainerStyle = { marginHorizontal: 8 };

function HomeBtn({ navigation }) {
  const busy = useRef(false);
  function handlePress() {
    if (busy.current) return;
    busy.current = true;
    setTimeout(() => { busy.current = false; }, 500);
    navigation.navigate('Home');
  }
  return (
    <TouchableOpacity onPress={handlePress} style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
      <Text style={{ fontFamily: 'FredokaOne', fontSize: 14, color: colors.primary }}>
        🏠 Início
      </Text>
    </TouchableOpacity>
  );
}

// Botão de voltar customizado — substitui o botão nativo do iOS para que nenhum
// nome técnico de rota (Home, Back, etc.) vaze como rótulo no header.
function BackBtn({ navigation, onPress }) {
  function handlePress() {
    if (onPress) return onPress();
    if (navigation.canGoBack()) navigation.goBack();
  }
  return (
    <TouchableOpacity onPress={handlePress} style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
      <Text style={{ fontFamily: 'FredokaOne', fontSize: 14, color: colors.primary }}>
        ‹ Voltar
      </Text>
    </TouchableOpacity>
  );
}

// Definição centralizada das abas — única fonte de verdade para mobile e tablet
const TAB_DEFS = [
  { name: 'Início',     faithIcon: 'home',       component: HomeScreen },
  // M1 Mapa Pergaminho: a aba Aventuras passa a renderizar o mapa vertical.
  // StoriesScreen segue disponível na rota de stack 'Stories' (fallback reversível).
  { name: 'Aventuras',  faithIcon: 'adventures', component: AdventureMapScreen },
  // Bloco 1.2 — a aba vira "Brincar" na UI. O `name` é a IDENTIDADE DE ROTA e continua
  // 'Ateliê': o OnboardingScreen navega por ela, e trocá-la quebraria a navegação.
  // O usuário nunca vê `name` — vê `label` (tabBarLabel).
  { name: 'Ateliê',     label: 'Brincar', faithIcon: 'brincar', component: BrincarScreen },
  { name: 'Estrelinhas', faithIcon: 'trophies',   component: TrophiesScreen },
  { name: 'Perfil',     faithIcon: 'profile',    component: ProfileScreen },
];

function TabIcon({ iconName, focused }) {
  // Ícone padrão: cor/tamanho ATIVOS quando a aba está focada. Durante o tour de
  // Aventuras a aba já está focada → cor ativa automática. A moldura guiada é uma
  // CAMADA decorativa à parte (na tab bar), nunca um container em volta do SVG.
  return (
    <FaithIcon
      name={iconName}
      size={focused ? 26 : 22}
      color={focused ? colors.primary : colors.textLight}
    />
  );
}

// Layout para tablet: sidebar fixa à esquerda + tela ativa à direita
function TabletLayout({ navigation }) {
  // Tablet: o nested state da navegação não chega aqui (layout custom). Se há tour
  // inicial pendente (onboarding/“Rever Tour”), começa na aba Aventuras e assina o
  // sinal para focar Aventuras quando o pedido vier com a tela já montada.
  const [activeTabName, setActiveTabName] = useState(() => (isInitialTourPending() ? 'Aventuras' : 'Início'));
  useEffect(() => subscribeInitialTourRequest(() => setActiveTabName('Aventuras')), []);
  const { progressSummary } = useProgressContext();
  const totalStars = progressSummary?.totalStars ?? 0;
  const maxStars = progressSummary?.maxTotalStars ?? 0;

  const activeTab = TAB_DEFS.find(t => t.name === activeTabName) ?? TAB_DEFS[0];
  const ActiveComponent = activeTab.component;

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <TabletSidebar
        activeTab={activeTabName}
        // Fase 1.1.3: durante o tour de Aventuras, ignora a troca para outros itens
        // (sidebar segue visível, Aventuras continua ativa). Sem Modal/overlay.
        onTabPress={(name) => {
          if (isAdventureTourActive() && name !== 'Aventuras') return;
          setActiveTabName(name);
        }}
        totalStars={totalStars}
        maxStars={maxStars}
      />
      <View style={{ flex: 1 }}>
        <ActiveComponent
          navigation={navigation}
          route={{
            params: activeTab.defaultParams ?? {},
            key: activeTabName,
            name: activeTabName,
          }}
        />
      </View>
    </View>
  );
}

// Fase 1.1.4.3: moldura da aba Aventuras = CAMADA decorativa (pointerEvents none)
// SOBRE o item, com as mesmas cores do tabHalo do BeniGuideOverlay. Não usa
// tabBarItemStyle (que cortava o label) — não altera layout/padding/size do item.
const TOUR_TAB_CALLOUT = {
  position: 'absolute',
  borderRadius: 16,
  borderWidth: 2.5,
  borderColor: 'rgba(255,205,110,0.98)',
  backgroundColor: 'rgba(255,222,150,0.18)',
};

// Navegação inferior para celular com safe area corrigida
function MobileTabs() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Fase 1.1.4.3: re-renderiza a tab bar quando o REALCE da aba liga/desliga — e isso
  // liga SÓ no passo "Seu mapa de aventuras" (sinal callout), não no tour inteiro.
  const [calloutOn, setCalloutOn] = useState(getAdventureTabCalloutActive());
  useEffect(() => subscribeAdventureTabCalloutActive(setCalloutOn), []);

  // Geometria da moldura sobre o item Aventuras (sem tocar o layout do item).
  const tabBarH = 64 + insets.bottom;
  const advIndex = TAB_DEFS.findIndex((t) => t.name === 'Aventuras');
  const tabW = width / TAB_DEFS.length;
  const calloutW = Math.min(tabW - 14, 88);
  const calloutLeft = tabW * (advIndex + 0.5) - calloutW / 2;

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // Adiciona o inset inferior do sistema para não ficar tampado pela barra do Samsung
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito',
          fontSize: 11,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
      }}
    >
      {TAB_DEFS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          initialParams={tab.defaultParams}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon iconName={tab.faithIcon} focused={focused} />,
            // Bloco 1.2: o rótulo VISÍVEL vem de `label` (quando existe); `name` é só rota.
            tabBarLabel: tab.label ?? tab.name,
            tabBarAccessibilityLabel: tab.label ?? tab.name,
          }}
          listeners={{
            // Fase 1.1.3: durante o tour de Aventuras, bloqueia a troca para outras
            // abas (sem Modal, sem cobrir o mapa). A tab bar segue visível; o toque
            // só não navega. A aba Aventuras continua acessível.
            tabPress: (e) => {
              if (isAdventureTourActive() && tab.name !== 'Aventuras') e.preventDefault();
            },
          }}
        />
      ))}
    </Tab.Navigator>
      {/* Moldura decorativa sobre o item Aventuras — só no passo que realça a aba.
          pointerEvents none: não bloqueia toque, não altera o layout do item. */}
      {calloutOn && advIndex >= 0 && (
        <View
          pointerEvents="none"
          style={[
            TOUR_TAB_CALLOUT,
            { left: calloutLeft, width: calloutW, bottom: insets.bottom + 5, height: tabBarH - insets.bottom - 9 },
          ]}
        />
      )}
    </View>
  );
}

// Entrada do layout principal — decide entre tablet e celular
function MainTabs({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;
  return isTablet ? <TabletLayout navigation={navigation} /> : <MobileTabs />;
}

export default function AppNavigator() {
  // F2.2b: acesso à ferramenta dev de pack sandbox — SÓ sob o duplo gate.
  const navigationRef = useNavigationContainerRef();
  const devPacksEnabled = isPackSandboxDevEnabled();
  return (
    <NavigationContainer ref={navigationRef}>
      <CreatorModeBanner />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitle: '',
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Home"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Stories"
          component={StoriesScreen}
          options={({ navigation }) => ({
            title: 'Aventuras',
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerLeftContainerStyle,
            headerTitleContainerStyle,
            headerLeft: () => <BackBtn navigation={navigation} />,
            headerRight: () => <HomeBtn navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="StoryDetail"
          component={StoryDetailScreen}
          options={({ route, navigation }) => ({
            // A0.7: header da tela de detalhe = APENAS "Voltar" à esquerda. O "Voltar"
            // respeita o fluxo e retorna à tela anterior (mapa de aventuras ou lista de
            // histórias), diferente do antigo botão que ia para a Home. Sem botão à
            // direita. A largura reservada (headerLeftContainerStyle) + título
            // centralizado fazem títulos longos ("Noé e o Sinal da Aliança") truncarem
            // no centro sem NUNCA esconder o "Voltar". Padrão idêntico em toda história.
            title: route.params?.story?.titulo || 'Detalhes',
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerTitleAlign: 'center',
            headerLeftContainerStyle,
            headerTitleContainerStyle,
            headerLeft: () => <BackBtn navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="Narration"
          component={NarrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Coloring"
          component={ColoringScreen}
          options={{ headerShown: false }}
        />
        {/* Colorir 60 · Parte 7 — a COLEÇÃO virou TELA PRÓPRIA (antes era uma camada por cima do
            desenho aberto, o que fazia fundo, contraste e composição mudarem conforme a origem).
            A rota é pública porque a autorização do piloto é decidida DENTRO da tela. */}
        <Stack.Screen
          name="Coloring60Collection"
          component={Coloring60CollectionScreen}
          options={{ headerShown: false }}
        />
        {/* Colorir 60 · seleção visual — PRÉVIA AMPLIADA de UMA obra, aberta ao tocar uma criação
            na coleção. Pública pela mesma razão da coleção: recebe só a IDENTIDADE (storyId +
            activityId) e o gate do piloto é decidido DENTRO da tela; nenhuma pintura viaja na nav. */}
        <Stack.Screen
          name="Coloring60ArtPreview"
          component={Coloring60ArtPreviewScreen}
          options={{ headerShown: false }}
        />
        {/* [P3J] A rota "ColoringQa" foi REMOVIDA com o Colorir legado: a galeria de QA existia só
            para abrir os 200 linearts por cena (getColoringImage), que não existem mais. A bancada
            do Colorir 60 (Coloring60Lab, abaixo) segue sendo a ferramenta interna do colorir atual. */}
        {/* §Parte 12: bancada do Colorir 60 (reencenar 0/3→3/3 e as reedições). Rota registrada SÓ
            sob o gate interno; a TELA ainda exige Modo Criador ligado. Sem rota pública. */}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="Coloring60Lab"
            component={Coloring60LabScreen}
            options={{ headerShown: false }}
          />
        )}
        {/* V1: Validação visual de cenas — SÓ LEITURA, rota registrada apenas sob o gate
            interno, SEM rota pública. Entrada só na seção "Administração (dev)". */}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="SceneValidation"
            component={SceneValidationScreen}
            options={{ headerShown: false }}
          />
        )}
        <Stack.Screen
          name="Congrats"
          component={CongratsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AtelierCanvas"
          component={AtelierCanvasScreen}
          options={{ headerShown: false }}
        />
        {/* [P3J-R.1 FIX1] A rota `AtelierFromContext` (hub legado "Ateliê do Beni") foi REMOVIDA.
            O Cultinho agora abre o Criar livre canônico (`AtelierCanvas`, acima) com from:'cultinho'.
            Não recriar: nenhuma tela intermediária deve existir entre o Cultinho e o canvas. */}
        {/* Bloco 1.3 — primeiro jogo real da aba Brincar. */}
        <Stack.Screen
          name="ParesDoBeni"
          component={ParesDoBeniScreen}
          options={{ headerShown: false }}
        />
        {/* OV4 — "Cadê a Ovelhinha?" (user-facing v1): rota SEMPRE registrada (aba Brincar).
            Os diagnósticos internos DENTRO da tela (Asset Gallery, Simulador, calibração,
            hitbox, seed, deck, overlay do Criador) continuam gated por Modo Criador /
            isInternalToolsEnabled. Ver D-OVELHINHA-UF1. */}
        <Stack.Screen
          name="CadeAOvelhinha"
          component={CadeAOvelhinhaScreen}
          options={{ headerShown: false }}
        />
        {/* Bloco 2.2e — Asset Gallery interna (diagnóstico de carregamento por onDisplay).
            SÓ sob o gate interno; nunca em produção. */}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="OvelhaAssetGallery"
            component={OvelhaAssetGalleryScreen}
            options={{ headerShown: false }}
          />
        )}
        {/* Feature 009 — "Palavrinhas do Beni" (UF1): user-facing no v1 (jogo de soletração da
            aba Brincar). Rota SEMPRE registrada. O Laboratório/diagnósticos internos DENTRO da
            tela continuam gated por Modo Criador (isCreatorQaModeEnabled). Ver D-PALAVRINHAS-UF1. */}
        <Stack.Screen
          name="PalavrinhasDoBeni"
          component={PalavrinhasDoBeniScreen}
          options={{ headerShown: false }}
        />
        {/* Monte a Cena — Architecture Spike M1A (legado técnico) + protótipo visual M1R1 (validação).
            Ambas SÓ sob o gate interno; NUNCA em produção/screenshot. O card do Brincar abre o
            PROTÓTIPO (M1R1); a rota do Spike permanece apenas como referência técnica, não navegada. */}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="MonteACenaSpike"
            component={MonteACenaSpikeScreen}
            options={{ headerShown: false }}
          />
        )}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="MonteACenaPrototype"
            component={MonteACenaPrototypeScreen}
            options={{ headerShown: false }}
          />
        )}
        {/* M1R2 — núcleo jogável: o card do Brincar abre a SELEÇÃO DE NÍVEIS (que abre a rodada). */}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="MonteACenaLevels"
            component={MonteACenaLevelSelectScreen}
            options={{ headerShown: false }}
          />
        )}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="MonteACenaGame"
            component={MonteACenaGameScreen}
            options={{ headerShown: false }}
          />
        )}
        {isInternalToolsEnabled() && (
          <Stack.Screen
            name="MonteACenaGameV2"
            component={MonteACenaGameV2Screen}
            options={{ headerShown: false }}
          />
        )}
        {/* Monte a Cena — fluxo OFICIAL user-facing (publicado, aprovado no aparelho / fca92f5):
            Home → Story → Difficulty → TableGame + Gallery ("Meus Quadros", com gate gentil de
            plano DENTRO da tela). Rotas SEMPRE registradas. Spike/Prototype/Levels/Game/GameV2 e
            o Laboratório de gestos permanecem gated pelo Modo Criador (legado técnico). */}
        <Stack.Screen name="MonteACenaHome" component={MonteACenaHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MonteACenaStory" component={MonteACenaStoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MonteACenaDifficulty" component={MonteACenaDifficultyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MonteACenaGallery" component={MonteACenaGalleryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MonteACenaTableGame" component={MonteACenaTableGameScreen} options={{ headerShown: false }} />
        {isInternalToolsEnabled() && (
          <Stack.Screen name="PuzzleGestureLab" component={PuzzleGestureLabScreen} options={{ headerShown: false }} />
        )}
        <Stack.Screen
          name="AtelierGallery"
          component={AtelierGalleryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PostStoryHub"
          component={PostStoryHubScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reflection"
          component={ReflectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LumiMoment"
          component={LumiMomentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ParentArea"
          component={ParentAreaScreen}
          options={({ navigation }) => ({
            title: 'Área dos Pais',
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerLeftContainerStyle,
            headerTitleContainerStyle,
            headerLeft: () => <BackBtn navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="StoryBook"
          component={StoryBookScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FamilyWorship"
          component={CultinhoEmCasaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BeniChest"
          component={BeniChestScreen}
          options={{ headerShown: false }}
        />
        {/* Estrelinhas aberta como push do Stack (ex: modal pós cena) — mantém NarrationScreen na pilha */}
        <Stack.Screen
          name="EstrelinhasCena"
          component={TrophiesScreen}
          options={{ headerShown: false }}
        />
        {/* F2.2b — rota da ferramenta dev de pack sandbox: registrada SÓ sob o duplo gate. */}
        {devPacksEnabled && (
          <Stack.Screen
            name="PackSandboxDev"
            component={PackSandboxDevScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
      {/* M1: FAB packs global REMOVIDO — acesso a packs vive só na seção "Administração (dev)"
          da Área dos Pais (gated por isPackSandboxDevEnabled). Nada de overlay dev em telas públicas. */}
    </NavigationContainer>
  );
}
