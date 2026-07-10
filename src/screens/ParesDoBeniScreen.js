/**
 * ParesDoBeniScreen — primeiro jogo real da aba Brincar (Bloco 1.3).
 *
 * Jogo da memória com as CAPAS das histórias (assets já existentes). Define o padrão
 * de UX dos próximos jogos: entrada → dificuldade → partida → celebração → voltar.
 *
 * ── Regras de plano ──────────────────────────────────────────────────────────
 * Free: 2 rodadas por dia (brincarDailyService), só a dificuldade Fácil.
 * Plano Família: rodadas ilimitadas, todas as dificuldades.
 * O bloqueio é um CONVITE, nunca uma punição.
 *
 * ── Rodada e estrelinha ──────────────────────────────────────────────────────
 * A rodada só é consumida quando a partida COMEÇA (o baralho é montado). Abrir a
 * tela e olhar não consome nada. A estrelinha só é creditada quando a partida é
 * CONCLUÍDA, e respeita o teto diário (BRINCAR_DAILY_STAR_CAP), inclusive no
 * Plano Família — senão a economia de Estrelinhas quebraria.
 *
 * Sem emoji: só FaithIcon. Sem som ainda: os eventos estão nomeados em
 * PARES_SOUND_EVENTS, prontos para o bloco de áudio.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import SoundButton from '../components/SoundButton';
import FaithIcon from '../components/ui/FaithIcon';
import { BeniGuideBubble } from '../components/beni';
import { ROUTES } from '../constants/routes';
import { stories } from '../data/stories';
import { getStoryCoverImage } from '../services/storyImageService';
import { isPremiumUser } from '../services/accessControl';
import { addBonusStars } from '../services/postStoryStorage';
import { useProgressContext } from '../context/ProgressContext';
import { getDailyRounds, consumeRound, toDayKey } from '../services/brincarDailyService';
import { readStats, recordParesResult } from '../services/brincarStatsService';
import { warn } from '../utils/logger';
import {
  DIFFICULTIES, getDifficulty, buildDeck, pickStoryIds, isPair,
  computeScore, formatTime, BRINCAR_DAILY_STAR_CAP,
} from '../services/paresGameService';

/** Falas do Beni no jogo (texto por enquanto; áudio vem no bloco de som). */
const BENI = {
  entrada: 'Vamos achar os pares? Toque em duas cartinhas iguais!',
  primeiroPar: 'Isso! Você achou o primeiro par.',
  metade: 'Você já está na metade. Continue!',
  incentivo: 'Quase! Respira e tenta de novo, eu tô aqui.',
  vitoria: 'Você conseguiu! Que memória boa!',
  semRodadas: 'As rodadas de hoje acabaram. Amanhã a gente joga de novo!',
};

const IDS_COM_CAPA = stories.map((s) => s.id).filter((id) => !!getStoryCoverImage(id));

