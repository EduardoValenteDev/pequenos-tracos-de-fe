/**
 * Coloring60CollectionScreen.js — A COLEÇÃO como LUGAR (C60 · Partes 7, 8 e 9).
 *
 * O QUE ESTAVA ERRADO (evidência física do fundador, itens 1, 2, 3, 4, 12 e 13). A coleção era uma
 * CAMADA aberta por cima do desenho que estava sendo pintado. Consequências observadas no aparelho:
 *   • a obra atual ficava GIGANTE atrás da coleção (às vezes colorida, às vezes só o contorno);
 *   • o fundo mudava de cor conforme a parte de origem (Luz dourado, Vida verde, Cuidado coral) —
 *     a mesma coleção parecia três coleções diferentes;
 *   • os textos caíam SOBRE a arte e perdiam legibilidade;
 *   • a composição inteira dependia de por onde a criança entrou.
 *
 * A CORREÇÃO É ESTRUTURAL, não cosmética: a coleção virou uma TELA PRÓPRIA, com rota própria. Ela não
 * conhece canvas, não recebe pintura em memória e não tem "esta parte" — por isso o resultado é
 * IDÊNTICO vindo da conclusão, do cartão da história ou da bancada de desenvolvimento. Regras visuais
 * que este arquivo cumpre e que não podem regredir:
 *   • fundo NEUTRO (creme, gradiente suave) — nunca a cor temática de uma das partes;
 *   • nenhum texto desenhado SOBRE uma obra; todo texto vive em superfície sólida própria;
 *   • as três obras ficam visíveis ao mesmo tempo, cada uma no seu contêiner, na mesma proporção;
 *   • sem cartão branco gigante cobrindo a tela e sem a obra atual ampliada ao fundo.
 *
 * HIDRATAÇÃO ATÔMICA (Parte 8). Enquanto a coleção carrega, a tela mostra TRÊS espaços neutros e a
 * linha "Montando sua coleção..." — JAMAIS o contorno sem cor. O contorno só aparece COMPOSTO com a
 * pintura, quando as duas imagens já carregaram. As três obras entram JUNTAS, num crossfade curto:
 * era o "aparece sem cor e depois recupera a pintura" (evidência 5) que isto elimina.
 *
 * INTEGRIDADE (Partes 4 e 9). A tela LÊ o retrato gravado e o RECONCILIA com o que existe de fato no
 * disco (`reconcileSnapshotStatus`): concluída sem arte recuperável é QUEBRA DE INTEGRIDADE e não é
 * contada — não existe "3 de 3" sem três obras. Limpar uma parte concluída faz o contador cair aqui
 * na volta, porque a contagem vem de `countsAsComplete`, nunca de um booleano solto.
 *
 * O que esta tela NÃO faz: não conclui atividade, não concede recompensa, não repete a grande
 * conclusão, não escreve NADA. Ela só lê, compõe e oferece duas saídas.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, StyleSheet, Animated, ScrollView, useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../components/SoundButton';
import BeniMascotImage from '../components/common/BeniMascotImage';
import { colors, radii, shadows } from '../theme/productTheme';
import { getColoring60Activities } from '../data/coloring60Catalog';
import {
  resolveColoring60Lineart,
  COLORING60_RESOLUTION_STATUS,
} from '../services/coloring60Resolver';
import { loadColoring60JourneyRecord } from '../services/coloring60ActivityService';
import { getColoring60SavedDrawing } from '../services/coloring60DrawingStorage';
import { snapshotHasMeaningfulColor } from '../services/coloring60PaintMetrics';
// [C60-PARTE-6] O reset canônico avisa quem tem cache em memória. Sem isto, apagar tudo em
// "Gerenciar dados" deixaria esta tela exibindo a coleção antiga até uma navegação nova.
import { subscribeColoring60Reset } from '../services/coloring60ResetService';
import {
  HYDRATION_STATUS,
  SNAPSHOT_STATUS,
  reconcileSnapshotStatus,
  deriveColoring60ActivityState,
  deriveColoring60JourneyState,
} from '../services/coloring60State';
import {
  deriveColoring60CollectionView,
  COLORING60_ACTION,
  COLORING60_COLLECTION_MESSAGE,
  COLORING60_COLLECTION_LOADING,
} from '../services/coloring60Journey';
import {
  parseDrawingPayload,
  isPositionedPayload,
  toArtVisual,
  computePaintStyle,
  computeLineartStyle,
} from '../components/coloring60/coloring60ArtComposition';
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';
import { ROUTES } from '../constants/routes';

// Rótulo curto de cada parte, EXIBIDO SOB a obra (nunca por cima). Mesma nomenclatura da celebração.
const MARKERS = { light: 'Luz', living_world: 'Vida', people_and_care: 'Cuidado' };

// Estados possíveis de UM espaço da coleção. Só `art` desenha imagem; nenhum outro estado usa o
// contorno sozinho — um contorno sem cor no lugar da obra é justamente a mentira que a Parte 8 proíbe.
const SLOT = Object.freeze({
  ART: 'art',                 // pintura recuperável: cor + contorno compostos
  NOT_PERSISTED: 'notPersisted', // concluída, mas o plano atual não guarda os pixels
  NEEDS_COLOR: 'needsColor',  // quebra de integridade: concluída sem arte recuperável
  EMPTY: 'empty',             // ainda não concluída
});

// Teto de espera das imagens. Estourado, a tela REVELA mesmo assim: os espaços que não chegaram caem
// no estado honesto, e a criança nunca fica presa num carregamento infinito.
const COLLECTION_ART_TIMEOUT_MS = 7000;

// [C60-P8-CACHE] Cache em MEMÓRIA (Parte 8), invalidado pela ASSINATURA de revisão: id + situação do
// instantâneo + tamanho do payload de cada parte. Ele NÃO guarda arte: guarda apenas a informação de
// que ESTA revisão já foi revelada nesta sessão — e então a volta à coleção não repete a espera nem o
// carregamento (as imagens já estão quentes no cache do RN). Qualquer pintura nova, limpeza ou
// mudança de plano muda a assinatura, o cache é descartado e a hidratação atômica volta a valer.
let collectionCache = null; // { storyId, signature, revealed }

/** Gate do piloto — a MESMA regra da tela de colorir (flag oficial OU dev com ferramentas internas). */
function isColoring60PilotAllowed() {
  if (COLORIR_60_CREATION_PILOT_ENABLED) return true;
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev && isInternalToolsEnabled();
}

