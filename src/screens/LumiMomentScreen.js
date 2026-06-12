import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { colors } from '../theme/colors';
import SoundButton from '../components/SoundButton';
import { LUMI_MOMENT_MESSAGES } from '../data/lumiReflections';
import {
  isLumiMomentDoneToday,
  markLumiMomentDoneToday,
  markLumiMomentEverDone,
  addBonusStars,
} from '../services/postStoryStorage';
import BeniAvatar from '../components/beni/BeniAvatar';

function dayIndex(listLength) {
  return Math.floor(Date.now() / 86400000) % listLength;
}

export default function LumiMomentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const msg = LUMI_MOMENT_MESSAGES[dayIndex(LUMI_MOMENT_MESSAGES.length)];

  const [done, setDone] = useState(false);
  const [starGranted, setStarGranted] = useState(false);

  useEffect(() => {
    isLumiMomentDoneToday().then(setDone);
  }, []);

  // A6: "Momento com Beni" é grátis no MVP — sem trava de plano aqui.

  async function handleComplete() {
    if (!done) {
      await markLumiMomentDoneToday();
      await markLumiMomentEverDone();
      await addBonusStars(1);
      setStarGranted(true);
      setDone(true);
    } else {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#A78BFA', '#7C3AED']}
          style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}
        >
          {/* Header ÚNICO (o header nativo está desligado nesta rota).
              Contextual: Voltar quando há pilha; Início quando veio direto da Home. */}
          <View style={styles.headerNav}>
            {navigation.canGoBack() ? (
              <SoundButton style={styles.headerNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={styles.headerNavText}>← Voltar</Text>
              </SoundButton>
            ) : (
              <SoundButton style={styles.headerNavBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.7}>
                <Text style={styles.headerNavText}>🏠 Início</Text>
              </SoundButton>
            )}
          </View>
          <View style={styles.headerContent}>
            <BeniAvatar variant="praying" size="medium" style={styles.headerBeni} />
            <Text style={styles.headerTitle}>Momento com Beni</Text>
            {starGranted ? (
              <Text style={styles.headerStar}>+1 ⭐ estrela ganha hoje!</Text>
            ) : done ? (
              <Text style={styles.headerDone}>✓ Você já fez o momento de hoje</Text>
            ) : (
              <Text style={styles.headerSub}>+1 ⭐ ao completar (uma vez por dia)</Text>
            )}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Daily message */}
          <View style={styles.messageCard}>
            <Text style={styles.lumiLabel}>✨ Beni diz:</Text>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>

          {/* Verse */}
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>"{msg.verse}"</Text>
            <Text style={styles.verseRef}>{msg.verseRef}</Text>
          </View>

          {/* Repeat prompt */}
          <Text style={styles.repeatLabel}>Repita com Beni:</Text>
          <View style={styles.repeatCard}>
            <Text style={styles.repeatText}>"{msg.verse}"</Text>
          </View>

          <SoundButton
            style={[styles.doneBtn, done && !starGranted && styles.doneBtnGray]}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>
              {starGranted ? '⭐ Concluído! Voltar' : done ? 'Fechar' : '✓ Completar (+1 ⭐)'}
            </Text>
          </SoundButton>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: pt.background },

  header: {
    paddingHorizontal: 24, paddingBottom: 28,
  },
  headerNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', marginBottom: 16,
  },
  headerNavBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  headerNavText: { fontFamily: 'Nunito', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
  headerContent: { alignItems: 'center', width: '100%' },
  headerEmoji: { fontSize: 52, marginBottom: 8 },
  headerBeni: { marginBottom: 8 },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 24, color: '#FFF', marginBottom: 6 },
  headerSub: { fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  headerStar: { fontFamily: 'FredokaOne', fontSize: 16, color: '#FFD166' },
  headerDone: { fontFamily: 'Nunito', fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  body: { padding: 20 },

  messageCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg, padding: 18,
    borderLeftWidth: 4, borderLeftColor: '#A78BFA',
    marginBottom: 14, ...shadows.soft,
  },
  lumiLabel: {
    fontFamily: 'Nunito', fontSize: 11, color: '#7C3AED',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  messageText: {
    fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, lineHeight: 26,
  },

  verseCard: {
    backgroundColor: '#F5F0FF',
    borderRadius: radii.lg, padding: 18,
    marginBottom: 16, ...shadows.soft,
    alignItems: 'center',
  },
  verseText: {
    fontFamily: 'Nunito', fontSize: 16, color: pt.text,
    fontStyle: 'italic', lineHeight: 24, textAlign: 'center', marginBottom: 8,
  },
  verseRef: {
    fontFamily: 'Nunito', fontSize: 12, color: '#7C3AED', fontWeight: '700',
  },

  repeatLabel: {
    fontFamily: 'FredokaOne', fontSize: 14, color: pt.text, marginBottom: 8,
  },
  repeatCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.md, padding: 16,
    borderWidth: 1.5, borderColor: '#A78BFA',
    marginBottom: 24,
  },
  repeatText: {
    fontFamily: 'Nunito', fontSize: 15, color: '#7C3AED',
    fontStyle: 'italic', lineHeight: 22, fontWeight: '700',
    textAlign: 'center',
  },

  doneBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center',
    elevation: 4, shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,
  },
  doneBtnGray: {
    backgroundColor: pt.border, elevation: 0, shadowOpacity: 0,
  },
  doneBtnText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
});
