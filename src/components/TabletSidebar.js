import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getAvatarImage, getProfileAvatarSkinTone } from '../data/avatars';
import AvatarImage from './AvatarImage';
import { useProfile } from '../context/ProfileContext';
import BeniCircularArt from './common/BeniCircularArt';
import FaithIcon from './ui/FaithIcon';
import { registerGuideTarget } from '../services/guideTargetRegistry';

/**
 * Bloco 1.2 — `name` é a IDENTIDADE DE ROTA (onTabPress navega por ela): não muda.
 * `label` é o que o usuário lê. Emoji saiu: ícone semântico via FaithIcon.
 */
const TABS = [
  { name: 'Início',      label: 'Início',      faithIcon: 'home' },
  { name: 'Aventuras',   label: 'Aventuras',   faithIcon: 'adventures' },
  { name: 'Ateliê',      label: 'Brincar',     faithIcon: 'brincar' },
  { name: 'Estrelinhas', label: 'Estrelinhas', faithIcon: 'trophies' },
  { name: 'Perfil',      label: 'Perfil',      faithIcon: 'profile' },
];

export default function TabletSidebar({ activeTab, onTabPress, totalStars, maxStars }) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();

  const starsPercent = maxStars > 0 ? Math.min(totalStars / maxStars, 1) : 0;
  const greeting = profile.name ? `Olá, ${profile.name}!` : 'Olá!';

  function starsLabel(n) {
    return n === 1 ? '1 estrela' : `${n} estrelas`;
  }

  return (
    <View
      style={[
        styles.sidebar,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      {/* Área do perfil */}
      <View style={styles.profileArea}>
        <View style={styles.lumiRow}>
          <View style={styles.avatarCircle}>
            <AvatarImage source={getAvatarImage(profile.avatarId, getProfileAvatarSkinTone(profile, profile.avatarId))} size={56} />
          </View>
          <BeniCircularArt
            variant="avatarBase"
            size={30}
            backgroundColor="#FFF8EF"
            borderColor={colors.primary + '40'}
            borderWidth={2}
            showShadow={false}
            style={styles.lumiBadge}
            accessibilityLabel="Beni"
          />
        </View>
        <Text style={styles.greeting} numberOfLines={1}>{greeting}</Text>
        {/* Bloco 1.2: emoji ⭐ trocado por ícone semântico. */}
        <View style={styles.starsRow}>
          <FaithIcon name="star" size={14} color={colors.primary} />
          <Text style={styles.stars}>{starsLabel(totalStars)} alcançadas</Text>
        </View>
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, { width: `${starsPercent * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{totalStars}/{maxStars}</Text>
      </View>

      {/* Botões de navegação */}
      <View style={styles.navButtons}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.name;
          const btn = (
            <TouchableOpacity
              style={[styles.navButton, isActive && styles.navButtonActive]}
              onPress={() => onTabPress(tab.name)}
              activeOpacity={0.75}
            >
              <View style={styles.navIcon}>
                <FaithIcon
                  name={tab.faithIcon}
                  size={isActive ? 24 : 21}
                  color={isActive ? colors.primary : colors.textLight}
                />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
          // Itens que viram ALVO medível dos guias na sidebar do tablet:
          //   Aventuras → Card 2 do tour de Aventuras · Início → Card 1 do guia da Home.
          const sidebarTargetName =
            tab.name === 'Aventuras' ? 'adventures.sidebarTab'
              : tab.name === 'Início' ? 'home.sidebarTab'
                : tab.name === 'Ateliê' ? 'atelier.sidebarTab'
                  : tab.name === 'Estrelinhas' ? 'stars.sidebarTab'
                    : tab.name === 'Perfil' ? 'profile.sidebarTab'
                      : null;
          if (sidebarTargetName) {
            return (
              <View key={tab.name} collapsable={false} ref={registerGuideTarget(sidebarTargetName)}>
                {btn}
              </View>
            );
          }
          return <View key={tab.name}>{btn}</View>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: colors.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    paddingHorizontal: 10,
  },

  profileArea: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12,
  },
  lumiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '50',
  },
  // O círculo/borda/fundo vêm de BeniCircularArt; aqui só a posição relativa.
  lumiBadge: {
    marginLeft: -10,
  },
  greeting: {
    fontFamily: 'FredokaOne',
    fontSize: 15,
    color: colors.text,
    marginBottom: 3,
    textAlign: 'center',
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  stars: {
    fontFamily: 'Nunito',
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
  progressOuter: {
    width: '90%',
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressInner: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: 'Nunito',
    fontSize: 10,
    color: colors.textLight,
  },

  navButtons: { gap: 2 },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 10,
  },
  navButtonActive: {
    backgroundColor: colors.activeBg,
  },
  // Bloco 1.2: ícone semântico (FaithIcon) no lugar do emoji.
  navIcon: { width: 26, alignItems: 'center', justifyContent: 'center' },
  navLabel: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  navLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