function signatureOf(slots) {
  return slots.map((s) => `${s.activityId}:${s.snapshotStatus}:${s.paint ? s.paint.length : 0}`).join('|');
}

/**
 * loadCollectionSlots(storyId) — LEITURA ÚNICA e completa: retrato de conclusão (um multiGet) +
 * pintura guardada de cada parte + contorno oficial. Devolve os espaços já reconciliados. Nunca
 * escreve; qualquer falha vira estado honesto (nunca uma obra inventada).
 */
async function loadCollectionSlots(storyId) {
  const activities = getColoring60Activities(storyId); // ordem fechada: Luz · Vida · Cuidado
  const ids = activities.map((a) => a.activityId);
  const record = await loadColoring60JourneyRecord(storyId, ids);
  // Sem conseguir ler o registro, TODOS os espaços cairiam em "Ainda falta colorir" — a coleção
  // apagaria três obras existentes na tela. Falha de leitura vira ERRO honesto (o `.catch` da
  // hidratação leva ao estado de erro, com caminho de volta), nunca uma coleção vazia inventada.
  if (record.readFailed === true) {
    throw new Error('coloring60: leitura da coleção indisponível');
  }
  const byId = new Map((record.activities || []).map((a) => [a.activityId, a]));

  const slots = await Promise.all(activities.map(async (a) => {
    const stored = byId.get(a.activityId) || {};
    let paint = null;
    try {
      const saved = await getColoring60SavedDrawing(storyId, a.activityId);
      if (snapshotHasMeaningfulColor(saved)) paint = saved;
    } catch (err) {
      if (__DEV__) console.log(`[Coloring60] coleção: leitura de ${a.activityId} falhou:`, err?.message);
    }
    const snapshotStatus = reconcileSnapshotStatus(stored.storedSnapshotStatus, paint != null);
    const res = resolveColoring60Lineart(storyId, a.activityId);
    const lineart = res.status === COLORING60_RESOLUTION_STATUS.AVAILABLE ? res.source : null;
    return {
      activityId: a.activityId,
      title: a.title,
      marker: MARKERS[a.activityId] ?? a.title,
      isCurrentlyComplete: stored.isCurrentlyComplete === true,
      hasEverCompleted: stored.hasEverCompleted === true,
      snapshotStatus,
      paint: paint && lineart ? paint : null, // sem contorno não há composição possível
      lineart,
    };
  }));

  return { slots, finaleSeen: record.finaleSeen === true };
}

