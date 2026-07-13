/**
 * BeniStageCharacter — o Beni como PERSONAGEM do palco de "Palavrinhas do Beni" (PERF1).
 *
 * Renderização DETERMINÍSTICA, CANÔNICA e sem moldura vazia:
 *   • primitiva `Image` do react-native (via Animated.Image — NUNCA expo-image; sem misturar APIs);
 *   • `source` = require ESTÁTICO de beniImages.js (sem uri/Asset/resolveAssetSource);
 *   • **dimensões internas da Image SEMPRE = `BENI_CANON`** (mesma chave de cache nativo do warmer):
 *     o tamanho visual externo (72/120/128/140/158/202) é aplicado por um CONTÊiner escalado
 *     (`transform: scale(size/BENI_CANON)`), NUNCA alterando a largura/altura pedidas à Image nativa.
 *     Assim há UMA decodificação por pose, reusada por retrato e overlays (`ready` = visível pronto);
 *   • **`resizeMode="cover"`** (artes OPACAS full-bleed 4:5 ou 1:1) + presets por pose (overscan +
 *     translateXf/translateYf, em frações de `BENI_CANON`) para posicionar o rosto sem cortar;
 *   • `transicao="instantanea"` (portrait da PARTIDA): troca SEMPRE instantânea — nova palavra = novo
 *     Beni no mesmo frame, 1 só Image ativa, SEM crossfade/fade/scale (a pose já é readyCanon);
 *   • `transicao="suave"` (padrão, contextos independentes da palavra: Super/Baú/entrada/resultado):
 *     **crossfade só entre poses JÁ prontas** (não inicia decode, não espera onLoadEnd); do contrário,
 *     TROCA INSTANTÂNEA correta. Movimento reduzido = instantâneo. Erro → última pose válida.
 *
 * Contêiner PERMANENTE (sem `key` de pose). Callbacks protegidos.
 * Props: pose · lado · size · presentation · reduzMovim · jump · onPronta(pose) · transicao.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Image, View, Text, Easing } from 'react-native';
// P4.3: overlays do Palavrinhas usam o mapa OTIMIZADO exclusivo (não os originais full-res).
import { BENI_PALAVRINHAS_IMAGES as BENI_IMAGES, BENI_PALAVRINHAS_DEFAULT as BENI_DEFAULT_VARIANT } from '../../assets/mascot/beniPalavrinhasImages';
import { posePortraitSegura, presetDe } from '../../services/palavrinhasVisualDirector';
import { readyCanon, marcarProntaCanon, assinar, BENI_CANON } from '../../services/beniAssetWarmup';
import FaithIcon from '../ui/FaithIcon';

const DUR = 260;          // crossfade dentro de 220–300 ms

const poseValida = (p) => (p && BENI_IMAGES[p] ? p : null);
const fonte = (p) => BENI_IMAGES[p] || BENI_IMAGES[BENI_DEFAULT_VARIANT];   // require estático; nunca inválido
const jaPronta = (p) => readyCanon(p);                                      // UMA verdade canônica (não por tamanho)

export default function BeniStageCharacter({
  pose = 'avatarBase', lado = 'esquerda', size = 96, presentation = 'portrait', reduzMovim = false, jump, onPronta,
  transicao = 'suave',   // 'instantanea' = troca portrait da PARTIDA (nova palavra = novo Beni imediato, 1 só Image)
}) {
  const instantaneo = transicao === 'instantanea';
  const posePedida = presentation === 'portrait' ? posePortraitSegura(pose) : pose;
  const inicial = poseValida(posePedida) || BENI_DEFAULT_VARIANT;
  const [atual, setAtual] = useState(inicial);
  const [anterior, setAnterior] = useState(null);
  const opAtual = useRef(new Animated.Value(1)).current;   // 1ª montagem VISÍVEL
  const opAnt = useRef(new Animated.Value(0)).current;
  const scAtual = useRef(new Animated.Value(1)).current;
  const aguardando = useRef(null);                          // pose cujo onLoadEnd tira o placeholder (startup)
  const ultimoValido = useRef(inicial);
  const atualRef = useRef(inicial);
  const montado = useRef(true);
  const isEvent = presentation === 'event';
  const [prontaAtual, setProntaAtual] = useState(jaPronta(inicial));

  useEffect(() => {
    montado.current = true;
    const off = assinar(() => {
      if (!montado.current) return;
      if (aguardando.current && jaPronta(aguardando.current)) aguardando.current = null;
      setProntaAtual(jaPronta(atualRef.current));   // some com o placeholder quando decodifica
    });
    return () => { montado.current = false; off && off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rodarFade = () => {
    // Crossfade curto e SUAVE (easing inOut) — a atual só some enquanto a próxima (JÁ pronta) entra.
    opAtual.setValue(0); scAtual.setValue(0.94); opAnt.setValue(1);
    const ease = Easing.inOut(Easing.quad);
    Animated.parallel([
      Animated.timing(opAtual, { toValue: 1, duration: DUR, easing: ease, useNativeDriver: true }),
      Animated.timing(scAtual, { toValue: 1, duration: DUR, easing: ease, useNativeDriver: true }),
      Animated.timing(opAnt, { toValue: 0, duration: DUR, easing: ease, useNativeDriver: true }),
    ]).start(() => { if (montado.current) { setAnterior(null); opAtual.setValue(1); } });
  };

  const trocaInstantanea = (nova) => {
    // Nova pose entra JÁ; NUNCA mantém a pose antiga sobre a palavra nova (mov. reduzido ou startup).
    setAnterior(null); opAnt.setValue(0);
    setAtual(nova); atualRef.current = nova; ultimoValido.current = nova;
    const pronta = jaPronta(nova);
    setProntaAtual(pronta); opAtual.setValue(1); scAtual.setValue(1);
    aguardando.current = pronta ? null : nova;   // se ainda decodificando, o placeholder some no onLoadEnd
  };

  const aplicar = (nova) => {
    // NUNCA transiciona para a MESMA pose/source (evita piscar a moldura)
    if (!montado.current || nova === atualRef.current || fonte(nova) === fonte(atualRef.current)) return;
    // Portrait da PARTIDA: troca SEMPRE instantânea — remove a pose anterior e mostra a nova no mesmo
    // frame (nova palavra = novo Beni imediato); sem crossfade, sem fade, sem scale, 1 só Image ativa.
    if (instantaneo) { trocaInstantanea(nova); return; }
    // Demais contextos (Super/Baú/entrada/resultado): crossfade SÓ entre poses já canonicamente prontas.
    if (!reduzMovim && jaPronta(nova) && jaPronta(atualRef.current)) {
      setAnterior(atualRef.current); opAnt.setValue(1); opAtual.setValue(0);
      setAtual(nova); atualRef.current = nova; ultimoValido.current = nova;
      setProntaAtual(true); aguardando.current = null;
      rodarFade();
    } else {
      trocaInstantanea(nova);
    }
  };

  useEffect(() => {
    const nova = poseValida(posePedida);
    if (!nova || nova === atualRef.current) return;
    // Troca IMEDIATA e sincronizada com a palavra: a pose é estável por palavra (só muda entre
    // palavras), então não há flicker a conter; nenhum timeout arbitrário governa a sincronização.
    aplicar(nova);
  }, [posePedida]);   // eslint-disable-line react-hooks/exhaustive-deps

  const raio = isEvent ? Math.round(size * 0.24) : Math.round(size / 2);
  const molduraStyle = {
    width: size, height: size, borderRadius: raio, overflow: 'hidden', zIndex: 6,
    backgroundColor: isEvent ? '#FFF3DD' : '#FFF7EC',
    borderWidth: isEvent ? 3 : 2.5,
    borderColor: isEvent ? '#F3C97A' : '#EAD3A2',
  };
  const jumpTy = jump ? jump.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) : 0;
  const flip = lado === 'direita' ? -1 : 1;
  const fit = size / BENI_CANON;   // escala VISUAL do palco canônico (não altera a dimensão nativa da Image)

  // Image SEMPRE em BENI_CANON (chave de cache uniforme); presets em frações de BENI_CANON.
  const estilo = (poseNome) => {
    const pr = presetDe(poseNome, presentation);
    return {
      position: 'absolute', left: 0, top: 0, width: BENI_CANON, height: BENI_CANON,
      transform: [{ scaleX: flip }, { translateX: (pr.translateXf || 0) * BENI_CANON }, { translateY: (pr.translateYf || 0) * BENI_CANON }, { scale: (pr.scale || 1) * (pr.overscan || 1) }],
    };
  };

  const onLoadEndAtual = () => {
    marcarProntaCanon(atualRef.current);   // UMA verdade canônica (mesmo bitmap do warmer)
    if (montado.current) setProntaAtual(true);   // some com o placeholder
    if (onPronta) { try { onPronta(atualRef.current); } catch (_) { /* noop */ } }
  };
  const onErroAtual = (e) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) { try { console.warn('[BeniStageCharacter] onError pose=', atualRef.current, e && e.nativeEvent); } catch (_) { /* noop */ } }
    if (!montado.current) return;
    const alvo = (ultimoValido.current && ultimoValido.current !== atualRef.current) ? ultimoValido.current : BENI_DEFAULT_VARIANT;
    if (alvo !== atualRef.current) { setAtual(alvo); atualRef.current = alvo; opAtual.setValue(1); setAnterior(null); }
  };

  return (
    <Animated.View pointerEvents="none" style={[styles.moldura, molduraStyle, { transform: [{ translateY: jumpTy }] }]}>
      {/* Palco CANÔNICO (BENI_CANON) escalado para o tamanho visual — a Image nativa nunca muda de dimensão. */}
      <View style={{ width: BENI_CANON, height: BENI_CANON, transform: [{ scale: fit }] }}>
        {anterior ? (
          <Animated.Image source={fonte(anterior)} resizeMode="cover" fadeDuration={0} style={[estilo(anterior), { opacity: opAnt }]} />
        ) : null}
        <Animated.Image
          source={fonte(atual)}
          resizeMode="cover"
          fadeDuration={0}
          onLoadEnd={onLoadEndAtual}
          onError={onErroAtual}
          style={[estilo(atual), { opacity: opAtual, transform: [...estilo(atual).transform, { scale: scAtual }] }]}
        />
      </View>
      {/* Placeholder ENQUANTO a textura não decodificou: ícone existente (nunca moldura vazia) */}
      {!prontaAtual ? (
        <View style={[StyleSheet.absoluteFill, styles.prep]}>
          <FaithIcon name="palavrinhas" size={Math.round(size * 0.4)} color="#E0A21A" />
        </View>
      ) : null}
    </Animated.View>
  );
}

// Referência inequívoca de que a primitiva é a Image do react-native (não expo-image).
BeniStageCharacter.Image = Image;

const styles = StyleSheet.create({
  moldura: { alignItems: 'center', justifyContent: 'center' },
  prep: { alignItems: 'center', justifyContent: 'center' },
});
