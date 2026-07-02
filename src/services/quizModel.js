/**
 * quizModel.js — modelo de quiz validado por ID (não por posição).
 *
 * Cada pergunta normalizada tem:
 *   { id, question, options: [{ id, text }], correctOptionId }
 *
 * Compatibilidade: quizzes antigos guardam `options` como string[] e `correct`
 * como índice. `normalizeQuizQuestion` converte isso em runtime para o modelo
 * por id. A QuizScreen valida sempre `selectedOptionId === correctOptionId`.
 *
 * `prepareQuizQuestions` embaralha as opções UMA vez (na carga) — a posição
 * (letra A/B/C) é só rótulo visual e nunca muda depois do toque.
 */

// Bloco 4 (DECISIONS.md #4) — FONTE ÚNICA da quantidade de perguntas do quiz.
// Exatamente 4 por história (q1–q4, determinístico). q5–q8 permanecem em
// quizzes.js como banco reserva para revisitas futuras (não são apagadas nem
// usadas aqui). Config E copy (QuizScreen/CongratsScreen) derivam desta constante.
export const QUIZ_QUESTIONS_PER_STORY = 4;

/** Fisher–Yates — embaralha uma cópia. */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Normaliza uma pergunta (string[]+correct OU já {id,text}+correctOptionId)
 * para o modelo por id. Defensivo: nunca lança.
 */
export function normalizeQuizQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const baseId = q.id != null ? String(q.id) : 'q';
  const raw = Array.isArray(q.options) ? q.options : [];

  const options = raw.map((o, i) => {
    if (o && typeof o === 'object') {
      return { id: String(o.id != null ? o.id : `${baseId}_o${i}`), text: String(o.text != null ? o.text : '') };
    }
    return { id: `${baseId}_o${i}`, text: String(o) };
  });

  let correctOptionId = q.correctOptionId != null ? String(q.correctOptionId) : null;
  // Legado: `correct` é um índice → converte para o id da opção correspondente.
  if (correctOptionId == null && typeof q.correct === 'number' && options[q.correct]) {
    correctOptionId = options[q.correct].id;
  }
  // Garante um id válido mesmo com dado quebrado.
  if (correctOptionId == null && options.length > 0) {
    correctOptionId = options[0].id;
  }

  return { id: baseId, question: String(q.question != null ? q.question : ''), options, correctOptionId };
}

/**
 * Normaliza e EMBARALHA cada pergunta uma vez. Use no carregamento da tela
 * (ex.: dentro de um useState inicializador) para que as opções não mudem de
 * lugar depois do toque.
 */
export function prepareQuizQuestions(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .map(q => {
      const n = normalizeQuizQuestion(q);
      if (!n) return null;
      return { ...n, options: shuffle(n.options) };
    })
    .filter(Boolean);
}

/** Texto da opção correta de uma pergunta normalizada. */
export function getCorrectOptionText(question) {
  if (!question || !Array.isArray(question.options)) return '';
  const correct = question.options.find(o => o.id === question.correctOptionId);
  return correct ? correct.text : '';
}