/**
 * Estado visual de UM espaço, derivado do modelo canônico (nunca de um booleano solto).
 * A ordem importa: a coleção reflete `isCurrentlyComplete` (Parte 9). Uma parte que NÃO está
 * concluída agora aparece como espaço vazio mesmo que exista pintura antiga no disco — é isso que
 * impede a obra limpa de continuar exposta como se nada tivesse acontecido.
 */
function slotKindOf(slot, state) {
  if (state.isCurrentlyComplete !== true) return SLOT.EMPTY;
  if (slot.paint && slot.lineart && slot.snapshotStatus === SNAPSHOT_STATUS.READY) return SLOT.ART;
  if (slot.snapshotStatus === SNAPSHOT_STATUS.NOT_PERSISTED) return SLOT.NOT_PERSISTED;
  return SLOT.NEEDS_COLOR; // concluída sem arte recuperável = integridade quebrada (Parte 8)
}

// ─────────────────────────────────────────────────────────────────────────────
// UM espaço da coleção. Contêiner PRÓPRIO, proporção fixa (4:5, a mesma dos linearts 1122×1402) e
// rótulo SOB a obra. Quando há pintura, compõe cor + contorno (multiply) e avisa o pai assim que as
// DUAS imagens carregam — é o pai quem revela as três juntas.
// ─────────────────────────────────────────────────────────────────────────────
function CollectionSlot({ slot, kind, cardW, cardH, onSettled }) {
  const artW = cardW - 6;
  const artH = cardH - 6;
  const parsed = kind === SLOT.ART ? parseDrawingPayload(slot.paint) : null;
  const positioned = isPositionedPayload(parsed);
  const visual = parsed ? toArtVisual(parsed, slot.lineart) : null;
  const paintStyle = positioned ? computePaintStyle(artW, artH, visual) : null;
  const lineartStyle = positioned ? computeLineartStyle(artW, artH, visual) : null;

  const loadedRef = useRef({ paint: false, lineart: false, done: false });

  // Espaço sem arte já nasce resolvido: nada a carregar, nada a esperar.
  useEffect(() => {
    if (kind !== SLOT.ART) onSettled(slot.activityId, true);
  }, [kind, slot.activityId]);

  function report(which, ok) {
    const st = loadedRef.current;
    if (st.done) return;
    if (!ok) { st.done = true; onSettled(slot.activityId, false); return; }
    st[which] = true;
    if (st.paint && st.lineart) { st.done = true; onSettled(slot.activityId, true); }
  }

  const emptyText = kind === SLOT.NOT_PERSISTED
    ? 'Você coloriu esta parte!'
    : (kind === SLOT.NEEDS_COLOR ? 'Precisa de cor de novo' : 'Ainda falta colorir');

  const a11y = kind === SLOT.ART
    ? `${slot.marker}: obra colorida por você`
    : `${slot.marker}: ${emptyText}`;

  return (
    <View style={styles.slotCol} accessible accessibilityLabel={a11y}>
      <View style={[styles.slotFrame, { width: cardW, height: cardH }]}>
        <View style={[styles.slotPaper, { width: artW, height: artH }]}>
          {kind === SLOT.ART ? (
            <>
              <Image
                source={{ uri: visual.paintUri }}
                style={positioned && paintStyle ? paintStyle : StyleSheet.absoluteFill}
                resizeMode={positioned ? 'stretch' : 'contain'}
                fadeDuration={0}
                onLoad={() => report('paint', true)}
                onError={() => report('paint', false)}
              />
              <Image
                source={slot.lineart}
                style={positioned && lineartStyle
                  ? [lineartStyle, styles.multiply]
                  : [StyleSheet.absoluteFill, styles.multiply]}
                resizeMode={positioned ? 'stretch' : 'contain'}
                fadeDuration={0}
                onLoad={() => report('lineart', true)}
                onError={() => report('lineart', false)}
              />
            </>
          ) : (
            // Estado honesto: NUNCA o contorno sozinho no lugar da obra.
            <View style={styles.slotEmpty}>
              <Text style={styles.slotEmptyText}>{emptyText}</Text>
            </View>
          )}
        </View>
      </View>
      {/* Rótulo SOB a obra, em superfície própria — nenhum texto sobre a arte. */}
      <View style={styles.slotLabelPill}>
        <Text style={styles.slotLabelText} numberOfLines={1}>{slot.marker}</Text>
      </View>
    </View>
  );
}

