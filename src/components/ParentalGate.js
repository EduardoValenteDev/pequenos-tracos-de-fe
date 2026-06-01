import React, { useState, useCallback } from 'react';
import {
  Modal, View, Text, TextInput, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors as pt, radii, shadows } from '../theme/productTheme';
import { colors } from '../theme/colors';

function generateChallenge() {
  const a = Math.floor(Math.random() * 7) + 6;
  const b = Math.floor(Math.random() * 9) + 4;
  return { a, b, answer: a * b };
}

/**
 * ParentalGate — math-challenge modal required before any external link.
 *
 * Props:
 *   visible: bool
 *   onPass: () => void  — called when correct answer entered
 *   onCancel: () => void
 */
export default function ParentalGate({ visible, onPass, onCancel }) {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [input, setInput] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [showError, setShowError] = useState(false);

  const reset = useCallback(() => {
    setChallenge(generateChallenge());
    setInput('');
    setShakeError(false);
    setShowError(false);
  }, []);

  function handleConfirm() {
    if (parseInt(input, 10) === challenge.answer) {
      reset();
      onPass();
    } else {
      setShakeError(true);
      setShowError(true);
      setInput('');
      setTimeout(() => {
        setShakeError(false);
        setChallenge(generateChallenge());
        setShowError(false);
      }, 1200);
    }
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.box, shakeError && styles.boxError]}>
          <Text style={styles.title}>Área dos Pais</Text>
          <Text style={styles.subtitle}>
            Peça para um responsável resolver este desafio para continuar.
          </Text>
          <Text style={styles.equation}>
            {challenge.a} × {challenge.b} = ?
          </Text>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="Resposta"
            placeholderTextColor={pt.muted}
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
            autoFocus
          />
          {showError ? (
            <Text style={styles.errorText}>Resposta incorreta. Tente novamente.</Text>
          ) : (
            <View style={styles.errorPlaceholder} />
          )}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  box: {
    backgroundColor: '#FFF',
    borderRadius: radii.xl,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    ...shadows.card,
  },
  boxError: {
    borderWidth: 2,
    borderColor: '#E53E3E',
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 18,
    color: pt.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: pt.textSoft,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  equation: {
    fontFamily: 'FredokaOne',
    fontSize: 32,
    color: pt.text,
    marginBottom: 16,
    letterSpacing: 2,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: pt.border,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'FredokaOne',
    fontSize: 22,
    color: pt.text,
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: pt.background,
  },
  errorText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: '#E53E3E',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorPlaceholder: { height: 29, marginBottom: 12 },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: pt.border,
    borderRadius: radii.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: pt.textSoft,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: '#FFF',
    fontWeight: '700',
  },
});
