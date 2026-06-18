/**
 * BeniAppTour — Tour INICIAL do Beni (UX 2.1), exibido UMA vez sobre a aba
 * Aventuras logo após o onboarding. Agora é só uma ABERTURA curta e mágica do
 * MAPA (3 passos) — não explica as outras abas (cada uma terá seu próprio guia
 * contextual do Beni nos próximos blocos).
 *
 * É uma fina camada sobre BeniGuideOverlay (a base reutilizável dos guias). Puramente
 * visual: não navega entre abas, não toca progresso/paywall/assets do mapa.
 */
import React from 'react';
import BeniGuideOverlay from './BeniGuideOverlay';

// Apresentação MÍNIMA, só sobre o mapa (UX 2.3): 2 passos, sem indicador visual
// (não passa `measure`) → só o balão do Beni, sem contorno aproximado.
const INITIAL_STEPS = [
  { variant: 'happy',       title: 'Eu sou o Beni!',       text: 'Seu companheiro de aventuras! Vou caminhar com você pelas histórias da Bíblia.', audioKey: 'guide.initial.welcome' },
  { variant: 'teaching',    title: 'Seu mapa de aventuras', text: 'É aqui que começa o seu caminho de fé.',                                          audioKey: 'guide.initial.adventures' },
  { variant: 'celebrating', title: 'Siga o brilho',        text: 'Sua próxima aventura sempre vai estar brilhando. Siga por esse brilho!',          audioKey: 'guide.initial.glow' },
];

export default function BeniAppTour({ onFinish, onSkip }) {
  return (
    <BeniGuideOverlay
      steps={INITIAL_STEPS}
      finalLabel="Começar minha jornada"
      onFinish={onFinish}
      onSkip={onSkip}
    />
  );
}
