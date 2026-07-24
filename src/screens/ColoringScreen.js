import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Animated, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import ColoringCanvas, { ERASER_COLOR } from '../components/ColoringCanvas';
import { COLOR_PALETTE } from '../constants/colorPalette';
import SoundButton from '../components/SoundButton';
import { useResolvedColoringImage } from '../hooks/useResolvedStoryMedia';
import {
  getSavedDrawing,
  saveDrawingState,
  clearDrawingState,
  clearAllSavedDrawings,
  hasMeaningfulPaint,
} from '../services/drawingStorage';
import { markStoryColoringActivityDone } from '../services/coloringActivityService';
import { useProgressContext } from '../context/ProgressContext';
import { canOpenStoryFullExperience } from '../services/contentAccessService';
import { isCreatorQaModeEnabled } from '../services/creatorQaMode';
import FaithIcon from '../components/ui/FaithIcon';
import { backLabelFor } from '../utils/originBack';
// P2.T2 (Colorir 60) — resolvedor local ADITIVO por (storyId, activityId). Consumido
// SOMENTE no ramo aditivo abaixo; o caminho legado por cena não o toca.
import {
  resolveColoring60Lineart,
  COLORING60_RESOLUTION_STATUS,
} from '../services/coloring60Resolver';
// P4.T1/T2 (Colorir 60) — conclusão por identidade (plan-agnóstica) e writer dedicado de
// pixels (revalida o plano internamente). Ambos consumidos SOMENTE no ramo aditivo abaixo:
// a CONCLUSÃO é separada do SALVAMENTO (o writer só persiste no Plano Família). O caminho
// legado por cena não toca nenhum dos dois.
import {
  markColoring60ActivityDone,
  loadColoring60Done,
  // [C60-P12R-RESET] Limpeza SIMÉTRICA da conclusão — usada só pelo reset seguro de Dev (§Parte 1/10).
  clearColoring60Done,
} from '../services/coloring60ActivityService';
// P8 (Colorir 60) — ordem FECHADA das três atividades (fonte única: o catálogo) e a experiência
// afetiva de conclusão. O componente é presentacional: recebe o que já aconteceu e devolve a
// escolha da criança; não decide conclusão, não persiste e não conhece plano.
import { getColoring60Activities } from '../data/coloring60Catalog';
import Coloring60CompletionOverlay, {
  Coloring60ArtGlow,
} from '../components/coloring60/Coloring60CompletionOverlay';
// P7 (Colorir 60) — a LEITURA da arte guardada vem do MESMO serviço dedicado do piloto
// (namespace fechado `@ptf_drawing60_s<storyId>_a<activityId>`), nunca da chave legada de cena.
// Nenhum sistema de storage novo é criado aqui: o serviço já publica leitura, escrita e limpeza.
import {
  saveColoring60DrawingState,
  getColoring60SavedDrawing,
  COLORING60_SAVE_RESULT,
  // [C60-P12R-RESET] Limpeza dos pixels por identidade isolada — usada só pelo reset seguro de Dev.
  clearColoring60SavedDrawing,
} from '../services/coloring60DrawingStorage';
// P6 (Colorir 60) — autorização do piloto visível. Reusa a flag OFICIAL do piloto (default
// false, inalterada) e o mecanismo ÚNICO de ferramentas internas já existente. Nenhuma
// configuração paralela de ferramentas internas é criada aqui.
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';
// P8B (Colorir 60) — aquecimento da pose de conclusão do Beni. Usa apenas o `Image.prefetch` do
// próprio React Native (sem lib nova e sem qualquer primitiva de pack) para aquecer a textura
// empacotada ANTES do toque em "Pronto!", de modo que a camada de conclusão não precise "buscar"
// a imagem na hora. Em produção o recurso já é local — o aquecimento é inerte. Nenhuma dependência
// nova e nada de download de conteúdo remoto: é só a mesma imagem que já vem no app.
import { BENI_IMAGES } from '../assets/mascot/beniImages';

// Orientação inicial do Colorir (UI-pref, não progresso): aparece UMA vez por
// dispositivo e some ao tocar "Entendi", ao pintar pela 1ª vez ou por tempo.
// Chave nova (v_start) para que a nova orientação apareça uma vez para todos.
const PAN_HINT_KEY = '@ptf_coloring_start_hint_v1';


