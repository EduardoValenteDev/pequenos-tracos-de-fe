/**
 * Coloring60ArtPreviewScreen.js — PRÉVIA AMPLIADA de UMA obra (C60 · seleção visual).
 *
 * POR QUE ESTA TELA EXISTE. A coleção "Minha Criação Cheia de Cor" virou o SELETOR: cada obra é
 * tocável. Tocar NÃO abre o editor direto — abre esta VISTA ampliada e elegante da PRÓPRIA obra, com
 * a arte como protagonista, e daqui a criança decide "Editar desenho" ou "Voltar". O antigo botão
 * global "Colorir novamente" (que reabria SEMPRE a primeira parte, Luz) deixou de existir: aqui cada
 * obra abre a si mesma, com o SEU `activityId`, jamais 'light'.
 *
 * FONTE ÚNICA DE VERDADE. A tela recebe só a IDENTIDADE (`storyId` + `activityId`) pela navegação —
 * nunca bytes, URI temporária nem estado de pintura cru. Ela RELÊ a obra pela MESMA leitura canônica
 * reconciliada que a coleção usa (`loadColoring60Slot`): retrato de conclusão × pixels no disco ×
 * contorno oficial. Não há segunda fonte de verdade; a mesma obra é a mesma obra, com o mesmo estado
 * honesto, venha da coleção ou de um deep-link.
 *
 * NÃO É UMA FESTA. Ver ou editar uma obra concluída é uma VISTA, não a celebração de 3 de 3: esta
 * tela NÃO chama nenhuma derivação de conclusão/celebração, NÃO conclui, NÃO concede recompensa,
 * NÃO escreve nada. Só lê, compõe a arte (tinta + contorno em `multiply`, a MESMA matemática da
 * coleção e do Livrinho) e oferece duas saídas.
 *
 * ESTADOS HONESTOS. `art` mostra a obra; `notPersisted` (concluída no Grátis, sem pixels),
 * `needsColor` (ponteiro órfão) e `empty` (ainda não concluída) NUNCA mostram o contorno sozinho no
 * lugar da obra: mostram uma mensagem acolhedora e convidam a colorir a parte — e o "Editar/Colorir"
 * sempre abre o editor da PRÓPRIA parte.
 *
 * HIDRATAÇÃO. A arte só aparece COMPOSTA (tinta + contorno já carregados), num fade curto — nunca o
 * contorno piscando sem cor. Recarrega ao FOCAR: voltar do editor após salvar reflete a obra nova, e
 * a volta à coleção reflete a miniatura correta (a coleção também rehidrata ao focar).
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View, Text, Image, StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import SoundButton from '../components/SoundButton';
import BeniMascotImage from '../components/common/BeniMascotImage';
import { colors, radii, shadows } from '../theme/productTheme';
// [C60-ETAPA4] COR TEMÁTICA da parte — a MESMA fonte única que a miniatura da coleção usa. A moldura
// e o chip do marcador herdam a cor da obra; a mesma parte tem a mesma cor na coleção e na prévia.
import { getColoring60ActivityTheme } from '../theme/coloring60ActivityTheme';
import { getColoring60Activities } from '../data/coloring60Catalog';
// LEITURA CANÔNICA RECONCILIADA — a MESMA que a coleção consome. Sem segunda fonte de verdade.
import { SLOT, loadColoring60Slot } from '../services/coloring60CollectionReader';
import {
  deriveColoring60ArtPreview,
  COLORING60_ACTION,
} from '../services/coloring60Journey';
import {
  parseDrawingPayload,
  isPositionedPayload,
  toArtVisual,
  computePaintStyle,
  computeLineartStyle,
} from '../components/coloring60/coloring60ArtComposition';
// Reset canônico ("Gerenciar dados"): descarta a vista e rehidrata — uma obra apagada não fica
// exposta aqui como se nada tivesse acontecido.
import { subscribeColoring60Reset } from '../services/coloring60ResetService';
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';
// [C60-NAV] CONTRATO ÚNICO de navegação. "Editar desenho" CONSOME a prévia (replace, abre a própria
// obra, sem fallback para 'light'); "Voltar" volta à coleção como instância única. Ver
// src/services/coloring60Navigation.js.
import { c60EditFromPreview, c60BackFromPreview } from '../services/coloring60Navigation';

// Situação da leitura (não é a mesma coisa que o `kind` da obra: aqui é "consegui ler?").
const READ = Object.freeze({ LOADING: 'loading', READY: 'ready', ERROR: 'error' });

// [C60-ETAPA2] ESTADOS EXPLÍCITOS DA PRÉVIA — 5, fechados. Cada um tem um render próprio e honesto;
// NENHUM cai em "nada na tela". É o contrato que proíbe a moldura vazia silenciosa (EVID 8).
//   LOADING                     → abrindo a obra (nunca arte crua, nunca contorno pelado)
//   READY_WITH_ART              → a obra composta (tinta + contorno), revelada quando as duas carregam
//   READY_WITHOUT_PERSISTED_ART → concluída-sem-pixels (Grátis) ou ainda-não-concluída: recado + convite
//   INTEGRITY_ERROR             → prometia arte e não há: ponteiro órfão (needsColor) OU imagem falhou
//   READ_ERROR                  → a leitura do disco falhou: tela de erro, com as pinturas a salvo
const PREVIEW_STATE = Object.freeze({
  LOADING: 'loading',
  READY_WITH_ART: 'ready_with_art',
  READY_WITHOUT_PERSISTED_ART: 'ready_without_persisted_art',
  INTEGRITY_ERROR: 'integrity_error',
  READ_ERROR: 'read_error',
});

// Teto de espera das imagens: estourado, a arte REVELA mesmo assim (nunca presa no carregando).
const PREVIEW_ART_TIMEOUT_MS = 7000;

/** Gate do piloto — a MESMA regra da coleção e da tela de colorir. */
function isColoring60PilotAllowed() {
  if (COLORIR_60_CREATION_PILOT_ENABLED) return true;
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev && isInternalToolsEnabled();
}

