/**
 * monteACenaMotionTokens.js — FONTE ÚNICA das durações de movimento de "Monte a Cena" (M1R7).
 *
 * Toda animação da rota (seleção, arrasto, snap, erro, retorno, sucesso, conclusão) lê SUAS durações
 * daqui. Nada de números mágicos espalhados por motor/telas/componentes. Puro (sem imports) →
 * testável no smoke e estável em qualquer aparelho.
 *
 * Movimento reduzido NÃO mora aqui: o motor aplica um fator sobre estes valores (encurta/parte
 * trajetórias, mas mantém o retorno visível, o som, o háptico e as mensagens).
 */

export const MONTE_A_CENA_MOTION = Object.freeze({
  selectionDuration: 140,        // realce da peça na bandeja (escala 1→1.035, elevação)
  dragLiftDuration: 110,         // overlay nasce no tamanho da bandeja e cresce até o tabuleiro
  snapDuration: 210,             // encaixe correto (190–220)
  wrongReactionDuration: 90,     // oscilação horizontal no erro (≤3 pt)
  wrongReturnDuration: 330,      // retorno após erro (visível, Easing.out cubic)
  cancelReturnDuration: 290,     // retorno após soltar em área vazia (silencioso)
  successEffectDuration: 460,    // anel + estrelas do acerto (400–500)
  seamFadeDuration: 450,         // fase 2 da conclusão: divisões somem + crossfade para a arte
  completionRevealDuration: 2600, // contemplação antes das ações (2,5–3 s)
  messageDuration: 1200,         // duração de uma mensagem do Beni no corredor (900–1400)
});

export default MONTE_A_CENA_MOTION;
