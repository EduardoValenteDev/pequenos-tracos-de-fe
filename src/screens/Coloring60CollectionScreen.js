/**
 * Coloring60CollectionScreen.js — A COLEÇÃO como LUGAR (C60 · Partes 7, 8, 9 · Retorno instantâneo A1/A2/A5/A6).
 *
 * O QUE ESTAVA ERRADO (evidência física do fundador, itens 1, 2, 3, 4, 12 e 13). A coleção era uma
 * CAMADA aberta por cima do desenho que estava sendo pintado. Consequências observadas no aparelho:
 *   • a obra atual ficava GIGANTE atrás da coleção (às vezes colorida, às vezes só o contorno);
 *   • o fundo mudava de cor conforme a parte de origem (Luz dourado, Vida verde, Cuidado coral) —
 *     a mesma coleção parecia três coleções diferentes;
 *   • os textos caíam SOBRE a arte e perdiam legibilidade;
 *   • a composição inteira dependia de por onde a criança entrou.
 *
 * A CORREÇÃO ESTRUTURAL (Partes 7-9) segue intacta: a coleção é uma TELA PRÓPRIA, com rota própria,
 * fundo NEUTRO, texto só em superfície sólida, três obras na mesma proporção 4:5. Nada disso muda aqui.
 *
 * O QUE ESTE BLOCO CORRIGE (PARTE A · retorno instantâneo). A tela DESCARTAVA um resultado válido e
 * re-derivava do disco a CADA foco, atrás de uma BARREIRA GLOBAL: reset síncrono ao esqueleto, três
 * leituras de blob base64 em `Promise.all`, e um portão que só revelava quando as TRÊS vagas
 * decodificavam (teto de 7 s). Daí a espera intermitente em "Montando sua coleção…". Agora:
 *   • STALE-WHILE-REVALIDATE (A2): o RETRATO em memória (`coloring60CollectionPortrait`) é mostrado de
 *     imediato no retorno quente; a reconciliação do disco acontece em segundo plano e troca SÓ a vaga
 *     que mudou — a tela nunca volta a esqueleto por cima de obras válidas.
 *   • ESTADO POR VAGA (A1): cada `CollectionSlot` revela a SUA arte quando tinta E contorno carregam.
 *     Não há mais portão global — uma vaga lenta/erro não bloqueia as outras duas.
 *   • KEY POR VAGA (A5): `coloring60SlotKey` remonta uma vaga só quando a obra muda de verdade; vagas
 *     inalteradas mantêm a imagem quente, sem piscar.
 *   • TIMEOUT POR VAGA (A6): o teto de espera é de cada vaga; "Montando sua coleção…" (global) só
 *     aparece na PRIMEIRA carga real (frio, sem retrato), nunca dominando o retorno quente.
 *
 * INTEGRIDADE (Partes 4 e 9). A contagem vem de `countsAsComplete` (nunca de um booleano solto):
 * concluída sem arte recuperável é QUEBRA DE INTEGRIDADE e não conta; limpar uma parte faz o contador
 * cair na volta. A hidratação atômica por vaga continua proibindo o contorno sem cor.
 *
 * O que esta tela NÃO faz: não conclui atividade, não concede recompensa, não repete a grande
 * conclusão, não escreve NADA, não duplica blob. Ela só lê o retrato reconciliado, compõe e oferece
 * as saídas.
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
// [C60-ETAPA4] COR TEMÁTICA por parte — FONTE ÚNICA compartilhada com a PRÉVIA AMPLIADA. A miniatura
// da coleção e a prévia da mesma obra herdam a MESMA cor (dois mapas não podem divergir). Ver
// src/theme/coloring60ActivityTheme.js.
import { getColoring60ActivityTheme } from '../theme/coloring60ActivityTheme';
import { getColoring60Activities } from '../data/coloring60Catalog';
// [C60-PARTE-6] O reset canônico avisa quem tem cache em memória. Sem isto, apagar tudo em
// "Gerenciar dados" deixaria esta tela exibindo a coleção antiga até uma navegação nova.
import { subscribeColoring60Reset } from '../services/coloring60ResetService';
import {
  HYDRATION_STATUS,
  deriveColoring60ActivityState,
  deriveColoring60JourneyState,
} from '../services/coloring60State';
// `SLOT` (os quatro estados de uma vaga) segue vindo do leitor canônico. A LEITURA em si já não é
// feita aqui: quem lê o disco e mantém o retrato reconciliado é o serviço de retrato (A2/A3).
import { SLOT } from '../services/coloring60CollectionReader';
// [C60-A2/A3] RETRATO EM MEMÓRIA por storyId — o coração do retorno instantâneo. `getColoring60Portrait`
// devolve (síncrono) o último retrato válido; `primeColoring60Collection` reconcilia do disco em
// segundo plano (dedup em voo, geração de leitura, merge SWR). A tela nunca lê blob direto.
import {
  getColoring60Portrait,
  primeColoring60Collection,
} from '../services/coloring60CollectionPortrait';
// [C60-A5] KEY por vaga (muda só quando a obra muda de verdade) — a MESMA regra pura provada no smoke.
import { coloring60SlotKey } from '../services/coloring60PortraitMerge';
import {
  deriveColoring60CollectionView,
  COLORING60_ACTION,
  COLORING60_COLLECTION_MESSAGE,
  COLORING60_COLLECTION_LOADING,
  COLORING60_COLLECTION_TAP_HINT,
} from '../services/coloring60Journey';
import {
  parseDrawingPayload,
  isPositionedPayload,
  toArtVisual,
  computePaintStyle,
  computeLineartStyle,
} from '../components/coloring60/coloring60ArtComposition';
// [C60-FIX3] MARCA HONESTA compartilhada. A vaga sem obra guardada deixa de ser um quadro vazio com
// texto cinza (vocabulário de miniatura quebrada) e passa a exibir a MESMA marca intencional que a
// galeria da grande conclusão usa — selo do estado, identidade da parte e, na conclusão sem pixels
// guardados, o convite a pintar de novo para guardar. Um estado, uma representação, duas telas.
import Coloring60SlotStateMark, {
  COLORING60_SLOT_STATE_COPY,
} from '../components/coloring60/Coloring60SlotStateMark';
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';
// [C60-NAV] CONTRATO ÚNICO de navegação do piloto. A coleção é o SELETOR: abre a prévia por
// identidade, abre o editor por identidade e "Voltar à aventura" sai DIRETO à história — tudo por
// destino semântico, nunca por contagem de goBack. Ver src/services/coloring60Navigation.js.
import {
  c60ExitToStory,
  c60OpenPreview,
  c60OpenEditorFromStory,
} from '../services/coloring60Navigation';

// [C60-A6] Teto de espera POR VAGA (não global). Estourado, a vaga para de esperar a composição e
// permanece no papel neutro do quadro — SEM revelar contorno sem tinta e SEM prender as outras duas.
const COLLECTION_SLOT_TIMEOUT_MS = 7000;

/** Gate do piloto — a MESMA regra da tela de colorir (flag oficial OU dev com ferramentas internas). */
function isColoring60PilotAllowed() {
  if (COLORIR_60_CREATION_PILOT_ENABLED) return true;
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev && isInternalToolsEnabled();
}