export default function Coloring60CollectionScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const storyId = route?.params?.storyId ?? null;
  const allowed = isColoring60PilotAllowed() && getColoring60Activities(storyId).length > 0;

  const [status, setStatus] = useState(HYDRATION_STATUS.LOADING);
  const [slots, setSlots] = useState([]);
  const [journey, setJourney] = useState(null);
  const [view, setView] = useState(null);
  // Os espaços neutros só somem DEPOIS do crossfade terminar — desmontá-los junto com o início da
  // animação deixaria a obra aparecendo sobre o fundo vazio (o "flash" que a Parte 8 proíbe).
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const settledRef = useRef(new Set());
  const activeRef = useRef(true);
  // Geração da hidratação: cada leitura carimba a sua e só aplica o resultado se ainda for a mais
  // recente. Sem isso, uma leitura antiga ainda em voo (foco seguido de reset, por exemplo) poderia
  // pousar DEPOIS da nova e repor a coleção velha — o retrato errado, sem erro nenhum aparente.
  const hydrationIdRef = useRef(0);

  useEffect(() => () => { activeRef.current = false; }, []);

  const cardW = Math.max(84, Math.floor((Math.min(width, 560) - 36 - 20) / 3));
  const cardH = Math.round(cardW * 1.25);

  // [C60-P8-HYDRATION] Carrega ao FOCAR: voltar de "Colorir novamente" (ou de uma limpeza) precisa
  // refletir o estado NOVO, não o retrato de quando a tela montou (Parte 9).
  const hydrate = useCallback(() => {
    if (!allowed) { setStatus(HYDRATION_STATUS.ERROR); return undefined; }
    hydrationIdRef.current += 1;
    const runId = hydrationIdRef.current;
    const isCurrent = () => activeRef.current && hydrationIdRef.current === runId;
    settledRef.current = new Set();
    revealAnim.setValue(0);
    setShowPlaceholders(true);
    setStatus(HYDRATION_STATUS.LOADING);

    loadCollectionSlots(storyId)
      .then(({ slots: loaded, finaleSeen }) => {
        if (!isCurrent()) return;
        // Cache QUENTE = mesma história, MESMA revisão e já revelada nesta sessão. Qualquer
        // divergência de assinatura invalida (o objeto é substituído com `revealed: false`).
        const warm = !!(collectionCache
          && collectionCache.storyId === storyId
          && collectionCache.signature === signatureOf(loaded)
          && collectionCache.revealed === true);
        collectionCache = { storyId, signature: signatureOf(loaded), revealed: warm };

        const states = loaded.map((s) => deriveColoring60ActivityState({
          activityId: s.activityId,
          isCurrentlyComplete: s.isCurrentlyComplete,
          hasEverCompleted: s.hasEverCompleted,
          snapshotStatus: s.snapshotStatus,
          hydrationStatus: HYDRATION_STATUS.READY,
        }));
        const journeyState = deriveColoring60JourneyState({ activities: states, finaleSeen });
        if (__DEV__ && journeyState.hasIntegrityBreak) {
          console.log('[Coloring60] coleção: integridade quebrada em', journeyState.integrityBrokenIds.join(', '));
        }
        setSlots(loaded.map((s, i) => ({ ...s, kind: slotKindOf(s, states[i]) })));
        setJourney(journeyState);
        setView(deriveColoring60CollectionView({
          doneMap: journeyState.doneMap,
          order: loaded.map((s) => s.activityId),
        }));
        // Revisão já revelada nesta sessão: as imagens estão quentes, então a coleção volta pronta —
        // sem espera e sem repetir o crossfade. Revisão nova segue a hidratação atômica normal.
        if (warm) {
          revealAnim.setValue(1);
          setShowPlaceholders(false);
          setStatus(HYDRATION_STATUS.READY);
        }
      })
      .catch((err) => {
        if (__DEV__) console.log('[Coloring60] coleção: leitura falhou:', err?.message);
        if (isCurrent()) setStatus(HYDRATION_STATUS.ERROR);
      });

    // Sair de foco invalida a geração: um resultado atrasado desta leitura já não pousa.
    return () => { hydrationIdRef.current += 1; };
  }, [allowed, storyId]);

  useFocusEffect(hydrate);

  // [C60-PARTE-6] Reset canônico enquanto esta tela está montada: o cache de módulo é DESCARTADO
  // (não apenas marcado como frio — a assinatura de uma coleção vazia poderia coincidir) e a tela
  // volta a hidratar do zero. É o que faz "Gerenciar dados" refletir aqui na mesma ação.
  useEffect(() => subscribeColoring60Reset(() => {
    collectionCache = null;
    if (activeRef.current) hydrate();
  }), [hydrate]);

  // Revelação ATÔMICA: só depois que TODOS os espaços se resolveram (ou do teto de tempo) as três
  // entram juntas, num crossfade curto sobre os espaços neutros.
  const reveal = useCallback(() => {
    if (!activeRef.current) return;
    setStatus(HYDRATION_STATUS.READY);
    if (collectionCache) collectionCache.revealed = true;
    Animated.timing(revealAnim, { toValue: 1, duration: 280, useNativeDriver: true })
      .start(() => { if (activeRef.current) setShowPlaceholders(false); });
  }, [revealAnim]);

  const handleSettled = useCallback((activityId) => {
    settledRef.current.add(activityId);
    if (slots.length > 0 && settledRef.current.size >= slots.length) reveal();
  }, [slots.length, reveal]);

  useEffect(() => {
    if (slots.length === 0 || status !== HYDRATION_STATUS.LOADING) return undefined;
    const t = setTimeout(reveal, COLLECTION_ART_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [slots.length, status, reveal]);

  // ── AÇÕES ────────────────────────────────────────────────────────────────────
  // A derivação diz a INTENÇÃO; a tela decide como realizá-la. Não há "continuar neste desenho":
  // esta tela não tem desenho aberto.
  function handleAction(action) {
    const kind = action?.kind ?? null;
    if (kind === COLORING60_ACTION.OPEN_NEXT || kind === COLORING60_ACTION.RESTART) {
      const target = action?.targetActivityId ?? null;
      if (target == null) { navigation.goBack(); return; }
      navigation.navigate(ROUTES.COLORING, { storyId, activityId: target });
      return;
    }
    navigation.goBack();
  }

  const total = view?.totalActivities ?? getColoring60Activities(storyId).length;
  const countLabel = view?.countLabel ?? `0 de ${total}`;
  const loading = status === HYDRATION_STATUS.LOADING;

  if (status === HYDRATION_STATUS.ERROR) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.errorTitle}>Não conseguimos abrir sua coleção agora</Text>
        <Text style={styles.errorText}>Suas pinturas continuam guardadas. Tente de novo em instantes.</Text>
        <SoundButton style={styles.primaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Voltar à aventura</Text>
        </SoundButton>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Fundo NEUTRO e constante — nunca a cor temática da parte de origem (evidência 2). */}
      <LinearGradient
        colors={['#FFFDF8', colors.background, colors.cream]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <SoundButton style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>← Voltar</Text>
          </SoundButton>
        </View>

        <Text style={styles.title}>{view?.collectionTitle ?? 'Minha Criação Cheia de Cor'}</Text>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{countLabel}</Text>
        </View>

        {/* ── AS TRÊS OBRAS ───────────────────────────────────────────────────────────────────
            Camada da arte (opacidade 0 enquanto carrega, para as imagens carregarem sem aparecer)
            e camada de espaços neutros por cima. O crossfade troca as duas de uma vez só. */}
        <View style={[styles.galleryBox, { height: cardH + 34 }]}>
          <Animated.View style={[styles.galleryRow, { opacity: revealAnim }]}>
            {slots.map((s) => (
              <CollectionSlot
                key={s.activityId}
                slot={s}
                kind={s.kind}
                cardW={cardW}
                cardH={cardH}
                onSettled={handleSettled}
              />
            ))}
          </Animated.View>
          {showPlaceholders ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.galleryRow,
                StyleSheet.absoluteFill,
                { opacity: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
              ]}
            >
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.slotCol}>
                  <View style={[styles.placeholder, { width: cardW, height: cardH }]} />
                  <View style={styles.placeholderLabel} />
                </View>
              ))}
            </Animated.View>
          ) : null}
        </View>
        {loading ? <Text style={styles.loadingText}>{COLORING60_COLLECTION_LOADING}</Text> : null}

        {/* ── BENI + MENSAGEM em SUPERFÍCIE SÓLIDA (nenhum texto sobre a obra) ───────────────── */}
        <View style={styles.beniRow}>
          <BeniMascotImage
            variant="apresentaGaleria"
            style={styles.beni}
            accessibilityLabel="Beni apresentando a sua criação"
          />
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {journey?.isFullyComplete
                ? COLORING60_COLLECTION_MESSAGE
                : 'Sua coleção está crescendo! Cada parte colorida entra aqui.'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <SoundButton
            style={styles.primaryBtn}
            onPress={() => handleAction(view?.primaryAction)}
            activeOpacity={0.85}
            accessibilityLabel={view?.primaryAction?.label ?? 'Voltar à aventura'}
          >
            <Text style={styles.primaryBtnText}>{view?.primaryAction?.label ?? 'Voltar à aventura'}</Text>
          </SoundButton>
          {view?.secondaryAction ? (
            <SoundButton
              style={styles.secondaryBtn}
              onPress={() => handleAction(view.secondaryAction)}
              activeOpacity={0.85}
              accessibilityLabel={view.secondaryAction.label}
            >
              <Text style={styles.secondaryBtnText}>{view.secondaryAction.label}</Text>
            </SoundButton>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  content: { paddingHorizontal: 18, alignItems: 'center' },

  topBar: { width: '100%', alignItems: 'flex-start', marginBottom: 4 },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: { fontSize: 15, fontWeight: '700', color: colors.textSoft },

  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  countPill: {
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  countPillText: { fontSize: 15, fontWeight: '800', color: colors.goldDeep },

  galleryBox: { width: '100%', marginTop: 18, justifyContent: 'flex-start' },
  galleryRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },

  slotCol: { alignItems: 'center', marginHorizontal: 5 },
  slotFrame: {
    borderRadius: radii.md,
    backgroundColor: '#FFFDF8',
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  slotPaper: { overflow: 'hidden', backgroundColor: '#FFFDF8' },
  multiply: { mixBlendMode: 'multiply' },
  slotEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  slotEmptyText: { fontSize: 12, fontWeight: '700', color: colors.muted, textAlign: 'center' },

  slotLabelPill: {
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotLabelText: { fontSize: 13, fontWeight: '800', color: colors.textSoft },

  placeholder: {
    borderRadius: radii.md,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.border,
  },
  placeholderLabel: {
    marginTop: 8,
    width: 54,
    height: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.cream,
  },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '700', color: colors.textSoft },

  beniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    width: '100%',
  },
  beni: { width: 92, height: 115, resizeMode: 'contain' },
  messageCard: {
    flex: 1,
    marginLeft: 10,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  messageText: { fontSize: 15, fontWeight: '700', color: colors.text, lineHeight: 21 },

  actions: { width: '100%', marginTop: 22 },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.beni,
    alignItems: 'center',
    ...shadows.card,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '800', color: colors.textSoft },

  errorTitle: { fontSize: 19, fontWeight: '800', color: colors.text, textAlign: 'center' },
  errorText: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 15,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 21,
  },
});
