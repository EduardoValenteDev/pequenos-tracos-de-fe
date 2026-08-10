import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Animated, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
// [C60-P13-PREWARM] `prewarmLineart` aquece a lineart da PRÓXIMA parte no cache do próprio canvas
// (§Parte 10) — best-effort, nunca lança, nunca mexe em estado de tela. Sem ele a transição direta
// remontava a tela com a arte ainda por converter (a "tela quase vazia com rodinha" do teste físico).
import ColoringCanvas, { ERASER_COLOR, prewarmLineart } from '../components/ColoringCanvas';
import { COLOR_PALETTE } from '../constants/colorPalette';
import SoundButton from '../components/SoundButton';
// [P3J] `hasMeaningfulPaint` é a ÚNICA coisa que esta tela ainda importa de `drawingStorage`: é um
// medidor PURO de tinta, reaproveitado pelo Colorir 60 para decidir se um payload lido vale como
// pintura. O módulo continua íntegro no projeto (leitura, escrita e limpeza legadas seguem lá) —
// esta tela apenas deixou de usar as funções por cena junto com o ramo legado.
import { hasMeaningfulPaint } from '../services/drawingStorage';
import { useSurfaceLifecycle } from '../hooks/useSurfaceLifecycle';
// [C60-P13-HEADER] §Parte 13 — sinal de "momento imersivo": recolhe os enfeites globais de
// desenvolvimento (o selo MODO CRIADOR) enquanto os atos da celebração estão em cena.
import { beginImmersiveMoment } from '../services/immersiveMoment';
import FaithIcon from '../components/ui/FaithIcon';
// [C60-PARTE-7] A coleção é uma TELA PRÓPRIA (não mais uma camada sobre o desenho aberto). O nome
// da rota vem da fonte única para que esta tela não conheça a implementação da coleção — só o destino.
// [C60-NAV] Rotas do piloto não são mais referenciadas por nome aqui: a navegação do Colorir 60
// passou a sair pelo contrato central `coloring60Navigation` (por destino semântico).
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
  // [C60-PARTE-9] A GRANDE conclusão é um acontecimento ÚNICO por história. Estes dois selam isso:
  // lemos ao abrir e marcamos quando ela é EXIBIDA — assim recolorir uma parte (ou limpar e pintar
  // de novo) devolve o "3 de 3", mas nunca repete a festa. Só o reset canônico apaga esta marca.
  loadColoring60FinaleSeen,
  markColoring60FinaleSeen,
  // [C60-P12R-RESET] Limpeza SIMÉTRICA da conclusão — usada só pelo reset seguro de Dev (§Parte 1/10).
  clearColoring60Done,
} from '../services/coloring60ActivityService';
// [C60-PARTE-3/4] MEDIDA REAL DA TINTA e MODELO CANÔNICO DE ESTADO. Puros, sem I/O. `hasMeaningfulColor`
// substitui a promessa `onPainted` (mão única, que nunca voltava a falso ao apagar) por uma medida do
// motor; `snapshotMatchesRevision` é o passo 6 da transação; `SNAPSHOT_STATUS` distingue "arte guardada"
// de "concluída sem pixels" (conclusão legada ou escrita falhada) — sem essa distinção, ou uma conclusão
// antiga nunca chega a 3 de 3, ou uma conclusão órfã (arte sumida do disco) passaria por legítima.
import {
  hasMeaningfulColor,
  readPaintMetricsFromSnapshot,
  snapshotMatchesRevision,
  normalizePaintMetrics,
  EMPTY_PAINT_METRICS,
} from '../services/coloring60PaintMetrics';
import { SNAPSHOT_STATUS } from '../services/coloring60State';
// P8 (Colorir 60) — ordem FECHADA das três atividades (fonte única: o catálogo) e a experiência
// afetiva de conclusão. O componente é presentacional: recebe o que já aconteceu e devolve a
// escolha da criança; não decide conclusão, não persiste e não conhece plano.
import { getColoring60Activities } from '../data/coloring60Catalog';
import Coloring60CompletionOverlay, {
  Coloring60ArtGlow,
} from '../components/coloring60/Coloring60CompletionOverlay';
// [C60-P13-JOURNEY] §Parte 1 — DERIVAÇÃO CANÔNICA da jornada de cores (puro, sem I/O). É a ÚNICA
// autoridade sobre "o que acabei de completar / quanto completei / o que vem depois / quais ações".
// A máquina de conclusão abaixo CONSULTA esta derivação em vez de reinferir contagens na mão.
// [C60-PARTE-7] `deriveColoring60CollectionView` saiu daqui junto com a camada de coleção: quem a
// consome agora é a TELA da coleção. A derivação continua sendo a mesma e única — mudou o consumidor.
import {
  deriveColoring60Completion,
  reframeColoring60JourneyForMilestone,
  COLORING60_ACTION,
} from '../services/coloring60Journey';
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
// [C60-PARTE-6] RESET CANÔNICO — a MESMA função de "Gerenciar dados" e da bancada. O helper de
// desenvolvimento desta tela deixou de ter limpeza própria: existe uma só, e é esta.
import { resetCreationColoringJourney } from '../services/coloring60ResetService';
// [C60-NAV] CONTRATO ÚNICO de navegação do piloto. "Voltar à aventura" e "Ver minha coleção" saem
// daqui por DESTINO SEMÂNTICO (nunca por contagem de goBack): a conclusão volta DIRETO à história e
// a coleção chega como instância única. Ver src/services/coloring60Navigation.js.
import {
  c60ExitToStory,
  c60OpenCollectionFromCompletion,
  c60ResumeStoryAfterMilestone,
  C60_NAV_ORIGIN,
} from '../services/coloring60Navigation';
// [C60-A3] Aquecimento do RETRATO da coleção. Terminada a transação de conclusão (blob escrito,
// relido, ponteiro promovido, instantâneo reconciliado, conclusão marcada — só então `onCelebrate`
// dispara), pré-reconcilia a coleção em memória SEM bloquear a celebração, para que "Ver minha
// coleção" já a encontre pronta. Fire-and-forget: não navega, não conclui, não escreve progresso,
// não emite som nem háptico. Lê disco e atualiza só o retrato em memória.
import { primeColoring60Collection } from '../services/coloring60CollectionPortrait';
// [C60-FIX3] A GALERIA da grande conclusão passou a ser montada pela MESMA leitura canônica
// reconciliada que alimenta a coleção — e com o MESMO `kind` anexado. É o que garante, por
// construção, que o conjunto final e a coleção nunca divirjam sobre a mesma vaga. Só LEITURA.
import {
  loadColoring60Slots,
  coloring60SlotWithKind,
} from '../services/coloring60CollectionReader';
import { COLORIR_60_CREATION_PILOT_ENABLED } from '../config/featureFlags';
import { isInternalToolsEnabled } from '../config/internalTools';
// [S1] Fonte ÚNICA da autorização de conteúdo. A tela não deriva acesso — consulta o adaptador do
// contexto (que chama `deriveStoryContentAuthorization`) e repassa o contrato inteiro ao writer.
import { useProgressContext } from '../context/ProgressContext';
// P8B (Colorir 60) — aquecimento da pose de conclusão do Beni. Usa apenas o `Image.prefetch` do
// próprio React Native (sem lib nova e sem qualquer primitiva de pack) para aquecer a textura
// empacotada ANTES do toque em "Pronto!", de modo que a camada de conclusão não precise "buscar"
// a imagem na hora. Em produção o recurso já é local — o aquecimento é inerte. Nenhuma dependência
// nova e nada de download de conteúdo remoto: é só a mesma imagem que já vem no app.
import { BENI_IMAGES } from '../assets/mascot/beniImages';

