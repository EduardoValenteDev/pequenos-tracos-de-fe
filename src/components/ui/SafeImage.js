/**
 * SafeImage — <Image> com estados seguros de carregamento, erro e fallback.
 *
 * Princípio: a IMAGEM fica SEMPRE por cima; loading e fallback são camadas
 * ATRÁS. Assim, quando a imagem carrega, ela cobre tudo e o SafeImage é
 * visualmente transparente — preserva exatamente o visual do <Image> anterior
 * (mesmo source, mesmo resizeMode, mesmas dimensões do contêiner). O fallback
 * só aparece em erro real de carregamento (ou quando não há source); o loading
 * nunca fica por cima depois que a imagem aparece.
 *
 * Não força aspectRatio, não sobrescreve borderRadius/dimensões e não impõe cor
 * de fundo (o contêiner do chamador continua mandando).
 *
 * [P3J-R] Recuperação limitada: quando o carregamento falha, `useImageRecovery`
 * concede um número finito de novas tentativas (e uma renovação ao voltar para o
 * primeiro plano). O `key` da imagem só muda quando uma tentativa é concedida —
 * imagem carregada nunca remonta, portanto capas já visíveis não piscam.
 *
 * `source`: require local (number) ou { uri }.
 */
import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, fontSize, fontWeight } from '../../theme/tokens';
import { useImageRecovery } from '../../hooks/useImageRecovery';
import FaithIcon from './FaithIcon';
import EstadoCarregando from './EstadoCarregando';

// [F6.3A] Este arquivo é a fonte canônica de ERRO e de LOADING de imagem no app — as
// duas categorias que o contrato visual da v6 exige e que não tinham dono. Ambas param
// de inventar cor: papel no fundo, tinta no texto e o ícone do set próprio no lugar do
// emoji de sistema (Lei 3: "zero emoji de sistema como ícone de interface").
const DEFAULT_FALLBACK = [color.paper200, color.paper300];

function isUsableSource(source) {
  if (source == null) return false;
  if (typeof source === 'number') return true; // require() do Metro
  if (typeof source === 'object') return !!source.uri || Object.keys(source).length > 0;
  return false;
}
function sourceKey(source) {
  if (source == null) return null;
  if (typeof source === 'number') return source;
  if (typeof source === 'object') return source.uri ?? JSON.stringify(source);
  return null;
}

export default function SafeImage({
  source,
  style,
  resizeMode = 'cover',
  fallbackIcon = null,
  fallbackLabel,
  fallbackColors = DEFAULT_FALLBACK,
  loadingLabel,
  onStatusChange,
  imageProps,
  renderFallback,
  fill = false,
}) {
  const hasSource = isUsableSource(source);
  const key = sourceKey(source);
  const [status, setStatus] = useState(hasSource ? 'loading' : 'empty');

  // Reinicia o estado quando o source muda (evita ficar preso em erro/loading
  // ao reaproveitar o componente para outra história/imagem).
  useEffect(() => {
    setStatus(hasSource ? 'loading' : 'empty');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function update(next) {
    setStatus(next);
    if (onStatusChange) onStatusChange(next);
  }

  // Tentativas limitadas APÓS falha real. Enquanto não há erro, `token` é constante — nenhuma
  // imagem saudável é remontada por causa deste hook.
  const recovery = useImageRecovery({ sourceKey: key, failed: status === 'error' });

  // Fallback SÓ em erro real ou ausência de source (nunca preventivo).
  const showFallback = status === 'empty' || status === 'error';
  const showLoading = status === 'loading';

  return (
    // `fill`: preenche o contêiner via absoluteFill (NÃO depende de height:'100%'
    // resolver contra um pai dimensionado só por aspectRatio — bug das capas).
    <View style={[fill ? styles.wrapFill : styles.wrap, style]}>
      {/* ── Camadas ATRÁS da imagem ── */}
      {showFallback && (
        renderFallback ? (
          renderFallback()
        ) : (
          <LinearGradient colors={fallbackColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
            {/* Sem `fallbackIcon`, o ícone é o do set próprio. Um chamador que ainda passe
                string (emoji legado) continua desenhando — a migração dele é do bloco dele,
                não uma quebra silenciosa aqui. */}
            {fallbackIcon == null
              ? <FaithIcon name="gallery" size={34} color={color.ink400} />
              : (typeof fallbackIcon === 'string'
                ? <Text style={styles.icon}>{fallbackIcon}</Text>
                : fallbackIcon)}
            {fallbackLabel ? <Text style={styles.label} numberOfLines={2}>{fallbackLabel}</Text> : null}
          </LinearGradient>
        )
      )}
      {showLoading && (
        <View style={[styles.fill, styles.loading]} pointerEvents="none">
          <EstadoCarregando tamanho="small" rotulo={loadingLabel} />
        </View>
      )}

      {/* ── Imagem POR CIMA — mesmo visual de antes (cover/contain) ── */}
      {hasSource && (
        <Image
          key={recovery.token}
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onLoad={() => update('loaded')}
          onError={() => update('error')}
          {...(imageProps || {})}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Sem cor de fundo imposta: o contêiner do chamador continua mandando.
  wrap: { overflow: 'hidden', position: 'relative' },
  // Preenche o pai (que já tem tamanho via aspectRatio) sem usar %-height.
  wrapFill: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  fill: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  icon: { fontSize: 34, opacity: 0.55 },   // só o caminho legado (emoji vindo do chamador)
  label: {
    fontFamily: font.body, fontWeight: fontWeight.uiLabel, fontSize: fontSize.caption,
    color: color.ink600, textAlign: 'center', marginTop: 4,
  },
  loading: { backgroundColor: color.paper100 },
});