function Carta({ carta, aberta, casada, size, onPress }) {
  const flip = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(flip, { toValue: aberta || casada ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [aberta, casada]);

  const cover = getStoryCoverImage(carta.storyId);
  return (
    <SoundButton
      style={[styles.carta, { width: size, height: size * 1.12 }, casada && styles.cartaCasada]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={aberta || casada}
      accessibilityLabel={aberta || casada ? 'Carta aberta' : 'Carta fechada'}
    >
      {aberta || casada ? (
        <Animated.View style={{ flex: 1, opacity: flip }}>
          {cover ? (
            <Image source={cover} style={styles.cartaImg} resizeMode="cover" />
          ) : (
            <View style={[styles.cartaImg, styles.cartaSemImg]}><FaithIcon name="bible" size={22} color={pt.textSoft} /></View>
          )}
          {casada && (
            <View style={styles.cartaCheck}>
              <FaithIcon name="check" size={18} color="#FFF" />
            </View>
          )}
        </Animated.View>
      ) : (
        <View style={styles.cartaVerso}>
          <FaithIcon name="pares" size={size * 0.34} color="#FFFFFFAA" />
        </View>
      )}
    </SoundButton>
  );
}

export default function ParesDoBeniScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // O contexto pode não estar montado (ex.: tela aberta fora do Provider em um teste).
  // O jogo não depende dele para funcionar: se faltar, apenas não atualizamos o resumo.
  const progressCtx = useProgressContext();
  const refreshProgress = progressCtx?.refreshProgress;
  const premium = isPremiumUser();

  const [fase, setFase] = useState('entrada'); // entrada | jogando | vitoria
  const [difId, setDifId] = useState('facil');
  const [deck, setDeck] = useState([]);
  const [abertas, setAbertas] = useState([]);   // índices virados agora
  const [casadas, setCasadas] = useState([]);   // chaves já casadas
  const [erros, setErros] = useState(0);
  const [inicioMs, setInicioMs] = useState(0);
  const [agoraMs, setAgoraMs] = useState(0);
  const [rounds, setRounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [dica, setDica] = useState(BENI.entrada);
  const travado = useRef(false);

  const dif = getDifficulty(difId) || DIFFICULTIES[0];

  useEffect(() => {
    let vivo = true;
    // Rodadas e recordes são informativos: se a leitura falhar, o jogo abre do mesmo jeito.
    getDailyRounds().then((r) => vivo && setRounds(r)).catch((e) => warn('ParesDoBeni.rounds:', e));
    readStats().then((s) => vivo && setStats(s)).catch((e) => warn('ParesDoBeni.stats:', e));
    return () => { vivo = false; };
  }, []);

  /* Cronômetro visível — informativo, nunca regressivo. */
  useEffect(() => {
    if (fase !== 'jogando') return undefined;
    const t = setInterval(() => setAgoraMs(Date.now()), 500);
    return () => clearInterval(t);
  }, [fase]);

  const decorrido = fase === 'vitoria' && resultado ? resultado.elapsedMs : Math.max(0, agoraMs - inicioMs);
  const paresFeitos = casadas.length / 2;

  /* ── Começar: SÓ AQUI a rodada é consumida ── */
  const comecar = useCallback(async () => {
    const r = await consumeRound();
    if (!r.ok) {
      setRounds(await getDailyRounds());
      setDica(BENI.semRodadas);
      return;
    }
    const ids = pickStoryIds(IDS_COM_CAPA, dif.pairs);
    setDeck(buildDeck(ids));
    setAbertas([]); setCasadas([]); setErros(0); setResultado(null);
    setDica(BENI.entrada);
    const t = Date.now();
    setInicioMs(t); setAgoraMs(t);
    setFase('jogando');
    setRounds(await getDailyRounds());
  }, [dif.pairs]);

  /* ── Concluir: SÓ AQUI a estrelinha é creditada ──
     A criança venceu: a tela de vitória aparece mesmo se o registro do recorde ou o
     crédito da estrelinha falhar. Recompensa é bônus; a vitória não pode sumir. */
  const concluir = useCallback(async (elapsedMs, errosFinais) => {
    let r = { stats: null, isBest: false, starAwarded: false };
    try {
      const day = toDayKey(new Date());
      r = await recordParesResult({ dificuldade: difId, elapsedMs, erros: errosFinais, day });
      if (r.starAwarded) {
        await addBonusStars(1);
        await refreshProgress?.();
      }
    } catch (e) {
      warn('ParesDoBeni.concluir:', e);
    }
    if (r.stats) setStats(r.stats);
    setResultado({
      elapsedMs, erros: errosFinais,
      score: computeScore({ pairs: dif.pairs, erros: errosFinais, elapsedMs }),
      isBest: r.isBest, starAwarded: r.starAwarded,
    });
    setDica(BENI.vitoria);
    setFase('vitoria');
  }, [difId, dif.pairs, refreshProgress]);

  const tocarCarta = useCallback((i) => {
    if (travado.current || fase !== 'jogando') return;
    if (abertas.includes(i) || casadas.includes(deck[i].key)) return;

    const novas = [...abertas, i];
    setAbertas(novas);
    if (novas.length < 2) return;

    const [a, b] = novas.map((k) => deck[k]);
    if (isPair(a, b)) {
      const novasCasadas = [...casadas, a.key, b.key];
      setCasadas(novasCasadas);
      setAbertas([]);
      const feitos = novasCasadas.length / 2;
      if (feitos === 1) setDica(BENI.primeiroPar);
      else if (feitos === Math.ceil(dif.pairs / 2)) setDica(BENI.metade);
      if (feitos === dif.pairs) concluir(Date.now() - inicioMs, erros);
      return;
    }

    // Erro: feedback SUAVE — as cartas voltam sozinhas, sem som de punição.
    const errosAgora = erros + 1;
    setErros(errosAgora);
    if (errosAgora > 0 && errosAgora % 3 === 0) setDica(BENI.incentivo);
    travado.current = true;
    setTimeout(() => { setAbertas([]); travado.current = false; }, 700);
  }, [abertas, casadas, deck, erros, fase, dif.pairs, inicioMs, concluir]);

  const semRodadas = !premium && rounds != null && rounds.remaining <= 0;
  const recorde = stats?.pares?.[difId]?.bestMs ?? null;
  const cardSize = useMemo(() => {
    const larguraUtil = Math.min(width, 520) - 32 - (dif.cols - 1) * 8;
    return Math.floor(larguraUtil / dif.cols);
  }, [width, dif.cols]);

  /* ══════════════ ENTRADA ══════════════ */
  if (fase === 'entrada') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} titulo="Pares do Beni" />
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
          <View style={styles.painel}>
            <BeniGuideBubble message={dica} avatarVariant="teaching" tone="purple" compact />
            <Text style={styles.explica}>
              Vire duas cartinhas. Se as figuras forem iguais, o par fica aberto. Ache todos os pares!
            </Text>
          </View>

          {!premium && (
            <View style={styles.pill}>
              <FaithIcon name="star" size={14} color={pt.goldDeep} />
              <Text style={styles.pillText}>
                {rounds == null
                  ? 'Preparando suas rodadas…'
                  : rounds.remaining > 0
                    ? `Você tem ${rounds.remaining} rodada${rounds.remaining === 1 ? '' : 's'} hoje.`
                    : 'As rodadas de hoje acabaram. Amanhã tem mais!'}
              </Text>
            </View>
          )}

          <Text style={styles.secao}>Escolha o tamanho</Text>
          {DIFFICULTIES.map((d) => {
            const bloqueado = d.premium && !premium;
            const rec = stats?.pares?.[d.id]?.bestMs ?? null;
            return (
              <SoundButton
                key={d.id}
                style={[styles.difCard, difId === d.id && !bloqueado && styles.difCardAtivo, bloqueado && styles.difCardBloqueado]}
                onPress={() => !bloqueado && setDifId(d.id)}
                activeOpacity={0.85}
                disabled={bloqueado}
              >
                <View style={styles.difIconBg}>
                  <FaithIcon name={bloqueado ? 'lock' : 'pares'} size={18} color={bloqueado ? pt.textSoft : pt.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.difTitulo}>{d.label}</Text>
                  <Text style={styles.difDesc}>
                    {bloqueado
                      ? 'Faz parte do Plano Família.'
                      : rec
                        ? `${d.pairs} pares · seu melhor tempo: ${formatTime(rec)}`
                        : `${d.pairs} pares`}
                  </Text>
                </View>
                {difId === d.id && !bloqueado && <FaithIcon name="check" size={20} color={pt.greenDeep} />}
              </SoundButton>
            );
          })}

          {semRodadas ? (
            <View style={styles.convite}>
              <FaithIcon name="family" size={16} color="#7A5800" />
              <Text style={styles.conviteText}>
                Com o Plano Família você brinca quantas vezes quiser e abre os tamanhos Médio e Difícil.
              </Text>
            </View>
          ) : (
            <SoundButton style={styles.btnPrimario} onPress={comecar} activeOpacity={0.9}>
              <Text style={styles.btnPrimarioText}>Começar a jogar</Text>
            </SoundButton>
          )}

          {!premium && !semRodadas && (
            <View style={styles.convite}>
              <FaithIcon name="family" size={16} color="#7A5800" />
              <Text style={styles.conviteText}>
                No Plano Família as rodadas são ilimitadas e os tamanhos Médio e Difícil ficam abertos.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  /* ══════════════ VITÓRIA ══════════════ */
  if (fase === 'vitoria') {
    return (
      <View style={styles.root}>
        <Header insets={insets} onBack={() => navigation.goBack()} titulo="Pares do Beni" />
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
          <View style={styles.painel}>
            <BeniGuideBubble message={BENI.vitoria} avatarVariant="celebrating" tone="purple" compact />
          </View>

          <View style={styles.vitoriaCard}>
            <View style={styles.scoreRow}>
              {[1, 2, 3].map((n) => (
                <FaithIcon key={n} name="star" size={30} color={n <= (resultado?.score ?? 1) ? pt.gold : '#E3DDD4'} />
              ))}
            </View>
            <Text style={styles.vitoriaTitulo}>Você achou todos os pares!</Text>

            <View style={styles.statsRow}>
              <Stat label="Tempo" valor={formatTime(resultado?.elapsedMs)} />
              <Stat label="Erros" valor={String(resultado?.erros ?? 0)} />
              <Stat label="Pares" valor={String(dif.pairs)} />
            </View>

            {resultado?.isBest && (
              <View style={styles.faixaBoa}>
                <FaithIcon name="trophies" size={16} color="#0E5A3C" />
                <Text style={styles.faixaBoaText}>Novo melhor tempo no {dif.label}!</Text>
              </View>
            )}
            {resultado?.starAwarded ? (
              <View style={styles.faixaBoa}>
                <FaithIcon name="star" size={16} color="#0E5A3C" />
                <Text style={styles.faixaBoaText}>Você ganhou 1 estrelinha!</Text>
              </View>
            ) : (
              <View style={styles.faixaSuave}>
                <Text style={styles.faixaSuaveText}>
                  Você já ganhou as {BRINCAR_DAILY_STAR_CAP} estrelinhas de hoje. Amanhã tem mais!
                </Text>
              </View>
            )}
          </View>

          <SoundButton style={styles.btnPrimario} onPress={() => setFase('entrada')} activeOpacity={0.9}>
            <Text style={styles.btnPrimarioText}>Jogar de novo</Text>
          </SoundButton>
          <SoundButton
            style={styles.btnSecundario}
            onPress={() => navigation.navigate(ROUTES.HOME, { screen: ROUTES.ACTIVITIES })}
            activeOpacity={0.9}
          >
            <Text style={styles.btnSecundarioText}>Voltar para Brincar</Text>
          </SoundButton>
        </ScrollView>
      </View>
    );
  }

  /* ══════════════ JOGANDO ══════════════ */
  return (
    <View style={styles.root}>
      <Header insets={insets} onBack={() => setFase('entrada')} titulo="Pares do Beni" />
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <FaithIcon name="play" size={14} color={pt.textSoft} />
          <Text style={styles.hudText}>{formatTime(decorrido)}</Text>
        </View>
        <View style={styles.hudItem}>
          <FaithIcon name="pares" size={14} color={pt.textSoft} />
          <Text style={styles.hudText}>{paresFeitos} de {dif.pairs}</Text>
        </View>
        {recorde && (
          <View style={styles.hudItem}>
            <FaithIcon name="trophies" size={14} color={pt.textSoft} />
            <Text style={styles.hudText}>{formatTime(recorde)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.dica}>{dica}</Text>

      <ScrollView contentContainerStyle={[styles.grade, { paddingBottom: insets.bottom + 24 }]}>
        {deck.map((c, i) => (
          <Carta
            key={c.key}
            carta={c}
            aberta={abertas.includes(i)}
            casada={casadas.includes(c.key)}
            size={cardSize}
            onPress={() => tocarCarta(i)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Header({ insets, onBack, titulo }) {
  return (
    <LinearGradient
      colors={['#F0E8FF', '#E0D4FF', '#D0EAFF']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: Math.max(insets.top, 28) }]}
    >
      <SoundButton style={styles.backPill} onPress={onBack} activeOpacity={0.85} accessibilityLabel="Voltar">
        <FaithIcon name="back" size={16} color="#6E3FB5" />
        <Text style={styles.backPillText}>Voltar</Text>
      </SoundButton>
      <Text style={styles.headerTitle}>{titulo}</Text>
    </LinearGradient>
  );
}

function Stat({ label, valor }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pt.background },

  header: { paddingHorizontal: 18, paddingBottom: 14 },
  backPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)',
  },
  backPillText: { fontFamily: 'FredokaOne', fontSize: 13, color: '#6E3FB5' },
  headerTitle: { fontFamily: 'FredokaOne', fontSize: 24, color: pt.text },

  painel: {
    marginTop: 12, marginHorizontal: 16, backgroundColor: '#FBF7FF',
    borderRadius: radii.xl, borderWidth: 1.5, borderColor: '#E5D9F7',
    padding: 12, ...shadows.card,
  },
  explica: { fontFamily: 'Nunito', fontSize: 13, color: pt.textSoft, lineHeight: 19, marginTop: 8 },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, marginHorizontal: 16,
    backgroundColor: '#FFF', borderRadius: radii.pill,
    paddingHorizontal: 12, paddingVertical: 9, ...shadows.soft,
  },
  pillText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: pt.text, fontWeight: '700' },

  secao: { fontFamily: 'FredokaOne', fontSize: 16, color: pt.text, marginTop: 18, marginHorizontal: 18, marginBottom: 8 },
  difCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 8, padding: 12,
    backgroundColor: '#FFF', borderRadius: radii.lg,
    borderWidth: 1.5, borderColor: '#EDE7F6', ...shadows.soft,
  },
  difCardAtivo: { borderColor: pt.purple },
  difCardBloqueado: { opacity: 0.72, backgroundColor: '#F7F5F2' },
  difIconBg: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#EDE4FF',
    alignItems: 'center', justifyContent: 'center',
  },
  difTitulo: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },
  difDesc: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, marginTop: 1 },

  btnPrimario: {
    marginTop: 16, marginHorizontal: 16, backgroundColor: pt.purple,
    borderRadius: radii.lg, paddingVertical: 15, alignItems: 'center', ...shadows.card,
  },
  btnPrimarioText: { fontFamily: 'FredokaOne', fontSize: 17, color: '#FFF' },
  btnSecundario: {
    marginTop: 10, marginHorizontal: 16, backgroundColor: '#FFF',
    borderRadius: radii.lg, paddingVertical: 13, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E3DDD4',
  },
  btnSecundarioText: { fontFamily: 'FredokaOne', fontSize: 15, color: pt.text },

  convite: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, marginHorizontal: 16, backgroundColor: pt.goldSoft,
    borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: pt.gold + '66',
  },
  conviteText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, color: '#7A5800', fontWeight: '700', lineHeight: 17 },

  hud: {
    flexDirection: 'row', justifyContent: 'center', gap: 18,
    paddingVertical: 10, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EFEAE3',
  },
  hudItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hudText: { fontFamily: 'Nunito', fontSize: 13, fontWeight: '800', color: pt.text },

  dica: {
    fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft,
    textAlign: 'center', marginTop: 10, marginHorizontal: 24, lineHeight: 17,
  },

  grade: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 8, paddingHorizontal: 16, paddingTop: 12,
  },
  carta: {
    borderRadius: radii.md, overflow: 'hidden', backgroundColor: '#FFF',
    borderWidth: 2, borderColor: '#E5D9F7', ...shadows.soft,
  },
  cartaCasada: { borderColor: '#0E9F6E' },
  cartaImg: { width: '100%', height: '100%' },
  cartaSemImg: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3EFE9' },
  cartaVerso: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED' },
  cartaCheck: {
    position: 'absolute', right: 4, bottom: 4,
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#0E9F6E',
    alignItems: 'center', justifyContent: 'center',
  },

  vitoriaCard: {
    marginTop: 14, marginHorizontal: 16, backgroundColor: '#FFF',
    borderRadius: radii.xl, padding: 16, alignItems: 'center', ...shadows.card,
  },
  scoreRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  vitoriaTitulo: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text, marginBottom: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 22, marginBottom: 6 },
  stat: { alignItems: 'center' },
  statValor: { fontFamily: 'FredokaOne', fontSize: 18, color: pt.text },
  statLabel: { fontFamily: 'Nunito', fontSize: 11, color: pt.textSoft },

  faixaBoa: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch',
    marginTop: 10, backgroundColor: '#DDF3E7', borderRadius: radii.md,
    paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaBoaText: { flex: 1, fontFamily: 'Nunito', fontSize: 12, fontWeight: '800', color: '#0E5A3C' },
  faixaSuave: {
    alignSelf: 'stretch', marginTop: 10, backgroundColor: '#F3EFE9',
    borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 9,
  },
  faixaSuaveText: { fontFamily: 'Nunito', fontSize: 12, color: pt.textSoft, fontWeight: '700', lineHeight: 17 },
});
