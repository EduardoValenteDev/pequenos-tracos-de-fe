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

// Apresentação curta, só sobre o mapa (textos aprovados UX 2.1).
const INITIAL_STEPS = [
  { pose: 'acenando',   target: 'center', balloon: 'bottom', title: 'Bem-vindo à jornada!', text: 'Eu sou o Beni. Vou caminhar com você pelas histórias da Bíblia.' },
  { pose: 'ensinando',  target: 'map',    balloon: 'bottom', title: 'Este é o seu mapa',    text: 'Cada aventura fica pelo caminho. Toque no brilho para continuar sua jornada.' },
  { pose: 'celebrando', target: 'pin',    balloon: 'bottom', title: 'Vamos começar?',       text: 'Quando quiser, toque na próxima aventura. Eu estarei por perto para te ajudar.' },
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
