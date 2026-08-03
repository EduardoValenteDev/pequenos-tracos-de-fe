/**
 * Coloring60SlotStateMark.js — A MARCA HONESTA de uma vaga que NÃO tem obra guardada para mostrar.
 *
 * O QUE ESTE COMPONENTE CORRIGE. A criança terminava as três partes e o app dizia, com razão,
 * "3 de 3". Mas a composição visual dizia outra coisa: no fecho, a parte recém-pintada aparecia
 * como obra (ainda estava na memória da sessão) e as outras duas viravam molduras vazias com um
 * ícone genérico de imagem ausente; na coleção, as três viravam quadros vazios com um texto cinza
 * minúsculo. Tudo isso é o vocabulário visual de MINIATURA QUEBRADA — a tela contradizia a própria
 * conquista. O que estava errado era a REPRESENTAÇÃO.
 *
 * O QUE MUDOU DEBAIXO DELE (S2 · Spec 019). A vaga sem pixels já foi a regra do plano Grátis; hoje
 * não é mais. Desde o S1 quem tem acesso à história guarda a sua pintura, então uma vaga sem obra
 * só pode vir de um PASSADO: uma conclusão gravada antes da política atual, ou uma escrita que
 * falhou fisicamente. O estado continua sendo o mesmo e continua sendo POSITIVO — muda apenas o
 * que ele diz à criança, porque a antiga promessa ("não fica guardada") deixou de ser verdade.
 *
 * O QUE ELE FAZ. Uma vaga sem obra recebe uma marca INTENCIONAL, igual em toda superfície que
 * representa coleção ou conjunto final:
 *   • um selo próprio do estado (nunca um ícone de "imagem que não carregou");
 *   • a frase do estado;
 *   • e, na conclusão sem pixels guardados, um CONVITE — pintar de novo passa a guardar a criação.
 * Nada aqui é esqueleto, nada finge carregamento, nada promete uma arte que não está no disco.
 *
 * O QUE ELE NÃO FAZ. Não lê storage, não conhece plano, não vende nada. A CLASSIFICAÇÃO da vaga
 * nasce no seletor puro compartilhado (`coloring60SlotKind`, em services/coloring60State); este
 * componente só desenha o resultado. Por isso o fecho e a coleção não podem divergir: eles não
 * decidem — obedecem.
 *
 * `ART` não passa por aqui: quando existe obra recuperável, quem aparece é a obra.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/productTheme';

/**
 * TEXTO OFICIAL de cada estado honesto — FONTE ÚNICA. A coleção, o fecho e a prévia ampliada dizem
 * a MESMA coisa sobre a MESMA vaga; três redações para um estado só voltariam a ser três verdades.
 *
 * `notPersisted` é o único com `note`, e o recado é deliberado. Ele deixou de ser um AVISO ("a
 * pintura não fica guardada depois de sair") e passou a ser um CONVITE, porque a regra mudou: hoje
 * pintar de novo GUARDA. A frase antiga prometia uma limitação que não existe mais e, mantida,
 * seria simplesmente mentira. A conquista continua vindo primeiro ("Parte concluída!"); o convite
 * vem depois, em voz baixa, sem explicar falha técnica, sem mencionar plano e sem culpar a criança
 * por um passado que não foi escolha dela.
 */
export const COLORING60_SLOT_STATE_COPY = Object.freeze({
  notPersisted: Object.freeze({
    title: 'Parte concluída!',
    note: 'Pinte de novo para guardar sua criação.',
  }),
  needsColor: Object.freeze({
    title: 'Precisa de cor de novo',
    note: null,
  }),
  empty: Object.freeze({
    title: 'Ainda falta colorir',
    note: null,
  }),
});

/**
 * SELO de cada estado. Os três são DIFERENTES entre si de propósito: conclusão sem pixels guardados,
 * quebra de integridade e parte ainda por fazer são situações distintas e precisam continuar
 * distinguíveis num relance. Nenhum deles é um ícone de mídia ausente.
 */
export const COLORING60_SLOT_STATE_ICON = Object.freeze({
  notPersisted: 'check-decagram', // selo de conquista — a parte FOI concluída
  needsColor: 'brush-variant',    // convite a colorir de novo
  empty: 'pencil-outline',        // ainda por fazer
});

/**
 * kind          — um dos estados honestos (`notPersisted` | `needsColor` | `empty`). `art` devolve
 *                 `null`: onde há obra, quem fala é a obra.
 * tint/tintDeep — cor temática da PRÓPRIA parte (Luz · Vida · Cuidado), para que a identidade
 *                 continue legível mesmo sem pintura.
 * compact       — variação para a miniatura do fecho (92×116). Mesmo conteúdo, medidas menores:
 *                 a informação de que a pintura não fica guardada permanece nas duas.
 */
export default function Coloring60SlotStateMark({ kind, tint, tintDeep, compact = false }) {
  const copy = COLORING60_SLOT_STATE_COPY[kind];
  if (!copy) return null;

  const iconColor = tint || colors.muted;
  const titleColor = tintDeep || colors.text;

  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : null]}>
      <MaterialCommunityIcons
        name={COLORING60_SLOT_STATE_ICON[kind]}
        size={compact ? 20 : 28}
        color={iconColor}
      />
      <Text
        style={[styles.title, compact ? styles.titleCompact : null, { color: titleColor }]}
        numberOfLines={2}
      >
        {copy.title}
      </Text>
      {copy.note ? (
        <Text
          style={[styles.note, compact ? styles.noteCompact : null]}
          numberOfLines={compact ? 3 : 2}
        >
          {copy.note}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  wrapCompact: { paddingHorizontal: 4 },
  title: { marginTop: 6, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  titleCompact: { marginTop: 4, fontSize: 11, lineHeight: 13 },
  note: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.textSoft,
    textAlign: 'center',
  },
  noteCompact: { marginTop: 2, fontSize: 9, lineHeight: 11 },
});
