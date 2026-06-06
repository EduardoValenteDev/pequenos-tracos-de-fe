import React, { useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import TabletSidebar from '../components/TabletSidebar';
import FaithIcon from '../components/ui/FaithIcon';
import { useProgressContext } from '../context/ProgressContext';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import StoriesScreen from '../screens/StoriesScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import NarrationScreen from '../screens/NarrationScreen';
import ColoringScreen from '../screens/ColoringScreen';
import CongratsScreen from '../screens/CongratsScreen';
import TrophiesScreen from '../screens/TrophiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AtelierScreen from '../screens/AtelierScreen';
import AtelierCanvasScreen from '../screens/AtelierCanvasScreen';
import AtelierGalleryScreen from '../screens/AtelierGalleryScreen';
import PostStoryHubScreen from '../screens/PostStoryHubScreen';
import QuizScreen from '../screens/QuizScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import LumiMomentScreen from '../screens/LumiMomentScreen';
import ParentAreaScreen from '../screens/ParentAreaScreen';
import StoryBookScreen from '../screens/StoryBookScreen';

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
  { name: 'Aventuras',  faithIcon: 'adventures', component: StoriesScreen, defaultParams: { nivel: 'pequeninos' } },
  { name: 'Ateliê',     faithIcon: 'atelier',    component: AtelierScreen },
  { name: 'Estrelinhas', faithIcon: 'trophies',   component: TrophiesScreen },
  { name: 'Perfil',     faithIcon: 'profile',    component: ProfileScreen },
];

function TabIcon({ iconName, focused }) {
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
  const [activeTabName, setActiveTabName] = useState('Início');
  const { progressSummary } = useProgressContext();
  const totalStars = progressSummary?.totalStars ?? 0;
  const maxStars = progressSummary?.maxTotalStars ?? 0;

  const activeTab = TAB_DEFS.find(t => t.name === activeTabName) ?? TAB_DEFS[0];
  const ActiveComponent = activeTab.component;

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <TabletSidebar
        activeTab={activeTabName}
        onTabPress={setActiveTabName}
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

// Navegação inferior para celular com safe area corrigida
function MobileTabs() {
  const insets = useSafeAreaInsets();
  return (
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
            tabBarAccessibilityLabel: tab.name,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// Entrada do layout principal — decide entre tablet e celular
function MainTabs({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  return isTablet ? <TabletLayout navigation={navigation} /> : <MobileTabs />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
            title: route.params?.story?.titulo || 'Detalhes',
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
          name="Narration"
          component={NarrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Coloring"
          component={ColoringScreen}
          options={{ headerShown: false }}
        />
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
          options={({ navigation: nav }) => ({
            title: 'Momento com Beni',
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerLeftContainerStyle,
            headerTitleContainerStyle,
            headerLeft: () => <BackBtn navigation={nav} />,
            headerRight: () => <HomeBtn navigation={nav} />,
          })}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
