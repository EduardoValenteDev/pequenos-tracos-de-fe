import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as pt, radii, shadows } from '../../theme/productTheme';
import { colors } from '../../theme/colors';
import { hasAccess } from '../../services/accessControl';
import SoundButton from '../SoundButton';
import StoryCoverImage from './StoryCoverImage';

export default function NextAdventureCard({ story, onPress, label = 'Próxima aventura', buttonLabel }) {
  if (!story) return null;

  const accessible = hasAccess(story);
  const isPremium = story.accessType === 'premium';
  const btnLabel = buttonLabel ?? (accessible ? 'Começar →' : 'Conhecer aventura →');

  return (
    <View style={styles.card}>
      <StoryCoverImage
        story={story}
        rounded={false}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={styles.nextLabel}>{label}</Text>
        <Text style={styles.title} numberOfLines={2}>{story.titulo}</Text>
        <Text style={styles.ref} numberOfLines={1}>{story.referencia}</Text>
        {isPremium && !accessible && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Especial da Família</Text>
          </View>
        )}
      </View>
      <SoundButton style={styles.btn} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.btnText}>{btnLabel}</Text>
      </SoundButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    marginHorizontal: 16, marginBottom: 14,
    overflow: 'hidden',
    ...shadows.card,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  cover: {
    borderRadius: 0,
  },
  info: { padding: 14 },
  nextLabel: {
    fontFamily: 'Nunito', fontSize: 11, color: colors.primary,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2,
  },
  title: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 2,
  },
  ref: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.muted, fontStyle: 'italic',
  },
  premiumBadge: {
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: pt.goldSoft, borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  premiumText: {
    fontFamily: 'Nunito', fontSize: 11, color: pt.premiumText, fontWeight: '700',
  },
  btn: {
    margin: 14, marginTop: 4,
    backgroundColor: colors.action,
    borderRadius: radii.pill, paddingVertical: 12, alignItems: 'center',
    elevation: 3, shadowColor: colors.action,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  btnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },
});