export default function Coloring60ArtPreviewScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const storyId = route?.params?.storyId ?? null;
  const activityId = route?.params?.activityId ?? null;
  const allowed = isColoring60PilotAllowed() && getColoring60Activities(storyId).length > 0;
  // [C60-ETAPA4] Cor temática da PRÓPRIA parte — FONTE ÚNICA, a mesma da miniatura na coleção. A
  // moldura fina da obra e o chip do marcador herdam essa cor (a arte, não). Id neutro ⇒ neutro.
  const theme = getColoring60ActivityTheme(activityId);

  const [read, setRead] = useState(READ.LOADING);
  const [slot, setSlot] = useState(null); // slot canônico já com `kind`
  const artOpacity = useRef(new Animated.Value(0)).current;
  const loadedRef = useRef({ paint: false, lineart: false, done: false });
  const [artFailed, setArtFailed] = useState(false);
  // [C60-ETAPA4] Caixa MEDIDA da área da arte (entre o cabeçalho e o Beni). A obra é dimensionada para
  // caber AQUI, então o Beni e as saídas ancoradas NUNCA são cobertos (EVID 6): o layout é flex, a área
  // da arte ocupa só o espaço que sobra e a arte se ajusta a ela.
  const [artBox, setArtBox] = useState({ w: 0, h: 0 });
  const activeRef = useRef(true);
  // Geração da leitura: só o resultado da leitura MAIS RECENTE pousa (foco + reset em sequência não
  // repõem a obra antiga).
  const readIdRef = useRef(0);

  useEffect(() => () => { activeRef.current = false; }, []);

  // ── DIMENSÕES DA OBRA AMPLIADA ────────────────────────────────────────────────────────────────
  // A arte é a PROTAGONISTA e mantém a proporção 4:5 (linearts 1122×1402) — sem corte. Cabe dentro da
  // área MEDIDA (flex), deixando o cabeçalho acima e o Beni + as saídas ancoradas abaixo SEMPRE
  // visíveis (EVID 6). Moldura FINA temática, sem matte branco largo: a arte quase preenche a moldura,
  // sem a borda branca que a fazia recuar (EVID 9). Antes da 1ª medição, um palpite conservador.
  const FRAME_BORDER = 3;
  const boxW = artBox.w > 0 ? artBox.w : Math.min(width - 36, 420);
  const boxH = artBox.h > 0 ? artBox.h : height * 0.42;
  let artW = Math.min(boxW - 4, 420);
  let artH = artW * 1.25;
  if (artH > boxH - 12) { artH = boxH - 12; artW = artH / 1.25; }
  const innerW = artW - FRAME_BORDER * 2;
  const innerH = artH - FRAME_BORDER * 2;
  // Mede a área da arte SEM entrar em laço: só atualiza o estado quando a caixa muda de fato.
  const onArtAreaLayout = useCallback((e) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setArtBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);

  // ── LEITURA (rehidrata ao focar) ──────────────────────────────────────────────────────────────
  const hydrate = useCallback(() => {
    if (!allowed) { setRead(READ.ERROR); return undefined; }
    readIdRef.current += 1;
    const runId = readIdRef.current;
    const isCurrent = () => activeRef.current && readIdRef.current === runId;

    // [C60-ETAPA2] A troca atômica (zerar portão de carga, opacidade e falha) NÃO mora mais aqui: mora
    // no efeito atado à CHAVE da obra (`artKey`). Tirar daqui foi o que matou a corrida foco+reset que
    // deixava a opacidade em 0 sem que o onLoad das <Image> em cache voltasse a disparar — a moldura
    // vazia silenciosa da EVID 8. Aqui a leitura só declara "estou abrindo".
    setRead(READ.LOADING);

    loadColoring60Slot(storyId, activityId)
      .then((loaded) => {
        if (!isCurrent()) return;
        if (loaded == null) {
          // Identidade fora do piloto/história ⇒ estado honesto (empty), nunca 'light', nunca crash.
          setSlot({ activityId, title: '', marker: '', kind: SLOT.EMPTY, paint: null, lineart: null });
          setRead(READ.READY);
          return;
        }
        setSlot(loaded);
        setRead(READ.READY);
      })
      .catch((err) => {
        if (__DEV__) console.log('[Coloring60] prévia: leitura falhou:', err?.message);
        if (isCurrent()) setRead(READ.ERROR);
      });

    return () => { readIdRef.current += 1; };
  }, [allowed, storyId, activityId]);

  useFocusEffect(hydrate);

  // Reset canônico enquanto a tela está montada: rehidrata do zero.
  useEffect(() => subscribeColoring60Reset(() => {
    if (activeRef.current) hydrate();
  }), [hydrate]);

  const kind = slot?.kind ?? SLOT.EMPTY;
  const isArt = kind === SLOT.ART && !artFailed;

  // [C60-ETAPA2] CHAVE DE REMONTAGEM DA ARTE (troca atômica) ────────────────────────────────────────
  // A obra tem uma IDENTIDADE VISUAL: história + parte + situação do instantâneo + tamanho do payload
  // (a mesma assinatura que a coleção usa em coloring60SlotSignature). Repintar, trocar de obra, limpar
  // ou mudar de plano muda a chave. Chave NOVA ⇒ as <Image> REMONTAM e o onLoad dispara fresco (jamais
  // preso no cache com opacidade 0 — a moldura vazia da EVID 8). Chave IGUAL (re-foco na MESMA obra) ⇒
  // sem remontagem: a arte já revelada CONTINUA na tela, sem piscar. Nenhum byte/URI trafega pela
  // navegação — a chave é derivada só de metadados do slot canônico.
  const paintSig = slot?.paint ? String(slot.paint.length) : '0';
  const artKey = `${storyId}::${activityId}::${kind}::${slot?.snapshotStatus ?? ''}::${paintSig}`;

  // [C60-ETAPA2] ESTADO EXPLÍCITO DA PRÉVIA — seletor ÚNICO entre os 5 estados fechados. Cada um tem
  // render próprio; nenhum cai em "nada na tela". É o contrato anti-moldura-vazia (EVID 8).
  const previewState = read === READ.LOADING
    ? PREVIEW_STATE.LOADING
    : read === READ.ERROR
      ? PREVIEW_STATE.READ_ERROR
      : kind === SLOT.ART
        ? (artFailed ? PREVIEW_STATE.INTEGRITY_ERROR : PREVIEW_STATE.READY_WITH_ART)
        : kind === SLOT.NEEDS_COLOR
          ? PREVIEW_STATE.INTEGRITY_ERROR
          : PREVIEW_STATE.READY_WITHOUT_PERSISTED_ART;

  // Composição idêntica à da coleção (tinta por baixo, contorno em `multiply` por cima).
  const parsed = kind === SLOT.ART ? parseDrawingPayload(slot?.paint) : null;
  const positioned = isPositionedPayload(parsed);
  const visual = parsed ? toArtVisual(parsed, slot?.lineart) : null;
  const paintStyle = positioned ? computePaintStyle(innerW, innerH, visual) : null;
  const lineartStyle = positioned ? computeLineartStyle(innerW, innerH, visual) : null;

  // Revelação da arte: só quando as DUAS imagens carregam (ou no teto de tempo). Nunca contorno só.
  const revealArt = useCallback(() => {
    if (!activeRef.current) return;
    Animated.timing(artOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [artOpacity]);

  const reportLoad = useCallback((which, ok) => {
    const st = loadedRef.current;
    if (st.done) return;
    if (!ok) { st.done = true; setArtFailed(true); artOpacity.setValue(1); return; }
    st[which] = true;
    if (st.paint && st.lineart) { st.done = true; revealArt(); }
  }, [artOpacity, revealArt]);

  // [C60-ETAPA2] TROCA ATÔMICA — só quando a CHAVE da obra muda: zera o portão de carga, limpa a falha e
  // esconde a arte (opacidade 0) para o fade de entrada. É o ÚNICO ponto que reinicia a revelação.
  // useLayoutEffect (não useEffect): roda síncrono logo após o commit, ANTES do onLoad nativo (que é
  // assíncrono, vem do decode em outra thread) e ANTES da pintura — então um onLoad instantâneo de
  // imagem em cache jamais é zerado por um reset atrasado (a moldura vazia da EVID 8). Chave igual
  // (re-foco na MESMA obra) não dispara: a arte revelada segue na tela, sem piscar.
  useLayoutEffect(() => {
    loadedRef.current = { paint: false, lineart: false, done: false };
    setArtFailed(false);
    artOpacity.setValue(0);
  }, [artKey, artOpacity]);

  // [C60-ETAPA2] Backstop de tempo (atado à CHAVE): se as imagens demorarem além do teto, revela mesmo
  // assim — a obra está composta, só lenta. Reinicia a cada obra nova. Com a remontagem por chave o
  // onLoad quase sempre chega antes; esta é só a rede que impede prender a arte no "carregando".
  useEffect(() => {
    if (!isArt) return undefined;
    const t = setTimeout(() => { if (!loadedRef.current.done) revealArt(); }, PREVIEW_ART_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [artKey, isArt, revealArt]);

  // ── DERIVAÇÃO PURA (o que a tela mostra por TIPO de vaga) ──────────────────────────────────────
  // NÃO carrega activityId: o destino de "Editar" é SEMPRE a própria obra (a tela injeta o id).
  // NÃO celebra: é uma vista. Um kind desconhecido cai em 'empty' (honesto), nunca em "arte válida".
  const preview = deriveColoring60ArtPreview({ kind, activityId });

  // [C60-NAV · FLUXO 3] "Editar desenho" abre o editor da PRÓPRIA parte (o MESMO activityId da obra
  // aberta), jamais 'light'. `replace` CONSOME a prévia (ela não fica empilhada por baixo do editor —
  // era uma das fontes do acúmulo de pilha). Sem id, volta à coleção.
  const onEdit = useCallback(() => {
    if (activityId == null) { c60BackFromPreview(navigation, storyId); return; }
    c60EditFromPreview(navigation, storyId, activityId);
  }, [navigation, storyId, activityId]);

  // [C60-NAV · FLUXO 4] "Voltar" volta à COLEÇÃO como instância única (nunca acumula), um só Voltar.
  const onBack = useCallback(() => { c60BackFromPreview(navigation, storyId); }, [navigation, storyId]);

  const handlePreviewAction = useCallback((action) => {
    const k = action?.kind ?? null;
    if (k === COLORING60_ACTION.RESTART) { onEdit(); return; }
    onBack();
  }, [onEdit, onBack]);

  // [C60-ETAPA2] Mensagem honesta central POR ESTADO (nunca o contorno sozinho, nunca a moldura vazia).
  // Enquanto abre, diz que está abrindo; se prometia arte e não há (ponteiro órfão ou imagem falhou),
  // é honesto sobre a integridade; concluída-sem-pixels é celebrada; senão, convida a colorir.
  const honestText = previewState === PREVIEW_STATE.LOADING
    ? 'Abrindo sua criação…'
    : previewState === PREVIEW_STATE.INTEGRITY_ERROR
      ? 'Esta parte precisa de cor de novo'
      : kind === SLOT.NOT_PERSISTED
        ? 'Você coloriu esta parte!'
        : 'Ainda falta colorir esta parte';

  if (previewState === PREVIEW_STATE.READ_ERROR) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top + 24 }]}>
        <LinearGradient
          colors={['#FFFDF8', colors.background, colors.cream]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.errorTitle}>Não conseguimos abrir esta criação agora</Text>
        <Text style={styles.errorText}>Suas pinturas continuam guardadas. Tente de novo em instantes.</Text>
        <SoundButton style={styles.primaryBtn} onPress={onBack} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Voltar</Text>
        </SoundButton>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Fundo NEUTRO e constante — nunca a cor temática da parte (a mesma regra da coleção). */}
      <LinearGradient
        colors={['#FFFDF8', colors.background, colors.cream]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Corpo: a OBRA é a protagonista. Topo LIMPO — nenhuma barra "Voltar" (a única saída mora no
          rodapé ancorado, EVID 5). Reserva do notch via insets, sem colidir com o cabeçalho (EVID 4). */}
      <View style={[styles.body, { paddingTop: insets.top + 16 }]}>
        {/* Cabeçalho enxuto: título da PRÓPRIA atividade + chip do marcador na COR TEMÁTICA da parte. */}
        <View style={styles.header}>
          {slot?.title ? <Text style={styles.title}>{slot.title}</Text> : null}
          {slot?.marker ? (
            <View style={[styles.markerPill, { backgroundColor: theme.chipBg, borderColor: theme.frame }]}>
              <Text style={[styles.markerText, { color: theme.chipText }]}>{slot.marker}</Text>
            </View>
          ) : null}
        </View>

        {/* Área elástica MEDIDA (onLayout): a moldura se dimensiona ao espaço REAL entre o cabeçalho e o
            Beni — a obra 4:5 cabe inteira e o Beni + o rodapé ficam SEMPRE abaixo dela, nunca cobertos
            (EVID 6). Sem rolagem. */}
        <View style={styles.artArea} onLayout={onArtAreaLayout}>
          {/* Moldura FINA temática (borda = cor da parte), fundo limpo, SEM matte branco: a arte preenche
              a moldura toda (EVID 9). Nenhum texto sobre a pintura. Entra COMPOSTA num fade curto. */}
          <View style={[styles.artFrame, { width: artW, height: artH, borderColor: theme.frame }]}>
            {isArt ? (
              <Animated.View key={artKey} style={[StyleSheet.absoluteFill, { opacity: artOpacity }]}>
                <Image
                  source={{ uri: visual.paintUri }}
                  style={positioned && paintStyle ? paintStyle : StyleSheet.absoluteFill}
                  resizeMode={positioned ? 'stretch' : 'contain'}
                  fadeDuration={0}
                  onLoad={() => reportLoad('paint', true)}
                  onError={() => reportLoad('paint', false)}
                />
                <Image
                  source={slot.lineart}
                  style={positioned && lineartStyle
                    ? [lineartStyle, styles.multiply]
                    : [StyleSheet.absoluteFill, styles.multiply]}
                  resizeMode={positioned ? 'stretch' : 'contain'}
                  fadeDuration={0}
                  onLoad={() => reportLoad('lineart', true)}
                  onError={() => reportLoad('lineart', false)}
                />
              </Animated.View>
            ) : (
              // Estado honesto: NUNCA o contorno sozinho no lugar da obra.
              <View style={styles.honest}>
                <Text style={styles.honestText}>{honestText}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reação CURTA do Beni (pose já existente) POR ATIVIDADE, fora da arte — jamais a celebração de
            3 de 3. Fica ACIMA do rodapé (o artArea elástico reserva o espaço). */}
        <View style={styles.beniRow}>
          <BeniMascotImage
            variant={preview.beniPose}
            style={styles.beni}
            accessibilityLabel="Beni ao lado da sua criação"
          />
          <View style={styles.reactionCard}>
            <Text style={styles.reactionText}>{preview.reaction}</Text>
          </View>
        </View>
      </View>

      {/* Rodapé ANCORADO: "Editar desenho" (principal, abre o editor da PRÓPRIA parte) + "Voltar"
          (secundário, volta à coleção). Sempre ao alcance, fora de qualquer rolagem. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <SoundButton
          style={styles.primaryBtn}
          onPress={() => handlePreviewAction(preview.editAction)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={preview.editAction.label}
        >
          <Text style={styles.primaryBtnText}>{preview.editAction.label}</Text>
        </SoundButton>
        <SoundButton
          style={styles.secondaryBtn}
          onPress={() => handlePreviewAction(preview.backAction)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={preview.backAction.label}
        >
          <Text style={styles.secondaryBtnText}>{preview.backAction.label}</Text>
        </SoundButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  body: { flex: 1, paddingHorizontal: 18, paddingBottom: 8 },
  header: { alignItems: 'center' },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  // Chip do marcador: forma neutra; a COR (fundo/borda/texto) vem inline da atividade (tema único).
  markerPill: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  markerText: { fontSize: 13, fontWeight: '800' },

  // Área elástica que centra a moldura no espaço REAL entre cabeçalho e Beni (medida por onLayout).
  artArea: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  // Moldura FINA (borda = cor temática, injetada inline). borderWidth casa com FRAME_BORDER (o innerW/
  // innerH do posicionamento). Sem matte: os filhos preenchem a caixa de conteúdo inteira.
  artFrame: {
    borderRadius: radii.lg,
    backgroundColor: '#FFFDF8',
    borderWidth: 3,
    overflow: 'hidden',
    ...shadows.card,
  },
  multiply: { mixBlendMode: 'multiply' },
  honest: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  honestText: { fontSize: 15, fontWeight: '700', color: colors.textSoft, textAlign: 'center' },

  beniRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, width: '100%' },
  beni: { width: 78, height: 98, resizeMode: 'contain' },
  reactionCard: {
    flex: 1,
    marginLeft: 10,
    padding: 13,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  reactionText: { fontSize: 15, fontWeight: '700', color: colors.text, lineHeight: 21 },

  // Rodapé ANCORADO, SEM hairline (fio) no topo — apenas o creme sólido separa do corpo.
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
