/**
 * ColoringQaScreen — Galeria de QA do Ateliê de Colorir (SÓ Modo Criador / dev).
 *
 * Lista TODOS os desenhos de colorir do app (por história e cena) com status
 * (encontrado / ausente) + miniatura, e abre qualquer um no Ateliê de Colorir em
 * modo QA — passando route param `qa: true`, que faz o ColoringScreen pular o
 * bloqueio APENAS quando o Modo Criador está ativo. Independe de progresso, plano
 * ou conclusão.
 *
 * Segurança: é SÓ leitura (manifesto coloringImages) + navegação. NÃO altera
 * progresso, paywall, conquistas, nem marca história como concluída/desbloqueada.
 * Fica restrita ao ambiente do Criador (isCreatorQaModeAllowed): a entrada vive na
 * seção "Ferramentas do Criador" da Área dos Pais (já protegida).
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stories } from '../data/stories';
import { getColoringImage } from '../assets/coloringImages';
import { isCreatorQaModeAllowed } from '../services/creatorQaMode';
import SoundButton from '../components/SoundButton';

export default function ColoringQaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const allowed = isCreatorQaModeAllowed();

  // Para cada história, as cenas reais (stories.js) e se há imagem de colorir.
  const data = useMemo(
    () =>
      stories.map((story) => {
        const cenas = Array.isArray(story.cenas) ? story.cenas : [];
        const scenes = cenas.map((c, index) => ({
          sceneId: c.id,
          index,
          source: getColoringImage(story.id, c.id),
        }));
        const found = scenes.filter((s) => s.source != null).length;
        return { story, scenes, found, total: scenes.length };
      }),
    [],
  );

  const totals = useMemo(() => {
    const totalFound = data.reduce((a, d) => a + d.found, 0);
    const totalScenes = data.reduce((a, d) => a + d.total, 0);
    const storiesWith = data.filter((d) => d.found > 0).length;
    return { totalFound, totalScenes, storiesWith, totalStories: data.length };
  }, [data]);

  const openScene = (story, index) =>
    navigation.navigate('Coloring', { story, cenaIndex: index, qa: true, from: 'qa' });

  // Defesa: se o ambiente não permite Modo Criador, não mostra a galeria.
  if (!allowed) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.blockedTitle}>Ferramenta indisponível</Text>
        <Text style={styles.blockedDesc}>
          Esta galeria de QA só existe no Modo Criador / ambiente de desenvolvimento.
        </Text>
        <SoundButton style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </SoundButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) + 4 }]}>
        <SoundButton
          style={styles.headerBack}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
          activeOpacity={0.8}
        >
          <Text style={styles.headerBackText}>‹ Voltar</Text>
        </SoundButton>
        <Text style={styles.headerTitle}>Testar Desenhos (QA)</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.summary}>
          {totals.storiesWith}/{totals.totalStories} histórias com colorir ·{' '}
          {totals.totalFound}/{totals.totalScenes} cenas encontradas
        </Text>
        <Text style={styles.hint}>
          Toque para abrir no Ateliê de Colorir (modo QA). Não altera progresso, plano nem conquistas.
        </Text>

        {data.map(({ story, scenes, found, total }) => (
          <View key={story.id} style={styles.storyBlock}>
            <View style={styles.storyHeader}>
              <Text style={styles.storyTitle} numberOfLines={1}>{story.titulo}</Text>
              <Text style={[styles.storyCount, found === 0 && styles.storyCountEmpty]}>
                {found === 0 ? 'sem desenhos' : `${found}/${total}`}
              </Text>
            </View>

            <View style={styles.grid}>
              {scenes.map((s) => {
                const ok = s.source != null;
                return (
                  <SoundButton
                    key={s.sceneId}
                    disabled={!ok}
                    style={[styles.cell, !ok && styles.cellMissing]}
                    onPress={() => openScene(story, s.index)}
                    accessibilityLabel={`${story.titulo} cena ${s.sceneId}${ok ? '' : ' (ausente)'}`}
                    activeOpacity={0.85}
                  >
                    {ok ? (
                      <Image source={s.source} style={styles.thumb} resizeMode="contain" />
                    ) : (
                      <View style={styles.thumbMissing}>
                        <Text style={styles.thumbMissingText}>⚠</Text>
                      </View>
                    )}
                    <Text style={[styles.cellLabel, !ok && styles.cellLabelMissing]}>
                      {ok ? s.sceneId : `${s.sceneId} ausente`}
                    </Text>
                  </SoundButton>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const PARCHMENT = '#F3E8CE';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PARCHMENT },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  blockedTitle: { fontFamily: 'FredokaOne', fontSize: 20, color: '#5A4420', marginBottom: 8 },
  blockedDesc: { fontFamily: 'Nunito', fontSize: 14, color: '#7A6238', fontWeight: '700', textAlign: 'center' },
  backBtn: { marginTop: 18, backgroundColor: '#5A4420', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 22 },
  backBtnText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: '#FFF1D6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
    backgroundColor: '#E8D3A6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,90,40,0.22)',
  },
  headerBack: { paddingVertical: 4, paddingRight: 12 },
  headerBackText: { fontFamily: 'Nunito', fontSize: 14, fontWeight: '800', color: '#5A4420' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: '#5A4420' },
  summary: { fontFamily: 'Nunito', fontSize: 13.5, fontWeight: '800', color: '#5A4420', marginBottom: 2 },
  hint: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '700', color: '#8A7A5E', marginBottom: 12 },
  storyBlock: { marginBottom: 16 },
  storyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  storyTitle: { flex: 1, fontFamily: 'FredokaOne', fontSize: 14, color: '#5A4420' },
  storyCount: { fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#3C8C5A', marginLeft: 8 },
  storyCountEmpty: { color: '#B5562E' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: 64,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  cellMissing: { opacity: 0.85 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(120,90,40,0.25)',
  },
  thumbMissing: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F5E2C8',
    borderWidth: 1,
    borderColor: 'rgba(181,86,46,0.5)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbMissingText: { fontSize: 18, color: '#B5562E' },
  cellLabel: { fontFamily: 'Nunito', fontSize: 11, fontWeight: '800', color: '#6B5A3E', marginTop: 3 },
  cellLabelMissing: { color: '#B5562E', fontSize: 9.5 },
});
