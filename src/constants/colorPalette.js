/**
 * Paleta de cores compartilhada entre Colorir e Ateliê.
 * Mantém todas as 34 cores do Colorir + cores adicionais do Ateliê que
 * não estavam presentes, totalizando 38 cores agrupadas por família.
 * Backward-compatible: todas as hex salvas em artes e desenhos continuam válidas.
 */

export const COLOR_PALETTE = [
  // Vermelhos
  { hex: '#F44336', label: 'Vermelho Vivo' },
  { hex: '#C62828', label: 'Vermelho Escuro' },
  // Rosas
  { hex: '#EC407A', label: 'Rosa Forte' },
  { hex: '#E91E8C', label: 'Rosa Vibrante' },
  { hex: '#FFCDD2', label: 'Rosa Claro' },
  // Laranjas
  { hex: '#FF6F00', label: 'Laranja Forte' },
  { hex: '#FF6B35', label: 'Laranja' },
  { hex: '#E67E22', label: 'Laranja Queimado' },
  // Amarelos
  { hex: '#FDD835', label: 'Amarelo Vivo' },
  { hex: '#F4B400', label: 'Amarelo Dourado' },
  { hex: '#FFD700', label: 'Dourado' },
  // Verdes
  { hex: '#A5D6A7', label: 'Verde Claro' },
  { hex: '#2ECC71', label: 'Verde Vivo' },
  { hex: '#27AE60', label: 'Verde Médio' },
  { hex: '#1B8F3A', label: 'Verde Escuro' },
  { hex: '#6B8E23', label: 'Verde Oliva' },
  // Azuis e Turquesa
  { hex: '#48C9B0', label: 'Turquesa' },
  { hex: '#87CEEB', label: 'Azul Céu' },
  { hex: '#81D4FA', label: 'Azul Claro' },
  { hex: '#3498DB', label: 'Azul Médio' },
  { hex: '#2980B9', label: 'Azul' },
  { hex: '#1565C0', label: 'Azul Escuro' },
  { hex: '#0D47A1', label: 'Azul Marinho' },
  // Roxos
  { hex: '#D6B3FF', label: 'Lilás' },
  { hex: '#CE93D8', label: 'Roxo Claro' },
  { hex: '#AB47BC', label: 'Roxo Médio' },
  { hex: '#8E44AD', label: 'Roxo Forte' },
  // Tons de pele
  { hex: '#FDBCB4', label: 'Pele Clara' },
  { hex: '#F6C7A5', label: 'Pele Rosada' },
  { hex: '#D9A066', label: 'Pele Média' },
  { hex: '#C68642', label: 'Marrom Claro' },
  { hex: '#8D5524', label: 'Pele Escura' },
  // Marrons e Beges
  { hex: '#DEB887', label: 'Bege Marrom' },
  { hex: '#F3E5C8', label: 'Bege Claro' },
  { hex: '#E6C79C', label: 'Bege Quente' },
  { hex: '#6F4E2A', label: 'Marrom Médio' },
  { hex: '#8B4513', label: 'Marrom Terra' },
  { hex: '#5D4037', label: 'Marrom Escuro' },
  // Cinzas e Neutros
  { hex: '#D6D6D6', label: 'Cinza Claro' },
  { hex: '#9E9E9E', label: 'Cinza Médio' },
  { hex: '#616161', label: 'Cinza Escuro' },
  { hex: '#2C3E50', label: 'Azul Escuro' },
  { hex: '#263238', label: 'Grafite' },
  { hex: '#FFFFFF', label: 'Branco' },
];

export const DEFAULT_COLOR = COLOR_PALETTE[0].hex; // '#F44336'
