/**
 * ParesCreatorDiagnostics.js — Painel de diagnóstico do CRIADOR (R2A · §10).
 *
 * Recolhível, ancorado num canto, NUNCA visível em produção: renderiza `null` se
 * `isInternalToolsEnabled()` for falso. Puramente apresentacional — recebe o retrato do
 * jogo (`info`), o estado dos overrides e um `onAction(id)`; quem mexe no jogo é a tela.
 *
 * Mostra: carta focada (id/estado), imagem pronta + dimensões, progresso de rotação,
 * cartas abertas/casadas, trava de entrada, e a geometria da grade (largura/altura da
 * grade e da carta, gaps). Ações: testar giro, retorno, acerto, imagem lenta, imagem
 * ausente, movimento reduzido e reiniciar a rodada.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { isInternalToolsEnabled } from '../../config/internalTools';

const ACOES = [
  { id: 'giro', label: 'Testar giro' },
  { id: 'retorno', label: 'Testar retorno' },
  { id: 'acerto', label: 'Testar acerto' },
  { id: 'imagem_lenta', label: 'Imagem lenta' },
  { id: 'imagem_ausente', label: 'Imagem ausente' },
  { id: 'movimento_reduzido', label: 'Mov. reduzido' },
  // R2C §5/§6 — validar sequência/Fogo e a contemplação final.
  { id: 'simular_2x', label: 'Sequência 2×' },
  { id: 'simular_3x', label: 'Sequência 3×' },
  { id: 'simular_4x', label: 'Sequência 4× (Fogo)' },
  { id: 'simular_ultimo_par', label: 'Último par' },
  { id: 'simular_contemplacao', label: 'Contemplação' },
  { id: 'reiniciar', label: 'Reiniciar rodada' },
];

/** Overrides que são liga/desliga — o botão fica realçado quando ativo. */
const TOGGLES = new Set(['imagem_ausente', 'movimento_reduzido']);

function Linha({ label, valor }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.lLabel}>{label}</Text>
      <Text style={styles.lValor} numberOfLines={1}>{String(valor)}</Text>
    </View>
  );
}

function ParesCreatorDiagnostics({ info = {}, overrides = {}, onAction }) {
  const [aberto, setAberto] = useState(false);
  if (!isInternalToolsEnabled()) return null;

  const g = info.grade || {};
  const c = info.carta || {};
  const s = info.streak || {};

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      {!aberto ? (
        <Pressable style={styles.chip} onPress={() => setAberto(true)} accessibilityLabel="Abrir diagnóstico do criador">
          <Text style={styles.chipText}>Criador</Text>
        </Pressable>
      ) : (
        <View style={styles.painel}>
          <View style={styles.topo}>
            <Text style={styles.titulo}>Diagnóstico · Pares</Text>
            <Pressable onPress={() => setAberto(false)} hitSlop={8} accessibilityLabel="Fechar diagnóstico">
              <Text style={styles.fechar}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.corpo} showsVerticalScrollIndicator={false}>
            <Linha label="fase (inputLocked)" valor={`${info.fase ?? '—'} (${info.inputLocked ? 'sim' : 'não'})`} />
            <Linha label="abertas" valor={JSON.stringify(info.openCardIds ?? [])} />
            <Linha label="casadas" valor={`${(info.matchedCardIds ?? []).length} chaves`} />
            <Linha label="carta id / estado" valor={`${c.cardId ?? '—'} / ${c.flipState ?? '—'}`} />
            <Linha label="imageReady" valor={info.imageReady ? 'sim' : 'não'} />
            <Linha label="imageDimensions" valor={c.imageDimensions ?? '—'} />
            <Linha label="rotationProgress" valor={c.rotationProgress ?? '—'} />
            <Linha label="grade (larg×alt)" valor={`${g.gridWidth ?? '—'}×${g.gridHeight ?? '—'}`} />
            <Linha label="carta (larg×alt)" valor={`${g.cardWidth ?? '—'}×${g.cardHeight ?? '—'}`} />
            <Linha label="layoutGap (x/y)" valor={`${g.layoutGapX ?? '—'}/${g.layoutGapY ?? '—'}`} />
            <Linha label="opticalGap (x/y)" valor={`${g.opticalGapX ?? '—'}/${g.opticalGapY ?? '—'}`} />
            <Linha label="shadowBleed" valor={g.shadowBleed ?? '—'} />
            <Linha label="colunas × linhas" valor={`${g.columns ?? '—'}×${g.rows ?? '—'}`} />
            <Linha label="streak (cur/best/lvl)" valor={`${s.current ?? 0}/${s.best ?? 0}/${s.level ?? 0}${s.fogo ? ' FOGO' : ''}`} />
          </ScrollView>

          <View style={styles.acoes}>
            {ACOES.map((a) => {
              const ativo = TOGGLES.has(a.id) && !!overrides[a.id === 'movimento_reduzido' ? 'reduceMotion' : 'missingImage'];
              return (
                <Pressable
                  key={a.id}
                  style={[styles.btn, ativo && styles.btnAtivo]}
                  onPress={() => onAction && onAction(a.id)}
                  accessibilityLabel={a.label}
                >
                  <Text style={[styles.btnText, ativo && styles.btnTextAtivo]}>{a.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 8, bottom: 8, zIndex: 50 },
  chip: {
    backgroundColor: 'rgba(43,91,161,0.92)', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { color: '#FFF', fontFamily: 'Nunito', fontWeight: '800', fontSize: 11 },
  painel: {
    width: 244, maxHeight: 340, backgroundColor: 'rgba(20,22,30,0.94)',
    borderRadius: 14, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  titulo: { color: '#FFF', fontFamily: 'Nunito', fontWeight: '800', fontSize: 12 },
  fechar: { color: '#FFF', fontSize: 20, lineHeight: 20, paddingHorizontal: 4 },
  corpo: { maxHeight: 150, marginBottom: 8 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 2 },
  lLabel: { color: '#9FB6D8', fontFamily: 'Nunito', fontSize: 10, flexShrink: 0 },
  lValor: { color: '#EAF1FB', fontFamily: 'Nunito', fontWeight: '700', fontSize: 10, flex: 1, textAlign: 'right' },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  btn: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  btnAtivo: { backgroundColor: '#E6B455', borderColor: '#E6B455' },
  btnText: { color: '#EAF1FB', fontFamily: 'Nunito', fontWeight: '700', fontSize: 10 },
  btnTextAtivo: { color: '#20160A' },
});

export default ParesCreatorDiagnostics;