// [P3J] A orientação inicial "use dois dedos para mover" era do Colorir legado e saiu com ele
// (`PAN_HINT_KEY = '@ptf_coloring_start_hint_v1'`). A chave permanece INERTE no aparelho de quem já
// a viu: nada é apagado do AsyncStorage por esta aposentadoria.

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

// [P3J] Guarda de rota para uma entrada que a interface não produz mais. Nenhuma tela navega
// para `Coloring` sem `activityId` desde a aposentadoria do Colorir legado. Se um estado de
// navegação antigo restaurado tentar abrir a rota assim, esta guarda volta na hora — a criança
// nunca fica numa tela em branco e sem cabeçalho (`headerShown: false`). Não exibe nada, não
// escreve progresso, não apaga dado nenhum.
function ColoringRouteGuard({ navigation }) {
  useEffect(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// P2.T2 — Ramo ADITIVO Colorir 60 por `activityId`.
//
// `ColoringScreen` (export default) é um wrapper FINO e SEM hooks: se a rota traz
// `activityId` (string semântica), delega ao ramo Colorir 60. Como o wrapper não chama
// hooks e cada instância montada tem params fixos, não há violação das Regras de Hooks.
//
// [P3J] O ramo LEGADO por cena (`LegacyColoringScreen`) foi REMOVIDO: sem as 199 folhas
// legadas não há o que abrir por cena. Hoje `activityId` não é mais um seletor entre dois
// caminhos — é o ÚNICO caminho, e sua ausência cai na guarda acima.
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
    // todos os estados locais voltam ao inicial (c60Ready=false [D1], c60PaintMetrics vazio [D5],
    // c60Saving=false, cor padrão), o `canvasRef` é novo e nenhum callback de export pendente da
    // atividade anterior atravessa. Como `resolution.source` é função pura de (storyId,activityId),
    // trocar o lineart também troca a key. Wrapper permanece SEM hooks (resolveC60StoryId é puro).
    const c60Key = `${resolveC60StoryId(route.params) ?? 'none'}::${route.params.activityId}`;
    return <Coloring60ActivityScreen key={c60Key} route={route} navigation={navigation} />;
  }
  return <ColoringRouteGuard navigation={navigation} />;
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
// P·C60-PARTE-3/4 · A ORDEM MUDOU, e mudou por causa de uma falha comprovada no aparelho: a
// conclusão era gravada ANTES da pintura, então uma folha em branco (e um desenho apagado) virava
// "concluída" e o "3 de 3" existia sem três artes. A ordem agora é a da transação atômica:
//   1. validar que existe COR DE VERDADE (medida do motor, não a promessa `onPainted`);
//   2. CONGELAR a revisão validada;
//   3-5. persistir a pintura — que É o instantâneo (um único artefato carrega pixels + revisão,
//        por isso "gerar" e "persistir o instantâneo da MESMA revisão" não podem divergir aqui);
//   6. VERIFICAR que o que ficou guardado é a mesma revisão validada;
//   7. só então marcar `isCurrentlyComplete` (com a prova de cor e o desfecho do instantâneo);
//   8-9. atualizar contador e memória numa única ação;
//   10. só depois disso celebrar;
//   11. e só depois disso a coleção fica disponível.
// Qualquer falha em 3-6 NÃO marca, NÃO incrementa, NÃO abre a coleção e NÃO some com a pintura:
// a criança continua na atividade, com a arte na tela, e pode tentar de novo.
function beginC60Attempt(deps) {
  const {
    controller, canvasRef, activeRef,
    available, ready, hasColor, saving,
    storyId, activityId, setSaving, goBack, onSaveIssue, onCelebrate, onEmptyPaint,
    getContentAuthorization,
  } = deps;
  if (!available || saving) return; // guard visual complementar (a trava real é o controller)
  if (!ready) return;       // D1: sem lineart pronto não conclui nem salva
  if (!hasColor) {
    // FOLHA SEM COR (Parte 3). Não é erro nem falha técnica: é um convite. Nada é marcado, nada é
    // gravado, nenhum som de sucesso — a paleta pulsa e o Beni pede um pouquinho de cor.
    if (typeof onEmptyPaint === 'function') onEmptyPaint();
    return;
  }
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
        // ── PASSO 1 · VALIDAR COR DE VERDADE ────────────────────────────────────────────────
        // A prova é o próprio instantâneo: ele carrega a contagem de pixels pintados e pintáveis
        // medida pelo motor. Uma folha em branco (ou apagada) morre AQUI, antes de qualquer escrita.
        if (!isAcceptableC60Payload(exportData)) return;
        const metrics = readPaintMetricsFromSnapshot(exportData);
        if (!hasMeaningfulColor(metrics)) {
          if (typeof onEmptyPaint === 'function') onEmptyPaint();
          return;
        }
        // ── PASSO 2 · CONGELAR A REVISÃO VALIDADA ───────────────────────────────────────────
        // Daqui em diante, "a pintura" é ESTA revisão. Se a criança pintar mais durante a gravação,
        // o que for guardado ainda será exatamente o que foi validado — ou a transação falha.
        const revisionId = metrics.revisionId;

        // ── PASSOS 3-5 · PERSISTIR A PINTURA (que É o instantâneo desta revisão) ────────────
        // Um único artefato carrega pixels + revisão; por isso "gerar o instantâneo da MESMA
        // revisão" e "persistir o instantâneo" não são duas escritas que possam divergir.
        // [S1] A autoridade de escrita é o ACESSO LEGÍTIMO a ESTA história, derivado pela fonte
        // canônica (ProgressContext → storyContentAuthorization) e entregue ao writer INTEIRO, como
        // objeto. A tela não interpreta o contrato nem cria regra própria: abrir a tela não autoriza
        // nada. Quem decide — e quem recusa — é o writer, lendo o contrato.
        const authorization = getContentAuthorization(attemptStoryId);
        const result = await saveColoring60DrawingState(
          attemptStoryId, attemptActivityId, exportData, { authorization },
        );
        const resultLabel =
          result === COLORING60_SAVE_RESULT.SAVED ? 'saved'
          : result === COLORING60_SAVE_RESULT.WRITE_FAILED ? 'write_failed'
          : result === COLORING60_SAVE_RESULT.ACCESS_DENIED ? 'access_denied'
          : result === COLORING60_SAVE_RESULT.AUTHORIZATION_NOT_READY ? 'authorization_not_ready'
          : result === COLORING60_SAVE_RESULT.INVALID_STORY ? 'invalid_story'
          : result === COLORING60_SAVE_RESULT.INVALID_ACTIVITY ? 'invalid_activity'
          : result === COLORING60_SAVE_RESULT.INVALID_AUTHORIZATION ? 'invalid_authorization'
          : 'write_failed';
        if (!activeRef.current || !controller.isCurrent(token)) return; // expirou durante o writer
        if (result !== COLORING60_SAVE_RESULT.SAVED) {
          // [S1] RECUSA DE ACESSO OU IDENTIDADE INVÁLIDA — efeito ZERO. NÃO marca, NÃO incrementa,
          // NÃO celebra, NÃO abre a coleção. Quem não podia escrever também não conclui. A pintura
          // continua na tela (recuperável) e a criança pode tentar de novo — o aviso é gentil e sem
          // jargão; o rótulo viaja só para o log e para a telemetria interna.
          if (result !== COLORING60_SAVE_RESULT.WRITE_FAILED) {
            if (__DEV__) console.log('[Coloring60] escrita recusada; nada marcado:', resultLabel);
            if (typeof onSaveIssue === 'function') onSaveIssue(resultLabel);
            return;
          }

          // ── [S2] FALHA FÍSICA DE ESCRITA — a ÚNICA exceção, e ela é a favor da criança ───────
          // Aqui o acesso era legítimo e a pintura era real: o DISCO falhou. Tratar isso como
          // "não concluiu" cobraria da criança um erro que não é dela e trancaria a progressão da
          // história por falta de espaço no aparelho. A conclusão é gravada — com o desfecho
          // HONESTO, nunca com um READY inventado.
          //
          // Qual desfecho é honesto depende do que está NO DISCO agora, e não do que se tentou
          // gravar. Se já havia uma obra guardada, ela continua lá, intacta (o writer só promove o
          // ponteiro depois de confirmar a nova geração): o instantâneo segue READY e a vaga
          // continua ART — uma sobrescrita falhada JAMAIS rebaixa a obra anterior. Se não havia
          // nada, a conclusão é registrada sem pixels e a coleção dirá exatamente isso.
          const previous = await getColoring60SavedDrawing(attemptStoryId, attemptActivityId);
          if (!activeRef.current || !controller.isCurrent(token)) return; // expirou durante a releitura
          const honestStatus = hasMeaningfulColor(readPaintMetricsFromSnapshot(previous))
            ? SNAPSHOT_STATUS.READY
            : SNAPSHOT_STATUS.NOT_PERSISTED;
          const kept = await markColoring60ActivityDone(
            attemptStoryId, attemptActivityId, exportData, honestStatus,
          );
          if (!activeRef.current || !controller.isCurrent(token)) return; // expirou durante a marcação
          if (kept !== true) {
            if (__DEV__) console.log('[Coloring60] falha de escrita E conclusão não registrada');
            if (typeof onSaveIssue === 'function') onSaveIssue(resultLabel);
            return;
          }
          if (__DEV__) console.log('[Coloring60] escrita falhou; conclusão honesta:', honestStatus);
          // A celebração acontece — a criança terminou de verdade —, mas ela é HONESTA:
          // `persisted: false` conta ao app que estes pixels não ficaram guardados. Não se dispara
          // também o pedido de "tente de novo": comemorar e acusar erro na mesma tela seriam duas
          // mensagens contraditórias para a mesma criança.
          if (typeof onCelebrate === 'function') {
            onCelebrate({
              persisted: false,
              snapshot: exportData,
              snapshotStatus: honestStatus,
              activityId: attemptActivityId,
            });
            return;
          }
          goBack();
          return;
        }

        // ── PASSO 6 · VERIFICAR QUE O GUARDADO É A MESMA REVISÃO ────────────────────────────
        // RELEMOS o que ficou lá. É a diferença entre "o writer disse que deu certo" e "a arte certa
        // está guardada". Divergência ⇒ transação abortada.
        let snapshotStatus = SNAPSHOT_STATUS.NOT_PERSISTED;
        const stored = await getColoring60SavedDrawing(attemptStoryId, attemptActivityId);
        if (!activeRef.current || !controller.isCurrent(token)) return; // expirou durante a releitura
        if (!snapshotMatchesRevision(stored, revisionId)) {
          if (__DEV__) console.log('[Coloring60] instantâneo guardado diverge da revisão validada');
          if (typeof onSaveIssue === 'function') onSaveIssue('snapshot_mismatch');
          return;
        }
        snapshotStatus = SNAPSHOT_STATUS.READY;

        // ── PASSOS 7-9 · CONCLUSÃO, CONTADOR E MEMÓRIA, NUMA ÚNICA AÇÃO ─────────────────────
        // A prova de cor e o desfecho do instantâneo viajam juntos: o serviço de domínio recusa
        // qualquer um dos dois faltando. Sem isso, não existe "3 de 3".
        const completed = await markColoring60ActivityDone(
          attemptStoryId, attemptActivityId, exportData, snapshotStatus,
        );
        if (completed !== true) {
          if (__DEV__) console.log('[Coloring60] conclusão NÃO persistida; nada celebrado');
          if (typeof onSaveIssue === 'function') onSaveIssue('complete_failed');
          return;
        }
        if (__DEV__) console.log('[Coloring60] transação concluída; instantâneo:', snapshotStatus);
        if (!activeRef.current || !controller.isCurrent(token)) return; // expirou durante a marcação

        // ── PASSOS 10-11 · SÓ AGORA A RECOMPENSA — E SÓ AGORA A COLEÇÃO ─────────────────────
        // Quem navega é a criança (§4.7). Chegar aqui já significa arte gravada E verificada, em
        // qualquer plano: `persisted` é `true` e continua sendo informativo e honesto. A experiência
        // infantil é a mesma para todo mundo e não menciona plano.
        if (typeof onCelebrate === 'function') {
          onCelebrate({
            persisted: true,
            snapshot: exportData,
            snapshotStatus,
            activityId: attemptActivityId,
          });
          return;
        }
        goBack();
      } catch (err) { // writer/mark lançou: nada anunciado, SEM unhandled rejection
        if (__DEV__) console.log('[Coloring60] erro na transação (pintura preservada):', err?.message);
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

// [C60-PARTE-3] Resposta ao "Pronto!" numa folha sem cor. Texto de convite, nunca de erro.
const C60_EMPTY_PAINT_TITLE = 'Falta um pouquinho de cor';
const C60_EMPTY_PAINT_MESSAGE = 'Coloque um pouquinho de cor antes de terminar!';
// Dica lida por leitor de tela quando "Pronto!" está desabilitado — a mesma explicação, sem alarde.
const C60_EMPTY_PAINT_HINT = 'Coloque um pouquinho de cor antes de terminar!';

// [C60-PARTE-5] "Limpar desenho" — confirmação com os textos exatos do bloco. A frase extra só
// aparece quando a atividade está concluída AGORA: é a consequência real, dita antes de acontecer.
const C60_CLEAR_TITLE = 'Começar este desenho de novo?';
const C60_CLEAR_MESSAGE = 'Todas as cores desta parte serão apagadas.';
const C60_CLEAR_MESSAGE_DONE_SUFFIX = ' Ela sairá da sua coleção até você colorir novamente.';
const C60_CLEAR_CONFIRM = 'Limpar desenho';
const C60_CLEAR_CANCEL = 'Continuar colorindo';

// [C60-P13-PREWARM] Teto do AQUECIMENTO da próxima parte (§Parte 10). O aquecimento é uma vantagem,
// nunca uma prisão: passado este tempo a ação principal LIBERA de qualquer jeito e a próxima tela
// abre pelo caminho normal (com a hidratação segura que ela já tem). A criança nunca fica esperando.
const C60_PREWARM_TIMEOUT_MS = 4000;

// Ramo Colorir 60: presentacional e local-first. Resolve por (storyId, activityId), respeita os
// três estados honestos e — no estado `available` (P4.T2) — compõe o `ColoringCanvas` existente
// (SEM alterar seu contrato) com paleta e "Pronto". A CONCLUSÃO (booleano leve, plan-agnóstica) é
// SEPARADA do SALVAMENTO de pixels (writer, que só persiste no Plano Família): concluir vale para
// Grátis e Família; salvar pixels é gated pelo writer. NÃO usa o caminho legado (`getColoringImage`/
// cena), NÃO faz fallback para scene_02, NÃO concede estrela, NÃO conclui cena narrativa, NÃO chama
// refreshProgress (o ramo dormente não tem métrica pública). deferred/unknown mostram estado honesto.
function Coloring60ActivityScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  // [S1] Autoridade CANÔNICA de acesso ao conteúdo (fonte única — a MESMA que o mapa, o detalhe e a
  // narração consultam). A tela não recalcula acesso: só repassa o adaptador ao núcleo, que o entrega
  // ao writer. O `?? {}` é defesa de montagem (o app inteiro vive sob ProgressProvider).
  const { getStoryContentAuthorization } = useProgressContext() ?? {};
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
  // [C60-PARTE-3] MEDIDA REAL DA TINTA, publicada pelo motor a cada operação (pintar, apagar,
  // desfazer, limpar, retomar). Substitui a promessa de mão única `onPainted` — que subia para true
  // no primeiro toque e NUNCA voltava, e por isso um desenho apagado continuava "concluível".
  const [c60PaintMetrics, setC60PaintMetrics] = useState(EMPTY_PAINT_METRICS);
  const [c60Saving, setC60Saving] = useState(false);
  // Pulso da paleta (Parte 3): quando a criança toca "Pronto!" numa folha sem cor, a paleta chama a
  // atenção UMA vez. Sem som de sucesso, sem conclusão, sem nada gravado — só um convite.
  const paletteHintAnim = useRef(new Animated.Value(0)).current;
  // [C60-PARTE-2] `isDirty`: a pintura na tela mudou depois do último instantâneo confirmado. É um
  // ref (não estado) de propósito — nenhuma parte da interface renderiza por causa dele; ele existe
  // para que a coleção não sirva um retrato vencido depois de limpar ou repintar.
  const c60DirtyRef = useRef(false);
  // [C60-P8-PROGRESS] Progresso das TRÊS atividades do piloto (Luz · Vida · Cuidado). A ORDEM vem
  // do catálogo fechado e a CONCLUSÃO do serviço plan-agnóstico do piloto — nada aqui é progresso
  // narrativo, conquista ou métrica pública da história.
  const [c60DoneMap, setC60DoneMap] = useState({});
  // [C60-PARTE-9] "A grande conclusão desta história já aconteceu?" — em `ref` porque quem consulta é
  // a máquina de conclusão, um callback, e não a renderização: o valor precisa estar certo no
  // instante do toque, sem depender de um novo quadro. Começa `false` (conservador): na pior hipótese
  // de leitura falha, a festa acontece — nunca o contrário, que seria roubar a primeira vez.
  const c60FinaleSeenRef = useRef(false);
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
  // [C60-P13-JOURNEY] DERIVAÇÃO da jornada em exibição (§Parte 1), produzida por `coloring60Journey`
  // no instante da conclusão e guardada como está: o que foi concluído, quanto falta, qual é a próxima
  // parte e QUAIS ações oferecer. A tela não recalcula nada disso — ela só apresenta e despacha. Na
  // vista de COLEÇÃO o mesmo campo recebe `deriveColoring60CollectionView` (mesmo formato de ações).
  const [c60Journey, setC60Journey] = useState(null);
  // [C60-P13-PREWARM] Estado do AQUECIMENTO da próxima parte (§Parte 10): 'idle' (nada a aquecer),
  // 'loading' (a ação principal espera), 'ready' (lineart já em cache) ou 'failed' (segue pelo caminho
  // normal, com o carregamento seguro da própria tela). Só 'loading' segura o botão — e por pouco tempo.
  const [c60Prewarm, setC60Prewarm] = useState('idle');
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
  // [C60-MARCO] Este editor foi aberto por um MARCO da história (NarrationScreen → contrato central)?
  // Só é fluxo de marco quando a origem é `storyMilestone` E há uma cena de RETOMADA válida (índice
  // inteiro ≥ 0). Sem esses dois fatos ⇒ é o editor comum (dev-tool/jornada), e nada muda. O índice de
  // retomada é a PRÓXIMA cena (0-based) que a NarrationScreen derivou do catálogo (resumeScene − 1).
  const c60ResumeCenaIndex = route.params?.resumeCenaIndex;
  const c60MilestoneFlow = route.params?.origin === C60_NAV_ORIGIN.STORY_MILESTONE
    && Number.isInteger(c60ResumeCenaIndex)
    && c60ResumeCenaIndex >= 0;
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
  // [C60-PARTE-3] "Tem cor de verdade?" — a ÚNICA condição que habilita "Pronto!". Derivada da
  // medida do motor, é de MÃO DUPLA: apagar tudo devolve `false` no mesmo toque, e desfazer devolve
  // `true` junto com os pixels. Nenhum estado paralelo, nenhuma memória de "já pintou uma vez".
  const c60HasColor = hasMeaningfulColor(c60PaintMetrics);
  const c60Steps = getColoring60Activities(storyId)
    .map((a) => ({ id: a.activityId, done: c60DoneMap[a.activityId] === true }));
  const c60NextId = c60Steps.find((s) => !s.done)?.id ?? null;
  // [C60-P13-PREWARM] Alvo do aquecimento (§Parte 10): SÓ quando a ação principal em exibição é
  // "abrir a próxima parte". Nos demais momentos não há nada a pré-carregar — e nada a esperar.
  const c60PrewarmTargetId = (c60Celebrating && c60Journey?.primaryAction?.kind === COLORING60_ACTION.OPEN_NEXT)
    ? (c60Journey.primaryAction.targetActivityId ?? c60NextId)
    : null;
  // [C60-P12-SEED] Identidade determinística da celebração vigente (atividade + modo + progresso). É a
  // semente ESTÁVEL das partículas do overlay (sem Math.random): o mesmo evento gera sempre a mesma
  // disposição, e re-render não "reembaralha". Derivada — sem estado novo e sem tocar a máquina.
  const c60CelebrationId = `${activityId ?? 'none'}:${c60CelebrateMode ?? 'idle'}:${c60Steps.filter((s) => s.done).length}`;

  // [F6-R3.2] CICLO DE VIDA DA SUPERFÍCIE. Colorir era uma das DUAS únicas superfícies interativas
  // do app sem nenhuma escuta de `AppState` nem de foco: abrir o Centro de Controle, mandar o app
  // para segundo plano ou navegar para longe com pintura na tela passava inteiramente despercebido.
  // A adoção aqui é DELIBERADAMENTE conservadora, porque esta tela guarda pintura de criança (SD-8):
  //   · sair NÃO salva, NÃO exporta, NÃO limpa e NÃO descarta nada;
  //   · voltar NÃO relê o armazenamento e NÃO reaplica pintura. A hidratação é de ABERTURA (efeito
  //     com dependências vazias, acima) e reler aqui seria exatamente o "recarregamento silencioso"
  //     que a validação física de `F6-SG-A` precisa provar que não acontece.
  // A finalização atômica do gesto em curso pertence ao MOTOR (`TK-A-016`) — a tela apenas AVISA
  // que a superfície vai sair de cena, e quem decide o que "fechar o gesto" significa é o canvas.
  // Isso não é escrita nem descarte: `commitGesture` não grava, não exporta e não apaga tinta.
  // Sem desestruturar o retorno: nada na interface depende de `appState`/`isFocused` hoje, e criar
  // uma variável só para não usá-la seria estado morto.
  useSurfaceLifecycle({
    onBackground: () => {
      canvasRef.current?.commitGesture?.();
      if (__DEV__) console.log('[Coloring60] superfície → segundo plano/sem foco (gesto fechado no modelo; nenhuma escrita, nenhum descarte)');
    },
    onForeground: () => {
      if (__DEV__) console.log('[Coloring60] superfície → primeiro plano (nenhuma releitura, nenhuma reaplicação)');
    },
  });

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      // Invalida a tentativa vigente ao desmontar/remontar por identidade: um callback de export
      // pendente falhará em isCurrent(token) e ficará inerte (não marca/salva/navega/libera novo).
      attemptControllerRef.current?.invalidate();
    };
  }, []);

  // [C60-PARTE-6] RESET DE DESENVOLVIMENTO — agora é o RESET CANÔNICO, não uma terceira limpeza.
  //
  // O que existia aqui: um helper que apagava conclusão + ponteiro de pixels, mas não a memória de
  // "já concluiu", nem a grande conclusão vista, nem o convite, nem os ARQUIVOS em disco — e um
  // `__devSeedCreationColoring60(n)` que marcava conclusões SEM pintura. Os dois juntos produziam
  // exatamente os estados impossíveis que o bloco veio corrigir: "3 de 3" sem arte e uma primeira
  // vez que nunca voltava. O seed por flag FOI REMOVIDO: semear estado agora é papel da bancada
  // (Coloring60Lab), que só marca uma parte quando existe pintura real guardada.
  //
  // Continua SÓ em __DEV__ e atrás do gate do piloto — jamais no app de produção.
  useEffect(() => {
    if (!__DEV__ || !isColoring60PilotAllowed()) return undefined;
    global.__devResetCreationColoring60 = async () => {
      const r = await resetCreationColoringJourney('creation');
      // A tela montada volta ao primeiro estado junto com o disco (o barramento de invalidação
      // avisa quem tem cache; aqui zeramos o que é local desta instância).
      setC60DoneMap({});
      setC60Celebrating(false);
      setC60CelebrateMode(null);
      setC60CelebrateSnapshot(null);
      setC60FinaleItems(null);
      c60FinaleSeenRef.current = false;
      controlsAnim.setValue(1);
      console.log('[DEV Colorir60] Reset canônico "A Criação":',
        `ok=${r.ok} residual=${r.residual.length ? r.residual.join(',') : 'nenhum'}. Estado 0/3, primeira vez de volta.`);
    };
    console.log('[DEV Colorir60] Helper: __devResetCreationColoring60() — para semear 1/3 ou 2/3 use a bancada (Colorir 60 Lab), que exige pintura real.');
    return () => {
      delete global.__devResetCreationColoring60;
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
    // [C60-PARTE-9] A marca da grande conclusão viaja JUNTO com o progresso, na mesma leitura de
    // abertura: quando a criança tocar "Pronto!", a máquina já sabe se a festa das três é inédita.
    Promise.all([...ids.map((id) => loadColoring60Done(storyId, id)), loadColoring60FinaleSeen(storyId)])
      .then((flags) => {
        if (!alive || !activeRef.current) return;
        const mapa = {};
        ids.forEach((id, i) => { mapa[id] = flags[i] === true; });
        c60FinaleSeenRef.current = flags[ids.length] === true;
        setC60DoneMap(mapa);
        // [C60-PARTE-7] O parâmetro `showCollection` NÃO existe mais. Ele era o que fazia a tela do
        // EDITOR abrir por cima de si mesma uma camada de coleção — e era por isso que a coleção
        // dependia da parte de origem para existir. A coleção agora tem rota própria, lida do disco:
        // quem quer vê-la navega para ROUTES.COLORING60_COLLECTION, de qualquer lugar, com o mesmo
        // resultado. Nenhuma entrada da coleção passa mais por esta tela.
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

  // [C60-P13-HEADER] §Parte 13 · durante os atos a tela inteira vira história: além do Voltar, do
  // título e do "Pronto!" (que já somem com `controlsAnim`/`importantForAccessibility`), o SELO
  // global "MODO CRIADOR ATIVO" também se recolhe — ele é um overlay do navegador e ficava por cima
  // da festa. O sinal é aberto enquanto a celebração está em cena e ENCERRADO na limpeza do efeito,
  // então sair da tela no meio do ato restaura o selo do mesmo jeito. Nada do Modo Criador é alterado.
  useEffect(() => {
    if (!c60Celebrating) return undefined;
    return beginImmersiveMoment();
  }, [c60Celebrating]);

  // [C60-P13-PREWARM] §Parte 10 · AQUECIMENTO da PRÓXIMA PARTE durante a celebração. Enquanto o Beni
  // comemora, a lineart de destino já é resolvida e convertida no cache do canvas — de modo que a
  // transição direta encontre a imagem PRONTA (cache HIT) em vez de recomeçar a conversão depois da
  // remontagem. Regras: (1) roda FORA da máquina de conclusão, para não interferir na decisão; (2) não
  // bloqueia a animação (é assíncrono e não toca nada do que está na tela); (3) só o estado 'loading'
  // segura a ação principal, e mesmo assim por no máximo `C60_PREWARM_TIMEOUT_MS`; (4) falha ⇒ o fluxo
  // segue normal, com o carregamento seguro da própria tela — jamais um beco sem saída.
  useEffect(() => {
    if (!available || c60PrewarmTargetId == null) {
      setC60Prewarm('idle');
      return undefined;
    }
    const res = resolveColoring60Lineart(storyId, c60PrewarmTargetId);
    if (res.status !== COLORING60_RESOLUTION_STATUS.AVAILABLE || !res.source) {
      setC60Prewarm('failed'); // sem fonte local: nada a aquecer, e a ação principal não espera
      return undefined;
    }
    let alive = true;
    setC60Prewarm('loading');
    // Teto de tempo: libera a ação mesmo que a conversão demore (rede/arquivo lentos).
    const cap = setTimeout(() => { if (alive) setC60Prewarm('failed'); }, C60_PREWARM_TIMEOUT_MS);
    prewarmLineart(res.source).then((ok) => {
      if (!alive || !activeRef.current) return;
      setC60Prewarm(ok ? 'ready' : 'failed');
    });
    return () => { alive = false; clearTimeout(cap); };
  }, [available, storyId, c60PrewarmTargetId]);

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

  // O canvas confirmou que a arte guardada é aplicável nesta tela: basta reaplicá-la.
  // loadPaint redesenha a arte e, na sequência, o engine remede a cobertura e reemite
  // PAINT_STATE (→ c60PaintMetrics → c60HasColor) e PAINT_APPLIED (→ revela o canvas). O
  // reconhecimento de "há pintura na frente da criança" (D5) é, portanto, derivado do estado
  // canônico de métricas — não existe mais um booleano local a marcar aqui.
  function handleC60RestoreValid() {
    const saved = restoreRef.current;
    if (!saved) return;
    restoreRef.current = null;
    canvasRef.current?.loadPaint(saved);
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

  // [C60-P10-FINALE] Monta a GALERIA das três artes da grande conclusão pela LEITURA CANÔNICA
  // RECONCILIADA — a MESMA da coleção (`loadColoring60Slots`), com o MESMO estado anexado
  // (`coloring60SlotWithKind`). Cada item chega com `kind`, `paint` e `lineart` já reconciliados;
  // o overlay só renderiza o resultado.
  //
  // [C60-FIX3] O QUE MUDOU E POR QUÊ. Esta função montava a galeria por conta própria: a atividade
  // ATUAL vinha do instantâneo EM MEMÓRIA e as outras duas do storage. Quando a conclusão não vinha
  // acompanhada de pixels guardados, isso produzia a cena reprovada no teste físico: a
  // parte recém-pintada aparecia como obra guardada e as outras duas como molduras vazias, enquanto
  // o contador dizia, corretamente, 3 de 3. Duas fontes para a mesma pergunta = duas verdades.
  // O instantâneo da sessão continua PROTAGONISTA onde ele de fato existe: a moldura viva da
  // celebração imediata (`Coloring60ArtGlow`, alimentada por `c60CelebrateSnapshot`). No CONJUNTO
  // FINAL, cada vaga passa a mostrar o seu estado verdadeiro — nunca uma pintura temporária exposta
  // como obra salva.
  //
  // O parâmetro sobrevive por CONTRATO DE CHAMADA (a máquina de conclusão passa o instantâneo), mas
  // é deliberadamente IGNORADO aqui: injetá-lo na galeria é exatamente o defeito corrigido.
  //
  // À prova de falha: qualquer erro entrega galeria vazia e o overlay permanece no papel neutro —
  // jamais um estado inventado, jamais um placeholder de imagem quebrada.
  async function loadC60FinaleItems(_instantaneoIgnorado) {
    try {
      const { slots } = await loadColoring60Slots(storyId); // ordem fechada: Luz · Vida · Cuidado
      const items = slots.map((slot) => coloring60SlotWithKind(slot));
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
  // [S2] O QUE CHEGA AQUI. Recusa de ACESSO e identidade inválida NUNCA chegam — o núcleo interrompe
  // antes, sem marcar nada. Chega o desfecho SAVED e chega a FALHA FÍSICA de escrita, que é conclusão
  // de verdade para a criança (ela terminou; o disco é que falhou) e recebe a MESMA celebração, com
  // `persisted: false`. A festa não muda: nem por plano, nem por disco cheio — a criança concluiu
  // igual. NENHUMA navegação acontece aqui: quem navega é a criança, pelas ações do
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
    // [C60-P13-JOURNEY] A DECISÃO é DERIVADA (§Parte 1), não recalculada aqui: modo, contagens,
    // próxima parte e as três ações vêm da mesma função pura que alimenta o cartão da história. Assim
    // a celebração, o cartão e a coleção jamais discordam sobre em que ponto da jornada a criança está.
    const journey = deriveColoring60Completion({
      doneMapBefore: c60DoneMap,
      currentActivityId: activityId,
      order: catalogIds,
    });
    const wasAlreadyDone = journey.completionMode === 'update';
    const doneCountBefore = journey.completedCountBefore;
    const doneCountAfter = journey.completedCountAfter;
    if (__DEV__) {
      console.log(
        `[Coloring60] máquina de conclusão: already=${wasAlreadyDone} antes=${doneCountBefore} depois=${doneCountAfter}/${total} persistido=${persisted} modo=${journey.completionMode} próxima=${journey.nextIncompleteActivityId}`,
      );
    }

    // O instantâneo (payload v2) alimenta o quadro de brilho para seguir os LIMITES REAIS da arte
    // (Parte 3) em TODAS as três celebrações, e a galeria quando a arte atual só existe em memória.
    // Setado UMA vez antes de qualquer ramo, para que o primeiro quadro da moldura já esteja no lugar.
    setC60CelebrateSnapshot(snapshot);
    // [C60-MARCO · CTA contextual] No fluxo de MARCO, a criança está DENTRO da história: a conclusão
    // não deve oferecer "próxima parte"/"ver coleção"/"continuar" (que a tirariam da narrativa).
    // Reenquadramos as AÇÕES para um ÚNICO caminho — "Continuar a história" (retoma na cena de retorno)
    // — pela derivação PURA `reframeColoring60JourneyForMilestone`, que decide por ORIGEM (marco), nunca
    // pelo texto do botão. O rótulo é DISTINTO de "Voltar à aventura" (a saída para a StoryDetail): dois
    // destinos, dois textos. A máquina de jornada NÃO é tocada — `journey` (modo, contagens, próxima
    // parte) segue intacto para o cartão da StoryDetail e a coleção; só as AÇÕES desta celebração mudam.
    // A celebração VISUAL (modo activity/finale/update decidido abaixo) permanece a que a máquina
    // escolheu — um 3/3 legítimo ainda é comemorado; apenas o botão passa a ser um só, que retoma a
    // história na cena de retorno (`c60ResumeCenaIndex` + 1, 1-based).
    setC60Journey(c60MilestoneFlow
      ? reframeColoring60JourneyForMilestone(journey, {
          returnSceneId: Number.isInteger(c60ResumeCenaIndex) ? c60ResumeCenaIndex + 1 : null,
        })
      : journey);

    // [C60-A3] TRANSAÇÃO CONCLUÍDA ⇒ AQUECE O RETRATO da coleção. `onCelebrate` só é chamado depois
    // de a conclusão estar GRAVADA — seja com a arte guardada (SAVED), seja com o desfecho honesto de
    // uma escrita que falhou. Em ambos os casos há o que reconciliar, e o retrato reflete a verdade.
    // Dispara a reconciliação em segundo plano (dedup em voo por storyId): quando a criança tocar
    // "Ver minha coleção", o retorno é quente e instantâneo. Fire-and-forget de propósito — NÃO
    // aguardamos, NÃO navegamos, NÃO tocamos progresso/som/háptico, e um erro aqui não afeta a festa.
    primeColoring60Collection(storyId);

    // Editar uma atividade JÁ concluída (Regras 4/5): celebração de ATUALIZAÇÃO — a arte volta ao
    // ENQUADRAMENTO INTEIRO ("Ver tudo") para ficar inteira e visível durante a festa, o Beni reage e
    // a mensagem celebra as novas cores. NÃO repete a grande conclusão nem a página especial de 1ª vez,
    // e NÃO mexe no progresso (já estava done). Sem navegação: a criança escolhe pelas ações do cartão
    // — e, com a jornada incompleta, a ação principal continua sendo SEGUIR (§Parte 6), não ficar.
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

    // [C60-PARTE-9] A GRANDE conclusão exige DUAS condições, não uma: as três completas AGORA **e**
    // a festa ainda não vista. Antes bastava a primeira — então limpar uma parte e pintá-la de novo
    // reencenava a cerimônia inteira, e a "primeira vez" deixava de significar alguma coisa. Voltar
    // a 3/3 continua sendo comemorado (celebração de atividade, com a coleção como próximo passo);
    // o que não se repete é o acontecimento único. Só o reset canônico devolve a primeira vez.
    if (journey.allActivitiesComplete && c60FinaleSeenRef.current !== true) {
      // 2/3 → 3/3 INÉDITO: GRANDE conclusão. Resolve a galeria das três pela LEITURA CANÔNICA
      // (o mesmo estado que a coleção exibe) ANTES de a criança tocar em qualquer coisa.
      setC60CelebrateMode('finale');
      loadC60FinaleItems(snapshot);
      // Exibiu ⇒ está vista. Marca imediatamente (best-effort, sem segurar a festa): se o app for
      // fechado no meio, ela já não é mais inédita — que é exatamente a verdade do que aconteceu.
      c60FinaleSeenRef.current = true;
      markColoring60FinaleSeen(storyId);
    } else {
      // Ainda falta atividade: celebração CURTA de atividade (a pintura continua protagonista).
      setC60CelebrateMode('activity');
    }
    setC60Celebrating(true);
    Animated.timing(controlsAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }
  // [C60-P11-MACHINE-END]

  // [C60-P13-CONTINUE] Fecha a camada de festa e devolve os controles de pintura suavemente, mantendo
  // a criança NA MESMA atividade ("Continuar neste desenho"). Sem navegação e sem tocar o progresso —
  // ela simplesmente volta a pintar de onde estava. Limpa o snapshot da moldura e a jornada em exibição.
  function handleC60ContinueColoring() {
    setC60Celebrating(false);
    setC60CelebrateMode(null);
    setC60CelebrateSnapshot(null);
    setC60Journey(null);
    setC60Prewarm('idle');
    Animated.timing(controlsAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }

  // [C60-P13-DIRECT] TRANSIÇÃO DIRETA (§Parte 3/4/10): abre a atividade de destino trocando a
  // IDENTIDADE da MESMA rota — o wrapper remonta o ramo pela `key` (mecanismo já existente do P4).
  // Sem voltar à tela da história, sem empilhar rota nova e sem tela intermediária: a criança sai do
  // fecho de uma parte e entra na seguinte. A camada de festa é desmontada ANTES da troca (nada de
  // overlay sobrevivendo à identidade nova) e os controles voltam ao normal. Sem destino → caminho
  // seguro de sempre (voltar à aventura). Guarda em activeRef para não navegar após desmontar.
  function openC60Activity(targetActivityId) {
    if (!activeRef.current) return;
    if (targetActivityId == null) { navigation.goBack(); return; }
    // REVISÃO ADVERSARIAL (Portão 10): destino IGUAL à parte aberta agora — acontece de verdade em
    // "Colorir novamente" quando a última concluída foi justamente a primeira parte. `setParams` com
    // a mesma identidade NÃO remonta nada: o toque ficaria mudo, com a festa fechando e nenhum sinal.
    // Nesse caso o caminho honesto é o mesmo de "continuar neste desenho": a festa sai e o desenho volta.
    if (targetActivityId === activityId) { handleC60ContinueColoring(); return; }
    setC60Celebrating(false);
    setC60CelebrateMode(null);
    setC60CelebrateSnapshot(null);
    setC60Journey(null);
    setC60FinaleItems(null);
    setC60Prewarm('idle');
    controlsAnim.setValue(1);
    navigation.setParams({ activityId: targetActivityId });
  }

  // [C60-PARTE-7] A COLEÇÃO SAIU DAQUI. Antes era uma camada aberta SOBRE o desenho em edição
  // (`c60CelebrateMode = 'collection'`): a obra atual ficava gigante atrás, o fundo herdava a cor
  // temática da parte de origem e os textos caíam sobre a arte — a mesma coleção parecia três
  // coleções diferentes conforme a origem. Agora é uma TELA PRÓPRIA, que lê o estado do disco e não
  // conhece canvas nenhum. Daqui só resta a NAVEGAÇÃO.
  //
  // [C60-NAV · FLUXO 5] Instância ÚNICA: o `replace` cru daqui criava uma SEGUNDA coleção quando o
  // editor fora aberto por Coleção→Prévia→Editar (a coleção já estava embaixo). O contrato central
  // resolve por destino: coleção na pilha → `popTo` até ela (remove prévia+editor); coleção ausente
  // (StoryDetail→Editor direto) → `replace` (a coleção toma o lugar do editor).
  function openC60CollectionScreen() {
    if (!activeRef.current) return;
    c60OpenCollectionFromCompletion(navigation, storyId);
  }

  // [C60-P13-DISPATCH] DESPACHANTE ÚNICO das ações da jornada. A derivação diz a INTENÇÃO
  // (`COLORING60_ACTION`) e o rótulo; a tela decide COMO realizá-la. Assim nenhum rótulo carrega
  // navegação escondida e nenhum modo precisa de um mapeamento próprio de botões. Intenção
  // desconhecida cai no caminho seguro de sempre: voltar à aventura, com o progresso guardado.
  function handleC60Action(action) {
    if (!activeRef.current) return;
    const kind = action?.kind ?? null;
    if (kind === COLORING60_ACTION.OPEN_NEXT || kind === COLORING60_ACTION.RESTART) {
      openC60Activity(action?.targetActivityId ?? null);
      return;
    }
    if (kind === COLORING60_ACTION.STAY) { handleC60ContinueColoring(); return; }
    if (kind === COLORING60_ACTION.COLLECTION) { openC60CollectionScreen(); return; }
    // [C60-MARCO · CTA contextual] Editor aberto por um MARCO da história ⇒ "Continuar a história"
    // RETOMA a narrativa na cena de retorno (decisão do fundador), pelo contrato central — consumindo
    // o editor (replace) e montando uma Narração fresca na cena de retomada. O roteamento decide pela
    // ORIGEM (`c60MilestoneFlow`), NUNCA pelo texto do botão. Fora do marco, nada muda: BACK/desconhecida
    // saem para a StoryDetail ("Voltar à aventura") como sempre — dois destinos, dois textos.
    if (c60MilestoneFlow) {
      c60ResumeStoryAfterMilestone(navigation, { story: route.params.story, resumeCenaIndex: c60ResumeCenaIndex });
      return;
    }
    // [C60-NAV · FLUXO 5] BACK ("Voltar à aventura") e qualquer intenção desconhecida saem DIRETO
    // para a história pelo contrato central — nunca `goBack()` cru, que caía na PRÉVIA (a evidência
    // física) por depender de quantas telas do piloto sobraram na pilha.
    c60ExitToStory(navigation);
  }

  function handleC60Primary() { handleC60Action(c60Journey?.primaryAction ?? null); }
  function handleC60Secondary() { handleC60Action(c60Journey?.secondaryAction ?? null); }
  function handleC60Tertiary() { handleC60Action(c60Journey?.tertiaryAction ?? null); }

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
      hasColor: c60HasColor,
      saving: c60Saving,
      storyId,
      activityId,
      setSaving: setC60Saving,
      goBack: () => navigation.goBack(),
      onSaveIssue: handleC60SaveIssue,
      onCelebrate: handleC60Celebrate,
      onEmptyPaint: handleC60EmptyPaint,
      // [S1] A autoridade de acesso vem PRONTA da fonte única (ProgressContext). A tela apenas
      // repassa o adaptador — não deriva, não interpreta e não guarda cópia do contrato.
      getContentAuthorization: getStoryContentAuthorization,
    });
  }

  // [C60-PARTE-3] MEDIDA recebida do motor. Guardada normalizada — é a fonte de `c60HasColor` e,
  // portanto, de "Pronto!" habilitado ou não. Chega a cada operação que muda a tinta, inclusive
  // apagar e limpar (por isso o botão volta a desabilitado sozinho).
  function handleC60PaintState(raw) {
    if (!activeRef.current) return;
    setC60PaintMetrics(normalizePaintMetrics(raw));
  }

  // [C60-PARTE-3] "Pronto!" numa folha sem cor. A função de domínio já recusaria, mas a criança
  // merece uma resposta — e ela é um CONVITE, não um erro: a paleta pulsa uma vez e o Beni pede um
  // pouquinho de cor. Sem som de sucesso, sem conclusão, sem instantâneo, sem recompensa.
  function handleC60EmptyPaint() {
    if (!activeRef.current) return;
    paletteHintAnim.stopAnimation();
    paletteHintAnim.setValue(0);
    Animated.sequence([
      Animated.timing(paletteHintAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(paletteHintAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
    Alert.alert(C60_EMPTY_PAINT_TITLE, C60_EMPTY_PAINT_MESSAGE, [{ text: 'Vou colorir!' }]);
  }

  // [C60-PARTE-5] LIMPAR DESENHO — a ação que faltava. Antes só existia a borracha (apagar cor por
  // cor) e, pior, apagar tudo NÃO desfazia a conclusão: o desenho ficava em branco e a coleção
  // continuava exibindo "concluída". Aqui a limpeza é COMPLETA e HONESTA:
  //   • limpa SÓ a atividade aberta (as outras duas não são tocadas);
  //   • entra como UMA operação no histórico do motor — "Desfazer" traz a pintura de volta;
  //   • remove o INSTANTÂNEO guardado (não sobra arte antiga para reaparecer na coleção);
  //   • devolve `isCurrentlyComplete` a falso, o contador cai e a coleção reflete na hora;
  //   • "Pronto!" volta a desabilitado sozinho (a medida do motor vira zero no mesmo toque).
  // `hasEverCompleted` NÃO é apagado: limpar uma folha não apaga a memória de quem já chegou lá —
  // só o reset canônico faz isso. O estado vazio jamais é gravado como concluído.
  function handleC60ClearDrawing() {
    if (!activeRef.current || c60Saving) return;
    const wasDone = c60DoneMap[activityId] === true;
    const message = wasDone
      ? `${C60_CLEAR_MESSAGE}${C60_CLEAR_MESSAGE_DONE_SUFFIX}`
      : C60_CLEAR_MESSAGE;
    Alert.alert(C60_CLEAR_TITLE, message, [
      { text: C60_CLEAR_CANCEL, style: 'cancel' },
      {
        text: C60_CLEAR_CONFIRM,
        style: 'destructive',
        onPress: async () => {
          if (!activeRef.current) return;
          // 1) Pixels na tela: uma única operação no histórico (o motor empilha o estado anterior
          //    antes de zerar), e a medida republicada já derruba "Pronto!".
          canvasRef.current?.clearCanvas();
          // 2) Instantâneo guardado e conclusão saem JUNTOS. A ordem importa: primeiro o registro
          //    de conclusão (o que a coleção lê), depois os pixels — assim, se a segunda falhar,
          //    o pior caso é uma arte órfã invisível, nunca uma conclusão sem arte.
          try { await clearColoring60Done(storyId, activityId); } catch { /* nunca derruba a tela */ }
          try { await clearColoring60SavedDrawing(storyId, activityId); } catch { /* idem */ }
          if (!activeRef.current) return;
          // 3) Contador e coleção, numa única atualização. Só ESTA atividade muda.
          setC60DoneMap((prev) => {
            if (prev[activityId] !== true) return prev;
            const next = { ...prev };
            delete next[activityId];
            return next;
          });
          setC60CelebrateSnapshot(null);
          setC60FinaleItems(null); // cache da coleção invalidado: nada de card colorido antigo
          c60DirtyRef.current = true;
        },
      },
    ]);
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
            {/* [C60-PARTE-3] "Pronto!" só existe quando há COR DE VERDADE na folha. Enquanto não há,
                o botão fica apagado, `accessibilityState.disabled` avisa o leitor de tela e a dica
                explica o porquê. Ele continua TOCÁVEL de propósito: um botão que não responde parece
                app quebrado — tocá-lo devolve o convite ("Coloque um pouquinho de cor...") em vez de
                silêncio. A conclusão em si é impossível: a função de domínio recusa. */}
            <SoundButton
              silent
              style={[
                styles.prontoBtn,
                c60Saving && styles.prontoBtnSaving,
                !c60HasColor && !c60Saving && c60Styles.prontoBtnDisabled,
              ]}
              onPress={handleC60Pronto}
              activeOpacity={0.85}
              disabled={c60Saving}
              accessibilityState={{ disabled: !c60HasColor || c60Saving }}
              accessibilityHint={!c60HasColor ? C60_EMPTY_PAINT_HINT : undefined}
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
            // [C60-PARTE-3] A MEDIDA substitui a promessa: `onPaintState` chega a cada operação que
            // muda a tinta (inclusive apagar, desfazer e limpar) e é de mão dupla. `onPainted`
            // (mão única, legado) não é mais consumido aqui — era ele que deixava um desenho
            // apagado "concluível".
            onPaintState={handleC60PaintState}
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
            {/* [C60-PARTE-5] LIMPAR DESENHO. Não existia caminho claro para recomeçar uma parte —
                a criança apagava cor por cor com a borracha. Age só nesta atividade, entra como UMA
                operação no histórico (Desfazer restaura tudo) e, quando a parte estava concluída,
                avisa antes que ela sairá da coleção. */}
            <CompactTool accessibilityLabel="Limpar desenho" onPress={handleC60ClearDrawing}>
              <FaithIcon name="clear" size={22} color="#666" />
            </CompactTool>
            <CompactTool accessibilityLabel="Ver tudo (centralizar)" onPress={() => canvasRef.current?.resetZoom()}>
              <FaithIcon name="zoom_reset" size={22} color="#666" />
            </CompactTool>
          </View>

          {/* [C60-PARTE-3] A paleta PULSA uma vez quando "Pronto!" é tocado numa folha sem cor:
              a resposta ao convite fica onde está a solução, não num aviso solto. Escala sutil,
              no driver nativo, sem alterar o layout nem interromper o toque. */}
          <Animated.View
            style={{
              transform: [{
                scale: paletteHintAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }),
              }],
            }}
          >
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
        </Animated.View>

        {/* Momento de conclusão (§Parte 4 · Diretor de Celebração): entra sobre a pintura congelada
            e só sai pela escolha da criança. A máquina de conclusão já decidiu o modo ('update' |
            'activity' | 'finale') — CADA modo é uma celebração de intensidade própria (nenhum é um
            toast técnico). A navegação acontece nos handlers, nunca automaticamente. */}
        {/* [C60-PARTE-7] O modo 'collection' NÃO é mais montado aqui: a coleção é tela própria.
            Esta camada só existe para os TRÊS desfechos de conclusão, que acontecem sobre a pintura
            que a criança acabou de fazer — e é justamente por isso que eles podem usar o canvas. */}
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
            // [C60-P13-JOURNEY] A DERIVAÇÃO viaja inteira (§Parte 1): contagem com concordância,
            // trilha, convite da próxima parte e as TRÊS ações com seus rótulos. O overlay apresenta
            // o que recebe e devolve a escolha; quem realiza a intenção é o despachante da tela.
            journey={c60Journey}
            // §Parte 10 · a ação principal só espera enquanto a próxima parte está sendo aquecida —
            // e no máximo por C60_PREWARM_TIMEOUT_MS. Nos demais estados ela responde de imediato.
            primaryPending={c60Prewarm === 'loading'}
            onPrimary={handleC60Primary}
            onSecondary={handleC60Secondary}
            onTertiary={handleC60Tertiary}
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
  // [C60-PARTE-3] "Pronto!" sem cor na folha: apagado, mas ainda tocável (tocar devolve o convite).
  prontoBtnDisabled: { opacity: 0.45 },
});

// ─────────────────────────────────────────────────────────────────────────────
// [P3J] LegacyColoringScreen — REMOVIDA (Aposentadoria Global do Colorir Legado).
//
// Era o corpo por CENA do Colorir legado: abria um lineart de `assets/stories/<id>/coloring/`,
// salvava a pintura em `drawingStorage` e marcava a atividade da cena. As 199 folhas legadas
// saíram do app, então o ramo ficou sem arte para abrir. Nenhuma tela navega mais para
// `Coloring` sem `activityId`.
//
// O que PERMANECE intacto: a tela `ColoringScreen` (este arquivo), o motor `ColoringCanvas`,
// a rota `Coloring` e TODO o Colorir com o Beni (Coloring60ActivityScreen acima).
// `drawingStorage` continua íntegro no projeto: nada foi apagado do aparelho da criança —
// os payloads antigos apenas deixaram de ter consumidor.
// ─────────────────────────────────────────────────────────────────────────────

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

  /* [P3J] Saíram com o ramo legado: os diálogos ("continuar meu desenho" / "pinte primeiro"),
     as dicas flutuantes (pan, primeira vez, toque na linha) e o placeholder de folha ausente.
     Eram exclusivos do Colorir por cena — o Colorir com o Beni tem os seus próprios. */
});
