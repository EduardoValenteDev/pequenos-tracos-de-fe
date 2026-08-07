import React from 'react';
import ContentContainer from '../ui/ContentContainer';

/**
 * CenteredContent — DEPRECADO em favor de `ContentContainer` (Fase 6 · B1 · P-30).
 *
 * Este componente era a SEGUNDA primitiva de largura de conteúdo do app, concorrente
 * de `ContentContainer` (A0.3), e trazia dois valores próprios que ninguém governava:
 * corte de tablet em `768` (literal) e largura máxima `720` (literal). Ou seja: a mesma
 * decisão de layout tinha duas respostas diferentes dependendo da tela.
 *
 * B1 resolve por DELEGAÇÃO, não por remoção: os 4 consumidores atuais (Home, Brincar,
 * Perfil, Histórias) continuam funcionando sem edição, e a decisão de largura passa a
 * ser tomada num lugar só — `tokens.breakpoints` + `tokens.maxContentWidth`, via
 * `ContentContainer`.
 *
 * ⚠️ Mudança visual esperada em tablet, e ela é o objetivo: a coluna de conteúdo passa
 * de `720` fixo acima de 768dp para `560` (≥600dp) / `640` (≥900dp). É um dos pontos
 * do roteiro de validação física da banda 600–767.
 *
 * Não usar em código novo — importe `ContentContainer` diretamente.
 */
export default function CenteredContent({ children, style }) {
  return <ContentContainer style={style}>{children}</ContentContainer>;
}
