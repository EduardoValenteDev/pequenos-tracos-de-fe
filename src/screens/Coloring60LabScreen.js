/**
 * Coloring60LabScreen — BANCADA de encenação do Colorir 60 de "A Criação" (§Parte 12).
 *
 * SÓ DESENVOLVIMENTO. A rota é registrada apenas sob `isInternalToolsEnabled()` e a tela ainda
 * exige, em runtime, `isColoring60LabAllowed()` (build de desenvolvimento **e** Modo Criador
 * ligado). Em produção a ferramenta não existe, não aparece e não é alcançável — sem "esconder
 * botão": a rota sequer é montada.
 *
 * PARA QUE SERVE: os três momentos que só acontecem UMA vez (a primeira conclusão de cada parte,
 * incluindo a grande conclusão 2→3) precisam ser reencenáveis no aparelho real. Aqui se define o
 * ponto de partida (0/3, 1/3, 2/3, 3/3), abre-se qualquer parte já concluída para exercitar a
 * REEDIÇÃO, e apaga-se SÓ o Colorir 60 de "A Criação" — nada de onboarding, perfil, plano, packs,
 * downloads, estrelas, conquistas ou progresso de outras histórias (ver `coloring60LabService`).
 *
 * Esta tela NÃO desenha a experiência da criança: ela só ajusta o ponto de partida e navega para a
 * tela real. Tudo o que a criança vê continua vindo do fluxo real (ColoringScreen + a derivação
 * canônica da jornada) — a bancada nunca simula a festa.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SoundButton from '../components/SoundButton';
import { getColoring60Activities } from '../data/coloring60Catalog';
import {
  isColoring60LabAllowed,
  readColoring60LabState,
  setColoring60LabProgress,
  prepareColoring60LabUpdate,
  clearColoring60Lab,
  COLORING60_LAB_STORY_ID,
} from '../services/coloring60LabService';
import {
  deriveColoring60CardState,
  COLORING60_ACTIVITY_THEME,
} from '../services/coloring60Journey';
import { colors as pt, radii } from '../theme/productTheme';
// [C60-PARTE-7] A bancada abre a MESMA coleção da criança — mesma rota, mesmos parâmetros. Se a
// bancada tivesse um caminho próprio, ela deixaria de testar o que a criança vê.
import { ROUTES } from '../constants/routes';

// O que cada ponto de partida encena — texto curto, para não errar o teste no aparelho.
const PRESETS = [
  { count: 0, label: 'Definir 0 de 3', hint: 'a próxima conclusão encena "0 para 1"' },
  { count: 1, label: 'Definir 1 de 3', hint: 'a próxima conclusão encena "1 para 2"' },
  { count: 2, label: 'Definir 2 de 3', hint: 'a próxima conclusão é a GRANDE CONCLUSÃO (2 para 3)' },
  { count: 3, label: 'Definir 3 de 3', hint: 'encena as reedições e a coleção' },
];

export default function Coloring60LabScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const allowed = isColoring60LabAllowed();
  const [doneMap, setDoneMap] = useState({});
  const [busy, setBusy] = useState(false);

  const activities = getColoring60Activities(COLORING60_LAB_STORY_ID);

  const refresh = useCallback(() => {
    let alive = true;
    readColoring60LabState().then((map) => { if (alive) setDoneMap(map); });
    return () => { alive = false; };
  }, []);

  // Reler ao voltar da tela de colorir: o retrato precisa refletir o que acabou de ser concluído.
  useFocusEffect(refresh);

  if (!allowed) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.blockedTitle}>Ferramenta indisponível</Text>
        <Text style={styles.blockedDesc}>
          A bancada do Colorir 60 só existe em desenvolvimento com o Modo Criador ligado.
        </Text>
        <SoundButton style={styles.secondaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Voltar</Text>
        </SoundButton>
      </View>
    );
  }

  const journey = deriveColoring60CardState({
    doneMap,
    unlocked: true,
    order: activities.map((a) => a.activityId),
  });

  // [C60-PARTE-6] O preset agora pode RECUSAR: uma parte sem pintura real guardada não vira
  // "concluída". Em vez de fabricar um estado que o app nunca produz (a origem de metade dos
  // defeitos deste bloco), a bancada diz exatamente o que falta pintar.
  async function applyPreset(count) {
    if (busy) return;
    setBusy(true);
    const { state, missingArt } = await setColoring60LabProgress(count);
    setDoneMap(state);
    setBusy(false);
    if (missingArt && missingArt.length > 0) {
      const nomes = missingArt
        .map((id) => activities.find((a) => a.activityId === id)?.title ?? id)
        .join(', ');
      Alert.alert(
        'Falta pintura de verdade',
        `Estas partes ainda não têm arte guardada: ${nomes}.\n\nPinte cada uma UMA vez (e toque em "Pronto!") para que a bancada possa semeá-las. Estado semeado sem pintura é justamente o que mascarava os defeitos.`,
        [{ text: 'Entendi' }],
      );
    }
  }

  async function openUpdate(activityId) {
    if (busy) return;
    setBusy(true);
    // Garante que a parte esteja concluída ANTES de abrir: assim salvar cai em reedição (UPDATE).
    await prepareColoring60LabUpdate(activityId);
    setDoneMap(await readColoring60LabState());
    setBusy(false);
    navigation.navigate('Coloring', { storyId: COLORING60_LAB_STORY_ID, activityId });
  }

  // [C60-PARTE-7] Coleção = tela própria, sem atividade de origem. É exatamente esta ausência de
  // parâmetro que a bancada precisa exercitar: a coleção tem de sair idêntica vindo daqui, da tela
  // da história ou do fim de uma parte.
  function openCollection() {
    navigation.navigate(ROUTES.COLORING60_COLLECTION, { storyId: COLORING60_LAB_STORY_ID });
  }

  function confirmClear() {
    Alert.alert(
      'Limpar o Colorir 60 de A Criação?',
      'Usa o MESMO reset de "Gerenciar dados": apaga as três conclusões, as três artes (inclusive os arquivos em disco), a memória de "já concluiu", a grande conclusão vista e o convite do Beni — devolvendo a experiência de primeira vez. Onboarding, perfil, plano, packs, downloads, estrelas, conquistas e o progresso das outras histórias NÃO são tocados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const map = await clearColoring60Lab();
            setDoneMap(map);
            setBusy(false);
          },
        },
      ],
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
        <Text style={styles.headerTitle}>Bancada · Colorir 60</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.state}>
          Estado atual: {journey.progressLabel} concluídas
          {journey.nextIncompleteActivityId
            ? ` · próxima: ${COLORING60_ACTIVITY_THEME[journey.nextIncompleteActivityId] ?? journey.nextIncompleteActivityId}`
            : ' · jornada completa'}
        </Text>
        <View style={styles.stateRow}>
          {activities.map((a) => (
            <View
              key={a.activityId}
              style={[styles.statePill, doneMap[a.activityId] === true && styles.statePillDone]}
            >
              <Text style={[styles.statePillText, doneMap[a.activityId] === true && styles.statePillTextDone]}>
                {COLORING60_ACTIVITY_THEME[a.activityId] ?? a.activityId}
                {doneMap[a.activityId] === true ? ' ✓' : ' —'}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ponto de partida</Text>
        {PRESETS.map((p) => (
          <SoundButton
            key={p.count}
            style={styles.primaryBtn}
            onPress={() => applyPreset(p.count)}
            disabled={busy}
            activeOpacity={0.85}
            accessibilityLabel={p.label}
          >
            <Text style={styles.primaryBtnText}>{p.label}</Text>
            <Text style={styles.primaryBtnHint}>{p.hint}</Text>
          </SoundButton>
        ))}

        <Text style={styles.sectionTitle}>Abrir reedição (a parte já concluída)</Text>
        {activities.map((a) => (
          <SoundButton
            key={a.activityId}
            style={styles.secondaryBtn}
            onPress={() => openUpdate(a.activityId)}
            disabled={busy}
            activeOpacity={0.85}
            accessibilityLabel={`Abrir reedição de ${a.title}`}
          >
            <Text style={styles.secondaryBtnText}>{a.title}</Text>
          </SoundButton>
        ))}

        <Text style={styles.sectionTitle}>Coleção</Text>
        <SoundButton style={styles.secondaryBtn} onPress={openCollection} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Abrir "minha coleção"</Text>
        </SoundButton>

        <Text style={styles.sectionTitle}>Reset</Text>
        <SoundButton style={styles.dangerBtn} onPress={confirmClear} disabled={busy} activeOpacity={0.85}>
          <Text style={styles.dangerBtnText}>Limpar SÓ o Colorir 60 de A Criação</Text>
        </SoundButton>

        <Text style={styles.sectionTitle}>Como usar no iPhone</Text>
        <Text style={styles.howto}>
          1. Área dos Pais → Administração (dev) → "Bancada · Colorir 60".{'\n'}
          2. Toque em "Definir 0 de 3" → volte → abra "A Criação" → "Haja luz" → pinte → Concluir:
          encena a primeira conclusão (1 de 3) com a próxima parte convidada.{'\n'}
          3. Toque em "Vamos para a próxima!" e conclua de novo: encena "1 para 2" (2 de 3).{'\n'}
          4. Toque em "Vamos para a última!" e conclua: encena a GRANDE CONCLUSÃO (3 de 3).{'\n'}
          5. Para reedição com progresso incompleto: "Definir 1 de 3" → "Abrir reedição · Haja luz"
          → pinte qualquer coisa → Concluir.{'\n'}
          6. Para reedição com tudo pronto: "Definir 3 de 3" → abra qualquer reedição → Concluir.{'\n'}
          7. "Limpar" devolve tudo ao zero para repetir a sequência do começo.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pt.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: 10,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: pt.border,
  },
  headerBack: { paddingVertical: 6, paddingHorizontal: 8, marginRight: 6 },
  headerBackText: { fontFamily: 'Nunito', fontSize: 15, fontWeight: '800', color: pt.faithBlue },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 17, color: pt.text },

  state: { fontFamily: 'Nunito', fontSize: 14, color: pt.text, fontWeight: '700' },
  stateRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  statePill: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radii.pill, backgroundColor: pt.lockedBg,
  },
  statePillDone: { backgroundColor: pt.freeBg },
  statePillText: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '800', color: pt.lockedText },
  statePillTextDone: { color: pt.freeText },

  sectionTitle: {
    fontFamily: 'FredokaOne', fontSize: 14, color: pt.textSoft,
    marginTop: 18, marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: '#FFF', borderRadius: radii.md,
    borderWidth: 1.5, borderColor: pt.border,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8,
  },
  primaryBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  primaryBtnHint: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 2 },
  secondaryBtn: {
    backgroundColor: '#FFF', borderRadius: radii.md,
    borderWidth: 1.5, borderColor: pt.border,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8,
  },
  secondaryBtnText: { fontFamily: 'Nunito', fontSize: 14.5, fontWeight: '800', color: pt.text },
  dangerBtn: {
    backgroundColor: '#FFF', borderRadius: radii.md,
    borderWidth: 1.5, borderColor: pt.danger,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  dangerBtnText: { fontFamily: 'Nunito', fontSize: 14.5, fontWeight: '800', color: pt.danger },

  howto: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 20 },

  blockedTitle: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, textAlign: 'center' },
  blockedDesc: {
    fontFamily: 'Nunito', fontSize: 14, color: pt.textSoft,
    textAlign: 'center', marginTop: 8, marginBottom: 18,
  },
});
