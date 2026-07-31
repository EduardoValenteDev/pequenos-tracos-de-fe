/**
 * StorybookWorldPage — Momento 2: o livro aberto com DAVI E GOLIAS (O2.2 · §12).
 *
 * Spread de duas páginas. Página direita = capa oficial de "Davi e Golias" (david_goliath) com
 * título. Página esquerda = a promessa do app como SELOS IMPRESSOS (ouvir/colorir/brincar/guardar),
 * não botões nem barra de navegação. O Beni aparece como pequeno MEDALHÃO no canto — sem segunda
 * imagem grande. A Criação NÃO aparece aqui.
 *
 * [P3J-R.1] O selo de colorir deixou de ser promessa IMPRESSA. Ele é DERIVADO da mesma porta que o
 * resto do app usa para responder "existe colorir para abrir hoje?" — `isStoryColoringAvailable`
 * (portão do piloto ABERTO **e** catálogo com pelo menos uma atividade). Portão fechado ⇒ o selo
 * simplesmente não é impresso: a lista encolhe para três e nada mais muda. Era a PRIMEIRA promessa
 * que a criança recebia, e a única das três superfícies de texto que não consultava porta nenhuma.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StorybookBeni from './StorybookBeni';
import StorybookCover from './StorybookCover';
import FaithIcon from '../ui/FaithIcon';
import { OB } from '../../theme/onboardingVisualTokens';
import { COLORING60_STORY_ID } from '../../services/coloring60Pilot';
import { isStoryColoringAvailable } from '../../services/storyColoringAvailability';

// Ordem editorial ÚNICA dos selos. `requiresColoring` marca o que só pode ser prometido quando
// existe colorir de verdade — a ordem dos demais nunca muda por causa dele.
const STAMPS = [
  { key: 'ouvir', icon: 'play', label: 'Ouvir histórias', color: OB.scarf },
  { key: 'colorir', icon: 'atelier', label: 'Colorir', color: '#2E9E6B', requiresColoring: true },
  { key: 'brincar', icon: 'brincar', label: 'Brincar', color: '#B4708F' },
  { key: 'guardar', icon: 'heart', label: 'Guardar no coração', color: '#D9557A' },
];

/**
 * Selos que PODEM ser impressos, dada a disponibilidade real de colorir. Pura e síncrona: os dois
 * mundos (com e sem colorir) ficam exercitáveis sem flag, sem catálogo e sem React.
 */
export function visibleStamps(coloringAvailable) {
  return STAMPS.filter((s) => !s.requiresColoring || coloringAvailable === true);
}

function Stamp({ item }) {
  return (
    <View style={styles.stamp}>
      <View style={[styles.stampIcon, { backgroundColor: item.color + '18' }]}>
        <FaithIcon name={item.icon} size={16} color={item.color} />
      </View>
      <Text style={styles.stampLabel} numberOfLines={1}>{item.label}</Text>
    </View>
  );
}

export default function StorybookWorldPage({ width, height }) {
  const coverW = Math.min(width * 0.42, 158);
  const coverH = Math.round(coverW * 1.2);
  // Leitura em render: a porta é pura e síncrona (portão + catálogo em memória), sem I/O nem storage.
  const stamps = visibleStamps(isStoryColoringAvailable(COLORING60_STORY_ID));
  return (
    <View style={styles.spread}>
      {/* Página esquerda — promessa como anotações do livro, ligadas por uma linha */}
      <View style={styles.left}>
        <Text style={styles.lead}>Aqui, cada história vira uma aventura.</Text>
        <View style={styles.stamps}>
          <View style={styles.stampLine} pointerEvents="none" />
          {stamps.map((s) => <Stamp key={s.key} item={s} />)}
        </View>
      </View>

      {/* Página direita — capa de Davi e Golias (com fallback real) */}
      <View style={styles.right}>
        <StorybookCover storyId="david_goliath" title="Davi e Golias" width={coverW} height={coverH} />
        <Text style={styles.coverTitle}>Davi e Golias</Text>
      </View>

      {/* Medalhão do Beni no canto (sem segunda imagem grande) */}
      <StorybookBeni pose="apontandoDireita" mode="medallion" width={44} style={styles.medallion} />
    </View>
  );
}

const styles = StyleSheet.create({
  spread: { flex: 1, flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 8 },
  left: { flex: 1, paddingRight: 8, justifyContent: 'center', gap: 8 },
  right: { flex: 1, paddingLeft: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  lead: { fontFamily: 'FredokaOne', fontSize: 15, color: OB.title, lineHeight: 20, marginBottom: 2 },
  stamps: { gap: 9, paddingLeft: 10 },
  stampLine: { position: 'absolute', left: 3, top: 6, bottom: 6, width: 2, borderRadius: 1, backgroundColor: OB.goldFaint },
  stamp: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stampIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stampLabel: { fontFamily: 'Nunito', fontSize: 12.5, fontWeight: '700', color: OB.text, flexShrink: 1 },
  coverTitle: { fontFamily: 'FredokaOne', fontSize: 14, color: OB.title, textAlign: 'center' },
  medallion: { position: 'absolute', right: 2, top: 2 },
});
