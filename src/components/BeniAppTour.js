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

// Apresentação curta e contextual, só sobre o mapa (textos UX 2.2).
const INITIAL_STEPS = [
  { variant: 'happy',       target: 'center', balloon: 'bottom', title: 'Eu sou o Beni!',  text: 'Vou caminhar com você pelas histórias da Bíblia.' },
  { variant: 'teaching',    target: 'map',    balloon: 'bottom', title: 'Este é o seu mapa', text: 'Cada aventura fica pelo caminho.' },
  { variant: 'celebrating', target: 'pin',    balloon: 'bottom', title: 'Siga o brilho',   text: 'Quando um ponto brilhar, toque nele para continuar.' },
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
