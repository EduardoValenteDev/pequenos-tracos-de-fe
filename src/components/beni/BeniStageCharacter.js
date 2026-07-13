/**
 * BeniStageCharacter — o Beni como PERSONAGEM do palco de "Palavrinhas do Beni" (P4R7).
 *
 * Renderização DETERMINÍSTICA e sem moldura vazia:
 *   • primitiva `Image` do react-native (via Animated.Image — NUNCA expo-image; sem misturar APIs);
 *   • `source` = require ESTÁTICO de beniImages.js (sem uri/Asset/resolveAssetSource);
 *   • width/height NUMÉRICOS explícitos (evita 0×0 no Fabric);
 *   • **`resizeMode="cover"`** (as artes são OPACAS full-bleed 4:5 ou 1:1 — `contain` mostrava
 *     faixas do fundo da moldura; `cover` preenche o quadro e elimina bandas/cantos retos);
 *   • presets por pose (overscan + translateXf/translateYf) para posicionar o rosto;
 *   • **crossfade só depois do onLoad da PRÓXIMA imagem** — nunca reduz a opacidade da atual antes
 *     de a próxima estar carregada; se a próxima falhar, mantém a última válida (nunca só o fundo).
 *
 * Contêiner PERMANENTE (sem `key` de pose). Duas camadas de Image permanentes. Callbacks
 * protegidos por token. Props: pose · lado · size · presentation · reduzMovim · jump · onPronta(pose).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Image, View, Text } from 'react-native';
import { BENI_IMAGES, BENI_DEFAULT_VARIANT } from '../../assets/mascot/beniImages';
import { posePortraitSegura, presetDe } from '../../services/palavrinhasVisualDirector';
import { readyPortrait, readyEvent, marcarProntaPortrait, marcarProntaEvent, assinar } from '../../services/beniAssetWarmup';
import FaithIcon from '../ui/FaithIcon';

const DUR = 260;          // crossfade dentro de 220–300 ms
const DWELL_MIN = 800;    // permanência mínima de portrait

const poseValida = (p) => (p && BENI_IMAGES[p] ? p : null);
const fonte = (p) => BENI_IMAGES[p] || BENI_IMAGES[BENI_DEFAULT_VARIANT];   // require estático; nunca inválido

export default function BeniStageCharacter({
  pose = 'avatarBase', lado = 'esquerda', size = 96, presentation = 'portrait', reduzMovim = false, jump, onPronta,
}) {
  const posePedida = presentation === 'portrait' ? posePortraitSegura(pose) : pose;
  const inicial = poseValida(posePedida) || BENI_DEFAULT_VARIANT;
  const [atual, setAtual] = useState(inicial);
  const [anterior, setAnterior] = useState(null);
  const opAtual = useRef(new Animated.Value(1)).current;   // 1ª montagem VISÍVEL
  const opAnt = useRef(new Animated.Value(0)).current;
  const scAtual = useRef(new Animated.Value(1)).current;
  const aguardando = useRef(null);                          // pose cujo onLoadEnd estamos esperando p/ fade
  const ultimoValido = useRef(inicial);
  const ultimaTroca = useRef(0);
  const pendente = useRef(null);
  const timer = useRef(null);
  const atualRef = useRef(inicial);
  const montado = useRef(true);
  const isEvent = presentation === 'event';
  // "pronta" = DECODIFICADA no TAMANHO desta apresentação (readyPortrait vs readyEvent)
  const jaPronta = (p) => (isEvent ? readyEvent(p) : readyPortrait(p));
  const [prontaAtual, setProntaAtual] = useState(jaPronta(inicial));

  useEffect(() => {
    montado.current = true;
    const off = assinar(() => {
      if (!montado.current) return;
      if (aguardando.current && jaPronta(aguardando.current)) { aguardando.current = null; rodarFade(); }
      setProntaAtual(jaPronta(atualRef.current));   // some com o placeholder quando decodifica
    });
    return () => { montado.current = false; if (timer.current) clearTimeout(timer.current); off && off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rodarFade = () => {
    if (reduzMovim) { opAtual.setValue(1); opAnt.setValue(0); scAtual.setValue(1); if (montado.current) setAnterior(null); return; }
    opAtual.setValue(0); scAtual.setValue(0.94); opAnt.setValue(1);
    Animated.parallel([
      Animated.timing(opAtual, { toValue: 1, duration: DUR, useNativeDriver: true }),
      Animated.timing(scAtual, { toValue: 1, duration: DUR, useNativeDriver: true }),
      Animated.timing(opAnt, { toValue: 0, duration: DUR, useNativeDriver: true }),
    ]).start(() => { if (montado.current) { setAnterior(null); opAtual.setValue(1); } });
  };

  const aplicar = (nova) => {
    // NUNCA transiciona para a MESMA pose/source (evita piscar a moldura)
    if (!montado.current || nova === atualRef.current || fonte(nova) === fonte(atualRef.current)) return;
    setAnterior(atualRef.current);           // mantém a atual VISÍVEL (opAnt=1)
    opAnt.setValue(1); opAtual.setValue(0);
    setAtual(nova); atualRef.current = nova; ultimoValido.current = nova;
    setProntaAtual(jaPronta(nova));
    ultimaTroca.current = Date.now();
    aguardando.current = nova;
    if (jaPronta(nova)) { aguardando.current = null; rodarFade(); }   // já decodificada (cache) → fade imediato
    // senão: espera o onLoadEnd da nova imagem (nunca some a atual antes disso)
  };

  useEffect(() => {
    const nova = poseValida(posePedida);
    if (!nova || nova === atualRef.current) return;
    const desde = Date.now() - ultimaTroca.current;
    if (desde >= DWELL_MIN) aplicar(nova);
    else {
      pendente.current = nova;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { if (montado.current && pendente.current) { aplicar(pendente.current); pendente.current = null; } }, DWELL_MIN - desde);
    }
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

  const estilo = (poseNome) => {
    const pr = presetDe(poseNome, presentation);
    return {
      position: 'absolute', left: 0, top: 0, width: size, height: size,
      transform: [{ scaleX: flip }, { translateX: (pr.translateXf || 0) * size }, { translateY: (pr.translateYf || 0) * size }, { scale: (pr.scale || 1) * (pr.overscan || 1) }],
    };
  };

  const onLoadEndAtual = () => {
    if (isEvent) marcarProntaEvent(atualRef.current); else marcarProntaPortrait(atualRef.current);   // cache por TAMANHO
    if (montado.current) setProntaAtual(true);   // some com o placeholder
    if (onPronta) { try { onPronta(atualRef.current); } catch (_) { /* noop */ } }
    if (montado.current && aguardando.current === atualRef.current) { aguardando.current = null; rodarFade(); }
  };
  const onErroAtual = (e) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) { try { console.warn('[BeniStageCharacter] onError pose=', atualRef.current, e && e.nativeEvent); } catch (_) { /* noop */ } }
    if (!montado.current) return;
    const alvo = (ultimoValido.current && ultimoValido.current !== atualRef.current) ? ultimoValido.current : BENI_DEFAULT_VARIANT;
    if (alvo !== atualRef.current) { setAtual(alvo); atualRef.current = alvo; opAtual.setValue(1); setAnterior(null); }
  };

  return (
    <Animated.View pointerEvents="none" style={[styles.moldura, molduraStyle, { transform: [{ translateY: jumpTy }] }]}>
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