// Ferramenta compacta: só ícone (sem rótulo embaixo) com área tocável segura.
// Ferramentas de alta repetição (borracha/desfazer): sem som (Bloco 5).
function CompactTool({ children, onPress, active, accessibilityLabel }) {
  return (
    <SoundButton
      silent
      accessibilityLabel={accessibilityLabel}
      style={[styles.compactTool, active && styles.compactToolActive]}
      onPress={onPress}
    >
      {children}
    </SoundButton>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// P2.T2 — Ramo ADITIVO Colorir 60 por `activityId`.
//
// `ColoringScreen` (export default) é um wrapper FINO e SEM hooks: se a rota traz
// `activityId` (string semântica), delega ao ramo Colorir 60; caso contrário, delega
// ao corpo LEGADO 100% intocado (`LegacyColoringScreen`). Como o wrapper não chama
// hooks e cada instância montada tem params fixos, não há violação das Regras de Hooks.
//
// Exposição pública: NENHUMA superfície pública passa `activityId` (flag
// COLORIR_60_CREATION_PILOT_ENABLED segue off; nenhuma rota nova criada). A ÚNICA entrada
// é interna (Área dos Pais → "Administração (dev)"), e o param SOZINHO não autoriza nada:
// o ramo revalida a autorização por `isColoring60PilotAllowed()` (ver abaixo).
// ─────────────────────────────────────────────────────────────────────────────
export default function ColoringScreen({ route, navigation }) {
  // `activityId` é semântico: presença (não-nula) seleciona o caminho Colorir 60.
  if (route.params?.activityId != null) {
    // [C60-P4-IDENTITY-KEY] Remontagem SEGURA por identidade (Etapa 5): a `key` deriva da
    // identidade composta (storyId resolvido + activityId). Quando a identidade muda na MESMA
    // rota (ex.: light → living_world quando P5 os ativar), o React remonta o ramo do zero —
    // todos os estados locais voltam ao inicial (c60Ready=false [D1], c60HasPainted=false [D5],
    // c60Saving=false, cor padrão), o `canvasRef` é novo e nenhum callback de export pendente da
    // atividade anterior atravessa. Como `resolution.source` é função pura de (storyId,activityId),
    // trocar o lineart também troca a key. Wrapper permanece SEM hooks (resolveC60StoryId é puro).
    const c60Key = `${resolveC60StoryId(route.params) ?? 'none'}::${route.params.activityId}`;
    return <Coloring60ActivityScreen key={c60Key} route={route} navigation={navigation} />;
  }
  return <LegacyColoringScreen route={route} navigation={navigation} />;
}

// [C60-P6-GATE] Autorização do piloto visível. O PARÂMETRO DE ROTA NÃO AUTORIZA SOZINHO:
// mesmo com `activityId` na rota, o piloto só abre quando a flag oficial está ligada OU
// quando estamos em desenvolvimento COM as ferramentas internas realmente habilitadas pelo
// mecanismo ÚNICO já existente (`isInternalToolsEnabled` — o mesmo que gateia a seção
// "Administração (dev)" e as rotas internas). Nenhuma configuração paralela é criada e a
// flag continua `false` por padrão. Em produção (flag falsa, sem `__DEV__`, sem ferramentas
// internas) esta função devolve false e o piloto permanece INACESSÍVEL mesmo que alguém
// navegue direto com o parâmetro. Função pura e síncrona — pode ser lida em render.
function isColoring60PilotAllowed() {
  if (COLORIR_60_CREATION_PILOT_ENABLED) return true;
  const dev = typeof __DEV__ !== 'undefined' && __DEV__ === true;
  return dev && isInternalToolsEnabled();
}

// [C60-P4-STORYID] Fonte ÚNICA de storyId (Etapa 8). `route.params.storyId` é a identidade
// primária. Se `route.params.story?.id` também vier e DIVERGIR, a identidade é contraditória:
// não escolhe silenciosamente — devolve null (→ resolvedor 'unknown', estado honesto). Sem
// divergência, aceita a que existir. Nunca coage a número nem interpreta como cena/índice.
function resolveC60StoryId(params) {
  const primary = params?.storyId ?? null;
  const alt = params?.story?.id ?? null;
  if (primary != null && alt != null && primary !== alt) return null; // contradição → não resolve
  return primary ?? alt;
}

// [C60-P4-PAYLOAD] Validação de payload NO CHAMADOR (Etapa 9), SEM alterar o contrato do writer.
// Aceita SOMENTE um data URL de imagem OU o JSON v2 do canvas ({ v:2, ..., data:<data URL> }).
// Rejeita null/undefined/vazio/malformado e QUALQUER ponteiro (v3): o writer é quem materializa
// v3 internamente; o caller nunca lhe envia um ponteiro. Assim o writer nunca recebe lixo.
function isAcceptableC60Payload(payload) {
  if (typeof payload !== 'string' || payload.length === 0) return false;
  if (payload.startsWith('data:image/')) return payload.length > 1000;
  let obj;
  try { obj = JSON.parse(payload); } catch { return false; }
  if (!obj || typeof obj !== 'object') return false;
  if (obj.v === 3 || typeof obj.uri === 'string') return false; // ponteiro v3 nunca vem do canvas
  return obj.v === 2
    && typeof obj.data === 'string'
    && obj.data.startsWith('data:image/')
    && obj.data.length > 1000;
}

// [C60-P4-LOCK] Controlador de tentativa SÍNCRONO (FIX2 · Etapa 3). Serializa as tentativas de
// conclusão SEM depender da renderização do React: a trava é lida e adquirida no MESMO tick do
// toque, ANTES de `setC60Saving`/`exportPaint`. Por isso duas chamadas síncronas no mesmo frame
// não conseguem, ambas, iniciar um export — a segunda recebe token null. É a trava AUTORITATIVA
// (o estado React `c60Saving`/`disabled` permanece apenas como representação visual complementar).
//   - acquire(): concede SOMENTE quando não há tentativa vigente; devolve um token monotônico
//     (nunca reusado). Segunda chamada síncrona ⇒ null.
//   - isCurrent(token): true só para o token da tentativa AINDA vigente — distingue o callback vivo
//     de um callback antigo/duplicado/expirado.
//   - release(token): libera SOMENTE se o token ainda for o vigente — um callback antigo jamais
//     libera a tentativa nova.
//   - invalidate(): encerra a tentativa vigente (unmount / remontagem por identidade), tornando
//     qualquer token anterior inerte.
// API por instância (um controlador por montagem). NÃO exportada, NÃO global (nenhuma infra externa).
function createC60AttemptController() {
  let current = 0; // token da tentativa vigente (0 = nenhuma)
  let seq = 0;     // gerador monotônico de tokens (nunca reusa)
  return {
    acquire() {
      if (current !== 0) return null; // já há tentativa em curso ⇒ segunda chamada bloqueada
      seq += 1;
      current = seq;
      return current;
    },
    isCurrent(token) {
      return token != null && token === current;
    },
    release(token) {
      if (token === current) current = 0; // só o token vigente libera
    },
    invalidate() {
      current = 0; // encerra a vigente; tokens anteriores deixam de ser current
    },
  };
}

// [C60-P4-HANDLER-START] Núcleo de UMA tentativa de conclusão (FIX2 · Etapas 4-7), isolado do React
// (recebe TODAS as dependências por injeção) para ser exercitável por testes COMPORTAMENTAIS reais.
// Ordem canônica: available → D1(ready) → D5(painted) → LOCK SÍNCRONO (acquire) → setSaving(true) →
// exportPaint ÚNICO. A segunda chamada síncrona para no acquire (token null), ANTES de exportar. O
// callback captura token+identidade e revalida activeRef+isCurrent(token) antes de qualquer efeito e
// após cada await; try/catch/finally garantem: sem unhandled rejection; writer nunca chamado sob
// mark!==true; conclusão nunca apagada por falha do writer; e o token CORRETO sempre liberado (nunca
// o de uma tentativa nova). canvas ausente / exportPaint lançando ⇒ libera o lock e reabilita a tela.
// P7 · o retorno à tela anterior passa a depender da GRAVAÇÃO confirmada (`saved`): qualquer
// outro desfecho mantém a criança na atividade, com a pintura ainda na tela, e avisa por
// `onSaveIssue` (dependência OPCIONAL — o núcleo continua utilizável sem ela).
// P8 · o desfecho passa a ser CELEBRADO em vez de navegar sozinho (§4.7 — a navegação só
// acontece depois da escolha da criança). Dois desfechos são conclusão VISUAL da pintura:
// `saved` (arte guardada) e `not_persisted_free` (não guardada — o que NÃO é erro para a
// criança, §5). Falhas técnicas de verdade (`write_failed`, `invalid_identity`) continuam
// no tratamento de erro por `onSaveIssue`. `onCelebrate` é dependência OPCIONAL: sem ela o
// núcleo mantém EXATAMENTE o comportamento anterior (voltar após gravação confirmada).
function beginC60Attempt(deps) {
  const {
    controller, canvasRef, activeRef,
    available, ready, painted, saving,
    storyId, activityId, setSaving, goBack, onSaveIssue, onCelebrate,
  } = deps;
  if (!available || saving) return; // guard visual complementar (a trava real é o controller)
  if (!ready) return;       // D1: sem lineart pronto não conclui nem salva
  if (!painted) return;     // D5: sem traço significativo não conclui nem salva
  const token = controller.acquire(); // LOCK SÍNCRONO antes de setSaving/exportPaint
  if (token == null) return;          // segunda tentativa no mesmo tick para AQUI (antes do export)
  setSaving(true);
  const attemptStoryId = storyId;     // identidade capturada DESTA tentativa
  const attemptActivityId = activityId;
  const canvas = canvasRef.current;
  if (!canvas) { // canvas ausente: libera o lock e reabilita a tela, sem marcar/salvar/navegar
    controller.release(token);
    setSaving(false);
    return;
  }
  try {
    canvas.exportPaint(async (exportData) => {
      // Callback antigo/duplicado ou instância inativa (troca de identidade/saída): INERTE — não
      // marca/salva/navega e não libera uma tentativa nova.
      if (!activeRef.current || !controller.isCurrent(token)) return;
      try {
        if (!isAcceptableC60Payload(exportData) || !hasMeaningfulPaint(exportData)) return;
        // CONCLUSÃO ≠ SALVAMENTO: marca a conclusão (plan-agnóstica) ANTES do writer.
        const completed = await markColoring60ActivityDone(attemptStoryId, attemptActivityId);
        if (completed !== true) { // conclusão não persistida ⇒ writer NÃO é chamado, sem navegar
          if (__DEV__) console.log('[Coloring60] conclusão NÃO persistida; writer não chamado');
          return;
        }
        // Writer dedicado (revalida o plano internamente). Falha JAMAIS apaga a conclusão.
        const result = await saveColoring60DrawingState(attemptStoryId, attemptActivityId, exportData);
        const resultLabel =
          result === COLORING60_SAVE_RESULT.SAVED ? 'saved'
          : result === COLORING60_SAVE_RESULT.NOT_PERSISTED_FREE ? 'not_persisted_free'
          : result === COLORING60_SAVE_RESULT.WRITE_FAILED ? 'write_failed'
          : 'invalid_identity';
        if (__DEV__) console.log('[Coloring60] conclusão preservada; persistência:', resultLabel);
        if (!activeRef.current || !controller.isCurrent(token)) return; // expirou durante o writer
        // FALHA TÉCNICA de verdade (escrita falhou ou identidade recusada): a tela NÃO fecha e NÃO
        // celebra — anunciar sucesso aqui seria mentir. A pintura continua visível, a conclusão já
        // persistida é preservada e o desfecho é comunicado de forma honesta.
        const celebravel = result === COLORING60_SAVE_RESULT.SAVED
          || result === COLORING60_SAVE_RESULT.NOT_PERSISTED_FREE;
        if (!celebravel) {
          if (typeof onSaveIssue === 'function') onSaveIssue(resultLabel);
          return;
        }
        // Desfecho celebrável: a experiência assume daqui, e QUEM NAVEGA é a criança (§4.7).
        // `persisted` é informativo e honesto (nunca vira "salvo" quando não foi) — a experiência
        // infantil é a mesma nos dois casos e não menciona plano.
        if (typeof onCelebrate === 'function') {
          // P10 · o instantâneo (snapshot) da pintura recém-exportada acompanha o desfecho: a
          // experiência de conclusão usa a arte ATUAL mesmo quando o plano não persiste (Grátis),
          // sem o overlay precisar tocar o writer. `persisted` continua honesto (nunca vira "salvo").
          onCelebrate({ persisted: result === COLORING60_SAVE_RESULT.SAVED, snapshot: exportData });
          return;
        }
        goBack();
      } catch (err) { // mark/writer lançou: conclusão preservada, SEM unhandled rejection
        if (__DEV__) console.log('[Coloring60] erro na conclusão (conclusão preservada):', err?.message);
      } finally {
        // Libera SOMENTE o token vigente (um callback antigo não libera a tentativa nova) e reabilita
        // a tela apenas se a instância ainda estiver ativa.
        if (controller.isCurrent(token)) {
          controller.release(token);
          if (activeRef.current) setSaving(false);
        }
      }
    });
  } catch (err) { // exportPaint lançou SINCRONICAMENTE: libera o lock e reabilita a tela
    if (__DEV__) console.log('[Coloring60] exportPaint lançou sincronicamente:', err?.message);
    controller.release(token);
    setSaving(false);
  }
}
// [C60-P4-HANDLER-END]

// [C60-P10-HYDRATION] Constantes da HIDRATAÇÃO VISUAL ATÔMICA (P10 · Parte 2). A "capa de
// hidratação" cobre a área do canvas na MESMA cor de fundo do motor (#FFFDF8), sem lineart e
// sem texto piscando, até o PRIMEIRO quadro estável: a arte COLORIDA (quando há desenho salvo)
// ou o lineart limpo (quando não há). Só então a capa esvanece. O tempo-limite fica pouco ACIMA
// do timeout interno do canvas — assim um erro do motor aparece DEPOIS da revelação, nunca preso
// atrás da capa; o atraso do indicador evita que ele "pisque" em cargas muito rápidas.
const HYDRATION_COVER_TIMEOUT_MS = 8000;
const HYDRATION_SPINNER_DELAY_MS = 350;

// Ramo Colorir 60: presentacional e local-first. Resolve por (storyId, activityId), respeita os
// três estados honestos e — no estado `available` (P4.T2) — compõe o `ColoringCanvas` existente
// (SEM alterar seu contrato) com paleta e "Pronto". A CONCLUSÃO (booleano leve, plan-agnóstica) é
// SEPARADA do SALVAMENTO de pixels (writer, que só persiste no Plano Família): concluir vale para
// Grátis e Família; salvar pixels é gated pelo writer. NÃO usa o caminho legado (`getColoringImage`/
// cena), NÃO faz fallback para scene_02, NÃO concede estrela, NÃO conclui cena narrativa, NÃO chama
// refreshProgress (o ramo dormente não tem métrica pública). deferred/unknown mostram estado honesto.
function Coloring60ActivityScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const canvasRef = useRef(null);
  // [C60-P4-ACTIVE] Marca a instância como ativa. A remontagem por identidade (key no wrapper) e a
  // saída da tela desmontam ESTA instância → activeRef.current = false. Um callback de export tardio
  // (identidade trocada ou tela abandonada) é abortado ANTES de marcar/salvar; e como o closure do
  // handler capturou a identidade DESTA instância, jamais toca a nova identidade.
  const activeRef = useRef(true);
  // [C60-P4-LOCK] Trava síncrona AUTORITATIVA por instância (FIX2). Um controlador por montagem;
  // criado de forma preguiçosa (idempotente) e invalidado no unmount/remontagem. Ver
  // createC60AttemptController — o estado React `c60Saving`/`disabled` é só complemento visual.
  const attemptControllerRef = useRef(null);
  if (attemptControllerRef.current === null) attemptControllerRef.current = createC60AttemptController();
  // [C60-P7-RESTORE] Arte guardada CANDIDATA desta identidade: fica só em memória até o próprio
  // canvas confirmar que ela é aplicável (onPaintValid). Ref (não estado) porque nada na interface
  // depende dela antes de ser aplicada — evita re-render sem benefício.
  const restoreRef = useRef(null);
  const [c60Color, setC60Color] = useState(COLOR_PALETTE[0].hex);
  const [c60Ready, setC60Ready] = useState(false);      // D1: lineart carregado no canvas
  const [c60HasPainted, setC60HasPainted] = useState(false); // D5: houve traço significativo
  const [c60Saving, setC60Saving] = useState(false);
  // [C60-P8-PROGRESS] Progresso das TRÊS atividades do piloto (Luz · Vida · Cuidado). A ORDEM vem
  // do catálogo fechado e a CONCLUSÃO do serviço plan-agnóstico do piloto — nada aqui é progresso
  // narrativo, conquista ou métrica pública da história.
  const [c60DoneMap, setC60DoneMap] = useState({});
  // [C60-P8-CELEBRATION] Momento de conclusão em exibição. Enquanto ele está ligado, os controles
  // de pintura somem suavemente e a pintura fica visível e congelada atrás da camada.
  const [c60Celebrating, setC60Celebrating] = useState(false);
  const controlsAnim = useRef(new Animated.Value(1)).current;
  // [C60-P11-CELEBRATION-MACHINE] Qual conclusão está em exibição (Parte 4): 'activity' (primeira
  // conclusão de uma atividade), 'finale' (grande conclusão das três) ou 'update' (recolorir uma
  // atividade já concluída — celebração de atualização). null = nenhuma. E os itens já resolvidos da
  // galeria da grande conclusão (3 desenhos: atual em memória + os outros dois lidos do serviço
  // isolado). A DECISÃO de qual modo vive na máquina de conclusão abaixo.
  const [c60CelebrateMode, setC60CelebrateMode] = useState(null);
  const [c60FinaleItems, setC60FinaleItems] = useState(null);
  // [C60-P11-FRAME] Snapshot (payload v2) da arte no momento do "Pronto!". Alimenta o quadro de
  // brilho (Coloring60ArtGlow) para que a moldura siga os LIMITES REAIS da arte (Parte 3), e a
  // galeria da grande conclusão quando a arte atual só existe em memória. null = nenhuma celebração.
  const [c60CelebrateSnapshot, setC60CelebrateSnapshot] = useState(null);
  // [C60-P12-FRAME] Área MEDIDA do canvas (x/y/largura/altura, no espaço do container), capturada pelo
  // onLayout da canvasArea. É a mesma geometria da moldura viva (artRectFromSnapshot): passada ao
  // overlay, faz as partículas e o Beni nascerem ancorados aos LIMITES REAIS do desenho (§Parte 9).
  const [c60CanvasFrame, setC60CanvasFrame] = useState(null);
  // [C60-P10-HYDRATION] Estado da HIDRATAÇÃO VISUAL ATÔMICA (Parte 2). `c60RevealMode` decide o que
  // será o PRIMEIRO quadro visível: 'probing' (ainda lendo o storage — capa opaca), 'paint' (há arte
  // salva; capa fica até a pintura estar DESENHADA no canvas) ou 'lineart' (sem arte salva; capa fica
  // até o canvas ficar pronto, revelando o contorno limpo). `hydratedRef` blinda contra revelar duas
  // vezes; `hydrationCoverAnim` é a opacidade da capa (1 = opaca, 0 = revelada).
  const [c60RevealMode, setC60RevealMode] = useState('probing');
  const [c60PaintApplied, setC60PaintApplied] = useState(false);
  const [c60Hydrated, setC60Hydrated] = useState(false);
  const [c60HydrationSpinner, setC60HydrationSpinner] = useState(false);
  const hydratedRef = useRef(false);
  const hydrationCoverAnim = useRef(new Animated.Value(1)).current;

  const storyId = resolveC60StoryId(route.params);
  const activityId = route.params?.activityId ?? null;
  // [C60-P6-GATE] Defesa em profundidade: sem autorização o ramo NÃO resolve lineart algum —
  // devolve o MESMO estado honesto já usado para identidade fora do piloto ('unknown'). Sem
  // imagem, sem canvas, sem escrita: retorno seguro pelo padrão que a tela já usa. A validação
  // do `activityId` continua sendo a do resolvedor puro (não é reimplementada aqui): id fora da
  // lista fechada do catálogo é 'unknown' e NUNCA cai em cena legada.
  const pilotAllowed = isColoring60PilotAllowed();
  const resolution = pilotAllowed
    ? resolveColoring60Lineart(storyId, activityId)
    : { status: COLORING60_RESOLUTION_STATUS.UNKNOWN, activity: null, source: null };
  const available = resolution.status === COLORING60_RESOLUTION_STATUS.AVAILABLE;
  // As três atividades na ordem do catálogo, com o que já foi concluído. Cálculo barato (3 itens)
  // e derivado — sem estado duplicado e sem outra fonte de verdade.
  const c60Steps = getColoring60Activities(storyId)
    .map((a) => ({ id: a.activityId, done: c60DoneMap[a.activityId] === true }));
  const c60NextId = c60Steps.find((s) => !s.done)?.id ?? null;
  // [C60-P12-SEED] Identidade determinística da celebração vigente (atividade + modo + progresso). É a
  // semente ESTÁVEL das partículas do overlay (sem Math.random): o mesmo evento gera sempre a mesma
  // disposição, e re-render não "reembaralha". Derivada — sem estado novo e sem tocar a máquina.
  const c60CelebrationId = `${activityId ?? 'none'}:${c60CelebrateMode ?? 'idle'}:${c60Steps.filter((s) => s.done).length}`;

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      // Invalida a tentativa vigente ao desmontar/remontar por identidade: um callback de export
      // pendente falhará em isCurrent(token) e ficará inerte (não marca/salva/navega/libera novo).
      attemptControllerRef.current?.invalidate();
    };
  }, []);

  // [C60-P12R-DEV-RESET] §Parte 1/10 · RESET SEGURO para reencenar os estados 0/3, 1/3, 2/3 e 3/3 no
  // Dev Client sem apagar o mundo. Age SÓ nas 3 atividades de "A Criação" (piloto): apaga a CONCLUSÃO
  // (chave `@ptf_coloring60_done_creation_*`) e os PIXELS (`@ptf_drawing60_screation_a*`). NÃO toca
  // onboarding, perfil, packs, downloads, estrelas, conquistas nem outra história/cena. Só existe em
  // __DEV__ e atrás do gate de ferramentas internas do piloto — jamais no app de produção.
  //   • __devResetCreationColoring60()   → volta ao 0/3 (nada concluído, sem arte).
  //   • __devSeedCreationColoring60(n)   → marca n concluídas (0..3) para chegar a 1/3 ou 2/3 e então
  //     colorir a última no aparelho e observar a transição real 2→3 (a GRANDE conclusão só uma vez).
  useEffect(() => {
    if (!__DEV__ || !isColoring60PilotAllowed()) return undefined;
    const ids = getColoring60Activities('creation').map((a) => a.activityId);
    global.__devResetCreationColoring60 = async () => {
      for (let i = 0; i < ids.length; i += 1) {
        await clearColoring60Done('creation', ids[i]); // conclusão (booleano leve)
        await clearColoring60SavedDrawing('creation', ids[i]); // pixels (writer isolado)
      }
      setC60DoneMap({});
      setC60Celebrating(false);
      setC60CelebrateMode(null);
      setC60CelebrateSnapshot(null);
      setC60FinaleItems(null);
      controlsAnim.setValue(1);
      console.log('[DEV Colorir60] Reset "A Criação": conclusão + pixels das 3 atividades apagados. Estado 0/3.');
    };
    global.__devSeedCreationColoring60 = async (n = 1) => {
      const k = Math.max(0, Math.min(ids.length, Number(n) || 0));
      const next = {};
      for (let i = 0; i < k; i += 1) {
        await markColoring60ActivityDone('creation', ids[i]);
        next[ids[i]] = true;
      }
      setC60DoneMap(next);
      console.log(`[DEV Colorir60] Semeado ${k}/${ids.length} concluída(s) (sem pixels). Para a transição 2→3 use __devSeedCreationColoring60(2) e colorir a 3ª no aparelho.`);
    };
    console.log('[DEV Colorir60] Helpers: __devResetCreationColoring60() | __devSeedCreationColoring60(n)');
    return () => {
      delete global.__devResetCreationColoring60;
      delete global.__devSeedCreationColoring60;
    };
  }, []);

  // [C60-P7-RESTORE] Retomada da arte por IDENTIDADE ISOLADA (storyId + activityId), lida pelo
  // serviço dedicado do piloto — nunca pela chave legada de cena e nunca pela arte de outra
  // atividade. Só executa com o piloto AUTORIZADO e a atividade resolvida (`available`): sem
  // autorização não há leitura, não há escrita e nenhuma chave é criada. A validação é
  // ENFILEIRADA pelo canvas até o READY (mesmo mecanismo do fluxo legado) e a pintura só é
  // aplicada depois que o canvas confirmar compatibilidade. Sem arte salva → lineart limpo.
  useEffect(() => {
    if (!available) return undefined;
    let alive = true;
    getColoring60SavedDrawing(storyId, activityId)
      .then((saved) => {
        if (!alive || !activeRef.current) return;
        if (!saved || !isAcceptableC60Payload(saved) || !hasMeaningfulPaint(saved)) {
          if (__DEV__ && saved) console.log('[Coloring60] arte guardada ignorada: payload sem tinta utilizável');
          // [C60-P10-HYDRATION] Sem arte salva utilizável: o primeiro quadro será o LINEART limpo.
          // A capa fica até o canvas ficar pronto (evita mostrar o "Carregando" interno piscando).
          setC60RevealMode('lineart');
          return;
        }
        // [C60-P10-HYDRATION] Há arte salva: o primeiro quadro DEVE ser a arte COLORIDA. A capa
        // permanece opaca até o canvas confirmar que a pintura foi DESENHADA (PAINT_APPLIED) —
        // nunca revelamos o contorno sem cor. `validatePaint` primeiro, `loadPaint` só se aplicável.
        setC60RevealMode('paint');
        restoreRef.current = saved;
        canvasRef.current?.validatePaint(saved);
      })
      .catch((err) => {
        // Leitura falhou: abre limpo. Não derruba a tela e não apaga nada do que está guardado.
        if (__DEV__) console.log('[Coloring60] leitura da arte guardada falhou:', err?.message);
        if (alive && activeRef.current) setC60RevealMode('lineart');
      });
    return () => { alive = false; };
  }, []);

  // [C60-P8-PROGRESS] Lê a conclusão das TRÊS atividades desta história uma única vez, ao abrir.
  // Leitura plan-agnóstica e somente-leitura: não cria chave, não escreve e não conclui nada.
  // Falha de leitura não derruba a tela — a experiência mostra o que sabe.
  useEffect(() => {
    if (!available) return undefined;
    let alive = true;
    const ids = getColoring60Activities(storyId).map((a) => a.activityId);
    Promise.all(ids.map((id) => loadColoring60Done(storyId, id)))
      .then((flags) => {
        if (!alive || !activeRef.current) return;
        const mapa = {};
        ids.forEach((id, i) => { mapa[id] = flags[i] === true; });
        setC60DoneMap(mapa);
      })
      .catch((err) => {
        if (__DEV__) console.log('[Coloring60] leitura do progresso das atividades falhou:', err?.message);
      });
    return () => { alive = false; };
  }, []);

  // [C60-P8B-PREWARM] Aquece as poses de conclusão do Beni ANTES do toque em "Pronto!": no
  // desenvolvimento a textura chegava só quando a camada de conclusão montava (o Beni "aparecia
  // depois"). Aquece as CINCO poses de celebração do P12 (§Parte 13) — admiraEsquerda/admiraDireita
  // (atualização), celebraFrente/olhaAcima (primeira conclusão) e apresentaGaleria (grande conclusão)
  // — resolvendo a fonte empacotada e pedindo ao próprio RN para aquecer o cache de imagem uma única
  // vez, de forma preguiçosa e à prova de falha. Em produção o recurso já é local, então o efeito é
  // inerte. Só aquece com a atividade disponível (sem trabalho à toa).
  useEffect(() => {
    if (!available) return;
    [
      BENI_IMAGES.admiraEsquerda,
      BENI_IMAGES.admiraDireita,
      BENI_IMAGES.celebraFrente,
      BENI_IMAGES.apresentaGaleria,
      BENI_IMAGES.olhaAcima,
    ].forEach((asset) => {
      try {
        const warm = Image.resolveAssetSource?.(asset);
        if (warm?.uri) Image.prefetch(warm.uri)?.catch?.(() => {});
      } catch { /* aquecimento é best-effort: nunca derruba a tela */ }
    });
  }, []);

  // [C60-P10-HYDRATION] Revela o canvas UMA única vez: esvanece a capa de hidratação. Idempotente
  // (hydratedRef), sem repetir a animação em re-render. É chamado no momento certo pelo efeito
  // abaixo (arte desenhada OU lineart pronto) ou pelo tempo-limite de segurança.
  const revealCanvas = useCallback(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setC60Hydrated(true);
    Animated.timing(hydrationCoverAnim, {
      toValue: 0, duration: 260, useNativeDriver: true,
    }).start();
  }, [hydrationCoverAnim]);

  // [C60-P10-HYDRATION] Decide QUANDO a capa some, conforme o primeiro quadro pretendido:
  //   'paint'   → só quando a pintura salva já foi DESENHADA (PAINT_APPLIED): 1º quadro = arte colorida.
  //   'lineart' → quando o canvas fica pronto (contorno limpo já desenhado): 1º quadro = lineart.
  // Enquanto 'probing' (o storage ainda não respondeu) a capa PERMANECE — nunca revela um quadro cru.
  useEffect(() => {
    if (!available || c60Hydrated) return;
    if (c60RevealMode === 'paint' && c60PaintApplied) revealCanvas();
    else if (c60RevealMode === 'lineart' && c60Ready) revealCanvas();
  }, [available, c60Hydrated, c60RevealMode, c60PaintApplied, c60Ready, revealCanvas]);

  // [C60-P10-HYDRATION] Rede de segurança: se a hidratação não concluir a tempo (canvas travado,
  // erro de motor, leitura pendurada), a capa some assim mesmo — a criança nunca fica presa atrás
  // dela. O tempo fica pouco ACIMA do timeout interno do canvas, então um estado de erro do motor
  // aparece DEPOIS da revelação (visível e tocável), nunca escondido.
  useEffect(() => {
    if (!available) return undefined;
    const t = setTimeout(() => { revealCanvas(); }, HYDRATION_COVER_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [available, revealCanvas]);

  // [C60-P10-HYDRATION] Indicador calmo e ESTÁVEL (sem texto piscando) só aparece se a hidratação
  // demorar além de um limiar curto — em cargas rápidas ele nem chega a surgir. Some ao revelar.
  useEffect(() => {
    if (!available || c60Hydrated) return undefined;
    const t = setTimeout(() => { if (!hydratedRef.current) setC60HydrationSpinner(true); }, HYDRATION_SPINNER_DELAY_MS);
    return () => clearTimeout(t);
  }, [available, c60Hydrated]);

  // O canvas confirmou que a arte guardada é aplicável nesta tela: aplica e reconhece que há
  // pintura na frente da criança (D5) — o mesmo par (loadPaint + marcar pintado) que o fluxo
  // legado já usa ao continuar um desenho.
  function handleC60RestoreValid() {
    const saved = restoreRef.current;
    if (!saved) return;
    restoreRef.current = null;
    canvasRef.current?.loadPaint(saved);
    setC60HasPainted(true);
  }

  // Arte guardada inválida, corrompida ou de outro tamanho de tela: descarta o candidato e segue
  // com o LINEART LIMPO. Não apaga nada do storage (uma leitura ruim não autoriza destruir a arte
  // da criança), não recorre à pintura de outra atividade nem ao desenho legado da cena, e o
  // diagnóstico existe SOMENTE em desenvolvimento.
  function handleC60RestoreInvalid() {
    restoreRef.current = null;
    if (__DEV__) console.log('[Coloring60] arte guardada não aplicável; abrindo lineart limpo');
    // [C60-P10-HYDRATION] A arte salva não é aplicável: o primeiro quadro passa a ser o LINEART
    // limpo. Como isto só chega depois do READY, o efeito de revelação dispara de imediato.
    setC60RevealMode('lineart');
  }

  // [C60-P10-HYDRATION] O canvas confirmou que a pintura salva já foi DESENHADA neste frame — só
  // agora a capa pode sumir (o 1º quadro visível é a arte colorida). Sinal ADITIVO do ColoringCanvas
  // (o fluxo legado ignora `onPaintApplied`; aqui ele fecha a hidratação atômica sem flash).
  function handleC60PaintApplied() {
    setC60PaintApplied(true);
  }

  // §5 · desfecho HONESTO de FALHA TÉCNICA (escrita falhou / identidade recusada): a tela continua
  // aberta com a pintura visível e a criança recebe um aviso curto, no mesmo padrão de Alert já
  // usado nesta tela. Nenhuma escrita adicional parte daqui. O caso "não guardou porque não há
  // Plano Família" NÃO passa por aqui: para a criança aquilo não é erro (§5) — é conclusão, e
  // recebe a MESMA celebração, sem alerta e sem falar de plano.
  function handleC60SaveIssue() {
    Alert.alert(
      'Quase lá! 🎨',
      'Não conseguimos guardar sua pintura agora. Toque em Pronto de novo.',
      [{ text: 'Ok!' }],
    );
  }

  // [C60-P10-FINALE] Monta a GALERIA das três artes da grande conclusão. A atividade ATUAL usa o
  // instantâneo em memória (`snapshot`) — funciona inclusive no plano Grátis, que conclui mas não
  // persiste — e as outras duas leem a arte guardada pelo serviço dedicado do piloto (leitura
  // permitida SÓ nesta tela, que já importa esse serviço; o overlay JAMAIS toca o writer). Cada item
  // guarda `paint` (payload v2 aceitável e com traço significativo, ou null) e `lineart` (fonte local
  // AVAILABLE, ou null). Quando um desenho falta, `paint=null` e o overlay cai no fallback oficial (o
  // próprio lineart). À prova de falha: qualquer erro entrega galeria vazia e o overlay usa fallback.
  async function loadC60FinaleItems(currentSnapshot) {
    const activities = getColoring60Activities(storyId); // ordem fechada: Luz · Vida · Cuidado
    try {
      const items = await Promise.all(
        activities.map(async (a) => {
          let paint = null;
          if (a.activityId === activityId) {
            paint = typeof currentSnapshot === 'string' ? currentSnapshot : null;
          } else {
            try {
              const saved = await getColoring60SavedDrawing(storyId, a.activityId);
              if (saved && isAcceptableC60Payload(saved) && hasMeaningfulPaint(saved)) paint = saved;
            } catch (readErr) {
              if (__DEV__) console.log(`[Coloring60] galeria: leitura de ${a.activityId} falhou:`, readErr?.message);
            }
          }
          const res = resolveColoring60Lineart(storyId, a.activityId);
          const lineart = res.status === COLORING60_RESOLUTION_STATUS.AVAILABLE ? res.source : null;
          return { activityId: a.activityId, title: a.title, paint, lineart };
        }),
      );
      if (!activeRef.current) return;
      setC60FinaleItems(items);
    } catch (err) {
      if (__DEV__) console.log('[Coloring60] galeria da grande conclusão falhou:', err?.message);
      if (activeRef.current) setC60FinaleItems([]);
    }
  }

  // [C60-P11-MACHINE] MÁQUINA DE CONCLUSÃO (§Parte 4 — Diretor de Celebração). A tentativa terminou em
  // conclusão. ANTES de mexer no que está visível, tira o RETRATO do que aconteceu — já estava concluída?
  // quantas das três antes/depois? persistiu? — e decide UM entre três desfechos, cada um com UMA
  // celebração (três intensidades; NENHUM desfecho é um simples toast técnico):
  //   • atividade JÁ concluída  → celebração de ATUALIZAÇÃO curta ("Eu vi suas novas cores!"): a arte
  //     continua visível, o Beni reage, mas NÃO repete a festa 3/3 nem a página especial de 1ª vez;
  //   • 1ª conclusão, ainda falta → celebração CURTA de atividade (a pintura continua protagonista);
  //   • 1ª conclusão real 2/3→3/3 → GRANDE conclusão (galeria das três).
  // Falha de escrita NÃO chega aqui: o núcleo só chama onCelebrate em desfecho SAVED/NOT_PERSISTED_FREE.
  // O Grátis (não persistido) é conclusão de verdade para a criança e recebe a MESMA celebração — sem
  // uma palavra sobre plano. NENHUMA navegação acontece aqui: quem navega é a criança, pelas ações do
  // cartão. Reentrância: uma tentativa = UM disparo (a trava do controlador garante um único onCelebrate);
  // o overlay monta UMA vez (som/háptico no seu próprio mount, §Parte 4/8) e re-render NÃO reinicia nada.
  // [C60-P11-MACHINE-START] Núcleo de DECISÃO da máquina de conclusão (P11 · Parte 4): a partir do
  // retrato (já concluída? quantas antes/depois? persistiu?) escolhe UM entre três celebrações, sem
  // tocar o writer. Este trecho é extraído e exercitado pelo harness comportamental do smoke
  // (C60-P11 · provas 1–4/6b): mutar a decisão muda os contadores lá.
  function handleC60Celebrate(outcome) {
    const persisted = outcome?.persisted === true;
    const snapshot = typeof outcome?.snapshot === 'string' ? outcome.snapshot : null;
    const catalogIds = getColoring60Activities(storyId).map((a) => a.activityId);
    const total = catalogIds.length || 3;
    const wasAlreadyDone = c60DoneMap[activityId] === true;
    const doneCountBefore = catalogIds.filter((id) => c60DoneMap[id] === true).length;
    const doneCountAfter = wasAlreadyDone
      ? doneCountBefore
      : catalogIds.filter((id) => id === activityId || c60DoneMap[id] === true).length;
    if (__DEV__) {
      console.log(
        `[Coloring60] máquina de conclusão: already=${wasAlreadyDone} antes=${doneCountBefore} depois=${doneCountAfter}/${total} persistido=${persisted}`,
      );
    }

    // O instantâneo (payload v2) alimenta o quadro de brilho para seguir os LIMITES REAIS da arte
    // (Parte 3) em TODAS as três celebrações, e a galeria quando a arte atual só existe em memória.
    // Setado UMA vez antes de qualquer ramo, para que o primeiro quadro da moldura já esteja no lugar.
    setC60CelebrateSnapshot(snapshot);

    // Editar uma atividade JÁ concluída (Regras 4/5): celebração de ATUALIZAÇÃO — a arte volta ao
    // ENQUADRAMENTO INTEIRO ("Ver tudo") para ficar inteira e visível durante a festa, o Beni reage e
    // a mensagem celebra as novas cores. NÃO repete a grande conclusão nem a página especial de 1ª vez,
    // e NÃO mexe no progresso (já estava done). Sem navegação: a criança escolhe pelas ações do cartão.
    if (wasAlreadyDone) {
      canvasRef.current?.resetZoom();
      setC60CelebrateMode('update');
      setC60Celebrating(true);
      Animated.timing(controlsAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
      return;
    }

    // §2.2/§4.1 · primeira conclusão desta atividade: a pintura volta ao ENQUADRAMENTO INTEIRO
    // (scale 1, sem pan) para a revelação — via a MESMA API "Ver tudo" do canvas, sem alterar seu
    // contrato — e a atividade entra no progresso.
    canvasRef.current?.resetZoom();
    setC60DoneMap((prev) => ({ ...prev, [activityId]: true }));

    if (doneCountAfter >= total) {
      // 2/3 → 3/3 real: GRANDE conclusão. Resolve a galeria das três (a atual em memória + as outras
      // duas do storage) ANTES de a criança tocar em qualquer coisa.
      setC60CelebrateMode('finale');
      loadC60FinaleItems(snapshot);
    } else {
      // Ainda falta atividade: celebração CURTA de atividade (a pintura continua protagonista).
      setC60CelebrateMode('activity');
    }
    setC60Celebrating(true);
    Animated.timing(controlsAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }
  // [C60-P11-MACHINE-END]

  // Ação principal: se ainda falta atividade, troca a IDENTIDADE da mesma rota — o wrapper remonta
  // o ramo pela `key` (mecanismo já existente do P4), sem rota nova, sem tela nova e sem mexer na
  // pilha. Com as três concluídas, volta ao ponto interno de seleção, de onde cada atividade reabre
  // com a pintura da criança.
  function handleC60Primary() {
    if (c60NextId != null) {
      navigation.setParams({ activityId: c60NextId });
      return;
    }
    navigation.goBack();
  }

  // [C60-P11-UPDATE] Ação principal da celebração de ATUALIZAÇÃO ("Continuar colorindo"): fecha a
  // camada de festa e devolve os controles de pintura suavemente, mantendo a criança NA MESMA
  // atividade que acabou de reencantar. Sem navegação e sem tocar o progresso (a atividade já estava
  // concluída) — ela simplesmente volta a pintar de onde estava. Limpa também o snapshot da moldura.
  function handleC60ContinueColoring() {
    setC60Celebrating(false);
    setC60CelebrateMode(null);
    setC60CelebrateSnapshot(null);
    Animated.timing(controlsAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }

  // [C60-P11-FINALE] Terceira ação da GRANDE conclusão ("Colorir novamente"): recomeça a jornada de
  // cor pela PRIMEIRA atividade do catálogo (Luz), trocando a IDENTIDADE da mesma rota — o wrapper
  // remonta o ramo pela `key` (mesmo mecanismo do P4), reabrindo com a pintura já guardada da criança.
  // Sem rota nova e sem mexer na pilha. Guarda em activeRef para não navegar após desmontar.
  function handleC60ColorAgain() {
    if (!activeRef.current) return;
    const firstId = getColoring60Activities(storyId)[0]?.activityId ?? null;
    if (firstId != null) navigation.setParams({ activityId: firstId });
  }

  // [C60-P4-WIRING] Ligação fina React↔núcleo: handleC60Pronto injeta o estado DESTA instância
  // (D1/D5/saving, refs, navegação e a trava síncrona) no núcleo testável `beginC60Attempt`, onde
  // vive a ordem canônica e a serialização (acquire ANTES de setC60Saving/exportPaint). Sem lógica
  // de conclusão aqui — só a composição — para que os testes exerçam o núcleo real.
  function handleC60Pronto() {
    beginC60Attempt({
      controller: attemptControllerRef.current,
      canvasRef,
      activeRef,
      available,
      ready: c60Ready,
      painted: c60HasPainted,
      saving: c60Saving,
      storyId,
      activityId,
      setSaving: setC60Saving,
      goBack: () => navigation.goBack(),
      onSaveIssue: handleC60SaveIssue,
      onCelebrate: handleC60Celebrate,
    });
  }

  const eraserActive = c60Color === ERASER_COLOR;

  if (available) {
    return (
      <View style={styles.container}>
        <View
          style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}
          // [C60-P12R-HEADER] §Parte 5 · #4 (a11y) · durante os atos o cabeçalho inteiro (Voltar,
          // título e Pronto) SAI da árvore de acessibilidade: leitor de tela não alcança um controle
          // invisível-porém-morto. `accessibilityViewIsModal` do overlay cobre só iOS; isto cobre
          // TalkBack no Android (e reforça no iOS). Fora da celebração, volta ao normal ('auto').
          importantForAccessibility={c60Celebrating ? 'no-hide-descendants' : 'auto'}
        >
          {/* [C60-P12R-HEADER] §Parte 5 · durante os atos da celebração o Voltar SOME (opacity) e
              PARA de responder (pointerEvents 'none'): assim não fica um controle visível-porém-morto
              atrás da camada de festa (problema físico #4). Fora da celebração, volta pleno. */}
          <Animated.View
            style={{ opacity: controlsAnim }}
            pointerEvents={c60Celebrating ? 'none' : 'auto'}
          >
            <SoundButton style={styles.topBarNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.topBarNavBtnText}>← Voltar</Text>
            </SoundButton>
          </Animated.View>
          {/* Título coerente com a atividade escolhida, vindo do catálogo (mesmo componente e
              mesmo estilo `topBarTitle` já usados na tela). Sem catálogo, mantém o rótulo atual.
              [C60-P12R-HEADER] §Parte 3/5 · `adjustsFontSizeToFit` encolhe ANTES de truncar (o título
              nunca aparece cortado — problema físico #3); e some junto com os controles na celebração. */}
          <Animated.Text
            style={[styles.topBarTitle, { opacity: controlsAnim }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {resolution.activity?.title ?? 'Hora de Colorir'}
          </Animated.Text>
          {/* Durante a conclusão os controles somem suavemente (§6) e param de responder ao
              toque — a pintura fica visível e congelada atrás da camada. */}
          <Animated.View
            style={[styles.topBarActions, { opacity: controlsAnim }]}
            pointerEvents={c60Celebrating ? 'none' : 'auto'}
          >
            {/* §3 · UM ÚNICO som de conclusão. O botão "Pronto!" é o gatilho da conclusão, mas
                quem dá o som de fecho é o overlay de celebração (playUiSound('success') ao montar).
                Sem `silent`, o SoundButton tocaria automaticamente o 'tap' no toque, somando-se ao
                'success' do overlay e produzindo a sensação de clique duplo. `silent` suprime SÓ o
                som automático deste botão, no fluxo do Colorir 60 — sem mexer nos demais botões e
                sem silenciar a celebração. `disabled` durante o salvamento também evita re-disparo. */}
            <SoundButton
              silent
              style={[styles.prontoBtn, c60Saving && styles.prontoBtnSaving]}
              onPress={handleC60Pronto}
              activeOpacity={0.85}
              disabled={c60Saving}
            >
              <Text style={styles.prontoBtnText}>{c60Saving ? 'Salvando...' : '✓ Pronto!'}</Text>
            </SoundButton>
          </Animated.View>
        </View>

        {/* Canvas: composição do motor existente SEM alterar seu contrato. `imageSource` aceita o
            módulo do resolvedor; sinais D1 (onReadyChange) e D5 (onPainted) são consumidos por
            composição. Sem sceneNumber numérico (identidade Colorir 60 é semântica). */}
        <View
          style={styles.canvasArea}
          pointerEvents={c60Celebrating ? 'none' : 'auto'}
          // [C60-P12-FRAME] Mede a área do canvas continuamente (só grava em mudança real). Assim,
          // quando a celebração começa, a geometria da arte já está disponível ao overlay para ancorar
          // partículas e Beni aos LIMITES REAIS do desenho — a MESMA base da moldura viva (§Parte 9).
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setC60CanvasFrame((prev) => (
              prev && prev.x === x && prev.y === y && prev.width === width && prev.height === height
                ? prev
                : { x, y, width, height }
            ));
          }}
        >
          <ColoringCanvas
            ref={canvasRef}
            selectedColor={c60Color}
            imageSource={resolution.source}
            storyId={storyId}
            onReadyChange={setC60Ready}
            onPainted={() => setC60HasPainted(true)}
            onGoBack={() => navigation.goBack()}
            // Retomada da arte guardada: o canvas valida ANTES de aplicar (onPaintValid aplica;
            // qualquer desfecho negativo abre o lineart limpo, sem derrubar a tela).
            onPaintValid={handleC60RestoreValid}
            onPaintInvalid={handleC60RestoreInvalid}
            onLoadCorrupted={handleC60RestoreInvalid}
            onLoadIncompatible={handleC60RestoreInvalid}
            // [C60-P10-HYDRATION] Sinal ADITIVO: a pintura salva já foi DESENHADA neste frame.
            onPaintApplied={handleC60PaintApplied}
          />
          {/* Moldura luminosa progressiva SOBRE a pintura (§Parte 3): não cobre o desenho, só valoriza
              a borda — e segue os LIMITES REAIS da arte pelo snapshot (v2), sem envolver área vazia.
              Fica inerte enquanto a criança pinta; mede continuamente para já nascer no lugar certo. */}
          <Coloring60ArtGlow
            activityId={activityId}
            active={c60Celebrating}
            snapshot={c60CelebrateSnapshot}
          />
          {/* [C60-P10-HYDRATION] Capa de hidratação ATÔMICA: cobre a área do canvas na MESMA cor do
              motor (#FFFDF8) — sem lineart e sem texto piscando — até o PRIMEIRO quadro estável (arte
              colorida quando há desenho salvo; lineart limpo quando não há) e só então esvanece.
              Bloqueia o toque enquanto opaca e o libera ao revelar. Um indicador calmo e ESTÁVEL só
              surge se a hidratação demorar além do limiar — em cargas rápidas nem chega a aparecer. */}
          <Animated.View
            style={[c60Styles.hydrationCover, { opacity: hydrationCoverAnim }]}
            pointerEvents={c60Hydrated ? 'none' : 'auto'}
          >
            {c60HydrationSpinner && !c60Hydrated ? (
              <ActivityIndicator size="large" color="#FF8C42" />
            ) : null}
          </Animated.View>
        </View>

        <Animated.View
          style={[styles.overlayPanel, { bottom: insets.bottom + 8, opacity: controlsAnim }]}
          pointerEvents={c60Celebrating ? 'none' : 'auto'}
        >
          <View style={styles.toolsRow}>
            <CompactTool
              active={eraserActive}
              accessibilityLabel="Borracha"
              onPress={() => setC60Color(ERASER_COLOR)}
            >
              <MaterialCommunityIcons name="eraser" size={24} color={eraserActive ? '#6B4F00' : '#666'} />
            </CompactTool>
            <CompactTool accessibilityLabel="Desfazer" onPress={() => canvasRef.current?.undo()}>
              <FaithIcon name="undo" size={22} color="#666" />
            </CompactTool>
            <CompactTool accessibilityLabel="Ver tudo (centralizar)" onPress={() => canvasRef.current?.resetZoom()}>
              <FaithIcon name="zoom_reset" size={22} color="#666" />
            </CompactTool>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.paletteScroll}
            contentContainerStyle={styles.paletteContent}
          >
            {COLOR_PALETTE.map(({ hex }) => (
              <SoundButton key={hex} silent style={styles.dotWrapper} onPress={() => setC60Color(hex)}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: hex },
                    hex === '#FFFFFF' && styles.colorDotWhiteBorder,
                    c60Color === hex && styles.colorDotSelected,
                  ]}
                />
              </SoundButton>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Momento de conclusão (§Parte 4 · Diretor de Celebração): entra sobre a pintura congelada
            e só sai pela escolha da criança. A máquina de conclusão já decidiu o modo ('update' |
            'activity' | 'finale') — CADA modo é uma celebração de intensidade própria (nenhum é um
            toast técnico). A navegação acontece nos handlers, nunca automaticamente. */}
        {c60Celebrating
        && (c60CelebrateMode === 'update'
          || c60CelebrateMode === 'activity'
          || c60CelebrateMode === 'finale') ? (
          <Coloring60CompletionOverlay
            // A máquina de conclusão é AUTORIDADE sobre o desfecho: o overlay não reinfere o modo
            // do progresso. 'finale' só em 2/3→3/3 real; 'update' só ao recolorir atividade concluída.
            mode={c60CelebrateMode}
            activityId={activityId}
            steps={c60Steps}
            finaleItems={c60FinaleItems}
            // Geometria REAL da arte (mesma base da moldura viva): partículas e Beni ancorados ao
            // desenho (§Parte 9); `celebrationId` é a semente determinística das partículas (§Parte 9).
            snapshot={c60CelebrateSnapshot}
            canvasFrame={c60CanvasFrame}
            celebrationId={c60CelebrationId}
            bottomInset={insets.bottom}
            // Ações por modo (§Parte 5/6/7):
            //   update   → [Continuar colorindo] volta à MESMA arte; [Voltar à aventura] sai.
            //   activity → [Colorir a próxima parte] próxima; [Ver meu desenho] fecha a festa e mostra
            //              o desenho; [Voltar à aventura] sai.
            //   finale   → [Ver meus desenhos] fim (todas concluídas → volta ao ponto de seleção);
            //              [Voltar à aventura] sai; [Colorir novamente] recomeça a jornada.
            onPrimary={c60CelebrateMode === 'update' ? handleC60ContinueColoring : handleC60Primary}
            onSecondary={c60CelebrateMode === 'activity' ? handleC60ContinueColoring : () => navigation.goBack()}
            onTertiary={c60CelebrateMode === 'activity' ? () => navigation.goBack() : handleC60ColorAgain}
          />
        ) : null}
      </View>
    );
  }

  // deferred OU unknown (inclui piloto NÃO autorizado) → estado honesto, SEM lineart, SEM
  // fallback para cena legada, SEM escrita. Retorno seguro pelo padrão já usado no app:
  // early return com mensagem curta + botão "Voltar" (mesmo SoundButton e mesmo estilo do
  // botão de voltar da barra superior desta tela).
  const isDeferred = resolution.status === COLORING60_RESOLUTION_STATUS.DEFERRED;
  return (
    <View style={[c60Styles.container, c60Styles.emptyCenter, { paddingTop: insets.top }]}>
      <Text style={c60Styles.emptyTitle}>
        {isDeferred ? 'Este desenho ainda está a caminho' : 'Atividade indisponível'}
      </Text>
      <Text style={c60Styles.emptyText}>
        {isDeferred
          ? 'Em breve você poderá colorir esta atividade.'
          : 'Não encontramos esta atividade.'}
      </Text>
      <SoundButton
        style={[styles.topBarNavBtn, c60Styles.emptyBackBtn]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.topBarNavBtnText}>← Voltar</Text>
      </SoundButton>
    </View>
  );
}

const c60Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyCenter: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 15, color: colors.textLight, textAlign: 'center', marginTop: 8 },
  emptyBackBtn: { marginTop: 20 },
  // [C60-P10-HYDRATION] Capa da hidratação atômica — MESMA cor do fundo do motor de pintura
  // (#FFFDF8), para a transição capa→arte ser imperceptível. Centraliza o indicador calmo.
  hydrationCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function LegacyColoringScreen({ route, navigation }) {
  const { refreshProgress } = useProgressContext();
  const { story, cenaIndex, from } = route.params;
  const cena = story.cenas[cenaIndex];
  const canvasRef = useRef(null);
  const insets = useSafeAreaInsets();

  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);
  const [hasPainted, setHasPainted] = useState(false);
  const [showPaintFirst, setShowPaintFirst] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Lineart carregado? Sem isso a arte ficaria sem contorno — bloqueia o salvar.
  const [canvasReady, setCanvasReady] = useState(false);

  // Drawing restore state
  const [savedDrawing, setSavedDrawing] = useState(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Touch feedback: shown briefly when user taps on a line instead of white area
  const [showLineTip, setShowLineTip] = useState(false);
  const lineTipTimerRef = useRef(null);

  // Menu compacto de opções (guarda "Limpar tudo" fora do destaque)
  const [showMenu, setShowMenu] = useState(false);

  // Dica de primeira vez "use dois dedos para mover o desenho" (Modo Colorir Grande)
  const [showPanHint, setShowPanHint] = useState(false);
  const panHintTimerRef = useRef(null);

  // Fase 2B.6 (RP3): revalida ACESSO ao FOCAR (não só no mount). Sem áudio → bloquear e
  // sair seguro. QA do Criador (duplo-gate) mantém o bypass só em dev/permitido; o fluxo
  // normal da criança segue com paywall — pack no disco NÃO libera abertura.
  useFocusEffect(
    useCallback(() => {
      const qaBypass = route.params?.qa === true && isCreatorQaModeEnabled();
      if (!qaBypass && !canOpenStoryFullExperience(story)) {
        navigation.replace('ParentArea');
      }
    }, [story, route.params?.qa]),
  );

  // Check for a previously saved drawing when the screen opens.
  // O modal "Você já começou este desenho" NÃO é decidido só pela existência da
  // chave: o desenho salvo precisa ter tinta real E ser CARREGÁVEL no canvas atual.
  // Por isso passamos o payload para o canvas VALIDAR (validatePaint) antes de
  // mostrar o modal — onPaintValid abre o modal; onPaintInvalid cura (limpa a chave
  // incompatível/corrompida e abre a cena como nova, sem modal falso).
  useEffect(() => {
    let alive = true;
    getSavedDrawing(story.id, cena.id).then(saved => {
      if (!alive) return;
      if (saved && hasMeaningfulPaint(saved)) {
        setSavedDrawing(saved);
        // O canvas enfileira a validação até estar pronto (READY).
        canvasRef.current?.validatePaint(saved);
      } else if (saved) {
        // Chave existente sem tinta real (vazia) → remove e abre como nova.
        clearDrawingState(story.id, cena.id);
        setSavedDrawing(null);
      }
    });
    return () => { alive = false; };
  }, []);

  // Cura um estado salvo inválido (incompatível/corrompido): remove a chave da cena
  // e abre limpa — nunca deixa modal de continuar nem "concluído" falso.
  function healInvalidSavedDrawing() {
    clearDrawingState(story.id, cena.id);
    setSavedDrawing(null);
    setShowResumeDialog(false);
  }

  // Orientação inicial: "toque numa parte branca para começar" + gesto de mover.
  // Mostra UMA vez por dispositivo (flag persistida) e some sozinha — nunca fixa.
  // Só faz sentido com imagem de história (Modo Colorir Grande).
  useEffect(() => {
    if (!imageSource) return;
    let cancelled = false;
    AsyncStorage.getItem(PAN_HINT_KEY).then(seen => {
      if (cancelled || seen) return;
      setShowPanHint(true);
      AsyncStorage.setItem(PAN_HINT_KEY, '1').catch(() => {});
      panHintTimerRef.current = setTimeout(() => setShowPanHint(false), 8000);
    }).catch(() => {});
    return () => {
      cancelled = true;
      if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
    };
  }, []);

  // Some ao tocar "Entendi" ou ao pintar pela 1ª vez.
  function dismissStartHint() {
    if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
    setShowPanHint(false);
  }

  // DEV: expose console helpers to clear saved state during testing
  useEffect(() => {
    if (!__DEV__) return;
    global.__devClearColoringDrawing = async () => {
      await clearDrawingState(story.id, cena.id);
      setSavedDrawing(null);
      setShowResumeDialog(false);
      console.log('[DEV] Cleared drawing for scene', story.id, cena.id);
    };
    global.__devClearAllColoringDrawings = async () => {
      const count = await clearAllSavedDrawings();
      console.log('[DEV] Cleared', count, 'saved drawings');
    };
    console.log('[DEV ColoringScreen] Helpers: __devClearColoringDrawing() | __devClearAllColoringDrawings()');
    return () => {
      delete global.__devClearColoringDrawing;
      delete global.__devClearAllColoringDrawings;
    };
  }, []);

  // Field aliases for backward compatibility
  const tituloColorir = cena.tituloColorir ?? cena.instrucaoColorir ?? cena.colorirElemento ?? '';
  // F2.4e.3: colorir remoto (file://) p/ david_goliath com pack ready + arquivo existente;
  // fallback local (getColoringImage) idêntico ao anterior para todas as outras condições.
  const imageSource = useResolvedColoringImage(story, cenaIndex);

  // COLORIR IMERSIVO V1: o canvas não é mais dimensionado à altura exata da imagem
  // 4:5 (isso prendia o desenho numa faixa curta e deixava sobra vertical). Agora o
  // canvas ocupa TODA a área entre o header e o fim da tela (flex:1, full-bleed) e as
  // ferramentas/paleta viram um overlay flutuante que SOBREPÕE o canvas (não rouba
  // faixa). O desenho abre em modo grande (zoom inicial) dentro desse viewport maior;
  // o pan de dois dedos (com inset inferior no clamp) alcança a parte sob o overlay e
  // "Ver tudo" reenquadra a imagem inteira.

  if (__DEV__ && !imageSource) {
    console.warn(`[ColoringScreen] Imagem ausente — história ${story.id} cena ${cena.id}.`);
  }

  /* ── Missing image early return ───────────────────────────────── */
  if (!imageSource) {
    return (
      <View style={styles.missingContainer}>
        <LinearGradient
          colors={[cena.corTema || colors.secondary, (cena.corTema || colors.secondary) + 'AA']}
          style={styles.missingGradient}
        >
          <Text style={styles.missingEmoji}>{cena.emojiCena ?? '🎨'}</Text>
          <Text style={styles.missingTitle}>{tituloColorir || cena.titulo}</Text>
          <Text style={styles.missingSub}>
            Este desenho ainda está a caminho!{'\n'}Em breve você poderá colorir esta cena. ✨
          </Text>
          <SoundButton
            style={styles.missingBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.missingBtnText}>Voltar para a cena ▶</Text>
          </SoundButton>
        </LinearGradient>
      </View>
    );
  }

  /* ── Resume drawing handlers ──────────────────────────────────── */
  function handleContinueDrawing() {
    setShowResumeDialog(false);
    canvasRef.current?.loadPaint(savedDrawing);
    setHasPainted(true);
  }

  function handleStartFresh() {
    Alert.alert(
      'Apagar as cores? 🎨',
      'Tem certeza que quer apagar as cores deste desenho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar cores',
          style: 'destructive',
          onPress: async () => {
            await clearDrawingState(story.id, cena.id);
            setSavedDrawing(null);
            setShowResumeDialog(false);
          },
        },
      ],
    );
  }

  /* ── Actions ─────────────────────────────────────────────────── */
  // Colorir é atividade complementar: APENAS salva a arte da criança e volta
  // para a cena. Nunca conclui cena, nunca dá estrela, nunca avança a história.
  // A conclusão da cena acontece somente na NarrationScreen.
  function handleProximo() {
    if (!hasPainted) {
      setShowPaintFirst(true);
      return;
    }
    // Não salvar sem o contorno carregado — evita arte sem lineart.
    if (!canvasReady) {
      Alert.alert(
        'Quase lá! 🎨',
        'O desenho ainda está carregando. Espere um instante e toque em Pronto de novo.',
        [{ text: 'Ok!' }],
      );
      return;
    }
    setIsSaving(true);
    canvasRef.current?.exportPaint(async (exportData) => {
      await saveDrawingState(story.id, cena.id, exportData);
      // A0.10: marca a ATIVIDADE de colorir concluída (booleano leve, independente
      // de salvar arte na galeria) — alimenta journeyComplete mesmo se, no futuro,
      // salvar na galeria for bloqueado para Free. Não altera o save acima.
      await markStoryColoringActivityDone(story.id, cena.id);
      // Propaga ao contexto (mapa/estante/pais) — como StoryBook/Quiz/Reflexão fazem —
      // para o journeyComplete refletir na hora se colorir foi a última pendência.
      refreshProgress();
      setIsSaving(false);
      navigation.goBack();
    });
  }

  function handleSelectColor(cor) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColor(cor);
  }

  function handleUndo() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    canvasRef.current?.undo();
  }

  function handleClearAll() {
    Alert.alert(
      'Apagar as cores deste desenho?',
      'Você pode continuar colorindo depois.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            canvasRef.current?.clearCanvas();
            await clearDrawingState(story.id, cena.id);
            setSavedDrawing(null);
          },
        },
      ],
    );
  }

  function handleResetZoom() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    canvasRef.current?.resetZoom();
  }

  function handleFillRejected() {
    setShowLineTip(true);
    if (lineTipTimerRef.current) clearTimeout(lineTipTimerRef.current);
    lineTipTimerRef.current = setTimeout(() => setShowLineTip(false), 2500);
  }

  useEffect(() => {
    return () => { if (lineTipTimerRef.current) clearTimeout(lineTipTimerRef.current); };
  }, []);

  const eraserActive = selectedColor === ERASER_COLOR;

  return (
    <View style={styles.container}>

      {/* ── TOP BAR ────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <SoundButton style={styles.topBarNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.topBarNavBtnText}>← {backLabelFor(from)}</Text>
        </SoundButton>
        <Text style={styles.topBarTitle} numberOfLines={1}>Hora de Colorir</Text>
        <View style={styles.topBarActions}>
          <SoundButton style={styles.topBarHomeBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
            <Text style={styles.topBarHomeBtnText}>🏠</Text>
          </SoundButton>
          <SoundButton
            style={[styles.prontoBtn, isSaving && styles.prontoBtnSaving]}
            onPress={handleProximo}
            activeOpacity={0.85}
            disabled={isSaving}
          >
            <Text style={styles.prontoBtnText}>{isSaving ? 'Salvando...' : '✓ Pronto!'}</Text>
          </SoundButton>
        </View>
      </View>

      {/* ── CANVAS — full-bleed, ocupa TODA a área entre header e fim da tela ── */}
      <View style={styles.canvasArea}>
        <ColoringCanvas
            ref={canvasRef}
            selectedColor={selectedColor}
            imageSource={imageSource}
            storyId={story.id}
            sceneNumber={cena.id}
            onReadyChange={setCanvasReady}
            onPainted={() => { setHasPainted(true); dismissStartHint(); }}
            onFillRejected={handleFillRejected}
            onGoBack={() => navigation.goBack()}
            // Validação do desenho salvo (probe, antes de aplicar):
            onPaintValid={() => setShowResumeDialog(true)}
            onPaintInvalid={healInvalidSavedDrawing}
            onLoadCorrupted={() => {
              // Falha ao aplicar de verdade (raro, p.ex. ao "Continuar"): cura e avisa.
              healInvalidSavedDrawing();
              Alert.alert(
                '🎨 Atenção',
                'Esse desenho salvo teve um problema, mas você pode começar de novo.',
                [{ text: 'Tudo bem!' }],
              );
            }}
            onLoadIncompatible={() => {
              // Estado de um tamanho de tela diferente — cura (limpa) e abre limpa.
              if (__DEV__) console.log('[ColoringScreen] [COLORING_STATE] incompatible state — healing');
              healInvalidSavedDrawing();
            }}
          />
      </View>

      {/* ── OVERLAY flutuante — ferramentas + paleta SOBRE o canvas (não empurra) ── */}
      <View style={[styles.overlayPanel, { bottom: insets.bottom + 8 }]}>

        {/* Menu pequeno: guarda "Limpar tudo" fora do destaque (com confirmação). */}
        {showMenu && (
          <>
            <Pressable style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
            <View style={styles.menuPopover}>
              <SoundButton
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); handleClearAll(); }}
              >
                <Text style={styles.menuItemText}>🧹  Limpar tudo</Text>
              </SoundButton>
            </View>
          </>
        )}

        {/* Ferramentas principais — ícones compactos (no máx.: Borracha, Desfazer,
            Ver tudo, Mais). O botão de ampliar saiu — zoom é por gesto de dois dedos. */}
        <View style={styles.toolsRow}>
          <CompactTool
            active={eraserActive}
            accessibilityLabel="Borracha"
            onPress={() => handleSelectColor(ERASER_COLOR)}
          >
            <MaterialCommunityIcons name="eraser" size={24} color={eraserActive ? '#6B4F00' : '#666'} />
          </CompactTool>
          <CompactTool accessibilityLabel="Desfazer" onPress={handleUndo}>
            <FaithIcon name="undo" size={22} color="#666" />
          </CompactTool>
          <CompactTool accessibilityLabel="Ver tudo (centralizar)" onPress={handleResetZoom}>
            <FaithIcon name="zoom_reset" size={22} color="#666" />
          </CompactTool>
          <CompactTool active={showMenu} accessibilityLabel="Mais opções" onPress={() => setShowMenu(v => !v)}>
            <Text style={styles.moreDots}>⋯</Text>
          </CompactTool>
        </View>

        {/* Paleta — faixa compacta, rolagem horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.paletteScroll}
          contentContainerStyle={styles.paletteContent}
        >
          {COLOR_PALETTE.map(({ hex }) => (
            <SoundButton
              key={hex}
              silent
              style={styles.dotWrapper}
              onPress={() => handleSelectColor(hex)}
            >
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: hex },
                  hex === '#FFFFFF' && styles.colorDotWhiteBorder,
                  selectedColor === hex && styles.colorDotSelected,
                ]}
              />
            </SoundButton>
          ))}
        </ScrollView>

      </View>

      {/* ── ORIENTAÇÃO INICIAL — 1ª vez: tocar numa parte branca + gesto de mover ── */}
      {showPanHint && (
        <View style={[styles.panHint, { top: Math.max(insets.top, 8) + 54 }]}>
          <Text style={styles.startHintTitle}>👆 Toque em uma parte branca para começar a colorir.</Text>
          <Text style={styles.startHintSub}>✌️ Use dois dedos para aproximar ou mover o desenho.</Text>
          <SoundButton style={styles.startHintBtn} onPress={dismissStartHint} activeOpacity={0.85}>
            <Text style={styles.startHintBtnText}>Entendi</Text>
          </SoundButton>
        </View>
      )}

      {/* ── LINE TIP — shown when user taps on a line ──────────── */}
      {showLineTip && (
        <View
          style={[styles.lineTip, { bottom: 168 + insets.bottom }]}
          pointerEvents="none"
        >
          <Text style={styles.lineTipText}>Toque dentro de uma parte branca para colorir</Text>
        </View>
      )}

      {/* ── RESUME DIALOG ──────────────────────────────────────── */}
      {showResumeDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogEmoji}>🎨</Text>
            <Text style={styles.dialogTitle}>Você já começou este desenho!</Text>
            <Text style={styles.dialogSub}>Quer continuar de onde parou?</Text>
            <SoundButton style={styles.dialogBtnPrimary} onPress={handleContinueDrawing} activeOpacity={0.85}>
              <Text style={styles.dialogBtnPrimaryText}>✨ Continuar meu desenho</Text>
            </SoundButton>
            <SoundButton style={styles.dialogBtnSecondary} onPress={handleStartFresh} activeOpacity={0.85}>
              <Text style={styles.dialogBtnSecondaryText}>Começar de novo</Text>
            </SoundButton>
          </View>
        </View>
      )}

      {/* ── PINTE PRIMEIRO MODAL ───────────────────────────────── */}
      {showPaintFirst && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogEmoji}>🎨</Text>
            <Text style={styles.dialogTitle}>Pinte um pouquinho primeiro!</Text>
            <Text style={styles.dialogSub}>Pinte um pedacinho da cena antes de continuar!</Text>
            <SoundButton
              style={styles.dialogBtnPrimary}
              onPress={() => setShowPaintFirst(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.dialogBtnPrimaryText}>Tá bom! 🖌️</Text>
            </SoundButton>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },

  /* ── Top bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 5,
    backgroundColor: colors.cardBg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  topBarNavBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F0EAE0',
  },
  topBarNavBtnText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  topBarTitle: {
    flex: 1,
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarHomeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarHomeBtnText: { fontSize: 20 },
  prontoBtn: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  prontoBtnSaving: {
    backgroundColor: '#9E9E9E',
    elevation: 0,
    shadowOpacity: 0,
  },
  prontoBtnText: { fontFamily: 'FredokaOne', fontSize: 15, color: '#FFF' },

  /* ── Canvas — IMERSIVO: full-bleed, ocupa toda a área entre header e fim da tela ── */
  canvasArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFDF8',
  },

  /* ── Overlay flutuante (ferramentas + paleta) — SOBRE o canvas, não rouba faixa ──
     Creme com leve transparência, sombra suave, cantos arredondados, compacto. */
  overlayPanel: {
    position: 'absolute',
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255,253,248,0.94)',
    borderRadius: 22,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },

  /* Ferramentas — ícones compactos (sem rótulo), área tocável ~44pt */
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 2,
    paddingBottom: 6,
  },
  compactTool: {
    width: 46,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EAE0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  compactToolActive: {
    backgroundColor: '#FFE066',
    elevation: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  moreDots: { fontFamily: 'FredokaOne', fontSize: 22, color: '#666', lineHeight: 24 },

  /* Menu pequeno (Limpar tudo) */
  menuBackdrop: { ...StyleSheet.absoluteFillObject, top: -1000 },
  menuPopover: {
    position: 'absolute',
    right: 12,
    top: -46,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE0D4',
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 18 },
  menuItemText: { fontFamily: 'Nunito', fontSize: 14, color: '#6B4F00', fontWeight: '700' },

  /* Paleta — faixa compacta; bolinhas menores, área tocável segura (~46pt) */
  paletteScroll: { flexGrow: 0 },
  paletteContent: {
    paddingHorizontal: 12,
    paddingBottom: 2,
    alignItems: 'center',
    gap: 3,
  },
  dotWrapper: { padding: 8 },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotWhiteBorder: {
    borderColor: '#CCC',
  },
  colorDotSelected: {
    borderColor: '#FFD700',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
    elevation: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  /* ── Dialogs (resume + pinte primeiro) ── */
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  dialogBox: {
    backgroundColor: '#FFFAF4',
    borderRadius: 28,
    padding: 28,
    width: '82%',
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  dialogEmoji: { fontSize: 52, marginBottom: 10 },
  dialogTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  dialogSub: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  dialogBtnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  dialogBtnPrimaryText: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: '#FFF',
  },
  dialogBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  dialogBtnSecondaryText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'underline',
  },

  /* ── Pan hint toast (primeira vez, Modo Colorir Grande) ── */
  panHint: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(50,50,50,0.88)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  panHintText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  startHintTitle: {
    fontFamily: 'Nunito',
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  startHintSub: {
    fontFamily: 'Nunito',
    fontSize: 12.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  startHintBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  startHintBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 13,
    color: '#333333',
  },

  /* ── Line tip toast ── */
  lineTip: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(50,50,50,0.88)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lineTipText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: '#FFF',
    textAlign: 'center',
  },

  /* ── Missing image placeholder ── */
  missingContainer: { flex: 1 },
  missingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  missingEmoji: { fontSize: 80, marginBottom: 20 },
  missingTitle: {
    fontFamily: 'FredokaOne',
    fontSize: 22,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  missingSub: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  missingBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  missingBtnText: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: '#FFF',
  },
});
