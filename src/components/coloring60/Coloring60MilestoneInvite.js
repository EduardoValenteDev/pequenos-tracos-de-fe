/**
 * Coloring60MilestoneInvite.js — CONVITE do Beni por MARCO NARRATIVO (Colorir 60 · Parte B).
 *
 * O QUE É (decisão do fundador Q2 = "Modal do Beni, com pular"). Quando a criança CONCLUI uma
 * cena-marco de "A Criação" (cena 2/7/9), ESTE modal é a experiência pós-cena — ÚNICO, no LUGAR da
 * celebração genérica (nunca os dois juntos; quem decide é `derivePostSceneExperience` na
 * NarrationScreen). Ele celebra a descoberta em uma frase e o Beni CONVIDA — nunca obriga — a colorir
 * a parte que ela acabou de viver:
 *   - "Colorir agora"          → abre o editor daquele marco (consumindo a narração da cena).
 *   - "Continuar a história"   → segue a história direto para a próxima cena.
 * O convite é SEMPRE opcional: a criança também chega ao Colorir pela jornada da StoryDetail. Pular
 * aqui não perde nada — só adia.
 *
 * COMO É HONESTO E SIMPLES:
 *   - Os TEXTOS (título, corpo, rótulos dos dois botões) vêm do CATÁLOGO de marcos
 *     (`getColoring60MilestoneInviteCopy`), a mesma fonte única do mapa cena→atividade. O componente
 *     não inventa texto; sem copy para a atividade (não deveria ocorrer num marco) ⇒ não renderiza
 *     (o chamador só o exibe quando há marco, e todo marco tem copy — coberto por prova do smoke).
 *   - SEM emoji no corpo: quem carrega a emoção é o AVATAR do Beni (variante `happy`, sem selo). A
 *     mensagem amarra a fala ao que a criança acabou de ver na cena.
 *   - Não decide navegação nem storage: recebe `onAccept`/`onSkip` e os dispara. Toda a mecânica de
 *     "abrir editor por marco" e "retomar história" vive no contrato central (coloring60Navigation),
 *     acionado pela NarrationScreen.
 *   - `Modal` do RN (transparente, fade), como as demais camadas de celebração do fluxo. O recuo por
 *     hardware (Android) cai em `onSkip` (pular = continuar a história) — nunca um beco sem saída.
 */
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import SoundButton from '../SoundButton';
import { BeniAvatar } from '../beni';
import { getColoring60MilestoneInviteCopy } from '../../data/coloring60StoryMilestones';
import { colors, radii, spacing, shadows } from '../../theme/productTheme';

export default function Coloring60MilestoneInvite({ visible, activityId, onAccept, onSkip }) {
  const copy = getColoring60MilestoneInviteCopy(activityId);
  // Sem copy ⇒ nada a convidar: não renderiza. (Um marco SEMPRE tem copy — invariante do catálogo.)
  if (!copy) return null;

  return (
    <Modal visible={visible === true} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <BeniAvatar variant="happy" size="large" />
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{copy.body}</Text>

          {/* Ação principal (laranja Beni) — "Colorir agora". */}
          <SoundButton style={styles.acceptBtn} accessibilityLabel={copy.accept} onPress={onAccept}>
            <Text style={styles.acceptText}>{copy.accept}</Text>
          </SoundButton>

          {/* Pular (discreto, silencioso) — "Continuar a história": segue a história. */}
          <SoundButton style={styles.skipBtn} accessibilityLabel={copy.skip} onPress={onSkip} silent>
            <Text style={styles.skipText}>{copy.skip}</Text>
          </SoundButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    color: colors.beniDeep,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  body: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  acceptBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.beni,
    borderRadius: radii.pill,
    paddingVertical: 15,
    alignItems: 'center',
    ...shadows.soft,
  },
  acceptText: {
    fontFamily: 'FredokaOne',
    fontSize: 17,
    color: '#FFFFFF',
  },
  skipBtn: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: colors.textSoft,
    fontWeight: '700',
  },
});
