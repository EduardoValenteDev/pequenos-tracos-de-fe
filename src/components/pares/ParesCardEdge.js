/**
 * ParesCardEdge.js — a LATERAL FÍSICA da carta (R2B · §2).
 *
 * O flip 2.5D esconde as duas faces perto de 90° e mostra ESTA camada no lugar. Sem ela,
 * a face rotacionada vira uma faixa comprimida da ilustração (o "vinco deformado" que
 * reprovou o R2A no aparelho). A lateral é uma tira estreita (3–4 pt) de fundo marfim com
 * linha dourada — a borda do baralho vista de perfil.
 *
 * Não roda com as faces (senão também sumiria a 90°): é um sliver centralizado, revelado
 * só por opacidade na janela ~82°–98°. Sem imagem, sem textura comprimida.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

const IVORY = '#FFF8EA';
const GOLD = '#E6B455';
const GOLD_DEEP = '#CE9A2E';

function ParesCardEdge({ height, width = 4, radius = 2 }) {
  const h = Math.max(1, Number(height) || 0) * 0.9;   // encolhe um tico: cantos arredondados
  const w = Math.max(3, Math.min(4, width));
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View
        style={[
          styles.edge,
          { width: w, height: h, borderRadius: radius },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  edge: {
    backgroundColor: IVORY,
    borderLeftWidth: 0.75,
    borderRightWidth: 0.75,
    borderColor: GOLD,
    // um fio dourado mais escuro no topo/base dá volume de "lombada".
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderTopColor: GOLD_DEEP,
    borderBottomColor: GOLD_DEEP,
  },
});

export default React.memo(ParesCardEdge);