/**
 * deriveCollectionFromSlots(slots, finaleSeen) — deriva contador, integridade e ações a partir das
 * vagas do retrato. Estado visual (`kind`) já vem anexado pelo retrato; aqui só se derivam a jornada
 * (para o "N de 3" honesto via `countsAsComplete`) e a view de ações. Pura, sem I/O.
 */
function deriveCollectionFromSlots(slots, finaleSeen) {
  const states = slots.map((s) => deriveColoring60ActivityState({
    activityId: s.activityId,
    isCurrentlyComplete: s.isCurrentlyComplete,
    hasEverCompleted: s.hasEverCompleted,
    snapshotStatus: s.snapshotStatus,
    hydrationStatus: HYDRATION_STATUS.READY,
  }));
  const journey = deriveColoring60JourneyState({ activities: states, finaleSeen });
  const view = deriveColoring60CollectionView({
    doneMap: journey.doneMap,
    order: slots.map((s) => s.activityId),
  });
  return { journey, view };
}

// ─────────────────────────────────────────────────────────────────────────────
// UMA obra da coleção. A ARTE é a PROTAGONISTA: preenche a moldura, na proporção fixa 4:5 (a mesma dos
// linearts 1122×1402). Uma ÚNICA moldura fina, com a cor TEMÁTICA da parte — sem matte branco interno,
// sem superfície branca dupla, sem borda artificial (evidência 3/9). O rótulo vive SOB a obra, em chip
// próprio. Quando há pintura, compõe cor + contorno (multiply).
//
// [C60-A1] REVELAÇÃO POR VAGA. Esta vaga revela a SUA arte quando tinta E contorno já carregaram (ou,
// como rede, quando o teto por vaga estoura) — as duas imagens vivem numa camada de opacidade própria,
// de 0 → 1. Não existe portão global: enquanto uma vaga espera, as outras já podem estar reveladas. O
// invariante da Parte 8 (nunca contorno sem cor) é preservado POR VAGA: as duas imagens sobem juntas.
// ─────────────────────────────────────────────────────────────────────────────
function CollectionSlot({ slot, theme, cardW, cardH, onOpen }) {
  const kind = slot.kind;
  // Só o descolamento da borda (2px de cada lado): a arte ocupa quase toda a moldura, sem matte.
  const artW = cardW - 4;
  const artH = cardH - 4;
  const parsed = kind === SLOT.ART ? parseDrawingPayload(slot.paint) : null;
  const positioned = isPositionedPayload(parsed);
  const visual = parsed ? toArtVisual(parsed, slot.lineart) : null;
  const paintStyle = positioned ? computePaintStyle(artW, artH, visual) : null;
  const lineartStyle = positioned ? computeLineartStyle(artW, artH, visual) : null;

  const artOpacity = useRef(new Animated.Value(0)).current;
  const loadedRef = useRef({ paint: false, lineart: false, done: false });
  const mountedAtRef = useRef(typeof __DEV__ !== 'undefined' && __DEV__ ? Date.now() : 0);

  const revealArt = useCallback(() => {
    const st = loadedRef.current;
    if (st.done) return;
    st.done = true;
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[C60-perf] slot:art-ready ${slot.activityId} Δ=${Date.now() - mountedAtRef.current}ms`);
    }
    Animated.timing(artOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [artOpacity, slot.activityId]);

  // Uma imagem que carregou some com sucesso; a que falhou NÃO revela (o timeout por vaga assume, e a
  // vaga fica no papel neutro — honesto, nunca contorno sem cor).
  const report = useCallback((which, ok) => {
    const st = loadedRef.current;
    if (st.done || !ok) return;
    st[which] = true;
    if (st.paint && st.lineart) revealArt();
  }, [revealArt]);

  // [C60-A6] Timeout POR VAGA: para de esperar sem revelar arte incompleta e sem travar as vizinhas.
  useEffect(() => {
    if (kind !== SLOT.ART) return undefined;
    const t = setTimeout(() => {
      const st = loadedRef.current;
      if (st.done) return;
      st.done = true; // desiste desta vaga: permanece o papel neutro (sem contorno sem tinta)
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log(`[C60-perf] slot:timeout ${slot.activityId}`);
      }
    }, COLLECTION_SLOT_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [kind, slot.activityId]);

  // [C60-FIX3] O texto do estado honesto vem da FONTE ÚNICA compartilhada com o fecho e a prévia —
  // três redações para o mesmo estado voltariam a ser três verdades. A leitura em voz alta inclui o
  // recado sobre a pintura não ficar guardada, para que a informação não dependa de enxergar a tela.
  const honest = COLORING60_SLOT_STATE_COPY[kind] ?? null;
  const honestSpoken = honest ? [honest.title, honest.note].filter(Boolean).join(' ') : '';

  const a11y = kind === SLOT.ART
    ? `Ver de perto: ${slot.marker}, obra colorida por você`
    : `Ver de perto: ${slot.marker}, ${honestSpoken}`;

  // A obra INTEIRA (moldura + rótulo) é a área de toque — a coleção É o seletor visual. Tocar leva
  // à PRÉVIA AMPLIADA da PRÓPRIA obra (o `slot.activityId` da vaga), jamais uma parte fixa. Toda
  // obra é tocável, inclusive as honestas: a prévia mostra o estado real e convida a colorir.
  return (
    <SoundButton
      style={styles.slotCol}
      onPress={() => onOpen(slot.activityId)}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      {/* Moldura ÚNICA e fina, na cor temática da parte. O papel creme do fundo é o estado neutro
          enquanto a arte desta vaga ainda não compôs — nunca uma segunda superfície branca competindo,
          nunca o contorno sozinho. */}
      <View style={[styles.slotFrame, { width: cardW, height: cardH, borderColor: theme.frame }]}>
        {kind === SLOT.ART ? (
          // Camada de arte com opacidade PRÓPRIA (A1): tinta + contorno sobem juntos, só quando ambos
          // carregam. Antes disso, o papel neutro do quadro é o que se vê.
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: artOpacity }]}>
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
          </Animated.View>
        ) : (
          // Estado honesto: NUNCA o contorno sozinho no lugar da obra, e — desde o FIX 3 — nunca um
          // quadro vazio. A MARCA do estado é a mesma da grande conclusão: selo próprio, frase do
          // estado e, quando a parte foi concluída sem pixels guardados, o recado que fecha a
          // expectativa. A cor temática mantém Luz · Vida · Cuidado distinguíveis sem pintura.
          <Coloring60SlotStateMark kind={kind} tint={theme.frame} tintDeep={theme.chipText} />
        )}
      </View>
      {/* Rótulo SOB a obra, em chip temático próprio — nenhum texto sobre a arte. */}
      <View style={[styles.slotLabelPill, { backgroundColor: theme.chipBg, borderColor: theme.frame }]}>
        <Text style={[styles.slotLabelText, { color: theme.chipText }]} numberOfLines={1}>{slot.marker}</Text>
      </View>
    </SoundButton>
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
  const activeRef = useRef(true);
  // Geração da hidratação: cada foco carimba a sua e só aplica o resultado da revalidação se ainda for
  // a mais recente. Uma revalidação antiga (foco seguido de foco) não repõe o retrato errado.
  const hydrationIdRef = useRef(0);

  useEffect(() => () => { activeRef.current = false; }, []);

  const cardW = Math.max(84, Math.floor((Math.min(width, 560) - 36 - 20) / 3));
  const cardH = Math.round(cardW * 1.25);

  // Aplica um retrato à tela: deriva contador/ações e revela como PRONTO. As vagas com key estável
  // (A5) não remontam; só a que mudou de verdade troca — sem piscar as outras.
  const applyPortrait = useCallback((portrait) => {
    const sl = (portrait && Array.isArray(portrait.slots)) ? portrait.slots : [];
    const { journey: j, view: v } = deriveCollectionFromSlots(sl, portrait?.finaleSeen === true);
    if (__DEV__ && j.hasIntegrityBreak) {
      console.log('[Coloring60] coleção: integridade quebrada em', j.integrityBrokenIds.join(', '));
    }
    setSlots(sl);
    setJourney(j);
    setView(v);
    setStatus(HYDRATION_STATUS.READY);
  }, []);

  // [C60-A2] Carrega ao FOCAR com STALE-WHILE-REVALIDATE:
  //   • RETORNO QUENTE (há retrato) → mostra o retrato AGORA (sem esqueleto, sem "Montando…"), e
  //     revalida o disco em segundo plano, trocando só a vaga que mudou.
  //   • CARGA FRIA (sem retrato) → esqueleto + "Montando sua coleção…" só nesta primeira vez (A6),
  //     até a leitura reconciliar; falha sem retrato vira erro honesto.
  const hydrate = useCallback(() => {
    if (!allowed) { setStatus(HYDRATION_STATUS.ERROR); return undefined; }
    hydrationIdRef.current += 1;
    const runId = hydrationIdRef.current;
    const isCurrent = () => activeRef.current && hydrationIdRef.current === runId;
    const t0 = (typeof __DEV__ !== 'undefined' && __DEV__) ? Date.now() : 0;

    const portrait = getColoring60Portrait(storyId);
    const hot = !!(portrait && Array.isArray(portrait.slots) && portrait.slots.length > 0);
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[C60-perf] hydrate:start gen=${runId} portrait=${hot ? 'hit' : 'miss'}`);
    }

    if (hot) {
      applyPortrait(portrait); // instantâneo: nada de esqueleto por cima de obras válidas
    } else {
      setSlots([]);
      setStatus(HYDRATION_STATUS.LOADING); // frio: "Montando sua coleção…" (só a 1ª vez)
    }

    primeColoring60Collection(storyId).then((next) => {
      if (!isCurrent()) return;
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log(`[C60-perf] prime:resolved gen=${runId} Δ=${Date.now() - t0}ms slots=${next?.slots?.length ?? 0}`);
      }
      if (next && Array.isArray(next.slots) && next.slots.length > 0) {
        applyPortrait(next);
      } else if (!hot) {
        // Frio e a leitura falhou (sem retrato para segurar) → erro honesto. No retorno quente uma
        // falha de revalidação NUNCA derruba o retrato já exibido.
        setStatus(HYDRATION_STATUS.ERROR);
      }
    });

    // Sair de foco invalida a geração: um resultado atrasado desta revalidação já não pousa.
    return () => { hydrationIdRef.current += 1; };
  }, [allowed, storyId, applyPortrait]);

  useFocusEffect(hydrate);

  // [C60-PARTE-6] Reset canônico enquanto esta tela está montada: o serviço de retrato (inscrito no
  // carregamento do módulo, ANTES desta tela) já invalidou o retrato em memória; aqui só re-hidratamos.
  // Como o retrato está nulo, a hidratação cai no caminho frio e reflete 0 de 3 por derivação.
  useEffect(() => subscribeColoring60Reset(() => {
    if (activeRef.current) hydrate();
  }), [hydrate]);

  // ── AÇÕES ────────────────────────────────────────────────────────────────────
  // A derivação diz a INTENÇÃO; a tela decide como realizá-la. Não há "continuar neste desenho":
  // esta tela não tem desenho aberto.
  function handleAction(action) {
    const kind = action?.kind ?? null;
    if (kind === COLORING60_ACTION.OPEN_NEXT || kind === COLORING60_ACTION.RESTART) {
      const target = action?.targetActivityId ?? null;
      if (target == null) { c60ExitToStory(navigation); return; }
      c60OpenEditorFromStory(navigation, storyId, target);
      return;
    }
    // [C60-NAV · FLUXO 6] BACK ("Voltar à aventura") → DIRETO à história pelo contrato central,
    // removendo toda tela do piloto acima — nunca `goBack()` cru dependente da pilha.
    c60ExitToStory(navigation);
  }

  // A coleção É o SELETOR: tocar uma obra abre a PRÉVIA AMPLIADA da PRÓPRIA obra. Passa só a
  // IDENTIDADE (storyId + o activityId DA VAGA) — a prévia relê pela leitura canônica reconciliada,
  // sem receber bytes, URI temporária nem estado de pintura pela navegação. Jamais 'light': cada
  // obra abre a si mesma.
  const openArtPreview = useCallback((activityId) => {
    if (activityId == null) return;
    // [C60-NAV · FLUXO 2] Prévia por identidade (storyId + o activityId DA VAGA) — jamais 'light'.
    c60OpenPreview(navigation, storyId, activityId);
  }, [navigation, storyId]);

  const total = view?.totalActivities ?? getColoring60Activities(storyId).length;
  const countLabel = view?.countLabel ?? `0 de ${total}`;
  const loading = status === HYDRATION_STATUS.LOADING;

  if (status === HYDRATION_STATUS.ERROR) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.errorTitle}>Não conseguimos abrir sua coleção agora</Text>
        <Text style={styles.errorText}>Suas pinturas continuam guardadas. Tente de novo em instantes.</Text>
        <SoundButton style={styles.primaryBtn} onPress={() => c60ExitToStory(navigation)} activeOpacity={0.85}>
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

      {/* Cabeçalho fixo: apenas o chevron de navegação. O CTA "Voltar à aventura" mora no RODAPÉ
          ancorado — assim a galeria é a protagonista da altura e a saída fica sempre ao alcance. */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <SoundButton
          style={styles.backBtn}
          onPress={() => c60ExitToStory(navigation)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Voltar à aventura"
        >
          <Text style={styles.backBtnText}>← Voltar</Text>
        </SoundButton>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{view?.collectionTitle ?? 'Minha Criação Cheia de Cor'}</Text>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{countLabel}</Text>
        </View>

        {/* ── A GALERIA é a PROTAGONISTA ───────────────────────────────────────────────────────
            As três obras DIRETO sobre o fundo neutro — sem palco branco cobrindo a tela e sem a
            prateleira decorativa que não servia a nada (evidência 3). Cada obra na sua moldura
            temática, todas na mesma proporção 4:5. No RETORNO QUENTE (A2) as vagas vêm do retrato e
            aparecem de imediato; cada vaga revela a sua arte por conta própria (A1). Só na CARGA FRIA
            (sem retrato) aparecem os três espaços neutros com "Montando sua coleção…" (A6). A dica de
            toque vem logo ABAIXO das obras, colada a elas — nunca solta no meio da tela. */}
        <View style={styles.gallery}>
          <View style={[styles.galleryBox, { height: cardH + 34 }]}>
            {slots.length > 0 ? (
              <View style={styles.galleryRow}>
                {slots.map((s) => (
                  <CollectionSlot
                    key={coloring60SlotKey(storyId, s)}
                    slot={s}
                    theme={getColoring60ActivityTheme(s.activityId)}
                    cardW={cardW}
                    cardH={cardH}
                    onOpen={openArtPreview}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.galleryRow}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={styles.slotCol}>
                    <View style={[styles.placeholder, { width: cardW, height: cardH }]} />
                    <View style={styles.placeholderLabel} />
                  </View>
                ))}
              </View>
            )}
          </View>
          {loading
            ? <Text style={styles.loadingText}>{COLORING60_COLLECTION_LOADING}</Text>
            : <Text style={styles.tapHint}>{COLORING60_COLLECTION_TAP_HINT}</Text>}
        </View>

        {/* ── BENI + MENSAGEM integrados, em SUPERFÍCIE SÓLIDA (nenhum texto sobre a obra) ────── */}
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
      </ScrollView>

      {/* ── RODAPÉ ANCORADO: a saída principal fica sempre acessível, fora da rolagem. Com 3 de 3
          há UMA única ação (Voltar à aventura) — o antigo "Colorir novamente" saiu; a coleção é o
          seletor. Faltando parte, aparece também a saída sem culpa. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <SoundButton
          style={styles.primaryBtn}
          onPress={() => handleAction(view?.primaryAction)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={view?.primaryAction?.label ?? 'Voltar à aventura'}
        >
          <Text style={styles.primaryBtnText}>{view?.primaryAction?.label ?? 'Voltar à aventura'}</Text>
        </SoundButton>
        {view?.secondaryAction ? (
          <SoundButton
            style={styles.secondaryBtn}
            onPress={() => handleAction(view.secondaryAction)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={view.secondaryAction.label}
          >
            <Text style={styles.secondaryBtnText}>{view.secondaryAction.label}</Text>
          </SoundButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  scroll: { flex: 1, width: '100%' },
  content: { paddingHorizontal: 18, alignItems: 'center', paddingBottom: 14 },

  topBar: { width: '100%', paddingHorizontal: 18, alignItems: 'flex-start' },
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

  // A galeria vive DIRETO sobre o fundo neutro: sem palco branco cobrindo a tela, sem sombra de
  // painel, sem borda de cartão — as obras e suas molduras temáticas SÃO o acabamento. Só o
  // espaçamento para respirarem (evidência 3: fim do "grande painel branco" e do espaço sem função).
  gallery: {
    width: '100%',
    marginTop: 18,
    alignItems: 'center',
  },
  galleryBox: { width: '100%', justifyContent: 'flex-start' },
  galleryRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  // Instrução discreta, COLADA às obras: a coleção É o seletor. Um texto miúdo, jamais outro cartão.
  tapHint: { marginTop: 12, fontSize: 13, fontWeight: '700', color: colors.muted, textAlign: 'center' },

  slotCol: { alignItems: 'center', marginHorizontal: 5 },
  // Moldura ÚNICA e fina (a cor da borda vem inline, por parte — Luz/Vida/Cuidado). A arte preenche
  // por dentro; o papel claro aparece só nos vazios do contorno (fidelidade ao que foi pintado).
  // Sem segunda superfície branca e sem matte artificial competindo com a obra (evidência 3/9).
  slotFrame: {
    borderRadius: radii.md,
    backgroundColor: '#FFFDF8',
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  multiply: { mixBlendMode: 'multiply' },
  // [C60-FIX3] O antigo par `slotEmpty`/`slotEmptyText` (quadro vazio + texto cinza) saiu: quem
  // desenha a vaga sem obra guardada agora é a marca honesta compartilhada, com estilo próprio.

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
    marginTop: 16,
    width: '100%',
  },
  beni: { width: 104, height: 130, resizeMode: 'contain' },
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

  // Rodapé ANCORADO fora da rolagem: a saída principal sempre ao alcance do polegar. Sem hairline e
  // sem slab — o fundo `cream` casa com a BASE do gradiente da tela, então a saída lê como parte da
  // composição, não como uma barra colada por cima (evidência 3: o "Voltar à aventura" separado era a
  // linha dura + o painel; ambos saíram, a saída segue sempre acessível).
  footer: {
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: colors.cream,
  },
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
