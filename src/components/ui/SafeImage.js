/**
 * SafeImage — <Image> com estados seguros de carregamento, erro e fallback.
 *
 * Garante que nenhuma superfície crítica mostre um retângulo vazio quando a
 * imagem está carregando, falha ou não existe. NÃO é redesign — é blindagem
 * visual. Aceita `source` como require local (number) ou { uri }.
 *
 * Props:
 *   source            — require/objeto/{uri}/null
 *   style             — estilo do CONTÊINER (define tamanho/proporção)
 *   resizeMode        — 'cover' (padrão) | 'contain' | ...
 *   fallbackIcon      — emoji/ícone do fallback (padrão '🖼️')
 *   fallbackLabel     — texto curto opcional no fallback
 *   fallbackColors    — [c1, c2] gradiente do fallback (padrão creme suave)
 *   loadingLabel      — texto opcional no estado de carregamento
 *   onStatusChange    — (status) => void  ('loading'|'loaded'|'error'|'empty')
 */
import React, { useState } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors as pt } from '../../theme/productTheme';

const DEFAULT_FALLBACK = ['#F3EEE6', '#E7DECF'];

export default function SafeImage({
  source,
  style,
  resizeMode = 'cover',
  fallbackIcon = '🖼️',
  fallbackLabel,
  fallbackColors = DEFAULT_FALLBACK,
  loadingLabel,
  onStatusChange,
  imageProps,
  renderFallback,
}) {
  const hasSource = source != null && (typeof source === 'number' || (typeof source === 'object' && (source.uri || Object.keys(source).length > 0)));
  const [status, setStatus] = useState(hasSource ? 'loading' : 'empty');

  function update(next) {
    setStatus(next);
    if (onStatusChange) onStatusChange(next);
  }

  const showFallback = !hasSource || status === 'error';
  const showLoading = hasSource && status === 'loading';

  return (
    <View style={[styles.wrap, style]}>
      {hasSource && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onLoad={() => update('loaded')}
          onError={() => update('error')}
          {...(imageProps || {})}
        />
      )}

      {showFallback && (
        renderFallback ? (
          <View style={styles.fill}>{renderFallback()}</View>
        ) : (
          <LinearGradient colors={fallbackColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
            <Text style={styles.icon}>{fallbackIcon}</Text>
            {fallbackLabel ? <Text style={styles.label} numberOfLines={2}>{fallbackLabel}</Text> : null}
          </LinearGradient>
        )
      )}

      {showLoading && (
        <View style={[styles.fill, styles.loading]} pointerEvents="none">
          <ActivityIndicator size="small" color={pt.muted} />
          {loadingLabel ? <Text style={styles.loadingLabel}>{loadingLabel}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#F3EEE6', position: 'relative' },
  fill: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  icon: { fontSize: 34, opacity: 0.55 },
  label: { fontFamily: 'FredokaOne', fontSize: 12, color: 'rgba(58,42,30,0.6)', textAlign: 'center', marginTop: 4 },
  loading: { backgroundColor: '#F3EEE6' },
  loadingLabel: { fontFamily: 'Nunito', fontSize: 11, color: pt.muted, fontWeight: '700', marginTop: 6 },
});
